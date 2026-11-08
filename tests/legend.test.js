// The Legend defining job (renown slice 5; part B of drafts/PROPOSAL-phase-3.md). Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame, SAVE_VERSION } from '../src/core/state.js';
import { advanceDay } from '../src/core/time.js';
import { freshRecord } from '../src/core/record.js';
import { legendEligible, fameOf, weeklyFame, afterJobFame } from '../src/core/fame.js';
import { legendTick, legendResult, definingTemplates, isLegend } from '../src/core/legend.js';
import { jobView, namedCandidate, addOffer, templateById } from '../src/core/jobs.js';
import { recruitQualities } from '../src/core/recruits.js';
import { LEGEND } from '../src/data/legend.js';
import * as M from '../src/core/mission.js';
import { playMission, carefulPolicy } from './play.js';

globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
const { importSave } = await import('../src/save/save.js');

const game = (seed = 1) => { const s = createNewGame({ seed, startCrew: 'fresh' }); s.reputation = 80; return s; };
/** Make someone meet every Legend condition (Ghost path). */
function ready(op, extra = {}) {
  op.tier = 'veteran'; op.fame = 'elite'; op.standing = 80;
  op.record = { ...freshRecord(), jobs: 200, atLevel: 130, wins: 120, clean: 60, bestCleanStreak: 12, activeWeeks: 40, ...extra };
  return op;
}
const withDefining = (s, op) => { legendTick(s); return s.jobs.find((j) => j.defining === op.id); };

test('a ready runner is asked for by name: one defining job on the board, threat 3-4, a step harder, half again the pay', () => {
  const s = game(3);
  const op = ready(s.crew[0]);
  assert.equal(legendEligible(op), true);
  const before = s.inbox.length;
  const job = withDefining(s, op);
  assert.ok(job, 'a defining offer is on the board');
  const tpl = templateById(job.templateId);
  assert.ok(LEGEND.threats.includes(tpl.threat), `a threat ${tpl.threat} template`);
  assert.ok(definingTemplates(s).some((m) => m.id === tpl.id), 'one the board could already deal');
  assert.equal(job.payMult, 1.5);
  assert.equal(job.expiresDay, s.day + 7);
  const v = jobView(s, job);
  assert.equal(v.threat, tpl.threat + 1, "the risk read includes the defining job's step up");
  assert.equal(v.defining, op.id);
  assert.equal(op.legendCall.offerId, job.id);
  assert.equal(s.inbox.length, before + 1, 'one message');
  const rngBefore = s.rngCounter;
  legendTick(s);
  assert.equal(s.jobs.filter((j) => j.defining).length, 1, 'only one defining job at a time');
  assert.equal(s.rngCounter, rngBefore, 'no roll moves');
});

test('only ready runners, never freelancers, never a Legend already', () => {
  const s = game(4);
  legendTick(s);
  assert.equal(s.jobs.some((j) => j.defining), false, 'nobody is ready');
  const a = ready(s.crew[0]); a.freelance = true;
  legendTick(s);
  assert.equal(s.jobs.some((j) => j.defining), false, 'a freelancer is not asked');
  a.freelance = false; a.legend = { day: 1, path: 'ghost', jobId: 'x' }; a.fame = 'legend';
  legendTick(s);
  assert.equal(s.jobs.some((j) => j.defining), false, 'a Legend is not asked again');
});

test('two ready runners: the one the street rates higher goes first', () => {
  const s = game(5);
  const a = ready(s.crew[0]); const b = ready(s.crew[1]); a.standing = 70; b.standing = 90;
  legendTick(s);
  assert.equal(s.jobs.find((j) => j.defining).defining, b.id);
});

test('a defining job done with them on the crew makes them a Legend, for good', () => {
  const s = game(6);
  const op = ready(s.crew[0]);
  const job = withDefining(s, op);
  const am = { defining: op.id, jobId: job.id };
  const lines = legendResult(s, am, { outcome: 'completed', deaths: [], onJobIds: [op.id], jobName: 'the job' });
  assert.equal(op.fame, 'legend');
  assert.equal(op.legend.jobId, job.id);
  assert.equal(op.legend.path, 'ghost');
  assert.ok(lines[0].text.startsWith('Legend:'));
  assert.ok(op.record.highlights.some((h) => h.id === 'legend'));
  assert.ok(s.inbox.some((m) => m.id.startsWith('legend-earned')));
  assert.equal(isLegend(op), true);
  // Never lost: Sundays, jobs and a long bench change nothing.
  op.standing = 0;
  for (let i = 0; i < 6; i++) { s.day += 7; weeklyFame(s); }
  afterJobFame(s, [op], { outcome: 'loss', facts: {}, milestones: [], retreat: false });
  assert.equal(fameOf(op), 'legend');
  assert.equal(legendEligible(op), false);
});

test('a failure, an abort, or sending it without them: the city asks again in four weeks, with no limit', () => {
  for (const [outcome, onJob] of [['loss', true], ['aborted', true], ['completed', false]]) {
    const s = game(7);
    const op = ready(s.crew[0]);
    const job = withDefining(s, op);
    s.jobs = s.jobs.filter((j) => j !== job);
    const lines = legendResult(s, { defining: op.id, jobId: job.id }, { outcome, deaths: [], onJobIds: onJob ? [op.id] : [], jobName: 'the job' });
    assert.equal(op.legend ?? null, null);
    assert.equal(op.legendCall.tries, 1);
    assert.equal(op.legendCall.retryDay, s.day + 28);
    assert.equal(op.legendCall.offerId, null);
    assert.ok(lines.length === 1);
    legendTick(s);
    assert.equal(s.jobs.some((j) => j.defining), false, 'not before the four weeks are up');
    s.day += 28;
    legendTick(s);
    const again = s.jobs.find((j) => j.defining);
    assert.ok(again, 'asked again');
    assert.equal(op.legendCall.tries, 1);
  }
});

test('an offer that expires unplayed counts as a try, and the city asks again in four weeks', () => {
  let s = game(8);
  const op = ready(s.crew[0]);
  const job = withDefining(s, op);
  assert.ok(job);
  while (s.day <= job.expiresDay + 1) s = advanceDay(s);
  const live = s.crew.find((o) => o.id === op.id);
  assert.equal(live.legendCall.tries >= 1, true);
  assert.equal(s.jobs.some((j) => j.id === job.id), false);
  assert.ok(live.legendCall.retryDay > job.expiresDay);
});

test('a death on the defining job makes them a Legend for good, and the memorial says so', () => {
  const s = game(9);
  const op = ready(s.crew[0]);
  const job = withDefining(s, op);
  s.crew = s.crew.filter((o) => o.id !== op.id);
  s.memorial.push({ id: op.id, name: op.name, handle: op.handle, role: op.role, day: s.day, cause: 'Died of wounds' });
  const lines = legendResult(s, { defining: op.id, jobId: job.id }, { outcome: 'loss', deaths: [op], onJobIds: [], jobName: 'the job' });
  const entry = s.memorial.find((m) => m.id === op.id);
  assert.equal(entry.legend.posthumous, true);
  assert.equal(entry.fame, 'legend');
  assert.ok(lines[0].text.startsWith('Legend:'));
});

test('a heist finale is the defining job when a heist is open and a ready runner can go', () => {
  const s = game(10);
  const op = ready(s.crew[0]);
  addOffer(s, 'casino', { clientId: 'rao' });
  const fin = s.jobs.at(-1);
  fin.heist = 'raoTable';
  s.heists = { raoTable: { status: 'open', offeredDay: 1, finaleDay: 9, finaleJobId: fin.id, steps: {} } };
  const before = s.jobs.length;
  legendTick(s);
  assert.equal(fin.defining, op.id, 'the finale is their moment');
  assert.equal(s.jobs.length, before, 'no separate offer');
  assert.notEqual(fin.payMult, LEGEND.payMult, 'the finale keeps its own pay');
  assert.ok(s.inbox.some((m) => m.id.startsWith('legend-callFinale')));
});

test('while a heist is open but its finale is not up, a ready runner waits for it', () => {
  const s = game(11);
  ready(s.crew[0]);
  s.heists = { raoTable: { status: 'open', offeredDay: 1, finaleDay: 20, finaleJobId: null, steps: {} } };
  legendTick(s);
  assert.equal(s.jobs.some((j) => j.defining), false);
});

test('a Legend still gets named offers and brings better recruits', () => {
  const s = game(12);
  const op = s.crew[0];
  op.fame = 'legend'; op.standing = 80;
  assert.equal(namedCandidate(s)?.id, op.id);
  const plain = recruitQualities(game(12)).map((q) => q.weight);
  assert.notDeepEqual(recruitQualities(s).map((q) => q.weight), plain);
});

test('a real run: the defining job goes through finish() and the call resolves one way or the other', () => {
  let s = game(13);
  const op = ready(s.crew[0]);
  const job = withDefining(s, op);
  const crew = s.crew.slice(0, Math.min(s.crew.length, templateById(job.templateId).crewSize)).map((o) => o.id);
  if (!crew.includes(op.id)) crew[0] = op.id;
  s = M.startMission(s, job.id, [...new Set(crew)], 'stealth');
  assert.equal(s.activeMission.defining, op.id);
  const done = playMission(s, carefulPolicy).state;
  const after = done.crew.find((o) => o.id === op.id);
  const dead = done.memorial.find((m) => m.id === op.id);
  if (after) assert.ok(after.legend || after.legendCall.tries === 1, 'a Legend, or asked again');
  else assert.equal(dead.legend.posthumous, true);
});

test('a v51 save upgrades: runners get legend and legendCall', async () => {
  const s = game(14);
  for (const o of s.crew) { delete o.legend; delete o.legendCall; }
  s.version = 51;
  const loaded = await importSave({ text: async () => JSON.stringify(s) });
  assert.equal(loaded.version, SAVE_VERSION);
  assert.ok(loaded.crew.every((o) => o.legend === null && o.legendCall === null));
});
