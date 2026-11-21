# Handoff: the revenue plan, after security posts (2026-11-21)

For the next session. What is done, what is next in the owner's order, where it lives in the code,
and the questions to put to the owner before building. Read `CLAUDE.md` first. The why for every
line here is in `docs/design/2026-11.md` (grep the topic).

## Done (PR #226, branch `claude/vigilant-meitner-7qty6d`)

- Income sim by crew size (`scripts/sim-crew-income.mjs`; report `docs/sims/crew-income-2026-11-21.md`).
- The board grows past five runners (`core/jobs.js ARRIVALS` over 4, per 2).
- Security posts, save v84 (`core/contracts.js`, `data/contracts.js`, Jobs › Side).
- Hit posts are engine-2 fights with help from anyone free, save v85 (`startPostFight`, `finishPost`, `fight.js reinforce`).
- Post fights count in the fight record only (`core/record.js recordFight`).
- Proposal and outcomes: `drafts/PROPOSAL-security-contracts.md`, `drafts/PROPOSAL-work-scales-with-crew.md`.

## The owner's order (2026-11-21)

1. Security contracts: **done**.
2. **The adventure log**: next.
3. Multi-map operations, piloted on one heist.
4. Hall businesses last. A runner does not run a noodle bar; this may become a later "conglomerate" layer.

## Loose ends from the posts work (small, any time)

- **Owner's writing:** the post text in `src/data/contracts.js` is Claude's draft (posts, quiet/good/rough lines, incidents, `INCIDENT_LINES`). Add it to `drafts/writing-tasks.md` if the owner wants it in the usual pipeline.
- **Posts on Today:** Today's out line (`ui/today.js renderOutLine`) counts crews on jobs and side tasks, not posts. Add posts to the count with a link to Jobs › Side, or give them their own crew-out card (`renderCrewsOut`).
- **Stash sell mode** (option C in `docs/screenshots/2026-11-21-stash-rows/00-mockup-options.png`): tick several items and sell them in one go. Builds on `ui/gear.js stashRow`.
- **Five-person crews still break even.** Fixing it with more offers moves the fame sim's Elite target (`tests/fame-sim.test.js`, one or two by week 52). That is the owner's call; posts already lift it to about +15-38%.

## Next: the adventure log

**The idea (owner, 2026-11-21, after Fallout Shelter's wasteland log):** crews who are away send back a running story of what happened, from their stats and gear: finds, scrapes, contacts, a fight. You don't control them. The watchable moments stay on the maps; the log fills the time between.

**What exists to build on:**
- **Hands-off jobs** (`core/away.js`): a crew plays a share a day. `dayLines` gives Today's crew-out card one or two lines from the day's events, else a `QUIET_LINES` line from `data/away.js` (six placeholders). The full events list is in `am.events`; the report comes back when they do.
- **Posts** (`core/contracts.js playDay`): already a day log. One roll a day picks a quiet, good or rough line from the kind's pool, stored on `c.log`, shown as the last line on the post's card. This is the first adventure log; generalise it rather than write a second one.
- **Side tasks** (`core/sidetasks.js`): one roll when they come back, one line, no days in between.

**A first cut, to propose to the owner:**
1. **One log generator** (`core/advlog.js` or in `contracts.js` made generic): given the crew, the place (district), the kind of work and the day's roll, pick a line from a pool keyed by kind and outcome, filled with who did it. Seeded `hashRng(seed, kind, id, day)` so no other roll moves.
2. **Hands-off jobs get a day log:** every day out writes a line (not only beats), so a three-day job reads as three days. Show the last line on Today's card and the whole log in the report.
3. **Side tasks get days:** a two-day task writes a line a day, and the result is the last line.
4. **Expeditions** (the bigger new thing): a crew goes out for 3 to 7 days **to get something specific** (owner, 2026-11-21: "they should be working towards a goal"). See "Expeditions have a goal" below. Needs a save version (`state.expeditions`, or a kind of side task).
5. **Where it shows:** Today's crew-out cards (one line each), a full log on tap, and the report when they're back.

**Questions for the owner before building (recommended answer first):**
1. Start with the log on what exists (hands-off jobs and side tasks), then expeditions as a second step? (Recommended: yes. The log is useful at once, and expeditions reuse it.)
2. Expeditions: in-game days, not real-time timers? (Recommended: in-game days, already in the decision log. Real time could come with iOS.)
3. Who writes the line pools: Claude drafts, the owner marks, as with the posts?
4. Should expeditions earn fame? (Recommended: no, as with posts, so the Elite timing holds; fights on them count in the fight record.)
5. Does a failed expedition still bring something back? (Recommended: yes, part of the goal or the finds along the way, so a bad roll still pays a little.)
6. Which goal is the pilot? (Recommended: heist prep. It is the most useful now and leads into the multi-map heist.)

### Expeditions have a goal (owner, 2026-11-21)

Not a wander with no target. The player picks a goal when sending the crew; each day rolls progress towards it on the crew's stats and gear, and the log tells how it goes ("Day 2: Raster's contact at the depot went quiet"). Finds along the way (cash, a scrape, a fight that calls you in) are extras. They come back with the goal met, partly met or failed. Pull out early any time, everyone safe. The goal sets the length and which stats count.

**Expeditions are their own thing, not jobs (owner, 2026-11-21).** A job is work for a client on the board: it pays cash, earns fame and client trust, is planned on the squad board and can be watched. An expedition is work for our own tong: the player sends a crew, no client, no pay, no fame; the reward is the goal itself. Always hands-off, read as a log; a fight calls you in as on a post. Own state and own screen entry (not an offer on the board).

**Open: heist prep overlaps.** Heists already have prep jobs (`heistOnly`, `data/heists.js`). Options: an expedition is a slower, hands-off route to the same prep next to the prep jobs (recommended: it gives the same result as one prep job, takes longer, risks less); expeditions replace prep jobs; or heist prep is not an expedition goal.

Goals the owner picked:
- **Heist prep:** a guard rota, a keycard, a way in, for a coming finale. Plugs into what the finale already carries (`heists.js`: `job.threatDelta`, `inside`, `drop`).
- **Find a recruit:** turn up a lead of a wanted type (a medic, a driver). Ends as a name in Crew › Leads (`dossier.js`, `ui/tongs.js leadNames`).
- **Get one piece of gear:** track down a named item, not a random find (`data/` gear tables, the stash).

Not picked for now: a deeper read on a rival (scouting and Watch a tong already do it), a contact in a district.

**Check before shipping:** the income sim with expeditions (`scripts/sim-crew-income.mjs`, add an option like `posts`), the fame sim and the save-size test (`tests/inbox.test.js`: logs grow saves, so cap each log, e.g. the last 10 lines).

## After that: multi-map operations (the new format for jobs)

**The idea (owner, 2026-11-21):** not a new kind of contract. It is the new way the board's jobs play. They stay jobs from clients (`data/clients.js`: the neighbourhood powers, Ruth Okonkwo for the corps' off-books work, and more as the lore allows, via `add-lore`). The difference is that a job moves: street, then the building's front, then a big map of the inside, then out the back into an alley, and on to another place. Between places the log covers travel and setting up ("Day 2, 03:10: Raster lifts a keycard").

The cyberpunk shapes the owner means, all as jobs:
- **Intel:** the client wants something found out.
- **Setup:** the client wants something stolen and we prepare it (the way in, the codes, the timing), or do the theft.
- **Lead-following:** break in somewhere, find what points to the next place, get information out of someone, and sometimes the lead is wrong and costs time. The next step is not known at the start. (Interrogation was only an example, not a mechanic to build.)

Each stop is a beat, a crisis (every crisis keeps an abort or extract) or a fight, whichever fits. Short jobs can stay as they are (arrive, do it, leave); which jobs move is the owner's call per job.

**Where to start:**
- Heists (`core/heists.js`, `data/heists.js`): prep jobs and a finale already exist. Pilot one finale as three maps.
- A job's run is a queue of beats, zones, incidents, crises and battles (`core/mission.js startMission`), and its site comes from `data/sites.js pickSite(district, jobId, templateId)` with zones `in`, `inside` and `target`. A multi-map job needs a site per stage and a stage step in the queue that swaps the map (the watch screen, `ui/watch.js` and `ui/siteplan.js`, draws one site per run today).
- The fight engine takes `spots` per fight (`fightmap.js stageSpots`), so a fight on any stage's map already works (the posts use the target zone of a district site).
- **First question for the owner:** which heist is the pilot, and what are its three places? Or pilot on a lead-following job instead. How many stops (recommended: 2 to 4, the next rolled from what was found, a wrong lead now and then)?

## Last: hall businesses ("conglomerate")

Parked. Owner: not run by runners. When it comes back, start from the owner's framing (the tong builds real businesses), not from hall rooms.
