// A fresh seeded RNG per call, derived from the save's seed and a counter
// stored in state, so results are reproducible across save/load.

import { makeRng } from './rng.js';

export function nextRng(state) {
  state.rngCounter = (state.rngCounter ?? 0) + 1;
  return makeRng((state.seed + state.rngCounter * 7919) >>> 0);
}
