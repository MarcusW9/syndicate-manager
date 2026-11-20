// The runner's abilities in one list (drafts/PROPOSAL-runner-shaping.md, step 1, 2026-11-18). A read only: it changes nothing and
// rolls nothing. It gathers what today lives in four places (born traits, earned traits, a specialisation, a build's move and
// payload) and, for what is earned by stats, how far the runner is from each gate. The screen that shows it is not built yet.
//
// Earned traits arrive as a story and their progress stays hidden (HANDOFF.md, agreed rules), so they appear only once held.
// A specialisation also needs jobs on overwatch with its kit; that count is hidden progress too, so only the stat gate is read.
import { TRAITS } from '../data/traits.js';
import { EARNED_TRAITS } from '../data/earnedTraits.js';
import { SPECIALISATIONS } from '../data/specialisations.js';
import { MOVES, PAYLOADS } from '../data/builds.js';

/** Base stats short of a gate: [{ stat, need, have }], empty when met. Base stats only, before gear and traits, as the offers read them. */
export function missingFor(op, needs = {}) {
  return Object.entries(needs)
    .map(([stat, need]) => ({ stat, need, have: op?.stats?.[stat] ?? 0 }))
    .filter((m) => m.have < m.need);
}

/**
 * Everything a runner holds, and what is gated by stats: { held, reachable }.
 *   held       [{ kind: 'born'|'earned'|'spec'|'move'|'payload', id, name, desc }]
 *   reachable  [{ kind: 'spec'|'move'|'payload', id, name, desc, needs, missing }] for open places only: a specialisation while
 *              they have none, a piece while that slot is empty. `missing` is empty when the stats are met.
 */
export function abilitiesOf(op) {
  const held = [];
  for (const id of op?.traits ?? []) if (TRAITS[id]) held.push({ kind: 'born', id, name: TRAITS[id].name, desc: TRAITS[id].desc });
  for (const e of op?.earned ?? []) if (EARNED_TRAITS[e.id]) held.push({ kind: 'earned', id: e.id, name: EARNED_TRAITS[e.id].name, desc: EARNED_TRAITS[e.id].desc });
  const spec = op?.spec && SPECIALISATIONS[op.spec.id];
  if (spec) held.push({ kind: 'spec', id: op.spec.id, name: spec.name, desc: spec.desc });
  const build = op?.build ?? {};
  const pieces = { move: MOVES, payload: PAYLOADS };
  for (const slot of ['move', 'payload']) {
    const p = pieces[slot][build[slot]];
    if (p) held.push({ kind: slot, id: p.id, name: p.name, desc: p.desc });
  }

  const reachable = [];
  const gate = (kind, id, def) => reachable.push({ kind, id, name: def.name, desc: def.desc, needs: { ...(def.needs ?? {}) }, missing: missingFor(op, def.needs) });
  if (!spec) for (const [id, def] of Object.entries(SPECIALISATIONS)) gate('spec', id, def);
  for (const slot of ['move', 'payload']) {
    if (pieces[slot][build[slot]]) continue;
    for (const [id, def] of Object.entries(pieces[slot])) if (!def.draft) gate(slot, id, def); // a draft piece (part B) is not reachable yet
  }
  return { held, reachable };
}

const STATE_ORDER = { held: 0, ready: 1, locked: 2 };

/**
 * The skills menu (2026-11-19): every move, payload and specialisation in the game, whether the runner holds it or not, for the list
 * on their page. A read only, like abilitiesOf.
 *   held   [{ slot, id }] what they hold now: slot 'move', 'payload' or 'spec', id or null.
 *   items  [{ slot, id, name, desc, needs, missing, state, full }] held first, then ready, then locked (a stable order inside each).
 *          state 'held' (theirs), 'ready' (their stats meet the gate and the place is open: Joss can offer it), 'locked' (a stat short,
 *          or `full`: the place is taken, and a move, payload or specialisation, once learned, is not replaced).
 * A draft piece (part B) is left out, as in abilitiesOf. A specialisation's jobs-on-overwatch count is hidden progress, so only its stat gate is read.
 */
export function skillMenu(op) {
  const build = op?.build ?? {};
  const have = { move: build.move ?? null, payload: build.payload ?? null, spec: op?.spec?.id ?? null };
  const sources = { move: MOVES, payload: PAYLOADS, spec: SPECIALISATIONS };
  const items = [];
  for (const slot of ['move', 'payload', 'spec']) {
    for (const [id, def] of Object.entries(sources[slot])) {
      if (def.draft) continue;
      const needs = { ...(def.needs ?? {}) };
      const missing = missingFor(op, needs);
      const held = have[slot] === id;
      const full = !held && have[slot] !== null;
      items.push({ slot, id, name: def.name, desc: def.desc, needs, missing, full, state: held ? 'held' : !full && !missing.length ? 'ready' : 'locked' });
    }
  }
  items.sort((a, b) => STATE_ORDER[a.state] - STATE_ORDER[b.state]);
  return { held: ['move', 'payload', 'spec'].map((slot) => ({ slot, id: have[slot] })), items };
}
