// Builds, slice 3-ii-a (data/builds.js; drafts/HANDOFF-builds-3iia.md). The small pure reads around a runner's build. The rules that
// play it (the burst, the infection, the tick) are in core/fight.js; nothing here draws.
import { MOVES, PAYLOADS, GIVEN_BUILD, BUILD_OFFER } from '../data/builds.js';
import { isFreelancer } from './freelance.js';
import { ENEMIES } from '../data/fights.js';
import { hashRng } from './rng.js';

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

// --- earning by offer (slice 3-ii-b, 2026-11-17; docs/design/2026-11.md) -------------------------------------------------------------------
// op.build { move, payload }  what they carry: a slot each, empty until taken (core/fight.js runnerOf reads it)
// op.buildAt                  their jobsWithCrew when they last took a piece (null before the first)
// op.buildSnooze              the day before which Joss won't ask again after a "not yet"
// Modelled on core/specialisations.js: a Joss message with options, a resolver (decisions.js), a check after each job and each day.
const PIECES = { ...MOVES, ...PAYLOADS }; // a `draft` piece (data/builds.js, part B) is never offered
/** A piece by id ({ id, name, desc, slot, ... }), or null. */
export const pieceById = (id) => PIECES[id] ?? null;

/** What a runner carries, for the screens: [{ slot, id, name, desc }] (move first). */
export function buildPieces(op) {
  const b = op?.build ?? {};
  return ['move', 'payload'].filter((slot) => PIECES[b[slot]]).map((slot) => ({ slot, id: b[slot], name: PIECES[b[slot]].name, desc: PIECES[b[slot]].desc }));
}

/** The pieces Joss could offer them now: an empty slot, and the base stats for it. Not about timing (offerDue). */
export function eligiblePieces(op) {
  const held = op.build ?? {};
  return Object.values(PIECES).filter((p) => !p.draft && !PIECES[held[p.slot]] && Object.entries(p.needs ?? {}).every(([stat, n]) => (op.stats?.[stat] ?? 0) >= n));
}

/** Is it time to ask them? Enough jobs together (the first offer, then a gap after each piece taken) and not snoozed. */
export function offerDue(op, day) {
  if (isFreelancer(op) || (op.buildSnooze ?? 0) > day) return false;
  const jobs = op.jobsWithCrew ?? 0;
  return jobs >= (op.buildAt == null ? BUILD_OFFER.firstAtJobs : op.buildAt + BUILD_OFFER.everyJobs);
}

const openOffer = (state, op) => state.inbox.some((m) => m.kind === 'build' && !m.resolved && m.payload.opId === op.id);

/** The pieces an offer shows: all they qualify for when that is `size` or fewer; otherwise `size` of them picked on a stream seeded by the runner
 * and the day (the same answer every time it is asked, never the run's own stream), kept in the library's order. Since the four part-B pieces
 * joined (2026-11-19), there are more pieces than an offer shows. */
export function offerPick(list, op, day) {
  if (list.length <= BUILD_OFFER.size) return list;
  const rng = hashRng('buildOffer', op.id, day);
  const keyed = list.map((p) => ({ p, k: rng() }));
  const chosen = new Set([...keyed].sort((a, b) => a.k - b.k).slice(0, BUILD_OFFER.size).map((x) => x.p));
  return list.filter((p) => chosen.has(p));
}

/** Post Joss's offer for anyone due one with a piece to offer. Mutates state. Returns the people offered. */
export function checkBuildOffers(state) {
  const offered = [];
  for (const op of state.crew) {
    if (!offerDue(op, state.day) || openOffer(state, op)) continue;
    const pieces = offerPick(eligiblePieces(op), op, state.day);
    if (!pieces.length) continue;
    state.inbox.unshift({
      id: `build-${op.id}-${state.day}`, type: 'crew', day: state.day,
      subject: pieces.length > 1 ? `${op.handle} could learn a new trick` : `${op.handle} could pick up the ${pieces[0].name}`,
      body: pieces.map((p) => p.offer.replaceAll('{op}', op.handle)).join(' '),
      kind: 'build',
      options: [...pieces.map((p) => ({ id: p.id, label: `Take the ${p.name}` })), { id: 'later', label: 'Not yet' }],
      payload: { opId: op.id, ids: pieces.map((p) => p.id), outcome: null },
      blocking: false, resolved: false, read: false,
    });
    offered.push(op);
  }
  return offered;
}

/** Resolver for kind 'build' (registered in decisions.js). Mutates state and msg. */
export function BUILD_RESOLVER(state, msg, optionId) {
  const p = msg.payload;
  const op = state.crew.find((o) => o.id === p.opId);
  if (!op) { msg.resolved = true; return; } // gone: nothing left to do
  if (optionId === 'later') {
    op.buildSnooze = state.day + BUILD_OFFER.snoozeDays;
    p.outcome = `Not yet. Joss will bring it up again in ${BUILD_OFFER.snoozeDays / 7} weeks.`;
  } else if (p.ids.includes(optionId) && PIECES[optionId] && !PIECES[op.build?.[PIECES[optionId].slot]]) {
    const piece = PIECES[optionId];
    op.build = { move: null, payload: null, ...op.build, [piece.slot]: optionId };
    op.buildAt = op.jobsWithCrew ?? 0;
    op.history.push(`Day ${state.day}: took the ${piece.name}`);
    p.outcome = `${op.handle} carries the ${piece.name} now. ${piece.desc}`;
  } else return;
  msg.resolved = true;
}
