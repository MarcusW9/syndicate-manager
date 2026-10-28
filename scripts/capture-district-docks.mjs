// Captures drafts/prototypes/district-docks.html for the screenshot log (2026-10-28 design session).
// Run: node scripts/capture-district-docks.mjs <out dir>
import { chromium } from 'playwright';
const out = process.argv[2];
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1180, height: 900 }, deviceScaleFactor: 2 });
await p.goto(new URL('../drafts/prototypes/district-docks.html', import.meta.url).href);
await p.locator('#full svg').screenshot({ path: `${out}/08-docks-full.png` });
await p.setViewportSize({ width: 420, height: 900 });
await p.locator('#card .dcard').screenshot({ path: `${out}/09-docks-card-phone.png` });
await b.close();
