// Gear (PLAN-CORE-LOOP.md, slice 5): the safehouse stash and each runner's loadout. Pure logic.
//
// state.stash   [item]                       bought and not on anyone
// op.gear       { weapon, armour, tool, implant }: item | null, stays on them between jobs
// item          { uid, type, tier, look?, name? }  type: data/gear.js GEAR; tier: TIERS; rifles
//               also have a look and a name (core/looks.js)
//
// Gear is a bonus, never a gate, except that overwatch needs a rifle or a drone (as it always
// needed the kit). A runner who dies takes their gear with them.

import { GEAR, SLOTS, TIERS } from '../data/gear.js';
import { SPECIALISATIONS } from '../data/specialisations.js';
import { giveLook } from './looks.js';

export { GEAR, SLOTS, TIERS };

export const SELL_SHARE = 0.5; // what the fence pays back for something from the stash

export const priceOf = (type, tier = 'street') => Math.round((GEAR[type].price * TIERS[tier].price) / 50) * 50;
export const sellPrice = (item) => Math.round((priceOf(item.type, item.tier) * SELL_SHARE) / 50) * 50;

/** "Rifle", "Pro rifle". */
export function itemName(item) {
  const name = GEAR[item.type]?.name ?? item.type;
  return item.tier && item.tier !== 'street' ? `${TIERS[item.tier].name} ${name.charAt(0).toLowerCase()}${name.slice(1)}` : name;
}

/** What to call it on screen: its own name if it has one ("Vermilion Heron"), else itemName. */
export const itemTitle = (item) => item.name ?? itemName(item);

/** Everything someone has on. */
export const carried = (op) => Object.values(op?.gear ?? {}).filter(Boolean);

/** The item in one of their slots, or null. */
export const inSlot = (op, slot) => op?.gear?.[slot] ?? null;

/** Roll bonuses from their gear for one stat: [{ value, note }]. Overwatch items add nothing here. */
export function gearMods(op, stat) {
  const out = [];
  for (const item of carried(op)) {
    const base = GEAR[item.type]?.bonus?.[stat];
    if (!base) continue;
    const value = base + (TIERS[item.tier]?.step ?? 0);
    out.push({ value, note: `${itemName(item)} +${value}` });
  }
  return out;
}

/** The overwatch kits they carry: ['rifle', 'drone'] or fewer. */
export const kitsFor = (op) => carried(op).filter((i) => GEAR[i.type]?.overwatch).map((i) => i.type);

/**
 * What they can do from overwatch with this kit, or null if they don't carry it:
 * { id, name, stat, uses, heat, neural, indoors, bonus, notes, desc, heatOnHit, spec }. The item's
 * tier adds to the roll (bonus); a specialisation for this kit (slice 5b) adds uses, bonus and more.
 */
export function overwatchKit(op, kitId) {
  const item = carried(op).find((i) => i.type === kitId && GEAR[i.type]?.overwatch);
  if (!item) return null;
  const g = GEAR[item.type];
  const step = TIERS[item.tier]?.step ?? 0;
  const kit = { id: kitId, name: g.name, ...g.overwatch, bonus: step, notes: step ? [`${itemName(item)} +${step}`] : [], desc: g.desc, heatOnHit: false, spec: null };
  // Their specialisation, if it's for this kit (slice 5b; data/specialisations.js).
  const spec = op.spec && SPECIALISATIONS[op.spec.id];
  if (spec?.kit === kitId) {
    const e = spec.effect;
    kit.uses += e.uses ?? 0;
    kit.bonus += e.bonus ?? 0;
    if (e.bonus) kit.notes.push(`${spec.name} +${e.bonus}`);
    if (e.heatOnHit) kit.heatOnHit = true;
    if (e.neural != null) kit.neural = e.neural;
    kit.spec = op.spec.id;
  }
  return kit;
}

/** The base kit (street, no specialist), for reads that need a number before anyone's picked. */
export function baseKit(kitId) {
  const g = GEAR[kitId];
  return g?.overwatch ? { id: kitId, name: g.name, ...g.overwatch, bonus: 0, notes: [], desc: g.desc } : null;
}

/** How much their armour takes off the chance of a serious wound from an incident. */
export const seriousGuard = (op) => carried(op).reduce((n, i) => n + (GEAR[i.type]?.serious ?? 0) * (1 + (TIERS[i.tier]?.step ?? 0) * 0.5), 0);

/** Extra medical counted towards patching a serious wound (a trauma kit). */
export const patchBonus = (op) => carried(op).reduce((n, i) => n + (GEAR[i.type]?.patch ?? 0), 0);

/** Their implants keep neural load from resting below this. */
export const neuralFloor = (op) => carried(op).reduce((n, i) => n + (GEAR[i.type]?.neuralFloor ?? 0), 0);

/**
 * Can their loadout change today? Returns { ok, reason }. Only while they're out on a job whose
 * outcome isn't settled yet: the live job, a hands-off job (it plays out when they're back, with
 * what they carry) or a side task. Resting, hurt, or "back tomorrow" after a finished job is fine
 * (owner, 2026-10-29: "even if they're out of action you should be able to modify them").
 */
export function canChangeGear(state, op) {
  const am = state.activeMission;
  const placed = am && !am.done ? [...am.crewIds, am.overwatch?.id, am.wheels, am.standby?.id] : [];
  if (placed.includes(op.id)) return { ok: false, reason: 'on a job' };
  const handsOff = (state.awayJobs ?? []).some(({ mission: m }) => [...m.crewIds, m.overwatch?.id, m.wheels, m.standby?.id].includes(op.id));
  if (handsOff) return { ok: false, reason: 'out on a job' };
  if ((state.sideOut ?? []).some((t) => t.crewIds.includes(op.id))) return { ok: false, reason: 'out on a side task' };
  return { ok: true, reason: '' };
}

const newItem = (state, type, tier) => {
  state.gearSeq = (state.gearSeq ?? 0) + 1;
  return giveLook(state, { uid: `g${state.gearSeq}`, type, tier });
};

/** Buy an item into the stash. Returns the new state, or prev if it can't be bought. */
export function buyGear(prev, type, tier = 'street') {
  if (!GEAR[type] || !TIERS[tier] || prev.cash < priceOf(type, tier)) return prev;
  const state = structuredClone(prev);
  state.cash -= priceOf(type, tier);
  (state.stash ??= []).push(newItem(state, type, tier));
  return state;
}

/** Buy one of this week's rifles from the armoury (core/looks.js): it keeps its look and name. */
export function buyOffer(prev, oid) {
  const offer = prev.armoury?.offers?.find((o) => o.oid === oid);
  if (!offer || prev.cash < priceOf(offer.type, offer.tier)) return prev;
  const state = structuredClone(prev);
  state.cash -= priceOf(offer.type, offer.tier);
  state.armoury.offers = state.armoury.offers.filter((o) => o.oid !== oid);
  state.gearSeq = (state.gearSeq ?? 0) + 1;
  (state.stash ??= []).push({ uid: `g${state.gearSeq}`, type: offer.type, tier: offer.tier, look: offer.look, name: offer.name });
  return state;
}

/** Sell an item from the stash for SELL_SHARE of its price. */
export function sellGear(prev, uid) {
  const item = (prev.stash ?? []).find((i) => i.uid === uid);
  if (!item) return prev;
  const state = structuredClone(prev);
  state.stash = state.stash.filter((i) => i.uid !== uid);
  state.cash += sellPrice(item);
  return state;
}

/** Find an item wherever it is: { item, owner (op or null) } or null. */
function locate(state, uid) {
  const inStash = (state.stash ?? []).find((i) => i.uid === uid);
  if (inStash) return { item: inStash, owner: null };
  for (const op of state.crew) for (const item of carried(op)) if (item.uid === uid) return { item, owner: op };
  return null;
}

/**
 * Put an item on someone: from the stash or off another runner. Whatever was in that slot goes
 * back to the stash. Neither person can be on a job or away.
 */
export function equip(prev, uid, opId) {
  const state = structuredClone(prev);
  const op = state.crew.find((o) => o.id === opId);
  const found = locate(state, uid);
  if (!op || !found || !canChangeGear(state, op).ok) return prev;
  if (found.owner && (found.owner === op || !canChangeGear(state, found.owner).ok)) return prev;
  const slot = GEAR[found.item.type].slot;
  if (found.owner) found.owner.gear[slot] = null;
  else state.stash = state.stash.filter((i) => i.uid !== uid);
  op.gear ??= emptyLoadout();
  if (op.gear[slot]) state.stash.push(op.gear[slot]);
  op.gear[slot] = found.item;
  return state;
}

/** Take whatever is in one of their slots back to the stash. */
export function unequip(prev, opId, slot) {
  const op0 = prev.crew.find((o) => o.id === opId);
  if (!inSlot(op0, slot) || !canChangeGear(prev, op0).ok) return prev;
  const state = structuredClone(prev);
  const op = state.crew.find((o) => o.id === opId);
  (state.stash ??= []).push(op.gear[slot]);
  op.gear[slot] = null;
  return state;
}

export const emptyLoadout = () => Object.fromEntries(Object.keys(SLOTS).map((s) => [s, null]));

/** A loadout holding these item types (street), for recruits who bring their own. */
export function loadoutOf(state, types = []) {
  const gear = emptyLoadout();
  for (const type of types) if (GEAR[type] && !gear[GEAR[type].slot]) gear[GEAR[type].slot] = newItem(state, type, 'street');
  return gear;
}
