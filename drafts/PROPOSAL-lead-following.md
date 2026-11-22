# Proposal: a rescue that follows leads (the multi-map pilot)

Status: proposal, 2026-11-22, for the owner to approve before anything is built. Follows `drafts/HANDOFF-revenue-next.md` ("After that: multi-map operations"). The owner's calls so far: the pilot is a **lead-following job**, and it is a **rescue for a client** (not one of our own runners). 2026-11-22: **rebuild Kidnap Rescue** (question 1) and **Claude drafts the stops** in the agreed log style for the owner to mark (question 4). Questions 2 (time) and 3 (the clock) were explained again in the session and await a yes.

## What it is

A client's person has been taken. The crew follows the trail to where they're held, gets them out alive and brings them home. **2 to 4 stops**, each its own map. What the crew finds at a stop points to the next, and sometimes the lead is wrong. The last stop is the rescue itself.

It stays a job: a client, pay, heat, fame and trust as usual, planned on the squad board and offered on the board like any job. Every crisis keeps an abort or extract. Death only follows a risk the player accepted and was shown, as now.

## The pilot (recommended): Kidnap Rescue, rebuilt as a trail

`src/data/missions/kidnap.js` already exists: an accountant snatched off the street and held above a closed cha chaan teng in Old Town. It's threat 4, ¥7,000, for Auntie Fung or Madam Rao. Its crises already read like stops: a lookout in the alley, the kidnappers **moving him** (one choice is "tail the car to wherever they take him"), a call from the kidnappers, the wrong floor, and getting a hurt hostage out. Rebuilding it as a trail needs **no new canon**:

1. **Where he was taken** (fixed first stop, street level, Old Town): a witness, a dropped handset, a car seen leaving. The clue is which way they went.
2. **The first lead**, rolled from that clue: a lock-up in the Docks, a back room in the Night Market, or a stairwell in Old Town. Someone here knows where he's held, or he was here and has been moved.
3. **A wrong lead, sometimes** (see below).
4. **Where he's held** (the finale): the cha chaan teng's second floor from the current job, or wherever the trail ended. The lookout, the wrong floor and the hostage hurt happen here. Getting out is an **extraction fight** (`holdExtract`: hold for the van, then board), with the hostage carried like a wounded runner. Both already exist in the fight engine.

The alternative is a new, smaller rescue for Mrs. Ip, at rookie or street tier (a market delivery rider grabbed over a stallholder's debt, Night Market → Docks). That's an easier first rescue for a new tong, but it needs new text and a new person in canon (through `add-lore`).

## How a stop plays

Each stop is one place on one map:
- an **arrival line** with a time on it ("02:40. The lock-up's chain is new; the padlock isn't"),
- **one scene**: a crisis (choices with an abort or extract), a fight on that map (engine 2), or a single roll on the crew's best stat for a quiet stop,
- **what was found**: a **good** clue (the next stop is right) or a **rough** one (the next stop may be a wrong lead). A strong success means a good clue. A plain success is usually good. A failure means a rough clue plus the crisis's usual cost.

## The clock (what makes it a rescue)

The hostage won't stay put. Each stop past the second makes it more likely they're **moved** before the crew gets there, and a wrong lead makes it a lot more likely. Moved means the finale is harder: one more guard (threat +1), and the hostage starts hurt (the existing hostage_hurt crisis). There's no failure screen just for being slow. The rescue gets tougher, as it would.

**Wrong leads:** a rough clue sends the crew to a wrong lead 40% of the time. It's a short scene (a dead end, or someone who wants paying), then the true lead turns up there. The cost is a stop of time (heat on the way out, the clock ticking), not pay. There's at most one wrong lead per job, and never more than 4 stops in all.

## The hostage

The hostage is a person in the job, not a runner. They can be hurt, carried and brought home. **The hostage never dies on screen.** The outcome is: home safe (full pay, trust up), home hurt (a pay cut), or not reached (the crew aborted or pulled back, so no pay and trust down, as the job's abort costs say now). That keeps the death rules about our own people as they are, and keeps the tone ("gritty but human").

## Time

**One night, stops in hours** (02:40, 03:55, 05:10). A live job plays in one sitting, with a travel card between maps. A hands-off job plays the same night in shares, as now, and writes each stop to the log. A stop a day would make the clock meaningless and make this the only live job that spans days.

## What it needs (build order, each its own PR)

1. **Data shape.** A job gets `stops: [...]`. Each stop has `place`, `site` (district and target), `arrive` (text), `scene` (a crisis id, `fight` or `roll`), and `clues` (the next stops and their weights). The job also gets `wrongLeads`, plus `hostage` (name, and lines for safe, hurt and moved). `validate.js` and `jobcheck.js` learn the rules: 2 to 4 stops, an abort or extract in every crisis, every stop reachable, the finale an extraction.
2. **The run.** `startMission` builds the queue a stop at a time. A new step `{ type: 'stop' }` picks the next place from the clue (a hash roll, so no other roll moves), swaps the map and resets the zones. The clock is a counter on the run.
3. **The hostage in the extraction.** `holdExtract` gets a carried non-runner who boards with the crew. Their outcome goes into pay and trust.
4. **The watch screen.** It draws the new map at each stop (`ui/watch.js`, `ui/siteplan.js`), with a travel card between, and the feed and report mark each stop.
5. **Hands-off.** A share stops at each stop's end, and each stop writes a log line (`core/advlog.js`).
6. **Kidnap Rescue rewritten** as stops (the text is yours or my draft, see below), then sims of its pay, heat, left-behind rate and death rules against the current job, and the save tests. It needs a save version for a run in progress.

## Questions for you

1. **Pilot:** rebuild Kidnap Rescue as a trail (recommended), or a new smaller rescue for Mrs. Ip?
2. **Time:** one night with hours (recommended), or a stop a day?
3. **The clock:** the hostage can be moved if the crew is slow (harder finale, hostage starts hurt), as above, or no clock?
4. **Writing:** you write the stops with the job prompt (I'd add a STOPS section to it first), or I draft them from the current Kidnap Rescue text and you mark them?
