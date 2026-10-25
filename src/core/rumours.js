// Street talk. Pure logic: no DOM, no storage.
// Weekly rumours are always true (shown risk must equal used risk): a threat
// rumour shifts every job in its district by one step, shown on the board; a
// crisis rumour makes that district crisis likely on jobs there. Reactions are
// flavour: the city talking about the job you just did.

import { RUMOURS, REACTIONS } from '../data/rumours.js';
import { nextRng } from './random.js';
import { pick } from './rng.js';

export const RUMOUR_DAYS = 7;          // Monday to Sunday
export const RUMOUR_CRISIS_CHANCE = 0.6; // a crisis rumour's crisis is drawn first this often
export const REACTION_CHANCE = 0.5;

export const rumourById = (id) => RUMOURS.find((r) => r.id === id) ?? null;

/** This week's rumour, if one is going round on `day`. */
export function activeRumour(state, day = state.day) {
  const r = state.rumour;
  return r && r.until >= day ? rumourById(r.id) : null;
}

/** The active rumour if it applies to jobs in this district. */
export const rumourFor = (state, district) => {
  const r = activeRumour(state);
  return r && r.district === district ? r : null;
};

/** Monday: a new rumour goes round (never the same one twice running). Mutates the (cloned) state. */
export function rollRumour(state) {
  const rng = nextRng(state);
  const options = RUMOURS.filter((r) => r.id !== state.rumour?.id);
  const r = pick(rng, options);
  state.rumour = { id: r.id, until: state.day + RUMOUR_DAYS - 1 };
  state.inbox.unshift({
    id: `rumour-${state.day}`, type: 'rumour', day: state.day,
    subject: `Street talk: ${r.tag}`,
    body: `${r.text} (Until Sunday. Jobs in the area are marked on the board.)`,
    blocking: false, read: false, expiresDay: state.day + RUMOUR_DAYS - 1,
  });
}

/** After a job: sometimes the city talks about it. Loud jobs get noticed; clean ones get admired. */
export function reactToJob(state, am, tpl, { heatGain, injuries, deaths }) {
  if (am.aborted || deaths.length) return;
  const loud = am.approach === 'loud';
  const clean = !loud && heatGain === 0 && !injuries.length;
  if (!loud && !clean) return;
  const rng = nextRng(state);
  if (rng() >= REACTION_CHANCE) return;
  const lines = loud ? REACTIONS.loud[tpl.district] ?? [] : REACTIONS.clean;
  if (!lines.length) return;
  state.inbox.unshift({
    id: `talk-${state.day}-${state.rngCounter}`, type: 'rumour', day: state.day,
    subject: loud ? 'People are talking' : 'A clean job',
    body: pick(rng, lines).replace('{job}', tpl.name),
    blocking: false, read: false, expiresDay: state.day + RUMOUR_DAYS,
  });
}
