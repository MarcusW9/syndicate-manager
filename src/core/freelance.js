// Freelancers: guns for hire for a single job. Pure logic.
// They take a share of what the job pays instead of a wage, fill a crew slot
// (so they count against short-handed and can back someone up), and leave
// when the job ends. One per job. A fresh board every Monday.

import { generateRecruit } from './recruits.js';

export const FREELANCE_SHARE = { rookie: 0.15, pro: 0.2, veteran: 0.25 };
export const FREELANCERS_PER_WEEK = 2;
export const MAX_FREELANCERS_PER_JOB = 1;

export const isFreelancer = (op) => Boolean(op?.freelance);
export const shareOf = (f) => FREELANCE_SHARE[f.quality] ?? 0.2;

/** Their cut of a payout, rounded to 50 like all pay. */
export const freelanceCut = (f, pay) => Math.round((pay * shareOf(f)) / 50) * 50;

/** Monday: last week's freelancers move on, new ones are on the board until Sunday. */
export function refreshFreelancers(state) {
  state.freelancers = [];
  for (let i = 0; i < FREELANCERS_PER_WEEK; i++) {
    const r = generateRecruit(state);
    state.freelancers.push({ ...r, id: `f${r.id}`, expiresDay: state.day + 6, freelance: true });
  }
}

/** Turn a board entry into a temporary crew member for one job. */
export function freelancerAsCrew(f) {
  const { expiresDay, haggled, culture, scoutReport, ...op } = f;
  return {
    ...op,
    tier: f.quality,
    condition: { fatigue: 0, morale: 60, neuralLoad: 0, burnout: 0, injury: 'healthy', injuryDays: 0 },
    trust: {},
    history: [],
    growthLog: [],
    progress: {},
    startStats: { ...f.stats },
  };
}
