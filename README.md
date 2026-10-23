# Syndicate Manager (working title)

A text-first, endless crew management game. You are a fixer in Lantern Bay (placeholder name), building a crew of five into a syndicate. Football Manager meets a heist crew: the story comes from the people you keep alive.

## Run it
```
npm install
npm run dev
```
Open the printed address. To test phone layout, use your browser's device toolbar or open it on your phone on the same network (`npm run dev -- --host`).

## Build
```
npm run build
```
Output goes to `dist/`. Pushing to `main` deploys to GitHub Pages automatically (see `.github/workflows/deploy.yml`).

## Status
- [x] Project skeleton, mobile-first shell
- [x] Data shapes, 5 starting operatives, 3 mission templates (2 crises each)
- [x] Day ticking, weekly wages and rent, save/export/import
- [ ] Job board and accepting jobs
- [ ] Mission flow: plan, beats, crisis decisions
- [ ] Injury, critical state, death, memorial
- [ ] Burnout warnings

See `DESIGN.md` for the narrative and decision log, `CLAUDE.md` for project rules, and `DATA.md` for the data shapes.
