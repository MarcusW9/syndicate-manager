// Crew leads (DESIGN.md 2026-11-04, Phase 1 call 4): a runner the street rates (Respected or
// above) leads the crew and takes one risky call themselves before calling you. It changes who
// decides, never a roll, pay or heat: the crew's orders pick the choice, as on any call the crew
// makes, so the shown risk is still the used risk.

import { fameOf, fameName } from './fame.js';

export const LEAD_FAME = ['respected', 'elite', 'legend'];
export const LEAD_CALLS = 1;

/** The crew's lead, from the people inside: the best-rated Respected-or-above runner, or null. */
export function crewLead(ops) {
  const rated = ops.filter((op) => op && LEAD_FAME.includes(fameOf(op)));
  if (!rated.length) return null;
  const rank = (op) => LEAD_FAME.indexOf(fameOf(op)) * 1000 + (op.standing ?? 0);
  const op = [...rated].sort((a, b) => rank(b) - rank(a))[0];
  return { id: op.id, handle: op.handle, fame: fameName(fameOf(op)), calls: LEAD_CALLS };
}
