# Opening jobs: outlines for the owner (draft, 2026-11-06)

An opening job is a favour for a district's contact, done before they offer you a hall there.
These began as outlines for the owner; **the full drafts are now in `drafts/opening-jobs/`** (see its
README), for the owner to edit. Once the text is final, each one goes through `docs/new-job-prompt.md` and `/add-job` like any other. Old Town has none: it's
the home hall.

Checked against `WORLD.md` (the context block, the four clients' sections) and the jobs each
contact already gives, so none of these repeats one. No new named people. Anything marked **lore?**
would need the `add-lore` skill before it ships.

## How it would work in the game (for the build, after the writing)

- **Today:** on a Monday when your reputation and the contact's trust are high enough, the contact's
  message offers the hall (`core/halls.js introduceHalls`). You pay the deposit and it's yours.
- **With an opening job:** that Monday, the contact asks for the favour instead. It's a named offer
  on the board, with their own brief.
  - **Finish it** (not aborted) and the hall offer follows, with the deposit as now.
  - **Walk away or fail,** and they ask again two weeks later, with a different favour: one of their
    own existing jobs, picked per game by the seed, with a line saying it's the test. Finish that one
    and the hall is offered. Nobody's locked out for good, and the retry isn't the same story again.
- **Fixed for every player** (owner, 2026-11-06): each district has one opening job, the same in every
  game, because it's the introduction to the contact and their rooms. Runs still differ by which
  crises come up and how the rolls go, by which hall opens first, and by who you send.
- **Size:** a step up from rookie work, about the reach the hall asks for:

  | Hall | Welcome needs | Danger | Days | Pay |
  | --- | --- | --- | --- | --- |
  | Night Market | reputation 25 | 2 | 1 | ¥3,000 |
  | Docks | reputation 40 | 2 | 1 | ¥4,000 |
  | Basin | reputation 40 | 3 | 1 | ¥5,000 |
  | Glass Heights | reputation 60 | 3 | 2 | ¥6,000 |

  The pay is a little low on purpose: the hall is the reward.
- **The last beat** of each job is the contact handing over the place. That place is the hall map's
  own (`data/sites.js HALLS`), so the story and the map are the same rooms.

---

## 1. The Night Market: *Back Rent* (Madam Rao)

**The hall:** two rooms above her sari shop.

**Why this is the test:** Rao lends to everyone and trusts nobody with her own roof. Before she lets a
crew live over her shop, she wants to see if they can be quiet on Silver Fan ground.

**The ask** (draft, her voice): "There are two rooms over my shop that a Silver Fan collector thinks
he's renting. He has paid me nothing since Lunar New Year, beta. I want his boxes gone and my rooms
empty by morning. Quietly. If anyone asks, you were buying silk."

**Shape:** danger 2, 1 day, 2-3 crew. The stats that count are stealth, social and cool.

**Beats:**
1. Meena D'Sa lets you in the back of the shop after closing. Bolts of silk, the brass bell tied
   off so it won't ring.
2. Upstairs: crates of counterfeit chrome eyes and a collector's tally book, stacked where the beds
   should be.
3. Getting the crates down the shop stair and out through the market while the dai pai dongs are
   still serving.
4. Dawn. Rao counts the empty rooms like banknotes. "Two rooms. A hot plate. The bell rings when
   anyone comes up, so don't bring anyone I'd mind."

**Crisis ideas:**
- **The collector's runner comes for a crate mid-move.**
  - Talk him round (social): he leaves thinking the boxes were moved by his own side.
  - Hide in the silk (stealth): a long, tense wait.
  - Abort: leave the crates, walk out through the shop.
- **The tally book names Night Market debtors, Rao's people among them.**
  - Bring it to Rao: trust up.
  - Burn it: the debtors are off the hook.
  - Keep it to sell: cash now, Rao finds out later.
- **A Wet Sleeve patrol at the end of the alley** while the crates are on the trolley.
  - Pay the "neural-load check" fine: cash and heat.
  - Wait them out (cool).
  - Abort: leave the trolley.

**For the owner to decide:**
- Should this count as a job **against the Silver Fan** (grudge +1)? It fits: the rooms come with a
  quarrel, and it ties into gang raids. But it means your first hall outside Old Town starts with a
  small grudge.
- Which named collector? Tang Wai-chiu is canon, a third-floor parlour collector, and a good fit.

---

## 2. The Docks: *Quarter to Two* (the Ferryman)

**The hall:** a container office on the old pier, with a stove.

**Why this is the test:** he gives the pier office only to people who've been on the boat. "The
harbour doesn't care who you are. Neither do I." One night run, done his way.

**The ask** (draft): "Tide turns at two. Be on the boat at quarter to, or be a swimmer. Auntie
Fung's crates go out past the breakwater to a lighter that won't show lights. You load, you keep
your heads down, you don't ask about the cigarette."

**Shape:** danger 2, 1 day (one night), 2-3 crew. The stats that count are driving (the boat, the
crane), cool and stealth.

**Beats:**
1. The landing at the old pier, fog, the engine coughing out of it. He holds the boat off with a
   bare foot on a tyre.
2. Loading Fung's crates in the dark. He lights a clove cigarette and smokes it facing backwards.
   It's a dangerous run, and nobody says so.
3. Out past the breakwater among Aether-Harbour's unlit lighters, finding the right one by sound.
4. Back at the pier before the light. He points his chin at the container office. "Stove works.
   Don't touch the old man's charts."

**Crisis ideas:**
- **The Red Lanterns' toll boat** comes alongside, and tonight's toll is higher.
  - Pay it as he always does: cash.
  - Argue the old rate (social).
  - Abort: turn back and lose the tide.
- **An Aether-Harbour lighter's wash** swamps the stern, and a crate goes over.
  - Dive for it (combat or cool, with a light injury risk).
  - Let it go: pay cut.
- **A Wet Sleeve launch** sweeps a light across the water.
  - Cut the engine and drift (cool).
  - Outrun it (driving): heat.
  - Abort: drop the crates on the breakwater for later.

**Notes:**
- "The old man's charts" is a hint, nothing more. It points at his secret (the real Leung) without
  telling it, so it's safe at trust 60, where canon has him start telling "old man" stories.
- **Lore?** Fung's goods going out to a lighter at night is in canon already (her goods, his boats).
  Nothing new.

---

## 3. The Basin: *The Flat Doesn't Exist* (Ruth Okonkwo)

**The hall:** a flat over a tack workshop, with a view of the Old Stand.

**Why this is the test:** Okonkwo wants a place in the Basin that nothing connects to her. The flat
was an Aether-Harbour listening post. Before your crew can live there, every trace of that has to
go, and nobody at the Racing Association can notice.

**The ask** (draft): "There's a flat above a tack workshop, facing the Old Stand. Aether-Harbour
used it for a while. Officially, they didn't. I want everything they left taken out of the flat and
off the Stand's camera mast by the last race. Then the flat is yours, and it doesn't exist either."

**Shape:** danger 3, 1 day (race night), 3 crew. The stats that count are tech, stealth and cool.

**Beats:**
1. Race night. The floodlights come up over Lantern Course, and the crowd noise covers everything.
2. In the flat: taped-up windows, a relay box under the floorboards, a camera looking straight at
   the owners' boxes.
3. Up the Old Stand's camera mast during the fourth race, to pull the tap Aether-Harbour hid in the
   Racing Association's own feed.
4. Back in the empty flat, the Old Stand lit up through the window. Okonkwo wipes her tablet and
   leaves the keys on the sill. "This conversation didn't happen. The rent does."

**Crisis ideas:**
- **Mak Chi-on,** the stable-access official, recognises one of the crew on the stairs.
  - Talk your way past (social).
  - Slip into the crowd (stealth).
  - Abort: leave the mast for another night.
- **The relay box is still sending,** and pulling it will show on someone's screen.
  - Spoof it (tech).
  - Rip it and run (combat or cool): heat.
- **A hard drive in the floor** holds weeks of the owners' boxes on camera.
  - Hand it to Okonkwo.
  - Wipe it.
  - Keep a copy: someone might pay for it.

  This echoes her own secret file. **Lore?** Only if keeping a copy has later consequences.

**Notes:**
- Her betting accounts at Lantern Course ("declines to explain the distinction") are the colour
  here. The job never says what she bets on.
- She's the Amber Reach's contact in canon, but she gives Basin jobs already (*Last Ticket*), and
  `data/halls.js` already names her for the Basin hall.

---

## 4. Glass Heights: *There Is No Forty-First Floor* (Mr. Szeto)

**The hall:** a service floor nobody upstairs remembers.

**Why this is the test:** Szeto never asks how you did the job, but he'll only lend a floor of his
own tower to people who can make a thing disappear. The floor has to come off the building's plans
before Veridian-Apex's security audit walks it.

**The ask** (draft): "I'm not paying you to understand the job. My tower has a service floor between
forty and forty-two. On Thursday, Veridian-Apex security walk every floor for their lease. By
Thursday, there is no forty-first floor. Afterwards, you may use it."

**Shape:** danger 3, 2 days, 3 crew. The stats that count are tech, social and stealth.

**Beats:**
1. Day 1: the building's management office. The floor plans live on a server older than the glass.
2. Swapping the plans, then the lift's floor list, then the fire drawings, so every record agrees.
3. Day 2: the audit. Veridian-Apex guards with tablets ride the service lift past a floor that
   isn't there.
4. Szeto at the window, back to you. "There is no forty-first floor. Make yourselves at home."

**Crisis ideas:**
- **An auditor's tablet counts more floors** than the lift says.
  - Talk him round: a printer error (social).
  - Fix the count from the plant room (tech).
  - Abort: let the floor be found, and Szeto doesn't call.
- **Someone already uses the floor:** a cot, a kettle, a photo of an Old Town tenement.
  - Leave it untouched (cool).
  - Clear it out: someone loses their bolt-hole.

  **Lore?** Whose cot is it? Lo the electrician is the obvious answer, but that would bring his
  secret closer than canon allows at trust 60. Better left a mystery, or someone new.
- **Hoi-Sing's power audit** runs the same day, and the floor draws current.
  - Reroute it (tech).
  - Pay a Hoi-Sing crew to look away: cash, and Szeto's name gets used.

**Notes:**
- The tenement photo is a quiet nod to his mother's fire. Nobody comments on it.
- Danger 3 and 2 days fit reputation 60, the furthest hall from home.

---

## Questions for the owner

1. **The four ideas:** keep, change or replace any of them?
2. **Back Rent:** should it add Silver Fan grudge?
3. **The failure rule:** if you walk away or fail, the contact asks again after two weeks with one of
   their existing jobs as the test (decided). Should failing also cost trust, and if so, how much?
4. **Who writes what:** do you want to write the full text (briefs, beats, the crises' outcomes)
   from these, or have a draft written with `docs/new-job-prompt.md` for you to edit?
