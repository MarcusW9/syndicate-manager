// Gear looks and the armoury's weekly stock (DESIGN.md 2026-10-29). Pure logic.
//
// item.look  { frame, finish, engraving, charm }  how a rifle is built (ui/art.js draws it)
// item.name  "Vermilion Heron"                      what it's called
// state.armoury { day, offers: [{ oid, type, tier, look, name }] }  this week's rifles
//
// Looks come from their own seed (the game's seed and the item's id), not the shared dice, so
// rolling one never changes anything else that happens in the game.

import { makeRng, pick } from './rng.js';
import { RIFLE_LOOKS, ARMOURY_STOCK } from '../data/gearLooks.js';

/** Types that have looks. */
export const HAS_LOOKS = { rifle: RIFLE_LOOKS };

function seedOf(state, key) {
  let h = 2166136261;
  for (const ch of `${state.seed}|${key}`) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
  return h;
}

/** A rifle's look and name for this tier, from its own seed. */
export function rollLook(state, key, tier = 'street') {
  const rng = makeRng(seedOf(state, key));
  const L = RIFLE_LOOKS;
  const odds = L.odds[tier] ?? L.odds.street;
  const frame = pick(rng, Object.keys(L.frames));
  const finish = pick(rng, Object.keys(L.finishes).filter((k) => L.finishes[k].tier === (tier === 'pro' ? 'pro' : 'street')));
  const engraving = rng() < odds.engraving ? pick(rng, Object.keys(L.engravings)) : null;
  const charm = rng() < odds.charm ? pick(rng, odds.charms) : null;
  const look = { frame, finish, engraving, charm };
  return { look, name: nameFor(look, rng) };
}

/** A two-word name from what it's made of: a word from its finish, engraving or charm, then its frame's. */
export function nameFor(look, rng) {
  const L = RIFLE_LOOKS;
  const words = [...L.finishes[look.finish].words, ...(look.engraving ? L.engravings[look.engraving].words : []), ...(look.charm ? L.charms[look.charm].words : [])];
  return `${pick(rng, words)} ${pick(rng, L.frames[look.frame].nouns)}`;
}

/** A name for a rifle that already has its look (old saves). */
export const nameLook = (state, key, look) => nameFor(look, makeRng(seedOf(state, key)));

/** What it's made of, in words: "Carbine in cinnabar lacquer, gold clouds, a red silk tassel". */
export function lookText(item) {
  const L = HAS_LOOKS[item?.type];
  if (!L || !item.look) return '';
  const { frame, finish, engraving, charm } = item.look;
  const base = `${L.frames[frame]?.name} in ${L.finishes[finish]?.name}`;
  return [base.charAt(0).toUpperCase() + base.slice(1), engraving && L.engravings[engraving]?.name, charm && L.charms[charm]?.name].filter(Boolean).join(', ');
}

/** A new item gets a look if its type has them (rifles). Mutates and returns item. */
export function giveLook(state, item) {
  if (HAS_LOOKS[item.type] && !item.look) Object.assign(item, rollLook(state, `item|${item.uid}`, item.tier));
  return item;
}

/** A fresh week of rifles in the armoury (each Monday, and when a game starts). */
export function refreshArmoury(state) {
  const offers = [];
  for (const [tier, n] of Object.entries(ARMOURY_STOCK)) {
    for (let i = 0; i < n; i++) {
      const oid = `o${state.day}-${tier}-${i}`;
      // A week's rifles differ in frame and finish: reroll (from the same seed, so it stays fixed) until they do.
      let roll;
      for (let t = 0; t < 12; t++) {
        roll = rollLook(state, `armoury|${oid}|${t}`, tier);
        if (!offers.some((o) => o.look.frame === roll.look.frame || o.look.finish === roll.look.finish)) break;
      }
      offers.push({ oid, type: 'rifle', tier, ...roll });
    }
  }
  state.armoury = { day: state.day, offers };
  return state;
}
