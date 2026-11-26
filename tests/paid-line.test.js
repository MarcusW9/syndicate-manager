// The report's Paid line says how far the pay moved from what the client offered (first-run walkthrough, 2026-11-26),
// and the founder cards show the same trait-counted numbers as the Crew tab.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { paidLine } from '../src/core/mission.js';
import { ratedStat } from '../src/core/crew.js';
import { createNewGame, chooseFounders } from '../src/core/state.js';

test('the Paid line names the offer when the pay moved off it', () => {
  assert.equal(paidLine(1500, 1500), 'Paid ¥1,500.');
  assert.equal(paidLine(0, 1500), 'Paid ¥0.', 'no pay keeps the plain line (an abort says why)');
  assert.equal(paidLine(1300, 1500), 'Paid ¥1,300 of the ¥1,500 offered: ¥200 lost to what went wrong.');
  assert.equal(paidLine(1650, 1500), 'Paid ¥1,650: ¥150 over the ¥1,500 offered.');
  assert.match(paidLine(1300, 1500), /^Paid ¥/, 'still starts with Paid (the report and old saves split on it)');
});

test('a founder rated on the pick card is rated the same once picked', () => {
  const s = createNewGame({ seed: 21, startCrew: 'pick' });
  const cands = s.founding.candidates;
  const before = Object.fromEntries(cands.map((c) => [c.id, Object.fromEntries(Object.keys(c.stats).map((k) => [k, ratedStat(c, k)]))]));
  const after = chooseFounders(s, cands.slice(0, 3).map((c) => c.id));
  for (const op of after.crew) {
    const c = cands.find((x) => x.handle === op.handle);
    for (const k of Object.keys(c.stats)) assert.equal(ratedStat(op, k), before[c.id][k], `${op.handle} ${k}`);
  }
});
