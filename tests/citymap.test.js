// The City map, the command centre's neon map (part 2, 2026-11-05; supersedes the 2026-10-29 map
// built from the interface's parts) and the district pictures. Drawing only: what each district's
// plate and tokens say comes from the UI.

import test from 'node:test';
import assert from 'node:assert/strict';
import { cityMapSvg, cityMapLegend, MAP_DISTRICTS } from '../src/ui/citymap.js';
import { districtArt, docksScene } from '../src/ui/districtArt.js';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const district = (key, over = {}) => ({ key, name: key, label: `${key} label`, locked: false, selected: false, turf: '#ff3d5f', jobs: 0, home: false, heat: 0, talk: false, crews: [], ...over });
const face = (op, { size }) => `<svg width="${size}" height="${size}" data-face="${op.id}"></svg>`;

test('every district is a tap target with a plate and a 44px+ hit circle; locked ones are hatched and muted', () => {
  const svg = cityMapSvg(MAP_DISTRICTS.map((k) => district(k, { locked: k === 'silt' })), esc);
  for (const k of MAP_DISTRICTS) {
    assert.match(svg, new RegExp(`class="cm-d [^"]*" data-action="city-district" data-id="${k}" role="button" tabindex="0"`), k);
    assert.match(svg, new RegExp(`class="cm-plate[^"]*" data-action="city-district" data-id="${k}" aria-hidden="true"`), `${k} plate`);
  }
  assert.equal((svg.match(/class="cm-hit"[^>]*r="24"/g) ?? []).length, MAP_DISTRICTS.length, 'a 48-unit circle on every plate');
  assert.match(svg, /class="cm-d is-locked"[^>]*data-id="silt"/);
  assert.match(svg, />SILT</);
});

test('a plate says who is based there, its work and its heat; the picked district lights up', () => {
  const svg = cityMapSvg(MAP_DISTRICTS.map((k) => district(k, k === 'docks' ? { jobs: 2, heat: 7, talk: true, selected: true } : k === 'oldTown' ? { home: true, based: 5, jobs: 1, heat: 2 } : {})), esc);
  assert.match(svg, />⌂ 5 HERE · 1 JOB · HEAT 2</);
  assert.match(svg, />2 JOBS · HEAT 7</);
  assert.match(svg, /class="cm-plate__sub is-hot"/, 'heat 6+ reads red');
  assert.match(svg, /class="map-talk"/);
  assert.equal((svg.match(/class="cm-d [^"]*is-selected/g) ?? []).length, 1, 'the picked district lights up');
});

test('the glance layer: heat glows, crews out as faces on a route, a call pulses, a raid rings the hall', () => {
  const ops = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }];
  const svg = cityMapSvg(MAP_DISTRICTS.map((k) => district(k,
    k === 'docks' ? { heat: 7, crews: [{ ops, call: true, side: false, from: 'oldTown' }] }
      : k === 'nightMarket' ? { hall: true, based: 2, heat: 4, raid: 'FRI' }
        : k === 'oldTown' ? { home: true, based: 3, crews: [{ ops: [ops[0]], call: false, side: true, from: 'oldTown' }] } : {})), esc, { portrait: face });
  assert.match(svg, /class="cm-heat is-hot"/, 'the Docks at 7 glows and breathes');
  assert.match(svg, /class="cm-heat "/, 'the Night Market at 4 glows');
  assert.equal((svg.match(/data-face="/g) ?? []).length, 4, 'three faces for the crew of four (then +1), one for the side work');
  assert.match(svg, />\+1</);
  assert.match(svg, /class="cm-route is-call"/);
  assert.match(svg, /class="cm-call cm-call--pulse"/);
  assert.match(svg, /class="cm-token__ring is-side"/);
  assert.match(svg, /class="cm-raid cm-raid--pulse"/);
  assert.match(svg, />RAID FRI</);
  assert.match(cityMapLegend(), /Crew.*Calling.*Raid warned.*Hall/);
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
