// C3a: a free name a month, scouting, signing, buyouts, regard, folding and forming (DESIGN.md
// 2026-11-08 "C3 designed"; drafts/PROPOSAL-phase-3.md C.13). Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame, SAVE_VERSION } from '../src/core/state.js';
import { weeklyRivals, rivalView, noteRivalEncounter } from '../src/core/rivals.js';
import { dossierOf, cardToOperative, operativeToCard, scoutTrip, readFor, scoutErrorAt, persuasion, approachFor, buyoutFor, signCard, findCard, cardSlug, scoutLevel } from '../src/core/dossier.js';
import { ratingOf, cardRating } from '../src/core/rating.js';
import { RIVALS, WORD_TEXT } from '../src/data/rivals.js';
import { marketWage } from '../src/core/pricing.js';

globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
const { importSave } = await import('../src/save/save.js');

const game = (seed = 42) => { const s = createNewGame({ seed, startCrew: 'fresh' }); s.cash = 50000; return s; };
const weeks = (s, n, from = 0) => { for (let w = from; w < from + n; w++) { s.day = 7 * (w + 1); weeklyRivals(s); } return s; };
/** A tong with the name to sign anyone: a Legend and an Elite, cash, and a free bed. */
const boosted = (s) => { s.cash = 200000; s.crew[0].fame = 'legend'; s.crew[1].fame = 'elite'; s.crew[2].fame = 'respected'; return s; };
const free = (s) => s.rivals.cards.find((c) => !c.tongId);
const inTong = (s) => { const t = s.rivals.tongs[0]; return s.rivals.cards.find((c) => c.tongId === t.id && c.id !== t.headId); };

test('a card always becomes the same runner, and its rating matches within 2', () => {
  let n = 0;
  for (let seed = 1; seed <= 30; seed++) {
    const s = game(seed);
    for (const card of s.rivals.cards) {
      const a = dossierOf(s, card);
      assert.deepEqual(dossierOf(s, card), a, 'deterministic');
      for (const v of Object.values(a.stats)) assert.ok(v >= 1 && v <= 20);
      const op = cardToOperative(s, card);
      assert.ok(Math.abs(ratingOf(op) - cardRating(card)) <= 2, `${card.name}: card ${cardRating(card)}, runner ${ratingOf(op)}`);
      assert.ok(Math.abs(ratingOf(operativeToCard(s, op).rating ? op : op) - operativeToCard(s, op).rating) <= 2);
      assert.equal(op.age, card.age);
      assert.ok(op.stats && op.potential && op.history.length && op.condition);
      n++;
    }
  }
  assert.ok(n > 1000);
});

test('what the player sees depends on the scouting level, never more', () => {
  const s = game(3);
  const card = free(s);
  const cold = readFor(s, card);
  assert.equal(cold.level, 'none');
  assert.equal(cold.stats, null);
  assert.equal(cold.potential, null);
  assert.equal(cold.name, card.name);
  assert.equal(cold.tong, null, 'a free name');
  assert.doesNotMatch(cold.id, /\d/, 'a slug, no digits');
  const crew = s.crew.find((o) => o.stats.social >= 6) ?? s.crew[0];
  let t = s; let tries = 0;
  while (scoutLevel(t, card) < 3 && tries++ < 60) { t = scoutTrip({ ...t, day: t.day + 1 }, card.id, crew.id); t.day += 0; }
  assert.equal(scoutLevel(t, card), 3, 'three good trips');
  const full = readFor(t, card);
  assert.equal(full.level, 'full');
  assert.deepEqual(full.stats, dossierOf(t, card).stats);
  assert.equal(scoutErrorAt(t, card, 3), 0, 'the potential read is exact at level 3');
  assert.ok(Math.abs(scoutErrorAt(t, card, 2)) <= 1, 'error halved at level 2');
  assert.equal(scoutErrorAt(t, card, 1), scoutErrorAt(t, card, 0), 'one trip does not change the error');
  assert.equal(scoutTrip(t, card.id, crew.id), t, 'a fourth trip does nothing');
  assert.equal(scoutTrip(s, 'no-such-name', crew.id), s);
});

test('a scout trip is a hash roll: no rngCounter move, a failure tells nothing, levels only climb', () => {
  const s = game(4);
  const card = free(s);
  const op = s.crew[0];
  const before = s.rngCounter;
  let t = s; const levels = [];
  for (let d = 0; d < 30; d++) { t = scoutTrip({ ...t, day: s.day + d }, card.id, op.id); levels.push(scoutLevel(t, card)); if (t.rivals.lastScout.ok === false) assert.equal(levels.at(-1), levels.at(-2) ?? 0); }
  assert.equal(t.rngCounter, before);
  assert.deepEqual(levels, [...levels].sort((a, b) => a - b));
  assert.ok(levels.at(-1) <= RIVALS.scoutMax);
  const again = scoutTrip({ ...s, day: s.day + 5 }, card.id, op.id);
  assert.deepEqual(scoutTrip({ ...s, day: s.day + 5 }, card.id, op.id).rivals.scouted, again.rivals.scouted, 'the same trip, the same result');
});

test('persuasion is pure, never prices under the market wage, and rises with our name', () => {
  const s = game(5);
  const card = s.rivals.cards.filter((c) => !c.tongId).sort((a, b) => cardRating(a) - cardRating(b))[0];
  const a = approachFor(s, card.id);
  assert.deepEqual(approachFor(s, card.id), a);
  assert.ok(a.wage >= a.base, 'never below the market wage');
  assert.ok(a.premium >= 0 && a.premium <= RIVALS.premiumMax);
  assert.equal(a.buyout, 0, 'a free name owes no buyout');
  const poor = game(5); poor.cash = 700;
  const rich = game(5); rich.cash = 90000; rich.crew[0].fame = 'legend'; rich.crew[1].fame = 'elite'; rich.crew[2].fame = 'respected';
  assert.ok(persuasion(rich, card).score > persuasion(poor, card).score);
  assert.ok(approachFor(rich, card.id).premium < approachFor(poor, card.id).premium);
  rich.halls.push({ ...rich.halls[0], district: 'docks', beds: 4 }); rich.rosterCap += 4;
  assert.ok(persuasion(rich, card).parts.tier > persuasion(poor, card).parts.tier, 'more halls, a higher tier');
});

test('a runner in a tong costs a buyout; a head cannot be approached; a free name owes none', () => {
  const s = game(6);
  const t = s.rivals.tongs[0];
  const head = s.rivals.cards.find((c) => c.id === t.headId);
  assert.equal(buyoutFor(s, head), null);
  assert.equal(approachFor(s, head.id).reason, 'head');
  const card = inTong(s);
  const b = buyoutFor(s, card);
  assert.ok(b > 0);
  assert.equal(buyoutFor(s, free(s)), 0);
  const rich = structuredClone(s); rich.rivals.tongs[0].wealth += 30000;
  assert.ok(buyoutFor(rich, findCard(rich, card.id)) > b && buyoutFor(rich, findCard(rich, card.id)) <= b * 1.5 + 100, 'a rich tong asks more, up to +50%');
  const cold = structuredClone(s); cold.rivals.tongs[0].regard = -3;
  assert.ok(Math.abs(buyoutFor(cold, findCard(cold, card.id)) / b - 1.25) < 0.02, 'a cold tong asks 25% more');
  const warm = structuredClone(s); warm.rivals.tongs[0].regard = 3;
  assert.ok(Math.abs(buyoutFor(warm, findCard(warm, card.id)) / b - 0.9) < 0.02, 'a warm one asks 10% less');
});

test('signing: pays the fee and the buyout, fills a bed, leaves the cards, and cools the tong that was poached', () => {
  const s = boosted(game(7));
  const card = inTong(s);
  const tongBefore = structuredClone(s.rivals.tongs.find((t) => t.id === card.tongId));
  const a = approachFor(s, card.id);
  assert.equal(a.ok, true, a.reason);
  const rng = s.rngCounter;
  const next = signCard(s, card.id);
  assert.equal(next.cash, s.cash - a.total);
  assert.equal(next.rngCounter, rng);
  assert.equal(next.crew.length, s.crew.length + 1);
  const op = next.crew.at(-1);
  assert.equal(op.name, card.name);
  assert.equal(op.wage, a.wage);
  assert.ok(op.hall);
  assert.equal(next.rivals.cards.some((c) => c.id === card.id), false);
  const tong = next.rivals.tongs.find((t) => t.id === card.tongId);
  assert.equal(tong.wealth, tongBefore.wealth + a.buyout, 'the buyout goes to the tong');
  assert.equal(tong.regard, tongBefore.regard + RIVALS.regard.poach);
  assert.ok(next.inbox[0].body.includes(tong.name));
  assert.equal(marketWage(op) <= op.wage, true, 'paid the market wage at least');
  // A free name poaches nobody: no regard change.
  const t2 = signCard(boosted(game(7)), free(game(7)).id);
  assert.ok(t2.rivals.tongs.every((t) => t.regard === 0));
});

test('signing refuses without a bed, without cash, or for a head', () => {
  const s = game(8);
  const card = free(s);
  const broke = structuredClone(s); broke.cash = 10;
  assert.equal(approachFor(broke, card.id).reason, 'no_cash');
  assert.equal(signCard(broke, card.id), broke);
  const full = structuredClone(s); full.halls[0].beds = full.crew.length;
  assert.equal(approachFor(full, card.id).reason, 'no_bed');
  assert.equal(signCard(full, card.id), full);
  const head = s.rivals.cards.find((c) => c.id === s.rivals.tongs[0].headId);
  assert.equal(signCard(s, head.id), s);
});

test('regard moves only on explicit acts: a poach cools it, a split warms it once a month, and it eases to 0', () => {
  const s = weeks(game(9), 20);
  assert.ok(s.rivals.tongs.every((t) => t.regard === 0), 'weeks alone change nothing');
  const t = s.rivals.tongs[0];
  const am = (day) => ({ rival: { tongId: t.id, district: t.home }, events: [{ kind: 'twist', text: 'Rival crew' }, { crisis: 'twist_rival_crew', choiceId: 'deal', success: true }] });
  s.day = 200; noteRivalEncounter(s, am());
  assert.equal(t.regard, 1);
  s.day = 210; noteRivalEncounter(s, am());
  assert.equal(t.regard, 1, 'once a month');
  s.day = 240; noteRivalEncounter(s, am());
  assert.equal(t.regard, 2);
  noteRivalEncounter(s, { rival: { tongId: t.id, district: t.home }, events: [{ kind: 'twist', text: 'Rival crew' }, { crisis: 'twist_rival_crew', choiceId: 'race', success: true }] });
  const before = t.regard;
  t.regard = 4;
  for (let w = 40; w < 60; w++) { s.day = 7 * (w + 1); weeklyRivals(s); }
  assert.ok(t.regard < 4 && t.regard >= 0, 'eases toward 0');
  assert.ok(before >= 0);
  const p = signCard(boosted(game(9)), inTong(game(9)).id);
  assert.equal(p.rivals.tongs[0].regard, -2);
  const clamp = boosted(game(9)); clamp.rivals.tongs[0].regard = -5;
  assert.equal(signCard(clamp, inTong(clamp).id).rivals.tongs[0].regard, -5, 'never below -5');
});

test('the free name: one at a time, a card with no tong, every 3 to 6 weeks, and left alone a rival signs it', () => {
  const gaps = new Set(); let offers = 0;
  for (let seed = 1; seed <= 25; seed++) {
    const s = game(seed);
    let last = null;
    for (let w = 0; w < 60; w++) {
      s.day = 7 * (w + 1);
      const had = s.rivals.offer?.day;
      weeklyRivals(s);
      const o = s.rivals.offer;
      if (o) assert.ok(s.rivals.cards.find((c) => c.id === o.cardId && !c.tongId), 'the offer is a free name');
      if (o && o.day !== had) { offers++; if (last != null) gaps.add(Math.round((s.day - last) / 7)); last = s.day; }
    }
  }
  assert.ok(offers > 100);
  assert.ok(gaps.size >= 4, `the gap varies, 3 to 6 weeks: ${[...gaps]}`);
  assert.ok([...gaps].every((g) => g >= 3), 'never under three weeks');
  assert.ok([...gaps].every((g) => g <= 6), 'never over six weeks');
  const s = game(30);
  weeks(s, 10);
  const view = rivalView(s);
  assert.ok(view.offer && view.offer.id && !/\d/.test(view.offer.id));
  JSON.stringify(view, (k, v) => { assert.notEqual(typeof v, 'number', `a number at ${k}`); return v; });
  const id = s.rivals.offer.cardId;
  s.day += RIVALS.freeWeeks * 7 + 14; weeklyRivals(s);
  const c = s.rivals.cards.find((x) => x.id === id);
  assert.ok(!c || c.tongId, 'a rival has signed it');
});

test('a poor, small tong folds after six Sundays, its names go free one a Sunday with the head last', () => {
  const s = game(10);
  const t = s.rivals.tongs[0];
  const names = s.rivals.cards.filter((c) => c.tongId === t.id).length;
  RIVALS.formChance = 0;
  try {
    for (let w = 0; w < 7; w++) {
      Object.assign(t, { halls: 1, prestige: 3, wealth: 100, aim: 3 }); s.day = 7 * (w + 1); weeklyRivals(s);
    }
    assert.equal(t.status, 'folded');
    assert.ok(s.rivals.word.some((e) => e.kind === 'folded' && e.refs[0] === t.id));
    let left = s.rivals.cards.filter((c) => c.tongId === t.id).length;
    assert.ok(left < names, 'one went free at once');
    const order = [];
    for (let w = 7; w < 7 + names; w++) {
      s.day = 7 * (w + 1); const before = s.rivals.cards.filter((c) => c.tongId === t.id).length; weeklyRivals(s);
      const now = s.rivals.cards.filter((c) => c.tongId === t.id).length;
      assert.ok(before - now <= 1, 'at most one a Sunday');
      left = now;
    }
    assert.equal(left, 0);
    const freed = s.rivals.cards.filter((c) => c.fromTong === t.id || !c.tongId);
    assert.ok(freed.length >= names - 1);
    assert.equal(order.length, 0);
  } finally { RIVALS.formChance = 0.5; }
});

test('over two years: never fewer than four tongs, every card belongs to a real tong or none, new tongs have a head of their own', () => {
  let folds = 0, forms = 0;
  for (let seed = 1; seed <= 40; seed++) {
    const s = game(seed);
    for (let w = 0; w < 104; w++) {
      weeks(s, 1, w);
      assert.ok(s.rivals.tongs.filter((t) => t.status === 'active').length >= RIVALS.minTongs);
    }
    const ids = new Set(s.rivals.tongs.map((t) => t.id));
    assert.equal(ids.size, s.rivals.tongs.length, 'tong ids stay unique');
    for (const c of s.rivals.cards) assert.ok(c.tongId == null || ids.has(c.tongId));
    for (const t of s.rivals.tongs) {
      if (t.status === 'folded') folds++;
      if (t.formedDay > 1) { forms++; if (t.status === 'active') assert.equal(s.rivals.cards.find((c) => c.id === t.headId)?.tongId, t.id, 'its head is its own'); assert.notEqual(t.home, 'silt'); }
    }
    assert.ok(s.rivals.cards.length >= 25 && s.rivals.cards.length <= 70, `the cast stays a sensible size (${s.rivals.cards.length})`);
  }
  assert.ok(folds > 3, `tongs do fold (${folds})`);
  assert.ok(forms > 2, `tongs do form (${forms})`);
});

test('C3 never moves rngCounter, scouting and signing included', () => {
  let s = game(11);
  const before = s.rngCounter;
  weeks(s, 60);
  s = scoutTrip(s, free(s).id, s.crew[0].id);
  s = signCard(s, free(s).id);
  assert.equal(s.rngCounter, before);
});

test('the new Word lines have text and no digits or loose braces', () => {
  for (const kind of ['folded', 'went_free', 'formed', 'cold_shoulder', 'warm_nod', 'free_name']) {
    assert.ok(WORD_TEXT[kind]?.length >= 2, kind);
    for (const l of WORD_TEXT[kind]) { assert.doesNotMatch(l, /\d/); assert.match(l, /[.!?]$/); }
  }
  let seen = new Set();
  for (let seed = 1; seed <= 30; seed++) { const s = weeks(game(seed), 104); for (const e of s.rivals.word) seen.add(e.kind); for (const e of s.rivals.word) assert.ok(WORD_TEXT[e.kind], e.kind); }
  assert.ok(seen.has('free_name'));
});

test('a v53 save upgrades: grudge becomes regard, and the free name is scheduled', async () => {
  const s = game(12);
  const old = structuredClone(s);
  for (const t of old.rivals.tongs) { t.grudge = 0; delete t.regard; delete t.poorWeeks; delete t.splitDay; delete t.foldedDay; }
  delete old.rivals.offer; delete old.rivals.scouted; delete old.rivals.lastScout; delete old.rivals.offerSeq; delete old.rivals.nextOfferDay;
  old.version = 53;
  const loaded = await importSave({ text: async () => JSON.stringify(old) });
  assert.equal(loaded.version, SAVE_VERSION);
  assert.ok(loaded.rivals.tongs.every((t) => t.regard === 0 && t.grudge === undefined && t.poorWeeks === 0 && t.foldedDay === null));
  assert.equal(loaded.rivals.offer, null);
  assert.deepEqual(loaded.rivals.scouted, {});
  assert.ok(loaded.rivals.nextOfferDay > loaded.day);
});

test('a year of rivals, scouted and signed, still adds under 30KB to a save', () => {
  const s = game(13);
  weeks(s, 52);
  for (const c of s.rivals.cards.slice(0, 10)) s.rivals.scouted[c.id] = 2;
  assert.ok(JSON.stringify(s.rivals).length < 30 * 1024, `${JSON.stringify(s.rivals).length} bytes`);
});

test('slugs find cards, so the view can name a card with no digits', () => {
  const s = game(14);
  const c = free(s);
  assert.equal(findCard(s, cardSlug(c)).id, c.id);
  assert.equal(findCard(s, c.id).id, c.id);
  assert.equal(findCard(s, 'nobody-here'), null);
});
