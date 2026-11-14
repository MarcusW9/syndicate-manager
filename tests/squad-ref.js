// The board's squad search as it was before it was pruned (2026-11-14), kept for tests only: tests/squadsearch.test.js
// checks the pruned search in src/core/squad.js (exact) gives the same approach, picks and level as this one. Never imported by
// the game. Plays every candidate's fights in full, so it is slow; use it on a few states.
import { ZONE_POOLS, OFF_APPROACH } from '../src/data/incidents.js';
import { incidentById, incidentDifficulty, handlerFor, bestSave } from '../src/core/incidents.js';
import { overwatchKit, kitsFor } from '../src/core/gear.js';
import { crewRoll, effectiveStat, APPROACHES } from '../src/core/crew.js';
import { successChance, riskLabel, rollTarget, assessJob } from '../src/core/risk.js';
import { availability, MAX_EXTRA_CREW, maxCrew } from '../src/core/crew.js';
import { jobView } from '../src/core/jobs.js';
import { intelFor } from '../src/core/sidetasks.js';
import { WATCHED_PENALTY, watchedIn } from '../src/core/heat.js';
import { overwatchOf, buildBattle, playRound } from '../src/core/battle.js';
import { fightDiff, buildFight, playFight, oddsKey } from '../src/core/fight.js';
import { makeRng, hash } from '../src/core/rng.js';
import { BATTLE } from '../src/data/battle.js';
import { FIGHT } from '../src/data/fights.js';
import { FIGHT_JOBS } from '../src/data/fights.js';
import { spotsForJob } from '../src/core/fightspots.js';
import { crewValue } from '../src/core/worth.js';

// The odds as they were played before (every fight of every candidate, in one go), with caches of their own, so the
// comparison never reads odds the new code wrote.
const FIGHT_STATS = ['combat', 'cool', 'medical', 'social', 'tech'];
const battleCache = new Map();
function battleOdds(args) {
  const b0 = buildBattle(args);
  const key = JSON.stringify([b0.diff, b0.ambush, b0.guards, b0.runners.map((r) => [r.hp, r.max, r.armour, r.damage, r.pierce, r.patch, r.cover, FIGHT_STATS.map((s) => r.stats[s].value)]), b0.overwatch && [b0.overwatch.value, b0.overwatch.damage, b0.overwatch.left], b0.wheels?.value]);
  if (battleCache.has(key)) return battleCache.get(key);
  const n = { win: 0, down: 0, standoff: 0 };
  if (!b0.runners.length) return { win: 0, down: 1, standoff: 0 };
  for (let i = 0; i < BATTLE.oddsRuns; i++) {
    const b = structuredClone(b0);
    const rng = makeRng(0x5eed + i * 7919);
    let end = 'standoff';
    while (b.round < (b.cap ?? BATTLE.rounds)) {
      const r = playRound(b, rng);
      if (r.down.length) { end = 'down'; break; }
      if (!b.guards.filter((g) => !g.out).length) { end = 'win'; break; }
    }
    n[end] += 1;
  }
  const out = { win: n.win / BATTLE.oddsRuns, down: n.down / BATTLE.oddsRuns, standoff: n.standoff / BATTLE.oddsRuns };
  battleCache.set(key, out);
  return out;
}
const fightCache = new Map();
function fightOdds(b0, runs = FIGHT.oddsRuns) {
  if (!b0.runners.length) return { win: 0, down: 1, dead: 0, left: 0, lost: 0 };
  const key = oddsKey(b0, runs);
  if (fightCache.has(key)) return fightCache.get(key);
  const n = { win: 0, down: 0, dead: 0, left: 0, lost: 0 };
  for (let i = 0; i < runs; i++) {
    const b = structuredClone(b0);
    b.showcaseSeed = hash('odds', i);
    playFight(b, makeRng(0x5eed + i * 7919));
    if (b.end.result === 'won') n.win += 1;
    if (b.runners.some((r) => r.down || r.dead)) n.down += 1;
    if (b.runners.some((r) => r.dead)) n.dead += 1;
    if (b.left.length) n.left += 1;
    if (b.runners.some((r) => r.dead) || b.left.length) n.lost += 1;
  }
  const out = { win: n.win / runs, down: n.down / runs, dead: n.dead / runs, left: n.left / runs, lost: n.lost / runs };
  fightCache.set(key, out);
  return out;
}
function fightOddsFor(args, { builds = 6, runs = 20 } = {}) {
  const acc = { win: 0, down: 0, dead: 0, left: 0, lost: 0 };
  if (!args.crew.length) return { win: 0, down: 1, dead: 0, left: 0, lost: 0 };
  for (let i = 0; i < builds; i++) {
    const r = fightOdds(buildFight(args, makeRng(0xf1647 + i * 104729)), runs);
    for (const k of Object.keys(acc)) acc[k] += r[k] / builds;
  }
  return acc;
}

const ZONE_NOTE = { in: 'The way in', inside: 'Inside', target: 'The target' };
const RISK_ORDER = ['low', 'moderate', 'high', 'extreme'];
/** The most risk Joss accepts to keep a more valuable runner home (2026-11-05); never past the best read if that's worse. */
const JOSS_ACCEPTS = 'moderate';
const worstRisk = (levels) => levels.reduce((a, b) => (RISK_ORDER.indexOf(b) > RISK_ORDER.indexOf(a) ? b : a), 'low');

/** Every incident this approach can meet, zone by zone, once each: [{ id, zone, sometimes }]. */
function likelyIncidents(approach) {
  const rows = [];
  for (const zone of ['in', 'inside', 'target']) {
    for (const id of ZONE_POOLS[zone][approach] ?? []) if (!rows.some((r) => r.id === id)) rows.push({ id, zone, sometimes: false });
  }
  if (approach !== 'loud' && !rows.some((r) => r.id === OFF_APPROACH.incident)) rows.push({ id: OFF_APPROACH.incident, zone: 'inside', sometimes: true });
  return rows;
}

/**
 * The coverage read: for each likely incident, who would handle it, their odds, and (for danger)
 * the odds once the best save is counted and, if that fails too, how the fight goes (slice 6:
 * core/battle.js battleOdds, the run's own round function). crew: the inside team (operatives).
 * overwatch: { op, kit } (only counts if they carry that kit). wheels: the driver in the van.
 * jobId: the job's id, so each fight is read on the spots the run will use (its site comes from
 * the id; core/fightspots.js spotsForJob). Without it, everyone stands in half cover.
 * Returns { rows, spotted, toughest }.
 */
export function coverageRef(template, crew, approach, { threat = template.threat, overwatch = null, intel = null, wheels = null, jobId = null } = {}) {
  const am = { threat, alert: 0 };
  const kit = overwatch?.op ? overwatchKit(overwatch.op, overwatch.kit) : null;
  const ow = kit ? { kit: overwatch.kit, left: kit.uses } : null;
  // The five jobs' fights (engine 2) are read from these arguments: the coverage rows and the plan screen's fight block (ui/fightscreen.js) share them.
  const fightArgs = (diff, zone) => ({ type: FIGHT_JOBS[template.id], diff: fightDiff(diff), threat, site: template.district, crew, approach, overwatch: ow ? overwatchOf(overwatch.op, ow, zone) : null, wheels: wheels ? { id: wheels.id, handle: wheels.handle, value: effectiveStat(wheels, 'piloting', { approach }).value } : null });
  const rows = likelyIncidents(approach).map(({ id, zone, sometimes }) => {
    const inc = incidentById(id);
    const diff = incidentDifficulty(template, am, inc);
    const base = { id, name: inc.name, zone, where: sometimes ? 'Sometimes, inside' : ZONE_NOTE[zone], danger: !!inc.danger, diff };
    const h = crew.length ? handlerFor(crew, inc, diff, { approach, recommended: template.crewSize, intel }) : null;
    if (!h) return { ...base, handler: null, chance: 0, risk: 'extreme', withSave: null, effective: 'extreme', gap: true };
    const save = inc.danger ? bestSave({ victim: h.roll.op, able: crew, overwatch: ow, overwatchOp: ow ? overwatch.op : null, zone, diff }) : null;
    // Unsaved danger becomes a fight: a fight won with nobody at death's door counts as getting
    // through. On a loud run it is a fight whatever the roll (core/battle.js loudFightDue), and
    // winning the roll means the crew gets the jump on the guards (the ambush odds).
    const spots = jobId && inc.danger && inc.guards ? spotsForJob(template.district, jobId, template.id, zone, crew.length) : null;
    const fargs = { incident: id, zone, diff, threat, guards: inc.guards, crew, approach, overwatchOp: ow ? overwatch.op : null, ow, wheels, spots };
    const forced = approach === 'loud' && Boolean(inc.danger && inc.guards);
    // The five jobs of the battle rework play their fights on engine 2: the read runs that engine on the same orders (shown = used);
    // the line-up is drawn when the run starts, so it is averaged over several (core/fight.js fightOddsFor). No ambush there yet.
    const type = FIGHT_JOBS[template.id];
    const odds = (extra = {}) => (type
      ? { standoff: 0, ...fightOddsFor(fightArgs(diff, zone)) }
      : battleOdds({ ...fargs, ...extra }));
    let fight = inc.danger && inc.guards ? odds() : null;
    if (forced) {
      const jump = odds({ ambush: true });
      const mix = (k) => h.chance * jump[k] + (1 - h.chance) * fight[k];
      fight = { win: mix('win'), down: mix('down'), standoff: mix('standoff') };
    }
    const missed = forced ? 1 : save ? (1 - h.chance) * (1 - save.chance) : 1 - h.chance;
    const eff = 1 - missed * (fight ? 1 - fight.win : 1);
    return {
      ...base,
      handler: { op: h.roll.op, stat: h.stat, value: h.roll.value, notes: h.roll.notes },
      chance: h.chance, risk: riskLabel(h.chance),
      withSave: save ? { via: save.via, op: save.op, chance: save.chance } : null,
      fight: fight ? { ...fight, chance: missed, forced } : null,
      effective: riskLabel(eff), gap: riskLabel(eff) === 'extreme',
    };
  });
  const spotted = APPROACHES[approach]?.detect && crew.length > template.crewSize ? crew.length - template.crewSize : 0;
  const first = rows.find((r) => r.fight);
  return { rows, spotted, toughest: worstRisk(rows.map((r) => r.effective)), fight2: FIGHT_JOBS[template.id] && first && crew.length ? fightArgs(first.diff, first.zone) : null };
}

/** How well a squad covers a job: the mean effective odds over the likely incidents and the job's key stats. */
function squadScore(template, crew, approach, overwatch, threat) {
  if (!crew.length) return 0;
  const { rows } = coverageRef(template, crew, approach, { threat, overwatch });
  const odds = rows.map((r) => (r.handler ? 1 - (r.fight ? r.fight.chance * (1 - r.fight.win) : (1 - r.chance) * (1 - (r.withSave?.chance ?? 0))) : 0));
  const target = rollTarget({ ...template, threat });
  for (const stat of template.keyStats) {
    const roll = crewRoll(crew, stat, { approach, recommended: template.crewSize });
    odds.push(roll ? successChance(roll.value, target) : 0);
  }
  return odds.reduce((a, b) => a + b, 0) / odds.length;
}

/**
 * Joss's picks: an inside team of the recommended size and an overwatch (someone carrying a rifle
 * or a drone), chosen one at a time
 * for the best coverage, from the operatives given (free crew; freelancers cost a cut, so Joss
 * leaves them to you). Overwatch only if it helps; Wheels if the job can need piloting and they'd
 * out-drive the team; standby from whoever's left. Returns { crew, overwatch, kit, wheels, standby }.
 */
export function jossPicksRef(template, candidates, approach, { threat = template.threat } = {}) {
  const team = [];
  const pool = [...candidates];
  while (team.length < template.crewSize && pool.length) {
    let best = null;
    for (const op of pool) {
      const s = squadScore(template, [...team, op], approach, null, threat);
      if (!best || s > best.s) best = { op, s };
    }
    team.push(best.op);
    pool.splice(pool.indexOf(best.op), 1);
  }
  const without = squadScore(template, team, approach, null, threat);
  let over = null;
  for (const op of pool) {
    for (const kit of kitsFor(op)) {
      const s = squadScore(template, team, approach, { op, kit }, threat);
      if (s > without + 0.005 && (!over || s > over.s)) over = { op, kit, s };
    }
  }
  if (over) pool.splice(pool.indexOf(over.op), 1);
  // Wheels: the best driver left, on jobs where piloting can come up and they'd beat the team at it.
  const drives = template.crises?.some((c) => c.choices.some((ch) => ch.stat === 'piloting'));
  const teamPiloting = Math.max(0, ...team.map((o) => effectiveStat(o, 'piloting', { approach }).value));
  const driver = drives ? [...pool].sort((a, b) => b.stats.piloting - a.stats.piloting)[0] : null;
  const wheels = driver && effectiveStat(driver, 'piloting', { approach }).value > teamPiloting ? driver : null;
  if (wheels) pool.splice(pool.indexOf(wheels), 1);
  // Standby: whoever left would be most use coming in at a bad moment (a fighter, then a medic).
  const standby = [...pool].sort((a, b) => (b.stats.combat + b.stats.medical / 2) - (a.stats.combat + a.stats.medical / 2))[0] ?? null;
  return { crew: team.map((o) => o.id), overwatch: over?.op.id ?? null, kit: over?.kit ?? null, wheels: wheels?.id ?? null, standby: standby?.id ?? null };
}

/**
 * The read the planning screen shows for a plan: the worse of the crises read (assessJob) and the
 * incidents (coverage). One function for the planner and the job board, so they always agree.
 * plan: { crew: [op], approach, overwatch: op | null, kit, wheels: op | null }.
 * Returns { level, read, cov }.
 */
export function planReadRef(state, job, { crew, approach, overwatch = null, kit = null, wheels = null }) {
  const v = jobView(state, job);
  const tpl = { ...v.tpl, threat: v.threat };
  const intel = intelFor(state, v.tpl.district, v.inside);
  const read = assessJob(tpl, crew, approach, { watched: watchedIn(state, v.tpl.district) ? WATCHED_PENALTY : 0, intel, wheels });
  const owKit = overwatch && (kitsFor(overwatch).includes(kit) ? kit : kitsFor(overwatch)[0]);
  const cov = coverageRef(tpl, crew, approach, { threat: v.threat, overwatch: owKit ? { op: overwatch, kit: owKit } : null, intel, wheels, jobId: job.id });
  const level = crew.length && RISK_ORDER.indexOf(cov.toughest) > RISK_ORDER.indexOf(read.level) ? cov.toughest : read.level;
  return { level, read, cov };
}

/**
 * Joss's squad for a job and approach: the smallest squad that gets the best risk level (owner's
 * call, 2026-10-28). Starts from jossPicks' inside team of the recommended size; overwatch and
 * Wheels (alone or together) and up to MAX_EXTRA_CREW extras inside go only if they lower the risk
 * level the planner shows: the lowest level wins, then the fewest people.
 * Standby never changes that read (it only matters once something goes wrong), so Joss leaves it
 * to the player. Everyone sent gets tired and can get hurt, and isn't free for other work.
 * Returns { crew, overwatch, kit, wheels, standby: null, level }.
 */
export function leanPicksRef(state, job, approach) {
  const v = jobView(state, job);
  const tpl = { ...v.tpl, threat: v.threat };
  const free = state.crew.filter((op) => availability(state, op).ok);
  const byId = (id) => free.find((o) => o.id === id) ?? null;
  const base = jossPicksRef(tpl, free, approach, { threat: v.threat });
  const rank = (sq) => RISK_ORDER.indexOf(planReadRef(state, job, { ...sq, approach }).level);
  const people = (sq) => sq.crew.length + (sq.overwatch ? 1 : 0) + (sq.wheels ? 1 : 0);
  // Every mix of overwatch and the van (they can help together where neither does alone), then
  // extras inside, one at a time, each only if it lowers the risk. Keep the lowest risk, then the fewest people.
  let squad = null;
  let best = Infinity;
  for (const overwatch of [null, byId(base.overwatch)].filter((o, i) => i === 0 || o)) {
    for (const wheels of [null, byId(base.wheels)].filter((o, i) => i === 0 || o)) {
      const sq = { crew: base.crew.map(byId), overwatch, kit: base.kit, wheels };
      let r = rank(sq);
      for (let n = 0; n < MAX_EXTRA_CREW && sq.crew.length >= tpl.crewSize; n++) {
        const left = free.filter((o) => !sq.crew.includes(o) && o !== sq.overwatch && o !== sq.wheels);
        let pick = null;
        for (const op of left) {
          const rr = rank({ ...sq, crew: [...sq.crew, op] });
          if (rr < r && (!pick || rr < pick.r)) pick = { op, r: rr };
        }
        if (!pick) break;
        r = pick.r;
        sq.crew = [...sq.crew, pick.op];
      }
      if (!squad || r < best || (r === best && people(sq) < people(squad))) { squad = sq; best = r; }
    }
  }
  // The cheapest crew Joss trusts with it (2026-11-05, after the playtest's "I mostly sent whoever
  // was best"): each inside runner, most valuable first, is swapped for the least valuable free
  // runner who keeps the read at the best level or JOSS_ACCEPTS, whichever is riskier, so stars stay
  // free for work that needs them. Then any extra who no longer earns their place goes.
  const accept = Math.max(best, RISK_ORDER.indexOf(JOSS_ACCEPTS));
  const inSquad = (op) => squad.crew.includes(op) || op === squad.overwatch || op === squad.wheels;
  for (const member of [...squad.crew].sort((a, b) => crewValue(b) - crewValue(a))) {
    const cheaper = free.filter((o) => !inSquad(o) && crewValue(o) < crewValue(member)).sort((a, b) => crewValue(a) - crewValue(b));
    for (const op of cheaper) {
      const crew = squad.crew.map((o) => (o === member ? op : o));
      if (rank({ ...squad, crew }) <= accept) { squad.crew = crew; break; }
    }
  }
  while (squad.crew.length > tpl.crewSize && rank({ ...squad, crew: squad.crew.slice(0, -1) }) <= accept) squad.crew = squad.crew.slice(0, -1);
  return { crew: squad.crew.map((o) => o.id), overwatch: squad.overwatch?.id ?? null, kit: squad.kit, wheels: squad.wheels?.id ?? null, standby: null, level: RISK_ORDER[rank(squad)] };
}

/**
 * Joss's read for the job board: if this job went today, with whoever is free, which approach and
 * squad would Joss pick (leanPicks), and how risky is it? Tries every approach and keeps the least
 * risky (ties go to the first in APPROACHES order). Each job is read on its own: crew aren't held back
 * for other jobs, since most jobs take a day and the same people can run them back to back.
 * Returns { approach, picks, crew: [op] (inside), level, size (everyone Joss would send), short }.
 */
export function jobReadRef(state, job) {
  const v = jobView(state, job);
  const free = state.crew.filter((op) => availability(state, op).ok);
  let best = null;
  for (const approach of Object.keys(APPROACHES)) {
    const picks = leanPicksRef(state, job, approach);
    if (!best || RISK_ORDER.indexOf(picks.level) < RISK_ORDER.indexOf(best.level)) {
      const crew = picks.crew.map((id) => free.find((o) => o.id === id));
      const size = picks.crew.length + (picks.overwatch ? 1 : 0) + (picks.wheels ? 1 : 0);
      best = { approach, picks, crew, level: picks.level, size, short: Math.max(0, v.tpl.crewSize - crew.length) };
    }
  }
  return best;
}

/** planTries as it was: every try read in full with planRead. */
export function planTriesRef(state, job, plan, free, { limit = 3 } = {}) {
  const tpl = jobView(state, job).tpl;
  const rank = (p) => RISK_ORDER.indexOf(planReadRef(state, job, p).level);
  const now = rank(plan);
  if (now === 0 || !plan.crew.length) return [];
  const inPlan = (op) => plan.crew.includes(op) || op === plan.overwatch || op === plan.wheels;
  const spare = free.filter((op) => !inPlan(op));
  const COST = { approach: 0, swap: 1, overwatch: 2, wheels: 2, add: 3 };
  const found = [];
  const keep = (t, p) => { const r = rank(p); if (r < now) found.push({ ...t, level: RISK_ORDER[r], r }); };
  for (const approach of Object.keys(APPROACHES)) if (approach !== plan.approach) keep({ kind: 'approach', approach }, { ...plan, approach });
  for (const out of plan.crew) for (const op of spare) keep({ kind: 'swap', out, op }, { ...plan, crew: plan.crew.map((o) => (o === out ? op : o)) });
  if (plan.crew.length < maxCrew(tpl.crewSize)) for (const op of spare) keep({ kind: 'add', op }, { ...plan, crew: [...plan.crew, op] });
  if (!plan.overwatch) for (const op of spare) for (const kit of kitsFor(op)) keep({ kind: 'overwatch', op, kit }, { ...plan, overwatch: op, kit });
  if (!plan.wheels) for (const op of spare) keep({ kind: 'wheels', op }, { ...plan, wheels: op });
  found.sort((a, b) => a.r - b.r || COST[a.kind] - COST[b.kind]);
  const out = [];
  for (const t of found) if (!out.some((x) => x.kind === t.kind) && out.length < limit) out.push(t);
  return out.map(({ r, ...t }) => t);
}
