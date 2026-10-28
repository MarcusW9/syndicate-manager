// Captures drafts/prototypes/city-map-options.html for the screenshot log (2026-10-28 design session).
// Run: node scripts/capture-city-map-options.mjs <out dir> <absolute path to the html>
import { chromium } from 'playwright';
const out = process.argv[2]; const file = process.argv[3];
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1180, height: 900 }, deviceScaleFactor: 2 });
await p.goto('file://' + file);
for (const [id, name] of [['optA', '02-option-a-flat-lit'], ['optB', '03-option-b-slanted-3d'], ['optC', '04-option-c-district-pictures']]) await p.locator('#' + id).screenshot({ path: `${out}/${name}.png` });
await p.setViewportSize({ width: 390, height: 844 });
await p.locator('#optA svg').screenshot({ path: `${out}/05-option-a-phone.png` });
await p.locator('#optB svg').screenshot({ path: `${out}/06-option-b-phone.png` });
await b.close();
