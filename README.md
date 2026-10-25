# Syndicate Manager (working title)

A text-first, endless crew management game. You are a fixer in Lantern Bay (placeholder name), building a crew of five into a syndicate. Football Manager meets a heist crew: the story comes from the people you keep alive.

## Run it
```
npm install
npm run dev
```
Open the printed address. To test phone layout, use your browser's device toolbar or open it on your phone on the same network (`npm run dev -- --host`).

## Test
```
npm test
```
Rule tests: nobody dies without "push on", aborts always save everyone, content is valid, saves upgrade, the economy stays in a sane band. They also run on every push; a failing test blocks the deploy.

## Build
```
npm run build
```
Output goes to `dist/`. Pushing to `main` deploys to GitHub Pages automatically (see `.github/workflows/deploy.yml`).

## Status
- [x] Project skeleton, mobile-first shell
- [x] Data shapes, 5 starting operatives, 3 mission templates (2 crises each)
- [x] Day ticking, weekly wages and rent, save/export/import
- [x] Job board (weekly offers) and planning screen with risk read
- [x] Mission flow: tap-through beats, crisis decisions
- [x] Injury ladder, critical state, death, memorial wall
- [x] 6 crises per mission type (18 total)
- [x] Automated rule tests (run before every deploy)
- [x] Crew badges (placeholder portraits)
- [x] Heat cools weekly (2 every Sunday)
- [x] Heat consequences (v1): heat from Loud jobs and crisis mistakes only; a fixer notice at 6+ (pay to cool it, or let it ride)
- [ ] Economy tuning
- [x] Recruiting: weekly scout leads, hire/haggle/pass, generated recruits
- [x] Safehouse expansion (roster cap 8, +2 per upgrade)
- [x] Save slots (3), difficulty picker, weekly auto-backups, backup reminder, Ironman lock
- [x] 7 job types (42 crises), 5 recurring clients with trust, offer variations, hidden twists
- [ ] Running several jobs at once (needed for big crews)
- [ ] Burnout warnings
- [ ] First playtest
- [ ] Crew portraits (after playtest)

## Docs
- `CHANGELOG.md`: what changed in each update
- `DESIGN.md`: narrative, setting, cast, and the decision log (why each choice was made)
- `HANDOFF.md`: where the project stands and what to pick up next
- `WORLD.md`: the world bible (history, factions, districts) and the context block for worldbuilding prompts
- `DATA.md`: data shapes
- `CLAUDE.md`: project rules for working on the code
- `WRITING_GUIDE.md`: how to write new crises and jobs in plain English
