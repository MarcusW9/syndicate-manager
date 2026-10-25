// Lantern Bay from above (WORLD.md, Geography): a made-up coast, terrain, a street grid
// with each district's own character, and a wave-pattern sea. All decoration: names,
// readouts and the district card carry the meaning. Geometry is seeded, so the city
// draws the same every time, and it's built once per session.
//
// Adding a district: one entry in DISTRICT_MAP (its area, streets and label spot). The
// island has room to grow: the north shore, the valley east of the Peak and the wild
// island to the west carry no district yet.

/** Small seeded generator for decoration only (game randomness stays in core/rng.js). */
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

/** Roughen a polygon into a coastline: split each edge and push the midpoint sideways. */
function coast(points, seed, rough = 0.24, depth = 4) {
  const rnd = seeded(seed);
  let pts = points;
  for (let i = 0; i < depth; i++) {
    const out = [];
    pts.forEach((a, k) => {
      const b = pts[(k + 1) % pts.length];
      const off = (rnd() - 0.5) * rough;
      out.push(a, [(a[0] + b[0]) / 2 - (b[1] - a[1]) * off, (a[1] + b[1]) / 2 + (b[0] - a[0]) * off]);
    });
    pts = out;
  }
  return pts;
}

const path = (pts) => `M${pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('L')}Z`;
const ring = (cx, cy, rx, ry, n = 9) => Array.from({ length: n }, (_, k) => [cx + Math.cos((k / n) * Math.PI * 2) * rx, cy + Math.sin((k / n) * Math.PI * 2) * ry]);

/** A street lattice over a box: jittered, turned, with some links dropped. */
function streets({ box: [x0, y0, x1, y1], step, angle = 0, jitter = 0, keepX = 1, keepY = 1, seed }) {
  const rnd = seeded(seed);
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;
  const r = (angle * Math.PI) / 180;
  const pad = Math.max(x1 - x0, y1 - y0) * 0.4;
  const cols = Math.ceil((x1 - x0 + pad * 2) / step);
  const rows = Math.ceil((y1 - y0 + pad * 2) / step);
  const p = [];
  for (let i = 0; i <= cols; i++) {
    p[i] = [];
    for (let j = 0; j <= rows; j++) {
      const x = x0 - pad + i * step + (rnd() - 0.5) * jitter - cx;
      const y = y0 - pad + j * step + (rnd() - 0.5) * jitter - cy;
      p[i][j] = `${(cx + x * Math.cos(r) - y * Math.sin(r)).toFixed(1)} ${(cy + x * Math.sin(r) + y * Math.cos(r)).toFixed(1)}`;
    }
  }
  let out = '';
  for (let i = 0; i <= cols; i++) {
    for (let j = 0; j <= rows; j++) {
      if (i < cols && rnd() < keepX) out += `M${p[i][j]}L${p[i + 1][j]}`;
      if (j < rows && rnd() < keepY) out += `M${p[i][j]}L${p[i][j + 1]}`;
    }
  }
  return out;
}

export const MAP_W = 360;
export const MAP_H = 520;

// Land. The island, with the Peak in the middle and room on the north shore; the wild
// island to the west (no district yet); the Amber Reach out in the harbour; the mainland.
const ISLAND = [[86, 150], [92, 118], [110, 96], [104, 70], [128, 52], [150, 50], [164, 70], [182, 60], [190, 34], [214, 20], [252, 30], [280, 26], [310, 48], [322, 74], [300, 90], [326, 104], [346, 96], [352, 124], [340, 150], [352, 150], [336, 170], [346, 196], [340, 226], [312, 244], [284, 236], [262, 250], [232, 242], [204, 254], [178, 244], [152, 256], [124, 246], [100, 252], [80, 236], [90, 210], [74, 186]];
const WEST = [[8, 170], [22, 140], [46, 126], [62, 150], [56, 176], [68, 204], [60, 236], [64, 262], [44, 284], [22, 276], [12, 248], [20, 220], [6, 196]];
const AMBER = [[150, 300], [184, 288], [228, 290], [250, 306], [240, 330], [202, 338], [164, 330]];
const MAINLAND = [[-20, 384], [50, 376], [110, 386], [170, 374], [230, 382], [280, 372], [380, 380], [380, 560], [-20, 560]];
const MUDFLAT = [[248, 378], [306, 364], [358, 368], [360, 436], [318, 448], [270, 434]];
const ISLETS = [[96, 300, 6], [330, 290, 8], [300, 342, 5], [122, 336, 4], [350, 320, 4], [84, 350, 5], [76, 120, 4]];
const PIERS = [30, 54, 78, 102, 126, 150].map((x) => [[x, 356], [x + 9, 356], [x + 9, 388], [x, 388]]);
const PEAK = [[186, 74], [214, 62], [244, 72], [252, 98], [228, 116], [196, 114], [180, 96]];

// Each district's streets say what it's like (WORLD.md): switchbacks up the Peak, a
// corporate grid on the ridge, crooked lanes in Old Town, a dense tangle in the market,
// haul roads at the docks, almost nothing in the Silt.
const DISTRICT_MAP = {
  ironPeak: { area: PEAK, label: [216, 92], streets: 'M180 112C200 104 228 110 240 100S206 92 196 86S226 76 232 70S208 66 204 60' },
  heights: {
    area: [[76, -20], [380, -20], [380, 166], [300, 160], [248, 172], [205, 162], [160, 172], [110, 160], [76, 170]],
    hole: PEAK, label: [292, 138], streets: { box: [76, 20, 352, 172], step: 13, angle: -6, keepX: 0.9, keepY: 0.88, seed: 11 },
  },
  oldTown: {
    area: [[76, 170], [110, 160], [160, 172], [205, 162], [202, 215], [200, 272], [76, 272]],
    label: [140, 210], streets: { box: [76, 160, 205, 258], step: 7, angle: 18, jitter: 3.5, keepX: 0.72, keepY: 0.62, seed: 12 },
  },
  nightMarket: {
    area: [[205, 162], [248, 172], [300, 160], [380, 166], [380, 272], [200, 272], [202, 215]],
    label: [276, 210], streets: { box: [200, 160, 352, 256], step: 6, angle: -11, jitter: 1.5, keepX: 0.86, keepY: 0.78, seed: 13 },
  },
  amberReach: {
    area: [[120, 276], [290, 276], [290, 350], [120, 350]],
    label: [200, 314], streets: { box: [150, 286, 252, 340], step: 8, angle: 45, jitter: 1, keepX: 0.9, keepY: 0.9, seed: 14 },
  },
  docks: {
    area: [[-20, 352], [250, 352], [258, 420], [280, 460], [280, 560], [-20, 560]],
    label: [118, 444], streets: { box: [0, 352, 260, 520], step: 9, keepX: 1, keepY: 0.22, seed: 15 },
  },
  silt: {
    area: [[250, 352], [380, 352], [380, 560], [280, 560], [280, 460], [258, 420]],
    label: [314, 410], streets: { box: [250, 360, 360, 520], step: 10, angle: 28, jitter: 5, keepX: 0.35, keepY: 0.3, seed: 16 },
  },
};
export const MAP_DISTRICTS = Object.keys(DISTRICT_MAP);

// Terrain heights: rolling noise everywhere, the Peak rising in the middle of the island,
// a lower ridge on the west island, the mainland flat.
const HILLS = [[216, 92, 80, 56, 1.2], [36, 210, 34, 64, 0.7], [300, 110, 40, 30, 0.35]];

/** Smooth value noise, seeded. */
function noise2(seed) {
  const rnd = seeded(seed);
  const n = 256;
  const perm = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [perm[i], perm[j]] = [perm[j], perm[i]];
  }
  const val = Array.from({ length: n }, () => rnd());
  const at = (x, y) => val[perm[(perm[x & 255] + y) & 255]];
  const fade = (t) => t * t * (3 - 2 * t);
  return (x, y) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const u = fade(x - xi);
    const v = fade(y - yi);
    const a = at(xi, yi) + (at(xi + 1, yi) - at(xi, yi)) * u;
    const b = at(xi, yi + 1) + (at(xi + 1, yi + 1) - at(xi, yi + 1)) * u;
    return a + (b - a) * v;
  };
}

/**
 * Hill shading, drawn once into an image (a blob URL the browser keeps decoded), so
 * re-rendering the page costs nothing. Returns '' where there's no canvas.
 */
let reliefUrl = null;
function relief() {
  if (reliefUrl !== null) return reliefUrl;
  reliefUrl = '';
  const canvas = typeof document !== 'undefined' && document.createElement('canvas');
  const ctx = canvas?.getContext?.('2d');
  if (!ctx) return reliefUrl;
  // Half resolution: the shading is soft, and a quarter of the pixels keeps the first
  // visit to the City tab quick on older phones.
  const S = 2;
  const W = MAP_W / S;
  const H = MAP_H / S;
  canvas.width = W;
  canvas.height = H;
  const n = noise2(9);
  const h = new Float32Array(W * H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      let v = 0;
      let amp = 0.5;
      let f = 1 / 40;
      const mx = x * S;
      const my = y * S;
      for (let o = 0; o < 4; o++, amp /= 2, f *= 2) v += n(mx * f, my * f) * amp;
      let hill = 0;
      for (const [hx, hy, rx, ry, k] of HILLS) hill += k * Math.exp(-(((mx - hx) / rx) ** 2 + ((my - hy) / ry) ** 2));
      h[y * W + x] = (my > 360 ? 0.25 : 1) * v * 0.6 + hill;
    }
  }
  const img = ctx.createImageData(W, H);
  const [lx, ly, lz] = [-0.6, -0.6, 0.53]; // light from the top left
  for (let y = 1; y < H - 1; y++) {
    for (let x = 1; x < W - 1; x++) {
      const dx = (h[y * W + x + 1] - h[y * W + x - 1]) * 18 / S;
      const dy = (h[(y + 1) * W + x] - h[(y - 1) * W + x]) * 18 / S;
      const shade = (-dx * lx - dy * ly + lz) / Math.sqrt(dx * dx + dy * dy + 1);
      const i = (y * W + x) * 4;
      // Lit slopes glow cyan; shadowed ones go to navy.
      if (shade > 0.5) img.data.set([61, 232, 216, Math.min(255, (shade - 0.5) * 300)], i);
      else img.data.set([4, 8, 20, Math.min(255, (0.5 - shade) * 420)], i);
    }
  }
  ctx.putImageData(img, 0, 0);
  try {
    const bin = atob(canvas.toDataURL('image/png').split(',')[1]);
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    reliefUrl = URL.createObjectURL(new Blob([bytes], { type: 'image/png' }));
  } catch {
    reliefUrl = '';
  }
  return reliefUrl;
}

let built = null;
function geometry() {
  if (built) return built;
  const island = path(coast(ISLAND, 3, 0.22));
  const west = path(coast(WEST, 8, 0.3));
  const mainland = path(coast(MAINLAND, 4, 0.2));
  const amber = path(coast(AMBER, 5, 0.2, 3));
  const mudflat = path(coast(MUDFLAT, 6, 0.3));
  const piers = PIERS.map(path).join('');
  built = {
    land: [island, west, mainland, amber, piers],
    island, west, mainland, amber, mudflat, piers,
    islets: ISLETS.map(([x, y, rad], i) => path(coast(ring(x, y, rad, rad * 0.8, 6), 20 + i, 0.4, 3))).join(''),
    // Contour rings round the summits, rougher the further down they are.
    contours: [
      ...[18, 30, 44, 60].map((rad, i) => path(coast(ring(216, 92, rad * 1.45, rad), 40 + i, 0.28, 3))),
      ...[14, 26].map((rad, i) => path(coast(ring(36, 210, rad * 0.7, rad * 1.6), 50 + i, 0.3, 3))),
    ].join(''),
    areas: Object.fromEntries(Object.entries(DISTRICT_MAP).map(([k, m]) => [k, path(m.area) + (m.hole ? path(m.hole) : '')])),
    streets: Object.fromEntries(Object.entries(DISTRICT_MAP).map(([k, m]) => [k, typeof m.streets === 'string' ? m.streets : streets(m.streets)])),
  };
  return built;
}

/**
 * The map. `districts` is a list of { key, name, label, locked, readout, tone, turf,
 * hot, selected } from the UI, in MAP_DISTRICTS order; this file only draws.
 */
export function cityMapSvg(districts, esc) {
  const g = geometry();
  const img = relief();
  const drawn = districts.map((x) => {
    const [lx, ly] = DISTRICT_MAP[x.key].label;
    const clip = `url(#cm-${x.key})`;
    // Clipped twice: to the district, and (by the inner group) to the land.
    return `<g class="cm-d ${x.locked ? 'is-locked' : ''} ${x.selected ? 'is-selected' : ''}" data-action="city-district" data-id="${x.key}" role="button" tabindex="0" aria-label="${esc(x.label)}" style="--turf:${x.turf}">
      <g clip-path="url(#cm-land)">
        <path class="cm-d__streets" d="${g.streets[x.key]}" clip-path="${clip}" />
        ${x.locked ? `<rect class="cm-d__hatch" width="${MAP_W}" height="${MAP_H}" clip-path="${clip}" />` : ''}
        <path class="cm-d__area" d="${g.areas[x.key]}" clip-path="${clip}" fill-rule="evenodd" />
      </g>
      ${x.hot ? `<circle class="map-talk" cx="${lx}" cy="${ly - 21}" r="4" />` : ''}
      <text class="cm-d__name" x="${lx}" y="${ly}">${esc(x.name)}</text>
      <text class="cm-d__readout ${x.tone}" x="${lx}" y="${ly + 14}">${x.readout}</text>
    </g>`;
  }).join('');
  return `
    <svg class="citymap" viewBox="0 0 ${MAP_W} ${MAP_H}" role="group" aria-label="Map of the city">
      <defs>
        ${MAP_DISTRICTS.map((k) => `<clipPath id="cm-${k}"><path d="${g.areas[k]}" clip-rule="evenodd" /></clipPath>`).join('')}
        <clipPath id="cm-land">${g.land.map((d) => `<path d="${d}" />`).join('')}<path d="${g.mudflat}" /></clipPath>
        <pattern id="cm-sea" width="20" height="10" patternUnits="userSpaceOnUse">
          ${[[0, 0], [20, 0], [10, 5], [0, 10], [20, 10]].map(([x, y]) => `<g transform="translate(${x} ${y})"><circle r="10" /><circle r="7" /><circle r="4" /></g>`).join('')}
        </pattern>
        <pattern id="cm-hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0V5" /></pattern>
        <pattern id="cm-mud" width="6" height="6" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r="0.7" /><circle cx="4.5" cy="4.5" r="0.7" /></pattern>
      </defs>
      <rect class="cm-sea" width="${MAP_W}" height="${MAP_H}" />
      <rect class="cm-sea__scales" width="${MAP_W}" height="${MAP_H}" fill="url(#cm-sea)" />
      <g class="cm-land">${g.land.map((d) => `<path d="${d}" />`).join('')}<path d="${g.islets}" /></g>
      <path class="cm-mud" d="${g.mudflat}" />
      ${img ? `<image href="${img}" width="${MAP_W}" height="${MAP_H}" class="cm-relief" clip-path="url(#cm-land)" />` : ''}
      <path class="cm-contours" d="${g.contours}" clip-path="url(#cm-land)" />
      ${drawn}
      <g class="cm-coast"><path d="${g.island}" /><path d="${g.west}" /><path d="${g.mainland}" /><path d="${g.amber}" /><path d="${g.islets}" /></g>
      <path class="cm-coast cm-coast--pier" d="${g.piers}" />
      <path class="cm-coast cm-coast--mud" d="${g.mudflat}" />
      <path class="cm-rail" d="M202 252V292M202 334V380" />
      <path class="map-crossing" d="M114 254V352" />
      <circle class="map-ferry" cx="114" cy="258" r="3.5" aria-hidden="true" />
      <text x="350" y="272" class="map-label" text-anchor="end">HARBOUR</text>
      <text x="10" y="510" class="map-label">MAINLAND</text>
    </svg>`;
}
