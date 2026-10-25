// Recruiting: generated operatives, weekly scout leads, hiring, safehouse
// expansion. Pure logic. All randomness is seeded through nextRng(state).

import { CULTURES, HANDLES, ROLE_PROFILES, ORIGINS, TEMPERAMENTS, HABITS, BADGE_COLORS } from '../data/recruitPools.js';
import { TRAITS } from '../data/traits.js';
import { NAMES } from '../config/names.js';
import { nextRng } from './random.js';
import { pick, d20 } from './rng.js';
import { bestFor } from './crew.js';
import { marketWage } from './pricing.js';
import { pickTiered } from './tiered.js';
import { CLASHES, TRAIT_TAGS } from '../data/tags.js';
import { rollPotential, rollScoutError, scoutFor, potentialRead, prepareOperative } from './development.js';

export const STARTING_ROSTER_CAP = 8;
export const LEAD_DAYS = 7;
export const HAGGLE_DIFFICULTY = 11;

const TRAIT_ITEMS = Object.entries(TRAITS).map(([id, t]) => ({ id, tier: t.tier, tags: TRAIT_TAGS[id] ?? [] }));

/** Two different trait ids, each tier first, then steered by the leanings (a backstory's tags). */
export function pickTraits(rng, leanings = []) {
  const first = pickTiered(rng, TRAIT_ITEMS, leanings);
  const second = pickTiered(rng, TRAIT_ITEMS.filter((t) => t.id !== first.id), leanings);
  return [first.id, second.id];
}

/** Cost and effect of the next safehouse expansion. */
export function nextExpansion(state) {
  const level = state.safehouseLevel ?? 1;
  return { cost: 10000 * level, beds: 2, rentIncrease: 1000, level: level + 1 };
}

const QUALITY = [
  { id: 'rookie', weight: 50, age: [18, 24], primary: [10, 13], secondary: [6, 10], other: [3, 8] },
  { id: 'pro', weight: 38, age: [25, 37], primary: [13, 16], secondary: [9, 12], other: [5, 9] },
  { id: 'veteran', weight: 12, age: [38, 52], primary: [15, 18], secondary: [10, 14], other: [6, 10] },
];

const weighted = (rng, items) => {
  const total = items.reduce((n, i) => n + i.weight, 0);
  let r = rng() * total;
  for (const i of items) { r -= i.weight; if (r < 0) return i; }
  return items.at(-1);
};
const between = (rng, [lo, hi]) => lo + Math.floor(rng() * (hi - lo + 1));

/** Roles the crew is missing get picked more often. */
function pickRole(rng, crew) {
  const roles = Object.keys(ROLE_PROFILES);
  const counts = Object.fromEntries(roles.map((r) => [r, crew.filter((o) => o.role === r).length]));
  return weighted(rng, roles.map((r) => ({ r, weight: counts[r] === 0 ? 4 : counts[r] === 1 ? 2 : 1 }))).r;
}

/** Generate one recruit. Deterministic for a given state seed + counter. */
// Lines whose tags don't clash with any of the given tags.
function withoutClashes(lines, tags) {
  const banned = CLASHES.flatMap(([a, b]) => (tags.includes(a) ? [b] : tags.includes(b) ? [a] : []));
  return lines.filter((l) => !l.tags.some((t) => banned.includes(t)));
}

export function generateRecruit(state, { role: forcedRole, quality: forcedQuality } = {}) {
  const rng = nextRng(state);
  const culture = weighted(rng, CULTURES);
  const rolledQuality = weighted(rng, QUALITY);
  const quality = QUALITY.find((q) => q.id === forcedQuality) ?? rolledQuality;
  const rolledRole = pickRole(rng, state.crew);
  const role = forcedRole ?? rolledRole;
  const profile = ROLE_PROFILES[role];

  const stats = {};
  for (const s of ['combat', 'stealth', 'tech', 'social', 'driving', 'medical', 'cool']) {
    const band = s === profile.primary ? quality.primary : profile.secondary.includes(s) ? quality.secondary : quality.other;
    stats[s] = between(rng, band);
  }


  const takenHandles = new Set([...state.crew, ...state.memorial, ...(state.recruits ?? []), ...(state.freelancers ?? [])].map((o) => o.handle));
  const freeHandles = HANDLES.filter((h) => !takenHandles.has(h));
  const handle = freeHandles.length ? pick(rng, freeHandles) : `${pick(rng, HANDLES)} ${between(rng, [2, 9])}`;

  const district = pick(rng, Object.values(NAMES.districts));
  const originLine = pickTiered(rng, ORIGINS[role]);
  const origin = originLine.text.replace('{district}', district);
  const traits = pickTraits(rng, originLine.tags);

  // Market price: rookies ~500 (alongside the starting crew), stars cost more.
  const wage = marketWage({ role, stats });

  const name = `${pick(rng, culture.given)} ${pick(rng, culture.surnames)}`;
  const age = between(rng, quality.age);
  const color = pick(rng, BADGE_COLORS);
  // Temperament + habit, steered by the backstory's tags, never a clashing pair.
  const temperament = pickTiered(rng, withoutClashes(TEMPERAMENTS, originLine.tags), originLine.tags);
  const habit = pickTiered(rng, withoutClashes(HABITS, [...originLine.tags, ...temperament.tags]), originLine.tags);
  const bio = `${temperament.text} ${habit.text}`;

  // Hidden ceiling, plus the crew's (sometimes wrong) read of it.
  const potential = rollPotential(rng, stats, quality.id, role);
  const scoutError = rollScoutError(rng);
  const scout = scoutFor(state.crew, role);
  const scoutReport = potentialRead({ role, stats, potential, scoutError }, scout?.handle, name.split(' ')[0]);

  state.recruitSeq = (state.recruitSeq ?? 0) + 1;
  return {
    id: `r${state.recruitSeq}`,
    name,
    handle,
    age,
    culture: culture.id,
    quality: quality.id,
    origin,
    role,
    stats,
    traits,
    wage,
    color,
    bio,
    potential,
    scoutError,
    scoutReport,
    expiresDay: state.day + LEAD_DAYS,
    haggled: false,
  };
}

// A generated starting crew ("Fresh crew"): one of each core role, one veteran,
// two pros and two rookies, and a wage bill near the authored crew's (¥3,050)
// so the opening week still forces the same choice. See DESIGN.md.
export const FRESH_CREW_ROLES = ['medic', 'muscle', 'tech', 'driver', 'face'];
export const FRESH_CREW_QUALITIES = ['veteran', 'pro', 'pro', 'rookie', 'rookie'];
export const FRESH_CREW_WAGES = [2700, 3400];

/** Five generated recruits for a new game. Rerolls until the wage bill fits (max 20 tries). */
export function generateStartingCrew(state) {
  let best = null;
  for (let attempt = 0; attempt < 20; attempt++) {
    // generateRecruit reads the crew (for handles) and advances the counters, so work on a scratch copy.
    const work = { ...state, crew: [] };
    const rng = nextRng(work);
    const qualities = [...FRESH_CREW_QUALITIES];
    for (let i = qualities.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [qualities[i], qualities[j]] = [qualities[j], qualities[i]];
    }
    for (const [i, role] of FRESH_CREW_ROLES.entries()) work.crew.push(generateRecruit(work, { role, quality: qualities[i] }));
    state.rngCounter = work.rngCounter;
    state.recruitSeq = work.recruitSeq;
    const bill = work.crew.reduce((n, r) => n + r.wage, 0);
    const miss = bill < FRESH_CREW_WAGES[0] ? FRESH_CREW_WAGES[0] - bill : Math.max(0, bill - FRESH_CREW_WAGES[1]);
    if (!best || miss < best.miss) best = { crew: work.crew, miss };
    if (miss === 0) break;
  }
  return best.crew;
}

/** Weekly scouting (Wednesdays): 1 lead, or 2 when the crew is short-handed. */
export function scoutWeek(state) {
  state.recruits = (state.recruits ?? []).filter((r) => r.expiresDay >= state.day);
  const n = state.crew.length < 4 ? 2 : 1;
  const found = [];
  for (let i = 0; i < n && state.recruits.length < 4; i++) {
    const r = generateRecruit(state);
    state.recruits.push(r);
    found.push(r);
  }
  if (!found.length) return;
  state.inbox.unshift({
    id: `scout-${state.day}`, type: 'scout', day: state.day,
    subject: found.length > 1 ? `${found.length} people want in` : `A ${found[0].role} wants in: "${found[0].handle}"`,
    body: found.map((r) => `${r.name} "${r.handle}", ${r.age}, ${r.role}. ${r.origin}`).join(' ') + ` Leads go cold in ${LEAD_DAYS} days. See the Crew screen.`,
    blocking: false, read: false,
  });
}

export const signingFee = (recruit) => recruit.wage; // one week's wage up front

export function canHire(state, recruit) {
  if (state.crew.length >= (state.rosterCap ?? STARTING_ROSTER_CAP)) return { ok: false, reason: 'The safehouse is full' };
  if (state.cash < signingFee(recruit)) return { ok: false, reason: 'Not enough cash for the signing fee' };
  return { ok: true };
}

/** Turn a recruit into a crew member: drop the recruit-only fields. */
export function recruitToOperative(r, { condition, history }) {
  const { expiresDay, haggled, haggleResult, quality, culture, ...op } = r;
  return prepareOperative({ ...op, tier: quality, condition, trust: {}, history });
}

export function hire(prev, recruitId) {
  const state = structuredClone(prev);
  const r = state.recruits?.find((x) => x.id === recruitId);
  if (!r || !canHire(state, r).ok) return prev;
  state.cash -= signingFee(r);
  state.recruits = state.recruits.filter((x) => x.id !== recruitId);
  state.crew.push(recruitToOperative(r, {
    condition: { fatigue: 0, morale: 60, neuralLoad: 0, burnout: 0, injury: 'healthy', injuryDays: 0 },
    history: [`Day ${state.day}: joined the crew`],
  }));
  state.inbox.unshift({
    id: `hired-${r.id}`, type: 'crew', day: state.day,
    subject: `${r.handle} joins the crew`,
    body: `${r.name} signed for ${r.wage} a week. Paid a ${signingFee(r)} signing fee.`, blocking: false, read: false,
  });
  return state;
}

/** One haggle per recruit, rolled by your best talker. Success: 15% lower wage. */
export function haggle(prev, recruitId) {
  const state = structuredClone(prev);
  const r = state.recruits?.find((x) => x.id === recruitId);
  if (!r || r.haggled) return prev;
  r.haggled = true;
  const talker = bestFor(state.crew, 'social', {});
  const success = talker && d20(nextRng(state)) + talker.value >= 10 + HAGGLE_DIFFICULTY;
  if (success) r.wage = Math.round((r.wage * 0.85) / 50) * 50;
  r.haggleResult = success ? `${talker.op.handle} talked them down to ${r.wage} a week.` : `${talker ? talker.op.handle : 'You'} tried, but they won't budge.`;
  return state;
}

export function passRecruit(prev, recruitId) {
  const state = structuredClone(prev);
  state.recruits = (state.recruits ?? []).filter((x) => x.id !== recruitId);
  return state;
}

export function expandSafehouse(prev) {
  const state = structuredClone(prev);
  const x = nextExpansion(state);
  if (state.cash < x.cost) return prev;
  state.cash -= x.cost;
  state.rosterCap = (state.rosterCap ?? STARTING_ROSTER_CAP) + x.beds;
  state.rent += x.rentIncrease;
  state.safehouseLevel = x.level;
  state.inbox.unshift({
    id: `safehouse-${state.day}`, type: 'finance', day: state.day,
    subject: `Safehouse expanded: room for ${state.rosterCap}`,
    body: `You took over the flat next door. Paid ${x.cost}. Rent is now ${state.rent} a week.`, blocking: false, read: false,
  });
  return state;
}
