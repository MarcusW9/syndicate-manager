// How often do the crew's shots miss? (owner, 2026-11-20: "shots that miss too often": measure first, then propose.) MEASURES ONLY.
//
//   node scripts/sim-misses.mjs [seeds=6] [fights a job=20] [date]
//
// Rosters are grown through a real campaign (scripts/sim-wayout.mjs's way) and snapshotted the day reputation reaches each job gate. Every job in
// FIGHT_JOBS then plays its own fight (its type, district, threat; difficulty from core/risk.js rollTarget, as the run's crises use) with the best
// team by combat of the roster at its gate, hands-off, on steady and committed. Every crew attack and Ricochet bounce is counted from the log:
//   miss   the roll failed
//   crack  the roll passed but a plate took all of it (no HP lost): it reads as "nothing happened" to a player too
//   hit    HP came off
// plus the chance the roll had (from the logged die, need and value, the bad-luck softener included), miss streaks a runner, and the share of
// rounds in which every shot the crew fired came to nothing. Enemy shots are counted the same way for comparison.
import { writeFileSync } from 'node:fs';
import { createNewGame } from '../src/core/state.js';
import { autoFounders } from '../tests/play.js';
import { hire, canHire, nextExpansion, expandSafehouse, STARTING_ROSTER_CAP } from '../src/core/recruits.js';
import { primaryStat } from '../src/core/development.js';
import { advanceDay, calendar } from '../src/core/time.js';
import { templateById, jobView, JOB_GATES } from '../src/core/jobs.js';
import { availability } from '../src/core/crew.js';
import { sendOff } from '../src/core/autorun.js';
import { rollTarget } from '../src/core/risk.js';
import * as Fight from '../src/core/fight.js';
import { fightAnswer } from '../src/core/runfight.js';
import { DILEMMAS } from '../src/data/dilemmas.js';
import { FIGHT, FIGHT_JOBS } from '../src/data/fights.js';
import { makeRng, hash } from '../src/core/rng.js';

globalThis.localStorage ??= { getItem: () => null, setItem: () => {}, removeItem: () => {} };
const SEEDS = Number(process.argv[2] ?? 6);
const FIGHTS = Number(process.argv[3] ?? 20);
const DATE = process.argv[4] ?? new Date().toISOString().slice(0, 10);
const OUT = new URL(`../docs/sims/misses-${DATE}.md`, import.meta.url);

const JOBS = Object.keys(FIGHT_JOBS).filter((id) => templateById(id));
const GATES = [...new Set(JOBS.map((j) => JOB_GATES[templateById(j).threat]))].sort((a, b) => a - b);

/** The roster on the first day reputation reaches each gate (sim-wayout.mjs's campaign). */
function grow(seed) {
  let s = createNewGame({ seed, startCrew: 'pick' });
  if (s.founding) s = autoFounders(s);
  const snaps = {};
  for (let day = 0; day < 104 * 7 && Object.keys(snaps).length < GATES.length; day++) {
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
    const x = nextExpansion(s);
    if (s.crew.length >= (s.rosterCap ?? STARTING_ROSTER_CAP) && x && s.cash > x.cost + (wages + s.rent) * 3) s = expandSafehouse(s);
    s = advanceDay(s);
    for (const g of GATES) if (!snaps[g] && (s.reputation ?? 0) >= g) snaps[g] = { week: Math.ceil((day + 1) / 7), crew: structuredClone(s.crew) };
  }
  return snaps;
}

/** The team: the job's crew size, best combat first, with a tech for a hack and a medic if the roster has one to spare. */
function teamOf(crew, tpl) {
  const byCombat = [...crew].sort((a, b) => b.stats.combat - a.stats.combat || a.id.localeCompare(b.id));
  const team = [];
  const want = (pred) => { const o = byCombat.find((x) => pred(x) && !team.includes(x)); if (o && team.length < tpl.crewSize) team.push(o); };
  if (FIGHT_JOBS[tpl.id] === 'holdHack') want((o) => o.role === 'tech');
  if (tpl.crewSize >= 3) want((o) => o.role === 'medic');
  for (const o of byCombat) if (team.length < tpl.crewSize && !team.includes(o)) team.push(o);
  return team;
}

const fresh = () => ({ shots: 0, miss: 0, crack: 0, hit: 0, chance: 0, foeShots: 0, foeHits: 0, rounds: 0, blankRounds: 0, fights: 0, streak3: 0, streak4: 0, longest: 0, softened: 0, won: 0 });
const chanceOf = (r) => Math.min(1, Math.max(0, (21 - (r.need - r.value)) / 20));

function play(args, seed, tag, t) {
  const b = Fight.buildFight({ ...args, watched: true }, makeRng(hash('mb', tag, seed)));
  const rng = makeRng(hash('mp', tag, seed));
  const run = {}; const worst = {};
  let s3 = false, s4 = false;
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
    let fired = 0, landed = 0;
    for (const l of rr.lines) {
      if (l.kind === 'attack' && l.roll) {
        fired++; t.shots++; t.chance += chanceOf(l.roll);
        if (l.roll.value > (b.runners.find((r) => r.id === l.actor)?.stats.combat?.value ?? l.roll.value)) t.softened++;
        if (!l.success) { t.miss++; run[l.actor] = (run[l.actor] ?? 0) + 1; worst[l.actor] = Math.max(worst[l.actor] ?? 0, run[l.actor]); }
        else { run[l.actor] = 0; if (l.damage > 0) { t.hit++; landed++; } else t.crack++; }
      } else if (l.kind === 'shot') { t.foeShots++; if (l.success) t.foeHits++; }
    }
    if (fired) { t.rounds++; if (!landed) t.blankRounds++; }
  }
  if (!b.end) Fight.playFight(b, rng);
  const longest = Math.max(0, ...Object.values(worst));
  t.fights++; t.won += b.end?.result === 'won'; t.longest += longest; t.streak3 += longest >= 3; t.streak4 += longest >= 4;
}

const rosters = [];
for (let seed = 1; seed <= SEEDS; seed++) { rosters.push({ seed, snaps: grow(seed) }); process.stderr.write(`grown ${seed}/${SEEDS}\r`); }
const RISKS = ['steady', 'committed'];
const byJob = {}; const byThreat = {}; const byCombat = {}; const all = Object.fromEntries(RISKS.map((r) => [r, fresh()]));
const merge = (into, t) => { for (const k of Object.keys(t)) into[k] += t[k]; };
const reached = {};
for (const id of JOBS) {
  const tpl = templateById(id);
  const gate = JOB_GATES[tpl.threat];
  for (const risk of RISKS) {
    const t = fresh();
    for (const { seed, snaps } of rosters) {
      const snap = snaps[gate]; if (!snap) continue;
      if (risk === 'steady') reached[tpl.threat] = (reached[tpl.threat] ?? new Set()).add(seed);
      const team = teamOf(snap.crew, tpl);
      const args = { type: FIGHT_JOBS[id], diff: Fight.fightDiff(rollTarget(tpl)), threat: tpl.threat, site: tpl.district, opposition: tpl.opposition ?? null, job: id, crew: team, approach: 'loud', risk };
      for (let i = 0; i < FIGHTS; i++) {
        const one = fresh();
        play(args, seed, `${id}|${risk}|${i}`, one);
        merge(t, one);
        if (risk === 'steady') { const c = Math.max(...team.map((o) => o.stats.combat)); const k = c >= 16 ? '16+' : c >= 13 ? '13-15' : c >= 10 ? '10-12' : 'under 10'; merge(byCombat[k] ??= fresh(), one); }
      }
    }
    byJob[`${risk}|${id}`] = t; merge(all[risk], t); merge(byThreat[`${risk}|${tpl.threat}`] ??= fresh(), t);
  }
}

const P = (n, d) => (d ? `${Math.round((100 * n) / d)}%` : '-');
const row = (label, t) => `| ${label} | ${t.fights} | ${t.shots} | **${P(t.miss, t.shots)}** | ${P(t.crack, t.shots)} | ${P(t.hit, t.shots)} | ${P(t.chance, t.shots)} | ${P(t.blankRounds, t.rounds)} | ${(t.longest / Math.max(1, t.fights)).toFixed(1)} | ${P(t.streak3, t.fights)} | ${P(t.streak4, t.fights)} | ${P(t.foeHits, t.foeShots)} | ${P(t.won, t.fights)} |`;
const HEAD = '| | Fights | Crew shots | Miss | Crack (no HP) | Hit | Roll chance | Rounds with nothing landed | Longest miss run a fight | A run of 3+ misses | 4+ | Enemy shots that hit | Won |\n| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |';
const out = [];
const L = (s = '') => out.push(s);
L(`# How often the crew's shots miss (${DATE})`);
L();
L(`\`node scripts/sim-misses.mjs ${SEEDS} ${FIGHTS} ${DATE}\`. Measurement only: nothing changes. Real fight code, hands-off, every job in \`FIGHT_JOBS\` (${JOBS.length}), each with the best team by combat (a tech on a hack, a medic on a team of 3 or more) of a campaign roster grown to the job's gate (${SEEDS} campaigns), ${FIGHTS} fights a roster a job a risk. Difficulty: \`fightDiff(rollTarget(job))\`, the crises' own. Campaigns reaching each threat's gate: ${Object.entries(reached).map(([k, v]) => `threat ${k} ${v.size}/${SEEDS}`).join(', ')}.`);
L();
L('- **Miss:** the roll failed. **Crack:** the roll passed but a plate took it all (no HP off). **Hit:** HP came off.');
L(`- **Roll chance:** the average chance the rolls had, the bad-luck softener included (+${FIGHT.missBonus} a miss in a row, to +${FIGHT.missBonusCap}). Today's rule: d20 + combat (+ softener) against 10 + difficulty ${FIGHT.attackStep} + cover (half ${FIGHT.cover.half}, full ${FIGHT.cover.full}).`);
L('- **Rounds with nothing landed:** rounds in which the crew fired at least once and took no HP off anyone.');
L();
L('## Overall');
L();
L(HEAD);
for (const r of RISKS) L(row(r, all[r]));
L();
L('## By threat (steady)');
L();
L(HEAD);
for (const th of [1, 2, 3, 4, 5]) if (byThreat[`steady|${th}`]) L(row(`threat ${th}`, byThreat[`steady|${th}`]));
L();
L("## By the team's best combat (steady)");
L();
L(HEAD);
for (const k of ['under 10', '10-12', '13-15', '16+']) if (byCombat[k]) L(row(k, byCombat[k]));
L();
L('## Every job (steady), most misses first');
L();
L(HEAD.replace('| |', '| Job (threat, type) |'));
for (const id of [...JOBS].sort((a, b) => byJob[`steady|${b}`].miss / Math.max(1, byJob[`steady|${b}`].shots) - byJob[`steady|${a}`].miss / Math.max(1, byJob[`steady|${a}`].shots))) {
  const t = byJob[`steady|${id}`]; if (!t.fights) continue;
  L(row(`${id} (${templateById(id).threat}, ${FIGHT_JOBS[id].replace('hold', '').toLowerCase()})`, t));
}
L();
writeFileSync(OUT, out.join('\n'));
console.log(`wrote ${OUT.pathname}`);
