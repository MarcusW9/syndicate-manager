# Ideation kit: designing a new system with an AI that can't see the repo

Paste the **context pack**, then the **kickoff prompt**, then bring the **proposal** back to the coding session.

## 1. Context pack (paste once at the start of the chat)

The repo is public, so raw GitHub links work if the tool can fetch URLs. Otherwise paste, in this order:

1. `docs/ARCHITECTURE.md`: stack, state shapes, time and economy loop, `finish()`, saves, tests, playtest history.
2. The "Design rules" and "iOS-ready rules" sections of `CLAUDE.md`.
3. The top of `DESIGN.md`: "The game in one paragraph", "Tone" and "Open questions".
4. Topic extras: grep `docs/design/` for the system's keywords and paste the matching rows (for reputation: "reputation", "rival", "tier", "trust").

## 2. Kickoff prompt (copy and paste)

```
You are a game systems designer helping the owner design a new system for a
text-first crew management game (plain JS, pure-logic core, seeded RNG).
You cannot see the code. The pasted docs are the only truth.

System to design: <e.g. runner reputation + syndicate reputation>
Owner's goals: <2-4 bullets: what it should make the player feel/decide>

Process
1. First ask me up to 5 questions that would change the design. Wait.
2. Then give 2-3 distinct options (3 lines each) with a recommendation. Wait.
3. After I pick, write the proposal in the format below.

Hard constraints (from the project's rules)
- Every roll is d20 + stat >= 10 + difficulty. Any new modifier must appear in
  the planning risk read: shown risk equals used risk.
- Death only follows a choice the player made. Operatives are 18+.
- Randomness only via the saved, seeded RNG; no wall-clock or Math.random.
- Core is pure: state in, new state out. No UI or storage in game logic.
- Nothing may depend on hover; phone-first UI, tap to reveal.
- Any new saved field needs a SAVE_VERSION bump and a migration.
- Prefer extending existing state/functions over new parallel systems.
- Only use function and field names that appear in the docs. Anything new
  must be marked NEW. If unsure whether something exists, write "UNCLEAR".
- Numbers must be concrete (formulas, caps, defaults), not "tune later".

Output: ONE markdown document, no preamble, in a single code block,
titled PROPOSAL-<name>.md, with these sections in order:
1. Goal and player-facing behaviour (what the player sees and decides)
2. Rules and numbers (formulas, thresholds, caps, decay)
3. State: new/changed fields with example JSON and defaults for old saves
4. Hook points: existing functions that call in, and the NEW functions
5. UI: which existing screens change, what is shown, one wireframe in text
6. Save migration: version bump and what the migration sets
7. Tests: rule tests (one line each) and any economy/balance band affected
8. Content to write (lines, names, tags) so the owner can hand it out
9. Risks and conflicts with the constraints above
10. Open questions for the owner
11. Draft decision-log row (Date | Decision | Why | Rejected alternatives)
```

## 3. Getting the output back

- Best: one markdown block. Paste it into the coding session, or save it as `drafts/PROPOSAL-<name>.md` and give the path.
- Don't paste the whole chat history; only the final proposal matters.

## 4. What happens next

The coding session checks the proposal against the code first (function names that really exist, hook points in `finish()` and elsewhere, save version, balance risk), flags anything marked UNCLEAR or NEW, then implements it in slices with tests, a decision-log row and a changelog entry.

## Tips

- Use the strongest model available for the questions and options steps; a cheaper one is fine for the final write-up.
- One system per chat. Reputation and rivals together will blur.
