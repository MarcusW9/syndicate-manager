// Design session (2026-10-28): the City map in the portraits' style, cheap versions of three
// directions for the owner to compare, each showing the "living city" readouts (jobs, heat,
// crew out, the safehouse) the owner picked for the screen. Writes
// drafts/prototypes/city-map-options.html. Run: node scripts/city-map-options.mjs
//
//   A  flat-lit top-down: the same map, redrawn as flat planes and blocks lit from the right
//   B  slanted 3D: the city turned and tilted, blocks standing up, lit faces on the right
//   C  district pictures: a flat street scene per district at the top of its card
//
// Everything here is a sketch: fake numbers, no game state.

import { writeFileSync } from 'node:fs';
import { MAP_SHAPES, MAP_W, MAP_H } from '../src/ui/citymap.js';
import { mix } from '../src/ui/art.js';

const S = MAP_SHAPES;
const SHADOW = '#1b2340';
const BG = '#0d1016';
const TURF = { oldTown: '#f2d541', docks: '#ff3d5f', nightMarket: '#b48cff', basin: '#ff9a3d', heights: '#3de8d8' };
const NAMES = { ironPeak: 'Iron Peak', heights: 'Glass Heights', oldTown: 'Old Town', nightMarket: 'Night Market', basin: 'Basin', amberReach: 'Amber Reach', docks: 'Docks', silt: 'Silt' };
const LOCKED = new Set(['ironPeak', 'amberReach', 'silt']);
// The living city, made up for the sketch: work, heat (0-3), crew out there, street talk.
const LIVE = {
  oldTown: { jobs: 1, heat: 1, home: true },
  docks: { jobs: 0, heat: 3, crew: 2, talk: true },
  nightMarket: { jobs: 1, heat: 0 },
  heights: { jobs: 0, heat: 0 },
  basin: { jobs: 0, heat: 2 },
};

function seeded(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const inPoly = ([x, y], poly) => {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i]; const [xj, yj] = poly[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
};
const d = (pts) => `M${pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('L')}Z`;

// Land, roughened once, as point lists (so B can project them).
const LAND = {
  island: S.coast(S.ISLAND, 3, 0.22), west: S.coast(S.WEST, 8, 0.3), mainland: S.coast(S.MAINLAND, 4, 0.2),
  amber: S.coast(S.AMBER, 5, 0.2, 3), mud: S.coast(S.MUDFLAT, 6, 0.3),
};
const LAND_OF = { ironPeak: S.ISLAND, heights: S.ISLAND, oldTown: S.ISLAND, nightMarket: S.ISLAND, basin: S.ISLAND, amberReach: S.AMBER, docks: S.MAINLAND, silt: S.MUDFLAT };

// Each district's blocks: size, how tall, how packed (what it's like, WORLD.md).
const GRAIN = {
  heights: { step: 15, w: [9, 13], h: [22, 40], keep: 0.8 },
  oldTown: { step: 8, w: [5, 7], h: [4, 9], keep: 0.85 },
  nightMarket: { step: 7, w: [4, 6], h: [3, 7], keep: 0.9 },
  basin: { step: 9, w: [6, 8], h: [10, 20], keep: 0.8 },
  ironPeak: { step: 14, w: [6, 9], h: [5, 8], keep: 0.5 },
  amberReach: { step: 10, w: [6, 8], h: [8, 14], keep: 0.8 },
  docks: { step: 9, w: [12, 16], h: [2, 4], keep: 0.55, long: true },
  silt: { step: 11, w: [3, 5], h: [1, 2], keep: 0.35 },
};

/** Footprints [{x, y, w, l, h}] for one district, seeded so they never change. */
function blocks(key, i) {
  const m = S.DISTRICT_MAP[key];
  const g = GRAIN[key];
  const rnd = seeded(100 + i);
  const xs = m.area.map((p) => p[0]); const ys = m.area.map((p) => p[1]);
  const out = [];
  for (let y = Math.max(0, Math.min(...ys)); y < Math.min(MAP_H, Math.max(...ys)); y += g.step) {
    for (let x = Math.max(0, Math.min(...xs)); x < Math.min(MAP_W, Math.max(...xs)); x += g.step) {
      if (rnd() > g.keep) continue;
      const w = g.w[0] + rnd() * (g.w[1] - g.w[0]);
      const l = g.long ? 4 + rnd() * 2 : w * (0.7 + rnd() * 0.5);
      const c = [x + w / 2, y + l / 2];
      if (!inPoly(c, m.area) || !inPoly(c, LAND_OF[key])) continue;
      if ((m.holes ?? []).some((h) => inPoly(c, h))) continue;
      if (key === 'basin' && inPoly(c, S.ring(138, 176, 36, 15, 24))) continue; // the racecourse
      if (key === 'heights' && inPoly(c, S.ring(138, 164, 58, 36, 12))) continue;
      out.push({ x, y, w, l, h: g.h[0] + rnd() * (g.h[1] - g.h[0]) });
    }
  }
  return out;
}
const KEYS = Object.keys(S.DISTRICT_MAP);
const ALL = KEYS.map((k, i) => ({ key: k, blocks: blocks(k, i) }));

/** The light a district's blocks catch: its turf neon, or a dead grey when locked. */
const lightOf = (key) => (LOCKED.has(key) ? '#5a6170' : TURF[key] ?? '#8a93a6');
const heatPips = (n) => `${'●'.repeat(n)}${'○'.repeat(3 - n)}`;
const readout = (key) => {
  if (LOCKED.has(key)) return 'LOCKED';
  const l = LIVE[key] ?? {};
  return [l.jobs ? `${l.jobs} JOB` : '', `HEAT ${heatPips(l.heat ?? 0)}`].filter(Boolean).join(' · ');
};

/** Labels, pins and readouts: the living-city layer, drawn the same way on A and B. */
function liveLayer(key, [x, y], { scale = 1 } = {}) {
  const l = LIVE[key] ?? {};
  const locked = LOCKED.has(key);
  const pins = [];
  if (l.home) pins.push(`<g transform="translate(${x - 34} ${y - 26})"><path d="M0 7 L7 0 L14 7 V15 H0 Z" fill="${BG}" /><path d="M2 8 L7 3 L12 8 V13 H2 Z" fill="#f2b544" /><rect x="5.5" y="9" width="3" height="4" fill="${BG}" /></g><text class="pin" x="${x - 27}" y="${y - 30}">HOME</text>`);
  if (l.crew) pins.push(`<g transform="translate(${x + 30} ${y - 30})"><path d="M0 -8 L8 0 L0 8 L-8 0 Z" fill="${BG}" stroke="#3de8d8" stroke-width="1.5" /><text class="pin pin--crew" x="0" y="3.5">${l.crew}</text></g><text class="pin" x="${x + 30}" y="${y - 41}">ON A JOB</text>`);
  if (l.talk) pins.push(`<circle class="talk" cx="${x}" cy="${y - 22}" r="3.5" />`);
  const tone = locked ? 'is-locked' : l.jobs ? 'has-work' : (l.heat ?? 0) >= 2 ? 'is-hot' : '';
  return `<g class="lbl ${tone}" style="font-size:${scale}em">${pins.join('')}
    <text class="lbl__name" x="${x}" y="${y}">${NAMES[key].toUpperCase()}</text>
    <text class="lbl__read" x="${x}" y="${y + 13}">${readout(key)}</text></g>`;
}

// --- A: flat-lit top-down ---------------------------------------------------------------
function optionA() {
  const land = '#151a22';
  const defs = KEYS.map((k) => `<clipPath id="a-${k}"><path d="${d(S.DISTRICT_MAP[k].area)}${(S.DISTRICT_MAP[k].holes ?? []).map(d).join('')}" clip-rule="evenodd" /></clipPath>
    <linearGradient id="a-glow-${k}" x1="1" x2="0" y1="0" y2="0"><stop offset="0" stop-color="${lightOf(k)}" stop-opacity="${LOCKED.has(k) ? 0 : 0.2}" /><stop offset="0.7" stop-color="${lightOf(k)}" stop-opacity="0" /></linearGradient>`).join('');
  const landPaths = [LAND.island, LAND.west, LAND.mainland, LAND.amber].map((p) => `<path d="${d(p)}" />`).join('');
  const districts = ALL.map(({ key, blocks: bs }) => {
    const L = lightOf(key);
    const top = mix(LOCKED.has(key) ? '#2a2f38' : '#2b3140', L, LOCKED.has(key) ? 0 : 0.14);
    const rnd = seeded(key.length * 7);
    const bx = bs.map((b) => {
      const s = Math.min(4, 1 + b.h / 10); // taller blocks throw longer shadows
      const win = !LOCKED.has(key) && b.w > 5 && rnd() < 0.5 ? `<rect x="${(b.x + b.w * 0.3).toFixed(1)}" y="${(b.y + b.l * 0.4).toFixed(1)}" width="1.2" height="1.2" fill="${L}" opacity="0.9" />` : '';
      return `<rect x="${(b.x - s).toFixed(1)}" y="${(b.y + s * 0.6).toFixed(1)}" width="${b.w.toFixed(1)}" height="${b.l.toFixed(1)}" fill="${mix(land, SHADOW, 0.6)}" />
        <rect x="${b.x.toFixed(1)}" y="${b.y.toFixed(1)}" width="${b.w.toFixed(1)}" height="${b.l.toFixed(1)}" fill="${top}" />
        <rect x="${(b.x + b.w - 1.3).toFixed(1)}" y="${b.y.toFixed(1)}" width="1.3" height="${b.l.toFixed(1)}" fill="${mix(top, L, 0.6)}" />${win}`;
    }).join('');
    return `<g clip-path="url(#a-${key})"><g clip-path="url(#a-land)">
      <rect width="${MAP_W}" height="${MAP_H}" fill="${mix(land, L, LOCKED.has(key) ? 0 : 0.05)}" />
      <rect width="${MAP_W}" height="${MAP_H}" fill="url(#a-glow-${key})" />${bx}</g></g>`;
  }).join('');
  const course = d(S.COURSE);
  return `<svg class="map" viewBox="0 0 ${MAP_W} ${MAP_H}" role="img" aria-label="Option A">
    <defs>${defs}<clipPath id="a-land">${landPaths}<path d="${d(LAND.mud)}" /></clipPath></defs>
    <rect width="${MAP_W}" height="${MAP_H}" fill="#070a0e" />
    <!-- The sea: no lines, just the harbour's light lying on the water in bands. -->
    ${[300, 318, 336].map((y, i) => `<rect x="${110 + i * 30}" y="${y}" width="${140 - i * 20}" height="1" fill="#3de8d8" opacity="${0.12 - i * 0.03}" />`).join('')}
    <!-- Cliffs: the land again, nudged down-left in shadow, so the coast has a lit edge and a dark one, no outline. -->
    <g transform="translate(-3 3)" fill="${mix('#151a22', SHADOW, 0.7)}">${[LAND.island, LAND.west, LAND.mainland, LAND.amber].map((p) => `<path d="${d(p)}" />`).join('')}</g>
    <g transform="translate(1.2 0)" fill="${mix('#151a22', '#3de8d8', 0.25)}">${[LAND.island, LAND.west, LAND.amber].map((p) => `<path d="${d(p)}" />`).join('')}</g>
    <g fill="#151a22">${[LAND.island, LAND.west, LAND.mainland, LAND.amber].map((p) => `<path d="${d(p)}" />`).join('')}</g>
    ${districts}
    <path d="${course}" fill="#2d4a2a" /><path d="${d(S.ring(138, 176, 27, 8, 24))}" fill="${BG}" opacity="0.5" />
    <path d="${course}" fill="none" stroke="#f7efc8" stroke-width="1.6" />
    ${S.PIERS.map((p) => `<path d="${d(p)}" fill="#20252e" /><rect x="${p[1][0] - 1.2}" y="${p[0][1]}" width="1.2" height="32" fill="${mix('#20252e', '#ff3d5f', 0.5)}" />`).join('')}
    ${KEYS.map((k) => liveLayer(k, S.DISTRICT_MAP[k].label)).join('')}
  </svg>`;
}

// --- B: slanted 3D ----------------------------------------------------------------------
// Turn the city 15 degrees, flatten it to 0.58 of its depth, and stand the blocks up.
const TH = (-15 * Math.PI) / 180;
const SQ = 0.58;
const rot = ([x, y]) => [x * Math.cos(TH) - y * Math.sin(TH), x * Math.sin(TH) + y * Math.cos(TH)];
const proj = (p, h = 0) => { const [x, y] = rot(p); return [x, y * SQ - h * 0.9]; };
function optionB() {
  const corners = [[0, 0], [MAP_W, 0], [MAP_W, MAP_H], [0, MAP_H]].map((p) => proj(p));
  const minX = Math.min(...corners.map((c) => c[0])); const maxX = Math.max(...corners.map((c) => c[0]));
  const minY = Math.min(...corners.map((c) => c[1])) - 40; const maxY = Math.max(...corners.map((c) => c[1]));
  const P = (pts, h) => d(pts.map((p) => proj(p, h)));
  const land = '#151a22';
  const ground = [LAND.island, LAND.west, LAND.mainland, LAND.amber];
  // Every box, sorted far to near so nearer ones paint over.
  const boxes = ALL.flatMap(({ key, blocks: bs }) => bs.map((b) => ({ key, ...b }))).sort((a, b) => rot([a.x + a.w, a.y + a.l])[1] - rot([b.x + b.w, b.y + b.l])[1]);
  const faces = boxes.map((b) => {
    const L = lightOf(b.key);
    const top = mix(LOCKED.has(b.key) ? '#2a2f38' : '#2e3445', L, LOCKED.has(b.key) ? 0 : 0.18);
    const fp = [[b.x, b.y], [b.x + b.w, b.y], [b.x + b.w, b.y + b.l], [b.x, b.y + b.l]];
    let out = '';
    for (let i = 0; i < 4; i++) {
      const a = fp[i]; const c = fp[(i + 1) % 4];
      const n = rot([c[1] - a[1], -(c[0] - a[0])]); // outward normal, turned
      if (n[1] <= 0) continue; // faces away from us
      const lit = n[0] > 0;
      const fill = lit ? mix(top, L, 0.5) : mix(top, SHADOW, 0.55);
      out += `<path d="${d([proj(a), proj(c), proj(c, b.h), proj(a, b.h)])}" fill="${fill}" />`;
      if (lit && b.h > 8 && !LOCKED.has(b.key)) { // a column of lit windows on the bright face
        const m = [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2];
        for (let k = 3; k < b.h - 2; k += 4) { const [wx, wy] = proj(m, k); out += `<rect x="${(wx - 0.6).toFixed(1)}" y="${(wy - 0.6).toFixed(1)}" width="1.2" height="1.2" fill="${L}" opacity="0.85" />`; }
      }
    }
    return out + `<path d="${P(fp, b.h)}" fill="${top}" />`;
  }).join('');
  const label = (k) => { const [x, y] = proj(S.DISTRICT_MAP[k].label, 30); return liveLayer(k, [x, y]); };
  return `<svg class="map" viewBox="${minX.toFixed(0)} ${minY.toFixed(0)} ${(maxX - minX).toFixed(0)} ${(maxY - minY).toFixed(0)}" role="img" aria-label="Option B">
    <rect x="${minX}" y="${minY}" width="${maxX - minX}" height="${maxY - minY}" fill="#070a0e" />
    ${ground.map((p) => `<path d="${P(p.map(([x, y]) => [x, y]), -5)}" fill="${mix(land, SHADOW, 0.7)}" />`).join('')}
    ${ground.map((p) => `<path d="${P(p)}" fill="${land}" />`).join('')}
    <path d="${P(LAND.mud)}" fill="#11151b" />
    ${KEYS.filter((k) => !LOCKED.has(k)).map((k) => `<path d="${P(S.DISTRICT_MAP[k].area)}" fill="${lightOf(k)}" opacity="0.05" clip-path="url(#b-land)" />`).join('')}
    <defs><clipPath id="b-land">${ground.map((p) => `<path d="${P(p)}" />`).join('')}</clipPath></defs>
    <path d="${P(S.COURSE)}" fill="#2d4a2a" /><path d="${P(S.COURSE)}" fill="none" stroke="#f7efc8" stroke-width="1.4" />
    ${faces}
    ${KEYS.map(label).join('')}
  </svg>`;
}

// --- C: district pictures ---------------------------------------------------------------
// Flat street scenes, 360x150, built like the portraits: dark ground, the district's light
// coming in from the right, planes for light and shadow, no outlines.
function scene(key) {
  const L = TURF[key];
  const id = `c-${key}`;
  const sky = `<defs><linearGradient id="${id}" x1="1" x2="0"><stop offset="0" stop-color="${L}" stop-opacity="0.3" /><stop offset="0.65" stop-color="${L}" stop-opacity="0" /></linearGradient></defs>
    <rect width="360" height="150" fill="${BG}" /><rect width="360" height="150" fill="url(#${id})" />`;
  const lit = (c, t = 0.45) => mix(c, L, t);
  const dark = (c, t = 0.45) => mix(c, SHADOW, t);
  const box = (x, y, w, h, c, edge = 3) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}" /><rect x="${x + w - edge}" y="${y}" width="${edge}" height="${h}" fill="${lit(c)}" />`;
  const rnd = seeded(key.length * 13);
  if (key === 'docks') {
    const cont = ['#7a3b2a', '#2f5d5a', '#4a4f5a', '#8a5a2a'];
    let s = sky;
    s += `<rect y="112" width="360" height="38" fill="#080b10" />${[118, 126, 136].map((y, i) => `<rect x="${200 + i * 20}" y="${y}" width="${120 - i * 30}" height="1.2" fill="${L}" opacity="${0.35 - i * 0.1}" />`).join('')}`;
    // Two cranes: a dark tower, a lit right edge, the boom out over the water.
    for (const [x, h] of [[70, 92], [250, 104]]) {
      s += `<rect x="${x}" y="${112 - h}" width="8" height="${h}" fill="${dark('#3a404c')}" /><rect x="${x + 6}" y="${112 - h}" width="2" height="${h}" fill="${lit('#3a404c', 0.6)}" />`;
      s += `<path d="M${x - 50} ${116 - h} H${x + 70} V${120 - h} H${x - 50} Z" fill="${dark('#3a404c', 0.3)}" /><rect x="${x - 50}" y="${116 - h}" width="120" height="1.2" fill="${lit('#3a404c', 0.6)}" />`;
      s += `<rect x="${x + 40}" y="${120 - h}" width="1" height="${h - 50}" fill="#5a606c" /><rect x="${x + 34}" y="${70 + (112 - h)}" width="13" height="8" fill="${cont[1]}" />`;
      s += `<circle cx="${x + 69}" cy="${118 - h}" r="1.6" fill="#ff3d5f" />`;
    }
    // Container stacks on the quay.
    for (let i = 0; i < 9; i++) {
      const x = 8 + i * 38 + rnd() * 6; const n = 1 + Math.floor(rnd() * 3);
      for (let k = 0; k < n; k++) s += box(x, 100 - k * 12, 34, 12, dark(cont[Math.floor(rnd() * 4)], 0.25));
    }
    s += `<rect y="111" width="360" height="3" fill="#20252e" />`;
    s += `<rect y="70" width="360" height="22" fill="#c9d3e0" opacity="0.05" />`; // harbour fog
    return s;
  }
  if (key === 'oldTown') {
    let s = sky;
    // Tenements climbing the hill, far ones darker.
    const rows = [[60, '#22262f', 0.5], [86, '#2c303a', 0.3], [112, '#363a44', 0.1]];
    for (const [base, c, t] of rows) {
      let x = -10;
      while (x < 360) {
        const w = 26 + rnd() * 22; const h = 30 + rnd() * 34;
        s += box(x, base - h + 40, w, h + 20, dark(c, t), 2.5);
        for (let wy = base - h + 46; wy < base + 52; wy += 9) for (let wx = x + 4; wx < x + w - 6; wx += 8) if (rnd() < 0.35) s += `<rect x="${wx.toFixed(1)}" y="${wy.toFixed(1)}" width="4" height="4" fill="${rnd() < 0.6 ? '#f2b544' : lit('#2c303a', 0.3)}" opacity="${0.5 + t}" />`;
        if (rnd() < 0.5) s += `<rect x="${x + w - 9}" y="${base - h + 52}" width="6" height="4" fill="#4a4f5a" />`; // an air-con box
        x += w + 2;
      }
    }
    // Laundry lines across the alley.
    for (const y of [70, 92]) {
      s += `<path d="M0 ${y} Q180 ${y + 10} 360 ${y}" stroke="#5a606c" stroke-width="0.6" fill="none" />`;
      for (let i = 0; i < 9; i++) { const x = 20 + i * 38 + rnd() * 10; s += `<rect x="${x}" y="${y + 2 + Math.sin(x / 57) * 4}" width="${7 + rnd() * 6}" height="${8 + rnd() * 6}" fill="${['#8a3a3a', '#3a5a7a', '#c9c2b0', '#5a7a4a'][i % 4]}" opacity="0.85" />`; }
    }
    s += `<circle cx="300" cy="118" r="4" fill="#ff3d5f" /><circle cx="300" cy="118" r="9" fill="#ff3d5f" opacity="0.15" />`; // a shrine lamp
    s += `<rect y="132" width="360" height="18" fill="#0a0d12" />${[140, 145].map((y) => `<rect x="${130}" y="${y}" width="200" height="1" fill="#f2b544" opacity="0.18" />`).join('')}`;
    return s;
  }
  // Night Market: stall awnings, neon signs, wok steam, a crowd.
  let s = sky;
  for (let x = -10; x < 360; x += 34 + rnd() * 10) { const h = 50 + rnd() * 40; s += box(x, 120 - h - 30, 32, h, dark('#262a35', 0.35), 2); }
  const neon = ['#b48cff', '#ff3d5f', '#3de8d8', '#f2b544'];
  for (let i = 0; i < 7; i++) { const x = 14 + i * 50 + rnd() * 10; const c = neon[i % 4]; s += `<rect x="${x}" y="${20 + rnd() * 30}" width="5" height="${18 + rnd() * 14}" fill="${c}" /><rect x="${x - 3}" y="18" width="11" height="40" fill="${c}" opacity="0.12" />`; }
  for (let i = 0; i < 6; i++) {
    const x = i * 62 + 4; const c = ['#7a2a3a', '#2a4a6a', '#5a3a7a'][i % 3];
    s += `<path d="M${x} 82 L${x + 56} 82 L${x + 50} 94 L${x + 6} 94 Z" fill="${c}" /><path d="M${x + 44} 82 L${x + 56} 82 L${x + 50} 94 L${x + 40} 94 Z" fill="${lit(c, 0.5)}" />`;
    s += `<rect x="${x + 8}" y="94" width="42" height="22" fill="${dark('#2c303a', 0.2)}" /><rect x="${x + 10}" y="96" width="38" height="3" fill="${lit('#2c303a', 0.4)}" />`;
  }
  s += `<path d="M118 92 Q112 70 122 52 Q130 40 124 26" stroke="#c9d3e0" stroke-width="7" fill="none" opacity="0.07" stroke-linecap="round" />`;
  for (let i = 0; i < 14; i++) { const x = rnd() * 360; const c = dark(['#3a2e2a', '#4a3a30', '#2a2f38'][i % 3], 0.3); s += `<circle cx="${x}" cy="${118 + rnd() * 4}" r="5" fill="${c}" /><path d="M${x - 9} 150 Q${x - 9} 124 ${x} 124 Q${x + 9} 124 ${x + 9} 150 Z" fill="${c}" /><path d="M${x + 3} 113 A5 5 0 0 1 ${x + 3} 123 Z" fill="${lit(c, 0.4)}" />`; }
  return s;
}
function card(key) {
  const l = LIVE[key] ?? {};
  return `<article class="dcard">
    <svg viewBox="0 0 360 150" class="dcard__pic" aria-hidden="true">${scene(key)}</svg>
    <div class="dcard__body">
      <h3>${NAMES[key]} <span class="turf" style="color:${TURF[key]}">${{ docks: 'Red Lantern turf', oldTown: 'Brass Anchor turf', nightMarket: 'Silver Fan turf' }[key]}</span></h3>
      <ul class="facts"><li><b>${l.jobs ?? 0}</b> job${l.jobs === 1 ? '' : 's'}</li><li>Heat <b>${heatPips(l.heat ?? 0)}</b></li>${l.crew ? `<li><b>${l.crew}</b> of yours here</li>` : ''}${l.home ? '<li><b>Home</b>: the safehouse</li>' : ''}</ul>
      ${l.talk ? '<p class="talk-line">Street talk: a Red Lantern boat came in light. Somebody is short a cargo.</p>' : ''}
    </div></article>`;
}

// --- page --------------------------------------------------------------------------------


const summary = `<aside class="summary">
  <h3>The city tonight</h3>
  <ul class="heat">${Object.entries(LIVE).map(([k, l]) => `<li><span>${NAMES[k]}</span><span class="bar"><i style="width:${(l.heat / 3) * 100}%;background:${l.heat >= 2 ? '#ff3d5f' : '#3de8d8'}"></i></span><span class="muted">${l.jobs ? `${l.jobs} job` : '—'}</span></li>`).join('')}</ul>
  <h3>Your people</h3><p class="muted">2 on a job in the Docks, back Thursday · 3 at the safehouse in Old Town</p>
  <h3>Places</h3><div class="places"><div class="place">Safehouse<br><span class="muted">Old Town</span></div><div class="place is-later">Bar · black market<br><span class="muted">later</span></div></div>
</aside>`;

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>City map options</title>
<style>
:root{--bg:#0a0c0f;--panel:#12151b;--panel2:#161a21;--line:#2a303b;--text:#e9ecf1;--muted:#8a93a6;--cyan:#3de8d8}
body{margin:0;background:var(--bg);color:var(--text);font:15px/1.45 system-ui,sans-serif;padding:16px;max-width:1180px}
h1,h2,h3{font-family:Rajdhani,'Arial Narrow',sans-serif;text-transform:uppercase;letter-spacing:.1em;margin:0 0 6px}h1{font-size:1.4rem}h2{font-size:1.1rem;color:var(--cyan)}h3{font-size:.9rem}
section{background:var(--panel);border:1px solid var(--line);padding:14px;margin:14px 0;clip-path:polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,0 100%)}
p{color:var(--muted);margin:0 0 10px}.muted{color:var(--muted)}
.row{display:flex;flex-wrap:wrap;gap:16px;align-items:flex-start}
.map{width:360px;max-width:100%;display:block;background:#070a0e}
.mapB{width:520px;max-width:100%}
.lbl text{font-family:Rajdhani,'Arial Narrow',sans-serif;text-anchor:middle;paint-order:stroke;stroke:#05070a;stroke-width:3px;stroke-linejoin:round}
.lbl__name{font-size:13px;font-weight:700;fill:#f2d541;letter-spacing:.08em}.lbl__read{font-size:10px;font-weight:600;fill:#a7b0c0;letter-spacing:.1em}
.lbl.has-work .lbl__read{fill:#3de8d8}.lbl.is-hot .lbl__read{fill:#ff6b85}.lbl.is-locked .lbl__name{fill:#7b8292}.lbl.is-locked .lbl__read{fill:#5a6170}
.pin{font-family:Rajdhani,sans-serif;font-size:8px;font-weight:700;fill:#e9ecf1;text-anchor:middle;letter-spacing:.12em}.pin--crew{font-size:10px;fill:#3de8d8}
.talk{fill:#f2d541}
.cap{font:600 .72rem Rajdhani,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);margin:4px 0}
.desk{display:grid;grid-template-columns:360px 1fr;gap:16px;align-items:start}
.summary{background:var(--panel2);border:1px solid var(--line);padding:14px}.summary h3{color:var(--cyan);margin-top:10px}
.heat{list-style:none;margin:0;padding:0;display:grid;gap:6px}.heat li{display:grid;grid-template-columns:110px 1fr 60px;gap:8px;align-items:center;font-size:.9rem}
.bar{height:6px;background:#20252e;display:block}.bar i{display:block;height:100%}
.places{display:grid;grid-template-columns:1fr 1fr;gap:8px}.place{background:#1b1f28;border:1px solid var(--line);padding:10px;font-family:Rajdhani,sans-serif;font-weight:700;letter-spacing:.08em;text-transform:uppercase;min-height:44px}.place.is-later{opacity:.5;border-style:dashed}
.cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,360px));gap:14px}
.dcard{background:var(--panel2);border:1px solid var(--line);clip-path:polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,0 100%)}
.dcard__pic{display:block;width:100%}.dcard__body{padding:10px 12px}.turf{font-size:.75rem;letter-spacing:.1em}
.facts{list-style:none;margin:0 0 6px;padding:0;display:flex;flex-wrap:wrap;gap:4px 14px;font-size:.9rem}.talk-line{color:#f2d541;font-size:.85rem;margin:0}
@media (max-width:760px){.desk{grid-template-columns:1fr}}
</style></head><body>
<h1>City map: three directions</h1>
<p>Cheap sketches to compare (2026-10-28). Same districts, same made-up night: one job in Old Town and one in the Night Market, the Docks hot with two of yours out there on a job, street talk in the Docks, home in Old Town. Labels carry the living-city readouts the owner picked: work, heat (three pips), crew out, the safehouse.</p>

<p>Today's map, for comparison, is in docs/screenshots/2026-10-28-owner-captures-city-map: glowing coasts, contour lines, a wire street grid, turf as coloured borders.</p>

<section id="optA"><h2>A · Flat-lit top-down</h2>
<p>The same map, redrawn like the portraits: no outlines, the coast is a lit edge on the right and a shadow cliff on the left; blocks are flat tops with a lit right side and a shadow cast down-left; each district glows from the right in its turf's colour (so turf reads as light, not a border). Locked districts go dead grey. Tapping works as today.</p>
<div class="desk">${optionA()}${summary}</div>
<p class="cap">Desktop: the map on the left, the city tonight on the right instead of "Tap a district".</p></section>

<section id="optB"><h2>B · Slanted 3D</h2>
<p>The city turned 15° and tilted: blocks stand up with a lit face on the right and a shadow face on the left, windows in the turf's light. Closest to the portraits and the site plans. It's wider than tall, so on a phone the whole city is smaller and the districts are smaller to tap.</p>
${optionB().replace('class="map"', 'class="map mapB"')}</section>

<section id="optC"><h2>C · District pictures</h2>
<p>A flat street scene per district, drawn like the portraits (dark ground, the turf's light from the right, planes, no outlines), at the top of the district card; the map itself stays simple. These could head job pages too. Three of the five drawn here.</p>
<div class="cards">${card('docks')}${card('oldTown')}${card('nightMarket')}</div></section>
</body></html>`;

writeFileSync(new URL('../drafts/prototypes/city-map-options.html', import.meta.url), html);
console.log('wrote drafts/prototypes/city-map-options.html');
