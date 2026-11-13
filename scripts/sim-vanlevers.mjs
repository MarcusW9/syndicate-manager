// Left-behind sensitivity (battle rework follow-up): how far each of the van's numbers moves the rate at which
// an extraction leaves someone behind, on the real fight code, at the real job difficulty, with the game's own
// starting rosters. It changes nothing in src/: each variant sets FIGHT keys at run time and puts them back.
// Whether to change any number is the owner's call; this gives the numbers to choose with.
//
//   node scripts/sim-vanlevers.mjs [seeds=400] [date=2026-11-11]
//
// DECLARED BEFORE THE RUN (do not change after seeing results):
//   jobs: warehouse and protection (the two holdExtract jobs); rosters: fresh and authored (core/state.js startCrew);
//   crew: the best team of the job's crew size by the planning read (fightOddsFor at the base numbers), chosen once per
//   seed and held for every variant; the fights start at the difficulty and threat each seed's real run had;
//   played hands-off on the crew's defaults with the standing answers; risk steady (committed beside it for deaths).
//   Variants (FIGHT key: base -> value): see VARIANTS. Measures: someone left behind, people left, clean win,
//   job done, downs, heat, deaths. A lever is worth a look if it cuts "someone left behind" by 10+ points
//   without raising downs by more than 0.2 or heat by more than 0.3 a fight.
import { writeFileSync } from 'node:fs';
import { createNewGame } from '../src/core/state.js';
import * as M from '../src/core/mission.js';
import { addOffer, templateById } from '../src/core/jobs.js';
import { autoStep } from '../src/core/autorun.js';
import * as Fight from '../src/core/fight.js';
import { fightAnswer } from '../src/core/runfight.js';
import { DILEMMAS } from '../src/data/dilemmas.js';
import { FIGHT } from '../src/data/fights.js';
import { makeRng, hash } from '../src/core/rng.js';

globalThis.localStorage ??= { getItem: () => null, setItem: () => {}, removeItem: () => {} };
const SEEDS = Number(process.argv[2] ?? 400);
const DATE = process.argv[3] ?? '2026-11-11';
const JOBS = ['warehouse', 'protection'];
const ROSTERS = ['fresh', 'authored'];
const APPROACHES = ['loud', 'stealth', 'tech', 'con'];
const VARIANTS = [
  { name: 'base', set: {} },
  { name: 'van arrives round 4', set: { vanRound: 4 } },
  { name: 'van arrives round 5', set: { vanRound: 5 } },
  { name: 'van waits 5', set: { vanWait: 5 } },
  { name: 'van waits 6', set: { vanWait: 6 } },
  { name: 'van waits 8', set: { vanWait: 8 } },
  { name: '4 door slots', set: { doorSlots: 4 } },
  { name: '5 door slots', set: { doorSlots: 5 } },
  // The boarding rows are gone (2026-11-13): boarding needs no roll now. They were also mislabelled: steps -2 and 0
  // made boarding harder than the base -4, so the reports' "easier boarding makes it worse" read backwards.
  { name: 'hold the van 3 rounds', set: { holdRounds: 3 } },
  { name: 'waits 6 + 4 door slots', set: { vanWait: 6, doorSlots: 4 } },
];
const P = (x) => `${Math.round(x * 100)}%`;
const D = (x) => x.toFixed(2);
const BASE = Object.fromEntries(Object.keys(Object.assign({}, ...VARIANTS.map((v) => v.set))).map((k) => [k, FIGHT[k]]));
const apply = (set) => { Object.assign(FIGHT, BASE, set); };

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
const subsets = (list, k) => (k === 0 ? [[]] : list.flatMap((x, i) => subsets(list.slice(i + 1), k - 1).map((rest) => [x, ...rest])));

function play(args, seed, tag) {
  const b = Fight.buildFight({ ...args, watched: true }, makeRng(hash('vb', tag, seed)));
  const rng = makeRng(hash('vp', tag, seed));
  const ever = new Set();
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
    Fight.playRound(b, rng);
    for (const r of b.runners) if (r.down || r.dead) ever.add(r.id);
  }
  const r = b.end?.result;
  return { won: r === 'won' ? 1 : 0, done: ['won', 'lostRunner', 'leftBehind'].includes(r) ? 1 : 0, left: b.left.length > 0 ? 1 : 0, people: b.left.length, down: ever.size, dead: b.runners.some((x) => x.dead) ? 1 : 0, heat: b.heat, rounds: b.round };
}

// 1. The fights and the teams, once, at the base numbers.
apply({});
const cases = [];
for (const job of JOBS) for (const roster of ROSTERS) for (let seed = 1; seed <= SEEDS; seed++) {
  const real = realFight(job, seed, roster);
  if (!real) continue;
  const tpl = templateById(job);
  const crew = createNewGame({ seed, startCrew: roster }).crew;
  const base = { type: real.type, diff: real.diff, threat: tpl.threat, site: real.site, approach: real.approach };
  let best = null;
  for (const team of subsets(crew, Math.min(tpl.crewSize, crew.length))) {
    const o = Fight.fightOddsFor({ ...base, crew: team, risk: 'steady' });
    const score = o.win * 100 - o.lost * 10 - o.down;
    if (!best || score > best.score) best = { team, score };
  }
  cases.push({ job, roster, seed, base, team: best.team });
}

// 2. Every variant over every case.
const keys = ['won', 'done', 'left', 'people', 'down', 'dead', 'heat', 'rounds'];
const table = []; // { variant, job, roster, risk, n, ...means }
for (const v of VARIANTS) {
  apply(v.set);
  for (const job of JOBS) for (const roster of ROSTERS) for (const risk of ['steady', 'committed']) {
    const mine = cases.filter((c) => c.job === job && c.roster === roster);
    const acc = Object.fromEntries(keys.map((k) => [k, 0]));
    for (const c of mine) { const r = play({ ...c.base, crew: c.team, risk }, c.seed, `${c.job}${c.roster}${risk}`); for (const k of keys) acc[k] += r[k]; }
    table.push({ variant: v.name, job, roster, risk, n: mine.length, ...Object.fromEntries(keys.map((k) => [k, acc[k] / mine.length])) });
  }
}
apply({});

// 3. The report.
const out = [];
const L = (s = '') => out.push(s);
L(`# Left-behind sensitivity: the van's numbers (${DATE})`);
L();
L(`\`node scripts/sim-vanlevers.mjs ${SEEDS} ${DATE}\`. Real fight code, the two holdExtract jobs at the difficulty each seed's real run had, the game's own starting rosters (fresh and authored), the best team of each roster by the planning read (chosen once at the base numbers and held), the crew's defaults hands-off, ${SEEDS} seeds. One lever at a time, then combinations. Nothing in \`src/\` changed: each row sets \`FIGHT\` keys at run time. The bar declared in the script: a lever is worth a look if it cuts "someone left behind" by 10+ points without raising downs by more than 0.2 or heat by more than 0.3 a fight. Base numbers: van arrives round ${BASE.vanRound ?? FIGHT.vanRound}, waits ${BASE.vanWait}, ${BASE.doorSlots} door slots, boarding step ${BASE.boardStep}, hold ${BASE.holdRounds} rounds.`);
L();
const cut = (v, r) => { const b = table.find((x) => x.variant === 'base' && x.job === r.job && x.roster === r.roster && x.risk === r.risk); return b.left - r.left; };
for (const risk of ['steady', 'committed']) {
  L(`## ${risk[0].toUpperCase() + risk.slice(1)} risk`);
  L();
  L('| Variant | Roster | Job | Someone left behind | People left | Clean win | Job done | Downs | Heat | Deaths |');
  L('| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |');
  for (const r of table.filter((x) => x.risk === risk)) L(`| ${r.variant} | ${r.roster} | ${r.job} | ${P(r.left)} (${cut(r.variant, r) >= 0 ? '−' : '+'}${Math.abs(Math.round(cut(r.variant, r) * 100))}) | ${D(r.people)} | ${P(r.won)} | ${P(r.done)} | ${D(r.down)} | ${D(r.heat)} | ${P(r.dead)} |`);
  L();
}
L('## Mean over both jobs and both rosters (steady)');
L();
L('| Variant | Someone left behind | vs base | Clean win | Downs | vs base | Heat | vs base | Rounds |');
L('| --- | --- | --- | --- | --- | --- | --- | --- | --- |');
const mean = (variant, k) => { const rs = table.filter((x) => x.variant === variant && x.risk === 'steady'); return rs.reduce((a, r) => a + r[k], 0) / rs.length; };
for (const v of VARIANTS) {
  const d = (k) => mean(v.name, k) - mean('base', k);
  L(`| ${v.name} | ${P(mean(v.name, 'left'))} | ${d('left') >= 0 ? '+' : '−'}${Math.abs(Math.round(d('left') * 100))} | ${P(mean(v.name, 'won'))} | ${D(mean(v.name, 'down'))} | ${d('down') >= 0 ? '+' : ''}${D(d('down'))} | ${D(mean(v.name, 'heat'))} | ${d('heat') >= 0 ? '+' : ''}${D(d('heat'))} | ${D(mean(v.name, 'rounds'))} |`);
}
L();
const worth = VARIANTS.filter((v) => v.name !== 'base' && (mean('base', 'left') - mean(v.name, 'left')) >= 0.1 && mean(v.name, 'down') - mean('base', 'down') <= 0.2 && mean(v.name, 'heat') - mean('base', 'heat') <= 0.3).map((v) => v.name);
L(`**Worth a look by the declared bar (steady, mean):** ${worth.length ? worth.join('; ') : 'none'}.`);
L();
L('Limits: the team is the planning read\'s pick from the starting roster, not a player\'s; only runs that reach a fight are included; heat counts the early van and holds only; a runner left behind is still just missing (slice 4 is not built), so a variant that leaves fewer behind is not yet scored on what leaving someone costs.');
writeFileSync(new URL(`../docs/sims/vanlevers-${DATE}.md`, import.meta.url), out.join('\n') + '\n');
console.log(out.slice(out.indexOf('## Mean over both jobs')).join('\n'));
