---
name: add-lore
description: Add to or change Lantern Bay's canon (WORLD.md) and keep every copy in step. Use whenever lore changes, whether the owner asks for it or another task introduces it (a new person, place, faction, rule, secret, or a renamed or retired name), including jobs added with /add-job. Not for brainstorming: confirm with the owner before writing.
---

# Add lore

Canon lives in `WORLD.md`. Parts of it are copied elsewhere, and tests check that some copies match. This skill checks new lore against the canon, asks the owner before writing it, then updates every place it touches.

## 1. Read and check

Read `WORLD.md` in full (about 400 lines). Then check the new lore against it and list anything that:
- **contradicts canon**: a date, who runs what, a client's background or secret, a district's character;
- **breaks a world rule**: no magic (superstition never confirmed), Cantonese romanisation (not Mandarin), all characters 18+, money in ¥ (no credits), everything invented (no real companies, triads, people or Hong Kong place names, nothing from Shadowrun or Cyberpunk 2077);
- **uses a retired name** (the RETIRED line at the end of the context block);
- **clashes with an existing name** (two people or places that read alike).

## 2. Confirm with the owner

Show the owner, briefly:
- the new lore as you'd write it, and where in `WORLD.md` it goes;
- every clash from step 1, each with a suggested fix;
- which of the other places in step 3 it would touch.

Write nothing until the owner says yes. If they were only thinking out loud, stop here.

## 3. Write it everywhere it belongs

Only the places that apply:

| What changed | Where |
| --- | --- |
| Any canon | The right section of `WORLD.md`: History, Who runs it, Power map, Geography and districts, Tech, Weapons, The clients (one `###` per client), Street characters, Joss. Match the voice around it; keep entries to 1-2 sentences. |
| Something a writer needs (a district, faction, client, street character, world rule, retired name) | The context block at the end of `WORLD.md` (the fenced block under "Context block for worldbuilding prompts"), **and the same edit, word for word, in `docs/new-job-prompt.md`** (its box holds a copy; `tests/prompts.test.js` fails if they differ). Keep the block short: a line or two per thing. |
| A retired name | The RETIRED line in the context block (and its copy), **and** `RETIRED` in `src/core/jobcheck.js` (`tests/jobcheck.test.js` checks they match). Then `grep -rn "<old name>" src WORLD.md docs/new-job-prompt.md` and replace any live use. |
| A district or the city's name as the game shows it | `src/config/names.js` (the only place names live; `districts` and `districtsInText`). |
| A client or street contact that job text should name with a token like `{rao}` | `src/data/cast.js` (name and line banks). Making someone a client who offers jobs in the game (`src/data/clients.js`) is a feature, not lore: tell the owner, don't do it here. |

Every canon change also gets a row at the top of the newest file in `docs/design/` (listed under "## Decision log" in `DESIGN.md`; bump its row count there): the decision (what's now canon), why (owner's words if they gave them), rejected alternatives (the clashes you avoided, or "none").

## 4. Check, log, commit

- `npm test` (the prompt and checker sync tests must pass). If job text changed, also `node scripts/check-job.mjs --all`.
- The changelog (newest file in `docs/changelog/`) only if something a player sees changed (a name on screen, job text). Lore in the docs alone doesn't ship.
- Commit as the owner, with no co-author or session lines:
  `git -c user.name=marcusw -c user.email=160358373+MarcusW9@users.noreply.github.com commit -m "Lore: <what>"`
  If this ran inside another task (like `/add-job`), commit with that task instead.
- Report back in a few lines: what's now canon, where it went, and any clash you resolved and how.

## Model

The edits are mechanical. The canon check in step 1 is judgement:

| Kind of lore | Model |
| --- | --- |
| A street character, a tech or weapon detail, a district texture line (a landmark, a custom), retiring a name | A smaller model (Sonnet) is fine: the check is mostly names and world rules, and the sync tests catch drift. |
| A new client, faction or district; a secret; who runs what; history; the power map's hates/owes/fears; the "Three contradictions" | A larger model (Opus). These ripple into existing motives and ties, which is where a quiet contradiction gets through. |

If the session is on a smaller model and the lore is in the second row, say so, and offer to leave the check to the owner, a larger model, or an outside review with `docs/lore-review-prompt.md`. If the owner brings a review from that prompt, still run step 1; treat the review as a second opinion.

Read `WORLD.md` in full here (this is the one task that needs all of it); other tasks read only the context block and the section they need.
