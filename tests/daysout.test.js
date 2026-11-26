// The days out, shorter (owner, 2026-11-26: six days read as a wall of text). The promises: a day's line keeps its
// aside (or Joss's word) apart; a report shows one line a day without it, folds a run of quiet days to one line, and
// shows every day in full, asides included, on one tap (and back). Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from './nav-harness.js';
import { createNewGame } from '../src/core/state.js';
import { advanceDay } from '../src/core/time.js';
import { resolveDecision } from '../src/core/decisions.js';
import { sendExpedition, expeditionsOut } from '../src/core/expeditions.js';
import { jobDayLine, startFacts } from '../src/core/advlog.js';

test("a day's line keeps its aside apart, and the whole day is still the two together", () => {
  const s = createNewGame({ seed: 2, startCrew: 'fresh' });
  let seen = 0;
  for (let day = 2; day < 60 && !seen; day++) {
    const l = jobDayLine({ seed: s.seed, tripId: `t${day}`, day, crew: s.crew.slice(0, 3), district: 'docks', facts: startFacts(s.seed, `t${day}`, 'docks') });
    if (l?.more) { assert.ok(!l.text.includes(l.more), 'the day leads without its aside'); seen++; }
  }
  assert.ok(seen, 'some day has an aside');
});

test("an expedition's days keep the aside and mark the quiet ones", () => {
  let found = { more: false, quiet: false };
  for (let seed = 1; seed < 40 && !(found.more && found.quiet); seed++) {
    let s = createNewGame({ seed, startCrew: 'fresh' });
    s = sendExpedition(s, { goal: 'weapon', district: 'docks', crewIds: s.crew.slice(0, 2).map((o) => o.id) });
    for (let i = 0; i < 9 && expeditionsOut(s).length; i++) {
      s = advanceDay(s);
      for (let m = s.inbox.find((x) => x.kind === 'expedition' && !x.resolved); m; m = s.inbox.find((x) => x.kind === 'expedition' && !x.resolved)) s = resolveDecision(s, m.id, 'give');
    }
    const days = s.inbox.find((m) => m.timeline?.expedition)?.timeline.days ?? [];
    if (days.some((d) => d.more)) found.more = true;
    if (days.some((d) => d.quiet)) found.quiet = true;
  }
  assert.ok(found.more, 'asides reach the report, apart');
  assert.ok(found.quiet, 'quiet days are marked');
});

function reportWith(days) {
  const s = createNewGame({ seed: 3, startCrew: 'fresh' });
  s.inbox.unshift({
    id: 'r1', type: 'report', day: s.day, subject: 'A weapon, the Docks: got it', body: '', read: false, blocking: false,
    timeline: { result: 'completed', steps: [], outcome: [{ tone: 'good', text: 'Nobody hurt.' }], days, expedition: { goal: 'weapon', district: 'docks', outcome: 'met' } },
  });
  return s;
}

test('a report shows one line a day, folds the quiet run, and opens every day in full on a tap', async () => {
  const days = [
    { day: 1, text: 'They set out.', more: 'Joss: "Bring the bucket back."' },
    { day: 2, text: 'Nothing moved.', quiet: true },
    { day: 3, text: 'Two stalls, two shrugs.', quiet: true },
    { day: 4, text: 'A repairer gave them a name.' },
    { day: 5, text: 'Rain all day.', quiet: true },
    { day: 6, text: 'The meet went well.', more: 'Mei kept the receipt.' },
  ];
  const app = await boot({ state: reportWith(days) });
  app.click('nav', 'inbox');
  app.click('open-message', 'r1');
  let html = app.html();
  assert.match(html, /Days 2–3<\/span> Quiet\./, 'two quiet days in a row fold to one line');
  assert.match(html, /Day 5<\/span> Quiet\./, 'a lone quiet day folds too');
  assert.doesNotMatch(html, /Two stalls, two shrugs|Rain all day/, 'the quiet lines are hidden');
  assert.doesNotMatch(html, /Bring the bucket back|kept the receipt/, 'no asides or Joss');
  assert.match(html, /A repairer gave them a name/, 'the days that moved are there');
  assert.match(html, /data-action="days-full" data-id="r1"[^>]*>Every day, in full</);
  app.click('days-full', 'r1');
  html = app.html();
  assert.match(html, /Two stalls, two shrugs/);
  assert.match(html, /Rain all day/);
  assert.match(html, /advlog__more">Joss: &quot;Bring the bucket back\.&quot;|advlog__more">Joss: "Bring the bucket back\."/);
  assert.match(html, />Fewer words</);
  app.click('days-full', 'r1');
  assert.doesNotMatch(app.html(), /Rain all day/, 'and back');
});

test('a log with nothing to hide has no toggle', async () => {
  const app = await boot({ state: reportWith([{ day: 1, text: 'They set out.' }, { day: 2, text: 'A lead.' }]) });
  app.click('nav', 'inbox');
  app.click('open-message', 'r1');
  assert.doesNotMatch(app.html(), /data-action="days-full"/);
});
