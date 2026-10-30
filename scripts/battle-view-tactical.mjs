// Quick mockup of a tactical battle view (2026-10-30, design talk; not the game): the fight on a minimal
// top-down view of the place, in the site plans' style, with the crew and the enemies as face tokens
// behind cover, a cover mark on each, lines for who each enemy is aiming at, overwatch on the crane with
// its sight, the van and standby on the road, and the picked runner's orders underneath. Real portraits;
// enemy art is a rough stand-in. Writes drafts/prototypes/battle-view-tactical.html and, with --shot, a PNG.
//
//   node scripts/battle-view-tactical.mjs [--shot <png>]
import { writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { createNewGame } from '../src/core/state.js';
import { portrait } from '../src/ui/art.js';

const g = createNewGame({ seed: 7, startCrew: 'fresh' });
const pick = (role) => g.crew.find((o) => o.role === role) ?? g.crew[0];
const W = 390, H = 440;
const TONES = ['#1b2433', '#2a1d26', '#1d2a24', '#2b2618'];

// The yard: containers as cover, the office at the top, water on the right, the fence and road below.
const cover = [
  [36, 132, 74, 24, 0], [176, 112, 42, 22, 3], [262, 140, 78, 22, 1],   // their side
  [30, 290, 82, 26, 2], [154, 306, 46, 24, 1], [240, 292, 80, 26, 3],   // our side
  [130, 200, 26, 18, 0], [300, 214, 22, 16, 2],                          // loose crates in the middle
];
const crew = [
  { op: pick('muscle'), name: 'Jax', x: 72, y: 330, hp: 11, max: 15, cover: 'full', sel: true },
  { op: pick('medic'), name: 'Stitch', x: 178, y: 354, hp: 13, max: 13, cover: 'half' },
  { op: pick('driver'), name: 'Kit', x: 222, y: 250, hp: 4, max: 12, cover: 'none' },
  { op: pick('tech'), name: 'Static', x: 300, y: 336, hp: 9, max: 11, cover: 'full', goal: true },
];
const foes = [
  { name: 'Heavy', kind: 'heavy', x: 236, y: 186, hp: 6, max: 10, cover: 'none', at: 3, line: 'charge', odds: '65%' },
  { name: 'Guard 2', kind: 'guard', x: 197, y: 84, hp: 6, max: 6, cover: 'half', at: 2, odds: '75%' },
  { name: 'Dog', kind: 'dog', x: 118, y: 236, hp: 4, max: 4, cover: 'none', at: 2, odds: '55%' },
  { name: 'Guard 1', kind: 'guard', x: 72, y: 108, hp: 0, max: 6, cover: 'full', down: true },
];
const enemyArt = (kind) => {
  const body = kind === 'dog'
    ? '<path d="M14 44 L22 30 L36 28 L46 20 L52 24 L50 34 L40 40 L40 50 L20 50 Z" fill="#2a1418"/><path d="M46 20 L52 24 L50 34 L46 32 Z" fill="#ff3d5f" opacity=".55"/><circle cx="47" cy="26" r="1.6" fill="#ffd36b"/>'
    : `<path d="M10 64 Q12 44 32 42 Q52 44 54 64 Z" fill="${kind === 'heavy' ? '#3a1c22' : '#2a1418'}"/><path d="M32 42 Q52 44 54 64 L40 64 Z" fill="#ff3d5f" opacity=".35"/><ellipse cx="32" cy="28" rx="${kind === 'heavy' ? 12 : 10}" ry="12" fill="#3b2026"/><path d="M32 16 A12 12 0 0 1 44 28 L36 28 Z" fill="#ff3d5f" opacity=".5"/><rect x="${kind === 'heavy' ? 19 : 22}" y="24" width="${kind === 'heavy' ? 26 : 20}" height="5" fill="#0b0d11"/><rect x="34" y="25" width="8" height="2" fill="#ff3d5f"/>`;
  return `<svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true"><rect width="64" height="64" fill="#160d12"/>${body}</svg>`;
};
// XCOM's cover marks: a full shield, a half shield, or open ground.
const shield = (c) => (c === 'full' ? '<svg viewBox="0 0 12 14" class="sh full"><path d="M6 0 L12 2.5 V7 C12 10.5 9 13 6 14 C3 13 0 10.5 0 7 V2.5 Z"/></svg>'
  : c === 'half' ? '<svg viewBox="0 0 12 14" class="sh half"><path d="M6 0 L12 2.5 V7 C12 10.5 9 13 6 14 C3 13 0 10.5 0 7 V2.5 Z" fill="none"/><path d="M0 7 H12 C12 10.5 9 13 6 14 C3 13 0 10.5 0 7 Z"/></svg>'
  : '<span class="open">OPEN</span>');
const hp = (h, m, foe) => { const segs = Math.ceil(m / 2), lit = Math.ceil(h / 2); const c = foe ? 'foe' : h / m < 0.25 ? 'crit' : h / m < 0.5 ? 'low' : ''; return `<span class="hp ${c}">${Array.from({ length: segs }, (_, i) => `<i class="${i < lit ? 'on' : ''}"></i>`).join('')}</span>`; };

const lines = foes.filter((f) => !f.down).map((f) => {
  const t = crew[f.at]; const mx = (f.x + t.x) / 2, my = (f.y + t.y) / 2;
  return `<line x1="${f.x}" y1="${f.y}" x2="${t.x}" y2="${t.y}" class="aim ${f.line ?? ''}"/><g transform="translate(${mx} ${my})"><rect x="-16" y="-8" width="32" height="15" class="oddsbg"/><text class="odds" text-anchor="middle" y="3">${f.odds}</text></g>`;
}).join('');
const arena = `<svg viewBox="0 0 ${W} ${H}" class="arena" aria-hidden="true">
  <defs><pattern id="grid" width="26" height="26" patternUnits="userSpaceOnUse"><path d="M26 0 H0 V26" fill="none" stroke="rgba(61,232,216,0.05)"/></pattern></defs>
  <rect width="${W}" height="${H}" fill="#0b0d11"/><rect width="${W}" height="${H}" fill="url(#grid)"/>
  <rect x="368" y="0" width="22" height="${H}" fill="#0d1620"/>
  <rect x="250" y="-4" width="112" height="78" fill="#171b24" stroke="#4a5266" stroke-width="1.5"/><rect x="247" y="46" width="5" height="14" fill="#ff3d5f" opacity=".6"/><text x="262" y="20" class="lbl hi">YARD OFFICE</text>
  <polygon points="40,14 0,190 300,190 238,14" fill="rgba(245,185,66,0.05)" stroke="rgba(245,185,66,0.25)" stroke-dasharray="3 4"/>
  <line x1="18" y1="14" x2="64" y2="14" stroke="#7a6430" stroke-width="3"/><line x1="22" y1="14" x2="22" y2="30" stroke="#7a6430" stroke-width="3"/><line x1="60" y1="14" x2="60" y2="30" stroke="#7a6430" stroke-width="3"/>
  ${cover.map(([x, y, w, h, t]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="1.5" fill="${TONES[t]}" stroke="#2b3240"/>`).join('')}
  <rect x="334" y="352" width="22" height="16" fill="#12303a" stroke="#3de8d8"/><text x="332" y="380" class="lbl" fill="#3de8d8">SAFE</text>
  <line x1="0" y1="396" x2="${W}" y2="396" stroke="#4a5266" stroke-width="1.5" stroke-dasharray="1.5 2"/>
  <rect x="0" y="404" width="368" height="36" fill="#12141a"/><text x="200" y="426" class="lbl">ROAD</text>
  <text x="96" y="10" class="lbl">CRANE</text><text x="300" y="134" class="lbl">CONTAINERS</text>
  <line x1="72" y1="330" x2="236" y2="186" class="mine"/>
  ${lines}
</svg>`;
const token = (u, foe) => `<div class="tok ${foe ? 'foe' : ''} ${u.sel ? 'sel' : ''} ${u.goal ? 'goal' : ''} ${u.down ? 'down' : ''}" style="left:${u.x}px; top:${u.y}px">
  <div class="ring">${foe ? enemyArt(u.kind) : portrait(u.op, { size: 40 })}</div>
  <div class="cv">${shield(u.cover)}</div>
  <div class="under">${hp(u.hp, u.max, foe)}<span class="nm">${u.name}${u.goal ? ' · 1/3' : ''}</span></div></div>`;
const html = `<title>Tactical Battle View</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap">
<style>
:root { --bg:#0a0c0f; --panel:#12151b; --panel-2:#161a21; --line:#2a303b; --text:#e9ecf1; --muted:#8a93a6; --accent:#ff3d5f; --accent-2:#3de8d8; --warn:#f2d541; --danger:#ff4a4a; --good:#5fe0a5;
  --display:'Rajdhani','Arial Narrow',system-ui,sans-serif; --mono:'IBM Plex Mono',ui-monospace,monospace; color-scheme: dark; }
* { box-sizing:border-box; } body { margin:0; background:var(--bg); color:var(--text); font-family:system-ui,-apple-system,sans-serif; }
.top { display:flex; justify-content:space-between; align-items:center; padding:10px max(16px, env(safe-area-inset-right, 0px)) 10px max(16px, env(safe-area-inset-left, 0px)); font-family:var(--display); text-transform:uppercase; letter-spacing:.14em; font-weight:700; font-size:.85rem; }
.top .goal { color:var(--accent-2); border:1px solid var(--accent-2); padding:3px 8px; } .top .goal i { display:inline-block; width:10px; height:5px; background:var(--line); margin-left:2px; } .top .goal i.on { background:var(--accent-2); }
.stage { position:relative; width:${W}px; max-width:100%; height:${H}px; margin:0 auto; border-block:1px solid var(--line); overflow:hidden; }
.arena { position:absolute; inset:0; width:100%; height:100%; }
.lbl { fill:#6b7385; font:8px var(--mono); letter-spacing:.08em; } .lbl.hi { fill:var(--text); }
.aim { stroke:var(--accent); stroke-width:1.6; stroke-dasharray:5 4; opacity:.9; } .aim.charge { stroke:#ff9a3d; stroke-dasharray:none; stroke-width:2.5; }
.mine { stroke:var(--accent-2); stroke-width:2; opacity:.85; }
.oddsbg { fill:#160d12; stroke:#4a2230; } .odds { fill:#ff8a98; font:600 9px var(--mono); }
.tok { position:absolute; width:0; height:0; }
.ring { position:absolute; left:-20px; top:-20px; width:40px; height:40px; border-radius:50%; overflow:hidden; border:2px solid #4a5266; background:var(--panel); }
.tok.foe .ring { border-color:#a33244; } .tok.sel .ring { border-color:var(--accent-2); box-shadow:0 0 0 3px rgba(61,232,216,.3); } .tok.goal .ring { border-color:var(--accent-2); border-style:dashed; }
.tok.down { opacity:.35; } .tok.down .ring { border-color:#555; }
.cv { position:absolute; left:14px; top:-24px; } .sh { width:12px; height:14px; display:block; } .sh path { fill:var(--accent-2); stroke:var(--accent-2); } .sh.half path:first-child { stroke:var(--accent-2); }
.tok.foe .sh path { fill:#ff8a98; stroke:#ff8a98; }
.open { font:600 7px var(--mono); color:var(--warn); border:1px solid var(--warn); padding:0 2px; background:#211d0c; }
.under { position:absolute; left:-30px; width:60px; top:22px; display:grid; justify-items:center; gap:1px; }
.tok.foe .under { top:-40px; }
.nm { font-family:var(--display); font-weight:700; font-size:.68rem; letter-spacing:.08em; text-transform:uppercase; text-shadow:0 0 4px #000; white-space:nowrap; }
.hp { display:flex; gap:1px; } .hp i { width:5px; height:4px; background:#2a303b; } .hp i.on { background:var(--accent-2); } .hp.low i.on { background:var(--warn); } .hp.crit i.on { background:var(--danger); } .hp.foe i.on { background:var(--accent); }
.pop { position:absolute; font-family:var(--display); font-weight:700; color:#fff; text-shadow:0 0 6px var(--accent); font-size:1.2rem; }
.flash { position:absolute; font-family:var(--display); font-weight:700; letter-spacing:.2em; color:var(--warn); font-size:.95rem; text-shadow:0 0 10px rgba(242,213,65,.6); }
.mini { position:absolute; display:flex; align-items:center; gap:4px; font-family:var(--display); font-size:.66rem; letter-spacing:.08em; text-transform:uppercase; background:rgba(18,21,27,.92); border:1px solid var(--line); padding:2px 6px 2px 2px; }
.mini .m { width:22px; height:22px; border-radius:50%; overflow:hidden; } .mini b { color:var(--warn); }
.sheet { padding:12px max(16px, env(safe-area-inset-right, 0px)) 0 max(16px, env(safe-area-inset-left, 0px)); display:grid; gap:10px; max-width:560px; margin:0 auto; }
.who { font-family:var(--display); text-transform:uppercase; letter-spacing:.1em; font-weight:700; } .who span { color:var(--muted); font-weight:500; }
.acts { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
.act { min-height:52px; border:1px solid var(--line); background:var(--panel-2); padding:6px 10px; display:grid; clip-path:polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,0 100%); }
.act b { font-family:var(--display); text-transform:uppercase; letter-spacing:.08em; font-size:.92rem; } .act span { font-family:var(--mono); font-size:.72rem; color:var(--accent-2); }
.act.on { border-color:var(--warn); background:#211d0c; } .act.on b { color:var(--warn); }
.hint { color:var(--muted); font-size:.85rem; margin:0; }
.bar { display:flex; gap:8px; padding:10px max(16px, env(safe-area-inset-right, 0px)) calc(10px + env(safe-area-inset-bottom, 0px)) max(16px, env(safe-area-inset-left, 0px)); max-width:560px; margin:0 auto; }
.btn { min-height:46px; padding:8px 14px; border:1px solid var(--line); background:var(--panel-2); font-family:var(--display); font-weight:700; letter-spacing:.12em; text-transform:uppercase; color:var(--accent-2); }
.btn.go { flex:1; background:var(--accent); border-color:var(--accent); color:#fff; }
</style>
<div class="top"><span>Fight · round 2</span><span class="goal">Hold for Static <i class="on"></i><i></i><i></i></span></div>
<div class="stage">
  ${arena}
  ${foes.map((f) => token(f, true)).join('')}
  ${crew.map((c) => token(c, false)).join('')}
  <div class="pop" style="left:262px; top:180px">−4</div>
  <div class="flash" style="left:126px; top:122px">DOUBLE TAP</div>
  <div class="mini" style="left:22px; top:22px"><span class="m">${portrait(pick('face'), { size: 22 })}</span>Rifle <b>●●○</b></div>
  <div class="mini" style="left:20px; top:408px"><span class="m">${portrait(g.crew[5] ?? pick('infiltrator'), { size: 22 })}</span>Van</div>
  <div class="mini" style="left:96px; top:408px"><span class="m" style="opacity:.6">${portrait(pick('infiltrator'), { size: 22 })}</span>Standby</div>
</div>
<div class="sheet">
  <div class="who">Jax <span>· Veteran · full cover · tap an enemy</span></div>
  <div class="acts">
    <div class="act"><b>Shoot</b><span>Heavy · 70% · in the open</span></div>
    <div class="act on"><b>Double Tap</b><span>Heavy · 2 × 65% · 3 each</span></div>
    <div class="act"><b>Suppress</b><span>Guard 2 · 60% · half cover</span></div>
    <div class="act"><b>Move</b><span>Kit's crate · flank the dog</span></div>
  </div>
  <p class="hint">Kit is in the open with two lines on him. The heavy left cover to charge Static: he's easy to hit now.</p>
</div>
<div class="bar"><button class="btn">Auto</button><button class="btn">Pull back</button><button class="btn go">Go</button></div>`;
writeFileSync(new URL('../drafts/prototypes/battle-view-tactical.html', import.meta.url), html);
const shot = process.argv.indexOf('--shot');
if (shot > 0) {
  const { chromium } = createRequire(import.meta.url)('playwright');
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: W, height: 844 }, deviceScaleFactor: 2 });
  await p.setContent(`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><body>${html}</body>`);
  await p.waitForTimeout(600); await p.screenshot({ path: process.argv[shot + 1], fullPage: true }); await b.close();
}
console.log('ok');
