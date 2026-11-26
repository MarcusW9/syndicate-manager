# Management-game comparators: what players asked for, and where they bounced

Started 2026-11-26. Sources: an r/rpg_gamers thread ("RPGs where you build up a guild or company"), Steam reviews of King of Dragon Pass (KoDP) and Steam reviews of Majesty Gold HD, all shared by the owner.

## 1. The Reddit thread: games named as comparators

Not all of these are close. Grouped by what they teach.

| Game | What it offers us |
| --- | --- |
| Majesty 1 and 2 | An RTS (buildings, shops, guilds) where you do not control the heroes; you steer them with gold bounties on flags. The incentive idea suits hands-off runs and side tasks (`core/autorun.js`, `core/sidetasks.js`), but the game itself is real-time, not text-first. See section 3. |
| Battle Brothers, Darkest Dungeon | The standard roster-with-attrition references. Our death rules are a deliberate softening of both. |
| Wildermyth | Characters who change over time through events. Relevant to `earnedTraits` and development. |
| Our Adventurer Guild | Rebuild a guild: hire, outfit, send out, upgrade the base; turn-based fights. Overlaps our fight engines. |
| Dispatch | Superhero-team management: assign people to jobs, writing carries it. Closest in tone to a crew-and-jobs game. |
| King of Dragon Pass | Text-first, event-driven tribe management with no tactical layer. See section 2. |
| Kenshi | Pure sandbox. Not a useful model. |
| Guildmaster Simulator | A small indie in the same space, in playtest. Worth watching as a competitor. |

Takeaways from the thread:
- Players ask for an organization that grows (a base, a roster, new options), not just a party.
- Only KoDP in the thread is text-first. That may be a gap we can fill.

## 2. King of Dragon Pass (Steam reviews)

KoDP is clan-level: you run a tribe through written events. There is no individual roster to hire, grow or lose, so it informs our event and crisis writing, not our roster. For roster and growth use Battle Brothers, Wildermyth and Darkest Dungeon.

**What reviewers loved**
- Very high replayability from a large pool of random events with almost never a clearly right or wrong choice.
- Worldbuilding that feels lived in and avoids stock fantasy.
- Difficulty is high for new players and falls as they learn to think like the people in the game. Few situations are truly hopeless apart from starvation spirals.
- Streamlining: removing systems nobody wants to manage by hand was praised.
- Lots of new events added over time.

**Where reviewers bounced**
- "Entirely reliant on RNG and hides a lot of information."
- "Confusing and nonsensical": a tutorial that gives the bare basics, then "fifty different things at the same time."
- No clear progression: one reviewer says you can never destroy or take land from a rival clan because attacked clans respawn troops. Some actions felt "just for show" because one option was the only way to progress. Bored after about 2 hours.
- Early death spirals: bad luck on early harvests can lock a run into starvation.

**Mobile-port lessons (the port was touch-first and the reviewer disliked it on desktop; we are going the other way)**
- Dangerous defaults: the diplomacy screen defaulted to "Demand Tribute" instead of "Give Gifts", and the reviewer used it by accident. The default action on a screen must be the safe one.
- No manual save, autosave on quit only. Players split on this; decide on purpose.
- Drag-only scrolling, cramped screens, no icons to avoid double-checking.
- A semi-intrusive tutorial that veterans can skip was fine.

## 3. Majesty Gold HD (Steam reviews)

Majesty is billed as a fantasy kingdom sim but plays like a conventional RTS: you build guild houses, shops and defences on a map in real time. Its one big departure is that heroes act on their own. You cajole them with gold: an Explore Flag with 200 gold, an Attack Flag with 400 gold on the troll at the market, and you hope someone claims it. Treat it as a reference for indirect control, not a genre match.

**What reviewers loved**
- Heroes with autonomy and personality ("D&D ant farm"): delightful when they do something heroic, exasperating when they do not.
- Humor and voice: class-specific catch-phrases, comments when something happens to a hero, a witty advisor in briefings.
- Replay value from a freestyle mode beyond the scripted missions.
- Lasting affection: patched years later by a former developer in their free time.

**Where it struggled**
- The sequel gave the player more control over heroes, which pushed it toward a standard RTS and away from the sim idea that made the original distinct. A reviewer calls this a mistake.
- Dated visuals and a primitive interface; the idea has since been expanded on by Dwarf Fortress and its descendants.
- Technical issues on modern systems (freezes, config-file fixes).
- It had trouble finding a publisher because nobody knew how to sell a game that withholds control.

**Lesson:** the autonomy is the product. Do not hand the player direct control to make a hands-off system feel safer; add readable incentives instead.

## 4. How this applies to Syndicate Manager

1. **Show risk, do not hide it.** The planning read (`core/squad.js`, `core/risk.js`) and the rule that deaths follow a risk the player was shown answer the "hidden information" complaint. Keep one clear read per decision; do not pile up small ones.
2. **Visible progression in an endless game.** The sharpest negative review is "no clear progression" plus enemies that never lose ground. Rival tongs (`docs/RIVAL-TONGS.md`) need a lasting, visible effect when the player hits them, and the player needs some marker of how far they have come.
3. **Early-game trap check.** Check the first days of a run for a spiral that a bad early streak can lock in, and confirm there is a recovery.
4. **No choices that are only for show.** If a crisis choice does not change the outcome, players notice.
5. **Safe defaults.** On any screen with a risky action, the preselected one is the safe one (iOS-ready rules already say no hover-only info).
6. **Save policy.** `save.js` autosaves. Decide whether to offer manual saves.
7. **Streamline.** Cut systems the player would only manage by hand.
8. **Keep autonomy.** Crew who act on their own, steered by incentives (pay, approach, who is picked), are the draw; resist adding direct control mid-run. Character voice and humor in the small lines is what players remember.

## 5. Open checks

- First-days difficulty: play the first week of a few seeds and look for a spiral.
- Rival tong consequences: does hitting one leave a lasting, visible mark?
