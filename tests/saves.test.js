// Save slots, automatic backups and the Ironman lock. Run with: npm test

import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame, SAVE_VERSION } from '../src/core/state.js';
import { advanceDay, weeklyBill } from '../src/core/time.js';

// In-memory browser storage.
const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
};
const S = await import('../src/save/save.js');
const asFile = (state) => ({ text: async () => JSON.stringify(state) });
const days = (state, n) => { let s = state; for (let i = 0; i < n; i++) s = advanceDay(s); return s; };

beforeEach(() => store.clear());

test('the old single save moves into slot 1 untouched', () => {
  const old = createNewGame({ seed: 1 });
  store.set('syndicate-save-v1', JSON.stringify(old));
  assert.equal(S.getActiveSlot(), 1);
  assert.equal(S.loadGame().seed, old.seed);
  assert.equal(store.has('syndicate-save-v1'), false);
});

test('three independent slots', () => {
  for (const n of [1, 2, 3]) {
    S.setActiveSlot(n);
    S.saveGame(createNewGame({ seed: n * 100, difficulty: n === 3 ? 'story' : 'standard' }));
  }
  const slots = S.listSlots();
  assert.equal(slots.length, S.SLOT_COUNT);
  assert.deepEqual(slots.map((s) => s.difficulty), ['standard', 'standard', 'story']);
  assert.equal(S.loadGame(2).seed, 200);
  S.deleteSlot(2);
  assert.equal(S.listSlots()[1].empty, true);
  assert.equal(S.loadGame(1).seed, 100, 'other slots untouched');
});

test('automatic backup is taken once per in-game week', () => {
  S.setActiveSlot(1);
  let s = createNewGame({ seed: 5 });
  S.saveGame(s);
  assert.equal(S.loadBackup().day, 1);
  s = days(s, 3); S.saveGame(s);
  assert.equal(S.loadBackup().day, 1, 'same week: backup unchanged');
  s = days(s, 4); S.saveGame(s); // day 8 = next Monday
  assert.equal(S.loadBackup().day, 8, 'new week: backup refreshed');
});

test('a new game in a slot replaces the old backup', () => {
  S.setActiveSlot(1);
  S.saveGame(days(createNewGame({ seed: 6 }), 9));
  S.deleteSlot(1);
  S.saveGame(createNewGame({ seed: 7 }));
  assert.equal(S.loadBackup().seed, 7);
});

test('Ironman: no automatic backups', () => {
  S.setActiveSlot(1);
  S.saveGame(createNewGame({ seed: 8, difficulty: 'ironman' }));
  assert.equal(S.loadBackup(), null);
});

test('Ironman: an older copy of the run is refused, the current one loads', async () => {
  S.setActiveSlot(1);
  let s = createNewGame({ seed: 9, difficulty: 'ironman' });
  S.saveGame(s);
  const exported = structuredClone(s); // what "Export save file" would write now
  s = advanceDay(s); S.saveGame(s);
  s = advanceDay(s); S.saveGame(s);
  await assert.rejects(S.importSave(asFile(exported)), /rolled back/);
  const current = await S.importSave(asFile(s));
  assert.equal(current.day, s.day);
});

test('Ironman: a run this browser has never seen can be loaded (moving devices)', async () => {
  S.setActiveSlot(1);
  const s = createNewGame({ seed: 10, difficulty: 'ironman' });
  S.saveGame(s);
  const file = structuredClone(s);
  store.clear(); // a different browser
  assert.equal((await S.importSave(asFile(file))).seed, 10);
});

test('Standard saves can always be re-imported', async () => {
  S.setActiveSlot(1);
  let s = createNewGame({ seed: 11 });
  S.saveGame(s);
  const old = structuredClone(s);
  s = days(s, 5); S.saveGame(s);
  assert.equal((await S.importSave(asFile(old))).day, 1);
});

test('backup reminder is due after 28 days without an export', () => {
  const s = createNewGame({ seed: 12 });
  s.day = 20; assert.equal(S.backupDue(s), false);
  s.day = 28; assert.equal(S.backupDue(s), true);
  s.lastBackupDay = 25; assert.equal(S.backupDue(s), false);
});

test('a v9 save upgrades to v10 with heat notice fields', async () => {
  const { SAVE_VERSION } = await import('../src/core/state.js');
  const v9 = createNewGame({ seed: 14 });
  delete v9.heatNoticeDay; delete v9.heatWatched;
  v9.version = 9;
  v9.heat = 7;
  const loaded = await S.importSave(asFile(v9));
  assert.equal(loaded.version, SAVE_VERSION);
  assert.equal(loaded.heatNoticeDay, null);
  assert.equal(loaded.heatWatched, false);
  assert.equal(loaded.heat, 7, 'heat itself is untouched');
});

test('cash at the start of the day is recorded for the daily change', () => {
  let s = createNewGame({ seed: 30 });
  assert.equal(s.dayStartCash, s.cash, 'a new game starts with no change');
  s.cash += 500; // a job paid out today
  s = days(s, 1);
  assert.equal(s.dayStartCash, s.cash, 'a new day starts from what you had');
  s = days(s, 4); // day 6 -> day 7 is Sunday: wages and rent go out that morning
  const before = s.cash;
  s = days(s, 1);
  assert.equal(s.dayStartCash, before);
  assert.ok(s.cash < s.dayStartCash, "Sunday's bills show as today's change");
});

test('a v12 save upgrades to v13 with today\'s starting cash', async () => {
  const v12 = createNewGame({ seed: 31 });
  delete v12.dayStartCash;
  v12.version = 12;
  const loaded = await S.importSave(asFile(v12));
  assert.equal(loaded.version, SAVE_VERSION);
  assert.equal(loaded.dayStartCash, loaded.cash);
});

test('the bill shown before Sunday is what Sunday takes', () => {
  let s = days(createNewGame({ seed: 32 }), 5); // Saturday
  const { total } = weeklyBill(s);
  const before = s.cash;
  s = days(s, 1);
  assert.equal(before - s.cash, total);
});
