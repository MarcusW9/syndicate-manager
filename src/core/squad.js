// Planning a squad (PLAN-CORE-LOOP.md, slice 2): the coverage read and Joss's picks.
// Pure: both use the same rules the run does (core/incidents.js handlerFor and bestSave, the
// shared crew rule), so the read on the board is the risk the crew actually meets.

import { ZONE_POOLS, OFF_APPROACH } from '../data/incidents.js';
import { incidentById, incidentDifficulty, handlerFor, bestSave } from './incidents.js';
import { overwatchKit, kitsFor } from './gear.js';
import { crewRoll, effectiveStat, APPROACHES } from './crew.js';
import { successChance, riskLabel, rollTarget, assessJob } from './risk.js';
import { availability, MAX_EXTRA_CREW, maxCrew } from './crew.js';
import { jobView } from './jobs.js';
import { intelFor } from './sidetasks.js';
import { WATCHED_PENALTY, watchedIn } from './heat.js';
import { battleOdds, overwatchOf, battleTally, stepBattleTally, battleWinRange } from './battle.js';
import { fightOddsFor, fightDiff, fightTallies, stepTallies, winRange } from './fight.js';
import { FIGHT_JOBS } from '../data/fights.js';
import { spotsForJob } from './fightspots.js';
import { crewValue } from './worth.js';

const ZONE_NOTE = { in: 'The way in', inside: 'Inside', target: 'The target' };
const RISK_ORDER = ['low', 'moderate', 'high', 'extreme'];
/** The most risk Joss accepts to keep a more valuable runner home (2026-11-05); never past the best read if that's worse. */
export const JOSS_ACCEPTS = 'moderate';
export const worstRisk = (levels) => levels.reduce((a, b) => (RISK_ORDER.indexOf(b) > RISK_ORDER.indexOf(a) ? b : a), 'low');

/** Every incident this approach can meet, zone by zone, once each: [{ id, zone, sometimes }]. */
export function likelyIncidents(approach) {
  const rows = [];
  for (const zone of ['in', 'inside', 'target']) {
    for (const id of ZONE_POOLS[zone][approach] ?? []) if (!rows.some((r) => r.id === id)) rows.push({ id, zone, sometimes: false });
  }
  if (approach !== 'loud' && !rows.some((r) => r.id === OFF_APPROACH.incident)) rows.push({ id: OFF_APPROACH.incident, zone: 'inside', sometimes: true });
  return rows;
}

/**
 * The coverage rows before any fight is played (2026-11-14, the board's pruned search): each row carries what its fight
 * would change (`missed`, the share that reaches the fight) and plays the fight only when asked (`fightOf`, once), so a
 * reader can bound the row's level first and play the fight only when the bound leaves the level open.
 */
function coverRows(template, crew, approach, { threat = template.threat, overwatch = null, intel = null, wheels = null, jobId = null } = {}) {
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
    if (!h) return { base, zone, diff, h: null, fights: false };
    const save = inc.danger ? bestSave({ victim: h.roll.op, able: crew, overwatch: ow, overwatchOp: ow ? overwatch.op : null, zone, diff }) : null;
    // Unsaved danger becomes a fight: a fight won with nobody at death's door counts as getting
    // through. On a loud run it is a fight whatever the roll (core/battle.js loudFightDue), and
    // winning the roll means the crew gets the jump on the guards (the ambush odds).
    const fights = Boolean(inc.danger && inc.guards);
    const spots = jobId && fights ? spotsForJob(template.district, jobId, template.id, zone, crew.length) : null;
    const fargs = { incident: id, zone, diff, threat, guards: inc.guards, crew, approach, overwatchOp: ow ? overwatch.op : null, ow, wheels, spots };
    const forced = approach === 'loud' && fights;
    // The five jobs of the battle rework play their fights on engine 2: the read runs that engine on the same orders (shown = used);
    // the line-up is drawn when the run starts, so it is averaged over several (core/fight.js fightOddsFor). No ambush there yet.
    const type = FIGHT_JOBS[template.id];
    const odds = (extra = {}) => (type
      ? { standoff: 0, ...fightOddsFor(fightArgs(diff, zone)) }
      : battleOdds({ ...fargs, ...extra }));
    const missed = forced ? 1 : save ? (1 - h.chance) * (1 - save.chance) : 1 - h.chance;
    let fight;
    const fightOf = () => {
      if (fight !== undefined) return fight;
      fight = fights ? odds() : null;
      if (forced) {
        const jump = odds({ ambush: true });
        const mix = (k) => h.chance * jump[k] + (1 - h.chance) * fight[k];
        fight = { win: mix('win'), down: mix('down'), standoff: mix('standoff') };
      }
      return fight;
    };
    // The share of fights won, from the fight's win and (loud) the jump's, the same sum fightOf makes, so a bound holds to the last bit.
    const winOf = (jumpWin, fightWin) => (forced ? h.chance * jumpWin + (1 - h.chance) * fightWin : fightWin);
    // The same fights played a few at a time (core/fight.js fightTallies, core/battle.js battleTally): what they have
    // shown so far bounds the win share, and fightOf finds what they played in their caches.
    const tally = (extra = {}) => (type ? { t: fightTallies(fightArgs(diff, zone)), range: winRange, step: stepTallies }
      : { t: battleTally({ ...fargs, ...extra }), range: battleWinRange, step: (t, k) => !stepBattleTally(t, k).out });
    let tallies = null;
    /** [lo, hi]: the win share fightOf will give, at least and at most, from the fights played so far. */
    const winRangeOf = () => {
      if (!tallies) return [winOf(0, 0), winOf(1, 1)];
      const [fLo, fHi] = tallies.fight.range(tallies.fight.t);
      const [jLo, jHi] = tallies.jump ? tallies.jump.range(tallies.jump.t) : [0, 0];
      return [winOf(jLo, fLo), winOf(jHi, fHi)];
    };
    /** Play up to k more of each of the row's fights. Returns false once all are played. */
    const refine = (k) => {
      tallies ??= { fight: tally(), jump: forced ? tally({ ambush: true }) : null };
      const more = tallies.fight.step(tallies.fight.t, k);
      return (tallies.jump ? tallies.jump.step(tallies.jump.t, k) : false) || more;
    };
    return { base, zone, diff, h, save, fights, forced, missed, fightOf, winRangeOf, refine, engine2: Boolean(type) };
  });
  return { rows, fightArgs };
}

/** A coverage row as the planner shows it (its fight played). */
function fullRow(r) {
  if (!r.h) return { ...r.base, handler: null, chance: 0, risk: 'extreme', withSave: null, effective: 'extreme', gap: true };
  const { h, save } = r;
  const fight = r.fightOf();
  const eff = 1 - r.missed * (fight ? 1 - fight.win : 1);
  return {
    ...r.base,
    handler: { op: h.roll.op, stat: h.stat, value: h.roll.value, notes: h.roll.notes },
    chance: h.chance, risk: riskLabel(h.chance),
    withSave: save ? { via: save.via, op: save.op, chance: save.chance } : null,
    fight: fight ? { ...fight, chance: r.missed, forced: r.forced } : null,
    effective: riskLabel(eff), gap: riskLabel(eff) === 'extreme',
  };
}

/**
 * A row's level, best and worst, from the fights played so far: [best, worst] as RISK_ORDER indexes. A row with no fight
 * is exact. Before any fight the win share is anywhere in [0, 1]; the row's odds rise with it, so the most wins it can
 * still reach give the best level and the fewest the worst (the same sums fullRow makes, so the bound holds to the last
 * bit). Once every fight is played the two are equal and are fullRow's level.
 */
function rowBounds(r) {
  if (!r.h) return [3, 3];
  const at = (win) => RISK_ORDER.indexOf(riskLabel(1 - r.missed * (1 - win)));
  if (!r.fights) { const l = RISK_ORDER.indexOf(riskLabel(1 - r.missed * 1)); return [l, l]; }
  const [lo, hi] = r.winRangeOf();
  return [at(hi), at(lo)];
}

/** Fights a read plays at a time before it looks again (of each fight's 120: engine 1's runs, engine 2's 20 per line-up). */
const STEP = { runs: 12, perBuild: 4 };
const refineRow = (r) => r.refine(r.engine2 ? STEP.perBuild : STEP.runs);

/**
 * The coverage read: for each likely incident, who would handle it, their odds, and (for danger)
 * the odds once the best save is counted and, if that fails too, how the fight goes (slice 6:
 * core/battle.js battleOdds, the run's own round function). crew: the inside team (operatives).
 * overwatch: { op, kit } (only counts if they carry that kit). wheels: the driver in the van.
 * jobId: the job's id, so each fight is read on the spots the run will use (its site comes from
 * the id; core/fightspots.js spotsForJob). Without it, everyone stands in half cover.
 * Returns { rows, spotted, toughest }.
 */
export function coverage(template, crew, approach, opts = {}) {
  return coverageOf(template, crew, approach, coverRows(template, crew, approach, opts));
}

/** coverage's answer from its rows (coverRows), every fight played. */
function coverageOf(template, crew, approach, { rows: lazy, fightArgs }) {
  const rows = lazy.map(fullRow);
  const spotted = APPROACHES[approach]?.detect && crew.length > template.crewSize ? crew.length - template.crewSize : 0;
  const first = rows.find((r) => r.fight);
  return { rows, spotted, toughest: worstRisk(rows.map((r) => r.effective)), fight2: FIGHT_JOBS[template.id] && first && crew.length ? fightArgs(first.diff, first.zone) : null };
}

/**
 * How well a squad covers a job: the mean effective odds over the likely incidents and the job's key stats.
 * Returns { hi(), refine(), exact() }: hi() is the most it can still be, from the fights played so far (each fight a
 * tally: core/fight.js fightTallies, core/battle.js battleTally); refine() plays a few more of each and says whether any
 * are left; exact() is the score with every fight played.
 */
function squadScore(template, crew, approach, overwatch, threat) {
  if (!crew.length) return { hi: () => 0, refine: () => false, exact: () => 0 };
  const { rows } = coverRows(template, crew, approach, { threat, overwatch });
  const target = rollTarget({ ...template, threat });
  const keys = template.keyStats.map((stat) => {
    const roll = crewRoll(crew, stat, { approach, recommended: template.crewSize });
    return roll ? successChance(roll.value, target) : 0;
  });
  const mean = (win) => {
    const odds = rows.map((r) => (r.h ? 1 - (r.fights ? r.missed * (1 - win(r)) : (1 - r.h.chance) * (1 - (r.save?.chance ?? 0))) : 0));
    odds.push(...keys);
    return odds.reduce((a, b) => a + b, 0) / odds.length;
  };
  const open = rows.filter((r) => r.h && r.fights);
  return {
    hi: () => mean((r) => r.winRangeOf()[1]),
    refine: () => open.map(refineRow).some(Boolean),
    exact: () => mean((r) => r.fightOf().win),
  };
}

/**
 * The first of `items` with the highest score above `floor`, as a plain loop keeping the first strict best finds it, but
 * playing an item's fights only while its upper bound could still win (squadScore). items: [{ hi(), refine(), exact() }].
 * The most promising (by the bound before any fight) are played first, so the rest stop early. Returns { i, s } or null.
 */
function firstBest(items, floor = -Infinity) {
  const start = items.map((it) => it.hi());
  const order = items.map((_, i) => i).sort((a, b) => start[b] - start[a] || a - b);
  let best = null;
  for (const i of order) {
    if (start[i] <= floor) break;
    const it = items[i];
    for (;;) {
      const hi = it.hi();
      if (hi <= floor || (best && (hi < best.s || (hi === best.s && i > best.i)))) break;
      if (it.refine()) continue;
      const s = it.exact();
      if (s > floor && (!best || s > best.s || (s === best.s && i < best.i))) best = { i, s };
      break;
    }
  }
  return best;
}

/**
 * Joss's picks: an inside team of the recommended size and an overwatch (someone carrying a rifle
 * or a drone), chosen one at a time
 * for the best coverage, from the operatives given (free crew; freelancers cost a cut, so Joss
 * leaves them to you). Overwatch only if it helps; Wheels if the job can need piloting and they'd
 * out-drive the team; standby from whoever's left. Returns { crew, overwatch, kit, wheels, standby }.
 */
export function jossPicks(template, candidates, approach, { threat = template.threat } = {}) {
  const team = [];
  const pool = [...candidates];
  while (team.length < template.crewSize && pool.length) {
    const best = firstBest(pool.map((op) => squadScore(template, [...team, op], approach, null, threat)));
    const op = pool[best.i];
    team.push(op);
    pool.splice(best.i, 1);
  }
  const without = squadScore(template, team, approach, null, threat).exact();
  const tries = pool.flatMap((op) => kitsFor(op).map((kit) => ({ op, kit })));
  const found = firstBest(tries.map(({ op, kit }) => squadScore(template, team, approach, { op, kit }, threat)), without + 0.005);
  const over = found ? tries[found.i] : null;
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

/** The line a dossier card shows: the stat this person brings to this approach. */
export function bestLine(op, approach) {
  const lean = Object.keys(APPROACHES[approach]?.mods ?? {});
  const stats = [...new Set([...lean, 'combat', 'tech', 'stealth', 'social'])];
  const best = stats.map((k) => ({ k, v: effectiveStat(op, k, { approach }).value })).sort((a, b) => b.v - a.v)[0];
  return { stat: best.k, value: best.v };
}

/** What every read of one job shares, worked out once (2026-11-14): the job as offered, its intel, the heat on its district. */
function readContext(state, job) {
  const v = jobView(state, job);
  return {
    state, job, v, tpl: { ...v.tpl, threat: v.threat },
    intel: intelFor(state, v.tpl.district, v.inside),
    watched: watchedIn(state, v.tpl.district) ? WATCHED_PENALTY : 0,
  };
}

/** A plan's two reads before any fight is played: the crises (assessJob) and the coverage rows (coverRows). */
function planParts(ctx, { crew, approach, overwatch = null, kit = null, wheels = null }) {
  const read = assessJob(ctx.tpl, crew, approach, { watched: ctx.watched, intel: ctx.intel, wheels });
  const owKit = overwatch && (kitsFor(overwatch).includes(kit) ? kit : kitsFor(overwatch)[0]);
  const cov = coverRows(ctx.tpl, crew, approach, { threat: ctx.tpl.threat, overwatch: owKit ? { op: overwatch, kit: owKit } : null, intel: ctx.intel, wheels, jobId: ctx.job.id });
  return { read, rows: cov.rows, cov, crew, approach };
}

/**
 * The plan's level as a RISK_ORDER index, the same as planRead's, playing a fight only as far as the answer needs: the
 * crises read and every row without a fight are exact, and a fight row's level lies between its best and worst from the
 * fights played so far (rowBounds), so its fights are played a few at a time until that settles it. With `cap`, the reader only needs to know whether the level is below it: once
 * the level is known to be cap or worse, it stops and returns that (some index >= cap, not always the exact level).
 */
function rankIn(parts, cap = Infinity) {
  const { read, rows, crew } = parts;
  let known = RISK_ORDER.indexOf(read.level);
  if (!crew.length) return known;
  const open = [];
  for (const r of rows) {
    const [best, worst] = rowBounds(r);
    known = Math.max(known, best);
    if (worst > best) open.push(r);
  }
  for (const r of open) {
    for (;;) {
      if (known >= cap) return known;
      const [best, worst] = rowBounds(r);
      if (worst <= known) break; // this row can't make it worse
      if (best === worst) { known = Math.max(known, best); break; }
      if (best >= cap) return Math.max(known, best);
      refineRow(r);
    }
  }
  return known;
}

/**
 * The read the planning screen shows for a plan: the worse of the crises read (assessJob) and the
 * incidents (coverage). One function for the planner and the job board, so they always agree.
 * plan: { crew: [op], approach, overwatch: op | null, kit, wheels: op | null }.
 * Returns { level, read, cov }.
 */
export function planRead(state, job, plan) {
  const ctx = readContext(state, job);
  const parts = planParts(ctx, plan);
  const { read, crew } = parts;
  const cov = coverageOf(ctx.tpl, crew, plan.approach, parts.cov);
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
 * Each squad's level is the planner's (planRead), but worked out lazily (rankIn, 2026-11-14): a squad's fights are played
 * only when the cheap reads around them leave its level open against what it is compared with, and each squad is read once.
 * Returns { crew, overwatch, kit, wheels, standby: null, level }.
 */
export function leanPicks(state, job, approach, ctx = readContext(state, job)) {
  const { tpl } = ctx;
  const free = ctx.free ??= state.crew.filter((op) => availability(state, op).ok);
  const byId = (id) => free.find((o) => o.id === id) ?? null;
  const base = jossPicks(tpl, free, approach, { threat: tpl.threat });
  const reads = new Map();
  const rank = (sq, cap) => {
    const owKit = sq.overwatch && (kitsFor(sq.overwatch).includes(sq.kit) ? sq.kit : kitsFor(sq.overwatch)[0]);
    const key = `${sq.crew.map((o) => o.id).join(',')}|${sq.overwatch?.id ?? ''}|${owKit || ''}|${sq.wheels?.id ?? ''}`;
    if (!reads.has(key)) reads.set(key, planParts(ctx, { ...sq, approach }));
    return rankIn(reads.get(key), cap);
  };
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
          // Only a level below the best so far counts, so the read stops as soon as it can't be.
          const bar = pick ? pick.r : r;
          const rr = rank({ ...sq, crew: [...sq.crew, op] }, bar);
          if (rr < bar) pick = { op, r: rr };
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
      if (rank({ ...squad, crew }, accept + 1) <= accept) { squad.crew = crew; break; }
    }
  }
  while (squad.crew.length > tpl.crewSize && rank({ ...squad, crew: squad.crew.slice(0, -1) }, accept + 1) <= accept) squad.crew = squad.crew.slice(0, -1);
  return { crew: squad.crew.map((o) => o.id), overwatch: squad.overwatch?.id ?? null, kit: squad.kit, wheels: squad.wheels?.id ?? null, standby: null, level: RISK_ORDER[rank(squad)] };
}

/**
 * Joss's read for the job board: if this job went today, with whoever is free, which approach and
 * squad would Joss pick (leanPicks), and how risky is it? Tries every approach and keeps the least
 * risky (ties go to the first in APPROACHES order; once one reads low, the rest can't beat it and
 * aren't read). Each job is read on its own: crew aren't held back
 * for other jobs, since most jobs take a day and the same people can run them back to back.
 * Returns { approach, picks, crew: [op] (inside), level, size (everyone Joss would send), short }.
 */
export function jobRead(state, job) {
  const ctx = readContext(state, job);
  const free = ctx.free = state.crew.filter((op) => availability(state, op).ok);
  let best = null;
  for (const approach of Object.keys(APPROACHES)) {
    if (best?.level === 'low') break;
    const picks = leanPicks(state, job, approach, ctx);
    if (!best || RISK_ORDER.indexOf(picks.level) < RISK_ORDER.indexOf(best.level)) {
      const crew = picks.crew.map((id) => free.find((o) => o.id === id));
      const size = picks.crew.length + (picks.overwatch ? 1 : 0) + (picks.wheels ? 1 : 0);
      best = { approach, picks, crew, level: picks.level, size, short: Math.max(0, ctx.v.tpl.crewSize - crew.length) };
    }
  }
  return best;
}

/**
 * What to try to lower the plan's risk (2026-11-05, the plan bar's "Try"): one change at a time
 * from the plan as it stands: another approach, one inside runner swapped for someone free, one
 * more inside (up to the most allowed), someone free on overwatch (with kit they carry) or at the
 * wheel. Each is read with planRead, the same read the bar shows; only changes that lower the level
 * are kept, the lowest level first, then the smallest change; one of each kind, at most `limit`.
 * plan: { crew: [op], approach, overwatch: op|null, kit, wheels: op|null }; free: [op] who could go.
 * Returns [{ kind: 'approach'|'swap'|'add'|'overwatch'|'wheels', level, approach?, out?, op?, kit? }].
 */
export function planTries(state, job, plan, free, { limit = 3 } = {}) {
  const ctx = readContext(state, job);
  const tpl = ctx.v.tpl;
  // Each try's level is planRead's; a try only counts below the plan's level, so its read stops once it can't be (rankIn).
  const rank = (p, cap) => rankIn(planParts(ctx, p), cap);
  const now = rank(plan);
  if (now === 0 || !plan.crew.length) return [];
  const inPlan = (op) => plan.crew.includes(op) || op === plan.overwatch || op === plan.wheels;
  const spare = free.filter((op) => !inPlan(op));
  const COST = { approach: 0, swap: 1, overwatch: 2, wheels: 2, add: 3 };
  const found = [];
  const keep = (t, p) => { const r = rank(p, now); if (r < now) found.push({ ...t, level: RISK_ORDER[r], r }); };
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
