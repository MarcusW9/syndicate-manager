// Loot (2026-11-13): what a successful main job leaves behind. Pure logic; the odds, the pools and the
// scrap are data (data/gear.js TIERS `drop` and `live`, LOOT).
//
// One roll for whether anything drops (LOOT.chance); then the TIER first (each tier's `drop` is a
// percentage, Standard takes the rest), then an item type from that tier's weighted pool (LOOT.pool).
// A tier that isn't live yet falls down to the next live tier below it, as core/tiered.js does for
// its tiers. Tier-first is the point: adding item types to a pool never changes how often a tier
// drops. A miss is not nothing: the crew fences scrap for LOOT.scrap cash.
//
// hashRng only (rng.js), keyed by the save's seed, the job and the day: no roll in the shared stream
// moves, so every seeded test and sim keeps its sequence.

import { TIERS, LOOT } from '../data/gear.js';
import { hashRng } from './rng.js';
import { makeItem, itemName } from './gear.js';
import { money } from './money.js';

const LADDER = Object.keys(TIERS); // lowest to highest

/** The tier a roll in [0, 1) lands on, before falling down to a live one: top tier first, Standard the rest. */
export function tierAt(r) {
  let roll = r * 100;
  for (let i = LADDER.length - 1; i >= 0; i--) {
    const odds = TIERS[LADDER[i]].drop ?? 0;
    if (roll < odds) return LADDER[i];
    roll -= odds;
  }
  return LADDER[0];
}

/** The nearest live tier at or below this one that has something in its pool. */
export function liveTierFor(tier) {
  for (let i = LADDER.indexOf(tier); i >= 0; i--) {
    const t = LADDER[i];
    if (TIERS[t].live && Object.keys(LOOT.pool[t] ?? {}).length) return t;
  }
  return LADDER[0];
}

/** An item type from a tier's weighted pool, from a roll in [0, 1). */
export function typeAt(tier, r) {
  const entries = Object.entries(LOOT.pool[tier]);
  let at = r * entries.reduce((n, [, w]) => n + w, 0);
  for (const [type, w] of entries) if ((at -= w) < 0) return type;
  return entries.at(-1)[0];
}

/**
 * The drop for a job: { tier, type } or null (scrap). rng: any () => [0, 1) generator; it is read
 * in a fixed order (does it drop, which tier, which type).
 */
export function rollDrop(rng) {
  if (rng() >= LOOT.chance) return null;
  const tier = liveTierFor(tierAt(rng()));
  return { tier, type: typeAt(tier, rng()) };
}

/**
 * Settle a finished successful main job (mutates state; call from mission.js finish()). The item goes
 * to the stash, or the crew fences scrap. Returns the report line: { tone, text, tier? }.
 */
export function lootFor(state, jobKey) {
  const drop = rollDrop(hashRng(state.seed, 'loot', jobKey, state.day));
  if (!drop) {
    state.cash += LOOT.scrap;
    return { tone: 'plain', text: `No gear this time. The crew fenced scrap for ${money(LOOT.scrap)}.` };
  }
  const item = makeItem(state, drop.type, drop.tier);
  (state.stash ??= []).push(item);
  const what = item.name ? `${item.name} (${itemName({ ...item, tier: null }).toLowerCase()})` : itemName({ ...item, tier: null });
  return { tone: 'good', text: `Gear from the job: ${what}.`, tier: item.tier };
}
