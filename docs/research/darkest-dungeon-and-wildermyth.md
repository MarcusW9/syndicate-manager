# Darkest Dungeon and Wildermyth: what a job does to people, and the stories that come out of it

Started 2026-11-26, at the owner's request. Darkest Dungeon (DD, Red Hook, 2016) is the reference for strain on a crew: stress, breakdowns and scars that last. Wildermyth (Worldwalker Games, 2021) is the reference for characters who change through what happens to them, told as written scenes. Sources are reviews, design articles and interviews (listed at the end). Where a point comes from general knowledge of the game rather than a source found here, it says so.

## 1. Darkest Dungeon

**Stress, shown as a number.** Each hero has a stress meter beside HP. At 100 they face an affliction check. The team chose to show stress changes as plain numbers, so the player sees every hit to the mind land. (Game Developer)

**Afflictions: how people break.** An affliction is one way a person responds to stress (paranoid, selfish, hopeless and others): the hero starts acting on their own, refusing orders, hurting the others' stress. Designer Tyler Sigman: "The inspiration for the Affliction system was not games, really. It was more human experience," with HBO's *Band of Brothers* as a source. He also said balancing a system that takes control away from the player is hard. From general knowledge: sometimes the check comes up a virtue instead (the hero rises to it), which is why the check is exciting rather than only bad. (PC Gamer, Game Developer, GDC postmortem)

**Quirks: the long scars.** Stress is the short-term state; quirks are the long-term change in a hero's character, gained from what happens on a run. The player can't pick them, but town buildings can lock in a good one or treat a bad one, for money. (Dread Central, Destructoid)

**The town as the cost of recovery.** From general knowledge: between runs, stress is worked off at the tavern or abbey, which costs money and takes the hero out of the next run. Recovering people is the drain that keeps you poor.

**Where players bounced.** "Punishing RNG": a bad roll can wipe a squad of your best heroes. Death is permanent, so "you'll need to manage a constant influx of new heroes," and recovering from a loss is called the game's largest problem. The grind: "an eternal procedurally-generated RNG grind"; "fantastic for the first twenty or so hours." Defenders say careful planning avoids most of the luck, and that the game is more merciful than people think. (Destructoid, RPGFan, Yahoo, Giant Bomb, Backloggd, Honest Gamers, Steam)

## 2. Wildermyth

**Built for the soldiers' stories.** The team played a lot of X-COM: "we love the stories that are generated. But we wanted a lot more detail about the soldiers." And from tabletop: "We wanted to capture the sort of free-wheeling storytelling experience that you can have at a tabletop." (Goodreads interview, GameBanshee)

**Handwritten and generated, in layers.** Nate Austin: the game "alternates layers of handcrafted and procedural content." Written story events have hooks that read a character's traits and relationships, so the same event plays differently for different heroes. Shown as comic-panel scenes between fights. (Wikipedia, PC Gamer, reviews)

**Relationships with effects.** Friends, lovers and rivals form from events, and they change fights: after a hero's rival lands a stunt (Wildermyth's critical hit), the hero's own stunt chance rises, from +25% at the first level of rivalry to +100% at full Rival, until they land one. ([Wildermyth wiki: Relationship](https://wildermyth.com/wiki/Relationship))

**Bodies change.** From general knowledge: heroes gain lasting transformations (a wolf's head, a crystal arm, a wooden limb) from events, each with a power and a look. They age across chapters and retire; a legacy system lets a favourite come back in a later campaign. A death or a loss is a scene, not a line.

**Story beats that touch the fight.** PC Gamer (90): "every story beat can affect combat." Game Informer: the story vignettes "are absolutely the highlight." (PC Gamer, Game Informer)

**Where players bounced.** Repetition: "events are starting to repeat themselves," villain campaigns that "start off interesting but ultimately have a repetitive theme," a loop of map, comic, fight, "repeat ad nauseam." Combat split opinion: "one-dimensional" to one critic, a depth that "gradually unveils itself" to another. (RPG Site, RPGamer, RPGFan, Backloggd)

## 3. What we already have

- **DD's long scars.** Earned traits (`data/earnedTraits.js`, `core/earned.js`): what happens on the job changes people, lasting or temporary, some drawn as setbacks. `burned_out` comes from repeated tech failures and fades with rest.
- **DD's recovery cost.** Fatigue, morale and neural load on every runner (`core/time.js`), rest at home, faster with a Canteen (`data/hallBuild.js`).
- **Wildermyth's relationships with effects.** `crew_anchor` (shown as a Synergy): +1 cool on jobs with a partner, shaken for a job after that partner is critically hurt.
- **Wildermyth's no-repeat rule.** The expedition log keeps a short list of lines a trip has said (`core/advlog.js` `SEEN_KEEP` 16) so a trip doesn't repeat itself while it has others.
- **A loss as a story.** The Wall, the Hall of Legends, Gone elsewhere, a runner's Career tab.
- **DD's random wipe, refused.** Our death rule (only after a risk the player accepted and was shown) is the answer to "a bad roll wiped my best squad."

## 4. How this applies to Syndicate Manager

1. **Show the strain land.** DD made stress a visible number so every hit to the mind is felt. Our morale and fatigue move quietly. Worth a look: a line in the report when a job leaves someone shaken, and a word on the runner's card when they're close to the edge.
2. **A breaking point that can go either way.** DD's best idea is the check at the edge: most break, a few rise. A runner pushed too far who sometimes comes out stronger (an earned trait) would make strain exciting, not only a cost. It must stay inside the death rule: a breakdown costs a job or a choice, never a life.
3. **Taking control away is expensive.** Sigman says it was hard to balance. If a runner ever acts on their own (refuses an order, bolts), it should be rare, shown in advance as a risk, and never kill anyone.
4. **Recovery as a money sink.** DD keeps you poor by charging to heal minds. We have rest and the Canteen. A paid way to clear a setback trait (a doctor, a temple, a week off with pay) is a sink that also tells a story.
5. **Relationships that the player sees form.** We have one (`crew_anchor`). Wildermyth's rivals who fight better beside each other is a second, cheap, funny one. `drafts/earned-traits-backlog.md` has no relationship traits yet (checked 2026-11-26), so this would be new.
6. **Stories that read the people in them.** Wildermyth's events have hooks for traits and relationships. Our job crises and expedition lines could name a runner's trait or partner when they fit, the way `{partner}` already fills in.
7. **Repetition is the slow killer.** Both games' long-run complaint. We guard lines within one trip; check repetition across trips and across a season, and keep the line pools growing.
8. **The look can change.** Wildermyth's transformations are memorable because the picture changes. Our tattoos (`core/marks.js`) are a start; a lasting injury or a mark that shows on the runner's face would do the same.
9. **Don't make losses a grind.** DD's "constant influx of new heroes" is its most tiring part. Our recruits and free names should make replacing someone a choice with a story, not a chore.

## 5. Open checks

- Does a report say when a job leaves someone shaken or close to the edge?
- How often does a player see the same expedition or crisis line across a season?

## Sources

- [Game Developer: Darkest Dungeon's affliction system (design deep dive)](https://gamedeveloper.com/design/game-design-deep-dive-i-darkest-dungeon-s-i-affliction-system)
- [PC Gamer: How Darkest Dungeon got inspiration from Band of Brothers and Aliens](https://www.pcgamer.com/how-darkest-dungeon-got-inspiration-from-band-of-brothers-and-aliens)
- [GDC Vault: Darkest Dungeon, a design postmortem](https://gdcvault.com/play/1023089/contactUs)
- [Dread Central: How Darkest Dungeon builds characters out of mechanics](https://www.dreadcentral.com/editorials/483362/darkest-dungeon-builds-exciting-characters-from-game-mechanics/)
- [Destructoid: In Darkest Dungeon, what doesn't kill you only makes you more peculiar](https://destructoid.com/?p=183624)
- [Destructoid: Darkest Dungeon review](https://www.destructoid.com/reviews/review-darkest-dungeon/)
- [RPGFan: Darkest Dungeon review](https://www.rpgfan.com/review/darkest-dungeon/)
- [Yahoo: Harrowing Darkest Dungeon lets you play with madness](https://www.yahoo.com/tech/review-harrowing-darkest-dungeon-lets-you-play-005618696.html)
- [Giant Bomb user review: Swords to rust, hearts to dust](https://giantbomb.com/user-reviews/id/65194/swords-to-rust-hearts-to-dust)
- [Honest Gamers: Darkest Dungeon review](https://www.honestgamers.com/13265/pc/darkest-dungeon/review.html)
- [Backloggd: Darkest Dungeon reviews](https://www.backloggd.com/reviews/everyone/eternity/liked/darkest-dungeon/)
- [Steam review (Syntax-Error)](https://steamcommunity.com/id/Syntax-Error/recommended/262060)
- [Goodreads: Game dev interview, Wildermyth](https://www.goodreads.com/author_blog_posts/19162356-game-dev-interview-wildermyth)
- [GameBanshee: Wildermyth interview](https://gamebanshee.com/xykr3)
- [Wikipedia: Wildermyth](https://en.wikipedia.org/wiki/Wildermyth)
- [AIAS Game Maker's Notebook: Balancing procedural and intimate storytelling in Wildermyth](https://interactive.libsyn.com/website/balancing-procedural-and-intimate-storytelling-in-wildermyth)
- [PC Gamer: Wildermyth review](https://www.pcgamer.com/wildermyth-review/)
- [PC Gamer: Wildermyth has all the adventure and humour of a D&D homebrew](https://pcgamer.com/fantasy-rpg-wildermyth-has-all-the-adventure-and-humour-of-a-dandd-homebrew)
- [Game Informer: Wildermyth review](https://gameinformer.com/review/wildermyth/wildermyth-review-tales-and-tactics)
- [RPG Site: Wildermyth review](https://rpgsite.net/review/12107-wildermyth-review)
- [RPGamer: Wildermyth review](https://rpgamer.com/?p=98272)
- [RPGFan: Wildermyth review](https://www.rpgfan.com/review/wildermyth)
- [Backloggd: Wildermyth reviews](https://backloggd.com/reviews/everyone/year/recent/wildermyth/)
