// The hall build screen (ui/hallbuild.js; 2026-11-06, slice 1b): markup only, the rules are core's.

import test from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame } from '../src/core/state.js';
import { syncHalls } from '../src/core/halls.js';
import { buildableCells, hallMap, placePiece, partAt, bedCells, floorOf } from '../src/core/hallbuild.js';
import { renderHallBuild, hallBuildLine } from '../src/ui/hallbuild.js';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const money = (n) => `¥${n.toLocaleString()}`;
const ui = { esc, money, cityName: (d) => ({ nightMarket: 'The Night Market' })[d] ?? d };
const view = (over = {}) => ({ district: 'nightMarket', cell: null, piece: null, rot: 0, picked: null, ...over });
function tong(cash = 20000) {
  const s = createNewGame({ seed: 3, startCrew: 'fresh' });
  s.halls.push({ district: 'nightMarket', beds: 2, rent: 1000, level: 1, opened: 1, build: [] });
  syncHalls(s);
  s.cash = cash;
  return s;
}
const all = [...buildableCells(hallMap('nightMarket'))];
// Outside squares, where defences go (2026-11-07: every hall a compound).
const cells = all.filter((k) => !partAt(hallMap('nightMarket'), ...k.split(',').map(Number)).inside).map((k) => k.split(',').map(Number));

test('the plan, a tappable square on every free cell, the floor and the cash', () => {
  const html = renderHallBuild(ui, tong(), view());
  assert.match(html, /Build · the Night Market hall/);
  assert.match(html, /<svg class="siteplan"/);
  assert.equal((html.match(/data-action="build-cell"/g) ?? []).length, all.length, 'every free square, beds included');
  assert.match(html, new RegExp(`Floor <b>0/${floorOf(tong().halls.find((h) => h.district === 'nightMarket'))}</b>`));
  assert.match(html, /¥20,000/);
  assert.match(html, /Tap a free square/);
  for (const name of ['Barricade', 'Steel plate', 'Inner wall']) assert.match(html, new RegExp(name));
});

test('a square and a piece picked: a ghost where it would go, Place with its price, Turn for a piece that turns', () => {
  const [x, y] = cells[0];
  const html = renderHallBuild(ui, tong(), view({ cell: [x, y], piece: 'plate' }));
  assert.match(html, /class="bgrid__ghost"/);
  assert.match(html, /data-action="build-place" >Place · ¥4,000/);
  assert.match(html, /data-action="build-rot"/);
  assert.doesNotMatch(renderHallBuild(ui, tong(), view({ cell: [x, y], piece: 'barricade' })), /data-action="build-rot"/, 'a barricade doesn\'t turn');
});

test('what stops a piece is said, and Place is off', () => {
  const [x, y] = cells[0];
  const html = renderHallBuild(ui, tong(500), view({ cell: [x, y], piece: 'plate' }));
  assert.match(html, /class="small bsheet__why">Needs ¥4,000\./);
  assert.match(html, /data-action="build-place" disabled/);
});

test('a placed piece picked: Turn and Remove with half back; the halls list says what\'s built', () => {
  const [x, y] = cells[0];
  const s = placePiece(tong(), 'nightMarket', 'wall', x, y);
  const id = s.halls.find((h) => h.district === 'nightMarket').build[0].id;
  const html = renderHallBuild(ui, s, view({ picked: id }));
  assert.match(html, /Inner wall<\/strong> <span class="muted small">built day/);
  assert.match(html, /data-action="build-turn"/);
  assert.match(html, /Remove · ¥1,500 back/);
  const floor = floorOf(s.halls.find((h) => h.district === 'nightMarket'));
  assert.match(html, new RegExp(`Floor <b>1/${floor}</b>`));
  assert.equal(hallBuildLine(s.halls.find((h) => h.district === 'nightMarket')), `Built: 1 inner wall · floor 1/${floor}`);
  assert.equal(hallBuildLine({ level: 1, build: [] }), 'Nothing built yet · floor 0/6');
});

test('hall plans have one look per meaning (2026-11-12): no hatching, the next part dashed with its price, later parts a bare outline', async () => {
  const { partsOverlay, planKey } = await import('../src/ui/hallbuild.js');
  const { nextPart, heldParts } = await import('../src/core/hallbuild.js');
  const site = hallMap('nightMarket');
  const html = partsOverlay(site, 1, { esc });
  assert.doesNotMatch(html, /bhatch|<pattern/, 'no hatching');
  const next = nextPart(site, 1);
  assert.match(html, new RegExp(`class="bpart is-next"[^>]*aria-label="[^"]*take it with Expand, ¥${next.cost.toLocaleString()}`), 'the next part says what it costs');
  assert.match(html, new RegExp(`EXPAND › <tspan class="bpart__price">¥${next.cost.toLocaleString()}`));
  assert.doesNotMatch(html, /LEVEL \d/, 'later parts carry no words on the plan');
  const later = site.parts.filter((p) => p.lvl > 2);
  assert.equal((html.match(/class="bpart is-later"/g) ?? []).length, later.length, 'every part beyond the next is a bare outline');
  for (const p of heldParts(site, 1)) assert.doesNotMatch(html, new RegExp(`aria-label="${p.name}, `), 'a part we hold is plain, not a tap target');
  const key = planKey(tong(), 'nightMarket', { building: true, compound: true });
  assert.match(key, /Later</);
  assert.match(key, /Next: tap to Expand/);
  assert.doesNotMatch(key, /Locked/);
});
