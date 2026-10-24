// Crew helpers: availability, effective stats, role lookup. Pure logic.

import { TRAITS } from '../data/traits.js';

export const APPROACHES = {
  stealth: { name: 'Stealth', desc: '+1 stealth and tech, -1 combat', mods: { stealth: 1, tech: 1, combat: -1 }, heat: 0 },
  loud: { name: 'Loud', desc: '+1 combat, +1 heat on completion', mods: { combat: 1 }, heat: 1 },
  social: { name: 'Social', desc: '+1 social, -1 stealth', mods: { social: 1, stealth: -1 }, heat: 0 },
};

export const INJURY_DAYS = { light: 3, serious: 14, critical: 21 };
const INJURY_ORDER = ['healthy', 'light', 'serious', 'critical', 'dead'];

export const isAway = (state, op) => (op.condition.awayUntil ?? 0) > state.day;

/** Can this operative take a job today? Returns { ok, reason }. */
export function availability(state, op) {
  const c = op.condition;
  if (c.injury === 'serious' || c.injury === 'critical') return { ok: false, reason: `${c.injury} injury, ${c.injuryDays}d` };
  if (isAway(state, op)) return { ok: false, reason: `away until day ${c.awayUntil}` };
  if (c.fatigue > 85) return { ok: false, reason: 'exhausted' };
  if (op.traits.includes('superstitious') && state.day % 10 === 4) return { ok: false, reason: 'unlucky day (ends in 4)' };
  return { ok: true, reason: c.fatigue > 60 ? 'fatigued' : c.injury === 'light' ? 'light injury' : 'ready' };
}

/** Flat stat bonuses from traits, e.g. Chromed { tech: 2 }, Hothead { combat: 2, cool: -2 }. */
export function traitMods(op) {
  const mods = {};
  for (const t of op.traits ?? []) {
    for (const [stat, v] of Object.entries(TRAITS[t]?.effects ?? {})) {
      if (typeof v === 'number' && v !== 0 && stat in (op.stats ?? {})) mods[stat] = (mods[stat] ?? 0) + v;
    }
  }
  return mods;
}

/** Stat with trait bonuses, as shown on the stats panel (1-20). */
export const ratedStat = (op, stat) => Math.max(1, Math.min(20, (op.stats[stat] ?? 0) + (traitMods(op)[stat] ?? 0)));

/** Stat after traits, approach, fatigue and injury. Returns { value, notes }. */
export function effectiveStat(op, stat, { approach, crew = [] } = {}) {
  let value = op.stats[stat] ?? 0;
  const notes = [];
  // Traits can't push a stat past the 1-20 scale; situational effects below can.
  value = Math.max(1, Math.min(20, value + (traitMods(op)[stat] ?? 0)));
  if (stat === 'cool' && crew.some((o) => o.id !== op.id && o.traits.includes('veteran'))) value += 1;
  const am = APPROACHES[approach]?.mods?.[stat];
  if (am) value += am;
  if (op.condition.fatigue > 60) { value -= 2; notes.push('fatigued'); }
  if (op.condition.injury === 'light') { value -= 2; notes.push('hurt'); }
  return { value, notes };
}

// Crew size (see DESIGN.md): a job has a recommended size and room for a few extras.
export const MAX_EXTRA_CREW = 2;
export const SHORT_HANDED_PENALTY = 1; // per missing person, on every roll
export const BACKUP_RANGE = 3; // a second person this close to the best backs them up
export const BACKUP_BONUS = 1;
export const maxCrew = (recommended) => recommended + MAX_EXTRA_CREW;

/**
 * The roll a crew makes on a stat. The best person rolls (or `lead`, e.g. the
 * medic stabilising); +1 if someone else is within 3 of them; -1 per person
 * short of the recommended size. Real rolls and the risk read both use this.
 * Returns { op, value, notes, backup, missing } or null if nobody can roll.
 */
export function crewRoll(crew, stat, { approach, recommended = 0, lead } = {}) {
  const able = crew.filter((o) => o.condition.injury !== 'critical');
  const top = lead ?? bestFor(able, stat, { approach });
  if (!top) return null;
  let value = top.value;
  const notes = [...top.notes];
  let backup = null;
  for (const o of able) {
    if (o.id === top.op.id) continue;
    const v = effectiveStat(o, stat, { approach, crew }).value;
    if (v >= top.value - BACKUP_RANGE && (!backup || v > backup.value)) backup = { op: o, value: v };
  }
  if (backup) { value += BACKUP_BONUS; notes.push(`${backup.op.handle} backs up +${BACKUP_BONUS}`); }
  const missing = Math.max(0, recommended - able.length);
  if (missing) { value -= missing * SHORT_HANDED_PENALTY; notes.push(`short-handed -${missing * SHORT_HANDED_PENALTY}`); }
  return { op: top.op, value, notes, backup: backup?.op ?? null, missing };
}

/** Best operative on the given crew for a stat (skipping anyone critical). */
export function bestFor(crew, stat, ctx) {
  let best = null;
  for (const op of crew) {
    if (op.condition.injury === 'critical') continue;
    const s = effectiveStat(op, stat, { ...ctx, crew });
    if (!best || s.value > best.value) best = { op, ...s };
  }
  return best;
}

export const findRole = (crew, role) => crew.find((op) => op.role === role && op.condition.injury !== 'critical');

/** One step worse injury: new = the worse of the two, stepping up if equal. */
export function worsenInjury(current, incoming) {
  if (incoming === 'none') return current;
  const a = INJURY_ORDER.indexOf(current);
  const b = INJURY_ORDER.indexOf(incoming);
  if (a === 0) return incoming;
  return INJURY_ORDER[Math.min(3, Math.max(a, b) + (a === b ? 1 : 0))];
}

export function setInjury(op, injury) {
  op.condition.injury = injury;
  op.condition.injuryDays = INJURY_DAYS[injury] ?? 0;
}
