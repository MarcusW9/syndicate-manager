// Milestones (renown slice 2): the moments a runner's record crosses a line. Pure logic.
//
// After a job (core/mission.js finish), each person who took part may earn one milestone, and the
// job at most two. Several ready at once go in priority order (data/milestones.js rank); the rest
// stay ready and arrive on later jobs. A bond counts for both people but only once against the cap.
// The best three become a runner's highlights.

import { MILESTONES, MILESTONES_PER_JOB, HIGHLIGHTS_KEPT } from '../data/milestones.js';
import { isFreelancer } from './freelance.js';
import { ensureRecord } from './record.js';
import { TATTOO_JOBS } from './marks.js';

const byId = Object.fromEntries(MILESTONES.map((m) => [m.id, m]));
export const milestoneById = (id) => byId[id.split(':')[0]] ?? null;

const have = (r, id) => (r.milestones ??= []).includes(id);

/** What a record has reached and not yet been given: [{ def, id, partner? }]. */
function ready(r) {
  const out = [];
  for (const def of MILESTONES) {
    if (def.field === 'with') {
      for (const [partner, n] of Object.entries(r.with ?? {})) if (n >= def.at && !have(r, `${def.id}:${partner}`)) out.push({ def, id: `${def.id}:${partner}`, partner });
    } else if ((r[def.field] ?? 0) >= def.at && !have(r, def.id)) out.push({ def, id: def.id });
  }
  return out;
}

const fill = (text, vars) => text.replace(/\{(\w+)\}/g, (m, k) => vars[k] ?? m);

/** Keep the heaviest few: a new one replaces the lightest only if it is heavier. */
export function addHighlight(r, h) {
  const list = (r.highlights ??= []);
  if (list.length < HIGHLIGHTS_KEPT) list.push(h);
  else {
    const lowest = list.reduce((a, b) => (b.weight < a.weight ? b : a));
    if (h.weight > lowest.weight) list[list.indexOf(lowest)] = h;
  }
  list.sort((a, b) => b.weight - a.weight || b.day - a.day);
}

/**
 * Award this job's milestones to the people who came home. Returns the report lines
 * [{ opId, opIds, id, text }] (opIds: everyone it was given to; a bond names both). Mutates the (cloned) state. Call after recordJob and the crew's mark.
 */
export function checkMilestones(state, people) {
  const ops = people.filter((o) => !isFreelancer(o) && o.record);
  const nameOf = (id) => state.crew.find((o) => o.id === id)?.handle ?? state.memorial.find((m) => m.id === id)?.handle ?? null;
  const cands = [];
  ops.forEach((op, order) => {
    const r = ensureRecord(op);
    const gotMark = (op.marks ?? []).some((m) => m.kind === 'tattoo' && m.day === state.day);
    for (const c of ready(r)) {
      if (c.partner && !nameOf(c.partner)) continue; // a bond with someone no longer on the books
      if (c.id === 'jobs10' && gotMark) { r.milestones.push(c.id); continue; } // the crew's mark already marks it
      cands.push({ op, order, ...c });
    }
  });
  cands.sort((a, b) => a.def.rank - b.def.rank || a.def.at - b.def.at || a.order - b.order);

  const used = new Set(), lines = [];
  for (const c of cands) {
    if (lines.length >= MILESTONES_PER_JOB) break;
    const partnerOp = c.partner ? ops.find((o) => o.id === c.partner) : null;
    if (used.has(c.op.id) || (partnerOp && used.has(partnerOp.id))) continue;
    if (c.partner && !partnerOp) continue; // bonds are awarded when both are on the same job
    const text = fill(c.def.text, { op: c.op.handle, other: c.partner ? nameOf(c.partner) : '', n: c.def.at });
    for (const [who, other] of partnerOp ? [[c.op, partnerOp], [partnerOp, c.op]] : [[c.op, null]]) {
      const r = who.record;
      r.milestones.push(other ? `${c.def.id}:${other.id}` : c.id);
      who.history.push(`Day ${state.day}: ${text}`);
      addHighlight(r, { id: c.id, day: state.day, text, weight: c.def.weight });
      used.add(who.id);
    }
    lines.push({ opId: c.op.id, opIds: partnerOp ? [c.op.id, partnerOp.id] : [c.op.id], id: c.id, text });
  }
  return lines;
}

/** Save v31: record everything already reached as earned, so old crews don't get a flood of milestones. */
export function seedMilestones(op) {
  const r = op.record;
  if (!r) return;
  if (r.milestones) { r.highlights = r.highlights ?? []; return; }
  r.milestones = [];
  r.milestones = ready(r).map((c) => c.id);
  r.highlights = [];
}
