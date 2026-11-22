// A job that follows a trail (core/trail.js; the multi-map pilot, owner 2026-11-22: a rescue for a client, Kidnap
// Rescue rebuilt). The promises: the trail starts where the template says, every stop is a crisis with an abort,
// the night (the job's own queue) follows when the trail gets there, 2 to 4 stops, at most one wrong lead; the next
// stop is a hash (no roll moves); aborting on the trail brings everyone home; cautious and steady lose nobody; a
// hands-off crew follows the trail on the days before the last and plays the night on the last; the validator
// catches a broken trail; and a v87 save upgrades.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame, SAVE_VERSION } from '../src/core/state.js';
import { addOffer, templateById } from '../src/core/jobs.js';
import * as M from '../src/core/mission.js';
import { autoRun, autoStep, sendOff } from '../src/core/autorun.js';
import { advanceDay } from '../src/core/time.js';
import { generateRecruit, recruitToOperative } from '../src/core/recruits.js';
import { validateMissions } from '../src/core/validate.js';
import { runPlace, TRAIL } from '../src/core/trail.js';

const { importSave } = await import('../src/save/save.js');
const KIDNAP = templateById('kidnap');

/** A game with four pros (a face, a tech, muscle, a medic) and Kidnap Rescue on the board. */
function game(seed) {
  const s = createNewGame({ seed, startCrew: 'fresh' });
  s.crew = ['face', 'tech', 'muscle', 'medic'].map((role) => recruitToOperative(generateRecruit(s, { role, quality: 'pro' }), { condition: { injury: 'healthy', injuryDays: 0, fatigue: 0, morale: 70, neuralLoad: 0, awayUntil: 0 }, history: [] }));
  s.jobs = [];
  addOffer(s, 'kidnap');
  return s;
}
const start = (s) => M.startMission(s, s.jobs[0].id, s.crew.map((o) => o.id), 'stealth');

test('Kidnap Rescue has a trail the validator accepts, and the validator catches a broken one', () => {
  assert.ok(KIDNAP.trail);
  assert.deepEqual(validateMissions([KIDNAP]), []);
  const broken = structuredClone(KIDNAP);
  broken.trail.stops.lockup.next = ['nowhere'];
  broken.trail.stops.courier.crisis = 'lookout'; // not a trail crisis
  const problems = validateMissions([broken]).join(' | ');
  assert.match(problems, /unknown stop nowhere/);
  assert.match(problems, /must be marked trail: true/);
  for (const c of KIDNAP.crises.filter((x) => x.trail)) assert.ok(c.choices.some((ch) => ch.kind === 'abort'), `${c.id} has an abort`);
});

test('a run starts on the trail and the night follows it: 2 to 4 stops, at most one wrong lead, the night\'s crises never on the trail', () => {
  const lengths = new Set();
  let wrong = 0;
  for (let seed = 1; seed <= 120; seed++) {
    let s = start(game(seed));
    const am0 = s.activeMission;
    assert.deepEqual(am0.queue, [{ type: 'stop', id: KIDNAP.trail.start }]);
    assert.ok(am0.finale.length > 0 && am0.finale.every((q) => q.type !== 'crisis' || !KIDNAP.crises.find((c) => c.id === q.id)?.trail), 'no trail crisis at night');
    s = autoRun(s, 'steady');
    const am = s.activeMission;
    const stops = am.events.filter((e) => e.kind === 'stop');
    assert.equal(stops[0].stop, KIDNAP.trail.start);
    const wrongs = stops.filter((e) => e.wrong).length;
    assert.ok(wrongs <= 1);
    wrong += wrongs;
    if (am.trail.at === 'held') {
      assert.equal(stops.at(-1).stop, 'held');
      assert.ok(am.events.some((e) => e.kind === 'beat'), 'the night played');
      lengths.add(stops.length);
      assert.ok(stops.length >= 2 && stops.length <= TRAIL.maxStops, `stops ${stops.length}`);
    } else assert.ok(am.aborted || am.result.outcome !== 'completed', 'off the trail only by aborting');
  }
  assert.ok(lengths.has(2) && lengths.has(3), `trail lengths seen: ${[...lengths]}`);
  assert.ok(wrong > 0, 'a wrong lead turns up now and then');
});

test('the trail picks its stops by hash: no shared roll moves, and the map follows the stop', () => {
  let s = start(game(7));
  const before = s.rngCounter;
  s = autoStep(s, { force: true }); // the first stop: its line, then its crisis queued
  assert.equal(s.rngCounter, before + 1, 'only the crisis\'s own setup draws (the focus pick)');
  assert.equal(s.activeMission.trail.at, 'taken');
  assert.deepEqual(runPlace(s.activeMission, KIDNAP), { district: KIDNAP.trail.stops.taken.district, key: `${s.activeMission.jobId}:taken` });
  const a = autoRun(start(game(7)), 'steady').activeMission.trail.path;
  const b = autoRun(start(game(7)), 'steady').activeMission.trail.path;
  assert.deepEqual(a, b);
});

test('aborting on the trail brings everyone home; cautious and steady lose nobody', () => {
  let s = start(game(3));
  for (let g = 0; g < 10 && M.currentStep(s.activeMission)?.type !== 'crisis'; g++) s = autoStep(s, { force: true });
  const crisis = KIDNAP.crises.find((c) => c.id === M.currentStep(s.activeMission).id);
  assert.ok(crisis.trail, 'the first crisis is the trail\'s');
  s = M.chooseOption(s, crisis.choices.find((ch) => ch.kind === 'abort').id);
  assert.ok(s.activeMission.done && s.activeMission.aborted);
  assert.equal(s.activeMission.result.deaths.length, 0);
  for (const orders of ['cautious', 'steady']) {
    for (let seed = 1; seed <= 60; seed++) {
      const r = autoRun(start(game(seed)), orders).activeMission.result;
      assert.equal(r.deaths.length, 0, `${orders} seed ${seed}`);
    }
  }
});

test('hands-off: the trail on the days before the last, the night on the last', () => {
  let s = game(5);
  s = sendOff(s, s.jobs[0].id, s.crew.map((o) => o.id), 'stealth', 'steady', { callIn: 'never' });
  s = advanceDay(s);
  const am = s.awayJobs[0]?.mission;
  if (am) { // still out: the trail is done and the night waits for the last day
    assert.equal(am.trail.at, 'held');
    assert.equal(M.currentStep(am).type, 'beat');
    assert.equal(M.currentStep(am).index, 0);
  }
  for (let i = 0; i < 5 && s.awayJobs.length; i++) s = advanceDay(s);
  const r = s.inbox.find((m) => m.type === 'report' && m.back?.templateId === 'kidnap');
  assert.ok(r, 'the report came back');
  assert.match(r.timeline.steps[0], /^11:20\./, 'the report starts on the trail');
});

test('a v87 save upgrades', async () => {
  const s = game(9);
  s.version = 87;
  const loaded = await importSave({ text: async () => JSON.stringify(s) });
  assert.equal(loaded.version, SAVE_VERSION);
});
