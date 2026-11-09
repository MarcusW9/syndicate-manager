// Calendar and the daily tick. Pure logic: takes state, returns new state.

import { fadeGrudges } from './gangs.js';
import { checkRaids } from './raids.js';
import { introduceHalls } from './halls.js';
import { introduceHeists, tickHeists } from './heists.js';
import { tickJobs } from './jobs.js';
import { legendTick } from './legend.js';
import { trimInbox } from './inbox.js';
import { driftTrust } from './clients.js';
import { scoutWeek } from './recruits.js';
import { refreshFreelancers } from './freelance.js';
import { ageCrew } from './development.js';
import { nextRng } from './random.js';
import { expireStatuses } from './statuses.js';
import { checkRenewal } from './renewals.js';
import { HEAT_COOL_WEEKLY, clampHeat, checkHeatNotice, coolHeat, hottest } from './heat.js';
import { NAMES } from '../config/names.js';
import { rollRumour } from './rumours.js';
import { money } from './money.js';
import { advanceAway } from './away.js';
import { weekSummary, weekStartOf } from './week.js';
import { refreshSideBoard, returnSideTasks } from './sidetasks.js';
import { dailyTraits } from './earned.js';
import { weeklyRecord } from './record.js';
import { weeklyLoyalty } from './loyalty.js';
import { weeklyFame } from './fame.js';
import { checkRetirement } from './retirement.js';
import { weeklyPoach } from './mobility.js';
import { weeklyOath } from './oath.js';
import { weeklyRivals } from './rivals.js';
import { neuralFloor } from './gear.js';
import { checkSpecialisations } from './specialisations.js';
import { refreshArmoury } from './looks.js';
import { homeOf, hasRoom } from './halls.js';
import { ROOM_EFFECT } from '../data/hallBuild.js';
import { brokerWeek } from './broker.js';

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
    const home = homeOf(state, op); // their hall's rooms help while they're home (core/hallbuild.js)
    c.fatigue = Math.max(0, c.fatigue - (hasRoom(home, 'canteen') ? ROOM_EFFECT.canteenRest : 8)); // resting recovers
    c.neuralLoad = Math.max(neuralFloor(op), c.neuralLoad - 3); // implants keep a floor (core/gear.js)
    if (c.injuryDays > 0) {
      c.injuryDays = Math.max(0, c.injuryDays - (hasRoom(home, 'clinic') ? ROOM_EFFECT.clinicHeal : 1));
      if (c.injuryDays === 0 && c.injury !== 'dead') c.injury = 'healthy';
    }
  }

  dailyTraits(state); // scars set once a critical wound heals; idle spells end temporary traits
  checkSpecialisations(state); // Joss asks again once a "not yet" has run out

  // Someone who was refused a raise asks again once they've cooled off.
  for (const op of state.crew) if (op.renewalAgain) checkRenewal(state, op);

  // Expire old optional messages
  state.inbox = state.inbox.filter((m) => !m.expiresDay || m.expiresDay >= state.day);
  trimInbox(state); // old news goes; anything still waiting on the player stays (core/inbox.js)

  if (calendar(state.day).isSunday) settleWeek(state);
  if (calendar(state.day).isMonday && calendar(state.day).week === 1) newSeason(state);
  if (calendar(state.day).isMonday) driftTrust(state); // clients drift back towards neutral
  if (calendar(state.day).isMonday) refreshFreelancers(state);
  if (calendar(state.day).isMonday) refreshSideBoard(state); // a fresh board of side tasks
  if (calendar(state.day).isMonday) refreshArmoury(state); // new rifles in the armoury
  if (calendar(state.day).isMonday) rollRumour(state);
  if (calendar(state.day).isMonday) introduceHalls(state); // a contact offers a place once we're welcome (core/halls.js)
  if (calendar(state.day).isMonday) introduceHeists(state); // a contact offers a heist once the tong is ready (core/heists.js)
  tickJobs(state); // offers expire; new work trickles in through the week
  tickHeists(state); // prep left undone is asked again; the finale goes up in its week (core/heists.js)
  legendTick(state); // a ready runner's defining job goes on the board (core/legend.js)
  if (calendar(state.day).weekday === 'Wed') scoutWeek(state);
  state.recruits = (state.recruits ?? []).filter((r) => r.expiresDay >= state.day);

  returnSideTasks(state); // side tasks whose crew is back today resolve
  checkRaids(state); // a raid due today knocks; a hot district with a hall may draw a warning (core/raids.js)
  return advanceAway(state); // crews out take today's share; one that needs a call waits (core/away.js)
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
  const brokered = brokerWeek(state); // the work boards' week, before the bills (core/broker.js)
  const summary = weekSummary(state); // the week's jobs and money, before the bills (core/week.js)
  const { wages, total } = weeklyBill(state);
  state.cash -= total;

  const broke = state.cash < 0;

  weeklyRecord(state); // a week they worked counts towards their record
  weeklyLoyalty(state); // loyalty drifts with work, pay and losses (core/loyalty.js)
  weeklyFame(state); // standing slips on the bench, Elite can lapse, fame may climb (core/fame.js)
  weeklyRivals(state); // the other tongs' week, on its own key: no roll moves (core/rivals.js)
  weeklyOath(state); // one notice when a runner could be sworn (core/oath.js)
  weeklyPoach(state); // a rival may make an offer for a runner; unanswered offers take effect (core/mobility.js)
  checkRetirement(state); // at most one long-serving runner asks to retire; hashed, no roll moves (core/retirement.js)

  // Heat cools the same every week, job or no job (core/heat.js).
  const cooled = coolHeat(state); // every district cools the same (heat per district, save v39)
  fadeGrudges(state); // the gangs' grudges ease a little (core/gangs.js)
  const hot = hottest(state);
  const heatLine = cooled ? ` Heat cooled by ${HEAT_COOL_WEEKLY} everywhere${hot ? `; hottest now ${NAMES.districts[hot.district]} ${hot.heat}/10` : '; nowhere is hot'}.` : '';

  state.inbox.unshift({
    id: `week-${state.day}`,
    type: 'finance',
    day: state.day,
    subject: broke ? 'You missed payments this week' : `Week ${calendar(state.day).week}, season ${calendar(state.day).season} settled: ${summary.net >= 0 ? '+' : '−'}${money(Math.abs(summary.net))} after the bills`,
    body: `${summary.lines.join(' ')} Wages ${money(wages)}, rent ${money(state.rent)}. Paid ${money(total)}. Cash now ${money(state.cash)}.` + heatLine +
      (brokered.lines.length ? ` Work boards: ${brokered.lines.join(' ')}` : '') +
      (broke ? ' The crew noticed. Morale will drop until you are back in the black.' : ''),
    kind: 'week', payload: { lines: summary.lines, net: summary.net, paid: total, wages, rent: state.rent, cash: state.cash, broker: brokered.lines.length ? brokered : null },
    blocking: false,
    read: false,
  });
  state.weekStart = weekStartOf(state); // next week is measured from here

  if (broke) {
    for (const op of state.crew) op.condition.morale = Math.max(0, op.condition.morale - 10);
  }

  // Still hot after cooling: a fixer gets in touch (never a lockout; see core/heat.js).
  checkHeatNotice(state);
}
