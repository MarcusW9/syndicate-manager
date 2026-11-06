# Plan: crew relationships (the rest, after Synergy)

Agreed 2026-11-06. Builds the relationships designed on 2026-10-26 (`docs/design/2026-10-26-to-27.md`,
"Crew relationships: named bonds and rifts over a hidden pair score"). Synergy (`crew_anchor`) is
the first bond and is already built; this plan adds the rest and replaces `PLAN-PROGRESSION.md` step 3.

One step per session, in order. Each step must stand alone: read CLAUDE.md, `CODEMAP.md`, this file,
and only the code it names. Tick a step off here (and add its CHANGELOG entry and DESIGN.md log row)
in the same commit that ships it.

## Decisions already made (do not re-open)

| Topic | Decision |
| --- | --- |
| Shape | Bonds with one clear cause are **single events**, like Synergy. Slow ones grow from a **hidden pair score** that is never shown. No visible pair meter. |
| The set | **Synergy** (built) · **Owes {partner} one** · **Blames {partner}** · **Old hands** · **Rubs {partner} the wrong way** · **Lost {partner}** (grief). |
| Owes one | They were stabilised or pulled out at a critical by {partner}: +1 cool on jobs with them. Lasting. |
| Blames | Hurt straight after {partner}'s failed roll: −1 on jobs with them, mended by one clean job together. |
| Old hands | Many jobs together without a failure between them (pair score): their backup counts for more. |
| Rubs the wrong way | Clashing personalities (`data/tags.js` `CLASHES`), only after a few jobs together (pair score). Rifts can be mended. |
| Grief by personality | When a bonded partner dies, the survivor gets **Lost {partner}**, also on the memorial. haunted: for good · warm: a season · calm: a few weeks · cold: a history line only · hot: **Vengeful** (+1 combat, −1 cool) for a season (lengths to confirm, see Open questions). Small seeded variation in how long. |
| Rules (as for traits) | Never a refusal; every effect shows in the roll breakdown; progress hidden; **at most two relationships per person**. |
| Pay | A bonded partner leaving or dying makes the survivor ask for more at their next renewal. |
| Where it lives | Relationships are entries in `op.earned` with a `partner`, like Synergy, so chips, inbox messages, history lines and `earnedText` all work as they do now. Content in `data/earnedTraits.js`; rules in `core/earned.js` (or a new `core/bonds.js` if `earned.js` grows too long; say so in CODEMAP). |
| Templates | Lines use `{partner}` (and `{op}`), never hand-written pairs. Drafts by Claude are marked for the owner to rewrite, like the milestone lines. |
| Not in scope | Romance, family ties, relationships with freelancers or leads, relationships changing pay outside renewals, a visible pair meter, refusing to work together. |

## Open questions (ask the owner at the start of the step that needs them)

- **Step 1:** does Synergy count towards the cap of two? (Leaning: yes, every partner relationship counts. Today someone can hold several Synergies.) And if a third arrives: does the oldest positive one make room, or does the new one simply not form?
- **Step 2:** Blames: "−1 on jobs with them" on every roll, or cool only (like Synergy's +1)? (Leaning: cool only, so it reads as the mirror of Synergy.)
- **Step 3:** the grief lengths. The 2026-10-26 design says warm and hot last "a season", but a season in the game is 364 days (`DAYS_PER_SEASON`, `core/time.js`), so that would be a year. Proposed instead: warm 28 ± 4 days, hot Vengeful 28 ± 4, calm 10 ± 3. A runner with none of those tags: proposed calm.
- **Step 4:** pair score numbers (proposed below) and what "their backup counts for more" means in play (proposed below).

## Steps

### Step 1 · Personality tags on the runner, the cap, and Owes one — [ ]
- **`op.tags`:** the leanings a runner was made with (their backstory, temperament and habit tags plus their traits' `TRAIT_TAGS`), stored at generation in `core/recruits.js`. **Save bump** + migration that rebuilds them for existing runners by looking up their stored backstory and personality text in `data/recruitPools.js` (no match: traits only). Starting crew get theirs in `data/operatives.js`. Steps 3 and 4 read `op.tags`; nothing else changes with it.
- **Cap:** a `relationship: true` flag on partner traits in `data/earnedTraits.js` (Synergy included, per the owner's answer) and the cap rule in `earn()`.
- **Owes {partner} one:** earned by the patient when a crewmate's stabilise roll or rescue saves them at a critical (`core/mission.js`: the `save` events, `stabiliser`, and the standby `rescued` decision). +1 cool on jobs with the partner, in `ownMods`. Lasting.
- Tests: `op.tags` never holds a clashing pair for a generated recruit; old saves upgrade with tags; nobody holds more than two relationships over a long `playWeeks` run; Owes one appears in the roll breakdown only when the partner is on the job.

### Step 2 · Blames, and mending — [ ]
- **Blames {partner}:** in `afterJob`, from the run's events: someone hurt in the same crisis straight after a crewmate's failed roll. −1 (per the owner's answer) on jobs with them. Freelancers are never blamed.
- **Mending:** one completed job together where neither is hurt and neither fails a roll removes it (`fade`, reason "a clean job together"). A blame never turns into a refusal.
- **Cap:** Blames counts towards the two and never pushes out Synergy or Owes one; if the cap is full of positive bonds, the blame doesn't form (history line only: "Hasn't forgiven {partner} yet." is enough).
- Tests: a blame can always be mended (no state where it can't); it shows in the roll breakdown; abort and extract still save everyone (existing promise tests stay green).

### Step 3 · Grief, the memorial and the renewal ask — [ ]
- **Lost {partner}:** when someone dies (`core/mission.js` and `core/raids.js`, where they're pushed to `state.memorial`), each survivor holding a bond with them (Synergy, Owes one, later Old hands) gets the grief their `op.tags` decide: haunted lasting; warm and calm temporary, faded in `dailyTraits` after their seeded length; cold a history line only; hot **Vengeful** (+1 combat, −1 cool) for their seeded length. Several tags: haunted wins, then hot, then warm, then calm, then cold.
- The dead partner's bond entries go; their handle still fills `{partner}` (look in `state.memorial`, as `milestones.js` already does).
- **Memorial:** the dead runner's entry lists who mourns them (`mournedBy: [handle]`).
- **Renewal:** a survivor whose bonded partner died or left gets a one-off bump on their next `renewalAsk` (proposed +10% of the raise; confirm), shown in the notice ("still not over losing {partner}").
- Save bump if the memorial entry or the renewal state gets a new field.
- Tests: grief only follows a death, and death only follows "push on" (the existing promise); a cold runner gets no modifier; every temporary grief fades; the renewal bump applies once.

### Step 4 · The hidden pair score: Old hands and Rubs the wrong way — [ ]
- **Pair score:** reuse `op.trust` (starting crew already have `STARTING_TRUST`; generated runners start empty). Proposed, per completed job together: +1; nobody failing a roll: +1 more; one of them hurt after the other's failed roll: −2. Never shown.
- **Old hands:** pair score 12+ and 8+ jobs together. "Their backup counts for more": proposed, +1 when one of them rolls to help or save the other (`save` events, `stabiliser`). Lasting while the score stays 6+.
- **Rubs {partner} the wrong way:** after 4+ jobs together, if their `op.tags` clash (`CLASHES`) and the pair score is below 4. −1 cool on jobs with them. Mended when the score climbs to 8 (hard-won respect: a history line on both).
- Tests: rubs needs a real clash; any rub can be mended by working together; over a long run, Old hands forms for steady pairs; nothing here touches tier odds or recruits.

### Step 5 · Showing it: the runner page, the board and the pairs — [ ]
- Runner page: relationships get their own row of portraits like Synergy's (tap for the line, the effect and the partner). Losses show here and on the memorial.
- Squad board: picking two runners with a relationship shows it in the coverage read ("Static owes Ghost one: +1 cool"). No hover-only text.
- Read "UI skin" in `ART.md` and the newest screenshot set first; run `npm run screenshots -- relationships` and add the README row.
- Tests: the board's read uses the same modifiers as the roll (shown risk equals used risk).
