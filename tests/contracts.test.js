// Security contracts (core/contracts.js; owner, 2026-11-21; drafts/PROPOSAL-security-contracts.md).
// The promises: posts pay on Sunday, give experience but no fame or standing, never kill anyone,
// giving up a hit post always brings everyone home, pulling off keeps the pay so far, and a v83
// save upgrades with an empty contracts list.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame, SAVE_VERSION } from '../src/core/state.js';
import { advanceDay, calendar } from '../src/core/time.js';
import { resolveDecision } from '../src/core/decisions.js';
import { CONTRACT, takeContract, pullOff, contractsOf, contractFor, contractOdds, slotTotal, postsOut } from '../src/core/contracts.js';
import { CONTRACT_KINDS } from '../src/data/contracts.js';
import { trustOf } from '../src/core/clients.js';
import { availability } from '../src/core/crew.js';
import * as S from '../src/save/save.js';

const fresh = (seed) => createNewGame({ seed, startCrew: 'fresh' });
const free = (s) => s.crew.filter((o) => availability(s, o).ok);
const call = (s) => s.inbox.find((m) => m.kind === 'contract' && !m.resolved);

/** Advance a day, answering any hit post with `answer` ('hold' or 'give'). */
function day(s, answer = 'give') {
  s = advanceDay(s);
  for (let m = call(s); m; m = call(s)) s = resolveDecision(s, m.id, answer);
  return s;
}

test('a new game has three posts on offer, one of each kind, and a fresh week deals three more', () => {
  let s = fresh(1);
  const kinds = contractsOf(s).offers.map((o) => o.kind).sort();
  assert.deepEqual(kinds, Object.keys(CONTRACT_KINDS).sort());
  for (const o of contractsOf(s).offers) {
    assert.ok(o.post && !o.post.includes('{'), `filled: ${o.post}`);
    assert.ok(slotTotal(o) > 0);
  }
  while (!calendar(s.day + 1).isMonday) s = advanceDay(s);
  const before = contractsOf(s).offers.map((o) => o.id);
  s = advanceDay(s);
  assert.equal(contractsOf(s).offers.length, CONTRACT.boardSize);
  assert.ok(contractsOf(s).offers.every((o) => !before.includes(o.id)), 'last week\'s offers are gone');
});

test('taking a post sends the runners away; too many, or someone unavailable, is refused', () => {
  const s = fresh(2);
  const offer = contractsOf(s).offers.find((o) => o.kind === 'guard');
  const ids = free(s).slice(0, offer.slots).map((o) => o.id);
  assert.equal(takeContract(s, offer.id, free(s).slice(0, offer.slots + 1).map((o) => o.id)), s, 'more runners than slots');
  assert.equal(takeContract(s, offer.id, []), s, 'nobody');
  const t = takeContract(s, offer.id, ids);
  assert.notEqual(t, s);
  for (const id of ids) {
    assert.ok(!availability(t, t.crew.find((o) => o.id === id)).ok, 'away on the post');
    assert.equal(contractFor(t, id)?.id, offer.id);
  }
  assert.ok(!contractsOf(t).offers.some((o) => o.id === offer.id), 'the offer is taken');
  assert.equal(takeContract(t, contractsOf(t).offers[0].id, ids), t, 'already on a post');
  assert.ok(contractOdds(s, offer, ids).chance > 0);
});

test('a post pays on Sunday, builds trust, gives experience and no fame or standing', () => {
  let s = fresh(3);
  const offer = contractsOf(s).offers.find((o) => o.kind === 'watch');
  const crew = free(s).slice(0, offer.slots);
  const fame = crew.map((o) => [o.fame ?? null, o.standing ?? null, JSON.stringify(o.record ?? null)]);
  const trust0 = trustOf(s, offer.clientId);
  s = takeContract(s, offer.id, crew.map((o) => o.id));
  let paid = 0;
  for (let i = 0; i < 14; i++) {
    const before = s.cash;
    const sunday = calendar(s.day + 1).isSunday;
    s = day(s, 'give');
    if (sunday) paid += (s.inbox.find((m) => m.kind === 'week')?.payload?.posts?.total ?? 0);
    assert.ok(s.cash !== undefined && before !== undefined);
  }
  assert.ok(paid > 0, 'the post was paid on a Sunday');
  assert.ok(!postsOut(s).some((p) => p.id === offer.id), 'the post is over');
  crew.forEach((o, i) => {
    const now = s.crew.find((x) => x.id === o.id);
    assert.deepEqual([now.fame ?? null, now.standing ?? null, JSON.stringify(now.record ?? null)], fame[i], `${o.handle}: no fame, standing or record from a post`);
  });
  const ended = s.inbox.find((m) => m.id === `ct-done-${offer.id}`);
  if (ended) assert.ok(trustOf(s, offer.clientId) >= trust0, 'a post done builds trust');
});

test('a hit post never kills anyone; giving it up brings everyone home unhurt; holding pays or hurts', () => {
  const was = CONTRACT.difficulty;
  CONTRACT.difficulty = 40; // every day a hit
  try {
    let holds = { held: 0, lost: 0 };
    for (const answer of ['give', 'hold']) {
      for (let seed = 1; seed <= 12; seed++) {
        let s = fresh(seed);
        const offer = contractsOf(s).offers[seed % 3];
        const ids = free(s).slice(0, offer.slots).map((o) => o.id);
        s = takeContract(s, offer.id, ids);
        const injuries = ids.map((id) => s.crew.find((o) => o.id === id).condition.injury);
        s = advanceDay(s);
        const m = call(s);
        assert.ok(m, 'the hit post calls in');
        assert.ok(m.blocking && m.options.some((o) => o.id === 'give') && m.options.some((o) => o.id === 'hold'), 'an out and a stand, both shown');
        s = resolveDecision(s, m.id, answer);
        const c = contractsOf(s).active.find((x) => x.id === offer.id);
        for (const [i, id] of ids.entries()) {
          const op = s.crew.find((o) => o.id === id);
          assert.ok(op, 'nobody is lost');
          assert.notEqual(op.condition.injury, 'dead');
          if (answer === 'give') {
            assert.equal(op.condition.injury, injuries[i], 'giving it up hurts nobody');
            assert.ok(availability(s, op).ok || op.condition.fatigue > 85, 'home today');
          }
        }
        if (answer === 'give') assert.equal(c.ended?.how, 'gaveUp');
        if (answer === 'hold') holds[c.ended?.how === 'lost' ? 'lost' : 'held'] += 1;
      }
    }
    assert.ok(holds.lost > 0, 'at this difficulty a stand can fail');
  } finally { CONTRACT.difficulty = was; }
});

test('pulling runners off keeps the pay so far, costs a little trust, and frees them today', () => {
  let s = fresh(5);
  const offer = contractsOf(s).offers.find((o) => o.kind === 'guard');
  const ids = free(s).slice(0, offer.slots).map((o) => o.id);
  s = takeContract(s, offer.id, ids);
  s = day(s); s = day(s);
  const owed = contractsOf(s).active.find((c) => c.id === offer.id).owed;
  const trust = trustOf(s, offer.clientId);
  const t = pullOff(s, offer.id);
  const c = contractsOf(t).active.find((x) => x.id === offer.id);
  assert.equal(c.ended.how, 'pulled');
  assert.equal(c.owed, owed, 'the pay so far is kept');
  assert.equal(trustOf(t, offer.clientId), trust + CONTRACT.trust.pullOff);
  for (const id of ids) assert.equal(contractFor(t, id), null);
  for (const id of ids) assert.ok(!(t.crew.find((o) => o.id === id).condition.awayUntil > t.day), 'free today');
});

test('a v83 save upgrades with an empty contracts list', async () => {
  const s = fresh(6);
  delete s.contracts;
  s.version = 83;
  const text = JSON.stringify(s);
  const loaded = await S.importSave({ text: async () => text });
  assert.equal(loaded.version, SAVE_VERSION);
  assert.deepEqual(loaded.contracts, { offers: [], active: [], seq: 0 });
});
