# Proposal: medical as the support stat

Status: proposal, nothing built. Follows the stat-usage sim (2026-11-07): medical was rolled on 2.7% of careful jobs, took 0.7% of close-call rolls, and +3 changed week-52 cash by −0.9% ±2.2. Every cut rule was met. The owner's call is to fix it, not cut it. Add a row to the decision log in `DESIGN.md` when agreed.

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
8. **Hall doctor.** Proposed: a role later (Phase 3); the Clinic room heals at half speed without one.
9. **Gore level.** Proposed: specific and physical in reports ("a round through the forearm"), never lingering or graphic for its own sake.
10. **Migration.** Proposed: light injuries become minor bleeding; serious become a bad broken arm. Healing days carry over.

## Wounds

| Wound | Effect until treated | Typical cause |
| --- | --- | --- |
| Bleeding | −1 HP a round in a fight; worsens a step if untreated after the job | Gunshot, blade |
| Broken arm | −2 combat, −1 tech | Fall, close fight |
| Concussion | −2 tech, −2 judgment | Blast, blow to the head |
| Burns | −1 cool; heals at half speed | Fire, electrical, chrome failure |
| Chrome shock | Neural load can't drop below 30 | Implant hit, EMP, overload |

| Severity | Days off untreated | With good treatment |
| --- | --- | --- |
| Minor | 0 to 1 (can work, with the penalty) | 0 |
| Bad | 4 | 2 |
| Critical | 10 | 5; this is today's death's-door state |

- A wound's penalty shows in the roll notes and the planning read, like Shaky does now.
- Career marks: a bad or critical wound can still leave a scar.

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
| Hall doctor | Executive (Phase 3) | Medical 14, leadership 10 | Staffs a hall's Clinic: healing speed from their medical; triage for everyone living there |
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
| Combat medic | 2 dressings a round |

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
- Wounds stored per runner as `[{ kind, severity, days }]`, replacing `condition.injury`.

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
6. Hall doctor and chrome surgeon with Phase 3's roles.

## Open questions

- Should some wounds need a Clinic (or Doc Siu, for a fee) rather than a field medic?
- Do traits matter (Steady Hands better at field dressing; Scarred ignores minor penalties)?
- Should freelance medics be cheaper to hire, so a small tong can cover the gap?
