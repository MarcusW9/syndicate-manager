// The command centre's map (part 2, 2026-11-05; drafts/ops-and-presence.md §3 and the owner's
// mock-up, drafts/prototypes/command-centre.html): Lantern Bay as a neon tactical map drawn in code.
// The island's districts as faceted shapes in their gang's light, meeting at dark seams, with a
// faint block grid inside; the Amber Reach in the harbour; the mainland's Docks and the Silt.
// Locked districts are hatched. Each district has a plate (its name, then who's based there, its
// work and its heat). On top, for glancing: heat glows, crews out as face tokens on a route from
// their hall, calls pulsing sodium, and a ring on a hall with a raid warned. Nothing else moves
// (owner: ambient motion clutters a map of dots and actions). It fits the width and never moves
// (no zoom, no pan). The district landmarks (ui/landmarks.js) are kept for other screens.
//
// Adding a district: one entry in DISTRICTS below (its shape and plate spot). A locked
// district is already on the map; opening it is data (src/data/city.js), not new art.

export const MAP_W = 330;
export const MAP_H = 290;
const VIEW = '14 12 330 290'; // the mock-up's frame: the whole city with a little harbour round it

const f1 = (n) => (Math.round(n * 10) / 10).toString();

/** Each district: its shape (straight edges, as the mock-up), where its plate sits. */
const DISTRICTS = {
  ironPeak: { shape: 'M150 22L205 18L232 34L214 58L170 60L146 44Z', plate: [180, 36] },
  heights: { shape: 'M214 58L232 34L286 40L312 72L300 104L246 100L222 84Z', plate: [264, 70] },
  basin: { shape: 'M120 70L146 44L170 60L214 58L222 84L196 110L150 112L124 98Z', plate: [146, 90] },
  oldTown: { shape: 'M76 104L124 98L150 112L170 140L150 160L100 162L72 140Z', plate: [112, 140] },
  nightMarket: { shape: 'M150 112L196 110L222 84L246 100L300 104L292 136L250 156L170 140Z', plate: [238, 128] },
  amberReach: { shape: 'M168 186L206 182L214 200L196 212L166 206Z', plate: [190, 200] },
  docks: { shape: 'M20 238L60 226L130 230L190 236L214 252L210 300L20 300Z', plate: [100, 270] },
  silt: { shape: 'M214 252L262 240L340 246L340 300L210 300Z', plate: [284, 274] },
};
export const MAP_DISTRICTS = Object.keys(DISTRICTS);

const MONORAIL = 'M262 92L190 198L150 246'; // the maglev, through the Amber Reach to the Docks (still: nothing moves on the map unless it means something)
const FERRY = 'M110 190H206'; // the night ferry across the harbour

const heatTone = (h) => (h >= 6 ? 'hot' : h >= 3 ? 'warm' : 'low');
const heatRgb = { low: '242,213,65', warm: '255,154,61', hot: '255,74,74' };

/** A plate's second line: who's based there (a hall), its work, its heat. */
const plateSub = (x) => [x.based != null && (x.home || x.hall) ? `⌂ ${x.based} HERE` : '', x.jobs ? `${x.jobs} JOB${x.jobs === 1 ? '' : 'S'}` : '', `HEAT ${x.heat ?? 0}`].filter(Boolean).join(' · ');
/** A plate's size: [width, height]. */
const plateSize = (x) => (x.locked ? [x.name.length * 6.4 + 12, 16] : [Math.max(64, x.name.length * 8 + 14, plateSub(x).length * 5.6 + 14), 30]);

/** A district's plate: the mock-up's panel, name and one line; LOCKED districts small and muted. */
function plate(x, esc) {
  const [cx, cy] = DISTRICTS[x.key].plate;
  const name = x.name.toUpperCase();
  if (x.locked) {
    const [w] = plateSize(x);
    return `<g transform="translate(${f1(cx - w / 2)} ${f1(cy - 9)})"><rect class="cm-plate__bg" width="${f1(w)}" height="16" /><text class="cm-plate__name" x="6" y="11.5">${esc(name)}</text></g>`;
  }
  const sub = plateSub(x);
  const [w] = plateSize(x);
  let s = `<rect class="cm-plate__bg" width="${f1(w)}" height="30" /><rect width="16" height="2" fill="${x.turf ?? 'var(--line)'}" />`;
  s += `<text class="cm-plate__name" x="7" y="13">${esc(name)}</text><text class="cm-plate__sub ${x.heat >= 3 ? `is-${heatTone(x.heat)}` : ''}" x="7" y="25">${esc(sub)}</text>`;
  if (x.raid) s += `<g transform="translate(0 -14)"><rect class="cm-tag cm-tag--raid" width="${f1(esc(x.raid).length * 5.2 + 34)}" height="12" /><text class="cm-tag__txt cm-tag__txt--raid" x="5" y="9">RAID ${esc(x.raid)}</text></g>`;
  if (x.talk) s += `<rect class="map-talk" x="${f1(w + 4)}" y="4" width="5" height="5" />`;
  return `<g transform="translate(${f1(cx - w / 2)} ${f1(cy - 15)})">${s}</g>`;
}

/** A district's heat as a glow round its plate: bigger and redder the hotter it runs. Still: the colour says it. */
function heatGlow(x) {
  const h = x.locked ? 0 : x.heat ?? 0;
  if (!h) return '';
  const [cx, cy] = DISTRICTS[x.key].plate;
  const t = heatTone(h);
  return `<radialGradient id="cm-heat-${x.key}"><stop offset="0" stop-color="rgb(${heatRgb[t]})" stop-opacity="${(0.06 + h * 0.035).toFixed(3)}" /><stop offset="1" stop-color="rgb(${heatRgb[t]})" stop-opacity="0" /></radialGradient>
    <circle class="cm-heat" cx="${cx}" cy="${cy}" r="${20 + h * 3}" fill="url(#cm-heat-${x.key})" />`;
}

/** A ring round a hall's plate with a raid warned (core/raids.js): one still, one breathing outwards. */
function raidRing(x) {
  if (!x.raid) return '';
  const [cx, cy] = DISTRICTS[x.key].plate;
  return `<circle class="cm-raid" cx="${cx}" cy="${cy}" r="34" /><circle class="cm-raid cm-raid--pulse" cx="${cx}" cy="${cy}" r="34" />`;
}

/**
 * Crews out as face tokens: each crew on a dotted route from its hall to the district it's working,
 * as far along as its job has got (the mock-up's blips, with faces). A crew waiting on a call rings
 * sodium and pulses; side work is a smaller grey-ringed token. `portrait` draws a face (ui/art.js).
 */
function crewTokens(x, portrait) {
  if (!portrait || !x.crews?.length) return '';
  const [x2, y2] = DISTRICTS[x.key].plate;
  return x.crews.map((c, k) => {
    const [x1, y1] = DISTRICTS[c.from]?.plate ?? DISTRICTS.oldTown.plate;
    const here = c.from === x.key;
    const r = c.side ? 5.5 : 7;
    // At the route's end, just off the district's plate on the side they came from (a little apart if
    // several crews are out to one district); a crew working its own district sits under its plate.
    const [pw, ph] = plateSize(x);
    const dx = x1 - x2, dy = y1 - y2, len = Math.hypot(dx, dy) || 1;
    const ux = dx / len, uy = dy / len;
    // Where the route leaves the plate's rectangle, then out by the token's size.
    const edge = Math.min(Math.abs(ux) > 0.01 ? pw / 2 / Math.abs(ux) : Infinity, Math.abs(uy) > 0.01 ? ph / 2 / Math.abs(uy) : Infinity);
    const out = edge + r + 6 + k * (r * 2 + 4);
    const bx = here ? x2 - pw / 2 + r + k * 30 : x2 + ux * out;
    const by = here ? y2 + ph / 2 + r + 5 : y2 + uy * out;
    const route = here ? '' : `<path class="cm-route ${c.call ? 'is-call' : ''}" d="M${x1} ${y1 + 14}Q${f1((x1 + x2) / 2 - 30)} ${f1((y1 + y2) / 2)} ${x2} ${y2 - 14}" />`;
    const faces = c.ops.slice(0, 3);
    const more = c.ops.length - faces.length;
    const w0 = (faces.length - 1) * r * 1.25;
    const token = faces.map((op, i) => `<g transform="translate(${f1(bx - w0 / 2 + i * r * 1.25)} ${f1(by)})"><circle class="cm-token__bg" r="${r + 1}" /><g clip-path="url(#cm-face-${c.side ? 's' : 'm'})">${portrait(op, { size: r * 2 }).replace('<svg ', `<svg x="${-r}" y="${-r}" `)}</g><circle class="cm-token__ring ${c.call ? 'is-call' : c.side ? 'is-side' : ''}" r="${r}" /></g>`).join('');
    const plus = more > 0 ? `<text class="cm-token__more" x="${f1(bx + w0 / 2 + r + 2)}" y="${f1(by + 3)}">+${more}</text>` : '';
    const call = c.call ? `<circle class="cm-call" cx="${f1(bx)}" cy="${f1(by)}" r="${f1(w0 / 2 + r + 4)}" /><circle class="cm-call cm-call--pulse" cx="${f1(bx)}" cy="${f1(by)}" r="${f1(w0 / 2 + r + 4)}" />` : '';
    return `${route}<g class="cm-token">${call}${token}${plus}</g>`;
  }).join('');
}

/**
 * The map. `districts` is a list of { key, name, label, locked, selected, turf (hex or null), jobs,
 * home, hall, based (residents), heat, raid, talk, crews: [{ ops, call, side, from, progress }] }
 * from the UI, in MAP_DISTRICTS order; this file only draws. portrait: ui/art.js, for the faces.
 */
export function cityMapSvg(districts, esc, { portrait = null } = {}) {
  const fill = (x) => (x.locked ? '' : `style="--turf:${x.turf ?? 'var(--accent-2)'}"`);
  const cls = (x) => [x.locked ? 'is-locked' : '', x.home || x.hall ? 'has-hall' : '', x.selected ? 'is-selected' : ''].filter(Boolean).join(' ');
  return `
    <svg class="citymap" viewBox="${VIEW}" role="group" aria-label="Map of Lantern Bay: your halls, crews out and heat by district">
      <defs>
        <pattern id="cm-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" class="cm-hatch__bg" /><path d="M0 0V6" /></pattern>
        <pattern id="cm-blocks" width="9" height="9" patternUnits="userSpaceOnUse"><path d="M0 0H9M0 0V9" /></pattern>
        <clipPath id="cm-land">${MAP_DISTRICTS.map((k) => `<path d="${DISTRICTS[k].shape}" />`).join('')}</clipPath>
        <clipPath id="cm-face-m"><circle r="7" /></clipPath>
        <clipPath id="cm-face-s"><circle r="5.5" /></clipPath>
      </defs>
      <text x="236" y="236" class="map-label">HARBOUR</text>
      ${districts.map((x) => `<g class="cm-d ${cls(x)}" data-action="city-district" data-id="${x.key}" role="button" tabindex="0" aria-pressed="${!!x.selected}" aria-label="${esc(x.label)}"><path class="cm-d__area" d="${DISTRICTS[x.key].shape}" ${fill(x)} /></g>`).join('')}
      <rect class="cm-streets" x="0" y="0" width="360" height="310" fill="url(#cm-blocks)" clip-path="url(#cm-land)" />
      <g class="cm-seams">${MAP_DISTRICTS.map((k) => `<path d="${DISTRICTS[k].shape}" />`).join('')}</g>
      <path class="cm-transit" d="${MONORAIL}" />
      <path class="map-crossing" d="${FERRY}" />
      <g class="cm-heats">${districts.map(heatGlow).join('')}</g>
      <g class="cm-raids">${districts.map(raidRing).join('')}</g>
      ${districts.map((x) => `<g class="cm-plate ${x.locked ? 'is-locked' : ''} ${x.selected ? 'is-on' : ''}" data-action="city-district" data-id="${x.key}" aria-hidden="true">${plate(x, esc)}<circle class="cm-hit" cx="${DISTRICTS[x.key].plate[0]}" cy="${DISTRICTS[x.key].plate[1]}" r="24" /></g>`).join('')}
      <g class="cm-tokens">${districts.map((x) => crewTokens(x, portrait)).join('')}</g>
    </svg>`;
}

/** The legend under the map (HTML, so it wraps on a phone). */
export const cityMapLegend = () => `<div class="citymap__legend" aria-hidden="true"><span><i class="is-crew"></i>Crew</span><span><i class="is-call"></i>Calling</span><span><i class="is-raid"></i>Raid warned</span><span><b>⌂</b> Hall</span></div>`;
