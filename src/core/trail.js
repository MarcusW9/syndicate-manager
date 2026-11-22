// A job that follows a trail (the multi-map pilot, owner 2026-11-22; drafts/PROPOSAL-lead-following.md). Pure logic.
//
// A template with `trail` plays its day first: stop after stop, each on its own map (its district's site), each a
// crisis of the job's (marked trail: true). How the stop's crisis went picks the next: a strong result can skip
// straight to the night (stop.skip), a failure can send the crew to a wrong lead (a dead end that leads back to the
// stop it stood in for), at most one wrong lead a job. When the trail reaches `held`, the night plays: the job's
// beats, crises, incidents and fight, as any job. Aborts are the crises' own: every one keeps an abort.
//
// Randomness: the next stop is a hash of the save, the job and the stop (hashRng), so no other roll moves.

import { hashRng } from './rng.js';

export const TRAIL = {
  skipMargin: 8, // a crisis won by this much or more takes the stop's shortcut (stop.skip), if it has one
  wrongChance: 0.4, // a failed stop sends the crew to a wrong lead this share of the time (one per job at most)
  maxStops: 4, // stops before the night, the wrong lead included
};

export const stopOf = (tpl, id) => (id === 'held' ? { ...tpl.trail.held, district: tpl.district, id } : { ...tpl.trail.stops[id], id });

/** The map a run is on now: a trail stop's district (and its own site key), else the job's. */
export function runPlace(am, tpl) {
  const at = am?.trail?.at;
  if (!tpl?.trail || !at || at === 'held') return { district: tpl?.district, key: am?.jobId };
  return { district: tpl.trail.stops[at]?.district ?? tpl.district, key: `${am.jobId}:${at}` };
}

/**
 * Where the trail goes after a stop. result: { success, margin } of the stop's crisis (null if none was rolled).
 * Returns { next, wrong } (wrong: this is a wrong lead, and `then` is where it leads back to).
 */
export function nextStop(seed, jobId, tpl, trail, stopId, result) {
  const s = tpl.trail.stops[stopId];
  if (s.wrong) return { next: trail.then ?? 'held', wrong: false };
  const rng = hashRng(seed, 'trail', jobId, stopId);
  const options = (s.next ?? ['held']).filter((id) => id === 'held' || !trail.path.includes(id));
  const pick = options[Math.floor(rng() * options.length)] ?? 'held';
  const ok = result ? result.success !== false : true;
  const room = trail.path.length < TRAIL.maxStops - 1; // a wrong lead still leaves the night within maxStops
  if (ok && s.skip && (result?.margin ?? 0) >= TRAIL.skipMargin) return { next: s.skip, wrong: false };
  const wrongs = Object.entries(tpl.trail.stops).filter(([, x]) => x.wrong).map(([id]) => id);
  const r = rng();
  if (!ok && !trail.wrongUsed && room && wrongs.length && pick !== 'held' && r < TRAIL.wrongChance) {
    return { next: wrongs[Math.floor(rng() * wrongs.length)], wrong: true, then: pick };
  }
  return { next: pick, wrong: false };
}
