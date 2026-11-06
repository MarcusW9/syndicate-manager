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
    // The track stops short of the stable rows (owner, 2026-11-06: its edge ran over the first row's corner).
    { t: 'ellipse', cls: 'sp-infield', cx: 84, cy: 92, rx: 92, ry: 62 },
    { t: 'ellipse', cls: 'sp-track', cx: 84, cy: 92, rx: 92, ry: 62 },
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
    { x: 262, y: 34, text: 'VET BLOCK', hi: true }, { x: 214, y: 20, text: 'FLOODLIGHT' }, { x: 46, y: 96, text: 'LANTERN COURSE' },
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
const hallSite = (name, aria, { exit, anchor, entry, perch = [340, 18] }) => ({
  name, aria,
  points: { van: exit, perch, target: anchor },
  paths: { in: [exit, [(exit[0] + anchor[0]) / 2, (exit[1] + anchor[1]) / 2]], inside: [[(exit[0] + anchor[0]) / 2, (exit[1] + anchor[1]) / 2], anchor], target: [anchor, anchor], out: [anchor, exit] },
  views: { in: [0, 0, 360, 240], inside: [0, 0, 360, 240], target: [0, 0, 360, 240] },
  posts: { in: entry, inside: entry, target: entry },
  sight: { rifle: [perch, [perch[0] - 6, perch[1] + 4], [perch[0] + 6, perch[1] + 4]], drone: [perch, [4, 236], [356, 236], [356, 4], [4, 4]] },
});
const SILK = ['#b48cff', '#ff5fae', '#f2d541', '#3de8d8'];
const SADDLE = '#4a3424';

export const HALLS = {
  // Old Town: the damp room above a noodle shop. Up the front stairs from the street; out by the
  // rusted fire stair on the back wall.
  oldTown: {
    ...hallSite('the room above the noodle shop', 'Plan of our Old Town hall: the room above the noodle shop, the front stairs up from the street, bunks, the mahjong table, the altar, the stove, the fire stair out the back',
      { exit: [334, 40], anchor: [272, 72], entry: [44, 168] }),
    shapes: [
      ...ROAD,
      { t: 'rect', cls: 'sp-sign', x: 70, y: 206, w: 44, h: 5, fill: '#ff3d5f' },
      { t: 'rect', cls: 'sp-building', x: 16, y: 14, w: 300, h: 188 },
      { t: 'rect', cls: 'sp-door', x: 30, y: 199, w: 16, h: 4 },
      { t: 'row', cls: 'sp-step', x: 26, y: 150, w: 26, h: 1.5, step: 6, n: 8, axis: 'y' },
      { t: 'rect', cls: 'sp-door', x: 313, y: 48, w: 4, h: 16 },
      { t: 'row', cls: 'sp-step', x: 322, y: 30, w: 22, h: 1.5, step: 6, n: 14, axis: 'y' },
      { t: 'line', cls: 'sp-wall', x1: 16, y1: 100, x2: 140, y2: 100 },
      { t: 'row', cls: 'sp-cot', x: 70, y: 26, w: 22, h: 8, step: 30, n: 5 },
      { t: 'row', cls: 'sp-cot', x: 70, y: 52, w: 22, h: 8, step: 30, n: 3 },
      { t: 'rect', cls: 'sp-desk', x: 160, y: 120, w: 26, h: 18 }, // the mahjong table
      { t: 'rect', cls: 'sp-cover', x: 234, y: 118, w: 14, h: 10, fill: '#5a1e24' }, // the altar
      { t: 'rect', cls: 'sp-cover', x: 236, y: 86, w: 14, h: 12, fill: CONTAINER_TONES[3] }, // crates of bitter herbs
      { t: 'rect', cls: 'sp-cover', x: 290, y: 96, w: 12, h: 12, fill: CONTAINER_TONES[1] },
      { t: 'rect', cls: 'sp-desk', x: 74, y: 124, w: 34, h: 10 }, // the stove and its counter
      { t: 'rect', cls: 'sp-cover', x: 70, y: 152, w: 12, h: 12, fill: CONTAINER_TONES[2] }, // noodle crates at the top of the stairs
      { t: 'rect', cls: 'sp-cover', x: 92, y: 176, w: 14, h: 8, fill: CONTAINER_TONES[0] }, // shoes and umbrellas
      { t: 'rect', cls: 'sp-cover', x: 236, y: 58, w: 26, h: 6, fill: '#7a2a2a' }, // a lacquer screen by the back door
    ],
    labels: [{ x: 70, y: 222, text: 'NOODLE SHOP' }, { x: 150, y: 32, text: 'BUNKS' }, { x: 196, y: 90, text: 'OUR HALL', hi: true }, { x: 280, y: 12, text: 'FIRE STAIR' }, { x: 22, y: 146, text: 'STAIRS' }],
  },
  // The Night Market: two rooms above Madam Rao's sari shop. Up the shop's back stair; out through
  // the roof hatch.
  nightMarket: {
    ...hallSite('two rooms above her sari shop', 'Plan of our Night Market hall: two rooms above the sari shop, bolts of silk on racks, the cutting table, two beds, the stair up from the shop, the roof hatch',
      { exit: [312, 26], anchor: [262, 92], entry: [58, 164] }),
    shapes: [
      ...ROAD,
      { t: 'rect', cls: 'sp-sign', x: 40, y: 206, w: 60, h: 5, fill: '#ff5fae' },
      { t: 'rect', cls: 'sp-building', x: 30, y: 20, w: 300, h: 182 },
      { t: 'line', cls: 'sp-wall', x1: 180, y1: 20, x2: 180, y2: 86 },
      { t: 'line', cls: 'sp-wall', x1: 180, y1: 132, x2: 180, y2: 202 },
      { t: 'row', cls: 'sp-step', x: 42, y: 150, w: 24, h: 1.5, step: 6, n: 8, axis: 'y' },
      { t: 'row', cls: 'sp-step', x: 300, y: 32, w: 22, h: 1.5, step: 5, n: 6, axis: 'y' }, // the ladder to the hatch
      { t: 'rect', cls: 'sp-door', x: 304, y: 20, w: 16, h: 4 },
      { t: 'row', cls: 'sp-cover', x: 70, y: 40, w: 26, h: 8, step: 34, n: 3, tones: SILK }, // bolts of silk on racks
      { t: 'row', cls: 'sp-cover', x: 70, y: 66, w: 26, h: 8, step: 34, n: 3, tones: SILK, shift: 1 },
      { t: 'rect', cls: 'sp-desk', x: 98, y: 110, w: 36, h: 12 }, // the cutting table
      { t: 'rect', cls: 'sp-cover', x: 84, y: 146, w: 26, h: 8, fill: SILK[1] },
      { t: 'rect', cls: 'sp-cover', x: 118, y: 168, w: 14, h: 10, fill: CONTAINER_TONES[3] }, // a basket of offcuts
      { t: 'row', cls: 'sp-cot', x: 214, y: 34, w: 24, h: 8, step: 34, n: 2 },
      { t: 'rect', cls: 'sp-cover', x: 228, y: 104, w: 14, h: 10, fill: CONTAINER_TONES[1] }, // a camphor chest
      { t: 'rect', cls: 'sp-cover', x: 278, y: 112, w: 12, h: 12, fill: SILK[0] },
      { t: 'rect', cls: 'sp-desk', x: 286, y: 160, w: 34, h: 8 }, // a hot plate and a kettle
    ],
    labels: [{ x: 40, y: 222, text: 'SILK & CREDIT' }, { x: 70, y: 34, text: 'THE SILK ROOM' }, { x: 196, y: 128, text: 'OUR ROOMS', hi: true }, { x: 256, y: 16, text: 'ROOF HATCH' }, { x: 70, y: 144, text: 'SHOP STAIR' }],
  },
  // The Docks: a container office on the old pier, with a stove. Along the pier from the yard,
  // between the stacks; out down the ladder to a boat.
  docks: {
    ...hallSite('a container office on the old pier', 'Plan of our Docks hall: a container office at the end of the old pier, the stove, a desk and two cots, containers and bollards on the pier, the ladder down to a boat',
      { exit: [338, 202], anchor: [292, 132], entry: [62, 130] }),
    shapes: [
      { t: 'rect', cls: 'sp-water', x: 0, y: 0, w: 360, h: 90 },
      { t: 'rect', cls: 'sp-water', x: 0, y: 180, w: 360, h: 60 },
      { t: 'rect', cls: 'sp-yard', x: 0, y: 90, w: 40, h: 90 },
      { t: 'rect', cls: 'sp-pier', x: 40, y: 90, w: 320, h: 90 }, // the pier's deck: walkable, unlike the job maps' jetties
      { t: 'row', cls: 'sp-step', x: 330, y: 180, w: 14, h: 1.5, step: 5, n: 3, axis: 'y' }, // the ladder down
      { t: 'ellipse', cls: 'sp-cover', cx: 338, cy: 210, rx: 18, ry: 6, fill: '#3a2d22' }, // the boat
      { t: 'rect', cls: 'sp-building', x: 232, y: 98, w: 98, h: 66 },
      { t: 'rect', cls: 'sp-door', x: 229, y: 120, w: 4, h: 18 },
      { t: 'rect', cls: 'sp-desk', x: 300, y: 104, w: 18, h: 10 }, // the stove
      { t: 'rect', cls: 'sp-desk', x: 250, y: 144, w: 30, h: 10 },
      { t: 'rect', cls: 'sp-cot', x: 298, y: 148, w: 24, h: 8 },
      { t: 'rect', cls: 'sp-cover', x: 248, y: 108, w: 14, h: 10, fill: CONTAINER_TONES[3] },
      { t: 'rect', cls: 'sp-cover', x: 150, y: 98, w: 27, h: 14, fill: CONTAINER_TONES[0] }, // containers on the pier
      { t: 'rect', cls: 'sp-cover', x: 150, y: 150, w: 27, h: 14, fill: CONTAINER_TONES[2] },
      { t: 'rect', cls: 'sp-cover', x: 198, y: 104, w: 7, h: 7, fill: '#2f3442' }, // bollards
      { t: 'rect', cls: 'sp-cover', x: 198, y: 152, w: 7, h: 7, fill: '#2f3442' },
      { t: 'rect', cls: 'sp-cover', x: 98, y: 138, w: 14, h: 12, fill: CONTAINER_TONES[1] }, // crates by the yard gate
      { t: 'rect', cls: 'sp-cover', x: 90, y: 100, w: 12, h: 10, fill: CONTAINER_TONES[3] },
      { t: 'rect', cls: 'sp-cover', x: 92, y: 120, w: 26, h: 8, fill: '#3a2d22' }, // a stack of pallets
    ],
    labels: [{ x: 6, y: 86, text: 'THE YARD' }, { x: 120, y: 192, text: 'THE OLD PIER' }, { x: 240, y: 92, text: 'OUR OFFICE', hi: true }, { x: 300, y: 226, text: 'BOAT' }],
  },
  // The Basin: a flat over a tack workshop, the Old Stand outside the window. Up through the
  // workshop's trapdoor; out by the stair to the stable yard.
  basin: {
    ...hallSite('a flat over a tack workshop', 'Plan of our Basin hall: the flat over the tack workshop, saddle racks, the workbench, two cots, the trapdoor up from the workshop, the stair down to the stable yard, the Old Stand through the window',
      { exit: [12, 118], anchor: [62, 104], entry: [184, 178] }),
    shapes: [
      { t: 'rect', cls: 'sp-block', x: 60, y: 2, w: 240, h: 20 }, // the Old Stand across the way
      { t: 'row', cls: 'sp-window', x: 70, y: 8, w: 6, h: 4, step: 14, n: 16, tones: ['#ff9a3d', '#2a303b', '#ff9a3d', '#f2d541'] },
      { t: 'rect', cls: 'sp-building', x: 20, y: 34, w: 320, h: 170 },
      { t: 'row', cls: 'sp-window', x: 120, y: 33, w: 18, h: 2, step: 40, n: 4, tones: ['#ff9a3d'] },
      { t: 'rect', cls: 'sp-door', x: 17, y: 108, w: 4, h: 18 },
      { t: 'row', cls: 'sp-step', x: 4, y: 128, w: 12, h: 1.5, step: 6, n: 10, axis: 'y' }, // the yard stair
      { t: 'rect', cls: 'sp-cover', x: 176, y: 182, w: 18, h: 14, fill: '#1a1410' }, // the trapdoor's hatch, thrown open
      { t: 'row', cls: 'sp-cot', x: 36, y: 46, w: 24, h: 8, step: 34, n: 2 },
      { t: 'rect', cls: 'sp-cover', x: 84, y: 82, w: 14, h: 10, fill: SADDLE }, // saddle racks
      { t: 'rect', cls: 'sp-cover', x: 50, y: 136, w: 14, h: 10, fill: '#3a2d22' }, // a tack trunk
      { t: 'rect', cls: 'sp-cover', x: 100, y: 120, w: 26, h: 8, fill: SADDLE },
      { t: 'rect', cls: 'sp-desk', x: 146, y: 150, w: 32, h: 10 }, // the workbench
      { t: 'rect', cls: 'sp-cover', x: 214, y: 160, w: 14, h: 10, fill: SADDLE },
      { t: 'rect', cls: 'sp-cover', x: 230, y: 130, w: 12, h: 10, fill: '#6b5a2a' }, // hay bales
      { t: 'rect', cls: 'sp-cover', x: 132, y: 178, w: 12, h: 10, fill: '#6b5a2a' },
      { t: 'rect', cls: 'sp-desk', x: 286, y: 60, w: 34, h: 9 }, // a kettle on a shelf
      { t: 'rect', cls: 'sp-cover', x: 196, y: 144, w: 24, h: 14, fill: '#3a2d22' }, // tack trunks, stacked
    ],
    labels: [{ x: 120, y: 30, text: 'THE OLD STAND' }, { x: 60, y: 76, text: 'OUR FLAT', hi: true }, { x: 4, y: 232, text: 'YARD STAIR' }, { x: 200, y: 214, text: 'FROM THE WORKSHOP' }],
  },
  // Glass Heights: a service floor nobody upstairs remembers. Out of the service lift; away down
  // the maintenance stair.
  heights: {
    ...hallSite('a service floor nobody upstairs remembers', 'Plan of our Glass Heights hall: a forgotten service floor of server racks and air handlers, cots between the machines, the service lift, the maintenance stair',
      { exit: [30, 198], anchor: [74, 168], entry: [290, 110] }),
    shapes: [
      { t: 'rect', cls: 'sp-building', x: 10, y: 10, w: 340, h: 200 },
      { t: 'line', cls: 'sp-cable', x1: 10, y1: 30, x2: 350, y2: 30 },
      { t: 'line', cls: 'sp-cable', x1: 10, y1: 196, x2: 350, y2: 196 },
      { t: 'rect', cls: 'sp-room', x: 300, y: 88, w: 40, h: 44 }, // the service lift
      { t: 'rect', cls: 'sp-door', x: 297, y: 100, w: 4, h: 20 },
      { t: 'row', cls: 'sp-step', x: 18, y: 176, w: 24, h: 1.5, step: 5, n: 6, axis: 'y' }, // the maintenance stair
      { t: 'row', cls: 'sp-cover', x: 40, y: 50, w: 30, h: 8, step: 44, n: 6, tones: ['#18222c'] }, // server racks
      { t: 'row', cls: 'sp-cover', x: 40, y: 84, w: 30, h: 8, step: 44, n: 5, skip: [2], tones: ['#18222c'] },
      { t: 'rect', cls: 'sp-cover', x: 52, y: 132, w: 30, h: 8, fill: '#18222c' },
      { t: 'rect', cls: 'sp-cover', x: 96, y: 150, w: 30, h: 8, fill: '#18222c' },
      { t: 'rect', cls: 'sp-cover', x: 156, y: 120, w: 16, h: 16, fill: '#1d2a34' }, // air handlers
      { t: 'rect', cls: 'sp-cover', x: 244, y: 104, w: 14, h: 14, fill: '#1d2a34' },
      { t: 'rect', cls: 'sp-cover', x: 236, y: 140, w: 30, h: 8, fill: '#18222c' },
      { t: 'row', cls: 'sp-cot', x: 104, y: 178, w: 24, h: 8, step: 32, n: 2 },
    ],
    labels: [{ x: 300, y: 146, text: 'SERVICE LIFT' }, { x: 60, y: 122, text: 'OUR FLOOR', hi: true }, { x: 16, y: 224, text: 'MAINTENANCE STAIR' }, { x: 160, y: 24, text: 'PLANT ROOM' }],
  },
};

/** Districts drawn as parts, by key. */
export const PLOTS = { docks: DOCKS, oldTown: OLD_TOWN };

/** A choice of parts as a site, the same shape as a plain site. */
export function assemble(plot, approach, cover, target) {
  const rev = (path) => [...path].reverse();
  return {
    name: plot.name,
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
    return build?.length ? { ...hall, shapes: [...hall.shapes, ...buildShapes(build)] } : hall;
  }
  const plot = PLOTS[district];
  if (!plot) return SITES[district] ?? SITES.generic;
  const pick = (list, salt) => list[hash(`${jobId}:${salt}`) % list.length];
  return assemble(plot, pick(plot.approaches, 'a'), pick(plot.covers, 'c'), pick(targetsFor(plot, templateId), 't'));
}
