# Handoff: build the Tongs screens, slice E0 (2026-11-13)

Paste the block below into a new session as its first message. It is written to stand alone.

---

You're building **slice E0 of "the other tongs, deeper"** for this game (a text-first crew management
game, plain JavaScript + Vite): the City › Tongs screens redrawn so the rival tongs are worth looking
at. The design is agreed with the owner. E0 is **screens only**: no new rules, no save change, no
change to what the simulation does. One PR on a fresh branch from `main`.

**Read first, in this order:**
1. `CLAUDE.md` (project rules: architecture, tests, design log, changelog, commits, screenshots).
2. `docs/RIVAL-TONGS.md`, all of it, and above all "Rules that must stay true".
3. `drafts/PROPOSAL-tong-depth.md`: **section 6** (the screens) and **6.7** (what E0 ships). Sections
   2 to 5 are later slices (E1 to E4): read them only to know what **not** to build.
4. The mock-up: open `drafts/prototypes/tongs-depth.html`, and look at the stills in
   `docs/screenshots/2026-11-13-design-session-tongs-depth/`. Its generator,
   `drafts/prototypes/tongs-depth.mjs`, holds the CSS; lift it rather than rewriting it.
5. `docs/UI-SKIN.md`, and the newest captured set in `docs/screenshots/` (`21-tongs.png`,
   `22-tong-page.png` are today's screens).
6. The code: `src/ui/tongs.js` (all of it; the `tong-page`, `tong-name` and `city-tab` actions are in `src/ui/actions.js`), `rivalView` and the views in `src/core/rivals.js`,
   `bookView` in `src/core/book.js`, the tong rules in `src/ui/styles.css` (search `.tongcard`), and
   `tests/rivals.test.js` ("rivalView has no number values and no digits outside proper names").

**What to build.** Everything below uses data the game already has.

1. **The seal** (`src/ui/seal.js`, new): a house's mark, used everywhere a tong is named. A small
   cut-corner tile in the style's colour (loud `#ff3d5f`, quiet `#b48cff`, corporate `#3de8d8`,
   street `#f2d541`) with two letters from its name (see `letters()` in the mock-up's generator).
   Ours is solid cyan; a free name's is a dashed green outline with a dot. Sizes: 20, 24, 34, 44, 60.
2. **The ladder** (top of City › Tongs, under the Book card): five rungs, Harbour at the top, Back
   Room at the bottom. On each rung, the seal of every active tong at that tier, sorted by name, and
   ours on our own rung, marked OURS. Tap a seal to open that tong. An empty rung says "nobody,
   yet". Add `ladder` to `rivalView`: `[{ tier, tongs: [{ id, name, style }], ours: bool }]`. Our
   rung is `state.rank`.
3. **Come and gone** (a strip under the ladder): this month's movement, newest first, at most six:
   face, first name, from-seal, arrow, to-seal, one word (Let go, Signed, Moved). Build it in core as
   `view.moves` from The Word's existing entries (`name_travelling`, `went_free`, `rise_end`,
   `founding_end`, `former_signed`, `former_free`). If an entry does not carry where a name came
   from, show only the side it does carry; do **not** add fields to cards (that is E1's `card.path`).
   Hide the strip when it is empty.
4. **House cards** (the list, grouped by tier as today): seal, name, district and head; a chip for
   its style; a row of faces (the head and the names `rivalView` already gives); the latest talk. A
   tong with an open story thread (decline, founding, rise) shows three pips and the story's word,
   with pips lit for the beats told so far. Expose the thread on the view as
   `story: { family, beat }` where `beat` is a word key (`first`, `second`, `third`), never a number.
5. **The house file** (a tong's page): seal, name, tier and style line; **Their story** as a track
   of this tong's talk, newest first (The Word filtered to the tong, plus its last closed thread);
   **The table** as face tiles: portrait, first name, role, and the Anchor's grade letter when they
   are on the slate (`bookGrade`); a tile opens the name's profile as today.
6. **The slate** (the Anchor's Book page): a band per grade with a large letter at the left and the
   names as face tiles in a wrapping row: portrait, first name, the tong's seal in the corner (ours
   outlined in cyan, a free name's green), and the move mark (up, down, new, back). Filter chips:
   All, Ours, Free, then one seal per tong. Ones to watch as rows with Scout, as today; Gone quiet
   as a line, as today.
7. **The Book card** at the top of City › Tongs: the mock-up's version (a large S, the title, one
   line). The line stays what `BOOK_TEXT` gives today.

**Do not build** (later slices; the mock-up shows them only so the layout has room):
habit chips (Grinder, Short table and so on), "Flush / Stretched / Selling", "Cold to us / Warm to
us", "Not watched" and "and others", the read marks in a tile's corner and their legend, "Unsettled",
"Works in", "Between us", "Watch this house", "Flattered / Sold short" and the "we know better than
the Anchor" lines, seals on the city map. Leave them out entirely; no placeholders.

**Rules you must not break:**
- **No digits about rivals on screen**, and no number values in `rivalView` or `bookView`. Pips and
  letters are fine; counts are not. Extend the existing view test to cover every field you add.
- **No order beyond tier or grade.** Inside a rung, a tier group or a grade, sort by name.
- `src/ui/` reads only `rivalView` and `bookView` for rivals. New view fields are built in
  `src/core/`; wording stays in `src/data/rivals.js`.
- Nothing you add may call `nextRng` or change `state`. E0 is read-only: `tests/golden/rivals-1234.json`
  must not change, and `SAVE_VERSION` stays where it is.
- iOS rules from `CLAUDE.md`: nothing on hover, every seal, face, chip and tile is a 44px target or
  sits inside one, design at 360 to 430px first, sharp panels with cut corners, no rounded cards.
- Recruiting stays on Crew › Leads (`docs/SCREENS.md`): City › Tongs only reads. Scout on Ones to
  watch keeps its existing `lead-name` action.

**Tests to add:** the ladder holds every active tong exactly once, on the rung `tongTier` gives, and
ours on `state.rank`; no folded tong appears; the view walk finds no digits in `ladder`, `moves` or
`story`; `moves` never names a folded tong's seal as a destination; a save with no rivals renders
the page without error.

**Before you push:** `npm test`; `npm run screenshots -- tongs-screens` (check that
`scripts/screenshots.mjs` still finds the Tongs tab and a tong's page, and add a shot of the slate
if it is not taken; the standard run is at week 1, where no slate is chalked yet, so say so in the
row) and a row at the top of `docs/screenshots/README.md`; an entry at the top of the newest file in `docs/changelog/`; a decision-log
row at the top of `docs/design/2026-11.md`; update "The other tongs" in `docs/UI-SKIN.md`, the Tongs lines in
`docs/SCREENS.md` and `CODEMAP.md` (the new `ui/seal.js`), and move E0 to "What is built" in
`docs/RIVAL-TONGS.md`. Commits follow `CLAUDE.md`: the owner's name and noreply address, no
co-author or session lines.

**If something is unclear,** the proposal wins over the mock-up, and `docs/RIVAL-TONGS.md` wins over
both. Ask the owner before adding anything that shows where a tong stands more finely than its tier.
