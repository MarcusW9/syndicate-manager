// Away jobs, day by day, with call-ins (core/away.js; DESIGN.md 2026-11-04). Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame, SAVE_VERSION } from '../src/core/state.js';
import { addOffer, templateById } from '../src/core/jobs.js';
import { sendOff, needsPlayer, beatsByDay, autoStep } from '../src/core/autorun.js';
import { advanceAway, takeCall, letThemRun, takeCommand, canLetRun, crewsOut, dayDone } from '../src/core/away.js';
import { advanceDay, isBlocked } from '../src/core/time.js';
import { chooseOption, crisisOdds, describePending, resolvePending, resolveCritical, closeMission, currentStep } from '../src/core/mission.js';

globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
const { importSave } = await import('../src/save/save.js');

/** A fresh game with one offer of this job, sent away with the first n crew. */
function sent(seed, templateId, callIn, { approach = 'stealth', n } = {}) {
  const s = createNewGame({ seed, startCrew: 'fresh' });
  s.jobs = [];
  addOffer(s, templateId);
  const size = n ?? templateById(templateId).crewSize;
  return sendOff(s, s.jobs[0].id, s.crew.slice(0, size).map((o) => o.id), approach, 'steady', { callIn });
}

/** Answer whatever the job on screen is calling about the careful way: exits first, extract at a critical. */
function answerCarefully(s) {
  const am = s.activeMission;
  if (am.critical) return resolveCritical(s, 'extract');
  if (am.pending) {
    const v = describePending(s);
    const out = v.choices.find((c) => c.exit) ?? v.choices.find((c) => !c.push) ?? v.choices[0];
    return resolvePending(s, out.id);
  }
  if (currentStep(am)?.type === 'crisis') {
    const odds = crisisOdds(s);
    const pick = odds.filter((o) => !o.exit).sort((a, b) => b.chance - a.chance)[0];
    return chooseOption(s, (pick && pick.chance >= 0.5 ? pick : odds.find((o) => o.exit) ?? pick).choice.id);
  }
  return autoStep(s);
}

/** Play the whole week out: take every call, answer carefully, hand the job back each night. */
function playOut(s, { command = false } = {}) {
  for (let day = 0; day < 20 && ((s.awayJobs ?? []).length || s.activeMission); day++) {
    for (let g = 0; g < 400 && s.activeMission; g++) {
      if (s.activeMission.done) { s = closeMission(s); break; }
      if (canLetRun(s)) { s = letThemRun(s); break; }
      s = needsPlayer(s) ? answerCarefully(s) : autoStep(s);
    }
    const call = s.inbox.find((m) => m.kind === 'callin' && !m.resolved);
    if (call) { s = takeCall(s, call.payload.jobId); if (command) s = takeCommand(s); continue; }
    s = advanceDay(s);
  }
  return s;
}

test('a job spreads its beats over its days, quiet days first, all of it by the last day', () => {
  assert.deepEqual([1, 2, 3].map((d) => beatsByDay(4, 3, d)), [1, 2, 4]);
  assert.deepEqual([1, 2, 3, 4, 5, 6].map((d) => beatsByDay(4, 6, d)), [0, 1, 2, 2, 3, 4], 'more days than beats: quiet days');
  assert.equal(beatsByDay(4, 1, 1), 4, 'a one-day job plays in one go');
  assert.equal(beatsByDay(4, 3, 9), 4);
});

test('a three-day job sent hands-off plays a share each day and reports on the last', () => {
  for (let seed = 1; seed <= 20; seed++) {
    let s = sent(seed, 'warehouse', 'never'); // threat 4, two days, +1 for stealth
    const back = s.awayJobs[0].returnDay;
    assert.equal(back, s.day + 3);
    s = advanceDay(s);
    if (!s.awayJobs.length) continue; // they walked away on day one: the report is in, which is fine
    const [out] = crewsOut(s);
    assert.equal(out.day, 1);
    assert.equal(out.days, 3);
    assert.ok(out.lines.length >= 1, 'Today says what they did');
    assert.ok(!s.inbox.some((m) => m.type === 'report'), 'no report yet');
    assert.ok(!isBlocked(s), 'a hands-off crew never stops the clock');
    while (s.day < back) s = advanceDay(s);
    assert.equal(s.awayJobs.length, 0, `seed ${seed}: back on day ${back}`);
    const report = s.inbox.find((m) => m.type === 'report');
    assert.ok(report);
    assert.deepEqual(s.inbox.filter((m) => m.type === 'report').length, 1);
  }
});

test('a crew calling in waits, stops the clock and asks for a call; taking it puts the job on screen', () => {
  let found = 0;
  for (let seed = 1; seed <= 30 && found < 5; seed++) {
    let s = advanceDay(sent(seed, 'warehouse', 'every'));
    const call = s.inbox.find((m) => m.kind === 'callin' && !m.resolved);
    if (!call) continue;
    found++;
    assert.ok(call.blocking, 'the call is a decision');
    assert.ok(isBlocked(s), 'Continue waits for it');
    assert.ok(s.awayJobs[0].waiting);
    assert.ok(crewsOut(s)[0].waiting);
    assert.equal(advanceAway(s).awayJobs[0].mission.step, s.awayJobs[0].mission.step, 'a waiting crew takes no more steps');
    s = takeCall(s, call.payload.jobId);
    assert.ok(s.activeMission, 'on screen');
    assert.equal(s.awayJobs.length, 0);
    assert.ok(s.inbox.find((m) => m.id === call.id).resolved);
    assert.ok(needsPlayer(s), 'at the call-in');
    assert.ok(!dayDone(s.activeMission), 'a call-in in hand is not the end of the day');
  }
  assert.ok(found >= 3, `crews called in (${found})`);
});

test('after the call, the job plays to the end of the day and can be handed back; it carries on tomorrow', () => {
  let handed = 0;
  for (let seed = 1; seed <= 30 && handed < 3; seed++) {
    let s = advanceDay(sent(seed, 'penthouse', 'every')); // four days on stealth
    const call = s.inbox.find((m) => m.kind === 'callin' && !m.resolved);
    if (!call) continue;
    s = takeCall(s, call.payload.jobId);
    for (let g = 0; g < 200 && !s.activeMission.done && !canLetRun(s); g++) s = needsPlayer(s) ? answerCarefully(s) : autoStep(s);
    if (s.activeMission.done) continue;
    s = letThemRun(s);
    handed++;
    assert.equal(s.activeMission, null);
    assert.equal(s.awayJobs.length, 1);
    assert.ok(!s.awayJobs[0].waiting);
    assert.ok(!isBlocked(s));
    const step = s.awayJobs[0].mission.step;
    s = advanceDay(s);
    const j = s.awayJobs[0];
    assert.ok(!j || j.mission.step >= step, 'it picks up where it left off');
  }
  assert.ok(handed >= 1, `handed back (${handed})`);
});

test('taking command plays the rest now, and the job ends on screen', () => {
  for (let seed = 1; seed <= 30; seed++) {
    let s = advanceDay(sent(seed, 'penthouse', 'every'));
    const call = s.inbox.find((m) => m.kind === 'callin' && !m.resolved);
    if (!call) continue;
    s = takeCommand(takeCall(s, call.payload.jobId));
    assert.ok(s.activeMission.away.command);
    for (let g = 0; g < 400 && !s.activeMission.done; g++) {
      assert.ok(!dayDone(s.activeMission), 'no end of the day under command');
      if (s.activeMission.battle && currentStep(s.activeMission)?.type === 'battle' && needsPlayer(s) && !s.activeMission.pending && !s.activeMission.critical) s.activeMission.battle.auto = true;
      s = needsPlayer(s) ? answerCarefully(s) : autoStep(s);
    }
    assert.ok(s.activeMission.done);
    s = closeMission(s);
    assert.equal(s.awayJobs.length, 0);
    assert.ok(s.inbox.some((m) => m.type === 'report'));
    return;
  }
  assert.fail('no crew called in');
});

test('away crews fight on their own unless you take command', () => {
  for (let seed = 1; seed <= 200; seed++) {
    let s = sent(seed, 'warehouse', 'risky', { approach: 'loud' });
    for (let d = 0; d < 4 && s.awayJobs.length; d++) {
      s = advanceDay(s);
      const j = s.awayJobs[0];
      if (!j?.waiting) continue;
      s.activeMission = j.mission; // look at where it stopped, without taking the call
      const am = s.activeMission;
      assert.ok(!(am.battle && currentStep(am)?.type === 'battle' && !am.pending && !am.critical), `seed ${seed}: never stops for fight orders`);
      return;
    }
  }
});

test('nobody dies on an away job unless the player chose it: careful answers bring everyone home', () => {
  for (let seed = 1; seed <= 12; seed++) {
    for (const [job, callIn] of [['warehouse', 'every'], ['penthouse', 'risky'], ['kidnap', 'every'], ['courier', 'risky']]) {
      const s0 = sent(seed, job, callIn, { n: seed % 2 ? 1 : undefined });
      const s = playOut(s0, { command: seed % 3 === 0 });
      assert.equal(s.awayJobs.length, 0, `${job} seed ${seed}: back`);
      assert.equal(s.activeMission, null);
      assert.equal(s.memorial.length, 0, `${job} seed ${seed}: nobody lost`);
    }
  }
});

test('a v34 save with a crew out upgrades and the job carries on', async () => {
  let s = sent(5, 'warehouse', 'never');
  delete s.awayJobs[0].mission.away;
  s.version = 34;
  const loaded = await importSave({ text: async () => JSON.stringify(s) });
  assert.equal(loaded.version, SAVE_VERSION);
  assert.deepEqual(loaded.awayJobs[0].mission.away, { beats: 0 });
  assert.equal(loaded.awayJobs[0].waiting, false);
  s = loaded;
  for (let i = 0; i < 6 && s.awayJobs.length; i++) s = advanceDay(s);
  assert.equal(s.awayJobs.length, 0);
  assert.ok(s.inbox.some((m) => m.type === 'report'));
});

// 2026-11-04 (crews out made visible, slice 4a): what Today's crew-out cards and back cards read.
test('a crew out says its phase, its progress through the beats and its status', async () => {
  const { phaseOf } = await import('../src/core/away.js');
  assert.equal(phaseOf({ events: [] }), 'Casing the place');
  assert.equal(phaseOf({ events: [{ kind: 'beat' }], zone: 'in' }), 'Going in');
  assert.equal(phaseOf({ events: [{ kind: 'beat' }], zone: 'target' }), 'On the job');
  assert.equal(phaseOf({ events: [{ kind: 'beat' }], zone: 'out' }), 'Getting out');
  let s = sent(3, 'penthouse', 'never');
  let [c] = crewsOut(s);
  assert.equal(c.day, 0);
  assert.equal(c.beatsDone, 0);
  assert.equal(c.beats, templateById('penthouse').beats.length);
  assert.equal(c.crewIds.length, templateById('penthouse').crewSize);
  s = advanceDay(s);
  [c] = crewsOut(s);
  if (c) {
    assert.equal(c.day, 1);
    assert.ok(c.beatsDone >= 1, 'a beat told on day one');
    assert.ok(['on', 'hurt', 'low'].includes(c.status));
  }
  const calling = Array.from({ length: 30 }, (_, i) => advanceDay(sent(i + 1, 'warehouse', 'every'))).find((x) => x.awayJobs[0]?.waiting);
  assert.equal(crewsOut(calling)[0].status, 'call');
});

test('a report remembers who went, what it paid and whether they were sent away (the back card)', () => {
  let s = sent(4, 'clinic', 'never', { approach: 'tech' });
  const ids = s.awayJobs[0].mission.crewIds;
  for (let i = 0; i < 4 && s.awayJobs.length; i++) s = advanceDay(s);
  const report = s.inbox.find((m) => m.type === 'report');
  assert.deepEqual(report.back.crewIds, ids);
  assert.equal(report.back.away, true);
  assert.equal(report.back.templateId, 'clinic');
  assert.equal(typeof report.back.pay, 'number');
});
