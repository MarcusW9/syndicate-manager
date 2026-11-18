// Design-session preview (2026-11-18): every tattoo design on three faces, the undercut's shaved-side ink and the crew lantern, one PNG.
// Run: node scripts/preview-tattoos.mjs <out.png>
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
import { createNewGame } from '../src/core/state.js';
import { portrait, faceOf, TATTOO_LOOKS } from '../src/ui/art.js';
const s = createNewGame({ seed: 21, startCrew: 'fresh' });
const ops = s.crew.slice(0, 3);
const cell = (op, ink, cap) => `<figure style="margin:0;color:#8a93a6;font:11px monospace">${portrait(op, { size: 150, ink })}<div>${cap}</div></figure>`;
const items = ops.flatMap((o) => TATTOO_LOOKS.map((l) => cell(o, l, l)));
// an undercut and a crew-marked runner
let under = null; for (let i = 0; i < 400 && !under; i++) { const op = { ...ops[1], id: `u${i}`, name: `U${i}` }; const f = faceOf(op); if (f.hair === 'undercut' || f.hairStyle === 'undercut' || JSON.stringify(f).includes('undercut')) under = op; }
const crewm = { ...ops[0], marks: [{ kind: 'tattoo' }] };
items.push(cell(under ?? ops[1], null, 'undercut'), cell(crewm, null, 'crew lantern'));
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 6 * 158 + 12, height: 4 * 175 } });
await p.setContent(`<body style="margin:6px;background:#10141b;display:grid;grid-template-columns:repeat(6,150px);gap:8px">${items.join('')}</body>`);
await p.screenshot({ path: process.argv[2] }); await b.close(); console.log(!!under);
