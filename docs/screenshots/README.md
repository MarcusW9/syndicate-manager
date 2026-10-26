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
