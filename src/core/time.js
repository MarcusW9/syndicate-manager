// Calendar and the daily tick. Pure logic: takes state, returns new state.

import { refreshJobs } from './jobs.js';
import { scoutWeek } from './recruits.js';
import { ageCrew } from './development.js';
import { nextRng } from './random.js';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAYS_PER_SEASON = 364; // 52 weeks

// Heat cools every Sunday; a week with no jobs started cools it faster.
export const HEAT_COOL_WEEKLY = 1;
export const HEAT_COOL_QUIET = 3;

export function calendar(day) {
  const d = day - 1;
  return {
    weekday: WEEKDAYS[d % 7],
    week: Math.floor((d % DAYS_PER_SEASON) / 7) + 1,
    season: Math.floor(d / DAYS_PER_SEASON) + 1,
    isSunday: d % 7 === 6,
    isMonday: d % 7 === 0,
  };
}

export function formatDate(day) {
  const c = calendar(day);
  return `${c.weekday} · Week ${c.week} · Season ${c.season}`;
}

/** True when a blocking message is waiting, so Continue should not tick. */
export function isBlocked(state) {
  return Boolean(state.activeMission) || state.inbox.some((m) => m.blocking && !m.resolved);
}

/** Advance one day. Returns a new state; never mutates the input. */
export function advanceDay(prev) {
  const state = structuredClone(prev);
  state.day += 1;

  for (const op of state.crew) {
    const c = op.condition;
    c.fatigue = Math.max(0, c.fatigue - 8); // resting recovers
    c.neuralLoad = Math.max(0, c.neuralLoad - 3);
    if (c.injuryDays > 0) {
      c.injuryDays -= 1;
      if (c.injuryDays === 0 && c.injury !== 'dead') c.injury = 'healthy';
    }
  }

  // Expire old optional messages
  state.inbox = state.inbox.filter((m) => !m.expiresDay || m.expiresDay >= state.day);

  if (calendar(state.day).isSunday) settleWeek(state);
  if (calendar(state.day).isMonday && calendar(state.day).week === 1) newSeason(state);
  if (calendar(state.day).isMonday) refreshJobs(state);
  if (calendar(state.day).weekday === 'Wed') scoutWeek(state);
  state.recruits = (state.recruits ?? []).filter((r) => r.expiresDay >= state.day);

  return state;
}

/** Season turn: everyone a year older; past 40, stats start to slip. */
function newSeason(state) {
  const { season } = calendar(state.day);
  const lines = ageCrew(state.crew, nextRng(state));
  state.inbox.unshift({
    id: `season-${season}`, type: 'crew', day: state.day,
    subject: `Season ${season} begins`,
    body: 'Another year in the city. Everyone is a year older.' + (lines.length ? ' ' + lines.join(' ') : ''),
    blocking: false, read: false,
  });
}

function settleWeek(state) {
  const wages = state.crew
    .filter((op) => op.condition.injury !== 'dead')
    .reduce((sum, op) => sum + op.wage, 0);
  const total = wages + state.rent;
  state.cash -= total;

  const broke = state.cash < 0;

  // A week is quiet if no job started since last Monday.
  const quiet = !state.lastJobDay || state.lastJobDay < state.day - 6;
  const heatBefore = state.heat;
  state.heat = Math.max(0, state.heat - (quiet ? HEAT_COOL_QUIET : HEAT_COOL_WEEKLY));
  const cooled = heatBefore - state.heat;
  const heatLine = cooled ? ` Heat cooled by ${cooled} to ${state.heat}/10${quiet ? ' after a quiet week' : ''}.` : '';

  state.inbox.unshift({
    id: `week-${state.day}`,
    type: 'finance',
    day: state.day,
    subject: broke ? 'You missed payments this week' : 'Week settled',
    body: `Wages ${wages}, rent ${state.rent}. Paid ${total}. Cash now ${state.cash}.` + heatLine +
      (broke ? ' The crew noticed. Morale will drop until you are back in the black.' : ''),
    blocking: false,
    read: false,
  });

  if (broke) {
    for (const op of state.crew) op.condition.morale = Math.max(0, op.condition.morale - 10);
  }
}
