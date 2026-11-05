# Backlog: running the tong from one place (2026-11-04)

What the owner and Claude agreed in the 2026-11-04 session, after Phase 1 of the tong direction was
built (#62-#69). **Nothing here is decided beyond what it says**: most of it waits for the owner's
Phase 1 playtest. Design log rows: `docs/design/2026-11.md`, 2026-11-04 ("proposed").

## 0. Now: playtest Phase 1

One in-game week: send everything away ("When it's risky"), take a call, take command once, read
the Sunday summary. Questions: did it feel like running a tong or waiting; did the best runner stay
off easy work; were outcomes understood; did the people at base have anything to do; did money run
short while hiring (decides the parked board tweak, section 5). Plus the eight hands-off checks in
`drafts/mission-log-prototype.md`.

## 1. Districts as presence (the owner's handover idea; Phase 2's main question)

- The tong opens a safehouse in a district once it's trusted there: known and welcome, not owning
  turf (fits WORLD.md: the Brass Anchor Society would have to bless a hall in Old Town).
- Runners have a home district; the people at base hold presence. That gives the bench a purpose.
- Heat becomes per district (already planned in HANDOFF). Raids: rare, warned days ahead, a call-in
  with an exit (hold or withdraw), never a death without the player's choice.
- **Start simple:** no minimum garrison at first; add one only if presence feels toothless.
- **The tong's rank follows reach:** Back Room, Street, District, City, Harbour by how much of the
  city the tong holds presence in (replaces an abstract ladder; the names already say reach).
- Escape hatch (the owner's): if presence feels like admin rather than decisions, drop home bases
  and garrisons and keep districts as places work comes from.

Concerns to measure: runners tied to presence raise wages (re-run `scripts/sim-tong.mjs` and the
fame sim); safehouses per district are the biggest save change so far (roster limit, rent, stash per
district); raids need tests like call-ins have.

Out of date in the owner's handover (don't build from it): "cut morale, burnout and trust" (the
owner chose to keep morale and trust); standing as Unknown/Established/Elite/Legend (fame is built
as Unknown, Known, Respected, Elite, Legend); "guild" naming (the tong). Still open from it:
crediting fight kills to the runner who made them; moving `finish()` into `core/settlement.js`.

## 2. One central place to run the tong

- **If presence goes ahead:** the City tab becomes the command centre (maybe renamed Ops). No new tab.
- **If presence is dropped:** a separate Ops tab holds the list; City stays a reference map.
- Either way: Save moves off the tab bar (into a small menu); Today keeps the morning briefing with
  one line linking to it ("3 crews out, 1 call waiting"); Jobs stays for choosing work.

## 3. The command-centre screen (phone first)

- **On top, the map:** fits the width and never moves (no zoom, no pan, no sliding sheet).
  Districts are big tap targets (44px+) opening a card: the district picture, who's based there,
  heat, jobs. For glancing: crew blips, heat glows, pulsing calls, raid rings.
- **Below it, the list:** the real controls (crews out, calls waiting, raid warnings, side work).
  Everything can be done from it without touching the map. Tapping a crew highlights its district;
  tapping a district filters the list.
- On an iPad or computer the list sits beside the map.
- **Map style:** a neon tactical map drawn in code, to match the street-terminal skin: lit
  coastline, faint streets, transit lines (monorail, ferries, the Amber Reach crossing), a landmark
  glyph per district, small moving details (a ferry, maglev traffic). Today's City map is the
  weakest art in the game (small on a phone, labels covering the land, flat colour, nothing moves).
  Rejected for now: a pixel-art city like the district pictures (every district redrawn at map
  scale); only polishing today's map (still reads as a sketch).
- **Before building:** a clickable mock-up (`drafts/prototypes/`) for the owner to try.

## 4. Crews out made visible

- **4a, built 2026-11-04** (before the playtest): the send-off card; "Out · Thu" on runner tiles;
  crew-out cards with faces, a status light, a day track through the story beats, the phase and
  today's lines; back cards with the faces home and a result stamp.
- **4b, after the playtest:** a mini site map on each crew-out card with the crew as dots where they
  got to today, drifting gently; tap to replay the day on the watch screen without taking command.
- **Later:** phone vibrations once wrapped for iOS (Safari on iPhone has none); sound.

## 5. Parked until the playtest says otherwise

- **The board tweak:** the week's routine offer becomes any routine tier once the tong has no
  rookies (late-game tongs get better-paid everyday work). Only if early hiring feels too punishing.
- **Owner's writing:** the quiet-day lines in `src/data/away.js`; story text naming a fixed number
  of days (Penthouse Heist's "three nights").

## 6. Later (Phase 3 and beyond)

The first heist (Black Sun: prep jobs across districts feeding one score); named squads; safehouse
rooms; Legend, retirement and the Hall of Legends (maybe the tong's own hall); command-fight polish
resumes.
