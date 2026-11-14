// E3 (DESIGN.md 2026-11-14 "E3"; drafts/PROPOSAL-tong-depth.md section 4): what we know has a date.
// A read of a name is `{ level, day, band, tongId }`; a read of a tong is `{ level, day }`. The level in effect falls with time and
// with change; only a good trip raises it. A dossier is never saved (docs/RIVAL-TONGS.md rule 6), so a stale read loses detail
// instead of showing old figures. Pure functions over state; no roll here (the trips' rolls are in dossier.js).
// Nothing in this file is shown as a number: the screen gets a level word, an age word and yes/no.

import { RIVALS, WATCH } from '../data/rivals.js';
import { cardRating } from './rating.js';
import { unsettledOf } from './houses.js';

const DAYS_PER_WEEK = 7;
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
/** A card's band as a read remembers it: the rating cut-offs of core/dossier.js tierForRating. */
export const bandOfCard = (card) => { const x = cardRating(card); return x < RIVALS.cardBands[0] ? 'rookie' : x < RIVALS.cardBands[1] ? 'pro' : 'veteran'; };

/** A name's stored read, as `{ level, day, band, tongId }`; a bare number (a save from before E3, or a test) is a fresh read of today. */
export function readOf(state, card) {
  const raw = state.rivals?.scouted?.[card.id];
  if (raw == null) return null;
  if (typeof raw === 'number') return raw > 0 ? { level: raw, day: state.day, band: bandOfCard(card), tongId: card.tongId ?? null } : null;
  return raw.level > 0 ? raw : null;
}

/** Has this name changed band or tong since we looked? */
export const changedSince = (card, read) => !!read && (read.band !== bandOfCard(card) || (read.tongId ?? null) !== (card.tongId ?? null));

/** The level of a read of a name in effect today (0-3): one off for every `staleWeeks` since the last good trip, one more if they have changed. */
export function levelInEffect(state, card) {
  const read = readOf(state, card);
  if (!read) return 0;
  const stale = Math.floor((state.day - read.day) / (WATCH.staleWeeks * DAYS_PER_WEEK));
  return clamp(read.level - stale - (changedSince(card, read) ? 1 : 0), 0, RIVALS.scoutMax);
}

/** How old a read is, as a word key: month, season or long. null when nothing has been watched. */
export function ageOf(state, read) {
  if (!read) return null;
  const days = state.day - read.day;
  return days < WATCH.ageDays[0] ? 'month' : days < WATCH.ageDays[1] ? 'season' : 'long';
}

/** The read after a good trip: one above what is in effect today, dated today, of the name as they are now. */
export const raisedRead = (state, card) => ({ level: clamp(levelInEffect(state, card) + 1, 1, RIVALS.scoutMax), day: state.day, band: bandOfCard(card), tongId: card.tongId ?? null });

// --- Reading a tong ---

export const houseReadOf = (state, tongId) => { const x = state.rivals?.houseRead?.[tongId]; return x && x.level > 0 ? x : null; };
/** The level of a read of a tong in effect today (0-2): one off every `houseStaleWeeks`. */
export function houseLevel(state, tongId) {
  const read = houseReadOf(state, tongId);
  if (!read) return 0;
  return clamp(read.level - Math.floor((state.day - read.day) / (WATCH.houseStaleWeeks * DAYS_PER_WEEK)), 0, WATCH.houseMax);
}
export const raisedHouseRead = (state, tongId) => ({ level: clamp(houseLevel(state, tongId) + 1, 1, WATCH.houseMax), day: state.day });

/** Is this name unsettled, and do we know it (a read of their tong at level 2 in effect)? Used by the price (dossier.js) and the screen. */
export function isUnsettled(state, card) {
  const r = state.rivals;
  const t = r?.tongs.find((x) => x.id === card.tongId && x.status === 'active');
  if (!t || houseLevel(state, t.id) < 2) return false;
  return unsettledOf(r, t, state.day).some((c) => c.id === card.id);
}

// --- The slate against what we know (rule 7) ---

const GRADES = ['S', 'A', 'B', 'C', 'D'];
const gradeOfRating = (x) => GRADES.findIndex((g) => x >= WATCH.seenGrade[g]);
/** 'flatters' or 'sells_short' when the Anchor's grade and what we have seen differ by `markGap` grades or more, and our read is level 2 or more. Else null. */
export function slateMark(state, card, grade) {
  if (!grade || levelInEffect(state, card) < 2) return null;
  const gap = GRADES.indexOf(grade) - gradeOfRating(cardRating(card)); // positive: the slate is lower than what we saw
  if (Math.abs(gap) < WATCH.markGap) return null;
  return gap > 0 ? 'sells_short' : 'flatters';
}
