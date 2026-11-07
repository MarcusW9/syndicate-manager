// Builds drafts/prototypes/path-styles.html: the real site plans (data/sites.js) with the crew's
// route drawn four ways, so the owner can pick one (playtest, 2026-11-07).
// node drafts/prototypes/path-styles.mjs
import { writeFileSync, readFileSync } from 'node:fs';
import { sitePlanSvg } from '../../src/ui/siteplan.js';
import { SITES } from '../../src/data/sites.js';

// Every diagonal leg becomes an L: keep going the way we were heading, then turn once.
export function orthogonal(points) {
  const out = [points[0]];
  let dir = null; // 'h' or 'v'
  for (let i = 1; i < points.length; i++) {
    const [ax, ay] = out.at(-1); const [bx, by] = points[i];
    if (ax === bx && ay === by) continue;
    if (ax === bx || ay === by) { out.push([bx, by]); dir = ax === bx ? 'v' : 'h'; continue; }
    const first = dir ?? (Math.abs(bx - ax) >= Math.abs(by - ay) ? 'h' : 'v');
    out.push(first === 'h' ? [bx, ay] : [ax, by], [bx, by]);
    dir = first === 'h' ? 'v' : 'h';
  }
  // drop points in the middle of a straight run
  return out.filter((p, i) => i === 0 || i === out.length - 1
    || !((out[i - 1][0] === p[0] && p[0] === out[i + 1][0]) || (out[i - 1][1] === p[1] && p[1] === out[i + 1][1])));
}

// A path through the points with each corner turned: 'round' (a fillet) or 'cut' (a 45° chamfer).
function cornered(points, r, kind) {
  let d = `M${points[0][0]} ${points[0][1]}`;
  for (let i = 1; i < points.length - 1; i++) {
    const [px, py] = points[i - 1]; const [x, y] = points[i]; const [nx, ny] = points[i + 1];
    const l1 = Math.hypot(x - px, y - py); const l2 = Math.hypot(nx - x, ny - y);
    const k = Math.min(r, l1 / 2, l2 / 2);
    const a = [x - ((x - px) / l1) * k, y - ((y - py) / l1) * k];
    const b = [x + ((nx - x) / l2) * k, y + ((ny - y) / l2) * k];
    d += ` L${a[0]} ${a[1]}` + (kind === 'round' ? ` Q${x} ${y} ${b[0]} ${b[1]}` : ` L${b[0]} ${b[1]}`);
  }
  const e = points.at(-1);
  return `${d} L${e[0]} ${e[1]}`;
}

const route = (site) => [...site.paths.in, ...site.paths.inside.slice(1), ...site.paths.target.slice(1)];
const STYLES = [
  { id: 'a', name: 'A · Now', note: 'Straight lines between the points, diagonals and all.', d: (p) => cornered(p, 0, 'cut') },
  { id: 'b', name: 'B · Grid, rounded', note: 'Your sketch: only across and up/down, corners rounded.', d: (p) => cornered(orthogonal(p), 9, 'round') },
  { id: 'c', name: 'C · Grid, cut corners', note: 'Across and up/down, corners cut at 45°, like the panels.', d: (p) => cornered(orthogonal(p), 7, 'cut') },
  { id: 'd', name: 'D · Grid, tight round', note: 'Like B with small corners: crisper, more blueprint.', d: (p) => cornered(orthogonal(p), 4, 'round') },
];

const css = readFileSync(new URL('../../src/ui/styles.css', import.meta.url), 'utf8');
const spCss = css.split('\n').filter((l) => /^\.(sp-|siteplan)/.test(l)).join('\n');
const sites = ['oldTown', 'generic', 'nightMarket', 'heights', 'basin', 'docks'];

const card = (key, st) => {
  const site = SITES[key];
  const svg = sitePlanSvg({ site }).replace(/<polyline class="sp-route"[^>]*\/>/, `<path class="sp-route" d="${st.d(route(site))}"/>`);
  return `<figure><figcaption>${key}</figcaption>${svg}</figure>`;
};

const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Path styles on the site plan</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Inter:wght@400;600&display=swap" rel="stylesheet">
<style>
:root { --accent: #ff3d5f; --accent-2: #3de8d8; --line: #2a3140; --muted: #8a93a6; --display: 'Rajdhani', sans-serif; }
body { margin: 0; background: #0d0f14; color: #e6e9ef; font: 15px/1.45 Inter, system-ui, sans-serif; padding: 20px; }
h1, h2 { font-family: var(--display); letter-spacing: 0.08em; text-transform: uppercase; margin: 0 0 6px; }
h1 { font-size: 1.6rem; } h2 { font-size: 1.2rem; color: var(--accent-2); }
p { color: var(--muted); margin: 0 0 14px; max-width: 70ch; }
.bar { position: sticky; top: 0; z-index: 2; background: #0d0f14; padding: 10px 0; display: flex; gap: 18px; flex-wrap: wrap; border-bottom: 1px solid var(--line); margin-bottom: 18px; }
.bar label { display: flex; align-items: center; gap: 8px; min-height: 44px; cursor: pointer; }
section { margin-bottom: 32px; padding: 16px; border: 1px solid var(--line); background: #13161d; clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%); }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 12px; }
figure { margin: 0; } figcaption { font: 700 0.75rem var(--display); letter-spacing: 0.14em; text-transform: uppercase; color: var(--muted); margin-bottom: 4px; }
svg.siteplan { width: 100%; height: auto; display: block; border: 1px solid var(--line); }
${spCss}
.siteplan .sp-route { opacity: 0.75; stroke-width: 2.4; }
body.glow .siteplan .sp-route { filter: drop-shadow(0 0 2px var(--accent-2)); }
body.flow .siteplan .sp-route { stroke-dasharray: 6 5; animation: flow 1.2s linear infinite; }
@keyframes flow { to { stroke-dashoffset: -11; } }
body.grid-on svg.siteplan { background-image: none; }
.gridlines { display: none; } body.grid-on .gridlines { display: inline; }
</style></head><body>
<h1>Path styles</h1>
<p>The crew's route on the real site plans, drawn four ways. The crew would walk the same way the line goes (no cutting corners). Pick a letter; the toggles below go with any of them.</p>
<div class="bar">
  <label><input type="checkbox" id="flow"> Flow animation (the line marches towards the target)</label>
  <label><input type="checkbox" id="glow" checked> Glow</label>
  <label><input type="checkbox" id="gridc"> Faint grid behind the map</label>
</div>
${STYLES.map((st) => `<section><h2>${st.name}</h2><p>${st.note}</p><div class="grid">${sites.map((k) => card(k, st)).join('')}</div></section>`).join('')}
<script>
const b = document.body; b.classList.add('glow');
for (const [id, cls] of [['flow', 'flow'], ['glow', 'glow'], ['gridc', 'grid-on']]) document.getElementById(id).onchange = (e) => b.classList.toggle(cls, e.target.checked);
// the faint grid: 12px squares under the shapes
for (const svg of document.querySelectorAll('svg.siteplan')) {
  const bg = svg.querySelector('rect');
  let lines = '';
  for (let x = 0; x <= 360; x += 12) lines += '<line x1="' + x + '" y1="0" x2="' + x + '" y2="240"/>';
  for (let y = 0; y <= 240; y += 12) lines += '<line x1="0" y1="' + y + '" x2="360" y2="' + y + '"/>';
  bg.insertAdjacentHTML('afterend', '<g class="gridlines" stroke="#1c2230" stroke-width="0.5">' + lines + '</g>');
}
</script></body></html>`;
writeFileSync(new URL('./path-styles.html', import.meta.url), html);
console.log('wrote path-styles.html');
