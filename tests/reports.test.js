// Report lines: the plain account of each choice in the job report (and, later, hands-off
// runs and mission logs). Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MISSIONS } from '../src/data/missions.js';
import { DISTRICT_CRISES } from '../src/data/districtCrises.js';
import { TWISTS } from '../src/data/twists.js';
import { CAST } from '../src/data/cast.js';

const ROLES = ['driver', 'tech', 'face', 'muscle', 'medic', 'infiltrator'];
const SLOTS = new Set(['op', 'district', 'faction', ...ROLES, ...Object.keys(CAST)]);

/** Every choice needs a success line; a choice that can fail needs a failure line too. */
const missing = (crises) => crises.flatMap((c) => c.choices.flatMap((ch) => [
  !ch.report?.success && `${c.id}.${ch.id} success`,
  ch.failure && ch.kind !== 'abort' && !ch.report?.failure && `${c.id}.${ch.id} failure`,
].filter(Boolean)));

test('district crises and twists have a report line for every outcome', () => {
  assert.deepEqual(missing(Object.values(DISTRICT_CRISES).flat()), []);
  assert.deepEqual(missing(TWISTS), []);
});

test('every job has a report line for every outcome', () => {
  for (const m of MISSIONS) assert.deepEqual(missing(m.crises), [], m.id);
});

test('report lines only use slots the game can fill', () => {
  const all = [...MISSIONS.flatMap((m) => m.crises), ...TWISTS];
  for (const c of all) for (const ch of c.choices) for (const line of Object.values(ch.report ?? {})) {
    for (const [, key] of line.matchAll(/\{(\w+)(?::\w+)?\}/g)) assert.ok(SLOTS.has(key), `${c.id}.${ch.id}: unknown slot {${key}}`);
  }
});

// Visibility (2026-10-26): a bonus the game applies is a bonus the player can see.
test('the risk read names every bonus: traits, a veteran on the crew, the approach, backup', async () => {
  const { createNewGame } = await import('../src/core/state.js');
  const M = await import('../src/core/mission.js');
  const { addOffer } = await import('../src/core/jobs.js');
  let s = createNewGame({ seed: 409, startCrew: 'fresh' });
  s.jobs = []; addOffer(s, 'container409');
  const tech = s.crew.find((o) => o.role === 'tech');
  const face = s.crew.find((o) => o.role === 'face');
  tech.traits = ['chromed']; face.traits = ['veteran'];
  s = M.startMission(s, s.jobs[0].id, [tech.id, face.id], 'stealth');
  const read = (crisis, choice) => {
    s.activeMission.queue = [{ type: 'crisis', id: crisis }, { type: 'beat', index: 0 }]; s.activeMission.step = 0;
    return M.describeCrisis(s).choices.find((c) => c.id === choice).riskReason;
  };
  assert.match(read('groaning_stack', 'brace'), /Chromed \+2, stealth approach \+1/);
  const cool = read('cutter', 'splash');
  if (cool.startsWith(tech.handle)) assert.match(cool, new RegExp(`${face.handle} steadies them \\+1`));
});
