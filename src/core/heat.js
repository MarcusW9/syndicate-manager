// Heat: how loud and sloppy the crew has been (0-10). Pure logic.
// Heat comes from the Loud approach and crisis costs, never from simply taking a job.
// It cools by HEAT_COOL_WEEKLY every Sunday. High heat posts one fixer notice: pay to
// cool it, or let it ride and start the next job watched (-1 on its first crisis roll).

import { ECONOMY } from '../data/economy.js';

export const HEAT_MAX = 10;
export const HEAT_COOL_WEEKLY = 2;
export const HEAT_NOTICE_AT = 6;
export const HEAT_NOTICE_COOLDOWN_DAYS = 14;
export const WATCHED_PENALTY = 1;

export const clampHeat = (heat) => Math.max(0, Math.min(HEAT_MAX, heat));

const pending = (state) => state.inbox.some((m) => m.kind === 'heat' && !m.resolved);
const cooledDown = (state) => state.heatNoticeDay == null || state.day - state.heatNoticeDay >= HEAT_NOTICE_COOLDOWN_DAYS;

/** True when the fixer should get in touch now (checked at the Sunday settlement). */
export function heatNoticeDue(state) {
  return state.heat >= HEAT_NOTICE_AT && !pending(state) && cooledDown(state);
}

/** Post the fixer notice if one is due. Mutates state. Returns true if one fired. */
export function checkHeatNotice(state) {
  if (!heatNoticeDue(state)) return false;
  const { fixerCost, fixerCools } = ECONOMY.heat;
  state.heatNoticeDay = state.day;
  state.inbox.unshift({
    id: `heat-${state.day}`, type: 'warning', day: state.day,
    subject: 'Someone has been asking about the crew',
    body: `Word comes back from the district: someone has been asking questions. Who you run with, where you sleep, what you drove away from last week. Heat is ${state.heat}/10. A fixer can make the questions stop. For a price.`,
    kind: 'heat',
    options: [{ id: 'pay', label: 'Pay the fixer' }, { id: 'ride', label: 'Let it ride' }],
    payload: { heat: state.heat, cost: fixerCost, cools: fixerCools },
    blocking: true, resolved: false, read: false,
  });
  return true;
}

/**
 * The notice's options as they stand now. Cash moves while a notice waits (a job pays out),
 * so whether "Pay" is open is read live from state, not frozen on the message.
 */
export function heatChoices(state, msg) {
  const { cost, cools } = msg.payload;
  const short = state.cash < cost;
  return [
    { id: 'pay', label: `Pay the fixer (${cost}, heat −${cools})`, disabled: short, reason: short ? 'Not enough cash' : '' },
    { id: 'ride', label: 'Let it ride', disabled: false, reason: '' },
  ];
}

/** Resolver for kind 'heat' (registered in decisions.js). Mutates state and msg. */
export function HEAT_RESOLVER(state, msg, optionId) {
  const p = msg.payload;
  if (optionId === 'pay') {
    if (state.cash < p.cost) return; // can't afford it: nothing happens, the notice stays open
    state.cash -= p.cost;
    const before = state.heat;
    state.heat = clampHeat(state.heat - p.cools);
    p.outcome = `Paid ${p.cost}. The questions stop. Heat ${before} → ${state.heat}/10.`;
  } else if (optionId === 'ride') {
    state.heatWatched = true;
    p.outcome = `Nothing paid. The next job starts with eyes on the crew: −${WATCHED_PENALTY} on its first crisis roll.`;
  } else return;
  msg.resolved = true;
  msg.blocking = false;
}
