# Proposal: security and escort contracts (2026-11-21)

Owner, 2026-11-21: start with contracts (first of four: contracts, the adventure log, multi-map operations, then hall businesses last). Fills the gap the board leaves (`drafts/PROPOSAL-work-scales-with-crew.md`): a 3-5 person crew is at break-even and two or three people sit idle most days.

## The idea

A client pays a weekly retainer for runners kept on a post: guarding a clinic, walking a courier across districts, minding a stall row on market nights. The runners are away for the contract's length. Most days pass as log lines; now and then something happens (a tail, a shakedown, an ambush) and the crew calls you in. It is steady, low-drama money that turns idle runners into income, not a second job board.

## Shape

- **Where:** a Contracts list on Jobs (beside Board · Heists · Side · Clients), and the clients' pages. Two or three on offer at a time, from clients you have met; a new one each Monday.
- **Kinds (three to start):** Guard (a fixed post, 1-2 runners, 7 days), Escort (a person or cargo between districts, 2-3 runners, 2-4 days, one stop-and-ask moment likely), Watch (a stall row or block on market nights, 1-2 runners, 7 days, cool and social).
- **Who:** you pick the runners on a small version of the squad board (slots, the read of stats against the post). Stats that matter: combat and cool for Guard, piloting and stealth for Escort, social and cool for Watch.
- **Pay:** a fixed sum per runner-slot per week, set by district and threat: about ¥500-900 (Old Town low, Heights high). Paid on Sunday with the work board's take. Pay is per slot, not per runner's wage, so a cheap rookie on a post earns the tong money and a veteran barely covers themselves: a real choice of who goes.
- **Events:** each day one roll on the post's stats against the district's threat, from a small pool per kind (quiet, a tip, a scuffle, a tail, an ambush). Most days are quiet log lines. A bad roll can mean a light injury, heat +1, or a client trust loss. An ambush becomes a short engine-2 fight on a small map (`core/fight.js`, a guard or escort recipe in `data/fights.js`) that stops and asks under the same call-in rule as a twist.
- **Ending early:** you can pull runners off any day (pay for the days done, client trust -3). A failed contract (the post lost, the cargo taken) pays nothing that week and costs trust.
- **Growth:** contracts give experience at about half a job's rate and **no fame or standing** (so the Elite timing the fame sim protects does not move). Client trust rises with each completed week; a trusted client offers longer, better-paid posts.

## Rules it must keep

- Death: only after a risk the player accepted and was shown. A contract fight follows the fight risk levels; on cautious or steady nobody dies without a call-in. Every event has an out (pull back, give up the cargo).
- Core stays pure: `core/contracts.js` takes state and returns state; randomness from `core/rng.js` (seeded per contract and day, so no other roll moves).
- Save: a new `state.contracts` ({ offers, active: [{ id, kind, clientId, district, crewIds, startDay, days, slotPay, log }] }) and runners' `condition.awayUntil`. `SAVE_VERSION` bump and a migration that adds an empty `contracts`.

## Numbers, checked against the income sim

From `docs/sims/crew-income-2026-11-21.md` (current board), weeks 13-26: a 5-person crew grosses about ¥3,570 against a ¥3,650 bill with 2.7 runners idle a day; a 7-person crew is at +7% with 3.6 idle.

- Two runners on a ¥650-a-slot post: +¥1,300 a week. 5 crew: about +33% over the bill. 7 crew (two on a post, the rest on the board): about +32%.
- The target band (+20-40% for 5-10 crew) is met with slot pay around ¥550-750 and one or two posts. Per runner-week a post pays less than a job (about ¥1,150 a runner-week from jobs at 3 crew), so jobs stay the main earner.
- Built into `scripts/sim-crew-income.mjs` before shipping: idle runners take an open post, and the table is re-run at 3, 5, 7 and 10 crew. The fame sim and the save-size test must still pass.

## Build order

1. `core/contracts.js` + `data/contracts.js` (three kinds, the event pools, text written to `WRITING_GUIDE.md`), offers on Mondays, Sunday pay, daily events as log lines, pull-off; save version and migration; tests (no death off cautious/steady, pull-off always brings everyone home, pay and trust, save upgrade).
2. The Contracts list and the pick screen (phone width first, 844x390 checked), Today's crew-out cards showing who is on a post.
3. Ambush fights on a small map, through the stop-and-ask call-in.
4. The sim and the tuning above; screenshots and the changelog.

The daily log lines are the first use of the adventure log (step two of the four), so the generator is written once and reused for hands-off jobs and expeditions.

## Questions for the owner (recommended answer first)

1. Contracts give no fame or standing, only experience at half rate? (Recommended: yes; it keeps the Elite timing. Alternative: a small standing gain.)
2. Can a runner on a post be pulled onto a main job in a hurry (contract ends early, trust -3)? (Recommended: yes.)
3. Three kinds to start (Guard, Escort, Watch), or Escort alone as the pilot? (Recommended: all three; they share one engine.)
4. Who writes the event text: Claude drafts to `WRITING_GUIDE.md` and you mark it, as with `drafts/writing-tasks.md`? (Recommended: yes.)

## Later, not part of this

Hall businesses move to last. Owner: a runner does not run a noodle bar or a chop shop; it may belong to a later "conglomerate" layer where the tong builds real businesses. Kept as an idea only.
