// The Cytotoxic sweep (owner, 2026-11-20): which way should the Cytotoxic Vector scale so it has a reason to be picked over the Contagion Vector,
// alone and with Ricochet? MEASURES ONLY: the variants below are added to PAYLOADS inside this script, never in the game's data, and the engine's
// dot hooks they use (`dot.stack`, `dot.scale`, `dot.grow`, core/fight.js `put`) are switched off for every payload the game ships.
//
//   node scripts/sim-cytotoxic.mjs [crews=10] [fights a crew a job=20] [date]
//
// Builds: no build; Ricochet alone; then for each vector (today's Cytotoxic, its five variants, and Contagion as the bar to beat): the vector
// alone on the best combat runner, Ricochet + the vector on the best, and Ricochet + the vector on the best two. Same crews and seeds every row
// (scripts/sim-combos.mjs's crews). Cautious, steady and committed are all played; a death on cautious or steady stops the sweep and exits 2.
import { writeFileSync } from 'node:fs';
import { createNewGame } from '../src/core/state.js';
import * as Fight from '../src/core/fight.js';
import { FIGHT_JOBS } from '../src/data/fights.js';
import { PAYLOADS } from '../src/data/builds.js';
import { makeRng } from '../src/core/rng.js';

globalThis.localStorage ??= { getItem: () => null, setItem: () => {}, removeItem: () => {} };
const CREWS = Number(process.argv[2] ?? 10);
const FIGHTS = Number(process.argv[3] ?? 20);
const DATE = process.argv[4] ?? new Date().toISOString().slice(0, 10);
const OUT = new URL(`../docs/sims/cytotoxic-${DATE}.md`, import.meta.url);

// The variants (sim-only). Each is today's Cytotoxic with one change to its `dot`.
const cyto = PAYLOADS.cytotoxic;
const VARIANTS = {
  cyto_stack: { name: 'Cyto: stacks x3', dot: { tick: 10, rounds: null, stack: 3 }, note: 'a fresh damaging hit on a body it ticks adds +10 a round, to 30' },
  cyto_15: { name: 'Cyto: tick 15', dot: { tick: 15, rounds: null }, note: 'a flat 15 HP a round' },
  cyto_20: { name: 'Cyto: tick 20', dot: { tick: 20, rounds: null }, note: 'a flat 20 HP a round' },
  cyto_med: { name: 'Cyto: by Medical', dot: { tick: 10, rounds: null, scale: { stat: 'medical', from: 6, step: 4, per: 5, cap: 20 } }, note: '10 HP at Medical 6-9, 15 at 10-13, 20 at 14+' },
  cyto_grow: { name: 'Cyto: grows +5', dot: { tick: 10, rounds: null, grow: { per: 5, cap: 30 } }, note: '10, then 15, 20 ... to 30, each tick' },
};
for (const [id, v] of Object.entries(VARIANTS)) PAYLOADS[id] = { ...cyto, id, name: v.name, dot: v.dot };
const VECTORS = [['cytotoxic', 'Cyto: today', '10 HP a round until it falls (the game today)'], ...Object.entries(VARIANTS).map(([id, v]) => [id, v.name, v.note]), ['contagion', 'Contagion', '10 HP a round for 2 rounds; jumps when the host falls (the game today)']];

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
const bestTwo = (crew) => crew.map((op, i) => ({ i, c: op.stats.combat })).sort((a, b) => b.c - a.c || a.i - b.i).slice(0, 2).map((x) => x.i);

const JOBS = [
  { name: 'warehouse (docks, threat 4)', args: { type: FIGHT_JOBS.warehouse, diff: 12, threat: 4, site: 'docks', approach: 'loud' } },
  { name: 'data_pull (heights, threat 3)', args: { type: FIGHT_JOBS.data_pull, diff: 12, threat: 3, site: 'heights', approach: 'loud' } },
];
const swap = (kinds) => (b, rng) => { b.enemies.length = 0; b.hiredTotal = {}; for (const k of kinds) Fight.newEnemy(b, k, rng); };
// "Threat 5" plays each job at threat 5 (toughness +5 HP); "heavy" is the toughest bodies the game has, six of them.
const MIXES = {
  "the job's own": { fill: () => {} },
  'threat 5': { fill: () => {}, threat: 5 },
  heavy: { fill: swap(['enforcer', 'enforcer', 'enforcer', 'corp', 'corp', 'corp']) },
  armoured: { fill: swap(['police', 'police', 'secforce', 'secforce', 'drone', 'drone']) },
  swarm: { fill: swap(['hired', 'hired', 'hired', 'hired', 'hired', 'hired']) },
  mixed: { fill: (b, rng) => { for (const k of ['drone', 'drone', 'corp', 'corp']) Fight.newEnemy(b, k, rng); } },
};

// The rows: [label, build on the best, build on the second best, vector id or null].
const ROWS = [['no build', null, null, null], ['Ricochet', { move: 'ricochet' }, null, null]];
for (const [id, name] of VECTORS) {
  ROWS.push([name, { payload: id }, null, id]);
  ROWS.push([`Ricochet + ${name}`, { move: 'ricochet', payload: id }, null, id]);
  ROWS.push([`Ricochet + ${name}, x2`, { move: 'ricochet', payload: id }, { move: 'ricochet', payload: id }, id]);
}
const given = (crew, a, b2) => { const [f, s] = bestTwo(crew); return crew.map((op, i) => (i === f && a ? { ...op, build: { ...a } } : i === s && b2 ? { ...op, build: { ...b2 } } : op)); };

function play(args, mix, seed, tag) {
  const m = MIXES[mix];
  const b = Fight.buildFight({ ...args, ...(m.threat ? { threat: m.threat } : {}), watched: true }, makeRng(seed * 7 + tag));
  m.fill(b, makeRng(seed * 13 + tag));
  const rng = makeRng(seed * 31 + tag);
  let tickHp = 0, tickKills = 0, stacked = 0, infects = 0, spreads = 0;
  while (!b.end && b.round < 30) {
    for (const l of Fight.playRound(b, rng).lines) {
      if (l.kind === 'tick' && l.status === 'infected') { tickHp += l.damage; if (l.dropped) tickKills++; }
      else if (l.key === 'infect') { if (l.stacked) stacked++; else infects++; }
      else if (l.key === 'spread') spreads++;
    }
  }
  if (!b.end) Fight.playFight(b, rng);
  const won = b.end?.result === 'won';
  const downs = b.runners.filter((r) => r.down || r.dead).length;
  return { won, clean: won && downs === 0, downs, dead: b.runners.filter((r) => r.dead).map((r) => r.handle), rounds: b.round, hp: b.hpLost, tickHp, tickKills, stacked, infects, spreads };
}

const RISKS = ['cautious', 'steady', 'committed'];
const acc = {};
const deaths = [];
let played = 0;
const t0 = Date.now();
sweep: for (const risk of RISKS) for (const mix of Object.keys(MIXES)) for (const [label, a, b2] of ROWS) {
  const t = acc[`${risk}|${mix}|${label}`] = { n: 0, won: 0, clean: 0, downs: 0, dead: 0, rounds: 0, hp: 0, tickHp: 0, tickKills: 0, stacked: 0, infects: 0, spreads: 0 };
  for (const job of JOBS) for (let c = 0; c < CREWS; c++) {
    const crew = given(crewOf(9000 + c, 4 + (c % 3)), a, b2);
    for (let i = 0; i < FIGHTS; i++) {
      const r = play({ ...job.args, crew, risk }, mix, c * 1000 + i + 1, JOBS.indexOf(job) + 1);
      played++;
      t.n++; t.won += r.won; t.clean += r.clean; t.downs += r.downs; t.dead += r.dead.length > 0; t.rounds += r.rounds; t.hp += r.hp;
      for (const k of ['tickHp', 'tickKills', 'stacked', 'infects', 'spreads']) t[k] += r[k];
      if (r.dead.length && risk !== 'committed') { deaths.push({ risk, mix, label, job: job.name, crew: c, fight: i, dead: r.dead }); break sweep; }
    }
  }
}

const P = (x) => `${Math.round(x * 100)}%`;
const F1 = (x) => x.toFixed(1);
const out = [];
const L = (s = '') => out.push(s);
L(`# Sim: how the Cytotoxic Vector should scale (${DATE})`);
L();
L('Owner, 2026-11-20: Contagion matches or beats Cytotoxic everywhere, so Cytotoxic should scale to deal more damage over time. It has no spread, but paired with Ricochet (one round through up to three targets, once a fight) it might do better. Measurement only: the variants exist only inside `scripts/sim-cytotoxic.mjs`.');
L();
L(`- **Fights played:** ${played} (${CREWS} crews of 4 to 6, ${FIGHTS} fights a crew a job, 2 jobs: ${JOBS.map((j) => j.name).join('; ')}); ${Math.round((Date.now() - t0) / 1000)} s.`);
L('- **Builds go to** the best combat runner (and the second best in the "x2" rows). Their Medical is 6 to 14 (the sim crews), so "by Medical" plays all three of its steps.');
L(`- **Mixes:** ${Object.keys(MIXES).join(', ')}. Threat 5: each job at threat 5 (+5 HP a body). Heavy: three enforcers and three corp (20 HP each, 25 at threat 4). Armoured: two police, two secforce, two drones (plates; drones are immune to both vectors). Swarm: six hired (10 HP). Mixed: the job's own plus two drones and two corp.`);
L('- **Clean win** = won with nobody down. **Tick HP** = HP the infection dealt a fight; **tick kills** = bodies the tick itself finished, a fight.');
L();
L('## The vectors');
L();
L('| Vector | What it does |');
L('| --- | --- |');
for (const [, name, note] of VECTORS) L(`| ${name} | ${note} |`);
L();
if (deaths.length) {
  L('## STOPPED: a death on cautious or steady');
  L();
  for (const d of deaths) L(`- ${d.risk}, ${d.mix}, ${d.label}, ${d.job}, crew ${d.crew}, fight ${d.fight}: ${d.dead.join(', ')}`);
  L();
}
// The headline: each mix, steady and committed, clean win per vector in its three placements, with Contagion's for comparison.
for (const risk of ['steady', 'committed']) {
  L(`## Clean wins, ${risk}`);
  L();
  const mixes = Object.keys(MIXES);
  L(`| Build | ${mixes.join(' | ')} |`);
  L(`| --- | ${mixes.map(() => '---:').join(' | ')} |`);
  for (const [label] of ROWS) L(`| ${label} | ${mixes.map((m) => { const t = acc[`${risk}|${m}|${label}`]; return t?.n ? P(t.clean / t.n) : '-'; }).join(' | ')} |`);
  L();
}
L('## What the infection did, steady (a fight)');
L();
L('| Build | Mix | Clean win | Won | Downs | Rounds | Tick HP | Tick kills | Infects | Stacks added | Jumps |');
L('| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |');
for (const mix of Object.keys(MIXES)) for (const [label, , , v] of ROWS) {
  if (!v && label !== 'Ricochet' && label !== 'no build') continue;
  const t = acc[`steady|${mix}|${label}`]; if (!t?.n) continue;
  L(`| ${label} | ${mix} | ${P(t.clean / t.n)} | ${P(t.won / t.n)} | ${F1(t.downs / t.n)} | ${F1(t.rounds / t.n)} | ${F1(t.tickHp / t.n)} | ${(t.tickKills / t.n).toFixed(2)} | ${(t.infects / t.n).toFixed(2)} | ${(t.stacked / t.n).toFixed(2)} | ${(t.spreads / t.n).toFixed(2)} |`);
}
L();
L('## Committed deaths (a share of fights with a death)');
L();
L(`| Build | ${Object.keys(MIXES).join(' | ')} |`);
L(`| --- | ${Object.keys(MIXES).map(() => '---:').join(' | ')} |`);
for (const [label] of ROWS) L(`| ${label} | ${Object.keys(MIXES).map((m) => { const t = acc[`committed|${m}|${label}`]; return t?.n ? `${(100 * t.dead / t.n).toFixed(1)}%` : '-'; }).join(' | ')} |`);
L();
writeFileSync(OUT, out.join('\n'));
console.log(`wrote ${OUT.pathname} (${played} fights)${deaths.length ? ' STOPPED: death on cautious/steady' : ''}`);
if (deaths.length) process.exit(2);
