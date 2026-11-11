# Battle rework: threats, goals and orders (consolidated spec)

Status: **design only, not built** (2026-11-10). This file merges the owner's prototype brief
("Threats, goals and orders"), amendment v2 (the orders layer), the amendment "Battle rework:
threats, goals and orders" (suppression removed, shield, interruptible work), and the clarifications
agreed in the 2026-11-10 session. Where they conflicted, the later one wins; the review notes that
led here are summarised in section 26.

**Do not treat this as permission to invent missing rules during implementation.** Everything
marked **OPEN** is the owner's call (section 25), and the implementation gate (section 24) must be
met before coding starts.

---

## 0. Purpose

Fights today are a damage race: identical guards, killing is both offence and defence, and "shoot
the most hurt" is nearly always right. The rework turns a fight into a **triage problem under
orders**:

- each round there are more visible threats than runners can answer;
- the player commands the crew (responsibilities, priorities, risk), not individual attacks;
- one resolver runs the crew whether the player is watching or not;
- Take Command = editing orders at round boundaries.

Prototype scope: two fight types (`holdHack`, `holdExtract`), three enemy kinds (`hired`, `corp`,
`drone`).

The prototype must establish:

1. Does adapting the plan improve outcomes?
2. Does protecting or supporting the crew sometimes beat attacking?
3. Can players understand and trust how their orders were carried out?

Removing suppression does **not** by itself make protection competitive with attacking. That is
what the prototype has to show.

## 1. Before you start

- Read `CODEMAP.md`; `DESIGN.md` (battles, command fights, raids); `core/battle.js`,
  `core/runbattle.js`, `core/fightspots.js`, `core/autorun.js`, `core/mission.js` (fight start and
  end, call-ins), `data/battle.js`, `data/gear.js`, `data/incidents.js`; then every file you change.
- Meet the implementation gate (section 24) first: the numbers sheet, the validation gate and the
  open decisions are settled before Step 0.
- **Step 0, paper prototype:** play about 10 fights (5 holdHack, 5 holdExtract) with cards, pips and
  a d20, using these rules and the numbers sheet. Record the findings as a decision-log row before
  coding. Adjust numbers in data only.

## 2. Rules that stay true

- Roll rule: `d20 + stat >= 10 + difficulty`.
- Shown risk equals used risk: previews, chances, "if nothing" and the planning read call the same
  functions as the round.
- Seeded RNG through the existing battle streams. No `Math.random`. `state.rngCounter` behaviour
  unchanged from today's battle code.
- **Death only follows a risk the player accepted and was shown** (owner, 2026-11-11; supersedes
  "death only after a player choice" for the new engine): pushing on at death's door (`fightOn` ->
  `am.untreated`) as today, or the **committed** risk level, which keeps fighting with someone down
  (section 10a). Cautious and steady crews extract at a critical, as today. Pull back is always
  available, at every decision point, including call-ins.
- Layering: core is pure; all wording lives in data (`BATTLE_TEXT`, `DILEMMAS`); the UI reads views
  only. Phone-first (360px), 44px taps, no hover-only information.
- State-shape change: bump `SAVE_VERSION`, add a migration and a test, add a DESIGN.md row
  (supersede, never rewrite), update CHANGELOG. Never loosen tests.
- Strategic heat unchanged; no in-fight heat track.

## 3. Terms

- **Endurance:** a runner's physical attribute (1-20), the source of their pips (section 10a).
- **Pips:** individual health for runners and enemies, small integers. Triggers use pip counts
  (`pipsAtMost: 1`); risk thresholds are defined in pips (section 10).
- **Threat:** what an enemy will do this round, drawn and shown before orders resolve, with **its
  chance and its effect if unanswered**. Effects that are guaranteed are marked as guaranteed.
- **Duty:** a runner's standing responsibility (section 4).
- **Action:** the concrete thing the resolver picks from a duty this round.
- **Response:** an action aimed at a threat (shield a shot, jam a call, attack its source).
- **Reservation:** a response or planned damage already committed this round (section 14). A
  reservation is not a success: rolls can still fail.
- **Dilemma:** an authored situation with explicit conditions that can pause an unwatched fight as a
  call-in (section 16).
- **friendlyReinforce / enemyReinforce:** separate flags (can we send help / can enemy backup arrive).

## 4. Duties

Six duties. **Suppression is removed** (duty, action, priorities, defaults, gear references and
threat-answer entries), and nothing replaces it as a generic "cancel attack" action.

| Duty | Responsibility | Candidate actions |
| --- | --- | --- |
| Attack | Damage or remove an enemy (internal id `drop` may stay) | attack |
| Protect | Shield a designated teammate from an incoming shot | shield; else patch the target (if able) |
| Support | Treat injuries, stabilise where permitted, jam radio threats, use equipment | stabilise, patch, jam, specials |
| Hold | Reduce personal exposure | hunker, move (where the site allows) |
| Push | Work the current objective (hack, boarding) | work, board |
| Withdraw | Disengage under the fight's safety and extraction rules | withdraw |

**Talk is out of the prototype** (owner, 2026-11-10).

## 5. Incoming shots, cover and hunker

An `aim` threat shows:

- its target;
- its hit chance under current conditions;
- its damage if it hits;
- how the planned response changes that exposure (shield, hunker, a reserved attack on its source).

Rules:

- **Cover reduces the chance of being hit. It never grants immunity.**
- **Hunker** further reduces the runner's own exposure for the round and uses their ordinary action.
  It does not cancel the shot.
- **Flank** removes the target's cover benefit, at the published point in the round (section 15).
  Moving can restore or change position where the site allows it.
- The incoming-shot formula is fixed before Step 0 (numbers sheet). Previews and resolution use the
  same function. Today's `guardHitChance` (the fight's base and the guard step against the runner's
  cool, cover, hunker and the lights) is the starting shape.

## 6. Protect and shield

The protective action is named **shield** (the brief's `cover` action), so it can't be confused with
positional cover.

- Shield redirects **one** eligible incoming shot from the protected teammate to the protector.
- Taking the shielding position is certain when legal.
- The redirected shot then resolves against the **protector's** cover and armour. It is not erased,
  and the protector is not guaranteed to avoid damage.
- Shield uses the protector's ordinary action.
- The preview names which shot is redirected and the protector's resulting exposure.
- Shield can reduce damage actually taken (better cover, unused armour on the protector) and keeps a
  nearly-down runner standing, which keeps their future actions.
- The resolver never silently swaps in an attack because killing the enemy might work better.
- When no useful protection is available, the order's fallback runs (section 13).

Protection is expected to be most valuable when someone must work or board instead of defending
themselves. Protect-heavy plans don't need to be best in both encounters.

## 7. Attack, enemy durability and planned damage

- Attacking is the route to permanent removal, but must not be better than protection or objective
  work everywhere. It must not be made a bad choice just to show variety.
- **No focus-fire bonus** in the prototype.
- Weak enemies may legitimately go down fast; tougher enemies need more commitment.
- **Planned damage is reserved separately from threat responses.** An attack on a 2-pip enemy for 1
  pip leaves that enemy's shot fully in play: the resolver must not treat it as cancelled.
- Removal is shown as **conditional** on the required attacks succeeding ("Rook attacks guard 2; if
  it lands, guard 2 is down before it shoots"). An enemy's threat is never described as certainly
  cancelled before the removal has happened.
- When planning, an attack counts as its normal damage (1 pip). A strong hit's extra pip is a bonus
  if it lands; the plan never assumes it.
- Armoured enemies need armour piercing to take damage (`ap` gear tag), as the numbers sheet sets.

**Owner's call (2026-11-10):** once the attacks already planned on an enemy cover its remaining
pips (and armour), later attackers skip it. No doubling up to raise the odds.

Tune against the question: **can protecting the specialist long enough to finish be better than
eliminating every enemy first?**

## 8. Objective work

**Hack (holdHack):**

- Working uses the technician's ordinary action and gives **one guaranteed progress** for that
  round, provided the technician is still standing and still on the job when the round's resolution
  ends. A technician who works and then goes down to that round's shots makes no progress that round.
- Any other ordinary action (jam, attack, shield, hold) means no progress from them that round.
  Progress already made is kept unless the encounter says otherwise.
- The technician goes back to work when their orders return them to the objective.
- "Hold the connection for four rounds" means four rounds of actual work, not four rounds passing.

The hack's uncertainty is whether the crew can protect the technician and afford uninterrupted work,
not a failure roll on the work itself.

**Boarding (holdExtract stage 2): contested (owner, 2026-11-11).** Each runner boards for
themselves: a cool roll at `boardStep`, and at most `doorSlots` runners a round (the most hurt get the
slots first). A runner making for the van is **in the open** that round, and the shots at them are
shown that way. On a success they are in the van (out of the fight, safe).

**Carrying the wounded (owner, 2026-11-11).** While boarding, a downed runner doesn't end the fight:
someone goes back for them.

- **Who:** by default the boarder with the **best cool** (ties: lowest id), one carrier per downed
  runner. Or the player orders it: **protect a downed teammate** at the van means carry them, so
  going back for someone is a choice the player can make and see in the preview ("Rook goes back for
  Vex: 65%, in the open").
- **The roll:** cool, `carryStep` harder than boarding alone; it uses one door slot. The carrier is
  in the open that round. On a success, and if the carrier isn't downed by that round's shots, both
  are in the van; on a failure both are still outside and can try again next round.
- A downed runner isn't shot again while they wait. A medic can't get them back on their feet at the
  van; carrying them is the way out.
- **Pulling out once the van is there** means making for it (the first door slot), not walking off
  on foot.
- **Nobody abandons a downed runner while the van is there:** if nobody is left outside to carry
  them, the runner in the van with the best cool climbs back out (in the open) to go for them. Only
  the van leaving, or nobody able in the van, leaves them behind.

**Left behind (owner, 2026-11-11, extended the same day).** A runner left behind, standing or down,
is **missing for 7 days**, and the player has three ways through it, shown on the runner's card with
their odds:

- **Go and get them:** a **rescue job** appears on the board within a day (a holdExtract-style fight
  at the place they were left; slice 4). Success brings them back with the injury they had; failure
  leaves them missing, the clock still running.
- **Pay to get them back:** a ransom through the fixer (proposal: 3 weeks of their wage); they're
  back the next day with a light injury.
- **Wait:** at the end of the 7 days they come back with a **serious injury**, or, with a small
  chance shown on the card (proposal: 10%), they don't come back. That is a death the player was shown
  and could have prevented.

**On committed only**, a runner left behind *while down* may not make it at all (`leftDownDeath`,
10%, at the moment the van goes); the van call-in shows it ("Leave Vex: missing, or worse").
Hands-off, the risk level answers the van call: cautious and steady hold the van for a downed
teammate; committed lets it go on time.

**Standby and overwatch at the van (owner's go-ahead to test, 2026-11-11; simulated in Step 0
pass 6):**

- **Standby rides with the van** (if the job has one and they haven't already come in). When the van
  pulls in, they are at the door: **one more door slot**, and they can go out to **carry** a downed
  runner with their own cool roll, in the open like anyone else. If they go down, they are outside
  too. Their place in the plan becomes "standby / at the van" on holdExtract jobs.
- **Overwatch covers the door:** one attack a round (the owner's call), with uses as today (rifle 2,
  drone 3), aimed first at the enemy whose shot threatens a runner in the open (highest shown chance
  x pips): the boarders and carriers. Not a cancel: it can miss, and removal is shown as conditional.
  A rifle needs an outdoor site (as today); a drone works anywhere.
- **The driver** stays in the van (the early van, `vanRound`); a later idea is the driver bringing
  the van closer as a special (fewer rounds in the open).

**The van can't wait (owner, 2026-11-11).** The van waits `vanWait` rounds after it pulls in. In its
last round, with anyone still outside (standing or down), the call-in `vanCantWait` comes: **go on
time** (whoever is outside is left behind) or **hold the van two more rounds for +1 heat** (owner,
2026-11-11; superseded: one round, +1 heat and one more enemy, which barely helped). Hands-off, the
crew carries on: the van goes on time. **Three door slots** a round (was two). Leaving before the van arrives is
still a retreat.

## 9. Jamming

- **Anyone carrying a jammer may try to jam, using their tech stat.** A tech specialist is better
  through their stat, not by exclusive permission.
- A jam answers `backup` and `alarm` threats (and takes a drone out where its kind says
  `jamTakesOut`), on a roll.
- Bringing a technician gives no radio cover while they are working: a technician who jams makes no
  hack progress that round.
- The plan screen shows who can jam and whether jamming interrupts objective progress.

## 10. Withdrawal, safety and risk

- An **ordinary runner** may disengage on their own while the crew carries on. Their actions and
  abilities leave the fight with them.
- If the **essential specialist** withdraws from holdHack, the crew abandons the objective and
  extracts.
- A runner **going down in an unwatched fight** means the crew extracts on cautious and steady. On
  **committed** the crew fights on, and the downed runner can bleed out (section 10a): the one
  setting where a death can happen without a call-in, and the risk picker says so. In a watched or
  commanded fight, death's door is the call-in it is today.
- Death is otherwise only through an explicit player choice (pushing on, ordering a withdrawal by
  hand).
- The protected specialist obeys the safety rules: protection orders never override withdrawal
  thresholds.
- Risk is crew-wide: `cautious`, `steady`, `committed`. Thresholds are **defined in pips** so they
  behave differently on the small pip pools (with shares, "steady" at 0.25 never triggers on a
  3-pip runner). The UI shows each runner's threshold.
- `press` (push past at the fight deadline) stays a risk-level property.

**Withdrawing alone (owner, 2026-11-10, narrowed 2026-11-11):** a runner withdrawing alone still
takes the shots aimed at them that round and can be taken below 1 pip. **They die only if the player
ordered that withdrawal by hand**; a runner pulled out by the risk setting who is downed on the way
goes to death's door like anyone else. This keeps "death only after a player choice" (section 2).
(The first version, where any withdrawer could die, made cautious the deadliest risk level.)
**Risk thresholds (2026-11-11):** cautious pulls out at half their pips (rounded up), steady at 2 or
fewer, committed never.

## 10a. Endurance (the physical attribute, 2026-11-11)

- **One physical attribute, endurance (1-20)**, visible on the runner's page. It replaces the
  brief's cool threshold (`toughCool`), which counted cool twice (cool already lowers the chance of
  being hit) and, as an absolute number on a fight scale that rises with the work, ended up giving
  everyone the extra pip at threat 3. It also replaces the muscle role's pip: the role is a job, the
  body is endurance (muscle recruits roll high endurance instead).
- **In fights (owner, 2026-11-11): one pip for every two points of endurance**, rounded down (at
  least 1), plus trait bonuses, less a light injury. So endurance 8 = 4 pips, 11 = 5, 14 = 7, 18 = 9:
  every two points shows. Endurance is read against itself, not the fight's difficulty: it is the
  person, not the job. (Superseded first proposal: 3 pips, +1 at 13, +2 at 17.)
- **The bigger pools need bigger hits, varied by enemy (owner, 2026-11-11):** each kind's shot
  takes 1 or 2 pips, and 2 is the most any shot does. Prototype: hired and drones 1, corp security 2,
  and a new **enforcer** (a hired heavy: 2 pips, a 2-pip shot) in about one in three docks slots.
  Shields go to the worst shot first (shown chance x pips). Four enemies at the start. (At 1 pip a
  shot everywhere, 5-7 pips made fights too easy; at 2 everywhere, the `heavy` profile, it worked but
  with no variety.) Still open: a
  light injury's cost (-1 or -2 pips), and the risk thresholds (steady at 1 pip is one shot from down
  when shots take 2).
- **Outside fights (a later slice; numbers OPEN):** how fast fatigue builds and recovers, how fast
  injuries heal, holding up on multi-day away work, and decline with age, so it decides enough to
  pass the stat-usage rule (`drafts/PLAN-stat-usage.md`).
- **Strength and speed are traits, not attributes.** Proposals: *Strong* (a shield also gives the
  protector +1 absorb), *Quick* (+1 to boarding; can move and act in the same round), *Iron lungs*
  (fatigue builds slower on away jobs). Speed gets a second look as an attribute if the on-foot
  escape is built and movement decides fights.
- **A stat like the others (owner, 2026-11-11):** endurance is the eighth stat on the 1-20 scale. It
  is generated, grows and declines with age exactly as the others do; a solid muscle has 12-13, the
  best in the world 19-20. For other roles it is an off-stat (about 5 fresh, about 8 grown), so
  **pips have a floor of 3** (proposal, Step 0 below): endurance 6 or less = 3 pips, then one pip per
  two points (8 = 4, 12-13 = 6, 19-20 = 9-10).
- **Difficulty follows enemy count, not pips:** with this scale, four enemies at the start was too
  hard for grown crews (defaults 69% / 66%); **three** gives grown crews 88% / 78% and fresh crews
  77% / 69% (numbers sheet, endurance check). The real code keeps `COUNT_BY_THREAT` (2, 2, 3, 3, 4)
  and Step 0's four was for threat 3-4 work with stronger bodies.
- **The hidden rating** counts endurance like any stat (main plus the best two others), so a muscle's
  endurance can lift it. **The Anchor's Book is unaffected:** it never reads stats (fame, form, age
  and a bias only).
- The v61 migration gives every runner (crew, free names, rival tongs' runners) a seeded endurance,
  generated the way their other stats were; no existing stat changes.

## 10b. Bleeding out (owner, 2026-11-11)

Death should be possible without a decision in the moment, but rare and always from a risk the
player accepted and was shown.

- **Only on committed** (or after pushing on by hand). Cautious and steady pull back as soon as
  someone goes down, so a hands-off crew on those settings never loses a runner.
- **Bleeding:** a downed runner who isn't stabilised, carried into the van, or out of the fight
  starts bleeding from the second round after they went down (`bleedGrace: 2`): each round after
  that they die with `bleedChance` (8%). Stabilising stops it: a medic's medical roll at
  `stabiliseStep` (+2), and **a medic stabilises a bleeding teammate before anything else**, whatever
  their duty (today's `actionFor` does the same).
- **Left behind while down** on committed: `leftDownDeath` (10%), shown on the van call-in.
- **The medic's aura (owner, 2026-11-11; version C of three tested):** while a medic is standing in
  the fight, at the end of each round the most-hurt standing runner regains 1 pip (ties: lowest
  id), and **downed teammates don't bleed**. It's always on, whatever the medic's orders, and costs
  no action; the medic's own action still goes on their duty (and stabilising first). The round
  screen shows it ("Lotus keeps Vex going: +1"). It stops when the medic is down, out or in the van.
  Rejected: every runner +1 a round (version A: fights get easy and it plays itself) and a field
  station that works only while the medic stays back (version B: a decision, but too small to
  matter, and medic crews still didn't die less).
- **Shown = used:** the planning read shows the chance of a death ("Chance of losing someone: about
  4%") from the same rounds the fight plays; the risk picker says "Committed: fights on with someone
  down; can cost a life".
- **Step 0 pass 8** (`docs/sims/step0-2026-11-11-pips-bleed.md`): cautious and steady, no deaths in
  either fight; committed, about one death in 14 holdExtract fights and almost none in holdHack (one
  in about 1,000), so about one in 27 committed fights across both, the target. Committed wins more
  (holdHack 73% against 63% on steady), so it is a real trade.
- **What changes in the project when this is built (slice 1):** the design rule in `CLAUDE.md`
  ("Death only follows a choice the player made") becomes "death only follows a risk the player
  accepted and was shown"; the tests that encode "no death without push on" become "no death on
  cautious or steady without push on, and every death follows push on, a hand-ordered withdrawal or
  committed risk", with a test that the shown chance of a death equals the played one. Tests are
  updated, never loosened, and the change is logged.

## 11. Fight types, stages and clocks

```js
FIGHTS = {
  holdHack: {
    goal: 'work', work: 4,                 // rounds of actual work by the protected specialist
    protect: 'role:tech', failIf: 'protectedDown|protectedWithdrawn',
    deadline: n,                           // OPEN: overall round limit
    clock: 'alarm', friendlyReinforce: true, enemyReinforce: true,
  },
  holdExtract: {
    goal: 'hold+board',
    stages: [ { hold: 'vanArrival', vanRound: 3 },        // driver skill may shift by 1 (OPEN: rule)
              { board: 'each', boardStat: 'cool', doorSlots: 2, vanWait: 4 } ],   // contested (section 8)
    deadline: null,                        // the van leaving is the deadline
    clock: 'pressure', friendlyReinforce: true, enemyReinforce: true,
  },
};
```

- Stages are counted from 0 in data (`stage: 0` hold, `stage: 1` board) and called "hold for the
  van" and "board" in text.
- **holdExtract needs the van.** Leaving before it arrives is a retreat, never a shortcut to a
  successful extraction. The on-foot escape is deferred.
- The **driver special `vanRound`** brings the van **one round earlier** than scheduled. It never
  summons it at once. **OPEN:** its cost (the driver's action that round, or exposing the van), or
  whether the crew simply fires it on its own; a special with no cost is not a decision.
- **The fight deadline is separate from escalation clocks.** At the deadline: call-in, push past
  (alert and heat cost; `press`) or pull back (parting shots, never below 1 pip).
- Escalation clocks (`CLOCKS.alarm`, `CLOCKS.pressure`): each clock's effect, reset behaviour and
  limit are fixed before Step 0 (**OPEN**, numbers sheet).
- Jobs and incidents name a fight type. **Shortlist (2026-11-11, for the owner to pick 2-3 each):**
  - **holdHack** (keep the tech working): **Office Data Pull** (`data_pull`, Glass Heights, threat
    3, crew 3: copy the offline payroll), **Data Scrub** (`data_scrub`, Glass Heights, threat 2, crew
    2: take the chip, wipe the drive; one protector only), **Quiet Hours** (`quiet_hours`, the Docks,
    threat 3: pull the voice-logger cartridge before the reset; hired and enforcers, not corp).
    Also possible: The Flat Doesn't Exist (the Basin, threat 3: clear the listening gear); Penthouse
    Heist (threat 5, too high for the prototype).
  - **holdExtract** (hold for the van, then board): **Warehouse Lift** (`warehouse`, the Docks,
    threat 4, crew 4: take the crates before they ship), **Protection Run** (`protection`, the Docks,
    threat 3: the herbalist's van through Red Lantern streets), **Kidnap Rescue** (`kidnap`, Old Town,
    threat 4: get the accountant out to the van; Old Town needs an enemy list). Also possible: Exit
    Interview (Glass Heights, threat 4: walk a clerk out; corp enemies), Borrowed Glory (the Basin:
    the horse box is the van), Quarter to Two (the Docks: a boat, not a van).

## 12. Orders

```js
am.battle.orders = {
  [opId]: {
    duty: 'attack'|'protect'|'support'|'hold'|'push'|'withdraw',
    target: opId | enemyN | 'goal' | null,
    priority: [ ... ],                    // tie-breaks within the duty (OPEN: the word list)
    fallback: { duty, target } | null,
    special: { kind, when: TRIGGER } | null,
    byStage: { [stage]: { duty, target, priority, fallback } } | null, // stage-aware orders
  },
};
am.battle.risk = { level: 'cautious'|'steady'|'committed' };
```

- **Stage-aware orders:** in holdExtract the crew switches from holding to boarding at the stage
  change without manual intervention. The preview explains the change and each runner's new
  intended action.
- **Target selection when the target is null:** protect -> the protected runner, else the lowest
  pips (ties: lowest opId); push -> goal; attack -> the enemy whose threat targets the lowest-pips
  runner (ties: lowest n).
- **Priority words:** the brief's list (`windup`, `protected`, `backup`, `low`, `push`) assumed
  suppression and a later threat. **OPEN:** the prototype's list. Proposal: `protected` (threats on
  the protected runner), `radio` (sources of backup and alarm), `low` (the lowest-pips runner),
  `exposed` (the highest shown hit chance).
- **Defaults** are crew-made at launch, visible and editable in the plan, never hidden optimal play:
  - **holdHack (2026-11-11):** the technician works; the **two** runners with the most pips plus
    armour (ties: lowest id) protect the technician (fallback attack); everyone else supports if a
    medic, or carries a jammer with tech at least their combat, else attacks (fallback protect the
    technician).
  - **holdExtract (2026-11-11):** stage 0, the best protector covers the lowest-pips runner
    (fallback attack) and the rest attack, the lowest-pips runner's attackers first; stage 1, the
    protector covers (fallback board) and the rest board (fallback hold).
  - Step 0 pass 7: these defaults are the best or near-best plan in most settings (as good as the
    adapted plan in both encounters in 54% of cells).

## 13. Resolver

`core/battle.js resolveOrders(snapshot) -> actions`, per runner:

1. Down, pinned, or no legal action -> none.
2. Withdraw duty, or the risk threshold reached for this runner -> withdraw (overrides duties).
3. Assigned duty, if it is **useful** now.
4. Otherwise the fallback (its target, or the selection rule). Never retry an impossible action.
5. Otherwise hunker.

**Useful** means the action can materially contribute in the current state: shield needs an
eligible shot on the target; patch needs a hurt target and the means; jam needs a backup or alarm
threat and a jammer; attack needs a reachable enemy it can damage; push needs an objective that
takes progress this stage. "Hold" with no shot on the runner is not useful, so it reaches its
fallback.

Specials fire when their trigger holds at round start (by hand at a round boundary when commanded).

## 14. Coordination (deterministic)

- One shared round-start snapshot: shown threats with their chances and effects, pips, goal, clocks,
  spots. Never future deck draws or roll results.
- Fixed resolution order: protect duties first, then other duties, then by opId.
- **Reservations, not outcomes.** A response or planned damage, once committed, is reserved. A later
  runner whose action would only repeat a reserved response (a second shield on the same shot, a
  second jam on the same call, a second patch on the same runner) moves to the next item in its
  priority, then its fallback. Only where the rules make the repeat pointless; never re-plan
  strategy. Planned damage follows section 7 (and the OPEN item there).
- A failed roll does not release a reservation: the crew committed one response and it missed.
- Opening the command screen, building previews, generating "if nothing" text and checking dilemmas
  never draw combat RNG.

## 15. Round order

1. **Draw and reveal** each enemy's threat(s) from its deck (seeded per fight and round) and pick
   targets by the targeting rule. (`aim`/`flank` go to the protected runner if the fight says so;
   else the lowest-pips runner with chance `targetFocus`, else any standing runner; seeded.)
2. **Build intentions:** snapshot, `resolveOrders`, queue triggered specials. This is the preview.
3. **Check authored dilemmas** (unwatched fights) or wait for orders (commanded fights).
4. **Intervene or carry on.** Changed orders rebuild step 2.
5. **Resolve:** specials and moves -> overwatch -> runner actions in the fixed order -> reinforcements
   arrive -> threats resolve (shots against current cover and armour, flank, backup, alarm) ->
   enemies break or flee.
6. **Progress, escalation and end:** objective progress (hack work if the technician is still
   standing and on the job; boarding rolls), clocks, the deadline, end checks.

End: goal met -> win; all runners down -> loss (death rule applies); the essential specialist down or
withdrawn -> objective abandoned, extract; deadline -> call-in (push past or pull back).

## 16. Intervention, dilemmas and call-ins

- Commanded or watched job: edit orders and risk at any round boundary; fire specials by hand. No
  one-off per-runner actions in the prototype.
- Unwatched job: pauses **only** on authored dilemmas (and death's door, which extracts: section 10).
  - That battle waits while the call-in is open; the day and other jobs go on.
  - On expiry: carry on with current orders.
  - Before applying an answer, revalidate the dilemma; if it no longer holds, discard the answer and
    carry on.
  - Each dilemma fires at most once per unresolved situation (key = dilemma id + subject ids; resets
    only once the situation clears).
  - The one-per-job-per-day cap limits interruptions only. Withdraw, fallback and risk rules always
    run.
  - **OPEN:** the response window for same-day jobs (a same-day run plays its fight in one tick) and
    for away jobs (`dayDone`).
- Pacing guide: 2-4 meaningful decisions per commanded fight (not a quota).
- **Hooks for leadership and judgment (later slice, `drafts/PROPOSAL-leadership.md`):** on an
  unwatched fight, the crew lead settles some dilemmas before calling you (how many: leadership),
  and when a call-in expires the lead picks an option instead of "carry on" (which one: the lead's
  judgment, with a good lead choosing the option with the better shown outcome). The resolver stays
  deterministic and keeps following the orders; these only answer authored dilemmas. The prototype
  builds neither, but the call-in code leaves room for a lead's answer.
- **Dilemmas are authored.** Each has explicit conditions; the engine evaluates only those. It never
  infers "serious danger" or "exceptional risk". Situations worth authoring: a serious threat with no
  response assigned; an exceptional risk despite one; a real conflict between safety, progress and
  limited resources.
- A call-in shows: what changed; what the crew intends now; the trade-off of changing orders; **Carry
  on**; **Pull back** (added by the screen to every call-in, and checked by `validate.js`).
- Options change real orders and responsibilities. All authored text uses role or runner
  placeholders, never fixed names.

```js
DILEMMAS = {
  techUnderFire: {
    fight: ['holdHack'],
    when: { pipsAtMost: 1, of: 'protected', and: { threat: 'backup', responded: false } },
    changed: '{protected} is nearly down and a radio call is going out.',
    conflict: ['protect {protected}', 'stop the call'],
    options: [
      { label: 'Everyone on {protected}', ordersPatch: { all: { duty: 'protect', target: 'protected' } } },
      { label: 'Kill the radio',          ordersPatch: { bestAttacker: { duty: 'attack', target: 'backupSource' } } },
      { label: '{protected} jams it',     ordersPatch: { protected: { duty: 'support', target: 'backupSource' } } },
        // tries to stop the call; no hack progress this round
      { label: 'Carry on', ordersPatch: null },
    ],
  },
  vanCantWait: {                  // owner, 2026-11-11 (section 8)
    fight: ['holdExtract'],
    when: { stage: 1, vanLastRound: true, and: { outsideAtLeast: 1 } },
    changed: "The van can't wait. {outside} still outside.",
    conflict: ['go on time', 'hold one more round'],
    options: [
      { label: 'Go now',               ordersPatch: null, vanWait: 0 },   // whoever is outside is left behind
      { label: 'Hold one more round',  ordersPatch: null, vanWait: +1, cost: { heat: 1, addEnemy: 1 } },
      { label: 'Carry on', ordersPatch: null },                         // = go on time
    ],
  },
  boardUnderFire: {               // DROPPED 2026-11-11 (came up in two thirds of fights once boarders ran in the open; vanCantWait carries the decision)
    fight: ['holdExtract'],
    when: { stage: 1, enemiesUpAtLeast: 2, and: { hitChanceAtLeast: X, on: 'any' } },  // X: OPEN
    changed: 'The van is here. {exposed} is in the open and two of them are still shooting.',
    conflict: ['board now', 'clear them first'],
    options: [
      { label: 'Board now',            ordersPatch: { all: { duty: 'push' } } },
      { label: 'One more round',       ordersPatch: { exposed: { duty: 'hold' }, bestProtector: { duty: 'protect', target: 'exposed' }, others: { duty: 'attack' } } },
      { label: 'Carry on', ordersPatch: null },
    ],
  },
};
```

"Board now" means committing runners to boarding under fire, not everyone safely disappearing.

**OPEN:** the trigger grammar. The base `TRIGGER` is `{ threatsOn, min }`, `{ pipsAtMost, of }`,
`{ round }`; dilemmas also use `and`, `threat` + `responded`, `stage`, `enemiesUpAtLeast` and
`hitChanceAtLeast` + `on`. The `ordersPatch` selectors (`all`, `others`, `protected`, `exposed`,
`bestAttacker`, `bestProtector`, `backupSource`) need fixed definitions. Both are written down as a
grammar before Step 0.

## 17. Feed, "if nothing" and wording

- Every preview and feed line names the order behind the action: "Rook shields Switch (protecting
  Switch)", "Vex attacks corp 2 (attack, priority: radio)".
- "If nothing" is generated from current orders and shown threats, never authored: the intended
  actions and the exposure left. It never promises an uncertain outcome.
  Good: "Rook keeps shielding Switch. The radio call has no one on it."
  Not: "...backup arrives" (unless certain); not "...guard 2 won't shoot" (unless already down).
- All wording in `data/battle.js BATTLE_TEXT` and `data/dilemmas.js`.

## 18. Reinforcements (if friendlyReinforce)

"Send help" call-in option: choose standby or free runners. `arriveRound = current + 2` (district
distance later). They arrive with full pips and default orders (support, fallback protect). They
count as on the job (career, fatigue, pay share).

## 19. Data shapes

**The numbers in the blocks below are the first draft (2026-11-10) and are stale; the values to build
with are `drafts/NUMBERS-battle-orders.md` section 13 and section 30 here.** The shapes (fields,
objects, the battle object, the round result) still hold.

```js
// data/battle.js BATTLE (prototype keys)
BATTLE = {
  endurancePerPip: 2, enemyHit: 2, patchHeal: 2, lightWoundPips: 1,   // pips = floor(endurance / 2), at least 1
  hit: 1, strongHit: 2,                      // OPEN: when a hit is strong
  armourAbsorb: { light: 1, heavy: 2 },      // hits absorbed per fight; OPEN: against ap
  cover: { open: 0, half: 2, full: 4 }, startCover: 'half', hunkerStep: 4,
  attackStep: -4, jamStep: 0, pushStep: 0, patchStep: 0, overwatchStep: -1,
  targetFocus: 0.5,
  lightBelow: 0.5, seriousBelow: 0.25,       // pip share -> injury; down = critical as today (OPEN: confirm)
  partingShotFloor: 1,
  retreat: { heat: 1, rep: 2 }, press: { alert: 1, heat: 1 },
  risk: { cautious: { pullAt: 'half', press: false }, steady: { pullAt: 2, press: false },
          committed: { pullAtPips: 0, press: true } },
  oddsRuns: 120,
};
// maxPips = max(1, floor(endurance / endurancePerPip)) + trait bonuses - (light injury ? lightWoundPips : 0).
// Combat never changes max pips.

ENEMIES = {
  hired: { pips: 1, threats: 1, talk: -2, fleeBelow: 0.6, cover: 'half', deck: ['aim','aim','alarm'] },
  corp:  { pips: 2, threats: 1, talk: null, cover: 'half', deck: ['aim','backup','aim','flank'] },
  drone: { pips: 1, threats: 1, talk: null, armoured: true, cover: 'open', jamTakesOut: true, deck: ['aim','alarm'] },
  enforcer: { pips: 2, threats: 1, talk: null, cover: 'half', deck: ['aim','aim','flank'] },   // 2026-11-11, docks
};
// Shot damage by kind (owner, 2026-11-11; 2 is the most): hired 1, drone 1, corp 2, enforcer 2.
ENEMY_HIT = { hired: 1, drone: 1, corp: 2, enforcer: 2 };
// fleeBelow is side-wide (OPEN: confirm): when the standing share of that kind falls below it, the rest flee.
SITE_ENEMIES = { docks: ['hired','hired','enforcer'], heights: ['corp','drone'], /* ... */ };
COUNT_BY_THREAT = [0, 2, 2, 3, 3, 4];       // index = threat 1-5, capped by fight type

THREATS = {
  aim:    { target: 'runner', effect: { pips: 1 }, chance: 'incoming-shot formula',
            responses: ['shield', 'hunker', 'move', 'attack source'] },
  backup: { target: null, effect: { addEnemy: 1 }, responses: ['jam', 'attack source'] },  // needs enemyReinforce
  alarm:  { target: null, effect: { clock: 1 },    responses: ['jam', 'attack source'] },
  flank:  { target: 'runner', effect: { cover: 'open' }, responses: ['move', 'attack source'] },
};

ACTIONS = {
  attack: { stat: 'combat', diff: 'base + attackStep + enemy cover', pips: 1, armouredNeeds: 'ap' },
  shield: { sure: true, redirects: 'one aim on the target to self (resolves against own cover and armour)' },
  hunker: { sure: true, exposure: 'cover +1 step and hunkerStep this round' },
  move:   { sure: true, to: 'spot', restores: 'cover' },
  jam:    { stat: 'tech', needs: 'item:jammer', diff: 'base + jamStep', answers: ['backup','alarm'], drone: 'out' },
  patch:  { stat: 'medical', needs: 'role:medic|item:traumaKit', heals: 1, orStabilise: 'fightOn runner' },
  work:   { sure: true, progress: 1 },                       // hack (section 8)
  board:  { stat: 'byGoal', diff: 'base + pushStep' },        // boarding (section 8)
  withdraw: { sure: true },
};

SPECIALS = {   // once per fight; trigger or manual
  smoke:    { needs: 'item:smoke' },  // OPEN: was "cancel all aim"; proposal: everyone's cover +1 step this round
  stim:     { needs: 'item:stims', revives: 'down -> 1 pip' },
  vanRound: { role: 'driver', effect: 'van arrives one round earlier' },   // OPEN: cost
};

GEAR_TAGS = { ap: { pierce: true }, jammer: { enables: 'jam' }, smoke: { special: 'smoke' },
              stims: { special: 'stim' }, vest: { absorb: 'light' }, plate: { absorb: 'heavy' },
              baton: { attackNonLethal: true } };
// Tiers stay: a tier adds +1 chance per step, never a new rule.
// OPEN: how today's sidearms (damage, pierce, tiers) and armour (flat soak) map onto these tags,
// so gear the player already owns keeps a job.

CLOCKS = { alarm: { startsAt: 5, tickPerRound: 1, extraTick: 'alarm threat', onZero: 'addEnemy' },
           pressure: { everyRounds: 2, addEnemy: 1 } };   // OPEN: reset and limit for each
```

**Future-proofing (amendment v2; optional fields, all default off, unused in the prototype):**
enemies may carry `threats > 1`; `phases: [{ atPips, threats, deck, effect? }]`; `weakPoint: { every,
window, pipsPerHit, revealedBy? }` (rename `window` here or on the battle enemy, e.g. `weakOpen`, so
one name doesn't mean both a number and a flag); `escorts`, `protectsWith`; `boss: true` (pips above
6, shown as a bar with phase marks). The battle enemy gains `phase: 0` and `weakOpen: false`. A phase
check runs right after pips change; threats already shown still resolve as shown. Dilemmas may
trigger on `{ enemyPhase }`; goals may set `dropBonus`. Test: an enemy with phase or weak-point
fields but `boss: false` behaves exactly like one without.

**Battle object (`am.battle`, save v61):**

```js
am.battle = {
  engine: 2, type, stage: 0, round: 0, deadline,
  clocks: [{ kind, at }],
  goal: { kind, track, at, protect: opId|null, vanRound: n|null },
  enemies: [{ n, kind, pips, max, armoured, out, fled, cover, spot, phase: 0, weakOpen: false,
              threats: [{ id, kind, target, chance }] }],
  runners: [{ id, handle, role, pips, max, absorb, cover, spot, now,
              down, fightOn, stable, pinned, withdrawn, specialUsed, stats, gearTags }],
  orders: { [opId]: ORDER }, risk: { level },
  reserved: { responses: [], damage: { [enemyN]: n } },
  reinforce: [{ ids, arriveRound }] | null,
  overwatch: { id, handle, kit, value, left } | null,   // OPEN: what overwatch does now (proposal: one attack a round)
  wheels: { id, handle, value, notes } | null,
  spots, dilemmasFired: { [key]: true }, watched: bool,
};
```

**Round result:** `playRound(b, rng) -> { lines, actions: [{ opId, action, target, from:
'duty'|'priority'|'fallback'|'safety'|'special' }], unanswered: [{ threat, target }], defeated: [{ by,
enemy, how }], goalDelta, down, fled, withdrawn, heat }`. Each line names its order.

## 20. UI (phone, 360px)

**Plan screen:** fight type line ("Hack: 4 rounds of work. Keep {tech} working."), likely enemy kinds,
gaps ("No jammer: radio calls can only be stopped by attacking the caller"), who can jam and whether
it stops the hack, each runner's order (duty, target, per stage where it changes), their withdrawal
threshold, risk, specials.

**Round screen** (watched or commanded):

- goal track and clocks ("Hack ●●○○ · alarm 3 · deadline 6");
- enemies: kind word, pips, threat with target, chance and effect;
- runners: pips, current order, this round's intended action from the preview, their exposure;
- the "if nothing" line;
- buttons: Next round · Change orders · Specials · Pull back.

**Report:** one cause line ("No one had a jammer, so the radio call went out") and the full log with
rolls.

## 21. Planning read

`fightOdds(args, orders, risk)` runs `playRound` N times on fixed seeds with the given orders.
Returns `{ win, down, pulledBack, gaps }`. Cache key: type, enemy kinds and counts, runner pips,
absorb, stats, roles, gear tags, specials, overwatch, wheels, orders, risk. Same functions as the
round (shown = used).

## 22. Save, migration and what stays

- **Save v60 -> v61.** v60 is taken (the Anchor's Book, #124); the brief's "v59 -> v60" and the
  amendment's "migration v60" are corrected here. The same migration gives every runner (crew, free
  names, rival tongs' runners) a seeded endurance (section 10a); no existing stat changes.
- **Fights in progress at upgrade (proposal, owner to confirm):** tag them `engine: 1` and let them finish on the old code, which
  stays in the repo for raids anyway, instead of resolving them inside `save.js` at load (that would
  run combat in the storage layer and move `rngCounter`). New fights get `engine: 2`.
- Career `defeated` counts carry over. Saved standing orders already use `cautious`, `steady`,
  `committed` ids, which map straight onto risk levels.
- **Kept:** d20 rule, shown = used, seeded RNG, site spots, overwatch, call-ins, pull back with
  parting shots, death rule, pips left -> injury, strategic heat.
- **Replaced:** `guardsFor` and guard arrays -> `ENEMIES`; `actionFor` -> `resolveOrders`; damage
  numbers and flat soak -> pips and absorb; the fixed 3-round standoff -> fight deadline and clocks;
  per-runner action orders each round (command fights, slice 6c) -> the orders layer.
- **Removed:** suppression (duty, action, priorities, threat answers).
- The old raid fight (`core/raids.js`) stays on engine 1 until `defendHall` is built.
- The new sim is `scripts/sim-orders.mjs`; `scripts/sim-battles.mjs` keeps measuring engine 1.

## 23. Tests

- Death only after `fightOn`, a hand-ordered withdrawal, or committed risk (random orders, many
  seeds, both types); none on cautious or steady without `fightOn`. The shown chance of a death
  equals the played one.
- Pull back always possible; parting shots never below 1 pip.
- Shown = used: preview chances equal roll odds; `fightOdds` calls `playRound`.
- Determinism: same state + seed + orders -> same fight. Previews, "if nothing" and dilemma checks
  never move RNG. `rngCounter` behaviour unchanged.
- Resolver: precedence holds; never an impossible or useless action; fallback targets always
  defined; reservations stop pointless repeats; a failed roll keeps its reservation; an attack that
  doesn't cover an enemy's pips never marks its shot as answered; every action's feed line names its
  order.
- Shield: redirects exactly one shot; it resolves against the protector's cover and armour.
- Hunker never cancels a shot; cover never makes a shot impossible.
- Hack: progress only for rounds actually worked by a technician standing at the end of resolution;
  progress kept when interrupted.
- holdExtract: no successful extraction before the van; `vanRound` moves arrival by exactly one round.
- Withdrawal: an ordinary runner leaves alone; the specialist leaving ends holdHack's objective; a
  runner going down unwatched extracts the crew.
- Dilemmas: fire once per situation; evaluated only on their authored conditions; revalidated
  before applying; expire -> carry on; the per-day cap never blocks withdraw, fallback or risk;
  every call-in offers Pull back; no fixed names in authored text.
- Pips: the max-pips formula from endurance; absorb used up correctly.
- Endurance: every runner has one after migration, the same for the same save; cool no longer
  changes pips.
- Engine 1 fights in a v60 save finish unchanged after migration to v61.

## 24. Validation and the implementation gate

**Before coding:**

1. Reconcile the amendment with the full brief (this file).
2. Settle the numbers sheet and the open timing rules (section 25).
3. Verify repo-specific version, migration and compatibility claims (section 22).
4. Record the removal of suppression and the replacement of direct actions as design decisions
   (DESIGN.md rows, 2026-11-10).
5. Run the paper prototype, then the seeded sims.

**Sims (`scripts/sim-orders.mjs`).** Compare across both encounters, varied crews and fixed seeds:

- attack-only plans;
- hold-only plans;
- protection-heavy plans;
- support-heavy plans;
- encounter-adapted plans;
- one unchanged plan used in both encounters.

Measure objective success, downed runners and injuries, resources used (specials, consumables) and
extraction outcome.

Test several enemy-durability and exposure settings, not one tuned until a preferred answer wins.
The aim is different viable plans, not encounters built to demand a set answer: holding and boarding
should be able to beat clearing the opposition under some reasonable conditions, while attacking
stays useful under others. A toughness check: tough squads do better against aim-heavy fights but not
against backup and alarm (toughness must not replace responses).

**The gate.** Declared and recorded **before** the run, not chosen after seeing results:

- the crew groups, seeds, comparison plans and the durability/exposure settings;
- the acceptable differences (tolerances) for objective success, downed runners and resource use;
- how many settings and crew groups must show a benefit from adapting.

Outcome:

- **Rework** if one unchanged plan is effectively as successful, safe and economical as the adapted
  plans across both encounters and most of the tested crew groups.
- **Proceed to playtesting** if adapting gives repeatable, practically meaningful benefits without one
  universal plan dominating.
- One plan sometimes winning both encounters is not by itself a failure.
- Passing sims do not replace the playtest. Results and the declared targets go in CHANGELOG.

## 25. Open (owner) — superseded by section 30

Kept as the record of what was open and how it was answered; section 30 is what's settled.

First values and rule proposals: `drafts/NUMBERS-battle-orders.md`. Step 0 findings: its section
12. Updated 2026-11-11.

**Settled (owner, 2026-11-10 and 11):** planned damage that covers an enemy stops later attackers;
talk out; overwatch one attack a round; smoke = cover +1 step for everyone; the early van costs +1
heat; a runner withdrawing alone takes the shots aimed at them and can die (scope still open, A3);
endurance as the one physical attribute, with strength and speed as traits (section 10a).

**A. Step 0 (2026-11-11, after pass 7).** Settled: four enemies at the start, shots by kind, the
enforcer at the docks (about one slot in three); the defaults (section 12); the withdrawal rule and
risk thresholds (section 10); per-runner contested boarding, carrying, the van that can't wait
(section 8); the gate's bar at 7 points or 0.3 downs. Still open:

1. **Ending Step 0.** Pass 7 still gives neither verdict, and Claude recommends accepting that and
   moving on: the defaults are now good (as they should be for hands-off trust), so picking another
   fixed plan before the fight adds 4-5 points on average; but the sim compares fixed plans only and
   can't see mid-fight decisions (the van hold alone is worth 5-10 points). Re-run the gate on the
   real code in slice 3 with call-ins included, and judge adapting there and in the playtest.
2. **`techUnderFire`** never comes up (0-2% of fights). Proposal: the tech has two or more shots on
   them, or is at half pips or below with a radio call shown.
3. **Light injury:** -1 or -2 pips at the start of a fight. Proposal: -2 (one heavy shot's worth).
4. **Patch:** heals 1 or 2 pips. Step 0 used 1 from pass 4 on. Proposal: 1 (shots are 1 or 2 now).
5. **Confirm the rules Claude added in Step 0:** the muscle role's pip dropped for endurance;
   standby at the van (an extra door slot, a carrier); overwatch on the door (one attack a round, at
   whoever threatens a runner in the open: +6 to 13 points, strong for a 2-3 use kit); the runner in
   the van climbing back out for a downed teammate.
6. **Left behind:** days missing (proposal: 7, then back with a serious injury); rescue jobs later.
13. **Bleeding out** (section 10b): confirm the numbers (8% a round from the second round down;
   10% for a downed runner left behind on committed) and the target (about one death in 25-30
   committed fights). Most committed deaths happen at the van in holdExtract.
14. ~~Medic aura~~: settled, version C (section 10b). With it, committed loses a runner in about one
   in 39 fights (one in 19 holdExtract), a little under the 20-30 target; fine as is, or bleeding
   could rise to 10%.
7. **The sim's remaining assumptions** (top of each report): a jam takes out one drone; an alarm in
   holdExtract brings the next pressure arrival a round earlier; specials cost no action; no parting
   shots when the crew pulls back; the holdHack deadline fails the objective; sidearm aim bonuses
   left out. Proposal: keep the first four as rules, add a fail-forward "press" at the deadline later,
   and include aim bonuses in the real code.

**B. Before code** (they don't change a paper fight):

- the trigger grammar and `ordersPatch` selectors (section 16); the priority word list (section 12);
- the call-in response window for same-day and away jobs (section 16);
- the gear mapping from today's sidearms and armour (numbers sheet section 4, proposal);
- `fleeBelow` side-wide; down still counts as critical;
- tagging fights in progress `engine: 1` at upgrade (section 22);
- which 2-3 existing jobs use each fight type;
- endurance: generation by role (crew, free names, rivals), growth and age decline, its place on the
  runner's page, and whether the Anchor's Book and worth read it.

**C. After the playtest:**

- one-off per-runner actions; more fight types and enemy kinds; raids on the new engine
  (`defendHall`);
- endurance's off-fight uses (fatigue, healing, away jobs, age), with numbers;
- leadership and judgment (`drafts/PROPOSAL-leadership.md`, with the hooks in section 16);
- speed as an attribute, only if the on-foot escape is built and movement decides fights;
- `defeated` counts non-lethal attacks (recommended yes).

## 26. How this was reconciled (2026-11-10)

- **Suppression removed.** In the brief, attacking a 1-pip enemy was an easier roll than suppressing
  (attack -4 + half cover 2 against suppress 0) and removed every future threat, so suppression was
  dominated. Removing it removes that comparison only; it does not show attack and protect are
  balanced.
- **Shots got chances.** The brief's threats had certain effects and hunker cancelled aim for sure,
  so "everyone hold" answered every shot, and a runner's cover (and so flank, move and the site
  spots) did nothing. Now cover and hunker lower the hit chance; flank strips cover.
- **Focus fire dropped,** but the question it raised stays: planned damage is reserved separately and
  a partial attack never cancels a shot.
- **The technician can be interrupted,** and anyone with a jammer can jam, so jam is usable in
  holdHack at the cost of hack progress (the brief's protected tech took no action, so jam was never
  available there).
- **`vanRound`** brings the van one round earlier instead of ending the hold stage at once.
- **Stage-aware orders,** a separate deadline and clocks, a defined "useful" so `hold` reaches its
  fallback.
- **Withdrawal by role;** death's door unwatched extracts; risk in pips.
- **Dilemmas checked before resolution;** authored conditions only; `vanLate` replaced by
  `boardUnderFire`; the technician can jam in `techUnderFire`; placeholders, not names.
- **Save v61, engine tagging** instead of resolving fights at load; `sim-orders.mjs` beside the
  existing `sim-battles.mjs`.
- **Validation** has a gate declared before the run, over success, safety and resources, not win rate
  alone.

## 27. Later (not in the prototype)

Fight types: getOut, holdHelp, rescue (including getting back a runner left behind and taken), grab, ambush, boss, standoff, defendHall. Enemies: heavy,
enforcer, marksman, lieutenant, boss (phases, weak point, escorts). Threats: windup, pin, door.
Specials: suppressAll, bluff (each needs a design that isn't a generic cancel). Gear tags: shotgun,
smart, suppressor. Per-runner direct control, more duties, the on-foot escape, generic dilemma
detection, district-based arrival times.

## 28. Playtest (after code)

Play holdHack then holdExtract: once commanded, once fully hands-off with a dilemma.

- **Attribution:** can I explain how my crew and orders shaped the result?
- **Tension:** did I face a genuinely difficult decision?
- **Trust:** when I let it run, did the crew follow my intent reasonably, even when it lost?

## 29. Roadmap (2026-11-11) — superseded by `drafts/PLAN-battle-slices.md`

1. **Settle list A** (section 25), then **Step 0 again** (`scripts/sim-step0.mjs`), with the owner
   playing three or four of its fights by hand for feel. Repeat until the gate says proceed or
   rework. A decision row records the outcome.
2. **Settle list B.**
3. **Slice 1, the engine (save v61):** endurance on every runner (migration, recruits, free names,
   rivals, the runner's page); `data/battle.js` keys, `ENEMIES`, `THREATS`, `FIGHTS`, `CLOCKS`,
   `data/dilemmas.js`; the resolver, round, previews and `fightOdds` as engine 2; fights in progress
   stay engine 1; the tests in section 23. Wired to the two fight types on the chosen jobs only;
   every other fight and raids stay on engine 1.
4. **Slice 2, the screens:** plan screen orders, the round screen, call-ins and the report
   (section 20), phone first; screenshots and CHANGELOG.
5. **Slice 3, the sims on the real code:** `scripts/sim-orders.mjs` against the gate declared in
   section 24; results in CHANGELOG.
6. **Playtest** (section 28): attribution, tension, trust. Then decide list C's first items: per-runner
   actions, more fight types, moving more jobs and raids to engine 2, retiring engine 1.
7. **Attributes:** endurance's off-fight uses, then leadership and judgment as their own slice, then
   the stat-usage sim again for all three new attributes.

## 30. Settled for the build (2026-11-11)

Step 0 is **ended** (owner, 2026-11-11): its last verdict was neither, and the gate is re-run on the
real code with call-ins in slice 3 (section 24), then the playtest (section 28). Everything in list A
(section 25) is settled as follows; list B is settled except the wording, which the owner writes.

| Item | Settled |
| --- | --- |
| Jobs per fight type | **holdHack:** Office Data Pull (`data_pull`), Data Scrub (`data_scrub`), Quiet Hours (`quiet_hours`). **holdExtract:** Warehouse Lift (`warehouse`), Protection Run (`protection`). Kidnap Rescue waits for an Old Town enemy list. |
| Enemies | Four kinds: hired, corp, drone, enforcer; shots by kind (1 or 2 pips); count by threat (`COUNT_BY_THREAT` 2, 2, 3, 3, 4), the difficulty dial; Glass Heights corp and drones, the Docks hired and enforcers (about one slot in three). |
| Endurance and pips | Endurance is the eighth stat, like the others; pips = max(3, endurance / 2); a light injury starts a fight 2 pips down. |
| Endurance in recruits | Muscle's decent stats become **endurance and cool** (piloting drops to a low stat; drivers cover it). Every other role has endurance as a low stat. |
| Endurance in wages | It counts like any stat in `marketWage`, and the per-stat rate is scaled down so average wages stay where they are today. |
| Risk | Cautious pulls out at half their pips, steady at 2, committed never; committed fights on with someone down (bleeding, section 10b). |
| Bleeding out | 10% a round from the second round down (raised from 8% to land in the 20-30 target); a medic stabilises first; the medic's aura (C). |
| Patch | Heals 1 pip. |
| Withdrawal | Death on pulling out only when the player ordered it by hand. |
| `techUnderFire` | Comes up when the tech has two or more shots on them, or is at half pips or below with a radio call shown. |
| `vanCantWait` | Go on time, or hold two rounds for +1 heat; three door slots; per-runner boarding; carrying; climbing back out. |
| Standby and overwatch | Standby rides with the van (an extra door slot, a carrier). Overwatch covers the door, **one shot at the van** (it was strong); elsewhere one attack a round, uses as today. |
| Left behind | Missing 7 days: rescue job, ransom (3 weeks of their wage; back next day, light injury), or wait (serious injury, or a shown 10% chance they don't come back). Numbers confirmed by the owner. |
| Default orders | Section 12 (two protectors on the tech; one protector and attackers, then boarding). |
| Rules from the sim | A jam takes out one drone; an alarm in holdExtract brings the next pressure arrival a round earlier; specials cost no action; no parting shots when the whole crew pulls back; sidearm aim bonuses count; the holdHack deadline fails the objective. |
| Call-in window | Away jobs: until the end of that day. Same-day jobs: the fight waits for the answer; if the day ends first, the crew carries on with its orders. Hands-off risk answers the van call. |
| Fights in progress at upgrade | Tagged `engine: 1` and finished on the old code. |
| Plumbing | Claude writes the trigger grammar, the `ordersPatch` selectors, the priority words (`protected`, `radio`, `low`, `exposed`) and side-wide fleeing into the code and this spec; the owner skims them. |
| Wording | **The owner writes it** (2026-11-11): for any wording-heavy task (feed lines, "if nothing" phrasing, dilemma and call-in text, the risk picker, the report's cause lines, the missing card, ransom and rescue job), the building session prepares a writing brief (ids, slots, counts, house style) in `drafts/writing-tasks.md` and **pauses** for the owner, using placeholder keys meanwhile. |

The build order and the handoff for the next session: `drafts/PLAN-battle-slices.md` and
`drafts/HANDOFF-battle-rework.md`.

