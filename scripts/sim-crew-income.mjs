// Does income scale with crew size? (owner's question, 2026-11-21). Holds the crew at a fixed size
// (extra people generated and added free, cash topped up so nobody goes broke), lets a careful
// player run every job the free crew can staff each day, and reports per week: gross pay, wages
// plus rent, net, jobs done, idle crew (free at day's end) and open offers left on the board.
// Weeks 1-4, 5-12 and 13-26 are shown apart, as income depends on reputation gates.
//
//   node scripts/sim-crew-income.mjs [seeds=20] [sizes=3,5,7,10,14]
import { createNewGame } from '../src/core/state.js';
import { generateRecruit, recruitToOperative } from '../src/core/recruits.js';
import * as M from '../src/core/mission.js';
import { advanceDay, calendar, weeklyBill } from '../src/core/time.js';
import { templateById } from '../src/core/jobs.js';
import { availability } from '../src/core/crew.js';
import { autoFounders, playMission, carefulPolicy } from '../tests/play.js';

const SEEDS = Number(process.argv[2] ?? 20);
const SIZES = (process.argv[3] ?? '3,5,7,10,14').split(',').map(Number);
const median = (a) => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)] ?? 0;
const WEEKS = 26;

function run(size, seed) {
  let s = createNewGame({ seed, startCrew: 'pick' });
  if (s.founding) s = autoFounders(s);
  s.rosterCap = 99;
  while (s.crew.length < size) {
    const r = generateRecruit(s, { quality: 'pro' });
    s.crew.push(recruitToOperative(r, { condition: structuredClone(s.crew[0].condition), history: [] }));
  }
  s.cash = 1e6;
  const weeks = Array.from({ length: WEEKS }, () => ({ gross: 0, jobs: 0, idle: 0, open: 0, bill: 0 }));
  for (let day = 0; day < WEEKS * 7; day++) {
    const w = weeks[Math.floor(day / 7)];
    for (let guard = 0; guard < 10 && calendar(s.day).weekday !== 'Sun'; guard++) {
      const free = s.crew.filter((op) => availability(s, op).ok);
      const job = [...s.jobs].sort((a, b) => templateById(b.templateId).pay - templateById(a.templateId).pay)
        .find((j) => templateById(j.templateId).crewSize <= free.length);
      if (!job) break;
      const tpl = templateById(job.templateId);
      const crew = [...free].sort((a, b) => (a.role === 'medic' ? -1 : 0) - (b.role === 'medic' ? -1 : 0)).slice(0, tpl.crewSize);
      const before = s.cash;
      s = M.startMission(s, job.id, crew.map((o) => o.id), 'stealth');
      const r = playMission(s, carefulPolicy);
      s = M.closeMission(r.state);
      w.gross += s.cash - before;
      w.jobs++;
    }
    w.idle += s.crew.filter((op) => availability(s, op).ok).length;
    w.open += s.jobs.length;
    if (calendar(s.day).weekday === 'Sun') w.bill = weeklyBill(s).total;
    s = advanceDay(s);
    s.cash = Math.max(s.cash, 1e6 - 1e5); // keep everyone solvent; income is read from mission pay only
    if (s.cash > 1e6) s.cash = 1e6;
  }
  return { weeks, crew: s.crew.length, rep: s.reputation };
}

for (const size of SIZES) {
  const runs = Array.from({ length: SEEDS }, (_, i) => run(size, i + 1));
  const band = (a, b) => {
    const ws = runs.flatMap((r) => r.weeks.slice(a, b));
    const m = (k) => Math.round(median(ws.map((w) => w[k])));
    const gross = m('gross'), bill = m('bill');
    return `gross ¥${gross} · bill ¥${bill} · net ¥${gross - bill} · jobs ${m('jobs')} · idle/day ${(median(ws.map((w) => w.idle)) / 7).toFixed(1)} · open ${(median(ws.map((w) => w.open)) / 7).toFixed(1)}`;
  };
  console.log(`crew ${size} (rep wk26 ${median(runs.map((r) => r.rep))})`);
  console.log(`  wk1-4   ${band(0, 4)}`);
  console.log(`  wk5-12  ${band(4, 12)}`);
  console.log(`  wk13-26 ${band(12, 26)}`);
}
