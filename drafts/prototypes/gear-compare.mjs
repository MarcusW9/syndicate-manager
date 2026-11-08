// Side by side (2026-11-08, the owner: "how does this stack up against the original analog designs?"):
// D (the dossier with a loadout foot) against L (the polaroid and inventory grid, refined), on a phone
// and on a computer. Builds from gear-cards.mjs and gear-grid.mjs.
//   node drafts/prototypes/gear-compare.mjs   → drafts/prototypes/gear-compare.html
import { writeFileSync } from 'node:fs';
import { cardFrame } from './gear-cards.mjs';
import { gridFrame } from './gear-grid.mjs';

const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Analog dossier against the grid</title>
<link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Inter:wght@400;600&display=swap" rel="stylesheet">
<style>
body { margin: 0; padding: 20px; background: #090b0f; color: #e6e9ef; font: 15px/1.45 Inter, system-ui, sans-serif; }
h1, h2, h3 { font-family: Rajdhani, sans-serif; letter-spacing: .08em; text-transform: uppercase; margin: 0 0 6px; } h2 { color: #3de8d8; } h3 { color: #8a93a6; font-size: .9rem; letter-spacing: .16em; }
p { color: #8a93a6; max-width: 76ch; margin: 0 0 12px; }
section { margin-bottom: 30px; padding: 16px; border: 1px solid #2a3140; background: #10131a; clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%); }
.pair { display: flex; flex-wrap: wrap; gap: 20px; align-items: flex-start; }
.pair > div { display: grid; gap: 6px; }
iframe { border: 1px solid #2a3140; background: #0d0f14; }
</style></head><body>
<h1>Analog dossier against the grid</h1>
<p>The same squad both ways: Signal (named rifle and a ghost kit... the dossier shows only the rifle), Lantern (drone), Synapse (sidearm, and a vest in the grid), Drizzle on standby (trauma kit).</p>
<section><h2>On a phone (390)</h2><p>Where the trade-off shows: height. The grid's phone layout keeps one row of gear to stay close to the dossier's height.</p>
<div class="pair"><div><h3>D · Dossier, loadout foot</h3>${cardFrame('d', 390, 760)}</div><div><h3>L · Polaroid and inventory</h3>${gridFrame('L', 390, 760)}</div><div><h3>M · L, smaller</h3>${gridFrame('M', 390, 760)}</div></div></section>
<section><h2>On a computer (the plan column, 920)</h2><p>Room for the whole inventory: everything each runner carries, at one scale.</p>
<div class="pair"><div><h3>D · Dossier, loadout foot</h3>${cardFrame('d', 920, 640)}</div><div><h3>M · L, smaller</h3>${gridFrame('M', 920, 640)}</div><div><h3>L · Polaroid and inventory</h3>${gridFrame('L', 920, 640)}</div></div></section>
</body></html>`;
writeFileSync(new URL('./gear-compare.html', import.meta.url), html);
console.log('wrote gear-compare.html');
