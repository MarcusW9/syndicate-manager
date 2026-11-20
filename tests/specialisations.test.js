// Specialisations (PLAN-CORE-LOOP.md, slice 5b): jobs on overwatch with the stats for it make one ready; since 2026-11-20 it is
// learned at a level-up (tests/levelup.test.js), not by Joss's offer. One each. Marksman and Drone Jockey change what their kit does
// from overwatch. Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame } from '../src/core/state.js';
import * as M from '../src/core/mission.js';
import { addOffer } from '../src/core/jobs.js';
import { advanceDay } from '../src/core/time.js';
import { overwatchKit, baseKit } from '../src/core/gear.js';
import { noteOverwatchJob, SPECIALISATIONS } from '../src/core/specialisations.js';
import { skillMenu } from '../src/core/abilities.js';
import { playMission, carefulPolicy, arm } from './play.js';

/** The specialisations ready for them (the skills list's Ready rows): stats and jobs on overwatch both. */
const eligible = (op) => skillMenu(op).items.filter((i) => i.slot === 'spec' && i.state === 'ready').map((i) => i.id);

/** A fresh crew; crew[2] can shoot and stay calm, crew[3] flies drones. */
function crew(seed = 5) {
  const s = createNewGame({ seed, startCrew: 'fresh' });
  Object.assign(s.crew[2].stats, { combat: 11, cool: 9 });
  Object.assign(s.crew[3].stats, { piloting: 12 });
  return s;
}

test('not ready without both the stats and the jobs', () => {
  const s = crew();
  const [, , shooter, , weak] = s.crew;
  assert.deepEqual(eligible(shooter), []);
  for (let i = 0; i < 2; i++) noteOverwatchJob(shooter, 'rifle');
  assert.deepEqual(eligible(shooter), [], 'two jobs is not enough');
  noteOverwatchJob(shooter, 'rifle');
  assert.deepEqual(eligible(shooter), ['marksman']);
  noteOverwatchJob(shooter, 'drone'); noteOverwatchJob(shooter, 'drone'); noteOverwatchJob(shooter, 'drone');
  assert.deepEqual(eligible(shooter), ['marksman'], 'drone jobs without the piloting: no Drone Jockey');
  weak.stats.combat = 6; weak.stats.cool = 4;
  for (let i = 0; i < 5; i++) noteOverwatchJob(weak, 'rifle');
  assert.deepEqual(eligible(weak), [], 'jobs without the stats: no Marksman');
});

test('a Marksman: one more shot, +1, and a miss costs no heat; only with a rifle', () => {
  const s = crew();
  const op = s.crew[2];
  arm(s, op.id, 'rifle', 'drone');
  const before = overwatchKit(op, 'rifle');
  op.spec = { id: 'marksman', day: 1 };
  const after = overwatchKit(op, 'rifle');
  assert.equal(after.uses, before.uses + 1);
  assert.equal(after.bonus, before.bonus + 1);
  assert.ok(after.notes.includes('Marksman +1'));
  assert.equal(after.heatOnHit, true);
  assert.deepEqual(overwatchKit(op, 'drone'), { ...baseKit('drone'), heatOnHit: false, spec: null }, 'nothing changes with the drone');
});

test('a Drone Jockey: one more action, +1, half the neural load', () => {
  const s = crew();
  const op = s.crew[3];
  arm(s, op.id, 'drone');
  op.spec = { id: 'droneJockey', day: 1 };
  const k = overwatchKit(op, 'drone');
  assert.equal(k.uses, baseKit('drone').uses + 1);
  assert.equal(k.neural, SPECIALISATIONS.droneJockey.effect.neural);
  assert.ok(k.neural < baseKit('drone').neural);
});

test('on a real run: a Marksman starts with an extra shot, and missed shots add no heat', () => {
  let missed = 0;
  for (let seed = 1; seed <= 200 && missed < 3; seed++) {
    const s = crew(seed);
    s.jobs = []; addOffer(s, 'warehouse');
    const ow = s.crew[2];
    arm(s, ow.id, 'rifle');
    ow.spec = { id: 'marksman', day: 1 };
    const st = M.startMission(s, s.jobs[0].id, [s.crew[0].id], 'loud', { overwatch: { id: ow.id, kit: 'rifle' } });
    assert.equal(st.activeMission.overwatch.left, baseKit('rifle').uses + 1);
    const am = playMission(st, carefulPolicy).state.activeMission;
    for (const e of am.events.filter((x) => x.kind === 'save' && x.via === 'overwatch')) {
      if (e.success) assert.deepEqual(e.outcomeCost, { heat: 1 });
      else { assert.deepEqual(e.outcomeCost, {}, 'a miss costs nothing'); missed++; }
    }
  }
  assert.ok(missed >= 1, `saw ${missed} misses`);
});

test('three jobs on overwatch with a rifle, with the stats, and Marksman is ready after the third', () => {
  let s = crew(8);
  const ow = s.crew[2];
  arm(s, ow.id, 'rifle');
  for (let job = 1; job <= 3; job++) {
    s.jobs = []; addOffer(s, 'container409');
    s = M.startMission(s, s.jobs[0].id, [s.crew[0].id, s.crew[1].id], 'stealth', { overwatch: { id: ow.id, kit: 'rifle' } });
    s = M.closeMission(playMission(s, carefulPolicy).state);
    // Let them come home and rest before the next one.
    for (let d = 0; d < 10; d++) s = advanceDay(s);
    const me = s.crew.find((o) => o.id === ow.id);
    if (!me) return; // the careful player can still lose someone on a bad night; nothing to check
    me.stats.combat = Math.max(me.stats.combat, 11); me.stats.cool = Math.max(me.stats.cool, 9);
    me.condition.injury = 'healthy'; me.condition.injuryDays = 0; me.condition.fatigue = 0;
    assert.equal(me.track.overwatch.rifle, job);
    assert.deepEqual(eligible(me), job < 3 ? [] : ['marksman'], `after job ${job}`);
  }
});
