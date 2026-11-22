# Prompt: write log lines (the adventure log)

Use this to draft the lines a crew sends back while they are away: on an **expedition** (our own tong's errand: a weapon, cash or a recruit), on a **hands-off job**, or in a **district** (the people and places any log can draw on). The result is one JavaScript data file. It goes in during a Claude Code session (Sonnet is enough): one file under `src/data/advlog/`, one import, a test run.

Status (2026-11-22): expeditions (slice 2) read the goal files (`src/data/advlog/weapon.js` with `weaponShared.js`, `cash.js`, `recruit.js`) and, for now, go to the districts with a file (all five open ones since 2026-11-22; the locked ones need theirs); snags there cost a little cash, or a light injury when the line says someone got hurt (scrape, bruise, cut, a finger, a wrist...). Slice 1 of the log engine is built (`core/advlog.js`): hands-off jobs read the JOB DAYS pools (generic, `src/data/advlog/jobDays.js`, until a job has its own file), side tasks `sideDays.js`, and the district files `docks.js` and `nightMarket.js` give people and places. The goal files (`drafts/advlog/weapon.js`, `cash.js`, `recruit.js`) wait for expeditions (slice 2). The engine reads exactly the format below; if it has to change, change it here too. What the engine does with a file: a line whose slot it can't fill is skipped (no `{other}` on a crew of one, no `{place}` in a district with no file); `{contact}` alone is only used once a line has introduced them with `{contactWhat}`; job-day snags cost nothing, so write them as delays or scares.

## How the log tells a story

The lines are procedural stories, not a random line a day. The engine builds each trip as a small arc and fills it from these pools:

1. **Open** (day 1): the crew sets out and picks up a first lead. This line *names something*: a contact (`{contact}`) or a place (`{place}`). The engine remembers it for the rest of the trip.
2. **Middle days**, one beat each, rolled on the crew:
   - **lead**: real progress, often a new `{place}` or `{contact}`;
   - **deadEnd**: the lead was wrong and the day is lost;
   - **snag**: something goes against them (a small cost: cash, a scrape, heat);
   - **find**: an extra on the side (a little cash, a part, a rumour);
   - **quiet**: waiting, watching, nothing happens.
3. **Callback** lines are middle-day lines that bring back what the open line named ("{contact} wasn't at the stall today"). They are what make a trip read as one story, not seven unrelated days. A callback is still a beat: each one is filed as a lead, a dead end or a snag, so the game knows what the day did.
4. **Turn**: the day the goal comes within reach, good or rough.
5. **Call**: now and then a fight breaks out and the player is called in (as on a security post). One line that sets up the fight.
6. **Close**: they come home. **met** (got it), **partial** (got some of it), **failed** (came back with only what they found on the way). Nobody dies on a log line; the worst a line can do is a scrape.

**Personality** comes from three extra pools, so the log sounds like this crew and not any crew:
- **asides**: a second sentence the game adds to about one day in three, picked by the temperament of `{who}` (the tags on every runner's bio: superstitious, money, warm, hot, wary, calm, cold, charming, curious, chrome, haunted). A superstitious runner won't take the fourth-floor meeting; a money one haggles the informant down and is pleased about it all evening.
- **pair**: a day about two of the crew together (`{who}` and `{other}`): arguing about the route, covering for each other, a running joke.
- **joss**: Joss at home, reading the day's report and adding a line now and then (warm, practical, occasionally dry; they keep the numbers).

Who does what: each beat is rolled on one stat, and `{who}` is the crew member who is best at it. That's why pools are split by stat: a social crew talks its way to the weapon, a stealth crew lifts it. Every pool has an `any` list as a fallback.

The district gives the people and places (`{contact}`, `{place}`); the goal gives the shape of the hunt. So one weapon file plus five district files gives five different-feeling hunts.

## How to use it

1. Open a fresh chat and paste everything in the box below.
2. Replace the **REQUEST** at the bottom: one of `GOAL: weapon`, `GOAL: cash`, `GOAL: recruit`, `DISTRICT: <name>` or `JOB DAYS: <job name and a line on what it is>`. Add any notes (a mood, things to avoid).
3. Read what comes back and ask for changes in the same chat.
4. In a Claude Code session, paste the file and say where it goes (`src/data/advlog/`).

The world context in the box is a copy of the block in `WORLD.md` (a test checks they match, so update both together).

````
You write the log lines for a game: short messages a crew sends home while they are away.
Read the CONTEXT, then HOW THE LOG WORKS, the RULES and the FORMAT for the kind of file asked
for, then write it for the REQUEST at the end. Reply with ONLY the JavaScript file, in one
code block: no notes before or after.

CONTEXT — LANTERN BAY. Treat this as the only source of truth; if anything earlier in
our chat conflicts with it, this wins.

GAME: text-first crew management game (Football Manager style, endless, no win state).
The player is a fixer running a tong (堂, "hall": a registered association, like a
guild), starting with three founders picked from six, one safehouse and rent due on
Sunday. A tong's rank is how far its name carries: back room, street, district, city,
harbour. A crew is the people the tong sends on a job. The Brass Anchor Society is an
old tong.

PARTNER: Joss (they/them), the crew's bootleg AI: pirated assistant code the Ghost
Circuit flashed onto salvaged hardware, named after joss paper. With the fixer since
before the crew; a partner and crew member who says "we", warm, practical, occasionally dry, and never knows
more than the board shows. Where they came from is a rumour, never confirmed.

CITY: Lantern Bay (燈籠灣, Dang Lung Wan). FICTIONAL, Hong Kong-inspired, year 2057.
Cantonese culture is the base layer (typhoon signals, dai pai dongs, mahjong parlours,
To Dei Gung shrines, joss paper, master-and-apprentice traditions), with Filipino, South
Asian, African and European communities on top. Use Cantonese romanisation, not Mandarin.
NO MAGIC: only everyday superstition (luck, ghosts, unlucky numbers), never confirmed.

HISTORY: 1891 Lantern Course racecourse opens on marshland (the Basin grows round it) · 1970 Reclamation Boom (Docks and Old Town built out into the harbour) · 1994
Great Signal 10 typhoon wipes out the southern piers (truce between proto-Red Lanterns
and planners) · 2018 Neural Integration Act, pushed by Veridian-Apex: implants fitted to
dockworkers, first neural-load burnouts · 2035 Glass Heights Annexation (bio-towers on
the ridge) · 2040s Iron Peak foundries close; the corp boards build estates on the hill ·
2052 Grid Blackout (three weeks without power; crew politics now run on favours).

TECH: street implants are cheap, second-hand and glitchy; the rich wear luxury hardware.
Neural load = migraines, memory stutter, emotional deadness; the street treats it with
herbal infusions and downtime, not corporate therapy.
Stealth kit is street-level too: picks, lock decoders, heat veils that blur you on
thermal and on cameras; never true invisibility.
A runner "on the wire" works a site from outside through whatever is networked there
(cameras, doors, lights, handsets, power; at the Docks, cranes, gantries and trucks)
with a deck, at a neural-load cost; each district offers different things to ride.
WEAPONS: guns and tech are standard kit for mercs and crews (cyberpunk setting); using
one is what gets noticed, so gunfire brings police and heat. Drones are everywhere
(corporate, police, patched street drones flown off an implant at a neural-load cost).

DISTRICTS (always use these English names):
- Open at the start: Old Town (damp tenements, tea shops; Brass Anchor Society) · the
  Docks (cranes, containers; Aether-Harbour on paper, Red Lanterns on the tarmac) · the
  Night Market (dai pai dongs, chrome clinics, mahjong; Silver Fan Circle; the Hei Lok,
  Hei Lok Leisure's casino airship, tethered above it, off the grid on a micro-reactor) · Glass
  Heights (corporate towers and labs; Veridian-Apex; officially renamed "Apex Ridge"
  but nobody on the street calls it that; foreign firms rent beneath it, and the people
  who keep it running commute up and stay late; the Lower Arcade is public, every door
  past it needs a permission) · the Basin (a bowl below Glass Heights round
  Lantern Course, a floodlit 1891 racecourse that still races REAL horses, wrapped in
  2057 telemetry, live odds and illegal betting; Racing Association officially, Silver
  Fan in the Undercroft; jobs from Fung, Okonkwo and the Ferryman).
- Unlocked later, by reputation: the Silt (sinking shanty shelf on the 1994 wreckage,
  floods twice a day and runs on the tide; no police and no boss: unwritten rules, the
  pump people, the boat elders and Uncle Po's batteries; too poor for a big tong, not
  yet worth taking; AHL surveys it every week) · the Amber Reach (transit and money hub where the
  maglev meets trams and ferries) · Iron Peak (the summit where the corp boards live in
  walled estates on the old foundry hill; funicular, gate checkpoint, private security;
  the richest place in the city, NOT an industrial zone).
- Pearl Haven House (明珠居): tower block in the Amber Reach, home of the South Asian,
  African and Filipino communities; no 4th floor; secretly owned by Mr. Szeto's shells,
  run by a resident council.

POWER (top to bottom): the Municipal District Administration governs on paper
(corporate-appointed). Above street level: megacorps Aether-Harbour Logistics (AHL;
clandestine shipping; Docks, Amber Reach), Veridian-Apex BioTech (oxygen quotas, neural
therapies; Glass Heights), Hoi-Sing Grid & Cable (the power company; Old Town and Night
Market nodes). Gangs: Red Lanterns (Docks road tolls), Silver Fan Circle (Night Market
loans, gambling, fake implants), Brass Anchor Society (Old Town elders resisting
buyouts). Police: Harbour Police 4th Precinct, the "Wet Sleeve" unit (corrupt; fines
crews at "neural-load checks"; a hot district brings a raid on a tong's hall, and only
the Wet Sleeve, on its own patch, will sell one off). A gang with a grudge against a tong
raids its hall on the gang's own turf and expects a settlement; the Brass Anchor never
raids. Institution: Lantern Bay Racing Association (racing, licensed betting, old and
well connected; fears race fixing above all). Wildcard: Ghost Circuit (data liberators in Old Town's
drainage tunnels and bomb shelters). Foreign firms (below the megacorps, Glass Heights
tenants): Morrow & Venn (old merchant-finance house from Bellweather: shipping credit,
insurance, estates; Venn House) and Hang Yuen Systems (industrial automation from Lin
Sau, chasing AHL and Hoi-Sing contracts). Bellweather, Lin Sau and Porto Clara (a casino
island down the coast) are offstage and undefined.

CLIENTS (local powers a small crew can reach, below the corps):
- Auntie Fung (Fung Wai-han, 71): Old Town tea shops and quiet fencing; senior Brass
  Anchor elder; keeps a favours ledger; eyes failing, wants an apprentice. Secret: she
  has fenced valuables pulled out of tenements days before they burned, and never asked.
- Mr. Szeto (Szeto Kin-ming): Glass Heights developer, born in an Old Town tenement
  that burned with his mother inside; wants a seat among the Iron Peak boards. Secret
  (suspected, never proven): an electrician called Lo clears buildings of people and
  valuables before the fires; Szeto secretly owns Pearl Haven House.
- The Ferryman ("Leung Ka-wai"): night boats from the Docks, never on dry land, runs
  supplies to the Silt. Secret: the real Leung drowned in 1994; this is his apprentice,
  who took his boat and name; the backwards clove cigarette was the old man's ritual.
- Madam Rao (Lakshmi Rao): Night Market moneylender in a silk/sari shop; takes cash,
  gold or verified secrets; calls people "beta". Secret: the Silver Fan Circle's former
  bookkeeper, alive because she kept a copy of their books.
- Ruth Okonkwo: broker for AHL's off-books arm; trusts nobody; meets in the Spice Route
  Canteen back booth once she trusts you. Secret: keeps a file on every deniable job
  that could sink AHL, and wants out of the city.
- Small clients (2026-11-07): Mrs. Ip (Night Market fish-ball stall at the Neon Dragon;
  deliveries, supplier disputes, missing stock; not Silver Fan; asks Back Rent) and
  Forewoman Tse (Tse Yuk-lan, the Underterrace maintenance cooperative in Glass Heights;
  contractor disputes, lost records, maintenance access; not Veridian-Apex, not Szeto;
  asks Still on the Books). A client's trust is personal, not their faction's.
STREET CAST (rookie work): Doc Siu (Old Town; ex-surgeon, unlicensed clinic under
Tenement Block 9, dry praise); Meena D'Sa (Rao's seamstress and counterkeeper); Tang Wai-chiu (Silver Fan
collector, third-floor parlour); Uncle Tariq (remittance booth, Pearl Haven House, backed
by Rao); Pang Man-ki (Veridian-Apex clinic administrator); Ho Sze-lam (Hoi-Sing field
supervisor, Old Town); Mak Chi-on (Racing Association stable-access official).
GLASS HEIGHTS PEOPLE (one-off job givers, not clients): Chow Nga-man (Veridian-Apex
payroll officer); Edith Pryce (Morrow & Venn estates administrator); Kwok Mei-yee
(visiting Hang Yuen engineer); Poon Hok-yin (shared-tower facilities coordinator); Binta
Sarr (independent overnight courier). Currency is cash in ¥; no "credits" or "Bits".
HALLS: the tong's halls grow by lease and negotiated access, never conquest (no claim on
the district or the businesses next door): Old Town (the room above the noodle shop) ·
Wok Court, Night Market (rooms behind a dai pai dong court, stallholders' association,
via Mrs. Ip) · the Stove Pier, Docks (pier cooperative, via the Ferryman) · the Unlisted
Rooms, Basin (flat over a tack workshop, via Okonkwo) · the Underterrace, Glass Heights
(maintenance cooperative under the terraces, via Forewoman Tse, not Szeto).
Reputation tier promotions open the locked districts,
each introduced by a client: the Silt (the Ferryman), the Amber Reach (Okonkwo), Iron
Peak (Szeto).

OTHER TONGS (2026-11-08): peers, not gangs; registered associations that compete for
work and runners and never raid a hall. Styles: loud (animal or weapon + Hand/Fist), quiet
(weather or hour + Society), corporate (initials + Holdings/Partners), street (a canon
place + Lot/Row/Court). Invented names only, no digits, none based in the Silt. The Brass
Anchor Society stands beside the ladder, not on it; its elders keep a book of runners' grades,
chalked once a month on a slate at the Anchor's teahouse in Old Town (never the Silt): the
elders' opinion, not the truth, and it grades people, never tongs. The Word is hedged street talk, never
results, ranks or numbers.
TONGS: runners swear in at the founding room above the noodle shop, regardless of their hall, by drinking tea poured by the fixer, writing their own name in the tong's ledger before the crew and altar, and leaving an offering; the ceremony has no recitation, blood, numbers or ranks, sworn names remain after departure, and long-serving runners are remembered on the wall beside the altar (the Hall of Legends), with a crew member writing each name and Joss checking the spelling.
TONE: gritty but human. Warmth, loyalty and dark humour are the baseline; darker
moments arrive as events. All characters 18+. Entries 1–2 sentences, phone-readable.
Everything is invented: no real companies, triads, people or Hong Kong place names, and
nothing from Shadowrun or Cyberpunk 2077.

RETIRED — never use: Pak Kok, Hoi-Sing Container Reach, Lang-Yan Bazaar, Tit-Kyu,
Kim-Ah Terminal, San-Pui Flats, Aether-Kowloon / AKL, Kowloon, Long Fung / Lung Fung,
"Harbor" (spell it Harbour), Iron Peak as foundries or industry, anything supernatural.

HOW THE LOG WORKS
A trip is a small story the game builds from pools of lines. Day 1 is an OPEN line that names
a contact or a place; the game remembers it. Each later day is one beat: lead (progress),
deadEnd (a wrong lead, the day lost), snag (a small cost), find (a small extra), quiet
(nothing), or a CALLBACK line that mentions the contact or place named on day 1. Then a TURN
(the goal in reach, good or rough), sometimes a CALL (a fight breaks out and the player is
called in), and a CLOSE line: met, partial or failed. Each beat is rolled on one stat, and
{who} is the crew member best at it, so pools are split by stat. Stats: combat, stealth,
tech, social, piloting, medical, cool (no endurance pools). Every pool also has "any".

SLOTS (write them exactly; the game fills them, and capitalises a slot that starts a sentence):
  {who}          the crew member the day's roll was on
  {other}        another crew member (only if the crew has two or more; use sparingly)
  {contact}      a person's name only ("Old Lam")
  {contactWhat}  who they are, with "a" ("a scrap dealer with a cart"); use it once, in the
                 OPEN line, as "{contact}, {contactWhat}," or "{contactWhat} called {contact}"
  {place}        a place in the district, with "the" ("the ferry pier at Sai Wan")
  {district}     the district as it reads mid-sentence ("the Docks")
  {itemFull}     the weapon hunted, first mention, with "a" ("a Kestrel-9 carbine"); OPEN only
  {item}         the weapon after that, short, with "the" ("the Kestrel-9")
  {cash}         an amount, already formatted ("¥1,200")
  {lead}         a recruit's description (recruit file only), with "a"
                 ("a medic who walked out of a corp clinic"); {leadShort} after that ("the medic")
  {day}          the day number, for the rare line that wants it ("Day 3.")
Don't invent other slots.

RULES
1. One or two short sentences per line. It is read on a phone, one line at a time.
2. Specific and human. The game's tone is gritty but warm: loyalty and dark humour, with
   trouble arriving as events, not as the mood. Concrete things (a noodle stall, a wet
   stairwell, a broken lift) beat mood words. Dry is one flavour, not the only one: let
   the crew be funny, petty, kind, scared, smug. No exclamation marks. British spelling.
3. Past tense, as a report of the day ("{who} found...", "Nobody showed."). The crew may
   speak: a short quote from {who} is welcome, about one line in four
   ("{who} says the dumplings alone were worth the trip.").
4. Never name a crew member; use {who} and {other}. Never give anyone a gender through a slot
   (no he/she for {who}, {other} or {contact}: write around it, or use "they" sparingly).
5. Nobody dies in a line. The worst a snag does is a scrape or a bruise. Fights only start in
   a CALL line, which sets the scene and stops ("...and they're calling it in.").
6. No magic. Superstition is fine (a shrine, an unlucky number), never confirmed.
7. Everyone is an adult. No real brands, real people or real places outside the CONTEXT.
8. Each line must work on any day it could land on, so don't say "finally" or "first" except
   in OPEN, TURN and CLOSE.
9. CALLBACK lines must use {contact} or {place}, and must still read right whether day 1
   named a person or a place: write callbacks for each (callbackContact, callbackPlace).
10. Vary the openings: no more than two lines in a pool start the same way.
11. Middle days are not the end of the trip. Lines before CLOSE never say the crew "came back"
    or "came home"; they report the day.
12. A line says only what its beat does. A find line names what was found (cash lines use
    {cash}); a lead line moves the hunt on; a quiet line changes nothing. Only snag lines hurt
    anyone, and CLOSE lines never mention injuries (the game reports those itself).
13. Don't lean on {item} in every line: about half the middle-day lines at most, or a week of
    log repeats the same name. "It", "the case" and "the gun" are fine once it's been named.
14. Gear named in a line must be in the CONTEXT (a heat veil, a lens blinder) and must not
    assume {who} carries it unless the line still reads right if they don't.
15. The day lines carry the plot; personality lives mostly in quotes, asides, pair and joss.
    A good log reads like messages from people you know, not a police report.
16. Personality through moments, not reflections. Show what someone did or said ("{who}
    blames the black cat that sat on the van at noon"), not what they believe or value
    ("{who} preferred a cautious question to an enthusiastic promise"). These are criminals
    on an errand, not an HR policy: no line should sound like a lesson or a principle.

TONE EXAMPLES (the owner liked the mix: keep this variety; most days plain, some days funny,
a quote now and then, Joss rarely)
  plain:       The case was the right size. What was inside wasn't {item}. The day went with it.
  detail:      The case was the right size. Inside was a karaoke machine, still plugged in. The day went with it.
  quote:       Nobody useful showed. {who} got so bored they started rating the noodle stalls. "Two stars. Both of them."
  dark humour: Two people decided {who} looked easy to push around. The furniture lost, {who} won, and the stall owner sent us the bill.
  aside:       (superstitious) {who} blames the black cat that sat on the van at noon, and won't hear otherwise.
  pair:        {who} and {other} argued about the route for an hour. {who} was right, and hasn't stopped saying so.
  joss:        Joss: "Logged, oiled, and not to be fired indoors. I mean it."

FORMAT — GOAL file (weapon, cash or recruit)
```js
// Log lines: <goal>. Draft for the owner to mark.
export default {
  goal: 'weapon', // or 'cash', 'recruit'
  open:            { any: [/* 4+ */], social: [], tech: [], stealth: [] /* 2+ each where it fits */ },
  lead:            { any: [/* 6+ */], combat: [], stealth: [], tech: [], social: [], piloting: [], cool: [] },
  deadEnd:         { any: [/* 5+ */], social: [], tech: [] },
  snag:            { any: [/* 5+ */], combat: [], stealth: [], piloting: [] },
  find:            { cash: [/* 3+, each uses {cash} */], gear: [/* 3+: parts, ammo, a spare piece */], rumour: [/* 2+: a tip for later */] },
  quiet:           { any: [/* 4+ */] },
  callbackContact: { lead: [/* 3+ */], deadEnd: [/* 2+ */], snag: [/* 2+ */] },  // each uses {contact}
  callbackPlace:   { lead: [/* 3+ */], deadEnd: [/* 2+ */], snag: [/* 2+ */] },  // each uses {place}
  turn:            { good: [/* 3+ */], rough: [/* 3+ */] },
  call:            [/* 3+: a fight starts; end on "calling it in" or similar */],
  close:           { met: [/* 3+ */], partial: [/* 3+ */], failed: [/* 3+ */] },
  // Personality. Asides are ONE sentence that can follow any day line of this goal; key by
  // temperament tag (superstitious, money, warm, hot, wary, calm, cold, charming, curious,
  // chrome, haunted). 2+ for at least six tags.
  asides:          { superstitious: [], money: [], warm: [], hot: [], wary: [], curious: [] },
  pair:            [/* 4+: a middle day about {who} and {other} together; it may also move the hunt on a little */],
  joss:            { day: [/* 4+: Joss's comment on a day, starts "Joss:" */], met: [/* 2+ */], failed: [/* 2+ */] },
};
```
Stat lists may be empty when a stat doesn't fit the goal; aim for at least two lines in each
list you fill. What CLOSE gives back, so the lines match it: met = the goal; partial = a weapon hunt
brings parts or a lesser piece, a cash run part of the sum, a recruit hunt a name but no
meeting yet; failed = only the finds from the way.
A weapon hunt is about finding who has it and getting it off them (buy, trade,
lift, win). A cash run is about a debt, a stash, a skim or a quick score — small-time, not a
heist. A recruit hunt is about hearing of someone, finding them, and getting a conversation;
{lead} is who they're after, and close.met ends with the person willing to meet the fixer.

FORMAT — DISTRICT file
```js
// Log lines: <district>. Draft for the owner to mark.
export default {
  district: 'docks', // oldTown, docks, nightMarket, heights, basin
  contacts: [/* 8+: { name: 'Old Lam', what: 'a scrap dealer with a cart' } — mixed ages, backgrounds and communities */],
  places:   [/* 8+: specific places, each a short noun phrase */],
  quiet:    [/* 4+: a quiet day that could only happen in this district */],
  snag:     [/* 3+: a district-flavoured small trouble */],
};
```
Contacts are small people a crew can reach: stallholders, dock clerks, drivers, clinic
nurses, bookies, building managers. Never the named powers in the CONTEXT (Auntie Fung,
Madam Rao, Mr. Szeto, the Ferryman, Ruth Okonkwo and the like) and never a runner.

FORMAT — JOB DAYS file (a hands-off job played over several days)
```js
// Log lines: <job>. Draft for the owner to mark.
export default {
  job: '<job id or name>',
  casing:  { any: [/* 4+ */], stealth: [], tech: [], social: [] },  // learning the place
  setup:   { any: [/* 4+ */], tech: [], piloting: [], social: [] }, // getting what the night needs
  waiting: { any: [/* 3+ */] },                                      // the right night hasn't come
  snag:    { any: [/* 3+ */] },                                      // a small thing went wrong: a delay or a scare, never money or a wound
  // Optional personality, as in a GOAL file; where a job has none, the generic job-days file's are used.
  asides:  { superstitious: [], money: [], warm: [], hot: [], wary: [], calm: [] },
  pair:    [/* {who} and {other} on one of the days */],
  joss:    { day: [/* "Joss: ..." */] },
};
```
The job's own beats and crises tell the night itself; these lines fill the days before it.
Write for this job's place and client, not for any job.

REQUEST (replace this line with ONE of: GOAL: weapon / GOAL: cash / GOAL: recruit /
DISTRICT: <name> / JOB DAYS: <job>, and add any notes below it):
GOAL: cash
