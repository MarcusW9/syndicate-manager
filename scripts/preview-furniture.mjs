// The furniture pack (src/ui/furniture.js) on one page: every piece, then a sample room of each kind
// furnished from its kit by a seeded random, with a way through kept clear. Writes <out>.html and
// <out>.png (and <out>-phone.png).
//
//   node scripts/preview-furniture.mjs docs/mockups/2026-11-23-furniture
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { FURNITURE, ROOM_KITS, furnishRoom, furnitureSvg, furnitureLayer } from '../src/ui/furniture.js';

const { chromium } = createRequire(import.meta.url)('playwright');
const out = resolve(process.argv[2] ?? 'furniture-preview');
const seedRng = (seed) => { let a = [...seed].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0, 2166136261); return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
const FLOOR = { kitchen: '#1a2328', dining: '#22191c', parlour: '#22192a', bar: '#1f1826', office: '#1b1e24', store: '#1b1d22', bedroom: '#211d1a', lab: '#18212a', clinic: '#1c2426', server: '#141a22', garage: '#1c1f24', workshop: '#1f1d1a', bathroom: '#1a2328', hall: '#191b21', shrine: '#24161a', alley: '#12141a' };

const cell = (id) => {
  const f = FURNITURE[id]; const pad = 8; const W = Math.max(f.w, 24) + pad * 2, H = f.h + pad * 2 + 2;
  return `<figure><svg viewBox="0 0 ${W} ${H}" style="width:${W * 3.2}px"><rect width="${W}" height="${H}" fill="#1b1e25"/>${furnitureSvg({ id, x: (W - f.w) / 2, y: pad, w: f.w, h: f.h })}</svg>
    <figcaption>${f.name}<span>${f.rooms.slice(0, 4).join(' · ')}${f.cover ? ' · cover' : ''}</span></figcaption></figure>`;
};
const room = (kind, seed) => {
  const W = 150, H = 100; const r = { x: 4, y: 4, w: W - 8, h: H - 8 };
  const lane = kind === 'alley' ? [{ x: 0, y: H / 2 - 9, w: W, h: 18 }] : [{ x: W / 2 - 9, y: H / 2, w: 18, h: H / 2 }, { x: 0, y: H / 2 - 9, w: W / 2 + 9, h: 18 }];
  const pieces = furnishRoom(seedRng(`${kind}:${seed}`), r, kind, lane);
  return `<figure class="room"><svg viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="#0b0d11"/>
    <rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" fill="${FLOOR[kind] ?? '#1b1d22'}" stroke="#4a5266" stroke-width="1.5"/>
    ${kind === 'alley' ? '' : `<rect x="${W / 2 - 8}" y="${H - 5.5}" width="16" height="3" fill="#6a7389"/>`}
    ${furnitureLayer(pieces)}</svg><figcaption>${kind}<span>seed ${seed} · ${pieces.length} pieces</span></figcaption></figure>`;
};

const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Furniture pack</title><style>
  body { margin: 0; padding: 16px; background: #0a0c0f; color: #d8deea; font-family: Inter, system-ui, sans-serif; }
  h1, h2 { font-family: Rajdhani, sans-serif; letter-spacing: .12em; text-transform: uppercase; } h1 { font-size: 22px; margin: 0 0 4px; } h2 { color: #3ee6d4; font-size: 16px; margin: 24px 0 10px; }
  p { color: #8a93a6; font-size: 14px; max-width: 72ch; margin: 0; }
  .grid { display: flex; flex-wrap: wrap; gap: 12px; align-items: flex-end; }
  figure { margin: 0; } svg { display: block; max-width: 100%; height: auto; }
  figcaption { font-size: 12px; color: #d8deea; margin-top: 4px; } figcaption span { display: block; color: #5d6577; font: 10px monospace; }
  .rooms { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 12px; }
</style></head><body>
<h1>Furniture pack</h1><p>${Object.keys(FURNITURE).length} pieces in <code>src/ui/furniture.js</code>, drawn like the maps: flat planes, light from the right, hard navy shadows; only tech and neon glow. Then a room of each kind, furnished from its kit by a seeded random, the way through kept clear.</p>
<h2>The pieces</h2><div class="grid">${Object.keys(FURNITURE).map(cell).join('')}</div>
<h2>Rooms furnished from the pack</h2><div class="rooms">${Object.keys(ROOM_KITS).flatMap((k) => [room(k, 'a'), room(k, 'b')]).join('')}</div>
</body></html>`;

writeFileSync(`${out}.html`, html);
const browser = await chromium.launch();
for (const [w, h, s, sfx] of [[1440, 900, 1, ''], [390, 844, 2, '-phone']]) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: s });
  await page.goto(`file://${out}.html`);
  await page.screenshot({ path: `${out}${sfx}.png`, fullPage: true });
}
await browser.close();
console.log('wrote', `${out}.html`);
