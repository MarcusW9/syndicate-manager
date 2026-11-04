// Fame balance (renown slice 3, 2026-11-03): 60 careful 78-week runs from a fresh start, hiring
// above ¥10,000 (tests/play.js playWeeks), split over worker threads (tests/fame-sim-worker.js).
// Slow: about four minutes; npm run test:fast skips it.
//
// The Elite bands are the owner's target (2026-11-03): first Elite around week 20-30, one or two
// by week 52. Measured with Elite at 60 jobs at their level: first Elite at a median week 26.5
// (23 to 35, 98% of runs in 20-30), every run had one, two Elites by week 52 in 56 runs of 60
// (one in 3, three in 1), none lapsed. With the proposal's 20 at-level jobs it was week 12 and
// four by week 52 (docs/design/2026-11.md). The veteran bands are from the same runs: the first
// pro -> veteran promotion at a median week 44, in every run. Nobody died, before or after this
// slice (the same 60 runs without it end with identical cash).
//
// Fame's payoffs (slice 4, 2026-11-04): median cash at week 52 was ¥39,750 before them and
// ¥40,450 after (+1.8%); the owner's band is within 10% either way. Named offers: a median of 7 a
// run, 5.5 of them paid with the named runner on the job. Fame pay asks don't show here (playWeeks
// never answers pay-rise messages, and a new ask waits while one is open); if every one were
// accepted they'd cost a median ¥840 by week 52, about what named offers bring in.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Worker } from 'node:worker_threads';
import { cpus } from 'node:os';

const SEEDS = Array.from({ length: 60 }, (_, i) => i + 1);
const WEEKS = 78;
const CASH52_BEFORE_PAYOFFS = 39750; // median cash at week 52 before slice 4, same 60 runs
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
  const cash52 = median(runs.map((r) => r.cash52));
  const named = median(runs.map((r) => r.namedOffers));
  console.log({ share, medianFirstElite: m, earliest: Math.min(...firsts), latest: Math.max(...firsts), elitesBy52: by52, lapsed, veteranShare: vets.length / runs.length, medianFirstVeteran: median(vets), deathsPerRun, cash52, named });

  // Elite: the owner's target, first around week 20-30, one or two by week 52.
  assert.ok(Math.min(...firsts) >= 12, 'Elite needs twelve active weeks');
  assert.ok(m >= 20 && m <= 30, `median first Elite week ${m}`);
  assert.ok(firsts.filter((w) => w >= 20 && w <= 30).length / runs.length >= 0.8, 'most runs get their first Elite in weeks 20-30');
  assert.ok(share >= 0.9, `runs with an Elite by week 78: ${share}`);
  assert.ok(by52 >= 1 && by52 <= 2, `median Elites by week 52: ${by52}`);
  assert.ok(runs.filter((r) => r.elitesBy52 >= 4).length / runs.length <= 0.1, 'four or more Elites by week 52 stays rare');
  assert.ok(lapsed <= 0.1, `runs where an Elite lapsed: ${lapsed}`);
  // Promotion: a veteran in most long runs, around the season's three-quarter mark.
  assert.ok(vets.length / runs.length >= 0.8, `runs with a promoted veteran: ${vets.length / runs.length}`);
  assert.ok(median(vets) >= 36 && median(vets) <= 56, `median first veteran week ${median(vets)}`);
  // Money: fame's payoffs keep median cash at week 52 within 10% of where it was without them.
  assert.ok(Math.abs(cash52 - CASH52_BEFORE_PAYOFFS) / CASH52_BEFORE_PAYOFFS <= 0.1, `median cash at week 52: ${cash52}`);
  // Named offers: a handful a run once there's an Elite (about one week in five, from week ~26).
  assert.ok(named >= 3 && named <= 12, `median named offers a run: ${named}`);
  // Deaths: the rules test's band (under 0.1 a run); 0 on these runs before and after this slice.
  assert.ok(deathsPerRun < 0.1, `deaths per run ${deathsPerRun}`);
});
