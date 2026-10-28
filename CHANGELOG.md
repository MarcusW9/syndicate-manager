# Changelog

What changed in each update, newest first. For *why* a decision was made, see the decision log in `DESIGN.md`.

Live build: https://marcusw9.github.io/syndicate-manager/


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
