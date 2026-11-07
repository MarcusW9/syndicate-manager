# Phase 3: heists, Legends, rival tongs, loyalty (proposal, 2026-11-07)

**Not built.** The plan for the tong's Phase 3, from the owner's "Guild Direction" handover (written
outside the repo against save v29) after checking it against main at save v46. DESIGN.md 2026-11-07
has the decision row. Each part is built in slices, one PR each, with the owner's calls from section 6
first.

## 0. What the handover asked for that already exists

Most of the handover's Phases 1 and 2 shipped under the tong's names, so they are **not** in this
plan:

| Handover | In the game |
| --- | --- |
| Hands-off by default, multi-day jobs, call-ins, Due Sunday, Monday briefing, Sunday summary, crew standards | `core/away.js`, `core/jobs.js`, `core/week.js`, `core/lead.js`, `core/worth.js` (#62-#75) |
| Career record | `core/record.js`, milestones and highlights (renown slices 1-2) |
| Standing: Unknown → Established → Elite → Legend | Fame (Unknown, Known, Respected, Elite, Legend) and standing 0-100 (`core/fame.js`). **Kept as built:** Elite can be lost, Legend can't. |
| Districts as presence, safehouses, guild rank by districts | Halls (`core/halls.js`), opening jobs, the tong's rank following the halls (`core/tong.js`) |
| Per-district heat, telegraphed raids | `core/heat.js`, police raids (`core/raids.js`), gang raids (`core/gangs.js`) |
| Facilities | Hall building (`core/hallbuild.js`) |
| Save size | The inbox is bounded (#106, save v46) |

Still open from the handover and **not** in this plan: cutting morale (still written in
`core/mission.js` and `core/time.js`; agreed 2026-10-26). It's a small clean-up to do before
part D, so loyalty doesn't sit beside a second mood bar.

## 1. Order, and why

1. **A. Heists.** The 2026-11-04 promise ("big heists become the tests of a rank"), a real reason
   for Take Command (the playtest called it "nice to have"), and work for the bench: prep jobs in
   several districts want several crews out at once.
2. **B. The Legend defining job** (renown slice 5). Small, already specified, and a heist finale is
   its natural stage.
3. **C. Rival tongs.** The league around you: who's rising, who's falling, whose runners are
   famous. Needs its own lore first.
4. **D. Loyalty and mobility.** Needs rival tongs to exist (someone has to make the offer), and
   pairs with retirement (renown slice 6): both are a runner leaving.

## 2. Part A: heists

A heist is a big score with **prep jobs** that each change the **finale**. It runs over weeks while
ordinary work pays the bills.

### Rules (proposed)

- **Offered** by a contact on a Monday once the tong is big enough (rank and reputation; numbers in
  section 6). Joss's briefing names it. Taking it on costs nothing; it sits on Ops with its date.
- **The finale has a date** (the target's window: "three nights while he's in Singapore"). Prep has
  to be done before it. That's the weekly planning pull: who goes on prep, who keeps the bills paid.
- **Prep jobs** are ordinary offers, flagged "Black Sun · prep 2 of 4", posted like opening jobs
  (`addOffer`, outside the week's count). Each can use an existing template (the handover's
  "built from existing templates with a `feedsInto` link") with a heist line in its brief, so the
  first heist needs little new writing.
- **Each prep step changes the finale in a way you can see on its plan** (the rumour rule: shown
  risk is used risk). Effects, using levers the engine already has:

  | Effect | What it does | Lever it reuses |
  | --- | --- | --- |
  | `threat: -1` | The finale is one step less dangerous | `threatDelta` in `jobView` |
  | `drop: crisisId` | That crisis can't come up | the crisis pool in `startMission` |
  | `know: crisisId` | That crisis is shown on the plan and its rolls get +1 | rumour crises, the "watched" -1 |
  | `pay: +x%` | A fence lined up: the score is worth more | `payMult` |
  | `exit` | A clean way out: the finale's abort/extract costs no heat | crisis choice costs |

- **Failed prep makes the finale harder, not impossible.** A failed or walked-away step can be
  tried once more (a different template, as opening jobs do), **bought** from a fixer for cash, or
  done without. Nothing locks the finale.
- **The finale** is a normal threat-5 job: let them run, watch, or Take Command. Only one job can be
  live at a time (`state.activeMission`), so a finale under command waits for any open call-in. The
  death rule is unchanged: every crisis has its exit, and death only follows "push on".
- **Missing the date** loses the heist (the target's gone). The contact may offer another later.
- **The payoff:** big pay, reputation, a highlight for everyone on the finale, a record counter
  (`heists`), and possibly the rank (section 6).

### State (save bump)

```
state.heists = {
  blackSun: { status: 'offered' | 'open' | 'done' | 'failed' | 'missed',
              finaleDay, prep: { stepId: 'open' | 'done' | 'failed' | 'bought' | 'skipped' } }
}
```

Content in `src/data/heists.js`: `{ id, name, contact, district, finale: templateId, weeks,
prep: [{ id, templates: [...], effect }] }`. `core/validate.js` checks that every prep's effect
names a crisis the finale really has.

### Slices

- **A1. The engine, with a stand-in.** Penthouse Heist (threat 5, 3 days, Glass Heights) as the
  finale and existing templates as prep, to play the rhythm before anything is written. Ops card,
  plan lines for the effects, the Monday line, the Sunday summary line.
- **A2. Black Sun.** The first written heist: target, client, prep stories and finale. "Black Sun"
  is only a working name today; it's new canon, so it goes through `add-lore` and the owner writes
  it (a writing task with its prompt in `drafts/writing-tasks.md`).
- **A3, if play asks:** a second heist per later district; a heist as a district's opening job.

## 3. Part B: the Legend defining job

Build renown slice 5 as written: `drafts/PROPOSAL-runner-renown.md` section 2.7, with review
decision 6 (threat 3-4 templates). One addition: **when a heist is open and a ready runner can go on
its finale, the finale is their defining job** instead of a separate offer. A Legend made on a
heist is the story the game should tell.

Retirement and the Hall of Legends (slice 6) move to part D: both are runners leaving.

## 4. Part C: rival tongs

**Rival tongs are peers, not gangs** (owner, 2026-11-07). Gangs (the Red Lanterns, the Silver Fan
Circle) are turf powers you can hurt, who raid you for it. Rival tongs run the same business as you:
they chase the same contracts and the same runners. They compete with you as clubs do in a league;
they don't raid your halls.

### What they are

- **Generated per game**, as a manager game generates its league: 6 tongs at the start, from
  `hashRng(state.seed, 'rivals')`. Each has `{ id, name, home, style: loud | quiet | corporate | street,
  rank, prestige, wealth, depth, grudge }`. They use the same rank ladder as yours (Back Room to
  Harbour), so the Ledger reads "the Golden Tide · District tong" beside you.
- **Lore first:** one `add-lore` pass for the idea (what a rival tong is; why the big ones "run like
  companies now"; the Lantern List as the Lantern Course bookies' form that Joss reads) and a
  naming kit (name patterns per style, home districts) in `src/data/`. After that, no single rival
  tong needs canon of its own.
- **The Brass Anchor Society** is canon as "one of the oldest" tongs. Proposed: a fixed elder name on
  the Ledger, above the competition, never chasing your runners or contracts. Owner's call.

### Level of detail

Each runner is kept in only as much detail as the player can see.

| Tier | Who | Kept | Simulated |
| --- | --- | --- | --- |
| Full | Your crew | Everything, as now | Missions, growth, everything |
| Card | Rival stars and List entries (about 30-50) | `{ id, name, handle, role, tongId, tier, rating, peak, keyStat, age, loyalty, contractEnds, sworn, notes }` (`notes` at most 3 lines) | One weekly update |
| Number | Each rival's ordinary runners | `depth` on the tong | Folded into the tong's weekly roll |

- **Viewing a dossier stores nothing.** The full runner is built on the fly from
  `hashRng(state.seed, card.id)` and thrown away. The same goes for a rival crew on a job: built for
  that mission only.
- **Signing is the only promotion.** The card becomes a stored operative, generated the same way.
- **The full runner agrees with the card:** generation takes the card's tier, role, key stat and
  rating as constraints, and the seed fills in the rest, so a 74 on the List looks like a 74.
- **Leaving demotes.** A runner who leaves you becomes a card with their record counters, peak and
  one or two highlights, not their full history, so "he's #6 for the Golden Tide now" still works.
- **Ids are never reused**, including after a tong folds and another forms.

### The weekly sim

Once, in `settleWeek` (`core/time.js`), in a new `core/rivals.js`:

```js
function simRivals(state) {
  const rng = hashRng(state.seed, 'rivals', weekOf(state.day)); // never touches rngCounter
  for (const t of state.rivals.tongs) {          // a fixed array order
    const strength = t.depth + sum(starsOf(state, t).map((s) => s.rating)) / 10;
    const week = rollWeek(rng, strength, t.style); // big score / steady / bad week
    t.prestige = clamp(t.prestige * PRESTIGE_DECAY + week.prestige);
    t.wealth += week.cash - t.depth * WAGE_EST;
    for (const s of starsOf(state, t)) s.rating = drift(rng, s, week);
  }
  rerankList(state);       // sort about 50 cards plus ours
  maybeTransfers(state, rng);
  maybeFoldOrForm(state, rng);
}
```

- **Seeded with `hashRng`**, not by XOR-ing the seed with the week: a separate stream, so the rival
  sim can never shift one of your rolls.
- **One rating for both kinds.** The List mixes your runners with rival cards, so your runners'
  rating comes from what exists (standing 0-100, fame, tier, main stat) by the same scale the
  cards use. Otherwise yours and theirs never compare fairly.
- **Your prestige on the Ledger** is `state.reputation`. No new ladder.
- **Fame has a cost:** a runner high on the List adds a little heat to loud work, or makes some
  stealth work harder (numbers in section 6).

### Showing it (phone first: "less to read")

- **The Word:** three lines in the Monday briefing at most (a rise, a fall, one thing about you).
- **The Ledger and the List** one tap away on Ops. The List shows the top 20 on a phone, with yours
  marked; "show all" for the rest.

### Slices

- **C0. Lore** (`add-lore`): rival tongs, the naming kit, the List's place in the world.
- **C1. The league:** generated tongs and cards, the weekly sim, the Ledger, the List, The Word.
  Save bump; old saves get a league generated in `migrate`.
- **C2. Contact:** `twist_rival_crew` names a real tong and one of its stars (built on the fly); how
  it ends moves both tongs' prestige and, if you beat them, their grudge against you (kept on the
  tong, separate from the gangs' grudges; it fades on Sundays as those do).
- **C3. The market:** a free agent a month (from a folded tong or a released card); signing
  promotes the card. Buyouts later.
- **Later:** contested contracts, heist races (a rival preparing the same score).

## 5. Part D: loyalty and mobility

### Loyalty

- **Resolve `core/loyalty.js`:** today it's a renewal discount from jobs with the crew (1% a job,
  capped at 25%). It becomes `op.loyalty` (0-100, slow-moving over weeks), and the renewal discount
  is read from it, so renewals keep working.
- **Builds:** tenure, being used on serious work, fair pay, hard jobs together, being brought home
  from a critical, being a founder.
  **Erodes:** benched off big work, below-market pay, teammates lost after "push on", a renewal
  turned down.
  **Stars resent being saved:** the counterweight to "the cheapest crew I trust".
- **Not morale in disguise.** It moves weekly and only drives staying, leaving and what they ask
  for. (Cut morale first: section 0.)

### Mobility

- **Rivals approach your runners** only once your tong has minimum standing (section 6); never while
  they're on a job, away or hurt.
- **Joss always warns first,** a week ahead, with the offer. The player chooses: match it, give them
  bigger work, sell them (the rival pays a fee), or let them go. **Proposed: matching the offer always
  keeps them,** so losing a runner you built is a price you chose, never a surprise.
- **Who moves:** rookies often, pros sometimes, veterans and Elites rarely, Legends almost never;
  loyalty overrides tier.
- **Sworn** (working name; the word and the ceremony are invented, never real triad ranks or rites,
  and go through `add-lore`): after high loyalty and long tenure a runner swears in, a milestone that
  can pair with the crew tattoo mark. Sworn runners almost never leave; one who does is a defector,
  and the old tong holds a grudge.
- **Poaching theirs** adds to that tong's grudge.
- **Retirement and the Hall of Legends** (renown slice 6, `drafts/PROPOSAL-runner-renown.md` 2.8 and
  review decision 3) are built in this part: a decision message, never without the player's choice.

## 6. Owner's calls (before each part)

**A, heists**
1. When the first heist is offered: rank (Street? District?) and reputation.
2. Does finishing a heist move the tong's rank? Today the rank is one per hall. Options: a heist
   is needed for City and Harbour; or a heist only adds reputation and the rank stays with the
   halls.
3. Prep count (3-4?), the finale's window (3-4 weeks?), one retry per failed step, the fixer's price.
4. A1 with Penthouse Heist as the stand-in finale: yes or no.

**B, Legends**
5. A heist finale as a ready runner's defining job: yes or no.

**C, rival tongs**
6. How many tongs (6 proposed); whether they fold and form.
7. List size (top 20 shown on a phone; about 50 kept).
8. The Brass Anchor Society: a fixed elder on the Ledger, or left out of the league.
9. Fame's cost: heat on loud work, harder stealth, or none.

**D, loyalty**
10. Minimum standing before rivals approach (Street rank? District?).
11. Matching an offer always keeps them: yes or no.
12. The in-world word for sworn and unsworn, and how long to swear in.
13. Does releasing or selling a sworn runner hurt the rest of the crew's loyalty?

## 7. Tests and budgets

- **Saves:** every new field is made in `createNewGame` or defaulted in `migrate`; a `SAVE_VERSION`
  bump and a migration test with each slice that changes the shape.
- **Heists:** failed prep never locks the finale; every effect is shown on the finale's plan
  (shown = used); missing the date ends the heist cleanly; the death rule holds on the finale.
- **Rivals, determinism:** the same seed played with the rival sim on and off gives the same
  missions, rolls and cash for your crew. The same card always builds the same runner, and that
  runner matches the card's tier, role, key stat and rating.
- **Rivals, size and speed:** at most 60 cards and 8 news lines a tong; the league adds under 30KB
  to a 52-week save; 52 weeks of `simRivals` in under a second in Node.
- **Loyalty:** nobody leaves without a warning and a choice; no approach mid-job, away or hurt;
  sworn runners leave far more rarely than unsworn ones (a long-run sim, wide bands).
- **Long-run sanity** (wide bands): Elite stays rare, Legends don't come from low-threat repetition,
  and careers end in more ways than death.
- **Economy:** heists change the cash curve. Re-measure with `scripts/sim-phase2.mjs` (a player who
  takes the heist) beside the 2026-11-06 numbers, and log any new band in DESIGN.md.
