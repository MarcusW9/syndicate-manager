// Captures drafts/prototypes/city-map-schematic.html for the screenshot log (2026-10-28 design session).
// Run: node scripts/capture-city-map-schematic.mjs <out dir>
import { chromium } from 'playwright';
const out = process.argv[2];
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 1000 }, deviceScaleFactor: 2 });
await p.goto(new URL('../drafts/prototypes/city-map-schematic.html', import.meta.url).href);
await p.evaluate(() => document.fonts.ready);
await p.locator('#desk').screenshot({ path: `${out}/10-schematic-desktop.png` });
await p.locator('#phone').screenshot({ path: `${out}/11-schematic-phone.png` });
await b.close();
