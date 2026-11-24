// Mockup: generated interiors and alleys for multi-map stops (2026-11-23). Not in the game yet.
// Each place is built from a seed into the same shape as a site in src/data/sites.js and drawn by the
// game's own sitePlanSvg, so what you see is what the game would draw.
//
//   node docs/mockups/2026-11-23-interiors.mjs $PWD/docs/mockups/2026-11-23-interiors
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync } from 'node:fs';
import { sitePlanSvg } from '../../src/ui/siteplan.js';
const { chromium } = createRequire(import.meta.url)('playwright');
const css = readFileSync(new URL('../../src/ui/styles.css', import.meta.url), 'utf8');

// ---- seeded randomness (the game would use core/rng.js hashRng) ----
const hashStr = (s) => { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0; return h; };
function rngOf(seed) {
  let a = hashStr(seed);
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const between = (r, lo, hi) => lo + r() * (hi - lo);
const pickOf = (r, list) => list[Math.floor(r() * list.length)];
const rnd = (n) => Math.round(n);

const TONES = ['#3a4254', '#4a3644', '#34483f', '#4d4430'];
const FLOORS = { lockup: '#1c1f24', parlour: '#22192a', kitchen: '#1a2328', store: '#1b1d22', flat: '#211d1a', back: '#2a1820' };
const ROAD = [{ t: 'rect', cls: 'sp-road', x: 0, y: 212, w: 360, h: 28 }, { t: 'line', cls: 'sp-road__line', x1: 0, y1: 226, x2: 360, y2: 226 }];
const B = { x: 14, y: 16, w: 332, h: 182 }; // the building's outer walls; pavement below, then the road

// ---- rooms: split the floor (binary space partition), a door in every split ----
function splitRooms(r, rect, depth, minW, minH, walls) {
  const canV = rect.w >= minW * 2 + 4, canH = rect.h >= minH * 2 + 4;
  if (depth <= 0 || (!canV && !canH)) return [rect];
  const vertical = canV && (!canH || rect.w / rect.h > between(r, 0.9, 1.5));
  if (vertical) {
    const x = rnd(rect.x + between(r, minW, rect.w - minW));
    const d = rnd(between(r, rect.y + 10, rect.y + rect.h - 10));
    walls.push({ x1: x, y1: rect.y, x2: x, y2: rect.y + rect.h, door: d, axis: 'v' });
    return [...splitRooms(r, { ...rect, w: x - rect.x }, depth - 1, minW, minH, walls), ...splitRooms(r, { ...rect, x, w: rect.x + rect.w - x }, depth - 1, minW, minH, walls)];
  }
  const y = rnd(rect.y + between(r, minH, rect.h - minH));
  const d = rnd(between(r, rect.x + 10, rect.x + rect.w - 10));
  walls.push({ x1: rect.x, y1: y, x2: rect.x + rect.w, y2: y, door: d, axis: 'h' });
  return [...splitRooms(r, { ...rect, h: y - rect.y }, depth - 1, minW, minH, walls), ...splitRooms(r, { ...rect, y, h: rect.y + rect.h - y }, depth - 1, minW, minH, walls)];
}
const inside = (p, q) => p[0] > q.x && p[0] < q.x + q.w && p[1] > q.y && p[1] < q.y + q.h;
const roomAt = (rooms, p) => rooms.findIndex((q) => inside(p, q));
const centre = (q) => [rnd(q.x + q.w / 2), rnd(q.y + q.h / 2)];
const overlaps = (a, b, pad = 0) => a.x < b.x + b.w + pad && b.x < a.x + a.w + pad && a.y < b.y + b.h + pad && b.y < a.y + a.h + pad;

/** The way from one point to another, across then along (each step axis-aligned). */
const elbow = (a, b, first) => (a[0] === b[0] || a[1] === b[1]) ? [b] : first === 'x' ? [[b[0], a[1]], b] : [[a[0], b[1]], b];

/** Rooms, walls, doors and the route from the street door to the room furthest in. */
function floorPlan(r, { depth, minW, minH, streetDoorW = 12 }) {
  const walls = [];
  const rooms = splitRooms(r, B, depth, minW, minH, walls);
  const edges = rooms.map(() => []);
  for (const w of walls) {
    const p = w.axis === 'v' ? [w.x1, w.door] : [w.door, w.y1];
    const a = roomAt(rooms, w.axis === 'v' ? [p[0] - 2, p[1]] : [p[0], p[1] - 2]);
    const b = roomAt(rooms, w.axis === 'v' ? [p[0] + 2, p[1]] : [p[0], p[1] + 2]);
    if (a < 0 || b < 0) continue;
    edges[a].push({ to: b, door: p, axis: w.axis }); edges[b].push({ to: a, door: p, axis: w.axis });
  }
  const front = rooms.map((q, i) => i).filter((i) => rooms[i].y + rooms[i].h === B.y + B.h);
  const entry = pickOf(r, front);
  const streetDoor = [rnd(between(r, rooms[entry].x + 14, rooms[entry].x + rooms[entry].w - 14)), B.y + B.h];
  // the target: the room the most doors in from the street (the largest of those)
  const dist = rooms.map(() => Infinity), prev = rooms.map(() => null);
  dist[entry] = 0; const queue = [entry];
  while (queue.length) { const i = queue.shift(); for (const e of edges[i]) if (dist[e.to] === Infinity) { dist[e.to] = dist[i] + 1; prev[e.to] = { from: i, ...e }; queue.push(e.to); } }
  const far = Math.max(...dist.filter(Number.isFinite));
  const target = rooms.map((q, i) => i).filter((i) => dist[i] === far).sort((a, b) => rooms[b].w * rooms[b].h - rooms[a].w * rooms[a].h)[0];
  const chain = []; for (let i = target; prev[i]; i = prev[i].from) chain.unshift(prev[i]);
  // the route: through each room's middle, out by its door (a door is crossed square to its wall)
  let at = streetDoor; const pts = [streetDoor];
  const cross = (door, axis) => axis === 'v' ? [[door[0] - 6, door[1]], [door[0] + 6, door[1]]] : [[door[0], door[1] - 6], [door[0], door[1] + 6]];
  let room = entry;
  const lanes = [];
  for (const step of [...chain, null]) {
    const c = centre(rooms[room]);
    const goal = step ? (() => { const [p, q] = cross(step.door, step.axis); return inside(p, rooms[room]) ? [p, q] : [q, p]; })() : null;
    const seg = [...elbow(at, [at[0], c[1]] , 'y').filter((p) => p[0] !== at[0] || p[1] !== at[1])];
    // walk to the room's middle line, then on to the door (or stop at the middle in the target room)
    const mid = step ? (step.axis === 'v' ? [at[0], goal[0][1]] : [goal[0][0], at[1]]) : c;
    const legs = step ? elbow(at, mid, step.axis === 'v' ? 'y' : 'x').concat([goal[0], goal[1]]) : elbow(at, c, 'y');
    for (const p of legs) { const last = pts.at(-1); if (p[0] !== last[0] || p[1] !== last[1]) pts.push(p); }
    at = pts.at(-1);
    if (step) room = step.to;
    void seg;
  }
  for (let i = 1; i < pts.length; i++) lanes.push(pts[i - 1], pts[i]);
  const shapes = [{ t: 'rect', cls: 'sp-building', ...B }];
  for (const w of walls) {
    const gap = 7;
    if (w.axis === 'v') { shapes.push({ t: 'line', cls: 'sp-wall', x1: w.x1, y1: w.y1, x2: w.x1, y2: w.door - gap }, { t: 'line', cls: 'sp-wall', x1: w.x1, y1: w.door + gap, x2: w.x1, y2: w.y2 }); }
    else { shapes.push({ t: 'line', cls: 'sp-wall', x1: w.x1, y1: w.y1, x2: w.door - gap, y2: w.y1 }, { t: 'line', cls: 'sp-wall', x1: w.door + gap, y1: w.y1, x2: w.x2, y2: w.y1 }); }
  }
  for (const w of walls) shapes.push(w.axis === 'v' ? { t: 'rect', cls: 'sp-indoor', x: w.x1 - 1.5, y: w.door - 7, w: 3, h: 14, fill: '#6a7389' } : { t: 'rect', cls: 'sp-indoor', x: w.door - 7, y: w.y1 - 1.5, w: 14, h: 3, fill: '#6a7389' });
  shapes.push({ t: 'rect', cls: 'sp-door', x: streetDoor[0] - streetDoorW / 2, y: B.y + B.h - 2.5, w: streetDoorW, h: 5 });
  return { rooms, walls, entry, target, chain, route: pts, streetDoor, shapes, dist };
}

/** Keep-clear boxes along a route (nothing is placed on the way through), and round each door. */
function clearOf(route, walls, pad = 9) {
  const out = [];
  for (let i = 1; i < route.length; i++) {
    const [a, b] = [route[i - 1], route[i]];
    out.push({ x: Math.min(a[0], b[0]) - pad, y: Math.min(a[1], b[1]) - pad, w: Math.abs(a[0] - b[0]) + pad * 2, h: Math.abs(a[1] - b[1]) + pad * 2 });
  }
  for (const w of walls) { const p = w.axis === 'v' ? [w.x1, w.door] : [w.door, w.y1]; out.push({ x: p[0] - 12, y: p[1] - 12, w: 24, h: 24 }); }
  return out;
}

/** Furniture against a room's walls, wherever it fits (a few tries each), never on the way through. */
function furnish(r, room, items, blocked, shapes) {
  const placed = [];
  for (const it of items) {
    for (let k = 0; k < 24; k++) {
      const side = pickOf(r, it.sides ?? ['n', 's', 'w', 'e', 'any']);
      const w = it.w, h = it.h;
      let x = between(r, room.x + 3, room.x + room.w - w - 3), y = between(r, room.y + 3, room.y + room.h - h - 3);
      if (side === 'n') y = room.y + 3; if (side === 's') y = room.y + room.h - h - 3;
      if (side === 'w') x = room.x + 3; if (side === 'e') x = room.x + room.w - w - 3;
      const box = { x: rnd(x), y: rnd(y), w, h };
      if (box.x < room.x + 2 || box.y < room.y + 2 || box.x + w > room.x + room.w - 2 || box.y + h > room.y + room.h - 2) continue;
      if (blocked.some((b) => overlaps(box, b)) || placed.some((b) => overlaps(box, b, 3))) continue;
      placed.push(box);
      shapes.push(...it.draw(box, r));
      break;
    }
  }
  return placed;
}

const rect = (cls, fill) => (b) => [{ t: 'rect', cls, x: b.x, y: b.y, w: b.w, h: b.h, ...(fill ? { fill } : {}) }];
const crate = (b, r) => [{ t: 'rect', cls: 'sp-cover', ...b, fill: pickOf(r, TONES) }];
const crates = (n, w, h) => Array.from({ length: n }, () => ({ w: rnd(w * 1.4), h: rnd(h * 1.4), draw: crate }));
const shelf = (n, horizontal) => ({ w: horizontal ? n * 16 : 9, h: horizontal ? 9 : n * 16, sides: horizontal ? ['n', 's'] : ['w', 'e'], draw: (b) => [{ t: 'rect', cls: 'sp-desk', ...b, fill: '#343b4a' }, { t: 'row', cls: 'sp-cot', x: b.x + 2, y: b.y + 2, w: b.w > b.h ? 12 : b.w - 4, h: b.w > b.h ? b.h - 4 : 12, step: 16, n: Math.max(1, Math.round(Math.max(b.w, b.h) / 16)), axis: b.w > b.h ? 'x' : 'y', tones: TONES }] });
const mahjong = { w: 28, h: 28, sides: ['any'], draw: (b) => [
  { t: 'rect', cls: 'sp-desk', x: b.x + 6, y: b.y + 6, w: 16, h: 16, fill: '#2f5a46' },
  { t: 'rect', cls: 'sp-felt', x: b.x + 9, y: b.y + 9, w: 10, h: 10, fill: '#e8e0c8', rx: 0.5 },
  { t: 'rect', cls: 'sp-cot', x: b.x + 10, y: b.y, w: 8, h: 4, fill: '#5a4a6a' }, { t: 'rect', cls: 'sp-cot', x: b.x + 10, y: b.y + 24, w: 8, h: 4, fill: '#5a4a6a' },
  { t: 'rect', cls: 'sp-cot', x: b.x, y: b.y + 10, w: 4, h: 8, fill: '#5a4a6a' }, { t: 'rect', cls: 'sp-cot', x: b.x + 24, y: b.y + 10, w: 4, h: 8, fill: '#5a4a6a' },
] };
const bed = { w: 18, h: 30, sides: ['n', 'w', 'e'], draw: (b) => [{ t: 'rect', cls: 'sp-cot', ...b, fill: '#4a4f62' }, { t: 'rect', cls: 'sp-pillow', x: b.x + 3, y: b.y + 2, w: b.w - 6, h: 5, fill: '#c9c3b0' }] };
const table = { w: 22, h: 14, sides: ['any'], draw: (b) => [{ t: 'rect', cls: 'sp-desk', ...b, fill: '#4a3a2c' }] };
const counter = (len) => ({ w: len, h: 10, sides: ['n', 's'], draw: (b) => [{ t: 'rect', cls: 'sp-desk', ...b, fill: '#3f4656' }] });

function finish(r, { name, aria, plan, labels, extraShapes = [], look, light, perch }) {
  const { route, streetDoor } = plan;
  const van = [streetDoor[0] < 180 ? streetDoor[0] + 70 : streetDoor[0] - 70, 224];
  const kerb = [streetDoor[0], 206];
  const inPath = [van, [kerb[0], 224], kerb, [streetDoor[0], B.y + B.h - 6]];
  const body = route.slice(1);
  const split = Math.max(1, body.length - 3);
  const insidePath = [inPath.at(-1), ...body.slice(0, split)];
  const targetPath = [insidePath.at(-1), ...body.slice(split)];
  const all = [...inPath, ...insidePath.slice(1), ...targetPath.slice(1)];
  const P = targetPath.at(-1);
  return {
    name, aria, look, light,
    points: { van, perch, target: P },
    paths: { in: inPath, inside: insidePath, target: targetPath, out: [...all].reverse() },
    views: { in: [0, 0, 360, 240], inside: [0, 0, 360, 240], target: [0, 0, 360, 240] },
    posts: { in: inPath.at(-1), inside: insidePath.at(-1), target: P },
    sight: { rifle: [perch, perch, perch], drone: [perch, [4, 236], [356, 236], [356, 4], [4, 4]] },
    shapes: [...ROAD, ...plan.shapes, ...extraShapes],
    labels,
  };
}
const floorOf = (q, fill) => ({ t: 'rect', cls: 'sp-floor', x: q.x + 1, y: q.y + 1, w: q.w - 2, h: q.h - 2, fill, rx: 0 });
const roomLabel = (q, text, hi = false) => ({ x: q.x + 5, y: q.y + 10, text, ...(hi ? { hi: true } : {}) });

// ---- the four kinds of place ----

/** Docks: a rented lock-up. One big shed, an office or two partitioned off, a roller door to the road. */
function lockup(seed) {
  const r = rngOf(`lockup:${seed}`);
  const plan = floorPlan(r, { depth: 2, minW: 90, minH: 70, streetDoorW: 30 });
  const shapes = [];
  const blocked = clearOf(plan.route, plan.walls);
  const big = plan.rooms.map((q, i) => i).sort((a, b) => plan.rooms[b].w * plan.rooms[b].h - plan.rooms[a].w * plan.rooms[a].h)[0];
  const names = ['STORE', 'OFFICE', 'WASHROOM'];
  const labels = [];
  plan.rooms.forEach((q, i) => {
    if (i === plan.target) return;
    if (i === big) {
      furnish(r, q, [{ w: 50, h: 24, sides: ['any'], draw: (b) => [{ t: 'rect', cls: 'sp-cover', ...b, fill: '#5d6478' }, { t: 'rect', cls: 'sp-glass', x: b.x + 38, y: b.y + 3, w: 7, h: 18, fill: '#2a3a4a' }, { t: 'rect', cls: 'sp-glass', x: b.x + 46, y: b.y + 2, w: 3, h: 4, fill: '#f2d541' }, { t: 'rect', cls: 'sp-glass', x: b.x + 46, y: b.y + 18, w: 3, h: 4, fill: '#f2d541' }] }, // the van, parked inside
        shelf(4, true), shelf(3, false), ...crates(6, 14, 11)], blocked, shapes);
      labels.push(roomLabel(q, 'LOCK-UP'));
    } else { furnish(r, q, [table, shelf(2, false), ...crates(2, 12, 10)], blocked, shapes); labels.push(roomLabel(q, names.shift())); }
  });
  const t = plan.rooms[plan.target];
  shapes.push({ t: 'rect', cls: 'sp-room', x: t.x + 4, y: t.y + 4, w: t.w - 8, h: t.h - 8 });
  furnish(r, t, [table, ...crates(3, 12, 10)], blocked, shapes);
  labels.push(roomLabel(t, pickOf(r, ['BACK OFFICE', 'CAGE', 'COLD STORE']), true));
  plan.shapes.splice(1, 0, ...plan.rooms.map((q, i) => floorOf(q, i === big ? FLOORS.lockup : i === plan.target ? FLOORS.back : FLOORS.store)));
  labels.push({ x: plan.streetDoor[0] - 26, y: 209, text: 'ROLLER DOOR' });
  return finish(r, { name: 'a lock-up', aria: 'A rented lock-up', plan: { ...plan, shapes: [...plan.shapes, ...shapes] }, labels, look: 'docks', light: '#ff3d5f', perch: [340, 206] });
}

/** Night Market: a mahjong parlour. Tables at the front, a kitchen, a store, the back room. */
function parlour(seed) {
  const r = rngOf(`parlour:${seed}`);
  const plan = floorPlan(r, { depth: 3, minW: 64, minH: 52 });
  const shapes = [];
  const blocked = clearOf(plan.route, plan.walls);
  const labels = [];
  const rest = ['KITCHEN', 'STORE', 'STAIRS', 'OFFICE', 'WASHROOM'];
  plan.rooms.forEach((q, i) => {
    if (i === plan.target) return;
    if (i === plan.entry) { furnish(r, q, [mahjong, mahjong, mahjong, mahjong, counter(30)], blocked, shapes); labels.push(roomLabel(q, 'PARLOUR')); return; }
    const kind = rest.shift(); q.kind = kind;
    if (kind === 'KITCHEN') furnish(r, q, [counter(44), counter(30), table, ...crates(3, 10, 10)], blocked, shapes);
    else if (kind === 'STAIRS') shapes.push({ t: 'row', cls: 'sp-step', x: q.x + 6, y: q.y + 14, w: 22, h: 1.5, step: 5, n: Math.min(8, Math.floor((q.h - 20) / 5)), axis: 'y' });
    else if (kind === 'OFFICE') furnish(r, q, [table, table, shelf(3, false), ...crates(2, 12, 10)], blocked, shapes);
    else furnish(r, q, [shelf(3, true), shelf(2, false), ...crates(5, 12, 10)], blocked, shapes);
    labels.push(roomLabel(q, kind));
  });
  const t = plan.rooms[plan.target];
  shapes.push({ t: 'rect', cls: 'sp-room', x: t.x + 4, y: t.y + 4, w: t.w - 8, h: t.h - 8 });
  furnish(r, t, [mahjong, table, crates(1, 12, 12)[0]], blocked, shapes);
  labels.push(roomLabel(t, 'BACK ROOM', true));
  plan.shapes.splice(1, 0, ...plan.rooms.map((q, i) => floorOf(q, i === plan.entry ? FLOORS.parlour : i === plan.target ? FLOORS.back : q.kind === 'KITCHEN' ? FLOORS.kitchen : FLOORS.store)));
  const neon = [{ t: 'rect', cls: 'sp-sign', x: plan.streetDoor[0] - 18, y: B.y + B.h + 3, w: 36, h: 4, fill: pickOf(r, ['#ff3d5f', '#b48cff', '#3de8d8']) }];
  return finish(r, { name: 'a mahjong parlour', aria: 'A mahjong parlour', plan: { ...plan, shapes: [...plan.shapes, ...shapes, ...neon] }, labels, look: 'nightMarket', light: '#b48cff', perch: [340, 206] });
}

/** Old Town: a tenement stairwell. A stair core up from the street, flats either side, one of them the place. */
function stairwell(seed) {
  const r = rngOf(`stair:${seed}`);
  const cw = 34; const cx = rnd(between(r, 120, 240)); const core = { x: cx - cw / 2, y: B.y, w: cw, h: B.h };
  const walls = [{ x1: core.x, y1: B.y, x2: core.x, y2: B.y + B.h }, { x1: core.x + cw, y1: B.y, x2: core.x + cw, y2: B.y + B.h }];
  const flats = [];
  for (const side of ['w', 'e']) {
    const x0 = side === 'w' ? B.x : core.x + cw, x1 = side === 'w' ? core.x : B.x + B.w;
    const n = 2 + Math.floor(r() * 2); let y = B.y;
    const cuts = Array.from({ length: n - 1 }, (_, i) => rnd(B.y + (B.h * (i + 1)) / n + between(r, -10, 10)));
    for (const c of [...cuts, B.y + B.h]) { flats.push({ x: x0, y, w: x1 - x0, h: c - y, side }); if (c < B.y + B.h) walls.push({ x1: x0, y1: c, x2: x1, y2: c, solid: true }); y = c; }
  }
  // each flat's door onto the stair core, the target one of the top flats
  const shapes = [{ t: 'rect', cls: 'sp-building', ...B }];
  const doorOf = (f) => [f.side === 'w' ? core.x : core.x + cw, rnd(f.y + f.h / 2 + between(r, -f.h / 4, f.h / 4))];
  for (const f of flats) f.door = doorOf(f);
  const tops = flats.filter((f) => f.y === B.y);
  const tgt = pickOf(r, tops);
  for (const w of walls) {
    if (w.solid) { shapes.push({ t: 'line', cls: 'sp-wall', ...w }); continue; }
    const doors = flats.filter((f) => f.door[0] === w.x1).map((f) => f.door[1]).sort((a, b) => a - b);
    let y = w.y1; for (const d of doors) { shapes.push({ t: 'line', cls: 'sp-wall', x1: w.x1, y1: y, x2: w.x1, y2: d - 7 }); y = d + 7; }
    shapes.push({ t: 'line', cls: 'sp-wall', x1: w.x1, y1: y, x2: w.x1, y2: w.y2 });
  }
  shapes.push({ t: 'row', cls: 'sp-step', x: core.x + 5, y: B.y + 8, w: cw - 10, h: 1.5, step: 5, n: 34, axis: 'y', skip: [] });
  const streetDoor = [cx, B.y + B.h];
  shapes.push({ t: 'rect', cls: 'sp-door', x: cx - 6, y: B.y + B.h - 2.5, w: 12, h: 5 });
  const tc = centre(tgt);
  const route = [streetDoor, [cx, tgt.door[1]], [tgt.door[0] + (tgt.side === 'w' ? 6 : -6), tgt.door[1]], [tgt.door[0] + (tgt.side === 'w' ? -6 : 6), tgt.door[1]], [tc[0], tgt.door[1]], tc];
  const blocked = clearOf(route, []).concat(flats.map((f) => ({ x: f.door[0] - 14, y: f.door[1] - 12, w: 28, h: 24 })), [{ ...core }]);
  const labels = [{ x: core.x + 3, y: B.y + B.h + 12, text: 'STAIRWELL' }];
  let n = 1;
  for (const f of flats) {
    const name = `${n}${f.side === 'w' ? 'A' : 'B'}`; n += f.side === 'e' ? 1 : 0;
    if (f === tgt) {
      shapes.push({ t: 'rect', cls: 'sp-room', x: f.x + 4, y: f.y + 4, w: f.w - 8, h: f.h - 8 });
      furnish(r, f, [bed, table, ...crates(2, 10, 9)], blocked, shapes);
      labels.push(roomLabel(f, `FLAT ${pickOf(r, ['9', '11', '14'])}${f.side === 'w' ? 'A' : 'B'}`, true));
    } else {
      furnish(r, f, [bed, table, counter(20), ...crates(1, 10, 9)], blocked, shapes);
      void name;
    }
  }
  shapes.splice(1, 0, ...flats.map((f) => floorOf(f, f === tgt ? FLOORS.back : FLOORS.flat)), floorOf(core, '#16181d'));
  const plan = { route, streetDoor, shapes };
  return finish(r, { name: 'a tenement stairwell', aria: 'A tenement stairwell', plan, labels, look: 'oldTown', light: '#f2b544', perch: [340, 206] });
}

/** Old Town or Night Market: an alley. A winding way between blocks from the street to a back door. */
function alley(seed) {
  const r = rngOf(`alley:${seed}`);
  const C = 6, R = 4, cw = 60, rh = 49.5;
  let c = 1 + Math.floor(r() * 4), row = R - 1; const cells = [[c, row]];
  const seen = new Set([`${c},${row}`]);
  let dir = 'up';
  while (cells.length < 9) {
    const opts = [];
    if (row > 0) opts.push('up', 'up');
    if (dir !== 'right' && c > 0) opts.push('left');
    if (dir !== 'left' && c < C - 1) opts.push('right');
    const d = pickOf(r, opts); if (!d) break;
    const [nc, nr] = d === 'up' ? [c, row - 1] : d === 'left' ? [c - 1, row] : [c + 1, row];
    if (seen.has(`${nc},${nr}`)) break;
    // no two path cells side by side unless they're steps of the path (keeps it one alley wide)
    seen.add(`${nc},${nr}`); cells.push([nc, nr]); [c, row] = [nc, nr]; dir = d;
    if (row === 0 && r() < 0.5) break;
  }
  const mid = ([cc, rr]) => [rnd(cc * cw + cw / 2), rnd(B.y + rr * rh + rh / 2 - 8)];
  const shapes = [];
  const aw = 30;
  const route = [[mid(cells[0])[0], 212], ...cells.map(mid)];
  for (let i = 1; i < route.length; i++) {
    const [a, b] = [route[i - 1], route[i]];
    shapes.push({ t: 'rect', cls: 'sp-alley', x: Math.min(a[0], b[0]) - aw / 2, y: Math.min(a[1], b[1]) - aw / 2, w: Math.abs(a[0] - b[0]) + aw, h: Math.abs(a[1] - b[1]) + aw });
  }
  const lane = shapes.map((s) => ({ x: s.x, y: s.y, w: s.w, h: s.h }));
  // blocks: the city in every cell the alley doesn't take, cut back from the alley
  const winTones = ['#2a303b', '#2a303b', '#f2d541', '#2a303b', '#3de8d8', '#2a303b', '#ff3d5f', '#2a303b'];
  const onPath = new Set(cells.map(([a, b]) => `${a},${b}`));
  const taken = new Set();
  for (let cc = 0; cc < C; cc++) for (let rr = 0; rr < R; rr++) {
    if (taken.has(`${cc},${rr}`)) continue;
    let span = 1, tall = 1;
    while (cc + span < C && !onPath.has(`${cc + span},${rr}`) && !onPath.has(`${cc},${rr}`) && r() < 0.55) span++;
    if (span === 1 && rr + 1 < R && !onPath.has(`${cc},${rr + 1}`) && !onPath.has(`${cc},${rr}`) && r() < 0.4) tall = 2;
    for (let k = 0; k < span; k++) for (let j = 0; j < tall; j++) taken.add(`${cc + k},${rr + j}`);
    const jx = rnd(between(r, 0, 5)), jy = rnd(between(r, 0, 5));
    let box = { x: cc * cw + 3 + jx, y: B.y + rr * rh - 12 + 3 + jy, w: cw * span - 6 - jx, h: rh * tall - 6 - jy };
    if (rr === 0) { box.y = 4 + jy; box.h = rh * tall - 6 - jy + (B.y - 4) - 12 + 12; }
    for (const l of lane) {
      if (!overlaps(box, l, 2)) continue;
      // trim the block away from the alley on whichever side keeps most of it
      const cut = [
        { ...box, w: l.x - 3 - box.x }, { ...box, x: l.x + l.w + 3, w: box.x + box.w - (l.x + l.w + 3) },
        { ...box, h: l.y - 3 - box.y }, { ...box, y: l.y + l.h + 3, h: box.y + box.h - (l.y + l.h + 3) },
      ].filter((b) => b.w >= 10 && b.h >= 10 && !lane.some((m) => overlaps(b, m, 2))).sort((a, b) => b.w * b.h - a.w * a.h)[0];
      box = cut; if (!box) break;
    }
    if (!box || box.y + box.h > 205) { if (box) box.h = 205 - box.y; if (!box || box.h < 10) continue; }
    shapes.push({ t: 'rect', cls: 'sp-block', ...box });
    if (box.w > 22 && box.h > 18) shapes.push({ t: 'row', cls: 'sp-window', x: box.x + 5, y: box.y + 6, w: 4, h: 3, step: 9, n: Math.floor((box.w - 8) / 9), tones: [...winTones].sort(() => r() - 0.5) });
  }
  // clutter in the alley, never on the way through: bins, AC units, a handcart, crates
  const blocked = clearOf(route, [], 6);
  const clutter = [];
  for (const l of lane) furnish(r, l, [...crates(2, 9, 8), { w: 12, h: 7, sides: ['any'], draw: (b) => [{ t: 'rect', cls: 'sp-cover', ...b, fill: TONES[2] }] }], blocked.concat(clutter), shapes);
  const P = route.at(-1);
  shapes.push({ t: 'rect', cls: 'sp-door', x: P[0] - 6, y: P[1] - 16, w: 12, h: 4 });
  if (r() < 0.7) shapes.push({ t: 'poly', cls: 'sp-laundry', points: [[route[2][0] - 15, route[2][1] - 6], [route[2][0], route[2][1] - 2], [route[2][0] + 15, route[2][1] - 6]] });
  const labels = [{ x: route[0][0] + 18, y: 208, text: 'ALLEY' }, { x: P[0] - 22, y: P[1] - 20, text: 'BACK DOOR', hi: true }];
  const plan = { route, streetDoor: [route[0][0], 212], shapes };
  const site = finish(r, { name: 'an alley', aria: 'An alley', plan, labels, look: 'oldTown', light: '#f2b544', perch: [340, 206] });
  site.shapes = [...ROAD, ...shapes]; // no building shell: it's outside
  site.paths.in = [site.points.van, [route[0][0], 224], route[0]];
  site.paths.inside = [route[0], ...route.slice(1, -2)];
  site.paths.target = [site.paths.inside.at(-1), ...route.slice(-2)];
  site.paths.out = [...site.paths.in, ...site.paths.inside.slice(1), ...site.paths.target.slice(1)].reverse();
  return site;
}

// ---- the checks the game's tests would run on every generated map ----
import { gridSite } from '../../src/ui/route.js';
import { rectsOf } from '../../src/ui/siteart.js';
const SOLID = new Set(['sp-cover', 'sp-desk', 'sp-cot', 'sp-block']);
function problems(site) {
  const g = gridSite(site);
  const route = [...g.paths.in, ...g.paths.inside.slice(1), ...g.paths.target.slice(1)];
  const walls = site.shapes.filter((x) => x.cls === 'sp-wall');
  const boxes = site.shapes.filter((x) => SOLID.has(x.cls)).flatMap(rectsOf);
  const out = [];
  for (let i = 1; i < route.length; i++) {
    const [a, b] = [route[i - 1], route[i]];
    const seg = { x: Math.min(a[0], b[0]), y: Math.min(a[1], b[1]), w: Math.abs(a[0] - b[0]), h: Math.abs(a[1] - b[1]) };
    for (const w of walls) {
      const wl = { x: Math.min(w.x1, w.x2), y: Math.min(w.y1, w.y2), w: Math.abs(w.x1 - w.x2), h: Math.abs(w.y1 - w.y2) };
      if (seg.x < wl.x + wl.w + 0.01 && wl.x < seg.x + seg.w + 0.01 && seg.y < wl.y + wl.h + 0.01 && wl.y < seg.y + seg.h + 0.01) out.push(`route crosses a wall at ${a} → ${b}`);
    }
    for (const r of boxes) if (seg.x < r.x + r.w - 1 && r.x + 1 < seg.x + seg.w && seg.y < r.y + r.h - 1 && r.y + 1 < seg.y + seg.h) out.push(`route through ${r.x},${r.y}`);
  }
  return out;
}

const KINDS = [
  ['lockup', 'Lock-up · the Docks', 'One big shed with a roller door, the van parked inside, shelving and crates, one or two rooms partitioned off. The target is the room furthest in.', lockup],
  ['parlour', 'Mahjong parlour · Night Market', 'Tables at the front, then a kitchen, a store, stairs, and the back room as far from the street as the rooms go. A neon sign over the door.', parlour],
  ['stairwell', 'Tenement stairwell · Old Town', 'A stair core up from the street door, flats off both sides, the target one of the flats at the top.', stairwell],
  ['alley', 'Alley · Old Town', 'A winding way between blocks from the street to a back door, narrowed by bins, AC units and crates.', alley],
];
const SEEDS = ['kidnap-1:lockup', 'job-77:b', 'job-31:c'];

const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Generated interiors · mockup</title><style>${css}
  body { margin: 0; padding: 16px; background: #0a0c0f; color: #d8deea; font-family: Inter, system-ui, sans-serif; }
  h1 { font-family: Rajdhani, sans-serif; letter-spacing: .12em; text-transform: uppercase; font-size: 22px; margin: 0 0 4px; }
  .lede { color: #8a93a6; max-width: 72ch; margin: 0 0 18px; font-size: 14px; line-height: 1.45; }
  h2 { font-family: Rajdhani, sans-serif; color: #3ee6d4; letter-spacing: .14em; text-transform: uppercase; font-size: 16px; margin: 24px 0 4px; }
  .why { color: #8a93a6; font-size: 13px; margin: 0 0 10px; max-width: 72ch; }
  .row { display: grid; grid-template-columns: 1fr; gap: 14px; }
  @media (min-width: 900px) { .row { grid-template-columns: repeat(3, 1fr); } }
  figure { margin: 0; } figcaption { color: #5d6577; font: 11px monospace; margin-bottom: 4px; }
  .frame { border: 1px solid #2a303b; clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%); }
  .siteplan { width: 100%; height: auto; display: block; }
</style></head><body>
<h1>Generated interiors · mockup</h1>
<p class="lede">Each map is built from a seed (the job and the stop), so a stop always looks the same and nothing goes in the save. Rooms, doors, furniture and the route are generated; the drawing is the game's own. Furniture is the fight cover and is never placed on the way through. Three seeds of each kind.</p>
${KINDS.map(([k, title, why, make]) => `<h2>${title}</h2><p class="why">${why}</p><div class="row">${SEEDS.map((s) => `<figure><figcaption>seed ${s}</figcaption><div class="frame">${sitePlanSvg({ site: make(s) })}</div></figure>`).join('')}</div>`).join('')}
</body></html>`;

let bad = 0;
for (const [k, , , make] of KINDS) for (let i = 0; i < 300; i++) { const p = problems(make(`check-${i}`)); if (p.length) { bad++; if (bad < 8) console.log(k, i, p[0]); } }
console.log('maps with a problem:', bad, 'of', KINDS.length * 300);
const out = process.argv[2];
writeFileSync(`${out}.html`, html);
const browser = await chromium.launch();
for (const [w, h, s, sfx] of [[1440, 900, 1, 'desktop'], [390, 844, 2, 'phone']]) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: s });
  await page.goto(`file://${out}.html`);
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${out}-${sfx}.png`, fullPage: true });
}
await browser.close();
console.log('ok');
