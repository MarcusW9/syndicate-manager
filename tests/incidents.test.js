// The squad run (PLAN-CORE-LOOP.md, slice 1): incidents, saves, alert, decisions, overwatch, the four
// approaches and the call-in rule. Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame, SAVE_VERSION } from '../src/core/state.js';
import * as M from '../src/core/mission.js';
import { addOffer, templateById } from '../src/core/jobs.js';
import { crewRoll } from '../src/core/crew.js';
import { autoStep, autoRun, needsPlayer, sendOff } from '../src/core/autorun.js';
import { planIncidents, weaveIncidents, bestSave, incidentDifficulty, incidentById, OVERWATCH_KIT, ALERT_MAX } from '../src/core/incidents.js';
import { APPROACHES } from '../src/data/approaches.js';
import { INCIDENTS, ZONE_POOLS } from '../src/data/incidents.js';
import { SITUATIONS } from '../src/data/situations.js';
import { MISSIONS } from '../src/data/missions.js';
import { makeRng } from '../src/core/rng.js';
import { playMission, toCrisis, randomPolicy, carefulPolicy, arm } from './play.js';

globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
const { importSave } = await import('../src/save/save.js');

const APPROACH_IDS = Object.keys(APPROACHES);

/** A fresh rookie game with one offer of this job; start it with the first n people. */
function begin(seed, templateId, approach = 'stealth', { n, opts } = {}) {
  let s = createNewGame({ seed, startCrew: 'fresh' });
  s.jobs = [];
  addOffer(s, templateId);
  const size = n ?? templateById(templateId).crewSize;
  return M.startMission(s, s.jobs[0].id, s.crew.slice(0, size).map((o) => o.id), approach, opts);
}

// --- data -----------------------------------------------------------------------------

test('the four approaches: stealth, tech, loud, con, each +1 to one stat and one cost', () => {
  assert.deepEqual(APPROACH_IDS, ['stealth', 'tech', 'loud', 'con']);
  for (const [id, a] of Object.entries(APPROACHES)) {
    assert.equal(Object.keys(a.mods).length, 1, `${id}: one stat`);
    for (const sit of [...a.favours, ...a.avoids]) assert.ok(SITUATIONS[sit], `${id}: ${sit} is a known situation`);
    const costs = [a.days > 0, a.heat > 0, a.bribePerThreat > 0, a.neural > 0].filter(Boolean).length;
    assert.equal(costs, 1, `${id}: exactly one cost`);
  }
});

test('every incident is well-formed and small: known situations, slots filled, never past a serious injury', () => {
  for (const [id, inc] of Object.entries(INCIDENTS)) {
    for (const sit of inc.situations) assert.ok(SITUATIONS[sit], `${id}: ${sit}`);
    for (const k of ['name', 'text', 'ok', 'bad', 'hOk', 'hBad']) assert.ok(inc[k], `${id}.${k}`);
    if (inc.danger) assert.ok(inc.comp, `${id}: a danger incident says how they're in trouble`);
    if (inc.fail.injury) assert.ok(inc.danger, `${id}: only danger incidents hurt anyone`);
    assert.ok(inc.fail.alert >= 1, `${id}: a failure raises the alert`);
  }
  for (const zone of Object.values(ZONE_POOLS)) for (const a of APPROACH_IDS) for (const id of zone[a]) assert.ok(INCIDENTS[id], `${a}: ${id}`);
});

test('incidents go in after the first beat, inside after the middle beat, and the target before the last', () => {
  for (let seed = 1; seed <= 30; seed++) {
    const s = begin(seed, 'container409');
    const q = s.activeMission.queue;
    assert.equal(q[0].type, 'beat');
    assert.deepEqual(q[1], { type: 'zone', zone: 'in' });
    assert.equal(q.at(-1).type, 'beat', 'the last beat still ends the job');
    assert.deepEqual(q.at(-2), { type: 'zone', zone: 'out' });
    const zones = q.filter((x) => x.type === 'zone').map((x) => x.zone);
    assert.deepEqual(zones, ['in', 'inside', 'target', 'out']);
    assert.equal(q.filter((x) => x.type === 'crisis').length >= 2, true, 'the crises are all still there');
  }
  const rng = makeRng(5);
  assert.equal(planIncidents(rng, 'stealth', 1).find((z) => z.zone === 'inside').ids.length, 1);
  assert.equal(planIncidents(rng, 'stealth', 3).find((z) => z.zone === 'inside').ids.length, 2, 'bigger work, more inside');
});

// --- the death rule and exits -------------------------------------------------------------

test('an incident never kills and never makes anyone critical (3,000 runs, every approach)', () => {
  const rookieJobs = MISSIONS.filter((m) => m.rookie).map((m) => m.id);
  for (let seed = 1; seed <= 3000; seed++) {
    const approach = APPROACH_IDS[seed % 4];
    let s = begin(seed, seed % 3 ? rookieJobs[seed % rookieJobs.length] : 'warehouse', approach, { n: 1 + (seed % 3) });
    const policy = { ...randomPolicy(seed), critical: (o) => (o.includes('extract') ? 'extract' : o[0]) };
    const { state } = playMission(s, policy);
    const am = state.activeMission;
    assert.deepEqual(am.result.deaths, [], `seed ${seed}`);
    for (const e of am.events.filter((x) => x.incident)) assert.notEqual(e.injury?.severity, 'critical', `seed ${seed}: ${e.incident}`);
  }
});

test('every decision a run stops for has an exit, and taking it brings everyone home', () => {
  // Slice 6: an unsaved danger incident is a fight now, so the hurt call-ins are mostly a fight's
  // (death's door, guards still standing) and a serious wound after one.
  let seen = { alert: 0, injury: 0, door: 0, standoff: 0 };
  const hurt = () => seen.injury + seen.door + seen.standoff;
  for (let seed = 1; seed <= 600 && (seen.alert < 5 || hurt() < 5); seed++) {
    // Two inside on some runs: someone alone who goes down in a fight is dragged out without a call.
    let s = begin(seed, 'warehouse', APPROACH_IDS[seed % 4], { n: 1 + (seed % 2) });
    for (let g = 0; g < 160 && !s.activeMission.done && !s.activeMission.pending; g++) {
      const next = autoStep(s, { force: true });
      if (next === s) break;
      s = next;
      if (s.activeMission.critical) break;
    }
    const am = s.activeMission;
    if (!am.pending) continue;
    seen[am.pending.kind] += 1;
    const view = M.describePending(s);
    const exit = view.choices.find((c) => c.exit);
    assert.ok(exit, `${am.pending.kind}: has an exit`);
    const out = M.resolvePending(s, exit.id);
    assert.equal(out.activeMission.done, true);
    assert.equal(out.activeMission.aborted, true);
    assert.deepEqual(out.activeMission.result.deaths, []);
  }
  assert.ok(seen.alert >= 5 && hurt() >= 5, `saw ${JSON.stringify(seen)}`);
});

test('a hands-off crew decides every decision and still never loses anyone', () => {
  for (let seed = 1; seed <= 200; seed++) {
    const s = begin(seed, 'warehouse', APPROACH_IDS[seed % 4], { n: 1 + (seed % 2) });
    const done = autoRun(s, ['cautious', 'steady', 'committed'][seed % 3]);
    assert.deepEqual(done.activeMission.result.deaths, []);
    for (const e of done.activeMission.events.filter((x) => x.kind === 'decision' || x.kind === 'exit')) assert.ok(e.why || e.kind === 'exit', `seed ${seed}: ${e.choice} says why`);
  }
});

// --- shown risk equals used risk -------------------------------------------------------------

test('an incident roll is the shared crew rule: die + the recorded value against the recorded need decides it', () => {
  let checked = 0;
  for (let seed = 1; seed <= 200; seed++) {
    const { state } = playMission(begin(seed, 'container409', APPROACH_IDS[seed % 4]), carefulPolicy);
    for (const e of state.activeMission.events.filter((x) => x.incident)) {
      assert.equal(e.die + e.value >= e.need, e.success, `seed ${seed}: ${e.incident}`);
      assert.ok(e.why, 'says who handled it and why');
      checked += 1;
    }
  }
  assert.ok(checked > 500, `checked ${checked}`);
});

test('the alert makes every later roll harder and says so: incidents and crises alike', () => {
  const s = begin(7, 'container409', 'stealth');
  const am = s.activeMission;
  const tpl = templateById(am.templateId);
  const inc = incidentById('lock');
  const calm = incidentDifficulty(tpl, am, inc);
  assert.equal(incidentDifficulty(tpl, { ...am, alert: 2 }, inc), calm + 2);
  // A crisis read under alert names it.
  let t = toCrisis(s);
  if (t.activeMission.done) return;
  t = structuredClone(t);
  t.activeMission.alert = 2;
  const reason = M.describeCrisis(t).choices.find((c) => c.riskReason && c.risk !== 'safe' && c.risk !== 'certain')?.riskReason;
  if (reason) assert.match(reason, /alert \+2 difficulty/);
});

test('extra bodies on stealth and con runs: −1 a head on stealth and social past the recommended size', () => {
  const s = createNewGame({ seed: 3, startCrew: 'fresh' });
  const four = s.crew.slice(0, 4);
  const two = s.crew.slice(0, 2);
  const stealth4 = crewRoll(four, 'stealth', { approach: 'stealth', recommended: 2 });
  const stealth2 = crewRoll(two, 'stealth', { approach: 'stealth', recommended: 2 });
  assert.ok(stealth4.notes.some((n) => /4 inside −2/.test(n)), stealth4.notes.join(', '));
  assert.ok(!stealth2.notes.some((n) => /inside/.test(n)));
  assert.ok(!crewRoll(four, 'stealth', { approach: 'loud', recommended: 2 }).notes.some((n) => /inside/.test(n)), 'loud runs don\'t care');
  assert.ok(!crewRoll(four, 'combat', { approach: 'stealth', recommended: 2 }).notes.some((n) => /inside/.test(n)), 'only stealth and social');
  assert.ok(crewRoll(four, 'social', { approach: 'con', recommended: 2 }).notes.some((n) => /4 inside −2/.test(n)));
});

// --- saves and overwatch ------------------------------------------------------------------------

test('overwatch: one person outside the crew carrying a rifle or a drone; the rifle can\'t see inside the target, the drone can', () => {
  const g = createNewGame({ seed: 9, startCrew: 'fresh' });
  g.jobs = []; addOffer(g, 'container409');
  assert.equal(M.startMission(g, g.jobs[0].id, [g.crew[0].id, g.crew[1].id], 'stealth', { overwatch: { id: g.crew[2].id, kit: 'rifle' } }), g, 'not without a rifle (slice 5: a new crew has no gear)');
  arm(g, g.crew[2].id, 'rifle', 'drone');
  const [a, b, c] = g.crew;
  const ok = M.startMission(g, g.jobs[0].id, [a.id, b.id], 'stealth', { overwatch: { id: c.id, kit: 'rifle' } });
  assert.deepEqual(ok.activeMission.overwatch, { id: c.id, kit: 'rifle', left: OVERWATCH_KIT.rifle.uses });
  assert.equal(M.startMission(g, g.jobs[0].id, [a.id, b.id], 'stealth', { overwatch: { id: a.id, kit: 'rifle' } }), g, 'not someone already inside');
  assert.equal(M.startMission(g, g.jobs[0].id, [a.id, b.id], 'stealth', { overwatch: { id: c.id, kit: 'mortar' } }), g, 'only the kit there is');

  const victim = a;
  const able = [a];
  const rifle = { kit: 'rifle', left: 2 };
  assert.equal(bestSave({ victim, able, overwatch: rifle, overwatchOp: c, zone: 'inside', diff: 6 })?.via, 'overwatch');
  assert.equal(bestSave({ victim, able, overwatch: rifle, overwatchOp: c, zone: 'target', diff: 6 }), null, 'the rifle has no sight of the target');
  assert.equal(bestSave({ victim, able, overwatch: { kit: 'drone', left: 1 }, overwatchOp: c, zone: 'target', diff: 6 })?.via, 'overwatch', 'the drone does');
  assert.equal(bestSave({ victim, able, overwatch: { kit: 'drone', left: 0 }, overwatchOp: c, zone: 'target', diff: 6 }), null, 'out of battery');
});

test('saves happen, use up the kit, and the overwatch person is on the job: away, tired, in the history', () => {
  let saves = 0;
  for (let seed = 1; seed <= 300 && saves < 10; seed++) {
    const g = createNewGame({ seed, startCrew: 'fresh' });
    g.jobs = []; addOffer(g, 'container409');
    const ow = arm(g, g.crew[2].id, 'rifle', 'drone').crew[2];
    const s = M.startMission(g, g.jobs[0].id, [g.crew[0].id], 'loud', { overwatch: { id: ow.id, kit: seed % 2 ? 'rifle' : 'drone' } });
    const { state } = playMission(s, carefulPolicy);
    const am = state.activeMission;
    // Saves, and shots in a fight (slice 6), each use one.
    const used = am.events.filter((e) => e.kind === 'save' && e.via === 'overwatch').length
      + am.events.filter((e) => e.kind === 'battle').flatMap((e) => e.lines ?? []).filter((l) => l.kind === 'overwatch').length;
    assert.equal(am.overwatch.left, OVERWATCH_KIT[am.overwatch.kit].uses - used);
    saves += used;
    const op = state.crew.find((o) => o.id === ow.id);
    assert.ok(op.condition.awayUntil > g.day, 'away with the crew');
    assert.ok(op.condition.fatigue > ow.condition.fatigue, 'tired too');
    assert.ok(op.history.at(-1).includes('Container 409'));
  }
  assert.ok(saves >= 10, `saw ${saves} overwatch saves`);
});

// --- the approaches' costs ---------------------------------------------------------------------

test('approach costs: stealth a day longer, loud a day shorter (never under one) and +1 heat, con pays up front, tech loads implants', () => {
  const tpl = templateById('container409');
  assert.equal(begin(1, 'container409', 'stealth').activeMission.days, tpl.days + 1);
  assert.equal(begin(1, 'container409', 'loud').activeMission.days, Math.max(1, tpl.days - 1));
  assert.equal(begin(1, 'container409', 'tech').activeMission.days, tpl.days);
  const before = (() => { const s = createNewGame({ seed: 1, startCrew: 'fresh' }); return s.cash; })();
  const con = begin(1, 'container409', 'con');
  assert.equal(con.activeMission.bribe, APPROACHES.con.bribePerThreat * con.activeMission.threat);
  assert.equal(con.cash, before - con.activeMission.bribe);
  const done = playMission(con, carefulPolicy).state;
  assert.ok(done.inbox.find((m) => m.type === 'report').timeline.outcome.some((o) => /Props and bribes/.test(o.text)), 'the report says so');
  // Tech: every tech roll by the crew loads the roller's implants.
  let loaded = 0;
  for (let seed = 1; seed <= 40; seed++) {
    const s = begin(seed, 'container409', 'tech');
    const { state } = playMission(s, carefulPolicy);
    for (const e of state.activeMission.events.filter((x) => x.kind === 'roll' && x.stat === 'tech')) {
      const op = state.crew.find((o) => o.id === e.actor.id);
      if (op.condition.neuralLoad > 0) loaded += 1;
    }
  }
  assert.ok(loaded > 10, `tech rolls loaded implants ${loaded} times`);
  // A hands-off crew on stealth is back a day later.
  const g = createNewGame({ seed: 2, startCrew: 'fresh' });
  g.jobs = []; addOffer(g, 'container409');
  const sent = sendOff(g, g.jobs[0].id, g.crew.slice(0, 2).map((o) => o.id), 'stealth', 'steady');
  assert.equal(sent.awayJobs[0].returnDay, g.day + tpl.days + 1);
});

test('the approach shapes the crises: stealth meets entry trouble more often than loud does', () => {
  const count = (approach) => {
    let entry = 0;
    for (let seed = 1; seed <= 400; seed++) {
      const s = begin(seed, MISSIONS.filter((m) => m.rookie)[seed % 8].id, approach);
      const tpl = templateById(s.activeMission.templateId);
      for (const q of s.activeMission.queue.filter((x) => x.type === 'crisis')) {
        const c = tpl.crises.find((x) => x.id === q.id);
        if (c?.situations?.includes('entry')) entry += 1;
      }
    }
    return entry;
  };
  const stealth = count('stealth');
  const loud = count('loud');
  assert.ok(stealth > loud * 1.2, `entry crises: stealth ${stealth}, loud ${loud}`);
});

// --- call-ins -----------------------------------------------------------------------------------

test('the call-in rule: every crisis stops for the player; risky only under even odds; criticals always on a live run', () => {
  for (let seed = 1; seed <= 40; seed++) {
    const every = toCrisis(begin(seed, 'container409', 'stealth', { opts: { callIn: 'every' } }));
    if (every.activeMission.done || every.activeMission.critical) continue;
    assert.equal(needsPlayer(every), true);
    assert.equal(autoStep(every), every, 'waits for the player');
    const risky = structuredClone(every);
    risky.activeMission.callIn = 'risky';
    const best = Math.max(...M.crisisOdds(risky).filter((o) => !o.exit).map((o) => o.chance));
    assert.equal(needsPlayer(risky), best < M.RISKY_BELOW);
    if (!needsPlayer(risky)) assert.notEqual(autoStep(risky), risky, 'the orders decide');
    const crit = structuredClone(risky);
    crit.activeMission.critical = crit.activeMission.crewIds[0];
    assert.equal(needsPlayer(crit), true, 'a critical is always the player\'s call');
  }
});

test('a run played live with "risky" call-ins finishes, and asks the player only when it should', () => {
  for (let seed = 1; seed <= 60; seed++) {
    let s = begin(seed, MISSIONS.filter((m) => m.rookie)[seed % 8].id, APPROACH_IDS[seed % 4], { opts: { callIn: 'risky', orders: 'steady' } });
    for (let g = 0; g < 200 && !s.activeMission.done; g++) {
      const next = autoStep(s);
      if (next !== s) { s = next; continue; }
      // The player's turn: take the first exit-free option, or extract.
      const am = s.activeMission;
      if (am.critical) s = M.resolveCritical(s, 'extract');
      else if (am.pending) s = M.resolvePending(s, M.describePending(s).choices.find((c) => !c.exit).id);
      // A fight waits for orders each round (command fights, 2026-10-30): give none, the crew's own call.
      else if (am.battle && M.currentStep(am)?.type === 'battle') s = M.runBattle(s);
      else s = M.chooseOption(s, M.describeCrisis(s).choices.find((c) => c.available).id);
    }
    assert.equal(s.activeMission.done, true, `seed ${seed}`);
  }
});

// --- saves ----------------------------------------------------------------------------------------

test('a v20 save upgrades: social becomes con, and a job in progress keeps calling at every crisis', async () => {
  let s = begin(11, 'container409', 'con');
  s = structuredClone(s);
  s.activeMission.approach = 'social';
  for (const k of ['callIn', 'alert', 'out', 'pending', 'overwatch', 'wentLoud']) delete s.activeMission[k];
  s.activeMission.queue = s.activeMission.queue.filter((q) => q.type === 'beat' || q.type === 'crisis'); // an old job: no incidents
  s.version = 20;
  const loaded = await importSave({ text: async () => JSON.stringify(s) });
  assert.equal(loaded.version, SAVE_VERSION);
  assert.equal(loaded.activeMission.approach, 'con');
  assert.equal(loaded.activeMission.callIn, 'every');
  assert.equal(loaded.activeMission.alert, 0);
  const { state } = playMission(loaded, carefulPolicy);
  assert.equal(state.activeMission.done, true, 'and it finishes');
});
