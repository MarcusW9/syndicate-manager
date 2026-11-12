# Sim re-baseline after Slice 0a (watchable combat, 2026-11-12)

Before = commit `49e6888` (before "always draw ahead"); after = Slice 0a plus 0b-0e. Run at 100 seeds:
`node scripts/sim-orders.mjs 100 2026-11-12-<before|after>-0a`, likewise `sim-teams.mjs` and `sim-vanlevers.mjs`.

**Result: identical.** Apart from the title line, `orders-`, `teams-` and `vanlevers-2026-11-12-before-0a.md` and `-after-0a.md` match line for line.
That is expected: these sims play fights with their own seeded streams (`playFight`, `fightOddsFor`) or, at run level, watched fights that
already drew ahead. The one-off sequence shift of 0a touches only hands-off and away fights played through `runFight`, which no sim measures.
The pace-independence of outcomes is tested directly in `tests/fightpace.test.js`.

`sim-pullout.mjs` could not be re-run, before or after: its patch for the steady pull-out point (`level === 'steady' ? FIGHT.risk.steady.pullAt : ...`)
no longer exists in `core/fight.js`, so it stops with "riskThreshold changed: update the patch". It was already broken at `49e6888`. Its 2026-11-12
report stands as the last good run.

To re-run at the end of Slice 3 (0f): the same three scripts, dated `...-after-slice3`.
