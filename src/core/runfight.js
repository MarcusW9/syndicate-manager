// Engine 2 inside a run (battle rework slice 1c; drafts/SPEC-battle-orders.md sections 2, 10, 15, 16,
// 30): starting one of the five jobs' fights, playing its rounds, the call-ins (death's door, the van,
// the tech under fire), pulling back, and what pips left turn into. The rules of a round are in
// core/fight.js; this is the run's side of it, as core/runbattle.js is for engine 1. Pure, on the cloned
// state passed in. A cycle with core/mission.js on purpose: both are only called at run time.
//
// The fight lives in am.battle with engine: 2. It reaches the rest of the game three ways:
//   - the feed and the plan read the same snapshot shape engine 1 gave them (guards, runners with hp),
//     so the watch screen plays an engine-2 fight without a screen of its own (that is slice 2);
//   - a call-in is am.pending { kind: 'dilemma', id, key, slots } (or 'door' at death's door), answered
//     through describePending / resolvePending like every other call-in, and by the standing orders when
//     the crew is hands-off (fightAnswer);
//   - what a fight does to people is written back at its end (fightInjuries): injuries from pips, the
//     dead (am.fightDead, finished in mission.js finish), and runners left behind (am.missing, slice 1:
//     missing for FIGHT.missingDays, back with a serious injury; slice 4 builds the rescue and the ransom).

import { nextRng } from './random.js';
import { direct } from './director.js';
import { stageSpots, stageNeed, layoutFight, enemyUnit } from './fightmap.js';
import { pickSite } from '../data/sites.js';
import { BATTLE } from '../data/battle.js';
import { setInjury, worsenInjury, effectiveStat } from './crew.js';
import { XP } from './development.js';
import { noteInjury } from './earned.js';
import { ALERT_MAX } from './incidents.js';
import { overwatchOf } from './battle.js';
import { FIGHT, FIGHT_JOBS } from '../data/fights.js';
import { DILEMMAS } from '../data/dilemmas.js';
import { lineText, nameList, chanceWord } from './fighttext.js';
import * as Fight from './fight.js';
import { actors, overwatchOp, driver, standbyReady, opById, grow, record, takeWhy, addNeural } from './run.js';
import { currentStep, advance, exitRun } from './mission.js';

/** The fight type a job plays on engine 2, or null (every other job, and raids, stay on engine 1). */
export const fightTypeOf = (templateId) => FIGHT_JOBS[templateId] ?? null;

// --- what the feed and the plan read ---------------------------------------------------------------

/** Everyone's health in the shape the feed, the plan and the call-in card read (enemies are "guards", pips are hp). Kept small: every round of a fight is saved in the report. */
export const fightSnapshot = (b) => ({
  guards: b.enemies.map((e) => ({ n: e.n, hp: Math.max(0, e.pips), max: e.max, out: e.out || e.fled })),
  runners: b.runners.map((r) => ({ id: r.id, handle: r.handle, hp: r.pips, max: r.max, down: r.down || r.dead })),
});
/**
 * Where everyone stands on the site map, for the live battle view (ui/fightstage.js): core/fightmap.js layoutFight,
 * kept compact for the record (null fields left out). actions: the round's resolved actions (playRound's result), so
 * the picture can show a protector leaning to who they cover. null when the fight has no spots. Staging only.
 */
export function stageOf(b, actions = null) {
  const lay = layoutFight(b);
  if (!lay) return null;
  const act = new Map((actions ?? []).map((a) => [a.opId, { kind: a.action, target: a.target ?? null }]));
  const trim = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v != null && v !== false));
  const units = {};
  for (const r of b.runners) { const u = lay.units[r.id]; units[r.id] = trim({ side: 'crew', at: u.at, cover: u.cover, mark: u.mark, stance: u.stance, from: u.from, act: act.get(r.id) }); }
  for (const e of b.enemies) { const u = lay.units[enemyUnit(e.n)]; units[enemyUnit(e.n)] = trim({ side: 'enemy', n: e.n, kind: e.kind, at: u.at, cover: u.cover, mark: u.mark, stance: u.stance, entrance: u.entrance }); }
  const p = lay.points;
  return { seed: b.showcaseSeed ?? 0, round: b.round, type: b.type, van: p.van, perch: p.perch, target: p.target, units };
}

/** The screens' view of any fight: engine 2 as the snapshot, engine 1 as it is. */
export const fightView = (b) => (b?.engine === 2 ? fightSnapshot(b) : b);
export const enemiesLeft = (b) => (b.engine === 2 ? Fight.enemiesUp(b).length : b.guards.filter((g) => !g.out).length);

// Which stat a line grows, as a runner's incident does (core/runbattle.js).
const GROWS = { attack: 'combat', jam: 'tech', stabilise: 'medical', patch: 'medical', board: 'cool', carry: 'cool' };
// A line's kind as the plan's animation knows it; everything else is a note it ignores.
const CUE = { attack: 'shoot', shot: 'guard', overwatch: 'overwatch', stabilise: 'stabilise', patch: 'patch' };
// Only what the feed, the plan and the report read, so a year of saved reports stays small.
const feedLine = (l) => ({
  kind: CUE[l.kind] ?? 'note', rule: l.kind, key: l.key ?? null, slots: l.slots ?? {}, text: l.text, actor: l.actor ? { id: l.actor, handle: l.actor } : null, guard: l.enemy ?? null, targetId: l.targetId ?? (typeof l.target === 'string' ? l.target : null),
  ...(l.burst ? { burst: true } : {}),
  success: l.success ?? null, damage: l.damage ?? 0, heal: l.heal ?? 0, kit: l.kit ?? null, dropped: !!l.dropped, ...(l.roll ? { die: l.roll.die, need: l.roll.need, value: l.roll.value } : {}),
  ...(l.order ? { order: l.order, from: l.from } : {}),
});

const names = (b, ids) => nameList(ids.map((id) => b.runners.find((r) => r.id === id)?.handle ?? id));

// --- starting a fight ------------------------------------------------------------------------------

/**
 * Where the fight is staged on the site map (core/fightmap.js stageSpots; the live battle view): the job's site, as
 * engine 1 picks it (data/sites.js pickSite from the job's id), where the district stands its fights on the map. Staging
 * only: no rule reads it. null where the district has no fight spots. Also used by the save migration (v63).
 */
export function fightStage(district, am, zone, crew) {
  if (!BATTLE.spotsIn.includes(district)) return null;
  return stageSpots(pickSite(district, am.jobId, am.templateId, null), zone, stageNeed(crew));
}

/** An unsaved danger incident on one of the five jobs turns into an engine-2 fight (core/runbattle.js startBattle hands it here). */
export function startFight(state, am, tpl, inc, id, zone, diff, able, { ambush = false } = {}) {
  const type = fightTypeOf(am.templateId);
  const wheels = driver(state, am);
  const sb = type === 'holdExtract' ? standbyReady(state, am) : null; // standby rides with the van
  const ow = overwatchOf(overwatchOp(state, am), am.overwatch, zone);
  const rng = nextRng(state);
  const b = Fight.buildFight({
    type, diff: Fight.fightDiff(diff), threat: am.threat ?? tpl.threat, site: tpl.district, crew: able, approach: am.approach,
    overwatch: ow, wheels: wheels ? { id: wheels.id, handle: wheels.handle, value: effectiveStat(wheels, 'piloting', { approach: am.approach }).value } : null,
    standbyOp: sb, risk: ['cautious', 'steady', 'committed'].includes(am.orders) ? am.orders : 'steady',
    watched: am.callIn !== 'never' && !(am.away && !am.away.command),
  }, rng);
  // A passed roll on a loud run's first guard (mission.js): that guard is put down quietly, and the rest get no shot in round 1.
  if (ambush) { b.ambush = true; if (b.enemies.length > 1 && b.enemies.at(-1).kind === 'hired') b.hiredTotal -= 1; if (b.enemies.length > 1) b.enemies.pop(); }
  b.auto = false;
  b.startLines = [];
  b.spots = fightStage(tpl.district, am, zone, able.length);
  am.battle = b;
  am.fought = true;
  if (am.alert >= ALERT_MAX && !am.wentLoud) am.alertDue = true;
  const text = `It's a fight: ${b.enemies.length} against ${b.runners.map((r) => r.handle).join(', ')}.${ambush ? ' You have the jump on them: they get no shot in round one.' : ''} ${type === 'holdHack' ? `Keep ${b.runners.find((r) => r.id === b.goal.protect)?.handle ?? 'the tech'} working.` : 'Hold the line until the van pulls in, then everyone boards.'}`;
  record(am, { kind: 'battle', phase: 'start', from: id, zone, text, report: text, ...fightSnapshot(b), stage: stageOf(b) });
  am.log.push({ kind: 'bad', text });
  am.report = [...(am.report ?? []), text];
  am.queue.splice(am.step + 1, 0, { type: 'battle' });
  advance(state);
  drawAhead(state, am);
}

// --- playing a round -------------------------------------------------------------------------------

/** Does this fight wait for the player's orders each round? The same rule as core/autorun.js needsPlayer: not hands-off, not handed off, not an away crew without command. */
export const waitsForOrders = (am) => !!am.battle && am.callIn !== 'never' && !am.battle.auto && !(am.away && !am.away.command);

/**
 * Every fight draws the coming round's threats first, at every pace, so the screen can show what each enemy means
 * to do (and the chances) before the player gives orders, and so the same seed gives the same fight whether or not
 * anyone watched. runFight keeps a fallback draw for fights saved before this (mid-fight saves).
 */
function drawAhead(state, am) {
  const b = am.battle;
  if (b && !b.end && !b.drawn) b.startLines.push(...Fight.startRound(b, nextRng(state)));
}

/**
 * Play the fight's next round (the same call as engine 1's runBattle). change: Take Command at the round's
 * boundary, { risk, orders: { [opId]: ORDER } }; anyone without a new order keeps theirs (the crew's own, or
 * what the player set). Before the round resolves, an authored dilemma that holds pauses the fight as a call-in
 * (once per situation); the drawn threats wait with it. After it: the fight's end maps onto the run, and a
 * runner at death's door calls a watched fight in (unwatched crews on cautious or steady pull back).
 */
export function runFight(prev, change = {}) {
  const am0 = prev.activeMission;
  if (!am0?.battle || am0.battle.engine !== 2 || currentStep(am0)?.type !== 'battle' || am0.pending || am0.critical) return prev;
  const state = structuredClone(prev);
  const am = state.activeMission;
  const b = am.battle;
  if (change.risk) Fight.setRisk(b, change.risk);
  for (const [id, o] of Object.entries(change.orders ?? {})) Fight.setOrder(b, id, o);
  const rng = nextRng(state);
  if (!b.drawn) b.startLines.push(...Fight.startRound(b, rng));
  // A dilemma situation that has passed can come up again; one that still holds does not repeat.
  for (const key of Object.keys(b.dilemmasFired)) if (!Fight.dilemmaHolds(b, key.split(':')[0])) delete b.dilemmasFired[key];
  const due = Fight.dueDilemmas(b)[0];
  if (due) {
    b.dilemmasFired[due.key] = true;
    am.pending = { kind: 'dilemma', id: due.id, key: due.key, day: state.day, slots: slotsFor(b, due), subjects: due.subjects };
    return state;
  }
  return playOn(state, am, rng);
}

/** The round itself, once nothing is waiting on a call: play it, record it, and see whether the fight is over. */
function playOn(state, am, rng) {
  const b = am.battle;
  const r = Fight.playRound(b, rng);
  const lines = [...b.startLines, ...r.lines];
  b.startLines = [];
  if (b.overwatch && am.overwatch) {
    am.overwatch.left = b.overwatch.left;
    if (r.neural) addNeural(opById(state, b.overwatch.id), r.neural);
  }
  am.extraHeat += r.heat;
  // Someone dying who has been stabilised is back to a serious wound and out of danger (engine 1's rule, core/runbattle.js).
  for (const x of b.runners.filter((y) => y.stable && !y.dead && (am.untreated ?? []).includes(y.id))) {
    am.untreated = am.untreated.filter((id) => id !== x.id);
    setInjury(opById(state, x.id), 'serious');
  }
  for (const l of lines) if (l.actor && GROWS[l.kind] && l.roll) grow(state, am, opById(state, l.actor), GROWS[l.kind], XP.incident);
  const up = enemiesLeft(b);
  const text = `Round ${b.round}: ${up ? `${up} still up` : 'nobody left shooting'}.`;
  // The director tells the round (core/director.js): it reads the round and changes no rule. Its beats point at the event's lines by index.
  const told = direct(b, { ...r, lines }, b.director);
  b.director = told.memory;
  const beats = told.beats.map((x) => ({ tier: x.tier, lines: x.lines.map((l) => lines.indexOf(l)), focus: x.focus, key: x.key, slots: x.slots, holdMs: x.holdMs }));
  record(am, { kind: 'battle', phase: 'round', round: b.round, text, lines: lines.map(feedLine), beats, ...fightSnapshot(b), stage: stageOf(b, r.actions) });
  am.log.push({ kind: up ? 'bad' : 'good', text });
  for (const id of b.runners.filter((x) => x.dead).map((x) => x.id)) if (!(am.fightDead ?? []).includes(id)) am.fightDead = [...(am.fightDead ?? []), id];
  return afterRound(state, am);
}

// A fight that ends this way leaves the run going (the objective done, or the van gone with those it could carry);
// any other end is a pull back: the objective is lost, the crew comes home at the usual cost.
const GOES_ON = new Set(['won', 'lostRunner', 'leftBehind']);

/** What happens after a round: the fight goes on, ends, or (watched, someone at death's door) asks. */
function afterRound(state, am) {
  const b = am.battle;
  const end = b.end;
  if (!end) { drawAhead(state, am); return state; }
  // Death's door: someone went down and the crew would pull back. A watched crew asks first (the player's call;
  // the death rule); a hands-off one pulls back on its own, as hands-off crews always have.
  if (end.result === 'extracted' && am.callIn !== 'never') {
    const downed = b.runners.find((x) => x.down && !x.dead && !x.fightOn);
    if (downed) { b.end = null; am.pending = { kind: 'door', opId: downed.id, day: state.day }; return state; }
  }
  if (GOES_ON.has(end.result)) return endFight(state, am);
  return retreatFight(state, am, { text: end.text, choice: 'They pull back', why: `${end.text}.` });
}

// --- the end ---------------------------------------------------------------------------------------

/** Pips left become the injury the game tracks; the dead and the left-behind are noted for the run's finish. */
function fightInjuries(state, am, b) {
  const hurt = [];
  const out = (id) => { if (!(am.out ?? []).includes(id)) am.out = [...(am.out ?? []), id]; };
  for (const o of Fight.outcomeOf(b)) {
    const op = opById(state, o.id);
    if (!op) continue;
    if (o.dead) { out(op.id); hurt.push({ id: op.id, handle: op.handle, severity: 'dead' }); continue; }
    if (o.missing) {
      am.missing = [...(am.missing ?? []), { id: op.id, down: o.down }]; // the week is counted from the day the job finishes (mission.js finish)
      out(op.id); hurt.push({ id: op.id, handle: op.handle, severity: 'missing' });
      continue;
    }
    if (o.down) {
      const x = b.runners.find((r) => r.id === op.id);
      if (x.fightOn && !x.stable) continue; // still dying: the push-on rule decides (am.untreated, mission.js finish)
      if (!x.stable) { setInjury(op, 'serious'); op.condition.injuryDays = Math.max(op.condition.injuryDays, 21); }
      noteInjury(state, op, 'serious');
      hurt.push({ id: op.id, handle: op.handle, severity: 'serious', down: true });
      out(op.id);
      continue;
    }
    if (o.injury === 'none') continue;
    const injury = worsenInjury(op.condition.injury, o.injury) === 'critical' ? 'serious' : worsenInjury(op.condition.injury, o.injury);
    setInjury(op, injury);
    noteInjury(state, op, injury);
    hurt.push({ id: op.id, handle: op.handle, severity: injury });
    if (injury === 'serious') out(op.id);
  }
  for (const r of b.runners.filter((x) => x.withdrawn && !x.dead)) out(r.id);
  return hurt;
}
const hurtLine = (hurt) => hurt.map((h) => `${h.handle} ${h.severity === 'dead' ? 'died' : h.severity === 'missing' ? 'was left behind' : h.down ? 'went down' : h.severity === 'serious' ? 'is badly hurt' : 'is hurt'}`).join(', ');

/** The fight is over and the run goes on. */
function endFight(state, am) {
  const b = am.battle;
  const hurt = fightInjuries(state, am, b);
  const text = b.end.text;
  const report = `${text}${hurt.length ? ` ${hurtLine(hurt)}.` : ' Nobody badly hurt.'}`;
  record(am, { kind: 'battle', phase: 'end', how: b.end.result, text, cause: text, report, hurt, ...fightSnapshot(b), stage: stageOf(b) });
  am.log.push({ kind: hurt.length ? 'bad' : 'good', text: report });
  am.report = [...(am.report ?? []), report];
  am.battle = null;
  const serious = hurt.find((h) => h.severity === 'serious');
  if (serious && !am.raid) am.pending = { kind: 'injury', opId: serious.id };
  if (am.alertDue || (am.alert >= ALERT_MAX && !am.wentLoud)) {
    if (am.pending) am.alertDue = true;
    else { delete am.alertDue; am.pending = { kind: 'alert' }; }
  }
  if (!am.pending && !actors(state, am).length) {
    exitRun(state, am, { text: 'Nobody left who can carry on.', choice: 'The crew pull out', report: 'With nobody left standing to finish it, the crew pulled out.' });
    return state;
  }
  advance(state);
  return state;
}

/**
 * Pull back from a fight: an exit, so everyone comes home (anyone left dying is saved by it). No parting shots (spec 30);
 * the job, its pay, heat and reputation are the cost, as in engine 1 (owner's calls, 2026-10-29).
 */
function retreatFight(state, am, { text, choice, why, cause = text }) {
  const b = am.battle;
  const hurt = fightInjuries(state, am, b);
  am.payCut = Math.max(am.payCut, 1);
  am.extraHeat += FIGHT.retreat.heat;
  am.repCut = (am.repCut ?? 0) + FIGHT.retreat.rep;
  record(am, { kind: 'battle', phase: 'retreat', text, cause, lines: [], hurt, forced: false, ...fightSnapshot(b), stage: stageOf(b) });
  am.battle = null;
  const report = `The crew pulled back from the fight. ${text}.${hurt.length ? ` ${hurtLine(hurt)}.` : ''} No pay, heat +${FIGHT.retreat.heat}, reputation −${FIGHT.retreat.rep}.`;
  exitRun(state, am, { text, choice, why, report });
  return state;
}

/** The player pulls the crew back between rounds (the same call as engine 1's pullBack). */
export function pullBackFight(prev) {
  const am0 = prev.activeMission;
  if (!am0?.battle || am0.battle.engine !== 2 || currentStep(am0)?.type !== 'battle' || am0.pending || am0.critical) return prev;
  const state = structuredClone(prev);
  const end = Fight.pullBack(state.activeMission.battle);
  return retreatFight(state, state.activeMission, { text: 'You call the crew back', choice: 'They pull back', why: 'You called them back.', cause: end.text });
}

// --- call-ins ----------------------------------------------------------------------------------------

function slotsFor(b, due) {
  const prot = b.runners.find((r) => r.id === b.goal.protect);
  const techOut = due.id === 'pullOutPoint' && b.type === 'holdHack' && due.subjects.includes(b.goal.protect);
  return { protected: prot?.handle ?? '', outside: names(b, due.subjects), n: due.subjects.length, who: names(b, due.subjects), level: b.risk.level, techNote: techOut ? lineText('dilemma.pullOutPoint.techNote') : '' };
}

/** The choices of a dilemma call-in: its authored options (placeholder wording), then Pull back, which every call-in offers. */
export function fightChoices(pending, b) {
  const d = DILEMMAS[pending.id];
  // The hold's length and heat are the rules' numbers, so the trade-off lines read them (also for a call-in saved before they were slots).
  const slots = { rounds: FIGHT.holdRounds, heat: FIGHT.holdHeat, ...pending.slots };
  // The van call shows the odds of leaving whoever is outside, each way (core/fight.js vanOdds: the round function, fixed seeds).
  const van = pending.id === 'vanCantWait' && b ? Fight.vanOdds(b) : null;
  const oddsOf = (id) => (van && (id === 'goNow' || id === 'hold') ? lineText('callin.leaveOdds', { chance: chanceWord(id === 'hold' ? van.hold : van.leaveOnTime) }) : '');
  const said = (key) => { const t = lineText(key, slots); return t === key ? '' : t; }; // keeping the orders needs no trade-off line
  return [
    ...d.options.filter((o) => !b || Fight.optionAvailable(b, o)).map((o) => ({ id: o.id, label: lineText(`dilemma.${pending.id}.${o.id}`, slots), tradeoff: said(`dilemma.${pending.id}.${o.id}.tradeoff`), odds: oddsOf(o.id), cost: o.cost ? lineText('callin.cost', { heat: o.cost.heat }) : '', push: false })),
    { id: 'out', label: lineText('callin.pullBack'), cost: lineText('callin.pullBackCost', { heat: FIGHT.retreat.heat, rep: FIGHT.retreat.rep }), exit: true },
  ];
}

/** The answer the standing orders give when an away crew's call-in runs out at the end of its day: the van goes on time, anything else carries on. */
export const expiryAnswer = (pending) => (pending.id === 'vanCantWait' ? 'goNow' : pending.id === 'pullOutPoint' ? 'pullOut' : 'carryOn');

/** The van call's outside list, for the card: the people not aboard, as handles. */
const pendingOutside = (am) => (am.pending.id === 'vanCantWait' ? [...Fight.standing(am.battle), ...am.battle.runners.filter((r) => r.down && !r.aboard && !r.dead && !r.withdrawn)].map((r) => r.handle) : []);

/** What a dilemma call-in shows: what changed, the options, the crew's health. */
export function describeFightPending(state) {
  const am = state.activeMission;
  const b = am.battle;
  const snap = fightSnapshot(b);
  return {
    kind: 'dilemma', text: lineText(`dilemma.${am.pending.id}.changed`, am.pending.slots), choices: fightChoices(am.pending, b).map((c) => ({ ...c, available: true, risk: c.exit ? 'safe' : null })),
    standby: null, outside: pendingOutside(am), fight: { runners: snap.runners.map((r) => ({ handle: r.handle, hp: r.hp, max: r.max, down: r.down })), guards: snap.guards.map((g) => ({ n: g.n, hp: g.hp, max: g.max, out: g.out })) },
  };
}

/**
 * What the standing orders answer to a dilemma when the crew is hands-off (the risk level answers, spec 30):
 * the van that cannot wait is held for a downed teammate on cautious and steady, and let go on time on committed;
 * the tech under fire carries on with the orders as they stand.
 */
export function fightAnswer(am) {
  const b = am.battle;
  const level = b.risk.level;
  if (am.pending.id === 'vanCantWait') {
    const downedOutside = b.runners.some((r) => r.down && !r.aboard && !r.dead && !r.withdrawn);
    return level !== 'committed' && downedOutside
      ? { id: 'hold', why: 'Someone was down at the van, and cautious and steady crews hold it for them.' }
      : { id: 'goNow', why: level === 'committed' ? 'Committed orders: the van went on time.' : 'Nobody was down outside, so the van went on time.' };
  }
  if (am.pending.id === 'pullOutPoint') return { id: 'pullOut', why: 'The risk level stood: they pulled out at their point.' };
  return { id: 'carryOn', why: 'The orders stood: they carried on.' };
}

/** Answer a fight call-in: a dilemma's option, or at death's door pull back or keep fighting. */
export function resolveFightDecision(state, am, choice, view) {
  const b = am.battle;
  const why = takeWhy(am);
  // Pulling back at a call-in: the cause line is the fight's own (someone down, or the crew pulled back).
  if (choice.exit) return retreatFight(state, am, { text: view.text, choice: choice.label, why, cause: lineText(am.pending.kind === 'door' ? 'end.extracted' : 'end.pulledBack') });
  if (am.pending.kind === 'door') {
    // Keep fighting with them down: the push-on rule (they could die, am.untreated), and they bleed in the fight.
    const x = b.runners.find((r) => r.id === am.pending.opId);
    const op = opById(state, x.id);
    x.fightOn = true;
    setInjury(op, 'critical');
    noteInjury(state, op, 'critical');
    am.untreated = [...(am.untreated ?? []), op.id];
    const report = `The crew kept fighting with ${op.handle} down and bleeding.`;
    record(am, { kind: 'decision', push: true, text: view.text, choice: choice.label, why, report, choiceCost: {} });
    am.log.push({ kind: 'bad', text: report });
    am.report = [...(am.report ?? []), report];
    am.pending = null;
    drawAhead(state, am);
    return state; // the next round is the run's next step
  }
  // A dilemma. Revalidate first: if the situation has passed, the answer is discarded and the crew carries on.
  const id = am.pending.id;
  const opt = DILEMMAS[id].options.find((o) => o.id === choice.id);
  const holds = Fight.dilemmaHolds(b, id) && Fight.optionAvailable(b, opt);
  let report = `The crew carried on.`;
  let heat = 0;
  if (holds && opt) {
    if (opt.ordersPatch) Fight.applyPatch(b, opt.ordersPatch);
    if (opt.keepIn) Fight.keepIn(b, am.pending.subjects ?? []);
    if (opt.vanWait) { b.vanHold = !!opt.vanWait.hold; if (opt.vanWait.hold) heat = opt.cost?.heat ?? 0; }
    report = `${choice.label}.`;
  }
  record(am, { kind: 'decision', text: view.text, choice: choice.label, why, report, choiceCost: heat ? { heat } : {} });
  am.log.push({ kind: 'choice', text: choice.label });
  am.report = [...(am.report ?? []), report];
  am.pending = null;
  return state; // the drawn round is the run's next step, on the orders as changed (its dilemma will not come up again)
}
