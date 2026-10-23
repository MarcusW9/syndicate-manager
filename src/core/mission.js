// Mission engine: plan -> tap-through beats -> crisis decisions -> outcome.
// Pure logic. Every function takes state and returns a new state.
//
// Death rule: an operative can only die after the player chooses "Push on"
// while they are critical. Abort/extract always saves everyone.

import { templateById } from './jobs.js';
import { nextRng } from './random.js';
import { d20 } from './rng.js';
import { APPROACHES, bestFor, effectiveStat, findRole, worsenInjury, setInjury } from './crew.js';
import { successChance, riskLabel } from './risk.js';
import { XP, applyGrowth, primaryStat } from './development.js';

const EXIT_KINDS = new Set(['abort', 'extract']);
const STABILISE_DIFFICULTY = 9;

const crewOf = (state, am) => am.crewIds.map((id) => state.crew.find((o) => o.id === id)).filter(Boolean);
const opById = (state, id) => state.crew.find((o) => o.id === id);
const crisisById = (tpl, id) => tpl.crises.find((c) => c.id === id);

/** Bank raw growth points for an operative; applied when the job ends (see development.js). */
function addXp(am, opId, stat, points) {
  am.xp = am.xp ?? {};
  const mine = (am.xp[opId] = am.xp[opId] ?? {});
  mine[stat] = (mine[stat] ?? 0) + points;
}

/** Replace {driver}, {tech}, {face}, {muscle}, {medic}, {op} with crew handles. */
export function fill(text, state, am) {
  const crew = crewOf(state, am);
  return text.replace(/\{(\w+)\}/g, (_, key, offset, whole) => {
    const op = key === 'op' ? opById(state, am.focusOp) : crew.find((o) => o.role === key);
    if (op) return op.handle;
    const startsSentence = offset === 0 || /[.!?:]["']?\s+$/.test(whole.slice(0, offset));
    return startsSentence ? 'Someone' : 'someone';
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
  const rng = nextRng(state);

  // Draw 2 crises (3 on threat 4+ if the pool allows), in random order.
  const pool = [...tpl.crises];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const crises = pool.slice(0, Math.min(pool.length, tpl.threat >= 4 ? 3 : 2));

  // Spread crises between beats.
  const n = tpl.beats.length;
  const positions = crises.map((_, i) => Math.max(1, Math.floor(((i + 1) * n) / (crises.length + 1))));
  const queue = [];
  for (let b = 0; b < n; b++) {
    queue.push({ type: 'beat', index: b });
    positions.forEach((p, i) => { if (p === b + 1) queue.push({ type: 'crisis', id: crises[i].id }); });
  }

  state.jobs = state.jobs.filter((j) => j.id !== jobId);
  state.lastJobDay = state.day;
  state.activeMission = {
    jobId, templateId: tpl.id, crewIds, approach,
    queue, step: 0, log: [],
    payCut: 0, extraHeat: 0, clientTrust: 0,
    critical: null, stabiliseFailed: false, untreated: [],
    focusOp: null, aborted: false, done: false, result: null, xp: {},
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

function rollerFor(state, am, choice, crew) {
  if (choice.kind === 'stabilise') {
    const medic = findRole(crew, 'medic');
    if (medic) {
      const s = effectiveStat(medic, 'medical', { approach: am.approach, crew });
      return { op: medic, value: s.value + (medic.traits.includes('steady_hands') ? 2 : 0), notes: s.notes };
    }
  }
  return bestFor(crew, choice.stat, { approach: am.approach });
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
    const view = { id: choice.id, label: fill(choice.label, state, am), kind: choice.kind, available: req.ok, reason: req.reason ?? '', cost: costText(choice.cost) };
    if (EXIT_KINDS.has(choice.kind)) return { ...view, risk: 'safe', riskReason: 'Everyone gets out alive' };
    if (!req.ok) return view;
    if (choice.sure) return { ...view, risk: 'certain', riskReason: 'No roll needed' };
    const roller = rollerFor(state, am, choice, crew);
    const chance = successChance(roller.value, choice.difficulty);
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
    am.aborted = true;
    am.step = am.queue.length - 1;
    advance(state);
    return state;
  }

  const roller = rollerFor(state, am, choice, crew);
  const rng = nextRng(state);
  const success = choice.sure || d20(rng) + roller.value >= 10 + choice.difficulty;

  // Everyone learns from a roll: the roller most (even on a failure), the rest by watching.
  if (!choice.sure) {
    addXp(am, roller.op.id, choice.stat, XP.roll);
    for (const o of crew) if (o.id !== roller.op.id && o.condition.injury !== 'critical') addXp(am, o.id, choice.stat, XP.watch);
  }

  if (choice.neural) {
    const rate = roller.op.traits.includes('chromed') ? 1.5 : 1;
    roller.op.condition.neuralLoad = Math.min(100, roller.op.condition.neuralLoad + Math.round(choice.neural * rate));
  }

  if (success) {
    am.log.push({ kind: 'good', text: fill(choice.success, state, am) });
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
      const s = effectiveStat(medic, 'medical', { approach: am.approach, crew });
      const value = s.value + (medic.traits.includes('steady_hands') ? 2 : 0);
      choices.push({ id: 'stabilise', label: `${medic.handle} stabilises ${op.handle}`, available: true, cost: '+1 heat',
        risk: riskLabel(successChance(value, STABILISE_DIFFICULTY)), riskReason: `${medic.handle} on medical (${value}). If it fails you must extract or push on.` });
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
    const medic = findRole(crew.filter((o) => o.id !== op.id), 'medic');
    if (!medic) return prev;
    const s = effectiveStat(medic, 'medical', { approach: am.approach, crew });
    const value = s.value + (medic.traits.includes('steady_hands') ? 2 : 0);
    am.extraHeat += 1;
    addXp(am, medic.id, 'medical', XP.roll);
    am.log.push({ kind: 'choice', text: `${medic.handle} works on ${op.handle}.` });
    if (d20(nextRng(state)) + value >= 10 + STABILISE_DIFFICULTY) {
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

  const pay = Math.round((tpl.pay * Math.max(0, 1 - am.payCut)) / 50) * 50;
  const heatGain = (am.aborted ? 0 : tpl.heat + (APPROACHES[am.approach]?.heat ?? 0)) + am.extraHeat;
  state.cash += pay;
  state.heat = Math.min(10, state.heat + heatGain);
  state.reputation = Math.max(0, Math.min(100, state.reputation + (am.aborted ? -3 : tpl.threat * 3)));

  for (const op of deaths) {
    state.crew = state.crew.filter((o) => o.id !== op.id);
    state.memorial.push({ id: op.id, name: op.name, handle: op.handle, role: op.role, color: op.color, day: state.day, cause: `Died of wounds after the ${tpl.name}` });
  }

  // Growth: crisis lessons always count; finishing the job also teaches its key stats.
  const survivors = crewOf(state, am);
  if (!am.aborted) {
    for (const op of survivors) {
      for (const stat of tpl.keyStats) addXp(am, op.id, stat, XP.job);
      addXp(am, op.id, primaryStat(op), XP.craft);
    }
  }
  const growth = applyGrowth(survivors, am.xp ?? {});
  for (const op of growth.graduated) {
    op.history.push(`Day ${state.day}: graduated from rookie`);
    state.inbox.unshift({ id: `graduate-${op.id}-${state.day}`, type: 'crew', day: state.day,
      subject: `${op.handle} isn't a rookie any more`,
      body: `After the ${tpl.name}, nobody on the crew calls ${op.name} the new kid. A pro now, on a rookie's wage.`, blocking: false, read: false });
  }

  const injuries = [];
  for (const op of survivors) {
    const c = op.condition;
    c.fatigue = Math.min(100, c.fatigue + 10 + tpl.threat * 6);
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
  am.result = { outcome, pay, heatGain, injuries, deaths: deaths.map((d) => d.handle), growth: growth.lines };
  am.done = true;

  const subject = deaths.length ? `${deaths.map((d) => d.handle).join(', ')} died on the ${tpl.name}`
    : am.aborted ? `${tpl.name} aborted` : `${tpl.name} completed`;
  state.inbox.unshift({
    id: `report-${state.day}-${state.rngCounter}`, type: 'report', day: state.day, subject,
    body: `Paid ${pay}. Heat +${heatGain}.` + (injuries.length ? ` Injured: ${injuries.join(', ')}.` : ' Nobody hurt.') +
      (deaths.length ? ' Their names go on the wall.' : '') +
      (growth.lines.length ? ` Improved: ${growth.lines.join(', ')}.` : ''),
    blocking: false, read: false,
  });
}

export function closeMission(prev) {
  if (!prev.activeMission?.done) return prev;
  const state = structuredClone(prev);
  state.activeMission = null;
  return state;
}
