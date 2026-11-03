// Where fights stand on a site (core/fightspots.js): every combination of a district's parts, each
// zone's crew spots (cyan) and guard spots (red), filled for full cover, ringed for half, dotted for
// open, with the anchors marked. A check by eye, next to tests/fightspots.test.js.
//
//   node scripts/preview-fightspots.mjs <district> <png>
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { allSites } from '../src/data/sites.js';
import { sitePlanSvg } from '../src/ui/siteplan.js';
import { fightSpots } from '../src/core/fightspots.js';

const [district = 'docks', out = 'fightspots.png'] = process.argv.slice(2);
const dot = (s, color) => `<circle cx="${s.at[0]}" cy="${s.at[1]}" r="4.5" fill="${s.cover === 'full' ? color : 'none'}" stroke="${color}" stroke-width="1.4" ${s.cover === 'open' ? 'stroke-dasharray="1.5 1.5"' : ''}/>`;
const cells = [];
for (const { key, variant, site } of allSites().filter((x) => x.key === district)) {
  for (const zone of ['in', 'inside', 'target']) {
    const sp = fightSpots(site, zone);
    const svg = sitePlanSvg({ site }).replace('<g class="sp-fx"></g>', `<g>${sp ? [...sp.crew.map((s) => dot(s, '#3de8d8')), ...sp.guards.map((s) => dot(s, '#ff3d5f'))].join('') : ''}${sp ? `<circle cx="${sp.anchors.crew[0]}" cy="${sp.anchors.crew[1]}" r="2.5" fill="#fff"/><circle cx="${sp.anchors.guards[0]}" cy="${sp.anchors.guards[1]}" r="2.5" fill="#ff3d5f" stroke="#fff"/>` : ''}</g>`);
    cells.push(`<figure><figcaption>${variant} · ${zone}</figcaption>${svg}</figure>`);
  }
}
const css = readFileSync(new URL('../src/ui/styles.css', import.meta.url), 'utf8');
const html = `<!doctype html><meta charset="utf-8"><style>${css}</style><style>body{margin:0;background:#0a0c0f;color:#ccc;font:11px monospace;display:grid;grid-template-columns:repeat(3,360px);gap:6px;padding:6px}figure{margin:0}.siteplan{width:360px!important;height:240px!important}</style>${cells.join('')}`;
const { chromium } = createRequire(import.meta.url)('playwright');
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1110, height: 400 } });
await p.setContent(html);
await p.screenshot({ path: out, fullPage: true });
await b.close();
console.log(`${cells.length} maps → ${out}`);
