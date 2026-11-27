# Review: the 2026-11-26 game-design research, turned into a plan

Written 2026-11-26, a fresh read of the research from the same day. Planning only: no game code changed, nothing decided.

**Where the research lives.** When this was written the notes were on the unmerged branch `claude/inspiring-mccarthy-tz3ojz`; they reached `main` in #261. The corrections in section 1 were applied to the notes on 2026-11-27 (changelog), except 1g, which is about a mockup. Code line numbers below are from `main` (95e508e); the files they point to are the same on both branches.

**What "trip" means here.** A crew sent away from home for several days on an **expedition** (the tong's own errand: a weapon, cash or a recruit, 4 to 6 days, no client or pay) or a **security post** (a client's guard or escort contract, usually a week). The game uses the word too (Jobs › Trips on the research branch, "trip report"). Hands-off jobs and side tasks also send people off but are *not* trips in this review: hands-off jobs run on the main job code and side tasks keep their growth, so both already say who improved.

**The lens.** The owner's direction: the core feeling is roster members getting stronger and customised, and sending them off meaningfully, so they grow and also get something done. Touchstone: AC Brotherhood's recruits. Depth from who a person becomes, not from more menus.

---

## 1. Mistakes in the research

Each item: the claim, the evidence, the fix. "Note" means the file under `docs/research/` on the research branch.

### 1a. The biggest one: trips barely grow anyone, so "say who grew" has almost nothing to say

- **Claim** (`ac-brotherhood-recruits.md` section 3, and the `trip-growth` mockup): the gap is only that trips throw away what `gainXp` returns. The mockup shows Vector going Social 9→10 and Tech 6→7 on one six-day trip.
- **Evidence.** An expedition gives each runner 1 raw point a day (`data/expeditions.js:42 xpPerDay: 1`), only on the middle days (`core/expeditions.js:155-168`: day 1 opens, the last day closes, a find day skips the roll). A post gives 1 a day (`core/contracts.js:51`). A point costs `(stat + 4) × 4.25` (`core/development.js:48-56`): about 55 raw for a stat of 9, 76 for 14. A main job gives 2 per key stat plus 4 per roll and 1 per watched roll (`development.js:25-28`). I ran 200 seeds with two founders, banked progress spread evenly below the next point: **a six-day expedition raised any stat for anyone 5% of the time (2.5% per runner); a week on a post 10%.** (A throwaway script calling the real `gainXp` on `createNewGame` founders, four rolling days a trip with a random goal stat, seven days of one stat a post; not committed. A real sim should replace it in build 1.)
- **Fix.** The gap has two halves: trips don't say who grew, and trips almost never grow anyone. The note should say both. The mockup's numbers are labelled illustrative, but they promise a feeling the numbers can't give today. Section 5 makes this build 1.

### 1b. Trips skip everything that makes "who a person becomes"

- **Not claimed wrong, but missing, and it changes the ranking.** An expedition's or post's fight returns before the job counters (`core/mission.js:1004-1005` return before `:1097 jobsWithCrew` and `:1246 afterJob`). So a trip never counts toward: level-ups and skills (`core/levelup.js:21`, keyed on `jobsWithCrew`), earned traits including Synergy (`core/earned.js afterJob`), the crew's tattoo (`core/marks.js:38`), loyalty (`core/loyalty.js:24`), or veteran (`development.js promoteVeteran`, 50 jobs). The AC note's "Already ours: growth ... skills to learn at a level-up, earned traits" is true for main jobs only.
- **Fix.** Add a line to the AC note's section 3: trips grow stats only (and barely); levels, traits, marks and loyalty come only from main jobs.

### 1c. "Odds shown in words" is not true for expeditions

- **Claim** (AC note section 3: sending off "each with odds shown in words"; FM note point 3: "We already write reads in words (`core/risk.js` ... no percentages)").
- **Evidence.** The expedition plan says "About 41% to get it" (`ui/expeditions.js:102`). Hands-off orders' reasons also use percentages (`core/autorun.js:21 pct`). `core/risk.js` words are for main jobs.
- **Fix.** Say "main jobs read in words; expeditions show a percentage". This is also a real conflict (section 3): Brotherhood's lesson leans on a number you can push.

### 1d. Scouting: a better scout does not give a closer read of our own recruits

- **Claim** (FM note section 3: our read is FM's stars-versus-ability "done in words"; points 1 and 2 left as open checks).
- **Evidence.** A recruit's `scoutError` is rolled once when the recruit is made (`core/recruits.js:125`, `rollScoutError` at `development.js:144`), with no input from who is scouting. `scoutFor` (`development.js:153`) only picks whose name goes on the read. Two equal recruits can read differently from the same scout, and a better scout is no closer. Rival runners are different: `core/dossier.js:85 scoutErrorAt(state, card, level)` does get closer with scouting level.
- **Fix.** Answer the two open checks in the FM note: "No, for recruits (error per recruit, not per scout); yes, for rivals (scouting level)."

### 1e. Hands-off reports already say why they pulled out

- **Claim** (comparators point 14: "Each report should say why it stopped or pulled out, in one line").
- **Evidence.** `core/autorun.js:54-79` gives every choice a `why` ("Nothing on the table had good enough odds, so they pulled out." / "Pulling out cost less than the risk of staying."), stored as `am.nextWhy` (`:168`, `:180`).
- **Fix.** Mark point 14 as mostly done; the open part is only whether that line reaches the top of the report.

### 1f. "The ceremony" is the oath, not a promotion

- **Claim** (AC note point 7: "Our veteran promotion and the Hall of Legends could be one too (the runner's page header already has 'the ceremony')").
- **Evidence.** The header's button is "Hold the ceremony" for swearing someone in (`ui/crew.js:443`, `core/oath.js`). Veteran promotion has no scene.
- **Fix.** "The runner's page already has a ceremony for the oath (`core/oath.js`); a promotion could borrow it."

### 1g. The trip-growth mockup's plan block

- **Claim** (`2026-11-26-trip-growth.html`, The Plan): each picked runner "GROWS: SOCIAL, TECH" or "GROWS: STEALTH"; "anyone with a mentor along learn[s] faster".
- **Evidence.** Each day's stat is drawn from the goal's list and everyone on the trip learns it (`expeditions.js:164,168`): a runner doesn't grow only their own stats. Mentors speed up rookies only (`development.js mentorsOf`, "Rookies only").
- **Fix.** The block should say "This trip teaches: stealth, social, tech, combat, to everyone on it", then per runner only who is close to a point or a tier; and "a rookie with a veteran along learns faster".

### 1h. Battle Brothers: crises can be turned off

- **Claim** (FM/BB note section 2): late-game crises "cannot be turned off, though difficulty and the first crisis can be set at the start", "around days 50 to 100".
- **Evidence.** The developers' Dev Blog #92 lists the crisis as a start option, and an early-access patch added a "no late game crisis" option for new campaigns ([Dev Blog #92](https://battlebrothersgame.com/?p=18285), [RPGWatch thread](https://rpgwatch.com/forum/threads/35168/unread)). I found no source for "days 50 to 100".
- **Fix.** "A crisis can be picked or turned off when a campaign starts; players who leave it on cite it as the spike." Drop the day range or mark it unsourced. The lesson (point 6) stands.

### 1i. Battle Brothers: mood is per brother

- **Claim**: "Company mood falls with deaths, hunger and unpaid wages."
- **Evidence.** Mood is kept per brother (each has their own mood state); the "up to 30%" figure is from the Sevastromo review, fine as cited.
- **Fix.** "Each brother's mood falls with ...". Small, but it matters for us: per-runner morale is what we have too.

### 1j. Wildermyth: rivals' bonus is narrower than "more critical hits"

- **Claim** (DD/W note section 2): "two heroes who dislike each other score more critical hits, trying to outdo each other" (sourced only "review via search").
- **Evidence.** The Wildermyth wiki: after your rival lands a stunt (Wildermyth's critical), you get a bonus to stunt chance, +25% at the first level up to +100% at full Rival, lasting until you land one ([Relationship](https://wildermyth.com/wiki/Relationship)).
- **Fix.** Replace with the wiki's wording and source. It suits us better than the vague version: it is a trigger ("when my rival does X, I get Y"), which is exactly the hook style of `abilities-and-builds.md` section 2.

### 1k. AC Brotherhood: "they can die on a failed contract" is unverified

- **Claim** (AC note section 1, general knowledge): "A failed contract can lose a recruit."
- **Evidence.** Two searches found that contracts show a success chance and recruits reach level 10 and an initiation ([GamePressure contracts](https://www.gamepressure.com/assassinscreedbrotherhood/assassins-contracts-p-1/z82a1d), [Softpedia](https://games.softpedia.com/blog/Assassin-s-Creed-Brotherhood-Diary-Farming-and-Growing-Your-Assassins-168700.shtml)), but no source on what a failed contract does. It's widely remembered that recruits can die there; it should stay marked as general knowledge. The rest of section 1 checked out (levels 1-10, a ceremony at 10, a shown percentage).
- **Fix.** None needed beyond keeping the "general knowledge" label. Lesson 5 (losses hurt) doesn't depend on it.

### 1l. Smaller fixes

- **Broken link** (FM/BB note sources): `https://en.wikipedia.com/wiki/Battle_Brothers` should be `en.wikipedia.org`.
- **FM's inbox redesign**: the Dexerto piece is about FM25, which was cancelled; the redesign shipped in FM26. Say "the FM26 redesign (first announced for FM25)".
- **Guildmaster Simulator's Steam app** (comparators section 1): the note says 5270710; a search finds a playtest of that name at [app 5338710](https://store.steampowered.com/app/5338710/). Check against what the owner shared.
- **Guild Management Simulator** (comparators section 5): I could not find a Steam page by that exact name or app 5009000. The note is from patch notes the owner shared, so it stays; add "(store page not re-checked)".

### What checked out

Code claims I verified and found right: `gainXp` thrown away at `expeditions.js:168` and `contracts.js:205`; side tasks keep it and send a graduation message (`sidetasks.js:179-189`); hands-off jobs report growth (`mission.js:1112,1209`); `SEEN_KEEP` 16 (`advlog.js:93`); Synergy +1 cool (`earnedTraits.js:41`); Burned Out from tech failures; the Canteen; "Morale (after Battle Brothers)" (`battle.js:374`); hands-off never push on (`autorun.js:5`); expeditions and posts are no-freelancer and keep the death rule; the saves (three slots, weekly backup not for Ironman, 28-day reminder, `awayJobs` from v17); the broke bands (35% in `rules.test.js` and `startcrew.test.js`, 10% in `founders.test.js`); real-time expedition timers rejected (design log 2026-11-21); Ironman is opt-in (`createNewGame` defaults to `standard`). External claims that checked out: Darkest Dungeon's stress at 100 and quirks treated or locked in town; Wildermyth's relationship levels; FM's CA/PA and stars from staff.

---

## 2. What the notes agree on

| Lesson | Backed by |
| --- | --- |
| **Show growth plainly, in steps.** The player must see someone get better, every time, in few named steps. | AC Brotherhood (levels 1-10, a points choice each return), BB (talent stars), DD (stress as a number), GMS (careers, "explain the numbers"), XCOM 2 (ranks; see section 3) |
| **Show risk before the choice, and let the player move it.** | AC Brotherhood (a percentage you push with more or better people), KoDP (complaint: "hides a lot of information"), GMS ("one forecast"), BB (complaint: crises), DD (the defenders: planning beats the dice) |
| **Losses should hurt, but replacing people must not be a grind.** | BB ("devastating", constant saving), DD ("constant influx of new heroes"), AC (the one you grew), Wildermyth (a death is a scene) |
| **Repetition kills long runs.** | Wildermyth ("events are starting to repeat"), DD ("fantastic for the first twenty hours"), Fallout Shelter ("repetitive after a while"), KoDP (praised for a large event pool) |
| **No crisis out of nowhere, and no choice that is only for show.** | BB (late crises), KoDP ("just for show", early death spirals), GMS (early payroll protection) |
| **People are the stories: traits, partners, scars, history.** | Wildermyth (hooks read traits and relationships), DD (quirks, afflictions), FM (promises, morale), Majesty and Fallout Shelter (the small lines are what players remember) |
| **Sending people off is the draw, in short check-ins.** | Fallout Shelter, AC Brotherhood, GMS (timed expeditions, auto-repeat), Majesty (autonomy is the product) |
| **The fight must be worth watching, or skippable.** | Fallout Shelter (most criticised part), Wildermyth (split), GMS (quiet toasts for repeats) |
| **Explain what a number does, on tap.** | GMS (added repeatedly), KoDP (tutorial complaints), FM (players read the words over the stars) |
| **Hands-off runs need clear stop rules and a smaller, shown reward.** | GMS (auto-repeat stops and says why; reward cut shown), Majesty (readable incentives, not more control) |

---

## 3. Gaps and conflicts

### Conflicts

1. **Darkest Dungeon's strain versus our death rule.** DD's best idea is a breaking point that can go either way, and its cost is that a bad roll can wipe your best. The notes already land it right: a breaking point may cost a job, a choice or a trait, never a life. But it also must not cost the player's control on cautious or steady orders without warning (Sigman's own warning). Rule to keep: a strain check is shown before the job ("Mei is near the edge: a hard job could break her, or make her"), and it never acts on a hands-off crew's choices.
2. **FM's hidden ability versus "show growth plainly".** These don't really conflict once split: keep the *ceiling* hidden and read by a person (FM), show the *growth that happened* exactly (Brotherhood). The fuzz belongs on the future, never on the past. Today we do both, but trips break the second half (1a). And our fuzz isn't FM's: a better scout isn't closer (1d), so the "who is judging" idea has nothing to bite on yet.
3. **Words versus a percentage.** Main jobs read in words; the expedition plan shows "About 41%". Brotherhood's feeling is a number you push up by sending more or better people. Pick one on purpose: words with a visible step ("Fair → Good with Lychee") would keep the house style and still show the push. An owner call.
4. **Trips that grow versus main jobs that grow.** If trips start growing people properly, they compete with main jobs as the way to level someone up. Brotherhood answers this by making the trip the training ground and the main mission the payoff (calling them in). Ours should too: trips teach a little and safely; main jobs teach more and earn levels. That has to be set by a sim, not guessed (the pace sims and the veteran timing in `development.js:37-41`).
5. **Visible strain versus "never hide crises" and calm short sessions.** More warnings on the card (DD) can turn Today into a wall of red. The desk's rule (decoration only where attention is needed, design log 2026-11-24) should decide where strain shows.

### Missing comparators, best first

- **XCOM 2: War of the Chosen, covert actions.** The closest thing to "send them off and they grow" that isn't Brotherhood: soldiers go on timed off-screen jobs, come back with a rank or a stat boost, and the risk (ambush, capture, wounds) is shown and can be bought down with an extra soldier or resources ([GamePressure](https://www.gamepressure.com/xcom2/covert-actions/zba109), [capture](https://www.gamepressure.com/xcom2/capturing-and-rescuing-captured-soldiers/z3a10a), [XCOM wiki](https://xcom.fandom.com/wiki/Soldier_(XCOM_2))). Also soldier bonds: two soldiers who fight together form a bond with abilities. Worth its own note.
- **Football Manager's loans.** In our own stated model, sending a young player out on loan so they grow is the exact feeling, with monthly loan reports and a player who comes back better or not. The FM note doesn't mention it. From general knowledge; worth a sourced section in the FM note.
- **Wartales.** A mercenary-company game with jobs, wages and relationships that change fights; sits between BB and Wildermyth. Lower priority.
- **The session's suggestions.** Crusader Kings 3: its stress and traits overlap DD's, useful only for "events read the person's traits". Sunless Sea: text-first and on the sea, but the roster is thin; skip. Frostpunk: no roster; skip.

### Other gaps

- **Nobody has measured how much a trip grows people** until this review (1a). Every lesson about trips rests on it.
- **The notes don't say what a runner sent only on trips misses** (1b): no levels, traits, marks, loyalty or veteran miles.
- **No note on relationship traits beyond Synergy**, though both Wildermyth and XCOM 2 point at it.

---

## 4. Ranked candidates

Serves the feeling: high, medium, low against the owner's direction. Size: small (a day or less), medium (a few days), large (a week or more). "Save" means the state shape changes (`SAVE_VERSION` bump and a migration).

| # | Change | Backed by | Feeling | Size | Touches |
| --- | --- | --- | --- | --- | --- |
| 1 | **Trips say who grew**: keep `gainXp`'s result on expeditions and posts; the report lists rises; a graduation (and a wall) gets the side-task message and history line. The known gap. | AC 4.1, 2g, GMS careers | High | Small | `core/expeditions.js:168`, `core/contracts.js:205`, report UI (`ui/expeditions.js`, post report); save: a growth list on each trip entry (bump, plus `repairCrewsOut` default); tests |
| 2 | **Trips grow people enough to notice**: tune `xpPerDay` (and the post's) so most trips raise someone, set by a sim against main jobs' pace. Without it, #1 is mostly empty. | 1a here; AC 2.2 | High | Small code, medium tuning | `data/expeditions.js:42`, `core/contracts.js:51`; a sim script; pace tests; design log row |
| 3 | **Trips count toward who they become**: a finished trip counts toward level-ups (and so skills), and can earn a trip-shaped trait. | 1b here; AC 4.6, Wildermyth, XCOM 2 | High | Medium | `core/mission.js` / `levelup.js` (a trip count beside `jobsWithCrew`, or count trips in it), `core/earned.js` (a trip hook like `afterJob`), `data/earnedTraits.js`; save; tests (death and pace unchanged) |
| 4 | **The plan says what a trip teaches and who is close** (a point, a tier): the trip-growth mockup's plan block, with 1g's fixes. | AC 4.2, 4.3, BB 4.9 | High | Small | `ui/expeditions.js`, post planner; a pure helper in `core/development.js` (points to the next rise); no save |
| 5 | **Odds you can push, shown as you pick** (adding a runner moves the read). | AC 4.4, GMS one forecast | Medium | Small | `ui/expeditions.js`, `core/squad.js`; owner call on words vs percent (section 3.3) |
| 6 | **The report ends on the people** (who grew, earned, got hurt), not the prize; quiet days as short filler lines. | AC 4.5, 2g | Medium | Small | report UI, `src/data/advlog/` |
| 7 | **Joss notices trip growth on the next main job** ("Since the docks trip..."). | AC 4.6, Wildermyth 4.6 | High | Medium | `core/mission.js` lines, `data/` line pools; needs #1's stored growth |
| 8 | **A rival-style relationship trait**, written as a trigger (Wildermyth's stunt rule), formed on jobs or trips. | DD/W 4.5, XCOM bonds, 1j | High | Medium | `data/earnedTraits.js`, `core/earned.js`, fight hooks in `core/fight.js`; tests for the no-pairs rule |
| 9 | **A breaking point that can go either way** (strained runner, shown before the job; most get a setback trait, a few a lasting good one). Inside the death rule. | DD 4.2, 4.3 | High | Medium | `core/earned.js`, `core/time.js` (strain), planning read, Today; save maybe; death-rule tests |
| 10 | **Show the strain land**: a report line when someone comes back shaken; a word on the card near the edge. | DD 4.1 | Medium | Small | report UI, crew card |
| 11 | **The ceremony for veteran**, borrowing the oath's scene. | AC 4.7, 1f | Medium | Small | `ui/crew.js`, `core/development.js promoteVeteran` message |
| 12 | **Scout quality matters** for recruits (a better scout, a closer read; the read says how sure). | FM 4.1, 4.2, 1d | Medium | Medium | `core/recruits.js:125`, `development.js`; save (error per scout read) |
| 13 | **Recruit page says where growth lies**, in the scout's words. | BB 4.9 | Medium | Small | `core/recruits.js`, recruit UI |
| 14 | **A lasting mark on the face** from a scar or a trip. | DD/W 4.8 | Medium | Medium | `core/marks.js`, art |
| 15 | **Today's crew panel as a row per crew**. | 2g | Medium | Small | `ui/today.js`, `ui/outrows.js` (research branch) |
| 16 | **A watchable day uncovered by a lead**. | 2g | Medium | Medium | `core/expeditions.js`, the long-jobs watch setting |
| 17 | **The report's log as the rail** (days-out-log look 2c). | 2g | Low | Small | report UI |
| 18 | **Promises** (a runner asks, you agree, the run remembers). | FM 4.5 | Medium | Large | `core/loyalty.js`, inbox; save |
| 19 | **Paid recovery for a setback trait** (a doctor, a week off with pay). | DD 4.4 | Low | Small | `core/earned.js fade`, a hall or inbox action |
| 20 | **Repetition across trips and seasons**: measure it, grow the pools. | DD/W 4.7, comparators | Medium | Medium | `core/advlog.js` (seen list per tong, not per trip), a sim |
| 21 | **A recap after a long break** (what's out, who's hurt, what's owed). | Comparators 9 | Low | Small | Today |
| 22 | **A way out shown when broke**. | Comparators 3, 7 | Low | Small | Today, Joss's lines |
| 23 | **A tong-level record** (best season, longest-serving runner, biggest job). | FM 4.10 | Low | Small | Book / Tong tab |
| 24 | **Reward matches risk, visibly**. | BB 4.7 | Low | Small (audit) | planning read |
| 25 | **Every stat and tag explains itself on tap**. | GMS, comparators 15 | Low | Small (audit) | runner's page |
| 26 | Already done or keep as is: safe defaults, Ironman opt-in, no paid shortcuts, inbox stays home, hands-off stop reasons (1e), crews-out save repair, no real-time timers. | Comparators 5, 6, 12, 13, 14; FM 4.4, 4.8 | — | — | — |

---

## 5. The next three builds

**1. Trips that grow people, and say so (rows 1 and 2 together).** This is the owner's feeling at its plainest: send someone off, they come back better, and the game tells you. Today it fails twice: the growth isn't reported, and at 1 raw point a day against a cost of 50 to 80 a point, it almost never happens (5% of expeditions, 10% of post weeks). Building only the report would ship a block that is nearly always empty. So: keep `gainXp`'s events on the trip entry (a save bump, with `repairCrewsOut` defaulting the list), report them with the side-task graduation message, then raise the per-day growth until a sim says most trips raise someone, while staying below a main job's growth so main jobs stay the bigger teacher. Core stays pure; the sim uses the seeded rng; no death-rule change. Use the trip-growth mockup's look A (lines under the outcome) first: it's the smallest and reads like the rest of the report. Owner call: how much a trip should grow relative to a job.

**2. Trips count toward who they become (row 3).** Stats are the shallow half of Brotherhood. The owner wants depth from who a person becomes, and today a runner sent only on trips never levels up, never earns a trait, never gets the crew's mark, and gains no loyalty, because those all count main jobs (`mission.js:1004-1005` returns before them). Count a finished trip toward level-ups (perhaps at a lower weight) and add a trip hook to earned traits with two or three trip-shaped traits to start (something a long weapon hunt makes of you; a pair who came back together forming Synergy). This is where "sent off meaningfully" stops meaning "sent off for numbers". It touches the save shape and `levelup.js`; tests should hold that level-ups still need a skill ready and that nothing here can kill anyone.

**3. The plan says what a trip makes of them (rows 4 and 5).** Brotherhood's bet works because you choose who to send and you see why. Under Who goes, say what the trip teaches (to everyone on it), mark who is one point from a rise or close to pro, and show the read move as you add someone. That makes picking a crew a choice about who they'll become, which closes the loop builds 1 and 2 open. Phone first, 44px picks, the reason on tap. It needs one pure helper (points to the next rise) and the owner's call on words versus a percentage on the expedition plan, which today is the only place that shows a percentage.

Next after these, in order: Joss noticing on the next main job (row 7), then the rival trait as a trigger (row 8).

---

## Questions only the owner can answer

1. How much should a trip grow someone compared with a main job? (A sim can set it once you pick a ratio, say a six-day trip is worth about half a job.)
2. Should trips count toward level-ups and traits at all, or stay "stats only" so main jobs keep that role?
3. On trip plans: words like main jobs, or keep the percentage because Brotherhood's push is a number?
4. Should the research branch (`claude/inspiring-mccarthy-tz3ojz`) be merged first, so these builds and the note fixes in section 1 land on top of it?
