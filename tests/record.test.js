// Runner record (renown slice 1, 2026-11). Counters only: nothing here changes a roll, pay or heat.
// Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame, SAVE_VERSION } from '../src/core/state.js';
import * as M from '../src/core/mission.js';
import { addOffer } from '../src/core/jobs.js';
import { advanceDay } from '../src/core/time.js';
import { freshRecord, recordOf, levelOf, seedRecord } from '../src/core/record.js';
import { playMission, carefulPolicy } from './play.js';

globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
const { importSave } = await import('../src/save/save.js');

const game = (seed = 1) => createNewGame({ seed, startCrew: 'fresh' });
function run(s, jobTemplate, crewIds, approach = 'stealth') {
  s.jobs = []; addOffer(s, jobTemplate);
  s = M.startMission(s, s.jobs[0].id, crewIds, approach);
  s = playMission(s, carefulPolicy).state;
  return s;
}

test('a finished job gives everyone on it a record; nobody else gets one', () => {
  let s = game(3); const [a, b, c] = s.crew;
  s = run(s, 'container409', [a.id, b.id]);
  const ra = s.crew.find((o) => o.id === a.id).record, rc = s.crew.find((o) => o.id === c.id).record;
  assert.equal(ra.jobs, 1);
  assert.ok(ra.with[b.id] === 1);
  assert.equal(rc, undefined);
  assert.equal(recordOf(s.crew.find((o) => o.id === c.id)).jobs, 0); // a blank one, not stored
});

test('wins, clean, flawless and the streak follow the outcome', () => {
  let s = game(4); const ids = s.crew.slice(0, 2).map((o) => o.id);
  s = run(s, 'container409', ids, 'stealth');
  const am = s.activeMission, r = s.crew.find((o) => o.id === ids[0]).record;
  if (am.result.outcome === 'completed') {
    assert.equal(r.wins, 1);
    if (!am.wentLoud && am.result.heatGain === 0) { assert.equal(r.clean, 1); assert.equal(r.cleanStreak, 1); }
  } else assert.equal(r.wins, 0);
  assert.ok(r.bestCleanStreak >= r.cleanStreak);
});

test('going loud is never clean and resets the streak', () => {
  let s = game(5); const ids = s.crew.slice(0, 2).map((o) => o.id);
  s.crew.find((o) => o.id === ids[0]).record = { ...freshRecord(), jobs: 3, clean: 3, cleanStreak: 3, bestCleanStreak: 3 };
  s = run(s, 'container409', ids, 'loud');
  const r = s.crew.find((o) => o.id === ids[0]).record;
  assert.equal(r.cleanStreak, 0);
  assert.equal(r.bestCleanStreak, 3);
  assert.equal(r.clean, 3);
});

test('at level follows the runner tier and the job threat', () => {
  assert.deepEqual(['rookie', 'pro', 'veteran'].map((tier) => levelOf({ tier })), [1, 2, 3]);
  let s = game(6); const op = s.crew[0]; op.tier = 'veteran';
  s = run(s, 'container409', [op.id, s.crew[1].id]); // a threat-1 job
  assert.equal(s.crew.find((o) => o.id === op.id).record.atLevel, 0);
  assert.equal(s.crew.find((o) => o.id === s.crew[1].id).record.atLevel, 1);
});

test('freelancers get no record', () => {
  let s = game(7);
  s.freelancers = s.freelancers ?? [];
  const f = s.freelancers[0];
  assert.ok(f, 'expected a freelancer on the board');
  s = run(s, 'container409', [s.crew[0].id, f.id]);
  assert.equal(s.crew.find((o) => o.id === f.id)?.record, undefined); // they stay on the books until closeMission
});

test('a hands-off run updates the record like a live one', async () => {
  const { sendOff, returnCrews } = await import('../src/core/autorun.js');
  let s = game(8); s.jobs = []; addOffer(s, 'container409');
  const ids = s.crew.slice(0, 2).map((o) => o.id);
  s = sendOff(s, s.jobs[0].id, ids, 'stealth', 'steady');
  for (let i = 0; i < 6 && s.awayJobs.length; i++) s = advanceDay(s);
  assert.equal(s.awayJobs.length, 0);
  assert.equal(s.crew.find((o) => o.id === ids[0]).record.jobs, 1);
});

test('active weeks: a week with a job counts on Sunday, an idle week does not', () => {
  let s = game(9); const a = s.crew[0];
  a.record = { ...freshRecord(), jobs: 1, lastJobDay: s.day };
  let guard = 0;
  while (s.crew[0].record.activeWeeks === 0 && guard++ < 8) s = advanceDay(s);
  assert.equal(s.crew[0].record.activeWeeks, 1);
  for (let i = 0; i < 14; i++) s = advanceDay(s);
  assert.equal(s.crew[0].record.activeWeeks, 1); // two idle Sundays added nothing
});

test('the dead go to the memorial with a short record summary', () => {
  let found = null;
  for (let seed = 1; seed <= 80 && !found; seed++) {
    let s = game(seed); const [a, b] = s.crew;
    s.jobs = []; addOffer(s, 'container409');
    s = M.startMission(s, s.jobs[0].id, [a.id, b.id], 'stealth');
    s.activeMission.untreated = [a.id]; // left bleeding in the van: a push-on
    s.activeMission.queue = [{ type: 'beat', index: 0 }]; s.activeMission.step = 0;
    s = M.revealBeat(s);
    if (s.memorial.length) found = { s, id: a.id };
  }
  assert.ok(found, 'expected a death within 80 seeds');
  const m = found.s.memorial[0];
  assert.equal(m.id, found.id);
  assert.ok(m.record && m.record.jobs === 1);
  assert.deepEqual(Object.keys(m.record).sort(), ['activeWeeks', 'bestCleanStreak', 'carries', 'clean', 'jobs', 'wins']);
  assert.equal(found.s.crew.some((o) => o.id === found.id), false);
});

test('carries need a hard, successful crisis roll on a job at their level', () => {
  let s = game(10); const [a, b] = s.crew;
  s.jobs = []; addOffer(s, 'container409');
  s = M.startMission(s, s.jobs[0].id, [a.id, b.id], 'stealth');
  s.activeMission.events = [
    { kind: 'roll', actor: { id: a.id, handle: a.handle }, stat: 'stealth', difficulty: 6, success: true },
    { kind: 'roll', actor: { id: a.id, handle: a.handle }, stat: 'stealth', difficulty: 3, success: true },   // too easy
    { kind: 'roll', actor: { id: a.id, handle: a.handle }, stat: 'cool', difficulty: 7, success: false },     // failed
    { kind: 'roll', incident: 'lock', actor: { id: a.id, handle: a.handle }, stat: 'tech', difficulty: 9, success: true }, // incident
    { kind: 'exit', actor: { id: a.id, handle: a.handle }, stat: 'cool', difficulty: 8, success: true },
  ];
  s.activeMission.queue = [{ type: 'beat', index: 0 }]; s.activeMission.step = 0;
  s = M.revealBeat(s);
  assert.ok(s.activeMission.done);
  const r = s.crew.find((o) => o.id === a.id).record;
  assert.equal(r.carries, 1);
  assert.deepEqual(r.carriesByStat, { stealth: 1 });
});

test('a v29 save upgrades: those who have worked get an estimated record, others none', () => {
  const s = game(11); s.version = 29;
  s.crew[0].jobsWithCrew = 10; s.crew[1].jobsWithCrew = 0;
  for (const o of s.crew) delete o.record;
  s.memorial.push({ id: 'x', name: 'X', handle: 'x', role: 'tech', color: '#000', age: 30, marks: [], day: 5, cause: 'test' });
  const up = importSave({ text: () => Promise.resolve(JSON.stringify(s)) });
  return up.then((r) => {
    const st = r.state ?? r;
    assert.equal(st.version, SAVE_VERSION);
    const r0 = st.crew[0].record;
    assert.equal(r0.jobs, 10); assert.equal(r0.estimated, true);
    assert.equal(st.crew[1].record.estimated, false);
    assert.equal(st.memorial[0].record, null);
  });
});

test('seedRecord leaves an existing record alone', () => {
  const op = { jobsWithCrew: 9, record: { ...freshRecord(), jobs: 2 } };
  seedRecord(op, { today: 5 });
  assert.equal(op.record.jobs, 2);
});
