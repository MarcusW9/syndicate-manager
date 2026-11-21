// Security contracts (core/contracts.js; owner, 2026-11-21; drafts/PROPOSAL-security-contracts.md).
// The promises: posts pay on Sunday, give experience but no fame or standing, a hit post is a fight
// that kills nobody on steady orders, giving up a hit post always brings everyone home, pulling off keeps the pay so far, and a v83
// save upgrades with an empty contracts list.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame, SAVE_VERSION } from '../src/core/state.js';
import { advanceDay, calendar } from '../src/core/time.js';
import { resolveDecision } from '../src/core/decisions.js';
import { CONTRACT, HELP, takeContract, pullOff, contractsOf, contractFor, contractOdds, slotTotal, postsOut, helpers, toggleHelp, helpArrival } from '../src/core/contracts.js';
import { autoStep } from '../src/core/autorun.js';
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

/** Put two on a post and have it hit on the first day (the day roll forced to an incident). */
function hitPost(seed, kind = 'guard') {
  let s = fresh(seed);
  const offer = contractsOf(s).offers.find((o) => o.kind === kind);
  const ids = free(s).slice(0, Math.min(2, offer.slots)).map((o) => o.id);
  s = takeContract(s, offer.id, ids);
  const was = CONTRACT.difficulty;
  CONTRACT.difficulty = 40;
  try { s = advanceDay(s); } finally { CONTRACT.difficulty = was; }
  return { s, offer, ids, msg: call(s) };
}

test('a hit post calls in with three answers: watch the fight, let them fight it, give it up', () => {
  const { msg } = hitPost(1);
  assert.ok(msg?.blocking, 'the day stops');
  assert.deepEqual(msg.options.map((o) => o.id), ['fight', 'auto', 'give']);
  assert.ok(msg.payload.enemies >= 1);
});

test('giving up a hit post brings everyone home unhurt', () => {
  for (let seed = 1; seed <= 8; seed++) {
    let { s, offer, ids, msg } = hitPost(seed, ['guard', 'escort', 'watch'][seed % 3]);
    const injuries = ids.map((id) => s.crew.find((o) => o.id === id).condition.injury);
    s = resolveDecision(s, msg.id, 'give');
    assert.equal(contractsOf(s).active.find((x) => x.id === offer.id).ended?.how, 'gaveUp');
    ids.forEach((id, i) => {
      const op = s.crew.find((o) => o.id === id);
      assert.equal(op.condition.injury, injuries[i], 'unhurt');
      assert.ok(!(op.condition.awayUntil > s.day), 'home today');
    });
    assert.equal(s.activeMission ?? null, null);
  }
});

test('let them fight it: steady orders kill nobody; the post goes on or is given up; help goes home', () => {
  let held = 0;
  for (let seed = 1; seed <= 30; seed++) {
    let { s, offer, ids, msg } = hitPost(seed, ['guard', 'escort', 'watch'][seed % 3]);
    const c0 = contractsOf(s).active.find((x) => x.id === offer.id);
    const help = helpers(s, c0)[0]?.op.id;
    if (help && seed % 2) s = toggleHelp(s, msg.id, help);
    const sent = seed % 2 && help ? [help] : [];
    const crewBefore = s.crew.length;
    s = resolveDecision(s, msg.id, 'auto');
    assert.equal(s.activeMission ?? null, null, 'fought and closed');
    assert.equal(s.crew.length, crewBefore, `seed ${seed}: nobody died on steady`);
    const c = contractsOf(s).active.find((x) => x.id === offer.id);
    assert.ok(!c.ended || ['gaveUp', 'empty', 'done'].includes(c.ended.how), `ended ${c.ended?.how}`);
    if (!c.ended) held += 1;
    for (const id of sent) {
      assert.ok(!c.crewIds.includes(id), 'help does not join the post');
      assert.ok(!availability(s, s.crew.find((o) => o.id === id)).ok, 'help was out today: no job');
    }
    for (const id of c.crewIds) assert.ok(!['serious', 'critical'].includes(s.crew.find((o) => o.id === id).condition.injury), 'nobody badly hurt stays on');
    assert.ok(c.log.at(-1).fight, 'the fight is in the post\'s log');
    for (const id of ids) assert.ok(s.crew.find((o) => o.id === id), 'still on the crew');
  }
  assert.ok(held > 0, 'some posts are held');
});

test('watch the fight: it opens on screen, and help joins on its round', () => {
  let { s, offer, msg } = hitPost(3);
  const c = contractsOf(s).active.find((x) => x.id === offer.id);
  const h = helpers(s, c)[0];
  s = toggleHelp(s, msg.id, h.op.id);
  s = resolveDecision(s, msg.id, 'fight');
  const am = s.activeMission;
  assert.ok(am?.post === offer.id && am.battle?.engine === 2, 'an engine-2 fight on screen');
  assert.ok(!am.battle.runners.some((r) => r.id === h.op.id), 'help is not there yet');
  assert.equal(h.round, helpArrival(h.op, offer.district));
  for (let g = 0; g < 40 && !s.activeMission.done && (s.activeMission.battle?.round ?? 99) < h.round; g++) s = autoStep(s, { force: true });
  const b = s.activeMission.battle;
  if (b) assert.ok(b.runners.some((r) => r.id === h.op.id), `help joined by round ${h.round}`);
});

test('help arrives sooner from the same district, later across town, latest to or from the Heights', () => {
  const op = (hall) => ({ hall });
  assert.equal(helpArrival(op('oldTown'), 'oldTown'), HELP.sameDistrict);
  assert.equal(helpArrival(op('oldTown'), 'docks'), HELP.across);
  assert.equal(helpArrival(op('oldTown'), 'heights'), HELP.heights);
  assert.equal(helpArrival(op('heights'), 'docks'), HELP.heights);
  assert.ok(HELP.sameDistrict < HELP.across && HELP.across < HELP.heights);
});

test('a v84 save with an open post call gets the new answers', async () => {
  const { s, msg } = hitPost(4);
  const old = structuredClone(s);
  const m = old.inbox.find((x) => x.id === msg.id);
  m.options = [{ id: 'hold', label: 'Hold the post (60%, mid)' }, { id: 'give', label: 'Give it up and come home' }];
  delete m.payload.help;
  old.version = 84;
  const text = JSON.stringify(old);
  const loaded = await S.importSave({ text: async () => text });
  const lm = loaded.inbox.find((x) => x.id === msg.id);
  assert.deepEqual(lm.options.map((o) => o.id), ['fight', 'auto', 'give']);
  assert.deepEqual(lm.payload.help, []);
  assert.equal(loaded.version, SAVE_VERSION);
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

test('a v83 save upgrades with an empty contracts list (and on to the current version)', async () => {
  const s = fresh(6);
  delete s.contracts;
  s.version = 83;
  const text = JSON.stringify(s);
  const loaded = await S.importSave({ text: async () => text });
  assert.equal(loaded.version, SAVE_VERSION);
  assert.deepEqual(loaded.contracts, { offers: [], active: [], seq: 0 });
});
