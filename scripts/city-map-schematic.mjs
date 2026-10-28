// Design session (2026-10-28): the City map built from the UI's own parts, after the owner said
// the sketches felt "not aligned with the UX and not as clean". Straight edges, 1px lines in the
// UI's line colour, panel fills, colour only as small signals (a turf tab, a heat meter, a cyan
// badge), labels as little cut-corner plates like the panels, no text halos. Illustration
// (option C, the district pictures) carries the atmosphere; the map stays an instrument.
// Writes drafts/prototypes/city-map-schematic.html, which loads the game's own styles.css.
// Run: node scripts/city-map-schematic.mjs

import { writeFileSync } from 'node:fs';
import { MAP_SHAPES as S, MAP_W, MAP_H } from '../src/ui/citymap.js';

const T = {
  bg: '#0a0c0f', panel: '#12151b', panel2: '#161a21', line: '#2a303b', text: '#e9ecf1', muted: '#8a93a6',
  red: '#ff3d5f', cyan: '#3de8d8', sodium: '#f2d541',
};
const TURF = { oldTown: '#f2d541', docks: '#ff3d5f', nightMarket: '#b48cff', basin: '#ff9a3d', heights: '#3de8d8' };
const GANG = { oldTown: 'Brass Anchor', docks: 'Red Lantern', nightMarket: 'Silver Fan', basin: 'Racing Assoc.', heights: 'Veridian-Apex' };
const NAMES = { ironPeak: 'Iron Peak', heights: 'Glass Heights', oldTown: 'Old Town', nightMarket: 'Night Market', basin: 'Basin', amberReach: 'Amber Reach', docks: 'Docks', silt: 'Silt' };
const LOCKED = new Set(['ironPeak', 'amberReach', 'silt']);
const LIVE = {
  oldTown: { jobs: 1, heat: 1, home: true },
  docks: { jobs: 0, heat: 3, crew: 2, talk: true },
  nightMarket: { jobs: 1, heat: 0 },
  heights: { jobs: 0, heat: 0 },
  basin: { jobs: 0, heat: 2 },
};
const SELECTED = 'docks';
// Plates sit where the district has room (the old label spots crowd on a phone).
const PLATE = { heights: [262, 62], oldTown: [112, 222], nightMarket: [282, 210], basin: [138, 128], ironPeak: [216, 96], amberReach: [204, 314], docks: [108, 452], silt: [314, 470] };

const f = (n) => n.toFixed(1);
const d = (pts) => `M${pts.map((p) => `${f(p[0])} ${f(p[1])}`).join('L')}Z`;
const heatCol = (h) => (h >= 2 ? T.red : h === 1 ? T.sodium : T.line);

/** A cut-corner plate (the panels' shape) centred on x, top at y. */
const plateShape = (x, y, w, h, cut = 5) => `M${f(x)} ${f(y)}H${f(x + w - cut)}L${f(x + w)} ${f(y + cut)}V${f(y + h)}H${f(x)}Z`;

function plate(key) {
  const [cx, cy] = PLATE[key];
  const locked = LOCKED.has(key);
  const l = LIVE[key] ?? {};
  const name = NAMES[key].toUpperCase();
  const w = Math.max(name.length * 6.6 + 16, locked ? 64 : l.jobs ? 102 : 78);
  const h = locked ? 26 : 34;
  const x = cx - w / 2;
  const y = cy - h / 2;
  const sel = key === SELECTED;
  let s = `<g class="sm-plate ${locked ? 'is-locked' : ''} ${sel ? 'is-on' : ''}">`;
  s += `<path d="${plateShape(x, y, w, h)}" fill="${T.bg}" fill-opacity="0.92" stroke="${sel ? T.cyan : T.line}" stroke-width="1" />`;
  if (!locked) s += `<rect x="${f(x)}" y="${f(y)}" width="18" height="2" fill="${TURF[key]}" />`; // the turf tab, like the panels' cyan tab
  s += `<text class="sm-name" x="${f(x + 8)}" y="${f(y + 13)}">${name}</text>`;
  if (locked) s += `<text class="sm-sub" x="${f(x + 8)}" y="${f(y + 22)}">LOCKED</text>`;
  else {
    // Heat: three segments, like the heat meter in the top bar. Work: a cyan count, like the nav badges.
    for (let i = 0; i < 3; i++) s += `<rect x="${f(x + 8 + i * 7)}" y="${f(y + 21)}" width="5" height="5" fill="${i < (l.heat ?? 0) ? heatCol(l.heat) : 'none'}" stroke="${i < (l.heat ?? 0) ? 'none' : T.line}" stroke-width="1" />`;
    s += `<text class="sm-sub" x="${f(x + 32)}" y="${f(y + 26)}">HEAT</text>`;
    if (l.jobs) s += `<rect x="${f(x + w - 30)}" y="${f(y + 18)}" width="24" height="11" fill="${T.cyan}" fill-opacity="0.14" stroke="${T.cyan}" stroke-width="1" /><text class="sm-badge" x="${f(x + w - 18)}" y="${f(y + 26.5)}">${l.jobs} JOB</text>`;
  }
  // Pins hang off the plate's corners so nothing floats loose on the map.
  if (l.home) s += `<g transform="translate(${f(x - 2)} ${f(y - 15)})"><path d="${plateShape(0, 0, 42, 12, 4)}" fill="${T.bg}" stroke="${T.sodium}" stroke-width="1" /><path d="M5 9V5L8.5 2.5L12 5V9Z" fill="${T.sodium}" /><text class="sm-pin" x="15" y="9" fill="${T.sodium}">HOME</text></g>`;
  if (l.crew) s += `<g transform="translate(${f(x + w - 46)} ${f(y - 15)})"><path d="${plateShape(0, 0, 48, 12, 4)}" fill="${T.bg}" stroke="${T.cyan}" stroke-width="1" /><path d="M7 2.5L10.5 6L7 9.5L3.5 6Z" fill="${T.cyan}" /><text class="sm-pin" x="14" y="9" fill="${T.cyan}">${l.crew} OUT</text></g>`;
  if (l.talk) s += `<rect x="${f(x + w + 4)}" y="${f(y + 4)}" width="5" height="5" fill="${T.sodium}" class="sm-talk" />`;
  return s + '</g>';
}

function map() {
  const land = [S.ISLAND, S.WEST, S.AMBER, S.MAINLAND];
  const keys = Object.keys(S.DISTRICT_MAP);
  const area = (k) => d(S.DISTRICT_MAP[k].area) + (S.DISTRICT_MAP[k].holes ?? []).map(d).join('');
  let grid = '';
  for (let x = 0; x <= MAP_W; x += 24) grid += `M${x} 0V${MAP_H}`;
  for (let y = 0; y <= MAP_H; y += 24) grid += `M0 ${y}H${MAP_W}`;
  return `<svg class="sm" viewBox="0 0 ${MAP_W} ${MAP_H}" role="group" aria-label="Map of the city">
    <defs>
      <clipPath id="sm-land">${land.map((p) => `<path d="${d(p)}" />`).join('')}<path d="${d(S.MUDFLAT)}" /></clipPath>
      ${keys.map((k) => `<clipPath id="sm-${k}"><path d="${area(k)}" clip-rule="evenodd" /></clipPath>`).join('')}
      <pattern id="sm-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0V6" stroke="${T.line}" stroke-width="1" /></pattern>
    </defs>
    <rect width="${MAP_W}" height="${MAP_H}" fill="${T.bg}" />
    <path d="${grid}" stroke="${T.cyan}" stroke-opacity="0.05" stroke-width="1" />
    <g fill="${T.panel}">${land.map((p) => `<path d="${d(p)}" />`).join('')}<path d="${d(S.MUDFLAT)}" /></g>
    ${keys.map((k) => {
      const locked = LOCKED.has(k);
      const sel = k === SELECTED;
      return `<g clip-path="url(#sm-land)"><g clip-path="url(#sm-${k})" class="sm-d" data-id="${k}">
        <rect width="${MAP_W}" height="${MAP_H}" fill="${locked ? T.bg : T.panel2}" />
        ${locked ? `<rect width="${MAP_W}" height="${MAP_H}" fill="url(#sm-hatch)" />` : `<rect width="${MAP_W}" height="${MAP_H}" fill="${TURF[k]}" fill-opacity="${sel ? 0.13 : 0.06}" />`}
      </g></g>`;
    }).join('')}
    <!-- Borders between districts: 1px in the line colour, like the dividers between panels. -->
    <g clip-path="url(#sm-land)" fill="none" stroke="${T.line}" stroke-width="1.2">${keys.map((k) => `<path d="${area(k)}" />`).join('')}</g>
    <!-- The coast: one thin cyan hairline, the UI's accent at low strength. -->
    <g fill="none" stroke="${T.cyan}" stroke-opacity="0.45" stroke-width="1">${land.map((p) => `<path d="${d(p)}" />`).join('')}</g>
    <path d="${d(S.MUDFLAT)}" fill="none" stroke="${T.line}" stroke-dasharray="2 3" />
    <!-- The islets round the harbour: small straight-edged rocks, same fill and hairline as the coast. -->
    ${S.ISLETS.map(([x, y, r]) => `<path d="${d(S.ring(x, y, r, r * 0.8, 6))}" fill="${T.panel}" stroke="${T.cyan}" stroke-opacity="0.45" />`).join('')}
    ${S.PIERS.map((p) => `<path d="${d(p)}" fill="${T.panel}" stroke="${T.cyan}" stroke-opacity="0.45" />`).join('')}
    <!-- Selected district: the cyan edge every selected card has. -->
    <path d="${area(SELECTED)}" clip-path="url(#sm-land)" fill="none" stroke="${T.cyan}" stroke-width="2" />
    <!-- Landmarks and routes as thin lines. -->
    <path d="${d(S.COURSE)}" fill="none" stroke="#f7efc8" stroke-opacity="0.55" stroke-width="1" />
    <path d="M114 254V352" stroke="${T.muted}" stroke-opacity="0.6" stroke-dasharray="2 3" />
    <path d="M202 252V292M202 334V380" stroke="${T.line}" stroke-width="1.5" />
    <rect x="111" y="296" width="6" height="6" fill="${T.cyan}" />
    <text class="sm-sea" x="350" y="272" text-anchor="end">HARBOUR</text>
    <text class="sm-sea" x="10" y="512">MAINLAND</text>
    ${keys.map(plate).join('')}
  </svg>`;
}

function summary() {
  const rows = Object.entries(LIVE).map(([k, l]) => `<li class="sm-row">
      <span class="sm-row__tab" style="background:${TURF[k]}"></span>
      <span class="sm-row__name">${NAMES[k]}<span class="muted small"> · ${GANG[k]}</span></span>
      <span class="sm-heat">${[0, 1, 2].map((i) => `<i style="${i < l.heat ? `background:${heatCol(l.heat)};border-color:transparent` : ''}"></i>`).join('')}</span>
      <span class="sm-row__jobs">${l.jobs ? `<b>${l.jobs}</b> job` : '<span class="muted">—</span>'}</span></li>`).join('');
  return `
    <h2>The city tonight</h2>
    <ul class="list list--plain sm-rows">${rows}</ul>
    <h2>Your people</h2>
    <p class="small">2 on a job in the <strong>Docks</strong>, back Thursday. 3 at the safehouse.</p>
    <h2>Places</h2>
    <div class="sm-places"><button class="btn">Safehouse<span class="muted small">Old Town</span></button><button class="btn" disabled>Bar · black market<span class="muted small">later</span></button></div>`;
}

function dcard() {
  return `<div class="riskcard sm-card"><h2 class="nomargin">Docks <span class="muted small">碼頭 · Red Lantern turf</span></h2>
    <p class="small">Heat <span class="sm-heat sm-heat--inline"><i style="background:${T.red};border-color:transparent"></i><i style="background:${T.red};border-color:transparent"></i><i style="background:${T.red};border-color:transparent"></i></span> hot: jobs here draw more attention · 2 of yours on a job</p>
    <p class="talk-tag">Street talk: a Red Lantern boat came in light. Somebody is short a cargo.</p></div>`;
}

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>City map, schematic</title>
<link rel="stylesheet" href="../../src/ui/styles.css">
<style>
@font-face{font-family:Rajdhani;font-weight:500;src:url(../../node_modules/@fontsource/rajdhani/files/rajdhani-latin-500-normal.woff2) format('woff2')}
@font-face{font-family:Rajdhani;font-weight:600;src:url(../../node_modules/@fontsource/rajdhani/files/rajdhani-latin-600-normal.woff2) format('woff2')}
@font-face{font-family:Rajdhani;font-weight:700;src:url(../../node_modules/@fontsource/rajdhani/files/rajdhani-latin-700-normal.woff2) format('woff2')}
body{font-family:system-ui,sans-serif;padding:24px}
.wrap{max-width:1180px;margin:0 auto}
.note{color:var(--muted);max-width:820px}
.sm{display:block;width:100%;max-width:420px}
.sm text{font-family:var(--display)}
.sm-name{font-size:11px;font-weight:700;letter-spacing:.1em;fill:${T.text}}
.sm-plate.is-locked .sm-name{fill:${T.muted}}
.sm-sub{font-size:8px;font-weight:600;letter-spacing:.14em;fill:${T.muted}}
.sm-badge{font-size:8px;font-weight:700;letter-spacing:.08em;fill:${T.cyan};text-anchor:middle}
.sm-pin{font-size:8px;font-weight:700;letter-spacing:.12em}
.sm-sea{font-size:8px;font-weight:600;letter-spacing:.24em;fill:${T.muted};opacity:.6}
.citycols{display:grid;grid-template-columns:minmax(0,420px) 1fr;gap:24px;align-items:start}
.sm-rows{display:grid;gap:6px}
.sm-row{position:relative;display:grid;grid-template-columns:1fr auto 56px;gap:12px;align-items:center;padding:10px 12px;background:var(--panel-2);border:1px solid var(--line);min-height:44px;box-sizing:border-box}
.sm-row__tab{position:absolute;left:-1px;top:-1px;width:18px;height:2px}
.sm-row__name{font-family:var(--display);font-weight:700;letter-spacing:.06em;text-transform:uppercase}
.sm-row__jobs{text-align:right;font-family:var(--display);color:var(--accent-2)}
.sm-heat{display:inline-flex;gap:3px}.sm-heat i{width:8px;height:8px;border:1px solid var(--line);display:block}
.sm-heat--inline{vertical-align:middle;margin:0 4px}
.sm-places{display:grid;grid-template-columns:1fr 1fr;gap:8px}.sm-places .btn{display:grid;text-align:left;gap:2px;min-height:56px}
.sm-card{margin-top:12px}
.phone{width:390px}
@media (max-width:820px){.citycols{grid-template-columns:1fr}}
</style></head><body><div class="wrap">
<p class="note">City map built from the interface's own parts (2026-10-28), after the owner's note that the sketches felt off next to the UI. Loads the game's styles.css, so panels, headings, buttons and colours are the real ones. Same made-up night as the other sketches; the Docks are selected.</p>
<section class="panel" id="desk">
  <h1 class="cityhead">Lantern Bay <span class="muted">燈籠灣</span> <span class="muted small">2057</span></h1>
  <div class="subtabs" role="group"><button class="subtab is-on">Map</button><button class="subtab">Clients</button><button class="subtab">Who's who</button><button class="subtab">Lore</button></div>
  <div class="citycols"><div>${map()}${dcard()}</div><div>${summary()}</div></div>
</section>
<div class="phone" id="phone"><section class="panel">${map()}${dcard()}</section></div>
</div></body></html>`;

writeFileSync(new URL('../drafts/prototypes/city-map-schematic.html', import.meta.url), html);
console.log('wrote drafts/prototypes/city-map-schematic.html');
