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
