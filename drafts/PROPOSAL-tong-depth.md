# The other tongs, deeper (proposal, 2026-11-13)

**Status: agreed, not built.** The owner took every call in section 9 as proposed (2026-11-13). E0 is handed off in `drafts/HANDOFF-tongs-screens.md`; E1 to E4 follow in order, each with its own sim gate. Read `docs/RIVAL-TONGS.md` first: this builds on C0 to C5 and D3 and keeps every rule there unless a section below says "changes".

Mock-up of the screens: `drafts/prototypes/tongs-depth.html` (section 6).

## 0. Why, and what it is not

The owner (2026-11-13): the other tongs are a favourite part of the game; they make the city feel large and make scouting worth doing; add depth. The owner's notes offered four directions: fog of war on rival rosters, a living economy between houses, a heat ledger between organisations, and friction against hoarding stars.

What is there today is a good skeleton with little to read on it. A tong is a name, a style and a line of talk. Its runners move at random (`driftChance`), a free name goes to "the richest tong with room", only small poor tongs fold, a scouted read lasts for ever, and regard changes one price. The Tongs screen shows this honestly: a list of names with OPEN beside them.

This proposal gives each house a way of running its people, lets money break a house of any size, makes what we know about them age, lets them compete with us for work, and redraws the screens so all of that can be seen.

It is **not**:

- **A league.** No table, no position, no rating on screen ("No league", 2026-11-08). The Anchor's Book stays the one approved exception.
- **Enemies.** No raids, no heat, no frozen money, no bought-out suppliers. That is what the Red Lanterns and the Silver Fan are for (`core/gangs.js`). Tongs compete; they do not attack ("No grudge", 2026-11-08). Section 5 stretches that row and says exactly how far.
- **Ego and chemistry on our own crew.** That is a crew system and wants its own proposal. The rival-side half is here: a house with one star too many sheds one (sections 2 and 3).

## 1. The slices

| Slice | What | Save | Touches the player's economy |
| --- | --- | --- | --- |
| E0 | The Tongs screens redrawn on today's data (section 6, first half) | none | no |
| E1 | Houses have habits; names move for reasons (section 2) | bump | no |
| E2 | Overreach: wages, strain, the sale, the break (section 3) | bump | only as chances to sign |
| E3 | Reads go stale; watch a house; the name they keep quiet (section 4) | bump | a new side task |
| E4 | They want the same work; regard has teeth (section 5) | bump | yes: some offers leave the board sooner |

Order: E0, E1, E2, E3, E4. E0 first because it needs no new rules and answers "the menu is sparse" at once; every later slice then has somewhere to show itself. E4 last because it is the only one that can cost the player money, so it needs the others in place and the most tuning. Each slice is one PR with its own tests, CHANGELOG entry, decision-log row and screenshot set.

## 2. E1: houses have habits

### The idea

A tong's **style** (loud, quiet, corporate, street) is how it sounds. Its **habit** is how it runs its people. Style stays as it is. Habit is new, hidden in state as an id, and public on screen as a label and a line, the way the street would describe the house.

| Habit (id) | Label | In one line | Keeps | Lets go | Takes on |
| --- | --- | --- | --- | --- | --- |
| `grinder` | Grinder | Signs them young and cheap, and keeps the ones who last. | 6 to 8 names | anyone 24 or older who has stalled | the youngest free names and new faces |
| `boutique` | Short table | A handful of names, all of them good, none of them cheap. | 3 to 4 | whoever falls well behind its best | only names near its own level |
| `workshop` | Workshop | Ordinary hands, extraordinary kit. | 4 to 6 | whoever the kit no longer flatters | anyone steady; it trusts the kit |
| `oldhouse` | Old house | Keeps its people until they choose to go. | 4 to 6 | almost nobody | rarely, and from its own district first |

Labels are first-pass wording for the owner (`WRITING_GUIDE.md`), and "tech-cult" in the owner's notes became Workshop to fit Lantern Bay.

### Rules

1. **Assignment.** At seeding and whenever a tong forms: `hashRng(seed, 'habit:' + tong.id)`, weighted `grinder 3, boutique 2, workshop 2, oldhouse 3`, never more than two active tongs with the same habit (re-draw with the next number from the same stream). A tong formed by a folded tong's best name takes a different habit from the house it left. A habit never changes.
2. **Stalled.** A card is stalled when it is 24 or older and its rating has not risen by 2 or more in 26 weeks. Needs `card.best` (highest rating seen) and `card.bestDay`.
3. **Releases.** Replaces today's "nobody free, so somebody leaves the fullest tong". Each Sunday each active tong may release at most one name, and no tong releases twice inside four weeks (`tong.releasedDay`). Never the head. In order:
   - over its roster ceiling: the lowest rated goes;
   - `grinder`: its lowest-rated stalled name;
   - `boutique`: a name 12 or more rating points behind its best;
   - `workshop`: a stalled name aged 30 or older;
   - `oldhouse`: nobody, except over the ceiling.
4. **Signing by fit.** Replaces "the richest tong with room" for an unsigned free name and for the weekly drift. A house *wants* a free card when it has room and:
   - `grinder`: the card is 24 or younger;
   - `boutique`: the card's rating is within 5 of the house's average;
   - `workshop`: the card's rating is 30 or more (steady);
   - `oldhouse`: the card's home is the house's home district, and only one signing a season.
   Among the houses that want it, the card goes to the highest tier whose average rating it is within 8 of; ties by wealth, then id. A card nobody wants stays free and can be put forward to us again. This is the trickle-down: a name a Harbour house drops is usually too good for the bottom and lands a tier lower.
5. **Drift** (`driftChance`, young names moving as rumours) stays but may only move a card to a house that wants it.
6. **The total stays bounded.** Cards are still only created at seeding and at a season's end (one per retirement). A grinder with room and no young free name to sign takes the season's new faces first. A test holds the total between 34 and 46 over 10 seasons.
7. **Workshop kit.** A workshop's names count +6 toward the house's own average (its work is better than its people) and +3 on the Book's street score (`BOOK.habitSkew`, beside `styleSkew`): the slate flatters them. The card's own rating is untouched. A workshop name we sign brings one piece of street-tier gear (`dossier.brings`, which exists and is empty today). Their profile, once scouted to level 1, says "Leans on the kit."
8. **Old-house loyalty.** A name in an old house asks +10 points of premium over what `persuasion` gives (cap unchanged), and retires up to 3 years later. Wording on the profile: "Has been there a long time."
9. **Boutique price.** A boutique's buyout is x1.3 before the wealth and regard terms. Its roster ceiling of 4 means it must let one go to take one on, which is where the "one star too many" story comes from.

### The trail

Each card keeps `path`: its last three houses and the Sunday it left each (`[{ tongId, day }]`, newest last, free spells left out). This is what lets the street say "let go by the Jade Mantis Hand in the spring, at Late Rain since", and what the screens draw as a name's trail (section 6). `fromTong` stays for the free-name rule.

New talk kinds (wording in `data/rivals.js`, first pass):

- `let_go` (by habit): "{tong} has let {name} go. They do that." / "{name} is no longer one of the few at {tong}."
- `landed`: "{name}, lately of {from}, has a seat at {tong}."
- `kept_on`: an old house keeping someone past their best, as colour, at most one a season.

### What the player gets

- The free name stops being a random card. It has a reason ("the Grinder's cast-off, 25, stalled there") and a kind you learn to expect from each house.
- A reason to watch particular houses: the Short table's cast-offs are the best names that ever come free; the Grinder's are cheap and sometimes wrongly written off (a stalled name at a Grinder can still have a high potential read; scouting is how you know).
- Nothing in E1 touches a roll, pay, heat or the board.

### Tuning and gates

`scripts/sim-phase2.mjs` (week-26 tier spread) must stay inside today's bounds. New `scripts/sim-tongs.mjs`: over 50 seeds and 6 seasons, report per habit the roster size, releases a season, where released names land (tier above, same, below, unsigned), and how many free names a season the player is offered. Gates: at least 60% of releases from the top two tiers land one tier lower or stay free; every habit's roster stays inside its range 90% of Sundays; the free name's cadence stays 3 to 6 weeks.

## 3. E2: overreach

### The idea

Today a tong's money only goes up with prestige and down with halls, so only a small, quiet tong can fail. Give houses a wage bill and an appetite, and a big house can buy more than it can keep. When it cracks, good names come loose all at once. That is the "sudden opportunity" in the owner's notes, and it reuses the story threads C4 built.

### Rules

1. **Wages.** Each Sunday a house pays `RIVALS.wage.per` (first value 4) x rating for each of its names, on top of hall upkeep. To leave today's balance where it is, each style's `wealth` per prestige point rises by the average bill (first value +18). The sim gate in section 2 says whether that held.
2. **Appetite.** A house with more than 1.5x its next hall's wealth mark, and room, goes shopping at most once every 8 weeks: it signs the best free name it wants, or buys a name it wants from a house a tier below (a buyout by the same `buyoutAmount` rule, paid house to house). `boutique` and `loud` houses shop at 1.2x instead of 1.5x. A house never buys from us this way: that is D3 and stays one offer a week with Joss's warning.
3. **Strain.** A Sunday is *strained* when the last four weeks' bills (wages and upkeep) exceed the last four weeks' income **and** wealth is under 8 weeks of bills. `tong.strain` counts strained Sundays in a row; a calm Sunday takes 1 off.
4. **The story** (thread family `overreach`, one open per tong, same machinery as decline, founding and rise):
   - **Stretched** (strain reaches 3): talk only. The client remark already has a "stretched" mood.
   - **Selling** (strain reaches 6): every two weeks the house releases its dearest name that is not its head. While selling, a buyout from this house is x0.75. Only one house in the city may be selling at a time; a second waits at stretched.
   - **Broken** (wealth at 0 on two Sundays while selling): it closes a hall, and releases down to three names over the following Sundays, lowest rated first. A one-hall house instead goes through today's fold rule, with its chance of a new tong forming from its best name.
   - **Steadied** (four calm Sundays): the thread closes, "{tong} has stopped selling."
5. **The sale, for us.** Names a selling or broken house lets go are all open to us at once for three weeks, beside the ordinary free name, instead of waiting their turn one a month: `rivals.sale = { tongId, cardIds, untilDay }`. After that the fit rule (section 2) places them. This is the one place more than one free name is on offer.
6. **Limits.** Never below `minTongs`. A house in its first 12 weeks cannot strain. Nothing here reads or moves the player's money, heat, halls or rolls.

New talk kinds: `overreach_begin` ("{tong} has been spending like a bigger tong than it is."), `overreach_selling` ("{tong} is letting names go, and not by choice."), `overreach_broken`, `overreach_steadied`, and `bought` for a house-to-house purchase ("{tong} paid {from} for {name}. Nobody is saying how much.").

### What the player gets

- A reason to keep cash back: the sale lasts three weeks and comes without warning unless you read the signs (stretched, then selling) or have watched the house (E3 tells you a house is stretched before the street does).
- Cheaper buyouts from a house in trouble, dearer ones from a boutique: prices now say something about the seller.
- Big houses that can fall, so the top of the city changes over a long game.

### Gates

In `sim-tongs.mjs`: a selling story starts 1 to 3 times a season across the city (median), fewer than 1 in 4 end broken, a Harbour or City house breaks at least once in 6 seasons in 30% or more of seeds, and the count of active tongs stays 4 to 7.

## 4. E3: what we know goes stale

### The idea

Scouting today is three trips and then the truth for ever. The owner's notes ask for three things: knowledge that ages, houses that hide things, and scouting as something you keep spending on. All three fit the system without showing a number.

### Rules

1. **A read has a date.** `rivals.scouted[cardId]` changes from a level (0 to 3) to `{ level, day, band, tongId }`: when we last watched them, and what band and house they were in then.
2. **Going stale.** The level in effect is the stored level minus one for every `RIVALS.staleWeeks` (first value 12) since the last good trip, never under 0. A good trip raises the level in effect by one and resets the date. So a full read kept fresh costs one trip a season; a name left alone for most of a year is a stranger again.
3. **"Changed since we looked."** If the card's band or house differs from the read's, the profile says so in words and the level in effect drops one more step. The read stays honest: it never shows figures it knows are old.
4. **What the screen says.** The age of a read as words: "watched this month", "watched last season", "not watched in a long while". Never a count of weeks.
5. **Watch a house.** A new side task, three days, the scout's social stat, same difficulty as a name (`SIDE_DIFFICULTY`), own hash key `'house-trip'`. `rivals.houseRead[tongId] = { level 0-2, day }`, stale after 8 weeks a level.
   - **Without a read** a house page shows only what is public: its head, and names that are on the Anchor's slate or at least "known". The rest are "and others we have not put a name to".
   - **Level 1:** the whole roster by name; how the house is doing in a word (flush, steady, stretched, selling), which runs a few weeks ahead of the street's talk; what kind of name it is looking for, so you can tell where a free name will go if you pass.
   - **Level 2:** who is **unsettled** there, at most two names: a stalled name at a grinder, the one furthest behind at a boutique, anyone at a house that is stretched. An unsettled name's buyout is x0.85 and they ask 5 points less premium. This is the "leaked scan": knowing who can be had.
6. **The name they keep quiet.** A quiet-style or boutique house may keep one rising name off the street: `card.quiet = true`, set by `hashRng(seed, 'quiet:' + card.id)` when a card aged 26 or under and rated above the house's average joins, one per house. A quiet name is left out of the Book's candidates and Names on the street until they are Elite, leave the house, or we have watched the house to level 1, where they show as "one they don't talk about". This is the sandbagging from the owner's notes, the right way up: the reward for watching houses is a name nobody else has graded.
7. **The slate against what we know.** For a name whose read in effect is level 2 or more, the profile and the Book add a mark in words when the Anchor's grade and what we have seen disagree by a grade or more: "The slate flatters them" or "The slate sells them short". The Book still never reads the rating (its test stays); only our own read does, and only after two good trips. This turns the Book's loose accuracy (about 46% by band) from a tuning problem into the thing scouting is for.

### What is deliberately not here

- **Old figures shown as if current.** Football Manager shows last year's numbers until you look again. Here a dossier is never saved (`docs/RIVAL-TONGS.md` rule 6), so a stale read loses detail instead of showing wrong detail. If the owner prefers the other way, it costs a saved snapshot of eight stats per watched name and a change to rule 6; see call 6 in section 9.
- **Rivals scouting or deceiving us about our own crew.** Nothing to decide on would come of it.
- **Paying cash for information.** The cost is a runner's days, which is already the game's currency for side work.

### Gates

A player who sends a scout every week can keep about 6 names and 2 houses fresh; one who never scouts loses nothing they have today except the permanence of old reads. Test: a save from before E3 keeps every read at its level, dated the day it migrates.

## 5. E4: the same work, and regard with teeth

### The idea

Two things in the owner's notes, both already parked in `docs/RIVAL-TONGS.md` as ideas waiting for a rule: rivals competing for the board's contracts, and a tong turning cool on us after what we do to it. Done as competition a player can see and answer, never as an attack.

### Where a house works

A house works its home district, plus one more district for each hall beyond its first, picked by `hashRng(seed, 'reach:' + tong.id + ':' + n)` (never the Silt, never a locked district). Nothing stored: it follows the hall count. On screen: a house's page lists "Works in", and a district's page lists "Tongs working here".

### They want this one

1. When an offer is posted, one hash per job (`hashRng(seed, 'contest:' + job.id)`, the key the earlier note reserved) decides whether a house wants it too. Chance = 10% for each house whose home is the job's district, 5% for each that reaches into it, times that house's mood toward us (cold x1.5, warm x0.5), times 1.3 if it is stretched or selling ("taking any work"), capped at 35% in all. One house at most per job.
2. **Never contested:** opening favours, heist steps and finales, defining jobs, named offers, raid defences, anything before Street rank (the same gate as D3), and any offer when the board would be left with fewer than two uncontested ones.
3. A contested offer says so on its card and its plan: "**Late Rain Society wants this one.** Gone by Thursday." It leaves the board at the end of the second day after it was posted if we have not taken it (`job.contest = { tongId, byDay }`). The street says the house took work there (`took_work`, which exists).
4. **Taking a contested job** changes no roll and no pay. It costs 1 regard with that house. **Leaving one to them** when we could have staffed it gives +1 regard, at most once a month per house.
5. The "Rival crew" twist and the client's "another tong wanted this job" remark name the contesting house when there is one, so the three places agree.

What this costs the player: some offers have two days instead of their usual life. No hidden loss, and the choice is shown. `scripts/sim-tong.mjs` (a player running every crew) must show income per week within 5% of today's; the first values above are set low for that reason.

### Regard with teeth

Regard stays hidden, -5 to +5, shown as words, easing one step toward 0 every other Sunday. What moves it, old and new:

| Act | Regard |
| --- | --- |
| Sign one of their runners (built) | -2 |
| Split a job with them, once a month (built) | +1 |
| Take a job they wanted (new) | -1 |
| Leave them a job they wanted, once a month (new) | +1 |
| Let them have one of ours through D3 (new) | +1 |

What it does, old and new:

| | Cold (-2 or lower) | Warm (+2 or higher) |
| --- | --- | --- |
| Buyout from them (built) | x1.25 | x0.9 |
| Work in their districts (new) | wants our offers x1.5 as often | x0.5 |
| Free names (new) | if the house wants the free name, we have two weeks, not three | we hear a name they are letting go a week before the street: first refusal |
| Watching the house (new) | the trip is 3 harder | level 1 comes for nothing: they talk to us |
| D3 offers for our runners (new) | twice as likely to be the buyer (the weekly chance of an offer is unchanged) | half as likely |

**What a cold house never does:** raid, add heat, touch a hall, touch our money, block a job, or act off the board. A test asserts that heat, cash, halls, rolls and pay are identical for the same seed whatever the regard, apart from the buyout price and which offers carry a contest.

**How far this stretches "No grudge".** That row says tongs hold no memory of the player and that regard moves only on explicit acts. Both still hold: every row in the first table is an act the player chose and was shown, and regard still fades. What changes is that regard now affects more than one price. The log row for E4 would read: *regard changes how hard a house competes with us and how freely it talks to us; never violence, never anything off the board; supersedes "regard changes the buyout only".* A warm house still never hands us a job (owner, 2026-11-08): first refusal on a name is not a job.

## 6. On screen

The owner's question (2026-11-13): the Tongs menu is sparse; what is the best way to show all this? Mock-up: `drafts/prototypes/tongs-depth.html`, three phone screens.

The problem today (screenshots `21-tongs.png`, `22-tong-page.png`): every tong is the same rectangle with a name and OPEN. There are no faces, though every rival runner has a portrait. Nothing shows where we stand among them, though our tier is the same ladder. Nothing moves, though the simulation moves every Sunday. The Book is a text list.

The answer is three pictures, each legal under "no numbers, no order beyond tier or grade":

### 6.1 The ladder (City › Tongs, top of the page)

Five rungs, Harbour at the top, Back Room at the bottom. On each rung, a **seal** for every house at that tier, and ours among them, outlined in cyan and marked OURS. A seal is a small cut-corner tile in the house's style colour with two letters from its name; it is the house's face everywhere in the game (the map, a job's contest flag, a name's trail). Tap a seal to open the house.

This is the same information as today's tier headings, drawn as a place we stand in. It shows no order inside a rung (seals sorted by name) and no number. It is the single biggest change in feel, and it needs nothing new from the rules (E0). A house that moved rung this month carries a small up or down mark until the next slate.

### 6.2 House cards and the house file

**The card** (in the list under the ladder, grouped by tier as now): seal, name, then a line of chips in words: habit (E1), how it is doing (E2: Flush, Steady, Stretched, Selling; "?" until we have watched it, E3), how it looks at us (E4: Cold, Cool, a blank for neutral, Warm). Then **a row of faces**: the head and the names we know, small portraits, with a blank silhouette for "others we have not put a name to". Then the latest talk. A story in progress shows as three pips with a word ("Selling", second of three lit); pips, not digits.

**The file** (a house's page) is laid out like a dossier:

- Seal, name, tier, style and habit line.
- **Their story:** the open thread as a short timeline of beats with dates, newest first, then the last closed one. It is The Word, filtered to this house, drawn as a track.
- **The table:** the roster as a grid of face tiles. Each tile: portrait, name, role icon, the Anchor's grade letter if they are on the slate, and a corner mark for the state of our read (fresh, fading, none). Unsettled names (E3) carry a sodium edge. The head carries a small crown mark and no Sign.
- **Works in:** district chips (E4), each opening that district.
- **Come and gone:** this season's arrivals and departures as one line each, a face, an arrow and a seal ("to Late Rain Society", "let go", "from the Grinder").
- **Between us:** the regard word and, in plain sentences, what it means now ("They ask more for their people. They want the work we want in the Docks.").
- **Watch this house** (E3), the side-task button, with the age of what we know.

### 6.3 The slate (the Anchor's Book)

A chalk slate, not a list. Each grade is a band across the page with its letter large at the left (S in sodium, down to D in muted grey) and its names as **face tiles** in a wrapping row: portrait, name, the house's seal in the corner (ours outlined in cyan, a free name with a green dot), and the move mark (up, down, new, back). Filter chips across the top: All, Ours, Free, and one per house. Under the grades: **Ones to watch** as a row of larger tiles with Scout on each; **Gone quiet** as greyed tiles.

With E3: a name we have watched properly carries "Flattered" or "Sold short" where the slate and our read disagree, and the page gains one line: "Three names on this slate we know better than the Anchor does."

### 6.4 Come and gone (a strip on City › Tongs)

Under the ladder, the month's movement as a horizontal strip of small cards: face, name, from-seal, arrow, to-seal (or a green dot for free). This is the pipeline made visible: you see the Short table's cast-off land at a District house a fortnight later. It replaces nothing; The Word still tells it in sentences on Mondays. Needs `card.path` (E1); before E1 the strip can be drawn from The Word's `name_travelling`, `went_free` and `former_signed` entries.

### 6.5 Elsewhere

- **City › Map:** a house's seal at its home district, small, under the district label (E0); seals for reach (E4). Tap opens the house.
- **A district's page:** "Tongs working here" (E4).
- **Jobs › Board and the plan:** the contest flag (E4), in the house's colour, with the day it goes.
- **Crew › Leads, a name's page:** the age of the read, "changed since we looked", the trail (their last three houses as seals), "unsettled", "leans on the kit".
- **Today, Monday's Word:** unchanged in shape; the new talk kinds join the three-line cap under the existing order (a continued story, a name of ours, then ordinary talk).

### 6.6 Rules the screens keep

No digits about rivals except ¥ we would pay. No order inside a rung or a grade beyond the name. Nothing on hover; every seal, face and chip is a 44px target or sits inside one. Phone width first; the ladder is one column of five rows at 360px. `rivalView` and `bookView` stay the only things the UI reads, and gain: `ladder` (rungs with seals, ours included), `moves` (the strip), and per house `habit`, `state`, `mood`, `story`, `roster` tiles, `worksIn`. The existing test that walks the view for digits covers the new fields.

### 6.7 What E0 can ship alone

The ladder, seals, faces on house cards, the house file's story and table (public names only), the slate as face tiles with filters, the strip from The Word, and seals on the map. No rule changes, no save change, one screenshot set.

## 7. State, saves and files

Each slice bumps `SAVE_VERSION` (63 today) once and adds a migration in `save/save.js`.

| Slice | New state | Migration |
| --- | --- | --- |
| E0 | none | none |
| E1 | `tong.habit`, `tong.releasedDay`; `card.best`, `card.bestDay`, `card.path` | habit from its hash; `best` = current rating, `bestDay` = today; `path` = `fromTong` if any |
| E2 | `tong.strain`, `tong.bills` and `tong.income` (four-week rings), `tong.shoppedDay`; `rivals.sale` | zeros and null |
| E3 | `rivals.scouted[id]` becomes `{ level, day, band, tongId }`; `rivals.houseRead`; `card.quiet` | old levels kept, dated the migration day; no quiet names set on old cards |
| E4 | `job.contest`; `tong.leftDay` (the monthly +1) | none needed (absent means no contest) |

| File | Change |
| --- | --- |
| `src/core/rivals.js` | the weekly step's releases, fit, appetite, strain; `ladder`, `moves` and the richer house in `rivalView` |
| `src/core/houses.js` (new) | habit rules (`wants`, `releaseFor`, `stalled`), `strainOf`, `worksIn`, kept apart so `rivals.js` does not pass 700 lines |
| `src/core/dossier.js` | read dates and staleness, `watchHouse`, unsettled and boutique terms in `buyoutAmount` and `persuasion` |
| `src/core/book.js` | `habitSkew`, quiet names left out, the slate-against-our-read mark in `bookView` |
| `src/core/jobs.js` | `contestFor(state, job)` on posting; a contested offer's last day in `tickJobs` |
| `src/core/mobility.js` | which house makes a D3 offer, weighted by mood |
| `src/core/sidetasks.js` | the Watch a house task |
| `src/data/rivals.js` | `HABITS`, `HABIT_TEXT`, new `WORD_TEXT` kinds, state and mood words, all new numbers |
| `src/ui/tongs.js`, `src/ui/seal.js` (new), `src/ui/styles.css` | section 6 |
| `CODEMAP.md`, `docs/RIVAL-TONGS.md`, `docs/SCREENS.md`, `ART.md` | kept current with each slice |

Every new roll has its own `hashRng` key (`'habit:'`, `'reach:'`, `'quiet:'`, `'contest:'`, `'house-trip'`, and `'rivals-e:' + week` for the weekly additions) and never moves `rngCounter`. `tests/golden/rivals-1234.json` gains a section per slice; the existing sections change in E1 (names move differently) and are regenerated once, on purpose, with a log row.

## 8. Tests

Kept: every rule in `docs/RIVAL-TONGS.md` "Rules that must stay true".

New, by slice:

- **E1:** a habit never changes; no more than two houses share one; a head is never released; no house releases twice in four weeks; rosters stay in range; the card total stays bounded; a released name never lands at a higher tier than it left unless it was free for a season.
- **E2:** only one house selling at a time; never below `minTongs`; a house under 12 weeks old never strains; the sale closes after three weeks; with the player doing nothing, cash, heat and halls match a run without E2.
- **E3:** an old save's reads keep their level; a read's level in effect never rises without a good trip; a quiet name is absent from `bookView` and `namesOnTheStreet` until a rule reveals it; the Book's score still ignores the rating; the view shows no digits for a read's age.
- **E4:** never contested: opening, heist, defining, named, raid, pre-Street; the board always keeps two uncontested offers; a contested job's rolls and pay equal the same job uncontested; the cold-house invariant in section 5; regard stays in range and still eases to 0.
- **Design promises:** untouched. Nothing here goes near a fight, a death rule or an exit.

## 9. The owner's calls

**All taken as proposed (owner, 2026-11-13: "I'd go with your suggestions").** Kept as a list so each can be superseded by name. Wording (call 11) stays the owner's to rewrite at any time.

1. **The order,** and whether E0 (screens only) goes first.
2. **Habits:** the four, their labels and lines. Is habit public from the start (proposed), or learned by watching the house?
3. **Workshop names bring a piece of gear** when signed (proposed: one street-tier item).
4. **The sale:** several free names on offer at once for three weeks (proposed), or keep strictly one a month and let the sale only set which one.
5. **Reads go stale:** yes or no; and the pace (proposed: a level a season).
6. **Stale reads lose detail (proposed), or show old figures** as Football Manager does (needs saved snapshots and a change to "dossiers are never saved").
7. **The ladder shows our own tong on a rung beside the others.** It is tier only, which the game already shows in words, but it is the first picture that puts us among them. Proposed: yes.
8. **Contested offers:** two days and gone (proposed), or a lower fee if we take it late, or flavour only.
9. **Regard with teeth,** and the wording of the log row that stretches "No grudge" (section 5).
10. **Letting them have one of ours gives +1 regard** (proposed), or nothing, since they paid.
11. **All first-pass wording** (habit lines, new talk, state and mood words) is the owner's to rewrite.

## 10. Left out, and why

- **A public ranking of tongs, sponsorships for climbing it, a target on the leader's back.** "No league" (2026-11-08). The ladder in 6.1 is tier only; D3 already makes a bigger tong and a slated runner a likelier target.
- **Frozen accounts, bought-out suppliers, sabotage.** Gang behaviour; tongs are peers.
- **Ego, chemistry and facility limits on our own crew.** A separate proposal. Beds in halls already cap the roster; wages already scale with quality; an ego system would be the third brake and should be designed against those two.
- **Moles and paid leaks as separate currencies.** One cost, a runner's days, does the job (section 4).
- **A house's head becoming signable, heist races, rivals in the Silt, back-room roles.** Still parked in `docs/RIVAL-TONGS.md`; nothing here needs them.
