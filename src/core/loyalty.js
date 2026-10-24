// Loyalty: how long someone has stuck with the crew. Callers only use these two functions.

export const LOYALTY_PER_JOB = 0.01;
export const MAX_LOYALTY_DISCOUNT = 0.25;

/** 0-1: share of the full loyalty discount earned (1% per job with the crew, capped at 25%). */
export const loyalty = (op) => Math.min(MAX_LOYALTY_DISCOUNT, (op.jobsWithCrew ?? 0) * LOYALTY_PER_JOB) / MAX_LOYALTY_DISCOUNT;

/** Discount off a raise on renewal, 0 to MAX_LOYALTY_DISCOUNT. */
export const loyaltyDiscount = (op) => loyalty(op) * MAX_LOYALTY_DISCOUNT;
