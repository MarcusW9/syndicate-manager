// Renewals step 4: decision messages and renewal notices. Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame, SAVE_VERSION } from '../src/core/state.js';
import { advanceDay, isBlocked } from '../src/core/time.js';
import { primaryStat } from '../src/core/development.js';
import { marketWage } from '../src/core/pricing.js';
import { loyaltyDiscount } from '../src/core/loyalty.js';
import { renewalAsk, checkRenewal, NOTICE_COOLDOWN_DAYS } from '../src/core/renewals.js';
import { resolveDecision } from '../src/core/decisions.js';
import { hasStatus } from '../src/core/statuses.js';
import { effectiveStat, crewRoll } from '../src/core/crew.js';
import { playWeeks, randomPolicy } from './play.js';

globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
const { importSave } = await import('../src/save/save.js');

/** A starting operative who has just grown +2 in their main stat on a cheap wage. */
function grownOp(s, jobs = 10) {
  const op = s.crew[0];
  const main = primaryStat(op);
  op.contractMainStat = op.stats[main];
  op.stats[main] += 2;
  op.wage = 300;
  op.jobsWithCrew = jobs;
  return op;
}
const notice = (s) => s.inbox.find((m) => m.kind === 'renewal' && !m.resolved);

test('the ask never goes below the current wage, and the discount never passes 25%', () => {
  const s = createNewGame({ seed: 5 });
  for (const op of s.crew) {
    for (const jobs of [0, 10, 25, 300]) {
      for (const wage of [100, marketWage(op), marketWage(op) + 500]) {
        const o = { ...op, wage, jobsWithCrew: jobs };
        assert.ok(loyaltyDiscount(o) <= 0.25);
        assert.ok(renewalAsk(o) >= wage, `${op.handle} wage ${wage} jobs ${jobs}`);
        assert.ok(renewalAsk(o) <= Math.max(wage, marketWage(o)));
      }
    }
  }
});

test('no notice fires when the market pays no more than today', () => {
  const s = createNewGame({ seed: 5 });
  const op = grownOp(s);
  op.wage = marketWage(op);
  assert.equal(checkRenewal(s, op), false);
});

test('a +2 rise fires one blocking notice; the 8-week cooldown holds', () => {
  let s = createNewGame({ seed: 5 });
  const op = grownOp(s);
  assert.equal(checkRenewal(s, op), true);
  assert.ok(isBlocked(s));
  assert.equal(checkRenewal(s, op), false, 'one pending notice at a time');
  s = resolveDecision(s, notice(s).id, 'accept');
  assert.ok(!isBlocked(s));
  const o = s.crew[0];
  o.stats[primaryStat(o)] += 2;
  s.day += NOTICE_COOLDOWN_DAYS - 1;
  assert.equal(checkRenewal(s, o), false, 'inside cooldown');
  s.day += 1;
  assert.equal(checkRenewal(s, o), true, 'cooldown over');
});

test('accept pays the ask; haggle works once and never drops below the current wage', () => {
  let s = createNewGame({ seed: 5 });
  grownOp(s);
  checkRenewal(s, s.crew[0]);
  const id = notice(s).id;
  const ask = notice(s).payload.ask;
  s = resolveDecision(s, id, 'haggle');
  const after = notice(s).payload.ask;
  assert.ok(after === ask || after < ask);
  assert.ok(after >= 300);
  assert.equal(resolveDecision(s, id, 'haggle'), s, 'second haggle does nothing');
  s = resolveDecision(s, id, 'accept');
  assert.equal(s.crew[0].wage, after);
  assert.equal(s.crew[0].contractMainStat, s.crew[0].stats[primaryStat(s.crew[0])]);
});

test('refusal makes them unhappy: -1 in the risk read and the real roll, then they ask again', () => {
  let s = createNewGame({ seed: 5 });
  const op = grownOp(s);
  const stat = primaryStat(op);
  const before = { eff: effectiveStat(op, stat).value, roll: crewRoll([op], stat).value };
  checkRenewal(s, op);
  s = resolveDecision(s, notice(s).id, 'refuse');
  const o = s.crew[0];
  assert.ok(hasStatus(o, 'unhappy'));
  assert.equal(o.wage, 300);
  assert.equal(effectiveStat(o, stat).value, before.eff - 1);
  assert.equal(crewRoll([o], stat).value, before.roll - 1);
  // The risk read (core/risk.js) is built from crewRoll, so it carries the same -1 and the note.
  assert.ok(crewRoll([o], stat, { approach: 'stealth', recommended: 1 }).notes.includes('unhappy'));
  for (let i = 0; i < NOTICE_COOLDOWN_DAYS - 1; i++) s = advanceDay(s);
  assert.ok(!notice(s), 'no repeat inside the cooldown');
  s = advanceDay(s);
  assert.ok(notice(s), 'asks again after cooling off');
});

test('no death without push on, with renewals in the game', () => {
  for (let seed = 1; seed <= 20; seed++) {
    const { deaths } = playWeeks(4, seed, { ...randomPolicy(seed), critical: (opts) => (opts.includes('stabilise') ? 'stabilise' : 'extract') });
    assert.equal(deaths, 0, `seed ${seed}`);
  }
});

test('a v8 save upgrades to v9', async () => {
  const v8 = createNewGame({ seed: 12 });
  for (const op of v8.crew) delete op.renewalAgain;
  v8.version = 8;
  const loaded = await importSave({ text: async () => JSON.stringify(v8) });
  assert.equal(loaded.version, SAVE_VERSION);
  for (const op of loaded.crew) assert.equal(op.renewalAgain, false);
});
