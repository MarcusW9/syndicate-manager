# Note: what a tap costs (review item 7), measured 2026-11-18

Measured for the speed pass (`drafts/HANDOFF-speed-pass.md`, step 5). The brief: measure `render()` at the review's 4x phone slowdown before deciding whether to patch the page instead of replacing it, and do not start a rewrite. Nothing was changed.

## How

Playwright's Chromium at 390 x 844, Chrome's CPU throttling at 4x (`Emulation.setCPUThrottlingRate`), the Vite dev build. A 30-week save from `tests/play.js playWeeks(30, seed)` was put in slot 1 (states of about 225,000 to 245,000 characters). A tap is timed from the click to the second animation frame after it, so it covers the handler, `render()` (the whole page's `innerHTML` rebuilt) and the browser's layout and paint. Three passes over the five tabs; the first pass is slower (code and styles warming up).

## Numbers (ms, at 4x)

| Tap | Pass 1 | Passes 2-3 |
| --- | --- | --- |
| Today (inbox) | 100-125 | 90-130 |
| City | 77-116 | 41-89 |
| Tong | 50-59 | 27-36 |
| Crew | 43-53 | 35-60 |
| Jobs (the board's reads are in the worker) | 40-80 | 29-49 |

- The page is 73,000 to 97,000 characters of HTML after a tab tap.
- A save (`saveGame`: the state to JSON and into storage) costs 6 to 12 ms at 4x for a 225,000-character state. The weekly backup's day and seed already come from a small meta key (`save.js backupInfo`), so the "parses the whole backup" half of item 7 is done on `main`.
- Continue could not be timed: every 30-week `playWeeks` state ends waiting on a decision. Its cost is the day's logic plus one save plus one render, so at least the render numbers above plus 6-12 ms.

## Read

- Only Today goes past 100 ms (the threshold where a tap stops feeling instant); the rest sit at 30-60 ms once warm. Replacing the page on every tap is not the main cost on most tabs.
- **Suggested next step (not done): profile the Today tab's render** at 4x before any patch-instead-of-replace work. A tab that costs three times the others points at one slow piece of that screen, not at `render()`'s design.
- A patching renderer is a large change for 30-60 ms on most tabs; not worth starting until Today is understood.

The script used is in the speed-pass session's scratchpad, not in the repo; the method above is enough to repeat it.
