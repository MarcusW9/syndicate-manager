// How a site plan is drawn (2026-11-12, the owner picked direction B of
// drafts/prototypes/map-variants.html): like the portraits and district pictures (ART.md), flat
// colour planes and one city light from the right. Things that stand up cast a hard navy shadow
// to the left and a little down, their right side catches the light, and nothing is blurred or
// outlined. Pure strings, no DOM; ui/siteplan.js and ui/minimap.js draw with it.

const NAVY = '#1b2340';
/** A site's city light when it names none (sodium). */
export const SITE_LIGHT = '#f2b544';

const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
/** a blended t of the way toward b (both #rrggbb). */
export const mix = (a, b, t) => '#' + rgb(a).map((v, i) => Math.round(v + (rgb(b)[i] - v) * t).toString(16).padStart(2, '0')).join('');
const hash = (a, b) => { const v = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return v - Math.floor(v); };

/** How tall each kind of thing stands: the length of its shadow, in map units. */
const HEIGHT = {
  'sp-building': 8, 'sp-house': 8, 'sp-tower': 10, 'sp-block': 7, 'sp-stable': 5, 'sp-bridge': 10,
  'sp-stall': 4, 'sp-cover': 3, 'sp-tank': 4, 'sp-planter': 2, 'sp-desk': 2, 'sp-turret': 2, 'sp-post': 2, 'sp-cot': 1.5,
};
/** Big things take the light as a strip down their right edge; small ones on their right third. */
const TALL = new Set(['sp-building', 'sp-house', 'sp-tower', 'sp-block', 'sp-stable']);

/** The rects a shape stands for (a row is n of them). */
export function rectsOf(s) {
  if (s.t === 'rect') return [{ x: s.x, y: s.y, w: s.w, h: s.h, fill: s.fill, i: 0 }];
  if (s.t !== 'row') return [];
  const out = [];
  for (let i = 0; i < s.n; i++) {
    if (s.skip?.includes(i)) continue;
    out.push({
      x: s.axis === 'y' ? s.x : s.x + i * s.step, y: s.axis === 'y' ? s.y + i * s.step : s.y, w: s.w, h: s.h,
      fill: s.tones?.[(i + (s.shift ?? 0)) % s.tones.length], i,
    });
  }
  return out;
}

/** A box's shadow with the light on its right: it falls left by len and down by 0.6 of that. */
function cast({ x, y, w, h }, len) {
  const d = len * 0.6;
  return `<polygon points="${x + w},${y} ${x + w},${y + h} ${x + w - len},${y + h + d} ${x - len},${y + h + d} ${x - len},${y + d} ${x},${y}"/>`;
}

/** Every shadow on a site, as one layer drawn under the things that cast them. */
export function shadowsSvg(shapes) {
  const out = [];
  for (const s of shapes) {
    const len = HEIGHT[s.cls];
    if (!len) continue;
    if (s.t === 'circle') out.push(`<circle cx="${s.cx - len * 0.7}" cy="${s.cy + len * 0.4}" r="${s.r}"/>`);
    else for (const r of rectsOf(s)) out.push(cast(r, len));
  }
  return out.length ? `<g class="sp-shade" fill="${NAVY}" opacity="0.8">${out.join('')}</g>` : '';
}

/** The light on a standing thing's right side, drawn over it; '' for things that don't stand. */
export function litSvg(cls, r, light) {
  if (!HEIGHT[cls] || r.w < 2) return '';
  if (TALL.has(cls)) return `<rect class="sp-lit" x="${r.x + r.w - 1.6}" y="${r.y}" width="1.6" height="${r.h}" fill="${light}" opacity="0.45"/>`;
  return `<rect class="sp-lit" x="${r.x + r.w * 0.65}" y="${r.y}" width="${r.w * 0.35}" height="${r.h}" fill="${light}" opacity="0.14"/>`;
}

/** A market stall from above: an awning in its colour, shadowed on the left, lit on the right, a lamp under it. */
function stall(r) {
  const tone = r.fill ?? '#8b93a7';
  const aw = Math.min(7, r.h * 0.58);
  return `<g class="sp-art">
    <rect x="${r.x}" y="${r.y + aw - 1}" width="${r.w}" height="${r.h - aw + 1}" fill="${mix(tone, NAVY, 0.7)}"/>
    <rect x="${r.x}" y="${r.y}" width="${r.w * 0.62}" height="${aw}" fill="${mix(tone, NAVY, 0.38)}"/>
    <rect x="${r.x + r.w * 0.62}" y="${r.y}" width="${r.w * 0.38}" height="${aw}" fill="${tone}"/>
    <rect x="${r.x + r.w - 1.2}" y="${r.y}" width="1.2" height="${r.h}" fill="${mix(tone, '#ffffff', 0.45)}"/>
    <rect x="${r.x + r.w / 2 - 1}" y="${r.y + aw + 1}" width="2" height="2" fill="#ffd9a0"/></g>`;
}

const CROWD = ['#6b7487', '#8a6f78', '#5f7a86', '#7a7390'];
/** Someone in the crowd from above: shoulders and a head, the left half in shadow. */
function person(r) {
  const cx = r.x + r.w / 2; const cy = r.y + r.h / 2;
  const hue = CROWD[Math.floor(hash(r.x, r.y + r.i) * CROWD.length)];
  return `<g class="sp-art">
    <polygon points="${cx},${cy} ${cx - 4},${cy + 2.6} ${cx - 2.4},${cy + 3.6}" fill="${NAVY}" opacity="0.8"/>
    <ellipse cx="${cx}" cy="${cy + 1}" rx="2.6" ry="2" fill="${mix(hue, NAVY, 0.45)}"/><path d="M${cx} ${cy - 1}a2.6 2 0 0 1 0 4z" fill="${hue}"/>
    <circle cx="${cx}" cy="${cy - 0.6}" r="1.4" fill="${mix('#b9a493', NAVY, 0.42)}"/><path d="M${cx} ${cy - 2}a1.4 1.4 0 0 1 0 2.8z" fill="#c9b19c"/></g>`;
}

/** A footbridge from above: a deck with rails, the posts across it and a lamp on each. */
function bridge(r) {
  const posts = Math.max(2, Math.floor(r.w / 17));
  return `<g class="sp-art">
    <rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" fill="#232a36"/><rect x="${r.x + r.w * 0.7}" y="${r.y}" width="${r.w * 0.3}" height="${r.h}" fill="#2c3443"/>
    <rect x="${r.x}" y="${r.y}" width="${r.w}" height="1.4" fill="#3a4356"/><rect x="${r.x}" y="${r.y + r.h - 1.4}" width="${r.w}" height="1.4" fill="#3a4356"/>
    ${Array.from({ length: posts }, (_, k) => `<rect x="${r.x + 4 + k * 17}" y="${r.y + 3}" width="0.7" height="${r.h - 6}" fill="#1a1f29"/><rect x="${r.x + 4 + k * 17}" y="${r.y - 3}" width="2" height="2" fill="#f2b544"/>`).join('')}</g>`;
}

/** Shapes with a drawing of their own (in place of a plain rect). */
export const DRAWN = { 'sp-stall': stall, 'sp-crowd': person, 'sp-bridge': bridge };

/** Paving under a site that has it: big slabs, every other one a shade lighter. */
export function pavingSvg(site, H) {
  if (!site.paving) return '';
  const out = [];
  for (let y = 0; y < H; y += 24) for (let x = 0; x < 360; x += 24) if ((x / 24 + y / 24) % 2) out.push(`<rect x="${x}" y="${y}" width="24" height="24" fill="#0f1218"/>`);
  return `<g class="sp-ground">${out.join('')}</g>`;
}

/** The site's city light falling across the ground, in hard-edged planes (drawn over the road). */
export function glowSvg(site) {
  const g = site.glow ?? [];
  return g.length ? `<g class="sp-ground">${g.map((x) => `<polygon points="${x.points.map((p) => p.join(',')).join(' ')}" fill="${x.color}" opacity="${x.op ?? 0.08}"/>`).join('')}</g>` : '';
}

/** Flat ground shapes, drawn before the shadows so a shadow can fall across them. */
export const GROUND = new Set(['sp-road', 'sp-road__line', 'sp-yard', 'sp-alley', 'sp-plaza', 'sp-water', 'sp-infield', 'sp-track']);
