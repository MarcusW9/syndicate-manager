// Hands-off runs: the crew does the job without the player, under standing orders, and
// the player reads the report. Pure logic. Same engine, same dice, same consequences as a
// played job (mission.js); the orders only decide which choice to take.
//
// Death rule: a hands-off crew never pushes on. At any critical state it extracts, and at death's
// door in a fight it pulls back, so a hands-off job can't kill anyone (DESIGN.md, 2026-10-26).
// A crew out that calls you in (callIn 'risky' or 'every') brings a critical to you instead.
//
// Timing: sendOff starts the job and sets it aside (state.awayJobs, save v17) with the crew
// away; core/away.js plays it a share a day and stops for a call-in when needsPlayer says so
// (save v35). Pay, heat and injuries land with the report when the job ends.
//
// Live runs (PLAN-CORE-LOOP.md) use the same stepper: autoStep takes one step the crew can take
// on its own; needsPlayer says when the run waits for the player (a call-in).

import { templateById } from './jobs.js';
import { fightAnswer } from './runfight.js';
import { crisisOdds, chooseOption, revealBeat, resolveCritical, currentStep, startMission, enterZone, runIncident, runBattle, resolvePending, describePending, RISKY_BELOW } from './mission.js';
import { ordersDecision } from './incidents.js';

const pct = (n) => `${Math.round(n * 100)}%`;

/**
 * Standing orders. Weights price each downside in "share of the pay": heat per point, an
 * injury by severity, trust per point lost. minChance: below it a roll isn't attempted.
 */
export const ORDERS = {
  cautious: {
    name: 'Cautious', desc: 'Takes the safest way through, and walks away early.',
    minChance: 0.65, heat: 0.25, trust: 0.03, injury: { light: 0.5, serious: 2, critical: 5 },
  },
  steady: {
    name: 'Steady', desc: 'Weighs the pay against the risk.',
    minChance: 0.45, heat: 0.15, trust: 0.02, injury: { light: 0.25, serious: 1, critical: 3 },
  },
  committed: {
    name: 'Committed', desc: 'Takes more risk to finish the job and earn more. Never pushes on with a critical wound.',
    minChance: 0.25, heat: 0.08, trust: 0.01, injury: { light: 0.1, serious: 0.5, critical: 1.5 },
  },
};

/** A cost object ({ payCut, heat, cash, clientTrust }) in share-of-pay, under these orders. */
function price(cost = {}, orders, basePay) {
  return (cost.payCut ?? 0) + (cost.heat ?? 0) * orders.heat
    - (cost.cash ?? 0) / Math.max(1, basePay) - (cost.clientTrust ?? 0) * orders.trust;
}

/** Expected loss of taking a choice (lower is better). */
function expectedLoss({ choice, chance }, orders, basePay) {
  const fail = price(choice.failureCost, orders, basePay) + (orders.injury[choice.failureInjury] ?? 0);
  return price(choice.cost, orders, basePay) + chance * price(choice.successCost, orders, basePay) + (1 - chance) * fail;
}

/** Pick a choice for the current crisis under these orders: { id, why }. */
export function decide(state, ordersId) {
  const orders = ORDERS[ordersId] ?? ORDERS.steady;
  const basePay = state.activeMission.pay ?? templateById(state.activeMission.templateId).pay;
  const odds = crisisOdds(state);
  const exits = odds.filter((o) => o.exit).sort((a, b) => expectedLoss(a, orders, basePay) - expectedLoss(b, orders, basePay));
  const tries = odds.filter((o) => !o.exit);
  const worthTrying = tries.filter((o) => o.chance >= orders.minChance)
    .sort((a, b) => expectedLoss(a, orders, basePay) - expectedLoss(b, orders, basePay));
  const pick = worthTrying[0];
  const out = exits[0];

  if (!pick || (out && expectedLoss(out, orders, basePay) < expectedLoss(pick, orders, basePay))) {
    if (!out) return { id: (pick ?? tries[0]).choice.id, why: 'No way out but through.' }; // every crisis has an exit; a guard only
    return { id: out.choice.id, why: tries.length && !pick ? 'Nothing on the table had good enough odds, so they pulled out.' : 'Pulling out cost less than the risk of staying.' };
  }
  const c = pick.choice;
  if (!pick.roller) return { id: c.id, why: 'No roll needed.' };
  const who = pick.named ? `It was on ${pick.roller.op.handle} to handle (${c.stat} ${pick.roller.value}).`
    : `${pick.roller.op.handle} took it: the best ${c.stat} on the crew (${pick.roller.value}).`;
  const bestOdds = Math.max(...tries.map((o) => o.chance));
  const reason = pick.chance >= bestOdds ? 'The best odds of the options.'
    : (c.successCost?.payCut ?? 0) < 0 ? 'Worth the risk for the extra pay.'
      : 'Less to lose if it went wrong.';
  const paid = (c.cost?.payCut ?? 0) > 0 ? ` It cost ${pct(c.cost.payCut)} of the pay either way.` : '';
  return { id: c.id, why: `${who} ${reason}${paid}` };
}

/**
 * Does the run wait for the player now? A critical always does on a live run (the player's call;
 * the death rule). A crisis or a decision does unless the call-in rule says the crew decides:
 * 'every' calls you at every crisis; 'risky' when the best roll on offer is under even odds;
 * 'never' never (hands-off).
 */
export function needsPlayer(state) {
  const am = state.activeMission;
  if (!am || am.done) return false;
  if (dayDone(am)) return true; // an away job has done today's share: it waits for tomorrow (or for you to hand it back)
  if (am.callIn === 'never') return false;
  if (am.critical || am.pending) return true;
  // Command fights (2026-10-30): a fight waits for your orders each round, unless you left it to the
  // crew. An away crew fights on its own unless you've taken command (core/away.js).
  // An engine-2 fight (the five jobs of the battle rework) waits the same way: its screen (ui/fightscreen.js) takes the
  // orders and risk each round; "Auto fight" hands the rest of it to the crew, and its call-ins are am.pending above.
  if (currentStep(am)?.type === 'battle') return !!am.battle && !am.battle.auto && !(am.away && !am.away.command);
  if (currentStep(am)?.type !== 'crisis') return false;
  return wouldCall(state) && !leadTakes(state);
}

/** Would this crisis go to the player under the call-in rule (before any lead takes it)? */
function wouldCall(state) {
  const am = state.activeMission;
  if (am.callIn !== 'risky') return true;
  const tries = (crisisOdds(state) ?? []).filter((o) => !o.exit);
  return !tries.length || Math.max(...tries.map((o) => o.chance)) < RISKY_BELOW;
}

/** A crew lead (core/lead.js) takes a risky call themselves while they have one left ('risky' only: 'every' means every). */
export function leadTakes(state) {
  const am = state.activeMission;
  return am.callIn === 'risky' && (am.lead?.calls ?? 0) > 0 && !am.critical && !am.pending && !am.done && !dayDone(am)
    && currentStep(am)?.type === 'crisis' && wouldCall(state);
}

// --- away jobs, day by day (core/away.js) ----------------------------------

/** How many of the job's beats it has reached by the end of day d (1-based) of its days. */
export function beatsByDay(beats, days, d) {
  if (d >= days) return beats;
  return Math.floor((d * beats) / days); // quiet days fall early: casing the place first
}

/** Queue position where an away job's work stops today: its next unreached beat, or the end. */
function stopIndex(am) {
  const beats = templateById(am.templateId).beats.length;
  if (am.away.beats >= beats) return am.queue.length;
  const at = am.queue.findIndex((q) => q.type === 'beat' && q.index === am.away.beats);
  return at < 0 ? am.queue.length : at;
}

/** Has an away job done today's share? Not while a call-in is in hand, and never under command. */
export function dayDone(am) {
  if (!am?.away || am.away.command || am.done) return false;
  if (am.critical || am.pending) return false;
  return am.step >= stopIndex(am);
}

/**
 * Take one step the crew can take on its own: a beat, a zone, an incident, or (when the player
 * isn't called) a crisis or decision under the standing orders. A hands-off crew always extracts
 * from a critical. Returns the same state when the run is waiting for the player or done.
 * force: decide everything (hands-off runs).
 */
export function autoStep(prev, { force = false } = {}) {
  const am0 = prev.activeMission;
  if (!am0 || am0.done || (!force && needsPlayer(prev))) return prev;
  const s = structuredClone(prev);
  const am = s.activeMission;
  const orders = ORDERS[am.orders] ? am.orders : 'steady';
  if (am.critical) {
    am.nextWhy = 'Hands-off crews always get the wounded out.';
    return resolveCritical(s, 'extract');
  }
  if (am.pending) {
    const { id, why } = am.pending.kind === 'dilemma' ? fightAnswer(am) : ordersDecision(am.pending.kind, orders, { standby: !!describePending(s).standby });
    am.nextWhy = why;
    return resolvePending(s, id);
  }
  const type = currentStep(am)?.type;
  if (type === 'beat') return revealBeat(s);
  if (type === 'zone') return enterZone(s);
  if (type === 'incident') return runIncident(s);
  if (type === 'battle') return runBattle(s);
  if (type === 'crisis') {
    const led = leadTakes(s);
    const { id, why } = decide(s, orders);
    am.nextWhy = led ? `${am.lead.handle} made the call as lead. ${why}` : why;
    if (led) am.lead.calls -= 1;
    return chooseOption(s, id);
  }
  return prev;
}

/** Play the active job to the end under standing orders. Returns the new state (job done). */
export function autoRun(prev, ordersId) {
  let s = structuredClone(prev);
  s.activeMission.orders = ORDERS[ordersId] ? ordersId : 'steady';
  s.activeMission.callIn = 'never'; // nobody to call: the orders decide everything
  for (let guard = 0; guard < 160 && !s.activeMission.done; guard++) {
    const next = autoStep(s, { force: true });
    if (next === s) throw new Error('Hands-off run got stuck');
    s = next;
  }
  if (!s.activeMission.done) throw new Error('Hands-off run did not finish');
  return s;
}

/** Can this job be sent hands-off? Every job can, unless its template opts out with handsOff: false (DESIGN.md, 2026-11-04). */
export const handsOffAllowed = (tpl) => Boolean(tpl && (tpl.handsOff ?? true));

const crewNames = (handles) => (handles.length > 1 ? `${handles.slice(0, -1).join(', ')} and ${handles.at(-1)}` : handles[0]);

/**
 * Send a crew away on a job. They're away until it ends, playing a share each day (core/away.js
 * advanceAway); opts.callIn says when they call you ('never' unless given: fully hands-off).
 */
export function sendOff(prev, jobId, crewIds, approach, ordersId, opts = {}) {
  const job = prev.jobs.find((j) => j.id === jobId);
  if (!job || !handsOffAllowed(templateById(job.templateId))) return prev;
  const s = startMission(prev, jobId, crewIds, approach, { ...opts, callIn: opts.callIn ?? 'never', orders: ordersId });
  if (s === prev) return prev;
  const am = s.activeMission;
  const tpl = templateById(am.templateId);
  am.orders = ORDERS[ordersId] ? ordersId : 'steady';
  am.startedDay = s.day;
  am.away = { beats: 0 }; // beats reached so far (core/away.js)
  const days = am.days ?? tpl.days;
  const returnDay = s.day + days;
  const crew = [...am.crewIds, am.overwatch?.id, am.wheels, am.standby?.id].filter(Boolean).map((id) => s.crew.find((o) => o.id === id)).filter(Boolean);
  for (const op of crew) op.condition.awayUntil = returnDay;
  s.awayJobs = [...(s.awayJobs ?? []), { returnDay, mission: am }];
  s.activeMission = null;
  const who = crewNames(crew.map((o) => o.handle));
  s.inbox.unshift({
    id: `sent-${am.jobId}`, type: 'job', day: s.day,
    subject: `${who} ${crew.length > 1 ? 'are' : 'is'} out on ${tpl.name}`,
    body: `Sent on ${ORDERS[am.orders].name} orders${am.callIn === 'never' ? ', and they won\'t call' : am.callIn === 'every' ? ', calling you at every crisis' : ', calling you when it gets risky'}. The report comes back ${days === 1 ? 'tomorrow' : `in ${days} days`}, when they do.`,
    blocking: false, read: true,
  });
  return s;
}

/** Hands-off jobs still out: [{ returnDay, name, crewIds }]. */
export function awayJobs(state) {
  return (state.awayJobs ?? []).map((j) => ({ returnDay: j.returnDay, name: templateById(j.mission.templateId)?.name ?? j.mission.templateId, crewIds: j.mission.crewIds }));
}
