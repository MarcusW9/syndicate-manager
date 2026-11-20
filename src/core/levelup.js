// Level-ups (save v83, 2026-11-20; drafts/PROPOSAL-runner-shaping.md step 4; DESIGN.md 2026-11-20). They replace Joss's offers for
// moves, payloads and specialisations: a runner levels up when a skill is ready for them (core/abilities.js skillMenu: stat gates
// met, place open, a specialisation's jobs on overwatch done) and they have the jobs behind them (data/builds.js LEVEL_UP). The
// player then picks any ready skill on their page; the pick waits as long as they like. Three places (move, payload,
// specialisation), never replaced, so at most three level-ups in a career. Pure logic.
//
// op.pickAt   their jobsWithCrew at their last pick (null before the first)
// op.levelUp  { day } while a level-up is waiting for the player's pick, else null
import { LEVEL_UP } from '../data/builds.js';
import { MOVES, PAYLOADS } from '../data/builds.js';
import { SPECIALISATIONS } from '../data/specialisations.js';
import { skillMenu } from './abilities.js';
import { isFreelancer } from './freelance.js';

const SOURCES = { move: MOVES, payload: PAYLOADS, spec: SPECIALISATIONS };

/** The skills a runner could learn now: the Ready rows of their skills list. */
export const readySkills = (op) => skillMenu(op).items.filter((i) => i.state === 'ready');

/** Jobs with the crew they still need before they can level up again (0 when the jobs are there). */
export function jobsToLevelUp(op) {
  const jobs = op?.jobsWithCrew ?? 0;
  const at = op?.pickAt == null ? LEVEL_UP.firstAtJobs : op.pickAt + LEVEL_UP.everyJobs;
  return Math.max(0, at - jobs);
}

/** Is a level-up due: one of ours, the jobs behind them, and a skill ready? */
export const levelUpDue = (op) => !isFreelancer(op) && jobsToLevelUp(op) === 0 && readySkills(op).length > 0;

/** Is a level-up waiting for the player's pick (announced, and something still ready to take)? */
export const levelUpOpen = (op) => Boolean(op?.levelUp) && !isFreelancer(op) && readySkills(op).length > 0;

/**
 * Announce a level-up for anyone newly due one: sets op.levelUp and posts one message. Mutates state; returns the people announced.
 * Called after each job (finish) and each day (side tasks grow stats too).
 */
export function checkLevelUps(state) {
  const announced = [];
  for (const op of state.crew) {
    if (op.levelUp || !levelUpDue(op)) continue;
    op.levelUp = { day: state.day };
    const ready = readySkills(op);
    state.inbox.unshift({
      id: `levelup-${op.id}-${state.day}`, type: 'crew', kind: 'levelup', day: state.day,
      subject: `${op.handle} levelled up`,
      body: `${op.handle} is ready to learn something new: ${ready.map((i) => i.name).join(', ')}. Pick one on their page, under Skills. Once learned, it is theirs for good.`,
      payload: { opId: op.id },
      blocking: false, read: false,
    });
    announced.push(op);
  }
  return announced;
}

/**
 * The player's pick: learn a ready skill at an open level-up. Returns new state (unchanged if the pick isn't allowed).
 * slot 'move' | 'payload' | 'spec'.
 */
export function learnSkill(state, opId, slot, id) {
  const op = state.crew.find((o) => o.id === opId);
  if (!op || !levelUpOpen(op) || !readySkills(op).some((i) => i.slot === slot && i.id === id)) return state;
  const def = SOURCES[slot][id];
  const next = { ...op, history: [...(op.history ?? []), `Day ${state.day}: learned ${def.name}`], pickAt: op.jobsWithCrew ?? 0, levelUp: null };
  if (slot === 'spec') next.spec = { id, day: state.day };
  else next.build = { move: null, payload: null, ...op.build, [slot]: id };
  const inbox = state.inbox.map((m) => (m.kind === 'levelup' && m.payload?.opId === opId && !m.resolved ? { ...m, resolved: true, read: true, payload: { ...m.payload, learned: def.name } } : m));
  return { ...state, crew: state.crew.map((o) => (o.id === opId ? next : o)), inbox };
}
