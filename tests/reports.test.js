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

// Older jobs still waiting for their lines (drafts/writing-tasks.md, task 1). Take a job
// off this list when its lines go in; the second check makes sure nobody forgets to.
const STILL_TO_WRITE = ['penthouse', 'protection'];

test('every job has a report line for every outcome (except those still being written)', () => {
  for (const m of MISSIONS.filter((x) => !STILL_TO_WRITE.includes(x.id))) assert.deepEqual(missing(m.crises), [], m.id);
  for (const id of STILL_TO_WRITE) assert.ok(missing(MISSIONS.find((m) => m.id === id).crises).length, `${id} is done: take it off STILL_TO_WRITE`);
});

test('report lines only use slots the game can fill', () => {
  const all = [...MISSIONS.flatMap((m) => m.crises), ...TWISTS];
  for (const c of all) for (const ch of c.choices) for (const line of Object.values(ch.report ?? {})) {
    for (const [, key] of line.matchAll(/\{(\w+)(?::\w+)?\}/g)) assert.ok(SLOTS.has(key), `${c.id}.${ch.id}: unknown slot {${key}}`);
  }
});
