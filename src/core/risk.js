// Honest risk reads, shown as labels with a short reason (no percentages).
// Roll rule: success if d20 + stat >= 10 + difficulty.

import { crewRoll } from './crew.js';

export function successChance(stat, difficulty) {
  const need = 10 + difficulty - stat; // minimum d20 roll
  return Math.min(0.95, Math.max(0.05, (21 - need) / 20));
}

export function riskLabel(chance) {
  if (chance >= 0.75) return 'low';
  if (chance >= 0.5) return 'moderate';
  if (chance >= 0.3) return 'high';
  return 'extreme';
}

/** Typical roll difficulty at a threat level, used by the planning read. */
export const STAT_FOR_THREAT = (threat) => 6 + threat * 2.5;

/** Overall read for a planned job. Returns { level, reasons[] }. */
export function assessJob(template, crew, approach) {
  if (!crew.length) return { level: 'extreme', reasons: ['No crew selected'] };
  const reasons = [];
  const target = STAT_FOR_THREAT(template.threat);
  let worst = 1;
  for (const stat of template.keyStats) {
    const best = crewRoll(crew, stat, { approach, recommended: template.crewSize });
    const chance = successChance(best.value, target);
    worst = Math.min(worst, chance);
    if (chance < 0.5) {
      reasons.push(`Weak on ${stat}: best is ${best.op.handle} (${best.value}${best.notes.length ? ', ' + best.notes.join(', ') : ''})`);
    }
  }
  for (const op of crew) {
    if (op.condition.fatigue > 60) reasons.push(`${op.handle} is fatigued`);
    if (op.condition.injury === 'light') reasons.push(`${op.handle} is carrying an injury`);
  }
  if (!crew.some((o) => o.role === 'medic') && template.threat >= 3) reasons.push('No medic: nobody can stabilise a critical wound');
  // Short-handed is already in every roll above (same rule as the real thing), not a separate fudge.
  const missing = template.crewSize - crew.length;
  if (missing > 0) reasons.unshift(`Short-handed: ${crew.length} of ${template.crewSize}, -${missing} on every roll`);
  if (missing < 0) reasons.push(`${-missing} extra on the crew: more backup, more people away and at risk`);
  const level = riskLabel(worst);
  if (!reasons.length) reasons.push('Crew matches the job well');
  return { level, reasons: reasons.slice(0, 4) };
}
