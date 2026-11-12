// Mock-up (watchable combat, Slice 2, 2026-11-12, the owner: "not in an instance UI: on the map where the portraits are circular like
// during the run, moving around like units on an RTS ... like Football Manager when you sim a game"): a fight played on the REAL site
// plan (ui/siteplan.js sitePlanSvg, data/sites.js), standing on the REAL fight spots (core/fightspots.js), with circular portrait tokens.
//   node drafts/prototypes/fight-on-map.mjs   → drafts/prototypes/fight-on-map.html
import { readFileSync, writeFileSync } from 'node:fs';
import { pickSite, siteHeight } from '../../src/data/sites.js';
import { fightSpots } from '../../src/core/fightspots.js';
import { sitePlanSvg } from '../../src/ui/siteplan.js';
import { portrait } from '../../src/ui/art.js';

const site = pickSite('docks', 'mock', 'warehouse', null);
const spots = fightSpots(site, 'inside', { crew: 6, guards: 9 });
const svg = sitePlanSvg({ site, clean: true });
const names = { Pax: 'Pax Novak', Kit: 'Kit Nakamura', Sal: 'Sal Costa', Nia: 'Nia Adeyemi', Mei: 'Mei Lin', Doc: 'Doc Imani' };
const faces = {};
for (const [k, n] of Object.entries(names)) faces[k] = portrait({ id: `mock-${k}`, name: n, age: 24 + (k.length * 3) % 14 }, { size: 13 });
['Ruiz', 'Mbeki', 'Hartley', 'Sato', 'Voss', 'Quill', 'Dunn', 'Okafor', 'Reyes'].forEach((n, i) => { faces[`e${i + 1}`] = portrait({ id: `mock-foe-${i + 1}`, name: `${n} Smith`, age: 28 + i * 2 }, { size: 13 }); });
const css = readFileSync(new URL('../../src/ui/styles.css', import.meta.url), 'utf8');
const tpl = readFileSync(new URL('./fight-on-map.template.html', import.meta.url), 'utf8');
const out = tpl.replace('/*CSS*/', css).replace('<!--SVG-->', svg).replace('/*DATA*/{}', JSON.stringify({ faces, spots, H: siteHeight(site) }));
writeFileSync(new URL('./fight-on-map.html', import.meta.url), out);
console.log('wrote fight-on-map.html', JSON.stringify(spots.anchors), siteHeight(site));
