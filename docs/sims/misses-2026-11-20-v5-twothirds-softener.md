# How often the crew's shots miss (2026-11-20-v5-twothirds-softener)

**Rules played:** climb share 0.67, softener +3 a miss to +9.

`node scripts/sim-misses.mjs 8 20 2026-11-20-v5-twothirds-softener`. Measurement only: nothing changes. Real fight code, hands-off, every job in `FIGHT_JOBS` (77), each with the best team by combat (a tech on a hack, a medic on a team of 3 or more) of a campaign roster grown to the job's gate (8 campaigns), 20 fights a roster a job a risk. Difficulty: `fightDiff(rollTarget(job))`, the crises' own. Campaigns reaching each threat's gate: threat 1 8/8, threat 2 8/8, threat 3 8/8, threat 4 7/8, threat 5 5/8.

- **Miss:** the roll failed. **Crack:** the roll passed but a plate took it all (no HP off). **Hit:** HP came off.
- **Roll chance:** the average chance the rolls had, the bad-luck softener included (+3 a miss in a row, to +9). Today's rule: d20 + combat (+ softener) against 10 + difficulty -2 + cover (half 2, full 4).
- **Rounds with nothing landed:** rounds in which the crew fired at least once and took no HP off anyone.

## Overall

| | Fights | Crew shots | Miss | Crack (no HP) | Hit | Roll chance | Rounds with nothing landed | Longest miss run a fight | A run of 3+ misses | 4+ | Enemy shots that hit | Won | Downs a fight | A death |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| cautious | 12100 | 53356 | **25%** | 5% | 70% | 75% | 17% | 0.7 | 2% | 0% | 60% | 77% | 0.23 | 0 |
| steady | 12100 | 57028 | **26%** | 5% | 69% | 74% | 17% | 0.7 | 3% | 0% | 60% | 81% | 0.24 | 0 |
| committed | 12100 | 66949 | **26%** | 5% | 69% | 74% | 17% | 0.8 | 4% | 0% | 60% | 87% | 0.44 | 2.2% |

## By threat (steady)

| | Fights | Crew shots | Miss | Crack (no HP) | Hit | Roll chance | Rounds with nothing landed | Longest miss run a fight | A run of 3+ misses | 4+ | Enemy shots that hit | Won | Downs a fight | A death |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| threat 1 | 4320 | 11635 | **10%** | 0% | 90% | 90% | 8% | 0.2 | 0% | 0% | 32% | 97% | 0.01 | 0 |
| threat 2 | 4160 | 18332 | **29%** | 2% | 69% | 71% | 23% | 0.8 | 5% | 1% | 51% | 95% | 0.04 | 0 |
| threat 3 | 2400 | 16489 | **31%** | 10% | 59% | 69% | 21% | 1.1 | 5% | 1% | 61% | 32% | 0.75 | 0 |
| threat 4 | 1120 | 9786 | **29%** | 6% | 64% | 71% | 8% | 1.2 | 3% | 0% | 73% | 74% | 0.53 | 0 |
| threat 5 | 100 | 786 | **33%** | 12% | 55% | 68% | 11% | 1.3 | 4% | 0% | 66% | 23% | 2.32 | 0 |

## By the team's best combat (steady)

| | Fights | Crew shots | Miss | Crack (no HP) | Hit | Roll chance | Rounds with nothing landed | Longest miss run a fight | A run of 3+ misses | 4+ | Enemy shots that hit | Won | Downs a fight | A death |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 10-12 | 4480 | 18837 | **27%** | 4% | 69% | 73% | 19% | 0.6 | 3% | 0% | 55% | 84% | 0.16 | 0 |
| 13-15 | 5540 | 26266 | **26%** | 5% | 69% | 74% | 18% | 0.7 | 3% | 0% | 60% | 77% | 0.27 | 0 |
| 16+ | 2080 | 11925 | **24%** | 5% | 71% | 76% | 9% | 0.8 | 3% | 0% | 66% | 82% | 0.29 | 0 |

## Every job (steady), most misses first

| Job (threat, type) | Fights | Crew shots | Miss | Crack (no HP) | Hit | Roll chance | Rounds with nothing landed | Longest miss run a fight | A run of 3+ misses | 4+ | Enemy shots that hit | Won | Downs a fight | A death |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| house_advantage (2, hack) | 160 | 1378 | **39%** | 0% | 61% | 63% | 31% | 1.7 | 20% | 4% | 51% | 99% | 0.01 | 0 |
| service_included (2, hack) | 160 | 1412 | **39%** | 0% | 61% | 63% | 31% | 1.8 | 24% | 4% | 54% | 99% | 0.01 | 0 |
| the_guest_copy (2, hack) | 160 | 1362 | **38%** | 0% | 62% | 62% | 29% | 1.7 | 18% | 3% | 48% | 98% | 0.03 | 0 |
| after_the_applause (2, hack) | 160 | 1345 | **37%** | 0% | 63% | 62% | 30% | 1.7 | 15% | 3% | 56% | 99% | 0.01 | 0 |
| cover_the_late_shift (3, hack) | 160 | 1281 | **36%** | 0% | 64% | 65% | 17% | 1.3 | 11% | 2% | 62% | 47% | 0.54 | 0 |
| casino (2, hack) | 160 | 1355 | **36%** | 0% | 64% | 63% | 28% | 1.7 | 23% | 4% | 55% | 99% | 0.01 | 0 |
| wrong_horse (3, hack) | 160 | 1199 | **35%** | 0% | 65% | 65% | 16% | 1.3 | 12% | 2% | 62% | 40% | 0.58 | 0 |
| the_flat_doesnt_exist (3, hack) | 160 | 1154 | **35%** | 0% | 65% | 65% | 17% | 1.2 | 8% | 1% | 62% | 40% | 0.61 | 0 |
| one_more_song (3, hack) | 160 | 874 | **34%** | 24% | 42% | 65% | 34% | 1.0 | 3% | 0% | 67% | 11% | 0.94 | 0 |
| penthouse (5, extract) | 100 | 786 | **33%** | 12% | 55% | 68% | 11% | 1.3 | 4% | 0% | 66% | 23% | 2.32 | 0 |
| quiet_hours (3, hack) | 160 | 1242 | **32%** | 0% | 68% | 65% | 15% | 1.3 | 10% | 2% | 61% | 46% | 0.53 | 0 |
| borrowed_glory (4, extract) | 140 | 1217 | **31%** | 0% | 69% | 70% | 3% | 1.3 | 4% | 0% | 72% | 85% | 0.24 | 0 |
| count_against_paper (2, hack) | 160 | 934 | **31%** | 0% | 69% | 67% | 27% | 1.3 | 8% | 2% | 52% | 79% | 0.14 | 0 |
| dead_air (4, extract) | 140 | 1216 | **31%** | 0% | 69% | 70% | 4% | 1.3 | 4% | 0% | 72% | 86% | 0.26 | 0 |
| the_last_collection (4, extract) | 140 | 1229 | **31%** | 0% | 69% | 70% | 2% | 1.2 | 3% | 0% | 76% | 79% | 0.57 | 0 |
| protection (3, yard) | 160 | 1355 | **30%** | 0% | 70% | 70% | 14% | 1.2 | 4% | 1% | 59% | 89% | 0.11 | 0 |
| kidnap (4, extract) | 140 | 1190 | **30%** | 0% | 70% | 70% | 4% | 1.3 | 4% | 0% | 73% | 81% | 0.35 | 0 |
| warehouse (4, extract) | 140 | 1271 | **30%** | 19% | 51% | 70% | 8% | 1.3 | 2% | 0% | 80% | 92% | 0.27 | 0 |
| data_pull (3, hack) | 160 | 1190 | **30%** | 14% | 56% | 71% | 21% | 1.2 | 4% | 1% | 56% | 9% | 0.95 | 0 |
| still_clocked_in (3, hack) | 160 | 500 | **30%** | 31% | 39% | 69% | 42% | 0.6 | 0% | 0% | 64% | 1% | 1.08 | 0 |
| the_wrong_fare (3, hack) | 160 | 1320 | **30%** | 28% | 42% | 69% | 40% | 1.2 | 1% | 0% | 70% | 3% | 1.04 | 0 |
| the_replacement_visit (3, hack) | 160 | 1103 | **30%** | 13% | 58% | 71% | 21% | 1.1 | 4% | 1% | 55% | 11% | 0.94 | 0 |
| what_was_installed (3, hack) | 160 | 1034 | **30%** | 13% | 58% | 72% | 21% | 1.1 | 3% | 1% | 56% | 8% | 0.99 | 0 |
| low_water (3, extract) | 160 | 931 | **29%** | 0% | 71% | 69% | 10% | 1.1 | 1% | 0% | 62% | 88% | 0.19 | 0 |
| expected_upstairs (3, hack) | 160 | 1129 | **29%** | 12% | 59% | 72% | 18% | 1.1 | 4% | 1% | 55% | 8% | 0.93 | 0 |
| not_for_sale (4, extract) | 140 | 1221 | **28%** | 0% | 72% | 70% | 2% | 1.2 | 1% | 0% | 74% | 91% | 0.26 | 0 |
| someone_at_the_controls (3, hack) | 160 | 1147 | **28%** | 14% | 58% | 72% | 22% | 1.1 | 3% | 0% | 56% | 14% | 0.92 | 0 |
| the_current_copy (3, extract) | 160 | 1030 | **27%** | 14% | 59% | 73% | 15% | 1.0 | 1% | 0% | 55% | 65% | 0.97 | 0 |
| still_connected (4, hack) | 140 | 1170 | **27%** | 20% | 53% | 71% | 29% | 1.2 | 1% | 0% | 79% | 9% | 1.01 | 0 |
| an_old_account (2, extract) | 160 | 494 | **27%** | 0% | 73% | 76% | 21% | 0.6 | 0% | 0% | 52% | 100% | 0.00 | 0 |
| data_scrub (2, hack) | 160 | 1147 | **27%** | 19% | 54% | 74% | 28% | 1.2 | 6% | 1% | 52% | 59% | 0.37 | 0 |
| favourite (2, yard) | 160 | 419 | **26%** | 0% | 74% | 76% | 18% | 0.5 | 0% | 0% | 43% | 100% | 0.00 | 0 |
| manual_handling (2, extract) | 160 | 491 | **26%** | 0% | 74% | 76% | 21% | 0.6 | 0% | 0% | 50% | 100% | 0.00 | 0 |
| back_rent (2, extract) | 160 | 487 | **25%** | 0% | 75% | 75% | 19% | 0.6 | 0% | 0% | 50% | 100% | 0.00 | 0 |
| exit_interview (4, extract) | 140 | 1272 | **25%** | 12% | 63% | 74% | 3% | 1.2 | 3% | 0% | 60% | 69% | 1.25 | 0 |
| last_sitting (2, extract) | 160 | 506 | **24%** | 0% | 76% | 76% | 20% | 0.6 | 1% | 0% | 46% | 99% | 0.00 | 0 |
| last_ticket (2, extract) | 160 | 474 | **24%** | 0% | 76% | 76% | 19% | 0.6 | 0% | 0% | 51% | 100% | 0.00 | 0 |
| relay_cover (2, hack) | 160 | 1108 | **24%** | 10% | 66% | 75% | 21% | 1.1 | 6% | 0% | 48% | 60% | 0.35 | 0 |
| quarter_to_two (2, extract) | 160 | 492 | **23%** | 0% | 77% | 76% | 17% | 0.5 | 0% | 0% | 46% | 100% | 0.00 | 0 |
| someone_to_cover (2, yard) | 160 | 376 | **22%** | 0% | 78% | 76% | 16% | 0.4 | 1% | 0% | 49% | 100% | 0.00 | 0 |
| still_on_the_books (2, yard) | 160 | 635 | **22%** | 8% | 70% | 78% | 9% | 0.6 | 1% | 0% | 36% | 100% | 0.00 | 0 |
| chrome (1, hack) | 160 | 891 | **22%** | 0% | 78% | 80% | 21% | 1.0 | 4% | 0% | 28% | 90% | 0.06 | 0 |
| a_steady_hand (1, hack) | 160 | 853 | **21%** | 0% | 79% | 80% | 17% | 0.9 | 2% | 0% | 32% | 87% | 0.07 | 0 |
| eviction (1, hack) | 160 | 876 | **21%** | 0% | 79% | 80% | 16% | 0.9 | 1% | 0% | 30% | 90% | 0.04 | 0 |
| cable (1, hack) | 160 | 891 | **21%** | 0% | 79% | 80% | 18% | 0.9 | 2% | 0% | 28% | 91% | 0.06 | 0 |
| tack_ledger (2, yard) | 160 | 378 | **20%** | 0% | 80% | 81% | 17% | 0.3 | 0% | 0% | 59% | 99% | 0.01 | 0 |
| race_night_door (2, yard) | 160 | 378 | **20%** | 0% | 80% | 82% | 17% | 0.3 | 0% | 0% | 52% | 99% | 0.01 | 0 |
| mooring_watch (2, yard) | 160 | 414 | **20%** | 0% | 80% | 81% | 17% | 0.4 | 0% | 0% | 50% | 99% | 0.00 | 0 |
| paid_in_full (2, extract) | 160 | 480 | **20%** | 0% | 80% | 75% | 16% | 0.5 | 0% | 0% | 55% | 100% | 0.00 | 0 |
| signal_walk (1, hack) | 160 | 844 | **20%** | 0% | 80% | 79% | 16% | 0.8 | 2% | 0% | 35% | 86% | 0.09 | 0 |
| dry_shelf (2, yard) | 160 | 362 | **19%** | 0% | 81% | 82% | 16% | 0.3 | 0% | 0% | 46% | 98% | 0.02 | 0 |
| inspection_hours (2, yard) | 160 | 391 | **19%** | 0% | 81% | 81% | 15% | 0.3 | 0% | 0% | 52% | 99% | 0.01 | 0 |
| rent_round (2, extract) | 160 | 458 | **17%** | 0% | 83% | 82% | 15% | 0.4 | 0% | 0% | 57% | 93% | 0.01 | 0 |
| after_hours (2, extract) | 160 | 618 | **17%** | 8% | 75% | 84% | 13% | 0.5 | 0% | 0% | 48% | 94% | 0.07 | 0 |
| kit_return (2, extract) | 160 | 438 | **16%** | 0% | 84% | 82% | 13% | 0.4 | 0% | 0% | 49% | 98% | 0.00 | 0 |
| courier (1, extract) | 160 | 414 | **9%** | 0% | 91% | 90% | 8% | 0.2 | 0% | 0% | 51% | 98% | 0.01 | 0 |
| clear_the_ramp (1, yard) | 160 | 255 | **6%** | 0% | 94% | 96% | 5% | 0.1 | 0% | 0% | 28% | 100% | 0.00 | 0 |
| clinic (1, yard) | 160 | 265 | **5%** | 0% | 95% | 96% | 5% | 0.1 | 0% | 0% | 32% | 100% | 0.00 | 0 |
| queue_duty (1, yard) | 160 | 264 | **5%** | 0% | 95% | 96% | 5% | 0.1 | 0% | 0% | 30% | 100% | 0.00 | 0 |
| closing_sweep (1, yard) | 160 | 263 | **5%** | 0% | 95% | 96% | 3% | 0.1 | 0% | 0% | 30% | 100% | 0.00 | 0 |
| quiet_table (1, yard) | 160 | 249 | **4%** | 0% | 96% | 96% | 4% | 0.1 | 0% | 0% | 23% | 99% | 0.01 | 0 |
| container409 (1, extract) | 160 | 394 | **4%** | 0% | 96% | 97% | 4% | 0.1 | 0% | 0% | 32% | 98% | 0.00 | 0 |
| eyes_on_the_seal (1, yard) | 160 | 251 | **4%** | 0% | 96% | 95% | 4% | 0.1 | 0% | 0% | 29% | 100% | 0.00 | 0 |
| closing_stack (1, yard) | 160 | 268 | **4%** | 0% | 96% | 96% | 3% | 0.1 | 0% | 0% | 25% | 100% | 0.00 | 0 |
| access_window (1, yard) | 160 | 318 | **3%** | 9% | 87% | 97% | 8% | 0.1 | 0% | 0% | 35% | 100% | 0.00 | 0 |
| herbal_run (1, extract) | 160 | 409 | **3%** | 0% | 97% | 97% | 2% | 0.1 | 0% | 0% | 33% | 98% | 0.01 | 0 |
| second_hand_heart (1, extract) | 160 | 389 | **3%** | 0% | 97% | 97% | 3% | 0.1 | 0% | 0% | 33% | 97% | 0.00 | 0 |
| crate_return (1, extract) | 160 | 390 | **3%** | 0% | 97% | 97% | 2% | 0.1 | 0% | 0% | 32% | 99% | 0.00 | 0 |
| fitting_room (1, yard) | 160 | 283 | **3%** | 0% | 97% | 96% | 2% | 0.1 | 0% | 0% | 25% | 100% | 0.00 | 0 |
| stable_turnover (1, yard) | 160 | 254 | **3%** | 0% | 97% | 96% | 3% | 0.1 | 0% | 0% | 46% | 99% | 0.01 | 0 |
| paper_collection (1, extract) | 160 | 388 | **3%** | 0% | 97% | 97% | 2% | 0.1 | 0% | 0% | 33% | 98% | 0.00 | 0 |
| ledger (1, extract) | 160 | 391 | **3%** | 0% | 97% | 97% | 2% | 0.1 | 0% | 0% | 36% | 99% | 0.00 | 0 |
| cold_chain (1, extract) | 160 | 403 | **2%** | 0% | 98% | 97% | 1% | 0.1 | 0% | 0% | 31% | 98% | 0.00 | 0 |
| clean_sheets (1, extract) | 160 | 390 | **2%** | 0% | 98% | 97% | 2% | 0.1 | 0% | 0% | 37% | 99% | 0.00 | 0 |
| shutter_watch (1, yard) | 160 | 267 | **2%** | 0% | 98% | 96% | 2% | 0.0 | 0% | 0% | 34% | 100% | 0.00 | 0 |
| delivery (1, extract) | 160 | 377 | **2%** | 0% | 98% | 97% | 1% | 0.0 | 0% | 0% | 41% | 99% | 0.01 | 0 |
| landing_hands (1, extract) | 160 | 398 | **1%** | 0% | 99% | 97% | 1% | 0.0 | 0% | 0% | 33% | 100% | 0.00 | 0 |
