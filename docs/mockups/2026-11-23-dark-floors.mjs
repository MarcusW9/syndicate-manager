// Mockup: fully-inside maps with the dark (2026-11-23). Not in the game yet.
// No street: the map is one floor of a building. Rooms are dark until the crew walks in; an open door
// gives a glimpse of the room past it; a hallway lights up only where they've walked. The stairs lead
// to the next floor, a map of its own. Drawn by the game's own sitePlanSvg; the dark and the crew
// walking are this page's script.
//
//   node docs/mockups/2026-11-23-dark-floors.mjs $PWD/docs/mockups/2026-11-23-dark-floors
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync } from 'node:fs';
import { sitePlanSvg } from '../../src/ui/siteplan.js';
import { rectsOf } from '../../src/ui/siteart.js';
const { chromium } = createRequire(import.meta.url)('playwright');
const css = readFileSync(new URL('../../src/ui/styles.css', import.meta.url), 'utf8');

const hashStr = (s) => { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0; return h; };
function rngOf(seed) { let a = hashStr(seed); return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const between = (r, lo, hi) => lo + r() * (hi - lo);
const pickOf = (r, list) => list[Math.floor(r() * list.length)];
const rnd = Math.round;
const overlaps = (a, b, pad = 0) => a.x < b.x + b.w + pad && b.x < a.x + a.w + pad && a.y < b.y + b.h + pad && b.y < a.y + a.h + pad;
const inRect = (p, q) => p[0] > q.x && p[0] < q.x + q.w && p[1] > q.y && p[1] < q.y + q.h;
const centre = (q) => [rnd(q.x + q.w / 2), rnd(q.y + q.h / 2)];

const F = { x: 6, y: 6, w: 348, h: 228 }; // the whole map is the floor
const TONES = ['#3a4254', '#4a3644', '#34483f', '#4d4430'];

// ---- furniture ----
function furnish(r, room, items, blocked, shapes) {
  const placed = [];
  for (const it of items) for (let k = 0; k < 30; k++) {
    const side = pickOf(r, it.sides ?? ['n', 's', 'w', 'e', 'any']);
    let x = between(r, room.x + 4, room.x + room.w - it.w - 4), y = between(r, room.y + 4, room.y + room.h - it.h - 4);
    if (side === 'n') y = room.y + 4; if (side === 's') y = room.y + room.h - it.h - 4; if (side === 'w') x = room.x + 4; if (side === 'e') x = room.x + room.w - it.w - 4;
    const b = { x: rnd(x), y: rnd(y), w: it.w, h: it.h };
    if (b.x < room.x + 3 || b.y < room.y + 3 || b.x + b.w > room.x + room.w - 3 || b.y + b.h > room.y + room.h - 3) continue;
    if (blocked.some((q) => overlaps(b, q)) || placed.some((q) => overlaps(b, q, 3))) continue;
    placed.push(b); shapes.push(...it.draw(b, r)); break;
  }
}
const crate = (w = 16, h = 14) => ({ w, h, draw: (b, r) => [{ t: 'rect', cls: 'sp-cover', ...b, fill: pickOf(r, TONES) }] });
const table = { w: 24, h: 14, draw: (b) => [{ t: 'rect', cls: 'sp-desk', ...b, fill: '#4a3a2c' }] };
const booth = { w: 30, h: 22, sides: ['n', 's'], draw: (b) => [{ t: 'rect', cls: 'sp-cot', x: b.x, y: b.y, w: b.w, h: 5, fill: '#6a3040' }, { t: 'rect', cls: 'sp-desk', x: b.x + 4, y: b.y + 7, w: b.w - 8, h: 8, fill: '#c9c3b0' }, { t: 'rect', cls: 'sp-cot', x: b.x, y: b.y + 17, w: b.w, h: 5, fill: '#6a3040' }] };
const counter = (len) => ({ w: len, h: 10, sides: ['n', 's'], draw: (b) => [{ t: 'rect', cls: 'sp-desk', ...b, fill: '#3f4656' }] });
const bed = { w: 20, h: 32, sides: ['n', 'w', 'e'], draw: (b) => [{ t: 'rect', cls: 'sp-cot', ...b, fill: '#4a4f62' }, { t: 'rect', cls: 'sp-cot', x: b.x + 3, y: b.y + 2, w: b.w - 6, h: 6, fill: '#c9c3b0' }] };
const chair = { w: 10, h: 10, sides: ['any'], draw: (b) => [{ t: 'rect', cls: 'sp-cover', ...b, fill: '#5a4a3a' }] };
const shelf = (n) => ({ w: n * 16, h: 9, sides: ['n', 's'], draw: (b) => [{ t: 'rect', cls: 'sp-desk', ...b, fill: '#343b4a' }] });

// ---- a floor split into rooms (ground floor) ----
function splitRooms(r, rect, depth, minW, minH, walls) {
  const canV = rect.w >= minW * 2 + 4, canH = rect.h >= minH * 2 + 4;
  if (depth <= 0 || (!canV && !canH)) return [rect];
  const vertical = canV && (!canH || rect.w / rect.h > between(r, 0.9, 1.5));
  if (vertical) {
    const x = rnd(rect.x + between(r, minW, rect.w - minW)); const d = rnd(between(r, rect.y + 14, rect.y + rect.h - 14));
    walls.push({ axis: 'v', x1: x, y1: rect.y, x2: x, y2: rect.y + rect.h, door: d });
    return [...splitRooms(r, { ...rect, w: x - rect.x }, depth - 1, minW, minH, walls), ...splitRooms(r, { ...rect, x, w: rect.x + rect.w - x }, depth - 1, minW, minH, walls)];
  }
  const y = rnd(rect.y + between(r, minH, rect.h - minH)); const d = rnd(between(r, rect.x + 14, rect.x + rect.w - 14));
  walls.push({ axis: 'h', x1: rect.x, y1: y, x2: rect.x + rect.w, y2: y, door: d });
  return [...splitRooms(r, { ...rect, h: y - rect.y }, depth - 1, minW, minH, walls), ...splitRooms(r, { ...rect, y, h: rect.y + rect.h - y }, depth - 1, minW, minH, walls)];
}
const doorPoint = (w) => (w.axis === 'v' ? [w.x1, w.door] : [w.door, w.y1]);
function wallShapes(walls) {
  const out = [];
  for (const w of walls) {
    const g = 8;
    if (w.axis === 'v') out.push({ t: 'line', cls: 'sp-wall', x1: w.x1, y1: w.y1, x2: w.x1, y2: w.door - g }, { t: 'line', cls: 'sp-wall', x1: w.x1, y1: w.door + g, x2: w.x1, y2: w.y2 }, { t: 'rect', cls: 'sp-indoor', x: w.x1 - 1.5, y: w.door - 8, w: 3, h: 16, fill: '#6a7389' });
    else out.push({ t: 'line', cls: 'sp-wall', x1: w.x1, y1: w.y1, x2: w.door - g, y2: w.y1 }, { t: 'line', cls: 'sp-wall', x1: w.door + g, y1: w.y1, x2: w.x2, y2: w.y1 }, { t: 'rect', cls: 'sp-indoor', x: w.door - 8, y: w.y1 - 1.5, w: 16, h: 3, fill: '#6a7389' });
  }
  return out;
}
/** Route through rooms: room middle line, square through each door. */
function walk(start, chain, rooms, endAt) {
  const pts = [start]; let at = start;
  const add = (p) => { const l = pts.at(-1); if (p[0] !== l[0] || p[1] !== l[1]) pts.push(p); };
  for (const step of chain) {
    const [dx, dy] = step.door;
    const [a, b] = step.axis === 'v' ? [[dx - 8, dy], [dx + 8, dy]] : [[dx, dy - 8], [dx, dy + 8]];
    const [p, q] = inRect(a, rooms[step.from]) ? [a, b] : [b, a];
    if (step.axis === 'v') { add([at[0], p[1]]); } else { add([p[0], at[1]]); }
    add(p); add(q); at = q;
  }
  add([endAt[0], at[1]]); add(endAt);
  return pts;
}
function roomGraph(rooms, walls) {
  const edges = rooms.map(() => []);
  for (const w of walls) {
    const p = doorPoint(w);
    const a = rooms.findIndex((q) => inRect(w.axis === 'v' ? [p[0] - 2, p[1]] : [p[0], p[1] - 2], q));
    const b = rooms.findIndex((q) => inRect(w.axis === 'v' ? [p[0] + 2, p[1]] : [p[0], p[1] + 2], q));
    if (a >= 0 && b >= 0) { edges[a].push({ to: b, door: p, axis: w.axis }); edges[b].push({ to: a, door: p, axis: w.axis }); }
  }
  return edges;
}
function bfs(edges, from) {
  const dist = edges.map(() => Infinity), prev = edges.map(() => null); dist[from] = 0; const q = [from];
  while (q.length) { const i = q.shift(); for (const e of edges[i]) if (dist[e.to] === Infinity) { dist[e.to] = dist[i] + 1; prev[e.to] = { from: i, ...e }; q.push(e.to); } }
  return { dist, prev };
}
const chainTo = (prev, t) => { const c = []; for (let i = t; prev[i]; i = prev[i].from) c.unshift(prev[i]); return c; };
const label = (q, text, hi) => ({ x: q.x + 6, y: q.y + 12, text, ...(hi ? { hi: true } : {}) });
const floorRect = (q, fill) => ({ t: 'rect', cls: 'sp-floor', x: q.x + 1, y: q.y + 1, w: q.w - 2, h: q.h - 2, fill, rx: 0 });
const stairs = (q) => [{ t: 'rect', cls: 'sp-floor', x: q.x + 1, y: q.y + 1, w: q.w - 2, h: q.h - 2, fill: '#15171c', rx: 0 }, { t: 'row', cls: 'sp-step', x: q.x + 8, y: q.y + 16, w: Math.min(30, q.w - 16), h: 2, step: 6, n: Math.max(3, Math.floor((q.h - 24) / 6)), axis: 'y' }];

/** Ground floor: a closed-down cha chaan teng. In by the back door; the stairs up are as far in as the rooms go. */
function groundFloor(seed) {
  const r = rngOf(`g:${seed}`);
  const walls = []; const rooms = splitRooms(r, F, 3, 70, 56, walls);
  const edges = roomGraph(rooms, walls);
  const edge = rooms.map((q, i) => i).filter((i) => rooms[i].y + rooms[i].h === F.y + F.h);
  const entry = pickOf(r, edge);
  const door = [rnd(between(r, rooms[entry].x + 16, rooms[entry].x + rooms[entry].w - 16)), F.y + F.h];
  const { dist, prev } = bfs(edges, entry);
  const far = Math.max(...dist.filter(Number.isFinite));
  const up = rooms.map((q, i) => i).filter((i) => dist[i] === far)[0];
  const chain = chainTo(prev, up).map((s, k, all) => ({ ...s, from: k === 0 ? entry : all[k - 1].to }));
  const upAt = [rooms[up].x + 22, rooms[up].y + rooms[up].h / 2];
  const route = walk([door[0], door[1] - 2], chain, rooms, [rnd(upAt[0]), rnd(upAt[1])]);
  const lanes = route.slice(1).map((p, i) => { const a = route[i]; return { x: Math.min(a[0], p[0]) - 10, y: Math.min(a[1], p[1]) - 10, w: Math.abs(a[0] - p[0]) + 20, h: Math.abs(a[1] - p[1]) + 20 }; });
  const blocked = [...lanes, ...walls.map((w) => { const p = doorPoint(w); return { x: p[0] - 13, y: p[1] - 13, w: 26, h: 26 }; })];
  const floors = [], stuff = [], labels = [];
  const names = ['KITCHEN', 'STORE', 'WASHROOM', 'OFFICE', 'COLD ROOM', 'STORE'];
  rooms.forEach((q, i) => {
    if (i === up) { floors.push(...stairs(q)); labels.push(label(q, 'STAIRS UP', true)); return; }
    if (i === entry || (i !== up && q.w * q.h > 20000 && !labels.some((l) => l.text === 'DINING ROOM'))) {
      floors.push(floorRect(q, '#22191c')); furnish(r, q, [booth, booth, booth, booth, counter(40), chair, chair], blocked, stuff); labels.push(label(q, i === entry ? 'BACK OF THE SHOP' : 'DINING ROOM')); return;
    }
    const n = names.shift(); floors.push(floorRect(q, n === 'KITCHEN' ? '#1a2328' : '#1b1d22'));
    furnish(r, q, n === 'KITCHEN' ? [counter(50), counter(36), crate(), crate()] : [shelf(3), crate(), crate(), crate(), table], blocked, stuff);
    labels.push(label(q, n));
  });
  const shapes = [{ t: 'rect', cls: 'sp-building', ...F }, ...floors, ...wallShapes(walls), ...stuff, { t: 'rect', cls: 'sp-door', x: door[0] - 8, y: F.y + F.h - 3, w: 16, h: 6 }];
  return { title: 'G/F · the shop', rooms, doors: walls.map(doorPoint), route, upRoom: rooms[up], site: siteOf(shapes, labels, route) };
}

/** Upper floor: a hallway from the stairs, rooms off both sides; the target the room furthest along. */
function upperFloor(seed, from, n) {
  const r = rngOf(`u${n}:${seed}`);
  const sq = { ...from };
  const left = sq.x + sq.w / 2 < 180;
  const hy = rnd(Math.min(Math.max(sq.y + sq.h / 2 - 16, F.y + 60), F.y + F.h - 92)); const hh = 32;
  const hall = { x: left ? sq.x + sq.w : F.x, y: hy, w: left ? F.x + F.w - (sq.x + sq.w) : sq.x - F.x, h: hh };
  const stairsRoom = { x: sq.x, y: F.y, w: sq.w, h: F.h };
  const rooms = [stairsRoom, hall];
  const walls = [];
  // rooms along each side of the hallway
  for (const side of ['top', 'bottom']) {
    let x = hall.x; const end = hall.x + hall.w;
    while (end - x > 50) {
      const w = Math.min(end - x, rnd(between(r, 60, 104))); const rw = end - (x + w) < 50 ? end - x : w;
      const q = side === 'top' ? { x, y: F.y, w: rw, h: hall.y - F.y } : { x, y: hall.y + hall.h, w: rw, h: F.y + F.h - hall.y - hall.h };
      rooms.push(q);
      const d = rnd(between(r, x + 14, x + rw - 14));
      walls.push({ axis: 'h', x1: x, y1: side === 'top' ? hall.y : hall.y + hall.h, x2: x + rw, y2: side === 'top' ? hall.y : hall.y + hall.h, door: d });
      if (x + rw < end) walls.push({ axis: 'v', solid: true, x1: x + rw, y1: q.y, x2: x + rw, y2: q.y + q.h });
      x += rw;
    }
  }
  const sx = left ? sq.x + sq.w : sq.x; walls.push({ axis: 'v', x1: sx, y1: F.y, x2: sx, y2: F.y + F.h, door: hall.y + hh / 2 });
  const edges = roomGraph(rooms, walls.filter((w) => !w.solid));
  const { dist, prev } = bfs(edges, 0);
  // the target: the room off the hallway furthest from the stairs
  const offs = rooms.map((q, i) => i).filter((i) => i > 1);
  const tgt = offs.sort((a, b) => Math.abs(centre(rooms[b])[0] - sx) - Math.abs(centre(rooms[a])[0] - sx))[0];
  const chain = chainTo(prev, tgt).map((s, k, all) => ({ ...s, from: k === 0 ? 0 : all[k - 1].to }));
  const start = [rnd(sq.x + 22), rnd(hall.y + hh / 2)];
  const route = walk(start, chain, rooms, centre(rooms[tgt]));
  const lanes = route.slice(1).map((p, i) => { const a = route[i]; return { x: Math.min(a[0], p[0]) - 10, y: Math.min(a[1], p[1]) - 10, w: Math.abs(a[0] - p[0]) + 20, h: Math.abs(a[1] - p[1]) + 20 }; });
  const blocked = [...lanes, ...walls.filter((w) => !w.solid).map((w) => { const p = doorPoint(w); return { x: p[0] - 13, y: p[1] - 13, w: 26, h: 26 }; })];
  const floors = [floorRect(stairsRoom, '#15171c'), { t: 'row', cls: 'sp-step', x: stairsRoom.x + 8, y: rnd(hall.y + hh / 2 - 30), w: Math.min(30, stairsRoom.w - 16), h: 2, step: 6, n: 10, axis: 'y' }, floorRect(hall, '#191b21')], stuff = [], labels = [{ x: stairsRoom.x + 6, y: rnd(hall.y + hh / 2 - 36), text: 'STAIRS' }, { x: hall.x + 8, y: hall.y + hh / 2 + 3, text: 'HALLWAY' }];
  const kinds = ['BEDROOM', 'BEDROOM', 'BATHROOM', 'STORE', 'BEDROOM', 'LAUNDRY', 'BEDROOM'];
  rooms.forEach((q, i) => {
    if (i < 2) return;
    if (i === tgt) { floors.push(floorRect(q, '#2a1820')); stuff.push({ t: 'rect', cls: 'sp-room', x: q.x + 4, y: q.y + 4, w: q.w - 8, h: q.h - 8 }); furnish(r, q, [chair, bed, table, crate()], blocked, stuff); labels.push(label(q, n === 2 ? 'THE BACK BEDROOM' : 'THE ROOM', true)); return; }
    const k = kinds[(i + n) % kinds.length]; floors.push(floorRect(q, k === 'BATHROOM' ? '#1a2328' : '#211d1a'));
    furnish(r, q, k === 'BEDROOM' ? [bed, table, crate(12, 10)] : [shelf(2), crate(), crate(12, 10)], blocked, stuff);
    labels.push(label(q, k));
  });
  const wl = wallShapes(walls.filter((w) => !w.solid)).concat(walls.filter((w) => w.solid).map((w) => ({ t: 'line', cls: 'sp-wall', x1: w.x1, y1: w.y1, x2: w.x2, y2: w.y2 })));
  const shapes = [{ t: 'rect', cls: 'sp-building', ...F }, ...floors, ...wl, ...stuff];
  return { title: `${n}/F · upstairs`, rooms, doors: walls.filter((w) => !w.solid).map(doorPoint), route, hall: 1, site: siteOf(shapes, labels, route) };
}

function siteOf(shapes, labels, route) {
  return {
    name: 'inside', aria: 'A floor of a building', look: 'oldTown', light: '#f2b544',
    points: { van: route[0], perch: route[0], target: route.at(-1) },
    paths: { in: [route[0], route[1]], inside: route.slice(1, -1), target: route.slice(-2), out: [...route].reverse() },
    views: { in: [0, 0, 360, 240], inside: [0, 0, 360, 240], target: [0, 0, 360, 240] },
    posts: { in: route[1], inside: route.at(-2), target: route.at(-1) },
    sight: { rifle: [route[0], route[0], route[0]], drone: [route[0], [4, 236], [356, 236], [356, 4]] },
    shapes, labels,
  };
}

// ---- the building: ground floor, then up the stairs ----
const SEED = process.argv[3] ?? 'kidnap-finale';
const g = groundFloor(SEED);
const u = upperFloor(SEED, g.upRoom, 1);
const FLOORS = [g, u];
const data = FLOORS.map((f) => ({ title: f.title, rooms: f.rooms, doors: f.doors, route: f.route, hall: f.hall ?? -1 }));
const svgs = FLOORS.map((f) => sitePlanSvg({ site: f.site, clean: true }).replace(/<g class="sp-fx"><\/g>/, '<g class="sp-fx"></g><g class="dk-layer"></g>'));

const page = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Inside, in the dark · mockup</title><style>${css}
  body { margin: 0; padding: 16px; background: #0a0c0f; color: #d8deea; font-family: Inter, system-ui, sans-serif; }
  h1 { font-family: Rajdhani, sans-serif; letter-spacing: .12em; text-transform: uppercase; font-size: 22px; margin: 0 0 4px; }
  .lede { color: #8a93a6; max-width: 72ch; margin: 0 0 16px; font-size: 14px; line-height: 1.45; }
  .stage { position: relative; max-width: 760px; border: 1px solid #2a303b; clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%); background: #050608; }
  .stage .siteplan { width: 100%; height: auto; display: block; }
  .floor { position: absolute; inset: 0; opacity: 0; transition: opacity .6s; } .floor.on { position: relative; opacity: 1; }
  .floor:not(.on) { position: absolute; }
  .tag { position: absolute; right: 18px; bottom: 10px; font-family: Rajdhani, sans-serif; font-weight: 700; letter-spacing: .16em; font-size: 13px; color: #3ee6d4; border: 1px solid #3ee6d4; padding: 2px 8px; background: rgba(5,6,8,.75); }
  .stamp { position: absolute; inset: 0; display: grid; place-items: center; font-family: Rajdhani, sans-serif; font-weight: 700; letter-spacing: .3em; font-size: 34px; color: #e8ecf4; background: rgba(0,0,0,.8); opacity: 0; transition: opacity .35s; pointer-events: none; }
  .stamp.on { opacity: 1; }
  .feed { max-width: 760px; margin-top: 10px; font-size: 14px; color: #b9c0cf; min-height: 2.8em; border-left: 3px solid #f2d541; padding: 6px 10px; background: #12151b; }
  .feed b { color: #3ee6d4; font-family: Rajdhani, sans-serif; letter-spacing: .1em; }
  .stills { display: grid; grid-template-columns: 1fr; gap: 12px; max-width: 1400px; margin-top: 24px; }
  @media (min-width: 900px) { .stills { grid-template-columns: repeat(3, 1fr); } }
  .stills figcaption { font: 12px monospace; color: #8a93a6; margin-bottom: 4px; }
  .controls { margin: 10px 0; } .controls button { font: inherit; color: #3ee6d4; background: none; border: 1px solid #3ee6d4; padding: 10px 16px; min-height: 44px; cursor: pointer; }
</style></head><body>
<h1>Inside, in the dark · mockup</h1>
<p class="lede">No street, no outside: the whole map is one floor. Every room is dark until the crew walks in. An open door gives a glimpse of the room beyond, and a hallway lights only where they've walked. At the stairs the map changes to the floor above. The floors are generated, the same from the same seed.</p>
<div class="stage" id="stage">
  ${svgs.map((s, i) => `<div class="floor ${i === 0 ? 'on' : ''}" data-floor="${i}">${s}<div class="tag">${FLOORS[i].title.toUpperCase()}</div></div>`).join('')}
  <div class="stamp" id="stamp">UP TO 1/F</div>
</div>
<div class="feed" id="feed"></div>
<div class="controls"><button id="replay">Play again</button></div>
<script>
const FLOORS = ${JSON.stringify(data)};
const NS = 'http://www.w3.org/2000/svg';
const SPEED = 46; // map units a second
const inR = (p, q) => p[0] > q.x && p[0] < q.x + q.w && p[1] > q.y && p[1] < q.y + q.h;
const len = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
function el(tag, attrs, parent) { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent?.appendChild(e); return e; }

function setup(i) {
  const svg = document.querySelector('[data-floor="' + i + '"] svg');
  const f = FLOORS[i];
  const layer = svg.querySelector('.dk-layer');
  layer.innerHTML = '';
  const defs = el('defs', {}, layer);
  const blur = el('filter', { id: 'dkb' + i, x: '-50%', y: '-50%', width: '200%', height: '200%' }, defs); el('feGaussianBlur', { stdDeviation: 7 }, blur);
  const mask = el('mask', { id: 'dkm' + i, maskUnits: 'userSpaceOnUse', x: 0, y: 0, width: 360, height: 240 }, defs);
  el('rect', { width: 360, height: 240, fill: '#fff' }, mask);
  const holes = el('g', { filter: 'url(#dkb' + i + ')' }, mask);
  const rooms = f.rooms.map((q, k) => k === f.hall ? null : el('rect', { x: q.x - 2, y: q.y - 2, width: q.w + 4, height: q.h + 4, fill: '#000', opacity: 0, style: 'transition: opacity .7s' }, holes));
  const trail = el('g', {}, holes);
  const glimpses = el('g', {}, holes);
  el('rect', { width: 360, height: 240, fill: '#030406', opacity: .99, mask: 'url(#dkm' + i + ')' }, layer);
  // light from the crew's torches, over the dark
  const torch = el('circle', { r: 26, fill: 'url(#dkt' + i + ')', style: 'mix-blend-mode:screen' }, layer);
  const tg = el('radialGradient', { id: 'dkt' + i }, defs);
  el('stop', { offset: 0, 'stop-color': '#f2d27a', 'stop-opacity': .28 }, tg); el('stop', { offset: 1, 'stop-color': '#f2d27a', 'stop-opacity': 0 }, tg);
  const walked = el('polyline', { fill: 'none', stroke: '#3ee6d4', 'stroke-width': 1.6, 'stroke-opacity': .55, 'stroke-dasharray': '3 3' }, layer);
  const crew = [0, 1, 2].map((k) => el('circle', { r: 3.4, fill: ['#3ee6d4', '#ff5fa2', '#f2d541'][k], stroke: '#050608', 'stroke-width': 1 }, layer));
  return { f, rooms, trail, glimpses, torch, walked, crew, seen: new Set(), glimpsed: new Set(), lastTrail: null };
}

function along(route, d) {
  for (let i = 1; i < route.length; i++) { const l = len(route[i - 1], route[i]); if (d <= l) { const t = d / l; return [route[i - 1][0] + (route[i][0] - route[i - 1][0]) * t, route[i - 1][1] + (route[i][1] - route[i - 1][1]) * t]; } d -= l; }
  return route.at(-1);
}
const total = (route) => route.slice(1).reduce((s, p, i) => s + len(route[i], p), 0);
const LINES = [
  ['BACK OF THE SHOP', 'In through the back door. Dark, and it smells of old frying oil.'],
  ['KITCHEN', 'The kitchen: woks still on the burners, a fridge humming.'],
  ['DINING ROOM', 'Booths along the walls, chairs up on the tables.'],
  ['STORE', 'Sacks of rice and boxes of condensed milk, stacked to the ceiling.'],
  ['STAIRS UP', 'Stairs. Football on a radio somewhere above.'],
  ['HALLWAY', 'A hallway. Doors both sides, light under one of them.'],
  ['THE ROOM', 'There he is: zip-tied to a chair, alive.'],
];
function step(S, d) {
  const p = along(S.f.route, d);
  S.crew.forEach((c, k) => { const q = along(S.f.route, Math.max(0, d - k * 9)); c.setAttribute('cx', q[0]); c.setAttribute('cy', q[1]); });
  S.torch.setAttribute('cx', p[0]); S.torch.setAttribute('cy', p[1]);
  const pts = []; for (let x = 0; x <= d; x += 4) pts.push(along(S.f.route, x)); pts.push(p);
  S.walked.setAttribute('points', pts.map((q) => q.join(',')).join(' '));
  S.f.rooms.forEach((q, k) => {
    if (!inR(p, q)) return;
    if (k === S.f.hall) { if (!S.lastTrail || len(S.lastTrail, p) > 10) { el('circle', { cx: p[0], cy: p[1], r: 30, fill: '#000' }, S.trail); S.lastTrail = p; } }
    else if (!S.seen.has(k)) { S.seen.add(k); S.rooms[k].setAttribute('opacity', 1); }
  });
  S.f.doors.forEach((dp, k) => {
    if (S.glimpsed.has(k) || len(dp, p) > 26) return;
    S.glimpsed.add(k); el('circle', { cx: dp[0], cy: dp[1], r: 22, fill: '#000', opacity: .55 }, S.glimpses);
  });
  const here = S.f.rooms.findIndex((q, k) => inR(p, q) && (k === S.f.hall || true));
  return p;
}

let run = 0;
async function play() {
  const me = ++run;
  const stamp = document.getElementById('stamp'), feed = document.getElementById('feed');
  for (let i = 0; i < FLOORS.length; i++) {
    document.querySelectorAll('.floor').forEach((x) => x.classList.toggle('on', +x.dataset.floor === i));
    const S = setup(i); const T = total(S.f.route); const said = new Set();
    const t0 = performance.now();
    await new Promise((done) => {
      const tick = (now) => {
        if (me !== run) return;
        const d = Math.min(T, ((now - t0) / 1000) * SPEED);
        const p = step(S, d);
        // a line when they step into a named room
        const svg = document.querySelector('[data-floor="' + i + '"] svg');
        for (const [name, text] of LINES) {
          const lab = [...svg.querySelectorAll('.sp-label')].find((l) => l.textContent === name);
          if (!lab || said.has(name)) continue;
          const q = S.f.rooms.find((r) => Math.abs(r.x + 6 - +lab.getAttribute('x')) < 1 && Math.abs(r.y + 12 - +lab.getAttribute('y')) < 1) ?? (name === 'HALLWAY' ? S.f.rooms[S.f.hall] : null);
          if (q && inR(p, q)) { said.add(name); feed.innerHTML = '<b>' + name + '</b> · ' + text; }
        }
        if (d < T) requestAnimationFrame(tick); else done();
      };
      requestAnimationFrame(tick);
    });
    if (i < FLOORS.length - 1) { stamp.classList.add('on'); await new Promise((r) => setTimeout(r, 1100)); stamp.classList.remove('on'); }
  }
}
// for the screenshots: jump to a point (floor, share of the way)
window.jumpTo = (i, share) => {
  run++;
  document.querySelectorAll('.floor').forEach((x) => x.classList.toggle('on', +x.dataset.floor === i));
  const S = setup(i); const T = total(S.f.route);
  for (let d = 0; d <= T * share; d += 2) step(S, d);
};
document.getElementById('replay').onclick = play;
if (!location.hash.includes('still')) play();
</script>
</body></html>`;

const out = process.argv[2];
writeFileSync(`${out}.html`, page);
const browser = await chromium.launch();
const pg = await browser.newPage({ viewport: { width: 800, height: 900 }, deviceScaleFactor: 1 });
await pg.goto(`file://${out}.html#still`);
const shots = [[0, 0.12, '01-ground-in'], [0, 0.6, '02-ground-half'], [0, 1, '03-ground-stairs'], [1, 0.4, '04-upstairs-hall'], [1, 1, '05-upstairs-found']];
for (const [i, s, name] of shots) {
  await pg.evaluate(([i, s]) => window.jumpTo(i, s), [i, s]);
  await pg.waitForTimeout(900);
  await (await pg.$('#stage')).screenshot({ path: `${out}-${name}.png` });
}
await browser.close();
console.log('ok');
