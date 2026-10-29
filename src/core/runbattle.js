// Fights inside a run (PLAN-CORE-LOOP.md, slice 6): starting one, playing its rounds, the call-ins
// at death's door and after the last round, pulling back, and what HP left turns into. The rules of
// a round are in core/battle.js; this is the run's side of it. Pure, on the cloned state passed in.
//
// A cycle with core/mission.js (advance, exitRun) on purpose: both are only called at run time.

import { nextRng } from './random.js';
import { setInjury, worsenInjury } from './crew.js';
import { XP } from './development.js';
import { noteInjury } from './earned.js';
import { ALERT_MAX } from './incidents.js';
import { buildBattle, playRound, partingShots, injuryFromHp, runnerOf, BATTLE } from './battle.js';
import { actors, overwatchOp, driver, standbyReady, opById, grow, record, takeWhy, addNeural } from './run.js';
import { currentStep, advance, exitRun } from './mission.js';

// --- battles (slice 6; core/battle.js) ----------------------------------------------------------

const battleSnapshot = (b) => ({
  guards: b.guards.map((g) => ({ n: g.n, hp: g.hp, max: g.max, armour: g.armour, out: g.out })),
  runners: b.runners.map((r) => ({ id: r.id, handle: r.handle, hp: r.hp, max: r.max, armour: r.armour, down: r.down, fightOn: r.fightOn, stable: r.stable })),
});
export const guardsUp = (b) => b.guards.filter((g) => !g.out).length;
export const guardCount = (n) => (n === 1 ? 'one guard' : `${n} guards`);

/** An unsaved danger incident turns into a fight: build both sides and put a battle step next in the queue. */
export function startBattle(state, am, tpl, inc, id, zone, diff, able) {
  const b = buildBattle({
    incident: id, zone, diff, threat: am.threat ?? tpl.threat, guards: inc.guards, crew: able, approach: am.approach,
    overwatchOp: overwatchOp(state, am), ow: am.overwatch, wheels: driver(state, am),
  });
  am.battle = b;
  // The alarm call waits until the fight is over.
  if (am.alert >= ALERT_MAX && !am.wentLoud) am.alertDue = true;
  const text = `It's a fight: ${guardCount(b.guards.length)}${b.guards[0].armour ? `, armour ${b.guards[0].armour}` : ''}, against ${b.runners.map((r) => r.handle).join(', ')}.`;
  record(am, { kind: 'battle', phase: 'start', from: id, zone, text, report: text, ...battleSnapshot(b) });
  am.log.push({ kind: 'bad', text });
  am.report = [...(am.report ?? []), text];
  am.queue.splice(am.step + 1, 0, { type: 'battle' });
  advance(state);
}

/**
 * Play the fight's next round. After it: every guard down means the fight is won; nobody standing
 * means the crew is dragged out (an exit: nobody dies); someone at death's door calls you in; after
 * the last round with guards still up, a call-in: push past or pull back; otherwise the orders
 * (Cautious pulls back once someone is hurt, Steady once someone is badly hurt).
 */
export function runBattle(prev) {
  const am0 = prev.activeMission;
  if (!am0?.battle || currentStep(am0)?.type !== 'battle' || am0.pending || am0.critical) return prev;
  const state = structuredClone(prev);
  const am = state.activeMission;
  const b = am.battle;
  const r = playRound(b, nextRng(state));
  if (b.overwatch && am.overwatch) {
    am.overwatch.left = b.overwatch.left;
    am.extraHeat += r.heat;
    if (r.neural) addNeural(opById(state, b.overwatch.id), r.neural);
  }
  for (const l of r.lines) if (l.actor) grow(state, am, opById(state, l.actor.id), l.stat, XP.incident);
  // Someone dying who's been stabilised is back to a serious wound, and out of danger.
  for (const x of b.runners.filter((x) => x.stable && (am.untreated ?? []).includes(x.id))) {
    am.untreated = am.untreated.filter((id) => id !== x.id);
    setInjury(opById(state, x.id), 'serious');
  }
  // A guard who ran is on the radio: the alert goes up (the call waits until the fight is over).
  if (r.fled) am.alert = Math.min(ALERT_MAX, (am.alert ?? 0) + BATTLE.fledAlert);
  const text = `Round ${b.round}: ${guardsUp(b) ? `${guardCount(guardsUp(b))} still up` : r.fled ? 'the last guard runs' : 'the last guard goes down'}.`;
  record(am, { kind: 'battle', phase: 'round', round: b.round, text, lines: r.lines, ...battleSnapshot(b) });
  am.log.push({ kind: guardsUp(b) ? 'bad' : 'good', text });
  b.door.push(...r.down);
  return afterRound(state, am);
}

/** What happens after a round (or a call-in during one). orders: false right after the player chose to keep fighting. */
function afterRound(state, am, { orders = true } = {}) {
  const b = am.battle;
  if (!guardsUp(b)) return endBattle(state, am, 'won');
  if (!b.runners.some((x) => !x.down)) {
    return retreat(state, am, { text: 'Nobody is left standing.', choice: 'The van comes in and gets them all out', why: 'Nobody was left standing, so they were all dragged out.', forced: true });
  }
  if (b.door.length) { am.pending = { kind: 'door', opId: b.door[0] }; return state; }
  if (b.round >= BATTLE.rounds) { am.pending = { kind: 'standoff' }; return state; }
  const o = orders && am.orders ? BATTLE.orders[am.orders] : null;
  const name = o && ORDER_NAMES[am.orders];
  if (o?.pullAtHurt && b.runners.some((x) => !x.down && x.hp < x.max * o.pullAtHurt)) {
    const badly = o.pullAtHurt <= BATTLE.seriousBelow;
    return retreat(state, am, { text: `Someone is ${badly ? 'badly ' : ''}hurt.`, choice: 'They pull back', why: `${name} orders: someone was ${badly ? 'badly ' : ''}hurt, so they pulled back.` });
  }
  return state;
}
const ORDER_NAMES = { cautious: 'Cautious', steady: 'Steady', committed: 'Committed' };

/** HP left becomes the injury the game tracks (never past serious from a fight); someone down is dragged out badly hurt. */
function battleInjuries(state, am, b) {
  const hurt = [];
  for (const x of b.runners) {
    const op = opById(state, x.id);
    if (!op) continue;
    if (x.down) {
      if (x.fightOn && !x.stable) continue; // still dying: the push-on rule decides (am.untreated)
      if (!x.stable) { setInjury(op, 'serious'); op.condition.injuryDays = Math.max(op.condition.injuryDays, 21); }
      noteInjury(state, op, 'serious');
      hurt.push({ id: op.id, handle: op.handle, severity: 'serious', down: true });
      if (!(am.out ?? []).includes(op.id)) am.out = [...(am.out ?? []), op.id];
      continue;
    }
    const sev = injuryFromHp(x);
    if (sev === 'none') continue;
    const injury = worsenInjury(op.condition.injury, sev) === 'critical' ? 'serious' : worsenInjury(op.condition.injury, sev);
    setInjury(op, injury);
    noteInjury(state, op, injury);
    hurt.push({ id: op.id, handle: op.handle, severity: injury });
    if (injury === 'serious' && !(am.out ?? []).includes(op.id)) am.out = [...(am.out ?? []), op.id];
  }
  return hurt;
}

const hurtLine = (hurt) => hurt.map((h) => `${h.handle} ${h.down ? 'went down' : h.severity === 'serious' ? 'is badly hurt' : 'is hurt'}`).join(', ');

/** The fight is over and the run goes on: won (every guard down or backed off) or pushed past (alert and heat up). */
function endBattle(state, am, how) {
  const b = am.battle;
  const hurt = battleInjuries(state, am, b);
  if (how === 'press') {
    am.alert = Math.min(ALERT_MAX, (am.alert ?? 0) + BATTLE.press.alert);
    am.extraHeat += BATTLE.press.heat;
  }
  const text = how === 'won' ? 'The fight is over.' : `The crew pushes past ${guardCount(guardsUp(b))} still standing. Alert +${BATTLE.press.alert}, heat +${BATTLE.press.heat}.`;
  const report = `${text}${hurt.length ? ` ${hurtLine(hurt)}.` : ' Nobody badly hurt.'}`;
  record(am, { kind: 'battle', phase: 'end', how, text, report, hurt, ...battleSnapshot(b) });
  am.log.push({ kind: hurt.length ? 'bad' : 'good', text: report });
  am.report = [...(am.report ?? []), report];
  am.battle = null;
  const serious = hurt.find((h) => h.severity === 'serious');
  if (serious) am.pending = { kind: 'injury', opId: serious.id };
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
 * Pull back from a fight: an exit, so everyone comes home (anyone left dying is saved by it). The
 * guards get a parting go at whoever's running unless the van came round (never below 1 HP); the
 * job, its pay, heat and reputation are the cost (owner's calls, 2026-10-29).
 */
function retreat(state, am, { text, choice, why, forced = false }) {
  const b = am.battle;
  const shots = partingShots(b, nextRng(state));
  const hurt = battleInjuries(state, am, b);
  am.payCut = Math.max(am.payCut, 1);
  am.extraHeat += BATTLE.retreat.heat;
  am.repCut = (am.repCut ?? 0) + BATTLE.retreat.rep;
  const ran = b.van ? `${b.wheels.handle} had the van round, so they got out clean.` : shots.some((l) => l.damage) ? 'The guards shoot after them as they run.' : 'They get out under fire, untouched.';
  record(am, { kind: 'battle', phase: 'retreat', text: ran, lines: shots, hurt, forced, ...battleSnapshot(b) });
  am.battle = null;
  const report = `The crew pulled back from the fight. ${ran}${hurt.length ? ` ${hurtLine(hurt)}.` : ''} No pay, heat +${BATTLE.retreat.heat}, reputation −${BATTLE.retreat.rep}.`;
  exitRun(state, am, { text, choice, why, report });
  return state;
}

/** The fight's call-ins: at death's door (pull back or keep fighting) and after the last round (push past or pull back). */
export function resolveBattleDecision(state, am, choice, view) {
  const b = am.battle;
  const why = takeWhy(am);
  if (choice.exit) return retreat(state, am, { text: view.text, choice: choice.label, why });
  if (choice.id === 'fight') {
    const x = b.runners.find((r) => r.id === am.pending.opId);
    const op = opById(state, x.id);
    x.fightOn = true;
    setInjury(op, 'critical');
    noteInjury(state, op, 'critical');
    am.untreated = [...(am.untreated ?? []), op.id];
    b.door = b.door.filter((id) => id !== op.id);
    const report = `The crew kept fighting with ${op.handle} down and bleeding.`;
    record(am, { kind: 'decision', push: true, text: view.text, choice: choice.label, why, report, choiceCost: {} });
    am.log.push({ kind: 'bad', text: report });
    am.report = [...(am.report ?? []), report];
    am.pending = null;
    return afterRound(state, am, { orders: false });
  }
  if (choice.id === 'rescue') {
    // Standby comes in from the van, drags them clear (badly hurt, alive) and takes their place in the fight.
    const sb = standbyReady(state, am);
    const patient = opById(state, am.pending.opId);
    am.standby.used = true;
    am.standby.joined = true;
    am.crewIds = [...am.crewIds, sb.id];
    setInjury(patient, 'serious');
    patient.condition.injuryDays = Math.max(patient.condition.injuryDays, 21);
    noteInjury(state, patient, 'serious');
    am.out = [...(am.out ?? []), patient.id];
    b.runners = [...b.runners.filter((x) => x.id !== patient.id), runnerOf(sb, am.approach)];
    b.door = b.door.filter((id) => id !== patient.id);
    const report = `${sb.handle} came in from standby, dragged ${patient.handle} clear and took their place in the fight.`;
    record(am, { kind: 'decision', standby: { id: sb.id, handle: sb.handle }, rescued: { id: patient.id, handle: patient.handle }, text: view.text, choice: choice.label, why, report, choiceCost: {} });
    am.log.push({ kind: 'good', text: report });
    am.report = [...(am.report ?? []), report];
    am.pending = null;
    return afterRound(state, am, { orders: false });
  }
  // Push past the guards still standing.
  const report = 'The crew pushed past the guards still standing.';
  record(am, { kind: 'decision', text: view.text, choice: choice.label, why, report, choiceCost: { heat: BATTLE.press.heat } });
  am.report = [...(am.report ?? []), report];
  am.pending = null;
  return endBattle(state, am, 'press');
}
