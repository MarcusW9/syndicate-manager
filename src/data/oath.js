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
  ready: { subject: '{op} could be sworn', body: 'Joss: "{op} has been with us {weeks} weeks and would stand behind the hall. Their page has a Hold the ceremony button, for {cost}, whenever you want it. No hurry."' },
  sworn: { subject: '{op} is sworn', body: '{op} stood in the front room and took the oath before the crew. It cost {cost} in tea, food and good faith.' },
  history: 'Day {day}: sworn into the tong',
};
