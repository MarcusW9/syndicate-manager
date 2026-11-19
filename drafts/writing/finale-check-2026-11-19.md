# Finale check: does the service-party fiction fit Seventy-One Floors? (2026-11-19)

Read-only check of `src/data/heists.js` (`szetoTower`), `src/data/missions/penthouse.js`, `src/core/heists.js`, `src/core/mission.js`.
Against: `drafts/writing/supplied-2026-11-19-revised.md` section 6.

## Verdict: it fits, with one small wording change

**The reward.** The `face` step's effect is `{ drop: 'facial_scan' }`: the finale is dealt without that one crisis. Nothing else in
`penthouse` is a scanner or an identity check (the other crises are the laser grid, the owner coming home, the vault timer, a drone
and the lockdown), so "a registered service party goes up the lift without the facial-scan checkpoint" is exactly what the data does.
It does **not** disable recognition building-wide, give one face to the whole crew, open the vault or remove a later obstacle.
Crew size (4) does not matter: the crisis is dropped, not solved by a face.

**The finale's own text agrees.** Its beats already open "Up the service lift, past a sleeping concierge", the entry the service visit covers.

## One mismatch to fix

`heists.js`, `face.line` (shown to the player as the step's description, and read back in the result line) says:
"Arrange a registered service identity for the crew's lift access. The scanner needs to recognise someone it expects."
That reads as one face the scanner knows, which the revised fiction rules out. Suggested replacement (not applied):

> Arrange a registered service visit for the crew's lift access. The lift needs to expect the party.

`shows` ("Service identity registered: facial-scan crisis cannot appear") is still true as written.

## How a prep job ends the step (affects the outlines)

`heistResult` marks a step **done only when the run's outcome is `completed`**. Both `abort` and `extract` exits set `am.aborted`, so
the run is `aborted` and the step is **`failed`** (a retry job is offered, or the step can be bought). A death is also a failure.
Consequences for the outlines:
- Every "Exit" in A1-C2 (decline a registration the crew cannot support, leave the disputed connection untouched, return the
  discrepancy rather than call the plans verified...) fails the prep. That is the right result: no false identity, no unverified plans.
- C2's rule "an unresolved discrepancy must not award the full effect" needs **no new code**: the exit that returns the discrepancy ends the job as aborted, so the step fails.
- A partial success cannot award part of an effect; there is no half-done step. If an outline needs "good enough" to count, it must
  finish as a normal completion with its own cost (a lower pay, an injury), not as an exit.

## Other things the data confirms

- `templates` per step are `[first ask, retry]` (Rao's `reader` uses `['service_included', 'manual_handling']`). When the six jobs exist, point `face` at `[A1, A2]`, `power` at `[B1, B2]`, `plans` at `[C1, C2]`; the stand-ins (`access_window`, `relay_cover`, `data_pull`) go.
- A retry may sit in another district (Rao's `manual_handling` is at the Docks), so **B2 at the Docks is fine**.
- `plans` gives `intel: "the tower's current floor plans"` (+1 on every finale roll); `power` gives `threat: -1`.
- No test or validator checks `heistOnly`; add `heistOnly: 'szetoTower'` to each job as Rao's six do.
