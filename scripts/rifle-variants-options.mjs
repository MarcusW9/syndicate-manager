// Design session (2026-10-28): an assortment of rifle looks from a kit of parts (frames,
// finishes, engravings, charms), several Asian-themed. Uses rifleBuild() in src/ui/art.js;
// no item in the game has a look yet, so nothing in the game changes.
// Writes drafts/prototypes/rifle-variants-options.html. Run: node scripts/rifle-variants-options.mjs

import { writeFileSync } from 'node:fs';
import { gearArt, portrait, faceOf } from '../src/ui/art.js';
import { RIFLE_LOOKS } from '../src/data/gearLooks.js';
const { frames: RIFLE_FRAMES, finishes: RIFLE_FINISHES } = RIFLE_LOOKS;
const RIFLE_ENGRAVINGS = Object.fromEntries(Object.entries(RIFLE_LOOKS.engravings).map(([k, v]) => [k, v.name]));
const RIFLE_CHARMS = Object.fromEntries(Object.entries(RIFLE_LOOKS.charms).map(([k, v]) => [k, v.name]));
import { createNewGame } from '../src/core/state.js';
import { generateRecruit } from '../src/core/recruits.js';

const fresh = { fatigue: 0, morale: 60, neuralLoad: 0, burnout: 0, injury: 'healthy', injuryDays: 0 };
const game = createNewGame({ seed: 4242 });
const pool = [...game.crew];
for (let i = 0; i < 22; i++) pool.push(generateRecruit(game));
const bare = pool.filter((op) => { const f = faceOf(op); return !f.mask && !f.visor && !f.monk; }).map((op) => ({ ...op, condition: fresh }));
const carrier = bare[0];

const rifle = (look, { who = carrier, width = 288 } = {}) => gearArt({ type: 'rifle', tier: 'street', look }, { carrier: who, width });
const card = (look, label, note = '') => `<figure>${rifle(look)}<figcaption><b>${label}</b>${note ? `<br>${note}` : ''}</figcaption></figure>`;

// Named builds: the assortment, Asian-themed first.
const BUILDS = [
  ['Red Lantern', { frame: 'marksman', finish: 'cinnabar', engraving: 'clouds', charm: 'tassel' }, 'Cinnabar lacquer, gold clouds, a red silk tassel.'],
  ['Jade Bureau', { frame: 'carbine', finish: 'jade', engraving: 'scales', charm: 'coin' }, 'Jade furniture, bronze, dragon scales, a lucky coin.'],
  ['Temple Guardian', { frame: 'heavy', finish: 'bronze', engraving: 'scales', charm: 'mala' }, 'Patinated temple bronze, prayer beads from the swivel.'],
  ['Bamboo Hermit', { frame: 'heritage', finish: 'bamboo', charm: 'talisman' }, 'A long bamboo rifle with a paper talisman.'],
  ['Triad Gold', { frame: 'bullpup', finish: 'blackgold', engraving: 'clouds', charm: 'coin' }, 'Black lacquer and gold, for someone who wants to be seen.'],
  ['Mahjong Parlour', { frame: 'carbine', finish: 'rosewood', charm: 'mahjong' }, 'Rosewood and brass with mother-of-pearl, a tile for luck.'],
  ['Dragon Boat', { frame: 'marksman', finish: 'cinnabar', engraving: 'scales', charm: 'coin' }, 'Red lacquer scaled like the festival boats.'],
  ['Old Town Heirloom', { frame: 'heritage', finish: 'rosewood', engraving: 'clouds', charm: 'tassel' }, "Somebody's grandfather's rifle."],
  ['Ghost Paper', { frame: 'heritage', finish: 'rust', charm: 'talisman' }, 'Rusted through, held together by a charm.'],
  ['Night Market Candy', { frame: 'bullpup', finish: 'candy', engraving: 'circuit', charm: 'sticker' }, 'Hot pink, a neon circuit, a lucky sticker.'],
  ['Glass Heights', { frame: 'bullpup', finish: 'ceramic', engraving: 'circuit' }, 'Corporate white ceramic with a neon line.'],
  ['Dockside', { frame: 'heavy', finish: 'urban', charm: 'hazard' }, 'Urban camo and hazard tape from the container yards.'],
];

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Rifle looks draft</title>
<style>
:root{--bg:#0a0c0f;--panel:#12151b;--line:#2a303b;--text:#e9ecf1;--muted:#8a93a6;--cyan:#3de8d8}
body{margin:0;background:var(--bg);color:var(--text);font:15px/1.45 system-ui,sans-serif;padding:16px}
h1,h2{font-family:Rajdhani,'Arial Narrow',sans-serif;text-transform:uppercase;letter-spacing:.1em;margin:0 0 6px}
h1{font-size:1.4rem}h2{font-size:1.05rem;color:var(--cyan)}
section{background:var(--panel);border:1px solid var(--line);padding:14px;margin:14px 0;clip-path:polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,0 100%)}
.grid{display:flex;flex-wrap:wrap;gap:16px 18px}
figure{margin:0;display:grid;gap:6px;justify-items:start}
figure svg{clip-path:polygon(0 0,calc(100% - 9px) 0,100% 9px,100% 100%,0 100%);max-width:100%;height:auto}
figcaption{font-size:.8rem;color:var(--muted);max-width:288px}figcaption b{color:var(--text)}
.pf{line-height:0;clip-path:polygon(0 0,calc(100% - 9px) 0,100% 9px,100% 100%,0 100%)}
.row{display:flex;gap:6px;align-items:end}
p{color:var(--muted);margin:0 0 10px;max-width:72ch}
</style></head><body>
<h1>Rifle looks: draft</h1>
<p>One kit of parts in the portraits' style: a <b>frame</b> (the silhouette), a <b>finish</b> (materials), an <b>engraving</b> and a <b>charm</b>. Any mix works, so a dozen named builds below come from ${Object.keys(RIFLE_FRAMES).length} frames × ${Object.keys(RIFLE_FINISHES).length} finishes × ${Object.keys(RIFLE_ENGRAVINGS).length + 1} engravings × ${Object.keys(RIFLE_CHARMS).length + 1} charms (${Object.keys(RIFLE_FRAMES).length * Object.keys(RIFLE_FINISHES).length * (Object.keys(RIFLE_ENGRAVINGS).length + 1) * (Object.keys(RIFLE_CHARMS).length + 1)} combinations). Every one still takes its carrier's city light. Not in the game yet: no item has a look.</p>

<section><h2>An assortment</h2><div class="grid">
${BUILDS.map(([name, look, note]) => card(look, name, note)).join('')}
</div></section>

<section><h2>On the back</h2><p>The same builds slung across real crew, at 104 and 48px.</p><div class="grid">
${BUILDS.slice(0, 8).map(([name, look], i) => { const op = { ...bare[i % bare.length], gear: { weapon: { uid: `v${i}`, type: 'rifle', tier: 'street', look } } }; return `<figure><div class="row"><span class="pf">${portrait(op, { size: 104 })}</span><span class="pf">${portrait(op, { size: 48 })}</span></div><figcaption><b>${name}</b><br>${op.name}</figcaption></figure>`; }).join('')}
</div></section>

<section><h2>Frames</h2><p>The silhouette, in the street finish.</p><div class="grid">
${Object.entries(RIFLE_FRAMES).map(([k, fr]) => card({ frame: k, finish: 'street' }, fr.name.charAt(0).toUpperCase() + fr.name.slice(1))).join('')}
</div></section>

<section><h2>Finishes</h2><p>Materials and colours, on the marksman frame.</p><div class="grid">
${Object.entries(RIFLE_FINISHES).map(([k, f]) => card({ frame: 'marksman', finish: k }, f.name.charAt(0).toUpperCase() + f.name.slice(1))).join('')}
</div></section>

<section><h2>Engravings and charms</h2><div class="grid">
${Object.entries(RIFLE_ENGRAVINGS).map(([k, name]) => card({ frame: 'carbine', finish: k === 'circuit' ? 'carbon' : 'cinnabar', engraving: k }, name)).join('')}
${Object.entries(RIFLE_CHARMS).map(([k, name]) => card({ frame: 'marksman', finish: 'street', charm: k }, name)).join('')}
</div></section>

<section><h2>Under each city light</h2><p>Red Lantern carried by four people with different lights, then in the stash under the safehouse lamp.</p><div class="grid">
${[...new Map(bare.map((op) => [faceOf(op) && gearArt({ type: 'rifle', look: BUILDS[0][1] }, { carrier: op, width: 10 }).match(/stop-color="(#[0-9a-f]+)"/)[1], op])).values()].slice(0, 4).map((op) => `<figure>${rifle(BUILDS[0][1], { who: op })}<figcaption>${op.name}</figcaption></figure>`).join('')}
<figure>${gearArt({ type: 'rifle', look: BUILDS[0][1] }, { width: 288 })}<figcaption>In the stash</figcaption></figure>
</div></section>
</body></html>`;
writeFileSync(new URL('../drafts/prototypes/rifle-variants-options.html', import.meta.url), html);
console.log('written');
