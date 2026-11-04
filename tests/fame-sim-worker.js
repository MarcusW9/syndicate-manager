// Worker for tests/fame-sim.test.js: plays its share of the seeds and posts what each run reached.
// (A 78-week run takes about 14 seconds; four workers keep the test to a few minutes.)
import { parentPort, workerData } from 'node:worker_threads';
import { playWeeks, carefulPolicy } from './play.js';

const weekOf = (day) => Math.ceil(day / 7);
const dayIn = (line, what) => { const m = line.match(new RegExp(`^Day (\\d+): ${what}`)); return m ? +m[1] : null; };

const out = [];
for (const seed of workerData.seeds) {
  let at52 = null;
  const onDay = (s) => { if (s.day === 52 * 7 + 1) at52 = { cash: s.cash, wages: s.crew.reduce((n, o) => n + o.wage, 0) }; };
  const { state, deaths } = playWeeks(workerData.weeks, seed, carefulPolicy, { startCrew: 'fresh', hireAbove: 10000, onDay });
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
    cash52: at52?.cash ?? null, wages52: at52?.wages ?? null,
    // Renown slice 4. playWeeks never answers pay-rise messages, so fame asks are counted, with the
    // weekly cost they'd add if accepted; named offers are counted, and those that paid the bonus.
    namedOffers: state.inbox.filter((m) => m.id.startsWith('named-')).length,
    namedPaid: state.inbox.filter((m) => m.type === 'report' && m.timeline?.outcome?.some((o) => / by name: /.test(o.text))).length,
    fameAsks: state.inbox.filter((m) => m.kind === 'renewal' && m.payload?.reason === 'fame').length,
    fameAskExtra: state.inbox.filter((m) => m.kind === 'renewal' && m.payload?.reason === 'fame').reduce((n, m) => n + m.payload.ask - m.payload.current, 0),
    hiredVeterans: state.crew.filter((o) => o.history.some((h) => /joined/i.test(h)) && o.tier === 'veteran' && !o.history.some((h) => h.includes('became a veteran'))).length,
  });
}
parentPort.postMessage(out);
