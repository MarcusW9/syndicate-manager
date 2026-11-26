// Money as players read it, e.g. "¥1,250". Pure: used in message text and on screen.

import { NAMES } from '../config/names.js';

export const money = (n) => `${n < 0 ? '-' : ''}${NAMES.currency}${Math.abs(n).toLocaleString()}`;

/**
 * Move cash and remember why, for the top bar's breakdown of the day (first-run walkthrough, 2026-11-26).
 * Mutates a clone, like the rest of core. `what` is a short plain line ("Crate Return: paid"). onJob: paid by a crew
 * still out (a crisis choice), so Today can say so the day it happens, not only in the report days later.
 */
export function moveCash(state, amount, what, { onJob = false } = {}) {
  if (!amount) return;
  state.cash += amount;
  (state.cashToday ??= []).push(onJob ? { amount, what, onJob: true } : { amount, what });
}

/** A new day: the top bar's change and its breakdown start again from here. */
export function startCashDay(state) {
  state.dayStartCash = state.cash;
  state.cashToday = [];
}

/**
 * Today's movements, oldest first, and an "Other" line for anything not written down, so the
 * list always adds up to the top bar's change (cash − dayStartCash).
 */
export function cashLines(state) {
  const lines = [...(state.cashToday ?? [])];
  const known = lines.reduce((n, l) => n + l.amount, 0);
  const rest = state.cash - (state.dayStartCash ?? state.cash) - known;
  if (rest) lines.push({ amount: rest, what: 'Other' });
  return lines;
}
