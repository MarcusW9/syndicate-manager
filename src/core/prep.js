// Prep stops on long jobs (owner, 2026-11-24; drafts/PROPOSAL-longer-jobs.md). Pure logic.
//
// A long job (core/jobs.js isLongJob) that has no route of its own gets prep stops from the shared library
// (data/prepStops.js): picked when the offer is made, so the board shows the route and it never changes before
// the crew goes; built into a route (the same shape as a multi-map job's `maps`, core/multimap.js) when the job
// starts, and kept on the run (`am.route`), so a saved run plays the same stops whatever the library becomes.
//
// How many: threat 2 one, threat 3 one or two, threat 4 two, threat 5 two or three; never more than the days
// before the job's own day, nor the multi-map cap. Which: those that fit the job's district, a stop whose stats
// meet the job's key stats twice as likely. hashRng only, keyed by the offer, so no other roll moves.

import { PREP_STOPS, PREP_FINALE, PREP_HEADING, prepStopById } from '../data/prepStops.js';
import { MULTI_MAP } from './multimap.js';
import { hashRng } from './rng.js';

export const PREP_COUNT = { 2: [1, 1], 3: [1, 2], 4: [2, 2], 5: [2, 3] };

/** The prep stops that fit a template: its district's own and the ones that fit anywhere. */
export const prepFits = (tpl) => PREP_STOPS.filter((p) => !p.districts || p.districts.includes(tpl.district));

/**
 * The stops for an offer: an array of prep stop ids, in the order they play ([] for a job that runs no prep).
 * days: the offer's days (the job's own day is the last, so at most days - 1 stops).
 */
export function pickPrep(seed, offerKey, tpl, days) {
  const [lo, hi] = PREP_COUNT[tpl?.threat] ?? [0, 0];
  if (!hi || tpl.maps) return [];
  const rng = hashRng(seed, 'prep', offerKey);
  const want = Math.min(lo + Math.floor(rng() * (hi - lo + 1)), Math.max(0, days - 1), MULTI_MAP.maxStops - 1);
  const keys = tpl.keyStats ?? [];
  let pool = prepFits(tpl).map((p) => ({ id: p.id, w: p.stats.some((s) => keys.includes(s)) ? 2 : 1 }));
  const out = [];
  while (out.length < want && pool.length) {
    let r = rng() * pool.reduce((n, p) => n + p.w, 0);
    const at = Math.max(0, pool.findIndex((p) => (r -= p.w) < 0));
    out.push(pool[at].id);
    pool = pool.filter((_, i) => i !== at);
  }
  return out;
}

/** The route a run plays for its prep: the shape of a template's `maps` (core/multimap.js). null without prep. */
export function prepRoute(ids, tpl, approach) {
  const stops = (ids ?? []).map(prepStopById).filter(Boolean);
  if (!stops.length) return null;
  const route = { start: stops[0].id, heading: PREP_HEADING, prep: true, stops: {} };
  stops.forEach((p, i) => {
    route.stops[p.id] = { district: tpl.district, time: p.time, place: p.place, arrive: p.arrive, crisis: p.crisis.id, next: [stops[i + 1]?.id ?? 'finale'] };
  });
  route.finale = { time: PREP_FINALE.time, arrive: PREP_FINALE.arrive[approach] ?? PREP_FINALE.arrive.any };
  return route;
}

/** For the job page: the stops an offer will play, as { id, place, time } in order. */
export const prepPlan = (job) => (job?.prep ?? []).map(prepStopById).filter(Boolean).map((p) => ({ id: p.id, place: p.place, time: p.time }));
