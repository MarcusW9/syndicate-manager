// Scaffold an ability mockup for the Ability Lab (docs/mockups/ability-lab/, process in docs/mockups/ABILITY-MOCKUPS.md).
//   node scripts/new-ability-mockup.mjs <id> "<Name>" ["<what the rules do, one line>"]
// Writes docs/mockups/ability-lab/abilities/<id>.js (a "Now" card plus two blank proposals to fill) and adds its script
// line to ability-lab.html between the ABILITIES markers. Pictures only; it touches nothing in src/.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const [id, name, rules = 'TODO: one line on what the rules do (copy it from CODEMAP.md / docs/BATTLES.md).'] = process.argv.slice(2);
if (!id || !name || !/^[a-z][a-z0-9]*$/i.test(id)) { console.error('usage: node scripts/new-ability-mockup.mjs <id> "<Name>" ["<rules line>"]'); process.exit(1); }
const lab = join(import.meta.dirname, '..', 'docs', 'mockups', 'ability-lab');
const file = join(lab, 'abilities', `${id}.js`);
if (existsSync(file)) { console.error(`${file} already exists`); process.exit(1); }
writeFileSync(file, `// ${name}. Picture only. Helpers: see kit.js (tween, ring, sparks, bolt, grow, orb, glow, float, bars, focus ...).
// Units: crew K Kade, M Mara, J Joss, V Vex; foes g1..g4. P(u, id) is a unit's [x, y]. scene: { hurt: { V: 0.4 } } starts allies hurt.
(function () {
  const { wait, tween, P, ring, sparks, float, shake, dmg, bars, grow, fade, glow, bolt, orb, ease } = Kit;
  Kit.ability({
    id: ${JSON.stringify(id)}, name: ${JSON.stringify(name)},
    rules: ${JSON.stringify(rules)},
    variants: [
      { id: 'now', tag: 'Now', name: 'Current look', note: 'What the stage draws today (or "not drawn yet").',
        async play(u, svg) { await wait(300); } },
      { id: 'a', tag: 'Proposal', name: 'TODO name', note: 'One or two sentences: what you see, and what it costs or buys.',
        async play(u, svg) { await wait(300); } },
      { id: 'b', tag: 'Proposal', name: 'TODO name', note: 'A different idea, not a tweak of the first.',
        async play(u, svg) { await wait(300); } },
    ],
  });
})();
`);
const html = join(lab, 'ability-lab.html');
const src = readFileSync(html, 'utf8');
const line = `<script src="abilities/${id}.js"></script>`;
if (!src.includes(line)) writeFileSync(html, src.replace('<!-- ABILITIES:END -->', `${line}\n<!-- ABILITIES:END -->`));
console.log(`Wrote ${file} and listed it in ability-lab.html. Fill in the variants, then open ability-lab.html.`);
