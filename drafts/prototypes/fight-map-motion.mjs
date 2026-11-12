// Animated mock-up (watchable combat, Slice 2, 2026-11-12, the owner: "dots moving around the map in a more cinematic way"):
// one scripted round, played as motion over the map with real portraits from ui/art.js. Self-contained output.
//   node drafts/prototypes/fight-map-motion.mjs   → drafts/prototypes/fight-map-motion.html
import { readFileSync, writeFileSync } from 'node:fs';
import { portrait } from '../../src/ui/art.js';

const crew = { Wing: 'Wing Tai', Mei: 'Mei Lin', Jax: 'Jax Okoro', Cog: 'Cog Ruiz', Abe: 'Abe Haddad', Doc: 'Doc Imani' };
const faces = {};
for (const [k, n] of Object.entries(crew)) faces[k] = portrait({ id: `mock-${k}`, name: n, age: 24 + (k.length * 3) % 14 }, { size: 64 });
['Ruiz', 'Mbeki', 'Hartley', 'Sato', 'Voss', 'Quill', 'Dunn'].forEach((n, i) => { faces[`e${i + 1}`] = portrait({ id: `mock-foe-${i + 1}`, name: `${n} Smith`, age: 28 + i * 2 }, { size: 64 }); });
const tpl = readFileSync(new URL('./fight-map-motion.template.html', import.meta.url), 'utf8');
writeFileSync(new URL('./fight-map-motion.html', import.meta.url), tpl.replace('/*FACES*/{}', JSON.stringify(faces)));
console.log('wrote fight-map-motion.html');
