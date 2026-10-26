// What needs attention now, and what the next week holds. Pure logic: reads state,
// returns plain data; the UI words and formats it.

import { calendar, weeklyBill } from './time.js';
import { availability, isAway } from './crew.js';
import { templateById } from './jobs.js';
import { NOTICE_COOLDOWN_DAYS } from './renewals.js';
import { awayJobs } from './autorun.js';
import { sideTasksOut } from './sidetasks.js';

export const HORIZON_DAYS = 7;
const EXHAUSTED_AT = 85; // availability(): above this, nobody works
const FATIGUE_RECOVERY = 8; // per day, in advanceDay

const daysUntilSunday = (day) => 6 - ((day - 1) % 7);
const jobName = (job) => templateById(job.templateId)?.name ?? job.templateId;

/**
 * Things that need the player now. Empty on a quiet day.
 * Each: { kind, tone: 'warn'|'danger', ...data }.
 */
export function alerts(state) {
  const out = [];
  for (const m of state.inbox) {
    if (m.blocking && !m.resolved) out.push({ kind: 'decision', tone: 'warn', messageId: m.id, subject: m.subject });
  }
  const bill = weeklyBill(state);
  if (state.cash < 0) out.push({ kind: 'broke', tone: 'danger', cash: state.cash });
  else if (daysUntilSunday(state.day) > 0 && state.cash < bill.total) {
    out.push({ kind: 'bills-short', tone: 'danger', total: bill.total, short: bill.total - state.cash });
  }
  for (const job of state.jobs) {
    if (job.expiresDay === state.day) out.push({ kind: 'job-last', tone: 'warn', jobId: job.id, name: jobName(job) });
  }
  for (const r of state.recruits ?? []) {
    if (r.expiresDay === state.day) out.push({ kind: 'lead-last', tone: 'warn', name: r.handle, role: r.role });
  }
  const benched = state.crew.filter((op) => !isAway(state, op) && !availability(state, op).ok);
  if (benched.length) out.push({ kind: 'crew-out', tone: 'warn', names: benched.map((op) => op.handle) });
  return out;
}

/**
 * The next HORIZON_DAYS days, soonest first. Each: { day, kind, ...data }.
 * Only what the game will certainly do: renewal notices that depend on growth can't be
 * known ahead, so only a refused raise's second ask is listed.
 */
export function upcoming(state, horizon = HORIZON_DAYS) {
  const items = [];
  const within = (day) => day > state.day && day <= state.day + horizon;

  for (let day = state.day + 1; day <= state.day + horizon; day++) {
    const c = calendar(day);
    if (c.isMonday && c.week === 1) items.push({ day, kind: 'season', season: c.season });
    if (c.isMonday) items.push({ day, kind: 'board' });
    if (c.weekday === 'Wed') items.push({ day, kind: 'scout' });
    if (c.isSunday) items.push({ day, kind: 'bills', ...weeklyBill(state) });
  }

  for (const job of state.jobs) {
    if (within(job.expiresDay)) items.push({ day: job.expiresDay, kind: 'job-last', jobId: job.id, name: jobName(job) });
  }
  for (const r of state.recruits ?? []) {
    if (within(r.expiresDay)) items.push({ day: r.expiresDay, kind: 'lead-last', name: r.handle, role: r.role });
  }

  // A hands-off crew coming back is one line with its report, not one line per person.
  const reporting = new Set();
  for (const j of [...awayJobs(state), ...sideTasksOut(state)]) {
    if (!within(j.returnDay)) continue;
    const names = j.crewIds.map((id) => state.crew.find((o) => o.id === id)).filter(Boolean).map((o) => o.handle);
    j.crewIds.forEach((id) => reporting.add(`${id}@${j.returnDay}`));
    items.push({ day: j.returnDay, kind: 'report', name: j.name, names });
  }

  for (const op of state.crew) {
    const c = op.condition;
    if (c.injury === 'dead') continue;
    if (isAway(state, op) && within(c.awayUntil) && !reporting.has(`${op.id}@${c.awayUntil}`)) items.push({ day: c.awayUntil, kind: 'back', name: op.handle });
    if (c.injury !== 'healthy' && c.injuryDays > 0 && within(state.day + c.injuryDays)) {
      items.push({ day: state.day + c.injuryDays, kind: 'healed', name: op.handle, injury: c.injury });
    }
    if (c.fatigue > EXHAUSTED_AT) {
      const day = state.day + Math.ceil((c.fatigue - EXHAUSTED_AT) / FATIGUE_RECOVERY);
      if (within(day)) items.push({ day, kind: 'rested', name: op.handle });
    }
    if (op.renewalAgain && op.lastNoticeDay != null) {
      const day = Math.max(state.day + 1, op.lastNoticeDay + NOTICE_COOLDOWN_DAYS);
      if (within(day)) items.push({ day, kind: 'reask', name: op.handle });
    }
  }

  const ORDER = ['season', 'board', 'report', 'back', 'healed', 'rested', 'scout', 'job-last', 'lead-last', 'reask', 'bills'];
  return items.sort((a, b) => a.day - b.day || ORDER.indexOf(a.kind) - ORDER.indexOf(b.kind));
}
