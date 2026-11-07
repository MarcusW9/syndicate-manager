// Keeping the inbox bounded (save v46). Pure logic: takes state, trims state.inbox in place.
//
// What reads old messages, and why these rules keep everything it needs (DESIGN.md 2026-11-06):
// - core/week.js weekSummary reads this week's reports (day >= weekStart): inside the window.
// - Today's "back" cards (ui/app.js) read today's reports: inside the window.
// - Decisions (core/decisions.js), renewals, heat notices, specialisation offers, call-ins and raid
//   calls are looked up by id or kind while unresolved: kept whatever their age (isActionable).
// - A hall offer stands until the hall is opened, a raid warning until the raid is over, and an
//   opening job's message while its job is on the board: kept while that's true.
// - The memorial, runner pages, records and milestones keep their own copies (op.history,
//   op.record, memorial entries); none of them reads the inbox.
// Everything else is news: read messages go after INBOX_KEEP.weeks, unread ones after
// INBOX_KEEP.unreadWeeks, and never more than INBOX_KEEP.max messages are kept.

/**
 * Measured with tests/play.js playWeeks(52, 7) (2026-11-06): the last 4 weeks of messages come to
 * about 68KB, 8 weeks to about 142KB; a year unbounded was 501KB of a 555KB save.
 */
export const INBOX_KEEP = { weeks: 4, unreadWeeks: 8, max: 200 };

/** True while a message still waits for the player or points at something they can still act on. */
export function isActionable(state, m) {
  if (m.resolved === false) return true; // decisions, renewals, heat, spec offers, call-ins, raid calls
  if (m.blocking && !m.resolved) return true;
  const p = m.payload ?? {};
  if (m.kind === 'hall-offer') return !(state.halls ?? []).some((h) => h.district === p.district);
  if (m.kind === 'raid-warning') return (state.raids ?? []).some((r) => r.id === p.raidId && !r.done);
  if (p.jobId && (state.jobs ?? []).some((j) => j.id === p.jobId)) return true;
  return false;
}

/** Drop old news from the inbox; keep anything actionable. Mutates and returns state. */
export function trimInbox(state) {
  if (!Array.isArray(state.inbox)) return state;
  const age = (m) => state.day - (m.day ?? state.day);
  const keepDays = INBOX_KEEP.weeks * 7;
  const unreadDays = INBOX_KEEP.unreadWeeks * 7;
  let kept = state.inbox.filter((m) => isActionable(state, m) || age(m) < (m.read ? keepDays : unreadDays));
  if (kept.length > INBOX_KEEP.max) {
    // The newest first (the inbox is newest-first by unshift); actionable ones always stay.
    const news = kept.filter((m) => !isActionable(state, m)).sort((a, b) => (b.day ?? 0) - (a.day ?? 0));
    const drop = new Set(news.slice(Math.max(0, INBOX_KEEP.max - (kept.length - news.length))));
    kept = kept.filter((m) => !drop.has(m));
  }
  state.inbox = kept;
  return state;
}
