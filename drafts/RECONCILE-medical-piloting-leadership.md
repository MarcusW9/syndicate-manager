# Reconcile: medical, piloting and leadership with the build frame

Status: a docs pass (2026-11-18); the owner answered its six questions on 2026-11-20 ("The owner's answers", below; decision log). Nothing built. It answers the owner's ask of 2026-11-16: map each of `PROPOSAL-medical.md`, `PROPOSAL-piloting.md` and `PROPOSAL-leadership.md` onto the build axes and roles, and say what does not fit and stays standalone. Every "owner's call" below is a question, not a ruling. When the owner answers, log the answers in `docs/design/` and fold them into the three proposals.

## The frame, as built and as drafted

**Built (builds 3-ii-a/b, 3-iii; `data/builds.js`, `core/builds.js`):**
- A runner holds a **move** (the delivery: Ricochet) and a **payload** (what a hit carries: Cytotoxic or Contagion Vector, one of a family). Earned by Joss's offer, gated by `needs` (base stats before gear and traits), e.g. Contagion needs medical 8.
- The world side is **enemy tags** (`foeTags`, e.g. synthetic) that payloads are immune to.
- Numbers live in `data/`, rules in `core/fight.js`, wording is the owner's.

**Drafted, not built (`PROPOSAL-combat-builds.md`):** more axes (trigger, modifier, positioning, scaling, fuel/cost), more world axes (terrain, reactions, link), archetypes as starting leans, guardrails (no infinite loops, healing is rare, no controlling bosses, readable log). **Role abilities** are the last step of the swarm plan (`PROPOSAL-swarm-and-special-moves.md` section 3, step 5); which roles is still open.

**Roles today** are squad-board slots (inside team, Overwatch, Wheels, Standby) and fight actions a role takes (the medic's patch and stabilise, the medic's hands on the way out). Leadership would add a Leader slot.

**The test used below.** A thing is a **piece** if it is a move or payload a runner earns and carries. It is a **role** if it is a board slot or an action someone takes by being in that slot. It is **standalone** if it is a stat, a career, a base or a rule that never touches the fight's effect words.

## Medical

| Part of the proposal | Where it sits | Notes |
| --- | --- | --- |
| Named wounds, severity, migration, triage after the job, neural comedown | Standalone | Runner conditions, not fight effects. Needs a save migration of its own. |
| Field dressing, back up from down, patch and stabilise | **Role** (the medic's actions) | Same family as the built `treatWayOut`. Not a piece: no slot, no offer. |
| Combat medic specialisation | Role ability, later | This is a natural first "role ability" (swarm step 5), so decide it there. |
| Contagion's `needs: { medical: 8 }` | **Already the bridge** | Medical gates a bio payload. The same `needs` pattern can gate any future piece on any stat. |
| Hall doctor, Clinic levels, base treatment, chrome surgeon | Standalone (base, Phase 3 executive) | Overlaps `PROPOSAL-hall-building.md`'s Clinic room; those two drafts need one set of numbers. |
| Neural load, "chrome shock" wound | Possible **fuel/cost** axis | The combat-builds draft asks whether fuel/cost is a real axis (its question 5). Neural load already exists; decide once for both. |

**Conflicts to settle**
1. **Healing is rare** (combat-builds guardrail) against field dressing every round and "back up from down" (medical calls 3 and 4). Suggested reading: the guardrail is about *effect pieces* (nano-reconstruct stays jackpot-only); the medic's role action is a different thing, already limited by the medic's presence and orders. The owner's call.
2. **Word clash.** Wound kinds (bleeding, burns, chrome shock) and the effect library's enemy statuses (bleed, flame, shock, overload) share words. Keep wounds as what happens to *runners* and statuses as what happens to *enemies*, and keep the log words different.
3. **Archetype drift** (combat-builds question 3: medic to bio). Medical already gates Contagion, so a medic who takes Contagion is that drift. Decide whether it is a feature.

## Piloting

| Part of the proposal | Where it sits | Notes |
| --- | --- | --- |
| Rename to piloting, drones to piloting (built, save v51) | Standalone, done | |
| Getaway step (built) | Standalone (the way out of a job) | Not a fight effect. |
| Faster jobs, same-day moves | Standalone | Time, not combat. |
| Arrival table, raid support, backup, extraction by rounds | **Role** (Wheels, Standby) plus the fight's clock | Touches engine 2's van (`vanOdds`, van held once, `vanRound`) and raids on engine 2. The proposal was written before engine 2; re-check against it before building (the battle log says the van timing sweep kept `vanRound` at 3). |
| Boats | Standalone, waits for the Silt | |
| Drone Jockey, drones as gear | **Piece** (delivery) | The combat-builds draft has "drone carrier" and "lantern drones" as deliveries. A drone move would carry `needs: { piloting: 10 }`, the same way Contagion needs medical 8. Decide whether the Drone Jockey specialisation and a drone *move* are one thing or two. |

**Conflicts to settle**
1. **Who is a pilot in a fight?** Wheels is a board slot (a role), and a drone move would be a piece on an inside runner. A runner can be both only if the board allows it; today one slot each.
2. **Late arrivals join mid-fight** (piloting call 7 and 8). Engine 2 has no mid-fight joiners yet; that is new fight code, so it belongs with the engine, not here.

## Leadership and judgment

| Part of the proposal | Where it sits | Notes |
| --- | --- | --- |
| Leadership and judgment as stats, seeding, save migration | Standalone | Owner's calls of 2026-11-11 already set the shape. |
| The Leader slot and the steady hand | **Role** (a board slot, like Wheels) | The steady hand is an aura-like effect of a role, not a piece. |
| Calls taken, holding together, judgment calls, failing softer | Standalone (crisis and call-in rules) | Engine 2's call-ins and `dueDilemmas` are the place judgment would plug in. |
| Coach, scout, hall boss, fixer's second | Standalone (executive roles, Phase 3) | |
| Leader with a Synergy partner, traits shaping leadership | Open | Maps onto the combat-builds **scaling** axis ("adjacent allies") if it is ever a fight effect. |

**Conflicts to settle**
1. **Stacking.** The steady hand lets one near-miss hold once a job. A "primed" effect from the combat-builds draft (Rootkit) lands doubled. Neither is built; a cap should name both.
2. **Shown equals used.** The steady hand must read in `coverage` and the roll notes, as the leadership proposal says, and engine 2's planning read replays the fight, so the leader's effect has to be inside `fight.js`, not beside it.

## What this gives the build order

1. **Nothing here blocks the next build slice.** The built pieces (Ricochet, the Vectors, the offer) do not depend on any of the three.
2. **Share the `needs` mechanism.** Medical (Contagion) is the model: a stat in `needs` gates a piece. Piloting gates a drone move and leadership could gate a leader's aura the same way. No new system.
3. **Roles come together, as swarm step 5.** The medic's actions, the Leader slot and the Wheels/Standby arrivals are all board roles. Doing them as one pass (which roles, what each does to a group) avoids three separate board changes. The leadership proposal's Leader slot is the only one that needs a new board slot.
4. **Standalone work can go any time after the playtest,** each with its own save migration: wounds and triage, leadership and judgment as stats, the getaway-adjacent piloting steps, the Clinic and the hall doctor. They should not be bundled with builds.

## The owner's answers (2026-11-20)

1. **Healing is rare covers effect pieces only; the medic is exempt.** Patch, stabilise, field dressing and back up from down are the medic's job, limited by having a medic on the job and their orders. Nano-reconstruct and the like stay jackpots.
2. **Fuel/cost is not a build axis.** Neural load stays a condition bar, and chrome shock stays a wound. No skill costs fuel.
3. **Drones (the owner's own answer):** Drone Jockey stays the overwatch specialisation. Piloting also gives a **passive drone skill**: the runner fights with **a drone as a follower, another battler in the fight**, and **its stats and strengths come from the drone bought for them** (the gear). This is not a move: it doesn't take the move slot or deliver a payload. Open for its own proposal: whether it is a fourth kind of entry on the skills list (passive) or takes a place, its piloting gate, how the gear's stats map to a battler (HP, hit, armour), what the drone does each round, what happens when it falls, and the planning read (the drone must be inside `fight.js`, so the board's odds replay it).
4. **The roles are built together** (swarm step 5): the medic's actions, the Leader slot and the Wheels/Standby arrivals in one pass, with one board change and one sim sweep.
5. **A runner in a role place keeps their move and payload, and they fire when the runner is in the fight:** the inside team, and a Wheels or Standby once they arrive mid-fight. Not from overwatch or the van. No change to board places.
6. **The Clinic has levels, and a doctor is a bonus.** Today's Clinic (¥18,000, heals 2 days a day at home) is level 1 at full speed. Levels 2 and 3 follow the medical proposal (¥14,000 for 3 days a day; ¥20,000 for 4 days a day, where a serious injury starts a day shorter, and level 3 needs a doctor). A doctor adds speed on top (draft: +1 day a day at medical 12, +2 at 16). There is no half-speed penalty without one.

## Questions for the owner (answered above, 2026-11-20)

1. Is "healing is rare" a rule for effect pieces only, with the medic's role action exempt?
2. Is fuel/cost (neural load, chrome strain) a real build axis, or does it stay a wound and a stat?
3. Are the Drone Jockey specialisation and a drone *move* one thing or two?
4. Should the three roles (medic actions, Leader slot, Wheels/Standby arrivals) be built together as swarm step 5?
5. May a runner hold a role slot and carry a piece at once (a Wheels with a Ricochet)? Today the board gives one slot each.
6. The Clinic: take the hall-building draft's numbers or the medical proposal's levels (they differ).
