// Traits give personality and small mechanical effects.
// effects: stat modifiers (+/-), or flags the mission/event code reads.
// tier: rarity on recruits (common, uncommon, rare, exotic), picked with pickTiered.

export const TRAITS = {
  steady_hands: { tier: 'uncommon', name: 'Steady Hands', desc: '+2 medical when stabilising under fire.', effects: { stabiliseBonus: 2 } },
  cautious: { tier: 'common', name: 'Cautious', desc: 'Morale drops on high-threat jobs; less likely to be hurt.', effects: { injuryChance: -0.1, highThreatMorale: -5 } },
  hothead: { tier: 'common', name: 'Hothead', desc: '+2 combat, -2 cool. May act without orders.', effects: { combat: 2, cool: -2, rogueChance: 0.1 } },
  loyal: { tier: 'common', name: 'Loyal', desc: 'Ignores buyout offers while trust is above 0.', effects: { buyoutImmune: true } },
  chromed: { tier: 'rare', name: 'Chromed', desc: '+2 tech, neural load builds 50% faster.', effects: { tech: 2, neuralRate: 1.5 } },
  curious: { tier: 'common', name: 'Curious', desc: 'Sometimes finds bonus intel; sometimes trips alarms.', effects: { intelChance: 0.15 } },
  veteran: { tier: 'rare', name: 'Veteran', desc: '+1 cool for the whole crew on the job.', effects: { crewCool: 1 } },
  superstitious: { tier: 'common', name: 'Superstitious', desc: 'Won\'t start a job on any day number ending in 4.', effects: { unluckyDigit: 4 } },
  silver_tongue: { tier: 'uncommon', name: 'Silver Tongue', desc: 'Unlocks talk-your-way-out options in crises.', effects: { unlocks: 'talk' } },
  greedy: { tier: 'common', name: 'Greedy', desc: 'Morale tied to pay; buyout offers tempt her more.', effects: { buyoutChance: 1.5 } },
};
