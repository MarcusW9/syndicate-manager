# Navigation rework: open items and playtest checklist

Written 2026-11-09, at the end of the navigation rework (branch `claude/lantern-bay-nav-rework-gxrop4`, five steps, UI only). For review after the owner's playtest. The decisions are in `docs/design/2026-11.md` (2026-11-09 row), the sitemap and rules in `docs/SCREENS.md`, the code in `src/ui/nav.js` and `src/ui/app.js`.

## 1. Things to check by playing (the tests use a fake page, so these are the real-browser checks)

Back and scroll (the rule is: Back restores where you were, never rewinds the game):
- [ ] Today → tap the hottest-district chip → a hall → Back → the district → Back → Today. Does the scroll come back each time?
- [ ] Plan a job, change the approach and squad, tap "Armoury →" on the squad board, Back: the plan is as you left it. Do the same after pressing Continue on the Armoury (the day moves on; the plan stays, the page shows today).
- [ ] City › Tongs → a tong → a name in it (read-only profile) → View in Leads → check the buyout line → Back to the profile. Then Sign someone with enough cash: you should land back where you opened them from, not on a "Gone" page.
- [ ] A free name's card on City › Tongs opens straight in Crew › Leads; Back returns to the Tongs list at the same scroll.
- [ ] Choosing a tab by hand starts afresh (Back has nothing old to return to).
- [ ] No Back control on a tab's first screen; a Back line on the Armoury or Leads when a link brought you there.
- [ ] Phone width (360 to 430): sub-tab rows fit and are at least 44px tall; the City map's "Open the district" and "Whole city" buttons are easy to hit; nothing needs hover.

Content moves (the register in `docs/SCREENS.md` is checked off, and `tests/lore-register.test.js` reads every entry; these are for the eye):
- [ ] A district page reads well top to bottom: live state first, then the picture and write-up. Is the long text comfortable on a phone? Try a quiet district and a locked one (the Silt, Iron Peak, Amber Reach).
- [ ] Jobs › Clients: every client is listed, including ones with nothing on the board; a client page shows trust and their open jobs above their line.
- [ ] The Book (City header) shows Who's who and History only.
- [ ] Take the call: from a call-in message on Today, and from the card on City › Map.
- [ ] Founding (a new game's first screen): only Today and ☰ are enabled. The watch screen takes the whole page during a job, as before.

## 2. Open decisions (owner's call)

1. **A client's `affiliation`** is in `src/data/clients.js` for every client but is shown nowhere. Left unshown; no new text was invented. Show it on the client page, or leave it?
2. **Brass Anchor Society** is both a Who's who entry (and Auntie Fung's affiliation) and the fixed elder in the rivals system (the footer line on City › Tongs). Kept as two distinct passages. No generated tong or name collides with any authored name (checked over 60 seeds × 40 weeks).
3. **"At home" on City › Map** (who is in each hall, and heat by district) was not in the brief's Map list. Kept so nothing was lost; it duplicates part of Tong › Halls and the district pages. Drop it?
4. **The heist marker** on City › Map is a labelled button above the map, not a point on the map. A true marker needs a position per heist (the heist's district is known; the marker would use that district's label spot). Worth it?
5. **The Tong header's standing line** reads "One hall, 3 of 8 beds filled. Another hall would make us a Street tong." It uses the existing rank-per-hall rule and no new lore, but it has numbers. Make it words only?
6. **Crew › Leads › Names** lists this month's free name and any name in a tong that we have scouted or sent someone to watch. A name we have not looked at is found through City › Tongs (its profile has View in Leads). Should Leads list every name on the street instead?
7. **Districts "Kinds of work here"** is derived from the job templates (it lists work that is not on the board). Kept in the district's lore section as agreed. Revisit if it reads as clutter.

## 3. Deviations from the brief (all small, all recorded in `docs/SCREENS.md` Moves)

- The brief said "move Wall into Crew": it was already on Crew, so it became its own **Wall** sub-tab.
- **Jobs sub-tabs** were introduced in step 3 (Board · Heists · Side) and Clients in step 4, because "do not route to a sub-tab that has not been introduced yet" needed a Heists sub-tab to move the heist card into.
- Crew's Roster · Leads · Wall sub-tabs came in step 2, not step 3, for the same reason (Halls and the Armoury left Crew).
- **Step 5 changed almost nothing:** Today already showed one Out line (the full crew cards were only on the Map). A test now pins it; the line's label says "City ›".
- The brief's "'Everyone knows' and 'A short history' per district" was a misreading of the code: they are the History sub-tab's two city-wide sections. Confirmed by the owner.
- `docs/screens.md` in the brief is `docs/SCREENS.md` in the repo.

## 4. Known small leftovers (not blocking)

- Old names still say "Ops" inside the code (`ops-district`, `renderOps`, the `opshead` class). Renaming them touches many lines for no visible change.
- `renderFullLog` (the report's full log) threw on a getaway event; fixed and tested during the rework (commit 14cec07), a latent bug from the piloting work.
- The screenshot sets for steps 3 and 4 are from a day-1 game, so they cannot show a free name or the Leads Names group; the tests cover those.
- The unused CSS for the removed Lore cards, Clients strip and Places buttons was deleted at the end.
- Screenshots: before/after 390px sets for each step are in `docs/screenshots/2026-11-09-nav-*` (indexed in its README).

## 5. Order of work from here

The build order written 2026-11-07/08 (*A1 playtest → C0 + C1 → B → A2 → C2/C3 → D*) is mostly overtaken: the decision log shows C0, C1, B, C2 and C3a/b were built on 2026-11-08, before this rework. What is left is **A2 (the owner's writing) and D**. The A1 playtest is the one now under way, on this branch.
