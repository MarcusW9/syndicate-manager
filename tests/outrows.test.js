// Crews out as rows that open (2026-11-26, ui/outrows.js; docs/mockups/2026-11-26-crews-out-condensed.html, look A
// revised). The promises: City › Map shows one row per crew out, whatever the kind (a hands-off job, an expedition,
// side work), a crew calling you first; each row has the faces, the kind and the day, and a track one segment a day;
// a crew's action is a small link (take the call), never a filled button; a row opens in place, one at a time, with
// the faces at full size, the back day and the goal; Jobs › Trips shows the same rows for expeditions. Run with: npm test

import test from 'node:test';
import assert from 'node:assert/strict';
import { boot } from './nav-harness.js';
import { createNewGame } from '../src/core/state.js';
import { addOffer, templateById } from '../src/core/jobs.js';
import { sendOff } from '../src/core/autorun.js';
import { advanceDay } from '../src/core/time.js';
import { sendExpedition, canSend, expeditionsOut } from '../src/core/expeditions.js';
import { sendOnSideTask } from '../src/core/sidetasks.js';
import { GOALS } from '../src/data/expeditions.js';

/** A job out calling in, an expedition on the road and, when the board allows, side work. */
function busy() {
  let s = createNewGame({ seed: 1, startCrew: 'fresh' });
  s.crew.push(...structuredClone(s.crew).map((o, i) => ({ ...o, id: `${o.id}-b`, handle: `${o.handle}${i}` })));
  s.jobs = [];
  addOffer(s, 'clinic');
  s = sendOff(s, s.jobs[0].id, s.crew.slice(0, templateById('clinic').crewSize).map((o) => o.id), 'stealth', 'steady', { callIn: 'every' });
  const free = () => s.crew.filter((o) => !o.condition.awayUntil || o.condition.awayUntil <= s.day).map((o) => o.id);
  const goal = Object.keys(GOALS).find((g) => canSend(s, g, 'docks', free().slice(0, 2)).ok);
  s = sendExpedition(s, { goal, district: 'docks', crewIds: free().slice(0, 2) });
  const task = (s.sideBoard ?? [])[0];
  if (task) s = sendOnSideTask(s, task, free().slice(0, 1));
  s = advanceDay(s);
  assert.ok(s.inbox.some((m) => m.kind === 'callin' && !m.resolved), 'the job is calling');
  assert.equal(expeditionsOut(s).length, 1, 'the expedition is out');
  return s;
}

const rows = (html) => html.match(/<li class="outrow[^"]*"/g) ?? [];

test('City › Map: one row per crew out, a call first, its action a link', async () => {
  const s = busy();
  const app = await boot({ state: s });
  app.click('nav', 'city');
  app.click('city-tab', 'map');
  const html = app.html();
  const expected = s.awayJobs.length + expeditionsOut(s).length + (s.sideOut ?? []).length;
  assert.equal(rows(html).length, expected, 'one row each');
  assert.match(rows(html)[0], /is-call/, 'the crew calling comes first');
  assert.match(html, /<button class="outrow__act is-call" data-action="take-call"/, 'the call is a small link on the row');
  const list = html.slice(html.indexOf('class="crewsout outrows"'), html.indexOf('</ul>', html.indexOf('class="crewsout outrows"')));
  assert.doesNotMatch(list, /class="btn/, 'no filled button in Out now');
  assert.match(html, /Job · day \d+ of \d+/, 'a job row says its kind and day');
  assert.match(html, /Trip · day \d+ of \d+/, 'so does a trip');
  assert.match(html, /class="outrow__track"[^>]*style="--days:\d+"/, 'a track one segment a day');
  assert.doesNotMatch(html, /<details open/, 'every row starts closed');
});

test('a row opens in place, one at a time, and the trip shows its goal and back day', async () => {
  const s = busy();
  const trip = expeditionsOut(s)[0];
  const app = await boot({ state: s });
  app.click('nav', 'city');
  app.click('city-tab', 'map');
  app.click('out-open', `trip-${trip.id}`);
  let html = app.html();
  assert.equal((html.match(/<details open/g) ?? []).length, 1, 'one open');
  assert.match(html, /<li class="outrow[^"]*is-open/, 'the row is marked open');
  assert.match(html, /(Leads|Money found) <b>\d of \d<\/b>/, 'the goal');
  assert.match(html, /outrow__back">Back \w+</, 'the back day, on the row');
  assert.match(html, /data-action="op-link"/, 'the faces open the runner');
  const job = s.awayJobs[0].mission.jobId;
  app.click('out-open', `job-${job}`);
  html = app.html();
  assert.equal((html.match(/<details open/g) ?? []).length, 1, 'still one open: the job now');
  assert.match(html, /class="outrow__map"/, 'a job keeps its mini map');
  app.click('out-open', `job-${job}`);
  assert.doesNotMatch(app.html(), /<details open/, 'tapped again, it closes');
});

test('Jobs › Trips shows the same rows for expeditions only', async () => {
  const s = busy();
  const app = await boot({ state: s });
  app.click('nav', 'jobs');
  app.click('jobs-tab', 'expeditions');
  const html = app.html();
  assert.equal(rows(html).length, 1);
  assert.match(html, /aria-label="Out on an expedition"/);
});
