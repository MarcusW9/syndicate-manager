// Loyalty (part D2, save v56; DESIGN.md 2026-11-09): `op.loyalty`, 0-100, moving slowly each Sunday.
// It only drives staying, leaving and what they ask for (renewal raises today; rival offers and
// "sworn" later); it is not morale and no roll reads it. A runner with no `loyalty` yet reads as the
// old rule (4 points a job together), so old saves and new hires behave as before until their first Sunday.
// Callers of the renewal discount use `loyalty` and `loyaltyDiscount`.

import { marketWage } from './pricing.js';
import { workedThisWeek } from './record.js';

export const LOYALTY_PER_JOB = 0.01; // the old rule: 1% off the raise a job together...
export const MAX_LOYALTY_DISCOUNT = 0.25; // ...up to 25%
export const LOYALTY_RULES = {
  worked: 4, // a week they were used on real work (tenure and serious work)
  fairPay: 1, // paid at least this share of market value
  fairShare: 0.95,
  lowPay: -2, belowShare: 0.85, // paid under this share of market value
  benched: -2, // healthy and not used all week
  lostMate: -6, // someone on the crew died this week
  refusedRaise: -15, // a pay rise turned down
};

const clamp = (n) => Math.max(0, Math.min(100, n));
/** The points they have, 0-100: stored, or worked out from jobs together for a runner without one yet. */
export const loyaltyPoints = (op) => op.loyalty ?? clamp(Math.round((op.jobsWithCrew ?? 0) * 4));

/** 0-1: share of the full loyalty discount earned. extraJobs: a den's (core/renewals.js), worth 4 points a job. */
export const loyalty = (op, extraJobs = 0) => Math.min(1, loyaltyPoints(op) / 100 + extraJobs * 0.04);

/** Discount off a raise on renewal, 0 to MAX_LOYALTY_DISCOUNT. */
export const loyaltyDiscount = (op, extraJobs = 0) => loyalty(op, extraJobs) * MAX_LOYALTY_DISCOUNT;

/** Move loyalty by points (clamped). Mutates. */
export function addLoyalty(op, points) { op.loyalty = clamp(loyaltyPoints(op) + points); }

/** Sunday (settleWeek, after weeklyRecord): each hired runner's loyalty moves a little. Mutates the (cloned) state. */
export function weeklyLoyalty(state) {
  const R = LOYALTY_RULES;
  const lostMate = (state.memorial ?? []).some((m) => m.day > state.day - 7 && m.day <= state.day);
  for (const op of state.crew) {
    if (op.freelance || op.condition.injury === 'dead') continue;
    let d = 0;
    const market = marketWage(op);
    if (workedThisWeek(op, state.day)) d += R.worked;
    else if (op.condition.injury === 'healthy') d += R.benched;
    if (op.wage >= market * R.fairShare) d += R.fairPay;
    else if (op.wage < market * R.belowShare) d += R.lowPay;
    if (lostMate) d += R.lostMate;
    addLoyalty(op, d);
  }
}
