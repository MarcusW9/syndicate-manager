// Tong tuning (DESIGN.md 2026-11-04): a player who runs every crew they can. Each day but Sunday
// they send hands-off crews (stealth, Steady, never call) to the best-paying jobs their free people
// can cover, hire while cash allows and the safehouse has room, and expand the safehouse when it's
// full and they can afford it. Prints, at weeks 13, 26 and 52: median cash, the share broke, the
// median roster and reputation, jobs done a week (median over the run so far) and deaths.
// Compares the board growing with the roster (the default) against the old fixed board.
//
//   node scripts/sim-tong.mjs [seeds=40] [config name prefix]   (about 18 s a seed per config)
import { createNewGame } from '../src/core/state.js';
import { autoFounders } from '../tests/play.js';
import { hire, canHire, nextExpansion, expandSafehouse, STARTING_ROSTER_CAP } from '../src/core/recruits.js';
import { primaryStat } from '../src/core/development.js';
import { advanceDay, calendar } from '../src/core/time.js';
import { templateById, jobView, ARRIVALS } from '../src/core/jobs.js';
import { availability } from '../src/core/crew.js';
import { sendOff } from '../src/core/autorun.js';

const SEEDS = Number(process.argv[2] ?? 40);
const median = (a) => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)];

const SNAP = [13, 26, 52];

/** One 52-week run, snapshotted at each week in SNAP. */
function play(seed) {
  const snaps = {};
  let s = createNewGame({ seed, startCrew: 'pick' });
  if (s.founding) s = autoFounders(s);
  let jobs = 0;
  for (let day = 0; day < 52 * 7; day++) {
    if (calendar(s.day).weekday !== 'Sun') {
      const offers = [...s.jobs].sort((a, b) => jobView(s, b).pay - jobView(s, a).pay);
      for (const job of offers) {
        const free = s.crew.filter((op) => availability(s, op).ok);
        const tpl = templateById(job.templateId);
        if (free.length < tpl.crewSize) continue;
        const crew = [...free].sort((a, b) => (a.role === 'medic' ? -1 : 0) - (b.role === 'medic' ? -1 : 0)).slice(0, tpl.crewSize);
        const next = sendOff(s, job.id, crew.map((o) => o.id), 'stealth', 'steady', { callIn: 'never' });
        if (next !== s) { s = next; jobs++; }
      }
    }
    const lead = [...(s.recruits ?? [])].filter((r) => canHire(s, r).ok).sort((a, b) => b.stats[primaryStat(b)] - a.stats[primaryStat(a)])[0];
    const wages = s.crew.reduce((n, o) => n + o.wage, 0);
    if (lead && s.cash - (wages + lead.wage + s.rent) * 2 > 0) s = hire(s, lead.id);
    const x = nextExpansion(s); // null once the home hall has every part: nothing left to take
    if (s.crew.length >= (s.rosterCap ?? STARTING_ROSTER_CAP) && x && s.cash > x.cost + (wages + s.rent) * 3) s = expandSafehouse(s);
    s = advanceDay(s);
    const wk = (day + 1) / 7;
    if (SNAP.includes(wk)) snaps[wk] = { s, jobs };
  }
  return snaps;
}

const CONFIGS = {
  'fixed board (before)': () => Object.assign(ARRIVALS, { over: 5, per: Infinity, routine: 0 }),
  'one more per 2 past 3': () => Object.assign(ARRIVALS, { over: 3, per: 2, routine: 0 }),
  'one more per 1.5 past 3': () => Object.assign(ARRIVALS, { over: 3, per: 1.5, routine: 0 }),
  'chosen, extra offers 75% routine': () => Object.assign(ARRIVALS, { over: 5, per: 2.5, routine: 0.75 }),
};
const only = process.argv[3];
for (const [name, set] of Object.entries(CONFIGS).filter(([n]) => !only || n.startsWith(only))) {
  set();
  const row = {};
  const all = Array.from({ length: SEEDS }, (_, i) => play(i + 1));
  for (const weeks of SNAP) {
    const runs = all.map((r) => r[weeks]);
    const cash = runs.map((r) => r.s.cash);
    row[`wk${weeks}`] = {
      cash: median(cash),
      broke: `${Math.round((cash.filter((c) => c < 0).length / runs.length) * 100)}%`,
      roster: median(runs.map((r) => r.s.crew.length)),
      rep: median(runs.map((r) => r.s.reputation)),
      jobsWk: Math.round(median(runs.map((r) => r.jobs / weeks)) * 10) / 10,
      deaths: runs.reduce((n, r) => n + r.s.memorial.length, 0),
    };
  }
  console.log(name, JSON.stringify(row));
}
