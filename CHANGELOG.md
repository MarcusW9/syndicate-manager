# Changelog

What changed in each update, newest first. For *why* a decision was made, see the decision log in `DESIGN.md`.

Live build: https://marcusw9.github.io/syndicate-manager/

## 2026-10-24 · Renewal numbers simulated
- Simulated contract renewals and market pricing ahead of building them; results in PLAN-RENEWALS.md. No game change.

## 2026-10-24 · Freelancers
- **Guns for hire:** two freelancers turn up on the board every Monday, generated like recruits (names, roles, stats, traits). Pick one on the planning screen to fill a slot for that job only.
- **No wage:** they take a share of what the job actually pays: rookie 15%, pro 20%, veteran 25%. If the job pays nothing, they get nothing. The job report shows what they took.
- They count toward the crew size (so they cancel a short-handed penalty) and can back someone up. One freelancer per job. They leave after the job, don't use a bed and don't improve.
- The same rules apply to them as to everyone: nobody dies unless you chose "push on".
- Save format v7, with automatic upgrade from v6.
- 8 new tests (78 total).

## 2026-10-24 · Crew list scout line and a crew-size badge
- **Crew list:** each person now has a one-line read under their role: their main stat and where the scout thinks they're heading ("Tech 18 · could be special", "Driving 17 · at their peak"). It's the same opinion as on their page, in a few words, and it can be wrong.
- **Planning screen:** a badge under the crew heading shows what your crew size does to every roll: "4/4 · full crew, no penalty", "3/4 · short-handed: −1 on every roll" (amber), "1/4 · −3 on every roll" (red), or "5/4 · 1 extra: more backup, more people at risk".
- 2 new tests (70 total).

## 2026-10-24 · Level-ups you can see, and crew size that matters
- **Level-up cards** at the end of every job: one card per person who improved, with their badge, each stat's old → new number ("Tech 16 → 17") and a line of flavour. Graduating from rookie to pro gets its own bigger gold card.
- **Live flash during the job:** growth now happens the moment it's earned, so a rise mid-job shows on the spot ("▲ Static: Tech 16 → 17").
- **This season's growth stays visible:** the crew list shows "▲ Tech +2, Combat +1" under each person, and the stats panel shows this season's change in green. Decline past 40 shows in red ("▼ Cool −1"). Both reset at the start of each season. The operative page still shows the smaller "career" change since joining.
- **Backup:** if a second person on the job is within 3 of whoever rolls, the roll gets +1 ("Velvet backs up +1").
- **Short-handed now really hurts:** every roll is −1 for each person short of the job's recommended crew. Before, this only changed the risk label; it was a bug that the rolls ignored it.
- **Bigger squads:** a job's crew size is now a recommendation, and you can bring up to 2 extra people. More backup, but more people away and at risk.
- The risk read uses exactly the same rule as the real rolls.
- Save format v6, with automatic upgrade from v5.
- 11 new tests (68 total).

## 2026-10-23 · Four new jobs, clients, variations and twists
- **4 new job types** with 6 crises each (7 types, 42 crises in total):
  - **Kidnap Rescue** (Old Town, threat 4, ¥7,000): aborting means leaving the hostage
  - **Casino Con** (Night Market, threat 2, ¥4,500): face-led; one crisis is an all-in gamble for +40% pay
  - **Penthouse Heist** (Glass Heights, threat 5, ¥12,000): the big score; the first job that needs an infiltrator
  - **Protection Run** (The Docks, threat 3, ¥4,000): escort a herbalist and her cargo through Red Lantern streets
- **5 recurring clients:** Auntie Fung, Mr. Szeto, The Ferryman, Madam Rao and Ruth Okonkwo. Each offers certain jobs and tracks **trust**:
  - finished jobs build trust; aborts cost a little, and "client unhappy" choices cost more
  - high trust pays up to 15% more; below 20, a client stops calling
  - trust drifts back towards neutral each week
  - the Jobs screen lists every client and their trust
- **Every offer varies:** pay ±25%, and threat ±1, marked "hotter" or "quieter than usual". A hotter job makes every roll one point harder.
- **Hidden twists** on about 1 job in 4: the client lied about the guards, a double-cross, a police tip-off, a rival crew, or an unexpected bonus score. The board usually warns "Intel unreliable", but the hint is sometimes wrong. Aborting because of a twist doesn't cost client trust.
- **Fix:** "bonus pay" choices (the Silver Tongue option on the office job) used to add the bonus even when they failed. Now they only pay out on success.
- **Economy:** a careful player's median cash after 8 weeks rose from about ¥1,900 to about ¥12,100; the share broke by week 8 fell from 41% to 12%.
- `WRITING_GUIDE.md`: how to write new crises and jobs in plain English.
- Save format v5, with automatic upgrade from v4.
- 12 new tests (57 total).

## 2026-10-23 · Stats show trait bonuses; rare 20s
- **Stats panels show the number used on jobs.** Trait bonuses are now included, with the breakdown underneath: Jax shows Combat **17** with "15 +2 Hothead"; Static shows Tech **18** with "16 +2 Chromed". Penalties show in amber (Jax's Cool "7 −2 Hothead").
- **Planning screen** key stats include trait bonuses too, marked with *.
- **Stats with traits are capped at 20,** the top of the scale.
- **A 20 is now possible:** about 1 in 50 rookies has a ceiling of 20 in their main stat. Previously 19 was the most anyone could reach.
- 2 new tests (45 total).

## 2026-10-23 · Operatives develop
- **People get better by working.** Making a roll in a crisis (even a failed one), watching someone else make one, and finishing jobs all build towards +1 in a stat. Each person also practises their own speciality on every job they finish.
- **Hidden potential:** everyone has a ceiling they can't pass. Rookies have the most room (their main stat can reach 14–19), pros some, veterans almost none.
- **Age matters:** under 25 learns 1.5x faster, 35+ at half speed. Everyone gets a year older each new season; past 40, stats start to slip.
- **Mentoring:** a rookie on a job with Teo (or any veteran) learns 1.5x faster. The planning screen tells you who's learning from whom.
- **Graduation:** a rookie who reaches 15 in their main stat becomes a pro, still on a rookie's wage.
- **Scout's view** on every recruit, in words ("Wheels reckons Ivy will be better than most pros…"). It's an opinion and is sometimes wrong.
- **Operative page:** tier (rookie/pro/veteran), a Development read, and green/red numbers beside stats showing change since joining.
- The job report lists who improved.
- Save format v4, with automatic upgrade from v3.
- 13 new tests (43 total), including simulations of a rookie's first season.

## 2026-10-23 · Save slots, backups and Ironman lock
- **3 save slots** on the Save screen: Play, New and Delete. The existing save moves into slot 1 automatically.
- **Difficulty picker for new games:** Story, Standard or Ironman. These were previously unreachable; every new game was Standard.
- **Automatic weekly backup** per slot, taken at the start of each in-game week, with a **Restore** button. Not available on Ironman.
- **Backup reminder:** an Inbox banner and a Save-screen note when you haven't exported for 28 in-game days. Exporting resets it.
- **Ironman lock:** loading an older copy of an Ironman run is refused, so deaths stick. A run this browser has never seen can still be loaded (to move devices).
- 9 new tests (30 total).

## 2026-10-23 · Recruiting and safehouse expansion
- **Scout leads every Wednesday:** one generated recruit, or two if you're short-handed (fewer than 4 crew). Leads go cold after 7 days.
- **Recruit page:** stats, traits, origin, personality and wage demand. **Hire** (pay one week's wage as a signing fee), **Haggle** once (your best talker rolls; success cuts the wage by 15%), or **Pass**.
- **Roster cap:** 8 beds to start. **Expand the safehouse** for +2 beds: ¥10,000, then ¥20,000, ¥30,000 and so on, with rent +¥1,000/week each time.
- **Generated recruits:** about 60% Hong Kong Chinese, the rest from five other communities; always 18+; rookie, pro or veteran quality; wages ¥450–750. Roles the crew is missing turn up more often.
- **New role:** infiltrator (stealth specialist).
- Save format v3, with automatic upgrade from v2.
- 11 new tests (21 total).

## 2026-10-23 · Heat cools down
- Heat now drops every Sunday: by 1 normally, or by 3 after a quiet week (no job started since Monday).
- The Sunday settlement message reports how much heat cooled.
- New test covers cooling and checks heat never drops below zero (10 tests total).

## 2026-10-23 · Tests and crew badges
- **Automated rule tests** (`npm test`, 9 tests). They run on every push, and GitHub won't deploy if one fails. They check:
  - nobody dies unless the player chose "push on" (3,000 simulated missions)
  - aborting always brings everyone home, and Story mode never kills anyone
  - all content is valid, with no unfilled `{placeholders}`
  - old saves upgrade, and bad or newer save files are refused
  - money stays within a sane band over a month of careful play
- **Crew badges:** coloured initials for each operative on the crew list, operative page, planning screen and mission header. Fallen operatives appear greyed out on the wall. These are placeholders until portraits exist.
- **Balance finding, not yet fixed:** heat only goes up, and careful play slowly loses money. See Open questions in `DESIGN.md`.

## 2026-10-23 · 12 new crises
- 6 crises per mission type (18 total). Run variety goes from 1 combination per job to 15 or more.
- New choice types: certain (no roll), failure costs (heat or pay instead of injury), bonus pay, trait-gated options.
- "Someone" is capitalised correctly when no operative fits a role.

## 2026-10-23 · Job board and missions
- Weekly job board: three opening jobs, new offers every Monday.
- Planning screen: pick crew and approach, with a risk read (label plus reasons).
- Missions: tap-through beats, crisis decisions with risk labels, critical state (stabilise / extract / push on), permadeath, wall of the fallen.
- Save format v2, with automatic upgrade from v1.

## 2026-10-23 · Project start
- Vite + plain JS skeleton, iOS-ready structure (logic, UI and saves kept separate).
- Five starting operatives, traits, three mission templates.
- Day ticking, weekly wages and rent, save / export / import.
- Hosted on GitHub Pages with auto-deploy.
