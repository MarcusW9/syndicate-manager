// Gangs' grudges (DESIGN.md 2026-11-05, the tong's Phase 2: gang raids). Pure logic.
//
// A job that hurts a gang (its template's `against`, data/gangs.js) adds to that gang's grudge when
// the crew finishes it (an aborted job doesn't), more at higher threat. Every Sunday each grudge
// fades a little. A gang whose grudge reaches GRUDGE.raidAt may raid a hall of ours on its own turf
// (core/raids.js); settling with them halves it. state.grudges (save v41): { gangId: 0-10 }.

import { GANGS, GRUDGE } from '../data/gangs.js';

export { GANGS, GRUDGE };

export const grudgeOf = (state, gang) => state.grudges?.[gang] ?? 0;

/** Add to (or take from) a gang's grudge, clamped 0-10. Mutates state. Returns the change. */
export function addGrudge(state, gang, n) {
  if (!GANGS[gang]) return 0;
  const before = grudgeOf(state, gang);
  const after = Math.max(0, Math.min(GRUDGE.max, before + n));
  state.grudges = { ...(state.grudges ?? {}), [gang]: after };
  return after - before;
}

/** What finishing this job would add, for the plan to show before you take it: { gang, n } or null. */
export function jobGrudge(tpl, threat = tpl?.threat ?? 1) {
  if (!tpl?.against || !GANGS[tpl.against]) return null;
  return { gang: tpl.against, n: GRUDGE.forThreat(threat) };
}

/** Sunday: every grudge eases. Mutates state. */
export function fadeGrudges(state) {
  if (Math.floor((state.day - 1) / 7) % (GRUDGE.fadeEvery ?? 1) !== 0) return state; // every other Sunday
  for (const g of Object.keys(GANGS)) if (grudgeOf(state, g) > 0) addGrudge(state, g, -GRUDGE.fadeWeekly);
  return state;
}

/** The gangs whose turf a district is (the gangs that can raid a hall there). */
export const gangsOn = (district) => Object.keys(GANGS).filter((g) => GANGS[g].turf.includes(district));

/** A gang's grudge in words, for the cards and Who's who. */
export function grudgeWord(n) {
  if (n >= GRUDGE.raidAt) return 'out for us';
  if (n >= 4) return 'angry';
  if (n >= 1) return 'annoyed';
  return 'no quarrel';
}
