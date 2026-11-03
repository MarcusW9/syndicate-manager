// Development: hidden potential, growth from doing the work, mentoring,
// age and decline. Pure logic. See DESIGN.md (development) for the targets.
//
// Each operative carries:
//   tier       'rookie' | 'pro' | 'veteran'  (rookies graduate to pro at GRADUATE_AT)
//   potential  stat -> hidden ceiling. Never shown as a number.
//   progress   stat -> points banked towards the next +1
//   startStats stats on the day they joined, to show growth
//   scoutError how far off the crew's read of their ceiling is (fuzzy potential)
//   growthLog  [{ stat, from, to, day }] for this season's rises and declines

import { ROLE_PROFILES } from '../data/recruitPools.js';
import { NAMES } from '../config/names.js';
import { emptyLoadout } from './gear.js';

export const STATS = ['combat', 'stealth', 'tech', 'social', 'driving', 'medical', 'cool'];

// Growth points. Tuned with simulations (tests/development.test.js and
// PLAN-PROGRESSION.md step 0): a founding rookie goes ~9 -> 15 over season one.
export const XP = {
  roll: 4, // made the roll in a crisis (success or failure: they learn either way)
  watch: 1, // on the crew when someone else rolled
  job: 2, // per key stat, for finishing a job
  craft: 3, // in their own main stat, for finishing a job (medics patch people up, muscle keeps watch...)
  // The squad run (retuned 2026-10-27, owner's ratio): a small incident teaches a quarter of a
  // crisis roll, a save (or patching someone up on the spot) half. Nobody learns by watching an incident.
  incident: 1,
  save: 2,
};
export const MENTOR_RATE = 1.5;
export const GRADUATE_AT = 15; // rookie -> pro when their main stat gets here

// Cost per point: (stat + 4) × GROWTH_SCALE. The scale is the main tuning knob
// (1.7 until 2026-10-25; x2.5 for the slower climb). The ceiling is a wall, not a
// stop: past it every point costs WALL times more, up to 20. WALL was 4 until the squad-run
// retune (2026-10-27): incidents teach the person who handles them, and an infiltrator on
// stealth runs handles most of them, so a low ceiling needed a steeper wall (scripts/sim-growth.mjs).
export const GROWTH_SCALE = 4.25;
export const WALL = 6;
export const MAX_STAT = 20;

/** Points needed for the next +1. Higher stats cost more; the last point before the ceiling costs double; past it, WALL times. */
export function pointCost(value, ceiling) {
  const base = (value + 4) * GROWTH_SCALE;
  if (value >= ceiling) return base * WALL;
  return base * (ceiling - value <= 1 ? 2 : 1);
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
  op.growthLog = op.growthLog ?? [];
  op.status = op.status ?? [];
  op.jobsWithCrew = op.jobsWithCrew ?? 0;
  op.contractMainStat = op.contractMainStat ?? op.stats[primaryStat(op)];
  op.lastNoticeDay = op.lastNoticeDay ?? null;
  op.renewalAgain = op.renewalAgain ?? false;
  op.gear = op.gear ?? emptyLoadout();
  op.marks = op.marks ?? [];
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

/** Which way the crew reads someone's ceiling: 'peaked' (at or past it) | 'close' | 'legend' | 'special' | 'strong' | 'some'. Uses scoutError, so it can be wrong. */
function potentialBand(op) {
  const now = op.stats[primaryStat(op)];
  const seen = clamp((op.potential?.[primaryStat(op)] ?? now) + (op.scoutError ?? 0), now, 20);
  const room = seen - now;
  if (room <= 0) return 'peaked';
  if (room === 1) return 'close';
  if (seen >= MAX_STAT) return 'legend'; // a ceiling of 20: about 1 rookie in 50, or a scout who's too hopeful
  if (seen >= 18) return 'special';
  if (seen >= 16) return 'strong';
  return 'some';
}

// The read is in the crew's terms, not a sports-style "star" rating: what kind of job
// someone could carry one day, and how near their wall (the soft ceiling in pointCost)
// they are. Bands line up with job threat (STAT_FOR_THREAT in risk.js): 'legend' is the
// best there is, 'special' ~ the threat-5 work, 'strong' ~ threat 4, 'some' tops out around threat 3.

/** The crew's opinion of someone's ceiling, as a sentence. */
export function potentialRead(op, scoutName, nameOverride) {
  const who = scoutName ?? 'Your scout';
  const name = nameOverride ?? op.handle;
  return {
    peaked: `${who}: "${name}'s hit their wall. More comes slow from here."`,
    close: `${who} thinks ${name} is nearly at their wall.`,
    legend: `${who} has never seen anything like ${name}. Could be one of the best ${NAMES.city} has ever had.`,
    special: `${who} reckons ${name} could be top-tier, the kind a crew builds its biggest jobs around.`,
    strong: `${who} reckons ${name} will grow into the hard jobs, given the work.`,
    some: `${who} thinks ${name} will be a steady pair of hands, but the big jobs will always be a stretch.`,
  }[potentialBand(op)];
}

/** The same read in a few words, for the crew list. */
export function potentialTag(op) {
  return { peaked: 'at their wall', close: 'nearly at their wall', legend: 'could be one of the greats', special: 'built for the big jobs', strong: 'grows into hard jobs', some: 'a steady pair of hands' }[potentialBand(op)];
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
  if (op.stats[stat] >= MAX_STAT) { op.progress[stat] = 0; return 0; }
  if (points <= 0) return 0;
  let banked = (op.progress[stat] ?? 0) + points;
  let gained = 0;
  while (op.stats[stat] < MAX_STAT && banked >= pointCost(op.stats[stat], ceiling)) {
    banked -= pointCost(op.stats[stat], ceiling);
    op.stats[stat] += 1;
    gained += 1;
  }
  op.progress[stat] = op.stats[stat] >= MAX_STAT ? 0 : Math.round(banked * 100) / 100;
  return gained;
}

/** Record a rise or decline in the operative's growth log. */
function logChange(op, stat, from, to, day) {
  op.growthLog = op.growthLog ?? [];
  op.growthLog.push({ stat, from, to, day });
}

/** How far op is towards the next +1 in a stat, 0-1 (for the progress bars). */
export function progressShare(op, stat) {
  if (op.stats[stat] >= MAX_STAT) return 1;
  const cost = pointCost(op.stats[stat], op.potential?.[stat] ?? op.stats[stat]);
  return Math.max(0, Math.min(1, (op.progress?.[stat] ?? 0) / cost));
}

/**
 * Grow one stat from raw points right now (age and mentoring applied).
 * Mutates op; returns { events: [{ opId, handle, stat, from, to, wall }], graduated }.
 * wall: this rise reached their ceiling in their main stat (growth slows from here).
 */
export function gainXp(op, crew, stat, raw, day) {
  prepareOperative(op);
  const rate = ageRate(op.age) * (mentorsOf(op, crew).length ? MENTOR_RATE : 1);
  const from = op.stats[stat];
  const events = [];
  if (growStat(op, stat, raw * rate)) {
    logChange(op, stat, from, op.stats[stat], day);
    const ceiling = op.potential?.[stat] ?? 0;
    const wall = stat === primaryStat(op) && from < ceiling && op.stats[stat] >= ceiling;
    events.push({ opId: op.id, handle: op.handle, stat, from, to: op.stats[stat], ...(wall ? { wall: true } : {}) });
  }
  let graduated = false;
  if (op.tier === 'rookie' && op.stats[primaryStat(op)] >= GRADUATE_AT) {
    op.tier = 'pro';
    graduated = true;
  }
  return { events, graduated };
}

/**
 * Apply banked raw growth points to a crew. xp: opId -> stat -> points.
 * Mutates the operatives; returns { events, graduated: [op] }.
 */
export function applyGrowth(crew, xp, day = 0) {
  const events = [];
  const graduated = [];
  for (const op of crew) {
    const raw = xp[op.id];
    if (!raw) continue;
    for (const stat of STATS) {
      if (!raw[stat]) continue;
      const r = gainXp(op, crew, stat, raw[stat], day);
      events.push(...r.events);
      if (r.graduated) graduated.push(op);
    }
  }
  return { events, graduated };
}

/** Net change per stat since a given day, from the growth log: { tech: 2, driving: -1 }. */
export function changesSince(op, sinceDay) {
  const net = {};
  for (const e of op.growthLog ?? []) {
    if (e.day >= sinceDay) net[e.stat] = (net[e.stat] ?? 0) + e.to - e.from;
  }
  for (const k of Object.keys(net)) if (!net[k]) delete net[k];
  return net;
}

// --- seasons: birthdays and decline ------------------------------------------

/** Chance per stat of losing a point at the season turn. Starts past 40. */
export const declineChance = (age) => (age > 40 ? Math.min(0.5, (age - 40) * 0.1) : 0);

/**
 * New season: everyone ages a year; anyone past 40 may lose points. The growth
 * log starts fresh for the new season (declines are its first entries).
 * Mutates; returns report lines.
 */
export function ageCrew(crew, rng, day = 0) {
  const lines = [];
  for (const op of crew) {
    prepareOperative(op);
    op.growthLog = op.growthLog.filter((e) => e.day >= day);
    op.age += 1;
    const chance = declineChance(op.age);
    const lost = [];
    for (const s of STATS) {
      if (chance && op.stats[s] > 1 && rng() < chance) {
        op.stats[s] -= 1;
        op.potential[s] = Math.min(op.potential[s], op.stats[s]);
        logChange(op, s, op.stats[s] + 1, op.stats[s], day);
        lost.push(s);
      }
    }
    if (lost.length) lines.push(`${op.handle} (${op.age}) has lost a step: ${lost.join(', ')} -1.`);
  }
  return lines;
}
