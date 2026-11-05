// Gangs and their grudges (DESIGN.md 2026-11-05, the tong's Phase 2: gang raids). A gang remembers
// the jobs that hurt it (a job's `against`), the grudge fades a little each week, and a gang with a
// big grudge may raid one of our halls on its own turf. Gangs expect settlements: tribute, scaled
// by the grudge, always on offer. The Brass Anchor Society never raids (owner); Veridian-Apex and the
// Racing Association aren't gangs (Glass Heights' raids are police raids). Numbers are first
// guesses for the playtest. Content only; the rules are in core/gangs.js and core/raids.js.

export const GANGS = {
  redLanterns: { name: 'the Red Lanterns', short: 'Red Lanterns', faction: 'Red Lantern', turf: ['docks'], who: 'Red Lantern enforcers', one: 'enforcer' },
  silverFan: { name: 'the Silver Fan Circle', short: 'Silver Fan', faction: 'Silver Fan', turf: ['nightMarket', 'basin'], who: 'Silver Fan collectors', one: 'collector' },
};

export const GRUDGE = {
  max: 10,
  fadeWeekly: 1, // every Sunday each grudge eases by this much
  raidAt: 6, // from here a gang may raid a hall of ours on its turf
  // A job against a gang adds by its threat: 1 for threat 1-2, 2 for 3-4, 3 for 5.
  forThreat: (threat) => 1 + (threat >= 3 ? 1 : 0) + (threat >= 5 ? 1 : 0),
  tribute: { base: 1000, perGrudge: 500 }, // settling: they expect it, and it's never cheap
  lateTribute: 1.5, // at the door, half again
  settleKeeps: 0.5, // settling halves the grudge
};
