// E3 (2026-11-14): what we know goes stale, watching a tong, the name they keep quiet, the slate against what we know.
// Reads have a date; a stale read loses detail; a quiet name stays off the street until a rule reveals it; none of it touches the
// player's money, heat, halls or rolls. Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame, SAVE_VERSION } from '../src/core/state.js';
import { advanceDay } from '../src/core/time.js';
import { weeklyRivals, rivalView, namesOnTheStreet } from '../src/core/rivals.js';
import { bookView, bookCandidates, baseScore } from '../src/core/book.js';
import { importSave } from '../src/save/save.js';
import { isQuiet, quietStep, rosterOf, unsettledOf } from '../src/core/houses.js';
import { levelInEffect, houseLevel, ageOf } from '../src/core/reads.js';
import { scoutTrip, sendWatch, buyoutAmount, buyoutFor, persuasion, readFor, findCard, scoutLevel } from '../src/core/dossier.js';
import { returnSideTasks } from '../src/core/sidetasks.js';
import { renderTongs } from '../src/ui/tongs.js';
import { WATCH, RIVALS, HABIT, READ_AGE } from '../src/data/rivals.js';

const game = (seed = 42) => createNewGame({ seed, startCrew: 'fresh' });
const step = (s, w) => { s.day = 7 * (w + 1); weeklyRivals(s); };
const weeks = (s, n) => { for (let w = 0; w < n; w++) step(s, w); return s; };
const active = (s) => s.rivals.tongs.filter((t) => t.status === 'active');
const withRoster = (s, min = 4) => active(s).find((t) => rosterOf(s.rivals, t).length >= min);
const asRead = (s, card, level, day = s.day) => { s.rivals.scouted[card.id] = { level, day, band: bandNow(card), tongId: card.tongId ?? null }; };
const bandNow = (c) => (c.rating < RIVALS.cardBands[0] ? 'rookie' : c.rating < RIVALS.cardBands[1] ? 'pro' : 'veteran');
const watched = (s, t, level, day = s.day) => { s.rivals.houseRead[t.id] = { level, day }; };
const NAME_KEYS = new Set(['name', 'names', 'head', 'tong']);
function walk(v, path, visit) {
  if (Array.isArray(v)) v.forEach((x) => walk(x, path, visit));
  else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) walk(x, k, visit);
  else visit(v, path);
}
const noDigits = (obj, label) => walk(obj, '', (v, key) => {
  assert.notEqual(typeof v, 'number', `a number at ${label}.${key}`);
  if (typeof v === 'string' && !NAME_KEYS.has(key)) assert.doesNotMatch(v, /\d/, `digits at ${label}.${key}: ${v}`);
});
const freeOp = (s) => s.crew.find((o) => !o.freelance && o.condition.injury === 'healthy');

test('an old save keeps every read at its level, dated the day it loads, with no quiet names and no house read', async () => {
  const s = game(9); weeks(s, 6);
  const [a, b] = s.rivals.cards;
  s.rivals.scouted = { [a.id]: 2, [b.id]: 1 };
  delete s.rivals.houseRead; delete s.rivals.quietSince; for (const c of s.rivals.cards) delete c.quiet; // as a v71 save has them
  s.version = 71;
  const loaded = await importSave({ text: async () => JSON.stringify(s) });
  assert.equal(loaded.version, SAVE_VERSION);
  for (const [c, level] of [[a, 2], [b, 1]]) {
    const read = loaded.rivals.scouted[c.id];
    assert.equal(read.level, level); assert.equal(read.day, loaded.day);
    assert.equal(levelInEffect(loaded, c), level, 'the level in effect is what it was');
  }
  assert.deepEqual(loaded.rivals.houseRead, {});
  // Nobody already seated is looked at for a quiet name, however many Sundays pass.
  for (let w = 7; w < 30; w++) step(loaded, w);
  const old = new Set(s.rivals.cards.filter((c) => c.tongId).map((c) => c.id));
  assert.ok(!loaded.rivals.cards.some((c) => old.has(c.id) && c.quiet === true && c.since <= loaded.rivals.quietSince), 'no old name is made quiet');
});

test("a read's level in effect never rises on its own, and falls one for every twelve weeks and for a change", () => {
  const s = game(5); weeks(s, 4);
  const card = s.rivals.cards.find((c) => c.tongId);
  asRead(s, card, 3);
  let last = 3;
  for (let d = 0; d <= 60 * 7; d += 7) {
    s.day = 28 + d;
    const now = levelInEffect(s, card);
    assert.ok(now <= last, `rose from ${last} to ${now}`); last = now;
  }
  assert.equal(last, 0);
  s.day = 100; asRead(s, card, 3, 100);
  s.day = 100 + 12 * 7 - 1; assert.equal(levelInEffect(s, card), 3);
  s.day = 100 + 12 * 7; assert.equal(levelInEffect(s, card), 2);
  s.day = 100 + 24 * 7; assert.equal(levelInEffect(s, card), 1);
  s.day = 100 + 40 * 7; assert.equal(levelInEffect(s, card), 0, 'never under 0');
  // A change (they move house) is one more step down, and the profile says so.
  s.day = 101; asRead(s, card, 3, 100);
  const other = active(s).find((t) => t.id !== card.tongId);
  card.tongId = other.id;
  assert.equal(levelInEffect(s, card), 2);
  const r = readFor(s, card);
  assert.equal(r.changed, true); assert.equal(r.level, 'sharper');
  assert.equal(r.stats !== null, true);
  // And a read that has fallen to nothing shows no figures at all.
  s.day = 100 + 80 * 7;
  assert.equal(readFor(s, card).stats, null); assert.equal(readFor(s, card).potential, null);
});

test('a good trip raises the level in effect by one, resets the date and keeps the card as it is now', () => {
  const s = game(5); weeks(s, 4);
  const card = s.rivals.cards.find((c) => c.tongId);
  asRead(s, card, 2, s.day);
  s.day += 12 * 7 * 2; // two steps down: level 0 in effect
  assert.equal(levelInEffect(s, card), 0);
  const op = freeOp(s); op.stats.social = 30; // a good trip whatever the die says
  const next = scoutTrip(s, card.id, op.id);
  const read = next.rivals.scouted[card.id];
  assert.equal(read.level, 1, 'one above what was in effect, not one above what was stored');
  assert.equal(read.day, s.day); assert.equal(read.tongId, card.tongId);
  assert.equal(scoutLevel(next, card), 1);
});

test("the age of a read is a word, and the view and the page show no digit for it", () => {
  const s = game(3); weeks(s, 6);
  const card = s.rivals.cards.find((c) => c.tongId);
  asRead(s, card, 2, s.day);
  assert.equal(ageOf(s, s.rivals.scouted[card.id]), 'month');
  s.day += 60; assert.equal(ageOf(s, s.rivals.scouted[card.id]), 'season');
  s.day += 300; assert.equal(ageOf(s, s.rivals.scouted[card.id]), 'long');
  for (const w of Object.values(READ_AGE)) assert.doesNotMatch(w, /\d/);
  noDigits(readFor(s, card), 'readFor');
  assert.equal(readFor(s, findCard(s, s.rivals.cards.find((c) => c !== card).id)).age, null, 'never watched: no age');
});

test('the tong card shows "?" before any watching and the chip only after', () => {
  const s = weeks(game(7), 8); const t = withRoster(s);
  assert.equal(rivalView(s).tiers.flatMap((x) => x.tongs).find((x) => x.id === t.id).state, null);
  const before = renderTongs(s);
  assert.match(before, /chip--state chip--unknown[^>]*>\?</);
  assert.doesNotMatch(before, /chip--state chip--(flush|steady|stretched|selling)/, 'no state word without watching');
  watched(s, t, 1);
  const v = rivalView(s).tiers.flatMap((x) => x.tongs).find((x) => x.id === t.id);
  assert.ok(['flush', 'steady', 'stretched', 'selling'].includes(v.state));
  assert.match(renderTongs(s), new RegExp(`chip--state chip--${v.state}`));
  // Stale after eight weeks a level: the chip goes back to "?".
  s.day += WATCH.houseStaleWeeks * 7;
  assert.equal(houseLevel(s, t.id), 0);
  assert.equal(rivalView(s).tiers.flatMap((x) => x.tongs).find((x) => x.id === t.id).state, null);
});

test('without a read a tong shows its head and public names only; level 1 shows the whole table and what it is after', () => {
  let seen = false;
  for (let seed = 1; seed <= 20 && !seen; seed++) {
    const s = weeks(game(seed), 10);
    for (const t of active(s)) {
      const all = rosterOf(s.rivals, t);
      const hidden = all.filter((c) => c.id !== t.headId && c.fame === 'unknown' && !s.rivals.book?.entries.some((e) => e.runnerId === (c.runnerId ?? c.id)));
      if (!hidden.length) continue;
      seen = true;
      const view = () => rivalView(s).tiers.flatMap((x) => x.tongs).find((x) => x.id === t.id);
      const v0 = view();
      assert.equal(v0.others, true); assert.ok(v0.table.length < all.length);
      assert.ok(v0.table.some((n) => n.head), 'the head is always there');
      assert.equal(v0.looking, null);
      watched(s, t, 1);
      const v1 = view();
      assert.equal(v1.others, false); assert.equal(v1.table.length, all.length);
      assert.ok(v1.looking);
      assert.ok(v1.table.every((n) => !n.unsettled), 'no one is unsettled before level 2');
      break;
    }
  }
  assert.ok(seen, 'found a tong with an unknown name');
});

test('a quiet name is off the street, off the slate and off the file until a rule reveals it', () => {
  const was = WATCH.quietChance; WATCH.quietChance = 1;
  try {
    const s = weeks(game(14), 6);
    const t = active(s)[0]; t.style = 'quiet';
    for (const c of s.rivals.cards) if (c.tongId === t.id) c.quiet = false;
    const pick = rosterOf(s.rivals, t).find((c) => c.id !== t.headId);
    pick.age = 22; pick.rating = 60; pick.peak = 60; pick.form = 0; pick.fame = 'respected'; pick.quiet = undefined; pick.since = s.day;
    quietStep(s, s.rivals);
    assert.equal(pick.quiet, true); assert.ok(isQuiet(pick));
    assert.equal(rosterOf(s.rivals, t).filter(isQuiet).length, 1, 'one per tong');
    assert.ok(!namesOnTheStreet(s).some((n) => n.name === pick.name), 'not on the street');
    assert.ok(!bookCandidates(s).some((c) => c.name === pick.name), 'not a candidate');
    s.day = 28; weeklyRivals(s);
    assert.ok(!bookView(s).groups.some((g) => g.entries.some((e) => e.name === pick.name)), 'not chalked');
    const entry = () => rivalView(s).tiers.flatMap((x) => x.tongs).find((x) => x.id === t.id).table.find((n) => n.name === pick.name);
    assert.equal(entry(), undefined, 'not on the file before we watch');
    watched(s, t, 1);
    assert.equal(entry().quiet, true, 'level 1 shows them as the one they do not talk about');
    assert.match(renderTongs(s, t.id), /one they don(&#39;|')t talk about/);
    assert.ok(!namesOnTheStreet(s).some((n) => n.name === pick.name), 'still not on the street');
    // Elite, or leaving: out in the open.
    pick.fame = 'elite'; quietStep(s, s.rivals);
    assert.ok(!isQuiet(pick));
    pick.fame = 'respected'; pick.quiet = true; pick.tongId = null;
    assert.ok(!isQuiet(pick), 'free again: not quiet');
  } finally { WATCH.quietChance = was; }
});

test('quiet names are rare, only at a quiet-style or short-table house, only young and rising, one a house', () => {
  let quiet = 0;
  for (let seed = 1; seed <= 25; seed++) {
    const s = weeks(game(seed), 40);
    for (const t of active(s)) {
      const q = rosterOf(s.rivals, t).filter(isQuiet);
      assert.ok(q.length <= 1);
      for (const c of q) { quiet++; assert.ok(t.style === 'quiet' || t.habit === 'boutique'); assert.notEqual(c.id, t.headId); }
    }
  }
  assert.ok(quiet > 0, 'the rule fires');
});

test("the Book's street score still ignores the hidden rating, and a slate mark comes only from our own read at level 2 or more", () => {
  const s = weeks(game(11), 30);
  const cands = bookCandidates(s);
  const before = cands.map((c) => baseScore(s, c));
  for (const c of s.rivals.cards) c.rating = 95 - c.rating;
  assert.deepEqual(bookCandidates(s).map((c) => baseScore(s, c)), before);
  const v = bookView(s);
  assert.ok(v.groups.flatMap((g) => g.entries).every((e) => e.mark === null), 'no mark without a read');
  // Our read: a name the slate puts at C that we have seen is far better (or worse) is marked, at level 2 and not before.
  const e = v.groups.flatMap((g) => g.entries).find((x) => x.id && !x.yours);
  const card = findCard(s, e.id);
  const grades = ['S', 'A', 'B', 'C', 'D'];
  const g = grades.indexOf(v.groups.find((x) => x.entries.includes(e)).grade);
  card.rating = g >= 2 ? 90 : 12; // far from the grade the slate gave
  asRead(s, card, 1);
  assert.equal(bookView(s).groups.flatMap((x) => x.entries).find((x) => x.id === e.id).mark, null, 'level 1 is not enough');
  asRead(s, card, 2);
  const m = bookView(s).groups.flatMap((x) => x.entries).find((x) => x.id === e.id).mark;
  assert.equal(m, g >= 2 ? 'sells_short' : 'flatters');
  assert.equal(readFor(s, card).slate, m);
  noDigits(bookView(s), 'book');
});

test('an unsettled name costs x0.85 in buyout and asks 5 points less premium, only at level 2, and only for us', () => {
  const s = weeks(game(8), 30);
  const t = active(s).find((x) => rosterOf(s.rivals, x).length >= 4);
  t.habit = 'grinder'; t.wealth = 12000; t.regard = 0;
  const pool = rosterOf(s.rivals, t).filter((c) => c.id !== t.headId);
  const card = pool[0]; card.age = 31; card.bestDay = -1000; card.best = card.rating; card.listedDay = undefined; delete card.listedDay;
  s.rivals.threads = s.rivals.threads.filter((x) => x.tongId !== t.id);
  assert.ok(unsettledOf(s.rivals, t, s.day).some((c) => c.id === card.id), 'a stalled name at a grinder is unsettled');
  const base = buyoutFor(s, card); const prem = persuasion(s, card).premium;
  watched(s, t, 1);
  assert.equal(buyoutFor(s, card), base, 'level 1: no change'); assert.equal(persuasion(s, card).premium, prem);
  watched(s, t, 2);
  assert.ok(buyoutFor(s, card) < base);
  assert.equal(buyoutFor(s, card), buyoutAmount(t, buyoutBase(s, card), false, true));
  assert.equal(persuasion(s, card).premium, Math.max(0, Math.round((prem - 0.05) * 100) / 100));
  assert.equal(readFor(s, card).unsettled, true);
  // The tong's own books never use it: a rival paying a rival is the same price.
  assert.equal(buyoutAmount(t, 1000, false), buyoutAmount(t, 1000, false, false));
  assert.ok(buyoutAmount(t, 1000, false, true) < buyoutAmount(t, 1000, false));
  // Stale: after the read has aged two steps it is level 0 again.
  s.day += WATCH.houseStaleWeeks * 7 * 2;
  assert.equal(buyoutFor(s, card), base);
  assert.equal(readFor(s, card).unsettled, false);
});
// The wage a card would ask, for pricing: the dossier's own market wage.
import { dossierOf } from '../src/core/dossier.js';
const buyoutBase = (s, card) => dossierOf(s, card).wage;

test('watching a tong: three days away, one good trip is one level, never more than two, and nothing moves the rolls', () => {
  const s = weeks(game(6), 8); const t = withRoster(s);
  const op = freeOp(s); op.stats.social = 30;
  const sent = sendWatch(s, t.id, op.id);
  assert.notEqual(sent, s);
  assert.equal(sent.sideOut.at(-1).returnDay, s.day + WATCH.days);
  assert.equal(sendWatch(sent, t.id, sent.crew.find((o) => o !== sent.crew.find((x) => x.id === op.id) && !o.freelance && o.condition.awayUntil == null)?.id ?? op.id), sent, 'one watcher at a time');
  const done = structuredClone(sent); done.day = sent.sideOut.at(-1).returnDay;
  const counter = done.rngCounter;
  returnSideTasks(done);
  assert.equal(done.rngCounter, counter, 'the trip never moves rngCounter');
  assert.equal(done.rivals.houseRead[t.id].level, 1);
  assert.equal(houseLevel(done, t.id), 1);
  // A second trip: level 2, and a third is refused (nothing more to learn).
  const again = sendWatch(done, t.id, op.id); assert.notEqual(again, done);
  again.day = again.sideOut.at(-1).returnDay; returnSideTasks(again);
  assert.equal(houseLevel(again, t.id), 2);
  assert.equal(sendWatch(again, t.id, op.id), again);
  // A miss tells us nothing.
  const weak = freeOp(s); weak.stats.social = -100;
  const miss = sendWatch(s, t.id, weak.id); miss.day = miss.sideOut.at(-1).returnDay; returnSideTasks(miss);
  assert.equal(houseLevel(miss, t.id), 0);
});

test('the view walk finds no digits or numbers in a read, a chip, the file or the table, at every level', () => {
  for (let seed = 1; seed <= 10; seed++) {
    const s = weeks(game(seed), 36);
    for (const level of [0, 1, 2]) {
      for (const t of active(s)) if (level) watched(s, t, level); else delete s.rivals.houseRead[t.id];
      const v = rivalView(s);
      for (const t of v.tiers.flatMap((x) => x.tongs)) { noDigits(t.read, 'read'); noDigits(t.table, 'table'); noDigits({ s: t.state, l: t.looking, o: t.others }, 'chip'); }
      noDigits(bookView(s), 'book');
    }
    const html = renderTongs(s).replace(/<[^>]+>/g, ' ');
    assert.doesNotMatch(html.replace(/&#\d+;/g, ''), /\d/, 'no digits on the page');
  }
});

test('with the player doing nothing, cash, heat and halls match a run with no rivals at all', () => {
  const a = game(23); const b = structuredClone(a); b.rivals = null;
  let x = a; let y = b;
  for (let i = 0; i < 52 * 7; i++) { x = advanceDay(x); y = advanceDay(y); }
  assert.equal(x.rngCounter, y.rngCounter);
  assert.equal(x.cash, y.cash);
  assert.deepEqual(x.heat, y.heat);
  assert.deepEqual(x.halls, y.halls);
  assert.deepEqual(x.crew, y.crew);
});

test('the state chip never tells more than its four words, and a tong in trouble reads ahead of the street', () => {
  const s = weeks(game(12), 20); const t = active(s)[0];
  watched(s, t, 1);
  const word = () => rivalView(s).tiers.flatMap((x) => x.tongs).find((x) => x.id === t.id).state;
  s.rivals.threads = s.rivals.threads.filter((x) => x.tongId !== t.id);
  t.strain = 0; t.wealth = 0; assert.equal(word(), 'steady');
  t.wealth = 10 ** 7; assert.equal(word(), 'flush');
  t.strain = 1; assert.equal(word(), 'stretched', 'one strained Sunday already reads as stretched: ahead of the story');
  s.rivals.threads.push({ id: 'x', tongId: t.id, family: 'overreach', stage: 'selling', open: true });
  assert.equal(word(), 'selling');
});
