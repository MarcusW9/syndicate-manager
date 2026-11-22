# Handoff: the revenue plan, after security posts (2026-11-21)

For the next session. What is done, what is next in the owner's order, where it lives in the code,
and the questions to put to the owner before building. Read `CLAUDE.md` first. The why for every
line here is in `docs/design/2026-11.md` (grep the topic).

## Start here (2026-11-22): build the adventure log

**Model:** Opus. Everything below the owner has already answered; build, don't re-ask. Read `CLAUDE.md`, then this section, then `docs/log-lines-prompt.md` ("How the log tells a story", slots and rules: the engine must read exactly that format).

**The line files are written** (the owner's drafts, Claude's review fixes marked `// fixed:`, gaps `// needs`), in `drafts/advlog/`:
- goals: `weapon.js`, `recruit.js`, `cash.js` (district-free by decision: a line that fits one district only lives in that district's file);
- districts: `docks.js`, `nightMarket.js` (contacts `{ name, what }`, places with "the", quiet, snag). Old Town, Glass Heights and the Basin have none yet: fall back to the generic pools and a neutral `{place}` / `{contact}` (or keep expeditions to the two written districts at first, the owner's call).
- Move them to `src/data/advlog/` as they become used; leave `// needs` gaps (empty lists are fine, the picker skips them).

**Slice 1: the log on what exists (no expeditions yet). Built 2026-11-22 (save v86; `core/advlog.js`, `tests/advlog.test.js`; design-log and changelog rows of that date). Next: the owner plays it and marks `src/data/advlog/jobDays.js` and `sideDays.js` (Claude's drafts); then slice 2.** What was built, item by item:
1. `core/advlog.js`: one generator. Given the crew, district, kind, day and the trip's state, it picks the day's beat and line. Seed every pick with `hashRng(seed, 'advlog', tripId, day)` (`core/rng.js`) so no other roll moves. Keep the trip's facts (`contact`, `place`, which named on day 1) on the trip's state. Fill slots, capitalise a slot that starts a sentence, use `{itemFull}` / `{contactWhat}` / `{lead}` only where the format says.
2. `{who}` is the crew member best at the beat's stat; asides (about one day in three) by `{who}`'s temperament tags. Runners do not store tags: recover them by matching the two sentences of `op.bio` against `TEMPERAMENTS` and `HABITS` in `data/recruitPools.js` (no save change; founders included). Pair days need two or more crew. Joss lines rarely.
3. **Hands-off jobs** (`core/away.js`): `dayLines` (line 29) shows a beat's text or a `QUIET_LINES` placeholder (`data/away.js`). Give each day out a log line from the JOB DAYS format (`casing`, `setup`, `waiting`, `snag`); no job has a job-days file yet, so start with generic job-days pools (Claude drafts a small set; the owner marks) and keep beats and crises as they are. Show the latest line on Today's crew-out card (`ui/today.js renderCrewsOut`, line 156) and the whole log in the report.
4. **Side tasks** (`core/sidetasks.js`, `sendOnSideTask` / `returnSideTasks`): a two-day task writes a line a day; the result is the last line.
5. **Posts** already keep a day log (`core/contracts.js`, `c.log`, lines 213-237). Leave their pools in `data/contracts.js`, but write their days through the same generator if it fits without changing their rolls.
6. Cap every log (the last 10 lines) and check the save-size test (`tests/inbox.test.js`).

Slice 1 as built: job days write a line every day out (also on beat days, the card shows the log line first and the beat under it); job-day snags cost nothing; posts keep their own pools and rolls and get temperament asides from `asideFor` (its own hash). Loose ends: Old Town, Glass Heights and the Basin have no district file (lines needing `{place}`/`{contact}` are skipped there); the goal files' asides/pair/joss are unused until slice 2; a job of its own job-days file would go in `src/data/advlog/` and be picked by template id in `jobDayLine`.

**Slice 2: expeditions** (after slice 1 is merged and played).
- Their own system, not jobs: the player sends a crew from a screen of its own (not the board) with a goal, **a weapon first**, then cash, then a recruit. In-game days, 3 to 7, the goal sets the length and which stats count. No client, no pay, **no fame**; fights on them count in the fight record.
- Each day rolls progress on the crew's stats and gear and writes the log (open, beats and callbacks, turn, close). A **call** is a fight that calls the player in, as on a hit post (`contracts.js startPostFight` / `finishPost`, engine 2). Pull out early any time, everyone safe. No death unless the player accepted the shown risk (the fight rules already handle it).
- Close: **met** (the weapon, the sum, a recruit lead in Crew › Leads via `dossier.js`), **partial** (parts or a lesser piece / part of the sum / a name with no meeting), **failed** (only the finds). Finds pay out as they happen (cash, gear, a rumour).
- Needs a save version (now `SAVE_VERSION = 85`, `core/state.js`) and a migration in `save/save.js`; `state.expeditions` with the trip's state and log.
- Check: the income sim with expeditions (`scripts/sim-crew-income.mjs`, an option like `posts`), the fame sim, the save tests.

**Every slice ships with** (CLAUDE.md): `npm test`, a design-log row, a changelog entry, CODEMAP lines for new files, `docs/SCREENS.md` if a screen changes, and screenshots (`npm run screenshots -- <slug>`) with a README row.

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

**The owner's answers (2026-11-21):**
1. Order: the log on hands-off jobs and side tasks first, expeditions second. **Yes.**
2. In-game days, not real-time timers. **Yes** (decision log).
3. Line pools: Claude wrote a prompt the owner (or any chat) uses to draft them, `docs/log-lines-prompt.md`; Claude drafts, the owner marks. The format there is the one the engine reads.
4. Expeditions earn no fame; their fights count in the fight record. **Yes.**
5. A failed expedition still brings something back (finds on the way, part of the goal). **Yes.**
6. Goals: **a weapon first**, then cash and recruits. **Heist prep is not an expedition goal**: heist prep is a normal job and, like the other jobs, gets the longer log-style play (multi-map, below).

**The log is a procedural story, not a random line a day** (owner asked). Day 1 names a contact or a place and the engine remembers it; middle days are beats (lead, dead end, snag, find, quiet) and callbacks to what day 1 named; then a turn, sometimes a call (a fight), and a close (met, partial, failed). Each beat rolls on a stat and `{who}` is the crew member best at it, so pools are split by stat. A goal file gives the shape of the hunt, a district file the people and places. Spelled out in `docs/log-lines-prompt.md`; the engine keeps the trip's facts (`contact`, `place`) on the trip's state and seeds every pick with `hashRng`.

**Personality in the log (owner, 2026-11-22: "too dry").** Pools for asides keyed by the runner's temperament tags, pair days ({who} and {other}) and Joss's comments; quotes allowed in day lines. Runners don't store their tags: `recruits.js` builds `bio` from a TEMPERAMENTS and a HABITS entry (`data/recruitPools.js`). The engine can recover the tags by matching the bio's two sentences against those lists (no save change; founders and older saves included), or store `op.tags` with a save version. Recommended: match first, store only if a bio can change.

### Expeditions have a goal (owner, 2026-11-21)

Not a wander with no target. The player picks a goal when sending the crew; each day rolls progress towards it on the crew's stats and gear, and the log tells how it goes ("Day 2: Raster's contact at the depot went quiet"). Finds along the way (cash, a scrape, a fight that calls you in) are extras. They come back with the goal met, partly met or failed. Pull out early any time, everyone safe. The goal sets the length and which stats count.

**Expeditions are their own thing, not jobs (owner, 2026-11-21).** A job is work for a client on the board: it pays cash, earns fame and client trust, is planned on the squad board and can be watched. An expedition is work for our own tong: the player sends a crew, no client, no pay, no fame; the reward is the goal itself. Always hands-off, read as a log; a fight calls you in as on a post. Own state and own screen entry (not an offer on the board).

Goals the owner picked (in build order):
- **A weapon (first):** track down a named weapon, not a random find (gear tables in `data/`, the stash).
- **Cash:** a debt, a stash, a skim, a quick score; small-time, not a heist.
- **A recruit:** turn up a lead of a wanted type (a medic, a driver). Ends as a name in Crew › Leads (`dossier.js`, `ui/tongs.js leadNames`).

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
