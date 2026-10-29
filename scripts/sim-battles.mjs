// Battle tuning (PLAN-CORE-LOOP.md, slice 6; numbers in src/data/battle.js). Plays jobs hands-off
// and prints, per job tier, crew and orders: how often a run turns into a fight, how fights end
// (won, pushed past, pulled back), how often someone hits death's door, rounds per fight, and the
// share of jobs aborted. Then the gear check: the same fights with every runner in a sidearm and
// a vest, and in pro kit.
//
//   node scripts/sim-battles.mjs [seeds=400]
import { createNewGame } from '../src/core/state.js';
import * as M from '../src/core/mission.js';
import { addOffer, templateById } from '../src/core/jobs.js';
import { autoRun } from '../src/core/autorun.js';
import { arm } from '../tests/play.js';

const SEEDS = Number(process.argv[2] ?? 400);
const APPROACHES = ['stealth', 'tech', 'loud', 'con'];
const pct = (n, d) => (d ? `${Math.round((n / d) * 100)}%` : '-');

/** A crew of five generated rookies, or the same crew grown to pros (every stat +4, as after a season or so). */
function crew(seed, grown) {
  const s = createNewGame({ seed, startCrew: 'fresh' });
  if (grown) for (const op of s.crew) for (const k of Object.keys(op.stats)) op.stats[k] = Math.min(20, op.stats[k] + 4);
  return s;
}

function run({ job, grown = false, orders = 'steady', approach = null, kit = [] }) {
  const t = { runs: 0, fights: 0, won: 0, press: 0, retreat: 0, door: 0, rounds: 0, aborted: 0 };
  for (let seed = 1; seed <= SEEDS; seed++) {
    let s = crew(seed, grown);
    s.jobs = [];
    addOffer(s, job);
    const size = templateById(job).crewSize;
    for (const op of s.crew.slice(0, size)) arm(s, op.id, ...kit);
    s = M.startMission(s, s.jobs[0].id, s.crew.slice(0, size).map((o) => o.id), approach ?? APPROACHES[seed % 4]);
    const am = autoRun(s, orders).activeMission;
    t.runs++;
    if (am.aborted) t.aborted++;
    for (const e of am.events.filter((x) => x.kind === 'battle')) {
      if (e.phase === 'start') t.fights++;
      if (e.phase === 'round') { t.rounds++; if (e.runners.some((r) => r.down)) t.door++; }
      if (e.phase === 'end') t[e.how === 'won' ? 'won' : 'press']++;
      if (e.phase === 'retreat') t.retreat++;
    }
  }
  return {
    fight: pct(t.fights, t.runs), won: pct(t.won, t.fights), pushed: pct(t.press, t.fights), pulled: pct(t.retreat, t.fights),
    rounds: t.fights ? (t.rounds / t.fights).toFixed(1) : '-', downRounds: pct(t.door, t.rounds), aborted: pct(t.aborted, t.runs),
  };
}

const JOBS = [['container409', 'rookie, threat 1-2'], ['warehouse', 'threat 4']];
console.log(`${SEEDS} runs per row, every approach in turn unless named.\n`);
for (const [job, label] of JOBS) {
  for (const grown of [false, true]) {
    for (const orders of ['cautious', 'steady', 'committed']) {
      console.log(`${job} (${label}) · ${grown ? 'pros' : 'rookies'} · ${orders}`, JSON.stringify(run({ job, grown, orders })));
    }
  }
}
console.log('\nGear on loud runs (steady): nothing, sidearm and vest, pro sidearm and pro vest.');
for (const [job] of JOBS) {
  for (const grown of [false, true]) {
    for (const [name, kit] of [['nothing', []], ['street', ['pistol', 'vest']], ['pro', ['pistol:pro', 'vest:pro']]]) {
      console.log(`${job} · ${grown ? 'pros' : 'rookies'} · ${name}`, JSON.stringify(run({ job, grown, approach: 'loud', kit })));
    }
  }
}
