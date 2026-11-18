// Design-session preview (2026-11-18): every wound preset on three faces, one PNG. Run: node scripts/preview-wound-presets.mjs <out.png>
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
import { createNewGame } from '../src/core/state.js';
import { portrait, WOUND_LOOKS } from '../src/ui/art.js';
const s = createNewGame({ seed: 21, startCrew: 'fresh' });
const ops = s.crew.slice(0, 3);
const looks = [...WOUND_LOOKS.light, ...WOUND_LOOKS.serious, ...WOUND_LOOKS.critical];
const cell = (op, l) => `<figure style="margin:0;color:#8a93a6;font:11px monospace">${portrait({ ...op, condition: { ...op.condition, injury: WOUND_LOOKS.light.includes(l) ? 'light' : WOUND_LOOKS.serious.includes(l) ? 'serious' : 'critical' } }, { size: 150, wound: l })}<div>${l}</div></figure>`;
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 8 * 160, height: 3 * 175 } });
await p.setContent(`<body style="margin:6px;background:#10141b;display:grid;grid-template-columns:repeat(8,150px);gap:6px">${ops.flatMap((o) => looks.map((l) => cell(o, l))).join('')}</body>`);
await p.screenshot({ path: process.argv[2] }); await b.close();
