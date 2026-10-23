// Job board: offers appear on Mondays and expire after a week. Pure logic.
//
// An offer is a mission template plus variations: a client, pay +/-25%,
// threat +/-1, and sometimes a hidden twist (usually hinted on the board).

import { MISSIONS } from '../data/missions.js';
import { TWISTS } from '../data/twists.js';
import { CLIENTS } from '../data/clients.js';
import { pick } from './rng.js';
import { nextRng } from './random.js';
import { callingClients, trustOf, trustPay, driftTrust } from './clients.js';

export const templateById = (id) => MISSIONS.find((m) => m.id === id);
export const twistById = (id) => TWISTS.find((t) => t.id === id) ?? null;

const MAX_OFFERS = 4;
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
  const delta = job.threatDelta ?? 0;
  const trust = job.clientId ? trustOf(state, job.clientId) : null;
  return {
    tpl,
    client: CLIENTS.find((c) => c.id === job.clientId) ?? null,
    trust,
    pay: round50(tpl.pay * (job.payMult ?? 1) * (trust == null ? 1 : trustPay(trust))),
    threat: tpl.threat + delta,
    threatDelta: delta,
    hinted: Boolean(job.hinted),
  };
}

/** Weekly refresh: drop expired offers, clients drift towards neutral, add up to 2 new offers. Mutates the (cloned) state. */
export function refreshJobs(state) {
  state.jobs = state.jobs.filter((j) => j.expiresDay >= state.day);
  driftTrust(state);
  const rng = nextRng(state);
  let added = 0;
  while (state.jobs.length < MAX_OFFERS && added < 2) {
    const clients = callingClients(state);
    if (clients.length) {
      const client = weighted(rng, clients);
      addOffer(state, pick(rng, client.jobs), { rng, clientId: client.id });
    } else {
      addOffer(state, pick(rng, MISSIONS).id, { rng, clientId: null }); // nobody will call: walk-in work
    }
    added += 1;
  }
  if (added) {
    state.inbox.unshift({
      id: `jobs-${state.day}`, type: 'job', day: state.day,
      subject: `${added} new job${added > 1 ? 's' : ''} on the board`,
      body: 'Fresh work came in over the weekend. Check the Jobs screen.',
      blocking: false, read: false,
    });
  }
}
