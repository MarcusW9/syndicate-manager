// Where fights stand on a site (core/fightspots.js): every combination of a district's parts, each
// zone's crew spots (cyan) and guard spots (red), filled for full cover, ringed for half, dotted for
// open, with the anchors marked. A check by eye, next to tests/fightspots.test.js.
//
//   node scripts/preview-fightspots.mjs <district> <png>
import { createRequire } from 'node:module';
import { allSites } from '../src/data/sites.js';
import { sitePlanSvg } from '../src/ui/siteplan.js';
import { fightSpots, crewAnchor } from '../src/core/fightspots.js';

const [district = 'docks', out = 'fightspots.png'] = process.argv.slice(2);
const dot = (s, color) => `<circle cx="${s.at[0]}" cy="${s.at[1]}" r="4.5" fill="${s.cover === 'full' ? color : 'none'}" stroke="${color}" stroke-width="1.4" ${s.cover === 'open' ? 'stroke-dasharray="1.5 1.5"' : ''}/>`;
const cells = [];
for (const { key, variant, site } of allSites().filter((x) => x.key === district)) {
  for (const zone of ['in', 'inside', 'target']) {
    const sp = fightSpots(site, zone);
    const svg = sitePlanSvg({ site }).replace('<g class="sp-fx"></g>', `<g>${sp ? [...sp.crew.map((s) => dot(s, '#3de8d8')), ...sp.guards.map((s) => dot(s, '#ff3d5f'))].join('') : ''}<circle cx="${crewAnchor(site, zone)[0]}" cy="${crewAnchor(site, zone)[1]}" r="2" fill="#fff"/></g>`);
    cells.push(`<figure><figcaption>${variant} · ${zone}</figcaption>${svg}</figure>`);
  }
}
const html = `<!doctype html><meta charset="utf-8"><style>body{margin:0;background:#0a0c0f;color:#ccc;font:11px monospace;display:grid;grid-template-columns:repeat(3,360px);gap:6px;padding:6px}figure{margin:0}.siteplan{width:360px;height:240px}
.sp-road{fill:#12141a}.sp-water{fill:#0d1620}.sp-building{fill:#171b24;stroke:#4a5266}.sp-cover{stroke:#2b3240}.sp-desk{fill:#232838}.sp-fence{fill:none;stroke:#4a5266;stroke-dasharray:2 2}.sp-route{fill:none;stroke:#333;stroke-dasharray:2 3}.sp-label{fill:#6b7385;font:7px monospace}.sp-node{fill:#333}.sp-alarm{display:none}.sp-perch{stroke:#7a6430;stroke-width:2}</style>${cells.join('')}`;
const { chromium } = createRequire(import.meta.url)('playwright');
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1110, height: 400 } });
await p.setContent(html);
await p.screenshot({ path: out, fullPage: true });
await b.close();
console.log(`${cells.length} maps → ${out}`);
