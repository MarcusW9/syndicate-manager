// Seeded random numbers (mulberry32). Same seed = same results,
// which makes bugs reproducible and saves stable.

export function makeRng(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Roll a d20 (1-20). */
export function d20(rng) {
  return 1 + Math.floor(rng() * 20);
}

export function pick(rng, list) {
  return list[Math.floor(rng() * list.length)];
}

/**
 * A stable 32-bit number for a list of keys (FNV-1a over their text). For rolls that must not move
 * the saved counter (core/random.js nextRng), so adding them changes no other roll in the game:
 * named offers and fame pay asks (renown slice 4).
 */
export function hash(...parts) {
  let h = 2166136261;
  for (const ch of parts.join('|')) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

/** hash() as a number in [0, 1): a roll that is a pure function of its keys, drawing from no stream (showcases, watchable-combat 0b). */
export const hash01 = (...parts) => hash(...parts) / 2 ** 32;

/** A generator seeded from hash(...parts): the same keys always give the same numbers. */
export const hashRng = (...parts) => makeRng(hash(...parts));
