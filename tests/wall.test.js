// The wall panel that opens a report when someone died (owner's pick A, 2026-11-28, docs/mockups/2026-11-28-death-report.html):
// the run's finish names each runner who died, how, a life in numbers, and the call that led to it. Run with: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { stage } from '../scripts/stage-death.mjs';
import { autoStep } from '../src/core/autorun.js';
import * as M from '../src/core/mission.js';

test('a death puts its runner on the report\'s wall panel: how, their numbers, and the keep-fighting call that led to it', () => {
  const staged = stage();
  assert.ok(staged, 'a bleed-out staged');
  let s = structuredClone(staged.before);
  const am = s.activeMission;
  const dying = am.battle.runners[2];
  am.events.push({ kind: 'decision', push: true, text: '', choice: `Keep fighting with ${dying.handle} down`, why: null, report: `The crew kept fighting with ${dying.handle} down and bleeding.` });
  s = autoStep(s, { force: true });
  for (let g = 0; g < 300 && !s.activeMission.done; g++) s = autoStep(s, { force: true });
  s = M.closeMission(s);
  const report = s.inbox.find((m) => m.type === 'report');
  const [f] = report.timeline.fallen;
  assert.equal(f.id, dying.id);
  assert.match(f.how, /^Died in the fight on the /);
  assert.deepEqual(f.call, { label: `Keep fighting with ${dying.handle} down`, crew: false }, 'the call is the player\'s, by name');
  assert.ok(f.jobs >= 1 && f.fightsWon >= 0 && f.wins >= 0);
  assert.equal(s.memorial.at(-1).record.fightsWon, f.fightsWon, 'the wall and the memorial agree');
});

test('a run nobody died on has no wall panel', () => {
  const staged = stage();
  let s = structuredClone(staged.before);
  s.activeMission.untreated = [];
  const r = s.activeMission.battle.runners[2]; r.down = false; r.hp = r.max; r.fightOn = false;
  for (let g = 0; g < 300 && !s.activeMission.done; g++) s = autoStep(s, { force: true });
  s = M.closeMission(s);
  const report = s.inbox.find((m) => m.type === 'report');
  if (!s.memorial.length) assert.equal(report.timeline.fallen, undefined);
});

test('a v92 save gives its fallen a fights-won count of 0', async () => {
  const { importSave } = await import('../src/save/save.js');
  const { createNewGame, SAVE_VERSION } = await import('../src/core/state.js');
  const s = createNewGame({ seed: 2, startCrew: 'fresh' });
  s.version = 92;
  s.memorial = [{ id: 'x', handle: 'X', record: { jobs: 3, wins: 2, clean: 1, bestCleanStreak: 1, carries: 0, activeWeeks: 2 } }];
  const loaded = await importSave({ text: async () => JSON.stringify(s) });
  assert.equal(loaded.version, SAVE_VERSION);
  assert.equal(loaded.memorial[0].record.fightsWon, 0);
});
