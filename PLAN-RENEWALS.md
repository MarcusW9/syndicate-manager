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

Worked example (good rookie, 7 in every other stat; matches the step 0 sim): hired at main 11, total 53 → ¥550. Star at main 17, total 59 → market ¥850 (base 615 × M 1.35); after 25 jobs with the crew (25% off), ask ≈ ¥650.

## Steps

### Step 0 · Season simulation (no game code) — [x] 2026-10-24
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

Run 2026-10-24 with a throwaway sim (not committed). Subjects joined at market price, worked one season (364 days) with Teo mentoring, careful policy, 20 seeds; renewals always accepted.

**Wage over one season**

| Subject | Start | End (median, range) | Main at end | Jobs | Notices per season |
| --- | --- | --- | --- | --- | --- |
| Good rookie 11→17 | ¥550 | ¥650 (650–700) | 17 | ~71 | 2 (15 seeds), 3 (5 seeds) |
| Low-ceiling rookie 11→13 | ¥550 | ¥550 (550–600) | 13 | ~70 | 1 |
| Pro 14→16, age 28 | ¥600 | ¥650 (600–650) | 16 | ~71 | 1 |

Sample good rookie: day 8 main 13 → ¥600 (market 600, 4 jobs); day 65 main 15 / graduated → ¥600 (market 700, 12 jobs); day 121 main 17 → ¥650 (market 850, 25 jobs). All growth lands in the first ~4 months; the second half of the season has no notices. Loyalty reaches its 25% cap at ~25 jobs, i.e. inside the season, so it nearly cancels M for anyone who stays.

**Recruit board (6000 recruits)**

| Quality | Today min / med / max | With M min / p5 / med / p95 / max |
| --- | --- | --- |
| Rookie | 450 / 500 / 600 | 450 / 450 / 500 / 550 / 600 (unchanged) |
| Pro | 550 / 600 / 700 | 550 / 600 / 700 / 800 / 850 |
| Veteran | 600 / 700 / 750 | 700 / 750 / 900 / 1050 / 1100 |

**Economy test (200 seeds, careful, 4 weeks)**: median ¥10,200, p10 ¥2,800, broke 3%, deaths 0 — identical with renewals on. Zero notices fire in the first month (the starting crew don't gain +2 in 4 weeks and `playWeeks` never hires). Starting crew are already under market (Stitch 600/750, Jax 550/650, Static 650/750, Wheels 600/900, Velvet 650/800).

**Proposed test bands for step 2**
- Recruit wage test: replace 400–800 with **450–1100** overall (or per quality: rookie 450–600, pro 550–850, veteran 700–1100).
- Economy test: **keep** median 0–30,000, broke < 35%, deaths < 0.1 — nothing moves in 4 weeks. Add a separate long-run check (e.g. one season) if renewals should bite.

**Flags for you before building**
- Renewals barely cost anything: a star costs ~¥100–150/week more after a season, because the 25% loyalty cap is reached by ~25 jobs. If renewals should hurt, slow loyalty (e.g. 0.5%/job) or cap lower.
- Starting crew sit ¥100–300 under market; if they ever trigger a notice they jump. Decide whether they start with `contractMainStat` = current main (sim assumed yes).
- Plan's worked example said rookie ¥500 at total 48; a 7-across rookie (total 53) is ¥550 — consistent with the formula. Worked example updated to the sim's numbers.
- Low renewal cost and starting crew under market: parked for now (2026-10-24); more effects will come via the modular pipeline.

