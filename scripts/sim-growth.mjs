// Growth tuning: measure the development targets (tests/development.test.js) over more runs.
//
//   node scripts/sim-growth.mjs
//
// Prints the median main stat of a ceiling-18 rookie after 22 and 60 jobs (targets 13-14 and
// 15-17), a ceiling-14 rookie's range after 30 jobs (12-14) and median after 120 (14-17), and
// mentoring's edge over a 22-job season (at least +0.75). Takes about three minutes.
import { developRookie } from '../tests/develop-sim.js';

const ROLES = ['infiltrator', 'muscle', 'medic'];
const SEEDS = [1, 2, 3, 4, 5, 6, 7, 8];
const runs = (opts, cfg) => ROLES.flatMap((role) => SEEDS.map((seed) => developRookie(seed, { ...opts, role }, cfg)));
const median = (a) => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)];
const mean = (r) => r.reduce((n, x) => n + x.main, 0) / r.length;

const m22 = median(runs({ ceiling: 18 }, { jobs: 22 }).map((x) => x.main));
const m60 = median(runs({ ceiling: 18 }, { jobs: 60 }).map((x) => x.main));
const r30 = runs({ ceiling: 14 }, { jobs: 30 }).map((x) => x.main);
const r120 = median(runs({ ceiling: 14 }, { jobs: 120 }).map((x) => x.main));
const mentored = mean(runs({ ceiling: 19 }, { jobs: 22 }));
const solo = mean(runs({ ceiling: 19 }, { jobs: 22, mentor: false }));
console.log({ after22: m22, after60: m60, lowCeiling30: [Math.min(...r30), Math.max(...r30)], lowCeiling120: r120, mentoringEdge: +(mentored - solo).toFixed(2) });
