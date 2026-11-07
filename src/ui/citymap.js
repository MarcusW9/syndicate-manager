// The command centre's map (part 2, 2026-11-05; drafts/ops-and-presence.md §3 and the owner's
// mock-up, drafts/prototypes/command-centre.html): Lantern Bay as a neon tactical map drawn in code.
// The island's districts as faceted shapes in their gang's light, meeting at dark seams, with a
// faint block grid inside; the Amber Reach in the harbour; the mainland's Docks and the Silt.
// Locked districts are hatched. On top, for glancing: heat glows, crews out as face tokens on a
// route from their hall, calls pulsing sodium, and a ring on a hall with a raid warned. Nothing
// else moves on its own (owner: ambient motion clutters a map of dots and actions).
//
// Labels, frame and zoom (2026-11-07, owner's session; drafts/prototypes/ops-map.html):
// - Each district's label is HTML over the map (cityMapLabels), so it stays the same size on any
//   screen; as SVG text it grew with the map (about 33px on a computer). A label names the
//   district and, under it, only what's there: who lives there, its work, heat from 1.
// - Labels of districts with a hall of ours, and of the picked one, carry the district's landmark
//   (ui/landmarks.js) as a small icon.
// - Picking a district zooms the map onto it (cityMapView, animateMap) and shows its landmark on
//   the map; "× Whole city" (in the legend's row), Esc or a tap on the harbour zooms back out.
//   Taps only: no pinch, no drag, so the map never slides under a thumb.
// - The map sits in a frame (cityMap): a hairline, cyan corner brackets, the legend inside.
//
// Adding a district: one entry in DISTRICTS below (its shape, label spot and landmark spot). A
// locked district is already on the map; opening it is data (src/data/city.js), not new art.

import { landmark } from './landmarks.js';

export const MAP_W = 330;
export const MAP_H = 290;
/** The whole city with a little harbour round it: [x, y, width, height]. */
export const FULL_VIEW = [14, 12, 330, 290];

const f1 = (n) => (Math.round(n * 10) / 10).toString();

/** Each district: its shape (straight edges, as the mock-up), where its label sits, where its landmark stands when zoomed. */
const DISTRICTS = {
  ironPeak: { shape: 'M150 22L205 18L232 34L214 58L170 60L146 44Z', plate: [180, 36], mark: [206, 56] },
  heights: { shape: 'M214 58L232 34L286 40L312 72L300 104L246 100L222 84Z', plate: [264, 70], mark: [286, 98] },
  basin: { shape: 'M120 70L146 44L170 60L214 58L222 84L196 110L150 112L124 98Z', plate: [146, 90], mark: [190, 102] },
  oldTown: { shape: 'M76 104L124 98L150 112L170 140L150 160L100 162L72 140Z', plate: [112, 140], mark: [96, 128] },
  nightMarket: { shape: 'M150 112L196 110L222 84L246 100L300 104L292 136L250 156L170 140Z', plate: [238, 128], mark: [276, 128] },
  amberReach: { shape: 'M168 186L206 182L214 200L196 212L166 206Z', plate: [190, 200], mark: [190, 214] },
  docks: { shape: 'M20 238L60 226L130 230L190 236L214 252L210 300L20 300Z', plate: [100, 270], mark: [52, 292] },
  silt: { shape: 'M214 252L262 240L340 246L340 300L210 300Z', plate: [284, 274], mark: [312, 294] },
};
export const MAP_DISTRICTS = Object.keys(DISTRICTS);

const MONORAIL = 'M262 92L190 198L150 246'; // the maglev, through the Amber Reach to the Docks (still: nothing moves on the map unless it means something)
const FERRY = 'M110 190H206'; // the night ferry across the harbour

const heatTone = (h) => (h >= 6 ? 'hot' : h >= 3 ? 'warm' : 'low');
const heatRgb = { low: '242,213,65', warm: '255,154,61', hot: '255,74,74' };

/** A district's corners, from its shape. */
const points = (key) => [...DISTRICTS[key].shape.matchAll(/(\d+(?:\.\d+)?) (\d+(?:\.\d+)?)/g)].map((m) => [+m[1], +m[2]]);

/**
 * Where the map looks: the whole city, or (a district picked) that district with a margin, at the
 * map's own shape and never past the city's edge. At least 175 units wide (about 1.9×), so a small
 * district doesn't blow its faces up. Returns [x, y, width, height].
 */
export function cityMapView(picked) {
  if (!picked || !DISTRICTS[picked]) return FULL_VIEW.slice();
  const pts = points(picked);
  const pad = 18;
  let x = Math.min(...pts.map((p) => p[0])) - pad, y = Math.min(...pts.map((p) => p[1])) - pad;
  let w = Math.max(...pts.map((p) => p[0])) + pad - x, h = Math.max(...pts.map((p) => p[1])) + pad - y;
  const ar = FULL_VIEW[2] / FULL_VIEW[3];
  if (w / h < ar) { const nw = h * ar; x -= (nw - w) / 2; w = nw; } else { const nh = w / ar; y -= (nh - h) / 2; h = nh; }
  if (w < 175) { const k = 175 / w; x -= (w * k - w) / 2; y -= (h * k - h) / 2; w *= k; h *= k; }
  x = Math.max(FULL_VIEW[0], Math.min(x, FULL_VIEW[0] + FULL_VIEW[2] - w));
  y = Math.max(FULL_VIEW[1], Math.min(y, FULL_VIEW[1] + FULL_VIEW[3] - h));
  return [x, y, w, h].map((n) => Math.round(n * 10) / 10);
}

/** A label's second line: who's based there (a hall), its work, its heat (from 1). */
export const labelSub = (x) => [x.based != null && (x.home || x.hall) ? `⌂ ${x.based} HERE` : '', x.jobs ? `${x.jobs} JOB${x.jobs === 1 ? '' : 'S'}` : '', x.heat ? `HEAT ${x.heat}` : ''].filter(Boolean).join(' · ');
/** Does this district's label carry its landmark? A hall of ours there, or picked. */
const withIcon = (x) => !x.locked && (x.home || x.hall || x.selected);
/** A label's size on screen in px, roughly: [width, height] (crew tokens sit just off it). */
const labelPx = (x) => (x.locked ? [x.name.length * 7.4 + 16, 22]
  : [Math.max(x.name.length * 9.6, labelSub(x).length * 7) + 18 + (withIcon(x) ? 30 : 0), labelSub(x) ? 36 : 30]);

/** Where (x, y) in map units falls in the view, in % of the view's width and height. */
const pct = (view, x, y) => [((x - view[0]) / view[2]) * 100, ((y - view[1]) / view[3]) * 100];

/**
 * The labels, HTML over the map (2026-11-07): the district's name in display caps, its gang's colour
 * as a tab, a landmark icon for a hall of ours or the picked district, and a second line only when
 * there's something on it. A raid warned is a red tag above it, street talk a blinking square beside
 * it. Each is a tap target (44px+ with its margin), placed in % of the view (animateMap moves them).
 */
export function cityMapLabels(districts, esc, view = FULL_VIEW) {
  const zoomed = districts.some((x) => x.selected);
  return `<div class="cm-labels">${districts.map((x) => {
    const [px, py] = DISTRICTS[x.key].plate;
    const [l, t] = pct(view, px, py);
    const sub = x.locked ? '' : labelSub(x);
    const icon = withIcon(x) ? `<svg class="cm-label__icon" viewBox="0 0 48 44" aria-hidden="true">${landmark(x.key, { x: 24, y: 44, size: 48, light: x.turf ?? '#3de8d8' })}</svg>` : '';
    const cls = ['cm-label', x.locked ? 'is-locked' : '', x.selected ? 'is-on' : '', zoomed && !x.selected ? 'is-dim' : ''].filter(Boolean).join(' ');
    return `<button class="${cls}" data-action="city-district" data-id="${x.key}" data-x="${px}" data-y="${py}" style="left:${f1(l)}%;top:${f1(t)}%;${x.turf ? `--turf:${x.turf}` : ''}" tabindex="-1" aria-hidden="true">`
      + `${x.raid ? `<span class="cm-label__raid">RAID ${esc(x.raid)}</span>` : ''}${icon}<span class="cm-label__text"><span class="cm-label__name">${esc(x.name)}</span>`
      + `${sub ? `<span class="cm-label__sub ${x.heat >= 3 ? `is-${heatTone(x.heat)}` : ''}">${esc(sub)}</span>` : ''}</span>${x.talk ? '<span class="map-talk" title="Street talk"></span>' : ''}</button>`;
  }).join('')}</div>`;
}

/** A district's heat as a glow round its label: bigger and redder the hotter it runs. Still: the colour says it. */
function heatGlow(x) {
  const h = x.locked ? 0 : x.heat ?? 0;
  if (!h) return '';
  const [cx, cy] = DISTRICTS[x.key].plate;
  const t = heatTone(h);
  return `<radialGradient id="cm-heat-${x.key}"><stop offset="0" stop-color="rgb(${heatRgb[t]})" stop-opacity="${(0.06 + h * 0.035).toFixed(3)}" /><stop offset="1" stop-color="rgb(${heatRgb[t]})" stop-opacity="0" /></radialGradient>
    <circle class="cm-heat" cx="${cx}" cy="${cy}" r="${20 + h * 3}" fill="url(#cm-heat-${x.key})" />`;
}

/** A ring round a hall's label with a raid warned (core/raids.js): one still, one breathing outwards. */
function raidRing(x) {
  if (!x.raid) return '';
  const [cx, cy] = DISTRICTS[x.key].plate;
  return `<circle class="cm-raid" cx="${cx}" cy="${cy}" r="34" /><circle class="cm-raid cm-raid--pulse" cx="${cx}" cy="${cy}" r="34" />`;
}

/**
 * Crews out as face tokens: each crew on a dotted route from its hall to the district it's working,
 * just off the district's label (a crew waiting on a call rings sodium and pulses; side work is a
 * smaller grey-ringed token). `portrait` draws a face (ui/art.js). pxPerUnit: how many screen px a
 * map unit is at this view, so a token sits just off the label at its real size.
 */
function crewTokens(x, portrait, pxPerUnit) {
  if (!portrait || !x.crews?.length) return '';
  const [x2, y2] = DISTRICTS[x.key].plate;
  const [pw, ph] = labelPx(x).map((n) => n / pxPerUnit);
  return x.crews.map((c, k) => {
    const [x1, y1] = DISTRICTS[c.from]?.plate ?? DISTRICTS.oldTown.plate;
    const here = c.from === x.key;
    const r = c.side ? 5.5 : 7;
    const dx = x1 - x2, dy = y1 - y2, len = Math.hypot(dx, dy) || 1;
    const ux = dx / len, uy = dy / len;
    // Where the route leaves the label's rectangle, then out by the token's size.
    const edge = Math.min(Math.abs(ux) > 0.01 ? pw / 2 / Math.abs(ux) : Infinity, Math.abs(uy) > 0.01 ? ph / 2 / Math.abs(uy) : Infinity);
    const out = edge + r + 3 + k * (r * 2 + 4);
    const bx = here ? x2 - pw / 2 + r + k * 30 : x2 + ux * out;
    const by = here ? y2 + ph / 2 + r + 3 : y2 + uy * out;
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
 * The map's drawing. `districts` is a list of { key, name, label, locked, selected, turf (hex or
 * null), jobs, home, hall, based (residents), heat, raid, talk, crews: [{ ops, call, side, from }] }
 * from the UI, in MAP_DISTRICTS order; this file only draws. portrait: ui/art.js, for the faces.
 * view: the viewBox to draw at ([x, y, w, h]); pxPerUnit: screen px per map unit at the view the map
 * is heading for (for where the faces sit).
 */
export function cityMapSvg(districts, esc, { portrait = null, view = FULL_VIEW, pxPerUnit = 1.1 } = {}) {
  const fill = (x) => (x.locked ? '' : `style="--turf:${x.turf ?? 'var(--accent-2)'}"`);
  const cls = (x) => [x.locked ? 'is-locked' : '', x.home || x.hall ? 'has-hall' : '', x.selected ? 'is-selected' : ''].filter(Boolean).join(' ');
  const picked = districts.find((x) => x.selected);
  const mark = picked ? `<g class="cm-mark">${landmark(picked.key, { x: DISTRICTS[picked.key].mark[0], y: DISTRICTS[picked.key].mark[1], size: 34, light: picked.turf ?? '#3de8d8', locked: picked.locked })}</g>` : '';
  return `
    <svg class="citymap ${picked ? 'is-zoomed' : ''}" viewBox="${view.join(' ')}" role="group" aria-label="Map of Lantern Bay: your halls, crews out and heat by district">
      <defs>
        <pattern id="cm-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" class="cm-hatch__bg" /><path d="M0 0V6" /></pattern>
        <pattern id="cm-blocks" width="9" height="9" patternUnits="userSpaceOnUse"><path d="M0 0H9M0 0V9" /></pattern>
        <clipPath id="cm-land">${MAP_DISTRICTS.map((k) => `<path d="${DISTRICTS[k].shape}" />`).join('')}</clipPath>
        <clipPath id="cm-face-m"><circle r="7" /></clipPath>
        <clipPath id="cm-face-s"><circle r="5.5" /></clipPath>
      </defs>
      <rect class="cm-sea" x="0" y="0" width="360" height="320" data-action="city-whole" />
      <text x="236" y="236" class="map-label">HARBOUR</text>
      ${districts.map((x) => `<g class="cm-d ${cls(x)}" data-action="city-district" data-id="${x.key}" role="button" tabindex="0" aria-pressed="${!!x.selected}" aria-label="${esc(x.label)}"><path class="cm-d__area" d="${DISTRICTS[x.key].shape}" ${fill(x)} /></g>`).join('')}
      <rect class="cm-streets" x="0" y="0" width="360" height="310" fill="url(#cm-blocks)" clip-path="url(#cm-land)" />
      <g class="cm-seams">${MAP_DISTRICTS.map((k) => `<path d="${DISTRICTS[k].shape}" />`).join('')}</g>
      <path class="cm-transit" d="${MONORAIL}" />
      <path class="map-crossing" d="${FERRY}" />
      ${mark}
      <g class="cm-heats">${districts.map(heatGlow).join('')}</g>
      <g class="cm-raids">${districts.map(raidRing).join('')}</g>
      <g class="cm-tokens">${districts.map((x) => crewTokens(x, portrait, pxPerUnit)).join('')}</g>
    </svg>`;
}

/** The legend under the map (HTML, so it wraps on a phone). */
export const cityMapLegend = () => `<div class="citymap__legend" aria-hidden="true"><span><i class="is-crew"></i>Crew</span><span><i class="is-call"></i>Calling</span><span><i class="is-raid"></i>Raid warned</span><span><b>⌂</b> Hall</span></div>`;

/**
 * The whole map: the frame, the drawing and its labels at `view`, and under them the legend, or
 * (a district picked) the way back out. mapPx: the map's width on screen, for the faces' spacing.
 */
export function cityMap(districts, esc, { portrait = null, view = FULL_VIEW, mapPx = 360 } = {}) {
  const picked = districts.find((x) => x.selected);
  const target = cityMapView(picked?.key);
  return `
    <div class="mapframe ${picked ? 'is-zoomed' : ''}">
      <span class="mapframe__corner mapframe__corner--bl" aria-hidden="true"></span><span class="mapframe__corner mapframe__corner--br" aria-hidden="true"></span>
      <div class="citymap__view">
        ${cityMapSvg(districts, esc, { portrait, view, pxPerUnit: mapPx / target[2] })}
        ${cityMapLabels(districts, esc, view)}
      </div>
      <div class="mapframe__foot">
        ${picked ? `<button class="mapframe__out" data-action="city-whole"><span aria-hidden="true">×</span> Whole city</button>` : cityMapLegend()}
      </div>
    </div>`;
}

/**
 * Ease the map from one view to another (0.45s; at once with reduced motion), moving the labels
 * with it. `el` is the .citymap__view drawn at `from`. Returns nothing; safe to call when equal.
 */
export function animateMap(el, from, to) {
  const svg = el?.querySelector('svg.citymap');
  if (!svg || from.every((n, i) => n === to[i])) return;
  const labels = [...el.querySelectorAll('.cm-label')];
  const set = (v) => {
    svg.setAttribute('viewBox', v.map((n) => n.toFixed(2)).join(' '));
    for (const l of labels) {
      const [x, y] = pct(v, +l.dataset.x, +l.dataset.y);
      l.style.left = `${x.toFixed(2)}%`;
      l.style.top = `${y.toFixed(2)}%`;
    }
  };
  const still = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (still || !globalThis.requestAnimationFrame) return set(to);
  const t0 = performance.now(), dur = 450;
  const ease = (t) => 1 - (1 - t) ** 3;
  const step = (now) => {
    if (!svg.isConnected) return;
    const t = Math.min(1, (now - t0) / dur);
    set(from.map((a, i) => a + (to[i] - a) * ease(t)));
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
