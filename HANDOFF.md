# Handoff · 2026-11-05

Where the project stands and what to pick up next. Read `CLAUDE.md` first: its rules (architecture, tests, design log, changelog, screenshot log, commit author) are not repeated here. `DESIGN.md`'s decision log (rows under `docs/design/`, newest file `2026-11.md`) has the why for everything below.

## State

- **`main`:** up to [#80](https://github.com/MarcusW9/syndicate-manager/pull/80) (the plan bar beside the job list; #78 was City as the command centre, part 1). PRs are squash-merged; one PR per feature, the owner merges.
- **The tong direction** (DESIGN.md 2026-11-04 onwards; backlog in `drafts/ops-and-presence.md`): the player runs a tong (堂, a hall; ranks Back Room → Street → District → City → Harbour by reach). **Phase 1 is built and playtested** (#62-#75): hands-off on every job with call-ins day by day (`core/away.js`), Take Command as the option; jobs of 1-4 days and a board that grows with the roster (`core/jobs.js`); routine work (the week's first offer, and most of a bigger tong's extras); the week as the rhythm (due Sunday in the top bar, Monday briefing, Sunday summary, `core/week.js`); crew standards and crew leads (`core/lead.js`); crews out you can see (send-off, crew-out and back cards on Today); Joss suggests the cheapest crew they trust, and the picker sheet says what a job gives each runner (`core/worth.js`). Tuning: `scripts/sim-tong.mjs` (a player running every crew) beside the fame sim's cash band.
- **The playtest (owner, 2026-11-05):** call-ins about right; Take Command nice to have; outcomes readable; money fine (the parked board tweak is dropped); Today busy. **Not yet happening:** "the cheapest crew I trust" (the owner sent the best) and the bench mostly sat. Lean picks (#75) are the first answer; **districts as presence** is the next.
- **Now:** the tong's Phase 2, from the command-centre mock-up (`drafts/prototypes/command-centre.html`): halls (#76), heat per district (#77), City as the command centre, part 1 (#78) **police raids on the halls** (#81, save v40, `core/raids.js`), **the command centre's map, part 2** (#82, `ui/citymap.js`) **gang raids** (#83, save v41, `core/gangs.js`: grudges from jobs against a gang, raids on its own turf, settlements) **a hall map per district** (#84, `data/sites.js` HALLS) and **the landmarks beside the halls and raids** (this slice, `app.js hallMark`) are built; next in Phase 2: **building up a hall** (`drafts/PROPOSAL-hall-building.md`, slices 1a-1c and 2a-2b, then the turret; 1a, the grid and defence pieces with save v42, 1b, the build screen, and 1c, defences lowering a raid's threat (strong: 6 pieces hold every raid up to heat 10; tune `HALL_BUILD.perThreat` after the playtest), and 2a, rooms (clinic, bunk room, canteen, stash, lookout), and 2b, the den and the cyber doc, are built; and 3, the auto turret, are built; hall building is done to the plan: open, a workshop and raids damaging what's built, if play asks), then an opening job per district (built, save v43); after the balance pass, rents halved, raids a little likelier, halls can be bought, and a work board room brokers outside work (save v44; Next, item 0).
- **The squad run is the game** (`PLAN-CORE-LOOP.md`): slices 1-6 are built, including **command fights** (6c: orders each round, fight spots and cover in every district, the fight screen; on a phone the map is pinned on top with Go in a bottom bar, #59).
- **Renown** (`drafts/PROPOSAL-runner-renown.md`, read its "Review decisions" first): slices 1-4 built (runner record v30, milestones and highlights v31, fame / standing / paths / pro-to-veteran v32, named offers / fame pay ask / better recruits v33). **Slices 5-6 are not built** (the defining job that makes a Legend, then retirement and the hall).
- **Finished plans:** `PLAN-RENEWALS.md`, `PLAN-PERSONALITY.md` (all steps). `PLAN-PROGRESSION.md`: steps 0-1 done, step 2 mostly covered by earned traits, stat unlocks and the runner record; step 3 (relationships) not built.
- **Design review:** `STATE-OF-PLAY.md` is a 2026-10-26 snapshot; the owner's calls on it are in the file and in DESIGN.md.
- **New games start with three founders picked from six** (`startCrew: 'pick'`, `chooseFounders`). Most rule tests still use the five-rookie `'fresh'` crew as a fixture.
- **Tests:** 587 passing in 57 files (`npm run test:fast` while working; `npm test`, about 2-3 min, before every push). **Save format v41** (v41: gangs' grudges and gang raids; v40: raids on the halls; v34: the tong rank; v35: away jobs day by day with call-ins; v36: an offer's own days; v37: the week's start and crew leads; v38: halls; v39: heat per district; DESIGN.md 2026-11-04/05). **`CODEMAP.md`** says where things live; **`docs/ARCHITECTURE.md`** has state shapes, saves and the economy loop.

## What the 2026-11-04/05 sessions did

- **The tong, Phase 1** (#62-#64, #69, #73, #75) and **Phase 2 so far** (#76-#78): see State and Next 0.
- **The job plan, shorter and clearer** (#70, #71, DESIGN.md 2026-11-04/05): the client's background on tap; "What they'll likely meet" grouped by when it happens, one line a row, with "was high" when a change moves a risk; the crises card folded into the plan bar; the plan bar names what sets the risk, Joss's reason in one line, and **Try** chips that apply one change; the orders fold to one line; empty outside slots are chips; the brief folds after the first read. About 30% shorter on a phone.
- **Joss's voice** (#72): new lines, and the voice in canon (`WORLD.md`).
- **Content:** 35 new jobs (#65, #67), six new street-cast people; the lore review prompt (`docs/lore-review-prompt.md`, #66).
- **Encounter read in plain words** (#74): "→ low, improved by Siphon".

## What the 2026-10-28 to 2026-11-04 sessions did

- **Looks:** gun looks, faces with their own anatomy, career marks, Shaolin monks; every sidearm rolls its own strengths (aim, damage, pierce).
- **City:** the living City map with a picture per district (`ui/citymap.js`, `ui/districtArt.js`).
- **Fights:** battles (6a/6b), then command fights in every district, gear shown in the fight, faces on the fight map, the fight camera framing everyone, a compact orders panel, and the phone layout.
- **The job screen:** the job takes the whole screen (tabs step aside), the map fills the height, the feed keeps up, a finished job keeps its view.
- **Traits as chips** with icons, and Synergies (was Crew Anchor).
- **Renown slices 1-4** (above), and Elite made rarer (60 jobs at level; Lifers 120).
- **Tools:** a job checker (`node scripts/check-job.mjs <file>` / `--all`), `/add-job`, a prompt for drafting jobs outside a session (`docs/new-job-prompt.md`), the `add-lore` skill for canon changes, `docs/ARCHITECTURE.md`.
- **Rules:** walking away from a decision pays nothing (`exitRun`).

## Earlier: what the 2026-10-26/27 session did

- **Design review** (`STATE-OF-PLAY.md`) and the owner's calls: money pressure mostly positive (gear, rooms, clinic bills, tea money); morale cut for mood traits; burnout removed; neural load wired; approaches cost different things; heat per district; relationships as bonds and rifts with grief by personality; repetition layers; competing clients and danger parked. **None of these is built yet** except what slice 1 needed.
- **The core loop rethought:** manager first, with call-ins; build a squad for one of four approaches; incidents handled by the team; saves (overwatch, teammates); alert; specialisations (gear to try, experience to unlock, the player picks); guns standard in the canon (`WORLD.md`).
- **Prototypes** (`drafts/prototypes/`, published as artifacts): v1 plan-watch-report, then v2 with the squad board, coverage read, incidents, saves, alert, standby and an animated site-plan watch screen. The owner called v2 "pretty damn cool".
- **Slice 1 in the game:** `src/data/approaches.js`, `src/data/incidents.js`, `src/core/incidents.js`; `core/mission.js` gains zone and incident steps and `am.pending` decisions; `core/autorun.js` gains `autoStep` and `needsPlayer` (one stepper for live and hands-off runs); planning has four approaches, overwatch and "Call me in…"; the mission screen steps with Next. `tests/incidents.test.js` guards the rules.
- **Slice 2 in the game:** `core/squad.js` (coverage read, Joss's picks), `core/feed.js` (a run's events as watch cards), `ui/board.js` (dossier board, picker sheet, coverage), `ui/siteplan.js` (generic site plan and its animations) and `ui/watch.js` (the timed feed; while a job runs, `app.js` hands it each new state instead of re-rendering). Zones are recorded as events. Tests: `tests/squad.test.js`, `tests/feed.test.js`.
- **Slice 6a in the game:** an unsaved danger incident starts a fight (`am.battle`, a `battle` step in the queue, `runBattle` in `core/runbattle.js`); call-ins `door` (death's door: pull back, standby rescue, keep fighting = push on via `am.untreated`) and `standoff` (after round 3) go through `describePending`/`resolvePending`; orders in fights live in `data/battle.js` `orders`. The planning read runs `battleOdds` (the same round function, fixed seeds, cached). Tests: `tests/battle.test.js`.
- **Slice 3 in the game:** Wheels (optional; takes every driving roll from the van) and standby (called in at max alert, where the alert stays up and they get a second save, or to rescue the badly hurt). Standby joins by being added to `am.crewIds`. Tests: `tests/standby.test.js`.

## Agreed rules worth remembering

- **No death without the player's choice**, now also: hands-off crews always extract; side tasks cost at most a light injury, heat or a day held; **incidents never go past a serious injury**; every decision a run stops for has an exit.
- **Traits never take a choice away:** downsides are penalties shown in the roll breakdown. At most **two temporary traits**; progress **hidden** until earned. Earning a temporary trait restarts its count (it can't flicker back).
- **Shown risk equals used risk:** any new modifier must appear in the risk read and the crisis read (as notes on `crewRoll`), as intel, traits, extra bodies and the alert do.
- **Randomness that shouldn't shift other dice** (weekly boards, arrivals) comes from `makeRng(seed ^ week)`, not `nextRng(state)`.
- **Crisis ids are unique** (a test checks). Renaming one needs a save migration (see v20).
- **Growth and trait pace are measured, not guessed:** `node scripts/sim-growth.mjs` and `node scripts/sim-traits.mjs` print the targets. Re-run them after any change to XP, the wall, trait counts or what happens on a job. Incidents teach a quarter of a crisis roll and saves half (owner's ratio), and count the same towards traits.
- **The planning reads use the run's own functions** (`coverage()` calls `handlerFor`/`bestSave`); add new incident modifiers there, never as a separate estimate.
- **The watch is UI-only pacing:** core still steps one move at a time (`autoStep`); never put timers or animation state in `src/core`.

## Next

0. **The tong, Phase 2** (`drafts/ops-and-presence.md`): the owner liked the mock-up; **slice 1, halls, is built** (`core/halls.js`, save v38), **slice 2, heat per district** (`core/heat.js`, save v39), **City as the command centre, part 1** (the Out now list under the map, hall faces on district cards, Today's one line, Save off the tab bar), **and police raids on the halls** (`core/raids.js`, save v40: heat 7+ in a hall's district (6+ since the balance pass, 2026-11-06), a daily 25% roll, warned 3 days ahead; hold as a fight on the hall map, walk out, or pay the Wet Sleeve; DESIGN.md 2026-11-05). **Gang raids are built** (`core/gangs.js`, save v41: six jobs tagged `against` a gang; grudge 6+ (5+ since the balance pass, fading every other Sunday) brings a raid on a hall on its turf; settle with tribute). Open there: more grudge sources if play shows the need (loud work on their turf, their enemies' jobs), a grudge cost on single crisis choices (the Red Lantern toll), the owner's check of the six tagged jobs. **A hall map per district is built** (`data/sites.js` HALLS: each raid is fought in that hall's own place; `tests/hallmaps.test.js`). **The landmarks are built** beside the halls on Crew › Halls and the raid screens (`ui/landmarks.js`, `app.js hallMark`; not on the district cards, which already have the picture). Next: an opening job per district (owner's writing; **built**: in the game, with the mechanic that holds each hall until its favour is done, save v43); rooms per hall later. Alongside: slice 4b: **mini site maps on the crew-out cards are built** (`ui/minimap.js`); replaying a day from the card is skipped for now (owner, 2026-11-06). Owner's writing: the quiet-day lines (`src/data/away.js`) and story text that names fixed days.
1. **Phase 3** (`drafts/PROPOSAL-phase-3.md`, DESIGN.md 2026-11-07): **heists, slice A1, are built** (save v47, `core/heists.js`, `data/heists.js`: Madam Rao's The Big Table at reputation 15, Mr. Szeto's Seventy-One Floors at three halls and reputation 60, Rao's on her own six prep jobs (owner's, heist-only) against the *Hei Lok*, Hei Lok Leisure's casino airship, Szeto's still on stand-in jobs). Next in A: play it (the sim's player finishes it every time; is it too easy, and does week 10 feel right?), then A2, Black Sun's own writing. Then the Legend defining job, rival tongs (peers, not gangs; generated, kept as cards) and loyalty with retirement. The owner's calls are in its section 6; ask before each part. Renown slices 5-6 are folded into it (B and D).
   **Renown slices 5-6** (now parts B and D) (`drafts/PROPOSAL-runner-renown.md`): the defining job (`legendEligible` already shows readiness on the runner page), then retirement (a decision message, never without the player's choice) and the hall. Its content list (section 8) is for the owner to write.
2. **Command fights, held for the owner:** the Outside section's orders, the round cap, enemy types and fight goals, ranks and perks. Open from 6a: rookie-tier fights are easy; fight rolls don't count towards earned traits; dropping a weapon at death's door and reinforcements aren't built.
3. **City:** heat per district is built (#77: a HEAT tag on warm districts, heat on cards and halls); left are pictures for the locked districts when they open.
4. **Play-test the start** (three founders, rookie leads at half price): `node scripts/sim-early-game.mjs`.
5. **Small polish:** reloading during a call-in doesn't scroll to it; the reputation gauge (`drafts/prototypes/reputation-gauge-options.html`).
6. **Open from the planning and fight reviews (2026-11-05):** the plan bar under the job list on wide screens is done (2026-11-05); a phone mock-up of the plan only if it still feels long in play; the review's playtest check (someone plans three jobs thinking aloud: "why is it mid?" means the bar still isn't doing its job); first-fight tips (3-4 pointers in the first fight, a "seen it" flag, so a save-version bump); keyboard shortcuts for laptop players (low priority).
7. Then the agreed review items: neural load cleanup, mood traits, money pressure, relationships (`PLAN-PROGRESSION.md` step 3). Parked: the underground place (below).

## Writing pipeline (owner writes in other chats, pastes back)

`drafts/writing-tasks.md` holds a prompt per task; paste the `WORLD.md` context block first. Done: 1 (report lines), 2 (Container 409 log: go), 7 (stat unlocks), 8 (side tasks), 9 (traits), 11 (incident lines for every district). Waiting: 3-6 (log templates, district packs, Joss lines, authored beats) until real hands-off reports show what's missing; **10 (locked-district jobs) is the next useful one.**

When a batch comes back: check every line against the game data (ids, costs, injury severity, success-only bonuses: the source dumps show them in brackets), house style ("badly hurt", "Pay -20%, heat +1.", one sentence, "someone" for injuries in focus crises), merge with a script, add a test, then report what was edited.

## Backlogs

- `drafts/earned-traits-backlog.md`: Typhoon Legs (weather), Back-Street Medic (clinic costs), Owes a Favour (client rescues), Hard Exit (rethink); Second Wind's neural half; Client's Favourite's "left out" rule.
- `drafts/crisis-situations-review.md`: the situation calls (owner skimmed; open to changes).
- `drafts/mission-log-prototype.md`: eight questions to check hands-off reports against in real play.
- `drafts/district-hooks.md`: crisis hooks for the locked districts.

## Parked (owner's call; don't start without asking)

- The fixer's backstory, festivals calendar (rival crews unparked 2026-11-07 as rival tongs: `drafts/PROPOSAL-phase-3.md` part C), street-language glossary.
- Retirement, scouts improving with experience, several live jobs at once.
- Hand-drawn faces for the named cast: **dropped** (2026-10-26).
- **An underground place** (2026-10-28, owner's idea, for later): a black market or bar where you hire, hear rumours and buy gear. The safehouse and the armoury might move out of the Crew tab then (into it, or a tab of their own); hiring and the armoury would fit there more naturally than on Crew.

## Working with the owner

- **Ask, don't assume,** on anything design-shaped. Multiple-choice questions with a recommended option work well; the owner often adds a twist in the free text. Lay out decisions with their consequences when asked.
- **Commits as `marcusw <160358373+MarcusW9@users.noreply.github.com>`, author and committer, with no Claude co-author or session lines** (CLAUDE.md). Never the personal Gmail address. A stop hook asks for Claude-authored commits; the owner's rule wins. Merge commits pick up the default identity: amend them before pushing.
- **PRs:** the owner merges; open one per feature. Prefer one PR at a time against `main`; if stacking, see the gotcha below.
- **Screenshot sets** for visual changes (`npm run screenshots -- <slug>`); the script can't reach mid-game screens, so add 1x Playwright captures as extra numbered shots and say so in the README row.
- **Lore style:** narrative, second person, present tense in `WORLD.md`; in-game text 1-2 sentences, phone-first. Canon rules: English district names, Cantonese romanisation, everything invented, rumours never confirmed, Szeto suspected not proven.

## Environment gotchas

- `npm run build` needs `npm ci` first in a fresh container. `npm test` needs nothing.
- Browser checks: `npx vite --port 5174` in the background (`setsid`), then Playwright (pre-installed). Phone width 390.
- **Stopping the server:** `pkill -f "[v]ite --port 5174"`. Without the brackets the pattern matches the shell running it and kills the command (exit 144) before anything after it runs.
- **Force-push is denied** by the permission system. After a PR merges, branch fresh from `main` instead of resetting the old branch. When the session must reuse the same branch name (PRs here are squash-merged, so the old remote branch isn't an ancestor of `main`): restart from `main`, commit, then `git merge origin/<branch>` and keep your side (`git checkout --ours -- .`; check first that `git diff origin/main origin/<branch>` is empty), then push normally (done for slice 3).
- github.io isn't reachable from the container; check deploys with the GitHub Actions runs instead.
- **Stacked PRs don't retarget themselves** unless the lower PR's branch is deleted when it merges. On 2026-10-26 #14-#17 were merged into each other's branches instead of `main`, and #18 had to carry them over. Either ask the owner to delete each branch on merge, or after the bottom PR merges, retarget the next PR to `main` (`update_pull_request` with `base: main`) before it's merged.
