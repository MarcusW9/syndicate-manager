// The director (core/director.js; watchable combat Slice 1): tiers, the spotlight detectors, memory, the pace budget,
// and that it changes no rule. Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { direct, newMemory, tierOf, playable, beatText } from '../src/core/director.js';
import { FIGHT } from '../src/data/fights.js';
import { FIGHT_TEXT } from '../src/data/fightText.js';

// A small fake fight: the director reads only runners, threats, goal, round, deadline and type.
const runner = (id, o = {}) => ({ id, handle: id.toUpperCase(), pips: 3, max: 3, down: false, dead: false, ...o });
const mkB = (o = {}) => ({ type: 'holdHack', round: 2, deadline: 7, goal: { work: 0, protect: 'a' }, threats: [], runners: [runner('a'), runner('b'), runner('c')], ...o });
const L = (key, o = {}) => ({ kind: o.kind ?? 'attack', key, slots: {}, text: key, ...o });
const result = (o = {}) => ({ lines: [], actions: [], defeated: [], goalDelta: 0, ...o });

test('tiers: back-and-forth is routine, changes are notable, showcase lines are showcase', () => {
  for (const k of ['attackHit', 'attackMiss', 'shotMiss', 'aura', 'jamFail']) assert.equal(tierOf(L(k)), 'routine', k);
  for (const k of ['shotDown', 'shotAbsorbed', 'jamOk', 'inVan', 'attackOut', 'arrive', 'enemyFled']) assert.equal(tierOf(L(k)), 'notable', k);
  assert.equal(tierOf(L('x', { showcase: 'holdTheLine' })), 'showcase');
  assert.equal(tierOf(L('showcase.holdTheLine.start', { kind: 'showcaseStart' })), 'showcase');
});

test('a run of routine lines is one beat; other lines get their own', () => {
  const lines = [L('attackHit'), L('attackMiss'), L('shotMiss', { kind: 'shot' }), L('shotDown', { kind: 'shot' }), L('attackHit')];
  const { beats } = direct(mkB(), result({ lines }), null);
  assert.deepEqual(beats.map((x) => [x.tier, x.lines.length]), [['routine', 3], ['notable', 1], ['routine', 1]]);
  for (const x of beats) assert.equal(x.holdMs, FIGHT.beatMs[x.tier]);
});

test('streak: 3 defeats by one runner within 2 rounds', () => {
  const b = mkB();
  const line = (n) => L('attackOut', { actor: 'b', enemy: n, dropped: true });
  let m = direct(b, result({ lines: [line(1), line(2)], defeated: [{ by: 'b', enemy: 1 }, { by: 'b', enemy: 2 }] }), null);
  assert.equal(m.beats.filter((x) => x.tier === 'spotlight').length, 0, 'two is not a streak');
  b.round = 3;
  m = direct(b, result({ lines: [line(3)], defeated: [{ by: 'b', enemy: 3 }] }), m.memory);
  const s = m.beats.filter((x) => x.tier === 'spotlight');
  assert.equal(s.length, 1);
  assert.equal(s[0].key, 'director.streak');
  assert.deepEqual(s[0].focus, ['b']);
  assert.equal(s[0].lines.length, 1, 'the spotlight sits on the defeat that completed it');
  // Too far apart: round 5 does not count rounds 2 and 3.
  b.round = 5;
  m = direct(b, result({ lines: [line(4)], defeated: [{ by: 'b', enemy: 4 }] }), m.memory);
  assert.equal(m.beats.filter((x) => x.tier === 'spotlight').length, 0);
});

test('shield wall: the same protector shields the same runner 3 times', () => {
  const b = mkB();
  let mem = null; let hits = 0;
  for (let r = 1; r <= 3; r++) {
    b.round = r;
    const out = direct(b, result({ lines: [L('shotAbsorbed', { kind: 'shot', shieldedBy: 'b', target: 'a' })], actions: [{ opId: 'b', action: 'shield', target: 'a' }] }), mem);
    mem = out.memory;
    hits += out.beats.filter((x) => x.key === 'director.shieldWall').length;
  }
  assert.equal(hits, 1);
  assert.equal(mem.shields.b.a, 3);
});

test('last stand: a runner at 1 pip acts 2 rounds running; healing or going down resets it', () => {
  const b = mkB({ runners: [runner('a', { pips: 1 }), runner('b'), runner('c')] });
  const act = { lines: [L('attackHit', { actor: 'a' })], actions: [{ opId: 'a', action: 'attack' }] };
  let out = direct(b, result(act), null);
  assert.equal(out.beats.filter((x) => x.tier === 'spotlight').length, 0);
  b.round = 3;
  out = direct(b, result(act), out.memory);
  assert.deepEqual(out.beats.filter((x) => x.tier === 'spotlight').map((x) => x.key), ['director.lastStand']);
  b.round = 4; b.runners[0].pips = 2;
  out = direct(b, result(act), out.memory);
  assert.equal(out.memory.lowPipRounds.a, 0);
});

test('clutch hack: the work completes at the deadline round minus one or later', () => {
  const early = mkB({ round: 4, goal: { work: FIGHT.workNeeded, protect: 'a' } });
  assert.equal(direct(early, result({ goalDelta: 1 }), null).beats.length, 0, 'a comfortable finish is not a clutch');
  const late = mkB({ round: 6, goal: { work: FIGHT.workNeeded, protect: 'a' } });
  const out = direct(late, result({ goalDelta: 1 }), null);
  assert.deepEqual(out.beats.map((x) => [x.tier, x.key, x.focus]), [['spotlight', 'director.clutchHack', ['a']]]);
  const notDone = mkB({ round: 6, goal: { work: FIGHT.workNeeded - 1, protect: 'a' } });
  assert.equal(direct(notDone, result({ goalDelta: 1 }), null).beats.length, 0);
});

test('denied: a jam that cancels 2 or more radio threats; carry home', () => {
  const b = mkB({ threats: [{ kind: 'backup', cancelled: true }, { kind: 'alarm', cancelled: true }, { kind: 'aim', cancelled: true }] });
  let out = direct(b, result({ lines: [L('jamOk', { kind: 'jam', actor: 'c' })] }), null);
  assert.deepEqual(out.beats.map((x) => x.key), ['director.denied']);
  b.threats = [{ kind: 'backup', cancelled: true }];
  out = direct(b, result({ lines: [L('jamOk', { kind: 'jam', actor: 'c' })] }), null);
  assert.deepEqual(out.beats.map((x) => x.tier), ['notable'], 'one cancelled call is just a jam');
  out = direct(b, result({ lines: [L('carriedInVan', { kind: 'van', target: 'a' })] }), null);
  assert.deepEqual(out.beats.map((x) => x.key), ['director.carryHome']);
});

test('the director changes nothing it is given and draws nothing', () => {
  const b = mkB({ threats: [{ kind: 'backup', cancelled: true }, { kind: 'alarm', cancelled: true }] });
  const res = result({ lines: [L('jamOk', { kind: 'jam', actor: 'c' })], actions: [{ opId: 'b', action: 'shield', target: 'a' }] });
  const mem = newMemory();
  const frozen = structuredClone([b, res, mem]);
  const out = direct(b, res, mem);
  assert.deepEqual([b, res, mem], frozen);
  assert.notEqual(out.memory, mem);
  assert.deepEqual(direct(b, res, mem), out, 'same inputs, same beats');
});

test('the spotlight budget is the UI\'s: over budget a spotlight plays as notable; Resolve plays none', () => {
  const spot = () => ({ tier: 'spotlight', lines: [], focus: [], key: 'director.streak', slots: {}, holdMs: FIGHT.beatMs.spotlight });
  const beats = Array.from({ length: 6 }, spot);
  const count = (pace) => playable(beats, pace).filter((x) => x.tier === 'spotlight').length;
  assert.equal(count('watch'), FIGHT.spotlightBudget.watch);
  assert.equal(count('fast'), FIGHT.spotlightBudget.fast);
  assert.equal(count('resolve'), 0);
  assert.equal(beats.filter((x) => x.tier === 'spotlight').length, 6, 'the list itself is untouched');
  assert.equal(playable(beats, 'watch')[5].holdMs, FIGHT.beatMs.notable);
});

test('spotlight wording is placeholder keys that read as text', () => {
  for (const k of ['streak', 'shieldWall', 'lastStand', 'clutchHack', 'denied', 'carryHome']) assert.ok(FIGHT_TEXT[`director.${k}`], k);
  assert.ok(beatText({ key: 'director.streak', slots: { who: 'Jax', n: 3 } }).includes('Jax'));
  assert.equal(beatText({ key: null }), '');
});
