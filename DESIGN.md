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
| 2026-10-23 | Heat cools 1 every Sunday, or 3 after a quiet week (no job started) | Creates a real choice between taking work and lying low; simulated players working the top job every week still reach heat 9 by week 8, so pressure remains | Cooling only on quiet weeks (careful players would never cool); flat decay with no lie-low bonus |
| 2026-10-23 | Automated tests for the rules only (death rule, exits, Story mode, content, saves, economy band); they gate every deploy | Endless games with saves break quietly; these promises must never regress | Testing screens automatically (not worth it at this size); no tests |
| 2026-10-23 | Coloured initial badges as placeholder portraits, one colour per operative | Makes the crew easy to tell apart at a glance, costs nothing, swaps cleanly for portraits later | Generic avatars; waiting for real art |
| 2026-10-23 | Art order: crew portraits first, then district backdrops, then icons; sprites and animation late or never. Art starts after the first playtest and is required before iOS | Attachment to people is the point, so faces give the most value per asset; App Store listings need visuals | Sprites first; art before the loop is proven |
| 2026-10-23 | 6 crises per mission type (18 total); 2-3 drawn per run, so 15+ combinations per job | Jobs stop repeating within a few plays; variety is what makes the first playtest land | 2 crises per type; procedurally generated crises (too early) |
| 2026-10-23 | Crises lean on the city's culture: Signal 8 typhoons, dai pai dongs, Red Lantern road tolls, char siu for the guard dog, sampans, bubble-tea wifi | The setting should be felt in moment-to-moment play, not only in names | Generic cyberpunk set pieces |
| 2026-10-23 | "Certain" choices (no roll): paying a toll, leaving loot behind | Some decisions are pure trade-offs of money or heat versus risk; a roll would add noise | Every choice rolls |
| 2026-10-23 | Failure costs: a failed roll can cost heat or pay instead of an injury | Not every failure should hurt someone; heat as a consequence makes the city react | Injury as the only failure consequence |
| 2026-10-23 | Trait-gated options (Cherry's Silver Tongue unlocks a bonus-pay talk option) | Traits should open choices, not just shift numbers; makes who you bring matter | Traits as stat modifiers only |
| 2026-10-23 | Risk shown as labels (low/moderate/high/extreme) plus a short reason, never percentages | Honest enough to plan with, without turning crises into maths; reasons teach the player what matters | Exact percentages; percentages only on Story mode |
| 2026-10-23 | Beats revealed one tap at a time | Builds tension and lets the player read at their own pace | Auto-scrolling text |
| 2026-10-23 | Missions play immediately after planning; crew is then away for the job's days | Keeps the loop tight; the "away" time is the cost | Scheduling a mission for a later day |
| 2026-10-23 | Critical state: stabilise (needs a medic), extract (job ends, half pay lost, op saved) or push on (op may die) | Death only ever follows "push on"; verified across 3,000 simulated missions | Critical as instant death; no choice at critical |
| 2026-10-23 | Push on without a medic: about 1 in 3 survive; with a medic about 2 in 3; Story mode always survives | Pushing must be a real gamble; a medic on the crew matters | Fixed death on push |
| 2026-10-23 | Aborting at any point saves everyone, including anyone left critical earlier | Keeps the promise that an exit always saves lives | Abort only saves the healthy |
| 2026-10-23 | Failed rolls injure the crisis's focus operative if it has one, otherwise whoever made the attempt | Injuries should follow the story of the crisis, not hit a random bystander | Random crew member |
| 2026-10-23 | Approaches: Stealth (+stealth/tech, -combat), Loud (+combat, +1 heat), Social (+social, -stealth) | A light planning decision that interacts with the crew's stats | No approach choice |
| 2026-10-23 | Opening board: courier (safe, 2,500), data pull (mid), warehouse (dangerous, 6,000); rent 4,000 + wages 3,050 weekly | Forces the first real choice: the safe job alone doesn't cover the week | Random opening jobs |
| 2026-10-23 | New jobs arrive every Monday (up to 4 on the board), each lasts a week | Gives the week a rhythm; scarcity makes choices matter | Endless job list |
| 2026-10-23 | Superstitious trait: won't start a job on a day number ending in 4 (Teo picked up the city's fear of four) | Shows the city's Cantonese culture shaping a non-Chinese character | Calendar months |
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

- **Heat does nothing yet.** Cooling was added (see log), but high heat has no consequences. Candidates: police attention events, harder crises, safehouse raids, clients refusing to hire you.
- **The roster can only shrink.** Max 5 operatives and no recruiting, so two deaths make 4-person jobs impossible. Needs a recruiting path (scout tips, hiring, wage negotiation) and a roster cap.
- **The economy slowly bleeds.** Careful play, measured over 200 simulated runs: median cash ¥10,350 after week 1, ¥6,700 after week 4, ¥1,900 after week 8, with 41% broke by week 8. Pressure is intended, but there is no way to grow yet (no reputation tiers, better jobs or lower costs). Tune together with reputation tiers.

- Tone: confirm "gritty but human" after the first playtest.
- Real names for the game, city and districts.
- Monetisation, if any: one-off purchase vs. free with paid expansions.
