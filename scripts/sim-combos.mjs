// The combo sweep (build vocabulary, part A; drafts/HANDOFF-build-vocab-next.md, drafts/PROPOSAL-build-vocabulary.md "What makes it scale" 2).
// MEASURES ONLY: no rule, number or wording is changed here, and nothing is tuned. Outliers are for the owner and for part B.
//
//   node scripts/sim-combos.mjs [crews=10] [fights a crew a job=20] [date]
//
// Every build a runner can hold (each move or none x each payload or none), and every pair of builds (an unordered pair: the first on the best
// combat runner, the second on the next best; a single build is a pair with "no build"; the no-build pair is the baseline row), played by the
// same crews on the same seeds against five enemy mixes: the job's own, armoured (police and secforce: plates), swarm (six hired), synthetic
// (drones) and mixed (the job's own plus two drones and two corp). The list of pieces is read from MOVES and PAYLOADS, so a new piece is swept
// with no change here. Cautious, steady and committed are all played; the table shows steady and committed.
//
// It flags, plainly, in the file: a build far stronger than no build, one worse than no build, any piece that never fires, and (the one that
// must never happen) a death on cautious or steady: that stops the sweep at once, writes what it found and exits 2.
import { writeFileSync } from 'node:fs';
import { createNewGame } from '../src/core/state.js';
import * as Fight from '../src/core/fight.js';
import { FIGHT_JOBS } from '../src/data/fights.js';
import { MOVES, PAYLOADS } from '../src/data/builds.js';
import { makeRng } from '../src/core/rng.js';

// Thresholds (named, in one place). Clean win = won and nobody down.
const FAR_STRONGER = 0.15; // a clean win this far (as a share) above the no-build row on any mix: flagged "far stronger"
const WORSE_BY = 0.03; // a clean win this far below the no-build row: flagged "worse than no build" (the same seeds are played, so this is a small margin for ties)
const SHOWN_RISKS = ['steady', 'committed'];
const ALL_RISKS = ['cautious', 'steady', 'committed'];

globalThis.localStorage ??= { getItem: () => null, setItem: () => {}, removeItem: () => {} };
const CREWS = Number(process.argv[2] ?? 10);
const FIGHTS = Number(process.argv[3] ?? 20);
const DATE = process.argv[4] ?? new Date().toISOString().slice(0, 10);
const OUT = new URL(`../docs/sims/combos-${DATE}.md`, import.meta.url);

const base = createNewGame({ seed: 1 }).crew;
function crewOf(seed, size) {
  const r = makeRng(seed);
  const span = (lo, hi) => lo + Math.floor(r() * (hi - lo + 1));
  return Array.from({ length: size }, (_, i) => {
    const op = structuredClone(base[i % base.length]);
    op.id = `sim${seed}-${i}`; op.handle = `R${i}`;
    op.role = i === 0 ? 'tech' : i === 1 ? 'medic' : 'fighter';
    for (const [st, lo, hi] of [['combat', 11, 16], ['cool', 6, 14], ['tech', i === 0 ? 11 : 8, 14], ['medical', i === 1 ? 11 : 6, 14]]) op.stats[st] = span(lo, hi);
    return op;
  });
}
/** The runners by combat, best first (ties the lowest seat): the ones that get the builds. */
const bestTwo = (crew) => crew.map((op, i) => ({ i, c: op.stats.combat })).sort((a, b) => b.c - a.c || a.i - b.i).slice(0, 2).map((x) => x.i);

// The jobs whose own fights are "the job's own" (the same two setups every row).
const JOBS = [
  { name: 'warehouse (docks, threat 4)', args: { type: FIGHT_JOBS.warehouse, diff: 12, threat: 4, site: 'docks', approach: 'loud' } },
  { name: 'data_pull (heights, threat 3)', args: { type: FIGHT_JOBS.data_pull, diff: 12, threat: 3, site: 'heights', approach: 'loud' } },
];
const swap = (kinds) => (b, rng) => { b.enemies.length = 0; b.hiredTotal = {}; for (const k of kinds) Fight.newEnemy(b, k, rng); };
const MIXES = {
  "the job's own": () => {},
  armoured: swap(['police', 'police', 'police', 'secforce', 'secforce', 'secforce']),
  swarm: swap(['hired', 'hired', 'hired', 'hired', 'hired', 'hired']),
  synthetic: swap(['drone', 'drone', 'drone', 'drone', 'drone']),
  mixed: (b, rng) => { for (const k of ['drone', 'drone', 'corp', 'corp']) Fight.newEnemy(b, k, rng); },
};

// Every build, then every unordered pair of them; the first row is the baseline (nothing, nothing).
const moves = [null, ...Object.keys(MOVES)];
const payloads = [null, ...Object.keys(PAYLOADS)];
const builds = moves.flatMap((move) => payloads.map((payload) => ({ move, payload })));
const noBuild = (b) => !b.move && !b.payload;
const buildName = (b) => (noBuild(b) ? 'no build' : [b.move && MOVES[b.move].name, b.payload && PAYLOADS[b.payload].name].filter(Boolean).join(' + '));
const COMBOS = [];
for (let i = 0; i < builds.length; i++) for (let j = i; j < builds.length; j++) COMBOS.push({ a: builds[i], b: builds[j], label: j === i && noBuild(builds[i]) ? 'no build' : noBuild(builds[j]) ? buildName(builds[i]) : noBuild(builds[i]) ? buildName(builds[j]) : `${buildName(builds[i])} | ${buildName(builds[j])}` });
COMBOS.sort((x, y) => (x.label === 'no build' ? -1 : y.label === 'no build' ? 1 : 0));
const BASE_LABEL = 'no build';
const PIECES = [...Object.values(MOVES), ...Object.values(PAYLOADS)].map((p) => p.id);

const given = (crew, combo) => {
  const [first, second] = bestTwo(crew);
  return crew.map((op, i) => (i === first && !noBuild(combo.a) ? { ...op, build: { ...combo.a } } : i === second && !noBuild(combo.b) ? { ...op, build: { ...combo.b } } : op));
};

/** One fight hands-off, with its lines counted (the trigger step's own lines: bounces, infects, spreads, shrugs). */
function play(args, mix, seed, tag, held) {
  const b = Fight.buildFight({ ...args, watched: true }, makeRng(seed * 7 + tag));
  MIXES[mix](b, makeRng(seed * 13 + tag));
  const rng = makeRng(seed * 31 + tag);
  const n = { bounces: 0, infects: 0, spreads: 0, shrugs: 0 };
  const piece = Object.fromEntries(PIECES.map((p) => [p, 0]));
  while (!b.end && b.round < 30) {
    const rr = Fight.playRound(b, rng);
    for (const l of rr.lines) {
      const mine = held[l.actor] ?? [];
      if (l.burst && l.key.startsWith('bounce')) { n.bounces++; for (const p of mine) if (MOVES[p]) piece[p]++; }
      else if (l.key === 'infect') { n.infects++; if (l.payload) piece[l.payload]++; }
      else if (l.key === 'spread') { n.spreads++; if (l.payload) piece[l.payload]++; }
      else if (l.key === 'immune') { n.shrugs++; for (const p of mine) if (PAYLOADS[p]) piece[p]++; }
    }
  }
  if (!b.end) Fight.playFight(b, rng); // the deadline's own ending
  const won = b.end?.result === 'won';
  const downs = b.runners.filter((r) => r.down || r.dead).length;
  const dead = b.runners.filter((r) => r.dead);
  return { won, clean: won && downs === 0, downs, dead: dead.map((r) => r.handle), rounds: b.round, hp: b.hpLost, ...n, piece };
}

const out = [];
const L = (s = '') => out.push(s);
const flags = [];
const deaths = [];
const acc = {}; // `${risk}|${mix}|${label}` -> totals
const pieceTotals = Object.fromEntries(PIECES.map((p) => [p, Object.fromEntries(Object.keys(MIXES).map((m) => [m, 0]))]));
let stopped = false;
let fightsPlayed = 0;

sweep: for (const risk of ALL_RISKS) for (const mix of Object.keys(MIXES)) for (const combo of COMBOS) {
  const t = acc[`${risk}|${mix}|${combo.label}`] = { n: 0, won: 0, clean: 0, downs: 0, dead: 0, rounds: 0, hp: 0, bounces: 0, infects: 0, spreads: 0, shrugs: 0 };
  for (const job of JOBS) for (let c = 0; c < CREWS; c++) {
    const crew = given(crewOf(9000 + c, 4 + (c % 3)), combo);
    const held = Object.fromEntries(crew.filter((o) => o.build).map((o) => [o.id, [o.build.move, o.build.payload].filter(Boolean)]));
    for (let i = 0; i < FIGHTS; i++) {
      const r = play({ ...job.args, crew, risk }, mix, c * 1000 + i + 1, JOBS.indexOf(job) + 1, held);
      fightsPlayed++;
      t.n++; t.won += r.won; t.clean += r.clean; t.downs += r.downs; t.dead += r.dead.length > 0; t.rounds += r.rounds; t.hp += r.hp;
      for (const k of ['bounces', 'infects', 'spreads', 'shrugs']) t[k] += r[k];
      if (risk === 'committed') for (const p of PIECES) pieceTotals[p][mix] += r.piece[p];
      if (r.dead.length && risk !== 'committed') {
        deaths.push({ risk, mix, build: combo.label, job: job.name, crew: c, fight: i, dead: r.dead });
        stopped = true; break sweep;
      }
    }
  }
}

const P = (x) => `${Math.round(x * 100)}%`;
const F2 = (x) => x.toFixed(2);
L(`# The combo sweep (${DATE})`);
L();
L(`\`node scripts/sim-combos.mjs ${CREWS} ${FIGHTS} ${DATE}\`. Real fight code, hands-off, no call-ins. Measurement only: nothing here changes a rule, a number or a word, and nothing is tuned.`);
L();
L(`- **Builds swept:** ${builds.length} (moves: ${moves.map((m) => (m ? MOVES[m].name : 'none')).join(', ')}; payloads: ${payloads.map((p) => (p ? PAYLOADS[p].name : 'none')).join(', ')}), so ${COMBOS.length} rows: the baseline, each build alone (on the best combat runner) and every unordered pair (the first build on the best, the second on the next best).`);
L(`- **Crews:** ${CREWS} grown from the toughness sim's \`crewOf\` (4 to 6 runners), ${FIGHTS} fights a crew a job, on ${JOBS.length} jobs: ${JOBS.map((j) => j.name).join('; ')}. Every row plays the same seeds.`);
L(`- **Mixes:** ${Object.keys(MIXES).join(', ')} (armoured: three police and three secforce, one plate each; swarm: six hired; synthetic: five drones, immune to the Vectors; mixed: the job's own plus two drones and two corp).`);
L(`- **Thresholds:** far stronger = clean win more than ${Math.round(FAR_STRONGER * 100)} points above the no-build row on the same mix and risk; worse = more than ${Math.round(WORSE_BY * 100)} points below it. Clean win = won with nobody down.`);
L(`- **Fights played:** ${fightsPlayed}${stopped ? ' (the sweep STOPPED early: see the deaths below)' : ''}.`);
L();

if (stopped) {
  L('## STOPPED: a death on cautious or steady');
  L();
  L('This must never happen (CLAUDE.md, "Design rules"). The sweep stopped at the first one. Do not tune anything from this run: report it.');
  L();
  L('| Risk | Mix | Build | Job | Crew | Fight | Dead |');
  L('| --- | --- | --- | --- | --- | --- | --- |');
  for (const d of deaths) L(`| ${d.risk} | ${d.mix} | ${d.build} | ${d.job} | ${d.crew} | ${d.fight} | ${d.dead.join(', ')} |`);
  L();
  L(`Repeat it: \`node scripts/sim-combos.mjs ${CREWS} ${FIGHTS}\` (the run is deterministic).`);
  writeFileSync(OUT, out.join('\n') + '\n');
  console.log(out.join('\n'));
  process.exit(2);
}

// Flags.
for (const risk of SHOWN_RISKS) for (const mix of Object.keys(MIXES)) {
  const b0 = acc[`${risk}|${mix}|${BASE_LABEL}`];
  for (const combo of COMBOS) {
    if (combo.label === BASE_LABEL) continue;
    const t = acc[`${risk}|${mix}|${combo.label}`];
    const d = t.clean / t.n - b0.clean / b0.n;
    if (d > FAR_STRONGER) flags.push(`FAR STRONGER: **${combo.label}** on ${mix}, ${risk}: clean win ${P(t.clean / t.n)} against ${P(b0.clean / b0.n)} with no build (+${Math.round(d * 100)} points).`);
    if (d < -WORSE_BY) flags.push(`WORSE THAN NO BUILD: **${combo.label}** on ${mix}, ${risk}: clean win ${P(t.clean / t.n)} against ${P(b0.clean / b0.n)} with no build (${Math.round(d * 100)} points).`);
  }
}
for (const p of PIECES) if (Object.values(pieceTotals[p]).every((x) => x === 0)) flags.push(`NEVER FIRES: **${(MOVES[p] ?? PAYLOADS[p]).name}** (\`${p}\`) has a count of zero on every mix (committed, every row that holds it).`);

L('## Flags');
L();
if (!flags.length) L('None: no build is far stronger or weaker than none, no piece is dead, and nobody died on cautious or steady.');
else for (const f of flags) L(`- ${f}`);
L();
L('Deaths on cautious or steady: **none** (every combination, every mix, both risks).');
L();

L('## Each piece\'s own counts (committed, summed over every row that holds it)');
L();
L(`| Piece | ${Object.keys(MIXES).join(' | ')} |`);
L(`| --- | ${Object.keys(MIXES).map(() => '---').join(' | ')} |`);
for (const p of PIECES) L(`| ${(MOVES[p] ?? PAYLOADS[p]).name} | ${Object.keys(MIXES).map((m) => pieceTotals[p][m]).join(' | ')} |`);
L();
L('A count is the piece\'s own lines: a move\'s bounces, a payload\'s infects and spreads (and the shrugs a machine gives it).');

for (const risk of SHOWN_RISKS) for (const mix of Object.keys(MIXES)) {
  L();
  L(`## ${mix}, ${risk}`);
  L();
  L('| Build | Fights | Win | Clean win | Downs a fight | A death | Rounds | HP lost | Bounces | Infects | Spreads | Shrugs |');
  L('| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |');
  for (const combo of COMBOS) {
    const t = acc[`${risk}|${mix}|${combo.label}`];
    L(`| ${combo.label} | ${t.n} | ${P(t.won / t.n)} | ${P(t.clean / t.n)} | ${F2(t.downs / t.n)} | ${P(t.dead / t.n)} | ${(t.rounds / t.n).toFixed(1)} | ${Math.round(t.hp / t.n)} | ${F2(t.bounces / t.n)} | ${F2(t.infects / t.n)} | ${F2(t.spreads / t.n)} | ${F2(t.shrugs / t.n)} |`);
  }
}
writeFileSync(OUT, out.join('\n') + '\n');
console.log(out.slice(0, 40).join('\n'));
console.log(`\nwritten: docs/sims/combos-${DATE}.md (${fightsPlayed} fights)`);
