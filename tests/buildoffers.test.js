// Earning builds by offer, slice 3-ii-b (core/builds.js, data/builds.js BUILD_OFFER; docs/design/2026-11.md 2026-11-17). Run with: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame, SAVE_VERSION } from '../src/core/state.js';
import { makeRng } from '../src/core/rng.js';
import * as F from '../src/core/fight.js';
import { resolveDecision } from '../src/core/decisions.js';
import { BUILD_OFFER, MOVES, PAYLOADS } from '../src/data/builds.js';
import { checkBuildOffers, offerDue, eligiblePieces, buildPieces, buildOf, offerPick } from '../src/core/builds.js';

const fresh = () => { const s = createNewGame({ seed: 1 }); s.day = 10; return s; };
const jax = (s) => s.crew.find((o) => o.id === 'jax'); // muscle, combat 15
const wing = (s) => s.crew.find((o) => o.id === 'wing'); // tech, combat 4
const offerFor = (s, id) => s.inbox.find((m) => m.kind === 'build' && m.payload.opId === id && !m.resolved);

test('nobody is offered anything before the first milestone', () => {
  const s = fresh(); jax(s).jobsWithCrew = BUILD_OFFER.firstAtJobs - 1;
  assert.equal(offerDue(jax(s), s.day), false);
  assert.deepEqual(checkBuildOffers(s), []);
  assert.equal(s.inbox.filter((m) => m.kind === 'build').length, 0);
});

// Since the four part-B pieces joined (owner, 2026-11-19) there are more pieces than an offer shows (BUILD_OFFER.size): Joss shows that many
// of the ones they qualify for, picked by offerPick (seeded by the runner and the day); before, he showed every one.
test('at the milestone Joss offers the pieces they qualify for (up to the offer size), once, as a message with options and Not yet', () => {
  const s = fresh(); jax(s).jobsWithCrew = BUILD_OFFER.firstAtJobs;
  const expected = offerPick(eligiblePieces(jax(s)), jax(s), s.day).map((p) => p.id);
  assert.equal(expected.length, BUILD_OFFER.size);
  assert.deepEqual(checkBuildOffers(s).map((o) => o.id), ['jax']);
  const m = offerFor(s, 'jax');
  assert.deepEqual(m.payload.ids, expected);
  assert.deepEqual(m.options.map((o) => o.id).sort(), [...expected, 'later'].sort());
  assert.equal(m.blocking, false);
  assert.deepEqual(checkBuildOffers(s), [], 'not again while one is open');
});

test('the stats gate a piece: a tech with combat 4 is offered payloads only, each one they meet the needs of', () => {
  const s = fresh(); wing(s).jobsWithCrew = BUILD_OFFER.firstAtJobs;
  const ok = eligiblePieces(wing(s));
  assert.ok(ok.length && ok.every((p) => p.slot === 'payload' && Object.entries(p.needs).every(([k, n]) => wing(s).stats[k] >= n)));
  assert.ok(!ok.some((p) => p.id === 'ricochet' || p.id === 'incendiary'), 'combat 10 is out of reach');
  checkBuildOffers(s);
  assert.ok(offerFor(s, 'wing').payload.ids.every((id) => ok.some((p) => p.id === id)));
});

test('taking a piece fills its slot, and the other slot is offered again only after the gap', () => {
  let s = fresh(); jax(s).jobsWithCrew = BUILD_OFFER.firstAtJobs;
  while (!offerPick(eligiblePieces(jax(s)), jax(s), s.day).some((p) => p.id === 'ricochet')) s.day += 1; // a day whose offer has the move
  checkBuildOffers(s);
  s = resolveDecision(s, offerFor(s, 'jax').id, 'ricochet');
  assert.deepEqual(jax(s).build, { move: 'ricochet', payload: null });
  assert.equal(jax(s).buildAt, BUILD_OFFER.firstAtJobs);
  assert.ok(jax(s).history.some((h) => h.includes('Ricochet')));
  assert.deepEqual(buildPieces(jax(s)).map((b) => b.id), ['ricochet']);
  assert.deepEqual(checkBuildOffers(s), [], 'not until the gap');
  jax(s).jobsWithCrew = BUILD_OFFER.firstAtJobs + BUILD_OFFER.everyJobs;
  checkBuildOffers(s);
  assert.ok(offerFor(s, 'jax').payload.ids.every((id) => PAYLOADS[id]), 'only the empty slot');
  const pay = offerFor(s, 'jax').payload.ids.includes('cytotoxic') ? 'cytotoxic' : offerFor(s, 'jax').payload.ids[0];
  s = resolveDecision(s, offerFor(s, 'jax').id, pay);
  assert.deepEqual(jax(s).build, { move: 'ricochet', payload: pay });
  jax(s).jobsWithCrew += 99; s.day += 99;
  assert.deepEqual(checkBuildOffers(s), [], 'both slots full: nothing left to offer');
});

test('Not yet snoozes the offer for the data\'s days, then Joss asks again', () => {
  let s = fresh(); jax(s).jobsWithCrew = BUILD_OFFER.firstAtJobs;
  checkBuildOffers(s);
  s = resolveDecision(s, offerFor(s, 'jax').id, 'later');
  assert.equal(jax(s).buildSnooze, s.day + BUILD_OFFER.snoozeDays);
  assert.equal(jax(s).build ?? null, null);
  assert.deepEqual(checkBuildOffers(s), []);
  s.day += BUILD_OFFER.snoozeDays;
  assert.deepEqual(checkBuildOffers(s).map((o) => o.id), ['jax']);
});

test('freelancers are never offered one, and a piece cannot be taken twice or for a filled slot', () => {
  const s = fresh(); jax(s).jobsWithCrew = 50; jax(s).freelance = true;
  assert.deepEqual(checkBuildOffers(s).map((o) => o.id).includes('jax'), false);
  const t = fresh(); jax(t).jobsWithCrew = 50;
  checkBuildOffers(t);
  const id = offerFor(t, 'jax').id;
  jax(t).build = { move: 'ricochet', payload: null }; // already holds a move by another route
  const after = resolveDecision(t, id, 'ricochet');
  assert.deepEqual(jax(after).build, { move: 'ricochet', payload: null });
  assert.equal(after.inbox.find((m) => m.id === id).resolved, false, 'a refused pick leaves the message open');
});

test('an earned build is what the fight plays: the planning read and the round read the runner\'s own build', () => {
  let s = fresh(); jax(s).jobsWithCrew = BUILD_OFFER.firstAtJobs; checkBuildOffers(s);
  s = resolveDecision(s, offerFor(s, 'jax').id, 'ricochet');
  jax(s).jobsWithCrew += BUILD_OFFER.everyJobs; checkBuildOffers(s);
  s = resolveDecision(s, offerFor(s, 'jax').id, 'cytotoxic');
  const b = F.buildFight({ type: 'holdYard', diff: 14, threat: 3, site: 'docks', crew: s.crew.slice(0, 4), approach: 'loud' }, makeRng(3));
  assert.deepEqual(b.runners.find((r) => r.id === 'jax').build, { move: 'ricochet', payload: 'cytotoxic' });
  assert.equal(b.runners.find((r) => r.id === 'wing').build, null);
  assert.deepEqual(buildOf(jax(s)), { move: 'ricochet', payload: 'cytotoxic' });
});

test('every piece has a slot, base-stat needs and draft wording for the offer', () => {
  for (const p of [...Object.values(MOVES), ...Object.values(PAYLOADS)]) {
    assert.ok(['move', 'payload'].includes(p.slot), p.id);
    assert.ok(typeof p.needs === 'object' && p.desc && p.offer.includes('{op}'), p.id);
  }
});

test('the save: v75 gives every runner no build and no wait, and the version is current', async () => {
  const S = await import('../src/save/save.js');
  assert.ok(SAVE_VERSION >= 75);
  const s = createNewGame({ seed: 7 });
  for (const o of s.crew) { delete o.build; delete o.buildAt; delete o.buildSnooze; }
  s.version = 74;
  const loaded = await S.importSave({ text: async () => JSON.stringify(s) });
  assert.equal(loaded.version, SAVE_VERSION);
  assert.ok(loaded.crew.every((o) => o.build === null && o.buildAt === null && o.buildSnooze === 0));
});
