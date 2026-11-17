# Screenshot log

How the game looked over time, newest first. Each folder is one version, named `<date>-<slug>`. Use these to tell the story of how the game developed, or to compare an old screen with the new one.

- **Captured sets** come from `npm run screenshots`. The script plays a fresh game at phone width (390×844, 2x), takes the same screens every time and adds one desktop view. Same file names in every set, so `03-job-board.png` in one folder matches `03-job-board.png` in another. A screen the version didn't have yet (City, Today) is just missing.
- **Owner captures** are screenshots the owner took while playing. They're kept as they were, with names describing what they show.
- **Design-session captures** are screenshots taken in a working session while building or reviewing a change: before-and-after shots, iterations and style tests that never shipped. Kept as captured (often 1x), numbered in the order they were taken, with a README in the folder captioning each one and naming the commit it shipped in.

Missing screens and versions can be filled in later from git history: `npm run screenshots -- <slug> --commit <sha>`.

## Adding a set

After a change that alters how the game looks, before committing:

```
npm run screenshots -- <short-slug>
```

Then add a row to the top of the table below and commit the folder with the change. If the fixer's raid call opens during the run, the script puts it off ("Decide later") and carries on, so it no longer stops the run part-way. Playwright's Chromium is needed once: `npx playwright install chromium`.

## Versions

| Date | Version | Commit | What's new on screen | Folder |
| --- | --- | --- | --- | --- |
| 2026-11-17 | The medic's aura | (this change) | Design-session capture (`scripts/preview-livebattle.mjs --aura`): the green glow round the medic as the aura starts (`01-glow.png`) and the heal landing with a floating "+" (`02-heal-lands.png`), cropped to the map. The glow grows and flashes twice, an orb crosses to the patient, the pip fills; here the medic heals themself, so nothing crosses. | `2026-11-17-medic-aura` |
| 2026-11-17 | The way out of a hack | (this change) | Design-session capture (`scripts/capture-way-out.mjs`): a data_pull round after the work is done (`01-way-out-round.png`): the goal line reads "Fighting out · 3 still standing", the alarm's arrivals are coming in, and everyone including the tech is ordered to attack. | `2026-11-17-way-out` |
| 2026-11-17 | Joss's build advice | (this change) | Design-session capture (`scripts/capture-plan-build-advice.mjs`): the plan screen's fight block with Joss's advice closed (`01-advice-closed.png`) and opened (`02-advice-open.png`). The bar over the middle is the sticky plan bar in an element capture. | `2026-11-17-plan-build-advice` |
| 2026-11-17 | Offer flag on Crew | (this change) | Design-session capture (`scripts/capture-crew-offer-flag.mjs`): the Crew tab count and the Offer tag on a roster row (`01-roster-offer-flag.png`), and the Offers panel at the top of the runner's page (`02-runner-offer-on-top.png`). | `2026-11-17-crew-offer-flag` |
| 2026-11-17 | Roster filter, board gear cells | (this change) | The standard set. New on screen: Crew › Roster has the All / Ready / Away or hurt chips above the list (`18-crew.png`), and the squad board's empty cells under each runner are now tappable (`12-planning-crew-picked.png`, `09-squad-board.png`). The gear sheet they open is not in the set (it needs a staged stash). | `2026-11-17-gear-board-roster-filter-engine2` |
