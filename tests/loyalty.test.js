// Renewals step 3: statuses, loyalty, contract fields. Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame, SAVE_VERSION } from '../src/core/state.js';
import { advanceDay } from '../src/core/time.js';
import { loyalty, loyaltyDiscount } from '../src/core/loyalty.js';
import { addStatus, hasStatus } from '../src/core/statuses.js';
import { effectiveStat, crewRoll } from '../src/core/crew.js';

globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
const { importSave } = await import('../src/save/save.js');

test('loyalty discount is 1% per job and caps at 25%', () => {
  assert.equal(loyaltyDiscount({ jobsWithCrew: 0 }), 0);
  assert.ok(Math.abs(loyaltyDiscount({ jobsWithCrew: 10 }) - 0.1) < 1e-9);
  assert.equal(loyaltyDiscount({ jobsWithCrew: 25 }), 0.25);
  assert.equal(loyaltyDiscount({ jobsWithCrew: 400 }), 0.25);
  assert.equal(loyalty({ jobsWithCrew: 400 }), 1);
});

test('unhappy is -1 in both the stat read and the crew roll, and expires', () => {
  let s = createNewGame({ seed: 3 });
  const op = s.crew[0];
  const before = effectiveStat(op, 'cool').value;
  const rollBefore = crewRoll([op], 'cool').value;
  addStatus(op, 'unhappy', s.day + 28);
  assert.equal(effectiveStat(op, 'cool').value, before - 1);
  assert.ok(effectiveStat(op, 'cool').notes.includes('unhappy'));
  assert.equal(crewRoll([op], 'cool').value, rollBefore - 1);
  for (let i = 0; i < 27; i++) s = advanceDay(s);
  assert.ok(hasStatus(s.crew[0], 'unhappy'));
  s = advanceDay(s);
  assert.ok(!hasStatus(s.crew[0], 'unhappy'));
});

test('a v7 save upgrades to v8 with contract defaults', async () => {
  const v7 = createNewGame({ seed: 12 });
  for (const op of v7.crew) { delete op.status; delete op.jobsWithCrew; delete op.contractMainStat; delete op.lastNoticeDay; }
  v7.version = 7;
  const loaded = await importSave({ text: async () => JSON.stringify(v7) });
  assert.equal(loaded.version, SAVE_VERSION);
  for (const op of loaded.crew) {
    assert.deepEqual(op.status, []);
    assert.equal(op.jobsWithCrew, 0);
    assert.equal(typeof op.contractMainStat, 'number');
    assert.equal(op.lastNoticeDay, null);
  }
});
