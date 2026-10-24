// Tags steer recruit generation: a backstory's tags become the recruit's
// leanings, and traits/lines that share a leaning are picked more often.
// Tiers set rarity. They sit on lines and traits, never on tags.

export const TAGS = ['calm', 'hot', 'warm', 'cold', 'charming', 'wary', 'curious', 'chrome', 'superstitious', 'money', 'haunted'];

// Never together in one recruit's text.
export const CLASHES = [['calm', 'hot'], ['warm', 'cold'], ['charming', 'wary']];

export const TRAIT_TAGS = {
  steady_hands: ['calm'],
  veteran: ['calm', 'haunted'],
  hothead: ['hot'],
  loyal: ['warm'],
  greedy: ['cold', 'money'],
  silver_tongue: ['charming'],
  cautious: ['wary'],
  curious: ['curious'],
  chromed: ['chrome'],
  superstitious: ['superstitious'],
};

export const ROLE_TAGS = {
  medic: ['calm'],
  driver: ['calm'],
  muscle: ['hot'],
  face: ['charming'],
  tech: ['chrome', 'curious'],
  infiltrator: ['curious'],
};

// Percent chance of each tier, most common first. Must add up to 100.
export const TIER_ODDS = { common: 60, uncommon: 28, rare: 10, exotic: 2 };

// A matching leaning multiplies an item's weight within its tier.
export const STEER_WEIGHT = 3;
