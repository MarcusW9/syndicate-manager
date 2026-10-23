// Development simulation helper: a rookie joins and works regular jobs.
import { createNewGame } from '../src/core/state.js';
import * as M from '../src/core/mission.js';
import { advanceDay, calendar } from '../src/core/time.js';
import { templateById } from '../src/core/jobs.js';
import { availability } from '../src/core/crew.js';
import { prepareOperative, STATS } from '../src/core/development.js';
import { playMission, carefulPolicy } from './play.js';

const ROLE_PRIMARY = { muscle: 'combat', driver: 'driving', tech: 'tech', face: 'social', medic: 'medical', infiltrator: 'stealth' };

/** A rookie with main stat `start` and ceiling `ceiling`. */
export function makeRookie({ role = 'infiltrator', age = 20, start = 11, ceiling = 17 } = {}) {
  const main = ROLE_PRIMARY[role];
  const stats = Object.fromEntries(STATS.map((s) => [s, 7]));
  stats[main] = start;
  const potential = Object.fromEntries(STATS.map((s) => [s, 9]));
  potential[main] = ceiling;
  return prepareOperative({
    id: 'rookie', name: 'Test Rookie', handle: 'Kid', age, role, tier: 'rookie', stats, potential,
    traits: [], wage: 450, condition: { fatigue: 0, morale: 60, neuralLoad: 0, burnout: 0, injury: 'healthy', injuryDays: 0 },
    trust: {}, history: [], bio: '', origin: '',
  });
}

/** Run `jobs` jobs with the rookie on the crew (mentor: keep Teo, the veteran, on the job too). */
export function developRookie(seed, rookieOpts, { jobs = 22, mentor = true } = {}) {
  let s = createNewGame({ seed });
  s.cash = 1e7; // money isn't under test here
  s.crew.push(makeRookie(rookieOpts));
  const main = ROLE_PRIMARY[rookieOpts?.role ?? 'infiltrator'];
  let done = 0;
  for (let day = 0; day < 800 && done < jobs; day++) {
    const rookie = s.crew.find((o) => o.id === 'rookie');
    if (!rookie) break;
    const free = s.crew.filter((op) => availability(s, op).ok && (mentor || op.id !== 'teo'));
    if (free.some((o) => o.id === 'rookie') && (!mentor || free.some((o) => o.id === 'teo')) && calendar(s.day).weekday !== 'Sun') {
      const job = s.jobs.find((j) => templateById(j.templateId).crewSize <= free.length);
      if (job) {
        const tpl = templateById(job.templateId);
        const lead = ['rookie', ...(mentor ? ['teo'] : [])];
        const rest = free.filter((o) => !lead.includes(o.id)).sort((a, b) => (a.role === 'medic' ? -1 : 0) - (b.role === 'medic' ? -1 : 0));
        const crew = [...lead, ...rest.map((o) => o.id)].slice(0, tpl.crewSize);
        s = M.startMission(s, job.id, crew, 'stealth');
        s = M.closeMission(playMission(s, carefulPolicy).state);
        done += 1;
      }
    }
    s = advanceDay(s);
  }
  const rookie = s.crew.find((o) => o.id === 'rookie');
  return { jobs: done, main: rookie?.stats[main], rookie, days: s.day };
}
