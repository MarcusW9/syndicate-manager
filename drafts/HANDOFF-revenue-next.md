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
4. **Expeditions** (the bigger new thing): a crew goes into the city for 3 to 7 days with no target. Each day rolls a few events on their stats and gear (cash found, a contact, intel on a district, a gear find, a scrape or injury, now and then a fight that calls you in like a hit post). They come back with what they found. No death unless the player accepted the shown risk (the fights follow the same rules). Needs a save version (`state.expeditions`, or a kind of side task).
5. **Where it shows:** Today's crew-out cards (one line each), a full log on tap, and the report when they're back.

**Questions for the owner before building (recommended answer first):**
1. Start with the log on what exists (hands-off jobs and side tasks), then expeditions as a second step? (Recommended: yes. The log is useful at once, and expeditions reuse it.)
2. Expeditions: in-game days, not real-time timers? (Recommended: in-game days. Real time could come with iOS.)
3. Expeditions pay in what: cash, gear, intel, recruit leads, or a mix by where they go? (Recommended: a mix, and the district decides the lean, e.g. the Docks for gear, the Night Market for contacts.)
4. Who writes the line pools: Claude drafts, the owner marks, as with the posts?
5. Should expeditions earn fame? (Recommended: no, as with posts, so the Elite timing holds; fights on them count in the fight record.)

**Check before shipping:** the income sim with expeditions (`scripts/sim-crew-income.mjs`, add an option like `posts`), the fame sim and the save-size test (`tests/inbox.test.js`: logs grow saves, so cap each log, e.g. the last 10 lines).

## After that: multi-map operations

**The idea (owner, 2026-11-21):** a long job moves through several maps. Street, then the building's front, then a big map of the inside, then out the back into an alley, and on to another place. Between maps the log covers travel and setting up ("Day 2, 03:10: Raster lifts a keycard"). Ordinary jobs keep arrive, do it, leave.

**Where to start:**
- Heists (`core/heists.js`, `data/heists.js`): prep jobs and a finale already exist. Pilot one finale as three maps.
- A job's run is a queue of beats, zones, incidents, crises and battles (`core/mission.js startMission`), and its site comes from `data/sites.js pickSite(district, jobId, templateId)` with zones `in`, `inside` and `target`. A multi-map job needs a site per stage and a stage step in the queue that swaps the map (the watch screen, `ui/watch.js` and `ui/siteplan.js`, draws one site per run today).
- The fight engine takes `spots` per fight (`fightmap.js stageSpots`), so a fight on any stage's map already works (the posts use the target zone of a district site).
- **First question for the owner:** which heist is the pilot, and what are its three places?

## Last: hall businesses ("conglomerate")

Parked. Owner: not run by runners. When it comes back, start from the owner's framing (the tong builds real businesses), not from hall rooms.
