// Gear (PLAN-CORE-LOOP.md, slice 5): a stash and four slots per runner; the rifle and the drone
// are items now, and overwatch needs one. Gear is a bonus shown in the breakdown, never a gate
// beyond that. A new crew starts with nothing; some recruits bring their own. Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame, SAVE_VERSION } from '../src/core/state.js';
import * as M from '../src/core/mission.js';
import { addOffer } from '../src/core/jobs.js';
import { effectiveStat, crewRoll } from '../src/core/crew.js';
import { bestSave } from '../src/core/incidents.js';
import { jossPicks } from '../src/core/squad.js';
import { templateById } from '../src/core/jobs.js';
import { advanceDay } from '../src/core/time.js';
import { generateRecruit, hire } from '../src/core/recruits.js';
import { buyGear, sellGear, equip, unequip, priceOf, sellPrice, kitsFor, overwatchKit, seriousGuard, SLOTS, GEAR } from '../src/core/gear.js';
import { playMission, carefulPolicy, arm } from './play.js';

globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
const { importSave } = await import('../src/save/save.js');

const fresh = (seed = 3) => createNewGame({ seed, startCrew: 'fresh' });

test('a new crew starts with nothing: an empty stash and four empty slots each', () => {
  const s = fresh();
  assert.deepEqual(s.stash, []);
  for (const op of s.crew) assert.deepEqual(Object.keys(op.gear), Object.keys(SLOTS)), assert.ok(Object.values(op.gear).every((v) => v === null));
});

test('buying costs its price and goes to the stash; you can\'t buy what you can\'t afford; selling pays half', () => {
  let s = fresh();
  const cash = s.cash;
  s = buyGear(s, 'rifle');
  assert.equal(s.cash, cash - priceOf('rifle'));
  assert.equal(s.stash.length, 1);
  assert.equal(s.stash[0].type, 'rifle');
  assert.ok(priceOf('rifle', 'pro') > priceOf('rifle'), 'pro costs more');
  const poor = { ...s, cash: 10 };
  assert.equal(buyGear(poor, 'drone'), poor);
  assert.equal(buyGear(s, 'mortar'), s, 'only what exists');
  const sold = sellGear(s, s.stash[0].uid);
  assert.equal(sold.stash.length, 0);
  assert.equal(sold.cash, s.cash + sellPrice(s.stash[0]));
  assert.equal(sellPrice(s.stash[0]), priceOf('rifle') / 2);
});

test('equipping: from the stash into the right slot; what was there goes back; moving between runners', () => {
  let s = buyGear(buyGear(fresh(), 'pistol'), 'rifle');
  const [pistol, rifle] = s.stash;
  const [a, b] = s.crew.map((o) => o.id);
  s = equip(s, pistol.uid, a);
  assert.equal(s.crew[0].gear.weapon.uid, pistol.uid);
  assert.equal(s.stash.length, 1);
  s = equip(s, rifle.uid, a);
  assert.equal(s.crew[0].gear.weapon.uid, rifle.uid, 'one weapon at a time');
  assert.deepEqual(s.stash.map((i) => i.uid), [pistol.uid], 'the sidearm went back to the stash');
  s = equip(s, rifle.uid, b);
  assert.equal(s.crew[0].gear.weapon, null);
  assert.equal(s.crew[1].gear.weapon.uid, rifle.uid, 'handed over');
  s = unequip(s, b, 'weapon');
  assert.equal(s.crew[1].gear.weapon, null);
  assert.equal(s.stash.length, 2);
});

test('no changing gear for someone on a job or away', () => {
  let s = buyGear(fresh(), 'pistol');
  s.jobs = []; addOffer(s, 'container409');
  const [a, b] = s.crew.map((o) => o.id);
  const busy = M.startMission(s, s.jobs[0].id, [a, b], 'stealth');
  assert.equal(equip(busy, busy.stash[0].uid, a), busy, 'on the job');
  s.crew[2].condition.awayUntil = s.day + 3;
  assert.equal(equip(s, s.stash[0].uid, s.crew[2].id), s, 'away');
});

test('gear adds to rolls and says so in the breakdown; a pro item adds one more', () => {
  const s = fresh();
  const op = s.crew[0];
  const before = effectiveStat(op, 'combat').value;
  arm(s, op.id, 'pistol');
  const armed = effectiveStat(op, 'combat');
  assert.equal(armed.value, before + GEAR.pistol.bonus.combat);
  assert.ok(armed.notes.some((n) => /Sidearm \+1/.test(n)));
  arm(s, op.id, 'pistol:pro');
  assert.equal(effectiveStat(op, 'combat').value, before + 2);
  assert.ok(effectiveStat(op, 'combat').notes.some((n) => /Pro sidearm \+2/.test(n)));
  assert.equal(crewRoll([op], 'combat').value, before + 2, 'the crew roll counts it too');
  arm(s, op.id, 'reflex');
  assert.equal(effectiveStat(op, 'driving').value, op.stats.driving + 1, 'an implant can help two stats');
});

test('overwatch needs the kit: carried rifles and drones only, and a pro rifle shoots better', () => {
  const s = fresh();
  s.jobs = []; addOffer(s, 'container409');
  const [a, b, c] = s.crew;
  assert.deepEqual(kitsFor(c), []);
  assert.equal(M.startMission(s, s.jobs[0].id, [a.id, b.id], 'stealth', { overwatch: { id: c.id, kit: 'drone' } }), s);
  arm(s, c.id, 'rifle');
  assert.deepEqual(kitsFor(c), ['rifle']);
  assert.equal(M.startMission(s, s.jobs[0].id, [a.id, b.id], 'stealth', { overwatch: { id: c.id, kit: 'drone' } }), s, 'a rifle isn\'t a drone');
  assert.ok(M.startMission(s, s.jobs[0].id, [a.id, b.id], 'stealth', { overwatch: { id: c.id, kit: 'rifle' } }).activeMission);
  const street = bestSave({ victim: a, able: [a], overwatch: { kit: 'rifle', left: 2 }, overwatchOp: c, zone: 'inside', diff: 6 });
  arm(s, c.id, 'rifle:pro');
  const pro = bestSave({ victim: a, able: [a], overwatch: { kit: 'rifle', left: 2 }, overwatchOp: c, zone: 'inside', diff: 6 });
  assert.equal(pro.value, street.value + 1);
  assert.ok(pro.notes.some((n) => /Pro rifle \+1/.test(n)));
  assert.equal(overwatchKit(a, 'rifle'), null);
});

test('Joss only puts someone on overwatch with the kit they carry', () => {
  const tpl = templateById('container409');
  for (let seed = 1; seed <= 10; seed++) {
    const s = fresh(seed);
    assert.equal(jossPicks(tpl, s.crew, 'loud').overwatch, null, 'nobody armed, nobody on overwatch');
    arm(s, s.crew[4].id, 'drone');
    const p = jossPicks(tpl, s.crew, 'loud');
    if (p.overwatch) { assert.equal(p.overwatch, s.crew[4].id); assert.equal(p.kit, 'drone'); }
  }
});

test('armour takes some of the chance of a serious wound off; implants keep neural load from resting to zero', () => {
  const s = fresh();
  const op = s.crew[0];
  assert.equal(seriousGuard(op), 0);
  arm(s, op.id, 'vest');
  assert.ok(seriousGuard(op) > 0);
  arm(s, op.id, 'cortex');
  op.condition.neuralLoad = 12;
  let t = s;
  for (let d = 0; d < 6; d++) t = advanceDay(t);
  assert.equal(t.crew[0].condition.neuralLoad, GEAR.cortex.neuralFloor);
  assert.equal(t.crew[1].condition.neuralLoad, 0, 'no implant, rests to zero');
});

test('some recruits bring their own kit, and keep it when hired; the founders bring nothing', () => {
  const s = fresh(11);
  let brought = 0;
  for (let i = 0; i < 200; i++) {
    const r = generateRecruit(s);
    assert.ok(Array.isArray(r.brings));
    for (const type of r.brings) assert.ok(GEAR[type], type);
    if (r.brings.length) brought++;
  }
  assert.ok(brought > 20 && brought < 160, `${brought} of 200 brought something`);
  for (const op of s.crew) assert.ok(Object.values(op.gear).every((v) => v === null));
  let g = fresh(12);
  for (let i = 0; i < 50 && !(g.recruits ?? []).some((r) => r.brings.length); i++) g.recruits = [generateRecruit(g)];
  const lead = g.recruits.find((r) => r.brings.length);
  g.cash = 99999;
  g = hire(g, lead.id);
  const op = g.crew.at(-1);
  assert.equal(op.handle, lead.handle);
  assert.deepEqual(Object.values(op.gear).filter(Boolean).map((i) => i.type), lead.brings);
});

test('a v22 save upgrades: the shared rifle and drone go to the stash, or with whoever has one on overwatch mid-job', async () => {
  let s = fresh(14);
  s.jobs = []; addOffer(s, 'container409');
  arm(s, s.crew[2].id, 'rifle');
  s = M.startMission(s, s.jobs[0].id, [s.crew[0].id, s.crew[1].id], 'loud', { overwatch: { id: s.crew[2].id, kit: 'rifle' } });
  const old = structuredClone(s);
  old.version = 22;
  delete old.stash;
  for (const op of old.crew) delete op.gear;
  const loaded = await importSave({ text: async () => JSON.stringify(old) });
  assert.equal(loaded.version, SAVE_VERSION);
  assert.deepEqual(loaded.stash.map((i) => i.type), ['drone'], 'the drone waits in the stash');
  assert.equal(loaded.crew[2].gear.weapon.type, 'rifle', 'the rifle is with the person using it');
  assert.ok(loaded.crew.every((o) => o.gear && Object.keys(o.gear).length === 4));
  assert.equal(playMission(loaded, carefulPolicy).state.activeMission.done, true, 'the job finishes');
  const idle = structuredClone(fresh(15));
  idle.version = 22; delete idle.stash; for (const op of idle.crew) delete op.gear;
  const up = await importSave({ text: async () => JSON.stringify(idle) });
  assert.deepEqual(up.stash.map((i) => i.type).sort(), ['drone', 'rifle']);
});
