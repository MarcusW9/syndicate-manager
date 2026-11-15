# The Wrong Fare: fight sim, 2026-11-15

Command: `node scripts/sim-gate-teams.mjs 24 100 2026-11-15-wrong-fare` (full output: `gate-teams-2026-11-15-wrong-fare.md`).
The job ships as threat 3, `holdHack` against corporate security, one wave of 2 `secforce` at round 2 (owner's decisions), roll target 14.

## The Wrong Fare, rows

| Team | Mode | Win | Left behind | Death |
| --- | --- | --- | --- | --- |
| best of roster | steady | 63% | 0% | n/a |
| first 4 | steady | 22% | 0% | n/a |
| best of roster | committed | 74% | n/a | 0.3% |
| first 4 | committed | 28% | n/a | 0.9% |

## Against the targets (best team)

| Measure | Target | Result |
| --- | --- | --- |
| Steady win | about 72% | 63% (9 points under, inside the 10-point limit) |
| Left behind, steady | 0% | 0% |
| Death on committed | about 0% | 0.3% |
| Every other job | within a few points of `gate-teams-2026-11-15-wave-jobs-2.md` | yes; the largest moves are the_last_collection committed death 4.2% to 5.5% and still_connected committed win 90% to 88% |

Every line in the verdict list says "within" (the_wrong_fare: a death in 0.3% on committed, within 8%).

## Why it is a hack fight

Every van-fight version of this job was over both bars in the Opus session: threat 3 or 4, wave at round 2, 3 or 4, with or without a cap of 1 on reactive arrivals, in the Docks or the Heights, with or without the opposition. Even with no wave it was 19% left behind and 9.6% deaths. The Heights' corporate leader and the plated grunts hit while the crew boards. A hold-the-hack fight has no boarding, so it stays inside the bars.

## Other findings

- Pay is 6500, above the threat-3 band (4000-5500). `check-job` warns; left for the owner.
- It lifts the 60-run economy sim: median cash at week 52 went to 84,040, over `tests/fame-sim.test.js`'s 10% band around 73,900. The owner chose to re-baseline (more to spend on later); see the DESIGN row.
