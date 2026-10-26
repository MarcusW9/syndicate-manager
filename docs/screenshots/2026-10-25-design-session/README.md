# Design session, 25 October

Screenshots from the session that reworked the UX, added Joss, the street-terminal skin and the portraits, in the order they were taken. They include "before" shots and a style test that never shipped. Kept as captured: 1x, at 390×844 (phone) or 1400×800–860 (desktop). The scripted sets for the same versions are in the folders listed in the main README.

| File | What it shows | Shipped in |
| --- | --- | --- |
| (owner's) | The owner's screenshot that started the review, a mostly empty desktop inbox, is in [2026-10-25-owner-captures](../2026-10-25-owner-captures/) | before `d3e6975` |
| **Clearer days and a better inbox** | | `d3e6975` |
| `01-days-desktop-inbox-side-by-side` | Message open beside the list; short date, week bar, "Continue → Tue" with what's waiting | |
| `02-days-new-day-cue-desktop` | A new day: the date flashes, a note says what came in, Continue rests | |
| `03-days-phone-inbox` | Phone: unread dots, tag colours, count pills | |
| `04-days-phone-new-day-cue` | Phone: the new-day note | |
| `05-days-sunday-bills-cue` | Sunday: bills paid, cash ▼ in the top bar | |
| **Before the crew-picks pass** | | |
| `06`–`09` | Job board, planning (risk read at the bottom, "med 2 · coo 5"), crew list, operative page as they were | |
| **Easier crew picks** | | `3b43779` |
| `10-crew-picks-risk-bar-phone` | The risk bar and Start stay on screen while you pick | |
| `11-crew-picks-coloured-stats-desktop` | Stats written out and coloured good / shaky / weak against the job | |
| `12-crew-picks-status-chips-phone` | Status chips and fatigue/morale bars on the crew list | |
| `13-keyboard-focus-ring-desktop` | The teal keyboard focus ring, kept across re-renders | `c61ab66` |
| **Today, first version** | | `b806940` |
| `14-today-v1-tiles-phone` | Four summary tiles above the inbox (later dropped) | |
| `15-today-v1-message-desktop` | Tiles and inbox beside the open message | |
| `16-today-v1-job-cards-phone` | Three-line job cards, "6 days left", clients folded up | |
| `17-today-v1-operative-two-columns-desktop` | Operative page in two columns | |
| **Today, take two** | | `2dc7290` (#2) |
| `18-today-v2-alerts-coming-up-phone` | Inbox first, alert lines only when needed, Coming up for the week | |
| `19-today-v2-coming-up-pane-desktop` | Coming up fills the right pane when no message is open | |
| **Joss and the street-terminal skin** | | `386c9b3` (#3) |
| `20-joss-briefing-phone` | Joss's first briefing and voiced alerts | |
| `21-joss-briefing-desktop` | The same on desktop | |
| `22-style-test-first-portraits-and-joss-options` | Not shipped: the first portrait styles (flat, line, noir) and three Joss designs; the owner found the faces too cartoony | |
| `23-joss-handset-icon-phone` | Joss as a cracked handset with a mood face | |
| `24-skin-planning-phone` | The skin: cut corners, Rajdhani, segmented gauges | |
| `25-skin-crew-phone` | Crew list in the skin, Continue docked above the tabs | |
| `26-skin-today-desktop` | Today on desktop in the skin | |
| **Portraits** | | `16e78f3` (#4) |
| `27-portraits-close-ups` | Close-ups at 300px, the last one tired | |
| `28-portraits-sheet-and-conditions` | The Citizen Sleeper direction on generated crew; injured, tired, neural load, fallen | |
| `29-portraits-variety-sheet` | Split-dye, slick-back, fiber dreads, cyber-eyes, circuits, seams, tattoos, barcodes, visors; expressions following condition; a random crowd | |
| `30-portraits-crew-list-phone` | Faces on the crew list | |
| `31-portraits-profile-desktop` | A profile with the large portrait | |

How these were made: `ART.md` has the exact style values and prompts. The decisions behind each step are in `DESIGN.md` (rows dated 2026-10-25).
