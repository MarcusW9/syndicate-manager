// Mockup: five art directions for the Night Market site plan, all on the live site's geometry
// (data/sites.js), so any of them can replace the drawing without touching routes, cover or fights.
// Run: node drafts/prototypes/map-variants.mjs  -> drafts/prototypes/map-variants.html
import { writeFileSync, readFileSync } from 'node:fs';
import { SITES } from '../../src/data/sites.js';
import { gridSite, cutCorners } from '../../src/ui/route.js';
import { sitePlanSvg } from '../../src/ui/siteplan.js';
import { portrait } from '../../src/ui/art.js';

const site = gridSite(SITES.nightMarket);
const css = readFileSync(new URL('../../src/ui/styles.css', import.meta.url), 'utf8').split('\n')
  .filter((l) => /^\.sp-|^\.siteplan( |\.)/.test(l) && !/is-fight|@media/.test(l)).join('\n');

// --- helpers ------------------------------------------------------------------------------
const hx = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a, b, t) => '#' + hx(a).map((v, i) => Math.round(v + (hx(b)[i] - v) * t).toString(16).padStart(2, '0')).join('');
const hash = (a, b) => { const v = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return v - Math.floor(v); };
const NAVY = '#1b2340';
const expand = (s) => {
  if (s.t !== 'row') return [s];
  const out = [];
  for (let i = 0; i < s.n; i++) {
    if (s.skip?.includes(i)) continue;
    out.push({ ...s, t: 'rect', x: s.axis === 'y' ? s.x : s.x + i * s.step, y: s.axis === 'y' ? s.y + i * s.step : s.y, fill: s.tones?.[(i + (s.shift ?? 0)) % s.tones.length], i });
  }
  return out;
};
const SHAPES = site.shapes.flatMap(expand).filter((s) => !s.cls?.startsWith('sp-road'));
const ROUTE = cutCorners([...site.paths.in, ...site.paths.inside.slice(1), ...site.paths.target.slice(1)]);
const P = site.points;
/** The silhouette of a box lit from the right: its shadow falls left and a little down. */
const cast = (x, y, w, h, s, fill = NAVY, op = 0.8) => {
  const d = s * 0.6;
  return `<polygon points="${x + w},${y} ${x + w},${y + h} ${x + w - s},${y + h + d} ${x - s},${y + h + d} ${x - s},${y + d} ${x},${y}" fill="${fill}" opacity="${op}"/>`;
};

const ops = [
  { id: 'moth', name: 'Moth', handle: 'Moth', age: 27, color: '#36d6c3', stats: {} },
  { id: 'grid', name: 'Grid', handle: 'Grid', age: 31, color: '#f5b942', stats: {} },
];
const face = (op, x, y, r, soft = true) => `<g transform="translate(${x} ${y})">
  <ellipse cx="${soft ? 0 : -2}" cy="${r * 0.95}" rx="${r * 0.95}" ry="${r * 0.35}" fill="#000" opacity="0.55"/>
  <g clip-path="url(#Q__clip)"><rect x="${-r}" y="${-r}" width="${r * 2}" height="${r * 2}" fill="#10131a"/>${portrait(op, { size: r * 2 }).replace('<svg ', `<svg x="${-r}" y="${-r}" `)}</g>
  <circle r="${r}" fill="none" stroke="#0b0d11" stroke-width="2.4"/><circle r="${r}" fill="none" stroke="${op.color}" stroke-width="1.2"/></g>`;

const baseDefs = `
  <radialGradient id="Q__pink"><stop offset="0" stop-color="#ff3d5f" stop-opacity="0.38"/><stop offset="1" stop-color="#ff3d5f" stop-opacity="0"/></radialGradient>
  <radialGradient id="Q__teal"><stop offset="0" stop-color="#3de8d8" stop-opacity="0.3"/><stop offset="1" stop-color="#3de8d8" stop-opacity="0"/></radialGradient>
  <radialGradient id="Q__sod"><stop offset="0" stop-color="#f2b544" stop-opacity="0.42"/><stop offset="1" stop-color="#f2b544" stop-opacity="0"/></radialGradient>
  <radialGradient id="Q__violet"><stop offset="0" stop-color="#b48cff" stop-opacity="0.4"/><stop offset="1" stop-color="#b48cff" stop-opacity="0"/></radialGradient>
  <radialGradient id="Q__vig" cx="0.5" cy="0.5" r="0.75"><stop offset="0.55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.6"/></radialGradient>
  <filter id="Q__soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.2"/></filter>
  <filter id="Q__bloom" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.6"/></filter>
  <pattern id="Q__roof" width="5" height="5" patternUnits="userSpaceOnUse"><path d="M0 4.5H5" stroke="#0e1118" stroke-width=".8"/><path d="M2.5 0V4.5" stroke="#0e1118" stroke-width=".5"/></pattern>
  <pattern id="Q__plank" width="4" height="10" patternUnits="userSpaceOnUse"><path d="M.2 0V10" stroke="#06070a" stroke-width=".6"/></pattern>
  <clipPath id="Q__clip"><circle r="9"/></clipPath>`;
const pave = (line, alt) => `<pattern id="Q__pave" width="12" height="12" patternUnits="userSpaceOnUse"><path d="M0 .3H12M.3 0V12" stroke="${line}" stroke-width=".6" fill="none"/><path d="M6 6.3H12M6.3 6V12" stroke="${alt}" stroke-width=".5" fill="none"/></pattern>`;

// --- A: neon wet (the first proposal) ----------------------------------------------------
const A = {
  key: 'a', name: 'A · Neon wet',
  blurb: 'The first proposal. Soft neon light pools, wet paving, glowing route. The richest look; the most blur filters (heaviest on a phone).',
  defs: pave('#1b2029', '#151922'),
  ground: () => `<rect width="360" height="240" fill="#0d1016"/><rect width="360" height="212" fill="url(#Q__pave)"/>
    <rect y="212" width="360" height="28" fill="#12141a"/><line x1="0" y1="226" x2="360" y2="226" stroke="#2a2f3b" stroke-dasharray="7 7"/>
    ${[[44, '#ff3d5f'], [118, '#3de8d8'], [186, '#b48cff'], [262, '#f2b544'], [330, '#ff3d5f']].map(([x, c]) => `<rect x="${x}" y="213" width="3" height="26" fill="${c}" opacity=".16" filter="url(#Q__bloom)"/>`).join('')}
    ${[[150, 170, 14, '#ff3d5f'], [58, 94, 10, '#3de8d8'], [214, 100, 12, '#b48cff'], [200, 182, 9, '#f2b544'], [120, 62, 8, '#3de8d8']].map(([x, y, rx, c]) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${rx * 0.34}" fill="#0a0d13"/><ellipse cx="${x - rx * 0.2}" cy="${y}" rx="${rx * 0.6}" ry="${rx * 0.16}" fill="${c}" opacity=".22"/>`).join('')}
    ${[[130, 160, 46, 'pink'], [70, 118, 40, 'teal'], [190, 118, 46, 'sod'], [130, 80, 40, 'violet'], [220, 160, 40, 'teal'], [92, 206, 30, 'sod']].map(([x, y, r, g]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#Q__${g})"/>`).join('')}`,
  tone: (t) => t,
  stall: (s, V) => {
    const { x, y, w, h } = s; const fill = V.tone(s.fill);
    return `<rect x="${x + 1.5}" y="${y + 2.5}" width="${w}" height="${h}" fill="#000" opacity=".5"/>
      <rect x="${x}" y="${y + 6}" width="${w}" height="${h - 6}" fill="#1a1d27"/>
      ${[0, 1, 2].map((k) => `<rect x="${x + 2 + k * 5.2}" y="${y + 8}" width="3.4" height="2.2" fill="${['#f2d541', '#ff7a45', '#9be0a6'][(s.i + k) % 3]}" opacity=".8"/>`).join('')}
      <path d="M${x - 1} ${y + 7}L${x + 1.5} ${y}H${x + w - 1.5}L${x + w + 1} ${y + 7}Z" fill="${fill}"/>
      ${[0, 1, 2, 3].map((k) => `<rect x="${x + 2 + k * 4.4}" y="${y + 0.4}" width="2.2" height="6.4" fill="#0b0d11" opacity=".28"/>`).join('')}
      <circle cx="${x + w / 2}" cy="${y + 8}" r="1.3" fill="#ffd9a0"/><circle cx="${x + w / 2}" cy="${y + 8}" r="4.5" fill="#f2b544" opacity=".18" filter="url(#Q__bloom)"/>`;
  },
  crowd: (s) => {
    const hue = ['#6b7487', '#8a6f78', '#5f7a86', '#7a7390'][Math.floor(hash(s.x, s.y + s.i) * 4)];
    return `<ellipse cx="${s.x + 1.5}" cy="${s.y + 4.2}" rx="3.2" ry="1.2" fill="#000" opacity=".5"/><ellipse cx="${s.x + 1.5}" cy="${s.y + 2.2}" rx="2.6" ry="2.2" fill="${hue}"/><circle cx="${s.x + 1.5}" cy="${s.y + 0.4}" r="1.5" fill="#b9a493"/><path d="M${s.x + 0.2} ${s.y + 0.3}a1.4 1.4 0 0 1 2.6 0" fill="none" stroke="#0b0d11" stroke-width=".8"/>`;
  },
  bridge: (s) => `<rect x="${s.x + 3}" y="${s.y + 14}" width="${s.w}" height="${s.h + 2}" fill="#000" opacity=".35" filter="url(#Q__soft)"/>
    <rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" fill="#222733"/><rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" fill="url(#Q__plank)"/>
    <rect x="${s.x}" y="${s.y}" width="${s.w}" height="1.6" fill="#4a5266"/><rect x="${s.x}" y="${s.y + s.h - 1.6}" width="${s.w}" height="1.6" fill="#4a5266"/>
    ${[0, 1, 2, 3, 4, 5, 6].map((k) => `<circle cx="${s.x + 4.7 + k * 17}" cy="${s.y - 3}" r="1" fill="#f2b544"/><circle cx="${s.x + 4.7 + k * 17}" cy="${s.y - 3}" r="6" fill="url(#Q__sod)"/>`).join('')}`,
  building: (s) => `<rect x="${s.x + 3}" y="${s.y + 4}" width="${s.w}" height="${s.h}" fill="#000" opacity=".5" filter="url(#Q__soft)"/><rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" fill="#141821"/><rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" fill="url(#Q__roof)"/>
    <rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" fill="none" stroke="#4a5266" stroke-width="1.4"/>
    <rect x="${s.x + 8}" y="${s.y + 62}" width="16" height="10" fill="#1d222d" stroke="#323949" stroke-width=".6"/><rect x="${s.x + 8}" y="${s.y + 82}" width="10" height="10" fill="#1d222d" stroke="#323949" stroke-width=".6"/>`,
  room: (s) => `<rect x="${s.x - 2}" y="${s.y - 2}" width="${s.w + 4}" height="${s.h + 4}" fill="#2b2038"/><rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" fill="#2a2118"/>
    <circle cx="${s.x + 22}" cy="${s.y + 22}" r="26" fill="url(#Q__sod)"/><rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" fill="none" stroke="#b48cff" stroke-opacity=".7"/>`,
  desk: (s) => `<rect x="${s.x + 1}" y="${s.y + 2}" width="${s.w}" height="${s.h}" fill="#000" opacity=".5"/><rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" rx="1.5" fill="#0f5a46" stroke="#6b4a2a" stroke-width="1.2"/>
    ${[0, 1, 2, 3].map((k) => `<rect x="${s.x + 2.5 + k * 3}" y="${s.y + 3.6}" width="2.2" height="3" fill="#e9e1cf"/>`).join('')}`,
  cover: (s) => `<rect x="${s.x + 1.5}" y="${s.y + 2.5}" width="${s.w}" height="${s.h}" fill="#000" opacity=".55"/><rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" rx="1" fill="${s.fill}"/>
    <rect x="${s.x}" y="${s.y}" width="${s.w}" height="2" fill="#fff" opacity=".14"/><rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" rx="1" fill="none" stroke="#3a4356" stroke-width=".8"/>`,
  sign: (s) => `<rect x="${s.x - 2}" y="${s.y - 2}" width="${s.w + 4}" height="${s.h + 4}" fill="#b48cff" opacity=".35" filter="url(#Q__bloom)"/><rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" rx="1" fill="#14101d" stroke="#d3b8ff" stroke-width=".9"/>`,
  door: (s) => `<rect x="${s.x - 4}" y="${s.y}" width="${s.w + 10}" height="${s.h}" fill="url(#Q__pink)"/><rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" fill="#ff4f7b" opacity=".85"/>`,
  gatepost: (s) => `<rect x="${s.x1 - 2}" y="${s.y1 - 1}" width="4" height="${s.y2 - s.y1 + 2}" fill="#2a303c" stroke="#4a5266" stroke-width=".6"/>`,
  neon: (s) => `<line x1="${s.x1}" y1="${s.y1}" x2="${s.x2}" y2="${s.y2}" stroke="#ff3d5f" stroke-width="5" opacity=".5" filter="url(#Q__bloom)"/><line x1="${s.x1}" y1="${s.y1}" x2="${s.x2}" y2="${s.y2}" stroke="#ff9aab" stroke-width="1.6" stroke-linecap="round"/>`,
  overhead: () => '',
  route: () => `<path d="${ROUTE}" fill="none" stroke="#3de8d8" stroke-width="5" opacity=".28" filter="url(#Q__bloom)" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="${ROUTE}" fill="none" stroke="#0b0d11" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="${ROUTE}" fill="none" stroke="#7ff3e6" stroke-width="1.6" stroke-dasharray="1 4.2" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="${P.target[0]}" cy="${P.target[1]}" r="4" fill="#2a1520" stroke="#ff4f7b" stroke-width="1.4"/><circle cx="${P.target[0]}" cy="${P.target[1]}" r="12" fill="url(#Q__pink)"/>`,
  overlay: () => `<rect width="360" height="240" fill="url(#Q__vig)"/>`,
  soft: true,
};

// --- B: flat planes, hard light (the portraits' style) -------------------------------------
const B = {
  ...A, key: 'b', name: 'B · Flat planes, hard light',
  blurb: 'Drawn like the portraits and district art (ART.md): flat colour, one city light from the right, hard navy shadows falling left, no outlines, no blur. Most on-brand; cheap to draw.',
  defs: '',
  ground: () => {
    const slabs = [];
    for (let y = 0; y < 212; y += 24) for (let x = 0; x < 360; x += 24) if ((x / 24 + y / 24) % 2) slabs.push(`<rect x="${x}" y="${y}" width="24" height="24" fill="#10141b"/>`);
    return `<rect width="360" height="240" fill="#0d1016"/>${slabs.join('')}
      <polygon points="360,138 360,206 96,212 132,150" fill="#ff3d5f" opacity=".09"/>
      <polygon points="360,58 360,122 70,128 104,86" fill="#f2b544" opacity=".07"/>
      <polygon points="360,0 360,50 150,54 170,16" fill="#9b8cff" opacity=".06"/>
      <rect y="212" width="360" height="28" fill="#12141a"/><rect y="226" width="360" height="1" fill="#2a2f3b"/>
      ${[[40, '#ff3d5f', 60], [150, '#3de8d8', 30], [250, '#f2b544', 70]].map(([x, c, w]) => `<polygon points="${x},213 ${x + w},213 ${x + w - 14},239 ${x - 14},239" fill="${c}" opacity=".07"/>`).join('')}`;
  },
  stall: (s) => {
    const { x, y, w, h, fill } = s;
    return `${cast(x, y, w, h, 4)}
      <rect x="${x}" y="${y + 6}" width="${w}" height="${h - 6}" fill="${mix(fill, NAVY, 0.7)}"/>
      <rect x="${x}" y="${y}" width="${w * 0.62}" height="7" fill="${mix(fill, NAVY, 0.38)}"/>
      <rect x="${x + w * 0.62}" y="${y}" width="${w * 0.38}" height="7" fill="${fill}"/>
      <rect x="${x + w - 1.2}" y="${y}" width="1.2" height="${h}" fill="${mix(fill, '#ffffff', 0.45)}"/>
      <rect x="${x + w / 2 - 1}" y="${y + 8}" width="2" height="2" fill="#ffd9a0"/>`;
  },
  crowd: (s) => {
    const hue = ['#6b7487', '#8a6f78', '#5f7a86', '#7a7390'][Math.floor(hash(s.x, s.y + s.i) * 4)];
    const cx = s.x + 1.5; const cy = s.y + 1.5;
    return `<polygon points="${cx},${cy} ${cx - 4},${cy + 2.6} ${cx - 2.4},${cy + 3.6}" fill="${NAVY}" opacity=".8"/>
      <ellipse cx="${cx}" cy="${cy + 1}" rx="2.6" ry="2" fill="${mix(hue, NAVY, 0.45)}"/><path d="M${cx} ${cy - 1}a2.6 2 0 0 1 0 4z" fill="${hue}"/>
      <circle cx="${cx}" cy="${cy - 0.6}" r="1.4" fill="${mix('#b9a493', NAVY, 0.42)}"/><path d="M${cx} ${cy - 2}a1.4 1.4 0 0 1 0 2.8z" fill="#c9b19c"/>`;
  },
  bridge: (s) => `${cast(s.x, s.y, s.w, s.h, 10, NAVY, 0.7)}
    <rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" fill="#232a36"/><rect x="${s.x + s.w * 0.7}" y="${s.y}" width="${s.w * 0.3}" height="${s.h}" fill="#2c3443"/>
    <rect x="${s.x}" y="${s.y}" width="${s.w}" height="1.4" fill="#3a4356"/><rect x="${s.x}" y="${s.y + s.h - 1.4}" width="${s.w}" height="1.4" fill="#3a4356"/>
    ${[0, 1, 2, 3, 4, 5, 6].map((k) => `<rect x="${s.x + 4 + k * 17}" y="${s.y + 3}" width=".7" height="${s.h - 6}" fill="#1a1f29"/><rect x="${s.x + 4 + k * 17}" y="${s.y - 3}" width="2" height="2" fill="#f2b544"/>`).join('')}`,
  building: (s) => `${cast(s.x, s.y, s.w, s.h, 8)}
    <rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" fill="#171b24"/><rect x="${s.x}" y="${s.y}" width="${s.w}" height="2" fill="#232937"/>
    <rect x="${s.x + s.w - 2}" y="${s.y}" width="2" height="${s.h}" fill="#f2b544" opacity=".55"/>
    ${cast(s.x + 8, s.y + 62, 16, 10, 2)}<rect x="${s.x + 8}" y="${s.y + 62}" width="16" height="10" fill="#222835"/><rect x="${s.x + 20}" y="${s.y + 62}" width="4" height="10" fill="#2e3646"/>
    ${cast(s.x + 8, s.y + 82, 10, 10, 2)}<rect x="${s.x + 8}" y="${s.y + 82}" width="10" height="10" fill="#222835"/>`,
  room: (s) => `<rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" fill="#2a2018"/><rect x="${s.x + s.w * 0.55}" y="${s.y}" width="${s.w * 0.45}" height="${s.h}" fill="#3a2b1c"/>
    <polygon points="${s.x + s.w},${s.y + 8} ${s.x + s.w},${s.y + 30} ${s.x + 8},${s.y + 40} ${s.x + 14},${s.y + 14}" fill="#f2b544" opacity=".12"/>
    <rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" fill="none" stroke="#ff3d5f" stroke-width="1" stroke-dasharray="3 2"/>`,
  desk: (s) => `${cast(s.x, s.y, s.w, s.h, 3)}<rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" fill="#0f4a3a"/><rect x="${s.x + s.w * 0.6}" y="${s.y}" width="${s.w * 0.4}" height="${s.h}" fill="#166b54"/>
    ${[0, 1, 2, 3].map((k) => `<rect x="${s.x + 2.5 + k * 3}" y="${s.y + 3.6}" width="2.2" height="3" fill="#e9e1cf"/>`).join('')}`,
  cover: (s) => `${cast(s.x, s.y, s.w, s.h, 3)}<rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" fill="${s.fill}"/>
    <rect x="${s.x + s.w * 0.65}" y="${s.y}" width="${s.w * 0.35}" height="${s.h}" fill="${mix(s.fill, '#f2b544', 0.18)}"/>`,
  sign: (s) => `<rect x="${s.x - 3}" y="${s.y - 3}" width="${s.w + 6}" height="${s.h + 6}" fill="#9b8cff" opacity=".2"/><rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" fill="#d3b8ff"/>`,
  door: (s) => `<polygon points="${s.x},${s.y} ${s.x},${s.y + s.h} ${s.x - 22},${s.y + s.h + 8} ${s.x - 18},${s.y - 4}" fill="#ff4f7b" opacity=".16"/><rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" fill="#ff4f7b"/>`,
  gatepost: (s) => `${cast(s.x1 - 2, s.y1, 4, s.y2 - s.y1, 3)}<rect x="${s.x1 - 2}" y="${s.y1}" width="2.6" height="${s.y2 - s.y1}" fill="#262c38"/><rect x="${s.x1 + 0.6}" y="${s.y1}" width="1.4" height="${s.y2 - s.y1}" fill="#4a5266"/>`,
  neon: (s) => `<rect x="${s.x1 - 2}" y="${s.y1 - 2.5}" width="${s.x2 - s.x1 + 4}" height="5" fill="#ff3d5f" opacity=".22"/><line x1="${s.x1}" y1="${s.y1}" x2="${s.x2}" y2="${s.y2}" stroke="#ff9aab" stroke-width="1.6"/>
    <polygon points="${s.x1},${s.y1 + 3} ${s.x2},${s.y1 + 3} ${s.x2 + 6},${s.y1 + 18} ${s.x1 - 6},${s.y1 + 18}" fill="#ff3d5f" opacity=".1"/>`,
  route: () => `<path d="${ROUTE}" fill="none" stroke="#0b0d11" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="${ROUTE}" fill="none" stroke="#36d6c3" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="${P.target[0]}" cy="${P.target[1]}" r="4" fill="#2a1520" stroke="#ff4f7b" stroke-width="1.4"/>`,
  overlay: () => '',
  soft: false,
};

// --- C: lantern canopy (warm, crowded, Hong Kong night market) ----------------------------
const C_TONES = { '#ff3d5f': '#c8323f', '#3de8d8': '#d9cbb0', '#f2d541': '#e0a33a', '#b48cff': '#8e2a3a' };
const C = {
  ...A, key: 'c', name: 'C · Lantern canopy',
  blurb: 'Warmer and busier: red and gold awnings, strings of lanterns over the lanes, steam off the food stalls. Feels most like a night market; the lanterns add clutter over the route.',
  defs: pave('#211a1a', '#1a1414'),
  tone: (t) => C_TONES[t] ?? t,
  ground: () => `<rect width="360" height="240" fill="#110d0e"/><rect width="360" height="212" fill="url(#Q__pave)"/>
    <rect y="212" width="360" height="28" fill="#141011"/><line x1="0" y1="226" x2="360" y2="226" stroke="#33282a" stroke-dasharray="7 7"/>
    ${[[60, 100, 50, 'sod'], [180, 100, 60, 'pink'], [120, 150, 60, 'sod'], [230, 150, 46, 'pink'], [90, 200, 34, 'sod'], [150, 60, 46, 'sod']].map(([x, y, r, g]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#Q__${g})"/>`).join('')}`,
  overhead: () => {
    const out = [];
    for (const [y, x0, x1] of [[90, 14, 262], [128, 14, 262], [168, 14, 262]]) {
      out.push(`<path d="M${x0} ${y}Q${(x0 + x1) / 2} ${y + 12} ${x1} ${y}" fill="none" stroke="#3a2a22" stroke-width=".6"/>`);
      for (let t = 0.03; t < 1; t += 0.055) {
        const x = x0 + (x1 - x0) * t; const ly = y + 24 * t * (1 - t);
        const c = Math.round(t * 18) % 3 ? '#ff3d5f' : '#f2b544';
        out.push(`<circle cx="${x}" cy="${ly + 1.5}" r="5" fill="url(#Q__${c === '#ff3d5f' ? 'pink' : 'sod'})"/><ellipse cx="${x}" cy="${ly + 1.5}" rx="1.5" ry="1.9" fill="${c}"/><rect x="${x - 0.8}" y="${ly - 0.6}" width="1.6" height=".6" fill="#2a1d18"/>`);
      }
    }
    for (const [x, y] of [[48, 66], [146, 106], [200, 146], [76, 146], [230, 66]]) out.push(`<ellipse cx="${x}" cy="${y}" rx="7" ry="4" fill="#e8e2d8" opacity=".09" filter="url(#Q__soft)"/>`);
    return out.join('');
  },
};

// --- D: rain --------------------------------------------------------------------------
const D = {
  ...A, key: 'd', name: 'D · Rain',
  blurb: 'The wet-neon city at its wettest: cooler light, puddles everywhere taking the neon, umbrellas instead of heads, rain over the top. Moody; could be a weather state rather than the default.',
  defs: pave('#17202c', '#121923') + `<pattern id="Q__rain" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(16)"><line x1="3" y1="0" x2="3" y2="6" stroke="#a9c0de" stroke-width=".45" opacity=".45"/><line x1="10" y1="7" x2="10" y2="12" stroke="#a9c0de" stroke-width=".4" opacity=".35"/></pattern>`,
  tone: (t) => mix(t, '#2a3a55', 0.25),
  ground: () => {
    const puddles = [[150, 172, 16], [58, 96, 12], [214, 100, 14], [200, 184, 11], [120, 62, 10], [36, 134, 9], [250, 174, 10], [104, 176, 8], [180, 58, 9], [72, 188, 10]];
    const tint = ['#ff3d5f', '#3de8d8', '#b48cff', '#f2b544'];
    return `<rect width="360" height="240" fill="#0a0f17"/><rect width="360" height="212" fill="url(#Q__pave)"/>
      <rect y="212" width="360" height="28" fill="#0e131b"/><line x1="0" y1="226" x2="360" y2="226" stroke="#26303f" stroke-dasharray="7 7"/>
      ${[[44, '#ff3d5f'], [118, '#3de8d8'], [186, '#b48cff'], [262, '#f2b544'], [330, '#ff3d5f']].map(([x, c]) => `<rect x="${x}" y="213" width="4" height="27" fill="${c}" opacity=".28" filter="url(#Q__bloom)"/>`).join('')}
      ${puddles.map(([x, y, r], i) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.38}" fill="#070a10"/><rect x="${x - r * 0.35}" y="${y - r * 0.3}" width="${r * 0.5}" height="${r * 0.6}" fill="${tint[i % 4]}" opacity=".3" filter="url(#Q__bloom)"/><ellipse cx="${x + 2}" cy="${y}" rx="2" ry=".8" fill="none" stroke="#a9c0de" stroke-width=".3" opacity=".6"/>`).join('')}
      ${[[130, 160, 40, 'teal'], [70, 118, 36, 'violet'], [190, 118, 40, 'teal'], [130, 80, 36, 'pink'], [220, 160, 34, 'violet']].map(([x, y, r, g]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#Q__${g})"/>`).join('')}`;
  },
  crowd: (s) => {
    const k = Math.floor(hash(s.x, s.y + s.i) * 5);
    const c = ['#2b3a4f', '#4a2a3a', '#2a4a46', '#3a3550', '#d9e3ef'][k];
    const cx = s.x + 1.5; const cy = s.y + 1.5;
    return `<ellipse cx="${cx + 0.6}" cy="${cy + 1.2}" rx="3.6" ry="2.6" fill="#000" opacity=".5"/><circle cx="${cx}" cy="${cy}" r="3.4" fill="${c}" opacity="${k === 4 ? 0.35 : 1}"/>
      ${[0, 60, 120].map((a) => `<line x1="${cx - 3.4 * Math.cos(a * Math.PI / 180)}" y1="${cy - 3.4 * Math.sin(a * Math.PI / 180)}" x2="${cx + 3.4 * Math.cos(a * Math.PI / 180)}" y2="${cy + 3.4 * Math.sin(a * Math.PI / 180)}" stroke="#000" stroke-opacity=".3" stroke-width=".4"/>`).join('')}
      <path d="M${cx + 1} ${cy - 3.2}a3.4 3.4 0 0 1 2.3 2.4" fill="none" stroke="#c9d6ea" stroke-width=".6" opacity=".6"/>`;
  },
  overlay: () => `<rect width="360" height="240" fill="#4a6a9a" opacity=".07"/><rect width="360" height="240" fill="url(#Q__rain)"/><rect width="360" height="240" fill="url(#Q__vig)"/>`,
};

// --- E: clean tactical ------------------------------------------------------------------
const E = {
  ...A, key: 'e', name: 'E · Clean tactical',
  blurb: 'Close to today, made solid: the fight grid on the ground, awnings and crates with a lit top edge and a 1px shadow, no glow at all. Most readable and cheapest; the least atmosphere.',
  defs: `<pattern id="Q__grid" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M0 .4H30M.4 0V30" stroke="#171b23" stroke-width=".8" fill="none"/></pattern>`,
  ground: () => `<rect width="360" height="240" fill="#0b0d11"/><rect width="360" height="212" fill="url(#Q__grid)"/>
    <rect y="212" width="360" height="28" fill="#12141a"/><line x1="0" y1="226" x2="360" y2="226" stroke="#2a2f3b" stroke-dasharray="6 6"/>`,
  stall: (s) => {
    const { x, y, w, h, fill } = s; const t = mix(fill, '#0b0d11', 0.35);
    return `<rect x="${x + 1}" y="${y + 1}" width="${w}" height="${h}" fill="#000" opacity=".6"/><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${t}"/>
      ${[0, 1, 2].map((k) => `<rect x="${x + 3 + k * 5.5}" y="${y}" width="2.6" height="${h}" fill="#000" opacity=".18"/>`).join('')}
      <rect x="${x}" y="${y}" width="${w}" height="1.4" fill="${fill}"/>`;
  },
  crowd: (s) => `<circle cx="${s.x + 1.5}" cy="${s.y + 1.5}" r="1.9" fill="#5f6878" stroke="#0b0d11" stroke-width=".8"/>`,
  bridge: (s) => `<rect x="${s.x + 1}" y="${s.y + 1}" width="${s.w}" height="${s.h}" fill="#000" opacity=".6"/><rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" fill="#1e232d"/>
    <rect x="${s.x}" y="${s.y}" width="${s.w}" height="1" fill="#7a6430"/><rect x="${s.x}" y="${s.y + s.h - 1}" width="${s.w}" height="1" fill="#7a6430"/>`,
  building: (s) => `<rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" fill="#171b24" stroke="#4a5266" stroke-width="1.5"/>`,
  room: (s) => `<rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" fill="#1c1620"/><rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" fill="none" stroke="#ff3d5f" stroke-width="1" stroke-dasharray="3 2"/>`,
  desk: (s) => `<rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" fill="#1d4a3c"/><rect x="${s.x}" y="${s.y}" width="${s.w}" height="1.2" fill="#2f7a62"/>`,
  cover: (s) => `<rect x="${s.x + 1}" y="${s.y + 1}" width="${s.w}" height="${s.h}" fill="#000" opacity=".6"/><rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" fill="${s.fill}"/><rect x="${s.x}" y="${s.y}" width="${s.w}" height="1.4" fill="${mix(s.fill, '#ffffff', 0.2)}"/>`,
  sign: (s) => `<rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" fill="#b48cff"/>`,
  door: (s) => `<rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" fill="#ff4f7b" opacity=".8"/>`,
  neon: (s) => `<line x1="${s.x1}" y1="${s.y1}" x2="${s.x2}" y2="${s.y2}" stroke="#ff3d5f" stroke-width="1.6"/>`,
  route: B.route,
  overlay: () => '',
  soft: false,
};

// --- assembling ----------------------------------------------------------------------------
const DRAW = { 'sp-stall': 'stall', 'sp-crowd': 'crowd', 'sp-bridge': 'bridge', 'sp-building': 'building', 'sp-room': 'room', 'sp-desk': 'desk', 'sp-cover': 'cover', 'sp-sign': 'sign', 'sp-door': 'door', 'sp-gatepost': 'gatepost', 'sp-neon': 'neon' };
const labels = () => site.labels.map((l) => `<text x="${l.x}" y="${l.y}" font-family="Rajdhani, 'Arial Narrow', sans-serif" font-weight="700" font-size="7.4" letter-spacing="1" fill="${l.hi ? '#e7e9ee' : '#8a93a6'}" stroke="#0b0d11" stroke-width="2.6" paint-order="stroke">${l.text}</text>`).join('');
function draw(V, vb, toks) {
  const body = SHAPES.map((s) => (DRAW[s.cls] ? V[DRAW[s.cls]](s, V) : '')).join('');
  const svg = `<svg viewBox="${vb}" class="map" role="img" aria-label="Night market, ${V.name}"><defs>${baseDefs}${V.defs}</defs>${V.ground()}${body}${V.overhead()}${V.route()}${labels()}${V.overlay()}${toks(V)}</svg>`;
  return svg.replaceAll('Q__', `${V.key}${vb.replace(/\D/g, '')}-`);
}
const van = (V) => face(ops[0], 33, 222, 9, V.soft) + face(ops[1], 50, 226, 9, V.soft);
const mid = (V) => face(ops[0], 176, 138, 9, V.soft) + face(ops[1], 192, 142, 9, V.soft);
const now = (vb, toks) => sitePlanSvg({ site: SITES.nightMarket }).replace(/viewBox="[^"]*"/, `viewBox="${vb}"`).replace('<g class="sp-tokens"></g>', `<g class="sp-tokens">${toks}</g>`);
const oldToks = (pts) => pts.map(([x, y], i) => `<g transform="translate(${x} ${y})"><circle r="6.5" fill="${ops[i].color}" stroke="#0b0d11" stroke-width="1.5"/><g clip-path="url(#now-clip)">${portrait(ops[i], { size: 13 }).replace('<svg ', '<svg x="-6.5" y="-6.5" ')}</g></g>`).join('');

const sections = [A, B, C, D, E].map((V) => `<section><h2>${V.name}</h2><p>${V.blurb}</p><div class="pair">
  <div><p class="cap">Whole map</p>${draw(V, '0 0 360 240', van)}</div><div><p class="cap">Close in</p>${draw(V, '60 90 190 127', mid)}</div></div></section>`).join('');

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Night Market map: five directions</title>
<style>
:root{--bg:#0a0c0f;--panel:#12151b;--line:#2a303b;--text:#e9ecf1;--muted:#8a93a6;--accent:#ff4f7b;--accent-2:#36d6c3;--warn:#f5b942;--danger:#ff5a5a}
body{margin:0;background:var(--bg);color:var(--text);font:15px/1.45 system-ui,sans-serif;padding:16px;max-width:1100px}
h1,h2{font-family:Rajdhani,'Arial Narrow',sans-serif;text-transform:uppercase;letter-spacing:.1em;margin:0 0 6px}h2{font-size:1.05rem;color:var(--accent-2)}
p{color:var(--muted);margin:0 0 10px}
section{background:var(--panel);border:1px solid var(--line);padding:14px;margin:14px 0;clip-path:polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,0 100%)}
.pair{display:grid;grid-template-columns:1fr 1fr;gap:14px}@media(max-width:760px){.pair{grid-template-columns:1fr}}
.cap{font:700 .72rem Rajdhani,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);margin:0 0 4px}
.map,.siteplan{display:block;width:100%;height:auto;aspect-ratio:3/2;background:#0b0d11}
${css}
.siteplan{height:auto!important}
</style></head><body>
<h1>Night Market map: five directions</h1>
<p>Every version uses the live site's coordinates, route, cover and labels; only the drawing changes. Faces are r 9 in all of them. Mockup only.</p>
<section><h2>Now (for reference)</h2><div class="pair"><div><p class="cap">Whole map</p>${now('0 0 360 240', oldToks([[33, 222], [44, 226]]))}</div><div><p class="cap">Close in</p>${now('60 90 190 127', oldToks([[160, 139], [172, 143]]))}</div></div>
<svg width="0" height="0" style="position:absolute"><defs><clipPath id="now-clip"><circle r="6.5"/></clipPath></defs></svg></section>
${sections}
</body></html>`;
writeFileSync(new URL('./map-variants.html', import.meta.url), html);
console.log('ok', html.length);
