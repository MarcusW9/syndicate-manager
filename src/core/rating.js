// The hidden rating (DESIGN.md 2026-11-08 "No league"; drafts/PROPOSAL-phase-3.md C.5): a 0-100
// integer for a runner, never shown. This is the only place numbers become words. Pure logic.
// rating = round(0.55·Skill + 0.30·Renown + 0.15·Record). Never read by a roll, pay or heat.

import { primaryStat } from './development.js';
import { fameOf, standingOf } from './fame.js';
import { rankForHalls } from './tong.js';
import { recordOf } from './record.js';

const clamp = (n, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));
const STAT_KEYS = ['combat', 'stealth', 'tech', 'social', 'driving', 'medical', 'cool'];
const TIER_BONUS = { rookie: 0, pro: 6, veteran: 12 };
const FAME_STEP = { unknown: 0, known: 8, respected: 18, elite: 30, legend: 40 };

/** Skill, 0-100: the main stat plus the best two others (1-20 → 0-100), plus a tier bonus. */
export function skillOf(op) {
  const stats = op.stats ?? {};
  const main = primaryStat(op);
  const others = STAT_KEYS.filter((s) => s !== main).map((s) => stats[s] ?? 0).sort((a, b) => b - a);
  const avg = ((stats[main] ?? 0) + others[0] + others[1]) / 3;
  return clamp(Math.round(avg * 5 + (TIER_BONUS[op.tier] ?? 0)));
}
/** Renown, 0-100: how the street rates them now, plus fame-tier steps. */
export const renownOf = (op) => clamp(Math.round(standingOf(op) + (FAME_STEP[fameOf(op)] ?? 0)));
/** Record, 0-100: jobs, clean jobs, milestones and highlights, capped. */
export function recordScore(op) {
  const r = recordOf(op);
  return clamp(Math.round(r.jobs * 1.5 + r.clean + (r.milestones?.length ?? 0) * 4 + (r.highlights?.length ?? 0) * 3));
}

/** A player's runner. */
export const ratingOf = (op) => clamp(Math.round(0.55 * skillOf(op) + 0.30 * renownOf(op) + 0.15 * recordScore(op)));
/** A rival's name (state.rivals.cards): the rating is kept, hidden, on the card. */
export const cardRating = (card) => clamp(Math.round(card.rating ?? 0));

/**
 * A rating as a word key, for the text table in data/rivals.js. `who` can be a card or a runner
 * (age; a card's form, -5..5). Keys: standout, solid, rising, fading, green.
 */
export function ratingWord(rating, { age = 30, form = 0 } = {}) {
  if (age >= 46 || form <= -3) return 'fading';
  if (rating >= 70) return 'standout';
  if (age <= 27 && (form > 0 || rating >= 40)) return 'rising';
  if (rating >= 45) return 'solid';
  return 'green';
}

/** A rival's tier id from its hidden hall count: the same ladder as the player's. */
export const tierWord = (halls) => rankForHalls(halls).id;
