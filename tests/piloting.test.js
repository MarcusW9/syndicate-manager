// The getaway step (drafts/PROPOSAL-piloting.md): only a job leaving heat gets a roll; success sheds
// heat, never below zero; failure adds nothing; a bad failure leaves a tail. Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { playGetaway, getawayRead, getawayPilot, GETAWAY, FOLLOW, followedIn, homeHallOf } from '../src/core/piloting.js';
import { templateById } from '../src/core/jobs.js';
import { raidThreat } from '../src/core/raids.js';
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

test('a failed getaway leads them home: 3 days for a miss, 6 for a bad one; a pilot of 14+ shakes the lesser tail', () => {
  const run = (value, die) => playGetaway({ pilot: pilot(value), heat: 3, template: tpl, rng: fixed(die) });
  const need = (v) => getawayRead(pilot(v), tpl).need - v;
  assert.equal(run(10, need(10) - 1).followed, FOLLOW.days.fail);
  assert.equal(run(10, Math.max(1, need(10) - 5)).followed, run(10, Math.max(1, need(10) - 5)).result === 'bad' ? FOLLOW.days.bad : FOLLOW.days.fail);
  assert.equal(run(10, need(10) + 3).followed, 0, 'a success is not followed');
  const skilled = run(14, need(14) - 1);
  assert.equal(skilled.result, 'fail');
  assert.equal(skilled.followed, 0, 'a skilled pilot shakes a plain miss');
  const worse = run(14, Math.max(1, need(14) - 6));
  if (worse.result === 'bad') assert.equal(worse.followed, FOLLOW.days.bad - FOLLOW.skilledCut);
});

test('a followed hall: its raids are one threat step harder and can come at any heat', () => {
  const s = createNewGame({ seed: 5, startCrew: 'fresh' });
  const hall = s.halls[0];
  const d = hall.district;
  assert.equal(followedIn(s, d), false);
  const plain = { id: 'r', district: d, by: 'police' };
  hall.followedUntil = s.day + 3;
  assert.equal(followedIn(s, d), true);
  assert.equal(raidThreat(s, d, { ...plain, followed: true }), raidThreat(s, d, plain) + 1);
  s.day += 4;
  assert.equal(followedIn(s, d), false, 'it wears off');
});

test('homeHallOf picks the hall most of the crew live in', () => {
  const s = createNewGame({ seed: 6, startCrew: 'fresh' });
  const crew = [{ hall: 'nightMarket' }, { hall: 'nightMarket' }, { hall: 'oldTown' }];
  s.halls = [{ district: 'oldTown' }, { district: 'nightMarket' }];
  assert.equal(homeHallOf(s, crew, 'oldTown').district, 'nightMarket');
  s.halls = [{ district: 'oldTown' }];
  assert.equal(homeHallOf(s, crew, 'oldTown'), null, 'no hall where they live: nowhere to be followed to');
});

test('checkRaids: a followed hall draws a raid at a lower heat; quiet ground still never does', async () => {
  const { checkRaids } = await import('../src/core/raids.js');
  const { setHeat } = await import('../src/core/heat.js');
  const { RAID } = await import('../src/data/raids.js');
  const warned = (heat, followed) => {
    const s = createNewGame({ seed: 8, startCrew: 'fresh' });
    setHeat(s, s.halls[0].district, heat);
    if (followed) s.halls[0].followedUntil = 9999;
    for (let i = 0; i < 40 && !(s.raids ?? []).length; i++) { s.day += 1; checkRaids(s); }
    return s.raids ?? [];
  };
  assert.equal(warned(RAID.heatAt - FOLLOW.heatEase, false).length, 0, 'not hot enough alone');
  const r = warned(RAID.heatAt - FOLLOW.heatEase, true);
  assert.equal(r.length, 1);
  assert.equal(r[0].followed, true);
  assert.equal(warned(0, true).length, 0, 'no heat, no raid: careful play stays clear');
});
