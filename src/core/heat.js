// Heat: how loud and sloppy the crew has been, district by district (0-10 each). Pure logic.
// Heat comes from the Loud approach and crisis costs, never from simply taking a job, and it
// lands in the job's district (side work: the task's district). Every district cools by
// HEAT_COOL_WEEKLY each Sunday. The hottest district at 6+ posts one fixer notice: pay to cool
// it, or let it ride and the next job there starts watched (-1 on its first crisis roll).
// Per district since 2026-11-05 (the tong's Phase 2, save v39): state.heatBy holds each
// district's heat; state.heat stays as the hottest, for the top bar and anything that reads one.

import { ECONOMY } from '../data/economy.js';
import { NAMES } from '../config/names.js';

export const HEAT_MAX = 10;
export const HEAT_COOL_WEEKLY = 2;
export const HEAT_NOTICE_AT = 6;
export const HEAT_NOTICE_COOLDOWN_DAYS = 14;
export const WATCHED_PENALTY = 1;

export const clampHeat = (heat) => Math.max(0, Math.min(HEAT_MAX, heat));

/** The districts heat is kept for: every district the city names. */
export const HEAT_DISTRICTS = Object.keys(NAMES.districts);
const inText = (d) => NAMES.districtsInText?.[d] ?? NAMES.districts?.[d] ?? d;

/** A district's heat. */
export const heatIn = (state, district) => state.heatBy?.[district] ?? 0;

/** The hottest district: { district, heat } (the first in the city's order on a tie; null when all cold). */
export function hottest(state) {
  let best = null;
  for (const d of HEAT_DISTRICTS) if (heatIn(state, d) > (best?.heat ?? 0)) best = { district: d, heat: heatIn(state, d) };
  return best;
}

/** Keep state.heat as the hottest district's heat. Mutates state. */
export function syncHeat(state) {
  state.heat = hottest(state)?.heat ?? 0;
  return state;
}

/** Set a district's heat (clamped). Mutates state. */
export function setHeat(state, district, heat) {
  state.heatBy = { ...(state.heatBy ?? {}), [district]: clampHeat(heat) };
  return syncHeat(state);
}

/** Add heat to a district (clamped). Mutates state. */
export const addHeat = (state, district, n) => setHeat(state, district, heatIn(state, district) + n);

/** Sunday: every district cools the same. Returns the total cooled. Mutates state. */
export function coolHeat(state, by = HEAT_COOL_WEEKLY) {
  let cooled = 0;
  for (const d of HEAT_DISTRICTS) { const before = heatIn(state, d); setHeat(state, d, before - by); cooled += before - heatIn(state, d); }
  return cooled;
}

const pending = (state) => state.inbox.some((m) => m.kind === 'heat' && !m.resolved);
const cooledDown = (state) => state.heatNoticeDay == null || state.day - state.heatNoticeDay >= HEAT_NOTICE_COOLDOWN_DAYS;

/** True when the fixer should get in touch now (checked at the Sunday settlement). */
export function heatNoticeDue(state) {
  return (hottest(state)?.heat ?? 0) >= HEAT_NOTICE_AT && !pending(state) && cooledDown(state);
}

/** Post the fixer notice if one is due. Mutates state. Returns true if one fired. */
export function checkHeatNotice(state) {
  if (!heatNoticeDue(state)) return false;
  const { fixerCost, fixerCools } = ECONOMY.heat;
  const hot = hottest(state);
  state.heatNoticeDay = state.day;
  state.inbox.unshift({
    id: `heat-${state.day}`, type: 'warning', day: state.day,
    subject: `Someone has been asking about us in ${inText(hot.district)}`,
    body: `Word comes back from ${inText(hot.district)}: someone has been asking questions. Who you run with, where you sleep, what you drove away from last week. Heat there is ${hot.heat}/10. A fixer can make the questions stop. For a price.`,
    kind: 'heat',
    options: [{ id: 'pay', label: 'Pay the fixer' }, { id: 'ride', label: 'Let it ride' }],
    payload: { heat: hot.heat, district: hot.district, cost: fixerCost, cools: fixerCools },
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
    const d = p.district ?? hottest(state)?.district ?? HEAT_DISTRICTS[0];
    const before = heatIn(state, d);
    setHeat(state, d, before - p.cools);
    p.outcome = `Paid ${p.cost}. The questions stop. Heat in ${inText(d)} ${before} → ${heatIn(state, d)}/10.`;
  } else if (optionId === 'ride') {
    state.heatWatched = p.district ?? true;
    p.outcome = `Nothing paid. The next job ${p.district ? `in ${inText(p.district)} ` : ''}starts with eyes on the crew: −${WATCHED_PENALTY} on its first crisis roll.`;
  } else return;
  msg.resolved = true;
  msg.blocking = false;
}

/** Is a job in this district watched (the player let its heat ride)? true is from before v39: any job. */
export const watchedIn = (state, district) => state.heatWatched === true || (!!state.heatWatched && state.heatWatched === district);
