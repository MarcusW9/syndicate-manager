// Decision messages: blocking inbox messages that wait for the player to pick an option.
// A message carries { kind, options: [{ id, label }], payload }; RESOLVERS maps kind -> resolver.
// Pure logic.

import { RENEWAL_RESOLVER } from './renewals.js';

/** kind -> (state, msg, optionId) => void. Mutates the (cloned) state; leaves msg.resolved to decide. */
export const RESOLVERS = {
  renewal: RENEWAL_RESOLVER,
};

/** Resolve one option on a decision message. Returns a new state; unknown ids or kinds change nothing. */
export function resolveDecision(prev, msgId, optionId) {
  const msg = prev.inbox.find((m) => m.id === msgId);
  const resolver = msg && RESOLVERS[msg.kind];
  if (!resolver || msg.resolved || !msg.options?.some((o) => o.id === optionId && !o.disabled)) return prev;
  const state = structuredClone(prev);
  resolver(state, state.inbox.find((m) => m.id === msgId), optionId);
  return state;
}
