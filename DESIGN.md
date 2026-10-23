# Design notes and decision log

Living record of the game's narrative and every design choice we make, with the reason behind it. Update this whenever a decision is made or changed. Newest log entries go at the top of the log.

Full core-loop design doc: https://claude.ai/artifact/W38zoiZvsjL9vt78jKXgxN

---

## The game in one paragraph

You are a fixer in **Lantern Bay** (placeholder name), a Hong Kong-inspired megacity. You start with five people, one safehouse and rent due on Sunday. Over the years you build them into a syndicate. There is no ending: like Football Manager, the story comes from the people you recruit, keep alive, lose, and remember.

## Setting

- **City:** fictional, Hong Kong-inspired, multicultural megacity. Cantonese Chinese culture is the base layer (street life, superstitions, mahjong parlours, night markets, master-and-apprentice traditions), with large Filipino, South Asian, African and European communities layered on top, as in a real port megacity.
- **Districts (placeholders):** Old Town, The Docks, Night Market, Glass Heights.
- **Cast mix:** leans Hong Kong Chinese (about 3 in 5) with a multicultural mix. Applies to the starting crew and, later, to generated recruits.

## Tone

**Gritty but human** (working assumption; confirm after the first playtest). Losses hurt, but the baseline is warmth, loyalty and dark humour. Darker moments arrive as events, not as the default mood.

## Starting crew

| Operative | Role | Background | Why they're in the crew |
| --- | --- | --- | --- |
| Mei Lin Chau "Stitch" | Medic | HK Chinese, ex-ER nurse, struck off | The calm centre; the medic who makes "stabilise" possible |
| Wing Lam "Static" | Tech | HK Chinese, grew up above a Night Market electronics stall | Pushes her implants too hard: the built-in neural-load story |
| Cherry Tse "Velvet" | Face | HK Chinese, raised in a mahjong parlour | Charming and greedy: the built-in buyout-temptation story |
| Teo Vargas "Wheels" | Driver | Filipino, 20 years in the city | The fatherly veteran who never leaves anyone behind |
| Jax Okafor | Muscle | Nigerian, raised in the Docks | Hothead and loyal: the one most likely to go critical |

Each operative is built to carry one long-running story thread, so the first season has drama before any systems are added.

---

## Decision log

| Date | Decision | Why | Rejected alternatives |
| --- | --- | --- | --- |
| 2026-10-23 | Cast leans Hong Kong Chinese (3 of 5), multicultural mix | The city is HK-inspired but a megacity; a mixed cast feels true to a port city and broadens appeal | All-Chinese cast; evenly international mix |
| 2026-10-23 | Commits authored as marcusw | Owner's preference | - |
| 2026-10-23 | Placeholder names (title, city, districts) kept in one file, `src/config/names.js` | A better name will come later; one file makes renaming trivial | Naming now |
| 2026-10-23 | Plain JavaScript + Vite, hosted on GitHub Pages | Owner knows JS; Vite is fast and packages cleanly for iOS | TypeScript (learning curve), a game engine (overkill for text) |
| 2026-10-23 | Build iOS-ready from day one | Cheap now, expensive later: logic separate from UI, no hover-only info, phone-width layout, 44px taps, one save module | Desktop-first, convert later (would mean rewriting the UI) |
| 2026-10-23 | Death is preventable with good play | Players get attached to their crew; death must come from a risk they chose or a warning they ignored, never bad luck alone | Pure dice permadeath (feels unfair, players stop caring) |
| 2026-10-23 | Every crisis has an abort or extract choice (enforced in code) | Guarantees there is always a way to save a life at a cost | Crises with no way out |
| 2026-10-23 | Injury ladder: light, serious, critical, dead | Most bad outcomes hurt without deleting the character; critical gives one last decision | Binary alive/dead |
| 2026-10-23 | Difficulty: Story / Standard / Ironman | Lets tone and punishment flex without committing to one | One fixed difficulty |
| 2026-10-23 | Target 0-1 deaths per season on Standard with strong play | Keeps death meaningful but rare; turnover comes from retirement, transfers and ageing | Frequent attrition |
| 2026-10-23 | Missions: plan, then narrated beats, then 2-3 crisis decisions | Text-based tactical combat is hard to make fun; this keeps the player's choices responsible for outcomes | Grid tactics; full auto-resolve |
| 2026-10-23 | Player is a fixer who leads from the van, never fights | Football Manager framing; the player is the manager, not a squad member | Playable fighter; abstract manager |
| 2026-10-23 | Time runs day by day, pausable, stops when a decision is needed | Quiet weeks pass in a few clicks; drama interrupts | Turn-based weeks |
| 2026-10-23 | The inbox is the main interface | Text-first fits; it is how Football Manager works | Map-first UI |
| 2026-10-23 | Endless, no win condition | Football Manager-style unfolding story; long-term engine comes from seasons, rivals, reputation tiers, new talent | Fixed campaign with acts |
| 2026-10-23 | Fictional HK-inspired city, not Hong Kong itself | Freedom to add districts forever; keeps real Hong Kong for a separate, calmer game | Real Hong Kong; another real city |
| 2026-10-23 | Operatives are always 18+ (enforced in code) | The original "youth academy" idea recruited 16-18 year-olds into a heist crew, which reads as exploitation unless it's a deliberate theme | Teen recruits |
| 2026-10-23 | Text and menus first, portraits or sprites later | Proves the emotional loop before spending on art | Art-first |
| 2026-10-23 | MVP proves one thing: losing a named operative in text hurts | If that works, every later system has something to stand on | Building delegation, academy and transfers first |

---

## Open questions

- Tone: confirm "gritty but human" after the first playtest.
- Real names for the game, city and districts.
- Monetisation, if any: one-off purchase vs. free with paid expansions.
