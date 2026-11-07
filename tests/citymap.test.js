// The City map, the command centre's neon map (part 2, 2026-11-05; supersedes the 2026-10-29 map
// built from the interface's parts) and the district pictures. Drawing only: what each district's
// label and tokens say comes from the UI. Labels as HTML, the frame and zoom: 2026-11-07.

import test from 'node:test';
import assert from 'node:assert/strict';
import { cityMap, cityMapSvg, cityMapLabels, cityMapLegend, cityMapView, labelSub, FULL_VIEW, MAP_DISTRICTS } from '../src/ui/citymap.js';
import { districtArt, docksScene } from '../src/ui/districtArt.js';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const district = (key, over = {}) => ({ key, name: key, label: `${key} label`, locked: false, selected: false, turf: '#ff3d5f', jobs: 0, home: false, heat: 0, talk: false, crews: [], ...over });
const face = (op, { size }) => `<svg width="${size}" height="${size}" data-face="${op.id}"></svg>`;

test('every district is a tap target with a label (44px+ with its margin); locked ones are hatched and muted', () => {
  const ds = MAP_DISTRICTS.map((k) => district(k, { locked: k === 'silt' }));
  const svg = cityMapSvg(ds, esc);
  const labels = cityMapLabels(ds, esc);
  for (const k of MAP_DISTRICTS) {
    assert.match(svg, new RegExp(`class="cm-d [^"]*" data-action="city-district" data-id="${k}" role="button" tabindex="0"`), k);
    assert.match(labels, new RegExp(`class="cm-label[^"]*" data-action="city-district" data-id="${k}"`), `${k} label`);
  }
  assert.match(svg, /class="cm-d is-locked"[^>]*data-id="silt"/);
  assert.match(labels, /class="cm-label is-locked"[^>]*data-id="silt"/);
  assert.match(labels, />silt</);
});

test('a label says who is based there, its work, and heat only from 1; the picked district lights up', () => {
  const ds = MAP_DISTRICTS.map((k) => district(k, k === 'docks' ? { jobs: 2, heat: 7, talk: true, selected: true } : k === 'oldTown' ? { home: true, based: 5, jobs: 1, heat: 2 } : {}));
  const labels = cityMapLabels(ds, esc);
  assert.match(labels, />⌂ 5 HERE · 1 JOB · HEAT 2</);
  assert.match(labels, />2 JOBS · HEAT 7</);
  assert.match(labels, /class="cm-label__sub is-hot"/, 'heat 6+ reads red');
  assert.match(labels, /class="map-talk"/);
  assert.doesNotMatch(labels, /HEAT 0/, 'no heat, no heat line (2026-11-07)');
  assert.equal(labelSub(district('basin')), '', 'a quiet district is just its name');
  assert.equal((cityMapSvg(ds, esc).match(/class="cm-d [^"]*is-selected/g) ?? []).length, 1, 'the picked district lights up');
});

test('labels carry the landmark for a hall of ours and the picked district, never a locked one', () => {
  const ds = MAP_DISTRICTS.map((k) => district(k, k === 'oldTown' ? { home: true, based: 3 } : k === 'docks' ? { selected: true } : k === 'silt' ? { locked: true, selected: false } : {}));
  const labels = cityMapLabels(ds, esc);
  const icons = [...labels.matchAll(/data-id="(\w+)"[^>]*>(?:<span class="cm-label__raid">[^<]*<\/span>)?<svg class="cm-label__icon"/g)].map((m) => m[1]).sort();
  assert.deepEqual(icons, ['docks', 'oldTown']);
});

test('the glance layer: heat glows, crews out as faces on a route, a call pulses, a raid rings the hall', () => {
  const ops = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }];
  const ds = MAP_DISTRICTS.map((k) => district(k,
    k === 'docks' ? { heat: 7, crews: [{ ops, call: true, side: false, from: 'oldTown' }] }
      : k === 'nightMarket' ? { hall: true, based: 2, heat: 4, raid: 'FRI' }
        : k === 'oldTown' ? { home: true, based: 3, crews: [{ ops: [ops[0]], call: false, side: true, from: 'oldTown' }] } : {}));
  const svg = cityMapSvg(ds, esc, { portrait: face });
  assert.equal((svg.match(/class="cm-heat"/g) ?? []).length, 2, 'the Docks at 7 and the Night Market at 4 glow');
  assert.match(svg, /stop-color="rgb\(255,74,74\)"/, 'heat 6+ glows red');
  assert.equal((svg.match(/data-face="/g) ?? []).length, 4, 'three faces for the crew of four (then +1), one for the side work');
  assert.match(svg, />\+1</);
  assert.match(svg, /class="cm-route is-call"/);
  assert.match(svg, /class="cm-call cm-call--pulse"/);
  assert.match(svg, /class="cm-token__ring is-side"/);
  assert.match(svg, /class="cm-raid cm-raid--pulse"/);
  assert.match(cityMapLabels(ds, esc), />RAID FRI</);
  assert.match(cityMapLegend(), /Crew.*Calling.*Raid warned.*Hall/);
});

test('nothing moves on the map unless it means something: no ferry, no train; a landmark only once zoomed in', () => {
  const svg = cityMapSvg(MAP_DISTRICTS.map((k) => district(k, { heat: 8 })), esc);
  assert.doesNotMatch(svg, /map-ferry|cm-train|cm-landmark|cm-mark|cm-heat is-hot/);
  const zoomed = cityMapSvg(MAP_DISTRICTS.map((k) => district(k, { selected: k === 'docks' })), esc);
  assert.equal((zoomed.match(/class="cm-mark"/g) ?? []).length, 1, "the picked district's landmark, on the map (owner, 2026-11-07)");
});

test('zoom: the whole city by default; a picked district fills the view at the map\'s shape, inside the city', () => {
  assert.deepEqual(cityMapView(null), FULL_VIEW);
  const ar = FULL_VIEW[2] / FULL_VIEW[3];
  for (const k of MAP_DISTRICTS) {
    const [x, y, w, h] = cityMapView(k);
    assert.ok(Math.abs(w / h - ar) < 0.01, `${k}: same shape as the map`);
    assert.ok(w >= 175 - 0.1 && w < FULL_VIEW[2], `${k}: zoomed in, but no more than about 1.9×`);
    assert.ok(x >= FULL_VIEW[0] && y >= FULL_VIEW[1] && x + w <= FULL_VIEW[0] + FULL_VIEW[2] + 0.1 && y + h <= FULL_VIEW[1] + FULL_VIEW[3] + 0.1, `${k}: never past the city's edge`);
  }
});

test('the framed map: zoomed in, "× Whole city" takes the legend\'s place; the harbour zooms out too', () => {
  const whole = cityMap(MAP_DISTRICTS.map((k) => district(k)), esc);
  assert.match(whole, /class="mapframe "/);
  assert.match(whole, /citymap__legend/);
  assert.doesNotMatch(whole, /mapframe__out/);
  const zoomed = cityMap(MAP_DISTRICTS.map((k) => district(k, { selected: k === 'basin' })), esc);
  assert.match(zoomed, /class="mapframe__out" data-action="city-whole"/);
  assert.doesNotMatch(zoomed, /citymap__legend/);
  assert.match(zoomed, /class="cm-sea"[^>]*data-action="city-whole"/);
});

test('without faces to draw, the map draws no tokens', () => {
  const svg = cityMapSvg(MAP_DISTRICTS.map((k) => district(k, k === 'docks' ? { crews: [{ ops: [{ id: 'a' }], call: false, from: 'oldTown' }] } : {})), esc);
  assert.doesNotMatch(svg, /cm-token__ring/);
});

test('every open district has a picture, the same every time; locked ones have none', () => {
  assert.equal(districtArt('docks'), docksScene());
  assert.match(docksScene(), /AHX 409/);
  for (const k of ['docks', 'oldTown', 'nightMarket', 'heights', 'basin']) {
    const a = districtArt(k);
    assert.match(a, /^<svg viewBox="0 0 720 300"/, k);
    assert.match(a, /aria-label="[^"]+"/, `${k}: described for screen readers`);
    assert.equal(districtArt(k), a, `${k}: drawn the same each time`);
  }
  for (const k of ['ironPeak', 'amberReach', 'silt']) assert.equal(districtArt(k), null, k);
});
