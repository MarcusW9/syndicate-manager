// Contract renewals: when someone grows, they ask for a raise. Pure logic.
// Rules (PLAN-RENEWALS.md): trigger on graduation or main stat +2 since the last pay deal,
// at most one notice per person every 8 weeks, no notice unless the market pays more.

import { marketWage, round50 } from './pricing.js';
import { loyaltyDiscount, loyalty } from './loyalty.js';
import { primaryStat } from './development.js';
import { addStatus, hasStatus } from './statuses.js';
import { bestFor } from './crew.js';
import { nextRng } from './random.js';
import { d20 } from './rng.js';

export const RENEWAL_STAT_RISE = 2;
export const NOTICE_COOLDOWN_DAYS = 56; // 8 weeks
export const UNHAPPY_DAYS = 28; // 4 weeks
export const RENEWAL_HAGGLE_DIFFICULTY = 14;
export const RENEWAL_HAGGLE_OFF = 0.1;

/** What they ask for: the raise shrinks with loyalty, and the ask never drops below today's wage. */
export function renewalAsk(op) {
  const market = marketWage(op);
  return Math.max(op.wage, round50(op.wage + (market - op.wage) * (1 - loyaltyDiscount(op))));
}

const cooledDown = (op, day) => op.lastNoticeDay == null || day - op.lastNoticeDay >= NOTICE_COOLDOWN_DAYS;
const pendingFor = (state, op) => state.inbox.some((m) => m.kind === 'renewal' && !m.resolved && m.payload?.opId === op.id);

/** True when this operative should ask for a new deal now. */
export function renewalDue(state, op, graduated = false) {
  if (pendingFor(state, op) || !cooledDown(op, state.day)) return false;
  if (hasStatus(op, 'unhappy')) return false;
  const grew = graduated || op.renewalAgain || op.stats[primaryStat(op)] >= (op.contractMainStat ?? 0) + RENEWAL_STAT_RISE;
  return grew && marketWage(op) > op.wage;
}

/** Post a renewal notice if one is due. Mutates state. Returns true if one fired. */
export function checkRenewal(state, op, graduated = false) {
  if (!renewalDue(state, op, graduated)) return false;
  const market = marketWage(op);
  const ask = renewalAsk(op);
  op.lastNoticeDay = state.day;
  state.inbox.unshift({
    id: `renewal-${op.id}-${state.day}`, type: 'crew', day: state.day,
    subject: `${op.handle} wants a new deal`,
    body: `${op.name} knows what they're worth now. On ${op.wage} a week; asking for ${ask}.`,
    kind: 'renewal',
    options: renewalOptions(false),
    payload: { opId: op.id, current: op.wage, ask, market, loyalty: loyalty(op), discount: loyaltyDiscount(op), jobs: op.jobsWithCrew ?? 0, haggled: false, haggleResult: null },
    blocking: true, resolved: false, read: false,
  });
  return true;
}

const renewalOptions = (haggled) => [
  { id: 'accept', label: 'Accept' },
  { id: 'haggle', label: haggled ? 'Already haggled' : 'Haggle (your best talker rolls)', disabled: haggled },
  { id: 'refuse', label: 'Refuse' },
];

/** Resolver for kind 'renewal' (registered in decisions.js). Mutates state and msg. */
export function RENEWAL_RESOLVER(state, msg, optionId) {
  const p = msg.payload;
  const op = state.crew.find((o) => o.id === p.opId);
  if (!op) { msg.resolved = true; msg.blocking = false; return; } // gone: nothing left to decide
  if (optionId === 'haggle') {
    if (p.haggled) return;
    p.haggled = true;
    const talker = bestFor(state.crew, 'social', {});
    const success = talker && d20(nextRng(state)) + talker.value >= 10 + RENEWAL_HAGGLE_DIFFICULTY;
    if (success) p.ask = Math.max(p.current, round50(p.ask * (1 - RENEWAL_HAGGLE_OFF)));
    p.haggleResult = success ? `${talker.op.handle} talked ${op.handle} down to ${p.ask} a week.` : `${talker ? talker.op.handle : 'You'} tried, but ${op.handle} won't budge.`;
    msg.options = renewalOptions(true);
    return;
  }
  if (optionId === 'accept') {
    op.wage = p.ask;
    op.contractMainStat = op.stats[primaryStat(op)];
    op.renewalAgain = false;
    op.history.push(`Day ${state.day}: new deal at ${p.ask} a week`);
    p.outcome = `Signed at ${p.ask} a week.`;
  } else if (optionId === 'refuse') {
    addStatus(op, 'unhappy', state.day + UNHAPPY_DAYS);
    op.renewalAgain = true; // asks again once the unhappy spell and the cooldown are over
    op.history.push(`Day ${state.day}: pay rise refused`);
    p.outcome = `Refused. ${op.handle}'s head isn't in it for four weeks (−1 on their rolls).`;
  } else return;
  msg.resolved = true;
  msg.blocking = false;
}
