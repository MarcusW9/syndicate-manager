// Map lighting mockup: the real site SVGs with light, rain and colour layered on top.
// Rebuild: node docs/mockups/2026-11-23-map-lighting.mjs $PWD/docs/mockups/2026-11-23-map-lighting
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync } from 'node:fs';
import { allSites } from '../../src/data/sites.js';
import { sitePlanSvg } from '../../src/ui/siteplan.js';
const { chromium } = createRequire(import.meta.url)('playwright');
const ROOT = new URL('../..', import.meta.url).pathname.replace(/\/$/, '');
const css = readFileSync(`${ROOT}/src/ui/styles.css`, 'utf8');
const svgOf = (key, variant) => sitePlanSvg({ kit: 'rifle', site: allSites().find((s) => s.key === key && s.variant === variant).site });

let n = 0;
// light(x,y,rx,ry,colour,strength)
const pool = (id, x, y, rx, ry, c, o = 0.55) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="url(#${id}-${c.slice(1)})" opacity="${o}"/>`;
const grads = (id, colours) => colours.map((c) => `
  <radialGradient id="${id}-${c.slice(1)}"><stop offset="0" stop-color="${c}" stop-opacity="1"/><stop offset=".35" stop-color="${c}" stop-opacity=".45"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>`).join('');

function layers(d, look) {
  const id = `m${n++}`;
  const cols = [...new Set(d.lights.map((l) => l[4]).concat(d.tint))];
  const rain = look === 'c' ? `
    <pattern id="${id}-rain" width="14" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(12)">
      <line x1="3" y1="0" x2="3" y2="7" stroke="#bcd6ff" stroke-width=".4" opacity=".3"/>
      <line x1="10" y1="11" x2="10" y2="16" stroke="#bcd6ff" stroke-width=".3" opacity=".18"/>
      <animateTransform attributeName="patternTransform" type="translate" from="0 0" to="-4.6 22" dur=".45s" repeatCount="indefinite" additive="sum"/>
    </pattern>
    <filter id="${id}-fog" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14"/></filter>` : '';
  const defs = `<defs>${grads(id, cols)}
    <radialGradient id="${id}-vig" cx=".5" cy=".5" r=".75"><stop offset=".45" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="${look === 'c' ? .78 : .62}"/></radialGradient>
    <linearGradient id="${id}-wet" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#9fb6ff" stop-opacity=".10"/></linearGradient>
    ${rain}</defs>`;
  // 1. night: pull the whole plan down, tinted to the district
  const night = `<rect width="360" height="240" fill="${look === 'c' ? d.night : '#0a1024'}" opacity="${look === 'c' ? .5 : .42}" style="mix-blend-mode:multiply"/>`;
  const tint = look === 'c' ? `<rect width="360" height="240" fill="${d.tint}" opacity=".10" style="mix-blend-mode:color"/>` : '';
  // 2. light pools
  const lights = `<g style="mix-blend-mode:screen">${d.lights.map((l) => pool(id, ...l)).join('')}</g>`;
  // cones (floodlights)
  const cones = (d.cones || []).map(([x, y, x1, x2, y2, c, o]) => `
    <polygon points="${x},${y} ${x1},${y2} ${x2},${y2}" fill="${c}" opacity="${o}" style="mix-blend-mode:screen;filter:blur(3px)"/>`).join('');
  // flicker on one neon sign
  const flick = d.flicker ? `<g style="mix-blend-mode:screen">${pool(id, ...d.flicker)}<animate attributeName="opacity" values="1;1;.2;1;.5;1;1;1" dur="3.2s" repeatCount="indefinite"/></g>` : '';
  // 3. wet road: streak reflections under the lamps
  const wet = look === 'c' ? `<rect x="0" y="212" width="360" height="28" fill="url(#${id}-wet)"/>
    <g style="mix-blend-mode:screen">${d.lamps.map(([x, c]) => `<ellipse cx="${x}" cy="230" rx="3.5" ry="11" fill="${c}" opacity=".35" style="filter:blur(1.6px)"/>`).join('')}</g>` : '';
  const water = d.water && look !== 'a' ? `<g style="mix-blend-mode:screen">${Array.from({ length: 9 }, (_, i) => {
    const y = 20 + i * 24, x = d.water + 6 + (i * 13) % 26;
    return `<rect x="${x}" y="${y}" width="${10 + (i % 3) * 5}" height=".9" fill="${d.waterLight}" opacity=".5"><animate attributeName="x" values="${x};${x + 5};${x}" dur="${3 + (i % 4)}s" repeatCount="indefinite"/><animate attributeName="opacity" values=".15;.6;.15" dur="${2 + (i % 3)}s" repeatCount="indefinite"/></rect>`;
  }).join('')}</g>` : '';
  const fog = look === 'c' ? `<g filter="url(#${id}-fog)" opacity=".16">
      <ellipse cx="90" cy="150" rx="110" ry="26" fill="${d.fog}"><animateTransform attributeName="transform" type="translate" values="-20 0;30 0;-20 0" dur="26s" repeatCount="indefinite"/></ellipse>
      <ellipse cx="260" cy="60" rx="90" ry="20" fill="${d.fog}"><animateTransform attributeName="transform" type="translate" values="20 0;-30 0;20 0" dur="31s" repeatCount="indefinite"/></ellipse></g>` : '';
  const rainRect = look === 'c' ? `<rect width="360" height="240" fill="url(#${id}-rain)"/>` : '';
  const vig = `<rect width="360" height="240" fill="url(#${id}-vig)"/>`;
  return defs + night + tint + cones + lights + flick + water + wet + fog + rainRect + vig;
}

function dress(svg, d, look) {
  if (look === 'a') return svg;
  const at = svg.lastIndexOf('<', svg.indexOf('sp-route-case'));
  return svg.slice(0, at) + layers(d, look) + svg.slice(at);
}

const D = {
  docks: {
    key: 'docks', variant: 'gate+stacks+office', title: 'The Docks', water: 318, waterLight: '#57e3ff',
    night: '#06121f', tint: '#2fb8c8', fog: '#9ad7e6',
    lights: [
      [272, 74, 60, 46, '#ff3d5f', .55],   // office red spill
      [307, 74, 14, 40, '#ff3d5f', .7],    // red strip on the office wall
      [176, 30, 26, 18, '#f2b544', .6],    // crane cab lamp
      [60, 214, 34, 22, '#ff9a3c', .55],   // sodium lamps on the road
      [190, 214, 34, 22, '#ff9a3c', .55],
      [300, 214, 30, 20, '#ff9a3c', .45],
      [345, 130, 40, 90, '#2fb8c8', .35],  // harbour glow
    ],
    cones: [[176, 26, 120, 230, 150, '#f2d27a', .16]],
    flicker: [246, 28, 22, 8, '#ff3d5f', .55],
    lamps: [[60, '#ff9a3c'], [190, '#ff9a3c'], [300, '#ff9a3c']],
  },
  oldTown: {
    key: 'oldTown', variant: 'alley+laundry+flat', title: 'Old Town',
    night: '#1a0d10', tint: '#f2b544', fog: '#f0c9a0',
    lights: [
      [72, 64, 58, 48, '#f2b544', .45],    // the flat's windows
      [180, 64, 44, 40, '#f2b544', .35],
      [300, 60, 44, 40, '#f2b544', .3],
      [150, 128, 70, 22, '#ff5fa2', .4],   // lantern strings over the courtyard
      [150, 150, 60, 16, '#f2b544', .35],
      [262, 184, 28, 14, '#ff3d5f', .7],   // alley sign
      [120, 214, 40, 22, '#ff9a3c', .5],
      [300, 214, 34, 22, '#ff9a3c', .5],
    ],
    flicker: [262, 184, 18, 9, '#ff3d5f', .7],
    lamps: [[120, '#ff9a3c'], [300, '#ff9a3c'], [262, '#ff3d5f']],
  },
};

const LOOKS = [
  ['a', 'Now', 'The map as it is in the game today.'],
  ['b', 'Lit night', 'Same art, darker, with pools of light where the light really is: the lamps, windows, signs, the crane cab. A vignette pulls the eye to the middle. The route glows. Water shimmers.'],
  ['c', 'Rain and district colour', 'Lit night, plus a colour per district (the Docks cold teal, Old Town warm amber), drifting fog, rain, wet-road reflections under the lamps and one flickering neon sign.'],
];

const section = (d) => `
  <section><h2>${d.title}</h2><div class="row">${LOOKS.map(([k, t, why]) => `
    <figure class="look-${k}"><figcaption><b>${k.toUpperCase()} · ${t}</b><span>${why}</span></figcaption>
      <div class="frame">${dress(svgOf(d.key, d.variant), d, k)}</div></figure>`).join('')}</div></section>`;

const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Map lighting mockup</title><style>${css}
  body { margin: 0; padding: 16px; background: #0a0c0f; color: #d8deea; font-family: Inter, system-ui, sans-serif; }
  h1 { font-family: Rajdhani, sans-serif; letter-spacing: .12em; text-transform: uppercase; font-size: 22px; margin: 0 0 4px; }
  .lede { color: #8a93a6; max-width: 70ch; margin: 0 0 18px; font-size: 14px; line-height: 1.45; }
  h2 { font-family: Rajdhani, sans-serif; color: #3ee6d4; letter-spacing: .14em; text-transform: uppercase; font-size: 16px; margin: 22px 0 10px; }
  .row { display: grid; grid-template-columns: 1fr; gap: 16px; }
  @media (min-width: 900px) { .row { grid-template-columns: repeat(3, 1fr); } }
  figure { margin: 0; }
  figcaption { font-size: 13px; line-height: 1.4; margin-bottom: 8px; color: #8a93a6; min-height: 5.6em; }
  figcaption b { display: block; color: #e8ecf4; font-family: Rajdhani, sans-serif; letter-spacing: .1em; text-transform: uppercase; font-size: 14px; }
  .frame { border: 1px solid #2a303b; clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%); background: #07090c; }
  .siteplan { width: 100%; height: auto; display: block; }
  .look-b .sp-route, .look-c .sp-route { filter: drop-shadow(0 0 1.6px #3ee6d4) drop-shadow(0 0 4px rgba(62,230,212,.55)); }
  .look-b .sp-label, .look-c .sp-label { paint-order: stroke; stroke: rgba(0,0,0,.75); stroke-width: 2.2px; }
  .look-c .sp-node--target { filter: drop-shadow(0 0 3px #ff3d5f); }
</style></head><body>
<h1>Map lighting · mockup</h1>
<p class="lede">Real game maps (drawn by <code>sitePlanSvg</code>) with lighting layered on top. Nothing under the light changed: the same buildings, props, route and labels. Rain, fog, water and the sign flicker move in a browser.</p>
${section(D.docks)}${section(D.oldTown)}
</body></html>`;

const out = process.argv[2];
writeFileSync(`${out}.html`, html);
const browser = await chromium.launch();
for (const [w, h, s, sfx] of [[1440, 900, 1, 'desktop'], [390, 844, 2, 'phone']]) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: s });
  await page.goto(`file://${out}.html`);
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${out}-${sfx}.png`, fullPage: true });
}
await browser.close();
console.log('ok');
