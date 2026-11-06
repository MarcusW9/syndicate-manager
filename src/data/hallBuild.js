// Building up a hall (drafts/PROPOSAL-hall-building.md; DESIGN.md 2026-11-06): pieces placed on a grid
// over the hall's own map (data/sites.js HALLS). Content only: what each piece costs, how much floor
// it takes, and how it's drawn (shapes on the site, so a raid's fight uses them as cover). The rules
// are in core/hallbuild.js. Numbers are first guesses for the playtest.

export const HALL_BUILD = {
  cell: 30, cols: 12, rows: 8, // a 12 × 8 grid of 30-unit cells over the 360 × 240 plan
  floorBase: 6, floorPerLevel: 4, // cells a hall can build on: 6 at level 1, +4 for each Expand
  refund: 0.5, // removing a piece gives back this share of its cost
  keepClear: 18, // no cell this near the way in, the way out, or where either side starts
  perThreat: 3, // every this many defence pieces lower a raid's threat by 1, never below 1 (owner, 2026-11-06)
};

/** What the rooms do (slice 2a): for the people who live in that hall. */
export const ROOM_EFFECT = {
  clinicHeal: 2, // injury days healed a day at home with a clinic (1 without)
  canteenRest: 12, // fatigue shed a day at home with a canteen (8 without, core/time.js)
  bunkBeds: 2, // beds a bunk room adds
  stashKeeps: 0.5, // walking out loses this share of what was kept there
  lookoutWarn: 4, // a raid is warned this many days ahead (3 without, data/raids.js)
  denJobs: 10, // a den counts as this many more jobs together for loyalty (core/loyalty.js): a raise about 10% smaller, still capped
  docShare: 0.75, // with a cyber doc in the tong, implants cost this share (core/gear.js)
};

/** The auto turret (slice 3, owner 2026-11-06: no crew, can't be knocked out): it fires each round of a raid on its own. */
export const TURRET = { aim: 8, damage: 5, shots: 6 };

const plate = '#5d6b7a';

/**
 * The pieces. size: [w, h] in cells as placed unturned; turns: whether it can be turned 90°.
 * shapes(x, y, rot): site shapes in plan units, (x, y) the top-left of its cells, rot 0 or 1.
 */
export const PIECES = {
  barricade: {
    name: 'Barricade', kind: 'defence', cost: 2000, size: [1, 1], turns: false, what: 'half cover',
    about: 'Crates and a table on its side. Half cover in a raid.',
    shapes: (x, y) => [{ t: 'rect', cls: 'sp-cover', x: x + 8, y: y + 10, w: 14, h: 10, fill: '#6b5a2a' }],
  },
  plate: {
    name: 'Steel plate', kind: 'defence', cost: 4000, size: [1, 1], turns: true, what: 'full cover',
    about: 'A steel plate on legs. Full cover in a raid: two of ours can stand behind it.',
    shapes: (x, y, rot) => [rot ? { t: 'rect', cls: 'sp-cover', x: x + 12, y: y + 2, w: 6, h: 26, fill: plate } : { t: 'rect', cls: 'sp-cover', x: x + 2, y: y + 12, w: 26, h: 6, fill: plate }],
  },
  wall: {
    name: 'Inner wall', kind: 'defence', cost: 3000, size: [1, 1], turns: true, what: 'solid',
    about: 'A wall section. Nobody stands in it in a raid.',
    shapes: (x, y, rot) => [rot ? { t: 'rect', cls: 'sp-block', x: x + 13, y, w: 4, h: 30 } : { t: 'rect', cls: 'sp-block', x, y: y + 13, w: 30, h: 4 }],
  },
};

// Rooms (slice 2a): a room of the hall's own, its walls drawn on the plan with a door, its fittings
// inside. Fittings are 'sp-fit' (no fight cover), so a raid is fought the same with or without it.
// w, h in plan units; the room is drawn at (x, y), turned rooms already swapped.
const room = (x, y, w, h, fit) => [
  { t: 'rect', cls: 'sp-hallroom', x: x + 2, y: y + 2, w: w - 4, h: h - 4 },
  { t: 'rect', cls: 'sp-door', x: x + 2, y: y + h / 2 - 6, w: 3, h: 12 },
  ...fit(x + 2, y + 2, w - 4, h - 4),
];
const fit = (x, y, w, h, fill) => ({ t: 'rect', cls: 'sp-fit', x, y, w, h, fill });
/** A room's size in plan units at its turn: [w, h]. */
const span = (size, rot) => (rot ? [size[1] * 30, size[0] * 30] : [size[0] * 30, size[1] * 30]);

Object.assign(PIECES, {
  clinic: {
    name: 'Clinic', kind: 'room', cost: 18000, size: [2, 2], turns: false, needs: 2, one: true, what: 'heals ×2',
    about: 'Two beds, a drug cabinet and a lamp. Injuries heal twice as fast for whoever lives here, while they\'re home.',
    shapes: (x, y) => room(x, y, 60, 60, (rx, ry, w, h) => [fit(rx + 6, ry + 6, 22, 8, '#8b9aab'), fit(rx + 6, ry + h - 14, 22, 8, '#8b9aab'), fit(rx + w - 12, ry + 6, 8, 16, '#d8e2ea'), fit(rx + w - 17, ry + h - 22, 12, 3, '#3de8d8'), fit(rx + w - 12.5, ry + h - 26.5, 3, 12, '#3de8d8')]),
  },
  bunks: {
    name: 'Bunk room', kind: 'room', cost: 15000, size: [3, 2], turns: true, needs: 2, one: true, what: '+2 beds',
    about: 'Bunks two high along the wall. Two more beds in this hall, with no more rent.',
    shapes: (x, y, rot) => { const [w, h] = span([3, 2], rot); return room(x, y, w, h, (rx, ry, iw, ih) => (iw > ih ? [0, 1, 2].map((i) => fit(rx + 6 + i * (iw - 12) / 3, ry + 6, (iw - 12) / 3 - 4, ih - 12, '#4a5566')) : [0, 1, 2].map((i) => fit(rx + 6, ry + 6 + i * (ih - 12) / 3, iw - 12, (ih - 12) / 3 - 4, '#4a5566')))); },
  },
  canteen: {
    name: 'Canteen', kind: 'room', cost: 10000, size: [3, 2], turns: true, needs: 2, one: true, what: 'rest faster',
    about: 'A long table, a rice cooker that never goes off. Whoever lives here shakes off fatigue faster at home.',
    shapes: (x, y, rot) => { const [w, h] = span([3, 2], rot); return room(x, y, w, h, (rx, ry, iw, ih) => (iw > ih ? [fit(rx + 10, ry + ih / 2 - 5, iw - 20, 10, '#6b5a2a'), fit(rx + iw - 14, ry + 4, 10, 8, '#f2d541')] : [fit(rx + iw / 2 - 5, ry + 10, 10, ih - 20, '#6b5a2a'), fit(rx + 4, ry + ih - 14, 8, 10, '#f2d541')])); },
  },
  stash: {
    name: 'Stash', kind: 'room', cost: 10000, size: [2, 2], turns: false, one: true, what: 'walk out: lose half',
    about: 'A safe bolted to the floor under a false board. Walk out of a raid and we lose half as much.',
    shapes: (x, y) => room(x, y, 60, 60, (rx, ry, w, h) => [fit(rx + w / 2 - 11, ry + h / 2 - 11, 22, 22, '#5d6b7a'), fit(rx + w / 2 - 3, ry + h / 2 - 3, 6, 6, '#f2d541')]),
  },
  lookout: {
    name: 'Lookout', kind: 'room', cost: 12000, size: [2, 2], turns: false, one: true, what: 'warned 4 days',
    about: 'A stool at a window that sees the street both ways. We hear of a raid on this hall a day sooner.',
    shapes: (x, y) => room(x, y, 60, 60, (rx, ry, w) => [fit(rx + 4, ry + 2, w - 8, 4, '#3de8d8'), fit(rx + w / 2 - 5, ry + 14, 10, 10, '#6b5a2a')]),
  },
  den: {
    name: 'Den', kind: 'room', cost: 14000, size: [3, 2], turns: true, needs: 2, one: true, what: 'loyalty',
    about: 'A mahjong table and a karaoke screen. Whoever lives here sticks with us: they ask a little less when they want a new deal.',
    shapes: (x, y, rot) => { const [w, h] = span([3, 2], rot); return room(x, y, w, h, (rx, ry, iw, ih) => [fit(rx + iw / 2 - 9, ry + ih / 2 - 9, 18, 18, '#2a5a3a'), fit(rx + 4, ry + 4, iw > ih ? 20 : 4, iw > ih ? 4 : 20, '#ff5fae')]); },
  },
  cyberdoc: {
    name: 'Cyber doc', kind: 'room', cost: 25000, size: [2, 2], turns: false, needs: 3, one: true, tongOne: true, what: 'implants −25%',
    about: 'A chair, a lamp and a doc who doesn\'t ask. While the tong has one, implants cost a quarter less. One in the whole tong.',
    shapes: (x, y) => room(x, y, 60, 60, (rx, ry, w, h) => [fit(rx + w / 2 - 8, ry + h / 2 - 12, 16, 24, '#4a5566'), fit(rx + w / 2 - 3, ry + 6, 6, 6, '#b48cff'), fit(rx + w - 12, ry + h - 14, 8, 10, '#b48cff')]),
  },
});

PIECES.turret = {
  name: 'Auto turret', kind: 'defence', cost: 12000, size: [1, 1], turns: false, needs: 2, one: true, what: 'fires on its own',
  about: `A gun on a post with a motion sensor. In a raid it fires at the nearest raider every round, ${TURRET.shots} bursts a fight, with nobody on it. It counts as a defence piece.`,
  shapes: (x, y) => [
    { t: 'rect', cls: 'sp-turret', x: x + 12, y: y + 12, w: 6, h: 6, fill: '#8b9aab' },
    { t: 'rect', cls: 'sp-turret', x: x + 17, y: y + 14, w: 9, h: 2, fill: '#ff3d5f' },
  ],
};

/** The site shapes for a hall's pieces: [{ piece, x, y, rot }], x and y in cells. */
export function buildShapes(build = []) {
  const c = HALL_BUILD.cell;
  return build.flatMap((b) => PIECES[b.piece]?.shapes(b.x * c, b.y * c, b.rot ?? 0) ?? []);
}
