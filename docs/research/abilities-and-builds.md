# Abilities and builds: stats vs traits, and combinations that emerge

Started 2026-11-18. Feeds `drafts/PROPOSAL-runner-shaping.md` (the one menu) and `drafts/PROPOSAL-build-vocabulary.md` (the words pieces are written in).

## 1. Stats and skills vs broad traits

Source: an r/RPGdesign thread, "stats and skills vs. broad traits" (2019), shared by the owner. It compares skill lists (GURPS, D&D) with broad, rated traits such as "Hard-nosed Detective" or "SCUBA Diver" (Primetime Adventures, Prose Descriptive Qualities, Unknown Armies; FATE's aspects are a cousin).

**What traits do well**
- The character concept is the mechanic: "Ex-Cop" says who someone is, not only what they can do.
- No skill-list gaps (you never take Swim and SCUBA and forget Dive).
- Different people shine in different scenes: the Disgraced Noble handles the court, the Dock Brawler the alley, instead of one Persuasion-5 character taking every social roll.
- They pull players into the fiction: you describe why your trait applies.

**Where traits go wrong**
- **Breadth.** A trait is too narrow or, more often, too broad ("Spy" in a spy game), and one high trait ends up used for every important roll. Several posters who ran FATE found this happened every time.
- **Balance needs a referee.** "Former SEAL" against "unemployed box office attendant" can only be balanced by a GM's judgment at the table. The designer has no lever.
- **Slower play.** Each use is a small negotiation ("I worked the docks, so I've been in fights, so...").
- **Creative block** at character creation.

**The most useful idea in the thread: resolution ("zoom")** (user maibus93). Traits and skills are the same thing at different zoom: "Cop" is zoomed out, "Pistols" zoomed in. Balance breaks when entries at **different** zoom sit side by side (D&D's Perception beside Medicine), not because traits or skills are better. Motorcycle Cop, Detective and SWAT Officer balance fine against each other, because they share a zoom.

**Other ideas worth keeping**
- **Fixed lists vs free text** is a separate axis from zoom. Free text needs a referee; a fixed list lets the designer price each entry.
- **Exhaustion:** a trait gives less each time it is used and recovers with rest. Narrow traits stay reliable; a broad one cannot carry every roll.
- **Breadth and strength as two ratings:** a broad trait is weaker, a narrow one stronger, from one budget.
- **Specialties** (World of Darkness): a high enough skill makes you pick a subtype.
- **Move systems** (Powered by the Apocalypse): traits whose rolls give specific, flavoured outcomes. Focused, at the cost of steering players toward the designer's idea of the game.
- **"Which is better" is the wrong question.** Skills suit games where balance is measured; traits suit narrative games. Pick for the game you are making.

## 2. Combinations that emerge (Hades and roguelites)

From the owner's aim (2026-11-18): many independent pieces that combine into effects nobody planned, satisfying to watch.

- **Pieces are written against shared hooks, never against each other.** A Hades boon says "on hit, apply Doom"; another says "when Doom triggers, also...". Neither knows the other exists; the combination happens when they meet.
- **A small vocabulary:** triggers (on hit, on kill, on dodge, on being hit), statuses a body carries, and tags those statuses care about.
- **Statuses others can read** produce most of the combinations: one piece applies, another reacts.
- **A few rare duo pieces** appear only when two conditions hold: the jackpots.
- **Every effect is visible.** A combination the player cannot see did not happen.

## 3. What this means for Lantern Bay

- **Stats stay the engine.** There is no referee, so the code must decide when anything applies, and the pace sims, the risk reads and "shown risk equals used risk" need numbers that mean the same every time. That is the thread's case for skills.
- **The one menu keeps one zoom.** Every entry is about as specific as an ability ("when a shot only cracks a plate, mark the target"), never a whole career ("Ex-Soldier"). A broad entry beside narrow ones would win every time.
- **"Different people shine in different scenes" comes from statuses and triggers, not identities.** Two runners combine because one marks and the other reads marks, not because one has a better number.
- **Exhaustion is our "once a job" and "once a fight"** limits (Clean Professional, Ricochet's one use, the steady hand), kept as data so they can be tuned.
- **Considered and dropped (2026-11-18): broad identities** ("Ex-Cop: a bonus in police moments", tied to `data/situations.js`). Flat bonuses don't combine with anything, which is the opposite of the owner's aim.
- **The no-pairs rule** (a piece never names another) is how emergence is protected. A test should hold it once pieces are built (`drafts/PROPOSAL-build-vocabulary.md`, last section).
