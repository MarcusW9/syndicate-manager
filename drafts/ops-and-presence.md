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
- **4b:** a mini site map on each crew-out card with the crew as dots where they got to today (built
  2026-11-06: still dots, a thumbnail beside the lines); tap to replay the day on the watch screen
  without taking command (skipped for now, owner 2026-11-06).
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

## 7. The owner on the mock-up (2026-11-05)

"Pretty cool"; "the actual feeling is cool". Notes for the real build:
- Tapping a district on a phone shows its card right under the map; scroll it into view when it would land off screen (done in the mock-up).
- The game's portraits replace the initials (halls, crews out, people travelling); crews on the map could become small face tokens, as the fight map has.
- The map must leave room to grow: locked districts open later (data, not new art), and what's inside a district (the hall, contacts, job sites) lives on its card or a district view, so the city map stays readable at phone width.
- Reinforce now opens "who do we send?" in place, with the arrival day (was: jumped to the hall's card).

## 8. Halls (decided and built, 2026-11-05)

The owner: build presence into buying places, as beds are bought. The safehouse is the Old Town
hall; one hall per district, each with beds, rent and a level; everyone lives in one; the roster
limit is all the beds; opening another needs the district's welcome and a deposit; each hall
expands on its own; the rank follows the halls. **Moving in takes the day, not the trip** (the
city crosses in under an hour): they count there at once but settle in and can't work until
tomorrow. This replaces the handover's "a day's travel" (also for jobs in other districts: none).
Next slices: heat per district; raids with an exit; an opening job per district (owner's writing);
City as the command centre; rooms per hall later (clinic, workshop...), so halls can specialise.


## 9. The command centre, part 1 (built, 2026-11-05)

Moved ahead of raids (owner agreed), so raids are built straight into it. City's map tab: the map,
the picked district's card (now with the hall's faces), then **Out now** (crews out, calls first,
side work), then the city. A crew's district lights the map and narrows the list. Today keeps the
briefing, the back cards and one line ("2 crews out · 1 call waiting"); Save is a ☰ button in the
top bar. Next: raids with an exit (warnings and call-ins in this list, rings on the map); part 2,
the neon map from the mock-up (face tokens, heat glows); opening jobs when the owner's writing is in.

## 10. Raids, police first (built, 2026-11-05)

Each day a district with one of our halls is at heat 7+, a seeded 25% roll can warn of a raid three
days ahead. The warning is on City (top of Out now, a ring on the map), Today and Coming up. Only the
Wet Sleeve (Docks, Night Market) can be paid off. On the day: hold (a command fight on one shared
hall map, `data/sites.js` HALL), walk out the back (nobody hurt; the hall loses what was kept there,
pays repairs and shuts a week), or pay at the door where possible. Death only after "keep fighting".
Owner's calls: police now, gangs next (gangs expect settlements; police barely bribable); a daily
roll, not every Sunday; holding as a reverse command fight; no minimum garrison. Next: gang raids
(a grudge per gang), a hall map per district, then the neon map.

## 11. The command centre's map, part 2 (built, 2026-11-05)

The City map is the mock-up's neon map (`ui/citymap.js`): faceted districts, plates with who's based
there and the heat, heat glows, crews out as faces on a route from their hall, calls pulsing, raid
rings, a legend. Only calls and raids move (owner: ambient motion clutters it). The landmarks drawn
in the portraits' style (`ui/landmarks.js`) are kept for the district card, the halls and the raid
screens. Next: gang raids.

## 12. Gang raids (built, 2026-11-05)

A grudge per gang (0-10) from jobs against them (six tagged), fading 1 a week. From 6 a gang may
raid a hall of ours on its own turf (Red Lanterns: Docks; Silver Fan: Night Market, Basin), never
Old Town. Settling is always on offer and halves the grudge; holding keeps it; walking out leaves
it. Shown on the job's card and plan, Who's who and the district cards. Open: more grudge sources if
play needs them, a grudge cost on single crisis choices.

## 13. A hall map per district (built, 2026-11-05)

Each hall has its own fight map, the place `data/halls.js` names: the room above the noodle shop,
the rooms above the sari shop, the container office on the pier, the flat over the tack workshop,
the service floor. Our people start by the way out, the raiders at their way in, and both sides have
cover. Open: rooms per hall, and maybe a map that grows with the hall's level.

## 14. The landmarks off the map (built, 2026-11-05)

The district landmarks stand beside the halls on Crew › Halls (dimmed for a hall not yet opened)
and beside a raid in Out now, the warning and the call, with a red glow while it's coming. Not on
the district cards: open districts already have their picture.
