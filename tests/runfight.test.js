// Engine 2 inside a run (core/runfight.js; battle rework slice 1c): the five jobs start engine-2 fights and
// finish them, commanded and hands-off; the call-ins; the new death rule; left behind; engine 1 still plays
// everything else. The rules themselves are tests/fight.test.js. Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame } from '../src/core/state.js';
import * as M from '../src/core/mission.js';
import { addOffer, templateById } from '../src/core/jobs.js';
import { autoStep, autoRun, needsPlayer } from '../src/core/autorun.js';
import { advanceDay } from '../src/core/time.js';
import { sendOff } from '../src/core/autorun.js';
import { coverage } from '../src/core/squad.js';
import { fightOddsFor, optionAvailable } from '../src/core/fight.js';
import { DILEMMAS } from '../src/data/dilemmas.js';
import { fightSnapshot, fightView, fightAnswer, expiryAnswer } from '../src/core/runfight.js';
import { FIGHT, FIGHT_JOBS } from '../src/data/fights.js';
import { feedItems } from '../src/core/feed.js';
import { importSave } from '../src/save/save.js';
import { summariseRun } from '../src/core/report.js';
import { FIGHT_TEXT } from '../src/data/fightText.js';

globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };

const FIVE = Object.keys(FIGHT_JOBS);
const APPROACHES = ['loud', 'stealth', 'tech', 'con'];

function begin(seed, templateId, approach = 'loud', { n, opts } = {}) {
  const s = createNewGame({ seed, startCrew: 'fresh' });
  s.jobs = [];
  addOffer(s, templateId);
  return M.startMission(s, s.jobs[0].id, s.crew.slice(0, n ?? templateById(templateId).crewSize).map((o) => o.id), approach, opts);
}

/** Step the run until `stop(s)` holds or it ends. Decisions are left to the orders (force). */
function until(s, stop, limit = 400) {
  for (let g = 0; g < limit && !s.activeMission.done; g++) {
    if (stop(s)) return s;
    const next = autoStep(s, { force: true });
    if (next === s) throw new Error('stuck');
    s = next;
  }
  return s;
}
const inFight = (s) => !!s.activeMission.battle && M.currentStep(s.activeMission)?.type === 'battle';
/** A run on a loud approach, stopped at its first engine-2 fight (with the call-in rule given). */
function atFight(seed, id, callIn = 'every', orders = 'steady') {
  const s = begin(seed, id, 'loud', { opts: { callIn, orders } });
  s.activeMission.orders = orders;
  return until(s, inFight);
}

// --- the five jobs, and everything else ---------------------------------------------------------------

test('the five jobs play their fights on engine 2, hands-off, start to finish; every other job stays on engine 1', () => {
  const seen = {};
  for (const id of [...FIVE, 'exit_interview', 'low_water', 'kidnap']) {
    for (let seed = 1; seed <= 14; seed++) for (const orders of ['cautious', 'steady', 'committed']) {
      let s = begin(seed, id, APPROACHES[seed % 4], { opts: { callIn: 'never', orders } });
      s.activeMission.orders = orders;
      const engines = new Set();
      for (let g = 0; g < 400 && !s.activeMission.done; g++) {
        const next = autoStep(s, { force: true });
        assert.notEqual(next, s, `${id} seed ${seed} ${orders}: stuck`);
        s = next;
        if (s.activeMission.battle) engines.add(s.activeMission.battle.engine ?? 1);
      }
      assert.equal(s.activeMission.done, true, `${id} ${orders} seed ${seed}`);
      for (const e of engines) seen[`${id}:${e}`] = (seen[`${id}:${e}`] ?? 0) + 1;
    }
  }
  for (const id of FIVE) { assert.ok(seen[`${id}:2`] > 0, `${id} played engine-2 fights (${seen[`${id}:2`]})`); assert.equal(seen[`${id}:1`], undefined, `${id} never engine 1`); }
  for (const id of ['exit_interview', 'low_water', 'kidnap']) { assert.equal(seen[`${id}:2`], undefined, `${id} stays on engine 1`); }
  assert.ok(seen['exit_interview:1'] > 5);
});

test('an engine-2 fight shows on the feed like any fight: a note when it starts, a card a round, a note when it ends', () => {
  const s = until(atFight(3, 'warehouse', 'never'), (x) => !x.activeMission.battle && x.activeMission.fought);
  const items = feedItems(s.activeMission.events);
  const battle = items.filter((i) => i.cue?.battle);
  assert.ok(battle.length >= 3, 'start, rounds, end');
  assert.equal(battle[0].cue.battle.phase, 'start');
  assert.ok(battle.some((i) => i.cue.battle.phase === 'round' && i.cue.battle.guards.length));
  for (const i of battle) for (const g of i.cue.battle.guards ?? []) assert.ok(g.hp >= 0 && g.max > 0);
  const round = battle.find((i) => i.cue.battle.phase === 'round');
  assert.ok(round.results.length > 0, 'every line is a result');
});

test('a watched engine-2 fight waits for orders each round unless handed off; hands-off and away crews do not wait', () => {
  const s = atFight(5, 'data_pull', 'every');
  assert.equal(s.activeMission.battle.engine, 2);
  assert.equal(needsPlayer(s), true, 'a watched fight waits for the round\'s orders');
  assert.equal(autoStep(s), s, 'and autoStep leaves it for the player');
  // One round on the player's say-so, then it waits again.
  const next = M.runBattle(s, {});
  assert.ok(next.activeMission.done || next.activeMission.pending || next.activeMission.battle?.round > s.activeMission.battle.round, 'the round played');
  if (!next.activeMission.done && next.activeMission.battle && !next.activeMission.pending) assert.equal(needsPlayer(next), true, 'and the next round waits too');
  // Handed off: it plays itself.
  const off = M.handOffFight(s);
  assert.equal(off.activeMission.battle.auto, true);
  assert.equal(needsPlayer(off), false, 'Auto fight leaves the rest of it to the crew');
  // Hands-off (callIn never) and an away crew without command: unchanged, they never wait for a round.
  const hands = atFight(5, 'data_pull', 'never');
  assert.equal(needsPlayer(hands), false);
  const away = structuredClone(s);
  away.activeMission.away = { beats: 99 };
  assert.equal(needsPlayer(away), false, 'an away crew fights on its own');
  away.activeMission.away.command = true;
  assert.equal(needsPlayer(away), true, 'unless you have taken command');
  assert.equal(fightView(s.activeMission.battle).guards.length, s.activeMission.battle.enemies.length);
  assert.equal(fightView({ engine: 1, guards: [1] }).guards.length, 1, 'engine 1 is returned as it is');
});

// --- the death rule -----------------------------------------------------------------------------------

test('the new death rule: no death on cautious or steady without a push on; on committed a death follows the fight (the risk the player accepted)', () => {
  let died = 0; let fights = 0;
  for (const id of FIVE) for (let seed = 1; seed <= 90; seed++) for (const orders of ['cautious', 'steady', 'committed']) {
    const s = begin(seed, id, 'loud', { n: 1 + (seed % 3), opts: { callIn: 'never', orders } });
    s.activeMission.orders = orders;
    const done = autoRun(s, orders);
    const am = done.activeMission;
    if (am.events.some((e) => e.kind === 'battle')) fights += 1;
    if (orders !== 'committed') assert.deepEqual(am.result.deaths, [], `${id} ${orders} seed ${seed}: no death without committed or a push on`);
    else for (const d of am.result.deaths) { died += 1; assert.ok(am.events.some((e) => e.kind === 'battle'), `${id} seed ${seed}: a death follows a fight`); }
  }
  assert.ok(fights > 200, `${fights} fights`);
  assert.ok(died > 0, 'committed can cost a life');
});

test('the shown chance of a death is the played one: the planning read\'s dead share is the share of the same fights that kill', () => {
  const crew = createNewGame({ seed: 12, startCrew: 'fresh' }).crew.slice(0, 4);
  const args = { type: 'holdExtract', diff: 14, threat: 4, site: 'docks', crew, approach: 'loud', risk: 'committed' };
  const a = fightOddsFor(args);
  assert.deepEqual(fightOddsFor(args), a, 'the same read twice');
  assert.ok(a.dead >= 0 && a.dead < 0.5);
  const cautious = fightOddsFor({ ...args, risk: 'cautious' });
  assert.equal(cautious.dead, 0, 'cautious shows no chance of a death');
  assert.equal(fightOddsFor({ ...args, risk: 'steady' }).dead, 0);
});

test('the planning read quotes the five jobs from engine 2, and every other job from engine 1', () => {
  const s = createNewGame({ seed: 4, startCrew: 'fresh' });
  const crew = s.crew.slice(0, 4);
  for (const [id, engine2] of [['warehouse', true], ['exit_interview', false]]) {
    const tpl = templateById(id);
    const read = coverage(tpl, crew, 'loud', { threat: tpl.threat });
    const fights = read.rows.filter((r) => r.fight);
    assert.ok(fights.length, id);
    for (const r of fights) {
      assert.ok(r.fight.win >= 0 && r.fight.win <= 1);
      if (engine2) assert.equal(r.fight.standoff, 0, 'no standoff on engine 2');
    }
  }
});

// --- call-ins -----------------------------------------------------------------------------------------

/** The first run (over seeds) that raises this kind of call-in, stopped at it. */
function findCall(id, kind, { from = 1, to = 200, callIn = 'every', orders = 'steady', filter = () => true } = {}) {
  for (let seed = from; seed <= to; seed++) {
    let s = begin(seed, id, 'loud', { opts: { callIn, orders } });
    s.activeMission.orders = orders;
    s = until(s, (x) => x.activeMission.pending?.kind === kind && filter(x));
    if (s.activeMission.pending?.kind === kind && filter(s)) return s;
  }
  return null;
}

test('a dilemma call-in: what changed, the options, Pull back; carry on plays the round, pull back exits at the usual cost', () => {
  const s = findCall('data_pull', 'dilemma', { orders: 'steady' });
  assert.ok(s, 'techUnderFire comes up in some fight');
  const v = M.describePending(s);
  assert.equal(v.kind, 'dilemma');
  assert.ok(v.text.includes('under fire'), 'the wording for what changed');
  assert.ok(v.choices.filter((c) => !c.exit && c.id !== 'carryOn').every((c) => c.tradeoff), 'every option that changes something says what it does');
  const ids = v.choices.map((c) => c.id);
  const jamOffered = optionAvailable(s.activeMission.battle, DILEMMAS.techUnderFire.options.find((o) => o.id === 'jam'));
  assert.deepEqual(ids, ['cover', 'radio', ...(jamOffered ? ['jam'] : []), 'carryOn', 'out'], 'every option that can work, then Pull back');
  assert.equal(v.choices.at(-1).exit, true, 'every call-in offers Pull back');
  assert.equal(v.choices.at(-1).cost, `No pay. Heat +${FIGHT.retreat.heat}, reputation −${FIGHT.retreat.rep}.`, 'Pull back shows its real cost');
  assert.ok(!v.choices.some((c) => /\[\w+\]/.test(`${c.label}${c.cost}${c.tradeoff}`)), 'no placeholder tags in a call-in');
  assert.ok(v.fight.runners.length && v.fight.guards.length, 'the call-in card shows everyone\'s health');
  const key = s.activeMission.pending.key;
  // Answering one: the orders change, the call-in clears, and it doesn't come up again for the same situation.
  const before = JSON.stringify(s.activeMission.battle.orders);
  const next = M.resolvePending(s, ids.includes('jam') ? 'jam' : 'cover'); // the tech stops the call (their order changes from working to supporting), or the crew covers them
  assert.equal(next.activeMission.pending, null);
  assert.notEqual(JSON.stringify(next.activeMission.battle.orders), before, 'the orders changed');
  assert.equal(next.activeMission.battle.dilemmasFired[key], true);
  const after = autoStep(next, { force: true });
  assert.notEqual(after.activeMission.pending?.key, key, 'once per situation');
  // Pull back: an exit with its costs, and everyone comes home.
  const out = M.resolvePending(s, 'out');
  assert.equal(out.activeMission.aborted, true);
  assert.equal(out.activeMission.battle, null);
  assert.deepEqual(out.activeMission.result.deaths, []);
  assert.ok(out.activeMission.repCut >= FIGHT.retreat.rep && out.activeMission.extraHeat >= FIGHT.retreat.heat);
});

test('an answer is revalidated: if the situation no longer holds, it is discarded and the crew carries on', () => {
  const s = findCall('data_pull', 'dilemma', { orders: 'steady' });
  const b = s.activeMission.battle;
  const prot = b.runners.find((r) => r.id === b.goal.protect);
  // Make the situation pass: the tech is back at full pips and nothing is shot at them or called in.
  prot.pips = prot.max;
  b.threats = b.threats.filter((t) => t.target !== prot.id && !['backup', 'alarm'].includes(t.kind));
  const before = JSON.stringify(b.orders);
  const next = M.resolvePending(s, 'cover');
  assert.equal(JSON.stringify(next.activeMission.battle.orders), before, 'the stale answer changed nothing');
  assert.equal(next.activeMission.pending, null);
});

test('hands-off, the risk level answers the van that cannot wait: cautious and steady hold it for someone down, committed goes on time', () => {
  const s = atFight(2, 'warehouse', 'never');
  const am = s.activeMission;
  const b = am.battle;
  am.pending = { kind: 'dilemma', id: 'vanCantWait', key: 'x', slots: {} };
  const down = b.runners[0]; down.down = true; down.aboard = false;
  for (const [level, id] of [['cautious', 'hold'], ['steady', 'hold'], ['committed', 'goNow']]) { b.risk.level = level; assert.equal(fightAnswer(am).id, id, level); }
  down.down = false;
  b.risk.level = 'cautious';
  assert.equal(fightAnswer(am).id, 'goNow', 'nobody down outside: it goes on time');
  am.pending.id = 'techUnderFire';
  assert.equal(fightAnswer(am).id, 'carryOn');
});

test('death\'s door: a watched crew is asked (pull back or keep fighting; no standby rescue); a hands-off crew pulls back on its own', () => {
  const s = findCall('warehouse', 'door', { orders: 'steady', to: 400 });
  assert.ok(s, 'someone goes down in some fight');
  const v = M.describePending(s);
  assert.equal(v.kind, 'door');
  assert.deepEqual(v.choices.map((c) => c.id), ['out', 'fight'], 'no standby rescue: standby rides with the van');
  assert.ok(v.choices.find((c) => c.id === 'fight').push);
  const id = s.activeMission.pending.opId;
  const pushed = M.resolvePending(s, 'fight');
  assert.equal(pushed.activeMission.battle.runners.find((r) => r.id === id).fightOn, true);
  assert.ok(pushed.activeMission.untreated.includes(id), 'the push-on rule: they could die');
  assert.equal(pushed.activeMission.pending, null);
  const out = M.resolvePending(s, 'out');
  assert.equal(out.activeMission.aborted, true);
  assert.deepEqual(out.activeMission.result.deaths, [], 'an exit saves everyone');
  // The same fights hands-off never ask.
  for (let seed = 1; seed <= 40; seed++) {
    const h = begin(seed, 'warehouse', 'loud', { opts: { callIn: 'never', orders: 'steady' } });
    h.activeMission.orders = 'steady';
    const done = autoRun(h, 'steady');
    assert.deepEqual(done.activeMission.result.deaths, []);
  }
});

test('commanded: Take Command changes the risk and a runner\'s orders at the round boundary; pulling back is always there', () => {
  let s = atFight(7, 'warehouse', 'never');
  const b0 = s.activeMission.battle;
  const who = b0.runners[0].id;
  const next = M.runBattle(s, { risk: 'committed', orders: { [who]: { duty: 'hold', target: null, fallback: null } } });
  assert.equal(next.activeMission.battle?.risk.level ?? 'committed', 'committed');
  if (next.activeMission.battle) assert.equal(next.activeMission.battle.orders[who].duty, 'hold');
  const back = M.pullBack(s);
  assert.equal(back.activeMission.aborted, true);
  assert.equal(back.activeMission.battle, null);
  assert.deepEqual(back.activeMission.result.deaths, [], 'pulling back brings everyone home');
});

// --- what a fight writes back -------------------------------------------------------------------------

test('pips left become the injury at the fight\'s end, and the fight\'s snapshot is the feed\'s', () => {
  let hurt = 0;
  for (let seed = 1; seed <= 60; seed++) {
    const s = begin(seed, 'protection', 'loud', { opts: { callIn: 'never', orders: 'committed' } });
    s.activeMission.orders = 'committed';
    const done = autoRun(s, 'committed');
    for (const e of done.activeMission.events.filter((x) => x.kind === 'battle' && x.phase === 'end')) for (const h of e.hurt) { hurt += 1; assert.ok(['light', 'serious', 'dead', 'missing'].includes(h.severity)); }
  }
  assert.ok(hurt > 5, `${hurt} hurt in 60 fights`);
  const s = atFight(1, 'quiet_hours', 'never');
  const snap = fightSnapshot(s.activeMission.battle);
  assert.deepEqual(Object.keys(snap.runners[0]).sort(), ['down', 'handle', 'hp', 'id', 'max']);
});

test('left behind: missing for a week, back badly hurt (slice 1; the rescue and the ransom are slice 4)', () => {
  let s = atFight(9, 'warehouse', 'never', 'committed');
  const am = s.activeMission;
  const b = am.battle;
  // The van is in its last round with one runner down outside and the rest in the van: it goes without them.
  b.stage = 1; b.goal.vanLeaves = b.round + 1; b.round += 1; b.drawn = false;
  b.risk.level = 'steady';
  b.enemies.forEach((e) => { e.out = true; });
  const [a, ...rest] = b.runners;
  a.down = true; a.pips = 0; a.downRound = b.round; a.stable = true;
  for (const r of rest) r.aboard = true;
  const day = s.day;
  const done = autoRun(s, 'steady');
  const op = done.crew.find((o) => o.id === a.id);
  if (done.memorial.some((m) => m.id === a.id)) return; // a left-behind death is the committed risk; on steady it is missing
  assert.ok(op, 'still on the books');
  assert.equal(op.condition.missing.until, day + FIGHT.missingDays);
  assert.equal(op.condition.awayUntil, day + FIGHT.missingDays, 'away for a week');
  assert.equal(op.condition.injury, 'serious', 'and back badly hurt');
});

test('the missing week is counted from the day the job finishes, however long the job ran', () => {
  const s = atFight(9, 'warehouse', 'never', 'committed');
  const am = s.activeMission;
  const b = am.battle;
  b.stage = 1; b.goal.vanLeaves = b.round + 1; b.round += 1; b.drawn = false; b.risk.level = 'steady';
  b.enemies.forEach((e) => { e.out = true; });
  const [a, ...rest] = b.runners;
  a.down = true; a.pips = 0; a.downRound = b.round; a.stable = true;
  for (const r of rest) r.aboard = true;
  s.day += 1; // the job runs on: it finishes a day after the fight
  const finishDay = s.day;
  const done = autoRun(s, 'steady');
  const op = done.crew.find((o) => o.id === a.id);
  assert.equal(op.condition.missing.until, finishDay + FIGHT.missingDays);
  assert.equal(op.condition.awayUntil, finishDay + FIGHT.missingDays, 'a full week missing');
  assert.equal(op.condition.injuryDays, FIGHT.missingDays + 14);
});

test('an engine-2 death reaches the memorial through finish()', () => {
  let found = false;
  for (let seed = 1; seed <= 400 && !found; seed++) {
    const s = begin(seed, 'warehouse', 'loud', { n: 2, opts: { callIn: 'never', orders: 'committed' } });
    s.activeMission.orders = 'committed';
    const done = autoRun(s, 'committed');
    if (done.activeMission.result.deaths.length) {
      found = true;
      const handle = done.activeMission.result.deaths[0];
      assert.ok(done.memorial.some((m) => m.handle === handle), 'in the memorial');
      assert.ok(!done.crew.some((o) => o.handle === handle), 'off the crew');
    }
  }
  assert.ok(found, 'a committed crew sometimes loses someone');
});

// --- away jobs ----------------------------------------------------------------------------------------

test('an away job\'s dilemma call-in is open until the end of the day it came in; then the crew carries on', () => {
  let tried = 0;
  for (let seed = 1; seed <= 120; seed++) {
    let s = createNewGame({ seed, startCrew: 'fresh' });
    s.jobs = [];
    addOffer(s, 'data_pull');
    const crew = s.crew.slice(0, 3).map((o) => o.id);
    s = sendOff(s, s.jobs[0].id, crew, 'loud', 'steady', { callIn: 'every' });
    for (let d = 0; d < 4 && s.awayJobs.length; d++) {
      s = advanceDay(s);
      const j = s.awayJobs[0];
      if (j?.waiting && j.mission.pending?.kind === 'dilemma') {
        tried += 1;
        const day = j.mission.pending.day;
        const was = j.mission.pending;
        assert.equal(day, s.day, 'raised today');
        s = advanceDay(s); // the next morning
        const k = s.awayJobs.find((x) => x.mission.jobId === j.mission.jobId);
        // Expired: the crew carried on. (The same situation can come up again the next day, as a new call-in.)
        // (What comes next may be a different call-in, such as someone hurt, which carries no day.)
        assert.ok(!k || !k.waiting || !k.mission.pending || k.mission.pending.key !== was.key || (k.mission.pending.day ?? 0) > day, 'the open call expired: the crew carried on');
        break;
      }
    }
    if (tried >= 2) break;
  }
  assert.ok(tried >= 1, 'saw a call-in on an away job');
});

// --- compatibility ------------------------------------------------------------------------------------

test('an engine-1 fight in progress (a v60 save tagged engine 1) finishes on the old code', async () => {
  let s = begin(3, 'exit_interview', 'loud', { opts: { callIn: 'never', orders: 'steady' } });
  s = until(s, inFight);
  assert.ok(s.activeMission.battle.guards, 'an engine-1 fight');
  s.activeMission.battle.engine = 1;
  s.version = 60;
  const loaded = await importSave({ text: async () => JSON.stringify(s) });
  const done = autoRun(loaded, 'steady');
  assert.equal(done.activeMission.done, true);
  assert.ok(done.activeMission.events.some((e) => e.kind === 'battle' && e.phase === 'round' && e.lines.some((l) => l.kind === 'guard' || l.kind === 'shoot')));
});

// --- review fixes (PR 129) ----------------------------------------------------------------------------------

test('a pushed-on runner a medic stabilises is no longer untreated (engine 1\'s rule), so they cannot die at finish()', () => {
  const s = findCall('warehouse', 'door', { orders: 'steady', to: 400 });
  assert.ok(s);
  const id = s.activeMission.pending.opId;
  const pushed = M.resolvePending(s, 'fight');
  assert.ok(pushed.activeMission.untreated.includes(id));
  pushed.activeMission.battle.runners.find((r) => r.id === id).stable = true; // the medic got to them
  const next = M.runBattle(pushed);
  assert.ok(!next.activeMission.untreated.includes(id), 'out of the untreated list');
  assert.equal(next.crew.find((o) => o.id === id).condition.injury, 'serious');
});

test('someone who died in the fight is not also rolled for as untreated: one death, one memorial entry, no "pulls through"', () => {
  const s = atFight(4, 'warehouse', 'never');
  const am = s.activeMission;
  const x = am.battle.runners[0];
  x.dead = true; x.fightOn = true;
  am.fightDead = [x.id]; am.untreated = [x.id];
  const out = M.pullBack(s);
  assert.equal(out.activeMission.result.deaths.length, 1);
  assert.equal(out.memorial.filter((m) => m.id === x.id).length, 1, 'one memorial entry');
  assert.ok(!out.activeMission.log.some((l) => /pulls through/.test(l.text)), 'the dead do not pull through');
});

test('engine 2\'s pull-back cost says what it does: no parting shots', async () => {
  const { decisionChoices } = await import('../src/core/incidents.js');
  const text = (engine2) => decisionChoices({ kind: 'door' }, { patient: { handle: 'Vex' }, engine2 }).find((c) => c.exit).cost;
  assert.match(text(true), /No parting shots/);
  assert.doesNotMatch(text(true), /guards get a parting shot/);
  assert.match(text(false), /parting shot/);
});

// --- the approved call-in changes (owner, 2026-11-11) ---------------------------------------------------------------------

const radioShown = (x) => x.activeMission.battle.threats.some((t) => ['backup', 'alarm'].includes(t.kind) && !t.cancelled);

test('the jam is a choice only when a radio call is shown and the tech can jam; the other options are always there', () => {
  let withCall = 0; let without = 0;
  for (const wantCall of [true, false]) {
    const s = findCall('data_pull', 'dilemma', { orders: 'steady', to: 400, filter: (x) => x.activeMission.pending.id === 'techUnderFire' && radioShown(x) === wantCall });
    if (!s) continue;
    const ids = M.describePending(s).choices.map((c) => c.id);
    const tech = s.activeMission.battle.runners.find((r) => r.id === s.activeMission.battle.goal.protect);
    assert.equal(ids.includes('jam'), wantCall && tech.jammer, `call shown ${wantCall}, tech can jam ${tech.jammer}`);
    for (const id of ['cover', 'radio', 'carryOn', 'out']) assert.ok(ids.includes(id), id);
    if (wantCall) withCall += 1; else without += 1;
  }
  assert.ok(withCall + without >= 1, 'saw at least one call-in');
  // A stale answer to an option that is not offered is discarded, as any answer that no longer holds.
  const s = findCall('data_pull', 'dilemma', { orders: 'steady', to: 400, filter: (x) => x.activeMission.pending.id === 'techUnderFire' });
  const b = s.activeMission.battle;
  b.runners.find((r) => r.id === b.goal.protect).jammer = false;
  const before = JSON.stringify(b.orders);
  assert.equal(JSON.stringify(M.resolvePending(s, 'jam').activeMission.battle.orders), before, 'jam is not a choice for a tech who cannot jam');
});

test('a call-in answer lasts one round in a real run: the crew\'s orders come back after the next round', () => {
  const s = findCall('data_pull', 'dilemma', { orders: 'steady', to: 400, filter: (x) => x.activeMission.pending.id === 'techUnderFire' });
  assert.ok(s);
  const before = JSON.stringify(s.activeMission.battle.orders);
  // The first answer that changes anything for this crew (the default orders may already be the cover).
  const answered = ['cover', 'radio', 'jam'].map((id) => M.resolvePending(s, id)).find((x) => JSON.stringify(x.activeMission.battle.orders) !== before);
  assert.ok(answered, 'some answer changes the orders for the round');
  let played = M.runBattle(answered, {});
  // A runner reaching their pull-out point asks first (a call-in of its own): let them pull out, as the risk level says, and play the round.
  while (played.activeMission.pending?.id === 'pullOutPoint') played = M.runBattle(M.resolvePending(played, 'pullOut'), {});
  const b = played.activeMission.battle;
  if (b) assert.equal(JSON.stringify(b.orders), before, 'back to the crew\'s plan once the round is played');
});

test('a player\'s orders given at the boundary after a call-in stand', () => {
  const s = findCall('data_pull', 'dilemma', { orders: 'steady', to: 400, filter: (x) => x.activeMission.pending.id === 'techUnderFire' });
  const answered = M.resolvePending(s, 'cover');
  const b0 = answered.activeMission.battle;
  const mate = b0.runners.find((r) => r.id !== b0.goal.protect);
  const played = M.runBattle(answered, { orders: { [mate.id]: { duty: 'hold', target: null } } });
  const b = played.activeMission.battle;
  if (b) assert.equal(b.orders[mate.id].duty, 'hold');
});

test('the van call-in is leave on time or hold; an away crew whose call-in runs out leaves on time', () => {
  const s = atFight(2, 'warehouse', 'every');
  const am = s.activeMission;
  am.pending = { kind: 'dilemma', id: 'vanCantWait', key: 'x', day: s.day, slots: { outside: 'Jax', n: 1 } };
  const v = M.describePending(s);
  assert.deepEqual(v.choices.map((c) => c.id), ['goNow', 'hold', 'out']);
  assert.equal(v.choices.find((c) => c.id === 'hold').cost, `Heat +${FIGHT.holdHeat}`);
  assert.equal(v.choices.find((c) => c.id === 'goNow').cost, '');
  assert.ok(!v.choices.find((c) => c.id === 'hold').tradeoff.includes('Heat'), 'the heat is not printed twice');
  assert.equal(expiryAnswer(am.pending), 'goNow');
  assert.equal(expiryAnswer({ id: 'techUnderFire' }), 'carryOn');
});

test('the report of an engine-2 fight has one cause line (past tense) and the feed lines unchanged in its log', () => {
  // Each end line as a pattern: its template with the slots as wildcards.
  const ends = Object.entries(FIGHT_TEXT).filter(([k]) => k.startsWith('end.')).map(([, t]) => new RegExp(`^${t.replace(/[.*+?^$()|[\]\\]/g, '\\$&').replace(/\{\w+\}/g, '.+')}$`));
  let withCause = 0;
  for (let seed = 1; seed <= 40; seed++) for (const id of FIVE) {
    const done = autoRun(begin(seed, id, 'loud', { opts: { callIn: 'never', orders: seed % 2 ? 'committed' : 'steady' } }), seed % 2 ? 'committed' : 'steady');
    const am = done.activeMission;
    const fights = am.events.filter((e) => e.kind === 'battle');
    if (!fights.length) continue;
    const sum = summariseRun(am.events, { outcome: am.aborted ? 'aborted' : 'completed' });
    assert.ok(sum.cause, `${id} seed ${seed}: a cause line`);
    assert.ok(!/^\[/.test(sum.cause) && /[.]$/.test(sum.cause), `${id}: reads as a sentence: ${sum.cause}`);
    assert.ok(ends.some((re) => re.test(sum.cause)), `${sum.cause} is one of the end lines`);
    for (const e of fights.filter((x) => x.phase === 'round')) for (const l of e.lines) assert.ok(l.text && !/^\[/.test(l.text), 'the log carries the feed line as it was shown');
    withCause += 1;
  }
  assert.ok(withCause > 50, `${withCause} fights checked`);
  assert.equal(summariseRun([{ kind: 'beat', text: 'x' }], { outcome: 'completed' }).cause, null, 'no fight, no cause line');
});

// --- the pull-out call (owner, 2026-11-12) -----------------------------------------------------------

test('the pull-out call in a real run: who is at their point, pull out or keep them in, Pull back; hands-off crews pull out', () => {
  const s = findCall('data_pull', 'dilemma', { orders: 'steady', to: 400, filter: (x) => x.activeMission.pending.id === 'pullOutPoint' });
  assert.ok(s, 'a runner reaches their pull-out point in some fight');
  const am = s.activeMission;
  const v = M.describePending(s);
  assert.deepEqual(v.choices.map((c) => c.id), ['pullOut', 'stayIn', 'out']);
  assert.match(v.text, /steady crew pulls out/);
  assert.ok(v.choices.filter((c) => c.id !== 'out').every((c) => c.tradeoff), 'each option says what it does');
  const who = am.pending.subjects;
  assert.ok(who.length >= 1 && who.every((id) => am.battle.runners.find((r) => r.id === id).pips <= Math.max(1, Math.ceil(am.battle.runners.find((r) => r.id === id).max / 3))), 'only runners at their point');
  assert.equal(fightAnswer(am).id, 'pullOut', 'the standing orders (risk level) pull out');
  assert.equal(expiryAnswer(am.pending), 'pullOut');
  // Keep them in: they are still in the next round; they have a stay mark at their pips.
  const kept = M.resolvePending(s, 'stayIn');
  for (const id of who) assert.equal(kept.activeMission.battle.runners.find((r) => r.id === id).stayPips, am.battle.runners.find((r) => r.id === id).pips);
  const played = M.runBattle(kept, {});
  const b = played.activeMission.battle;
  if (b && !played.activeMission.pending) for (const id of who) assert.equal(b.runners.find((r) => r.id === id).withdrawn, false, 'kept in, so they did not pull out');
  // Pull out: the risk level acts, as for a hands-off crew.
  const out = M.runBattle(M.resolvePending(s, 'pullOut'), {});
  const b2 = out.activeMission.battle;
  if (b2 && !out.activeMission.pending) assert.ok(who.some((id) => b2.runners.find((r) => r.id === id).withdrawn) || out.activeMission.done, 'they pulled out');
});

test('a hands-off crew is never asked about the pull-out point: the risk level answers, and the fights still end', () => {
  for (let seed = 1; seed <= 30; seed++) {
    let s = begin(seed, 'data_pull', 'loud', { opts: { callIn: 'never', orders: 'steady' } });
    s.activeMission.orders = 'steady';
    s = autoRun(s, 'steady');
    assert.ok(s.activeMission?.done ?? true, `seed ${seed}: the run finished without waiting on a call`);
  }
});

test('the feed carries the stat on a fight roll and the odds of a shot, so the dice detail can say what was rolled', () => {
  let rolled = 0; let shots = 0;
  for (let seed = 1; seed <= 10; seed++) {
    const s = autoRun(begin(seed, 'data_pull', 'loud', { opts: { callIn: 'never', orders: 'steady' } }), 'steady');
    for (const it of feedItems(s.activeMission.events).filter((x) => x.type === 'card' && x.kind === 'battle')) for (const r of it.results) {
      if (r.roll?.die != null) { rolled += 1; assert.ok(r.roll.stat, 'a rolled line names its stat'); }
      if (r.roll?.chance != null) { shots += 1; assert.equal(r.roll.stat, 'cool'); }
    }
  }
  assert.ok(rolled > 0 && shots > 0, `saw ${rolled} rolls and ${shots} shots`);
});
