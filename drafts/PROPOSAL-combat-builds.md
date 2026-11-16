# Lantern Bay: Combat Builds and Effects Proposal

> Status: ideation complete, ready for an Opus design session.
> Purpose: define the archetypes, axes, effects and interactions that make runner builds combinatorial. The session turns this into the smallest working vocabulary (effect words, triggers, numbers) for §2.6.2 and checks every fantasy against the bars.
>
> Owner's ideation (2026-11-16), feeding `drafts/PROPOSAL-swarm-and-special-moves.md` §2.6. Nothing here is built or canon yet; names in §4.12 go through the `add-lore` skill before they ship.

---

## 1. Core principle

Builds come from **combining independent axes**. No ability is a fixed package. A runner's weapon, special move, trait and gear each contribute one piece (a delivery, a payload, a trigger and so on), and the pieces multiply.

- One sniper becomes five different builds by changing only the payload it carries.
- Different runners can combine their effects on the same target, so **the squad you send matters as much as any one build**.
- Counters come from **the enemy mix and the terrain**, not from nerfing builds. Every build has fights where it shines and fights where it struggles.

---

## 2. Axes

### 2.1 Build axes (filled by slots: weapon, special move, trait, gear)

| Axis | Question it answers | Examples |
|---|---|---|
| **Delivery** | How does it get there? | Single shot, pierce, ricochet, beam, cleave, area burst, mark, aura, reflect, mines, drone, decoy, tether |
| **Payload** | What does it do? | Bio, flame, shock, hack, control, cryo, acid, plasma, plain damage |
| **Trigger** | When does it fire? | On hit, on kill, on crit, on dodge, on counter, when an ally is hit, last pip |
| **Modifier** | How is it bent? | +1 bounce, longer duration, bigger radius, chain on kill |
| **Positioning** | Where does it move enemies? | Magnetic pull, knockback, knockdown, float |
| **Scaling** | What makes it grow? | Enemies nearby, statuses on target, kills this fight, damage taken, chrome on target, adjacent allies |
| **Fuel/cost** *(optional)* | What does it cost? | Heat, battery, ammo, condition pips, chrome strain |

A build line reads like: *"On kill → ricochet → shock, +1 bounce, scales with enemies nearby."*

**Positioning is its own axis.** It does little damage by itself but sets up area payloads, and it gives tanks and martial artists a role beyond damage.

### 2.2 World axes (properties of the fight, never equipped)

| Axis | Role |
|---|---|
| **Enemy tags** | Organic, synthetic, chromed, armoured, shielded, swarm, elite/boss. Payloads care about tags, and this is where counters come from. |
| **Terrain** | Oil/chemical spills, water, power lines, vents, glass, ledges, turrets, doors, neon, explosive canisters. Gives each district a combat personality: wet Docks, flammable Night Market, the drops and windows of Glass Heights. |
| **Reactions** | Two statuses on one target combine into something new (§5). |
| **Link** | Connections between bodies: enemy to enemy, runner to runner, runner to machine. |

Keeping world axes out of slots keeps building readable while the fights stay rich.

---

## 3. Archetypes

An archetype is a **starting lean, not a lock**. It's the axis where a runner naturally lives, and gear and traits can still pull them anywhere.

| Archetype | Fantasy | Home axis | Natural piece |
|---|---|---|---|
| **Sniper** | One perfect shot at the right moment | Delivery | Single shot, pierce, interrupt |
| **Samurai** | Blade duels and cutting through a line | Delivery | Slash or cleave (melee arc) |
| **Martial artist** | Fast multi-hits, counters, throws | Trigger | On dodge, on counter, combo strings |
| **Bio** | Infection spreading through a pack | Payload | Spreading bio damage over time |
| **Pyro** | Ignition and panic | Payload | Flame |
| **Tech jammer** | Shutting down machines | Payload | Shock/EMP, stun on synthetics |
| **Psion** | Enemies switching sides | Payload | Control (organics) |
| **Techromancer** | Turning the map's turrets, drones and doors against enemies | Payload | Control (machines and environment) |
| **Laser** | Beams through lines of enemies | Delivery | Beam, pierce, sustained burn |
| **Ricochet** | Bouncing missiles | Delivery | Ricochet |
| **Power enforcer** | Run and gun, a close-up powerhouse | Scaling/Trigger | Momentum: stronger while moving and killing |
| **Tank / reflector** | Draws enemy fire, then sends effects back | Delivery | Taunt, then reflect what hits them |

**Delivery archetypes plus payload archetypes make combos.** Ricochet, laser and sniper are deliveries. Bio, pyro and psion are payloads.

**Control is split.** The psion turns people and the techromancer turns machines. A psion is weak against drone swarms, and a techromancer is weak against a gang with no tech.

**The tank's build changes with the enemy.** Reflect carries whatever payload hits it, so tanking a pyro gang turns the tank into a flamethrower.

---

## 4. Effect library

Grouped by theme. The session decides which behave differently (and get their own effect word) and which are flavour on a shared effect. For example, fear, concussion and hypnotic neon may all be one "disrupt" effect.

### 4.1 Core payloads
- **Bio:** damage over time that spreads from enemy to enemy. Strong against swarms, weak against a lone boss.
- **Flame:** fast, hot damage over time. Causes panic and can ignite terrain.
- **Shock/EMP:** arcs between targets and stuns machines.
- **Hack:** marks one target, then after a build-up deals a big hit. Strong against bosses and chromed enemies.
- **Control:** an enemy fights for you for a short time. Not on bosses (see Zero-day).
- **Firmware virus:** the machine version of bio. Spreads drone to drone.
- **Nanite swarm:** strips armour fast. A setup payload.
- **Cryo/coolant:** slows and freezes.
- **Glitch:** scrambles enemy targeting so they shoot the wrong thing.
- **Overload:** makes an enemy's implants explode. Bigger with more chrome.
- **Data leech:** steals an enemy's buff or ability for a while.
- **Sonic/psy scream:** breaks morale, so enemies flee or freeze.

### 4.2 Deliveries
- **Seeker rounds:** homing shots that pick the best target.
- **Drone carrier:** a deployed drone applies the runner's payload by itself.
- **Mines/traps:** payload placed ahead of time. Strong in defence fights.
- **Razor line:** a cutting line across the battlefield that hurts anything crossing it.
- **Tether:** links two enemies so whatever hits one hits both.
- **Hologram decoy:** a fake target that draws fire, then detonates its payload when destroyed.
- **Lantern drones:** paper-lantern drones that drift to a target and pop. Slow and pretty.

### 4.3 Positioning
- **Magnetic pull / gravity well:** drags enemies together. Gives the tank a pull-in as well as a taunt.
- **Knockback:** pushes enemies apart or into hazards.
- **Shockwave stomp:** an area knockdown around the enforcer or tank.
- **Gravity inversion** *(jackpot)*: a small zone where enemies float helplessly.

### 4.4 Triggers
- **Echo:** repeats the last effect at reduced strength.
- **Bounty mark:** the marked enemy's death fires the killer's on-kill effects twice.
- **Last stand:** fires on a runner's final condition pip.

### 4.5 Damage over time and spreading
- **Acid / corrosive gel:** eats armour slowly but lingers. Distinct from nanites.
- **Radiation zone:** hurts anyone standing in it, including your own runners.
- **Spore bloom:** a bio kill bursts into a cloud that infects anyone passing through. The cloud can ignite.
- **Plasma:** sticks to the target, then detonates. Suits ricochet.
- **Monoblade bleed:** samurai cuts bleed, and it gets worse while the target moves.
- **Shrapnel:** anything that explodes throws fragments, so explosions become spread effects.

### 4.6 Control and confusion
- **Neural override:** one forced action, like shooting a neighbour or dropping a weapon. A cheap, frequent cousin of control.
- **Fear implant:** enemies flee, then return.
- **Memory wipe:** the target forgets its current order. A boss loses its charge-up.
- **ID spoof:** enemies see a runner as one of their own and ignore them for a while.
- **Hypnotic neon:** a light pulse that freezes nearby enemies for a beat. Strong in neon-heavy districts.
- **Concussion:** dazed enemies miss more and act slower.
- **Deepfake order:** a fake command to an enemy squad, like "fall back" or "focus the turret".
- **Latency spike:** the target's actions land one beat late.
- **Sensor smear:** the target can't tell friend from foe. Friendly fire is possible both ways.
- **AR overwrite:** enemies see cover that isn't there and miss cover that is.

### 4.7 Tech and machine
- **Backdoor:** a hacked machine stays compromised, so it can be retaken later at no cost.
- **Self-destruct command:** an enemy drone or turret blows itself up. The techromancer's finisher.
- **Firewall:** blocks the next hack or control effect on an ally. Counters enemy hackers.
- **Signal ghost:** a false drone signal that pulls enemy fire.
- **Power siphon:** drains enemy shields or batteries to refuel the runner.
- **Honeypot:** a bait node that lures enemy hackers, then traps or reverse-hacks them. The tank's taunt for hackers.
- **Signal jump:** when a hacked enemy dies, the hack jumps to the nearest machine.

### 4.8 Network and data (setup effects)
- **Rootkit:** a dormant primer that doubles the next effect to land on the target.
- **Botnet:** each hacked enemy adds a node. At a threshold, the botnet fires one huge strike.
- **Zero-day:** once per fight, ignores one immunity. The only way to turn a boss, and only briefly.
- **Doxx:** reveals a weakness and adds a tag, like *exposed: flame*.
- **Adware flood:** fills enemy displays with ads so they misfire. Spreads through networked enemies.

### 4.9 Corporate dystopia
- **Licence revoked:** the target's cyberware licence lapses mid-fight, switching off their chrome until rebooted.
- **Repo drone:** takes an enemy's gear or implant. It may drop as loot after the fight.
- **Ransomware:** locks an enemy's weapon. Enemies spend turns unlocking it.
- **Contract kill:** whoever kills the marked target earns bonus pay or reputation.

### 4.10 Body and chrome (runner self-effects)
- **Adrenal surge:** a burst of speed and extra actions, then a crash. The enforcer's core.
- **Pain suppressor:** the runner ignores condition pips for a few beats, then takes the damage all at once.
- **Armour flare:** a short damage-reduction spike when hit, scaling with chrome.
- **Reflex booster:** dodges open a counter window. The martial artist's engine.
- **Kinetic capacitor:** stores damage taken and releases it as a blast. The tank's reflect fantasy.
- **Action banking:** the runner holds two or three actions, then fires them all at once.
- **Borrowed reflexes:** copies the fighting style of the last enemy killed for a while.

### 4.11 Enemy body horror
- **Rejection syndrome:** the target's implants attack their body. A slow burn that scales with chrome.
- **Phantom limb:** an enemy's cyberarm turns its weapon on its owner for a beat.
- **Optic burn:** blinds anyone with chrome eyes and does nothing to unaugmented eyes.

### 4.12 Lantern Bay flavour
- **Hungry ghost protocol:** dead enemies' implants twitch and fight for one more beat. Under the techromancer, they fight for you.
- **Joss burn:** a hologram decoy that burns as it's hit and damages whatever burned it.
- **Feng shui grid:** runners in the right spot (a corner, a doorway) get a stance bonus.
- **Livestream:** showcase moments and kills build hype that converts into reputation after the job.

### 4.13 High-concept jackpots
- **Chrono-stutter:** the target loses a turn, or a runner gets an extra one.
- **Clone echo:** a holographic copy replays a runner's last move.
- **Nano-reconstruct:** a runner at zero pips gets back up once. Use sparingly.

---

## 5. Reactions (statuses meeting on one target)

Reactions work **across the crew**: one runner sets up and another sets it off.

| Status A | + Status B | Reaction |
|---|---|---|
| Flame | Cryo | **Thermal shatter:** burst damage, removes both |
| Bio | Flame | **Plague fire:** the burn spreads like infection |
| Shock | Wet | **Conduct:** shock arcs to everyone wet |
| Nanite / acid | Anything | **Exposed:** the next payload hits harder |
| Hack | Overload | **Meltdown:** the delayed hit detonates and splashes |
| Control | Flame | **Walking bomb:** the turned enemy runs into its own lines |
| Glitch | Magnetised | **Friendly fire:** the pulled clump shoots each other |
| Rootkit | Anything | **Primed:** the effect lands doubled |
| Spore cloud | Flame | **Flash fire:** the cloud ignites |

---

## 6. Combo fantasies (to test against the vocabulary)

| Combo | The moment | Rarity | Counter |
|---|---|---|---|
| Magnetic pull + bio + flame | The tank pulls the swarm together, bio spreads through the clump, the pyro lights it | Jackpot | One armoured boss |
| Ricochet + firmware virus | Each bounce infects a drone, and the drones infect each other | Lucky | Organic gang |
| Ricochet + plasma | Sticky charges down the line, then a chain of pops | Lucky | Spread-out enemies |
| Techromancer + overload | Take over the enemy turret, then blow it up when done | Lucky | No machines on the map |
| Tank + reflect vs hack-heavy enemy | The boss's hack bounces back and hits the boss | Lucky | Plain-damage enemies |
| Cryo then pyro | Freeze the line, then thermal shatter breaks it | Common | Fireproof or cold-resistant enemies |
| Sniper + memory wipe | The boss charges its big attack, and one shot wipes it | Lucky | Swarm with no key target |
| Rootkit + hack | One runner primes, another's hack lands doubled | Lucky | Enemies with firewalls |
| Enforcer + adrenal surge + shrapnel | Run and gun through a pack, every kill exploding into the next | Jackpot | Long-range snipers |
| Samurai + bleed + fear | Enemies flee and bleed out while running | Common | Enemies that hold position |
| Tank + kinetic capacitor | Absorb a whole volley, then return it in one blast | Lucky | Damage-over-time enemies |

---

## 7. Priority effects (most new combinations, least overlap)

1. **Acid:** a slow armour stripper, distinct from nanites
2. **Plasma:** sticky charges for ricochet
3. **Memory wipe:** boss interactions for sniper and psion
4. **Backdoor / self-destruct:** the techromancer's toolkit
5. **Kinetic capacitor:** the tank's reflect fantasy
6. **Shrapnel:** turns every explosion into a spread effect
7. **Adrenal surge:** the enforcer's core
8. **Rootkit and doxx:** pure setup that creates crew combos

Effects that add **new rules**, not just flavour:

| Effect | New rule |
|---|---|
| Rootkit | A hidden setup another runner sets off |
| Botnet | A threshold built up over the whole fight |
| Zero-day | A one-time exception to a hard limit |
| Doxx | Effects that add tags |
| Licence revoked / optic burn | Turning a strength into a weakness |
| Sensor smear | Chaos that can hurt both sides |
| Livestream / contract kill / repo drone | Combat paying off outside the fight |

---

## 8. Guardrails (proposed, for the session to confirm)

- **No infinite loops:** spread effects lose strength per hop, and spreads can't re-trigger deliveries.
- **No controlling bosses** except through Zero-day, briefly.
- **No permanent stacking within a fight:** statuses have durations or caps.
- **Healing is rare:** nano-reconstruct-style effects are jackpot-only.
- **No single correct build:** every combo has a named counter in enemy tags or terrain.
- **Readable log:** every reaction and showcase gets one short, distinct log line. If the log can't name it, the player won't notice it.

---

## 9. Open questions for the session

1. Should cross-runner reactions be **stronger** than single-runner ones, to keep squad composition the headline?
2. Where do pieces come from: rolled traits at recruitment, gear drops, training, reputation unlocks?
3. Can a runner's archetype drift over a career (medic → bio)?
4. How many payloads per runner before builds become noise?
5. Is fuel/cost (heat, strain) a real axis, or flavour on cooldowns?
6. Which effects pay off outside the fight (livestream, contract kill, repo loot), and how much?
7. Which effects in §4 behave differently enough to get their own effect word, and which merge into shared ones?
8. Which combos must appear as **showcase moments** in the watchable log?
