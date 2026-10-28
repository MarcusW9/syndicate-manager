// Design session (2026-10-28): the rifle as an item, drawn like the portraits (flat colour, hard
// light from the right, one city light, no outlines). Writes drafts/prototypes/rifle-item-options.html.
// Run: node scripts/rifle-item-options.mjs

import { writeFileSync } from 'node:fs';
import { portrait, faceOf, hash, mix } from '../src/ui/art.js';
import { createNewGame } from '../src/core/state.js';

const SHADOW = '#1b2340';
const LIGHTS = { cyan: '#3de8d8', red: '#ff3d5f', sodium: '#f2b544', violet: '#9b8cff' };
let uid = 0;

/**
 * The rifle as an item, in a 96x32 frame, muzzle to the right. light: the city light it catches
 * (the carrier's, or sodium in the stash). neon: the pro version's accent.
 */
export function rifleItem({ tier = 'street', light = LIGHTS.sodium, neon = '#3de8d8', width = 288, bg = true } = {}) {
  const id = `ri${++uid}`;
  const pro = tier === 'pro';
  const metal = pro ? '#1d2129' : '#454c57';
  const dark = pro ? '#121519' : '#2b3038';
  const lit = (c, t = 0.45) => mix(c, light, t);
  const shade = (c) => mix(c, SHADOW, 0.45);
  const stock = pro ? '#272c35' : '#6b4a2e';
  const parts = [];
  // Stock: an old wooden one on the street rifle, a skeleton polymer one on the pro.
  parts.push(`<path d="M6 12.6 L12 12 L25 13.6 L25 19.4 L19 19.8 L13 21.4 L6 21.8 Z" fill="${stock}"/>`);
  parts.push(`<path d="M6 12.6 L12 12 L25 13.6 L25 14.4 L12 12.9 L6 13.5 Z" fill="${lit(stock, 0.5)}"/>`);
  parts.push(`<path d="M6 21.8 L13 21.4 L19 19.8 L25 19.4 L25 18.6 L19 19 L13 20.6 L6 21 Z" fill="${shade(stock)}"/>`);
  if (pro) parts.push(`<path d="M12.5 15.2 Q16 14.6 19.5 15.6 L19 18.2 Q15.8 18.4 13 18.8 Z" fill="#0d1016" opacity="0.85"/>`); // thumbhole
  else parts.push(`<path d="M8 15 Q15 14.2 23 15.4 M8 17.6 Q15 17 22 18" stroke="${shade(stock)}" stroke-width="0.35" fill="none" opacity="0.8"/>`); // grain
  parts.push(`<rect x="5.2" y="12.4" width="1.6" height="9.6" rx="0.4" fill="${dark}"/>`); // butt pad
  parts.push(`<rect x="12.5" y="10.6" width="8.5" height="2" rx="0.8" fill="${pro ? dark : stock}"/><rect x="12.5" y="10.6" width="8.5" height="0.6" rx="0.3" fill="${lit(pro ? dark : stock, 0.5)}"/>`); // cheek rest
  // Grip, trigger, magazine.
  parts.push(`<path d="M29.6 19 L34 19 L32.4 25.4 L28.6 25.2 Z" fill="${dark}"/>`);
  if (!pro) parts.push(`<path d="M29.4 21 L33.4 21.2 M29 22.6 L33 22.8 M28.8 24.2 L32.6 24.3" stroke="#f2b544" stroke-width="0.5" opacity="0.55"/>`); // grip tape
  parts.push(`<path d="M34.4 19.2 Q35 21.8 37.6 21.6" stroke="${dark}" stroke-width="0.7" fill="none"/>`);
  parts.push(`<path d="M37.6 19 L41.4 19 L42 24.6 L38.2 25 Z" fill="${dark}"/><path d="M41.4 19 L42 24.6 L41.2 24.7 L40.7 19 Z" fill="${lit(dark, 0.4)}"/>`);
  // Receiver, bolt.
  parts.push(`<rect x="25" y="13.2" width="19" height="6" fill="${metal}"/><rect x="25" y="13.2" width="19" height="1" fill="${lit(metal)}"/><rect x="25" y="18.2" width="19" height="1" fill="${shade(metal)}"/>`);
  parts.push(`<path d="M28 16 h7 M37 16 h5" stroke="${shade(metal)}" stroke-width="0.4"/>`);
  parts.push(`<path d="M40.6 14 L43 11.4" stroke="${metal}" stroke-width="0.9" stroke-linecap="round"/><circle cx="43.2" cy="11.2" r="1" fill="${lit(metal, 0.5)}"/>`);
  // Handguard with vents, barrel, suppressor.
  parts.push(`<rect x="44" y="13.8" width="18" height="4.6" fill="${pro ? metal : dark}"/><rect x="44" y="13.8" width="18" height="0.8" fill="${lit(pro ? metal : dark, 0.45)}"/>`);
  parts.push([46, 49.5, 53, 56.5].map((x) => `<rect x="${x}" y="15.3" width="2.2" height="1.4" rx="0.5" fill="#0d1016" opacity="0.8"/>`).join(''));
  parts.push(`<rect x="62" y="15.2" width="19" height="1.8" fill="${metal}"/><rect x="62" y="15.2" width="19" height="0.55" fill="${lit(metal)}"/>`);
  parts.push(`<rect x="81" y="14.3" width="11" height="3.6" rx="0.7" fill="${dark}"/><rect x="81" y="14.3" width="11" height="0.9" rx="0.45" fill="${lit(dark, 0.5)}"/>`);
  parts.push(`<path d="M83 16.6 h7" stroke="${shade(dark)}" stroke-width="0.4"/>`);
  // Folded bipod.
  parts.push(`<path d="M52 18.4 L61.5 19.6 M52 18.9 L61 20.3" stroke="${dark}" stroke-width="0.6"/>`);
  // Scope: rings, tube, objective bell, eyepiece, and the lens catching the light.
  parts.push(`<rect x="29.6" y="10.8" width="1.6" height="2.6" fill="${dark}"/><rect x="38.4" y="10.8" width="1.6" height="2.6" fill="${dark}"/>`);
  parts.push(`<rect x="26.4" y="7.8" width="17.6" height="3.2" rx="1.5" fill="${dark}"/><rect x="26.4" y="7.8" width="17.6" height="0.9" rx="0.45" fill="${lit(dark, 0.55)}"/>`);
  parts.push(`<path d="M44 7.4 L48.6 6.6 L48.6 12.2 L44 11.4 Z" fill="${dark}"/><path d="M44 7.4 L48.6 6.6 L48.6 7.5 L44 8.1 Z" fill="${lit(dark, 0.55)}"/>`);
  parts.push(`<rect x="24.4" y="8" width="2.4" height="2.8" rx="0.6" fill="${dark}"/>`);
  parts.push(`<rect x="48" y="6.9" width="0.9" height="5" rx="0.4" fill="${light}"/>`);
  if (pro) {
    parts.push(`<path d="M25.6 17.6 H43.4 M44.6 17.6 H61.4" stroke="${neon}" stroke-width="0.5"/>`);
    parts.push(`<rect x="32" y="8.9" width="5" height="0.7" fill="${neon}"/>`);
    parts.push(`<circle cx="27.4" cy="16" r="0.7" fill="${neon}"/>`);
  }
  // Sling, hanging below.
  parts.push(`<path d="M15 21.4 Q34 31 54 18.6" stroke="${pro ? '#1a1d24' : '#3a3125'}" stroke-width="1.4" fill="none"/><path d="M15 21 Q34 30.4 54 18.2" stroke="${lit(pro ? '#1a1d24' : '#3a3125', 0.3)}" stroke-width="0.35" fill="none"/>`);
  const back = bg ? `<defs><linearGradient id="${id}" x1="1" x2="0"><stop offset="0" stop-color="${light}" stop-opacity="0.2"/><stop offset="0.35" stop-color="${light}" stop-opacity="0.09"/><stop offset="0.75" stop-color="${light}" stop-opacity="0.02"/><stop offset="1" stop-color="${light}" stop-opacity="0"/></linearGradient></defs>
    <rect width="96" height="32" fill="#0d1016"/><rect width="96" height="32" fill="url(#${id})"/>` : '';
  return `<svg viewBox="0 0 96 32" width="${width}" height="${(width * 32) / 96}" aria-hidden="true">${back}${parts.join('')}</svg>`;
}

// --- the corrected B: lower on the back and steeper, resting across the shoulders ---------
function onBack(op, tier, { at = [8, 70], angle = -42, scale = 0.74 } = {}) {
  const light = CITY[hash(`${op.id}|light`) % 4];
  const art = rifleItem({ tier, light, neon: faceOf(op).chromeColor, bg: false }).replace(/<svg[^>]*>|<\/svg>/g, '');
  let svg = portrait(op, { size: 104 });
  svg = svg.replace(/(<rect x="0" y="0" width="64" height="64" fill="url\(#[^)]+\)"\/>)/, `$1<g transform="translate(${at[0]} ${at[1]}) rotate(${angle}) scale(${scale}) translate(0 -16)">${art}</g>`);
  const strapColor = tier === 'pro' ? '#1a1d24' : '#3a3125';
  return svg.replace('<path d="M27.6 37 L27.6 48', `<path d="M46 48.5 L18 57" stroke="${strapColor}" stroke-width="1.8"/><path d="M46 47.8 L18 56.3" stroke="${mix(strapColor, light, 0.35)}" stroke-width="0.4"/><path d="M27.6 37 L27.6 48`);
}
const CITY = Object.values(LIGHTS);

const pool = [];
for (let seed = 1; seed < 60; seed++) pool.push(...createNewGame({ seed, startCrew: 'fresh' }).crew);
const faces = [pool.find((o) => faceOf(o).headwear), pool.find((o) => faceOf(o).hair === 'curls'), pool.find((o) => faceOf(o).hair === 'bun' || faceOf(o).hair === 'long')];

// Mock rows, in the game's own styles (ui/gear.js classes, copied here so the page stands alone).
const armouryRow = (tier) => `<div class="gearrow"><span class="thumb">${rifleItem({ tier, width: 96 })}</span><span class="main"><strong>${tier === 'pro' ? 'Pro rifle' : 'Rifle'}</strong><span class="eff">Overwatch · combat 2 shots${tier === 'pro' ? ' · +1' : ''}</span><span class="sub">Sees the open ground, not inside. Every shot is heat +1.</span></span><span class="btn">${tier === 'pro' ? 'PRO +1 ¥6,250' : '¥2,500'}</span></div>`;
const slotRow = (tier, light) => `<div class="slot"><span class="slotname">WEAPON</span><span class="slotart">${rifleItem({ tier, light, width: 120 })}</span><span><strong>${tier === 'pro' ? 'Pro rifle' : 'Rifle'}</strong><br><span class="eff">Overwatch · combat 2 shots</span></span></div>`;
const tile = (tier, light) => `<div class="tile"><span class="tilename">WEAPON</span>${rifleItem({ tier, light, width: 150 })}<strong>${tier === 'pro' ? 'Pro rifle' : 'Rifle'}</strong></div>`;

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Rifle as an item</title>
<style>
:root{--bg:#0a0c0f;--panel:#12151b;--panel2:#161a21;--line:#2a303b;--text:#e9ecf1;--muted:#8a93a6;--cyan:#3de8d8}
body{margin:0;background:var(--bg);color:var(--text);font:15px/1.45 system-ui,sans-serif;padding:16px;max-width:900px}
h1,h2,strong,.btn,.slotname,.tilename{font-family:Rajdhani,'Arial Narrow',sans-serif;letter-spacing:.06em}
h1,h2{text-transform:uppercase;letter-spacing:.1em;margin:0 0 6px}h1{font-size:1.4rem}h2{font-size:1.05rem;color:var(--cyan)}
section{background:var(--panel);border:1px solid var(--line);padding:14px;margin:14px 0;clip-path:polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,0 100%)}
p{color:var(--muted);margin:0 0 10px}.grid{display:flex;flex-wrap:wrap;gap:12px;align-items:end}
.cut svg,.thumb svg,.slotart svg,.tile svg{clip-path:polygon(0 0,calc(100% - 6px) 0,100% 6px,100% 100%,0 100%)}
.cap{font:600 .72rem Rajdhani,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);margin:4px 0}
.gearrow{display:grid;grid-template-columns:96px 1fr auto;gap:10px;align-items:center;padding:6px 8px;background:var(--panel2);border:1px solid var(--line);margin-bottom:6px;max-width:420px;clip-path:polygon(0 0,100% 0,100% calc(100% - 7px),calc(100% - 7px) 100%,0 100%)}
.main{display:grid;gap:1px}.main strong{text-transform:uppercase}.eff{color:var(--cyan);font-size:.8rem}.sub{color:var(--muted);font-size:.78rem}
.btn{border:1px solid var(--line);padding:10px 10px;font-size:.8rem;background:#1b1f28;white-space:nowrap}
.slot{display:grid;grid-template-columns:70px 120px 1fr;gap:10px;align-items:center;padding:6px 10px;background:var(--panel2);border:1px solid var(--line);max-width:420px;margin-bottom:6px}
.slotname,.tilename{font-size:.7rem;letter-spacing:.14em;color:var(--muted)}
.tile{display:grid;gap:4px;justify-items:start;padding:8px;background:var(--panel2);border:1px solid var(--line);width:150px}
.tile strong{text-transform:uppercase;font-size:.9rem}
figure{margin:0}figure svg{clip-path:polygon(0 0,calc(100% - 9px) 0,100% 9px,100% 100%,0 100%)}
</style></head><body>
<h1>The rifle as an item</h1>
<p>Drawn like the portraits: flat colour, hard light from the right, no outlines, the city light catching the top edges and the scope lens. In the stash it sits under sodium light; once someone carries it, it takes their light. One drawing for every rifle: the tier and the light are the only changes.</p>

<section><h2>Street and pro, large</h2>
<p>Street: gunmetal, an old wooden stock with grain, a taped grip, a canvas sling. Pro: carbon black, a skeleton stock with a thumbhole, a neon line along the receiver and the scope in the carrier's chrome colour.</p>
<div class="cap">Street · sodium (in the stash)</div><div class="cut">${rifleItem({ tier: 'street', width: 576 })}</div>
<div class="cap">Pro · sodium (in the stash)</div><div class="cut">${rifleItem({ tier: 'pro', width: 576 })}</div>
</section>

<section><h2>Under each city light</h2><p>Carried by someone lit cyan, red, sodium or violet.</p>
<div class="grid">${Object.entries(LIGHTS).map(([n, l]) => `<div><div class="cap">${n}</div><div class="cut">${rifleItem({ tier: 'street', light: l, width: 200 })}</div><div class="cut" style="margin-top:6px">${rifleItem({ tier: 'pro', light: l, neon: l === LIGHTS.cyan ? '#ff3d5f' : '#3de8d8', width: 200 })}</div></div>`).join('')}</div>
</section>

<section><h2>1 · In the armoury (the buy list and the stash)</h2><p>The art replaces the small line icon; the row stays the same height as today.</p>
${armouryRow('street')}${armouryRow('pro')}</section>

<section><h2>2 · In a runner's gear slot, as a row</h2><p>Today's slot row with the art between the slot name and the item's name, lit by the carrier's own light.</p>
${slotRow('street', LIGHTS.cyan)}${slotRow('pro', LIGHTS.red)}</section>

<section><h2>3 · In a runner's gear slot, as tiles</h2><p>An alternative layout: the four slots as tiles in a 2x2 grid, the item big, Battle Brothers style.</p>
<div class="grid">${tile('street', LIGHTS.cyan)}${tile('pro', LIGHTS.violet)}<div class="tile" style="opacity:.6;border-style:dashed"><span class="tilename">ARMOUR</span><div style="height:50px;display:grid;place-items:center;color:var(--muted)">Empty</div></div></div></section>

<section><h2>On the portrait: B, lower and steeper (owner's note)</h2><p>The same rifle drawing, resting across the back from the left hip to over the right shoulder, rather than floating above it.</p>
<div class="grid">${faces.map((op) => `<figure>${onBack(op, 'street')}</figure><figure>${onBack(op, 'pro')}</figure>`).join('')}</div></section>
</body></html>`;
writeFileSync(new URL('../drafts/prototypes/rifle-item-options.html', import.meta.url), html);
console.log('written');
