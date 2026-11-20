# Ability mockups: the process

How we design how an ability looks. Started 2026-11-20 with the ricochet (owner: "a great design process, make it efficient for future abilities"). Pictures only: nothing here touches `src/`.

## The loop

1. **Brief.** One line of what the rules do (from `CODEMAP.md` / `docs/BATTLES.md`) and what the stage draws today (`src/ui/fightstage.js`, looks in `src/data/fightLooks.js`).
2. **Mock three looks.** The current one as the baseline ("Now") and two or three proposals that differ in idea, not in colour: different rhythm, different metaphor, different cost. Each is a small `async play(u, svg)` using the kit.
3. **Owner plays them** in the Ability Lab (a browser page, phone width, a slow-down slider and tap-to-step), taps **Pick this** on the winner and **Copy picks**.
4. **Decide, then build.** Say which proposal and any tweaks ("A0 pace for ordinary shots, spotlight only on specials"). Build it in the stage, then screenshot it for `docs/screenshots/` and log it (design log row, changelog entry). Mark the lab file `decided:` so the next person sees what shipped.

Rules for a good mockup: same scene on every card so looks compare fairly; each variant states in its note what it costs (screen time, staging data it would need); ordinary actions stay quick, only special moves earn a beat (owner, 2026-11-20); design at phone width; nothing that needs hover.

## Files

- `docs/mockups/ability-lab/ability-lab.html` the page. Open it in a browser, or publish the folder as an artifact (`publish_files`, all files, `index.html` = a copy of `ability-lab.html`).
- `docs/mockups/ability-lab/kit.js` the shared helpers (`tween`, `ring`, `sparks`, `bolt`, `grow`, `orb`, `glow`, `float`, `bars`, `focus`, the standard scene, the picks panel). Add a helper here when two abilities want it.
- `docs/mockups/ability-lab/abilities/<id>.js` one file per ability, one `Kit.ability({ id, name, rules, variants })` call. Done and decided (all built, 2026-11-20): ricochet, slash, ping, shield, aura, jam, incendiary, contagion, mark, rout. Each file's `decided:` says what shipped.
- `scripts/new-ability-mockup.mjs <id> "<Name>" "<rules line>"` scaffolds a new ability file (a Now card and two blank proposals) and adds it to the page.
- `docs/mockups/2026-11-20-fight-readability.html` the first, one-off version (fight pacing plus ricochet), kept as the record.

## Adding an ability (about ten minutes)

```bash
node scripts/new-ability-mockup.mjs spotter "Spotter’s Eye" "A hit marks the target; the crew’s shots at it hit harder."
```

Open `abilities/spotter.js`, fill the three variants, open `ability-lab.html`, play them. Use `scene: { hurt: { V: 0.4 } }` for a heal. `/mockup-ability` (a project skill) does these steps in order.

## Still to do

In the lab, waiting for the owner's pick (2026-11-20): Breacher (exposed) and the hack alarm (`abilities/breacher.js`, `abilities/alarm.js`). No lab file yet: overwatch, the van call, the patch pulse, new moves and payloads as they are written (`data/builds.js`). Statuses already have a look from 2026-11-19 (`docs/screenshots/2026-11-19-status-looks`).
