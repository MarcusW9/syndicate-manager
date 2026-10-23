// Creating a new game. Pure logic: no DOM, no storage.

import { STARTING_CREW, STARTING_TRUST } from '../data/operatives.js';
import { NAMES } from '../config/names.js';
import { addOffer } from './jobs.js';
import { STARTING_ROSTER_CAP } from './recruits.js';

export const SAVE_VERSION = 3;

const freshCondition = () => ({
  fatigue: 10,
  morale: 65,
  neuralLoad: 0,
  burnout: 0,
  injury: 'healthy',
  injuryDays: 0,
});

/** @returns {import('./types.js').GameState} */
export function createNewGame({ seed = Date.now() % 2147483647, difficulty = 'standard' } = {}) {
  const crew = STARTING_CREW.map((op) => ({
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
    reputation: 0,
    tier: 'street',
    rent: 4000,
    difficulty,
    crew,
    inbox: [
      {
        id: 'welcome',
        type: 'crew',
        day: 1,
        subject: `Welcome to ${NAMES.city}`,
        body: `Five people, one safehouse, rent due Sunday. Teo says the crew trusts you. Mostly. Three jobs are on the board. The courier run alone won't cover rent.`,
        blocking: false,
        read: false,
      },
    ],
    memorial: [],
    jobs: [],
    jobSeq: 0,
    rngCounter: 0,
    activeMission: null,
    recruits: [],
    recruitSeq: 0,
    rosterCap: STARTING_ROSTER_CAP,
    safehouseLevel: 1,
  };
  // Opening board: one safe job, one mid, one dangerous (see DESIGN.md).
  for (const id of ['courier', 'data_pull', 'warehouse']) addOffer(state, id);
  return state;
}
