// Do expeditions grow people too fast? (owner, 2026-11-26: trips raised to 8 experience a day.) The same rookie
// (tests/develop-sim.js makeRookie: main 11, ceiling 18, Teo the veteran alongside as a mentor) gets the same number
// of days either working main jobs (developRookie, the growth targets' own runs) or going on expeditions back to back
// (the weapon hunt, whose days roll stealth, the infiltrator's main, a quarter of the time). Prints, per path: the
// main stat after those days, stat points gained in all, and the day the rookie turned pro (main 15).
//
//   node scripts/sim-trip-growth.mjs [seeds=12] [rates=1,8]
import { createNewGame } from '../src/core/state.js';
import { advanceDay } from '../src/core/time.js';
import { resolveDecision } from '../src/core/decisions.js';
import { sendExpedition, expeditionsOut } from '../src/core/expeditions.js';
import { EXPEDITION } from '../src/data/expeditions.js';
import { HEISTS } from '../src/data/heists.js';
import { developRookie, makeRookie } from '../tests/develop-sim.js';

const seeds = Number(process.argv[2] ?? 12);
const rates = (process.argv[3] ?? '1,8').split(',').map(Number);
const median = (a) => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)];
const sum = (stats) => Object.values(stats).reduce((n, v) => n + v, 0);
const START = sum(makeRookie({ ceiling: 18 }).stats);

/** Back-to-back expeditions for `days` days with the rookie and Teo; the rookie's main, points gained and day turned pro. */
function tripRookie(seed, days) {
  let s = createNewGame({ seed });
  s.cash = 1e7;
  s.heists = Object.fromEntries(HEISTS.map((h) => [h.id, { status: 'missed', steps: {} }]));
  s.crew.push(makeRookie({ ceiling: 18 }));
  const start = s.day;
  let pro = null;
  let trips = 0;
  while (s.day - start < days) {
    const rookie = s.crew.find((o) => o.id === 'rookie');
    if (!rookie) break;
    const ids = ['rookie', 'teo'].filter((id) => s.crew.some((o) => o.id === id));
    s = sendExpedition(s, { goal: 'weapon', district: 'docks', crewIds: ids });
    if (expeditionsOut(s).length) trips++;
    for (let i = 0; i < 9 && expeditionsOut(s).length; i++) {
      s = advanceDay(s);
      for (let m = s.inbox.find((x) => x.kind === 'expedition' && !x.resolved); m; m = s.inbox.find((x) => x.kind === 'expedition' && !x.resolved)) s = resolveDecision(s, m.id, 'give');
      if (pro == null && (s.crew.find((o) => o.id === 'rookie')?.tier ?? 'rookie') !== 'rookie') pro = s.day - start;
    }
    if (!expeditionsOut(s).length) s = advanceDay(s); // a day home between trips (rest, or someone was hurt)
  }
  const rookie = s.crew.find((o) => o.id === 'rookie');
  return { main: rookie?.stats.stealth, gained: rookie ? sum(rookie.stats) - START : 0, pro, trips };
}

// Jobs first: the days a 22-job and a 60-job stretch take, then the same days on trips.
for (const jobs of [22, 60]) {
  const J = Array.from({ length: seeds }, (_, i) => developRookie(i + 1, { ceiling: 18 }, { jobs }));
  const days = median(J.map((j) => j.days));
  console.log(`\n${jobs} main jobs took a median ${days} days.`);
  console.log(`  jobs:              main ${median(J.map((j) => j.main))}, points gained ${median(J.map((j) => sum(j.rookie.stats) - START))}, past rookie by then ${J.filter((j) => j.rookie && j.rookie.tier !== 'rookie').length}/${J.length}`);
  for (const rate of rates) {
    EXPEDITION.xpPerDay = rate;
    const T = Array.from({ length: seeds }, (_, i) => tripRookie(i + 1, days));
    const pros = T.filter((t) => t.pro != null);
    console.log(`  trips at ${String(rate).padEnd(2)} a day: main ${median(T.map((t) => t.main))}, points gained ${median(T.map((t) => t.gained))}, past rookie by then ${pros.length}/${T.length}${pros.length ? ` (median day ${median(pros.map((t) => t.pro))})` : ''}, ${median(T.map((t) => t.trips))} trips`);
  }
}
