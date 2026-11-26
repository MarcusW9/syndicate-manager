// Saves with crews out: a hands-off job waiting on a call-in and an expedition on the road, saved and loaded at the
// current version, then played to the end. The promises: a save taken mid-trip loads unchanged and plays on exactly
// as the unsaved game would; a half-written save (crews-out fields missing, null or broken) still loads, nothing is
// left blocking the day, everyone is home by their return day and nobody is lost; and a broken entry that still names
// its crew is dropped with that crew sent home at once.
// Research, 2026-11-26 (docs/research/management-games-comparators.md): the save state for crews out is where a
// similar game broke. Run with: npm test

import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame, SAVE_VERSION } from '../src/core/state.js';
import { addOffer, templateById } from '../src/core/jobs.js';
import { sendOff, needsPlayer, autoStep } from '../src/core/autorun.js';
import { takeCall, letThemRun, canLetRun } from '../src/core/away.js';
import { advanceDay } from '../src/core/time.js';
import { resolveDecision } from '../src/core/decisions.js';
import { sendExpedition, canSend, expeditionsOut } from '../src/core/expeditions.js';
import { GOALS } from '../src/data/expeditions.js';
import { closeMission, crisisOdds, chooseOption, describePending, resolvePending, resolveCritical, currentStep } from '../src/core/mission.js';
import { handOffFight } from '../src/core/runbattle.js';

const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
};
const S = await import('../src/save/save.js');
const asFile = (state) => ({ text: async () => JSON.stringify(state) });

beforeEach(() => store.clear());

const callIn = (s) => s.inbox.find((m) => m.kind === 'callin' && !m.resolved);
const tripCall = (s) => s.inbox.find((m) => m.kind === 'expedition' && !m.resolved);

/** A fresh game with a crew out on a warehouse job that calls in at every stop, the rest on an expedition, played until the call comes. */
function midTrip(seed) {
  let s = createNewGame({ seed, startCrew: 'fresh' });
  s.jobs = [];
  addOffer(s, 'warehouse');
  const size = templateById('warehouse').crewSize;
  s = sendOff(s, s.jobs[0].id, s.crew.slice(0, size).map((o) => o.id), 'stealth', 'steady', { callIn: 'every' });
  const rest = s.crew.slice(size).map((o) => o.id);
  const goal = Object.keys(GOALS).find((g) => canSend(s, g, 'docks', rest).ok);
  assert.ok(goal, 'the crew left behind can go on an expedition');
  s = sendExpedition(s, { goal, district: 'docks', crewIds: rest });
  for (let d = 0; d < 6 && !callIn(s); d++) s = advanceDay(s);
  assert.ok(callIn(s), 'the crew out has called in');
  assert.equal(s.awayJobs.length, 1);
  assert.equal(expeditionsOut(s).length, 1);
  return s;
}

/** Answer the job on screen the careful way: exits first, extract at a critical, fights handed to the crew. */
function answerCarefully(s) {
  const am = s.activeMission;
  if (am.critical) return resolveCritical(s, 'extract');
  if (am.pending) {
    const v = describePending(s);
    const out = v.choices.find((c) => c.exit) ?? v.choices.find((c) => !c.push) ?? v.choices[0];
    return resolvePending(s, out.id);
  }
  if (currentStep(am)?.type === 'battle' && am.battle && !am.battle.auto) return handOffFight(s);
  if (currentStep(am)?.type === 'crisis') {
    const odds = crisisOdds(s);
    const pick = odds.filter((o) => !o.exit).sort((a, b) => b.chance - a.chance)[0];
    return chooseOption(s, (pick && pick.chance >= 0.5 ? pick : odds.find((o) => o.exit) ?? pick).choice.id);
  }
  return autoStep(s);
}

/** Play until every crew is home: take each call, answer carefully, pull an expedition back when it calls. */
function playOut(s) {
  for (let day = 0; day < 30 && (s.awayJobs.length || s.activeMission || expeditionsOut(s).length); day++) {
    for (let g = 0; g < 400 && s.activeMission; g++) {
      if (s.activeMission.done) { s = closeMission(s); break; }
      if (canLetRun(s)) { s = letThemRun(s); break; }
      s = needsPlayer(s) ? answerCarefully(s) : autoStep(s);
    }
    if (s.activeMission) continue;
    const c = callIn(s);
    if (c) { s = takeCall(s, c.payload.jobId); continue; }
    const t = tripCall(s);
    if (t) { s = resolveDecision(s, t.id, 'give'); continue; }
    s = advanceDay(s);
  }
  return s;
}

/** Days pass (at most ten) until nobody is marked away: a crew whose trip was lost comes home on its own return day. */
function untilHome(s) {
  for (let d = 0; d < 10 && s.crew.some((op) => (op.condition.awayUntil ?? 0) > s.day); d++) s = advanceDay(s);
  return s;
}

/** Everyone home, nobody lost, no crew left marked away. */
function allHome(s, label) {
  assert.equal(s.awayJobs.length, 0, `${label}: no job still out`);
  assert.equal(s.activeMission, null, `${label}: no job on screen`);
  assert.equal(expeditionsOut(s).length, 0, `${label}: no expedition still out`);
  assert.equal(s.memorial.length, 0, `${label}: nobody lost`);
  for (const op of s.crew) assert.ok((op.condition.awayUntil ?? 0) <= s.day, `${label}: ${op.name} is home`);
}

test('a save taken with a call-in waiting and an expedition out loads unchanged', () => {
  for (const seed of [1, 2, 3]) {
    const s = midTrip(seed);
    S.setActiveSlot(1);
    S.saveGame(s);
    const loaded = S.loadGame();
    assert.equal(loaded.version, SAVE_VERSION);
    assert.deepEqual(loaded, JSON.parse(JSON.stringify(s)), `seed ${seed}: the loaded game is the saved game`);
  }
});

test('the loaded game plays on exactly as the unsaved one would, and everyone comes home', async () => {
  for (const seed of [1, 2, 3]) {
    const s = midTrip(seed);
    const loaded = await S.importSave(asFile(s));
    const a = playOut(structuredClone(s));
    const b = playOut(loaded);
    allHome(b, `seed ${seed}`);
    assert.deepEqual(JSON.parse(JSON.stringify(b)), JSON.parse(JSON.stringify(a)), `seed ${seed}: same ending either way`);
  }
});

// Each way a save can come back half-written. Every one must load and play out with everyone home.
const BROKEN = {
  'no awayJobs': (s) => { delete s.awayJobs; },
  'awayJobs is null': (s) => { s.awayJobs = null; },
  'an away job with no mission': (s) => { s.awayJobs.push({ returnDay: s.day + 1 }); },
  'an away job missing its away record': (s) => { for (const j of s.awayJobs) { delete j.mission.away; delete j.waiting; } },
  'no expeditions': (s) => { delete s.expeditions; },
  'expeditions is null': (s) => { s.expeditions = null; },
  'expeditions with no active list': (s) => { s.expeditions = { seq: 1 }; },
  'an expedition missing its log, finds and facts': (s) => { for (const e of s.expeditions.active) { delete e.log; delete e.finds; delete e.facts; } },
  'an expedition missing its days and progress': (s) => { for (const e of s.expeditions.active) { delete e.endDay; delete e.progress; delete e.waiting; } },
  'an expedition with no crew list': (s) => { for (const e of s.expeditions.active) delete e.crewIds; },
  'a null entry in the expedition list': (s) => { s.expeditions.active.push(null); },
};

for (const [label, breakIt] of Object.entries(BROKEN)) {
  test(`a half-written save still loads and plays out: ${label}`, async () => {
    const s = midTrip(4);
    breakIt(s);
    const loaded = await S.importSave(asFile(s));
    assert.equal(loaded.version, SAVE_VERSION);
    assert.ok(Array.isArray(loaded.awayJobs));
    assert.ok(Array.isArray(loaded.expeditions.active));
    const ended = playOut(loaded);
    assert.ok(!ended.inbox.some((m) => m.blocking && !m.resolved), `${label}: nothing left blocking the day`);
    allHome(untilHome(ended), label);
  });
}

test('a call from a crew that is no longer out is closed, so it cannot block the day', async () => {
  const s = midTrip(7);
  delete s.awayJobs;
  const loaded = await S.importSave(asFile(s));
  assert.equal(callIn(loaded), undefined);
  assert.ok(advanceDay(loaded).day > loaded.day, 'the day moves on');
});

test('a well-formed save with crews out comes through the repair unchanged', async () => {
  const s = midTrip(8);
  const loaded = await S.importSave(asFile(s));
  assert.deepEqual(loaded, JSON.parse(JSON.stringify(s)));
});

test('a broken expedition is dropped and its crew come home at once', async () => {
  const s = midTrip(5);
  const [trip] = s.expeditions.active;
  delete trip.goal;
  const loaded = await S.importSave(asFile(s));
  assert.equal(loaded.expeditions.active.length, 0);
  for (const id of trip.crewIds) {
    const op = loaded.crew.find((o) => o.id === id);
    assert.ok((op.condition.awayUntil ?? 0) <= loaded.day, `${op.name} is not left away`);
  }
});

test('the expedition count never falls behind a trip already out', async () => {
  const s = midTrip(6);
  s.expeditions.seq = 0;
  const loaded = await S.importSave(asFile(s));
  const ids = loaded.expeditions.active.map((e) => Number(e.id.replace(/\D/g, '')));
  assert.ok(loaded.expeditions.seq >= Math.max(...ids));
});
