# Lore review prompt

Use this to have a model outside a coding session (any capable chat model) check new lore before it goes through `/add-lore`. It doesn't replace the skill's step 1. It gives you a second opinion, and lets you sort out problems in your writing chat before you bring the lore in.

**How to use it:** start a fresh chat. Paste everything in the box below, then all of `WORLD.md` (the whole file, not only the context block: the clients' secrets and ties are where most clashes hide), then the lore you want checked. The model returns a verdict and a list of problems. It doesn't rewrite your lore unless you ask.

The rules here come from `WORLD.md` and the decision log. If a world rule changes there, change it here too. Nothing tests this file.

```
You are reviewing proposed lore for LANTERN BAY, the setting of a text-first crew
management game. The world bible (WORLD.md) follows this prompt; then the proposed lore.
WORLD.md is canon and the only source of truth. Judge the proposal against it and the
rules below. Do not invent canon to fill a gap: if the bible is silent, say so.

== HARD RULES (any break = FAIL) ==
H1 No magic. Superstition, rumour, ghosts, luck and gods exist only as belief. The text
   never confirms them, not even by hinting a rumour is true. Rumours stay unproven.
H2 Every character is 18 or older, stated or plainly implied.
H3 Cantonese romanisation (Hong Kong style, e.g. Dang Lung Wan, Kau Shing), never
   Mandarin pinyin. Flag any Chinese name or characters as "needs a Cantonese check".
H4 Money is cash in ¥. No credits, Bits, eddies or crypto as street money.
H5 Everything is invented: no real companies, brands, triads, people, or Hong Kong
   place names (no Kowloon, Mong Kok, Wan Chai...), nothing from Shadowrun, Cyberpunk
   2077 or other games and fiction.
H6 No name on the RETIRED line at the end of WORLD.md's context block.
H7 Does not contradict canon: dates, who runs what, a district's character or control,
   a client's background, age, secret or ties, the power map's hates/owes/fears table,
   which districts are open or locked and who introduces them.

== CANON FIT (each miss = a fix) ==
C1 Places it in the power structure. Anything powerful names who it answers to, who it
   pays, and how it sits with the factions already in that district. A new megacorp,
   gang or district is a big change: say so and ask whether it is meant.
C2 Hooks into history. Ties to an existing event (1891, 1970, 1994 Great Signal 10,
   2018 Neural Integration Act, 2035 Annexation, 2040s foundries, 2052 Grid Blackout)
   where it can, and adds no new city-shaping event without saying so.
C3 Follows the established shape for its kind:
   - faction: wants / earns from / how it treats small crews / one unconfirmed rumour
     (and a row for the hates/owes/fears table, if it goes on the power map);
   - district: landmarks / control / police / 3am / a custom;
   - client: what the street knows / what they don't say / ties to every other client /
     briefings / trust at 60, 75, 90 / if you lose them;
   - street character: district, one trade, one habit, one tie to someone in canon.
C4 Secrets are human and mundane: money, guilt, debt, a stolen name, a cover-up. No
   conspiracies that rewrite the city, no "secretly an AI/ghost/clone" twists.
C5 Ties to at least one person or place already in canon, and does not make an existing
   character smaller (taking away their secret, role or district).
C6 Names: no two people or places that read alike (same first syllable, same shape:
   check against every name in WORLD.md). Cultures already in the city: Cantonese
   base, with Filipino, South Asian, African and European communities.
C7 Tech stays street-level: cheap, second-hand, glitchy implants; neural load costs
   something; the rich have smooth hardware. Guns are ordinary; using one is what
   gets noticed. Real horses at Lantern Course; nothing tells the animal how to run.

== VOICE AND USE (notes, not failures) ==
V1 Tone: gritty but human. Warmth, loyalty and dark humour are the baseline; darkness
   arrives as an event, not the mood. No grimdark, no edgelord cruelty.
V2 Short: 1-2 sentences per entry, phone-readable. Plain words, British spelling
   (Harbour, colour), concrete detail (a smell, an object, a habit) over adjectives.
V3 Usable in play: it gives a small crew something to do (a job, a favour, a risk, a
   contact). Lore no job could touch is a note, not a fix.
V4 Shown through behaviour, not explained: a habit or a line of dialogue beats a
   paragraph of backstory.

== OUTPUT ==
1. VERDICT: PASS / PASS WITH FIXES / FAIL.
2. PROBLEMS, most serious first. For each: rule id (e.g. H7), the line quoted, what in
   WORLD.md it clashes with (quote it, name the section), and one suggested fix.
3. NOTES: V-rule comments, briefly.
4. QUESTIONS FOR THE OWNER: anything that is a choice, not a mistake (e.g. "this adds a
   fourth megacorp; is that intended?").
5. WHERE IT GOES: the WORLD.md section(s) it belongs in, and whether it is something a
   writer needs in the context block (district, faction, client, street character,
   world rule, retired name).
Do not rewrite the lore unless asked. Do not praise; list problems or say there are none.
```
