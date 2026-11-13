# Changelog

What changed in each update, newest first. For *why* a decision was made, see the decision log in `DESIGN.md`.

Live build: https://marcusw9.github.io/syndicate-manager/

## 2026-11-13 · Fights you can get out of
- **Reaching the van no longer needs a roll.** A runner ordered to board gets in, and so does one carrying a downed teammate. The cost is the same as before: they are in the open for that round's shots, only three can use the doors a round, and anyone shot down on the way stays outside.
- **The five new-style fights are 2 easier than the job's own difficulty.** A job's roll is taken by your best person; a fight tests everyone. The plan screen's odds use the same number.
- **Why:** with the crew a tong really has when these jobs unlock, the best team left someone behind in about half of Warehouse Lift and Protection fights, and committed risk killed someone in about 1 fight in 6. After the change (`docs/sims/gate-teams-2026-11-13.md`) the best team leaves someone behind in 8% (Warehouse Lift) and 12% (Protection) on steady, and committed risk costs a life in 3.6% and 5.0% of those fights. A carelessly picked team on committed still loses someone in about 1 fight in 5; the plan screen shows that chance before you send them.
- New sim: `node scripts/sim-gate-teams.mjs`. The older team sims used the day-one roster, which never meets these jobs.

## 2026-11-12 · The Old Stand, and drones that float
- **The floodlight on the Basin map is gone.** Drawn from the side in a view from above, it looked odd. Overwatch now sits on the roof of the **Old Stand**, the racecourse's grandstand, drawn from above with its concrete ribs; the sniper's spot and what they can see are the same as before.
- **The drones are spheres now:** a ball hovering over its own shadow, dark on one side and lit on the other, a ring of light round its middle and one sensor eye, in place of the four-rotor drones of today.

## 2026-11-12 · The city's tech on every job map
- **Every job map now has the city's tech dotted round it:** auto-taxis on the roads with light bars and headlight beams, AR adverts hanging in the air (over the market gate, between the towers, over the harbour, an odds board on the racecourse), rooftop neon and a tall Old Town sign, satellite dishes, vending machines throwing colour on the ground, parked delivery drones, junction boxes, steam vents and cables strung between the tenements.
- **They're only scenery:** none is cover, none sits on the crew's route or where the guards wait, and a test keeps it that way.

## 2026-11-12 · Lantern Course at its real size
- **The racecourse on the Basin map is far bigger now:** only its near bend shows, sweeping across the top-left corner and off the edges, so it reads as a real track beside the stables, not a small oval. The dirt track sits between two white rails with the infield's mown grass inside.

## 2026-11-12 · Every district's map has its own detail
- **Docks:** shipping containers with ribs and lit doors, concrete slabs, the harbour with its swell and broken lights, a planked jetty, and Red Lantern red coming off the water.
- **Old Town:** the tenement roofs have air-con units on them, the water tank is a drum, washing hangs on the lines, the courtyard is cobbled, and the red sign at the foot of the alley lights the ground.
- **Glass Heights:** shrubs in the planters, a tiled plaza in the tower's cyan light, sodium in the loading bay, and a helipad on the next tower's roof.
- **Basin:** the stables have pitched roofs, the infield is mown in rings, the yards are gravel, and the floodlight throws a cone over the stable rows.

## 2026-11-12 · Job maps drawn with hard light
- **The job maps are drawn like the portraits now:** flat colour, the city light from the right, and a hard navy shadow falling left from everything that stands up (buildings, containers, crates, stalls, desks, the footbridge). The right side of each thing catches the light. No outlines on cover.
- **The Night Market got its own detail:** stalls with awnings, shadowed on one side and lit on the other, with a lamp under each; the crowd drawn as people from above; a footbridge with rails and lamps; paving slabs; and the stalls' neon falling across the lanes and the wet road.
- **The route is a solid cyan line** with a dark edge, and the map labels are in the display font with a dark halo, so both read over the busier ground.

## 2026-11-12 · Faces on the map the whole run
- **The crew's tokens on the job map show their portraits from the start,** not initials that turn into faces when a fight begins. Initials remain only for a token with no stats to draw from.

## 2026-11-12 · Today: Coming up over a reader that stays in view
- **On wide screens the right side of Today stays put as you scroll the inbox.** Coming up is a strip across its top, and the open message sits under it, so a message opened from far down the list is already in view. No more scrolling back up to read it.
- **The reader has a bar:** "Message 3 of 10" with ‹ › to step through the messages (All or Unread, as listed) and ✕ to close it. When nothing is open it shows the week's brief (cash, due Sunday, free crew, jobs, The Word) instead of an empty box, on any day.
- **Coming up's cells** show the first thing for each day, with "+1 more" for the rest. The cell for the open message's day lights up (a raid warning lights the raid's day).
- **The list's dates** read "Wed" over "Day 164", like Coming up.
- Phones keep their layout: the list, then Coming up, or one open message alone.

## 2026-11-12 · Fights on the map: commentary, camera and life between rounds
- **A commentary line under the map** says what the fight just did, one moment at a time, and a folded **Commentary** log keeps every moment with its round and time, so you can follow a fight without watching the map.
- **The camera moves in** on the people in a standout moment, then pulls back to the whole fight.
- **Nobody stands still between rounds:** people shift a little behind their cover and trade covering fire that goes wide. It never hits anyone and never moves anyone out of their cover; only the real shots count. It is switched off with reduced motion and at Resolve.

## 2026-11-12 · Fights play live on the job's map
- **The five jobs with the new fights now play them on the job's own map.** Your crew and the enemies show as round portraits, run to cover, shoot at the targets the rules picked, and fall where they were hit. Bodies stay on the ground. Where the place has too little cover for what the rules give someone, a low barrier is drawn so the map still tells the truth.
- **Pace chips on the round screen: Fast, Watch, Resolve.** Fast (the default) plays the next round by itself on your orders once the last one has played out. It stops for every call-in, and while you have the orders open. Watch waits for you each round. Resolve hands the rest of the fight to the crew, as before. The pace never changes what happens.
- The round screen still has the orders, the risk level and the call-ins; on phones the map gets more room while a fight is on. The new words on the map and the chips are drafts for now.

## 2026-11-12 · Fights know where everyone stands on the map
- **No change you can see yet.** The five jobs that use the new fights now work out where each runner and enemy stands on the job's real site map, behind cover that matches the cover the fight's rules give them. Where the site has too little cover for that, a low barrier will be drawn so the map still tells the truth. This is the groundwork for watching fights live on the map. Saves upgrade on their own (a fight in progress gets its places on load); rules and odds are unchanged.

## 2026-11-12 · The director tells each fight round
- **Each fight round is now recorded as moments** (routine, notable, spotlight), so the screens can slow down for the good bits. Spotlights are things like a runner dropping three enemies in two rounds, a protector covering the same teammate again and again, a last stand on one pip, a hack finished at the last moment, a jam that kills two radio calls, and a carry into the van. The spotlight sentences are plain drafts for now, and nothing on screen shows them yet. Rules and odds are unchanged.

## 2026-11-12 · Fight groundwork: seeds, odds key, line slots
- **No change you can see yet.** Fights now carry a stored seed for future showcase moments, the planning odds already take account of the rules still to come, and each recorded fight line keeps the key and slots it was written from. Tests now check that previews never change a fight.

## 2026-11-12 · Fights draw the same at every pace
- **A fight now plays out the same whether you watch it, hand it off or send the crew hands-off.** Before, hands-off and away fights drew their rounds differently from watched ones, so the same seed could end differently. Fights saved mid-way before this keep working. Hands-off and away fights will roll differently from before (a one-off shift).

## 2026-11-12 · Overwatch picker says who is best
- **Each overwatch candidate now shows what they do to the job's read** ("Lowers the read: High to Moderate", or "Read stays Moderate"), and the list is ordered by that first, then by the kit's stat. Before, it ranked by the kit's stat alone, so a drone driver's Piloting 17 sat above a rifle-carrying fighter on a combat job and nothing said why.
- **"Piloting 17 · 3 actions" sits on one line,** centred together instead of the second half dropping below the first.

## 2026-11-12 · Trait notes use the name
- **Joss's notes on a new trait name the person** ("Cortex has stopped asking where the clean bandages are") instead of opening with "They", which had nothing to point at. A Synergy names both ("Fog and Crow have learned each other's pauses"). Notes already in the inbox keep their old wording.

## 2026-11-12 · Crew news in one message
- **A day's crew news is one message.** Traits and Synergies earned on the same day now share a single "Crew updates (4)" message; open it to read each one. A single note still reads as itself. A Synergy is one line for the pair, not one for each of them.

## 2026-11-12 · Scout report names the name
- **"Cortex is back: them has moved on" fixed.** When a scout came back and the name had already been signed elsewhere, the message lost the name and said "them". The trip now remembers who it was sent after, so it reads "Cortex is back: Mist has moved on".

## 2026-11-12 · How battles work, written down
- **New `docs/BATTLES.md`.** One page on how fights play now: the two engines and which jobs use which, pips and HP, enemies, the round in order, every roll and chance, orders and the risk level, how a fight ends, the death rule, call-ins, and the old engine's rules. Checked against the code; no game change.

## 2026-11-12 · Posts: where your people stand in a raid
- **Posts on every hall.** Each hall has six places to build one: a window and a roof on each building, and two at the front gate. A **window post** (¥2,500) gives full cover, a **rooftop nest** (¥6,000, level 2 hall) gives full cover and height (a shot is a little easier, and a hit on you a little harder), and a **gate post** (¥3,000) gives half cover. They count as defences, so three of them make a raid one step easier, like any three pieces. Build them on the new **Posts** tab; the squares for barricades and plates are on **Forecourt**.
- **You put people on them.** When a raid is warned, the hall's page shows each post and who stands there. Tap **Change ›** to hand a post to someone else, or to nobody. Left alone, your best fighters take the best posts.
- **The fight starts from them.** If the raid comes by the front gate, your people begin on their posts, and the rest take cover in the forecourt. Raids from behind (once you hold the yard) are unchanged for now.

## 2026-11-12 · A walled forecourt for every hall
- **Room to build defences.** Every hall now has a walled forecourt between its buildings and the street, with its own gate. Before, the only outside ground at levels 1 and 2 was a narrow passage with four free squares; the forecourt adds 30. The hall's plan is taller to fit it (12 × 11 squares instead of 12 × 8), and the plan scales to fit your screen.
- **Raids from the street are held in the forecourt.** The raiders come in at the front gate and our people hold the forecourt, so barricades and plates you put there are cover for your side. Each hall keeps two crates of its own there, so a hall with nothing built still has some cover. Raids from behind (once the yard is ours) are unchanged.
- **"The Forecourt" is a placeholder name** in every hall until it's written properly.

## 2026-11-12 · Hall plans are clearer
- **Looking and building are two modes on a computer.** A hall's page now opens on the plan, who is in each building, what's next and one defences line. **Build defences ›** switches to building (the grid, the pieces, and a Done button). Before, the pieces and "tap a free square" sat beside a plan with no grid.
- **One look for each thing.** The part you can take next is dashed cyan with its price on it. Parts for later are a plain faint outline, with no hatching and no "level 4" labels (the cards below still say when they open). Doors are cyan, like the key says; squares kept clear for a raid are grey. Red is left for buttons and raids.
- **Not changed yet:** how much room there is for defences. That needs the hall's layout and the raid fight changed together, so it's the next step (see DESIGN.md).

## 2026-11-11 · Stat tiles line up
- **The numbers on a stats panel now sit on one line.** A tile with a trait note ("6 +2 Hothead") used to sit higher than its neighbours, because a spacing rule meant for the progress bar landed on the label or the number instead. It now applies only above a bar.

## 2026-11-11 · Today on a phone: Joss folds, and the next date up top
- **Joss's line folds.** Tap Joss to shrink their line to one line; tap again to open it. It stays folded for the rest of the day and opens again on a new day. The alerts under Joss never fold. Works on computers too.
- **"Next up" line (phones).** Under Joss and the alerts, one line with the soonest date that matters: a raid, the bills, a last day for a job or a lead, a new season (for example "Sun · Bills ¥2,250"). It turns red when the bills are short. Tap it to jump to Coming up. Computers don't show it, because Coming up is already in view beside the messages.

## 2026-11-11 · Today: messages first
- **The messages move up.** Coming up no longer runs across the top of Today, and Monday's week numbers and The Word no longer sit above the list. Only Joss, the alerts, crews back and the Out line come before the messages now.
- **A rail for the week.** On a computer, Monday's numbers with The Word and Coming up sit in a column to the right of the open message (under the messages on mid-size screens). On a phone they come after the message list.
- The messages themselves look as before. Mockups of the options that led here are in `docs/mockups/`.
## 2026-11-12 · Steady pulls out at a third of their pips, and a watched crew asks you first
- **Steady now pulls a runner out at a third of their maximum pips (rounded up, at least 1)** instead of a flat 2. A 3-pip starting runner leaves at 1 pip, not after the first hit; a 9-pip runner at 3. Cautious (half) and committed (never) are unchanged. In the sim (`docs/sims/pullout-2026-11-12.md`) this raised starting crews' clean wins from 29% to 35% and cut abandoned hacks from 14% to 2%.
- **A new call-in: "at the pull-out point".** When a watched crew has a runner at the point where their risk level pulls them out, you are told and choose: **Pull {who} out** or **Keep {who} in** (or Pull back). If it is the tech, the card says the hack is abandoned if they leave. Keeping someone in lasts until they lose another pip, then you are asked again. Not asked while the van is there (pulling out then means boarding) or on committed. Hands-off crews and away crews whose call-in runs out pull out, as the risk level says.
- The risk picker's words say so ("a third of their pips", "a watched crew asks you first"). The call-in's lines and those two sentences are mine, for you to rewrite.
- The gate and the other sims were run on the old flat 2; their numbers are what they were then.

## 2026-11-12 · Steady pull-out at a share of max pips (sim, no game change)
- `scripts/sim-pullout.mjs` and `docs/sims/pullout-2026-11-12.md`: on a patched copy of the fight code (the game's own files untouched), steady pulls out at a share of the runner's maximum instead of a flat 2 pips. The game's starting crews at the real job difficulty (the planning read's best team), and the gate's strong crews as a check, 400 seeds. Variants and the bar were declared in the script before the run.
- **By the declared bar: none.** The bar required that nobody more is left behind in extractions, and left-behind rose from 56% to 57% (a third of max) or 58% (flat 1, a quarter), which is within the noise of 286-330 fights, but it is over the line I set, so it does not pass.
- **What it does, in numbers (a third of max, rounded up, minimum 1; steady):** the starting crews' clean wins rise from 29% to 35% (+7 points, hack with the fresh roster 15% to 31%, authored 73% to 83%); the hack is abandoned in 2% of fights instead of 14%; deaths stay at 0%; downs rise by 0.17 a fight (runners stay in longer); the strong crews' clean wins rise 6 points (82% to 88%). A quarter of max or flat 1 do slightly more (+8) with slightly more downs (+0.2).
- **It does not fix extractions:** holdExtract clean wins stay at 4-6% (fresh) and 22% (authored), and left-behind is unchanged or a little higher (authored 66% to 70%). The pull-out rule mostly fixes hacks; the left-behind lever is the van's arrival round (see "What moves the left-behind rate").

## 2026-11-11 · What moves the left-behind rate (sensitivity sim, no game change)
- `scripts/sim-vanlevers.mjs` and `docs/sims/vanlevers-2026-11-11.md`: the two holdExtract jobs at their real difficulty, the game's own starting rosters (the planning read's best team), the defaults hands-off, 400 seeds, one van number changed at a time in the script only. Declared bar: cut "someone left behind" by 10+ points without raising downs by more than 0.2 or heat by more than 0.3.
- **Base (steady): someone is left behind in 56% of extractions** (fresh roster 39-46%, authored 62-78%), 1.7 downs a fight, clean wins 10%.
- **The van arriving later is the lever that works:** round 4 instead of 3 cuts it to 37% (-19 points, downs -0.45, heat -0.14); round 5 to 27% (-29, downs -0.63). Clean wins drop a little (10% to 8% and 7%).
- **Door slots do nothing** (4 or 5 slots: no change; the door is never the bottleneck). **The van waiting longer barely helps** (waits 5, 6 or 8: -2 to -4 points, and about +0.1 downs). **Holding the van three rounds: no change.**
- **Easier boarding makes it worse** (boarding step -2: +4 points left behind; 0: +8). Not understood yet; runners probably leave cover for the van sooner and are shot in the open.
- **Committed risk on starting crews kills far more than the target:** someone dies in 15-49% of these extractions (fresh Warehouse 49%, Protection 37%; authored 22% and 15%), against about 1 in 25 for the stronger sim crews in the gate.
- Nothing was changed; this is evidence for the owner's call.

## 2026-11-11 · Hits land, and the stamp has weight
- **A guard that is shot now reacts:** on a hit the token shakes and flashes white for a moment, at the instant the shot lands (rifle, drone, turret and crew shots; a miss does nothing). With reduced motion on, it only flashes.
- **The Job done stamp comes last:** it waits until the card and the team have shown (longer with a bigger team), then drops fast from above, lands with a squash, and wobbles to rest; the whole card jolts a little on the hit. A loss is still not stamped. With reduced motion on, the stamp just appears.

## 2026-11-11 · Skirmishes play out (no three-round stand-off)
- **A fight that is not a raid no longer stops after three rounds.** It used to call the crew in with "Push past them (alert +1, heat +1) or Pull back" while guards were still up, even for a lone runner who was winning. Now it plays until the guards are down, a runner is at death's door (the usual call-in) or the crew's orders pull back. A 12-round backstop still calls in a true stalemate. Raids keep their three rounds ("Hold the door"), and a fight already in progress in an old save keeps the cap it had.
- **Side effect, for the owner:** with the cap gone, the engine-1 test fight is won either way, so what commanding a fight buys is health, not wins (about 14% less health lost, 2,199 against 2,569 over 400 fights; before, orders won 309 of 400 against 246). The planning read's stand-off share is about zero for these fights.

## 2026-11-11 · The validation gate on the real code (battle rework, slice 3): verdict neither
- **No game change.** `scripts/sim-orders.mjs` plays the gate from spec section 24 on the real fight code (`buildFight`, `startRound`, `playRound`, `previewRound`, the dilemmas and their patches, `vanOdds`, `outcomeOf`), with mid-fight adapting. Full table: `docs/sims/orders-2026-11-11.md` and `.csv` (1,944 cells).
- **Declared before the run** (the `GATE` block at the top of the script, committed on its own first; the owner confirmed the bar): 400 seeds a cell, the same seeds for every plan; both encounters (holdHack at Glass Heights, holdExtract at the Docks), threat 3, steady risk; 9 crew groups (Under / On / Over x three line-ups, a grown crew's endurance); 9 settings (enemy durability D1-D3 x exposure E1-E3, D2 E2 being the shipped data); six unchanged plans (attack, hold, protect, support, mixed, the crew's defaults); adapted = the best of those six and the same six with a mid-fight layer (call-in answers and Take Command between rounds), chosen per cell and encounter. "As good" = within 5 points of clean wins, 0.25 downs and 0.3 heat (heat is the only resource a fight spends; specials and consumables do not exist yet). Bar: adapting beats an unchanged plan by 7+ points or 0.3+ fewer downs in one encounter. Rework if one unchanged plan is as good in both encounters in two thirds of cells; proceed if adapting clears the bar in two thirds and no plan is as good in both.
- **Result: neither.** The crew's defaults are as good as the adapted plans in both encounters in **54%** of cells (64% against adapting by choice alone), under the rework line of 67%; the other plans 0-14%. Adapting clears the bar in **23%** of cells (14% by choice alone), far under the proceed line. It pays where the crew is weak (Under 59% of cells, On 11%, Over 0%) and where enemies are tougher (D3 37%, D1 11%). Different plans do win in different places (protect in holdHack, mixed and the defaults in holdExtract, hold-only loses a hack), so there is no universal plan, but the defaults are close to the best one nearly everywhere.
- **Mid-fight adapting** adds +7.4 points of clean wins in holdHack and +1.6 in holdExtract over the same plan without it. Its answers are a floor, not a player.
- **Deaths:** none on cautious or steady in 10,800 fights, except after a hand-ordered withdrawal (1 in 82 to 1 in 225) or a push on (3 in 3,600, bleeding in holdExtract). Committed: 16 in 1,800 fights, about 1 in 56 (the target is about 1 in 25), all in holdExtract.
- **Toughness check met:** Over's gain over On is 11 points in aim-heavy cells against 4 in radio-heavy ones.
- **Dilemmas:** `techUnderFire` comes up in **82%** of hacks (about one call a fight); `vanCantWait` in 19% of extractions at the shipped settings.
- **Left behind:** 9% of extractions for the sim crews, but **49% (fresh) and 56% (authored crew) on a steady extraction with the game's own starting crews**, with 2 to 3 downs a fight on committed; a fresh crew wins a hack cleanly 14% of the time hands-off at threat 3.
- **`techUnderFire` narrowed (owner's call, 2026-11-11):** it now comes up only when the tech is at half pips or below with a radio call shown (the "two or more shots on the tech" condition is gone). Hit the caller therefore always has a caller. In the re-run (same declared gate, hash `f440deff`; `docs/sims/orders-2026-11-11-narrowed.md`) it comes up in **2%** of hacks instead of 82%, and the verdict is unchanged: **neither** (defaults as good as adapting in 53% of cells; adapting clears the bar in 23%). The mid-fight layer's gain in holdHack falls from +7.4 to +0.8 points, because most of it was covering the tech on that call-in. Toughness check still met (11 vs 4).
- **Left-behind, checked at the real difficulty** (`scripts/sim-teams.mjs`, `docs/sims/teams-2026-11-11.md`, 400 seeds, the game's own rosters and the fights the five jobs really start: difficulty 14-16 on the hacks and Protection Run, 11-12 on Data Scrub, 16-18 on Warehouse Lift, which is threat 4). The gate's flat 14 is the real value, not an overestimate. Hands-off on the defaults at steady risk, with the best team the planning read picks from the roster: someone is left behind in **44-47%** of extractions with the fresh roster and **60-70%** with the authored one, and a clean win is 0-27%; the job itself is done in 45-95% of them. Hacks: clean wins 3-43% (fresh roster) and 62-75% (authored). Picking the team helps hacks (authored Data Pull 39% to 62%) and barely helps extractions. So the high rate is real for starting crews against the shipped numbers, not a measurement artifact; stronger crews (endurance 13, combat and cool 14) leave someone behind 5%.
- Could not measure: specials and consumables (none exist), standby and overwatch, a real player's choices. Passing sims would not have replaced the playtest either.

## 2026-11-11 · The new fights get their screens (battle rework, slice 2)
- **A watched fight on one of the five jobs now waits for your orders every round** (Office Data Pull, Data Scrub, Quiet Hours, Warehouse Lift, Protection Run). Hands-off and away crews play as before. The screen shows the goal and clocks, each enemy with what it means to do and the chance, each runner's order and what they will do, an "if nothing changes" line, and a risk picker. **Next round**, **Change orders** (pick someone, a duty and a target; the crew's plan for the next stage is kept), **Auto fight** and **Pull back**. The round's threats are shown before you give orders.
- **Call-ins have their own cards:** what changed, who is outside, "The crew is set to:", each option with what it does and what it costs, and Pull back. The van call shows the odds of leaving whoever is outside, each way.
- **The plan screen shows the fight:** the type and objective, likely enemies, gaps (no jammer, no medic, no armour on the tech), each runner's order and pull-out point, the risk picker, and the chance of losing someone (killed or left behind) at that risk.
- **Call-in changes:** the jam is only offered when a radio call is shown and the tech can jam. Cover, Hit the caller and Jam now last one round, then the crew's orders come back (an order you give yourself stands). The van call has two options: Leave on time (the round still plays, so runners can still board) and Hold the van. The unused deadline call-in text is gone.
- **The report has one cause line** ("How the fight ended") above the full log.
- Not built: the Special actions button (the engine has no specials yet) and a map overlay (engine 2 has no site spots yet).

## 2026-11-11 · Battle wording close-out (Task 13)
- **Call-in costs read in words:** "Heat +1" on holding the van, "No pay. Heat +1, reputation −2." on Pull back, from the real numbers.
- **"If nothing" says what is assigned, not what will happen:** incoming shots with no shield assigned, radio calls with no jam assigned, and "nothing shown this round" in place of "nothing to answer".
- **The tech-under-fire options say they last until you change orders.** The jam option can leave the tech unable to work the hack (found in checking; the fix is a separate change, noted in `drafts/writing-tasks.md`).

## 2026-11-11 · Battle wording for the five new-fight jobs (Task 13)
- **The placeholder tags are gone.** Office Data Pull, Data Scrub, Quiet Hours, Warehouse Lift and Protection Run now read in full sentences: the round feed ("Velvet breaks for the van."), what enemies are about to do, what each order will do, the "if nothing" line, the end of the fight ("The hack was lost when Static could no longer keep it running."), and the two call-ins with a line under each option saying what it does.
- **Enemies have names:** hired gun, security guard, drone, enforcer, with their number.
- **Call-ins:** the tech under fire (Cover, Hit the caller, Have them jam, Keep current orders) and the van that can't wait (Leave on time, Hold the van, Keep current orders). Death's door reads in the new voice on these jobs. Leaving on time means the van goes at the end of the round, so runners can still board in it.
- Name lists read "Jax and Velvet". Nothing about the rules, odds or saves changed. The plan screen, risk picker and buttons wait for the screens (slice 2).

## 2026-11-11 · The five jobs play the new fights (battle rework, slice 1c)
- **Office Data Pull, Data Scrub, Quiet Hours, Warehouse Lift and Protection Run now play their fights the new way:** enemies show what they will do before orders, the crew follows its plan (protect the tech, then board the van), and a fight can end at the objective, at the van, or in a pull back. Every other job, and raids, fight as before. The fight shows on the watch screen as it always has; its own round screen and plan screen come in the next slice.
- **Two new call-ins** (placeholder wording for now): the tech under fire, and the van that can't wait. Hands-off crews answer by their orders: cautious and steady hold the van for someone down, committed goes on time. Pull back is always there. On a crew away on a job, a call-in is open until the end of that day, then the crew carries on.
- **The death rule changed.** Cautious and steady crews still never lose anyone without a call-in. On **committed** orders a crew fights on with someone down, and that runner can bleed out or be left behind and not make it (about one fight in 27). A runner left behind is missing for a week and comes back badly hurt. The planning read for these five jobs now quotes the new fights, including the chance of losing someone.

## 2026-11-11 · The new fight rules, on their own (battle rework, slice 1b)
- **Nothing changes in the game yet.** The rules of the new fights (pips from endurance, enemy threats shown before orders, orders that carry out the crew's plan, protecting and shielding, the hack, the van, carrying the wounded, bleeding out, the medic's aura) are built and tested, but no job uses them. The five jobs that will (Office Data Pull, Data Scrub, Quiet Hours, Warehouse Lift, Protection Run) still play their fights the old way until slice 1c.
- New files: `core/fight.js`, `data/fights.js` (all the numbers), `data/dilemmas.js`, `data/fightText.js` (placeholder wording; the owner writes the real text), `tests/fight.test.js`.

## 2026-11-11 · Endurance, the eighth stat (battle rework, slice 1a)
- **Every runner has endurance (1-20), shown on their page with the other stats.** It is the body: in the new fights (coming in slice 1b-1c) it will set how many hits someone can take. Nothing rolls it yet.
- **Muscle are built for it.** A new muscle's decent stats are now endurance and cool (piloting drops to a low stat; drivers cover it): a pro muscle has about 9-12, a veteran 10-14. Everyone else has it as a low stat. It grows and fades with age like any stat.
- **Wages barely move.** Endurance counts in a runner's market price like every stat, and the price per stat point went from 5 to 4.5, so the average new lead costs the same (¥628 before, ¥627 after, over 4,000 leads); a tough muscle costs a little more.
- **Old saves upgrade (save v61).** Everyone already on the books gets an endurance rolled the way their other stats were; no other stat changes. The founding crew of the authored start (Stitch, Jax, Static, Wheels, Velvet) have theirs set by hand (Jax 12).
- **Rival names** read an endurance too, when scouted.




## 2026-11-10 · Job done is a seal
- **The end-of-job result is stamped like an ink chop.** The tilted word became a red seal: rough ink edges, a double border with one cut corner like the game's panels, a faint neon glow, the result in stacked block capitals (JOB / DONE, WALKED / AWAY) and a slam-down animation. A small line of Cantonese sits under a rule: 搞掂 (sorted) and 收手 (hands off). Walked away is amber. Reduced motion turns the animation off.
- **A death is not stamped.** "Someone didn't come home" is a plain title in pale type that fades in slowly, with no chop and no slam.
- The characters come from a 2 KB subset of Noto Serif TC Black bundled with the game (`src/ui/fonts/seal-tc.woff2`), so it works offline and on iOS.

## 2026-11-09 · The Anchor's Book (save v60)
- **A monthly slate of the city's runners.** On the first Monday of each month the Brass Anchor Society's elders chalk letter grades, S down to D, for up to 25 runners: other tongs' people, free names and yours. Open it from the new **The Anchor's Book** card at the top of City › Tongs. It shows this month's grades, who moved (up, down, steady, new, back), who has gone quiet, and **Ones to watch**: young names to go and scout (a Scout button on each). A runner's page and a name's profile show their grade.
- **It is the street's opinion, not the truth.** It goes by how well known someone is, how they've been doing lately and their age, plus a bias the street holds about them. It flatters loud tongs and well-known names and misses quiet ones, so scouting still tells you more. It never uses anyone's real worth, and it changes nothing about fame, pay, jobs, heat, loyalty or who gets approached.
- **The Monday Word leads with "The Anchor's slate is up"** (inside the three-line cap). Joss writes once if one of yours moved up, reached S or is down as one to watch. If a rival makes an offer for a runner who is on the slate, the offer says "the slate put a target on them" (the odds don't change).
- Lore: the elders chalk the slate at the Anchor's teahouse in Old Town (never the Silt); see WORLD.md.
- The slate against the truth (`node scripts/sim-book.mjs`, 80 seeds): its top-or-not call matches the real ranking about 72% of the time; the three-band match is about 46% and the exact grade about 23%. Nearly every slate has an over-graded S/A name (about 90 to 94%) and a missed quiet runner (100%).

## 2026-11-09 · The other tongs feel alive (save v59)
- **Stories, not one-off lines.** When a tong loses a hall, The Word now follows it: it takes any work it can get, then it either folds or finds its feet again. A new tong hangs its lantern, opens its first room, then takes its first name from outside. A tong that climbs a rung is later talked about as picking up names. Each story is a few lines over a few weeks, and only ever talk, never results.
- **People you let go stay in the story.** A runner who leaves for another tong (you let them go, or you said nothing) is remembered: The Word says when they sign somewhere, step up, get better known or are let go again, in an "one of yours, once" line. Crew › Wall has a new **Gone elsewhere** list (up to ten names, where they are now). Between two free names of equal worth, one of yours may be put forward first.
- **The Word on Monday is capped at three lines:** one story carrying on, one name of yours, then the rest.
- **A client's remark about a rival follows that tong's real state** ("they are stretched now", "they have more work than hands"). Clients still do not belong to any tong. A folded tong is never named.
- Nothing about jobs, pay, heat, rolls or loyalty changes. Old saves upgrade on load; a runner of yours who already left is marked as one of yours.

## 2026-11-09 · A one-page guide to the other tongs (docs only)
- New `docs/RIVAL-TONGS.md`: what is built for the rival tongs, how they behave, the rules the tests protect, where the code lives, and what is still open. No game change.


## 2026-11-09 · The hall as a compound: buildings to open, defences outside
- A hall's page now opens on the compound from above: each building is a rooftop with its name, who sleeps in it and the rooms built in it, and under the plan a card for each (locked ones say when they open). The raid card and the raiders' ways in are on this view, and defences are placed here, outside, where a raid is fought.
- Tap a building to go inside it: its floor, its beds (laid out as before) and the rooms you can build there. Back (‹ The compound) returns to the compound.
- The hall's level is shown once, in the compound's header. No change to the rules, the grid or the saves.
- With Hall art on, Old Town's buildings are drawn as rooftops (skylights, air-conditioners, tanks, laundry) and their insides as before.

## 2026-11-09 · The Hall page: two columns, a raid card, and an art layer for Old Town
- On a tablet (1100px and wider) the hall page is two columns: the plan on the left, and on the right the raid card, who sleeps here (faces, Move someone in), Build (the palette, Expand, Buy) and a Defences line. You build on the plan in place. On a phone the column stacks under the plan and Build still opens its own screen.
- A pending raid shows the same Threats card as on City, with the threat after our defences, and its ways in are marked red on the plan, labelled with who is coming. Which way a raid takes is still picked when it comes, so every way the hall has open is marked.
- An empty hall shows a "Start building ›" button where it said "Nothing built yet · floor 0/26".
- The plan no longer draws the route line and its unexplained circles; there is a small key under it, and a part's name is never under the Expand hatching.
- New setting, Save › Look › Hall art (off by default, kept on this device, not in the save): draws the Old Town hall with floor tiles, thick walls with a soft shadow, a sprite for every piece, locked areas behind a shutter and neon light. The other halls keep the plain plan for now.
- The palette says each piece's size, and has an All tab beside Defences and Rooms.
## 2026-11-09 · The oath notice, reworded
- The "could be sworn in" message now reads: "{runner} has logged {weeks} weeks on the books for us. They're now eligible to be \"sworn\" into our Tong as a permanent member. Drop {cost} to execute the covenant at the shrine, locking their loyalty and permanently etching their name into the ledger."

## 2026-11-09 · Clients list padding
- Jobs › Clients rows no longer touch the left and right edges of their frame (the row's side padding was being cleared).

## 2026-11-09 · Leads count is a badge
- Crew › Leads shows its count as a badge (like the Today and Jobs tabs) instead of a bare number after the word.

## 2026-11-09 · Raid warning pass
- Raids have their own **Threats** section, pinned above Out now on City › Map. Each card reads "Police raid · Docks hall", then the day, days to go and the cause (the district's heat, a gang's grudge, or being followed home); who is at the hall sits on its own line; and the two plans, Hold the hall and Clear out, say what each costs. "View hall roster ›" replaces the old hall link.
- The first raid you are warned about opens a one-off fixer call (a sheet) explaining the raid; later raids skip it. Hold the hall, Clear out or Decide later.
- The header heat chip, Today (a priority line per raid) and tapping the raided district on the map all go to the raid card.
- Continue shows a soft warning ("Raid hits Sat. No plan: whoever's home will hold.") when a raid arrives tomorrow with no plan. It never blocks.
- Not deciding is a decision: you can set or change the plan any time until the raid. On the day your plan is carried out; with none, whoever is home holds the hall (with nobody home, the call waits for you as before). Today keeps the raid as a priority line, "Raid tomorrow" the day before. Saves upgrade to version 58.

## 2026-11-09 · Reading mail no longer jumps to the top
- On tablets and other wide screens, opening a message on Today keeps your place in the list, so you can read down the inbox without scrolling back each time. Phones still start a message at the top.

## 2026-11-09 · The oath costs eight weeks of wage
- Holding the ceremony for a sworn runner now costs eight weeks of their wage (it was two), and Joss no longer checks the spelling in the ledger scene; that is the wall's job.

## 2026-11-09 · The oath, the ledger and the wall (wording only)
- The world notes now say how a runner is sworn in: tea at the founding room above the noodle shop, their own name in the tong's ledger, an offering at the altar, nothing recited. A sworn name stays in the ledger after they leave, and the Hall of Legends is a wall beside the altar where a crew member writes each name and Joss checks the spelling. A runner who retires into the Hall now sees that in the message. No rules changed.

## 2026-11-09 · Sworn runners (part D4, save v57)
- A runner with 26 active weeks and loyalty of 80 or more can be **sworn**: a lasting place in the tong, with no stat bonus and no raise. Joss tells you once; after that a "Hold the ceremony" button stays on their page, for two weeks of their wage. Sworn stays even if loyalty later falls. Rivals approach a sworn runner a tenth as often, and selling one costs every other runner 6 loyalty (an ordinary exit costs 2).

## 2026-11-09 · Rival tongs make offers for your runners (part D3, no save change)
- Once you are a Street tong or bigger, a rival may approach one of your free, unhurt runners on a Sunday. Joss warns you a week ahead: **Match it** (they stay, on about 15% more than the larger of their wage and market value) or **Let them go** (the rival pays you a buyout, priced the same way you pay theirs). Say nothing and they go at the end of the week, never while they are out on a job. Rookies are approached most, veterans less, Elites and Legends rarely, and loyal runners almost never. The rival lists the leaver among its names.

## 2026-11-09 · Loyalty is a number that moves (part D2, save v56)
- Each runner now has loyalty from 0 to 100, which moves every Sunday: up for a week of real work and for fair pay; down for a week on the bench, pay well under market value, a crewmate lost that week, and refusing a raise (a big drop). The pay-rise screen shows it. It still only changes the raise they ask for, and it starts from jobs together (4 points a job), so nothing changes on upgrade.

## 2026-11-09 · Retirement and the Hall of Legends (part D1, save v55)
- A runner with 52 or more active weeks may now ask to retire, at most one request a week across the crew and never while they are out on a job or hurt. You answer: **Stay one more season** (they ask 20% more, 35% from the second time, and don't ask again for eight weeks) or **Let them go** (their gear goes back to the stash). Leave it a week and they stay on. Anyone who was Elite or a Legend, or worked 26 weeks or more, is written onto the **Hall of Legends**, shown under the Wall on Crew. Saves upgrade with an empty Hall.

## 2026-11-09 · Tidy: unused styles removed, open items written up
- Deleted the styles for the removed Lore cards, Clients strip and Places buttons. `docs/nav-rework-open-items.md` lists what to check while playing the rework and the decisions still open; the handoff's stale build-order line now says which parts were already built.

## 2026-11-09 · Navigation, step 5: Today's crews out is one line
- Today shows one line for the crews out (with the calls waiting), linking to City › Map, where the full cards live. This was already how it worked, so the change is small: the line now says "City ›" and not "Ops ›", the sitemap was corrected, and a test pins it. Take the call works from the call-in message on Today and from the card on the Map.

## 2026-11-09 · Navigation, step 4: the Lore tab's contents move home
- **Districts:** each district's page (City › Districts) now has what's happening there first (who's at the hall, crews out, work open, street talk), then its picture, pitch and write-up (who runs it, police, at 3am, local custom, landmarks, kinds of work). The lore shows even in a district where nothing is going on. The "About … on Lore" and "See it on Ops" links are gone.
- **Clients:** Jobs › Clients lists every client, and each has a page: where you stand and what they have on the board above, who they are below. A job's plan links to it. The strip of clients under the job board is gone.
- **The Book** now holds Who's who and History only, unchanged and in order.
- Every entry in the migration register is checked off, and `tests/lore-register.test.js` checks that each is reachable with its text intact.

## 2026-11-09 · Lore migration register (nothing moved yet)
- `docs/SCREENS.md` now lists every Lore entry (91 rows: districts, clients, Who's who, History) with where it is, where it will go and which links point at it, plus four questions for the owner. The Jobs Clients note that said "the Lore tab" now says "the Book".

## 2026-11-09 · Fix: a report from a job with a getaway opened with an error
- Opening the report of a job that rolled a getaway threw an error in the full log, because that log assumed every event had a choice. The getaway now shows as its own line with its roll, and an event of a kind the log doesn't know no longer breaks it.

## 2026-11-09 · Navigation, step 3: Ops becomes City; recruiting moves to Leads
- **Ops is now City**, with Map · Districts · Tongs. The old "Places" buttons are gone. Map: the city map, Out now, Tonight. Districts: a card for each district, each opening its page. Tongs: the other tongs by tier, free names, names on the street. The Book link sits in City's header on every sub-tab.
- **Heists** moved to Jobs › Heists (Jobs is now Board · Heists · Side). The Map keeps a one-line marker that links there.
- **Scouting, "What it would take" and signing moved to Crew › Leads**, for free names and for names in another tong. Nothing about who you can sign, what it costs (including the buyout to their tong) or how scouting works changed. In City › Tongs a name in a tong has a read-only profile with a "View in Leads" button; a free name opens straight in Leads. The scout row on the side-work board is gone.
- Today's crews-out line goes to City › Map; the Monday heist line to Jobs › Heists. Back returns.

## 2026-11-09 · Navigation, step 2: a Tong tab, Crew in three parts, Save in the ☰
- New **Tong** tab, "what we've built": your rank in words (and what the next rung would take), then Halls and the Armoury. The halls (and each hall's page and Build) and the Armoury moved here from Crew.
- **Crew** is now Roster · Leads · Wall. Today's "See the leads" opens Leads.
- Five tabs: Today, Ops, Tong, Crew, Jobs. **Save** is the ☰ at the top, **Lore** is behind a **Book** link in Ops' header (the same Lore pages, unchanged for now).
- Badges: Today counts everything waiting on you (calls, raids, hall offers, decisions, unread), each once. Jobs counts open jobs. Ops and Tong show no number.
- A job's plan survives a trip to the Armoury: Back puts you in the plan as you left it.

## 2026-11-09 · Navigation, step 1: every page has one home, and Back goes back
- A hall's page (and its Build screen) now always opens on Crew, wherever the link was: Ops' district card, Today's raid cards or Crew's Halls list. Before, it stayed on whichever tab you opened it from.
- Back is one control with a memory. It returns to the view you left: the same tab, filters and open page, scrolled to where you were, with a job's plan and squad still as you set them (Plan → Armoury → Back). It never rewinds the game: the page you return to shows today's state. Choosing a tab starts afresh. Root views, like a tab's first screen, show no Back.
- Nothing in the save or the rules changed.

## 2026-11-08 · A lighter crew list
- The Crew list no longer shows each runner's highlight line or the scout's read of their potential. Both are on the runner's own page: the highlight right under their name, the potential in Development.

## 2026-11-08 · Free names: scout them, then sign them
- **Ops › The other tongs › Free names:** every three to six weeks a runner between tongs is put forward. Open their page to see what the street says, what they'd want, and what it would cost.
- **Scouting:** send someone to watch them for two days (from their page, or from the side-work board on Jobs). A good trip shows their stats and how far they might go; each further trip sharpens that read, up to a sure one.
- **Signing:** a runner may want a bit more than their worth to be convinced, depending on your tong's rank, any Legends or Elites on the crew, a leader, a free bed and your cash. A runner still in another tong also costs a buyout fee, which goes to that tong and cools them toward you a little. Heads of tongs won't leave. If you can't sign them, the page says why.

## 2026-11-08 · The other tongs fold, form and let people go (behind the scenes, save v53)
- Poor, small tongs now fold, their runners drift free one by one, and a new tong can form from the best of them. Now and then a free name is put forward (every three to six weeks, at random). Nothing is on screen yet: scouting, signing and the buyout fee come with the next slice, and nothing about your jobs, pay, heat or rolls changes. Rival tongs now have a "regard" for you instead of a grudge, which only an explicit poach or a shared job will move.

## 2026-11-08 · The other tongs turn up on your jobs
- The "Rival crew" twist now names a real tong and one of its runners ("Dim Hour Society is here for the same job, with Lena Novak out in front"). A tong based in the job's district turns up more often. It's two crews after the same job, not a feud: the choices, odds and costs are exactly as before. The next Monday, the Word may say the tong had people at the same door as yours.
- Now and then a client mentions on the plan screen that another tong wanted the job ("I would rather you"). Flavour only.
- Rival tongs hold no grudge against you.

## 2026-11-08 · The city asks: the Legend defining job (save v52)
- When a runner has everything it takes to be a Legend (Elite, a veteran, 26 active weeks, 120 jobs at their level and a path's Legend numbers), the city asks for them by name: a hard job (threat 3-4, a step harder, half again the pay) goes on the board for a week, tagged "Their moment". Do it with them on the crew and they become a Legend, for good. If you open a heist and its finale is up, the finale is their moment instead.
- Fail, abort, skip it or let it expire and the city asks again in four weeks. A runner who dies on it is a Legend for good, and the memorial says so.
- The call, the earned message and the posthumous one each read differently for a Ghost, an Enforcer, an Earner, an Iron and a Lifer. Retirement and the Hall of Legends come later.

## 2026-11-08 · The Word reads better
- Street talk about the other tongs has more ways of being said, no longer repeats the same news about the same tong within a month, and a doubled "the" is fixed. When your own tong climbs a rung (a new hall), the Word says so once. Nothing about jobs, pay, heat or rolls changes.

## 2026-11-08 · Names on the street, kept honest
- Your own runners take at most half of Names on the street, and a runner's hidden rating now climbs over a year instead of maxing out in a quarter, so the other tongs' runners stay in the talk. Nothing about jobs, pay, heat or rolls changes.

## 2026-11-08 · You can hear about the other tongs
- **The Word** on Monday's briefing: up to three lines of street talk about the other tongs (who took what work, whose name is going round, who's gone quiet). Talk, never results or numbers.
- **Ops › Places › The other tongs:** the city's other tongs grouped by how far their name carries (Back Room to Harbour), each with its style, district and head; tap one for its page.
- **Names on the street:** six to eight runners people are talking about, unranked. Your own people can be among them once their name carries.
- Nothing about your jobs, pay, heat or rolls changes.

## 2026-11-08 · The other tongs, behind the scenes (save v51)
- No change you can see yet. Lantern Bay now has about six other tongs, made fresh for each game, that rise and fade week by week in the background, with about forty named runners between them. Nothing on screen shows them yet (that's the next slice: the Monday Word, Ops › Tongs and Names on the street), and nothing about your jobs, pay, heat or rolls changes. Old saves get their own set of tongs when they load.
## 2026-11-08 · Piloting: followed home
- A **bad getaway** (5 or more under the number) now means someone follows the crew home, and the followers are the raid: one is warned at once on the hall most of them live in (the police, or the gang the job crossed), one threat step harder, with the usual hold, pay or walk-out choice. A plain miss only keeps the heat. A pilot of 14 or better shakes even a bad miss.
- Faster jobs and same-day hall moves are dropped from the piloting plan: getting across the city doesn't take a day.

## 2026-11-08 · Piloting: driving gets a getaway (save v51)
- Driving is now **piloting**, and drones use it: a drone's overwatch rolls piloting, and Drone Jockey needs piloting 10 instead of tech 10. Old saves are converted.
- **The getaway.** When a job is leaving heat, the Wheels (or else the best pilot who came home) rolls to get the crew out. A good getaway takes 1 heat off, a clean one 2 (never below zero for the job, and never the Loud approach's own +1). A miss changes nothing; a bad miss leaves a tail, so the next job in that district starts watched. A quiet job has no getaway roll. It shows in the report, and the Wheels card on the squad board shows its risk.
- Not yet: faster jobs, same-day hall moves, arrival times for the van, raid support and boats (the rest of `drafts/PROPOSAL-piloting.md`).

## 2026-11-08 · Plan: the other tongs, without a league
- No game change. The plan for rival tongs (`drafts/PROPOSAL-phase-3.md` part C) is rewritten: there's no league table, ranked list or ratings. The city's other tongs rise and fade in the background, and you hear where you stand through tier words, Monday's Word and who comes knocking. Your own runners can turn up among the names people talk about.

## 2026-11-08 · The squad board as polaroids and an inventory
- **Each runner on the squad board is now a polaroid with their kit laid out under it**, on a straight grid two cells wide: a rifle, drone or deck as wide as the photo, a sidearm, kit or vest half that. A small icon before each name shows their role.
- **On a phone** the whole team fits across one row: the first row of gear shows, with "+1" (or more) for the rest. **On a computer** you see all their gear with names.
- **The board is a gear mat** washed in the approach's colour (Stealth blue, Loud red, Con amber, Tech teal), with its name faint in the corner. An empty slot you should fill pulses, and the mat flashes when a change moves the risk.
- Overwatch shows the rifle or drone they'll use first. Freelancers keep their violet edge.
- Screenshots: `docs/screenshots/2026-11-08-polaroid-board/`.

## 2026-11-07 · The direct buzz, and the end of a job
- **Heists ring:** when Madam Rao (or Mr. Szeto) has a big one, their direct line rings over whatever you're doing. Pick up and they tell you the score in their own words, with the prep jobs and the stakes; "We're in" opens the board, "Let me think" leaves it on Today. The finale night rings too.
- **A job ends properly:** after a live job, the crew walk back to the van instead of jumping there, then a card stamps the result, counts the pay up and brings the team in one by one, each with what the job did to them (a wound, a stat up, promoted). See the report, or head back to the safehouse.

## 2026-11-07 · Playtest round: the plan bar, gear on the cards, unread filter, faces on the report, grid routes, the face-off
- **Send them or watch:** the plan bar has Watch live right beside Send them. On a wide screen the orders (when they call you in, and how they decide on their own) sit under the button as chips, so you don't need to open the Orders section.
- **Gear on the squad cards:** each runner's card shows their main gear, drawn: Grid's rifle, a drone, a deck or a sidearm.
- **Unread filter on Today:** All / Unread chips above the messages.
- **Who went, on the report:** a job report starts with the crew's faces, how many rolls each made and missed, and any wound. Tap a face for their page.
- **Routes on the grid:** the crew's route on the job map (and on the crew-out cards) runs across and up and down, corners cut at 45°, and goes round buildings instead of across them.
- **The face-off:** when a moment comes down to one person's roll, it pops up over the map: your runner's face against the guard (or the lock, camera, safe...), the stat they roll, the die landing, then a hit if they make it or a jolt if they don't.

## 2026-11-07 · New opening jobs for Wok Court and the Underterrace
- **Back Rent** is new: Mrs. Ip's stallholders' association paid its rent, but a new agent says otherwise and has a contractor ready to lock their spare rooms. Find the payment, get the notice withdrawn and the order cancelled in writing, and Mrs. Ip introduces you to the association and the Late Rooms.
- **Still on the Books** replaces There Is No Forty-First Floor as Glass Heights' opening job: Forewoman Tse's cooperative has been marked vacant after thirty years. Recover its occupancy agreement and get it recognised, and the Underterrace is open to you.
- Both build trust with Mrs. Ip and Forewoman Tse. Saves upgrade (v50): an old Forty-First Floor offer on the board becomes Still on the Books.

## 2026-11-07 · Mrs. Ip and Forewoman Tse are clients
- Two new, smaller clients with their own trust: **Mrs. Ip** (Night Market) and **Forewoman Tse** (Glass Heights). They're on the Jobs tab's client strip and in Lore › Clients.
- Mrs. Ip now gives her own routine work (Closing Stack, Crate Return, Inspection Hours, which came from Auntie Fung) and asks Back Rent, so finishing it builds her trust, not Madam Rao's. Forewoman Tse asks the Glass Heights hall's favour; Mr. Szeto has nothing to do with the Underterrace.

## 2026-11-07 · Two opening jobs brought in line with the halls' lore
- The Flat Doesn't Exist: Okonkwo now has the flat rented to you through the property trust's contracts man ("On paper it's storage"), not by Aether-Harbour, and the way out is the Buckle Passage, not the old yard stair.
- Quarter to Two: the Ferryman no longer hands over the office key himself; he calls up to the pier cooperative, whose container office is going.

## 2026-11-07 · The four halls get their names and stories
- The Night Market hall is now **Wok Court**: rooms behind a dai pai dong courtyard, leased from the stallholders' association. Mrs. Ip makes the introduction; the tong no longer lives above Madam Rao's shop. The Docks' hall is **the Stove Pier**, the Basin's **the Unlisted Rooms**, Glass Heights' **the Underterrace**, introduced by Forewoman Tse.
- Every part, lane, yard, gate and the things lying about outside have their own names and descriptions on the build screen and the hall's page, and each raid opens with a line of its own ("The Cart Gate bangs against its frame...").
- The Night Market and Glass Heights halls no longer wait on a client's trust: reputation and the opening favour open them. The Night Market still opens at reputation 25. Back Rent and There Is No Forty-First Floor now end by pointing you to the new halls; their full rewrites are coming.

## 2026-11-07 · Every hall grows into a compound
- The Night Market, Docks, Basin and Glass Heights halls now grow like Old Town. Each starts as its first building and the lane beside it; Expand takes the building across the lane, then the walled yard behind with its gate, then a small building across the passage. Each part adds two beds (the yard's go in the second building). Prices: ¥20,000, ¥30,000, ¥40,000, a little more in Glass Heights.
- Each hall has its own ground and look: the Night Market's market lane and cart court, the Docks' walkway and container yard, the Basin's course lane and stable yard, Glass Heights' service corridor and plant deck. The Docks and the Basin are drawn the other way round. The part names are placeholders until their lore is written (`drafts/BRIEF-hall-compounds.md`).
- In every hall, rooms go inside and defences go outside, where a raid is fought between the buildings. A raid's opening line says which way it came in.
- Saves upgrade (v49): anything already built in those four halls is cleared and paid back in full, with a note.

## 2026-11-07 · The Old Town hall grows into a compound
- The Old Town hall is now a block of separate buildings with space between them. You start with the room above the noodle shop and the lane beside it. Each Expand takes the next part: the flat across the lane (¥20,000), the walled yard behind with a gate onto the back alley (¥30,000), then the back kitchen across the passage (¥40,000). Each brings two more beds, and once the whole block is held there's nothing more to expand.
- No floor allowance in Old Town: every square of the parts you hold is yours to build on. Parts you don't hold yet are hatched on the plan; tap the next one to take it. Squares kept clear for a way in are faintly marked, and tapping one says why.
- Raids on Old Town are fought outside, between the buildings: up the lane from the street, or, once you hold the yard, through the yard gate. The buildings are solid in a fight, so defences belong in the lane and the yard.
- The hall's page lists the block's parts, and Expand says which part it takes.
- Saves upgrade (v48): anything already built in the Old Town hall is cleared and paid back in full, with a note in the inbox. The other halls are unchanged for now.

## 2026-11-07 · A mock-up: halls that grow into compounds
- No game change. `drafts/prototypes/hall-compound.html` shows the Old Town hall growing with each Expand: the room, the flat next door, the yard behind with a gate, then the back kitchen and the street shutter, a compound. You build zoomed in to one part at a time. For the owner to judge before anything is built.

## 2026-11-07 · A page for each hall
- Each hall has its own page: where it is, its plan as built (beds included), who sleeps there, moving people in from other halls, and Build, Expand and Buy. Open it from a hall's row on Crew › Halls, or with "Manage the hall ›" on its district's card on Ops; it shows on the tab you opened it from, and back goes there.
- Crew › Halls is now a short row per hall (beds, level, rent, heat, what's built); tap one for its page. "Open a hall" stays on Crew.
- The build screen's back link goes to the hall's page. A raid warning's "Who lives there" link opens that hall's page.

## 2026-11-07 · Beds on the floor, and a whole floor to build on
- A hall's beds are now blocks on its build plan, one per bed, instead of a "BUNKS" label over cots that never changed. A bed someone sleeps in is outlined; tap one to see who sleeps there. Expanding a hall adds two more blocks. Nothing can be built on a bed.
- Every hall's floor is now one clean rectangle of squares to build on. The hall's own things (the altar, the crates, the stove, the silk racks, the server racks) stand along the walls instead of leaving holes in the floor, so they're still cover in a raid. The build screen's top line shows the beds too ("Beds 5/8").
- In a raid, the beds are on the map as cots, the same half cover the drawn cots gave before.
## 2026-11-07 · Proposals for piloting, medical and leadership
- No game change. Three proposals in `drafts/` follow the stat-usage results: driving becomes piloting and is worth time (`PROPOSAL-piloting.md`), medical becomes the support stat with named wounds (`PROPOSAL-medical.md`), and leadership and judgment arrive with a Leader slot (`PROPOSAL-leadership.md`). Each lists the owner's calls before anything is built.

## 2026-11-07 · Measuring which stats matter
- Tools only, no game change. `scripts/sim-stats.mjs` plays a year of the game 60 times under five ways of playing (careful stealth with Joss's picks, loud, mixed approaches, the tong running every crew, and always a Wheels) and counts every roll by stat: how often it's rolled, on how many jobs, how many rolls were close calls, how many failures cost something, and whether specialists use their main stat. It then gives everyone +3 in one stat at a time to see what that changes by week 52. The counting only reads what each job already writes down, so no roll changes; a test checks the same seed ends with the same cash either way. The plan and the agreed thresholds for cutting, reworking or rebalancing a stat are in `drafts/PLAN-stat-usage.md`.

## 2026-11-07 · Madam Rao's own prep jobs, and the Hei Lok
- **The Big Table now has its own six prep jobs** in place of borrowed ones, two for each step: The Guest Copy or After the Applause (a briefing on the guests, staff and routes), An Old Account or Someone to Cover (the pit boss's night off), and Service Included or Manual Handling (a maintenance window that slows the casino's alerts). They're danger 2 jobs for three, pay ¥3,200–4,000, and only come up as Rao's prep.
- **The casino is the *Hei Lok*,** a casino airship tethered above the Night Market and owned by a small family company, Hei Lok Leisure. Nobody's gang owns it, so **Casino Con (and Rao's heist) no longer angers the Red Lanterns**; the crisis where the owner comes down to watch is now the owner's son, and the crew leaves by the cage lift down the mast.
- A regular who recognises your face now remembers you from the Porto Clara tables.
- **New words throughout:** Madam Rao's and Mr. Szeto's messages, what each prep step is for, and what it gives the finale. Buying a step from a fixer now says what you're buying.

## 2026-11-07 · Heists: Madam Rao's Big Table
- **The first heist.** Around reputation 15 (about ten weeks in), Madam Rao asks you to the biggest night of a baccarat room over Glow Street: **The Big Table**, three weeks away.
- **Three prep jobs go on the board at once**, each flagged "Prep · The Big Table". Each one you finish makes the night easier, and the finale's plan shows how: intel (+1 on every roll), the pit boss not watching the table, or the danger one step lower.
- **Prep that goes wrong isn't the end.** Walk away or fail and she finds you another job for it, once. After that you can **buy it from a fixer** (Ops: Buy) or go without.
- **The finale goes up in the third week** and stays until Sunday: Casino Con, paying about ¥11,000, at danger 3 (2 with the prep). Send them, watch, or take command. Finish it for the pay and +5 reputation. Walk away, or let the week pass, and it's over.
- **Ops shows the heist on top:** each step, what it gives, and a Plan or Buy. Monday's briefing and Sunday's summary say how far the prep has got.
- **A second heist for later:** Mr. Szeto's Seventy-One Floors (the Penthouse Heist, ¥28,000) once you have three halls and reputation 60.
- Both heists use existing jobs for now; their own stories come later.
- Save format v47. Older saves carry on; the heist is offered the first Monday you qualify.

## 2026-11-07 · A plan for Phase 3
- No game change. `drafts/PROPOSAL-phase-3.md` plans what comes after the halls: heists (prep jobs that each change a big finale), the Legend defining job, rival tongs (a league of other tongs, generated each game, with a Lantern List of the city's best runners), then loyalty, runners being tempted away, and retirement. It lists the owner's calls before each part.

## 2026-11-07 · The Ops map: smaller labels, a frame, and zoom
- **District labels are smaller** and stay the same size on any screen; on a computer they were huge. They show only what's there: no more "HEAT 0".
- **Districts with a hall of ours, and the one you pick, show their landmark** as a small picture on the label.
- **The map has a frame**, with corner brackets and the legend inside, so it no longer melts into the page.
- **Tap a district to zoom in on it**: the map eases onto it, its landmark appears, and its card opens beside it (under it on a phone). **× Whole city**, Esc, or a tap on the harbour zooms back out.
- **"The city tonight" is now "Tonight"**: only districts with work or street talk, each row going somewhere the map doesn't (a job's plan, the job board, the rumour). The rest are one line.

## 2026-11-06 · A smaller save: old messages are cleared
- **The inbox no longer keeps every message since day 1.** Read messages go after four weeks, unread ones after eight, and it never holds more than 200. Anything still waiting on you stays however old it is: decisions, raises, heat notices, specialisation offers, call-ins, raid calls, a hall offer you haven't taken, a raid warning before the raid.
- A year's save was over half a megabyte, nearly all of it old messages; it is now under 200KB. Saves load and write faster and leave more room for backups and slots.
- Your saves are trimmed the same way the first time they load.

## 2026-11-06 · The carry grid
- **A runner now wears armour, has two implant sockets, and carries a bag.** The bag is 4×2 squares: a rifle, sidearm, drone or deck takes three, a trauma kit or ghost kit one. So a runner can carry a rifle *and* a deck, or a drone with a ghost kit and a trauma kit beside it.
- **Two implants** both work, and both keep neural load up: between jobs it stays at 20 or more with two.
- **Different kinds of kit add up; the same kind counts once.** A deck and a ghost kit give tech +1 and stealth +1; two ghost kits still give stealth +1.
- **On a runner's page:** tap an empty square to pack something that fits there; tap an item to pick it up, then a free square to move it, or take it off.
- Your saves keep everyone's gear: each runner's weapon and tool move into their bag, and their implant into the first socket.

## 2026-11-06 · Gear on a grid
- **Gear pictures sit on an inventory grid:** a rifle, sidearm, drone or deck fills a strip of three squares; a vest, trauma kit, ghost kit or implant takes one square, with the empty squares beside it. No more black bars, and the item names line up down the armoury.
- On the squad board, an overwatch runner's card shows their stat with the shots or actions on the line under it, instead of breaking across two lines.

## 2026-11-06 · A runner's stats, lined up
- On a runner's page the progress bar under each stat now sits at the bottom of its tile, so the bars line up whatever notes are above them.

## 2026-11-06 · A runner's page, tidier
- A runner's status ("ready", "hurt", "back in 2 days") now sits at the right of the line with their fame, instead of squeezed under it.

## 2026-11-06 · A lighter top bar
- **The tong's rank** ("Back Room tong") is on the Ops heading now, not the top bar. Tap it for what a tong is.
- **Heat only shows when a district is warming:** from 3 a chip names it ("Heat Docks 4"), amber, and red from 6, when a police raid can come. Tap it to see that district on Ops.
- **The date** reads "Mon · Wk 1". The season shows on its first day, and Sunday's message names it ("Week 3, season 1 settled").
- The bills line is just "¥2,750 due Sun".

## 2026-11-06 · Drones and cyberdecks, drawn, and the rest of the armoury
- **Every piece of gear has a picture now.** The armoured vest, the trauma kit, the ghost kit and both implants are drawn too, in a square frame so compact things aren't stretched.
- **Lockpicks are now the ghost kit**, still +1 stealth: a bypass roll most of the time, sometimes a lock decoder, a heat veil (a hooded poncho that blurs you on thermal and on cameras) or a lens blinder.
- **More builds:** most vests are plate carriers, sometimes an armoured jacket or a hex-weave undershirt; most trauma kits are bags, sometimes a hard case, a roll or a med gun. Implants come as a spinal harness or a forearm sleeve, a chip module or a behind-the-ear bud.
- **The armoury is shorter on a phone:** each item's picture sits beside its name instead of across the row.
- **Drones and cyberdecks now have pictures** in the armoury and in a runner's gear slots, drawn like the rifles: street ones patched and taped, pro ones dark with a neon line.
- **They come in different builds.** Most drones are quadcopters, but now and then one is a flying-wing kite or a ducted-fan drone. A cyberdeck is a keyboard slab, a hard-case deck or a handheld brick. The armoury says which.
- Fixed: on a phone the week's squares in the top bar could run into the heat.

## 2026-11-06 · Planning a job: quicker to look and to change
- **The runners beside the job list open their page:** tap one to see their stats, record and gear (and change it), then "Back to the job" returns to the plan as you left it.
- **Each card on the squad board has an ×** to take that runner off at once. Tapping the card still opens the list to swap someone in.
- **Picking who goes is clearer.** The list says what the job wants ("about 10 in medical or cool") and what the colours mean. Your own crew comes first, freelancers have their own section below with their cut, then those already on the squad, and anyone not free today is folded away. Joss's pick for the slot is tagged. Sort by best fit or by any of the job's stats. On a phone the stat that counts most is shown big; on a computer it's a table you read down, sorted by tapping a column.
- **The racecourse stables plan** (the Basin's jobs) no longer has the track running over the first stable row, and the service gate's label is clear of the hay bales.

## 2026-11-06 · Ops gets its own tab; City becomes Lore
- **The tabs are now Today · Ops · Crew · Jobs · Lore.**
- **Ops, the new second tab:** the city map, everyone out, raids and calls, and the city tonight (what City's Map tab was). The count of calls waiting is on it, and sending a crew out lands there.
- **City is renamed Lore**, and is about the city again: a new **Districts** section comes first, a card per district led by its picture (the Docks' cranes, Old Town's alleys, the Night Market's neon, Glass Heights' towers, the Basin's racecourse). Tap one for who runs it, the police, the night, the local custom and the landmarks. The three districts not open yet follow, with what the street says about them. Then Clients, Who's who, and History (what the Lore section was).
- A district picked on the Ops map links to its write-up on Lore, and back.
- **The Ops map is bigger on tablets and computers:** about a third larger, and still on one screen.
- **Heat in the top bar names the hottest district** ("Heat · Docks 6/10"; on a phone just the number) and a tap opens it on Ops.
- **Save is at the foot of the sidebar** on computers and tablets in landscape, away from Continue. Phones keep ☰ in the top bar.
- Fixed: on a phone the top bar was a little wider than the screen, so the page scrolled sideways and ☰ was half cut off.

## 2026-11-06 · Buy a hall, and a work board
- **A hall can be bought outright:** 26 weeks of its rent, once. After that it pays no rent, and making it bigger adds none. Crew › Halls has "Buy the place" on each hall; a bought hall is marked ours. The home hall can be bought too.
- **A new room, the work board** (¥8,000, 2 × 2). Street freelancers come in for small work the tong brokers in that district, and the tong keeps a fifth of the fee:
  - one job a week at level 1, one more for each Expand;
  - it's never the jobs on your own board, and nobody of yours goes;
  - about one in ten goes wrong: no fee, and that client thinks a little less of you;
  - now and then a freelancer who did well asks to join;
  - Sunday's message says what the boards brought in.
- **Save format v44.** No hall in an old save is bought yet.

## 2026-11-06 · Balance: halls cheaper to keep, raids a little likelier
- **Hall rent is halved:** the Night Market ¥500 a week, the Docks and the Basin ¥600, Glass Heights ¥800. A second hall was costing more than it brought.
- **Raids come a little more readily:**
  - police from heat 6 in a hall's district (was 7);
  - a gang from a grudge of 5 (was 6);
  - grudges now fade every other Sunday, not every Sunday.

## 2026-11-06 · Opening jobs
- **A hall is earned now, not just offered.** Once a district's contact would have you, they ask a favour first, a job of its own:
  - *Back Rent* for Madam Rao (the Night Market);
  - *Quarter to Two* for the Ferryman (the Docks);
  - *The Flat Doesn't Exist* for Ruth Okonkwo (the Basin);
  - *There Is No Forty-First Floor* for Mr. Szeto (Glass Heights).
- **It's on the board for two weeks,** flagged "Opens the … hall", and its plan says what finishing it gets you. Finish it and the hall is offered at once: pay the deposit as before.
- **Walk away, fail, or let it go off the board,** and the contact asks again two weeks later, with one of their own jobs as the test.
- Crew › Halls says what's still needed ("Madam Rao wants a favour first: Back Rent, on the board").
- **Save format v43.** Halls already offered or opened in an old save need no favour.

## 2026-11-06 · Mini maps on the crew-out cards
- **Each crew out on City now has a small map of its job's site.** The route walked so far is solid, the rest dashed, and the crew stand as dots where they got to today. A dot on the perch or by the van shows someone on overwatch or the wheel.
- **A crew waiting on your call** shows yellow with a ring that pulses (still with reduced motion). Nothing else moves.
## 2026-11-06 · The auto turret
- **A new defence for a hall: the auto turret** (¥12,000, level 2, one per hall).
- In a raid it fires on its own every round at the nearest raider, with nobody on it: 6 bursts a fight, then it clicks dry. Raiders can't knock it out.
- It counts as a defence piece toward making raids easier.

## 2026-11-06 · The den and the cyber doc
- **Den** (¥14,000, level 2, 2 × 3, turns): a mahjong table and a karaoke screen. Whoever lives there asks for a smaller raise when they want a new deal.
- **Cyber doc** (¥25,000, level 3, 2 × 2): one in the whole tong. While you have one, implants in the armoury cost a quarter less.

## 2026-11-06 · Rooms in a hall
- **The build screen has a Rooms tab.** Each room helps whoever lives in that hall, and a hall can have one of each:
  - **Clinic** (¥18,000, level 2, 2 × 2): injuries heal twice as fast while they're home.
  - **Bunk room** (¥15,000, level 2, 2 × 3, turns): two more beds, and no more rent.
  - **Canteen** (¥10,000, level 2, 2 × 3, turns): fatigue goes faster at home.
  - **Stash** (¥10,000, 2 × 2): walking out of a raid loses half as much.
  - **Lookout** (¥12,000, 2 × 2): a raid on this hall is warned 4 days ahead, not 3.
- Rooms aren't cover in a raid. A bunk room can't be removed while its beds are slept in.

## 2026-11-06 · Defences make raids easier
- **Every 3 defence pieces in a hall make a raid there one step easier** (fewer, weaker raiders), never below the easiest. This counts for police and gang raids alike.
- The build screen says how many are built and how many more give the next step. The hall's row on Halls says the effect, and so does Hold the hall at the door.

## 2026-11-06 · Building up a hall: the build screen
- **Each hall on Crew › Halls has a Build button.** It opens the hall's plan, the map its raids are fought on, with the free squares marked.
- **To place something:** tap a free square, pick a barricade, a steel plate or an inner wall, then Place. The piece shows where it would go first. A plate or a wall can be turned.
- **Tap something built** to turn it or remove it (half its cost back).
- The bar at the top shows the floor used (6 squares at level 1, 4 more for each Expand) and your cash. When something can't be placed, the screen says why.
- Each hall's row says what's built there.

## 2026-11-06 · Building up a hall: the groundwork
- **What you build in a hall will be part of its raids:** a barricade is half cover, a steel plate full cover, and an inner wall is solid. You can't place anything yet; the build screen comes next.
- **The Docks hall's pier is a little wider.**
- **Save format v42.** Old saves start with nothing built.

## 2026-11-05 · The districts' landmarks
- **Each hall on Crew › Halls shows its district's landmark** beside it, lit in the gang's colour:
  - Old Town: the tenement and its shrine.
  - The Night Market: the stall under paper lanterns.
  - The Docks: the crane over container 409.
  - The Basin: the floodlit Old Stand.
  - Glass Heights: the Central Tower.
- Halls you haven't opened yet show theirs dimmed.
- **A raid shows the hall's landmark with a red glow behind it:** in Out now on City, in the warning, and at the door when you make the call.
- The City map stays as it was, without them.

## 2026-11-05 · Each hall its own map
- **A raid is now fought in that hall's own place,** not one shared layout:
  - **Old Town:** the room above the noodle shop. Up the front stairs past the noodle crates; out by the fire stair. Bunks, the mahjong table, the altar and a lacquer screen.
  - **Night Market:** two rooms above Madam Rao's sari shop. Racks of silk, the cutting table; out through the roof hatch.
  - **Docks:** a container office at the end of the old pier. Containers, bollards and pallets on the deck; out down the ladder to a boat.
  - **Basin:** a flat over a tack workshop, with the Old Stand through the window. Up through the workshop's trapdoor; out by the yard stair. Saddle racks, hay bales and stacked tack trunks.
  - **Glass Heights:** a service floor nobody upstairs remembers. Out of the service lift; away down the maintenance stair. Rows of server racks.
- Both sides find cover in every hall: our people by the way out, the raiders by their way in.

## 2026-11-05 · Gang raids
- **The gangs remember.** A job that hurts the Red Lanterns or the Silver Fan Circle adds to that gang's grudge; it fades a little every Sunday. Six jobs count so far (Protection, Casino, Chrome, Herbal Run, House Advantage, Inspection Hours).
- **You see it before you take the job:** a flag on its card ("Against Silver Fan") and a line in its plan with the grudge it adds. Each gang's grudge is a gauge on Who's who and on its districts' cards.
- **With a grudge of 6 or more, a gang may come for a hall of ours on its own turf** (the Red Lanterns in the Docks; the Silver Fan in the Night Market and the Basin). Old Town is safe: the Brass Anchor never raids. Warned three days ahead, like a police raid.
- **Gangs expect a settlement:** you can always pay tribute, before the day or at the door (dearer), and it halves their grudge. Or hold the hall against their enforcers or collectors, or walk out the back (nobody hurt; their grudge stays).
- **Save format v41.** Old saves start with no grudges.

## 2026-11-05 · The City map, redrawn
- **The City map is now the command centre's neon map**, as in the mock-up: a compact map of the city that fits a phone with room for the card underneath. Districts in their gang's light, halls a little brighter, locked districts hatched.
- **Each district's plate says who's based there, its work and its heat** ("⌂ 7 here · heat 1").
- **Crews out show as their faces** on the district they're working, on a dotted route from their hall. A crew calling you rings yellow and pulses; side work is a smaller grey token.
- **Heat glows** round each district, sodium, amber, then red; **a raid warned** rings the hall.
- A legend under the map. Every district's name is a big tap target.
- Only calls and raids move on the map; all of it stays still with reduced motion.

## 2026-11-05 · Raids on the halls
- **Run a district hot where you have a hall, and the police may come for it.** At heat 7 or more there's a chance each day of a warning: they'll be at the door in three days.
- **The warning shows on City** (top of Out now, with who's home and the day), as a red ring round the district on the map, on Today, and in Coming up. Until then you can move people into or out of the hall, or keep crews home.
- **Only the Wet Sleeve can be paid off** (in the Docks and the Night Market), and not cheaply. Everywhere else they can't be bought.
- **On the day you get the call:** hold the hall with whoever is home, walk out the back, or pay them at the door where that's possible.
- **Walking out hurts nobody.** You lose what was kept there and pay for repairs, and the hall is shut for a week: its people lie low and can't work, and nobody can move in.
- **Holding is a fight in the hall itself**, on its own map (the back stairs, the bunks, a table on its side, the front door), with orders each round, like command fights on a job. As always, nobody dies unless you choose to keep fighting with someone down. Hold, and the heat there eases; the district hears of it.
- **Save format v40.** Old saves have no raids yet.

## 2026-11-05 · The plan bar beside the job list on wide screens
- **On a wide screen (1400px and up) the plan bar sits in the left column, right under the job list**, instead of floating along the bottom over the plan. It stays in view as you scroll the plan; a long job list scrolls on its own above it.
- In that column the bar has room: the whole reason shows (no "…"), Send is full width, and the Try chips wrap underneath.
- Phones and tablets are unchanged: the bar is still at the bottom of the plan.








## 2026-11-05 · Handoff, architecture and docs brought up to date
- Docs only, no game change. `HANDOFF.md`: `main` is up to #78; the "Now" line describes Phase 2 as built so far; the City item no longer lists heat per district as still to do; tests are 564; a section on what the 2026-11-04/05 sessions did (the tong, the shorter job plan, Joss's voice, new jobs); and the open items from the planning and fight reviews in Next.
- `docs/ARCHITECTURE.md` describes `main` at #78 and save v39: the state's shape (rank, halls, heat per district, the week), crews out day by day, heat per district, offers with their own days, the new core files, test counts. `CODEMAP.md` lists the smaller core helpers and the UI files. `README.md`, `DATA.md` and the `STATE-OF-PLAY.md` banner are brought up to save v39.

## 2026-11-05 · City becomes the command centre
- **Crews out now live on City**, under the map: every crew out (calls first), then side work, each with its district. Tap a crew's district to light it on the map and show only what's happening there.
- **A district's card shows your hall there**: beds, level and the faces of who lives there (tap one for their page).
- **Today keeps one line about them**: "2 crews out · 1 call waiting — City ›". The City tab shows how many calls are waiting.
- Sending a crew away, or handing a call back, takes you to City.
- **Save has left the tab bar.** It's the ☰ button at the end of the top bar.
## 2026-11-05 · Heat per district
- **Each district now has its own heat.** A job's heat lands in its own district, and every district cools by 2 each Sunday. The top bar shows the hottest district.
- **The City map** puts a small HEAT tag under any warm district (amber from 3, red from 6), and the district card, the city summary and each hall show its heat.
- **The fixer's warning names the district** ("Someone has been asking about us in the Docks"). Paying cools that district. Letting it ride means the next job *there* is watched, not the next job anywhere.
- Being loud in one place runs it hot fast; spreading loud work around the city keeps each district cooler.
- **Save format v39.** Your old heat goes to Old Town.
## 2026-11-05 · Halls: a place of your own in more of the city
- **The safehouse is now your Old Town hall**, and the tong can have one hall per district. Each hall has its own beds and rent, and everyone lives in one. Your roster limit is all your beds together, and the rent is every hall's rent.
- **Opening a hall:** once your reputation is high enough and the district's contact trusts you, they offer you a place (Madam Rao has two rooms above her sari shop in the Night Market). Pay the deposit and it's yours, small to start.
- **Each hall expands on its own**, the way the safehouse did: more beds, more rent.
- **Moving someone into another hall** is on their page under Home. They count there straight away but spend the day settling in, so they're free for work tomorrow.
- **Your tong's rank follows your halls:** one hall is a back-room tong, two a street tong, and so on.
- The Crew screen has a Halls section, and the City map tags each district where you have a hall.
- **Save format v38.** Your safehouse becomes the Old Town hall with its beds, rent and level, and everyone lives there.
## 2026-11-05 · A command-centre mock-up
- No game change. A clickable mock-up of the tong's command centre (`drafts/prototypes/command-centre.html`) to try before anything is built: two halls (Old Town and the Night Market), who's based where, heat per district, a raid warned for Friday with four answers, a crew calling in, and moving people between halls. HANDOFF.md now describes the tong direction and the playtest.
## 2026-11-05 · Joss saves your best for when they're needed
- **Joss now suggests the cheapest crew they trust with a job**, not the strongest. If leaving a star at home keeps the risk at mid or lower, Joss leaves them at home, so they're free for work that needs them. The risk on the board and the plan shows Joss's crew, and "Try" still offers putting someone stronger in.
- **When you tap a slot to pick someone**, each candidate has a few words on what the job does for them: "learns on the job", "learns faster beside Rook", "1 point from pro", "2 jobs from veteran", or "below their level: little to gain". The planning page itself is unchanged.
## 2026-11-05 · Back cards play once
- A crew's back card on Today slid their faces in again every time you opened a message. It now plays once per report and stays still after that.
## 2026-11-05 · "Improved by"
- In "What they'll likely meet", the line under an encounter now reads "→ low, improved by Siphon" (who'd step in if the roll fails), "→ low, the crew can win the fight", or "→ extreme if it turns into a fight". On a loud run it no longer credits someone who wouldn't play a part.

## 2026-11-05 · Crews out you can see
- **Sending a crew feels like something:** a card plays as they leave, with their faces heading out, a stamp ("Out · Rent Round · back Wed") and a line from Joss. Tap it to skip.
- **Runner tiles say when they're back**, e.g. "Out · Wed".
- **Each crew out has its own card on Today:** their faces, a status light (cyan on track, pulsing yellow when they're calling, red if someone's hurt, grey when lying low), a bar filling as the job moves through its story, what they're doing now (casing the place, going in, on the job, getting out) and today's lines.
- **When a crew you sent away gets back**, Today shows it that day: their faces coming home, a stamp with the result and the pay, a line from Joss, and the report.
- Joss's new lines (sending off, coming back, a crew calling in, the end of a day out) are in the warmer voice now in canon: people first, then the money.
## 2026-11-05 · Joss says why
- Under the squad board, Joss says in one line why they picked who they picked: "Drizzle keeps us out of sight, Signal takes the locks and cameras." It shows while the squad is still Joss's.
- The notes in the plan's bottom bar are shorter ("Weakest: Locked door · Signal tech 9"), say each thing once, and the bar folds back to one line when you open a job or try a change.

## 2026-11-05 · See what a change does
- When you change a plan (who goes, the approach, overwatch, the van), each encounter whose risk moved says what it was ("was high", green if better, red if worse) and flashes once; so does the risk in the bar. Folded, "What they'll likely meet" says how many changed.
- A job's brief is shown in full the first time you open it; after that it's two lines with "Read more".

## 2026-11-05 · A shorter job plan
- The orders (send them or watch live, when to call you in, how they decide on their own) are one line now; tap Change to set them.
- Empty Overwatch, Wheels and Standby slots are small "optional" chips instead of big empty cards. With nobody carrying a rifle or a drone, Overwatch links straight to the armoury.
- The squad rules (short-handed, backup, freelancers) are behind an ⓘ.
- The bar at the bottom shows one reason; tap it for the rest and the changes to try.
- On a phone the plan page is about a quarter shorter; on a desktop, about 30%.

## 2026-11-05 · Try this
- When a job's plan is above low risk, the bar now suggests changes that would lower it, each with where it gets you: "switch to Stealth → high", "Burner for Signal → high", "add Synapse → high". Tap one and the plan changes. Only changes the game has checked actually lower the risk are shown; if none does on its own, it offers Joss's picks.
- In "What they'll likely meet", a helper is only named when they make the row better.

## 2026-11-05 · Planning says why
- The bar at the bottom of a job's plan now always says what sets the risk: the weakest point ("Weakest point: Guard up close, Siphon combat 5"), or the skill the job's crises lean on and your chance on it. "Crew matches the job well" only shows when the risk is low.
- The start button says what you're committing to: "Send them (4)" or "Go live (4)".
- The skill icons on the job cards now have their names next to them.

## 2026-11-05 · The plan's encounter list fits on desktop
- In "What they'll likely meet", what lowers a risk ("→ low with Dim Sum, counting the fight") now sits on its own line under the encounter, so the names and who handles them no longer get squeezed on desktop. On a loud run, "a loud run means a fight" is said once at the bottom instead of on every row.

## 2026-11-05 · A warmer Joss
- Joss's lines on Today, in alerts and at the top of job reports are rewritten to be warmer and more practical, with less teasing. Same facts, same places.

## 2026-11-04 · A shorter job plan
- The client's background is behind an ⓘ next to their name; tap it to read. What changes the job (harder rolls, unreliable intel, named offers, street talk) still shows.
- "What they'll likely meet" is grouped by when it happens (the way in, inside, the target) with one line each: what it is, who handles it, the risk. ⚠ marks the dangerous ones. On desktop the rows no longer squeeze into narrow columns.
- The separate crises card is gone: its warnings (weak skills, someone tired or hurt, no medic, crew size) are in the bar at the bottom with the risk. Tap "+N more" to see them all.

## 2026-11-04 · The week as the tong's rhythm
- **What's due on Sunday is always in the top bar**, e.g. "¥2,750 due Sun".
- **Monday's briefing:** on Mondays, Today opens with the week: cash, what's due Sunday (red if you're short), how many runners are free, the jobs on the board, and who's out, hurt or whose offers end this week.
- **The Sunday summary:** the weekly bills message is now "Week N settled: +¥X after the bills", with a line each for the week's jobs, money, reputation and who's hurt, then the bills.
- **Crew standard:** each job card and planning screen says what kind of crew it expects: rookie work, pros, or veteran-led. The planning screen checks your pick against it ("2 below pro", "no veteran to lead it", or a veteran wasted on rookie work). It's advice: you can send anyone.
- **Crew leads:** a Respected (or better) runner on the crew leads it, and on "When it's risky" they take one risky call themselves before calling you. The planning screen says who leads. It never changes a roll.
- **Routine work has its own place on the board:** the week's first new offer is always a small routine job, and the other two are never routine, so everyday work no longer crowds out the better-paid jobs. Still three a week. A bigger tong's extra offers are mostly routine work, for the bench.
- **Save format v37.**
## 2026-11-04 · Ten more routine jobs, and shorter choice labels
- **Ten threat-2 routine jobs**, each for a crew of two on a day's work and ¥3,000-3,200: Relay Cover (Mr. Szeto, Glass Heights), Mooring Watch (the Ferryman, the Docks), Dry Shelf (Auntie Fung, Old Town), Kit Return (Madam Rao, Night Market), Count Against Paper (Ruth Okonkwo, the Docks) and Inspection Hours (Mrs. Ip, through Auntie Fung, Night Market). Tack Ledger and Race-Night Door (the Basin), After Hours (Glass Heights) and Rent Round (Old Town) are walk-in work with no client.
- **Shorter choice labels** in 14 of the earlier routine jobs (56 labels), so they read cleanly on a phone.

## 2026-11-04 · 15 routine jobs
- **Fifteen everyday jobs, all rookie work for a crew of two**, small and repeatable: Queue Duty, Shutter Watch, Paper Collection, Clean Sheets (Old Town); Fitting Room, Quiet Table (Night Market, for Madam Rao); Closing Stack, Crate Return (Night Market, for Mrs. Ip); Landing Hands (the Docks, for the Ferryman); Clear the Ramp, Eyes on the Seal (the Docks, for Ruth Okonkwo); Access Window (Glass Heights, for Mr. Szeto). Signal Walk (Old Town), Stable Turnover and Closing Sweep (the Basin) are walk-in work with no client. Queue Duty, Clean Sheets and Shutter Watch are Doc Siu's and Auntie Fung's, Closing Stack and Crate Return Mrs. Ip's, all offered through Auntie Fung's list.

## 2026-11-04 · Writing routine jobs
- Docs and tools only, no game change: the job-writing prompt (`docs/new-job-prompt.md`) has a "Routine work" section for everyday jobs that repeat (courier runs, collections, guard shifts), and the job checker warns when a routine job is bigger than one.

## 2026-11-04 · More work for a bigger tong, and longer jobs
- **The job board grows with your tong.** Up to five runners, three new jobs come in a week, as before. After that, one more a week for every two or three runners, and the board holds more offers at once. Freelancers don't count.
- **Jobs now take a range of days.** Rookie work is as written. Bigger jobs can take a day longer, and threat 3 and up up to two days longer (four at most). Each extra day adds 5% to the pay. The job board and the planning screen show the days.
- **Save format v36.** Offers already on the board keep their days.

## 2026-11-04 · Crews out call you in
- **Sending a crew is now the default, and they can call you.** Planning a job has a new **How**: *Send them* (they go and do it over the days it takes) or *Watch live* (as before). Every "Call me in" setting works for both.
- **A job sent away plays out day by day.** Each morning Today has a **Crews out** list: each job, who's on it, which day of how many, and a line or two on what they did. A long job's early days can be quiet: casing the place or lying low.
- **When something's beyond their orders, they call.** A yellow "We need a call" block appears in Today with **Take the call**, and Continue waits until you answer. Taking it opens the job on the map at that moment. Make the call, watch the rest of the day, then **Let them carry on** (they pick it up tomorrow) or **Take command** to play the rest now, giving orders in fights.
- Crews out fight on their own unless you've taken command. A critical wound on a crew out is always your call, as on a live job; on "never" they pull out by themselves, as before.
- **Save format v35.** Jobs already out carry on from where they are.

## 2026-11-04 · You run a tong
- **Your organisation is now a tong** (堂, "hall"): a registered association, a bit like a guild. The top bar shows its rank, which is how far its name carries: Back Room, Street, District, City, Harbour. Tap the rank for Joss's explanation.
- Every tong starts in the back room, and older saves do too: moving up the ranks comes in a later update. **Save format v34.**

## 2026-11-04 · Any job can be sent hands-off
- **Every job can now be sent off on its own**, not only rookie work. On the planning screen, "Call me in: never" is offered for every job; the crew goes away and the report comes back when they do. Everything still starts on "risky", so sending a crew away is always your choice.
- As before, a hands-off crew never pushes on with a critical wound: at worst they pull out. That's now tested on every job, under every order, full-handed and short-handed.
- This is the first step towards running a bigger organisation with several crews out at once (the plan is in the design log).

## 2026-11-04 · Docs brought up to date
- Docs only, no game change: `HANDOFF.md` now describes `main` as of #60 (save v33, 525 tests, renown slices 1-4 built, what's next). `README.md` has a current status list and doc index. `docs/ARCHITECTURE.md`, `DATA.md` and the `STATE-OF-PLAY.md` banner know about save v33. `PLAN-PROGRESSION.md` marks step 2 as mostly covered by later work and step 3 as not built.

## 2026-11-04 · Fame pays off (renown, slice 4)
- **Clients ask for your Elites by name.** About one week in five, once you have an Elite with standing 50 or more, a new client job asks for them (the best-rated one). The job card says "Asks for Tofu". Send them, inside, outside or on standby, and it pays 15% more; send others and it's an ordinary job at its ordinary pay. One a week at most, never rookie work.
- **A new Elite may ask for a raise.** The first time someone becomes Elite there's a 35% chance they want more (more likely if Greedy, less if Loyal), for 10% to 30% on top of their wage. It's the usual pay-rise message: accept, haggle or refuse (refusing makes them unhappy for four weeks). Winning Elite back later doesn't bring another ask.
- **Better recruits come looking** once anyone on the crew is Elite: more pros and veterans among the leads (rookie 42%, pro 42%, veteran 16%, from 50/38/12).
- Money: on long careful runs, median cash at week 52 is about 2% higher (¥39,750 to ¥40,450). If every fame raise were accepted it would cost about as much as named offers bring in. Nothing about rolls, heat or the risk read changes; the early game (to week 26) is unchanged. **Save format v33.**

## 2026-11-03 · Fights on a phone
- On a phone or an iPad in portrait, a fight waiting for your orders now fits on one screen: the map stays at the top, your crew is a strip you can swipe sideways, and Go sits in a bar at the bottom with Pull back and "⋯" (Auto round, Auto fight).
- The play-by-play becomes one line (the latest thing that happened); tap it to read the whole fight so far.
- Pick Shoot, Flank or Talk and the game asks which guard, showing your chance against each; tap one in the list or on the map.
- Each crew card shows how many guards are aiming at them and their chance to hit.

## 2026-11-03 · Elite is rarer
- **Elite now needs 60 jobs at their level** (was 20), or 120 jobs for a Lifer (was 40). On careful play the first Elite now comes around week 26 (weeks 23 to 35) instead of week 12, and a crew has one or two Elites by week 52 instead of four. Legend's readiness now asks for 120 jobs at their level (was 40). Still nothing about rolls, pay or heat.

## 2026-11-03 · A tidier fight panel
- The fight's orders are now one short row per crew member: face, name, health bar, cover, who's aiming at them, and their order. Orders you give show solid ("You: Flank G2"); anyone you leave alone shows the crew's call, faded. Tap your order (or the crew's pick) to hand it back to them.
- Pick someone and their tray opens below: their kit, who's aiming at them, the guards with your chance to hit each, and what they can do, each with its odds in big numbers.
- Go says what it'll play ("Go · 1 yours, 3 crew's call"). The rules are behind "?", and Pull back asks before it ends the job, showing what it costs.
- On the map, the picked crew member's call is drawn as a faded line, and tokens are easier to tap.

## 2026-11-03 · Everyone in a fight stays in view
- In a fight, the map's camera now keeps every crew member and guard fully in view, health bars included, even when someone stands by the edge of the map or has no cover spot. It looks a little past the edge of the drawn site when it needs to.

## 2026-11-03 · Fight orders fit the screen
- On a computer or an iPad in landscape, the play-by-play beside the map (with a fight's orders in it) now ends level with the map, leaving space above the bottom of the screen, instead of running to the edge. When the page scrolls, the map keeps a small gap under the top bar.

## 2026-11-04 · New jobs: A Steady Hand, House Advantage, Exit Interview, Cold Chain and Quiet Hours
- **A Steady Hand** (Doc Siu via Auntie Fung, Old Town, rookie): help a retired instrument maker close her workshop, then walk her to the clinic.
- **House Advantage** (Madam Rao, Night Market, threat 2): recover the hidden reader from a mahjong table without naming the players who complained.
- **Exit Interview** (Ruth Okonkwo, Glass Heights, threat 4): escort a shipping clerk who wants to leave a corporate residence, only if he still says yes.
- **Cold Chain** (Mrs. Ip via Auntie Fung, Night Market, rookie): bring a borrowed chiller back before dawn without spoiling a neighbour's stock.
- **Quiet Hours** (Ruth Okonkwo, the Docks, threat 3): take the real recording of a dockworker briefing from an AHL training room before the morning reset.

## 2026-11-03 · Fix: the crew walks the drawn route again, and the speed button works
- **On a job, the crew now walks the route drawn on the map.** A recent change left the crew's walking and the map drawn from two different places: the map showed the right site (for Herbal Run, the Old Town tenement) but the crew moved on a stock site, so they walked a different route and, once the job was done, stood at a different van spot from the one drawn. They now share the same site.
- **"Faster" works again** on the job screen (it had stopped doing anything).

## 2026-11-03 · The play-by-play keeps up, and a finished job stays put
- The play-by-play now always scrolls to the newest moment unless you scroll up yourself to reread something; scroll back to the bottom, or tap "↓ new", and it follows again. Before, it sometimes stopped following on its own.
- When a job ends (done, aborted or someone lost), the screen keeps the map and the play-by-play side by side, and the summary with "Back to the safehouse" appears at the end of the play-by-play, instead of switching to a different view.

## 2026-11-03 · The job's map fills the screen
- On an iPad in landscape or a computer, the site map during a job is now as tall as the screen allows, with the job's title and the Pause and Faster buttons still in view, and takes a larger share of the width. Its zoomed views reshape to fit, so the extra height shows more of the place instead of empty space.

## 2026-11-03 · A job takes the whole screen
- While a job runs, the tabs (the bar at the bottom on a phone, the side menu on a tablet or computer) step aside, since they can't take you anywhere mid-job. They come back when you press "Back to the safehouse".
- On tablets and computers the job uses the full width, and the map of the site is drawn larger.

## 2026-11-03 · Traits as chips, and Synergies
- On a runner's page, traits (the ones they were born with and the ones earned on the job) are now compact chips with an icon and a name, instead of a long list. Tap a chip to see what it does and since when; tap again to close. Temporary traits have a dashed edge; setbacks like Shaky are red.
- **Crew Anchor is now called Synergy**, everywhere: on the page, in messages and in roll notes. Synergies have their own row of portraits: tap one to see the bonus, the downside if that partner gets badly hurt, and a link to their page.
- The same trait chips are on a lead's page when you're hiring.

## 2026-11-03 · Buttons in pop-up sheets are centred
- "Go to the armoury" (and any full-width button at the bottom of a pop-up sheet) now has its label centred top to bottom, not pressed against the top edge.

## 2026-11-03 · Fame, standing and paths (renown, slice 3)
- **Runners now become known.** Fame climbs one step at a time from the record: Unknown, Known (6 jobs), Respected (6 active weeks and 10 jobs at their level), Elite. Elite needs 12 active weeks, 20 jobs at their level (Lifers: 40 jobs), a path's Elite numbers and a standing of 40. It arrives on its own, with a message in the inbox, a history line and a highlight. Legend isn't given yet; the runner page shows when someone is "Ready for their moment".
- **Standing** is how the street rates a runner right now, 0 to 100: up with completed jobs at their level, hard calls that held and milestones; down when a job is lost or aborted, the crew pulls back from a fight, or they come back badly hurt, and a little every week on the bench. An Elite under 20 on two Sundays in a row drops back to Respected, and can win it back.
- **Paths:** Ghost, Enforcer, Earner, Iron or Lifer, whichever their record is furthest along. The runner page has a Path card with bars towards Elite and Legend; tap (i) for the numbers.
- **Pros can become veterans:** main stat 16 and 50 jobs with the crew. A message and a history line say so. Same wage; jobs at their level now mean threat 3 and up, and rookies in their role learn faster beside them.
- On screen: an "ELITE" badge on the crew list (Elite only) and a fame line on the runner page ("ELITE · pro · Steady").
- **Nothing about rolls, pay, heat or the risk read changes.** The same 60 long careful runs end with the same cash, to the yen, with and without this change. With the current numbers Elite comes early: careful stealth crews get their first Elite in week 12 (every run), and most of the crew is Elite by week 52.
- Old saves: standing starts at 3 a job worked (at most 50), fame at what the record reaches but no higher than Respected. **Save format v32.**

## 2026-11-03 · Sunday jobs count towards active weeks
- **A job finished on a Sunday now counts as a week worked.** The weekly count ran before any Sunday job (live, or a hands-off crew back that day), and the next Sunday's count had already moved past it, so Sunday work never counted. It now counts on the following Sunday, once. Only `record.activeWeeks` moves; nothing about rolls, pay or heat.

## 2026-11-03 · New jobs: Borrowed Glory, Last Sitting and Low Water
- **Borrowed Glory** (Mr. Szeto, the Basin, threat 4): steal the champion mare Harbour Dividend from Lantern Course so he can race her under his own colours.
- **Last Sitting** (Auntie Fung, Old Town, threat 2): move a mahjong parlour, its tables, cupboard and regulars to a new room before the old landlord changes the locks.
- **Low Water** (the Ferryman, the Docks, threat 3): recover a stolen channel marker's sounding logger from a scrap yard, so the night boats know where the seabed has moved.

## 2026-11-03 · New jobs: Paid in Full and Second-Hand Heart
- **Paid in Full** (Madam Rao, Night Market, threat 2): collect a pawned recorder holding flood-lost repayment receipts before the shop wipes it. Six crises, each with a no-roll way out.
- **Second-Hand Heart** (Doc Siu via Auntie Fung, Old Town, rookie): get the clinic's repaired battery back before the recycling lorry takes it, after a payment was filed against the wrong serial number.

## 2026-11-03 · No more "someone" in job choices
- Some choices in older jobs (the courier, warehouse and data runs, Kidnap, Casino Con, Protection Run) named a role, like the driver or the face, without needing one on the crew. Without that person, the line read "someone ran the light". They now name whoever actually does it.

## 2026-11-03 · Milestones and highlights (renown, slice 2)
- **A runner's record now produces moments.** After a job, someone whose record crosses a line gets a milestone: a first (first clean job, first time they brought a crewmate home), a count (10, 25, 50 jobs; clean jobs; hard calls that held), a clean streak, a long partnership with a crewmate, or a stretch of steady work. It shows as a highlighted "Milestone:" line in the job report and goes into their history.
- **At most one a person and two a job;** anything else that's ready waits for a later job. A partnership counts for both people at once.
- **Highlights:** each runner keeps their best three moments, shown on their page and as one line under their name on the crew list.
- Wording is a first pass in `src/data/milestones.js`, for the owner to rewrite. Old saves count what they've already reached as earned, so there's no flood on the next job. **Save format v31.**

## 2026-11-03 · Runner record (renown, slice 1)
- **Every runner now keeps a record** of what they've done on the job: jobs, jobs at their level, completed, clean (no heat, nobody went loud), flawless (nobody went critical), carries (a hard crisis roll they made), fights won, people brought home, unscathed jobs, big scores, best clean streak, active weeks, and who they've worked with most. It's a "Record" fold on the runner's page.
- Nothing about rolls, pay, heat or risk changes: this only counts. Fame, milestones and retirement build on it later.
- Saves from before get an estimated record (guessed from jobs worked, marked "estimates"). Runners lost on a job go to the memorial with a short summary. **Save format v30.**

## 2026-11-03 · Getting out now pays nothing
- **Walking away from a job now pays nothing, as the button says.** Taking "Everyone comes home. No pay." when the alarm goes up, when someone is badly hurt, or when nobody is left to carry on used to pay the full fee. It now pays ¥0. Everyone still comes home.
- **Money is a little tighter early on.** On a careful run, cash at week 26 is about ¥2,500 lower with three founders and no hiring (¥34,250 to ¥31,700). Players who hire up to five feel it more: median ¥15,150 to ¥9,800, and 22% broke instead of 15%.

## 2026-10-30 · Faces on the fight map
- **Fights now stand on the map as they were meant to:** your crew's faces on their tokens, everyone on their spot behind cover, and the map zoomed to the fight. A bug kept everyone's place off the map, so fights showed initials crowded together.

## 2026-10-30 · Every sidearm is different
- **Each sidearm now has its own strengths:** aim (how much it helps you hit), damage, and for some, pierce (how much armour it ignores).
- **They come from the gun's frame:**
  - compact pistols are accurate but light
  - revolvers hit hard
  - machine pistols get some rounds through armour
  - hand cannons hit very hard
  - pro-only smart pistols are very accurate, and pro-only coil pistols punch through armour
- **Each gun also rolls a quirk:** true sights, hot loads, a hair trigger, heavy rounds, a worn barrel or light loads. Most have none.
- **The price follows the strength.** The armoury shows each gun's numbers, and so does the fight.
- Sidearms you already own are the plain sidearm they always were.

## 2026-10-30 · Gun looks, faces and career marks are in the game
- **Gun looks:** every rifle and sidearm now has its own look and name, and some guns glow. The armoury stocks a new shelf each week. These were made earlier but never reached the live game.
- **Faces:** every face has its own shape (anatomy) now.
- **Career marks:** your crew pick up scars, extra chrome and, after ten jobs together, the crew's lantern mark.
- **Shaolin monks** can turn up.
- **Older saves:** guns you already own get a plain look and a name, and the armoury gets stocked.

## 2026-10-30 · See your gear in a fight
- **Each runner in the fight panel now shows their gun, its damage and their armour,** for example "Pro sidearm 4 · Armoured vest −1".
- **Shoot and Flank say what a hit does:** "hits for 3 · 2 hits to drop".
- **The guards' aim shows the damage they'd do after armour,** and Hunker shows how much damage is coming at you this round.

## 2026-10-30 · The planning read knows the map
- **The fight odds on the planning screen now use the job's own map:** where each side will stand and what cover they'll have. Before, they assumed everyone was in half cover, which was a few points off: Kidnap fights were easier than shown, for example. Now the odds you're shown are the odds the fight uses.

## 2026-10-30 · Fights on the map in every district
- **Old Town, the Night Market, Glass Heights and the Basin now fight on their maps too,** like the Docks: everyone stands behind something or out in the open, and the map zooms in on the fight.
- **New things to hide behind:**
  - Old Town: bins and a dumpster in the alley, and a handcart, washtubs and crates in the courtyard.
  - Night Market: a cart and crates by the gate.
  - Glass Heights: crates in the loading bay, plus the lobby desk and server cabinets inside.
  - Basin: a horse trailer and hay bales at the service gate.
  - Inside the targets: a table in the flat and in the clinic, and the vet's table.
- **Market stalls, plaza planters, clinic cots and the stable blocks count as cover.**
- In the Basin, the guards on the way in now wait further along the fence.

## 2026-10-30 · You command the fights (the Docks first)
- **Fights now stop for your orders each round** on any job you watch. Jobs sent off with "Never" still fight on their own.
- **Fights in the Docks happen on the map.** The crew takes the best cover nearby: full behind a container, half behind a crate or a desk. The guards are wherever they were standing. Each person shows a shield for their cover, or an OPEN tag. Other districts still use the old fight picture for now: everyone counts as half cover there.
- **You can see what the guards are about to do:** a red line from each guard to who they're aiming at, with their chance to hit.
- **Each runner gets an order:** shoot or flank a guard, hunker down, move to better cover, patch someone, talk a guard down, or kill the lights. Every order shows its odds. Anyone you don't give an order to does what they'd do anyway.
- **Auto round** plays one round your crew's way. **Auto fight** leaves the rest of the fight to them. **Pull back** is always there.
- **The map zooms in on the fight,** with faces on the tokens. You can tap a runner, a guard, or a free spot to move to.
- **New pallets by the Docks gates,** so a fight at the fence has some cover.

## 2026-10-30 · Fights can take orders (the rules, not the screen yet)
- **Under the hood, fights now have cover.** Everyone stands in the open, in half cover or in full cover, and that changes how hard they are to hit. For now everyone starts in half cover, which plays exactly like fights did before.
- **The guards decide who they're aiming at before each round.** The screen doesn't show it yet; it will when orders reach the map.
- **The rules can take an order for each runner each round,** with the chance for each shown: shoot a chosen guard, flank (works round a guard's cover, but leaves you in the open), hunker (much harder to hit, no shot), patch, stabilise, talk, or kill the lights. You can't give orders on screen yet. Until you can, everyone does what they would have done anyway.
- Old saves still work. A save made mid-fight carries on with everyone in half cover.

## 2026-10-30 · Loading a save file works again
- **Save → "Load save file into this slot" did nothing.** You could pick a file, but the game ignored it and showed no error. It loads now. Picking the same file twice in a row also works.
- **A saved game that can't be opened is no longer lost.** If the game finds a save it can't open (saved by a newer version, which can happen for one launch after an update, or damaged), it now keeps that save and its weekly backup aside before starting fresh. A red banner says so, and the Save screen offers **Restore it**, **Download it** or **Throw away**. Before, the fresh game quietly saved over it, backup included.
- If a save is from a newer version, the message now says to reload the page to update.

## 2026-10-29 · Barcode tattoos sit on the chin
- Portraits with a barcode tattoo now have it centred on the chin and inside the face on every head shape, instead of hanging off the side of the jaw.

## 2026-10-29 · Jobs screen lines up
- Side work: the stat each job uses (Combat, Social, Driving…) now sits on the same line as the job's name and district, and the days and people on the right line up too.
- Clients: each client's standing ("neutral · 50") is now left-aligned under their name, like the rest of the screen.

## 2026-10-29 · Joss reads the run right
- When every roll on a job held but one of your choices cost something (like paying Auntie Fung's tea out of the take), Joss now opens the report with a line about the cost you chose, not "Not quietly, and not all of it". Runs where a roll actually failed still get the rougher lines, which no longer claim noise or lost pay the log doesn't show.

## 2026-10-29 · Room above the job result
- At the end of a job, the result card (Job done, pay, heat) now sits clear of the last line of the play-by-play instead of right against it.

## 2026-10-29 · Fold away "What they'll likely meet"
- On the plan screen, the "What they'll likely meet" read now has an arrow on the right of its heading: tap the heading to fold it away or open it. It starts folded on phones, to cut the scrolling, and open on wider screens; it stays how you left it until you close the game. Folded, the heading still warns you in red if there's a gap nobody can cover.

## 2026-10-29 · Tabs are off until you pick your crew
- At the start of a new game, the Crew, Jobs and City tabs are greyed out until you pick your three founders, instead of looking tappable and doing nothing. Save still works, so you can load another game, and Today takes you back to the pick.

## 2026-10-29 · The City map holds still while you scroll
- On iPad and iPhone, the City map and the district picture beside it no longer grow as you scroll and Safari hides its toolbar. They keep the size they open at. The site plan on the watch screen holds still the same way.

## 2026-10-29 · Four inside fits on a phone
- When the inside team has four or more cards (people plus the empty spare), the planning board on a phone now shows two cards to a row, each laid sideways (photo on the left, name and number on the right), so names and stats are full size instead of squeezed into four narrow cards. The same happens wherever the board is narrow, including the plan column on a wide desktop; the iPad plan, which has the full width, keeps four across.

## 2026-10-29 · Change gear while they rest
- You can now change someone's gear while they're resting, hurt, or back tomorrow from a job. Gear only stays locked while they're out on a job that hasn't finished (including hands-off jobs and side tasks, which play out when they're back).

## 2026-10-29 · Room to plan on a tablet
- On an iPad (and any screen narrower than 1400px), opening a job now gives the plan the whole screen, with a back button to the job list, as on a phone. Wide desktop screens keep the list beside the plan.
- Runner names on the squad board no longer break mid-word, and the OVERWATCH, WHEELS and STANDBY labels always fit their slots.

## 2026-10-29 · A cleaner City map
- The map no longer draws lines round the coast and the districts. Like the district pictures, the land is shaped by light and shadow, and districts meet at a dark gap. The district you pick lights up in its gang's colour.

## 2026-10-29 · The Basin in neon
- The Basin's odds board now glows in pink and orange neon under the course's name, and little camera drones fly alongside the horses, filming the race.

## 2026-10-29 · Every district has its picture
- Tap Old Town, the Night Market, Glass Heights or the Basin on the City map and its card now opens on a picture, like the Docks: Auntie Fung's tea shop and joss paper burning in a bin; the Neon Dragon's wok fire under a sky of neon; Veridian-Apex's tower and a security drone sweeping the plaza; race night at Lantern Course under the floodlights.

## 2026-10-29 · The new City map
- The City screen's map is redrawn to match the rest of the game: each district has a small label showing its gang's colour, how much work is on the board, and tags for your safehouse (HOME) and crew out on jobs there. Tap a district (or its label) to pick it.
- Beside the map (below it on a phone): the district you picked, then the city tonight (every open district's gang, work, street talk and crew out), the city's heat, where your people are and when they're back, and places (the safehouse; a bar and black market are coming later).
- The Docks' card has a picture: cranes in neon, container 409, red lanterns, a flying car, and the city's neon signs across the harbour.

## 2026-10-29 · Tap a name in a message to see them
- In an open message, your crew's names are underlined: tap one to open their page, and "← Back to the message" takes you straight back to it.
- The line under a message's title is capitalised ("Crew · Day 21").

## 2026-10-29 · Renewal numbers line up
- When someone asks for a new deal, their current wage, what they're asking and their market value now sit in three equal boxes with the numbers on one line, and the loyalty note no longer touches them.

## 2026-10-29 · Fights on the map
- A fight now plays out on the site map: the guards appear across from your crew, everyone has a little health bar, and each round's shots and hits play as they're reported. Anyone who goes down turns red; a guard who's down, talked round or running off fades out.
- Each round's card ends with everyone's health, and the call-in at death's door shows it too, so you can decide without scrolling back. The bar under the map counts the guards still up.
- A guard running off, or your crew getting the jump, is now green in the feed (it showed red).

## 2026-10-29 · Loud runs mean a fight
- On a loud run the first guard is always a fight now, however well the roll goes: win the roll and your crew gets the jump (the guards get no shot in the first round); miss it and they fight back from the start. The same goes after you tell the crew to go loud at max alert.
- The planning screen says so ("A loud run means a fight") and works the odds out with the jump counted in.
- Stealth, tech and con runs still only fight when something goes wrong.

## 2026-10-29 · Tidy-up (nothing changes in the game)
- The run engine's fight code moved out of `mission.js` into its own file, a map of the code (`CODEMAP.md`) was added, and `npm run test:fast` runs the quick tests in about 40 seconds instead of two minutes.

## 2026-10-29 · Play offline
- After you've opened the game once, it opens without a connection too: reload it or open it in a new tab on the train and it's all there, saves included. When there's a new version, the game picks it up in the background and you get it the next time you open it.

## 2026-10-29 · Fights
- When a patrol or a guard catches someone and nobody saves them, it's now a fight: up to three rounds on the watch feed instead of one roll. Everyone has health; guards come in tougher on bigger jobs.
- Gear finally matters outside overwatch: a sidearm hits harder than the street piece everyone carries, and a vest takes 1 off every hit (a pro vest 2). Medics patch people up mid-fight, a face can talk a guard into backing off, a tech can kill the lights, and Wheels can bring the van round for a clean getaway.
- If someone goes down, they're at death's door, not dead. The crew calls you in: pull back (everyone home, but no pay, more heat and a hit to your reputation), send standby in to drag them out, or keep fighting, which is the only way they can die.
- After three rounds with guards still up, you choose: push past them (the alert goes up) or pull back. A lone guard who's badly hurt runs for it.
- The planning screen now says how a fight would go for each danger ("If it comes to a fight: low risk"), worked out from the same rules.
- Fixed: a one-person crew who pushed on with a critical wound could freeze the game at the next crisis.

## 2026-10-29 · More guards, and you can see them coming
- Bigger jobs bring more guards to a fight (up to four), each a bit easier to drop, so rounds where two go down, or the last one runs, happen more often. Gear still makes the difference.
- Before the crew gets there, the guards they'll meet wait on the map in their spot, with a number for how many. They're the real ones: if it comes to a fight there, that's who you'll fight.

## 2026-10-29 · Jobs look like where they happen
- Some jobs now have their own place on the map: Clinic Night is Doc Siu's clinic down Block 9's stairwell, Submerged Cable is the cable hut on Pier 12, Container 409 is the container itself.
- The Docks also varies from job to job: two ways in (the gate, or the quay at the harbour end) and two ways the yard is stacked, both full of containers and crates. Each job keeps the same layout whenever you look at it, and two jobs can differ.
- The Night Market, Glass Heights and the Basin come next.

## 2026-10-29 · Rookie hires cost half
- Rookies the scouts find now ask for about half what they used to (¥200-350 a week instead of ¥400-650), so growing past your three founders is affordable. Pros and veterans cost the same as before, and anyone's pay still goes up at contract time once they've grown.

## 2026-10-28 · Pick your founders
- A new game now starts with a "Who's in?" screen: six raw rookies who'll work for street wages, one of each kind and one extra. You pick three, and day 1 starts with them. Joss welcomes them by name.
- Everyone else comes later, through the scouts on Wednesdays and the freelancers on Mondays. Your three cost about ¥750 a week instead of the old five's ¥1,300, so every hire is a real decision.
- Games already in progress are unchanged (save version 25).

## 2026-10-29 · Sidearms with style, and neon
- **Sidearms have looks and names too**, and two turn up on the armoury's shelf each week (one street, one pro). Compact pistols, revolvers, machine pistols, old long-barrelled pistols and hand cannons, plus pro-only smart pistols (a light strip, a holo sight, a cable to the wrist) and coil pistols (glowing rings and a power cell).
- **Finishes and add-ons** from blued steel and hazard yellow to cinnabar lacquer, jade, pearl grips, holographic chrome and clinic white; laser sights, holo sights, glowing vents, LED ammo counters; charms like a neon keychain, a data shard or a hologram lucky cat.
- **Guns that light up glow in their own colour**: cyan, neon purple, red or gold. Plain ones don't glow, so most rifles look as before.
- Sidearms you already own become plain blued pistols with a name. They show in the armoury and on gear tiles, not on faces.

## 2026-10-29 · Every rifle is its own
- **Rifles have looks and names.** Each one is built from a frame (marksman, carbine, bullpup, heavy or heritage), a finish (from old wood and rust to cinnabar lacquer, jade, temple bronze and white ceramic), sometimes an engraving (gold clouds, dragon scales, a neon circuit) and sometimes a charm (a red silk tassel, a paper talisman, a lucky coin, prayer beads, a mahjong tile...). Each has a name to match, like "Vermilion Heron" or "Ghost Heirloom".
- **The armoury has a weekly shelf of rifles**: two street and one pro, all different, with new ones every Monday. Other gear is bought as before.
- The name shows wherever the rifle does, with what it's made of underneath. Looks don't change what a rifle does.
- Saves upgrade on their own: a rifle you already own keeps its look and gets a name.

## 2026-10-28 · Career marks
- **A bad wound leaves a scar.** A serious or critical injury leaves a permanent scar on their face, up to three. Light wounds heal clean.
- **Pushing neural load leaves chrome.** A job that ends with someone in the danger zone (over 70) adds a visible implant, up to two.
- **The crew's mark.** After ten jobs with the crew, someone gets a small neon lantern under the eye.
- Each mark is written in their history, and the profile lists them under their name ("Marked: a scar, the crew's mark"). The memorial wall keeps them.
- Saves upgrade on their own: nobody has scars on record yet, but anyone already past ten jobs gets the crew's mark straight away.

## 2026-10-28 · Every face is its own
- **Faces now differ in the face itself**, not just the hair and gear: eyes (spacing, size, tilt, and monolid, creased, hooded or deep-set lids), brows, nose, mouth and lips, jaw, chin, ears and neck. Wide-open eyes show their whites. Some people have freckles or a mole.
- **Age shows**: lines from nose to mouth from the mid-thirties, eye bags and a forehead line from 45.
- **Everyone's face is redrawn once**, crew already in a save included. Hair, skin, implants, gear and the light on them stay the same, so they're still recognisable. Expressions, injuries, masks, glasses and lenses all work as before.
- Fixed: the Greedy trait said buyout offers "tempt her more" whoever had it; it now says "them".

## 2026-10-28 · Shaolin monks
- **A new kind of monk turns up among recruits**: Shaolin warrior monks in saffron robes, with a heavy string of dark prayer beads and nine small ordination dots on the shaved head. Mostly Hong Kong and Southeast Asian names; rarely anyone else. Nobody else's face has changed, though a few existing crew are now drawn as Shaolin monks.

## 2026-10-28 · No more Continue by mistake while planning
- While you're planning a job, the Continue button in the top bar is hidden, so the only button that moves things on is Start. Back out of the plan (or change tabs) and Continue returns. Phones already worked this way for main jobs; now desktop and side tasks do too.

## 2026-10-28 · Duplicate messages fixed; freelancers stand out
- When someone formed two Crew Anchor partnerships on the same day, the two messages looked identical and the second wouldn't open. Each message now opens, and its title names the partner ("Buffer: Crew Anchor with Drone"). Old saves are repaired when loaded (save version 24).
- Freelancers in the squad picker now have a violet stripe and a "Freelance" tag over their cut of the pay, and their card on the squad board has a violet bar along the bottom.

## 2026-10-28 · Two fixes from the owner's play
- Joss no longer says "doctor's orders" about someone who can't work for another reason: Today's line gives each person's real reason ("Sitting today out: Byte (unlucky day)").
- On a computer, the squad picker's "Already on the squad" heading and "Leave this empty" button sat at the far left of the screen; they're centred with the rest of the list now.

## 2026-10-28 · Watching a job without the page jumping
- On a computer, a running job shows the map and the story side by side: the map stays put on the left, and the story scrolls in its own column on the right.
- The story only follows new moments while you're at the bottom. Scroll up to reread something and it stays put, with a "↓ 3 new" button to jump back. Same on phones.

## 2026-10-28 · A quieter risk corner on job cards
- Joss's read of a job's risk is now a thin bracket inside the card's top-right corner, the same size on every card, in the level's colour, instead of a filled triangle that grew with the risk. The word is still on the planning screen.

## 2026-10-28 · The rifle, drawn
- **The rifle has its own picture**, in the same style as the faces: a street rifle with a worn wooden stock and taped grip, or a pro one in carbon with a neon line. It catches the city light of whoever carries it.
- **You can see who carries one**: a runner with a rifle has it slung across their back in their portrait, everywhere their face appears.
- **A runner's gear is four tiles** on their page, each item drawn big; the armoury shows the rifle's picture too. Other gear keeps its small icon until it gets a drawing of its own.
- Fixed (owner's captures): the armoury's rows kept their text against the box's edge, and the crew list's stat line had the icon and number sitting higher than the words after them.

## 2026-10-28 · Marksman and Drone Jockey (the squad run, part 5b)
- **Overwatch can become a career.** Someone who has done three jobs on overwatch with a rifle, with combat 10 and cool 8, gets an offer from Joss to train as a **Marksman**: one more shot, +1 to hit, and a miss costs no heat. Three jobs with a drone and tech 10 brings **Drone Jockey**: one more action, +1, and half the neural load.
- You decide: train them, or "Not yet" (Joss asks again in two weeks). One specialisation each, for good. It shows on their page, on the squad board ("rifle · Marksman") and in the roll breakdown. 309 tests.

## 2026-10-28 · Gear: an armoury, and what each runner carries (the squad run, part 5a)
- **The armoury** (Crew screen): buy gear into the stash, sell it back for half. Rifles and drones, a sidearm, an armoured vest, a cyberdeck, a trauma kit, lockpicks and two implants, each in a street or a pro version (pro is one better and costs 2.5×).
- **Every runner has four slots**: weapon, armour, tool and implant. Tap a slot on their page to put something on them; it stays with them job after job. Gear can't change while they're on a job or away.
- **Gear shows in the numbers**: a sidearm is "Sidearm +1" in the roll breakdown. A vest makes a serious wound less likely, a trauma kit lets someone patch a wound with less training, and implants help two stats but keep neural load from resting below 10.
- **Overwatch needs a rifle or a drone now.** The shared kit is gone: a new crew starts with nothing, and only someone carrying one can take overwatch (Joss too). An old save keeps its rifle and drone in the stash.
- **Some recruits bring their own kit**, and their page says so: a muscle might turn up with a rifle.

## 2026-10-28 · Every district in its own words
- The small moments of a run now read differently in the last three districts too: smoke and holo-ads between the Night Market stalls and a mahjong back room counting money; planters, private guards and a humming server room in Glass Heights; Association guards, feed sacks and the vet block in the Basin. Written by the owner; every district now has all 12. 292 tests.

## 2026-10-28 · Joss sends only who's needed
- **Joss's picks are now the smallest squad with the best odds.** The job's recommended number goes in; overwatch, the van or an extra person inside join only if they make the risk lower. A job card shows how many Joss would send ("3 runners").
- **Standby is your call.** Joss no longer puts someone on standby by default, so one small job doesn't tie up your whole crew. Add someone in the planner if you want the insurance.

## 2026-10-28 · A cleaner job board
- **Job cards say less and mean more:** name and pay, the client, then "2 runners" and the job's key stats as small icons. The coloured corner is Joss's read of the risk if you sent it today: a small green corner is low, a bigger yellow one mid, then orange, then red. Tap the (i) by your reputation for the icon key; on a computer, hover an icon or corner for its name.
- **Only news gets a tag:** street talk, unreliable intel, intel you've gathered there, or a job that takes more than a day. "Ends today" shows under the pay on a job's last day. Threat, district, client mood and days left are on the job's own screen.
- **Runners free today:** everyone's face above the jobs, with who's free, tired, hurt or back when. Hide folds it away.
- **Opening a job starts on Joss's plan:** the approach and squad behind the card's risk are already picked, so the risk you saw is the risk you get. Change anything as before.
- **On a computer, the board stays beside the job** you're planning, so you can switch jobs without going back.
- **Side work leads with the reward** ("Medical ↑", "+3 trust · Madam Rao"), and intel jobs say which job on the board they'd help.
- **"Mid risk"** replaces "moderate risk" everywhere. Clients show as a row of chips under side work. The (i) by reputation now also holds the key to the job-card icons.

## 2026-10-28 · Notes for future UI work
- Behind the scenes only, nothing changes in the game: the project rules now say to check the art bible and the latest screenshots before any screen design work, so mockups start from today's look rather than the old one.

## 2026-10-28 · The Docks and Old Town in their own words
- The small moments of a run (a locked gate, a patrol, a guard, a firewall...) now read differently in the Docks and Old Town: torches between the container stacks and an Aether-Harbour firewall in the yard office; a watchman on the alley steps, guards under the laundry lines and a security chain on the tenement flat's door. All 12 moments, written by the owner. 290 tests.
- The Night Market, Glass Heights and the Basin still use the general wording until theirs is written.

## 2026-10-28 · Every district has its own map (the squad run, part 4)
- The watch screen's site plan now matches where the job is: a **container yard** by the harbour in the Docks (with the crane for overwatch), a **tenement** up an alley of steps in Old Town (overwatch by a rooftop water tank), **market stalls** under a footbridge in the Night Market with a mahjong parlour's back room, a **plaza and glass tower** in Glass Heights with the server room at the top, and the **racecourse stables** in the Basin, under a floodlight tower, with the vet block as the target.
- Behind the scenes, each district can now have its own wording for the small moments of a run (a locked door, a patrol...). Until that's written they read as before.
- 289 tests.

## 2026-10-28 · A neater (i) and reputation line (owner's feedback)
- The (i) is smaller and lines up with its text; tapping it opens the explanation under the line, and the (i) stays put (on phones it used to jump).
- Reputation now looks like the Heat meter in the top bar: "REP", a small segmented cyan track to the next unlock, then "2/10" and the (i).
- The bottom line of job and side-work cards lines its icons up with the words.
- Crew sizes on job and side-work cards are one figure and a number ("[figure] 4") instead of a figure per person, which didn't scale to the four-person jobs.

## 2026-10-28 · Crises name the right person
- In crises that are about one role (the tech when a container stack slips, the driver at a roadblock), the choice now names whoever actually does it, and if it goes wrong they're the one hurt. Before, it could say "Flicker braced it" when Thimble, the better hand, made the roll.
- When Doc Siu hands a patient to someone by name, that medic now does the stitching (backup still helps), like other crises that name someone.
- Crises about one person's own trouble (the tech's nosebleed) still hurt that person if the attempt fails.

## 2026-10-27 · A tidier reputation line
- The job board's reputation is one compact line: "Reputation 2/10", a short gauge of ten blocks (each a tenth of the way to the next unlock) and an (i). The (i) explains how reputation works and, new, what opens when: rookie jobs from the start, then threat 1 at 10, threat 2 at 15, threat 3 at 35, threat 4 at 60 and threat 5 at 80. The old full-width bar read like a big scale.

## 2026-10-27 · Stat icons everywhere you scan for a stat
- The line icons now sit beside the stat everywhere it's a label: **job cards** (what the job needs, and the crew size as figures), the **squad dossiers and picker**, each person's main stat on the **crew list**, and the seven stats on a **profile**. Sentences (crisis reasons, the run feed, reports) stay words only.

## 2026-10-27 · Less to read on Today and the job board (owner's feedback)
- **Coming up:** when three or more people come back from jobs (or heal, or rest up) on the same day, it's one line, "5 back from the job". Tap it to see who.
- **Side work:** the explanation is one short line, "Small jobs for whoever's free", with an (i) to tap for the rest.
- **Icons:** side-work cards show their stat with a small line icon (a steering wheel for driving, a chip for tech, a cross for medical...) and how many can go as little figures instead of "up to 2".

## 2026-10-27 · Easier squad picking, a calmer feed (owner's feedback)
- **Picking the squad:** the picker lists free crew first. Everyone already on the squad sits in their own "Already on the squad" section below, greyed, with a tag saying where they are (Inside, Overwatch, Wheels, Standby, or "In this slot"), so you're much less likely to tap the same person again by accident. Tapping one still moves them to the slot you're filling.
- **Watching a run:** each moment is now a single line, an icon and a short headline ("✓ Raster slips the patrol", "✗ The lock squawks", "★ Buffer saves Drone"). Tap a line for the setup, the detail, the crew's reason and the dice. Story beats are smaller and quieter. Call-ins still show in full.

## 2026-10-27 · Incidents teach, and count towards traits
- **What your crew does on the watch screen now shapes them.** Whoever handles an incident learns a little from it (a quarter of what a crisis roll teaches); a save or patching someone up teaches half. Nobody learns just by watching an incident. Overwatch, Wheels and standby learn from what they actually do.
- **Incidents and saves count towards earned traits** at the same rates, so the situation traits now come from real work: slipping past patrols and opening locks builds **Light-Fingered**, talking through checkpoints **Crowd Reader**, saves in a fight **Steady Under Fire**. How often traits come up overall is unchanged. Whether a job was clean (for Riding High or Client's Favourite) still depends on the crisis rolls only, so a squawking lock doesn't break a good run.
- Everyone on the job, outside the inside team too, now counts for traits like Crew Anchor.
- **Mentoring is worth a full point a season again**, and growth stays on the same curve: about +2-3 in a season, more by the end of the second.
- Past their ceiling, people now grow even more slowly (each point costs six times as much instead of four), so a specialist who handles every incident in their line still hits their wall.
- 267 tests.

## 2026-10-27 · The squad run, part 3: Wheels and standby
- **Wheels:** a new slot on the squad board. Whoever you put in the van takes **every driving roll** on the job, alone at the wheel, out of harm's way inside. Leave it empty and the team drives as before. The crisis read uses their driving.
- **Standby:** someone waiting at the van until it goes wrong. At **max alert** the crew can call them in: they join the team, back up rolls and get **a try of their own at saving anyone in trouble** (after overwatch or a teammate). The alert stays up, so the next slip calls you again, and standby comes once. When someone is **badly hurt**, standby can go in, **get them out and take their place**.
- When the crew decides for itself, **Steady** and **Committed** orders use standby; **Cautious** still pulls out.
- On stealth and con runs, extra bodies stop counting against you once the alert is maxed: nothing left to hide.
- **Joss's picks** now fill Wheels (when the job can need driving and someone out-drives the team) and standby too.
- On the watch screen, Wheels and standby wait at the van; you see standby run in, and a rescue walk the wounded back. While the crew is calling you in, the map scrolls away so the choices have the screen.
- Save format v22: jobs in progress carry on without either. 263 tests.

## 2026-10-27 · The squad run, part 2: the squad board and the watch screen
- **The squad board:** planning a job now pins dossier cards to a board. Tap an inside slot or the overwatch slot to pick who goes; anyone already placed swaps places. **Joss's picks** fills the board for you: the best team for the approach from whoever's free, plus overwatch if it would help. Freelancers are in the picker too.
- **What they'll likely meet:** a new read lists every incident the approach can run into (the way in, inside, the target, and the guard who sometimes turns up), who would handle it with which stat, how risky it is, and how much safer a save makes it ("moderate → low with Tofu"). Gaps show in red. The crises keep their own read below it, and the bar at the bottom shows the worse of the two.
- **The watch screen:** a job now plays out on its own. A site plan stays at the top of the screen: the crew walk from the van through the gate to the target and back out, the camera follows them, and you see guards, patrols with torches, cameras, rifle shots and the drone. Underneath, each moment lands as a card with a short headline and the detail and dice under it. **Pause** holds the clock (and gives you **Next**); **Faster** speeds it up.
- **Call-ins sit in the feed:** when the crew calls you, the run stops on that card until you choose. When they decided a crisis themselves, the card says why ("Crew's call: …").
- **The way out** now has its own heading, and the report adds **saves** (who got whom out of trouble) and **how high the alert got**. The full log has a heading for each part of the job.
- 253 tests. No save change: jobs in progress pick up the new screen.

## 2026-10-27 · The squad run, part 1: approaches, incidents, overwatch
- **Four approaches**, each +1 to one stat and with its own cost: **Stealth** (slip past people; takes a day longer), **Tech** (machines do the work; every tech roll loads the hacker's implants), **Loud** (through the guards; quicker, heat +1) and **Con** (talk your way in, replacing Social; props and bribes up front, ¥100 per threat). The approach also changes which crises come up: stealth meets more break-ins, loud more fights.
- **Incidents:** every job now has small moments on the way in, inside and at the target: a locked door, a patrol, cameras, a checkpoint, a guard up close. Whoever on the crew is best placed deals with them on their own. On stealth and con runs, every person past the job's recommended crew size makes the crew easier to spot (−1 on stealth and social).
- **Saves and overwatch:** pick someone to stay outside on **overwatch** with the safehouse's shared **rifle** (2 shots a job, sees the open ground but not inside, heat +1 a shot) or **drone** (3 actions, sees everywhere, neural load for the pilot). When someone inside gets into trouble, overwatch or the best fighter with them gets one try at saving them.
- **Alert:** mistakes nobody saves raise the alert, and every point makes later rolls harder. At the top, the crew calls you in: go loud or pull out. If someone is badly hurt, they call you too: carry on without them or pull everyone out. An incident can badly hurt someone, but never worse; deaths still only follow "push on".
- **"Call me in…":** choose whether the crew calls you at every crisis, only when it's risky, or never (on rookie jobs, "never" sends them off and the report comes back when they do). When they don't call, their standing orders decide.
- Reports from live runs say how they were called. Save format v21: games in progress carry on, with any Social job becoming Con. 243 tests.

## 2026-10-26 · More earned traits
- **Eight more ways people change** (written by the owner): **Light-Fingered** after quiet break-ins, a **Crowd Reader**, **Wirewise** with street hardware, a **Corner Fighter**; and for a while, **Rattled by Sirens**, a **Short Fuse** (the third time, they become a Hothead for good), **Burned Out** after neural work goes wrong, or **Overconfident** after a run of hard calls going their way (they find the safe option beneath them).
- **Ghost Driver** now works as written: better in getaways, and a clean getaway sheds some of the heat. **Scarred** steadies them when someone's hurt or squaring up.
- 227 tests.

## 2026-10-26 · Crises know what kind of moment they are
- Behind the scenes: every crisis now says what kind of situation it is (a chase, a break-in, a crowd, the police or other officials, a fight...). Nothing changes on screen yet; the next batch of earned traits uses it, and later mission logs and gear.
- Save format v20. 216 tests.

## 2026-10-26 · Earned traits
- **What happens on the job changes people** (12 traits, written by the owner). Some are for good: a medic who keeps patching people up becomes **Clinic Hands**; someone who survives a critical wound comes back **Scarred**; two people who keep coming home together become a **Crew Anchor**. Some come and go: **Shaky** after a bad week, **Riding High** after a clean run, a **Known Face** in a district where they keep causing trouble.
- Joss tells you when someone earns or loses one, and it goes on their profile under "Earned on the job". Nobody is told they're "2 out of 3" of the way there: it happens when it happens.
- Traits never stop you choosing anything; their effects show in the roll breakdown like every other bonus. Someone holds at most two of the come-and-go kind at once.
- Save format v19. 213 tests.

## 2026-10-26 · Side work for the bench
- **Side work this week:** under the job board, 5 small one-off tasks, one per district, new every Monday (25 written by the owner). Send one or two people who aren't busy; they're away a day or three and the result comes back with them.
- **Four kinds:** money (about ¥250 a day each), training (they get better at the task's skill), client trust (+3), and intel: a week of +1 on every roll in that district's jobs, shown on the planning screen.
- If it goes badly the cost is small and stated up front: a light injury, a bit of heat, or a day held by the police. Nobody can die on side work.
- Save format v18. 196 tests.

## 2026-10-26 · Moves your crew grows into
- **17 new choices that unlock as your crew grows** (written by the owner), one in a crisis on each rookie job and in the shared rookie crises. A medic at medical 13 can clear a wound before stitching it; a driver at driving 13 can fold the mirrors and clear a parked truck in one pass; muscle at combat 11 can walk the Silver Fan collectors back upstairs without a punch. They're easier, pay a bonus or dodge a cost.
- Until someone has the stat, the choice still shows, greyed out, with what it needs ("Needs driving 13+"): something to grow towards. Hands-off crews use them too.
- **The person a crisis is about handles it:** when someone on the crew is recognised by an old classmate, or a gang runner falls into step beside them, they deal with it themselves (and the choice names them).
- 188 tests.

## 2026-10-26 · Hands-off crews report back when they return
- **Sending a crew off takes time now:** they leave, and their report comes back when they do (the next day for Container 409). Until then the pay, heat and any injuries don't show; Today has a note saying who's out, and Coming up says when the report is due.
- **The report plays out the first time you open it:** each step lands in turn down the timeline, then the result lands with a flash, then Joss's verdict. Tap to skip. If your phone is set to reduce motion, it all shows at once.
- **Every rookie job can be sent hands-off now**, not just Container 409. The bigger jobs stay hands-on for now.
- Coming up shows a returning crew as one line: "Hook and Typhoon back with the Clinic Night report".
- Save format v17. 183 tests.

## 2026-10-26 · Send a crew hands-off, and reports that show their working
- **Hands-off jobs:** Container 409 can now be sent hands-off. Pick a crew and their orders (Cautious, Steady or Committed); they run it on their own and you go straight to the report. A hands-off crew never pushes on with a critical wound, so nobody can die on one.
- **Better job reports, for every job:** Joss opens with a line on how it went, then the turning point, who stood out and what hurt us (only when there's something to say). Tap **Full log** to read the whole job step by step: who took each moment, why, and, on tap, the dice ("Die 12 + tech 6 = 18 · needed 17").
- **Choices name the right person:** "X steps forward" now always names whoever actually makes the roll and takes the risk. Before, it could name someone else on the crew.
- Older reports keep their timeline; only new jobs have the full log. Save format v16. 177 tests.

## 2026-10-26 · Work through the week, new scout reads
- **New jobs trickle in:** instead of three jobs landing every Monday, one comes in early in the week, one midweek and one late in the week, each with its own inbox message. Every job stays on the board for a week from the day it arrived.
- Freelancers and street talk still change on Mondays.
- **Scout reads in our own words:** the crew now judges a recruit by the jobs they could handle one day ("built for the big jobs", "grows into hard jobs", "a steady pair of hands") and how close they are to their wall ("nearly at their wall", "at their wall"), instead of football-scout talk. 164 tests.
- **Once in a generation:** the rarest recruits now get their own read: "could be one of the greats" ("Teo has never seen anything like Kit. Could be one of the best Lantern Bay has ever had."). Scouts can still be over-hopeful.
- **See why a number is what it is:** when you pick a choice, the risk read now names every bonus behind the number, e.g. "Egg Tart on tech (14, Chromed +2, stealth approach +1)". Traits, a veteran on the crew and your approach were already counted, just never shown.
- **Clearer job reports:** every crisis in the game now gets a plain line in the job report saying what happened. Until now only the newer jobs had them; the district crises, the twists and the seven older jobs are done too (183 lines, written by the owner).
- **City map:** on a computer screen, the district card now sits right next to the map instead of across a wide gap.

## 2026-10-26 · Screenshot log
- **How the game looked, version by version:** `docs/screenshots/` now holds phone screenshots of 11 versions, from the first playable build on 23 Oct to the current one, plus the owner's own screenshots from 24 Oct. Its README lists each version with what changed on screen.
- Every set shows the same screens with the same file names (job board, planning, a crisis, the report, crew and so on), so old and new are easy to put side by side.
- `npm run screenshots -- <name>` adds a new set; `--commit <sha>` captures an older version.

## 2026-10-25 · Tidier crew cards
- **Crew cards line up:** someone who's away no longer has a taller card than the people beside them.
- The name and codename sit on one line, with the status next to their role and the fatigue and morale bars next to the scout's note. On a phone the status and bars get a row of their own.
- "Away, back tomorrow" is now just **back tomorrow** (or "back in 3 days"), in the same teal.

## 2026-10-25 · Masks that cover the eyes
- **Full masks:** a few people now hide their whole face, behind sealed goggles and a respirator, or a smooth faceplate with glowing eye slits. The slits glow brighter under neural load, and the plate cracks when they're hurt.
- People in a lower-face mask can now wear a visor as well.
- You can't always see who's tired behind a mask; the crew list and profiles still say it. 161 tests.

## 2026-10-25 · More faces
- **Masks:** some people wear a respirator with filter cans, a metal jaw plate, or a black mask with an LED line for a mouth that shows their mood.
- **Conical hats:** a steel war hat, a dark one with a glowing neon rim, and a woven straw hat.
- **Half-chrome faces:** a rare few have a metal plate over half the face, with a lens for an eye that glows with neural load.
- **Monks:** shaved heads, prayer beads, and grey, ochre or dark "cyber" robes; some wear the straw hat. More common among Hong Kong names, but anyone can be one.
- **Facial hair:** pencil moustaches, goatees, long drooping moustaches, soul patches and short beards.
- Everyone's existing face stays the same; some people just gained a hat, a mask or a beard. A handful who became monks, got a half-chrome face or a mask lost their old hair, earring, chrome or visor to make room. 160 tests.

## 2026-10-25 · A tidier City tab
- **The City tab is split into four sections:** Map, Clients, Who's who and Lore, with tabs under the title. It opens on the map.
- **The map fits on one screen**, phone or desktop, with the turf key underneath.
- **Tap a district** for the short version: what it's like, any jobs on the board there and the street talk. Tap "More about…" for who runs it, the police, landmarks and the rest.
- **Who's who** lists the megacorps, gangs, police, institutions and wildcards under their own headings. **Lore** has "Everyone knows" and the short history.

## 2026-10-25 · Job reports as a timeline
- **Job reports are easier to read:** open one in the inbox and each thing that happened on the job is its own numbered step, top to bottom, joined by a line.
- **The result comes last**, under ✓ Job done, ↩ Aborted or ✕ Someone didn't come home: pay, heat, injuries, who improved and what the client thinks, one per line. Good news is green, heat is amber, bad news is red.
- Reports from older saves are split into lines too (without the colours). Save format v15. 157 tests.

## 2026-10-25 · Faces everywhere
- **Faces on the job and leads screens:** when you pick a crew for a job, your crew and the freelancers on offer show their portraits instead of initials. So do new leads on the Crew screen and their profile page.
- A lead keeps the same face after you hire them.
- The crew strip on a job in progress and the level-up cards in job reports use faces too. The old coloured initials are gone.

## 2026-10-25 · Race night: three jobs at Lantern Course
- **The Favourite** (Auntie Fung): her horse Pepper runs in the sixth, and someone is paying stable hands to make sure she loses. Get into the stables, find the sedative, get past a suspicious vet, and buy or beat the name out of the Undercroft.
- **Last Ticket** (Ruth Okonkwo): her ¥800,000 paper ticket vanished during an eleven-second blackout in the betting hall. Recover the missing footage, chase a runner through the stands, spot a forgery, and get it paid before midnight.
- **Wrong Horse** (the Ferryman): the horse he carried has the right chip and the wrong markings. Get to stall nine, read the re-flashed chip, find what's under the scar, and get out before the owner's people catch you. Harder, and better paid.
- Six crises each, every one with a way out. The Basin now shows jobs on the map when they're on the board. Fung and Okonkwo's jobs open from reputation 15, the Ferryman's from 35.

## 2026-10-25 · The Basin and Lantern Course
- **A new district on the City map: the Basin.** A bowl of towers between Old Town and Glass Heights, round **Lantern Course**, a floodlit racecourse from 1891 that still races real horses, with 2057 telemetry, live odds in everyone's eyes and illegal bookmakers underneath. You can see the course on the map.
- Tap it for its card: who runs it (the Lantern Bay Racing Association, with the Silver Fan Circle underneath), its landmarks, and its custom about winning tickets. There's no work there yet; jobs are coming.
- The Racing Association joins "Who's who" on the City tab, Lantern Course joins the history, and there's a new street fact about the unlucky number four.
- New recruits may now say they grew up in the Basin.

## 2026-10-25 · Lantern Bay from above
- **The city map is now a proper map:** the island with Iron Peak in the middle and hills around it, a wild island to the west, the Amber Reach out in the harbour, and the mainland with the Docks' piers and the Silt's mudflats.
- **Every district has its own streets:** a neat corporate grid in Glass Heights, crooked lanes in Old Town, a tangle in the Night Market, long haul roads at the Docks, switchbacks up the Peak. Locked districts are greyed out.
- Borders show whose turf it is, and the job counts and street-talk markers from before are still there, in bigger text that's easier to read on a phone. Tap anywhere in a district to open it.
- The ferry still crosses the harbour; the old swaying waves are gone (the sea has a wave pattern now).
- Built so new districts can be added later without redrawing the city.

## 2026-10-25 · A livelier city map
- **The map shows what's happening now.** Each district says how many jobs are on the board there ("2 JOBS", "NO WORK"), and a blinking yellow dot plus "TALK" marks the district this week's street talk is about.
- **Whose turf is it:** a coloured stripe on each district's edge (Brass Anchor yellow, Red Lantern red, Silver Fan violet, Veridian-Apex cyan), with a key under the map.
- **Tap a district** to see its jobs on the board as buttons that go straight to planning, plus the street talk if it's about there. The list of work you can get there is now called "Kinds of work here".
- **A new look to match the rest of the game:** sharp blocks with a cut corner, names in the display font with their Chinese names, and a rough coastline.
- **A little life:** the harbour swells, a ferry light crosses the water, and the district you picked gently pulses. It all stays still if your device asks for reduced motion.

## 2026-10-25 · Room to breathe on desktop
- **Every page now uses the full width on a computer**, not just Today and crew profiles. Phones look the same as before.
- **Crew and Jobs:** cards sit two across. Leads and the safehouse sit side by side under the crew.
- **Planning a job:** your crew list is on the left; the client, approach and risk read are on the right, so you can watch the risk change as you pick people.
- **Recruits** get the same two-column page as your own crew. **City:** the map sits beside the clients, and "Who's who" sits beside "Everyone knows". **Save:** slots on the left, backups on the right.
- A job in progress stays a single column, so the story reads like a page.

## 2026-10-25 · Coming up, up top
- **Coming up now sits in a slim strip across the top of Today**, one column per day, so the week ahead is the first thing you see instead of something under the inbox. On a phone the days stack in the same strip, and it steps aside while you read a message.
- On a wide screen the right-hand side now waits for a message ("Tap a message to read it here") and the week ahead stays put when you open one.
- Joss's Monday line no longer says "Let's see who wants something": it now points at what came in overnight and the fresh work on the board.

## 2026-10-25 · Faces
- **Your crew have faces** on the Crew list and their profile pages, in a painted, Citizen Sleeper-style look: real skin tones, a splash of city neon from one side, light and shadow instead of outlines.
- You can see how someone's doing at a glance: a plaster or bandage when they're hurt, heavy eyes when they're worn out, an implant that glows with neural load. The fallen are greyed on the wall.
- **More variety:** split-dyed hair, slick-backs, glowing fiber-optic dreads, tattooed undercuts; cyber-eyes, glowing circuit lines and synthetic-skin patches; tattoos, neck barcodes and scars; and the odd visor.
- **Faces show mood:** a smirk when morale's high, clenched teeth when it's low, and a dead-eyed stare when neural load or burnout gets dangerous.
- Everyone's face is their own and never changes. Older saves upgrade automatically (save format v14). 156 tests.

## 2026-10-25 · A new look
- **Street-terminal style:** sharp panels with cut corners, a condensed display font for headings, numbers and buttons, segmented gauges, and a faint grid and scanlines. Red, cyan and sodium-yellow, after Cyberpunk 2077 and Citizen Sleeper.
- Everything you read is still in the normal, easy-to-read font. Buttons and tabs are the same size as before.
- The font comes with the game, so it works offline.

## 2026-10-25 · Meet Joss
- **Joss** is the crew's partner: a bootleg AI the Ghost Circuit flashed onto a cracked handset and some salvaged relay boards. They've been with you since before the crew.
- Joss writes your welcome note in a new game, opens each day on Today with a line of their own, and tells you when something needs you ("Sunday's bills are ¥2,800. We're ¥600 short."). Same facts as before, in their voice.
- **Joss has a face:** a taped-up old handset with a bent antenna, which looks worried when money's tight and smug on payday. It blinks.
- No crew member is called "Joss" any more (that name belongs to your partner).
- 150 tests.

## 2026-10-25 · Today, take two
- **The inbox is back at the top** of Today. The four summary boxes are gone (the top bar already shows that).
- **Warnings only when they matter:** a short coloured line appears when a decision is waiting, you can't cover Sunday's bills, a job or recruit is on its last day, or someone can't work. Tap it to go and deal with it.
- **Coming up:** the next seven days at a glance: bills, new jobs on Monday, the scout report, offers running out, and when crew are back from a job or an injury. On a wide screen it fills the right-hand side until you open a message.
- Money in messages now reads like money ("Wages ¥1,250, rent ¥1,500"), in the weekly settlement, job reports and signings.
- Keyboard: opening a message, a crew member, a recruit or a job puts you on its back button, and going back returns you to the row you opened.
- 148 tests.

## 2026-10-25 · Today, and a board you can scan
- **Today** replaces the Inbox tab. At the top: your crew (how many are ready, worn out, out or away), the job board (how many open, the best pay), Sunday's bills (and whether you can cover them) and heat. Tap Crew or Jobs to go there. The inbox is underneath, and each message shows its first line.
- **Heat is a bar** that turns from green to amber to red.
- **On phones, Continue sits just above the tabs**, where your thumb is, and the top bar is two rows instead of three.
- **Job cards are three tidy lines:** name and pay, client and time left, then district, threat and crew size.
- **"6 days left" instead of "until day 7"** for jobs, freelancers and recruit leads. Crew away on a job say when they're back.
- **Clients** fold up under the job board as one line each. Who they are is now on the City tab.
- **Operative pages** use two columns on a wide screen.
- Fixed "A infiltrator wants in" (now "An infiltrator"). 142 tests.

## 2026-10-25 · Small fixes for new and keyboard players
- The welcome message has an **Open the job board** button, so new players know where to start.
- **Keyboard play works properly.** The selected button now shows a clear teal outline, and pressing a button no longer sends you back to the top of the page.

## 2026-10-25 · Easier crew picks
- **The risk read follows you.** On the planning screen, a bar at the bottom shows the risk and a Start button, and it changes every time you pick someone. An empty plan says "no crew yet" instead of "extreme risk".
- **Stats you can read.** Crew rows on the planning screen show "Medical 8 · Cool 5" instead of "med 8 · coo 5", coloured green, amber or red by how that person would do alone on this job.
- **Crew at a glance.** The crew list shows each person's status as a coloured tag (ready, fatigued, injured, away) with small fatigue and morale bars.

## 2026-10-25 · Clearer days and a better inbox
- **You can see the day change.** A bar under the date fills across the week, with Sunday (bills) marked. When a new day starts, the date flashes and a note says what came in: new messages, new jobs, money in or out.
- **No more skipping a day by accident.** After each Continue the button rests for under a second, so a double click only moves one day.
- **Continue says where it goes** ("Continue → Tue") and what's still waiting ("1 unread · 3 jobs open").
- **Cash shows today's change** (▲¥1,050 after a paid job, ▼ on Sundays when bills go out). The tier is now a badge, and the date is shorter.
- **Inbox:** unread messages have a teal dot, read ones look quieter, and each type (report, crew, finance, scout…) has its own colour. On a wide screen the message opens next to the list instead of replacing it.
- Older saves upgrade automatically. Save format v13. 141 tests.

## 2026-10-25 · Story order, young backstories, and Ruth Okonkwo's first job
- **Data Scrub**, a new job for Ruth Okonkwo: steal a prototype chip from a Veridian-Apex lab in Glass Heights. It opens once your crew has a little reputation (threat 2).
- Crises in the new jobs now happen in story order: no running into Ah-Wah's hired muscle on the landing before you've climbed the stairs.
- Rookies' backstories now fit someone aged 18 to 24 (no more 20-year-olds who "spent a decade" doing anything), with twelve new ones. District names read properly in them ("the Night Market").
- Fixed three backstories that used real or off-canon names.

## 2026-10-25 · Start at the bottom
- **A new crew of nobodies.** Every new game starts with five rookies aged 18 to 24, one of each role, with low stats and real room to grow. They work for street wages (about ¥250 a week each) out of a cheaper first safehouse (rent ¥1,500). The Lantern Bay Five are no longer offered.
- **Rookie jobs.** Eight small jobs for a new crew, written with named characters and short dialogue: Clinic Night and Herbal Run for Auntie Fung, Mahjong Ledger and Counterfeit Chrome for Madam Rao, Container 409 and Submerged Cable for the Ferryman, Eviction Notice for Mr. Szeto, and Market Delivery for Mrs. Ip as walk-in work. Meet Doc Siu.
- **Work you've earned.** Bigger jobs only come to a crew people have heard of. A reputation bar on the board shows how far the next step is. The courier run opens first, then each threat level in turn, over about a season. The board is busier: three new jobs a week, up to five at once, always with some small work on it.
- **Slower, longer growth.** Everyone improves more slowly, and a thin bar under each stat shows progress towards the next point. Hidden ceilings are now walls: past one, growth keeps going, just much more slowly.
- **After-action reports.** Each job's message now starts with a plain summary of what happened in each crisis.
- The planning screen's risk read now knows rookie jobs are easier.
- Games already in progress keep their crew and an open board. Save format v12. 137 tests.

## 2026-10-25 · Street talk
- Every Monday a rumour goes round the city, and it's true. Some make every job in one district harder or easier that week ("Silver Fan collectors are out in force in the Night Market"); others warn that a particular trouble is likely there ("the Wet Sleeve are running neural-load checks at the dock gates").
- The job board shows the week's street talk at the top and marks the jobs it affects.
- After a loud job, word sometimes gets round: the gang or corp on that turf starts asking who did it. A clean job sometimes earns a little admiration.
- Older saves upgrade automatically. 6 new tests (126 total).

## 2026-10-25 · The City tab
- A new **City** tab with a map of Lantern Bay: the island, the harbour and the mainland. The four open districts are lit; the Amber Reach, the Silt and Iron Peak are shown locked.
- Tap any district for its card: what it's like, who runs it, the police, the mood at 3am, a local custom, landmarks, and which jobs happen there.
- Below the map: the city's corps, gangs, police and the Ghost Circuit with their street rumours, the things everyone in the city knows, and a short history.

## 2026-10-25 · Pick your starting crew
- Starting a new game now asks who you start with: **The Lantern Bay Five** (Stitch, Static, Velvet, Wheels and Jax) or a **Fresh crew** of five strangers, one of each role (a veteran, two pros and two rookies), different every time. Fresh crews cost about the same in wages but are a tougher start.
- Crisis text no longer assumes your tech or face is a woman, so it reads right for any crew.
- 6 new tests (118 total).

## 2026-10-25 · The city starts to show
- The job board says whose turf each job is on: Old Town is Brass Anchor turf, the Docks Red Lantern turf, the Night Market Silver Fan turf, Glass Heights Veridian-Apex ground.
- The job planning screen opens with a one-line feel for the district.
- 12 new crises, three for each district, that can turn up on any job there: a seizure in an Old Town alley, Brass Anchor men at the shrine, a block-wide blackout; waking security drones, a Signal 3 lockdown and a Wet Sleeve "neural-load check" at the Docks; a Silver Fan tracker, an implant-frying pulse and a police commander on a chrome-clinic table in the Night Market; a fired inside contact, a neural demo gone wrong and a sky-bridge lockdown in Glass Heights. Every job now draws from 9 crises instead of 6.
- Client descriptions now hint at who they really are: Auntie Fung is a Brass Anchor elder, old tenements near Mr. Szeto's sites keep catching fire, and Ruth Okonkwo works for Aether-Harbour Logistics' off-books arm.
- Behind the scenes: the city's lore (history, factions, districts, Pearl Haven House) now lives in `WORLD.md`.

## 2026-10-24 · Heat that means something
- Taking a job no longer adds heat by itself. Heat now comes from how you play: the Loud approach (+1) and crisis choices or failures that say "+heat". A clean stealth or social job adds nothing.
- Heat cools by 2 every Sunday, whether or not you worked that week. The "quiet week" bonus is gone.
- When heat is 6 or more after Sunday's cooling, a fixer gets in touch: someone has been asking about the crew. Pay ¥1,500 to take 3 heat off, or let it ride for free and the next job you start is watched (−1 on its first crisis roll). The planning screen's risk read shows it. At most one notice every two weeks, and it never stops you taking jobs.
- The job planning line no longer shows "+N heat" (jobs have none of their own now).
- Older saves upgrade automatically. 9 new tests (112 total).

## 2026-10-24 · Personality step 4: traits with rarity, steered by backstory
- Traits now have a rarity: Cautious, Curious, Superstitious, Loyal, Greedy and Hothead are common; Silver Tongue and Steady Hands uncommon; Chromed and Veteran rare.
- A recruit's backstory nudges their traits: an implant-heavy past makes Chromed more likely, a calm one Steady Hands or Veteran, and so on. Any trait can still turn up on anyone, and rare traits stay just as rare.
- 3 new tests (103 total).

## 2026-10-24 · Personality step 3: two-part personality
- A recruit's personality is now a temperament plus a habit (e.g. "Quiet and watchful." + one concrete detail), each with a rarity, nudged by their backstory, and never contradicting it (no calm-and-hot, warm-and-cold, charming-and-wary mixes).

## 2026-10-24 · Personality step 2: 113 backstories with rarity
- Recruit backstories grow from 18 to 113 lines (15–22 per role), each tagged and given a rarity: most are everyday, a few are rare, and about one in fifty recruits gets an exotic one.

## 2026-10-24 · Personality step 1: tags and rarity tiers
- Behind the scenes only, no game change yet: a shared list of personality tags, which traits and roles they match, and the rarity odds (common 60%, uncommon 28%, rare 10%, exotic 2%), plus the picker the next steps will use and tests that keep rare lines rare.

## 2026-10-24 · Plan: recruits that hang together
- Plan only, no game change: a recruit's backstory will nudge their personality and traits towards a match, while anything can still turn up on anyone. Lines and traits also get rarity tiers, so rare ones stay rare however many are added.

## 2026-10-24 · More recruit handles
- Recruits now draw from 157 handles instead of 30, with far more cyberpunk ones (Synapse, Overclock, Diode, Uplink…) next to the street-food and city ones.

## 2026-10-24 · Contract renewals
- When someone graduates from rookie, or their main stat rises 2 since their last pay deal, they ask for a new deal. The notice blocks Continue until you answer.
- The notice shows their current wage, what they're asking, their market value and how much loyalty takes off the raise.
- **Accept** pays the ask. **Haggle** once: your best talker rolls, and success takes 10% off (never below today's wage). **Refuse**: they stay, but are unhappy for four weeks (−1 on their rolls), then ask again.
- At most one notice per person every 8 weeks, and no notice if the market wouldn't pay them more.
- Save format v9, with automatic upgrade from v8.
- 7 new tests (88 total).

## 2026-10-24 · Statuses and loyalty (groundwork)
- Under the hood: operatives can now carry timed statuses; the first, **Unhappy**, gives −1 on their rolls and shows in the risk read. Nothing applies it yet.
- The game now counts how many jobs each person has run with the crew; this will set their loyalty discount on contract renewals (1% per job, up to 25% off a raise).
- Save format v8, with automatic upgrade from v7.
- 3 new tests (81 total).

## 2026-10-24 · Renewal plan: loyalty discount reworked
- Plan only, no game change: when contract renewals arrive, loyalty will shave the size of a raise rather than the whole wage, so a loyal star still asks for a real raise.

## 2026-10-24 · Market prices for recruits
- **Stars cost more:** recruits on the board are now priced at market value. Rookies are unchanged (about ¥500); pros run about ¥600–850 and veterans about ¥700–1,100, rising steeply once their main stat passes 12.
- The pricing numbers live in one place, ready for contract renewals.

## 2026-10-24 · Roll rules refactor
- Under the hood: roll bonuses and penalties (traits, approach, fatigue, injury, veteran calm, backup, short-handed) are now one list of rules. Nothing plays differently; it makes upcoming contract renewals easier to add.

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
