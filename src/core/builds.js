// Builds, slice 3-ii-a (data/builds.js; drafts/HANDOFF-builds-3iia.md). The small pure reads around a runner's build. The rules that
// play it (the burst, the infection, the tick) are in core/fight.js; nothing here draws.
import { MOVES, PAYLOADS, GIVEN_BUILD } from '../data/builds.js';
import { ENEMIES } from '../data/fights.js';

/** A runner's build as the fight reads it: { move, payload } with real ids, or null for no build. Unknown ids are dropped. */
export function buildOf(op) {
  const b = op?.build;
  if (!b) return null;
  const move = MOVES[b.move] ? b.move : null;
  const payload = PAYLOADS[b.payload] ? b.payload : null;
  return move || payload ? { move, payload } : null;
}

/** Does a body of this kind shrug the payload off (a tag the payload lists as immune)? */
export const immuneTo = (kind, payloadId) => (PAYLOADS[payloadId]?.immune ?? []).some((t) => (ENEMIES[kind]?.foeTags ?? []).includes(t));

/**
 * A crew with the given build (data/builds.js GIVEN_BUILD) on its best combat runner: the one the planning read already sends to
 * shoot (highest combat, ties the lowest seat). Returns a copy; the crew passed in is untouched. For the sims and the tests only.
 */
export function withBuild(crew, build = GIVEN_BUILD) {
  if (!crew.length) return crew;
  let star = 0;
  crew.forEach((op, i) => { if ((op.stats?.combat ?? 0) > (crew[star].stats?.combat ?? 0)) star = i; });
  return crew.map((op, i) => (i === star ? { ...op, build: { ...build } } : op));
}
