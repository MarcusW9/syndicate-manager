# Plan: tagged backstories, personalities and steered traits

Agreed 2026-10-24. One step per session, in order. Each step must stand alone:
read CLAUDE.md, this file, and only the code it names. Tick a step off here
(and add its CHANGELOG entry and DESIGN.md log row) in the same commit that ships it.

## Decisions already made (do not re-open)

| Topic | Decision |
| --- | --- |
| Tags | One shared list for backstories, temperaments and habits: `calm, hot, warm, cold, charming, wary, curious, chrome, superstitious, money, haunted`. Keep it to roughly 10–20 broad tags; adding one is a data edit, renaming or splitting one means re-tagging. |
| Clashes | `calm`/`hot`, `warm`/`cold`, `charming`/`wary` never appear together in one recruit's text. |
| Personality | Two halves: a temperament (under 8 words) + a habit (one sentence). Each line carries 1–2 tags. Replaces the single `PERSONALITIES` line. |
| Generation order | Role and quality → backstory (its tags become the recruit's leanings) → traits (steered) → temperament + habit (steered, no clashes). |
| Steering | Weighted, never forced. A trait or line that matches a leaning gets ×3 weight; everything else keeps ×1, so any trait or line can still turn up on anyone. |
| Trait ↔ tag map | Steady Hands, Veteran → calm · Hothead → hot · Loyal → warm · Greedy → cold, money · Silver Tongue → charming · Cautious → wary · Curious → curious · Chromed → chrome · Superstitious → superstitious · Veteran → haunted. Roles: medic, driver → calm · muscle → hot · face → charming · tech → chrome, curious · infiltrator → curious. |
| Not in scope | Handles, names, cultures and badge colours stay unsteered (names tied to personality drifts into stereotype). Personality has no effect on play yet. |

## Steps

### Step 1 · Tag list and validation — [ ]
`src/data/tags.js`: the tag list, clash pairs, trait → tags and role → tags maps. A test that every tag used anywhere in data is on the list and every trait and role in the maps exists. No behaviour change.

### Step 2 · Tagged backstories — [ ]
`ORIGINS` entries become `{ text, tags }`. Tag the existing 18 and any new batch. Recruit keeps storing the finished text, so no save change.

### Step 3 · Two-part personality — [ ]
`TEMPERAMENTS` and `HABITS` as `{ text, tags }`; split and tag the existing 12 lines. Pick a temperament and a habit weighted by the backstory's tags, never a clashing pair. Tests: no clashes over 5,000 recruits; matching lines picked noticeably more often.

### Step 4 · Steered traits — [ ]
Trait picks weighted by the leanings (×3 on a match). Tests: over 5,000 recruits every trait still appears on at least 4% of recruits (unsteered is 20% each for 2 of 10), and a backstory tagged `chrome` gives Chromed clearly more often than an untagged one. Check the recruit wage bands still pass.

## Session prompts (copy into a new session)

- "Read CLAUDE.md and PLAN-PERSONALITY.md. Do step N only. Run npm test, commit as marcusw, push under me."
