// Halls (DESIGN.md 2026-11-05, the tong's Phase 2, slice 1): the safehouse becomes one hall of
// several, one per district. Each hall has beds, rent and a level; every runner lives in one
// (op.hall), and who sleeps there is the tong's presence in that district. The roster limit is all
// the beds, and the rent all the halls' rent: state.rosterCap and state.rent stay as those totals
// (syncHalls), so hiring and Sunday's bill read them as before. The tong's rank follows the halls.
// Moving into another hall takes the day, not the trip: they count there at once, but are
// settling in and can't work until tomorrow (the city crosses in under an hour). Pure logic.

import { HALL_SITES, HALL_EXPANSION, HOME_HALL } from '../data/halls.js';
import { NAMES } from '../config/names.js';
import { trustOf } from './clients.js';
import { CLIENTS } from '../data/clients.js';
import { TONG_RANKS } from '../data/tong.js';
import { money } from './money.js';
import { PIECES, ROOM_EFFECT } from '../data/hallBuild.js';

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
export const homeHall = (beds, rent) => ({ district: HOME_HALL, beds, rent, level: 1, opened: 1, build: [] });

/** Can the tong open a hall here now? { ok, reason, site }. */
export function canOpenHall(state, district) {
  const site = HALL_SITES[district];
  if (!site || site.deposit == null) return { ok: false, reason: 'No hall to be had there', site };
  if (hallIn(state, district)) return { ok: false, reason: 'We already have a hall there', site };
  const contact = CLIENTS.find((c) => c.id === site.contact);
  if ((state.reputation ?? 0) < site.rep) return { ok: false, reason: `Needs reputation ${site.rep}`, site };
  if (trustOf(state, site.contact) < site.trust) return { ok: false, reason: `${contact?.name ?? 'The contact'} needs to trust us more (${site.trust})`, site };
  if (state.cash < site.deposit) return { ok: false, reason: `Needs ${money(site.deposit)} for the deposit`, site };
  return { ok: true, reason: 'ready', site };
}

/** Open a hall in a district: pay the deposit; it starts small. Returns the new state, or prev. */
export function openHall(prev, district) {
  if (!canOpenHall(prev, district).ok) return prev;
  const state = structuredClone(prev);
  const site = HALL_SITES[district];
  state.cash -= site.deposit;
  state.halls = [...(state.halls ?? []), { district, beds: site.beds, rent: site.rent, level: 1, opened: state.day, build: [] }];
  syncHalls(state);
  const contact = CLIENTS.find((c) => c.id === site.contact);
  state.inbox.unshift({
    id: `hall-${district}-${state.day}`, type: 'finance', day: state.day,
    subject: `A hall in ${districtInText(district)}`,
    body: `${contact?.name ?? 'Our contact'} put in a word, and we've taken ${site.place}. ${site.beds} beds, ${money(site.rent)} a week. Paid ${money(site.deposit)}. Nobody lives there yet: move someone in from their page on the Crew screen.`,
    blocking: false, read: false,
  });
  return state;
}

/** What expanding a hall would cost and give. */
export function nextHallExpansion(state, district) {
  const h = hallIn(state, district);
  if (!h) return null;
  return { cost: HALL_EXPANSION.costPerLevel * h.level, beds: HALL_EXPANSION.beds, rentIncrease: HALL_EXPANSION.rent, level: h.level + 1 };
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
    body: `We took over the rooms next door. Paid ${money(x.cost)}. Rent for the hall is now ${money(h.rent)} a week.`, blocking: false, read: false,
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

/**
 * Mondays: a district's contact offers the tong a place once it's welcome there (reputation and
 * trust met; money comes later). Once per district (state.hallOffers). Mutates the (cloned) state.
 */
export function introduceHalls(state) {
  state.hallOffers = state.hallOffers ?? [];
  for (const [district, site] of Object.entries(HALL_SITES)) {
    if (site.deposit == null || hallIn(state, district) || state.hallOffers.includes(district)) continue;
    if ((state.reputation ?? 0) < site.rep || trustOf(state, site.contact) < site.trust) continue;
    state.hallOffers.push(district);
    const contact = CLIENTS.find((c) => c.id === site.contact);
    state.inbox.unshift({
      id: `hall-offer-${district}`, type: 'crew', kind: 'hall-offer', day: state.day,
      subject: `${contact?.name ?? 'A contact'} has a place for us in ${districtInText(district)}`,
      body: `${contact?.name ?? 'They'} can put us in ${site.place}: ${site.beds} beds, ${money(site.rent)} a week, ${money(site.deposit)} down. A hall there means people of ours living in ${districtInText(district)}, more rent, and somewhere else to look after. No rush; the offer stands.`,
      payload: { district }, blocking: false, read: false,
    });
  }
  return state;
}
