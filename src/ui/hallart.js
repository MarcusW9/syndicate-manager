// The hall art layer (2026-11-09, the Hall page art pass; behind the "Hall art" setting, Old Town
// only for now). It draws the hall's plan as a top-down street-terminal picture over the SAME 360 × 240
// plan and 12 × 8 grid as the plain look, so the tap grid, the parts overlay and the raid markers sit
// on it unchanged: floor tiles per area, thick walls with a light 3/4 shadow, one sprite per piece
// (ui/hallsprites.js) at its footprint and turn, locked areas in shadow behind a shutter, and soft
// neon light from the street-terminal palette. Markup only; reads state, never changes it.
//
// Also here: `waysOverlay`, the raid's ways in (core/hallbuild.js waysIn), which draws on either look.

import { HALL_BUILD, PIECES } from '../data/hallBuild.js';
import { bedsOnFloor, hallMap, heldParts, waysIn } from '../core/hallbuild.js';
import { hallIn, residents } from '../core/halls.js';
import { SPRITE_SHEET } from './hallsprites.js';

const C = HALL_BUILD.cell;
/** Districts that have the art layer so far. */
export const ART_DISTRICTS = ['oldTown'];
export const hasHallArt = (district) => ART_DISTRICTS.includes(district);
export { SPRITE_SHEET };

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

// Floor tiles per area: bunk room (boards), the flat (lino), back kitchen (tile), yard (concrete),
// lane (wet cobbles), street (asphalt) and the alley (grating).
const DEFS = `<defs>
  <pattern id="hf-room" width="24" height="16" patternUnits="userSpaceOnUse"><rect width="24" height="16" fill="#2a2320"/><path d="M0 .4H24M0 8.4H24" stroke="#17120f" stroke-width=".8"/><path d="M8 0V8M20 8V16" stroke="#17120f" stroke-width=".6"/><path d="M0 1.2H24M0 9.2H24" stroke="#fff" stroke-opacity=".04" stroke-width=".6"/></pattern>
  <pattern id="hf-flat" width="12" height="12" patternUnits="userSpaceOnUse"><rect width="12" height="12" fill="#1e2530"/><rect width="6" height="6" fill="#232c3a"/><rect x="6" y="6" width="6" height="6" fill="#232c3a"/></pattern>
  <pattern id="hf-kitchen" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#1b2828"/><path d="M0 .3H8M.3 0V8" stroke="#0f1717" stroke-width=".6"/></pattern>
  <pattern id="hf-yard" width="30" height="30" patternUnits="userSpaceOnUse"><rect width="30" height="30" fill="#191c23"/><path d="M0 .4H30M.4 0V30" stroke="#0f1116" stroke-width=".8"/><path d="M6 8l5 3-2 6M20 18l6-2M14 24l3 4" stroke="#0f1116" stroke-width=".6" fill="none"/></pattern>
  <pattern id="hf-lane" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill="#14171e"/><path d="M0 5a5 5 0 0 1 10 0M-5 10a5 5 0 0 1 10 0M5 10a5 5 0 0 1 10 0" stroke="#0d0f14" stroke-width=".8" fill="none"/></pattern>
  <pattern id="hf-street" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="#101217"/><circle cx="4" cy="6" r=".6" fill="#1a1d25"/><circle cx="14" cy="15" r=".6" fill="#1a1d25"/></pattern>
  <pattern id="hf-alley" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#13161c"/><path d="M0 4H8" stroke="#0d0f14" stroke-width="1"/></pattern>
  <pattern id="hf-roof" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill="#10131a"/><path d="M0 9.6H10" stroke="#171b24" stroke-width=".8"/></pattern>
  <pattern id="hf-shutter" width="8" height="5" patternUnits="userSpaceOnUse"><rect width="8" height="5" fill="#161a22"/><rect width="8" height="1.2" fill="#3a4252"/><rect y="1.2" width="8" height="1" fill="#0b0d11"/></pattern>
  <radialGradient id="hl-red"><stop offset="0" stop-color="#ff3d5f" stop-opacity=".5"/><stop offset="1" stop-color="#ff3d5f" stop-opacity="0"/></radialGradient>
  <radialGradient id="hl-cyan"><stop offset="0" stop-color="#3de8d8" stop-opacity=".34"/><stop offset="1" stop-color="#3de8d8" stop-opacity="0"/></radialGradient>
  <radialGradient id="hl-gold"><stop offset="0" stop-color="#f2d541" stop-opacity=".36"/><stop offset="1" stop-color="#f2d541" stop-opacity="0"/></radialGradient>
  <radialGradient id="hl-violet"><stop offset="0" stop-color="#b48cff" stop-opacity=".3"/><stop offset="1" stop-color="#b48cff" stop-opacity="0"/></radialGradient>
</defs>`;

const FLOOR = { room: 'hf-room', flat: 'hf-flat', kitchen: 'hf-kitchen', yard: 'hf-yard', lane: 'hf-lane' };
const part = (site, id) => site.parts.find((p) => p.id === id);
const box = (p) => { const [x0, y0, x1, y1] = p.grid; return { x: x0 * C, y: y0 * C, w: (x1 - x0 + 1) * C, h: (y1 - y0 + 1) * C }; };
const overlap = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

/** A building: a ground shadow, thick walls with a lit top-left and dark south and east faces, a floor. */
function building(r, floor) {
  const t = 5;
  return `<g class="ha-bld">
    <rect x="${r.x + 7}" y="${r.y + 7}" width="${r.w}" height="${r.h}" fill="#000" opacity=".42"/>
    <rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" fill="#2e3646"/>
    <rect x="${r.x + t}" y="${r.y + t}" width="${r.w - 2 * t}" height="${r.h - 2 * t}" fill="url(#${floor})"/>
    <path d="M${r.x + .7} ${r.y + r.h - .7}V${r.y + .7}H${r.x + r.w - .7}" fill="none" stroke="#8798b4" stroke-opacity=".55" stroke-width="1.2"/>
    <path d="M${r.x + r.w - 1} ${r.y + 1}V${r.y + r.h - 1}H${r.x + 1}" fill="none" stroke="#0b0d11" stroke-opacity=".7" stroke-width="2"/>
    <rect x="${r.x + t}" y="${r.y + t}" width="${r.w - 2 * t}" height="3" fill="#000" opacity=".28"/>
    <rect x="${r.x + t}" y="${r.y + t}" width="3" height="${r.h - 2 * t}" fill="#000" opacity=".2"/>
  </g>`;
}

/** One thing on the floor (a piece or a bed): its sprite at its footprint, turned if it is. */
function sprite(id, b) {
  const p = id === 'bed' ? { size: [1, 1], turns: false } : PIECES[id];
  const [w, h] = p.size;
  const turned = !!(b.rot && p.turns);
  const x = b.x * C, y = b.y * C;
  const ref = `<use href="#hs-${id}" width="${w * C}" height="${h * C}"/>`;
  // Turned a quarter: the sprite is rotated about its top-left corner and slid into the swapped box.
  return `<g class="ha-piece" data-piece="${id}" transform="${turned ? `translate(${x + h * C} ${y}) rotate(90)` : `translate(${x} ${y})`}">${ref}</g>`;
}

/** The art plan for a hall: an <svg class="siteplan hallart"> over the same 360 × 240 plan. */
export function hallArtSvg(state, district) {
  const site = hallMap(district);
  const hall = hallIn(state, district);
  const level = hall?.level ?? 1;
  const held = new Set(heldParts(site, level).map((p) => p.id));
  const sh = site.shapes;
  const lane = box(part(site, 'lane'));
  const lit = (id) => held.has(id);
  const shapesOf = (cls) => sh.filter((s) => s.cls === cls);
  // The three buildings sit on their parts' floors: the room, the flat, the back kitchen.
  const houseOf = (r) => ['room', 'flat', 'kitchen'].find((id) => overlap(r, box(part(site, id)))) ?? 'flat';
  const houses = shapesOf('sp-house').map((r) => ({ r, id: houseOf(r) }));
  const blocks = shapesOf('sp-block');
  const covers = shapesOf('sp-cover');
  const doors = shapesOf('sp-door');
  const signs = shapesOf('sp-sign');
  const yard = box(part(site, 'yard'));
  const yardWalls = part(site, 'yard').shapes ?? [];
  const yardLine = (s) => (s.t === 'line' ? `<line x1="${s.x1}" y1="${s.y1}" x2="${s.x2}" y2="${s.y2}" stroke="#2e3646" stroke-width="6" stroke-linecap="square"/><line x1="${s.x1}" y1="${s.y1 - 2}" x2="${s.x2}" y2="${s.y2 - 2}" stroke="#8798b4" stroke-opacity=".5" stroke-width="1"/>` : `<rect x="${s.x}" y="${s.y - 1}" width="${s.w}" height="${s.h + 2}" fill="${s.fill}" stroke="#0b0d11" stroke-width=".8"/>`);

  const ground = `
    <rect width="360" height="240" fill="#0b0d11"/>
    <rect x="0" y="0" width="360" height="30" fill="url(#hf-alley)"/>
    <rect x="0" y="212" width="360" height="28" fill="url(#hf-street)"/>
    <line x1="0" y1="226" x2="360" y2="226" stroke="#3a4152" stroke-width="1.4" stroke-dasharray="9 7" opacity=".7"/>
    <rect x="${yard.x}" y="${yard.y}" width="${yard.w}" height="${yard.h}" fill="url(#hf-yard)"/>
    <rect x="${lane.x}" y="${lane.y}" width="${lane.w}" height="${lane.h}" fill="url(#hf-lane)"/>
    <rect x="${lane.x}" y="${lane.y}" width="${lane.w}" height="${lane.h}" fill="none" stroke="#000" stroke-opacity=".25" stroke-width="6"/>
    <rect x="${lane.x + 4}" y="${lane.y + 4}" width="${lane.w - 8}" height="${lane.h - 8}" fill="none" stroke="#3de8d8" stroke-opacity=".06" stroke-width="10"/>`;
  const neighbours = blocks.map((r) => `<rect x="${r.x + 5}" y="${r.y + 5}" width="${r.w}" height="${r.h}" fill="#000" opacity=".4"/><rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" fill="url(#hf-roof)" stroke="#2a3140" stroke-width="1"/><path d="M${r.x + 3} ${r.y + 6}h8M${r.x + 3} ${r.y + 14}h8" stroke="#2a3140" stroke-width="2"/>`).join('');
  const buildings = houses.map(({ r, id }) => building(r, FLOOR[id])).join('');
  const yardGear = held.has('yard') ? yardWalls.map(yardLine).join('') : '';
  const props = covers.map((s) => `<g class="ha-prop"><rect x="${s.x + 2.5}" y="${s.y + 2.5}" width="${s.w}" height="${s.h}" rx="1.5" fill="#000" opacity=".4"/><rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" rx="1.5" fill="${s.fill}" stroke="#0b0d11" stroke-width=".8"/><rect x="${s.x + .6}" y="${s.y + .6}" width="${s.w - 1.2}" height="1.4" fill="#fff" opacity=".18"/></g>`).join('');
  const doorsSvg = doors.map((s) => `<rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" fill="#0b0d11"/><rect x="${s.x + (s.w > s.h ? 0 : 1)}" y="${s.y + (s.w > s.h ? 1 : 0)}" width="${s.w > s.h ? s.w : 1.6}" height="${s.w > s.h ? 1.6 : s.h}" fill="#3de8d8" opacity=".85"/>`).join('');
  const signsSvg = signs.map((s) => `<ellipse cx="${s.x + s.w / 2}" cy="${s.y + s.h + 12}" rx="${s.w * 1.2}" ry="16" fill="url(#hl-red)"/><rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" fill="${s.fill}"/><rect x="${s.x}" y="${s.y}" width="${s.w}" height="1.2" fill="#fff" opacity=".5"/>`).join('');
  const gate = shapesOf('sp-gate')[0] ?? yardWalls.find((s) => s.cls === 'sp-gate');

  const floorThings = [...bedsOnFloor(hall), ...(hall?.build ?? [])];
  const sleepers = new Set(residents(state, district).map((_, i) => `bed-${i + 1}`));
  const things = floorThings.map((b) => sprite(b.piece, b) + (b.piece === 'bed' && sleepers.has(b.id) ? `<rect class="ha-slept" x="${b.x * C + 2}" y="${b.y * C + 2}" width="${C - 4}" height="${C - 4}" rx="2"/>` : '')).join('');

  // Locked parts: dark, behind a shutter. The shutter is drawn over the building's walls too.
  const shutters = site.parts.filter((p) => !lit(p.id)).map((p) => {
    const r = box(p);
    return `<g class="ha-shutter"><rect x="${r.x + 1}" y="${r.y + 1}" width="${r.w - 2}" height="${r.h - 2}" fill="url(#hf-shutter)"/><rect x="${r.x + 1}" y="${r.y + 1}" width="${r.w - 2}" height="${r.h - 2}" fill="#05070a" opacity=".66"/><rect x="${r.x + 1}" y="${r.y + 1}" width="${r.w - 2}" height="3" fill="#000" opacity=".5"/><rect x="${r.x + 1}" y="${r.y + r.h - 4}" width="${r.w - 2}" height="3" fill="#6f7b92" opacity=".5"/></g>`;
  }).join('');

  // Soft neon: the noodle sign's red spill on the street, cyan from the doors, gold at the yard gate,
  // violet from the back kitchen's side, a faint cyan wash in the lane.
  const light = `<g class="ha-light" style="mix-blend-mode:screen" pointer-events="none">
    <ellipse cx="${lane.x + lane.w / 2}" cy="${lane.y + lane.h / 2}" rx="34" ry="70" fill="url(#hl-cyan)"/>
    ${doors.slice(0, 2).map((s) => `<circle cx="${s.x + s.w / 2}" cy="${s.y + s.h / 2}" r="20" fill="url(#hl-cyan)"/>`).join('')}
    ${gate && held.has('yard') ? `<circle cx="${gate.x + gate.w / 2}" cy="${gate.y}" r="26" fill="url(#hl-gold)"/>` : ''}
    ${signs.map((s) => `<ellipse cx="${s.x + s.w / 2}" cy="${s.y + 18}" rx="64" ry="26" fill="url(#hl-red)"/>`).join('')}
    <circle cx="340" cy="20" r="34" fill="url(#hl-violet)"/>
  </g>`;
  const labels = site.labels.map((l) => `<text class="ha-label ${l.hi ? 'is-hi' : ''}" x="${l.x}" y="${l.y}">${esc(l.text)}</text>`).join('');

  return `<svg class="siteplan hallart" viewBox="0 0 360 240" role="img" aria-label="${esc(site.aria)}">${DEFS}${ground}${neighbours}${buildings}${doorsSvg}${yardGear}${props}${things}${shutters}${signsSvg}${light}${labels}<rect width="360" height="240" fill="none" stroke="#000" stroke-opacity=".55" stroke-width="10"/></svg>`;
}

/** The names the raid's approach is labelled with, by way id. */
const WAY_NAMES = { street: 'STREET', gate: 'YARD GATE' };

/**
 * A pending raid's ways in, in red (core/hallbuild.js waysIn: only the ways the hall's level has opened),
 * each an arrow from where the raiders start to the hall's heart, with the raiders' name. Not a
 * prediction: which way a raid takes is picked when it comes (core/raids.js), so all open ways show.
 * Drawn on the plain look and the art look alike. `who`: "Police", "Silver Fan collectors".
 */
export function waysOverlay(site, level, who) {
  const ways = waysIn(site, level).filter((w) => w.id);
  if (!ways.length) return '';
  return `<g class="rway" pointer-events="none">${ways.map((w) => {
    const [ex, ey] = w.posts.in;
    const [ax, ay] = w.paths.inside.at(-1);
    const via = [ex, ay];
    const name = WAY_NAMES[w.id] ?? String(w.id).toUpperCase();
    const down = ey > ay; // starts below the heart: label above the start would run off the plan, so put it beside
    const lx = Math.min(300, Math.max(6, ex + 8)), ly = Math.min(236, Math.max(10, ey + (down ? -4 : 12)));
    return `<g class="rway__way"><path class="rway__line" d="M${ex} ${ey}L${via[0]} ${via[1]}L${ax} ${ay}"/><circle class="rway__dot" cx="${ex}" cy="${ey}" r="5"/><path class="rway__arrow" d="M${ex} ${ey - 3}l3 4h-6z"/><text class="rway__label" x="${lx}" y="${ly}">${esc(`${String(who).toUpperCase()} · ${name}`)}</text></g>`;
  }).join('')}</g>`;
}
