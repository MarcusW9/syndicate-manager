// Runner paths (renown slice 3, 2026-11): which path a record is on and how far along.
// Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PATHS } from '../src/data/paths.js';
import { freshRecord } from '../src/core/record.js';
import { pathProgress, pathOf, legendProgress } from '../src/core/fame.js';

const rec = (extra) => ({ ...freshRecord(), ...extra });
const op = (extra, more = {}) => ({ handle: 'T', tier: 'pro', fame: 'respected', standing: 50, record: rec(extra), ...more });
const fieldExists = (f) => (Array.isArray(f) ? f.every(fieldExists) : f.split('.')[0] in freshRecord());

test('data: five paths in the proposal order, each condition on a real record field, Elite below Legend', () => {
  assert.deepEqual(PATHS.map((p) => p.id), ['ghost', 'enforcer', 'earner', 'iron', 'lifer']);
  for (const p of PATHS) {
    assert.ok(p.name && p.line && p.conditions.length, p.id);
    for (const c of p.conditions) {
      assert.ok(fieldExists(c.field), `${p.id}: ${c.field}`);
      assert.ok(c.elite > 0 && c.elite <= c.legend, `${p.id}: ${c.label}`);
      assert.ok(c.label && !/[{}]/.test(c.label));
    }
  }
  const enforcer = PATHS.find((p) => p.id === 'enforcer');
  assert.deepEqual(enforcer.conditions.map((c) => [c.field, c.elite, c.legend]), [['fightsWon', 20, 40], ['carriesByStat.combat', 8, 16]]);
});

test('progress is the average of each condition, capped at 1', () => {
  const ghost = pathProgress(op({ clean: 15, bestCleanStreak: 5 })).find((p) => p.id === 'ghost');
  assert.equal(ghost.toElite, 1); assert.equal(ghost.toLegend, 0.5);
  assert.equal(ghost.eliteMet, true); assert.equal(ghost.legendMet, false);
  const over = pathProgress(op({ clean: 90, bestCleanStreak: 0 })).find((p) => p.id === 'ghost');
  assert.equal(over.toLegend, 0.5, 'one condition far over the line does not make up for the other');
  assert.equal(over.eliteMet, false);
});

test('the path is the one furthest along towards Legend; a fresh record is a Ghost (ties go in table order)', () => {
  assert.equal(pathOf(op({})).id, 'ghost');
  assert.equal(pathOf(op({ fightsWon: 20, carriesByStat: { combat: 8 }, clean: 3 })).id, 'enforcer');
  assert.equal(pathOf(op({ bigScores: 12, wins: 30 })).id, 'earner');
  assert.equal(pathOf(op({ activeWeeks: 52, jobs: 80, clean: 10, bestCleanStreak: 2 })).id, 'lifer');
  // Ghost and Enforcer level: Ghost comes first.
  assert.equal(pathOf(op({ clean: 15, bestCleanStreak: 5, fightsWon: 20, carriesByStat: { combat: 8 } })).id, 'ghost');
});

test('Enforcer reads fights won and combat carries; Iron adds lives saved and near-deaths survived', () => {
  const enf = pathProgress(op({ fightsWon: 40, carriesByStat: { combat: 16, stealth: 9 } })).find((p) => p.id === 'enforcer');
  assert.equal(enf.legendMet, true);
  assert.equal(pathProgress(op({ fightsWon: 40, carriesByStat: { stealth: 16 } })).find((p) => p.id === 'enforcer').eliteMet, false);
  const iron = pathProgress(op({ unscathed: 20, broughtHome: 1, criticalsSurvived: 2 })).find((p) => p.id === 'iron');
  assert.equal(iron.eliteMet, true);
  assert.equal(iron.conditions[1].value, 3);
});

test('Legend readiness lists every condition; Lifers skip the at-level count', () => {
  const ghostLegend = { clean: 30, bestCleanStreak: 10, activeWeeks: 26, atLevel: 120 }; // at level: 120 since 2026-11-03 (was 40)
  assert.equal(legendProgress(op(ghostLegend, { fame: 'elite', tier: 'veteran' })).ready, true);
  const notVet = legendProgress(op(ghostLegend, { fame: 'elite', tier: 'pro' }));
  assert.equal(notVet.ready, false);
  assert.deepEqual(notVet.checks.filter((c) => !c.met).map((c) => c.label), ['a veteran']);
  assert.equal(legendProgress(op({ ...ghostLegend, atLevel: 119 }, { fame: 'elite', tier: 'veteran' })).ready, false);
  assert.equal(legendProgress(op({ activeWeeks: 52, jobs: 80, atLevel: 3 }, { fame: 'elite', tier: 'veteran' })).ready, true, 'a Lifer');
  assert.equal(legendProgress(op(ghostLegend, { fame: 'elite', tier: 'veteran' })).path.id, 'ghost');
});
