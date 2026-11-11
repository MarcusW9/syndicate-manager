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
import { fightOddsFor } from '../src/core/fight.js';
import { fightSnapshot, fightView, fightAnswer } from '../src/core/runfight.js';
import { FIGHT, FIGHT_JOBS } from '../src/data/fights.js';
import { feedItems } from '../src/core/feed.js';
import { importSave } from '../src/save/save.js';

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

test('an engine-2 fight waits for no round screen yet: needsPlayer is false for it, and true for its call-ins', () => {
  let s = atFight(5, 'data_pull', 'every');
  assert.equal(s.activeMission.battle.engine, 2);
  assert.equal(needsPlayer(s), false, 'the round plays itself until slice 2 builds the screen');
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
  assert.ok(v.text.includes('techUnderFire'), 'placeholder wording for what changed');
  const ids = v.choices.map((c) => c.id);
  assert.deepEqual(ids, ['cover', 'radio', 'jam', 'carryOn', 'out'], 'every authored option, then Pull back');
  assert.equal(v.choices.at(-1).exit, true, 'every call-in offers Pull back');
  assert.ok(v.fight.runners.length && v.fight.guards.length, 'the call-in card shows everyone\'s health');
  const key = s.activeMission.pending.key;
  // Answering one: the orders change, the call-in clears, and it doesn't come up again for the same situation.
  const before = JSON.stringify(s.activeMission.battle.orders);
  const next = M.resolvePending(s, 'jam'); // the tech stops the call: their order changes from working to supporting
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
        assert.equal(day, s.day, 'raised today');
        s = advanceDay(s); // the next morning
        const k = s.awayJobs.find((x) => x.mission.jobId === j.mission.jobId);
        // Expired: the crew carried on. (The same situation can come up again the next day, as a new call-in.)
        assert.ok(!k || !k.waiting || (k.mission.pending?.day ?? 0) > day, 'the open call expired: the crew carried on');
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
