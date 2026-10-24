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
| Tiers | Every line (backstory, temperament, habit) and every trait has a tier: `common`, `uncommon`, `rare`, `exotic`. Tiers sit on lines and traits, **not on tags** (tags are for steering; a `chrome` line can be common or rare). Added 2026-10-24 so new lines never dilute how often rare ones appear. |
| Tier odds | Two-stage pick: first a tier from fixed odds, **common 60% · uncommon 28% · rare 10% · exotic 2%**, then a line or trait within that tier. If a tier has nothing to offer for this pool, fall back to the next tier down. Odds live in one data table. |
| Generation order | Role and quality → backstory (its tags become the recruit's leanings) → traits (steered) → temperament + habit (steered, no clashes). Each pick is tier first, then steered within the tier. |
| Steering | Weighted, never forced, and only **within** the chosen tier. A trait or line that matches a leaning gets ×3 weight; everything else keeps ×1, so any trait or line can still turn up on anyone. Steering never changes tier odds. |
| Writing mix | Each generated batch of 25: about 15 common, 6 uncommon, 3 rare, 1 exotic. Superstition is part of the Cantonese base layer, so `superstitious` lines are mostly common. No diagnoses ("psycho" etc.); `erratic`-style temperaments are fine. |
| Trait ↔ tag map | Steady Hands, Veteran → calm · Hothead → hot · Loyal → warm · Greedy → cold, money · Silver Tongue → charming · Cautious → wary · Curious → curious · Chromed → chrome · Superstitious → superstitious · Veteran → haunted. Roles: medic, driver → calm · muscle → hot · face → charming · tech → chrome, curious · infiltrator → curious. |
| Not in scope | Handles, names, cultures and badge colours stay unsteered (names tied to personality drifts into stereotype). Personality has no effect on play yet. |

## Steps

### Step 1 · Tag list, tiers and validation — [x]
`src/data/tags.js`: the tag list, clash pairs, trait → tags and role → tags maps, and the tier odds table. A shared `pickTiered(rng, items, leanings)` helper in core (tier first, then ×3 steering within the tier, falling back a tier when empty). Tests: every tag used anywhere in data is on the list; every trait and role in the maps exists; tier odds add up to 100%; over 10,000 picks each tier lands within ±2 points of its odds, and adding 50 common lines does not change the rare/exotic rate. No behaviour change in recruits yet.

### Step 2 · Tagged backstories — [ ]
`ORIGINS` entries become `{ text, tags, tier }`, picked with `pickTiered`. Tag and tier the existing 18 and any new batch. Recruit keeps storing the finished text, so no save change.

### Step 3 · Two-part personality — [ ]
`TEMPERAMENTS` and `HABITS` as `{ text, tags, tier }`; split, tag and tier the existing 12 lines. Pick each with `pickTiered`, steered by the backstory's tags, never a clashing pair. Tests: no clashes over 5,000 recruits; matching lines picked noticeably more often.

### Step 4 · Steered traits — [ ]
Traits get a tier and are picked with `pickTiered` (two different traits). Proposed tiers, confirm with the owner at the start of the step: common Cautious, Curious, Superstitious, Loyal, Greedy, Hothead · uncommon Silver Tongue, Steady Hands · rare Chromed, Veteran. Tests: over 5,000 recruits every trait appears at least at half its unsteered tier rate; a backstory tagged `chrome` gives Chromed clearly more often than an untagged one, without changing how often rare traits appear overall. Check the recruit wage bands still pass.

## Writing prompt (for generating lines in any chat)

```
Setting: a near-future cyberpunk megacity built on Hong Kong. Neon over wet streets, night markets selling grey-market implants next to fishball stalls, corporate towers in Glass Heights, drones over the harbour, cheap chrome and the neural strain that comes with it. The tech is everyday and worn, not shiny. Cantonese street culture is the base layer; the city is multicultural. Every operative is an adult (18+).

Each recruit's personality is built from two halves: a TEMPERAMENT (how they come across) and a HABIT (one concrete detail). Example: "Quiet and watchful." + "Won't take their AR lens out, even to sleep."

Allowed tags (only these, 1-2 per line): calm, hot, warm, cold, charming, wary, curious, chrome, superstitious, money, haunted.
Tiers: common (everyday), uncommon (distinctive), rare (memorable), exotic (one-in-fifty, a real story hook).

Write 25 temperaments (under 8 words, a sentence fragment ending in a full stop) and 25 habits (one sentence, under 15 words, no he/she/they at the start). In each list: about 15 common, 6 uncommon, 3 rare, 1 exotic. About a third of habits involve implants, hacking, drones or corp life (tag those "chrome"). Superstition is ordinary in this city, so superstitious lines are mostly common. Any gender, any age 18-50. No diagnoses, no national stereotypes.

Output only JavaScript:
export const TEMPERAMENTS = [{ text: '...', tags: ['...'], tier: 'common' }, ...];
export const HABITS = [{ text: '...', tags: ['...'], tier: 'common' }, ...];
```

For backstories, use the same setting paragraph and ask for 10 per role (medic, muscle, tech, driver, face, infiltrator), each `{ text, tags, tier }`, one sentence under 20 words, `{district}` in about a third, same tier mix.

## Session prompts (copy into a new session)

- "Read CLAUDE.md and PLAN-PERSONALITY.md. Do step N only. Run npm test, commit as marcusw, push under me."
