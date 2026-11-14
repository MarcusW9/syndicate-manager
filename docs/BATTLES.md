# How battles work

Checked against the code on 2026-11-13 (`src/core/fight.js`, `runfight.js`, `battle.js`, `data/fights.js`, `data/dilemmas.js`, `data/battle.js`). The code and the data files win if this ever disagrees; fix this file when they change. Why each rule is what it is: `DESIGN.md` decision log (`docs/design/2026-11.md`, rows from 2026-11-10 on) and `drafts/SPEC-battle-orders.md` (section 30 is what was settled). Where things live: `CODEMAP.md`.

## Two engines

| | Engine 2 (the new fights) | Engine 1 (the old fights) |
| --- | --- | --- |
| Plays | Five jobs only: `data_pull`, `data_scrub`, `quiet_hours` (**hold the hack**) and `warehouse`, `protection` (**hold and extract**). `FIGHT_JOBS` in `data/fights.js`. | Every other fight, and every raid on a hall. |
| Health | **Pips**: one per 2 endurance, at least 3. | **HP**: 10 + cool ÷ 4. |
| Player's input | A standing **order** for each runner, a crew-wide **risk level**, and call-ins. | A one-off order per runner each round (shoot, flank, hunker, move, patch, talk, lights). |
| Code | `core/fight.js` (rules), `core/runfight.js` (the run's side), `core/fightview.js` (what the screen reads) | `core/battle.js` (rules), `core/runbattle.js` (the run's side) |
| Numbers | `data/fights.js`, `data/dilemmas.js` | `data/battle.js` |

Both use the game's one roll, **d20 + stat ≥ 10 + difficulty**. A fight's difficulty is the job's typical roll, so fights scale with the work; engine 2 plays it **2 lower** (`FIGHT.ease`, `fight.js fightDiff`), because a job's roll is taken by the crew's best and a fight tests every runner on their own stats. `diff` below means the fight's. Randomness is always the run's seeded stream; previews, "if nothing" text and dilemma checks never draw.

**When a fight starts** (`runbattle.js startBattle`): an incident with danger that the crew fails to save starts one, and on a loud run the first guarded danger incident always does (`loudFightDue`). If the job is one of the five, `runfight.js startFight` builds an engine 2 fight; otherwise engine 1.

---

## Engine 2

### The runners
- **Pips** = `max(3, floor(endurance / 2))`. A light wound starts the fight 2 pips down (never below 1).
- **Armour** absorbs whole hits: street vest 1, pro vest 2. A hit that is absorbed does no damage and uses up one point of absorb for the rest of the fight.
- **Weapon**: the sidearm's damage sets how often a hit is *strong* (2 pips instead of 1): damage 2 or less strong on a margin of 12 over the roll's need, 3 → 10, 4 → 8, 5 or more → 6. A piercing weapon ignores a target's absorb.
- **Roles that matter**: a **medic** or anyone with a patch bonus can heal; a **tech** (or anyone carrying a cyberdeck) can jam.
- Everyone starts in **half cover**. Stats used: combat, cool, medical, tech (with gear, traits and the approach already counted).

### The enemies
| Kind | Pips | Cover | Hits for | Threat deck |
| --- | --- | --- | --- | --- |
| Hired | 1 | half | 1 | aim, aim, alarm. They **break and run, all together**, when fewer than 40% of those who came are left. |
| Corp | 2 | half | 2 | aim, backup, aim, flank |
| Drone | 1 | open | 1 | aim, alarm. Absorbs one hit. A successful jam takes it out. |
| Enforcer | 2 | half | 2 | aim, aim, flank |

The Heights send corp and drones; the Docks send hired, hired, enforcers (in rotation). The number at the start depends on the job's threat (1–5): 2, 2, 3, 3, 4. Each enemy shuffles its own deck and draws one card a round.

### A round, in order
1. **Start** (`startRound`): reinforcements that were called arrive; on hold-and-extract, the pressure clock adds another enemy at round 3 and then every 2 rounds (alarms bring the next one a round earlier); a standby goes out to help with anyone down at the van; each enemy **draws and shows its threat** (the telegraph). A watched fight draws this ahead of time so you see what is coming before you give orders.
2. **Threats shown** (`telegraph`):
   - **aim**: a shot at a runner. It goes at the protected runner 75% of the time (if there is one), else at the lowest-pips runner half the time, else anyone. Its chance is shown.
   - **flank**: a shot that, if not stopped, puts a runner in the open for the rest of the fight.
   - **alarm**: a radio call that speeds the clock. **backup**: a radio call that sends another enemy (at most 2 extras in a fight). Both are stopped by a **jam** or by killing their source.
3. **Orders become actions** (`resolveOrders`): see below.
4. **The van** (hold-and-extract, last round of its wait): the van's call-in or the risk level decides whether to hold it.
5. **Overwatch** shoots first, one attack a round (one at the van).
6. **Each runner acts** in the fixed order: protectors first, then (while boarding) boarders, then the rest by seat.
7. **Threats resolve** against everyone's cover, hunkering and armour.
8. The hired may break; the **medic's aura** heals; **bleeding** is rolled; progress, the van and the clocks move on; **end checks** run.

### The numbers
| What | Rule |
| --- | --- |
| Enemy shot hits | chance = `(13 − (cool − diff) − cover) / 20`, clamped 10%–90%. Cover is open 0, half 2, full 4. Hunkering raises cover one step **and** takes another 4 off. A runner making for the van is in the open. The same function draws the shown chance and rolls the shot. |
| Your attack | d20 + combat ≥ 10 + diff − 2 + the target's cover. Hit = 1 pip, strong hit = 2. One absorb on the target soaks a hit unless you pierce. |
| Overwatch shot | d20 + value ≥ 10 + diff − 3 + the target's cover. |
| Jam | d20 + tech ≥ 10 + diff. Cancels every radio threat this round; a drone is out. Costs the jammer their action. |
| Patch | d20 + medical ≥ 10 + diff. Heals 1 pip. |
| Stabilise | d20 + medical ≥ 10 + diff + 2. Stops a downed runner bleeding. |
| Board the van | No roll (2026-11-13). The boarder takes a door slot and is in the open for that round's shots; one shot down on the way stays outside. Carrying a downed teammate is the same: both are in if the carrier makes it. |

### Orders
Every runner has a **duty**, a **target**, a **priority** list and a **fallback**. The crew's own default is already set and visible; the player can edit any of it.

| Duty | What the runner does |
| --- | --- |
| attack | Shoots an enemy. Priorities pick who: the one shooting the protected runner, a radio caller, the one aiming at the weakest runner, or the most dangerous shot. Later attackers skip an enemy already covered by planned damage. |
| protect | Takes the worst shot aimed at a teammate (the shot is rolled against *their* cover). With nothing to shield, a healer patches. At the van, protecting a downed teammate means carrying them. |
| support | A healer stabilises or patches; a jammer jams if a radio call is shown; else shields the worst shot on someone else. |
| hold | Hunkers if aimed at, else moves back to half cover from the open. |
| push | Holding the hack: the tech works (4 rounds of work win the hack). Holding to extract: boards the van, in door-slot order, most hurt first. |
| withdraw | Leaves the fight. |

If the duty has nothing useful to do, the **fallback** is tried, then hunkering. A runner never wastes the round on a repeat of something a teammate has already committed (shields, patches, the jam, door slots).

**Defaults**: hack — the tech works; the two toughest others protect the tech (fallback attack); the rest support if a medic or a jammer whose tech beats their combat, otherwise attack. Extract — while holding, the best protector covers the lowest-pips runner and the rest attack; when the van arrives, the protector keeps covering and the rest board.

A medic always stabilises a bleeding teammate first, whatever their orders.

### The risk level (the crew-wide dial)
It sets who pulls out of the fight and what a death can look like. Pulling out is checked at the **start of the round**.

| Level | Pulls out at | Bleeding and being left | Presses past the deadline |
| --- | --- | --- | --- |
| Cautious | half their max pips or fewer, rounded up | no | no |
| Steady | a third of their max pips or fewer, rounded up, at least 1 | no | no |
| Committed | never | yes (below) | yes |

A runner at their pull-out point is **asked** about when the fight is watched: *pull out* or *stay in* (stays until they lose another pip, then asked again). Hands-off, they pull out. Pulling out on foot just means `withdraw`; while the van is there it means making for it.

### The two fight types
**Hold the hack.** Keep the tech (the *protected* runner) alive while they work. Four rounds of work win. Deadline: round 7. An alarm clock starts at 5, ticks down each round (one more per alarm that gets through); at 0 another enemy is on its way and it resets to 3. Overwatch kit: a drone.

**Hold the yard** (Protection Run, 2026-11-13). One stage, no van. The pressure clock adds enemies as in hold and extract. Won (`end.routed`) when every enemy is down or fled and none is on the way; ends otherwise as the others (someone down, pull back, gone). Overwatch kit: a rifle.

**Hold and extract.** Two stages. *Hold* (stage 0) until the van comes, on round 3, or a round early if the driver sees someone near down or two or more enemies up (+1 heat, once). *Board* (stage 1): the van waits 4 rounds. Three door slots (four with a standby). Runners board; the best cool goes back for a downed teammate. Overwatch kit: a rifle.

### How it ends (`checkEnd`)
| Result | When |
| --- | --- |
| Won | the hack's work is done, or everyone has boarded with nobody dead or withdrawn |
| Lost runner | everyone has boarded but someone died or withdrew on the way (the run goes on) |
| Lost | the protected tech goes down or dies |
| Abandoned | the protected tech pulls out |
| Extracted | someone is down, nobody has chosen to fight on for them and it is not committed or at the van. A watched crew is **asked first** (see death's door). |
| Left behind | the van's last round is over, or nobody is standing outside to carry a downed runner |
| Gone | nobody is left standing and nobody in the van can climb back out |
| Deadline | the hack's round 7 passes |

**On the run**: *won*, *lost-runner* and *left behind* **keep the job going** (the objective was met, or the van left with everyone it could carry). Every other end is a **pull back**: the crew comes home with no pay, +1 heat, −2 reputation, and nobody is left dying (exits always save everyone).

### Down, dead and missing
- **Down** = 0 pips. Never dead by itself. A downed runner bleeds only on committed (or after the player chose to keep fighting for them): from the second round after going down, with a 10% chance each round to die, unless stabilised, carried or aboard. **A medic standing anywhere in the fight** heals the most hurt standing runner a pip a round and stops all bleeding.
- **Death's door**: when someone goes down and the crew would pull back, a watched player is asked: *pull back* (everyone comes home) or *keep fighting* (they stay down and bleeding, the push-on rule applies). Hands-off crews pull back on their own.
- **A hand-ordered withdrawal** that is shot to 0 pips on the way out dies. A runner whose own safety rule pulled them out goes down instead.
- **Left behind** (the van went): standing or down, the runner is **missing for 7 days** and returns with a serious injury (rescue and ransom are a later slice). On committed, someone left down has a 10% chance to die.
- After the fight, pips left become injuries: under half is *light*, under a quarter is *serious*, down is *serious* (or *critical* if still dying and pushed on).

**The death rule, in one place:** death follows only a risk the player accepted and was shown: *keep fighting* at death's door, a withdrawal ordered by hand, or the **committed** level. Cautious and steady crews never lose anyone without a call-in.

### Call-ins (`data/dilemmas.js`)
Authored situations that pause a watched fight. Each fires once per situation. Every call-in also offers **Pull back**.

| Call-in | When | Options |
| --- | --- | --- |
| Tech under fire | hack; the tech is at half pips or less and a radio call is shown | cover the tech (everyone else protects), hit the caller, jam (only if the tech can jam; the tech stops working that round), carry on |
| The van can't wait | extract, the van's last round, someone still outside | go now, or hold it 2 more rounds for +1 heat. Both show the odds of leaving someone behind. |
| Pull-out point | someone reaches their risk level's pull-out pips | pull out, or stay in |

An order change from a call-in lasts one resolved round, then the old orders come back unless the player set them in the meantime.

**Hands-off** (`fightAnswer`): the risk level answers. Cautious and steady hold the van for a downed teammate; committed lets it go on time. The tech call carries on with the orders. The pull-out point pulls out.

### Planning and screens
- `fightOddsFor` plays the fight many times on fixed seeds with the same round function: win, down, dead, left behind, lost. The squad board's coverage read quotes it, so shown risk is used risk.
- `previewRound` shows each action with the order it came from, each shot's chance and an auto-generated "if nothing" line. It never draws.
- Screens: `ui/fightscreen.js` (round screen and call-ins), `ui/fightorders.js`; view models `core/fightview.js`. Wording is the owner's: `data/fightText.js`, filled by `core/fighttext.js`.

---

## Engine 1

Used for every fight not listed above, and for raids on the halls.

- **Health**: HP = 10 + floor(cool ÷ 4). A light wound starts 3 down.
- **Guards**: count is the incident's (1 or 2) plus more on bigger work (at most 4). HP by threat 1–5: 4, 4, 5, 5, 6; damage 2, 2, 3, 3, 3; armour only on threat 5 (1). Armour comes off every hit; a landed hit always does at least 1.
- **Each round**: the guards' **intents** are rolled first (who each means to shoot, often the worst hurt) so you can answer them. Then hunker/flank/move orders set cover, **overwatch** shoots, a hall's **turret** (raids) fires on its own, the crew acts, **Wheels** may bring the van round (a clean way out), then every guard still up shoots.
- **Rolls**: your shot is d20 + combat ≥ 10 + diff − 4 + the guard's cover. A guard hits when d20 + diff ≥ 10 + your cool + your cover (hunkering adds 4; lights out adds 3). Cover: open 0, half 2, full 4; a rooftop post adds height (+1 to hit, +1 to be harder to hit).
- **What a runner does** unless ordered: stabilise a dying teammate, patch someone below half if their medical beats their combat, talk a guard down if social beats combat by 2, kill the lights if tech does, otherwise shoot the most hurt guard. Orders: shoot, flank (round the guard's cover, both of you in the open), hunker, move to a free spot, patch, stabilise, talk, lights.
- **Morale**: a badly hurt guard (under half HP) breaks and runs once they are the last one up or half their side is down, and raises the alert.
- **Length**: a raid caps at 3 rounds; every other fight at 12. Guards still up then means a call-in: push past or pull back.
- **Pulling back** costs the job's pay, +1 heat, −2 reputation, and every guard still up gets one parting shot unless the van came round (a parting shot can hurt but never drops anyone below 1 HP).
- **Death's door**: 0 HP is down, never dead. Only choosing to keep fighting (push on) can kill, through the usual push-on rule.
- Hands-off crews use standing orders: cautious pulls back once anyone standing is under half HP, steady under a quarter, committed never and presses past guards that are still up.
- The planning read (`battleOdds`) plays the fight 120 times on fixed seeds.

---

## Tuning

All numbers are first values in data. Engine 2's are checked by `scripts/sim-gate-teams.mjs` (the five jobs with the roster a campaign has when each unlocks; `docs/sims/gate-teams-*.md`), `scripts/sim-orders.mjs` (the validation gate on the real code; reports in `docs/sims/`) and the pull-out change by `docs/sims/pullout-2026-11-12.md`. Engine 1: `scripts/sim-battles.mjs`, `sim-districts.mjs`.

Tests: `tests/fight.test.js`, `runfight.test.js`, `fightscreen.test.js`, `fightcamera.test.js`, `fightspots.test.js`, `commandfight.test.js`, `battle.test.js`.
