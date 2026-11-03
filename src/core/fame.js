// Fame, standing and paths (renown slice 3, 2026-11; plan in drafts/PROPOSAL-runner-renown.md
// sections 2.3-2.5). Pure logic. Fame is earned from the record (core/record.js); standing is
// how the street rates someone right now. Neither touches a roll, pay, heat or the planning read:
// nothing in crew.js, risk.js or squad.js reads them.
//
// op.fame ('unknown' | 'known' | 'respected' | 'elite') and op.standing (0-100) are written the
// first time someone finishes a job, like op.record; read them with fameOf / standingOf.
// Freelancers have neither.

import { PATHS } from '../data/paths.js';
import {
  FAME_TIERS, FAME_NAMES, FAME_RULES, ELITE_LAPSE, STANDING, STANDING_START, STANDING_WORDS,
  ELITE_TEXT, ELITE_BACK, ELITE_LOST, FAME_HISTORY, ELITE_HIGHLIGHT_WEIGHT,
} from '../data/fame.js';
import { isFreelancer } from './freelance.js';
import { recordOf, workedThisWeek } from './record.js';
import { addHighlight } from './milestones.js';

export const fameOf = (op) => op.fame ?? 'unknown';
export const standingOf = (op) => op.standing ?? STANDING_START;
export const fameName = (fame) => FAME_NAMES[fame] ?? fame;
const clampStanding = (n) => Math.max(0, Math.min(100, Math.round(n)));

/** How the street rates them, in words (shown for Elite). */
export function standingWord(op) {
  const s = standingOf(op);
  return STANDING_WORDS.find(([at]) => s >= at)[1];
}

/** A record field by name: 'clean', 'carriesByStat.combat', or a list of fields added together. */
function valueOf(r, field) {
  if (Array.isArray(field)) return field.reduce((n, f) => n + valueOf(r, f), 0);
  return field.split('.').reduce((o, k) => o?.[k], r) ?? 0;
}

const ratio = (conds, key) => conds.reduce((n, c) => n + Math.min(1, c.value / c[key]), 0) / conds.length;

/**
 * Every path's progress for a runner, in table order: [{ id, name, line, conditions:
 * [{ label, value, elite, legend }], toElite, toLegend (0-1, the average over conditions),
 * eliteMet, legendMet }].
 */
export function pathProgress(op) {
  const r = recordOf(op);
  return PATHS.map((p) => {
    const conditions = p.conditions.map((c) => ({ label: c.label, value: valueOf(r, c.field), elite: c.elite, legend: c.legend }));
    return {
      id: p.id, name: p.name, line: p.line, conditions,
      toElite: ratio(conditions, 'elite'), toLegend: ratio(conditions, 'legend'),
      eliteMet: conditions.every((c) => c.value >= c.elite), legendMet: conditions.every((c) => c.value >= c.legend),
    };
  });
}

/** Their path: the one their record is furthest along towards Legend (ties: the earlier path). */
export function pathOf(op) {
  return pathProgress(op).reduce((best, p) => (p.toLegend > best.toLegend ? p : best));
}

/** The path that carries them to Elite: their own if it's met, else the first that is. */
function elitePath(op) {
  const all = pathProgress(op);
  const mine = pathOf(op);
  return mine.eliteMet ? mine : all.find((p) => p.eliteMet) ?? null;
}

/** Does the record (and standing) meet the Elite rule right now? */
export function eliteRuleMet(op) {
  const r = recordOf(op), e = FAME_RULES.elite;
  if (r.activeWeeks < e.activeWeeks || standingOf(op) < e.standing) return false;
  const paths = pathProgress(op);
  const lifer = paths.find((p) => p.id === 'lifer');
  if (lifer.eliteMet && r.jobs >= e.liferJobs) return true; // Lifers: jobs instead of at-level work
  return r.atLevel >= e.atLevel && paths.some((p) => p.eliteMet);
}

/** The highest tier the record reaches now (fame only ever climbs to it one step at a time). */
export function fameTarget(op) {
  const r = recordOf(op);
  if (eliteRuleMet(op)) return 'elite';
  if (r.activeWeeks >= FAME_RULES.respected.activeWeeks && r.atLevel >= FAME_RULES.respected.atLevel) return 'respected';
  if (r.jobs >= FAME_RULES.known.jobs) return 'known';
  return 'unknown';
}

/**
 * Legend readiness (slice 3 shows it; the defining job that awards Legend is slice 5): every
 * condition with whether it's met. Ready when all are.
 */
export function legendProgress(op) {
  const r = recordOf(op), l = FAME_RULES.legend;
  const paths = pathProgress(op);
  const lifer = paths.find((p) => p.id === 'lifer');
  const pathMet = paths.find((p) => p.legendMet) ?? null;
  const checks = [
    { label: 'Elite', met: fameOf(op) === 'elite' },
    { label: 'a veteran', met: op.tier === l.tier },
    { label: `${l.activeWeeks} active weeks`, met: r.activeWeeks >= l.activeWeeks },
    { label: `${l.atLevel} jobs at their level`, met: r.atLevel >= l.atLevel || lifer.legendMet },
    { label: 'a path\'s Legend numbers', met: !!pathMet },
  ];
  return { checks, ready: checks.every((c) => c.met), path: pathMet };
}

export const legendEligible = (op) => !isFreelancer(op) && legendProgress(op).ready;

const fill = (text, vars) => text.replace(/\{(\w+)\}/g, (m, k) => vars[k] ?? m);

/** Move fame up one tier if the record has reached a higher one. Returns the new tier or null. Mutates. */
function stepFame(state, op) {
  const now = FAME_TIERS.indexOf(fameOf(op));
  const target = FAME_TIERS.indexOf(fameTarget(op));
  if (target <= now) return null;
  const next = FAME_TIERS[now + 1];
  op.fame = next;
  const r = op.record;
  if (next !== 'elite') {
    op.history.push(`Day ${state.day}: ${FAME_HISTORY[next]}`);
    return next;
  }
  const path = elitePath(op) ?? pathOf(op);
  const back = !!r?.wasElite;
  const vars = { op: op.handle, name: op.name, path: path.name };
  const msg = back ? ELITE_BACK : ELITE_TEXT[path.id];
  op.history.push(`Day ${state.day}: ${fill(back ? FAME_HISTORY.eliteBack : FAME_HISTORY.elite, vars)}`);
  if (r) {
    r.lowWeeks = 0;
    if (!back) addHighlight(r, { id: 'elite', day: state.day, text: `${op.handle} became Elite: a ${path.name}.`, weight: ELITE_HIGHLIGHT_WEIGHT });
  }
  state.inbox.unshift({
    id: `elite-${op.id}-${state.day}`, type: 'crew', day: state.day,
    subject: fill(msg.subject, vars), body: fill(msg.body, vars), blocking: false, read: false,
  });
  return next;
}

/** One job's change in standing for one runner. facts: { atLevel, carries } from recordJob. */
export function jobStanding({ outcome, atLevel, carries, milestones, retreat, seriousInjury }) {
  const S = STANDING;
  let d = 0;
  if (outcome === 'completed') d += atLevel ? S.atLevel : S.belowLevel;
  else d += S.lost;
  d += Math.min(S.carryMax, carries * S.carry);
  d += milestones * S.milestone;
  if (retreat) d += S.retreat;
  if (seriousInjury) d += S.seriousInjury;
  return d;
}

/**
 * After a job (finish(), after checkMilestones): standing for everyone who came home, then fame
 * (one tier at most). Returns report lines [{ opId, fame, text }] for anyone made Elite. Mutates.
 *
 * ctx: { outcome, facts: { [opId]: { atLevel, carries } }, milestones: [{ opIds }], retreat }
 */
export function afterJobFame(state, people, { outcome, facts, milestones, retreat }) {
  const lines = [];
  for (const op of people) {
    if (isFreelancer(op) || !op.record) continue;
    const f = facts[op.id] ?? { atLevel: false, carries: 0 };
    const earned = milestones.filter((m) => (m.opIds ?? [m.opId]).includes(op.id)).length;
    const hurt = op.condition.injury === 'serious' || op.condition.injury === 'critical';
    op.fame = fameOf(op);
    op.standing = clampStanding(standingOf(op) + jobStanding({ outcome, atLevel: f.atLevel, carries: f.carries, milestones: earned, retreat, seriousInjury: hurt }));
    const rose = stepFame(state, op);
    if (rose === 'elite') lines.push({ opId: op.id, fame: rose, text: `${op.handle} is Elite now (${(elitePath(op) ?? pathOf(op)).name}).` });
  }
  return lines;
}

/** Hands-off crews still out count as working this week. */
const awayIds = (state) => new Set((state.awayJobs ?? []).flatMap(({ mission: am }) => [...am.crewIds, am.overwatch?.id, am.wheels, am.standby?.id].filter(Boolean)));

/**
 * Sunday (settleWeek, after weeklyRecord): standing slips for anyone who didn't work this week,
 * Elite lapses after two Sundays in a row under 20, then fame may climb a tier. Mutates.
 */
export function weeklyFame(state) {
  const away = awayIds(state);
  for (const op of state.crew) {
    if (isFreelancer(op) || !op.record) continue;
    const r = op.record;
    op.fame = fameOf(op);
    if (!workedThisWeek(op, state.day) && !away.has(op.id)) {
      op.standing = clampStanding(standingOf(op) + (op.condition.injury === 'healthy' ? STANDING.benchHealthy : STANDING.benchInjured));
    } else op.standing = standingOf(op);
    if (op.fame === 'elite') {
      r.lowWeeks = op.standing < ELITE_LAPSE.below ? (r.lowWeeks ?? 0) + 1 : 0;
      if (r.lowWeeks >= ELITE_LAPSE.sundays) {
        op.fame = 'respected';
        r.wasElite = true;
        r.lowWeeks = 0;
        const vars = { op: op.handle, name: op.name };
        op.history.push(`Day ${state.day}: ${FAME_HISTORY.eliteLost}`);
        state.inbox.unshift({ id: `elite-lost-${op.id}-${state.day}`, type: 'crew', day: state.day,
          subject: fill(ELITE_LOST.subject, vars), body: fill(ELITE_LOST.body, vars), blocking: false, read: false });
        continue; // no climbing back the same Sunday
      }
    } else r.lowWeeks = 0;
    stepFame(state, op);
  }
}

/** Save v32: fame and standing for runners who already have a record. Nobody starts as Elite. */
export function seedFame(op) {
  if (isFreelancer(op) || !op.record) return;
  const r = op.record;
  r.lowWeeks = r.lowWeeks ?? 0;
  r.wasElite = r.wasElite ?? false;
  op.standing = op.standing ?? Math.min(50, r.jobs * 3);
  if (op.fame == null) {
    const target = fameTarget(op);
    op.fame = target === 'elite' ? 'respected' : target;
  }
}
