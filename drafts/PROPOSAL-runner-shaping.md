# Proposal: shaping a runner, in one place

Status: direction agreed with the owner (2026-11-18, calls below). Step 1 (the read) is built; nothing else is. Supersedes the "piece vs role" split in `drafts/RECONCILE-medical-piloting-leadership.md`, which this replaces as the way medical, piloting and leadership abilities are earned.

## The owner's direction (2026-11-18)

- Abilities should not split by where they come from ("offer vs career shouldn't matter"). They are all the runner's traits and skills, gained from **one menu** where the player shapes their people: traits, a skill tree, and so on.
- The player may **steer natural growth**: choose which stats grow.
- **Stat minimums unlock** traits and abilities.

## What exists today

| System | Where | How it is gained | Player choice |
| --- | --- | --- | --- |
| Stat growth | `core/development.js` | From the work: 4 points a crisis roll, 2 per key stat a job, 3 more in the main stat; a hidden ceiling per stat; age decline | Only which jobs you send them on |
| Born traits | `data/traits.js` | Rolled at recruitment | None |
| Earned traits | `core/earned.js` | From what happens on jobs; progress hidden, arrives as a story | None |
| Specialisations | `core/specialisations.js` | Stats plus jobs on overwatch with a kit, then Joss offers | Take it or "not yet" |
| Build pieces | `core/builds.js` | Stats plus jobs with the crew, then Joss offers 2-3 | Pick one or "not yet" |

The player meets these in four places (the runner page's trait rows, Joss's messages, the offers block, the build section), and two of them have rules the player can't see.

## The proposal

**1. Growth stays from the work.** It is the Football Manager heart of the game, and the pace sims, wages and the death rule's tuning assume it. The hidden ceiling stays, because it is what scouting is for.

**2. Steering on top: a training focus.** The player picks one or two stats per runner, which take a larger share of the points they earn: a nudge (owner's call 1).

**3. One menu on the runner's page.** Everything they hold and everything gated by stats, in one list: born and earned traits, a specialisation, moves and payloads, and later the medic's, pilot's and leader's abilities. Each entry shows its stat minimums and how far the runner is from them.

**4. Stat minimums are the gates.** Already how specialisations and build pieces work (`needs`). Medical, piloting and leadership abilities use the same field. The training focus decides which gates a runner moves towards.

**5. Picks at milestones.** At graduation, veteran, or every few jobs, the player picks one entry whose gates the runner has met, from the open menu (owner's call 2). This replaces Joss's offers.

## What stays apart

- **Earned traits keep their hidden progress** (an agreed rule: "progress hidden until earned"). They show in the menu once held, never as something to aim for. Changing that is a separate call.
- **Synergies** stay their own row: they are about two people, not one.

## The owner's calls (2026-11-18)

1. **Steering is a nudge.** The player picks one or two focus stats per runner; they take a larger share (about 1.5 times, a first value to check with the pace sims) of the points the runner earns anyway. A sim must show the nudge is felt, since most points come from crisis rolls on whatever stat the moment asks for.
2. **Picks come from an open menu, with gates.** The whole menu is always visible on the runner's page, every entry with its stat minimums. At a milestone the player picks any entry whose gates the runner has met. Joss's random offers go. What keeps two runners of one role apart is growth, not luck: hidden ceilings and the work they have done decide which gates they ever reach, and the nudge only steers within that. Scouting matters more, because you recruit for the build you want.
3. **Specialisations become entries** like moves and payloads: one rule, a stat gate, taken at a pick. The "jobs on overwatch with the kit" requirement can stay as an extra gate (suggested: shown, since it is a requirement, not a story).
4. **Earned traits keep their hidden progress.** They show in the menu once held, never as goals.
5. **Training focus and picks both stay** (follows from 1 and 2).

**Still open:** the milestones themselves (graduation, veteran, every few jobs: how often), how many abilities a runner holds (the caps, tuned by feel), and the menu's look. The open menu needs enough entries to make different paths (around 15-20); today it has 5 (two specialisations, one move, two payloads), so picks feel thin until medical, piloting, leadership and more moves add entries.

## Build order

1. **The read** (built 2026-11-18): `core/abilities.js abilitiesOf(op)`: what a runner holds from all four systems, and the stat-gated entries for their open places with what each is missing. No screen, no save change. Tested against `eligiblePieces` so the read and the offers agree.
2. **The menu on the runner's page** (UI; after the owner picks the look; phone width first; screenshots).
3. **Training focus** (save change; the pace sims check the nudge is felt and the season pace holds).
4. **Milestone picks from the open menu**, replacing Joss's offer messages for specialisations and pieces (save migration: open offers, `op.spec` into the held list).
5. **Medical, piloting and leadership abilities** as entries with stat minimums, each from its own proposal.

The agreed order still holds (builds, then the playtest): steps 2-5 wait for the playtest unless the owner moves them. The playtest question: do you ever look at a runner and wish you could steer them?
