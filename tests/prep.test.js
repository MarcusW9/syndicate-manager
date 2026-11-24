// Longer jobs and their prep stops (owner, 2026-11-24; drafts/PROPOSAL-longer-jobs.md; core/prep.js, data/prepStops.js).
// The promises: every prep stop is a crisis with an abort that costs at most a light injury; a long offer picks its
// stops when it is made (by threat, within its days, from its district's and the anywhere stops) and keeps them; the
// run plays them as a route before the job's own map; a stop's success eases the job or takes a crisis out, a failure
// starts it on alert; aborting at a stop brings everyone home with no pay; careful crews lose nobody; sent hands-off,
// a long job plays one stop a day.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame } from '../src/core/state.js';
import { addOffer, templateById, isLongJob, jobView } from '../src/core/jobs.js';
import * as M from '../src/core/mission.js';
import { sendOff, watchOff, watchByDay, needsPlayer, autoStep } from '../src/core/autorun.js';
import { takeCall, letThemRun, canLetRun } from '../src/core/away.js';
import { advanceDay } from '../src/core/time.js';
import { pickPrep, prepFits, prepRoute, PREP_COUNT } from '../src/core/prep.js';
import { PREP_STOPS, prepStopById } from '../src/data/prepStops.js';
import { validatePrepStops } from '../src/core/validate.js';
import { MISSIONS } from '../src/data/missions.js';
import { generateRecruit, recruitToOperative } from '../src/core/recruits.js';
import { playMission, carefulPolicy, toCrisis } from './play.js';

const LONG = MISSIONS.filter((m) => isLongJob(m) && !m.maps);

/** A game with four pros and one varied offer of this job on the board. */
function game(seed, templateId) {
  const s = createNewGame({ seed, startCrew: 'fresh' });
  s.crew = ['face', 'tech', 'muscle', 'medic'].map((role) => recruitToOperative(generateRecruit(s, { role, quality: 'pro' }), { condition: { injury: 'healthy', injuryDays: 0, fatigue: 0, morale: 70, neuralLoad: 0, awayUntil: 0 }, history: [] }));
  s.jobs = [];
  let n = seed;
  addOffer(s, templateId, { rng: () => ((n = (n * 9301 + 49297) % 233280) / 233280) });
  return s;
}
const start = (s, approach = 'stealth') => M.startMission(s, s.jobs[0].id, s.crew.map((o) => o.id), approach);

test('every prep stop passes the checks: an exit, failure text, report lines, at most a light injury, known effects', () => {
  assert.deepEqual(validatePrepStops(PREP_STOPS), []);
  assert.ok(PREP_STOPS.length >= 12);
  for (const p of PREP_STOPS) {
    assert.ok(p.crisis.choices.some((c) => c.kind === 'abort' || c.kind === 'extract'), p.id);
    for (const c of p.crisis.choices) assert.ok(!['serious', 'critical'].includes(c.failureInjury), `${p.id}/${c.id}`);
  }
  // The validator catches a stop that could maim.
  const bad = structuredClone(PREP_STOPS[0]);
  bad.crisis.choices[0].failureInjury = 'serious';
  assert.match(validatePrepStops([bad]).join(' '), /at most a light injury/);
});

test('a long offer picks its stops when it is made: by threat, within its days, from stops that fit its district', () => {
  for (const tpl of LONG) {
    for (let seed = 1; seed <= 6; seed++) {
      const s = game(seed, tpl.id);
      const job = s.jobs[0];
      const [lo, hi] = PREP_COUNT[tpl.threat];
      const prep = job.prep ?? [];
      assert.ok(prep.length >= Math.min(lo, job.days - 1) && prep.length <= Math.min(hi, job.days - 1), `${tpl.id}: ${prep.length} stops in ${job.days} days`);
      assert.equal(new Set(prep).size, prep.length, 'no stop twice');
      const fits = prepFits(tpl).map((p) => p.id);
      for (const id of prep) assert.ok(fits.includes(id), `${tpl.id}: ${id} fits ${tpl.district}`);
      assert.deepEqual(pickPrep(s.seed, job.id, tpl, job.days), prep, 'the same pick on reload');
      assert.deepEqual(jobView(s, job).prep, prep, 'the board sees the route');
    }
  }
  // Quick work, a plain offer and a job with its own route have none.
  const quick = createNewGame({ seed: 2, startCrew: 'fresh' });
  quick.jobs = [];
  addOffer(quick, MISSIONS.find((m) => m.rookie).id, { rng: () => 0.3 });
  addOffer(quick, LONG[0].id);
  addOffer(quick, 'kidnap', { rng: () => 0.3 });
  assert.deepEqual(quick.jobs.map((j) => j.prep ?? []), [[], [], []]);
});

test('a long job plays its prep stops first, each on its own map, then the job itself', () => {
  let played = 0;
  for (let seed = 1; seed <= 20; seed++) {
    const tpl = LONG[seed % LONG.length];
    const s0 = start(game(seed, tpl.id));
    const am0 = s0.activeMission;
    if (!s0.jobs.length && !am0) continue;
    if (!am0.route) continue;
    assert.equal(M.currentStep(am0).type, 'stop', 'the route starts at the first prep stop');
    assert.equal(am0.route.start, s0.activeMission.route.start);
    const r = playMission(s0, carefulPolicy);
    const am = r.state.activeMission;
    const stops = am.events.filter((e) => e.kind === 'stop');
    const ran = stops.filter((e) => !e.finale).map((e) => e.stop);
    if (!am.aborted) {
      assert.deepEqual(ran, Object.keys(am0.route.stops), `${tpl.id}: every prep stop, in order`);
      assert.ok(stops.at(-1).finale, 'then the job');
    }
    assert.equal(am.result.deaths.length, 0, `${tpl.id} seed ${seed}: careful crews lose nobody`);
    played++;
  }
  assert.ok(played >= 10, `played ${played}`);
});

test("a stop's success eases the job or takes a crisis out; its failure starts the job on alert", () => {
  const tpl = LONG.find((m) => m.district === 'docks') ?? LONG[0];
  let eased = 0, dropped = 0, alerted = 0;
  for (let seed = 1; seed <= 60 && (!eased || !dropped || !alerted); seed++) {
    let s = start(game(seed, tpl.id));
    if (!s.activeMission?.route) continue;
    s = toCrisis(s);
    const am = s.activeMission;
    const stop = prepStopById(M.currentStep(am).id);
    if (!stop) continue;
    const go = M.describeCrisis(s).choices.find((c) => c.available && c.kind !== 'abort');
    const data = stop.crisis.choices.find((c) => c.id === go.id);
    const before = { delta: am.threatDelta ?? 0, alert: am.alert ?? 0, finale: am.finale.filter((q) => q.type === 'crisis').length };
    const after = M.chooseOption(s, go.id).activeMission;
    const ok = after.events.at(-1).success;
    if (ok && data.successCost?.ease) { assert.equal(after.threatDelta, before.delta - 1); eased++; }
    if (ok && data.successCost?.dropCrisis) { assert.equal(after.finale.filter((q) => q.type === 'crisis').length, before.finale - 1); dropped++; }
    if (!ok && data.failureCost?.alert) { assert.equal(after.alert, before.alert + 1); alerted++; }
  }
  assert.ok(eased && dropped && alerted, `eased ${eased}, dropped ${dropped}, alerted ${alerted}`);
});

test('aborting at a prep stop brings everyone home and pays nothing', () => {
  for (let seed = 1; seed <= 10; seed++) {
    let s = start(game(seed, LONG[seed % LONG.length].id));
    if (!s.activeMission?.route) continue;
    s = toCrisis(s);
    const out = M.describeCrisis(s).choices.find((c) => c.kind === 'abort');
    s = M.chooseOption(s, out.id);
    const r = playMission(s, carefulPolicy).state.activeMission;
    assert.ok(r.aborted);
    assert.equal(r.result.deaths.length, 0);
    assert.equal(r.result.pay, 0);
    return;
  }
  assert.fail('no long job with prep started');
});

test('sent hands-off, a long job plays one prep stop a day and the job on its last day', () => {
  let checked = 0;
  for (let seed = 1; seed <= 30 && checked < 4; seed++) {
    const tpl = LONG.find((m) => m.threat >= 4) ?? LONG[0];
    const s0 = game(seed, tpl.id);
    const job = s0.jobs[0];
    if ((job.prep ?? []).length < 2) continue;
    let s = sendOff(s0, job.id, s0.crew.map((o) => o.id), 'stealth', 'steady', { callIn: 'never' });
    const days = s.awayJobs[0].mission.days;
    for (let d = 1; d < days && s.awayJobs.length; d++) {
      s = advanceDay(s);
      const am = s.awayJobs[0]?.mission;
      if (!am) break;
      assert.ok(am.maps.path.length <= d, `day ${d}: at most ${d} stops (${am.maps.path.length})`);
      assert.notEqual(am.maps.at, 'finale', 'the job itself waits for its day');
    }
    while (s.awayJobs.length) s = advanceDay(s);
    checked++;
  }
  assert.ok(checked >= 2, `checked ${checked}`);
});

test('a prep route has the shape of a multi-map route: each stop leads to the next, the last to the job', () => {
  const tpl = LONG[0];
  const ids = prepFits(tpl).slice(0, 3).map((p) => p.id);
  const route = prepRoute(ids, tpl, 'con');
  assert.equal(route.start, ids[0]);
  assert.deepEqual(ids.map((id) => route.stops[id].next[0]), [ids[1], ids[2], 'finale']);
  assert.ok(route.finale.arrive && route.finale.time);
  assert.equal(prepRoute([], tpl, 'con'), null);
  assert.ok(templateById(tpl.id));
});

test('watching a long job: the crew calls you to each stop on its day and to the job itself, then the report', () => {
  let watched = 0;
  for (let seed = 1; seed <= 30 && watched < 3; seed++) {
    const tpl = LONG.find((m) => m.threat >= 3) ?? LONG[0];
    const s0 = game(seed, tpl.id);
    const job = s0.jobs[0];
    if (!watchByDay(s0, job)) continue;
    let s = watchOff(s0, job.id, s0.crew.map((o) => o.id), 'stealth', 'steady', {});
    assert.ok(s.awayJobs[0].mission.watch);
    const calledAt = [];
    for (let day = 0; day < 10 && (s.awayJobs.length || s.activeMission); day++) {
      s = advanceDay(s);
      const call = s.inbox.find((m) => m.kind === 'callin' && !m.resolved);
      if (!call) continue;
      calledAt.push(s.day);
      s = takeCall(s, call.payload.jobId);
      assert.ok(!needsPlayer(s) || s.activeMission.pending || s.activeMission.critical || M.currentStep(s.activeMission)?.type !== 'stop', 'on the line, the stop plays');
      for (let g = 0; g < 300 && s.activeMission && !s.activeMission.done && !canLetRun(s); g++) {
        const am = s.activeMission;
        if (am.critical) s = M.resolveCritical(s, 'extract');
        else if (am.pending) s = M.resolvePending(s, M.describePending(s).choices.find((c) => c.exit)?.id ?? M.describePending(s).choices[0].id);
        else if (M.currentStep(am)?.type === 'crisis' && needsPlayer(s)) s = M.chooseOption(s, carefulPolicy.crisis(M.describeCrisis(s).choices.filter((c) => c.available)).id);
        else if (M.currentStep(am)?.type === 'battle' && am.battle && !am.battle.auto && needsPlayer(s)) { am.battle.auto = true; s = autoStep(s); }
        else s = autoStep(s);
      }
      if (s.activeMission?.done) { s = M.closeMission(s); break; }
      if (s.activeMission) s = letThemRun(s);
    }
    const report = s.inbox.find((m) => m.type === 'report');
    assert.ok(report, `seed ${seed}: the report came back`);
    assert.equal(report.timeline?.result === 'loss', false, 'careful answers lose nobody');
    assert.ok(new Set(calledAt).size >= 2, `seed ${seed}: called on ${new Set(calledAt).size} different days`);
    watched++;
  }
  assert.ok(watched >= 2, `watched ${watched}`);
});
