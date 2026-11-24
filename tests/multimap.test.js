// A multi-map job (core/multimap.js; the pilot, owner 2026-11-22: a rescue for a client, Kidnap Rescue rebuilt;
// "trail" renamed "maps" 2026-11-23). The promises: the route starts where the template says, every stop is a crisis with an abort,
// the finale (the job's own queue) follows when the route gets there, 2 to 4 stops, at most one wrong lead; the next
// stop is a hash (no roll moves); aborting at a stop brings everyone home; cautious and steady lose nobody; a
// hands-off crew plays the stops on the days before the last and the finale on the last; the validator catches a
// broken route; a fixed route plays its stops in order; and a v87 save, and a v88 run mid-route, upgrade.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame, SAVE_VERSION } from '../src/core/state.js';
import { addOffer, templateById } from '../src/core/jobs.js';
import * as M from '../src/core/mission.js';
import { autoRun, autoStep, sendOff } from '../src/core/autorun.js';
import { advanceDay } from '../src/core/time.js';
import { generateRecruit, recruitToOperative } from '../src/core/recruits.js';
import { validateMissions } from '../src/core/validate.js';
import { nextStop } from '../src/core/multimap.js';

const nextStopOf = (tpl, seed, route, stopId, result) => nextStop(seed, 'job-x', tpl, route, stopId, result);
import { runPlace, MULTI_MAP, DEFAULT_HEADING } from '../src/core/multimap.js';
import { checkJob } from '../src/core/jobcheck.js';

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

test('Kidnap Rescue has maps the validator accepts, and the validator catches a broken one', () => {
  assert.ok(KIDNAP.maps);
  assert.deepEqual(validateMissions([KIDNAP]), []);
  const broken = structuredClone(KIDNAP);
  broken.maps.stops.lockup.next = ['nowhere'];
  broken.maps.stops.courier.crisis = 'lookout'; // not a stop's crisis
  const problems = validateMissions([broken]).join(' | ');
  assert.match(problems, /unknown stop nowhere/);
  assert.match(problems, /must be marked stop: true/);
  for (const c of KIDNAP.crises.filter((x) => x.stop)) assert.ok(c.choices.some((ch) => ch.kind === 'abort'), `${c.id} has an abort`);
});

test('a run starts at the first stop and the finale follows: 2 to 4 stops, at most one wrong lead, the night\'s crises never at a stop', () => {
  const lengths = new Set();
  let wrong = 0;
  for (let seed = 1; seed <= 120; seed++) {
    let s = start(game(seed));
    const am0 = s.activeMission;
    assert.deepEqual(am0.queue, [{ type: 'stop', id: KIDNAP.maps.start }]);
    assert.ok(am0.finale.length > 0 && am0.finale.every((q) => q.type !== 'crisis' || !KIDNAP.crises.find((c) => c.id === q.id)?.stop), 'no stop crisis at night');
    s = autoRun(s, 'steady');
    const am = s.activeMission;
    const stops = am.events.filter((e) => e.kind === 'stop');
    assert.equal(stops[0].stop, KIDNAP.maps.start);
    const wrongs = stops.filter((e) => e.wrong).length;
    assert.ok(wrongs <= 1);
    wrong += wrongs;
    if (am.maps.at === 'finale') {
      assert.equal(stops.at(-1).stop, 'finale');
      assert.ok(am.events.some((e) => e.kind === 'beat'), 'the night played');
      lengths.add(stops.length);
      assert.ok(stops.length >= 2 && stops.length <= MULTI_MAP.maxStops, `stops ${stops.length}`);
    } else assert.ok(am.aborted || am.result.outcome !== 'completed', 'short of the finale only by aborting');
  }
  assert.ok(lengths.has(2) && lengths.has(3), `route lengths seen: ${[...lengths]}`);
  assert.ok(wrong > 0, 'a wrong lead turns up now and then');
});

test('the route picks its stops by hash: no shared roll moves, and the map follows the stop', () => {
  let s = start(game(7));
  const before = s.rngCounter;
  s = autoStep(s, { force: true }); // the first stop: its line, then its crisis queued
  assert.equal(s.rngCounter, before + 1, 'only the crisis\'s own setup draws (the focus pick)');
  assert.equal(s.activeMission.maps.at, 'taken');
  assert.deepEqual(runPlace(s.activeMission, KIDNAP), { district: KIDNAP.maps.stops.taken.district, key: `${s.activeMission.jobId}:taken` });
  const a = autoRun(start(game(7)), 'steady').activeMission.maps.path;
  const b = autoRun(start(game(7)), 'steady').activeMission.maps.path;
  assert.deepEqual(a, b);
});

test('aborting at a stop brings everyone home; cautious and steady lose nobody', () => {
  let s = start(game(3));
  for (let g = 0; g < 10 && M.currentStep(s.activeMission)?.type !== 'crisis'; g++) s = autoStep(s, { force: true });
  const crisis = KIDNAP.crises.find((c) => c.id === M.currentStep(s.activeMission).id);
  assert.ok(crisis.stop, 'the first crisis is a stop\'s');
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

test('hands-off: one stop a day on the days before the last, the finale on the last', () => {
  let s = game(5);
  s = sendOff(s, s.jobs[0].id, s.crew.map((o) => o.id), 'stealth', 'steady', { callIn: 'never' });
  const days = s.awayJobs[0].mission.days;
  for (let d = 1; d < days && s.awayJobs.length; d++) {
    s = advanceDay(s);
    const am = s.awayJobs[0]?.mission;
    if (!am) break; // they walked away: the report is in
    // Still out: one stop a day (2026-11-24, long jobs), and the finale waits for the last day.
    assert.ok(am.maps.path.length <= d, `day ${d}: ${am.maps.path.length} stops`);
    assert.notEqual(am.maps.at, 'finale');
    assert.equal(M.currentStep(am).type, 'stop');
  }
  for (let i = 0; i < 8 && s.awayJobs.length; i++) s = advanceDay(s);
  const r = s.inbox.find((m) => m.type === 'report' && m.back?.templateId === 'kidnap');
  assert.ok(r, 'the report came back');
  assert.match(r.timeline.steps[0], /^11:20\./, 'the report starts at the first stop');
});

test('a v87 save upgrades', async () => {
  const s = game(9);
  s.version = 87;
  const loaded = await importSave({ text: async () => JSON.stringify(s) });
  assert.equal(loaded.version, SAVE_VERSION);
});

test('a fixed route (one next a stop, no skip, no wrong leads) plays its stops in order, every time', () => {
  const tpl = structuredClone(KIDNAP);
  tpl.id = 'kidnap'; // the same job, its route made fixed: taken, then lockup, then the finale
  tpl.maps = { start: 'taken', stops: { taken: { ...KIDNAP.maps.stops.taken, next: ['lockup'], skip: undefined }, lockup: KIDNAP.maps.stops.lockup }, finale: { time: '02:40', arrive: 'In.' } };
  tpl.crises = KIDNAP.crises.filter((c) => !c.stop || ['trail_witness', 'trail_lockup'].includes(c.id));
  assert.deepEqual(validateMissions([tpl]), []);
  for (let seed = 1; seed <= 30; seed++) {
    for (const ok of [true, false]) {
      const r = { path: ['taken'], wrongUsed: false, then: null };
      const a = nextStopOf(tpl, seed, r, 'taken', { success: ok, margin: 20 });
      assert.equal(a.next, 'lockup'); assert.equal(a.wrong, false);
      const b = nextStopOf(tpl, seed, { ...r, path: ['taken', 'lockup'] }, 'lockup', { success: ok, margin: 20 });
      assert.equal(b.next, 'finale');
    }
  }
  assert.equal(tpl.maps.heading ?? DEFAULT_HEADING, 'On the move', 'a job without a heading of its own gets the default');
});

test('a job file still written with "trail" is told it was renamed', () => {
  const old = structuredClone(KIDNAP);
  old.trail = old.maps; delete old.maps;
  assert.match(validateMissions([old]).join(' | '), /renamed "maps"/);
  assert.ok(checkJob(old).errors.some((e) => /renamed/.test(e)));
});

test('a v88 run part-way along its route upgrades: trail to maps, held to finale', async () => {
  const s = game(9);
  let run = start(s);
  for (let g = 0; g < 400 && run.activeMission.maps.at !== 'finale' && !run.activeMission.done; g++) run = autoStep(run, { force: true });
  assert.equal(run.activeMission.maps.at, 'finale');
  const old = structuredClone(run);
  old.version = 88;
  const am = old.activeMission;
  am.trail = { ...am.maps, at: 'held', path: am.maps.path.map((id) => (id === 'finale' ? 'held' : id)) }; delete am.maps;
  const fin = am.events.find((e) => e.kind === 'stop' && e.finale);
  Object.assign(fin, { stop: 'held', held: true }); delete fin.finale; delete fin.place;
  const loaded = await importSave({ text: async () => JSON.stringify(old) });
  assert.equal(loaded.version, SAVE_VERSION);
  assert.equal(loaded.activeMission.trail, undefined);
  assert.deepEqual(loaded.activeMission.maps, run.activeMission.maps);
  assert.deepEqual(loaded.activeMission.events, run.activeMission.events);
  assert.ok(autoRun(loaded, 'steady').activeMission.done, 'the upgraded run plays on to the end');
});
