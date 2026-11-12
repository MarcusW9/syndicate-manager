// Site plans for the watch screen (PLAN-CORE-LOOP.md, slice 4): one per district, drawn as data.
// Content only: ui/siteplan.js draws the shapes and walks the crew along the paths.
//
// The map is 360 x 240 (a hall compound is taller, 360 x 330: `h`, see siteHeight). Every site has:
// - points.van and points.perch (overwatch), and a path per zone (core/incidents.js zones: in,
//   inside, target, out). Each zone's path starts where the last one ended; the out path walks
//   from the target back to the van.
// - views: camera boxes per zone, all 3:2 like the full map.
// - sight: what the rifle sees (the open ground, never inside the target) and the drone sees (all).
// - shapes: drawn in order. rect, line, poly (points; closed or not), circle, ellipse, and
//   row: n copies of a rect, `step` apart, skipping the indexes in `skip`, filled from `tones`.
// - labels: small map captions (the second one in `hi` is the target).
// - posts: where the guards a run will meet wait in each zone (in, inside, target), until they come
//   into it (core/battle.js guardPosts; the plan draws them there).
// Coordinates were set by hand and are checked by tests/sites.test.js (on the map, routes join,
// the rifle can't see the target, the drone can).

import { buildShapes } from './hallBuild.js';

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
  posts: { in: [122, 184], inside: [150, 122], target: [290, 92] },
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
  // How it's lit (ui/siteart.js): paving slabs, and the stalls' neon falling across the lanes and the
  // wet road from the right, in hard-edged planes (signal red, sodium, violet).
  paving: true,
  glow: [
    { points: [[360, 138], [360, 206], [96, 212], [132, 150]], color: '#ff3d5f', op: 0.09 },
    { points: [[360, 58], [360, 122], [70, 128], [104, 86]], color: '#f2b544', op: 0.07 },
    { points: [[360, 0], [360, 50], [150, 54], [170, 16]], color: '#9b8cff', op: 0.06 },
    { points: [[40, 213], [100, 213], [86, 239], [26, 239]], color: '#ff3d5f', op: 0.07 },
    { points: [[150, 213], [180, 213], [166, 239], [136, 239]], color: '#3de8d8', op: 0.07 },
    { points: [[250, 213], [320, 213], [306, 239], [236, 239]], color: '#f2b544', op: 0.07 },
  ],
  views: { in: [0, 112, 192, 128], inside: [10, 40, 270, 180], target: [180, 20, 180, 120] },
  posts: { in: [112, 184], inside: [228, 138], target: [300, 118] },
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
    // Cover for fights (core/fightspots.js, 2026-10-30): a cart and crates by the gate and the back room, a mahjong table inside.
    { t: 'rect', cls: 'sp-cover', x: 50, y: 196, w: 24, h: 10, fill: CONTAINER_TONES[3] },
    { t: 'rect', cls: 'sp-cover', x: 22, y: 200, w: 14, h: 10, fill: CONTAINER_TONES[1] },
    { t: 'rect', cls: 'sp-cover', x: 258, y: 138, w: 12, h: 10, fill: CONTAINER_TONES[2] },
    { t: 'rect', cls: 'sp-desk', x: 306, y: 122, w: 16, h: 10 },
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
  // How it's drawn (ui/siteart.js): cyan off the tower's glass across a tiled plaza, sodium in the loading bay.
  look: 'heights', light: '#3de8d8',
  texture: [{ kind: 'tiles', x: 16, y: 96, w: 212, h: 102 }],
  glow: [
    { points: [[232, 24], [232, 196], [16, 198], [50, 120]], color: '#3de8d8', op: 0.06 },
    { points: [[110, 198], [176, 198], [190, 212], [100, 212]], color: '#f2b544', op: 0.1 },
  ],
  points: { van: [52, 224], perch: [80, 30], target: [310, 56] },
  paths: {
    in: [[52, 224], [120, 224], [120, 198]],
    inside: [[120, 198], [140, 160], [210, 150]],
    target: [[210, 150], [232, 150], [290, 140], [290, 90], [310, 56]],
    out: [[310, 56], [290, 90], [290, 140], [232, 150], [210, 150], [140, 160], [120, 198], [120, 224], [52, 224]],
  },
  views: { in: [0, 112, 192, 128], inside: [0, 60, 270, 180], target: [150, 40, 204, 136] },
  posts: { in: [100, 188], inside: [180, 130], target: [270, 110] },
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
    // Cover for fights (core/fightspots.js, 2026-10-30): crates in the loading bay, the lobby's front desk, server cabinets and a desk on the server floor.
    { t: 'rect', cls: 'sp-cover', x: 126, y: 204, w: 24, h: 9, fill: CONTAINER_TONES[0] },
    { t: 'rect', cls: 'sp-cover', x: 160, y: 199, w: 14, h: 9, fill: CONTAINER_TONES[2] },
    { t: 'rect', cls: 'sp-desk', x: 240, y: 158, w: 10, h: 26 },
    { t: 'rect', cls: 'sp-cover', x: 256, y: 154, w: 24, h: 9, fill: CONTAINER_TONES[0] },
    { t: 'rect', cls: 'sp-desk', x: 278, y: 120, w: 16, h: 8 },
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
  // How it's drawn (ui/siteart.js): the floodlight's cream light, a cone of it over the stables, gravel yards.
  look: 'basin', light: '#f7efc8',
  texture: [{ kind: 'gravel', x: 160, y: 112, w: 200, h: 86 }, { kind: 'gravel', x: 236, y: 0, w: 124, h: 112 }],
  glow: [
    { points: [[192, 28], [208, 28], [340, 196], [164, 196]], color: '#f7efc8', op: 0.05 },
    { points: [[250, 198], [300, 198], [316, 212], [236, 212]], color: '#f2b544', op: 0.07 },
  ],
  aria: 'Site plan of the racecourse stables: the service gate and the van, the edge of the track, rows of stables, the vet block, and a floodlight tower for overwatch',
  points: { van: [300, 224], perch: [200, 30], target: [300, 70] },
  paths: {
    in: [[300, 224], [250, 224], [250, 198]],
    inside: [[250, 198], [250, 156], [200, 156], [230, 118]],
    target: [[230, 118], [250, 96], [300, 70]],
    out: [[300, 70], [250, 96], [230, 118], [200, 156], [250, 156], [250, 198], [250, 224], [300, 224]],
  },
  views: { in: [168, 112, 192, 128], inside: [100, 60, 255, 170], target: [180, 10, 180, 120] },
  posts: { in: [186, 192], inside: [215, 106], target: [318, 98] },
  sight: { rifle: [[200, 30], [140, 120], [160, 198], [348, 198], [348, 114], [246, 114], [246, 34]], drone: [[200, 30], [6, 6], [6, 206], [354, 206], [354, 6]] },
  shapes: [
    ...ROAD,
    // Lantern Course at its real size (owner, 2026-11-12): only the near bend of a far bigger oval,
    // running off the top and left edges; the dirt between two rails, the infield inside. It still
    // stops short of the stable rows (owner, 2026-11-06) and the floodlight.
    { t: 'ellipse', cls: 'sp-track', cx: -50, cy: -70, rx: 240, ry: 250 },
    { t: 'ellipse', cls: 'sp-infield', cx: -50, cy: -70, rx: 224, ry: 234 },
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
    // Cover for fights (core/fightspots.js, 2026-10-30): a horse trailer and hay at the service gate, a trailer and a feed bin by the vet block, the vet's table inside.
    { t: 'rect', cls: 'sp-cover', x: 258, y: 204, w: 26, h: 9, fill: CONTAINER_TONES[3] },
    { t: 'rect', cls: 'sp-cover', x: 300, y: 200, w: 14, h: 10, fill: '#6b5a2e' },
    { t: 'rect', cls: 'sp-cover', x: 214, y: 84, w: 10, h: 24, fill: CONTAINER_TONES[3] },
    { t: 'rect', cls: 'sp-cover', x: 228, y: 70, w: 12, h: 10, fill: CONTAINER_TONES[1] },
    { t: 'rect', cls: 'sp-desk', x: 296, y: 90, w: 16, h: 8 },
  ],
  labels: [
    { x: 178, y: 210, text: 'SERVICE GATE' }, { x: 176, y: 124, text: 'STABLES' },
    { x: 262, y: 34, text: 'VET BLOCK', hi: true }, { x: 214, y: 20, text: 'FLOODLIGHT' }, { x: 16, y: 60, text: 'LANTERN COURSE' },
    { x: 300, y: 236, text: 'VAN' },
  ],
};

// --- plots and parts (DESIGN.md, 2026-10-29) ----------------------------------------------------
// A district with parts is a plot (the place itself: what's always there, the overwatch perch, the
// hub where every way in meets every target, what the drone sees) and three kinds of hand-drawn
// part, put together per job (after XCOM 2's plots and parcels):
// - approaches: where the van stops and the way in to the hub (its own fence and gate), with the
//   camera views for the way in and inside, and its labels;
// - covers: what's stacked in the open ground between (no route may cross one);
// - targets: the building the job is about, with the walk from the hub, its camera view and what
//   the rifle sees past it. A target with `jobs` is that job's own place (Clinic Night's clinic);
//   the others are the district's usual targets, for every other job there.
// assemble() turns a choice of parts into the same site shape the plain sites have, so the plan
// draws it the same way. The core reads a site for one thing: where a fight stands, off its drawn
// cover (core/fightspots.js, in the districts data/battle.js spotsIn names).

const DOCKS = {
  name: 'a container yard',
  aria: 'Site plan of a container yard on the harbour',
  // How it's drawn (ui/siteart.js): Red Lantern red off the harbour, sodium yard lamps, concrete slabs.
  look: 'docks', light: '#ff3d5f',
  texture: [{ kind: 'concrete', x: 0, y: 0, w: 318, h: 212 }],
  glow: [
    { points: [[318, 40], [318, 110], [90, 120], [120, 50]], color: '#ff3d5f', op: 0.07 },
    { points: [[318, 120], [318, 190], [40, 196], [70, 130]], color: '#f2b544', op: 0.06 },
    { points: [[60, 213], [110, 213], [96, 239], [46, 239]], color: '#f2b544', op: 0.07 },
    { points: [[200, 213], [240, 213], [226, 239], [186, 239]], color: '#ff3d5f', op: 0.07 },
  ],
  perch: [176, 24],
  hub: [186, 135],
  drone: [[176, 24], [8, 12], [8, 212], [352, 212], [352, 12]],
  shapes: [
    { t: 'rect', cls: 'sp-road', x: 0, y: 212, w: 318, h: 28 },
    { t: 'line', cls: 'sp-road__line', x1: 0, y1: 226, x2: 318, y2: 226 },
    { t: 'rect', cls: 'sp-water', x: 318, y: 0, w: 42, h: 240 },
    { t: 'rect', cls: 'sp-jetty', x: 310, y: 186, w: 24, h: 9 },
    { t: 'line', cls: 'sp-perch', x1: 146, y1: 24, x2: 206, y2: 24 },
    { t: 'line', cls: 'sp-perch', x1: 150, y1: 24, x2: 150, y2: 40 },
    { t: 'line', cls: 'sp-perch', x1: 202, y1: 24, x2: 202, y2: 40 },
  ],
  labels: [{ x: 212, y: 20, text: 'CRANE' }],
  approaches: [
    {
      id: 'gate', aria: 'the van on the service road and a gate in the fence',
      van: [40, 224], in: [[40, 224], [106, 224], [106, 196]], inside: [[106, 196], [106, 135], [186, 135]],
      views: { in: [6, 126, 171, 114], inside: [0, 46, 249, 166] },
      posts: { in: [122, 184], inside: [150, 122] },
      shapes: [
        { t: 'poly', cls: 'sp-fence', points: [[8, 196], [94, 196]] },
        { t: 'poly', cls: 'sp-fence', points: [[118, 196], [352, 196]] },
        // Pallets stacked by the gate: cover for a fight at the fence (core/fightspots.js).
        { t: 'rect', cls: 'sp-cover', x: 60, y: 199, w: 26, h: 10, fill: CONTAINER_TONES[3] },
        { t: 'rect', cls: 'sp-cover', x: 30, y: 199, w: 18, h: 10, fill: CONTAINER_TONES[1] },
      ],
      labels: [{ x: 124, y: 206, text: 'THE FENCE' }, { x: 8, y: 236, text: 'VAN' }],
    },
    {
      id: 'quay', aria: 'the van at the harbour end of the road and a gate by the quay',
      van: [300, 224], in: [[300, 224], [282, 224], [282, 196]], inside: [[282, 196], [282, 150], [230, 135], [186, 135]],
      views: { in: [189, 126, 171, 114], inside: [100, 60, 255, 170] },
      posts: { in: [298, 186], inside: [250, 150] },
      shapes: [
        { t: 'poly', cls: 'sp-fence', points: [[8, 196], [262, 196]] },
        { t: 'poly', cls: 'sp-fence', points: [[294, 196], [352, 196]] },
        // Pallets stacked by the gate: cover for a fight at the fence (core/fightspots.js).
        { t: 'rect', cls: 'sp-cover', x: 236, y: 199, w: 26, h: 10, fill: CONTAINER_TONES[3] },
        { t: 'rect', cls: 'sp-cover', x: 208, y: 199, w: 18, h: 10, fill: CONTAINER_TONES[1] },
      ],
      labels: [{ x: 196, y: 206, text: 'THE FENCE' }, { x: 292, y: 236, text: 'VAN' }],
    },
  ],
  covers: [
    {
      id: 'stacks', aria: 'rows of containers',
      shapes: [
        { t: 'row', cls: 'sp-cover', x: 16, y: 100, w: 27, h: 14, step: 31, n: 2, tones: CONTAINER_TONES },
        { t: 'row', cls: 'sp-cover', x: 16, y: 150, w: 27, h: 14, step: 31, n: 2, tones: CONTAINER_TONES, shift: 1 },
        { t: 'row', cls: 'sp-cover', x: 130, y: 156, w: 27, h: 14, step: 31, n: 3, tones: CONTAINER_TONES, shift: 2 },
        { t: 'row', cls: 'sp-cover', x: 114, y: 44, w: 27, h: 14, step: 31, n: 2, tones: CONTAINER_TONES, shift: 3 },
        { t: 'rect', cls: 'sp-cover', x: 250, y: 160, w: 22, h: 12, fill: CONTAINER_TONES[1] },
        { t: 'row', cls: 'sp-cover', x: 16, y: 124, w: 27, h: 14, step: 31, n: 2, tones: CONTAINER_TONES, shift: 2 },
        { t: 'row', cls: 'sp-cover', x: 130, y: 176, w: 27, h: 14, step: 31, n: 3, tones: CONTAINER_TONES, shift: 1 },
        { t: 'row', cls: 'sp-cover', x: 16, y: 172, w: 27, h: 14, step: 31, n: 2, tones: CONTAINER_TONES, shift: 3 },
        { t: 'row', cls: 'sp-cover', x: 140, y: 70, w: 27, h: 14, step: 31, n: 2, tones: CONTAINER_TONES, shift: 1 },
        { t: 'rect', cls: 'sp-cover', x: 208, y: 48, w: 27, h: 14, fill: CONTAINER_TONES[0] },
        { t: 'row', cls: 'sp-cover', x: 292, y: 120, w: 20, h: 12, step: 22, n: 3, axis: 'y', tones: CONTAINER_TONES, shift: 2 },
        { t: 'rect', cls: 'sp-cover', x: 18, y: 66, w: 22, h: 12, fill: CONTAINER_TONES[3] },
        { t: 'rect', cls: 'sp-cover', x: 18, y: 82, w: 22, h: 10, fill: CONTAINER_TONES[1] },
      ],
      labels: [{ x: 18, y: 122, text: 'THE YARD' }],
    },
    {
      id: 'open', aria: 'a few containers and loose crates',
      shapes: [
        { t: 'row', cls: 'sp-cover', x: 16, y: 150, w: 27, h: 14, step: 31, n: 2, tones: CONTAINER_TONES, shift: 2 },
        { t: 'row', cls: 'sp-cover', x: 140, y: 160, w: 27, h: 14, step: 31, n: 2, tones: CONTAINER_TONES },
        { t: 'rect', cls: 'sp-cover', x: 208, y: 48, w: 27, h: 14, fill: CONTAINER_TONES[3] },
        { t: 'rect', cls: 'sp-cover', x: 24, y: 104, w: 18, h: 12, fill: CONTAINER_TONES[1] },
        { t: 'rect', cls: 'sp-cover', x: 60, y: 176, w: 18, h: 12, fill: CONTAINER_TONES[2] },
        { t: 'rect', cls: 'sp-cover', x: 146, y: 72, w: 20, h: 12, fill: CONTAINER_TONES[0] },
        { t: 'rect', cls: 'sp-cover', x: 292, y: 140, w: 20, h: 12, fill: CONTAINER_TONES[3] },
        { t: 'rect', cls: 'sp-cover', x: 18, y: 70, w: 18, h: 12, fill: CONTAINER_TONES[2] },
        { t: 'rect', cls: 'sp-cover', x: 200, y: 178, w: 18, h: 12, fill: CONTAINER_TONES[1] },
      ],
      labels: [{ x: 18, y: 140, text: 'THE YARD' }],
    },
  ],
  targets: [
    {
      id: 'office', aria: 'the yard office',
      point: [272, 74], path: [[186, 135], [236, 100], [272, 74]], view: [150, 4, 204, 136],
      post: [290, 92],
      rifle: [[176, 24], [12, 194], [232, 194], [232, 40]],
      shapes: [
        { t: 'rect', cls: 'sp-building', x: 236, y: 38, w: 72, h: 72 },
        { t: 'rect', cls: 'sp-door', x: 233, y: 94, w: 5, h: 12 },
        { t: 'rect', cls: 'sp-desk', x: 252, y: 52, w: 20, h: 8 },
        { t: 'rect', cls: 'sp-desk', x: 282, y: 80, w: 16, h: 16 },
      ],
      labels: [{ x: 246, y: 32, text: 'YARD OFFICE', hi: true }],
    },
    {
      id: 'cable-hut', jobs: ['cable'], aria: 'the cable hut on Pier 12, its cable running into the water',
      point: [298, 58], path: [[186, 135], [250, 110], [276, 74], [298, 58]], view: [170, 20, 180, 120],
      post: [306, 74],
      rifle: [[176, 24], [12, 194], [300, 194], [270, 92], [270, 36]],
      shapes: [
        { t: 'rect', cls: 'sp-building', x: 282, y: 34, w: 34, h: 50 },
        { t: 'rect', cls: 'sp-door', x: 279, y: 62, w: 5, h: 12 },
        { t: 'rect', cls: 'sp-desk', x: 292, y: 42, w: 14, h: 8 },
        { t: 'line', cls: 'sp-cable', x1: 316, y1: 60, x2: 360, y2: 72 },
      ],
      labels: [{ x: 262, y: 28, text: 'PIER 12 HUT', hi: true }],
    },
    {
      id: 'container-409', jobs: ['container409'], aria: 'Container 409 in a stack by the fence',
      point: [76, 74], path: [[186, 135], [130, 104], [104, 78], [76, 74]], view: [40, 40, 180, 120],
      post: [62, 76],
      rifle: [[176, 24], [118, 58], [118, 194], [300, 194], [300, 40]],
      shapes: [
        { t: 'rect', cls: 'sp-cover', x: 50, y: 40, w: 27, h: 14, fill: CONTAINER_TONES[0] },
        { t: 'rect', cls: 'sp-cover', x: 80, y: 40, w: 27, h: 14, fill: CONTAINER_TONES[2] },
        { t: 'rect', cls: 'sp-building', x: 50, y: 62, w: 50, h: 24 },
        { t: 'rect', cls: 'sp-door', x: 98, y: 68, w: 5, h: 12 },
      ],
      labels: [{ x: 40, y: 34, text: 'CONTAINER 409', hi: true }],
    },
  ],
};

// Old Town: up an alley of steps from the lane, across a courtyard strung with laundry, into a
// tenement. Overwatch on the next block's roof, by the water tank. Block 9's stairwell clinic is
// Clinic Night's own target.
const TENEMENT = [
  { t: 'rect', cls: 'sp-building', x: 24, y: 28, w: 96, h: 84 },
  { t: 'rect', cls: 'sp-door', x: 117, y: 92, w: 5, h: 12 },
];
const OLD_TOWN_TARGET = {
  point: [72, 64], path: [[140, 118], [118, 100], [72, 64]], view: [10, 10, 204, 136],
  post: [100, 60],
  rifle: [[292, 40], [128, 96], [128, 156], [222, 212], [300, 212], [300, 100]],
};
const OLD_TOWN = {
  name: 'a tenement',
  aria: 'Site plan of a tenement in Old Town',
  // How it's drawn (ui/siteart.js): sodium street light, a cobbled courtyard, the red sign at the alley's foot.
  look: 'oldTown', light: '#f2b544', paving: true,
  texture: [{ kind: 'cobble', x: 132, y: 100, w: 170, h: 52 }],
  glow: [
    { points: [[302, 100], [302, 150], [132, 152], [160, 100]], color: '#f2b544', op: 0.07 },
    { points: [[256, 202], [286, 202], [280, 212], [236, 212]], color: '#ff3d5f', op: 0.14 },
    { points: [[226, 40], [226, 90], [132, 98], [150, 48]], color: '#3de8d8', op: 0.05 },
  ],
  perch: [292, 40],
  hub: [140, 118],
  drone: [[292, 40], [8, 12], [8, 212], [352, 212], [352, 12]],
  shapes: [
    ...ROAD,
    { t: 'rect', cls: 'sp-yard', x: 132, y: 100, w: 170, h: 52 },
    { t: 'rect', cls: 'sp-alley', x: 226, y: 150, w: 20, h: 62 },
    { t: 'row', cls: 'sp-step', x: 228, y: 156, w: 16, h: 1.5, step: 7, n: 8, axis: 'y' },
    { t: 'rect', cls: 'sp-block', x: 150, y: 20, w: 76, h: 72 },
    { t: 'rect', cls: 'sp-block', x: 250, y: 30, w: 92, h: 66 },
    { t: 'row', cls: 'sp-window', x: 158, y: 30, w: 5, h: 4, step: 12, n: 6, tones: ['#2a303b', '#f2d541', '#2a303b', '#2a303b', '#3de8d8', '#2a303b'] },
    { t: 'row', cls: 'sp-window', x: 158, y: 50, w: 5, h: 4, step: 12, n: 6, tones: ['#2a303b', '#2a303b', '#ff3d5f', '#2a303b', '#2a303b', '#f2d541'] },
    { t: 'row', cls: 'sp-window', x: 158, y: 70, w: 5, h: 4, step: 12, n: 6, tones: ['#f2d541', '#2a303b', '#2a303b', '#2a303b', '#2a303b', '#2a303b'] },
    { t: 'row', cls: 'sp-window', x: 258, y: 58, w: 5, h: 4, step: 12, n: 7, tones: ['#2a303b', '#2a303b', '#3de8d8', '#2a303b', '#f2d541', '#2a303b', '#2a303b'] },
    { t: 'row', cls: 'sp-window', x: 258, y: 78, w: 5, h: 4, step: 12, n: 7, tones: ['#2a303b', '#ff3d5f', '#2a303b', '#2a303b', '#2a303b', '#2a303b', '#f2d541'] },
    { t: 'circle', cls: 'sp-tank', cx: 292, cy: 40, r: 7 },
    { t: 'rect', cls: 'sp-sign', x: 256, y: 196, w: 30, h: 6, fill: '#ff3d5f' },
    // Cover for fights (core/fightspots.js, 2026-10-30): bins and a dumpster at the foot of the alley.
    { t: 'rect', cls: 'sp-cover', x: 252, y: 178, w: 12, h: 12, fill: CONTAINER_TONES[2] },
    { t: 'rect', cls: 'sp-cover', x: 248, y: 204, w: 24, h: 8, fill: CONTAINER_TONES[0] },
    { t: 'rect', cls: 'sp-cover', x: 196, y: 184, w: 14, h: 10, fill: CONTAINER_TONES[3] },
  ],
  labels: [{ x: 304, y: 26, text: 'ROOF' }],
  approaches: [
    {
      id: 'alley', aria: 'the lane and the van, and an alley of steps',
      van: [316, 224], in: [[316, 224], [236, 224], [236, 198]], inside: [[236, 198], [236, 160], [200, 128], [140, 118]],
      views: { in: [189, 126, 171, 114], inside: [105, 72, 195, 130] },
      posts: { in: [216, 200], inside: [180, 140] },
      shapes: [],
      labels: [{ x: 252, y: 188, text: 'ALLEY' }, { x: 300, y: 236, text: 'VAN' }],
    },
  ],
  covers: [
    {
      id: 'laundry', aria: 'a courtyard with laundry lines',
      shapes: [
        { t: 'poly', cls: 'sp-laundry', points: [[150, 106], [190, 112], [250, 104]] },
        { t: 'poly', cls: 'sp-laundry', points: [[150, 140], [210, 146], [290, 138]] },
        // Cover for fights: a handcart, washing tubs, a stack of crates.
        { t: 'rect', cls: 'sp-cover', x: 150, y: 128, w: 24, h: 9, fill: CONTAINER_TONES[3] },
        { t: 'rect', cls: 'sp-cover', x: 128, y: 128, w: 12, h: 10, fill: CONTAINER_TONES[1] },
        { t: 'rect', cls: 'sp-cover', x: 196, y: 150, w: 14, h: 10, fill: CONTAINER_TONES[2] },
      ],
      labels: [{ x: 150, y: 160, text: 'COURTYARD' }],
    },
  ],
  targets: [
    {
      id: 'flat', aria: 'the tenement with the flat', ...OLD_TOWN_TARGET,
      shapes: [...TENEMENT, { t: 'rect', cls: 'sp-room', x: 40, y: 44, w: 50, h: 36 }, { t: 'rect', cls: 'sp-desk', x: 94, y: 70, w: 16, h: 8 }],
      labels: [{ x: 40, y: 22, text: 'THE FLAT', hi: true }],
    },
    {
      id: 'clinic', jobs: ['clinic'], aria: 'Block 9, with Doc Siu\'s clinic down the stairwell', ...OLD_TOWN_TARGET,
      shapes: [
        ...TENEMENT,
        { t: 'rect', cls: 'sp-room', x: 40, y: 44, w: 50, h: 36 },
        { t: 'row', cls: 'sp-cot', x: 44, y: 50, w: 12, h: 5, step: 16, n: 3 },
        { t: 'row', cls: 'sp-cot', x: 44, y: 68, w: 12, h: 5, step: 16, n: 3 },
        { t: 'rect', cls: 'sp-sign', x: 100, y: 100, w: 12, h: 4, fill: '#3de8d8' },
        { t: 'rect', cls: 'sp-desk', x: 94, y: 70, w: 16, h: 8 },
      ],
      labels: [{ x: 26, y: 22, text: 'BLOCK 9 CLINIC', hi: true }],
    },
  ],
};

/**
 * A hall of ours, from above (raids, 2026-11-05): one shared layout for now, every district's hall
 * drawn the same until each gets its own. Our people are in the back room by the stairs (the way
 * out); the raiders come in through the front door off the street. The cover between is the hall's
 * furniture: bunks, a table turned on its side, crates, the kitchen counter.
 */
export const HALL = {
  name: 'our hall',
  aria: 'Plan of our hall: the back stairs and the bunk room, the main room with a table and crates, the kitchen, and the front door onto the street',
  points: { van: [40, 30], perch: [320, 30], target: [180, 56] },
  paths: {
    in: [[40, 30], [70, 44]],
    inside: [[70, 44], [130, 52], [180, 56]],
    target: [[180, 56], [180, 56]],
    out: [[180, 56], [130, 52], [70, 44], [40, 30]],
  },
  views: { in: [0, 0, 360, 240], inside: [0, 0, 360, 240], target: [0, 0, 360, 240] },
  posts: { in: [180, 190], inside: [180, 190], target: [180, 190] },
  sight: { rifle: [[320, 30], [330, 34], [330, 40]], drone: [[320, 30], [8, 206], [352, 206], [352, 8]] },
  shapes: [
    ...ROAD,
    { t: 'rect', cls: 'sp-building', x: 16, y: 14, w: 328, h: 184 },
    { t: 'rect', cls: 'sp-door', x: 172, y: 195, w: 16, h: 5 },
    { t: 'row', cls: 'sp-step', x: 24, y: 22, w: 26, h: 1.5, step: 5, n: 6, axis: 'y' },
    { t: 'line', cls: 'sp-wall', x1: 110, y1: 14, x2: 110, y2: 92 },
    { t: 'line', cls: 'sp-wall', x1: 260, y1: 14, x2: 260, y2: 92 },
    { t: 'line', cls: 'sp-wall', x1: 16, y1: 120, x2: 120, y2: 120 },
    { t: 'line', cls: 'sp-wall', x1: 240, y1: 120, x2: 344, y2: 120 },
    // The bunk room (left), the back room (centre top), the kitchen (right).
    { t: 'row', cls: 'sp-cot', x: 26, y: 132, w: 22, h: 8, step: 30, n: 3 },
    { t: 'row', cls: 'sp-cot', x: 26, y: 160, w: 22, h: 8, step: 30, n: 3 },
    { t: 'rect', cls: 'sp-desk', x: 150, y: 88, w: 30, h: 10 }, // the table, on its side
    { t: 'rect', cls: 'sp-cover', x: 206, y: 96, w: 14, h: 12 }, // crates
    { t: 'rect', cls: 'sp-cover', x: 126, y: 104, w: 12, h: 12 },
    { t: 'rect', cls: 'sp-desk', x: 276, y: 130, w: 48, h: 9 }, // the kitchen counter
    { t: 'rect', cls: 'sp-cover', x: 150, y: 150, w: 14, h: 10 }, // a shrine table by the door
    { t: 'rect', cls: 'sp-cover', x: 204, y: 156, w: 12, h: 10 }, // shoes and umbrellas
  ],
  labels: [
    { x: 22, y: 10, text: 'BACK STAIRS' }, { x: 26, y: 128, text: 'BUNKS' }, { x: 272, y: 126, text: 'KITCHEN' },
    { x: 150, y: 30, text: 'OUR HALL', hi: true }, { x: 156, y: 210, text: 'FRONT DOOR' },
  ],
};

// Each district's own hall (2026-11-05: a hall map per district, after the shared HALL): the places
// data/halls.js names, each with our people by the back way out (paths.inside's end) and the
// raiders' way in (posts). Cover is furniture and the place's own stuff, so a fight there reads as
// that hall. Checked by tests/hallmaps.test.js (on the map, spots in cover on both sides).
/** A hall's way in for a raid: where the raiders come in (entry), where ours stand (anchor), and ours' way out. */
export const hallWay = ({ exit, anchor, entry, via = null, perch = [340, 18] }) => {
  const mid = via ?? [(exit[0] + anchor[0]) / 2, (exit[1] + anchor[1]) / 2];
  return {
    points: { van: exit, perch, target: anchor },
    paths: { in: [exit, mid], inside: [mid, anchor], target: [anchor, anchor], out: [anchor, exit] },
    posts: { in: entry, inside: entry, target: entry },
  };
};
const hallSite = (name, aria, way) => ({
  name, aria, ...hallWay(way),
  views: { in: [0, 0, 360, 240], inside: [0, 0, 360, 240], target: [0, 0, 360, 240] },
  sight: { rifle: [way.perch ?? [340, 18], [(way.perch ?? [340, 18])[0] - 6, (way.perch ?? [340, 18])[1] + 4], [(way.perch ?? [340, 18])[0] + 6, (way.perch ?? [340, 18])[1] + 4]], drone: [way.perch ?? [340, 18], [4, 236], [356, 236], [356, 4], [4, 4]] },
});
/** The usual map height; a hall compound is taller (`h`: 330, 12 × 11 squares, with a walled forecourt in front of the buildings, 2026-11-12). */
export const SITE_H = 240;
export const siteHeight = (site) => site?.h ?? SITE_H;
const FORECOURT = 90; // how much taller a compound is than the usual map: three rows of squares in front of the buildings
const SILK = ['#b48cff', '#ff5fae', '#f2d541', '#3de8d8'];
const SADDLE = '#4a3424';

// Every hall is a compound that grows with Expand (owner, 2026-11-07: Old Town first, "a bit of gap
// between some of the buildings ... raids look better because they are fighting between buildings",
// then "do the other four halls the same way"). One layout, drawn per district (mirrored for some):
// separate buildings with a lane, a yard and a passage between them, a strip along the top (an
// alley, a market lane, a walkway) and one along the bottom (the street, a yard, a loading dock).
// `parts` are what the hall can hold, each from a level, in build cells (core/hallbuild.js
// heldParts): the first building and the lane beside it at level 1, then the building across the
// lane, the walled yard behind with its gate, and the small building across the passage. An inside
// part's `beds` is how many of the hall's beds stand in it (the yard's go in the second building).
// The buildings are solid in a fight (sp-house), so a raid is fought outside: `ways` are up the lane
// from the bottom strip, and (with the yard) through the yard's gate from the top strip. The names
// and places of the other four halls are the owner's lore (2026-11-07, after
// drafts/BRIEF-hall-compounds.md); a way's `line` opens a raid that comes in by it.
const mirrorX = (shape) => {
  if (shape.t === 'rect') return { ...shape, x: 360 - shape.x - shape.w };
  if (shape.t === 'line') return { ...shape, x1: 360 - shape.x1, x2: 360 - shape.x2 };
  return shape;
};
const flipPt = ([x, y]) => [360 - x, y];
const flipGrid = ([x0, y0, x1, y1]) => [11 - x1, y0, 11 - x0, y1];
/** The forecourt part, the same in every hall until its words are written (add-lore): ours, inside the front gate. */
const FORECOURT_PART = { name: 'The Forecourt', about: 'The walled ground inside the front gate, between the buildings and the street. Outside: defences go here, and a raid comes in through the front gate.' };
/**
 * A hall drawn as a compound. spec: { name, aria, mirror, top: { cls, label }, bottom: { shapes, label },
 * lit, sign, covers: [8 fills], gate, parts: [5 × { name, about }], beds: [3 shares],
 * costs: [3], say: { street, gate } ("<who> come ...") or line: { street, gate } (a sentence of its own) }.
 */
function compound(spec) {
  const m = spec.mirror;
  const S = (shape) => (m ? mirrorX(shape) : shape);
  const P = (pt) => (m ? flipPt(pt) : pt);
  const G = (g) => (m ? flipGrid(g) : g);
  const way = (w) => ({ ...w, exit: P(w.exit), anchor: P(w.anchor), entry: P(w.entry), via: P(w.via) });
  // The street way (2026-11-12): raiders come in at the front gate off the street and our people hold
  // the forecourt inside it, so what's built there is cover on our side of the fight. The gate way is
  // from behind, as before; its crew gather in the lane.
  const street = way({ exit: [180, 326], anchor: [180, 262], entry: [180, 318], via: [180, 300] });
  const gate = way({ exit: [180, 318], anchor: [180, 100], entry: [135, 16], via: [180, 262] });
  const [room, lane, flat, yard, kitchen] = spec.parts;
  const down = (sh) => (sh.t === 'rect' ? { ...sh, y: sh.y + FORECOURT } : sh.t === 'line' ? { ...sh, y1: sh.y1 + FORECOURT, y2: sh.y2 + FORECOURT } : sh);
  // The forecourt: ours, walled in, one gate onto the street. Its ground and walls, then the street strip below it.
  const forecourt = [
    { t: 'rect', cls: 'sp-yard', x: 22, y: 210, w: 316, h: 90 },
    { t: 'line', cls: 'sp-wall', x1: 22, y1: 210, x2: 22, y2: 298 },
    { t: 'line', cls: 'sp-wall', x1: 338, y1: 210, x2: 338, y2: 298 },
    { t: 'line', cls: 'sp-wall', x1: 22, y1: 298, x2: 165, y2: 298 },
    { t: 'line', cls: 'sp-wall', x1: 195, y1: 298, x2: 338, y2: 298 },
    { t: 'rect', cls: 'sp-gate', x: 165, y: 296, w: 30, h: 4, fill: spec.gate },
  ];
  const fill = spec.covers;
  return {
    ...hallSite(spec.name, spec.aria, street),
    h: SITE_H + FORECOURT,
    views: { in: [0, 0, 360, SITE_H + FORECOURT], inside: [0, 0, 360, SITE_H + FORECOURT], target: [0, 0, 360, SITE_H + FORECOURT] },
    ways: {
      street: { lvl: 1, say: spec.say?.street, line: spec.line?.street, ...hallWay(street) },
      gate: { lvl: 3, say: spec.say?.gate, line: spec.line?.gate, ...hallWay(gate) },
    },
    // Stands for posts (2026-11-12; `stands`, not `posts`, which is where each side starts a fight): where our people can stand to hold the front gate. `part`: the part it belongs to
    // (held from that part's level); `kind`: which post goes there ('window', 'roof', 'gate'); `at`: the
    // spot on the plan (a rooftop's is on the roof, a window's just outside the wall).
    stands: [
      { id: 'room-window', part: 'room', kind: 'window', at: P([90, 216]), name: `${room.name} window` },
      { id: 'room-roof', part: 'room', kind: 'roof', at: P([90, 114]), name: `${room.name} roof` },
      { id: 'flat-window', part: 'flat', kind: 'window', at: P([270, 216]), name: `${flat.name} window` },
      { id: 'flat-roof', part: 'flat', kind: 'roof', at: P([270, 114]), name: `${flat.name} roof` },
      { id: 'gate-left', part: 'front', kind: 'gate', at: P([148, 286]), name: 'Gate post, left' },
      { id: 'gate-right', part: 'front', kind: 'gate', at: P([212, 286]), name: 'Gate post, right' },
    ],
    parts: [
      { id: 'room', lvl: 1, inside: true, grid: G([1, 3, 4, 6]), bedCorner: P([1, 3]).map((v, i) => (i ? v : m ? 11 - 1 : 1)), beds: spec.beds[0], ...room },
      { id: 'lane', lvl: 1, inside: false, grid: G([5, 3, 6, 6]), ...lane },
      { id: 'front', lvl: 1, inside: false, grid: G([1, 7, 10, 9]), ...FORECOURT_PART },
      { id: 'flat', lvl: 2, inside: true, grid: G([7, 3, 10, 6]), bedCorner: [m ? 1 : 10, 6], beds: spec.beds[1], cost: spec.costs[0], ...flat },
      { id: 'yard', lvl: 3, inside: false, grid: G([1, 1, 7, 2]), cost: spec.costs[1], ...yard,
        shapes: [{ t: 'line', cls: 'sp-wall', x1: 26, y1: 30, x2: 120, y2: 30 }, { t: 'line', cls: 'sp-wall', x1: 150, y1: 30, x2: 240, y2: 30 }, { t: 'rect', cls: 'sp-gate', x: 120, y: 28, w: 30, h: 4, fill: spec.gate }].map(S) },
      { id: 'kitchen', lvl: 4, inside: true, grid: G([9, 1, 11, 2]), bedCorner: [m ? 0 : 11, 1], beds: spec.beds[2], cost: spec.costs[2], ...kitchen },
    ],
    shapes: [
      { t: 'rect', cls: spec.top.cls, x: 0, y: 0, w: 360, h: 30 },
      ...spec.bottom.shapes.map(down),
      ...forecourt.map(S),
      ...[
        { t: 'rect', cls: 'sp-house', x: 26, y: 92, w: 128, h: 118 },
        { t: 'rect', cls: 'sp-house', x: 206, y: 92, w: 128, h: 118 },
        { t: 'rect', cls: 'sp-house', x: 266, y: 32, w: 90, h: 58 },
        { t: 'rect', cls: 'sp-block', x: 0, y: 32, w: 22, h: 268 },
        { t: 'rect', cls: 'sp-block', x: 338, y: 92, w: 22, h: 208 },
        { t: 'rect', cls: 'sp-sign', x: 50, y: 206, w: 44, h: 5, fill: spec.sign },
        { t: 'rect', cls: 'sp-door', x: 151, y: 140, w: 4, h: 16 },
        { t: 'rect', cls: 'sp-door', x: 80, y: 90, w: 16, h: 4 },
        { t: 'rect', cls: 'sp-door', x: 205, y: 140, w: 4, h: 16 },
        { t: 'rect', cls: 'sp-door', x: 264, y: 52, w: 4, h: 16 },
        // Outside, as cover: two things in the yard, one in the passage, two in the top strip, three in the bottom.
        { t: 'rect', cls: 'sp-cover', x: 182, y: 40, w: 26, h: 8, fill: fill[0] },
        { t: 'rect', cls: 'sp-cover', x: 124, y: 66, w: 12, h: 12, fill: fill[1] },
        { t: 'rect', cls: 'sp-cover', x: 244, y: 60, w: 8, h: 26, fill: fill[2] },
        { t: 'rect', cls: 'sp-cover', x: 96, y: 16, w: 26, h: 8, fill: fill[3] },
        { t: 'rect', cls: 'sp-cover', x: 170, y: 16, w: 14, h: 8, fill: fill[4] },
        // The forecourt's own things, a hall with nothing built still has some cover on our side of the gate.
        { t: 'rect', cls: 'sp-cover', x: 120, y: 228, w: 26, h: 8, fill: fill[3] },
        { t: 'rect', cls: 'sp-cover', x: 214, y: 228, w: 26, h: 8, fill: fill[1] },
        { t: 'rect', cls: 'sp-cover', x: 124, y: 212 + FORECOURT, w: 26, h: 8, fill: fill[5] },
        { t: 'rect', cls: 'sp-cover', x: 244, y: 213 + FORECOURT, w: 14, h: 8, fill: fill[6] },
        { t: 'rect', cls: 'sp-cover', x: 300, y: 212 + FORECOURT, w: 26, h: 8, fill: fill[7] ?? '#2f3442' },
      ].map(S),
    ],
    labels: [
      { x: m ? 250 : 52, y: 236 + FORECOURT, text: spec.bottom.label },
      { x: m ? 20 : 262, y: 236 + FORECOURT, text: spec.lit, hi: true },
      { x: m ? 250 : 6, y: 10, text: spec.top.label },
    ],
  };
}
const ROADWAY = (cls = 'sp-road') => [{ t: 'rect', cls, x: 0, y: 212, w: 360, h: 28 }, ...(cls === 'sp-road' ? [{ t: 'line', cls: 'sp-road__line', x1: 0, y1: 226, x2: 360, y2: 226 }] : [])];

export const HALLS = {
  // Old Town: the room above the noodle shop, and the block around it.
  oldTown: compound({
    name: 'the room above the noodle shop',
    aria: 'Plan of our Old Town hall: the room above the noodle shop, the lane beside it, the flat across the lane, the yard behind with a gate onto the back alley, and the back kitchen across the passage',
    top: { cls: 'sp-alley', label: 'BACK ALLEY' }, bottom: { shapes: ROADWAY(), label: 'NOODLE SHOP' }, lit: 'OUR BLOCK', sign: '#ff3d5f', gate: '#f2d541',
    covers: ['#3a2d22', CONTAINER_TONES[2], CONTAINER_TONES[3], CONTAINER_TONES[0], CONTAINER_TONES[1], CONTAINER_TONES[2], '#7a2a2a', '#2f3442'], // pallets, bins, a water tank, bins, crates, noodle crates, a hawker's cart, a delivery trike
    parts: [
      { name: 'The room', about: 'Where it started, above the noodle shop. Rooms and beds go in here.' },
      { name: 'The lane', about: 'The lane between the buildings, up from the street. Outside: a raid from the street is fought here.' },
      { name: 'The flat', about: 'The flat across the lane. Room for a clinic and more beds.' },
      { name: 'The yard', about: 'The yard behind the block, walled in, with a gate onto the back alley. Outside: defences go here, and a raid can come through the gate.' },
      { name: 'The back kitchen', about: 'The old back kitchen across the passage. With it the whole block is ours.' },
    ],
    beds: [8, 4, 2], costs: [20000, 30000, 40000],
    say: { street: 'come up the lane from the street', gate: 'come through the yard gate' },
  }),
  // The Night Market: Wok Court (owner's lore, 2026-11-07). Rooms behind a dai pai dong courtyard,
  // leased from the stallholders' association; Mrs. Ip makes the introduction. The public eating
  // court is outside the compound, past the Supper Frontage.
  nightMarket: compound({
    name: 'Wok Court',
    aria: 'Plan of Wok Court, our Night Market hall: the Late Rooms, the Wash Passage beside them, the Prep House across the passage, the Delivery Court behind with the Cart Gate onto the market service lane, and the Rice Store across the way',
    top: { cls: 'sp-alley', label: 'MARKET SERVICE LANE' }, bottom: { shapes: ROADWAY(), label: 'SUPPER FRONTAGE' }, lit: 'WOK COURT', sign: '#ff5fae', gate: '#8b9aab',
    // A folded-table rack, a washing-water drum, a washing cabinet, stacked steel delivery crates, an
    // insulated delivery chest, a shuttered food-service cart, a delivery scooter, a retired refrigerator.
    covers: ['#6b5a2a', '#2f5f8a', '#8b9aab', '#5d6b7a', '#c8c2b0', '#8b9aab', '#7a2a2a', '#a9b2bc'],
    parts: [
      { name: 'The Late Rooms', about: 'Overnight quarters for cooks and delivery workers once: a stubborn ceiling fan, windows on the eating court, faded names on the hooks by the door. Rooms and beds go in here.' },
      { name: 'The Wash Passage', about: 'Wet paving and drain grilles where the shared washing stations stood, up from the Supper Frontage. Outside: a raid from the front is fought here. Nobody leaves crates blocking it.' },
      { name: 'The Prep House', about: 'The stalls\' old shared preparation building: pale rectangles where the benches stood, a wall clock seven minutes fast. Room for more beds and a room or two.' },
      { name: 'The Delivery Court', about: 'The walled receiving yard behind, with the Cart Gate onto the market service lane, its lower panels dented by decades of handcarts. Outside: defences go here, and a raid can come through the gate.' },
      { name: 'The Rice Store', about: 'A dry store across the passage, emptied when the association changed suppliers. Sack weights still pencilled by the door, and an argument about a missing scoop.' },
    ],
    beds: [2, 4, 2], costs: [20000, 30000, 40000],
    line: {
      street: 'Stools scrape across the eating court as the stallholders pull people inside. Footsteps turn into the Wash Passage.',
      gate: 'The Cart Gate bangs against its frame. Figures push into the Delivery Court from the market service lane.',
    },
  }),
  // The Docks: the Stove Pier (owner's lore, 2026-11-07). A container office on an old working pier,
  // leased from the pier cooperative; the Ferryman makes the introduction.
  docks: compound({
    mirror: true,
    name: 'the Stove Pier',
    aria: 'Plan of the Stove Pier, our Docks hall: the Stove Office, the Working Deck beside it, the Relief Box across the deck, the Rope Court behind with the Jetty Gate onto the pier walkway, and the Net House across the way',
    top: { cls: 'sp-pier', label: 'PIER WALKWAY' }, bottom: { shapes: ROADWAY('sp-yard'), label: 'CONTAINER YARD' }, lit: 'THE STOVE PIER', sign: '#ff3d5f', gate: '#ff3d5f',
    // A strapped pallet stack, an insulated fish chest, a container door panel on a repair cradle, a
    // cable-reel stand, a mooring-equipment bin, a retired forklift, a ballast drum, an engine-parts crate.
    covers: ['#3a2d22', '#c8c2b0', CONTAINER_TONES[0], '#2f3442', '#4a5566', '#8a7440', '#5a1e24', CONTAINER_TONES[1]],
    parts: [
      { name: 'The Stove Office', about: 'A container office with a narrow stove, a scarred desk and beds behind a partition. Old dispatch numbers show through the paint when the walls sweat. Rooms and beds go in here.' },
      { name: 'The Working Deck', about: 'The open deck between the containers, up from the container yard; drain channels run to the pier edge. Outside: a raid from the front is fought here.' },
      { name: 'The Relief Box', about: 'A container fitted out for relief crews between shifts; the cooperative put bunks in after the Grid Blackout. Room for more beds and a room or two.' },
      { name: 'The Rope Court', about: 'The fenced pier end where mooring lines were sorted, with the Jetty Gate onto the pier walkway. Outside: defences go here, and a raid can come through the gate.' },
      { name: 'The Net House', about: 'A low net-mending store across the way: salt marks where the drying frames were, a roof patched in three materials.' },
    ],
    beds: [2, 4, 2], costs: [20000, 30000, 40000],
    line: {
      street: 'Boots strike the Working Deck from the container yard. A loose chain rings against the office wall.',
      gate: 'The Jetty Gate jolts sideways. People are pushing through from the pier walkway.',
    },
  }),
  // The Basin: the Unlisted Rooms (owner's lore, 2026-11-07). Service premises leased from a small
  // property trust; the flat "doesn't exist" as a dwelling on paper. Okonkwo arranges access.
  basin: compound({
    mirror: true,
    name: 'the Unlisted Rooms',
    aria: 'Plan of the Unlisted Rooms, our Basin hall: the Unlisted Flat over the tack workshop, the Buckle Passage beside it, the Saddler\'s Store across the passage, the Wash Yard behind with the Course Gate onto the course lane, and the Chaff House across the way',
    top: { cls: 'sp-alley', label: 'THE COURSE LANE' }, bottom: { shapes: ROADWAY(), label: 'WORKSHOP ROW' }, lit: 'THE UNLISTED ROOMS', sign: '#ff9a3d', gate: '#ff9a3d',
    // A compressed straw stack, a feed-storage bin, a steel saddle stand, a transport-crate stack, a
    // tack trunk, a retired horsebox trailer, an old water trough, a tip-seller's cart.
    covers: ['#6b5a2a', '#4a5566', '#8b9aab', '#3a2d22', SADDLE, '#2f3442', '#5d6b7a', '#7a2a2a'],
    parts: [
      { name: 'The Unlisted Flat', about: 'Rooms over the tack workshop, up its trapdoor, the windows on the Old Stand; leather dressing and wet coats below. Rooms and beds go in here.' },
      { name: 'The Buckle Passage', about: 'The passage between the buildings, up from Workshop Row, named for a brass buckle on an old repair-shop sign. Outside: a raid from the front is fought here.' },
      { name: 'The Saddler\'s Store', about: 'A stockroom with high shelves and chalk outlines where the saddle trees hung. Room for more beds and a room or two.' },
      { name: 'The Wash Yard', about: 'The walled yard where tack was washed, with the Course Gate onto the course lane. The old fittings stay; no horses. Outside: defences go here, and a raid can come through the gate.' },
      { name: 'The Chaff House', about: 'A small old feed store across the way, still called a loft by older workers though its room is at yard level.' },
    ],
    beds: [2, 4, 2], costs: [20000, 30000, 40000],
    line: {
      street: 'Footsteps come up the Buckle Passage from Workshop Row. Someone knocks the old repair sign against the wall.',
      gate: 'The Course Gate bangs open. Figures enter the Wash Yard from the service lane.',
    },
  }),
  // Glass Heights: the Underterrace (owner's lore, 2026-11-07). An old maintenance compound in the
  // ridge under the corporate terraces, its court open to the sky; a maintenance cooperative holds
  // the occupancy, and Forewoman Tse makes the introduction. The sealed inspection tunnel is scenery.
  heights: compound({
    name: 'the Underterrace',
    aria: 'Plan of the Underterrace, our Glass Heights hall: the Night Rooms, the Rain Passage beside them, the Stores across the passage, the Sunken Court behind with the Delivery Gate onto the service road, and the Survey Room across the way',
    top: { cls: 'sp-alley', label: 'SERVICE ROAD' }, bottom: { shapes: ROADWAY('sp-yard'), label: 'LOWER APPROACH' }, lit: 'THE UNDERTERRACE', sign: '#3de8d8', gate: '#5d6b7a',
    // A paving-slab pallet, an inspection-equipment chest, a barrier-panel rack, a drain-cover stack, a
    // retired pump casing, a cable-reel cradle, a maintenance trolley, a weatherproof storage cabinet.
    covers: ['#8b8578', '#3a4352', '#a8892a', '#2f3442', '#4a5566', '#3a2d22', '#5d6b7a', '#3a4a3a'],
    parts: [
      { name: 'The Night Rooms', about: 'Rest rooms for maintenance workers on overnight call: duty hooks, a faded storm checklist, a patch where a time clock was. Rooms and beds go in here.' },
      { name: 'The Rain Passage', about: 'The service approach between the buildings, down from the maintenance steps, drainage channels under removable grilles. Outside: a raid from the front is fought here. It stays clear for inspection.' },
      { name: 'The Stores', about: 'A former equipment store: work clothes, fittings and tools once signed out against numbered brass tags. Room for more beds and a room or two.' },
      { name: 'The Sunken Court', about: 'A walled receiving yard open to the sky, with the Delivery Gate onto the service road. Outside: defences go here, and a raid can come through the gate.' },
      { name: 'The Survey Room', about: 'A small inspection office across the way; pencil height marks still by the door.' },
    ],
    beds: [2, 4, 2], costs: [25000, 35000, 45000],
    line: {
      street: 'Footsteps descend the maintenance steps. Figures turn into the Rain Passage beneath the terrace lights.',
      gate: 'The Delivery Gate strikes the retaining wall. People are coming in from the service road.',
    },
  }),
};

/** Districts drawn as parts, by key. */
export const PLOTS = { docks: DOCKS, oldTown: OLD_TOWN };

/** A choice of parts as a site, the same shape as a plain site. */
export function assemble(plot, approach, cover, target) {
  const rev = (path) => [...path].reverse();
  return {
    name: plot.name,
    look: plot.look, light: plot.light, paving: plot.paving, texture: plot.texture, glow: plot.glow,
    aria: `${plot.aria}: ${approach.aria}, ${cover.aria}, ${target.aria}`,
    parts: { approach: approach.id, cover: cover.id, target: target.id },
    points: { van: approach.van, perch: plot.perch, target: target.point },
    paths: {
      in: approach.in, inside: approach.inside, target: target.path,
      out: [...rev(target.path), ...rev(approach.inside).slice(1), ...rev(approach.in).slice(1)],
    },
    views: { ...approach.views, target: target.view },
    posts: { ...approach.posts, target: target.post },
    sight: { rifle: target.rifle, drone: plot.drone },
    shapes: [...plot.shapes, ...cover.shapes, ...approach.shapes, ...target.shapes],
    labels: [...approach.labels, ...cover.labels, ...target.labels, ...plot.labels],
  };
}

/** The targets a job can get in a plot: its own if it has one, else the district's usual ones. */
export const targetsFor = (plot, templateId) => {
  const own = plot.targets.filter((t) => t.jobs?.includes(templateId));
  return own.length ? own : plot.targets.filter((t) => !t.jobs);
};

const usual = (plot) => assemble(plot, plot.approaches[0], plot.covers[0], targetsFor(plot, null)[0]);

/** Site plans by district key (data/districts.js); `generic` for anywhere without one. A district
 * drawn as parts is here as its first approach, cover and usual target. */
export const SITES = { generic: GENERIC, docks: usual(DOCKS), oldTown: usual(OLD_TOWN), nightMarket: NIGHT_MARKET, heights: HEIGHTS, basin: BASIN };

/** Every site there can be, for the tests and the preview: [{ key, variant, site }], every combination of parts. */
export const allSites = () => Object.entries(SITES).flatMap(([key, base]) => {
  const plot = PLOTS[key];
  if (!plot) return [{ key, variant: 'base', site: base }];
  return plot.approaches.flatMap((a) => plot.covers.flatMap((c) => plot.targets.map((t) => ({ key, variant: `${a.id}+${c.id}+${t.id}`, site: assemble(plot, a, c, t) }))));
});

const hash = (str) => { let h = 2166136261; for (const ch of String(str)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0; return h; };

/**
 * The site for a job: in a district drawn as parts, an approach, a cover and a target picked from
 * the job's id (the job's own target if it has one), so the same job always shows the same place
 * and two offers of the same work can differ. Nothing is stored: the id is the seed. Anywhere else,
 * the district's site or the generic one.
 */
export function pickSite(district, jobId = '', templateId = null, build = null) {
  if (String(templateId).startsWith('raid:')) { // a raid is fought in the hall itself, with what's built there (data/hallBuild.js)
    const hall = HALLS[String(templateId).slice(5)] ?? HALL;
    if (!build?.length) return hall;
    // A compound's parts held (their walls and gate) and the way the raid came in (core/hallbuild.js floorPieces).
    const way = build.find((b) => b.piece === 'way');
    const parts = build.filter((b) => b.piece === 'part').flatMap((b) => hall.parts?.find((x) => x.id === b.id)?.shapes ?? []);
    return { ...hall, ...(way && hall.ways?.[way.id]), shapes: [...hall.shapes, ...parts, ...buildShapes(build)] };
  }
  const plot = PLOTS[district];
  if (!plot) return SITES[district] ?? SITES.generic;
  const pick = (list, salt) => list[hash(`${jobId}:${salt}`) % list.length];
  return assemble(plot, pick(plot.approaches, 'a'), pick(plot.covers, 'c'), pick(targetsFor(plot, templateId), 't'));
}
