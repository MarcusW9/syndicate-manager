# Management-game comparators: what players asked for, and where they bounced

Started 2026-11-26. Sources: an r/rpg_gamers thread asking for RPGs where you build up and run a guild or company, and Steam reviews of King of Dragon Pass (KoDP), Majesty Gold HD and Fallout Shelter, and the Steam update notes of Guild Management Simulator (0.7.4 to 0.8.5), all shared by the owner.

## 1. The Reddit thread: games named as comparators

Not all of these are close. Grouped by what they teach.

| Game | What it offers us |
| --- | --- |
| Majesty 1 and 2 | An RTS (buildings, shops, guilds) where you do not control the heroes; you steer them with gold bounties on flags. The incentive idea suits hands-off runs and side tasks (`core/autorun.js`, `core/sidetasks.js`), but the game itself is real-time, not text-first. See section 3. |
| Battle Brothers, Darkest Dungeon | The standard roster-with-attrition references. Our death rules are a deliberate softening of both. |
| Wildermyth | Characters who change over time through events. Relevant to `earnedTraits` and development. |
| Our Adventurer Guild | Rebuild a guild: hire, outfit, send out, upgrade the base; turn-based fights. Overlaps our fight engines. |
| Dispatch | Superhero-team management: assign people to jobs, writing carries it. Closest in tone to a crew-and-jobs game. |
| King of Dragon Pass | Text-first, event-driven tribe management with no tactical layer. See section 2. |
| Kenshi | Pure sandbox. Not a useful model. |
| Guildmaster Simulator | A small indie in the same space, in playtest (Steam app 5270710). Not the same game as Guild Management Simulator in section 5. |

Takeaways from the thread:
- Players ask for an organization that grows (a base, a roster, new options), not just a party.
- Only KoDP in the thread is text-first. That may be a gap we can fill.

## 2. King of Dragon Pass (Steam reviews)

KoDP is clan-level: you run a tribe through written events. Its only people layer is the clan ring, a council of seven nobles with skills who age, die and are replaced; there is no crew to hire, grow and send out, so it informs our event and crisis writing, not our roster. For roster and growth use Battle Brothers, Wildermyth and Darkest Dungeon.

**What reviewers loved**
- Very high replayability from a large pool of random events with almost never a clearly right or wrong choice.
- Worldbuilding that feels lived in and avoids stock fantasy.
- Difficulty is high for new players and falls as they learn to think like the people in the game. Few situations are truly hopeless apart from starvation spirals.
- Streamlining: removing systems nobody wants to manage by hand was praised.
- Lots of new events added over time.

**Where reviewers bounced**
- "Entirely reliant on RNG and hides a lot of information."
- "Confusing and nonsensical": a tutorial that gives the bare basics, then "fifty different things at the same time."
- No clear progression: one reviewer says you can never destroy or take land from a rival clan because attacked clans respawn troops. Some actions felt "just for show" because one option was the only way to progress. Bored after about 2 hours.
- Early death spirals: bad luck on early harvests can lock a run into starvation.

**Mobile-port lessons (the port was touch-first and the reviewer disliked it on desktop; we are going the other way)**
- Dangerous defaults: the diplomacy screen defaulted to "Demand Tribute" instead of "Give Gifts", and the reviewer used it by accident. The default action on a screen must be the safe one.
- No manual save, autosave on quit only. Players split on this; decide on purpose.
- Drag-only scrolling, cramped screens, no icons to avoid double-checking.
- A semi-intrusive tutorial that veterans can skip was fine.

## 3. Majesty Gold HD (Steam reviews)

Majesty is billed as a fantasy kingdom sim but plays like a conventional RTS: you build guild houses, shops and defences on a map in real time. Its one big departure is that heroes act on their own. You cajole them with gold: an Explore Flag with 200 gold, an Attack Flag with 400 gold on the troll at the market, and you hope someone claims it. Treat it as a reference for indirect control, not a genre match.

**What reviewers loved**
- Heroes with autonomy and personality ("D&D ant farm"): delightful when they do something heroic, exasperating when they do not.
- Humor and voice: class-specific catch-phrases, comments when something happens to a hero, a witty advisor in briefings.
- Replay value from a freestyle mode beyond the scripted missions.
- Lasting affection: patched years later by a former developer in their free time.

**Where it struggled**
- The sequel gave the player more control over heroes, which pushed it toward a standard RTS and away from the sim idea that made the original distinct. A reviewer calls this a mistake.
- Dated visuals and a primitive interface; the idea has since been expanded on by Dwarf Fortress and its descendants.
- Technical issues on modern systems (freezes, config-file fixes).
- Its developer struggled to find a publisher for both the original and the sequel; the review ties this, for the original, to its break from RTS convention.

**Lesson:** the autonomy is the product. Do not hand the player direct control to make a hands-off system feel safer; add readable incentives instead.

## 4. Fallout Shelter (Steam reviews)

A free-to-play vault builder (mobile first, also on PC): you assign dwellers to rooms, keep resources up, defend against breaches, and send dwellers out to explore the wasteland and run quests. It runs on a real-time clock. The owner shared it as the closest vibe: a crew you look after and send out.

**What reviewers loved**
- Watching the vault grow, looking after the dwellers, sending them out to explore.
- Low stress and casual: "a good game to drift in and out of", playable in a small window beside another game.
- Check-in play: "the quest system is fun to check in on every once in a while"; one player plays daily for months, drops it for a year, then comes back.
- Humor and small stories: dwellers' pickup lines, chaos when roaches break through the floor, "actual storylines that keep your attention".
- Breaches that pull you back in at a moment's notice.

**Where reviewers bounced**
- Progress gets repetitive after a while.
- Mission animations are choppy and the combat "outdated and boring, even by mobile game standards".
- Microtransactions (lunchboxes) in a single-player game: pointless at best, a trap at worst; trivially got for free by editing files.
- Achievements are a long grind without editing the save.
- Daily-login seasons: one player dropped out because they could not log in every day.

**Lesson:** the pull is caring for people and sending them out, in short sessions. The weak spots are repetition and a fight layer nobody wants to watch.

## 5. Guild Management Simulator (Steam update notes, Aug to Nov 2026)

Our nearest competitor: a solo-developer guild manager in Early Access since 2026-08-27 (Steam app 5009000; PC and Android). You recruit members, gear them, send named teams on timed expeditions (encounters, dungeons, raids, Mythic+ keys) and read the reports. Real-time timers, MMO-raid flavour (tank, healer, DPS). Read from its patch notes, not from play, so this is what its developer found worth fixing, not what players said.

**What it added, and what that tells us**
- **Careers and a Hall of Records** (0.8.5): each member keeps missions, injuries and milestones; cosmetic epithets (Firstblood, Battle Scarred); retire veterans and remember them. We already have this (runner's Career tab, Crew › Wall with the fallen, the Hall of Legends and Gone elsewhere). Shows the idea is wanted.
- **Build identity** (0.7.5): "left tree or bust" was the obvious answer, so every path got a real job after three nodes, with caps on stacking effects. Same problem as `abilities-and-builds.md`: each choice needs a niche, not a bigger number.
- **Early payroll protection** (0.7.5): members under level 5 draw no wages, so "new guilds can safely learn the opening loop without returning to immediate debt and desertion." Their answer to KoDP's death spiral; compare with our broke bands (section 6, point 3).
- **Auto-repeat** (0.8.0): repeat a mission after a clean win; it stops on failure, injury, a missing member or no supplies, and says why. Rewards reduced, with the penalty shown. Repeats report as quiet toasts, not a full report. Close to our hands-off runs; the "stops safely and says why" and "reduced, and shown" parts are worth matching.
- **Failure can't be farmed** (0.7.5, 0.8.0): consolation drops capped so losing high-end content was no longer the fastest way to level.
- **One forecast** (0.8.0): mission cards and party setup now use the same combat forecast logic, and forecasts stopped counting deployed members. Our planning read should keep using the same rules as the job itself.
- **Reputation tiers** (Unknown to Legendary) that unlock high-stakes events; we have rank and fame.
- **Explain the numbers** (0.7.4, 0.7.5, 0.8.5): many entries add text saying what a stat, star or tag actually does. Their players were lost without it.
- **Safety on costly actions**: confirmations, bulk sell shows the full list first, refined gear protected from rerolls. We already confirm sells and hall buys.
- **A 5-step getting-started guide** (0.8.5), added late.
- **Seasonal and dated events** (a Halloween event with its own currency; a three-week "Contest" raid with intel off and a first-week banner). Real-world dates; see point 9 below on why we stay on in-game time.
- **Save trouble, repeatedly**: three of the last seven posts are save hotfixes (half-written expedition data blocking loads, missing provision lists, autosave failing on a new collection item, recovery export failing). Our saves have tests, migrations and an unreadable-save fallback; the lesson is that state for crews out (`awayJobs`, expeditions) is where it breaks.
- **Exploits from timing** (0.7.4 and a patch): rapid clicks queuing duplicate expeditions, a recruit board rerolling and charging every second. Real-time play brings these; day ticks mostly avoid them.

**Lesson:** the same game shape found the same problems we did: dominant builds, early debt, opaque stats, hands-off runs that need clear stop rules, and fragile save data for crews out.

## 6. How this applies to Syndicate Manager

1. **Show risk, do not hide it.** The planning read (`core/squad.js`, `core/risk.js`) and the rule that deaths follow a risk the player was shown answer the "hidden information" complaint. Keep one clear read per decision; do not pile up small ones.
2. **Visible progression in an endless game.** The sharpest negative review is "no clear progression" plus rivals the player can never really dent. We already have markers (rank and standing in words on the Tong tab, halls, the Anchor's Book), and rival tongs rise, strain and fold in the background (`docs/RIVAL-TONGS.md`). The player cannot attack a rival directly; their levers are signing, buyouts and poaching. Worth checking in a playtest: does the player feel their own moves changed a rival's fortunes, or only watch the weather?
3. **Early-game trap check.** KoDP's starvation spiral is our "broke" spiral. This is already measured: `scripts/sim-early-game.mjs` prints the share broke at weeks 4, 13 and 26, and the tests hold careful play under bands (broke under 35%, under 10% for the three-founder start; `docs/ARCHITECTURE.md` section 10). What a sim cannot show is whether a broke player sees a way out; check the screen and Joss's lines when cash goes below zero.
4. **No choices that are only for show.** If a crisis choice does not change the outcome, players notice.
5. **Safe defaults.** On any screen with a risky action, the preselected one is the safe one (iOS-ready rules already say no hover-only info).
6. **Save policy.** Already decided: `save.js` keeps three slots, saves as you play, makes a weekly automatic backup (not for Ironman) and reminds about backups every 28 days. KoDP's split over savescumming suggests keeping Ironman as an opt-in rather than the default.
7. **Streamline.** Cut systems the player would only manage by hand.
8. **Indirect control where we have it.** Main jobs are planned and played by hand, so Majesty's lesson applies only to hands-off runs (`core/autorun.js`), where standing orders price each downside as a share of the pay, much like a bounty. If those feel too loose, the Majesty lesson is to make the orders more readable, not to add hands-on control mid-run. Separately, character voice in the small lines (Majesty's catch-phrases, the advisor, Fallout Shelter's dwellers) is what players remember.

9. **Short sessions and coming back.** Fallout Shelter is played in short check-ins and picked up again after months. Ours runs on in-game days, not a real-time clock (real-time expedition timers were rejected, design log 2026-11-21), so no daily-login pressure; keep it that way. Saves already upgrade across versions; what we lack is a recap for a player returning after a long break (what is out, who is hurt, what is owed). Worth a look.
10. **Sending crew out is the draw.** Expeditions and hands-off runs (`core/expeditions.js`, `core/autorun.js`) are our version of the wasteland trips. Their reports are where the small stories and humor land.
11. **Fights must be worth watching, or skippable.** Fallout Shelter's combat is its most criticised part. The watchable-combat work (`docs/BATTLES.md`) is the answer; hands-off fights should always offer a short report instead.
12. **No paid shortcuts.** Not a plan here, but the reviews are unanimous: paid loot in a single-player game reads as a trap.

13. **Save data for crews out is the weak spot.** GMS broke saves three times on half-written or missing expedition data. Our migrations already default missing `awayJobs` (`save.js`, from v17), but the save tests (`tests/saves.test.js`, `savefail.test.js`) do not load a save with crews out. They should include a save with jobs away, expeditions out and a pending call-in, and one with those fields missing.
14. **Hands-off stop rules, said out loud.** Our hands-off crews already never push on. Each report should say why it stopped or pulled out, in one line, the way GMS's tray note does.
15. **Explain what numbers do, on tap.** GMS kept adding text explaining its stats. Our iOS rule (tap to reveal, no hover) fits; check every stat and tag on the runner's page opens a plain line.

## 7. Open checks

- When cash goes below zero, does the screen show a way out? (The sims already measure how often it happens.)
- In a playtest: does the player feel their signings, buyouts and poaching changed a rival tong's fortunes?
- Returning after a long break: does the first screen tell the player enough to pick the run back up?
- Do the save tests cover a save with crews away, expeditions out and a call-in waiting, and one with those fields missing?
