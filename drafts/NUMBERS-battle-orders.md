# Battle rework: numbers sheet (first values)

Status: **proposal for the owner** (2026-11-10). First values for every number and timing rule
that `drafts/SPEC-battle-orders.md` section 25 says must be settled before Step 0. Nothing here is
built or decided. Where a value needed a rule the spec left open, the rule is marked **(rule
proposal)** so it isn't mistaken for a number.

All values go in data (`data/battle.js BATTLE`, `ENEMIES`, `FIGHTS`, `CLOCKS`); Step 0 adjusts
them there.

---

## 1. The scale everything sits on

**Base difficulty = today's fight difficulty, unchanged:** the incident's difficulty,
`round(6 + 2.5 x threat)`, minus 2.5 on rookie work, plus the incident's own step and the alert
(`core/incidents.js incidentDifficulty`). So fights stay on the same scale as every other roll.

| Threat | 1 | 2 | 3 | 4 | 5 |
| --- | --- | --- | --- | --- | --- |
| Base (rookie work) | 9 (6) | 11 (9) | 14 (11) | 16 (14) | 19 (16) |

A runner's **margin** `m` = their stat minus the base. Every runner action uses
`fightChance(stat, base + step)` = `(11 + m - step) / 20`. A stat equal to the base (`m = 0`) is
55% on a step-0 action.

Where today's crews sit (measured: 200 fresh starting crews):

| Stat | 10th pct | median | 90th pct | max |
| --- | --- | --- | --- | --- |
| combat | 2 | 5 | 9 | 11 |
| tech | 2 | 5 | 10 | 11 |
| medical | 2 | 4 | 9 | 11 |
| social | 2 | 5 | 9 | 11 |
| cool | 5 | 7 | 9 | 9 |

So on a threat-1 rookie job (base 6) a specialist is about `m = +4` in their own stat and `m = -1`
in the rest; cool sits around `m = +1`. On threat 3 (base 14) the same runners need about four
points of growth to be at `m = 0`.

**Crew groups for the sims** (by margin against the fight's base, so one set covers every tier):

| Group | Main stat | Other stats | Cool |
| --- | --- | --- | --- |
| Under | m = 0 | m = -5 | m = -2 |
| On level | m = +3 | m = -2 | m = 0 |
| Over | m = +6 | m = +1 | m = +3 |

Each group is run with three line-ups: (a) tech, muscle, medic, gunner; (b) tech, muscle, two
gunners (no medic); (c) tech, face, medic, gunner (no muscle). The jammer goes to the tech, and in
(a) a second jammer to the medic. That gives 9 crew groups.

## 2. Pips, armour, injury

| Key | Value | Notes |
| --- | --- | --- |
| `runnerBasePips` | 3 | |
| `endurancePerPip` | **2** (owner, 2026-11-11) | pips = endurance / 2, rounded down, at least 1; replaces `runnerBasePips`, `toughCool` and `musclePips` (spec section 10a). In Step 0 endurance was rolled per runner around 14 for muscle and 11 for everyone else (spread about 2.5): most runners have 4-6 pips, muscle 6-8. (First proposal, superseded: 3 pips, +1 at 13, +2 at 17.) |
| `enemyHit` | **by kind** (owner, 2026-11-11) | hired 1, drone 1, corp 2, enforcer 2; 2 is the most any shot does (pass 4 below). A flat 1 is too little against 5-7 pips; a flat 2 works but has no variety |
| `patchHeal` | **2** (proposal) | pips a patch gives back, matched to `enemyHit` |
| `lightWoundPips` | 1 | starting with a light injury |
| `hit` | 1 | |
| `strongHit` | 2 | runners only; enemies never land strong hits in the prototype (their shots read "55%, 1 pip") |

**Armour absorbs hits (rule proposal, one rule for both sides):** `absorb` is the number of hits
soaked per fight. A soaked hit does nothing. **`ap` ignores absorb.**

| Armour | absorb |
| --- | --- |
| None | 0 |
| Street vest (today `armour: 1`) | 1 |
| Pro vest (today `armour: 2`) | 2 |
| Drone (enemy) | 1 |

This replaces the spec's "an armoured enemy needs `ap`": without armour piercing a drone takes two
hits, the first soaked. That gives crews without `ap` a slow way through, and makes `ap` a speed-up
rather than a key.

**Injury from pips left** (share of max at the end): `lightBelow: 0.5`, `seriousBelow: 0.25`; down
(0 pips) = **critical**, as today's death's door. For a 3-pip runner: 3 or 2 left = fine, 1 = light,
0 = critical. For 4 pips: 4 or 3 = fine, 2 or 1 = light, 0 = critical.

## 3. Incoming shots (the exposure formula)

Same shape as today's `guardHitChance`, with a floor and a ceiling so cover never makes anyone
immune:

```
aimChance(target) = clamp( (11 + aimStep - mCool - coverStep - (hunker ? hunkerStep : 0)) / 20,
                           aimFloor, aimCeil )
mCool     = target's cool - base
coverStep = BATTLE.cover[target's cover this round]   // open 0, half 2, full 4
hunker    = cover goes one step better AND hunkerStep on top (as today)
```

| Key | Value |
| --- | --- |
| `aimStep` | **+2** |
| `cover` | open 0, half 2, full 4 (unchanged) |
| `hunkerStep` | 4 (unchanged) |
| `aimFloor` / `aimCeil` | 0.10 / 0.90 |

What a shot looks like on a runner with `mCool = 0`:

| Position | Open | Half | Full | Hunker from open (-> half) | Hunker from half (-> full) | Flanked (-> open) |
| --- | --- | --- | --- | --- | --- | --- |
| Hit chance | 65% | 55% | 45% | 35% | 25% | 65% |

Each cover step is 10 points; hunkering is worth 30 points. That is a big cut but never a cancel.
High cool matters, which makes good-cool runners the natural shields: a muscle with `mCool = +3`
in half cover is hit 40% of the time, against 55% for the tech.

**Flank timing:** a flank changes the target's cover when threats resolve, after every runner
action, so it affects **next round's** shots. A runner can `move` that next round to get cover back.
(A flank landing the same round would make the shown chance wrong; this way shown = used.)

## 4. Runner actions

| Action | Stat | Difficulty | m = 0 | m = +3 | Notes |
| --- | --- | --- | --- | --- | --- |
| attack (enemy in half cover) | combat | base - 2 + 2 | 55% | 70% | `attackStep: -2` |
| attack (enemy in the open: drone) | combat | base - 2 | 65% | 80% | |
| talk (hired) | social | base + 2 - 2 | 55% | 70% | if talk stays: non-lethal, hired only |
| jam | tech | base + 0 | 55% | 70% | jammer tier: +1 per step |
| patch (+1 pip) | medical | base + 0 | 55% | 70% | needs medic role or trauma kit |
| stabilise | medical | base + 2 | 45% | 60% | today's stabilise is harder than a patch too |
| board (+1 progress) | cool | base + 0 | 55% | 70% | |
| work (hack) | | | 100% | 100% | one progress, if standing at the end of the round |
| shield, hunker, move, withdraw | | | 100% | 100% | |
| overwatch attack (half cover) | kit stat | base - 2 - 1 + 2 | 60% | 75% | one attack a round (rule proposal) |

`attackStep` moves from the brief's -4 to **-2**. At -4 an on-level gunner hits a half-cover enemy
65% of the time, and because runner actions resolve before shots, every kill also cancels a shot.
At -2 attacking is still the better roll than enemies get on you, but not by much.

**Strong hit (rule proposal):** a hit is strong when the roll beats what was needed by
`strongMargin` or more. Default `strongMargin: 10` (5% for an on-level gunner, 20% for `m = +3`).
Sidearms set it by today's damage, so owned guns keep a job:

| Sidearm damage (today) | 2 | 3 | 4 | 5 |
| --- | --- | --- | --- | --- |
| `strongMargin` | 12 | 10 | 8 | 6 |

Sidearm `aim` stays a combat bonus. `pierce >= 1` (machine pistol, coil) gives the `ap` tag. The
street piece (no weapon) is damage 2.

## 5. Enemies

Three durability settings for the sims (the spec asks for several, not one tuned until a plan
wins). **D2 is the proposed default.**

| Kind | D1 light | D2 default | D3 heavy | cover | deck |
| --- | --- | --- | --- | --- | --- |
| hired | 1 pip | 1 pip | 2 pips | half | aim, aim, alarm |
| corp | 1 pip | 2 pips | 3 pips | half | aim, backup, aim, flank |
| drone | 1 pip, absorb 0 | 1 pip, absorb 1 | 2 pips, absorb 1 | open | aim, alarm |

| Key | Value | Notes |
| --- | --- | --- |
| `COUNT_BY_THREAT` | 2, 2, 3, 3, 4 | threat 1 to 5 (unchanged); both prototype types capped at 4 |
| `hired.fleeBelow` | **0.4, side-wide** | when standing hired / hired at the start falls below it, the rest flee at the break step. With 3 hired: the third runs once two are down |
| `hired.talk` | -2 | if talk stays |
| `targetFocus` | 0.5 | share of aim/flank on the lowest-pips runner (rest: any standing runner) |
| `protectFocus` | **0.75** (new) | in a fight with a protected runner, share of aim/flank on them (rest by `targetFocus`). At 1.0 every shot goes at the tech and nothing else matters; at 0.5 the tech is barely in danger |

Decks are shuffled per enemy per fight (seeded) and drawn in order, reshuffled when empty. A
`backup` drawn in a fight without `enemyReinforce` is drawn again.

## 6. Risk thresholds (in pips)

A runner withdraws at round start once their pips are **at or below** the threshold:

| Level | Threshold | 3-pip runner | 4-pip runner | 5-pip runner | press at deadline |
| --- | --- | --- | --- | --- | --- |
| Cautious | `ceil(max / 2)` | after 1 hit (at 2) | after 2 hits (at 2) | after 2 hits (at 3) | no |
| Steady | 1 | after 2 hits | after 3 hits | after 4 hits | no |
| Committed | 0 (never) | fights until down | | | yes |

The three levels now differ on every pool size. A cautious tech leaves after one hit, which ends
holdHack's objective: that cost is what makes cautious a real choice in that fight.

**Individual withdrawal (rule proposal):** the runner leaves at the start of resolution. A shot
already aimed at them this round still resolves (they leave under fire) but can't take them below
1 pip (`partingShotFloor`). They count as on the job for pay, fatigue and career, but not as
finishing the fight.

## 7. Fight types, deadlines and clocks

| Key | holdHack | holdExtract |
| --- | --- | --- |
| `work` / `board` | 4 rounds of work | 2 boarding progress |
| `deadline` | 7 rounds | 7 rounds |
| `vanRound` | | 3 |
| driver shift | | piloting `m >= +3`: round 2; `m <= -3`: round 4 |
| clock | alarm | pressure |

**Clocks:**

| Clock | Rule |
| --- | --- |
| `alarm` | starts at 5; -1 at the end of each round; -1 more per unanswered `alarm` threat. At 0: one enemy of the site's kinds arrives at the start of next round and the clock resets to 3 |
| `pressure` | one enemy of the site's kinds arrives at the start of rounds 3, 5 and 7 |
| `backup` threat | unanswered: one enemy of the same kind arrives at the start of next round |
| shared limit | **`maxExtraEnemies: 2`** per fight, across clocks and backup together; past it, clocks stop and backup draws are redrawn |

Arrivals come in at half cover, with their threat drawn the round they arrive (shown before
orders, like everyone's).

**Deadline:** at the end of round `deadline`, if the goal isn't met: the call-in (push past: alert
+1, heat +1; or pull back: parting shots, never below 1 pip). Committed risk presses on its own on a
hands-off job.

**`vanRound` special (rule proposal for its cost):** the driver brings the van one round earlier
(never before round 1) for **+1 heat** on the job (driving hard through the district). Default
orders fire it when a runner is at 1 pip in stage 0 or two or more enemies are up at the start of
round 2. The alternative is no cost and always on, but then it isn't a choice and should leave the
specials list.

## 8. Specials (first values)

| Special | Effect |
| --- | --- |
| smoke | **everyone's cover +1 step this round** (half -> full); enemies' too. Not a cancel (rule proposal) |
| stim | down -> 1 pip, once; the runner acts from next round |
| vanRound | as above |

## 9. Dilemma thresholds

| Dilemma | Number |
| --- | --- |
| `techUnderFire` | protected runner at 1 pip and an unanswered `backup` shown |
| `boardUnderFire` | stage 1 (board), 2+ enemies up, a runner with shown `aimChance >= 0.6` (open, or half with `mCool <= -1`) |

## 10. What to expect (arithmetic, not results)

Rough expected values from the numbers above, to check before Step 0 that the trade-offs exist.
Step 0 and the sims are what count.

**holdHack, threat 3, heights (corp and drone), D2, on-level crew, tech `mCool = 0`, half cover:**

- About 1.5 aims a round (3 enemies, about half their draws are `aim`), 75% of them at the tech:
  about 1.1 a round, 55% each.
- **Nobody protecting:** about 0.6 hits on the tech a round, so about 2.5 over four rounds of work.
  A 3-pip tech with a street vest (absorb 1) is down or at 1 pip most fights.
- **One shield a round:** the tech's share drops to about 0.1 to 0.2 aims; the protector takes the
  redirected shot at 40 to 55%. The tech usually finishes. Two protectors make it nearly certain,
  at the cost of the radio (backup, alarm) going unanswered.
- **Attack-first:** a corp needs two hits at 55% (two attackers in a round, both landing: 30%), so
  the enemies' shots mostly keep coming for two rounds. Against D1 (corp at 1 pip) attacking first
  catches up with protection.
- **The tech jamming:** each jam is a round with no work, so the fight runs a round longer, with
  one more round of shots at the tech.

**holdExtract, threat 3, docks (hired), D2, four on-level runners:**

- About 2 aims a round at 55%: about 1.1 hits a round if nobody acts.
- **All hold for 3 rounds:** about 0.5 hits a round (hunkered, 25%) = about 1.5 hits spread over
  four runners; then boarding in the open for about a round (about 1.1 hits). Total about 2.6
  hits; no enemies down; the pressure clock adds one in round 3.
- **All attack:** round 1 about 1.6 hired down (55% each, one attacker per enemy), and the third
  flees at 0.4; about 0.5 hits taken. Then boarding unopposed apart from the round-3 arrival.
  Total about 1 hit. **At D2, attacking clearly beats holding against hired.**
- **At D3 (hired 2 pips):** round 1 kills about one; about 0.8 hits a round for three rounds, so
  attacking costs about as much as holding, and the clock adds to both. Holding and boarding
  should compete here.

So with these numbers the expected picture is: protection wins holdHack against corp (D2), attack
wins holdExtract against hired at D1 and D2, and holdExtract is close at D3. That is "different
viable plans", but it hangs on the hired durability and `attackStep`. Those two numbers are where
Step 0 should look first.

## 11. The validation gate (proposed tolerances)

To be confirmed and recorded before the sims run (spec section 24).

| Item | Proposal |
| --- | --- |
| Seeds | 400 per cell |
| Crew groups | the 9 in section 1 (3 margins x 3 line-ups) |
| Settings | durability D1, D2, D3 x exposure E1, E2, E3 = 9 (`aimStep` 0, +2, +4) |
| Encounters | holdHack (heights: corp, drone), holdExtract (docks: hired), threat 3 |
| Plans | attack-only; hold-only; protection-heavy; support-heavy; the crew's defaults; adapted (best of a small fixed set per encounter, chosen per cell); one unchanged plan (each single plan above, used in both encounters) |
| "Effectively as good" | within **5 points** of the adapted plan's objective success, **and** within **0.25 downed runners** per fight, **and** within **0.3 specials or consumables** per fight |
| Rework | some unchanged plan is effectively as good as the adapted plans in **both** encounters in **at least two thirds** of the cells (crew group x setting) |
| Proceed to playtest | in **at least two thirds** of the cells, the adapted plan beats every unchanged plan by **10+ points** of objective success **or 0.5+ fewer downed runners** in at least one encounter, and no single unchanged plan is effectively as good in both |
| Toughness check | the Over group's gain over On level is at least twice as big in aim-heavy cells (E3) as in radio-heavy ones (decks weighted to backup and alarm), so toughness doesn't replace answering the radio |
| Reporting | the full cell table goes to `docs/sims/`, the summary and the declared targets to CHANGELOG |

## 12. Step 0 findings (2026-11-10)

Step 0 was played by script: `node scripts/sim-step0.mjs 400 2026-11-10 first` (these values) and
`... hard` (the same with four enemies at the start and no toughness pip). Reports:
`docs/sims/step0-2026-11-10.md` (with ten narrated fights) and `docs/sims/step0-2026-11-10-hard.md`;
every cell in the matching `.csv`. The rules played as written (shields, flanks, armour soak, jams,
clocks and backup all checked in the narrated fights); the sim's own assumptions are listed at the
top of each report.

**Gate verdict: neither rework nor proceed, on either profile.**

1. **These values make fights too easy.** Almost every sensible plan wins 95-100% in both
   encounters, so adapting has nothing to beat (proceed condition met in 0% of cells). No plan is
   universal either (the best, `mixed`, matches the adapted plan in both encounters in 57% of cells,
   under the two-thirds line).
2. **(Superseded by endurance, pass 2 below.) `toughCool: 12` gives everyone the extra pip at threat 3** (base 14, so even the Under group's
   cool of 12 clears it). Runners have 4 pips and muscle 5, not the 3 the arithmetic in section 10
   assumed. An absolute stat threshold can't stay a mark of toughness on a relative fight scale:
   make it relative (cool >= base + 3) or drop it.
3. **With teeth (the hard profile), the plans separate the way the spec wants:**
   - holdHack: **protect** is best in nearly every cell (86-96%); attacking collapses as enemies get
     tougher (77% -> 43% -> 25% from D1 to D3); hold-only loses (6%: nobody stops the shots at the
     tech).
   - holdExtract: **attack / mixed** win at D1-D2 (92-93%); at D3 attack drops to 58% and support,
     hold and the defaults take over.
   - So no plan is right everywhere (the most universal, `support`, matches in 28% of cells), and the
     answer flips with the encounter and with enemy toughness. But the proceed condition is met in
     only 31% of cells: in many cells the second-best plan is within 10 points and 0.5 downs. The
     gate's "clearly beaten" bar (10 points or 0.5 downs per fight) may be too high for fights that
     are already mostly won; worth a second look before the real sims.
4. **The withdrawal rule kills more than it saves.** With a runner leaving alone able to die to the
   shots already aimed at them, **cautious is the deadliest risk level**: hard profile, holdExtract,
   0.48 deaths per fight on cautious against 0.18 on steady and 0 on committed; holdHack cautious
   also abandons 63% of hacks (the tech leaves after one hit). Hold-only plans lose about a quarter of
   a runner per fight to it. Every one of those deaths is on a hands-off fight with no fight-on
   choice. See the decision row: this needs the owner's look before it is built.
5. **The defaults are weak.** In holdHack (hard, D2) the crew's defaults win 62% where protect wins
   89%: one protector on the tech isn't enough when 75% of the shots go at them. In holdExtract the
   defaults sit with hold, well behind mixed. Defaults that lose this often to an obvious plan will
   hurt trust on hands-off jobs.
6. **Pacing.** Fights are short (3.5-4 rounds), so the 7-round deadline never matters. The
   `techUnderFire` conditions almost never come up (0% on these values, 7% hard): the tech at 1 pip
   *and* an unanswered backup shown at once is too narrow. `boardUnderFire` comes up in about 30% of
   holdExtract fights, a reasonable rate.
7. **Boarding is crew-wide progress** ("board: 2"), so two runners reaching the door finishes the
   extraction even if a third didn't (the narrated fights show "everyone is in the van" with one
   runner short). Per-runner boarding would read truer.
8. **Toughness doesn't replace answers:** better crews gain much more in aim-heavy fights than in
   radio-heavy ones (hard: +21 points against +6). The check is met on both profiles.

**Suggested changes for the next pass (owner's call):** start from the hard profile (four enemies;
toughness relative to the base or off); defaults with two protectors on the tech in holdHack and
`mixed`-style orders in holdExtract; a withdrawal rule that doesn't make cautious the deadliest
setting (the 2026-11-10 decision row lists options); a wider `techUnderFire` (tech at 1 pip *or*
2+ shots on them); per-runner boarding; then re-run Step 0 and look again at the gate's bars.

**Pass 2 (2026-11-11): pips from endurance.** Same rules, with `toughCool` and the muscle pip replaced
by endurance (`docs/sims/step0-2026-11-11.md`, `...-hard.md`). Runners mostly have 3 pips again
(muscle often 4), so the first values bite harder:

- **First values:** still no verdict (proceed in 7% of cells; the most universal plan, `mixed`, in
  37%). But the plans now separate: holdHack protect 97-100% against attack 91% / 71% / 54% (D1-D3),
  hold-only 23%; holdExtract mixed 93-98%, attack 95% falling to 74% at D3, hold-type plans about
  90% with five to seven times the downs of mixed.
- **Hard profile:** much as before (proceed 26%; `support` the most universal at 30%).
- **Unchanged findings:** the withdrawal rule makes cautious the deadliest level (hard holdExtract:
  0.42 deaths a fight on cautious, 0 on committed); the defaults lose to obvious plans (hard holdHack
  D2: 67% against protect's 92%); `techUnderFire` comes up in 2-6% of fights.

So endurance fixes the "everyone is tough" problem, and the first values plus endurance are close to
the hard profile in shape. What keeps the gate from proceeding is now mostly list A in the spec's
section 25 (defaults, the withdrawal rule, the gate's bars), not the numbers.

**Pass 3 (2026-11-11): one pip per two points of endurance (owner).** Most runners now have 4-6
pips and muscle 6-8 (`docs/sims/step0-2026-11-11-pips*.md`).

- **With shots still at 1 pip, fights are too easy:** first values give **REWORK** (`mixed` matches
  the adapted plan in both encounters in 74% of cells; most plans win 94-100%). Four enemies alone
  doesn't fix it (protect and support each match in 47%).
- **`heavy` profile (four enemies, enemy shots take 2 pips, patches give 2):** the plans separate as
  well as in any pass. holdHack: protect best at D1, support at D2-D3; attack 79% / 47% / 30%;
  hold-only 9%. holdExtract: `mixed` best at D1-D2 (87-88%), support at D3; hold and protect plans
  about 67% with three times the downs of `mixed`. No universal plan (`support` the most, 33%);
  adapting clearly pays in 26% of cells; the toughness check is met (+23 against +9).
- **Still unchanged:** cautious is the deadliest level (heavy holdExtract: 0.51 deaths a fight on
  cautious, 0 on committed); the defaults trail the best plan; `techUnderFire` comes up in 4%.
- Every two points of endurance is now a pip, so endurance visibly matters; the section 10
  arithmetic (3-pip runners, 1-pip shots) is superseded.

**Pass 4 (2026-11-11): shot damage by enemy kind (owner: some 1, some 2, the toughest 2).** Four
enemies at the start; hired and drones hit for 1, corp for 2; shields take the worst shot first
(shown chance x pips). Reports: `docs/sims/step0-2026-11-11-pips-varied.md`, `-enforcers.md` (an
enforcer, 2 pips and a 2-pip shot, in about one in three docks slots), `-enforcersHalf.md` (half).

- **holdHack (corp 2s and drone 1s) works as intended:** protect best at D1 (92%), support at D2-D3
  (86-87%); attack 84% / 55% / 39%; hold-only 17%. The crew's defaults trail (89% / 74% / 66%).
- **holdExtract with hired only is too easy again** (every plan 91-99%): all its shots are 1 pip.
- **With enforcers in a third of the docks slots** it bites (83-94%): `mixed` best at D1-D2, the
  defaults best at D3. No verdict (proceed 0%; `protect` matches in 65% of cells, just under the
  rework line).
- **With enforcers in half the slots** every holdExtract plan lands at 76-90%, so `protect` matches
  the adapted plan in 70% of cells: **REWORK**. More damage makes holdExtract's plans converge; its
  shape (survive three rounds, then board) gives orders too little to change. That's now list A
  item 9 in the spec.
- Recommended for now: enforcers in a third of docks slots, and a design change to holdExtract
  before the next pass.

**Pass 5 (2026-11-11): contested boarding and the van that can't wait (owner).** On the `enforcers`
mix (an enforcer in about one docks slot in three). Each runner boards for themselves, two a round
through the door, in the open while they run; a boarder can carry a downed teammate (Claude's
proposal); the van waits four rounds, then the call-in: go, or hold one more round (+1 heat, one more
enemy). Report: `docs/sims/step0-2026-11-11-pips-contested.md`.

- **Tuning sweep** (100 seeds; door slots 2-3, boarding step -2/-4, van wait 3-4): with the van
  waiting three rounds it leaves someone behind in 70-88% of fights; with **two door slots, boarding
  at -4 (75% on level) and a four-round wait** it comes up in about 30%, which is the setting used.
  Before carrying, most losses were a runner going down at the van door (the old "down = retreat"
  assumption).
- **Two fixes found in the narrated fights:** a fight where a runner died or walked off is no
  longer scored as a win; and while the van is there, a runner at their risk threshold makes for the
  van (first door slot) instead of walking off alone on foot (proposal: "pulling out" means the van
  once it's there). Deaths in holdExtract fall to about 0.00-0.05 a fight.
- **holdExtract now separates the plans** (hard: everyone must reach the van): `mixed` 69% (0.38
  downs) at D1-D2; `hold` 65-66% but with twice the downs (0.74), and the best at D3; attack 61-62%
  falling to 28% at D3; support 59%; protect and the defaults 45-48%. holdHack unchanged (protect,
  then support).
- **Gate:** no universal plan (the most, `mixed`, matches the adapted plan in both encounters in 23%
  of cells; protect and the defaults 0%); adapting clearly pays in 21% of cells. **Neither
  verdict.** The toughness check is met (+26 against +13).
- **The van can't wait** comes up in 30% of fights, but **holding one more round barely helps**
  (+0 to 3 points for every plan): by the last round whoever is still outside is mostly down with
  nobody free to carry them. The call needs a hold worth taking (spec list A item 9).
- **Also new:** `boardUnderFire` comes up in 67% of fights (boarders are in the open), too often for
  a dilemma; both cautious and committed risk do badly in holdExtract (46-47%); downs are high for
  every plan but `mixed` and attack (0.6-0.8 a fight), so holdExtract may now be too hard overall.

**Pass 5b (2026-11-11): the carrier is the boarder with the best cool** (owner; was whoever took a
door slot first, often the most hurt), and an order to protect a downed teammate at the van means
carry them. Results move by a point or two (`docs/sims/step0-2026-11-11-pips-contested.md`
regenerated): `mixed` 68%, `hold` 66-67% (twice the downs), attack 58% falling to 26% at D3; no
universal plan (23% at most); adapting clearly pays in 22% of cells; still neither verdict. A runner
left behind is counted as missing and badly hurt, not dead.

## 13. Summary of the BATTLE keys

```js
BATTLE = {
  endurancePerPip: 2, patchHeal: 2, lightWoundPips: 1,   // pips = floor(endurance / 2), at least 1
  // shots by kind: ENEMY_HIT = { hired: 1, drone: 1, corp: 2, enforcer: 2 }
  doorSlots: 2, boardStep: -4, carryStep: 2, vanWait: 4, holdHeat: 1,   // contested boarding (pass 5)
  hit: 1, strongHit: 2, strongMargin: 10, strongMarginByDamage: { 2: 12, 3: 10, 4: 8, 5: 6 },
  absorb: { none: 0, street: 1, pro: 2 }, droneAbsorb: 1,          // ap ignores absorb
  cover: { open: 0, half: 2, full: 4 }, startCover: 'half', hunkerStep: 4,
  aimStep: 2, aimFloor: 0.1, aimCeil: 0.9,
  attackStep: -2, talkStep: 2, jamStep: 0, patchStep: 0, stabiliseStep: 2, boardStep: 0, overwatchStep: -1,
  targetFocus: 0.5, protectFocus: 0.75,
  lightBelow: 0.5, seriousBelow: 0.25,                             // 0 pips = critical
  partingShotFloor: 1,
  retreat: { heat: 1, rep: 2 }, press: { alert: 1, heat: 1 },
  risk: { cautious: { pullAt: 'half', press: false }, steady: { pullAt: 1, press: false }, committed: { pullAt: 0, press: true } },
  maxExtraEnemies: 2, vanRoundHeat: 1,
  oddsRuns: 120,
};
FIGHTS.holdHack.deadline = 7;  FIGHTS.holdExtract.deadline = 7;  FIGHTS.holdExtract.vanRound = 3;
CLOCKS = { alarm: { startsAt: 5, tickPerRound: 1, extraTick: 'alarm', onZero: 'addEnemy', resetTo: 3 },
           pressure: { arriveRounds: [3, 5, 7] } };
```
