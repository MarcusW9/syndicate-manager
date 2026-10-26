// Side tasks (owner's batch and design, 2026-10-26). Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame, SAVE_VERSION } from '../src/core/state.js';
import { advanceDay } from '../src/core/time.js';
import { SIDE_TASKS } from '../src/data/sideTasks.js';
import { CLIENTS } from '../src/data/clients.js';
import { DISTRICTS } from '../src/data/districts.js';
import { STATS } from '../src/core/development.js';
import * as S from '../src/core/sidetasks.js';
import * as M from '../src/core/mission.js';
import { addOffer } from '../src/core/jobs.js';
import { assessJob } from '../src/core/risk.js';
import { upcoming } from '../src/core/upcoming.js';

globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
const { importSave } = await import('../src/save/save.js');

const game = (seed) => createNewGame({ seed, startCrew: 'fresh' });
const days = (s, n) => { for (let i = 0; i < n; i++) s = advanceDay(s); return s; };
/** A game with this task on the board. */
function withTask(seed, id) {
  const s = game(seed);
  s.sideBoard = [id];
  return s;
}

test('every side task is well-formed: a real district, purpose, stat and client; failures stay small', () => {
  for (const t of SIDE_TASKS) {
    assert.ok(DISTRICTS[t.district], `${t.id}: district`);
    assert.ok(['money', 'training', 'trust', 'info'].includes(t.purpose), `${t.id}: purpose`);
    assert.ok(STATS.includes(t.stat), `${t.id}: stat`);
    assert.ok(t.days >= 1 && t.days <= 3 && t.crew >= 1 && t.crew <= 2, `${t.id}: days and crew`);
    if (t.purpose === 'trust') assert.ok(CLIENTS.some((c) => c.id === t.client), `${t.id}: client`);
    const f = t.fail ?? {};
    assert.ok(!f.injury || f.injury === 'light', `${t.id}: at worst a light injury`);
  }
  assert.equal(SIDE_TASKS.length, 25);
});

test('a board of 5 goes up each Monday, spread across districts, the same on reload', () => {
  let s = game(1);
  assert.equal(s.sideBoard.length, S.SIDE_BOARD_SIZE);
  assert.equal(new Set(s.sideBoard.map((id) => S.sideTaskById(id).district)).size, 5, 'one per district');
  const first = [...s.sideBoard];
  s = days(s, 7); // next Monday
  assert.equal(s.sideBoard.length, 5);
  assert.notDeepEqual(s.sideBoard, first, 'a fresh board');
  const again = game(1);
  assert.deepEqual(again.sideBoard, first, 'same seed, same board');
});

test('sending takes the task off the board and the crew away; nothing lands until they return', () => {
  const s0 = withTask(2, 'tea_tin_collections');
  const op = s0.crew[0];
  const s1 = S.sendOnSideTask(s0, 'tea_tin_collections', [op.id]);
  assert.deepEqual(s1.sideBoard, []);
  assert.equal(s1.crew.find((o) => o.id === op.id).condition.awayUntil, s1.day + 1);
  assert.equal(s1.cash, s0.cash);
  assert.ok(!s1.inbox.some((m) => m.type === 'report'));
  assert.ok(upcoming(s1).some((i) => i.kind === 'report' && i.name === 'Tea Tin Collections'));
  const s2 = advanceDay(s1);
  const report = s2.inbox.find((m) => m.type === 'report');
  assert.ok(report && report.subject.startsWith('Tea Tin Collections'));
  assert.deepEqual(s2.sideOut, []);
});

test('you can only send what the task allows: on the board, free crew, not too many, no freelancers', () => {
  const s = withTask(3, 'tea_tin_collections'); // crew of 1
  assert.equal(S.sendOnSideTask(s, 'tea_tin_collections', [s.crew[0].id, s.crew[1].id]), s, 'too many');
  assert.equal(S.sendOnSideTask(s, 'odds_boards', [s.crew[0].id]), s, 'not on the board');
  s.crew[0].condition.awayUntil = s.day + 2;
  assert.equal(S.sendOnSideTask(s, 'tea_tin_collections', [s.crew[0].id]), s, 'away');
  assert.equal(S.sendOnSideTask(s, 'tea_tin_collections', [s.freelancers[0].id]), s, 'freelancers do jobs, not side work');
});

test('outcomes follow the task: pay, trust, intel and growth when it goes well; only its own small cost when not', () => {
  const seen = { good: 0, bad: 0 };
  for (const t of SIDE_TASKS) {
    for (let seed = 1; seed <= 12; seed++) {
      const s0 = withTask(seed * 31 + t.days, t.id);
      const crew = s0.crew.slice(0, t.crew).map((o) => o.id);
      const sent = S.sendOnSideTask(s0, t.id, crew);
      let s = days(sent, t.days);
      const report = s.inbox.find((m) => m.type === 'report' && m.subject.startsWith(t.name));
      assert.ok(report, `${t.id}: reported`);
      const ok = report.timeline.side.success;
      seen[ok ? 'good' : 'bad'] += 1;
      const paid = s.cash - sent.cash; // wages only fall on Sundays; tasks are at most 3 days from Monday
      if (t.purpose === 'money') assert.equal(paid, Math.round((S.SIDE_PAY_PER_DAY * t.days * crew.length * (ok ? 1 : t.failPay ?? 0)) / 50) * 50, `${t.id}: pay`);
      else assert.equal(paid, 0, `${t.id}: no pay`);
      if (t.purpose === 'info') assert.equal(!!S.intelFor(s, t.district), ok, `${t.id}: intel only when it goes well`);
      assert.ok(s.crew.every((o) => o.condition.injury !== 'dead' && ['healthy', 'light'].includes(o.condition.injury)), `${t.id}: nobody worse than light`);
      if (ok) assert.equal(s.heat, sent.heat, `${t.id}: no heat when it goes well`);
      else assert.equal(s.heat, sent.heat + (t.fail.heat ?? 0), `${t.id}: heat only from its own cost`);
      for (const id of crew) assert.ok(s.crew.some((o) => o.id === id), 'everyone comes home');
    }
  }
  assert.ok(seen.good > 100 && seen.bad > 20, `mix of outcomes ${JSON.stringify(seen)}`);
});

test('training teaches its stat, and more than other work does', () => {
  const progress = (id) => {
    const s0 = withTask(9, id);
    const op = s0.crew.find((o) => o.role === 'medic');
    const t = S.sideTaskById(id);
    const before = op.stats[t.stat] * 1000 + (op.progress?.[t.stat] ?? 0);
    const s = days(S.sendOnSideTask(s0, id, [op.id]), t.days);
    const after = s.crew.find((o) => o.id === op.id);
    return after.stats[t.stat] * 1000 + (after.progress?.[t.stat] ?? 0) - before;
  };
  assert.ok(progress('block_nine_porter') > progress('clinic_comparison'), 'two-day medical training beats a two-day medical info task');
});

test('intel shows in the risk read and the crisis read, and makes rolls in that district easier', () => {
  let s = game(10);
  s.intel = { docks: { until: s.day + 7, source: 'Night Manifest' } };
  s.jobs = []; addOffer(s, 'container409');
  const crew = s.crew.slice(0, 2);
  const value = (intel) => Number(assessJob({ crewSize: 2, threat: 6, keyStats: ['stealth'] }, crew, 'stealth', { intel }).reasons.join(' ').match(/\((\d+)/)?.[1]);
  assert.equal(value(S.intelFor(s, 'docks')), value(null) + 1, 'the planning read counts it');
  s = M.startMission(s, s.jobs[0].id, crew.map((o) => o.id), 'stealth');
  s.activeMission.queue = [{ type: 'crisis', id: 'cutter' }, { type: 'beat', index: 0 }]; s.activeMission.step = 0;
  const reason = M.describeCrisis(s).choices.find((c) => c.id === 'shadow').riskReason;
  assert.match(reason, /intel from Night Manifest \+1/);
  const gone = { ...s, day: s.day + 8 };
  assert.equal(S.intelFor(gone, 'docks'), null, 'a week later it has gone stale');
});

test('a v17 save upgrades with a side board and nothing out', async () => {
  const s = game(11);
  delete s.sideBoard; delete s.sideOut; delete s.intel;
  s.version = 17;
  const loaded = await importSave({ text: async () => JSON.stringify(s) });
  assert.equal(loaded.version, SAVE_VERSION);
  assert.equal(loaded.sideBoard.length, S.SIDE_BOARD_SIZE);
  assert.deepEqual(loaded.sideOut, []);
  assert.deepEqual(loaded.intel, {});
});
