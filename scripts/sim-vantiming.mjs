// Van timing sweep (battle rework follow-up). The van-levers sim showed a later van leaves fewer behind but also that fewer
// extractions get done (the crew goes down or pulls out before the van arrives). This sweeps the van's arrival round, the
// pressure clock and the wait, and reports the WHOLE outcome mix, so the trade is visible: everyone home and the job done,
// job done with someone missing, and the job failed (the crew pulled back, no pay).
// Nothing in src/ changes: each variant sets FIGHT and CLOCKS keys at run time and puts them back.
//
//   node scripts/sim-vantiming.mjs [seeds=400] [date=2026-11-12]
//
// DECLARED BEFORE THE RUN (do not change after seeing results):
//   jobs: warehouse and protection; rosters: fresh and authored; crew: the best team of the job's size by the planning read at the
//   base numbers (held for every variant); the fights at the difficulty and threat each seed's real run had; the crew's defaults,
//   hands-off, steady (committed beside it for deaths). The current rules: steady pulls out at a third of max pips, with the call-in
//   answered "pull out" (the risk level), and the van holds for a downed runner on cautious and steady.
//   Outcome classes per fight: CLEAN = everyone home and the job done (`won`); DONE-COST = the job done but someone left behind,
//   lost or walked off; FAILED = the crew pulled back (no pay, heat +1, reputation -2).
//   A variant is worth a look if, against the base, job done does not fall by more than 5 points and CLEAN rises by 5+ points or
//   left-behind falls by 10+ points.
import { writeFileSync } from 'node:fs';
import { createNewGame } from '../src/core/state.js';
import * as M from '../src/core/mission.js';
import { addOffer, templateById } from '../src/core/jobs.js';
import { autoStep } from '../src/core/autorun.js';
import * as Fight from '../src/core/fight.js';
import { fightAnswer } from '../src/core/runfight.js';
import { DILEMMAS } from '../src/data/dilemmas.js';
import { FIGHT, CLOCKS } from '../src/data/fights.js';
import { makeRng, hash } from '../src/core/rng.js';

globalThis.localStorage ??= { getItem: () => null, setItem: () => {}, removeItem: () => {} };
const SEEDS = Number(process.argv[2] ?? 400);
const DATE = process.argv[3] ?? '2026-11-12';
const JOBS = ['warehouse', 'protection'];
const ROSTERS = ['fresh', 'authored'];
const APPROACHES = ['loud', 'stealth', 'tech', 'con'];
const VARIANTS = [
  { name: 'base (van round 3)', set: {} },
  { name: 'van round 2', set: { vanRound: 2 } },
  { name: 'van round 4', set: { vanRound: 4 } },
  { name: 'van round 5', set: { vanRound: 5 } },
  { name: 'van round 6', set: { vanRound: 6 } },
  { name: 'van round 4, pressure from round 4 every 3', set: { vanRound: 4 }, clock: { firstRound: 4, every: 3 } },
  { name: 'van round 5, pressure from round 5 every 3', set: { vanRound: 5 }, clock: { firstRound: 5, every: 3 } },
  { name: 'van round 4, waits 6', set: { vanRound: 4, vanWait: 6 } },
  { name: 'van round 5, waits 6', set: { vanRound: 5, vanWait: 6 } },
  { name: 'pressure from round 4 every 3 (van round 3)', set: {}, clock: { firstRound: 4, every: 3 } },
];
const P = (x) => `${Math.round(x * 100)}%`;
const D = (x) => x.toFixed(2);
const BASE = Object.fromEntries(Object.keys(Object.assign({}, ...VARIANTS.map((v) => v.set))).map((k) => [k, FIGHT[k]]));
const BASE_CLOCK = { ...CLOCKS.pressure };
const apply = (v) => { Object.assign(FIGHT, BASE, v.set); Object.assign(CLOCKS.pressure, BASE_CLOCK, v.clock ?? {}); };

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
  const done = ['won', 'lostRunner', 'leftBehind'].includes(r) ? 1 : 0;
  return { won: r === 'won' ? 1 : 0, done, doneCost: done && r !== 'won' ? 1 : 0, failed: done ? 0 : 1, left: b.left.length > 0 ? 1 : 0, people: b.left.length, down: ever.size, dead: b.runners.some((x) => x.dead) ? 1 : 0, heat: b.heat, rounds: b.round };
}

// 1. The fights and the teams, once, at the base numbers.
apply(VARIANTS[0]);
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
const keys = ['won', 'done', 'doneCost', 'failed', 'left', 'people', 'down', 'dead', 'heat', 'rounds'];
const table = []; // { variant, job, roster, risk, n, ...means }
for (const v of VARIANTS) {
  apply(v);
  for (const job of JOBS) for (const roster of ROSTERS) for (const risk of ['steady', 'committed']) {
    const mine = cases.filter((c) => c.job === job && c.roster === roster);
    const acc = Object.fromEntries(keys.map((k) => [k, 0]));
    for (const c of mine) { const r = play({ ...c.base, crew: c.team, risk }, c.seed, `${c.job}${c.roster}${risk}`); for (const k of keys) acc[k] += r[k]; }
    table.push({ variant: v.name, job, roster, risk, n: mine.length, ...Object.fromEntries(keys.map((k) => [k, acc[k] / mine.length])) });
  }
}
apply(VARIANTS[0]);

// 3. The report.
const out = [];
const L = (s) => out.push(s ?? '');
L(`# Van timing sweep (${DATE})`);
L();
L(`\`node scripts/sim-vantiming.mjs ${SEEDS} ${DATE}\`. Real fight code, the two extraction jobs at their real difficulty, the game's own starting rosters (fresh and authored), the best team of each by the planning read (held for every variant), the crew's defaults hands-off, ${SEEDS} seeds, on the current rules (steady pulls out at a third of max pips). Nothing in \`src/\` changed. Outcomes per fight: **clean** = everyone home and the job done; **done, at a cost** = the job done but someone left behind, lost or walked off; **failed** = the crew pulled back (no pay, heat +1, reputation -2). The declared bar: a variant is worth a look if job done does not fall more than 5 points and clean rises 5+ points or left-behind falls 10+ points.`);
L();
const meanOf = (variant, risk, k, f = () => true) => { const rs = table.filter((x) => x.variant === variant && x.risk === risk && f(x)); return rs.reduce((a, r) => a + r[k], 0) / rs.length; };
L('## Mean over both jobs and both rosters (steady)');
L();
L('| Variant | Clean | Done, at a cost | Failed | Job done | Someone left behind | vs base | Downs | Heat | Rounds |');
L('| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |');
const worth = [];
for (const v of VARIANTS) {
  const m = (k) => meanOf(v.name, 'steady', k); const b = (k) => meanOf(VARIANTS[0].name, 'steady', k);
  const dl = m('left') - b('left');
  L(`| ${v.name} | ${P(m('won'))} | ${P(m('doneCost'))} | ${P(m('failed'))} | ${P(m('done'))} | ${P(m('left'))} | ${dl >= 0 ? '+' : '−'}${Math.abs(Math.round(dl * 100))} | ${D(m('down'))} | ${D(m('heat'))} | ${D(m('rounds'))} |`);
  if (v !== VARIANTS[0] && m('done') - b('done') >= -0.05 && (m('won') - b('won') >= 0.05 || b('left') - m('left') >= 0.1)) worth.push(v.name);
}
L();
L(`**Worth a look by the declared bar:** ${worth.length ? worth.join('; ') : 'none'}.`);
L();
for (const roster of ROSTERS) {
  L(`## ${roster[0].toUpperCase() + roster.slice(1)} roster, steady, by job`);
  L();
  L('| Variant | Job | Clean | Done, at a cost | Failed | Someone left behind | Downs | Rounds |');
  L('| --- | --- | --- | --- | --- | --- | --- | --- |');
  for (const r of table.filter((x) => x.roster === roster && x.risk === 'steady')) L(`| ${r.variant} | ${r.job} | ${P(r.won)} | ${P(r.doneCost)} | ${P(r.failed)} | ${P(r.left)} | ${D(r.down)} | ${D(r.rounds)} |`);
  L();
}
L('## Committed (deaths), mean over both jobs and rosters');
L();
L('| Variant | Clean | Failed | Someone left behind | Deaths in a fight |');
L('| --- | --- | --- | --- | --- |');
for (const v of VARIANTS) L(`| ${v.name} | ${P(meanOf(v.name, 'committed', 'won'))} | ${P(meanOf(v.name, 'committed', 'failed'))} | ${P(meanOf(v.name, 'committed', 'left'))} | ${P(meanOf(v.name, 'committed', 'dead'))} |`);
L();
L('Limits: the team is the planning read\'s pick, not a player\'s; only runs that reach a fight are included; a runner left behind is still just missing (slice 4 is not built), so the cost of leaving someone is not scored beyond counting it.');
writeFileSync(new URL(`../docs/sims/vantiming-${DATE}.md`, import.meta.url), out.join('\n') + '\n');
console.log(out.slice(out.indexOf('## Mean over both')).slice(0, 18).join('\n'));
