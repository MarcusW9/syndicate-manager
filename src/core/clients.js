// Client trust: 0-100, starts at 50. Pure logic.
// Trust changes pay, and a client below WONT_CALL stops offering work.

import { CLIENTS } from '../data/clients.js';

export const START_TRUST = 50;
export const WONT_CALL = 20;
export const TRUST_DRIFT = 2; // per week, back towards START_TRUST

export const clientById = (id) => CLIENTS.find((c) => c.id === id) ?? null;
export const trustOf = (state, id) => state.clients?.[id] ?? START_TRUST;

export function trustLabel(t) {
  if (t >= 75) return 'trusts you';
  if (t >= 60) return 'warming to you';
  if (t >= 40) return 'neutral';
  if (t >= WONT_CALL) return 'wary';
  return "won't call";
}

/** Pay multiplier from trust. */
export function trustPay(t) {
  if (t >= 75) return 1.15;
  if (t >= 60) return 1.05;
  if (t >= 40) return 1;
  return 0.9;
}

export function adjustTrust(state, id, delta) {
  if (!id || !delta) return 0;
  state.clients = state.clients ?? {};
  const before = trustOf(state, id);
  state.clients[id] = Math.max(0, Math.min(100, before + delta));
  return state.clients[id] - before;
}

/** Weekly: trust drifts slowly back towards neutral, so a burned bridge can mend. */
export function driftTrust(state) {
  for (const c of CLIENTS) {
    const t = trustOf(state, c.id);
    if (t === START_TRUST) continue;
    const step = Math.min(TRUST_DRIFT, Math.abs(t - START_TRUST));
    adjustTrust(state, c.id, t < START_TRUST ? step : -step);
  }
}

/** Clients willing to call, weighted by how much they like you. */
export function callingClients(state) {
  return CLIENTS.filter((c) => trustOf(state, c.id) >= WONT_CALL)
    .map((c) => ({ ...c, weight: 1 + trustOf(state, c.id) / 25 }));
}

/** Trust change for finishing a job: a clean job builds trust, more for dangerous ones. */
export const completionTrust = (threat) => 4 + threat;

/** Any aborted job costs a little trust, on top of choices marked "client unhappy". Not if you abort because of a twist. */
export const ABORT_TRUST = -3;
