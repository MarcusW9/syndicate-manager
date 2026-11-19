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
