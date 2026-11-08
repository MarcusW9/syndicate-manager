# Phase 3: heists, Legends, the other tongs, loyalty (proposal, 2026-11-07; part C rewritten 2026-11-08)

**Slice A1 is built** (2026-11-07, save v47; DESIGN.md 2026-11-07 "Heists, slice A1" has the owner's calls, which replace the suggested defaults in section 6 items 1-4: Madam Rao's heist first at reputation 15, Mr. Szeto's at three halls and reputation 60, no rank change, 3 prep in 3 weeks, stand-in jobs; and the "clean exit" effect left out). Everything else is not built. The plan for the tong's Phase 3, from the owner's "Guild Direction" handover (written
outside the repo against save v29) after checking it against main at save v46. DESIGN.md 2026-11-07
has the decision row. Each part is built in slices, one PR each, with the owner's calls from section 6
first.

## 0. What the handover asked for that already exists

Most of the handover's Phases 1 and 2 shipped under the tong's names, so they are **not** in this
plan:

| Handover | In the game |
| --- | --- |
| Hands-off by default, multi-day jobs, call-ins, Due Sunday, Monday briefing, Sunday summary, crew standards | `core/away.js`, `core/jobs.js`, `core/week.js`, `core/lead.js`, `core/worth.js` (#62-#75) |
| Career record | `core/record.js`, milestones and highlights (renown slices 1-2) |
| Standing: Unknown → Established → Elite → Legend | Fame (Unknown, Known, Respected, Elite, Legend) and standing 0-100 (`core/fame.js`). **Kept as built:** Elite can be lost, Legend can't. |
| Districts as presence, safehouses, guild rank by districts | Halls (`core/halls.js`), opening jobs, the tong's rank following the halls (`core/tong.js`) |
| Per-district heat, telegraphed raids | `core/heat.js`, police raids (`core/raids.js`), gang raids (`core/gangs.js`) |
| Facilities | Hall building (`core/hallbuild.js`) |
| Save size | The inbox is bounded (#106, save v46) |

Still open from the handover and **not** in this plan: cutting morale (still written in
`core/mission.js` and `core/time.js`; agreed 2026-10-26). It's a small clean-up to do before
part D, so loyalty doesn't sit beside a second mood bar.

## 1. Order, and why

1. **A. Heists.** The 2026-11-04 promise ("big heists become the tests of a rank"), a real reason
   for Take Command (the playtest called it "nice to have"), and work for the bench: prep jobs in
   several districts want several crews out at once.
2. **B. The Legend defining job** (renown slice 5). Small, already specified, and a heist finale is
   its natural stage.
3. **C. The other tongs.** Peers who work, recruit, rise and fade, felt through tier words and talk,
   never a table (rewritten 2026-11-08: no league). Needs its own lore first.
4. **D. Loyalty and mobility.** Needs rival tongs to exist (someone has to make the offer), and
   pairs with retirement (renown slice 6): both are a runner leaving.

**Build order (2026-11-08):** A1 playtest → C0 + C1 → B → A2 → C2/C3 → D. C1 is read-only, so it
can't move the heist balance being playtested.

## 2. Part A: heists

A heist is a big score with **prep jobs** that each change the **finale**. It runs over weeks while
ordinary work pays the bills.

### Rules (proposed)

- **Offered** by a contact on a Monday once the tong is big enough (rank and reputation; numbers in
  section 6). Joss's briefing names it. Taking it on costs nothing; it sits on Ops with its date.
- **The finale has a date** (the target's window: "three nights while he's in Singapore"). Prep has
  to be done before it. That's the weekly planning pull: who goes on prep, who keeps the bills paid.
- **Prep jobs** are ordinary offers, flagged "Black Sun · prep 2 of 4", posted like opening jobs
  (`addOffer`, outside the week's count). Each can use an existing template (the handover's
  "built from existing templates with a `feedsInto` link") with a heist line in its brief, so the
  first heist needs little new writing.
- **Each prep step changes the finale in a way you can see on its plan** (the rumour rule: shown
  risk is used risk). Effects, using levers the engine already has:

  | Effect | What it does | Lever it reuses |
  | --- | --- | --- |
  | `threat: -1` | The finale is one step less dangerous | `threatDelta` in `jobView` |
  | `drop: crisisId` | That crisis can't come up | the crisis pool in `startMission` |
  | `know: crisisId` | That crisis is shown on the plan and its rolls get +1 | rumour crises, the "watched" -1 |
  | `pay: +x%` | A fence lined up: the score is worth more | `payMult` |
  | `exit` | A clean way out: the finale's abort/extract costs no heat | crisis choice costs |

- **Failed prep makes the finale harder, not impossible.** A failed or walked-away step can be
  tried once more (a different template, as opening jobs do), **bought** from a fixer for cash, or
  done without. Nothing locks the finale.
- **The finale** is a normal threat-5 job: let them run, watch, or Take Command. Only one job can be
  live at a time (`state.activeMission`), so a finale under command waits for any open call-in. The
  death rule is unchanged: every crisis has its exit, and death only follows "push on".
- **Missing the date** loses the heist (the target's gone). The contact may offer another later.
- **The payoff:** big pay, reputation, a highlight for everyone on the finale, a record counter
  (`heists`), and possibly the rank (section 6).

### State (save bump)

```
state.heists = {
  blackSun: { status: 'offered' | 'open' | 'done' | 'failed' | 'missed',
              finaleDay, prep: { stepId: 'open' | 'done' | 'failed' | 'bought' | 'skipped' } }
}
```

Content in `src/data/heists.js`: `{ id, name, contact, district, finale: templateId, weeks,
prep: [{ id, templates: [...], effect }] }`. `core/validate.js` checks that every prep's effect
names a crisis the finale really has.

### Slices

- **A1. The engine, with a stand-in.** Penthouse Heist (threat 5, 3 days, Glass Heights) as the
  finale and existing templates as prep, to play the rhythm before anything is written. Ops card,
  plan lines for the effects, the Monday line, the Sunday summary line.
- **A2. Black Sun.** The first written heist: target, client, prep stories and finale. "Black Sun"
  is only a working name today; it's new canon, so it goes through `add-lore` and the owner writes
  it (a writing task with its prompt in `drafts/writing-tasks.md`).
- **A3, if play asks:** a second heist per later district; a heist as a district's opening job.

## 3. Part B: the Legend defining job

Build renown slice 5 as written: `drafts/PROPOSAL-runner-renown.md` section 2.7, with review
decision 6 (threat 3-4 templates). One addition: **when a heist is open and a ready runner can go on
its finale, the finale is their defining job** instead of a separate offer. A Legend made on a
heist is the story the game should tell.

Retirement and the Hall of Legends (slice 6) move to part D: both are runners leaving.

## 4. Part C: the other tongs

**Rewritten 2026-11-08 (owner; DESIGN.md 2026-11-08 "No league").** This replaces the 2026-11-07
plan for a league (a Ledger of tongs, a ranked Lantern List of runners, numbered ratings). Not built.

### C.0 The idea

There is no league. Lantern Bay has other tongs: peers, not gangs. They work, recruit, rise and
fade, and people talk about them. The player never sees a table, a position or a rating. They feel
where they stand through:

- **Tier words:** the ladder in `data/tong.js` (Back Room to Harbour), the same one the player's
  rank uses, worked out the same way for rivals (C.2).
- **Talk:** The Word on Mondays, client remarks, recruits naming who else wanted them.
- **Who comes knocking:** better runners, better clients and named offers as standing rises.

The aim is to be the tong the city talks about, never "to finish first".

Agreed and unchanged from 2026-11-07:

- Rival tongs are peers. They compete for contracts and runners and never raid halls. The Red
  Lanterns and the Silver Fan stay the turf powers (`core/gangs.js`, `core/raids.js`).
- A new set of rivals each game, about 6, from `hashRng(seed, 'rivals')`.
- Runners are kept only in as much detail as the player can see (C.3).
- A weekly step on its own random stream that can never move the player's rolls.

### C.1 Rules (lint and test them)

1. **No numbers about rivals on screen.** No positions, ratings, prestige figures or hall counts.
   `core/rivals.js` gives the UI one view, `rivalView(state)`, and `ui/app.js` never reads
   `state.rivals` directly. The test checks that view: no number values anywhere in it, and no
   digits in any string except inside proper names.
   **The one exception (from C3):** the extra cost of signing a name from a tong with a grudge is
   shown in ¥. That's the player's own money on a price, not a rival statistic, so it's allowed;
   it's shown on the player's offer, never as a figure on the rival.
2. **No order beyond tier.** Rivals are grouped by tier and sorted by name inside a tier.
3. **Isolation.** The rival step never moves `rngCounter`: `core/rivals.js` uses `hashRng` only,
   never `nextRng`. Every later roll that involves a rival has its own key:
   `hashRng(seed, 'rival-twist', missionId)` for which tong turns up (C2),
   `hashRng(seed, 'client-rival', offer.id)` for a client naming one (C2),
   `hashRng(seed, 'rivals:' + week)` for the weekly step.
   **"The same game with and without rivals"** (same `rngCounter`, rolls, missions and cash) is a
   **C1-only** test: from C2 the district a job is in changes how often a tong turns up on it, and that is
   meant to change your game. From C2 the test is narrower: the rival step and the C2 rolls never
   move `rngCounter`.
4. **Renown never touches a roll** (existing rule). Rivals' talk about a runner costs nothing on a
   job.
5. **Rivals never raid, and never touch heat, halls or opening favours.** Their hidden hall count
   (C.2) is a number on the rival only: no site, no district, nothing in `state.halls` or
   `HALL_SITES`.
6. **Keys, not sentences (iOS).** `rivalView` returns word keys and values (a tier id, a talk kind,
   a place id, a rating-word key, proper names), never finished sentences. A text table in
   `data/rivals.js` turns keys into lines, so core stays free of wording and a native UI or a
   translation can drop in. Existing text in core (`core/report.js`) stays as it is; don't add more.
7. **Portable maths (iOS).** Rival maths uses `hashRng` as it is: 32-bit integer hashing
   (`Math.imul`, `>>> 0`) over ASCII keys only, so a native port hashes the same bytes. Ratings,
   prestige and wealth are rounded to integers before they're stored or compared. A fixed-seed
   golden test (C.11) is what a native build is checked against.

### C.2 State (save v50 → v51)

`state.rivals` (no "league" anywhere in names, text or files):

```
state.rivals = {
  tongs: [{ id, name, home /*district id*/, style /*loud|quiet|corporate|street*/,
            prestige /*0-100 integer, hidden; same scale as state.reputation*/,
            wealth /*integer, hidden*/, halls /*1-5, hidden*/,
            depth /*ordinary runners, a number*/,
            grudge /*0-10 toward the player*/, headId /*a card*/,
            status /*'active'|'folded'*/, formedDay }],
  cards: [{ id /*'c12', or 'op:r7' if they were the player's once*/, name, tongId /*null = free*/,
            role, rating /*0-100 integer, hidden*/, age, peak, form /*-5..5*/, fame, since /*day*/ }],
  word:  [{ day, kind, refs }],   // talk for The Word: a kind and ids, no text (rule 6)
  seq: 0,
};
```

- **A tier from hidden halls, one rule for one ladder.** Each rival has a hidden hall count that
  grows with prestige and wealth (the next hall opens when both pass that hall's mark; a long run
  of losses closes one). Its tier is worked out from that count by the same rule as the player's.
  Today that rule sits inside `syncHalls` (`core/halls.js`: `TONG_RANKS[clamp(halls, 1, 5) - 1]`,
  one rank per hall) and `rankOf(state)` reads the result from `state.rank`. C1 lifts it into
  `rankForHalls(n)` in `core/tong.js`; `syncHalls` and the rivals both call it, and `rankOf` stays
  as it is for the player. **Checked against the halls code: no clash.** The player's rank already
  is a pure function of a hall count, rival halls are a count only (rule 5), and both are capped at
  five because the ladder has five rungs. The tier is worked out each time, never stored.
- **The week-26 band** (C.11) tunes the hall marks: rivals' tiers should spread around a typical
  player's rank, not run ahead of it or sit under it.
- About 40 cards are kept (about 5 per tong plus free and rising names). Ordinary runners are just
  `depth`.
- **The Brass Anchor Society is not in `state.rivals`.** It's a fixed elder in `data/rivals.js`:
  lore and lines for The Word only, never simulated or tiered. It's the ceiling the Legend job (B)
  points at.
- **`word` is kept bounded** as the inbox is (`trimInbox`, `INBOX_KEEP`, #106): entries older than
  4 weeks go on Sundays, and never more than `RIVALS.wordMax` are kept.
- Loyalty fields (`loyalty`, `contractEnds`, `sworn`) wait for D.
- **Migration:** v50 saves get `seedRivals(state)` in `migrate`.

### C.3 Runners at three levels of detail

| Who | Kept as | Detail |
| --- | --- | --- |
| The player's crew | full operatives | as today |
| Rival names (~40) | cards | name, tong, role, hidden rating, age, form, fame word |
| Ordinary rival runners | `tong.depth` | a number, never shown |

- **C1 needs no full rival runners.** Cards are only talked about.
- **From C3:** `dossierOf(state, card)` builds full stats from `hashRng(seed, card.id)` on demand
  and is never saved; `cardToOperative` runs on signing; `operativeToCard` runs when a runner
  leaves (D). Ratings match within ±2 both ways (test, C3).

### C.4 Files

| File | Job | Slice |
| --- | --- | --- |
| `core/rivals.js` | `seedRivals`, `weeklyRivals` (from `settleWeek` after `weeklyFame`), `rivalView`, `tongsByTier`, `namesOnTheStreet`, `wordFor`; later `contestOffers` | C1 |
| `core/rating.js` | `ratingOf(op)`, `cardRating(card)`, `ratingWords(x)` (a word key), `tierWord(halls)` (a tier id via `rankForHalls`); the only place numbers become words | C1 |
| `core/tong.js` | `rankForHalls(n)`, lifted out of `syncHalls` | C1 |
| `core/dossier.js` | `dossierOf`, `cardToOperative`, `operativeToCard` | C3 |
| `data/rivals.js` | the naming kit by style, the text table for The Word and rating words, the Brass Anchor, tuning (`RIVALS`) | C1 |
| `ui/app.js` | Ops › Tongs (`renderTongs`, `renderTongPage`), The Word in the Monday briefing; reads `rivalView` only | C1 |

### C.5 Hidden rating (0-100 integer, never shown)

```
rating = round(0.55·Skill + 0.30·Renown + 0.15·Record)
```

- **Skill:** main stat plus the best two others (1-20 → 0-100), plus a tier bonus.
- **Renown:** standing, plus fame-tier steps.
- **Record:** jobs, clean jobs, milestones and highlights, capped.

`ratingOf(op)` is in C1 so the player's runners can appear in Names on the street. The rating is
used for the sim, for persuasion (C3/D) and for `ratingWords` keys, which the text table reads as
"the best driver in the Docks", "on the way up", "past their best", "a name to watch".

**Calibration:** seeded card ratings at each tier are set against `ratingOf` on generated recruits
at the matching quality (`generateRecruit` in `core/recruits.js`, `quality`), so a card and a runner
of the same tier read the same and
the player's runners can realistically make Names on the street. Checked in the sim band (C.11).

### C.6 The city ticks over (`weeklyRivals`, Sundays)

Run from `settleWeek` (`core/time.js`) after `weeklyFame`, on `hashRng(seed, 'rivals:' + week)`
throughout, in a fixed array order. In order:

1. **Work:** each tong's prestige moves with its style, depth, its names and some noise. Wealth
   follows. Halls open or close against their marks (C.2).
2. **Growth:** cards move toward `peak` on an age curve, and `form` drifts.
3. **Drift:** runners move between tongs as rumours, not transfers. Young names move more and
   established names rarely. Wealth and tier settle ties. If nobody signs a free name in time, a
   rival does.
4. **Age:** names retire at the season's end (the Sunday before `seasonStartDay`) and young names
   appear.
5. **Tiers:** a rival's tier may change with its halls. Folding and new tongs forming come with C3;
   the fields exist now.
6. **The Word:** add talk to `word` and pick at most three entries for Monday; trim `word` (C.2).

### C.7 What rivals touch

| Thing | Effect |
| --- | --- |
| **Home district** | Their names turn up more on jobs there (C2). Free names tend to come from there. The Word mentions the place. No effect on halls, heat or openings. |
| **Regard (was "grudge"; owner, 2026-11-08)** | **No grudge in C2.** Rival tongs are competitors who notice each other, not enemies, and they hold no memory of the player until there are acts worth remembering. From C3 a hidden regard may move only on explicit acts (signing or poaching a tong's runner, taking work they wanted), either way (respect or resentment), shown only in the Word's tone and in what a signing costs (rule 1's ¥ exception), and a tong may turn hostile after a poach (D). The `grudge` field in the C.2 state shape is unused until then. |
| **Wealth** | Hidden budget: hall growth, who signs the free name the player passes on, how fast depth grows, who folds (C3). |
| **Contracts** | Not in C1. Later, `contestOffers` runs after `tickJobs`: once per job id, via `hashRng(seed, 'contest:' + job.id)`, so the board's rolls never move. |
| **Fame** | No cost on jobs. Its cost is social: pay asks (built), rival interest (D), more talk. |

### C.8 On screen

- **The Word:** at most three lines in the Monday briefing. These are talk, not results ("Third Mist
  took the Basin warehouse work off the Hand", "people have started saying Lantern's name in Glass
  Heights"). Built from `word` keys by the text table.
- **Ops › Tongs:** dossier cards grouped by tier word. Each shows name, home district, style, the
  head's name, a few known names and the latest thing said. Tapping one opens its page. No order, no
  numbers.
- **Names on the street:** 6-10 talked-about runners, unranked, each with a fame word, their tong and
  a rating-word line. The player's own crew can appear among them, which is the payoff.
- The player's own standing shows only as their tier word and as how The Word talks about them.

### C.9 Naming kit (drafted in C0 via `add-lore`; no tong-specific canon)

| Style | Pattern | Example |
| --- | --- | --- |
| Loud | animal or weapon + Hand/Hall | Iron Mantis Hand |
| Quiet | weather or time + Society | Third Mist Society |
| Corporate | initials + Holdings/Partners | K&W Partners |
| Street | place + Lot/Boys/Crew | Basin Lot |

- **Street names only reuse places** from `config/names.js` or `WORLD.md`, or C0 adds the place as
  canon first. (The draft's "Silt Market" isn't a place in canon.)
- **No rival is based in the Silt** (owner, 2026-11-08; `WORLD.md` "The Silt: life at high water"):
  there isn't the money for a big tong there, not yet. `seedRivals` never gives a rival a home in
  the Silt, and no name in the kit uses it.
- **No real triad names and no number names** (no "14", no "Sun Yee", nothing that reads as a real
  society), as `WORLD.md` already requires: everything is invented.

### C.10 Slices

- **C0 lore:** the naming kit, styles, the Brass Anchor's place, The Word's voice (`add-lore`).
- **C1 the other tongs:** save v51, `core/rivals.js`, `core/rating.js` (with `ratingOf`),
  `rankForHalls`, `data/rivals.js`, the weekly step, The Word, Ops › Tongs, Names on the street.
  Read-only: nothing changes play.
- **C2 contact:** `twist_rival_crew` names a real tong and one of its names, chosen with
  `hashRng(seed, 'rival-twist', missionId)` and weighted by home district (three times as often) alone: **built 2026-11-08, names and talk only.** Clients
  sometimes name a rival when they offer work ("the Mantis wanted this, I'd rather you"): flavour
  only, rolled per offer with `hashRng(seed, 'client-rival', offer.id)`, and only rivals whose home
  is the job's district.
- **C3 a free name a month:** `core/dossier.js` (`dossierOf`, `cardToOperative`, `operativeToCard`,
  the ±2 parity test); scout (side task, sharper dossier), approach (message), persuasion from tier,
  the crew's legends and leaders, halls, grudge and money; the first buyouts. **Folding and forming**
  come here too: a folded tong is the natural source of the month's free name.
- **Later:** contested contracts (`contestOffers`), heist races, then D (loyalty, rivals tempting the
  player's runners). An idea with no rule yet: once the development next to the Silt is written
  (canon: unnamed, going up now), it gives the other tongs a reason to move towards the Silt.

**Build order:** A1 playtest → C0 + C1 → B → A2 → C2/C3 → D.

### C.11 Tests

- **Isolation (C1):** the same seed with rivals on and off gives the same `rngCounter`, rolls,
  missions and cash. **From C2:** the rival step and the C2 rolls never move `rngCounter`.
- **Determinism:** the same seed gives the same rivals; (C3) the same card id gives the same dossier.
- **Golden (iOS):** a fixed seed gives a stored snapshot of tongs (names, styles, homes, halls,
  tiers) and card ratings, after seeding and after 4 weekly steps. A native build is checked against
  the same file.
- **No numbers:** `rivalView` has no number values and no digits outside proper names; `ui/app.js`
  doesn't read `state.rivals` (a source lint).
- **Rating parity (C3):** `cardToOperative` / `operativeToCard` within ±2.
- **Migration:** a v50 save gets a valid `state.rivals`.
- **Sim band** (200 seeds × 52 weeks):
  - no rival stays top tier all year, and at least one tier change per season;
  - **week 26:** rivals' tiers spread around a typical player's rank (the `scripts/sim-phase2.mjs`
    player): in most seeds at least one rival above, one level with and one below;
  - **rating calibration:** card ratings per tier sit in the band of `ratingOf` on generated recruits
    at the matching quality, and a typical player's best runner makes Names on the street in most seeds by the
    end of the first year (bands set on the first run and logged in DESIGN.md);
  - nothing outside 0-100; `word` stays bounded; 52 weekly steps in under a second in Node; under
    30KB added to a 52-week save.

### C.12 Still open

- **Heads approachable late-game, after B, with a Legend on the crew.** An idea, not a commitment.
  Heads are never approachable in C or D.
- **Settled (2026-11-08):** folding and forming come with C3; clients naming a rival is C2 flavour
  (C.10); about 6 tongs; no List (Names on the street instead); the Brass Anchor is a fixed elder in
  data; fame has no cost on jobs.

### C.13 C3 in full: a free name a month, scouting, signing, buyouts, folding and forming (owner's answers 2026-11-08; numbers proposed)

**The owner's calls:** a free name is something the player **scouts**, and scouting also **sharpens the accuracy of the
potential read**; a runner may want **a bit more pay to be convinced**, which depends on the tong's **tier, the crew's Legends
and leaders, its halls and its money**; **when a tong folds, its runners become free names over time, and a new tong can form
(some of its runners may form their own)**; and a runner already in a tong needs **a buyout fee**, not just a bigger offer.

**1. The month's free name.** On the first Monday of each 4-week block, one card is put forward from the free pool
(`tongId: null`), a folded tong's best name first. It's in `state.rivals.offer { cardId, day }`, shown in Ops › The other tongs
under "Free names", and in the Word ("X is between tongs, for now"). Left alone for `RIVALS.freeWeeks` (4) it goes to a rival (the
existing drift rule). Only one offer at a time; passing is free.

**2. Scouting (a side task, and the potential read).** "Scout X" is a one-person side task (`core/sidetasks.js`), 2 days, the
runner who goes uses their social stat, no cash cost beyond the usual fatigue. Each trip is a level, kept in
`state.rivals.scouted[cardId]`:

| Level | What the player sees |
| --- | --- |
| 0 (never scouted) | Name, trade, fame word, rating word: what Names on the street shows. The wage ask is a guess (±25%). |
| 1 (one trip) | Full stats (`dossierOf`) and the potential read, with the usual scout error (`rollScoutError`, 45% of the time off by 1-2). |
| 2 (two trips) | The potential read's error is halved (off by at most 1). The wage ask is exact. |
| 3 (three trips) | The potential read is exact. |

A trip can fail (the usual side-task roll at `SIDE_DIFFICULTY`); a failed trip tells them nothing and costs the day. Scouting the
same name a fourth time does nothing. A signed runner keeps the error they were last read with (`scoutError`), so a level-1 read
can mislead, as hired recruits' reads do today.

**3. `core/dossier.js` (no saved stats).** `dossierOf(state, card)` builds full stats from `hashRng(seed, card.id)` on demand and
never saves them: the same card always has the same stats, with the main stat set by the card's role and the rating fitting
`ratingOf` within ±2 (the parity test). `cardToOperative` runs on signing (age, role, the dossier's stats, a potential from the same
hash, tier from the card's rating band, `op.scoutError` from the scout level, a history line); `operativeToCard` runs when a runner
leaves (D).

**4. The approach, and what it costs.** Approaching is a message and a screen, never a roll: the answer is worked out from named
things and shown. **Persuasion** (a hidden score, shown only as words):
- the signing tong's **tier** (`rankForHalls`): up a rung is worth more than a good wage to a runner who wants a name;
- **Legends and Elites on the crew** (each draws), and a **leader** (`lead.js crewLead`: a lead on the crew);
- **halls**: a free bed in a hall in their district;
- **money**: cash to cover the signing fee and any buyout without leaving the week's bills short.

Persuasion sets the **premium** over the market wage (`pricing.js marketWage`): 0% at best, up to **+35%** at worst, shown in ¥ a
week ("They want ¥X a week to join, a bit more than their worth. We could be more convincing."). Below a floor the answer is "not
yet", with the reason in a line (no bed, not enough cash, nothing about our name). The signing fee is one week's wage up front,
as for any recruit (`signingFee`).

**5. The buyout (a runner in a tong).** A name still in a tong can be approached, but the tong is owed a **buyout** (one-off, paid
to the tong's wealth, shown in ¥): `6 × weekly market wage`, plus 10% for every full ¥10,000 of the tong's wealth (cap +50%), plus
**+25% if the tong's regard for us is cold** (below). Heads are never approachable (C.12). Free names owe none.

**6. Regard (replaces the grudge; a hidden `tong.regard`, -5 to +5, 0 at the start).** It moves only on explicit acts:
**-2 when we buy out their runner** (the poach), **+1 when we split a job with them** ('deal' succeeded; at most once a month),
and it eases one step toward 0 every other Sunday. Cold (-2 or less) means a buyout from them costs +25% and the Word's tone is
cooler ("People who used to nod at X don't"); warm (+2 or more) means -10% on a buyout and a warmer line. Nothing else changes,
and **no violence**: a tong turning hostile after repeated poaching is D's, and not built here. The `grudge` field in the state
shape becomes `regard` (a migration renames it, save v53).

**7. Folding and forming.**
- **Folds:** a tong with `halls 1`, `prestige < 12` and `wealth < 1,500` for `RIVALS.foldWeeks` (6) Sundays in a row folds
  (`status 'folded'`, `foldedDay`). It never folds below four tongs.
- **Its names go free over time:** each Sunday one of its runners (the lowest rated first) leaves with `tongId: null`, the Word
  says so; the head last. A folded tong's best card is the first candidate for the month's free name.
- **Forming:** (a) when a tong folds and its best card has `rating >= 40`, they may **form their own** with one or two other free
  names (`hashRng`; 50%): a new tong with a kit name in a new style, their old district, `prestige 8`, `wealth 800 + 60 × 8`,
  `halls 1`; (b) when there are fewer than `RIVALS.tongs` active tongs at a season's end and there's a free card with `rating >= 45`,
  one forms. The Word says "a new name".
- A tong never forms in the Silt.

**8. What the player sees.** Ops › The other tongs gains **Free names** (this month's name and a trip button), a name's page
(its dossier at the level scouted, the potential read, what it would cost), and **Sign**. A scout trip is on the side-work board
("Scout Nia Okoro", `sideBoard` entry added on the offer). Everything speaks in words except money the player pays.

**9. State (save v53).** `state.rivals.offer`, `state.rivals.scouted { cardId: level }`, tongs gain `regard` (renamed from `grudge`),
`foldedDay`; cards gain nothing. Signed cards leave `state.rivals.cards`.

**10. Slices.** **C3a, core and tests:** `core/dossier.js`, regard, folding and forming, the monthly offer, the persuasion and
buyout functions, `cardToOperative`, the scout trip's effect (without the board entry), save v53; tests: parity (±2), determinism,
isolation (no `rngCounter` moves), folding never below four tongs and always forms or frees, regard moves only on acts, persuasion
is a pure function and never prices below the market wage, a buyout never applies to a head or a free name, a scouted level never
shows more than it should, the golden file extended, a v52 save migrates. **C3b, screens and the side task:** Ops › Free names,
the name's page, Scout (side task), Sign, screenshots.

**11. Still open (proposed, the owner may tune):** the 4-week cadence, the three scout levels, the +35% ceiling, the 6-week buyout
multiple, regard's -2 and +1, and the fold thresholds.

## 5. Part D: loyalty and mobility

### Loyalty

- **Resolve `core/loyalty.js`:** today it's a renewal discount from jobs with the crew (1% a job,
  capped at 25%). It becomes `op.loyalty` (0-100, slow-moving over weeks), and the renewal discount
  is read from it, so renewals keep working.
- **Builds:** tenure, being used on serious work, fair pay, hard jobs together, being brought home
  from a critical, being a founder.
  **Erodes:** benched off big work, below-market pay, teammates lost after "push on", a renewal
  turned down.
  **Stars resent being saved:** the counterweight to "the cheapest crew I trust".
- **Not morale in disguise.** It moves weekly and only drives staying, leaving and what they ask
  for. (Cut morale first: section 0.)

### Mobility

- **Rivals approach your runners** only once your tong has minimum standing (section 6); never while
  they're on a job, away or hurt.
- **Joss always warns first,** a week ahead, with the offer. The player chooses: match it, give them
  bigger work, sell them (the rival pays a fee), or let them go. **Proposed: matching the offer always
  keeps them,** so losing a runner you built is a price you chose, never a surprise.
- **Who moves:** rookies often, pros sometimes, veterans and Elites rarely, Legends almost never;
  loyalty overrides tier.
- **Sworn** (working name; the word and the ceremony are invented, never real triad ranks or rites,
  and go through `add-lore`): after high loyalty and long tenure a runner swears in, a milestone that
  can pair with the crew tattoo mark. Sworn runners almost never leave; one who does is a defector,
  and the old tong holds a grudge.
- **Poaching theirs** adds to that tong's grudge.
- **Retirement and the Hall of Legends** (renown slice 6, `drafts/PROPOSAL-runner-renown.md` 2.8 and
  review decision 3) are built in this part: a decision message, never without the player's choice.

## 6. Owner's calls (before each part)

**A, heists**
1. When the first heist is offered: rank (Street? District?) and reputation.
2. Does finishing a heist move the tong's rank? Today the rank is one per hall. Options: a heist
   is needed for City and Harbour; or a heist only adds reputation and the rank stays with the
   halls.
3. Prep count (3-4?), the finale's window (3-4 weeks?), one retry per failed step, the fixer's price.
4. A1 with Penthouse Heist as the stand-in finale: yes or no.

**B, Legends**
5. A heist finale as a ready runner's defining job: yes or no.

**C, the other tongs** (settled 2026-11-08; see C.12)
6. ~~How many tongs; whether they fold and form.~~ About 6; folding and forming with C3.
7. ~~List size.~~ No List: Names on the street, 6-10 unranked.
8. ~~The Brass Anchor Society.~~ A fixed elder in `data/rivals.js`, never simulated or tiered.
9. ~~Fame's cost.~~ None on jobs; its cost is social.

**D, loyalty**
10. Minimum standing before rivals approach (Street rank? District?).
11. Matching an offer always keeps them: yes or no.
12. The in-world word for sworn and unsworn, and how long to swear in.
13. Does releasing or selling a sworn runner hurt the rest of the crew's loyalty?

## 7. Tests and budgets

- **Saves:** every new field is made in `createNewGame` or defaulted in `migrate`; a `SAVE_VERSION`
  bump and a migration test with each slice that changes the shape.
- **Heists:** failed prep never locks the finale; every effect is shown on the finale's plan
  (shown = used); missing the date ends the heist cleanly; the death rule holds on the finale.
- **The other tongs:** see C.11 (isolation, determinism, the golden test, no numbers, rating
  parity, migration, the sim band, size and speed).
- **Loyalty:** nobody leaves without a warning and a choice; no approach mid-job, away or hurt;
  sworn runners leave far more rarely than unsworn ones (a long-run sim, wide bands).
- **Long-run sanity** (wide bands): Elite stays rare, Legends don't come from low-threat repetition,
  and careers end in more ways than death.
- **Economy:** heists change the cash curve. Re-measure with `scripts/sim-phase2.mjs` (a player who
  takes the heist) beside the 2026-11-06 numbers, and log any new band in DESIGN.md.
