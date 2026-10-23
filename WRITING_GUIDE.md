# Writing new jobs and crises

You don't need to write code. Write ideas in plain English using the templates below, paste them into a chat, and they'll be converted into game data, checked by the tests, and shipped. Rough notes are fine; anything you leave out gets filled in sensibly and flagged.

The most useful thing you can write is **crises**: they're where the drama is, and every job needs 6.

---

## A crisis

```
JOB: (which job this belongs to, e.g. Casino Con, or "any job" for a twist)
WHO IT'S ABOUT: (optional: driver / tech / face / muscle / medic / infiltrator)
SITUATION: (1-2 sentences. What just went wrong?)

OPTION 1: (what the crew does)
  - uses: (combat / stealth / tech / social / driving / medical / cool)
  - how hard: easy / normal / hard / very hard
  - costs anyway: (optional: some pay / heat / cash / client unhappy)
  - if it works: (1 sentence)
  - if it fails: (1 sentence) + how bad: no injury / light / serious / critical

OPTION 2: ...

ABORT: (how the crew walks away, 1 sentence. Always included.)
```

### Example

```
JOB: Protection Run
WHO IT'S ABOUT: driver
SITUATION: The herbalist's grandson flags the van down. He wants a lift, and he's being chased.

OPTION 1: Let him in and floor it
  - uses: driving, hard
  - costs anyway: +1 heat
  - if it works: The chasers fall behind. The herbalist cries and pays double.
  - if it fails: A motorbike rams the side door. Serious injury to whoever's nearest.

OPTION 2: Drive past him
  - uses: cool, easy
  - if it works: The herbalist goes silent for the rest of the trip. Client unhappy.
  - if it fails: She grabs the wheel. Light injury.

ABORT: Stop, hand the herbalist to her grandson, and leave them both.
```

---

## The rules (the tests enforce these)

1. **Always an abort.** Every crisis needs a way out that saves everyone, at a cost (usually the pay, sometimes client trust).
2. **Nobody dies from a crisis directly.** The worst a failure can do is a *critical* injury, and the player then chooses whether to risk it.
3. **Operatives are always 18+.**
4. **Use the role names, not character names.** Write "the driver", not "Teo", so it works with any crew. (They show up as `{driver}` in the data.)
5. **Keep it short.** 1-2 sentences per line reads best on a phone.

## Difficulty, roughly

| You write | Means | A competent pro (stat 10) succeeds... |
| --- | --- | --- |
| easy | 9 | about 6 in 10 |
| normal | 11 | about half the time |
| hard | 13 | about 4 in 10 |
| very hard | 14+ | about 1 in 3 |

## A new job type

```
NAME:
WHERE: (Old Town / The Docks / Night Market / Glass Heights)
DANGER: 1-5
PAY: (roughly, e.g. 2,500 easy ... 12,000 huge)
CREW SIZE: 2-4
MATTERS MOST: (2-3 stats)
CLIENT PITCH: (2 sentences)
STORY BEATS: (4-5 short lines, start to finish)
CRISES: (6, using the template above)
WHICH CLIENTS OFFER IT: (Auntie Fung / Mr. Szeto / The Ferryman / Madam Rao / Ruth Okonkwo, or a new one)
```

## Other things that are easy to add

- **Clients:** name, one-line description, which jobs they offer.
- **Recruit flavour:** names, street handles, origin lines, personality lines (see `src/data/recruitPools.js` for the current lists).
- **Twists:** like a crisis, but for "any job".

## Playtest notes

The other high-value thing you can do is play and write down moments. Rough notes like these are perfect:

- "Week 3: lost Jax on the warehouse job, felt fair, I pushed on"
- "Courier runs get boring by week 4"
- "Didn't understand what 'intel unreliable' meant"
