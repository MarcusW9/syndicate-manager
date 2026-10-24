// Two-stage pick: a tier from TIER_ODDS, then an item within that tier,
// weighted ×STEER_WEIGHT if it shares a tag with the leanings.
// If the rolled tier is empty, fall back to the next tier down (towards common).

import { TIER_ODDS, STEER_WEIGHT } from '../data/tags.js';

const TIERS = Object.keys(TIER_ODDS);

export function rollTier(rng) {
  let roll = rng() * 100;
  for (const tier of TIERS) {
    roll -= TIER_ODDS[tier];
    if (roll < 0) return tier;
  }
  return TIERS[0];
}

/** items: [{ tags, tier, ... }]. Returns one item, or undefined if items is empty. */
export function pickTiered(rng, items, leanings = []) {
  if (!items.length) return undefined;
  let i = TIERS.indexOf(rollTier(rng));
  let pool = [];
  for (; i >= 0 && !pool.length; i--) pool = items.filter((it) => it.tier === TIERS[i]);
  // Nothing at or below the rolled tier: take the lowest tier that has items.
  for (i = 0; !pool.length; i++) pool = items.filter((it) => it.tier === TIERS[i]);
  const weights = pool.map((it) => ((it.tags ?? []).some((t) => leanings.includes(t)) ? STEER_WEIGHT : 1));
  let roll = rng() * weights.reduce((a, b) => a + b, 0);
  for (let k = 0; k < pool.length; k++) {
    roll -= weights[k];
    if (roll < 0) return pool[k];
  }
  return pool[pool.length - 1];
}
