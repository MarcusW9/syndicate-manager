// Shared helpers for a run in progress (core/mission.js, core/runbattle.js): who is on the job,
// the run's record, growth as it's earned. Pure; these take the state (or the run, `am`) and
// mutate only the cloned state a caller passes in.

import { gainXp } from './development.js';
import { isFreelancer } from './freelance.js';

export const crewOf = (state, am) => am.crewIds.map((id) => state.crew.find((o) => o.id === id)).filter(Boolean);
// Who can still act: the inside crew minus anyone an incident has put out of the job.
export const actors = (state, am) => crewOf(state, am).filter((o) => !(am.out ?? []).includes(o.id) && o.condition.injury !== 'critical');
export const overwatchOp = (state, am) => (am.overwatch ? state.crew.find((o) => o.id === am.overwatch.id) ?? null : null);
// Wheels waits in the van and takes every driving roll; standby waits at the van until called in (slice 3).
export const wheelsOp = (state, am) => (am.wheels ? state.crew.find((o) => o.id === am.wheels) ?? null : null);
export const standbyOp = (state, am) => (am.standby ? state.crew.find((o) => o.id === am.standby.id) ?? null : null);
/** Standby, if they're still waiting at the van and fit to go in. */
export const standbyReady = (state, am) => { const op = standbyOp(state, am); return op && !am.standby.used && op.condition.injury !== 'critical' ? op : null; };
/** Wheels, if they can drive (not critical). */
export const driver = (state, am) => { const op = wheelsOp(state, am); return op && op.condition.injury !== 'critical' ? op : null; };
// Everyone on the job: the inside crew, overwatch, Wheels and standby (away, tired and learning together).
export const onJob = (state, am) => [...new Set([...crewOf(state, am), overwatchOp(state, am), wheelsOp(state, am), standbyOp(state, am)].filter(Boolean))];
export const opById = (state, id) => state.crew.find((o) => o.id === id);

const STAT_NAME = (s) => s[0].toUpperCase() + s.slice(1);

/**
 * Growth happens the moment it's earned (see development.js). Rises are
 * flashed in the mission log and collected for the level-up cards at the end.
 */
export function grow(state, am, op, stat, points) {
  if (isFreelancer(op)) return; // they learn on someone else's payroll
  const { events, graduated } = gainXp(op, crewOf(state, am), stat, points, state.day);
  for (const e of events) {
    am.growth = [...(am.growth ?? []), e];
    am.log.push({ kind: 'growth', text: `▲ ${e.handle}: ${STAT_NAME(e.stat)} ${e.from} → ${e.to}` });
    if (e.wall) am.log.push({ kind: 'growth', text: `${e.handle} has hit a wall in ${e.stat}. It'll come slower from here.` });
  }
  if (graduated) {
    am.graduated = [...(am.graduated ?? []), op.id];
    am.log.push({ kind: 'growth', text: `★ ${op.handle} isn't a rookie any more.` });
  }
}

/** Add a fact to the run's record (am.events, save v16; a job saved mid-way before then starts one). */
export function record(am, event) {
  (am.events ??= []).push(event);
}

/** A hands-off run's reason for its next pick (core/autorun.js), used once. */
export function takeWhy(am) {
  const why = am.nextWhy ?? null;
  delete am.nextWhy;
  return why;
}

export function addNeural(op, n) {
  const rate = op.traits?.includes('chromed') ? 1.5 : 1;
  op.condition.neuralLoad = Math.min(100, (op.condition.neuralLoad ?? 0) + Math.round(n * rate));
}
