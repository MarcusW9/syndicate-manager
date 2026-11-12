// Showcase mock-up (watchable combat, Slice 2/4, 2026-11-12, the owner: a sniper whose shot ricochets from portrait to portrait,
// a close-combat star slashing through the pack, a swarm pinged down). Real portraits from ui/art.js; self-contained output.
//   node drafts/prototypes/fight-map-showcase.mjs   → drafts/prototypes/fight-map-showcase.html
import { readFileSync, writeFileSync } from 'node:fs';
import { portrait } from '../../src/ui/art.js';
const crew = { Wing: 'Wing Tai', Mei: 'Mei Lin', Jax: 'Jax Okoro', Pax: 'Pax Novak', Sal: 'Sal Costa', Rook: 'Rook Silva' };
const faces = {};
for (const [k, n] of Object.entries(crew)) faces[k] = portrait({ id: `mock-${k}`, name: n, age: 24 + (k.length * 3) % 14 }, { size: 64 });
['Ruiz', 'Mbeki', 'Hartley', 'Sato', 'Voss', 'Quill', 'Dunn'].forEach((n, i) => { faces[`e${i + 1}`] = portrait({ id: `mock-foe-${i + 1}`, name: `${n} Smith`, age: 28 + i * 2 }, { size: 64 }); });
const tpl = readFileSync(new URL('./fight-map-showcase.template.html', import.meta.url), 'utf8');
writeFileSync(new URL('./fight-map-showcase.html', import.meta.url), tpl.replace('/*FACES*/{}', JSON.stringify(faces)));
console.log('wrote fight-map-showcase.html');
