# Screens: what lives where

A sitemap of the app as of 2026-11-09, for rethinking the layout. Source: `renderScreen()` and `render()` in `src/ui/app.js`. Keep it current when content moves between tabs (one line per move). Why something moved goes in the `DESIGN.md` log; how it looked goes in `docs/screenshots/`.

## Shell (every screen)

- **Top bar:** day/clock, Cash, Heat, rank, Continue (hidden while planning a job), ☰ Save.
- **Tab bar:** Today · Ops · Crew · Jobs · Lore · ☰ Save. Pills: unread on Today, calls on Ops, open jobs on Jobs.
- **Dock (phone):** Continue above the tab bar, except while planning or on a job.
- **During a job:** tabs and Save step aside; the watch screen (`renderMission`) owns the page.
- **Founding (new game):** only Today (the founder pick) and Save are enabled.

## Tabs

| Tab | Holds (in page order) | Sub-views opened from it |
| --- | --- | --- |
| **Today** (`inbox`) | Week strip; alerts; Out line; crews out; back cards; briefing; Upcoming list; inbox | A message (job report, Monday brief, Sunday summary, renewal, raid call/warning, heat notice, spec offer); the report timeline, summary and full log |
| **Ops** | Heist card; **Out now** (raids, crews out, side work) over the city map; **Tonight** list; **At home**; **Places**; one card per district | **Hall page** (from a district card's "Manage the hall"); **Hall build**; **The other tongs** (list, a tong, Free names, a name's page, Names on the street) |
| **Crew** | Roster rows; Leads (recruits); The wall (memorial); **Halls**; **Armoury** card | A runner's page (record, path, home, gear); a recruit's page; the Armoury and gear sheet; a **hall's page** and **Hall build** (from Halls) |
| **Jobs** | Runners strip; the job board; Side board; Clients strip | Plan (squad board, approach, inside/outside, Joss's picks, coverage read; beside the board on 1400px+); side-work plan; scout rows for free names |
| **Lore** | Sub-tabs: Districts · Clients · Who's who · History | A district's lore (from Ops "About … on Lore") |
| **Save** (`settings`) | Slots, Backups, difficulty / new game | — |

## The overlaps (the awkward bits)

| Content | Lives on | Also reachable from | Note |
| --- | --- | --- | --- |
| Halls (list, residents, buy/expand/move in) | Crew | Ops › Places "Halls — On Crew" button; Ops district card | The button only navigates to Crew. A hall's page and Build show on **whichever tab opened them** (Crew or Ops). |
| Raids on halls | Ops (Out now, rings on the map); Today (alerts, call/warning messages) | — | Fought on the watch screen. |
| The other tongs, Free names | Ops › Places | Jobs side board (Scout rows); Today's Monday brief (The Word) | Three entry points, one place to read them. |
| Clients | Jobs (strip) | Lore › Clients | Jobs shows trust; Lore is the who's who. |
| Districts | Ops (map, district cards) | Lore › Districts | Ops is live state, Lore is the book. |
| Heists | Ops (heist card); prep and finale jobs on Jobs board | Today (Monday / Sunday lines) | |
| Armoury / gear | Crew | A runner's page (gear sheet); squad board shows each runner's gear | |
| Recruiting | Crew › Leads | Today (scout messages link to "See the leads") | |
| Crews out (away jobs) | Today and Ops | Take the call on either; watch screen opens | Same data, two layouts (`renderCrewsOut`). |

## Open question: placement

`HANDOFF.md` (2026-10-28) floats an "underground place" (bar / black market: hiring, rumours, gear) that could pull Leads and the Armoury out of Crew. Ops › Places already has a disabled "Bar · black market — Later" button for it.

## Where the code is

`ui/app.js` routes and draws every tab (`renderInbox`, `renderCrew`, `renderJobs`, `renderOps`/`renderOpsScreen`, `renderLore`, `renderSettings`, `renderHalls`, `renderHallPage`, `renderOperative`, `renderRecruit`, `renderPlan`, `renderSidePlan`); separate files are `board.js` (squad board), `watch.js` (live job), `hallbuild.js`, `tongs.js`, `citymap.js`, `gear.js`. See `CODEMAP.md` for the rest.
