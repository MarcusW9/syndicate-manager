// Mock-up (2026-11-06, owner: "for the implant it's half the size right? so could we have two? ...
// that inventory setup ... would it work with our game?", after Deus Ex: Human Revolution's
// inventory): a runner's gear page with a carry grid. Worn: armour (one slot) and two implant
// sockets (both count towards neural load). Carried: a 4×2 bag, each item taking cells by its size
// (long items 3×1, compact ones 1×1), placed by tapping a cell as on the hall's build grid. Real
// drawings from ui/art.js. Writes drafts/prototypes/carry-grid.html; with an out dir, screenshots it.
//   node scripts/mockup-carry-grid.mjs [out dir]
import { writeFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { gearArt } from '../src/ui/art.js';
import { createNewGame } from '../src/core/state.js';

const op = createNewGame({ seed: 21, startCrew: 'fresh' }).crew[0];
const art = (type, frame, tier = 'street') => gearArt({ uid: `m-${type}-${frame}`, type, tier, look: { frame } }, { carrier: op, width: 96 }).replace(/width="\d+" height="\d+"/, 'width="100%" height="100%"');
const rifle = gearArt({ uid: 'm-rifle', type: 'rifle', tier: 'street' }, { carrier: op, width: 96 }).replace(/width="\d+" height="\d+"/, 'width="100%" height="100%"');

const CELL = 64;
// The bag: 4 columns × 2 rows. Each item: [x, y, w, h, svg, name, effect].
const BAG = [
  [0, 0, 3, 1, rifle, 'Rifle', 'Overwatch · combat 2 shots'],
  [3, 0, 1, 1, art('picks', 'veil'), 'Ghost kit', 'Stealth +1'],
  [0, 1, 3, 1, art('deck', 'case'), 'Cyberdeck', 'Tech +1'],
  [3, 1, 1, 1, art('medkit', 'gun', 'pro'), 'Pro trauma kit', 'Medical +2'],
];
const bag = (cols = 4, rows = 2, picked = -1, ghost = null) => `
  <div class="bag" style="--cols:${cols};--rows:${rows}">
    ${Array.from({ length: cols * rows }, (_, i) => `<span class="cell" style="grid-column:${(i % cols) + 1};grid-row:${Math.floor(i / cols) + 1}"></span>`).join('')}
    ${BAG.map(([x, y, w, h, svg, name], i) => `<button class="item ${i === picked ? 'is-picked' : ''}" style="grid-column:${x + 1} / span ${w};grid-row:${y + 1} / span ${h}" aria-label="${name}">${svg}</button>`).join('')}
    ${ghost ? `<span class="ghost" style="grid-column:${ghost[0] + 1} / span ${ghost[2]};grid-row:${ghost[1] + 1} / span ${ghost[3]}"></span>` : ''}
  </div>`;
const worn = `
  <div class="worn">
    <div class="slot"><span class="lab">Armour · worn</span><span class="sq">${art('vest', 'jacket')}</span><strong>Armoured vest</strong><span class="eff">Fewer serious wounds</span></div>
    <div class="slot"><span class="lab">Implants · 2 sockets</span><span class="sockets"><span class="sq">${art('reflex', 'harness', 'pro')}</span><span class="sq">${art('cortex', 'chip')}</span></span><strong>Reflex wiring · Cortex co-processor</strong><span class="eff">Combat +2, driving +2 · tech +1, cool +1 · neural load never below 20</span></div>
  </div>`;
const list = `<ul class="carried">${BAG.map(([, , w, , , name, eff]) => `<li><b>${name}</b> <span class="eff">${eff}</span> <span class="muted">· ${w} cell${w > 1 ? 's' : ''}</span></li>`).join('')}</ul>`;

const phoneA = `<section class="phone"><p class="cap">A runner's gear: worn, and the bag (8 cells)</p>
  <h2>Gear</h2>${worn}
  <h3>Carried <span class="muted">8 of 8 cells</span></h3>${bag()}${list}
  <p class="rule">Different kinds add up (a deck and a ghost kit: tech +1 and stealth +1). The same kind counts once: two ghost kits are still +1 stealth.</p></section>`;
const phoneB = `<section class="phone"><p class="cap">Packing: tap the item, then a free space</p>
  <h2>Gear</h2>
  <h3>Carried <span class="muted">5 of 8 cells</span></h3>
  <div class="bag" style="--cols:4;--rows:2">
    ${Array.from({ length: 8 }, (_, i) => `<span class="cell ${i === 3 || i >= 4 ? 'is-free' : ''}" style="grid-column:${(i % 4) + 1};grid-row:${Math.floor(i / 4) + 1}"></span>`).join('')}
    <button class="item" style="grid-column:1 / span 3;grid-row:1">${rifle}</button>
    <button class="item" style="grid-column:4;grid-row:1">${art('picks', 'veil')}</button>
    <span class="ghost" style="grid-column:1 / span 3;grid-row:2"></span>
    <span class="ghostart" style="grid-column:1 / span 3;grid-row:2">${art('deck', 'case')}</span>
  </div>
  <div class="pickbar"><span class="sq sm">${art('deck', 'case')}</span><span><b>Cyberdeck</b> · 3 cells · tap a free space</span><button class="btn">Place</button><button class="btn ghostbtn">Cancel</button></div>
  <h3>In the stash</h3>
  <ul class="stash">
    <li class="is-on"><span class="strip">${art('deck', 'case')}</span><b>Cyberdeck</b><span class="muted">3 cells</span></li>
    <li><span class="strip"><span class="one">${art('medkit', 'gun', 'pro')}</span></span><b>Pro trauma kit</b><span class="muted">1 cell</span></li>
    <li><span class="strip"><span class="one">${art('picks', 'roll')}</span></span><b>Ghost kit</b><span class="muted">1 cell · counts once with the veil</span></li>
  </ul></section>`;

const css = `
:root { --bg:#0a0c0f; --panel:#12151b; --panel2:#161a21; --line:#2a303b; --text:#e9ecf1; --muted:#8a93a6; --cyan:#3de8d8; --display:'Rajdhani','Arial Narrow',system-ui,sans-serif; --cell:${CELL}px; }
* { box-sizing: border-box; } body { margin: 0; background: var(--bg); color: var(--text); font: 15px/1.4 system-ui, sans-serif; padding: 24px; }
.wrap { display: flex; gap: 28px; flex-wrap: wrap; align-items: flex-start; }
.phone { width: 390px; background: var(--panel); border: 1px solid var(--line); padding: 16px; }
.cap { color: var(--muted); font-size: .8rem; margin: 0 0 8px; }
h2 { font: 700 .95rem var(--display); letter-spacing: .14em; text-transform: uppercase; color: var(--cyan); margin: 4px 0 10px; }
h3 { font: 700 .8rem var(--display); letter-spacing: .14em; text-transform: uppercase; margin: 16px 0 8px; display: flex; justify-content: space-between; }
.muted { color: var(--muted); font-weight: 400; letter-spacing: 0; text-transform: none; }
.eff { color: var(--cyan); font-size: .8rem; }
.worn { display: grid; grid-template-columns: 1fr 1.4fr; gap: 8px; }
.slot { background: var(--panel2); border: 1px solid var(--line); padding: 8px; display: grid; gap: 4px; align-content: start; }
.lab { font: 600 .66rem var(--display); letter-spacing: .14em; text-transform: uppercase; color: var(--muted); }
.slot strong { font: 600 .85rem var(--display); letter-spacing: .04em; text-transform: uppercase; }
.sq { display: block; width: var(--cell); height: var(--cell); outline: 1px solid #232a35; } .sq svg { display: block; }
.sq.sm { width: 40px; height: 40px; }
.sockets { display: flex; gap: 6px; }
.bag { display: grid; grid-template-columns: repeat(var(--cols), var(--cell)); grid-template-rows: repeat(var(--rows), var(--cell)); gap: 4px; background: #0b0d11; padding: 4px; width: max-content; border: 1px solid var(--line); }
.cell { background: #0e1116; outline: 1px solid #232a35; outline-offset: -1px; }
.cell.is-free { background: rgba(61,232,216,.06); outline-color: rgba(61,232,216,.4); }
.item { padding: 0; border: 0; background: none; display: block; cursor: pointer; } .item svg { display: block; }
.item.is-picked { outline: 2px solid var(--cyan); }
.ghost { border: 1.5px dashed var(--cyan); background: rgba(61,232,216,.08); }
.ghostart { opacity: .45; pointer-events: none; } .ghostart svg { display: block; }
.carried { list-style: none; margin: 8px 0 0; padding: 0; display: grid; gap: 2px; font-size: .85rem; }
.rule { color: var(--muted); font-size: .8rem; margin: 10px 0 0; border-left: 2px solid var(--cyan); padding-left: 8px; }
.pickbar { display: grid; grid-template-columns: auto 1fr auto auto; gap: 8px; align-items: center; margin-top: 10px; background: var(--panel2); border: 1px solid var(--cyan); padding: 6px 8px; font-size: .82rem; }
.btn { min-height: 40px; padding: 0 10px; background: var(--cyan); color: #0a0c0f; border: 0; font: 700 .78rem var(--display); letter-spacing: .1em; text-transform: uppercase; }
.ghostbtn { background: none; color: var(--muted); border: 1px solid var(--line); }
.stash { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; }
.stash li { display: grid; grid-template-columns: 120px 1fr auto; gap: 10px; align-items: center; background: var(--panel2); border: 1px solid var(--line); padding: 6px 8px; font-size: .85rem; }
.stash li.is-on { border-color: var(--cyan); }
.strip { display: flex; width: 120px; height: 40px; background-color: #0b0d11; background-image: linear-gradient(90deg, transparent calc(100% - 1px), #232a35 calc(100% - 1px)); background-size: 40px 100%; outline: 1px solid #232a35; }
.strip svg { display: block; width: 100%; height: 100%; } .strip .one { width: 40px; height: 40px; }
.note { max-width: 70ch; color: var(--muted); margin: 0 0 14px; }
`;
const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Carry Grid Mock-up</title>
<link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&display=swap" rel="stylesheet"><style>${css}</style></head><body>
<p class="note">A runner's gear as worn kit plus a bag of cells. Armour is worn (one slot). Implants sit in two sockets, both counting towards neural load. Weapons and tools go in a 4×2 bag: a rifle or a deck takes 3 cells, a ghost kit or trauma kit 1. Pack by tapping the item, then a free space, as on a hall's build grid.</p>
<div class="wrap">${phoneA}${phoneB}</div></body></html>`;
const file = new URL('../drafts/prototypes/carry-grid.html', import.meta.url).pathname;
writeFileSync(file, html);
console.log('wrote', file);
const dir = process.argv[2];
if (dir) {
  mkdirSync(dir, { recursive: true });
  const { chromium } = createRequire(import.meta.url)('playwright');
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 900, height: 900 }, deviceScaleFactor: 2 });
  await p.goto(`file://${file}`); await p.waitForTimeout(700);
  const ph = p.locator('.phone');
  await ph.nth(0).screenshot({ path: `${dir}/01-gear-page-with-bag.png` });
  await ph.nth(1).screenshot({ path: `${dir}/02-packing.png` });
  await b.close();
}
