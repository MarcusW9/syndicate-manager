# Proposal: medical as the support stat

Status: proposal, nothing built. Owner's calls so far (2026-11-07): concussion's judgment penalty left out; the migration maps old injuries to wounds that don't worsen (call 10); wounds sit on top of `condition.injury` (way A below). Follows the stat-usage sim (2026-11-07): medical was rolled on 2.7% of careful jobs, took 0.7% of close-call rolls, and +3 changed week-52 cash by −0.9% ±2.2. Every cut rule was met. The owner's call is to fix it, not cut it. Add a row to the decision log in `DESIGN.md` when agreed.

## The idea in one paragraph

Medical only acts today once someone is badly hurt, and careful play rarely gets there. This makes it the stat that keeps the tong working: wounds become specific and cost something until treated, the medic acts in every fight and after every job where someone took damage, and experienced medics grow into hall doctors and chrome surgeons. Grimmer wounds, same promise: nobody dies unless you choose "push on".

## Owner's calls first

1. **Named wounds.** Proposed: replace light/serious with five wounds (below), each with a severity of minor, bad or critical.
2. **How often wounds land.** Proposed: any hit that does 3+ damage, or takes a runner under half HP, leaves a wound. Tune to the sim targets.
3. **Field dressing.** Proposed: the medic dresses one wound a round for free, on top of their order. Medical 8+ needed.
4. **Back up from down.** Proposed: a field dressing on a downed runner (not on "fight on") gets them up on 1 HP, once a fight per runner.
5. **Triage after the job.** Proposed: whenever anyone took damage, the best medic on the job rolls once per wounded runner.
6. **Neural comedown.** Proposed: after any job with tech or drone work, the medic rolls once to take neural load down.
7. **Medic in the van.** Proposed: allowed. Triage and comedown work from the van; field dressing needs them inside.
8. **Hall doctor.** Proposed: a role later (Phase 3); the Clinic room heals at half speed without one. Owner (2026-11-17): the doctor can be a retired veteran medic, hired on through the retirement features, and the Clinic has levels; see "The base heals" below.
9. **Gore level.** Proposed: specific and physical in reports ("a round through the forearm"), never lingering or graphic for its own sake.
10. **Migration.** Owner (2026-11-07): old injuries become wounds that don't worsen (light → a minor broken arm, serious → a bad broken arm, not bleeding, which would worsen after the next job). Healing days carry over.

## Wounds

| Wound | Effect until treated | Typical cause |
| --- | --- | --- |
| Bleeding | −1 HP a round in a fight; worsens a step if untreated after the job | Gunshot, blade |
| Broken arm | −2 combat, −1 tech | Fall, close fight |
| Concussion | −2 tech | Blast, blow to the head |
| Burns | −1 cool; heals at half speed | Fire, electrical, chrome failure |
| Chrome shock | Neural load can't drop below 30 | Implant hit, EMP, overload |

| Severity | Days off untreated | With good treatment |
| --- | --- | --- |
| Minor | 0 to 1 (can work, with the penalty) | 0 |
| Bad | 4 | 2 |
| Critical | 10 | 5; this is today's death's-door state |

- A wound's penalty shows in the roll notes and the planning read, like Shaky does now.
- Career marks: a bad or critical wound can still leave a scar.

## Wounds and `condition.injury` (decided: A)

`condition.injury` (`light | serious | critical`) is read in 39 places across 13 core and UI files, and in 14 test files, including the death rule's tests (critical is death's door; only "push on" kills). Two ways:

| Way | Shape | Cost |
| --- | --- | --- |
| A. A wound on top (**chosen**, owner 2026-11-07) | Keep `condition.injury` as the severity track, unchanged (light = minor, serious = bad, critical = critical), and add `condition.wound = { kind }` for what it is. The kind gives the penalty and the treatment; severity stays where every rule reads it. | Small: the death rule and its tests don't move; one wound at a time. |
| B. Replace it | `condition.wounds = [{ kind, severity, days }]`, as first proposed. | Every reader of `injury` changes, and the death rule's tests are rewritten. Allows several wounds at once. |

**Note for later (B):** if several wounds at once turns out to matter (a runner with a broken arm who also takes a round), A can become B: the migration turns `condition.wound` into a one-item `wounds` list and moves severity onto it, and every reader of `injury` changes then, with the death rule's tests rewritten on purpose and logged.

## Medical on the job

**In a fight**
- Field dressing (call 3): stops bleeding, or makes one wound a step milder, or gets a downed runner up (call 4). Roll: medical + kit vs the fight's difficulty.
- Patch and stabilise stay as orders, with today's numbers.

**After the job**
- Triage (call 5): success makes the wound one step milder; a strong success (beat the need by 5) also halves the days off. Failure changes nothing; never makes it worse.
- Neural comedown (call 6): success takes 10 off neural load, 15 with a pro trauma kit.

**Difficulty**

| Roll | Need |
| --- | --- |
| Field dressing | 10 + the fight's difficulty |
| Triage, minor / bad / critical | 10 + 1 / 3 / 6 |
| Neural comedown | 10 + 2, +1 per 20 neural load over 40 |

## Careers

| Role | Kind | Unlocks | Does |
| --- | --- | --- | --- |
| Combat medic | Specialisation | 3 jobs carrying a trauma kit, medical 10, cool 8 | Field dressing twice a round; stabilise from any cover without moving |
| Hall doctor | Executive (Phase 3) | Medical 14, leadership 10, or a retiring medic who stays on (below) | Staffs a hall's Clinic: healing speed from their medical; triage for everyone living there |
| Chrome surgeon | Executive (Phase 3) | Medical 14, tech 12, a cyber doc in the tong | Implants a further 10% cheaper; implants' neural floor halved |

Older medics move into these, as older runners move into coaching.

## Balance: proposed defaults

| Setting | Default |
| --- | --- |
| Wound on a hit | 3+ damage, or under half HP |
| Wound type | weighted by cause: guns mostly bleeding, fights mostly broken arms, tech crises chrome shock |
| Field dressing | 1 a round, medical 8+ |
| Triage | 1 roll per wounded runner, best medic on the job |
| Comedown | −10 neural, −15 with a pro kit |
| Clinic without a doctor | half speed |
| Clinic levels, doctor, base treatment | draft numbers in "The base heals" below |
| Combat medic | 2 dressings a round |

## The base heals: the Clinic and the hall doctor (owner, 2026-11-17)

Status: direction from the owner, numbers are Claude's drafts, nothing built. Parked behind builds and the playtest (HANDOFF.md).

**The idea.** The medic's value should grow with the base, not stop at the fight. Two parts: a Clinic in the hall that can be built and improved to shorten healing, and a veteran medic who can be hired on as the hall's doctor through the retirement features, who also shortens healing.

**What already exists to hang it on**
- `drafts/PROPOSAL-hall-building.md` drafts a Clinic room (¥18,000, hall level 2; residents heal 2 days a day while at home). One per hall.
- This proposal's Hall doctor role (above): a Clinic without a doctor heals at half speed.
- Retirement is built (`core/retirement.js`, `data/retirement.js`): a runner past 52 active weeks may ask to stay one more season for a rise or go; `RETIREMENT_RESOLVER` handles it, and a worthy runner goes in the Hall of Legends.
- The medic's hands on the way out of a hack (built 2026-11-17, `core/fight.js treatWayOut`): the field treatment that saves the serious injury. The base picks up what is left.

**1. The Clinic, with levels (draft)**

| Level | Cost | Heals at home | Needs |
| --- | --- | --- | --- |
| 1 | ¥18,000 | 2 days a day (the hall-building draft), half that without a doctor | hall level 2 |
| 2 | ¥14,000 | 3 days a day | level 1 Clinic |
| 3 | ¥20,000 | 4 days a day, and a runner home from a job with a serious injury starts it a day shorter | level 2 Clinic, a doctor |

Only residents at home heal at the Clinic's speed, not runners out on a job. Without a doctor each level heals at half speed. A hall has one Clinic.

**2. The retired veteran as the hall's doctor (draft)**
- **Route A, your own medic.** When a medic (or anyone with medical 12 or more) asks to retire, the request gets a third answer beside Stay and Go: **Stay on as the hall's doctor.** They leave the roster for the job board (no more jobs), keep a smaller wage than a runner's, and staff the Clinic of the hall they live in. They stay in the cast, so their history and their name remain.
- **Route B, a veteran from outside.** A retired medic from the city (a lead, or one of the "gone elsewhere" names, `docs/RIVAL-TONGS.md`) can be hired for the post for a signing fee. Owner to pick A, B or both.
- **What the doctor does:** Clinic speed scales with their medical (draft: +1 day a day at medical 12, +2 at 16); triage for everyone living in that hall, one roll per wounded runner after each job (the triage this proposal already has); and base treatment (below). One doctor a hall; a second hall needs a second doctor.
- **Loses them:** if the doctor dies or is poached (`core/mobility.js`), the Clinic drops to half speed until a replacement. This ties the role to the world rather than a flat upgrade.

**3. Base treatment, the part that answers the way out (draft).** When a crew comes home, a hall doctor treats each runner who left a job with a serious injury: the injury days drop by their medical divided by 2 (a medical-12 doctor takes 6 days off a 21-day injury). It stacks with the medic's hands in the fight (the medic saves the serious injury; the doctor shortens what remains) and with the Clinic's speed.

**Rules we keep**
- No effect on the death rule: nobody dies because of a Clinic or a doctor, and nothing here makes a death more or less likely.
- Shown equals used: the hall page and the plan screen's recovery read show the Clinic's level, the doctor and the days they take off, from the same function the day tick uses (`core/time.js`).
- Randomness only through `core/rng.js`; the triage rolls hash their seed, so no other roll moves.
- It is optional: a tong with no Clinic and no doctor plays as today.

**How to size it.** `scripts/sim-wayout.mjs` already reports recovery days a fight for hack jobs (17.4 on data_pull with the way out and the medic's hands, against 8.3 before it). The target is to bring a hall with a level-2 Clinic and a doctor back to the pre-way-out cost, and to leave the unbuilt tong where it is, so the Clinic is a reason to build, not a tax on not building. The sim needs the day tick's healing added to the measure (it now counts days only at the fight's end).

**Open questions for the owner**
- Route A, B or both for the doctor?
- Should the doctor also act in the fight (on the job) if they are sent out, or never, so the post is a real trade-off against a runner's job?
- Clinic cost and levels: are three levels enough, or should the top level need something else (a surgeon, a Cyber doc in the tong)?
- Does a retiring medic who becomes the doctor still reach the Hall of Legends when they finally leave, with a line about the Clinic?

## Rules we keep

- **Nobody dies unless you choose "push on".** Bleeding can drop someone to down, never past it.
- **Shown risk equals used risk.** Wound penalties and the medic's chances show in the planning read ("Doc on the job: bleeding stopped 70%").
- **Joss's picks** add a medic when it lowers the risk or when the crew standard is pro or above.

## Sim targets

| Check | Target |
| --- | --- |
| Jobs where medical is rolled | 25%+ |
| Share of close-call rolls | over 5% |
| +3 medical, week-52 cash (300 seeds) | +2% or better, outside the noise |
| Medic specialist utilisation | 50%+ |
| Runner-days lost to wounds, careful play | up no more than 25% on today |
| Median week-26 cash | down no more than 5% |
| Deaths | none outside "push on" |

## Saves

- Next save version, with a migration (call 10).
- Wounds: as decided under "Wounds and `condition.injury`" (`condition.wound = { kind }` beside the existing `condition.injury`).

## Where it would live

- `data/wounds.js`: kinds, causes, penalties, days.
- `core/wounds.js`: `woundFrom(hit)`, `treat`, `triage`, `tickWounds` (the day tick), penalties for `effectiveStat`.
- `core/battle.js`: field dressing in `playRound`; bleeding at the end of the round.
- `core/mission.js finish`: triage and comedown.
- `core/squad.js coverage`: wound penalties and the medic's chances.
- `core/specialisations.js`: combat medic.
- `core/halls.js`, `core/time.js`: Clinic with or without a doctor.
- `ui`: wound chips on the runner page and fight panel; report lines.

## Build order

1. Named wounds and the migration (no new medical rolls yet). Check injury days and cash.
2. Triage and neural comedown after the job.
3. Field dressing and back up from down in fights.
4. Combat medic specialisation.
5. Rerun `sim-stats.mjs` medical rows at 300 seeds; tune wound frequency.
6. Hall doctor and chrome surgeon with Phase 3's roles; the Clinic's levels, the doctor from retirement and base treatment ("The base heals"), sized with `sim-wayout.mjs`.

## Open questions

- Should some wounds need a Clinic (or Doc Siu, for a fee) rather than a field medic? (The Clinic's levels and the hall doctor are drafted in "The base heals".)
- Do traits matter (Steady Hands better at field dressing; Scarred ignores minor penalties)?
- Should freelance medics be cheaper to hire, so a small tong can cover the gap?
