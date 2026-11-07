// Heists (core/heists.js; DESIGN.md 2026-11-07): a contact offers one once the tong is ready; prep
// jobs each change the finale in a way its plan shows; prep that goes wrong is asked once more, can
// be bought from a fixer or done without, and never locks the finale; the finale ends it.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame, SAVE_VERSION } from '../src/core/state.js';
import { advanceDay } from '../src/core/time.js';
import { jobView, templateById } from '../src/core/jobs.js';
import { HEISTS, HEIST_RULES, heistById } from '../src/data/heists.js';
import { MISSIONS } from '../src/data/missions.js';
import { validateHeists } from '../src/core/validate.js';
import { postJobs } from '../src/core/jobs.js';
import { brokeredWork } from '../src/core/broker.js';
import { playMission, carefulPolicy } from './play.js';
import { introduceHeists, tickHeists, heistOf, heistResult, finaleWeekStart, canBuyStep, buyStep, stepPrice, heistCard, openHeist } from '../src/core/heists.js';
import { isActionable } from '../src/core/inbox.js';
import { startMission } from '../src/core/mission.js';
import { planRead } from '../src/core/squad.js';
import { intelFor, INTEL_BONUS } from '../src/core/sidetasks.js';
import { sendOff } from '../src/core/autorun.js';

globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
const { importSave } = await import('../src/save/save.js');

const RAO = heistById('raoTable');

/** A game ready for Madam Rao's heist, on a Monday. */
function ready(seed = 1) {
  const s = createNewGame({ seed, startCrew: 'fresh' });
  s.inbox = [];
  s.reputation = RAO.gate.rep;
  s.cash = 30000;
  return s;
}
const prepJob = (s, step) => s.jobs.find((j) => j.id === heistOf(s, 'raoTable').steps[step].jobId);
const finale = (s) => s.jobs.find((j) => j.id === heistOf(s, 'raoTable').finaleJobId);
/** Jump to the finale's week and let the tick post it. */
function toFinaleWeek(s) {
  s.day = finaleWeekStart(heistOf(s, 'raoTable'));
  tickHeists(s);
  return finale(s);
}

test('the heists are sound content: real jobs, real crises, two templates a step', () => {
  assert.deepEqual(validateHeists(HEISTS, MISSIONS), []);
  assert.equal(HEISTS[0].id, 'raoTable', "Madam Rao's is the first, the end of the early game");
  assert.ok(RAO.gate.rep <= 15 && RAO.gate.halls === 1, 'early: before a second hall');
  assert.ok(templateById(RAO.finale).threat + RAO.threatDelta <= 3, 'gentler than the mid-game heist');
  const tower = heistById('szetoTower');
  assert.ok(tower.gate.halls === 3 && tower.gate.rep >= 60, 'mid-game: three halls');
  assert.ok(validateHeists([{ ...RAO, prep: [{ ...RAO.prep[0], effect: { drop: 'nope' } }] }], MISSIONS).length, 'a crisis the finale lacks is caught');
});

test('not before the gate; then on a Monday, once: three prep jobs on the board until the finale week', () => {
  const s = ready();
  s.reputation = RAO.gate.rep - 1;
  introduceHeists(s);
  assert.equal(heistOf(s, 'raoTable'), null, 'reputation too low');
  s.reputation = RAO.gate.rep;
  introduceHeists(s);
  const h = heistOf(s, 'raoTable');
  assert.equal(h.status, 'open');
  assert.equal(h.finaleDay, s.day + RAO.weeks * 7 - 1);
  for (const step of RAO.prep) {
    const job = prepJob(s, step.id);
    assert.equal(job.templateId, step.templates[0]);
    assert.equal(job.clientId, 'rao');
    assert.equal(job.expiresDay, finaleWeekStart(h) - 1, 'prep is done before the finale week');
    assert.deepEqual(jobView(s, job).heistStep, { heist: 'raoTable', step: step.id }, 'the board can flag it');
  }
  const msg = s.inbox.find((m) => m.kind === 'heist');
  assert.match(msg.subject, /Madam Rao has a big one/);
  assert.ok(isActionable(s, msg), 'the offer stays in the inbox while the heist is on');
  introduceHeists(s);
  assert.equal(s.jobs.filter((j) => j.heistStep).length, 3, 'offered once');
});

test('one heist at a time, even when the next one is ready too', () => {
  const s = ready();
  s.reputation = 80;
  s.halls.push({ district: 'docks', beds: 2, rent: 600, level: 1, opened: 1, build: [] }, { district: 'basin', beds: 2, rent: 600, level: 1, opened: 1, build: [] });
  introduceHeists(s);
  assert.ok(openHeist(s));
  introduceHeists(s);
  assert.equal(Object.keys(s.heists).length, 1);
  heistResult(s, toFinaleWeek(s).id, 'completed');
  s.day += 1; // the next Monday
  introduceHeists(s);
  assert.equal(heistOf(s, 'szetoTower')?.status, 'open', 'the next one follows once the first is over');
});

test("nothing prepared: the finale still goes up, at its full danger and pay", () => {
  const s = ready();
  introduceHeists(s);
  const job = toFinaleWeek(s);
  const v = jobView(s, job);
  assert.equal(v.threat, templateById('casino').threat + RAO.threatDelta);
  assert.equal(v.pay, RAO.pay, 'the heist pays its own price (trust is neutral here)');
  assert.deepEqual(v.drop, []);
  assert.equal(v.inside, null);
  assert.equal(job.expiresDay, heistOf(s, 'raoTable').finaleDay, 'on the board for its week');
  assert.ok(s.inbox.some((m) => /the finale is on/.test(m.subject) && /Nothing was prepared/.test(m.body)));
});

test('each step done changes the finale, and the plan shows exactly what the run uses', () => {
  let s = ready(3);
  introduceHeists(s);
  for (const step of RAO.prep) assert.match(heistResult(s, prepJob(s, step.id).id, 'completed')[0].text, /In the finale's plan/);
  const job = toFinaleWeek(s);
  const v = jobView(s, job);
  assert.equal(v.threat, templateById('casino').threat + RAO.threatDelta - 1, 'one step less dangerous');
  assert.deepEqual(v.drop, ['pit_boss']);
  assert.equal(v.inside, "Rao's casino briefing");
  assert.equal(heistCard(s).prepared, 3);
  // The plan's intel is the run's intel.
  const crew = s.crew.slice(0, 3);
  const read = planRead(s, job, { crew, approach: 'stealth' });
  assert.ok(read.cov.rows.some((r) => r.handler?.notes.some((n) => n === "intel from Rao's casino briefing +1")), 'the plan counts the intel');
  for (let seed = 1; seed <= 40; seed++) {
    const t = structuredClone(s);
    t.rngCounter = seed * 7;
    const run = startMission(t, job.id, crew.map((o) => o.id), 'stealth');
    const am = run.activeMission;
    assert.ok(!am.queue.some((q) => q.type === 'crisis' && q.id === 'pit_boss'), 'a dropped crisis never comes up');
    assert.equal(am.threat, v.threat);
    assert.equal(am.pay, v.pay);
    assert.deepEqual(intelFor(run, 'nightMarket', am.inside), { bonus: INTEL_BONUS, source: "Rao's casino briefing" });
  }
});

test('a step that goes wrong is asked once more with another job, then can be bought or done without', () => {
  const s = ready(4);
  introduceHeists(s);
  const step = RAO.prep[1];
  const first = prepJob(s, step.id);
  s.jobs = s.jobs.filter((j) => j !== first); // taken, as startMission does
  const lines = heistResult(s, first.id, 'aborted');
  assert.match(lines[0].text, /another job for it on the board/);
  const retry = prepJob(s, step.id);
  assert.equal(retry.templateId, step.templates[1], 'the retry is a different job');
  assert.equal(heistOf(s, 'raoTable').steps[step.id].status, 'asked');
  s.jobs = s.jobs.filter((j) => j !== retry);
  assert.match(heistResult(s, retry.id, 'loss')[0].text, /bought from a fixer, or done without/);
  assert.equal(heistOf(s, 'raoTable').steps[step.id].status, 'failed');
  tickHeists(s);
  assert.ok(!s.jobs.some((j) => j.heistStep?.step === step.id), 'no third ask');
  // Buying it: the price is a share of that job's pay, and the effect counts.
  const price = stepPrice(RAO, heistOf(s, 'raoTable'), step.id);
  assert.equal(price, Math.round((templateById(step.templates[1]).pay * HEIST_RULES.fixerShare) / 50) * 50);
  assert.equal(canBuyStep(s, 'raoTable', RAO.prep[0].id).ok, false, 'only a step that went wrong');
  const poor = { ...structuredClone(s), cash: price - 1 };
  assert.equal(canBuyStep(poor, 'raoTable', step.id).ok, false);
  const t = buyStep(s, 'raoTable', step.id);
  assert.equal(t.cash, s.cash - price);
  assert.equal(heistOf(t, 'raoTable').steps[step.id].status, 'bought');
  assert.deepEqual(jobView(t, toFinaleWeek(t)).drop, ['pit_boss'], 'bought counts as done');
  assert.ok(t.inbox.some((m) => m.body?.startsWith(step.fixer.confirmation)), 'the fixer\'s own words');
  // Done without: the finale still goes up, just without it.
  assert.deepEqual(jobView(s, toFinaleWeek(s)).drop, []);
});

test('prep left on the board counts as walked away; too late for a retry means done without', () => {
  const s = ready(5);
  introduceHeists(s);
  const h = heistOf(s, 'raoTable');
  s.jobs = s.jobs.filter((j) => j.id !== h.steps.faces.jobId); // gone off the board early
  tickHeists(s);
  assert.equal(h.steps.faces.status, 'asked', 'asked again at once');
  assert.equal(prepJob(s, 'faces').templateId, RAO.prep[0].templates[1]);
  s.day = finaleWeekStart(h) - 1;
  s.jobs = s.jobs.filter((j) => !j.heistStep); // everything ignored
  tickHeists(s);
  assert.ok(RAO.prep.every((p) => h.steps[p.id].status === 'failed'), 'no time left to ask again');
  assert.equal(s.jobs.filter((j) => j.heistStep).length, 0);
});

test('the finale: done is done (and reputation), walked away is over, left unplayed is missed', () => {
  const a = ready(6);
  introduceHeists(a);
  const rep = a.reputation;
  assert.match(heistResult(a, toFinaleWeek(a).id, 'completed')[0].text, /is done/);
  assert.equal(heistOf(a, 'raoTable').status, 'done');
  assert.equal(a.reputation, rep + HEIST_RULES.rep);
  assert.ok(!isActionable(a, a.inbox.find((m) => m.kind === 'heist' && !m.payload.jobId)), 'the offer can go from the inbox now');

  const b = ready(6);
  introduceHeists(b);
  heistResult(b, toFinaleWeek(b).id, 'aborted');
  assert.equal(heistOf(b, 'raoTable').status, 'failed');

  const c = ready(6);
  introduceHeists(c);
  toFinaleWeek(c);
  c.day = heistOf(c, 'raoTable').finaleDay + 1;
  c.jobs = c.jobs.filter((j) => j.expiresDay >= c.day);
  tickHeists(c);
  assert.equal(heistOf(c, 'raoTable').status, 'missed');
  assert.ok(c.inbox.some((m) => /the night has gone/.test(m.subject)));
});

test('a real run: a prep job sent away comes back done or not, and the report says which', () => {
  let s = ready(7);
  introduceHeists(s);
  const job = prepJob(s, 'faces');
  s = sendOff(s, job.id, s.crew.slice(0, 2).map((o) => o.id), 'stealth', 'steady', { callIn: 'never' });
  for (let i = 0; i < 10 && (s.awayJobs ?? []).length; i++) {
    s = advanceDay(s);
    for (const m of s.inbox) if (m.blocking) { m.blocking = false; m.resolved = true; }
  }
  const report = s.inbox.find((m) => m.type === 'report' && m.subject.includes(templateById(RAO.prep[0].templates[0]).name));
  assert.ok(report, 'the job came back');
  const done = report.timeline.result === 'completed';
  const st = heistOf(s, 'raoTable').steps.faces.status;
  assert.equal(st === 'done', done);
  assert.match(report.body, done ? /The Big Table: Build a verified briefing/ : /prep didn't come off/);
});

test('a v46 save gets an empty heist list, and the first ready Monday offers one', async () => {
  const s = createNewGame({ seed: 1, startCrew: 'fresh' });
  s.version = 46;
  delete s.heists;
  s.reputation = RAO.gate.rep;
  const up = await importSave({ text: async () => JSON.stringify(s) });
  assert.equal(up.version, SAVE_VERSION);
  assert.deepEqual(up.heists, {});
  let t = up;
  for (let i = 0; i < 8; i++) t = advanceDay(t);
  assert.equal(heistOf(t, 'raoTable')?.status, 'open');
});

test("Rao's six prep jobs are hers alone: never dealt at random, brokered or listed", () => {
  const ids = RAO.prep.flatMap((p) => p.templates);
  assert.equal(new Set(ids).size, 6);
  for (const id of ids) assert.equal(templateById(id).heistOnly, 'raoTable', id);
  const s = createNewGame({ seed: 9, startCrew: 'fresh' });
  s.reputation = 100;
  for (let i = 0; i < 60; i++) { s.jobs = []; postJobs(s, 5); assert.ok(s.jobs.every((j) => !templateById(j.templateId).heistOnly)); }
  for (const d of ['nightMarket', 'oldTown', 'docks']) assert.ok(brokeredWork(d).every((m) => !m.heistOnly));
});

test("the Hei Lok is no gang's room: Rao's finale, and Casino Con itself, add no grudge", () => {
  assert.equal(templateById('casino').against, undefined);
  for (let seed = 1, done = 0; seed <= 30 && done < 2; seed++) {
    let s = ready(seed);
    introduceHeists(s);
    s = startMission(s, toFinaleWeek(s).id, s.crew.slice(0, 3).map((o) => o.id), 'stealth');
    s = playMission(s, carefulPolicy).state;
    if (s.activeMission.result.outcome !== 'completed') continue;
    done += 1;
    assert.deepEqual(Object.values(s.grudges ?? {}).filter((n) => n > 0), [], `seed ${seed}`);
  }
});
