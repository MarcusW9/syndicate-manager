// Early-game tuning (DESIGN.md, 2026-10-28: three founders picked from six). Plays careful
// seasons and prints, at weeks 4, 13 and 26: median cash, the share broke (cash below zero),
// median crew size and reputation, and deaths. Compares the old start (five founders) with the
// new one (three), without hiring and with a player who hires when cash allows.
//
//   node scripts/sim-early-game.mjs [seeds=60] [config name prefix]
import { playWeeks, carefulPolicy } from '../tests/play.js';

const SEEDS = Number(process.argv[2] ?? 60);
const median = (a) => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)];
const only = process.argv[3];
const CONFIGS = {
  'five (old start)': { startCrew: 'fresh' },
  'three, no hiring': { startCrew: 'pick' },
  'three, hires up to five': { startCrew: 'pick', hireAbove: 4000 },
  'three, hires up to five only with ¥10,000 spare': { startCrew: 'pick', hireAbove: 10000 },
};
for (const [name, opts] of Object.entries(CONFIGS).filter(([n]) => !only || n.startsWith(only))) {
  const row = {};
  for (const weeks of [4, 13, 26]) {
    const runs = Array.from({ length: SEEDS }, (_, i) => playWeeks(weeks, i + 1, carefulPolicy, opts));
    const cash = runs.map((r) => r.state.cash);
    row[`wk${weeks}`] = {
      cash: median(cash),
      broke: `${Math.round((cash.filter((c) => c < 0).length / runs.length) * 100)}%`,
      crew: median(runs.map((r) => r.state.crew.length)),
      rep: median(runs.map((r) => r.state.reputation)),
      deaths: runs.reduce((n, r) => n + r.deaths, 0),
      wages: median(runs.map((r) => r.state.crew.reduce((n, o) => n + o.wage, 0))),
    };
  }
  console.log(name, JSON.stringify(row));
}
