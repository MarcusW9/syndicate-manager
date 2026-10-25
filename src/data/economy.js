// Tunable economy numbers. Data only; the formulas live in core/pricing.js and core/heat.js.

export const ECONOMY = {
  // Base wage: base + total stats × perStat + main stat × perMainStat.
  wage: { base: 150, perStat: 5, perMainStat: 10, roundTo: 50 },
  // Star premium: × (1 + max(0, (main − from) / divisor) ^ power).
  premium: { from: 12, divisor: 10, power: 1.5 },
  // The founding crew work for street wages: this share of market price (PLAN-PROGRESSION.md).
  streetWage: 0.6,
  // The founding crew's first safehouse is cheaper than the authored crew's (¥4,000).
  startRent: 1500,
  // The fixer notice at high heat: what paying costs and how much heat it takes off.
  heat: { fixerCost: 1500, fixerCools: 3 },
};
