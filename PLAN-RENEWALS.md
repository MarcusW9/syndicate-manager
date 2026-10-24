# Plan: contract renewals (and the modular groundwork under them)

Agreed 2026-10-24. One step per session, in order. Each step must stand alone:
read CLAUDE.md, this file, and only the code it names. Tick a step off here
(and add its CHANGELOG entry and DESIGN.md log row) in the same commit that ships it.

## Decisions already made (do not re-open)

| Topic | Decision |
| --- | --- |
| Market price | `base = 150 + totalStats*5 + mainStat*10` (today's wage formula), times `M = 1 + max(0, (main - 12) / 10) ^ 1.5`, rounded to 50. Applies to **recruits on the board and to renewals**. |
| Loyalty discount | **1% per job run with the crew, max 25%**, taken off the market price on a renewal. |
| Renewal trigger | Graduation, or main stat **+2 since their last pay deal**. At most one notice per person every **8 weeks**. |
| Options | Accept (wage = ask) · Haggle once: your best talker vs **difficulty 14**, success = **10% off** · Refuse. |
| Refusal | Operative is **unhappy for 4 weeks: −1 on their rolls** ("head not in it"), then asks again. Leaving the crew stays parked. |
| Not in scope | Partners, poaching, morale consequences, pay cuts for crew, a stat registry. |

Worked example (good rookie): hired at main 11, total 48 → ¥500. Star at main 17, total ~56 → market ¥800; after ~22 jobs with the crew, ask ≈ ¥650.

## Steps

### Step 0 · Season simulation (no game code) — [ ] 
Write a throwaway sim (scratchpad or `tests/` helper) using the formulas above:
- wage over time for a good rookie, a low-ceiling rookie and a pro; how many notices fire per person per season;
- recruit board prices with M applied (by quality) vs today's ¥400–800 band;
- the economy test (`tests/rules.test.js`, careful player, 4 weeks) with M on recruits and renewals accepted.
Output: a short table in this file under "Step 0 results" and proposed new test bands. Stop and report before any build.

### Step 1 · Roll pipeline refactor (no behaviour change) — [ ]
In `src/core/crew.js`: turn roll modifiers (traits, approach, fatigue, injury, veteran cool, backup, short-handed) into a list of rules
`{ id, applies(op, ctx), value(op, ctx), note }` summed by `effectiveStat`/`crewRoll`. Notes come from the rules, so the risk read and real rolls cannot drift.
Done when: **all existing tests pass unchanged**; no UI change.

### Step 2 · Pricing module + market prices on recruits — [ ]
`src/core/pricing.js` with `marketWage(op)`; tunable numbers in `src/data/economy.js`. Recruits use it.
Update the recruit wage test band and economy band **on purpose** using step 0's numbers, and log why in DESIGN.md. One recruit-board screenshot at 390px.

### Step 3 · Statuses + loyalty function — [ ]
- `op.status = [{ id, until }]`, definitions in `src/data/statuses.js` (name, roll modifier). First status: `unhappy` (−1 on rolls) as a rule in the step 1 pipeline.
- `op.jobsWithCrew` (incremented in `finish`), `op.contractMainStat`, `op.lastNoticeDay`.
- `loyalty(op)` in `src/core/loyalty.js` returning 0–1 (today: `min(0.25, jobs * 0.01) / 0.25`); `loyaltyDiscount(op)` = up to 25%. Callers only use these.
- Bump `SAVE_VERSION` + migration (defaults); tests: discount cap, migration.

### Step 4 · Decision messages + renewal notice — [ ]
- Generic blocking decision message `{ kind, options, payload }` and a registry in core mapping `kind` → resolver. Renewal is the first kind.
- Trigger checks after growth in `finish` (rules above). Ask = `round50(marketWage × (1 − loyaltyDiscount))`, never below the current wage.
- UI: notice screen with current wage, ask, market value, loyalty line, Accept / Haggle / Refuse. Screenshots at 390px.
- Tests: ask never below current wage; discount ≤ 25%; cooldown respected; refusal applies unhappy and the −1 shows in both the risk read and the real roll; "no death without push on" still passes.

## Session prompts (copy into a new session)

- "Read CLAUDE.md and PLAN-RENEWALS.md. Do step 0 only. Report the numbers; don't build."
- "Read CLAUDE.md and PLAN-RENEWALS.md. Do step N only. Run npm test, commit as marcusw, push under me."

## Step 0 results

_(to be filled in by step 0)_
