# Football Manager and Battle Brothers: the two games this one is built between

Started 2026-11-26, at the owner's request. Football Manager (FM) is the stated model (`CLAUDE.md`: "Football Manager style, endless"); Battle Brothers (BB) is the closest game about running a crew of fighters as a business. Neither had a note. Sources are web reviews, guides and interviews (listed at the end). Where a point comes from general knowledge of the games rather than a source found here, it says so.

## 1. Football Manager

**Hidden truth, read through people.** Every player has a current ability (CA) and a potential ability (PA), stored 0 to 200 and not normally shown. What the player sees is star ratings from half a star to five, and those come from staff: a scout, coach or assistant reads the player, so the same player can show different stars depending on who judges. The judges' own Judging Ability and Judging Potential attributes decide how close they get. Stars are relative to your squad, not absolute. Uncertainty is drawn: black or white stars mark the part of the estimate staff aren't sure of, common on young players. A scout report also says what league standard a player could reach, in words. (sortitoutsi, fmscout, passion4fm)

**Players distrust the stars, and the game is better for it.** Guides tell players to take stars "with a pinch of salt" and read the scout's written comments instead. A critic found two players with the same CA a full star apart. The gap between the read and the truth is a feature: it is why scouting and good staff matter. (videogamer, fmscout)

**Mental stats as the gamble.** Miles Jacobson (studio director): some players have mental stats that make them sure things; others are uncertain, "may work out or they may not." Hidden attributes (consistency, big matches, professionalism and others, on the same 1 to 20 scale) shape how a player performs. (PC Gamer, videogamer)

**The inbox is the game.** SI's own manual calls the inbox "the central point around which the whole experience is built", and many tasks are done straight from a message. For FM26 the developers said their data showed most play time was spent in the inbox. When a later redesign moved the inbox off the main screen, the press reported that players would need to "relearn" how to play. (SI manual, PCGamesN, footballmanager.com, Dexerto)

**People problems are the stories.** Morale, promises (playing time, signings) and squad dynamics. Over-promising makes a player unhappy, unhappiness spreads, and broken promises make the AI doubt you in contract talks. FM2018 made it clearer when a player's demand is reasonable and when pushing back risks a revolt. Some players find the morale system the most frustrating part of a save. A review's view of the strength: it removes the barriers between you and the stories the players generate. (Game Informer, videogamer, fmprojects, PC Gamer)

**A long save.** Not from a source here, but well known: a save runs for decades of in-game seasons, players age, retire and become staff, regens replace them, and the player's own history (trophies, records, former players) is the reason to keep going.

## 2. Battle Brothers

**A business first.** You run a mercenary company. Wages are paid daily; food runs out; if you do nothing, the men "starve and desert." Higher-level men demand higher wages. Contracts are the main income for the whole game, and pay scales with the contract and a random factor. (sevastromo, gametyrant, BB wiki)

**Morale on two levels.** Company mood falls with deaths, hunger and unpaid wages; low mood causes desertion and lowers attributes in battle by up to 30%. In a fight, men and enemies break and flee when it goes badly. (sevastromo, moddb)

**People are disposable and precious at once.** Common knowledge of the game rather than a source here: recruits come with a background (farmhand, sellsword, noble) that sets cost, wage and stat ranges, plus random traits, and talent stars on a few attributes that show where they will grow. Injuries heal only with medical supplies; some are permanent. Losing two or three good men is "devastating," and players report saving constantly because of it. (sevastromo, GOG forum)

**Hard, and proud of it.** Reviewers call the difficulty the defining feature: one took six restarts to find a foothold, and most players lose many brothers. Late-game crises (around days 50 to 100) are a huge spike; some players say one ruined the run; they cannot be turned off, though difficulty and the first crisis can be set at the start. A critic: lots of lethality and roster shuffling, without a big enough reward for the risk. Others: it gives the achievement of a Dark Souls without its cheap deaths. Weak tutorial, clunky inventory. (RPGamer, KeenGamer, GOG forum, RPG Codex, Wikipedia, PC Gamer 84)

## 3. What we already took from them

- **FM's read-through-people.** Our potential is read by a scout from the crew (`core/development.js` `scoutFor`, `potentialRead`, with `rollScoutError` putting a scout's read off by up to two). Rivals carry a hidden rating that is never shown, with scouting levels 0 to 3 (`docs/RIVAL-TONGS.md`), and the Anchor's Book grades runners from public fame and form, "never the hidden rating". That is FM's stars versus CA, done in words.
- **FM's inbox.** Today owns attention; messages carry the decisions (`docs/SCREENS.md`).
- **BB's business.** Wages and rent every Sunday; broke costs morale (`docs/ARCHITECTURE.md` section 4).
- **BB's fight morale.** `core/battle.js` already says "Morale (after Battle Brothers)": a badly hurt guard breaks and runs.
- **BB's losses, softened.** Our death rule (only after a risk the player accepted and was shown) is the deliberate answer to BB's "devastating" losses and constant saving.

## 4. How this applies to Syndicate Manager

1. **Show who is judging, and how sure they are.** FM's best idea is that a read comes from a person whose skill sets how close it is, and the doubt is drawn (black stars). Our scout's read is already a person's words, but the player can't tell a sure read from a guess. Worth a look: a word for the scout's certainty, and a better scout giving a closer read.
2. **Keep the truth hidden, and keep it consistent.** FM players complain when two equal players read a full star apart. Our reads should come from one rule so equal runners read the same from the same scout.
3. **Words over numbers.** FM players are told to trust the written report over the stars. We already write reads in words (`core/risk.js`: labels with a short reason, no percentages). Keep that.
4. **The inbox stays the home.** FM's own data says most time is spent there, and moving it cost players. Today is our inbox; don't bury it.
5. **Promises are cheap drama.** FM's promises (and breaking them) make stories from nothing. A runner asking for something (a cut, a job, a day off), the player agreeing, and the run remembering, is a candidate system. Check with `core/loyalty.js` before building.
6. **No crisis you can't see coming or turn down.** BB's late crises are the most-cited complaint. Our pressure (rivals, raids, heat) should build where the player can see it, and our difficulty setting should say what it changes.
7. **Make the reward match the risk.** BB's critic: high lethality without enough reward. Every risky choice we show should carry a visibly bigger payoff.
8. **Loss without save-scumming.** BB players save constantly to avoid losing men. Our death rule makes that unnecessary; keep it, and keep Ironman for those who want BB's edge.
9. **Talent shown, growth earned.** BB's talent stars show where a recruit will grow before you hire. Our recruit page could say where a recruit's growth lies, in a scout's words, so hiring is a bet with information.
10. **The long save's reason to go on.** FM's history (records, former players, trophies) keeps a save alive for years. Ours: the Wall, the Hall of Legends, Gone elsewhere, the Career tab. A tong-level record (best season, longest-serving runner, biggest job) would be FM's trophy cabinet.

## 5. Open checks

- Does a scout's read get closer with a better scout, and does the screen say how sure the read is?
- Do two runners with the same hidden potential read the same from the same scout?
- Does the recruit page say where a recruit will grow?

## Sources

- [PC Gamer: Miles Jacobson on Football Manager 2011](https://www.pcgamer.com/miles-jacobson-on-football-manager-2011/)
- [VideoGamer: Exposing the hidden attributes of FM24](https://www.videogamer.com/?p=1131692)
- [VideoGamer: The FM star system is lying to you](https://www.videogamer.com/?p=1138398)
- [sortitoutsi: FM26 current ability, potential ability and star ratings](https://sortitoutsi.net/content/75752/fm26-current-ability-potential-ability-and-star-ratings)
- [sortitoutsi: FM26 how to choose the best coach for star ratings and reports](https://sortitoutsi.net/content/75753/fm26-how-to-choose-the-best-coach-for-star-ratings-and-reports)
- [FM Scout: current and potential ability guide](https://www.fmscout.com/a-current-and-potential-ability-guide-2022.html)
- [FM Scout: black stars in scouting reports](https://www.fmscout.com/a-black-stars-in-scouting-reports.html)
- [passion4fm: star ratings guide](https://www.passion4fm.com/football-manager-guide-star-ratings/)
- [SI manual: Your inbox, your home](https://community.sports-interactive.com/sigames-manual/football-manager-2024-touch-and-console/your-inbox-your-home-r4973)
- [footballmanager.com: FM26's reimagined user interface](https://footballmanager.com/fm26/features/fm26s-reimagined-user-interface)
- [Dexerto: FM25 removes most-used feature](https://dexerto.com/gaming/fm25-removes-most-used-feature-as-players-will-need-to-relearn-how-to-play-2899901)
- [PCGamesN: FM2014 revamped email client](https://pcgamesn.com/footballmanager/football-manager-2014-trailer-shows-revamped-email-client)
- [Game Informer: Inside the dynamics of FM2018](https://gameinformer.com/b/features/archive/2017/11/06/the-sports-desk-inside-the-dynamics-of-football-manager-2018)
- [FM Projects: Football Manager's morale system](https://fmprojects.substack.com/p/football-managers-morale-system)
- [PC Gamer: FM2017 review](https://pcgamer.com/football-manager-2017-review)
- [Sevastromo: Battle Brothers review](https://sevastromo.github.io/2022/08/03/Battle-Brothers-Review.html)
- [GameTyrant: Mercenaries done right](https://gametyrant.com/news/mercenaries-done-right-battle-brothers-a-hero-for-hire-business-simulator)
- [Battle Brothers wiki: loading screen tips](https://battlebrothers.fandom.com/wiki/Loading_Screen_Tips)
- [ModDB: morale effects in Battle Brothers](https://www.moddb.com/games/battle-brothers/images/morale-effects-in-battle-brothers)
- [RPGamer: Battle Brothers review](https://rpgamer.com/review/battle-brothers-review/)
- [KeenGamer: Battle Brothers review](https://www.keengamer.com/articles/reviews/battle-brothers-review/)
- [RPG Codex: Battle Brothers review](https://rpgcodex.net/article.php?id=10629)
- [GOG forum: how hard is Battle Brothers](https://www.gog.com/forum/general/how_hard_is_battle_brothers)
- [Wikipedia: Battle Brothers](https://en.wikipedia.com/wiki/Battle_Brothers)
- [PC Gamer: Battle Brothers review](https://www.pcgamer.com/au/battle-brothers-review/)
