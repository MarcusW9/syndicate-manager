// Design session (2026-10-28): faces that vary in the face itself (eyes, lids, brows, nose,
// mouth, jaw, ears, neck, age lines), drawn with portrait(op) (on in the game since 2026-10-28); the earlier face is portrait(op, { anatomy: false }).
// Writes drafts/prototypes/face-anatomy-options.html (static). Run: node scripts/face-anatomy-options.mjs

import { writeFileSync } from 'node:fs';
import { portrait, faceOf, anatomyOf } from '../src/ui/art.js';
import { createNewGame } from '../src/core/state.js';
import { generateRecruit } from '../src/core/recruits.js';
import { CULTURES } from '../src/data/recruitPools.js';

const fresh = { fatigue: 0, morale: 60, neuralLoad: 0, burnout: 0, injury: 'healthy', injuryDays: 0 };
const at = (op, condition = {}) => ({ ...op, condition: { ...fresh, ...condition } });

// Real people: the founding crew plus a season of scouted recruits from one game.
const game = createNewGame({ seed: 4242 });
const recruits = [];
for (let i = 0; i < 22; i++) recruits.push(generateRecruit(game));
const people = [...game.crew, ...recruits].map((op) => at(op));

// One person for each look, so every mask, hat and lens is checked against the new faces.
const LOOKS = {
  'Glasses': (f) => f.glasses && !f.mask,
  'Visor': (f) => f.visor && !f.mask,
  'Cyber-eye': (f) => f.chrome === 'cybereye' && !f.mask,
  'Half-chrome': (f) => f.halfFace && !f.mask,
  'Respirator': (f) => f.mask === 'respirator',
  'Jaw plate': (f) => f.mask === 'jawplate',
  'LED grille': (f) => f.mask === 'grille',
  'Goggles': (f) => f.mask === 'goggles',
  'Faceplate': (f) => f.mask === 'faceplate',
  'Beard': (f) => f.facialHair === 'beard' && !f.mask,
  'Droop moustache': (f) => f.facialHair === 'droop' && !f.mask,
  'Goatee': (f) => f.facialHair === 'goatee' && !f.mask,
  'Steel hat': (f) => f.headwear === 'jingasa' && !f.monk,
  'Monk': (f) => f.monk && f.headwear,
};
const surnames = CULTURES.flatMap((c) => c.surnames.slice(0, 6));
const looks = Object.entries(LOOKS).map(([label, test]) => {
  for (let n = 0; ; n++) {
    const op = { id: `look${n}`, name: `Sam ${surnames[n % surnames.length]}`, age: 30 };
    if (test(faceOf(op))) return { label, op: at(op) };
  }
});

// Shaolin warrior monks (added 2026-10-28), with real names from the cultures they lean to.
const shaolin = [];
for (let n = 0; shaolin.length < 8; n++) {
  const c = CULTURES.find((x) => x.id === (n % 3 ? 'hk' : 'southeast_asian'));
  const op = { id: `sh${n}`, name: `${c.given[n % c.given.length]} ${c.surnames[n % c.surnames.length]}`, age: 19 + ((n * 7) % 40) };
  if (faceOf(op).monk === 'shaolin') shaolin.push(at(op));
}

const frame = (svg) => `<span class="pf">${svg}</span>`;
const pair = (op, label) => `<figure>
  <div class="pairrow">${frame(portrait(op, { size: 104, anatomy: false }))}${frame(portrait(op, { size: 104, anatomy: true }))}</div>
  <div class="pairrow small">${frame(portrait(op, { size: 48, anatomy: false }))}${frame(portrait(op, { size: 48, anatomy: true }))}<span class="sp"></span>${frame(portrait(op, { size: 32, anatomy: true }))}</div>
  <figcaption>${label}</figcaption></figure>`;
const who = (op) => `${op.name} · ${op.age}`;
const describe = (op) => { const a = anatomyOf(op); return `${a.lid} lids, ${a.bridge} nose, ${a.cheek} cheeks${a.freckles ? ', freckles' : ''}${a.mole ? ', mole' : ''}`; };

const CONDITIONS = [
  ['Neutral', {}], ['Smirk (morale 80+)', { morale: 90 }], ['Stressed (morale under 35)', { morale: 20 }],
  ['Dead stare (load over 70)', { neuralLoad: 80 }], ['Tired (fatigue over 60)', { fatigue: 80 }], ['Seriously hurt', { injury: 'serious', injuryDays: 6 }],
];
// Bare faces only for these rows: masks and visors would hide what's being checked.
const bare = people.filter((op) => { const f = faceOf(op); return !f.mask && !f.visor && !f.halfFace; });
const moodPeople = [bare[0], bare[3], bare[6], bare[9]];
const agePeople = [bare[2], bare[5], bare[8]];

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Face anatomy draft</title>
<style>
:root{--bg:#0a0c0f;--panel:#12151b;--line:#2a303b;--text:#e9ecf1;--muted:#8a93a6;--cyan:#3de8d8}
body{margin:0;background:var(--bg);color:var(--text);font:15px/1.45 system-ui,sans-serif;padding:16px}
h1,h2{font-family:Rajdhani,'Arial Narrow',sans-serif;text-transform:uppercase;letter-spacing:.1em;margin:0 0 6px}
h1{font-size:1.4rem}h2{font-size:1.05rem;color:var(--cyan)}
section{background:var(--panel);border:1px solid var(--line);padding:14px;margin:14px 0;clip-path:polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,0 100%)}
.grid{display:flex;flex-wrap:wrap;gap:16px 18px}
figure{margin:0;display:grid;gap:6px;justify-items:start}
figcaption{font-size:.78rem;color:var(--muted);max-width:216px}
.pairrow{display:flex;gap:6px;align-items:end}.sp{width:6px}
.pf{line-height:0;background:#0d1016;clip-path:polygon(0 0,calc(100% - 9px) 0,100% 9px,100% 100%,0 100%)}
.small .pf{clip-path:polygon(0 0,calc(100% - 6px) 0,100% 6px,100% 100%,0 100%)}
p{color:var(--muted);margin:0 0 10px;max-width:70ch}
.key{font:600 .72rem Rajdhani,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--muted)}
</style></head><body>
<h1>Faces with their own anatomy</h1>
<p>Approved by the owner and on in the game (2026-10-28). Each pair is the same person: <b>the earlier face on the left, the new face on the right</b>, at 104px and 48px, plus the new face at 32px. Hair, skin, chrome, light and gear are untouched; only the face itself changes. Eye spacing, size, tilt and lid (monolid, crease, hooded, deep-set), brow weight and arch, nose length, width and bridge, mouth width and lips, jaw, chin, ears and neck all vary, from a third seed, so the face is still fixed per person.</p>

<section><h2>Founding crew and a season of recruits</h2><p class="key">Left: earlier · Right: new</p><div class="grid">
${people.map((op) => pair(op, `${who(op)}<br>${describe(op)}`)).join('')}
</div></section>

<section><h2>Expressions still read</h2><p>Same four people, new face, every condition the game shows. Brows move from each person's own brow line; the mouth keeps its width and lips.</p>
${moodPeople.map((op) => `<div class="key" style="margin:10px 0 6px">${who(op)}</div><div class="grid">${CONDITIONS.map(([label, cond]) => `<figure>${frame(portrait(at(op, cond), { size: 104, anatomy: true }))}<figcaption>${label}</figcaption></figure>`).join('')}</div>`).join('')}
</section>

<section><h2>Age shows in the face, not just the hair</h2><p>Lines from nose to mouth from 33, eye bags and a forehead line from 45. Same person drawn at 22, 38 and 54.</p>
${agePeople.map((op) => `<div class="grid" style="margin-bottom:10px">${[22, 38, 54].map((age) => `<figure>${frame(portrait({ ...op, age }, { size: 104, anatomy: true }))}<figcaption>${op.name} at ${age}</figcaption></figure>`).join('')}</div>`).join('')}
</section>

<section><h2>Shaolin warrior monks</h2><p>A new kind of monk: saffron robe with a dark crossed collar, a heavy mala of big dark beads, and nine ordination dots on the shaved crown. Bare-faced (no mask, hat or glasses). About 4% of Hong Kong names and 3% of Southeast Asian ones; anyone else rarely. A new pick at the end of the gear seed, so nobody else's look changed.</p><p class="key">Left: earlier · Right: new</p><div class="grid">
${shaolin.map((op) => pair(op, who(op))).join('')}
</div>
<div class="key" style="margin:12px 0 6px">${who(shaolin[0])}, new face, every condition</div><div class="grid">${CONDITIONS.map(([label, cond]) => `<figure>${frame(portrait(at(shaolin[0], cond), { size: 104, anatomy: true }))}<figcaption>${label}</figcaption></figure>`).join('')}</div>
</section>

<section><h2>Masks, lenses and hats still line up</h2><p>One person per look. Lenses, glasses and moustaches follow the eyes and mouth to wherever they now sit.</p><p class="key">Left: earlier · Right: new</p><div class="grid">
${looks.map(({ label, op }) => pair(op, label)).join('')}
</div></section>
</body></html>`;
writeFileSync(new URL('../drafts/prototypes/face-anatomy-options.html', import.meta.url), html);
console.log('written');
