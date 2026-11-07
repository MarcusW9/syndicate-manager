// The route on the grid and the face-off (playtest, 2026-11-07): every site's route runs across or up
// and down only, keeps the points the site was drawn with, and doesn't run through more of a building
// than the old straight line did by more than the step into the target. The face-off only shows for
// one person's roll, with the roll the feed has.

import test from 'node:test';
import assert from 'node:assert/strict';
import { allSites, HALLS } from '../src/data/sites.js';
import { gridSite, gridChain, cutCorners } from '../src/ui/route.js';
import { duelFor } from '../src/ui/duel.js';

const sites = [...allSites(), ...Object.entries(HALLS).map(([key, site]) => ({ key: `hall:${key}`, variant: '', site }))];
const chain = (p) => [...p.in, ...p.inside.slice(1), ...p.target.slice(1)];
const BUILDINGS = new Set(['sp-building', 'sp-block', 'sp-house', 'sp-tower', 'sp-stable']);
// px of a polyline inside a building (sampled every pixel)
function inBuildings(points, site) {
  const rs = site.shapes.filter((s) => s.t === 'rect' && BUILDINGS.has(s.cls));
  let n = 0;
  for (let i = 1; i < points.length; i++) {
    const [ax, ay] = points[i - 1]; const [bx, by] = points[i]; const L = Math.hypot(bx - ax, by - ay);
    for (let t = 0; t < L; t += 1) { const x = ax + ((bx - ax) * t) / L; const y = ay + ((by - ay) * t) / L; if (rs.some((r) => x > r.x + 1 && x < r.x + r.w - 1 && y > r.y + 1 && y < r.y + r.h - 1)) n++; }
  }
  return n;
}

test('every site route runs across or up and down, through the points it was drawn with', () => {
  for (const { key, variant, site } of sites) {
    const g = gridSite(site);
    for (const zone of ['in', 'inside', 'target', 'out']) {
      const p = g.paths[zone];
      for (let i = 1; i < p.length; i++) assert.ok(p[i][0] === p[i - 1][0] || p[i][1] === p[i - 1][1], `${key} ${variant} ${zone}: a diagonal leg`);
      for (const pt of site.paths[zone]) assert.ok(p.some((q) => q[0] === pt[0] && q[1] === pt[1]), `${key} ${variant} ${zone}: lost a point`);
      assert.deepEqual(p[0], site.paths[zone][0]); assert.deepEqual(p.at(-1), site.paths[zone].at(-1));
    }
    // The zones still join: each starts where the last ended.
    assert.deepEqual(g.paths.inside[0], g.paths.in.at(-1));
    assert.deepEqual(g.paths.target[0], g.paths.inside.at(-1));
  }
});

test('the grid route crosses no more building than the straight one, give or take the step inside', () => {
  for (const { key, variant, site } of sites) {
    const before = inBuildings(chain(site.paths), site);
    const after = inBuildings(chain(gridSite(site).paths), site);
    assert.ok(after <= before + 30, `${key} ${variant}: ${before}px inside buildings, now ${after}px`);
  }
});

test('a way out that retraces the way in is drawn on the same line', () => {
  for (const { site } of sites) {
    const p = site.paths;
    if (JSON.stringify([...p.out].reverse()) !== JSON.stringify(chain(p))) continue;
    const g = gridSite(site).paths;
    assert.deepEqual([...g.out].reverse(), chain(g));
  }
});

test('gridChain turns a diagonal into an L and cutCorners cuts each turn', () => {
  const out = gridChain([[0, 0], [100, 50]], { shapes: [] });
  assert.equal(out.length, 3);
  assert.ok(cutCorners(out, 7).split('L').length === 4); // M, the cut's two ends, then the end
});

test('the face-off: one person\'s roll, against who or what they face', () => {
  const op = { id: 'a', handle: 'Signal', name: 'Chan Siu-ming' };
  const ops = (id) => (id === 'a' ? op : null);
  const card = { type: 'card', kind: 'incident', results: [{ headline: 'x', roll: { die: 12, value: 9, need: 18, stat: 'combat' } }], cue: { incident: 'guard', actor: 'a', success: true, danger: true } };
  const d = duelFor(card, ops, 'job1');
  assert.equal(d.me, op); assert.equal(d.foe.kind, 'person'); assert.equal(d.stat, 'combat');
  assert.equal(d.total, 21); assert.equal(d.success, true);
  assert.equal(duelFor(card, ops, 'job1').foe.op.name, d.foe.op.name, 'the same guard on the same job');
  assert.equal(duelFor({ ...card, cue: { ...card.cue, incident: 'lock' } }, ops).foe.kind, 'thing');
  assert.equal(duelFor({ ...card, results: [{ headline: 'x', roll: null }] }, ops), null, 'no roll, no face-off');
  assert.equal(duelFor({ ...card, kind: 'battle' }, ops), null, 'fights have their own screen');
  assert.equal(duelFor({ ...card, cue: { ...card.cue, actor: 'zz' } }, ops), null, 'nobody to show');
});
