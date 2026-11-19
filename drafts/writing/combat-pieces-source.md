# Combat pieces: source for the writing batch (2026-11-19)

Paste the `WORLD.md` context block first, then the PROMPT below, then this whole file.
Everything under SOURCE is what the game does today; the wording in it is Claude's draft and yours to replace.
Files: `src/data/builds.js` (names, `desc`, `offer`), `src/data/fightText.js` (`view.status.*`, the log keys), `src/core/fight.js VOCAB` (the rules).

## PROMPT

```
TASK: Rewrite the wording for four combat "pieces" and the statuses they put on enemies, so the
names, the offers, the card text and the fight log all use the same words. Keep the meaning of
every rule exactly as SOURCE states it: do not add a duration, a target, a stack or an effect.
If a line you want would promise something the rules do not do, leave it out and say so.

WRITE, for each piece (Incendiary Rounds / Fire, Spotter's Eye / Mark, Breacher / Breach, Rout / Fear):
- name (keep or rename; one to three words) and log word (one word)
- desc: one or two sentences, plain, says exactly what it does (shown when the player taps the piece)
- offer: one sentence in Joss's voice, with {op}, that hints at the piece without stating numbers
For each STATUS (burning, marked, exposed, shaken; the same four a card shows):
- label (a few words; burning keeps {hp}) and the tap-open line(s), keeping every variant listed
- log lines: 3 variants per key, same slots as the originals (burn, burnTick, burnOut, mark, expose, shake)
For the NEW-FIGHT SCREENS around them (only the keys listed in SOURCE): rewrite or confirm.

RULES: one sentence per line, under ~18 words, gender-neutral, game voice, present tense in the log.
Lantern Bay only: no new factions, places or tech; nothing supernatural. The crew only sees what
happens: "Burning" is a thing they see, not a reason. Keep every {slot} a line already has, and
do not add a slot. A status is never described as stacking, renewing or spreading unless SOURCE says so.

FORMAT (exactly):
piece | <id> | name: <...> | word: <...> | desc: <...> | offer: <...>
status | <key> | <the English the key is, with its slots>
log | <key> | <variant 1> | <variant 2> | <variant 3>
note | <anything in SOURCE you could not honour, or a rule you think reads oddly>
```

## SOURCE: the four pieces (`src/data/builds.js`)

All four take the **payload slot** (a runner has one move and one payload), so they combine across two runners.
Current draft names / words / texts:

| id | name | log word | needs | desc (now) | offer (now) |
| --- | --- | --- | --- | --- | --- |
| incendiary | Incendiary Rounds | Fire | combat 10 | A hit, or a shot that only cracks armour, sets the target burning: 10 HP at each round's end for two rounds. Machines burn too. It does not spread or stack. | {op} could load Incendiary Rounds. Even a shot the armour stops leaves them burning. |
| spotter | Spotter's Eye | Mark | cool 10 | Whatever this runner hits or cracks is marked for the crew. A mark does nothing by itself; other pieces read it. | {op} has a spotter's eye. Whatever they hit, the rest of the crew will know about. |
| breacher | Breacher | Breach | tech 10 | Cracking one plate shows how the next one opens: another enemy of the same group is exposed, and its next hit taken ignores its armour and deals 10 HP more. A hit on a marked enemy does the same. | {op} reads armour like a lock. One cracked plate and they know how the rest come apart. |
| rout | Rout | Fear | cool 10 | Each kill shakes another enemy of the same group: shaken enemies count as already gone when their group decides whether to run. A marked kill shakes one more. | {op} could make every drop count twice. Put one down and the next starts looking for the exit. |

(The two older payloads and the one move, for consistent terms: Cytotoxic Vector / "Vector" and Contagion Vector / "Contagion", infection ticks 10 HP a round; the move is Ricochet, once a fight, one round through up to three targets.)

## SOURCE: what each status does (`src/core/fight.js`)

- **burning**: 10 HP at the end of each round for 2 rounds. Set by a hit that gets past the plate, or by a shot that only cracks a plate. Never jumps to another enemy, never stacks, a second hit does not renew it. Machines burn. It can kill: "burnOut" is the line for the tick that drops the enemy.
- **marked**: does nothing by itself. Set on whatever the runner hits or cracks. Breacher and Rout read it (a marked target makes them do one more thing).
- **exposed**: the next hit that enemy takes (from the crew or the overwatch) ignores its armour plate and deals the piece's extra 10 HP; that hit uses it up. Set on the NEXT enemy of the group, not on the one that was cracked; skipped for an enemy with no plate left.
- **shaken**: the enemy counts as already gone when its group decides whether to run. Set on the next enemy of the group when one is killed (and one more on a marked kill). Only bodies that break run: it does nothing to corp, enforcers or drones, and the engine skips them.
- Engine guardrails: a status never stacks or renews; an immune body shrugs it off (the `immune` line, once per body); a fall spreads a status at most once.

## SOURCE: the enemy card strings (`view.status.*`, shown on the round screen; a tap opens the text)

```
view.status.infected: Infected · {hp} a round
view.status.infected.textRounds: The {word} takes {hp} at the end of each round, {n} more times.
view.status.infected.textFall: The {word} takes {hp} at the end of each round until this enemy falls.
view.status.infected.textLast: The {word} takes {hp} at the end of this round, then it burns out.
view.status.jumps: If this enemy falls, it jumps to another in the same group.
view.status.burning: Burning · {hp} a round
view.status.burning.textRounds: Takes {hp} at the end of each round, {n} more times. Fire never spreads.
view.status.burning.textFall: Takes {hp} at the end of each round until this enemy falls. Fire never spreads.
view.status.burning.textLast: Takes {hp} at the end of this round, then the fire goes out. Fire never spreads.
view.status.marked: Marked
view.status.marked.text: Called out for the crew. Does nothing by itself; some abilities do more against a marked enemy.
view.status.exposed: Exposed
view.status.exposed.text: The next hit it takes skips its armour plate.
view.status.exposed.textExtra: The next hit it takes skips its armour plate and deals {extra} more.
view.status.shaken: Shaken
view.status.shaken.text: Counts as already gone when its group decides whether to run.
```
Slots: `{hp}` the tick ("10 HP"), `{n}` ticks left, `{extra}` the exposed extra HP, `{word}` the payload's log word.

## SOURCE: the log lines (`src/data/fightText.js`, three variants each; rewrite all three)

```
burn      {enemy}: "{enemy} catches fire." | "The round sets {enemy} burning." | "Flames take hold on {enemy}."
burnTick  {enemy}: "The fire burns into {enemy}." | "{enemy} burns." | "The flames keep eating at {enemy}."
burnOut   {enemy}: "The fire brings {enemy} down." | "{enemy} burns until they drop." | "The flames finish {enemy}."
mark      {who}, {enemy}: "{who} marks {enemy} for the crew." | "{who} calls out {enemy}." | "{who} tags {enemy}."
expose    {who}, {enemy}: "{who} spots the gap in {enemy}'s armour." | "{who} spots the weak seam in {enemy}'s plate." | "{who} shows the crew where {enemy}'s plate opens."
shake     {enemy}: "{enemy} sees that and starts looking for the exit." | "{enemy} falters at the sight of it." | "{enemy}'s nerve goes."
immune    {enemy}, {word}: "{enemy} is a machine: the {word} finds no living tissue." | "... the {word} cannot take hold." | "... the {word} has no flesh to attack."
tick / tickOut (infection, for terms that must stay consistent): "The {word} rips through {enemy}." / "The {word} brings {enemy} crashing down."
```
Notes for the writer: `expose` names the runner who has the Breacher but the effect lands on the NEXT enemy, so the log should not claim the enemy just shot is the exposed one; `shake` fires on a kill, so it can read as the survivors reacting to a fall; `mark` fires on a hit or a crack.

## SOURCE: neighbouring strings that use the same terms (rewrite for consistency, or confirm)

```
director.streak: {who} drops {n} in two rounds.
director.shieldWall: {who} covers {target} again.
director.lastStand: {who} keeps fighting on almost nothing.
director.clutchHack: {who} finishes the job in round {round}.
director.denied: {who} cuts the radio: {n} calls go nowhere.
director.carryHome: {target} is carried home.
stage.special: {who} cuts loose.
stage.special.ricochet: {who} lines up one round for all of them.
stage.special.slash: {who} goes through them.
stage.special.ping: {who} pings the whole pack.
wave: {kind} {n} comes in with the wave.
approach: {enemy} is still coming in.
view.approaching: Coming in: no shot this round
```
Rules for these: a spotlight describes the event that triggered it; "coming in" means an arrival that has no shot in its first round; nothing here may promise a new effect.
