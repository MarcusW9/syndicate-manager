// Wheels and standby (PLAN-CORE-LOOP.md, slice 3): Wheels takes every driving roll from the van;
// standby waits at the van until called in at max alert (they join; the alert stays) or to rescue
// someone badly hurt (they take their place). The death rule and the exits still hold.
// Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame, SAVE_VERSION } from '../src/core/state.js';
import * as M from '../src/core/mission.js';
import { addOffer, templateById } from '../src/core/jobs.js';
import { crewRoll } from '../src/core/crew.js';
import { autoStep, autoRun, sendOff } from '../src/core/autorun.js';
import { ordersDecision, ALERT_MAX } from '../src/core/incidents.js';
import { APPROACHES } from '../src/data/approaches.js';
import { MISSIONS } from '../src/data/missions.js';
import { playMission, toCrisis, randomPolicy, carefulPolicy, arm } from './play.js';

globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
const { importSave } = await import('../src/save/save.js');

const APPROACH_IDS = Object.keys(APPROACHES);

/** A fresh game with one offer; n inside, then (optionally) Wheels and standby from the rest. */
function begin(seed, templateId, approach = 'stealth', { n, wheels = false, standby = false, opts = {} } = {}) {
  const s = createNewGame({ seed, startCrew: 'fresh' });
  s.jobs = [];
  addOffer(s, templateId);
  const size = n ?? templateById(templateId).crewSize;
  const rest = s.crew.slice(size);
  return M.startMission(s, s.jobs[0].id, s.crew.slice(0, size).map((o) => o.id), approach, {
    ...opts, wheels: wheels ? rest[0].id : null, standby: standby ? rest[wheels ? 1 : 0].id : null,
  });
}

/** Step a run on its own until it stops for a decision of this kind (or ends). Other decisions
 * are taken without spending standby (carry on; go loud), so it's still there for this one. */
function toPending(s, kind) {
  for (let g = 0; g < 160 && !s.activeMission.done; g++) {
    const p = s.activeMission.pending;
    if (p?.kind === kind) return s;
    if (p) { s = M.resolvePending(s, p.kind === 'injury' ? 'keep' : 'loud'); continue; }
    if (s.activeMission.critical) return s;
    const next = autoStep(s, { force: true });
    if (next === s) return s;
    s = next;
  }
  return s;
}

test('Wheels and standby are crew of your own, one place each', () => {
  const s = createNewGame({ seed: 4, startCrew: 'fresh' });
  s.jobs = [];
  addOffer(s, 'container409');
  const [a, b, c, d] = s.crew.map((o) => o.id);
  arm(s, c, 'rifle');
  const job = s.jobs[0].id;
  assert.notEqual(M.startMission(s, job, [a, b], 'stealth', { wheels: c, standby: d }), s, 'a full squad starts');
  assert.equal(M.startMission(s, job, [a, b], 'stealth', { wheels: a }), s, 'not inside and in the van');
  assert.equal(M.startMission(s, job, [a, b], 'stealth', { wheels: c, standby: c }), s, 'not in two places');
  assert.equal(M.startMission(s, job, [a, b], 'stealth', { overwatch: { id: c, kit: 'rifle' }, standby: c }), s, 'not overwatch and standby');
  assert.equal(M.startMission(s, job, [a, b], 'stealth', { wheels: 'nobody' }), s, 'someone real');
});

test('Wheels takes every driving roll from the van, and the read says so', () => {
  let checked = 0;
  for (let seed = 1; seed <= 60 && checked < 10; seed++) {
    let s = begin(seed, 'container409', APPROACH_IDS[seed % 4], { wheels: true });
    s = toCrisis(s);
    const odds = M.crisisOdds(s) ?? [];
    for (const o of odds.filter((x) => x.roller && x.choice.stat === 'driving')) {
      assert.equal(o.roller.op.id, s.activeMission.wheels, `seed ${seed}: Wheels drives`);
      assert.ok(o.roller.notes.includes('Wheels'), 'the note says who');
      assert.ok(!o.roller.notes.some((n) => /short-handed|backs up/.test(n)), 'alone at the wheel: no backup, no short-handed');
      checked++;
    }
  }
  assert.ok(checked >= 3, `saw ${checked} driving choices`);
});

test('standby at max alert: they join the team, the alert stays up, and the next call has no standby', () => {
  let seen = 0;
  for (let seed = 1; seed <= 400 && seen < 6; seed++) {
    let s = toPending(begin(seed, 'warehouse', APPROACH_IDS[seed % 4], { n: 1, standby: true }), 'alert');
    if (s.activeMission.pending?.kind !== 'alert') continue;
    const view = M.describePending(s);
    assert.ok(view.choices.some((c) => c.id === 'standby'), 'standby is offered');
    assert.ok(view.choices.some((c) => c.exit), 'and an exit');
    const sb = s.activeMission.standby.id;
    s = M.resolvePending(s, 'standby');
    const am = s.activeMission;
    assert.ok(am.crewIds.includes(sb), 'standby is inside now');
    assert.equal(am.alert, ALERT_MAX, 'the alert stays up');
    assert.equal(am.standby.used, true);
    assert.equal(am.pending, null);
    s = toPending(s, 'alert');
    if (s.activeMission.pending?.kind === 'alert') assert.ok(!M.describePending(s).choices.some((c) => c.id === 'standby'), 'standby only once');
    seen++;
  }
  assert.ok(seen >= 3, `saw ${seen}`);
});

test('a rescue: standby gets the wounded out and takes their place', () => {
  let seen = 0;
  for (let seed = 1; seed <= 800 && seen < 5; seed++) {
    let s = toPending(begin(seed, 'warehouse', APPROACH_IDS[seed % 4], { n: 2, standby: true }), 'injury');
    if (s.activeMission.pending?.kind !== 'injury') continue;
    const patient = s.activeMission.pending.opId;
    assert.ok(M.describePending(s).choices.some((c) => c.id === 'rescue'));
    const sb = s.activeMission.standby.id;
    s = M.resolvePending(s, 'rescue');
    const am = s.activeMission;
    assert.ok(am.crewIds.includes(sb));
    assert.ok(am.out.includes(patient), 'the wounded sit the rest out');
    const ev = am.events.findLast((e) => e.kind === 'decision');
    assert.equal(ev.rescued.id, patient);
    seen++;
  }
  assert.ok(seen >= 2, `saw ${seen}`);
});

test('once standby is in, a failed save gets a second try from them, never more', () => {
  let second = 0;
  for (let seed = 1; seed <= 300; seed++) {
    const s = begin(seed, 'warehouse', 'loud', { n: 2, standby: true });
    const am = autoRun(s, 'steady').activeMission;
    const ev = am.events;
    for (let i = 0; i < ev.length; i++) {
      if (ev[i].kind !== 'save' || ev[i].via !== 'standby') continue;
      second++;
      const prev = ev[i - 1];
      assert.ok(prev.kind === 'roll' || (prev.kind === 'save' && !prev.success), `seed ${seed}: standby tries after a miss or when nobody could`);
      assert.notEqual(ev[i + 1]?.via, 'standby', 'one try');
    }
  }
  assert.ok(second > 0, 'standby saved at least once');
});

test('the orders: Cautious never calls standby; Steady and Committed do while they have one', () => {
  assert.equal(ordersDecision('alert', 'cautious', { standby: true }).id, 'out');
  assert.equal(ordersDecision('injury', 'cautious', { standby: true }).id, 'out');
  for (const o of ['steady', 'committed']) {
    assert.equal(ordersDecision('alert', o, { standby: true }).id, 'standby');
    assert.equal(ordersDecision('injury', o, { standby: true }).id, 'rescue');
  }
  assert.equal(ordersDecision('alert', 'committed', { standby: false }).id, 'loud');
  assert.equal(ordersDecision('injury', 'steady', { standby: false }).id, 'keep');
});

test('nobody dies without "push on", and every exit brings everyone home, with Wheels and standby', () => {
  const rookieJobs = MISSIONS.filter((m) => m.rookie).map((m) => m.id);
  for (let seed = 1; seed <= 1500; seed++) {
    const s = begin(seed, seed % 3 ? rookieJobs[seed % rookieJobs.length] : 'warehouse', APPROACH_IDS[seed % 4], { n: 1 + (seed % 2), wheels: seed % 2 === 0, standby: true });
    const policy = { ...randomPolicy(seed), critical: (o) => (o.includes('extract') ? 'extract' : o[0]) };
    const { state, pushed } = playMission(s, policy);
    if (!pushed) assert.deepEqual(state.activeMission.result.deaths, [], `seed ${seed}`);
    if (state.activeMission.aborted) assert.deepEqual(state.activeMission.result.deaths, [], `seed ${seed}: exits save everyone`);
  }
});

test('the spotted penalty goes once the alert is maxed: nothing left to hide', () => {
  const s = createNewGame({ seed: 9, startCrew: 'fresh' });
  const crew = s.crew.slice(0, 4);
  const low = crewRoll(crew, 'stealth', { approach: 'stealth', recommended: 2, alert: 0 });
  const max = crewRoll(crew, 'stealth', { approach: 'stealth', recommended: 2, alert: ALERT_MAX });
  assert.ok(low.notes.some((n) => /inside −/.test(n)));
  assert.ok(!max.notes.some((n) => /inside −/.test(n)));
  assert.equal(max.value, low.value + 2);
});

test('Wheels and standby are on the job: away on a hands-off run, tired and in the history after', () => {
  const s = createNewGame({ seed: 6, startCrew: 'fresh' });
  s.jobs = [];
  addOffer(s, 'container409');
  const [a, b, c, d] = s.crew.map((o) => o.id);
  const away = sendOff(s, s.jobs[0].id, [a, b], 'stealth', 'steady', { wheels: c, standby: d });
  for (const id of [c, d]) assert.ok(away.crew.find((o) => o.id === id).condition.awayUntil > s.day, `${id} is away`);
  const live = playMission(M.startMission(s, s.jobs[0].id, [a, b], 'stealth', { wheels: c, standby: d }), carefulPolicy).state;
  for (const id of [c, d]) {
    const op = live.crew.find((o) => o.id === id);
    assert.ok(op.condition.fatigue > s.crew.find((o) => o.id === id).condition.fatigue, `${id} is tired`);
    assert.match(op.history.at(-1), /Container 409/);
  }
});

test('a v21 save upgrades: a job in progress gets no Wheels or standby, and finishes', async () => {
  let s = structuredClone(begin(12, 'container409', 'tech'));
  delete s.activeMission.wheels;
  delete s.activeMission.standby;
  s.version = 21;
  const loaded = await importSave({ text: async () => JSON.stringify(s) });
  assert.equal(loaded.version, SAVE_VERSION);
  assert.equal(loaded.activeMission.wheels, null);
  assert.equal(loaded.activeMission.standby, null);
  assert.equal(playMission(loaded, carefulPolicy).state.activeMission.done, true);
});
