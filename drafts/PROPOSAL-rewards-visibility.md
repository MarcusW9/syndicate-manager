# Proposal: rewards after a run you can see

Status: **draft, nothing built (2026-11-24).** The owner asked whether weapons and good rewards after runs still happen ("right now it's not very visible"). They do; this proposal is about making them felt. Questions Q1-Q6 at the end, recommended option first. Numbers marked *draft* need a sim before they ship.

## What happens today, from the code

- **Only a completed main job drops anything** (`core/loot.js lootFor`, called from `mission.js finish()`). An aborted or failed job, a side task, a security post, a won hit-post fight and a held hall raid leave nothing. Expeditions can bring a weapon back, but that is their goal, not loot.
- **The odds** (`data/gear.js TIERS` and `LOOT`), on a completed job:
  - 35% an item. Of those: 57% Standard, 28% Verified, 10% Custom (one perk), 4% Premium (two perks), 1% Apex (one of the eight named pieces in `data/apexGear.js`, each once a save).
  - Otherwise, a quarter of the time a spare Standard sidearm, and the rest ¥50 of scrap.
  - Per completed job: something Custom or better about 1 in 19; an Apex piece about 1 in 285.
- **The same odds on every job.** A threat-1 linen run and a threat-5 heist roll the same table.
- **Where it shows:** one line at the end of the report's results (`ui/messages.js`, `timeline__results`), after injuries, growth, milestones, fame, trust and heist lines, with a small tier tag. An Apex line adds its history and perk; a Custom or Premium line its perks.
- **Nothing after the report.** Today's "Back today" card (`ui/today.js renderBack`) shows the pay stamp only. The item lands in Tong › Armoury › Stash with nothing marking it new and nothing suggesting who should carry it. Hands-off jobs make this worse: the report is one tap away and easy to skip.
- **Nothing before the job.** The board and the job page show pay, threat and the coverage read, never what the job might leave behind.

So the loot is real but quiet. Most of it is shop-grade, it can't be planned for, it gives no reason to take harder work, and the one place it shows is the bottom of a long list.

## The four moments

A reward is felt when it is **expected** (before), **revealed** (the report), **used** (after) and **worth chasing** (over a season). Each part below fixes one moment. Parts A and B change no odds and no balance; C and D do.

### Part A: the reveal (the report)

- **A1 (recommended): a spoils card at the top of the report**, above the summary, for anything Verified or better. The item's picture in its tier frame (`tierFrame`), its name and tier, its key number in a fight (a sidearm's hit, a vest's soak, from the same reads as the gear sheet), its perks as the usual tap-to-open rows (`perkList`), and two buttons: **Give to…** (opens the same takers list as the stash sheet, `takers`) and **To the stash**. When the report plays in, the card lands last, after the result, so it reads as the payoff. Standard drops, the spare sidearm and scrap keep their results line.
- **A2: move the loot line to the top of the results**, with a bigger tier tag. Cheapest; still a line of text.
- **A3: a full-screen reveal** (a crate opening, the tier colour flooding in) for Custom and up, then the report. The most felt, but a modal before the report on every good drop; best kept for Apex only, on top of A1.

### Part B: after the report (Today and the Armoury)

- **B1 (recommended): "New in the stash" on Today, and a new mark in the stash.**
  - Today: a line under "Back today" while any dropped item is unseen ("New in the stash: Verified cannon. Best for Stitch, +3 a hit."), with **Give to Stitch** and **Armoury**. It is a suggestion, not a decision, so it does not count toward Today's badge (`docs/SCREENS.md` layout rule 8: Tong shows no badge, so no new badge there either).
  - Stash: a "NEW" tag on the row until its sheet is opened once.
  - The "best for" pick reads the same numbers the gear sheet shows (a better hit, soak or stat than what the runner carries now), never a separate estimate.
- **B2: the new mark only**, no Today line.
- **B3: auto-equip** on a clear upgrade. Rejected here: it takes a choice away, and gear moves between runners are a real decision.

### Part C: before the job (the board)

- **C1 (recommended): a spoils line on the job page**, from the job's own odds: "Spoils: gear likely · up to Premium" (or "a named piece is out there" while Apex is live at that threat). On the job card only a small tier-coloured mark for jobs that can drop Custom or better. Shown risk equals used risk applies here too: the line reads the same table `lootFor` rolls.
- **C2: named spoils on some jobs**, as content: a job file can carry `spoils: { type, tier, chance }` ("the floor manager keeps a Verified rifle in the office"), shown on the job page and rolled on success. Good for writing; needs `/add-job` and `core/validate.js` to know the field. Best as a later step on top of C1.
- **C3: nothing on the board.**

### Part D: worth chasing (odds and sources)

**D1 (recommended): the tier odds climb with the job's threat.** The chance of a drop stays 35%; what drops gets better on hard work. *Draft* table (Standard takes the rest):

| Threat | Verified | Custom | Premium | Apex | Custom or better, per completed job |
| --- | --- | --- | --- | --- | --- |
| 1 | 20 | 4 | 1 | 0 | about 1 in 57 |
| 2 | 26 | 8 | 3 | 0.5 | about 1 in 25 |
| 3 (about today) | 28 | 10 | 4 | 1 | about 1 in 19 |
| 4 | 30 | 18 | 8 | 3 | about 1 in 10 |
| 5 | 28 | 24 | 14 | 5 | about 1 in 7 |

This makes the thin top of the board (7 jobs at threat 4, 1 at threat 5) the place the good gear comes from, which is a reason to write more jobs there. Data only (`TIERS.drop` becomes a row per threat, or a `LOOT.byThreat` table); no save change. Needs a sim: `scripts/sim-weapon-damage.mjs` for the gear curve and the fame sim for whether crews then race up the threats.

**D2: raise the drop chance everywhere** (say 35% to 50%). More of the same Standard pieces; the stash fills, the feeling doesn't change much.

**More sources (pick any, Q5):**
- **E1: a won fight leaves what the losers carried.** A held hall raid or a won hit post: one roll on a small table (mostly Standard, some Verified), "taken off them". Raids already keep or lose cash (`core/raids.js`); this gives defending a payoff too.
- **E2: a heist finale always leaves something,** Custom or better, with a real Apex chance. Heists are the rarest, most prepared work; their reward should be certain.
- **E3: a clean result counts.** A completed job where nobody was hurt and the alert stayed low gets one extra roll. Rewards playing well, not only playing hard. Needs the report's summary numbers, which exist (`timeline.summary`).

## What it touches

- **Part A:** `ui/messages.js` (the report head and the play-in), `core/loot.js` (the line carries the item's `uid`, so the card can offer Give to). No save change.
- **Part B:** a `seen` flag on stash items, set when its sheet opens (**save v90**, migration: every existing item counts as seen). `ui/today.js` (the line), `ui/gear.js` (the tag, `stashRow`). The "best for" read in `core/gear.js`, beside `takers`.
- **Part C:** a pure read in `core/loot.js` (`spoilsFor(state, job)`: the odds the roll will use), drawn by `ui/jobs.js` and the job page.
- **Part D:** `data/gear.js` and `core/loot.js` (`rollDrop` takes the threat); E1 in `core/raids.js` and `core/contracts.js finishPost`; E2 in `core/heists.js heistResult`; E3 in `mission.js finish()`. Every new roll from its own `hashRng` key, so no seeded test or sim moves except the loot ones.
- **Design rules:** none touched. Loot never forces a choice; nothing about death or exits changes.
- **Docs in the same change:** a design-log row, a changelog entry, CODEMAP's `loot.js` line, `docs/SCREENS.md` (Today and the stash), screenshots with a README row.

## Suggested order

1. **Slice 1: A1 + B1** (and A3 for Apex if wanted). Changes how it feels with no balance change; the playtest can judge the reveal on its own.
2. **Slice 2: D1 + C1**, after a sim. The odds and the board line ship together, so the board never promises odds the roll doesn't use.
3. **Slice 3: the extra sources** the owner picks, and C2 as content for new threat 4-5 jobs.

## Questions for the owner

1. **The reveal:** (a) a spoils card at the top of the report for Verified and up, with Give to *(recommended)*; (b) the loot line moved to the top of the results; (c) (a) plus a full-screen reveal for Apex pieces.
2. **After the report:** (a) a "New in the stash" line on Today with a "best for" suggestion, and a NEW tag in the stash *(recommended)*; (b) the NEW tag only; (c) neither.
3. **Before the job:** (a) a spoils line on the job page and a small mark on the card *(recommended)*; (b) (a) plus named spoils written into some jobs; (c) nothing on the board.
4. **The odds:** (a) better tiers on harder jobs, the table above as a starting point for a sim *(recommended)*; (b) more drops everywhere; (c) leave the odds as they are.
5. **More sources (any):** (a) heist finales always leave Custom or better *(recommended)*; (b) won raids and hit posts leave what the attackers carried *(recommended)*; (c) an extra roll for a clean job; (d) none for now.
6. **Order:** (a) slice 1 now, before the playtest, the rest after *(recommended)*; (b) all three slices before the playtest; (c) wait until after the playtest.
