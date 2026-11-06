// Building up a hall, slice 2a (DESIGN.md 2026-11-06): rooms, and what each does for whoever lives
// there: the clinic, the bunk room, the canteen, the stash and the lookout.

import test from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame } from '../src/core/state.js';
import { advanceDay } from '../src/core/time.js';
import { syncHalls, hallIn, bedsOf, freeBeds } from '../src/core/halls.js';
import { HALLS } from '../src/data/sites.js';
import { PIECES, ROOM_EFFECT } from '../src/data/hallBuild.js';
import { buildableCells, canPlace, placePiece, removePiece, canRemove, pieceCells, hallSiteFor } from '../src/core/hallbuild.js';
import { withdrawCost, checkRaids } from '../src/core/raids.js';
import { RAID } from '../src/data/raids.js';
import { fightSpots } from '../src/core/fightspots.js';
import { setHeat } from '../src/core/heat.js';

const tong = (level = 3) => {
  const s = createNewGame({ seed: 5, startCrew: 'fresh' });
  s.inbox = [];
  s.halls.push({ district: 'basin', beds: 2, rent: 1200, level, opened: 1, build: [] });
  syncHalls(s);
  s.cash = 1e6;
  return s;
};
/** The first spot a room fits in the Basin hall, turned or not. */
function fitRoom(s, id, rot = 0) {
  const free = buildableCells(HALLS.basin);
  for (const k of free) {
    const [x, y] = k.split(',').map(Number);
    if (pieceCells(id, x, y, rot).every((c) => free.has(c)) && canPlace(s, 'basin', id, x, y, rot).ok) return [x, y];
  }
  return null;
}
const build = (s, id, rot = 0) => { const at = fitRoom(s, id, rot); assert.ok(at, `${id} fits`); return placePiece(s, 'basin', id, at[0], at[1], rot); };

test('rooms take their squares (2 × 2, or 2 × 3 turned either way), one of each per hall, some need a level', () => {
  let s = tong(1);
  const at = fitRoom(s, 'stash');
  s = placePiece(s, 'basin', 'stash', ...at);
  assert.equal(s.cash, 1e6 - PIECES.stash.cost);
  assert.match(canPlace(s, 'basin', 'stash', ...(fitRoom(tong(1), 'lookout') ?? at)).reason, /already has a stash|already there/);
  const free = [...buildableCells(HALLS.basin)][0].split(',').map(Number);
  assert.match(canPlace(s, 'basin', 'clinic', ...free).reason, /Needs a level 2 hall/);
  assert.deepEqual(pieceCells('bunks', 1, 1, 0), ['1,1', '2,1', '3,1', '1,2', '2,2', '3,2']);
  assert.deepEqual(pieceCells('bunks', 1, 1, 1), ['1,1', '2,1', '1,2', '2,2', '1,3', '2,3']);
  assert.equal(pieceCells('clinic', 1, 1, 1).length, 4, 'a 2 × 2 room never turns');
});

test('a room isn\'t cover: a raid\'s fight spots are the same with one', () => {
  const s = build(tong(), 'canteen');
  const bare = fightSpots(HALLS.basin, 'inside', { crew: 6, guards: 4 });
  const built = fightSpots(hallSiteFor(s, 'basin'), 'inside', { crew: 6, guards: 4 });
  assert.deepEqual(built.crew.map((x) => x.cover), bare.crew.map((x) => x.cover));
  assert.deepEqual(built.guards.map((x) => x.cover), bare.guards.map((x) => x.cover));
});

test('the bunk room: two more beds, in the roster limit too; it can\'t go while they\'re slept in', () => {
  let s = tong();
  const cap = s.rosterCap;
  s = build(s, 'bunks', 1);
  assert.equal(bedsOf(hallIn(s, 'basin')), 2 + ROOM_EFFECT.bunkBeds);
  assert.equal(s.rosterCap, cap + ROOM_EFFECT.bunkBeds);
  for (const o of s.crew.slice(0, 3)) o.hall = 'basin';
  assert.equal(freeBeds(s, 'basin'), 1);
  const id = hallIn(s, 'basin').build[0].id;
  assert.match(canRemove(s, 'basin', id).reason, /slept in/);
  assert.equal(removePiece(s, 'basin', id), s);
  s.crew[2].hall = 'oldTown';
  s = removePiece(s, 'basin', id);
  assert.equal(s.rosterCap, cap);
});

test('the clinic heals twice as fast, only for whoever lives there and only while they\'re home', () => {
  let s = build(tong(), 'clinic');
  const [here, away, elsewhere] = s.crew;
  here.hall = 'basin'; away.hall = 'basin'; elsewhere.hall = 'oldTown';
  for (const o of [here, away, elsewhere]) { o.condition.injury = 'wounded'; o.condition.injuryDays = 6; }
  away.condition.awayUntil = s.day + 5;
  s = advanceDay(s);
  const by = (id) => s.crew.find((o) => o.id === id).condition.injuryDays;
  assert.equal(by(here.id), 6 - ROOM_EFFECT.clinicHeal);
  assert.equal(by(away.id), 5, 'out on a job: the usual day');
  assert.equal(by(elsewhere.id), 5, 'another hall: the usual day');
});

test('the canteen: fatigue goes faster at home', () => {
  let s = build(tong(), 'canteen');
  const [here, other] = s.crew;
  here.hall = 'basin'; other.hall = 'oldTown';
  here.condition.fatigue = 40; other.condition.fatigue = 40;
  s = advanceDay(s);
  assert.equal(s.crew.find((o) => o.id === here.id).condition.fatigue, 40 - ROOM_EFFECT.canteenRest);
  assert.equal(s.crew.find((o) => o.id === other.id).condition.fatigue, 32);
});

test('the stash: walking out loses half; the lookout: a raid is warned a day sooner', () => {
  let s = tong();
  const before = withdrawCost(s, 'basin').kept;
  s = build(s, 'stash');
  assert.equal(withdrawCost(s, 'basin').kept, Math.round(before * ROOM_EFFECT.stashKeeps));
  s = build(s, 'lookout');
  s.crew[0].hall = 'basin';
  let warned = null;
  for (let i = 0; i < 80 && !warned; i++) {
    setHeat(s, 'basin', 9);
    s = advanceDay(s);
    warned = (s.raids ?? []).find((r) => r.district === 'basin');
  }
  assert.ok(warned, 'a raid was warned');
  assert.equal(warned.day - warned.warnedDay, ROOM_EFFECT.lookoutWarn);
  assert.equal(RAID.warnDays, 3, 'without a lookout, three days');
  assert.equal(typeof checkRaids, 'function');
});

test('the den: whoever lives there asks a little less at renewal (as 10 more jobs together, still capped)', async () => {
  const { renewalAsk } = await import('../src/core/renewals.js');
  const { marketWage } = await import('../src/core/pricing.js');
  let s = build(tong(), 'den');
  const { denJobs } = await import('../src/core/renewals.js');
  const op = s.crew[0];
  for (const k of Object.keys(op.stats)) op.stats[k] = 16;
  op.jobsWithCrew = 3;
  op.wage = Math.round(marketWage(op) * 0.2);
  op.hall = 'basin';
  assert.equal(denJobs(s, op), ROOM_EFFECT.denJobs);
  op.hall = 'oldTown';
  const without = renewalAsk(op, s);
  op.hall = 'basin';
  const withDen = renewalAsk(op, s);
  assert.ok(withDen < without, `${withDen} < ${without}`);
  op.jobsWithCrew = 40;
  const capped = renewalAsk(op, s);
  op.hall = 'oldTown';
  assert.equal(renewalAsk(op, s), capped, 'past the cap, the den adds nothing');
});

test('the cyber doc: one in the whole tong, level 3; implants cost a quarter less while it stands', async () => {
  const { buyPrice, priceOf, buyGear } = await import('../src/core/gear.js');
  let s = tong(2);
  const at = [...buildableCells(HALLS.basin)][0].split(',').map(Number);
  assert.match(canPlace(s, 'basin', 'cyberdoc', ...at).reason, /level 3/);
  s = build(tong(3), 'cyberdoc');
  s.halls.find((h) => h.district === 'oldTown').level = 3;
  s.halls.find((h) => h.district === 'oldTown').build = [];
  const ot = [...buildableCells(HALLS.oldTown)].map((k) => k.split(',').map(Number)).find(([x, y]) => canPlace({ ...s, halls: s.halls.map((h) => (h.district === 'basin' ? { ...h, build: [] } : h)) }, 'oldTown', 'cyberdoc', x, y).ok);
  assert.match(canPlace(s, 'oldTown', 'cyberdoc', ...ot).reason, /tong already has a cyber doc/);
  assert.equal(buyPrice(s, 'reflex'), Math.round((priceOf('reflex') * ROOM_EFFECT.docShare) / 50) * 50);
  assert.equal(buyPrice(s, 'rifle'), priceOf('rifle'), 'only implants');
  const cash = s.cash;
  s = buyGear(s, 'reflex');
  assert.equal(s.cash, cash - buyPrice(s, 'reflex'));
  assert.equal(buyPrice(tong(), 'reflex'), priceOf('reflex'), 'no doc, the full price');
});
