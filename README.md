# Syndicate Manager (working title)

A text-first, endless crew management game. You are a fixer in Lantern Bay (placeholder name), starting with three founders you pick from six and building them into a syndicate. Football Manager meets a heist crew: the story comes from the people you keep alive.

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
Playable and endless. What's in the game is listed, newest first, in `CHANGELOG.md`; what's next is in `HANDOFF.md`. In short:
- The squad run: pick an approach, an inside team, overwatch, wheels and standby; watch the job on the district's map; the crew calls you in for decisions.
- Command fights in every district, with gear, cover and orders each round.
- Recruiting, contract renewals, earned traits, specialisations, growth from rookie to veteran.
- Renown: each runner's record, milestones, fame and paths; named offers and fame pay asks.
- The tong: crews sent out play day by day and call you in; jobs of 1-4 days; the week as the rhythm (Monday briefing, Sunday summary); crew leads; halls in more than one district.
- The City as the command centre: the map with crews out, halls and heat per district; rumours, clients with trust, side work.
- Saves: 3 slots, export/import, weekly backups, Ironman, offline play.
- Not yet: raids on a hall (next), Legends and retirement (renown slices 5-6), crew relationships.

## Docs
- `CLAUDE.md`: project rules for working on the code, and where to read for each kind of task
- `HANDOFF.md`: where the project stands and what's next
- `CHANGELOG.md`: what changed in each update
- `DESIGN.md`: narrative, tone, cast, and the decision log (rows in `docs/design/`)
- `CODEMAP.md` and `docs/ARCHITECTURE.md`: where code lives, how a run flows, state and saves
- `WORLD.md`: the world bible and the context block for worldbuilding prompts
- `ART.md`: the visual style and art rules; `docs/screenshots/`: how the game looked over time
- `DATA.md`: data shapes
- `WRITING_GUIDE.md`: how to write new crises and jobs; `docs/new-job-prompt.md`: a prompt for drafting jobs outside a session
- `PLAN-*.md`: step-by-step plans (core loop, progression, renewals, personality; `PLAN-IOS.md` scopes the iOS app, not started)
