// Gear (PLAN-CORE-LOOP.md, slice 5): the safehouse stash and each runner's loadout. Pure logic.
//
// state.stash   [item]                       bought and not on anyone
// op.gear       { armour: item | null, implants: [item] (at most SOCKETS), bag: [{ item, x, y }] }:
//               what they wear, their chrome, and what they carry in a BAG of cells (save v45; it
//               was one item per slot, { weapon, armour, tool, implant }). Stays on them between jobs.
// item          { uid, type, tier, look?, name? }  type: data/gear.js GEAR; tier: TIERS; rifles
//               also have a look and a name (core/looks.js)
//
// Gear is a bonus, never a gate, except that overwatch needs a rifle or a drone (as it always
// needed the kit). A runner who dies takes their gear with them.

import { GEAR, SLOTS, TIERS, BASE_TIER, SIDEARM_FRAMES, SIDEARM_QUIRKS, SIDEARM_PRICE_PER_POINT, BAG, SOCKETS, CELLS } from '../data/gear.js';
import { SPECIALISATIONS } from '../data/specialisations.js';
import { giveLook } from './looks.js';
import { ROOM_EFFECT } from '../data/hallBuild.js';

export { GEAR, SLOTS, TIERS };

export const SELL_SHARE = 0.5; // what the fence pays back for something from the stash

/** What it costs: the type's price by tier, and for a sidearm its strengths (an item or an offer, when given). */
export const priceOf = (type, tier = BASE_TIER, item = null) => {
  const base = GEAR[type].price * TIERS[tier].price;
  const s = type === 'pistol' && item ? sidearmStats({ ...item, tier: BASE_TIER }) : null;
  const points = s ? (s.aim - 1) + (s.damage - 3) + s.pierce / 2 : 0;
  return Math.round((base * Math.max(0.5, 1 + points * SIDEARM_PRICE_PER_POINT)) / 50) * 50;
};
export const sellPrice = (item) => Math.round((priceOf(item.type, item.tier, item) * SELL_SHARE) / 50) * 50;

/**
 * A sidearm's strengths: { aim, damage, pierce, trait, quirk }: its frame's numbers, its rolled
 * quirk, and the tier's step on aim and damage (data/gear.js SIDEARM_FRAMES, SIDEARM_QUIRKS).
 * Damage never drops below 1, aim never below -2. Null for anything that isn't a sidearm.
 */
export function sidearmStats(item) {
  if (item?.type !== 'pistol') return null;
  const f = SIDEARM_FRAMES[item.look?.frame] ?? SIDEARM_FRAMES.heritage;
  const q = SIDEARM_QUIRKS[item.quirk] ?? SIDEARM_QUIRKS.none;
  const step = TIERS[item.tier]?.step ?? 0;
  return {
    aim: Math.max(-2, f.aim + (q.aim ?? 0) + step), damage: Math.max(1, f.damage + (q.damage ?? 0) + step), pierce: f.pierce,
    trait: f.trait, quirk: q.name,
  };
}

/** "Rifle", "Verified rifle". */
export function itemName(item) {
  const name = GEAR[item.type]?.name ?? item.type;
  return item.tier && item.tier !== BASE_TIER && TIERS[item.tier] ? `${TIERS[item.tier].name} ${name.charAt(0).toLowerCase()}${name.slice(1)}` : name;
}

/** What to call it on screen: its own name if it has one ("Vermilion Heron"), else itemName. */
export const itemTitle = (item) => item.name ?? itemName(item);

/**
 * Everything someone has on: armour, implants and the bag. Reads the old one-per-slot shape too
 * ({ weapon, armour, tool, implant }), which a save upgrades (v45) but a hand-made runner may use.
 */
export function carried(op) {
  const g = op?.gear ?? {};
  return [g.armour, g.weapon, g.tool, g.implant, ...(g.implants ?? []), ...(g.bag ?? []).map((b) => b.item)].filter(Boolean);
}

/** Where an item goes on a runner: 'armour', 'implant', or 'bag' (weapons and tools). */
export const placeOf = (type) => ({ armour: 'armour', implant: 'implant' }[GEAR[type]?.slot] ?? 'bag');
/** How many bag cells it takes. */
export const cellsOf = (type) => CELLS[type] ?? 1;

/** How good an item is of its kind, to pick the one that counts when someone carries two. */
const worth = (item) => (item.type === 'pistol' ? sidearmStats(item).damage * 10 + sidearmStats(item).aim : TIERS[item.tier]?.step ?? 0);
/**
 * What counts: the best item of each kind they carry (owner, 2026-11-06: different kinds add up,
 * the same kind counts once; two ghost kits are still +1 stealth).
 */
export function counted(op) {
  const best = new Map();
  for (const item of carried(op)) if (!best.has(item.type) || worth(item) > worth(best.get(item.type))) best.set(item.type, item);
  return [...best.values()];
}

/** The bag's cells a runner's items cover, as "x,y" keys (leaving out one item, when moving it). */
function covered(op, skipUid = null) {
  const out = new Set();
  for (const b of op?.gear?.bag ?? []) if (b.item.uid !== skipUid) for (let i = 0; i < cellsOf(b.item.type); i++) out.add(`${b.x + i},${b.y}`);
  return out;
}
/** Does this item fit in their bag with its first cell at (x, y)? */
export function fitsAt(op, item, x, y) {
  const n = cellsOf(item.type);
  if (x < 0 || y < 0 || y >= BAG.rows || x + n > BAG.cols) return false;
  const used = covered(op, item.uid);
  for (let i = 0; i < n; i++) if (used.has(`${x + i},${y}`)) return false;
  return true;
}
/** The first place it fits in their bag ({ x, y }), row by row, or null. */
export function firstFit(op, item) {
  for (let y = 0; y < BAG.rows; y++) for (let x = 0; x < BAG.cols; x++) if (fitsAt(op, item, x, y)) return { x, y };
  return null;
}
/** How many of their bag's cells are taken. */
export const bagUsed = (op) => covered(op).size;

/** Roll bonuses from their gear for one stat: [{ value, note }]. Overwatch items add nothing here. */
export function gearMods(op, stat) {
  const out = [];
  for (const item of counted(op)) {
    // A sidearm's aim is its combat bonus, whatever its frame and quirk make it (and it can be a minus).
    if (item.type === 'pistol') {
      const aim = stat === 'combat' ? sidearmStats(item).aim : 0;
      if (aim) out.push({ value: aim, note: `${itemTitle(item)} ${aim > 0 ? '+' : '−'}${Math.abs(aim)}` });
      continue;
    }
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
  const item = counted(op).find((i) => i.type === kitId && GEAR[i.type]?.overwatch); // their best one, if they carry two
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

/** The base kit (standard, no specialist), for reads that need a number before anyone's picked. */
export function baseKit(kitId) {
  const g = GEAR[kitId];
  return g?.overwatch ? { id: kitId, name: g.name, ...g.overwatch, bonus: 0, notes: [], desc: g.desc } : null;
}

/** How much their armour takes off the chance of a serious wound from an incident. */
export const seriousGuard = (op) => counted(op).reduce((n, i) => n + (GEAR[i.type]?.serious ?? 0) * (1 + (TIERS[i.tier]?.step ?? 0) * 0.5), 0);

/** Extra medical counted towards patching a serious wound (a trauma kit). */
export const patchBonus = (op) => counted(op).reduce((n, i) => n + (GEAR[i.type]?.patch ?? 0), 0);

/** Their implants keep neural load from resting below this; two implants' floors add up (owner, 2026-11-06). */
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

/** A new item of this type and tier, with its look or build rolled (core/looks.js). Bumps gearSeq. */
export const makeItem = (state, type, tier = BASE_TIER) => newItem(state, type, tier);
const newItem = (state, type, tier) => {
  state.gearSeq = (state.gearSeq ?? 0) + 1;
  return giveLook(state, { uid: `g${state.gearSeq}`, type, tier });
};

/** Buy an item into the stash. Returns the new state, or prev if it can't be bought. */
/** Does the tong have a cyber doc (a hall room, core/hallbuild.js)? */
export const hasCyberDoc = (state) => (state?.halls ?? []).some((h) => (h.build ?? []).some((b) => b.piece === 'cyberdoc'));
/** What buying costs the tong: the price, and implants a quarter less with a cyber doc. */
export const buyPrice = (state, type, tier = BASE_TIER, item = null) => {
  const p = priceOf(type, tier, item);
  return GEAR[type]?.slot === 'implant' && hasCyberDoc(state) ? Math.round((p * ROOM_EFFECT.docShare) / 50) * 50 : p;
};

export function buyGear(prev, type, tier = BASE_TIER) {
  if (!GEAR[type] || !TIERS[tier]?.live || prev.cash < buyPrice(prev, type, tier)) return prev;
  const state = structuredClone(prev);
  state.cash -= buyPrice(prev, type, tier);
  (state.stash ??= []).push(newItem(state, type, tier));
  return state;
}

/** Buy one of this week's rifles from the armoury (core/looks.js): it keeps its look and name. */
export function buyOffer(prev, oid) {
  const offer = prev.armoury?.offers?.find((o) => o.oid === oid);
  if (!offer || prev.cash < buyPrice(prev, offer.type, offer.tier, offer)) return prev;
  const state = structuredClone(prev);
  state.cash -= buyPrice(prev, offer.type, offer.tier, offer);
  state.armoury.offers = state.armoury.offers.filter((o) => o.oid !== oid);
  state.gearSeq = (state.gearSeq ?? 0) + 1;
  (state.stash ??= []).push({ uid: `g${state.gearSeq}`, type: offer.type, tier: offer.tier, look: offer.look, name: offer.name, ...(offer.quirk ? { quirk: offer.quirk } : {}) });
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

/** Take an item off whoever has it (armour, a socket or the bag). Mutates; returns true if it was there. */
function takeOff(op, uid) {
  const g = op.gear;
  if (g.armour?.uid === uid) { g.armour = null; return true; }
  const n = (g.implants ?? []).length;
  g.implants = (g.implants ?? []).filter((i) => i.uid !== uid);
  if (g.implants.length !== n) return true;
  const m = (g.bag ?? []).length;
  g.bag = (g.bag ?? []).filter((b) => b.item.uid !== uid);
  return g.bag.length !== m;
}

/**
 * Put an item on someone, from the stash or off another runner (or move it in their own bag).
 * target: armour and implants need none (an implant may name its { socket }: whatever is there goes
 * back to the stash); a weapon or tool goes where it's put in the bag ({ x, y }), or the first place
 * it fits. Refused (prev returned) if it doesn't fit, both sockets are full, the other socket holds
 * the same implant, or either person can't change their gear today.
 */
export function equip(prev, uid, opId, target = null) {
  const state = structuredClone(prev);
  const op = state.crew.find((o) => o.id === opId);
  const found = locate(state, uid);
  if (!op || !found || !canChangeGear(state, op).ok) return prev;
  if (found.owner && found.owner !== op && !canChangeGear(state, found.owner).ok) return prev;
  op.gear = { ...emptyLoadout(), ...(op.gear ?? {}) };
  const item = found.item;
  const where = placeOf(item.type);
  if (where === 'bag') {
    const at = target?.x != null ? (fitsAt(op, item, target.x, target.y) ? { x: target.x, y: target.y } : null) : (op.gear.bag.some((b) => b.item.uid === uid) ? null : firstFit(op, item));
    if (!at) return prev;
    if (found.owner) takeOff(found.owner, uid); else state.stash = state.stash.filter((i) => i.uid !== uid);
    op.gear.bag.push({ item, x: at.x, y: at.y });
    return state;
  }
  if (found.owner === op) return prev; // already worn
  if (where === 'armour') {
    if (found.owner) takeOff(found.owner, uid); else state.stash = state.stash.filter((i) => i.uid !== uid);
    if (op.gear.armour) state.stash.push(op.gear.armour);
    op.gear.armour = item;
    return state;
  }
  // An implant: into the named socket (swapping what's there), or the free one.
  const socket = target?.socket ?? (op.gear.implants.length < SOCKETS ? op.gear.implants.length : null);
  if (socket == null || socket >= SOCKETS) return prev;
  const others = op.gear.implants.filter((_, i) => i !== socket);
  if (others.some((i) => i.type === item.type)) return prev; // the same implant twice does nothing twice
  if (found.owner) takeOff(found.owner, uid); else state.stash = state.stash.filter((i) => i.uid !== uid);
  const out = op.gear.implants[socket];
  if (out) state.stash.push(out);
  op.gear.implants = [...others.slice(0, socket), item, ...others.slice(socket)].slice(0, SOCKETS);
  return state;
}

/** Take one item off them, back to the stash. */
export function unequip(prev, opId, uid) {
  const op0 = prev.crew.find((o) => o.id === opId);
  if (!op0 || !carried(op0).some((i) => i.uid === uid) || !canChangeGear(prev, op0).ok) return prev;
  const state = structuredClone(prev);
  const op = state.crew.find((o) => o.id === opId);
  const item = carried(op).find((i) => i.uid === uid);
  if (!op.gear.implants || !op.gear.bag) op.gear = { ...emptyLoadout(), ...op.gear };
  takeOff(op, uid);
  (state.stash ??= []).push(item);
  return state;
}

export const emptyLoadout = () => ({ armour: null, implants: [], bag: [] });

/** A loadout holding these item types (standard), for recruits who bring their own. */
export function loadoutOf(state, types = []) {
  const op = { gear: emptyLoadout() };
  for (const type of types) {
    if (!GEAR[type]) continue;
    const where = placeOf(type);
    if (where === 'armour') { if (!op.gear.armour) op.gear.armour = newItem(state, type, BASE_TIER); continue; }
    if (where === 'implant') { if (op.gear.implants.length < SOCKETS && !op.gear.implants.some((i) => i.type === type)) op.gear.implants.push(newItem(state, type, BASE_TIER)); continue; }
    const probe = { uid: '?', type };
    const at = firstFit(op, probe);
    if (at) op.gear.bag.push({ item: newItem(state, type, BASE_TIER), ...at });
  }
  return op.gear;
}
