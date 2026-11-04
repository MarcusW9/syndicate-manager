// The job checker (core/jobcheck.js, scripts/check-job.mjs): every job in the game passes it,
// and it catches the mistakes a job drafted outside a session tends to make.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { checkJob, RETIRED } from '../src/core/jobcheck.js';
import { MISSIONS, ownCrises } from '../src/data/missions.js';
import { WRONG_HORSE } from '../src/data/missions/wronghorse.js';

const ids = MISSIONS.map((m) => m.id);
const clone = (o) => structuredClone(o);

test('every job in the game passes the checker', () => {
  for (const m of MISSIONS) {
    const { errors, warnings } = checkJob({ ...m, crises: ownCrises(m) }, { others: ids.filter((id) => id !== m.id) });
    assert.deepEqual(errors, [], m.id);
    // 2026-11-03: the 19 choices that named a role they didn't require now say {op}; keep it that way.
    assert.deepEqual(warnings.filter((w) => w.includes("doesn't require")), [], m.id);
  }
});

test('a fresh copy of a good job, under a new id, has no errors or warnings', () => {
  const { errors, warnings } = checkJob({ ...clone(WRONG_HORSE), id: 'wrong_horse_two' }, { others: ids });
  assert.deepEqual(errors, []);
  assert.deepEqual(warnings.filter((w) => !w.startsWith('brief')), []);
});

test('the checker catches the usual mistakes', () => {
  const job = clone(WRONG_HORSE);
  const [c0, c1, c2, c3] = job.crises;
  c0.text = 'Auntie Fung sent {fung} to Kowloon.'; // unknown token, retired name
  c1.choices = c1.choices.filter((ch) => ch.kind !== 'abort'); // no way out
  c2.choices.push(c2.choices.shift()); // the way out isn't last
  c3.choices[0].difficulty = 19; // far outside the tier
  c3.choices.find((ch) => ch.kind === 'abort').difficulty = 8; // an exit that rolls
  job.crises[4].choices[0].cost = { payCut: 2, credits: 5 }; // bad costs
  job.crises[5].situations = ['heist']; // unknown situation
  const { errors, warnings } = checkJob(job, { others: ids });
  const has = (list, text) => assert.ok(list.some((e) => e.includes(text)), `expected "${text}" in:\n${list.join('\n')}`);
  has(errors, 'already a job');
  has(errors, 'unknown token {fung}');
  has(errors, '"Kowloon" is a retired name');
  has(errors, `${c1.id}: no abort or extract choice`);
  has(errors, `${c2.id}: the way out must be the last choice`);
  has(errors, "doesn't roll (difficulty 0)");
  has(errors, 'payCut 2 must be between -1 and 1');
  has(errors, 'unknown cost "credits"');
  has(errors, 'unknown situation "heist"');
  has(warnings, 'difficulty 19 is outside');
});

test('routine work is held to routine numbers: small, short, rookie or threat 2', () => {
  const big = { ...clone(WRONG_HORSE), id: 'routine_horse', routine: true };
  const { errors, warnings } = checkJob(big, { others: ids });
  assert.deepEqual(errors, []);
  assert.ok(warnings.some((w) => w.startsWith('a routine job is rookie or threat 2')), 'threat 3 flagged');
  assert.ok(warnings.some((w) => w.startsWith('a routine job takes a crew of 2')), 'crew of 3 flagged');
  const small = { ...big, threat: 2, crewSize: 2, days: 1 };
  assert.ok(!checkJob(small, { others: ids }).warnings.some((w) => w.startsWith('a routine job')), 'threat 2, crew of 2, a day: fine');
});

test('a rookie job is held to rookie numbers', () => {
  const job = { ...clone(WRONG_HORSE), id: 'rookie_horse', rookie: true, threat: 1 };
  const { warnings } = checkJob(job, { others: ids });
  assert.ok(warnings.some((w) => w.includes('outside 3-8')), 'threat-3 rolls flagged on a rookie job');
  assert.ok(warnings.some((w) => w.startsWith('pay ¥5500')), 'threat-3 pay flagged on a rookie job');
});

test("the checker's retired names are WORLD.md's", () => {
  const line = readFileSync(new URL('../WORLD.md', import.meta.url), 'utf8').split('\n').find((l) => l.startsWith('RETIRED'));
  const rest = readFileSync(new URL('../WORLD.md', import.meta.url), 'utf8');
  const block = rest.slice(rest.indexOf(line), rest.indexOf('```', rest.indexOf(line)));
  for (const name of RETIRED) assert.ok(block.includes(name), `${name} is in WORLD.md's RETIRED line`);
});
