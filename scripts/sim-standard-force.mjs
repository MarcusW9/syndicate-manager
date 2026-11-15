// Standard-force prototype (2026-11-15): the same fight with and without a job's `opposition`, on a realistic crew.
//   node scripts/sim-standard-force.mjs [crews=40] [runs=60] [extraBodies]
// DECLARED BEFORE THE RUN: jobs warehouse (docks, police) and data_scrub (heights, corporate); crews of 4, 5 and 6 with combat
// 11-16, cool 6-14, tech 8-14, medical 6-14 (seeded), first runner a tech, second a medic; fights at each job's real difficulty
// (the job's threat as the incident diff), played hands-off on the crew's default orders at each risk level.
// Measures: win, someone down, someone dead, someone lost (dead or left), rounds. The death rule: dead must be 0 for cautious and steady.
import { createNewGame } from '../src/core/state.js';
import * as Fight from '../src/core/fight.js';
import { templateById } from '../src/core/jobs.js';
import { FIGHT_JOBS, OPPOSITION } from '../src/data/fights.js';
import { makeRng } from '../src/core/rng.js';
import { rollTarget } from '../src/core/risk.js';

globalThis.localStorage ??= { getItem: () => null, setItem: () => {}, removeItem: () => {} };
const CREWS = Number(process.argv[2] ?? 40);
const RUNS = Number(process.argv[3] ?? 60);
const EXTRA = process.argv[4] != null ? Number(process.argv[4]) : null; // override OPPOSITION extra bodies, to tune
if (EXTRA != null) for (const f of Object.values(OPPOSITION)) f.extra = EXTRA;
const JOBS = ['warehouse', 'data_scrub'];
const rows = [];
const base = createNewGame({ seed: 1 }).crew;

function crewOf(seed, size) {
  const r = makeRng(seed);
  const span = (lo, hi) => lo + Math.floor(r() * (hi - lo + 1));
  return Array.from({ length: size }, (_, i) => {
    const op = structuredClone(base[i % base.length]);
    op.id = `sim${seed}-${i}`; op.handle = `R${i}`;
    op.role = i === 0 ? 'tech' : i === 1 ? 'medic' : 'fighter';
    for (const [st, lo, hi] of [['combat', 11, 16], ['cool', 6, 14], ['tech', i === 0 ? 11 : 8, 14], ['medical', i === 1 ? 11 : 6, 14]]) op.stats[st] = span(lo, hi);
    return op;
  });
}

for (const job of JOBS) {
  const tpl = templateById(job);
  for (const variant of ['old', 'new']) for (const risk of ['cautious', 'steady', 'committed']) {
    const acc = { n: 0, win: 0, down: 0, dead: 0, lost: 0, rounds: 0, enemies: 0 };
    for (let c = 0; c < CREWS; c++) {
      const size = 4 + (c % 3);
      const crew = crewOf(9000 + c, size);
      const args = { type: FIGHT_JOBS[job], diff: Fight.fightDiff(Math.round(rollTarget(tpl))), threat: tpl.threat, site: tpl.district, crew, approach: 'loud', risk, ...(variant === 'new' ? { opposition: tpl.opposition } : {}) };
      for (let i = 0; i < RUNS; i++) {
        const b0 = Fight.buildFight(args, makeRng(0xabc + c * 131 + i));
        const b = Fight.playFight(structuredClone(b0), makeRng(0x5eed + i * 7919));
        acc.n += 1; acc.enemies += b0.enemies.length;
        if (b.end?.result === 'won') acc.win += 1;
        if (b.runners.some((r) => r.down || r.dead)) acc.down += 1;
        if (b.runners.some((r) => r.dead)) acc.dead += 1;
        if (b.runners.some((r) => r.dead) || b.left.length) acc.lost += 1;
        acc.rounds += b.round;
      }
    }
    const P = (x) => `${(100 * x / acc.n).toFixed(0)}%`;
    rows.push(`| ${job} | ${variant} | ${risk} | ${(acc.enemies / acc.n).toFixed(1)} | ${P(acc.win)} | ${P(acc.down)} | ${P(acc.dead)} | ${P(acc.lost)} | ${(acc.rounds / acc.n).toFixed(1)} |`);
  }
}
console.log('| job | setup | risk | enemies at start | win | someone down | someone dead | someone lost | rounds |\n| --- | --- | --- | --- | --- | --- | --- | --- | --- |');
console.log(rows.join('\n'));
