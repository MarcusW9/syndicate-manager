# Proposal: work that scales with the crew (2026-11-21)

Owner's playtest note: a bigger squad makes jobs easier, but the money on offer does not scale with it.

## What the sim found (`docs/sims/crew-income-2026-11-21.md`)

Weeks 13-26, medians, a careful player running every job the free crew can staff:

| Crew | Jobs/wk | Gross | Bill | Net | Idle crew/day |
| --- | --- | --- | --- | --- | --- |
| 3 | 3 | 3,450 | 2,250 | +1,200 | 1.1 |
| 5 | 3 | 3,600 | 3,650 | -50 | 2.7 |
| 7 | 3 | 3,450 | 5,150 | -1,700 | 4.9 |
| 10 | 5 | 7,480 | 7,350 | +130 | 6.0 |
| 14 | 6 | 9,360 | 10,150 | -790 | 9.0 |

## Correction to the first idea: parallel squads mostly exist already

I first said the engine runs one job at a time. That is true only of a job you watch live (`state.activeMission`). A crew sent hands-off goes to `state.awayJobs` (`core/autorun.js sendOff`, `core/away.js`), and several can be out at once; the sim ran concurrent jobs the same way. What limits income is **supply**, not squads:

- `jobs.js arrivalsPerWeek`: 3 offers a week up to 5 runners, then +1 per 2.5 runners (`ARRIVALS = { over: 5, per: 2.5, room: 2, routine: 0.75 }`). That is the 3 / 3 / 5 / 6 jobs a week above.
- 75% of the extra offers are **routine** work, which pays about ¥2,040 base against ¥4,342 for the rest (template averages). So extra offers also pay less.
- Reputation gates (`JOB_GATES`: threat 3 at 35, 4 at 60, 5 at 80) hold the best pay back; the sim's crews sit at 18-40 reputation at week 26.
- Each runner costs about ¥735 a week and one job pays about ¥1,150-1,500 realised, so break-even is roughly 0.55 jobs a week per runner (4 a week at 7 crew, 8 at 14). The board gives 3 and 6.

Not checked: whether the live UI makes it easy to send two crews out in a day (it should: Today has crew-out cards).

## Options

1. **Steeper arrivals (cheapest).** `ARRIVALS.over` 5 -> 3 and `per` 2.5 -> 1.5, so about one extra offer a week per 1.5 runners. Tunable in one object; `scripts/sim-tong.mjs` already compares `ARRIVALS` settings.
2. **Fewer routine extras.** `ARRIVALS.routine` 0.75 -> about 0.4, so extra offers pay like normal ones and a bigger tong earns more per offer.
3. **Standing contracts (the real fix for the feeling).** A client or hall offers a retainer: a weekly sum for a squad kept on it (for example "Keep the Night Market stalls safe: ¥900 a week while two runners are assigned"). Fills idle crew, gives parallel squads a reason to exist, and rent/wages gain a visible offset. Needs a state field and a save version, so it comes after 1-2.
4. **Reputation faster with more jobs**, so a bigger crew reaches the higher-pay gates sooner (`REP_PER_THREAT`). Check with the sim before touching it.

## Plan

1. Extend `sim-crew-income.mjs` to take `ARRIVALS` overrides and print net per week for each setting.
2. Pick the setting where a 5-10 person crew nets +20-40% over its bill and a 3-person crew is unchanged (the early game must stay tight: `tests/rules.test.js` economy test).
3. Ship 1 and 2 (numbers only, no save change), then design 3 as its own step.

Owner's call: 3 as a next feature, and the net-margin target in step 2.

## Outcome (2026-11-21)

Owner: run the sim and pick. Built: `ARRIVALS` over 5 -> 4, per 2.5 -> 2, routine unchanged (it barely moved the numbers). over 3, per 2 would also fix the five-person band but gives the fame sim's five-person crew more jobs (three Elites by week 52, target one or two) and a 2% bigger save: the owner's call. Tables in `docs/sims/crew-income-2026-11-21.md`. Standing contracts (option 3) are still open.
