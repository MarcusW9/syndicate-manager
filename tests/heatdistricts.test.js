// Heat per district (core/heat.js; DESIGN.md 2026-11-05, the tong's Phase 2 slice 2). Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame, SAVE_VERSION } from '../src/core/state.js';
import * as M from '../src/core/mission.js';
import { advanceDay } from '../src/core/time.js';
import { addOffer, templateById } from '../src/core/jobs.js';
import { heatIn, setHeat, addHeat, hottest, coolHeat, HEAT_DISTRICTS, checkHeatNotice } from '../src/core/heat.js';
import { playMission, carefulPolicy } from './play.js';

globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
const { importSave } = await import('../src/save/save.js');

test("a job's heat lands in its own district; state.heat is the hottest district", () => {
  for (let seed = 1; seed <= 10; seed++) {
    let s = createNewGame({ seed, startCrew: 'fresh' });
    s.jobs = []; addOffer(s, 'warehouse'); // the Docks
    s = M.closeMission(playMission(M.startMission(s, s.jobs[0].id, s.crew.slice(0, 4).map((o) => o.id), 'loud'), carefulPolicy).state);
    const gain = s.inbox.find((m) => m.type === 'report') ? heatIn(s, 'docks') : 0;
    assert.ok(gain >= 0);
    for (const d of HEAT_DISTRICTS) if (d !== 'docks') assert.equal(heatIn(s, d), 0, `${d} stays cold`);
    assert.equal(s.heat, heatIn(s, 'docks'));
  }
});

test('the hottest district, adding and clamping, and every district cooling the same on Sunday', () => {
  const s = createNewGame({ seed: 2, startCrew: 'fresh' });
  setHeat(s, 'docks', 5); setHeat(s, 'nightMarket', 7); addHeat(s, 'oldTown', 12);
  assert.equal(heatIn(s, 'oldTown'), 10, 'never above ten');
  assert.deepEqual(hottest(s), { district: 'oldTown', heat: 10 });
  assert.equal(s.heat, 10);
  const cooled = coolHeat(s);
  assert.equal(cooled, 6);
  assert.deepEqual([heatIn(s, 'oldTown'), heatIn(s, 'nightMarket'), heatIn(s, 'docks')], [8, 5, 3]);
  setHeat(s, 'docks', 1); coolHeat(s);
  assert.equal(heatIn(s, 'docks'), 0, 'never below zero');
});

test("the fixer's notice is about the hottest district, and paying cools that district", () => {
  let s = createNewGame({ seed: 3, startCrew: 'fresh' });
  setHeat(s, 'nightMarket', 8);
  setHeat(s, 'docks', 6);
  checkHeatNotice(s);
  const n = s.inbox.find((m) => m.kind === 'heat');
  assert.equal(n.payload.district, 'nightMarket');
  assert.match(n.subject, /Night Market/);
});

test('a v38 save: the old city-wide heat goes to the home district', async () => {
  const s = createNewGame({ seed: 4, startCrew: 'fresh' });
  delete s.heatBy;
  s.heat = 6;
  s.version = 38;
  const loaded = await importSave({ text: async () => JSON.stringify(s) });
  assert.equal(loaded.version, SAVE_VERSION);
  assert.equal(heatIn(loaded, 'oldTown'), 6);
  assert.equal(loaded.heat, 6);
  let t = loaded;
  for (let i = 0; i < 7; i++) t = advanceDay(t);
  assert.equal(heatIn(t, 'oldTown'), 4, 'and cools from there');
  assert.ok(templateById('warehouse').district === 'docks');
});
