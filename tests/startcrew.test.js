// The starting crew (DESIGN.md and PLAN-PROGRESSION.md, 2026-10-25): every new game
// opens with five generated raw rookies in a cheap first safehouse, on small work.
// The authored five ('classic') stay as the fixed crew the rule tests use.

import test from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame } from '../src/core/state.js';
import { FRESH_CREW_ROLES, FRESH_CREW_WAGES } from '../src/core/recruits.js';
import { validateCrew } from '../src/core/validate.js';
import * as M from '../src/core/mission.js';
import { templateById } from '../src/core/jobs.js';
import { primaryStat } from '../src/core/development.js';
import { playWeeks, playMission, carefulPolicy } from './play.js';

test('the classic start is still the authored five', () => {
  const s = createNewGame({ seed: 1 });
  assert.deepEqual(s.crew.map((o) => o.handle).sort(), ['Jax', 'Static', 'Stitch', 'Velvet', 'Wheels']);
  assert.match(s.inbox[0].body, /Wheels says the crew trusts you/);
});

test('a fresh crew: five raw rookies aged 18-24, one of each core role, with room to grow', () => {
  for (let seed = 1; seed <= 500; seed++) {
    const s = createNewGame({ seed, startCrew: 'fresh' });
    assert.deepEqual(s.crew.map((o) => o.role).sort(), [...FRESH_CREW_ROLES].sort(), `seed ${seed}`);
    assert.ok(s.crew.every((o) => o.tier === 'rookie' && o.age >= 18 && o.age <= 24), `seed ${seed}: rookies 18-24`);
    for (const o of s.crew) {
      const main = o.stats[primaryStat(o)];
      assert.ok(main >= 8 && main <= 11, `seed ${seed}: ${o.handle} main ${main}`);
      assert.ok(o.potential[primaryStat(o)] >= 14, `seed ${seed}: ${o.handle} ceiling`);
    }
    assert.deepEqual(validateCrew(s.crew), [], `seed ${seed}`);
    assert.equal(new Set(s.crew.map((o) => o.id)).size, 5, `seed ${seed}: ids`);
    assert.equal(new Set(s.crew.map((o) => o.handle)).size, 5, `seed ${seed}: handles`);
    assert.ok(s.crew.every((o) => o.condition && o.trust && o.history.length), `seed ${seed}: full operatives`);
    assert.doesNotMatch(s.inbox[0].body, /undefined|\{\w+\}/);
  }
});

test('a fresh crew works for street wages, in a band so every run opens fair', () => {
  for (let seed = 1; seed <= 500; seed++) {
    const bill = createNewGame({ seed, startCrew: 'fresh' }).crew.reduce((n, o) => n + o.wage, 0);
    assert.ok(bill >= FRESH_CREW_WAGES[0] && bill <= FRESH_CREW_WAGES[1], `seed ${seed}: wages ${bill}`);
  }
});

test('a fresh crew starts small: cheap rent and only small work on the board', () => {
  const s = createNewGame({ seed: 3, startCrew: 'fresh' });
  assert.equal(s.rent, 1500);
  assert.ok(s.jobs.length && s.jobs.every((j) => templateById(j.templateId).threat === 1), 'threat-1 jobs only');
  assert.match(s.inbox[0].body, /Nobody in .+ knows your names yet/);
});

test('the same seed gives the same fresh crew', () => {
  const a = createNewGame({ seed: 42, startCrew: 'fresh' });
  const b = createNewGame({ seed: 42, startCrew: 'fresh' });
  assert.deepEqual(a.crew, b.crew);
  assert.notDeepEqual(a.crew.map((o) => o.name), createNewGame({ seed: 43, startCrew: 'fresh' }).crew.map((o) => o.name));
});

test('a fresh crew can play the opening jobs', () => {
  for (let seed = 1; seed <= 50; seed++) {
    const s = createNewGame({ seed, startCrew: 'fresh' });
    for (const job of s.jobs) {
      const started = M.startMission(s, job.id, s.crew.slice(0, templateById(job.templateId).crewSize).map((o) => o.id), 'stealth');
      assert.ok(started.activeMission, `seed ${seed} ${job.templateId}`);
      playMission(started, carefulPolicy);
    }
  }
});

test('economy: a careful player with a fresh crew survives the first month but is not rich', () => {
  // Same bands as the classic-crew economy test in rules.test.js.
  const results = [];
  for (let seed = 1; seed <= 200; seed++) results.push(playWeeks(4, seed, carefulPolicy, { startCrew: 'fresh' }));
  const cash = results.map((r) => r.state.cash).sort((a, b) => a - b);
  const median = cash[Math.floor(cash.length / 2)];
  const broke = cash.filter((c) => c < 0).length / cash.length;
  const deathsPerRun = results.reduce((n, r) => n + r.deaths, 0) / results.length;
  assert.ok(median > 0 && median < 30000, `median cash after 4 weeks: ${median}`);
  assert.ok(broke < 0.35, `${Math.round(broke * 100)}% of careful players broke after 4 weeks`);
  assert.ok(deathsPerRun < 0.1, `careful play lost ${deathsPerRun} operatives per month`);
});
