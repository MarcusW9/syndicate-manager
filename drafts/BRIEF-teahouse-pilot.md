# Brief: slate day at the teahouse (recruiting as a place you go) (2026-11-21)

**Status: held (owner, 2026-11-21), superseded for now by Joss's slate-day leads (`slateLeads`, `core/book.js`; decision log 2026-11-21). Revisit only if that proves too thin in the playtest; the three questions at the end have Claude's suggested answers in the session of 2026-11-21 (paid tea at about a rookie's day wage; instant sign allowed with the risk shown; every slate day).** Was: drafted, not agreed. Owner direction (2026-11-21): flesh out the world of the other tongs, hiring from them, building and cultivating a squad. **Playable first, lore after.** If the pilot plays well, the lore pass is queued in `HANDOFF.md` (Parked). Nothing here changes canon: scenes run on what a house *is* in the game (style, habit, story, regard), and use the head the game generated.

## What it is

Today, recruiting from another tong is a menu: Free names, a name's page, Scout (a side task), Sign. This pilot adds **one scene**: on the day the Anchor's slate goes up (`bookDue`, every 28th day, the first Monday of the month), Joss says the board is chalked and the street is at the teahouse. The player goes. The scene is a short decision message in the same machinery as the poach and renewal messages: three names, three ways to approach each, a few lines, a result.

It is an **errand with a scene, not a mini-game**: no rolls, no new currency, no new screen outside Messages, and nothing the player cannot see before choosing.

## The scene

**Gate:** Street rank or higher (the same gate as D3), a published Book, at least two candidates. Posted on the Monday `publishBook` runs. Left unanswered it lapses on the next Sunday: no penalty, no regard change (it is an invitation).

**Three names at the tables** (picked in `core/teahouse.js`, a hash of `'teahouse:' + bookMonth`, never `nextRng`; fewer if fewer qualify; a name is never one of ours):
1. **A slated name from a house we have a read on** (the slate's grade is shown; if our own read disagrees, the E3 "flattered / sold short" mark shows too).
2. **A name that is loose:** on the free list, or on sale from a selling or broken house (E2), or unsettled (E3, level 2 read).
3. **One to watch** from the slate's "Ones to watch", or failing that a rising name from the top house.

Each name shows: face, name, grade, their house's seal and one line of what that house is doing (its story, from the rival story pips) and their price as `approachFor` already computes it.

**Three approaches per name** (the choice is shown with its cost before it is made):
| Approach | Cost | What it does |
| --- | --- | --- |
| **Buy the tea and listen** | ¥ small, fixed (`TEAHOUSE.tea`) | Raises the read of that name by one level now (`raisedRead`, `core/reads.js`; a level-2 read is a real picture of them). Two or three lines from the table: what the house is like to work for, and one honest thing about the person. No regard change. |
| **Make the offer here** | The usual premium and buyout (`approachFor`), no scout trip needed | Signs them now through `signCard` (same price, same regard hit for a poach, -2). The scene's difference is that it is **instant and needs no read**: the player decides on the slate's word alone, and the Book is only a loose opinion (its accuracy is about 46% by band). The risk is the player's, and shown. |
| **Leave it** | None | Next. |

One approach per name, one name acted on per scene (the scene ends after a sign; listening on all three is allowed: it is the cheap way to learn and costs ¥ each).

**The scene's text** comes from `data/teahouse.js`, picked by the house's habit and story, with the generated head and runner names filled in. Lines are short and plain (`WRITING_GUIDE.md`); they use only what the game already knows. First-pass lines are Claude's placeholders, logged in `drafts/writing-tasks.md` for the owner.

## What is new, where

| Where | Change |
| --- | --- |
| `src/core/teahouse.js` (new) | `teahouseDue(state)`, `teahouseScene(state)` (picks the three names, builds the message payload), `TEAHOUSE_RESOLVER(state, msg, optionId)` (tea: raise the read and take ¥; sign: calls `signCard`; leave). Pure over state; hashRng only. |
| `src/core/decisions.js` | Register kind `'teahouse'` in `RESOLVERS` (like `'poach'`). |
| `src/core/book.js` or `time.js` | Post the scene's message on the Monday `publishBook` runs (a call at the end of `weeklyRivals`, after the Book). |
| `src/data/teahouse.js` (new) | `TEAHOUSE` numbers (tea cost, candidate counts) and `TEAHOUSE_TEXT` (intro from Joss, table lines by habit and story, the lapse line). Data only. |
| `src/ui/messages.js` | `renderTeahouse`: the three names as tiles (reuse the slate's face tiles from E0), the three approaches as buttons of at least 44px, cost shown on each. Tap to open a name's page. Phone first, check at 844x390. |
| `docs/RIVAL-TONGS.md`, `CODEMAP.md` | A row in "What is built"; the file in CODEMAP. |

**Save:** none expected. The scene is a message in `state.messages` with its payload; the read and the signing use fields that exist. If building it shows a field is needed (for example "last teahouse month" to stop a duplicate), bump `SAVE_VERSION` and add a `migrate` block (`docs/ARCHITECTURE.md` section 8).

## Rules that must hold (each gets a test)

1. **No roll moves `rngCounter`.** Everything is a `hashRng` key (`'teahouse:' + month`).
2. **The player sees every cost before choosing.** No hidden loss; an unanswered scene lapses for free.
3. **Signing here is the same signing:** same price, same regard effect, same `signCard`; no discount hidden in the scene, none on the cold-house rules in `RIVAL-TONGS.md`.
4. **Cold houses never act off the board:** heat, cash, halls, rolls and pay for the same seed are identical whether the scene is taken or not, apart from what the player chose to pay or sign.
5. **The slate stays an opinion:** the scene never reads the hidden rating; only the player's own read (`levelInEffect`) can raise what is known. The Book's own test stays.
6. A name already ours, retired or folded is never offered.
7. Core has no DOM or storage; the UI only calls the resolver.

## Not in this pilot (the next steps, only if it plays well)

- **Ties that follow a runner** (an old mentor, a rival from the same table, a debt to their old house) and their old house turning up in jobs and The Word.
- **Other scenes:** a house's front room, a name let go in the street, a head's offer.
- **Back-room roles** for retired or let-go runners.
- **The lore pass** (heads, customs by style): see `HANDOFF.md`, Parked.
- **Contested offers:** paused by the owner (2026-11-21).

## Gates and housekeeping

- A sim: run the scene over several seeds and 26+ weeks; report how often it appears, how often each approach would be sensible, ¥ spent per month, and the share of signings made on the slate's word that the player's own read later disagreed with (the E3 mark). Put it in `scripts/` and `docs/sims/teahouse-<date>.md`.
- `npm test` before the push; screenshots with `npm run screenshots -- teahouse-pilot` and a row in `docs/screenshots/README.md`; changelog entry; a decision-log row at the top of the newest file in `docs/design/` (decision, why, rejected: a scene that rolls for a better deal, a lasting regard change on an unanswered scene).
- One PR on a branch from `main`. Do not open it: the owner asks for each one.

## Questions for the owner (answer before building)

1. **Tea cost and read:** one level per tea, ¥ fixed (proposed). Or free, but limited to one name a visit?
2. **Offer here:** is an instant sign on the slate's word alone the right risk, or should it need at least a level 1 read (so the player has to listen first)?
3. **Frequency:** every slate day (proposed), or only some months?
