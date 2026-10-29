// Design session (2026-10-28/29): option C at full quality, one district, so the owner can judge
// the direction: the Docks at night, drawn like the portraits (flat colour planes, hard light,
// the turf's light from the right, no outlines). The picture itself lives in src/ui/districtArt.js
// (the game shows it on the Docks' card); this writes drafts/prototypes/district-docks.html.
// Run: node scripts/district-art-docks.mjs
//
// The scene, back to front: the sky lit red from the right, Lantern Bay across the harbour
// (Glass Heights' cyan towers, Iron Peak behind), the water and its reflections, two
// ship-to-shore cranes, the container stacks on the quay (one of them 409), sodium lamps, a
// string of red lanterns, one runner looking at the box, rain and harbour fog.

import { writeFileSync } from 'node:fs';
import { docksScene } from '../src/ui/districtArt.js';

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Docks district art</title>
<style>
:root{--bg:#0a0c0f;--panel:#12151b;--panel2:#161a21;--line:#2a303b;--text:#e9ecf1;--muted:#8a93a6;--cyan:#3de8d8}
body{margin:0;background:var(--bg);color:var(--text);font:15px/1.45 system-ui,sans-serif;padding:16px;max-width:1180px}
h1,h2,h3{font-family:Rajdhani,'Arial Narrow',sans-serif;text-transform:uppercase;letter-spacing:.1em;margin:0 0 6px}h1{font-size:1.4rem}h2{font-size:1.05rem;color:var(--cyan)}
p{color:var(--muted);margin:0 0 10px}
section{background:var(--panel);border:1px solid var(--line);padding:14px;margin:14px 0;clip-path:polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,0 100%)}
.scene{display:block;width:100%}.da-neon{font-family:'Noto Sans CJK TC','Noto Sans TC','PingFang TC','Microsoft JhengHei','WenQuanYi Zen Hei',sans-serif;font-weight:700}.da-stencil{font:700 6.5px Rajdhani,'Arial Narrow',sans-serif;letter-spacing:.12em;fill:#e9e2cf;opacity:.85}
.dcard{background:var(--panel2);border:1px solid var(--line);max-width:390px;clip-path:polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,0 100%)}
.dcard .scene{aspect-ratio:2.4;object-fit:cover}.dcard__body{padding:10px 12px}.turf{font-size:.75rem;letter-spacing:.1em;color:#ff3d5f}
.facts{list-style:none;margin:0 0 6px;padding:0;display:flex;flex-wrap:wrap;gap:4px 14px;font-size:.9rem}.talk-line{color:#f2d541;font-size:.85rem;margin:0}
.crop{width:100%;max-width:390px;overflow:hidden}.crop svg{width:180%;margin-left:-62%}
</style></head><body>
<h1>The Docks, drawn properly</h1>
<p>Option C at full quality, for one district (2026-10-28). Flat colour planes and hard light like the portraits: Red Lantern red from the right, sodium lamps, Glass Heights' cyan across the water, no outlines. Container 409 (Aether-Harbour's, AHX) sits in the front row with one of your crew looking at it, rifle on their back.</p>
<section id="full"><h2>Full width</h2>${docksScene()}</section>
<section id="card"><h2>On the district card (phone width)</h2>
<div class="dcard"><div class="crop">${docksScene()}</div><div class="dcard__body">
<h3>Docks <span class="turf">Red Lantern turf</span></h3>
<ul class="facts"><li><b>0</b> jobs</li><li>Heat <b>●●●</b></li><li><b>2</b> of yours here</li></ul>
<p class="talk-line">Street talk: a Red Lantern boat came in light. Somebody is short a cargo.</p></div></div>
<p>On a phone the card shows the middle of the picture: 409, the runner and the lanterns.</p></section>
</body></html>`;

writeFileSync(new URL('../drafts/prototypes/district-docks.html', import.meta.url), html);
console.log('wrote drafts/prototypes/district-docks.html');
