// Traits give personality and small mechanical effects.
// effects: stat modifiers (+/-), or flags the mission/event code reads.

export const TRAITS = {
  steady_hands: { name: 'Steady Hands', desc: '+2 medical when stabilising under fire.', effects: { stabiliseBonus: 2 } },
  cautious: { name: 'Cautious', desc: 'Morale drops on high-threat jobs; less likely to be hurt.', effects: { injuryChance: -0.1, highThreatMorale: -5 } },
  hothead: { name: 'Hothead', desc: '+2 combat, -2 cool. May act without orders.', effects: { combat: 2, cool: -2, rogueChance: 0.1 } },
  loyal: { name: 'Loyal', desc: 'Ignores buyout offers while trust is above 0.', effects: { buyoutImmune: true } },
  chromed: { name: 'Chromed', desc: '+2 tech, neural load builds 50% faster.', effects: { tech: 2, neuralRate: 1.5 } },
  curious: { name: 'Curious', desc: 'Sometimes finds bonus intel; sometimes trips alarms.', effects: { intelChance: 0.15 } },
  veteran: { name: 'Veteran', desc: '+1 cool for the whole crew on the job.', effects: { crewCool: 1 } },
  superstitious: { name: 'Superstitious', desc: 'Refuses jobs on the 4th, 14th and 24th of the month.', effects: { badDays: [4, 14, 24] } },
  silver_tongue: { name: 'Silver Tongue', desc: 'Unlocks talk-your-way-out options in crises.', effects: { unlocks: 'talk' } },
  greedy: { name: 'Greedy', desc: 'Morale tied to pay; buyout offers tempt her more.', effects: { buyoutChance: 1.5 } },
};
