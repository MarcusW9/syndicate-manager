// The plan bar's read (2026-11-05): the skills read names the key stat the crises are hardest on,
// so the bar can always say what sets the risk instead of "Crew matches the job well" at mid risk.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame } from '../src/core/state.js';
import { assessJob, successChance, rollTarget } from '../src/core/risk.js';
import { MISSIONS } from '../src/data/missions.js';

test('assessJob names its weakest key stat, the one with the lowest chance', () => {
  const s = createNewGame({ seed: 3, startCrew: 'fresh' });
  for (const m of MISSIONS.slice(0, 12)) {
    const read = assessJob(m, s.crew.slice(0, m.crewSize), 'stealth');
    const w = read.weakest;
    assert.ok(w, m.id);
    assert.ok(m.keyStats.includes(w.stat), m.id);
    assert.equal(Math.round(w.chance * 1000), Math.round(successChance(w.value, rollTarget(m)) * 1000), m.id);
    // A mid or worse skills read always has a weakest stat under the low-risk line.
    if (read.level !== 'low') assert.ok(w.chance < 0.75 + 1e-9, m.id);
  }
});

test('with no crew there is no weakest stat to name', () => {
  assert.equal(assessJob(MISSIONS[0], [], 'stealth').weakest, undefined);
});
