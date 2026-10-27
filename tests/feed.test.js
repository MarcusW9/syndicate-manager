// The watch feed (PLAN-CORE-LOOP.md, slice 2): every moment of a run becomes a card or a line, in
// order, with a headline; saves sit on the card of the moment they saved; the crew says why when it
// decided something itself. Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame } from '../src/core/state.js';
import * as M from '../src/core/mission.js';
import { addOffer } from '../src/core/jobs.js';
import { autoRun } from '../src/core/autorun.js';
import { feedItems } from '../src/core/feed.js';
import { summariseRun } from '../src/core/report.js';
import { APPROACHES } from '../src/data/approaches.js';
import { playMission, randomPolicy } from './play.js';

const APPROACH_IDS = Object.keys(APPROACHES);

function run(seed, { live = false, approach = APPROACH_IDS[seed % 4] } = {}) {
  const s = createNewGame({ seed, startCrew: 'fresh' });
  s.jobs = [];
  addOffer(s, 'container409');
  const st = M.startMission(s, s.jobs[0].id, s.crew.slice(0, 2).map((o) => o.id), approach, { overwatch: { id: s.crew[2].id, kit: seed % 2 ? 'rifle' : 'drone' } });
  return live ? playMission(st, randomPolicy(seed)).state.activeMission : autoRun(st, 'steady').activeMission;
}

test('the feed follows the zones in order, the way out included', () => {
  for (let seed = 1; seed <= 40; seed++) {
    const am = run(seed);
    const phases = feedItems(am.events).filter((i) => i.type === 'phase').map((i) => i.zone);
    const order = ['in', 'inside', 'target', 'out'];
    assert.deepEqual(phases, order.slice(0, phases.length), `seed ${seed}: ${phases}`);
    if (!am.aborted) assert.equal(phases.at(-1), 'out', `seed ${seed}: a finished run has a way out`);
  }
});

test('every incident, crisis and decision is one card with a headline; saves attach to their incident', () => {
  let saves = 0;
  for (let seed = 1; seed <= 60; seed++) {
    const am = run(seed, { live: seed % 2 === 0 });
    const items = feedItems(am.events);
    const cards = items.filter((i) => i.type === 'card');
    const kinds = (k) => cards.filter((c) => c.kind === k).length;
    assert.equal(kinds('incident'), am.events.filter((e) => e.incident).length, `seed ${seed}: incidents`);
    assert.equal(kinds('crisis'), am.events.filter((e) => e.kind === 'roll' && !e.incident).length, `seed ${seed}: crises`);
    assert.equal(kinds('decision') + kinds('exit'), am.events.filter((e) => e.kind === 'decision' || e.kind === 'exit').length);
    const saveEvents = am.events.filter((e) => e.kind === 'save').length;
    const saveLines = cards.filter((c) => c.kind === 'incident').reduce((n, c) => n + c.results.length - 1 - (c.cue.hurt ? 1 : 0), 0);
    assert.equal(saveLines, saveEvents, `seed ${seed}: every save is on an incident card`);
    saves += saveEvents;
    for (const c of cards) for (const r of c.results) assert.ok(r.headline, `seed ${seed}: ${c.kind} has a headline`);
    for (const c of cards.filter((x) => x.kind === 'incident')) {
      if (c.cue.hurt) assert.equal(c.results.at(-1).tone, 'bad', 'the injury comes last, after any save');
      assert.ok(c.results[0].roll, 'an incident shows its dice');
    }
  }
  assert.ok(saves > 0, 'some saves were tried');
});

test('the crew says why when it decided a crisis itself', () => {
  let seen = 0;
  for (let seed = 1; seed <= 20; seed++) {
    const cards = feedItems(run(seed).events).filter((i) => i.type === 'card' && i.kind === 'crisis');
    for (const c of cards) { assert.ok(c.results[0].why, `seed ${seed}: ${c.setup}`); seen++; }
  }
  assert.ok(seen > 0);
});

test('the report counts saves and the alert peak; older runs without incidents have no alert', () => {
  for (let seed = 1; seed <= 30; seed++) {
    const am = run(seed);
    const sum = summariseRun(am.events, { outcome: am.aborted ? 'aborted' : 'completed' });
    assert.equal(sum.saves.length, am.events.filter((e) => e.kind === 'save' && e.success && e.via !== 'patch').length);
    assert.ok(sum.alert >= 0 && sum.alert <= 3, `seed ${seed}: alert ${sum.alert}`);
  }
  assert.equal(summariseRun([{ kind: 'beat', text: 'x' }], { outcome: 'completed' }).alert, null);
});
