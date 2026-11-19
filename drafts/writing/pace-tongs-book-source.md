# Source: spotlights, the live view's labels, the tongs' habits and the Anchor's Book (2026-11-19)

Paste the `WORLD.md` context block first, then the PROMPT below, then this whole file. Everything under SOURCE is what the
game does today; the wording shown is the current draft (the owner's earlier batches are in it where applied).
Files: `src/data/fightText.js`, `src/core/director.js`, `src/ui/fightscreen.js`, `src/data/rivals.js`, `src/core/houses.js`, `src/core/book.js`.

## PROMPT

```
TASK: Rewrite the wording in four blocks (A spotlights, B the live view's labels, C the other tongs' habits,
D the Anchor's Book), so each line says exactly what its trigger or rule establishes and no more.
Keep the meaning of every rule as SOURCE states it. Do not add a rule, a number, a duration, a ranking
or a reason. If a line you want would claim more than the trigger shows, leave it out and say so.

RULES: one sentence per line unless SOURCE says otherwise; under ~18 words; gender-neutral; Lantern Bay only
(no new factions, places or tech); nothing supernatural. Keep every {slot} a line already has and add none.
The crew and the player only know what they have seen. Block D: the Book grades RUNNERS, never tongs; it is
the elders' opinion, not the truth; it is chalked on the first Monday of each month and wiped the next month;
nothing implies a permanent scoreboard or a tong ranking.

FORMAT (exactly):
line | <key> | <the new text, slots kept>
variant | <key> | <v1> | <v2> | <v3>
note | <anything in SOURCE you could not honour, or a rule you think reads oddly>
```

## SOURCE A: the director's spotlights

A spotlight is one sentence on the map when a round's events meet a trigger. The trigger decides what the line may claim.
All appear only in the new fights (engine 2). Slots: `{who}`, `{target}` runners' handles; `{n}` a count; `{round}` a round number.

| key | current text | trigger (exactly) |
| --- | --- | --- |
| `director.streak` | {who} drops {n} in two rounds. | one runner puts down 3 or more enemies within the last two rounds, with a drop this round. `{n}` is how many. |
| `director.shieldWall` | {who} covers {target} again. | the same protector has shielded the same runner 3 times (and again at 6, 9...). The shield action only; `{n}` is not in the line. |
| `director.lastStand` | {who} keeps fighting on almost nothing. | a runner on 10 HP or less, still up, acts 2 rounds running. |
| `director.clutchHack` | {who} finishes the hack in round {round}. | in a hack, the work is completed in the last or second-to-last round before the deadline. `{who}` is the tech. Does not mean the fight or job is won. |
| `director.denied` | {who} stops {n} radio calls. | a jam goes off and cancels 2 or more radio threats in the round. |
| `director.carryHome` | {target} is carried out. | a downed teammate is carried into the van. The crew has not got home. |

## SOURCE B: the live view's labels (`data/fightText.js`, drawn by `ui/fightscreen.js` and `ui/fightstage.js`)

Four kinds of text, which must not be mistaken for each other: **controls** (buttons the player taps), **headings**,
**marks** (a short word floating over a token on the map, also in the round's feed), and **titles** (a line over the map).

```
CONTROLS (pace chips; one is on at a time)
pace.label: Pace                                   a group heading for the three chips
pace.fast: Fast                                    the next round plays by itself on the current orders
pace.watch: Watch                                  stop after each round and decide
pace.resolve: Resolve                              hand the whole fight off; it plays to the end
pace.fastNote: Fast: the next round plays on these orders by itself. Change orders or pick Watch to stop and decide.
MARKS (floating words; one or two words)
stage.hit: Hit              a shot lands
stage.down: Down            a runner is down but not out of the fight
stage.out: Out              an enemy or runner is out of the fight
stage.absorbed: Armour      armour took a shot (it soaks a flat amount; at least 1 HP goes through)
stage.cracked: Cracked      a shot only cracked a plate
stage.jammed: Jammed        a radio call was jammed
stage.jamFail: No lock      the jam failed to find the caller
stage.alarm: The alarm is up   a status of the fight (a state, not an event)
stage.flanked: Flanked      a runner has been flanked
TITLES (line over the map; the special's title holds for its duration)
stage.special: {who} cuts loose.          any special move without its own title
stage.special.ricochet: {who} lines up a ricochet.    up to 3 enemies, one attack each, once a fight
stage.special.slash: {who} commits to the strike.     melee special
stage.special.ping: {who} sends out a ping.           a scan; its effect is not defined as hitting anyone
```
Note: `stage.alarm` is a state, not an event; do not write it as something that just happened.
The special-move titles in `data/fightLooks.js SPECIAL_MOVES` today are only the three above; the Ricochet is a piece players earn, the other two are looks.

## SOURCE C: the other tongs' habits (`data/rivals.js HABITS`, `core/houses.js`)

A tong's habit is how it runs its people. It is hidden at first and shown once the tong is watched (levels 0 none, 1 roster, 2 inside).
Each habit has a label and one line shown on the tong's page; the rule behind it is below in plain words.

| id | label (now) | line (now) | what the rule does |
| --- | --- | --- | --- |
| grinder | Grinder | Signs them young and cheap, and keeps the ones who last. | roster of 6-8; wants runners aged 24 or under; lets go a runner who has stalled (age 24+ with no rise of 2 or more in 26 weeks) |
| boutique | Short table | A handful of names, all of them good, none of them cheap. | roster of 3-4; wants a runner whose rating is within 5 of the tong's own average; lets go whoever is 12 or more behind its best; its buyout runs higher |
| workshop | Workshop | Ordinary hands, extraordinary kit. | roster of 4-6; wants steady, proven runners (rating 30 or more); lets go the stalled over 30; its runners' kit counts toward the tong's average and the Anchor's slate flatters them |
| oldhouse | Old house | Keeps its people until they choose to go. | roster of 4-6; recruits only from its home district, one signing a season; its runners retire 3 years later and ask 10% more to be convinced |

```
HABIT_NOTE (shown on a runner once watched: the habit of the house they came from)
workshop: Leans on the kit.
oldhouse: Has been there a long time.
LOOKING (what a tong is after right now; one key, picked by the rules above; a full roster is "full")
young: After young runners who will sign cheaply.     (Grinder)
near: Looking for runners much like their own.         (Short table; "within 5 of their average"; the calculation may sit behind a tap)
steady: After steady, proven runners.                  (Workshop)
local: Recruits locally, one signing a season.        (Old house)
any: Open to a runner who fits.                        (no habit pull)
full: No room for another runner.
HOUSE_STATE: Flush / Steady / Stretched / Selling   ("?" when unread)
HOUSE_READ_TEXT: none "We have street talk: who leads them, and the names people mention." | roster "We have a read on their runners, their finances and who they want to sign." | inside "We have a closer read, including who might be ready to leave."
```
Rules for writers: do not invent a recruitment or behaviour rule; a label must stay one or two words; a line describes how the tong behaves, not why.

## SOURCE D: the Anchor's Book (`data/rivals.js BOOK_TEXT`, `core/book.js`)

What it is in the game: once a month, on the first Monday, the Brass Anchor elders grade up to 25 runners, S to D (S up to 3 names).
A grade is built from public fame, recent form and age, a lasting bias per runner and a small monthly wobble, never the hidden rating,
so it can flatter a show-off and miss a quiet one. It feeds nothing: no fame, pay, heat, odds or rolls (a test checks that). It is wiped and chalked again each month.
`WORLD.md`: the slate hangs at the Anchor's teahouse in Old Town; the elders argue over it over their tea; being on it gets you noticed; nobody keeps the figures.

```
BOOK_TEXT.moves: Up / Down / New / Back / Steady     (a runner's move since last month's slate)
BOOK_TEXT.joss (one message per Book, if one of ours went up, reached S, or is down as one to watch)
  subject: The Anchor's slate is up
  intro: The Anchor elders chalked their slate this morning. It's their opinion, not the truth, but people read it.
  up: {op} moved up.
  top: {op} is chalked S. Expect people to start asking about them.
  watch: The elders have {op} down as one to watch.
BOOK_TEXT.poachNote: The slate put a target on them.    (added to a rival's offer; the odds do not read the Book)
BOOK_TEXT.empty: The Anchor hasn't chalked a slate yet. The elders do it on the first Monday of the month.
BOOK_TEXT.note: The Anchor's elders chalk this once a month. It's their opinion, not the truth: it flatters some, misses others. Scouting is how you know.
SLATE_TAG: flatters "Overrated" / sells_short "Underrated"     (shown once we have our own read two or more grades off)
SLATE_MARK: flatters "From what we have seen, the slate rates them too highly." / sells_short "From what we have seen, the slate rates them too low."
ELDER_LINE: The Brass Anchor Society is older than all of them, and nobody here is measured against it.
Monday lead (3 variants, one used when the Book is published): "The Anchor's slate is up. Half the street read it before the tea was poured." | "The Anchor's slate is up in Old Town, and the elders are already arguing over it." | "The Anchor's slate is up. Somebody will not like what the chalk says."
```
Rules for writers: the Book grades runners, never tongs; "Overrated/Underrated" are our own read, not the Book's; do not imply a
permanent historical board; do not name an elder (no one is named in canon).
