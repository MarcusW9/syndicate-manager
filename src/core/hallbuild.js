// Building up a hall (DESIGN.md 2026-11-06; drafts/PROPOSAL-hall-building.md): pieces placed on a
// 12 × 8 grid over the hall's own map. What's built is on the hall (hall.build, save v42); the cells
// that can take a piece are worked out from the map, never stored. A raid is fought on the map with
// the pieces on it, so they're cover like any other (core/fightspots.js). Pure logic.

import { HALL_BUILD, PIECES, ROOM_EFFECT } from '../data/hallBuild.js';
import { HALLS, HALL, pickSite } from '../data/sites.js';
import { siteRects } from './fightspots.js';
import { hallIn, residents, bedsOf, syncHalls } from './halls.js';
import { hallShut } from './raids.js';
import { money } from './money.js';

const C = HALL_BUILD.cell;
const aName = (p) => `${/^[aeiou]/i.test(p.name) ? 'an' : 'a'} ${p.name.toLowerCase()}`;
/** What a piece can't be placed on: the hall's own things, its stairs and doors. */
const TAKEN = new Set(['sp-cover', 'sp-desk', 'sp-stall', 'sp-planter', 'sp-cot', 'sp-stable', 'sp-water', 'sp-jetty', 'sp-block', 'sp-step', 'sp-door', 'sp-room', 'sp-window']);
/** What stands in a compound's parts: things to fight behind, so nothing is built on them. */
const COVERING = new Set(['sp-cover', 'sp-desk', 'sp-stall', 'sp-planter', 'sp-cot', 'sp-stable']);
/** Where a hall's floor is: inside its building, or on the pier's deck. */
const FLOOR = new Set(['sp-building', 'sp-pier']);

const overlap = (a, b) => Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
const boxDist = (p, r) => Math.hypot(Math.max(r.x - p[0], 0, p[0] - r.x - r.w), Math.max(r.y - p[1], 0, p[1] - r.y - r.h));

/** A district's hall map, without anything built. */
export const hallMap = (district) => HALLS[district] ?? HALL;

/**
 * A compound's parts the hall holds at its level (data/sites.js `parts`, Old Town from 2026-11-07):
 * each part from its level. [] for a hall map without parts.
 */
export const heldParts = (site, level = 1) => (site.parts ?? []).filter((p) => p.lvl <= level);
/** The part the hall can take next with Expand, or null (none left, or no parts). */
export const nextPart = (site, level = 1) => (site.parts ?? []).find((p) => p.lvl === level + 1) ?? null;
/** A part's cells, as "x,y". */
export const partCells = (part) => { const [x0, y0, x1, y1] = part.grid; const out = []; for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) out.push(`${x},${y}`); return out; };
/** The part a cell is in, or null. */
export const partAt = (site, x, y) => (site.parts ?? []).find((p) => x >= p.grid[0] && x <= p.grid[2] && y >= p.grid[1] && y <= p.grid[3]) ?? null;
/** The ways a raid can come in at this level: [{ id, ... }]; one, the map's own, without `ways`. */
export const waysIn = (site, level = 1) => (site.ways ? Object.entries(site.ways).filter(([, w]) => w.lvl <= level).map(([id, w]) => ({ id, ...w })) : [{ id: null, ...site }]);

/**
 * The cells a piece can go on, as "x,y" (cells): mostly on the hall's floor, clear of its own things,
 * and clear of the ways in and out and where each side starts, so a raid can always be fought. A
 * compound (`parts`) builds on the parts it holds at `level`; every way in is kept clear.
 */
export function buildableCells(site, level = 1) {
  const rects = siteRects(site);
  const ways = site.ways ? Object.values(site.ways) : [site];
  const keep = ways.flatMap((w) => [w.posts.inside, w.paths.out.at(-1), w.paths.inside.at(-1), w.paths.inside[0]]);
  const near = (r) => keep.some((p) => boxDist(p, r) < HALL_BUILD.keepClear);
  const out = new Set();
  if (site.parts) {
    const things = rects.filter((r) => COVERING.has(r.cls));
    for (const part of heldParts(site, level)) {
      for (const k of partCells(part)) {
        const [x, y] = k.split(',').map(Number);
        const r = { x: x * C, y: y * C, w: C, h: C };
        if (!things.some((t) => overlap(r, t) > 4) && !near(r)) out.add(k);
      }
    }
    return out;
  }
  const floor = rects.filter((r) => FLOOR.has(r.cls));
  const taken = rects.filter((r) => TAKEN.has(r.cls));
  // A hall map with a floor (data/sites.js `grid`, 2026-11-07) builds on that rectangle only.
  const [gx0, gy0, gx1, gy1] = site.grid ?? [0, 0, HALL_BUILD.cols - 1, HALL_BUILD.rows - 1];
  for (let y = gy0; y <= gy1; y++) {
    for (let x = gx0; x <= gx1; x++) {
      const r = { x: x * C, y: y * C, w: C, h: C };
      if (floor.reduce((n, f) => n + overlap(r, f), 0) < 0.7 * C * C) continue;
      if (taken.some((t) => overlap(r, t) > 4)) continue;
      if (near(r)) continue;
      out.add(`${x},${y}`);
    }
  }
  return out;
}

/** The cells a piece takes at (x, y), turned or not. */
export function pieceCells(pieceId, x, y, rot = 0) {
  const p = PIECES[pieceId];
  if (!p) return [];
  const [w, h] = rot && p.turns ? [p.size[1], p.size[0]] : p.size;
  const cells = [];
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) cells.push(`${x + i},${y + j}`);
  return cells;
}

/** How many cells a hall can build on: its floor, by level. */
export const floorOf = (hall) => {
  const site = hallMap(hall?.district);
  // A compound has no allowance (2026-11-07): the floor of every part it holds is all ours.
  if (site.parts) return buildableCells(site, hall?.level ?? 1).size - bedsOnFloor(hall, site).length;
  return HALL_BUILD.floorBase + HALL_BUILD.floorPerLevel * ((hall?.level ?? 1) - 1);
};
/** How many cells are built on. */
export const floorUsed = (hall) => (hall?.build ?? []).reduce((n, b) => n + pieceCells(b.piece, b.x, b.y, b.rot).length, 0);
/** The cells built on, as a Set of "x,y". */
export const builtCells = (hall) => new Set((hall?.build ?? []).flatMap((b) => pieceCells(b.piece, b.x, b.y, b.rot)));
/** The piece on a cell, or null. */
export const pieceAt = (hall, x, y) => (hall?.build ?? []).find((b) => pieceCells(b.piece, b.x, b.y, b.rot).includes(`${x},${y}`)) ?? null;
/**
 * The hall's beds as blocks on its floor (owner, 2026-11-07: "blocks already there which represent
 * the beds"): one cell a bed, as many as the hall's own beds (a bunk room's are inside it), laid from
 * the map's `bedCorner` row by row, skipping what's built. Worked out, never stored: Expand adds two
 * more on the next free cells. [{ id, piece: 'bed', x, y, rot }]
 */
export function bedsOnFloor(hall, site = hallMap(hall?.district)) {
  const built = builtCells(hall);
  const level = hall?.level ?? 1;
  const free = buildableCells(site, level);
  const byCorner = ([cx, cy]) => (a, b) => Math.abs(a[1] - cy) - Math.abs(b[1] - cy) || Math.abs(a[0] - cx) - Math.abs(b[0] - cx);
  const open = (cells, corner) => cells.filter((k) => free.has(k) && !built.has(k)).map((k) => k.split(',').map(Number)).sort(byCorner(corner));
  let cells;
  if (site.parts) {
    // A compound puts each inside part's own share of the beds in it (`beds`), from its corner; any
    // beds past those shares (an old save expanded further) go where there's room.
    const inside = heldParts(site, level).filter((p) => p.inside && p.bedCorner);
    const shares = inside.map((p) => open(partCells(p), p.bedCorner));
    cells = [...shares.flatMap((c, i) => c.slice(0, inside[i].beds ?? 0)), ...shares.flatMap((c, i) => c.slice(inside[i].beds ?? 0))];
  } else cells = open([...free], site.bedCorner ?? [0, 0]);
  return cells
    .slice(0, hall?.beds ?? 0)
    .map(([x, y], i) => ({ id: `bed-${i + 1}`, piece: 'bed', x, y, rot: 0 }));
}
/** The cells beds stand on, as a Set of "x,y". */
export const bedCells = (hall) => new Set(bedsOnFloor(hall).map((b) => `${b.x},${b.y}`));
/** The bed on a cell, or null. */
export const bedAt = (hall, x, y) => bedsOnFloor(hall).find((b) => b.x === x && b.y === y) ?? null;
/** Everything on a hall's floor: its beds and what's built. The map a raid there is fought on. */
export const floorPieces = (hall, way = null) => [
  ...heldParts(hallMap(hall?.district), hall?.level ?? 1).filter((p) => p.shapes).map((p) => ({ piece: 'part', id: p.id })),
  ...(way ? [{ piece: 'way', id: way }] : []),
  ...bedsOnFloor(hall), ...(hall?.build ?? []),
];

/** What removing a piece gives back. */
export const refundOf = (pieceId) => Math.round((PIECES[pieceId]?.cost ?? 0) * HALL_BUILD.refund);

/** The hall's map with what's built on it: the map its raids are fought on. */
export const hallSiteFor = (state, district) => pickSite(district, '', `raid:${district}`, floorPieces(hallIn(state, district)));

/** Can this piece go here? { ok, reason }. */
export function canPlace(state, district, pieceId, x, y, rot = 0) {
  const hall = hallIn(state, district);
  const p = PIECES[pieceId];
  if (!hall || !p) return { ok: false, reason: 'No such hall or piece' };
  if (hallShut(state, district)) return { ok: false, reason: 'The hall is shut after a raid' };
  if (p.needs && hall.level < p.needs) return { ok: false, reason: `Needs a level ${p.needs} hall` };
  if (p.one && (hall.build ?? []).some((b) => b.piece === pieceId)) return { ok: false, reason: `This hall already has ${aName(p)}` };
  if (p.tongOne && (state.halls ?? []).some((h) => (h.build ?? []).some((b) => b.piece === pieceId))) return { ok: false, reason: `The tong already has ${aName(p)}` };
  const cells = pieceCells(pieceId, x, y, rot);
  const free = buildableCells(hallMap(district), hall.level);
  const built = builtCells(hall);
  if (cells.some((c) => !free.has(c))) return { ok: false, reason: "Can't build there" };
  if (cells.some((c) => built.has(c))) return { ok: false, reason: 'Something is already there' };
  const beds = bedCells(hall);
  if (cells.some((c) => beds.has(c))) return { ok: false, reason: 'A bed is there: beds come with the hall' };
  if (floorUsed(hall) + cells.length > floorOf(hall)) return { ok: false, reason: `No floor left (${floorUsed(hall)}/${floorOf(hall)}): expand the hall for more` };
  if (state.cash < p.cost) return { ok: false, reason: `Needs ${money(p.cost)}` };
  return { ok: true, reason: 'ready' };
}

/** Place a piece: pay for it and put it on the hall. Returns the new state, or prev. */
export function placePiece(prev, district, pieceId, x, y, rot = 0) {
  if (!canPlace(prev, district, pieceId, x, y, rot).ok) return prev;
  const state = structuredClone(prev);
  const hall = hallIn(state, district);
  hall.build = hall.build ?? [];
  const n = hall.build.reduce((m, b) => Math.max(m, Number(String(b.id).split('-').at(-1)) || 0), 0) + 1;
  hall.build.push({ id: `${district}-${n}`, piece: pieceId, x, y, rot: PIECES[pieceId].turns ? (rot ? 1 : 0) : 0, day: state.day });
  state.cash -= PIECES[pieceId].cost;
  syncHalls(state); // a bunk room's beds count in the roster limit
  return state;
}

/** Can a placed piece be removed? A bunk room can't while its beds are slept in. { ok, reason }. */
export function canRemove(state, district, id) {
  const hall = hallIn(state, district);
  const b = hall?.build?.find((x) => x.id === id);
  if (!b) return { ok: false, reason: 'Nothing there' };
  if (b.piece === 'bunks' && residents(state, district).length > bedsOf(hall) - ROOM_EFFECT.bunkBeds) return { ok: false, reason: 'Its beds are slept in: move someone out first' };
  return { ok: true, reason: 'ready' };
}

/** Remove a piece: half its cost back. Returns the new state, or prev. */
export function removePiece(prev, district, id) {
  const hall = hallIn(prev, district);
  const b = hall?.build?.find((x) => x.id === id);
  if (!b || !canRemove(prev, district, id).ok) return prev;
  const state = structuredClone(prev);
  const h = hallIn(state, district);
  h.build = h.build.filter((x) => x.id !== id);
  state.cash += refundOf(b.piece);
  syncHalls(state);
  return state;
}

/** Can a placed piece be turned where it stands? */
export function canTurn(state, district, id) {
  const hall = hallIn(state, district);
  const b = hall?.build?.find((x) => x.id === id);
  if (!b || !PIECES[b.piece]?.turns) return false;
  const cells = pieceCells(b.piece, b.x, b.y, b.rot ? 0 : 1);
  const free = buildableCells(hallMap(district), hall.level);
  const others = builtCells({ build: hall.build.filter((x) => x.id !== id) });
  const beds = bedCells(hall);
  return cells.every((c) => free.has(c) && !others.has(c) && !beds.has(c));
}

/** Turn a placed piece 90°. Returns the new state, or prev. */
export function turnPiece(prev, district, id) {
  if (!canTurn(prev, district, id)) return prev;
  const state = structuredClone(prev);
  const b = hallIn(state, district).build.find((x) => x.id === id);
  b.rot = b.rot ? 0 : 1;
  return state;
}
