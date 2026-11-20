// Training focus (runner shaping step 3; drafts/PROPOSAL-runner-shaping.md, DESIGN.md 2026-11-20):
// a nudge. The player marks up to two stats; a share of what a runner learns elsewhere moves to them,
// and the total they learn does not change.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame, SAVE_VERSION } from '../src/core/state.js';
import { FOCUS, focusOf, focusSplit, gainXp, setFocus, toggleFocus, STATS } from '../src/core/development.js';
import { makeRookie } from './develop-sim.js';

const sum = (split) => split.reduce((n, [, p]) => n + p, 0);

test('no focus: points land where they were earned', () => {
  const op = makeRookie({ role: 'infiltrator' });
  assert.deepEqual(focusSplit(op, 'combat', 4), [['combat', 4]]);
});

test('a focus moves a share of points from other stats, and the total is unchanged', () => {
  const op = makeRookie({ role: 'infiltrator', focus: ['tech', 'medical'] });
  const split = focusSplit(op, 'combat', 4);
  assert.ok(Math.abs(sum(split) - 4) < 1e-9, 'the total is unchanged');
  assert.deepEqual(split.map(([s]) => s), ['combat', 'tech', 'medical']);
  assert.ok(Math.abs(split[0][1] - 4 * (1 - FOCUS.divert)) < 1e-9);
  assert.equal(split[1][1], split[2][1]);
});

test('points earned in a focus stat stay whole', () => {
  const op = makeRookie({ role: 'infiltrator', focus: ['stealth', 'tech'] });
  assert.deepEqual(focusSplit(op, 'stealth', 4), [['stealth', 4]]);
});

test('a focus stat at 20 takes nothing; with no other focus left, nothing moves', () => {
  const op = makeRookie({ role: 'infiltrator', focus: ['tech'] });
  op.stats.tech = 20;
  assert.deepEqual(focusSplit(op, 'combat', 4), [['combat', 4]]);
});

test('growth through gainXp follows the focus (the side stat rises from points earned elsewhere)', () => {
  const plain = makeRookie({ role: 'infiltrator', room: { tech: 14 } });
  const focused = makeRookie({ role: 'infiltrator', room: { tech: 14 }, focus: ['tech'] });
  for (let i = 0; i < 80; i++) { gainXp(plain, [plain], 'stealth', 4, i); gainXp(focused, [focused], 'stealth', 4, i); }
  assert.equal(plain.stats.tech, 7);
  assert.ok(focused.stats.tech > 7, 'the focus stat grew');
  assert.ok(focused.stats.stealth <= plain.stats.stealth, 'the main stat paid for it');
});

test('the focus is at most two known stats; toggling past two drops the oldest pick', () => {
  let s = createNewGame({ seed: 4, startCrew: 'fresh' });
  const id = s.crew[0].id;
  s = setFocus(s, id, ['tech', 'nonsense', 'combat', 'social']);
  assert.deepEqual(focusOf(s.crew[0]), ['combat', 'tech']);
  s = setFocus(s, id, []);
  s = toggleFocus(s, id, 'tech');
  s = toggleFocus(s, id, 'combat');
  s = toggleFocus(s, id, 'social');
  assert.deepEqual(focusOf(s.crew[0]), ['combat', 'social']);
  s = toggleFocus(s, id, 'combat');
  assert.deepEqual(focusOf(s.crew[0]), ['social']);
  assert.equal(toggleFocus(s, id, 'nonsense'), s);
  assert.ok(FOCUS.max === 2 && STATS.length === 8);
});

test('the save: v82 gives every runner and recruit an empty focus', async () => {
  const S = await import('../src/save/save.js');
  const s = createNewGame({ seed: 2, startCrew: 'fresh' });
  for (const op of [...s.crew, ...(s.recruits ?? [])]) delete op.focus;
  s.version = 81;
  const loaded = await S.importSave({ text: async () => JSON.stringify(s) });
  assert.equal(loaded.version, SAVE_VERSION);
  for (const op of loaded.crew) assert.deepEqual(op.focus, []);
});
