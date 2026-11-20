// Training focus tuning (drafts/PROPOSAL-runner-shaping.md step 3): is the nudge felt, and does the
// season pace hold?
//
//   node scripts/sim-focus.mjs [divert]
//
// A rookie (ceiling 18 in their main stat, room to 14 in a side stat) works 22 and 60 jobs three
// ways: no focus, focus on the side stat, focus on the main stat. Prints the median side stat, the
// median main stat and the median total of all stats for each, so the cost of the nudge shows.
import { developRookie } from '../tests/develop-sim.js';
import { FOCUS, STATS } from '../src/core/development.js';

if (process.argv[2]) FOCUS.divert = Number(process.argv[2]);
const SIDE = { infiltrator: 'combat', muscle: 'stealth', medic: 'tech' };
const MAIN = { infiltrator: 'stealth', muscle: 'combat', medic: 'medical' };
const SEEDS = [1, 2, 3, 4, 5, 6];
const median = (a) => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)];

const out = {};
for (const jobs of [22, 60]) {
  for (const [label, pick] of [['none', () => []], ['side', (r) => [SIDE[r]]], ['main', (r) => [MAIN[r]]]]) {
    const rows = Object.keys(SIDE).flatMap((role) => SEEDS.map((seed) => {
      const { rookie } = developRookie(seed, { role, ceiling: 18, room: { [SIDE[role]]: 14 }, focus: pick(role) }, { jobs });
      return { side: rookie.stats[SIDE[role]], main: rookie.stats[MAIN[role]], total: STATS.reduce((n, s) => n + rookie.stats[s], 0) };
    }));
    out[`${jobs} jobs, focus ${label}`] = { side: median(rows.map((r) => r.side)), main: median(rows.map((r) => r.main)), total: median(rows.map((r) => r.total)) };
  }
}
console.log(`divert ${FOCUS.divert}`);
console.table(out);
