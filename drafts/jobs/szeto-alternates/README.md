# Seventy-One Floors: alternate prep jobs (drafts, 2026-11-25)

A second set of six prep jobs for Mr. Szeto's heist, written from the owner's pitches while the live six (`expected_upstairs`,
`the_replacement_visit`, `someone_at_the_controls`, `cover_the_late_shift`, `the_current_copy`, `what_was_installed`) landed on main.
**Not registered in `src/data/missions.js` and not wired in `data/heists.js`**; the live set is untouched.

| Step | First ask | Retry |
| --- | --- | --- |
| `face` | `loadingslot.js` (Poon, Glass Heights) | `relaycourier.js` (Binta, Glass Heights) |
| `power` | `halfarepair.js` (Poon, Glass Heights) | `thetestrota.js` (Ho, Old Town) |
| `plans` | `beforetheinventory.js` (Edith, Glass Heights) | `thewronghands.js` (Kwok, Night Market) |

Each has six crises with an exit on every one, threat 3, three crew, one day, `heistOnly: 'szetoTower'`, ¥5,200-6,500 (above the
checker's threat 3 pay band on purpose). Checked with `node scripts/check-job.mjs <file>`: 0 errors (pay warning only). Moved here
from the closed work in PR 253; the 827-test run was against the earlier wiring, so re-run the checker and `npm test` after registering any.

To use one in place of a live job: move it to `src/data/missions/`, import and list it in `missions.js`, and put its id in the step's
`templates` in `data/heists.js`. Each step takes exactly two, and a `heistOnly` job that no heist lists fails `tests/jobs.test.js`.
