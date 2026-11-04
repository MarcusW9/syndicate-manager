# Design session: named offers and the fame pay ask (2026-11-04)

`node scripts/capture-named.mjs 2026-11-04-design-session-named-offers`: a crew after forty careful
weeks (`tests/play.js` `playWeeks`, seed 1, fresh start, hiring above ¥10,000) with an Elite, at phone
width (390×844, 2x). Renown slice 4. The board that day had no named offer, so the script adds a
courier job and marks it as one (as `core/jobs.js` `nameAnOffer` would), and posts a fame pay ask
(`core/fame.js` `fameRaise`'s message), so both show.

1. `01-fame-pay-ask`: the fame pay ask. It's the usual pay-rise message (accept, haggle, refuse) with
   its own subject and line: "They became Elite: the street knows the name."
2. `02-job-board-named`: the job board. A named offer's first flag is "ASKS FOR TOFU".
3. `03-planning-named`: the planning screen's client card: "Asks for Tofu by name: +15% if Tofu goes
   (inside, outside or on standby). Without them it pays as usual."
