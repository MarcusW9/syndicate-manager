// The City map built from the interface's own parts (DESIGN.md 2026-10-29) and the district
// pictures. Drawing only: what each district's plate says comes from the UI.

import test from 'node:test';
import assert from 'node:assert/strict';
import { cityMapSvg, MAP_DISTRICTS } from '../src/ui/citymap.js';
import { districtArt, docksScene } from '../src/ui/districtArt.js';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const district = (key, over = {}) => ({ key, name: key, label: `${key} label`, locked: false, selected: false, turf: '#ff3d5f', jobs: 0, home: false, out: 0, talk: false, ...over });

test('every district is a tap target with a plate; locked ones say so', () => {
  const svg = cityMapSvg(MAP_DISTRICTS.map((k) => district(k, { locked: k === 'silt' })), esc);
  for (const k of MAP_DISTRICTS) {
    assert.match(svg, new RegExp(`class="cm-d [^"]*" data-action="city-district" data-id="${k}" role="button" tabindex="0"`), k);
    assert.match(svg, new RegExp(`class="cm-plate[^"]*" data-action="city-district" data-id="${k}" aria-hidden="true"`), `${k} plate`);
  }
  assert.match(svg, /LOCKED/);
  assert.doesNotMatch(svg, /cm-track|Lantern Course/, 'the racecourse is off the map (owner, 2026-10-28)');
});

test('a plate shows its work, HOME, crew out and street talk; the picked district gets the cyan edge', () => {
  const svg = cityMapSvg(MAP_DISTRICTS.map((k) => district(k, k === 'docks' ? { jobs: 2, out: 3, talk: true, selected: true } : k === 'oldTown' ? { home: true, jobs: 1 } : {})), esc);
  assert.match(svg, />2 JOBS</);
  assert.match(svg, />1 JOB</);
  assert.match(svg, />HOME</);
  assert.match(svg, />3 OUT</);
  assert.match(svg, /class="map-talk"/);
  assert.equal((svg.match(/class="cm-pick"/g) ?? []).length, 1);
  assert.match(svg, /NO WORK/);
});

test('the Docks picture is the same every time; districts without one get none', () => {
  assert.equal(docksScene(), docksScene());
  assert.equal(districtArt('docks'), docksScene());
  assert.match(docksScene(), /AHX 409/);
  assert.equal(districtArt('oldTown'), null);
});
