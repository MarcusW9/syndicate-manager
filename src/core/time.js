// Calendar and the daily tick. Pure logic: takes state, returns new state.

import { tickJobs } from './jobs.js';
import { driftTrust } from './clients.js';
import { scoutWeek } from './recruits.js';
import { refreshFreelancers } from './freelance.js';
import { ageCrew } from './development.js';
import { nextRng } from './random.js';
import { expireStatuses } from './statuses.js';
import { checkRenewal } from './renewals.js';
import { HEAT_COOL_WEEKLY, clampHeat, checkHeatNotice } from './heat.js';
import { rollRumour } from './rumours.js';
import { money } from './money.js';
import { returnCrews } from './autorun.js';
import { refreshSideBoard, returnSideTasks } from './sidetasks.js';
import { dailyTraits } from './earned.js';
import { neuralFloor } from './gear.js';
import { checkSpecialisations } from './specialisations.js';
import { refreshArmoury } from './looks.js';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAYS_PER_SEASON = 364; // 52 weeks

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

/** First day of the season that `day` falls in (the window for "this season" growth). */
export const seasonStartDay = (day) => Math.floor((day - 1) / DAYS_PER_SEASON) * DAYS_PER_SEASON + 1;

export function formatDate(day) {
  const c = calendar(day);
  return `${c.weekday} · Week ${c.week} · Season ${c.season}`;
}

/** Top-bar date: "Mon · Wk 1 · S1". */
export function formatShortDate(day) {
  const c = calendar(day);
  return `${c.weekday} · Wk ${c.week} · S${c.season}`;
}

/** True when a blocking message is waiting, so Continue should not tick. */
export function isBlocked(state) {
  // A new game waits for the founder pick (state.js chooseFounders).
  return Boolean(state.activeMission) || Boolean(state.founding) || state.inbox.some((m) => m.blocking && !m.resolved);
}

/** Advance one day. Returns a new state; never mutates the input. */
export function advanceDay(prev) {
  const state = structuredClone(prev);
  state.day += 1;
  state.dayStartCash = state.cash; // the top bar shows today's change against this

  for (const op of state.crew) {
    expireStatuses(op, state.day);
    const c = op.condition;
    c.fatigue = Math.max(0, c.fatigue - 8); // resting recovers
    c.neuralLoad = Math.max(neuralFloor(op), c.neuralLoad - 3); // implants keep a floor (core/gear.js)
    if (c.injuryDays > 0) {
      c.injuryDays -= 1;
      if (c.injuryDays === 0 && c.injury !== 'dead') c.injury = 'healthy';
    }
  }

  dailyTraits(state); // scars set once a critical wound heals; idle spells end temporary traits
  checkSpecialisations(state); // Joss asks again once a "not yet" has run out

  // Someone who was refused a raise asks again once they've cooled off.
  for (const op of state.crew) if (op.renewalAgain) checkRenewal(state, op);

  // Expire old optional messages
  state.inbox = state.inbox.filter((m) => !m.expiresDay || m.expiresDay >= state.day);

  if (calendar(state.day).isSunday) settleWeek(state);
  if (calendar(state.day).isMonday && calendar(state.day).week === 1) newSeason(state);
  if (calendar(state.day).isMonday) driftTrust(state); // clients drift back towards neutral
  if (calendar(state.day).isMonday) refreshFreelancers(state);
  if (calendar(state.day).isMonday) refreshSideBoard(state); // a fresh board of side tasks
  if (calendar(state.day).isMonday) refreshArmoury(state); // new rifles in the armoury
  if (calendar(state.day).isMonday) rollRumour(state);
  tickJobs(state); // offers expire; new work trickles in through the week
  if (calendar(state.day).weekday === 'Wed') scoutWeek(state);
  state.recruits = (state.recruits ?? []).filter((r) => r.expiresDay >= state.day);

  returnSideTasks(state); // side tasks whose crew is back today resolve
  return returnCrews(state); // hands-off crews back today file their reports
}

/** Season turn: everyone a year older; past 40, stats start to slip. */
function newSeason(state) {
  const { season } = calendar(state.day);
  const lines = ageCrew(state.crew, nextRng(state), state.day);
  state.inbox.unshift({
    id: `season-${season}`, type: 'crew', day: state.day,
    subject: `Season ${season} begins`,
    body: 'Another year in the city. Everyone is a year older.' + (lines.length ? ' ' + lines.join(' ') : ''),
    blocking: false, read: false,
  });
}

/** What Sunday will cost: wages for everyone alive, plus rent. */
export function weeklyBill(state) {
  const wages = state.crew
    .filter((op) => op.condition.injury !== 'dead')
    .reduce((sum, op) => sum + op.wage, 0);
  return { wages, rent: state.rent, total: wages + state.rent };
}

function settleWeek(state) {
  const { wages, total } = weeklyBill(state);
  state.cash -= total;

  const broke = state.cash < 0;

  // Heat cools the same every week, job or no job (core/heat.js).
  const heatBefore = state.heat;
  state.heat = clampHeat(state.heat - HEAT_COOL_WEEKLY);
  const cooled = heatBefore - state.heat;
  const heatLine = cooled ? ` Heat cooled by ${cooled} to ${state.heat}/10.` : '';

  state.inbox.unshift({
    id: `week-${state.day}`,
    type: 'finance',
    day: state.day,
    subject: broke ? 'You missed payments this week' : 'Week settled',
    body: `Wages ${money(wages)}, rent ${money(state.rent)}. Paid ${money(total)}. Cash now ${money(state.cash)}.` + heatLine +
      (broke ? ' The crew noticed. Morale will drop until you are back in the black.' : ''),
    blocking: false,
    read: false,
  });

  if (broke) {
    for (const op of state.crew) op.condition.morale = Math.max(0, op.condition.morale - 10);
  }

  // Still hot after cooling: a fixer gets in touch (never a lockout; see core/heat.js).
  checkHeatNotice(state);
}
