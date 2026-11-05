// The halls' maps (data/sites.js HALLS; raids, 2026-11-05), each with its fight spots for a raid:
// our people's (cyan) by the way out and the raiders' (red) by their way in, filled for full cover,
// ringed for half, dotted for open. A check by eye, next to tests/hallmaps.test.js.
//
//   node scripts/preview-halls.mjs <png>
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { HALLS } from '../src/data/sites.js';
import { sitePlanSvg } from '../src/ui/siteplan.js';
import { fightSpots } from '../src/core/fightspots.js';
import { BATTLE } from '../src/data/battle.js';

const [out = 'halls.png'] = process.argv.slice(2);
const dot = (s, color) => `<circle cx="${s.at[0]}" cy="${s.at[1]}" r="4.5" fill="${s.cover === 'full' ? color : 'none'}" stroke="${color}" stroke-width="1.4" ${s.cover === 'open' ? 'stroke-dasharray="1.5 1.5"' : ''}/>`;
const cells = Object.entries(HALLS).map(([key, site]) => {
  const sp = fightSpots(site, 'inside', { crew: 6, guards: BATTLE.maxGuards });
  const marks = sp ? [...sp.crew.map((s) => dot(s, '#3de8d8')), ...sp.guards.map((s) => dot(s, '#ff3d5f'))].join('') : '';
  return `<figure><figcaption>${key} · ${site.name}</figcaption>${sitePlanSvg({ site }).replace('<g class="sp-fx"></g>', `<g>${marks}</g>`)}</figure>`;
});
const css = readFileSync(new URL('../src/ui/styles.css', import.meta.url), 'utf8');
const html = `<!doctype html><meta charset="utf-8"><style>${css}</style><style>body{margin:0;background:#0a0c0f;color:#ccc;font:11px monospace;display:grid;grid-template-columns:repeat(2,480px);gap:8px;padding:8px}figure{margin:0}.siteplan{width:480px!important;height:320px!important}</style>${cells.join('')}`;
const { chromium } = createRequire(import.meta.url)('playwright');
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 990, height: 400 }, deviceScaleFactor: 2 });
await p.setContent(html);
await p.screenshot({ path: out, fullPage: true });
await b.close();
console.log(`${cells.length} halls → ${out}`);
