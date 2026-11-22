# Proposal: lead-following jobs (the multi-map pilot)

Status: proposal, 2026-11-22. For the owner to approve before anything is built. Follows `drafts/HANDOFF-revenue-next.md` ("After that: multi-map operations"); the owner picked a lead-following job over a heist finale as the pilot.

## What it is

A job from a client whose stops are not known at the start. The crew breaks in or asks around somewhere, finds what points to the next place, and goes there. **2 to 4 stops.** Each stop is its own map. What the crew finds at a stop decides where they go next, and sometimes the lead is wrong.

It stays a job: a client, pay, heat, fame and trust as usual, planned on the squad board. Every crisis keeps an abort or extract. Death only follows a risk the player accepted and was shown, as now.

## The pilot (recommended)

**Mrs. Ip's missing stock** (Night Market, rookie to street tier). She's already canon as a client whose work is "deliveries, supplier disputes, missing stock". The trail:

1. **Mrs. Ip's stall at the Neon Dragon** (fixed first stop): who signed for the last delivery, and what the paperwork says.
2. **Then one of:** the supplier's yard at the Docks, a courier's flat in Old Town, or a parcel shelf in the Night Market. Which one is rolled from what stop 1 turned up.
3. **Possibly a wrong lead:** a place that looks right and isn't. A short scene, and then the true lead.
4. **The finale:** where the stock actually is. That's a container, a back room or a lock-up, with a crisis or a fight.

It uses maps we already have: the Docks and Old Town have full district plots (`data/sites.js PLOTS`), and the Night Market has its site. It needs no new canon: the people come from the district log files, and the places are generic ("a lock-up behind the fish market").

Alternatives if you'd rather not use Mrs. Ip: Madam Rao (a debtor gone missing, Night Market → Docks → Old Town), or Ruth Okonkwo at a higher tier (an off-books shipment, Docks → Glass Heights).

## How a stop plays

Each stop is one place on one map:
- a short **arrival beat** (a log-style line with a time on it: "02:40. The yard gate is chained but the chain is new"),
- then **one scene**: a crisis (choices with an abort or extract), or a fight on that map (engine 2, as on posts and expeditions), or for a quiet stop just a roll on the crew's best stat;
- then **what was found**: a clue, either **good** (the next stop is right) or **rough** (the next stop has a chance to be a wrong lead).

The scene's result sets how good the clue is. A strong success means a good clue. A plain success is usually good. A failure means a rough clue and a cost (heat, a light injury, or the alert going up), as crises work now.

## Wrong leads

A rough clue sends the crew to a wrong lead 40% of the time. A wrong lead is a stop of its own: a short scene, then the true lead turns up there. **The cost is time, not pay**: the job runs one stop longer, and every stop adds heat on the way out (more noise, more doors). A job never has more than one wrong lead, and never more than 4 stops in all.

## Time

**One night, stops in hours** (02:40, 03:55, 05:10). A live job plays in one sitting, with a travel card between maps. A hands-off job plays the same night in shares, as now, and writes each stop to the log.

The alternative is a stop a day ("Day 2, 03:10", as in your example). That fits the adventure log, but it would make lead-following jobs the only live jobs that span days. My recommendation is one night for the pilot.

## What it needs (build order, each its own PR)

1. **Data shape.** A job with `stops: [...]`, each stop with `place`, `site` (district and target), `arrive` (beat text), `scene` (a crisis id, `fight`, or `roll`) and `clues` (the next stops and their weights). Plus `wrongLeads` (places that look right). `jobcheck.js` and `validate.js` learn the rules: 2-4 stops, an abort or extract in every crisis, every stop reachable.
2. **The run.** `startMission` builds the queue a stop at a time. A new queue step `{ type: 'stop' }` picks the next place from the clue (a hash roll, so no other roll moves) and swaps `am.site`. Zones reset per stop.
3. **The watch screen.** It draws the new map at each stop (`ui/watch.js`, `ui/siteplan.js`), with a short travel card between maps, and the feed and report mark each stop.
4. **Hands-off.** The day's share stops at a stop's end, and each stop writes a log line (`core/advlog.js`).
5. **The pilot's text.** You write it with `docs/new-job-prompt.md`, extended with a STOPS section (each place, its arrival line, its scene, and what it points to).
6. **Checks.** Sims for the pilot's pay and heat against a normal job of its tier, the death rules and the save tests.

Save version: yes, for an in-progress run (`am.stops`, `am.site`).

## Questions for you

1. **Pilot:** Mrs. Ip's missing stock, or one of the alternatives?
2. **Time:** one night with hours (recommended), or a stop a day?
3. **Wrong-lead cost:** one stop longer plus heat (recommended), or a fight there, or less pay?
4. **Writing:** you write the stops with the job prompt (I'd add a STOPS section to it first), or I draft them for you to mark?
