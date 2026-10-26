# Earned traits: backlog

The owner's list (2026-10-26) had 26 traits. The 12 the game can already detect and apply are
built (`src/data/earnedTraits.js`, `src/core/earned.js`). These wait. The rules agreed for all
traits apply here too: no trait takes a choice away (downsides are penalties plus a Joss
warning), at most two temporary traits at once, progress hidden until earned.

## Group 2: waiting on crisis tags
Crises don't yet say what kind of situation they are. Next step: tag every crisis (`escape`,
`crowd`, `police`, `entry`, `street-tech`, `fight`, `threat`, `intimidation`, `neural`).
Claude drafts the tags, the owner skims. Tags also feed mission logs and gear later.

| Trait | Kind | Needs | Notes |
|---|---|---|---|
| Light-Fingered | lasting | `entry` | +1 stealth entering or leaving a restricted place, not in chases. |
| Crowd Reader | lasting | `crowd` | +1 social calming a crowd or keeping witnesses out of it. |
| Wirewise | lasting | `street-tech` | +1 tech on street hardware, not corporate systems. |
| Corner Fighter | lasting | `fight` (+ outnumbered / protecting) | +1 combat protecting a hurt crewmate or a non-combatant. |
| Rattled by Sirens | temporary | `police` | −1 cool when the Harbour Police appear. "Won't take solo police-facing tasks" becomes a penalty + warning. Also earned when held by the police on side work (that exists now). |
| Short Fuse | temporary | `threat` | +1 combat once a confrontation starts, −1 social trying to prevent one. Agreed: if it comes a third time they become a permanent **Hothead** (the existing trait). |
| Burned Out | temporary | `neural` | −1 tech and cool. "Refuses neural-hardware jobs" becomes a penalty + warning. Fades after three days of full rest. |
| Scarred (upgrade) | lasting | `intimidation` | Today: +1 cool while hurt. With tags: +1 cool in injury and intimidation crises, as written. |
| Ghost Driver (upgrade) | lasting | `escape` | Today: +1 on all driving. With tags: +1 driving in escapes, and a clean escape cancels that crisis's first heat, as written. |

## Group 3: waiting on systems that don't exist yet
| Trait | Waits for | Notes |
|---|---|---|
| Typhoon Legs | weather penalties | Ignores the first weather penalty on a job. |
| Back-Street Medic | clinic costs | Treats light injuries at the safehouse for free. |
| Owes a Favour | a client rescuing the crew | +1 trust with that client; "can't refuse their next task" becomes a penalty + warning. |
| Hard Exit | a rethink | An abort ends the job, so "first roll after the abort" never comes. Candidate: +1 on the stabilise roll in a critical. |
| Overconfident | (could be built now) | +1 on hard rolls; "refuses the safest choice" becomes −1 on the safest choice and a Joss warning. Held back with group 2 so the refusal rework lands together. |

## Partial in group 1 (to finish later)
- **Second Wind** shrugs off only the injury penalty; neural load has no roll penalty yet.
- **Client's Favourite** gives the trust bonus; "the client reacts badly if they're left out" needs a new rule.
