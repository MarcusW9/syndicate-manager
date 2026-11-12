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
  'sp-building': 8, 'sp-house': 8, 'sp-stand': 9, 'sp-tower': 10, 'sp-block': 7, 'sp-stable': 5, 'sp-bridge': 10,
  'sp-stall': 4, 'sp-cover': 3, 'sp-tank': 4, 'sp-planter': 2, 'sp-desk': 2, 'sp-turret': 2, 'sp-post': 2, 'sp-cot': 1.5,
};
/** Big things take the light as a strip down their right edge; small ones on their right third. */
const TALL = new Set(['sp-building', 'sp-house', 'sp-tower', 'sp-block', 'sp-stable', 'sp-stand']);

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

// --- each district's own drawings (site.look) --------------------------------------------------
// The things only one district has, drawn in place of the plain shape. A drawer takes the shape's
// rect (or the shape itself, for lines, circles and ellipses) and the site's light.

const lines = (segs, stroke, w = 0.5, op = 1) => (segs.length ? `<path d="${segs.join('')}" stroke="${stroke}" stroke-width="${w}" opacity="${op}" fill="none"/>` : '');

/** A shipping container: ribs across its length, the doors at one end catching the light. */
function container(r, light) {
  const tone = r.fill ?? '#1b2433';
  if (r.w < 16 && r.h < 16) return crate(r, light);
  const across = r.w >= r.h;
  const ribs = [];
  if (across) for (let x = r.x + 2; x < r.x + r.w - 3; x += 2.4) ribs.push(`M${x} ${r.y + 0.6}V${r.y + r.h - 0.6}`);
  else for (let y = r.y + 2; y < r.y + r.h - 3; y += 2.4) ribs.push(`M${r.x + 0.6} ${y}H${r.x + r.w - 0.6}`);
  const door = across ? `<rect x="${r.x + r.w - 2.4}" y="${r.y}" width="2.4" height="${r.h}" fill="${mix(tone, light, 0.3)}"/>` : `<rect x="${r.x}" y="${r.y + r.h - 2.4}" width="${r.w}" height="2.4" fill="${mix(tone, light, 0.3)}"/>`;
  return `<g class="sp-art"><rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" fill="${tone}"/>${lines(ribs, '#000', 0.6, 0.3)}${door}
    <rect x="${r.x}" y="${r.y}" width="${r.w}" height="1" fill="${mix(tone, '#ffffff', 0.12)}"/></g>`;
}

/** A crate or bin: planks across, lit on its right third. */
function crate(r, light) {
  const tone = r.fill ?? '#2a303b';
  const planks = [];
  for (let y = r.y + 2.5; y < r.y + r.h - 1; y += 2.5) planks.push(`M${r.x + 0.5} ${y}H${r.x + r.w - 0.5}`);
  return `<g class="sp-art"><rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" fill="${tone}"/>${lines(planks, '#000', 0.5, 0.3)}
    <rect x="${r.x + r.w * 0.65}" y="${r.y}" width="${r.w * 0.35}" height="${r.h}" fill="${light}" opacity="0.14"/></g>`;
}

/** The harbour: dark water, the swell in short strokes, the city's lights broken up on it. */
function water(r) {
  const swell = []; const glints = [];
  for (let y = r.y + 6; y < r.y + r.h; y += 7) for (let x = r.x + 2 + ((y / 7) % 2) * 5; x < r.x + r.w - 6; x += 12) swell.push(`M${x} ${y}h6`);
  for (let y = r.y + 30; y < r.y + r.h - 20; y += 46) for (let k = 0; k < 5; k++) glints.push(`M${r.x + 6 + hash(y, k) * (r.w - 16)} ${y + k * 3}h${2 + hash(k, y) * 5}`);
  return `<g class="sp-art"><rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" fill="#0d1620"/>${lines(swell, '#1f3346', 0.6)}${lines(glints, '#f2b544', 0.8, 0.5)}</g>`;
}

/** A jetty or pier: boards across it. */
function jetty(r) {
  const boards = [];
  for (let x = r.x + 2; x < r.x + r.w; x += 2.5) boards.push(`M${x} ${r.y}V${r.y + r.h}`);
  return `<g class="sp-art"><rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" fill="#2a2f3b"/>${lines(boards, '#12151c', 0.6)}<rect x="${r.x}" y="${r.y}" width="${r.w}" height="1" fill="#3a4152"/></g>`;
}

/** A flat roof from above: a parapet, and what stands on it (air-con units, a vent, a hatch). */
function roof(r, light, { helipad = false } = {}) {
  const bits = [];
  if (helipad) {
    const cx = r.x + r.w * 0.42; const cy = r.y + r.h / 2; const rad = Math.min(r.w, r.h) * 0.32;
    bits.push(`<circle cx="${cx}" cy="${cy}" r="${rad}" fill="#1a2029" stroke="#f2d541" stroke-opacity="0.55" stroke-width="0.8"/>`,
      `<path d="M${cx - 3} ${cy - 4}v8M${cx + 3} ${cy - 4}v8M${cx - 3} ${cy}h6" stroke="#f2d541" stroke-opacity="0.6" stroke-width="1.1" fill="none"/>`);
  }
  const n = Math.max(2, Math.floor(r.w / 26));
  for (let k = 0; k < n; k++) {
    const x = r.x + 5 + hash(r.x + k, r.y) * (r.w - 16); const y = r.y + 5 + hash(r.y + k, r.x) * (r.h - 16);
    if (helipad && Math.abs(x - (r.x + r.w * 0.42)) < Math.min(r.w, r.h) * 0.4) continue;
    bits.push(`<polygon points="${x + 7},${y} ${x + 7},${y + 6} ${x + 5},${y + 7.2} ${x - 2},${y + 7.2} ${x - 2},${y + 1.2} ${x},${y}" fill="${NAVY}" opacity="0.8"/>`,
      `<rect x="${x}" y="${y}" width="7" height="6" fill="#222835"/><rect x="${x + 4.6}" y="${y}" width="2.4" height="6" fill="${mix('#222835', light, 0.25)}"/><circle cx="${x + 2.6}" cy="${y + 3}" r="1.7" fill="none" stroke="#131720" stroke-width="0.6"/>`);
  }
  return `<g class="sp-art"><rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" fill="#141820"/>
    <rect x="${r.x + 1.5}" y="${r.y + 1.5}" width="${r.w - 3}" height="${r.h - 3}" fill="none" stroke="#0e1117" stroke-width="1.2"/>${bits.join('')}
    <rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" fill="none" stroke="#2f3644" stroke-width="1"/></g>${litSvg('sp-block', r, light)}`;
}

/** A rooftop water tank: a drum seen from above, its lid ringed, lit on the right. */
function tank(s, light) {
  return `<g class="sp-art"><circle cx="${s.cx}" cy="${s.cy}" r="${s.r}" fill="#1b2230"/><path d="M${s.cx} ${s.cy - s.r}a${s.r} ${s.r} 0 0 1 0 ${s.r * 2}z" fill="${mix('#1b2230', light, 0.22)}"/>
    <circle cx="${s.cx}" cy="${s.cy}" r="${s.r * 0.6}" fill="none" stroke="#0e1117" stroke-width="0.7"/><circle cx="${s.cx}" cy="${s.cy}" r="${s.r}" fill="none" stroke="#7a6430" stroke-width="1.2"/></g>`;
}

const CLOTH = ['#8a3a48', '#2f6a74', '#b8a988', '#4a4f7a', '#7a6a3a', '#c9c3b6'];
/** A washing line: the line, and what's pegged on it (each piece lit on its right). */
function laundry(s) {
  const out = [`<polyline points="${s.points.map((p) => p.join(',')).join(' ')}" fill="none" stroke="#5a6272" stroke-width="0.5"/>`];
  for (let i = 0; i + 1 < s.points.length; i++) {
    const [a, b] = [s.points[i], s.points[i + 1]];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    for (let d = 5; d < len - 4; d += 9) {
      const t = d / len; const x = a[0] + (b[0] - a[0]) * t; const y = a[1] + (b[1] - a[1]) * t;
      if (hash(x, y) < 0.25) continue;
      const c = CLOTH[Math.floor(hash(y, x) * CLOTH.length)]; const w = 3 + hash(x + 1, y) * 3;
      out.push(`<rect x="${x}" y="${y}" width="${w}" height="3.4" fill="${mix(c, NAVY, 0.3)}"/><rect x="${x + w * 0.6}" y="${y}" width="${w * 0.4}" height="3.4" fill="${c}"/>`);
    }
  }
  return `<g class="sp-art">${out.join('')}</g>`;
}

/** A planter: a concrete bed, shrubs in it, each lit on its right. */
function planter(r, light) {
  const shrubs = [];
  for (let x = r.x + 3.5; x < r.x + r.w - 2; x += 5) {
    const rad = 2.2 + hash(x, r.y) * 1.2; const cy = r.y + r.h / 2 + (hash(r.y, x) - 0.5) * 2;
    shrubs.push(`<circle cx="${x}" cy="${cy}" r="${rad}" fill="#1f3a2c"/><path d="M${x} ${cy - rad}a${rad} ${rad} 0 0 1 0 ${rad * 2}z" fill="${mix('#2e5a40', light, 0.15)}"/>`);
  }
  return `<g class="sp-art"><rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" fill="#2a2f38"/><rect x="${r.x + 1}" y="${r.y + 1}" width="${r.w - 2}" height="${r.h - 2}" fill="#141a14"/>${shrubs.join('')}</g>`;
}

/** A stable block: a pitched roof along its length, the far half in shadow, the near half lit, a ridge. */
function stable(r, light) {
  const half = r.h / 2;
  return `<g class="sp-art"><rect x="${r.x}" y="${r.y}" width="${r.w}" height="${half}" fill="#16130f"/><rect x="${r.x}" y="${r.y + half}" width="${r.w}" height="${half}" fill="${mix('#1a1712', light, 0.1)}"/>
    <rect x="${r.x}" y="${r.y + half - 0.6}" width="${r.w}" height="1.2" fill="#4a3f2a"/><rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" fill="none" stroke="#4a3f2a" stroke-width="1"/></g>${litSvg('sp-stable', r, light)}`;
}

/** The track: packed dirt with the harrow's lines in it, and the outer rail. */
function track(s) {
  const e = (d, rest) => `<ellipse cx="${s.cx}" cy="${s.cy}" rx="${s.rx - d}" ry="${s.ry - d}" ${rest}/>`;
  return `<g class="sp-art">${e(0, 'fill="#2b2418"')}${e(5, 'fill="none" stroke="#3a3122" stroke-width="0.6" stroke-dasharray="5 4"')}${e(10, 'fill="none" stroke="#3a3122" stroke-width="0.6" stroke-dasharray="5 4"')}
    ${e(0, 'fill="none" stroke="#f7efc8" stroke-width="1.3" opacity="0.75"')}</g>`;
}

/** A grandstand's roof from above: a concrete cantilever, ribs running back from the lip over the
 *  track, plant on top (a hatch, a mast), lit on its right. */
function stand(r, light) {
  const ribs = [];
  for (let x = r.x + 4; x < r.x + r.w - 2; x += 4.5) ribs.push(`M${x} ${r.y + 3}V${r.y + r.h - 1}`);
  return `<g class="sp-art"><rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" fill="#1a1d24"/>
    <path d="${ribs.join('')}" stroke="#12151b" stroke-width="0.9" fill="none"/>
    <rect x="${r.x}" y="${r.y + r.h - 3}" width="${r.w}" height="3" fill="#2a2f3a"/><rect x="${r.x}" y="${r.y}" width="${r.w}" height="2" fill="#141820"/>
    <rect x="${r.x + r.w * 0.62}" y="${r.y + 6}" width="7" height="6" fill="#232935"/><rect x="${r.x + r.w * 0.62 + 4.6}" y="${r.y + 6}" width="2.4" height="6" fill="${mix('#232935', light, 0.25)}"/>
    <rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" fill="none" stroke="#3a4152" stroke-width="1"/></g>${litSvg('sp-stand', r, light)}`;
}

/** The infield: grass mown in bands, and the inner rail round it. */
function infield(s) {
  const rings = [];
  for (let k = 0; k * 12 < Math.min(s.rx, s.ry); k++) rings.push(`<ellipse cx="${s.cx}" cy="${s.cy}" rx="${s.rx - k * 12}" ry="${s.ry - k * 12}" fill="${k % 2 ? '#0f1a14' : '#122019'}"/>`);
  return `<g class="sp-art">${rings.join('')}<ellipse cx="${s.cx}" cy="${s.cy}" rx="${s.rx}" ry="${s.ry}" fill="none" stroke="#f7efc8" stroke-width="1" opacity="0.6"/></g>`;
}

/** Drawers by district (site.look), by class. */
export const LOOKS = {
  docks: { 'sp-cover': container, 'sp-water': water, 'sp-jetty': jetty, 'sp-pier': jetty },
  oldTown: { 'sp-block': (r, l) => roof(r, l), 'sp-tank': tank, 'sp-laundry': laundry, 'sp-cover': crate },
  heights: { 'sp-planter': planter, 'sp-block': (r, l) => roof(r, l, { helipad: true }) },
  basin: { 'sp-stand': stand, 'sp-stable': stable, 'sp-track': track, 'sp-infield': infield, 'sp-cover': crate },
};

// --- ground textures (site.texture: [{ kind, x, y, w, h }], drawn over the flat ground shapes) --
const TEXTURE = {
  /** Poured concrete in big slabs, the odd crack. */
  concrete: ({ x, y, w, h }) => {
    const seg = []; const cracks = [];
    for (let gx = x + 30; gx < x + w; gx += 30) seg.push(`M${gx} ${y}V${y + h}`);
    for (let gy = y + 30; gy < y + h; gy += 30) seg.push(`M${x} ${gy}H${x + w}`);
    for (let gx = x; gx < x + w; gx += 30) for (let gy = y; gy < y + h; gy += 30) if (hash(gx, gy) < 0.3) cracks.push(`M${gx + 6 + hash(gy, gx) * 14} ${gy + 4}l3 5l-2 4l4 6`);
    return lines(seg, '#161a22', 0.7) + lines(cracks, '#151920', 0.5);
  },
  /** Cobbles: short stones in offset courses. */
  cobble: ({ x, y, w, h }) => {
    const seg = [];
    for (let gy = y; gy < y + h; gy += 5) {
      seg.push(`M${x} ${gy}H${x + w}`);
      for (let gx = x + ((gy - y) / 5 % 2) * 4; gx < x + w; gx += 8) seg.push(`M${gx} ${gy}V${Math.min(gy + 5, y + h)}`);
    }
    return lines(seg, '#0b0e13', 0.5, 0.9);
  },
  /** Big square plaza tiles. */
  tiles: ({ x, y, w, h }) => {
    const seg = [];
    for (let gx = x + 16; gx < x + w; gx += 16) seg.push(`M${gx} ${y}V${y + h}`);
    for (let gy = y + 16; gy < y + h; gy += 16) seg.push(`M${x} ${gy}H${x + w}`);
    return lines(seg, '#1c222c', 0.6);
  },
  /** Gravel: a scatter of small stones. */
  gravel: ({ x, y, w, h }) => {
    const dots = [];
    for (let k = 0, n = Math.floor((w * h) / 60); k < n; k++) dots.push(`M${(x + hash(k, x) * w).toFixed(1)} ${(y + hash(y, k) * h).toFixed(1)}h0.8`);
    return lines(dots, '#262b33', 0.8);
  },
};
/** A site's ground textures (site.texture), over its flat ground shapes. */
export function textureSvg(site) {
  const t = site.texture ?? [];
  return t.length ? `<g class="sp-ground">${t.map((x) => TEXTURE[x.kind]?.(x) ?? '').join('')}</g>` : '';
}

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
