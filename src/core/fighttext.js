// Engine 2's text filling (the wording itself is data/fightText.js, placeholders the owner will replace).
// Kept in core because it is logic: src/data/ is content only.

import { FIGHT_TEXT } from '../data/fightText.js';

const fillText = (text, slots) => text.replace(/\{(\w+)\}/g, (_, k) => (slots[k] ?? `{${k}}`));

/** A line or threat as text: its key's placeholder with its slots. An unknown key reads as the key. */
export const lineText = (key, slots = {}) => (FIGHT_TEXT[key] ? fillText(FIGHT_TEXT[key], slots) : key);
