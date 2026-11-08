// The Legend defining job over 78 weeks (renown slice 5 balance, 2026-11-08; the proposal's
// section 7 bands): the careful player of tests/play.js playWeeks (stealth, highest pay first, hires
// below five) who also answers the city's call: when a defining job is on the board and its runner
// is free, it goes first and the runner goes on it. Prints, per seed, the week of the first Legend,
// how many were made, the tries it took and the Legends living at the end. Nothing is changed.
//
//   node scripts/sim-legend.mjs <fromSeed> <toSeed>     (about 14 s a seed; run ranges in parallel)
import { createNewGame } from '../src/core/state.js';
import * as M from '../src/core/mission.js';
import { advanceDay, calendar } from '../src/core/time.js';
import { templateById } from '../src/core/jobs.js';
import { availability } from '../src/core/crew.js';
import { hire, canHire } from '../src/core/recruits.js';
import { primaryStat } from '../src/core/development.js';
import { playMission, carefulPolicy, autoFounders } from '../tests/play.js';

const [from, to] = [Number(process.argv[2] ?? 1), Number(process.argv[3] ?? 4)];
const WEEKS = 78;
const weekOf = (day) => Math.ceil(day / 7);

function play(seed) {
  let s = createNewGame({ seed, startCrew: 'fresh' });
  if (s.founding) s = autoFounders(s);
  let firstLegend = null, called = null, deaths = 0;
  for (let day = 0; day < WEEKS * 7; day++) {
    const free = s.crew.filter((op) => availability(s, op).ok);
    const defining = s.jobs.find((j) => j.defining && free.some((o) => o.id === j.defining));
    const jobs = defining ? [defining] : [...s.jobs].sort((a, b) => templateById(b.templateId).pay - templateById(a.templateId).pay);
    const job = jobs.find((j) => templateById(j.templateId).crewSize <= free.length);
    if (job && calendar(s.day).weekday !== 'Sun') {
      const tpl = templateById(job.templateId);
      const star = job.defining ? free.find((o) => o.id === job.defining) : null;
      const rest = free.filter((o) => o !== star).sort((a, b) => (a.role === 'medic' ? -1 : 0) - (b.role === 'medic' ? -1 : 0));
      const crew = [...(star ? [star] : []), ...rest].slice(0, tpl.crewSize);
      s = M.startMission(s, job.id, crew.map((o) => o.id), 'stealth');
      const r = playMission(s, carefulPolicy);
      deaths += r.state.activeMission.result.deaths.length;
      s = M.closeMission(r.state);
    }
    const lead = [...(s.recruits ?? [])].filter((r) => canHire(s, r).ok).sort((a, b) => b.stats[primaryStat(b)] - a.stats[primaryStat(a)])[0];
    if (lead && s.crew.length < 5 && s.cash - lead.wage * 5 > 10000) s = hire(s, lead.id);
    s = advanceDay(s);
    if (called == null && s.crew.some((o) => o.legendCall)) called = weekOf(s.day);
    if (firstLegend == null && (s.crew.some((o) => o.legend) || s.memorial.some((m) => m.legend))) firstLegend = weekOf(s.day);
  }
  return {
    seed, called, firstLegend,
    legends: s.crew.filter((o) => o.legend).length + s.memorial.filter((m) => m.legend).length,
    living: s.crew.filter((o) => o.legend).length,
    posthumous: s.memorial.filter((m) => m.legend).length,
    tries: s.crew.reduce((n, o) => n + (o.legendCall?.tries ?? 0), 0),
    deaths,
  };
}
for (let seed = from; seed <= to; seed++) console.log(JSON.stringify(play(seed)));
