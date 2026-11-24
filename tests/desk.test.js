// Today as the desk (2026-11-24; DESIGN.md decision log): decisions are cards with their answer, the rest is news that
// never counts; the classic inbox is one tap away in Save › Look and comes back exactly as it was.
import test from 'node:test';
import assert from 'node:assert/strict';
import { boot } from './nav-harness.js';
import { createNewGame } from '../src/core/state.js';
import { addOffer, templateById } from '../src/core/jobs.js';
import { sendOff } from '../src/core/autorun.js';
import { advanceDay } from '../src/core/time.js';
import { isDecision, decisionCount, attentionCount } from '../src/ui/nav.js';

/** A crew out with a call waiting, and the day's other messages (new jobs, a crew sent out) as news. */
function callWaiting() {
  let s = createNewGame({ seed: 1, startCrew: 'fresh' });
  s.jobs = [];
  addOffer(s, 'clinic');
  s = sendOff(s, s.jobs[0].id, s.crew.slice(0, templateById('clinic').crewSize).map((o) => o.id), 'stealth', 'steady', { callIn: 'every' });
  s = advanceDay(s);
  return s;
}

test('a message is a decision when it waits on an answer, or is a report from today or yesterday not yet read', () => {
  const s = callWaiting();
  const call = s.inbox.find((m) => m.kind === 'callin' && !m.resolved);
  assert.ok(call && isDecision(s, call), 'a call-in waiting is a decision');
  const news = s.inbox.filter((m) => !isDecision(s, m));
  assert.ok(news.length > 0, 'the rest is news');
  assert.ok(news.every((m) => !(m.blocking && !m.resolved) && m.resolved !== false), 'nothing waiting is ever news');
  const report = { id: 'r1', type: 'report', day: s.day, subject: 'Report', read: false };
  assert.ok(isDecision(s, report), "today's unread report is a decision");
  assert.ok(!isDecision(s, { ...report, read: true }), 'a read report is news');
  assert.ok(!isDecision(s, { ...report, day: s.day - 2 }), 'an unread report from two days ago is news by now');
  assert.ok(decisionCount(s) <= attentionCount(s), 'the desk never counts more than the classic badge');
});

test('the desk is the default Today; its badge and Continue count what is waiting; the call has its answer on a card', async () => {
  const s = callWaiting();
  const app = await boot({ state: s });
  app.click('nav', 'inbox');
  const html = app.html();
  assert.match(html, /class="inbox inbox--desk/, 'the desk is drawn');
  assert.match(html, /Needs you · \d/, 'Needs you with its count');
  assert.match(html, /aria-label="(\d+) waiting on you"/);
  assert.equal(Number(html.match(/aria-label="(\d+) waiting on you"/)[1]), decisionCount(s), 'the badge counts decisions');
  assert.doesNotMatch(html, /\d+ unread/, 'Continue does not count unread on the desk');
  const call = s.inbox.find((m) => m.kind === 'callin' && !m.resolved);
  assert.match(html, new RegExp(`data-action="take-call" data-id="${call.payload.jobId}">Take the call<`), 'the call-in card takes the call itself');
  assert.match(html, /Day \d of \d/, "the call shows how far through the job the crew is");
  assert.match(html, /Intercepts/, 'the news log');
  assert.match(html, /class="wtrack"/, 'the week as a track');
  assert.match(html, /class="roster"/, 'the roster');
  assert.doesNotMatch(html, /class="weekbrief"/, 'no Week card on the desk');
  assert.equal((html.match(/class="outnow[ "]/g) ?? []).length, 1, 'the crews-out line, once, in the crew panel');
  app.click('open-message', call.id);
  assert.match(app.html(), /inbox--desk has-open/, 'the message opens beside the desk');
});

test('Save › Look switches Today back to the classic inbox and back again', async () => {
  const app = await boot({ state: callWaiting() });
  app.click('today-layout', 'classic');
  app.click('nav', 'inbox');
  let html = app.html();
  assert.doesNotMatch(html, /inbox--desk/, 'the classic inbox');
  assert.match(html, /class="inboxfilter"/, 'with its All / To do filter');
  assert.match(html, /class="weekbrief"/, 'and the Week card');
  assert.equal(localStorage.getItem('syndicate-pref-today-classic'), '1', 'kept on the device');
  app.click('today-layout', 'desk');
  app.click('nav', 'inbox');
  html = app.html();
  assert.match(html, /inbox--desk/, 'the desk again');
});
