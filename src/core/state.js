// Creating a new game. Pure logic: no DOM, no storage.

import { STARTING_CREW, STARTING_TRUST } from '../data/operatives.js';
import { NAMES } from '../config/names.js';
import { addOffer } from './jobs.js';
import { STARTING_ROSTER_CAP, generateStartingCrew, generateFounderCandidates, recruitToOperative, FOUNDERS_TO_PICK } from './recruits.js';
import { prepareOperative } from './development.js';
import { refreshFreelancers } from './freelance.js';
import { ECONOMY } from '../data/economy.js';
import { refreshSideBoard } from './sidetasks.js';

export const SAVE_VERSION = 26;

// A rookie crew's first board: small work only.
export const FRESH_OPENING_BOARD = ['clinic', 'ledger', 'container409'];

const freshCondition = () => ({
  fatigue: 10,
  morale: 65,
  neuralLoad: 0,
  burnout: 0,
  injury: 'healthy',
  injuryDays: 0,
});

/** @returns {import('./types.js').GameState} */
/**
 * startCrew: 'pick' (what every new game uses: six generated rookie candidates in a cheap
 * first safehouse, and the player picks three with chooseFounders before day 1 starts),
 * 'fresh' (five generated rookies, one per core role: the start before 2026-10-28, kept as
 * the fixed crew most rule tests use; see generateStartingCrew and PLAN-PROGRESSION.md)
 * or 'classic' (the authored Lantern Bay Five: no longer offered in the game, kept as
 * the fixed crew the rule tests are written against).
 */
export function createNewGame({ seed = Date.now() % 2147483647, difficulty = 'standard', startCrew = 'classic' } = {}) {
  const crew = startCrew === 'fresh' || startCrew === 'pick' ? [] : STARTING_CREW.map((op) => prepareOperative({
    ...structuredClone(op),
    condition: freshCondition(),
    trust: { ...(STARTING_TRUST[op.id] ?? {}) },
    history: [],
  }));

  const state = {
    version: SAVE_VERSION,
    seed,
    day: 1,
    cash: 8000,
    heat: 0,
    heatNoticeDay: null,
    heatWatched: false,
    rumour: null,
    reputation: 0,
    jobGates: false,
    tier: 'street',
    rent: 4000,
    difficulty,
    crew,
    stash: [], // gear bought and not on anyone (core/gear.js); a new crew starts with none
    inbox: [
      {
        id: 'welcome',
        type: 'crew',
        day: 1,
        subject: `Welcome to ${NAMES.city}`,
        body: '', // written below, once the crew exists
        blocking: false,
        read: false,
      },
    ],
    memorial: [],
    jobs: [],
    jobSeq: 0,
    rngCounter: 0,
    activeMission: null,
    awayJobs: [], // hands-off jobs out, finished when the crew is back (core/autorun.js)
    sideBoard: [], sideOut: [], intel: {}, // side tasks (core/sidetasks.js)
    recruits: [],
    freelancers: [],
    recruitSeq: 0,
    rosterCap: STARTING_ROSTER_CAP,
    safehouseLevel: 1,
    clients: {},
    founding: null, // { candidates } while the player picks the founders (chooseFounders)
  };
  if (startCrew === 'pick') state.founding = { candidates: generateFounderCandidates(state) };
  if (startCrew === 'fresh') {
    for (const r of generateStartingCrew(state)) {
      state.crew.push(recruitToOperative(r, { condition: freshCondition(), history: ['Day 1: one of the founding crew'] }));
    }
  }
  if (startCrew === 'fresh' || startCrew === 'pick') {
    state.rent = ECONOMY.startRent;
    state.jobGates = true; // jobs unlock by reputation (core/jobs.js)
    // The welcome comes from Joss, the crew's AI partner (WORLD.md).
    state.inbox[0].body = startCrew === 'pick' ? pickWelcome() : `Five on the crew, you, me, and one damp room above a noodle shop. Rent's due Sunday. Nobody in ${NAMES.city} knows our names yet, and the board only has small work. So we take it, learn, and get noticed. I'll keep the numbers honest and wake you if anything's on fire. — ${NAMES.partner}`;
    for (const id of FRESH_OPENING_BOARD) addOffer(state, id);
  } else {
    // The oldest hand vouches for the crew (Teo, in the classic start).
    const elder = [...state.crew].sort((a, b) => b.age - a.age)[0];
    state.inbox[0].body = `Five people, one safehouse, rent due Sunday. ${elder.handle} says the crew trusts you. Mostly. Three jobs are on the board. The courier run alone won't cover rent.`;
    // Opening board: one safe job, one mid, one dangerous (see DESIGN.md).
    for (const id of ['courier', 'data_pull', 'warehouse']) addOffer(state, id);
  }
  refreshFreelancers(state);
  refreshSideBoard(state);
  state.dayStartCash = state.cash;
  return state;
}

const pickWelcome = () => `Before anything else: who's in? I found six people who'd work for street wages, and the room above the noodle shop sleeps three. Pick them and we start. — ${NAMES.partner}`;

/**
 * The player's founders: FOUNDERS_TO_PICK ids from state.founding.candidates. Returns the new
 * state, or prev if the pick isn't valid. Day 1 can't start until this is done (time.js).
 */
export function chooseFounders(prev, ids) {
  const candidates = prev.founding?.candidates ?? [];
  const picked = [...new Set(ids)].map((id) => candidates.find((c) => c.id === id)).filter(Boolean);
  if (picked.length !== FOUNDERS_TO_PICK || ids.length !== FOUNDERS_TO_PICK) return prev;
  const state = structuredClone(prev);
  state.crew = picked.map((r) => recruitToOperative(structuredClone(r), { condition: freshCondition(), history: ['Day 1: one of the founding crew'] }));
  state.founding = null;
  const names = state.crew.map((o) => o.handle);
  const welcome = state.inbox.find((m) => m.id === 'welcome');
  if (welcome) welcome.body = `${names.slice(0, -1).join(', ')} and ${names.at(-1)}. Three on the crew, you, me, and one damp room above a noodle shop. Rent's due Sunday. Nobody in ${NAMES.city} knows our names yet, and the board only has small work. So we take it, learn, get noticed, and hire when we can. I'll keep the numbers honest and wake you if anything's on fire. — ${NAMES.partner}`;
  return state;
}
