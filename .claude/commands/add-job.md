---
description: Add a job (mission) drafted with docs/new-job-prompt.md. Paste the job file after the command.
---

Add the job pasted below to the game. It was drafted outside the session with `docs/new-job-prompt.md`, so it should already be in the game's format. This is mechanical work: follow these steps exactly, and don't read whole large files (`src/data/missions.js` is 400 lines; use the line numbers grep gives you).

## Steps

1. **Read the paste first.** It must be one data object: `export const NAME = { ... };`, with comments allowed. If it has any `import`, function call, `require`, backtick template or anything that isn't plain data, stop and tell the owner instead of running it.
2. **Save it** as `src/data/missions/<shortname>.js` (lowercase, no underscores, like `wronghorse.js`). Keep the header comment if there is one; if not, add one line: what the job is, for whom, where.
3. **Check it:** `node scripts/check-job.mjs src/data/missions/<shortname>.js`.
   - **Errors (✗):** fix them in the file. Most are one line: an unknown token (`{fung}` → write "Auntie Fung"; a role token without `requires` → `{op}`), a missing `report.failure`, the way out not last, a retired name. Keep the writer's wording wherever you can.
   - **Warnings (!):** fix the easy ones (a role token without `requires` → `{op}`; difficulty a point or two outside the band). Leave taste calls (a long line, pay a little off) and list them for the owner.
   - Run the check again until it shows no errors.
4. **Register it** in `src/data/missions.js`: one `import { NAME } from './missions/<shortname>.js';` after the last mission import (`grep -n "^import" src/data/missions.js`), and `NAME` at the end of the list in `export const MISSIONS = [...]` (`grep -n "export const MISSIONS" src/data/missions.js`).
5. **Give it a client** in `src/data/clients.js`: add the job's `id` to the `jobs` list of the client the pitch named (`fung`, `szeto`, `ferryman`, `rao`, `okonkwo`, `ip`, `tse`, `lau`, `kwan`). Skip this if the job has `walkIn: true`. Doc Siu's and Mrs. Ip's jobs are rookie work: give them to `fung`, or make them `walkIn: true`.
5a. **A multi-map job** (it has a `maps` block; the format is "MULTI-MAP JOBS" in `docs/new-job-prompt.md`, the engine `core/multimap.js`, the example `src/data/missions/kidnap.js`). Nothing extra to wire: the checker runs `validateMaps` on it. A file still written with `trail:` and `trail: true` (the name before 2026-11-23) is renamed to `maps:` and `stop: true`, and `'held'` to `'finale'`.
5a2. **Every job needs a fight type** in `FIGHT_JOBS` (`src/data/fights.js`), even one with no fight in its own crises (a job that goes loud fights on engine 2): technical or records work `holdHack`, carrying or collecting `holdExtract`, watching or keeping a place `holdYard` (DESIGN.md 2026-11-19). No recipe unless the file has a `/* FIGHT */` block. A crisis's way out may be `kind: 'abort'` or `'extract'`.
5b. **A fight job** (the file starts with a `/* FIGHT ... */` block). If it has one, stop and tell the owner when the session runs on Sonnet: a fight job changes balance and needs the sims. Otherwise:
   - Read `docs/fight-recipe-template.md` first.
   - Add `id: '<type>'` to `FIGHT_JOBS` in `src/data/fights.js`, and update the test that pins the engine-2 jobs (`grep -n "FIGHT_JOBS).sort()" tests/fight.test.js`) to include it: the list grows on purpose.
   - Put `opposition: 'police' | 'corporate'` on the job object if the block names one (leave it out for none).
   - Turn the waves into a `FIGHT_RECIPES` entry in the template's format (`{ round, count, kind? }`; a wave with no kind leaves `kind` out). Keep the story's reasons as a comment beside each wave.
   - Remove the `/* FIGHT */` block from the job file once it is wired.
   - Run the fight sims before and after (the commands are at the top of `docs/sims/slice3i-2026-11-15.md`), write the comparison to `docs/sims/`, and check the declared bars in `sim-gate-teams` still hold. Add a DESIGN.md row (the job, its fight, its waves, what the sims say).
6. **Test:** `node scripts/check-job.mjs --all` (0 with errors), then `npm test`. If a test fails, read only the failing test's message and fix the job file, not the test.
7. **Log it** at the top of the newest file in `docs/changelog/` (under its intro line): `## <today's date> · New job: <Name>` and one plain line saying who offers it, where, and what it's about. If the job adds a new named person, place or faction to the world, use the `add-lore` skill (`.claude/skills/add-lore/SKILL.md`) for it: it checks the new canon and updates every copy. Commit it with the job.
8. **Commit** as the owner, with no co-author or session lines:
   `git -c user.name=marcusw -c user.email=160358373+MarcusW9@users.noreply.github.com commit -m "New job: <Name> (<client>, <district>)"`
   Push to the session's branch. If the owner asked for a PR, open one.
9. **Report back** in a few lines: the job's name, client and tier; anything you changed and why; any warnings left for the owner to judge.

No screenshots are needed: a new job doesn't change how the screens look.

If more than one job is pasted, do steps 1-5 for each, then test, log and commit once ("New jobs: A, B and C").

## The job

$ARGUMENTS
