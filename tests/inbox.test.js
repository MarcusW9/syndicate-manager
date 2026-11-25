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

// The save after a year of play, in characters of JSON. History: 542KB before the inbox trim; 250k until loot (2026-11-13); 260k
// until 2026-11-14 (routine jobs earn client trust); 270k on one seed until 2026-11-15. One seed proved too fragile: the size
// depends on which jobs land in the seed's last month, so a change to the job pool could tip it (seed 1 to 297k on 2026-11-14,
// seed 2 to 296k with four new fight jobs on 2026-11-15, while ten seeds averaged 265k). Since 2026-11-15 the test plays SEEDS
// and holds their AVERAGE under SAVE_BUDGET and every one under SAVE_CEILING. Measured 2026-11-15, seeds 1-5: 251k, 296k, 311k,
// 269k, 242k (average 274k; main before the four jobs: 248k). Back to 270k the same day once reports stored fight lines lean
// (core/report.js reportEvent): seeds 1-5 then 239k, 265k, 262k, 254k, 242k (average 252k). 290k since 2026-11-23 (owner):
// the first multi-map jobs from their own clients (Lau, Kwan) carry two extra crises a report, about twice a usual report,
// and come up often; seeds 1-5 then 246k, 295k, 295k, 259k, 294k (average 278k; main before them 249k). The save is bounded
// by REPORT_LOGS_KEPT full logs (core/report.js), not by how long the game runs, nor by how many jobs exist.
const SAVE_BUDGET = 290_000;
const SAVE_CEILING = 350_000;
const SEEDS = [1, 2, 3, 4, 5];

const waiting = (m) => m.blocking && !m.resolved || m.resolved === false;

test('a year of play keeps the save under budget and never trims a decision still waiting', () => {
  const sizes = [];
  for (const seed of SEEDS) {
    const seen = new Map(); // id -> the last copy seen of a message that waited on the player
    const reports = new Map(); // id -> day of every job report the year wrote
    let worst = 0;
    const { state } = playWeeks(52, seed, undefined, {
      onDay: (s) => {
        const ids = new Set(s.inbox.map((m) => m.id));
        for (const [id, m] of seen) if (waiting(m)) assert.ok(ids.has(id), `seed ${seed}, day ${s.day}: "${m.subject}" was trimmed while it waited`);
        for (const m of s.inbox) if (waiting(m) || seen.has(m.id)) seen.set(m.id, m);
        for (const m of s.inbox) if (m.type === 'report') reports.set(m.id, m.day);
        worst = Math.max(worst, s.inbox.length);
      },
    });
    const size = JSON.stringify(state).length;
    sizes.push(size);
    assert.ok(size < SAVE_CEILING, `seed ${seed}: the save is ${size} characters after 52 weeks (ceiling ${SAVE_CEILING})`);
    assert.ok(worst <= INBOX_KEEP.max, `seed ${seed}: at most ${INBOX_KEEP.max} messages (saw ${worst})`);
    // This week's reports are all still there for the Sunday summary. (2026-11-25: every report written in the last
    // week is checked, not "at least one exists": a year whose last job ended exactly seven days before the end has
    // none to keep, and that is the sim's luck, not a trim. The year still has to have played jobs.)
    const weekAgo = state.day - 7;
    assert.ok(reports.size > 0, `seed ${seed}: the year played jobs`);
    for (const [id, day] of reports) if (day > weekAgo) assert.ok(state.inbox.some((m) => m.id === id), `seed ${seed}: this week's report ${id} (day ${day}) kept`);
    assert.ok(state.inbox.every((m) => isActionable(state, m) || state.day - m.day < INBOX_KEEP.unreadWeeks * 7), `seed ${seed}: old read messages trimmed`);
  }
  const avg = Math.round(sizes.reduce((a, b) => a + b, 0) / sizes.length);
  assert.ok(avg < SAVE_BUDGET, `the save averages ${avg} characters after 52 weeks over seeds ${SEEDS.join(', ')} (budget ${SAVE_BUDGET}; each: ${sizes.join(', ')})`);
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
