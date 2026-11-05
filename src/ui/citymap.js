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
  ironPeak: { area: PEAK, plate: [216, 96], label: [216, 92], glyph: [216, 70] },
  heights: {
    // The ridge's lower edge rides over the top of the Basin's bowl.
    area: [[76, -20], [380, -20], [380, 166], [300, 160], [248, 172], [205, 162], [196, 126], [160, 118], [110, 116], [76, 122]],
    holes: [PEAK], plate: [262, 62], label: [292, 138], glyph: [318, 118],
  },
  oldTown: {
    area: [[76, 122], [110, 116], [160, 118], [196, 126], [205, 162], [202, 215], [200, 272], [76, 272]],
    holes: [BASIN], plate: [126, 226], label: [146, 222], glyph: [182, 254],
  },
  nightMarket: {
    area: [[205, 162], [248, 172], [300, 160], [380, 166], [380, 272], [200, 272], [202, 215]],
    plate: [282, 210], label: [276, 210], glyph: [232, 248],
  },
  basin: { area: BASIN, plate: [138, 158], label: [138, 150], glyph: [176, 182] },
  amberReach: { area: [[120, 276], [290, 276], [290, 350], [120, 350]], plate: [204, 314], label: [200, 314], glyph: [232, 338] },
  docks: { area: [[-20, 352], [250, 352], [258, 420], [280, 460], [280, 560], [-20, 560]], plate: [108, 452], label: [118, 444], glyph: [196, 404] },
  silt: { area: [[250, 352], [380, 352], [380, 560], [280, 560], [280, 460], [258, 420]], plate: [314, 470], label: [314, 410], glyph: [306, 418] },
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

// --- the neon layer (command centre, part 2, 2026-11-05; drafts/ops-and-presence.md §3) -----------

/**
 * A landmark glyph per district, drawn like the icons (thin strokes, round caps, no fills) in the
 * district's own light; locked districts in the line colour. Drawn at DISTRICT_MAP[key].glyph.
 */
const GLYPHS = {
  docks: 'M-9 8V-10H7M-9-10L-3-4M7-10V-4M5-4H9', // a gantry crane over a container
  oldTown: 'M-8 0L0-6L8 0M-6 0V7H6V0M-2 7V3H2V7', // the shrine of To Dei Gung
  nightMarket: 'M0-9V-6M-4-6H4L5 3H-5ZM-4-2H4M-2 3V6H2V3', // a paper lantern
  heights: 'M-3 9V-7L0-11L3-7V9M-7 9H7M3 0H6V9', // the Central Tower and a lower block
  basin: 'M-6 9L-4-8M4 9L6-8M-7-8H-1M3-8H9M-8 9H8', // floodlight towers over the stands
  ironPeak: 'M-9 6L-3-4L1 1L5-6L9 6ZM-6 6V2', // the summit, walled estates
  amberReach: 'M-8 4A8 6 0 0 1 8 4M-8 4H8M-4 4V8M4 4V8', // the maglev rotunda
  silt: 'M-9 0H9M-7 0V8M-1 0V8M5 0V8M-6-6H6V0', // shacks on stilts
};

// Streets: a few main roads per district, faint, so the land reads as city and not as a blob.
const STREETS = [
  'M84 200L196 196M100 140L150 128M180 150L198 230M96 250L196 262', // Old Town lanes
  'M210 190L370 196M240 176L250 268M300 166L320 268M214 236L374 240', // the Night Market's grid
  'M100 40L360 50M140 88L180 104M280 30L300 150M330 80L360 150', // Glass Heights' avenues
  'M0 420L250 412M40 360L40 540M130 380L150 540M210 360L220 500M0 480L260 488', // the Docks' haul roads
  'M270 380L360 400M290 430L350 460', // the Silt's walkways
];

// Transit (WORLD.md: monorails, trams, ferries, the maglev; everyone changes at the Amber Reach).
const MONORAIL = 'M92 262L200 262L300 246L334 176L304 118';
const MAGLEV = 'M262 112L232 196L204 286M204 340L204 408';
const FERRY_WEST = 'M114 254V352';
const FERRY_EAST = 'M318 262L330 368';

/** A heat glow's tone: sodium when barely warm, amber from 3, red at the fixer's 6 (as the old tags). */
const heatTone = (h) => (h >= 6 ? 'hot' : h >= 3 ? 'warm' : 'low');

/** A district's plate: its name and one line (its work, or LOCKED), HOME / HALL off its top edge. */
function plate(x, esc) {
  const [cx, cy] = DISTRICT_MAP[x.key].plate;
  const name = x.name.toUpperCase();
  const badge = x.jobs ? `${x.jobs} JOB${x.jobs === 1 ? '' : 'S'}` : '';
  const heat = !x.locked && x.heat > 0 ? `H${x.heat}` : '';
  const w = x.locked ? name.length * 6.6 + 58 : Math.max(name.length * 6.6 + 16, 74); // a locked plate says LOCKED on its one line
  const h = x.locked ? 22 : 30;
  const px = cx - w / 2;
  const py = cy - h / 2;
  let s = `<path class="cm-plate__bg" d="${plateShape(px, py, w, h)}" />`;
  if (x.turf) s += `<rect x="${f1(px)}" y="${f1(py)}" width="18" height="2" fill="${x.turf}" />`; // the gang's tab
  s += `<text class="cm-plate__name" x="${f1(px + 8)}" y="${f1(py + (x.locked ? 14.5 : 13))}">${esc(name)}</text>`;
  if (!x.locked) {
    if (badge) s += `<rect class="cm-badge" x="${f1(px + 8)}" y="${f1(py + 17)}" width="${f1(badge.length * 5 + 8)}" height="10" /><text class="cm-badge__txt" x="${f1(px + 12)}" y="${f1(py + 24.8)}">${badge}</text>`;
    else s += `<text class="cm-plate__sub" x="${f1(px + 8)}" y="${f1(py + 25)}">NO WORK</text>`;
    // Heat as a number too, for anyone who can't read a glow (the glow itself is under the plate).
    if (heat) s += `<text class="cm-plate__heat cm-plate__heat--${heatTone(x.heat)}" x="${f1(px + w - 8)}" y="${f1(py + 25)}" text-anchor="end">${heat}</text>`;
  }
  if (x.locked) s += `<text class="cm-plate__lock" x="${f1(px + w - 6)}" y="${f1(py + 14.5)}" text-anchor="end">LOCKED</text>`;
  if (x.home || x.hall) s += `<g transform="translate(${f1(px - 2)} ${f1(py - 15)})"><path class="cm-tag cm-tag--home" d="${plateShape(0, 0, x.home ? 42 : 38, 12, 4)}" /><path class="cm-tag__icon--home" d="M5 9V5L8.5 2.5L12 5V9Z" /><text class="cm-tag__txt cm-tag__txt--home" x="15" y="9">${x.home ? 'HOME' : 'HALL'}</text></g>`;
  if (x.raid) s += `<g transform="translate(${f1(px - 2)} ${f1(py - (x.home || x.hall ? 29 : 15))})"><path class="cm-tag cm-tag--raid" d="${plateShape(0, 0, 58, 12, 4)}" /><text class="cm-tag__txt cm-tag__txt--raid" x="6" y="9">RAID ${esc(x.raid)}</text></g>`;
  if (x.talk) s += `<rect class="map-talk" x="${f1(px + w + 4)}" y="${f1(py + 4)}" width="5" height="5" />`;
  return s;
}

/** Glance layer: a district's heat as a glow round its plate, bigger and redder the hotter it runs. */
function heatGlow(x) {
  if (x.locked || !(x.heat > 0)) return '';
  const [cx, cy] = DISTRICT_MAP[x.key].plate;
  const r = 22 + x.heat * 5;
  return `<circle class="cm-heat cm-heat--${heatTone(x.heat)} ${x.heat >= 6 ? 'is-hot' : ''}" cx="${f1(cx)}" cy="${f1(cy)}" r="${r}" fill="url(#cm-heat-${heatTone(x.heat)})" style="--heat:${(0.35 + x.heat * 0.065).toFixed(2)}" />`;
}

/** A ring round a hall with a raid warned (core/raids.js), one ring still, one breathing outwards. */
function raidRing(x) {
  if (!x.raid) return '';
  const [cx, cy] = DISTRICT_MAP[x.key].plate;
  const r = Math.max(x.name.length * 3.3 + 8, 37) + 10;
  return `<circle class="cm-raid" cx="${f1(cx)}" cy="${f1(cy)}" r="${f1(r)}" /><circle class="cm-raid cm-raid--pulse" cx="${f1(cx)}" cy="${f1(cy)}" r="${f1(r)}" />`;
}

/**
 * Glance layer: each crew out as their faces on a token by the district they're working (up to
 * three, then "+n"), with a faint route back to their hall. A crew waiting on a call rings sodium
 * and pulses; side work is a smaller grey token. `portrait` draws a face (ui/art.js).
 */
function crewTokens(x, portrait) {
  const crews = x.crews ?? [];
  if (!crews.length) return '';
  const [cx, cy] = DISTRICT_MAP[x.key].plate;
  const w = Math.max(x.name.length * 6.6 + 16, 74);
  return crews.map((c, k) => {
    const r = c.side ? 6.5 : 8.5;
    const faces = c.ops.slice(0, 3);
    const more = c.ops.length - faces.length;
    // Tokens sit to the right of the plate, one row per crew; where they'd run off the map, to its left.
    const span = (faces.length - 1) * r * 1.3 + r * 2 + (more > 0 ? 12 : 0);
    const right = cx + w / 2 + 6 + span <= MAP_W - 4;
    const tx = right ? cx + w / 2 + 6 + r : cx - w / 2 - 6 - span + r;
    const ty = cy - 6 + k * (r * 2 + 5);
    const from = c.from ? DISTRICT_MAP[c.from]?.plate : null;
    const route = from && c.from !== x.key ? `<path class="cm-route ${c.call ? 'is-call' : ''}" d="M${f1(from[0])} ${f1(from[1] + 12)}Q${f1((from[0] + tx) / 2 + 24)} ${f1((from[1] + ty) / 2)} ${f1(tx)} ${f1(ty)}" />` : '';
    const token = faces.map((op, i) => {
      const fx = tx + i * r * 1.3;
      return `<g transform="translate(${f1(fx)} ${f1(ty)})"><circle class="cm-token__bg" r="${r + 1.2}" /><g clip-path="url(#cm-face-${c.side ? 's' : 'm'})">${portrait(op, { size: r * 2 }).replace('<svg ', `<svg x="${-r}" y="${-r}" `)}</g><circle class="cm-token__ring ${c.call ? 'is-call' : c.side ? 'is-side' : ''}" r="${r}" /></g>`;
    }).join('');
    const plus = more > 0 ? `<text class="cm-token__more" x="${f1(tx + faces.length * r * 1.3 + 2)}" y="${f1(ty + 3)}">+${more}</text>` : '';
    const call = c.call ? `<circle class="cm-call" cx="${f1(tx + (faces.length - 1) * r * 0.65)}" cy="${f1(ty)}" r="${f1(r + 4 + (faces.length - 1) * r * 0.65)}" /><circle class="cm-call cm-call--pulse" cx="${f1(tx + (faces.length - 1) * r * 0.65)}" cy="${f1(ty)}" r="${f1(r + 4 + (faces.length - 1) * r * 0.65)}" />` : '';
    return `${route}<g class="cm-token" aria-hidden="true">${call}${token}${plus}</g>`;
  }).join('');
}

/**
 * The map. `districts` is a list of { key, name, label, locked, selected, turf (hex or null), jobs,
 * home, hall, heat, raid, talk, crews: [{ ops, call, side, from }] } from the UI, in MAP_DISTRICTS
 * order; this file only draws. portrait: ui/art.js portrait, for the crews' faces.
 */
export function cityMapSvg(districts, esc, { portrait = null } = {}) {
  const g = geometry();
  let grid = '';
  for (let x = 0; x <= MAP_W; x += 24) grid += `M${x} 0V${MAP_H}`;
  for (let y = 0; y <= MAP_H; y += 24) grid += `M0 ${y}H${MAP_W}`;
  const area = (x) => `<path class="cm-d__area ${x.locked ? 'is-locked' : ''}" d="${g.areas[x.key]}" fill-rule="evenodd" clip-path="url(#cm-land)" ${x.turf && !x.locked ? `style="--turf:${x.turf}"` : ''} />`;
  const glyph = (x) => {
    const at = DISTRICT_MAP[x.key].glyph;
    return at && GLYPHS[x.key] ? `<path class="cm-glyph ${x.locked ? 'is-locked' : ''}" d="${GLYPHS[x.key]}" transform="translate(${at[0]} ${at[1]})" ${x.turf && !x.locked ? `style="--turf:${x.turf}"` : ''} />` : '';
  };
  const lit = (x) => (x.home || x.hall ? 'has-hall' : '');
  return `
    <svg class="citymap" viewBox="0 0 ${MAP_W} ${MAP_H}" role="group" aria-label="Map of the city">
      <defs>
        <clipPath id="cm-land">${g.land.map((d) => `<path d="${d}" />`).join('')}<path d="${g.mudflat}" /></clipPath>
        <clipPath id="cm-face-m"><circle r="8.5" /></clipPath>
        <clipPath id="cm-face-s"><circle r="6.5" /></clipPath>
        <pattern id="cm-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0V6" /></pattern>
        <pattern id="cm-blocks" width="9" height="9" patternUnits="userSpaceOnUse"><path d="M0 0H9M0 0V9" /></pattern>
        <filter id="cm-glow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="1.6" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        ${['low', 'warm', 'hot'].map((t) => `<radialGradient id="cm-heat-${t}"><stop offset="0" class="cm-heat__in--${t}" /><stop offset="1" class="cm-heat__out--${t}" /></radialGradient>`).join('')}
      </defs>
      <rect class="cm-sea" width="${MAP_W}" height="${MAP_H}" />
      <path class="cm-grid" d="${grid}" />
      <g class="cm-cliff" transform="translate(-2 2)">${g.land.map((d) => `<path d="${d}" />`).join('')}<path d="${g.islets}" /></g>
      <g class="cm-land">${g.land.map((d) => `<path d="${d}" />`).join('')}<path d="${g.mudflat}" /><path d="${g.islets}" /><path d="${g.piers}" /></g>
      ${districts.map((x) => `<g class="cm-d ${x.selected ? 'is-selected' : ''} ${lit(x)}" data-action="city-district" data-id="${x.key}" role="button" tabindex="0" aria-pressed="${x.selected}" aria-label="${esc(x.label)}">${area(x)}</g>`).join('')}
      <!-- The city under the neon: a fine block grid and the main roads, faint, inside the land. -->
      <g class="cm-streets" clip-path="url(#cm-land)"><rect width="${MAP_W}" height="${MAP_H}" fill="url(#cm-blocks)" /><path class="cm-roads" d="${STREETS.join('')}" /></g>
      <g class="cm-seams" clip-path="url(#cm-land)">${districts.map((x) => `<path d="${g.areas[x.key]}" />`).join('')}</g>
      <!-- The lit coastline: the city's edge glows cyan where land meets the harbour (part 2). -->
      <g class="cm-shore" filter="url(#cm-glow)">${g.land.map((d) => `<path d="${d}" />`).join('')}<path d="${g.islets}" /></g>
      <!-- Transit: the monorail, the maglev through the Amber Reach, the night ferries. -->
      <path class="cm-transit cm-transit--mono" d="${MONORAIL}" />
      <path class="cm-transit cm-transit--maglev" d="${MAGLEV}" />
      <path class="cm-train" d="${MAGLEV}" />
      <path class="map-crossing" d="${FERRY_WEST}" /><path class="map-crossing" d="${FERRY_EAST}" />
      <circle class="map-ferry" cx="114" cy="258" r="2.6" aria-hidden="true" />
      <circle class="map-ferry map-ferry--east" cx="318" cy="264" r="2.2" aria-hidden="true" />
      <circle class="cm-crane" cx="187" cy="394" r="1.6" aria-hidden="true" />
      <circle class="cm-drone" cx="318" cy="96" r="1.4" aria-hidden="true" />
      <text x="350" y="272" class="map-label" text-anchor="end">HARBOUR</text>
      <text x="10" y="510" class="map-label">MAINLAND</text>
      <g class="cm-glyphs" aria-hidden="true">${districts.map(glyph).join('')}</g>
      <g class="cm-heats" aria-hidden="true">${districts.map(heatGlow).join('')}</g>
      <g class="cm-raids" aria-hidden="true">${districts.map(raidRing).join('')}</g>
      ${portrait ? `<g class="cm-tokens" aria-hidden="true">${districts.map((x) => crewTokens(x, portrait)).join('')}</g>` : ''}
      ${districts.map((x) => `<g class="cm-plate ${x.locked ? 'is-locked' : ''} ${x.selected ? 'is-on' : ''}" data-action="city-district" data-id="${x.key}" aria-hidden="true">${plate(x, esc)}<circle class="cm-hit" cx="${DISTRICT_MAP[x.key].plate[0]}" cy="${DISTRICT_MAP[x.key].plate[1]}" r="24" /></g>`).join('')}
    </svg>`;
}

/** The raw shapes, for design drafts that redraw the city (scripts/city-map-options.mjs). */
export const MAP_SHAPES = { coast, ring, ISLAND, WEST, AMBER, MAINLAND, MUDFLAT, PEAK, BASIN, COURSE, PIERS, ISLETS, DISTRICT_MAP };
