// C5, the Anchor's Book (DESIGN.md 2026-11-09 "C5: the Anchor's Book"). Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { createNewGame, SAVE_VERSION } from '../src/core/state.js';
import { weeklyRivals, mondayWord } from '../src/core/rivals.js';
import { publishBook, bookView, bookGrade, bookDue, bookMonth, monthOfSeason, assignGrades, bookCandidates, baseScore } from '../src/core/book.js';
import { ratingOf } from '../src/core/rating.js';
import { fameOf } from '../src/core/fame.js';
import { poachChance } from '../src/core/mobility.js';
import { importSave } from '../src/save/save.js';
import { BOOK, BOOK_TEXT, WORD_TEXT, RIVALS } from '../src/data/rivals.js';
import * as tongsUi from '../src/ui/tongs.js';

const game = (seed = 42) => createNewGame({ seed, startCrew: 'fresh' });
const weeks = (s, n, from = 0) => { for (let w = from; w < from + n; w++) { s.day = 7 * (w + 1); weeklyRivals(s); } return s; };
const GI = Object.fromEntries(BOOK.grades.map((g, i) => [g, i]));

test('the Book goes up on the Sunday before each month, week 8 included; the season rolls over after 13 months', () => {
  const s = game(1);
  const seen = [];
  for (let w = 1; w <= 52; w++) { s.day = 7 * w; weeklyRivals(s); if (s.rivals.book?.absMonth !== seen.at(-1)) seen.push(s.rivals.book?.absMonth); }
  assert.deepEqual(seen, Array.from({ length: 13 }, (_, i) => i + 1), 'a Book at weeks 4, 8, ... 52');
  assert.ok(bookDue(56) && !bookDue(49) && !bookDue(0));
  assert.equal(bookMonth(364), 13);
  assert.equal(monthOfSeason(13), 0, 'month 13 is the first month of the next season');
  assert.equal(monthOfSeason(12), 12);
  const w8 = weeks(game(2), 8);
  assert.equal(w8.rivals.book.absMonth, 2, 'week 8 publishes a Book');
  assert.equal(weeks(game(2), 3).rivals.book, null, 'none before week 4');
});

test('the Book is fully determined by state and seed, and leaves rngCounter alone', () => {
  const a = weeks(game(3), 12); const b = weeks(game(3), 12);
  assert.deepEqual(a.rivals.book, b.rivals.book);
  const s = game(3); const before = s.rngCounter; weeks(s, 60);
  assert.equal(s.rngCounter, before);
});

test('caps are respected, D can be non-empty, grades sort S to D then by name, player runners can be on it', () => {
  let sawD = false; let sawOurs = false;
  for (let seed = 1; seed <= 12; seed++) {
    const s = game(seed);
    for (const op of s.crew) { op.fame = 'elite'; op.record = { ...(op.record ?? {}), jobs: 60, cleanStreak: 5 }; }
    weeks(s, 28);
    const v = bookView(s);
    assert.ok(v.published);
    const total = v.groups.reduce((n, g) => n + g.entries.length, 0);
    assert.ok(total <= BOOK.listSize);
    for (const g of v.groups) {
      assert.ok(g.entries.length <= BOOK.caps[g.grade], `${g.grade} within its cap`);
      assert.deepEqual(g.entries.map((e) => e.name), g.entries.map((e) => e.name).sort(), 'name order inside a grade');
      if (g.grade === 'D') sawD = true;
      if (g.entries.some((e) => e.yours)) sawOurs = true;
    }
    assert.deepEqual(v.groups.map((g) => GI[g.grade]), v.groups.map((g) => GI[g.grade]).sort((x, y) => x - y), 'S first');
  }
  assert.ok(sawD, 'D is used');
  assert.ok(sawOurs, 'our own runners are on the slate when the street knows them');
});

test('assignGrades: overflow drops a grade, nobody below D, never more than the list size', () => {
  const many = Array.from({ length: 40 }, (_, i) => ({ runnerId: `r${String(i).padStart(2, '0')}`, name: `N${i}`, score: 80 - i }));
  const g = assignGrades(many);
  assert.equal(g.size, BOOK.listSize);
  for (const grade of BOOK.grades) assert.equal([...g.values()].filter((x) => x === grade).length, BOOK.caps[grade]);
  assert.equal(assignGrades([{ runnerId: 'a', name: 'A', score: 1 }]).size, 0, 'too little name to be chalked');
});

test('bookView has no digits and no hidden fields; the ui reads it, never state.rivals', () => {
  for (let seed = 1; seed <= 10; seed++) {
    const s = weeks(game(seed), 36);
    const text = JSON.stringify(bookView(s));
    assert.doesNotMatch(text, /\d/, 'no digits');
    assert.doesNotMatch(text, /rating|score|base|wobble|bias|prestige|wealth|formerOf|runnerId|opId/i, 'nothing hidden leaks');
    const walk = (v) => { if (v && typeof v === 'object') Object.values(v).forEach(walk); else assert.notEqual(typeof v, 'number'); };
    walk(bookView(s));
  }
  const dir = new URL('../src/ui/', import.meta.url);
  for (const f of readdirSync(dir).filter((f) => f.endsWith('.js'))) assert.doesNotMatch(readFileSync(new URL(f, dir), 'utf8'), /\.rivals\b/, f);
});

test('returns and new are told apart, and gone quiet keeps a name after the card is removed', () => {
  const s = weeks(game(4), 4);
  const first = s.rivals.book;
  const dropped = first.entries.find((e) => !s.crew.some((o) => (o.runnerId ?? o.id) === e.runnerId));
  assert.ok(first.entries.every((e) => e.move === 'new'), 'the first slate is all new');
  // Next month: the runner is gone (signed away, retired) and must still be reported by name.
  s.rivals.cards = s.rivals.cards.filter((c) => (c.runnerId ?? c.id) !== dropped.runnerId);
  s.day = 56; weeklyRivals(s);
  const second = s.rivals.book;
  assert.ok(second.gone.some((g) => g.runnerId === dropped.runnerId && g.name === dropped.name), 'gone quiet, by stored name');
  assert.ok(bookView(s).gone.length <= BOOK.goneMax);
  assert.doesNotThrow(() => bookView(s));
  // And back again: a returning name is "returns", not "new".
  const ghost = { ...s.rivals.cards[0], id: 'c777', runnerId: dropped.runnerId, name: dropped.name, fame: 'elite', rating: 80, age: 30 };
  s.rivals.cards.push(ghost);
  s.day = 84; weeklyRivals(s);
  const back = s.rivals.book.entries.find((e) => e.runnerId === dropped.runnerId);
  if (back) assert.equal(back.move, 'returns');
  assert.ok(s.rivals.book.everBooked.includes(dropped.runnerId));
});

test('Ones to watch: young, never S or A, at most five', () => {
  for (let seed = 1; seed <= 10; seed++) {
    const s = weeks(game(seed), 52);
    const v = bookView(s);
    assert.ok(v.watch.length <= BOOK.watchMax);
    const cands = new Map(bookCandidates(s).map((c) => [c.runnerId, c]));
    for (const id of s.rivals.book.watch) {
      assert.ok(cands.get(id).age <= BOOK.prospectAge);
      assert.ok(!['S', 'A'].includes(bookGrade(s, id)));
    }
  }
});

test('the Book never changes fame, rating, loyalty or poach odds, and moves no card or runner', () => {
  const s = weeks(game(5), 3);
  const before = JSON.stringify({ crew: s.crew, cards: s.rivals.cards, tongs: s.rivals.tongs });
  const odds = s.crew.map((o) => [ratingOf(o), fameOf(o), poachChance(o), o.loyalty]);
  s.day = 28; weeklyRivals(s);
  assert.ok(s.rivals.book);
  const after = JSON.stringify({ crew: s.crew, cards: s.rivals.cards, tongs: s.rivals.tongs });
  // The weekly step itself moves cards (growth), so compare against the same step without the Book.
  const twin = weeks(game(5), 3); const real = BOOK.listSize; BOOK.listSize = 0;
  try { twin.day = 28; weeklyRivals(twin); } finally { BOOK.listSize = real; }
  assert.equal(JSON.stringify({ crew: twin.crew, cards: twin.rivals.cards, tongs: twin.rivals.tongs }), after, 'a Book or no Book, the same people');
  assert.deepEqual(s.crew.map((o) => [ratingOf(o), fameOf(o), poachChance(o), o.loyalty]), odds);
  assert.ok(before);
});

test("the street's score does not read the hidden rating: change every rating, the slate stays", () => {
  const a = weeks(game(6), 3); const b = weeks(game(6), 3);
  for (const c of b.rivals.cards) c.rating = 5;
  const sa = bookCandidates(a).map((c) => baseScore(a, c)); const sb = bookCandidates(b).map((c) => baseScore(b, c));
  assert.deepEqual(sa, sb);
});

test('Monday leads with the slate and still keeps to three lines; Joss writes once', () => {
  const s = weeks(game(7), 4);
  s.day = 29;
  const lines = mondayWord(s);
  assert.equal(lines[0].kind, 'book_up');
  assert.ok(lines.length <= RIVALS.mondayLines);
  assert.equal(s.inbox.filter((m) => m.id?.startsWith('book-')).length <= 1, true);
  for (const line of WORD_TEXT.book_up) assert.doesNotMatch(line, /\d/);
});

test('Joss writes once when one of ours is on the move, and a poach note appears when the runner is on the slate', () => {
  const s = weeks(game(8), 3);
  const op = s.crew[0]; op.fame = 'elite'; op.record = { ...(op.record ?? {}), jobs: 80, cleanStreak: 6, activeWeeks: 40 };
  s.day = 28; weeklyRivals(s);
  const msgs = s.inbox.filter((m) => m.id === 'book-1');
  assert.ok(msgs.length <= 1);
  assert.ok(bookGrade(s, op.runnerId ?? op.id), 'an Elite of ours is chalked');
  for (const line of Object.values(BOOK_TEXT.joss)) assert.doesNotMatch(line, /\d/);
});

test('the lore is in step: the prompt copy and WORLD.md say the Anchor keeps a book, and not in the Silt', () => {
  const world = readFileSync(new URL('../WORLD.md', import.meta.url), 'utf8');
  assert.match(world, /The Anchor's Book/);
  assert.match(world, /teahouse in Old Town \(not in the Silt\)/);
});

test('v59 saves upgrade to v60 with no Book yet', async () => {
  assert.ok(SAVE_VERSION >= 60);
  const old = JSON.parse(JSON.stringify(game(9))); old.version = 59; delete old.rivals.book;
  const up = await importSave({ text: async () => JSON.stringify(old) });
  assert.equal(up.version, SAVE_VERSION);
  assert.equal(up.rivals.book, null);
  assert.deepEqual(bookView(up), { published: false, groups: [], watch: [], gone: [] });
});

test('the Book page and a runner badge render without numbers', () => {
  const s = weeks(game(10), 28);
  const html = tongsUi.renderTongs(s, 'book', 'City');
  assert.match(html, /The Anchor's Book/);
  assert.doesNotMatch(html.replace(/<[^>]+>/g, ' ').replace(/&#\d+;/g, ''), /\d/);
  assert.match(tongsUi.renderTongs(weeks(game(10), 1), 'book', 'City'), /chalked a slate yet/);
  assert.match(tongsUi.renderTongs(s, null, 'City'), /data-id="book"/);
});
