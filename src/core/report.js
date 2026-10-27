// Job report summary: Joss's opening line, the turning point, the standout and what hurt
// us, worked out from the run's recorded events (mission.js, am.events). Pure logic.
//
// Every claim points back to a recorded event: no invented weaknesses, no random praise.
// A heading with nothing behind it is left out (drafts/mission-log-prototype.md).

import { PARTNER } from '../data/partner.js';

export const REPORT_LOGS_KEPT = 20; // reports that keep their full log; older ones keep the summary

const hash = (str) => { let h = 0; for (const ch of str) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h; };
const INJURY_WEIGHT = { light: 2, serious: 4, critical: 6 };
const statName = (s) => s[0].toUpperCase() + s.slice(1);
const pct = (n) => `${Math.round(n * 100)}%`;

/** How much a failed roll cost: injuries first, then heat, pay and cash. */
function damage(e) {
  const c = e.outcomeCost ?? {};
  return (INJURY_WEIGHT[e.injury?.severity] ?? 0) + (c.heat ?? 0) * 1.5 + (c.payCut ?? 0) * 3 + (c.cash ? 1 : 0) + 0.5;
}

/** A choice's own cost, paid whatever the roll: "Hide in an empty container" cost 20% of the pay. */
function choiceCostText(e) {
  const c = e.choiceCost ?? {};
  const parts = [];
  if (c.payCut > 0) parts.push(`${pct(c.payCut)} of the pay`);
  if (c.heat) parts.push(`heat +${c.heat}`);
  if (c.cash < 0) parts.push(`¥${(-c.cash).toLocaleString('en-GB')}`);
  return parts.length ? `"${e.choice}" cost ${parts.join(' and ')} whatever the roll.` : null;
}

/** Which of Joss's report openers fits: loss, aborted, hurt, clean or messy. */
export function introKind(events, { outcome, deaths = 0 }) {
  if (deaths || outcome === 'loss') return 'loss';
  if (outcome === 'aborted') return 'aborted';
  if (events.some((e) => ['serious', 'critical'].includes(e.injury?.severity))) return 'hurt';
  const rough = events.some((e) => (e.kind === 'roll' && !e.success) || choiceCostText(e));
  return rough ? 'messy' : 'clean';
}

/**
 * The summary at the top of a report. Returns { intro, introKind, turning, standout, hurt[], saves[], alert };
 * turning and standout are null when the run gives them nothing to point at; alert is null on runs
 * with no incidents (reports from before the squad run).
 */
export function summariseRun(events, { id = '', outcome, deaths = 0 }) {
  const kind = introKind(events, { outcome, deaths });
  const lines = PARTNER.reports?.[kind] ?? [];
  const intro = lines.length ? lines[hash(id) % lines.length] : null;

  const rolls = events.filter((e) => e.kind === 'roll' || (e.kind === 'critical' && e.action === 'stabilise'));
  const failures = rolls.filter((e) => !e.success).sort((a, b) => damage(b) - damage(a));
  const exit = events.find((e) => e.kind === 'exit' || (e.kind === 'critical' && e.action === 'extract'));

  // The turning point: the costliest failure; else the walk-out; else a close call that held
  // (2 or less to spare). A clean run with no close call has none: nothing to point at.
  let turning = null;
  if (failures.length) {
    const f = failures[0];
    turning = { text: `${f.actor.handle}'s ${f.stat} let them down. ${f.report ?? ''}`.trim(), event: events.indexOf(f) };
  } else if (exit) {
    turning = { text: exit.report ?? `The crew pulled out: ${exit.choice}.`, event: events.indexOf(exit) };
  } else if (rolls.length) {
    const close = [...rolls].sort((a, b) => (a.die + a.value - a.need) - (b.die + b.value - b.need))[0];
    if (close.die + close.value - close.need <= 2) turning = { text: `${close.actor.handle}'s ${close.stat} held, just. ${close.report ?? ''}`.trim(), event: events.indexOf(close) };
  }

  // The standout: whoever made the most rolls work (ties: the bigger margins).
  const byActor = new Map();
  for (const e of rolls.filter((x) => x.success)) {
    const a = byActor.get(e.actor.handle) ?? { handle: e.actor.handle, n: 0, margin: 0, stats: new Set() };
    a.n += 1; a.margin += e.die + e.value - e.need; a.stats.add(e.stat);
    byActor.set(e.actor.handle, a);
  }
  const best = [...byActor.values()].sort((a, b) => b.n - a.n || b.margin - a.margin)[0];
  const standout = best ? { text: `${best.handle}: ${[...best.stats].map(statName).join(' and ')}, ${best.n === 1 ? 'one clean roll' : `${best.n} clean rolls`}.` } : null;

  // What hurt us: other failures, and costs paid whatever the roll (so they don't read as bad luck).
  const hurt = [
    ...failures.slice(1).map((f) => `${f.actor.handle}'s ${f.stat}: ${f.report ?? f.choice}`),
    ...events.filter((e) => e.kind !== 'exit').map(choiceCostText).filter(Boolean),
  ];

  // The squad run (slice 2): who got whom out of trouble, and how hot the alert ran.
  const saves = events.filter((e) => e.kind === 'save' && e.success && e.via !== 'patch').map((e) => ({ by: e.actor.handle, who: e.patient, via: e.via, kit: e.kit ?? null }));
  const alerts = events.filter((e) => typeof e.alert === 'number').map((e) => e.alert);
  const alert = alerts.length ? Math.max(...alerts) : null;

  return { intro, introKind: kind, turning, standout, hurt, saves, alert };
}
