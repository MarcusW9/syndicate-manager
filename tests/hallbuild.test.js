// Building up a hall (DESIGN.md 2026-11-06), slice 1a: the grid, the defence pieces, the floor and the
// cash, and the raid fought on the map with what's built on it.

import test from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame, SAVE_VERSION } from '../src/core/state.js';
import { syncHalls, hallIn } from '../src/core/halls.js';
import { HALLS, pickSite } from '../src/data/sites.js';
import { HALL_SITES } from '../src/data/halls.js';
import { HALL_BUILD, PIECES } from '../src/data/hallBuild.js';
import { bedCells, partAt, buildableCells, canPlace, placePiece, removePiece, turnPiece, canTurn, floorOf, floorUsed, hallSiteFor, pieceAt, refundOf } from '../src/core/hallbuild.js';
import { fightSpots, siteRects, spotsForJob } from '../src/core/fightspots.js';
import { BATTLE } from '../src/data/battle.js';

const C = HALL_BUILD.cell;
const tong = (cash = 100000) => {
  const s = createNewGame({ seed: 4, startCrew: 'fresh' });
  for (const d of Object.keys(HALL_SITES)) if (d !== 'oldTown') s.halls.push({ district: d, beds: 2, rent: 1000, level: 1, opened: 1, build: [] });
  syncHalls(s);
  s.cash = cash;
  return s;
};
/** A hall's free floor: its cells, less the beds on it in a new tong (2026-11-07: beds are blocks on the floor). */
/** A hall's free outside squares at a level, where defences go (2026-11-07: every hall a compound; rooms inside, defences outside). */
const cellsOf = (d, level = 1) => { const site = HALLS[d]; const beds = bedCells(hallIn(tong(), d)); return [...buildableCells(site, level)].filter((k) => !beds.has(k) && !partAt(site, ...k.split(',').map(Number))?.inside).map((k) => k.split(',').map(Number)); };

test('every hall has floor to build on, and none of it near the ways in and out or where either side starts', () => {
  for (const d of Object.keys(HALLS)) {
    const site = HALLS[d];
    const cells = [...buildableCells(site, 1)].map((k) => k.split(',').map(Number));
    assert.ok(cells.length >= 6, `${d}: ${cells.length} cells at level 1`);
    const keep = [site.posts.inside, site.paths.out.at(-1), site.paths.inside.at(-1)];
    for (const [x, y] of cells) {
      for (const [px, py] of keep) assert.ok(!(px >= x * C && px <= x * C + C && py >= y * C && py <= y * C + C), `${d}: ${x},${y} isn't on a way in or out`);
      assert.ok(!siteRects(site).some((r) => ['sp-cover', 'sp-desk', 'sp-cot', 'sp-block', 'sp-water'].includes(r.cls) && r.x < x * C + C - 4 && r.x + r.w > x * C + 4 && r.y < y * C + C - 4 && r.y + r.h > y * C + 4), `${d}: ${x},${y} is clear of the hall's own things`);
    }
  }
});

test('placing a piece costs its price and floor; removing gives half back; the limits say why', () => {
  let s = tong(10000);
  const [x, y] = cellsOf('nightMarket')[0];
  assert.equal(canPlace(s, 'nightMarket', 'plate', x, y).ok, true);
  s = placePiece(s, 'nightMarket', 'plate', x, y, 1);
  assert.equal(s.cash, 10000 - PIECES.plate.cost);
  assert.equal(floorUsed(hallIn(s, 'nightMarket')), 1);
  assert.equal(pieceAt(hallIn(s, 'nightMarket'), x, y).rot, 1);
  assert.match(canPlace(s, 'nightMarket', 'barricade', x, y).reason, /already there/);
  assert.match(canPlace(s, 'nightMarket', 'wall', 0, 0).reason, /Can't build there/);
  s.cash = 100;
  const [x2, y2] = cellsOf('nightMarket')[1];
  assert.match(canPlace(s, 'nightMarket', 'barricade', x2, y2).reason, /Needs ¥2,000/);
  const id = pieceAt(hallIn(s, 'nightMarket'), x, y).id;
  s = removePiece(s, 'nightMarket', id);
  assert.equal(s.cash, 100 + refundOf('plate'));
  assert.equal(refundOf('plate'), PIECES.plate.cost / 2);
  assert.equal(floorUsed(hallIn(s, 'nightMarket')), 0);
});

test('a compound has no floor allowance: every free square of the parts it holds, and Expand takes the next part (2026-11-07)', async () => {
  const { expandHall } = await import('../src/core/halls.js');
  let s = tong(1e6);
  const h = () => hallIn(s, 'docks');
  const f1 = floorOf(h());
  assert.equal(f1, buildableCells(HALLS.docks, 1).size - h().beds);
  const out = cellsOf('docks');
  for (const [x, y] of out) s = placePiece(s, 'docks', 'barricade', x, y);
  assert.equal(floorUsed(h()), out.length, 'every outside square takes a defence');
  s = expandHall(s, 'docks');
  assert.equal(h().level, 2);
  assert.ok(floorOf(h()) > f1, 'the next part brings its floor');
});

test('rooms go inside and defences outside, where a raid is fought (2026-11-07)', () => {
  const s = tong(1e6);
  hallIn(s, 'basin').level = 2;
  const site = HALLS.basin;
  const beds = bedCells(hallIn(s, 'basin'));
  const inside = [...buildableCells(site, 2)].filter((k) => !beds.has(k) && partAt(site, ...k.split(',').map(Number)).inside).map((k) => k.split(',').map(Number));
  const [ox, oy] = cellsOf('basin', 2)[0];
  assert.match(canPlace(s, 'basin', 'plate', ...inside[0]).reason, /Defences go outside/);
  assert.match(canPlace(s, 'basin', 'stash', ox, oy).reason, /Rooms go inside|Can't build there/);
  assert.equal(canPlace(s, 'basin', 'plate', ox, oy).ok, true);
});

test('a hall shut after a raid can\'t be built in', () => {
  const s = tong();
  hallIn(s, 'basin').shutUntil = s.day + 3;
  const [x, y] = cellsOf('basin')[0];
  assert.match(canPlace(s, 'basin', 'plate', x, y).reason, /shut/);
});

test('turning: the plate and the wall turn where they stand; a barricade doesn\'t', () => {
  let s = tong();
  const [x, y] = cellsOf('heights')[0];
  s = placePiece(s, 'heights', 'wall', x, y, 0);
  const id = pieceAt(hallIn(s, 'heights'), x, y).id;
  assert.equal(canTurn(s, 'heights', id), true);
  s = turnPiece(s, 'heights', id);
  assert.equal(pieceAt(hallIn(s, 'heights'), x, y).rot, 1);
  const [bx, by] = cellsOf('heights')[1];
  s = placePiece(s, 'heights', 'barricade', bx, by, 1);
  const b = pieceAt(hallIn(s, 'heights'), bx, by);
  assert.equal(b.rot, 0);
  assert.equal(canTurn(s, 'heights', b.id), false);
});

test('what\'s built is on the raid\'s map, and its fight spots use it: a plate by our start is full cover', () => {
  for (const d of Object.keys(HALLS)) {
    let s = tong();
    const site = HALLS[d];
    const anchor = site.paths.inside.at(-1);
    const near = cellsOf(d).sort((a, b) => Math.hypot(a[0] * C + 15 - anchor[0], a[1] * C + 15 - anchor[1]) - Math.hypot(b[0] * C + 15 - anchor[0], b[1] * C + 15 - anchor[1]))[0];
    const beforeBuild = hallSiteFor(s, d);
    s = placePiece(s, d, 'plate', near[0], near[1], 0);
    const built = hallSiteFor(s, d);
    assert.equal(built.shapes.length, beforeBuild.shapes.length + 1, `${d}: the plate is on the map`);
    assert.equal(pickSite(d, 'raid-x', `raid:${d}`), site, `${d}: the bare map is unchanged`);
    const before = fightSpots(site, 'inside', { crew: 6, guards: BATTLE.maxGuards }).crew.filter((x) => x.cover === 'full').length;
    const after = spotsForJob(d, 'raid-x', `raid:${d}`, 'inside', 4, hallIn(s, d).build).crew.filter((x) => x.cover === 'full').length;
    assert.ok(after >= before, `${d}: as much full cover or more (${before} → ${after})`);
  }
});

test('a hall built on every cell can still be fought in: both sides have spots, apart, nobody inside a wall', () => {
  for (const d of Object.keys(HALLS)) {
    const hall = { build: cellsOf(d).map(([x, y], i) => ({ id: `w${i}`, piece: i % 2 ? 'wall' : 'plate', x, y, rot: i % 3 ? 1 : 0 })) };
    const sp = spotsForJob(d, 'raid-x', `raid:${d}`, 'inside', 8, hall.build);
    assert.ok(sp.crew.length >= 10, `${d}: ${sp.crew.length} spots for ours`);
    assert.ok(sp.guards.length >= BATTLE.maxGuards, `${d}: ${sp.guards.length} for the raiders`);
    const walls = siteRects(pickSite(d, 'raid-x', `raid:${d}`, hall.build)).filter((r) => r.cls === 'sp-block');
    for (const s of [...sp.crew, ...sp.guards]) assert.ok(!walls.some((r) => s.at[0] > r.x && s.at[0] < r.x + r.w && s.at[1] > r.y && s.at[1] < r.y + r.h), `${d}: ${s.at} not in a wall`);
  }
});

test('a raid starts on the hall as built, and keeps that map while it\'s fought', async () => {
  const { startRaidFight } = await import('../src/core/raids.js');
  let s = tong();
  s.crew[0].hall = 'docks';
  const [x, y] = cellsOf('docks')[0];
  s = placePiece(s, 'docks', 'plate', x, y);
  const st = structuredClone(s);
  startRaidFight(st, { id: 'raid-docks-1', district: 'docks', by: 'police', warnedDay: st.day, day: st.day, answer: null, outcome: null, done: false });
  assert.deepEqual(st.activeMission.build.filter((b) => !['bed', 'way', 'part'].includes(b.piece)).map((b) => b.piece), ['plate']);
  assert.equal(st.activeMission.build.filter((b) => b.piece === 'bed').length, hallIn(st, 'docks').beds, 'the hall\'s beds are on the raid\'s map too');
});

test('old saves upgrade with nothing built', async () => {
  const { importSave } = await import('../src/save/save.js');
  const s = createNewGame({ seed: 1 });
  s.version = 41;
  for (const h of s.halls) delete h.build;
  const up = await importSave({ text: async () => JSON.stringify(s) });
  assert.equal(up.version, SAVE_VERSION);
  assert.ok(up.halls.every((h) => Array.isArray(h.build) && !h.build.length));
});

test('defences make a raid easier: every 3 pieces lower its threat by 1, never below 1 (owner, 2026-11-06)', async () => {
  const { raidThreat, defenceCut, raidChoices } = await import('../src/core/raids.js');
  const { setHeat } = await import('../src/core/heat.js');
  let s = tong(1e6);
  hallIn(s, 'nightMarket').level = 3;
  setHeat(s, 'nightMarket', 10);
  const police = { id: 'r1', district: 'nightMarket', by: 'police', warnedDay: s.day, day: s.day, answer: null, outcome: null, done: false };
  assert.equal(raidThreat(s, 'nightMarket', police), 4);
  const cells = cellsOf('nightMarket', 3);
  for (const [x, y] of cells.slice(0, 2)) s = placePiece(s, 'nightMarket', 'barricade', x, y);
  assert.equal(defenceCut(s, 'nightMarket'), 0, 'two pieces: no change yet');
  s = placePiece(s, 'nightMarket', 'wall', ...cells[2]);
  assert.equal(raidThreat(s, 'nightMarket', police), 3, 'three pieces: −1');
  for (const [x, y] of cells.slice(3, 9)) s = placePiece(s, 'nightMarket', 'plate', x, y);
  assert.equal(defenceCut(s, 'nightMarket'), 3);
  assert.equal(raidThreat(s, 'nightMarket', police), 1, 'nine pieces: −3, from 4 down to 1');
  s.grudges = { silverFan: 8, redLanterns: 0 };
  assert.equal(raidThreat(s, 'nightMarket', { ...police, by: 'silverFan' }), 1, 'gang raids too, never below 1');
  s.crew[0].hall = 'nightMarket';
  assert.match(raidChoices(s, police).find((c) => c.id === 'hold').cost, /Our defences make it easier \(threat −3\)/);
  assert.equal(raidThreat(tong(), 'docks', { ...police, district: 'docks' }), 1, 'a hall with nothing built is as before');
});

test('the auto turret: one per hall from level 2, a defence piece; in a raid it fires on its own, never knocked out, until dry', async () => {
  const { TURRET } = await import('../src/data/hallBuild.js');
  const { hallTurret, startRaidFight, defencesIn } = await import('../src/core/raids.js');
  const { buildBattle, playRound } = await import('../src/core/battle.js');
  const { makeRng } = await import('../src/core/rng.js');
  let s = tong(1e6);
  const [x, y] = cellsOf('docks')[0];
  assert.match(canPlace(s, 'docks', 'turret', x, y).reason, /level 2/);
  hallIn(s, 'docks').level = 2;
  s = placePiece(s, 'docks', 'turret', x, y);
  assert.match(canPlace(s, 'docks', 'turret', ...cellsOf('docks')[1]).reason, /already has an auto turret/);
  assert.equal(defencesIn(s, 'docks'), 1, 'it counts toward the defences');
  assert.deepEqual(hallTurret(s, 'docks'), { at: [x * C + C / 2, y * C + C / 2], aim: TURRET.aim, damage: TURRET.damage, left: TURRET.shots });
  assert.equal(hallTurret(tong(), 'docks'), null);
  s.crew[0].hall = 'docks';
  const st = structuredClone(s);
  startRaidFight(st, { id: 'raid-docks-1', district: 'docks', by: 'police', warnedDay: st.day, day: st.day, answer: null, outcome: null, done: false });
  assert.equal(st.activeMission.battle.turret.left, TURRET.shots);
  // A long fight: it fires every round until it's out, with no crew on it, and nothing aims at it.
  const b = buildBattle({ incident: 'raid', zone: 'inside', diff: 0, threat: 1, guards: 4, crew: [s.crew[0]], approach: 'loud', turret: hallTurret(s, 'docks') });
  for (const g of b.guards) { g.hp = 999; g.max = 999; }
  const rng = makeRng(7);
  const fired = [];
  for (let i = 0; i < TURRET.shots + 2 && !b.runners.every((r) => r.down); i++) fired.push(playRound(b, rng).lines.filter((l) => l.kind === 'turret'));
  assert.ok(fired.slice(0, TURRET.shots).every((ls) => ls.length === 1), 'one burst a round');
  assert.match(fired[TURRET.shots - 1][0].text, /clicks dry/);
  assert.ok(fired.slice(TURRET.shots).every((ls) => !ls.length), 'then nothing');
  assert.ok(fired.flat().every((l) => l.actor === null), 'nobody on it');
});

test('every hall\'s floor is whole: each cell of its grid can take a piece (owner, 2026-11-07)', () => {
  for (const [d, site] of Object.entries(HALLS)) {
    if (site.parts) continue; // a compound: its own test below
    const [x0, y0, x1, y1] = site.grid;
    assert.equal(buildableCells(site).size, (x1 - x0 + 1) * (y1 - y0 + 1), `${d}: no holes in the floor`);
  }
});

test('the beds are blocks on the floor: as many as the hall has, never built over, two more with Expand', async () => {
  const { bedsOnFloor } = await import('../src/core/hallbuild.js');
  const { expandHall } = await import('../src/core/halls.js');
  let s = tong(1e6);
  for (const h of s.halls) {
    const beds = bedsOnFloor(h);
    assert.equal(beds.length, h.beds, `${h.district}: a block for each bed`);
    const free = buildableCells(HALLS[h.district]);
    assert.ok(beds.every((b) => free.has(`${b.x},${b.y}`)), `${h.district}: on the floor`);
    assert.match(canPlace(s, h.district, 'barricade', beds[0].x, beds[0].y).reason, /bed/);
  }
  const before = bedsOnFloor(hallIn(s, 'docks'));
  s = expandHall(s, 'docks');
  const after = bedsOnFloor(hallIn(s, 'docks'));
  assert.equal(after.length, before.length + 2);
  assert.deepEqual(after.slice(0, before.length), before, 'the beds already there stay put');
  const site = hallSiteFor(s, 'docks');
  assert.equal(site.shapes.filter((x) => x.cls === 'sp-cot').length, after.length, 'each bed is a cot on the raid\'s map');
});

test('every hall is a compound that grows with Expand: each part from its level, all its floor ours, only ways in kept clear', async () => {
  const { heldParts, partCells, waysIn, floorOf } = await import('../src/core/hallbuild.js');
  for (const [d, site] of Object.entries(HALLS)) {
  const ways = Object.values(site.ways);
  const keep = ways.flatMap((w) => [w.posts.inside, w.paths.out.at(-1), w.paths.inside.at(-1), w.paths.inside[0]]);
  const near = (k) => { const [x, y] = k.split(',').map(Number); return keep.some(([px, py]) => Math.hypot(Math.max(x * C - px, 0, px - x * C - C), Math.max(y * C - py, 0, py - y * C - C)) < HALL_BUILD.keepClear); };
  let before = 0;
  for (const level of [1, 2, 3, 4]) {
    const held = heldParts(site, level);
    assert.equal(held.length, site.parts.filter((p) => p.lvl <= level).length);
    const cells = buildableCells(site, level);
    assert.ok(cells.size > before, `level ${level}: more floor`);
    before = cells.size;
    // Every cell of a held part takes a piece, except one by a way in or under the yard's own pallets and bins.
    const stuck = held.flatMap(partCells).filter((k) => !cells.has(k));
    assert.ok(stuck.every((k) => near(k) || siteRects(site).some((r) => r.cls === 'sp-cover' && r.x < (Number(k.split(',')[0]) + 1) * C && r.x + r.w > Number(k.split(',')[0]) * C && r.y < (Number(k.split(',')[1]) + 1) * C && r.y + r.h > Number(k.split(',')[1]) * C)), `level ${level}: ${stuck}`);
    assert.ok([...cells].every((k) => held.some((p) => partCells(p).includes(k))), 'only on parts held');
  }
  assert.deepEqual(waysIn(site, 2).map((w) => w.id), ['street']);
  assert.deepEqual(waysIn(site, 3).map((w) => w.id), ['street', 'gate'], `${d}: the yard brings its gate`);
  }
  const site = HALLS.oldTown;
  const s = tong();
  assert.equal(floorOf(hallIn(s, 'oldTown')), buildableCells(site, 1).size - hallIn(s, 'oldTown').beds, 'no allowance: the floor held is all ours, less its beds');
  // Each inside part holds its own share of the beds: the room its eight, the flat the next ones.
  const { bedsOnFloor } = await import('../src/core/hallbuild.js');
  const h4 = { ...hallIn(s, 'oldTown'), level: 4, beds: 14 };
  const inRoom = bedsOnFloor(h4).filter((b) => b.y >= 3 && b.x <= 4).length;
  assert.equal(inRoom, 8, 'the room keeps its eight; the new beds go in the flat and the kitchen');
});

test('a raid on any hall is fought between the buildings, by either way in: cover on both sides, nobody inside a building', () => {
  for (const d of Object.keys(HALLS)) for (const way of Object.keys(HALLS[d].ways)) {
    const map = pickSite(d, 'raid-x', `raid:${d}`, [{ piece: 'way', id: way }]);
    const houses = siteRects(map).filter((r) => r.cls === 'sp-house');
    for (const n of [1, 4, 8]) {
      const sp = spotsForJob(d, 'raid-x', `raid:${d}`, 'inside', n, [{ piece: 'way', id: way }]);
      assert.ok(sp.crew.length >= n + 2, `${way}: ${sp.crew.length} spots for ${n}`);
      assert.ok(sp.guards.length >= BATTLE.maxGuards, `${way}: raiders' spots`);
      for (const x of [...sp.crew, ...sp.guards]) assert.ok(!houses.some((r) => x.at[0] > r.x && x.at[0] < r.x + r.w && x.at[1] > r.y && x.at[1] < r.y + r.h), `${way}: ${x.at} outside the buildings`);
    }
    const sp = spotsForJob(d, 'raid-x', `raid:${d}`, 'inside', 4, [{ piece: 'way', id: way }]);
    assert.ok(sp.crew.slice(0, 2).every((x) => x.cover !== 'open'), `${way}: our first two in cover`);
    assert.ok(sp.guards.some((x) => x.cover === 'full'), `${way}: full cover for the raiders`);
  }
});

test('the raid picks its way in from what the hall holds, and its map shows the yard\'s wall and gate', async () => {
  const { startRaidFight } = await import('../src/core/raids.js');
  let s = tong(1e6);
  const raid = (i) => ({ id: `raid-oldTown-${i}`, district: 'oldTown', by: 'police', warnedDay: s.day, day: s.day, answer: null, outcome: null, done: false });
  const ways = (st) => new Set(Array.from({ length: 12 }, (_, i) => { const x = structuredClone(st); startRaidFight(x, raid(i)); return x.activeMission.build.find((b) => b.piece === 'way')?.id; }));
  assert.deepEqual([...ways(s)], ['street'], 'level 1: up the lane from the street');
  hallIn(s, 'oldTown').level = 3;
  assert.deepEqual([...ways(s)].sort(), ['gate', 'street'], 'with the yard, the gate too');
  const st = structuredClone(s); startRaidFight(st, raid(1));
  assert.ok(st.activeMission.build.some((b) => b.piece === 'part' && b.id === 'yard'));
  assert.ok(pickSite('oldTown', 'r', 'raid:oldTown', st.activeMission.build).shapes.some((x) => x.cls === 'sp-gate'));
});

test('saves from v47 have what was built in Old Town paid back, with a note', async () => {
  const { importSave } = await import('../src/save/save.js');
  const s = createNewGame({ seed: 3 });
  s.version = 47;
  s.halls[0].build = [{ id: 'oldTown-1', piece: 'plate', x: 3, y: 2, rot: 0, day: 1 }, { id: 'oldTown-2', piece: 'barricade', x: 4, y: 2, rot: 0, day: 1 }];
  const cash = s.cash;
  const up = await importSave({ text: async () => JSON.stringify(s) });
  assert.equal(up.version, SAVE_VERSION);
  assert.deepEqual(up.halls[0].build, []);
  assert.equal(up.cash, cash + PIECES.plate.cost + PIECES.barricade.cost);
  assert.ok(up.inbox.some((m) => m.id.startsWith('hall-redrawn-oldTown')));
});
