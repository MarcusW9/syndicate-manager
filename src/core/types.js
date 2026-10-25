// Data shapes for the whole game, as JSDoc so editors give autocomplete
// without needing TypeScript. See DATA.md for the plain-English version.

/**
 * Stats run 1-20 (Football Manager style). 10 = competent professional.
 * @typedef {Object} Stats
 * @property {number} combat
 * @property {number} stealth
 * @property {number} tech
 * @property {number} social
 * @property {number} driving
 * @property {number} medical
 * @property {number} cool      Composure under pressure
 */

/**
 * @typedef {'healthy'|'light'|'serious'|'critical'|'dead'} InjuryState
 */

/**
 * @typedef {Object} Condition
 * @property {number} fatigue     0-100. Over 60 = penalties, over 85 = refuses jobs
 * @property {number} morale      0-100
 * @property {number} neuralLoad  0-100. Over 70 = warning stages begin
 * @property {number} burnout     0-100. Builds slowly over seasons
 * @property {InjuryState} injury
 * @property {number} injuryDays  Days until recovered (0 when healthy)
 */

/**
 * @typedef {Object} Operative
 * @property {string} id
 * @property {string} name
 * @property {string} handle      Street name shown in reports
 * @property {string} [color]     Badge colour (placeholder until portraits)
 * @property {number} age         Always 18+
 * @property {string} origin      Short background line
 * @property {'medic'|'muscle'|'tech'|'driver'|'face'|'infiltrator'} role
 * @property {Stats} stats
 * @property {string[]} traits    Trait ids from data/traits.js
 * @property {number} wage        Weekly
 * @property {Condition} condition
 * @property {Object<string, number>} trust  Operative id -> -100..100
 * @property {string} bio         1-2 sentences of personality
 * @property {string[]} history   Log of notable events (story memory)
 * @property {'rookie'|'pro'|'veteran'} tier  Rookies graduate to pro at 15 in their main stat
 * @property {Stats} potential     Hidden ceiling per stat (never shown as a number)
 * @property {Object<string, number>} progress  Growth points banked towards the next +1
 * @property {Stats} startStats    Stats on the day they joined
 * @property {number} scoutError   How far off the crew's read of their ceiling is (-2..2)
 * @property {{stat: string, from: number, to: number, day: number}[]} growthLog  This season's rises and declines
 */

/**
 * A requirement a crisis choice can check.
 * @typedef {Object} Requirement
 * @property {'role'|'stat'|'trait'} kind
 * @property {string} value       Role name, stat name, or trait id
 * @property {number} [min]       For stat checks
 */

/**
 * @typedef {Object} ChoiceCost
 * @property {number} [cash]
 * @property {number} [heat]
 * @property {number} [clientTrust]
 * @property {number} [payCut]    0-1, share of pay lost
 */

/**
 * @typedef {Object} CrisisChoice
 * @property {string} id
 * @property {string} label            Button text
 * @property {'push'|'adapt'|'abort'|'stabilise'|'extract'} kind
 * @property {Requirement} [requires]  Hidden/disabled if crew can't meet it
 * @property {string} stat             Stat tested for success
 * @property {number} difficulty       Target number, 1-20
 * @property {ChoiceCost} [cost]       Paid whether it succeeds or not (negative payCut = bonus pay)
 * @property {ChoiceCost} [failureCost] Extra cost only if the roll fails
 * @property {boolean} [sure]          No roll: always succeeds (paying a toll, leaving loot)
 * @property {number} [neural]         Neural load added to whoever rolls
 * @property {string} success          Narration on success
 * @property {string} failure          Narration on failure
 * @property {'none'|'light'|'serious'|'critical'} failureInjury
 */

/**
 * @typedef {Object} Crisis
 * @property {string} id
 * @property {string} text             Situation, may use {op} for the operative involved
 * @property {string} [focusRole]      Who the crisis centres on, if anyone
 * @property {CrisisChoice[]} choices  Always includes at least one abort
 */

/**
 * @typedef {Object} MissionTemplate
 * @property {string} id
 * @property {string} name
 * @property {string} district         Key from config/names.js
 * @property {1|2|3|4|5} threat
 * @property {number} pay
 * @property {number} days             Days the crew is away
 * @property {number} crewSize
 * @property {string[]} keyStats       Stats that matter most (for the risk read)
 * @property {string} brief            Client's pitch
 * @property {string[]} beats          Narrated beats, in order
 * @property {Crisis[]} crises         Pool; 2-3 drawn per run
 * @property {number} heat             Heat gained on completion (0 on every job: heat comes from Loud and crisis costs)
 */

/**
 * @typedef {'job'|'crew'|'warning'|'rival'|'report'|'scout'|'finance'|'rumour'} MessageType
 */

/**
 * @typedef {Object} InboxMessage
 * @property {string} id
 * @property {MessageType} type
 * @property {number} day              Game day it arrived
 * @property {string} subject
 * @property {string} body
 * @property {boolean} blocking        Stops Continue until resolved
 * @property {number} [expiresDay]
 * @property {boolean} read
 * @property {Object} [payload]        Type-specific data (e.g. missionId)
 */

/**
 * @typedef {Object} GameState
 * @property {number} version          Save format version
 * @property {number} seed             RNG seed (deterministic replays)
 * @property {number} day              Day 1 = Monday, week 1, season 1
 * @property {number} cash
 * @property {number} dayStartCash   Cash when the day began (the top bar shows the change)
 * @property {number} heat             0-10. Cools 2 every Sunday (core/heat.js)
 * @property {?number} heatNoticeDay   Day the last fixer notice fired (14-day cooldown)
 * @property {boolean} heatWatched     Let the heat ride: the next job's first crisis roll is -1
 * @property {?{id: string, until: number}} rumour  This week's street talk (core/rumours.js)
 * @property {number} [lastJobDay]     Day the last job started
 * @property {number} reputation       0-100 within tier
 * @property {'street'|'district'|'city'|'regional'} tier
 * @property {number} rent             Weekly safehouse rent
 * @property {Operative[]} crew
 * @property {InboxMessage[]} inbox
 * @property {Object[]} memorial       Fallen operatives
 * @property {string} difficulty       'story'|'standard'|'ironman'
 */

export {};
