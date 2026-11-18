# Proposal: shaping a runner, in one place

Status: draft, 2026-11-18, from the owner's chat. Step 1 (the read) is built; nothing else is. Supersedes the "piece vs role" split in `drafts/RECONCILE-medical-piloting-leadership.md`, which this replaces as the way medical, piloting and leadership abilities are earned.

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

**2. Steering on top: a training focus.** The player picks one or two stats per runner, which take a larger share of the points they earn. Open: a nudge or a hard choice (below).

**3. One menu on the runner's page.** Everything they hold and everything gated by stats, in one list: born and earned traits, a specialisation, moves and payloads, and later the medic's, pilot's and leader's abilities. Each entry shows its stat minimums and how far the runner is from them.

**4. Stat minimums are the gates.** Already how specialisations and build pieces work (`needs`). Medical, piloting and leadership abilities use the same field. The training focus decides which gates a runner moves towards.

**5. Picks at milestones.** At graduation, veteran, or every few jobs, the player picks one entry they qualify for. This is today's Joss offer, moved into the menu. Whether Joss still offers 2-3 (roguelite luck) or the player sees everything they qualify for is open.

## What stays apart

- **Earned traits keep their hidden progress** (an agreed rule: "progress hidden until earned"). They show in the menu once held, never as something to aim for. Changing that is a separate call.
- **Synergies** stay their own row: they are about two people, not one.

## Open for the owner

1. **Steering strength:** a nudge (focus takes about 1.5 times the points) or a hard choice (all points go where you pick)? A nudge keeps the story and the tuning; a hard choice gives control and invites min-maxing. A sim should check that a nudge is felt at all, since most points come from crisis rolls on whatever stat the moment asks for.
2. **One choice or two:** training focus and milestone picks, or only the picks? With 8-12 runners on a phone, two is a lot of admin.
3. **Offered or open:** Joss offers 2-3 at a milestone, or the player sees the whole list they qualify for?
4. **Specialisations and pieces:** do specialisations become entries like moves (one place, one rule), or stay their own kind?
5. **Earned traits' hidden progress:** keep hidden, or show some as goals?

## Build order

1. **The read** (built 2026-11-18): `core/abilities.js abilitiesOf(op)`: what a runner holds from all four systems, and the stat-gated entries for their open places with what each is missing. No screen, no save change. Tested against `eligiblePieces` so the read and the offers agree.
2. **The menu on the runner's page** (UI; after the owner picks the look; phone width first; screenshots).
3. **Training focus** (save change, sims for the pace), only if the owner wants it after question 1.
4. **Milestone picks in the menu**, replacing the separate offer messages (save migration for open offers).
5. **Medical, piloting and leadership abilities** as entries with stat minimums, each from its own proposal.

The agreed order still holds (builds, then the playtest): steps 2-5 wait for the playtest unless the owner moves them. The playtest question: do you ever look at a runner and wish you could steer them?
