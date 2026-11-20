# Threat 3 and the Heights extracts (2026-11-20)

Measurement only. Follows `docs/sims/misses-2026-11-20*.md`, whose "Won" column made threat 3 look weak (22% to about 30%).

## Threat 3 is fine: its hacks mostly break off with the job done

13 of threat 3's 15 fight jobs are hacks. How they end on steady (today's rules, 1,920 fights): the crew breaks off on the way out with the hack done 61% (`end.wayOutPulled`: the objective and the pay are kept; the cost is whoever is down), fights the way out to the end 20%, pulls out before the hack is done 11.5%, loses the tech 6.5%. **The job gets done in 81% of threat 3 hacks** (threat 2: 95%, threat 4: 72%). Threat 3's extracts and yards win 88-89%.

## The real outlier: left behind on three Heights extracts

Left behind on steady, by extract job (the owner's target: about 15%, 2026-11-19): penthouse 51%, the_current_copy 28%, exit_interview 21%; every other extract 11% or less (the_last_collection 11%, kidnap 6%, the rest 0-5%). The three are every Heights extract at threat 3 or more (after_hours, threat 2, faces one enemy). The Heights force is corp security (20 HP, hits for 20, never flees, plays a **backup** card) and plated drones. All three got their fight type as a first guess on 2026-11-19.

`node scripts/sim-heights-extracts.mjs <rosters>` (rosters from `SAVE_ROSTERS=<file> node scripts/sim-misses.mjs 8 1 scratch`): 8 campaigns, 40 fights a roster a risk. "Done" = the objective kept (a left-behind runner still counts); "left" = a runner left behind; "downs" a fight; "dead" = fights with a death (committed only).

```

the_current_copy (threat 3, crew 3)
  extract (today)            cautious: done  97% left  26% downs 0.85 | steady: done  97% left  28% downs 0.96 | committed: done 100% left  30% downs 0.96 dead  10%
  extract, at most 1 backup  cautious: done  97% left  13% downs 0.47 | steady: done  96% left  12% downs 0.46 | committed: done 100% left  18% downs 0.56 dead   5%
  extract, no backup         cautious: done  93% left   5% downs 0.22 | steady: done  93% left   4% downs 0.19 | committed: done 100% left   5% downs 0.21 dead   3%
  hack                       cautious: done  74% left   0% downs 0.85 | steady: done  79% left   0% downs 0.92 | committed: done  35% left   0% downs 2.18 dead   8%
  yard                       cautious: done  53% left   0% downs 0.46 | steady: done  59% left   0% downs 0.43 | committed: done  84% left   0% downs 0.75 dead   5%

exit_interview (threat 4, crew 4)
  extract (today)            cautious: done  95% left  23% downs 1.09 | steady: done  96% left  19% downs 1.15 | committed: done 100% left  30% downs 1.26 dead   5%
  extract, at most 1 backup  cautious: done  95% left  13% downs 0.62 | steady: done  94% left   9% downs 0.66 | committed: done 100% left  10% downs 0.55 dead   3%
  extract, no backup         cautious: done  90% left   3% downs 0.24 | steady: done  91% left   2% downs 0.23 | committed: done 100% left   3% downs 0.25 dead   1%
  hack                       cautious: done  77% left   0% downs 0.74 | steady: done  83% left   0% downs 0.78 | committed: done  54% left   0% downs 2.18 dead  17%
  yard                       cautious: done  60% left   0% downs 0.41 | steady: done  68% left   0% downs 0.34 | committed: done  95% left   0% downs 0.59 dead   5%

penthouse (threat 5, crew 4)
  extract (today)            cautious: done  81% left  50% downs 1.95 | steady: done  84% left  56% downs 2.44 | committed: done 100% left  65% downs 2.81 dead  24%
  extract, at most 1 backup  cautious: done  72% left  27% downs 1.26 | steady: done  75% left  34% downs 1.76 | committed: done 100% left  56% downs 2.31 dead  19%
  extract, no backup         cautious: done  68% left  15% downs 0.79 | steady: done  69% left  14% downs 0.92 | committed: done 100% left  32% downs 1.55 dead  12%
  hack                       cautious: done  30% left   0% downs 0.88 | steady: done  42% left   0% downs 1.01 | committed: done  15% left   0% downs 3.23 dead  20%
  yard                       cautious: done  14% left   0% downs 0.93 | steady: done  14% left   0% downs 0.95 | committed: done  39% left   0% downs 2.77 dead  15%
```


## Picked (owner, 2026-11-20)

At most 1 backup on the_current_copy and exit_interview, none on penthouse (`FIGHT_RECIPES`). The "extract (today)" rows above are the rules before; the matching capped rows are the rules now.
