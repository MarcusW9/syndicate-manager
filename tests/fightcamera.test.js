// The fight camera (ui/siteplan.js frameFight, 2026-11-03): every token in a fight is framed
// whole, even beside the site's edge, and the camera only looks past the edge when it has to.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { frameFight, TOKEN_REACH, EDGE_PAD } from '../src/ui/siteplan.js';

const W = 360; const H = 240;
const holds = ([x, y, w, h], [px, py]) => px - TOKEN_REACH >= x - 1e-9 && px + TOKEN_REACH <= x + w + 1e-9 && py - TOKEN_REACH >= y - 1e-9 && py + TOKEN_REACH <= y + h + 1e-9;

test('tokens by the edge are framed whole, within the allowance past the edge', () => {
  const cases = [
    [[352, 120], [340, 132], [300, 110]], // right edge (the owner's capture)
    [[8, 60], [20, 70]], // left edge
    [[180, 8], [200, 12]], // top
    [[120, 232], [140, 226]], // bottom (the road)
    [[354, 232], [8, 8]], // opposite corners
  ];
  for (const ar of [1.5, 1.2, 1.39, 2]) {
    for (const pts of cases) {
      const box = frameFight(pts, ar);
      for (const p of pts) assert.ok(holds(box, p), `ar ${ar}: ${p} framed whole in ${box.map(Math.round)}`);
      const [x, y, w, h] = box;
      assert.ok(x >= -EDGE_PAD && y >= -EDGE_PAD && x + w <= W + EDGE_PAD && y + h <= H + EDGE_PAD, `ar ${ar}: ${box.map(Math.round)} within the allowance`);
    }
  }
});

test('a fight in the middle stays on the site, in the map\'s shape', () => {
  for (const ar of [1.5, 1.2]) {
    const [x, y, w, h] = frameFight([[150, 120], [190, 110], [210, 140]], ar);
    assert.ok(x >= 0 && y >= 0 && x + w <= W && y + h <= H, 'inside the site');
    assert.ok(Math.abs(w / h - ar) < 1e-6, 'the map\'s shape');
  }
});
