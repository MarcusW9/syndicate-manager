// Mission engine: plan -> tap-through beats -> crisis decisions -> outcome.
// Pure logic. Every function takes state and returns a new state.
//
// Death rule: an operative can only die after the player chooses "Push on"
// while they are critical. Abort/extract always saves everyone.

import { templateById, twistById, jobView } from './jobs.js';
import { adjustTrust, clientById, completionTrust, ABORT_TRUST } from './clients.js';
import { nextRng } from './random.js';
import { d20 } from './rng.js';
import { checkRenewal } from './renewals.js';
import { APPROACHES, crewRoll, effectiveStat, findRole, worsenInjury, setInjury, maxCrew } from './crew.js';
import { successChance, riskLabel } from './risk.js';
import { clampHeat, WATCHED_PENALTY } from './heat.js';
import { XP, applyGrowth, gainXp, primaryStat } from './development.js';
import { freelancerAsCrew, freelanceCut, isFreelancer, MAX_FREELANCERS_PER_JOB } from './freelance.js';
import { reactToJob, RUMOUR_CRISIS_CHANCE } from './rumours.js';
import { CAST } from '../data/cast.js';
import { DISTRICTS } from '../data/districts.js';
import { NAMES } from '../config/names.js';
import { money } from './money.js';

const EXIT_KINDS = new Set(['abort', 'extract']);
const STABILISE_DIFFICULTY = 9;

const crewOf = (state, am) => am.crewIds.map((id) => state.crew.find((o) => o.id === id)).filter(Boolean);
const opById = (state, id) => state.crew.find((o) => o.id === id);
const crisisById = (tpl, id) => tpl.crises.find((c) => c.id === id) ?? twistById(id);

/** Difficulty of a roll on this job: the offer's threat change shifts every roll by 1 per step. */
export const REP_PER_THREAT = 0.75;
export const ABORT_REP = 3;

const rollDifficulty = (am, choice) => choice.difficulty + (am.threatDelta ?? 0);

const STAT_NAME = (s) => s[0].toUpperCase() + s.slice(1);

/**
 * Growth happens the moment it's earned (see development.js). Rises are
 * flashed in the mission log and collected for the level-up cards at the end.
 */
function grow(state, am, op, stat, points) {
  if (isFreelancer(op)) return; // they learn on someone else's payroll
  const { events, graduated } = gainXp(op, crewOf(state, am), stat, points, state.day);
  for (const e of events) {
    am.growth = [...(am.growth ?? []), e];
    am.log.push({ kind: 'growth', text: `▲ ${e.handle}: ${STAT_NAME(e.stat)} ${e.from} → ${e.to}` });
    if (e.wall) am.log.push({ kind: 'growth', text: `${e.handle} has hit a wall in ${e.stat}. It'll come slower from here.` });
  }
  if (graduated) {
    am.graduated = [...(am.graduated ?? []), op.id];
    am.log.push({ kind: 'growth', text: `★ ${op.handle} isn't a rookie any more.` });
  }
}

const hash = (str) => { let h = 0; for (const ch of str) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h; };

/**
 * Replace {driver}, {tech}, {face}, {muscle}, {medic}, {op} with crew handles; {district}
 * and {faction} with the job's district; {siu} with a cast name and {siu:approve} with one
 * of their lines (data/cast.js), picked the same way every time for this job and step.
 */
export function fill(text, state, am) {
  const crew = crewOf(state, am);
  const district = templateById(am.templateId)?.district;
  return text.replace(/\{(\w+)(?::(\w+))?\}/g, (_, key, sub, offset, whole) => {
    if (CAST[key]) {
      const lines = sub ? CAST[key].lines?.[sub] : null;
      return lines?.length ? lines[hash(`${am.jobId}:${am.step}:${key}:${sub}`) % lines.length] : CAST[key].name;
    }
    if (key === 'district') return NAMES.districtsInText[district] ?? 'the city';
    if (key === 'faction') return DISTRICTS[district]?.faction ?? 'the local crew';
    const op = key === 'op' ? opById(state, am.focusOp) : crew.find((o) => o.role === key);
    if (op) return op.handle;
    const startsSentence = offset === 0 || /[.!?:]["']?\s+$/.test(whole.slice(0, offset));
    return startsSentence ? 'Someone' : 'someone';
  });
}

/** The plain one-line version of what happened, for the after-action message (and, later, autonomous runs). */
function addReport(state, am, choice, success) {
  const line = choice.report?.[success ? 'success' : 'failure'];
  if (line) am.report = [...(am.report ?? []), fill(line, state, am)];
}

/** A job's brief, filled before any crew is picked (planning screen): cast, {district}, {faction}. */
export function fillBrief(tpl) {
  return tpl.brief.replace(/\{(\w+)(?::(\w+))?\}/g, (_, key, sub) => {
    if (CAST[key]) {
      const lines = sub ? CAST[key].lines?.[sub] : null;
      return lines?.length ? lines[hash(`${tpl.id}:brief:${key}:${sub}`) % lines.length] : CAST[key].name;
    }
    if (key === 'district') return NAMES.districtsInText[tpl.district] ?? 'the city';
    if (key === 'faction') return DISTRICTS[tpl.district]?.faction ?? 'the local crew';
    return 'your crew';
  });
}

export function currentStep(am) {
  return am?.queue[am.step] ?? null;
}

// --- starting ------------------------------------------------------------

export function startMission(prev, jobId, crewIds, approach) {
  const state = structuredClone(prev);
  const job = state.jobs.find((j) => j.id === jobId);
  if (!job) return prev;
  const tpl = templateById(job.templateId);
  if (!crewIds.length || crewIds.length > maxCrew(tpl.crewSize)) return prev;
  // Freelancers from the board join the crew for this job only.
  const hired = (state.freelancers ?? []).filter((f) => crewIds.includes(f.id));
  if (hired.length > MAX_FREELANCERS_PER_JOB) return prev;
  if (crewIds.some((id) => !state.crew.some((o) => o.id === id) && !hired.some((f) => f.id === id))) return prev;
  state.freelancers = (state.freelancers ?? []).filter((f) => !hired.includes(f));
  for (const f of hired) state.crew.push(freelancerAsCrew(f));
  const view = jobView(state, job);
  const rng = nextRng(state);

  // Draw 2 crises (3 on threat 4+ if the pool allows), in random order.
  const pool = [...tpl.crises];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  // Street talk about a district crisis makes it likely to come up (drawn first most of the time).
  const talk = view.rumour?.crisis ? pool.findIndex((c) => c.id === view.rumour.crisis) : -1;
  if (talk > 0 && rng() < RUMOUR_CRISIS_CHANCE) [pool[0], pool[talk]] = [pool[talk], pool[0]];
  // Story order: a crisis's `order` sorts the drawn ones (stable, so equal orders stay random).
  const crises = pool.slice(0, Math.min(pool.length, view.threat >= 4 ? 3 : 2)).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  // Spread crises between beats. A crisis with `after: b` waits until beat b has been told;
  // none goes after the last beat, and they keep their order.
  const n = tpl.beats.length;
  const positions = [];
  crises.forEach((c, i) => {
    const spread = Math.max(1, Math.floor(((i + 1) * n) / (crises.length + 1)));
    positions.push(Math.min(n - 1, Math.max(spread, (c.after ?? -1) + 1, positions[i - 1] ?? 1)));
  });
  const queue = [];
  for (let b = 0; b < n; b++) {
    queue.push({ type: 'beat', index: b });
    positions.forEach((p, i) => { if (p === b + 1) queue.push({ type: 'crisis', id: crises[i].id }); });
  }
  // A twist lands somewhere in the middle of the job, never before the first beat.
  if (job.twist) {
    const at = 1 + Math.floor(rng() * (queue.length - 1));
    queue.splice(at, 0, { type: 'crisis', id: job.twist, twist: true });
  }

  state.jobs = state.jobs.filter((j) => j.id !== jobId);
  state.lastJobDay = state.day;
  // Heat the player let ride lands on this job's first crisis roll, then it's spent.
  const watched = state.heatWatched ? WATCHED_PENALTY : 0;
  state.heatWatched = false;
  state.activeMission = {
    jobId, templateId: tpl.id, crewIds, approach,
    pay: view.pay, threat: view.threat, threatDelta: view.threatDelta, clientId: job.clientId ?? null, twist: job.twist ?? null,
    queue, step: 0, log: [],
    payCut: 0, extraHeat: 0, clientTrust: 0, watched,
    critical: null, stabiliseFailed: false, untreated: [],
    focusOp: null, aborted: false, done: false, result: null, growth: [], graduated: [], report: [],
  };
  return state;
}

// --- beats -----------------------------------------------------------------

export function revealBeat(prev) {
  const state = structuredClone(prev);
  const am = state.activeMission;
  const step = currentStep(am);
  if (!am || am.critical || step?.type !== 'beat') return prev;
  const tpl = templateById(am.templateId);
  am.log.push({ kind: 'beat', text: fill(tpl.beats[step.index], state, am) });
  advance(state);
  return state;
}

function advance(state) {
  const am = state.activeMission;
  am.step += 1;
  const step = currentStep(am);
  if (step?.type === 'crisis') {
    const crisis = crisisById(templateById(am.templateId), step.id);
    if (step.twist) am.log.push({ kind: 'twist', text: `Twist: ${crisis.name}` });
    const crew = crewOf(state, am).filter((o) => o.condition.injury !== 'critical');
    const focus = crisis.focusRole ? crew.find((o) => o.role === crisis.focusRole) : null;
    const rng = nextRng(state);
    am.focusOp = (focus ?? crew[Math.floor(rng() * crew.length)])?.id ?? null;
  }
  if (am.step >= am.queue.length && !am.critical) finish(state);
}

// --- crisis choices ----------------------------------------------------------

function meetsRequirement(crew, req) {
  if (!req) return { ok: true };
  if (req.kind === 'role') return findRole(crew, req.value) ? { ok: true } : { ok: false, reason: `Needs a ${req.value} on the job` };
  if (req.kind === 'trait') return crew.some((o) => o.traits.includes(req.value)) ? { ok: true } : { ok: false, reason: 'Nobody on the crew can do this' };
  if (req.kind === 'stat') return crew.some((o) => (o.stats[req.value] ?? 0) >= req.min) ? { ok: true } : { ok: false, reason: `Needs ${req.value} ${req.min}+` };
  return { ok: true };
}

/** The medic's own stabilising value (Steady Hands adds 2). */
function medicLead(medic, am, crew) {
  const s = effectiveStat(medic, 'medical', { approach: am.approach, crew });
  return { op: medic, value: s.value + (medic.traits.includes('steady_hands') ? 2 : 0), notes: s.notes };
}

/** Who rolls and with what: the shared crew rule (backup, short-handed) from crew.js. */
function rollerFor(state, am, choice, crew) {
  const recommended = templateById(am.templateId).crewSize;
  const medic = choice.kind === 'stabilise' ? findRole(crew, 'medic') : null;
  const stat = medic ? 'medical' : choice.stat;
  return crewRoll(crew, stat, { approach: am.approach, recommended, lead: medic ? medicLead(medic, am, crew) : undefined, watched: am.watched ?? 0 });
}

/** Stabilising a critical operative: the medic leads, the same crew rule applies. */
function stabiliser(state, am, patient) {
  const crew = crewOf(state, am);
  const medic = findRole(crew.filter((o) => o.id !== patient.id), 'medic');
  if (!medic) return null;
  return crewRoll(crew, 'medical', { approach: am.approach, recommended: templateById(am.templateId).crewSize, lead: medicLead(medic, am, crew) });
}

// Who gets hurt on a failure: the crisis's focus operative if it has one
// (e.g. the tech in the server room), otherwise whoever made the attempt.
function failureTarget(state, am, roller) {
  const step = currentStep(am);
  const crisis = step?.type === 'crisis' ? crisisById(templateById(am.templateId), step.id) : null;
  const focus = crisis?.focusRole ? opById(state, am.focusOp) : null;
  if (focus && focus.condition.injury !== 'critical' && am.crewIds.includes(focus.id)) return focus;
  return roller;
}

function costText(cost = {}) {
  const parts = [];
  if (cost.payCut > 0) parts.push(cost.payCut >= 1 ? 'lose all pay' : `lose ${Math.round(cost.payCut * 100)}% of pay`);
  if (cost.payCut < 0) parts.push(`+${Math.round(-cost.payCut * 100)}% pay`);
  if (cost.heat) parts.push(`+${cost.heat} heat`);
  if (cost.clientTrust) parts.push('client unhappy');
  if (cost.cash) parts.push(`${cost.cash > 0 ? '+' : ''}${cost.cash} cash`);
  return parts.join(', ');
}

/** Cost line for the choice button: what you pay anyway, plus any bonus if it works. */
function choiceCostText(choice) {
  const always = costText(choice.cost);
  const bonus = choice.successCost ? `if it works: ${costText(choice.successCost)}` : '';
  return [always, bonus].filter(Boolean).join('; ');
}

/** Everything the UI needs to show the current crisis. */
export function describeCrisis(state) {
  const am = state.activeMission;
  const step = currentStep(am);
  if (!am || am.critical || step?.type !== 'crisis') return null;
  const tpl = templateById(am.templateId);
  const crisis = crisisById(tpl, step.id);
  const crew = crewOf(state, am);
  const choices = crisis.choices.map((choice) => {
    const req = meetsRequirement(crew, choice.requires);
    const view = { id: choice.id, label: fill(choice.label, state, am), kind: choice.kind, available: req.ok, reason: req.reason ?? '', cost: choiceCostText(choice) };
    if (EXIT_KINDS.has(choice.kind)) return { ...view, risk: 'safe', riskReason: 'Everyone gets out alive' };
    if (!req.ok) return view;
    if (choice.sure) return { ...view, risk: 'certain', riskReason: 'No roll needed' };
    const roller = rollerFor(state, am, choice, crew);
    const chance = successChance(roller.value, rollDifficulty(am, choice));
    const target = failureTarget(state, am, roller.op);
    const bits = [`${roller.op.handle} on ${choice.stat} (${roller.value}${roller.notes.length ? ', ' + roller.notes.join(', ') : ''})`];
    const fails = [];
    if (choice.failureInjury && choice.failureInjury !== 'none') fails.push(`${choice.failureInjury} injury to ${target.handle}`);
    if (choice.failureCost) fails.push(costText(choice.failureCost));
    if (fails.length) bits.push(`If it fails: ${fails.join(', ')}`);
    return { ...view, risk: riskLabel(chance), riskReason: bits.join('. ') + '.' };
  });
  return { text: fill(crisis.text, state, am), choices };
}

export function chooseOption(prev, choiceId) {
  const state = structuredClone(prev);
  const am = state.activeMission;
  const step = currentStep(am);
  if (!am || am.critical || step?.type !== 'crisis') return prev;
  const tpl = templateById(am.templateId);
  const crisis = crisisById(tpl, step.id);
  const choice = crisis.choices.find((c) => c.id === choiceId);
  const crew = crewOf(state, am);
  if (!choice || !meetsRequirement(crew, choice.requires).ok) return prev;

  am.log.push({ kind: 'crisis', text: fill(crisis.text, state, am) });
  am.log.push({ kind: 'choice', text: fill(choice.label, state, am) });
  const cost = choice.cost ?? {};
  am.payCut += cost.payCut ?? 0;
  am.extraHeat += cost.heat ?? 0;
  am.clientTrust += cost.clientTrust ?? 0;
  if (cost.cash) state.cash += cost.cash;

  if (EXIT_KINDS.has(choice.kind)) {
    am.log.push({ kind: 'good', text: fill(choice.success, state, am) });
    addReport(state, am, choice, true);
    am.aborted = true;
    if (step.twist) am.abortedOnTwist = true; // walking away from a job the client misrepresented isn't held against you
    am.step = am.queue.length - 1;
    advance(state);
    return state;
  }

  const roller = rollerFor(state, am, choice, crew);
  const rng = nextRng(state);
  const success = choice.sure || d20(rng) + roller.value >= 10 + rollDifficulty(am, choice);
  if (!choice.sure) am.watched = 0; // the watched penalty covers the first roll only

  // Everyone learns from a roll: the roller most (even on a failure), the rest by watching.
  if (!choice.sure) {
    grow(state, am, roller.op, choice.stat, XP.roll);
    for (const o of crew) if (o.id !== roller.op.id && o.condition.injury !== 'critical') grow(state, am, o, choice.stat, XP.watch);
  }

  if (choice.neural) {
    const rate = roller.op.traits.includes('chromed') ? 1.5 : 1;
    roller.op.condition.neuralLoad = Math.min(100, roller.op.condition.neuralLoad + Math.round(choice.neural * rate));
  }

  addReport(state, am, choice, success);
  if (success) {
    am.log.push({ kind: 'good', text: fill(choice.success, state, am) });
    const sc = choice.successCost ?? {};
    am.payCut += sc.payCut ?? 0;
    am.extraHeat += sc.heat ?? 0;
    if (sc.cash) state.cash += sc.cash;
  } else {
    am.log.push({ kind: 'bad', text: fill(choice.failure, state, am) });
    const fc = choice.failureCost ?? {};
    am.payCut += fc.payCut ?? 0;
    am.extraHeat += fc.heat ?? 0;
    if (fc.cash) state.cash += fc.cash;
    if (choice.failureInjury && choice.failureInjury !== 'none') {
      const target = failureTarget(state, am, roller.op);
      const injury = worsenInjury(target.condition.injury, choice.failureInjury);
      setInjury(target, injury);
      am.log.push({ kind: 'injury', text: `${target.handle}: ${injury} injury.` });
      if (injury === 'critical') {
        am.critical = target.id;
        am.stabiliseFailed = false;
      }
    }
  }
  advance(state);
  return state;
}

// --- critical state ------------------------------------------------------------

export function describeCritical(state) {
  const am = state.activeMission;
  if (!am?.critical) return null;
  const op = opById(state, am.critical);
  const crew = crewOf(state, am);
  const medic = findRole(crew.filter((o) => o.id !== op.id), 'medic');
  const choices = [];
  if (!am.stabiliseFailed) {
    if (medic) {
      const r = stabiliser(state, am, op);
      choices.push({ id: 'stabilise', label: `${medic.handle} stabilises ${op.handle}`, available: true, cost: '+1 heat',
        risk: riskLabel(successChance(r.value, STABILISE_DIFFICULTY)), riskReason: `${medic.handle} on medical (${r.value}${r.notes.length ? ', ' + r.notes.join(', ') : ''}). If it fails you must extract or push on.` });
    } else {
      choices.push({ id: 'stabilise', label: `Stabilise ${op.handle}`, available: false, reason: 'Needs a medic on the job' });
    }
  }
  choices.push({ id: 'extract', label: `Extract ${op.handle} now`, available: true, cost: 'job ends, lose half the pay', risk: 'safe', riskReason: `${op.handle} survives with a serious injury` });
  const deathRisk = medic ? 'high' : 'extreme';
  choices.push({ id: 'push', label: 'Push on and finish the job', available: true, cost: '',
    risk: deathRisk, riskReason: `${op.handle} could die before you get out${medic ? '' : '; nobody can treat them on the way'}` });
  return { op: { id: op.id, handle: op.handle, name: op.name }, stabiliseFailed: am.stabiliseFailed, choices };
}

export function resolveCritical(prev, option) {
  const state = structuredClone(prev);
  const am = state.activeMission;
  if (!am?.critical) return prev;
  const op = opById(state, am.critical);
  const crew = crewOf(state, am);

  if (option === 'stabilise' && !am.stabiliseFailed) {
    const r = stabiliser(state, am, op);
    if (!r) return prev;
    const medic = r.op;
    am.extraHeat += 1;
    am.log.push({ kind: 'choice', text: `${medic.handle} works on ${op.handle}.` });
    const stabilised = d20(nextRng(state)) + r.value >= 10 + STABILISE_DIFFICULTY;
    grow(state, am, medic, 'medical', XP.roll);
    if (stabilised) {
      setInjury(op, 'serious');
      am.log.push({ kind: 'good', text: `The bleeding stops. ${op.handle} will live, but is out for weeks.` });
      am.critical = null;
    } else {
      am.stabiliseFailed = true;
      am.log.push({ kind: 'bad', text: `${medic.handle} can't stop the bleeding here. Get ${op.handle} out, or push on.` });
      return state;
    }
  } else if (option === 'extract') {
    setInjury(op, 'serious');
    op.condition.injuryDays = 21;
    am.payCut += 0.5;
    am.aborted = true;
    am.critical = null;
    am.log.push({ kind: 'choice', text: `You drop the job and get ${op.handle} out.` });
    am.log.push({ kind: 'good', text: `${op.handle} makes it to a clinic. Alive.` });
    am.step = am.queue.length;
    finish(state);
    return state;
  } else if (option === 'push') {
    am.untreated.push(op.id);
    am.critical = null;
    am.log.push({ kind: 'choice', text: 'You push on.' });
    am.log.push({ kind: 'bad', text: `${op.handle} is left in the back of the van, bleeding. Every minute counts.` });
  } else {
    return prev;
  }

  if (am.step >= am.queue.length) finish(state);
  return state;
}

// --- outcome --------------------------------------------------------------------

function finish(state) {
  const am = state.activeMission;
  if (am.done) return;
  const tpl = templateById(am.templateId);
  const crew = crewOf(state, am);
  const medic = findRole(crew.filter((o) => !am.untreated.includes(o.id)), 'medic');
  const deaths = [];

  for (const id of am.untreated) {
    const op = opById(state, id);
    // Aborting later still gets them out in time: an exit always saves lives.
    const chance = state.difficulty === 'story' || am.aborted ? 1 : 0.35 + (medic ? 0.3 : 0);
    if (nextRng(state)() < chance) {
      setInjury(op, 'serious');
      op.condition.injuryDays = 21;
      am.log.push({ kind: 'good', text: `${op.handle} pulls through. Barely.` });
    } else {
      deaths.push(op);
      am.log.push({ kind: 'death', text: `${op.name} "${op.handle}" dies on the way back.` });
    }
  }

  const basePay = am.pay ?? tpl.pay;
  const threat = am.threat ?? tpl.threat;
  const pay = Math.round((basePay * Math.max(0, 1 - am.payCut)) / 50) * 50;
  // Freelancers who make it back take their share of what was actually paid.
  const freelance = crew.filter((o) => isFreelancer(o) && !deaths.includes(o)).map((o) => ({ handle: o.handle, cut: freelanceCut(o, pay) }));
  const cuts = freelance.reduce((n, f) => n + f.cut, 0);
  const heatGain = (am.aborted ? 0 : tpl.heat + (APPROACHES[am.approach]?.heat ?? 0)) + am.extraHeat;
  state.cash += pay - cuts;
  state.heat = clampHeat(state.heat + heatGain);
  // A finished job earns REP_PER_THREAT per threat level (3 until 2026-10-25; x0.4 for
  // the long climb); an abort costs ABORT_REP (unchanged: scaling it too let crews
  // reach work they weren't ready for, measured 2026-10-25).
  const gain = am.aborted ? -ABORT_REP : threat * REP_PER_THREAT;
  state.reputation = Math.round(Math.max(0, Math.min(100, state.reputation + gain)) * 10) / 10;

  // Clients remember: a finished job builds trust; costs marked "client unhappy" take it away.
  const base = am.aborted ? (am.abortedOnTwist ? 0 : ABORT_TRUST) : completionTrust(threat);
  const trustChange = adjustTrust(state, am.clientId, base + am.clientTrust);

  for (const op of deaths) {
    state.crew = state.crew.filter((o) => o.id !== op.id);
    state.memorial.push({ id: op.id, name: op.name, handle: op.handle, role: op.role, color: op.color, day: state.day, cause: `Died of wounds after the ${tpl.name}${isFreelancer(op) ? ' (freelancer)' : ''}` });
  }

  // Growth: crisis lessons already landed during the job; finishing it also teaches its key stats.
  const survivors = crewOf(state, am);
  for (const op of survivors) if (!isFreelancer(op)) op.jobsWithCrew = (op.jobsWithCrew ?? 0) + 1;
  if (am.xp) { // a job saved mid-way before growth went live still has banked points
    const legacy = applyGrowth(survivors, am.xp, state.day);
    am.growth = [...(am.growth ?? []), ...legacy.events];
    am.graduated = [...(am.graduated ?? []), ...legacy.graduated.map((o) => o.id)];
    delete am.xp;
  }
  if (!am.aborted) {
    for (const op of survivors) {
      for (const stat of tpl.keyStats) grow(state, am, op, stat, XP.job);
      grow(state, am, op, primaryStat(op), XP.craft);
    }
  }
  const growthEvents = (am.growth ?? []).filter((e) => survivors.some((o) => o.id === e.opId));
  const graduatedOps = survivors.filter((o) => (am.graduated ?? []).includes(o.id));
  const growthLines = growthEvents.map((e) => `${e.handle} ${e.stat} ${e.from}→${e.to}`);
  for (const op of graduatedOps) {
    op.history.push(`Day ${state.day}: graduated from rookie`);
    state.inbox.unshift({ id: `graduate-${op.id}-${state.day}`, type: 'crew', day: state.day,
      subject: `${op.handle} isn't a rookie any more`,
      body: `After the ${tpl.name}, nobody on the crew calls ${op.name} the new kid. A pro now, on a rookie's wage.`, blocking: false, read: false });
  }

  // Growth can mean a pay rise: graduation or main stat +2 since the last deal (core/renewals.js).
  for (const op of survivors) if (!isFreelancer(op)) checkRenewal(state, op, graduatedOps.includes(op));

  const injuries = [];
  for (const op of survivors) {
    const c = op.condition;
    c.fatigue = Math.min(100, c.fatigue + 10 + threat * 6);
    c.awayUntil = state.day + tpl.days;
    c.morale = Math.max(0, Math.min(100, c.morale + (deaths.length ? -20 : am.aborted ? -3 : 5)));
    if (c.injury !== 'healthy') injuries.push(`${op.handle} (${c.injury}, ${c.injuryDays}d)`);
    op.history.push(`Day ${state.day}: ${tpl.name}, ${am.aborted ? 'aborted' : 'completed'}`);
    if (c.neuralLoad > 70) {
      state.inbox.unshift({ id: `neural-${op.id}-${state.day}`, type: 'warning', day: state.day,
        subject: `${op.handle}'s neural load is in the danger zone`,
        body: `${op.name} is at ${c.neuralLoad}/100. Rest brings it down; pushing harder risks a breakdown.`, blocking: false, read: false });
    }
  }
  for (const op of state.crew) {
    if (deaths.length && !am.crewIds.includes(op.id)) op.condition.morale = Math.max(0, op.condition.morale - 15);
  }

  const outcome = deaths.length ? 'loss' : am.aborted ? 'aborted' : 'completed';
  const client = clientById(am.clientId);
  am.result = { report: am.report ?? [], outcome, pay, heatGain, injuries, deaths: deaths.map((d) => d.handle), freelance, growth: growthEvents, graduated: graduatedOps.map((o) => ({ id: o.id, handle: o.handle, name: o.name, role: o.role, color: o.color })), client: client?.name ?? null, trustChange };
  am.done = true;

  const subject = deaths.length ? `${deaths.map((d) => d.handle).join(', ')} died on the ${tpl.name}`
    : am.aborted ? `${tpl.name} aborted` : `${tpl.name} completed`;
  state.inbox.unshift({
    id: `report-${state.day}-${state.rngCounter}`, type: 'report', day: state.day, subject,
    body: (am.report?.length ? am.report.join(' ') + ' ' : '') + `Paid ${money(pay)}.` + (cuts ? ` Freelancers took ${money(cuts)}.` : '') + ` Heat +${heatGain}.` + (injuries.length ? ` Injured: ${injuries.join(', ')}.` : ' Nobody hurt.') +
      (deaths.length ? ' Their names go on the wall.' : '') +
      (growthLines.length ? ` Improved: ${growthLines.join(', ')}.` : '') +
      (client && trustChange ? ` ${client.name} ${trustChange > 0 ? 'thinks more of you' : 'is unhappy with you'} (trust ${trustChange > 0 ? '+' : ''}${trustChange}).` : ''),
    blocking: false, read: false,
  });
  reactToJob(state, am, tpl, { heatGain, injuries, deaths });
}

export function closeMission(prev) {
  if (!prev.activeMission?.done) return prev;
  const state = structuredClone(prev);
  state.activeMission = null;
  state.crew = state.crew.filter((o) => !isFreelancer(o)); // freelancers go home after the job
  return state;
}
