// A failed save is never silent (drafts/BRIEF-save-failures.md; review 2026-11-13, findings 1, 7 and 12).
// Run with: npm test

import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame } from '../src/core/state.js';
import { advanceDay } from '../src/core/time.js';
import { markRead } from '../src/core/inbox.js';

// In-memory browser storage that can be made to refuse writes, and counts reads of each key.
const store = new Map();
const reads = new Map();
let full = false;
globalThis.localStorage = {
  getItem: (k) => { reads.set(k, (reads.get(k) ?? 0) + 1); return store.has(k) ? store.get(k) : null; },
  setItem: (k, v) => { if (full) throw new Error('QuotaExceededError'); store.set(k, String(v)); },
  removeItem: (k) => store.delete(k),
};
const S = await import('../src/save/save.js');
const days = (state, n) => { let s = state; for (let i = 0; i < n; i++) s = advanceDay(s); return s; };

beforeEach(() => { store.clear(); reads.clear(); full = false; });

test('a save that cannot be written says so, and the trouble clears on the next good save', () => {
  let s = createNewGame({ seed: 7 });
  assert.equal(S.saveGame(s), true);
  assert.equal(S.saveTrouble(), null);
  const savedDay = s.day;
  s = days(s, 3);
  full = true;
  assert.equal(S.saveGame(s), false, 'saveGame reports the failure');
  assert.deepEqual(S.saveTrouble(), { sinceDay: savedDay }, 'the last good save is the day shown');
  s = days(s, 1);
  assert.equal(S.saveGame(s), false);
  assert.deepEqual(S.saveTrouble(), { sinceDay: savedDay }, 'still the last good day, not today');
  full = false;
  assert.equal(S.saveGame(s), true);
  assert.equal(S.saveTrouble(), null);
  assert.equal(S.loadGame().day, s.day, 'and the game was kept');
});

test('loading a save resets the trouble to that save', () => {
  const s = createNewGame({ seed: 9 });
  S.saveGame(s);
  full = true;
  S.saveGame(days(s, 2));
  assert.ok(S.saveTrouble());
  full = false;
  assert.equal(S.loadGame().day, s.day);
  assert.equal(S.saveTrouble(), null);
});

test('a failed backup write is a failed save too', () => {
  const s = createNewGame({ seed: 10 });
  const real = globalThis.localStorage.setItem;
  globalThis.localStorage.setItem = (k, v) => { if (k.endsWith('-backup')) throw new Error('QuotaExceededError'); real(k, v); };
  try {
    assert.equal(S.saveGame(s), false);
    assert.ok(S.saveTrouble());
  } finally { globalThis.localStorage.setItem = real; }
  assert.equal(S.saveGame(s), true, 'the backup is tried again on the next save');
  assert.equal(JSON.parse(store.get(`syndicate-slot-${S.getActiveSlot()}-backup`)).day, s.day);
});

test('a save checks the weekly backup without reading it', () => {
  let s = createNewGame({ seed: 11 });
  S.saveGame(s);
  const key = `syndicate-slot-${S.getActiveSlot()}-backup`;
  reads.clear();
  for (let i = 0; i < 5; i++) { s = advanceDay(s); S.saveGame(s); }
  assert.equal(reads.get(key) ?? 0, 0, 'the backup itself is never read on save');
  // An older backup without its small key is read once, and then not again.
  store.delete(`${key}-meta`);
  reads.clear();
  S.saveGame(s);
  S.saveGame(s);
  assert.equal(reads.get(key), 1);
});

test('the weekly backup still moves on a new week, and deleting a slot takes its note too', () => {
  let s = createNewGame({ seed: 12 });
  S.saveGame(s);
  const slot = S.getActiveSlot();
  const key = `syndicate-slot-${slot}-backup`;
  const first = JSON.parse(store.get(key)).day;
  s = days(s, 7);
  S.saveGame(s);
  assert.equal(JSON.parse(store.get(key)).day, s.day);
  assert.notEqual(first, s.day);
  S.deleteSlot(slot);
  assert.equal(store.has(`${key}-meta`), false);
});

test('markRead returns a new state and leaves the old one as it was', () => {
  const s = createNewGame({ seed: 13 });
  const msg = { id: 'm-test', type: 'news', day: s.day, read: false };
  const before = { ...s, inbox: [...s.inbox, msg] };
  const after = markRead(before, 'm-test');
  assert.notEqual(after, before);
  assert.equal(before.inbox.at(-1).read, false, 'the old state is untouched');
  assert.equal(after.inbox.find((m) => m.id === 'm-test').read, true);
  assert.equal(markRead(after, 'm-test'), after, 'an already-read message changes nothing');
  assert.equal(markRead(after, 'nope'), after);
});
