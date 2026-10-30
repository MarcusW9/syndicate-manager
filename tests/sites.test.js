// Site plans (PLAN-CORE-LOOP.md, slice 4): every district has one, and each is well formed: on the
// map, routes that join zone to zone, 3:2 camera views that show their zone, and sight lines that
// keep the rule (the rifle can't see into the target; the drone sees everywhere). Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SITES, PLOTS, allSites, pickSite, targetsFor } from '../src/data/sites.js';
import { MISSIONS } from '../src/data/missions.js';
import { DISTRICTS } from '../src/data/districts.js';
import { ZONES, INCIDENTS } from '../src/data/incidents.js';
import { DISTRICT_INCIDENTS } from '../src/data/districtIncidents.js';
import { incidentIn } from '../src/core/incidents.js';
import { createNewGame } from '../src/core/state.js';
import * as M from '../src/core/mission.js';
import { addOffer } from '../src/core/jobs.js';

const W = 360;
const H = 240;
const onMap = ([x, y]) => x >= 0 && x <= W && y >= 0 && y <= H;
/** Point in polygon (ray casting). */
function inside([x, y], poly) {
  let hit = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i]; const [xj, yj] = poly[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}
const inBox = ([x, y], [bx, by, bw, bh]) => x >= bx && x <= bx + bw && y >= by && y <= by + bh;

test('every district has a site plan, and there is a generic one for anywhere else', () => {
  for (const key of Object.keys(DISTRICTS)) assert.ok(SITES[key], `${key} has a site`);
  assert.ok(SITES.generic);
});

// Every base site and every variant is held to the same rules.
for (const { key: district, variant, site } of allSites()) {
  const key = variant === 'base' ? district : `${district}/${variant}`;
  test(`${key}: on the map, and the route walks van → in → inside → target → back to the van`, () => {
    const { paths, points } = site;
    for (const zone of ['in', 'inside', 'target', 'out']) {
      assert.ok(paths[zone]?.length >= 2, `${zone} path`);
      for (const p of paths[zone]) assert.ok(onMap(p), `${zone}: ${p} on the map`);
    }
    assert.deepEqual(paths.in[0], points.van, 'starts at the van');
    assert.deepEqual(paths.inside[0], paths.in.at(-1), 'inside starts where the way in ends');
    assert.deepEqual(paths.target[0], paths.inside.at(-1), 'the target starts where inside ends');
    assert.deepEqual(paths.target.at(-1), points.target, 'ends at the target');
    assert.deepEqual(paths.out[0], points.target, 'the way out starts at the target');
    assert.deepEqual(paths.out.at(-1), points.van, 'and ends at the van');
    for (const p of Object.values(points)) assert.ok(onMap(p));
    for (const s of site.shapes) {
      const box = s.t === 'rect' ? [s.x, s.y, s.x + s.w, s.y + s.h] : s.t === 'line' ? [s.x1, s.y1, s.x2, s.y2] : null;
      if (box) assert.ok(box.every((v, i) => v >= 0 && v <= (i % 2 ? H : W)), `${s.cls} on the map`);
    }
    for (const l of site.labels) assert.ok(onMap([l.x, l.y]) && l.x + l.text.length * 5 <= W, `label ${l.text} fits`);
    assert.equal(site.labels.filter((l) => l.hi).length, 1, 'one target label');
  });

  test(`${key}: camera views are 3:2, on the map, and show their zone`, () => {
    for (const zone of ['in', 'inside', 'target']) {
      const [x, y, w, h] = site.views[zone];
      assert.ok(Math.abs(w / h - 1.5) < 0.02, `${zone} view is 3:2 (${w}x${h})`);
      assert.ok(x >= 0 && y >= 0 && x + w <= W + 1 && y + h <= H + 1, `${zone} view on the map`);
      for (const p of site.paths[zone]) assert.ok(inBox(p, site.views[zone]), `${zone} view shows ${p}`);
    }
  });

  test(`${key}: the rifle sees the open ground but not the target; the drone sees everywhere`, () => {
    const { rifle, drone } = site.sight;
    assert.equal(ZONES.target.open, false, 'the target is the closed zone');
    assert.ok(!inside(site.points.target, rifle), 'the rifle cannot see the target');
    assert.ok(inside(site.paths.inside.at(-1), rifle), 'the rifle sees the end of the inside walk');
    for (const p of [site.paths.in.at(-1), ...site.paths.inside, site.points.target]) assert.ok(inside(p, drone), `the drone sees ${p}`);
  });
}

// --- incident text per district (writing task 11) ----------------------------------------------

const LINES = ['text', 'hOk', 'ok', 'hBad', 'bad', 'comp'];

test('district incident lines only replace words, for known incidents, and keep {op} where the generic has it', () => {
  for (const key of Object.keys(DISTRICTS)) assert.ok(DISTRICT_INCIDENTS[key], `${key} has a slot`);
  for (const [district, lines] of Object.entries(DISTRICT_INCIDENTS)) {
    for (const [id, local] of Object.entries(lines)) {
      const base = INCIDENTS[id];
      assert.ok(base, `${district}: ${id} is an incident`);
      for (const [k, v] of Object.entries(local)) {
        assert.ok(LINES.includes(k), `${district}.${id}: only lines change, not ${k}`);
        if (k === 'comp') assert.ok(base.danger, `${district}.${id}: comp only on danger incidents`);
        if (base[k]?.includes('{op}')) assert.ok(v.includes('{op}'), `${district}.${id}.${k} keeps {op}`);
      }
    }
  }
});

test('every district has every incident written out, every line', () => {
  for (const district of Object.keys(DISTRICTS)) {
    for (const [id, base] of Object.entries(INCIDENTS)) {
      const local = DISTRICT_INCIDENTS[district][id];
      assert.ok(local, `${district}: ${id} is written`);
      for (const k of LINES) if (base[k]) assert.ok(local[k], `${district}.${id}.${k} is written`);
    }
  }
});

test('a district\'s own incident lines are used on its jobs, and the generic ones everywhere else', () => {
  assert.equal(incidentIn('lock', 'docks').text, DISTRICT_INCIDENTS.docks.lock.text);
  assert.equal(incidentIn('lock', 'docks').stats, INCIDENTS.lock.stats, 'the rules stay');
  assert.equal(incidentIn('lock', 'nightMarket').text, DISTRICT_INCIDENTS.nightMarket.lock.text);
  assert.equal(incidentIn('lock', 'nowhere').text, INCIDENTS.lock.text);
  let seen = 0;
  for (let seed = 1; seed <= 60 && !seen; seed++) {
    let s = createNewGame({ seed, startCrew: 'fresh' });
    s.jobs = []; addOffer(s, 'container409');
    s = M.startMission(s, s.jobs[0].id, s.crew.slice(0, 2).map((o) => o.id), 'stealth');
    while (M.currentStep(s.activeMission)?.type !== 'incident') s = M.currentStep(s.activeMission).type === 'zone' ? M.enterZone(s) : M.revealBeat(s);
    if (M.currentStep(s.activeMission).id !== 'lock') continue;
    s = M.runIncident(s);
    assert.equal(s.activeMission.events.find((e) => e.incident).text, DISTRICT_INCIDENTS.docks.lock.text);
    seen += 1;
  }
  assert.equal(seen, 1, 'found a Docks job that starts with a lock');
});

// --- plots and parts (DESIGN.md, 2026-10-29) --------------------------------------------------

/** The rects a shape covers (a row is n rects). */
function rectsOf(sh) {
  if (sh.t === 'rect') return [[sh.x, sh.y, sh.w, sh.h]];
  if (sh.t !== 'row') return [];
  return Array.from({ length: sh.n }, (_, i) => i).filter((i) => !sh.skip?.includes(i))
    .map((i) => (sh.axis === 'y' ? [sh.x, sh.y + i * sh.step, sh.w, sh.h] : [sh.x + i * sh.step, sh.y, sh.w, sh.h]));
}
/** Does the segment a-b pass through the rect (shrunk by 1, so brushing an edge is fine)? */
function crosses([ax, ay], [bx, by], [x, y, w, h]) {
  const [x0, y0, x1, y1] = [x + 1, y + 1, x + w - 1, y + h - 1];
  for (let k = 0; k <= 40; k++) {
    const px = ax + ((bx - ax) * k) / 40; const py = ay + ((by - ay) * k) / 40;
    if (px > x0 && px < x1 && py > y0 && py < y1) return true;
  }
  return false;
}

for (const [district, plot] of Object.entries(PLOTS)) {
  test(`${district}: every way in reaches the hub, every target starts there, and no route crosses any cover`, () => {
    for (const a of plot.approaches) {
      assert.deepEqual(a.in[0], a.van, `${a.id}: starts at the van`);
      assert.deepEqual(a.inside.at(-1), plot.hub, `${a.id}: ends at the hub`);
    }
    for (const t of plot.targets) assert.deepEqual(t.path[0], plot.hub, `${t.id}: starts at the hub`);
    const routes = [...plot.approaches.flatMap((a) => [a.in, a.inside].map((p) => [a.id, p])), ...plot.targets.map((t) => [t.id, t.path])];
    const solid = [...plot.covers.flatMap((c) => c.shapes.flatMap(rectsOf).map((r) => [c.id, r]))];
    for (const [who, path] of routes) {
      for (let i = 1; i < path.length; i++) for (const [cover, r] of solid) assert.ok(!crosses(path[i - 1], path[i], r), `${who}'s route ${path[i - 1]}→${path[i]} crosses ${cover} at ${r}`);
    }
    // A target's building stands clear of every cover and every way in.
    for (const t of plot.targets) {
      const walls = t.shapes.filter((sh) => sh.cls === 'sp-building').flatMap(rectsOf);
      for (const w of walls) {
        for (const [cover, r] of solid) assert.ok(!(r[0] < w[0] + w[2] && w[0] < r[0] + r[2] && r[1] < w[1] + w[3] && w[1] < r[1] + r[3]), `${t.id}'s building overlaps ${cover}`);
        for (const a of plot.approaches) for (const p of [...a.in, ...a.inside]) assert.ok(!crosses(p, p, w), `${a.id} walks through ${t.id}'s building`);
      }
    }
  });
}

test('a job\'s own target is always its place; every other job in the district gets the usual ones', () => {
  for (const [district, plot] of Object.entries(PLOTS)) {
    for (const t of plot.targets.filter((x) => x.jobs)) {
      for (const job of t.jobs) {
        const m = MISSIONS.find((x) => x.id === job);
        assert.ok(m, `${t.id}: ${job} is a real job`);
        assert.equal(m.district, district, `${t.id}: ${job} is a ${district} job`);
        for (let n = 1; n <= 30; n++) assert.equal(pickSite(district, `job-${n}`, job).parts.target, t.id, `${job} always gets ${t.id}`);
      }
    }
    for (const m of MISSIONS.filter((x) => x.district === district && !plot.targets.some((t) => t.jobs?.includes(x.id)))) {
      const usual = new Set(targetsFor(plot, m.id).map((t) => t.id));
      for (let n = 1; n <= 30; n++) assert.ok(usual.has(pickSite(district, `job-${n}`, m.id).parts.target), `${m.id} gets a usual target`);
    }
  }
});

test('the place for a job is picked from its id: the same job always looks the same, different jobs differ, anywhere else is as it was', () => {
  const seen = { approach: new Set(), cover: new Set() };
  for (let n = 1; n <= 90; n++) {
    const site = pickSite('docks', `job-${n}`, 'protection');
    assert.equal(JSON.stringify(pickSite('docks', `job-${n}`, 'protection')), JSON.stringify(site), 'stable');
    seen.approach.add(site.parts.approach);
    seen.cover.add(site.parts.cover);
  }
  assert.equal(seen.approach.size, PLOTS.docks.approaches.length, 'every way in comes up');
  assert.equal(seen.cover.size, PLOTS.docks.covers.length, 'every cover comes up');
  assert.equal(pickSite('nowhere', 'job-3'), SITES.generic);
  assert.equal(pickSite('basin', 'job-3', 'favourite'), SITES.basin, 'a district not yet in parts always gets its own site');
});
