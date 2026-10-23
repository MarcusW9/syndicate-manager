# Changelog

What changed in each update, newest first. For *why* a decision was made, see the decision log in `DESIGN.md`.

Live build: https://marcusw9.github.io/syndicate-manager/

## 2026-10-23 · Tests and crew badges
- **Automated rule tests** (`npm test`, 9 tests). They run on every push, and GitHub won't deploy if one fails. They check:
  - nobody dies unless the player chose "push on" (3,000 simulated missions)
  - aborting always brings everyone home, and Story mode never kills anyone
  - all content is valid, with no unfilled `{placeholders}`
  - old saves upgrade, and bad or newer save files are refused
  - money stays within a sane band over a month of careful play
- **Crew badges:** coloured initials for each operative on the crew list, operative page, planning screen and mission header. Fallen operatives appear greyed out on the wall. These are placeholders until portraits exist.
- **Balance finding, not yet fixed:** heat only goes up, and careful play slowly loses money. See Open questions in `DESIGN.md`.

## 2026-10-23 · 12 new crises
- 6 crises per mission type (18 total). Run variety goes from 1 combination per job to 15 or more.
- New choice types: certain (no roll), failure costs (heat or pay instead of injury), bonus pay, trait-gated options.
- "Someone" is capitalised correctly when no operative fits a role.

## 2026-10-23 · Job board and missions
- Weekly job board: three opening jobs, new offers every Monday.
- Planning screen: pick crew and approach, with a risk read (label plus reasons).
- Missions: tap-through beats, crisis decisions with risk labels, critical state (stabilise / extract / push on), permadeath, wall of the fallen.
- Save format v2, with automatic upgrade from v1.

## 2026-10-23 · Project start
- Vite + plain JS skeleton, iOS-ready structure (logic, UI and saves kept separate).
- Five starting operatives, traits, three mission templates.
- Day ticking, weekly wages and rent, save / export / import.
- Hosted on GitHub Pages with auto-deploy.
