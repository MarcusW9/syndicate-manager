// Batch 1 for PLAN-PERSONALITY step 2 (replaces the untagged list and the current 18 ORIGINS).
// Edits on intake: two lines tagged hot+calm (a clash pair) cut to 'hot' only;
// "Harbor"/"harbor" -> "Harbour"/"harbour"; "armor" -> "armour".

export const ORIGINS = {
  medic: [
    // COMMON (6)
    { text: 'Ex-ambulance crew who quit after one night shift too many in {district}.', tags: ['haunted', 'cold'], tier: 'common' },
    { text: 'Unlicensed street doc who learned triage stitching up illegal brawlers.', tags: ['warm', 'wary'], tier: 'common' },
    { text: 'Former pharmaceutical lab tech who stole enough inventory to set up shop.', tags: ['money', 'curious'], tier: 'common' },
    { text: 'Fired from an upscale clinic in {district} for giving discount antibiotics.', tags: ['warm'], tier: 'common' },
    { text: 'Maintains cheap neural implants at a shadowy back-alley booth.', tags: ['chrome', 'calm'], tier: 'common' },
    { text: 'Vet student who switched to human crew after rent tripled in {district}.', tags: ['money', 'warm'], tier: 'common' },
    // UNCOMMON (2)
    { text: 'Corp trauma responder whose contract was abruptly voided mid-firefight.', tags: ['cold', 'chrome'], tier: 'uncommon' },
    { text: 'Moonlights as an organ courier to pay off their own bio-synthetic lungs.', tags: ['money', 'chrome'], tier: 'uncommon' },
    // RARE (1)
    { text: 'Ran a grey-market blood bank until corporate enforcers burned the lease.', tags: ['haunted', 'wary'], tier: 'rare' },
    // EXOTIC (1)
    { text: 'Stole an experimental bio-reconstruction suite and never returned to Glass Heights.', tags: ['chrome', 'money'], tier: 'exotic' },
  ],

  muscle: [
    // COMMON (6)
    { text: 'Ex-bouncer from a karaoke bar in {district}.', tags: ['hot'], tier: 'common' },
    { text: 'Former warehouse docker who supplemented low wages with street fighting.', tags: ['money', 'hot'], tier: 'common' },
    { text: 'Laid-off private security guard keeping their corporate-issue stun baton.', tags: ['wary', 'chrome'], tier: 'common' },
    { text: 'Night market enforcer who decided freelancing paid better than fixed wages.', tags: ['money', 'charming'], tier: 'common' },
    { text: 'Ex-debt collector from {district} who got tired of breaking poor people’s fingers.', tags: ['warm', 'haunted'], tier: 'common' },
    { text: 'Former gym trainer who upgraded their arm hydraulics for heavy demolition work.', tags: ['chrome', 'hot'], tier: 'common' },
    // UNCOMMON (2)
    { text: 'Discharged riot officer who kept their heavy ballistic armour and grudges.', tags: ['cold', 'wary'], tier: 'uncommon' },
    { text: 'Underground pit fighter owing half their purse to local syndicate bosses.', tags: ['money', 'hot'], tier: 'uncommon' },
    // RARE (2)
    { text: 'Ex-bodyguard whose corporate handler took a bullet they were hired to block.', tags: ['haunted', 'cold'], tier: 'rare' },
    { text: 'Cyberware test dummy who kept the military-grade arms when the lab went bankrupt.', tags: ['chrome', 'curious'], tier: 'rare' },
  ],

  tech: [
    // COMMON (6)
    { text: 'Repairs phones at a stall in {district} and cracks them after hours.', tags: ['curious', 'chrome'], tier: 'common' },
    { text: 'Former factory technician who automated their own shift before getting fired.', tags: ['curious', 'calm'], tier: 'common' },
    { text: 'Arcade mechanic who wiretapped the high-score machines to print digital cash.', tags: ['money', 'chrome'], tier: 'common' },
    { text: 'Assembles black-market neural rigs out of scrap metal in {district}.', tags: ['chrome', 'wary'], tier: 'common' },
    { text: 'Former server farm maintainer who got hooked on deep-net data salvage.', tags: ['curious'], tier: 'common' },
    { text: 'Fixed corporate vending machines until they learned how to drain their bank accounts.', tags: ['money'], tier: 'common' },
    // UNCOMMON (2)
    { text: 'Disgraced corp IT specialist who accidentally downloaded executive payroll files.', tags: ['wary', 'money'], tier: 'uncommon' },
    { text: 'Drone repair shop worker who routinely reprograms cargo units for light smuggling.', tags: ['chrome', 'curious'], tier: 'uncommon' },
    // RARE (1)
    { text: 'Bricked a corporate mainframe on a dare and lived to brag about it.', tags: ['hot', 'chrome'], tier: 'rare' },
    // EXOTIC (1)
    { text: 'Built an illegal AI core in an abandoned basement under {district}.', tags: ['haunted', 'chrome'], tier: 'exotic' },
  ],

  driver: [
    // COMMON (6)
    { text: 'Red minibus driver who knows every shortcut in {district}.', tags: ['calm', 'charming'], tier: 'common' },
    { text: 'Former noodle delivery runner who never dropped a single steaming bowl.', tags: ['warm', 'calm'], tier: 'common' },
    { text: 'Harbour tugboat pilot who smuggled grey-market crates past maritime drones.', tags: ['wary', 'money'], tier: 'common' },
    { text: 'Ex-cab driver whose vehicle was repossessed after taking one too many dodgy fares.', tags: ['money', 'haunted'], tier: 'common' },
    { text: 'Courier who modified their hover-bike engine to outrun automated traffic cops.', tags: ['hot', 'chrome'], tier: 'common' },
    { text: 'Night-shift valet in {district} who regularly borrowed supercar keys for joyrides.', tags: ['charming', 'hot'], tier: 'common' },
    // UNCOMMON (2)
    { text: 'Former corporate getaway driver who survived a botched convoy ambush.', tags: ['cold', 'wary'], tier: 'uncommon' },
    { text: 'Drone swarm dispatcher who hijacked corporate freight lanes for local runs.', tags: ['chrome', 'curious'], tier: 'uncommon' },
    // RARE (2)
    { text: 'Underground street racer running on high-strain neural reflex mods.', tags: ['chrome', 'hot'], tier: 'rare' },
    { text: 'Ex-smuggler who navigated the harbour fog without radar during the blackouts.', tags: ['superstitious', 'calm'], tier: 'rare' },
  ],

  face: [
    // COMMON (6)
    { text: 'Pawn shop clerk in {district} who could talk the shirt off any customer.', tags: ['charming', 'money'], tier: 'common' },
    { text: 'Former VIP host from a Glass Heights club who knows everyone’s dirty secrets.', tags: ['charming', 'cold'], tier: 'common' },
    { text: 'Street preacher selling fake cybernetic blessings outside the night market.', tags: ['superstitious', 'charming'], tier: 'common' },
    { text: 'Failed talent agent who started brokering meetings for low-level fixers instead.', tags: ['warm', 'money'], tier: 'common' },
    { text: 'Former insurance claims adjuster who found lying to clients remarkably lucrative.', tags: ['cold', 'money'], tier: 'common' },
    { text: 'Bargain hunter from {district} who turned haggling into a full-time grift.', tags: ['curious', 'charming'], tier: 'common' },
    // UNCOMMON (2)
    { text: 'Ex-corporate PR specialist who spun industrial disasters until their conscience snapped.', tags: ['haunted', 'warm'], tier: 'uncommon' },
    { text: 'Forged access passes using fake biometric implants to party in high-rise suites.', tags: ['chrome', 'charming'], tier: 'uncommon' },
    // RARE (1)
    { text: 'Conned three corporate executives into buying the same non-existent harbour barge.', tags: ['charming', 'hot'], tier: 'rare' },
    // EXOTIC (1)
    { text: 'Posed as a deceased corp vice-president for a month to drain their offshore account.', tags: ['cold', 'haunted'], tier: 'exotic' },
  ],

  infiltrator: [
    // COMMON (6)
    { text: 'High-rise window washer in {district} who mapped corporate security blind spots.', tags: ['calm', 'wary'], tier: 'common' },
    { text: 'Former rooftop courier accustomed to sprinting across narrow catwalks in the rain.', tags: ['hot'], tier: 'common' },
    { text: 'Locksmith who made more money selling duplicate keys than cutting originals.', tags: ['money', 'wary'], tier: 'common' },
    { text: 'Ventilation maintenance worker who knows every duct in {district}.', tags: ['curious', 'calm'], tier: 'common' },
    { text: 'Ex-pest control contractor accustomed to sneaking past thermal sensors.', tags: ['wary'], tier: 'common' },
    { text: 'Cat burglar who got their start stealing grey-market implants off display shelves.', tags: ['chrome', 'curious'], tier: 'common' },
    // UNCOMMON (2)
    { text: 'Laid-off corporate auditor who used security bypasses to pay off medical debts.', tags: ['money', 'cold'], tier: 'uncommon' },
    { text: 'Urban explorer who mapped forgotten subway tunnels beneath Glass Heights.', tags: ['curious', 'haunted'], tier: 'uncommon' },
    // RARE (1)
    { text: 'Ex-corporate extraction agent left behind after a black-ops raid went sideways.', tags: ['haunted', 'cold'], tier: 'rare' },
    // EXOTIC (1)
    { text: 'Bypassed executive suite biometrics using a stolen synthetic skin cloak.', tags: ['chrome', 'cold'], tier: 'exotic' },
  ],
};
