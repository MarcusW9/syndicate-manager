// Incidents: the small automatic moments of a run, and the rules around them (PLAN-CORE-LOOP.md).
// Pure logic: these functions plan, choose and price; core/mission.js applies the results to the
// cloned state, so growth, reports and earned traits stay in one place.
//
// Rules that must hold (tests/incidents.test.js): an incident never kills and never makes anyone
// critical (a serious injury at worst); every decision it raises has an exit; every modifier it
// uses shows in the roll's notes, the same numbers the planning read uses.

import { INCIDENTS, ZONES, ZONE_POOLS, OFF_APPROACH, ALERT_MAX } from '../data/incidents.js';
import { crewRoll, effectiveStat } from './crew.js';
import { successChance, rollTarget } from './risk.js';

export { ZONES, ALERT_MAX };
export const incidentById = (id) => INCIDENTS[id] ?? null;

// The safehouse's shared kit for overwatch until gear exists (DESIGN.md, 2026-10-27).
// uses: shots or drone actions a job. sees: which zones it can help in.
export const OVERWATCH_KIT = {
  rifle: { name: 'Rifle', stat: 'combat', uses: 2, heat: 1, neural: 0, indoors: false, desc: 'Sees the open ground, not inside. Every shot is heat +1.' },
  drone: { name: 'Drone', stat: 'tech', uses: 3, heat: 0, neural: 10, indoors: true, desc: 'Sees everywhere. Every action is neural load +10 for the pilot.' },
};

// A serious injury from an unsaved danger incident: this chance, plus more as the alert rises.
export const SERIOUS_CHANCE = 0.25;
export const SERIOUS_PER_ALERT = 0.15;
export const PATCH_MIN_MEDICAL = 7; // a teammate needs this much medical to try patching a serious wound

/** The incidents a job will meet, zone by zone: [{ zone, ids }]. More inside on threat 3+ work. */
export function planIncidents(rng, approach, threat) {
  const draw = (zone) => { const pool = ZONE_POOLS[zone][approach] ?? ZONE_POOLS[zone].stealth; return pool[Math.floor(rng() * pool.length)]; };
  const inside = Array.from({ length: threat >= 3 ? 2 : 1 }, () => draw('inside'));
  if (approach !== 'loud' && rng() < OFF_APPROACH.chance) inside[inside.length - 1] = OFF_APPROACH.incident;
  return [{ zone: 'in', ids: [draw('in')] }, { zone: 'inside', ids: inside }, { zone: 'target', ids: [draw('target')] }];
}

/**
 * Weave zone markers and incidents into a job's queue of beats and crises: the way in after the
 * first beat, inside after the middle beat, the target (and the way out) before the last beat.
 */
export function weaveIncidents(queue, plan) {
  const beats = queue.map((q, i) => (q.type === 'beat' ? i : -1)).filter((i) => i >= 0);
  const at = { in: beats[0] + 1, inside: beats[Math.floor(beats.length / 2)] + 1, target: beats.at(-1) };
  const steps = (zone) => [{ type: 'zone', zone }, ...plan.find((p) => p.zone === zone).ids.map((id) => ({ type: 'incident', id, zone }))];
  const out = [...queue];
  // Insert from the back so earlier positions stay put.
  out.splice(at.target, 0, ...steps('target'), { type: 'zone', zone: 'out' });
  out.splice(at.inside, 0, ...steps('inside'));
  out.splice(at.in, 0, ...steps('in'));
  return out;
}

/** An incident's difficulty on this job: the job's typical roll, the incident's own step, and the alert. */
export function incidentDifficulty(tpl, am, inc) {
  return Math.round(rollTarget({ threat: am.threat ?? tpl.threat, rookie: tpl.rookie })) + (inc.diff ?? 0) + (am.alert ?? 0);
}

/**
 * Who handles an incident: whoever on the inside team has the best odds with any stat it allows,
 * by the shared crew rule (backup, short-handed, extra bodies, traits, intel). Returns
 * { roll: { op, value, notes }, stat, chance } or null if nobody can.
 */
export function handlerFor(able, inc, diff, rollCtx) {
  let best = null;
  for (const stat of inc.stats) {
    const roll = crewRoll(able, stat, rollCtx);
    if (!roll) continue;
    const chance = successChance(roll.value, diff);
    if (!best || chance > best.chance) best = { roll, stat, chance };
  }
  return best;
}

/**
 * The best save for someone in trouble: overwatch (if it can see this zone and has a use left),
 * or the best fighter on the inside team. Overwatch rolls at one easier than the incident; a
 * teammate at the incident's own difficulty. Returns { via, op, stat, value, notes, need, chance } or null.
 */
export function bestSave({ victim, able, overwatch, overwatchOp, zone, diff }) {
  const options = [];
  const kit = overwatch ? OVERWATCH_KIT[overwatch.kit] : null;
  if (kit && overwatchOp && overwatch.left > 0 && (kit.indoors || ZONES[zone]?.open)) {
    const s = effectiveStat(overwatchOp, kit.stat);
    const d = diff - 1;
    options.push({ via: 'overwatch', kit: overwatch.kit, op: overwatchOp, stat: kit.stat, value: s.value, notes: [`${kit.name.toLowerCase()} from overwatch`, ...s.notes], need: 10 + d, chance: successChance(s.value, d) });
  }
  for (const op of able) {
    if (op.id === victim.id) continue;
    const s = effectiveStat(op, 'combat');
    options.push({ via: 'inside', op, stat: 'combat', value: s.value, notes: s.notes, need: 10 + diff, chance: successChance(s.value, diff) });
  }
  options.sort((a, b) => b.chance - a.chance);
  return options[0] ?? null;
}

/**
 * The decision options a run can stop for. Every list has an exit (`exit: true`) that brings
 * everyone home. standby: the operative waiting at the van, if they haven't been called yet
 * (slice 3): at max alert they can join the inside team (the alert stays up); for someone badly
 * hurt they can go in, get them out and take their place.
 */
export function decisionChoices(pending, { patient = null, standby = null } = {}) {
  if (pending.kind === 'alert') {
    return [
      ...(standby ? [{ id: 'standby', label: `Call ${standby.handle} in from standby`, cost: 'They join the team: one more to back up rolls and pull someone out of trouble. The alert stays up.' }] : []),
      { id: 'loud', label: 'Go loud and finish it fast', cost: 'Heat +2. What\'s left becomes a fight.' },
      { id: 'out', label: 'Pull out', cost: 'Everyone comes home. No pay.', exit: true },
    ];
  }
  return [
    ...(standby ? [{ id: 'rescue', label: `Send ${standby.handle} in to get ${patient?.handle ?? 'them'} out`, cost: `${standby.handle} takes their place on the team.` }] : []),
    { id: 'keep', label: `Keep going without ${patient?.handle ?? 'them'}`, cost: 'They sit the rest out; the others carry on.' },
    { id: 'out', label: 'Pull everyone out', cost: 'Everyone comes home. No pay.', exit: true },
  ];
}

/**
 * What standing orders do at a decision when the crew doesn't call you (core/autorun.js ORDERS).
 * Steady and Committed crews use standby when they have one; Cautious crews pull out (owner, 2026-10-27).
 */
export function ordersDecision(kind, ordersId, { standby = false } = {}) {
  const cautious = ordersId === 'cautious';
  if (kind === 'alert') {
    if (standby && !cautious) return { id: 'standby', why: 'They were blown, so they called standby in from the van.' };
    return ordersId === 'committed' ? { id: 'loud', why: 'Committed orders: they went loud to finish it.' } : { id: 'out', why: 'They were blown, and the orders said not to force it.' };
  }
  if (cautious) return { id: 'out', why: 'Cautious orders: someone badly hurt means everyone goes home.' };
  return standby ? { id: 'rescue', why: 'They sent standby in to get their wounded out.' } : { id: 'keep', why: 'They got their wounded somewhere safe and carried on.' };
}

/**
 * Standby's own save, once they've joined the inside team: a second try when the first save
 * missed or nobody could make one (slice 3, option B). Combat at the incident's difficulty.
 */
export function standbySave({ standbyOp, victim, first, diff }) {
  if (!standbyOp || standbyOp.id === victim.id || first?.op.id === standbyOp.id) return null;
  const s = effectiveStat(standbyOp, 'combat');
  return { via: 'standby', op: standbyOp, stat: 'combat', value: s.value, notes: ['standby', ...s.notes], need: 10 + diff, chance: successChance(s.value, diff) };
}
