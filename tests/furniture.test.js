// The furniture pack (ui/furniture.js): every piece draws, every room kit names real pieces, and a
// furnished room is the same from the same seed, inside the room, clear of the way through, never two
// solid pieces on top of each other, and never more of a piece than it allows.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FURNITURE, ROOM_KITS, ROOMS, furnishRoom, furnitureSvg } from '../src/ui/furniture.js';

const rngOf = (seed) => { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
const overlap = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

test('every piece has a size, known rooms and draws clean markup', () => {
  for (const [id, f] of Object.entries(FURNITURE)) {
    assert.ok(f.w > 0 && f.h > 0, id);
    assert.ok(f.rooms.length && f.rooms.every((r) => ROOMS.includes(r)), `${id} rooms`);
    const svg = furnitureSvg({ id, x: 10, y: 10, w: f.w, h: f.h });
    assert.ok(svg.length > 20, `${id} draws`);
    assert.ok(!/NaN|undefined/.test(svg), `${id} draws numbers`);
  }
});

test('every room kit names real pieces, and every kind of room has one', () => {
  for (const [kind, kit] of Object.entries(ROOM_KITS)) {
    assert.ok(ROOMS.includes(kind), kind);
    for (const id of [...kit.must, ...kit.may]) assert.ok(FURNITURE[id], `${kind}: ${id}`);
  }
  for (const r of ROOMS) assert.ok(ROOM_KITS[r], `a kit for ${r}`);
});

test('a furnished room: same from the same seed, inside, clear of the way through, no stacking, maxes kept', () => {
  const sizes = [{ x: 10, y: 10, w: 60, h: 50 }, { x: 0, y: 0, w: 140, h: 90 }, { x: 20, y: 30, w: 200, h: 120 }];
  for (const kind of ROOMS) for (const room of sizes) for (let s = 1; s <= 40; s++) {
    const lane = [{ x: room.x + room.w / 2 - 9, y: room.y, w: 18, h: room.h }];
    const a = furnishRoom(rngOf(s), room, kind, lane);
    assert.deepEqual(a, furnishRoom(rngOf(s), room, kind, lane));
    for (const p of a) {
      assert.ok(p.x >= room.x && p.y >= room.y && p.x + p.w <= room.x + room.w && p.y + p.h <= room.y + room.h, `${kind} ${p.id} inside`);
      assert.ok(!lane.some((l) => overlap(p, l)), `${kind} ${p.id} off the way through`);
    }
    const solid = a.filter((p) => !FURNITURE[p.id].flat);
    for (let i = 0; i < solid.length; i++) for (let j = i + 1; j < solid.length; j++) assert.ok(!overlap(solid[i], solid[j]), `${kind}: ${solid[i].id} on ${solid[j].id}`);
    for (const id of new Set(a.map((p) => p.id))) {
      const max = Math.max(FURNITURE[id].max ?? 2, ROOM_KITS[kind].must.filter((m) => m === id).length);
      assert.ok(a.filter((p) => p.id === id).length <= max, `${kind}: too many ${id}`);
    }
  }
});
