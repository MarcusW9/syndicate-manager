// Quick mockup of the battle "stage" (2026-10-30, design talk; not the game): enemies in a row at the
// top, the crew's faces at the bottom, red lines for who each enemy is aiming at, the district picture
// behind, the orders for the picked runner underneath. Uses the game's real portraits and Docks picture;
// enemy art is a rough stand-in. Writes drafts/prototypes/battle-view-mockup.html and, with --shot, a PNG.
//
//   node scripts/battle-view-mockup.mjs [--shot <png>]
import { writeFileSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { createNewGame } from '../src/core/state.js';
import { portrait } from '../src/ui/art.js';
import { docksScene } from '../src/ui/districtArt.js';

const g = createNewGame({ seed: 7, startCrew: 'fresh' });
const pick = (role) => g.crew.find((o) => o.role === role) ?? g.crew[0];
const crew = [
  { op: pick('muscle'), name: 'Jax', rank: 'VET', hp: 11, max: 15, sel: true },
  { op: pick('medic'), name: 'Stitch', rank: 'PRO', hp: 13, max: 13 },
  { op: pick('driver'), name: 'Kit', rank: 'RKE', hp: 4, max: 12 },
  { op: pick('tech'), name: 'Static', rank: 'PRO', hp: 9, max: 11, goal: true },
];
const foes = [
  { name: 'Heavy', hp: 6, max: 10, at: 3, tag: 'Charging', kind: 'heavy' },
  { name: 'Guard 2', hp: 6, max: 6, at: 2, tag: 'Aiming', kind: 'guard', hit: true },
  { name: 'Dog', hp: 4, max: 4, at: 2, tag: 'Pins', kind: 'dog' },
];
// A rough enemy bust in the portraits' manner: flat planes, red light from the right.
const enemyArt = (kind) => {
  const body = kind === 'dog'
    ? '<path d="M14 44 L22 30 L36 28 L46 20 L52 24 L50 34 L40 40 L40 50 L20 50 Z" fill="#2a1418"/><path d="M46 20 L52 24 L50 34 L46 32 Z" fill="#ff3d5f" opacity=".55"/><circle cx="47" cy="26" r="1.6" fill="#ffd36b"/>'
    : `<path d="M10 64 Q12 44 32 42 Q52 44 54 64 Z" fill="${kind === 'heavy' ? '#3a1c22' : '#2a1418'}"/><path d="M32 42 Q52 44 54 64 L40 64 Z" fill="#ff3d5f" opacity=".35"/>
       <ellipse cx="32" cy="28" rx="${kind === 'heavy' ? 12 : 10}" ry="12" fill="#3b2026"/><path d="M32 16 A12 12 0 0 1 44 28 L36 28 Z" fill="#ff3d5f" opacity=".5"/>
       <rect x="${kind === 'heavy' ? 19 : 22}" y="24" width="${kind === 'heavy' ? 26 : 20}" height="5" fill="#0b0d11"/><rect x="34" y="25" width="8" height="2" fill="#ff3d5f"/>`;
  return `<svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true"><rect width="64" height="64" fill="#160d12"/>${body}</svg>`;
};
const W = 390, stageH = 470, foeY = 96, crewY = 330;
const xs = (n, i) => Math.round(((i + 1) * W) / (n + 1));
const hp = (h, m, foe) => { const segs = Math.ceil(m / 2), lit = Math.ceil(h / 2); const c = foe ? 'foe' : h / m < 0.25 ? 'crit' : h / m < 0.5 ? 'low' : ''; return `<span class="hp ${c}">${Array.from({ length: segs }, (_, i) => `<i class="${i < lit ? 'on' : ''}"></i>`).join('')}</span>`; };
const arrows = foes.map((f, i) => { const x1 = xs(foes.length, i), x2 = xs(crew.length, f.at); return `<line x1="${x1}" y1="${foeY + 46}" x2="${x2}" y2="${crewY - 46}" class="aim ${f.kind === 'heavy' ? 'charge' : ''}"/><circle cx="${x2}" cy="${crewY - 46}" r="3.5" class="aimdot"/>`; }).join('');
const html = `<title>Battle View Mockup</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap">
<style>
:root { --bg:#0a0c0f; --panel:#12151b; --panel-2:#161a21; --line:#2a303b; --text:#e9ecf1; --muted:#8a93a6; --accent:#ff3d5f; --accent-2:#3de8d8; --warn:#f2d541; --danger:#ff4a4a; --good:#5fe0a5;
  --display:'Rajdhani','Arial Narrow',system-ui,sans-serif; --mono:'IBM Plex Mono',ui-monospace,monospace; color-scheme: dark; }
* { box-sizing: border-box; } body { margin:0; background:var(--bg); color:var(--text); font-family:system-ui,-apple-system,sans-serif; }
.top { display:flex; justify-content:space-between; align-items:center; padding:10px max(16px, env(safe-area-inset-left, 0px)); padding-right:max(16px, env(safe-area-inset-right, 0px)); font-family:var(--display); text-transform:uppercase; letter-spacing:.14em; font-weight:700; font-size:.85rem; }
.top .goal { color:var(--accent-2); border:1px solid var(--accent-2); padding:3px 8px; } .top .goal i { display:inline-block; width:10px; height:5px; background:var(--line); margin-left:2px; } .top .goal i.on { background:var(--accent-2); }
.stage { position:relative; height:${stageH}px; overflow:hidden; border-block:1px solid var(--line); }
.bg { position:absolute; inset:0; } .bg svg { width:100%; height:100%; } .bg::after { content:""; position:absolute; inset:0; background:linear-gradient(rgba(10,12,15,.55), rgba(10,12,15,.82)); }
.lines { position:absolute; inset:0; } .aim { stroke:var(--accent); stroke-width:2; stroke-dasharray:5 4; opacity:.85; } .aim.charge { stroke:#ff9a3d; stroke-dasharray:none; stroke-width:3; } .aimdot { fill:var(--accent); }
.unit { position:absolute; width:84px; margin-left:-42px; display:grid; justify-items:center; gap:3px; text-align:center; }
.ring { width:70px; height:70px; border-radius:50%; overflow:hidden; border:2px solid var(--line); background:var(--panel); position:relative; }
.foe .ring { border-color:#7a2a38; width:62px; height:62px; }
.unit.sel .ring { border-color:var(--accent-2); box-shadow:0 0 0 3px rgba(61,232,216,.25); }
.unit.goal .ring { border-color:var(--accent-2); border-style:dashed; }
.unit .nm { font-family:var(--display); font-weight:700; font-size:.78rem; text-transform:uppercase; letter-spacing:.08em; }
.unit .tag { font-family:var(--display); font-size:.66rem; letter-spacing:.1em; text-transform:uppercase; color:#ff8a98; background:rgba(22,13,18,.9); padding:1px 5px; border:1px solid #4a2230; }
.unit .rk { font-family:var(--mono); font-size:.62rem; color:var(--muted); }
.hp { display:flex; gap:2px; } .hp i { width:6px; height:5px; background:#2a303b; } .hp i.on { background:var(--accent-2); } .hp.low i.on { background:var(--warn); } .hp.crit i.on { background:var(--danger); } .hp.foe i.on { background:var(--accent); }
.pop { position:absolute; font-family:var(--display); font-weight:700; color:#fff; text-shadow:0 0 6px var(--accent); font-size:1.4rem; }
.flash { position:absolute; left:50%; transform:translateX(-50%); top:${foeY + 70}px; font-family:var(--display); font-weight:700; letter-spacing:.2em; color:var(--warn); font-size:1.1rem; text-shadow:0 0 10px rgba(242,213,65,.6); }
.outside { position:absolute; left:max(10px, env(safe-area-inset-left, 0px)); right:max(10px, env(safe-area-inset-right, 0px)); bottom:8px; display:flex; gap:8px; justify-content:center; }
.out { display:flex; align-items:center; gap:6px; background:rgba(18,21,27,.92); border:1px solid var(--line); padding:3px 8px 3px 3px; font-family:var(--display); font-size:.72rem; letter-spacing:.08em; text-transform:uppercase; }
.out .mini { width:26px; height:26px; border-radius:50%; overflow:hidden; border:1px solid var(--line); } .out b { color:var(--warn); font-weight:700; }
.sheet { padding:12px max(16px, env(safe-area-inset-left, 0px)) 0; padding-right:max(16px, env(safe-area-inset-right, 0px)); display:grid; gap:10px; }
.who { font-family:var(--display); text-transform:uppercase; letter-spacing:.1em; font-weight:700; } .who span { color:var(--muted); font-weight:500; }
.acts { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
.act { min-height:52px; border:1px solid var(--line); background:var(--panel-2); padding:6px 10px; display:grid; text-align:left; clip-path:polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,0 100%); }
.act b { font-family:var(--display); text-transform:uppercase; letter-spacing:.08em; font-size:.92rem; } .act span { font-family:var(--mono); font-size:.72rem; color:var(--accent-2); }
.act.on { border-color:var(--warn); background:#211d0c; } .act.on b { color:var(--warn); } .act.cd { opacity:.4; }
.hint { color:var(--muted); font-size:.85rem; margin:0; }
.bar { display:flex; gap:8px; padding:10px max(16px, env(safe-area-inset-left, 0px)) calc(10px + env(safe-area-inset-bottom, 0px)); padding-right:max(16px, env(safe-area-inset-right, 0px)); }
.btn { min-height:46px; padding:8px 14px; border:1px solid var(--line); background:var(--panel-2); font-family:var(--display); font-weight:700; letter-spacing:.12em; text-transform:uppercase; color:var(--accent-2); }
.btn.go { flex:1; background:var(--accent); border-color:var(--accent); color:#fff; }
.feed { padding:0 max(16px, env(safe-area-inset-left, 0px)) 16px; padding-right:max(16px, env(safe-area-inset-right, 0px)); color:var(--muted); font-size:.85rem; } .feed b { color:var(--good); font-weight:500; }
</style>
<div class="top"><span>Fight · round 2</span><span class="goal">Hold for Static <i class="on"></i><i></i><i></i></span></div>
<div class="stage">
  <div class="bg">${docksScene()}</div>
  <svg class="lines" viewBox="0 0 ${W} ${stageH}" preserveAspectRatio="none">${arrows}</svg>
  ${foes.map((f, i) => `<div class="unit foe" style="left:${xs(foes.length, i)}px; top:${foeY - 40}px"><span class="tag">${f.tag} ${crew[f.at].name}</span><div class="ring">${enemyArt(f.kind)}</div>${hp(f.hp, f.max, true)}<span class="nm">${f.name}</span></div>`).join('')}
  <div class="pop" style="left:${xs(foes.length, 0) + 30}px; top:${foeY + 4}px">−4</div>
  <div class="flash">DOUBLE TAP</div>
  ${crew.map((c, i) => `<div class="unit ${c.sel ? 'sel' : ''} ${c.goal ? 'goal' : ''}" style="left:${xs(crew.length, i)}px; top:${crewY - 44}px"><div class="ring">${portrait(c.op, { size: 70 })}</div>${hp(c.hp, c.max)}<span class="nm">${c.name}</span><span class="rk">${c.goal ? 'CRACKING 1/3' : c.rank}</span></div>`).join('')}
  <div class="outside">
    <span class="out"><span class="mini">${portrait(pick('face'), { size: 26 })}</span>Rifle <b>●●○</b></span>
    <span class="out"><span class="mini">${portrait(g.crew[5] ?? pick('infiltrator'), { size: 26 })}</span>Van</span>
    <span class="out"><span class="mini" style="opacity:.6">${portrait(pick('infiltrator'), { size: 26 })}</span>Standby</span>
  </div>
</div>
<div class="sheet">
  <div class="who">Jax <span>· Veteran · tap an enemy to target</span></div>
  <div class="acts">
    <div class="act"><b>Shoot</b><span>Heavy · 70% · 3 dmg</span></div>
    <div class="act on"><b>Double Tap</b><span>Heavy · 2 × 65% · 3 each</span></div>
    <div class="act"><b>Suppress</b><span>pins them · 70%</span></div>
    <div class="act"><b>Cover</b><span>guards need 14+</span></div>
  </div>
  <p class="hint">Two lines on Kit (Guard 2's shot and the dog), and the heavy charging Static. Stitch is set to Patch Kit.</p>
</div>
<div class="bar"><button class="btn">Auto</button><button class="btn">Pull back</button><button class="btn go">Go</button></div>
<div class="feed">Round 1: <b>Jax hits Heavy for 3.</b> The dog misses Kit. Guard 2 hits Kit for 3. Static works the safe: 1 of 3.</div>`;
writeFileSync(new URL('../drafts/prototypes/battle-view-mockup.html', import.meta.url), html);
const shot = process.argv.indexOf('--shot');
if (shot > 0) {
  const { chromium } = createRequire(import.meta.url)('playwright');
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: W, height: 844 }, deviceScaleFactor: 2 });
  await p.setContent(`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><body>${html}</body>`);
  await p.waitForTimeout(600); await p.screenshot({ path: process.argv[shot + 1], fullPage: true }); await b.close();
}
console.log('ok');
