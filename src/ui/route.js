// The crew's route drawn on the grid (playtest, 2026-11-07, the owner picked style C from
// drafts/prototypes/path-styles.html): every leg runs across or up and down, the corners cut at 45°
// like the panels. The sites (data/sites.js) keep their hand-placed points; a diagonal leg between
// two of them becomes an L or a Z, whichever crosses the least of the place's buildings and
// furniture, so the line doesn't run over a building it used to pass. UI only: the crew walk the
// same points (ui/siteplan.js), and nothing in core sees them.

// What the route should go round, by how much it minds: buildings a lot, furniture a little.
const SOLID = { 'sp-building': 4, 'sp-block': 4, 'sp-house': 4, 'sp-tower': 4, 'sp-stable': 4, 'sp-cover': 1, 'sp-desk': 1, 'sp-stall': 1, 'sp-cot': 1, 'sp-crowd': 0.5, 'sp-planter': 1 };
const WALL = 30; // crossing a wall line, each time

/** The rects a route minds, with their weights, from a site's shapes (rows expanded). */
function obstacles(site) {
  const out = [];
  for (const s of site.shapes ?? []) {
    const w = SOLID[s.cls];
    if (w && s.t === 'rect') out.push({ x: s.x, y: s.y, w: s.w, h: s.h, k: w });
    else if (w && s.t === 'row') {
      for (let i = 0; i < s.n; i++) {
        if (s.skip?.includes(i)) continue;
        out.push({ x: s.axis === 'y' ? s.x : s.x + i * s.step, y: s.axis === 'y' ? s.y + i * s.step : s.y, w: s.w, h: s.h, k: w });
      }
    }
  }
  return out;
}
const walls = (site) => (site.shapes ?? []).filter((s) => s.cls === 'sp-wall' && s.t === 'line');

/** How much of an axis-aligned segment lies inside a rect (a 1px margin, so running along an edge is fine). */
function inside([ax, ay], [bx, by], r) {
  const x0 = r.x + 1; const x1 = r.x + r.w - 1; const y0 = r.y + 1; const y1 = r.y + r.h - 1;
  if (ay === by) { if (ay <= y0 || ay >= y1) return 0; return Math.max(0, Math.min(Math.max(ax, bx), x1) - Math.max(Math.min(ax, bx), x0)); }
  if (ax === bx) { if (ax <= x0 || ax >= x1) return 0; return Math.max(0, Math.min(Math.max(ay, by), y1) - Math.max(Math.min(ay, by), y0)); }
  return 0;
}
const crosses = (a, b, c, d) => {
  const o = (p, q, r) => Math.sign((q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]));
  return o(a, b, c) * o(a, b, d) < 0 && o(c, d, a) * o(c, d, b) < 0;
};

/** A run of points' cost: what it covers of the obstacles, and the walls it crosses. */
function cost(points, obs, ws) {
  let c = 0;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1]; const b = points[i];
    for (const r of obs) c += inside(a, b, r) * r.k;
    for (const w of ws) if (crosses(a, b, [w.x1, w.y1], [w.x2, w.y2])) c += WALL;
  }
  return c;
}

/** The ways across one diagonal leg: two Ls, then Zs turning a quarter, half and three quarters along. */
function candidates([ax, ay], [bx, by]) {
  const out = [{ pts: [[bx, ay]], first: 'h' }, { pts: [[ax, by]], first: 'v' }];
  for (const f of [0.5, 0.25, 0.75]) {
    const mx = Math.round(ax + (bx - ax) * f); const my = Math.round(ay + (by - ay) * f);
    out.push({ pts: [[mx, ay], [mx, by]], first: 'h' }, { pts: [[ax, my], [bx, my]], first: 'v' });
  }
  return out;
}

/** A chain of points with every diagonal leg turned onto the grid. Every original point is kept. */
export function gridChain(points, site) {
  if (!points?.length) return points;
  const obs = obstacles(site); const ws = walls(site);
  const out = [points[0]];
  let dir = null;
  for (let i = 1; i < points.length; i++) {
    const a = out.at(-1); const b = points[i];
    if (a[0] === b[0] || a[1] === b[1]) { out.push(b); if (a[0] !== b[0] || a[1] !== b[1]) dir = a[0] === b[0] ? 'v' : 'h'; continue; }
    // The cheapest; on a tie, the fewest turns, then carrying straight on the way we were going.
    const best = candidates(a, b)
      .map((c, n) => ({ ...c, n, cost: cost([a, ...c.pts, b], obs, ws) }))
      .sort((x, y) => x.cost - y.cost || x.pts.length - y.pts.length || (x.first === dir ? 0 : 1) - (y.first === dir ? 0 : 1) || x.n - y.n)[0];
    out.push(...best.pts, b);
    const last = best.pts.at(-1);
    dir = last[0] === b[0] ? 'v' : 'h';
  }
  return out;
}

const same = (a, b) => a.length === b.length && a.every((p, i) => p[0] === b[i][0] && p[1] === b[i][1]);

/**
 * The site with its paths on the grid. The way in, inside and to the target are turned as one chain
 * (so a zone's first leg carries on from the last), then split back at the zones' own points; the
 * way out the same, walked backwards, so a way out that retraces the way in gets the same line.
 */
const cache = new WeakMap();
export function gridSite(site) {
  if (!site?.paths) return site;
  if (cache.has(site)) return cache.get(site);
  const { in: pin, inside: pinside, target: ptarget, out: pout } = site.paths;
  const chain = gridChain([...pin, ...pinside.slice(1), ...ptarget.slice(1)], site);
  // Split at the zones' end points (each kept from the original, in order).
  const cut = (end, from) => { for (let i = from; i < chain.length; i++) if (chain[i][0] === end[0] && chain[i][1] === end[1]) return i; return chain.length - 1; };
  const i1 = cut(pin.at(-1), pin.length - 1);
  const i2 = cut(pinside.at(-1), i1 + (pinside.length > 1 ? 1 : 0));
  const paths = { ...site.paths, in: chain.slice(0, i1 + 1), inside: chain.slice(i1, i2 + 1), target: chain.slice(i2) };
  if (pout?.length) {
    const back = [...chain].reverse();
    paths.out = same([...pout].reverse(), [...pin, ...pinside.slice(1), ...ptarget.slice(1)]) ? back : [...gridChain([...pout].reverse(), site)].reverse();
  }
  const out = { ...site, paths };
  cache.set(site, out);
  return out;
}

/** An SVG path through the points, each corner cut at 45° (r: how far back from the corner the cut starts). */
export function cutCorners(points, r = 7) {
  if (!points?.length) return '';
  const f = (n) => Math.round(n * 10) / 10;
  let d = `M${points[0][0]} ${points[0][1]}`;
  for (let i = 1; i < points.length - 1; i++) {
    const [px, py] = points[i - 1]; const [x, y] = points[i]; const [nx, ny] = points[i + 1];
    const l1 = Math.hypot(x - px, y - py); const l2 = Math.hypot(nx - x, ny - y);
    if (!l1 || !l2) continue;
    const k = Math.min(r, l1 / 2, l2 / 2);
    d += ` L${f(x - ((x - px) / l1) * k)} ${f(y - ((y - py) / l1) * k)} L${f(x + ((nx - x) / l2) * k)} ${f(y + ((ny - y) / l2) * k)}`;
  }
  const e = points.at(-1);
  return `${d} L${e[0]} ${e[1]}`;
}
