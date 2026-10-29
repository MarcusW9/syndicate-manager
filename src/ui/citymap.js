// Lantern Bay from above (WORLD.md, Geography), built from the interface's own parts (owner,
// 2026-10-28/29; DESIGN.md): the made-up coast as a faint cyan hairline, districts in the panel
// colours, locked ones hatched, and each district's name on a small cut-corner
// plate with its gang's colour as the plate's tab, its work as a cyan badge, and HOME, crew out
// and street talk hanging off it. The selected district gets the cyan edge every selected card
// has. Geometry is seeded, so the city draws the same every time; it's built once per session.
//
// Adding a district: one entry in DISTRICT_MAP (its area, plate spot, and `holes` in whichever
// districts it's cut out of). The island has room to grow: the north shore, the valley east of
// the Peak and the wild island to the west carry no district yet.

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
// The Basin: a bowl between the ridge's lower slopes and Old Town, round Lantern Course.
const BASIN = coast(ring(138, 164, 52, 32, 12), 30, 0.12, 2);
const COURSE = ring(138, 176, 31, 11, 24);

// Each district: its area, where its plate sits (where it has room on a phone), and the label
// spot the older map used (design drafts still read it).
const DISTRICT_MAP = {
  ironPeak: { area: PEAK, plate: [216, 96], label: [216, 92] },
  heights: {
    // The ridge's lower edge rides over the top of the Basin's bowl.
    area: [[76, -20], [380, -20], [380, 166], [300, 160], [248, 172], [205, 162], [196, 126], [160, 118], [110, 116], [76, 122]],
    holes: [PEAK], plate: [262, 62], label: [292, 138],
  },
  oldTown: {
    area: [[76, 122], [110, 116], [160, 118], [196, 126], [205, 162], [202, 215], [200, 272], [76, 272]],
    holes: [BASIN], plate: [126, 226], label: [146, 222],
  },
  nightMarket: {
    area: [[205, 162], [248, 172], [300, 160], [380, 166], [380, 272], [200, 272], [202, 215]],
    plate: [282, 210], label: [276, 210],
  },
  basin: { area: BASIN, plate: [138, 158], label: [138, 150] },
  amberReach: { area: [[120, 276], [290, 276], [290, 350], [120, 350]], plate: [204, 314], label: [200, 314] },
  docks: { area: [[-20, 352], [250, 352], [258, 420], [280, 460], [280, 560], [-20, 560]], plate: [108, 452], label: [118, 444] },
  silt: { area: [[250, 352], [380, 352], [380, 560], [280, 560], [280, 460], [258, 420]], plate: [314, 470], label: [314, 410] },
};
export const MAP_DISTRICTS = Object.keys(DISTRICT_MAP);

let built = null;
function geometry() {
  if (built) return built;
  const land = [coast(ISLAND, 3, 0.22), coast(WEST, 8, 0.3), coast(AMBER, 5, 0.2, 3), coast(MAINLAND, 4, 0.2)].map(path);
  built = {
    land,
    mudflat: path(coast(MUDFLAT, 6, 0.3)),
    piers: PIERS.map(path).join(''),
    islets: ISLETS.map(([x, y, rad], i) => path(coast(ring(x, y, rad, rad * 0.8, 6), 20 + i, 0.4, 3))).join(''),
    areas: Object.fromEntries(Object.entries(DISTRICT_MAP).map(([k, m]) => [k, path(m.area) + (m.holes ?? []).map(path).join('')])),
  };
  return built;
}

const f1 = (n) => n.toFixed(1);
/** A cut-corner plate (the panels' shape), top-left at x, y. */
const plateShape = (x, y, w, h, cut = 5) => `M${f1(x)} ${f1(y)}H${f1(x + w - cut)}L${f1(x + w)} ${f1(y + cut)}V${f1(y + h)}H${f1(x)}Z`;

/** A district's plate: name, gang tab, work badge, and HOME / crew out / street talk off it. */
function plate(x, esc) {
  const [cx, cy] = DISTRICT_MAP[x.key].plate;
  const name = x.name.toUpperCase();
  const badge = x.jobs ? `${x.jobs} JOB${x.jobs === 1 ? '' : 'S'}` : '';
  const w = Math.max(name.length * 6.6 + 16, x.locked ? 64 : badge ? 92 : 74);
  const h = 32;
  const px = cx - w / 2;
  const py = cy - h / 2;
  let s = `<path class="cm-plate__bg" d="${plateShape(px, py, w, h)}" />`;
  if (x.turf) s += `<rect x="${f1(px)}" y="${f1(py)}" width="18" height="2" fill="${x.turf}" />`; // the gang's tab
  s += `<text class="cm-plate__name" x="${f1(px + 8)}" y="${f1(py + 13)}">${esc(name)}</text>`;
  if (x.locked) s += `<text class="cm-plate__sub" x="${f1(px + 8)}" y="${f1(py + 24)}">LOCKED</text>`;
  else if (badge) s += `<rect class="cm-badge" x="${f1(px + 8)}" y="${f1(py + 17)}" width="${f1(badge.length * 5 + 8)}" height="11" /><text class="cm-badge__txt" x="${f1(px + 12)}" y="${f1(py + 25.5)}">${badge}</text>`;
  else s += `<text class="cm-plate__sub" x="${f1(px + 8)}" y="${f1(py + 24)}">NO WORK</text>`;
  // Tags hang off the plate's top edge, so nothing floats loose on the map.
  if (x.home) s += `<g transform="translate(${f1(px - 2)} ${f1(py - 15)})"><path class="cm-tag cm-tag--home" d="${plateShape(0, 0, 42, 12, 4)}" /><path class="cm-tag__icon--home" d="M5 9V5L8.5 2.5L12 5V9Z" /><text class="cm-tag__txt cm-tag__txt--home" x="15" y="9">HOME</text></g>`;
  if (x.out) s += `<g transform="translate(${f1(px + w - 48)} ${f1(py - 15)})"><path class="cm-tag cm-tag--out" d="${plateShape(0, 0, 50, 12, 4)}" /><path class="cm-tag__icon--out" d="M7 2.5L10.5 6L7 9.5L3.5 6Z" /><text class="cm-tag__txt cm-tag__txt--out" x="14" y="9">${x.out} OUT</text></g>`;
  if (x.talk) s += `<rect class="map-talk" x="${f1(px + w + 4)}" y="${f1(py + 4)}" width="5" height="5" />`;
  return s;
}

/**
 * The map. `districts` is a list of { key, name, label, locked, selected, turf (hex or null),
 * jobs, home, out, talk } from the UI, in MAP_DISTRICTS order; this file only draws.
 */
export function cityMapSvg(districts, esc) {
  const g = geometry();
  let grid = '';
  for (let x = 0; x <= MAP_W; x += 24) grid += `M${x} 0V${MAP_H}`;
  for (let y = 0; y <= MAP_H; y += 24) grid += `M0 ${y}H${MAP_W}`;
  const area = (x) => `<path class="cm-d__area ${x.locked ? 'is-locked' : ''}" d="${g.areas[x.key]}" fill-rule="evenodd" clip-path="url(#cm-land)" ${x.turf && !x.locked ? `style="--turf:${x.turf}"` : ''} />`;
  return `
    <svg class="citymap" viewBox="0 0 ${MAP_W} ${MAP_H}" role="group" aria-label="Map of the city">
      <defs>
        <clipPath id="cm-land">${g.land.map((d) => `<path d="${d}" />`).join('')}<path d="${g.mudflat}" /></clipPath>
        <pattern id="cm-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0V6" /></pattern>
      </defs>
      <rect class="cm-sea" width="${MAP_W}" height="${MAP_H}" />
      <path class="cm-grid" d="${grid}" />
      <!-- No outlines, like the pictures (owner, 2026-10-29): the land's edges are light and shadow.
           A shadow copy nudged down-left, a lit copy nudged right, then the land itself on top. -->
      <g class="cm-cliff" transform="translate(-2 2)">${g.land.map((d) => `<path d="${d}" />`).join('')}<path d="${g.islets}" /></g>
      <g class="cm-rim" transform="translate(1.6 -0.6)">${g.land.map((d) => `<path d="${d}" />`).join('')}<path d="${g.islets}" /><path d="${g.piers}" /></g>
      <g class="cm-land">${g.land.map((d) => `<path d="${d}" />`).join('')}<path d="${g.mudflat}" /><path d="${g.islets}" /><path d="${g.piers}" /></g>
      ${districts.map((x) => `<g class="cm-d ${x.selected ? 'is-selected' : ''}" data-action="city-district" data-id="${x.key}" role="button" tabindex="0" aria-pressed="${x.selected}" aria-label="${esc(x.label)}">${area(x)}</g>`).join('')}
      <!-- Districts meet at a dark seam (the ground between them), not a drawn border. -->
      <g class="cm-seams" clip-path="url(#cm-land)">${districts.map((x) => `<path d="${g.areas[x.key]}" />`).join('')}</g>
      <path class="cm-rail" d="M202 252V292M202 334V380" />
      <path class="map-crossing" d="M114 254V352" />
      <circle class="map-ferry" cx="114" cy="258" r="3" aria-hidden="true" />
      <text x="350" y="272" class="map-label" text-anchor="end">HARBOUR</text>
      <text x="10" y="510" class="map-label">MAINLAND</text>
      ${districts.map((x) => `<g class="cm-plate ${x.locked ? 'is-locked' : ''} ${x.selected ? 'is-on' : ''}" data-action="city-district" data-id="${x.key}" aria-hidden="true">${plate(x, esc)}</g>`).join('')}
    </svg>`;
}

/** The raw shapes, for design drafts that redraw the city (scripts/city-map-options.mjs). */
export const MAP_SHAPES = { coast, ring, ISLAND, WEST, AMBER, MAINLAND, MUDFLAT, PEAK, BASIN, COURSE, PIERS, ISLETS, DISTRICT_MAP };
