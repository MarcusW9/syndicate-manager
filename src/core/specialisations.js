// Specialisations (PLAN-CORE-LOOP.md, slice 5b): doing a role with the stats for it makes one ready to learn. One per person. Pure logic.
// Learned at a level-up since 2026-11-20 (core/levelup.js; the gates are read in core/abilities.js skillMenu); Joss's offer and its
// "not yet" (op.specSnooze) are gone (save v83).
//
// op.spec          { id, day } once they've taken one
// op.track.overwatch { rifle: n, drone: n }  jobs on overwatch with each kit (a gate, shown on the skills list)
// What a specialisation does on overwatch is applied in core/gear.js overwatchKit.

import { SPECIALISATIONS } from '../data/specialisations.js';

export { SPECIALISATIONS };

/** Their specialisation's entry ({ id, ...data }), or null. */
export const specOf = (op) => (op?.spec && SPECIALISATIONS[op.spec.id] ? { id: op.spec.id, ...SPECIALISATIONS[op.spec.id] } : null);

/** A job done on overwatch with this kit. Mutates op. */
export function noteOverwatchJob(op, kit) {
  op.track ??= {};
  op.track.overwatch ??= {};
  op.track.overwatch[kit] = (op.track.overwatch[kit] ?? 0) + 1;
}
