// The props on the job maps (ui/siteprops.js) are decoration: on the map, never on cover or the
// furniture a fight uses, never on the crew's route or where the guards wait, so nobody can take
// one for cover or lose sight of the way.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { allSites, siteHeight } from '../src/data/sites.js';
import { PROPS, propBox } from '../src/ui/siteprops.js';
import { rectsOf } from '../src/ui/siteart.js';

const SOLID = new Set(['sp-cover', 'sp-desk', 'sp-stall', 'sp-planter', 'sp-cot', 'sp-stable', 'sp-door', 'sp-room', 'sp-sign']);
const overlap = ([x, y, w, h], r) => x < r.x + r.w && r.x < x + w && y < r.y + r.h && r.y < y + h;
const distToSeg = ([px, py], [ax, ay], [bx, by]) => {
  const dx = bx - ax; const dy = by - ay; const l = dx * dx + dy * dy;
  const t = l ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / l)) : 0;
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
};
/** The nearest a box comes to a point. */
const boxDist = ([x, y, w, h], [px, py]) => Math.hypot(Math.max(x - px, 0, px - (x + w)), Math.max(y - py, 0, py - (y + h)));
/** The nearest a box comes to a path: its corners, centre and edge midpoints against each leg, and each bend against the box. */
const boxToPath = (b, path) => {
  const [x, y, w, h] = b;
  const probes = [[x, y], [x + w, y], [x, y + h], [x + w, y + h], [x + w / 2, y + h / 2], [x + w / 2, y], [x + w / 2, y + h], [x, y + h / 2], [x + w, y + h / 2]];
  let d = Infinity;
  for (let i = 0; i + 1 < path.length; i++) for (const p of probes) d = Math.min(d, distToSeg(p, path[i], path[i + 1]));
  for (const p of path) d = Math.min(d, boxDist(b, p));
  return d;
};

test('every prop kind on a map is one that can be drawn', () => {
  for (const { key, variant, site } of allSites()) for (const p of site.props ?? []) assert.ok(PROPS[p.kind], `${key} ${variant}: ${p.kind}`);
});

test('the job maps have props', () => {
  for (const { key, variant, site } of allSites()) assert.ok((site.props ?? []).length >= 4, `${key} ${variant}`);
});

test('props sit on the map, off cover and furniture, clear of the route and the guards', () => {
  for (const { key, variant, site } of allSites()) {
    const H = siteHeight(site);
    const solid = site.shapes.filter((s) => SOLID.has(s.cls)).flatMap(rectsOf);
    const paths = Object.values(site.paths);
    const spots = [site.points.van, site.points.perch, site.points.target, ...Object.values(site.posts ?? {})];
    for (const p of site.props ?? []) {
      const b = propBox(p);
      if (!b) continue; // overhead
      const where = `${key} ${variant}: ${p.kind} at ${p.x},${p.y}`;
      assert.ok(b[0] >= 0 && b[1] >= 0 && b[0] + b[2] <= 360 && b[1] + b[3] <= H, `${where} is off the map`);
      for (const r of solid) assert.ok(!overlap(b, r), `${where} sits on a ${JSON.stringify(r)}`);
      for (const path of paths) assert.ok(boxToPath(b, path) >= 6, `${where} is on the route`);
      for (const s of spots) assert.ok(boxDist(b, s) >= 10, `${where} is on a spot ${s}`);
    }
  }
});
