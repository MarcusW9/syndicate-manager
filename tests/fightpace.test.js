// Pace never changes outcomes (watchable-combat Slice 0a): the same saved state, played watched (Watch and Fast are
// one core path), handed off from the first round, or with callIn 'never', ends in an identical state when the
// call-ins are answered the same way. Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame } from '../src/core/state.js';
import * as M from '../src/core/mission.js';
import { addOffer, templateById } from '../src/core/jobs.js';
import { autoStep } from '../src/core/autorun.js';
import { runFight, fightAnswer } from '../src/core/runfight.js';
import { resolvePending } from '../src/core/mission.js';
import { handOffFight } from '../src/core/runbattle.js';
import * as Fight from '../src/core/fight.js';

globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };

function atFight(seed, templateId) {
  let s = createNewGame({ seed, startCrew: 'fresh' });
  s.jobs = [];
  addOffer(s, templateId);
  s = M.startMission(s, s.jobs[0].id, s.crew.slice(0, templateById(templateId).crewSize).map((o) => o.id), 'loud', { callIn: 'every', orders: 'steady' });
  s.activeMission.orders = 'steady';
  for (let g = 0; g < 400 && !s.activeMission.done; g++) {
    if (s.activeMission.battle && M.currentStep(s.activeMission)?.type === 'battle') return s;
    const next = autoStep(s, { force: true });
    if (next === s) throw new Error('stuck');
    s = next;
  }
  return null; // this seed never reached a fight
}

/** Play the fight to its end, answering call-ins as an unwatched crew would (dilemmas by the risk level, death's door: pull back). */
function playOut(s) {
  for (let g = 0; g < 80 && s.activeMission.battle && !s.activeMission.battle.end && M.currentStep(s.activeMission)?.type === 'battle'; g++) {
    const am = s.activeMission;
    if (am.pending) s = resolvePending(s, am.pending.kind === 'dilemma' ? fightAnswer(am).id : 'out');
    else s = runFight(s);
  }
  return s;
}

const summary = (s) => {
  const am = s.activeMission;
  const b = am.battle;
  // Outcomes, not wording: a crew that is never called in skips the death's-door prompt, so the report prose differs.
  return {
    outcome: b ? Fight.outcomeOf(b) : null, end: b?.end ?? null, extraHeat: am.extraHeat, rngCounter: s.rngCounter, done: am.done,
    fightDead: am.fightDead ?? [], reputation: s.reputation, injuries: s.crew.map((o) => [o.id, o.injury ?? null, o.dead ?? false]),
  };
};

test('the same fight ends the same watched, handed off or with no call-ins', () => {
  let compared = 0;
  for (const id of ['data_pull', 'quiet_hours', 'warehouse', 'protection']) {
    for (let seed = 1; seed <= 6; seed++) {
      const s0 = atFight(seed, id);
      if (!s0 || s0.activeMission.battle?.engine !== 2) continue;
      const watched = playOut(structuredClone(s0));
      const handed = playOut(handOffFight(structuredClone(s0)));
      const never = structuredClone(s0);
      never.activeMission.callIn = 'never';
      const unwatched = playOut(never);
      const a = summary(watched);
      assert.deepEqual(summary(handed), a, `${id} seed ${seed}: handed off differs from watched`);
      assert.deepEqual(summary(unwatched), a, `${id} seed ${seed}: callIn never differs from watched`);
      compared++;
    }
  }
  assert.ok(compared >= 4, `compared ${compared} fights`);
});
