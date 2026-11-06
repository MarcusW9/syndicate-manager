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
/** What a piece can't be placed on: the hall's own things, its stairs and doors. */
const TAKEN = new Set(['sp-cover', 'sp-desk', 'sp-stall', 'sp-planter', 'sp-cot', 'sp-stable', 'sp-water', 'sp-jetty', 'sp-block', 'sp-step', 'sp-door', 'sp-room', 'sp-window']);
/** Where a hall's floor is: inside its building, or on the pier's deck. */
const FLOOR = new Set(['sp-building', 'sp-pier']);

const overlap = (a, b) => Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
const boxDist = (p, r) => Math.hypot(Math.max(r.x - p[0], 0, p[0] - r.x - r.w), Math.max(r.y - p[1], 0, p[1] - r.y - r.h));

/** A district's hall map, without anything built. */
export const hallMap = (district) => HALLS[district] ?? HALL;

/**
 * The cells a piece can go on, as "x,y" (cells): mostly on the hall's floor, clear of its own things,
 * and clear of the ways in and out and where each side starts, so a raid can always be fought.
 */
export function buildableCells(site) {
  const rects = siteRects(site);
  const floor = rects.filter((r) => FLOOR.has(r.cls));
  const taken = rects.filter((r) => TAKEN.has(r.cls));
  const keep = [site.posts.inside, site.paths.out.at(-1), site.paths.inside.at(-1), site.paths.inside[0]];
  const out = new Set();
  for (let y = 0; y < HALL_BUILD.rows; y++) {
    for (let x = 0; x < HALL_BUILD.cols; x++) {
      const r = { x: x * C, y: y * C, w: C, h: C };
      if (floor.reduce((n, f) => n + overlap(r, f), 0) < 0.7 * C * C) continue;
      if (taken.some((t) => overlap(r, t) > 4)) continue;
      if (keep.some((p) => boxDist(p, r) < HALL_BUILD.keepClear)) continue;
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
export const floorOf = (hall) => HALL_BUILD.floorBase + HALL_BUILD.floorPerLevel * ((hall?.level ?? 1) - 1);
/** How many cells are built on. */
export const floorUsed = (hall) => (hall?.build ?? []).reduce((n, b) => n + pieceCells(b.piece, b.x, b.y, b.rot).length, 0);
/** The cells built on, as a Set of "x,y". */
export const builtCells = (hall) => new Set((hall?.build ?? []).flatMap((b) => pieceCells(b.piece, b.x, b.y, b.rot)));
/** The piece on a cell, or null. */
export const pieceAt = (hall, x, y) => (hall?.build ?? []).find((b) => pieceCells(b.piece, b.x, b.y, b.rot).includes(`${x},${y}`)) ?? null;
/** What removing a piece gives back. */
export const refundOf = (pieceId) => Math.round((PIECES[pieceId]?.cost ?? 0) * HALL_BUILD.refund);

/** The hall's map with what's built on it: the map its raids are fought on. */
export const hallSiteFor = (state, district) => pickSite(district, '', `raid:${district}`, hallIn(state, district)?.build ?? []);

/** Can this piece go here? { ok, reason }. */
export function canPlace(state, district, pieceId, x, y, rot = 0) {
  const hall = hallIn(state, district);
  const p = PIECES[pieceId];
  if (!hall || !p) return { ok: false, reason: 'No such hall or piece' };
  if (hallShut(state, district)) return { ok: false, reason: 'The hall is shut after a raid' };
  if (p.needs && hall.level < p.needs) return { ok: false, reason: `Needs a level ${p.needs} hall` };
  if (p.one && (hall.build ?? []).some((b) => b.piece === pieceId)) return { ok: false, reason: `This hall already has a ${p.name.toLowerCase()}` };
  const cells = pieceCells(pieceId, x, y, rot);
  const free = buildableCells(hallMap(district));
  const built = builtCells(hall);
  if (cells.some((c) => !free.has(c))) return { ok: false, reason: "Can't build there" };
  if (cells.some((c) => built.has(c))) return { ok: false, reason: 'Something is already there' };
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
  const free = buildableCells(hallMap(district));
  const others = builtCells({ build: hall.build.filter((x) => x.id !== id) });
  return cells.every((c) => free.has(c) && !others.has(c));
}

/** Turn a placed piece 90°. Returns the new state, or prev. */
export function turnPiece(prev, district, id) {
  if (!canTurn(prev, district, id)) return prev;
  const state = structuredClone(prev);
  const b = hallIn(state, district).build.find((x) => x.id === id);
  b.rot = b.rot ? 0 : 1;
  return state;
}
