// Sworn runners (part D4; DESIGN.md 2026-11-09). Provisional playtest defaults, all data.
// Wording is a first pass, fictional (no real triad rites, names or numbers), to be rewritten
// through the `add-lore` skill.

export const OATH = {
  minWeeks: 26, // active weeks
  minLoyalty: 80, // at the time of swearing; sworn status survives loyalty falling later
  costWeeks: 2, // the ceremony costs this many weeks of their current wage
  approachMult: 0.1, // rival approaches happen at this share of the normal rate
  leavePenalty: -6, // every other crew member's loyalty when a sworn runner is released or sold, once per departure
};

export const fill = (text, vars) => text.replace(/\{(\w+)\}/g, (m, k) => vars[k] ?? m);

export const OATH_TEXT = {
  ready: {
    subject: '{op} could be sworn in',
    body: `Joss: "{op}'s been with us {weeks} weeks, and I think they'd put their name in the ledger if we asked. It's {cost} for the tea, the food and something for the altar. Hold the ceremony is on their page whenever you're ready. No hurry."`,
  },
  sworn: {
    subject: '{op} is sworn in',
    body: `In the front room, you poured {op} a cup of tea. They drank it and wrote their name in the ledger in their own hand, and Joss checked the spelling. Then the crew ate until the noodle shop downstairs closed. {cost}, well spent.`,
  },
  history: 'Day {day}: wrote their name in the ledger',
};
