// Planning a squad (PLAN-CORE-LOOP.md, slice 2): the coverage read and Joss's picks.
// Pure: both use the same rules the run does (core/incidents.js handlerFor and bestSave, the
// shared crew rule), so the read on the board is the risk the crew actually meets.

import { ZONE_POOLS, OFF_APPROACH } from '../data/incidents.js';
import { incidentById, incidentDifficulty, handlerFor, bestSave, OVERWATCH_KIT } from './incidents.js';
import { crewRoll, effectiveStat, APPROACHES } from './crew.js';
import { successChance, riskLabel, rollTarget } from './risk.js';

const ZONE_NOTE = { in: 'The way in', inside: 'Inside', target: 'The target' };
const RISK_ORDER = ['low', 'moderate', 'high', 'extreme'];
export const worstRisk = (levels) => levels.reduce((a, b) => (RISK_ORDER.indexOf(b) > RISK_ORDER.indexOf(a) ? b : a), 'low');

/** Every incident this approach can meet, zone by zone, once each: [{ id, zone, sometimes }]. */
export function likelyIncidents(approach) {
  const rows = [];
  for (const zone of ['in', 'inside', 'target']) {
    for (const id of ZONE_POOLS[zone][approach] ?? []) if (!rows.some((r) => r.id === id)) rows.push({ id, zone, sometimes: false });
  }
  if (approach !== 'loud' && !rows.some((r) => r.id === OFF_APPROACH.incident)) rows.push({ id: OFF_APPROACH.incident, zone: 'inside', sometimes: true });
  return rows;
}

/**
 * The coverage read: for each likely incident, who would handle it, their odds, and (for danger)
 * the odds once the best save is counted. crew: the inside team (operatives). overwatch: { op, kit }.
 * Returns { rows, spotted, toughest }.
 */
export function coverage(template, crew, approach, { threat = template.threat, overwatch = null, intel = null } = {}) {
  const am = { threat, alert: 0 };
  const ow = overwatch?.op ? { kit: overwatch.kit, left: OVERWATCH_KIT[overwatch.kit].uses } : null;
  const rows = likelyIncidents(approach).map(({ id, zone, sometimes }) => {
    const inc = incidentById(id);
    const diff = incidentDifficulty(template, am, inc);
    const base = { id, name: inc.name, zone, where: sometimes ? 'Sometimes, inside' : ZONE_NOTE[zone], danger: !!inc.danger, diff };
    const h = crew.length ? handlerFor(crew, inc, diff, { approach, recommended: template.crewSize, intel }) : null;
    if (!h) return { ...base, handler: null, chance: 0, risk: 'extreme', withSave: null, effective: 'extreme', gap: true };
    const save = inc.danger ? bestSave({ victim: h.roll.op, able: crew, overwatch: ow, overwatchOp: overwatch?.op ?? null, zone, diff }) : null;
    const eff = save ? h.chance + (1 - h.chance) * save.chance : h.chance;
    return {
      ...base,
      handler: { op: h.roll.op, stat: h.stat, value: h.roll.value, notes: h.roll.notes },
      chance: h.chance, risk: riskLabel(h.chance),
      withSave: save ? { via: save.via, op: save.op, chance: save.chance } : null,
      effective: riskLabel(eff), gap: riskLabel(eff) === 'extreme',
    };
  });
  const spotted = APPROACHES[approach]?.detect && crew.length > template.crewSize ? crew.length - template.crewSize : 0;
  return { rows, spotted, toughest: worstRisk(rows.map((r) => r.effective)) };
}

/** How well a squad covers a job: the mean effective odds over the likely incidents and the job's key stats. */
function squadScore(template, crew, approach, overwatch, threat) {
  if (!crew.length) return 0;
  const { rows } = coverage(template, crew, approach, { threat, overwatch });
  const odds = rows.map((r) => (r.handler ? r.chance + (r.withSave ? (1 - r.chance) * r.withSave.chance : 0) : 0));
  const target = rollTarget({ ...template, threat });
  for (const stat of template.keyStats) {
    const roll = crewRoll(crew, stat, { approach, recommended: template.crewSize });
    odds.push(roll ? successChance(roll.value, target) : 0);
  }
  return odds.reduce((a, b) => a + b, 0) / odds.length;
}

/**
 * Joss's picks: an inside team of the recommended size and an overwatch, chosen one at a time
 * for the best coverage, from the operatives given (free crew; freelancers cost a cut, so Joss
 * leaves them to you). Overwatch only if it helps; Wheels if the job can need driving and they'd
 * out-drive the team; standby from whoever's left. Returns { crew, overwatch, kit, wheels, standby }.
 */
export function jossPicks(template, candidates, approach, { threat = template.threat } = {}) {
  const team = [];
  const pool = [...candidates];
  while (team.length < template.crewSize && pool.length) {
    let best = null;
    for (const op of pool) {
      const s = squadScore(template, [...team, op], approach, null, threat);
      if (!best || s > best.s) best = { op, s };
    }
    team.push(best.op);
    pool.splice(pool.indexOf(best.op), 1);
  }
  const without = squadScore(template, team, approach, null, threat);
  let over = null;
  for (const kit of Object.keys(OVERWATCH_KIT)) {
    for (const op of pool) {
      const s = squadScore(template, team, approach, { op, kit }, threat);
      if (s > without + 0.005 && (!over || s > over.s)) over = { op, kit, s };
    }
  }
  if (over) pool.splice(pool.indexOf(over.op), 1);
  // Wheels: the best driver left, on jobs where driving can come up and they'd beat the team at it.
  const drives = template.crises?.some((c) => c.choices.some((ch) => ch.stat === 'driving'));
  const teamDriving = Math.max(0, ...team.map((o) => effectiveStat(o, 'driving', { approach }).value));
  const driver = drives ? [...pool].sort((a, b) => b.stats.driving - a.stats.driving)[0] : null;
  const wheels = driver && effectiveStat(driver, 'driving', { approach }).value > teamDriving ? driver : null;
  if (wheels) pool.splice(pool.indexOf(wheels), 1);
  // Standby: whoever left would be most use coming in at a bad moment (a fighter, then a medic).
  const standby = [...pool].sort((a, b) => (b.stats.combat + b.stats.medical / 2) - (a.stats.combat + a.stats.medical / 2))[0] ?? null;
  return { crew: team.map((o) => o.id), overwatch: over?.op.id ?? null, kit: over?.kit ?? null, wheels: wheels?.id ?? null, standby: standby?.id ?? null };
}

/** The line a dossier card shows: the stat this person brings to this approach. */
export function bestLine(op, approach) {
  const lean = Object.keys(APPROACHES[approach]?.mods ?? {});
  const stats = [...new Set([...lean, 'combat', 'tech', 'stealth', 'social'])];
  const best = stats.map((k) => ({ k, v: effectiveStat(op, k, { approach }).value })).sort((a, b) => b.v - a.v)[0];
  return { stat: best.k, value: best.v };
}
