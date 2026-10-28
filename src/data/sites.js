// Site plans for the watch screen (PLAN-CORE-LOOP.md, slice 4): one per district, drawn as data.
// Content only: ui/siteplan.js draws the shapes and walks the crew along the paths.
//
// The map is 360 x 240. Every site has:
// - points.van and points.perch (overwatch), and a path per zone (core/incidents.js zones: in,
//   inside, target, out). Each zone's path starts where the last one ended; the out path walks
//   from the target back to the van.
// - views: camera boxes per zone, all 3:2 like the full map.
// - sight: what the rifle sees (the open ground, never inside the target) and the drone sees (all).
// - shapes: drawn in order. rect, line, poly (points; closed or not), circle, ellipse, and
//   row: n copies of a rect, `step` apart, skipping the indexes in `skip`, filled from `tones`.
// - labels: small map captions (the second one in `hi` is the target).
// Coordinates were set by hand and are checked by tests/sites.test.js (on the map, routes join,
// the rifle can't see the target, the drone can).

const CONTAINER_TONES = ['#1b2433', '#2a1d26', '#1d2a24', '#2b2618'];
const STALL_TONES = ['#ff3d5f', '#3de8d8', '#f2d541', '#b48cff'];

const ROAD = [
  { t: 'rect', cls: 'sp-road', x: 0, y: 212, w: 360, h: 28 },
  { t: 'line', cls: 'sp-road__line', x1: 0, y1: 226, x2: 360, y2: 226 },
];

// The plan every job used before slice 4, still used for any district without its own.
const GENERIC = {
  name: 'a job site',
  aria: 'Site plan: the way in through the gate, the grounds inside, the target building, the overwatch perch and the van',
  points: { van: [40, 224], perch: [176, 24], target: [272, 74] },
  paths: {
    in: [[40, 224], [106, 224], [106, 196]],
    inside: [[106, 196], [106, 135], [186, 135]],
    target: [[186, 135], [236, 100], [272, 74]],
    out: [[272, 74], [236, 100], [186, 135], [106, 135], [106, 196], [106, 224], [40, 224]],
  },
  views: { in: [6, 126, 171, 114], inside: [0, 46, 249, 166], target: [150, 4, 204, 136] },
  sight: { rifle: [[176, 24], [12, 194], [232, 194], [232, 40]], drone: [[176, 24], [8, 206], [314, 206], [314, 30]] },
  shapes: [
    ...ROAD,
    { t: 'poly', cls: 'sp-fence', points: [[8, 196], [94, 196]] },
    { t: 'poly', cls: 'sp-fence', points: [[118, 196], [352, 196]] },
    { t: 'row', cls: 'sp-cover', x: 16, y: 56, w: 27, h: 14, step: 31, n: 7, tones: CONTAINER_TONES },
    { t: 'row', cls: 'sp-cover', x: 16, y: 96, w: 27, h: 14, step: 31, n: 7, skip: [2, 3], tones: CONTAINER_TONES, shift: 1 },
    { t: 'row', cls: 'sp-cover', x: 16, y: 150, w: 27, h: 14, step: 31, n: 7, skip: [2, 3], tones: CONTAINER_TONES, shift: 2 },
    { t: 'rect', cls: 'sp-building', x: 236, y: 38, w: 72, h: 72 },
    { t: 'rect', cls: 'sp-door', x: 233, y: 94, w: 5, h: 12 },
    { t: 'line', cls: 'sp-perch', x1: 146, y1: 24, x2: 206, y2: 24 },
    { t: 'line', cls: 'sp-perch', x1: 150, y1: 24, x2: 150, y2: 40 },
    { t: 'line', cls: 'sp-perch', x1: 202, y1: 24, x2: 202, y2: 40 },
  ],
  labels: [
    { x: 124, y: 206, text: 'WAY IN' }, { x: 18, y: 140, text: 'INSIDE' },
    { x: 252, y: 32, text: 'TARGET', hi: true }, { x: 212, y: 20, text: 'OVERWATCH' }, { x: 8, y: 236, text: 'VAN' },
  ],
};

// The Docks: a container yard behind a fence, the yard office, a crane, the harbour on the right.
const DOCKS = {
  ...GENERIC,
  name: 'a container yard',
  aria: 'Site plan of a container yard: the fence and gate, rows of containers, the yard office, a crane for overwatch, the harbour and the van on the service road',
  shapes: [
    ...GENERIC.shapes.filter((s) => s.cls !== 'sp-road' && s.cls !== 'sp-road__line'),
    { t: 'rect', cls: 'sp-road', x: 0, y: 212, w: 318, h: 28 },
    { t: 'line', cls: 'sp-road__line', x1: 0, y1: 226, x2: 318, y2: 226 },
    { t: 'rect', cls: 'sp-water', x: 318, y: 0, w: 42, h: 240 },
    { t: 'rect', cls: 'sp-jetty', x: 310, y: 186, w: 24, h: 9 },
    { t: 'rect', cls: 'sp-desk', x: 252, y: 52, w: 20, h: 8 },
    { t: 'rect', cls: 'sp-desk', x: 282, y: 80, w: 16, h: 16 },
  ],
  labels: [
    { x: 124, y: 206, text: 'THE FENCE' }, { x: 18, y: 140, text: 'THE YARD' },
    { x: 246, y: 32, text: 'YARD OFFICE', hi: true }, { x: 212, y: 20, text: 'CRANE' }, { x: 8, y: 236, text: 'VAN' },
  ],
};

// Old Town: up an alley of steps from the lane, across a courtyard strung with laundry, into a
// tenement flat. Overwatch on the next block's roof, by the water tank.
const OLD_TOWN = {
  name: 'a tenement',
  aria: 'Site plan of a tenement: the lane and the van, an alley of steps, a courtyard with laundry lines, the tenement with the flat, and a rooftop water tank for overwatch',
  points: { van: [316, 224], perch: [292, 40], target: [72, 64] },
  paths: {
    in: [[316, 224], [236, 224], [236, 198]],
    inside: [[236, 198], [236, 160], [200, 128], [140, 118]],
    target: [[140, 118], [118, 100], [72, 64]],
    out: [[72, 64], [118, 100], [140, 118], [200, 128], [236, 160], [236, 198], [236, 224], [316, 224]],
  },
  views: { in: [189, 126, 171, 114], inside: [105, 72, 195, 130], target: [10, 10, 204, 136] },
  sight: { rifle: [[292, 40], [128, 96], [128, 156], [222, 212], [300, 212], [300, 100]], drone: [[292, 40], [8, 12], [8, 212], [352, 212], [352, 12]] },
  shapes: [
    ...ROAD,
    { t: 'rect', cls: 'sp-yard', x: 132, y: 100, w: 170, h: 52 },
    { t: 'rect', cls: 'sp-alley', x: 226, y: 150, w: 20, h: 62 },
    { t: 'row', cls: 'sp-step', x: 228, y: 156, w: 16, h: 1.5, step: 7, n: 8, axis: 'y' },
    { t: 'rect', cls: 'sp-building', x: 24, y: 28, w: 96, h: 84 },
    { t: 'rect', cls: 'sp-door', x: 117, y: 92, w: 5, h: 12 },
    { t: 'rect', cls: 'sp-room', x: 40, y: 44, w: 50, h: 36 },
    { t: 'rect', cls: 'sp-block', x: 150, y: 20, w: 76, h: 72 },
    { t: 'rect', cls: 'sp-block', x: 250, y: 30, w: 92, h: 66 },
    { t: 'row', cls: 'sp-window', x: 158, y: 30, w: 5, h: 4, step: 12, n: 6, tones: ['#2a303b', '#f2d541', '#2a303b', '#2a303b', '#3de8d8', '#2a303b'] },
    { t: 'row', cls: 'sp-window', x: 158, y: 50, w: 5, h: 4, step: 12, n: 6, tones: ['#2a303b', '#2a303b', '#ff3d5f', '#2a303b', '#2a303b', '#f2d541'] },
    { t: 'row', cls: 'sp-window', x: 158, y: 70, w: 5, h: 4, step: 12, n: 6, tones: ['#f2d541', '#2a303b', '#2a303b', '#2a303b', '#2a303b', '#2a303b'] },
    { t: 'row', cls: 'sp-window', x: 258, y: 58, w: 5, h: 4, step: 12, n: 7, tones: ['#2a303b', '#2a303b', '#3de8d8', '#2a303b', '#f2d541', '#2a303b', '#2a303b'] },
    { t: 'row', cls: 'sp-window', x: 258, y: 78, w: 5, h: 4, step: 12, n: 7, tones: ['#2a303b', '#ff3d5f', '#2a303b', '#2a303b', '#2a303b', '#2a303b', '#f2d541'] },
    { t: 'circle', cls: 'sp-tank', cx: 292, cy: 40, r: 7 },
    { t: 'poly', cls: 'sp-laundry', points: [[150, 106], [190, 112], [250, 104]] },
    { t: 'poly', cls: 'sp-laundry', points: [[150, 140], [210, 146], [290, 138]] },
    { t: 'rect', cls: 'sp-sign', x: 256, y: 196, w: 30, h: 6, fill: '#ff3d5f' },
  ],
  labels: [
    { x: 252, y: 188, text: 'ALLEY' }, { x: 150, y: 160, text: 'COURTYARD' },
    { x: 40, y: 22, text: 'THE FLAT', hi: true }, { x: 304, y: 26, text: 'ROOF' }, { x: 300, y: 236, text: 'VAN' },
  ],
};

// The Night Market: through the market gate, down lanes of stalls in the crowd, to the back room of
// a mahjong parlour. Overwatch on the footbridge over the market.
const NIGHT_MARKET = {
  name: 'a night market',
  aria: 'Site plan of a night market: the gate and the van, lanes of stalls with crowds, a mahjong parlour with a back room, and a footbridge for overwatch',
  points: { van: [40, 224], perch: [196, 26], target: [318, 72] },
  paths: {
    in: [[40, 224], [92, 224], [92, 196]],
    inside: [[92, 196], [92, 138], [180, 138], [240, 120]],
    target: [[240, 120], [266, 120], [300, 110], [318, 72]],
    out: [[318, 72], [300, 110], [266, 120], [240, 120], [180, 138], [92, 138], [92, 196], [92, 224], [40, 224]],
  },
  views: { in: [0, 112, 192, 128], inside: [10, 40, 270, 180], target: [180, 20, 180, 120] },
  sight: { rifle: [[196, 26], [16, 80], [16, 198], [262, 198], [262, 40]], drone: [[196, 26], [6, 14], [6, 206], [354, 206], [354, 14]] },
  shapes: [
    ...ROAD,
    { t: 'line', cls: 'sp-gatepost', x1: 80, y1: 192, x2: 80, y2: 204 },
    { t: 'line', cls: 'sp-gatepost', x1: 104, y1: 192, x2: 104, y2: 204 },
    { t: 'line', cls: 'sp-neon', x1: 78, y1: 190, x2: 106, y2: 190 },
    { t: 'row', cls: 'sp-stall', x: 22, y: 152, w: 18, h: 12, step: 24, n: 10, skip: [3], tones: STALL_TONES },
    { t: 'row', cls: 'sp-stall', x: 22, y: 112, w: 18, h: 12, step: 24, n: 10, skip: [3], tones: STALL_TONES, shift: 1 },
    { t: 'row', cls: 'sp-stall', x: 22, y: 72, w: 18, h: 12, step: 24, n: 9, tones: STALL_TONES, shift: 2 },
    { t: 'row', cls: 'sp-crowd', x: 30, y: 134, w: 3, h: 3, step: 17, n: 13, skip: [4], tones: ['#5f6878'] },
    { t: 'row', cls: 'sp-crowd', x: 38, y: 96, w: 3, h: 3, step: 21, n: 10, tones: ['#5f6878'] },
    { t: 'row', cls: 'sp-crowd', x: 26, y: 176, w: 3, h: 3, step: 19, n: 12, skip: [3, 4], tones: ['#5f6878'] },
    { t: 'rect', cls: 'sp-bridge', x: 140, y: 21, w: 112, h: 10 },
    { t: 'rect', cls: 'sp-building', x: 268, y: 40, w: 80, h: 110 },
    { t: 'rect', cls: 'sp-door', x: 265, y: 114, w: 5, h: 12 },
    { t: 'rect', cls: 'sp-room', x: 296, y: 48, w: 44, h: 46 },
    { t: 'rect', cls: 'sp-sign', x: 274, y: 140, w: 40, h: 5, fill: '#b48cff' },
  ],
  labels: [
    { x: 110, y: 206, text: 'MARKET GATE' }, { x: 22, y: 66, text: 'STALLS' },
    { x: 268, y: 34, text: 'BACK ROOM', hi: true }, { x: 150, y: 16, text: 'FOOTBRIDGE' }, { x: 8, y: 236, text: 'VAN' },
  ],
};

// Glass Heights: in through the loading bay, across a plaza of planters, into the tower to the
// server room. Overwatch on the next tower's roof.
const HEIGHTS = {
  name: 'a corporate tower',
  aria: 'Site plan of a corporate tower: the service road and the van, the loading bay, a plaza with planters, the tower with a server room, and the next tower\'s roof for overwatch',
  points: { van: [52, 224], perch: [80, 30], target: [310, 56] },
  paths: {
    in: [[52, 224], [120, 224], [120, 198]],
    inside: [[120, 198], [140, 160], [210, 150]],
    target: [[210, 150], [232, 150], [290, 140], [290, 90], [310, 56]],
    out: [[310, 56], [290, 90], [290, 140], [232, 150], [210, 150], [140, 160], [120, 198], [120, 224], [52, 224]],
  },
  views: { in: [0, 112, 192, 128], inside: [0, 60, 270, 180], target: [150, 40, 204, 136] },
  sight: { rifle: [[80, 30], [16, 100], [16, 198], [228, 198], [228, 60]], drone: [[80, 30], [6, 6], [6, 206], [354, 206], [354, 6]] },
  shapes: [
    ...ROAD,
    { t: 'rect', cls: 'sp-plaza', x: 16, y: 96, w: 212, h: 102 },
    { t: 'row', cls: 'sp-planter', x: 30, y: 110, w: 22, h: 8, step: 40, n: 5, tones: ['#1d2a24'] },
    { t: 'row', cls: 'sp-planter', x: 30, y: 176, w: 22, h: 8, step: 40, n: 5, skip: [2], tones: ['#1d2a24'] },
    { t: 'line', cls: 'sp-barrier', x1: 104, y1: 198, x2: 136, y2: 198 },
    { t: 'rect', cls: 'sp-tower', x: 232, y: 20, w: 116, h: 176 },
    { t: 'row', cls: 'sp-glass', x: 244, y: 24, w: 1, h: 168, step: 14, n: 8, tones: ['#1f3a44'] },
    { t: 'rect', cls: 'sp-door', x: 229, y: 144, w: 5, h: 12 },
    { t: 'rect', cls: 'sp-room', x: 280, y: 30, w: 60, h: 50 },
    { t: 'rect', cls: 'sp-block', x: 20, y: 10, w: 90, h: 50 },
  ],
  labels: [
    { x: 140, y: 208, text: 'LOADING BAY' }, { x: 24, y: 92, text: 'PLAZA' },
    { x: 282, y: 92, text: 'SERVER ROOM', hi: true }, { x: 26, y: 70, text: 'ROOFTOP' }, { x: 8, y: 236, text: 'VAN' },
  ],
};

// The Basin: in at the service gate by Lantern Course, along the stable rows, into the vet block.
// Overwatch up a floodlight tower.
const BASIN = {
  name: 'the racecourse stables',
  aria: 'Site plan of the racecourse stables: the service gate and the van, the edge of the track, rows of stables, the vet block, and a floodlight tower for overwatch',
  points: { van: [300, 224], perch: [200, 30], target: [300, 70] },
  paths: {
    in: [[300, 224], [250, 224], [250, 198]],
    inside: [[250, 198], [250, 156], [200, 156], [230, 118]],
    target: [[230, 118], [250, 96], [300, 70]],
    out: [[300, 70], [250, 96], [230, 118], [200, 156], [250, 156], [250, 198], [250, 224], [300, 224]],
  },
  views: { in: [168, 112, 192, 128], inside: [100, 60, 255, 170], target: [180, 10, 180, 120] },
  sight: { rifle: [[200, 30], [140, 120], [160, 198], [348, 198], [348, 114], [246, 114], [246, 34]], drone: [[200, 30], [6, 6], [6, 206], [354, 206], [354, 6]] },
  shapes: [
    ...ROAD,
    { t: 'ellipse', cls: 'sp-infield', cx: 92, cy: 92, rx: 96, ry: 62 },
    { t: 'ellipse', cls: 'sp-track', cx: 92, cy: 92, rx: 96, ry: 62 },
    { t: 'poly', cls: 'sp-fence', points: [[8, 198], [236, 198]] },
    { t: 'poly', cls: 'sp-fence', points: [[264, 198], [352, 198]] },
    { t: 'rect', cls: 'sp-stable', x: 170, y: 128, w: 160, h: 20 },
    { t: 'rect', cls: 'sp-stable', x: 170, y: 164, w: 160, h: 20 },
    { t: 'row', cls: 'sp-stall-line', x: 186, y: 128, w: 1, h: 20, step: 16, n: 9, tones: ['#2a303b'] },
    { t: 'row', cls: 'sp-stall-line', x: 186, y: 164, w: 1, h: 20, step: 16, n: 9, tones: ['#2a303b'] },
    { t: 'rect', cls: 'sp-building', x: 250, y: 40, w: 90, h: 70 },
    { t: 'rect', cls: 'sp-door', x: 247, y: 90, w: 5, h: 12 },
    { t: 'rect', cls: 'sp-room', x: 276, y: 52, w: 52, h: 36 },
    { t: 'line', cls: 'sp-pole', x1: 200, y1: 30, x2: 200, y2: 110 },
    { t: 'rect', cls: 'sp-lamp', x: 190, y: 22, w: 20, h: 6 },
  ],
  labels: [
    { x: 258, y: 208, text: 'SERVICE GATE' }, { x: 176, y: 124, text: 'STABLES' },
    { x: 262, y: 34, text: 'VET BLOCK', hi: true }, { x: 214, y: 20, text: 'FLOODLIGHT' }, { x: 52, y: 96, text: 'LANTERN COURSE' },
    { x: 300, y: 236, text: 'VAN' },
  ],
};

/** Site plans by district key (data/districts.js); `generic` for anywhere without one. */
export const SITES = { generic: GENERIC, docks: DOCKS, oldTown: OLD_TOWN, nightMarket: NIGHT_MARKET, heights: HEIGHTS, basin: BASIN };
