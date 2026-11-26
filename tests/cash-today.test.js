// The top bar's change opens into what made it up (first-run walkthrough, 2026-11-26): every cash move in core
// goes through core/money.js moveCash, so a day's lines add up to cash − dayStartCash with nothing left as "Other".
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { playWeeks, carefulPolicy } from './play.js';
import { cashLines, moveCash, startCashDay } from '../src/core/money.js';

test('the list is the change, line by line', () => {
  const s = { cash: 1000, dayStartCash: 1000, cashToday: [] };
  moveCash(s, -200, 'Crate Return: "Pay the toll"');
  moveCash(s, 1300, 'Clinic Night: paid');
  moveCash(s, 0, 'nothing');
  assert.equal(s.cash, 2100);
  assert.deepEqual(cashLines(s).map((l) => l.what), ['Crate Return: "Pay the toll"', 'Clinic Night: paid']);
  s.cash += 50; // a move nobody wrote down still shows, so the list always adds up
  assert.deepEqual(cashLines(s).at(-1), { amount: 50, what: 'Other' });
  startCashDay(s);
  assert.deepEqual(cashLines(s), []);
});

test('two weeks of play: every day adds up and every move has a name', () => {
  for (const seed of [1, 2, 3, 4]) {
    playWeeks(2, seed, carefulPolicy, { startCrew: 'pick', onDay: (s) => {
      const lines = cashLines(s);
      assert.equal(lines.reduce((n, l) => n + l.amount, 0), s.cash - s.dayStartCash, `seed ${seed} day ${s.day}`);
      assert.ok(!lines.some((l) => l.what === 'Other'), `seed ${seed} day ${s.day}: unnamed move ${JSON.stringify(lines)}`);
      for (const l of lines) assert.doesNotMatch(l.what, /undefined|\[object/, `seed ${seed}: ${l.what}`);
    } });
  }
});
