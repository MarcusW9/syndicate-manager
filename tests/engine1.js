// Engine 1 is no longer reachable from a job (every job plays on engine 2 since 2026-11-19). The tests of engine 1's own rules
// still need an engine-1 fight, so a test file calls this to take jobs out of FIGHT_JOBS for that file's process (node --test runs
// each file on its own). Only tests do this; the game never does.
import { FIGHT_JOBS } from '../src/data/fights.js';
export const pinToEngine1 = (...ids) => { for (const id of ids) delete FIGHT_JOBS[id]; };
