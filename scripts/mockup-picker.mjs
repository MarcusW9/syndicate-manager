// Mock-up (2026-11-06, the owner's playtest: the picker "a bit of a chore"): the inside-team picker
// for The Favourite (social, stealth, medical), with the crew from the owner's screenshot. Real
// portraits (ui/art.js), invented layout. Writes drafts/prototypes/picker.html; with an out dir,
// also screenshots it on a phone (390) and a computer (1280).
//   node scripts/mockup-picker.mjs [out dir]
import { writeFileSync, mkdirSync } from 'node:fs';
import { createNewGame } from '../src/core/state.js';
import { generateRecruit } from '../src/core/recruits.js';
import { portrait } from '../src/ui/art.js';
import { createRequire } from 'node:module';

const st = createNewGame({ seed: 5, startCrew: 'fresh' });
const pool = [...st.crew];
for (let i = 0; pool.length < 10; i++) pool.push(generateRecruit(st, {}));
// [handle, role, social, stealth, medical, gain, status, group]
const ROWS = [
  ['Parity', 'medic', 7, 6, 12, null, '15%', 'free'],
  ['Cortex', 'medic', 5, 5, 9, 'learns on the job', 'ready', 'crew'],
  ['Crow', 'tech', 5, 7, 5, '1 point from pro', 'ready', 'crew'],
  ['Plug', 'driver', 6, 2, 6, 'learns on the job', 'ready', 'crew'],
  ['Dim Sum', 'tech', 5, 6, 2, 'learns on the job', 'ready', 'crew'],
  ['Sampan', 'driver', 3, 7, 3, null, '15%', 'free'],
  ['Vector', 'face', 12, 7, 3, 'learns on the job', 'INSIDE', 'placed'],
  ['Siphon', 'face', 13, 9, 2, '2 points from pro', 'INSIDE', 'placed'],
  ['Grid', 'muscle', 4, 3, 4, null, 'hurt · 3 days', 'out'],
];
const KEYS = ['Social', 'Stealth', 'Medical'];
const WANT = 10;
const tone = (v) => (v >= WANT ? 'good' : v >= WANT - 2 ? 'near' : 'short');
const best = (r) => Math.max(r[2], r[3], r[4]);
const face = (i, size) => `<span class="pface" style="width:${size}px;height:${size}px">${portrait(pool[i % pool.length], { size })}</span>`;
const people = ROWS.map((r, i) => ({ r, i }));
const crew = people.filter((p) => p.r[7] === 'crew').sort((a, b) => best(b.r) - best(a.r));
const free = people.filter((p) => p.r[7] === 'free').sort((a, b) => best(b.r) - best(a.r));
const placed = people.filter((p) => p.r[7] === 'placed');
const out = people.filter((p) => p.r[7] === 'out');
const JOSS = 'Cortex'; // Joss's pick for this slot: best medical among your own crew

// --- phone: cards in groups ---------------------------------------------------------------
const card = ({ r, i }, kind) => {
  const [h, role, ...rest] = r; const vals = rest.slice(0, 3); const gain = rest[3]; const stat = rest[4];
  const top = vals.indexOf(Math.max(...vals));
  return `<li><button class="pc ${kind ? `pc--${kind}` : ''}">
    ${face(i, 44)}
    <span class="pc__who"><span><strong>${h}</strong> <span class="muted">${kind === 'free' ? `freelance ${role}` : role}</span>${h === JOSS ? ' <span class="joss">Joss picks</span>' : ''}</span>
      <span class="pc__big t-${tone(vals[top])}">${KEYS[top]} <b>${vals[top]}</b></span>
      <span class="pc__rest">${vals.map((v, k) => (k === top ? '' : `<span class="t-${tone(v)}">${KEYS[k]} ${v}</span>`)).filter(Boolean).join(' · ')}</span>
      ${gain ? `<span class="pc__gain">${gain}</span>` : ''}</span>
    <span class="pc__side">${kind === 'free' ? `<span class="hire">Freelance</span><b>${stat}</b> of pay` : kind === 'placed' ? `<span class="where">${stat}</span>` : `<span class="ready">${stat}</span>`}</span>
  </button></li>`;
};
const phone = `
  <div class="sheet sheet--phone">
    <div class="sheet__head"><h2>Who's on the inside team?</h2><span class="x">✕</span></div>
    <p class="want">The Favourite wants about <b>${WANT}</b> in <b>social, stealth or medical</b>.</p>
    <p class="legend"><span class="t-good">● ${WANT}+ ready for it</span><span class="t-near">● close</span><span class="t-short">● short</span></p>
    <div class="sort" role="group"><span class="sort__l">Sort</span><button class="is-on">Best fit</button><button>Social</button><button>Stealth</button><button>Medical</button></div>
    <h3 class="grp">Your crew <span>${crew.length} free</span></h3>
    <ul class="pcs">${crew.map((p) => card(p)).join('')}</ul>
    <h3 class="grp grp--free">Freelancers <span>they take a cut of the pay</span></h3>
    <ul class="pcs">${free.map((p) => card(p, 'free')).join('')}</ul>
    <h3 class="grp">Already on the squad <span>tap to move them here</span></h3>
    <ul class="pcs">${placed.map((p) => card(p, 'placed')).join('')}</ul>
    <button class="fold">Not free today (${out.length}) ▸</button>
  </div>`;

// --- computer: a table ------------------------------------------------------------------
const cell = (v) => `<td class="num"><span class="pill t-${tone(v)}">${v}</span></td>`;
const row = ({ r, i }, kind) => {
  const [h, role, a, b, c, gain, stat] = r;
  return `<tr class="${kind ? `tr--${kind}` : ''}"><td class="who"><div class="whoin">${face(i, 36)}<span><strong>${h}</strong>${h === JOSS ? ' <span class="joss">Joss picks</span>' : ''}<br><span class="muted small">${kind === 'free' ? `freelance ${role}` : role}</span></span></div></td>
    ${cell(a)}${cell(b)}${cell(c)}<td class="small gain">${gain ?? '<span class="muted">—</span>'}</td>
    <td class="side">${kind === 'free' ? `<span class="hire">Freelance</span> <b>${stat}</b> of pay` : kind === 'placed' ? `<span class="where">${stat}</span>` : kind === 'out' ? `<span class="muted">${stat}</span>` : `<span class="ready">${stat}</span>`}</td></tr>`;
};
const group = (label, note, list, kind, cls = '') => `<tr class="tgrp ${cls}"><th colspan="6">${label} <span>${note}</span></th></tr>${list.map((p) => row(p, kind)).join('')}`;
const desk = `
  <div class="sheet sheet--desk">
    <div class="sheet__head"><h2>Who's on the inside team?</h2><span class="x">✕</span></div>
    <p class="want">The Favourite wants about <b>${WANT}</b> in <b>social, stealth or medical</b>. <span class="legend"><span class="t-good">● ${WANT}+ ready for it</span><span class="t-near">● close</span><span class="t-short">● short</span></span></p>
    <table class="pt">
      <thead><tr><th>Runner</th><th class="num is-sort">Social</th><th class="num">Stealth</th><th class="num is-on">Medical ▾</th><th>This job</th><th></th></tr></thead>
      <tbody>
        ${group('Your crew', `${crew.length} free`, [...crew].sort((x, y) => y.r[4] - x.r[4]))}
        ${group('Freelancers', 'they take a cut of the pay', free, 'free', 'tgrp--free')}
        ${group('Already on the squad', 'tap to move them here', placed, 'placed')}
        ${group('Not free today', '', out, 'out')}
      </tbody>
    </table>
    <p class="muted small foot">Tap a column to sort by it (here: medical). Tap a row to put them in.</p>
  </div>`;

const css = `
:root { --bg:#0a0c0f; --panel:#12151b; --panel-2:#161a21; --line:#2a303b; --text:#e9ecf1; --muted:#8a93a6; --accent:#ff3d5f; --accent-2:#3de8d8; --good:#5fe0a5; --near:#f2b544; --short:#ff6b6b; --fan:#b48cff; --display:'Rajdhani','Arial Narrow',system-ui,sans-serif; }
* { box-sizing: border-box; } body { margin:0; background:var(--bg); color:var(--text); font:15px/1.45 system-ui,-apple-system,'Segoe UI',Roboto,sans-serif; }
button { font: inherit; color: inherit; background: none; border: 0; cursor: pointer; }
.muted { color: var(--muted); } .small { font-size: .8rem; }
.page { padding: 24px; display: grid; gap: 40px; justify-content: center; }
.cap { font-family: var(--display); letter-spacing: .14em; text-transform: uppercase; color: var(--muted); font-size: .8rem; margin: 0 0 8px; }
.sheet { background: var(--panel); border: 1px solid var(--line); padding: 18px 16px 20px; clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%); }
.sheet--phone { width: 390px; } .sheet--desk { width: 920px; padding: 22px 24px; }
.sheet__head { display: flex; justify-content: space-between; align-items: center; }
h2 { margin: 0; font: 700 1.05rem var(--display); letter-spacing: .14em; text-transform: uppercase; }
.x { color: var(--accent-2); font-size: 1.3rem; }
.want { margin: 8px 0 4px; } .want b { color: var(--text); }
.legend { display: inline-flex; gap: 12px; font-size: .78rem; margin: 0 0 10px; } .sheet--desk .legend { margin-left: 10px; }
.t-good { color: var(--good); } .t-near { color: var(--near); } .t-short { color: var(--short); }
.sort { display: flex; gap: 6px; align-items: center; margin: 4px 0 6px; flex-wrap: wrap; }
.sort__l { font: 600 .75rem var(--display); letter-spacing: .12em; text-transform: uppercase; color: var(--muted); }
.sort button { min-height: 36px; padding: 0 10px; border: 1px solid var(--line); font: 600 .8rem var(--display); letter-spacing: .08em; text-transform: uppercase; color: var(--muted); }
.sort button.is-on { border-color: var(--accent-2); color: var(--accent-2); }
.grp { display: flex; justify-content: space-between; align-items: baseline; margin: 16px 0 6px; font: 700 .85rem var(--display); letter-spacing: .14em; text-transform: uppercase; color: var(--accent-2); }
.grp span { font: 400 .75rem system-ui; letter-spacing: 0; text-transform: none; color: var(--muted); }
.grp--free { color: var(--fan); }
.pcs { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; }
.pc { width: 100%; display: grid; grid-template-columns: 44px minmax(0,1fr) auto; gap: 10px; align-items: center; padding: 8px 10px; text-align: left; background: var(--panel-2); border: 1px solid var(--line); }
.pc--free { border-left: 3px solid var(--fan); }
.pc--placed { opacity: .55; border-style: dashed; }
.pc__who { display: grid; gap: 1px; } .pc__who strong { font-size: 1rem; }
.pc__big { font: 700 1.05rem var(--display); letter-spacing: .06em; text-transform: uppercase; } .pc__big b { font-size: 1.25rem; }
.pc__rest { font-size: .8rem; } .pc__gain { font-size: .78rem; color: var(--accent-2); }
.pc__side { text-align: right; font-size: .85rem; display: grid; justify-items: end; gap: 2px; }
.hire { font: 700 .7rem var(--display); letter-spacing: .14em; text-transform: uppercase; color: var(--fan); }
.ready { font: 700 .8rem var(--display); color: var(--good); background: rgba(95,224,165,.1); padding: 2px 8px; }
.where { font: 700 .75rem var(--display); letter-spacing: .12em; color: var(--muted); border: 1px solid var(--line); padding: 2px 8px; }
.joss { font: 700 .68rem var(--display); letter-spacing: .12em; text-transform: uppercase; color: #0a0c0f; background: var(--accent-2); padding: 1px 5px; vertical-align: 2px; }
.fold { width: 100%; min-height: 44px; margin-top: 14px; border: 1px dashed var(--line); color: var(--muted); font: 600 .85rem var(--display); letter-spacing: .1em; text-transform: uppercase; }
.pface { display: inline-block; overflow: hidden; flex: 0 0 auto; } .pface svg { display: block; width: 100%; height: 100%; }
.pt { width: 100%; border-collapse: separate; border-spacing: 0 4px; margin-top: 8px; }
.pt th { text-align: left; font: 600 .75rem var(--display); letter-spacing: .14em; text-transform: uppercase; color: var(--muted); padding: 4px 10px; }
.pt thead th.num { text-align: center; cursor: pointer; } .pt thead th.is-on { color: var(--accent-2); box-shadow: inset 0 -2px 0 var(--accent-2); }
.pt td { background: var(--panel-2); padding: 6px 10px; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); }
.pt td:first-child { border-left: 1px solid var(--line); } .pt td:last-child { border-right: 1px solid var(--line); text-align: right; }
.pt td.who { min-width: 220px; } .whoin { display: flex; gap: 10px; align-items: center; }
.pt td.num { text-align: center; width: 90px; }
.pill { display: inline-block; min-width: 38px; padding: 2px 8px; font: 700 1.05rem var(--display); text-align: center; }
.pill.t-good { background: rgba(95,224,165,.14); } .pill.t-near { background: rgba(242,181,68,.12); } .pill.t-short { background: rgba(255,107,107,.08); opacity: .85; }
.pt .gain { color: var(--accent-2); }
.tgrp th { padding-top: 14px; color: var(--accent-2); font-size: .85rem; } .tgrp th span { font: 400 .75rem system-ui; letter-spacing: 0; text-transform: none; color: var(--muted); margin-left: 8px; }
.tgrp--free th { color: var(--fan); }
.tr--free td:first-child { border-left: 3px solid var(--fan); }
.tr--placed td, .tr--out td { opacity: .5; } .tr--placed td { border-top-style: dashed; border-bottom-style: dashed; } .tr--placed td:first-child { border-left-style: dashed; } .tr--placed td:last-child { border-right-style: dashed; }
.foot { margin: 10px 0 0; }
`;
const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Squad Picker Mock-up</title>
<link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&display=swap" rel="stylesheet">
<style>${css}</style></head><body><div class="page">
<section><p class="cap">Phone (390): cards in groups, the stat that counts big</p>${phone}</section>
<section><p class="cap">Computer: a table to compare, sorted by a column</p>${desk}</section>
</div></body></html>`;
const file = new URL('../drafts/prototypes/picker.html', import.meta.url).pathname;
writeFileSync(file, html);
console.log('wrote', file);

const dir = process.argv[2];
if (dir) {
  mkdirSync(dir, { recursive: true });
  const { chromium } = createRequire(import.meta.url)('playwright');
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1400, height: 900 }, deviceScaleFactor: 2 });
  await p.goto(`file://${file}`); await p.waitForTimeout(800);
  await p.locator('.sheet--phone').screenshot({ path: `${dir}/picker-phone.png` });
  await p.locator('.sheet--desk').screenshot({ path: `${dir}/picker-desktop.png` });
  await b.close();
}
