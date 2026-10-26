# Core loop from first principles (discussion, 2026-10-26)

Open discussion with the owner. Nothing here is agreed except where it says so; agreed points get `DESIGN.md` log rows. Started from `STATE-OF-PLAY.md`.

## Agreed so far

- **The player is a manager first, with call-ins** (DESIGN.md, 2026-10-26). Routine jobs run hands-off by default; the crew calls you when a crisis falls below their orders' threshold; heists, high-threat jobs and criticals are always played by hand.
- The authored stories are good and stay (owner).

## Evidence from the data (2026-10-26)

- 114 unique crises; 91 offer only two options besides the exit.
- In 64 (56%) the easiest option has no cost, so with the risk label shown the choice is often "pick the lowest risk".
- Crises in a job don't connect: apart from injuries, nothing in the first changes the second.

## The fantasy

A fixer doesn't do the job. They pick the job, the people and the plan, then live with the outcome. As in Football Manager:

- **Planning** is where agency lives: the most decisions and the most ownership. "My plan worked" or "my plan failed".
- **Watching** is where tension lives: things unfold, with a few chances to step in.
- **Aftermath** is where story lives: reports, careers, relationships.

Today agency sits mostly in the middle, in the crisis choices: the operator fantasy. The proposal moves it to planning.

## What planning could hold (GTA heist-style)

- **Approach** (already in, now weighting the crisis draw).
- **Crew in role slots:** who goes in, who watches, who drives.
- **Gear loadout** (agreed: per person, limited carry).
- **Prep:** side tasks as set-ups that change the job (a stolen keycard, a bribed guard, intel on the night shift).
- **Contingency orders:** pre-decided rules ("if it turns into a fight, back off"; "if someone's hurt, get them out"). The current Cautious, Steady and Committed orders are a first version. This is Football Manager's tactics screen, and it lets the player own a hands-off outcome.
- **The exit:** route and driver.

## Watching: the feed

- **Text feed with timing,** like Football Manager's text commentary (famously tense). The hands-off report playback is already a first version.
- **Small checks resolve on their own** to make the feed feel alive ("Hook picks the lock: stealth 12, clean"). Big moments stay authored crises.
- **Call-ins:** the feed pauses and the crew asks for a decision. Possibly a limited number per job, so they're precious.

## The job as a map of routes (Claude's idea)

A job becomes a small graph of places: entry points, rooms, exits. Each place draws crises by situation.

- **Planning** means choosing a path (front door and social, roof and stealth, loading bay and loud) and putting people at points on it.
- **Watching** means tokens moving along the path as the feed plays.

That would tie together several things already agreed or under discussion:
- approaches weighting the draw;
- situations;
- linked crises (a path is a sequence);
- prep opening paths (the keycard opens the side door);
- a visual simulation.

Maps could be reusable building types (warehouse, tower, clinic, street, dock) rather than one per job, which also helps with repetition.

## Visual simulation: options by cost

1. **Text feed with timing:** most of it exists.
2. **Schematic view:** a heist-board floor plan of nodes and lines, with crew tokens moving between them. Fits the street-terminal skin and phone width. Moderate cost.
3. **Full top-down simulation** with rooms, pathing and animation (Door Kickers, RimWorld): very costly (level design, AI, art). Fights text-first and phone-first, and every job needs a layout. Not recommended, at least for now.

## Risks

- **Hands-off can mean "don't care".** Football Manager works because preparation is rich. If planning is thin, watching is just waiting.
- **Writing load:** route maps, contingency outcomes and feed lines all need text. Reusable building types and slots keep it bounded.
- **Two modes to keep in sync:** played and hands-off already share one engine, so keep it that way.

## Possible path (each step stands alone)

- **A.** A timed feed and call-ins for all jobs, with richer standing orders (mostly existing engine).
- **B.** A planning board: role slots, gear, prep from side tasks, contingency orders. Merges with the heist plan.
- **C.** Jobs as route maps, with the schematic view.
- **D.** Maybe never: an animated top-down view.

Before committing: a clickable prototype of one job (Container 409, already prototyped as a log), run as plan, then route map, then feed, then call-in, then report.

## Open questions

1. How many decisions per job, and when? (For example: 4-6 in planning, 0-2 call-ins.)
2. Is every job planned, or only big ones? Routine jobs might use saved plans or presets.
3. How does a plan fail? Contingencies should be the answer, not a game-over.
4. Is a schematic view enough of the "see them walking through rooms" feeling?
5. What happens to the crisis choice pass and linking (both under discussion)? Under the route model, choices are partly made at planning and partly at call-ins.
