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

## Inside each screen (the small sections)

Section names are the headings in the code. "(x)" marks something that shows only sometimes.

**Today** (`renderInbox`)
- Week strip (`renderUpcoming`), a slim strip across the top.
- Inbox column: briefing (`renderBriefing`), week brief (Monday), back cards (crews home), Out line (links to Ops), the All / Unread filter, then message rows (tag, subject, preview, day).
- Detail pane (beside the list on wide screens; replaces it on phones): the open message. Types with their own layout: job report (timeline, summary, full log), week summary, renewal, spec offer, raid call, raid warning, heat notice.
- Also here: day cue (new-day banner), keep-save and backup banners.

**Ops** (`renderOps`)
- Heist card (x), then Out now: raids, crews out (each with a mini map), side work. A district filter ("… only · show all") narrows it.
- City map with the district labels and zoom; Tonight list; At home; Places (Halls, The other tongs, a disabled Bar · black market).
- District cards: name, who is there (faces), crews out, jobs open, "Manage the hall ›" (x), "About … on Lore ›".
- Hall page (`renderHallPage`): header with landmark, then The place (the plan and beds, Build), Who sleeps here, Move someone in, The block (parts, Expand, Buy).
- Hall build (`ui/hallbuild.js`): grid over the hall's map, palette, Place / Turn / Remove.
- The other tongs (`ui/tongs.js`): tongs grouped by tier, Free names, Names on the street. A tong's page has The latest and its names; a name's page has What we know, What it would take, and Send someone to watch them (2 days).

**Crew** (`renderCrew`)
- Roster rows (face, role, age, main stat, status, bars), Leads (recruits), The wall (memorial), Halls (a row per hall, buy sites), Armoury card.
- Runner's page (`renderOperative`): header (face, handle, line, status), Specialisation, Traits, Stats, Development (mentoring), Condition, Trust, History; Record, Path and Home cards; Gear (the 2x2 bag, `ui/gear.js`).
- Recruit's page (`renderRecruit`): Traits, Stats, Scout's view, Terms (the offer).
- Armoury (`ui/gear.js`): In the stash, Carried, Buy (by slot); a gear sheet picks an item for a slot, with Carried by others.

**Jobs** (`renderJobs`)
- Runners strip (collapsible), job board (job cards with flags), Side board (scout rows for free names), Clients strip (trust).
- Plan (`renderPlan`): the plan grid holds the approach, the squad board, the orders chips and the risk card, with the client box (and a rival remark) beside them. The plan bar at the bottom has the Send / Watch live buttons, the risk read and the tries count.
- Squad board (`ui/board.js`): Inside team (moves as one group), Outside (optional), Wheels card with getaway risk, Joss's picks, the coverage read. A runner picker sheet lists "Who's on …?" in groups by fit, plus "Not free today".
- Side-work plan (`renderSidePlan`): Who goes (up to n), checkbox picker, the Clients list.

**Lore** (`renderLore`): header, then the sub-tab: Districts (one card each; "Everyone knows" and "A short history" are the other two sections' headings), Clients, Who's who, History.

**Save** (`renderSettings`): New game in slot n (difficulty), Slots (Play / New / Delete), Backups (export and import).

**Watch** (`renderMission`, `ui/watch.js`): site map with the crew moving on it, the feed beside it (phones stack them), crisis choices, the face-off (`ui/duel.js`), command-fight orders (`ui/fightorders.js`), call-ins from away crews, finale and direct-buzz screens, the end card, then the report in the feed.

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
