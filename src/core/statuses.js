// Operative statuses: add, check, expire. Pure logic.

import { STATUSES } from '../data/statuses.js';

export const hasStatus = (op, id) => (op.status ?? []).some((s) => s.id === id);

/** Add (or extend) a status lasting until `until` (exclusive day). Mutates op. */
export function addStatus(op, id, until) {
  op.status = (op.status ?? []).filter((s) => s.id !== id);
  op.status.push({ id, until });
  return op;
}

/** Drop statuses that ran out by `day`. Mutates op. */
export function expireStatuses(op, day) {
  op.status = (op.status ?? []).filter((s) => s.until > day);
  return op;
}

/** Total roll modifier from an operative's statuses, with one note per status. */
export function statusRollMods(op) {
  return (op.status ?? []).map((s) => STATUSES[s.id]).filter((d) => d?.rollMod);
}
