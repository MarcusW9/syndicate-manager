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

Then add a row to the top of the table below and commit the folder with the change. Playwright's Chromium is needed once: `npx playwright install chromium`.

## Versions

| Date | Version | Commit | What's new on screen | Folder |
| --- | --- | --- | --- | --- |
| 2026-10-28 | The squad run: a map per district | (this change) | The watch screen draws the job's district: the scripted run is in Old Town (the alley of steps, the courtyard, the flat; overwatch by a rooftop water tank). Capture 18 shows all six site plans (generic, Docks, Old Town, Night Market, Glass Heights, Basin) with the rifle's sight. | [2026-10-28-district-sites](2026-10-28-district-sites/) |
| 2026-10-28 | Design session: job cards (parked) | (this change) | A parked redesign of the job and side-work cards (three tiers, quiet client with trust marks, coloured reward chips), mocked and then built into the real board for captures, now against proposed, phone and desktop. Not shipped; README explains. | [2026-10-28-design-session-job-cards](2026-10-28-design-session-job-cards/) |
| 2026-10-28 | Reputation in the Heat meter's style, smaller (i) | (this change) | The job board's reputation as "REP", a small cyan segmented track and "2/10"; the (i) is small and lines up with its text. | [2026-10-28-reputation-heat-style](2026-10-28-reputation-heat-style/) |
| 2026-10-28 | Design session: reputation gauge | (this change) | The five mocked gauge options (A blocks, B Heat-meter style, chosen, C pips, D words only, E hairline) and B on the job board with the smaller (i). README captions each. | [2026-10-28-design-session-reputation-gauge](2026-10-28-design-session-reputation-gauge/) |
| 2026-10-27 | Reputation line | PR #23 | The job board's reputation as one line with a ten-block gauge and an (i); capture 18 has the (i) open with the unlock ladder (from a test save). | [2026-10-27-reputation-line](2026-10-27-reputation-line/) |
| 2026-10-27 | Stat icons rolled out | PR #23 | Line icons beside stats on job cards (with the crew size as figures), squad dossiers and the picker; plus two extra captures from a test save: the profile's stats panel (18) and the crew list's main stats (19). | [2026-10-27-stat-icons](2026-10-27-stat-icons/) |
| 2026-10-27 | Owner's feedback: "Coming up" and side work | PR #23 | Side work explains itself in one line with an (i) to tap; its cards show the stat as a line icon and the crew count as figures. Grouped "5 back from the job" lines only show in the design-session set below. | [2026-10-27-coming-up-and-side-work](2026-10-27-coming-up-and-side-work/) |
| 2026-10-27 | Design session: "Coming up" and side work | PR #23 | A test save with five back on one day: the grouped line opened, and side work with the (i) open, on desktop and phone. README captions each. | [2026-10-27-design-session-coming-up-and-side-work](2026-10-27-design-session-coming-up-and-side-work/) |
| 2026-10-27 | Owner's feedback: picker and feed | PR #23 | The squad picker lists free crew first and puts everyone already placed under "Already on the squad", greyed and tagged (Inside, Wheels, Standby, In this slot). The watch feed is one line per moment: an icon and the headline, tap for the rest; story beats smaller. | [2026-10-27-feedback-picker-and-feed](2026-10-27-feedback-picker-and-feed/) |
| 2026-10-27 | The squad run: Wheels and standby | `aa79373` (#21) | The squad board's Outside row gains Wheels ("in the van") and Standby ("on call") cards beside overwatch, and Joss's picks fill them; the coverage read notes who's on standby; the job header names them; on the watch screen they wait at the van. | [2026-10-27-wheels-and-standby](2026-10-27-wheels-and-standby/) |
| 2026-10-27 | Design session: standby | `aa79373` (#21) | A max-alert call-in with "Call standby in", standby joining the group on the site plan, and the rest of that run. Set up in Node (the scripted run doesn't reliably reach max alert); README captions each. | [2026-10-27-design-session-standby](2026-10-27-design-session-standby/) |
| 2026-10-27 | The squad run: squad board and watch screen | `6fbbb55` (#20) | Planning: a board of pinned dossier cards for the inside team and overwatch (rifle or drone), a "Joss's picks" button, a picker sheet sorted by fit, and "What they'll likely meet" (each incident, who handles it, risk with and without a save) above the crisis read. On the job: a site plan stays at the top (the crew walk the way in, inside, the target and the way out; guards, patrols, cameras, shots and the drone are animated), with the alert, saves, hurt, heat and overwatch shots beside it; each moment is a card with a headline, detail and dice; call-ins sit in the feed; Pause and Faster. The report adds saves and how high the alert got. | [2026-10-27-squad-board-and-watch](2026-10-27-squad-board-and-watch/) |
| 2026-10-27 | The squad run, engine slice | `9b46379` (#19) | Planning: four approaches (stealth, tech, loud, con), an optional overwatch pick with the shared rifle or drone, and a "Call me in…" rule beside the standing orders. On the job: zone headings (The way in, Inside, The target), incidents in the log, an alert meter, and a decision card when the crew is spotted or someone goes down. Reports from live runs say how they were called. | [2026-10-27-squad-run-engine](2026-10-27-squad-run-engine/) |
| 2026-10-27 | Design session: squad-run prototypes | `6fec972`–`a822d22` | Session captures (1x) of the two standalone prototypes that led to the squad run: v1's route planning and call-ins, the GTA-style heist board with portraits, v2's approaches, squad and coverage read, and v2's site-plan watch screen with headlines and a save. README in the folder captions each one. | [2026-10-27-design-session-squad-prototypes](2026-10-27-design-session-squad-prototypes/) |
| 2026-10-26 | Earned traits | `4ada93b` (#18) | "Earned on the job" on an operative's profile: lasting traits with a solid border, temporary ones dashed. Extra shot 13 (1x) shows a profile with three traits injected into the save (a new game has none yet). | [2026-10-26-earned-traits](2026-10-26-earned-traits/) |
| 2026-10-26 | Side work and stat unlocks | `4ada93b` (#18) | "Side work this week" under the job board, a side-task planner (who goes, what it gives, what it costs) and its report the next day; choices that unlock with stats show greyed until someone qualifies. Extra shots 13-15 (1x, from a scripted run) show the board, the planner and a report. | [2026-10-26-side-work](2026-10-26-side-work/) |
| 2026-10-26 | Hands-off runs and mission logs | `8da7680` | Job reports open with Joss's line, a turning point, standout and what hurt us, with a foldable full log and dice on tap; Container 409 can be sent hands-off under standing orders; the risk read names every bonus; the City map's district card sits beside the map; jobs trickle in through the week; new scout reads. | [2026-10-26-hands-off-and-mission-logs](2026-10-26-hands-off-and-mission-logs/) |
| 2026-10-25 | Report timelines, City tab sections | `56a6083` | Job reports as a numbered timeline; City tab split into Map, Clients, Who's who and Lore; tidier crew cards. | [2026-10-25-timelines-and-city-sections](2026-10-25-timelines-and-city-sections/) |
| 2026-10-25 | Owner captures | (`f61c6e5`) | The owner's desktop inbox that started the UX review: two messages in a narrow column, most of the screen empty. | [2026-10-25-owner-captures](2026-10-25-owner-captures/) |
| 2026-10-25 | Design session: UX, Joss, skin, portraits | `d3e6975`–`16e78f3` | Session captures in order: the clearer-days and inbox pass, crew picks before and after, Today's two versions, Joss's briefing, the first (unshipped) style test, the street-terminal skin, and the portraits with their variety and condition sheets. Captioned in the folder's README. | [2026-10-25-design-session](2026-10-25-design-session/) |
| 2026-10-25 | Portraits | `16e78f3` | Citizen Sleeper-style faces on the crew list and profiles. | [2026-10-25-portraits](2026-10-25-portraits/) |
| 2026-10-25 | Joss and the street-terminal skin | `386c9b3` | The whole look changes: Rajdhani display font, terminal panels, the week bar, Joss's messages on Today. | [2026-10-25-joss-street-terminal-skin](2026-10-25-joss-street-terminal-skin/) |
| 2026-10-25 | Today home screen | `b806940` | Today replaces Inbox as the home tab; Continue docks to the bottom on phones; scannable job board. | [2026-10-25-today-home-screen](2026-10-25-today-home-screen/) |
| 2026-10-25 | Rookie start | `f61c6e5` | A rookie crew and rookie jobs (Clinic Night); the climb from the bottom. Same era as the owner's desktop inbox screenshot. | [2026-10-25-rookie-start](2026-10-25-rookie-start/) |
| 2026-10-25 | Lantern Bay and the City tab | `41c881e` | City tab with the district map and street talk. | [2026-10-25-lantern-bay-and-city](2026-10-25-lantern-bay-and-city/) |
| 2026-10-24 | Owner captures | (between `f08ee2a` and `41c881e`) | Played by the owner: crew list with a lead, safehouse, planning short-handed vs full crew, an operative after their first job. | [2026-10-24-owner-captures](2026-10-24-owner-captures/) |
| 2026-10-24 | Heat and personalities | `282e3c9` | Heat from loud play, contract renewals, two-part personalities on profiles. | [2026-10-24-heat-and-personalities](2026-10-24-heat-and-personalities/) |
| 2026-10-24 | Freelancers | `c9f8e6e` | Guns for hire on the planning screen; crew-size badge; level-up cards. | [2026-10-24-freelancers](2026-10-24-freelancers/) |
| 2026-10-23 | Operatives develop | `52c42cf` | Potential, growth and the scout's read on crew profiles. | [2026-10-23-operatives-develop](2026-10-23-operatives-develop/) |
| 2026-10-23 | Recruiting and safehouse | `1197449` | Leads, recruiting and safehouse beds on the Crew tab. | [2026-10-23-recruiting-and-safehouse](2026-10-23-recruiting-and-safehouse/) |
| 2026-10-23 | MVP | `974b46d` | The first playable loop: inbox, job board, planning, a mission with crises, the report and the crew list. Plain dark UI, coloured initials. | [2026-10-23-mvp-job-board-and-missions](2026-10-23-mvp-job-board-and-missions/) |

## Screens in a captured set

| File | Screen |
| --- | --- |
| `01-first-load` | What a new game opens on |
| `02-inbox` | The welcome message |
| `03-job-board` | Jobs tab |
| `04-planning` | First job's planning screen, nobody picked |
| `05-planning-crew-picked` | The same with four crew picked |
| `06-crisis` | The first crisis on the job |
| `07-mission-end` | The end of the job |
| `08-report` | The job report in the inbox |
| `09-crew` | Crew tab |
| `10-operative` | First crew member's profile |
| `11-city` | City tab (from 25 Oct) |
| last | `desktop`: the home screen at 1440×900 |
