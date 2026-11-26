# Assassin's Creed Brotherhood: a stranger from the street becomes one of yours

Started 2026-11-26. The owner's direction, the same day: the most important feeling in this game is roster members getting stronger and being customised, and being able to send them off meaningfully, so they grow and also get something done. The owner's touchstone is Assassin's Creed Brotherhood (Ubisoft, 2010): recruiting someone from the street, sending them off and growing them, "even though it was actually a very shallow mechanic in that game."

## 1. The Brotherhood system

From a search (sources below): Ezio burns Borgia towers across Rome; each tower burnt frees a district, and citizens being harassed by Borgia guards can be rescued and asked to join. Reviewers applauded the system and it returned in sequels. Two thought it underdeveloped: "a good idea, but very undeveloped," and one wanted it "more varied and in-depth." A design review noted that nearly every side activity supports the story's ideals, so recruiting doesn't feel like a side game.

From general knowledge of the game (not from a source found here):
- **The pick-up.** The recruit is a nobody (a thief, a beggar, a brawler) you just saved. You owe them and they owe you.
- **Sending them out.** At a pigeon coop you send recruits on contracts in cities across Europe. Each contract shows a difficulty and a success chance that rises with the team's levels and numbers. They are away for a while in real time, then come back with money and experience, or not at all.
- **Growth in visible steps.** Levels 1 to 10, with points to spend on armour or weapons at each level. At level 10 a short ceremony makes them a full Assassin.
- **Calling them in.** Back in Rome you can whistle them into a fight, or call an arrow storm. The ones you grew save you.
- **They can die.** A failed contract can lose a recruit, and that hurts because you grew them.

## 2. Why a shallow system felt so good

The mechanics are thin (a few stats, a percentage, a timer). The feeling comes from five things:
1. **You made them.** They start as nobody, and every level is yours. Owning someone's whole path is the hook.
2. **Growth you can see.** A level number and a points choice every time they come back. You never wonder whether they grew.
3. **The choice is a bet with the odds shown.** Who to send, how many, which contract: a percentage you can push up by sending more or better people.
4. **They come back changed and with something.** Money, a level, and a story of where they went.
5. **You use what you grew.** Calling them into your own fight closes the loop: the time spent sending them out pays off in front of you.

## 3. Where Syndicate Manager stands

**Already ours:**
- The pick-up: recruits, free names, leads from an expedition (`core/expeditions.js` recruit goal), a runner's Career tab and path.
- Sending off: hands-off jobs (`core/autorun.js`), expeditions, security posts and contracts (`core/contracts.js`), side tasks (`core/sidetasks.js`), each with odds shown in words.
- Growth: stats grow from what a runner does (`core/development.js gainXp`), rookie to pro to veteran, skills to learn at a level-up, earned traits, gear, focus.
- Using what you grew: they are the crew on the main jobs and in the fights you watch.
- Losses that hurt, but only after a shown risk (the death rule), and never on steady orders when sent off.

**Gap found while writing this (2026-11-26):** a runner sent off grows, but the player is not told.
- An expedition day gives every runner on it experience (`core/expeditions.js` line 168, `gainXp(... EXPEDITION.xpPerDay ...)`), and a security post day does the same (`core/contracts.js` line 205). Both throw away what `gainXp` returns: the stat rises and the change is logged on the runner's page, but the trip's report says nothing about who got better, and a rookie who graduates to pro out there gets no message or history line.
- Side tasks do it right (`core/sidetasks.js` line 179: the growth is kept and a graduation gets a message and a history line).
- This is the opposite of point 2 above: the growth happens, but the player never feels it land.

## 4. How this applies

1. **Every trip's report says who grew.** "Mei came back sharper: Stealth 11 → 12." A graduation on a trip gets its message and history line, as side tasks already do. This is the cheapest, highest-value change, and it fixes the gap above.
2. **A visible step, not only a stat.** Brotherhood's levels 1 to 10 work because they are few and named. Our rookie, pro, veteran tiers and the level-up skills are the steps; the report should say when someone is close to the next one.
3. **The choice of who to send shapes who they become.** A trip's stats are the ones that grow, so sending a runner is also choosing what they get better at. Say so where the trip is planned ("Grows: stealth, social").
4. **Odds you can push.** We show odds in words; the plan should show that sending more or better people moves them, the way Brotherhood's percentage climbs.
5. **Come back with a story.** The adventure log already writes a line a day; the report's last lines should be about the people (who grew, who earned a trait, who got hurt), not only the prize.
6. **Use them where the player sees.** A runner grown on trips should feel different on a main job: a skill learned out there that shows in a fight, or Joss noticing ("Since the docks trip, Mei moves like she owns the place").
7. **The ceremony.** Brotherhood's level-10 initiation is a scene. Our veteran promotion and the Hall of Legends could be one too (the runner's page header already has "the ceremony").
8. **Keep it deeper than Brotherhood without making it heavier.** The owner's note is that the mechanic was shallow and still worked. Depth should come from who the person becomes (traits, partners, scars, history), not from more menus.

## 5. Open checks

- Expeditions and security posts: does the report say who grew and by how much? (Hands-off jobs already do, through `mission.js` `growthLines`; side tasks keep the growth.)
- Does a rookie who graduates while away get a message and a history line?
- Does the trip planner say which stats the trip grows?

## Sources

- [Wikipedia: Assassin's Creed Brotherhood](https://Www.Wikipedia.org/wiki/Assassin%27s_Creed_Brotherhood)
- [Game Developer: The cohesive open-world experience of Assassin's Creed Brotherhood](https://gamedeveloper.com/design/cohesive-open-world-experience-of-assassin-s-creed-brotherhood)
- [Arcade Sushi: Tribute, Assassin's Creed Brotherhood](https://arcadesushi.com/tribute-assassins-creed-brotherhood/)
- [GameSpot user review: AC Brotherhood](https://gamespot.com/assassins-creed-brotherhood/user-reviews/2200-12578180/)
- [GameSpot user review: A disappointing ending brings down an otherwise great game](https://www.gamespot.com/assassins-creed-brotherhood/user-reviews/2200-534219/)
- [Destructoid: Assassin's Creed Brotherhood review](https://www.destructoid.com/reviews/review-assassins-creed-brotherhood/)
