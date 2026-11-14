// E1 (DESIGN.md 2026-11-14 "E1"): houses have habits. How a tong runs its people: who it lets go, who it wants.
// Pure rules over `state.rivals`; no rng here except the habit draw, which has its own key and never moves rngCounter.
// A habit is hidden in state (`tong.habit`, an id) and never changes. Wording is data/rivals.js `HABITS`.

import { hashRng } from './rng.js';
import { cardRating } from './rating.js';
import { rankForHalls } from './tong.js';
import { TONG_RANKS } from '../data/tong.js';
import { HABITS, HABIT_IDS, HABIT } from '../data/rivals.js';

const DAYS_PER_WEEK = 7;
const SEASON_DAYS = 364;
const byId = (a, b) => (a.id < b.id ? -1 : 1);
const low = (list) => [...list].sort((a, b) => cardRating(a) - cardRating(b) || byId(a, b))[0] ?? null;

export const ceilingOf = (t) => HABITS[t.habit]?.roster[1] ?? 6;
export const rosterOf = (r, t) => r.cards.filter((c) => c.tongId === t.id);
export const tierIndexOf = (t) => TONG_RANKS.findIndex((k) => k.id === rankForHalls(t.halls).id);
export const seasonOf = (day) => Math.floor((day - 1) / SEASON_DAYS);

/** Is this house selling (E2): its overreach story is at Selling, so a buyout from it costs less. */
export const isSelling = (r, t) => !!r?.threads?.some((x) => x.open && x.tongId === t.id && x.family === 'overreach' && x.stage === 'selling');

/** A new tong's habit: weighted, never more than two active tongs with the same one, never `avoid` (the house a founder left). */
export function pickHabit(seed, r, tongId, avoid = null) {
  const rng = hashRng(seed, 'habit:' + tongId);
  const used = (h) => r.tongs.filter((t) => t.status === 'active' && t.id !== tongId && t.habit === h).length;
  const total = HABIT_IDS.reduce((n, h) => n + HABITS[h].weight, 0);
  for (let i = 0; i < 24; i++) {
    let x = rng() * total;
    const h = HABIT_IDS.find((id) => (x -= HABITS[id].weight) < 0) ?? HABIT_IDS[HABIT_IDS.length - 1];
    if (h !== avoid && used(h) < HABIT.maxShared) return h;
  }
  return HABIT_IDS.filter((h) => h !== avoid).sort((a, b) => used(a) - used(b) || (a < b ? -1 : 1))[0];
}

/** Keep a card's best mark: raised only by a real rise (2 or more), so "stalled" means no rise for half a year. */
export function noteBest(card, day) {
  if (card.best === undefined || card.rating >= card.best + HABIT.stallGain) { card.best = card.rating; card.bestDay = day; }
}

export const stalled = (card, day) => card.age >= HABIT.stallAge && day - (card.bestDay ?? day) >= HABIT.stallWeeks * DAYS_PER_WEEK;

export const average = (r, t) => {
  const names = rosterOf(r, t);
  return names.length ? names.reduce((n, c) => n + cardRating(c), 0) / names.length : 20 + t.prestige * 0.8;
};

/** The one name a house lets go this Sunday, or null. Never the head; not twice inside four weeks; one at most. */
export function releaseFor(r, t, day) {
  if (t.releasedDay != null && day - t.releasedDay < HABIT.releaseGapWeeks * DAYS_PER_WEEK) return null;
  const roster = rosterOf(r, t);
  const pool = roster.filter((c) => c.id !== t.headId);
  if (!pool.length) return null;
  if (roster.length > ceilingOf(t)) return low(pool);
  if (roster.length <= (HABITS[t.habit]?.roster[0] ?? 3)) return null; // a house keeps at least the table it is known for
  switch (t.habit) {
    case 'grinder': return low(pool.filter((c) => stalled(c, day)));
    case 'boutique': { const best = Math.max(...roster.map(cardRating)); return low(pool.filter((c) => best - cardRating(c) >= HABIT.boutiqueBehind)); }
    case 'workshop': return low(pool.filter((c) => stalled(c, day) && c.age >= HABIT.workshopStalledAge));
    default: return null; // an old house lets nobody go
  }
}

/** Does this house want this card: room, and the habit's taste. */
export function wants(r, t, card, day) {
  if (t.status !== 'active' || rosterOf(r, t).length >= ceilingOf(t)) return false;
  switch (t.habit) {
    case 'grinder': return card.age <= HABIT.grinderAge;
    case 'boutique': return Math.abs(cardRating(card) - average(r, t)) <= HABIT.boutiqueNear;
    case 'workshop': return cardRating(card) >= HABIT.workshopSteady;
    case 'oldhouse': return card.home === t.home && t.signedSeason !== seasonOf(day);
    default: return true;
  }
}

/**
 * The highest tier a card may land in: a name a house has let go does not climb for a season (the trickle-down: a name a
 * Harbour house drops is usually too good for the bottom and lands a tier lower). Infinity for any other card.
 */
export function topTierFor(r, card, day) {
  if (!card.fromTong || card.tongId || day - card.since >= SEASON_DAYS) return Infinity;
  const origin = r.tongs.find((t) => t.id === card.fromTong);
  return card.fromTier ?? (origin ? tierIndexOf(origin) : Infinity); // the rung they left from, kept at the day they left
}

/**
 * Where a card goes: among the houses that want it, the highest tier whose average rating it is within 8 of; ties by
 * wealth, then id. Null when nobody wants it (it stays free). `exclude` is the house it is leaving.
 */
export function placeFor(r, card, day, exclude = null) {
  const top = topTierFor(r, card, day);
  const fits = r.tongs.filter((t) => t.id !== exclude && tierIndexOf(t) <= top && wants(r, t, card, day) && Math.abs(cardRating(card) - average(r, t)) <= HABIT.fitTier);
  return fits.sort((a, b) => tierIndexOf(b) - tierIndexOf(a) || b.wealth - a.wealth || byId(a, b))[0] ?? null;
}

/** A card remembers its last houses and the day it left each (newest last, free spells left out). */
export function pushPath(card, tongId, day) {
  card.path = [...(card.path ?? []), { tongId, day }].slice(-HABIT.trail);
}
