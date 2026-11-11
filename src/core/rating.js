// The hidden rating (DESIGN.md 2026-11-08 "No league"; drafts/PROPOSAL-phase-3.md C.5): a 0-100
// integer for a runner, never shown. This is the only place numbers become words. Pure logic.
// rating = round(0.55·Skill + 0.30·Renown + 0.15·Record). Never read by a roll, pay or heat.

import { primaryStat } from './development.js';
import { fameOf, standingOf } from './fame.js';
import { rankForHalls } from './tong.js';
import { recordOf } from './record.js';

const clamp = (n, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));
const STAT_KEYS = ['combat', 'stealth', 'tech', 'social', 'piloting', 'medical', 'cool', 'endurance']; // endurance counts like any stat (spec section 10a)
export const TIER_BONUS = { rookie: 0, pro: 6, veteran: 12 };
export const FAME_STEP = { unknown: 0, known: 5, respected: 12, elite: 20, legend: 30 };

/** Skill, 0-100: the main stat plus the best two others (1-20 → 0-100), plus a tier bonus. */
export function skillOf(op) {
  const stats = op.stats ?? {};
  const main = primaryStat(op);
  const others = STAT_KEYS.filter((s) => s !== main).map((s) => stats[s] ?? 0).sort((a, b) => b - a);
  const avg = ((stats[main] ?? 0) + others[0] + others[1]) / 3;
  return clamp(Math.round(avg * 5 + (TIER_BONUS[op.tier] ?? 0)));
}
/** Renown, 0-100: 0.7 of how the street rates them now, plus fame-tier steps. (Retuned 2026-11-08: at 1.0 it was 100 by week 13.) */
export const renownOf = (op) => clamp(Math.round(0.7 * standingOf(op) + (FAME_STEP[fameOf(op)] ?? 0)));
/** Record, 0-100: mostly jobs (100 at about 120, like Elite's liferJobs), a little for clean jobs, milestones and highlights. */
export function recordScore(op) {
  const r = recordOf(op);
  return clamp(Math.round(r.jobs * 0.6 + r.clean * 0.15 + (r.milestones?.length ?? 0) * 1.5 + (r.highlights?.length ?? 0)));
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
  if (rating >= 70) return 'standout';
  if (age >= 50 || form <= -4) return 'fading';
  if (age <= 27 && (form > 0 || rating >= 40)) return 'rising';
  if (rating >= 45) return 'solid';
  return 'green';
}

/** A rival's tier id from its hidden hall count: the same ladder as the player's. */
export const tierWord = (halls) => rankForHalls(halls).id;
