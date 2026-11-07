# Proposal: leadership, judgment and the Leader slot

Status: proposal, nothing built. Owner's calls so far (2026-11-07): veteran calm dropped (no such rule exists; only veterans' `calm` leaning in `data/tags.js`); driving and medical both stay, so leadership is added and judgment maybe; the leader's bonus is a steady hand (call 2). Plan for step 3 of the stat work (after the stat-usage sim and the driving fix). Executive roles come later, with Phase 3. When this is agreed, add a row to the decision log in `DESIGN.md`.

## The idea in one paragraph

Two new attributes. **Leadership** (visible) lifts the rest of the crew and decides how many hard calls a lead makes before calling you. **Judgment** (hidden, hinted at) rolls on calls that are about making the right decision, and makes failures cost less. A new **Leader** slot on the squad board replaces the automatic crew lead. Both attributes grow from the record. Later they decide who can become a coach, scout, hall boss or the fixer's second.

## Owner's calls first

1. **Visible or hidden.** Proposed: leadership shown on the runner's page; judgment hidden, hinted at by scouts and Joss ("reads people well").
2. **Leader's bonus.** Owner (2026-11-07): a steady hand, not a flat bonus: once a job (twice at leadership 16+), a crewmate's roll that misses by 1-2 holds. Careful runs already pass 85-92% of their rolls, so a flat +1/+2 would make them near-certain.
3. **Who gets the bonus.** Proposed: everyone inside except the leader. The leader rolls their own stat as normal.
4. **Leading from the van.** Proposed: allowed, half the bonus (rounded down, so +1 at 16 only), out of harm's way.
5. **Fame gate.** Proposed: anyone can lead and give the bonus; only Respected or better takes risky calls for you.
6. **Holding together.** Proposed: with a leader of 14+, the first unsaved failure on a job doesn't raise the alert.
7. **Judgment calls.** Proposed: tag some crisis choices `call: true`; they roll judgment instead of the scene's stat. Start with 10 to 15 existing choices.
8. **Failing softer.** Proposed: a failed roll by someone with judgment 14+ costs one step less (serious → light, light → heat, heat → nothing). Once per job.
9. ~~Veteran calm~~: dropped (owner, 2026-11-07). There is no such rule to retire.
10. **Stat count.** Owner (2026-11-07): driving (as piloting) and medical both stay; leadership is added, judgment maybe. Eight or nine attributes, and the sim checks nothing dominates.

## Leadership

**On the job**
- The steady hand (call 2): once a job (twice at 16+), a crewmate's near-miss (by 1-2) holds. The planning read says "Rook can steady one near-miss"; the roll's notes say "missed by 1, Rook steadies it". The leader can't steady their own roll.
- Calls taken before calling you in: 1 at leadership 10, 2 at 14, 3 at 18 (replaces the fame-based "one risky call").
- Holding together (call 6).

**Off the job**
- Morale recovers faster for crew who worked under them that week.
- Later: the mentoring bonus, hall boss and coach roles.

**Grows from**
- Jobs led, crewmates brought home while leading, jobs led that ended clean, Synergies.
- Slow: about +1 a season for someone who leads every week.

## The leader's bonus (call 2, decided: A)

A chance of +1 on a roll has to keep shown risk equal to used risk and the run's dice the same. Three ways, for the owner to pick:

| Way | How | Read shows | Note |
| --- | --- | --- | --- |
| A. Steady hand (**chosen**, owner 2026-11-07) | Once a job (twice at 16+), a crewmate's roll that misses by 1-2 holds. | "Rook can steady one near-miss" | Limited, so it never makes careful runs certain; no new dice (it reads the same die). The once-a-job pattern is Clean Professional's. |
| B. Chance of +1 | Each crew roll has a chance (25% at 12, 50% at 16) of +1. | The blended odds | Needs a second die per roll, which shifts every later roll in a run; on average it's just +0.25 or +0.5. |
| C. Flat +1 / +2 | As first proposed. | +1 in the notes | Simple, but it pushes careful runs towards certain. |

## Judgment (maybe)

**On the job**
- Rolls on tagged judgment calls (call 7).
- Failing softer (call 8), shown in the report: "Bad roll, but Mei saw it coming: light wound, not serious."
- The lead's judgment improves the crew's own choices under standing orders: a better lead picks the option with the better expected outcome more often.

**Off the job**
- Later: scouting accuracy, and the hints on recruits' pages.

**Grows from**
- Hard calls that held, aborts that were right (the job had a hidden twist), saves.

## The Leader slot

- One per squad, on the board beside Overwatch, Wheels and Standby. Optional.
- Inside: full bonus, at risk like anyone inside. In the van: half (call 4).
- Joss's picks fill it when it lowers the risk, and the "Try" chips can suggest it ("Rook leads → mid").
- The squad picker shows each candidate's leadership and what they'd add.
- Leading counts in the record (`led`, `ledClean`, `ledHome`).

## Rules we keep

- **Shown risk equals used risk.** Every effect goes into `coverage` and the roll notes. The planning read must name the leader's bonus and failing softer.
- **Nobody dies unless you choose "push on".** Failing softer never makes anything worse.
- **Small numbers.** Re-run `sim-stats.mjs` and the 52-week cash sims after building; leadership shouldn't move median week-52 cash by more than about 5%.

## Saves

- New save version (next after v46) with a migration.
- Seed leadership from cool, jobs worked and fame tier; seed judgment from hard calls that held and jobs worked. Cap seeded values at 14 so nobody starts at the top.
- No leader on jobs already out; they carry on under the old rule.

## Where it would live

- `core/leadership.js`: `leaderBonus`, `callsTaken`, `holdsTogether`, `failSofter`, `growLeadership`.
- `core/lead.js` `crewLead` reads the slot instead of fame.
- `core/autorun.js` `leadTakes` reads `callsTaken`.
- `core/squad.js` `coverage` and `jossPicks` read the slot.
- `data/missions/*`: `call: true` on judgment choices; `core/jobcheck.js` checks the tag.
- `ui/board.js`: the Leader slot.
- `record.js`: the new counters.

## Build order

1. Attributes, seeding and the save migration; shown on the runner's page. No effects yet.
2. Leader slot and the steady hand; retire fame-based leads.
3. Calls taken and holding together.
4. Judgment calls on 10 to 15 crises, and failing softer.
5. Re-run the sims; tune.

## Later, with Phase 3: executive roles

| Role | Reads | Does |
| --- | --- | --- |
| Coach | Leadership | Rookies in their old role learn faster |
| Scout | Judgment | Finds recruits; reads more accurate |
| Hall boss | Leadership | Morale, raid calls, fewer interruptions from that hall |
| Fixer's second | Both | Takes calls from crews out |

A role takes the runner off jobs. Offering one is an option at retirement, beside letting them go; some will refuse. Roles unlock by tong rank (coach at Street, hall boss at District, second at City).

## Open questions

- Should a leader with a Synergy partner on the crew give more?
- Do traits shape it (Hothead a worse leader, Loyal a better one)?
- Can the leader lose standing when a job they led goes badly?
