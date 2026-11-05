// The City map's shapes before the command centre's neon map (2026-10-29 to 2026-11-05): the seeded
// coast and the districts cut from it. Kept for the design drafts that still redraw them
// (scripts/city-map-options.mjs, scripts/city-map-schematic.mjs); the game's map is src/ui/citymap.js.

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


export const MAP_SHAPES = { coast, ring, ISLAND, WEST, AMBER, MAINLAND, MUDFLAT, PEAK, BASIN, COURSE, PIERS, ISLETS, DISTRICT_MAP };
