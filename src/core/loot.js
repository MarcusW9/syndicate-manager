// Loot (2026-11-13): what a successful main job leaves behind. Pure logic; the odds, the pools and the
// scrap are data (data/gear.js TIERS `drop` and `live`, LOOT).
//
// One roll for whether anything drops (LOOT.chance); then the TIER first (each tier's `drop` is a
// percentage, Standard takes the rest), then an item type from that tier's weighted pool (LOOT.pool).
// A tier that isn't live yet falls down to the next live tier below it, as core/tiered.js does for
// its tiers. Apex (2026-11-14) is live while a named piece is left to find: it picks one of them, uniformly,
// from those the save has not found (state.apexFound; data/apexGear.js), and once all are found it falls
// to Premium as it did before. Tier-first is the point: adding item types to a pool never changes how often a tier
// drops. A miss is not nothing: the crew fences scrap for LOOT.scrap cash.
//
// hashRng only (rng.js), keyed by the save's seed, the job and the day: no roll in the shared stream
// moves, so every seeded test and sim keeps its sequence.
//
// 2026-11-24 (owner, drafts/PROPOSAL-rewards-visibility.md): the tier odds follow the job's threat (LOOT.byThreat), a
// heist finale always drops at LOOT.heistFloor or better, and a won fight at home or on a post leaves what the
// attackers carried (`takenFor`, LOOT.taken). A dropped item is `unseen` until its sheet is opened (the stash's NEW tag
// and Today's line). `spoilsFor` is the job page's read of the same odds the roll uses.

import { TIERS, LOOT } from '../data/gear.js';
import { APEX_GEAR } from '../data/apexGear.js';
import { hashRng } from './rng.js';
import { makeItem, makeApex, itemName, emptyLoadout, placeOf, firstFit, canChangeGear, carried } from './gear.js';
import { GEAR } from '../data/gear.js';
import { weaponOf, armourOf } from './battle.js';
import { hitOf, soakOf } from './fight.js';
import { money } from './money.js';

const LADDER = Object.keys(TIERS); // lowest to highest

/** The tier odds (percent) for a job of this threat: LOOT.byThreat, or each tier's own `drop` when no threat is given. */
export function tierOdds(threat) {
  const row = threat != null ? LOOT.byThreat[Math.max(1, Math.min(5, threat))] : null;
  return Object.fromEntries(LADDER.map((t) => [t, row ? row[t] ?? 0 : TIERS[t].drop ?? 0]));
}

/** The tier a roll in [0, 1) lands on, before falling down to a live one: top tier first, Standard the rest. */
export function tierAt(r, threat = null, odds = tierOdds(threat)) {
  let roll = r * 100;
  for (let i = LADDER.length - 1; i >= 0; i--) {
    const o = odds[LADDER[i]] ?? 0;
    if (roll < o) return LADDER[i];
    roll -= o;
  }
  return LADDER[0];
}

/**
 * The nearest live tier at or below this one that has something in its pool. Apex has no pool: it counts
 * only when `apexLeft` says a piece is still to be found (default: none, so it falls to Premium).
 */
export function liveTierFor(tier, apexLeft = false) {
  for (let i = LADDER.indexOf(tier); i >= 0; i--) {
    const t = LADDER[i];
    if (t === 'apex' ? TIERS.apex.live && apexLeft : TIERS[t].live && Object.keys(LOOT.pool[t] ?? {}).length) return t;
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
 * The drop for a job: { tier, type } (an Apex drop also names its piece: { tier: 'apex', type, apex }) or null
 * (scrap). rng: any () => [0, 1) generator; it is read in a fixed order (does it drop, which tier, which
 * type or piece). found: ids of the Apex pieces already found in this save; none left means Apex falls to Premium.
 * opts: threat (the job's: its tier odds), floor (always drops, at this tier or better: a heist finale).
 */
export function rollDrop(rng, found = [], { threat = null, floor = null } = {}) {
  const dropped = rng() < LOOT.chance;
  if (!dropped && !floor) return null;
  const left = Object.keys(APEX_GEAR).filter((id) => !found.includes(id));
  let tier = liveTierFor(tierAt(rng(), threat), left.length > 0);
  if (floor && LADDER.indexOf(tier) < LADDER.indexOf(floor)) tier = floor;
  const r = rng();
  if (tier === 'apex') {
    const apex = left[Math.min(left.length - 1, Math.floor(r * left.length))];
    return { tier, type: APEX_GEAR[apex].type, apex };
  }
  return { tier, type: typeAt(tier, r) };
}

/** An item into the stash, marked unseen (the NEW tag) and with what it came from. */
function stashIt(state, item, from) {
  item.unseen = true;
  item.from = from;
  (state.stash ??= []).push(item);
  return item;
}

/** The report line's fields for an item: its uid (so the report can offer Give to), tier, perks. */
const lineFor = (item) => ({ uid: item.uid, tier: item.tier, ...(item.apex ? { apex: item.apex, perks: [`apex:${item.apex}`] } : item.perks?.length ? { perks: [...item.perks] } : {}) });

/** What the job page says a job may leave behind: { chance, best, named } (named: an Apex piece is out there). */
export function spoilsFor(state, threat, { heist = false } = {}) {
  const odds = tierOdds(threat);
  const named = (odds.apex ?? 0) > 0 && Object.keys(APEX_GEAR).some((id) => !(state?.apexFound ?? []).includes(id));
  const best = [...LADDER].reverse().find((t) => t !== 'apex' && (odds[t] ?? 0) > 0) ?? LADDER[0];
  return { chance: heist ? 1 : LOOT.chance, best, named, floor: heist ? LOOT.heistFloor : null };
}

/**
 * Settle a finished successful main job (mutates state; call from mission.js finish()). The item goes
 * to the stash, or the crew fences scrap. Returns the report line: { tone, text, tier?, perks?, uid? } (a Custom or
 * Premium item's perks come from core/gear.js makeItem, on the item's own hash). opts: threat (the job's), heist (a
 * heist finale: always drops, LOOT.heistFloor or better).
 */
export function lootFor(state, jobKey, { threat = null, heist = false } = {}) {
  const drop = rollDrop(hashRng(state.seed, 'loot', jobKey, state.day), state.apexFound ?? [], { threat, floor: heist ? LOOT.heistFloor : null });
  // No drop: sometimes a spare Standard sidearm instead of scrap, from a roll of its own (so the drops above never moved).
  if (!drop && hashRng(state.seed, 'spare', jobKey, state.day)() < LOOT.spareChance) {
    const item = stashIt(state, makeItem(state, LOOT.spareType, 'standard'), 'job');
    const what = item.name ? `${item.name} (${itemName({ ...item, tier: null }).toLowerCase()})` : itemName({ ...item, tier: null });
    return { tone: 'good', text: `Gear from the job: ${what}, a spare for the cupboard.`, tier: item.tier, uid: item.uid, spare: true };
  }
  if (!drop) {
    state.cash += LOOT.scrap;
    return { tone: 'plain', text: `No gear this time. The crew fenced scrap for ${money(LOOT.scrap)}.` };
  }
  const item = stashIt(state, drop.apex ? makeApex(state, drop.apex) : makeItem(state, drop.type, drop.tier), 'job');
  const what = item.name ? `${item.name} (${itemName({ ...item, tier: null }).toLowerCase()})` : itemName({ ...item, tier: null });
  // An Apex piece's line names the piece (the report shows its history and its unique perk from data/apexGear.js).
  if (item.apex) return { tone: 'good', text: `Gear from the job: ${what}. A named piece.`, ...lineFor(item) };
  return { tone: 'good', text: `Gear from the job: ${what}.`, ...lineFor(item) };
}

/**
 * A won fight at home or on a post (a held hall raid, a held hit post; owner, 2026-11-24): the attackers may leave a piece
 * behind (LOOT.taken). Mutates state. Returns the line { tone, text, tier, uid } or null when nothing was left.
 */
export function takenFor(state, key) {
  const rng = hashRng(state.seed, 'taken', key, state.day);
  if (rng() >= LOOT.taken.chance) return null;
  const tier = tierAt(rng(), null, LOOT.taken.tiers);
  const entries = Object.entries(LOOT.taken.pool);
  let at = rng() * entries.reduce((n, [, w]) => n + w, 0);
  const type = entries.find(([, w]) => (at -= w) < 0)?.[0] ?? entries[0][0];
  const item = stashIt(state, makeItem(state, type, tier), 'fight');
  return { tone: 'good', text: `Taken off them: ${itemName({ ...item, tier: null })}.`, ...lineFor(item) };
}

/**
 * Who a stash item would help most, by the numbers a fight and a roll read (owner, 2026-11-24: Today's "best for"):
 * a weapon by the hit it lands (core/fight.js hitOf of core/battle.js weaponOf), armour by the soak it gives (soakOf of
 * armourOf), anything else by its stat bonus to someone who has none of that kind yet, their best stat for it first.
 * Only runners who could take it now (core/gear.js canChangeGear and a place for it). Returns { op, text } or null.
 */
export function bestTaker(state, item) {
  const def = GEAR[item.type];
  if (!def) return null;
  const alone = { gear: { ...emptyLoadout(), bag: [{ item, x: 0, y: 0 }], armour: placeOf(item.type) === 'armour' ? item : null } };
  const fits = (op) => canChangeGear(state, op).ok && !op.freelance && (placeOf(item.type) !== 'bag' || firstFit(op, item));
  let best = null;
  for (const op of state.crew.filter(fits)) {
    let gain = 0, text = '';
    if (def.overwatch) { // a rifle or a drone: overwatch for someone who has none, their stat for it first
      if (carried(op).some((i) => GEAR[i.type]?.overwatch)) continue;
      gain = 0.5 + (op.stats?.[def.overwatch.stat] ?? 0) / 100;
      text = 'can take overwatch';
    } else if (def.slot === 'weapon') {
      gain = hitOf(weaponOf(alone).damage) - hitOf(weaponOf(op).damage);
      text = `+${gain} a hit`;
    } else if (def.armour) {
      gain = soakOf(armourOf(alone).value) - soakOf(armourOf(op).value);
      text = `${gain} more off every shot`;
    } else if (def.bonus && !carried(op).some((i) => i.type === item.type)) {
      const [stat] = Object.entries(def.bonus).sort((a, b) => (op.stats?.[b[0]] ?? 0) - (op.stats?.[a[0]] ?? 0))[0] ?? [];
      gain = stat ? 0.5 + (op.stats?.[stat] ?? 0) / 100 : 0; // the runner who uses that stat most
      text = Object.entries(def.bonus).map(([k, v]) => `+${v} ${k}`).join(', ');
    }
    if (gain > 0 && (!best || gain > best.gain)) best = { op, gain, text };
  }
  return best ? { op: best.op, text: best.text } : null;
}
