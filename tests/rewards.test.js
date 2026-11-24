// Rewards you can see (owner, 2026-11-24; drafts/PROPOSAL-rewards-visibility.md; core/loot.js, core/gear.js markSeen).
// The promises: the tier odds climb with the job's threat; the job page's spoils read uses the same odds the roll does;
// a heist finale always drops at the floor or better; a won fight at home or on a post can leave the attackers' gear,
// on its own hash; a dropped piece is new until its sheet is opened or it is given; "best for" names someone who could
// take it now and who it really helps; no new roll moves the shared stream.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame } from '../src/core/state.js';
import { tierOdds, tierAt, rollDrop, lootFor, takenFor, spoilsFor, bestTaker } from '../src/core/loot.js';
import { makeItem, markSeen, unseenGear, equip } from '../src/core/gear.js';
import { LOOT, TIERS } from '../src/data/gear.js';

const LADDER = Object.keys(TIERS);
const rank = (t) => LADDER.indexOf(t);
const lcg = (seed) => () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);

test('the odds of a better tier climb with the threat, and the job page reads the same odds', () => {
  let last = -1;
  for (let t = 1; t <= 5; t++) {
    const o = tierOdds(t);
    assert.deepEqual(o, Object.fromEntries(LADDER.map((k) => [k, LOOT.byThreat[t][k] ?? 0])));
    const good = o.custom + o.premium + o.apex;
    assert.ok(good > last, `threat ${t}: Custom or better ${good}% (was ${last}%)`);
    last = good;
    const sp = spoilsFor(createNewGame({ seed: 1, startCrew: 'fresh' }), t);
    assert.equal(sp.chance, LOOT.chance);
    assert.equal(sp.best, 'premium');
    assert.equal(sp.named, o.apex > 0);
  }
  // Sampled, threat 5 drops Custom or better several times as often as threat 1.
  const share = (t) => { const r = lcg(t * 7); let n = 0; for (let i = 0; i < 20000; i++) { const d = rollDrop(r, [], { threat: t }); if (d && rank(d.tier) >= rank('custom')) n++; } return n / 20000; };
  assert.ok(share(5) > 4 * share(1), `${share(5)} vs ${share(1)}`);
  assert.equal(tierAt(0.999, 3), 'standard');
});

test('a heist finale always drops, at the floor or better', () => {
  const r = lcg(3);
  for (let i = 0; i < 500; i++) {
    const d = rollDrop(r, [], { threat: 2, floor: LOOT.heistFloor });
    assert.ok(d, 'always something');
    assert.ok(rank(d.tier) >= rank(LOOT.heistFloor), d.tier);
  }
  const s = createNewGame({ seed: 5, startCrew: 'fresh' });
  const line = lootFor(s, 'job-x', { threat: 2, heist: true });
  assert.ok(line.uid && rank(line.tier) >= rank('custom'));
  assert.equal(spoilsFor(s, 2, { heist: true }).chance, 1);
});

test('a dropped piece is new until its sheet is opened or it is given, and drops move no shared roll', () => {
  const s = createNewGame({ seed: 8, startCrew: 'fresh' });
  const before = s.rngCounter;
  let line = null;
  for (let i = 0; i < 40 && !line?.uid; i++) line = lootFor(s, `job-${i}`, { threat: 4 });
  assert.ok(line?.uid, 'something dropped');
  assert.equal(s.rngCounter, before, 'hashRng only');
  const item = s.stash.find((x) => x.uid === line.uid);
  assert.ok(item.unseen);
  assert.equal(item.from, 'job');
  assert.equal(unseenGear(s)[0].uid, s.stash.filter((x) => x.unseen).at(-1).uid, 'newest first');
  const seen = markSeen(s, [line.uid]);
  assert.ok(!seen.stash.find((x) => x.uid === line.uid).unseen);
  assert.equal(markSeen(seen, [line.uid]), seen, 'nothing new: the same state');
  // Given to someone: seen too.
  const best = bestTaker(s, item);
  if (best) {
    const given = equip(s, item.uid, best.op.id, null);
    assert.ok(!JSON.stringify(given.crew).includes('"unseen":true'));
  }
});

test('a won fight can leave the attackers\' gear: on its own hash, Standard or Verified, into the stash as new', () => {
  let got = 0;
  for (let i = 0; i < 40; i++) {
    const s = createNewGame({ seed: 10 + i, startCrew: 'fresh' });
    const before = { n: (s.stash ?? []).length, counter: s.rngCounter };
    const line = takenFor(s, `raid:r${i}`);
    assert.equal(s.rngCounter, before.counter);
    if (!line) { assert.equal((s.stash ?? []).length, before.n); continue; }
    got++;
    assert.match(line.text, /^Taken off them: /);
    assert.ok(['standard', 'verified'].includes(line.tier));
    assert.ok(Object.keys(LOOT.taken.pool).includes(s.stash.at(-1).type));
    assert.ok(s.stash.at(-1).unseen);
    const again = createNewGame({ seed: 10 + i, startCrew: 'fresh' });
    assert.equal(takenFor(again, `raid:r${i}`).tier, line.tier, 'the same on reload');
  }
  assert.ok(got >= 10 && got <= 30, `taken ${got} of 40 (chance ${LOOT.taken.chance})`);
});

test('"best for" names a runner who could take it now, and what it gives them', () => {
  const s = createNewGame({ seed: 4, startCrew: 'fresh' });
  for (const type of ['pistol', 'vest', 'deck', 'rifle', 'medkit']) {
    const item = makeItem(s, type, 'verified');
    const b = bestTaker(s, item);
    assert.ok(b, type);
    assert.ok(s.crew.includes(b.op));
    assert.ok(b.text.length > 3);
  }
  // Nobody out on a job can take it (core/gear.js canChangeGear).
  s.sideOut = [{ crewIds: s.crew.map((o) => o.id) }];
  assert.equal(bestTaker(s, makeItem(s, 'pistol', 'verified')), null);
});
