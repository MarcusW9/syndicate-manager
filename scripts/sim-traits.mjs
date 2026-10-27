// Earned-trait tuning: how often traits are earned when a crew plays a normal schedule
// (three jobs a week, mixed approaches; tests/heat-sim.js), 20 games of 20 weeks.
//
//   node scripts/sim-traits.mjs
//
// Prints moments a week and the count per trait. Compare before and after a change: the
// squad-run retune (2026-10-27) held 2.5 a week on this measure while incidents started counting.
import { playHeat } from '../tests/heat-sim.js';

const WEEKS = 20;
const GAMES = 20;
let moments = 0;
const by = {};
for (let seed = 1; seed <= GAMES; seed++) {
  const { state } = playHeat(WEEKS, seed, { perWeek: 3 });
  for (const op of [...state.crew, ...state.memorial]) {
    for (const line of op.history ?? []) {
      const m = /^Day \d+: ([^.]+)\. /.exec(line); // "Day 12: Crew Anchor. ..." (earned.js earn)
      if (!m || /^(graduated|Hothead|no longer)/.test(m[1])) continue;
      moments += 1;
      by[m[1]] = (by[m[1]] ?? 0) + 1;
    }
  }
}
console.log(`${(moments / (WEEKS * GAMES)).toFixed(2)} moments a week`);
console.log(Object.fromEntries(Object.entries(by).sort((a, b) => b[1] - a[1])));
