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

/** The site shapes for a hall's pieces: [{ piece, x, y, rot }], x and y in cells. */
export function buildShapes(build = []) {
  const c = HALL_BUILD.cell;
  return build.flatMap((b) => PIECES[b.piece]?.shapes(b.x * c, b.y * c, b.rot ?? 0) ?? []);
}
