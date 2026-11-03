// Fights by district (command fights, step 3): loud runs hands-off with a grown crew (every stat +4,
// as in sim-battles.mjs), one job per district, with fight spots on the map (data/battle.js spotsIn)
// and without (everyone in half cover, the fight before spots). Prints fights won, pulled back from,
// and the crew's and guards' average cover where they stand. Spots shouldn't swing a district far.
//
//   node scripts/sim-districts.mjs [seeds=300]
import { createNewGame } from '../src/core/state.js';
import * as M from '../src/core/mission.js';
import { addOffer, templateById } from '../src/core/jobs.js';
import { autoRun } from '../src/core/autorun.js';
import { BATTLE } from '../src/data/battle.js';
import { arm } from '../tests/play.js';

const SEEDS = Number(process.argv[2] ?? 300);
const JOBS = { docks: 'warehouse', oldTown: 'kidnap', nightMarket: 'casino', heights: 'data_pull', basin: 'wrong_horse' };
const STEP = { open: 0, half: 2, full: 4 };
const pct = (n, d) => (d ? `${Math.round((n / d) * 100)}%` : '-');
const all = [...BATTLE.spotsIn];

function run(job) {
  const t = { fights: 0, won: 0, pulled: 0, crew: 0, guards: 0 };
  for (let seed = 1; seed <= SEEDS; seed++) {
    let s = createNewGame({ seed, startCrew: 'fresh' });
    for (const op of s.crew) for (const k of Object.keys(op.stats)) op.stats[k] = Math.min(20, op.stats[k] + 4);
    s.jobs = [];
    addOffer(s, job);
    const size = templateById(job).crewSize;
    for (const op of s.crew.slice(0, size)) arm(s, op.id, 'pistol', 'vest');
    s = M.startMission(s, s.jobs[0].id, s.crew.slice(0, size).map((o) => o.id), 'loud');
    for (const e of autoRun(s, 'steady').activeMission.events.filter((x) => x.kind === 'battle')) {
      if (e.phase === 'start') {
        t.fights++;
        t.crew += e.runners.reduce((n, r) => n + STEP[r.cover], 0) / e.runners.length;
        t.guards += e.guards.reduce((n, g) => n + STEP[g.cover], 0) / e.guards.length;
      }
      if (e.phase === 'end' && e.how === 'won') t.won++;
      if (e.phase === 'retreat') t.pulled++;
    }
  }
  return `fights ${t.fights}, won ${pct(t.won, t.fights)}, pulled back ${pct(t.pulled, t.fights)}, cover crew ${(t.crew / t.fights).toFixed(1)} guards ${(t.guards / t.fights).toFixed(1)}`;
}

console.log(`${SEEDS} loud runs a row, grown crew in a sidearm and a vest, steady orders.`);
for (const [district, job] of Object.entries(JOBS)) {
  BATTLE.spotsIn.splice(0, BATTLE.spotsIn.length);
  const off = run(job);
  BATTLE.spotsIn.push(district);
  const on = run(job);
  BATTLE.spotsIn.splice(0, BATTLE.spotsIn.length, ...all);
  console.log(`${district} (${job}, threat ${templateById(job).threat})\n  no spots: ${off}\n  spots:    ${on}`);
}
