// The Legend defining job (renown slice 5; drafts/PROPOSAL-runner-renown.md 2.7, review decision 6,
// and drafts/PROPOSAL-phase-3.md part B). When a runner meets every Legend condition (core/fame.js
// legendEligible), the city asks for them by name: a defining job goes on the board, a template the
// board could already deal at threat 3-4, one step harder, paying half as much again, for a week.
// If a heist is open, its finale is their defining job instead of a separate offer. Done with them
// on the crew, they become a Legend; a death on it after the player pushed on makes them one for
// good. A failure, an abort, an expiry or sending it without them means the city asks again in
// four weeks, with no limit on tries. A Legend is never lost. Never touches a roll: the template
// pick is a hash of the seed, so no other roll moves (state.rngCounter stays put).
//
// State: runner `legendCall` { day, tries, offerId, retryDay } and, once earned, `legend` { day, path,
// jobId }; the offer carries `defining: <runner id>`; a memorial entry gains `legend` and `fame`.

import { LEGEND, LEGEND_TEXT } from '../data/legend.js';
import { MISSIONS } from '../data/missions.js';
import { CLIENTS } from '../data/clients.js';
import { isOpeningJob } from '../data/halls.js';
import { heistFor } from './heists.js';
import { hashRng } from './rng.js';
import { addOffer, jobUnlocked, templateById } from './jobs.js';
import { legendEligible, pathOf } from './fame.js';
import { addHighlight } from './milestones.js';

/**
 * Fill {tokens}. "the {job}" and "the {heist}" drop the "the" when the name starts with an article
 * ("The Favourite", "An Old Account", "A Steady Hand"), keeping a capital "The" at a sentence's start.
 */
const ARTICLE = /^(the|a|an)\s/i;
const fill = (text, vars) => text
  .replace(/\b(the|The) \{(\w+)\}/g, (m, the, k) => (vars[k] == null ? m : ARTICLE.test(vars[k]) ? vars[k] : `${the} ${vars[k]}`))
  .replace(/\{(\w+)\}/g, (m, k) => vars[k] ?? m);
const isFreelancer = (op) => !!op.freelance;

/** Has this runner already been made a Legend? */
export const isLegend = (op) => !!op.legend || op.fame === 'legend';

/** The runner a defining offer is for, if it is one. */
export const definingOf = (state, job) => (job?.defining ? state.crew.find((o) => o.id === job.defining) ?? null : null);

/** Is a job (on the board or under way) this runner's live defining job? */
function liveOffer(state, op) {
  const id = op.legendCall?.offerId;
  if (!id) return false;
  if (state.jobs.some((j) => j.id === id)) return true;
  if (state.activeMission?.jobId === id && !state.activeMission.done) return true;
  return (state.awayJobs ?? []).some((a) => a.mission?.jobId === id && !a.mission.done);
}

/**
 * A template the board could already deal, threat 3-4: not rookie, routine, opening or heist-only
 * work. A runner ready for Legend has a reputation to match, but if no such job is unlocked the call
 * still comes (from the gated ones) rather than stalling.
 */
export function definingTemplates(state) {
  const all = MISSIONS.filter((m) => !m.rookie && !m.routine && !m.walkIn && !m.heistOnly && !isOpeningJob(m.id) && LEGEND.threats.includes(m.threat));
  const open = all.filter((m) => jobUnlocked(state, m.id));
  return open.length ? open : all;
}

/** An open heist whose finale isn't on the board yet: a ready runner waits for it. */
const heistComing = (state) => Object.values(state.heists ?? {}).some((h) => h.status === 'open' && !h.finaleJobId);
/** An open heist's finale on the board that is nobody's defining job yet. */
const freeFinale = (state) => {
  for (const h of Object.values(state.heists ?? {})) {
    if (h.status !== 'open' || !h.finaleJobId) continue;
    const job = state.jobs.find((j) => j.id === h.finaleJobId);
    if (job && !job.defining) return job;
  }
  return null;
};

/** The wording for this runner's path: the owner's per-path text, or the generic body. */
const bodyFor = (t, op) => t.byPath?.[pathOf(op).id] ?? t.body;

function note(state, op, kind, vars = {}) {
  const t = LEGEND_TEXT[kind];
  const v = { op: op.handle, name: op.name, ...vars };
  const subject = kind === 'call' && vars.finale ? t.subjectFinale : t.subject;
  state.inbox.unshift({ id: `legend-${kind}-${op.id}-${state.day}`, type: 'crew', day: state.day, subject: fill(subject, v), body: fill(bodyFor(t, op), v), blocking: false, read: false });
}

/**
 * Daily (after tickHeists). Ends calls whose offer has gone, then calls the best ready runner: one
 * defining job at a time across the crew. Mutates the (cloned) state.
 */
export function legendTick(state) {
  for (const op of state.crew) {
    const call = op.legendCall;
    if (call?.offerId && !liveOffer(state, op)) {
      call.offerId = null; call.tries = (call.tries ?? 0) + 1; call.retryDay = state.day + LEGEND.retryDays; // expired
    }
  }
  if (state.crew.some((o) => o.legendCall?.offerId)) return state;
  const ready = state.crew
    .filter((o) => !isFreelancer(o) && !isLegend(o) && legendEligible(o) && (o.legendCall?.retryDay ?? 0) <= state.day)
    .sort((a, b) => (b.standing ?? 0) - (a.standing ?? 0) || (a.id < b.id ? -1 : 1));
  const op = ready[0];
  if (!op) return state;
  const finale = freeFinale(state);
  if (!finale && heistComing(state)) return state; // a heist is open: wait for its finale
  const call = (op.legendCall ??= { day: state.day, tries: 0, offerId: null, retryDay: 0 });
  if (finale) {
    finale.defining = op.id;
    call.offerId = finale.id;
    note(state, op, 'call', { heist: heistFor(state, finale.id)?.def.name ?? templateById(finale.templateId).name, finale: true });
    return state;
  }
  const options = definingTemplates(state);
  if (!options.length) return state;
  const tpl = options[Math.floor(hashRng(state.seed, 'legend-job', op.id, call.tries)() * options.length)];
  addOffer(state, tpl.id); // a plain offer: no roll
  const job = state.jobs.at(-1);
  job.payMult = LEGEND.payMult;
  job.threatDelta = LEGEND.threatDelta;
  job.defining = op.id;
  job.expiresDay = state.day + LEGEND.days;
  call.offerId = job.id;
  note(state, op, 'call', { heist: tpl.name });
  return state;
}

/**
 * A run that carried a defining job has ended (core/mission.js finish, after the memorial and fame).
 * Returns report lines [{ tone, text }]. ctx: { outcome, deaths: [op], onJobIds, jobName }. Mutates.
 */
export function legendResult(state, am, { outcome, deaths, onJobIds, jobName }) {
  if (!am.defining) return [];
  const id = am.defining;
  const alive = state.crew.find((o) => o.id === id);
  const fallen = (deaths ?? []).find((o) => o.id === id);
  const vars = { job: jobName };
  const asked = (op) => {
    const call = (op.legendCall ??= { day: state.day, tries: 0, offerId: null, retryDay: 0 });
    call.offerId = null; call.tries = (call.tries ?? 0) + 1; call.retryDay = state.day + LEGEND.retryDays;
  };
  if (fallen) {
    // Deaths only follow a choice the player made (push on): the city makes them a Legend anyway.
    const entry = state.memorial.find((m) => m.id === id);
    const path = pathOf(fallen).id;
    if (entry) { entry.legend = { day: state.day, path, jobId: am.jobId, posthumous: true }; entry.fame = 'legend'; }
    const v = { ...vars, op: fallen.handle, name: fallen.name };
    state.inbox.unshift({ id: `legend-posthumous-${id}-${state.day}`, type: 'crew', day: state.day, subject: fill(LEGEND_TEXT.posthumous.subject, v), body: fill(bodyFor(LEGEND_TEXT.posthumous, { ...fallen }), v), blocking: false, read: false });
    return [{ tone: 'milestone', text: `Legend: ${fill(LEGEND_TEXT.posthumous.report, v)}` }];
  }
  if (!alive) return [];
  const v = { ...vars, op: alive.handle, name: alive.name };
  if (!onJobIds.includes(id)) { asked(alive); return [{ tone: 'plain', text: fill(LEGEND_TEXT.skipped.report, v) }]; }
  if (outcome !== 'completed') { asked(alive); return [{ tone: 'bad', text: fill(LEGEND_TEXT.failed.report, v) }]; }
  alive.legend = { day: state.day, path: pathOf(alive).id, jobId: am.jobId };
  alive.fame = 'legend';
  if (alive.legendCall) alive.legendCall.offerId = null;
  alive.history.push(`Day ${state.day}: ${fill(LEGEND_TEXT.history.earned, vars)}`);
  if (alive.record) addHighlight(alive.record, { id: 'legend', day: state.day, text: `${alive.handle} became a Legend.`, weight: LEGEND.highlightWeight });
  state.inbox.unshift({ id: `legend-earned-${id}-${state.day}`, type: 'crew', day: state.day, subject: fill(LEGEND_TEXT.earned.subject, v), body: fill(bodyFor(LEGEND_TEXT.earned, alive), v), blocking: false, read: false });
  return [{ tone: 'milestone', text: `Legend: ${fill(LEGEND_TEXT.earned.report, v)}` }];
}
