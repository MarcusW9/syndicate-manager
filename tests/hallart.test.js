// The hall art layer and the hall page's pieces (ui/hallart.js, ui/hallsprites.js; 2026-11-09): markup only.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame } from '../src/core/state.js';
import { expandHall } from '../src/core/halls.js';
import { PIECES } from '../src/data/hallBuild.js';
import { hallMap, waysIn } from '../src/core/hallbuild.js';
import { hallArtSvg, waysOverlay, hasHallArt } from '../src/ui/hallart.js';
import { SPRITE_IDS, SPRITE_SHEET } from '../src/ui/hallsprites.js';
import { planKey, raidWaysFor } from '../src/ui/hallbuild.js';

const tong = () => { const s = createNewGame({ seed: 3, startCrew: 'fresh' }); s.cash = 99999; return s; };

test('the sheet has a sprite for every piece and the bed, and the art is Old Town only', () => {
  for (const id of [...Object.keys(PIECES), 'bed']) assert.ok(SPRITE_IDS.includes(id), `a sprite for ${id}`);
  assert.match(SPRITE_SHEET, /<symbol id="hs-clinic"/);
  assert.ok(hasHallArt('oldTown'));
  assert.ok(!hasHallArt('docks'));
});

test('the art draws the plan on the same 360 × 240 box, a shutter on each locked part and a sprite for each bed', () => {
  const s = tong();
  const html = hallArtSvg(s, 'oldTown');
  assert.match(html, /viewBox="0 0 360 240"/);
  assert.equal((html.match(/class="ha-shutter"/g) ?? []).length, 3, 'flat, yard and back kitchen locked at level 1');
  assert.equal((html.match(/data-roof="/g) ?? []).length, 3, 'the compound is three rooftops');
  assert.equal((html.match(/data-piece="bed"/g) ?? []).length, 0, 'no beds on a roof');
  const room = hallArtSvg(s, 'oldTown', { inside: 'room' });
  assert.equal((room.match(/data-piece="bed"/g) ?? []).length, s.halls[0].beds, 'the beds are inside the room');
  assert.doesNotMatch(room, /viewBox="0 0 360 240"/, 'cropped to the building');
  const up = expandHall(s, 'oldTown');
  assert.equal((hallArtSvg(up, 'oldTown').match(/class="ha-shutter"/g) ?? []).length, 2);
});

test('a pending raid marks only the ways in the hall has opened, in red, and says who; none pending, nothing', () => {
  const s = tong();
  assert.equal(raidWaysFor(s, 'oldTown'), '');
  s.raids = [{ id: 'raid-oldTown-1', district: 'oldTown', by: 'police', warnedDay: 1, day: 4, answer: null, outcome: null, done: false, followed: null }];
  const one = raidWaysFor(s, 'oldTown');
  assert.equal((one.match(/class="rway__way"/g) ?? []).length, waysIn(hallMap('oldTown'), 1).length);
  assert.match(one, /THE POLICE · STREET/);
  assert.match(planKey(s, 'oldTown'), /Raiders&#39; way in|Raiders' way in/);
  assert.equal((waysOverlay(hallMap('oldTown'), 3, 'Police').match(/class="rway__way"/g) ?? []).length, 2, 'the yard gate opens at level 3');
  s.raids[0].answer = 'paid';
  assert.equal(raidWaysFor(s, 'oldTown'), '');
});

import { buildingsOf, compoundOverlay, planSvg } from '../src/ui/hallbuild.js';
import { placePiece, hallMap as hm, buildableCells, partAt } from '../src/core/hallbuild.js';

test('the compound lists only the hall\'s own parts as buildings, with who sleeps in each and the rooms built', () => {
  let s = tong();
  const site = hm('oldTown');
  assert.deepEqual(buildingsOf(s, 'oldTown').map((b) => b.id), ['room'], 'level 1 holds the room only');
  const up = expandHall(s, 'oldTown');
  const names = buildingsOf(up, 'oldTown').map((b) => b.name);
  for (const n of names) assert.ok(site.parts.some((p) => p.name === n), `${n} is a part of the compound`);
  const [room] = buildingsOf(s, 'oldTown');
  assert.equal(room.who.length, s.crew.length, 'everyone sleeps in the one building there is');
  assert.deepEqual(room.rooms, []);
  const cell = [...buildableCells(site, 1)].map((k) => k.split(',').map(Number)).find(([x, y]) => partAt(site, x, y).inside && [[1, 0], [0, 1], [1, 1]].every(([a, b]) => buildableCells(site, 1).has(`${x + a},${y + b}`)));
  s = placePiece(s, 'oldTown', 'workboard', ...(cell ?? [3, 5]));
  assert.ok(compoundOverlay(s, 'oldTown', {}).includes('data-action="hall-building"'));
  assert.doesNotMatch(planSvg(s, 'oldTown', false, { compound: true }), /sp-cot/, 'beds are not drawn on the compound');
});
