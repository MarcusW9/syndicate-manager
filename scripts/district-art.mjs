// The five district pictures side by side (2026-10-29), for the owner to judge and for the
// screenshot log. The pictures live in src/ui/districtArt.js. Writes
// drafts/prototypes/district-pictures.html; with an out dir, also captures each one there.
// Run: node scripts/district-art.mjs [out dir]
import { writeFileSync } from 'node:fs';
import { districtArt } from '../src/ui/districtArt.js';

const ORDER = [['docks', 'The Docks', 'Red Lantern'], ['oldTown', 'Old Town', 'Brass Anchor'], ['nightMarket', 'The Night Market', 'Silver Fan'], ['heights', 'Glass Heights', 'Veridian-Apex'], ['basin', 'The Basin', 'Racing Association']];
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>District pictures</title>
<style>
body{margin:0;background:#0a0c0f;color:#e9ecf1;font:15px/1.45 system-ui,sans-serif;padding:16px;max-width:1180px}
h1,h2{font-family:Rajdhani,'Arial Narrow',sans-serif;text-transform:uppercase;letter-spacing:.1em;margin:0 0 6px}h2{font-size:1rem;color:#3de8d8}
section{background:#12151b;border:1px solid #2a303b;padding:14px;margin:14px 0}
.scene{display:block;width:100%}
.da-neon{font-family:'Noto Sans CJK TC','Noto Sans TC','PingFang TC','Microsoft JhengHei','WenQuanYi Zen Hei',sans-serif;font-weight:700}
.da-stencil{font:700 6.5px Rajdhani,'Arial Narrow',sans-serif;letter-spacing:.12em;fill:#e9e2cf;opacity:.85}
p{color:#8a93a6;margin:0 0 8px}
</style></head><body>
<h1>District pictures</h1>
<p>One per open district, drawn like the portraits: flat planes, hard light, the gang's light from the right, no outlines (2026-10-29).</p>
${ORDER.map(([k, name, gang]) => `<section id="${k}"><h2>${name} <span style="color:#8a93a6">· ${gang}</span></h2>${districtArt(k)}</section>`).join('')}
</body></html>`;
const file = new URL('../drafts/prototypes/district-pictures.html', import.meta.url);
writeFileSync(file, html);
console.log('wrote drafts/prototypes/district-pictures.html');

const out = process.argv[2];
if (out) {
  const { chromium } = await import('playwright');
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1180, height: 900 }, deviceScaleFactor: 2 });
  await p.goto(file.href);
  let n = 0;
  for (const [k] of ORDER) await p.locator(`#${k} svg`).screenshot({ path: `${out}/${String(++n).padStart(2, '0')}-${k}.png` });
  await b.close();
}
