// Opening jobs (core/halls.js; DESIGN.md 2026-11-06): once the tong is welcome in a district, the
// contact asks a favour before offering the hall. Finish it and the hall is offered; walk away, fail
// or let it go off the board, and two weeks later they ask again with one of their own jobs.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame, SAVE_VERSION } from '../src/core/state.js';
import { advanceDay } from '../src/core/time.js';
import { canOpenHall, introduceHalls, openingOf, openingResult } from '../src/core/halls.js';
import { HALL_SITES, OPENING } from '../src/data/halls.js';
import { CLIENTS } from '../src/data/clients.js';
import { MISSIONS } from '../src/data/missions.js';
import { templateById, postJobs } from '../src/core/jobs.js';
import { adjustTrust } from '../src/core/clients.js';
import { sendOff } from '../src/core/autorun.js';

globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
const { importSave } = await import('../src/save/save.js');

/** A game where the Night Market will have us: reputation and Madam Rao's trust. */
function welcome(seed = 1) {
  const s = createNewGame({ seed, startCrew: 'fresh' });
  s.inbox = [];
  s.reputation = HALL_SITES.nightMarket.rep;
  adjustTrust(s, 'rao', HALL_SITES.nightMarket.trust - 50);
  s.cash = 30000;
  return s;
}
const opening = (s) => s.jobs.find((j) => j.id === openingOf(s, 'nightMarket')?.jobId);

test('every hall outside Old Town has its own opening job, in the game, and never dealt at random', () => {
  for (const [d, site] of Object.entries(HALL_SITES)) {
    if (site.deposit == null) { assert.equal(site.opening, undefined, `${d}: the home hall needs no favour`); continue; }
    const tpl = templateById(site.opening);
    assert.ok(tpl, `${d}: ${site.opening} exists`);
    assert.equal(tpl.opening, d);
    assert.equal(tpl.district, d);
  }
  assert.equal(MISSIONS.filter((m) => m.opening).length, 4);
  const s = createNewGame({ seed: 9, startCrew: 'fresh' });
  for (let i = 0; i < 60; i++) { s.jobs = []; postJobs(s, 3); assert.ok(s.jobs.every((j) => !templateById(j.templateId).opening), 'not on the board by chance'); }
});

test('welcome: on Monday the contact asks the favour instead of offering the hall, once', () => {
  const s = welcome();
  introduceHalls(s);
  const job = opening(s);
  assert.equal(job.templateId, 'back_rent');
  assert.equal(job.clientId, 'rao');
  assert.equal(job.expiresDay, s.day + OPENING.boardDays, 'on the board for two weeks');
  assert.ok(s.inbox.some((m) => m.kind === 'opening' && /favour to ask/.test(m.subject) && /Back Rent/.test(m.body)));
  assert.ok(!s.inbox.some((m) => m.kind === 'hall-offer'), 'no hall yet');
  assert.match(canOpenHall(s, 'nightMarket').reason, /Madam Rao wants a favour first: Back Rent, on the board/);
  introduceHalls(s);
  assert.equal(s.jobs.filter((j) => j.templateId === 'back_rent').length, 1, 'asked once');
});

test('finishing it opens the way: the hall is offered at once, and can be opened', () => {
  const s = welcome();
  introduceHalls(s);
  const line = openingResult(s, opening(s).id, 'completed');
  assert.match(line.text, /Madam Rao has a place for us now/);
  assert.equal(openingOf(s, 'nightMarket').status, 'done');
  assert.ok(s.inbox.some((m) => m.kind === 'hall-offer' && m.payload.district === 'nightMarket'));
  assert.equal(canOpenHall(s, 'nightMarket').ok, true);
  assert.equal(openingResult(s, 'job-nope', 'completed'), null, 'any other job means nothing here');
});

test('walking away: they ask again in two weeks, with one of their own jobs as the test', () => {
  let s = welcome(4);
  introduceHalls(s);
  const line = openingResult(s, opening(s).id, 'aborted');
  assert.match(line.text, /will ask again in two weeks/);
  assert.equal(openingOf(s, 'nightMarket').status, 'failed');
  assert.equal(openingOf(s, 'nightMarket').retryDay, s.day + OPENING.retryDays);
  assert.match(canOpenHall(s, 'nightMarket').reason, /will ask again by day/);
  introduceHalls(s);
  assert.equal(openingOf(s, 'nightMarket').status, 'failed', 'not before the two weeks');
  s.day = openingOf(s, 'nightMarket').retryDay;
  introduceHalls(s);
  const retry = opening(s);
  const rao = CLIENTS.find((c) => c.id === 'rao');
  assert.ok(rao.jobs.includes(retry.templateId), `${retry.templateId} is one of Rao's own jobs`);
  assert.ok(!templateById(retry.templateId).opening && !templateById(retry.templateId).routine);
  assert.equal(openingOf(s, 'nightMarket').retry, true);
  assert.ok(s.inbox.some((m) => m.kind === 'opening' && /try us again/.test(m.subject)));
  openingResult(s, retry.id, 'completed');
  assert.equal(canOpenHall(s, 'nightMarket').ok, true, 'the test passed: the hall is ours to take');
});

test('a favour left on the board till it goes counts as walking away', () => {
  let s = welcome(5);
  introduceHalls(s);
  s.jobs = s.jobs.filter((j) => j.id !== openingOf(s, 'nightMarket').jobId); // gone off the board
  introduceHalls(s);
  assert.equal(openingOf(s, 'nightMarket').status, 'failed');
});

test('a real run: sending a crew on the favour ends in the hall offered, or a second ask', () => {
  let s = welcome(6);
  introduceHalls(s);
  const job = opening(s);
  s = sendOff(s, job.id, s.crew.slice(0, 3).map((o) => o.id), 'stealth', 'steady', { callIn: 'never' });
  for (let i = 0; i < 10 && (s.awayJobs ?? []).length; i++) {
    s = advanceDay(s);
    for (const m of s.inbox) if (m.blocking) { m.blocking = false; m.resolved = true; }
  }
  const report = s.inbox.find((m) => m.type === 'report' && /Back Rent/.test(m.subject));
  assert.ok(report, 'the job came back');
  const done = report.timeline.result === 'completed';
  assert.equal(openingOf(s, 'nightMarket').status, done ? 'done' : 'failed');
  assert.match(report.body, done ? /has a place for us now/ : /will ask again in two weeks/);
});

test('a v42 save: halls already offered or opened need no favour; the rest start fresh', async () => {
  const s = createNewGame({ seed: 1, startCrew: 'fresh' });
  s.version = 42;
  delete s.openings;
  s.hallOffers = ['docks'];
  s.halls.push({ district: 'basin', beds: 2, rent: 1200, level: 1, opened: 1, build: [] });
  const up = await importSave({ text: async () => JSON.stringify(s) });
  assert.equal(up.version, SAVE_VERSION);
  assert.equal(up.openings.docks.status, 'done');
  assert.equal(up.openings.basin.status, 'done');
  assert.equal(up.openings.nightMarket, undefined);
});
