// Heat simulation for tests and tuning: a player taking N jobs a week with a set approach mix.

import { createNewGame } from '../src/core/state.js';
import * as M from '../src/core/mission.js';
import { advanceDay, calendar } from '../src/core/time.js';
import { templateById } from '../src/core/jobs.js';
import { availability } from '../src/core/crew.js';
import { resolveDecision } from '../src/core/decisions.js';
import { playMission, carefulPolicy, randomPolicy } from './play.js';

const MIX = ['stealth', 'loud', 'con'];

/**
 * Play `weeks` weeks taking up to `perWeek` jobs a week (Mon-Sat, best-paying job the free crew can staff).
 * approach: 'mix' rotates stealth/loud/con, or a fixed approach id.
 * onNotice: option id picked on a heat notice ('ride' by default, so the sim never spends cash on heat).
 * Returns { state, heatByWeek (after each Sunday), daily (heat each morning), peak (highest heat seen), notices, jobs }.
 */
export function playHeat(weeks, seed, { perWeek = 2, approach = 'mix', onNotice = 'ride', policy = carefulPolicy } = {}) {
  let s = createNewGame({ seed });
  const heatByWeek = [];
  let notices = 0;
  let jobs = 0;
  let thisWeek = 0;
  let peak = 0;
  const daily = [];
  for (let day = 0; day < weeks * 7; day++) {
    const c = calendar(s.day);
    if (c.isMonday) thisWeek = 0;
    const free = s.crew.filter((op) => availability(s, op).ok);
    const board = [...s.jobs].sort((a, b) => templateById(b.templateId).pay - templateById(a.templateId).pay);
    const job = board.find((j) => templateById(j.templateId).crewSize <= free.length);
    if (job && thisWeek < perWeek && c.weekday !== 'Sun') {
      const tpl = templateById(job.templateId);
      const crew = [...free].sort((a, b) => (a.role === 'medic' ? -1 : 0) - (b.role === 'medic' ? -1 : 0)).slice(0, tpl.crewSize);
      const ap = approach === 'mix' ? MIX[jobs % MIX.length] : approach;
      s = M.startMission(s, job.id, crew.map((o) => o.id), ap);
      s = M.closeMission(playMission(s, policy === 'random' ? randomPolicy(seed + jobs) : policy).state);
      jobs += 1;
      thisWeek += 1;
    }
    peak = Math.max(peak, s.heat);
    daily.push(s.heat);
    s = advanceDay(s);
    for (const m of s.inbox.filter((x) => x.kind === 'heat' && !x.resolved)) {
      notices += 1;
      const pick = m.options.find((o) => o.id === onNotice && !o.disabled) ? onNotice : 'ride';
      s = resolveDecision(s, m.id, pick);
    }
    if (calendar(s.day).isSunday) heatByWeek.push(s.heat);
  }
  return { state: s, heatByWeek, daily, peak, notices, jobs };
}

export const median = (xs) => { const a = [...xs].sort((x, y) => x - y); return a[Math.floor(a.length / 2)]; };
