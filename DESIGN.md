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
| 2026-10-23 | Stats panels show the trait-adjusted number (what missions use), with the base and bonus underneath | Static was effectively an 18 in tech but showed 16; shown must equal used or players can't plan | Showing base stats only; showing both as separate columns |
| 2026-10-23 | Trait bonuses cannot take a stat past 20 (approach, fatigue and injury still adjust it on the job) | Keeps the 1-20 scale meaningful; 20 is the top | Uncapped trait bonuses |
| 2026-10-23 | Rookie main-stat ceilings now include 20 at 2% (19 at 6%, down from 8%) | Recruiting tops out at 18 by design, so the top of the scale should be something you develop. Before this nobody could ever reach 20 | No 20s at all; 20s buyable as recruits |
| 2026-10-23 | Development: every operative has a hidden ceiling per stat (`potential`) and banks growth points towards the next +1 | Nobody improved, so rookies were all cost and no upside. FM-style growth makes developing young runners a real strategy | Fixed stats; flat XP levels |
| 2026-10-23 | Ceilings by tier: rookie main stat 14-19 (16 most common), pro 15-17, veteran at most +1; other stats get small headroom | Rookies carry the most upside and the most uncertainty; veterans are what you see | Same headroom for everyone |
| 2026-10-23 | Growth points: 4 for making a crisis roll (a failure counts too), 1 for the others on the crew who watched, and for finishing a job 2 per key stat plus 3 in each person's own main stat. Cost per +1 is (stat + 4) x 1.7, and double for the last point below the ceiling | The "own main stat" part was added after simulation showed medics never grew (medical is no job's key stat) and muscle only grew on the warehouse job. The 1.7 scale is the tuning knob | Growth only from rolls (rookies rarely roll because the best person rolls); growth only from key stats (role-dependent) |
| 2026-10-23 | Tuning target met by simulation: a mentored rookie with a high ceiling goes 11 to about 16.5 in 22 jobs (17-18 by 30); without a mentor about 15; a ceiling of 14 plateaus at 13-14; a 27-year-old solo reaches about 13 | Matches the proposal: a good rookie passes most hireable pros in about a season of regular work. Locked in by tests/development.test.js | Faster growth (the first pass hit the ceiling by job 15 and made mentoring irrelevant) |
| 2026-10-23 | Age: under 25 grows x1.5, 25-34 x1, 35+ x0.5. Everyone ages a year at each new season; past 40, each stat has a 10% chance per year over 40 (max 50%) to drop 1 and the ceiling drops with it | Youth is the asset you're buying; decline eventually pushes veterans out. Teo (41) starts slipping in season 2 | No ageing; sudden retirement at a fixed age |
| 2026-10-23 | Mentoring: a rookie on a job with any veteran-trait operative, or a veteran of the same role, grows x1.5. The planning screen says who is learning from whom | Master-and-apprentice from the setting; gives a reason to mix weak and strong runners. Measured worth: about 1.5 stat points over 22 jobs | Mentoring between any two operatives; a separate training screen |
| 2026-10-23 | Rookies graduate to pro at 15 in their main stat, with an inbox message. They keep a rookie's wage until wage renegotiation exists | A visible payoff moment; cheap now, star later | Graduation by job count |
| 2026-10-23 | Fuzzy potential: never shown as a number. The recruit page carries a scout's opinion in words (a same-role crew member, else the veteran, else the coolest head), off by 1-2 about 45% of the time. The error stays with the operative, so the read on their page stays consistently wrong until the stats prove otherwise | Owner's choice: finding a hidden gem is half the fun of Football Manager | Exact ceilings shown as numbers; a star rating |
| 2026-10-23 | 3 save slots; the old single save moves into slot 1 | Lets players run several playthroughs (e.g. one Ironman, one Story) without losing a save | One slot; unlimited slots |
| 2026-10-23 | Difficulty chosen when starting a game in a slot | Story and Ironman existed in the design but could not be selected | Difficulty switchable mid-game (would undermine Ironman) |
| 2026-10-23 | Automatic backup per slot at the start of each in-game week, restorable (not on Ironman) | Protects against mistakes and bugs without the player doing anything | Backup every save (too many rollback points; easy save-scumming) |
| 2026-10-23 | Backup reminder after 28 in-game days without an export | Safari can wipe browser storage after about a week away; an exported file is the only safe copy | No reminder; automatic downloads (browsers block them) |
| 2026-10-23 | Ironman lock: each Ironman run has an id and a save counter; loading a copy older than the newest this browser has seen is refused | Makes deaths stick, which is the point of Ironman | Banning export on Ironman (players need it to back up and move devices) |
| 2026-10-23 | Known gap: the lock is per browser, so rolling back by copying a file to a second device is still possible, as is clearing site data | Closing it needs accounts or a server; not worth it now | Server-side saves |
| 2026-10-23 | New optional state fields (`lastBackupDay`, `ironman`) without bumping SAVE_VERSION | They default safely when absent; avoids clashing with development work changing the format in parallel | Bump to v4 |
| 2026-10-23 | Recruits are fully generated from name, handle, origin and personality pools | Never runs out over an endless game; owner's choice | Hand-written pool of 10-15 (more memorable, but repeats) |
| 2026-10-23 | Generated cast: about 60% HK Chinese, plus Filipino, South Asian (incl. Nepali), African, Southeast Asian and European pools; always 18+ (enforced by test) | Matches the city's identity; tested across 5,000 recruits | Uniform mix |
| 2026-10-23 | Roster cap starts at 8 and grows +2 per safehouse expansion (¥10k x level, rent +¥1k/week) | Owner wants to build a bigger squad and an enterprise over time; growth costs money and raises upkeep, so size is a strategic choice | Fixed cap of 6; free growth |
| 2026-10-23 | One scout lead per week on Wednesdays, two if the crew has fewer than 4; leads last 7 days | Steady trickle keeps hiring a decision; the safety net prevents a lock-out after deaths | Hiring from an always-open market |
| 2026-10-23 | Hiring costs a signing fee of one week's wage; haggle once with your best social stat for -15% | Keeps hiring a real spend and gives the face role a use outside missions | Free hiring; repeated haggling |
| 2026-10-23 | Recruit wages ¥450-750 by quality (rookie 50%, pro 38%, veteran 12%) | Sits alongside the starting crew (¥550-650) so recruits don't break the economy | Wages scaled only on stats (came out too high) |
| 2026-10-23 | Missing roles are weighted to turn up more often among recruits | Helps players rebuild a balanced crew after a loss | Purely random roles |
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
- **A bigger crew needs more work.** Recruiting and expansion now exist, but the board still offers at most 4 jobs a week, one crew at a time. Growing past about 8 needs multiple simultaneous jobs, then delegation to captains (the Act II/III plan).
- **The economy slowly bleeds.** Careful play, measured over 200 simulated runs: median cash ¥10,350 after week 1, ¥6,700 after week 4, ¥1,900 after week 8, with 41% broke by week 8. Pressure is intended, but there is no way to grow yet (no reputation tiers, better jobs or lower costs). Tune together with reputation tiers.

- **Development follow-ups.** Retirement (decline sets it up but nobody retires yet), wage renegotiation for graduated rookies, and scouts improving with experience. Growth also depends on the job mix: with only 3 job types, a rookie's secondary stats grow unevenly.

- Tone: confirm "gritty but human" after the first playtest.
- Real names for the game, city and districts.
- Monetisation, if any: one-off purchase vs. free with paid expansions.
