// Sworn runners (part D4; DESIGN.md 2026-11-09). Provisional playtest defaults, all data.
// Wording is a first pass, fictional (no real triad rites, names or numbers), to be rewritten
// through the `add-lore` skill.

export const OATH = {
  minWeeks: 26, // active weeks
  minLoyalty: 80, // at the time of swearing; sworn status survives loyalty falling later
  costWeeks: 8, // the ceremony costs this many weeks of their current wage (was 2: too cheap; owner chose 8, 2026-11-09)
  approachMult: 0.1, // rival approaches happen at this share of the normal rate
  leavePenalty: -6, // every other crew member's loyalty when a sworn runner is released or sold, once per departure
};

export const fill = (text, vars) => text.replace(/\{(\w+)\}/g, (m, k) => vars[k] ?? m);

export const OATH_TEXT = {
  ready: {
    subject: '{op} could be sworn in',
    body: `{op} has logged {weeks} weeks on the books for us. They're now eligible to be "sworn" into our Tong as a permanent member. Drop {cost} to execute the covenant at the shrine, locking their loyalty and permanently etching their name into the ledger.`,
  },
  sworn: {
    subject: '{op} is sworn in',
    body: `In the front room, you poured {op} a cup of tea. They drank it and wrote their name in the ledger in their own hand. Then the crew ate until the noodle shop downstairs closed. {cost}, well spent.`,
  },
  history: 'Day {day}: wrote their name in the ledger',
};
