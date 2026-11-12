// The mini map on a crew-out card (2026-11-06, crews out made visible, 4b): the job's own site
// (data/sites.js pickSite) as a small still picture, the route walked so far solid and the rest
// dashed, and the crew as dots where they got to today. A crew waiting on a call rings sodium and
// pulses, as on the City map; nothing else moves (owner: still dots). Pure strings.

import { shapeSvg } from './siteplan.js';
import { siteHeight } from '../data/sites.js';
import { gridSite, cutCorners } from './route.js';

const W = 360;
const H = 240;
const ORDER = ['start', 'in', 'inside', 'target', 'out'];
const WORD = { start: 'at the van', in: 'going in', inside: 'inside', target: 'at the target', out: 'getting out' };

/** Where the crew stand in a zone (as the watch screen walks them: ui/siteplan.js ZONE_END). */
export function zoneSpot(site, zone) {
  const P = site.points;
  return { start: P.van, in: site.paths.in.at(-1), inside: site.paths.inside.at(-1), target: P.target, out: P.van }[zone] ?? P.van;
}

/** The route as far as this zone, and what's left of it. */
export function routeSplit(site, zone) {
  const legs = [site.paths.in, site.paths.inside.slice(1), site.paths.target.slice(1), site.paths.out.slice(1)];
  const done = Math.max(0, ORDER.indexOf(zone)); // legs walked: in → 1, inside → 2, target → 3, out → 4
  const walked = legs.slice(0, done).flat();
  const ahead = [...(walked.length ? [walked.at(-1)] : []), ...legs.slice(done).flat()];
  return { walked, ahead };
}

/** n dots round a point, close together. */
function cluster([x, y], n) {
  if (n <= 1) return [[x, y]];
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    return [Math.round(x + Math.cos(a) * 9), Math.round(y + Math.sin(a) * 9)];
  });
}

/**
 * The mini map's SVG. zone: where the job is (am.zone); crew: how many inside; overwatch and
 * wheels: whether someone is on the perch or with the van; calling: a call waiting.
 */
export function crewOutMap({ site: given, zone = 'start', crew = 1, overwatch = false, wheels = false, calling = false, esc = String }) {
  const site = gridSite(given); // the route as the watch screen draws it (ui/route.js)
  const z = ORDER.includes(zone) ? zone : 'start';
  const { walked, ahead } = routeSplit(site, z);
  const at = zoneSpot(site, z);
  const H = siteHeight(site);
  const box = (z === 'start' || z === 'out' ? null : site.views?.[z]) ?? [0, 0, W, H];
  const dots = cluster(at, crew).map(([x, y]) => `<circle class="mm-dot" cx="${x}" cy="${y}" r="7"/>`).join('');
  const label = `Map of ${site.name ?? 'the job'}: the crew ${WORD[z]}${calling ? ', waiting on your call' : ''}.`;
  return `<svg class="minimap ${calling ? 'is-call' : ''}" viewBox="${box.join(' ')}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${esc(label)}">
    <rect x="0" y="0" width="${W}" height="${H}" fill="#0b0d11"/>
    ${site.shapes.map(shapeSvg).join('')}
    ${ahead.length > 1 ? `<path class="mm-ahead" d="${cutCorners(ahead, 5)}"/>` : ''}
    ${walked.length > 1 ? `<path class="mm-walked" d="${cutCorners(walked, 5)}"/>` : ''}
    ${overwatch ? `<circle class="mm-side" cx="${site.points.perch[0]}" cy="${site.points.perch[1]}" r="5"/>` : ''}
    ${wheels && z !== 'start' && z !== 'out' ? `<circle class="mm-side" cx="${site.points.van[0]}" cy="${site.points.van[1]}" r="5"/>` : ''}
    ${calling ? `<circle class="mm-call" cx="${at[0]}" cy="${at[1]}" r="${crew > 1 ? 20 : 13}"/>` : ''}
    ${dots}
  </svg>`;
}
