// Rule tests. Run with: npm test
// These guard the design promises in DESIGN.md. If one fails, a change has
// broken a rule players rely on.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame, SAVE_VERSION } from '../src/core/state.js';
import * as M from '../src/core/mission.js';
import { MISSIONS } from '../src/data/missions.js';
import { STARTING_CREW } from '../src/data/operatives.js';
import { validateMissions, validateCrew } from '../src/core/validate.js';
import { templateById } from '../src/core/jobs.js';
import { playMission, randomPolicy, playWeeks } from './play.js';

// Saves load through save.js, which touches browser storage; test the migration via a stub.
globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
const { importSave } = await import('../src/save/save.js');
const asFile = (obj) => ({ text: async () => JSON.stringify(obj) });

test('content passes validation (exits, failure text, ages)', () => {
  assert.deepEqual([...validateMissions(MISSIONS), ...validateCrew(STARTING_CREW)], []);
});

test('every mission type has at least 6 crises', () => {
  for (const m of MISSIONS) assert.ok(m.crises.length >= 6, `${m.id} has ${m.crises.length}`);
});

test('nobody ever dies unless the player chose "push on" (3,000 random missions)', () => {
  for (let seed = 1; seed <= 3000; seed++) {
    let s = createNewGame({ seed });
    const job = s.jobs[seed % s.jobs.length];
    const tpl = templateById(job.templateId);
    s = M.startMission(s, job.id, s.crew.slice(0, tpl.crewSize).map((o) => o.id), ['stealth', 'loud', 'social'][seed % 3]);
    const { state, pushed } = playMission(s, randomPolicy(seed));
    if (!pushed) assert.equal(state.activeMission.result.deaths.length, 0, `death without push on, seed ${seed}`);
  }
});

test('aborting always brings everyone home', () => {
  const abortAll = { critical: () => 'extract', crisis: (c) => c.find((x) => x.kind === 'abort') };
  for (let seed = 1; seed <= 300; seed++) {
    let s = createNewGame({ seed });
    const job = s.jobs[seed % s.jobs.length];
    const tpl = templateById(job.templateId);
    s = M.startMission(s, job.id, s.crew.slice(0, tpl.crewSize).map((o) => o.id), 'stealth');
    const { state } = playMission(s, abortAll);
    assert.equal(state.activeMission.result.deaths.length, 0);
    assert.equal(state.crew.length, 5);
  }
});

test('Story difficulty: nobody dies even when pushing on', () => {
  const pushAll = { critical: (o) => (o.includes('push') ? 'push' : o[0]), crisis: (c) => c.find((x) => x.kind === 'push') ?? c[0] };
  for (let seed = 1; seed <= 500; seed++) {
    let s = createNewGame({ seed, difficulty: 'story' });
    const job = s.jobs.find((j) => j.templateId === 'warehouse');
    s = M.startMission(s, job.id, s.crew.slice(0, 4).map((o) => o.id), 'loud');
    assert.equal(playMission(s, pushAll).state.activeMission.result.deaths.length, 0);
  }
});

test('no crisis text is left with an unfilled {placeholder}', () => {
  for (const tpl of MISSIONS) {
    for (const crisis of tpl.crises) {
      for (const size of [1, tpl.crewSize]) {
        let s = createNewGame({ seed: 1 });
        const job = s.jobs.find((j) => j.templateId === tpl.id);
        s = M.startMission(s, job.id, s.crew.slice(0, size).map((o) => o.id), 'stealth');
        Object.assign(s.activeMission, { queue: [{ type: 'crisis', id: crisis.id }], step: 0, focusOp: s.activeMission.crewIds[0] });
        const view = JSON.stringify(M.describeCrisis(s));
        assert.doesNotMatch(view, /\{\w+\}/, `${tpl.id}/${crisis.id}`);
      }
    }
    for (const beat of tpl.beats) assert.doesNotMatch(M.fill(beat, { crew: [] }, { crewIds: [] }), /\{\w+\}/);
  }
});

test('a v1 save upgrades to the current version with a job board', async () => {
  const v1 = createNewGame({ seed: 3 });
  delete v1.jobs; delete v1.jobSeq; delete v1.rngCounter; delete v1.activeMission;
  v1.version = 1;
  const loaded = await importSave(asFile(v1));
  assert.equal(loaded.version, SAVE_VERSION);
  assert.equal(loaded.jobs.length, 3);
  assert.equal(loaded.activeMission, null);
});

test('saves from a newer version are refused, not corrupted', async () => {
  await assert.rejects(importSave(asFile({ ...createNewGame(), version: SAVE_VERSION + 1 })));
  await assert.rejects(importSave(asFile({ hello: 'world' })));
});

test('economy: a careful player survives the first month but is not rich', () => {
  const results = [];
  for (let seed = 1; seed <= 200; seed++) results.push(playWeeks(4, seed));
  const cash = results.map((r) => r.state.cash).sort((a, b) => a - b);
  const median = cash[Math.floor(cash.length / 2)];
  const broke = cash.filter((c) => c < 0).length / cash.length;
  const deathsPerRun = results.reduce((n, r) => n + r.deaths, 0) / results.length;
  // Bands tuned 2026-10-23. If balance changes on purpose, update these and log it in DESIGN.md.
  assert.ok(median > 0 && median < 30000, `median cash after 4 weeks: ${median}`);
  assert.ok(broke < 0.35, `${Math.round(broke * 100)}% of careful players broke after 4 weeks`);
  assert.ok(deathsPerRun < 0.1, `careful play lost ${deathsPerRun} operatives per month`);
});
