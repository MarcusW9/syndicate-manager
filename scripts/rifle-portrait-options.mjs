// Design session (2026-10-28): ways to draw a rifle on a portrait, on real founding-crew faces.
// Writes drafts/prototypes/rifle-portrait-options.html (static). Run: node scripts/rifle-portrait-options.mjs
// Uses the game's own portrait() and inserts the rifle behind or in front of the right layers.

import { writeFileSync } from 'node:fs';
import { portrait, faceOf, hash, mix } from '../src/ui/art.js';
import { createNewGame } from '../src/core/state.js';

const CITY_LIGHT = ['#3de8d8', '#ff3d5f', '#f2b544', '#9b8cff']; // as in art.js
const SHADOW = '#1b2340';
const lightOf = (op) => CITY_LIGHT[hash(`${op.id}|light`) % CITY_LIGHT.length];

// The rifle in its own frame: lying flat, stock at x 0, muzzle at x 58, centred on y 0.
function rifle(op, tier, { shade = 0 } = {}) {
  const light = lightOf(op);
  const neon = faceOf(op).chromeColor;
  const pro = tier === 'pro';
  const metal = mix(pro ? '#1c2028' : '#434a55', SHADOW, shade);
  const dark = mix(pro ? '#111419' : '#2b3038', SHADOW, shade);
  const lit = mix(metal, light, pro ? 0.25 : 0.45);
  const furniture = pro ? '#262b34' : mix('#5e4630', SHADOW, shade); // street: an old wooden stock
  return `
    <path d="M0 -2.6 L11 -1.9 L11 2 L1 3.2 Z" fill="${furniture}"/>
    <path d="M0 -2.6 L11 -1.9" stroke="${mix(furniture, light, 0.45)}" stroke-width="0.5"/>
    <rect x="11" y="-2" width="14" height="4" fill="${metal}"/>
    <rect x="11" y="-2" width="14" height="0.7" fill="${lit}"/>
    <rect x="18.5" y="2" width="2.6" height="3.6" fill="${dark}" transform="rotate(8 19.8 2)"/>
    <rect x="25" y="-0.8" width="25" height="1.6" fill="${metal}"/>
    <rect x="25" y="-0.8" width="25" height="0.5" fill="${lit}"/>
    <rect x="50" y="-1.25" width="8" height="2.5" rx="0.4" fill="${dark}"/>
    <rect x="50" y="-1.25" width="8" height="0.6" fill="${mix(dark, light, 0.4)}"/>
    <rect x="14.5" y="-3.4" width="1.2" height="1.6" fill="${dark}"/><rect x="21" y="-3.4" width="1.2" height="1.6" fill="${dark}"/>
    <rect x="12.5" y="-5.6" width="11.5" height="2.6" rx="1.1" fill="${dark}"/>
    <rect x="12.5" y="-5.6" width="11.5" height="0.7" rx="0.35" fill="${mix(dark, light, 0.5)}"/>
    <rect x="23.4" y="-5.4" width="1" height="2.2" rx="0.4" fill="${light}" opacity="0.9"/>
    ${pro ? `<path d="M11.5 1.6 H49.5" stroke="${neon}" stroke-width="0.45" opacity="0.9"/><rect x="13.5" y="-4.6" width="3" height="0.6" fill="${neon}" opacity="0.8"/>` : `<path d="M12 0.4 h3 M12 1.2 h3" stroke="#f2b544" stroke-width="0.35" opacity="0.5"/>`}`;
}

// Strap webbing across the chest, in front of the shirt (y 47-52 is all a portrait shows of it).
const strap = (op, tier, d) => `<path d="${d}" stroke="${tier === 'pro' ? '#1a1d24' : '#2a2620'}" stroke-width="1.8" fill="none"/><path d="${d}" stroke="${mix('#2a2620', lightOf(op), 0.35)}" stroke-width="0.4" fill="none" transform="translate(0 -0.7)"/>`;

const OPTIONS = {
  A: { name: 'Over the shoulder', note: 'Stood up behind the lit shoulder, muzzle by the ear, scope towards the face. Reads at every size; never covers the face.',
    behind: (op, t) => `<g transform="translate(52 62) rotate(-78) scale(1.2)">${rifle(op, t)}</g>`, front: (op, t) => strap(op, t, 'M49 48 L20 56') },
  B: { name: 'Across the back', note: 'Slung diagonally behind the head: stock low on the left, muzzle high on the right. The most "sniper"; busier with big hair or a hat.',
    behind: (op, t) => `<g transform="translate(2 62) rotate(-40) scale(1.25)">${rifle(op, t)}</g>`, front: (op, t) => strap(op, t, 'M46 48 L16 58') },
  C: { name: 'Held across the chest', note: 'In front, at the ready, the muzzle past the lit shoulder. Most action; covers the collar and some chrome or robes.',
    behind: () => '', front: (op, t) => `<g transform="translate(9 55) rotate(-14) scale(1.15)">${rifle(op, t)}</g>` },
  D: { name: 'Peeking on the shadow side', note: 'Behind the dark shoulder, mostly in shadow, only its edge catching light. Quietest; can vanish at 32px.',
    behind: (op, t) => `<g transform="translate(12 62) rotate(-100) scale(1.2)">${rifle(op, t, { shade: 0.35 })}</g>`, front: (op, t) => strap(op, t, 'M16 49 L44 56') },
};

/** The portrait with the rifle drawn into it: behind everything, and in front of the shirt. */
function withRifle(op, key, tier, size) {
  let svg = portrait(op, { size });
  if (!key) return svg;
  const o = OPTIONS[key];
  svg = svg.replace(/(<rect x="0" y="0" width="64" height="64" fill="url\(#[^)]+\)"\/>)/, `$1<g>${o.behind(op, tier)}</g>`);
  svg = svg.replace('<path d="M27.6 37 L27.6 48', `<g>${o.front(op, tier)}</g><path d="M27.6 37 L27.6 48`);
  return svg;
}

// Five faces that differ: different hair, one with a hat, one bald, across skin tones.
const pool = [];
for (let seed = 1; seed < 60; seed++) pool.push(...createNewGame({ seed, startCrew: 'fresh' }).crew);
const crew = [];
const used = new Set();
for (const want of [(f) => f.headwear, (f) => f.hair === 'bald' || f.hair === 'buzz', (f) => f.hair === 'curls' || f.hair === 'locs', (f) => f.hair === 'bun' || f.hair === 'bob', (f) => f.hair === 'undercut' || f.hair === 'crop']) {
  const op = pool.find((o) => !crew.includes(o) && want(faceOf(o)) && !used.has(faceOf(o).skin));
  if (op) { crew.push(op); used.add(faceOf(op).skin); }
}
const row = (key, tier) => crew.map((op) => `<figure>${withRifle(op, key, tier, 104)}<div class="small">${withRifle(op, key, tier, 48)}${withRifle(op, key, tier, 32)}</div></figure>`).join('');

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Rifle on portraits</title>
<style>
:root{--bg:#0a0c0f;--panel:#12151b;--line:#2a303b;--text:#e9ecf1;--muted:#8a93a6;--cyan:#3de8d8}
body{margin:0;background:var(--bg);color:var(--text);font:15px/1.45 system-ui,sans-serif;padding:16px}
h1,h2{font-family:Rajdhani,'Arial Narrow',sans-serif;text-transform:uppercase;letter-spacing:.1em;margin:0 0 6px}
h1{font-size:1.4rem}h2{font-size:1.05rem;color:var(--cyan)}
section{background:var(--panel);border:1px solid var(--line);padding:14px;margin:14px 0;clip-path:polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,0 100%)}
.grid{display:flex;flex-wrap:wrap;gap:12px}
figure{margin:0;display:grid;gap:6px;justify-items:start}
figure svg{clip-path:polygon(0 0,calc(100% - 9px) 0,100% 9px,100% 100%,0 100%)}
.small{display:flex;gap:6px;align-items:end}
p{color:var(--muted);margin:0 0 10px}.tier{font:600 .72rem Rajdhani,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);margin:10px 0 6px}
</style></head><body>
<h1>A rifle on the portrait: four options</h1>
<p>Five founding-crew faces, each at 104, 48 and 32px (the sizes the game uses). The rifle takes the face's own city light on its lit edges. Street: gunmetal with an old wooden stock and taped grip. Pro: carbon black with a neon line in the person's chrome colour.</p>
<section><h2>Today: no rifle</h2><div class="grid">${row(null)}</div></section>
${Object.entries(OPTIONS).map(([k, o]) => `<section><h2>${k} · ${o.name}</h2><p>${o.note}</p>
<div class="tier">Street</div><div class="grid">${row(k, 'street')}</div>
<div class="tier">Pro</div><div class="grid">${row(k, 'pro')}</div></section>`).join('')}
</body></html>`;
writeFileSync(new URL('../drafts/prototypes/rifle-portrait-options.html', import.meta.url), html);
console.log('written');
