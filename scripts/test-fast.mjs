// The quick test set: everything except the slow files (long simulations over hundreds of games).
// Use it while working; `npm test` (the full suite) still runs before every push and in the deploy.
//
//   npm run test:fast
//
// Slow = over about 30 seconds on their own (measured 2026-10-29): development (growth sims), heat
// (season sims), rules (3,000 random missions) and startcrew (early-game sims). If a file here
// becomes quick, take it off the list; if a new one gets slow, add it.
import { readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const SLOW = new Set(['development.test.js', 'heat.test.js', 'rules.test.js', 'startcrew.test.js']);
const dir = new URL('../tests/', import.meta.url).pathname;
const files = readdirSync(dir).filter((f) => f.endsWith('.test.js') && !SLOW.has(f)).map((f) => dir + f);
console.log(`Fast set: ${files.length} files (skipping ${[...SLOW].join(', ')}). Run npm test before pushing.`);
const run = spawnSync(process.execPath, ['--test', ...files], { stdio: 'inherit' });
process.exit(run.status ?? 1);
