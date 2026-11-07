// Halls (DESIGN.md 2026-11-05, the tong's Phase 2, slice 1): the safehouse becomes one hall of
// several, one per district. Each hall has beds, rent and a level; every runner lives in one
// (op.hall), and who sleeps there is the tong's presence in that district. The roster limit is all
// the beds, and the rent all the halls' rent: state.rosterCap and state.rent stay as those totals
// (syncHalls), so hiring and Sunday's bill read them as before. The tong's rank follows the halls.
// Moving into another hall takes the day, not the trip: they count there at once, but are
// settling in and can't work until tomorrow (the city crosses in under an hour). Pure logic.

import { HALL_SITES, HALL_EXPANSION, HOME_HALL, OPENING, HALL_BUY } from '../data/halls.js';
import { addOffer, jobUnlocked, templateById } from './jobs.js';
import { hashRng, pick } from './rng.js';
import { NAMES } from '../config/names.js';
import { trustOf } from './clients.js';
import { CLIENTS } from '../data/clients.js';
import { TONG_RANKS } from '../data/tong.js';
import { money } from './money.js';
import { PIECES, ROOM_EFFECT } from '../data/hallBuild.js';
import { HALLS } from '../data/sites.js';

const districtName = (d) => NAMES.districts?.[d] ?? d;
const districtInText = (d) => NAMES.districtsInText?.[d] ?? districtName(d);
const living = (state) => state.crew.filter((o) => !o.freelance && o.condition?.injury !== 'dead');

/** Does a hall have this room built (data/hallBuild.js)? */
export const hasRoom = (hall, id) => !!hall?.build?.some((b) => b.piece === id && PIECES[id]?.kind === 'room');
/** A hall's beds: its own, and a bunk room's. */
export const bedsOf = (hall) => (hall?.beds ?? 0) + (hasRoom(hall, 'bunks') ? ROOM_EFFECT.bunkBeds : 0);
/** The hall someone lives in, while they're at home (not out on a job or freelance). */
export const homeOf = (state, op) => (op.freelance || (op.condition?.awayUntil ?? 0) > state.day ? null : (state.halls ?? []).find((h) => h.district === (op.hall ?? HOME_HALL)) ?? null);

/** The tong's hall in a district, or null. */
export const hallIn = (state, district) => (state.halls ?? []).find((h) => h.district === district) ?? null;

/** Who lives in a hall: the tong's presence there. Freelancers sleep elsewhere. */
export const residents = (state, district) => living(state).filter((o) => (o.hall ?? HOME_HALL) === district);

/** Free beds in a hall. */
export const freeBeds = (state, district) => {
  const h = hallIn(state, district);
  return h ? Math.max(0, bedsOf(h) - residents(state, district).length) : 0;
};

/** The hall a new hire moves into: home first, then whichever has room. Null when every bed is taken. */
export const hallWithRoom = (state) => [...(state.halls ?? [])].sort((a, b) => (a.district === HOME_HALL ? -1 : b.district === HOME_HALL ? 1 : 0)).find((h) => freeBeds(state, h.district) > 0)?.district ?? null;

/** Keep the totals and the rank in step with the halls: beds, rent, and one rank per hall. */
export function syncHalls(state) {
  const halls = state.halls ?? [];
  state.rosterCap = halls.reduce((n, h) => n + bedsOf(h), 0);
  state.rent = halls.reduce((n, h) => n + h.rent, 0);
  state.rank = TONG_RANKS[Math.min(TONG_RANKS.length, Math.max(1, halls.length)) - 1].id;
  return state;
}

/** The first hall, from a new game's safehouse: Old Town, with its beds and rent. */
export const homeHall = (beds, rent) => ({ district: HOME_HALL, beds, rent, level: 1, opened: 1, build: [], owned: false });

/** Can the tong open a hall here now? { ok, reason, site }. */
export function canOpenHall(state, district) {
  const site = HALL_SITES[district];
  if (!site || site.deposit == null) return { ok: false, reason: 'No hall to be had there', site };
  if (hallIn(state, district)) return { ok: false, reason: 'We already have a hall there', site };
  const contact = CLIENTS.find((c) => c.id === site.contact);
  if ((state.reputation ?? 0) < site.rep) return { ok: false, reason: `Needs reputation ${site.rep}`, site };
  if (!trusted(state, site)) return { ok: false, reason: `${contact?.name ?? 'The contact'} needs to trust us more (${site.trust})`, site };
  // An opening job first (2026-11-06): the contact asks a favour before offering the place.
  const opening = openingOf(state, district);
  if (site.opening && opening?.status !== 'done') {
    const who = site.introducer ?? CLIENTS.find((c) => c.id === site.contact)?.name ?? 'Our contact';
    const job = opening?.jobId ? state.jobs.find((j) => j.id === opening.jobId) : null;
    const name = templateById(job?.templateId ?? site.opening)?.name;
    return { ok: false, reason: opening?.status === 'asked' ? `${who} wants a favour first: ${name}, on the board` : opening?.status === 'failed' ? `${who} will ask again by day ${opening.retryDay}` : `${who} will ask a favour first`, site };
  }
  if (state.cash < site.deposit) return { ok: false, reason: `Needs ${money(site.deposit)} for the deposit`, site };
  return { ok: true, reason: 'ready', site };
}

/** Open a hall in a district: pay the deposit; it starts small. Returns the new state, or prev. */
export function openHall(prev, district) {
  if (!canOpenHall(prev, district).ok) return prev;
  const state = structuredClone(prev);
  const site = HALL_SITES[district];
  state.cash -= site.deposit;
  state.halls = [...(state.halls ?? []), { district, beds: site.beds, rent: site.rent, level: 1, opened: state.day, build: [], owned: false }];
  syncHalls(state);
  state.inbox.unshift({
    id: `hall-${district}-${state.day}`, type: 'finance', day: state.day,
    subject: `A hall in ${districtInText(district)}`,
    body: `${site.introducer ?? CLIENTS.find((c) => c.id === site.contact)?.name ?? 'Our contact'} put in a word, and we've taken ${site.place}. ${site.beds} beds, ${money(site.rent)} a week. Paid ${money(site.deposit)}. Nobody lives there yet: move someone in from their page on the Crew screen.`,
    blocking: false, read: false,
  });
  return state;
}

/** What expanding a hall would cost and give. */
export function nextHallExpansion(state, district) {
  const h = hallIn(state, district);
  if (!h) return null;
  // A compound (data/sites.js `parts`, 2026-11-07) expands by taking its next part, at that part's price; none left, no expanding.
  const site = HALLS[district];
  if (site?.parts) {
    const part = site.parts.find((p) => p.lvl === h.level + 1);
    return part ? { cost: part.cost, beds: HALL_EXPANSION.beds, rentIncrease: h.owned ? 0 : HALL_EXPANSION.rent, level: h.level + 1, part: part.id, partName: part.name } : null;
  }
  return { cost: HALL_EXPANSION.costPerLevel * h.level, beds: HALL_EXPANSION.beds, rentIncrease: h.owned ? 0 : HALL_EXPANSION.rent, level: h.level + 1 }; // a bought hall adds no rent
}

/** What buying a hall costs: HALL_BUY.weeks of its rent, once (2026-11-06). null if it's ours already. */
export function buyPrice(state, district) {
  const h = hallIn(state, district);
  return h && !h.owned && h.rent > 0 ? h.rent * HALL_BUY.weeks : null;
}

/** Buy a hall outright: pay the price, and its rent is gone for good. Returns the new state, or prev. */
export function buyHall(prev, district) {
  const price = buyPrice(prev, district);
  if (price == null || prev.cash < price) return prev;
  const state = structuredClone(prev);
  const h = hallIn(state, district);
  state.cash -= price;
  h.owned = true;
  h.rent = 0;
  syncHalls(state);
  state.inbox.unshift({
    id: `hall-buy-${district}-${state.day}`, type: 'finance', day: state.day,
    subject: `The ${districtName(district).replace(/^The /, '')} hall is ours`,
    body: `Paid ${money(price)} for the place. No more rent on it, ever, and making it bigger adds none.`, blocking: false, read: false,
  });
  return state;
}

/** Expand a hall: more beds, more rent. Returns the new state, or prev. */
export function expandHall(prev, district) {
  const x = nextHallExpansion(prev, district);
  if (!x || prev.cash < x.cost) return prev;
  const state = structuredClone(prev);
  const h = hallIn(state, district);
  state.cash -= x.cost;
  h.beds += x.beds;
  h.rent += x.rentIncrease;
  h.level = x.level;
  syncHalls(state);
  state.inbox.unshift({
    id: `hall-expand-${district}-${state.day}`, type: 'finance', day: state.day,
    subject: `${districtName(district)} hall expanded: ${h.beds} beds`,
    body: `${x.partName ? `${x.partName} is ours now.` : 'We took over the rooms next door.'} Paid ${money(x.cost)}. Rent for the hall is now ${money(h.rent)} a week.`, blocking: false, read: false,
  });
  return state;
}

/** Can this runner move into that hall today? { ok, reason }. */
export function canMove(state, opId, district) {
  const op = state.crew.find((o) => o.id === opId);
  if (!op || op.freelance) return { ok: false, reason: 'Not one of ours' };
  if (!hallIn(state, district)) return { ok: false, reason: 'No hall there' };
  if ((op.hall ?? HOME_HALL) === district) return { ok: false, reason: 'Already lives there' };
  if ((op.condition.awayUntil ?? 0) > state.day) return { ok: false, reason: 'Out on a job' };
  if (freeBeds(state, district) < 1) return { ok: false, reason: 'No free bed there' };
  if ((hallIn(state, district).shutUntil ?? 0) > state.day) return { ok: false, reason: 'Shut after a raid' };
  return { ok: true, reason: 'ready' };
}

/** Move a runner into another hall: they count there at once, and settle in for the rest of the day. */
export function moveToHall(prev, opId, district) {
  if (!canMove(prev, opId, district).ok) return prev;
  const state = structuredClone(prev);
  const op = state.crew.find((o) => o.id === opId);
  op.hall = district;
  op.settlingDay = state.day;
  return state;
}

/** Is this runner settling into a new hall today (busy: no work until tomorrow)? */
export const settlingIn = (state, op) => op.settlingDay === state.day;

// --- opening jobs (2026-11-06) ------------------------------------------------------------------
// Once the tong is welcome in a district (reputation and the contact's trust), the contact asks a
// favour first: the district's opening job (data/halls.js HALL_SITES opening; data/missions). Finish
// it and the hall is offered. Walk away, fail or let it go off the board, and two weeks later they
// ask again with one of their own jobs as the test. state.openings: { district: { status, jobId,
// retryDay } }, status 'asked' | 'failed' | 'done' (save v43).

/** Where a district's opening job stands, or null if nobody has asked yet. */
export const openingOf = (state, district) => state.openings?.[district] ?? null;

/** Is this offer (or run) a district's opening favour? The district, or null. */
export const openingFor = (state, jobId) => Object.entries(state.openings ?? {}).find(([, o]) => o.status === 'asked' && o.jobId === jobId)?.[0] ?? null;

const contactOf = (site) => CLIENTS.find((c) => c.id === site.contact);
/** Who makes the introduction: the hall's introducer (not a client), else its contact. */
const introducerOf = (site) => site.introducer ?? contactOf(site)?.name ?? null;
/** Does the contact trust us enough? Halls with an introducer have no trust check (trust: null). */
const trusted = (state, site) => site.trust == null || trustOf(state, site.contact) >= site.trust;
const stillOut = (state, jobId) => state.jobs.some((j) => j.id === jobId) || state.activeMission?.jobId === jobId || (state.awayJobs ?? []).some((j) => j.mission?.jobId === jobId);

/** The contact asks the favour: the job goes on the board (for two weeks) and a message says so. Mutates state. */
function askOpening(state, district, retry = false) {
  const site = HALL_SITES[district];
  const contact = contactOf(site);
  let templateId = site.opening;
  if (retry) {
    // The second ask is one of their own jobs, picked by the seed, as the test.
    const own = (contact?.jobs ?? []).filter((id) => templateById(id) && !templateById(id).routine && !templateById(id).opening && jobUnlocked(state, id));
    templateId = own.length ? pick(hashRng(state.seed, 'opening', district, state.day), own) : site.opening;
  }
  addOffer(state, templateId, { clientId: site.contact });
  const name = introducerOf(site);
  const job = state.jobs.at(-1);
  job.expiresDay = state.day + OPENING.boardDays;
  (state.openings ??= {})[district] = { status: 'asked', jobId: job.id, retry };
  const tpl = templateById(templateId);
  state.inbox.unshift({
    id: `opening-${district}-${state.day}`, type: 'job', kind: 'opening', day: state.day,
    subject: retry ? `${name ?? 'A contact'} will try us again` : `${name ?? 'A contact'} has a favour to ask`,
    body: retry
      ? `${name ?? 'They'} still has a place for us in ${districtInText(district)}, and one more test: ${tpl.name}. It's on the board for two weeks. Finish it, and the place is ours to take.`
      : `${name ?? 'They'} could put us in ${site.place}, but wants to see how we work first: ${tpl.name}. It's on the board for two weeks. Finish it, and the place is ours to take.`,
    payload: { district, jobId: job.id }, blocking: false, read: false,
  });
}

/** The hall offer, once the favour is done. Mutates state. */
function offerHall(state, district) {
  const site = HALL_SITES[district];
  state.hallOffers = state.hallOffers ?? [];
  if (state.hallOffers.includes(district)) return;
  state.hallOffers.push(district);
  const name = introducerOf(site);
  state.inbox.unshift({
    id: `hall-offer-${district}`, type: 'crew', kind: 'hall-offer', day: state.day,
    subject: `${name ?? 'A contact'} has a place for us in ${districtInText(district)}`,
    body: `${name ?? 'They'} can put us in ${site.place}: ${site.beds} beds, ${money(site.rent)} a week, ${money(site.deposit)} down. A hall there means people of ours living in ${districtInText(district)}, more rent, and somewhere else to look after. No rush; the offer stands.`,
    payload: { district }, blocking: false, read: false,
  });
}

/**
 * A run has ended (core/mission.js finish): if it was a district's opening favour, finishing it
 * opens the way to the hall now; walking away or a death means they ask again in two weeks.
 * Returns a report line, or null. Mutates state.
 */
export function openingResult(state, jobId, outcome) {
  const district = openingFor(state, jobId);
  if (!district) return null;
  const site = HALL_SITES[district];
  const who = introducerOf(site) ?? 'Our contact';
  if (outcome === 'completed') {
    state.openings[district] = { status: 'done', jobId };
    offerHall(state, district);
    return { tone: 'good', text: `${who} has a place for us now: ${site.place}. It's on Crew › Halls.` };
  }
  state.openings[district] = { status: 'failed', jobId, retryDay: state.day + OPENING.retryDays };
  return { tone: 'warn', text: `${who} will ask again in two weeks.` };
}

/**
 * Mondays: once the tong is welcome in a district (reputation and the contact's trust), the contact
 * asks the opening favour; once it's done, the place is offered (state.hallOffers). A favour that
 * went off the board unfinished counts as walking away. Mutates the (cloned) state.
 */
export function introduceHalls(state) {
  state.hallOffers = state.hallOffers ?? [];
  state.openings = state.openings ?? {};
  for (const [district, site] of Object.entries(HALL_SITES)) {
    if (site.deposit == null || hallIn(state, district) || state.hallOffers.includes(district)) continue;
    if ((state.reputation ?? 0) < site.rep || !trusted(state, site)) continue;
    const o = state.openings[district];
    if (!site.opening || o?.status === 'done') { offerHall(state, district); continue; }
    if (!o) { askOpening(state, district); continue; }
    if (o.status === 'asked' && !stillOut(state, o.jobId)) state.openings[district] = { status: 'failed', jobId: o.jobId, retryDay: state.day + OPENING.retryDays };
    if (state.openings[district].status === 'failed' && state.day >= state.openings[district].retryDay) askOpening(state, district, true);
  }
  return state;
}
