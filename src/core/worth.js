// What a runner is worth keeping back, and what a job gives them (2026-11-05, after the Phase 1
// playtest: "I mostly sent whoever was best"). Pure. Two uses:
// - crewValue orders runners for Joss's lean picks (core/squad.js): Joss suggests the least valuable
//   crew that keeps the same risk, so stars stay free for work that needs them.
// - jobGain is the few words the picker sheet shows next to a candidate: what this job does for
//   them, read from the game's own rules (growth, graduation, promotion, standing, mentoring).
//   Only real effects, never estimates.

import { TIER_LEVEL, levelOf } from './record.js';
import { GRADUATE_AT, VETERAN_AT, mentorsOf, primaryStat } from './development.js';
import { fameOf } from './fame.js';

const FAME_RANK = { unknown: 0, known: 1, respected: 2, elite: 3, legend: 4 };

/** Higher is more valuable to keep back: capability first, then fame, then the main stat. */
export function crewValue(op) {
  return (TIER_LEVEL[op.tier] ?? 1) * 100 + (FAME_RANK[fameOf(op)] ?? 0) * 20 + (op.stats?.[primaryStat(op)] ?? 0);
}

/**
 * What a job at this threat does for this runner, in a few words, with these crewmates (the others
 * already picked). Returns { text, tone: 'good'|'flat' } or null when there's nothing worth saying.
 */
export function jobGain(op, threat, crew = []) {
  if (op.freelance) return null;
  if (threat < levelOf(op)) return { text: 'below their level: little to gain', tone: 'flat' };
  const main = primaryStat(op);
  const value = op.stats?.[main] ?? 0;
  if (op.tier === 'rookie') {
    const mentor = mentorsOf(op, crew)[0];
    if (mentor) return { text: `learns faster beside ${mentor.handle}`, tone: 'good' };
    const gap = GRADUATE_AT - value;
    if (gap > 0 && gap <= 2) return { text: `${gap === 1 ? '1 point' : '2 points'} from pro`, tone: 'good' };
    return { text: 'learns on the job', tone: 'good' };
  }
  if (op.tier === 'pro' && value >= VETERAN_AT.main) {
    const left = VETERAN_AT.jobs - (op.jobsWithCrew ?? 0);
    if (left > 0 && left <= 5) return { text: `${left} ${left === 1 ? 'job' : 'jobs'} from veteran`, tone: 'good' };
  }
  return { text: 'counts towards their standing', tone: 'good' };
}
