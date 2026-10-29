// Draw every site plan (each district's base and its variants) side by side, with the rifle's sight,
// for looking at layouts while authoring them (src/data/sites.js). Writes one PNG.
//
//   node scripts/preview-sites.mjs [district] [out.png]
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { allSites } from '../src/data/sites.js';
import { sitePlanSvg } from '../src/ui/siteplan.js';

const { chromium } = createRequire(import.meta.url)('playwright');
const only = process.argv[2] && process.argv[2] !== 'all' ? process.argv[2] : null;
const out = process.argv[3] ?? 'sites-preview.png';
const css = readFileSync(new URL('../src/ui/styles.css', import.meta.url), 'utf8');
const cells = allSites().filter((x) => !only || x.key === only).map(({ key, variant, site }) => `
  <figure><figcaption>${key} · ${variant}</figcaption>${sitePlanSvg({ kit: 'rifle', site })}</figure>`).join('');
const html = `<style>${css}
  body { margin: 12px; display: grid; grid-template-columns: repeat(auto-fill, minmax(420px, 1fr)); gap: 12px; background: #0a0c0f; }
  figure { margin: 0; } figcaption { color: #8a93a6; font: 12px monospace; margin-bottom: 4px; } .siteplan { width: 100%; height: auto; display: block; border: 1px solid #2a303b; }
</style>${cells}`;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1320, height: 800 } });
await page.setContent(html);
await page.screenshot({ path: out, fullPage: true });
await browser.close();
console.log('wrote', out);
