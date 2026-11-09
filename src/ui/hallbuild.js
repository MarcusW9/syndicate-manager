// The hall build screen (DESIGN.md 2026-11-06; mock-up drafts/prototypes/hall-build.png): the hall's
// own map with a grid over its floor, what's built on it, the cell or piece picked, and a palette of
// pieces. Tap a free cell, pick a piece, Place; tap a placed piece to turn or remove it. Markup only:
// app.js owns the clicks (data-action) and core/hallbuild.js the rules.
//
// The hall's beds are blocks on the floor (2026-11-07): tap one to see who sleeps in it.
//
// ui: helpers from app.js { esc, money, cityName }. view: { district, cell: [x, y] | null, piece, rot, picked }
// (picked: a built piece's id, or a bed's, 'bed-1' ...).

import { BED, HALL_BUILD, PIECES } from '../data/hallBuild.js';
import { bedsOnFloor, buildableCells, builtCells, heldParts, nextPart, partCells, partAt, canPlace, canRemove, canTurn, floorOf, floorUsed, hallMap, hallSiteFor, pieceAt, pieceCells, refundOf } from '../core/hallbuild.js';
import { hallIn, residents } from '../core/halls.js';
import { sitePlanSvg } from './siteplan.js';
import { defencesIn, defenceCut, raidOn, raidWho } from '../core/raids.js';
import { hasHallArt, hallArtSvg, waysOverlay, insideBox, SPRITE_SHEET } from './hallart.js';
import { pickSite } from '../data/sites.js';

const C = HALL_BUILD.cell;

/** A small drawing of each piece for the palette (26 × 26). */
export const PIECE_ICON = {
  barricade: '<rect x="5" y="9" width="8" height="8" fill="#6b5a2a"/><rect x="13" y="11" width="8" height="6" fill="#8a7440"/>',
  plate: '<rect x="3" y="11" width="20" height="4" fill="#8b9aab"/><rect x="6" y="15" width="2" height="5" fill="#5d6b7a"/><rect x="18" y="15" width="2" height="5" fill="#5d6b7a"/>',
  wall: '<rect x="3" y="11" width="20" height="4" fill="#3a4150"/><rect x="3" y="11" width="20" height="1" fill="#5a6474"/>',
  turret: '<rect x="11" y="13" width="4" height="9" fill="#5d6b7a"/><circle cx="13" cy="12" r="4" fill="#8b9aab"/><rect x="15" y="10" width="8" height="2" fill="#ff3d5f"/>',
  workboard: '<rect x="4" y="4" width="18" height="18" fill="#1f2633" stroke="#5a6474"/><rect x="6" y="7" width="14" height="8" fill="#6b5a2a"/><rect x="8" y="9" width="4" height="3" fill="#e8e2d0"/><rect x="14" y="8" width="4" height="4" fill="#e8e2d0"/><rect x="7" y="17" width="12" height="3" fill="#4a5566"/>',
  clinic: '<rect x="4" y="4" width="18" height="18" fill="#1f2633" stroke="#5a6474"/><rect x="11.5" y="7" width="3" height="12" fill="#3de8d8"/><rect x="7" y="11.5" width="12" height="3" fill="#3de8d8"/>',
  bunks: '<rect x="4" y="4" width="18" height="18" fill="#1f2633" stroke="#5a6474"/><rect x="7" y="8" width="12" height="3" fill="#8b9aab"/><rect x="7" y="15" width="12" height="3" fill="#8b9aab"/>',
  canteen: '<rect x="4" y="4" width="18" height="18" fill="#1f2633" stroke="#5a6474"/><path d="M7 12h12a6 6 0 0 1-12 0z" fill="#f2d541"/><rect x="12" y="6" width="1.5" height="4" fill="#8b9aab"/>',
  stash: '<rect x="4" y="4" width="18" height="18" fill="#1f2633" stroke="#5a6474"/><rect x="8" y="8" width="10" height="10" fill="#5d6b7a"/><circle cx="13" cy="13" r="2" fill="#f2d541"/>',
  den: '<rect x="4" y="4" width="18" height="18" fill="#1f2633" stroke="#5a6474"/><rect x="7" y="8" width="6" height="9" fill="#e8e2d0"/><rect x="13" y="10" width="6" height="9" fill="#e8e2d0"/><circle cx="10" cy="12" r="1.2" fill="#ff3d5f"/><circle cx="16" cy="14" r="1.2" fill="#3de8d8"/>',
  cyberdoc: '<rect x="4" y="4" width="18" height="18" fill="#1f2633" stroke="#5a6474"/><rect x="8" y="8" width="10" height="10" fill="none" stroke="#b48cff" stroke-width="1.5"/><path d="M13 5v3M13 18v3M5 13h3M18 13h3" stroke="#b48cff" stroke-width="1.5"/>',
  lookout: '<rect x="4" y="4" width="18" height="18" fill="#1f2633" stroke="#5a6474"/><path d="M6 13q7-7 14 0q-7 7-14 0z" fill="none" stroke="#3de8d8" stroke-width="1.5"/><circle cx="13" cy="13" r="2" fill="#3de8d8"/>',
};
const icon = (id) => `<svg class="btile__icon" viewBox="0 0 26 26" width="32" height="32" aria-hidden="true">${PIECE_ICON[id] ?? ''}</svg>`;

/** The pieces' shapes as a faint ghost where the picked piece would go. */
function ghost(view) {
  if (!view.cell || !view.piece) return '';
  const [x, y] = view.cell;
  const p = PIECES[view.piece];
  const rot = p.turns ? view.rot : 0;
  // A room shows the squares it takes; a defence piece, its own shape.
  if (p.kind === 'room') return pieceCells(view.piece, x, y, rot).map((k) => { const [i, j] = k.split(',').map(Number); return `<rect x="${i * C + 1}" y="${j * C + 1}" width="${C - 2}" height="${C - 2}" class="bgrid__ghost is-room"/>`; }).join('');
  return p.shapes(x * C, y * C, rot).filter((s) => s.t === 'rect').map((s) => `<rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" class="bgrid__ghost"/>`).join('');
}

/**
 * A compound's parts over its plan (2026-11-07): the name of each part; a part not held yet hatched,
 * with EXPAND › on the next one and its level on the rest; and, on the build screen, the squares in a
 * held part kept clear for a way in, faintly marked so the gap is explained. tap: they can be tapped.
 */
export function partsOverlay(site, level, { tap = false, free = null, esc = (x) => x, art = false, buildings = true } = {}) {
  if (!site.parts) return '';
  const nx = nextPart(site, level);
  const held = new Set(heldParts(site, level).map((p) => p.id));
  const hatch = '<defs><pattern id="bhatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="rgba(11,13,17,.72)"/><path d="M0 0v6" stroke="#2a303b" stroke-width="1.6"/></pattern></defs>';
  const act = (id) => (tap ? ` data-action="build-part" data-id="${esc(id)}" role="button" tabindex="0"` : '');
  const rect = (p) => { const [x0, y0, x1, y1] = p.grid; return { x: x0 * C, y: y0 * C, w: (x1 - x0 + 1) * C, h: (y1 - y0 + 1) * C }; };
  // Names are drawn last, on a dark halo, so nothing (the hatching, a neighbour's, a route) is over one.
  // A held part's name sits inside it at the bottom left, a narrow one (the lane) up its length; a part
  // not held yet carries its name over its own hatching, above EXPAND › or its level.
  const names = [];
  const areas = site.parts.map((p) => {
    const { x, y, w, h } = rect(p);
    const label = esc(p.name.replace(/^The /, '').toUpperCase());
    if (held.has(p.id)) {
      if (!buildings && p.inside) return '';
      names.push(x1Narrow(p)
        ? `<text class="bpart__name" x="${x + w / 2}" y="${y + h / 2}" text-anchor="middle" transform="rotate(-90 ${x + w / 2} ${y + h / 2})">${label}</text>`
        : `<text class="bpart__name" x="${x + 7}" y="${y + h - 7}">${label}</text>`);
      return '';
    }
    const isNext = nx?.id === p.id;
    names.push(`<text class="bpart__name is-locked" x="${x + w / 2}" y="${y + h / 2 - 6}" text-anchor="middle">${label}</text>`);
    return `<g class="bpart ${isNext ? 'is-next' : ''}"${act(p.id)} aria-label="${esc(`${p.name}, ${isNext ? 'take it with Expand' : `level ${p.lvl}`}`)}"><rect x="${x + 1}" y="${y + 1}" width="${w - 2}" height="${h - 2}" fill="${art ? 'rgba(0,0,0,0)' : 'url(#bhatch)'}" class="bpart__area"/>
      <text class="bpart__tag" x="${x + w / 2}" y="${y + h / 2 + 9}" text-anchor="middle">${isNext ? 'EXPAND ›' : `LEVEL ${p.lvl}`}</text></g>`;
  }).join('');
  const kept = free ? heldParts(site, level).flatMap(partCells).filter((k) => !free.has(k)).map((k) => {
    const [cx, cy] = k.split(',').map(Number);
    const r = { x: cx * C, y: cy * C };
    return `<rect class="bkeep" x="${r.x + 3}" y="${r.y + 3}" width="${C - 6}" height="${C - 6}"${tap ? ` data-action="build-keep" data-id="${cx},${cy}" role="button" tabindex="0" aria-label="Kept clear: a way in"` : ''}/>`;
  }).join('') : '';
  return `${hatch}${kept}${areas}${names.join('')}`;
}
const x1Narrow = (p) => p.grid[2] - p.grid[0] < 2;

/**
 * The plan under the grid. `inside`: a building's part id, its inside, cropped to it. `compound`: the
 * compound from above (the buildings' roofs, what stands outside), with nothing inside drawn. With
 * neither, the whole plan with everything on it (the old Build screen). The art picture when the
 * setting is on (Old Town), else the plain plan without its route.
 */
export function planSvg(state, district, art = false, { inside = null, compound = false } = {}) {
  if (art && hasHallArt(district)) return hallArtSvg(state, district, { inside });
  const site = hallMap(district);
  const hall = hallIn(state, district);
  let svg;
  if (compound && site.parts) {
    // Seen from above only the parts (their walls) and the defences stand in the open: no beds, no rooms.
    const pieces = [...heldParts(site, hall?.level ?? 1).filter((p) => p.shapes).map((p) => ({ piece: 'part', id: p.id })), ...(hall?.build ?? []).filter((b) => PIECES[b.piece]?.kind === 'defence')];
    svg = sitePlanSvg({ site: pickSite(district, '', `raid:${district}`, pieces), clean: true });
  } else svg = sitePlanSvg({ site: hallSiteFor(state, district), clean: true });
  return inside ? svg.replace(/viewBox="[^"]*"/, `viewBox="${insideBox(site, inside)}"`) : svg;
}

/**
 * The compound's buildings, from the hall's parts it holds (data/sites.js `parts`, `inside`): who sleeps
 * in each (the residents whose bed is in it, as `bedsOnFloor` lays them) and the rooms built in it.
 * [{ id, name, about, who: [operative], beds, rooms: [piece name] }]
 */
export function buildingsOf(state, district) {
  const site = hallMap(district);
  const hall = hallIn(state, district);
  if (!site.parts || !hall) return [];
  const beds = bedsOnFloor(hall);
  const who = residents(state, district);
  const inPart = (p, b) => partAt(site, b.x, b.y)?.id === p.id;
  return heldParts(site, hall.level ?? 1).filter((p) => p.inside).map((p) => ({
    id: p.id, name: p.name, about: p.about,
    who: who.filter((_, i) => beds[i] && inPart(p, beds[i])),
    beds: beds.filter((b) => inPart(p, b)).length,
    rooms: (hall.build ?? []).filter((b) => PIECES[b.piece]?.kind === 'room' && inPart(p, b)).map((b) => PIECES[b.piece].name),
  }));
}

/**
 * On the compound: each held building a tap target (opens its inside) with its name and a short count,
 * and every other part (locked ones with EXPAND ›, the lane and the yard by name) as `partsOverlay` has it.
 */
export function compoundOverlay(state, district, { tap = false, free = null, esc = (x) => x, art = false } = {}) {
  const site = hallMap(district);
  const hall = hallIn(state, district);
  const info = buildingsOf(state, district);
  const rect = (p) => { const [x0, y0, x1, y1] = p.grid; return { x: x0 * C, y: y0 * C, w: (x1 - x0 + 1) * C, h: (y1 - y0 + 1) * C }; };
  const roofs = info.map((b) => {
    const { x, y, w, h } = rect(site.parts.find((p) => p.id === b.id));
    const said = `${b.name}: ${b.who.length ? `${b.who.length} sleeping` : 'nobody sleeping'}, ${b.rooms.length ? b.rooms.join(', ') : 'no rooms yet'}. Open it.`;
    return `<g class="bbld" data-action="hall-building" data-id="${esc(b.id)}" role="button" tabindex="0" aria-label="${esc(said)}"><rect class="bbld__hit" x="${x}" y="${y}" width="${w}" height="${h}"/>
      <text class="bpart__name" x="${x + 7}" y="${y + h - 14}">${esc(b.name.replace(/^The /, '').toUpperCase())}</text>
      <text class="bbld__badge" x="${x + 7}" y="${y + h - 5}">${b.who.length} IN · ${b.rooms.length} ${b.rooms.length === 1 ? 'ROOM' : 'ROOMS'} ›</text></g>`;
  }).join('');
  return `${partsOverlay(site, hall.level, { tap, free: null, esc, art, buildings: false })}${roofs}`;
}

/** A pending raid's ways in over the plan, in red, labelled with who comes; '' when none is pending. */
export function raidWaysFor(state, district) {
  const r = raidOn(state, district);
  if (!r || r.answer === 'paid' || r.done) return '';
  return waysOverlay(hallMap(district), hallIn(state, district)?.level ?? 1, raidWho(r));
}

/** A small key for the markers on the plan: nothing on the map is unexplained. */
export function planKey(state, district, { building = false, compound = false, inside = false } = {}) {
  const raid = !inside && !!raidWaysFor(state, district);
  const item = (cls, text) => `<li><i class="bkey__i ${cls}" aria-hidden="true"></i>${text}</li>`;
  return `<ul class="bkey" aria-label="Key to the plan">${raid ? item('is-raid', 'Raiders\' way in') : ''}${item('is-door', 'Door')}${compound ? item('is-roof', 'Building: tap to go in') : ''}${compound ? '' : item('is-bed', 'Bed')}${building && !inside ? item('is-keep', 'Kept clear: a way in') : ''}${inside ? '' : item('is-lock', 'Locked: Expand')}</ul>`;
}

/** The grid over the plan: free cells to tap, built cells to pick, the picked one outlined. */
export function buildGrid(state, view, esc, art = false) {
  const hall = hallIn(state, view.district);
  const site = hallMap(view.district);
  const free = buildableCells(site, hall.level);
  const built = builtCells(hall);
  const beds = bedsOnFloor(hall);
  const who = residents(state, view.district);
  const bedAt = (x, y) => beds.findIndex((b) => b.x === x && b.y === y);
  const sel = view.picked ? [...beds, ...(hall.build ?? [])].find((b) => b.id === view.picked) : null;
  // Scoped (2026-11-09): the compound's outside squares (defences) or one building's squares (rooms).
  const scope = view.scope ?? null;
  const inside = scope && scope !== 'compound' ? scope : null;
  const inScope = (k) => { if (!scope) return true; const pt = partAt(site, ...k.split(',').map(Number)); return inside ? pt?.id === inside : !pt?.inside; };
  const cells = [...free].filter(inScope).map((k) => {
    const [x, y] = k.split(',').map(Number);
    const taken = built.has(k);
    const bed = bedAt(x, y);
    const on = view.cell && view.cell[0] === x && view.cell[1] === y;
    const label = bed >= 0 ? `Bed, ${who[bed] ? `${who[bed].handle} sleeps here` : 'free'}` : taken ? `${PIECES[pieceAt(hall, x, y).piece].name}, row ${y + 1}, column ${x + 1}` : `Free square, row ${y + 1}, column ${x + 1}`;
    return `<rect x="${x * C + 1.5}" y="${y * C + 1.5}" width="${C - 3}" height="${C - 3}" class="bgrid__cell ${taken ? 'is-built' : ''} ${bed >= 0 ? `is-bed ${who[bed] ? 'is-slept' : ''}` : ''} ${on ? 'is-on' : ''}" data-action="build-cell" data-id="${x},${y}" role="button" tabindex="0" aria-label="${esc(label)}"/>`;
  }).join('');
  const outline = sel ? (() => {
    const p = PIECES[sel.piece] ?? { size: [1, 1] };
    const [w, h] = sel.rot && p.turns ? [p.size[1], p.size[0]] : p.size;
    return `<rect x="${sel.x * C + 0.5}" y="${sel.y * C + 0.5}" width="${w * C - 1}" height="${h * C - 1}" class="bgrid__sel"/>`;
  })() : view.cell ? `<rect x="${view.cell[0] * C + 0.5}" y="${view.cell[1] * C + 0.5}" width="${C - 1}" height="${C - 1}" class="bgrid__sel"/>` : '';
  const under = inside ? '' : scope === 'compound' ? `${compoundOverlay(state, view.district, { tap: true, free, esc, art })}${raidWaysFor(state, view.district)}` : `${partsOverlay(site, hall.level, { tap: true, free, esc, art })}${raidWaysFor(state, view.district)}`;
  return `<svg class="bgrid" viewBox="${inside ? insideBox(site, inside) : '0 0 360 240'}">${under}${cells}${ghost(view)}${outline}</svg>`;
}

/** The sheet under the plan: what's picked and what you can do with it. */
export function buildSheet(state, view, ui) {
  const { esc, money } = ui;
  const hall = hallIn(state, view.district);
  const site = hallMap(view.district);
  if (view.part) {
    const p = site.parts?.find((x) => x.id === view.part);
    const isNext = nextPart(site, hall.level)?.id === p?.id;
    if (p) return `<div class="bsheet"><p class="bsheet__head"><strong>${esc(p.name)}</strong> <span class="muted small">level ${p.lvl} · ${partCells(p).length} squares · ${p.inside ? 'inside' : 'outside'}</span></p>
      <p class="small">${esc(p.about)}</p>
      ${isNext ? `<div class="bsheet__btns"><button class="btn btn--primary" data-action="expand-hall" data-id="${esc(view.district)}" ${state.cash >= p.cost ? '' : 'disabled'}>Expand: take it · ${money(p.cost)}</button></div>` : `<p class="small muted">Take ${esc(nextPart(site, hall.level)?.name.toLowerCase() ?? 'the part before it')} first.</p>`}</div>`;
  }
  if (view.keep) return '<div class="bsheet"><p class="bsheet__head"><strong>Kept clear</strong></p><p class="small">A way in or out, or where one side stands when a raid starts. Nothing is built here, so a raid can always be fought.</p></div>';
  const beds = bedsOnFloor(hall);
  const bed = beds.findIndex((b) => b.id === view.picked);
  if (bed >= 0) {
    const op = residents(state, view.district)[bed];
    return `<div class="bsheet"><p class="bsheet__head"><strong>${esc(BED.name)}</strong> <span class="muted small">${bed + 1} of ${beds.length}</span></p>
      <p class="small">${op ? `<strong>${esc(op.handle)}</strong> sleeps here.` : 'Nobody sleeps here yet.'} ${esc(BED.about)}</p></div>`;
  }
  const sel = view.picked ? (hall.build ?? []).find((b) => b.id === view.picked) : null;
  if (sel) {
    const p = PIECES[sel.piece];
    const rm = canRemove(state, view.district, sel.id);
    return `<div class="bsheet"><p class="bsheet__head"><strong>${esc(p.name)}</strong> <span class="muted small">built day ${sel.day}</span></p>
      <p class="small">${esc(p.about)}</p>
      <div class="bsheet__btns">
        ${p.turns ? `<button class="btn" data-action="build-turn" data-id="${esc(sel.id)}" ${canTurn(state, view.district, sel.id) ? '' : 'disabled'}>Turn</button>` : ''}
        <button class="btn" data-action="build-remove" data-id="${esc(sel.id)}" ${rm.ok ? '' : 'disabled'}>Remove · ${money(refundOf(sel.piece))} back</button>
      </div>${rm.ok ? '' : `<p class="small bsheet__why">${esc(rm.reason)}.</p>`}</div>`;
  }
  if (!view.cell) return '<div class="bsheet"><p class="small muted">Tap a free square on the plan, then pick what goes there. Tap something built to turn or remove it, or a bed to see who sleeps there.</p></div>';
  if (!view.piece) return '<div class="bsheet"><p class="small muted">Pick what goes there, below.</p></div>';
  const p = PIECES[view.piece];
  const can = canPlace(state, view.district, view.piece, view.cell[0], view.cell[1], view.rot);
  return `<div class="bsheet"><p class="bsheet__head"><strong>${esc(p.name)}</strong> <span class="muted small">${p.size[0] === 1 && p.size[1] === 1 ? '1 square' : `${p.size[0]} × ${p.size[1]} squares`}${p.needs ? ` · level ${p.needs}` : ''}</span></p>
    <p class="small">${esc(p.about)}</p>
    ${can.ok ? '' : `<p class="small bsheet__why">${esc(can.reason)}.</p>`}
    <div class="bsheet__btns">
      ${p.turns ? '<button class="btn" data-action="build-rot">Turn</button>' : ''}
      <button class="btn btn--primary" data-action="build-place" ${can.ok ? '' : 'disabled'}>Place · ${money(p.cost)}</button>
    </div></div>`;
}

/** What the hall's defences do to a raid: "4 built · raid threat −1 · 2 more for −2". */
export function defenceLine(state, district) {
  const n = defencesIn(state, district);
  const cut = defenceCut(state, district);
  const next = HALL_BUILD.perThreat * (cut + 1) - n;
  return `${n} built · ${cut ? `<strong>raid threat −${cut}</strong>` : 'no change to a raid yet'} · ${next} more for −${cut + 1}`;
}

/** What the palette's sections hold: 'all' (the wide hall page's default), 'defence' or 'room'. */
const TABS = [['all', 'All'], ['defence', 'Defences'], ['room', 'Rooms']];

/**
 * The palette: the tabs, the words for the tab, and a tile per piece (name, size, price, what it does).
 * `all`: offer the "All" tab too (the wide hall page); the phone's build screen has Defences and Rooms.
 */
export function buildPalette(state, view, ui, { all = false } = {}) {
  const { esc, money } = ui;
  // Scoped: the compound builds defences, a building builds rooms, so there is no tab to choose.
  const scoped = !!view.scope;
  const tab = scoped ? (view.scope === 'compound' ? 'defence' : 'room') : all && (view.tab ?? 'all') === 'all' ? 'all' : view.tab === 'room' ? 'room' : 'defence';
  const tabs = all && !scoped ? TABS : TABS.filter(([k]) => k !== 'all');
  const tiles = Object.entries(PIECES).filter(([, p]) => tab === 'all' || p.kind === tab).map(([id, p]) => `
      <button class="btile ${view.piece === id ? 'is-on' : ''}" data-action="build-piece" data-id="${esc(id)}" aria-pressed="${view.piece === id}">
        ${icon(id)}<strong>${esc(p.name)}</strong><span class="btile__what"><span class="btile__price">${money(p.cost)}</span> · ${p.size[0]} × ${p.size[1]} · ${esc(p.what)}</span>
      </button>`).join('');
  return `
      ${scoped ? '' : `<div class="subtabs bsubs ${all ? 'bsubs--3' : ''}" role="group" aria-label="What to build">
        ${tabs.map(([k, name]) => `<button class="subtab ${tab === k ? 'is-on' : ''}" data-action="build-tab" data-id="${k}" aria-pressed="${tab === k}">${name}</button>`).join('')}
      </div>`}
      ${tab === 'room' ? '<p class="muted small">One of each per hall, inside. A room helps whoever lives here; it isn\'t cover in a raid.</p>'
    : tab === 'defence' ? `<p class="muted small">Cover where our people stand when they hold the hall. A raid is fought outside, between the buildings, so defences go in the outside parts. Every ${HALL_BUILD.perThreat} pieces make a raid one step easier.</p>
      <p class="small bdef">${defenceLine(state, view.district)}</p>`
      : '<p class="muted small">Defences go outside, rooms inside. Tap a free square on the plan, then a piece.</p>'}
      <div class="btiles">${tiles}</div>`;
}

/** The whole screen. */
export function renderHallBuild(ui, state, view) {
  const { esc, money, cityName } = ui;
  const hall = hallIn(state, view.district);
  if (!hall) return '';
  const used = floorUsed(hall);
  const floor = floorOf(hall);
  const art = !!ui.art && hasHallArt(view.district);
  return `
    <section class="hallbuild">
      ${art ? SPRITE_SHEET : ''}
      <div class="bhead"><button class="linkbtn" data-action="back">‹ ${esc(ui.backLabel ?? 'The hall')}</button><span class="bhead__level">${view.scope === 'compound' ? 'the compound' : `level ${hall.level}`}</span></div>
      <h1 class="btitle">Build · the ${esc(cityName(view.district).replace(/^The /, ''))} hall</h1>
      <div class="bbar" role="status"><span>Floor <b>${used}/${floor}</b></span><span class="bbar__beds">Beds <b>${residents(state, view.district).length}/${bedsOnFloor(hall).length}</b></span><span class="bbar__seg" aria-hidden="true">${Array.from({ length: floor }, (_, k) => `<i class="${k < used ? 'is-on' : ''}"></i>`).join('')}</span><span>${money(state.cash)}</span></div>
      <div class="bplan">${planSvg(state, view.district, art, { compound: view.scope === 'compound' })}${buildGrid(state, view, esc, art)}</div>
      ${planKey(state, view.district, { building: true, compound: view.scope === 'compound' })}
      ${buildSheet(state, view, ui)}
      ${buildPalette(state, view, ui)}
      <p class="muted small">Removing something gives back half its cost. ${hallMap(view.district).parts ? 'Expanding the hall takes the next part, and all its floor.' : `Expanding the hall gives ${HALL_BUILD.floorPerLevel} more squares.`}</p>
    </section>`;
}

/** A line for the hall's row on Crew › Halls: what's built and the floor. */
export function hallBuildLine(hall, cut = 0) {
  const n = {};
  for (const b of hall.build ?? []) n[b.piece] = (n[b.piece] ?? 0) + 1;
  const what = Object.entries(n).map(([id, k]) => `${k} ${PIECES[id].name.toLowerCase()}${k > 1 ? 's' : ''}`);
  return `${what.length ? `Built: ${what.join(', ')}` : 'Nothing built yet'} · floor ${floorUsed(hall)}/${floorOf(hall)}${cut ? ` · raid threat −${cut}` : ''}`;
}
