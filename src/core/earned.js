// Earned traits: what happens to people on the job changes them (owner's list and calls,
// 2026-10-26; DESIGN.md). Pure logic.
//
// op.earned  [{ id, day, district?, client?, partner?, uses? }]  what they've become
// op.track   counters towards traits, hidden from the player (progress isn't shown: a trait
//            arrives as a story, with Joss's note saying why)
//
// Traits never take a choice away from the player: downsides are penalties, shown in the roll
// breakdown like every other modifier. At most MAX_TEMPORARY temporary traits at once; a new
// one replaces the oldest.

import { EARNED_TRAITS } from '../data/earnedTraits.js';
import { CLIENTS } from '../data/clients.js';
import { NAMES } from '../config/names.js';

export const MAX_TEMPORARY = 2;
export const NEEDS = {
  steadyUnderFire: 3, // cool or combat rolls passed after a crewmate is hurt on the job
  clinicHands: 3, // medical rolls passed
  cleanProfessional: 10, // finished jobs without personally causing heat
  ghostDriver: 5, // driving rolls passed with no heat and no injury
  crewAnchor: 5, // jobs with the same crewmate, both back unhurt
  shakyInjuries: 2, // injuries within a week (or one critical)
  shakyClean: 3, // clean jobs to settle again
  ridingHigh: 3, // jobs in a row without a failed roll, an injury or heat they caused
  ridingIdleDays: 7,
  rhythmJobs: 5, rhythmDays: 14, rhythmAway: 2,
  knownFaceJobs: 3, knownFaceDays: 14,
  secondWind: 2, secondWindUses: 3,
  favouriteJobs: 3, favouriteAway: 5,
};

const track = (op) => (op.track ??= {});
const districtText = (d) => NAMES.districtsInText?.[d] ?? NAMES.districts?.[d] ?? d;
const clientName = (id) => CLIENTS.find((c) => c.id === id)?.name ?? id;

/** Their entry for a trait, if they have it (and it matches, for district/client/partner traits). */
export function earnedOf(op, id, where = {}) {
  return (op.earned ?? []).find((e) => e.id === id && Object.entries(where).every(([k, v]) => e[k] === v)) ?? null;
}

/** The trait's text with its district, client or partner filled in. */
export function earnedText(state, entry, field = 'desc') {
  const partner = entry.partner ? state.crew.find((o) => o.id === entry.partner)?.handle ?? 'an old partner' : '';
  return EARNED_TRAITS[entry.id][field]
    .replaceAll('{district}', districtText(entry.district)).replaceAll('{client}', clientName(entry.client)).replaceAll('{partner}', partner);
}

// What earning a temporary trait starts again from zero, so it can't flicker straight back
// after fading (or after being pushed out by a newer one).
const RESTART = {
  shaky: (t) => { t.hurtDays = []; },
  riding_high: (t) => { t.streak = 0; },
  district_rhythm: (t) => { t.jobs = []; },
  known_face: (t, { district }) => { t.heatJobs = { ...t.heatJobs, [district]: 0 }; },
  second_wind: (t) => { t.secondWind = 0; },
  client_favourite: (t, { client }) => { t.clientJobs = { ...t.clientJobs, [client]: 0 }; },
};

/** They become something. Mutates the (cloned) state. */
export function earn(state, op, id, extra = {}) {
  if (earnedOf(op, id, extra)) return;
  const def = EARNED_TRAITS[id];
  if (def.kind === 'temporary') {
    const temps = (op.earned ?? []).filter((e) => EARNED_TRAITS[e.id].kind === 'temporary');
    if (temps.length >= MAX_TEMPORARY) fade(state, op, temps[0], 'makes room');
  }
  const entry = { id, day: state.day, ...extra };
  op.earned = [...(op.earned ?? []), entry];
  RESTART[id]?.(track(op), extra); // a temporary trait comes back only after a fresh run of the same
  op.history.push(`Day ${state.day}: ${def.name}. ${earnedText(state, entry, 'history')}`);
  state.inbox.unshift({
    id: `earned-${op.id}-${id}-${state.day}`, type: 'crew', day: state.day,
    subject: `${op.handle}: ${def.name}`,
    body: `${def.note} (${op.handle}: ${earnedText(state, entry)})`,
    blocking: false, read: false,
  });
}

/** A trait fades. Mutates the (cloned) state. */
export function fade(state, op, entry, why = '') {
  op.earned = (op.earned ?? []).filter((e) => e !== entry);
  const name = EARNED_TRAITS[entry.id].name;
  op.history.push(`Day ${state.day}: no longer ${name}${why ? ` (${why})` : ''}.`);
  state.inbox.unshift({
    id: `faded-${op.id}-${entry.id}-${state.day}`, type: 'crew', day: state.day,
    subject: `${op.handle}: no longer ${name}`,
    body: why === 'makes room' ? `Something newer has taken its place.` : `That's passed. ${op.handle} is back to their usual self on that front.`,
    blocking: false, read: false,
  });
}

// --- roll modifiers ----------------------------------------------------------------

/**
 * Modifiers on the person alone (they also shape who rolls): [{ value, note }].
 * ctx: { stat, crew }.
 */
export function ownMods(op, { stat, crew = [] }) {
  const out = [];
  const t = op.track ?? {};
  if (stat === 'driving' && earnedOf(op, 'ghost_driver')) out.push({ value: 1, note: 'Ghost Driver +1' });
  if (stat === 'cool' && earnedOf(op, 'shaky')) out.push({ value: -1, note: 'Shaky −1' });
  if (stat === 'cool' && op.condition?.injury === 'light' && earnedOf(op, 'scarred')) out.push({ value: 1, note: 'Scarred +1' });
  if (stat === 'cool') {
    for (const e of (op.earned ?? []).filter((x) => x.id === 'crew_anchor')) {
      const mate = crew.find((o) => o.id === e.partner);
      if (mate) out.push({ value: 1, note: `with ${mate.handle} (Crew Anchor) +1` });
    }
    if (t.anchorShaken) out.push({ value: -1, note: 'shaken (partner hurt) −1' });
  }
  return out;
}

/**
 * Modifiers that depend on the job: [{ value, note }].
 * job: { district, injured: ids hurt so far, rolled: ids who've rolled, secondWindUsed: ids, side?, solo? }
 */
export function jobMods(op, { stat, job }) {
  if (!job) return [];
  const out = [];
  const first = !job.side && !(job.rolled ?? []).includes(op.id);
  if (!job.side && stat === 'cool' && earnedOf(op, 'steady_under_fire') && (job.injured ?? []).some((id) => id !== op.id)) out.push({ value: 1, note: 'Steady Under Fire +1' });
  if (first && earnedOf(op, 'riding_high')) out.push({ value: 1, note: 'Riding High (first roll) +1' });
  const rhythm = earnedOf(op, 'district_rhythm');
  if (first && rhythm) out.push(rhythm.district === job.district ? { value: 1, note: 'District Rhythm +1' } : { value: -1, note: 'District Rhythm (off their patch) −1' });
  const face = earnedOf(op, 'known_face', { district: job.district });
  if (face && stat === 'stealth') out.push({ value: -1, note: 'Known Face −1' });
  if (face && stat === 'social') out.push({ value: 1, note: 'Known Face +1' });
  if (!job.side && op.condition?.injury === 'light' && earnedOf(op, 'second_wind') && !(job.secondWindUsed ?? []).includes(op.id)) out.push({ value: 2, note: 'Second Wind (shrugs off the hurt) +2' });
  if (job.side && job.solo && earnedOf(op, 'shaky')) out.push({ value: -1, note: 'Shaky, alone −1' });
  return out;
}

// --- tracking ------------------------------------------------------------------------

/** Someone was hurt (on a job or side work). Mutates the (cloned) state. */
export function noteInjury(state, op, severity) {
  if (!op || op.freelance || severity === 'none') return;
  const t = track(op);
  t.hurtDays = [...(t.hurtDays ?? []).filter((d) => d > state.day - 7), state.day];
  if (severity === 'critical') {
    t.wasCritical = true;
    // Their partners are shaken until they've worked a job.
    for (const o of state.crew) if (earnedOf(o, 'crew_anchor', { partner: op.id })) track(o).anchorShaken = true;
  }
  if (severity === 'critical' || t.hurtDays.length >= NEEDS.shakyInjuries) earn(state, op, 'shaky');
}

/**
 * After a job: count what each of the crew did, earn and fade. Mutates the (cloned) state.
 * events: the run's record (mission.js); outcome: 'completed' | 'aborted' | 'loss'.
 */
export function afterJob(state, { events, district, clientId, outcome, crewIds }) {
  const crew = crewIds.map((id) => state.crew.find((o) => o.id === id)).filter((o) => o && !o.freelance);
  const done = outcome === 'completed';
  const rolls = events.filter((e) => (e.kind === 'roll' || (e.kind === 'critical' && e.action === 'stabilise')) && e.actor);
  const hurt = new Set(events.filter((e) => e.injury).map((e) => e.injury.id));

  for (const op of crew) {
    const t = track(op);
    const mine = rolls.filter((e) => e.actor.id === op.id);
    const heatOf = (e) => (e.outcomeCost?.heat ?? 0) + (e.choiceCost?.heat ?? 0);
    const causedHeat = mine.some((e) => heatOf(e) > 0);
    const failed = mine.some((e) => !e.success);
    const contributed = mine.some((e) => e.success); // made at least one roll count on this job
    const wasHurt = hurt.has(op.id);

    // Steady Under Fire: cool or combat rolls passed once someone else was already hurt.
    let hurtSoFar = false;
    for (const e of events) {
      if (e.actor?.id === op.id && e.kind === 'roll' && e.success && ['cool', 'combat'].includes(e.stat) && hurtSoFar) t.steadyFire = (t.steadyFire ?? 0) + 1;
      if (e.injury && e.injury.id !== op.id) hurtSoFar = true;
    }
    if ((t.steadyFire ?? 0) >= NEEDS.steadyUnderFire) earn(state, op, 'steady_under_fire');

    t.medPasses = (t.medPasses ?? 0) + mine.filter((e) => e.stat === 'medical' && e.success).length;
    if (t.medPasses >= NEEDS.clinicHands) earn(state, op, 'clinic_hands');

    t.cleanDrives = (t.cleanDrives ?? 0) + mine.filter((e) => e.stat === 'driving' && e.success && !heatOf(e) && !e.injury).length;
    if (t.cleanDrives >= NEEDS.ghostDriver) earn(state, op, 'ghost_driver');

    if (done && !causedHeat) t.cleanJobs = (t.cleanJobs ?? 0) + 1;
    if ((t.cleanJobs ?? 0) >= NEEDS.cleanProfessional) earn(state, op, 'clean_professional');

    // Crew Anchor: jobs together with someone, both back unhurt.
    if (!wasHurt) {
      for (const mate of crew) {
        if (mate === op || hurt.has(mate.id)) continue;
        t.together = { ...(t.together ?? {}), [mate.id]: (t.together?.[mate.id] ?? 0) + 1 };
        if (t.together[mate.id] >= NEEDS.crewAnchor) earn(state, op, 'crew_anchor', { partner: mate.id });
      }
    }
    if (t.anchorShaken && done) delete t.anchorShaken; // one job to settle

    // Shaky settles after clean jobs.
    const shaky = earnedOf(op, 'shaky');
    if (shaky && done && !wasHurt && !failed) {
      shaky.clean = (shaky.clean ?? 0) + 1;
      if (shaky.clean >= NEEDS.shakyClean) fade(state, op, shaky, 'settled');
    }

    // Riding High: a run of clean jobs; ends at a failed roll.
    t.lastWorked = state.day;
    const riding = earnedOf(op, 'riding_high');
    if (riding && failed) fade(state, op, riding, 'a roll went wrong');
    // Only jobs where they made a roll count towards the run; a job they sat out neither builds nor breaks it.
    if (failed || wasHurt || causedHeat || !done) t.streak = 0;
    else if (contributed) t.streak = (t.streak ?? 0) + 1;
    if (t.streak >= NEEDS.ridingHigh && !earnedOf(op, 'riding_high')) earn(state, op, 'riding_high');

    // District Rhythm: lots of work in one district lately.
    t.jobs = [...(t.jobs ?? []).filter((j) => j.day > state.day - NEEDS.rhythmDays), { day: state.day, district }];
    const rhythm = earnedOf(op, 'district_rhythm');
    if (rhythm && rhythm.district !== district) {
      rhythm.away = (rhythm.away ?? 0) + 1;
      if (rhythm.away >= NEEDS.rhythmAway) fade(state, op, rhythm, 'worked elsewhere');
    }
    if (t.jobs.filter((j) => j.district === district).length >= NEEDS.rhythmJobs) earn(state, op, 'district_rhythm', { district });

    // Known Face: trouble they caused in one district.
    if (causedHeat) {
      t.heatJobs = { ...(t.heatJobs ?? {}), [district]: (t.heatJobs?.[district] ?? 0) + 1 };
      t.lastHeat = { ...(t.lastHeat ?? {}), [district]: state.day };
      if (t.heatJobs[district] >= NEEDS.knownFaceJobs) earn(state, op, 'known_face', { district });
    }

    // Second Wind: made the last roll of the job count while hurt.
    const last = rolls.filter((e) => e.kind === 'roll').at(-1);
    if (last && last.actor.id === op.id && last.success && (last.notes ?? []).includes('hurt')) {
      t.secondWind = (t.secondWind ?? 0) + 1;
      if (t.secondWind >= NEEDS.secondWind) earn(state, op, 'second_wind', { uses: 0 });
    }

    // Client's Favourite: good, quiet work for one client.
    if (clientId) {
      const fav = earnedOf(op, 'client_favourite', { client: clientId });
      if (fav && !done) fade(state, op, fav, `a job for ${clientName(clientId)} went wrong`);
      if (done && !causedHeat && contributed) {
        t.clientJobs = { ...(t.clientJobs ?? {}), [clientId]: (t.clientJobs?.[clientId] ?? 0) + 1 };
        if (t.clientJobs[clientId] >= NEEDS.favouriteJobs) earn(state, op, 'client_favourite', { client: clientId });
      }
    }
    for (const fav of (op.earned ?? []).filter((e) => e.id === 'client_favourite' && e.client !== clientId)) {
      if (!done) continue;
      fav.away = (fav.away ?? 0) + 1;
      if (fav.away >= NEEDS.favouriteAway) fade(state, op, fav, 'working for others');
    }
  }
}

/** Daily: scars set once a critical wound has healed; idle and quiet spells end temporary traits. */
export function dailyTraits(state) {
  for (const op of state.crew) {
    if (op.freelance) continue;
    const t = op.track ?? {};
    if (t.wasCritical && op.condition.injury === 'healthy') {
      delete t.wasCritical;
      earn(state, op, 'scarred');
    }
    const riding = earnedOf(op, 'riding_high');
    if (riding && state.day - (t.lastWorked ?? riding.day) >= NEEDS.ridingIdleDays) fade(state, op, riding, 'a week without work');
    for (const face of (op.earned ?? []).filter((e) => e.id === 'known_face')) {
      if (state.day - (t.lastHeat?.[face.district] ?? face.day) >= NEEDS.knownFaceDays) fade(state, op, face, 'quiet for two weeks');
    }
  }
}

/** Second Wind was used on a roll: count it, and it's spent after three. */
export function spendSecondWind(state, op) {
  const sw = earnedOf(op, 'second_wind');
  if (!sw) return;
  sw.uses = (sw.uses ?? 0) + 1;
  if (sw.uses >= NEEDS.secondWindUses) fade(state, op, sw, 'used up');
}
