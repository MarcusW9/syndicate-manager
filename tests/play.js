// Shared helpers for tests: an automated "player" that plays missions and weeks.

import { createNewGame } from '../src/core/state.js';
import * as M from '../src/core/mission.js';
import { advanceDay, calendar } from '../src/core/time.js';
import { templateById } from '../src/core/jobs.js';
import { availability } from '../src/core/crew.js';

/** Play the active mission to the end. policy decides each choice. Returns { state, pushed }. */
export function playMission(state, policy) {
  let s = state;
  let pushed = false;
  for (let guard = 0; guard < 60 && !s.activeMission.done; guard++) {
    const am = s.activeMission;
    if (am.critical) {
      const options = M.describeCritical(s).choices.filter((c) => c.available).map((c) => c.id);
      const pick = policy.critical(options, guard);
      if (pick === 'push') pushed = true;
      s = M.resolveCritical(s, pick);
    } else if (M.currentStep(am)?.type === 'beat') {
      s = M.revealBeat(s);
    } else {
      const choices = M.describeCrisis(s).choices.filter((c) => c.available);
      s = M.chooseOption(s, policy.crisis(choices, guard).id);
    }
  }
  if (!s.activeMission.done) throw new Error('Mission got stuck');
  return { state: s, pushed };
}

export const randomPolicy = (seed) => ({
  critical: (opts, g) => opts[(seed + g) % opts.length],
  crisis: (choices, g) => {
    if (seed % 5 === 0) return choices.find((c) => c.kind === 'abort') ?? choices[0];
    const go = choices.filter((c) => c.kind !== 'abort');
    return go.length ? go[(seed + g) % go.length] : choices[0];
  },
});

/** A sensible player: picks the lowest-risk non-abort option, extracts on critical. */
const RANK = { certain: 0, low: 1, moderate: 2, high: 3, extreme: 4 };
export const carefulPolicy = {
  critical: (opts) => (opts.includes('stabilise') ? 'stabilise' : 'extract'),
  crisis: (choices) => {
    const go = choices.filter((c) => c.kind !== 'abort').sort((a, b) => (RANK[a.risk] ?? 9) - (RANK[b.risk] ?? 9));
    return go[0] && (RANK[go[0].risk] ?? 9) <= 2 ? go[0] : choices.find((c) => c.kind === 'abort');
  },
};

/** Play whole weeks: each Monday take the best-paying job the available crew can staff. */
export function playWeeks(weeks, seed, policy = carefulPolicy, { startCrew = 'classic' } = {}) {
  let s = createNewGame({ seed, startCrew });
  let deaths = 0;
  for (let day = 0; day < weeks * 7; day++) {
    const free = s.crew.filter((op) => availability(s, op).ok);
    const jobs = [...s.jobs].sort((a, b) => templateById(b.templateId).pay - templateById(a.templateId).pay);
    const job = jobs.find((j) => templateById(j.templateId).crewSize <= free.length);
    if (job && calendar(s.day).weekday !== 'Sun') {
      const tpl = templateById(job.templateId);
      const crew = [...free].sort((a, b) => (a.role === 'medic' ? -1 : 0) - (b.role === 'medic' ? -1 : 0)).slice(0, tpl.crewSize);
      s = M.startMission(s, job.id, crew.map((o) => o.id), 'stealth');
      const r = playMission(s, policy);
      deaths += r.state.activeMission.result.deaths.length;
      s = M.closeMission(r.state);
    }
    s = advanceDay(s);
  }
  return { state: s, deaths };
}
