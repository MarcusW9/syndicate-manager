// Mock-up (2026-11-08): the squad board's background, on M (the polaroid grid scaled down) with a role
// icon on each photo and gear names on computers only. N1 a gear mat ruled in the inventory's cell
// size; N2 the mat with the approach's colour washing in (Stealth here); N3 both, plus the reading:
// a glow under each runner by how they fit the job (Lantern shaky), a pulse on a slot worth filling,
// and a flash when a change moves the risk (the button plays it).
//   node drafts/prototypes/gear-mat.mjs   → drafts/prototypes/gear-mat.html
import { writeFileSync } from 'node:fs';
import { gridFrame } from './gear-grid.mjs';

const ROWS = [
  ['N1', 'N1 · Gear mat', 'A dark mat ruled in the inventory\'s cell size, so photos and gear sit on its lines; a lighter patch where each runner stands; the polaroids cast a shadow on it.'],
  ['N2', 'N2 · Gear mat + approach tint', 'The same, with the approach\'s colour washing in from the top and its name faint in the corner (Stealth: cool blue; Loud would be red, Con amber, Tech teal). It changes as you switch approach.'],
  ['N3', 'N3 · Gear mat + tint + the reading', 'The background reads the squad: a glow under each runner in the picker\'s fit colours (Lantern is shaky on this job, amber), the empty slot pulses, and the mat flashes when a change moves the risk. Tap the button under the board to see the flash.'],
];
const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>The squad board's background</title>
<link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Inter:wght@400;600&display=swap" rel="stylesheet">
<style>
body { margin: 0; padding: 20px; background: #090b0f; color: #e6e9ef; font: 15px/1.45 Inter, system-ui, sans-serif; }
h1, h2 { font-family: Rajdhani, sans-serif; letter-spacing: .08em; text-transform: uppercase; margin: 0 0 6px; } h2 { color: #3de8d8; }
p { color: #8a93a6; max-width: 76ch; margin: 0 0 12px; }
section { margin-bottom: 30px; padding: 16px; border: 1px solid #2a3140; background: #10131a; clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%); }
.frames { display: flex; flex-wrap: wrap; gap: 16px; align-items: flex-start; }
iframe { border: 1px solid #2a3140; background: #0d0f14; }
</style></head><body>
<h1>The squad board's background</h1>
<p>On M (the polaroid grid scaled down), with a role icon beside each name (the picker and the runner's page still say the role) and gear names on computers only. Each at phone width (390) and the plan column on a computer (920).</p>
${ROWS.map(([k, name, note]) => `<section><h2>${name}</h2><p>${note}</p><div class="frames">${gridFrame(k, 390, 640)}${gridFrame(k, 920, 660)}</div></section>`).join('')}
</body></html>`;
writeFileSync(new URL('./gear-mat.html', import.meta.url), html);
console.log('wrote gear-mat.html');
