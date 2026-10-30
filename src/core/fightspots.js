// Fight spots (command fights, step 2, 2026-10-30): where everyone stands in a fight, read off the
// site map (data/sites.js), so the cover drawn on the map is the cover in the fight. Pure geometry
// on the site's shapes: the crew gathers where the zone ends, the guards come from their post, and
// each piece of cover between gives a spot on its far side from the other lot (full behind a
// container, half behind a crate or a desk). Where there isn't enough cover, the rest stand in the
// open. The same site and zone always give the same spots.
//
// Spots: { crew: [spot], guards: [spot], anchors: { crew, guards } }, spot { at: [x, y], cover: 'open' | 'half' | 'full' }.
// The crew's come best first (full cover, then half, then open; nearest first within each): they
// take the best cover going as the fight starts. The guards' come nearest their post first: they
// were caught where they stood, one of them on the post itself, in the open.

const MAP = { x0: 6, y0: 6, x1: 354, y1: 232 }; // where anyone can stand (the road too)
const COVER = new Set(['sp-cover', 'sp-desk']);
const BLOCK = new Set(['sp-cover', 'sp-desk', 'sp-water', 'sp-jetty']);
const FULL_AT = 24; // a piece of cover this long or longer (a container) is full cover; smaller is half
const GAP = 6; // how far behind the cover a spot is
const APART = 16; // spots at least this far apart
const SIDE = 8; // two behind a container stand this far either side of its middle
const REACH = 72; // cover this far from a side's anchor counts
const RANK = { full: 0, half: 1, open: 2 };
const MIN_SPLIT = 60; // the guards stand at least this far from the crew

/** Every rect on the site, rows expanded: [{ cls, x, y, w, h }]. */
export function siteRects(site) {
  const out = [];
  for (const s of site.shapes ?? []) {
    if (s.t === 'rect') out.push({ cls: s.cls, x: s.x, y: s.y, w: s.w, h: s.h });
    if (s.t === 'row') {
      for (let i = 0; i < s.n; i++) {
        if (s.skip?.includes(i)) continue;
        out.push({ cls: s.cls, x: s.axis === 'y' ? s.x : s.x + i * s.step, y: s.axis === 'y' ? s.y + i * s.step : s.y, w: s.w, h: s.h });
      }
    }
  }
  return out;
}

const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1];
const len = (a) => Math.hypot(a[0], a[1]);
const round = (p) => [Math.round(p[0]), Math.round(p[1])];
const centre = (r) => [r.x + r.w / 2, r.y + r.h / 2];

/** Where the crew is when a fight starts in this zone: the zone's end (for the target, just outside it). */
export function crewAnchor(site, zone) {
  const p = site.paths;
  if (zone === 'in') return p.in.at(-1);
  if (zone === 'target') return p.target.at(-2) ?? p.target.at(-1);
  return p.inside.at(-1);
}

/**
 * The spots for a fight in this zone of this site, or null if the site can't give any (no post for
 * the zone). need: how many spots each side wants at least ({ crew, guards }); open ground fills
 * what cover can't.
 */
export function fightSpots(site, zone, need = { crew: 6, guards: 4 }) {
  const post = site.posts?.[zone];
  let C = crewAnchor(site, zone);
  if (!C || !post) return null;
  let d = sub(post, C);
  const dist0 = len(d) || 1;
  d = [d[0] / dist0, d[1] / dist0];
  // The guards hold their post; if the crew is right on top of it, the fight starts with the crew
  // backed off to MIN_SPLIT (kept on the map).
  const dist = Math.max(dist0, MIN_SPLIT);
  const E = post;
  C = round([post[0] - d[0] * dist, post[1] - d[1] * dist]).map((v, i) => Math.max(i ? MAP.y0 + 10 : MAP.x0 + 10, Math.min(i ? MAP.y1 - 4 : MAP.x1 - 10, v)));
  const rects = siteRects(site);
  const blocks = rects.filter((r) => BLOCK.has(r.cls));
  const taken = [];
  const free = (p) => p[0] >= MAP.x0 && p[0] <= MAP.x1 && p[1] >= MAP.y0 && p[1] <= MAP.y1
    && !blocks.some((r) => p[0] > r.x - 4 && p[0] < r.x + r.w + 4 && p[1] > r.y - 4 && p[1] < r.y + r.h + 4)
    && taken.every((q) => len(sub(p, q)) >= APART);

  // A side's spots: behind each piece of cover near its anchor (towards its own side of the fight),
  // nearest first, then open ground around the anchor until there are enough.
  // Which side of the middle line a point is on: the crew's half, or the guards'.
  const along = (p) => dot(sub(p, C), d);
  const ours = (p) => along(p) <= dist / 2 - 8;
  const theirs = (p) => along(p) >= dist / 2 + 8;

  // A side's spots: behind each piece of cover near its anchor, on the far side from the other
  // lot's anchor and in its own half; the best cover first, then open ground round the anchor.
  function side(anchor, foe, n, mine, best) {
    const spots = [];
    // The guards: whoever is on the post stands on it, in the open.
    if (!best && free(anchor) && mine(anchor)) { spots.push({ at: anchor, cover: 'open' }); taken.push(anchor); }
    const cands = rects.filter((r) => COVER.has(r.cls)).flatMap((r) => {
      const c = centre(r);
      const v = sub(c, foe);
      const away = [v[0] / (len(v) || 1), v[1] / (len(v) || 1)];
      // How far from the centre to the edge along the line of fire.
      const t = Math.min(Math.abs(away[0]) > 0.01 ? r.w / 2 / Math.abs(away[0]) : Infinity, Math.abs(away[1]) > 0.01 ? r.h / 2 / Math.abs(away[1]) : Infinity);
      const at = [c[0] + away[0] * (t + GAP), c[1] + away[1] * (t + GAP)];
      // A container hides two, side by side; a crate or a desk one.
      const full = Math.max(r.w, r.h) >= FULL_AT;
      const across = [-away[1] * SIDE, away[0] * SIDE];
      return (full ? [[at[0] + across[0], at[1] + across[1]], [at[0] - across[0], at[1] - across[1]]] : [at])
        .map((p) => ({ at: round(p), cover: full ? 'full' : 'half', off: len(sub(p, anchor)) }));
    }).filter((x) => x.off <= REACH && mine(x.at)).sort((x, y) => x.off - y.off);
    for (const x of cands) {
      if (spots.length >= n + 2) break;
      if (free(x.at)) { spots.push({ at: x.at, cover: x.cover }); taken.push(x.at); }
    }
    if (best) spots.sort((x, y) => RANK[x.cover] - RANK[y.cover]);
    // Open ground: a fan round the anchor, across the line of fire first, then back from it.
    const f = sub(anchor, foe);
    const away = [f[0] / (len(f) || 1), f[1] / (len(f) || 1)];
    const across = [-away[1], away[0]];
    for (const ring of [0, 1, 2, -1, 3, 4]) {
      if (spots.length >= n) break;
      for (const k of [0, 1, -1, 2, -2, 3, -3]) {
        if (spots.length >= n) break;
        const p = round([anchor[0] + across[0] * k * 15 + away[0] * ring * 14, anchor[1] + across[1] * k * 15 + away[1] * ring * 14]);
        if (free(p) && mine(p)) { spots.push({ at: p, cover: 'open' }); taken.push(p); }
      }
    }
    return spots;
  }

  const crew = side(C, E, need.crew, ours, true);
  const guards = side(E, C, need.guards, theirs, false);
  return { crew, guards, anchors: { crew: C, guards: E } };
}
