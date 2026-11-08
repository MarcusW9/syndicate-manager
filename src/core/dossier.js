// A rival's name as a possible signing (C3a; DESIGN.md 2026-11-08 "C3 designed"; proposal C.13).
// `dossierOf` builds a card's full runner on demand from a hash (never saved), `scoutTrip` sharpens
// what the player sees, `approachFor` works out what signing costs, `signCard` does it, and
// `operativeToCard` is the way back (part D). Persuasion is a pure score, never a roll: the price is
// shown and the price is paid. Nothing here moves state.rngCounter (hashRng only).

import { hashRng, pick } from './rng.js';
import { ROLE_PROFILES, HANDLES, BADGE_COLORS } from '../data/recruitPools.js';
import { RIVALS, SCOUT_TEXT, fill } from '../data/rivals.js';
import { availability } from './crew.js';
import { rollPotential, rollScoutError, potentialBand, primaryStat } from './development.js';
import { marketWage, round50 } from './pricing.js';
import { ratingOf, cardRating, ratingWord, TIER_BONUS } from './rating.js';
import { freshRecord } from './record.js';
import { pickTraits, recruitToOperative } from './recruits.js';
import { hallWithRoom, freeBeds } from './halls.js';
import { HOME_HALL } from '../data/halls.js';
import { crewLead } from './lead.js';
import { rankForHalls } from './tong.js';
import { TONG_RANKS } from '../data/tong.js';
import { NAMES } from '../config/names.js';
import { money } from './money.js';

const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
const STAT_KEYS = ['combat', 'stealth', 'tech', 'social', 'driving', 'medical', 'cool'];
const slug = (name) => name.toLowerCase().replace(/&/g, '').replace(/[^a-z]+/g, '-').replace(/^-|-$/g, '');
const tongOf = (r, id) => (r?.tongs ?? []).find((t) => t.id === id) ?? null;

/** A card by its id or by the slug of its name (the view's id, which has no digits). */
export function findCard(state, ref) {
  const cards = state.rivals?.cards ?? [];
  return cards.find((c) => c.id === ref) ?? cards.find((c) => slug(c.name) === ref) ?? null;
}
export const cardSlug = (card) => slug(card.name);

/** The tier a card signs as, from its rating (a rookie, a pro or a veteran). */
export const tierForRating = (rating) => (rating < 30 ? 'rookie' : rating < 55 ? 'pro' : 'veteran');

// What a card's name already carries: standing, fame and a record, capped at Respected so nobody
// is signed as Elite (fame and a Legend are earned here). The rating's other parts then fit it.
const CAREER_STANDING = { unknown: 5, known: 25, respected: 50 };
function careerOf(card) {
  const fame = card.fame === 'elite' ? 'respected' : card.fame;
  const jobs = clamp(Math.min((card.age - 18) * 4, Math.round(cardRating(card) * 1.5)), 0, 120); // a low rating can't carry a long record
  return { fame, standing: CAREER_STANDING[fame] ?? 5, record: { ...freshRecord(), jobs, clean: Math.round(jobs * 0.6), wins: Math.round(jobs * 0.8) } };
}

/** The stats a card would have as a runner, fitted so ratingOf matches the card's rating within a point or two. */
function statsFor(card, career, rng) {
  const tier = tierForRating(cardRating(card));
  const profile = ROLE_PROFILES[card.role];
  const [sec1, sec2] = profile.secondary;
  const probe = { role: card.role, tier, fame: career.fame, standing: career.standing, record: career.record };
  const fits = [];
  let best = null;
  for (let main = 4; main <= 20; main++) {
    for (let high = 3; high <= main; high++) {
      for (const low of [high, high - 1]) {
        if (low < 1) continue;
        const stats = {};
        for (const k of STAT_KEYS) stats[k] = 2;
        stats[profile.primary] = main; stats[sec1] = high; stats[sec2] = low;
        const diff = Math.abs(ratingOf({ ...probe, stats }) - cardRating(card));
        if (!best || diff < best.diff) best = { diff, stats };
        if (diff <= 1) fits.push(stats);
      }
    }
  }
  const stats = { ...(fits.length ? fits[Math.floor(rng() * fits.length)] : best.stats) };
  // The four stats outside the role's own: low, never above the second-best one.
  const cap = Math.min(8, stats[sec2]);
  for (const k of STAT_KEYS) if (![profile.primary, sec1, sec2].includes(k)) stats[k] = clamp(2 + Math.floor(rng() * (cap - 1)), 1, cap);
  return stats;
}

/** How wrong the read of this name's ceiling is, by how many trips have been made. */
export function scoutErrorAt(state, card, level) {
  const full = rollScoutError(hashRng(state.seed, 'scout-error', card.id));
  return level >= RIVALS.scoutMax ? 0 : level === 2 ? clamp(full, -1, 1) : full;
}
export const scoutLevel = (state, card) => state.rivals?.scouted?.[card.id] ?? 0;

/** The full runner for a card: same card, same runner, every time. Not saved. Recruit-shaped, so signing reuses recruitToOperative. */
export function dossierOf(state, card) {
  const rng = hashRng(state.seed, 'dossier', card.id);
  const career = careerOf(card);
  const tier = tierForRating(cardRating(card));
  const stats = statsFor(card, career, rng);
  const taken = new Set([...state.crew, ...state.memorial].map((o) => o.handle));
  const free = HANDLES.filter((h) => !taken.has(h));
  const handle = (free.length ? pick(rng, free) : pick(rng, HANDLES));
  const district = NAMES.districtsInText?.[card.home] ?? NAMES.districtsInText?.oldTown;
  const tong = tongOf(state.rivals, card.tongId);
  const potential = rollPotential(hashRng(state.seed, 'dossier-pot', card.id), stats, tier, card.role);
  return {
    id: `x${card.id}`, name: card.name, handle, age: card.age, role: card.role, stats, quality: tier, potential,
    traits: pickTraits(hashRng(state.seed, 'dossier-traits', card.id)),
    color: pick(rng, BADGE_COLORS), culture: 'rival',
    origin: `Came up round ${district}${tong ? `, last with ${tong.name}` : ', between tongs'}.`, bio: '',
    wage: marketWage({ role: card.role, stats }), haggled: true, brings: [],
    scoutError: 0, career,
  };
}

// --- Scouting ---

export const SCOUT_DAYS = 2;

/** One scout trip's roll: a hash at the side-task difficulty on the scout's social stat. Mutates the (cloned) state; true on a good trip. */
function applyScout(state, card, op) {
  const level = scoutLevel(state, card);
  const roll = 1 + Math.floor(hashRng(state.seed, 'scout-trip', card.id, level, state.day)() * 20);
  const ok = roll + (op.stats.social ?? 0) >= 10 + 6; // SIDE_DIFFICULTY (core/sidetasks.js)
  const r = state.rivals;
  r.scouted = { ...(r.scouted ?? {}) };
  if (ok) r.scouted[card.id] = level + 1;
  r.lastScout = { cardId: card.id, ok, day: state.day };
  return ok;
}

/**
 * One scout trip by `opId` on a name, at once (what the two-day side task does when the scout is back;
 * kept for tests and tools). A success raises the level (to 3); a failure tells them nothing.
 * `state.rivals.lastScout` says how it went. Returns the new state, or prev.
 */
export function scoutTrip(prev, ref, opId) {
  const card = findCard(prev, ref);
  const op = prev.crew.find((o) => o.id === opId);
  if (!card || !op || scoutLevel(prev, card) >= RIVALS.scoutMax) return prev;
  const state = structuredClone(prev);
  applyScout(state, findCard(state, ref), state.crew.find((o) => o.id === opId));
  return state;
}

/**
 * Send someone to watch a name for two days: a side task (the scout is away, `state.sideOut` carries it,
 * and core/sidetasks.js hands it to `resolveScout` when they're back). One scout per name at a time.
 */
export function sendScout(prev, ref, opId) {
  const card = findCard(prev, ref);
  const op = prev.crew.find((o) => o.id === opId);
  if (!card || !op || op.freelance || !availability(prev, op).ok || scoutLevel(prev, card) >= RIVALS.scoutMax) return prev;
  if ((prev.sideOut ?? []).some((s) => s.scout === card.id)) return prev;
  const state = structuredClone(prev);
  const returnDay = state.day + SCOUT_DAYS;
  state.crew.find((o) => o.id === opId).condition.awayUntil = returnDay;
  state.sideOut = [...(state.sideOut ?? []), { taskId: 'scout', scout: card.id, crewIds: [opId], returnDay }];
  state.inbox.unshift({ id: `scout-sent-${card.id}-${state.day}`, type: 'job', day: state.day, subject: fill(SCOUT_TEXT.sent.subject, { op: op.handle, name: card.name }), body: fill(SCOUT_TEXT.sent.body, { op: op.handle, name: card.name }), blocking: false, read: true });
  return state;
}

/** A scout is back (core/sidetasks.js returnSideTasks): the trip's result, and a message. Mutates the (cloned) state. */
export function resolveScout(state, entry) {
  const op = state.crew.find((o) => o.id === entry.crewIds[0]);
  const card = findCard(state, entry.scout);
  if (!op) return;
  const v = { op: op.handle, name: card?.name ?? 'them' };
  let key = 'gone';
  if (card) key = applyScout(state, card, op) ? 'ok' : 'miss';
  state.inbox.unshift({ id: `scout-back-${entry.scout}-${state.day}`, type: 'job', day: state.day, subject: fill(SCOUT_TEXT[key].subject, v), body: fill(SCOUT_TEXT[key].body, v), blocking: false, read: false });
}

/** What the player may see of a name at the level scouted: keys and values only (never more than the level allows). */
export function readFor(state, card) {
  const level = scoutLevel(state, card);
  const d = dossierOf(state, card);
  const tong = tongOf(state.rivals, card.tongId);
  const from = tongOf(state.rivals, card.fromTong);
  const out = { id: slug(card.name), name: card.name, role: card.role, fame: card.fame, word: ratingWord(cardRating(card), card), home: card.home, tong: tong?.name ?? null, from: from?.name ?? null, head: !!tong && tong.headId === card.id, level: ['none', 'seen', 'sharper', 'full'][level], stats: null, potential: null };
  if (level >= 1) {
    out.stats = { ...d.stats };
    out.potential = potentialBand({ ...d, scoutError: scoutErrorAt(state, card, level) });
  }
  return out;
}

// --- Persuasion, buyout, price ---

const bills = (state) => state.crew.reduce((n, o) => n + (o.freelance ? 0 : o.wage), 0) + (state.rent ?? 0);

/**
 * How persuasive the tong is to this name, 0-100 (hidden: the screen shows words and the price):
 * its tier, Legends and Elites on the crew, a leader, a free bed (in their district best) and cash
 * to cover it, less what a good name asks of us. The premium is what they want over the market wage.
 */
export function persuasion(state, card) {
  const rank = TONG_RANKS.findIndex((k) => k.id === rankForHalls((state.halls ?? []).length).id);
  const crew = state.crew.filter((o) => !o.freelance && o.condition?.injury !== 'dead');
  const stars = crew.filter((o) => o.fame === 'legend' || o.fame === 'elite').length;
  const lead = crewLead(crew) ? 10 : 0;
  const bed = freeBeds(state, card.home) > 0 ? 16 : hallWithRoom(state) ? 6 : 0;
  const d = dossierOf(state, card);
  const tong = tongOf(state.rivals, card.tongId);
  const needed = round50(d.wage) + (tong ? buyoutFeeFor(state, card, d) : 0);
  const spare = state.cash - needed - 4 * bills(state);
  const cash = clamp(Math.round(20 * (state.cash - needed) / Math.max(1, 4 * bills(state) + 1)) , 0, 20);
  const parts = { tier: 7.5 * rank, stars: Math.min(3, stars) * 8, lead, bed, cash: spare >= 0 ? 20 : cash };
  const score = clamp(Math.round(Object.values(parts).reduce((n, v) => n + v, 0) - 0.3 * cardRating(card)), 0, 100);
  return { score, premium: Math.round(RIVALS.premiumMax * (1 - score / 100) * 100) / 100, parts };
}

function buyoutFeeFor(state, card, d) {
  const tong = tongOf(state.rivals, card.tongId);
  if (!tong || card.id === tong.headId) return 0;
  const B = RIVALS.buyout;
  const rich = Math.min(B.richCap, Math.floor(tong.wealth / B.richStep) * B.richPer);
  const regard = tong.regard ?? 0;
  const mood = regard <= RIVALS.regard.cold ? B.cold : regard >= RIVALS.regard.warm ? B.warm : 1;
  return round50(d.wage * B.weeks * (1 + rich) * mood);
}

/** The buyout owed to the tong a name is in; 0 for a free name; null for a head (never approachable). */
export function buyoutFor(state, card) {
  const tong = tongOf(state.rivals, card.tongId);
  if (tong && card.id === tong.headId) return null;
  return tong ? buyoutFeeFor(state, card, dossierOf(state, card)) : 0;
}

/**
 * What signing this name would take: { ok, reason, wage (with the premium), base (market), premium, fee
 * (the signing fee, a week's wage), buyout, total, shown (the wage the screen shows at this scouting
 * level: a ±25% guess before any trip) }. reason: 'head' | 'no_bed' | 'no_cash' | 'not_yet' | 'gone'.
 */
export function approachFor(state, ref) {
  const card = findCard(state, ref);
  if (!card) return { ok: false, reason: 'gone' };
  const buyout = buyoutFor(state, card);
  if (buyout == null) return { ok: false, reason: 'head' };
  const d = dossierOf(state, card);
  const p = persuasion(state, card);
  const wage = round50(d.wage * (1 + p.premium));
  const guess = 1 + (hashRng(state.seed, 'wage-guess', card.id)() * 0.5 - 0.25);
  const shown = scoutLevel(state, card) >= 2 ? wage : round50(wage * guess);
  const out = { base: d.wage, premium: p.premium, wage, fee: wage, buyout, total: wage + buyout, shown, ok: true, reason: null };
  if (!hallWithRoom(state)) return { ...out, ok: false, reason: 'no_bed' };
  if (state.cash < out.total) return { ...out, ok: false, reason: 'no_cash' };
  if (p.score < RIVALS.notYet) return { ...out, ok: false, reason: 'not_yet' };
  return out;
}

// --- Signing and leaving ---

/** The runner a card becomes (C.3): the dossier's stats and potential, the read it was signed on, the career it carries. */
export function cardToOperative(state, card, { wage, level = scoutLevel(state, card) } = {}) {
  const d = dossierOf(state, card);
  const r = { ...d, wage: wage ?? d.wage, scoutError: scoutErrorAt(state, card, level), scoutReport: '' };
  delete r.career;
  const op = recruitToOperative(r, {
    condition: { fatigue: 0, morale: 60, neuralLoad: 0, burnout: 0, injury: 'healthy', injuryDays: 0 },
    history: [`Day ${state.day}: joined the crew`],
  });
  op.fame = d.career.fame; op.standing = d.career.standing; op.record = d.career.record;
  return op;
}

/** A runner as a card (part D: someone leaving): the same rating within a point or two. */
export function operativeToCard(state, op) {
  const rating = ratingOf(op);
  return { id: `op:${op.id}`, name: op.name, tongId: null, home: op.hall ?? HOME_HALL, role: op.role, rating, age: op.age, peak: clamp(rating + 8, rating, 95), form: 0, fame: op.fame ?? 'unknown', since: state.day };
}

/**
 * Sign a name: pay the signing fee and any buyout (the buyout goes to the tong), put them in a bed, take
 * them off the cards, and cool the tong's regard for a poach. Returns the new state, or prev if it can't be done.
 */
export function signCard(prev, ref) {
  const a = approachFor(prev, ref);
  if (!a.ok) return prev;
  const state = structuredClone(prev);
  const card = findCard(state, ref);
  const tong = tongOf(state.rivals, card.tongId);
  state.cash -= a.total;
  const op = cardToOperative(state, card, { wage: a.wage });
  op.hall = hallWithRoom(state) ?? HOME_HALL;
  state.crew.push(op);
  const r = state.rivals;
  r.cards = r.cards.filter((c) => c.id !== card.id);
  if (r.offer?.cardId === card.id) r.offer = null;
  if (tong) {
    tong.wealth += a.buyout;
    tong.regard = clamp((tong.regard ?? 0) + RIVALS.regard.poach, RIVALS.regard.min, RIVALS.regard.max);
  }
  state.inbox.unshift({
    id: `signed-${card.id}-${state.day}`, type: 'crew', day: state.day,
    subject: `${op.handle} joins the crew`,
    body: `${op.name} signed for ${money(a.wage)} a week${a.premium > 0 ? ' (a bit more than their worth, to be convinced)' : ''}. Signing fee ${money(a.fee)}${a.buyout ? `, and ${money(a.buyout)} to ${tong.name} for letting them go` : ''}.`,
    blocking: false, read: false,
  });
  return state;
}
