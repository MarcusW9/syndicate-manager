// Opening jobs (core/halls.js; DESIGN.md 2026-11-06): once the tong is welcome in a district, the
// contact asks a favour before offering the hall. Finish it and the hall is offered; walk away, fail
// or let it go off the board, and two weeks later they ask again with one of their own jobs.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame, SAVE_VERSION } from '../src/core/state.js';
import { advanceDay } from '../src/core/time.js';
import { canOpenHall, introduceHalls, openingOf, openingResult } from '../src/core/halls.js';
import { HALL_SITES, OPENING, openingHallOf, isOpeningJob } from '../src/data/halls.js';
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
  adjustTrust(s, 'ip', 10);
  s.cash = 30000;
  return s;
}
const opening = (s) => s.jobs.find((j) => j.id === openingOf(s, 'nightMarket')?.jobId);

test('every hall outside Old Town has its own opening job, in the game, and never dealt at random', () => {
  for (const [d, site] of Object.entries(HALL_SITES)) {
    if (site.deposit == null) { assert.equal(site.opening, undefined, `${d}: the home hall needs no favour`); continue; }
    const tpl = templateById(site.opening);
    assert.ok(tpl, `${d}: ${site.opening} exists`);
    assert.equal(openingHallOf(tpl.id), d, 'the registry is HALL_SITES, not the template (2026-11-07)');
    assert.equal(tpl.opening, undefined);
    assert.ok(CLIENTS.some((c) => c.id === site.contact), `${d}: asked by a client`);
    assert.equal(tpl.district, d);
  }
  assert.equal(MISSIONS.filter((m) => isOpeningJob(m.id)).length, 4);
  const s = createNewGame({ seed: 9, startCrew: 'fresh' });
  for (let i = 0; i < 60; i++) { s.jobs = []; postJobs(s, 3); assert.ok(s.jobs.every((j) => !isOpeningJob(j.templateId)), 'not on the board by chance'); }
});

test('welcome: on Monday the contact asks the favour instead of offering the hall, once', () => {
  const s = welcome();
  introduceHalls(s);
  const job = opening(s);
  assert.equal(job.templateId, 'back_rent');
  assert.equal(job.clientId, 'ip', 'Mrs. Ip asks it, and her trust moves (2026-11-07)');
  assert.equal(job.expiresDay, s.day + OPENING.boardDays, 'on the board for two weeks');
  assert.ok(s.inbox.some((m) => m.kind === 'opening' && /favour to ask/.test(m.subject) && /Back Rent/.test(m.body)));
  assert.ok(!s.inbox.some((m) => m.kind === 'hall-offer'), 'no hall yet');
  assert.match(canOpenHall(s, 'nightMarket').reason, /Mrs\. Ip wants a favour first: Back Rent, on the board/);
  introduceHalls(s);
  assert.equal(s.jobs.filter((j) => j.templateId === 'back_rent').length, 1, 'asked once');
});

test('finishing it opens the way: the hall is offered at once, and can be opened', () => {
  const s = welcome();
  introduceHalls(s);
  const line = openingResult(s, opening(s).id, 'completed');
  assert.match(line.text, /Mrs\. Ip has a place for us now/);
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
  // The second ask is one of the contact's own bigger jobs; Mrs. Ip (2026-11-07) has only routine work, so she asks Back Rent again.
  const ip = CLIENTS.find((c) => c.id === 'ip');
  const own = ip.jobs.filter((id) => !templateById(id).routine);
  assert.ok(own.length ? own.includes(retry.templateId) : retry.templateId === 'back_rent', `${retry.templateId}: Mrs. Ip's own, or her favour again`);
  assert.equal(retry.clientId, 'ip', 'her trust, not Rao\'s');
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

test('the owner\'s opening jobs (2026-11-07): Back Rent is Mrs. Ip\'s, Still on the Books is Forewoman Tse\'s; the old Glass Heights job is retired', async () => {
  const { RETIRED_MISSIONS } = await import('../src/data/missions.js');
  const { fill } = await import('../src/core/mission.js');
  const { CAST } = await import('../src/data/cast.js');
  assert.equal(HALL_SITES.nightMarket.opening, 'back_rent');
  assert.equal(HALL_SITES.nightMarket.contact, 'ip');
  assert.equal(HALL_SITES.heights.opening, 'still_on_the_books');
  assert.equal(HALL_SITES.heights.contact, 'tse');
  assert.ok(!MISSIONS.some((m) => m.id === 'there_is_no_forty_first_floor'), 'never offered again');
  assert.ok(RETIRED_MISSIONS.some((m) => m.id === 'there_is_no_forty_first_floor') && templateById('there_is_no_forty_first_floor'), 'but a run under way can still finish');
  assert.ok(!/szeto/i.test(JSON.stringify(templateById('still_on_the_books'))), 'Szeto has nothing to do with the Underterrace');
  // Mrs. Ip's closing line in the last beat is one of her own approve lines.
  const s = createNewGame({ seed: 4, startCrew: 'fresh' });
  const line = fill(templateById('back_rent').beats.at(-1), s, { jobId: 'j1', templateId: 'back_rent', step: 0, crewIds: [] });
  assert.ok(CAST.ip.lines.approve.some((l) => line.includes(l)), line);
  assert.ok(!line.includes('{'), 'every token filled');
});

test('saves from v48: a Forty-First Floor offer becomes Still on the Books, Tse\'s; a Back Rent offer moves to Mrs. Ip', async () => {
  const s = createNewGame({ seed: 6 });
  s.version = 48;
  s.jobs = [{ id: 'j7', templateId: 'there_is_no_forty_first_floor', clientId: 'szeto', expiresDay: 20 }, { id: 'j8', templateId: 'back_rent', clientId: 'rao', expiresDay: 20 }];
  const up = await importSave({ text: async () => JSON.stringify(s) });
  assert.equal(up.version, SAVE_VERSION);
  assert.deepEqual(up.jobs.filter((j) => j.id === 'j7' || j.id === 'j8').map((j) => [j.templateId, j.clientId]), [['still_on_the_books', 'tse'], ['back_rent', 'ip']]);
});
