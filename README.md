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
- [x] Heat cools weekly (faster after a quiet week)
- [ ] Heat consequences; economy tuning
- [ ] Recruiting new operatives
- [ ] Burnout warnings
- [ ] First playtest
- [ ] Crew portraits (after playtest)

## Docs
- `CHANGELOG.md`: what changed in each update
- `DESIGN.md`: narrative, setting, cast, and the decision log (why each choice was made)
- `DATA.md`: data shapes
- `CLAUDE.md`: project rules for working on the code
