# Handoff: build slice E2, overreach (2026-11-14)

Paste the block below into a new session as its first message. It is written to stand alone.

---

You're building **slice E2 of "the other tongs, deeper"** for this game (a text-first crew management
game, plain JavaScript + Vite): **overreach**. Houses get a wage bill and an appetite, a big house can
buy more than it can keep, and when it cracks its good names come loose at once. The design is agreed
with the owner (`drafts/PROPOSAL-tong-depth.md`, section 3). E2 is **a rules slice with a save bump**:
no change to the player's money, heat, halls or rolls. One PR on a fresh branch from `main`, named
`claude/tongs-overreach-e2`. Do not open the PR: the owner asks for each one.

**Read first, in this order:**
1. `CLAUDE.md` (project rules: architecture, tests, design log, changelog, commits, screenshots).
2. `docs/RIVAL-TONGS.md`, all of it: "Rules that must stay true" and the new "Habits (E1)" paragraph.
3. `drafts/PROPOSAL-tong-depth.md`: **section 3** (E2), **section 7** (state and saves, the E2 row),
   **section 8** (tests, the E2 line) and section 6 (screens, only so you know where the new words
   will show). Sections 4 and 5 are E3 and E4: read them only to know what **not** to build.
4. What E1 built, which E2 sits on: `src/core/houses.js` (`releaseFor`, `placeFor`, `wants`,
   `topTierFor`), `src/core/rivals.js` (`weeklyRivals`, `freeNamesStep`, `release`, `moveCard`, the
   thread functions `startThread` / `beat` / `threadsStep`, `wordFor`, `movesView`, `rivalView`),
   `src/data/rivals.js` (`RIVALS`, `HABIT`, `HABITS`, `WORD_TEXT`), `buyoutAmount` in
   `src/core/dossier.js`, and `scripts/sim-tongs.mjs` (the gate script you will extend).
5. The newest `migrate` blocks in `src/save/save.js` (v65 is E1's), `SAVE_VERSION` in
   `src/core/state.js`, and `docs/ARCHITECTURE.md` section 8 (how to add a version).
6. The tests that encode the rules: `tests/rivals*.test.js`, `tests/rivals-e1.test.js`,
   `tests/golden/rivals-1234.json`.

**What to build** (all numbers are the proposal's first values; they go in `src/data/rivals.js`):

1. **Wages.** Each Sunday a house pays `RIVALS.wage.per` (4) x rating for each of its names, on top of
   hall upkeep. To keep today's balance, each style's `wealth` per prestige point rises by the average
   bill (+18). The sim gate decides whether that held; retune if not.
2. **Appetite.** A house with more than 1.5x its next hall's wealth mark, and room, goes shopping at
   most once every 8 weeks: it signs the best free name it wants (`wants`), or buys a name it wants
   from a house a tier below (the `buyoutAmount` rule, paid house to house). `boutique` and `loud`
   houses shop at 1.2x. A house never buys from us this way: that is D3 and stays as it is.
3. **Strain.** A Sunday is strained when the last four weeks' bills exceed the last four weeks' income
   **and** wealth is under 8 weeks of bills. `tong.strain` counts strained Sundays in a row; a calm
   Sunday takes 1 off. State: `tong.strain`, `tong.bills` and `tong.income` (four-week rings),
   `tong.shoppedDay`.
4. **The story**, a new thread family `overreach` built on the C4 machinery (one open per tong):
   Stretched (strain 3, talk only; the client remark already has a "stretched" mood), Selling (strain
   6: every two weeks the house releases its dearest name that is not its head; a buyout from it is
   x0.75; only one house in the city may be selling at a time, a second waits at stretched), Broken
   (wealth at 0 on two Sundays while selling: it closes a hall and releases down to three names, lowest
   rated first; a one-hall house goes through today's fold rule instead), Steadied (four calm Sundays:
   the thread closes). Release through `release()` so the trail (`card.path`) and the E1 landing rule
   keep working.
5. **The sale, for us.** Names a selling or broken house lets go are all open to us at once for three
   weeks, beside the ordinary free name: `rivals.sale = { tongId, cardIds, untilDay }`, then the fit
   rule places them. This is the one place more than one free name is on offer. `rivalView.offer`
   stays one name; add the sale as a new view field (keys and names only) and show it in Free names on
   City › Tongs and in Crew › Leads' Names, each opening in Leads as the free name does.
6. **Limits.** Never below `minTongs`. A house in its first 12 weeks cannot strain. Nothing reads or
   moves the player's money, heat, halls or rolls.
7. **Talk** (wording in `src/data/rivals.js`, first pass, no digits): `overreach_begin`,
   `overreach_selling`, `overreach_broken`, `overreach_steadied`, `bought`. Add the new kinds to the
   right Monday lists (`THREAD_CONTINUES`) so a continued story beats a new one.
8. **Screens, minimum:** the house card's story pips and word already read `story.family`; add the
   `overreach` word to `SCREEN_TEXT.story` ("Stretched" and "Selling" by beat). No state chip
   ("Flush / Stretched / Selling") yet: that is a finer read than the tier and belongs to E3, where
   watching a house earns it. Ask the owner before showing where a tong stands more finely than its
   tier.

**Do not build:** stale reads, watching a house, the quiet name (E3); contested offers, "where a house
works", regard with teeth (E4); the state and mood chips on cards; a habit change.

**Rules you must not break:**
- **No digits about rivals on screen** and no number values in `rivalView` or `bookView`. The view test
  walks the whole view: every new field must pass it (strain, bills and income stay in state, never in
  the view).
- **No order beyond tier or grade.** Sorting is by name inside a rung or a grade.
- **Isolation.** Every new roll has its own `hashRng` key (the proposal suggests `'reach:'` and
  `'rivals-e:' + week`) and never moves `rngCounter`. With the player doing nothing, cash, heat and
  halls must match a run without E2 (a test).
- **`src/ui/` reads only `rivalView` and `bookView`.** Wording stays in `src/data/rivals.js`.
- **Save.** Bump `SAVE_VERSION` (65 today) once, add a migration (zeros and nulls; `rivals.sale: null`),
  and add the version line to `docs/ARCHITECTURE.md` section 8. Regenerate
  `tests/golden/rivals-1234.json` **once**, on purpose, add an `e2` section, and log it.
- **Never loosen a test to make a change pass.** If a rule changes on purpose, change the test and say
  so in the decision-log row (E1 did this for three assertions; read that row for the wording).
- iOS rules from `CLAUDE.md`: portable maths (integers, `hashRng` over ASCII keys), nothing on hover,
  44px targets, phone width first.

**Tests to add** (`tests/rivals-e2.test.js`): only one house selling at a time; never below
`minTongs`; a house under 12 weeks old never strains; the sale closes after three weeks; with the
player doing nothing, cash, heat and halls match a run without E2; strain moves by one a Sunday and
falls on a calm one; a head is never sold; a broken house keeps at least three names; `moves` never
ends at a folded tong; the view has no digits in the sale or the story; an old save upgrades.

**Gates** (extend `scripts/sim-tongs.mjs`, 50 seeds, 6 seasons): a selling story starts 1 to 3 times a
season across the city (median); fewer than 1 in 4 end broken; a Harbour or City house breaks at least
once in 6 seasons in 30% or more of seeds; the count of active tongs stays 4 to 7. E1's gates must still
hold (roster ranges 90%, releases landing lower 60%, free name every 3 to 6 weeks, card total 34 to 46).
`scripts/sim-phase2.mjs` (week-26 tier spread) is slow here (it timed out in E1's session): run it in the
background, or say you could not.

**Before you push:** `npm run test:fast` while working and the full `npm test` before the final push
(`tests/nav.test.js` "five tabs" fails on `main` itself as of 2026-11-14; if it still does, say so, do not
touch it). A decision-log row at the top of `docs/design/2026-11.md`; an entry at the top of
`docs/changelog/2026-11.md`; update "Habits (E1)"'s neighbour, a new "Overreach (E2)" paragraph and the
E2 row in `docs/RIVAL-TONGS.md`; `CODEMAP.md` (houses.js grows, the weekly step); the v66 line in
`docs/ARCHITECTURE.md`. If the look changes (the sale in Free names, a new story word), run
`npm run screenshots -- tongs-overreach` and, because the standard run stops at week 1, add a populated
set the way E1's `2026-11-14-tongs-habits` was made (build a state in node, load it into
`localStorage` slot 1, shoot City › Tongs); add a row to the top of `docs/screenshots/README.md`.
Commits follow `CLAUDE.md`: author and committer `marcusw <160358373+MarcusW9@users.noreply.github.com>`,
no co-author, session or "Generated with" lines. If a stop hook asks you to re-author commits, the owner's
rule wins. Push the branch; report what you built, the test results, the gates, and anything in the brief
you could not follow.

**If something is unclear,** the proposal wins over this note, and `docs/RIVAL-TONGS.md` wins over both.
Ask the owner before adding anything that shows where a tong stands more finely than its tier.
