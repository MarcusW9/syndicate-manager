// Companion to scripts/sim-orders.mjs (not part of its declared gate): hand-picked teams at each job's REAL
// fight difficulty, from the game's own starting rosters. The gate used a flat difficulty 14 and synthetic
// crews; this asks what a player choosing the best team from the roster actually meets.
//
//   node scripts/sim-teams.mjs [seeds=200] [date=2026-11-11]
//
// 1. The real difficulty: each of the five jobs is started on fresh runs (four approaches) and stopped at its
//    first engine-2 fight; the fight's own diff, enemy count and site are read.
// 2. The crew: for each starting roster (fresh and authored) and job, every team of the job's crew size is read
//    with the planning read (fightOddsFor, what the plan screen shows, steady risk) and the best is taken, by
//    clean win then fewest lost. "First N" (the first runners of the roster) is played beside it.
// 3. Played hands-off on the crew's defaults with the standing answers (core/runfight.js fightAnswer), at the
//    diff and threat each seed's real run had.
import { writeFileSync } from 'node:fs';
import { createNewGame } from '../src/core/state.js';
import * as M from '../src/core/mission.js';
import { addOffer, templateById } from '../src/core/jobs.js';
import { autoStep } from '../src/core/autorun.js';
import * as Fight from '../src/core/fight.js';
import { fightAnswer } from '../src/core/runfight.js';
import { DILEMMAS } from '../src/data/dilemmas.js';
import { FIGHT_JOBS } from '../src/data/fights.js';
import { makeRng, hash } from '../src/core/rng.js';

globalThis.localStorage ??= { getItem: () => null, setItem: () => {}, removeItem: () => {} };
const SEEDS = Number(process.argv[2] ?? 200);
const DATE = process.argv[3] ?? '2026-11-11';
const JOBS = Object.keys(FIGHT_JOBS);
const P = (x) => `${Math.round(x * 100)}%`;
const D = (x) => x.toFixed(2);
const APPROACHES = ['loud', 'stealth', 'tech', 'con'];

// 1. The real fights each job starts.
function realFight(job, seed, startCrew) {
  let s = createNewGame({ seed, startCrew });
  s.jobs = [];
  addOffer(s, job);
  const tpl = templateById(job);
  s = M.startMission(s, s.jobs[0].id, s.crew.slice(0, tpl.crewSize).map((o) => o.id), APPROACHES[seed % 4], { callIn: 'every', orders: 'steady' });
  s.activeMission.orders = 'steady';
  for (let g = 0; g < 400 && !s.activeMission.done; g++) {
    const am = s.activeMission;
    if (am.battle && M.currentStep(am)?.type === 'battle') return { diff: am.battle.diff, enemies: am.battle.enemies.length, site: am.battle.site, type: am.battle.type, approach: am.approach };
    const next = autoStep(s, { force: true });
    if (next === s) break;
    s = next;
  }
  return null;
}

// 3. One hands-off fight.
function play(args, seed, tag) {
  const b = Fight.buildFight({ ...args, watched: true }, makeRng(hash('tb', tag, seed)));
  const rng = makeRng(hash('tp', tag, seed));
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
    Fight.playRound(b, rng);
    for (const r of b.runners) if (r.down || r.dead) ever.add(r.id);
  }
  const r = b.end?.result;
  return { won: r === 'won', done: ['won', 'lostRunner', 'leftBehind'].includes(r), left: b.left.length > 0, down: ever.size, dead: b.runners.some((x) => x.dead) };
}

const subsets = (list, k) => (k === 0 ? [[]] : list.flatMap((x, i) => subsets(list.slice(i + 1), k - 1).map((rest) => [x, ...rest])));
const out = [];
const L = (s = '') => out.push(s);
const rows = [];
const diffs = {};
for (const job of JOBS) {
  const tpl = templateById(job);
  for (const startCrew of ['fresh', 'authored']) {
    const acc = { first: { n: 0, won: 0, done: 0, left: 0, down: 0, dead: 0 }, best: { n: 0, won: 0, done: 0, left: 0, down: 0, dead: 0 } };
    const seen = [];
    for (let seed = 1; seed <= SEEDS; seed++) {
      const real = realFight(job, seed, startCrew);
      if (!real) continue;
      seen.push(real);
      const roster = createNewGame({ seed, startCrew }).crew;
      const base = { type: real.type, diff: real.diff, threat: tpl.threat, site: real.site, approach: real.approach, risk: 'steady' };
      const first = roster.slice(0, tpl.crewSize);
      let best = null;
      for (const team of subsets(roster, Math.min(tpl.crewSize, roster.length))) {
        const o = Fight.fightOddsFor({ ...base, crew: team });
        const score = o.win * 100 - o.lost * 10 - o.down;
        if (!best || score > best.score) best = { team, score };
      }
      for (const [name, team] of [['first', first], ['best', best.team]]) {
        const r = play({ ...base, crew: team }, seed, `${job}${startCrew}${name}`);
        const a = acc[name];
        a.n++; a.won += r.won; a.done += r.done; a.left += r.left; a.down += r.down; a.dead += r.dead;
      }
    }
    diffs[job] ??= seen.map((x) => x.diff);
    for (const name of ['first', 'best']) rows.push({ job, startCrew, name, size: tpl.crewSize, ...Object.fromEntries(Object.entries(acc[name]).map(([k, v]) => [k, k === 'n' ? v : v / acc[name].n])) });
  }
}

L(`# Hand-picked teams at the real fight difficulty (${DATE})`);
L();
L(`\`node scripts/sim-teams.mjs ${SEEDS} ${DATE}\`. Not part of the declared gate in \`scripts/sim-orders.mjs\`; the same fight code, with the game's own starting rosters and each job's real fight difficulty.`);
L();
L('## The fights the five jobs really start');
L();
L('| Job | Fights seen | Difficulty (min / median / max) | Enemies at the start |');
L('| --- | --- | --- | --- |');
for (const job of JOBS) {
  const d = [...diffs[job]].sort((a, b) => a - b);
  L(`| ${job} | ${d.length} | ${d[0]} / ${d[Math.floor(d.length / 2)]} / ${d[d.length - 1]} | ${templateById(job).threat ? `threat ${templateById(job).threat}` : ''} |`);
}
L();
L('## Played hands-off on the defaults, steady risk');
L();
L('"First N" is the first N runners of the roster (what the earlier tables used); "best" is the team the planning read likes best out of every team of that size (win chance, then fewest lost). Fights at the difficulty each seed\'s real run had.');
L();
L('| Job | Roster | Team | Fights | Clean win | Job done | Someone left behind | Downs | Died |');
L('| --- | --- | --- | --- | --- | --- | --- | --- | --- |');
for (const r of rows) L(`| ${r.job} | ${r.startCrew} | ${r.name === 'first' ? `first ${r.size}` : 'best of roster'} | ${r.n} | ${P(r.won)} | ${P(r.done)} | ${P(r.left)} | ${D(r.down)} | ${P(r.dead)} |`);
L();
const mean = (f) => { const x = rows.filter(f); return { won: x.reduce((a, r) => a + r.won, 0) / x.length, left: x.reduce((a, r) => a + r.left, 0) / x.length }; };
L('## Reading');
L();
for (const sc of ['fresh', 'authored']) for (const ty of ['holdHack', 'holdExtract']) {
  const jobs = JOBS.filter((j) => FIGHT_JOBS[j] === ty);
  const f = mean((r) => r.startCrew === sc && r.name === 'first' && jobs.includes(r.job));
  const b = mean((r) => r.startCrew === sc && r.name === 'best' && jobs.includes(r.job));
  L(`- ${sc} roster, ${ty}: first N ${P(f.won)} clean wins and ${P(f.left)} left behind; best team ${P(b.won)} and ${P(b.left)}.`);
}
writeFileSync(new URL(`../docs/sims/teams-${DATE}.md`, import.meta.url), out.join('\n') + '\n');
console.log(out.slice(out.indexOf('## Played hands-off on the defaults, steady risk')).join('\n'));
