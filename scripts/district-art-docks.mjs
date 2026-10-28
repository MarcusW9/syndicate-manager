// Design session (2026-10-28): option C at full quality, one district, so the owner can judge
// the direction: the Docks at night, drawn like the portraits (flat colour planes, hard light,
// the turf's light from the right, no outlines). Writes drafts/prototypes/district-docks.html.
// Run: node scripts/district-art-docks.mjs
//
// The scene, back to front: the sky lit red from the right, Lantern Bay across the harbour
// (Glass Heights' cyan towers, Iron Peak behind), the water and its reflections, two
// ship-to-shore cranes, the container stacks on the quay (one of them 409), sodium lamps, a
// string of red lanterns, one runner looking at the box, rain and harbour fog.

import { writeFileSync } from 'node:fs';
import { mix } from '../src/ui/art.js';

const W = 720;
const H = 300;
const BG = '#0d1016';
const SHADOW = '#1b2340';
const RED = '#ff3d5f'; // Red Lantern turf: the light that falls on everything from the right
const SODIUM = '#f2b544';
const CYAN = '#3de8d8';
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
const rnd = seeded(409);
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
const farLights = []; // [x, y, colour] for the water to reflect
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
function crane(x, top, reach) {
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
  if (label) s += `<text x="${f(x + 6)}" y="${f(y + h - 4.5)}" class="stencil">${label}</text>`;
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

export function docksScene() {
  return `<svg viewBox="0 0 ${W} ${H}" class="scene" role="img" aria-label="The Docks at night: cranes over the harbour, container stacks, red lanterns, one of your crew looking at container 409">
    <defs>${sky()}</defs>
    <rect width="${W}" height="${H}" fill="url(#dk-sky)" />
    <rect width="${W}" height="${H}" fill="url(#dk-red)" />
    ${farShore()}
    ${water()}
    ${crane(520, 70, 230)}
    ${crane(140, 92, 120)}
    ${quay()}
    ${lamps()}
    ${stacks()}
    ${lanterns()}
    ${runner()}
    <rect width="${W}" height="${H}" fill="url(#dk-red)" opacity="0.35" />
    ${weather()}
  </svg>`;
}

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Docks district art</title>
<style>
:root{--bg:#0a0c0f;--panel:#12151b;--panel2:#161a21;--line:#2a303b;--text:#e9ecf1;--muted:#8a93a6;--cyan:#3de8d8}
body{margin:0;background:var(--bg);color:var(--text);font:15px/1.45 system-ui,sans-serif;padding:16px;max-width:1180px}
h1,h2,h3{font-family:Rajdhani,'Arial Narrow',sans-serif;text-transform:uppercase;letter-spacing:.1em;margin:0 0 6px}h1{font-size:1.4rem}h2{font-size:1.05rem;color:var(--cyan)}
p{color:var(--muted);margin:0 0 10px}
section{background:var(--panel);border:1px solid var(--line);padding:14px;margin:14px 0;clip-path:polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,0 100%)}
.scene{display:block;width:100%}.stencil{font:700 6.5px Rajdhani,'Arial Narrow',sans-serif;letter-spacing:.12em;fill:#e9e2cf;opacity:.85}
.dcard{background:var(--panel2);border:1px solid var(--line);max-width:390px;clip-path:polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,0 100%)}
.dcard .scene{aspect-ratio:2.4;object-fit:cover}.dcard__body{padding:10px 12px}.turf{font-size:.75rem;letter-spacing:.1em;color:#ff3d5f}
.facts{list-style:none;margin:0 0 6px;padding:0;display:flex;flex-wrap:wrap;gap:4px 14px;font-size:.9rem}.talk-line{color:#f2d541;font-size:.85rem;margin:0}
.crop{width:100%;max-width:390px;overflow:hidden}.crop svg{width:180%;margin-left:-62%}
</style></head><body>
<h1>The Docks, drawn properly</h1>
<p>Option C at full quality, for one district (2026-10-28). Flat colour planes and hard light like the portraits: Red Lantern red from the right, sodium lamps, Glass Heights' cyan across the water, no outlines. Container 409 (Aether-Harbour's, AHX) sits in the front row with one of your crew looking at it, rifle on their back.</p>
<section id="full"><h2>Full width</h2>${docksScene()}</section>
<section id="card"><h2>On the district card (phone width)</h2>
<div class="dcard"><div class="crop">${docksScene()}</div><div class="dcard__body">
<h3>Docks <span class="turf">Red Lantern turf</span></h3>
<ul class="facts"><li><b>0</b> jobs</li><li>Heat <b>●●●</b></li><li><b>2</b> of yours here</li></ul>
<p class="talk-line">Street talk: a Red Lantern boat came in light. Somebody is short a cargo.</p></div></div>
<p>On a phone the card shows the middle of the picture: 409, the runner and the lanterns.</p></section>
</body></html>`;

writeFileSync(new URL('../drafts/prototypes/district-docks.html', import.meta.url), html);
console.log('wrote drafts/prototypes/district-docks.html');
