// Shared helpers for tests: an automated "player" that plays missions and weeks.

import { createNewGame, chooseFounders } from '../src/core/state.js';
import { hire, canHire } from '../src/core/recruits.js';
import { primaryStat } from '../src/core/development.js';
import * as M from '../src/core/mission.js';
import { advanceDay, calendar } from '../src/core/time.js';
import { templateById } from '../src/core/jobs.js';
import { availability } from '../src/core/crew.js';
import { GEAR } from '../src/data/gear.js';
import { FIGHT_JOBS } from '../src/data/fights.js';
import { emptyLoadout, firstFit, placeOf } from '../src/core/gear.js';
import { buildBattle, ordersFor, hitFor } from '../src/core/battle.js';

/** Put gear on someone for a test (no cost, no stash): arm(state, opId, 'rifle', 'drone'). Returns state. */
export function arm(state, opId, ...types) {
  const op = state.crew.find((o) => o.id === opId);
  for (const type of types) {
    const [t, tier = 'street'] = type.split(':');
    state.gearSeq = (state.gearSeq ?? 0) + 1;
    const item = { uid: `t${state.gearSeq}`, type: t, tier };
    // Where it goes on them (the carry grid, save v45): worn, in a socket, or the bag's first free place.
    op.gear = { ...emptyLoadout(), ...(op.gear ?? {}) };
    const where = placeOf(t);
    if (where === 'armour') op.gear.armour = item;
    else if (where === 'implant') op.gear.implants = [...op.gear.implants, item];
    else { const at = firstFit(op, item); if (at) op.gear.bag.push({ item, ...at }); }
  }
  return state;
}

/**
 * Walk the active mission up to its next crisis (or a critical, or the end): beats, zones,
 * incidents, and any decision a run stops for (decided by the policy, carefully by default).
 * For tests that look at a crisis itself. Returns the new state.
 */
export function toCrisis(state, policy = carefulPolicy) {
  let s = state;
  for (let guard = 0; guard < 160; guard++) {
    const am = s.activeMission;
    if (!am || am.done || am.critical) return s;
    const type = M.currentStep(am)?.type;
    if (am.pending) s = M.resolvePending(s, policy.pending(M.describePending(s).choices.map((c) => c.id), guard));
    else if (type === 'beat') s = M.revealBeat(s);
    else if (type === 'zone') s = M.enterZone(s);
    else if (type === 'incident') s = M.runIncident(s);
    else if (type === 'battle') s = M.runBattle(s);
    else return s;
  }
  throw new Error('toCrisis got stuck');
}

/** Play the active mission to the end. policy decides each choice. Returns { state, pushed }. */
export function playMission(state, policy) {
  let s = state;
  let pushed = false;
  for (let guard = 0; guard < 160 && !s.activeMission.done; guard++) {
    const am = s.activeMission;
    const type = M.currentStep(am)?.type;
    if (am.critical) {
      const options = M.describeCritical(s).choices.filter((c) => c.available).map((c) => c.id);
      const pick = policy.critical(options, guard);
      if (pick === 'push') pushed = true;
      s = M.resolveCritical(s, pick);
    } else if (am.pending) {
      // Decisions a run stops for (max alert, a serious injury): the policy picks, or the first option.
      // Keeping on fighting with someone at death's door is a push on (slice 6).
      const options = M.describePending(s).choices.map((c) => c.id);
      const pick = (policy.pending ?? ((o) => o[0]))(options, guard);
      if (pick === 'fight') pushed = true;
      s = M.resolvePending(s, pick);
    } else if (type === 'beat') {
      s = M.revealBeat(s);
    } else if (type === 'zone') {
      s = M.enterZone(s);
    } else if (type === 'incident') {
      s = M.runIncident(s);
    } else if (type === 'battle') {
      s = M.runBattle(s);
    } else {
      const choices = M.describeCrisis(s).choices.filter((c) => c.available);
      s = M.chooseOption(s, policy.crisis(choices, guard).id);
    }
  }
  if (!s.activeMission.done) throw new Error('Mission got stuck');
  return { state: s, pushed };
}

/**
 * The new death rule (battle rework, 2026-11-11): death follows a risk the player accepted and was shown. On the five jobs
 * that play on engine 2 (data/fights.js FIGHT_JOBS) the committed risk level fights on with someone down, so a hands-off
 * crew on committed orders can lose a runner there (a bleed, or being left behind down); on cautious and steady, and on
 * every other job, hands-off still loses nobody.
 */
export const mayLoseSomeone = (templateId, orders) => orders === 'committed' && templateId in FIGHT_JOBS;

export const randomPolicy = (seed) => ({
  critical: (opts, g) => opts[(seed + g) % opts.length],
  pending: (opts, g) => opts[(seed + g) % opts.length],
  crisis: (choices, g) => {
    if (seed % 5 === 0) return choices.find((c) => c.kind === 'abort') ?? choices[0];
    const go = choices.filter((c) => c.kind !== 'abort');
    return go.length ? go[(seed + g) % go.length] : choices[0];
  },
});

/** A sensible player: picks the lowest-risk non-abort option, extracts on critical. */
const RANK = { certain: 0, low: 1, moderate: 2, high: 3, extreme: 4 };
export const carefulPolicy = {
  critical: (opts) => (opts.includes('stabilise') ? 'stabilise' : 'extract'),
  pending: (opts) => (opts.includes('keep') ? 'keep' : 'out'), // carry on without the wounded; walk away when blown
  crisis: (choices) => {
    const go = choices.filter((c) => c.kind !== 'abort').sort((a, b) => (RANK[a.risk] ?? 9) - (RANK[b.risk] ?? 9));
    return go[0] && (RANK[go[0].risk] ?? 9) <= 2 ? go[0] : choices.find((c) => c.kind === 'abort');
  },
};

/** The founder pick for simulations: the three candidates with the best main stat. */
export function autoFounders(state) {
  const best = [...state.founding.candidates].sort((a, b) => b.stats[primaryStat(b)] - a.stats[primaryStat(a)]).slice(0, 3);
  return chooseFounders(state, best.map((r) => r.id));
}

/**
 * Play whole weeks: each Monday take the best-paying job the available crew can staff.
 * hireAbove: if set, hire the best lead (up to five on the crew) when cash after the fee would
 * still cover this plus four weeks of their wage. onDay(state), if given, sees the state after each day.
 */
export function playWeeks(weeks, seed, policy = carefulPolicy, { startCrew = 'classic', hireAbove = null, onDay = null } = {}) {
  let s = createNewGame({ seed, startCrew });
  if (s.founding) s = autoFounders(s);
  let deaths = 0;
  for (let day = 0; day < weeks * 7; day++) {
    const free = s.crew.filter((op) => availability(s, op).ok);
    const jobs = [...s.jobs].sort((a, b) => templateById(b.templateId).pay - templateById(a.templateId).pay);
    const job = jobs.find((j) => templateById(j.templateId).crewSize <= free.length);
    if (job && calendar(s.day).weekday !== 'Sun') {
      const tpl = templateById(job.templateId);
      const crew = [...free].sort((a, b) => (a.role === 'medic' ? -1 : 0) - (b.role === 'medic' ? -1 : 0)).slice(0, tpl.crewSize);
      s = M.startMission(s, job.id, crew.map((o) => o.id), 'stealth');
      const r = playMission(s, policy);
      deaths += r.state.activeMission.result.deaths.length;
      s = M.closeMission(r.state);
    }
    if (hireAbove != null) {
      const lead = [...(s.recruits ?? [])].filter((r) => canHire(s, r).ok).sort((a, b) => b.stats[primaryStat(b)] - a.stats[primaryStat(a)])[0];
      if (lead && s.crew.length < 5 && s.cash - lead.wage * 5 > hireAbove) s = hire(s, lead.id);
    }
    s = advanceDay(s);
    if (onDay) onDay(s); // a look at the state after each day (tests/fame-sim-worker.js samples week 52)
  }
  return { state: s, deaths };
}

/**
 * The fixed test fight for command fights (2026-10-30): four of a fresh crew grown to pros (every
 * stat +4) in a sidearm and a vest, against threat-4 guards at a threat-4 incident's difficulty
 * (three guards, no alert). A close fight hands-off. Returns a battle (core/battle.js buildBattle).
 */
export function testFight(seed = 1) {
  const s = createNewGame({ seed, startCrew: 'fresh' });
  for (const op of s.crew) for (const k of Object.keys(op.stats)) op.stats[k] = Math.min(20, op.stats[k] + 4);
  const crew = s.crew.slice(0, 4);
  for (const op of crew) arm(s, op.id, 'pistol', 'vest');
  return buildBattle({ incident: 'guard', zone: 'inside', diff: 16, threat: 4, guards: 2, crew, approach: 'loud' });
}

/**
 * A plain player's orders for a round (core/battle.js playRound), reading only what the screen
 * shows (the guards' intents, their damage and ordersFor's odds): medics, talkers and tech keep to
 * their own call; anyone who'd go down if every guard aiming at them hit gets down; everyone else
 * fires at the same guard (the most hurt), and one runner nobody is aiming at flanks them.
 */
export function commandOrders(b) {
  const orders = {};
  const aimers = (id) => (b.intents ?? []).filter((i) => i.target === id).map((i) => b.guards.find((g) => g.n === i.guard));
  const aimed = (id) => aimers(id).length;
  const focus = b.guards.filter((g) => !g.out).sort((a, c) => a.hp - c.hp || a.n - c.n)[0];
  let flanker = false;
  for (const r of b.runners.filter((x) => !x.down)) {
    const opts = ordersFor(b, r.id);
    const auto = opts.find((o) => o.auto);
    if (auto && auto.kind !== 'shoot') orders[r.id] = auto;
    else if (aimed(r.id) && aimers(r.id).reduce((n, g) => n + hitFor(g.damage, r.armour), 0) >= r.hp) orders[r.id] = { kind: 'hunker' };
    else if (focus && !flanker && !aimed(r.id) && focus.cover !== 'open') { orders[r.id] = { kind: 'flank', target: focus.n }; flanker = true; }
    else if (focus) orders[r.id] = { kind: 'shoot', target: focus.n };
  }
  return orders;
}
