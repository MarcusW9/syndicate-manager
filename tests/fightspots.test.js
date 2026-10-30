// Fight spots (command fights, step 2, 2026-10-30): where everyone stands in a fight, read off the
// site map (core/fightspots.js). Checked on every combination of every district that has them.
// Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { allSites } from '../src/data/sites.js';
import { fightSpots, siteRects } from '../src/core/fightspots.js';
import { BATTLE } from '../src/data/battle.js';

const near = (p, r, by) => p[0] > r.x - by && p[0] < r.x + r.w + by && p[1] > r.y - by && p[1] < r.y + r.h + by;

for (const { key, variant, site } of allSites().filter((x) => BATTLE.spotsIn.includes(x.key))) {
  test(`${key} ${variant}: every zone has spots for both sides, clear of cover, apart, and the cover is real`, () => {
    const rects = siteRects(site);
    const solid = rects.filter((r) => ['sp-cover', 'sp-desk', 'sp-water', 'sp-jetty'].includes(r.cls));
    const cover = rects.filter((r) => ['sp-cover', 'sp-desk'].includes(r.cls));
    for (const zone of ['in', 'inside', 'target']) {
      const s = fightSpots(site, zone, { crew: 7, guards: 4 });
      assert.ok(s, `${zone}: has spots`);
      assert.ok(s.crew.length >= 7 && s.guards.length >= 4, `${zone}: enough spots (${s.crew.length} crew, ${s.guards.length} guards)`);
      const all = [...s.crew, ...s.guards];
      for (const sp of all) {
        assert.ok(sp.at[0] >= 0 && sp.at[0] <= 360 && sp.at[1] >= 0 && sp.at[1] <= 240, `${zone}: ${sp.at} on the map`);
        assert.ok(!solid.some((r) => near(sp.at, r, 0)), `${zone}: ${sp.at} isn't inside anything solid`);
        if (sp.cover !== 'open') assert.ok(cover.some((r) => near(sp.at, r, 12)), `${zone}: ${sp.at} in ${sp.cover} cover is next to some`);
      }
      for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) assert.ok(Math.hypot(all[i].at[0] - all[j].at[0], all[i].at[1] - all[j].at[1]) >= 12, `${zone}: spots ${all[i].at} and ${all[j].at} apart`);
      const rank = { full: 0, half: 1, open: 2 };
      s.crew.forEach((sp, i) => i && assert.ok(rank[s.crew[i - 1].cover] <= rank[sp.cover], `${zone}: the crew's best cover comes first`));
      assert.deepEqual(fightSpots(site, zone, { crew: 7, guards: 4 }), s, `${zone}: the same every time`);
      // The crew are nearer their own anchor than the guards are, side by side.
      const C = s.anchors.crew;
      const mean = (l) => l.reduce((n, sp) => n + Math.hypot(sp.at[0] - C[0], sp.at[1] - C[1]), 0) / l.length;
      assert.ok(mean(s.crew.slice(0, 4)) < mean(s.guards), `${zone}: the crew stand on their side`);
    }
  });
}
