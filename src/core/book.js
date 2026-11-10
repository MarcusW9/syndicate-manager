// The Anchor's Book (C5; DESIGN.md 2026-11-09 "C5: the Anchor's Book"; WORLD.md "The Anchor's Book").
// Once a month the Brass Anchor's elders chalk grades for the city's runners. It is the street's OPINION: built from
// what is public (fame, form, age) plus a lasting bias and a small monthly wobble, never from the hidden rating, so it
// can flatter a show-off and miss a quiet one. Flavour only: the Book does not feed fame, rating, standing, rolls, pay,
// heat, loyalty or poach odds (a test checks the state it touches).
//
// ISOLATION: hashRng only, never nextRng. Keys: 'book-bias:' + runnerId, 'book:' + absMonth + ':' + runnerId.
// The street score is a hidden integer and is never shown. One bookkeeping map (`book.base`, last month's score without
// the wobble) is kept so a rise can be read for Ones to watch; the view never exposes it.
// Pure logic: 32-bit integer hashing over ASCII keys, whole numbers stored.

import { hashRng } from './rng.js';
import { BOOK, BOOK_TEXT, BOOK_LEAD, fill } from '../data/rivals.js';
import { ratingOf } from './rating.js';
import { fameOf } from './fame.js';
import { recordOf } from './record.js';

const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
const slug = (name) => name.toLowerCase().replace(/&/g, '').replace(/[^a-z]+/g, '-').replace(/^-|-$/g, '');
const GRADE_INDEX = Object.fromEntries(BOOK.grades.map((g, i) => [g, i]));

// --- Time: months are four weeks; a season is 13 of them (364 days). ---

export const DAYS_PER_MONTH = 28;
/** The month a day falls in, counted from the start of the game (absolute across seasons). */
export const bookMonth = (day) => Math.floor(day / DAYS_PER_MONTH);
/** The month within its season, 0-12. */
export const monthOfSeason = (absMonth) => absMonth % 13;
/** The Book goes up on the Sunday before a month's first Monday. */
export const bookDue = (day) => day > 0 && day % DAYS_PER_MONTH === 0;

// --- Candidates ---

/** A runner of ours as a form on the card scale (-5..5). No last-four results are kept, so it comes from the clean streak. */
export function formOfOperative(op) {
  const r = recordOf(op);
  if (!r.jobs) return 0;
  return r.cleanStreak === 0 ? -2 : clamp(r.cleanStreak - 1, -2, 3);
}

/** Everyone the street talks about: every rival card (heads too), free names, and our own runners. `rating` is the hidden truth, for audits only. */
export function bookCandidates(state) {
  const r = state.rivals;
  const tongs = new Map((r?.tongs ?? []).map((t) => [t.id, t]));
  const out = [];
  for (const c of r?.cards ?? []) {
    const tong = tongs.get(c.tongId);
    out.push({
      runnerId: c.runnerId ?? c.id, name: c.name, age: c.age, fame: c.fame, form: c.form ?? 0,
      style: tong?.status === 'active' ? tong.style : null, rating: c.rating, own: false,
    });
  }
  for (const op of state.crew ?? []) {
    if (op.freelance || op.condition?.injury === 'dead') continue;
    out.push({ runnerId: op.runnerId ?? op.id, name: op.name, age: op.age, fame: fameOf(op), form: formOfOperative(op), style: null, rating: ratingOf(op), own: true });
  }
  return out;
}

// --- The street score (hidden) ---

const ageTrend = (age) => (BOOK.ageTrend.find(([upTo]) => age <= upTo) ?? [0, 0])[1];

/** The score without this month's wobble: public fame, form and age, plus a lasting bias for this runner. */
export function baseScore(state, cand) {
  const u = hashRng(state.seed, 'book-bias:' + cand.runnerId)();
  const bias = Math.round((u * 2 - 1) * BOOK.biasSpread + (BOOK.styleSkew[cand.style] ?? 0) + (BOOK.fameSkew[cand.fame] ?? 0));
  return (BOOK.famePoints[cand.fame] ?? 0) + cand.form * BOOK.formWeight + ageTrend(cand.age) + bias;
}
const wobbleOf = (state, absMonth, cand) => Math.round((hashRng(state.seed, 'book:' + absMonth + ':' + cand.runnerId)() * 2 - 1) * BOOK.wobble);

/**
 * Grades for a list of { runnerId, name, score }: best score first, each name takes the best grade its score earns that still
 * has room (the caps push the overflow down), nobody below D's threshold, never more than listSize. Pure.
 */
export function assignGrades(scored) {
  const used = Object.fromEntries(BOOK.grades.map((g) => [g, 0]));
  const sorted = [...scored].sort((a, b) => b.score - a.score || (a.runnerId < b.runnerId ? -1 : 1));
  const out = new Map();
  for (const s of sorted) {
    if (out.size >= BOOK.listSize) break;
    let i = BOOK.grades.findIndex((g) => s.score >= BOOK.thresholds[g]);
    if (i < 0) break;
    while (i < BOOK.grades.length && used[BOOK.grades[i]] >= BOOK.caps[BOOK.grades[i]]) i++;
    if (i >= BOOK.grades.length) continue;
    used[BOOK.grades[i]]++;
    out.set(s.runnerId, BOOK.grades[i]);
  }
  return out;
}

// --- Publishing ---

const byGradeThenName = (a, b) => GRADE_INDEX[a.grade] - GRADE_INDEX[b.grade] || (a.name < b.name ? -1 : 1);

/**
 * Sunday before a month's first Monday (core/rivals.js weeklyRivals calls this at the end of its step). Mutates `state.rivals.book`
 * and adds the word's lead line and, at most once, a message from Joss. Never touches a runner, a card or a roll.
 */
export function publishBook(state) {
  const r = state.rivals;
  if (!r || !bookDue(state.day)) return state;
  const absMonth = bookMonth(state.day);
  if (r.book?.absMonth === absMonth) return state;

  const cands = bookCandidates(state);
  const base = Object.fromEntries(cands.map((c) => [c.runnerId, baseScore(state, c)]));
  const grades = assignGrades(cands.map((c) => ({ runnerId: c.runnerId, name: c.name, score: base[c.runnerId] + wobbleOf(state, absMonth, c) })));
  const prev = r.book?.entries ?? [];
  const prevGrade = new Map(prev.map((e) => [e.runnerId, e.grade]));
  const ever = new Set(r.book?.everBooked ?? []);

  const entries = cands.filter((c) => grades.has(c.runnerId)).map((c) => {
    const grade = grades.get(c.runnerId);
    const before = prevGrade.get(c.runnerId);
    const move = before === undefined ? (ever.has(c.runnerId) ? 'returns' : 'new')
      : GRADE_INDEX[grade] < GRADE_INDEX[before] ? 'up' : GRADE_INDEX[grade] > GRADE_INDEX[before] ? 'down' : 'steady';
    return { runnerId: c.runnerId, name: c.name, grade, move };
  }).sort(byGradeThenName);

  // Gone quiet: on last month's slate, off this one (a stored name, so a retired or folded card is safe). Up to three.
  const now = new Set(entries.map((e) => e.runnerId));
  const gone = prev.filter((e) => !now.has(e.runnerId)).sort(byGradeThenName).slice(0, BOOK.goneMax).map((e) => ({ runnerId: e.runnerId, name: e.name }));

  // Ones to watch: young names not on the S or A line with the biggest rise in the score (the wobble left out). The rise is never shown.
  const oldBase = r.book?.base ?? {};
  const watch = cands
    .filter((c) => c.age <= BOOK.prospectAge && !['S', 'A'].includes(grades.get(c.runnerId)) && oldBase[c.runnerId] !== undefined && base[c.runnerId] > oldBase[c.runnerId])
    .sort((a, b) => (base[b.runnerId] - oldBase[b.runnerId]) - (base[a.runnerId] - oldBase[a.runnerId]) || (a.name < b.name ? -1 : 1))
    .slice(0, BOOK.watchMax).map((c) => c.runnerId);

  for (const e of entries) ever.add(e.runnerId);
  r.book = {
    absMonth, entries, watch, gone, everBooked: [...ever].sort(), base,
    prev: { absMonth: r.book?.absMonth ?? null, entries: prev.map(({ runnerId, name, grade }) => ({ runnerId, name, grade })) },
  };

  // The street's talk: the slate is up (first in Monday's lines).
  r.word.push({ day: state.day, kind: BOOK_LEAD, refs: [] });

  // Joss, once, if one of ours went up, reached S, or is down as one to watch.
  const ours = new Map(cands.filter((c) => c.own).map((c) => [c.runnerId, state.crew.find((o) => (o.runnerId ?? o.id) === c.runnerId)]));
  const lines = [];
  for (const e of entries) {
    const op = ours.get(e.runnerId); if (!op) continue;
    if (e.grade === 'S' && e.move !== 'steady') lines.push(fill(BOOK_TEXT.joss.top, { op: op.handle }));
    else if (e.move === 'up') lines.push(fill(BOOK_TEXT.joss.up, { op: op.handle }));
  }
  for (const id of watch) { const op = ours.get(id); if (op) lines.push(fill(BOOK_TEXT.joss.watch, { op: op.handle })); }
  if (lines.length) {
    state.inbox.unshift({
      id: `book-${absMonth}`, type: 'crew', day: state.day, subject: BOOK_TEXT.joss.subject,
      body: [BOOK_TEXT.joss.intro, ...lines].join(' '), blocking: false, read: false,
    });
  }
  return state;
}

// --- The view (the only thing the UI reads) ---

/** A runner's current grade on the slate, or null. Used for a runner's own page and a name's profile. */
export function bookGrade(state, runnerId) {
  return state.rivals?.book?.entries.find((e) => e.runnerId === runnerId)?.grade ?? null;
}

/**
 * This month's slate for the screen: letters, move words, proper names, a tong's name or null for "free". No numbers, no ratings.
 * Grades S to D, names in order within a grade; that is the only order.
 */
export function bookView(state) {
  const r = state.rivals; const book = r?.book;
  if (!book) return { published: false, groups: [], watch: [], gone: [] };
  const crew = new Map((state.crew ?? []).map((o) => [o.runnerId ?? o.id, o]));
  const cards = new Map((r.cards ?? []).map((c) => [c.runnerId ?? c.id, c]));
  const tongName = (card) => r.tongs.find((t) => t.id === card?.tongId && t.status === 'active')?.name ?? null;
  const who = (runnerId, name) => { // letters and words only: no ids with digits leave here (ours are found by name)
    const op = crew.get(runnerId); const card = cards.get(runnerId);
    return { name, yours: !!op, id: card ? slug(card.name) : null, tong: op ? null : tongName(card), free: !op && !!card && !card.tongId };
  };
  const groups = BOOK.grades.map((grade) => ({
    grade, entries: book.entries.filter((e) => e.grade === grade).map((e) => ({ ...who(e.runnerId, e.name), move: e.move })),
  })).filter((g) => g.entries.length);
  const nameOf = (id) => crew.get(id)?.name ?? cards.get(id)?.name ?? null;
  return {
    published: true, groups,
    watch: book.watch.map((id) => ({ ...who(id, nameOf(id)) })).filter((w) => w.name).sort((a, b) => (a.name < b.name ? -1 : 1)),
    gone: book.gone.map((g) => ({ name: g.name })),
  };
}
