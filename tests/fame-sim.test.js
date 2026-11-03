// Fame balance (renown slice 3, 2026-11-03): 60 careful 78-week runs from a fresh start, hiring
// above ¥10,000 (tests/play.js playWeeks), split over worker threads (tests/fame-sim-worker.js).
// Slow: about four minutes; npm run test:fast skips it.
//
// Bands were chosen from the measured runs (2026-11-03, this slice's numbers) with room either
// side, so the test catches drift, not noise: the first Elite came in week 12 in most runs (12 to
// 26), every run had one, a median of 4 runners were Elite by week 52, Elite was lost in 1 run of
// 60, and the first pro -> veteran promotion came at a median week 44 (every run). Nobody died,
// before or after this slice (the same 60 runs on main). Elite this early and this common is
// the proposal's own thresholds on careful stealth play (the Ghost path's Elite numbers are met
// by week 11); the proposal's "Elites at week 52 median 0-3" is not met, which is the owner's call
// (see docs/design/2026-11.md, slice 3 row).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Worker } from 'node:worker_threads';
import { cpus } from 'node:os';

const SEEDS = Array.from({ length: 60 }, (_, i) => i + 1);
const WEEKS = 78;
const median = (a) => { const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };

function playAll() {
  const n = Math.max(1, Math.min(4, cpus().length));
  const parts = Array.from({ length: n }, (_, k) => SEEDS.filter((s) => s % n === k));
  return Promise.all(parts.map((seeds) => new Promise((ok, fail) => {
    const w = new Worker(new URL('./fame-sim-worker.js', import.meta.url), { workerData: { seeds, weeks: WEEKS } });
    w.once('message', ok); w.once('error', fail);
  }))).then((r) => r.flat());
}

test('fame over 78 careful weeks: when Elite arrives, how common it is, deaths unchanged', { timeout: 30 * 60 * 1000 }, async () => {
  const runs = await playAll();
  assert.equal(runs.length, SEEDS.length);
  const firsts = runs.map((r) => r.firstElite).filter((w) => w != null);
  const share = firsts.length / runs.length;
  const m = median(firsts);
  const by52 = median(runs.map((r) => r.elitesBy52));
  const lapsed = runs.filter((r) => r.lapses > 0).length / runs.length;
  const vets = runs.map((r) => r.firstVeteran).filter((w) => w != null);
  const deathsPerRun = runs.reduce((n, r) => n + r.deaths, 0) / runs.length;
  console.log({ share, medianFirstElite: m, earliest: Math.min(...firsts), latest: Math.max(...firsts), elitesBy52: by52, lapsed, veteranShare: vets.length / runs.length, medianFirstVeteran: median(vets), deathsPerRun });

  // Elite: never before week 12 (the rule needs 12 active weeks), usually soon after.
  assert.ok(Math.min(...firsts) >= 12, 'Elite needs twelve active weeks');
  assert.ok(m >= 12 && m <= 16, `median first Elite week ${m}`);
  assert.ok(share >= 0.9, `runs with an Elite by week 78: ${share}`);
  assert.ok(by52 >= 3 && by52 <= 5, `median Elites by week 52: ${by52}`);
  assert.ok(lapsed <= 0.1, `runs where an Elite lapsed: ${lapsed}`);
  // Promotion: a veteran in most long runs, around the season's three-quarter mark.
  assert.ok(vets.length / runs.length >= 0.8, `runs with a promoted veteran: ${vets.length / runs.length}`);
  assert.ok(median(vets) >= 36 && median(vets) <= 56, `median first veteran week ${median(vets)}`);
  // Deaths: the rules test's band (under 0.1 a run); 0 on these runs before and after this slice.
  assert.ok(deathsPerRun < 0.1, `deaths per run ${deathsPerRun}`);
});
