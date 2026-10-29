// Design session (2026-10-29): sidearm looks from a kit of parts, leaning into the city's neon
// (light strips, glowing vents, laser lines, holo sights) alongside standard and Asian-themed
// ones. Uses sidearmBuild() in src/ui/art.js; no sidearm in the game has a look yet.
// Writes drafts/prototypes/sidearm-variants-options.html. Run: node scripts/sidearm-variants-options.mjs

import { writeFileSync } from 'node:fs';
import { gearArt, portrait, faceOf, lightOf } from '../src/ui/art.js';
import { SIDEARM_LOOKS } from '../src/data/gearLooks.js';
import { createNewGame } from '../src/core/state.js';
import { generateRecruit } from '../src/core/recruits.js';

const fresh = { fatigue: 0, morale: 60, neuralLoad: 0, burnout: 0, injury: 'healthy', injuryDays: 0 };
const game = createNewGame({ seed: 4242 });
const pool = [...game.crew];
for (let i = 0; i < 30; i++) pool.push(generateRecruit(game));
const bare = pool.filter((op) => { const f = faceOf(op); return !f.mask && !f.monk; }).map((op) => ({ ...op, condition: fresh, gear: {} }));
// A carrier with cyan chrome, so the sheet's glows read as neon (they follow each person's chrome).
const carrier = bare.find((op) => faceOf(op).chromeColor === '#3de8d8' && lightOf(op) === '#9b8cff') ?? bare.find((op) => faceOf(op).chromeColor === '#3de8d8') ?? bare[0];
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const gun = (look, { who = carrier, width = 288 } = {}) => gearArt({ type: 'pistol', tier: 'street', look }, { carrier: who, width });
const card = (look, label, note = '') => `<figure>${gun(look)}<figcaption><b>${label}</b>${note ? `<br>${note}` : ''}</figcaption></figure>`;

const BUILDS = [
  ['Neon', [
    ['Ghost Link', { frame: 'smart', finish: 'synth', charm: 'shard' }, 'A smart pistol: light strip, holo sight, a smartlink cable to the wrist.'],
    ['Volt Fox', { frame: 'coil', finish: 'neon', mod: 'vents', charm: 'cube' }, 'A coil pistol with glowing rings and a power cell.'],
    ['Afterhours Wasp', { frame: 'compact', finish: 'neon', mod: 'laser', charm: 'cube' }, 'Neon edges, a laser line, a pixel keychain.'],
    ['Prism Echo', { frame: 'smart', finish: 'holo', mod: 'ledmag', charm: 'cat' }, 'Holographic chrome, an ammo counter, a hologram lucky cat.'],
    ['Red-Eye Cicada', { frame: 'machine', finish: 'ronin', mod: 'laser', charm: 'shard' }, 'Matte black, a wrapped grip, red eyes.'],
    ['Furnace Bull', { frame: 'cannon', finish: 'polymer', mod: 'vents' }, 'A hand cannon that glows when it works.'],
  ]],
  ['Asian', [
    ['Vermilion Lotus', { frame: 'revolver', finish: 'cinnabar', mod: 'clouds', charm: 'tassel' }, 'Cinnabar lacquer, gold clouds, a silk tassel.'],
    ['Jade Magistrate', { frame: 'heritage', finish: 'jade', mod: 'scales', charm: 'coin' }, 'Jade grips, bronze, dragon scales.'],
    ['Golden Fortune Wheel', { frame: 'revolver', finish: 'blackgold', mod: 'scales', charm: 'coin' }, 'Black and gold, for the boss.'],
    ['Pearl Moon', { frame: 'compact', finish: 'pearl', charm: 'mahjong' }, 'Pearl grips and a mahjong tile.'],
    ['Teahouse Elder Brother', { frame: 'heritage', finish: 'rosewood', mod: 'clouds', charm: 'tassel' }, 'Rosewood and brass, an old family piece.'],
    ['Spirit Needle', { frame: 'compact', finish: 'cinnabar', mod: 'circuit', charm: 'talisman' }, 'Red lacquer with a neon circuit and a paper charm.'],
  ]],
  ['Standard', [
    ['Service Wasp', { frame: 'compact', finish: 'polymer' }, 'A plain service pistol.'],
    ['Silver Old Tiger', { frame: 'revolver', finish: 'stainless' }, 'Stainless and walnut.'],
    ['Desert Bull', { frame: 'cannon', finish: 'tan' }, 'Desert tan hand cannon.'],
    ['Dockside Rattle', { frame: 'machine', finish: 'hazard', mod: 'ledmag', charm: 'sticker' }, 'Hazard yellow, from the container yards.'],
    ['Plain Magistrate', { frame: 'heritage', finish: 'blued' }, 'Blued steel, nothing added.'],
    ['Steel Cricket', { frame: 'compact', finish: 'blued', mod: 'laser' }, 'Blued steel with a laser.'],
  ]],
];

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Sidearm looks draft</title>
<style>
:root{--bg:#0a0c0f;--panel:#12151b;--line:#2a303b;--text:#e9ecf1;--muted:#8a93a6;--cyan:#3de8d8}
body{margin:0;background:var(--bg);color:var(--text);font:15px/1.45 system-ui,sans-serif;padding:16px}
h1,h2,h3{font-family:Rajdhani,'Arial Narrow',sans-serif;text-transform:uppercase;letter-spacing:.1em;margin:0 0 6px}
h1{font-size:1.4rem}h2{font-size:1.05rem;color:var(--cyan)}h3{font-size:.8rem;color:var(--muted);margin:12px 0 8px}
section{background:var(--panel);border:1px solid var(--line);padding:14px;margin:14px 0;clip-path:polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,0 100%)}
.grid{display:flex;flex-wrap:wrap;gap:16px 18px}
figure{margin:0;display:grid;gap:6px;justify-items:start}
figure svg{clip-path:polygon(0 0,calc(100% - 9px) 0,100% 9px,100% 100%,0 100%);max-width:100%;height:auto}
figcaption{font-size:.8rem;color:var(--muted);max-width:288px}figcaption b{color:var(--text)}
.pf{line-height:0;clip-path:polygon(0 0,calc(100% - 9px) 0,100% 9px,100% 100%,0 100%)}
.row{display:flex;gap:6px;align-items:end}
p{color:var(--muted);margin:0 0 10px;max-width:72ch}
</style></head><body>
<h1>Sidearm looks: draft</h1>
<p>The rifle's kit idea for the sidearm, leaning into the neon: light strips, glowing vents, laser lines, holo sights, LED ammo counters, smart pistols with a cable to the wrist and coil pistols with glowing rings. The glow takes the carrier's chrome colour (the laser is always red). Standard and Asian-themed ones alongside. ${Object.keys(SIDEARM_LOOKS.frames).length} frames × ${Object.keys(SIDEARM_LOOKS.finishes).length} finishes × ${Object.keys(SIDEARM_LOOKS.mods).length + 1} mods × ${Object.keys(SIDEARM_LOOKS.charms).length + 1} charms. Not in the game yet.</p>

<section><h2>An assortment</h2>
${BUILDS.map(([group, list]) => `<h3>${group}</h3><div class="grid">${list.map(([name, look, note]) => card(look, name, note)).join('')}</div>`).join('')}
</section>

<section><h2>In a chest holster</h2><p>With no rifle on their back, a sidearm sits in a holster on the chest, on the shadow side, at 104 and 48px. A rifle still wins (one item on a face at a time).</p><div class="grid">
${BUILDS.flatMap(([, list]) => list.slice(0, 3)).map(([name, look], i) => { const op = { ...bare[i % bare.length], gear: { weapon: { uid: `p${i}`, type: 'pistol', tier: 'street', look } } }; return `<figure><div class="row"><span class="pf">${portrait(op, { size: 104 })}</span><span class="pf">${portrait(op, { size: 48 })}</span></div><figcaption><b>${name}</b><br>${op.name}</figcaption></figure>`; }).join('')}
</div></section>

<section><h2>Frames</h2><p>In blued steel (the smart and coil pistols are pro only).</p><div class="grid">
${Object.entries(SIDEARM_LOOKS.frames).map(([k, fr]) => card({ frame: k, finish: 'blued' }, cap(fr.name))).join('')}
</div></section>

<section><h2>Finishes</h2><p>On the compact pistol. Street first, then pro.</p><div class="grid">
${Object.entries(SIDEARM_LOOKS.finishes).map(([k, f]) => card({ frame: 'compact', finish: k }, cap(f.name), f.tier === 'pro' ? 'Pro' : 'Street')).join('')}
</div></section>

<section><h2>Mods and charms</h2><div class="grid">
${Object.entries(SIDEARM_LOOKS.mods).map(([k, m]) => card({ frame: 'compact', finish: ['scales', 'clouds'].includes(k) ? 'cinnabar' : 'polymer', mod: k }, cap(m.name))).join('')}
${Object.entries(SIDEARM_LOOKS.charms).map(([k, ch]) => card({ frame: 'compact', finish: 'blued', charm: k }, cap(ch.name))).join('')}
</div></section>

<section><h2>Under each light</h2><p>Afterhours Wasp carried by people with different city lights and chrome colours: the glow follows their chrome.</p><div class="grid">
${bare.filter((op, i, a) => a.findIndex((o) => faceOf(o).chromeColor === faceOf(op).chromeColor && lightOf(o) === lightOf(op)) === i).slice(0, 4).map((op) => `<figure>${gun(BUILDS[0][1][2][1], { who: op })}<figcaption>${op.name}</figcaption></figure>`).join('')}
</div></section>
</body></html>`;
writeFileSync(new URL('../drafts/prototypes/sidearm-variants-options.html', import.meta.url), html);
console.log('written');
