// The week as the tong's rhythm (DESIGN.md 2026-11-04, Phase 1): what's due on Sunday, Monday's
// briefing, the Sunday summary, and the crew standard a job expects. Pure logic, no DOM.

import { availability } from './crew.js';
import { TIER_LEVEL } from './record.js';
import { money } from './money.js';
import { heistLine } from './heists.js';

const signed = (n) => `${n >= 0 ? '+' : '−'}${money(Math.abs(n))}`;

/** Where the week started: set on a new game and after each Sunday's bills (time.js settleWeek). */
export const weekStartOf = (state) => ({ day: state.day, cash: state.cash, reputation: state.reputation ?? 0 });

/** What Sunday costs: wages for everyone alive (freelancers are paid per job), plus rent. */
export function billDue(state) {
  const wages = state.crew.filter((op) => op.condition.injury !== 'dead').reduce((n, op) => n + op.wage, 0);
  return { wages, rent: state.rent, total: wages + state.rent };
}

/** The tong's people this morning: free, out on jobs or side work, and hurt. */
export function rosterNow(state) {
  const crew = state.crew.filter((op) => op.condition.injury !== 'dead' && !op.freelance);
  const out = new Set((state.awayJobs ?? []).flatMap((j) => [...j.mission.crewIds, j.mission.overwatch?.id, j.mission.wheels, j.mission.standby?.id]));
  const away = crew.filter((op) => out.has(op.id) || (op.condition.awayUntil ?? 0) > state.day).length;
  const hurt = crew.filter((op) => op.condition.injury !== 'healthy').length;
  const free = crew.filter((op) => availability(state, op).ok).length;
  return { total: crew.length, free, away, hurt };
}

/** Monday's briefing: the numbers that frame the week. */
export function mondayBrief(state) {
  const sunday = state.day + 6;
  return {
    cash: state.cash,
    due: billDue(state).total,
    roster: rosterNow(state),
    jobs: state.jobs.length,
    expiring: state.jobs.filter((j) => j.expiresDay <= sunday).length,
    crewsOut: (state.awayJobs ?? []).length,
    heist: heistLine(state), // a heist on: how far the prep has got (core/heists.js)
  };
}

/** Reports filed this week (since the week started), by how they ended. */
function jobsThisWeek(state, since) {
  const reports = state.inbox.filter((m) => m.type === 'report' && m.day >= since);
  const count = (r) => reports.filter((m) => m.timeline?.result === r).length;
  return { done: count('completed'), aborted: count('aborted'), lost: count('loss'), badly: count('setback'), total: reports.length };
}

/**
 * The Sunday summary, worked out before the bills are paid. Returns plain lines for the week's
 * message: jobs, money (earned over the week, then the bills), reputation, and who's hurt.
 */
export function weekSummary(state) {
  const start = state.weekStart ?? weekStartOf(state);
  const jobs = jobsThisWeek(state, start.day);
  const bill = billDue(state);
  const earned = state.cash - start.cash;
  const net = earned - bill.total;
  const rep = (state.reputation ?? 0) - start.reputation;
  const r = rosterNow(state);
  const jobLine = jobs.total
    ? `Jobs: ${jobs.done} done${jobs.aborted ? `, ${jobs.aborted} walked away from` : ''}${jobs.badly ? `, ${jobs.badly} went badly` : ''}${jobs.lost ? `, ${jobs.lost} with someone lost` : ''}${(state.awayJobs ?? []).length ? `; ${(state.awayJobs ?? []).length} still out` : ''}.`
    : `No jobs came back this week${(state.awayJobs ?? []).length ? `; ${(state.awayJobs ?? []).length} still out` : ''}.`;
  return {
    net, earned, bill, rep, jobs,
    lines: [
      jobLine,
      `Money: ${signed(earned)} over the week, ${signed(net)} after the bills.`,
      rep ? `Reputation ${start.reputation} → ${state.reputation} (${rep > 0 ? '+' : ''}${rep}).` : `Reputation steady at ${state.reputation ?? 0}.`,
      r.hurt ? `${r.hurt} of ${r.total} hurt going into next week.` : `Everyone's on their feet: ${r.total} on the books.`,
      ...(heistLine(state) ? [heistLine(state)] : []),
    ],
  };
}

// --- the crew standard a job expects (guidance, never a lock) ---------------------------------

/** The capability a job of this threat expects: rookie work, pros, or a veteran leading. */
export function crewStandard(threat) {
  if (threat <= 1) return { tier: 'rookie', label: 'Rookie work', lead: false };
  if (threat <= 3) return { tier: 'pro', label: 'Pros', lead: false };
  return { tier: 'veteran', label: 'Veteran-led', lead: true };
}

/**
 * How a planned crew sits against the standard: { met, short, note }. A veteran-led job wants one
 * veteran and pros for the rest; pro work wants pros (a veteran counts); rookie work takes anyone.
 */
export function crewAgainstStandard(crew, threat) {
  const std = crewStandard(threat);
  const level = (op) => TIER_LEVEL[op.tier] ?? 1;
  if (!crew.length) return { std, met: false, short: 0, note: '' };
  const need = TIER_LEVEL[std.lead ? 'pro' : std.tier];
  const short = crew.filter((op) => level(op) < need).length;
  const hasLead = !std.lead || crew.some((op) => level(op) >= TIER_LEVEL.veteran);
  const over = std.tier === 'rookie' && crew.some((op) => level(op) >= TIER_LEVEL.veteran);
  const met = !short && hasLead;
  const note = met
    ? (over ? 'A veteran on rookie work: they could be somewhere that needs them.' : 'Meets the standard.')
    : [!hasLead && 'No veteran to lead it', short && `${short} below ${std.tier === 'veteran' || std.lead ? 'pro' : std.tier}`].filter(Boolean).join('; ') + '.';
  return { std, met, short, note };
}
