// Mission engine: plan -> beats, incidents and crisis decisions -> outcome.
// Pure logic. Every function takes state and returns a new state.
//
// A run (PLAN-CORE-LOOP.md): the queue holds beats, zone markers, incidents (automatic rolls,
// core/incidents.js) and crises (the player's or the orders' call). Unsaved incident failures
// raise the alert; max alert and a serious injury stop the run for a decision (am.pending).
//
// Death rule: an operative can only die after the player chooses "Push on"
// while they are critical. Abort/extract always saves everyone. Incidents never go past a
// serious injury, and every decision they raise has an exit.

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
import { summariseRun, REPORT_LOGS_KEPT } from './report.js';
import { intelFor } from './sidetasks.js';
import { afterJob, noteInjury, spendSecondWind, earnedOf } from './earned.js';
import { planIncidents, weaveIncidents, incidentById, incidentDifficulty, handlerFor, bestSave, decisionChoices, OVERWATCH_KIT, ALERT_MAX, SERIOUS_CHANCE, SERIOUS_PER_ALERT, PATCH_MIN_MEDICAL, ZONES } from './incidents.js';

const EXIT_KINDS = new Set(['abort', 'extract']);
const STABILISE_DIFFICULTY = 9;

const crewOf = (state, am) => am.crewIds.map((id) => state.crew.find((o) => o.id === id)).filter(Boolean);
// Who can still act: the inside crew minus anyone an incident has put out of the job.
const actors = (state, am) => crewOf(state, am).filter((o) => !(am.out ?? []).includes(o.id) && o.condition.injury !== 'critical');
const overwatchOp = (state, am) => (am.overwatch ? state.crew.find((o) => o.id === am.overwatch.id) ?? null : null);
// Everyone on the job: the inside crew and overwatch (away, tired and learning together).
const onJob = (state, am) => [...crewOf(state, am), ...[overwatchOp(state, am)].filter(Boolean)];
const opById = (state, id) => state.crew.find((o) => o.id === id);
const crisisById = (tpl, id) => tpl.crises.find((c) => c.id === id) ?? twistById(id);

/** Difficulty of a roll on this job: the offer's threat change shifts every roll by 1 per step. */
export const REP_PER_THREAT = 0.75;
export const ABORT_REP = 3;

const rollDifficulty = (am, choice) => choice.difficulty + (am.threatDelta ?? 0) + (am.alert ?? 0);

/** Call-in rules (who decides at a crisis): the player every time, only when it's risky, or never (hands-off). */
export const CALL_IN = {
  every: { name: 'Every crisis', desc: 'You make every call.' },
  risky: { name: 'When it\'s risky', desc: 'They call you when their best option is less than even odds. Otherwise their orders decide.' },
  never: { name: 'Never', desc: 'They go and do it. The report comes back when they do.' },
};
export const RISKY_BELOW = 0.5;

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
function addReport(state, am, choice, success, voice = am) {
  const line = reportLine(state, voice, choice, success);
  if (line) am.report = [...(am.report ?? []), line];
}

/**
 * Who a choice's own text calls {op}: whoever makes its roll, so "{op} steps forward"
 * names the person who rolls (and, with no focus role, gets hurt). A crisis with a focus
 * role keeps its focus person: the text is about them, and they take the injury.
 */
function choiceVoice(am, crisis, roller) {
  return roller && !crisis.focusRole ? { ...am, focusOp: roller.op.id } : am;
}

function reportLine(state, am, choice, success) {
  const line = choice.report?.[success ? 'success' : 'failure'];
  return line ? fill(line, state, am) : null;
}

/** Add a fact to the run's record (am.events, save v16; a job saved mid-way before then starts one). */
function record(am, event) {
  (am.events ??= []).push(event);
}

/** A hands-off run's reason for its next pick (core/autorun.js), used once. */
function takeWhy(am) {
  const why = am.nextWhy ?? null;
  delete am.nextWhy;
  return why;
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

/**
 * Start a job. opts: { overwatch: { id, kit } (one crew member outside the inside crew, with the
 * shared rifle or drone), callIn ('every' | 'risky' | 'never'), orders (how the crew decides when
 * it doesn't call you: core/autorun.js ORDERS) }.
 */
export function startMission(prev, jobId, crewIds, approach, opts = {}) {
  const state = structuredClone(prev);
  const job = state.jobs.find((j) => j.id === jobId);
  if (!job) return prev;
  const tpl = templateById(job.templateId);
  if (!APPROACHES[approach]) return prev;
  if (!crewIds.length || crewIds.length > maxCrew(tpl.crewSize)) return prev;
  const ow = opts.overwatch?.id ? opts.overwatch : null;
  if (ow && (!OVERWATCH_KIT[ow.kit] || crewIds.includes(ow.id) || !state.crew.some((o) => o.id === ow.id))) return prev;
  // Freelancers from the board join the crew for this job only.
  const hired = (state.freelancers ?? []).filter((f) => crewIds.includes(f.id));
  if (hired.length > MAX_FREELANCERS_PER_JOB) return prev;
  if (crewIds.some((id) => !state.crew.some((o) => o.id === id) && !hired.some((f) => f.id === id))) return prev;
  state.freelancers = (state.freelancers ?? []).filter((f) => !hired.includes(f));
  for (const f of hired) state.crew.push(freelancerAsCrew(f));
  const view = jobView(state, job);
  const rng = nextRng(state);

  // Draw 2 crises (3 on threat 4+ if the pool allows) in a random order weighted by the approach:
  // crises in situations it favours come up more, ones it avoids less (data/approaches.js).
  const ap = APPROACHES[approach];
  const weight = (c) => { const sit = c.situations ?? []; return sit.some((x) => ap.favours?.includes(x)) ? 2 : sit.some((x) => ap.avoids?.includes(x)) ? 0.5 : 1; };
  const pool = tpl.crises.map((c) => ({ c, key: rng() ** (1 / weight(c)) })).sort((a, b) => b.key - a.key).map((x) => x.c);
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
  // Incidents: the way in, inside, the target (core/incidents.js).
  queue.splice(0, queue.length, ...weaveIncidents(queue, planIncidents(rng, approach, view.threat)));
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
  // The approach's costs: time away, and props and bribes paid up front (data/approaches.js).
  const days = Math.max(1, tpl.days + (ap.days ?? 0));
  const bribe = (ap.bribePerThreat ?? 0) * view.threat;
  state.cash -= bribe;
  state.activeMission = {
    jobId, templateId: tpl.id, crewIds, approach, days, bribe,
    overwatch: ow ? { id: ow.id, kit: ow.kit, left: OVERWATCH_KIT[ow.kit].uses } : null,
    callIn: CALL_IN[opts.callIn] ? opts.callIn : 'every', orders: opts.orders ?? null,
    alert: 0, out: [], pending: null, wentLoud: false,
    pay: view.pay, threat: view.threat, threatDelta: view.threatDelta, clientId: job.clientId ?? null, twist: job.twist ?? null,
    queue, step: 0, log: [],
    payCut: 0, extraHeat: 0, clientTrust: 0, watched,
    critical: null, stabiliseFailed: false, untreated: [],
    focusOp: null, aborted: false, done: false, result: null, growth: [], graduated: [], report: [],
    events: [], // the run as recorded facts, for the report's full log (save v16)
  };
  return state;
}

// --- beats -----------------------------------------------------------------

export function revealBeat(prev) {
  const state = structuredClone(prev);
  const am = state.activeMission;
  const step = currentStep(am);
  if (!am || am.critical || am.pending || step?.type !== 'beat') return prev;
  const tpl = templateById(am.templateId);
  const text = fill(tpl.beats[step.index], state, am);
  am.log.push({ kind: 'beat', text });
  record(am, { kind: 'beat', text, first: step.index === 0, last: step.index === tpl.beats.length - 1 });
  advance(state);
  return state;
}

function advance(state) {
  const am = state.activeMission;
  am.step += 1;
  const step = currentStep(am);
  if (step?.type === 'crisis') {
    const crisis = crisisById(templateById(am.templateId), step.id);
    if (step.twist) {
      am.log.push({ kind: 'twist', text: `Twist: ${crisis.name}` });
      record(am, { kind: 'twist', text: crisis.name });
    }
    const crew = actors(state, am).filter((o) => o.condition.injury !== 'critical');
    const focus = crisis.focusRole ? crew.find((o) => o.role === crisis.focusRole) : null;
    const rng = nextRng(state);
    am.focusOp = (focus ?? crew[Math.floor(rng() * crew.length)])?.id ?? null;
  }
  if (am.step >= am.queue.length && !am.critical && !am.pending) finish(state);
}

// --- zones and incidents -------------------------------------------------------

/** Step past a zone marker (the run moves on: the way in, inside, the target, the way out). */
export function enterZone(prev) {
  if (currentStep(prev.activeMission)?.type !== 'zone' || prev.activeMission.pending || prev.activeMission.critical) return prev;
  const state = structuredClone(prev);
  const am = state.activeMission;
  const zone = currentStep(am).zone;
  am.zone = zone;
  if (ZONES[zone]) {
    am.log.push({ kind: 'zone', text: ZONES[zone].name });
    record(am, { kind: 'zone', zone, text: ZONES[zone].name });
  }
  advance(state);
  return state;
}

/** What earned traits need to know about an incident roll (the same shape as a crisis's, core/earned.js). */
function incidentContext(state, am, inc, diff) {
  const events = am.events ?? [];
  return {
    situations: inc.situations ?? [], difficulty: diff, safest: false, district: templateById(am.templateId).district,
    injured: events.filter((e) => e.injury).map((e) => e.injury.id),
    rolled: events.filter((e) => e.kind === 'roll' && e.actor).map((e) => e.actor.id),
    secondWindUsed: am.secondWind ?? [],
  };
}

/** Exit the job from a decision: everyone comes home (the death rule), the job ends. */
function exitRun(state, am, { text, choice, report, why }) {
  am.aborted = true;
  am.pending = null;
  am.log.push({ kind: 'choice', text: choice });
  record(am, { kind: 'exit', text, choice, why: why ?? null, report, choiceCost: {} });
  am.report = [...(am.report ?? []), report];
  am.step = am.queue.length;
  finish(state);
}

/**
 * Resolve the incident at the current step: whoever inside has the best odds rolls; a person in
 * danger who fails gets one save from a teammate or overwatch; an unsaved failure lands its cost and
 * raises the alert. A serious injury or max alert stops the run for a decision (am.pending).
 */
export function runIncident(prev) {
  const step = currentStep(prev.activeMission);
  if (step?.type !== 'incident' || prev.activeMission.pending || prev.activeMission.critical) return prev;
  const state = structuredClone(prev);
  const am = state.activeMission;
  const tpl = templateById(am.templateId);
  // Once the crew has gone loud, what's left (short of the target) is a fight.
  const id = am.wentLoud && step.zone !== 'target' && !incidentById(step.id).danger ? 'guard' : step.id;
  const inc = incidentById(id);
  const able = actors(state, am);
  if (!able.length) {
    exitRun(state, am, { text: 'Nobody left who can carry on.', choice: 'The crew pull out', report: 'With nobody left standing to finish it, the crew pulled out.' });
    return state;
  }
  const diff = incidentDifficulty(tpl, am, inc);
  // The heat penalty for letting it ride is on the first crisis roll (core/heat.js), so incidents leave it alone.
  const rollCtx = { approach: am.approach, recommended: tpl.crewSize, intel: intelFor(state, tpl.district), job: incidentContext(state, am, inc, diff) };
  const h = handlerFor(able, inc, diff, rollCtx);
  if (!h) {
    exitRun(state, am, { text: 'Nobody left who can carry on.', choice: 'The crew pull out', report: 'With nobody left standing to finish it, the crew pulled out.' });
    return state;
  }
  const op = h.roll.op;
  const voice = { ...am, focusOp: op.id };
  const rng = nextRng(state);
  const die = d20(rng);
  const need = 10 + diff;
  const success = die + h.roll.value >= need;
  if (h.roll.notes.some((n) => n.startsWith('Second Wind'))) {
    am.secondWind = [...(am.secondWind ?? []), op.id];
    spendSecondWind(state, op);
  }
  const notes = am.alert ? [...h.roll.notes, `alert +${am.alert} difficulty`] : h.roll.notes;
  const event = {
    kind: 'roll', incident: id, zone: step.zone, crisis: `incident:${id}`, choiceId: null, situations: [...(inc.situations ?? [])],
    text: fill(inc.text, state, voice), choice: fill(success ? inc.hOk : inc.hBad, state, voice),
    stat: h.stat, actor: { id: op.id, handle: op.handle }, value: h.roll.value, notes, die, need, success,
    choiceCost: {}, outcomeCost: success ? {} : { heat: inc.fail.heat ?? 0, payCut: inc.fail.payCut ?? 0 }, injury: null,
    report: fill(success ? inc.ok : inc.bad, state, voice),
    why: `Best placed: ${op.handle} (${h.stat} ${h.roll.value}).`,
  };
  am.log.push({ kind: 'incident', text: event.text });
  am.log.push({ kind: success ? 'good' : 'bad', text: event.report });
  grow(state, am, op, h.stat, XP.incident);
  am.report = [...(am.report ?? []), event.report];
  // The tech approach's cost: every tech roll loads the hacker's implants.
  const load = APPROACHES[am.approach]?.neural ?? 0;
  if (load && h.stat === 'tech') addNeural(op, load);
  event.alert = am.alert ?? 0; // the alert after this moment (the report's peak); updated below if it fails
  record(am, event);
  if (success) { advance(state); return state; }

  // In danger: one save, from overwatch (if it can see) or the best fighter inside.
  if (inc.danger) {
    const ow = overwatchOp(state, am);
    const save = bestSave({ victim: op, able, overwatch: am.overwatch, overwatchOp: ow, zone: step.zone, diff });
    if (save) {
      const sdie = d20(nextRng(state));
      const saved = sdie + save.value >= save.need;
      const kit = save.via === 'overwatch' ? OVERWATCH_KIT[save.kit] : null;
      if (kit) {
        am.overwatch.left -= 1;
        am.extraHeat += kit.heat;
        if (kit.neural) addNeural(save.op, kit.neural);
      }
      grow(state, am, save.op, save.stat, XP.incident);
      const how = kit ? (save.kit === 'rifle' ? (saved ? `${save.op.handle} takes the shot from overwatch.` : `${save.op.handle}'s shot goes wide.`) : (saved ? `${save.op.handle}'s drone drops in and puts them down.` : `${save.op.handle}'s drone can't get there in time.`))
        : (saved ? `${save.op.handle} gets there and pulls ${op.handle} clear.` : `${save.op.handle} can't reach ${op.handle} in time.`);
      record(am, {
        kind: 'save', via: save.via, kit: save.kit ?? null, patient: op.handle, text: fill(inc.comp ?? '{op} is in trouble.', state, voice),
        choice: saved ? `${save.op.handle} saves ${op.handle}` : `${save.op.handle} can't save ${op.handle}`,
        stat: save.stat, actor: { id: save.op.id, handle: save.op.handle }, value: save.value, notes: save.notes, die: sdie, need: save.need, success: saved,
        choiceCost: {}, outcomeCost: kit?.heat ? { heat: kit.heat } : {}, report: how,
        why: kit ? `${save.op.handle} had the ${save.kit} on overwatch, and the best shot at helping.` : `${save.op.handle} was the best fighter close enough to help.`,
      });
      am.log.push({ kind: saved ? 'good' : 'bad', text: how });
      am.report = [...(am.report ?? []), how];
      if (saved) { advance(state); return state; }
    }
  }

  // Unsaved: the cost lands, the alert rises.
  am.alert = Math.min(ALERT_MAX, (am.alert ?? 0) + (inc.fail.alert ?? 0));
  event.alert = am.alert;
  am.extraHeat += inc.fail.heat ?? 0;
  am.payCut += inc.fail.payCut ?? 0;
  if (inc.fail.neural) addNeural(op, inc.fail.neural);
  if (inc.fail.injury) {
    let severity = rng() < SERIOUS_CHANCE + SERIOUS_PER_ALERT * am.alert ? 'serious' : 'light';
    if (severity === 'serious') {
      // A teammate with the hands for it can patch it down to a light wound on the spot.
      const medic = able.filter((o) => o.id !== op.id).map((o) => ({ o, s: effectiveStat(o, 'medical') })).sort((a, b) => b.s.value - a.s.value)[0];
      if (medic && medic.o.stats.medical >= PATCH_MIN_MEDICAL) {
        const pdie = d20(nextRng(state));
        const patched = pdie + medic.s.value >= need;
        record(am, {
          kind: 'save', via: 'patch', patient: op.handle, text: `${op.handle} is badly hurt.`,
          choice: patched ? `${medic.o.handle} patches ${op.handle} up` : `${medic.o.handle} can't stop the bleeding`,
          stat: 'medical', actor: { id: medic.o.id, handle: medic.o.handle }, value: medic.s.value, notes: medic.s.notes, die: pdie, need, success: patched,
          choiceCost: {}, outcomeCost: {}, report: patched ? `${medic.o.handle} patched ${op.handle} up: bad, but they could walk.` : `${medic.o.handle} couldn't stop the bleeding.`,
          why: `${medic.o.handle} had the best hands on the crew (medical ${medic.s.value}).`,
        });
        am.report = [...(am.report ?? []), patched ? `${medic.o.handle} patched ${op.handle} up: bad, but they could walk.` : `${medic.o.handle} couldn't stop the bleeding.`];
        grow(state, am, medic.o, 'medical', XP.incident);
        if (patched) severity = 'light';
      }
    }
    // Never past serious from an incident (criticals only follow a crisis, and the player's call).
    const injury = worsenInjury(op.condition.injury, severity) === 'critical' ? 'serious' : worsenInjury(op.condition.injury, severity);
    setInjury(op, injury);
    noteInjury(state, op, injury);
    event.injury = { id: op.id, handle: op.handle, severity: injury };
    am.log.push({ kind: 'injury', text: `${op.handle}: ${injury} injury.` });
    if (injury === 'serious') {
      am.out = [...(am.out ?? []), op.id];
      am.pending = { kind: 'injury', opId: op.id };
    }
  }
  if (am.alert >= ALERT_MAX && !am.wentLoud) {
    if (am.pending) am.alertDue = true;
    else am.pending = { kind: 'alert' };
  }
  if (!am.pending && !actors(state, am).length) {
    exitRun(state, am, { text: 'Nobody left who can carry on.', choice: 'The crew pull out', report: 'With nobody left standing to finish it, the crew pulled out.' });
    return state;
  }
  advance(state);
  return state;
}

function addNeural(op, n) {
  const rate = op.traits?.includes('chromed') ? 1.5 : 1;
  op.condition.neuralLoad = Math.min(100, (op.condition.neuralLoad ?? 0) + Math.round(n * rate));
}

/** The decision a run is stopped for (max alert, a serious injury), for the UI and the orders. */
export function describePending(state) {
  const am = state.activeMission;
  if (!am?.pending) return null;
  const patient = am.pending.opId ? opById(state, am.pending.opId) : null;
  const text = am.pending.kind === 'alert'
    ? 'They know you\'re here. Lights are coming on and someone is shouting into a radio.'
    : `${patient?.handle ?? 'Someone'} is badly hurt and out of the job.`;
  const choices = decisionChoices(am.pending, { patient }).map((c) => ({ ...c, available: true, risk: c.exit ? 'safe' : null }));
  return { kind: am.pending.kind, text, choices };
}

/** Answer the decision: go loud or keep going, or take the exit (everyone comes home). */
export function resolvePending(prev, optionId) {
  const am0 = prev.activeMission;
  if (!am0?.pending) return prev;
  const choice = decisionChoices(am0.pending, { patient: am0.pending.opId ? opById(prev, am0.pending.opId) : null }).find((c) => c.id === optionId);
  if (!choice) return prev;
  const state = structuredClone(prev);
  const am = state.activeMission;
  const view = describePending(state);
  const why = takeWhy(am);
  if (choice.exit) {
    exitRun(state, am, { text: view.text, choice: choice.label, why, report: am.pending.kind === 'alert' ? 'The alarm went up and the crew pulled out.' : 'With someone badly hurt, the crew pulled out.' });
    return state;
  }
  if (choice.id === 'loud') {
    am.wentLoud = true;
    am.extraHeat += 2;
    am.alert = ALERT_MAX - 1;
    const report = 'The crew went loud to finish it. Heat +2.';
    record(am, { kind: 'decision', text: view.text, choice: choice.label, why, report, choiceCost: { heat: 2 } });
    am.report = [...(am.report ?? []), report];
  } else {
    const report = `The crew carried on without ${opById(state, am.pending.opId)?.handle ?? 'them'}.`;
    record(am, { kind: 'decision', text: view.text, choice: choice.label, why, report, choiceCost: {} });
    am.report = [...(am.report ?? []), report];
  }
  am.log.push({ kind: 'choice', text: choice.label });
  am.pending = null;
  if (am.alertDue) { delete am.alertDue; am.pending = { kind: 'alert' }; return state; }
  if (!actors(state, am).length) {
    exitRun(state, am, { text: 'Nobody left who can carry on.', choice: 'The crew pull out', report: 'With nobody left standing to finish it, the crew pulled out.' });
    return state;
  }
  if (am.step >= am.queue.length && !am.critical) finish(state);
  return state;
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
  const intel = intelFor(state, templateById(am.templateId).district);
  return crewRoll(crew, stat, { approach: am.approach, recommended, lead: medic ? medicLead(medic, am, crew) : namedLead(state, am, crew, stat), watched: am.watched ?? 0, intel, job: jobContext(am, choice, crew) });
}

/** What earned traits need to know about the job so far, and this choice (core/earned.js). */
function jobContext(am, choice, crew = []) {
  const events = am.events ?? [];
  const step = currentStep(am);
  const crisis = step?.type === 'crisis' ? crisisById(templateById(am.templateId), step.id) : null;
  // The safest option: the lowest difficulty among the rolls this crew can take (by the book, not by who's rolling).
  const rolls = (crisis?.choices ?? []).filter((c) => !EXIT_KINDS.has(c.kind) && !c.sure && meetsRequirement(crew, c.requires).ok);
  const easiest = Math.min(...rolls.map((c) => c.difficulty));
  return {
    situations: crisis?.situations ?? [],
    difficulty: choice ? rollDifficulty(am, choice) : 0,
    safest: Boolean(choice && rolls.length > 1 && rolls.includes(choice) && choice.difficulty === easiest),
    district: templateById(am.templateId).district,
    injured: events.filter((e) => e.injury).map((e) => e.injury.id),
    rolled: events.filter((e) => e.kind === 'roll' && e.actor).map((e) => e.actor.id),
    secondWindUsed: am.secondWind ?? [],
  };
}

/**
 * A crisis whose own text names {op} ("Someone squints at {op}") is about that person, so
 * they handle it: they roll (backup still helps) and take any knock. Focus-role crises keep
 * their own rule (the best at the stat rolls; the focus person is the one at risk).
 */
const namesOp = (crisis) => Boolean(crisis && !crisis.focusRole && crisis.text.includes('{op}'));

function namedLead(state, am, crew, stat) {
  const step = currentStep(am);
  const crisis = step?.type === 'crisis' ? crisisById(templateById(am.templateId), step.id) : null;
  if (!namesOp(crisis)) return undefined;
  const op = crew.find((o) => o.id === am.focusOp && o.condition.injury !== 'critical');
  if (!op) return undefined;
  const own = effectiveStat(op, stat, { approach: am.approach, crew });
  return { op, value: own.value, notes: own.notes };
}

/** Stabilising a critical operative: the medic leads, the same crew rule applies. */
function stabiliser(state, am, patient) {
  const crew = actors(state, am);
  const medic = findRole(crew.filter((o) => o.id !== patient.id), 'medic');
  if (!medic) return null;
  return crewRoll(crew, 'medical', { approach: am.approach, recommended: templateById(am.templateId).crewSize, lead: medicLead(medic, am, crew) });
}

// Who gets hurt on a failure: the crisis's focus operative if it has one
// (e.g. the tech in the server room), otherwise whoever made the attempt.
function failureTarget(state, am, roller) {
  const step = currentStep(am);
  const crisis = step?.type === 'crisis' ? crisisById(templateById(am.templateId), step.id) : null;
  const focus = crisis?.focusRole || namesOp(crisis) ? opById(state, am.focusOp) : null;
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
  if (!am || am.critical || am.pending || step?.type !== 'crisis') return null;
  const tpl = templateById(am.templateId);
  const crisis = crisisById(tpl, step.id);
  const crew = actors(state, am);
  const choices = crisis.choices.map((choice) => {
    const req = meetsRequirement(crew, choice.requires);
    const rolls = req.ok && !EXIT_KINDS.has(choice.kind) && !choice.sure;
    const voice = choiceVoice(am, crisis, rolls ? rollerFor(state, am, choice, crew) : null);
    const view = { id: choice.id, label: fill(choice.label, state, voice), kind: choice.kind, available: req.ok, reason: req.reason ?? '', cost: choiceCostText(choice) };
    if (EXIT_KINDS.has(choice.kind)) return { ...view, risk: 'safe', riskReason: 'Everyone gets out alive' };
    if (!req.ok) return view;
    if (choice.sure) return { ...view, risk: 'certain', riskReason: 'No roll needed' };
    const roller = rollerFor(state, am, choice, crew);
    const chance = successChance(roller.value, rollDifficulty(am, choice));
    const target = failureTarget(state, am, roller.op);
    const bits = [`${roller.op.handle} on ${choice.stat} (${roller.value}${roller.notes.length ? ', ' + roller.notes.join(', ') : ''})${am.alert ? `, alert +${am.alert} difficulty` : ''}`];
    const fails = [];
    if (choice.failureInjury && choice.failureInjury !== 'none') fails.push(`${choice.failureInjury} injury to ${target.handle}`);
    if (choice.failureCost) fails.push(costText(choice.failureCost));
    if (fails.length) bits.push(`If it fails: ${fails.join(', ')}`);
    return { ...view, risk: riskLabel(chance), riskReason: bits.join('. ') + '.' };
  });
  return { text: fill(crisis.text, state, am), choices };
}

/**
 * The current crisis's choices as numbers, for a hands-off crew deciding (core/autorun.js):
 * each available choice with its chance (the same one the risk read shows) and who would roll.
 */
export function crisisOdds(state) {
  const am = state.activeMission;
  const step = currentStep(am);
  if (!am || am.critical || step?.type !== 'crisis') return null;
  const crisis = crisisById(templateById(am.templateId), step.id);
  const crew = actors(state, am);
  return crisis.choices.filter((c) => meetsRequirement(crew, c.requires).ok).map((choice) => {
    if (EXIT_KINDS.has(choice.kind) || choice.sure) return { choice, exit: EXIT_KINDS.has(choice.kind), chance: 1, roller: null };
    const roller = rollerFor(state, am, choice, crew);
    return { choice, exit: false, chance: successChance(roller.value, rollDifficulty(am, choice)), roller, named: namesOp(crisis) };
  });
}

export function chooseOption(prev, choiceId) {
  const state = structuredClone(prev);
  const am = state.activeMission;
  const step = currentStep(am);
  if (!am || am.critical || am.pending || step?.type !== 'crisis') return prev;
  const tpl = templateById(am.templateId);
  const crisis = crisisById(tpl, step.id);
  const choice = crisis.choices.find((c) => c.id === choiceId);
  const crew = actors(state, am);
  if (!choice || !meetsRequirement(crew, choice.requires).ok) return prev;

  const rolls = !EXIT_KINDS.has(choice.kind) && !choice.sure;
  const roller = rolls || choice.sure ? rollerFor(state, am, choice, crew) : null;
  const voice = choiceVoice(am, crisis, rolls ? roller : null);
  am.log.push({ kind: 'crisis', text: fill(crisis.text, state, am) });
  am.log.push({ kind: 'choice', text: fill(choice.label, state, voice) });
  const cost = choice.cost ?? {};
  am.payCut += cost.payCut ?? 0;
  am.extraHeat += cost.heat ?? 0;
  am.clientTrust += cost.clientTrust ?? 0;
  if (cost.cash) state.cash += cost.cash;

  // What gets recorded for the full log: the facts of this choice, filled in below.
  const event = {
    kind: EXIT_KINDS.has(choice.kind) ? 'exit' : choice.sure ? 'sure' : 'roll',
    crisis: crisis.id, choiceId: choice.id, situations: [...(crisis.situations ?? [])], twist: !!step.twist, text: fill(crisis.text, state, am), choice: fill(choice.label, state, voice),
    why: am.nextWhy ?? null, choiceCost: { ...(choice.cost ?? {}) }, report: reportLine(state, voice, choice, true),
  };
  delete am.nextWhy;

  if (EXIT_KINDS.has(choice.kind)) {
    am.log.push({ kind: 'good', text: fill(choice.success, state, am) });
    addReport(state, am, choice, true);
    record(am, event);
    am.aborted = true;
    if (step.twist) am.abortedOnTwist = true; // walking away from a job the client misrepresented isn't held against you
    am.step = am.queue.length - 1;
    advance(state);
    return state;
  }

  const rng = nextRng(state);
  const die = choice.sure ? null : d20(rng);
  const need = 10 + rollDifficulty(am, choice);
  const success = choice.sure || die + roller.value >= need;
  if (roller.notes.some((n) => n.startsWith('Second Wind'))) { // used once a job, spent after three
    am.secondWind = [...(am.secondWind ?? []), roller.op.id];
    spendSecondWind(state, roller.op);
  }
  Object.assign(event, {
    stat: choice.stat, actor: { id: roller.op.id, handle: roller.op.handle }, value: roller.value, notes: roller.notes,
    die, need, success, outcomeCost: { ...((success ? choice.successCost : choice.failureCost) ?? {}) }, injury: null,
    report: reportLine(state, voice, choice, success),
  });
  if (!choice.sure) am.watched = 0; // the watched penalty covers the first roll only

  // Everyone learns from a roll: the roller most (even on a failure), the rest by watching.
  if (!choice.sure) {
    grow(state, am, roller.op, choice.stat, XP.roll);
    for (const o of crew) if (o.id !== roller.op.id && o.condition.injury !== 'critical') grow(state, am, o, choice.stat, XP.watch);
  }

  if (choice.neural) addNeural(roller.op, choice.neural);
  if (!choice.sure && choice.stat === 'tech' && APPROACHES[am.approach]?.neural) addNeural(roller.op, APPROACHES[am.approach].neural);

  addReport(state, am, choice, success, voice);
  if (success) {
    am.log.push({ kind: 'good', text: fill(choice.success, state, voice) });
    // Ghost Driver (earned): a clean getaway at the wheel sheds a point of the heat the move costs.
    if (choice.stat === 'driving' && (crisis.situations ?? []).includes('escape') && (choice.cost?.heat ?? 0) > 0 && earnedOf(roller.op, 'ghost_driver')) {
      am.extraHeat -= 1;
      am.log.push({ kind: 'good', text: `${roller.op.handle} leaves no plate to remember (Ghost Driver): one less heat.` });
      event.saved = 'Ghost Driver: one less heat';
    }
    const sc = choice.successCost ?? {};
    am.payCut += sc.payCut ?? 0;
    am.extraHeat += sc.heat ?? 0;
    if (sc.cash) state.cash += sc.cash;
  } else {
    am.log.push({ kind: 'bad', text: fill(choice.failure, state, voice) });
    const fc = choice.failureCost ?? {};
    am.payCut += fc.payCut ?? 0;
    am.extraHeat += fc.heat ?? 0;
    // Clean Professional (earned): once a job, a failed roll of theirs draws one less heat.
    if (fc.heat && !am.cleanUsed && earnedOf(roller.op, 'clean_professional')) {
      am.extraHeat -= 1;
      am.cleanUsed = true;
      am.log.push({ kind: 'good', text: `${roller.op.handle} keeps it quieter than it could have been (Clean Professional): one less heat.` });
      event.saved = 'Clean Professional: one less heat';
    }
    if (fc.cash) state.cash += fc.cash;
    if (choice.failureInjury && choice.failureInjury !== 'none') {
      const target = failureTarget(state, am, roller.op);
      const injury = worsenInjury(target.condition.injury, choice.failureInjury);
      setInjury(target, injury);
      noteInjury(state, target, injury);
      am.log.push({ kind: 'injury', text: `${target.handle}: ${injury} injury.` });
      event.injury = { id: target.id, handle: target.handle, severity: injury };
      if (injury === 'critical') {
        am.critical = target.id;
        am.stabiliseFailed = false;
      }
    }
  }
  record(am, event);
  advance(state);
  return state;
}

// --- critical state ------------------------------------------------------------

export function describeCritical(state) {
  const am = state.activeMission;
  if (!am?.critical) return null;
  const op = opById(state, am.critical);
  const crew = actors(state, am);
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
    const die = d20(nextRng(state));
    const stabilised = die + r.value >= 10 + STABILISE_DIFFICULTY;
    record(am, { kind: 'critical', action: 'stabilise', patient: op.handle, actor: { id: medic.id, handle: medic.handle }, stat: 'medical',
      value: r.value, notes: r.notes, die, need: 10 + STABILISE_DIFFICULTY, success: stabilised, why: takeWhy(am),
      report: stabilised ? `${medic.handle} stabilised ${op.handle}.` : `${medic.handle} couldn't stop ${op.handle}'s bleeding.` });
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
    record(am, { kind: 'critical', action: 'extract', patient: op.handle, why: takeWhy(am), report: `The crew dropped the job to get ${op.handle} to a clinic. Pay -50%.` });
    am.log.push({ kind: 'good', text: `${op.handle} makes it to a clinic. Alive.` });
    am.step = am.queue.length;
    finish(state);
    return state;
  } else if (option === 'push') {
    am.untreated.push(op.id);
    am.critical = null;
    am.log.push({ kind: 'choice', text: 'You push on.' });
    record(am, { kind: 'critical', action: 'push', patient: op.handle, why: takeWhy(am), report: `The crew pushed on with ${op.handle} untreated in the van.` });
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
      record(am, { kind: 'aftermath', text: `${op.handle} pulled through. Barely.` });
    } else {
      deaths.push(op);
      am.log.push({ kind: 'death', text: `${op.name} "${op.handle}" dies on the way back.` });
      record(am, { kind: 'aftermath', death: true, text: `${op.name} "${op.handle}" died on the way back.` });
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
  // Client's Favourite (earned): a job they worked for that client, done well, counts for a little more.
  const favourite = !am.aborted && am.clientId && crew.some((o) => earnedOf(o, 'client_favourite', { client: am.clientId })) ? 1 : 0;
  const trustChange = adjustTrust(state, am.clientId, base + am.clientTrust + favourite);

  for (const op of deaths) {
    state.crew = state.crew.filter((o) => o.id !== op.id);
    state.memorial.push({ id: op.id, name: op.name, handle: op.handle, role: op.role, color: op.color, age: op.age, day: state.day, cause: `Died of wounds after the ${tpl.name}${isFreelancer(op) ? ' (freelancer)' : ''}` });
  }

  // Growth: crisis lessons already landed during the job; finishing it also teaches its key stats.
  const survivors = onJob(state, am).filter((o) => !deaths.includes(o));
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

  // Clinic Hands (earned): once a job, gets a lightly hurt crewmate back a day sooner.
  const patched = [];
  for (const op of survivors.filter((o) => earnedOf(o, 'clinic_hands'))) {
    const patient = survivors.find((o) => o !== op && o.condition.injury === 'light' && o.condition.injuryDays > 1 && !patched.some((p) => p.patient === o));
    if (!patient) continue;
    patient.condition.injuryDays -= 1;
    patched.push({ medic: op, patient });
  }

  const injuries = [];
  for (const op of survivors) {
    const c = op.condition;
    c.fatigue = Math.min(100, c.fatigue + 10 + threat * 6);
    c.awayUntil = (am.startedDay ?? state.day) + (am.days ?? tpl.days); // a hands-off job finishes on the day they're back
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
  // The report reads as a timeline: what happened, in order, then what it came to.
  // Each outcome line has a tone so the screen can colour it (good, bad, warn, plain).
  const steps = [...(am.report ?? [])];
  const results = [
    { tone: pay > 0 ? 'good' : 'plain', text: `Paid ${money(pay)}.` },
    ...(cuts ? [{ tone: 'plain', text: `Freelancers took ${money(cuts)}.` }] : []),
    ...(am.bribe ? [{ tone: 'plain', text: `Props and bribes cost ${money(am.bribe)} up front.` }] : []),
    { tone: heatGain > 0 ? 'warn' : 'plain', text: `Heat +${heatGain}.` },
    injuries.length ? { tone: 'bad', text: `Injured: ${injuries.join(', ')}.` } : { tone: 'good', text: 'Nobody hurt.' },
    ...(deaths.length ? [{ tone: 'bad', text: 'Their names go on the wall.' }] : []),
    ...(growthLines.length ? [{ tone: 'good', text: `Improved: ${growthLines.join(', ')}.` }] : []),
    ...patched.map((p) => ({ tone: 'good', text: `${p.medic.handle} patched up ${p.patient.handle} (Clinic Hands): back a day sooner.` })),
    ...(client && trustChange ? [{ tone: trustChange > 0 ? 'good' : 'bad', text: `${client.name} ${trustChange > 0 ? 'thinks more of you' : 'is unhappy with you'} (trust ${trustChange > 0 ? '+' : ''}${trustChange}).` }] : []),
  ];
  const id = `report-${state.day}-${state.rngCounter}`;
  const events = am.events ?? [];
  state.inbox.unshift({
    id, type: 'report', day: state.day, subject,
    body: [...steps, ...results.map((o) => o.text)].join(' '),
    timeline: {
      result: outcome, steps, outcome: results,
      // The full log and its summary (save v16). Hands-off runs also name their orders.
      events, summary: summariseRun(events, { id, outcome, deaths: deaths.length }),
      // Hands-off runs name their orders (the report plays out on first open); a live run says how it was called.
      orders: am.callIn === 'never' || !am.callIn ? am.orders ?? null : null, callIn: am.callIn ?? null, liveOrders: am.callIn && am.callIn !== 'never' ? am.orders ?? null : null,
    },
    blocking: false, read: false,
  });
  // Full logs are kept for the most recent jobs; older reports keep their timeline and summary.
  state.inbox.filter((m) => m.type === 'report' && m.timeline?.events).slice(REPORT_LOGS_KEPT).forEach((m) => { delete m.timeline.events; });
  reactToJob(state, am, tpl, { heatGain, injuries, deaths });
  // Incidents and saves don't count towards earning traits yet: the traits were tuned to about one
  // moment a week, and counting them doubled it (2026-10-27). Injuries from incidents still count (noteInjury).
  afterJob(state, { events: events.filter((e) => !e.incident && e.kind !== 'save'), district: tpl.district, clientId: am.clientId, outcome, crewIds: am.crewIds });
}

export function closeMission(prev) {
  if (!prev.activeMission?.done) return prev;
  const state = structuredClone(prev);
  const am = state.activeMission;
  state.activeMission = null;
  // Freelancers go home after the job; one hired for a hands-off job still out stays with it.
  state.crew = state.crew.filter((o) => !isFreelancer(o) || !am.crewIds.includes(o.id));
  return state;
}
