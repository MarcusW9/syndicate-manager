// C3b: the scout as a two-day side task, and the screens for free names, a name's page and Sign.
// (The core is in tests/rivals-c3.test.js.) Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame } from '../src/core/state.js';
import { advanceDay } from '../src/core/time.js';
import { weeklyRivals, rivalView } from '../src/core/rivals.js';
import { sendScout, scoutLevel, findCard, readFor, signCard, dossierOf, SCOUT_DAYS } from '../src/core/dossier.js';
import { sideTasksOut } from '../src/core/sidetasks.js';
import { availability } from '../src/core/crew.js';
import { renderTongs, scoutRow } from '../src/ui/tongs.js';
import { POTENTIAL_TEXT, SIGN_REASON, SCOUT_LEVEL_TEXT } from '../src/data/rivals.js';

const game = (seed = 42) => { const s = createNewGame({ seed, startCrew: 'fresh' }); s.cash = 60000; return s; };
const weeks = (s, n) => { for (let w = 0; w < n; w++) { s.day = 7 * (w + 1); weeklyRivals(s); } return s; };
/** A game at the first week a free name is up (a name is on offer about two weeks in three). */
const withOffer = (seed) => {
  const s = game(seed);
  for (let w = 0; w < 30 && !s.rivals.offer; w++) { s.day = 7 * (w + 1); weeklyRivals(s); }
  assert.ok(s.rivals.offer, 'a free name is up');
  s.day += 1;
  return s;
};

test('a scout is a two-day side task: the scout is away, Out now lists it, and the result lands when they are back', () => {
  let s = withOffer(1);
  const card = findCard(s, s.rivals.offer.cardId);
  const op = s.crew.find((o) => availability(s, o).ok);
  const rng = s.rngCounter;
  const sent = sendScout(s, card.id, op.id);
  assert.notEqual(sent, s);
  assert.equal(sent.crew.find((o) => o.id === op.id).condition.awayUntil, s.day + SCOUT_DAYS);
  assert.equal(availability(sent, sent.crew.find((o) => o.id === op.id)).ok, false, 'away');
  const out = sideTasksOut(sent);
  assert.equal(out.length, 1);
  assert.match(out[0].name, new RegExp(`^Scout ${card.name}`));
  assert.equal(out[0].district, card.home);
  assert.equal(sendScout(sent, card.id, s.crew.find((o) => o.id !== op.id && availability(sent, o).ok).id), sent, 'one scout per name at a time');
  assert.equal(sendScout(sent, card.id, op.id), sent, 'the scout is away');
  const levelBefore = scoutLevel(sent, card);
  let t = sent;
  for (let d = 0; d < SCOUT_DAYS; d++) t = advanceDay(t);
  assert.equal(sideTasksOut(t).length, 0, 'back');
  assert.ok(t.inbox.some((m) => m.id.startsWith('scout-back-')), 'a report');
  const after = scoutLevel(t, card);
  assert.ok(after === levelBefore || after === levelBefore + 1);
  assert.equal(t.rngCounter, rng + (t.rngCounter - rng), 'the day tick may roll; the scout itself never does');
});

test('a trip is the same hash roll as before: scouting adds no rngCounter draw of its own', () => {
  const s = withOffer(2);
  const card = findCard(s, s.rivals.offer.cardId);
  const op = s.crew[0];
  const a = advanceDay(advanceDay(sendScout(s, card.id, op.id)));
  const plain = advanceDay(advanceDay(s));
  assert.equal(a.rngCounter, plain.rngCounter, 'the same two days draw the same rolls with or without a scout out');
});

test('a name that was signed away before the scout got there says so, and nothing breaks', () => {
  let s = withOffer(3);
  const card = findCard(s, s.rivals.offer.cardId);
  s = sendScout(s, card.id, s.crew[0].id);
  s.rivals.cards = s.rivals.cards.filter((c) => c.id !== card.id);
  s.rivals.offer = null;
  s = advanceDay(advanceDay(s));
  const m = s.inbox.find((x) => x.id.startsWith('scout-back-'));
  assert.match(m.subject, /moved on/);
});

test('Ops › The other tongs shows this month\'s free name and opens its page', () => {
  const s = withOffer(4);
  const view = rivalView(s);
  const html = renderTongs(s, null);
  assert.match(html, /Free names/);
  assert.ok(html.includes(`data-id="${view.offer.id}"`));
  assert.ok(html.includes(view.offer.name));
  assert.doesNotMatch(html, /undefined|NaN|\[object/);
  const page = renderTongs(s, `name:${view.offer.id}`);
  assert.ok(page.includes(view.offer.name));
  assert.match(page, /What we know/);
  assert.match(page, /What it would take/);
  assert.match(page, /Signing fee/);
  assert.doesNotMatch(page, /undefined|NaN|\[object/);
});

test("a name's page shows no stats until they are scouted, and never more than the level allows", () => {
  const s = withOffer(5);
  const card = findCard(s, s.rivals.offer.cardId);
  const cold = renderTongs(s, `name:${readFor(s, card).id}`);
  assert.doesNotMatch(cold, /namestats/);
  assert.match(cold, new RegExp(SCOUT_LEVEL_TEXT.none.slice(0, 20)));
  assert.match(cold, /about ¥/, 'the wage is a guess before a trip');
  for (const level of [1, 2, 3]) {
    const t = structuredClone(s); t.rivals.scouted = { [card.id]: level };
    const html = renderTongs(t, `name:${readFor(t, card).id}`);
    assert.match(html, /namestats/);
    const band = readFor(t, card).potential;
    const safe = POTENTIAL_TEXT[band].split("'").at(-1).slice(0, 14); // the page escapes apostrophes
    assert.ok(html.includes(safe), `${band}: ${POTENTIAL_TEXT[band]}`);
    if (level >= 2) assert.doesNotMatch(html, /about ¥/, 'the exact wage from the second trip');
  }
});

test('the name page offers Sign when it can be signed, the reason when it cannot, and a scout picker', () => {
  const s = withOffer(6);
  const card = findCard(s, s.rivals.offer.cardId);
  const id = readFor(s, card).id;
  const rich = structuredClone(s); rich.cash = 200000; rich.crew[0].fame = 'legend'; rich.crew[1].fame = 'elite';
  const page = renderTongs(rich, `name:${id}`);
  assert.match(page, /data-action="sign-name"/);
  assert.match(page, /data-action="scout-send"/);
  const broke = structuredClone(s); broke.cash = 5;
  assert.match(renderTongs(broke, `name:${id}`), new RegExp(SIGN_REASON.no_cash.slice(0, 20)));
  assert.doesNotMatch(renderTongs(broke, `name:${id}`), /data-action="sign-name"/);
  const full = structuredClone(s); full.halls[0].beds = full.crew.length;
  assert.match(renderTongs(full, `name:${id}`), new RegExp(SIGN_REASON.no_bed.slice(0, 15)));
  const done = signCard(rich, id);
  assert.match(renderTongs(done, `name:${id}`), /Gone/, 'once signed, the page says they are gone');
});

test('a head has no price and no Sign; a name in a tong shows the buyout', () => {
  const s = withOffer(7);
  const view = rivalView(s);
  const tong = view.tiers[0].tongs[0];
  const name = tong.names[0];
  const html = renderTongs(Object.assign(structuredClone(s), { cash: 200000 }), `name:${name.id}`);
  assert.match(html, /Buyout to /);
  const headCard = s.rivals.cards.find((c) => c.id === s.rivals.tongs.find((t) => t.name === tong.name).headId);
  const headPage = renderTongs(s, `name:${headCard.name.toLowerCase().replace(/[^a-z]+/g, '-')}`);
  assert.doesNotMatch(headPage, /data-action="sign-name"|Signing fee/);
  assert.match(headPage, new RegExp(SIGN_REASON.head.slice(0, 12)));
  assert.doesNotMatch(headPage, /scout-send/, 'no scouting a head');
  // The tong's page links its names.
  assert.match(renderTongs(s, tong.id), new RegExp(`data-action="tong-name" data-id="${name.id}"`));
});

test('the side-work board gets a Scout row for the free name, until they are fully scouted', () => {
  const s = withOffer(8);
  const row = scoutRow(s);
  assert.match(row, /data-action="tong-name"/);
  assert.match(row, /Scout /);
  const card = findCard(s, s.rivals.offer.cardId);
  const full = structuredClone(s); full.rivals.scouted = { [card.id]: 3 };
  assert.equal(scoutRow(full), '');
  const none = game(8); none.rivals.offer = null;
  assert.equal(scoutRow(none), '');
});

test('the tong list has no number or stray token', () => {
  for (let seed = 1; seed <= 10; seed++) {
    const s = weeks(game(seed), 30);
    const html = renderTongs(s, null);
    assert.doesNotMatch(html, /undefined|NaN|\[object|\{\w+\}/);
    for (const t of rivalView(s).tiers.flatMap((x) => x.tongs)) assert.doesNotMatch(renderTongs(s, t.id), /undefined|NaN|\[object|\{\w+\}/);
  }
});

test('free names, name pages, a tong\'s names and Names on the street all carry portraits, and a name keeps its face when signed', () => {
  const s = withOffer(9);
  const view = rivalView(s);
  const list = renderTongs(s, null);
  assert.ok((list.match(/class="face/g) ?? []).length >= view.names.length + 1, 'a face for the free name and every name on the street');
  const page = renderTongs(s, `name:${view.offer.id}`);
  assert.match(page, /class="face face--lg"/);
  assert.match(page, /<svg/);
  const tong = view.tiers[0].tongs[0];
  assert.match(renderTongs(s, tong.id), /class="namebtn"[^>]*><span class="face face--sm">/);
  // The face is drawn from the dossier's runner, the very one that is signed.
  const card = findCard(s, view.offer.id);
  const rich = structuredClone(s); rich.cash = 200000; rich.crew[0].fame = 'legend'; rich.crew[1].fame = 'elite';
  const signedState = signCard(rich, view.offer.id);
  const op = signedState.crew.at(-1);
  assert.equal(op.handle, dossierOf(s, card).handle);
  assert.equal(op.color, dossierOf(s, card).color);
});
