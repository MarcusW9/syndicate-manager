// The inbox stays bounded (save v46, DESIGN.md 2026-11-06): old news goes, anything still waiting
// on the player stays. Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame, SAVE_VERSION } from '../src/core/state.js';
import { INBOX_KEEP, isActionable, trimInbox } from '../src/core/inbox.js';
import { weekSummary } from '../src/core/week.js';
import { playWeeks } from './play.js';

globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
const { importSave } = await import('../src/save/save.js');

const SAVE_BUDGET = 250_000; // characters of JSON after a year (was 542KB before the trim)

const waiting = (m) => m.blocking && !m.resolved || m.resolved === false;

test('a year of play keeps the save under budget and never trims a decision still waiting', () => {
  const seen = new Map(); // id -> the last copy seen of a message that waited on the player
  let worst = 0;
  const { state } = playWeeks(52, 1, undefined, { // seed 1: the year's size depends on which jobs the seed deals (seeds 3, 7 and 9 land within a few percent of the budget on one branch or the other)
    onDay: (s) => {
      const ids = new Set(s.inbox.map((m) => m.id));
      for (const [id, m] of seen) if (waiting(m)) assert.ok(ids.has(id), `day ${s.day}: "${m.subject}" was trimmed while it waited`);
      for (const m of s.inbox) if (waiting(m) || seen.has(m.id)) seen.set(m.id, m);
      worst = Math.max(worst, s.inbox.length);
    },
  });
  const size = JSON.stringify(state).length;
  assert.ok(size < SAVE_BUDGET, `the save is ${size} characters after 52 weeks (budget ${SAVE_BUDGET})`);
  assert.ok(worst <= INBOX_KEEP.max, `at most ${INBOX_KEEP.max} messages (saw ${worst})`);
  // This week's reports are all still there for the Sunday summary.
  const weekAgo = state.day - 7;
  assert.ok(state.inbox.some((m) => m.type === 'report' && m.day > weekAgo), 'recent reports kept');
  assert.ok(state.inbox.every((m) => isActionable(state, m) || state.day - m.day < INBOX_KEEP.unreadWeeks * 7));
});

const msg = (id, day, extra = {}) => ({ id, type: 'crew', day, subject: id, body: '', blocking: false, read: false, ...extra });

test('trimInbox drops old news by read state and keeps whatever can still be acted on', () => {
  const s = createNewGame({ seed: 3, startCrew: 'fresh' });
  s.day = 200;
  s.halls = [{ district: 'oldtown' }];
  s.raids = [{ id: 'r1', done: false }, { id: 'r2', done: true }];
  s.jobs = [{ id: 'j9' }];
  s.inbox = [
    msg('fresh-read', 199, { read: true }),
    msg('old-read', 200 - INBOX_KEEP.weeks * 7, { read: true }),
    msg('old-unread-in', 200 - INBOX_KEEP.unreadWeeks * 7 + 1),
    msg('old-unread-out', 200 - INBOX_KEEP.unreadWeeks * 7),
    msg('renewal', 10, { kind: 'renewal', blocking: true, resolved: false }),
    msg('renewal-done', 10, { kind: 'renewal', blocking: true, resolved: true, read: true }),
    msg('spec', 10, { kind: 'spec', resolved: false }),
    msg('hall-open', 10, { kind: 'hall-offer', payload: { district: 'docks' } }),
    msg('hall-taken', 10, { kind: 'hall-offer', payload: { district: 'oldtown' } }),
    msg('raid-coming', 10, { kind: 'raid-warning', payload: { raidId: 'r1' } }),
    msg('raid-over', 10, { kind: 'raid-warning', payload: { raidId: 'r2' } }),
    msg('opening', 10, { type: 'job', kind: 'opening', payload: { jobId: 'j9' } }),
    msg('opening-gone', 10, { type: 'job', kind: 'opening', payload: { jobId: 'j1' } }),
  ];
  trimInbox(s);
  assert.deepEqual(s.inbox.map((m) => m.id), ['fresh-read', 'old-unread-in', 'renewal', 'spec', 'hall-open', 'raid-coming', 'opening']);
});

test('the cap keeps the newest news and every waiting message', () => {
  const s = createNewGame({ seed: 4, startCrew: 'fresh' });
  s.day = 50;
  s.inbox = Array.from({ length: INBOX_KEEP.max + 50 }, (_, i) => msg(`n${i}`, 50 - (i % 7)));
  s.inbox.push(msg('decision', 1, { blocking: true, resolved: false }));
  trimInbox(s);
  assert.equal(s.inbox.length, INBOX_KEEP.max, "the cap counts every message, the waiting one included");
  assert.ok(s.inbox.some((m) => m.id === 'decision'));
  assert.ok(s.inbox.filter((m) => m.id !== 'decision').every((m) => m.day >= 44));
});

test('the Sunday summary still counts the whole week after trimming', () => {
  const { state } = playWeeks(20, 11, undefined, {
    onDay: (s) => {
      // Trimming again changes nothing the summary reads.
      const before = weekSummary(s);
      assert.deepEqual(weekSummary(trimInbox(structuredClone(s))), before);
    },
  });
  assert.ok(state.inbox.length < 200);
});

test('a v45 save with a year of messages is trimmed on load, waiting messages kept', async () => {
  const { state } = playWeeks(4, 5);
  const old = structuredClone(state);
  old.version = 45;
  old.day = 400;
  old.inbox = [
    ...Array.from({ length: 600 }, (_, i) => msg(`old${i}`, 1 + (i % 300), { read: i % 2 === 0 })),
    msg('renewal', 5, { kind: 'renewal', blocking: true, resolved: false }),
  ];
  const loaded = await importSave({ text: () => Promise.resolve(JSON.stringify(old)) });
  assert.equal(loaded.version, SAVE_VERSION);
  assert.deepEqual(loaded.inbox.map((m) => m.id), ['renewal']);
});
