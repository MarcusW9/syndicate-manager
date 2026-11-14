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
7. **Back restores where you were in the navigation, and never rewinds the game.** It restores the tab, sub-tab, filters, the open page and scroll, and keeps an in-progress plan or squad selection across a shortcut (Plan → Armoury → Back). It never restores an old snapshot of game state: the page you return to shows the state now. With no history (a direct link, a fresh load) Back opens the root view of the destination's home sub-tab with nothing selected. A root view shows no in-app Back control. Choosing a tab starts fresh navigation (the history is cleared). Code: the stack in `src/ui/nav.js`, `viewNow` / `remember` / `restoreView` / `toRoot` in `ui/view.js`.
8. **Badges mean different things.** Today owns attention counts (anything waiting on the player: calls, raids, hall offers, decisions). Other tabs show only counts that mean something different and never count the same event twice: Jobs shows open jobs; City shows no number (crews out is activity, shown inside City); Tong shows no badge.

**Recruiting (decided 2026-11-09).** Crew › Leads holds everyone we could sign: recruits, free names *and* names in another tong (the "tong-affiliated recruitment targets"). Scouting, "What it would take" and Sign live there only, with the existing eligibility, scouting and buyout rules unchanged: signing a name in a tong still pays that tong its buyout. City › Tongs only reads: a tong-affiliated name has a read-only profile (who they are with, what we know) with a *View in Leads* button; a free name's card opens straight in Leads. Back from Leads returns to the City profile it came from. This changes where recruiting happens, not who can be recruited or how.

Navigation state (`screen`, `cityTab`, the open page ids) is module state in `ui/view.js` (`V`). It is **not** saved and not deep-linked (checked 2026-11-09: no `location`, `history` or storage use under `src/ui`, and nothing in `src/save` or `src/core` reads a view value), so no old value needs mapping.

## Shell (every screen)

- **Top bar:** day/clock, Cash, Heat, rank, Continue (hidden while planning a job), ☰ Save.
- **Back:** a detail page (a message, a runner, a lead, the Armoury, a hall and its build, a plan, a tong, a name) has one Back control; root views have none.
- **Tab bar:** Today · City · Tong · Crew · Jobs (five, the most there can be). Pills: Today's attention count (anything waiting on the player, each event once: `attentionCount` in `ui/nav.js`) and open jobs on Jobs; City and Tong show none. Save is the ☰ in the top bar. The **Book** (Who's who · History; was the Lore tab) is a link in City's header, reachable from every City sub-tab.
- **Dock (phone):** Continue above the tab bar, except while planning or on a job.
- **During a job:** tabs and Save step aside; the watch screen (`renderMission`) owns the page.
- **Founding (new game):** only Today (the founder pick) and ☰ Save are enabled.

## Tabs

| Tab | Holds (in page order) | Sub-views opened from it |
| --- | --- | --- |
| **Today** (`inbox`) | Joss's briefing with the alerts and call-ins; back cards; **a priority line per raid** (links to its card on City › Map); **one Out line** (crews out, calls waiting; links to City › Map); inbox; on the right, a sticky stack: Coming up as a strip over the reader (the week's brief by default) | A message (job report, Monday brief, Sunday summary, renewal, raid call/warning, heat notice, spec offer); the report timeline, summary and full log |
| **City** (`city`; was Ops) | Header with a **Book** link; sub-tabs **Map** · **Districts** · **Tongs**. Map: a heist marker (links to Jobs › Heists), the city map, **Threats** (a card per raid; plan Hold or Clear out), **Out now** (crews out, side work), **Tonight**, **At home**. Districts: a row for each district. Tongs: the other tongs by tier, Free names, Names on the street | A district's page (live state first: faces at the hall, crews out, jobs open, street talk, a hall shortcut that opens the hall on Tong; then its picture, pitch and write-up: who runs it, police, 3am, custom, landmarks, kinds of work); **a tong's page**; **a name's read-only profile** (what we know and who they are with, with *View in Leads*); the **Book** (Who's who · History) |
| **Tong** | Rank and standing in words; sub-tabs **Halls** · **Armoury** | Halls: a row per hall, buy sites, then a **hall's page** and **Hall build**. Armoury: stash, carried gear, shop. Equipping stays on the runner's page |
| **Crew** | Sub-tabs **Roster** · **Leads** · **Wall**. Leads: recruits, then **Names** (this month's free name, and anyone in another tong we are watching). Wall: the fallen, the Hall of Legends, then **Gone elsewhere** (runners we let go, with where they are now; C4). City › Tongs opens with a card for **The Anchor's Book** (C5): the monthly slate S to D, Ones to watch (with Scout), who has gone quiet; a runner's page and a name's profile show their grade | A runner's page (record, path, home, gear); a recruit's page; **a name's recruitment page** (what we know, What it would take, scouting, Sign) |
| **Jobs** | Sub-tabs **Board** · **Heists** · **Side** · **Clients**. Board: street talk, rep line, runners strip, the job board. Heists: the heist card and its steps. Side: this week's side work. Clients: a row per client | Plan (squad board, approach, inside/outside, Joss's picks, coverage read; beside the board on 1400px+); side-work plan; **a client's page** (trust and the board now, then who they are) |
| **☰ Save** (`settings`, top bar) | Slots, Backups, difficulty / new game | — |

## Inside each screen (the small sections)

Section names are the headings in the code. "(x)" marks something that shows only sometimes.

**Today** (`renderInbox`)
- Inbox column, messages first: briefing (`renderBriefing`; Joss's line folds to one line on a tap, for the day), the next-up line (`renderNextUp`, phones only: the soonest raid, bills or last day; a tap scrolls to Coming up), back cards (crews home), Out line (links to City › Map), the All / Unread filter, then message rows (tag, subject, preview, day).
- Stack (`.inbox__stack`, sticky under the top bar from 900px): Coming up (`renderUpcoming`, a strip of cells, a day each, "+N more" behind a tap; the open message's day lights up), then the reader. On a phone it is Coming up after the list, then the brief on Mondays.
- Reader (`.inbox__detail`, in the stack on wide screens; replaces the list on phones): a bar (Message N of M, ‹ › step through the list, ✕ close) over the open message, or over the week's brief (`renderWeekBrief`) when none is open. Types with their own layout: job report (timeline, summary, full log), week summary, renewal, spec offer, raid call, raid warning, heat notice.
- Also here: day cue (new-day banner), keep-save and backup banners.

**City** (`renderCity`: header, Book link, sub-tabs)
- Map (`renderCityMap`): a heist marker (x), the city map with the district you picked on it ("Open the district" / "Whole city"), then Threats (raid cards) pinned above Out now: crews out (each with a mini map), side work. A district filter ("… only · show all") narrows it.
- City map with the district labels and zoom; Tonight list; At home; Places (Halls, The other tongs, a disabled Bar · black market).
- Districts (`renderDistricts`): a row per district (hall, crews out, jobs open, heat). A district's page (`districtCard`): name, who is there (faces), crews out, jobs open, "Manage the hall ›" (x, opens the hall on Tong), "About … on Lore ›".
- Hall page (`renderHallPage`, on Tong › Halls since step 2): header with landmark, then The place (the plan and beds, Build), Who sleeps here, Move someone in, The block (parts, Expand, Buy). Since 2026-11-12 on a computer it is in two modes: looking (the plan, buildings, a Posts panel while a raid is warned, Defences, Grow the hall) and building (Build defences › : the Posts and Forecourt tabs, a Done button).
- Hall build (`ui/hallbuild.js`): grid over the hall's map, palette, Place / Turn / Remove.
- 2026-11-09 (later), **a hall's page opens on the compound**: the buildings as rooftops (name, who sleeps in each, the rooms built) with a card each under the plan, the raid card and the raiders' ways in, defences placed outside; tap a building (`hall-building`) for its inside (rooms placed there, beds laid out), ‹ The compound (`hall-compound`) goes back. The hall's level is shown once, in the header. UI only (`V.hallInside` in `ui/view.js`).
- 2026-11-09, **a hall's page** (`renderHallPage`): from 1100px two columns, the plan (with the raid's ways in in red, a key, "Start building ›" when empty) on the left and on the right the raid card, Who sleeps here, Build (the palette and sheet inline, Expand, Buy) and Defences; phones stack the column under the plan and Build opens its own screen. Save › Look › Hall art draws Old Town with `ui/hallart.js`.
- Tongs (`ui/tongs.js` `renderTongs`): tongs grouped by tier, Free names (a card that opens the person in Crew › Leads), Names on the street. A tong's page has The latest and its names; a name's **profile** is read-only (who they are with, What we know, *View in Leads*). Recruiting (`renderLeadName`, on Crew › Leads): What we know, What it would take, Send someone to watch them (2 days), Sign (with the buyout to their tong when they are in one).

**Crew** (`renderCrew`)
- Sub-tabs: Roster rows (face, role, age, main stat, status, bars); Leads (recruits); The wall (memorial, with an empty line).

**Tong** (`renderTong`)
- Header: the rank ("Back Room tong", tap for what a tong is) and a standing line in words (halls and beds filled, the next rung). Sub-tabs: Halls (`renderHalls`: a row per hall, Open a hall) and Armoury (`ui/gear.js` `renderArmoury`, embedded).
- Runner's page (`renderOperative`): header (face, handle, line, status), Specialisation, Traits, Stats, Development (mentoring), Condition, Trust, History; Record, Path and Home cards; Gear (the 2x2 bag, `ui/gear.js`).
- Recruit's page (`renderRecruit`): Traits, Stats, Scout's view, Terms (the offer).
- Armoury (`ui/gear.js`, Tong › Armoury): In the stash, Carried, Buy (by slot); a gear sheet picks an item for a slot, with Carried by others. A Custom or Premium item lists its perks under its row (tap one for its line); the shop sells Standard and Verified only.

**Jobs** (`renderJobs`)
- Sub-tabs. Board: runners strip (collapsible), job board (job cards with flags). Clients: a row each (trust, jobs on the board), and a client's page (`renderClientPage`). Heists: the heist card (`renderHeist`). Side: the side board (the scout rows for free names are gone: scouting is on Crew › Leads).
- Plan (`renderPlan`): the plan grid holds the approach, the squad board, the orders chips and the risk card, with the client box (and a rival remark) beside them. On the five engine-2 jobs a **fight block** (`renderFightPlan`, `ui/fightscreen.js`) leads the risk card: the fight type and objective, likely enemies, gaps (no jammer, no medic, no armour on the tech), each runner's order and pull-out threshold, the risk picker (the same chips as "On their own") and the chance of losing someone. The plan bar at the bottom has the Send / Watch live buttons, the risk read and the tries count.
- Squad board (`ui/board.js`): Inside team (moves as one group), Outside (optional), Wheels card with getaway risk, Joss's picks, the coverage read. A runner picker sheet lists "Who's on …?" in groups by fit, plus "Not free today".
- Side-work plan (`renderSidePlan`): Who goes (up to n), checkbox picker, the Clients list.

**Book** (`renderLore`, opened from City's header; was the Lore tab): header, then the sub-tabs Who's who and History ("Everyone knows" and "A short history" are History's two sections). The districts moved to their pages in City › Districts and the clients to Jobs › Clients (step 4).

**Save** (`renderSettings`): New game in slot n (difficulty), Slots (Play / New / Delete), Backups (export and import).

**Watch** (`renderMission`, `ui/watch.js`): site map with the crew moving on it, the feed beside it (phones stack them), crisis choices, the face-off (`ui/duel.js`), command-fight orders (`ui/fightorders.js` for engine 1; `ui/fightscreen.js` for the five engine-2 jobs: the round screen, the call-in cards), call-ins from away crews, finale and direct-buzz screens, the end card, then the report in the feed.

## Moves (one line per move, newest first)

- 2026-11-09, step 5: **Today's crews out is one line** and the full cards (with mini maps) are on City › Map only. The code already worked this way (Today's one Out line since 2026-11-06); step 5 only checked it with a test, fixed the line's stale "Ops ›" label to "City ›" and corrected this sitemap, which still listed crew cards on Today. Take-the-call works from the call-in message on Today and from the card on the Map.
- 2026-11-09, step 4: **Lore › Districts** moved into each district's page (City › Districts): the write-up (picture, who runs it, police, 3am, custom, landmarks, kinds of work) sits **below** the live state; the header text is one copy. "About … on Lore ›" and "See it on Ops ›" are gone.
- 2026-11-09, step 4: **Lore › Clients** and the Jobs **Clients strip** merged into **Jobs › Clients** (a row each) with a **client page** (`HOMES.client`: jobs › clients): trust and what they have on the board above, their line below. A job's plan links to it.
- 2026-11-09, step 4: the **Book** keeps **Who's who** and **History** only. The old Lore view and its renderers (`renderDistrictLore`, `renderClientCards`, `renderClients`) are removed; the Book's sub-tab action is `lore-tab`.
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

## The overlaps (what is left)

Every page now has one home (`HOMES` in `ui/nav.js`). What remains is on purpose: a shortcut or a different-sized view of the same thing, never a second copy of a page.

| Content | Home | Also shown in | Why it stays |
| --- | --- | --- | --- |
| Crews out (away jobs) | City › Map (the full cards, mini maps, Take the call) | Today: one line with the count of calls waiting, linking to City › Map | The attention feed points at the page. The call can be taken from either (and from the call-in message on Today). |
| Raids on halls | City › Map (Out now, rings on the map) | Today: alerts, and the call or warning message | A raid at the door is something waiting on the player (Today's count); it is fought on the watch screen. |
| Heists | Jobs › Heists (the card and steps; prep and finale jobs on the Board) | City › Map: a marker; Today: Monday's and Sunday's lines | Both link to Jobs › Heists. |

(Halls, the tongs, free names and recruiting, the Armoury, districts and clients each have one home and only links elsewhere: see Moves above.)

## Lore migration register

The 91-row register of where each entry of the old Lore view went (navigation rework step 4, 2026-11-09) is finished and lives in [`docs/screens-lore-register.md`](screens-lore-register.md); `tests/lore-register.test.js` keeps it true.

## Open question: placement

`HANDOFF.md` (2026-10-28; now `docs/handoff-archive.md`, "Parked") floats an "underground place" (bar / black market: hiring, rumours, gear) that could pull Leads and the Armoury out of Crew. The disabled "Bar · black market — Later" button went with Places in step 3. (The Armoury and Leads are no longer both on Crew, so this question is partly answered by the Tong tab.)

## Where the code is

Which function draws each tab and sub-tab, and which UI file holds it: `CODEMAP.md` "UI files". Navigation rules in code: `ui/nav.js` (`HOMES`).
