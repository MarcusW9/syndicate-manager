# Review: fight types for the 51 jobs moved to Engine 2 on 2026-11-19

Owner, 2026-11-20: review these first guesses in one pass. Each job's fight is one of three types (`FIGHT_JOBS` in `src/data/fights.js`):

- **Hack:** a technician works; the crew holds them while the hack runs, then fights the way out.
- **Extract:** reach the goal and get out to the van.
- **Yard:** hold a place against waves.

The guess was made from what the job asks: technical work → Hack, carrying or collecting → Extract, guarding or watching → Yard. Mark each row ✓, or write the type it should be. The "What it asks" column is the start of the job's brief.

## Guessed Hack (15)

| ✓ / fix to | Job | District | What it asks |
| --- | --- | --- | --- |
| | **Submerged Cable** (`cable`) | docks | The Ferryman holds his boat off the pylons under Pier 12, chewing betel nut. "A barge snagged an old cable down there. The Wet Sleeve think it's rubbish. It carries my calls to the Silt. Cut it free and splice it before the… |
| | **Eviction Notice** (`eviction`) | oldTown | {szeto} adjusts a silk cuff, looking down at the roofs of Old Town. "A tenant on top of Block 9 runs a radio relay and won't move out. I don't want him harmed. That creates paperwork. Take down his antenna, bring me his codes,… |
| | **Signal Walk** (`signal_walk`) | oldTown | An independent repair contractor needs a pair of walkers to photograph external indicator panels on Old Town cable cabinets. Follow the route, match the cabinet numbers and report faults; the booking does not cover opening… |
| | **House Advantage** (`house_advantage`) | nightMarket | {rao} places three losing accounts beside a mahjong tile. "Bad luck is common. The same bad luck, sold by the hour, deserves a look." She wants the concealed reader from a private parlour table, with its settings intact. "Do… |
| | **The Flat Doesn't Exist** (`the_flat_doesnt_exist`) | basin | {okonkwo} wipes her tablet. "A flat above a tack workshop, facing the Old Stand. Clear the listening gear from it and the Stand's camera mast before the last race. The Association mustn't notice. Then the trust's contracts man… |
| | **The Guest Copy** (`the_guest_copy`) | nightMarket | {rao} unfolds a message from a dismissed event host. "She planned the casino night, then they stopped paying her. Her annotated folder is locked in a shared office with her belongings. Bring both, beta. She says the little… |
| | **Service Included** (`service_included`) | nightMarket | {rao} sets down a technician's collection slip. "The casino has a maintenance slot on our night. Our technician can take it, but her diagnostic kit is being held over her former employer's debt. Recover the kit and its service… |
| | **Someone at the Controls** (`someone_at_the_controls`) | heights | {szeto} keeps his eyes on the street. "A supply change must not close the route. Find someone who can keep it open. {poon} has the keys. The plant room is the contractors’ business, not ours." |
| | **Cover the Late Shift** (`cover_the_late_shift`) | docks | {szeto} turns the diary a quarter turn. "The controls still need attending. The person who can do it is across the water. Bring them, their kit and their paperwork before the roster closes." |
| | **What Was Installed** (`what_was_installed`) | heights | {szeto} puts a drawing face up and then turns it over. "If the drawings are wrong, find out what was actually fitted. {kwok} knows. Do not ask her to say what she should not." |
| | **Expected Upstairs** (`expected_upstairs`) | heights | {szeto} lays a service diary on the desk. "The lift expects a service visit. Arrange for it to expect us. {poon} can find you a loading slot. Do not ask him for the building." |
| | **The Replacement Visit** (`the_replacement_visit`) | heights | {szeto} taps the service diary. "The first arrangement is no longer useful. Find another way onto the list. A contractor’s worker walked off an installation and left a booking behind. Finish that booking, and nothing else." |
| | **After the Applause** (`after_the_applause`) | nightMarket | {rao} introduces a banquet supervisor with a folded apron under one arm. "A smaller function uses the same casino rooms tonight. Help her recover a withheld catering deposit, and she will show you how the place actually runs.… |
| | **Relay Cover** (`relay_cover`) | heights | {szeto} needs a temporary backup unit watched during a Glass Heights maintenance window. Record the external readings, keep the service space clear and call the building electrician for faults. "You are watching the supply,… |
| | **A Steady Hand** (`a_steady_hand`) | oldTown | {siu} folds a clean cloth around a borrowed screwdriver. "Instrument maker. Upstairs workshop. Her hand implant keeps locking, and she will not leave until everything is put away properly. Help her close, then bring her here.… |

## Guessed Extract (20)

| ✓ / fix to | Job | District | What it asks |
| --- | --- | --- | --- |
| | **Data Courier Run** (`courier`) | oldTown | A shell drive needs to get across Old Town before midnight. No questions, no detours. |
| | **Penthouse Heist** (`penthouse`) | heights | A Glass Heights executive keeps a vault of crypto keys and jade in his penthouse, 71 floors up. He's in Singapore for three nights. |
| | **Herbal Run** (`herbal_run`) | oldTown | Auntie Fung wipes her counter, the tang of ginseng rising from the clay pots. "The damp is in Block 9's lungs again. Three crates of medicine are in the drain cellar by the lower stairs. Bring them up before the sun hits the… |
| | **Market Delivery** (`delivery`) | nightMarket | {ip} runs the fish-ball stall at the Neon Dragon and never stops talking. "One crate, across the market, before the night rush. {ip:greet}" |
| | **Paid in Full** (`paid_in_full`) | nightMarket | {rao} lays a pawn ticket beside the silk she is measuring. "My collector pawned his recorder to cover a family bill. It holds repayment receipts from before the flooding. Collect it before the shop wipes it, beta. People… |
| | **Second-Hand Heart** (`second_hand_heart`) | oldTown | {siu} taps a repair receipt against an empty battery cradle. "Backup power for the clinic. Paid for, repaired, then marked for recycling because someone typed an eight as a three. Bring it back before the afternoon collection." |
| | **Borrowed Glory** (`borrowed_glory`) | basin | {szeto} slides over a photograph of Harbour Dividend, Lantern Course's champion bay. "Her owner refuses to sell. I want her in my stable, winning under my colours." The collection address is attached; how he intends to… |
| | **Exit Interview** (`exit_interview`) | heights | {okonkwo} forwards a message from a shipping clerk lodged in a corporate residence: I WANT TO LEAVE. "A temporary posting, six weeks ago. His pass now opens his room and the dining floor, nothing outside." She wants him… |
| | **Cold Chain** (`cold_chain`) | nightMarket | {ip} points at the empty space beneath her counter. "I lent my spare chiller to a neighbour. Now mine has died, and his neighbour has borrowed the spare from him. Bring it back before the morning delivery. Nobody loses their… |
| | **Paper Collection** (`paper_collection`) | oldTown | Auntie Fung needs sealed sacks of used shop records collected from her Old Town tea counters and delivered to the pulping room. "Weigh them, watch them go in, bring the receipt; recycling does not require reading." |
| | **Clean Sheets** (`clean_sheets`) | oldTown | {siu} needs sealed linen bundles collected from an Old Town laundry and delivered beneath Tenement Block 9. "Keep them dry and off the floor; the patients already bring their own dirt." |
| | **Crate Return** (`crate_return`) | nightMarket | {ip} needs her reusable food crates collected from the Night Market wash depot and brought back to the Neon Dragon. "Count them, check the stamp, get a receipt; I pay for carrying plastic, not buying it twice." |
| | **Kit Return** (`kit_return`) | nightMarket | {rao} needs rented stall equipment collected from Night Market traders who have booked returns. Match serials, record condition and bring back only what is voluntarily handed over. "A deposit dispute is my conversation, beta;… |
| | **Landing Hands** (`landing_hands`) | docks | {ferryman} needs shore hands for a supply pickup: clear the landing, receive the empty containers and pass the sealed provisions aboard. "Count from the labels; nobody needs to open a sack of rice beside the harbour." |
| | **After Hours** (`after_hours`) | heights | A junior executive needs a sealed document case moved between two Glass Heights service receptions after office hours. The booking includes collection codes and a named recipient, but no permission to open it. "Please get a… |
| | **Rent Round** (`rent_round`) | oldTown | An Old Town landlord wants a rent round completed because the tenants will no longer open the door to him. Take voluntary payments, issue receipts and log disputes; no entry, threats or eviction work. The fee is for bringing… |
| | **Back Rent** (`back_rent`) | nightMarket | {ip} holds an arrears notice flat with a clean bowl. "We paid. The new agent says the old account is not his problem." She slides over the association's rent book. "Find the payment and get this withdrawn. Do it properly, and… |
| | **An Old Account** (`an_old_account`) | oldTown | {rao} taps an address above a closed shop. "The pit boss lost a deposit in a business partnership. The settlement money is ready, but the original agreement is still in their old office. Bring it to the mediator. If he can… |
| | **The Current Copy** (`the_current_copy`) | heights | {szeto} slides a sealed envelope across the desk without opening it. "The copy I have is old. Bring me the one people are working from. {edith} will read the envelope. She will not read it the way I would." |
| | **Last Sitting** (`last_sitting`) | oldTown | Auntie Fung sets two room keys beside your tea. "The parlour has somewhere to go. Four tables, the kettle, the cupboard and anyone pretending they are not upset. Move them before the locks change. Nobody rides in the back with… |

## Guessed Yard (16)

| ✓ / fix to | Job | District | What it asks |
| --- | --- | --- | --- |
| | **Queue Duty** (`queue_duty`) | oldTown | {siu} needs someone on the waiting-room desk: check appointment slips, keep the stairs clear and call patients when the clinic asks. "If someone looks unwell, fetch me; do not develop a medical opinion." |
| | **Shutter Watch** (`shutter_watch`) | oldTown | Auntie Fung needs a tea shop watched while its staff deposit the takings. Keep the front closed, accept only listed deliveries and hand the keys back to the named worker. "A familiar face is not a receipt." |
| | **Fitting Room** (`fitting_room`) | nightMarket | {rao} needs the shop floor covered during fittings: manage the waiting list, keep tagged garments together and refer alterations to the tailor. "A sleeve is not a loan, beta; do not negotiate its terms." |
| | **Quiet Table** (`quiet_table`) | nightMarket | {rao} needs a private room prepared and its door minded for a booked meeting. Check the guest list, follow the device rules and keep interruptions outside. "We are renting them quiet, beta; we are not buying their conversation." |
| | **Race-Night Door** (`race_night_door`) | basin | A Lantern Course hospitality operator needs a two-person door team for a race-night booking. Check passes, hold the room limit and call racecourse security for removals. "Owners, bookmakers, cousins; everybody still needs a pass." |
| | **Inspection Hours** (`inspection_hours`) | nightMarket | {ip} needs two people watching the Neon Dragon during the Silver Fan Circle's regular inspection round. Keep customers moving, guard the stock and record every demand; only the agreed stall payment is authorised. "They inspect… |
| | **Closing Stack** (`closing_stack`) | nightMarket | {ip} needs two pairs of hands after closing: fold the tables, stack the stools and lock everything in the stall cage. "Leave the stockpot alone; that has a longer working day than either of you." |
| | **Closing Sweep** (`closing_sweep`) | basin | A Lantern Course concession operator needs a closed seating section checked after service. Bag the rubbish, log lost property and report anyone still inside; the supervisor handles removal. Betting slips are not automatically… |
| | **Stable Turnover** (`stable_turnover`) | basin | A Lantern Course stable supervisor needs an empty stall turned over: remove used bedding, lay fresh straw, check the drinker and return the tools. Horses stay with the stable hands; the crew gets the shovel end of racing. |
| | **Clear the Ramp** (`clear_the_ramp`) | docks | {okonkwo} needs a booked loading bay ready before collection: clear empty equipment, check the markings and report damage. "You are preparing the space, not waving lorries into it; leave that to the marshal." |
| | **Eyes on the Seal** (`eyes_on_the_seal`) | docks | {okonkwo} needs independent eyes on a routine cargo handover: compare the seal, record the condition and collect both signatures. "You are witnessing what arrives, not promising what is inside." |
| | **Access Window** (`access_window`) | heights | {szeto} needs a maintenance contractor accompanied through a booked Glass Heights service visit. Check the authorised rooms, log entry and departure, and leave the repair to the contractor. "Access is permission, not a… |
| | **Tack Ledger** (`tack_ledger`) | basin | A Lantern Course equipment supervisor needs an independent tack-room inventory between shifts. Match tags, photograph visible damage and record loans; stable staff decide what is fit to use. "Count the saddles, not the stories… |
| | **Dry Shelf** (`dry_shelf`) | oldTown | Auntie Fung needs a tea-shop records room checked and its sealed boxes moved onto the assigned dry shelves. Match labels, log damage and keep the access list short. "You may learn that I keep too much paper; you may not learn… |
| | **Still on the Books** (`still_on_the_books`) | heights | Forewoman Tse puts an old maintenance key beside a notice marked VACANT. "Thirty years we have paid the charges. New contractor arrives, now apparently nobody lives here." She hands you an archive reference. "Find our… |
| | **Someone to Cover** (`someone_to_cover`) | nightMarket | {rao} shows you a relief supervisor's unanswered invoice. "The pit boss has an industry dinner on our night. He cannot go without cover. His replacement will not work until the casino pays what it already owes. Recover her… |
