// Heists (DESIGN.md 2026-11-07, Phase 3 part A; plan in drafts/PROPOSAL-phase-3.md). Pure logic.
//
// A contact offers a heist on a Monday once the tong meets its gate (data/heists.js). Its prep jobs
// go on the board at once, for the weeks before the finale's week; each one finished changes the
// finale in a way its plan shows (shown risk is used risk): a step less threat, a crisis that
// can't come up, intel on every roll, or more pay. A prep job walked away from, failed or left on
// the board is asked once more with another job; after that it can be bought from a fixer, or done
// without. Nothing locks the finale. In the heist's last week the finale goes on the board with
// whatever was prepared; finish it and the heist is done; walk away, lose it or let the week go by
// and it's over. One heist at a time.
//
// state.heists (save v47): { heistId: { status: 'open' | 'done' | 'failed' | 'missed', offeredDay,
//   finaleDay, finaleJobId, steps: { stepId: { status: 'asked' | 'done' | 'failed' | 'bought',
//   jobId, tries, templateId } } } }.
// The finale's offer carries what was prepared: job.heist, job.threatDelta, job.payMult, job.drop
// (crisis ids) and job.inside (intel's source). jobView passes them on; startMission leaves the
// dropped crises out of the draw and keeps job.inside as am.inside for the rolls (intelFor).

import { HEISTS, HEIST_RULES, heistById } from '../data/heists.js';
import { addOffer, templateById } from './jobs.js';
import { clientById } from './clients.js';
import { money } from './money.js';

const round50 = (n) => Math.round(n / 50) * 50;
const stillOut = (state, jobId) => state.jobs.some((j) => j.id === jobId) || state.activeMission?.jobId === jobId || (state.awayJobs ?? []).some((j) => j.mission?.jobId === jobId);
const contactName = (h) => clientById(h.contact)?.name ?? 'The contact';
/** A prep line as a sentence: it may already end with its own full stop. */
export const asSentence = (line) => (/[.!?]$/.test(line) ? line : `${line}.`);

/** A heist's progress, or null if it hasn't been offered. */
export const heistOf = (state, id) => state.heists?.[id] ?? null;

/** The heist in progress, as { def, h }, or null. */
export function openHeist(state) {
  const id = Object.keys(state.heists ?? {}).find((k) => state.heists[k].status === 'open' && heistById(k));
  return id ? { def: heistById(id), h: state.heists[id] } : null;
}

/** The first day of the finale's week: prep has to be done before it. */
export const finaleWeekStart = (h) => h.finaleDay - 6;

/** Is this offer (or run) part of a heist? { def, h, step } with step null for the finale; or null. */
export function heistFor(state, jobId) {
  for (const [id, h] of Object.entries(state.heists ?? {})) {
    const def = heistById(id);
    if (!def || h.status !== 'open') continue;
    if (h.finaleJobId === jobId) return { def, h, step: null };
    const step = def.prep.find((p) => h.steps[p.id]?.jobId === jobId && h.steps[p.id].status === 'asked');
    if (step) return { def, h, step };
  }
  return null;
}

/** What the steps done (or bought) give the finale: { threat, drop[], intel, pay, lines[] }. */
export function heistEffects(def, h) {
  const out = { threat: 0, drop: [], intel: null, pay: 0, lines: [] };
  for (const p of def.prep) {
    const st = h.steps[p.id]?.status;
    if (st !== 'done' && st !== 'bought') continue;
    const e = p.effect;
    if (e.threat) out.threat += e.threat;
    if (e.drop) out.drop.push(e.drop);
    if (e.intel) out.intel = out.intel ?? e.intel;
    if (e.pay) out.pay += e.pay;
    out.lines.push({ step: p.id, text: p.line, effect: effectText(p), bought: st === 'bought' });
  }
  return out;
}

/** What a step changes, in plain words, for the plan and the Ops card (data/heists.js `shows`). */
export const effectText = (step) => step.shows;

/** Has the tong reached this heist's gate? */
export const heistReady = (state, def) => (state.reputation ?? 0) >= def.gate.rep && (state.halls ?? []).length >= (def.gate.halls ?? 1);

/** What buying a failed step costs: a share of its job's pay. */
export function stepPrice(def, h, stepId) {
  const step = def.prep.find((p) => p.id === stepId);
  const tpl = templateById(h.steps[stepId]?.templateId ?? step?.templates[0]);
  return tpl ? round50(tpl.pay * HEIST_RULES.fixerShare) : 0;
}

/** Can this step be bought now? { ok, price, reason }. */
export function canBuyStep(state, heistId, stepId) {
  const def = heistById(heistId);
  const h = heistOf(state, heistId);
  if (!def || !h || h.status !== 'open') return { ok: false, reason: 'No heist on' };
  if (h.steps[stepId]?.status !== 'failed') return { ok: false, reason: 'Only a step that went wrong can be bought' };
  if (h.finaleJobId && !state.jobs.some((j) => j.id === h.finaleJobId)) return { ok: false, reason: 'The finale is under way' };
  const price = stepPrice(def, h, stepId);
  if (state.cash < price) return { ok: false, price, reason: `Needs ${money(price)}` };
  return { ok: true, price };
}

/** Buy a step that went wrong from a fixer: its effect counts as done. Returns a new state. */
export function buyStep(prev, heistId, stepId) {
  const check = canBuyStep(prev, heistId, stepId);
  if (!check.ok) return prev;
  const state = structuredClone(prev);
  const def = heistById(heistId);
  const h = state.heists[heistId];
  state.cash -= check.price;
  h.steps[stepId].status = 'bought';
  refreshFinale(state, def, h);
  const step = def.prep.find((p) => p.id === stepId);
  state.inbox.unshift({
    id: `heist-buy-${heistId}-${stepId}-${state.day}`, type: 'job', kind: 'heist-news', day: state.day,
    subject: `${def.name}: bought from a fixer`,
    body: `${step.fixer?.confirmation ?? `${asSentence(step.line)} A fixer sorted it.`} Paid ${money(check.price)}. In the finale's plan: ${effectText(step)}.`,
    payload: { heistId }, blocking: false, read: true,
  });
  return state;
}

// Post a prep step's job (the first ask, or the retry), on the board until the finale's week.
function askStep(state, def, h, step, tries) {
  const templateId = step.templates[Math.min(tries, step.templates.length - 1)];
  addOffer(state, templateId, { clientId: def.contact });
  const job = state.jobs.at(-1);
  job.expiresDay = finaleWeekStart(h) - 1;
  job.heistStep = { heist: def.id, step: step.id }; // the board's flag
  h.steps[step.id] = { status: 'asked', jobId: job.id, tries: tries + 1, templateId };
  return job;
}

// The finale's offer, with what was prepared. Called when it's posted and whenever a step changes
// while it's still on the board (a crew back late from prep, a step bought).
function finaleFields(def, h) {
  const tpl = templateById(def.finale);
  const fx = heistEffects(def, h);
  return {
    heist: def.id,
    threatDelta: (def.threatDelta ?? 0) + fx.threat,
    payMult: Math.round((def.pay / tpl.pay) * (1 + fx.pay) * 100) / 100,
    drop: fx.drop,
    inside: fx.intel,
  };
}

function refreshFinale(state, def, h) {
  const job = h.finaleJobId && state.jobs.find((j) => j.id === h.finaleJobId);
  if (job) Object.assign(job, finaleFields(def, h));
}

function postFinale(state, def, h) {
  addOffer(state, def.finale, { clientId: def.contact });
  const job = state.jobs.at(-1);
  job.expiresDay = h.finaleDay;
  Object.assign(job, finaleFields(def, h));
  h.finaleJobId = job.id;
  const fx = heistEffects(def, h);
  const done = fx.lines.length;
  state.inbox.unshift({
    id: `heist-finale-${def.id}-${state.day}`, type: 'job', kind: 'heist', day: state.day,
    subject: `${def.name}: the finale is on`,
    body: `${def.finaleLine} ${done ? `Prepared: ${done} of ${def.prep.length}.` : 'Nothing was prepared: it will be the hard way.'} It's on the board until Sunday.`,
    payload: { heistId: def.id, jobId: job.id }, blocking: false, read: false,
  });
}

/**
 * Mondays: a contact offers the first heist whose gate the tong has reached, if none is on.
 * Mutates the (cloned) state.
 */
export function introduceHeists(state) {
  state.heists = state.heists ?? {};
  if (openHeist(state)) return state;
  const def = HEISTS.find((d) => !state.heists[d.id] && heistReady(state, d));
  if (!def) return state;
  const h = { status: 'open', offeredDay: state.day, finaleDay: state.day + def.weeks * 7 - 1, finaleJobId: null, steps: {} };
  state.heists[def.id] = h;
  for (const step of def.prep) askStep(state, def, h, step, 0);
  state.inbox.unshift({
    id: `heist-${def.id}-${state.day}`, type: 'job', kind: 'heist', day: state.day,
    subject: `Call from ${contactName(def)}: ${def.name}`, // rings as a direct buzz first (ui/app.js renderBuzz)
    body: `${def.intro} Three prep jobs are on the board until the finale's week; each one you finish makes the night easier. The finale is in ${def.weeks} weeks.`,
    payload: { heistId: def.id }, blocking: false, read: false,
  });
  return state;
}

/**
 * Daily, after the board's tick: a prep job that left the board unfinished counts as walked away
 * (asked once more if there's time); in the finale's week the finale goes on the board; and a
 * finale that left the board without being done means the night is gone. Mutates the (cloned) state.
 */
export function tickHeists(state) {
  for (const [id, h] of Object.entries(state.heists ?? {})) {
    const def = heistById(id);
    if (!def || h.status !== 'open') continue;
    for (const step of def.prep) {
      const s = h.steps[step.id];
      if (s?.status === 'asked' && !stillOut(state, s.jobId)) s.status = 'failed';
      if (s?.status === 'failed') maybeRetry(state, def, h, step);
    }
    if (!h.finaleJobId && state.day >= finaleWeekStart(h)) postFinale(state, def, h);
    else if (h.finaleJobId && !stillOut(state, h.finaleJobId)) closeHeist(state, def, h, 'missed');
  }
  return state;
}

function maybeRetry(state, def, h, step) {
  const s = h.steps[step.id];
  if (s.tries > HEIST_RULES.retries) return;
  if (state.day + HEIST_RULES.retryBefore > finaleWeekStart(h) - 1) return;
  const job = askStep(state, def, h, step, s.tries);
  state.inbox.unshift({
    id: `heist-retry-${def.id}-${step.id}-${state.day}`, type: 'job', kind: 'heist-news', day: state.day,
    subject: `${def.name}: another way in`,
    body: `${asSentence(step.line)} That didn't come off, so ${contactName(def)} has another job for it: ${templateById(job.templateId).name}, on the board until the finale's week.`,
    payload: { heistId: def.id, jobId: job.id }, blocking: false, read: false,
  });
}

function closeHeist(state, def, h, status) {
  h.status = status;
  if (status === 'missed') {
    state.inbox.unshift({
      id: `heist-missed-${def.id}-${state.day}`, type: 'job', kind: 'heist-news', day: state.day,
      subject: `${def.name}: the night has gone`,
      body: `Nobody went, and the chance has passed. ${contactName(def)} won't mention it again.`,
      payload: { heistId: def.id }, blocking: false, read: false,
    });
  }
}

/**
 * A run has ended (core/mission.js finish): a prep step is done or went wrong; the finale ends the
 * heist. Returns report lines (maybe none). Mutates state.
 */
export function heistResult(state, jobId, outcome) {
  const hit = heistFor(state, jobId);
  if (!hit) return [];
  const { def, h, step } = hit;
  if (step) {
    const s = h.steps[step.id];
    s.status = outcome === 'completed' ? 'done' : 'failed';
    refreshFinale(state, def, h);
    if (s.status === 'done') return [{ tone: 'good', text: `${def.name}: ${asSentence(step.line)} In the finale's plan: ${effectText(step)}.` }];
    const again = s.tries <= HEIST_RULES.retries && state.day + HEIST_RULES.retryBefore <= finaleWeekStart(h) - 1;
    if (again) maybeRetry(state, def, h, step);
    return [{ tone: 'warn', text: `${def.name}: that prep didn't come off. ${again ? `${contactName(def)} has another job for it on the board.` : 'It can still be bought from a fixer, or done without.'}` }];
  }
  if (outcome === 'completed') {
    h.status = 'done';
    state.reputation = (state.reputation ?? 0) + HEIST_RULES.rep;
    return [{ tone: 'milestone', text: `${def.name} is done. The street will talk about this one (reputation +${HEIST_RULES.rep}).` }];
  }
  h.status = 'failed';
  return [{ tone: 'bad', text: `${def.name} is over. ${contactName(def)} won't ask again.` }];
}

/** For the Ops card: each step's state, the date, and what's prepared. */
export function heistCard(state) {
  const open = openHeist(state);
  if (!open) return null;
  const { def, h } = open;
  const fx = heistEffects(def, h);
  return {
    id: def.id, name: def.name, contact: contactName(def), finaleDay: h.finaleDay, weekStart: finaleWeekStart(h),
    finaleJobId: h.finaleJobId,
    steps: def.prep.map((p) => {
      const s = h.steps[p.id] ?? { status: 'asked' };
      const buy = canBuyStep(state, def.id, p.id);
      return { id: p.id, line: p.line, effect: effectText(p), fixer: p.fixer ?? null, status: s.status, jobId: s.status === 'asked' ? s.jobId : null, templateId: s.templateId ?? null, buy: s.status === 'failed' ? buy : null };
    }),
    prepared: fx.lines.length,
  };
}

/** One line for Monday's briefing and Sunday's summary while a heist is on, or null. */
export function heistLine(state) {
  const open = openHeist(state);
  if (!open) return null;
  const { def, h } = open;
  const done = heistEffects(def, h).lines.length;
  const days = finaleWeekStart(h) - state.day;
  const when = h.finaleJobId ? 'the finale is on the board this week' : days <= 1 ? 'the finale goes up tomorrow' : `the finale goes up in ${days} days`;
  return `${def.name}: ${done} of ${def.prep.length} prepared; ${when}.`;
}
