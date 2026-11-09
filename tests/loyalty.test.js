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

// --- D2: op.loyalty, 0-100, weekly ---
import { weeklyLoyalty, loyaltyPoints, LOYALTY_RULES } from '../src/core/loyalty.js';
import { marketWage } from '../src/core/pricing.js';
import { freshRecord } from '../src/core/record.js';

test('a runner with no stored loyalty reads as the old rule: 4 points a job', () => {
  assert.equal(loyaltyPoints({ jobsWithCrew: 10 }), 40);
  assert.equal(loyalty({ loyalty: 50 }), 0.5);
  assert.equal(loyaltyDiscount({ loyalty: 100 }), 0.25);
  assert.equal(loyalty({ loyalty: 90 }, 10), 1); // a den adds, capped
});

test('Sunday: work and fair pay raise it; the bench, low pay and a lost mate lower it; it stays 0-100', () => {
  const s = createNewGame({ seed: 4, startCrew: 'fresh' });
  s.day = 21;
  const [a, b] = s.crew;
  for (const op of s.crew) { op.loyalty = 50; op.record = { ...freshRecord(), lastJobDay: 0 }; op.wage = marketWage(op); }
  a.record.lastJobDay = 20; // worked this week
  b.wage = Math.round(marketWage(b) * 0.5); // underpaid and benched
  weeklyLoyalty(s);
  assert.equal(a.loyalty, 50 + LOYALTY_RULES.worked + LOYALTY_RULES.fairPay);
  assert.equal(b.loyalty, 50 + LOYALTY_RULES.benched + LOYALTY_RULES.lowPay);
  s.memorial.push({ id: 'x', day: 21 });
  const c = s.crew[2]; const before = c.loyalty;
  weeklyLoyalty(s);
  assert.equal(c.loyalty, before + LOYALTY_RULES.benched + LOYALTY_RULES.fairPay + LOYALTY_RULES.lostMate);
  s.memorial = []; a.loyalty = 99; a.record.lastJobDay = 20; weeklyLoyalty(s);
  assert.equal(a.loyalty, 100);
  b.loyalty = 1; weeklyLoyalty(s);
  assert.equal(b.loyalty, 0);
});

test('a v55 save upgrades with loyalty seeded from jobs together, so renewals do not change', async () => {
  const s = createNewGame({ seed: 5, startCrew: 'fresh' });
  s.crew[0].jobsWithCrew = 10; delete s.crew[0].loyalty;
  s.version = 55;
  const loaded = await importSave(new File([JSON.stringify(s)], 'x.json'));
  assert.equal(loaded.crew[0].loyalty, 40);
  assert.equal(loyaltyDiscount(loaded.crew[0]), loyaltyDiscount({ jobsWithCrew: 10 }));
});
