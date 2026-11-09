// Retirement and the Hall of Legends (renown slice 6; part D1 of drafts/PROPOSAL-phase-3.md).
// Sunday (settleWeek, after weeklyFame): at most one request a week across the crew, never for
// someone out on a job, a side task or hurt, never without the player's answer: Stay one more season
// (a rise, a snooze) or Let them go (gear to the stash, a Hall entry for the notable). Chance and
// pick use hashRng only, so no other roll in the game moves. State: `state.hall` (entries),
// `op.retireSnoozeUntil`, `op.retireAsks`. Pure logic.

import { RETIREMENT, RETIRE_TEXT, RETIRE_REPLY, HALL_EPITAPH, fill } from '../data/retirement.js';
import { hashRng } from './rng.js';
import { recordOf, recordSummary } from './record.js';
import { isFreelancer } from './freelance.js';
import { round50 } from './pricing.js';
import { carried } from './gear.js';
import { pathOf } from './fame.js';
import { money } from './money.js';

const clamp01 = (n, hi) => Math.max(0, Math.min(hi, n));

/** A week's chance this runner asks to retire (0 before the minimum tenure). */
export function retireChance(op) {
  const r = recordOf(op);
  if (r.activeWeeks < RETIREMENT.minWeeks) return 0;
  let p = RETIREMENT.base + Math.floor((r.activeWeeks - RETIREMENT.minWeeks) / 10) * RETIREMENT.perTenWeeks + (r.seriousInjuries ?? 0) * RETIREMENT.perSerious;
  const age = op.age ?? 30;
  if (age > 50) p *= RETIREMENT.over50; else if (age > 40) p *= RETIREMENT.over40;
  const star = op.fame === 'elite' || op.fame === 'legend' || op.legend;
  return clamp01(p, star && age < 40 ? RETIREMENT.eliteCap : RETIREMENT.cap);
}

const busyIds = (state) => new Set([
  ...(state.awayJobs ?? []).flatMap(({ mission: am }) => [...am.crewIds, am.overwatch?.id, am.wheels, am.standby?.id]),
  ...(state.activeMission ? [...state.activeMission.crewIds, state.activeMission.overwatch?.id, state.activeMission.wheels, state.activeMission.standby?.id] : []),
  ...(state.sideOut ?? []).flatMap((s) => s.crewIds ?? []),
].filter(Boolean));

const pending = (state, op) => state.inbox.some((m) => m.kind === 'retirement' && !m.resolved && m.payload?.opId === op.id);

/** Can this runner be asked this week? */
function askable(state, op, busy) {
  if (isFreelancer(op) || op.condition.injury === 'dead' || busy.has(op.id)) return false;
  if (op.condition.injury !== 'healthy' && op.condition.injury !== 'light') return false;
  if ((op.retireSnoozeUntil ?? 0) > state.day) return false;
  return !pending(state, op);
}

/** Wage they ask to stay: 20% more the first time, 35% after. */
export const stayWage = (op) => round50(op.wage * RETIREMENT.wageUp[Math.min(op.retireAsks ?? 0, 1)]);

/** Sunday: maybe one request, posted as a decision message. Mutates the (cloned) state. */
export function checkRetirement(state) {
  const busy = busyIds(state);
  const week = Math.floor(state.day / 7);
  const cands = state.crew.filter((op) => askable(state, op, busy)).filter((op) => hashRng('retire', state.seed ?? 0, op.id, week)() < retireChance(op));
  if (!cands.length) return;
  const op = cands.reduce((a, b) => (hashRng('retire-pick', state.seed ?? 0, a.id, week)() >= hashRng('retire-pick', state.seed ?? 0, b.id, week)() ? a : b));
  const weeks = recordOf(op).activeWeeks;
  const vars = { op: op.handle, weeks: String(weeks) };
  op.retireSnoozeUntil = state.day + RETIREMENT.snoozeLapse; // set now: a lapse runs no code
  state.inbox.unshift({
    id: `retire-${op.id}-${state.day}`, type: 'crew', day: state.day,
    subject: fill(RETIRE_TEXT.subject, vars), body: fill(RETIRE_TEXT.bodies[op.role] ?? RETIRE_TEXT.fallback, vars),
    kind: 'retirement',
    options: [
      { id: 'stay', label: `Stay one more season (${money(stayWage(op))} a week)` },
      { id: 'go', label: 'Let them go' },
    ],
    payload: { opId: op.id, expiresDay: state.day + RETIREMENT.expiryDays, wage: stayWage(op) },
    blocking: false, resolved: false, read: false,
  });
}

/** Someone worth a place on the wall: Elite or Legend, or a long career. */
export const hallWorthy = (op) => op.fame === 'elite' || op.fame === 'legend' || !!op.legend || recordOf(op).activeWeeks >= RETIREMENT.hallWeeks;

/** A Hall of Legends entry for a runner leaving the crew. */
export function hallEntry(state, op) {
  const fame = op.legend || op.fame === 'legend' ? 'legend' : op.fame === 'elite' ? 'elite' : 'generic';
  return {
    id: op.id, name: op.name, handle: op.handle, role: op.role, color: op.color, age: op.age, marks: op.marks ?? [],
    day: state.day, fame: op.fame ?? 'unknown', legend: !!op.legend || op.fame === 'legend', path: pathOf(op)?.id ?? null,
    epitaph: HALL_EPITAPH[fame], record: recordSummary(op), highlights: (op.record?.highlights ?? []).map((h) => h.text),
  };
}

/** Resolver for kind 'retirement' (registered in decisions.js). Mutates state and msg. */
export function RETIREMENT_RESOLVER(state, msg, optionId) {
  const p = msg.payload;
  const op = state.crew.find((o) => o.id === p.opId);
  const done = (text) => { p.outcome = text; msg.resolved = true; msg.blocking = false; };
  if (!op) return done('They are no longer with the crew.');
  if (state.day > p.expiresDay) return done(`${op.handle} stayed on; the moment passed.`); // a lapsed request: they stay
  if (optionId === 'stay') {
    op.wage = stayWage(op);
    op.retireAsks = (op.retireAsks ?? 0) + 1;
    op.retireSnoozeUntil = state.day + RETIREMENT.snoozeStay;
    op.history.push(`Day ${state.day}: stayed one more season at ${op.wage} a week`);
    return done(fill(RETIRE_REPLY.stay, { op: op.handle, wage: money(op.wage) }));
  }
  if (optionId !== 'go') return;
  const worthy = hallWorthy(op);
  for (const item of carried(op)) { (state.stash ??= []).push(item); }
  state.stash = state.stash ?? [];
  state.crew = state.crew.filter((o) => o.id !== op.id);
  if (worthy) (state.hall ??= []).push(hallEntry(state, op));
  done(fill(worthy ? RETIRE_REPLY.goHall : RETIRE_REPLY.go, { op: op.handle }));
}
