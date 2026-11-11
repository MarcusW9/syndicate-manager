// Engine 2's text filling (the wording itself is data/fightText.js).
// Kept in core because it is logic: src/data/ is content only.
//
// Slots are {name}. A plural switch reads {n:one|many}: it prints "one" when the slot is 1, else "many"
// ("{n} {n:shot|shots}"). A line starts with a capital, so a slot at the start can be lowercase.

import { FIGHT_TEXT } from '../data/fightText.js';

const fillText = (text, slots) => text
  .replace(/\{(\w+):([^|}]*)\|([^}]*)\}/g, (_, k, one, many) => (Number(slots[k]) === 1 ? one : many))
  .replace(/\{(\w+)\}/g, (_, k) => (slots[k] ?? `{${k}}`));
const capital = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/** A line or threat as text: its key's wording with its slots. An unknown key reads as the key. */
export const lineText = (key, slots = {}) => (FIGHT_TEXT[key] ? capital(fillText(FIGHT_TEXT[key], slots)) : key);

/** An enemy's kind as a word ("security guard" for corp); an unknown kind reads as itself. */
export const kindWord = (kind) => FIGHT_TEXT[`kind.${kind}`] ?? kind;

/** One enemy as the feed names it: the kind word and its number ("security guard 2"). */
export const enemyName = (kind, n) => `${kindWord(kind)} ${n}`;

/** Names as a list in a sentence: "Jax", "Jax and Velvet", "Jax, Velvet and Static". */
export const nameList = (names) => (names.length < 2 ? names.join('') : `${names.slice(0, -1).join(', ')} and ${names.at(-1)}`);
