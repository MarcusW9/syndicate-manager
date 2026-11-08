// Mock-up (2026-11-08, the owner: "a grid look without the analog... the guns and people lined up to
// similar sizes on a grid; the people in a photo, like a polaroid border"): the squad board drawn
// straight, three ways. Real portraits and gear drawings (ui/art.js); the layout is invented.
//   node drafts/prototypes/gear-grid.mjs   → drafts/prototypes/gear-grid.html
import { writeFileSync } from 'node:fs';
import { createNewGame } from '../../src/core/state.js';
import { loadoutOf, carried, itemTitle } from '../../src/core/gear.js';
import { bestLine } from '../../src/core/squad.js';
import { effectiveStat } from '../../src/core/crew.js';
import { portrait, gearArt } from '../../src/ui/art.js';
import { statValue } from '../../src/ui/icons.js';

const s = createNewGame({ seed: 21, startCrew: 'fresh' });
const offers = s.armoury?.offers ?? [];
const kit = { Signal: ['rifle', 'picks'], Synapse: ['pistol', 'vest'], Drizzle: ['medkit'], Lantern: ['drone'], Burner: [] };
for (const op of s.crew) {
  op.gear = loadoutOf(s, kit[op.handle] ?? []);
  for (const b of op.gear.bag) { const o = offers.find((x) => x.type === b.item.type); if (o?.look) Object.assign(b.item, { look: o.look, name: o.name }); }
}
const by = (h) => s.crew.find((o) => o.handle === h);
const esc = (t) => String(t ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const MAIN = ['rifle', 'drone', 'deck', 'pistol'];
const mainGear = (op) => [...carried(op)].sort((a, b) => (MAIN.includes(a.type) ? MAIN.indexOf(a.type) : 9) - (MAIN.includes(b.type) ? MAIN.indexOf(b.type) : 9))[0] ?? null;
const PINS = { Signal: '#ff4f7b', Lantern: '#36d6c3', Synapse: '#f5b942', Drizzle: '#b48cff' };

const inside = ['Signal', 'Lantern', 'Synapse'].map(by);
const standby = by('Drizzle');
const line = (op) => { const b = bestLine(op, 'stealth'); return statValue(b.stat, b.value); };

// A polaroid: the portrait in a white frame, the handle written in the deep bottom margin.
const polaroid = (op, { size = 96, role = true } = {}) => `
  <figure class="pola" style="--pin:${PINS[op.handle] ?? '#3de8d8'}">
    <span class="pola__photo">${portrait(op, { size })}</span>
    <figcaption><b>${esc(op.handle)}</b>${role ? `<span>${esc(op.role)}</span>` : ''}</figcaption>
  </figure>`;
// A gear tile the same size as the photo: wide drawings (rifles, sidearms, drones, decks) turned
// across the square, square ones (kits, vests) as they are.
const gearTile = (op, item) => {
  if (!item) return '<div class="gtile is-none"><span>No gear</span></div>';
  const art = gearArt(item, { carrier: op, width: 96 });
  const square = /gearart--square/.test(art ?? '');
  return `<div class="gtile ${square ? 'is-square' : 'is-wide'}"><span class="gtile__art">${art ?? ''}</span><span class="gtile__name">${esc(itemTitle(item))}</span></div>`;
};
const empty = (label, hint) => `<button class="slot is-empty"><b>+ ${esc(label)}</b><small>${esc(hint)}</small></button>`;
const x = '<span class="x" aria-hidden="true">×</span>';

// G · Columns: each runner a column, the photo over the gear, the stat under both. Lined up across.
const columns = () => `
  <div class="board g-cols">
    <p class="label">Inside team <span>moves as one group</span></p>
    <div class="cols">
      ${inside.map((op) => `<div class="col">${x}${polaroid(op)}${gearTile(op, mainGear(op))}<p class="stat">${line(op)}</p></div>`).join('')}
      <div class="col col--empty">${empty('Extra', 'more backup, more at risk')}</div>
    </div>
    <p class="label">Outside <span>optional</span></p>
    <div class="cols">
      <div class="col">${x}${polaroid(standby)}${gearTile(standby, mainGear(standby))}<p class="stat"><span class="iconword">On call ·</span> ${statValue('medical', effectiveStat(standby, 'medical').value)}</p></div>
      <div class="col col--empty">${empty('Overwatch', 'needs a rifle or drone')}</div>
      <div class="col col--empty">${empty('Wheels', 'takes the driving rolls')}</div>
    </div>
  </div>`;

// H · Rows: a roster sheet. One row per runner: the photo, name and stat, then every item they
// carry as tiles of the same size, so the whole squad's kit reads down the columns.
const rows = () => `
  <div class="board g-rows">
    <p class="label">Inside team <span>moves as one group</span></p>
    ${inside.map((op) => `<div class="row">${polaroid(op, { size: 72, role: false })}<div class="row__info"><b>${esc(op.handle)}</b><span>${esc(op.role)}</span><p class="stat">${line(op)}</p></div><div class="row__kit">${carried(op).map((it) => gearTile(op, it)).join('') || gearTile(op, null)}</div>${x}</div>`).join('')}
    <div class="row row--empty">${empty('Extra', 'more backup, more at risk')}</div>
    <p class="label">Outside <span>optional</span></p>
    <div class="row">${polaroid(standby, { size: 72, role: false })}<div class="row__info"><b>${esc(standby.handle)}</b><span>standby</span><p class="stat">${statValue('medical', effectiveStat(standby, 'medical').value)}</p></div><div class="row__kit">${carried(standby).map((it) => gearTile(standby, it)).join('')}</div>${x}</div>
    <div class="chips">${empty('Overwatch', 'needs a rifle or drone')}${empty('Wheels', 'takes the driving rolls')}</div>
  </div>`;

// I · Pairs: each runner one cell of two equal squares, the polaroid and their gear side by side,
// two cells to a row on a phone, four across on a computer.
const pairs = () => `
  <div class="board g-pairs">
    <p class="label">Inside team <span>moves as one group</span></p>
    <div class="pairs">
      ${inside.map((op) => `<div class="pair">${x}<div class="pair__sq">${polaroid(op, { size: 80 })}${gearTile(op, mainGear(op))}</div><p class="stat">${line(op)}</p></div>`).join('')}
      <div class="pair pair--empty">${empty('Extra', 'more backup, more at risk')}</div>
    </div>
    <p class="label">Outside <span>optional</span></p>
    <div class="pairs">
      <div class="pair">${x}<div class="pair__sq">${polaroid(standby, { size: 80 })}${gearTile(standby, mainGear(standby))}</div><p class="stat"><span class="iconword">On call ·</span> ${statValue('medical', effectiveStat(standby, 'medical').value)}</p></div>
      <div class="pair pair--empty">${empty('Overwatch', 'needs a rifle or drone')}</div>
    </div>
  </div>`;

const CSS = `
:root { --accent: #ff3d5f; --accent-2: #3de8d8; --line: #2a3140; --muted: #8a93a6; --text: #e6e9ef; --display: 'Rajdhani', sans-serif; --mono: ui-monospace, 'SF Mono', Menlo, monospace; }
* { box-sizing: border-box; }
html, body { margin: 0; background: #0d0f14; color: var(--text); font: 15px/1.4 Inter, system-ui, sans-serif; }
body { padding: 14px; }
h2 { font: 700 1.1rem var(--display); letter-spacing: .16em; text-transform: uppercase; color: var(--accent-2); margin: 0 0 10px; }
.board { border: 1px solid var(--line); background: #11141b; padding: 14px; clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%); }
.label { display: flex; justify-content: space-between; margin: 4px 0 8px; font: 700 .72rem var(--display); letter-spacing: .16em; text-transform: uppercase; color: var(--muted); }
.label span { font: 400 .78rem Inter, sans-serif; letter-spacing: 0; text-transform: none; }
.label:not(:first-child) { margin-top: 16px; }
.iconword { display: inline-flex; align-items: center; gap: 4px; font: 600 .74rem var(--mono); text-transform: uppercase; letter-spacing: .04em; color: #c9cfdb; }
.iconword svg { width: 13px; height: 13px; } .icon g { stroke: currentColor; fill: none; }
.stat { margin: 6px 0 0; text-align: center; }
.x { position: absolute; top: -8px; right: -8px; z-index: 3; width: 24px; height: 24px; display: grid; place-items: center; border-radius: 50%; background: #1b1f29; border: 1px solid #3a4254; color: var(--muted); font-size: 15px; }

/* the polaroid: white frame, a deeper bottom margin with the handle, a pin-coloured tab */
.pola { position: relative; margin: 0; padding: 6px 6px 0; background: #f1ede3; box-shadow: 0 2px 6px rgba(0,0,0,.45); display: grid; }
.pola::before { content: ""; position: absolute; top: 0; left: 50%; width: 28px; height: 4px; margin-left: -14px; background: var(--pin); }
.pola__photo { display: block; aspect-ratio: 1; background: #1a1d25; overflow: hidden; }
.pola__photo svg { display: block; width: 100%; height: 100%; }
.pola figcaption { display: grid; justify-items: center; padding: 5px 2px 7px; color: #1b1d22; line-height: 1.1; }
.pola figcaption b { font: 700 .95rem var(--display); letter-spacing: .04em; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pola figcaption span { font-size: .66rem; color: #6a6f7c; }

/* the gear tile: same width as the photo, square, the drawing on the gear's own dark ground */
.gtile { position: relative; aspect-ratio: 1; display: grid; place-items: center; background: #0d1016; border: 1px solid var(--line); overflow: hidden; }
.gtile__art { display: grid; place-items: center; width: 100%; height: 100%; }
.gtile.is-wide .gearart { width: 132%; height: auto; transform: rotate(-32deg); }
.gtile.is-square .gearart { width: 78%; height: auto; }
.gtile .gearart > rect:first-of-type { fill: transparent; }
.gtile__name { position: absolute; left: 0; right: 0; bottom: 0; padding: 3px 5px; font: 600 .56rem var(--mono); text-transform: uppercase; letter-spacing: .03em; color: #c9cfdb; background: linear-gradient(transparent, rgba(5,6,9,.9) 40%); text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.gtile.is-none { color: #4a5266; font: 600 .62rem var(--mono); text-transform: uppercase; border-style: dashed; background: transparent; }

.slot { width: 100%; height: 100%; min-height: 64px; display: grid; place-content: center; gap: 4px; padding: 8px; text-align: center; background: transparent; border: 2px dashed #3a4254; color: var(--muted); font: inherit; cursor: pointer; }
.slot b { font: 700 .74rem var(--display); letter-spacing: .14em; text-transform: uppercase; color: #c9cfdb; } .slot small { font-size: .7rem; }

/* G · columns */
.cols { display: grid; grid-template-columns: repeat(4, minmax(0, 150px)); gap: 12px; }
.col { position: relative; display: grid; gap: 6px; align-content: start; }
.col .gtile { border-top: 2px solid var(--line); }
@container (max-width: 0px) {}
@media (max-width: 480px) { .cols { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; } .pola figcaption b { font-size: .85rem; } }

/* H · rows */
.row { position: relative; display: grid; grid-template-columns: 76px 1fr auto; align-items: center; gap: 12px; padding: 8px; margin-bottom: 8px; background: #151922; border: 1px solid var(--line); }
.row .pola { padding: 4px 4px 0; } .row .pola figcaption { display: none; } .row .pola { padding-bottom: 12px; }
.row__info { display: grid; gap: 1px; min-width: 0; } .row__info b { font: 700 1.05rem var(--display); letter-spacing: .04em; } .row__info span { font-size: .72rem; color: var(--muted); } .row__info .stat { text-align: left; margin-top: 4px; }
.row__kit { display: grid; grid-auto-flow: column; grid-auto-columns: 76px; gap: 6px; }
.row--empty { display: block; padding: 0; border: 0; background: none; }
.chips { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
@media (max-width: 480px) { .row { grid-template-columns: 64px 1fr; } .row__kit { grid-column: 1 / -1; grid-auto-columns: 64px; } }

/* I · pairs */
.pairs { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
.pair { position: relative; padding: 8px; background: #151922; border: 1px solid var(--line); }
.pair__sq { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; align-items: start; }
.pair .pola figcaption span { display: none; }
.pair .gtile { aspect-ratio: auto; height: 100%; }
.pair--empty { padding: 0; border: 0; background: none; }
@media (max-width: 900px) { .pairs { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
`;


// The inventory look (2026-11-08, the owner: the drawings without their background, "a rifle 2×1 as
// long as the polaroid, small guns half the size, like the inventory"): items laid on cells, long
// things (rifle, drone, deck) 2×1, small things (sidearm, kits, vest) 1×1. Drawn bare (gearArt bare);
// a script in the page fits each drawing's box to the item itself.
const LONG = new Set(['rifle', 'drone', 'deck']);
const invItems = (op) => [...carried(op)].sort((a, b) => (LONG.has(b.type) ? 1 : 0) - (LONG.has(a.type) ? 1 : 0));
const invCell = (op, item) => `<div class="inv__it ${LONG.has(item.type) ? 'is-long' : ''}" title="">${gearArt(item, { carrier: op, width: 96, bare: true }) ?? ''}<span>${esc(itemTitle(item))}</span></div>`;
// An inventory of n rows × 2 columns, the items placed, the rest empty cells.
const inv = (op, rows = 2) => {
  const items = invItems(op);
  const used = items.reduce((n, it) => n + (LONG.has(it.type) ? 2 : 1), 0);
  const blanks = Math.max(0, rows * 2 - used);
  return `<div class="inv" style="--rows:${rows}">${items.map((it) => invCell(op, it)).join('')}${'<div class="inv__cell"></div>'.repeat(blanks)}</div>`;
};
const under = () => `
  <div class="board g-cols j-under">
    <p class="label">Inside team <span>moves as one group</span></p>
    <div class="cols">
      ${inside.map((op) => `<div class="col">${x}${polaroid(op)}${inv(op)}<p class="stat">${line(op)}</p></div>`).join('')}
      <div class="col col--empty">${empty('Extra', 'more backup, more at risk')}</div>
    </div>
    <p class="label">Outside <span>optional</span></p>
    <div class="cols">
      <div class="col">${x}${polaroid(standby)}${inv(standby)}<p class="stat"><span class="iconword">On call ·</span> ${statValue('medical', effectiveStat(standby, 'medical').value)}</p></div>
      <div class="col col--empty">${empty('Overwatch', 'needs a rifle or drone')}</div>
      <div class="col col--empty">${empty('Wheels', 'takes the driving rolls')}</div>
    </div>
  </div>`;
const beside = () => `
  <div class="board k-beside">
    <p class="label">Inside team <span>moves as one group</span></p>
    <div class="kpairs">
      ${inside.map((op) => `<div class="kpair">${x}<div class="kpair__sq">${polaroid(op, { size: 80, role: false })}${inv(op)}</div><p class="stat">${line(op)}</p></div>`).join('')}
      <div class="kpair kpair--empty">${empty('Extra', 'more backup, more at risk')}</div>
    </div>
    <p class="label">Outside <span>optional</span></p>
    <div class="kpairs">
      <div class="kpair">${x}<div class="kpair__sq">${polaroid(standby, { size: 80, role: false })}${inv(standby)}</div><p class="stat"><span class="iconword">On call ·</span> ${statValue('medical', effectiveStat(standby, 'medical').value)}</p></div>
      <div class="kpair kpair--empty">${empty('Overwatch', 'needs a rifle or drone')}</div>
    </div>
  </div>`;
const INV_CSS = `
/* the inventory: two columns of square cells; a long item spans both */
.inv { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 3px; padding: 3px; background: #0a0c10; border: 1px solid var(--line); }
.inv__cell, .inv__it { position: relative; min-width: 0; overflow: hidden; aspect-ratio: 1; background: #141821; box-shadow: inset 0 0 0 1px #1f2532; }
.inv__it { display: grid; place-items: center; background: radial-gradient(circle at 50% 45%, #1d2330, #12151c 70%); box-shadow: inset 0 0 0 1px #2f394b; }
.inv__it.is-long { grid-column: span 2; aspect-ratio: 2 / 1; }
.inv__it svg { display: block; width: 84%; height: 64%; max-width: 100%; overflow: visible; filter: drop-shadow(0 2px 2px rgba(0,0,0,.6)); }
.inv__it > span { position: absolute; left: 3px; right: 3px; bottom: 2px; font: 600 .5rem var(--mono); text-transform: uppercase; letter-spacing: .02em; color: #8a93a6; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-align: center; }
.j-under .col .inv { margin-top: 0; }
.kpairs { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
.kpair { position: relative; padding: 8px; background: #151922; border: 1px solid var(--line); }
.kpair__sq { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; align-items: stretch; }
.kpair .pola { align-self: start; }
.kpair--empty { padding: 0; border: 0; background: none; }
@media (max-width: 900px) { .kpairs { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 480px) { .kpairs { grid-template-columns: 1fr; } .kpair__sq { grid-template-columns: 110px minmax(0, 200px); justify-content: start; } .kpair .stat { text-align: left; } }
`;
// Fit each bare drawing's viewBox to the item it draws, so a small gun fills its cell.
const FIT = `<script>
for (const svg of document.querySelectorAll('.inv__it svg')) {
  const b = svg.getBBox(); const p = Math.max(b.width, b.height) * 0.06;
  svg.setAttribute('viewBox', [b.x - p, b.y - p, b.width + 2 * p, b.height + 2 * p].join(' '));
  svg.removeAttribute('width'); svg.removeAttribute('height');
}
</script>`;

// L · J refined (2026-11-08): the polaroid keeps a slight tilt and its colour tab, the gear grid stays
// straight; on a phone only the first row of gear shows (the main item), with "+1" for the rest, so
// the column is about as tall as a dossier; wider, the whole 2×2.
const invRow = (op) => {
  const items = invItems(op);
  let cells = 0; let first = 0;
  const html = items.map((it) => {
    const w = LONG.has(it.type) ? 2 : 1;
    const inFirst = cells + w <= 2;
    if (inFirst) first += 1;
    cells += w;
    return invCell(op, it).replace('class="inv__it', `class="inv__it ${inFirst ? '' : 'is-more'}`);
  }).join('');
  const blanks = Math.max(0, 4 - cells);
  const firstBlanks = Math.max(0, 2 - Math.min(2, cells));
  const blank = (i) => `<div class="inv__cell ${i < firstBlanks ? '' : 'is-more'}"></div>`;
  const more = items.length - first;
  return `<div class="inv inv--l">${html}${Array.from({ length: blanks }, (_, i) => blank(i)).join('')}${more ? `<span class="inv__more" aria-label="${more} more carried">+${more}</span>` : ''}</div>`;
};
const TILT = ['-1.2deg', '0.8deg', '-0.6deg', '1deg'];
const refined = () => `
  <div class="board g-cols l-ref">
    <div class="head"><span>3 inside · 3 recommended</span><button class="joss">Joss's picks</button></div>
    <p class="label">Inside team <span>moves as one group</span></p>
    <div class="cols">
      ${inside.map((op, i) => `<div class="col" style="--tilt:${TILT[i]}">${x}${polaroid(op)}${invRow(op)}<p class="stat">${line(op)}</p></div>`).join('')}
      <div class="col col--empty">${empty('Extra', 'more backup, more at risk')}</div>
    </div>
    <p class="label">Outside <span>optional</span></p>
    <div class="cols">
      <div class="col" style="--tilt:0.9deg">${x}${polaroid(standby)}${invRow(standby)}<p class="stat"><span class="iconword">On call ·</span> ${statValue('medical', effectiveStat(standby, 'medical').value)}</p></div>
      <div class="col col--empty">${empty('Overwatch', 'needs a rifle or drone')}</div>
      <div class="col col--empty">${empty('Wheels', 'takes the driving rolls')}</div>
    </div>
  </div>`;
const L_CSS = `
.l-ref .pola { transform: rotate(var(--tilt, 0deg)); }
.inv--l { position: relative; }
.inv__more { display: none; position: absolute; top: -7px; right: -7px; z-index: 2; min-width: 22px; height: 22px; padding: 0 5px; place-items: center; font: 700 .7rem var(--display); color: #0a0c0f; background: var(--accent-2); clip-path: polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 0 100%); }
.l-ref .head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; color: var(--muted); font-size: .85rem; }
.l-ref .joss { min-height: 44px; padding: 0 14px; background: #10261f; border: 1px solid #1f5a4a; color: var(--accent-2); font: 700 .9rem var(--display); letter-spacing: .12em; text-transform: uppercase; }
@media (min-width: 481px) { .l-ref .cols { grid-template-columns: repeat(4, minmax(0, 130px)); } }
@media (max-width: 480px) {
  .inv--l .is-more { display: none; }
  .inv__more { display: grid; }
}
`;

const VARIANTS = [
  { name: 'L · J refined', note: 'J with the two changes: the polaroid keeps a slight tilt and its colour tab (a photo still feels like a photo), the gear stays straight. On a phone only the first row of gear shows, the main item, with "+1 more carried" for the rest, so a column is close to a dossier\'s height; on a computer the whole 2×2.', html: refined },
  { name: 'J · Inventory under the photo', note: 'The drawings without their background, laid on inventory cells under each polaroid, two cells wide. A rifle, drone or deck is 2×1, exactly as wide as the photo; a sidearm, kit or vest is 1×1, half that. Empty cells show the room left.', html: under },
  { name: 'K · Inventory beside the photo', note: 'The same inventory as J, beside the polaroid instead of under it: the photo and a 2×2 grid as one block, so a rifle is as long as the photo is wide. Shorter than J; four runners across on a computer.', html: beside },
  { name: 'G · Columns', note: 'Each runner is a column: their polaroid on top, their main gear in a square tile of the same width under it, the stat under both. Photos line up with photos and guns with guns across the squad. Three to a row on a phone.', html: columns },
  { name: 'H · Roster sheet', note: 'One row per runner: the polaroid, name and stat, then everything they carry as tiles of one size, so the squad\'s kit reads down the page like a quartermaster\'s sheet. Shows the second item too (Signal\'s ghost kit, Synapse\'s vest).', html: rows },
  { name: 'I · Photo and gear side by side', note: 'Each runner is one cell holding two equal squares: the polaroid and their gear, next to each other, the stat under. Compact; four across on a computer, two on a phone.', html: pairs },
];

const frame = (v, w, h = null) => {
  const doc = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=${w}">
<link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
<style>${CSS}${INV_CSS}${L_CSS}</style></head><body><h2>Squad</h2>${v.html()}${FIT}</body></html>`;
  return `<iframe title="${esc(v.name)} at ${w}px" width="${w}" height="${h ?? (w < 500 ? 820 : 700)}" srcdoc="${esc(doc)}"></iframe>`;
};

const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>The squad on a grid</title>
<link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Inter:wght@400;600&display=swap" rel="stylesheet">
<style>
body { margin: 0; padding: 20px; background: #090b0f; color: #e6e9ef; font: 15px/1.45 Inter, system-ui, sans-serif; }
h1, h2 { font-family: Rajdhani, sans-serif; letter-spacing: .08em; text-transform: uppercase; margin: 0 0 6px; } h2 { color: #3de8d8; }
p { color: #8a93a6; max-width: 72ch; margin: 0 0 12px; }
section { margin-bottom: 30px; padding: 16px; border: 1px solid #2a3140; background: #10131a; clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%); }
.frames { display: flex; flex-wrap: wrap; gap: 16px; align-items: flex-start; }
iframe { border: 1px solid #2a3140; background: #0d0f14; }
</style></head><body>
<h1>The squad on a grid</h1>
<p>No tilt, no pins: everything straight and the same sizes. People in polaroids, gear in square tiles of the same width (long guns and drones turned across the square, kits and vests as they are). Signal carries a named rifle and a ghost kit, Lantern a drone, Synapse a sidearm and a vest, Drizzle (standby) a trauma kit. Each shown at phone width (390) and the plan column on a computer (920).</p>
${VARIANTS.map((v) => `<section><h2>${esc(v.name)}</h2><p>${esc(v.note)}</p><div class="frames">${frame(v, 390)}${frame(v, 920)}</div></section>`).join('')}
</body></html>`;
writeFileSync(new URL('./gear-grid.html', import.meta.url), html);
console.log('wrote gear-grid.html');

/** One variant's frame by its letter, for drafts/prototypes/gear-compare.mjs. */
export const gridFrame = (letter, w, h) => frame(VARIANTS.find((v) => v.name.startsWith(letter)), w, h);
