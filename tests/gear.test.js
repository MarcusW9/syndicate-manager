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
import { buyGear, sellGear, equip, unequip, priceOf, sellPrice, kitsFor, overwatchKit, seriousGuard, GEAR, carried, emptyLoadout, gearMods, neuralFloor, bagUsed } from '../src/core/gear.js';
import { playMission, carefulPolicy, arm } from './play.js';

globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
const { importSave } = await import('../src/save/save.js');

const fresh = (seed = 3) => createNewGame({ seed, startCrew: 'fresh' });

// Changed on purpose (2026-11-06, the carry grid; DESIGN.md): no armour, empty sockets, an empty bag.
test('a new crew starts with nothing: an empty stash, no armour, empty sockets and an empty bag', () => {
  const s = fresh();
  assert.deepEqual(s.stash, []);
  for (const op of s.crew) assert.deepEqual(op.gear, emptyLoadout());
});

test('buying costs its price and goes to the stash; you can\'t buy what you can\'t afford; selling pays half', () => {
  let s = fresh();
  const cash = s.cash;
  s = buyGear(s, 'rifle');
  assert.equal(s.cash, cash - priceOf('rifle'));
  assert.equal(s.stash.length, 1);
  assert.equal(s.stash[0].type, 'rifle');
  assert.ok(priceOf('rifle', 'verified') > priceOf('rifle'), 'pro costs more');
  const poor = { ...s, cash: 10 };
  assert.equal(buyGear(poor, 'drone'), poor);
  assert.equal(buyGear(s, 'mortar'), s, 'only what exists');
  const sold = sellGear(s, s.stash[0].uid);
  assert.equal(sold.stash.length, 0);
  assert.equal(sold.cash, s.cash + sellPrice(s.stash[0]));
  assert.equal(sellPrice(s.stash[0]), priceOf('rifle') / 2);
});

// Changed on purpose (2026-11-06, the carry grid; DESIGN.md): weapons and tools share a 4×2 bag.
test('equipping: into the bag where it fits; a second long item on the next row; moving between runners', () => {
  let s = buyGear(buyGear(buyGear(Object.assign(fresh(), { cash: 20000 }), 'pistol'), 'rifle'), 'drone');
  const [pistol, rifle, drone] = s.stash;
  const [a, b] = s.crew.map((o) => o.id);
  s = equip(s, pistol.uid, a);
  s = equip(s, rifle.uid, a);
  assert.deepEqual(s.crew[0].gear.bag.map((x) => [x.item.type, x.x, x.y]), [['pistol', 0, 0], ['rifle', 0, 1]], 'a sidearm and a rifle, a row each');
  assert.equal(bagUsed(s.crew[0]), 6);
  assert.equal(equip(s, drone.uid, a), s, 'no room for a third long item');
  s = equip(s, rifle.uid, b);
  assert.ok(!carried(s.crew[0]).some((i) => i.uid === rifle.uid));
  assert.ok(carried(s.crew[1]).some((i) => i.uid === rifle.uid), 'handed over');
  s = unequip(s, b, rifle.uid);
  assert.ok(!carried(s.crew[1]).length);
  assert.ok(s.stash.some((i) => i.uid === rifle.uid));
});

test('the bag: placed where you tap if it fits, moved within it, never overlapping', () => {
  let s = buyGear(buyGear(buyGear(Object.assign(fresh(), { cash: 20000 }), 'deck'), 'medkit'), 'picks');
  const [deck, kit, ghost] = s.stash;
  const a = s.crew[0].id;
  s = equip(s, kit.uid, a, { x: 3, y: 0 });
  assert.equal(equip(s, deck.uid, a, { x: 1, y: 0 }), s, 'a 3-cell deck at x 1 would cover the trauma kit');
  s = equip(s, deck.uid, a, { x: 0, y: 0 });
  s = equip(s, ghost.uid, a);
  assert.deepEqual(s.crew[0].gear.bag.find((x) => x.item.uid === ghost.uid), { item: s.crew[0].gear.bag.find((x) => x.item.uid === ghost.uid).item, x: 0, y: 1 }, 'the first free cell');
  s = equip(s, ghost.uid, a, { x: 3, y: 1 });
  assert.deepEqual([s.crew[0].gear.bag.find((x) => x.item.uid === ghost.uid).x, s.crew[0].gear.bag.find((x) => x.item.uid === ghost.uid).y], [3, 1], 'moved');
  assert.equal(carried(s.crew[0]).length, 3);
});

test('two implant sockets: their neural-load floors add up; never the same implant twice', () => {
  let s = fresh();
  s.cash = 20000;
  s = buyGear(buyGear(buyGear(s, 'reflex'), 'cortex'), 'reflex');
  const [r1, c, r2] = s.stash;
  const a = s.crew[0].id;
  s = equip(s, r1.uid, a);
  assert.equal(neuralFloor(s.crew[0]), GEAR.reflex.neuralFloor);
  s = equip(s, c.uid, a);
  assert.equal(neuralFloor(s.crew[0]), GEAR.reflex.neuralFloor + GEAR.cortex.neuralFloor, 'both count');
  assert.equal(equip(s, r2.uid, a), s, 'both sockets full');
  assert.equal(equip(s, r2.uid, a, { socket: 1 }), s, 'swapping the cortex for a second reflex: refused');
  s = equip(s, r2.uid, a, { socket: 0 });
  assert.deepEqual(s.crew[0].gear.implants.map((i) => i.uid), [r2.uid, c.uid], 'swapped into socket 0');
  assert.ok(s.stash.some((i) => i.uid === r1.uid), 'the old one back in the stash');
});

test('different kinds add up; the same kind counts once', () => {
  const s = fresh();
  const op = s.crew[0];
  arm(s, op.id, 'deck', 'picks', 'picks:verified');
  assert.equal(gearMods(op, 'tech').reduce((n, m) => n + m.value, 0), 1, 'the deck');
  assert.equal(gearMods(op, 'stealth').reduce((n, m) => n + m.value, 0), 2, 'the better ghost kit, once');
});

// Changed on purpose (owner, 2026-10-29; DESIGN.md): resting or hurt no longer locks gear, only
// being out on a job whose outcome isn't settled (live, hands-off, or a side task).
test('no changing gear while out on an unfinished job; resting or hurt is fine', () => {
  let s = buyGear(fresh(), 'pistol');
  s.jobs = []; addOffer(s, 'container409');
  const [a, b, c] = s.crew.map((o) => o.id);
  const busy = M.startMission(s, s.jobs[0].id, [a, b], 'stealth');
  assert.equal(equip(busy, busy.stash[0].uid, a), busy, 'on the live job');
  const away = structuredClone(s);
  away.awayJobs = [{ returnDay: s.day + 2, mission: { crewIds: [c], overwatch: null, wheels: null, standby: null } }];
  assert.equal(equip(away, away.stash[0].uid, c), away, 'out on a hands-off job');
  const side = structuredClone(s);
  side.sideOut = [{ taskId: 'x', crewIds: [c], returnDay: s.day + 2 }];
  assert.equal(equip(side, side.stash[0].uid, c), side, 'out on a side task');
  const resting = structuredClone(s);
  resting.crew[2].condition.awayUntil = s.day + 1; // back tomorrow after a finished job
  resting.crew[2].condition.injury = 'serious';
  assert.notEqual(equip(resting, resting.stash[0].uid, c), resting, 'resting and hurt: gear still changes');
});

test('gear adds to rolls and says so in the breakdown; a pro item adds one more', () => {
  const s = fresh();
  const op = s.crew[0];
  const before = effectiveStat(op, 'combat').value;
  arm(s, op.id, 'pistol');
  const armed = effectiveStat(op, 'combat');
  assert.equal(armed.value, before + GEAR.pistol.bonus.combat);
  assert.ok(armed.notes.some((n) => /Sidearm \+1/.test(n)));
  arm(s, op.id, 'pistol:verified');
  assert.equal(effectiveStat(op, 'combat').value, before + 2);
  assert.ok(effectiveStat(op, 'combat').notes.some((n) => /Verified sidearm \+2/.test(n)));
  assert.equal(crewRoll([op], 'combat').value, before + 2, 'the crew roll counts it too');
  arm(s, op.id, 'reflex');
  assert.equal(effectiveStat(op, 'piloting').value, op.stats.piloting + 1, 'an implant can help two stats');
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
  arm(s, c.id, 'rifle:verified');
  const pro = bestSave({ victim: a, able: [a], overwatch: { kit: 'rifle', left: 2 }, overwatchOp: c, zone: 'inside', diff: 6 });
  assert.equal(pro.value, street.value + 1);
  assert.ok(pro.notes.some((n) => /Verified rifle \+1/.test(n)));
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
  for (const op of s.crew) assert.equal(carried(op).length, 0);
  let g = fresh(12);
  for (let i = 0; i < 50 && !(g.recruits ?? []).some((r) => r.brings.length); i++) g.recruits = [generateRecruit(g)];
  const lead = g.recruits.find((r) => r.brings.length);
  g.cash = 99999;
  g = hire(g, lead.id);
  const op = g.crew.at(-1);
  assert.equal(op.handle, lead.handle);
  assert.deepEqual(carried(op).map((i) => i.type).sort(), [...lead.brings].sort());
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
  assert.ok(carried(loaded.crew[2]).some((i) => i.type === 'rifle'), 'the rifle is with the person using it');
  assert.ok(loaded.crew.every((o) => o.gear && Array.isArray(o.gear.bag)), 'and on into the carry grid (v45)');
  assert.equal(playMission(loaded, carefulPolicy).state.activeMission.done, true, 'the job finishes');
  const idle = structuredClone(fresh(15));
  idle.version = 22; delete idle.stash; for (const op of idle.crew) delete op.gear;
  const up = await importSave({ text: async () => JSON.stringify(idle) });
  assert.deepEqual(up.stash.map((i) => i.type).sort(), ['drone', 'rifle']);
});

test('a v44 save upgrades: the weapon and tool go in the bag, the implant in a socket, armour stays worn', async () => {
  const s = fresh(16);
  const old = structuredClone(s);
  old.version = 44;
  const rifle = { uid: 'o1', type: 'rifle', tier: 'standard' };
  const kit = { uid: 'o2', type: 'medkit', tier: 'standard' };
  const deck = { uid: 'o3', type: 'deck', tier: 'verified' };
  const vest = { uid: 'o4', type: 'vest', tier: 'standard' };
  const reflex = { uid: 'o5', type: 'reflex', tier: 'standard' };
  old.crew[0].gear = { weapon: rifle, armour: vest, tool: kit, implant: reflex };
  old.crew[1].gear = { weapon: rifle && { ...rifle, uid: 'o6' }, armour: null, tool: deck, implant: null };
  old.crew[2].gear = { weapon: null, armour: null, tool: null, implant: null };
  const up = await importSave({ text: async () => JSON.stringify(old) });
  assert.equal(up.version, SAVE_VERSION);
  const [a, b, c] = up.crew;
  assert.deepEqual(a.gear.armour.uid, 'o4');
  assert.deepEqual(a.gear.implants.map((i) => i.uid), ['o5']);
  assert.deepEqual(a.gear.bag.map((x) => [x.item.uid, x.x, x.y]), [['o1', 0, 0], ['o2', 3, 0]], 'a compact tool beside the rifle');
  assert.deepEqual(b.gear.bag.map((x) => [x.item.uid, x.x, x.y]), [['o6', 0, 0], ['o3', 0, 1]], 'a long tool on the next row');
  assert.deepEqual(c.gear, emptyLoadout());
});
