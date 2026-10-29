// District pictures (DESIGN.md, 2026-10-28/29; option C of the City map session): a street
// scene per district, drawn like the portraits: flat colour planes and hard light, the district
// gang's light from the right, no outlines. Shown at the top of the district card on the City
// screen. Pure strings, no DOM. Only the Docks is drawn so far; the others come one at a time.
//
// The Docks: the sky lit red from the right, Lantern Bay across the harbour (Glass Heights'
// cyan towers, Iron Peak behind, neon signs hanging off the old blocks), a flying car, the
// water and its reflections, two cranes with neon strip lights, the container stacks (one of
// them 409), sodium lamps, red lanterns, one runner looking at the box, rain and harbour fog.
// The signs' Chinese uses the system's CJK font, as the city's name does elsewhere.

import { mix } from './art.js';

const W = 720;
const H = 300;
const BG = '#0d1016';
const SHADOW = '#1b2340';
const RED = '#ff3d5f'; // Red Lantern turf: the light that falls on everything from the right
const SODIUM = '#f2b544';
const CYAN = '#3de8d8';
const VIOLET = '#b48cff';
const PINK = '#ff5fae';
const GREEN = '#5dff9b';
const QUAY = 236; // the quay's edge, where water meets concrete

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
let rnd = seeded(409); // reset by docksScene, so the picture is the same every time
const f = (n) => n.toFixed(1);
const lit = (c, t = 0.45) => mix(c, RED, t);
const dark = (c, t = 0.45) => mix(c, SHADOW, t);
const rect = (x, y, w, h, fill, extra = '') => `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" fill="${fill}" ${extra}/>`;
const poly = (pts, fill, extra = '') => `<path d="M${pts.map(([x, y]) => `${f(x)} ${f(y)}`).join('L')}Z" fill="${fill}" ${extra}/>`;

// --- sky ---------------------------------------------------------------------------------
function sky() {
  return `
    <linearGradient id="dk-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#07090d" /><stop offset="1" stop-color="#171622" /></linearGradient>
    <radialGradient id="dk-red" cx="1.05" cy="0.55" r="0.75"><stop offset="0" stop-color="${RED}" stop-opacity="0.42" /><stop offset="0.55" stop-color="${RED}" stop-opacity="0.08" /><stop offset="1" stop-color="${RED}" stop-opacity="0" /></radialGradient>
    <linearGradient id="dk-fog" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c9d3e0" stop-opacity="0" /><stop offset="0.5" stop-color="#c9d3e0" stop-opacity="0.09" /><stop offset="1" stop-color="#c9d3e0" stop-opacity="0" /></linearGradient>
    <linearGradient id="dk-cone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${SODIUM}" stop-opacity="0.32" /><stop offset="1" stop-color="${SODIUM}" stop-opacity="0" /></linearGradient>
    <radialGradient id="dk-glow"><stop offset="0" stop-color="${RED}" stop-opacity="0.55" /><stop offset="1" stop-color="${RED}" stop-opacity="0" /></radialGradient>
    <radialGradient id="dk-sodglow"><stop offset="0" stop-color="${SODIUM}" stop-opacity="0.5" /><stop offset="1" stop-color="${SODIUM}" stop-opacity="0" /></radialGradient>`;
}

// --- across the harbour --------------------------------------------------------------------
const FAR_BASE = 188;
let farLights = []; // [x, y, colour] for the water to reflect
function farShore() {
  let s = '';
  // Iron Peak: the hill behind the city, a few villas' lights on its flank.
  s += poly([[180, FAR_BASE], [250, 130], [300, 104], [330, 96], [362, 104], [420, 132], [480, 160], [520, FAR_BASE]], mix(BG, SHADOW, 0.35));
  s += poly([[330, 96], [362, 104], [420, 132], [480, 160], [520, FAR_BASE], [470, FAR_BASE], [400, 140], [350, 108]], mix(mix(BG, SHADOW, 0.35), RED, 0.12));
  for (let i = 0; i < 9; i++) { const x = 270 + rnd() * 170; const y = 112 + (Math.abs(x - 330) / 160) * 50 + rnd() * 18; s += rect(x, y, 1.4, 1.2, SODIUM, 'opacity="0.7"'); }
  // The city: low blocks everywhere, Glass Heights' towers in a cluster, a cyan edge on each.
  let x = -6;
  while (x < W) {
    const heights = x > 420 && x < 600;
    const w = heights ? 14 + rnd() * 12 : 10 + rnd() * 16;
    const h = heights ? 46 + rnd() * 54 : 12 + rnd() * 26;
    const c = mix(BG, SHADOW, heights ? 0.25 : 0.4);
    s += rect(x, FAR_BASE - h, w, h, c);
    s += rect(x + w - 1.6, FAR_BASE - h, 1.6, h, heights ? mix(c, CYAN, 0.45) : lit(c, 0.25));
    if (heights) {
      s += rect(x, FAR_BASE - h, w, 1.2, mix(c, CYAN, 0.6));
      if (rnd() < 0.5) s += rect(x + w / 2 - 0.6, FAR_BASE - h - 7, 1.2, 7, mix(c, CYAN, 0.3)) + rect(x + w / 2 - 1, FAR_BASE - h - 8, 2, 2, RED);
    }
    // Lit windows: sodium in the old blocks, cyan strips in the towers.
    for (let wy = FAR_BASE - h + 4; wy < FAR_BASE - 3; wy += heights ? 5 : 6) {
      for (let wx = x + 2; wx < x + w - 3; wx += heights ? 4 : 5) {
        if (rnd() < (heights ? 0.32 : 0.16)) {
          const col = heights ? CYAN : SODIUM;
          s += rect(wx, wy, heights ? 2 : 1.6, 1.3, col, `opacity="${(0.45 + rnd() * 0.45).toFixed(2)}"`);
          if (rnd() < 0.25) farLights.push([wx, wy, col]);
        }
      }
    }
    x += w + (rnd() < 0.3 ? 3 : 0.5);
  }
  // A big red Red Lantern sign on the waterfront, the strongest light over the water.
  s += rect(612, 150, 7, 30, mix(BG, SHADOW, 0.2)) + rect(607, 132, 16, 34, mix(RED, BG, 0.15)) + rect(609, 134, 12, 30, RED) + `<path d="M611 139h8M615 137v8M612 149h6l-1 4h-4zM611 158h8M613 155v8M617 155v8" stroke="#ffd0d8" stroke-width="1.1" fill="none" />` + `<circle cx="615" cy="149" r="26" fill="url(#dk-glow)" />`;
  farLights.push([615, 160, RED], [615, 150, RED]);
  return s;
}

// --- Hong Kong neon across the water ---------------------------------------------------------
// Signs jutting out over the old streets on the far shore, stacked and crowding each other: the
// pawnshop's 押, mahjong, a restaurant, a pharmacy, a goldsmith, a cha chaan teng (owner,
// 2026-10-29). Far away, so small, but bright, and each one in the water below.
const SIGNS = [
  { x: 34, y: 128, text: '押', col: RED, w: 10, h: 12 },
  { x: 58, y: 120, text: '麻雀', col: GREEN, w: 9, h: 22 },
  { x: 86, y: 132, text: '酒家', col: PINK, w: 9, h: 22 },
  { x: 116, y: 126, text: '藥房', col: CYAN, w: 9, h: 22 },
  { x: 214, y: 134, text: '金行', col: SODIUM, w: 9, h: 22 },
  { x: 262, y: 142, text: '茶餐廳', col: VIOLET, w: 9, h: 30 },
  { x: 352, y: 146, text: '押', col: RED, w: 9, h: 11 },
  { x: 666, y: 120, text: '夜總會', col: PINK, w: 9, h: 30 },
  { x: 706, y: 136, text: '麻雀', col: CYAN, w: 9, h: 22 },
];
function hkSigns() {
  let s = '';
  // The tenements they hang off: each sign juts from the right-hand corner of an old block.
  for (const g of SIGNS) {
    const bx = g.x - g.w / 2 - 22;
    const top = g.y - 10;
    const c = mix(BG, SHADOW, 0.32);
    s += rect(bx, top, 24, FAR_BASE - top, c) + rect(bx + 22.4, top, 1.6, FAR_BASE - top, lit(c, 0.3));
    for (let wy = top + 4; wy < FAR_BASE - 3; wy += 6) for (let wx = bx + 2; wx < bx + 20; wx += 5) if (rnd() < 0.3) s += rect(wx, wy, 1.6, 1.3, SODIUM, `opacity="${(0.4 + rnd() * 0.4).toFixed(2)}"`);
  }
  for (const g of SIGNS) {
    const chars = [...g.text];
    s += rect(g.x - g.w / 2 - 3, g.y - 3, g.w + 6, g.h + 6, g.col, 'opacity="0.18"'); // the glow
    s += rect(g.x - g.w / 2, g.y, g.w, g.h, '#0e0f14');
    s += `<rect x="${f(g.x - g.w / 2 + 0.6)}" y="${f(g.y + 0.6)}" width="${f(g.w - 1.2)}" height="${f(g.h - 1.2)}" fill="none" stroke="${g.col}" stroke-width="0.6" />`;
    const step = (g.h - 2) / chars.length;
    chars.forEach((c, i) => { s += `<text x="${f(g.x)}" y="${f(g.y + 1 + step * (i + 0.78))}" class="da-neon" fill="${g.col}" font-size="${f(Math.min(step * 0.86, g.w * 0.86))}" text-anchor="middle">${c}</text>`; });
    s += rect(g.x - 0.4, g.y + g.h, 0.8, 4, '#2b3038'); // its bracket
    farLights.push([g.x, g.y + g.h, g.col]);
  }
  return s;
}

// --- a flying car --------------------------------------------------------------------------
/** A VTOL car crossing the sky behind the cranes, heading left: dark hull, lit right edge,
 *  thrusters glowing underneath, a red tail light, a faint trail. */
function flyer(x, y, scale = 1) {
  const hull = '#232733';
  let s = `<g transform="translate(${x} ${y}) scale(${scale})">`;
  s += `<path d="M38 5 L120 4.4" stroke="#c9d3e0" stroke-width="0.6" opacity="0.12" />`; // its trail
  s += poly([[0, 6], [7, 2], [16, 0.5], [28, 0.5], [35, 3], [38, 6], [35, 9], [4, 9.5]], hull);
  s += poly([[28, 0.5], [35, 3], [38, 6], [35, 9], [33, 9], [35, 6], [32, 3], [26, 1.4]], lit(hull, 0.5)); // its lit side
  s += poly([[8, 2.4], [15, 1.2], [24, 1.2], [24, 4], [7, 4]], mix(hull, CYAN, 0.35)); // canopy
  s += rect(9, 2.4, 6, 0.6, mix('#ffffff', CYAN, 0.4), 'opacity="0.7"');
  s += rect(4, 6.4, 30, 0.7, CYAN, 'opacity="0.8"'); // a running light along the flank
  for (const tx of [6, 26]) s += rect(tx, 9.4, 7, 2.2, '#14171d') + `<ellipse cx="${tx + 3.5}" cy="13" rx="5" ry="2.6" fill="${CYAN}" opacity="0.28" /><ellipse cx="${tx + 3.5}" cy="12" rx="2.4" ry="1.1" fill="${CYAN}" opacity="0.8" />`;
  s += rect(36.6, 5, 1.6, 1.6, RED) + `<circle cx="37.4" cy="5.8" r="4" fill="url(#dk-glow)" />`;
  s += `<path d="M0 6 L-26 2 L-26 11 Z" fill="#f7efc8" opacity="0.08" />` + rect(0, 5.4, 1.4, 1.2, '#f7efc8'); // headlight
  return s + '</g>';
}

// --- water ---------------------------------------------------------------------------------
function water() {
  let s = rect(0, FAR_BASE, W, QUAY - FAR_BASE, '#080b11');
  s += rect(0, FAR_BASE, W, 2, mix('#080b11', RED, 0.18)); // the far shore's waterline
  // Reflections: each light breaks into short dashes straight below it, fading downwards.
  for (const [x, y, col] of farLights) {
    const len = col === RED ? 40 : 16 + rnd() * 18;
    for (let dy = 4; dy < len && FAR_BASE + dy < QUAY - 2; dy += 3 + rnd() * 2) {
      const w = (col === RED ? 10 : 3) * (0.6 + rnd() * 0.8);
      s += rect(x - w / 2 + (rnd() - 0.5) * 2, FAR_BASE + dy, w, 0.9, col, `opacity="${(0.55 * (1 - dy / len)).toFixed(2)}"`);
    }
  }
  // The ferry crossing: a low hull, a lit cabin, its own wake.
  s += poly([[90, 212], [146, 212], [140, 219], [96, 219]], dark('#2b3038', 0.3));
  s += rect(104, 205, 26, 7, '#2b3038') + rect(126, 205, 4, 7, lit('#2b3038', 0.4));
  for (let i = 0; i < 5; i++) s += rect(106 + i * 5, 207, 2.6, 2, SODIUM, 'opacity="0.85"');
  s += `<circle cx="140" cy="206" r="1.4" fill="${CYAN}" /><path d="M90 219 Q60 222 20 221" stroke="#c9d3e0" stroke-width="0.7" fill="none" opacity="0.18" />`;
  s += rect(98, 221, 40, 0.9, SODIUM, 'opacity="0.35"') + rect(104, 224, 26, 0.9, SODIUM, 'opacity="0.2"');
  return s;
}

// --- cranes --------------------------------------------------------------------------------
/** A ship-to-shore crane: two A-frame legs on the quay, a boom out over the water, a cab. */
/** neon: the colour of the strip lights along its boom and front leg (owner, 2026-10-29). */
function crane(x, top, reach, neon, signAt = 54) {
  const steel = '#3a404c';
  const sh = dark(steel, 0.35);
  const li = lit(steel, 0.55);
  let s = '';
  const legH = QUAY + 18 - top;
  // Back legs (further away, darker), then front legs.
  for (const [lx, c] of [[x + 6, dark(steel, 0.55)], [x + 44, sh]]) {
    s += rect(lx, top, 5, legH, c) + rect(lx + 3.6, top, 1.4, legH, lit(c, 0.4));
  }
  // Cross-bracing between the legs.
  for (let y = top + 18; y < QUAY; y += 34) s += `<path d="M${x + 9} ${y} L${x + 46} ${y + 30} M${x + 46} ${y} L${x + 9} ${y + 30}" stroke="${sh}" stroke-width="1.6" />`;
  s += rect(x + 2, top + 64, 52, 4, sh) + rect(x + 2, top + 64, 52, 1.2, li);
  // The boom: a truss girder, out over the water to the left, a short back-reach to the right.
  const by = top - 6;
  s += rect(x - reach, by, reach + 80, 7, sh) + rect(x - reach, by, reach + 80, 1.4, li) + rect(x + 78, by, 2, 7, li);
  let truss = '';
  for (let tx = x - reach; tx < x + 78; tx += 8) truss += `M${tx} ${by + 7}L${tx + 4} ${by}L${tx + 8} ${by + 7}`;
  s += `<path d="${truss}" stroke="${mix(sh, BG, 0.4)}" stroke-width="0.8" fill="none" />`;
  // The A-frame apex and its stays down to the boom tip.
  s += poly([[x + 8, top], [x + 30, top - 44], [x + 50, top]], 'none', '') + `<path d="M${x + 8} ${top} L${x + 30} ${top - 44} L${x + 50} ${top}" stroke="${sh}" stroke-width="3" fill="none" /><path d="M${x + 31} ${top - 43} L${x + 49} ${top}" stroke="${li}" stroke-width="1" />`;
  s += `<path d="M${x + 30} ${top - 44} L${x - reach + 6} ${by + 1} M${x + 30} ${top - 44} L${x + 78} ${by + 1}" stroke="#5a606c" stroke-width="0.7" />`;
  s += rect(x + 28, top - 48, 4, 4, RED) + `<circle cx="${x + 30}" cy="${top - 46}" r="10" fill="url(#dk-glow)" />`;
  // The trolley, its cab, and the spreader hanging on cables with a container on it.
  const tx = x - reach * 0.55;
  s += rect(tx, by + 7, 18, 9, steel) + rect(tx + 14, by + 7, 4, 9, li) + rect(tx + 3, by + 9, 8, 4, SODIUM, 'opacity="0.8"');
  s += `<path d="M${tx + 4} ${by + 16} V${by + 70} M${tx + 14} ${by + 16} V${by + 70}" stroke="#5a606c" stroke-width="0.6" />`;
  s += container(tx - 12, by + 70, 42, 16, '#2f5d5a');
  s += rect(x - reach + 2, by + 7, 2, 3, RED);
  // Neon strip lights: under the boom, up the front leg, and a sign on the machinery house, the
  // way Hong Kong cranes get dressed up at night.
  const glow = (gx, gy, gw, gh) => rect(gx - 2, gy - 2, gw + 4, gh + 4, neon, 'opacity="0.22"') + rect(gx, gy, gw, gh, neon);
  s += glow(x - reach + 4, by + 7.4, reach + 72, 0.9);
  s += glow(x + 47.8, top + 2, 0.9, QUAY - top - 4);
  s += glow(x + 6, top - 2.6, 44, 0.8);
  const sx = x + signAt;
  s += rect(sx, by + 8, 22, 12, '#14171d') + `<rect x="${sx + 1}" y="${by + 9}" width="20" height="10" fill="none" stroke="${neon}" stroke-width="0.7" />`
    + `<text x="${sx + 11}" y="${by + 16.6}" class="da-neon" fill="${neon}" font-size="6.5" text-anchor="middle">${neon === CYAN ? '安達' : '海港'}</text>`
    + `<rect x="${sx - 4}" y="${by + 4}" width="30" height="20" fill="${neon}" opacity="0.08" />`;
  return s;
}

// --- containers ----------------------------------------------------------------------------
/** One container side-on: corrugated face, a lit end on the right, and a shadow underneath. */
function container(x, y, w, h, colour, label = '') {
  const face = dark(colour, 0.22);
  let s = rect(x, y, w, h, face);
  let ribs = '';
  for (let rx = x + 3; rx < x + w - 6; rx += 3) ribs += `M${f(rx)} ${f(y + 1.5)}V${f(y + h - 1.5)}`;
  s += `<path d="${ribs}" stroke="${dark(colour, 0.45)}" stroke-width="0.8" />`;
  s += rect(x, y, w, 1.2, mix(face, '#ffffff', 0.08)); // the top rail catching a little sky
  s += rect(x + w - 5, y, 5, h, lit(colour, 0.5)); // the door end, facing the light
  s += `<path d="M${f(x + w - 3.4)} ${f(y + 2)}V${f(y + h - 2)}M${f(x + w - 1.6)} ${f(y + 2)}V${f(y + h - 2)}" stroke="${lit(colour, 0.25)}" stroke-width="0.5" />`;
  s += rect(x, y + h - 1.2, w, 1.2, dark(colour, 0.6));
  if (label) s += `<text x="${f(x + 6)}" y="${f(y + h - 4.5)}" class="da-stencil">${label}</text>`;
  return s;
}
function stacks() {
  const cols = ['#7a3b2a', '#2f5d5a', '#4a4f5a', '#8a5a2a', '#2a4a6a', '#6a2a33'];
  let s = '';
  // Back row (smaller, hazier), then the front row on the quay, with 409 in front.
  const rows = [
    { base: QUAY + 8, w: 44, h: 15, haze: 0.35, from: 230, to: 700 },
    { base: QUAY + 28, w: 62, h: 21, haze: 0, from: 230, to: 720 },
  ];
  for (const r of rows) {
    let x = r.from;
    while (x < r.to) {
      const n = 1 + Math.floor(rnd() * 3);
      for (let k = 0; k < n; k++) {
        const is409 = r.haze === 0 && k === 0 && x > 400 && x < 470;
        const c = is409 ? '#8a5a2a' : cols[Math.floor(rnd() * cols.length)];
        s += container(x, r.base - (k + 1) * r.h, r.w, r.h, r.haze ? mix(c, '#1a1e26', r.haze) : c, is409 ? 'AHX 409' : '');
      }
      x += r.w + (rnd() < 0.35 ? 18 : 3);
    }
  }
  return s;
}

// --- the quay ------------------------------------------------------------------------------
function quay() {
  let s = rect(0, QUAY, W, H - QUAY, '#14171d');
  s += rect(0, QUAY, W, 3, mix('#14171d', RED, 0.3)); // the quay's lip catching the light
  s += rect(0, QUAY + 3, W, 3, '#0b0d12');
  // Wet concrete: long faint streaks, and reflections of the lamps and lanterns.
  for (let i = 0; i < 26; i++) s += rect(rnd() * W, QUAY + 10 + rnd() * 50, 30 + rnd() * 80, 0.8, '#2a303b', `opacity="${(0.3 + rnd() * 0.4).toFixed(2)}"`);
  // Yellow lane markings, painted long ago.
  for (let x = 6; x < W; x += 70) s += poly([[x, 286], [x + 34, 286], [x + 30, 290], [x - 4, 290]], SODIUM, 'opacity="0.22"');
  // Bollards on the edge.
  for (const x of [30, 170, 330]) s += rect(x, QUAY - 7, 8, 9, '#2b3038') + rect(x + 6, QUAY - 7, 2, 9, lit('#2b3038', 0.5)) + rect(x - 1, QUAY - 9, 10, 2.5, '#3a404c');
  return s;
}
function lamps() {
  let s = '';
  for (const x of [196, 372]) {
    s += poly([[x - 4, 104], [x + 12, 104], [x + 50, QUAY + 40], [x - 42, QUAY + 40]], 'url(#dk-cone)');
    s += rect(x, 104, 3, QUAY + 30 - 104, '#2b3038') + rect(x + 2, 104, 1, QUAY + 30 - 104, lit('#2b3038', 0.5));
    s += rect(x - 6, 100, 16, 4, '#3a404c') + rect(x - 4, 104, 12, 2, SODIUM) + `<circle cx="${x + 2}" cy="105" r="16" fill="url(#dk-sodglow)" />`;
    s += rect(x - 14, QUAY + 44, 34, 1.2, SODIUM, 'opacity="0.3"') + rect(x - 6, QUAY + 50, 18, 1, SODIUM, 'opacity="0.2"');
  }
  return s;
}
/** Red paper lanterns on a wire between the crane leg and a post: Red Lantern turf, plainly. */
function lanterns() {
  const x0 = 470; const y0 = 150; const x1 = 712; const y1 = 136;
  let s = `<path d="M${x0} ${y0} Q${(x0 + x1) / 2} ${y0 + 26} ${x1} ${y1}" stroke="#2b3038" stroke-width="0.8" fill="none" />`;
  for (let i = 1; i < 9; i++) {
    const t = i / 9;
    const x = x0 + (x1 - x0) * t;
    const y = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * (y0 + 26) + t * t * y1;
    s += `<circle cx="${f(x)}" cy="${f(y + 7)}" r="11" fill="url(#dk-glow)" opacity="0.7" />`;
    s += rect(x - 0.4, y, 0.8, 3, '#2b3038') + `<rect x="${f(x - 4)}" y="${f(y + 3)}" width="8" height="10" rx="3.5" fill="#d42a48" /><rect x="${f(x + 1)}" y="${f(y + 3)}" width="3" height="10" rx="1.5" fill="${mix(RED, '#ffd0d8', 0.35)}" />`;
    s += rect(x - 2, y + 2.4, 4, 1.2, '#1a1e26') + rect(x - 2, y + 12.6, 4, 1.2, '#1a1e26') + rect(x - 0.3, y + 13.6, 0.6, 3, SODIUM);
  }
  return s;
}

// --- the runner -----------------------------------------------------------------------------
/** One of yours, back to us, hood up, looking at 409: flat planes, the red rim on the right. */
function runner() {
  const x = 392; const y = QUAY + 50;
  const coat = '#232733';
  const skin = '#8a5a3c';
  let s = `<ellipse cx="${x + 2}" cy="${y + 1}" rx="15" ry="2.6" fill="#05070a" opacity="0.6" />`;
  s += poly([[x - 8, y], [x - 6, y - 26], [x - 1, y - 26], [x, y]], dark(coat, 0.5)) + poly([[x + 1, y], [x + 2, y - 26], [x + 7, y - 26], [x + 9, y]], dark(coat, 0.35)); // legs
  s += poly([[x - 12, y - 24], [x - 13, y - 50], [x - 8, y - 60], [x + 8, y - 60], [x + 13, y - 50], [x + 12, y - 24]], coat); // coat
  s += poly([[x + 6, y - 60], [x + 13, y - 50], [x + 12, y - 24], [x + 8, y - 24], [x + 9, y - 50]], lit(coat, 0.5)); // its lit side
  s += poly([[x - 12, y - 24], [x - 13, y - 50], [x - 9, y - 56], [x - 7, y - 24]], dark(coat, 0.45));
  s += `<path d="M${x - 7} ${y - 60} Q${x - 9} ${y - 74} ${x} ${y - 75} Q${x + 9} ${y - 74} ${x + 8} ${y - 60} Z" fill="${dark(coat, 0.15)}" />`; // hood
  s += `<path d="M${x + 3} ${y - 74} Q${x + 9} ${y - 72} ${x + 8} ${y - 60} L${x + 5} ${y - 60} Q${x + 7} ${y - 70} ${x + 3} ${y - 74} Z" fill="${lit(coat, 0.6)}" />`;
  s += poly([[x + 12, y - 44], [x + 15, y - 30], [x + 13, y - 29], [x + 10, y - 42]], lit(skin, 0.4)); // a hand, out of the sleeve
  // The rifle across the back (the same idea as the portraits' option B), barrel up and right.
  s += `<path d="M${x - 14} ${y - 34} L${x + 16} ${y - 66}" stroke="#2b3038" stroke-width="3" stroke-linecap="round" /><path d="M${x - 13} ${y - 35} L${x + 17} ${y - 67}" stroke="${lit('#2b3038', 0.5)}" stroke-width="0.8" />`;
  return s;
}

// --- weather ---------------------------------------------------------------------------------
function weather() {
  let rain = '';
  for (let i = 0; i < 140; i++) { const x = rnd() * (W + 40); const y = rnd() * H; const l = 6 + rnd() * 8; rain += `M${f(x)} ${f(y)}l${f(-l * 0.25)} ${f(l)}`; }
  return `<rect x="0" y="150" width="${W}" height="80" fill="url(#dk-fog)" /><rect x="0" y="200" width="${W}" height="60" fill="url(#dk-fog)" opacity="0.7" />
    <path d="${rain}" stroke="#c9d3e0" stroke-width="0.5" opacity="0.16" />`;
}

let docksCache = null;
/** The Docks at night (720×300), drawn once and kept: the same picture every time. */
export function docksScene() {
  if (docksCache) return docksCache;
  rnd = seeded(409);
  farLights = [];
  docksCache = `<svg viewBox="0 0 ${W} ${H}" class="scene" role="img" aria-label="The Docks at night: cranes over the harbour, container stacks, red lanterns, one of your crew looking at container 409">
    <defs>${sky()}</defs>
    <rect width="${W}" height="${H}" fill="url(#dk-sky)" />
    <rect width="${W}" height="${H}" fill="url(#dk-red)" />
    ${flyer(250, 30, 1)}
    ${flyer(598, 108, 0.42)}
    ${farShore()}
    ${hkSigns()}
    ${water()}
    ${crane(520, 70, 230, CYAN)}
    ${crane(140, 92, 120, VIOLET, -30)}
    ${quay()}
    ${lamps()}
    ${stacks()}
    ${lanterns()}
    ${runner()}
    <rect width="${W}" height="${H}" fill="url(#dk-red)" opacity="0.35" />
    ${weather()}
  </svg>`;
  return docksCache;
}


// =============================================================================================
// The other four districts (owner, 2026-10-29: "let's start the other four"). Same frame, same
// rules: 720×300, flat planes, the gang's light from the right, no outlines. Shared helpers take
// the scene's light, so each district is lit by its own gang's colour.
// =============================================================================================

/** Helpers for one scene lit by `light`. */
function kit(light, seed) {
  const r = seeded(seed);
  const lt = (c, t = 0.45) => mix(c, light, t);
  const dk = (c, t = 0.45) => mix(c, SHADOW, t);
  /** A vertical neon sign: dark box, neon border, Chinese characters top to bottom, a glow. */
  const sign = (x, y, text, col, w = 9, h = null, size = null) => {
    const chars = [...text];
    const hh = h ?? chars.length * w * 1.05 + 2;
    const step = (hh - 2) / chars.length;
    let o = rect(x - w / 2 - 3, y - 3, w + 6, hh + 6, col, 'opacity="0.18"') + rect(x - w / 2, y, w, hh, '#0e0f14');
    o += `<rect x="${f(x - w / 2 + 0.6)}" y="${f(y + 0.6)}" width="${f(w - 1.2)}" height="${f(hh - 1.2)}" fill="none" stroke="${col}" stroke-width="0.6" />`;
    chars.forEach((c, i) => { o += `<text x="${f(x)}" y="${f(y + 1 + step * (i + 0.8))}" class="da-neon" fill="${col}" font-size="${f(size ?? Math.min(step * 0.86, w * 0.86))}" text-anchor="middle">${c}</text>`; });
    return o;
  };
  /** A horizontal neon sign. */
  const hsign = (x, y, text, col, size = 7) => {
    const w = [...text].length * size + 6;
    return rect(x - 3, y - 3, w + 6, size + 9, col, 'opacity="0.16"') + rect(x, y, w, size + 3, '#0e0f14')
      + `<rect x="${f(x + 0.6)}" y="${f(y + 0.6)}" width="${f(w - 1.2)}" height="${f(size + 1.8)}" fill="none" stroke="${col}" stroke-width="0.6" />`
      + `<text x="${f(x + w / 2)}" y="${f(y + size + 0.6)}" class="da-neon" fill="${col}" font-size="${size}" text-anchor="middle">${text}</text>`;
  };
  /** One of yours, back to us, hood up, rifle across the back (as on the Docks). */
  const person = (x, y, coat = '#232733', scale = 1) => {
    let o = `<g transform="translate(${x} ${y}) scale(${scale})"><ellipse cx="2" cy="1" rx="15" ry="2.6" fill="#05070a" opacity="0.6" />`;
    o += poly([[-8, 0], [-6, -26], [-1, -26], [0, 0]], dk(coat, 0.5)) + poly([[1, 0], [2, -26], [7, -26], [9, 0]], dk(coat, 0.35));
    o += poly([[-12, -24], [-13, -50], [-8, -60], [8, -60], [13, -50], [12, -24]], coat);
    o += poly([[6, -60], [13, -50], [12, -24], [8, -24], [9, -50]], lt(coat, 0.5)) + poly([[-12, -24], [-13, -50], [-9, -56], [-7, -24]], dk(coat, 0.45));
    o += `<path d="M-7 -60 Q-9 -74 0 -75 Q9 -74 8 -60 Z" fill="${dk(coat, 0.15)}" /><path d="M3 -74 Q9 -72 8 -60 L5 -60 Q7 -70 3 -74 Z" fill="${lt(coat, 0.6)}" />`;
    o += `<path d="M-14 -34 L16 -66" stroke="#2b3038" stroke-width="3" stroke-linecap="round" /><path d="M-13 -35 L17 -67" stroke="${lt('#2b3038', 0.5)}" stroke-width="0.8" />`;
    return o + '</g>';
  };
  /** A crowd figure seen from behind: head and shoulders, rim-lit on the right. */
  const figure = (x, y, c, h = 26) => {
    const w = h * 0.36;
    return `<circle cx="${f(x)}" cy="${f(y - h + w * 0.55)}" r="${f(w * 0.55)}" fill="${c}" />`
      + `<path d="M${f(x - w)} ${f(y)} Q${f(x - w)} ${f(y - h * 0.62)} ${f(x)} ${f(y - h * 0.64)} Q${f(x + w)} ${f(y - h * 0.62)} ${f(x + w)} ${f(y)} Z" fill="${c}" />`
      + `<path d="M${f(x + w * 0.35)} ${f(y - h * 0.62)} Q${f(x + w)} ${f(y - h * 0.6)} ${f(x + w)} ${f(y)} L${f(x + w * 0.7)} ${f(y)} Q${f(x + w * 0.7)} ${f(y - h * 0.55)} ${f(x + w * 0.35)} ${f(y - h * 0.62)} Z" fill="${lt(c, 0.5)}" />`;
  };
  /** Rain and a band of mist. */
  const rain = (n = 120, opacity = 0.14) => {
    let d = '';
    for (let i = 0; i < n; i++) { const x = r() * (W + 40); const y = r() * H; const l = 6 + r() * 8; d += `M${f(x)} ${f(y)}l${f(-l * 0.25)} ${f(l)}`; }
    return `<path d="${d}" stroke="#c9d3e0" stroke-width="0.5" opacity="${opacity}" />`;
  };
  /** The sky: dark, with the gang's light coming in from the right. */
  const sky = (id, strength = 0.38) => `<defs>
      <linearGradient id="${id}-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#07090d" /><stop offset="1" stop-color="${mix('#161622', light, 0.08)}" /></linearGradient>
      <radialGradient id="${id}-light" cx="1.05" cy="0.55" r="0.8"><stop offset="0" stop-color="${light}" stop-opacity="${strength}" /><stop offset="0.55" stop-color="${light}" stop-opacity="0.07" /><stop offset="1" stop-color="${light}" stop-opacity="0" /></radialGradient>
      <linearGradient id="${id}-mist" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c9d3e0" stop-opacity="0" /><stop offset="0.5" stop-color="#c9d3e0" stop-opacity="0.08" /><stop offset="1" stop-color="#c9d3e0" stop-opacity="0" /></linearGradient>
      <radialGradient id="${id}-glow"><stop offset="0" stop-color="${light}" stop-opacity="0.5" /><stop offset="1" stop-color="${light}" stop-opacity="0" /></radialGradient>
      <radialGradient id="${id}-fire"><stop offset="0" stop-color="#ff9a3d" stop-opacity="0.55" /><stop offset="1" stop-color="#ff9a3d" stop-opacity="0" /></radialGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#${id}-sky)" /><rect width="${W}" height="${H}" fill="url(#${id}-light)" />`;
  /** A block of windows: lit at random in the given colours. */
  const windows = (x, y, w, h, cols, chance = 0.3, gw = 5, gh = 6, ww = 2, wh = 1.6) => {
    let o = '';
    for (let wy = y + 3; wy < y + h - 3; wy += gh) for (let wx = x + 2; wx < x + w - 3; wx += gw) if (r() < chance) o += rect(wx, wy, ww, wh, cols[Math.floor(r() * cols.length)], `opacity="${(0.45 + r() * 0.45).toFixed(2)}"`);
    return o;
  };
  /** A mahjong parlour's window: green table light, a hanging lamp, the players' heads. */
  const mahjong = (x, y, w = 56, h = 22) => {
    let o = rect(x - 2, y - 2, w + 4, h + 4, '#14171d') + rect(x, y, w, h, '#0f2a1c') + rect(x, y + h * 0.55, w, h * 0.45, '#5dff9b', 'opacity="0.35"');
    o += `<path d="M${x + w / 2} ${y} V${y + 5}" stroke="#2b3038" stroke-width="0.6" /><path d="M${x + w / 2 - 5} ${y + 8} L${x + w / 2 + 5} ${y + 8} L${x + w / 2 + 3} ${y + 5} L${x + w / 2 - 3} ${y + 5} Z" fill="#5dff9b" />`;
    o += `<path d="M${x + w / 2 - 5} ${y + 8} L${x + w / 2 - 12} ${y + h} L${x + w / 2 + 12} ${y + h} L${x + w / 2 + 5} ${y + 8} Z" fill="#5dff9b" opacity="0.12" />`;
    for (const k of [0.18, 0.4, 0.62, 0.84]) o += `<circle cx="${f(x + w * k)}" cy="${f(y + h * 0.6)}" r="2.4" fill="#0a140e" /><path d="M${f(x + w * k - 4)} ${f(y + h)} Q${f(x + w * k)} ${f(y + h * 0.66)} ${f(x + w * k + 4)} ${f(y + h)} Z" fill="#0a140e" />`;
    o += rect(x + w * 0.3, y + h - 3, w * 0.4, 3, '#1f6a40');
    o += `<path d="M${x + w / 3} ${y}V${y + h}M${x + w * 2 / 3} ${y}V${y + h}" stroke="#14171d" stroke-width="1" />`;
    return o;
  };
  return { r, lt, dk, sign, hsign, person, figure, rain, sky, windows, mahjong };
}

// --- Old Town · Brass Anchor sodium ----------------------------------------------------------
// Alley 4 at 3am: tenements stacked up the hillside, laundry and air-con boxes, the caged
// balconies; Auntie Fung's herbal tea shop with its warm doorway and a cup of bitter tea on the
// step for the blackout's ghosts; the Red Incense Shrine of To Dei Gung; the mahjong parlour
// upstairs; the rusted iron stairwell of Tenement Block 9; joss paper burning in a bin.
let oldTownCache = null;
export function oldTownScene() {
  if (oldTownCache) return oldTownCache;
  const LIGHT = '#f2d541';
  const { r, lt, dk, sign, hsign, person, rain, sky, windows, mahjong } = kit(LIGHT, 4);
  const STREET = 232;
  let s = sky('ot', 0.32);
  // The hill behind, with the tenements climbing it in rows, each further row darker.
  s += poly([[0, 70], [120, 52], [260, 64], [420, 40], [560, 58], [720, 46], [720, 200], [0, 200]], mix(BG, SHADOW, 0.4));
  for (const [base, t, hmin] of [[118, 0.55, 30], [150, 0.45, 34], [182, 0.32, 40]]) {
    let x = -8;
    while (x < W) {
      const w = 22 + r() * 22; const h = hmin + r() * 30; const c = dk('#2a2e38', t);
      s += rect(x, base - h, w, h + 40, c) + rect(x + w - 1.6, base - h, 1.6, h + 40, lt(c, 0.25)) + windows(x, base - h, w, h + 30, [LIGHT, '#f7efc8'], 0.22);
      x += w + 1;
    }
  }
  // The street row: five tenements, with Block 9 and its iron stairwell on the right.
  const blocks = [[0, 96], [118, 120], [230, 88], [336, 132], [478, 104], [586, 136]];
  for (let i = 0; i < blocks.length; i++) {
    const [x, w] = blocks[i];
    const top = 28 + r() * 40;
    const c = ['#3a3530', '#2f3438', '#3b3234', '#33363c', '#2c3036', '#3a332c'][i];
    s += rect(x, top, w, STREET - top, c) + rect(x + w - 3, top, 3, STREET - top, lt(c, 0.45)) + rect(x, top, w, 2, lt(c, 0.3));
    // Window bays with caged balconies, air-con boxes and the odd drying pole.
    for (let wy = top + 10; wy < STREET - 44; wy += 20) {
      for (let wx = x + 6; wx < x + w - 18; wx += 20) {
        const on = r() < 0.45;
        s += rect(wx, wy, 13, 11, on ? mix(LIGHT, '#c9772f', r() * 0.6) : '#14171d', on ? 'opacity="0.85"' : '');
        if (r() < 0.5) s += `<rect x="${wx - 1}" y="${wy - 1}" width="15" height="13" fill="none" stroke="${dk('#5a606c', 0.2)}" stroke-width="0.7" /><path d="M${wx + 2} ${wy - 1}v13M${wx + 6} ${wy - 1}v13M${wx + 10} ${wy - 1}v13" stroke="${dk('#5a606c', 0.3)}" stroke-width="0.5" />`;
        if (r() < 0.35) s += rect(wx + 14, wy + 6, 6, 5, '#4a4f5a') + rect(wx + 19, wy + 6, 1, 5, lt('#4a4f5a', 0.5));
        if (r() < 0.25) {
          s += `<path d="M${wx + 13} ${wy + 2}h16" stroke="#5a606c" stroke-width="0.6" />`;
          for (let k = 0; k < 3; k++) s += rect(wx + 15 + k * 4.5, wy + 2.5, 3.5, 5 + r() * 3, ['#8a3a3a', '#3a5a7a', '#c9c2b0', '#5a7a4a'][Math.floor(r() * 4)], 'opacity="0.9"');
        }
      }
    }
  }
  // Block 9's rusted iron stairwell zigzagging up its right-hand side.
  const sx = 700; const rust = '#6b3a24';
  for (let y = 60, k = 0; y < STREET - 10; y += 22, k++) {
    const a = k % 2 ? sx - 26 : sx; const b = k % 2 ? sx : sx - 26;
    s += `<path d="M${a} ${y} L${b} ${y + 22}" stroke="${rust}" stroke-width="2.4" /><path d="M${a + 1} ${y} L${b + 1} ${y + 22}" stroke="${lt(rust, 0.5)}" stroke-width="0.7" />`;
    s += rect(Math.min(a, b) - 3, y + 21, 32, 2, rust) + rect(Math.min(a, b) - 3, y + 21, 32, 0.7, lt(rust, 0.5));
  }
  s += `<path d="M676 56V${STREET}M704 56V${STREET}" stroke="${dk(rust, 0.2)}" stroke-width="1.2" />`;
  s += hsign(612, 44, '九座', LIGHT, 7);
  // Neon down the facades: herbal tea, bone-setter, pawnshop, the mahjong parlour.
  s += sign(110, 64, '涼茶', LIGHT) + sign(226, 52, '跌打', '#ff5fae') + sign(330, 70, '押', '#ff3d5f', 11) + sign(470, 58, '冰室', '#3de8d8') + sign(580, 76, '麻雀', '#5dff9b');
  // The mahjong parlour upstairs: green table light and players' shadows behind the glass.
  s += mahjong(372, 132);
  s += hsign(372, 116, '麻雀館', '#5dff9b', 6.5);
  // Auntie Fung's tea shop on the street: a lit doorway, jars on the shelves, her sign.
  s += rect(120, 186, 96, STREET - 186, '#1b120a') + rect(126, 192, 84, STREET - 192, mix('#f2b544', '#7a4a1a', 0.4), 'opacity="0.9"');
  for (let i = 0; i < 6; i++) s += rect(132 + i * 13, 198, 8, 10, ['#8a5a2a', '#5a3a1a', '#a06a2a'][i % 3]) + rect(132 + i * 13, 212, 8, 10, ['#5a3a1a', '#a06a2a', '#8a5a2a'][i % 3]);
  s += poly([[112, 184], [224, 184], [218, 192], [118, 192]], '#7a1f22') + poly([[200, 184], [224, 184], [218, 192], [196, 192]], lt('#7a1f22', 0.4));
  s += hsign(132, 168, '芬記涼茶', LIGHT, 8);
  s += rect(150, STREET - 3, 6, 3, '#e9e2cf') + rect(151, STREET - 5, 4, 2, '#7a4a1a'); // the cup of bitter tea on the step, for the ghosts
  // The Red Incense Shrine of To Dei Gung: a red altar box on the pavement, incense smoke.
  s += `<circle cx="278" cy="${STREET - 14}" r="22" fill="#ff3d5f" opacity="0.12" />` + rect(266, STREET - 24, 24, 24, '#7a1f22') + rect(285, STREET - 24, 5, 24, lt('#7a1f22', 0.4)) + rect(270, STREET - 20, 14, 11, '#ff3d5f', 'opacity="0.7"');
  s += `<text x="277" y="${STREET - 11.5}" class="da-neon" fill="#ffe2a8" font-size="6" text-anchor="middle">土地</text>`;
  for (const x of [272, 278, 284]) s += rect(x, STREET - 31, 0.7, 7, '#c9a46a') + `<circle cx="${x + 0.35}" cy="${STREET - 31}" r="0.8" fill="#ff9a3d" />`;
  s += `<path d="M278 ${STREET - 32} Q272 ${STREET - 50} 282 ${STREET - 64} Q290 ${STREET - 78} 280 ${STREET - 92}" stroke="#c9d3e0" stroke-width="3" fill="none" opacity="0.08" />`;
  // The street: wet concrete, the steps of the alley climbing off to the right.
  s += rect(0, STREET, W, H - STREET, '#121418') + rect(0, STREET, W, 2, lt('#121418', 0.3));
  for (let i = 0; i < 6; i++) s += rect(600 - i * 0 + i * 20, STREET + 40 - i * 8, 140, 8, i % 2 ? '#1a1d23' : '#16191e') + rect(600 + i * 20, STREET + 40 - i * 8, 140, 1, lt('#1a1d23', 0.3));
  for (const [x, w, col] of [[110, 40, LIGHT], [226, 20, '#ff5fae'], [330, 26, '#ff3d5f'], [470, 22, '#3de8d8'], [170, 60, '#f2b544']]) for (let k = 0; k < 4; k++) s += rect(x - w / 2 + (r() - 0.5) * 6, STREET + 12 + k * 9, w * (1 - k * 0.2), 1, col, `opacity="${(0.32 - k * 0.07).toFixed(2)}"`);
  // Joss paper burning in a metal bin: the fire, sparks, a figure feeding it.
  s += `<circle cx="372" cy="${STREET + 2}" r="30" fill="url(#ot-fire)" />` + rect(360, STREET - 14, 24, 18, '#2b2f36') + rect(380, STREET - 14, 4, 18, lt('#2b2f36', 0.4));
  s += `<path d="M362 ${STREET - 14} Q366 ${STREET - 30} 371 ${STREET - 20} Q374 ${STREET - 36} 378 ${STREET - 22} Q382 ${STREET - 28} 382 ${STREET - 14} Z" fill="#ff9a3d" /><path d="M366 ${STREET - 14} Q370 ${STREET - 24} 373 ${STREET - 17} Q376 ${STREET - 26} 379 ${STREET - 14} Z" fill="#ffe2a8" />`;
  for (let i = 0; i < 10; i++) s += rect(360 + r() * 28, STREET - 40 - r() * 40, 1.2, 1.2, '#ff9a3d', `opacity="${(0.4 + r() * 0.5).toFixed(2)}"`);
  s += person(420, STREET + 46);
  s += `<rect x="0" y="120" width="${W}" height="90" fill="url(#ot-mist)" />` + rain(110, 0.12);
  oldTownCache = `<svg viewBox="0 0 ${W} ${H}" class="scene" role="img" aria-label="Old Town at night: tenements up the hill, Auntie Fung's tea shop, the shrine, joss paper burning, one of your crew in the street">${s}</svg>`;
  return oldTownCache;
}

// --- The Night Market · Silver Fan violet ------------------------------------------------------
// Glow street: signs crowding over the lane, holo-ads flickering, the Neon Dragon dai pai dong's
// wok fire and steam, Madam Rao's Silk & Credit Emporium with saris hung in the light, the
// third-floor mahjong parlour, a crowd under umbrellas, everything doubled in the wet street.
let nightMarketCache = null;
export function nightMarketScene() {
  if (nightMarketCache) return nightMarketCache;
  const LIGHT = '#b48cff';
  const { r, lt, dk, sign, hsign, person, figure, rain, sky, windows, mahjong } = kit(LIGHT, 7);
  const STREET = 236;
  let s = sky('nm', 0.42);
  // Towers behind, and the street's own buildings close in.
  let x = -6;
  while (x < W) { const w = 26 + r() * 30; const h = 120 + r() * 90; const c = dk('#262a35', 0.35); s += rect(x, STREET - h, w, h, c) + rect(x + w - 1.6, STREET - h, 1.6, h, lt(c, 0.3)) + windows(x, STREET - h, w, h - 60, ['#b48cff', '#ff5fae', '#3de8d8'], 0.18); x += w + 2; }
  // Holo-ads: big translucent panels hanging in the air, flickering.
  for (const [hx, hy, hw, hh, col, txt] of [[60, 30, 90, 46, '#3de8d8', '新'], [470, 22, 110, 56, '#ff5fae', '夢'], [300, 60, 60, 34, '#5dff9b', '福']]) {
    s += `<rect x="${hx}" y="${hy}" width="${hw}" height="${hh}" fill="${col}" opacity="0.12" /><rect x="${hx}" y="${hy}" width="${hw}" height="${hh}" fill="none" stroke="${col}" stroke-width="0.6" opacity="0.5" />`;
    for (let ly = hy + 3; ly < hy + hh; ly += 3) s += rect(hx, ly, hw, 0.5, col, 'opacity="0.12"');
    s += `<text x="${hx + hw / 2}" y="${hy + hh * 0.78}" class="da-neon" fill="${col}" font-size="${hh * 0.72}" text-anchor="middle" opacity="0.55">${txt}</text>`;
  }
  // Signs crowding the lane from both sides, some horizontal over the street.
  for (const [sx2, sy, t, col] of [[30, 96, '當', '#ff3d5f'], [54, 84, '夜光街', '#b48cff'], [176, 100, '醫館', '#3de8d8'], [224, 88, '找換', '#f2d541'], [404, 98, '按金', '#ff5fae'], [612, 86, '大牌檔', '#5dff9b'], [690, 100, '銀扇', '#b48cff']]) s += sign(sx2, sy, t, col);
  s += hsign(250, 118, '絲綢信貸', '#f2d541', 7);
  // Cables strung across, sagging.
  for (const [y0, y1] of [[90, 104], [128, 120], [70, 84]]) s += `<path d="M0 ${y0} Q360 ${y0 + 26} 720 ${y1}" stroke="#14171d" stroke-width="0.8" fill="none" />`;
  // The Neon Dragon: a dragon drawn in green neon over the dai pai dong.
  s += `<path d="M520 118 Q540 98 560 112 Q580 126 600 110 Q616 98 630 108 L640 102 L636 112 L646 114 L634 118" stroke="#5dff9b" stroke-width="5" fill="none" opacity="0.22" stroke-linejoin="round" />`;
  s += `<path d="M520 118 Q540 98 560 112 Q580 126 600 110 Q616 98 630 108 L640 102 L636 112 L646 114 L634 118" stroke="#5dff9b" stroke-width="1.6" fill="none" stroke-linejoin="round" /><circle cx="636" cy="108" r="1.2" fill="#ff3d5f" />`;
  // The dai pai dong under it: canopy, the cook's wok fire and steam, folding tables.
  s += poly([[500, 140], [690, 140], [680, 152], [510, 152]], '#2a4a6a') + poly([[650, 140], [690, 140], [680, 152], [646, 152]], lt('#2a4a6a', 0.5));
  s += rect(520, 152, 160, STREET - 152, '#191b22') + rect(530, 160, 70, 40, mix('#ff9a3d', '#3a1a0a', 0.5), 'opacity="0.6"');
  s += `<circle cx="566" cy="196" r="26" fill="url(#nm-fire)" /><path d="M550 198 Q556 178 562 190 Q566 172 572 188 Q578 180 580 198 Z" fill="#ff9a3d" /><path d="M556 198 Q562 186 566 192 Q570 182 575 198 Z" fill="#ffe2a8" />`;
  s += `<ellipse cx="566" cy="200" rx="16" ry="3" fill="#2b2f36" /><path d="M566 176 Q556 150 572 132 Q584 116 570 96" stroke="#c9d3e0" stroke-width="8" fill="none" opacity="0.07" stroke-linecap="round" />`;
  for (const tx of [612, 648]) s += rect(tx, 206, 26, 3, '#7a1f22') + rect(tx + 2, 209, 2, STREET - 209, '#3a3f4a') + rect(tx + 22, 209, 2, STREET - 209, '#3a3f4a');
  // Madam Rao's Silk & Credit Emporium: a warm shop, saris hung from a rail in folds, a counter.
  s += rect(250, 140, 120, STREET - 140, '#1d1520') + rect(256, 146, 108, STREET - 146, mix('#f2d541', '#3a1a2a', 0.65));
  s += `<path d="M256 152 H364" stroke="#c9a46a" stroke-width="1.2" />`;
  [['#ff9a3d', 40], ['#d42a48', 56], ['#3de8d8', 34], ['#f2d541', 50], ['#b48cff', 44], ['#ff5fae', 58]].forEach(([c, len], i) => {
    const x0 = 262 + i * 16;
    s += `<path d="M${x0} 152 Q${x0 - 2} ${152 + len * 0.5} ${x0 + 1} ${152 + len} L${x0 + 12} ${152 + len - 3} Q${x0 + 13} ${152 + len * 0.5} ${x0 + 11} 152 Z" fill="${dk(c, 0.15)}" />`;
    s += `<path d="M${x0 + 4} 152 Q${x0 + 3} ${152 + len * 0.5} ${x0 + 5} ${152 + len - 1} L${x0 + 7} ${152 + len - 1} Q${x0 + 6} ${152 + len * 0.5} ${x0 + 7} 152 Z" fill="${dk(c, 0.45)}" />`;
    s += `<path d="M${x0 + 9} 152 Q${x0 + 11} ${152 + len * 0.5} ${x0 + 10} ${152 + len - 2} L${x0 + 12} ${152 + len - 3} Q${x0 + 13} ${152 + len * 0.5} ${x0 + 11} 152 Z" fill="${lt(c, 0.45)}" />`;
    s += rect(x0, 152 + len - 3, 12, 1.4, '#f2d541', 'opacity="0.7"'); // the gold border
  });
  s += rect(262, STREET - 16, 96, 16, '#3a2420') + rect(354, STREET - 16, 4, 16, lt('#3a2420', 0.4));
  // A row of stalls under string lights along the street.
  s += `<path d="M0 176 Q120 188 250 178 M370 180 Q440 192 500 182" stroke="#14171d" stroke-width="0.6" fill="none" />`;
  for (let bx = 6; bx < 250; bx += 12) s += `<circle cx="${bx}" cy="${178 + Math.sin(bx / 40) * 4}" r="1.3" fill="${['#f2d541', '#ff5fae', '#3de8d8'][bx % 3]}" />`;
  for (let bx = 374; bx < 500; bx += 12) s += `<circle cx="${bx}" cy="${184 + Math.sin(bx / 40) * 3}" r="1.3" fill="${['#f2d541', '#ff5fae', '#3de8d8'][bx % 3]}" />`;
  for (const [sx4, sw, col] of [[0, 70, '#7a2a3a'], [74, 80, '#2a4a6a'], [158, 86, '#5a3a7a'], [376, 118, '#2a5a4a']]) {
    s += poly([[sx4, 192], [sx4 + sw, 192], [sx4 + sw - 6, 202], [sx4 + 6, 202]], col) + poly([[sx4 + sw - 14, 192], [sx4 + sw, 192], [sx4 + sw - 6, 202], [sx4 + sw - 16, 202]], lt(col, 0.5));
    s += rect(sx4 + 6, 202, sw - 12, STREET - 202, '#1b1a22') + rect(sx4 + 10, 206, sw - 20, 14, mix('#f2d541', '#2a1a2a', 0.6), 'opacity="0.8"');
    for (let gx = sx4 + 12; gx < sx4 + sw - 14; gx += 7) s += rect(gx, 210, 5, 6, ['#3de8d8', '#ff5fae', '#f2d541', '#b48cff'][Math.floor(r() * 4)], 'opacity="0.7"'); // goods: cheap chrome, phone shells, charms
  }
  // The third-floor mahjong parlour: green light, the elders' silhouettes.
  s += mahjong(150, 150) + hsign(152, 136, '三樓雀館', '#5dff9b', 6);
  // The street: wet, every sign doubled in it.
  s += rect(0, STREET, W, H - STREET, '#100f16');
  for (const [rx, col, w] of [[30, '#ff3d5f', 12], [54, '#b48cff', 12], [176, '#3de8d8', 12], [224, '#f2d541', 12], [404, '#ff5fae', 12], [612, '#5dff9b', 14], [566, '#ff9a3d', 34], [310, '#f2d541', 60], [690, '#b48cff', 12]]) for (let k = 0; k < 5; k++) s += rect(rx - w / 2 + (r() - 0.5) * 4, STREET + 8 + k * 8, w * (1 - k * 0.15), 1, col, `opacity="${(0.4 - k * 0.07).toFixed(2)}"`);
  // The crowd, some under umbrellas with lit rims; one of yours among them.
  for (let i = 0; i < 24; i++) {
    const fx = r() * W; const fy = STREET + 18 + r() * 40; const c = dk(['#3a2e2a', '#2a2f38', '#3a3240', '#2e2a36'][i % 4], 0.25);
    s += figure(fx, fy, c, 30 + r() * 10);
    if (r() < 0.3) s += `<path d="M${f(fx - 14)} ${f(fy - 34)} Q${f(fx)} ${f(fy - 48)} ${f(fx + 14)} ${f(fy - 34)} Z" fill="#1b1d22" /><path d="M${f(fx - 14)} ${f(fy - 34)} Q${f(fx)} ${f(fy - 48)} ${f(fx + 14)} ${f(fy - 34)}" stroke="${['#3de8d8', '#ff5fae', '#b48cff'][i % 3]}" stroke-width="0.8" fill="none" />`;
  }
  s += person(452, STREET + 56);
  s += `<rect x="0" y="130" width="${W}" height="90" fill="url(#nm-mist)" />` + rain(130, 0.13);
  nightMarketCache = `<svg viewBox="0 0 ${W} ${H}" class="scene" role="img" aria-label="The Night Market: neon signs over a crowded lane, holo-ads, the Neon Dragon dai pai dong, saris in Madam Rao's shopfront, one of your crew in the crowd">${s}</svg>`;
  return nightMarketCache;
}

// --- Glass Heights · Veridian-Apex cyan --------------------------------------------------------
// Cold and clean: glass towers in blue light, Veridian-Apex Central Tower's crown, the Glass-
// Bridge Promenade strung between two towers, air-filter vents humming, security drones scanning
// the plaza, traffic lanes of flying cars, and one of yours, very much not on the list.
let heightsCache = null;
export function heightsScene() {
  if (heightsCache) return heightsCache;
  const LIGHT = '#3de8d8';
  const { r, lt, dk, hsign, person, sky, windows } = kit(LIGHT, 11);
  const PLAZA = 242;
  let s = sky('gh', 0.3);
  // Traffic lanes in the sky: long light trails, and a couple of cars on them.
  for (const [y0, y1, col, o] of [[40, 64, '#f7efc8', 0.22], [56, 50, '#ff3d5f', 0.18], [84, 96, '#3de8d8', 0.16]]) s += `<path d="M0 ${y0} Q360 ${(y0 + y1) / 2 - 18} 720 ${y1}" stroke="${col}" stroke-width="1" fill="none" opacity="${o}" />`;
  // Distant towers.
  for (let x = -10; x < W; x += 30 + r() * 20) { const w = 18 + r() * 14; const h = 90 + r() * 80; const c = dk('#1c2430', 0.4); s += rect(x, PLAZA - h - 30, w, h + 30, c) + rect(x + w - 1.2, PLAZA - h - 30, 1.2, h + 30, lt(c, 0.35)) + windows(x, PLAZA - h - 30, w, h, [LIGHT], 0.12, 4, 5, 2, 1.2); }
  // The near towers: glass curtain walls in a fine cyan grid, a cold lit edge on the right.
  const tower = (x, w, top, c = '#18222c') => {
    let o = rect(x, top, w, PLAZA - top, c);
    let grid = '';
    for (let gy = top + 6; gy < PLAZA; gy += 6) grid += `M${x} ${gy}h${w}`;
    for (let gx = x + 6; gx < x + w; gx += 8) grid += `M${gx} ${top}V${PLAZA}`;
    o += `<path d="${grid}" stroke="${LIGHT}" stroke-width="0.4" opacity="0.18" />` + windows(x, top, w, PLAZA - top, [LIGHT, '#e9f9ff'], 0.1, 8, 6, 6, 1.2);
    o += rect(x + w - 3, top, 3, PLAZA - top, lt(c, 0.55)) + rect(x, top, w, 1.5, lt(c, 0.7));
    return o;
  };
  s += tower(40, 96, 70) + tower(176, 70, 104, '#1a2028');
  // Veridian-Apex Central Tower: the tallest, a stepped crown, the logo glowing.
  s += tower(300, 130, 26, '#16212b');
  s += poly([[300, 26], [330, 6], [400, 6], [430, 26]], '#16212b') + poly([[400, 6], [430, 26], [424, 26], [396, 8]], lt('#16212b', 0.6));
  s += `<path d="M365 0 V6" stroke="${LIGHT}" stroke-width="1" /><circle cx="365" cy="1" r="1.5" fill="#ff3d5f" />`;
  s += `<circle cx="365" cy="52" r="18" fill="${LIGHT}" opacity="0.12" /><path d="M352 44 L365 64 L378 44 M358 44 L365 56 L372 44" stroke="${LIGHT}" stroke-width="2" fill="none" />`;
  s += `<text x="365" y="80" class="da-stencil" fill="${LIGHT}" text-anchor="middle" font-size="7" style="fill:${LIGHT}">VERIDIAN-APEX</text>`;
  s += tower(480, 110, 56) + tower(616, 104, 88, '#1a2028');
  // The Glass-Bridge Promenade: a lit glass tube between two towers, tiny people walking it.
  s += `<path d="M430 120 Q455 128 480 120" stroke="${LIGHT}" stroke-width="10" fill="none" opacity="0.12" />` + rect(430, 114, 50, 10, '#1d2a34') + rect(430, 114, 50, 10, LIGHT, 'opacity="0.18"') + rect(430, 123, 50, 1.2, LIGHT, 'opacity="0.8"');
  for (const px of [440, 452, 468]) s += rect(px, 116, 2, 6, '#0b1016');
  s += rect(136, 160, 40, 8, '#1d2a34') + rect(136, 160, 40, 8, LIGHT, 'opacity="0.15"') + rect(136, 167, 40, 1, LIGHT, 'opacity="0.7"');
  // The plaza: clean stone, planters, the clinic's sign, vents breathing filtered air.
  s += rect(0, PLAZA, W, H - PLAZA, '#141a20') + rect(0, PLAZA, W, 1.5, lt('#141a20', 0.5));
  for (let gx = 0; gx < W; gx += 40) s += `<path d="M${gx} ${PLAZA}L${gx - 60} ${H}" stroke="${LIGHT}" stroke-width="0.4" opacity="0.08" />`;
  for (const px of [60, 250, 560]) s += rect(px, PLAZA - 14, 60, 16, '#1d2a34') + rect(px + 56, PLAZA - 14, 4, 16, lt('#1d2a34', 0.4)) + `<path d="M${px + 2} ${PLAZA - 14} Q${px + 14} ${PLAZA - 34} ${px + 28} ${PLAZA - 16} Q${px + 40} ${PLAZA - 36} ${px + 58} ${PLAZA - 14} Z" fill="#1f4a3a" /><path d="M${px + 40} ${PLAZA - 30} Q${px + 50} ${PLAZA - 26} ${px + 58} ${PLAZA - 14} L${px + 52} ${PLAZA - 14} Q${px + 48} ${PLAZA - 24} ${px + 40} ${PLAZA - 30} Z" fill="${lt('#1f4a3a', 0.45)}" />`;
  s += hsign(484, 196, 'NEURAL CLINIC 1', LIGHT, 6);
  for (const vx of [150, 440, 660]) { s += rect(vx, PLAZA - 22, 26, 22, '#1a2129') + rect(vx + 22, PLAZA - 22, 4, 22, lt('#1a2129', 0.4)); for (let k = 0; k < 4; k++) s += rect(vx + 3, PLAZA - 19 + k * 5, 18, 2, '#0b1016'); s += `<path d="M${vx + 13} ${PLAZA - 22} Q${vx + 6} ${PLAZA - 40} ${vx + 16} ${PLAZA - 56}" stroke="#c9d3e0" stroke-width="6" fill="none" opacity="0.05" />`; }
  // Security drones over the plaza, one scanning a cone of light down onto the stone.
  const drone = (dx, dy, scan) => `${scan ? `<path d="M${dx} ${dy + 4} L${dx - 34} ${PLAZA + 30} L${dx + 34} ${PLAZA + 30} Z" fill="${LIGHT}" opacity="0.07" />` : ''}<ellipse cx="${dx}" cy="${dy}" rx="9" ry="3" fill="#1d2a34" /><rect x="${dx - 14}" y="${dy - 2}" width="28" height="1.4" fill="#2b3640" /><circle cx="${dx - 14}" cy="${dy - 1.3}" r="2.6" fill="${LIGHT}" opacity="0.3" /><circle cx="${dx + 14}" cy="${dy - 1.3}" r="2.6" fill="${LIGHT}" opacity="0.3" /><circle cx="${dx}" cy="${dy + 2}" r="1.3" fill="#ff3d5f" />`;
  s += drone(250, 150, true) + drone(590, 132, false) + drone(110, 120, false);
  s += person(268, PLAZA + 48, '#2a2622');
  s += `<rect x="0" y="${PLAZA - 40}" width="${W}" height="70" fill="url(#gh-mist)" />`;
  heightsCache = `<svg viewBox="0 0 ${W} ${H}" class="scene" role="img" aria-label="Glass Heights: glass towers in cold blue light, Veridian-Apex Central Tower, the Glass-Bridge Promenade, security drones over a clean plaza, one of your crew where they shouldn't be">${s}</svg>`;
  return heightsCache;
}

// --- The Basin · Racing Association floodlight orange -------------------------------------------
// Race night at Lantern Course: towers packed round the bowl, floodlight towers burning amber,
// the Old Stand with its pennants and its crowd, the odds board, horses coming round the turn
// under the lights, paper slips in the air, and one of yours at the rail.
let basinCache = null;
export function basinScene() {
  if (basinCache) return basinCache;
  const LIGHT = '#ff9a3d';
  const { r, lt, dk, sign, person, figure, sky, windows } = kit(LIGHT, 18);
  const RAIL = 218;
  let s = sky('ba', 0.36);
  // The bowl: towers rising on both sides, every balcony with a view of the course.
  for (let x = -6; x < W; x += 20 + r() * 14) {
    const edge = Math.abs(x - 360) / 360; const h = 60 + edge * 120 + r() * 30; const w = 18 + r() * 14; const c = dk('#262a35', 0.4);
    s += rect(x, 150 - h, w, h + 20, c) + rect(x + w - 1.4, 150 - h, 1.4, h + 20, lt(c, 0.3)) + windows(x, 150 - h, w, h, [LIGHT, '#f7efc8', '#3de8d8'], 0.25, 4, 5, 2, 1.3);
  }
  // Floodlight towers: lattice masts, banks of lamps, wide cones of light over the track.
  for (const fx of [80, 300, 520, 690]) {
    s += `<path d="M${fx - 40} 44 L${fx - 140} ${RAIL + 20} L${fx + 140} ${RAIL + 20} L${fx + 40} 44 Z" fill="#f7efc8" opacity="0.05" />`;
    s += `<path d="M${fx - 3} 40 V${RAIL} M${fx + 3} 40 V${RAIL}" stroke="#3a3f4a" stroke-width="1.4" />`;
    for (let y = 50; y < RAIL; y += 14) s += `<path d="M${fx - 3} ${y} L${fx + 3} ${y + 14} M${fx + 3} ${y} L${fx - 3} ${y + 14}" stroke="#3a3f4a" stroke-width="0.6" />`;
    s += rect(fx - 16, 30, 32, 12, '#2b2f36');
    for (let k = 0; k < 4; k++) s += rect(fx - 14 + k * 7.5, 32, 6, 8, '#f7efc8') ;
    s += `<circle cx="${fx}" cy="36" r="30" fill="url(#ba-glow)" />`;
  }
  // The odds board, in neon (owner, 2026-10-29): a double tube frame in pink and orange with a
  // wide glow, the race in pink, the prices in bright orange, the course's name over it in neon.
  const PINK2 = '#ff5fae';
  const glowText = (x, y, t, col, size, anchor = 'start') => `<text x="${x}" y="${y}" class="da-stencil" style="fill:${col};stroke:${col};stroke-width:2.4;opacity:0.25" font-size="${size}" text-anchor="${anchor}">${t}</text><text x="${x}" y="${y}" class="da-stencil" style="fill:${mix(col, '#ffffff', 0.35)};opacity:1" font-size="${size}" text-anchor="${anchor}">${t}</text>`;
  s += rect(358, 76, 158, 76, LIGHT, 'opacity="0.07"') + rect(364, 82, 146, 64, PINK2, 'opacity="0.08"');
  s += rect(370, 88, 134, 54, '#0b0a0f');
  s += `<rect x="370" y="88" width="134" height="54" fill="none" stroke="${PINK2}" stroke-width="3.5" opacity="0.25" /><rect x="370" y="88" width="134" height="54" fill="none" stroke="${mix(PINK2, '#ffffff', 0.3)}" stroke-width="1.1" />`;
  s += `<rect x="374" y="92" width="126" height="46" fill="none" stroke="${LIGHT}" stroke-width="3" opacity="0.22" /><rect x="374" y="92" width="126" height="46" fill="none" stroke="${mix(LIGHT, '#ffffff', 0.3)}" stroke-width="0.9" />`;
  s += glowText(437, 102, 'RACE 7 · WIN', PINK2, 6.5, 'middle');
  [['1', 'PEPPER', '5/2'], ['4', 'GOLD JUNK', '7/1'], ['7', 'LUCKY TAM', '9/1']].forEach(([n, name, odds], i) => { s += glowText(380, 113 + i * 9.5, `${n}  ${name}`, LIGHT, 7.5) + glowText(494, 113 + i * 9.5, odds, LIGHT, 7.5, 'end'); });
  s += `<text x="437" y="72" class="da-neon" fill="${PINK2}" font-size="15" text-anchor="middle" style="stroke:${PINK2};stroke-width:4;opacity:0.22">燈籠馬場</text><text x="437" y="72" class="da-neon" fill="${mix(PINK2, '#ffffff', 0.35)}" font-size="15" text-anchor="middle">燈籠馬場</text>`;
  s += sign(352, 92, '馬場', LIGHT, 12) + `<circle cx="352" cy="104" r="20" fill="${LIGHT}" opacity="0.1" />`;
  // The course: the turf under the lights, the white rail, the far rail, the inner field.
  s += poly([[0, 158], [720, 152], [720, RAIL], [0, RAIL]], '#1f4a2a') + poly([[0, 158], [720, 152], [720, 160], [0, 166]], lt('#1f4a2a', 0.3));
  s += rect(0, 162, W, 1.2, '#e9e2cf', 'opacity="0.7"') + rect(0, RAIL - 3, W, 2, '#f7efc8');
  for (let px = 6; px < W; px += 22) s += rect(px, RAIL - 3, 1.4, 12, '#e9e2cf');
  // Horses coming round under the lights, jockeys in silks.
  const horse = (hx, hy, silk, sc = 1) => {
    const coat = ['#5a3a24', '#2a1d16', '#7a5236'][Math.floor(r() * 3)];
    let o = `<g transform="translate(${hx} ${hy}) scale(${sc})">`;
    o += `<path d="M6 10 L-6 22 M10 10 L2 22 M28 10 L34 22 M32 10 L44 18" stroke="${dk(coat, 0.2)}" stroke-width="2.6" stroke-linecap="round" />`; // legs at full stretch
    o += `<path d="M0 6 Q2 0 14 0 L30 0 Q38 0 40 6 Q38 12 30 12 L10 12 Q2 12 0 6 Z" fill="${coat}" />`; // body
    o += `<path d="M2 4 L-8 -6 L-14 -4 L-12 0 L-6 0 L0 8 Z" fill="${coat}" />`; // neck and head, stretched out
    o += `<path d="M14 0 L30 0 Q38 0 40 6 L36 6 Q34 2 28 2 L14 2 Z" fill="${lt(coat, 0.5)}" />`;
    o += `<path d="M40 4 Q48 2 52 8" stroke="${dk(coat, 0.3)}" stroke-width="2" fill="none" />`; // tail
    o += `<path d="M14 -2 L22 -12 L28 -12 L26 -2 Z" fill="${silk}" /><circle cx="20" cy="-15" r="3" fill="${silk}" /><path d="M24 -12 L28 -12 L26 -2 L24 -2 Z" fill="${lt(silk, 0.4)}" />`;
    return o + '</g>';
  };
  s += horse(150, 176, '#d42a48', 0.9) + horse(200, 182, '#f2d541') + horse(236, 172, '#3de8d8', 0.85) + horse(282, 186, '#b48cff', 1.05);
  s += `<path d="M310 196 Q360 192 420 198" stroke="#c9b48a" stroke-width="6" fill="none" opacity="0.08" />`; // kicked-up dust
  // Camera drones filming the race (owner, 2026-10-29): little quadcopters pacing the horses, each
  // with its lens on them in a faint cone, rotors blurred, a red recording light.
  const camDrone = (dx, dy, ax, ay, sc = 1) => {
    let o = `<path d="M${dx} ${dy + 2 * sc} L${ax - 14} ${ay} L${ax + 14} ${ay} Z" fill="#f7efc8" opacity="0.05" />`;
    o += `<g transform="translate(${dx} ${dy}) scale(${sc})">`;
    for (const rx of [-8, 8]) o += `<ellipse cx="${rx}" cy="-3" rx="5.5" ry="1.2" fill="#c9d3e0" opacity="0.18" /><rect x="${rx - 0.5}" y="-3" width="1" height="2.4" fill="#3a3f4a" />`;
    o += `<rect x="-8" y="-1" width="16" height="1.4" fill="#3a3f4a" /><path d="M-4 -1.6 L4 -1.6 L5 2 L-5 2 Z" fill="#23262e" /><path d="M2 -1.6 L4 -1.6 L5 2 L3 2 Z" fill="${lt('#23262e', 0.5)}" />`;
    o += `<circle cx="0" cy="3.4" r="1.6" fill="#14171d" /><circle cx="0.4" cy="3.4" r="0.6" fill="#3de8d8" />`;
    o += `<circle cx="-3" cy="-0.2" r="2.6" fill="#ff3d5f" opacity="0.3" /><circle cx="-3" cy="-0.2" r="0.8" fill="#ff3d5f" />`; // recording
    o += `<circle cx="-8" cy="-3" r="1.6" fill="#3de8d8" opacity="0.35" /><circle cx="8" cy="-3" r="1.6" fill="#3de8d8" opacity="0.35" />`; // rotor tips
    return o + '</g>';
  };
  s += camDrone(186, 146, 176, 186, 1.8) + camDrone(266, 134, 252, 180, 1.6) + camDrone(340, 152, 304, 196, 2) + camDrone(600, 120, 560, 206, 1.2) + camDrone(118, 92, 100, 140, 1.1);
  // The Old Stand on the left: an iron roof on slim columns, pennants, rows of people under it.
  s += rect(0, 118, 236, 42, '#1d1a1a');
  for (let row = 0; row < 4; row++) for (let hx = 6 + (row % 2) * 4; hx < 226; hx += 8) s += `<circle cx="${hx}" cy="${128 + row * 8}" r="2.6" fill="${dk(['#3a2e2a', '#2a2f38', '#3a3240'][(hx + row) % 3], 0.2)}" /><path d="M${hx + 1} ${125.5 + row * 8} A2.6 2.6 0 0 1 ${hx + 1} ${130.5 + row * 8} Z" fill="${lt('#3a2e2a', 0.5)}" />`;
  s += rect(0, 156, 236, 4, '#2b2622') + rect(0, 156, 236, 1, lt('#2b2622', 0.5));
  s += poly([[-4, 106], [240, 114], [240, 120], [-4, 114]], '#3a3330') + poly([[-4, 106], [240, 114], [240, 116], [-4, 108]], lt('#3a3330', 0.5));
  for (const cx2 of [20, 80, 140, 200]) s += rect(cx2, 118, 2.4, 42, '#3a3330') + rect(cx2 + 1.6, 118, 0.8, 42, lt('#3a3330', 0.5));
  for (const px of [30, 90, 150, 210]) s += `<path d="M${px} ${108 + px * 0.033} V${94 + px * 0.033}" stroke="#5a606c" stroke-width="0.8" /><path d="M${px} ${94 + px * 0.033} L${px + 10} ${98 + px * 0.033} L${px} ${102 + px * 0.033} Z" fill="${['#d42a48', '#f2d541', '#3de8d8', '#b48cff'][(px / 60) | 0]}" />`;
  s += `<text x="118" y="152" class="da-stencil" style="fill:#e9e2cf" font-size="6" text-anchor="middle" opacity="0.6">THE OLD STAND · 1891</text>`;
  // The rail crowd: punters at the rail, tickets in hand, paper slips in the air.
  s += rect(0, RAIL + 8, W, H - RAIL - 8, '#141418');
  for (let i = 0; i < 30; i++) { const fx = r() * W; s += figure(fx, RAIL + 34 + r() * 10, dk(['#3a2e2a', '#2a2f38', '#3a3240'][i % 3], 0.25), 26 + r() * 8); }
  for (let i = 0; i < 26; i++) { const tx = r() * W; const ty = 100 + r() * 180; s += `<rect x="${f(tx)}" y="${f(ty)}" width="3.4" height="2.2" fill="#e9e2cf" opacity="${(0.4 + r() * 0.4).toFixed(2)}" transform="rotate(${Math.round(r() * 80 - 40)} ${f(tx)} ${f(ty)})" />`; }
  s += person(520, RAIL + 70, '#232733');
  basinCache = `<svg viewBox="0 0 ${W} ${H}" class="scene" role="img" aria-label="The Basin on race night: Lantern Course under amber floodlights, horses on the turn, the Old Stand and the odds board, towers all round the bowl, one of your crew at the rail">${s}</svg>`;
  return basinCache;
}

/** The picture for a district, or null if it hasn't been drawn yet. */
const SCENES = { docks: docksScene, oldTown: oldTownScene, nightMarket: nightMarketScene, heights: heightsScene, basin: basinScene };
export const districtArt = (key) => SCENES[key]?.() ?? null;
