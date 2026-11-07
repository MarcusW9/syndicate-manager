// The stat-usage counter (scripts/lib/stat-usage.mjs, drafts/PLAN-stat-usage.md) only reads what
// a run writes down: the same seed ends with the same cash with and without it, and its reading of
// the guards' attacks is the runner's side of the roll.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { playSeason, rollsOf, chanceOf } from '../scripts/lib/stat-usage.mjs';

test('counting rolls never changes a run: same seed, same cash, with and without the counter', { timeout: 120000 }, () => {
  for (const policy of ['careful', 'mixed', 'tong']) {
    for (const seed of [1, 2]) {
      const counted = playSeason({ seed, weeks: 5, policy });
      const plain = playSeason({ seed, weeks: 5, policy, count: false });
      assert.equal(counted.cash, plain.cash, `${policy} seed ${seed}`);
      assert.equal(counted.deaths, plain.deaths, `${policy} seed ${seed}`);
      assert.ok(counted.run.jobs > 0, `${policy} seed ${seed} counted some jobs`);
      assert.equal(plain.run, null);
    }
  }
});

test('the counter reads a roll as d20 + value >= need, and turns the guards\' attacks round', () => {
  assert.equal(chanceOf(10, 20), 0.55); // needs a 10 or better
  assert.equal(chanceOf(0, 30), 0);
  const events = [
    { kind: 'roll', incident: 'guard', stat: 'stealth', actor: { id: 'a' }, value: 8, need: 16, die: 3, success: false, outcomeCost: { heat: 1 } },
    { kind: 'save', stat: 'combat', actor: { id: 'b' }, value: 9, need: 16, die: 12, success: true },
    { kind: 'battle', phase: 'round', lines: [
      { kind: 'guard', stat: 'cool', targetId: 'a', value: 6, need: 18, die: 15, success: true, damage: 3 },
      { kind: 'turret', value: 6, need: 16, die: 4, success: false },
      { kind: 'shoot', stat: 'combat', actor: { id: 'b' }, value: 9, need: 16, die: 2, success: false },
    ] },
  ];
  const r = rollsOf(events);
  assert.deepEqual(r.map((x) => x.stat), ['stealth', 'combat', 'cool', 'combat'], 'the turret has no runner behind it');
  assert.equal(r[0].costly, false, 'a failed incident a save rescued costs nothing');
  assert.equal(r[2].success, false, 'the guard hit: the runner\'s cool failed');
  assert.equal(r[2].p, 1 - chanceOf(6, 18));
  assert.equal(r[2].costly, true);
  assert.equal(r[3].costly, false, 'a missed shot is not a cost on its own');
});
