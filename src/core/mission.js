// Mission engine: plan -> beats, incidents and crisis decisions -> outcome.
// Pure logic. Every function takes state and returns a new state.
//
// A run (PLAN-CORE-LOOP.md): the queue holds beats, zone markers, incidents (automatic rolls,
// core/incidents.js) and crises (the player's or the orders' call). Unsaved incident failures
// raise the alert; max alert and a serious injury stop the run for a decision (am.pending).
//
// Death rule: an operative can only die after the player chooses "Push on"
// while they are critical. Abort/extract always saves everyone. Incidents never go past a
// serious injury, and every decision they raise has an exit. A fight (core/battle.js, slice 6)
// can put someone at death's door, never dead: only "keep fighting" (the push on of a fight)
// leaves them dying, and any exit after that still brings them home.

import { jobGrudge, addGrudge, grudgeOf, GANGS } from './gangs.js';
import { finishRaid, followHome } from './raids.js';
import { crewLead } from './lead.js';
import { templateById, twistById, jobView, namedBonus } from './jobs.js';
import { legendResult } from './legend.js';
import { rivalForJob, noteRivalEncounter } from './rivals.js';
import { NAMED_OFFER, NAMED_TEXT } from '../data/fame.js';
import { adjustTrust, clientById, completionTrust, ABORT_TRUST } from './clients.js';
import { nextRng } from './random.js';
import { d20, hashRng } from './rng.js';
import { checkRenewal } from './renewals.js';
import { APPROACHES, crewRoll, effectiveStat, findRole, worsenInjury, setInjury, maxCrew, INJURY_DAYS } from './crew.js';
import { successChance, riskLabel } from './risk.js';
import { clampHeat, WATCHED_PENALTY, addHeat, watchedIn } from './heat.js';
import { XP, applyGrowth, primaryStat, promoteVeteran } from './development.js';
import { recordJob, recordSummary } from './record.js';
import { checkMilestones } from './milestones.js';
import { afterJobFame } from './fame.js';
import { freelancerAsCrew, freelanceCut, isFreelancer, MAX_FREELANCERS_PER_JOB } from './freelance.js';
import { reactToJob, RUMOUR_CRISIS_CHANCE } from './rumours.js';
import { CAST } from '../data/cast.js';
import { DISTRICTS } from '../data/districts.js';
import { NAMES } from '../config/names.js';
import { money } from './money.js';
import { summariseRun, REPORT_LOGS_KEPT } from './report.js';
import { intelFor } from './sidetasks.js';
import { afterJob, noteInjury, spendSecondWind, earnedOf } from './earned.js';
import { overwatchKit, seriousGuard, patchBonus } from './gear.js';
import { loudFightDue } from './battle.js';
import { playGetaway, getawayPilot, homeHallOf } from './piloting.js';
import { lineText } from './fighttext.js';
import { HOME_HALL } from '../data/halls.js';
import { crewOf, actors, overwatchOp, standbyOp, standbyReady, driver, onJob, opById, grow, record, takeWhy, addNeural } from './run.js';
import { FIGHT } from '../data/fights.js';
import { startBattle, runBattle, resolveBattleDecision, guardsUp, guardCount, handOffFight, pullBack } from './runbattle.js';
import { describeFightPending, fightChoices, fightSnapshot } from './runfight.js';
export { runBattle, handOffFight, pullBack };
import { noteOverwatchJob, checkSpecialisations } from './specialisations.js';
import { noteJobMarks } from './marks.js';
import { planIncidents, weaveIncidents, incidentById, incidentIn, incidentDifficulty, handlerFor, bestSave, standbySave, decisionChoices, ALERT_MAX, SERIOUS_CHANCE, SERIOUS_PER_ALERT, PATCH_MIN_MEDICAL, ZONES } from './incidents.js';
import { openingResult } from './halls.js';
import { heistResult } from './heists.js';

const EXIT_KINDS = new Set(['abort', 'extract']);
const STABILISE_DIFFICULTY = 9;

const crisisById = (tpl, id) => tpl.crises.find((c) => c.id === id) ?? twistById(id);

/** Difficulty of a roll on this job: the offer's threat change shifts every roll by 1 per step. */
export const REP_PER_THREAT = 0.75;
export const ABORT_REP = 3;

const rollDifficulty = (am, choice) => choice.difficulty + (am.threatDelta ?? 0) + (am.alert ?? 0);

/** Call-in rules (who decides at a crisis): the player every time, only when it's risky, or never (hands-off). */
export const CALL_IN = {
  every: { name: 'Every crisis', desc: 'You make every call.' },
  risky: { name: 'When it\'s risky', desc: 'They call you when their best option is less than even odds. Otherwise their orders decide.' },
  never: { name: 'Never', desc: 'Their orders decide everything. A critical wound: they pull out.' },
};
export const RISKY_BELOW = 0.5;

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
    // The other tong a 'Rival crew' twist names (core/rivals.js rivalForJob); anonymous in a save without rivals.
    if (key === 'rivalTong') return am.rival?.tong ?? (offset === 0 || /[.!?:]["']?\s+$/.test(whole.slice(0, offset)) ? 'Another crew' : 'another crew');
    if (key === 'rival') return am.rival?.name ?? 'one of their people';
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
// {op} in a choice's lines is whoever acts: the roller (owner's feedback, 2026-10-27: a focus
// crisis said "Flicker braced it" when Thimble rolled). A crisis whose own text names {op} is
// handled by that person, so the roller is them anyway (namesOp).
function choiceVoice(am, crisis, roller) {
  return roller ? { ...am, focusOp: roller.op.id } : am;
}

function reportLine(state, am, choice, success) {
  const line = choice.report?.[success ? 'success' : 'failure'];
  return line ? fill(line, state, am) : null;
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
 * Start a job. opts: { overwatch: { id, kit } (one crew member outside the inside crew, carrying
 * that rifle or drone: core/gear.js), wheels: id (in the van: takes every piloting roll), standby: id (at the
 * van until called in), callIn ('every' | 'risky' | 'never'), orders (how the crew decides when
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
  const owOp = ow ? state.crew.find((o) => o.id === ow.id) : null;
  if (ow && (!owOp || !overwatchKit(owOp, ow.kit) || crewIds.includes(ow.id))) return prev;
  // Wheels and standby (slice 3): crew of your own, one place each.
  const wheels = opts.wheels ?? null;
  const standby = opts.standby ?? null;
  const placed = [...crewIds, ow?.id, wheels, standby].filter(Boolean);
  if (new Set(placed).size !== placed.length) return prev;
  if ([wheels, standby].some((id) => id && !state.crew.some((o) => o.id === id))) return prev;
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
  // A heist finale's prep can take a crisis out of the draw (core/heists.js job.drop; shown on its plan).
  const pool = tpl.crises.filter((c) => !view.drop.includes(c.id)).map((c) => ({ c, key: rng() ** (1 / weight(c)) })).sort((a, b) => b.key - a.key).map((x) => x.c);
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
  const watched = watchedIn(state, tpl.district) ? WATCHED_PENALTY : 0; // only a job in the watched district
  if (watched) state.heatWatched = false;
  // The approach's costs: time away, and props and bribes paid up front (data/approaches.js).
  const days = Math.max(1, (job.days ?? tpl.days) + (ap.days ?? 0)); // the offer's days (core/jobs.js daysRange)
  const bribe = (ap.bribePerThreat ?? 0) * view.threat;
  state.cash -= bribe;
  state.activeMission = {
    jobId, templateId: tpl.id, crewIds, approach, days, bribe,
    overwatch: ow ? { id: ow.id, kit: ow.kit, left: overwatchKit(owOp, ow.kit).uses } : null,
    wheels: wheels ?? null, standby: standby ? { id: standby, used: false } : null,
    callIn: CALL_IN[opts.callIn] ? opts.callIn : 'every', orders: opts.orders ?? null,
    alert: 0, out: [], pending: null, wentLoud: false, battle: null, fought: false,
    pay: view.pay, threat: view.threat, threatDelta: view.threatDelta, clientId: job.clientId ?? null, twist: job.twist ?? null,
    askedFor: job.askedFor ?? null, // the runner a client asked for by name (renown slice 4)
    defining: job.defining ?? null, // the runner whose defining job this is (core/legend.js)
    rival: job.twist === 'twist_rival_crew' ? { ...rivalForJob(state, jobId, tpl.district), district: tpl.district } : null, // the tong and runner a rival-crew twist names (hashRng: no roll moves)
    inside: view.inside, // a heist finale's intel from its prep (core/heists.js), on every roll
    lead: crewLead(crewIds.map((id) => state.crew.find((o) => o.id === id))), // takes one risky call (core/lead.js)
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

export function advance(state) {
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
    // Nobody left on their feet to face it (a crew of one pushed on, or a fight left nobody):
    // the crew pulls out, as after an incident. An exit, so anyone dying still makes it home.
    if (!crew.length && !am.critical && !am.pending) {
      exitRun(state, am, { text: 'Nobody left who can carry on.', choice: 'The crew pull out', report: 'With nobody left standing to finish it, the crew pulled out.' });
      return;
    }
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

/** Exit the job from a decision: everyone comes home (the death rule), the job ends. Pays nothing
 *  by default, as the button says ("Everyone comes home. No pay."); pass payCut to soften that. */
export function exitRun(state, am, { text, choice, report, why, payCut = 1 }) {
  am.aborted = true;
  am.payCut = Math.max(am.payCut, payCut);
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
  const inc = incidentIn(id, tpl.district); // the district's own lines where written (slice 4)
  const able = actors(state, am);
  if (!able.length) {
    exitRun(state, am, { text: 'Nobody left who can carry on.', choice: 'The crew pull out', report: 'With nobody left standing to finish it, the crew pulled out.' });
    return state;
  }
  const diff = incidentDifficulty(tpl, am, inc);
  // The heat penalty for letting it ride is on the first crisis roll (core/heat.js), so incidents leave it alone.
  const rollCtx = { approach: am.approach, recommended: tpl.crewSize, intel: intelFor(state, tpl.district, am.inside), job: incidentContext(state, am, inc, diff), alert: am.alert ?? 0 };
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
  if (success) {
    // On a loud run the first guard is a fight anyway; winning the roll means the crew gets the jump on them.
    if (loudFightDue(am, inc)) { startBattle(state, am, tpl, inc, id, step.zone, diff, able, { ambush: true }); return state; }
    advance(state);
    return state;
  }

  // In danger: one save, from overwatch (if it can see) or the best fighter inside; once standby
  // has come in, they get a try of their own if that misses (slice 3).
  if (inc.danger) {
    const ow = overwatchOp(state, am);
    const sb = am.standby?.joined ? able.find((o) => o.id === am.standby.id) ?? null : null;
    const first = bestSave({ victim: op, able: able.filter((o) => o !== sb), overwatch: am.overwatch, overwatchOp: ow, zone: step.zone, diff });
    const tries = [first, standbySave({ standbyOp: sb, victim: op, first, diff })].filter(Boolean);
    for (const save of tries) {
      const sdie = d20(nextRng(state));
      const saved = sdie + save.value >= save.need;
      const kit = save.via === 'overwatch' ? overwatchKit(save.op, save.kit) : null;
      const shotHeat = kit && (!kit.heatOnHit || saved) ? kit.heat : 0;
      if (kit) {
        am.overwatch.left -= 1;
        am.extraHeat += shotHeat;
        if (kit.neural) addNeural(save.op, kit.neural);
      }
      grow(state, am, save.op, save.stat, XP.save);
      const how = kit ? (save.kit === 'rifle' ? (saved ? `${save.op.handle} takes the shot from overwatch.` : `${save.op.handle}'s shot goes wide.`) : (saved ? `${save.op.handle}'s drone drops in and puts them down.` : `${save.op.handle}'s drone can't get there in time.`))
        : (saved ? `${save.op.handle} gets there and pulls ${op.handle} clear.` : `${save.op.handle} can't reach ${op.handle} in time.`);
      record(am, {
        kind: 'save', via: save.via, kit: save.kit ?? null, patient: op.handle, text: fill(inc.comp ?? '{op} is in trouble.', state, voice),
        choice: saved ? `${save.op.handle} saves ${op.handle}` : `${save.op.handle} can't save ${op.handle}`,
        stat: save.stat, actor: { id: save.op.id, handle: save.op.handle }, value: save.value, notes: save.notes, die: sdie, need: save.need, success: saved,
        choiceCost: {}, outcomeCost: shotHeat ? { heat: shotHeat } : {}, report: how,
        why: kit ? `${save.op.handle} had the ${save.kit} on overwatch, and the best shot at helping.`
          : save.via === 'standby' ? `${save.op.handle} came in from standby to cover the team.` : `${save.op.handle} was the best fighter close enough to help.`,
      });
      am.log.push({ kind: saved ? 'good' : 'bad', text: how });
      am.report = [...(am.report ?? []), how];
      if (saved) {
        if (loudFightDue(am, inc)) { startBattle(state, am, tpl, inc, id, step.zone, diff, able); return state; }
        advance(state);
        return state;
      }
    }
  }

  // Unsaved: the cost lands, the alert rises.
  am.alert = Math.min(ALERT_MAX, (am.alert ?? 0) + (inc.fail.alert ?? 0));
  event.alert = am.alert;
  am.extraHeat += inc.fail.heat ?? 0;
  am.payCut += inc.fail.payCut ?? 0;
  if (inc.fail.neural) addNeural(op, inc.fail.neural);
  // Unsaved danger with guards in it: the run escalates into a fight (slice 6), which replaces the
  // old serious-wound roll below.
  if (inc.danger && inc.guards) {
    startBattle(state, am, tpl, inc, id, step.zone, diff, able);
    return state;
  }
  if (inc.fail.injury) {
    // Armour (core/gear.js) takes some of the chance off.
    let severity = rng() < Math.max(0, SERIOUS_CHANCE + SERIOUS_PER_ALERT * am.alert - seriousGuard(op)) ? 'serious' : 'light';
    if (severity === 'serious') {
      // A teammate with the hands for it can patch it down to a light wound on the spot.
      const medic = able.filter((o) => o.id !== op.id).map((o) => ({ o, s: effectiveStat(o, 'medical') })).sort((a, b) => b.s.value - a.s.value)[0];
      if (medic && medic.o.stats.medical + patchBonus(medic.o) >= PATCH_MIN_MEDICAL) {
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
        grow(state, am, medic.o, 'medical', XP.save);
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

/** The decision a run is stopped for (max alert, a serious injury), for the UI and the orders. */
export function describePending(state) {
  const am = state.activeMission;
  if (!am?.pending) return null;
  if (am.pending.kind === 'dilemma') return describeFightPending(state); // engine 2's authored call-ins (core/runfight.js)
  const patient = am.pending.opId ? opById(state, am.pending.opId) : null;
  const engine2 = am.battle?.engine === 2; // its standby rides with the van, so no "send standby in"
  const text = am.pending.kind === 'alert'
    ? 'They know you\'re here. Lights are coming on and someone is shouting into a radio.'
    : am.pending.kind === 'door' ? (engine2 ? lineText('callin.deathsDoor', { who: patient?.handle ?? 'Someone' }) : `${patient?.handle ?? 'Someone'} is down and bleeding. They'll live if you get them out now.`)
      : am.pending.kind === 'standoff' ? `${am.battle.round} rounds in and ${guardCount(guardsUp(am.battle), am.battle)} still standing.`
        : `${patient?.handle ?? 'Someone'} is badly hurt and out of the job.`;
  const choices = decisionChoices(am.pending, { patient, standby: engine2 ? null : standbyReady(state, am), raid: !!am.raid, engine2 }).map((c) => ({ ...c, available: true, risk: c.exit ? 'safe' : null }));
  // A fight's call-ins show everyone's health (the watch screen's call-in card).
  const b = am.battle;
  const fight = b && (am.pending.kind === 'door' || am.pending.kind === 'standoff')
    ? (({ runners, guards }) => ({ runners: runners.map((r) => ({ handle: r.handle, hp: r.hp, max: r.max, down: r.down })), guards: guards.map((g) => ({ n: g.n, hp: g.hp, max: g.max, out: g.out })) }))(engine2 ? fightSnapshot(b) : b) : null;
  return { kind: am.pending.kind, text, choices, standby: engine2 ? null : standbyReady(state, am)?.handle ?? null, fight };
}

/** Answer the decision: go loud or keep going, or take the exit (everyone comes home). */
export function resolvePending(prev, optionId) {
  const am0 = prev.activeMission;
  if (!am0?.pending) return prev;
  const choices = am0.pending.kind === 'dilemma' ? fightChoices(am0.pending, am0.battle) : decisionChoices(am0.pending, { patient: am0.pending.opId ? opById(prev, am0.pending.opId) : null, standby: am0.battle?.engine === 2 ? null : standbyReady(prev, am0), raid: !!am0.raid, engine2: am0.battle?.engine === 2 });
  const choice = choices.find((c) => c.id === optionId);
  if (!choice) return prev;
  const state = structuredClone(prev);
  const am = state.activeMission;
  const view = describePending(state);
  if (am.pending.kind === 'door' || am.pending.kind === 'standoff' || am.pending.kind === 'dilemma') return resolveBattleDecision(state, am, choice, view);
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
  } else if (choice.id === 'standby' || choice.id === 'rescue') {
    // Standby comes in from the van and joins the inside team; on a rescue they get the wounded
    // out first and take their place. The alert stays where it is (owner's call, 2026-10-27).
    const sb = standbyReady(state, am);
    am.standby.used = true;
    am.standby.joined = true;
    am.crewIds = [...am.crewIds, sb.id];
    const patient = choice.id === 'rescue' ? opById(state, am.pending.opId) : null;
    const report = patient ? `${sb.handle} came in from standby, got ${patient.handle} out and took their place.` : `${sb.handle} came in from standby. The alert stayed up.`;
    record(am, { kind: 'decision', standby: { id: sb.id, handle: sb.handle }, rescued: patient ? { id: patient.id, handle: patient.handle } : null, text: view.text, choice: choice.label, why, report, choiceCost: {} });
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

/** Who counts for a choice's requirement: the inside crew, and Wheels for a piloting one. */
const reqCrew = (state, am, crew, req) => (req?.kind === 'stat' && req.value === 'piloting' && driver(state, am) ? [...crew, driver(state, am)] : crew);

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
  const intel = intelFor(state, templateById(am.templateId).district, am.inside);
  // Wheels takes every piloting roll, alone at the wheel: no backup, no short-handed penalty (slice 3).
  const wheels = stat === 'piloting' ? driver(state, am) : null;
  if (wheels) {
    const own = effectiveStat(wheels, 'piloting', { approach: am.approach, crew: [wheels] });
    return crewRoll([wheels], 'piloting', { approach: am.approach, lead: { op: wheels, value: own.value, notes: ['Wheels', ...own.notes] }, watched: am.watched ?? 0, intel, job: jobContext(am, choice, crew), alert: am.alert ?? 0 });
  }
  return crewRoll(crew, stat, { approach: am.approach, recommended, lead: medic ? medicLead(medic, am, crew) : namedLead(state, am, crew, stat), watched: am.watched ?? 0, intel, job: jobContext(am, choice, crew), alert: am.alert ?? 0 });
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
 * A crisis whose own text names {op} ("Someone squints at {op}", or Doc Siu's "{op}. He's
 * yours.") is about that person, so they handle it: they roll (backup still helps) and take any
 * knock. Since 2026-10-27 this covers focus-role crises too (it used to skip them).
 */
const namesOp = (crisis) => Boolean(crisis && crisis.text.includes('{op}'));

/** Does a choice's own wording put someone in it ("{op} wedges a pry bar...")? Then that's the roller. */
const choiceNamesOp = (choice) => [choice?.label, choice?.success, choice?.failure, choice?.report?.success, choice?.report?.failure].some((t) => t?.includes('{op}'));

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

// Who gets hurt on a failure: the person the crisis is about (named in its text, or the focus
// role, e.g. the tech with the nosebleed), unless the choice's own lines put the roller in it
// ("...clips {op}'s shoulder"): then whoever acted takes the knock, as the line says.
function failureTarget(state, am, roller, choice) {
  const step = currentStep(am);
  const crisis = step?.type === 'crisis' ? crisisById(templateById(am.templateId), step.id) : null;
  const aboutFocus = namesOp(crisis) || (crisis?.focusRole && !choiceNamesOp(choice));
  const focus = aboutFocus ? opById(state, am.focusOp) : null;
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
    const req = meetsRequirement(reqCrew(state, am, crew, choice.requires), choice.requires);
    const rolls = req.ok && !EXIT_KINDS.has(choice.kind) && !choice.sure;
    const voice = choiceVoice(am, crisis, rolls ? rollerFor(state, am, choice, crew) : null);
    const view = { id: choice.id, label: fill(choice.label, state, voice), kind: choice.kind, available: req.ok, reason: req.reason ?? '', cost: choiceCostText(choice) };
    if (EXIT_KINDS.has(choice.kind)) return { ...view, risk: 'safe', riskReason: 'Everyone gets out alive' };
    if (!req.ok) return view;
    if (choice.sure) return { ...view, risk: 'certain', riskReason: 'No roll needed' };
    const roller = rollerFor(state, am, choice, crew);
    const chance = successChance(roller.value, rollDifficulty(am, choice));
    const target = failureTarget(state, am, roller.op, choice);
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
  return crisis.choices.filter((c) => meetsRequirement(reqCrew(state, am, crew, c.requires), c.requires).ok).map((choice) => {
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
  if (!choice || !meetsRequirement(reqCrew(state, am, crew, choice.requires), choice.requires).ok) return prev;

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
    stat: choice.stat, difficulty: choice.difficulty, actor: { id: roller.op.id, handle: roller.op.handle }, value: roller.value, notes: roller.notes,
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
    if (choice.stat === 'piloting' && (crisis.situations ?? []).includes('escape') && (choice.cost?.heat ?? 0) > 0 && earnedOf(roller.op, 'ghost_driver')) {
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
      const target = failureTarget(state, am, roller.op, choice);
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
  if (am.raid) { finishRaid(state); return; } // a raid on a hall ends its own way (core/raids.js)
  const tpl = templateById(am.templateId);
  const crew = crewOf(state, am);
  const medic = findRole(crew.filter((o) => !am.untreated.includes(o.id)), 'medic');
  const deaths = [];
  // Engine 2 fights kill in the moment (bleeding out on committed, left behind down, a hand-ordered withdrawal): core/runfight.js.
  for (const id of am.fightDead ?? []) {
    const op = opById(state, id);
    if (!op || deaths.includes(op)) continue;
    deaths.push(op);
    am.log.push({ kind: 'death', text: `${op.name} "${op.handle}" died in the fight.` });
    record(am, { kind: 'aftermath', death: true, text: `${op.name} "${op.handle}" died in the fight.` });
  }

  for (const id of am.untreated) {
    const op = opById(state, id);
    if (deaths.includes(op)) continue; // already died in the fight (bled out after being pushed on for)
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
  // A client who asked for someone by name pays more if they were on the job (core/jobs.js namedBonus).
  const named = namedBonus(am, onJob(state, am).map((o) => o.id));
  const pay = Math.round((basePay * (1 + named) * Math.max(0, 1 - am.payCut)) / 50) * 50;
  // Freelancers who make it back take their share of what was actually paid.
  const freelance = crew.filter((o) => isFreelancer(o) && !deaths.includes(o)).map((o) => ({ handle: o.handle, cut: freelanceCut(o, pay) }));
  const cuts = freelance.reduce((n, f) => n + f.cut, 0);
  let heatGain = (am.aborted ? 0 : tpl.heat + (APPROACHES[am.approach]?.heat ?? 0)) + am.extraHeat;
  // The getaway (core/piloting.js): only a job that is leaving heat gets the roll; a quiet one never does.
  // Any heat at all means a getaway roll, a loud job's included; but only heat the crew earned on the job
  // (rolls, costs, shots) can be shed: the Loud approach's own +1 is the price of going loud.
  const pilot = heatGain > 0 ? getawayPilot(onJob(state, am).filter((o) => !deaths.includes(o)), driver(state, am), am.approach) : null;
  const getaway = pilot ? playGetaway({ pilot, heat: heatGain, sheddable: Math.min(heatGain, am.extraHeat), template: tpl, approach: am.approach, alert: am.alert ?? 0, alertMax: ALERT_MAX, rng: hashRng(state.seed, 'getaway', am.jobId, state.day) }) : null;
  if (getaway) {
    heatGain -= getaway.shed;
    if (getaway.tail && state.heatWatched !== true) state.heatWatched = tpl.district; // a tail: the next job there is watched
    const g = getaway;
    // Followed home: the followers are the raid, on the hall most of the crew live in (core/raids.js).
    const hall = g.followed ? homeHallOf(state, onJob(state, am).filter((o) => !deaths.includes(o)), HOME_HALL) : null;
    const raid = hall ? followHome(state, hall.district, jobGrudge(tpl, am.threat ?? tpl.threat)?.gang, g.followed) : null;
    g.hall = raid ? hall.district : null;
    const text = g.result === 'clean' ? `${g.pilot.handle} gets them out clean: heat −${g.shed}.`
      : g.result === 'good' ? `${g.pilot.handle} gets them out: heat −${g.shed}.`
      : g.tail ? `${g.pilot.handle} can't shake the tail. The next job here will be watched${g.hall ? ', and someone followed them home: a raid is coming' : ''}.` : g.hall ? `${g.pilot.handle} gets them out, but someone follows them home: a raid is coming.` : `${g.pilot.handle} gets them out, but the heat stays.`;
    am.getaway = { handle: g.pilot.handle, result: g.result, shed: g.shed, tail: g.tail, followed: g.hall, die: g.die, value: g.value, need: g.need, text };
    am.log.push({ kind: g.tail ? 'bad' : 'good', text });
    record(am, { kind: 'getaway', stat: 'piloting', actor: { id: g.pilot.id, handle: g.pilot.handle }, die: g.die, value: g.value, need: g.need, success: g.margin >= 0, result: g.result, shed: g.shed, tail: g.tail, followed: g.hall, follow: g.followed, text, outcomeCost: {} });
  }
  state.cash += pay - cuts;
  addHeat(state, tpl.district, heatGain); // in the job's district (heat per district, save v39)
  // A job that hurt a gang: they remember (core/gangs.js); an aborted one doesn't count.
  const grudge = !am.aborted ? jobGrudge(tpl, threat) : null;
  const grudged = grudge ? addGrudge(state, grudge.gang, grudge.n) : 0;
  // A finished job earns REP_PER_THREAT per threat level (3 until 2026-10-25; x0.4 for
  // the long climb); an abort costs ABORT_REP (unchanged: scaling it too let crews
  // reach work they weren't ready for, measured 2026-10-25).
  const gain = (am.aborted ? -ABORT_REP : threat * REP_PER_THREAT) - (am.repCut ?? 0); // pulling back from a fight costs more (slice 6)
  state.reputation = Math.round(Math.max(0, Math.min(100, state.reputation + gain)) * 10) / 10;

  // Clients remember: a finished job builds trust; costs marked "client unhappy" take it away.
  const base = am.aborted ? (am.abortedOnTwist ? 0 : ABORT_TRUST) : completionTrust(threat);
  // Client's Favourite (earned): a job they worked for that client, done well, counts for a little more.
  const favourite = !am.aborted && am.clientId && crew.some((o) => earnedOf(o, 'client_favourite', { client: am.clientId })) ? 1 : 0;
  const trustChange = adjustTrust(state, am.clientId, base + am.clientTrust + favourite);

  // Everyone's record of the job, the dead included (they go to the memorial with a summary).
  const facts = recordJob(state, am, { threat, outcome: deaths.length ? 'loss' : am.aborted ? 'aborted' : 'completed', heatGain, deaths });

  for (const op of deaths) {
    state.crew = state.crew.filter((o) => o.id !== op.id);
    state.memorial.push({ id: op.id, name: op.name, handle: op.handle, role: op.role, color: op.color, age: op.age, marks: op.marks ?? [], day: state.day, cause: `Died of wounds after the ${tpl.name}${isFreelancer(op) ? ' (freelancer)' : ''}`, record: recordSummary(op) });
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

  // A pro with the stat and fifty jobs behind them is a veteran now (core/development.js VETERAN_AT).
  const promotedOps = survivors.filter((o) => !isFreelancer(o) && !graduatedOps.includes(o) && promoteVeteran(o));
  for (const op of promotedOps) {
    op.history.push(`Day ${state.day}: became a veteran`);
    state.inbox.unshift({ id: `veteran-${op.id}-${state.day}`, type: 'crew', day: state.day,
      subject: `${op.handle} is a veteran now`,
      body: `After the ${tpl.name}, ${op.name} has nothing left to prove on the small jobs. A veteran: from now on, work at their level means threat 3 and up, and rookies in their role learn faster beside them. Same wage.`, blocking: false, read: false });
  }

  // Growth can mean a pay rise: graduation or main stat +2 since the last deal (core/renewals.js).
  for (const op of survivors) if (!isFreelancer(op)) checkRenewal(state, op, graduatedOps.includes(op));

  // A job on overwatch counts towards a specialisation; Joss offers one once the stats are there too.
  const sniper = am.overwatch && survivors.find((o) => o.id === am.overwatch.id);
  if (sniper) noteOverwatchJob(sniper, am.overwatch.kit);
  checkSpecialisations(state);

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
    noteJobMarks(state, op); // chrome for a danger-zone load, the crew's mark at ten jobs
    if (c.neuralLoad > 70) {
      state.inbox.unshift({ id: `neural-${op.id}-${state.day}`, type: 'warning', day: state.day,
        subject: `${op.handle}'s neural load is in the danger zone`,
        body: `${op.name} is at ${c.neuralLoad}/100. Rest brings it down; pushing harder risks a breakdown.`, blocking: false, read: false });
    }
  }
  // Left behind in a fight (slice 1 of the battle rework): missing for a week, then back badly hurt. Slice 4 builds the rescue, the ransom and the waiting.
  for (const m of am.missing ?? []) {
    const op = opById(state, m.id);
    if (!op || deaths.includes(op)) continue;
    const until = state.day + FIGHT.missingDays; // a week from the day the job ends, however many days it ran
    op.condition.awayUntil = until;
    op.condition.missing = { since: state.day, until };
    setInjury(op, 'serious');
    op.condition.injuryDays = FIGHT.missingDays + INJURY_DAYS.serious;
    op.history.push(`Day ${state.day}: left behind at the ${tpl.name}`);
  }
  // The record may have crossed a line: milestones for those who came home (core/milestones.js).
  const milestoneLines = checkMilestones(state, survivors);
  // Standing for everyone who came home, then fame (one tier at most; core/fame.js). Never a roll, pay or heat.
  const fameLines = afterJobFame(state, survivors, { outcome: deaths.length ? 'loss' : am.aborted ? 'aborted' : 'completed', facts, milestones: milestoneLines, retreat: (am.repCut ?? 0) > 0 });
  noteRivalEncounter(state, am); // another tong's people at the same door: talk for The Word (core/rivals.js)
  // A defining job done with its runner on the crew makes them a Legend (core/legend.js).
  const legendLines = legendResult(state, am, { outcome: deaths.length ? 'loss' : am.aborted ? 'aborted' : 'completed', deaths, onJobIds: onJob(state, am).map((o) => o.id), jobName: tpl.name });
  for (const op of state.crew) {
    if (deaths.length && !am.crewIds.includes(op.id)) op.condition.morale = Math.max(0, op.condition.morale - 15);
  }

  const outcome = deaths.length ? 'loss' : am.aborted ? 'aborted' : 'completed';
  const opened = openingResult(state, am.jobId, outcome); // a district's opening favour (core/halls.js)
  const heistLines = heistResult(state, am.jobId, outcome); // a heist's prep or finale (core/heists.js)
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
    ...(named ? [{ tone: 'good', text: NAMED_TEXT.report.replace('{client}', clientById(am.clientId)?.name ?? 'The client').replace('{op}', opById(state, am.askedFor)?.handle ?? state.memorial.find((m) => m.id === am.askedFor)?.handle ?? 'them').replace('{pct}', Math.round(NAMED_OFFER.payBonus * 100)) }] : []),
    ...(cuts ? [{ tone: 'plain', text: `Freelancers took ${money(cuts)}.` }] : []),
    ...(am.bribe ? [{ tone: 'plain', text: `Props and bribes cost ${money(am.bribe)} up front.` }] : []),
    ...(am.getaway ? [{ tone: am.getaway.tail ? 'bad' : am.getaway.shed ? 'good' : 'plain', text: am.getaway.text }] : []),
    { tone: heatGain > 0 ? 'warn' : 'plain', text: `Heat +${heatGain}.` },
    ...(grudged ? [{ tone: 'warn', text: `${GANGS[grudge.gang].name[0].toUpperCase()}${GANGS[grudge.gang].name.slice(1)} won't forget this (grudge +${grudged}, now ${grudgeOf(state, grudge.gang)}/10).` }] : []),
    injuries.length ? { tone: 'bad', text: `Injured: ${injuries.join(', ')}.` } : { tone: 'good', text: 'Nobody hurt.' },
    ...(deaths.length ? [{ tone: 'bad', text: 'Their names go on the wall.' }] : []),
    ...(growthLines.length ? [{ tone: 'good', text: `Improved: ${growthLines.join(', ')}.` }] : []),
    ...milestoneLines.map((m) => ({ tone: 'milestone', text: `Milestone: ${m.text}` })),
    ...fameLines.map((f) => ({ tone: 'milestone', text: `Fame: ${f.text}` })),
    ...legendLines,
    ...promotedOps.map((o) => ({ tone: 'good', text: `${o.handle} is a veteran now.` })),
    ...patched.map((p) => ({ tone: 'good', text: `${p.medic.handle} patched up ${p.patient.handle} (Clinic Hands): back a day sooner.` })),
    ...(client && trustChange ? [{ tone: trustChange > 0 ? 'good' : 'bad', text: `${client.name} ${trustChange > 0 ? 'thinks more of you' : 'is unhappy with you'} (trust ${trustChange > 0 ? '+' : ''}${trustChange}).` }] : []),
    ...(opened ? [opened] : []),
    ...heistLines,
  ];
  const id = `report-${state.day}-${state.rngCounter}`;
  const events = am.events ?? [];
  state.inbox.unshift({
    id, type: 'report', day: state.day, subject,
    body: [...steps, ...results.map((o) => o.text)].join(' '),
    // Who went and what it came to, for Today's "back" card (2026-11-04, crews out made visible).
    back: { crewIds: [...am.crewIds, am.overwatch?.id, am.wheels, am.standby?.joined ? null : am.standby?.id].filter(Boolean), pay, away: !!am.away, templateId: am.templateId },
    timeline: {
      result: outcome, steps, outcome: results,
      // The full log and its summary (save v16). Hands-off runs also name their orders.
      // A fight's stage (where everyone stood on the map, core/runfight.js stageOf) is for the live view only: the report
      // keeps the lines and the beats, not the staging, so a year of reports stays small.
      events: events.map((e) => (e.stage ? (({ stage, ...rest }) => rest)(e) : e)), summary: summariseRun(events, { id, outcome, deaths: deaths.length }),
      // Hands-off runs name their orders (the report plays out on first open); a live run says how it was called.
      orders: am.callIn === 'never' || !am.callIn ? am.orders ?? null : null, callIn: am.callIn ?? null, liveOrders: am.callIn && am.callIn !== 'never' ? am.orders ?? null : null,
    },
    blocking: false, read: false,
  });
  // Full logs are kept for the most recent jobs; older reports keep their timeline and summary.
  state.inbox.filter((m) => m.type === 'report' && m.timeline?.events).slice(REPORT_LOGS_KEPT).forEach((m) => { delete m.timeline.events; });
  reactToJob(state, am, tpl, { heatGain, injuries, deaths });
  // Everyone on the job counts towards traits, outside too; incidents and saves count for less
  // than a crisis roll (core/earned.js weightOf, retuned 2026-10-27).
  afterJob(state, { events, district: tpl.district, clientId: am.clientId, outcome, crewIds: onJob(state, am).map((o) => o.id) });
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
