# Prompt: review the game-design research and turn it into a plan

Paste everything below the line into a new session on this repository.

---

You are picking up the game-design research done on 2026-11-26 for Syndicate Manager (a text-first, endless crew-management game; plain JS + Vite; read `CLAUDE.md` first and follow it). Your job is to **review that research with fresh eyes and turn it into a short, ranked plan the owner can choose from**. Do not build anything and do not change game code. This is a planning and review task.

## The owner's direction (the lens for everything)

Logged in `docs/design/2026-11.md` on 2026-11-26: the most important feeling in the game is **roster members getting stronger and being customised, and being able to send them off meaningfully, so they grow and also get something done**. The touchstone is Assassin's Creed Brotherhood's recruits (picked up from the street, sent on contracts, grown), "even though it was actually a very shallow mechanic in that game." Depth should come from who a person becomes, not from more menus.

## Read, in this order

1. `docs/research/README.md`, then every note it lists from 2026-11-26:
   - `management-games-comparators.md` (Reddit thread, King of Dragon Pass, Majesty, Fallout Shelter, Guild Management Simulator)
   - `football-manager-and-battle-brothers.md`
   - `darkest-dungeon-and-wildermyth.md`
   - `ac-brotherhood-recruits.md`
   - `abilities-and-builds.md` (older, 2026-11-18; read for overlap)
2. The top rows of `docs/design/2026-11.md` (the 2026-11-26 rows: the owner's direction, crews out as rows that open, the save repair).
3. `HANDOFF.md` "Next", especially item 2g (crews out: what is built and what is agreed but not built).
4. The mockups from that session, in `docs/mockups/` (all dated 2026-11-26): `trip-growth`, `days-out-log`, `days-out-log-2`, `crews-out-stack`, `crews-out-compact`, `crews-out-faces-row`, `crews-out-on-page`, `crews-out-condensed`. They are HTML; open them with Playwright if you need to see them (`require('playwright')` works; screenshot at 390px wide).

Read the code only to check a claim (use `CODEMAP.md` to find the file first). Grep before opening whole files.

## What to do

1. **Check the research for mistakes.** Earlier in that session some claims were wrong and had to be corrected (Majesty is an RTS; King of Dragon Pass has a clan ring of nobles but no roster; the save code already had backups). Look for more: a claim about another game that is wrong or overstated, a "we already have this" that the code doesn't support, a point marked "general knowledge" that matters enough to verify with a web search. List each with the evidence and the fix.
2. **Find what the notes agree on.** Several games point at the same lessons (show risk and growth plainly; repetition kills long runs; never hide crises; losses should hurt but not be a grind). Pull these into one list, with which games back each.
3. **Find gaps and conflicts.** Where do two lessons pull against each other (for example Darkest Dungeon's strain versus our death rule; Football Manager's hidden ability versus "show growth plainly")? Where is an important comparator missing (the session suggested XCOM 2, Sunless Sea, Crusader Kings 3, Frostpunk; there may be better ones for "send them off and they grow")?
4. **Rank the candidate changes** against the owner's direction. Every "How this applies" point across the notes, plus the agreed-but-unbuilt items in `HANDOFF.md` 2g, goes into one table: the change, which research backs it, how much it serves the core feeling (high, medium, low), rough size (small, medium, large), and what it touches (files, save shape, tests). Put the known gap first: expeditions and security posts grow runners (`core/expeditions.js` and `core/contracts.js` call `gainXp`) but throw away the result, so the player is never told.
5. **Recommend the next three builds**, in order, with one paragraph each on why. Respect the rules in `CLAUDE.md`: core stays pure, randomness through `core/rng.js`, the death rule (no death on cautious or steady without a shown, accepted risk), phone first, 44px taps, no hover-only information.

## Output

- Write one file, `drafts/REVIEW-research-2026-11-26.md`, with five sections matching the steps above, then the ranked table and the three recommendations. Plain, short sentences.
- Correct the research notes themselves only where something is factually wrong, and say what you changed in the review file. Add nothing to the decision log: the owner hasn't decided anything new. If you do change a note, add a changelog line (top of the newest file in `docs/changelog/`).
- Ask the owner nothing until the review file is written; then end with a short summary in chat: the mistakes you found, the top three builds, and the questions only the owner can answer.
- Commit as the owner (`CLAUDE.md` "Commits": author and committer `marcusw <160358373+MarcusW9@users.noreply.github.com>`, no co-author or session lines) to your working branch and push. Docs only, but run `npm test` before pushing anyway, as `CLAUDE.md` asks.
