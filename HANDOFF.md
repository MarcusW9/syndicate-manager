# Handoff · 2026-10-25

Where the project stands and what to pick up next. Read `CLAUDE.md` first: its rules (architecture, tests, design log, changelog, commit author) are not repeated here.

## State

- **Live:** `main` at "City tab and street talk", deployed to GitHub Pages. Branch `claude/pensive-pascal-kor55b` matched `main` when this file was written.
- **Tests:** 147 passing (`npm test`). Save format **v13**.
- **Both older plan files are finished:** `PLAN-PERSONALITY.md` (steps 1-4) and `PLAN-RENEWALS.md` (steps 0-4).
- **Plan in progress: `PLAN-PROGRESSION.md`.** Steps 0-1 done 2026-10-25 (rookie start, rookie jobs, gated board, slower growth, progress bars, reports). Next: the owner playtests; then step 2. Its follow-ups list has the loose ends.
- **Working tree clean.** The only pending content is the locked districts' crisis hooks in `drafts/district-hooks.md`.

## What the last two sessions added

**Worldbuilding (docs).** `WORLD.md` is the world bible: the city (Lantern Bay / 燈籠灣, fictional, Hong Kong-inspired, 2057, superstition only, no magic), history since 1970, the power map (3 megacorps, 3 gangs, the "Wet Sleeve" police unit, the Ghost Circuit), the map layout, seven districts, Pearl Haven House, and narrative dossiers for the five clients with secrets and trust arcs. At the bottom is the **context block** to paste into any worldbuilding chat, with a list of retired names that must never come back.

**In the game:**
- **District turf and flavour.** The job board shows whose turf a job is on; the planning screen has a one-line district feel (`src/data/districts.js`).
- **12 district crises,** three per open district, added to every job's pool in that district (`src/data/districtCrises.js`, appended in `src/data/missions.js`).
- **Starting crew choice.** The Lantern Bay Five or a generated fresh crew (`generateStartingCrew` in `src/core/recruits.js`). Fresh crews are a harder start (median cash ¥10,000 vs ¥15,350 after a month).
- **Gender-neutral crisis text.** Crises no longer assume an operative's gender. Keep it that way: crews are generated.
- **City tab.** An SVG schematic map, district cards (locked ones dashed with a teaser), factions, street facts and history (`src/data/city.js`; locked district names in `config/names.js` under `lockedDistricts`).
- **Street talk.** One true rumour a week (threat ±1 in a district, or a district crisis made likely), plus reactions to loud or clean jobs (`src/core/rumours.js`, `src/data/rumours.js`).

## Decided but not built (do these in roughly this order)

1. **Playtest the rookie start**, then `PLAN-PROGRESSION.md` step 2 (career page, earned traits, maybe skill-threshold choices) and step 3 (crew relationships). Writing now has two layers (DESIGN.md 2026-10-25): set pieces by hand; routine work from reusable parts (`data/cast.js`, `{district}`/`{faction}` slots, shared crisis pools), every rookie choice with a plain `report` line. Owner drafts lore and jobs in other chats and pastes them: check against WORLD.md before they go in.
2. **District unlocks through reputation tiers** (after the progression plan; its job gates live inside Street tier, below these). `state.reputation` (0-100) and `state.tier` already exist, but nothing promotes you. At 100: Street → District opens **the Silt**, District → City opens **the Amber Reach**, City → Regional opens **Iron Peak**. Promotions are permanent; reputation can slip within a tier. Each unlock arrives as an inbox message from a client: the Ferryman (Silt), Ruth Okonkwo (Amber Reach), Mr. Szeto (Iron Peak). The intro texts are in `WORLD.md`. **Prerequisite:** each locked district needs 1-2 job types of its own, and its crises (drafts in `drafts/district-hooks.md`). Tune thresholds by simulation.
3. **Client trust arcs.** The dossier scenes in `WORLD.md` at trust 60/75/90 (and below 20) become inbox messages, using the decision-message system in `src/core/decisions.js` (as renewals and the heat notice do). Szeto's arc ends in the main choice: keep working for him, or expose him to protect Pearl Haven House. Auntie Fung's secret is the first clue to Szeto's. Some below-20 outcomes (Szeto raising rent, Okonkwo's audits) need new small systems.
4. **Client dossiers on the City tab.** (The public one-line write-ups moved to City on 2026-10-25; the secrets are still unbuilt.) The owner left these out of the City tab for now, because the secrets need the trust arcs first.

## Parked (owner's call; don't start without asking)

- The fixer's backstory, rival crews, festivals calendar, street-language glossary.
- Retirement, scouts improving with experience, multiple simultaneous jobs.

## Working with the owner

- **Ask, don't assume,** on anything design-shaped. The owner answers multiple-choice questions quickly and often adds a twist in the free-text answer. Recommend one option.
- **Keep commits few per day.** The owner squashes, and asked to keep their activity graph tidy. When unsure, fold the day's work into one commit before pushing to `main`.
- **Lore style:** narrative, second person, present tense (the client dossiers in `WORLD.md`). In-game text is shorter: 1-2 sentences, phone-first.
- **Canon rules:** English district names in the game, Chinese names as flavour; Cantonese romanisation, not Mandarin; everything invented (no real companies, triads, people or Hong Kong place names); nothing from Shadowrun or Cyberpunk 2077. Rumours are never confirmed. Mr. Szeto is suspected, never proven (until his arc).
- **The owner reviews AI-generated lore by pasting it back.** Check each batch against `WORLD.md` and the retired-names list before it becomes canon.

## Environment gotchas

- `npm run build` needs `npm ci` first in a fresh container (Vite isn't installed by default). `npm test` needs nothing.
- For browser checks: `npx vite preview --port <n>` in the background, then Playwright (pre-installed; `require('playwright')` works). Check at 360 and 430 px wide, and that map districts stay at least 44 px tall.
- Don't stop the preview server with `pkill -f "vite preview"` or a `pgrep` loop in the same command: the pattern matches the shell running it and kills the command (exit 144). Leave it running, or kill it by PID from a separate command.
