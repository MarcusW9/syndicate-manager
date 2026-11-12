// The live battle view's staging (drafts/PROPOSAL-live-battle-view.md 5.1, 2026-11-12): where each unit of an
// engine-2 fight stands on the site map. Pure. The rules (core/fight.js) have cover ('open', 'half', 'full') and no
// coordinates; this maps the rules' state onto the site's real fight spots (core/fightspots.js) so the cover drawn
// is the cover used. It never draws a roll and never writes to the fight: positions are staging only.
//
// Two steps:
//   stageSpots(site, zone, need)  at the fight's start (core/runfight.js startFight; the save migration for a fight
//                                 already going): the site's fight spots, plus half-cover spots made from the site's
//                                 own cover (a container's end), the van, the overwatch perch, the target, and the
//                                 enemies' ways in. Stored on the fight as b.spots, so the layout needs no site.
//   layoutFight(b, spots)         any time: { units: { [unitId]: Place }, points }. Deterministic; leaves b deep-equal.
//
// When the site has no spot left with the cover the rules give someone, they stand on open ground and the place
// carries `mark` (the cover the rules give): the stage draws a low barrier there, so the picture still shows the
// rules' cover (owner, 2026-11-12: "derive, then mark"). The rules are never changed to fit the picture.
//
// Place { at: [x, y], spot: index | null, side: 'crew' | 'guards' | null, cover, mark: 'half' | 'full' | null,
//         derived: bool, stance, entrance?: [x, y] }
// stance: 'up' | 'hunker' | 'boarding' | 'down' | 'dead' | 'aboard' | 'gone' (runners);
//         'up' | 'approaching' | 'down' | 'fled' (enemies).
// Unit ids: a runner's own id; an enemy's is enemyUnit(n), 'e:<n>'.

import { fightSpots, siteRects, BLOCK } from './fightspots.js';
import { siteHeight } from '../data/sites.js';

export const enemyUnit = (n) => `e:${n}`;

const EDGE = 4; // how far inside the map's edge a way in sits
const END = 12; // a derived half spot: this far along the cover from a full spot, past the container's end
const NEAR = 12; // a derived spot at least this far from any other

const len = (v) => Math.hypot(v[0], v[1]);
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const unit = (v) => { const l = len(v) || 1; return [v[0] / l, v[1] / l]; };
const round = (p) => [Math.round(p[0]), Math.round(p[1])];

/** Where the line from p going way v leaves the map (360 wide, the site's height), pulled EDGE inside. */
function edgeFrom(p, v, w, h) {
  const ts = [];
  if (v[0] > 0.001) ts.push((w - EDGE - p[0]) / v[0]);
  if (v[0] < -0.001) ts.push((EDGE - p[0]) / v[0]);
  if (v[1] > 0.001) ts.push((h - EDGE - p[1]) / v[1]);
  if (v[1] < -0.001) ts.push((EDGE - p[1]) / v[1]);
  const t = Math.max(0, Math.min(...ts));
  return round([p[0] + v[0] * t, p[1] + v[1] * t]);
}

/**
 * The fight's spots on this site and zone, for staging: fightSpots plus half spots made at the ends of full cover,
 * and the map's points (van, perch, target, the enemies' two ways in). null where the site gives no spots.
 * need: { crew, guards }, how many spots each side wants at least.
 */
export function stageSpots(site, zone, need = { crew: 8, guards: 12 }) {
  const s = fightSpots(site, zone, need);
  if (!s) return null;
  const W = 360;
  const H = siteHeight(site);
  const blocks = siteRects(site).filter((r) => BLOCK.has(r.cls));
  const C = s.anchors.crew;
  const E = s.anchors.guards;
  const d = unit(sub(E, C));
  const across = [-d[1], d[0]];
  const all = () => [...s.crew, ...s.guards].map((x) => x.at);
  const free = (p) => p[0] >= EDGE && p[0] <= W - EDGE && p[1] >= EDGE && p[1] <= H - EDGE
    && !blocks.some((r) => p[0] > r.x - 4 && p[0] < r.x + r.w + 4 && p[1] > r.y - 4 && p[1] < r.y + r.h + 4)
    && all().every((q) => len(sub(p, q)) >= NEAR);
  // A container's end: from each full spot, a step further along the cover. Standing there, half of you shows.
  const derive = (list) => {
    const out = [];
    for (const x of list.filter((y) => y.cover === 'full')) {
      for (const k of [1, -1]) {
        const p = round([x.at[0] + across[0] * END * k, x.at[1] + across[1] * END * k]);
        if (free(p)) { const spot = { at: p, cover: 'half', derived: true }; out.push(spot); list.push(spot); }
      }
    }
    return out;
  };
  const crew = s.crew.map((x) => ({ ...x }));
  const guards = s.guards.map((x) => ({ ...x }));
  s.crew = crew; s.guards = guards; // free() reads the lists as they grow
  derive(crew);
  derive(guards);
  // The enemies come in from beyond their post (straight on from the line of fire) and from the nearer side.
  const side = across[0] * (E[0] - W / 2) + across[1] * (E[1] - H / 2) >= 0 ? across : [-across[0], -across[1]];
  const entrances = [edgeFrom(E, d, W, H), edgeFrom(E, side, W, H)];
  const pts = site.points ?? {};
  return {
    zone, crew, guards, anchors: s.anchors, entrances,
    van: pts.van ?? site.paths?.in?.[0] ?? C, perch: pts.perch ?? null, target: pts.target ?? null,
  };
}

/** The spots for a job's fight (core/runfight.js startFight): the inside team plus the standby, two to spare, and room for arrivals. */
export const stageNeed = (crew) => ({ crew: crew + 3, guards: 12 });

const ORDER = ['full', 'half', 'open'];

/**
 * Where everyone stands now: a pure read of the fight. spots: b.spots (stageSpots). Runners by seat, then enemies by
 * number; each keeps the same spot while their cover holds (a fixed first choice per unit, so one change does not
 * shuffle the rest). Returns null when the fight has no spots.
 */
export function layoutFight(b, spots = b?.spots) {
  if (!spots) return null;
  const units = {};
  const taken = { crew: new Set(), guards: new Set() };
  const points = { van: spots.van, perch: spots.perch, target: spots.target, entrances: spots.entrances, anchors: spots.anchors };
  // A unit's spot: the list's spots with this cover, starting from its own first choice; else open ground with a mark.
  const place = (sideName, cover, pref) => {
    const list = spots[sideName];
    const tryCover = (c) => {
      const idx = list.map((x, i) => i).filter((i) => list[i].cover === c);
      if (!idx.length) return null;
      for (let k = 0; k < idx.length; k++) { const i = idx[(pref + k) % idx.length]; if (!taken[sideName].has(i)) return i; }
      return null;
    };
    let i = tryCover(cover);
    let mark = null;
    if (i == null && cover !== 'open') { i = tryCover('open'); mark = cover; }
    if (i == null) {
      // More people than the site has spots: anyone free, by cover (the mark keeps the rules' cover on screen).
      for (const c of ORDER) { i = tryCover(c); if (i != null) break; }
      if (i != null && list[i].cover !== cover) mark = cover === 'open' ? null : cover;
    }
    if (i == null) {
      // Still none: a fan round the side's anchor, in the open, marked with the rules' cover.
      const a = spots.anchors[sideName === 'crew' ? 'crew' : 'guards'];
      const k = taken[sideName].size;
      return { at: [a[0] + ((k % 5) - 2) * 14, a[1] + Math.floor(k / 5) * 14], spot: null, side: sideName, cover, mark: cover === 'open' ? null : cover, derived: false };
    }
    taken[sideName].add(i);
    return { at: list[i].at, spot: i, side: sideName, cover, mark, derived: !!list[i].derived };
  };
  const lerp = (p, q, t) => round([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]);

  // The protected runner first (the tech holds the best spot for the work), then by seat.
  const runners = [...b.runners].sort((x, y) => (y.id === b.goal?.protect) - (x.id === b.goal?.protect) || x.seat - y.seat);
  for (const r of runners) {
    if (r.withdrawn && !r.dead) { units[r.id] = { at: spots.van, spot: null, side: null, cover: 'open', mark: null, derived: false, stance: 'gone' }; continue; }
    if (r.aboard) { units[r.id] = { at: spots.van, spot: null, side: null, cover: 'open', mark: null, derived: false, stance: 'aboard' }; continue; }
    const p = place('crew', r.cover, r.seat);
    const stance = r.dead ? 'dead' : r.down ? 'down' : r.boarding ? 'boarding' : r.hunker ? 'hunker' : 'up';
    // Running for the van: out in the open, between their cover and the van (the rules: board and carry are shot at in the open).
    if (stance === 'boarding') units[r.id] = { ...p, at: lerp(p.at, spots.van, 0.5), cover: 'open', mark: null, stance, from: p.at };
    else units[r.id] = { ...p, stance };
  }
  const ways = spots.entrances ?? [spots.anchors.guards];
  for (const e of [...b.enemies].sort((x, y) => x.n - y.n)) {
    const entrance = ways[(e.n - 1) % ways.length];
    const id = enemyUnit(e.n);
    if (e.fled) { units[id] = { at: entrance, spot: null, side: null, cover: e.cover, mark: null, derived: false, stance: 'fled', entrance }; continue; }
    const p = place('guards', e.cover, e.n - 1);
    units[id] = { ...p, stance: e.out ? 'down' : e.approaching ? 'approaching' : 'up', entrance };
  }
  return { units, points };
}
