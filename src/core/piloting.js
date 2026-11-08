// Piloting (drafts/PROPOSAL-piloting.md, DESIGN.md 2026-11-08): driving, boats and drones, valued as
// time. This file holds the getaway step: when a job is leaving heat, the Wheels (else the team's best
// pilot) gets the crew out; a good getaway sheds some of that heat, a bad one leaves a tail.
// A quiet job has no getaway roll and is never punished. Pure logic.

import { effectiveStat } from './crew.js';
import { rollTarget } from './risk.js';
import { d20 } from './rng.js';

export const GETAWAY = { clean: 5, shedClean: 2, shedGood: 1, bad: -5 };
// Followed home (DESIGN.md 2026-11-08): a getaway that fails leads them to the crew's hall. For
// FOLLOW.days.fail / .bad days a raid there is one threat step harder and the heat it takes to draw one is FOLLOW.heatEase lower (careful play stays clear).
// A pilot of FOLLOW.skilled or better shakes the lesser tail (a plain failure) and shortens the worse.
export const FOLLOW = { days: { fail: 3, bad: 6 }, skilled: 14, skilledCut: 3, threat: 1, heatEase: 2 };

/** The roll to beat: 10 + the job's typical difficulty + 1 per alert point. */
export const getawayDifficulty = (template, alert = 0) => Math.round(rollTarget(template)) + alert;

/** Who drives: the Wheels if they can, else the best pilot of those who came home. */
export function getawayPilot(pool, wheels, approach) {
  const able = pool.filter((o) => o.condition.injury !== 'critical');
  if (wheels && able.includes(wheels)) return wheels;
  return [...able].sort((a, b) => effectiveStat(b, 'piloting', { approach }).value - effectiveStat(a, 'piloting', { approach }).value)[0] ?? null;
}

/** Odds read for the planning screen and the sim: { value, need, chance } for a pilot on this job. */
export function getawayRead(pilot, template, { approach, alert = 0 } = {}) {
  if (!pilot) return null;
  const value = effectiveStat(pilot, 'piloting', { approach }).value;
  const diff = getawayDifficulty(template, alert);
  const need = 10 + diff;
  return { value, diff, need, chance: Math.min(0.95, Math.max(0.05, (21 - (need - value)) / 20)) };
}

/**
 * Play the getaway. heat: the heat the job is about to leave (0 means no roll); sheddable: how much
 * of it a good getaway can take off (the crew's own mess; the Loud approach's +1 stays). Returns null when
 * there is nothing to shed or nobody to drive, else { pilot, die, value, need, margin, result, shed, tail }.
 * result: 'clean' | 'good' | 'fail' | 'bad'. shed never takes the job below zero heat.
 */
export function playGetaway({ pilot, heat, sheddable = heat, template, approach, alert = 0, alertMax = 3, rng }) {
  if (!pilot || !(heat > 0)) return null;
  const read = getawayRead(pilot, template, { approach, alert });
  const die = d20(rng);
  const margin = die + read.value - read.need;
  const result = margin >= GETAWAY.clean ? 'clean' : margin >= 0 ? 'good' : margin <= GETAWAY.bad ? 'bad' : 'fail';
  const shed = Math.min(sheddable, result === 'clean' ? GETAWAY.shedClean : result === 'good' ? GETAWAY.shedGood : 0);
  const tail = result === 'bad' || (result !== 'clean' && result !== 'good' && alert >= alertMax && alertMax > 0);
  const raw = result === 'fail' ? FOLLOW.days.fail : result === 'bad' ? FOLLOW.days.bad : 0;
  const followed = raw && read.value >= FOLLOW.skilled ? Math.max(0, raw - FOLLOW.skilledCut) : raw;
  return { pilot, die, value: read.value, need: read.need, margin, result, shed, tail, followed };
}

/** Which hall they'd lead the followers to: the one most of the crew live in (null if no hall stands). */
export function homeHallOf(state, crew, homeDistrict) {
  const count = {};
  for (const o of crew) { const d = o.hall ?? homeDistrict; count[d] = (count[d] ?? 0) + 1; }
  const best = Object.entries(count).sort((a, b) => b[1] - a[1])[0]?.[0];
  return (state.halls ?? []).find((h) => h.district === best) ?? null;
}

/** Is this hall being watched by someone who followed the crew home? */
export const followedIn = (state, district) => ((state.halls ?? []).find((h) => h.district === district)?.followedUntil ?? 0) > state.day;
