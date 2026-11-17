// The planning fights' copy (core/fight.js copyFight, 2026-11-18, the speed pass): a copy must play exactly as
// structuredClone's would, and the parts it shares with the fight it copies (KEPT: each order, each runner's stats and
// build) must never be written into by a round. Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame } from '../src/core/state.js';
import { makeRng } from '../src/core/rng.js';
import * as F from '../src/core/fight.js';
import { FIGHTS } from '../src/data/fights.js';
import { DILEMMAS } from '../src/data/dilemmas.js';

const crew = createNewGame({ seed: 5, startCrew: 'classic' }).crew;
const deepFreeze = (x) => { if (x && typeof x === 'object' && !Object.isFrozen(x)) { Object.freeze(x); for (const k in x) deepFreeze(x[k]); } return x; };

/** Every fight type, at each risk level, fresh and a few rounds in (one with a call-in's orders patched). */
function fights() {
  const out = [];
  for (const type of Object.keys(FIGHTS)) for (const risk of ['cautious', 'steady', 'committed']) for (const seed of [1, 2]) {
    const b = F.buildFight({ type, diff: F.fightDiff(14), threat: 3 + seed, site: type === 'holdHack' ? 'heights' : 'docks', crew: crew.slice(0, 3 + seed), approach: 'loud', risk }, makeRng(seed));
    out.push(b);
    const mid = structuredClone(b);
    const rng = makeRng(seed + 40);
    for (let i = 0; i < 2 && !mid.end; i++) F.playRound(mid, rng);
    if (!mid.end) {
      F.startRound(mid, rng);
      const patch = Object.values(DILEMMAS).flatMap((d) => d.options ?? []).find((o) => o.ordersPatch)?.ordersPatch;
      F.applyPatch(mid, patch);
      out.push(mid);
    }
  }
  return out;
}

/** Each object's path, and which paths point at an object seen before (the shape of the references, not just the values). */
function aliases(root) {
  const at = new Map(); const shared = [];
  (function walk(x, p) {
    if (!x || typeof x !== 'object') return;
    if (at.has(x)) { shared.push([p, at.get(x)]); return; }
    at.set(x, p);
    for (const k in x) walk(x[k], `${p}.${k}`);
  })(root, 'b');
  return shared;
}

test('copyFight gives what structuredClone gives: the same values and the same shared references', () => {
  for (const b of fights()) {
    const c = F.copyFight(b);
    assert.deepStrictEqual(c, structuredClone(b));
    assert.deepStrictEqual(aliases(c), aliases(structuredClone(b)));
    assert.notEqual(c.runners, b.runners);
    assert.notEqual(c.orders, b.orders);
  }
});

test('copyFight falls back to structuredClone on anything that is not plain data', () => {
  const b = fights()[0];
  const odd = { ...structuredClone(b), extra: new Map([[1, 2]]) };
  assert.deepStrictEqual(F.copyFight(odd), structuredClone(odd));
  assert.throws(() => F.copyFight({ ...b, f: () => 1 }), (e) => e.name === 'DataCloneError');
});

test('no round writes into the parts a copy shares: frozen, the fights play the same as on structuredClone copies', () => {
  for (const b of fights()) {
    const frozen = structuredClone(b);
    for (const x of F.KEPT(frozen)) deepFreeze(x); // a write into any of them now throws (modules are strict)
    const copy = F.copierFor(frozen);
    for (let i = 0; i < 6; i++) {
      const a = F.playFight(copy(), makeRng(0x5eed + i * 7919));
      const want = F.playFight(structuredClone(b), makeRng(0x5eed + i * 7919));
      assert.deepStrictEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(want)));
    }
  }
});
