// Today screen: alerts only when something needs the player, and a week ahead that
// only lists what the game will really do. Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame } from '../src/core/state.js';
import { advanceDay, weeklyBill } from '../src/core/time.js';
import { alerts, upcoming } from '../src/core/upcoming.js';

const days = (state, n) => { let s = state; for (let i = 0; i < n; i++) s = advanceDay(s); return s; };
const fresh = (seed) => createNewGame({ seed, difficulty: 'standard', startCrew: 'fresh' });

test('a quiet first day has no alerts', () => {
  assert.deepEqual(alerts(fresh(40)), []);
});

test('the week ahead: scouts Wednesday, bills Sunday, new board Monday, offers ending', () => {
  const s = fresh(41); // day 1, Monday
  const up = upcoming(s);
  assert.ok(up.every((i, n) => n === 0 || up[n - 1].day <= i.day), 'soonest first');
  assert.ok(up.some((i) => i.kind === 'scout' && i.day === 3));
  const bills = up.find((i) => i.kind === 'bills');
  assert.equal(bills.day, 7);
  assert.equal(bills.total, weeklyBill(s).total);
  assert.ok(up.some((i) => i.kind === 'board' && i.day === 8));
  assert.equal(up.filter((i) => i.kind === 'job-last').length, s.jobs.length);
  assert.ok(up.every((i) => i.day > s.day && i.day <= s.day + 7), 'only the next seven days');
});

test('what the week ahead promises, the days deliver', () => {
  let s = fresh(42);
  const scout = upcoming(s).find((i) => i.kind === 'scout');
  s = days(s, scout.day - s.day);
  assert.ok(s.inbox.some((m) => m.type === 'scout' && m.day === scout.day), 'scout report arrived');
  const job = s.jobs[0];
  s = days(s, job.expiresDay - s.day);
  assert.ok(s.jobs.some((j) => j.id === job.id), 'still on the board on its last day');
  s = advanceDay(s);
  assert.ok(!s.jobs.some((j) => j.id === job.id), 'gone the day after');
});

test('crew coming back: from injury and from exhaustion', () => {
  const s = fresh(43);
  s.crew[0].condition.injury = 'serious';
  s.crew[0].condition.injuryDays = 4;
  s.crew[1].condition.fatigue = 100; // exhausted: back under 85 in 2 days
  const up = upcoming(s);
  assert.ok(up.some((i) => i.kind === 'healed' && i.name === s.crew[0].handle && i.day === 5));
  assert.ok(up.some((i) => i.kind === 'rested' && i.name === s.crew[1].handle && i.day === 3));
  const later = days(s, 2);
  assert.ok(later.crew[1].condition.fatigue <= 85, 'rested on the day promised');
  const out = alerts(s).find((a) => a.kind === 'crew-out');
  assert.deepEqual(out.names.sort(), [s.crew[0].handle, s.crew[1].handle].sort());
});

test('alerts: bills short, a job on its last day, a decision waiting', () => {
  let s = fresh(44);
  s.cash = 100;
  assert.ok(alerts(s).some((a) => a.kind === 'bills-short' && a.short === weeklyBill(s).total - 100));
  s = fresh(45);
  s = days(s, s.jobs[0].expiresDay - s.day);
  assert.ok(alerts(s).some((a) => a.kind === 'job-last'));
  s.inbox.unshift({ id: 'd1', type: 'crew', day: s.day, subject: 'A choice', body: '', blocking: true, resolved: false, read: false });
  assert.ok(alerts(s).some((a) => a.kind === 'decision' && a.messageId === 'd1'));
});
