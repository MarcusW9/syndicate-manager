// The build vocabulary's generic trigger step (DESIGN.md 2026-11-19, drafts/PROPOSAL-build-vocabulary.md "What makes it scale" 1):
// every piece is written in the vocabulary's words and never names another piece; the trigger step runs them in a fixed order; a
// new piece made only of existing words works with no engine code. Ricochet and the Vectors behave exactly as before (builds.test.js,
// and a 2,592-fight line-for-line check when the step was built). Run with: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame } from '../src/core/state.js';
import { makeRng } from '../src/core/rng.js';
import * as F from '../src/core/fight.js';
import { MOVES, PAYLOADS } from '../src/data/builds.js';
import { ENEMIES } from '../src/data/fights.js';

const all = () => [...Object.values(MOVES), ...Object.values(PAYLOADS)];

test('every piece is written only in the vocabulary', () => {
  for (const src of all()) {
    assert.ok(src.pieces?.length, `${src.id} has pieces`);
    for (const p of src.pieces) {
      assert.ok(F.VOCAB.when.includes(p.when), `${src.id}: when ${p.when}`);
      assert.ok(F.VOCAB.who.includes(p.who), `${src.id}: who ${p.who}`);
      for (const k of Object.keys(p.if ?? {})) assert.ok(F.VOCAB.if.includes(k), `${src.id}: if ${k}`);
      const what = typeof p.what === 'string' ? { [p.what]: true } : p.what;
      for (const [k, v] of Object.entries(what)) {
        assert.ok(F.VOCAB.what.includes(k), `${src.id}: what ${k}`);
        if (k === 'apply' || k === 'spread') assert.ok(F.VOCAB.status.includes(v), `${src.id}: status ${v}`);
      }
    }
  }
});

test('a piece never names another piece', () => {
  const ids = all().map((x) => x.id);
  for (const src of all()) {
    const text = JSON.stringify(src.pieces);
    for (const id of ids) assert.ok(!text.includes(`"${id}"`), `${src.id}'s pieces name ${id}`);
  }
});

test('the trigger step runs a runner\'s pieces in a fixed order: the move\'s, then the payload\'s', () => {
  const r = { build: { move: 'ricochet', payload: 'contagion' } };
  assert.deepEqual(F.piecesOn(r, 'onAttack').map((x) => x.from.id), ['ricochet']);
  assert.deepEqual(F.piecesOn(r, 'onHit').map((x) => x.from.id), ['contagion']);
  assert.deepEqual(F.piecesOn(r, 'onKill').map((x) => x.from.id), ['contagion']);
  assert.deepEqual(F.piecesOn({ build: null }, 'onHit'), []);
  assert.equal(F.moveNeedsUp(MOVES.ricochet), 2);
});

// A small fixed fight: the star (with the build) attacks; every roll the lowest the rng gives, so every attack lands.
function fight(build, kinds = ['hired', 'hired', 'hired']) {
  const crew = createNewGame({ seed: 1 }).crew.filter((o) => o.id === 'jax');
  crew[0].build = build; crew[0].stats.combat = 30;
  const b = F.buildFight({ type: 'holdYard', diff: 10, threat: 3, site: 'docks', crew, approach: 'loud', risk: 'steady' }, makeRng(3));
  b.enemies = kinds.map((kind, i) => ({ n: i + 1, kind, hp: 30, max: 30, absorb: 0, cover: 'open', out: false, fled: false, deck: ['aim'], di: 0, approaching: false, group: 0, infected: null }));
  b.hiredTotal = {};
  return b;
}

test('a new piece made only of existing words works with no engine code: a payload that only spreads on a kill', () => {
  PAYLOADS.testjump = { id: 'testjump', name: 'Test jump', word: 'Jump', dot: { tick: 10, rounds: 1 }, immune: [], slot: 'payload', pieces: [{ when: 'onKill', who: 'nextInGroup', what: { spread: 'infected' } }] };
  try {
    const b = fight({ move: null, payload: 'testjump' });
    b.enemies[0].hp = 1; // the first attack drops it
    F.setOrder(b, 'jax', { duty: 'attack', target: 1, fallback: null });
    const res = F.playRound(b, () => 0.99);
    assert.ok(b.enemies[0].out);
    assert.ok(res.lines.some((l) => l.key === 'spread' && l.payload === 'testjump'), 'the kill carried it to the next in the group');
    assert.equal(b.enemies[1].infected?.payload, 'testjump');
    assert.equal(b.enemies[2].infected, null, 'one jump a fall');
  } finally { delete PAYLOADS.testjump; }
});

test('a new piece made only of existing words: a payload whose hit applies the status, with its own numbers', () => {
  PAYLOADS.testslow = { id: 'testslow', name: 'Test slow', word: 'Slow', dot: { tick: 5, rounds: 3 }, immune: [], slot: 'payload', pieces: [{ when: 'onHit', who: 'target', what: { apply: 'infected' } }] };
  try {
    const b = fight({ move: null, payload: 'testslow' });
    F.setOrder(b, 'jax', { duty: 'attack', target: 1, fallback: null });
    F.playRound(b, () => 0.99);
    assert.deepEqual(b.enemies[0].infected && [b.enemies[0].infected.tick, b.enemies[0].infected.left, b.enemies[0].infected.payload], [5, 3, 'testslow']);
  } finally { delete PAYLOADS.testslow; }
});

test('the guardrails live in the engine, not in the pieces: an immune body shrugs once and never passes a status on', () => {
  assert.ok(ENEMIES.drone.foeTags.includes('synthetic'));
  const b = fight({ move: null, payload: 'contagion' }, ['drone', 'drone', 'hired']);
  b.enemies[0].absorb = 0;
  F.setOrder(b, 'jax', { duty: 'attack', target: 1, fallback: null });
  const r1 = F.playRound(b, () => 0.99);
  assert.equal(r1.lines.filter((l) => l.key === 'immune').length, 1);
  assert.equal(b.enemies[0].infected, null);
  b.enemies[0].hp = 1; b.drawn = false;
  const r2 = F.playRound(b, () => 0.99);
  assert.ok(b.enemies[0].out);
  assert.ok(!r2.lines.some((l) => l.key === 'spread'), 'a drone it killed carries nothing on');
  assert.ok(!r2.lines.some((l) => l.key === 'immune'), 'the shrug is said once a body');
});
