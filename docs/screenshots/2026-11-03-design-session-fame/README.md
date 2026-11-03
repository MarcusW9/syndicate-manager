# Design session: fame and paths (2026-11-03)

`node scripts/capture-fame.mjs 2026-11-03-design-session-fame`: a crew after sixteen careful weeks
(`tests/play.js` `playWeeks`, seed 1, fresh start, hiring above ¥10,000), loaded into the page at phone
width (390×844, 2x). Renown slice 3.

1. `01-crew-list`: the crew list. Elite runners carry the badge before their tier ("ELITE · rookie medic");
   nobody else gets one on the list.
2. `02-elite-runner`: an Elite runner's page. Under the tier line: "ELITE · ROOKIE · AT THEIR PEAK" (fame,
   skill tier, and the standing word, shown for Elite only).
3. `03-elite-path`: the Path card: the path's name and line, the bar towards Legend (Elite is reached, so its
   bar is gone), and their standing.
4. `04-elite-path-info`: the same with the (i) tapped open: the path's numbers, what's still needed for
   Legend, and that fame never changes a roll, pay or heat.
5. `05-path-not-elite`: a respected runner's Path card, with bars towards Elite and Legend.
