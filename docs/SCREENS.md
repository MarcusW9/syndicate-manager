# Screens: what lives where

A sitemap of the app as of 2026-11-09, for rethinking the layout. Source: `renderScreen()` and `render()` in `src/ui/app.js`. Keep it current when content moves between tabs (one line per move). Why something moved goes in the `DESIGN.md` log; how it looked goes in `docs/screenshots/`.

## Layout rules (2026-11-09, the navigation rework)

The target the rework is moving the app towards, one commit at a time (the plan is in `HANDOFF.md`). The sitemap below is the app **as it is now**; "Moves" says what each commit changed.

1. **Tabs are nouns.** Today: what needs me. City: what's happening out there. Tong: what we've built. Crew: who we have and who we could get. Jobs: what work there is.
2. **One home per page.** A page always opens on its home tab, whichever tab the link was on; links elsewhere are shortcuts to that home. This does not limit actions: take-the-call can still work from several places. The lookup is `HOMES` in `src/ui/nav.js`; a move updates it in the same commit.
3. **Today owns the attention feed:** inbox, briefing, The Word. It does not duplicate management or world-detail pages; its cards link to those pages' homes.
4. **Five tabs at most.** Save lives in ☰ in the top bar.
5. **Segmented sub-tabs** at the top of a tab, not "Places" buttons.
6. **Live state and lore sit together.** A district or client page shows what's happening now, with the lore below it.
7. **Back restores where you were in the navigation, and never rewinds the game.** It restores the tab, sub-tab, filters, the open page and scroll, and keeps an in-progress plan or squad selection across a shortcut (Plan → Armoury → Back). It never restores an old snapshot of game state: the page you return to shows the state now. With no history (a direct link, a fresh load) Back opens the root view of the destination's home sub-tab with nothing selected. A root view shows no in-app Back control. Choosing a tab starts fresh navigation (the history is cleared). Code: the stack in `src/ui/nav.js`, `viewNow` / `remember` / `restoreView` / `toRoot` in `ui/app.js`.
8. **Badges mean different things.** Today owns attention counts (anything waiting on the player: calls, raids, hall offers, decisions). Other tabs show only counts that mean something different and never count the same event twice: Jobs shows open jobs; City shows no number (crews out is activity, shown inside City); Tong shows no badge.

**Recruiting (decided 2026-11-09).** Crew › Leads holds everyone we could sign: recruits, free names *and* names in another tong (the "tong-affiliated recruitment targets"). Scouting, "What it would take" and Sign live there only, with the existing eligibility, scouting and buyout rules unchanged: signing a name in a tong still pays that tong its buyout. City › Tongs only reads: a tong-affiliated name has a read-only profile (who they are with, what we know) with a *View in Leads* button; a free name's card opens straight in Leads. Back from Leads returns to the City profile it came from. This changes where recruiting happens, not who can be recruited or how.

Navigation state (`screen`, `cityTab`, the open page ids) is module state in `ui/app.js`. It is **not** saved and not deep-linked (checked 2026-11-09: no `location`, `history` or storage use under `src/ui`, and nothing in `src/save` or `src/core` reads a view value), so no old value needs mapping.

## Shell (every screen)

- **Top bar:** day/clock, Cash, Heat, rank, Continue (hidden while planning a job), ☰ Save.
- **Back:** a detail page (a message, a runner, a lead, the Armoury, a hall and its build, a plan, a tong, a name) has one Back control; root views have none.
- **Tab bar:** Today · City · Tong · Crew · Jobs (five, the most there can be). Pills: Today's attention count (anything waiting on the player, each event once: `attentionCount` in `ui/nav.js`) and open jobs on Jobs; City and Tong show none. Save is the ☰ in the top bar. Lore is the **Book**, a link in City's header, reachable from every City sub-tab (the old Lore view, unchanged, until step 4).
- **Dock (phone):** Continue above the tab bar, except while planning or on a job.
- **During a job:** tabs and Save step aside; the watch screen (`renderMission`) owns the page.
- **Founding (new game):** only Today (the founder pick) and ☰ Save are enabled.

## Tabs

| Tab | Holds (in page order) | Sub-views opened from it |
| --- | --- | --- |
| **Today** (`inbox`) | Week strip; alerts; Out line; crews out; back cards; briefing; Upcoming list; inbox | A message (job report, Monday brief, Sunday summary, renewal, raid call/warning, heat notice, spec offer); the report timeline, summary and full log |
| **City** (`city`; was Ops) | Header with a **Book** link; sub-tabs **Map** · **Districts** · **Tongs**. Map: a heist marker (links to Jobs › Heists), the city map, **Out now** (raids, crews out, side work), **Tonight**, **At home**. Districts: a card for each district. Tongs: the other tongs by tier, Free names, Names on the street | A district's page (live state: faces, crews out, jobs open, a hall shortcut that opens the hall on Tong; the lore is still in the Book until step 4); **a tong's page**; **a name's read-only profile** (what we know and who they are with, with *View in Leads*); the **Book** (the old Lore view: Districts · Clients · Who's who · History) |
| **Tong** | Rank and standing in words; sub-tabs **Halls** · **Armoury** | Halls: a row per hall, buy sites, then a **hall's page** and **Hall build**. Armoury: stash, carried gear, shop. Equipping stays on the runner's page |
| **Crew** | Sub-tabs **Roster** · **Leads** · **Wall**. Leads: recruits, then **Names** (this month's free name, and anyone in another tong we are watching) | A runner's page (record, path, home, gear); a recruit's page; **a name's recruitment page** (what we know, What it would take, scouting, Sign) |
| **Jobs** | Sub-tabs **Board** · **Heists** · **Side**. Board: street talk, rep line, runners strip, the job board, Clients strip (until step 4). Heists: the heist card and its steps. Side: this week's side work | Plan (squad board, approach, inside/outside, Joss's picks, coverage read; beside the board on 1400px+); side-work plan |
| **☰ Save** (`settings`, top bar) | Slots, Backups, difficulty / new game | — |

## Inside each screen (the small sections)

Section names are the headings in the code. "(x)" marks something that shows only sometimes.

**Today** (`renderInbox`)
- Week strip (`renderUpcoming`), a slim strip across the top.
- Inbox column: briefing (`renderBriefing`), week brief (Monday), back cards (crews home), Out line (links to City › Map), the All / Unread filter, then message rows (tag, subject, preview, day).
- Detail pane (beside the list on wide screens; replaces it on phones): the open message. Types with their own layout: job report (timeline, summary, full log), week summary, renewal, spec offer, raid call, raid warning, heat notice.
- Also here: day cue (new-day banner), keep-save and backup banners.

**City** (`renderCity`: header, Book link, sub-tabs)
- Map (`renderCityMap`): a heist marker (x), the city map with the district you picked on it ("Open the district" / "Whole city"), then Out now: raids, crews out (each with a mini map), side work. A district filter ("… only · show all") narrows it.
- City map with the district labels and zoom; Tonight list; At home; Places (Halls, The other tongs, a disabled Bar · black market).
- Districts (`renderDistricts`): a row per district (hall, crews out, jobs open, heat). A district's page (`districtCard`): name, who is there (faces), crews out, jobs open, "Manage the hall ›" (x, opens the hall on Tong), "About … on Lore ›".
- Hall page (`renderHallPage`, on Tong › Halls since step 2): header with landmark, then The place (the plan and beds, Build), Who sleeps here, Move someone in, The block (parts, Expand, Buy).
- Hall build (`ui/hallbuild.js`): grid over the hall's map, palette, Place / Turn / Remove.
- Tongs (`ui/tongs.js` `renderTongs`): tongs grouped by tier, Free names (a card that opens the person in Crew › Leads), Names on the street. A tong's page has The latest and its names; a name's **profile** is read-only (who they are with, What we know, *View in Leads*). Recruiting (`renderLeadName`, on Crew › Leads): What we know, What it would take, Send someone to watch them (2 days), Sign (with the buyout to their tong when they are in one).

**Crew** (`renderCrew`)
- Sub-tabs: Roster rows (face, role, age, main stat, status, bars); Leads (recruits); The wall (memorial, with an empty line).

**Tong** (`renderTong`)
- Header: the rank ("Back Room tong", tap for what a tong is) and a standing line in words (halls and beds filled, the next rung). Sub-tabs: Halls (`renderHalls`: a row per hall, Open a hall) and Armoury (`ui/gear.js` `renderArmoury`, embedded).
- Runner's page (`renderOperative`): header (face, handle, line, status), Specialisation, Traits, Stats, Development (mentoring), Condition, Trust, History; Record, Path and Home cards; Gear (the 2x2 bag, `ui/gear.js`).
- Recruit's page (`renderRecruit`): Traits, Stats, Scout's view, Terms (the offer).
- Armoury (`ui/gear.js`, Tong › Armoury): In the stash, Carried, Buy (by slot); a gear sheet picks an item for a slot, with Carried by others.

**Jobs** (`renderJobs`)
- Sub-tabs. Board: runners strip (collapsible), job board (job cards with flags), Clients strip (trust). Heists: the heist card (`renderHeist`). Side: the side board (the scout rows for free names are gone: scouting is on Crew › Leads).
- Plan (`renderPlan`): the plan grid holds the approach, the squad board, the orders chips and the risk card, with the client box (and a rival remark) beside them. The plan bar at the bottom has the Send / Watch live buttons, the risk read and the tries count.
- Squad board (`ui/board.js`): Inside team (moves as one group), Outside (optional), Wheels card with getaway risk, Joss's picks, the coverage read. A runner picker sheet lists "Who's on …?" in groups by fit, plus "Not free today".
- Side-work plan (`renderSidePlan`): Who goes (up to n), checkbox picker, the Clients list.

**Book** (`renderLore`, opened from City's header; was the Lore tab): header, then the sub-tab: Districts (one card each; "Everyone knows" and "A short history" are the other two sections' headings), Clients, Who's who, History.

**Save** (`renderSettings`): New game in slot n (difficulty), Slots (Play / New / Delete), Backups (export and import).

**Watch** (`renderMission`, `ui/watch.js`): site map with the crew moving on it, the feed beside it (phones stack them), crisis choices, the face-off (`ui/duel.js`), command-fight orders (`ui/fightorders.js`), call-ins from away crews, finale and direct-buzz screens, the end card, then the report in the feed.

## Moves (one line per move, newest first)

- 2026-11-09, step 3: **Ops renamed City** (tab id `ops` → `city`; no persisted value used it). **Places** (the Halls and The other tongs buttons, and the disabled Bar) is gone: Halls are on Tong, the tongs are City › Tongs.
- 2026-11-09, step 3: City gets sub-tabs **Map · Districts · Tongs**. The **Map** keeps the city map, Out now, Tonight and At home (not listed in the brief; kept so nothing is lost). The district cards moved to **Districts**: a card for each district, each opening the district's page. `HOMES.district`: ops → city › districts. A district picked on the map is a selection (zoom, Out now narrowed), not a page.
- 2026-11-09, step 3: **The other tongs** (list, a tong's page, Names on the street) moved Ops › Places → City › Tongs. `HOMES.tong`, `name`: ops → city › tongs. A name in a tong has a **read-only profile** here with *View in Leads*.
- 2026-11-09, step 3: **Heist card** moved Ops → Jobs › Heists; the Map keeps a one-line marker that links there. Today's Monday heist line links there too. `HOMES.heist`: jobs › heists.
- 2026-11-09, step 3: Jobs gets sub-tabs **Board · Heists · Side**; the Side board (without its scout row) moved to Side. The Clients strip stays on Board until step 4.
- 2026-11-09, step 3: **Free-name scouting, What it would take and Sign** moved to **Crew › Leads** (`renderLeadName`, `leadNames` in `ui/tongs.js`): for free names *and* names in another tong, with the buyout rule unchanged. The Jobs side board's scout row is gone. Free names on City › Tongs open straight in Leads; a name in a tong opens a read-only City profile first. `HOMES.leadName`: crew › leads. Leads' Names group lists the free name and any name in a tong we are watching or have sent a scout after; any name can also be opened from its City profile.
- 2026-11-09, step 3: Today's crews-out line (and its raid line) go to City › Map; the Monday heist line to Jobs › Heists (`goto` shortcuts: a link, so Back returns).
- 2026-11-09, step 2: new **Tong** tab (Halls · Armoury) with the rank and standing header in words; the rank button moved there from Ops' header.
- 2026-11-09, step 2: **Halls** (list, Open a hall, a hall's page, Hall build) moved Crew → Tong › Halls. `HOMES.hall`, `hallBuild`: crew → tong.
- 2026-11-09, step 2: **Armoury** moved Crew → Tong › Armoury (a sub-tab, no longer a page with its own Back). Its Crew card is gone; the squad board's "Armoury →" opens it and Back returns to the plan. `HOMES.armoury`: crew → tong.
- 2026-11-09, step 2: **Crew** gets sub-tabs Roster · Leads · Wall (the wall was already on Crew; it is now its own sub-tab). Today's "See the leads" opens Crew › Leads.
- 2026-11-09, step 2: **Save** left the tab bar; it is the ☰ in the top bar only.
- 2026-11-09, step 2: **Lore** left the tab bar. A **Book** link in Ops' header opens the old Lore view unchanged; Back returns to Ops. (Book gets the other City sub-tabs' headers at step 3, and its content moves home at step 4.)
- 2026-11-09, step 2: **badges**: Ops' calls count is gone (calls and raids are inbox messages, so Today's count already holds them); Today's pill is the attention count, each event once; Jobs keeps open jobs; Tong none.
- 2026-11-09, step 1 (routing by home): a **hall's page** now always opens on Crew (its home for now), also from City's district card and Today's raid cards; it used to stay on whichever tab opened it. The **hall build** screen likewise.
- 2026-11-09, step 1: every **Back** is one control backed by the navigation stack (`ui/nav.js`): it returns to the view you came from, with filters, plan and scroll; the old per-page "‹ Ops / ← Crew / ← Jobs" buttons and `returnTo` are gone. A runner's page, a lead, the Armoury, a message, a plan, a tong and a name all push the view you left.

## The overlaps (the awkward bits)

| Content | Lives on | Also reachable from | Note |
| --- | --- | --- | --- |
| Halls (list, residents, buy/expand/move in) | Tong › Halls | City district page; Today's raid cards | Every link opens the hall page on Tong › Halls (steps 1-2). |
| Raids on halls | City › Map (Out now, rings on the map); Today (alerts, call/warning messages) | — | Fought on the watch screen. |
| The other tongs | City › Tongs | Today's Monday brief (The Word) | |
| Free names, scouting, signing | Crew › Leads | City › Tongs (Free names card, a name's *View in Leads*) | One place to recruit (recruits, free names and names in another tongs); City only reads. |
| Clients | Jobs › Board (strip) | Book › Clients | Jobs shows trust; the Book is the who's who (merge in step 4). |
| Districts | City › Districts (pages), City › Map (picking) | Book › Districts | City is live state, the Book is lore (moves in step 4). |
| Heists | Jobs › Heists (card); prep and finale jobs on the Jobs board | City › Map (marker), Today (Monday / Sunday lines) | |
| Armoury / gear | Tong › Armoury | A runner's page (gear sheet); squad board shows each runner's gear and links to the Armoury | |
| Recruiting | Crew › Leads | Today (scout messages link to "See the leads" › Crew › Leads) | |
| Crews out (away jobs) | Today and City › Map | Take the call on either; watch screen opens | Same data, two layouts (`renderCrewsOut`). Step 5 shrinks Today's to one line. |

## Open question: placement

`HANDOFF.md` (2026-10-28) floats an "underground place" (bar / black market: hiring, rumours, gear) that could pull Leads and the Armoury out of Crew. The disabled "Bar · black market — Later" button went with Places in step 3. (The Armoury and Leads are no longer both on Crew, so this question is partly answered by the Tong tab.)

## Where the code is

`ui/app.js` routes and draws every tab (`renderInbox`, `renderTong`, `renderCrew`, `renderJobs`, `renderCity`/`renderOps`, `renderLore`, `renderSettings`, `renderHalls`, `renderHallPage`, `renderOperative`, `renderRecruit`, `renderPlan`, `renderSidePlan`); separate files are `board.js` (squad board), `watch.js` (live job), `hallbuild.js`, `tongs.js`, `citymap.js`, `gear.js`. See `CODEMAP.md` for the rest.
