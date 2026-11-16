# Brief: a failed save is never silent (2026-11-16)

The first step in the order agreed on 2026-11-16 (save fix, then builds, then the playtest). Source: finding 1 of
`drafts/REVIEW-2026-11-13.md`, with finding 12 (the same unchecked calls) and the cheap half of finding 7. Small, one PR.

## The problem

- `save/save.js saveGame` returns whether the write worked, and nothing reads it. Its callers: `ui/app.js setState`,
  `main.js` (the first save), and five in `ui/actions.js` (three of them set `msg.read = true` on the live state and save
  directly, skipping `setState`: finding 12). `storageSet` swallows the error and returns `false`.
- The backup write inside `saveGame` is unchecked too.
- Measured in the review: after 52 weeks a slot holds about 544,000 characters (the save, about 270,000, plus its weekly
  backup), about 1.1 MB as browsers count it. Three slots are about 3.3 MB, and a kept-aside unreadable save stores its
  save and backup again. WebKit allows about 5 MB an origin. Past it every save fails, play goes on, and nothing says so:
  the player loses everything since the last good save without knowing.

## What to build

1. **Every save is checked.** The three in-place `msg.read = true` saves in `ui/actions.js` go through `setState` with a
   new state from core (finding 12; the "core returns new state" rule). Every remaining caller reads the result.
2. **A failed save shows.** When the save or its backup fails, a banner at the top of every screen says the game could not
   be saved and what to do (free a slot, export the save). It stays until a save succeeds. It is not a hover and not a
   `confirm()` (CLAUDE.md iOS rules; review finding 3). Wording: draft text, the owner writes it
   (`drafts/writing-tasks.md`).
3. **The backup check stops parsing the backup** (finding 7, the cheap half): remember the backup's day and seed in memory
   when it is written or loaded, so a save no longer reads and parses about 270,000 characters to compare two numbers.
4. **A test**: a storage stub whose `setItem` throws; the banner state appears, the game goes on, and it clears on the next
   good save. `save.js` stays the only code that touches storage.

## Open for the owner (before building)

- **Backups per slot.** Keep a weekly backup in every slot (today; about half of each slot's size), keep one only for the
  active slot, or keep them only when space allows. Suggested: keep today's behaviour and see whether the banner ever
  fires; the inbox (finding 8) is the bigger lever if space gets tight.
- **The banner's wording** (draft until written).

## Not in this slice

The asynchronous storage the iOS wrapper needs (finding 2), the `confirm()` dialogs (3) and exporting in a WebView (4):
they belong to the iOS work, which stays parked.
