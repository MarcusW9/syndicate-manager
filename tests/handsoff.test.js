// Hands-off runs and the recorded job (mission logs, first slice, 2026-10-26). Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame, SAVE_VERSION } from '../src/core/state.js';
import * as M from '../src/core/mission.js';
import { addOffer, templateById } from '../src/core/jobs.js';
import { autoRun, ORDERS } from '../src/core/autorun.js';
import { REPORT_LOGS_KEPT } from '../src/core/report.js';
import { MISSIONS } from '../src/data/missions.js';
import { playMission, carefulPolicy } from './play.js';

globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
const { importSave } = await import('../src/save/save.js');

/** A fresh game with one offer of this job, crewed by the first n people, sent hands-off. */
function sendOff(seed, templateId, orders, { n } = {}) {
  let s = createNewGame({ seed, startCrew: 'fresh' });
  s.jobs = [];
  addOffer(s, templateId);
  const size = n ?? templateById(templateId).crewSize;
  s = M.startMission(s, s.jobs[0].id, s.crew.slice(0, size).map((o) => o.id), 'stealth');
  const done = autoRun(s, orders);
  return { done, report: done.inbox.find((m) => m.type === 'report') };
}

const rookieJobs = MISSIONS.filter((m) => m.rookie).map((m) => m.id);

test('a hands-off crew never pushes on and never loses anyone, under any orders', () => {
  for (let seed = 1; seed <= 120; seed++) {
    for (const orders of Object.keys(ORDERS)) {
      const { done, report } = sendOff(seed, rookieJobs[seed % rookieJobs.length], orders, { n: 1 }); // short-handed: more failures
      assert.equal(done.activeMission.done, true);
      assert.deepEqual(done.activeMission.result.deaths, [], `seed ${seed} ${orders}`);
      assert.ok(!report.timeline.events.some((e) => e.kind === 'critical' && e.action === 'push'), 'never pushes on');
      assert.equal(report.timeline.orders, orders);
      // The numbered timeline is the report lines, one per choice taken: none may go missing.
      // Incidents, saves and decisions are taken too (the squad run, 2026-10-27), and fights (slice 6).
      const taken = report.timeline.events.filter((e) => ['roll', 'sure', 'exit', 'save', 'decision', 'battle'].includes(e.kind) && e.report).map((e) => e.report);
      assert.deepEqual(report.timeline.steps, taken, `seed ${seed} ${orders}: timeline matches the record`);
    }
  }
});

test('even the harder jobs, short-handed and on Committed orders, bring everyone home', () => {
  for (let seed = 1; seed <= 60; seed++) {
    for (const id of ['kidnap', 'penthouse', 'warehouse']) {
      const { done } = sendOff(seed, id, 'committed', { n: 1 });
      assert.deepEqual(done.activeMission.result.deaths, [], `${id} seed ${seed}`);
    }
  }
});

test('every pick on a hands-off run says why', () => {
  for (let seed = 1; seed <= 40; seed++) {
    const { report } = sendOff(seed, 'container409', 'steady');
    for (const e of report.timeline.events.filter((x) => ['roll', 'sure', 'exit', 'critical', 'save', 'decision'].includes(x.kind))) {
      assert.ok(e.why, `seed ${seed}: ${e.kind} ${e.choice ?? e.action} has no reason`);
    }
  }
});

test('the record matches the dice: die + value against need decides every roll', () => {
  for (let seed = 1; seed <= 80; seed++) {
    const { report } = sendOff(seed, rookieJobs[seed % rookieJobs.length], 'committed');
    for (const e of report.timeline.events.filter((x) => x.kind === 'roll')) {
      assert.equal(e.die + e.value >= e.need, e.success, `seed ${seed} ${e.crisis}`);
      assert.ok(e.die >= 1 && e.die <= 20);
    }
  }
});

test('a choice names the person who actually rolls (and who gets hurt)', () => {
  let checked = 0;
  for (let seed = 1; seed <= 150; seed++) {
    const { done, report } = sendOff(seed, rookieJobs[seed % rookieJobs.length], 'committed');
    const tpl = templateById(done.activeMission.templateId);
    for (const e of report.timeline.events.filter((x) => x.kind === 'roll')) {
      const crisis = tpl.crises.find((c) => c.id === e.crisis);
      if (!crisis) continue;
      const choice = crisis.choices.find((c) => c.id === e.choiceId);
      // Focus-role crises too, since 2026-10-27 (owner's feedback: "Flicker braced it" when Thimble rolled).
      if (choice.label.includes('{op}')) {
        assert.ok(e.choice.includes(e.actor.handle), `${e.crisis}: "${e.choice}" should name ${e.actor.handle}`);
        checked += 1;
      }
      // A focus crisis whose choice never names anyone hurts the person it's about (the tech with the nosebleed).
      const aboutFocus = crisis.focusRole && ![choice.label, choice.success, choice.failure, choice.report?.success, choice.report?.failure].some((t) => t?.includes('{op}'));
      if (e.injury && !aboutFocus) assert.equal(e.injury.id, e.actor.id, `${e.crisis}: the roller takes the hurt`);
    }
  }
  assert.ok(checked > 50, `checked ${checked} choices`);
});

test('the summary only claims what the record shows', () => {
  for (let seed = 1; seed <= 100; seed++) {
    const { report } = sendOff(seed, rookieJobs[seed % rookieJobs.length], ['cautious', 'steady', 'committed'][seed % 3], { n: 1 + (seed % 2) });
    const { events, summary } = report.timeline;
    if (summary.turning) assert.ok(events[summary.turning.event], 'turning point is a recorded event');
    if (summary.standout) {
      const who = summary.standout.text.split(':')[0];
      assert.ok(events.some((e) => e.kind === 'roll' && e.success && e.actor.handle === who), `standout ${who} made a roll work`);
    }
    const failed = events.some((e) => e.kind === 'roll' && !e.success);
    const paid = events.some((e) => e.kind !== 'exit' && (e.choiceCost?.payCut ?? 0) > 0);
    if (!failed && !paid) assert.deepEqual(summary.hurt.filter((h) => !h.includes('whatever the roll')), [], 'nothing hurt, nothing listed');
    if (summary.introKind === 'clean') assert.ok(!failed && !paid);
    assert.ok(summary.intro, 'Joss always opens the report');
  }
});

test('Cautious walks away more often than Committed', () => {
  const aborts = (orders) => {
    let n = 0;
    for (let seed = 1; seed <= 150; seed++) if (sendOff(seed, rookieJobs[seed % rookieJobs.length], orders, { n: 1 }).done.activeMission.aborted) n += 1;
    return n;
  };
  assert.ok(aborts('cautious') > aborts('committed'));
});

test('a played job keeps its full log too, and old ones are trimmed to the last few', () => {
  let s = createNewGame({ seed: 7, startCrew: 'fresh' });
  for (let i = 0; i < REPORT_LOGS_KEPT + 3; i++) {
    s.jobs = []; addOffer(s, 'container409');
    s = M.startMission(s, s.jobs[0].id, s.crew.slice(0, 2).map((o) => o.id), 'stealth');
    s = M.closeMission(playMission(s, carefulPolicy).state);
    for (const op of s.crew) { op.condition.awayUntil = 0; op.condition.fatigue = 0; op.condition.injury = 'healthy'; op.condition.injuryDays = 0; }
  }
  const reports = s.inbox.filter((m) => m.type === 'report');
  assert.ok(reports[0].timeline.events.length, 'the newest played report has its log');
  assert.equal(reports.filter((m) => m.timeline.events).length, REPORT_LOGS_KEPT);
  assert.ok(reports.every((m) => m.timeline.summary), 'every report keeps its summary');
});

test('a v15 save with a job in progress upgrades and the job finishes with a log', async () => {
  let s = createNewGame({ seed: 8, startCrew: 'fresh' });
  s.jobs = []; addOffer(s, 'container409');
  s = M.startMission(s, s.jobs[0].id, s.crew.slice(0, 2).map((o) => o.id), 'stealth');
  delete s.activeMission.events;
  s.version = 15;
  const loaded = await importSave({ text: async () => JSON.stringify(s) });
  assert.equal(loaded.version, SAVE_VERSION);
  assert.deepEqual(loaded.activeMission.events, []);
  const done = playMission(loaded, carefulPolicy).state;
  assert.ok(done.inbox.find((m) => m.type === 'report').timeline.events.length);
});

// Timing (2026-10-26): a hands-off crew reports back when it returns, not when it's sent.
const { sendOff: send, awayJobs } = await import('../src/core/autorun.js');
const { advanceDay } = await import('../src/core/time.js');
const { upcoming } = await import('../src/core/upcoming.js');

function sentGame(seed) {
  const s = createNewGame({ seed, startCrew: 'fresh' });
  const job = s.jobs.find((j) => j.templateId === 'container409');
  const crew = s.crew.slice(0, 2).map((o) => o.id);
  // Tech: a one-day job stays one day (stealth takes a day longer; tests/incidents.test.js).
  return { before: s, after: send(s, job.id, crew, 'tech', 'steady'), crew, jobId: job.id };
}

test('sending a crew off changes nothing yet: no pay, no heat, no report; they are away and the job is gone', () => {
  for (let seed = 1; seed <= 30; seed++) {
    const { before, after, crew, jobId } = sentGame(seed);
    assert.equal(after.cash, before.cash);
    assert.equal(after.heat, before.heat);
    assert.equal(after.activeMission, null);
    assert.ok(!after.inbox.some((m) => m.type === 'report'));
    assert.ok(!after.jobs.some((j) => j.id === jobId), 'the offer is taken');
    for (const id of crew) assert.equal(after.crew.find((o) => o.id === id).condition.awayUntil, after.day + 1);
    assert.equal(awayJobs(after).length, 1);
    const up = upcoming(after);
    const due = up.find((i) => i.kind === 'report' && i.day === after.day + 1);
    assert.ok(due, 'the week ahead says when the report comes');
    assert.equal(due.names.length, 2, 'with who is bringing it');
    assert.ok(!up.some((i) => i.kind === 'back' && due.names.includes(i.name)), 'one line, not one per person');
  }
});

test('the next day the crew is back and the report, pay and heat land together', () => {
  for (let seed = 1; seed <= 30; seed++) {
    const { after, crew } = sentGame(seed);
    const next = advanceDay(after);
    const report = next.inbox.find((m) => m.type === 'report');
    assert.ok(report, `seed ${seed}: report arrived`);
    assert.equal(report.day, after.day + 1);
    assert.equal(report.read, false, 'it waits to be opened');
    assert.equal(report.timeline.orders, 'steady');
    assert.deepEqual(next.awayJobs, []);
    assert.equal(next.activeMission, null);
    for (const id of crew) {
      const op = next.crew.find((o) => o.id === id);
      assert.ok(op, 'nobody lost');
      assert.ok(op.condition.awayUntil <= next.day, 'back today, not away another day');
    }
  }
});

test('a freelancer out on a hands-off job stays with it when another job ends first', () => {
  let s = createNewGame({ seed: 31, startCrew: 'fresh' });
  const f = s.freelancers[0];
  const job = s.jobs.find((j) => j.templateId === 'container409');
  s = send(s, job.id, [s.crew[0].id, f.id], 'tech', 'steady');
  const other = s.jobs[0];
  s = M.startMission(s, other.id, s.crew.filter((o) => !o.freelance && (o.condition.awayUntil ?? 0) <= s.day).slice(0, 2).map((o) => o.id), 'stealth');
  s = M.closeMission(playMission(s, carefulPolicy).state);
  assert.ok(s.crew.some((o) => o.id === f.id), 'still on the hands-off job');
  s = advanceDay(s);
  assert.ok(!s.crew.some((o) => o.id === f.id), 'goes home once that job is done');
  assert.ok(s.inbox.find((m) => m.type === 'report' && m.timeline.orders));
});

test('a v16 save upgrades with no crews out', async () => {
  const s = createNewGame({ seed: 32, startCrew: 'fresh' });
  delete s.awayJobs;
  s.version = 16;
  const loaded = await importSave({ text: async () => JSON.stringify(s) });
  assert.equal(loaded.version, SAVE_VERSION);
  assert.deepEqual(loaded.awayJobs, []);
});

test('a crew out on a hands-off job comes back with its report after a save and load', async () => {
  const { after } = sentGame(33);
  const loaded = await importSave({ text: async () => JSON.stringify(after) });
  assert.ok(advanceDay(loaded).inbox.some((m) => m.type === 'report'));
});

test('every rookie job can be sent hands-off; bigger jobs not yet', async () => {
  const { handsOffAllowed } = await import('../src/core/autorun.js');
  for (const m of MISSIONS) assert.equal(handsOffAllowed(m), !!m.rookie, m.id);
  const s = createNewGame({ seed: 34, startCrew: 'fresh' });
  s.jobs = []; addOffer(s, 'warehouse');
  assert.equal(send(s, s.jobs[0].id, s.crew.slice(0, 3).map((o) => o.id), 'stealth', 'steady'), s, 'a big job stays hands-on');
});
