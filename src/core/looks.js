// Gear looks and the armoury's weekly stock (DESIGN.md 2026-10-29). Pure logic.
//
// item.look  how a gun is built (ui/art.js draws it): a rifle's { frame, finish, engraving, charm,
//            glow? }, a sidearm's { frame, finish, mod, charm, glow? }
// item.name  "Vermilion Heron"  what it's called
// state.armoury { day, offers: [{ oid, type, tier, look, name }] }  this week's guns
//
// Looks come from their own seed (the game's seed and the item's id), not the shared dice, so
// rolling one never changes anything else that happens in the game.

import { makeRng, pick } from './rng.js';
import { RIFLE_LOOKS, SIDEARM_LOOKS, GLOWS, ARMOURY_STOCK } from '../data/gearLooks.js';

/** Types that have looks. */
export const HAS_LOOKS = { rifle: RIFLE_LOOKS, pistol: SIDEARM_LOOKS };
// The third part of each look: a rifle's engraving, a sidearm's mod (its key and its table).
const EXTRA = { rifle: ['engraving', 'engravings'], pistol: ['mod', 'mods'] };

function seedOf(state, key) {
  let h = 2166136261;
  for (const ch of `${state.seed}|${key}`) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
  return h;
}

/** Does anything on it light up? Only then does it have a glow colour. */
function lightsUp(type, look) {
  const L = HAS_LOOKS[type];
  const [slot, table] = EXTRA[type];
  return Boolean(L.frames[look.frame]?.glows || L.finishes[look.finish]?.glows || L[table][look[slot]]?.glows || L.charms[look.charm]?.glows);
}

/** A gun's look and name for this tier, from its own seed. */
export function rollLook(state, key, tier = 'street', type = 'rifle') {
  const rng = makeRng(seedOf(state, key));
  const L = HAS_LOOKS[type];
  const [slot, table] = EXTRA[type];
  const shelf = tier === 'pro' ? 'pro' : 'street';
  const odds = L.odds[shelf];
  const onShelf = (t) => Object.keys(L[t]).filter((k) => !L[t][k].tier || L[t][k].tier === shelf);
  const frame = pick(rng, onShelf('frames'));
  const finish = pick(rng, onShelf('finishes'));
  const extra = rng() < odds[slot] ? pick(rng, odds[table] ?? Object.keys(L[table])) : null;
  const charm = rng() < odds.charm ? pick(rng, odds.charms) : null;
  const look = { frame, finish, [slot]: extra, charm };
  if (lightsUp(type, look)) look.glow = pick(rng, Object.keys(GLOWS));
  return { look, name: nameFor(look, rng, type) };
}

/** A two-word name from what it's made of (and the colour it glows), then a word from its frame. */
export function nameFor(look, rng, type = 'rifle') {
  const L = HAS_LOOKS[type];
  const [slot, table] = EXTRA[type];
  const words = [...L.finishes[look.finish].words, ...(look[slot] ? L[table][look[slot]].words : []), ...(look.charm ? L.charms[look.charm].words : []), ...(look.glow ? GLOWS[look.glow].words : [])];
  return `${pick(rng, words)} ${pick(rng, L.frames[look.frame].nouns)}`;
}

/** A name for a gun that already has its look (old saves). */
export const nameLook = (state, key, look, type = 'rifle') => nameFor(look, makeRng(seedOf(state, key)), type);

/** What it's made of, in words: "Carbine in carbon, a neon circuit, neon purple lights". */
export function lookText(item) {
  const L = HAS_LOOKS[item?.type];
  if (!L || !item.look) return '';
  const [slot, table] = EXTRA[item.type];
  const { frame, finish, charm, glow } = item.look;
  const base = `${L.frames[frame]?.name} in ${L.finishes[finish]?.name}`;
  return [base.charAt(0).toUpperCase() + base.slice(1), item.look[slot] && L[table][item.look[slot]]?.name, charm && L.charms[charm]?.name, glow && `${GLOWS[glow].name} lights`].filter(Boolean).join(', ');
}

/** A new item gets a look if its type has them (rifles and sidearms). Mutates and returns item. */
export function giveLook(state, item) {
  if (HAS_LOOKS[item.type] && !item.look) Object.assign(item, rollLook(state, `item|${item.uid}`, item.tier, item.type));
  return item;
}

/** This week's guns of one type: each a different frame and finish. */
export function stockShelf(state, type) {
  const offers = [];
  for (const [tier, n] of Object.entries(ARMOURY_STOCK[type] ?? {})) {
    for (let i = 0; i < n; i++) {
      const oid = `o${state.day}-${type}-${tier}-${i}`;
      // Reroll (from the same seed, so it stays fixed) until it differs from the others.
      let roll;
      for (let t = 0; t < 12; t++) {
        roll = rollLook(state, `armoury|${oid}|${t}`, tier, type);
        if (!offers.some((o) => o.look.frame === roll.look.frame || o.look.finish === roll.look.finish)) break;
      }
      offers.push({ oid, type, tier, ...roll });
    }
  }
  return offers;
}

/** A fresh week of guns in the armoury (each Monday, and when a game starts). */
export function refreshArmoury(state) {
  state.armoury = { day: state.day, offers: Object.keys(ARMOURY_STOCK).flatMap((type) => stockShelf(state, type)) };
  return state;
}
