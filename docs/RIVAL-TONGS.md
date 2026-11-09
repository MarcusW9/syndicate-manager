# The other tongs (rival tongs): state of play

One page to pick the work up from. Written 2026-11-09 from the code, `CHANGELOG.md`, `HANDOFF.md` and the decision log. If this page and the code disagree, the code wins; fix this page.

Spec and history live elsewhere: `drafts/PROPOSAL-phase-3.md` part C (C.0 to C.13) is the original design and part D the loyalty and mobility half. It is long and parts of it are out of date (its slice list and "Later"). The "why" for each step is in the decision log, `docs/design/2026-11.md` (search "other tongs", "C3", "D3"). Lore is in `WORLD.md` "The other tongs".

## The idea in six lines

- There is **no league**. Lantern Bay has about six other tongs, peers not gangs, made fresh for each game.
- They work, recruit, rise, fade, fold and form in the background, and people talk about them.
- The player **never sees a table, position or rating**. You feel where you stand through tier words, the Monday Word, client remarks, and who comes knocking.
- Rivals **never raid** and never touch heat, halls or opening favours. The Red Lanterns and the Silver Fan stay the turf powers (`core/gangs.js`).
- Rivals **hold no grudge**. They have a hidden *regard* for you that moves only on explicit acts (poaching, splitting a job).
- No rival is based in the Silt (owner, 2026-11-08).

## What is built

| Slice | What | Date | Save |
| --- | --- | --- | --- |
| C0 | Canon, naming kit, styles, the Brass Anchor Society (via `add-lore`) | 2026-11-08 | none |
| C1 | `state.rivals` (tongs, ~40 cards, word); weekly step; The Word on Mondays; City › Tongs; Names on the street | 2026-11-08 | v51 (renumbered, see log) |
| C2 | Contact: the "Rival crew" twist names a real tong and one of its runners; clients sometimes say another tong wanted the job. Flavour only | 2026-11-08 | none |
| C3a | Core: dossiers, scouting, persuasion, buyouts, regard, folding and forming, the free name, signing | 2026-11-08 | v53 |
| C3b | Screens: Free names, a name's page, Scout (side task), Sign | 2026-11-08 | none |
| D3 | Rivals approach your runners; Match it or Let them go (they pay you a buyout) | 2026-11-09 | none |

Related and built: B, the Legend defining job (rivals' fame words feed off the same fame tiers); D1 retirement and the Hall; D2 loyalty (`op.loyalty`); D4 sworn runners (rivals approach a sworn runner a tenth as often). Current save version: **57** (`SAVE_VERSION` in `core/state.js`).

## How it behaves

**State** (`state.rivals`): `tongs` (id, name, home district, style, hidden prestige, wealth, halls, depth, regard, head, status, formedDay, foldedDay), `cards` (~40 named runners: name, tong or free, role, hidden rating, age, peak, form, fame, since), `word` (talk as a kind plus ids, no text), `offer` (this month's free name), `scouted` (cardId → level 0-3), plus sequence counters. The Brass Anchor is **not** in state: it is a fixed elder in `data/rivals.js`.

**Weekly step** (`weeklyRivals`, Sundays, called from `settleWeek` in `core/time.js` after `weeklyFame`): work (prestige and wealth drift by style, halls open and close against marks), growth, drift between tongs, ageing and retirement at season end, tier changes, folding and forming, the free name, then The Word is trimmed. A tong's tier is its hidden hall count run through `rankForHalls`, the same rule as the player's rank.

**Free name:** every 3 to 6 weeks (random, a hash) one free card is put forward, a folded tong's best first. Left alone 3 weeks, it goes to a rival.

**Scouting:** a two-day side task using the scout's social stat. Level 1 shows full stats and the potential read (with the usual error), level 2 halves the error and makes the wage exact, level 3 is exact. A failed trip tells you nothing.

**Signing:** never a roll. `persuasion` is a pure score from the player's tier, Legends/Elites and a leader on the crew, a free bed, and cash. It sets a premium over market wage (up to +35%) shown in ¥. A runner in a tong also costs a **buyout**: 6 weeks of market wage, +10% per ¥10,000 of the tong's wealth (cap +50%), +25% if their regard is cold, -10% if warm. Heads of tongs can't be approached. Signing a tong's runner costs 2 regard; splitting a job with them gives +1 (at most monthly); regard eases toward 0 every other Sunday.

**Folding and forming:** a small tong (one hall, prestige under 25, wealth under ¥6,000) for 6 Sundays folds, never below 4 tongs. Its runners go free one by one, lowest rated first. A folded tong's best card (rating 40+) may form a new tong (50%); a season's end can form one if fewer than 6 are active.

**Rivals poaching you (D3):** from Street rank up, on Sundays, one offer a week at most, for a runner who is free and not hurt. Odds: rookie 8%, pro 5%, veteran 2.5% a week, halved for Elites, a tenth for Legends, times `(1 - loyalty)^1.5`. Joss warns a week ahead (message kind `poach`). Match it (about +15% pay, runner stays, +5 loyalty) or Let them go (the rival pays a buyout by the same formula as ours, -2 loyalty to the crew). Unanswered, they go at the end of the week, never mid-job. All numbers are in `data/mobility.js`.

## Rules that must stay true (tests enforce these)

1. **No numbers about rivals on screen.** The UI reads `rivalView` only, which returns word keys and proper names. Wording lives in `data/rivals.js`, never in core. The one exception is ¥ the player pays (a price, a buyout).
2. **No order beyond tier.** Grouped by tier, sorted by name inside it.
3. **Isolation.** Everything uses `hashRng`, never `nextRng`, so `state.rngCounter` and every player roll stay where they were. Keys: `'rivals'`, `'rivals:<week>'`, `'rival-twist'`, `'client-rival'`, card ids for dossiers.
4. **Renown and ratings never touch a roll, pay or heat.**
5. **Portable maths (iOS).** 32-bit integer hashing over ASCII keys; hidden values rounded to integers. `tests/golden/rivals-1234.json` is what a native build is checked against.
6. **Dossiers are never saved.** `dossierOf` rebuilds a card's runner from a hash; `cardToOperative` and `operativeToCard` match within ±2 rating.

## Where things live

| File | Job |
| --- | --- |
| `src/core/rivals.js` | `seedRivals`, `weeklyRivals`, `rivalView`, `tongsByTier`, `namesOnTheStreet`, `mondayWord`, `rivalForJob` / `clientRival` / `noteRivalEncounter` (C2) |
| `src/core/rating.js` | The hidden rating: `ratingOf`, `cardRating`, and the only place numbers become words |
| `src/core/tong.js` | `rankOf`, `rankForHalls` (one ladder for the player and rivals) |
| `src/core/dossier.js` | `dossierOf`, `readFor`, scouting (`sendScout`, `resolveScout`), `persuasion`, `buyoutAmount` / `buyoutFor`, `approachFor`, `signCard`, `cardToOperative`, `operativeToCard` |
| `src/core/mobility.js` | D3: rivals approach your runners |
| `src/core/loyalty.js`, `src/core/oath.js` | D2 and D4, which change how often rivals approach |
| `src/data/rivals.js` | Naming kit, text tables, the Brass Anchor, all the `RIVALS` tuning numbers |
| `src/data/mobility.js` | D3 numbers and wording (first pass) |
| `src/data/tong.js` | The rank ladder: Back Room, Street, District, City, Harbour |
| `src/ui/tongs.js` | City › Tongs, a tong's page, a name's read-only profile, Names on the street, The Word |
| `src/ui/app.js` | Crew › Leads draws scouting, "what it would take" and Sign (`renderLeadName`, `leadNames`) |
| `tests/rivals.test.js`, `rivals-c3.test.js`, `rivals-c3b.test.js`, `mobility.test.js` | Tests |
| `tests/golden/rivals-1234.json` | Golden snapshot for iOS |
| `scripts/sim-names.mjs`, `scripts/sim-phase2.mjs` | Sims that check Names on the street and the week-26 tier spread |

## Open and not built

**Waiting on the owner:**
- Wording in `data/mobility.js` (D3) is a first pass. The Word's lines (`WORD_TEXT`) may need changes after real Mondays.
- Numbers the owner may tune: the three scout levels, the +35% persuasion ceiling, the 6-week buyout multiple, regard's -2 and +1.
- A1 playtest with a stopwatch (pacing) is the next step in `HANDOFF.md`; it will say whether rival talk and poaching feel right.

**Ideas, no rule yet (don't start without asking):**
- `contestOffers`: rivals competing for the board's contracts (once per job id via `hashRng(seed, 'contest:' + job.id)`).
- Heist races against a rival.
- Heads of tongs approachable late-game with a Legend on the crew.
- A tong turning hostile after repeated poaching (the `grudge` idea was replaced by regard; hostility is not built).
- Rivals moving toward the Silt once the development next to it is written.
- Back-room roles (hall hands, medic, leader, scout, haggler, mentor) as a third option beside retirement.

**Known loose ends:** a client's `affiliation` in `data/clients.js` is shown nowhere. The Brass Anchor is both a Who's who entry and the fixed elder under City › Tongs (kept as two passages, owner's call). `docs/ARCHITECTURE.md` still says save v54; the real version is 57.

## Working on it: checklist

- Read `CODEMAP.md`, then this page, then the file you are changing.
- Any new rival roll gets its own `hashRng` key and must not move `rngCounter`.
- Any state change: bump `SAVE_VERSION`, add a migration in `save/save.js`, extend the golden file if tongs or cards change.
- New player-facing words go in `data/rivals.js` or `data/mobility.js`, not core. Canon changes go through the `add-lore` skill.
- `npm test`, then add a `CHANGELOG.md` entry and a decision-log row. Screenshots if the look changes.
