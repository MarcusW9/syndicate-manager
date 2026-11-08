// Mock-up (2026-11-07, the owner's playtest: the gun strip under the stats "looks a bit out of place"):
// the real squad board (ui/board.js renderBoard, real portraits and gear art) with each runner's main
// gear shown five ways. Each way is CSS over the same markup, so the chosen one drops straight into
// styles.css. Every variant is shown in a phone frame (390) and a computer frame (the plan column).
//   node drafts/prototypes/gear-cards.mjs   → drafts/prototypes/gear-cards.html
import { writeFileSync, readFileSync } from 'node:fs';
import { createNewGame } from '../../src/core/state.js';
import { loadoutOf } from '../../src/core/gear.js';
import { renderBoard } from '../../src/ui/board.js';
import { portrait } from '../../src/ui/art.js';
import { statValue } from '../../src/ui/icons.js';

const s = createNewGame({ seed: 21, startCrew: 'fresh' });
const offers = s.armoury?.offers ?? [];
const withLook = (type) => offers.find((o) => o.type === type);
// Signal (tech) carries a named rifle, Synapse (muscle) a named sidearm, Drizzle (medic) a trauma kit,
// Lantern (face) a drone; Burner nothing.
const kit = { Signal: ['rifle'], Synapse: ['pistol'], Drizzle: ['medkit'], Lantern: ['drone'], Burner: [] };
for (const op of s.crew) {
  op.gear = loadoutOf(s, kit[op.handle] ?? []);
  for (const b of op.gear.bag) {
    const o = withLook(b.item.type);
    if (o?.look) Object.assign(b.item, { look: o.look, name: o.name });
  }
}
const by = (h) => s.crew.find((o) => o.handle === h);
const esc = (t) => String(t ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const ui = { esc, face: (op, size) => `<span class="face ${size ? `face--${size}` : ''}">${portrait(op, { size: 48 })}</span>`, riskBadge: () => '', riskWord: (x) => x, statusChip: () => '', keyStats: () => '' };
const tpl = { crewSize: 3, keyStats: ['tech', 'social', 'stealth'] };
const plan = { crew: [by('Signal').id, by('Lantern').id, by('Synapse').id], approach: 'stealth', overwatch: null, wheels: null, standby: by('Drizzle').id };
const board = renderBoard(ui, { plan, tpl, people: s.crew, crewSize: 3 });

const css = readFileSync(new URL('../../src/ui/styles.css', import.meta.url), 'utf8');

// The variants: CSS over .dossier__gear (the drawing and the item's name, inside the card).
const VARIANTS = [
  { id: 'a', name: 'A · Now', note: 'A strip under the stat, centred on its own line. Grows the card; reads as a sticker.', css: '' },
  {
    id: 'b', name: 'B · Clipped to the file', note: 'The gear on a dark slip paper-clipped to the card\'s bottom edge, hanging off it and tilted, like an evidence photo. The card keeps its size; the slip overlaps the gap below.',
    css: `
    .dossier { overflow: visible; }
    .dossier__gear { position: absolute; right: 8px; bottom: -30px; z-index: 2; margin: 0; padding: 4px 4px 3px; background: #0d1016; transform: rotate(-4deg); box-shadow: 0 3px 6px rgba(0,0,0,.55); border: 1px solid #2a3140; }
    .dossier__gear::before { content: ""; position: absolute; top: -9px; left: 14px; width: 8px; height: 20px; border: 2px solid #9aa3b5; border-radius: 6px; border-bottom-color: transparent; }
    .dossier__gear .gearart { width: 76px; height: 25px; box-shadow: none; }
    .dossier__gear > span { color: #8a93a6; font-size: 0.5rem; }
    .dossiers { row-gap: 40px !important; margin-bottom: 30px; }
    .board__group { margin-bottom: 6px; }`,
  },
  {
    id: 'c', name: 'C · Behind the card', note: 'The drawing large and faint across the card\'s right half, behind the text, like a watermark on the file. The name goes up beside the stat. Quietest; the art is there but you look past it.',
    css: `
    .dossier { overflow: hidden; }
    .dossier__gear { position: absolute; right: -14px; bottom: 4px; margin: 0; pointer-events: none; z-index: 0; }
    .dossier__gear .gearart { width: 150px; height: 50px; box-shadow: none; opacity: .3; }
    .dossier__gear .gearart rect:first-of-type, .dossier__gear .gearart rect:nth-of-type(2) { fill: transparent; }
    .dossier__gear > span { position: absolute; right: 18px; bottom: 2px; color: #6b7080; font-size: .5rem; }
    .dossier > :not(.dossier__gear) { position: relative; z-index: 1; }`,
  },
  {
    id: 'd', name: 'D · A loadout foot', note: 'A dark band across the bottom of the card, edge to edge: the drawing at full size on the left, its name beside it. Reads as part of the card, not stuck on. The card gets a little taller.',
    css: `
    .dossier { overflow: hidden; }
    .dossier:not(.is-empty) { grid-template-columns: minmax(0, 1fr); }
    @container board (max-width: 520px) { .dossiers--pairs .dossier:not(.is-empty) { grid-template-columns: auto minmax(0, 1fr); } }
    .dossier__gear { grid-column: 1 / -1 !important; justify-self: stretch; min-width: 0; display: flex; align-items: center; gap: 8px; margin: 6px -9px -9px; padding: 6px 10px; background: #12151c; border-top: 2px solid var(--pin, #3de8d8); }
    .dossier__gear .gearart { width: 84px; height: 28px; box-shadow: none; flex: none; }
    .dossier__gear > span { color: #c9cfdb; font-size: .58rem; text-align: left; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    @media (max-width: 899px) { .dossier__gear { margin: 6px -5px -8px; } .dossiers--pairs .dossier__gear { margin: 6px -9px -9px; } .dossiers--pairs .dossier__gear .gearart { width: 60px; height: 20px; } }`,
  },
  {
    id: 'e', name: 'E · Slung behind the photo', note: 'The drawing tucked behind the portrait at an angle, sticking out past it, as if it\'s pinned with the photo. No extra height; the name moves under the stat as a small tag.',
    css: `
    .dossier { overflow: visible; }
    .dossier__photo { position: relative; z-index: 1; }
    .dossier__gear { position: absolute; z-index: 0; margin: 0; left: calc(50% - 96px); top: 34px; transform: rotate(-32deg); pointer-events: none; }
    .dossier__gear .gearart { width: 92px; height: 31px; box-shadow: 0 2px 4px rgba(0,0,0,.5); }
    .dossier__gear > span { display: none; }
    @container board (max-width: 520px) {
      .dossiers--pairs .dossier__gear { grid-column: 1 !important; grid-row: 1 / span 4; left: -14px; top: 30px; transform: rotate(50deg); }
      .dossiers--pairs .dossier__gear .gearart { width: 72px; height: 24px; }
    }`,
    tag: true,
  },
  {
    id: 'f', name: 'F · A tap away', note: 'Just a small gear chip on the card (an icon and the name, one line). Tap the card\'s chip to open the runner\'s loadout with the art big. Tidiest card; the art is only on the sheet.',
    css: `
    .dossier__gear { display: inline-flex; align-items: center; gap: 4px; margin-top: 3px; padding: 2px 6px 2px 3px; background: #1b1d22; border-radius: 3px; }
    .dossier__gear .gearart { width: 36px; height: 12px; box-shadow: none; }
    .dossier__gear > span { color: #fff; font-size: .52rem; }`,
  },
];

// A variant's board: E also puts the item's name under the stat as a tag.
const boardFor = (v) => (v.tag ? board.replace(/<span class="dossier__gear">([\s\S]*?)<span>([^<]*)<\/span><\/span>/g, '<span class="dossier__gear">$1<span>$2</span></span><span class="dossier__tag">$2</span>') : board);

const frame = (v, w, h = null) => {
  const doc = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=${w}">
<link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
<style>${css}
html, body { background: #0d0f14; margin: 0; } body { padding: 14px; }
${v.css}</style></head><body><h2>Squad</h2>${boardFor(v)}</body></html>`;
  return `<iframe title="${esc(v.name)} at ${w}px" width="${w}" height="${h ?? (w < 500 ? 680 : 560)}" srcdoc="${esc(doc)}"></iframe>`;
};

const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Gear on the squad cards</title>
<link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Inter:wght@400;600&display=swap" rel="stylesheet">
<style>
body { margin: 0; padding: 20px; background: #090b0f; color: #e6e9ef; font: 15px/1.45 Inter, system-ui, sans-serif; }
h1, h2 { font-family: Rajdhani, sans-serif; letter-spacing: .08em; text-transform: uppercase; margin: 0 0 6px; } h2 { color: #3de8d8; }
p { color: #8a93a6; max-width: 72ch; margin: 0 0 12px; }
section { margin-bottom: 30px; padding: 16px; border: 1px solid #2a3140; background: #10131a; clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%); }
.frames { display: flex; flex-wrap: wrap; gap: 16px; align-items: flex-start; }
iframe { border: 1px solid #2a3140; background: #0d0f14; }
</style></head><body>
<h1>Gear on the squad cards</h1>
<p>The real board (Signal with a named rifle, Lantern with a drone, Synapse with a sidearm; Drizzle on standby with a trauma kit), each way shown at phone width (390) and at the plan column's width on a computer (920). Pick a letter.</p>
${VARIANTS.map((v) => `<section><h2>${esc(v.name)}</h2><p>${esc(v.note)}</p><div class="frames">${frame(v, 390)}${frame(v, 920)}</div></section>`).join('')}
</body></html>`;
writeFileSync(new URL('./gear-cards.html', import.meta.url), html);
console.log('wrote gear-cards.html');

/** One variant's frame, for drafts/prototypes/gear-compare.mjs. */
export const cardFrame = (id, w, h) => frame(VARIANTS.find((v) => v.id === id), w, h);
