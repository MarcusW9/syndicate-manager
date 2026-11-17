// The way out of a hack (2026-11-17): how big the second group should be. (Derived from sim-vectors.mjs.) Original header: the two vectors against each other (builds slice 3-iii, 2026-11-17): the Cytotoxic Vector (until the target falls) and the Contagion Vector (2 rounds,
// jumps when its host falls), alone and with Ricochet, on the same teams and seeds so each row differs only by the build.
//
//   node scripts/sim-vectors.mjs [seeds=8] [fights a roster=60] [date]
//
// Rosters are grown as scripts/sim-gate-teams.mjs grows them; the best team the planning read likes best fights each job hands-off on steady.
// Shapes: "job's own" (the real fight), "swarm" (the same fight with six hired guns in one group and no one else) and "mixed" (the job's enemies
// with two drones and two security guards added). "Jumps" is how often the Contagion Vector jumped a fight.
import { writeFileSync } from 'node:fs';
import { createNewGame } from '../src/core/state.js';
import { autoFounders } from '../tests/play.js';
import { hire, canHire, nextExpansion, expandSafehouse, STARTING_ROSTER_CAP } from '../src/core/recruits.js';
import { primaryStat } from '../src/core/development.js';
import { advanceDay, calendar } from '../src/core/time.js';
import { templateById, jobView, JOB_GATES } from '../src/core/jobs.js';
import { availability } from '../src/core/crew.js';
import { sendOff } from '../src/core/autorun.js';
import * as Fight from '../src/core/fight.js';
import { fightAnswer } from '../src/core/runfight.js';
import { DILEMMAS } from '../src/data/dilemmas.js';
import { FIGHT, FIGHT_JOBS, ENEMIES } from '../src/data/fights.js';
import { makeRng, hash } from '../src/core/rng.js';
import { withBuild } from '../src/core/builds.js';
const JOB_DIFF = { data_scrub: 11, data_pull: 14, quiet_hours: 14, protection: 14, warehouse: 16,
  // the /add-job fight jobs (2026-11-15): their roll target (core/risk.js rollTarget), rounded
  dead_air: 16, still_connected: 16, not_for_sale: 16, one_more_song: 14,
  still_clocked_in: 14, the_last_collection: 16, the_wrong_fare: 14,
  // the fourteen jobs moved to engine 2 together (2026-11-17)
  kidnap: 16, casino: 11, clinic: 6, ledger: 6, container409: 6, chrome: 6, low_water: 14, mooring_watch: 11, count_against_paper: 11,
  quarter_to_two: 11, manual_handling: 11, favourite: 11, last_ticket: 11, wrong_horse: 14 };
const GATES_FOR = ['data_pull', 'quiet_hours'];
const GATES = [...new Set(GATES_FOR.map((j) => JOB_GATES[templateById(j).threat]))];
/** The roster on the first day reputation reaches each gate. */
function grow(seed) {
  let s = createNewGame({ seed, startCrew: 'pick' });
  if (s.founding) s = autoFounders(s);
  const snaps = {};
  for (let day = 0; day < 78 * 7 && Object.keys(snaps).length < GATES.length; day++) {
    if (calendar(s.day).weekday !== 'Sun') {
      for (const job of [...s.jobs].sort((a, b) => jobView(s, b).pay - jobView(s, a).pay)) {
        const free = s.crew.filter((op) => availability(s, op).ok);
        const tpl = templateById(job.templateId);
        if (free.length < tpl.crewSize) continue;
        const crew = [...free].sort((a, b) => (a.role === 'medic' ? -1 : 0) - (b.role === 'medic' ? -1 : 0)).slice(0, tpl.crewSize);
        s = sendOff(s, job.id, crew.map((o) => o.id), 'stealth', 'steady', { callIn: 'never' });
      }
    }
    const lead = [...(s.recruits ?? [])].filter((r) => canHire(s, r).ok).sort((a, b) => b.stats[primaryStat(b)] - a.stats[primaryStat(a)])[0];
    const wages = s.crew.reduce((n, o) => n + o.wage, 0);
    if (lead && s.cash - (wages + lead.wage + s.rent) * 2 > 0) s = hire(s, lead.id);
    const x = nextExpansion(s); // null once the home hall has every part: nothing left to take
    if (s.crew.length >= (s.rosterCap ?? STARTING_ROSTER_CAP) && x && s.cash > x.cost + (wages + s.rent) * 3) s = expandSafehouse(s);
    s = advanceDay(s);
    for (const g of GATES) if (!snaps[g] && (s.reputation ?? 0) >= g) snaps[g] = { week: Math.ceil((day + 1) / 7), crew: structuredClone(s.crew) };
  }
  return snaps;
}

function play(args, seed, tag, { shape = null } = {}) {
  const b = Fight.buildFight({ ...args, watched: true }, makeRng(hash('gb', tag, seed)));
  if (shape) shape(b);
  const hit = { burstRound: null, vector: 0, killed: 0, jumps: 0 };
  const rng = makeRng(hash('gp', tag, seed));
  const ever = new Set();
  while (!b.end && b.round < 30) {
    if (!b.drawn) Fight.startRound(b, rng);
    for (const key of Object.keys(b.dilemmasFired)) if (!Fight.dilemmaHolds(b, key.split(':')[0])) delete b.dilemmasFired[key];
    const due = Fight.dueDilemmas(b)[0];
    if (due) {
      b.dilemmasFired[due.key] = true;
      const o = DILEMMAS[due.id].options.find((x) => x.id === fightAnswer({ battle: b, pending: { id: due.id } }).id);
      if (o?.ordersPatch) Fight.applyPatch(b, o.ordersPatch);
      if (o?.vanWait) b.vanHold = !!o.vanWait.hold;
    }
    const rr = Fight.playRound(b, rng);
    hit.jumps += rr.lines.filter((l) => l.key === 'spread').length;
    if (hit.burstRound == null && rr.lines.some((l) => l.burst)) hit.burstRound = b.round;
    for (const d of rr.defeated) { hit.killed += 1; if (d.how === 'vector') hit.vector += 1; }
    for (const r of b.runners) if (r.down || r.dead) ever.add(r.id);
  }
  return { res: b.end?.result, left: b.left.length, down: ever.size, dead: b.runners.some((x) => x.dead), rounds: b.round, ...hit };
}

const SEEDS = Number(process.argv[2] ?? 8);
const FIGHTS = Number(process.argv[3] ?? 60);
const DATE = process.argv[4] ?? new Date().toISOString().slice(0, 10);
const subsets = (list, k) => (k === 0 ? [[]] : list.flatMap((x, i) => subsets(list.slice(i + 1), k - 1).map((rest) => [x, ...rest])));
const P = (x) => `${Math.round(x * 100)}%`;
const rosters = [];
for (let seed = 1; seed <= SEEDS; seed++) { rosters.push({ seed, snaps: grow(seed) }); process.stderr.write(`grown ${seed}/${SEEDS}\r`); }
const SHARES = (process.env.SHARES ?? '0,0.34,0.5,0.67,1').split(',').map(Number);
const ARMS = [['no build', null], ['Ricochet + Contagion', { move: 'ricochet', payload: 'contagion' }]];
const out = [];
const L = (s = '') => out.push(s);
L(`# How big should the way out of a hack be? (${DATE})`);
L();
L(`\`node scripts/sim-wayout.mjs ${SEEDS} ${FIGHTS} ${DATE}\`. Real fight code, hands-off, steady, the best team of each campaign's roster at the job's gate (${SEEDS} campaigns, ${FIGHTS} fights a roster per row). Share 0 is today's fight before the way out (it ends with the hack). "Job done" counts a clean win or a break-off on the way out (the objective is kept); "clean" is a win with nobody breaking off; "downs" is runners down a fight (each is a serious injury, 21 days out).`);
for (const job of GATES_FOR) {
  const tpl = templateById(job);
  const gate = JOB_GATES[tpl.threat];
  const base = { type: FIGHT_JOBS[job], diff: Fight.fightDiff(JOB_DIFF[job]), threat: tpl.threat, site: tpl.district, approach: 'stealth', opposition: tpl.opposition ?? null, job, risk: 'steady' };
  const teams = [];
  for (const { seed, snaps } of rosters) {
    const roster = (snaps[gate]?.crew ?? []).filter((o) => !o.injury || o.injury.severity === 'light');
    if (roster.length < tpl.crewSize) continue;
    FIGHT.wayOutShare = 1;
    let best = null;
    for (const t of subsets(roster, tpl.crewSize)) {
      const o = Fight.fightOddsFor({ ...base, crew: t });
      const score = o.win * 100 - o.lost * 10 - o.down;
      if (!best || score > best.score) best = { t, score };
    }
    teams.push({ seed, best: best.t });
  }
  L();
  L(`## ${job} (${teams.length} teams)`);
  L();
  L('| Way-out share | Build | Fights | Job done | Clean win | Downs a fight | A death | Rounds |');
  L('| --- | --- | --- | --- | --- | --- | --- | --- |');
  for (const share of SHARES) for (const [label, build] of ARMS) {
    FIGHT.wayOutShare = share;
    const a = { n: 0, done: 0, won: 0, down: 0, dead: 0, rounds: 0 };
    for (const t of teams) for (let i = 0; i < FIGHTS; i++) {
      const crew = build ? withBuild(t.best, build) : t.best;
      const b = Fight.buildFight({ ...base, crew, watched: true }, makeRng(hash('gb', job, t.seed * 1000 + i)));
      if (share === 0) delete b.wayOut;
      const rng = makeRng(hash('gp', job, t.seed * 1000 + i));
      const ever = new Set();
      while (!b.end && b.round < 30) {
        if (!b.drawn) Fight.startRound(b, rng);
        for (const key of Object.keys(b.dilemmasFired)) if (!Fight.dilemmaHolds(b, key.split(':')[0])) delete b.dilemmasFired[key];
        const due = Fight.dueDilemmas(b)[0];
        if (due) { b.dilemmasFired[due.key] = true; const o = DILEMMAS[due.id].options.find((x) => x.id === fightAnswer({ battle: b, pending: { id: due.id } }).id); if (o?.ordersPatch) Fight.applyPatch(b, o.ordersPatch); if (o?.vanWait) b.vanHold = !!o.vanWait.hold; }
        Fight.playRound(b, rng);
        for (const r of b.runners) if (r.down || r.dead) ever.add(r.id);
      }
      a.n++; a.done += Fight.objectiveDone(b); a.won += b.end?.result === 'won'; a.down += ever.size; a.dead += b.runners.some((x) => x.dead); a.rounds += b.round;
    }
    L(`| ${share === 0 ? '0 (before)' : share} | ${label} | ${a.n} | ${P(a.done / a.n)} | ${P(a.won / a.n)} | ${(a.down / a.n).toFixed(2)} | ${P(a.dead / a.n)} | ${(a.rounds / a.n).toFixed(1)} |`);
  }
}
FIGHT.wayOutShare = 1;
writeFileSync(new URL(`../docs/sims/wayout-${DATE}.md`, import.meta.url), out.join('\n') + '\n');
console.log(out.join('\n'));
