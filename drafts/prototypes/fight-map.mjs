// Higher-fidelity pass of the fight map mock-up (watchable combat, Slice 2, 2026-11-12, the owner: "a higher fidelity
// mock-up with faces"): the same page as fight-map.html, with real portraits from ui/art.js on the markers and in the
// crew rows. Crew and enemy faces are made from invented ids (the mock-up's names are not the game's); the drawing is real.
//   node drafts/prototypes/fight-map.mjs   → drafts/prototypes/fight-map-faces.html
import { readFileSync, writeFileSync } from 'node:fs';
import { portrait } from '../../src/ui/art.js';

const crew = ['Wing', 'Mei', 'Jax', 'Cog', 'Abe', 'Doc', 'Rook', 'Kit', 'Sal', 'Lin', 'Pax', 'Nia'];
const names = { Wing: 'Wing Tai', Mei: 'Mei Lin', Jax: 'Jax Okoro', Cog: 'Cog Ruiz', Abe: 'Abe Haddad', Doc: 'Doc Imani', Rook: 'Rook Silva', Kit: 'Kit Nakamura', Sal: 'Sal Costa', Lin: 'Lin Zhao', Pax: 'Pax Novak', Nia: 'Nia Adeyemi' };
const faces = {};
for (const k of crew) faces[k] = portrait({ id: `mock-${k}`, name: names[k], age: 24 + (k.length * 3) % 14 }, { size: 64 });
const foes = ['Ruiz', 'Mbeki', 'Hartley', 'Sato', 'Voss', 'Quill', 'Dunn'];
foes.forEach((n, i) => { faces[`e${i + 1}`] = portrait({ id: `mock-foe-${i + 1}`, name: `${n} Smith`, age: 28 + i * 2 }, { size: 64 }); });

const html = readFileSync(new URL('./fight-map.html', import.meta.url), 'utf8');
const out = html.replace('<script>', `<script>window.FACES = ${JSON.stringify(faces)};</script>\n<script>`).replace('Fight map mock-up (watchable combat, Slice 2)', 'Fight map mock-up with faces (watchable combat, Slice 2)');
writeFileSync(new URL('./fight-map-faces.html', import.meta.url), out);
console.log('wrote fight-map-faces.html');
