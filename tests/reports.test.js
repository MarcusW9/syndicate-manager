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

test('rookie jobs have a report line for every outcome', () => {
  assert.deepEqual(missing(MISSIONS.filter((m) => m.rookie).flatMap((m) => m.crises)), []);
});

test('report lines only use slots the game can fill', () => {
  const all = [...MISSIONS.flatMap((m) => m.crises), ...TWISTS];
  for (const c of all) for (const ch of c.choices) for (const line of Object.values(ch.report ?? {})) {
    for (const [, key] of line.matchAll(/\{(\w+)(?::\w+)?\}/g)) assert.ok(SLOTS.has(key), `${c.id}.${ch.id}: unknown slot {${key}}`);
  }
});
