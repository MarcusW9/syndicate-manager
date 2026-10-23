// Creating a new game. Pure logic: no DOM, no storage.

import { STARTING_CREW, STARTING_TRUST } from '../data/operatives.js';
import { NAMES } from '../config/names.js';

export const SAVE_VERSION = 1;

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

  return {
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
        body: `Five people, one safehouse, rent due Sunday. Teo says the crew trusts you. Mostly. Press Continue when you're ready.`,
        blocking: false,
        read: false,
      },
    ],
    memorial: [],
  };
}
