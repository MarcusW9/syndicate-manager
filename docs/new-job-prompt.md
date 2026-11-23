# Prompt: write a new job

Use this to draft new jobs (missions) in any chat, outside a Claude Code session. The result is one JavaScript file in the game's own format. Add it in a Claude Code session with `/add-job` (Sonnet is enough): adding it is a few small edits (the file, one import, the client's job list) and a test run.

## How to use it

1. Open a fresh chat and paste everything in the box below.
2. Replace the **PITCH** at the bottom with your idea: who the client is, which district, how hard, and what happens. A sentence or two is enough.
3. Read what comes back. If you want changes, ask for them in the same chat.
4. In a Claude Code session, switch to Sonnet (`/model`), type `/add-job` and paste the file after it. Sonnet is enough: `/add-job` (`.claude/commands/add-job.md`) walks it through checking, registering, testing and committing the job. Several jobs can go in one paste.

The world context in the box is a copy of the block in `WORLD.md` (a test checks they match, so update both together). If you'd rather write a job in plain English and have Claude turn it into data, `WRITING_GUIDE.md` has fill-in templates for that; this prompt skips the conversion, so adding a job costs a session almost nothing.

````
You write jobs (missions) for a game. Read the CONTEXT, then the RULES and FORMAT, then
write one job for the PITCH at the end. Reply with ONLY the JavaScript file, in one code
block: no notes before or after.

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
raids. Institution: Lantern Bay Racing Association (racing and the city's licensed-gambling
monopoly, defended hard through lawyers, landlords and suppliers; its money funds clinics,
training and storm relief; independent, no megacorp owns it, deep in the MDA; fears race
fixing above all; hires tongs as contractors). Wildcard: Ghost Circuit (data liberators in Old Town's
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
- Smaller recurring clients inside institutions (2026-11-22): their trust is their own,
  never their employer's protection. Association (the Basin): Hui Lai-sum (community
  services), Yip Ka-chun (racing integrity), Chan Wing-kei (licensing and commercial
  protection). Lau Ching-yee (Morrow & Venn marine claims surveyor; calls with work);
  Dr. Choi Pui-ling (Veridian-Apex neural-device aftercare); Mok Wai-lun (Hoi-Sing
  restoration coordinator, Old Town); Kwan Yiu-kit (AHL subcontractor accounts, Docks;
  calls with work); Lui Shuk-ping
  (Red Lanterns freight-yard steward; no tribute or grudge cancelled); Inspector Cheuk
  Tak-fai (Wet Sleeve, 4th Precinct; corrupt, dislikes some corruption; no immunity, no
  raid call-offs). Judge the request, not the employer.
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
TONGS AS WORK (2026-11-22): running is a respectable career; a tong (elsewhere, a guild)
is the alternative to a lifelong corporate post: less security, more independence and a
say in the work. Tongs range from three people in a damp room to great halls that outlast
their stars; size, fame and decency don't rise together, and registration doesn't make a
tong honest. Lantern Bay's fame is local: recognised at a food stall, claimed by a street.
TONGS: runners swear in at the founding room above the noodle shop, regardless of their hall, by drinking tea poured by the fixer, writing their own name in the tong's ledger before the crew and altar, and leaving an offering; the ceremony has no recitation, blood, numbers or ranks, sworn names remain after departure, and long-serving runners are remembered on the wall beside the altar (the Hall of Legends), with a crew member writing each name and Joss checking the spelling.
TONE: gritty but human. Warmth, loyalty and dark humour are the baseline; darker
moments arrive as events. All characters 18+. Entries 1–2 sentences, phone-readable.
Everything is invented: no real companies, triads, people or Hong Kong place names, and
nothing from Shadowrun or Cyberpunk 2077.

RETIRED — never use: Pak Kok, Hoi-Sing Container Reach, Lang-Yan Bazaar, Tit-Kyu,
Kim-Ah Terminal, San-Pui Flats, Aether-Kowloon / AKL, Kowloon, Long Fung / Lung Fung,
"Harbor" (spell it Harbour), Iron Peak as foundries or industry, anything supernatural.

RULES

How a job plays: the crew goes in; the beats are narrated in order; 2 or 3 of the job's
crises come up between the beats (3 on threat 4-5); at each crisis the player (or the
crew's standing orders) picks one choice. A choice rolls one stat:
d20 + the operative's stat must reach 10 + difficulty. Stats run about 4-14.

- Every crisis MUST have an exit: a choice with kind 'abort' (or 'extract'). This is the
  game's core promise: nobody dies unless the player chose to push on. The abort is
  always last, costs pay ({ payCut: 1 } or less) and often client trust, and never rolls
  (stat 'cool', difficulty 0).
- Every crisis has 2 or 3 real choices before the abort, each a different approach and,
  where it fits, a different stat: one bold ('push'), one clever or costly ('adapt').
  A 'sure: true' choice never rolls: it pays something (cash, pay or heat) to be safe.
- Difficulty by tier. Rookie (threat 1, rookie: true): 3-8. Threat 2: 8-13.
  Threat 3: 11-14. Threat 4-5: 11-15. Mix them inside a job.
- failureInjury: 'none', 'light' or 'serious'; 'critical' only rarely, on the boldest
  push in a threat 4-5 job (the player then chooses whether to risk a life). Riskier
  choices hurt more; most failures cost instead of hurt: failureCost: { heat: 1, payCut: 0.3 }.
- Costs: cost (paid whatever the roll) and failureCost (only if it fails) take
  payCut (0-1, share of the pay lost; negative = bonus), heat (1-2), cash (negative =
  spent, e.g. -600) and clientTrust (-5 or -10, on aborts).
- requires (optional) hides a choice unless the crew has it:
  { kind: 'role', value: 'tech' } or { kind: 'stat', value: 'driving', min: 13 }.
  Roles: medic, muscle, tech, driver, face, infiltrator.
- neural: 10-15 on tech work done through an implant (adds neural load to whoever rolls).
- Text tokens, filled in by the game:
  {op} = whoever acts or rolls. {driver} {tech} {face} {muscle} {medic} {infiltrator} =
  the crew member with that role (only use a role token where the choice requires that
  role, or in beats). {szeto} {ferryman} {rao} {okonkwo} {siu} {ip} {meena} {tang} {tariq} {pang} {ho}
  {mak} {chow} {edith} {kwok} {poon} {binta} = a client's or street contact's name; {ferryman:approve} (and the same for the others) = one of their
  approving lines (use it in the last beat). Auntie Fung has no token: write her name.
- Every choice has report: { success, failure }: one plain past-tense sentence for the
  after-action report, no jokes, names via tokens. Plain does not mean legal: use short,
  concrete verbs ("paid", "got in", "lost the lead"), not "incurred", "secured" or
  "established". Aborts and sure choices need only
  success. If a cost applies, the report line ends with it ("Heat +1.", "Pay -20%.").
- Crisis placement: after: N means it can't come up before beat N (0 = after the first
  beat; N must be lower than the number of beats minus 1). order: -1 puts it earlier
  among the drawn crises, 1 later. Use after on every crisis so the story stays in order.
- situations: tag each crisis with 1-2 of: escape, entry, crowd, street-tech, corp-tech,
  fight, threat, injury, police, law, weather, neural.
- Voice: short, concrete sentences; phone-readable; specific details over adjectives
  (a smell, a sign, a sound); dry humour; nobody is a cartoon villain. Choice labels are
  actions in under ten words. success/failure lines are one sentence each.
- Quality (lessons from the first batches of jobs; follow these as well):
  - Brief: under 320 characters.
  - Pronouns: Joss is they. Doc Siu, Auntie Fung, Madam Rao, Ruth Okonkwo and Mrs. Ip are
    she. Mr. Szeto and the Ferryman are he. Check every "he", "his" and "him" in the job.
  - Failures: at most a third may cost only a fee, charge or deposit. Give the rest a
    different price: a client's trust, a named person's reaction, a lost item, a rumour,
    time, or an injury. Money and heat are not the only things that can go wrong.
  - Shape: don't repeat the same six crises (a gate or desk, a blocker, a tech problem,
    a trolley or van problem, a checkpoint, a last confrontation). Use a transport crisis
    only if the job is about moving something. At least one crisis should be a choice
    about people (who to trust, what to say, who to leave behind), not an obstacle.
  - People: give the job one named person from the street cast above, as a contact or an
    antagonist, and use them in at least two crises. A clerk, an attendant and a manager
    with no names make a job feel the same as the last one.
  - Sure options: at least half of them should cost something other than cash: a favour
    owed, part of the pay, a clue handed over, or someone left behind.
  - Stakes: prefer a job where a person's choice is at stake (someone who must still say
    yes, a patient, a worker who shouldn't be blamed) over a plain retrieval. Write the
    failure as that person's loss, not only the crew's.
- Size: 4-5 beats, exactly 6 crises. Pay: rookie 1,300-1,800; threat 2 3,000-4,500;
  threat 3 4,000-5,500; threat 4 6,000-7,000; threat 5 ~12,000. days: 1 (2-3 only for big
  jobs). crewSize: 2 rookie, 3 mid, 4 big. heat: 0.
- keyStats: the 2-3 stats the job leans on (combat, stealth, tech, social, driving,
  medical, cool).
- id: snake_case, new. The export name: SCREAMING_SNAKE_CASE of the job's name.

FORMAT (copy this shape exactly; this is a cut-down real job)

```js
// Wrong Horse: the Ferryman brought a horse into the city for the Racing Association,
// and it has the right chip and the wrong markings. Rolls aimed at 11-14. Every choice
// has a `report` line.

/** @type {import('../../core/types.js').MissionTemplate} */
export const WRONG_HORSE = {
  id: 'wrong_horse',
  name: 'Wrong Horse',
  district: 'basin', // oldTown | docks | nightMarket | heights | basin
  threat: 3,
  pay: 5500,
  days: 1,
  crewSize: 3,
  keyStats: ['medical', 'tech', 'stealth'],
  brief: '{ferryman} holds the boat off the landing with one foot. "Last tide I carried a horse for the Racing Association. Right chip. Clean papers. The stable hand says the markings are wrong. Find out what I carried."',
  beats: [
    'Under the Paddock, the stables smell of straw, rain and disinfectant.',
    'The horse in stall nine has a white blaze its registration swears it doesn\'t have.',
    'Its chip reads clean. Everything else about it is somebody else\'s horse.',
    'Upstairs in the Glass Galleries, an owner is drinking to a horse that isn\'t his.',
    'On the boat, {ferryman} hears it all and spits into the harbour. "{ferryman:approve}"',
  ],
  crises: [
    {
      id: 'stall_nine',
      situations: ['entry', 'threat'],
      after: 0, order: -1,
      text: 'Private security in Glass Galleries colours is standing on stall nine. The Association doesn\'t hire them.',
      choices: [
        { id: 'sneak', label: '{op} goes in over the hayloft', kind: 'push', stat: 'stealth', difficulty: 13,
          success: 'Along a beam, down a rope, and into the stall behind their backs.', failure: 'A rotten board gives way and {op} drops into the next stall with a very large horse.', failureInjury: 'serious',
          report: { success: '{op} got into stall nine over the hayloft.', failure: '{op} fell through the hayloft into a horse\'s stall.' } },
        { id: 'vets', label: '{face} walks up as the Association\'s duty vet', kind: 'adapt', stat: 'social', difficulty: 13, requires: { kind: 'role', value: 'face' },
          success: '"Pre-race welfare check. Do you want to be the one who says no?" They don\'t.', failure: 'They let you in, and photograph your face for their boss.', failureInjury: 'none', failureCost: { heat: 1 },
          report: { success: '{face} bluffed past the private guards as a vet.', failure: 'The private guards photographed {face}. Heat +1.' } },
        { id: 'abort', label: 'Abort: tell the Ferryman you couldn\'t get near it', kind: 'abort', stat: 'cool', difficulty: 0, cost: { payCut: 1, clientTrust: -5 },
          success: 'He looks at the water a long time, then pushes off.', failure: '', failureInjury: 'none',
          report: { success: 'The crew couldn\'t get near stall nine.' } },
      ],
    },
    {
      id: 'real_horse',
      situations: ['entry'],
      after: 2, order: 1,
      text: 'An old stable hand pulls you aside. "The real one\'s in the old ice store under the Undercroft. She\'s not eating."',
      choices: [
        { id: 'find', label: 'Go down and find her', kind: 'push', stat: 'stealth', difficulty: 13,
          success: 'A thin bay mare in the dark, with the right markings. A photograph is worth more than a chip.', failure: 'Two bookmakers\' men are already down there with her.', failureInjury: 'serious',
          report: { success: 'The crew found and photographed the real horse.', failure: 'Bookmakers\' men caught {op} by the real horse.' } },
        { id: 'pay', label: 'Pay the old hand ¥600 to take the photo himself', kind: 'adapt', sure: true, stat: 'cool', difficulty: 0, cost: { cash: -600 },
          success: 'He comes back with the picture and tears in his eyes. "Feed her for me, someone."', failure: '', failureInjury: 'none',
          report: { success: 'The crew paid a stable hand ¥600 to photograph the real horse.' } },
        { id: 'abort', label: 'Abort: thank him and leave', kind: 'abort', stat: 'cool', difficulty: 0, cost: { payCut: 0.6 },
          success: 'You leave her in the dark. You\'ll think about that.', failure: '', failureInjury: 'none',
          report: { success: 'The crew left the real horse in the ice store.' } },
      ],
    },
    // ...four more crises, six in all
  ],
  heat: 0,
};
```

For a rookie job add `rookie: true,` after threat, and keep difficulty 3-8.
For a job no client offers (it turns up as walk-in work) add `walkIn: true,` too.

ROUTINE WORK (add `routine: true,` after threat): everyday jobs the board offers often, so
they must survive repeating.
- No one-off events, named first-times or plot reveals. It should read fine the tenth time.
- Beats describe the job, not a story: the pickup, the route, the handover.
- The 6 crises carry the variety (only 2-3 are drawn each time): make them as different as
  possible, e.g. a crowd, the police, the weather, a rival, something breaking, someone
  trying to cheat you.
- Rookie or threat 2, crewSize 2, days 1-2, pay at the low end of its tier.
- The same kind of work in several districts is one file per district (a Docks courier
  run and a Night Market courier run).

MULTI-MAP JOBS (optional; only if the PITCH says "maps: yes"). The crew goes to 2 or 3
places, each on its own map with one crisis there, before the job's own beats and crises
play at the last place (the FINALE). Use it when the story moves: a robbery in three
places, a run of drops, someone to track down. Add a `maps` block after `brief`:

```js
  maps: {
    start: 'first',              // the stop the job starts at
    heading: 'Making the drops', // optional: the watch's heading between maps (default "On the move")
    stops: {
      first: { district: 'docks', time: '10:15', place: 'a fish market\'s cold room', crisis: 'cold_room',
        next: ['second'], arrive: 'The line the crew arrives on (one or two sentences).' },
      second: { district: 'nightMarket', time: '14:40', place: 'a tailor\'s back door', crisis: 'back_door',
        next: ['finale'], arrive: '...' },
    },
    finale: { time: '23:30', place: 'the night', arrive: 'The line before the job\'s own beats begin.' },
  },
```

- Each stop names a crisis from the job's own `crises`, written like any other but marked
  `stop: true` and with no `after` or `order` (it plays at its stop), and an abort as always. These
  stop crises come on top of the job's six; the six play at the finale, in the job's own
  district, as usual.
- The route: one `next` per stop makes it the same every time. Several `next` (e.g.
  ['lockup', 'backroom']) pick one of them, so the job plays differently each time. The last
  stop leads to 'finale'. At most 3 stops on any route before the finale.
- Optional, for a job about following leads: `skip: 'finale'` on a stop lets a very strong
  result go straight to the finale; a stop with `wrong: true` (and no `next`) is a dead end a
  failed stop can send the crew to once, before they get back on track.
- Times run forward through the day; the finale is usually that night. Give the job
  `days: 2` (the stops on the first day, the finale on the second), threat 3 or more.

FIGHT JOBS (optional; only if the PITCH says "fight: yes"). Most jobs leave this out. A fight
job plays its fight on the live map with orders, and may have WAVES: groups of enemies that
arrive on a set round. Give the job's story a reason for each wave (a tip-off, a shift
change, a second crew). Put this comment block as the FIRST thing in the file, above the
job's own header comment, filled in; no code, only the comment:

```js
/* FIGHT
type: holdHack | holdExtract | holdYard
  holdHack: hold while the tech works; it ends when the work is done or at round 7.
  holdExtract: hold until the van comes at round 3, then board; it leaves about round 7.
  holdYard: no van; won when every enemy is down or has run.
opposition: police | corporate | none
  police or corporate: one leader plus armoured grunts who come in numbers.
waves: (none, or one line each, in round order)
  round 3: 3 hired, because <the story's reason>
  round 5: 2 (no kind: the job's opposition, else the district's usual enemy), because <reason>
  kinds: hired, corp, drone, enforcer, police, secforce
reinforcement cap: (optional; how many backup calls and clock arrivals at most, default 2)
*/
```

Limits: a holdHack wave at round 7 or later never comes; a holdExtract wave after about round
7 comes too late (rounds 4-6 land while the crew boards, the hardest moment); in holdYard every
wave makes the fight longer. Hired, drones, police and secforce are 1 pip (police and
secforce wear a plate the first plain hit only cracks); corp and enforcers are 2 pips and hit
for 2. Arrivals spend their first round coming in: they can be shot, but don't shoot back that
round. Three waves at most; a fight job is threat 3 or more.

PITCH
Client: [Auntie Fung / Mr. Szeto / the Ferryman / Madam Rao / Ruth Okonkwo / Doc Siu /
Mrs. Ip / Forewoman Tse / Lau Ching-yee / Kwan Yiu-kit / walk-in]
District: [Old Town / the Docks / the Night Market / Glass Heights / the Basin]
Tier: [rookie / threat 2 / 3 / 4 / 5] [routine: yes / no]
Idea: [one or two sentences: what the client wants and what makes it interesting]
Fight: [no / yes: the fight type, who stands against the crew, and the waves you have in mind]
Maps: [no / yes: the places the crew goes before the finale, and whether the route is fixed or branches]
````

## What Claude does with the file

- Runs `node scripts/check-job.mjs <file>` on it first (`core/jobcheck.js`): errors (a crisis with no way out, an unknown token like `{fung}`, a retired name, a clashing id) get fixed; warnings (difficulty or pay outside the tier, long lines, a role named but not required) get a look.
- Saves it as `src/data/missions/<name>.js`, imports it in `src/data/missions.js` and adds it to `MISSIONS`.
- Adds its id to the client's `jobs` in `src/data/clients.js` (ids: `fung`, `szeto`, `ferryman`, `rao`, `okonkwo`, `ip`, `tse`, `lau`, `kwan`). Walk-in jobs need no client; Doc Siu's and Mrs. Ip's are rookie work, offered by Auntie Fung or as walk-ins.
- Runs the tests: `core/validate.js` checks every crisis has an exit and every choice has its lines.
- Routine work (`routine: true`): the checker warns if it's past threat 2, a crew of 2 or 2 days. Until the board treats routine work specially, it is offered like any other job of its tier.
- A fight job (the `/* FIGHT */` block): adds the job to `FIGHT_JOBS`, its `opposition` to the job, and its waves to `FIGHT_RECIPES` in `src/data/fights.js` (the format: `docs/fight-recipe-template.md`), then runs the fight sims before and after. That is a balance change, so it takes a stronger model than Sonnet and gets a DESIGN.md row.
- A multi-map job (a `maps` block): the checker runs `validateMaps` on it (every stop's crisis exists and is marked `stop: true`, every route reaches the finale within 4 stops, every stop has a district, time and arrival line). The engine is `core/multimap.js`; the real example is `src/data/missions/kidnap.js`.
- Adds a changelog entry (newest file in `docs/changelog/`). New canon in the job (a person, a place) also gets a line in `WORLD.md` and a DESIGN.md row.
