# Mission logs: what the Container 409 prototype settled

The owner hand-wrote three Container 409 mission logs (2026-10-26) as the go / no-go test
for mission logs (task 2 in `writing-tasks.md`): a well-suited crew on Steady orders
(Egg Tart and Alleycat), a less-suited crew on Steady (Rat and Hotwire), and the suited
crew on Committed. This file keeps what the test settled, checked against the real engine.
It was the brief for the first slice (built 2026-10-26). Keep it until the questions
below have been checked against real play; then delete it.

## The verdict
Build a small simulation-and-report slice. The value is not more rolls; it's making the
existing chain legible: **who acted → why they acted → what they tried → what happened →
what it cost.** Expose that faithfully first; add deeper simulation only where real
generated reports show a gap.

## What a report communicates
What happened · who handled it · why that person acted · which stat mattered · what went
wrong · what it cost · what the player might change next time.

- **Default view:** Joss's one-line intro, outcome and pay, heat and injuries, the turning
  point, a few highlights, and "full log" to expand.
- **Full log:** phases with times, atmosphere, who was picked and why, the choice, the stat,
  the outcome, the consequences, the departure.
- **Rolls:** "Alleycat slipped into the container wall's shadow. Stealth ✓" by default; the
  arithmetic ("die 8 + Stealth 11 = 19 · needs 16") only on tap. Still no percentages before
  a roll.
- **No compulsory headings.** If nothing went wrong, there is no "What hurt us". A standout
  comes from recorded contributions, never a random compliment.
- **Length follows events.** A clean run stays short.
- **Explain automated decisions.** "Neither of them has the hands for it, so they get clear"
  teaches more than a bare ✗.
- **Separate a choice's cost from a failure's.** Getting clear of the stack costs 10% of the
  pay whatever the roll; the report must not let that read as bad luck.
- **Different orders may give the same result.** Don't invent heat or injuries to make
  Committed look riskier; the difference is the downside each choice accepts.

## Corrections from the real engine
The prototype used base stats only. The engine adds traits, a veteran on the crew, the
approach and backup (stealth approach for the suited and less-suited runs):

| Roll | Prototype | Engine |
|---|---|---|
| Alleycat, stealth | 9 | 11 (stealth approach +1, Egg Tart backs up +1) |
| Egg Tart, tech | 11 | 14 (Chromed +2, stealth approach +1) |
| Egg Tart, cool | 8 | 9 (Alleycat, a veteran, steadies them +1) |
| Rat, cool | 8 | 9 (Hotwire backs up +1) |
| Hotwire, stealth / tech | 6 / 5 | 7 / 7 |

- Run A's stack roll isn't a scrape: 6 + 14 = 20 against 17.
- Run B pays **¥1,450**, not ¥1,440: pay rounds to the nearest ¥50.
- The engine applied these bonuses without saying so. Fixed 2026-10-26: the risk read now
  names every bonus ("Egg Tart on tech (14, Chromed +2, stealth approach +1)"), and the log
  will reuse the same notes, so "Chromed helped" is recorded fact, not flavour.

## First slice (agreed 2026-10-26; built the same day, see DESIGN.md)
1. **Record the chain in the shared engine,** so every job report gets it, played or not:
   who acted and why (the choice, and the roller's notes), the roll, success or failure, the
   choice's own cost vs the failure's, and exactly who was hurt (today `{op}` and the injured
   person can differ; reports say "someone" until this is recorded).
2. **Report view:** Joss intro, outcome, highlights, expandable full log, roll detail on tap.
3. **Hands-off run on Container 409,** as a toggle on the same engine: standing orders pick
   each choice and explain the pick; automatic extract at any critical state.

Keep the current mission consequences authoritative. Defer: new skills, invented trait
effects, extra minor checks, new costs or injury chances, Alert and Time tracks, live
playback, several runs at once. The writing tasks 3-6 (templates, district packs, Joss
lines, authored beats) wait until the slice shows where words are missing.

## Questions to check once reports are generated
1. Can the reader name which crew strengths mattered?
2. Can they tell a choice's built-in cost from a failed roll's consequence?
3. Does the automated choice make sense under the orders?
4. Are the acting and the injured operative recorded accurately?
5. Does every summary claim trace back to a recorded event?
6. Does a clean run stay concise?
7. Does a messy run explain its complications without inventing any?
8. Do repeated runs push the player towards better crew picks?

## Still open
- A full standing-orders policy (priorities for injury, heat, pay, client trust, extraction,
  finishing the job). The three runs only illustrate it.
- Which approach a hands-off crew takes (the approach changes the numbers above).
- Whether Committed should ever finish more jobs than Steady: test it, don't assume it.
