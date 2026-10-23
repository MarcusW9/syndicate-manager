// Development: hidden potential, growth from doing the work, mentoring,
// age and decline. Pure logic. See DESIGN.md (development) for the targets.
//
// Each operative carries:
//   tier       'rookie' | 'pro' | 'veteran'  (rookies graduate to pro at GRADUATE_AT)
//   potential  stat -> hidden ceiling. Never shown as a number.
//   progress   stat -> points banked towards the next +1
//   startStats stats on the day they joined, to show growth
//   scoutError how far off the crew's read of their ceiling is (fuzzy potential)

import { ROLE_PROFILES } from '../data/recruitPools.js';

export const STATS = ['combat', 'stealth', 'tech', 'social', 'driving', 'medical', 'cool'];

// Growth points. Tuned with simulations (tests/development.test.js):
// a good rookie goes ~11 -> 16-17 in their main stat over ~20-25 jobs.
export const XP = {
  roll: 4, // made the roll in a crisis (success or failure: they learn either way)
  watch: 1, // on the crew when someone else rolled
  job: 2, // per key stat, for finishing a job
  craft: 3, // in their own main stat, for finishing a job (medics patch people up, muscle keeps watch...)
};
export const MENTOR_RATE = 1.5;
export const GRADUATE_AT = 15; // rookie -> pro when their main stat gets here

/** Points needed for the next +1. Higher stats cost more; the last point before the ceiling costs double.
 *  The 1.7 scale is the main tuning knob (see the curve in DESIGN.md). */
export function pointCost(value, ceiling) {
  return (value + 4) * 1.7 * (ceiling - value <= 1 ? 2 : 1);
}

export const ageRate = (age) => (age < 25 ? 1.5 : age < 35 ? 1 : 0.5);

export const primaryStat = (op) => ROLE_PROFILES[op.role]?.primary ?? 'cool';

const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
const between = (rng, lo, hi) => lo + Math.floor(rng() * (hi - lo + 1));

function inferTier(op) {
  if (op.traits?.includes('veteran') || op.age >= 38) return 'veteran';
  if (op.age < 25 && op.stats[primaryStat(op)] < GRADUATE_AT) return 'rookie';
  return 'pro';
}

/** Room above current stats by age, for operatives without a rolled potential (starting crew, old saves). */
const defaultHeadroom = (age) => (age < 25 ? 2 : age < 35 ? 1 : 0);

/** Fill in any missing development fields. Mutates and returns op. */
export function prepareOperative(op) {
  op.tier = op.tier ?? inferTier(op);
  const room = defaultHeadroom(op.age);
  op.potential = { ...op.potential };
  for (const s of STATS) op.potential[s] = clamp(op.potential[s] ?? op.stats[s] + room, op.stats[s], 20);
  op.progress = op.progress ?? {};
  op.startStats = op.startStats ?? { ...op.stats };
  op.scoutError = op.scoutError ?? 0;
  return op;
}

// --- potential for generated recruits --------------------------------------

// Main-stat ceiling for rookies, as [ceiling, % chance]. 20 is world-class and very rare (1 in 50).
const ROOKIE_CEILING = [[14, 15], [15, 20], [16, 25], [17, 20], [18, 12], [19, 6], [20, 2]];

function weightedCeiling(rng) {
  let r = rng() * 100;
  for (const [v, w] of ROOKIE_CEILING) { r -= w; if (r < 0) return v; }
  return 16;
}

/** Hidden ceilings per stat. Rookies have the most room; veterans are near their peak. */
export function rollPotential(rng, stats, tier, role) {
  const { primary, secondary } = ROLE_PROFILES[role];
  const potential = {};
  for (const s of STATS) {
    const now = stats[s];
    let ceiling;
    if (s === primary) {
      ceiling = tier === 'rookie' ? Math.max(now + 1, weightedCeiling(rng))
        : tier === 'pro' ? Math.max(now, between(rng, 15, 17))
        : now + (rng() < 0.5 ? 0 : 1);
    } else {
      const [lo, hi] = tier === 'rookie' ? (secondary.includes(s) ? [1, 4] : [0, 3]) : tier === 'pro' ? [0, 2] : [0, 1];
      ceiling = now + between(rng, lo, hi);
    }
    potential[s] = clamp(ceiling, now, 20);
  }
  return potential;
}

/** How wrong the scout is about the main-stat ceiling: usually right, sometimes off by 1-2. */
export function rollScoutError(rng) {
  const r = rng();
  const size = r < 0.55 ? 0 : r < 0.88 ? 1 : 2;
  return size && rng() < 0.5 ? -size : size;
}

// --- reading potential (fuzzy) ------------------------------------------------

/** Who gives the opinion: someone in the same role, else a veteran, else the coolest head. */
export function scoutFor(crew, role, excludeId) {
  const others = crew.filter((o) => o.id !== excludeId && o.condition?.injury !== 'dead');
  const same = others.filter((o) => o.role === role).sort((a, b) => b.stats[primaryStat(b)] - a.stats[primaryStat(a)]);
  if (same.length) return same[0];
  return others.find((o) => o.traits.includes('veteran')) ?? [...others].sort((a, b) => b.stats.cool - a.stats.cool)[0] ?? null;
}

/** The crew's opinion of someone's ceiling. Uses the stored scoutError, so it can be wrong. */
export function potentialRead(op, scoutName, nameOverride) {
  const stat = primaryStat(op);
  const now = op.stats[stat];
  const seen = clamp((op.potential?.[stat] ?? now) + (op.scoutError ?? 0), now, 20);
  const room = seen - now;
  const who = scoutName ?? 'Your scout';
  const name = nameOverride ?? op.handle;
  if (room <= 0) return `${who}: "Already as good as ${name} will get."`;
  if (room === 1) return `${who} thinks ${name} is close to their best already.`;
  if (seen >= 18) return `${who} thinks ${name} could be special.`;
  if (seen >= 16) return `${who} reckons ${name} will be better than most pros you could hire, given the work.`;
  return `${who} thinks ${name} will come on a bit, but won't be a star.`;
}

// --- growth -----------------------------------------------------------------

/** Mentors on this crew for op: any veteran-trait operative, or a veteran in the same role. Rookies only. */
export function mentorsOf(op, crew) {
  if (op.tier !== 'rookie') return [];
  return crew.filter((o) => o.id !== op.id && o.condition?.injury !== 'dead' &&
    (o.traits.includes('veteran') || (o.role === op.role && o.tier === 'veteran')));
}

/** Rookie -> mentor pairs for a planned crew (for the planning screen). */
export function mentoring(crew) {
  return crew.map((op) => ({ op, mentors: mentorsOf(op, crew) })).filter((p) => p.mentors.length);
}

/** Bank growth points in one stat. Mutates op; returns how many points the stat went up. */
export function growStat(op, stat, points) {
  const ceiling = op.potential?.[stat] ?? op.stats[stat];
  if (op.stats[stat] >= ceiling || points <= 0) { op.progress[stat] = 0; return 0; }
  let banked = (op.progress[stat] ?? 0) + points;
  let gained = 0;
  while (op.stats[stat] < ceiling && banked >= pointCost(op.stats[stat], ceiling)) {
    banked -= pointCost(op.stats[stat], ceiling);
    op.stats[stat] += 1;
    gained += 1;
  }
  op.progress[stat] = op.stats[stat] >= ceiling ? 0 : Math.round(banked * 100) / 100;
  return gained;
}

/**
 * Apply a mission's raw growth points to its crew. xp: opId -> stat -> points.
 * Mutates the operatives; returns { lines, graduated } for the report.
 */
export function applyGrowth(crew, xp) {
  const lines = [];
  const graduated = [];
  for (const op of crew) {
    prepareOperative(op);
    const raw = xp[op.id];
    if (!raw) continue;
    const rate = ageRate(op.age) * (mentorsOf(op, crew).length ? MENTOR_RATE : 1);
    for (const stat of STATS) {
      const before = op.stats[stat];
      if (growStat(op, stat, (raw[stat] ?? 0) * rate)) lines.push(`${op.handle} ${stat} ${before}→${op.stats[stat]}`);
    }
    if (op.tier === 'rookie' && op.stats[primaryStat(op)] >= GRADUATE_AT) {
      op.tier = 'pro';
      graduated.push(op);
    }
  }
  return { lines, graduated };
}

// --- seasons: birthdays and decline ------------------------------------------

/** Chance per stat of losing a point at the season turn. Starts past 40. */
export const declineChance = (age) => (age > 40 ? Math.min(0.5, (age - 40) * 0.1) : 0);

/** New season: everyone ages a year; anyone past 40 may lose points. Mutates; returns report lines. */
export function ageCrew(crew, rng) {
  const lines = [];
  for (const op of crew) {
    prepareOperative(op);
    op.age += 1;
    const chance = declineChance(op.age);
    const lost = [];
    for (const s of STATS) {
      if (chance && op.stats[s] > 1 && rng() < chance) {
        op.stats[s] -= 1;
        op.potential[s] = Math.min(op.potential[s], op.stats[s]);
        lost.push(s);
      }
    }
    if (lost.length) lines.push(`${op.handle} (${op.age}) has lost a step: ${lost.join(', ')} -1.`);
  }
  return lines;
}
