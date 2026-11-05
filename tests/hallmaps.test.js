// A hall map per district (2026-11-05): a raid is fought in that district's own hall, and every hall
// gives both sides somewhere to stand, with cover, far enough apart for a fight.

import test from 'node:test';
import assert from 'node:assert/strict';
import { HALLS, HALL, pickSite } from '../src/data/sites.js';
import { HALL_SITES } from '../src/data/halls.js';
import { spotsForJob, siteRects } from '../src/core/fightspots.js';
import { BATTLE } from '../src/data/battle.js';

const on = ([x, y]) => x >= 0 && x <= 360 && y >= 0 && y <= 240;
const SOLID = new Set(['sp-cover', 'sp-desk', 'sp-stall', 'sp-planter', 'sp-cot', 'sp-stable', 'sp-water', 'sp-jetty', 'sp-block']);
const inside = ([x, y], r) => x > r.x && x < r.x + r.w && y > r.y && y < r.y + r.h;

test('every district with a hall has its own hall map, and a raid is fought there', () => {
  assert.deepEqual(Object.keys(HALLS).sort(), Object.keys(HALL_SITES).sort());
  for (const d of Object.keys(HALLS)) {
    assert.equal(pickSite(d, 'raid-x', `raid:${d}`), HALLS[d], d);
    assert.notEqual(HALLS[d], HALL, `${d}: not the shared hall`);
  }
  assert.equal(pickSite('ironPeak', 'raid-x', 'raid:ironPeak'), HALL, 'a district without its own falls back to the shared hall');
});

test('each hall is drawn on the map: its points, paths and posts, its shapes, one lit label', () => {
  for (const [d, site] of Object.entries(HALLS)) {
    assert.ok(site.name && site.aria, d);
    for (const p of [...Object.values(site.points), ...Object.values(site.paths).flat(), ...Object.values(site.posts)]) assert.ok(on(p), `${d}: ${p} on the map`);
    for (const r of siteRects(site)) assert.ok(r.x >= 0 && r.y >= 0 && r.x + r.w <= 360 && r.y + r.h <= 240, `${d}: ${r.cls} at ${r.x},${r.y} on the map`);
    for (const l of site.labels) assert.ok(on([l.x, l.y]), `${d}: ${l.text}`);
    assert.equal(site.labels.filter((l) => l.hi).length, 1, `${d}: one lit label`);
    for (const z of ['in', 'inside', 'target']) assert.ok(site.posts[z], `${d}: a post for ${z}`);
  }
});

test('a raid in every hall: room for everyone, cover on both sides, the sides apart, nobody inside furniture', () => {
  for (const d of Object.keys(HALLS)) {
    for (const n of [1, 2, 4, 8]) {
      const sp = spotsForJob(d, 'raid-x', `raid:${d}`, 'inside', n);
      assert.ok(sp, `${d}: spots`);
      assert.ok(sp.crew.length >= n + 2, `${d}: ${sp.crew.length} spots for ${n} of ours`);
      assert.ok(sp.guards.length >= BATTLE.maxGuards, `${d}: ${sp.guards.length} for the raiders`);
      const solid = siteRects(HALLS[d]).filter((r) => SOLID.has(r.cls));
      for (const s of [...sp.crew, ...sp.guards]) {
        assert.ok(on(s.at), `${d}: ${s.at} on the map`);
        assert.ok(!solid.some((r) => inside(s.at, r)), `${d}: ${s.at} not inside anything`);
      }
      const [c, g] = [sp.anchors.crew, sp.anchors.guards];
      assert.ok(Math.hypot(c[0] - g[0], c[1] - g[1]) >= 60, `${d}: the sides start apart`);
    }
    const sp = spotsForJob(d, 'raid-x', `raid:${d}`, 'inside', 4);
    assert.ok(sp.crew.some((s) => s.cover === 'full'), `${d}: full cover for ours`);
    assert.ok(sp.guards.some((s) => s.cover === 'full'), `${d}: full cover for the raiders`);
    assert.ok(sp.crew.slice(0, 2).every((s) => s.cover !== 'open'), `${d}: our first two in cover`);
  }
});
