---
name: mockup-ability
description: Mock up how an ability, move, status or payload should look in a fight (three looks to compare), using the Ability Lab. Use before building any new fight visual, or to revisit an old one.
---

Process and files: `docs/mockups/ABILITY-MOCKUPS.md`. Pictures only; do not touch `src/` until the owner has picked.

1. Read the ability's rules line (`grep -n "<name>" CODEMAP.md`, `src/data/builds.js`) and today's look (`grep -n "<name>" src/ui/fightstage.js src/data/fightLooks.js`).
2. Scaffold: `node scripts/new-ability-mockup.mjs <id> "<Name>" "<rules line>"`.
3. Fill `docs/mockups/ability-lab/abilities/<id>.js`: a "Now" variant that approximates today's look, and two proposals that differ in idea (rhythm, metaphor, cost), each with a note saying what it costs. Use the helpers in `kit.js`; add a helper there if two abilities want it. Ordinary actions stay quick; only special moves earn a beat.
4. Check it: open `ability-lab.html` in Playwright (pre-installed Chromium), play every variant, confirm no page errors, and look at a frame.
5. Show the owner: publish the `docs/mockups/ability-lab/` folder as an artifact (`publish_files`, `index.html` = `ability-lab.html`), or send the file. They tap Pick this and Copy picks.
6. After a pick: set `decided:` on the ability file, build it in `src/ui/fightstage.js`, then the usual: design-log row, changelog entry, `npm run screenshots -- <slug>`, `npm test`.
