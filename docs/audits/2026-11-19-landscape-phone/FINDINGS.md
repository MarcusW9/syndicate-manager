# Landscape phone audit: findings

Read with `README.md` (the table) in this folder. Made 2026-11-19 from `node scripts/audit-landscape.mjs`; rerun it to refresh the table, then update this page.

## What the numbers say

1. **The game has two layouts and the break between them is at 900px wide, which sits in the middle of the phones.** Below 900px a phone on its side gets the portrait layout stretched wide: the top bar, the Continue bar and the tab bar. At 900px and above it gets the desktop layout: a left rail, Continue in the top bar, and nearly the whole height for the screen.
   - Gets the desktop layout (about 84% of the height free): 926 and 932 wide (Plus and Pro Max models).
   - Gets the stretched portrait layout: 667 (SE), 844 (iPhone 14 and 15), 852 (15 Pro), 874 (16 Pro) and 896 (11 and XR).
2. **On the stretched layout only about half the height is left for the screen.** At 844x390 the top bar takes 78px and the Continue bar plus tab bar take 117px, so 195px of 390 remain (50%). At 667x375 it is 180px (48%). On the squad board the plan bar adds more: 177px (45%) at 844, 131px (35%) at 667. The runner page shows about 100px of content above the Continue bar, as the shot `844x390-13-crew-runner-page.png` shows.
3. **Nothing breaks sideways.** No screen scrolls horizontally at any of the three sizes, so the width is not the problem. It is the height.
4. **Small tap targets** (under 44px) are few: City (9), the squad board (4), a message (3), and one each on Jobs, Side and Clients. They are the same in portrait.
5. **Long pages.** The runner page is 7 screens long at 844x390 (about 3 in portrait), City > Tongs is 6. With half the height, long pages mean a lot of scrolling in a window about 195px tall.

## What would fix most of it

- **One shared fix, not per-screen work:** on a phone that is short and wide (height under about 500px, width under 900px), use the desktop layout's chrome: the left rail for the tabs and Continue in the top bar. That alone takes the free height from about 50% to about 84% at 844, on every screen, and costs about 200px of width, which landscape has to spare.
- Then lower the breakpoint's job from "width at or above 900px" to "wide enough, whatever the height", and check the three screens that lean on vertical room: the squad board's plan bar, the fight screen (not reachable by this script) and the runner page.
- **Not covered by the audit:** the fight screens (a fight cannot be reached by a plain click-through), anything behind a first-time prompt, and the keyboard.

## After the fix (same day)
A phone on its side (640px and wider, 520px tall or less) now gets the desktop chrome, with the left rail narrowed to 64px and drawn as icons over small labels (owner: "icons like Football Manager Mobile"). The table is in `../2026-11-19-landscape-phone-after/`. At 844x390 the free height on most screens went from 195px (50%) to 321px (82%); the squad board from 177px (45%) to 231px (59%); at 667x375 from 180px to 306px. No screen scrolls sideways. Still open: the squad board's plan bar (95px), the founding screen's bar, and the fight screens (not reached by this script).

## The plan bar (same day)
On a phone on its side the plan bar is now one slim row: the risk word and the weakest reason on one line, buttons at the 44px minimum, 6px off the bottom. It was 95px; it is now 64px, so the squad board has 262px free at 844x390 (67%, up from 231px) and 195px at 667x375 (up from 185px). Opening "+1 more" grows it only while it is open. Table: `../2026-11-19-landscape-phone-after-planbar/`. Still open: the founding screen's bar (82px), and the fight screens.

## The live fight (same day)
`node scripts/audit-fight-landscape.mjs` stages a real fight (as `preview-livebattle.mjs` does) and measures it. Before (`../2026-11-19-landscape-fights-before/`): at 844x390 the fight was one column 4 screens long, the map on top and the orders, the enemies and the Next Round button below the fold ("action on screen: no" at every size). After (`../2026-11-19-landscape-fights-after/`): the map sits on the left, filling the height (409x221), the orders or feed scroll on the right, and the order sheet's action bar (Next Round, Change Orders, Auto Fight, Pull Back) is pinned at the bottom of that column; the page is 1.1 to 1.3 screens long and the action is on screen at every size. In the after table "Free" reads lower (64%) only because the pinned action bar counts as a fixed bar; the map's share of the screen is about the same (57%). Not covered: command fights (`ui/fightorders.js`), the duel face-off, and the finale.

## Command fights (same day)
The older engine's fights (`ui/fightorders.js`: pick a runner, give an order, Go), staged with `node scripts/audit-fight-landscape.mjs <dir> --engine 1 --job herbal_run`. Before (`../2026-11-19-landscape-command-fights-before/`): 2.2 to 2.9 screens long at 844x390, the Go bar never on screen, and the runner picker could not even be clicked (covered or off screen). After (`../2026-11-19-landscape-command-fights-after/`): the same side-by-side layout as the new fights (they share the watch screen), the picker and orders in a column that scrolls on its own, and the Go bar pinned at the bottom of it, now one label line and one detail line (76px, was 101px at 667x375), so the orders keep their room. 1.1 to 1.3 screens long, action on screen at every size. Still not covered: the duel face-off, the heist finale, the founding screen's bar.

## The founding screen's bar (same day)
It reuses the plan bar's styles, so the plan bar fix already took it from 82px to 58px with three founders picked (measured at 844x390 and 667x375). The one flaw left was a 6px gap under it where card text peeked through; the bar now sits flush at the bottom. The cards themselves are tall (a photo, a stat list and text, 3 across), so the screen is still about 3 screens long at 390px of height; a compact card is the next step if it matters.

## The founder cards (same day)
On a phone on its side the six founder cards are two across, each photo-left and details-right and about 135px tall (was a tall column, three across, so half of one card showed at 390px of height). Two full rows now show above the bar, the whole card is still the tap target, and the origin line is cut at three lines. Shots in `../2026-11-19-landscape-founding/` (`844-founding-0.png` is the top of the screen, where Joss and the tong name field still take about 230px; the cards are in `-cards`). Not done: folding Joss's line and the name field into fewer rows.

## The face-off and the finale (same day)
`node scripts/audit-watch-landscape.mjs` starts a real job (`delivery`) and waits for each to appear; shots and a table are in `../2026-11-19-landscape-watch/` (taken after the fix; the finale's problem is described here). Finale before: one tall column that ran past a 390px screen, the stamp cut off at the top and the Continue button ("Back to the safehouse") below the fold at 844x390 and 667x375. After: two columns (the stamp and the pay left, the team right, the buttons across the bottom), both buttons on screen at every size. Face-off before: at 667x375 it was wider than its 314px map and the Lock tile was clipped; after, it takes the small size it has on a phone held upright (52px faces) and fits. Not covered: the other watch moments (a prep step's finale on a heist, the raid call-in sheet).
