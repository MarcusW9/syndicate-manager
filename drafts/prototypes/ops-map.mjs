// Built drafts/prototypes/ops-map.html, the Ops map mock-up the owner approved (2026-11-07): smaller
// labels, a frame, zoom, Tonight. Written against the map before that change (plates in the SVG), so
// re-running it now gives a different page; the HTML is the record. Run: node drafts/prototypes/ops-map.mjs
import { writeFileSync, readFileSync } from 'node:fs';
import { cityMapSvg, MAP_DISTRICTS } from '../../src/ui/citymap.js';
import { landmark } from '../../src/ui/landmarks.js';
import { portrait } from '../../src/ui/art.js';
import { DISTRICT_CARDS } from '../../src/data/city.js';
import { createNewGame } from '../../src/core/state.js';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const TURF = { oldTown: '#f2d541', docks: '#ff3d5f', nightMarket: '#b48cff', heights: '#3de8d8', basin: '#ff9a3d' };
const FACTION = { oldTown: 'Brass Anchor', docks: 'Red Lantern', nightMarket: 'Silver Fan', heights: 'Veridian-Apex', basin: 'Racing Association' };
const NAME = { oldTown: 'Old Town', docks: 'Docks', nightMarket: 'Night Market', heights: 'Glass Heights', basin: 'Basin', amberReach: 'Amber Reach', silt: 'Silt', ironPeak: 'Iron Peak' };

// A plausible evening: home hall in Old Town (8 there), two out in the Night Market, three jobs on the
// Docks and a warm district there, talk about the Basin.
const crew = createNewGame({ seed: 12, startCrew: 'classic' }).crew;
const STATE = {
  oldTown: { home: true, based: 8, jobs: 1, heat: 0 },
  nightMarket: { jobs: 0, heat: 2, crews: [{ ops: crew.slice(0, 2), from: 'oldTown', call: false }] },
  docks: { jobs: 3, heat: 4 },
  basin: { jobs: 1, heat: 0, talk: true },
  heights: { jobs: 0, heat: 0 },
};

const districts = (selected) => MAP_DISTRICTS.map((key) => {
  const card = DISTRICT_CARDS[key];
  const s = STATE[key] ?? {};
  return { key, locked: !!card.locked, selected: selected === key, name: NAME[key], label: NAME[key], turf: TURF[key] ?? null, jobs: s.jobs ?? 0, home: !!s.home, hall: false, based: s.based ?? null, heat: s.heat ?? 0, talk: !!s.talk, crews: s.crews ?? [] };
});

// Plate spots and shape bounds, read off the map's own source.
const src = readFileSync(new URL('../../src/ui/citymap.js', import.meta.url), 'utf8');
const GEO = {};
for (const m of src.matchAll(/(\w+): \{ shape: '([^']+)', plate: \[(\d+), (\d+)\] \}/g)) {
  const pts = [...m[2].matchAll(/(\d+(?:\.\d+)?) (\d+(?:\.\d+)?)/g)].map((p) => [+p[1], +p[2]]);
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  const cx = xs.reduce((a, b) => a + b, 0) / xs.length, cy = ys.reduce((a, b) => a + b, 0) / ys.length;
  GEO[m[1]] = { plate: [+m[3], +m[4]], box: [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)], mid: [cx, cy] };
}

// The landmark drawn on the map itself, shown only when zoomed into its district (below its label).
const LM_SPOT = { oldTown: [96, 128], nightMarket: [272, 126], docks: [56, 290], basin: [186, 100], heights: [288, 96], amberReach: [190, 212], silt: [312, 292], ironPeak: [210, 56] };
const mapLandmarks = MAP_DISTRICTS.map((k) => `<g class="pz-lm" data-for="${k}">${landmark(k, { x: LM_SPOT[k][0], y: LM_SPOT[k][1], size: 34, light: TURF[k] ?? '#3de8d8', locked: !!DISTRICT_CARDS[k].locked })}</g>`).join('');

const icon = (k) => `<svg class="pz-ico" viewBox="0 0 48 44" aria-hidden="true">${landmark(k, { x: 24, y: 44, size: 48, light: TURF[k] ?? '#3de8d8', locked: !!DISTRICT_CARDS[k].locked })}</svg>`;
const ICONS = Object.fromEntries(MAP_DISTRICTS.map((k) => [k, icon(k)]));

const svgFor = (selected) => { const m = cityMapSvg(districts(selected), esc, { portrait }); const i = m.lastIndexOf('</svg>'); return `${m.slice(0, i)}<g class="pz-lms">${mapLandmarks}</g>${m.slice(i)}`; };
const CARDS = Object.fromEntries(MAP_DISTRICTS.map((k) => [k, { name: DISTRICT_CARDS[k].name ?? NAME[k], chinese: DISTRICT_CARDS[k].chinese, side: DISTRICT_CARDS[k].side, pitch: DISTRICT_CARDS[k].pitch, locked: !!DISTRICT_CARDS[k].locked }]));
const css = readFileSync(new URL('../../src/ui/styles.css', import.meta.url), 'utf8').split('\n').slice(558, 611).join('\n');

const DATA = { geo: GEO, state: STATE, names: NAME, turf: TURF, faction: FACTION, cards: CARDS, icons: ICONS, svg: svgFor(null), crewNames: crew.slice(0, 2).map((o) => o.handle) };

writeFileSync(new URL('./ops-map.html', import.meta.url), `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Ops map: smaller labels, a frame, zoom, Tonight</title>
<link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&display=swap" rel="stylesheet">
<style>
:root { --bg:#0a0c0f; --panel:#12151b; --panel-2:#161a21; --line:#2a303b; --text:#e9ecf1; --muted:#8a93a6; --accent:#ff3d5f; --accent-2:#3de8d8; --warn:#f2d541; --danger:#ff4a4a; --display:'Rajdhani','Arial Narrow',system-ui,sans-serif; --tap:44px; }
* { box-sizing: border-box; }
body { margin: 0; background: var(--bg) linear-gradient(rgba(61,232,216,.025) 1px, transparent 1px) 0 0/32px 32px; color: var(--text); font: 15px/1.45 system-ui, sans-serif; padding: 20px; }
h1 { font: 700 1.5rem var(--display); letter-spacing: .06em; margin: 0 0 4px; }
.intro { color: var(--muted); max-width: 78ch; margin: 0 0 14px; font-size: .9rem; }
.intro b { color: var(--text); font-weight: 600; }
.ctl { display: flex; flex-wrap: wrap; gap: 8px 18px; align-items: center; margin: 0 0 16px; font: 600 .75rem var(--display); letter-spacing: .12em; text-transform: uppercase; color: var(--muted); }
.ctl span { margin-right: 4px; }
.ctl button { min-height: 36px; padding: 0 12px; background: none; border: 1px solid var(--line); color: var(--muted); font: inherit; letter-spacing: .1em; cursor: pointer; }
.ctl button.on { border-color: var(--accent-2); color: var(--accent-2); }
.stage { margin: 0 auto 0 0; transition: width .2s; }
.stage.desk { width: 1280px; } .stage.phone { width: 390px; }
.panel { background: linear-gradient(var(--panel-2), var(--panel)); border: 1px solid var(--line); padding: 16px; position: relative; clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%); }
.panel::before { content: ''; position: absolute; top: -1px; left: 16px; width: 36px; height: 2px; background: var(--accent-2); }
.opshead { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.opshead h2 { margin: 0; font: 700 1.6rem var(--display); letter-spacing: .04em; } .opshead small { color: var(--muted); font: 600 .75rem var(--display); letter-spacing: .14em; margin-left: 8px; }
.rank { border: 1px solid var(--warn); color: var(--warn); padding: 4px 10px; font: 700 .75rem var(--display); letter-spacing: .12em; }
.ops { display: grid; gap: 20px; }
.desk .ops { grid-template-columns: minmax(0, 60fr) minmax(340px, 40fr); align-items: start; }
h3 { font: 700 .85rem var(--display); letter-spacing: .16em; text-transform: uppercase; color: var(--accent-2); margin: 18px 0 8px; display: flex; align-items: center; gap: 10px; }
h3::after { content: ''; flex: 1; height: 1px; background: var(--line); }
.muted { color: var(--muted); } .small { font-size: .85rem; }
${css}
.citymap { max-height: none; margin: 0; width: 100%; height: 100%; }

/* --- Proposed: the map's frame --- */
.mapframe { position: relative; border: 1px solid #343b48; background: rgba(6,8,11,.55); padding: 8px 8px 0; }
.mapframe::before, .mapframe::after, .mapframe > .c1, .mapframe > .c2 { content: ''; position: absolute; width: 12px; height: 12px; border: 0 solid rgba(61,232,216,.7); pointer-events: none; }
.mapframe::before { top: -1px; left: -1px; border-width: 2px 0 0 2px; } .mapframe::after { top: -1px; right: -1px; border-width: 2px 2px 0 0; }
.mapframe > .c1 { bottom: -1px; left: -1px; border-width: 0 0 2px 2px; } .mapframe > .c2 { bottom: -1px; right: -1px; border-width: 0 2px 2px 0; }
.mapframe .citymap__legend { margin: 6px 2px 8px; }
.mapframe__ref { position: absolute; top: 8px; right: 12px; font: 600 .65rem var(--display); letter-spacing: .2em; color: #4a5262; pointer-events: none; z-index: 3; }
.mapview { position: relative; aspect-ratio: 330 / 290; overflow: hidden; }
.now .mapframe { border: 0; background: none; padding: 0; } .now .mapframe::before, .now .mapframe::after, .now .mapframe > .c1, .now .mapframe > .c2, .now .mapframe__ref { display: none; }

/* --- Proposed: labels at a fixed screen size, in HTML over the map --- */
.pz .cm-plate { display: none; }
.labels { position: absolute; inset: 0; pointer-events: none; }
.lbl { position: absolute; transform: translate(-50%, -50%); pointer-events: auto; cursor: pointer; display: flex; align-items: center; gap: 6px; min-height: 30px; padding: 4px 8px 4px 6px; background: rgba(10,12,15,.86); border: 1px solid var(--line); font-family: var(--display); white-space: nowrap; transition: opacity .25s; }
.lbl::before { content: ''; position: absolute; top: -1px; left: -1px; width: 14px; height: 2px; background: var(--turf, var(--line)); }
.lbl.on { border-color: var(--accent-2); box-shadow: 0 0 12px rgba(61,232,216,.25); }
.lbl__t { display: grid; line-height: 1.05; }
.lbl__n { font-weight: 700; font-size: 12px; letter-spacing: .12em; text-transform: uppercase; }
.lbl__s { font-weight: 600; font-size: 10.5px; letter-spacing: .08em; text-transform: uppercase; color: var(--muted); }
.lbl__s .warm { color: #ff9a3d; } .lbl__s .hot { color: var(--danger); }
.desk .lbl__n { font-size: 13px; } .desk .lbl__s { font-size: 11px; }
.lbl.locked { min-height: 22px; padding: 2px 7px; background: rgba(10,12,15,.7); } .lbl.locked .lbl__n { font-size: 10px; color: var(--muted); } .lbl.locked::before { display: none; }
.lbl .pz-ico { width: 24px; height: 22px; flex: none; }
.lbl::after { content: ''; position: absolute; inset: -8px; } /* the tap target: 44px+ */
.zoomed .lbl:not(.on) { opacity: .35; }
.pz-lm { opacity: 0; transition: opacity .35s; pointer-events: none; }
.pz-lm.show { opacity: 1; }
.cm-d { transition: opacity .35s; }
.zoomed .cm-d:not(.is-selected) { opacity: .6; }
.maprow { display: flex; align-items: center; gap: 12px; min-height: 52px; }
.maprow .citymap__legend { margin: 0 2px; }
.zoomed .maprow .citymap__legend { display: none; }
.zoombtn { min-height: 44px; margin: 4px 0; padding: 0 14px 0 10px; display: none; align-items: center; gap: 8px; background: rgba(10,12,15,.92); border: 1px solid var(--accent-2); color: var(--accent-2); font: 700 .8rem var(--display); letter-spacing: .14em; text-transform: uppercase; cursor: pointer; clip-path: polygon(0 0, 100% 0, 100% calc(100% - 7px), calc(100% - 7px) 100%, 0 100%); }
.zoombtn b { font-size: 1.2rem; line-height: 1; }
.zoomed .zoombtn { display: inline-flex; }

/* --- Side column --- */
.card { border: 1px solid var(--line); padding: 14px; position: relative; background: var(--panel); }
.card::before { content: ''; position: absolute; top: -1px; left: -1px; width: 28px; height: 2px; background: var(--turf, var(--line)); }
.card h4 { margin: 0; font: 700 1.05rem var(--display); letter-spacing: .14em; text-transform: uppercase; color: var(--accent-2); display: flex; gap: 10px; align-items: center; }
.card h4 .pz-ico { width: 34px; height: 31px; }
.card p { margin: 6px 0 0; }
.card .go { display: inline-block; margin-top: 10px; color: var(--accent-2); font-weight: 600; }
.tonight { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; }
.trow { width: 100%; min-height: 48px; display: flex; align-items: center; gap: 10px; padding: 6px 12px; background: var(--panel-2); border: 1px solid var(--line); color: var(--text); text-align: left; cursor: pointer; font: inherit; position: relative; clip-path: polygon(0 0, 100% 0, 100% calc(100% - 7px), calc(100% - 7px) 100%, 0 100%); }
.trow::before { content: ''; position: absolute; top: -1px; left: -1px; width: 16px; height: 2px; background: var(--turf); }
.trow .pz-ico { width: 26px; height: 24px; flex: none; }
.trow__what { flex: 1; display: grid; }
.trow__d { font: 700 .8rem var(--display); letter-spacing: .14em; text-transform: uppercase; color: var(--muted); }
.trow__x { font-size: .95rem; }
.trow__go { color: var(--accent-2); font: 700 .78rem var(--display); letter-spacing: .12em; text-transform: uppercase; white-space: nowrap; }
.trow.call { border-color: var(--warn); } .trow.call .trow__go { color: var(--warn); }
.oldrows { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
.oldrow { min-height: 52px; display: flex; align-items: center; padding: 0 16px; border: 1px solid var(--line); position: relative; background: var(--panel-2); }
.oldrow.on { border-color: var(--accent-2); }
.oldrow::before { content: ''; position: absolute; top: -1px; left: -1px; width: 22px; height: 2px; background: var(--turf); }
.oldrow b { font: 700 .95rem var(--display); letter-spacing: .1em; text-transform: uppercase; } .oldrow small { color: var(--muted); font: 600 .75rem var(--display); letter-spacing: .12em; text-transform: uppercase; margin-left: 6px; }
.oldrow .r { margin-left: auto; color: var(--muted); }
.toast { position: fixed; bottom: 18px; left: 50%; transform: translateX(-50%); background: #0d1016; border: 1px solid var(--accent-2); color: var(--text); padding: 10px 16px; font-size: .9rem; opacity: 0; transition: opacity .2s; pointer-events: none; max-width: 90vw; }
.toast.show { opacity: 1; }
.notes { max-width: 80ch; color: var(--muted); font-size: .9rem; margin-top: 22px; }
.notes li { margin: 4px 0; } .notes b { color: var(--text); font-weight: 600; }
@media (prefers-reduced-motion: reduce) { .lbl, .pz-lm, .cm-d { transition: none; } }
</style></head><body>
<h1>Ops map: proposed</h1>
<p class="intro">A mock-up for the owner, built with the game's own map, landmark and portrait code. <b>Tap a district</b> to zoom in on it; <b>× Whole city</b>, Esc, or a tap on the harbour zooms back out. Use the switches to compare with how it is now, at computer or phone width, and to try the landmark icons on more or fewer labels.</p>
<div class="ctl">
  <span>Width</span><button data-w="desk" class="on">Computer · 1280</button><button data-w="phone">Phone · 390</button>
  <span style="margin-left:12px">Version</span><button data-v="pz" class="on">Proposed</button><button data-v="now">Now</button>
  <span style="margin-left:12px">Icons on labels</span><button data-i="some" class="on">Halls + picked</button><button data-i="all">All open</button><button data-i="none">None</button>
</div>
<div class="stage desk pz" id="stage">
  <section class="panel">
    <div class="opshead"><div><h2 style="display:inline">OPS</h2><small>LANTERN BAY TONIGHT</small></div><span class="rank">BACK ROOM TONG</span></div>
    <div class="ops">
      <div>
        <div class="mapframe" id="frame"><i class="c1"></i><i class="c2"></i><span class="mapframe__ref">LANTERN BAY</span>
          <div class="mapview" id="view">
            <div id="map"></div>
            <div class="labels" id="labels"></div>
          </div>
          <div class="maprow"><button class="zoombtn" id="zoomout"><b>×</b> Whole city</button><div class="citymap__legend"><span><i class="is-crew"></i>Crew</span><span><i class="is-call"></i>Calling</span><span><i class="is-raid"></i>Raid warned</span><span><b>⌂</b> Hall</span></div></div>
        </div>
      </div>
      <div id="side"></div>
    </div>
  </section>
</div>
<ul class="notes">
  <li><b>Labels</b> are HTML over the map now, so they stay 12px (the name) and 10.5px (the line under it) at any map size. Before, they were SVG text that grew with the map: about 33px on a computer. "HEAT 0" is gone; heat shows from 1, amber from 3, red from 6 (the glow still shows it too).</li>
  <li><b>The frame</b>: a 1px outline a step lighter than the panel's border, cyan corner brackets, a slightly darker ground, and the legend inside it. The map reads as an object on the panel instead of melting into it.</li>
  <li><b>Zoom</b>: tapping a district eases the map onto it (0.45s; instant with reduced motion), dims the rest, and shows its landmark on the map. The district card beside it (under it on a phone) is the same card as now. Only taps: no pinch, no drag, so the map never scrolls under a thumb.</li>
  <li><b>Tonight</b> lists only what's worth a tap, and each row goes somewhere the map doesn't (in the game: the crew's card, the job board on those jobs, the rumour). Quiet districts aren't listed. Tapping a row here just shows where it would go.</li>
</ul>
<div class="toast" id="toast"></div>
<script>
const D = ${JSON.stringify(DATA)};
const FULL = [14, 12, 330, 290];
let vb = FULL.slice(), picked = 'heights', zoomed = false, iconMode = 'some', version = 'pz';
const stage = document.getElementById('stage'), mapEl = document.getElementById('map'), labelsEl = document.getElementById('labels'), view = document.getElementById('view');
mapEl.innerHTML = D.svg;
const svg = mapEl.querySelector('svg');
const open = (k) => !D.cards[k].locked;
const st = (k) => D.state[k] || {};

function heatSpan(h) { return h ? '<span class="' + (h >= 6 ? 'hot' : h >= 3 ? 'warm' : '') + '">HEAT ' + h + '</span>' : ''; }
function subLine(k) {
  const s = st(k);
  return [s.home ? '⌂ ' + s.based + ' HERE' : '', s.jobs ? s.jobs + ' JOB' + (s.jobs === 1 ? '' : 'S') : '', heatSpan(s.heat || 0)].filter(Boolean).join(' · ');
}
function showIcon(k) { return iconMode === 'all' ? open(k) : iconMode === 'some' ? open(k) && (st(k).home || st(k).hall || k === picked) : false; }

function drawLabels() {
  labelsEl.innerHTML = Object.keys(D.geo).map((k) => {
    const sub = open(k) ? subLine(k) : '';
    return '<div class="lbl ' + (open(k) ? '' : 'locked ') + (k === picked ? 'on' : '') + '" data-k="' + k + '" style="--turf:' + (D.turf[k] || 'var(--line)') + '">' +
      (showIcon(k) ? D.icons[k] : '') + '<span class="lbl__t"><span class="lbl__n">' + D.names[k] + '</span>' + (sub ? '<span class="lbl__s">' + sub + '</span>' : '') + '</span></div>';
  }).join('');
  placeLabels();
}
function placeLabels() {
  const W = view.clientWidth, H = view.clientHeight;
  for (const el of labelsEl.children) {
    const [x, y] = D.geo[el.dataset.k].plate;
    el.style.left = ((x - vb[0]) / vb[2] * W) + 'px';
    el.style.top = ((y - vb[1]) / vb[3] * H) + 'px';
  }
}
function setVB(v) { vb = v; svg.setAttribute('viewBox', v.map((n) => n.toFixed(2)).join(' ')); placeLabels(); }
function boxFor(k) {
  let [x1, y1, x2, y2] = D.geo[k].box;
  const pad = 18; x1 -= pad; y1 -= pad; x2 += pad; y2 += pad;
  let w = x2 - x1, h = y2 - y1;
  const ar = FULL[2] / FULL[3];
  if (w / h < ar) { const nw = h * ar; x1 -= (nw - w) / 2; w = nw; } else { const nh = w / ar; y1 -= (nh - h) / 2; h = nh; }
  if (w < 175) { const s = 175 / w; x1 -= (w * s - w) / 2; y1 -= (h * s - h) / 2; w *= s; h *= s; }
  x1 = Math.max(FULL[0], Math.min(x1, FULL[0] + FULL[2] - w));
  y1 = Math.max(FULL[1], Math.min(y1, FULL[1] + FULL[3] - h));
  return [x1, y1, w, h];
}
let anim = 0;
function animateTo(target) {
  cancelAnimationFrame(anim);
  const from = vb.slice(), t0 = performance.now(), dur = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 450;
  const ease = (t) => 1 - Math.pow(1 - t, 3);
  const step = (now) => {
    const t = dur ? Math.min(1, (now - t0) / dur) : 1;
    setVB(from.map((a, i) => a + (target[i] - a) * ease(t)));
    if (t < 1) anim = requestAnimationFrame(step);
  };
  anim = requestAnimationFrame(step);
}
function pick(k, zoom = true) {
  picked = k;
  svg.querySelectorAll('.cm-d').forEach((g) => g.classList.toggle('is-selected', g.dataset.id === k));
  if (version === 'pz' && zoom) {
    zoomed = true; stage.classList.add('zoomed');
    svg.querySelectorAll('.pz-lm').forEach((g) => g.classList.toggle('show', g.dataset.for === k));
    animateTo(boxFor(k));
  }
  drawLabels(); drawSide();
}
function zoomOut() {
  zoomed = false; stage.classList.remove('zoomed');
  svg.querySelectorAll('.pz-lm').forEach((g) => g.classList.remove('show'));
  animateTo(FULL);
}
function toast(t) { const el = document.getElementById('toast'); el.textContent = t; el.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove('show'), 2200); }

function card(k) {
  const c = D.cards[k], s = st(k);
  const where = [c.side, D.faction[k] ? '<span style="color:var(--accent-2)">' + D.faction[k] + ' ground</span>' : '', s.home ? 'our home hall' : '', s.heat ? 'heat ' + s.heat + '/10' : ''].filter(Boolean).join(' · ');
  const work = c.locked ? '<p class="small muted">Locked for now.</p>' : s.jobs ? '<p class="small">' + s.jobs + ' job' + (s.jobs === 1 ? '' : 's') + ' on the board here.</p>' : '<p class="small muted">No work on the board here right now. New work comes in through the week.</p>';
  return '<div class="card" style="--turf:' + (D.turf[k] || 'var(--line)') + '"><h4>' + (version === 'pz' ? D.icons[k] : '') + D.names[k] + ' <span class="muted" style="letter-spacing:0">' + c.chinese + '</span></h4><p class="small muted">' + where + '</p><p>' + c.pitch + '</p>' + work + '<a class="go small">About ' + D.names[k] + ' on Lore ›</a></div>';
}
const TONIGHT = [
  { k: 'nightMarket', what: '2 out: ' + D.crewNames.join(' and ') + ', day 2 of 3', go: 'Crew ›', to: 'Opens their crew-out card (Out now).' },
  { k: 'docks', what: '3 jobs on the board · heat 4', go: 'Jobs ›', to: 'Opens the job board on the Docks jobs.' },
  { k: 'basin', what: 'Street talk: a fixed race on Saturday', go: 'Talk ›', to: 'Opens the rumour in the inbox.' },
  { k: 'oldTown', what: '1 job on the board', go: 'Jobs ›', to: 'Opens the job board on the Old Town job.' },
];
function drawSide() {
  const side = document.getElementById('side');
  if (version === 'now') {
    side.innerHTML = card(picked) + '<h3>Out now</h3><p class="small muted">2 of yours out in the Night Market.</p><h3>The city tonight</h3><ul class="oldrows">' +
      ['heights', 'basin', 'oldTown', 'nightMarket', 'docks'].map((k) => '<li class="oldrow ' + (k === picked ? 'on' : '') + '" data-k="' + k + '" style="--turf:' + D.turf[k] + '"><b>' + D.names[k] + '</b><small>· ' + D.faction[k] + '</small><span class="r">' + (st(k).jobs ? '<b style="font-size:.9rem">' + st(k).jobs + '</b> job' + (st(k).jobs === 1 ? '' : 's') : '—') + '</span></li>').join('') + '</ul>';
    return;
  }
  side.innerHTML = card(picked) + '<h3>Tonight</h3><ul class="tonight">' + TONIGHT.map((r, i) => '<li><button class="trow" data-row="' + i + '" style="--turf:' + D.turf[r.k] + '">' + D.icons[r.k] + '<span class="trow__what"><span class="trow__d">' + D.names[r.k] + '</span><span class="trow__x">' + r.what + '</span></span><span class="trow__go">' + r.go + '</span></button></li>').join('') +
    '</ul><p class="small muted" style="margin-top:12px">At home: 8 in Old Town · 2 out. Glass Heights and the Basin are quiet.</p>';
}

svg.addEventListener('click', (e) => {
  const d = e.target.closest('[data-action="city-district"]');
  if (d) return pick(d.dataset.id);
  if (zoomed) zoomOut();
});
labelsEl.addEventListener('click', (e) => { const l = e.target.closest('.lbl'); if (l) pick(l.dataset.k, version === 'pz'); });
document.getElementById('zoomout').addEventListener('click', zoomOut);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && zoomed) zoomOut(); });
document.getElementById('side').addEventListener('click', (e) => {
  const r = e.target.closest('.trow'); if (r) return toast(TONIGHT[r.dataset.row].to);
  const o = e.target.closest('.oldrow'); if (o) pick(o.dataset.k, false);
});
document.querySelectorAll('.ctl button').forEach((b) => b.addEventListener('click', () => {
  const grp = b.dataset.w ? 'w' : b.dataset.v ? 'v' : 'i';
  document.querySelectorAll('.ctl button[data-' + grp + ']').forEach((x) => x.classList.toggle('on', x === b));
  if (grp === 'w') { stage.classList.remove('desk', 'phone'); stage.classList.add(b.dataset.w); }
  if (grp === 'v') { version = b.dataset.v; stage.classList.toggle('pz', version === 'pz'); stage.classList.toggle('now', version === 'now'); if (zoomed) zoomOut(); }
  if (grp === 'i') iconMode = b.dataset.i;
  requestAnimationFrame(() => { drawLabels(); drawSide(); });
}));
new ResizeObserver(placeLabels).observe(view);
pick('heights', false);
// ?w=phone&v=now&zoom=docks for screenshots
const q = new URLSearchParams(location.search);
if (q.get('w')) document.querySelector('[data-w="' + q.get('w') + '"]').click();
if (q.get('v')) document.querySelector('[data-v="' + q.get('v') + '"]').click();
if (q.get('i')) document.querySelector('[data-i="' + q.get('i') + '"]').click();
if (q.get('zoom')) setTimeout(() => pick(q.get('zoom')), 50);
</script>
</body></html>`);
console.log('wrote drafts/prototypes/ops-map.html');
