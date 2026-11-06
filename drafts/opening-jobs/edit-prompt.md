# Prompt: edit an opening job

Paste everything in the box into a fresh chat, then paste one opening job file from
`drafts/opening-jobs/` after it, and say what you want changed (or ask for a polish). The reply is the
whole file again, ready to save over the old one. Then check it:
`node scripts/check-job.mjs drafts/opening-jobs/<file>.js`.

The CONTEXT and RULES below are copied from `docs/new-job-prompt.md`, which `tests/prompts.test.js`
keeps in step with `WORLD.md`. If canon changes, copy them again from there.

````
You help edit an OPENING JOB for a game. Read the CONTEXT, the RULES and the OPENING JOBS
notes, then the job file pasted after this prompt, then the owner's request. Reply with the
whole edited JavaScript file in one code block, then a few short lines on what you
changed and anything you weren't sure about. Nothing before the code block.

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
WEAPONS: guns and tech are standard kit for mercs and crews (cyberpunk setting); using
one is what gets noticed, so gunfire brings police and heat. Drones are everywhere
(corporate, police, patched street drones flown off an implant at a neural-load cost).

DISTRICTS (always use these English names):
- Open at the start: Old Town (damp tenements, tea shops; Brass Anchor Society) · the
  Docks (cranes, containers; Aether-Harbour on paper, Red Lanterns on the tarmac) · the
  Night Market (dai pai dongs, chrome clinics, mahjong; Silver Fan Circle) · Glass
  Heights (corporate towers and labs; Veridian-Apex; officially renamed "Apex Ridge"
  but nobody on the street calls it that) · the Basin (a bowl below Glass Heights round
  Lantern Course, a floodlit 1891 racecourse that still races REAL horses, wrapped in
  2057 telemetry, live odds and illegal betting; Racing Association officially, Silver
  Fan in the Undercroft; jobs from Fung, Okonkwo and the Ferryman).
- Unlocked later, by reputation: the Silt (sinking shanty shelf on the 1994 wreckage,
  floods at high tide, lawless) · the Amber Reach (transit and money hub where the
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
drainage tunnels and bomb shelters).

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
STREET CAST (rookie work): Doc Siu (Old Town; ex-surgeon, unlicensed clinic under
Tenement Block 9, dry praise); Mrs. Ip (Night Market fish-ball stall at the Neon Dragon,
moves crates, tallies Fung's night loads at the old pier); Meena D'Sa (Rao's seamstress and counterkeeper); Tang Wai-chiu (Silver Fan
collector, third-floor parlour); Uncle Tariq (remittance booth, Pearl Haven House, backed
by Rao); Pang Man-ki (Veridian-Apex clinic administrator); Ho Sze-lam (Hoi-Sing field
supervisor, Old Town); Mak Chi-on (Racing Association stable-access official). Currency
is cash in ¥; no "credits" or "Bits".
Reputation tier promotions open the locked districts,
each introduced by a client: the Silt (the Ferryman), the Amber Reach (Okonkwo), Iron
Peak (Szeto).

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
  {mak} = a client's or street contact's name; {ferryman:approve} (and the same for the others) = one of their
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

OPENING JOBS (read these as well; they override the size and pay rules above where they differ)
- An opening job is a favour for a district's contact, done before they offer the tong a
  hall there. There is one per hall outside Old Town, the same for every player:
  Back Rent (Madam Rao, the Night Market: two rooms above her sari shop), Quarter to Two
  (the Ferryman, the Docks: a container office at the end of the old pier, with a stove),
  The Flat Doesn't Exist (Ruth Okonkwo, the Basin: a flat over a tack workshop, the Old
  Stand through the window), There Is No Forty-First Floor (Mr. Szeto, Glass Heights: a
  service floor of his tower that nobody upstairs remembers).
- The last beat is the contact handing over those rooms. Keep the details the hall's map
  draws: the Night Market's silk racks, cutting table, camphor chest, hot plate, roof
  hatch and shop stair; the Docks' stove, desk, cot and the ladder down to a boat; the
  Basin's saddle racks, workbench, the trapdoor up from the workshop and the yard stair;
  Glass Heights' server racks, air handlers, service lift and maintenance stair.
- The writing bar is a step above routine work, because every player meets these and
  each is read once. A first beat that puts you somewhere (a smell, a sound, the light). A
  last beat that lands on a line from the contact. Contacts who talk past what they mean.
  Street people who want things of their own. At least two crises that are choices about
  people, not obstacles. Lines still phone-length: 1-2 sentences.
- Quality, not borrowing: nothing taken from other games (Shadowrun, Cyberpunk 2077 or
  any other), only the same care with words.
- Keep each job's shape unless the owner asks: its id, district, threat, pay, days,
  crewSize, 5 beats and 6 crises, every crisis's abort last, and the stats and
  difficulties. Change words freely.
- Canon to protect: the Ferryman's "old man" is a hint at his secret (the real Leung
  drowned in 1994), never told. Whoever lives on Szeto's forty-first floor is a mystery,
  and is not Lo the electrician. Meena D'Sa and Tang Wai-chiu have no stated pronouns:
  write round them. Mak Chi-on and Ho Sze-lam are he.
- Defaults the owner may change: Back Rent adds no Silver Fan grudge (add
  `against: 'silverFan',` after `keyStats` to make it count); failing costs only the
  exits' usual price.

THE OWNER'S REQUEST
[What to change, e.g. "make Rao's brief sharper", "a different third crisis", "polish the
whole job". Then paste the job file below.]
````
