// Sworn runners (part D4; DESIGN.md 2026-11-09): a lasting place in the tong. Not a rank or a stat:
// no bonus, no permanent raise. Eligible at 26 active weeks and 80 loyalty; the ceremony is the
// player's choice, costs OATH.costWeeks weeks of the runner's wage, and stays on the runner's page while they
// are eligible. One eligibility notice per runner, remembered in `op.oathNotified`; sworn is `op.sworn`
// (the day, or null) and survives loyalty falling. Rival approaches read it (core/mobility.js).

import { OATH, OATH_TEXT, fill } from '../data/oath.js';
import { recordOf } from './record.js';
import { loyaltyPoints } from './loyalty.js';
import { money } from './money.js';

export const isSworn = (op) => !!op.sworn;
export const oathCost = (op) => OATH.costWeeks * op.wage;

/** Could this runner be sworn today (before the cost)? */
export function oathEligible(op) {
  return !op.freelance && op.condition.injury !== 'dead' && !isSworn(op)
    && recordOf(op).activeWeeks >= OATH.minWeeks && loyaltyPoints(op) >= OATH.minLoyalty;
}

/** The runner's page reads this: { ok, cost, reason }. */
export function oathRead(state, op) {
  if (!oathEligible(op)) return { ok: false, cost: oathCost(op), reason: null };
  const cost = oathCost(op);
  return state.cash >= cost ? { ok: true, cost, reason: null } : { ok: false, cost, reason: `Needs ${money(cost)} in cash.` };
}

/** Sunday: one notice, once per runner, the first week they are eligible. At most one notice a week. Mutates. */
export function weeklyOath(state) {
  const op = state.crew.find((o) => oathEligible(o) && !o.oathNotified);
  if (!op) return;
  op.oathNotified = true;
  const vars = { op: op.handle, weeks: String(recordOf(op).activeWeeks), cost: money(oathCost(op)) };
  state.inbox.unshift({ id: `oath-ready-${op.id}-${state.day}`, type: 'crew', day: state.day, subject: fill(OATH_TEXT.ready.subject, vars), body: fill(OATH_TEXT.ready.body, vars), blocking: false, read: false });
}

/** Hold the ceremony: eligibility and cash are checked again. Returns the new state, or prev if it can't be done. */
export function swearIn(prev, opId) {
  const op = prev.crew.find((o) => o.id === opId);
  if (!op || !oathRead(prev, op).ok) return prev;
  const state = structuredClone(prev);
  const sworn = state.crew.find((o) => o.id === opId);
  const cost = oathCost(sworn);
  state.cash -= cost;
  sworn.sworn = state.day;
  sworn.oathNotified = true;
  sworn.history.push(fill(OATH_TEXT.history, { day: state.day }));
  const vars = { op: sworn.handle, cost: money(cost) };
  state.inbox.unshift({ id: `oath-${sworn.id}-${state.day}`, type: 'crew', day: state.day, subject: fill(OATH_TEXT.sworn.subject, vars), body: fill(OATH_TEXT.sworn.body, vars), blocking: false, read: false });
  return state;
}
