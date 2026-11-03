// Worker for tests/fame-sim.test.js: plays its share of the seeds and posts what each run reached.
// (A 78-week run takes about 14 seconds; four workers keep the test to a few minutes.)
import { parentPort, workerData } from 'node:worker_threads';
import { playWeeks, carefulPolicy } from './play.js';

const weekOf = (day) => Math.ceil(day / 7);
const dayIn = (line, what) => { const m = line.match(new RegExp(`^Day (\\d+): ${what}`)); return m ? +m[1] : null; };

const out = [];
for (const seed of workerData.seeds) {
  const { state, deaths } = playWeeks(workerData.weeks, seed, carefulPolicy, { startCrew: 'fresh', hireAbove: 10000 });
  const firsts = (what) => state.crew.flatMap((op) => op.history.map((h) => dayIn(h, what)).filter((d) => d != null));
  const eliteDays = firsts('Elite \\(');
  const vetDays = firsts('became a veteran');
  out.push({
    seed, deaths,
    firstElite: eliteDays.length ? weekOf(Math.min(...eliteDays)) : null,
    elitesAtEnd: state.crew.filter((o) => o.fame === 'elite').length,
    elitesBy52: state.crew.filter((o) => o.history.some((h) => { const d = dayIn(h, 'Elite \\('); return d != null && d <= 52 * 7; })).length,
    lapses: state.crew.reduce((n, o) => n + o.history.filter((h) => h.includes('lost Elite')).length, 0),
    firstVeteran: vetDays.length ? weekOf(Math.min(...vetDays)) : null,
    veterans: state.crew.filter((o) => o.tier === 'veteran').length,
    cash: state.cash,
  });
}
parentPort.postMessage(out);
