# Opening jobs (now in the game)

The four opening jobs from `drafts/opening-jobs.md`, written in full and **polished by the owner
(2026-11-06)**: one per hall outside Old Town,
fixed for every player. **They're in the game now** (2026-11-06, save v43): the files moved to
`src/data/missions/`, and `core/halls.js` holds each hall until its favour is done. Edit them there.

| File | Job | Contact | Hall |
| --- | --- | --- | --- |
| `src/data/missions/backrent.js` | Back Rent | Madam Rao | the Night Market: two rooms above her sari shop |
| `src/data/missions/quartertotwo.js` | Quarter to Two | the Ferryman | the Docks: the container office on the old pier |
| `src/data/missions/flatdoesntexist.js` | The Flat Doesn't Exist | Ruth Okonkwo | the Basin: the flat over the tack workshop |
| `src/data/missions/nofortyfirstfloor.js` | There Is No Forty-First Floor | Mr. Szeto | Glass Heights: the service floor |

## Editing

- Change any words between the backticks (`` ` ``): the brief, the beats, each crisis's `text`, each
  choice's `label`, `success`, `failure` and `report` lines. Leave the rest (ids, stats,
  difficulties, costs) unless you mean to change how it plays.
- Tokens in braces stay as they are: `{rao}` becomes "Madam Rao", `{op}` whoever acts, and
  `{rao:approve}` one of her approving lines.
- Check a file after editing: `node scripts/check-job.mjs src/data/missions/<file>.js`. It catches a
  missing exit, a token the game doesn't know, a retired name, or a line too long for a phone.
- To get help editing in another chat, paste `edit-prompt.md`'s box, then the file and what you want
  changed. It carries the world, the rules and these jobs' notes.
- Rough notes in the margins are fine. Write them as `//` comments and they'll be picked up when the
  jobs go in.

## The writing bar

These are read once each and met by every player, so they're written a step above routine work:
- a first beat that puts you somewhere (a smell, a sound, the light);
- a last beat that lands on the contact handing over the rooms;
- contacts who talk past what they mean, and street people who want things of their own;
- at least two crises per job that are choices about people, not obstacles.

Lines still stay short enough to read on a phone. The words are ours: nothing borrowed from other
games, as `WORLD.md` asks.

## Defaults to change if you want

- **Back Rent adds no Silver Fan grudge.** Adding `against: 'silverFan',` makes finishing it add
  grudge, as Chrome and House Advantage do.
- **Failing costs only what the job's exits cost** (the pay, and usually 5 trust), plus the two-week
  wait before the contact asks again with one of their own jobs.
- **Who lives on Szeto's forty-first floor** is left a mystery on purpose: it isn't Lo.
