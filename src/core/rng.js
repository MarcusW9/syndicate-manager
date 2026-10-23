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
