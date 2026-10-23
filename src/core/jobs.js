// Job board: offers appear on Mondays and expire after a week. Pure logic.

import { MISSIONS } from '../data/missions.js';
import { pick } from './rng.js';
import { nextRng } from './random.js';

export const templateById = (id) => MISSIONS.find((m) => m.id === id);
const MAX_OFFERS = 4;

export function addOffer(state, templateId) {
  const n = (state.jobSeq = (state.jobSeq ?? 0) + 1);
  state.jobs.push({ id: `job-${n}`, templateId, offeredDay: state.day, expiresDay: state.day + 6 });
}

/** Weekly refresh: drop expired offers, add up to 2 new ones. Mutates the (cloned) state. */
export function refreshJobs(state) {
  state.jobs = state.jobs.filter((j) => j.expiresDay >= state.day);
  const rng = nextRng(state);
  let added = 0;
  while (state.jobs.length < MAX_OFFERS && added < 2) {
    addOffer(state, pick(rng, MISSIONS).id);
    added += 1;
  }
  if (added) {
    state.inbox.unshift({
      id: `jobs-${state.day}`, type: 'job', day: state.day,
      subject: `${added} new job${added > 1 ? 's' : ''} on the board`,
      body: 'Fresh work came in over the weekend. Check the Jobs screen.',
      blocking: false, read: false,
    });
  }
}
