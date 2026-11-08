// The getaway step (drafts/PROPOSAL-piloting.md): only a job leaving heat gets a roll; success sheds
// heat, never below zero; failure adds nothing; a bad failure leaves a tail. Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { playGetaway, getawayRead, getawayPilot, GETAWAY } from '../src/core/piloting.js';
import { templateById } from '../src/core/jobs.js';
import { createNewGame } from '../src/core/state.js';
import * as M from '../src/core/mission.js';
import { addOffer } from '../src/core/jobs.js';
import { MISSIONS } from '../src/data/missions.js';
import { APPROACHES } from '../src/data/approaches.js';
import { playMission, carefulPolicy } from './play.js';

const tpl = { threat: 2, rookie: false };
const pilot = (piloting, injury = 'healthy') => ({ id: 'p' + piloting, handle: 'P' + piloting, stats: { piloting }, condition: { injury }, traits: [] });
// A rng that gives a chosen d20 (d20 = 1 + floor(rng * 20)).
const fixed = (die) => () => (die - 1) / 20 + 0.001;

test('a quiet job has no getaway roll', () => {
  assert.equal(playGetaway({ pilot: pilot(15), heat: 0, template: tpl, rng: fixed(1) }), null);
  assert.equal(playGetaway({ pilot: null, heat: 3, template: tpl, rng: fixed(1) }), null);
});

test('results by margin: clean sheds 2, success 1, failure nothing, a bad failure leaves a tail', () => {
  const p = pilot(14);
  const need = getawayRead(p, tpl).need;
  const at = (margin) => playGetaway({ pilot: p, heat: 4, template: tpl, rng: fixed(need - 14 + margin) });
  assert.deepEqual([at(GETAWAY.clean).result, at(GETAWAY.clean).shed], ['clean', 2]);
  assert.deepEqual([at(0).result, at(0).shed], ['good', 1]);
  assert.deepEqual([at(-1).result, at(-1).shed, at(-1).tail], ['fail', 0, false]);
  assert.deepEqual([at(GETAWAY.bad).result, at(GETAWAY.bad).shed, at(GETAWAY.bad).tail], ['bad', 0, true]);
});

test('the getaway never takes the job below zero heat, and a failure never adds heat', () => {
  const p = pilot(20);
  const g = playGetaway({ pilot: p, heat: 1, template: tpl, rng: fixed(20) });
  assert.equal(g.result, 'clean');
  assert.equal(g.shed, 1);
  const bad = playGetaway({ pilot: pilot(1), heat: 2, template: tpl, rng: fixed(1) });
  assert.equal(bad.shed, 0);
});

test('alert makes it harder and the odds shown are the odds used', () => {
  const p = pilot(12);
  const calm = getawayRead(p, tpl, { alert: 0 });
  const hot = getawayRead(p, tpl, { alert: 2 });
  assert.equal(hot.need, calm.need + 2);
  assert.ok(hot.chance < calm.chance);
  const roll = (alert) => playGetaway({ pilot: p, heat: 3, template: tpl, alert, rng: fixed(10) });
  assert.equal(roll(0).need, calm.need);
  assert.equal(roll(2).need, hot.need);
});

test('the Wheels drives if able, else the best pilot who is fit', () => {
  const [a, b, c] = [pilot(8), pilot(15), pilot(12)];
  assert.equal(getawayPilot([a, b, c], c), c);
  assert.equal(getawayPilot([a, b, c], null), b);
  assert.equal(getawayPilot([a, pilot(18, 'critical'), c], null), c);
  assert.equal(getawayPilot([pilot(18, 'critical')], null), null);
});

test('over whole runs, a getaway is only rolled when heat is left, and heat only ever goes down by it', () => {
  let rolled = 0, quiet = 0;
  for (let seed = 1; seed <= 24; seed++) {
    const s = createNewGame({ seed, startCrew: 'fresh' });
    s.jobs = [];
    const id = MISSIONS.filter((m) => !m.rookie && !m.heistOnly && !m.opening)[seed % 5].id;
    addOffer(s, id);
    const tpl = templateById(id);
    const approach = seed % 2 ? 'loud' : 'stealth';
    const am = playMission(M.startMission(s, s.jobs[0].id, s.crew.slice(0, tpl.crewSize).map((o) => o.id), approach), carefulPolicy).state.activeMission;
    const spent = (am.aborted ? 0 : tpl.heat + (APPROACHES[approach]?.heat ?? 0)) + am.extraHeat;
    if (am.getaway) {
      rolled++;
      assert.ok(spent > 0, 'a getaway means there was heat to shed');
      assert.ok(am.result.heatGain >= 0 && am.result.heatGain === spent - am.getaway.shed);
    } else {
      quiet++;
      assert.equal(am.result.heatGain, spent);
    }
  }
  assert.ok(rolled > 0, 'loud runs roll the getaway');
});
