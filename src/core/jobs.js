// Job board: new work trickles in through the week and each offer stays a week. Pure logic.
//
// An offer is a mission template plus variations: a client, pay +/-25%,
// threat +/-1, and sometimes a hidden twist (usually hinted on the board).

import { MISSIONS } from '../data/missions.js';
import { TWISTS } from '../data/twists.js';
import { CLIENTS } from '../data/clients.js';
import { pick, makeRng } from './rng.js';
import { nextRng } from './random.js';
import { callingClients, trustOf, trustPay } from './clients.js';
import { rumourFor } from './rumours.js';

export const templateById = (id) => MISSIONS.find((m) => m.id === id);
export const twistById = (id) => TWISTS.find((t) => t.id === id) ?? null;

// A busier board of smaller work (PLAN-PROGRESSION.md step 0: rookies need ~3 jobs a week).
export const MAX_OFFERS = 5;

// New work trickles in rather than landing all at once: one offer in each window
// (Mon-Tue, Wed-Thu, Fri-Sun), on a day picked from the save's seed and the week, so
// it's the same on reload without storing anything and never uses up the game's rng.
export const ARRIVAL_WINDOWS = [[0, 1], [2, 3], [4, 5, 6]];
export const NEW_PER_WEEK = ARRIVAL_WINDOWS.length;

/** The days new work comes in during the week that `day` falls in. */
export function arrivalDays(state, day) {
  const monday = day - ((day - 1) % 7);
  const rng = makeRng((state.seed ^ Math.imul(monday, 2654435761)) >>> 0);
  return ARRIVAL_WINDOWS.map((w) => monday + pick(rng, w));
}

// Reputation needed before a job of this (template) threat is offered; rookie jobs are
// always open. Even threat-1 work outside the rookie jobs (the courier run) waits a few
// weeks: its crises are aimed at pros. New games only: state.jobGates is set by
// createNewGame; older saves keep an open board.
export const JOB_GATES = { 1: 10, 2: 15, 3: 35, 4: 60, 5: 80 };

/** Reputation a crew needs before this kind of job is offered. */
export const jobGate = (templateId) => {
  const tpl = templateById(templateId);
  return tpl.rookie ? 0 : JOB_GATES[tpl.threat] ?? 0;
};

/** Can this crew be offered this kind of job yet? */
export const jobUnlocked = (state, templateId) => !state.jobGates || jobGate(templateId) <= (state.reputation ?? 0);

/** The next job tier still locked: { threat, rep } or null. For the board's teaser. */
export function nextUnlock(state) {
  if (!state.jobGates) return null;
  const next = Object.entries(JOB_GATES).find(([, rep]) => rep > (state.reputation ?? 0));
  return next ? { threat: Number(next[0]), rep: next[1] } : null;
}
export const TWIST_CHANCE = 0.25;
export const HINT_IF_TWIST = 0.8; // a real twist is hinted 80% of the time
export const HINT_IF_CLEAN = 0.1; // a clean job is wrongly hinted 10% of the time

const round50 = (n) => Math.round(n / 50) * 50;
const weighted = (rng, items) => {
  let r = rng() * items.reduce((n, i) => n + i.weight, 0);
  for (const i of items) { r -= i.weight; if (r < 0) return i; }
  return items.at(-1);
};

/** Add an offer. With no rng, it's a plain offer: no variation, no twist (used for the opening board). */
export function addOffer(state, templateId, { rng = null, clientId = null } = {}) {
  const n = (state.jobSeq = (state.jobSeq ?? 0) + 1);
  const tpl = templateById(templateId);
  const client = clientId ?? CLIENTS.find((c) => c.jobs.includes(templateId))?.id ?? null;
  let payMult = 1, threatDelta = 0, twist = null, hinted = false;
  if (rng) {
    payMult = 0.75 + Math.floor(rng() * 11) * 0.05; // 0.75 .. 1.25 in 5% steps
    const r = rng();
    threatDelta = r < 0.25 ? -1 : r < 0.75 ? 0 : 1;
    if (tpl.threat + threatDelta < 1 || tpl.threat + threatDelta > 5) threatDelta = 0;
    twist = rng() < TWIST_CHANCE ? pick(rng, TWISTS).id : null;
    hinted = rng() < (twist ? HINT_IF_TWIST : HINT_IF_CLEAN);
  }
  state.jobs.push({
    id: `job-${n}`, templateId, clientId: client,
    payMult: Math.round(payMult * 100) / 100, threatDelta, twist, hinted,
    offeredDay: state.day, expiresDay: state.day + 6,
  });
}

/** What the board and planning screen show for an offer: template + variations + client trust. */
export function jobView(state, job) {
  const tpl = templateById(job.templateId);
  // This week's street talk can make every job in a district a step hotter or quieter (always true, always shown).
  const rumour = rumourFor(state, tpl.district);
  const delta = Math.max(1 - tpl.threat, Math.min(5 - tpl.threat, (job.threatDelta ?? 0) + (rumour?.threat ?? 0)));
  const trust = job.clientId ? trustOf(state, job.clientId) : null;
  return {
    tpl,
    client: CLIENTS.find((c) => c.id === job.clientId) ?? null,
    trust,
    pay: round50(tpl.pay * (job.payMult ?? 1) * (trust == null ? 1 : trustPay(trust))),
    threat: tpl.threat + delta,
    threatDelta: delta,
    hinted: Boolean(job.hinted),
    rumour,
  };
}

/** Daily: offers past their last day leave the board, and on an arrival day new work comes in. Mutates the (cloned) state. */
export function tickJobs(state) {
  state.jobs = state.jobs.filter((j) => j.expiresDay >= state.day);
  const slot = arrivalDays(state, state.day).indexOf(state.day);
  if (slot >= 0) postJobs(state, 1, { slot });
}

/**
 * Add up to `count` new offers, while the board has room. `slot` is the first one's place
 * in the week's arrivals: on a gated board the week's first is always small work, and only
 * the first two can be walk-ins. Mutates the (cloned) state; returns how many were added.
 */
export function postJobs(state, count = NEW_PER_WEEK, { slot = 0 } = {}) {
  const rng = nextRng(state);
  const open = MISSIONS.filter((m) => jobUnlocked(state, m.id));
  // Walk-in work (walkIn: true, e.g. the market delivery) has no client and turns up on its own.
  const walkIns = open.filter((m) => m.walkIn);
  const rookieWork = open.filter((m) => m.rookie);
  let added = 0;
  while (state.jobs.length < MAX_OFFERS && added < count) {
    const n = slot + added;
    const clients = callingClients(state).filter((c) => c.jobs.some((id) => jobUnlocked(state, id)));
    if (state.jobGates && n === 0 && rookieWork.length) {
      // A gated board always has some small work, so a crew is never priced out of earning.
      const tpl = pick(rng, rookieWork);
      const client = clients.filter((c) => c.jobs.includes(tpl.id));
      addOffer(state, tpl.id, { rng, clientId: client.length ? weighted(rng, client).id : null });
    } else if (walkIns.length && n <= 1 && rng() < 1 / 3) {
      addOffer(state, pick(rng, walkIns).id, { rng, clientId: null });
    } else if (clients.length) {
      const client = weighted(rng, clients);
      addOffer(state, pick(rng, client.jobs.filter((id) => jobUnlocked(state, id))), { rng, clientId: client.id });
    } else {
      addOffer(state, pick(rng, open).id, { rng, clientId: null }); // nobody will call: walk-in work
    }
    added += 1;
  }
  if (added === 1) {
    const job = state.jobs.at(-1);
    const client = CLIENTS.find((c) => c.id === job.clientId);
    state.inbox.unshift({
      id: `jobs-${state.day}`, type: 'job', day: state.day,
      subject: `New job: ${templateById(job.templateId).name}`,
      body: `${client ? `${client.name} has work for the crew.` : 'Walk-in work, no client attached.'} It's on the board for a week.`,
      blocking: false, read: false,
    });
  } else if (added) {
    state.inbox.unshift({
      id: `jobs-${state.day}`, type: 'job', day: state.day,
      subject: `${added} new jobs on the board`,
      body: 'Fresh work came in. Check the Jobs screen.',
      blocking: false, read: false,
    });
  }
  return added;
}
