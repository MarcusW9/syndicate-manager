// Does a relative steady pull-out point fix the fragility? Runner pips are few (3 at the floor) and steady pulls a
// runner out at a flat 2 pips, so a starting runner leaves after one hit. This tries steady at a share of the runner's
// maximum instead, on the real fight code. Nothing in src/ changes: the script copies src/ to a temp folder, patches
// the one line of core/fight.js that reads steady's pull-out point, and imports the copy. Whether to change the rule
// is the owner's call; this gives the numbers.
//
//   node scripts/sim-pullout.mjs [seeds=400] [date=2026-11-12]
//
// DECLARED BEFORE THE RUN (do not change after seeing results):
//   Variants for the steady pull-out point: flat 2 (the game's), flat 1, a share of max pips rounded up with a minimum
//   of 1: 1/4, 1/3, 1/2 (= cautious, for reference). Cautious (half) and committed (never) are unchanged.
//   Starting crews: the game's fresh and authored rosters, the best team of the job's size by the planning read at the
//   base rule (held for every variant), the five jobs at the difficulty and threat each seed's real run had, the crew's
//   defaults hands-off at steady. Strong crews: the gate's synthetic groups (Under / On / Over x line-ups a, b, c, a grown
//   crew's endurance) at the gate's setting (difficulty 14, threat 3, D2 E2) in both encounters, so a variant that helps
//   starting crews can be checked for hurting good ones.
//   Worth proposing if, for the starting crews, clean wins rise 5+ points or downs fall 0.2+ and the hack is abandoned less,
//   without more deaths or more left behind, and the strong crews' clean wins fall by no more than 3 points.
import { cpSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

globalThis.localStorage ??= { getItem: () => null, setItem: () => {}, removeItem: () => {} };
const SEEDS = Number(process.argv[2] ?? 400);
const DATE = process.argv[3] ?? '2026-11-12';

// The patched copy of the game's code.
const tmp = mkdtempSync(join(tmpdir(), 'pullout-'));
cpSync(new URL('../src', import.meta.url).pathname, join(tmp, 'src'), { recursive: true });
const fightPath = join(tmp, 'src/core/fight.js');
const text = readFileSync(fightPath, 'utf8');
const needle = "level === 'steady' ? FIGHT.risk.steady.pullAt : FIGHT.risk.committed.pullAt";
if (!text.includes(needle)) throw new Error('riskThreshold changed: update the patch');
writeFileSync(fightPath, text.replace(needle, "level === 'steady' ? (globalThis.__STEADY ? Math.max(1, Math.ceil(r.max * globalThis.__STEADY)) : globalThis.__STEADY_FLAT ?? FIGHT.risk.steady.pullAt) : FIGHT.risk.committed.pullAt"));
const load = (p) => import(pathToFileURL(join(tmp, 'src', p)).href);
const { createNewGame } = await load('core/state.js');
const M = await load('core/mission.js');
const { addOffer, templateById } = await load('core/jobs.js');
const { autoStep } = await load('core/autorun.js');
const Fight = await load('core/fight.js');
const { fightAnswer } = await load('core/runfight.js');
const { DILEMMAS } = await load('data/dilemmas.js');
const { FIGHT, FIGHT_JOBS, ENEMIES } = await load('data/fights.js');
const { makeRng, hash } = await load('core/rng.js');

const VARIANTS = [
  { name: 'flat 2 (the game)', flat: 2 },
  { name: 'flat 1', flat: 1 },
  { name: 'a quarter of max, up', share: 0.25 },
  { name: 'a third of max, up', share: 1 / 3 },
  { name: 'half of max, up (= cautious)', share: 0.5 },
];
const setVariant = (v) => { globalThis.__STEADY = v.share ?? 0; globalThis.__STEADY_FLAT = v.flat; };
const JOBS = Object.keys(FIGHT_JOBS);
const APPROACHES = ['loud', 'stealth', 'tech', 'con'];
const P = (x) => `${Math.round(x * 100)}%`;
const D = (x) => x.toFixed(2);
const subsets = (list, k) => (k === 0 ? [[]] : list.flatMap((x, i) => subsets(list.slice(i + 1), k - 1).map((rest) => [x, ...rest])));

function realFight(job, seed, startCrew) {
  let s = createNewGame({ seed, startCrew });
  s.jobs = [];
  addOffer(s, job);
  const tpl = templateById(job);
  s = M.startMission(s, s.jobs[0].id, s.crew.slice(0, tpl.crewSize).map((o) => o.id), APPROACHES[seed % 4], { callIn: 'every', orders: 'steady' });
  s.activeMission.orders = 'steady';
  for (let g = 0; g < 400 && !s.activeMission.done; g++) {
    const am = s.activeMission;
    if (am.battle && M.currentStep(am)?.type === 'battle') return { diff: am.battle.diff, site: am.battle.site, type: am.battle.type, approach: am.approach };
    const next = autoStep(s, { force: true });
    if (next === s) break;
    s = next;
  }
  return null;
}

function play(args, seed, tag) {
  const b = Fight.buildFight({ ...args, watched: true }, makeRng(hash('pb', tag, seed)));
  const rng = makeRng(hash('pp', tag, seed));
  const ever = new Set();
  let pulled = 0;
  while (!b.end && b.round < 30) {
    if (!b.drawn) Fight.startRound(b, rng);
    for (const key of Object.keys(b.dilemmasFired)) if (!Fight.dilemmaHolds(b, key.split(':')[0])) delete b.dilemmasFired[key];
    const due = Fight.dueDilemmas(b)[0];
    if (due) {
      b.dilemmasFired[due.key] = true;
      const o = DILEMMAS[due.id].options.find((x) => x.id === fightAnswer({ battle: b, pending: { id: due.id } }).id);
      if (o?.ordersPatch) Fight.applyPatch(b, o.ordersPatch);
      if (o?.vanWait) b.vanHold = !!o.vanWait.hold;
    }
    const r = Fight.playRound(b, rng);
    pulled += r.withdrawn.length;
    for (const x of b.runners) if (x.down || x.dead) ever.add(x.id);
  }
  const res = b.end?.result;
  return { won: res === 'won' ? 1 : 0, done: ['won', 'lostRunner', 'leftBehind'].includes(res) ? 1 : 0, left: b.left.length > 0 ? 1 : 0, down: ever.size, dead: b.runners.some((x) => x.dead) ? 1 : 0, abandoned: res === 'abandoned' ? 1 : 0, pulled, rounds: b.round };
}

// Strong (synthetic) crews, as the gate builds them.
const TEMPLATE = createNewGame({ seed: 1 }).crew[0];
const MARGINS = { Under: { main: 0, other: -5, cool: -2 }, On: { main: 3, other: -2, cool: 0 }, Over: { main: 6, other: 1, cool: 3 } };
const LINEUPS = {
  a: [{ role: 'tech' }, { role: 'muscle', vest: 1, gun: 'revolver' }, { role: 'medic', deck: 1 }, { role: 'gunner', gun: 'heritage' }],
  b: [{ role: 'tech' }, { role: 'muscle', vest: 1, gun: 'revolver' }, { role: 'gunner', gun: 'heritage' }, { role: 'gunner', gun: 'machine' }],
  c: [{ role: 'tech' }, { role: 'face' }, { role: 'medic' }, { role: 'gunner', gun: 'heritage' }],
};
const MAIN = { tech: 'tech', muscle: 'combat', medic: 'medical', gunner: 'combat', face: 'social' };
const strongCrew = (group, lineup, seed) => {
  const g = MARGINS[group]; const rng = makeRng(hash('end', group, lineup, seed));
  return LINEUPS[lineup].map((x, i) => {
    const op = structuredClone(TEMPLATE);
    const stats = { combat: 0, tech: 0, medical: 0, social: 0, stealth: 10, piloting: 8 };
    for (const s of ['combat', 'tech', 'medical', 'social']) stats[s] = 14 + (MAIN[x.role] === s ? g.main : g.other);
    stats.cool = 14 + g.cool;
    stats.endurance = Math.max(3, Math.min(20, Math.round((x.role === 'muscle' ? 13 : 8) + (rng() + rng() + rng() - 1.5) * 5)));
    const bag = [];
    if (x.gun) bag.push({ item: { uid: `g${i}`, type: 'pistol', tier: 'street', look: { frame: x.gun } }, x: 0, y: 0 });
    if (x.deck) bag.push({ item: { uid: `d${i}`, type: 'deck', tier: 'street' }, x: 0, y: 1 });
    Object.assign(op, { id: `${x.role}${i}`, handle: `${x.role}${i}`, role: x.role, stats, traits: [], status: [], marks: [], gear: { armour: x.vest ? { uid: `v${i}`, type: 'vest', tier: 'street' } : null, implants: [], bag } });
    op.condition = { ...op.condition, fatigue: 0, injury: 'healthy', injuryDays: 0 };
    return op;
  });
};

// 1. Starting crews: fights and teams, once, at the base rule.
setVariant(VARIANTS[0]);
const cases = [];
for (const job of JOBS) for (const roster of ['fresh', 'authored']) for (let seed = 1; seed <= SEEDS; seed++) {
  const real = realFight(job, seed, roster);
  if (!real) continue;
  const tpl = templateById(job);
  const crew = createNewGame({ seed, startCrew: roster }).crew;
  const base = { type: real.type, diff: real.diff, threat: tpl.threat, site: real.site, approach: real.approach, risk: 'steady' };
  let best = null;
  for (const team of subsets(crew, Math.min(tpl.crewSize, crew.length))) {
    const o = Fight.fightOddsFor({ ...base, crew: team });
    const score = o.win * 100 - o.lost * 10 - o.down;
    if (!best || score > best.score) best = { team, score };
  }
  cases.push({ job, type: real.type, roster, seed, base, team: best.team });
}

const keys = ['won', 'done', 'left', 'down', 'dead', 'abandoned', 'pulled', 'rounds'];
const mean = (rows) => Object.fromEntries(keys.map((k) => [k, rows.reduce((a, r) => a + r[k], 0) / rows.length]));
const startRows = []; const strongRows = [];
for (const v of VARIANTS) {
  setVariant(v);
  for (const type of ['holdHack', 'holdExtract']) for (const roster of ['fresh', 'authored']) {
    const rs = cases.filter((c) => c.type === type && c.roster === roster).map((c) => play({ ...c.base, crew: c.team }, c.seed, `${c.job}${c.roster}`));
    startRows.push({ variant: v.name, type, roster, n: rs.length, ...mean(rs) });
  }
  // Strong crews at the gate's setting (D2 E2 is the shipped data), steady.
  for (const type of ['holdHack', 'holdExtract']) for (const group of Object.keys(MARGINS)) {
    const rs = [];
    for (const lineup of 'abc') for (let seed = 1; seed <= Math.min(SEEDS, 100); seed++) rs.push(play({ type, diff: 14, threat: 3, site: type === 'holdHack' ? 'heights' : 'docks', crew: strongCrew(group, lineup, seed), approach: null, risk: 'steady' }, seed, `${group}${lineup}${type}`));
    strongRows.push({ variant: v.name, type, group, n: rs.length, ...mean(rs) });
  }
}
setVariant(VARIANTS[0]);

// 2. The report.
const out = [];
const L = (s = '') => out.push(s);
L(`# Steady pull-out: flat 2 pips or a share of max (${DATE})`);
L();
L(`\`node scripts/sim-pullout.mjs ${SEEDS} ${DATE}\`. Real fight code, on a copy of \`src/\` in which only the steady pull-out point differs (nothing in the game's own files changed). Cautious is half of max and committed never pulls out, in every row. Starting crews: the game's fresh and authored rosters, the best team by the planning read, the five jobs at their real difficulty, the defaults hands-off at steady, ${SEEDS} seeds. Strong crews: the gate's synthetic groups at difficulty 14, threat 3, the shipped enemy data, 100 seeds x 3 line-ups. "Pulled out" is runners who left the fight by the risk rule, per fight.`);
L();
L('## Starting crews');
L();
L('| Steady pulls out at | Encounter | Roster | Fights | Clean win | Job done | Hack abandoned | Someone left behind | Downs | Deaths | Pulled out | Rounds |');
L('| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |');
for (const r of startRows) L(`| ${r.variant} | ${r.type} | ${r.roster} | ${r.n} | ${P(r.won)} | ${P(r.done)} | ${P(r.abandoned)} | ${P(r.left)} | ${D(r.down)} | ${P(r.dead)} | ${D(r.pulled)} | ${D(r.rounds)} |`);
L();
L('## Strong crews (the gate\'s groups, steady)');
L();
L('| Steady pulls out at | Encounter | Group | Fights | Clean win | Hack abandoned | Left behind | Downs | Deaths | Pulled out |');
L('| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |');
for (const r of strongRows) L(`| ${r.variant} | ${r.type} | ${r.group} | ${r.n} | ${P(r.won)} | ${P(r.abandoned)} | ${P(r.left)} | ${D(r.down)} | ${P(r.dead)} | ${D(r.pulled)} |`);
L();
const avg = (rows, k) => rows.reduce((a, r) => a + r[k], 0) / rows.length;
L('## Against the declared bar (steady, mean over encounters and rosters or groups)');
L();
L('| Steady pulls out at | Starting crews: clean win | vs base | downs | vs base | abandoned | deaths | left behind | Strong crews: clean win | vs base |');
L('| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |');
const base = { s: startRows.filter((r) => r.variant === VARIANTS[0].name), g: strongRows.filter((r) => r.variant === VARIANTS[0].name) };
const verdicts = [];
for (const v of VARIANTS) {
  const s = startRows.filter((r) => r.variant === v.name); const g = strongRows.filter((r) => r.variant === v.name);
  const dw = avg(s, 'won') - avg(base.s, 'won'); const dd = avg(s, 'down') - avg(base.s, 'down'); const dg = avg(g, 'won') - avg(base.g, 'won');
  L(`| ${v.name} | ${P(avg(s, 'won'))} | ${dw >= 0 ? '+' : '−'}${Math.abs(Math.round(dw * 100))} | ${D(avg(s, 'down'))} | ${dd >= 0 ? '+' : ''}${D(dd)} | ${P(avg(s.filter((r) => r.type === 'holdHack'), 'abandoned'))} | ${P(avg(s, 'dead'))} | ${P(avg(s.filter((r) => r.type === 'holdExtract'), 'left'))} | ${P(avg(g, 'won'))} | ${dg >= 0 ? '+' : '−'}${Math.abs(Math.round(dg * 100))} |`);
  const abandonedDown = avg(s.filter((r) => r.type === 'holdHack'), 'abandoned') < avg(base.s.filter((r) => r.type === 'holdHack'), 'abandoned');
  const ok = v.name !== VARIANTS[0].name && (dw >= 0.05 || dd <= -0.2) && abandonedDown && avg(s, 'dead') <= avg(base.s, 'dead') && avg(s.filter((r) => r.type === 'holdExtract'), 'left') <= avg(base.s.filter((r) => r.type === 'holdExtract'), 'left') && dg >= -0.03;
  if (ok) verdicts.push(v.name);
}
L();
L(`**Worth proposing by the declared bar:** ${verdicts.length ? verdicts.join('; ') : 'none'}.`);
L();
L('Limits: the team is the planning read\'s pick, not a player\'s; only runs that reach a fight are included; a variant that keeps runners in longer also keeps them in the line of fire (more downs possible); the rule patch changes only steady\'s threshold.');
writeFileSync(new URL(`../docs/sims/pullout-${DATE}.md`, import.meta.url), out.join('\n') + '\n');
console.log(out.slice(out.indexOf('## Against the declared bar')).join('\n'));
