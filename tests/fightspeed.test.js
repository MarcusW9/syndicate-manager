// The speed budget for builds (build vocabulary, part A; drafts/HANDOFF-build-vocab-next.md). The Jobs board replays many fights to
// work out its odds (drafts/HANDOFF-speed-pass.md), and every fight runs the trigger step (core/fight.js piecesOn) for every runner's
// pieces. This guards that giving the crew builds, every move and payload at once on the two best runners, never makes `playFight`
// much slower than the same fights with no builds. Both are timed in the one run, alternately, taking each side's fastest repeat (so a
// busy machine slows both alike); nothing is compared with a stored time. Pieces are read from the data, so a new piece is timed too.
// Run with: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame } from '../src/core/state.js';
import { makeRng } from '../src/core/rng.js';
import * as F from '../src/core/fight.js';
import { FIGHT_JOBS } from '../src/data/fights.js';
import { MOVES, PAYLOADS } from '../src/data/builds.js';

const BOUND = 1.5; // with every build mix, a fight set may cost at most this many times the no-build set (measured first; see the test's output)
const REPEATS = 5;

const base = createNewGame({ seed: 1 }).crew;
const crewOf = (seed, size) => Array.from({ length: size }, (_, i) => {
  const op = structuredClone(base[i % base.length]);
  op.id = `spd${seed}-${i}`; op.handle = `R${i}`;
  op.stats.combat = 11 + ((seed + i * 3) % 6);
  return op;
});
const builds = [null, ...Object.keys(MOVES)].flatMap((move) => [null, ...Object.keys(PAYLOADS)].map((payload) => ({ move, payload }))).filter((b) => b.move || b.payload);
const crewWith = (crew, build) => crew.map((op, i) => (i < 2 ? { ...op, build: { ...build } } : op));

/** The fixed set: fights built once (unplayed), a copy played each time. `withBuilds`: one fight per build mix, else the same fight with none. */
function fightSet(withBuilds) {
  const set = [];
  for (const [job, site, threat] of [['warehouse', 'docks', 4], ['data_pull', 'heights', 3]]) for (let c = 0; c < 12; c++) for (const risk of ['steady', 'committed']) for (const build of withBuilds ? builds : [null]) {
    const crew = crewOf(c + 1, 4 + (c % 3));
    set.push(F.buildFight({ type: FIGHT_JOBS[job], diff: 12, threat, site, crew: build ? crewWith(crew, build) : crew, approach: 'loud', risk }, makeRng(c + 5)));
  }
  return set;
}
// The no-build set repeats each fight once for each build mix, so both sets play the same number of fights on the same crews and seeds.
const without = [];
for (const f of fightSet(false)) for (let i = 0; i < builds.length; i++) without.push(f);
const withAll = fightSet(true);
assert.equal(without.length, withAll.length);

// Each timed run plays the set PASSES times over: one run is only ~85 ms, so a scheduler pause or a collection landing in it could swing the ratio
// (it read 1.58 once under the full suite's load, against 1.01-1.08 alone). A longer run makes a blip a smaller share of it.
const PASSES = 4;
function time(set) {
  const t0 = performance.now();
  let rounds = 0;
  for (let p = 0; p < PASSES; p++) set.forEach((b0, i) => { const b = structuredClone(b0); F.playFight(b, makeRng(1000 + i)); rounds += b.round; });
  return { ms: performance.now() - t0, rounds };
}

test('every build mix at once costs at most the bound over no builds, playing the same fights', () => {
  time(without); time(withAll); // warm the JIT on both
  let a = Infinity, b = Infinity, ra = 0, rb = 0;
  for (let i = 0; i < REPEATS; i++) {
    const x = time(without); const y = time(withAll);
    if (x.ms < a) { a = x.ms; ra = x.rounds; }
    if (y.ms < b) { b = y.ms; rb = y.rounds; }
  }
  const ratio = b / a;
  console.log(`# fights ${withAll.length}; no builds ${a.toFixed(0)} ms (${ra} rounds), every build mix ${b.toFixed(0)} ms (${rb} rounds); ratio ${ratio.toFixed(2)}, bound ${BOUND}`);
  assert.ok(ratio <= BOUND, `builds make the fights ${ratio.toFixed(2)} times slower than none (the bound is ${BOUND}): the trigger step got expensive`);
});
