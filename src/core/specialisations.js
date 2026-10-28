// Specialisations (PLAN-CORE-LOOP.md, slice 5b): doing a role with the stats for it brings an
// offer from Joss; the player takes it or says "not yet". One per person. Pure logic.
//
// op.spec          { id, day } once they've taken one
// op.track.overwatch { rifle: n, drone: n }  jobs on overwatch with each kit (hidden progress)
// op.specSnooze    day before which Joss won't ask again
// What a specialisation does on overwatch is applied in core/gear.js overwatchKit.

import { SPECIALISATIONS, SNOOZE_DAYS } from '../data/specialisations.js';
import { isFreelancer } from './freelance.js';

export { SPECIALISATIONS };

/** Their specialisation's entry ({ id, ...data }), or null. */
export const specOf = (op) => (op?.spec && SPECIALISATIONS[op.spec.id] ? { id: op.spec.id, ...SPECIALISATIONS[op.spec.id] } : null);

/** A job done on overwatch with this kit. Mutates op. */
export function noteOverwatchJob(op, kit) {
  op.track ??= {};
  op.track.overwatch ??= {};
  op.track.overwatch[kit] = (op.track.overwatch[kit] ?? 0) + 1;
}

/** The specialisations they've earned an offer for: base stats and jobs both. */
export function eligible(op) {
  if (op.spec || isFreelancer(op)) return [];
  return Object.entries(SPECIALISATIONS)
    .filter(([, s]) => Object.entries(s.needs).every(([stat, n]) => (op.stats[stat] ?? 0) >= n) && (op.track?.overwatch?.[s.kit] ?? 0) >= s.jobs)
    .map(([id]) => id);
}

const openOffer = (state, op) => state.inbox.some((m) => m.kind === 'spec' && !m.resolved && m.payload.opId === op.id);

/** Post Joss's offer for anyone newly eligible. Mutates state. Returns the people offered. */
export function checkSpecialisations(state) {
  const offered = [];
  for (const op of state.crew) {
    if ((op.specSnooze ?? 0) > state.day || openOffer(state, op)) continue;
    const ids = eligible(op);
    if (!ids.length) continue;
    const names = ids.map((id) => SPECIALISATIONS[id].name);
    state.inbox.unshift({
      id: `spec-${op.id}-${state.day}`, type: 'crew', day: state.day,
      subject: `${op.handle} could train as ${names.length > 1 ? `a ${names.join(' or a ')}` : `a ${names[0]}`}`,
      body: ids.map((id) => SPECIALISATIONS[id].offer.replaceAll('{op}', op.handle)).join(' '),
      kind: 'spec',
      options: [...ids.map((id) => ({ id, label: `Train as a ${SPECIALISATIONS[id].name}` })), { id: 'later', label: 'Not yet' }],
      payload: { opId: op.id, ids, outcome: null },
      blocking: false, resolved: false, read: false,
    });
    offered.push(op);
  }
  return offered;
}

/** Resolver for kind 'spec' (registered in decisions.js). Mutates state and msg. */
export function SPEC_RESOLVER(state, msg, optionId) {
  const p = msg.payload;
  const op = state.crew.find((o) => o.id === p.opId);
  if (!op || op.spec) { msg.resolved = true; return; } // gone, or already decided: nothing left to do
  if (optionId === 'later') {
    op.specSnooze = state.day + SNOOZE_DAYS;
    p.outcome = `Not yet. Joss will bring it up again in ${SNOOZE_DAYS / 7} weeks.`;
  } else if (p.ids.includes(optionId)) {
    const s = SPECIALISATIONS[optionId];
    op.spec = { id: optionId, day: state.day };
    op.history.push(`Day ${state.day}: trained as a ${s.name}`);
    p.outcome = `${op.handle} is a ${s.name} now. ${s.desc}`;
  } else return;
  msg.resolved = true;
}
