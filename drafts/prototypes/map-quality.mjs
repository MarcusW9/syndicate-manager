// Mockup: the Night Market map as it is now, and the same map (same coordinates, same route) with a
// richer SVG art layer. Run: node drafts/prototypes/map-quality.mjs  -> drafts/prototypes/map-quality.html
import { writeFileSync, readFileSync } from 'node:fs';
import { SITES } from '../../src/data/sites.js';
import { gridSite, cutCorners } from '../../src/ui/route.js';
import { sitePlanSvg, shapeSvg } from '../../src/ui/siteplan.js';
import { portrait } from '../../src/ui/art.js';

const site = gridSite(SITES.nightMarket);
const css = readFileSync(new URL('../../src/ui/styles.css', import.meta.url), 'utf8').split('\n').filter((l) => /^\.sp-|^\.siteplan( |\.)|^\.sp-|\.sp-(stall|crowd|bridge|room|desk|sign|neon|gatepost|building|door|cover)/.test(l) && !/is-fight|@media/.test(l)).join('\n');

const ops = [
  { id: 'moth', name: 'Moth', handle: 'Moth', age: 27, color: '#36d6c3', stats: {} },
  { id: 'grid', name: 'Grid', handle: 'Grid', age: 31, color: '#f5b942', stats: {} },
];
const face = (op, x, y, r) => `<g transform="translate(${x} ${y})">
  <ellipse cx="0" cy="${r * 0.95}" rx="${r * 0.95}" ry="${r * 0.35}" fill="#000" opacity="0.55"/>
  <circle r="${r + 1.6}" fill="${op.color}" opacity="0.25" filter="url(#g-soft)"/>
  <g clip-path="url(#clip-${r})"><rect x="${-r}" y="${-r}" width="${r * 2}" height="${r * 2}" fill="#10131a"/>${portrait(op, { size: r * 2 }).replace('<svg ', `<svg x="${-r}" y="${-r}" `)}</g>
  <circle r="${r}" fill="none" stroke="#0b0d11" stroke-width="2.4"/><circle r="${r}" fill="none" stroke="${op.color}" stroke-width="1.2"/></g>`;

const expand = (s) => {
  if (s.t !== 'row') return [s];
  const out = [];
  for (let i = 0; i < s.n; i++) {
    if (s.skip?.includes(i)) continue;
    out.push({ ...s, t: 'rect', x: s.axis === 'y' ? s.x : s.x + i * s.step, y: s.axis === 'y' ? s.y + i * s.step : s.y, fill: s.tones?.[(i + (s.shift ?? 0)) % s.tones.length], i });
  }
  return out;
};
const hash = (a, b) => { const v = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return v - Math.floor(v); };

const defs = `<defs>
  <linearGradient id="g-ground" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a0c12"/><stop offset="1" stop-color="#11141c"/></linearGradient>
  <linearGradient id="g-road" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#171a22"/><stop offset="1" stop-color="#0c0e13"/></linearGradient>
  <radialGradient id="g-pink"><stop offset="0" stop-color="#ff3d5f" stop-opacity="0.38"/><stop offset="1" stop-color="#ff3d5f" stop-opacity="0"/></radialGradient>
  <radialGradient id="g-teal"><stop offset="0" stop-color="#3de8d8" stop-opacity="0.3"/><stop offset="1" stop-color="#3de8d8" stop-opacity="0"/></radialGradient>
  <radialGradient id="g-sod"><stop offset="0" stop-color="#f2b544" stop-opacity="0.42"/><stop offset="1" stop-color="#f2b544" stop-opacity="0"/></radialGradient>
  <radialGradient id="g-violet"><stop offset="0" stop-color="#b48cff" stop-opacity="0.4"/><stop offset="1" stop-color="#b48cff" stop-opacity="0"/></radialGradient>
  <radialGradient id="g-vig" cx="0.5" cy="0.5" r="0.75"><stop offset="0.55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.6"/></radialGradient>
  <linearGradient id="g-fog" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fb4d0" stop-opacity="0"/><stop offset="1" stop-color="#9fb4d0" stop-opacity="0.09"/></linearGradient>
  <filter id="g-soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.2"/></filter>
  <filter id="g-bloom" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.6"/></filter>
  <pattern id="p-pave" width="12" height="12" patternUnits="userSpaceOnUse"><path d="M0 .3H12M.3 0V12" stroke="#1b2029" stroke-width=".6" fill="none"/><path d="M6 6.3H12M6.3 6V12" stroke="#151922" stroke-width=".5" fill="none"/></pattern>
  <pattern id="p-roof" width="5" height="5" patternUnits="userSpaceOnUse"><path d="M0 4.5H5" stroke="#0e1118" stroke-width=".8"/><path d="M2.5 0V4.5" stroke="#0e1118" stroke-width=".5"/></pattern>
  <pattern id="p-plank" width="4" height="10" patternUnits="userSpaceOnUse"><path d="M.2 0V10" stroke="#06070a" stroke-width=".6"/></pattern>
  <clipPath id="clip-9"><circle r="9"/></clipPath><clipPath id="clip-6"><circle r="6"/></clipPath>
</defs>`;

function market() {
  const o = [];
  const shapes = site.shapes.flatMap(expand);
  // Ground: paving over the market, a wet road below, puddles that take the neon.
  o.push(`<rect width="360" height="240" fill="url(#g-ground)"/><rect width="360" height="212" fill="url(#p-pave)" opacity=".9"/>`);
  o.push(`<rect y="212" width="360" height="28" fill="url(#g-road)"/><line x1="0" y1="226" x2="360" y2="226" stroke="#2a2f3b" stroke-width="1" stroke-dasharray="7 7"/><rect y="211.4" width="360" height="1.2" fill="#262c38"/>`);
  for (const [x, c] of [[44, '#ff3d5f'], [118, '#3de8d8'], [186, '#b48cff'], [262, '#f2b544'], [330, '#ff3d5f']]) o.push(`<rect x="${x}" y="213" width="3" height="26" fill="${c}" opacity=".16" filter="url(#g-bloom)"/>`);
  for (const [x, y, rx, c] of [[150, 170, 14, '#ff3d5f'], [58, 94, 10, '#3de8d8'], [214, 100, 12, '#b48cff'], [200, 182, 9, '#f2b544'], [120, 62, 8, '#3de8d8']]) o.push(`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${rx * 0.34}" fill="#0a0d13"/><ellipse cx="${x - rx * 0.2}" cy="${y}" rx="${rx * 0.6}" ry="${rx * 0.16}" fill="${c}" opacity=".22"/>`);
  // Light pools under the lantern lines (drawn before the stalls so the stalls sit in them).
  for (const [x, y, r, g] of [[130, 160, 46, 'pink'], [70, 118, 40, 'teal'], [190, 118, 46, 'sod'], [130, 80, 40, 'violet'], [220, 160, 40, 'teal'], [92, 206, 30, 'sod']]) o.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="url(#g-${g})"/>`);
  // Footbridge's shadow on the ground.
  const br = shapes.find((s) => s.cls === 'sp-bridge');
  o.push(`<rect x="${br.x + 3}" y="${br.y + 14}" width="${br.w}" height="${br.h + 2}" fill="#000" opacity=".35" filter="url(#g-soft)"/>`);
  for (const s of shapes) {
    const c = s.cls;
    if (c === 'sp-stall') {
      const { x, y, w, h, fill } = s;
      o.push(`<g><rect x="${x + 1.5}" y="${y + 2.5}" width="${w}" height="${h}" fill="#000" opacity=".5"/>
        <rect x="${x}" y="${y + 6}" width="${w}" height="${h - 6}" fill="#1a1d27"/><rect x="${x}" y="${y + 6}" width="${w}" height="1" fill="#000" opacity=".5"/>
        ${[0, 1, 2].map((k) => `<rect x="${x + 2 + k * 5.2}" y="${y + 8}" width="3.4" height="2.2" fill="${['#f2d541', '#ff7a45', '#9be0a6'][(s.i + k) % 3]}" opacity=".8"/>`).join('')}
        <path d="M${x - 1} ${y + 7}L${x + 1.5} ${y}H${x + w - 1.5}L${x + w + 1} ${y + 7}Z" fill="${fill}"/>
        ${[0, 1, 2, 3].map((k) => `<rect x="${x + 2 + k * 4.4}" y="${y + 0.4}" width="2.2" height="6.4" fill="#0b0d11" opacity=".28"/>`).join('')}
        <path d="M${x - 1} ${y + 7}L${x + 1.5} ${y}H${x + w - 1.5}L${x + w + 1} ${y + 7}" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width=".5"/>
        <circle cx="${x + w / 2}" cy="${y + 8}" r="1.3" fill="#ffd9a0"/><circle cx="${x + w / 2}" cy="${y + 8}" r="4.5" fill="#f2b544" opacity=".18" filter="url(#g-bloom)"/></g>`);
    } else if (c === 'sp-crowd') {
      const hue = ['#6b7487', '#8a6f78', '#5f7a86', '#7a7390'][Math.floor(hash(s.x, s.y + s.i) * 4)];
      o.push(`<ellipse cx="${s.x + 1.5}" cy="${s.y + 4.2}" rx="3.2" ry="1.2" fill="#000" opacity=".5"/><ellipse cx="${s.x + 1.5}" cy="${s.y + 2.2}" rx="2.6" ry="2.2" fill="${hue}"/><circle cx="${s.x + 1.5}" cy="${s.y + 0.4}" r="1.5" fill="#b9a493"/><path d="M${s.x + 0.2} ${s.y + 0.3}a1.4 1.4 0 0 1 2.6 0" fill="none" stroke="#0b0d11" stroke-width=".8"/>`);
    } else if (c === 'sp-bridge') {
      o.push(`<rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" fill="#222733"/><rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" fill="url(#p-plank)"/>
        <rect x="${s.x}" y="${s.y}" width="${s.w}" height="1.6" fill="#4a5266"/><rect x="${s.x}" y="${s.y + s.h - 1.6}" width="${s.w}" height="1.6" fill="#4a5266"/>
        ${[0, 1, 2, 3, 4, 5, 6].map((k) => `<rect x="${s.x + 4 + k * 17}" y="${s.y - 3}" width="1.4" height="${s.h + 6}" fill="#323949"/><circle cx="${s.x + 4.7 + k * 17}" cy="${s.y - 3}" r="1" fill="#f2b544"/><circle cx="${s.x + 4.7 + k * 17}" cy="${s.y - 3}" r="6" fill="url(#g-sod)"/>`).join('')}`);
    } else if (c === 'sp-building') {
      o.push(`<rect x="${s.x + 3}" y="${s.y + 4}" width="${s.w}" height="${s.h}" fill="#000" opacity=".5" filter="url(#g-soft)"/><rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" fill="#141821"/><rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" fill="url(#p-roof)"/>
        <rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" fill="none" stroke="#4a5266" stroke-width="1.4"/><rect x="${s.x + 2}" y="${s.y + 2}" width="${s.w - 4}" height="${s.h - 4}" fill="none" stroke="#262c3a" stroke-width=".6"/>
        <rect x="${s.x + 8}" y="${s.y + 62}" width="16" height="10" fill="#1d222d" stroke="#323949" stroke-width=".6"/><circle cx="${s.x + 16}" cy="${s.y + 67}" r="3.4" fill="none" stroke="#323949" stroke-width=".7"/><path d="M${s.x + 16} ${s.y + 63.6}L${s.x + 18.4} ${s.y + 69.4}M${s.x + 16} ${s.y + 63.6}L${s.x + 13.6} ${s.y + 69.4}" stroke="#323949" stroke-width=".5"/>
        <rect x="${s.x + 8}" y="${s.y + 82}" width="10" height="10" fill="#1d222d" stroke="#323949" stroke-width=".6"/>`);
    } else if (c === 'sp-room') {
      o.push(`<rect x="${s.x - 2}" y="${s.y - 2}" width="${s.w + 4}" height="${s.h + 4}" fill="#2b2038"/><rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" fill="#2a2118"/>
        <rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" fill="url(#g-violet)" opacity=".45"/>
        ${[0, 1, 2, 3].map((k) => `<rect x="${s.x}" y="${s.y + 6 + k * 11}" width="${s.w}" height=".5" fill="#000" opacity=".25"/>`).join('')}
        <circle cx="${s.x + 22}" cy="${s.y + 22}" r="26" fill="url(#g-sod)"/>
        <rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" fill="none" stroke="#b48cff" stroke-opacity=".7" stroke-width="1"/>`);
    } else if (c === 'sp-desk') {
      o.push(`<rect x="${s.x + 1}" y="${s.y + 2}" width="${s.w}" height="${s.h}" fill="#000" opacity=".5"/><rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" rx="1.5" fill="#0f5a46"/><rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" rx="1.5" fill="none" stroke="#6b4a2a" stroke-width="1.2"/>
        ${[0, 1, 2, 3].map((k) => `<rect x="${s.x + 2.5 + k * 3}" y="${s.y + 3.6}" width="2.2" height="3" fill="#e9e1cf"/>`).join('')}`);
    } else if (c === 'sp-cover') {
      o.push(`<rect x="${s.x + 1.5}" y="${s.y + 2.5}" width="${s.w}" height="${s.h}" fill="#000" opacity=".55"/><rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" rx="1" fill="${s.fill}"/>
        <rect x="${s.x}" y="${s.y}" width="${s.w}" height="2" fill="#fff" opacity=".14"/><rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" rx="1" fill="none" stroke="#3a4356" stroke-width=".8"/>
        ${Array.from({ length: Math.max(1, Math.floor(s.w / 8)) }, (_, k) => `<path d="M${s.x + 3 + k * 8} ${s.y + 1}V${s.y + s.h - 1}" stroke="#000" stroke-opacity=".35" stroke-width=".7"/>`).join('')}`);
    } else if (c === 'sp-sign') {
      o.push(`<rect x="${s.x - 2}" y="${s.y - 2}" width="${s.w + 4}" height="${s.h + 4}" fill="#b48cff" opacity=".35" filter="url(#g-bloom)"/><rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" rx="1" fill="#14101d" stroke="#d3b8ff" stroke-width=".9"/>
        ${[0, 1, 2, 3, 4].map((k) => `<rect x="${s.x + 4 + k * 7}" y="${s.y + 1.6}" width="3.4" height="1.8" fill="#d3b8ff"/>`).join('')}`);
    } else if (c === 'sp-door') {
      o.push(`<rect x="${s.x - 4}" y="${s.y}" width="${s.w + 10}" height="${s.h}" fill="url(#g-pink)"/><rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" fill="#ff4f7b" opacity=".85"/>`);
    } else if (c === 'sp-gatepost') {
      o.push(`<rect x="${s.x1 - 2}" y="${s.y1 - 1}" width="4" height="${s.y2 - s.y1 + 2}" fill="#2a303c" stroke="#4a5266" stroke-width=".6"/><rect x="${s.x1 - 2.6}" y="${s.y1 - 2.6}" width="5.2" height="2.4" fill="#4a5266"/>`);
    } else if (c === 'sp-neon') {
      o.push(`<line x1="${s.x1}" y1="${s.y1}" x2="${s.x2}" y2="${s.y2}" stroke="#ff3d5f" stroke-width="5" opacity=".5" filter="url(#g-bloom)"/><line x1="${s.x1}" y1="${s.y1}" x2="${s.x2}" y2="${s.y2}" stroke="#ff9aab" stroke-width="1.6" stroke-linecap="round"/>
        <rect x="${s.x1 - 6}" y="${s.y1 + 8}" width="${s.x2 - s.x1 + 12}" height="14" fill="url(#g-pink)"/>`);
    }
  }
  return o.join('\n');
}

function labels() {
  return site.labels.map((l) => `<text x="${l.x}" y="${l.y}" font-family="Rajdhani, 'Arial Narrow', sans-serif" font-weight="700" font-size="7.4" letter-spacing="1" fill="${l.hi ? '#e7e9ee' : '#8a93a6'}" stroke="#0b0d11" stroke-width="2.6" paint-order="stroke">${l.text}</text>`).join('');
}
function route() {
  const d = cutCorners([...site.paths.in, ...site.paths.inside.slice(1), ...site.paths.target.slice(1)]);
  const P = site.points;
  return `<path d="${d}" fill="none" stroke="#3de8d8" stroke-width="5" opacity=".28" filter="url(#g-bloom)" stroke-linecap="round" stroke-linejoin="round"/>
   <path d="${d}" fill="none" stroke="#0b0d11" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>
   <path d="${d}" fill="none" stroke="#7ff3e6" stroke-width="1.6" stroke-dasharray="1 4.2" stroke-linecap="round" stroke-linejoin="round"/>
   <circle cx="${P.target[0]}" cy="${P.target[1]}" r="9" fill="none" stroke="#ff4f7b" stroke-width=".8" stroke-dasharray="2 2"/><circle cx="${P.target[0]}" cy="${P.target[1]}" r="4" fill="#2a1520" stroke="#ff4f7b" stroke-width="1.4"/><circle cx="${P.target[0]}" cy="${P.target[1]}" r="12" fill="url(#g-pink)"/>`;
}
const proposed = (vb, toks) => `<svg viewBox="${vb}" class="map" role="img" aria-label="Night market, proposed art">${defs}${market()}${route()}${labels()}
  <rect width="360" height="240" fill="url(#g-fog)"/><rect width="360" height="240" fill="url(#g-vig)"/>${toks}</svg>`;

const vanToks = face(ops[0], 33, 222, 9) + face(ops[1], 50, 226, 9);
const midToks = face(ops[0], 176, 138, 9) + face(ops[1], 192, 142, 9);
const nowSvg = (vb, toks) => sitePlanSvg({ site: SITES.nightMarket }).replace(/viewBox="[^"]*"/, `viewBox="${vb}"`).replace('<g class="sp-tokens"></g>', `<g class="sp-tokens">${toks}</g>`);
const oldToks = (pts) => pts.map(([x, y], i) => `<g><circle cx="${x}" cy="${y}" r="6.5" fill="${ops[i].color}" stroke="#0b0d11" stroke-width="1.5"/><g transform="translate(${x} ${y})"><g clip-path="url(#clip-6)">${portrait(ops[i], { size: 13 }).replace('<svg ', '<svg x="-6.5" y="-6.5" ')}</g></g></g>`).join('');

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Map art: now and proposed</title>
<style>
:root{--bg:#0a0c0f;--panel:#12151b;--line:#2a303b;--text:#e9ecf1;--muted:#8a93a6;--accent:#ff4f7b;--accent-2:#36d6c3;--warn:#f5b942;--danger:#ff5a5a}
body{margin:0;background:var(--bg);color:var(--text);font:15px/1.45 system-ui,sans-serif;padding:16px;max-width:1100px}
h1,h2{font-family:Rajdhani,'Arial Narrow',sans-serif;text-transform:uppercase;letter-spacing:.1em;margin:0 0 6px}h2{font-size:1rem;color:var(--accent-2)}
p{color:var(--muted);margin:0 0 10px}
section{background:var(--panel);border:1px solid var(--line);padding:14px;margin:14px 0;clip-path:polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,0 100%)}
.pair{display:grid;grid-template-columns:1fr 1fr;gap:14px}@media(max-width:760px){.pair{grid-template-columns:1fr}}
.cap{font:700 .72rem Rajdhani,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);margin:0 0 4px}
.map,.siteplan{display:block;width:100%;height:auto;aspect-ratio:3/2;background:#0b0d11}
${css}
.siteplan{height:auto!important}
</style></head><body>
<h1>Night Market: map art, now and proposed</h1>
<p>Same coordinates, route, cover and labels; only the drawing changes, so it drops into <code>shapeSvg</code> and the district sites with no logic change. Mockup only, nothing in the game is touched.</p>
<section><h2>Whole map</h2><div class="pair"><div><p class="cap">Now</p>${nowSvg('0 0 360 240', oldToks([[33, 222], [44, 226]]))}</div><div><p class="cap">Proposed</p>${proposed('0 0 360 240', vanToks)}</div></div></section>
<section><h2>Close in (the camera while crossing the market)</h2><div class="pair"><div><p class="cap">Now</p>${nowSvg('60 90 190 127', oldToks([[160, 139], [172, 143]]))}</div><div><p class="cap">Proposed</p>${proposed('60 90 190 127', midToks)}</div></div></section>
<section><h2>The back room</h2><div class="pair"><div><p class="cap">Now</p>${nowSvg('200 20 160 107', '')}</div><div><p class="cap">Proposed</p>${proposed('200 20 160 107', '')}</div></div></section>
</body></html>`;
writeFileSync(new URL('./map-quality.html', import.meta.url), html);
console.log('ok', html.length);
