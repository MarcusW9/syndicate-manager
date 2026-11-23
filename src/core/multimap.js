// A multi-map job (the pilot, owner 2026-11-22: Kidnap Rescue; renamed from "trail" 2026-11-23). Pure logic.
//
// A template with `maps` plays its stops first: each stop on its own map (its district's site), each a crisis of the
// job's (marked stop: true, so the finale's draw never takes it). Which stop comes next is the job's to say:
// - a fixed route: each stop has one `next`, so the route is always the same (a robbery in three places, drops);
// - a branching route: a stop lists several `next` and one is picked (a hash, below);
// - lead-following, both optional: `skip` is where a strong result leads instead (a shortcut), and stops marked
//   `wrong` are dead ends a failure can send the crew to (one a job at most), each leading back to the stop it
//   stood in for. Kidnap Rescue uses both.
// When the route reaches `finale`, the job's own queue plays: its beats, crises, incidents and fight, as any job.
// Aborts are the crises' own: every one keeps an abort.
//
// Randomness: the next stop is a hash of the save, the job and the stop (hashRng), so no other roll moves.

import { hashRng } from './rng.js';

export const MULTI_MAP = {
  skipMargin: 8, // a crisis won by this much or more takes the stop's shortcut (stop.skip), if it has one
  wrongChance: 0.4, // a failed stop sends the crew to a wrong lead this share of the time (one per job at most)
  maxStops: 4, // stops before the finale, the wrong lead included
};

/** The heading the watch shows while the crew is between maps (the finale shows the job's own). */
export const DEFAULT_HEADING = 'On the move';

export const stopOf = (tpl, id) => (id === 'finale' ? { ...tpl.maps.finale, district: tpl.district, id } : { ...tpl.maps.stops[id], id });

/** The map a run is on now: a stop's district (and its own site key), else the job's. */
export function runPlace(am, tpl) {
  const at = am?.maps?.at;
  if (!tpl?.maps || !at || at === 'finale') return { district: tpl?.district, key: am?.jobId };
  return { district: tpl.maps.stops[at]?.district ?? tpl.district, key: `${am.jobId}:${at}` };
}

/**
 * Where the route goes after a stop. result: { success, margin } of the stop's crisis (null if none was rolled).
 * route: the run's `am.maps` ({ path, wrongUsed, then }). Returns { next, wrong, then } (wrong: this is a wrong
 * lead, and `then` is where it leads back to).
 */
export function nextStop(seed, jobId, tpl, route, stopId, result) {
  const s = tpl.maps.stops[stopId];
  if (s.wrong) return { next: route.then ?? 'finale', wrong: false };
  const rng = hashRng(seed, 'trail', jobId, stopId); // the key keeps its pilot name so a saved run's route stays the same
  const options = (s.next ?? ['finale']).filter((id) => id === 'finale' || !route.path.includes(id));
  const pick = options[Math.floor(rng() * options.length)] ?? 'finale';
  const ok = result ? result.success !== false : true;
  const room = route.path.length < MULTI_MAP.maxStops - 1; // a wrong lead still leaves the finale within maxStops
  if (ok && s.skip && (result?.margin ?? 0) >= MULTI_MAP.skipMargin) return { next: s.skip, wrong: false };
  const wrongs = Object.entries(tpl.maps.stops).filter(([, x]) => x.wrong).map(([id]) => id);
  const r = rng();
  if (!ok && !route.wrongUsed && room && wrongs.length && pick !== 'finale' && r < MULTI_MAP.wrongChance) {
    return { next: wrongs[Math.floor(rng() * wrongs.length)], wrong: true, then: pick };
  }
  return { next: pick, wrong: false };
}
