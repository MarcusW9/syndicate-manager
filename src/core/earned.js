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
  // group 2 (situations)
  lightFingered: 4, crowdReader: 4, wirewise: 4, cornerFighter: 3,
  rattledFails: 2, rattledFaced: 2,
  fuseFails: 2, fuseCalmJobs: 3, fuseToHothead: 3,
  burnoutFails: 2, burnoutJobs: 3, burnoutRestDays: 3,
  overconfident: 4,
};

const track = (op) => (op.track ??= {});

/** An inbox id nobody else has: the base, or the base with -2, -3... Messages open by id. */
export function uniqueInboxId(state, base) {
  const taken = new Set(state.inbox.map((m) => m.id));
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}
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
  rattled_by_sirens: (t) => { t.policeFails = 0; },
  short_fuse: (t) => { t.threatFails = 0; },
  burned_out: (t) => { t.techFails = []; },
  overconfident: (t) => { t.hardStreak = 0; },
  client_favourite: (t, { client }) => { t.clientJobs = { ...t.clientJobs, [client]: 0 }; },
};

/** They become something. Mutates the (cloned) state. */
export function earn(state, op, id, extra = {}) {
  if (earnedOf(op, id, extra)) return;
  if (id === 'short_fuse') {
    const t = track(op);
    t.fuseCount = (t.fuseCount ?? 0) + 1;
    if (t.fuseCount >= NEEDS.fuseToHothead) return becomeHothead(state, op);
  }
  const def = EARNED_TRAITS[id];
  if (def.kind === 'temporary') {
    const temps = (op.earned ?? []).filter((e) => EARNED_TRAITS[e.id].kind === 'temporary');
    if (temps.length >= MAX_TEMPORARY) fade(state, op, temps[0], 'makes room');
  }
  const entry = { id, day: state.day, ...extra };
  op.earned = [...(op.earned ?? []), entry];
  RESTART[id]?.(track(op), extra); // a temporary trait comes back only after a fresh run of the same
  op.history.push(`Day ${state.day}: ${def.name}. ${earnedText(state, entry, 'history')}`);
  // One message per trait earned, even two of the same on one day (Crew Anchor with two
  // partners): the id and the subject name who or where it's about (owner's save, 2026-10-28).
  const about = extra.partner ? ` with ${state.crew.find((o) => o.id === extra.partner)?.handle ?? 'a partner'}`
    : extra.district ? ` (${districtText(extra.district)})` : extra.client ? ` (${clientName(extra.client)})` : '';
  state.inbox.unshift({
    id: uniqueInboxId(state, ['earned', op.id, id, ...Object.values(extra), state.day].join('-')), type: 'crew', day: state.day,
    subject: `${op.handle}: ${def.name}${about}`,
    body: `${def.note} (${op.handle}: ${earnedText(state, entry)})`,
    blocking: false, read: false,
  });
}

/** Short Fuse a third time: it sticks. They take the Hothead trait for good. */
function becomeHothead(state, op) {
  if (op.traits.includes('hothead')) return;
  op.traits = [...op.traits, 'hothead'];
  op.history.push(`Day ${state.day}: Hothead. The short fuse stopped being a phase.`);
  state.inbox.unshift({
    id: `hothead-${op.id}-${state.day}`, type: 'crew', day: state.day,
    subject: `${op.handle}: Hothead`,
    body: `Third time. It isn't a bad week any more; it's who they are now. (${op.handle}: +2 combat, −2 cool, for good.)`,
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
  if (stat === 'cool' && earnedOf(op, 'shaky')) out.push({ value: -1, note: 'Shaky −1' });
  if ((stat === 'tech' || stat === 'cool') && earnedOf(op, 'burned_out')) out.push({ value: -1, note: 'Burned Out −1' });
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
 * job: { district, injured: ids hurt so far, rolled: ids who've rolled, secondWindUsed: ids,
 *        situations: the crisis's (data/situations.js), difficulty, safest: the easiest option?, side?, solo? }
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
  // Group 2: what kind of situation this is.
  const sit = new Set(job.situations ?? []);
  if (stat === 'driving' && sit.has('escape') && earnedOf(op, 'ghost_driver')) out.push({ value: 1, note: 'Ghost Driver +1' });
  if (stat === 'cool' && (sit.has('injury') || sit.has('threat')) && earnedOf(op, 'scarred')) out.push({ value: 1, note: 'Scarred +1' });
  if (stat === 'stealth' && sit.has('entry') && !sit.has('escape') && earnedOf(op, 'light_fingered')) out.push({ value: 1, note: 'Light-Fingered +1' });
  if (stat === 'social' && sit.has('crowd') && earnedOf(op, 'crowd_reader')) out.push({ value: 1, note: 'Crowd Reader +1' });
  if (stat === 'tech' && sit.has('street-tech') && !sit.has('corp-tech') && earnedOf(op, 'wirewise')) out.push({ value: 1, note: 'Wirewise +1' });
  if (stat === 'combat' && sit.has('fight') && (job.injured ?? []).length && earnedOf(op, 'corner_fighter')) out.push({ value: 1, note: 'Corner Fighter +1' });
  if (stat === 'cool' && sit.has('police') && earnedOf(op, 'rattled_by_sirens')) out.push({ value: -1, note: 'Rattled by Sirens −1' });
  if (earnedOf(op, 'short_fuse')) {
    if (stat === 'combat' && (sit.has('threat') || sit.has('fight'))) out.push({ value: 1, note: 'Short Fuse +1' });
    if (stat === 'social' && sit.has('threat')) out.push({ value: -1, note: 'Short Fuse −1' });
  }
  if (sit.has('neural') && earnedOf(op, 'burned_out')) out.push({ value: -1, note: 'Burned Out (neural work) −1' });
  if (earnedOf(op, 'overconfident')) {
    if ((job.difficulty ?? 0) >= 6) out.push({ value: 1, note: 'Overconfident +1' });
    if (job.safest) out.push({ value: -1, note: 'Overconfident (thinks this beneath them) −1' });
  }
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
 * How much a moment counts towards a trait (the squad run, retuned 2026-10-27, the owner's ratio):
 * a crisis roll 1, a save or patch-up a half, a small incident a quarter. Counts below are weighted
 * sums; a threshold of 4 is four crisis rolls, or sixteen incidents.
 */
export const WEIGHT = { crisis: 1, save: 0.5, incident: 0.25 };
export const weightOf = (e) => (e.incident ? WEIGHT.incident : e.kind === 'save' ? WEIGHT.save : WEIGHT.crisis);
const weigh = (xs) => xs.reduce((n, e) => n + weightOf(e), 0);

/**
 * After a job: count what each of the crew did, earn and fade. Mutates the (cloned) state.
 * events: the run's record (mission.js); outcome: 'completed' | 'aborted' | 'loss'.
 * crewIds: everyone on the job, outside (overwatch, Wheels, standby) included.
 * Counts are weighted (weightOf); whether a job was clean, failed or theirs (streaks, Client's
 * Favourite, Clean Professional, Overconfident, Second Wind) still reads the crisis rolls only.
 */
export function afterJob(state, { events, district, clientId, outcome, crewIds }) {
  const crew = crewIds.map((id) => state.crew.find((o) => o.id === id)).filter((o) => o && !o.freelance);
  const done = outcome === 'completed';
  const all = events.filter((e) => (e.kind === 'roll' || e.kind === 'save' || (e.kind === 'critical' && e.action === 'stabilise')) && e.actor);
  const rolls = all.filter((e) => !e.incident && e.kind !== 'save');
  const hurt = new Set(events.filter((e) => e.injury).map((e) => e.injury.id));

  for (const op of crew) {
    const t = track(op);
    const mine = rolls.filter((e) => e.actor.id === op.id); // crisis rolls: what makes a job clean, failed or theirs
    const every = all.filter((e) => e.actor.id === op.id); // with incidents and saves, for the weighted counts
    const heatOf = (e) => (e.outcomeCost?.heat ?? 0) + (e.choiceCost?.heat ?? 0);
    const causedHeat = mine.some((e) => heatOf(e) > 0);
    const failed = mine.some((e) => !e.success);
    const contributed = mine.some((e) => e.success); // made at least one roll count on this job
    const wasHurt = hurt.has(op.id);

    // Steady Under Fire: cool or combat rolls passed once someone else was already hurt.
    let hurtSoFar = false;
    for (const e of events) {
      if (e.actor?.id === op.id && (e.kind === 'roll' || e.kind === 'save') && e.success && ['cool', 'combat'].includes(e.stat) && hurtSoFar) t.steadyFire = (t.steadyFire ?? 0) + weightOf(e);
      if (e.injury && e.injury.id !== op.id) hurtSoFar = true;
    }
    if ((t.steadyFire ?? 0) >= NEEDS.steadyUnderFire) earn(state, op, 'steady_under_fire');

    t.medPasses = (t.medPasses ?? 0) + weigh(every.filter((e) => e.stat === 'medical' && e.success));
    if (t.medPasses >= NEEDS.clinicHands) earn(state, op, 'clinic_hands');

    const sitOf = (e) => new Set(e.situations ?? []);
    t.cleanDrives = (t.cleanDrives ?? 0) + weigh(every.filter((e) => e.stat === 'driving' && e.success && sitOf(e).has('escape') && !heatOf(e) && !e.injury));
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

    // Group 2: what they did in which kind of situation.
    const passes = (stats, sit) => weigh(every.filter((e) => e.success && stats.includes(e.stat) && sitOf(e).has(sit)));
    const fails = (stats, sit) => weigh(every.filter((e) => !e.success && stats.includes(e.stat) && sitOf(e).has(sit)));
    t.entryPasses = (t.entryPasses ?? 0) + weigh(every.filter((e) => e.success && e.stat === 'stealth' && sitOf(e).has('entry') && !sitOf(e).has('escape')));
    if (t.entryPasses >= NEEDS.lightFingered) earn(state, op, 'light_fingered');
    t.crowdPasses = (t.crowdPasses ?? 0) + passes(['social', 'cool'], 'crowd');
    if (t.crowdPasses >= NEEDS.crowdReader) earn(state, op, 'crowd_reader');
    t.streetTechPasses = (t.streetTechPasses ?? 0) + weigh(every.filter((e) => e.success && e.stat === 'tech' && sitOf(e).has('street-tech') && !sitOf(e).has('corp-tech')));
    if (t.streetTechPasses >= NEEDS.wirewise) earn(state, op, 'wirewise');
    t.fightPasses = (t.fightPasses ?? 0) + passes(['combat'], 'fight');
    if (t.fightPasses >= NEEDS.cornerFighter) earn(state, op, 'corner_fighter');

    // Rattled by Sirens: comes from failing in front of the police, goes from facing them down.
    const rattled = earnedOf(op, 'rattled_by_sirens');
    if (rattled) {
      rattled.faced = (rattled.faced ?? 0) + weigh(every.filter((e) => e.success && sitOf(e).has('police')));
      if (rattled.faced >= NEEDS.rattledFaced) fade(state, op, rattled, 'faced the police down');
    } else {
      t.policeFails = (t.policeFails ?? 0) + weigh(every.filter((e) => !e.success && sitOf(e).has('police')));
      if (t.policeFails >= NEEDS.rattledFails) earn(state, op, 'rattled_by_sirens');
    }

    // Short Fuse: talking or keeping cool failed when someone squared up; calm jobs settle it.
    const fuse = earnedOf(op, 'short_fuse');
    if (fuse) {
      if (done && !mine.some((e) => e.stat === 'combat')) {
        fuse.calm = (fuse.calm ?? 0) + 1;
        if (fuse.calm >= NEEDS.fuseCalmJobs) fade(state, op, fuse, 'three jobs without a fight');
      }
    } else {
      t.threatFails = (t.threatFails ?? 0) + fails(['social', 'cool'], 'threat');
      if (t.threatFails >= NEEDS.fuseFails) earn(state, op, 'short_fuse');
    }

    // Burned Out: tech or neural work failing them, within three jobs.
    t.techFails = [...(t.techFails ?? []), weigh(every.filter((e) => !e.success && (e.stat === 'tech' || sitOf(e).has('neural'))))].slice(-NEEDS.burnoutJobs);
    if (t.techFails.reduce((n, x) => n + x, 0) >= NEEDS.burnoutFails) earn(state, op, 'burned_out');

    // Overconfident: hard rolls going their way, one after another; any failure resets.
    for (const e of mine.filter((x) => x.kind === 'roll')) {
      if (!e.success) t.hardStreak = 0;
      else if (e.need - 10 >= 6) t.hardStreak = (t.hardStreak ?? 0) + 1;
    }
    const over = earnedOf(op, 'overconfident');
    if (over && (failed || wasHurt)) fade(state, op, over, failed ? 'a roll went wrong' : 'got hurt');
    else if ((t.hardStreak ?? 0) >= NEEDS.overconfident && !over) earn(state, op, 'overconfident');

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
    const burned = earnedOf(op, 'burned_out');
    if (burned && state.day - Math.max(t.lastWorked ?? burned.day, burned.day) >= NEEDS.burnoutRestDays) fade(state, op, burned, 'three days of proper rest');
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
