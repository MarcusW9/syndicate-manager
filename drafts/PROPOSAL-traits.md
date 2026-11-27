# Proposal: traits, "what they've become"

Written 2026-11-27, after the runner-page mockups and a review of the trait code. Nothing here is decided. Questions for the owner are at the end.

The aim, from the owner's direction (design log 2026-11-26): depth should come from who a runner becomes, not from more menus. Traits are where that lives. Skills (moves, payloads, specialisations) already have their own tab and stay there.

---

## 1. What the game has today

**Two kinds of trait.**
- **Born:** 10 (`data/traits.js`), such as Hothead, Loyal, Chromed, Curious. A runner arrives with about two.
- **Earned:** 20 (`data/earnedTraits.js`): 10 lasting (Corner Fighter, Light-Fingered, Synergy and others) and 10 temporary (Short Fuse, Overconfident, Riding High and others). Three of the temporary ones are setbacks (Shaky, Rattled by Sirens, Burned Out).

**How they're earned** (`core/earned.js afterJob`). After each job, hidden counters in `op.track` add up what the runner did (passed combat rolls in a fight, stealth rolls on entry, jobs with the same partner). At a threshold (`NEEDS`, mostly 3 to 5) the trait arrives with a crew note from Joss and a history line.

**Rules already agreed.**
- **Progress is hidden.** A trait arrives as a story, never as a goal (`core/earned.js` header). The owner kept this on 2026-11-18 and rejected "showing earned traits as goals" because it breaks an agreed rule.
- **At most two temporary traits at once;** a new one pushes out the oldest (`MAX_TEMPORARY`).
- **A fade is a line in the day's crew updates,** with the reason (2026-11-23).
- **Short Fuse three times becomes the born trait Hothead** (`becomeHothead`). This is the one place a runner's nature changes, and it's a good model.

**Where they show** (`ui/crew.js`, the Overview tab of the runner's page): born traits as chips, then "Earned on the job" as chips (tap opens the description and "For good · since day 52"), then Synergies as partner portraits.

## 2. What a year of play does to that list

Measured with the test helper `playWeeks` (careful play, 52 weeks, four seeds, 20 runners).

| Per runner after a year | Count |
| --- | --- |
| Born traits | 2.1 |
| Lasting earned traits | 6.5 |
| Temporary earned traits | 0.8 |
| **Total on the Overview** | **about 9 to 10** |

Most common: Synergy (74 across 20 runners, **3.7 each**), Clean Professional (20), Crowd Reader (10), Light-Fingered (9), Client's Favourite (8). Never seen in a careful year: Scarred, Shaky, District Rhythm, Known Face, Second Wind, Rattled by Sirens, Burned Out.

Four problems follow.

1. **The list only grows.** Lasting traits never leave, so a two-year veteran carries 15 or more. That's the space problem the owner raised, and it gets worse the longer a save runs.
2. **Synergy saturates, and it stacks.** In a five-person crew most pairs bond within a year. Each partner on the job adds +1 cool (`ownMods`): a runner with three partners along gets +3. I found no design-log row that chose stacking. Careful play reuses one crew, so real players will see less of this, but it's worth a check.
3. **A trait is a +1, not a memory.** The saved entry keeps the day and sometimes a district, client or partner. It doesn't keep which job it came from, so the opened chip can't say "Back Rent: held the stairwell". The story is only in the history log.
4. **Careful players rarely see the setbacks.** Seven of the twenty never appear. That's fine for the death rule, but it means most players never see a runner marked by what happened to them, which is half of "who they became" (Darkest Dungeon's lesson in `docs/research/`).

## 3. The proposal

### 3a. Traits that deepen instead of piling up (recommended)

When a runner earns a lasting trait they already hold, it **deepens**: rank 1, 2, 3, each a little stronger or a little wider. The list stops growing; a runner who keeps fighting with someone hurt becomes more of a Corner Fighter, not a runner with more chips.

- **Keeps hidden progress.** Nothing shows how close the next rank is. A rank arrives the way a trait does: a crew note from Joss ("Jax doesn't just hold the stairwell now, Jax picks the stairwell.") and a history line. Rank pips appear only after it happens.
- **Numbers to set:** whether rank 2 is +2, or the same +1 in more situations (wider is safer for balance and fits the build vocabulary better). Rank 3 could be a change of nature, like Short Fuse into Hothead: Corner Fighter III becomes a born-style trait the runner keeps even if they retire and return.
- **Content cost is small:** about two lines of text per rank per trait, and one rule in `earn`.

### 3b. Partners as a few strong bonds, not one per crewmate

- **Recommended:** a runner keeps their **two strongest bonds** (by jobs together); a third bond replaces the weakest, with a crew note. Synergy cool bonuses don't stack: +1 if any partner is on the job.
- **Alternative:** keep every bond but rank them (Synergy deepens like 3a), and only the strongest gives the bonus.
- Either needs a short sim run against the pace and death tests; Synergy feeds cool, which feeds crisis rolls.

### 3c. A trait remembers where it came from

When a trait is earned or deepens, the entry keeps the job it came from (`job` id, beside the `day` already kept). The opened badge then says "Back Rent, day 52", and Joss's note can be reused as the trait's story. One short id per trait.

### 3d. Show the most telling first, the rest one tap away

On the Overview, "What they've become" shows up to **six** badges, picked in this order: anything new this week, the deepest ranks, what's "lately" (temporary), then the rest by when earned. The rest sit behind "All 9 ›". Partners keep their own row of faces (as now), capped by 3b.

**The look:** the badge designs the owner liked (`docs/mockups/2026-11-27-ability-badges.html`). B6, the ring, fits best: the ring shows rank for a lasting trait (one, two or three segments lit) and drains for a temporary one. Colour by kind, chosen so it doesn't clash with the skill families on the Skills tab (`ui/skillicons.js`: moves cyan, specialisations gold, payloads by their status colour). For example: earned green, lately orange, born grey, partners shown as faces rather than a colour.

### 3e. Small records of what a trait and a skill have done (optional)

The detailed tracking the owner liked in the skills mockup: "Has helped 4 fights", "Burned 11 enemies, 2 kills". None of it is saved today (see section 4), but it can be counted cheaply:
- **For a trait:** in `afterJob`, count the job's roll events whose `notes` include the trait (they already do: "Corner Fighter +1", "synergy with Static +1"), and how many of those rolls the +1 turned from a fail into a pass.
- **For a skill:** at a fight's end, count from the fight's `defeated` list (it already records who and how, including burn and vector kills) and the statuses applied.
- Both go into `op.record` as a few numbers per held trait or skill.

This is flavour, not rules: nothing reads it for a roll. Worth it only if the opened views (D2 and D4 in `docs/mockups/2026-11-27-skills-detail.html`) are built.

**One correction to my own mockup:** D4 showed "1 of 3 stands toward rank 2". That shows hidden progress and breaks the agreed rule. With 3a, the opened trait shows its rank and its record, never the distance to the next rank.

### 3f. Not proposed

- **A hard cap on lasting traits** (say five, a new one forces a choice to drop one). It controls space, but it makes the player throw away who the runner became, and it's another menu.
- **Showing trait progress as goals.** Already rejected by the owner (2026-11-18).
- **More setbacks for careful players.** That's a separate question about strain (the review's row 9) and the death rule; not part of this.

## 4. Will the tracking bloat the save?

No. Measured with the same year of play:

| Part of a one-year save | Size |
| --- | --- |
| Whole save | about 254 KB |
| The inbox | about 172 KB (the largest part by far) |
| One runner | 8 to 12 KB |
| ... of which the history log (sentences) | 5 to 9 KB, growing every year |
| ... the record (counters) | about 1 KB |
| ... trait counters (`op.track`) | about 0.6 KB |
| ... earned traits | about 0.3 KB |

**What's tracked already:** jobs, fights and fights won, carries, criticals survived, clean streaks, who they worked with, milestones and highlights (`core/record.js`); the hidden trait counters (`op.track`); each earned trait's day and context.

**What isn't:** anything per skill (the code says "Who landed which hit isn't tracked") and how often a trait's bonus applied.

**What 3c and 3e would add:** a job id per trait, and a few numbers per held trait and skill. About 150 to 250 bytes per runner, roughly 2% of a runner and under 0.5% of a save.

**Why it doesn't bloat:** counters stay the same size however long the save runs (Incendiary's kill count is one number at 2 or at 2,000). What grows is anything kept as a list or as sentences: the history log and the inbox. That's where to watch, and it's unrelated to this proposal.

## 5. Corrections to what I said earlier in this session

- **The next-point bars already exist** on the runner's page under each stat (`ui/crew.js`: "The thin bar under each stat fills towards the next point"). I said they weren't shown anywhere; they're missing only from the crew card and the trip report.
- **Skills already have drawn badges** (`ui/skillicons.js`, 2026-11-19, the neon frame the owner picked), coloured by family. I said skills would need icons of their own.

## 6. Build order, if agreed

1. **3c, the trait remembers its job.** Smallest; a save bump with a migration that leaves old traits without a job (the opened badge just says the day).
2. **3d, the Overview shows six, the rest behind a tap,** in the badge look the owner picks. UI only.
3. **3b, partners capped and not stacking.** A rule change: sim it, then add a design-log row.
4. **3a, deepening ranks.** The biggest win for "who they became". Needs the rank text written (`WRITING_GUIDE.md`) and a test that a rank never arrives without its note.
5. **3e, the records,** only if the opened views are built.

Each changes the save shape (`SAVE_VERSION` bump and a migration in `save.js`), except 3d.

## 7. Questions only the owner can answer

1. **Deepening (3a):** do you like traits ranking up instead of piling up? If yes, should a rank be stronger (+2) or wider (the same +1 in more situations)?
2. **Partners (3b):** keep two bonds per runner, or keep all of them but let only the strongest count?
3. **Is Synergy stacking intended?** Three partners on a job give +3 cool today.
4. **How many on the Overview (3d):** six, or another number?
5. **The records (3e):** worth building now, or only once the opened views exist?
