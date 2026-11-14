// The five engine-2 jobs' fights with the roster a campaign really has when each job unlocks (2026-11-13).
// scripts/sim-teams.mjs used the day-one roster, which never meets these jobs: they wait for reputation 15, 35
// and 60 (core/jobs.js JOB_GATES). Here each seed plays the campaign as scripts/sim-tong.mjs does (every crew
// out, hands-off, stealth, steady) until reputation reaches each gate, and the roster of that day fights.
//
//   node scripts/sim-gate-teams.mjs [seeds=24] [fights a roster=100] [date]      (about 10 minutes)
//
// Team: "best" is the team the planning read likes best (fightOddsFor: win, then fewest lost, then downs) out of
// every team of the job's size; "first" is the first able runners of the roster. Fights are hands-off on the
// crew's default orders with the standing answers (core/runfight.js fightAnswer), no overwatch, wheels or standby,
// at the lower end of each job's real difficulty (JOB_DIFF, read from docs/sims/teams-*.md), eased by fightDiff.
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
import { FIGHT, FIGHT_JOBS } from '../src/data/fights.js';
import { makeRng, hash } from '../src/core/rng.js';

globalThis.localStorage ??= { getItem: () => null, setItem: () => {}, removeItem: () => {} };
const SEEDS = Number(process.argv[2] ?? 24);
const FIGHTS = Number(process.argv[3] ?? 100);
const DATE = process.argv[4] ?? new Date().toISOString().slice(0, 10);
const JOB_DIFF = { data_scrub: 11, data_pull: 14, quiet_hours: 14, protection: 14, warehouse: 16 };
// Declared before the run (owner's targets, drafts/OWNER-ITEMS-battle.md): for the best team at the gate, someone
// left behind in at most 15% of steady extractions, and a death in about 1 in 25 committed fights (at most 8%).
const TARGET = { left: 0.15, dead: 0.08 };
const GATES = [...new Set(Object.keys(FIGHT_JOBS).map((j) => JOB_GATES[templateById(j).threat]))];

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

function play(args, seed, tag) {
  const b = Fight.buildFight({ ...args, watched: true }, makeRng(hash('gb', tag, seed)));
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
    Fight.playRound(b, rng);
    for (const r of b.runners) if (r.down || r.dead) ever.add(r.id);
  }
  return { res: b.end?.result, left: b.left.length, down: ever.size, dead: b.runners.some((x) => x.dead) };
}

const subsets = (list, k) => (k === 0 ? [[]] : list.flatMap((x, i) => subsets(list.slice(i + 1), k - 1).map((rest) => [x, ...rest])));
const P = (x) => `${Math.round(x * 100)}%`;
const rosters = [];
for (let seed = 1; seed <= SEEDS; seed++) { rosters.push({ seed, snaps: grow(seed) }); process.stderr.write(`grown ${seed}/${SEEDS}\r`); }

const out = [];
const L = (s = '') => out.push(s);
L(`# The five jobs' fights with the roster at each job's gate (${DATE})`);
L();
L(`\`node scripts/sim-gate-teams.mjs ${SEEDS} ${FIGHTS} ${DATE}\`. Real fight code. ${SEEDS} campaigns played as \`scripts/sim-tong.mjs\` plays them; each job is fought by the roster of the day reputation reached its gate, ${FIGHTS} fights a roster, hands-off on the default orders, no overwatch, wheels or standby. Fights are played ${FIGHT.ease} below the job difficulty shown (\`fightDiff\`). Declared before the run: for the best team, someone left behind in at most ${P(TARGET.left)} of steady extractions and a death in at most ${P(TARGET.dead)} of committed fights (the owner's aim is about 1 in 25).`);
L();
L('## The rosters');
L();
L('| Gate (reputation) | Reached, week (median) | Campaigns | Roster | Combat (q1 / median / q3) | Cool | Endurance |');
L('| --- | --- | --- | --- | --- | --- | --- |');
const q = (a) => { const x = [...a].sort((m, n) => m - n); return `${x[x.length >> 2]} / ${x[x.length >> 1]} / ${x[(x.length * 3) >> 2]}`; };
for (const g of GATES.sort((a, b) => a - b)) {
  const got = rosters.filter((r) => r.snaps[g]);
  const ops = got.flatMap((r) => r.snaps[g].crew);
  const wk = got.map((r) => r.snaps[g].week).sort((a, b) => a - b);
  L(`| ${g} | ${wk[wk.length >> 1] ?? '-'} | ${got.length}/${SEEDS} | ${q(got.map((r) => r.snaps[g].crew.length)).split(' / ')[1]} | ${q(ops.map((o) => o.stats.combat))} | ${q(ops.map((o) => o.stats.cool))} | ${q(ops.map((o) => o.stats.endurance))} |`);
}
L();
L('## The fights');
L();
L('| Job | Job difficulty | Risk | Team | Fights | Clean win | Job done | Pulled back | Someone left behind | People left | Downs | A death |');
L('| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |');
const verdict = [];
for (const job of Object.keys(FIGHT_JOBS)) {
  const tpl = templateById(job);
  const gate = JOB_GATES[tpl.threat];
  const base = { type: FIGHT_JOBS[job], diff: Fight.fightDiff(JOB_DIFF[job]), threat: tpl.threat, site: tpl.district, approach: 'stealth' };
  const teams = [];
  for (const { seed, snaps } of rosters) {
    const roster = (snaps[gate]?.crew ?? []).filter((o) => !o.injury || o.injury.severity === 'light');
    if (roster.length < tpl.crewSize) continue;
    let best = null;
    for (const t of subsets(roster, tpl.crewSize)) {
      const o = Fight.fightOddsFor({ ...base, risk: 'steady', crew: t });
      const score = o.win * 100 - o.lost * 10 - o.down;
      if (!best || score > best.score) best = { t, score };
    }
    teams.push({ seed, best: best.t, first: roster.slice(0, tpl.crewSize) });
  }
  for (const risk of ['steady', 'committed']) for (const pick of ['best', 'first']) {
    const a = { n: 0, won: 0, done: 0, leftAny: 0, left: 0, down: 0, dead: 0 };
    for (const t of teams) for (let i = 0; i < FIGHTS; i++) {
      const r = play({ ...base, risk, crew: t[pick] }, t.seed * 1000 + i, `${job}${risk}${pick}`);
      const done = ['won', 'lostRunner', 'leftBehind'].includes(r.res);
      a.n++; a.won += r.res === 'won'; a.done += done; a.leftAny += r.left > 0; a.left += r.left; a.down += r.down; a.dead += r.dead;
    }
    L(`| ${job} | ${JOB_DIFF[job]} | ${risk} | ${pick === 'best' ? 'best of roster' : `first ${tpl.crewSize}`} | ${a.n} | ${P(a.won / a.n)} | ${P(a.done / a.n)} | ${P(1 - a.done / a.n)} | ${P(a.leftAny / a.n)} | ${(a.left / a.n).toFixed(2)} | ${(a.down / a.n).toFixed(2)} | ${(a.dead / a.n * 100).toFixed(1)}% |`);
    if (pick === 'best' && risk === 'steady' && FIGHT_JOBS[job] === 'holdExtract') verdict.push(`${job}: left behind ${P(a.leftAny / a.n)} on steady (${a.leftAny / a.n <= TARGET.left ? 'within' : 'over'} ${P(TARGET.left)})`);
    if (pick === 'best' && risk === 'committed') verdict.push(`${job}: a death in ${(a.dead / a.n * 100).toFixed(1)}% on committed (${a.dead / a.n <= TARGET.dead ? 'within' : 'over'} ${P(TARGET.dead)})`);
  }
}
L();
L('## Against the declared targets (best team)');
L();
for (const v of verdict) L(`- ${v}`);
L();
L('Limits: the campaign player is the simple one of `sim-tong.mjs` (it does not train or pick for fights); one difficulty a job, the lower end of what its runs really start; hands-off defaults, so a player giving orders or bringing overwatch does better; the best team is the planning read\'s pick, which a player may not send.');
writeFileSync(new URL(`../docs/sims/gate-teams-${DATE}.md`, import.meta.url), out.join('\n') + '\n');
console.log(out.join('\n'));
