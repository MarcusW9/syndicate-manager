// What people cost. Pure logic; numbers come from data/economy.js.

import { ECONOMY } from '../data/economy.js';
import { primaryStat } from './development.js';

export const round50 = (n) => Math.round(n / ECONOMY.wage.roundTo) * ECONOMY.wage.roundTo;

/** Star premium M: 1 below the threshold, rising steeply above it. */
export function marketMultiplier(main) {
  const { from, divisor, power } = ECONOMY.premium;
  return 1 + Math.max(0, (main - from) / divisor) ** power;
}

/** Market wage for an operative: base wage × M, rounded to 50. */
export function marketWage(op) {
  const { base, perStat, perMainStat } = ECONOMY.wage;
  const total = Object.values(op.stats).reduce((a, b) => a + b, 0);
  const main = op.stats[primaryStat(op)];
  return round50((base + total * perStat + main * perMainStat) * marketMultiplier(main));
}
