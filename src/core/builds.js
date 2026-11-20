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

// --- the pieces a runner carries ------------------------------------------------------------------------------------------------------
// op.build { move, payload }  what they carry: a slot each, empty until learned (core/fight.js runnerOf reads it)
// Learned at a level-up since 2026-11-20 (core/levelup.js); Joss's offers (slice 3-ii-b, 2026-11-17) are gone, and with them
// op.buildAt and op.buildSnooze (save v83).
const PIECES = { ...MOVES, ...PAYLOADS }; // a `draft` piece (data/builds.js, part B) is never learnable
/** A piece by id ({ id, name, desc, slot, ... }), or null. */
export const pieceById = (id) => PIECES[id] ?? null;

/** What a runner carries, for the screens: [{ slot, id, name, desc }] (move first). */
export function buildPieces(op) {
  const b = op?.build ?? {};
  return ['move', 'payload'].filter((slot) => PIECES[b[slot]]).map((slot) => ({ slot, id: b[slot], name: PIECES[b[slot]].name, desc: PIECES[b[slot]].desc }));
}

/** The pieces they could learn now: an empty slot, and the base stats for it. Not about timing (core/levelup.js). */
export function eligiblePieces(op) {
  const held = op.build ?? {};
  return Object.values(PIECES).filter((p) => !p.draft && !PIECES[held[p.slot]] && Object.entries(p.needs ?? {}).every(([stat, n]) => (op.stats?.[stat] ?? 0) >= n));
}
