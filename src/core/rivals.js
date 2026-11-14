// The other tongs (DESIGN.md 2026-11-08 "No league"; drafts/PROPOSAL-phase-3.md part C; slice C1).
// Peers, not gangs: they never raid, never touch heat, halls or opening favours. The player sees
// no table, rating or position: `rivalView` is the one view the UI reads (word keys, never
// sentences; no number values). Read-only for play: nothing here moves a roll, pay or heat.
//
// ISOLATION: everything here uses `hashRng` only, never `nextRng`, so `state.rngCounter` and every
// other roll stay exactly where they were. The weekly step runs on its own key, 'rivals:<day>'.
// Pure logic: 32-bit integer hashing over ASCII keys, whole numbers stored (C.1 rule 7).

import { hash, hashRng, pick } from './rng.js';
import { CULTURES, ROLE_PROFILES } from '../data/recruitPools.js';
import { NAMING, RIVAL_HOMES, RIVALS, STYLES, BRASS_ANCHOR, RESERVED_NAMES, THREAD_CONTINUES, FORMER_KINDS, BOOK_LEAD } from '../data/rivals.js';
import { cardRating, ratingOf, ratingWord, tierWord } from './rating.js';
import { rankForHalls } from './tong.js';
import { publishBook } from './book.js';
import { fameOf } from './fame.js';
import { TONG_RANKS } from '../data/tong.js';
import { NAMES } from '../config/names.js';

const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
const between = (rng, [lo, hi]) => lo + Math.floor(rng() * (hi - lo + 1));
const DAYS_PER_SEASON = 364;
const absWeek = (day) => Math.floor((day - 1) / 7);
const isSeasonEnd = (day) => (day - 1) % DAYS_PER_SEASON === DAYS_PER_SEASON - 1; // the Sunday before a new season
const slug = (name) => name.toLowerCase().replace(/&/g, '').replace(/[^a-z]+/g, '-').replace(/^-|-$/g, '');

function shuffle(rng, list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

// --- Halls, tiers ---

/** How many halls a tong's prestige and wealth support (1-5). */
export function hallsFor(prestige, wealth) {
  let n = 1;
  while (n < RIVALS.marks.length && prestige >= RIVALS.marks[n].prestige && wealth >= RIVALS.marks[n].wealth) n++;
  return n;
}
export const tongTier = (tong) => rankForHalls(tong.halls).id;

// --- Cards ---

const ageCurve = (age) => (age <= 24 ? 0.7 : age <= 29 ? 0.85 : age <= 37 ? 1 : age <= 44 ? 0.95 : 0.85);
const fameForRating = (r) => (r < 25 ? 'unknown' : r < 45 ? 'known' : r < 65 ? 'respected' : 'elite');

function makeName(rng, taken) {
  const ok = (s) => !RESERVED_NAMES.includes(s);
  for (let i = 0; i < 40; i++) {
    const culture = pick(rng, CULTURES);
    const given = pick(rng, culture.given.filter(ok));
    const name = `${given} ${pick(rng, culture.surnames.filter(ok))}`;
    if (!taken.has(name)) { taken.add(name); return name; }
  }
  return `${pick(rng, CULTURES[0].given)} ${pick(rng, CULTURES[0].surnames)}`;
}

function makeCard(r, rng, taken, { tong = null, home, day, head = false, young = false, base }) {
  r.seq += 1;
  const age = head ? between(rng, [40, 54]) : young ? between(rng, [18, 24]) : between(rng, [22, 50]);
  const peak = clamp(Math.round((base ?? 30 + rng() * 30) + (rng() * 20 - 5)), 12, 92);
  const rating = clamp(Math.round(peak * ageCurve(age)), 5, 95);
  return {
    id: `c${r.seq}`, name: makeName(rng, taken), tongId: tong, home, role: pick(rng, Object.keys(ROLE_PROFILES)),
    rating, age, peak, form: between(rng, [-2, 2]), fame: fameForRating(rating), since: day,
    runnerId: `c${r.seq}`, formerOf: null,
  };
}

// --- Seeding ---

function tongNameFor(rng, style, used) {
  for (let i = 0; i < 60; i++) {
    const kit = NAMING[style];
    if (style === 'street') {
      const place = pick(rng, kit.places);
      const name = `${place.name} ${pick(rng, kit.last)}`;
      if (!used.has(name)) return { name, home: place.home };
    } else {
      const name = `${pick(rng, kit.first)} ${pick(rng, kit.last)}`;
      if (!used.has(name)) return { name, home: null };
    }
  }
  return null;
}

/** A new set of rivals for this game, from hashRng(seed, 'rivals'). Same seed, same tongs. */
export function seedRivals(state) {
  const rng = hashRng(state.seed, 'rivals');
  const r = { tongs: [], cards: [], word: [], threads: [], book: null, seq: 0, playerRank: state.rank ?? null, offer: null, scouted: {}, lastScout: null, offerSeq: 0, nextOfferDay: 0 };
  const styles = shuffle(rng, [...STYLES, ...Array.from({ length: Math.max(0, RIVALS.tongs - STYLES.length) }, () => pick(rng, STYLES))]);
  const homes = shuffle(rng, [...RIVAL_HOMES, ...RIVAL_HOMES]);
  const usedNames = new Set(); const takenPeople = new Set((state.crew ?? []).map((o) => o.name));
  let h = 0;
  for (const style of styles.slice(0, RIVALS.tongs)) {
    const named = tongNameFor(rng, style, usedNames);
    if (!named) continue;
    usedNames.add(named.name);
    const home = named.home ?? homes[h++ % homes.length];
    const prestige = between(rng, RIVALS.startPrestige);
    const wealth = between(rng, RIVALS.startWealth) + prestige * 60;
    const tong = {
      id: slug(named.name), name: named.name, home, style, prestige, wealth, halls: hallsFor(prestige, wealth),
      depth: 0, regard: 0, poorWeeks: 0, splitDay: 0, foldedDay: null, headId: null, status: 'active', formedDay: state.day ?? 1,
      aim: between(rng, RIVALS.styles[style].aim), aimDay: state.day ?? 1,
    };
    tong.depth = Math.round(2 + tong.halls * 3 + rng() * 3);
    const n = between(rng, RIVALS.perTong);
    const base = 20 + prestige * 0.8;
    for (let i = 0; i < n; i++) {
      const card = makeCard(r, rng, takenPeople, { tong: tong.id, home, day: state.day ?? 1, head: i === 0, base: i === 0 ? base + 8 : base });
      r.cards.push(card);
      if (i === 0) tong.headId = card.id;
    }
    r.tongs.push(tong);
  }
  for (let i = 0; i < RIVALS.freeNames; i++) {
    r.cards.push(makeCard(r, rng, takenPeople, { home: pick(rng, RIVAL_HOMES), day: state.day ?? 1, young: rng() < 0.6, base: 24 + rng() * 26 }));
  }
  r.nextOfferDay = (state.day ?? 1) + offerGap(state, r);
  return r;
}

/** Days until the next free name is put forward: 3 to 6 weeks, from a hash (so it is random but never moves a roll). */
export const offerGapFor = (state, r) => offerGap(state, r);
function offerGap(state, r) {
  const weeks = RIVALS.freeGap[0] + Math.floor(hashRng(state.seed, 'free-name', r.offerSeq++)() * (RIVALS.freeGap[1] - RIVALS.freeGap[0] + 1));
  return weeks * 7;
}

// --- The weekly step ---

const tongById = (r, id) => r.tongs.find((t) => t.id === id);
const cardsOf = (r, tongId) => r.cards.filter((c) => c.tongId === tongId);
/** Add talk, unless the same thing was said about the same tong or name in the last four weeks. */
const say = (r, day, kind, refs) => {
  if (r.word.some((w) => w.kind === kind && w.refs[0] === refs[0] && day - w.day < RIVALS.wordWeeks * 7)) return;
  r.word.push({ day, kind, refs });
};

// --- C4 (DESIGN.md 2026-11-09 "C4: rivals feel alive"): stories told in beats, and names we let go. ---
// No roll here: every beat is read off state the weekly step already changed. Keys are absolute weeks.

const FAME_ORDER = ['unknown', 'known', 'respected', 'elite'];
const bandOf = (rating) => RIVALS.cardBands.filter((b) => rating >= b).length; // matches dossier.js tierForRating (a test checks)
const openThread = (r, tongId, family) => r.threads.find((t) => t.open && t.tongId === tongId && t.family === family);
/** Open a thread, unless this tong already has an open one in this family (one at a time). */
function startThread(r, day, tongId, family, stage) {
  if (openThread(r, tongId, family)) return null;
  const th = { id: `${tongId}:${family}:${absWeek(day)}`, tongId, family, stage, startWeek: absWeek(day), lastBeatWeek: absWeek(day), open: true, calm: 0 };
  r.threads.push(th);
  return th;
}
/** A thread moves on: it says its next beat, and may close. */
function beat(r, th, day, stage, kind, refs, close = false) {
  th.stage = stage; th.lastBeatWeek = absWeek(day); th.open = !close;
  say(r, day, kind, refs);
}
/** A card joins a tong: a beat for an open founding or rise story there, else ordinary talk; and a line if it was ours. */
export function moveCard(r, day, card, to) {
  card.tongId = to.id; card.home = to.home; card.since = day; delete card.fromTong;
  const story = openThread(r, to.id, 'founding') ?? openThread(r, to.id, 'rise');
  if (story?.family === 'founding') beat(r, story, day, 'first_runner', 'founding_end', [to.id, card.id], true);
  else if (story) beat(r, story, day, 'poaching', 'rise_end', [to.id, card.id], true);
  else if (!card.formerOf) say(r, day, 'name_travelling', [card.id, to.id]);
  if (card.formerOf) say(r, day, 'former_signed', [card.id, to.id]);
}
/** A card leaves a tong for the free pool. */
function release(r, day, card, tongId) {
  card.tongId = null; card.fromTong = tongId; card.since = day;
  say(r, day, 'went_free', [card.id, tongId]);
  if (card.formerOf) say(r, day, 'former_free', [card.id]);
}
/** End of the week: calm ends a decline, a new tong's first room, timeouts, and a bounded list. */
function threadsStep(r, day) {
  const w = absWeek(day);
  for (const th of r.threads) {
    if (!th.open) continue;
    const t = tongById(r, th.tongId);
    if (!t || t.status !== 'active') { th.open = false; continue; }
    if (th.family === 'decline' && w > th.startWeek) {
      th.calm = t.poorWeeks === 0 ? (th.calm ?? 0) + 1 : 0;
      if (th.calm >= RIVALS.calmWeeks) { beat(r, th, day, 'recovered', 'decline_recovered', [t.id], true); continue; }
    }
    if (th.family === 'founding' && th.stage === 'begin' && w > th.startWeek) { beat(r, th, day, 'first_hall', 'founding_middle', [t.id]); continue; }
    if (w - th.lastBeatWeek >= RIVALS.threadTimeout) th.open = false;
  }
  while (r.threads.length > RIVALS.threadKeep) {
    const i = r.threads.findIndex((t) => !t.open);
    if (i < 0) break;
    r.threads.splice(i, 1);
  }
}

/** Sundays, after weeklyFame. Own key per day; never moves rngCounter. Fixed array order throughout. */
export function weeklyRivals(state) {
  const r = state.rivals;
  if (!r) return state;
  const day = state.day;
  r.threads ??= [];
  const rng = hashRng(state.seed, 'rivals:' + absWeek(day));

  // 1. Work
  for (const t of r.tongs) {
    if (t.status !== 'active') continue;
    const conf = RIVALS.styles[t.style];
    if (absWeek(day) - absWeek(t.aimDay) >= RIVALS.aimEvery) { t.aim = between(rng, conf.aim); t.aimDay = day; }
    const names = cardsOf(r, t.id);
    const bench = names.length ? names.reduce((n, c) => n + cardRating(c), 0) / names.length : t.prestige;
    const before = t.prestige; const hallsBefore = t.halls;
    t.prestige = clamp(Math.round(t.prestige + (t.aim - t.prestige) * conf.pull + (bench - t.prestige) * 0.02 + (rng() * 2 - 1) * conf.noise), 0, 100);
    t.wealth = Math.max(0, Math.round(t.wealth + t.prestige * conf.wealth - t.halls * RIVALS.upkeep + (rng() * 2 - 1) * 300));
    if (t.halls < RIVALS.marks.length && t.prestige >= RIVALS.marks[t.halls].prestige && t.wealth >= RIVALS.marks[t.halls].wealth) t.halls += 1;
    else if (t.halls > 1 && t.prestige < RIVALS.marks[t.halls - 1].prestige - RIVALS.closeBelow) t.halls -= 1;
    t.depth = clamp(Math.round(t.depth + (t.halls * 3 + 3 - t.depth) * 0.2), 1, 40);
    // A tong's tier is its hall count, so a hall lost or gained is the tier changing.
    const decline = openThread(r, t.id, 'decline');
    if (t.halls < hallsBefore) {
      const th = startThread(r, day, t.id, 'decline', 'lost_hall');
      if (th) say(r, day, 'decline_begin', [t.id]); else say(r, day, 'slipped', [t.id]);
    } else if (t.halls > hallsBefore) {
      if (decline) beat(r, decline, day, 'recovered', 'decline_recovered', [t.id], true);
      else if (startThread(r, day, t.id, 'rise', 'tier_up')) say(r, day, 'rise_begin', [t.id]);
      else say(r, day, 'stepped_up', [t.id]);
    } else if (decline?.stage === 'lost_hall' && t.prestige - before >= 2) beat(r, decline, day, 'taking_work', 'decline_middle', [t.id]);
    else if (t.prestige - before >= 5) say(r, day, 'took_work', [t.id]);
    else if (before - t.prestige >= 5) say(r, day, 'gone_quiet', [t.id]);
  }

  // 2. Growth: cards move toward their peak on the age curve; form drifts.
  for (const c of r.cards) {
    const fameBefore = c.fame; const bandBefore = bandOf(c.rating);
    const target = clamp(Math.round(c.peak * ageCurve(c.age)) + c.form, 5, 95);
    c.rating = clamp(c.rating + clamp(target - c.rating, -2, 2), 5, 95);
    c.form = clamp(c.form + between(rng, [-1, 1]), -5, 5);
    c.fame = fameForRating(c.rating);
    if (c.formerOf) {
      if (bandOf(c.rating) > bandBefore) say(r, day, 'former_tier', [c.id]);
      else if (FAME_ORDER.indexOf(c.fame) > FAME_ORDER.indexOf(fameBefore)) say(r, day, 'former_fame', [c.id]);
    }
  }

  // 3. Drift: young names move as rumours; a free name nobody signs for six weeks goes to the richest tong with room.
  for (const c of r.cards) {
    if (c.age > 27 || rng() >= RIVALS.driftChance) continue;
    const others = r.tongs.filter((t) => t.status === 'active' && t.id !== c.tongId && cardsOf(r, t.id).length < RIVALS.perTong[1]);
    if (!others.length) continue;
    const to = pick(rng, others);
    moveCard(r, day, c, to);
  }
  for (const c of r.cards) {
    if (c.tongId || absWeek(day) - absWeek(c.since) < 6) continue;
    const open = r.tongs.filter((t) => t.status === 'active' && cardsOf(r, t.id).length < RIVALS.perTong[1]).sort((a, b) => b.wealth - a.wealth || (a.id < b.id ? -1 : 1));
    if (!open.length) continue;
    moveCard(r, day, c, open[0]);
  }

  // 4. Age: at the season's end names grow a year older, the oldest retire, young names appear.
  if (isSeasonEnd(day)) {
    const taken = new Set([...r.cards.map((c) => c.name), ...(state.crew ?? []).map((o) => o.name)]);
    const quitting = r.cards.filter((c) => { c.age += 1; return c.age >= between(rng, RIVALS.cardAgeRetire); });
    r.cards = r.cards.filter((c) => !quitting.includes(c));
    for (const t of r.tongs) if (!r.cards.some((c) => c.id === t.headId)) t.headId = [...cardsOf(r, t.id)].sort((a, b) => cardRating(b) - cardRating(a))[0]?.id ?? null;
    for (let i = 0; i < quitting.length; i++) {
      const card = makeCard(r, rng, taken, { home: pick(rng, RIVAL_HOMES), day, young: true, base: 22 + rng() * 26 });
      r.cards.push(card);
      say(r, day, 'new_face', [card.id]);
    }
  }

  // 4b. C3: regard eases, poor tongs fold and their names go free, new tongs form, a free name is put forward.
  freeNamesStep(state, r, day);

  // 5. The player's own name, now and then, once a runner of theirs is talked about.
  if (!r.word.some((w) => w.kind === 'your_name' && day - w.day < 28)) {
    const names = namesOnTheStreet(state);
    if (names.some((n) => n.own) && rng() < 0.5) say(r, day, 'your_name', [(state.halls ?? [])[0]?.district ?? 'oldTown']);
  }

  // 5b. The player's own tong moving up a rung: the street says so (never a result, never a number).
  const rung = (id) => TONG_RANKS.findIndex((k) => k.id === id);
  if (r.playerRank == null) r.playerRank = state.rank;
  else if (state.rank !== r.playerRank) {
    if (rung(state.rank) > rung(r.playerRank)) say(r, day, 'your_tier', ['rank:' + state.rank]);
    r.playerRank = state.rank;
  }

  // 6. Bound the talk like the inbox: old entries go, never more than wordMax.
  threadsStep(r, day);
  publishBook(state); // C5: the Anchor's slate, on the Sunday before a month's first Monday (core/book.js)
  r.word = r.word.filter((w) => day - w.day <= RIVALS.wordWeeks * 7).slice(-RIVALS.wordMax);
  return state;
}


// --- C3 (2026-11-08): regard, folding and forming, the free name. Own stream; no existing draw moves. ---

const activeCount = (r) => r.tongs.filter((t) => t.status === 'active').length;
const clampRegard = (n) => Math.max(RIVALS.regard.min, Math.min(RIVALS.regard.max, n));

function formTong(state, r, rng, day, { founder, mates = [], styleHint = null }) {
  const style = styleHint ?? pick(rng, STYLES);
  const used = new Set(r.tongs.map((t) => t.name));
  const named = tongNameFor(rng, style, used);
  if (!named) return null;
  const conf = RIVALS.styles[style];
  const home = named.home ?? founder.home ?? pick(rng, RIVAL_HOMES);
  const tong = {
    id: slug(named.name), name: named.name, home, style, prestige: RIVALS.newTong.prestige, wealth: RIVALS.newTong.wealth,
    halls: 1, depth: 3, regard: 0, poorWeeks: 0, splitDay: 0, foldedDay: null, headId: founder.id, status: 'active', formedDay: day,
    aim: between(rng, conf.aim), aimDay: day,
  };
  r.tongs.push(tong);
  for (const c of [founder, ...mates]) { c.tongId = tong.id; c.home = home; c.since = day; delete c.fromTong; }
  if (startThread(r, day, tong.id, 'founding', 'begin')) say(r, day, 'founding_begin', [tong.id, founder.id]);
  else say(r, day, 'formed', [tong.id, founder.id]);
  return tong;
}

function freeNamesStep(state, r, day) {
  const rng = hashRng(state.seed, 'rivals-c3:' + absWeek(day));
  const isNewSeason = isSeasonEnd(day);

  // Regard eases one step toward 0 every other Sunday; the talk turns cooler or warmer, and says so once.
  for (const t of r.tongs) {
    if (t.status !== 'active') continue;
    if (absWeek(day) % 2 === 0 && t.regard) t.regard += t.regard > 0 ? -1 : 1;
    if (t.regard <= RIVALS.regard.cold) say(r, day, 'cold_shoulder', [t.id]);
    else if (t.regard >= RIVALS.regard.warm) say(r, day, 'warm_nod', [t.id]);
  }

  // Folding: poor, small and unloved for foldWeeks Sundays in a row; never below minTongs.
  for (const t of r.tongs) {
    if (t.status !== 'active') continue;
    const poor = t.halls === 1 && t.prestige < RIVALS.foldPrestige && t.wealth < RIVALS.foldWealth;
    t.poorWeeks = poor ? (t.poorWeeks ?? 0) + 1 : 0;
    if (t.poorWeeks < RIVALS.foldWeeks || activeCount(r) <= RIVALS.minTongs) continue;
    t.status = 'folded'; t.foldedDay = day;
    const sliding = openThread(r, t.id, 'decline');
    if (sliding) beat(r, sliding, day, 'folded', 'decline_folded', [t.id], true); else say(r, day, 'folded', [t.id]);
    for (const th of r.threads) if (th.open && th.tongId === t.id) th.open = false;
    const names = r.cards.filter((c) => c.tongId === t.id);
    const best = [...names].sort((a, b) => cardRating(b) - cardRating(a) || (a.id < b.id ? -1 : 1))[0];
    // Some of them may form their own: the best name and one or two others (a hash).
    if (best && cardRating(best) >= RIVALS.formRating && rng() < RIVALS.formChance) {
      const mates = names.filter((c) => c !== best).sort((a, b) => cardRating(b) - cardRating(a) || (a.id < b.id ? -1 : 1)).slice(0, 1 + Math.floor(rng() * 2));
      formTong(state, r, rng, day, { founder: best, mates });
    }
  }

  // A folded tong's names go free over time: one each Sunday, the lowest rated first and the head last.
  for (const t of r.tongs) {
    if (t.status !== 'folded') continue;
    const left = r.cards.filter((c) => c.tongId === t.id);
    if (!left.length) continue;
    const next = [...left].sort((a, b) => (a.id === t.headId) - (b.id === t.headId) || cardRating(a) - cardRating(b) || (a.id < b.id ? -1 : 1))[0];
    release(r, day, next, t.id);
  }

  // A season's end with too few tongs: a good free name forms one.
  if (isNewSeason && activeCount(r) < RIVALS.tongs) {
    const free = r.cards.filter((c) => !c.tongId && cardRating(c) >= RIVALS.formSeasonRating).sort((a, b) => cardRating(b) - cardRating(a) || (a.id < b.id ? -1 : 1));
    if (free.length) formTong(state, r, rng, day, { founder: free[0], mates: free.slice(1, 2).filter((c) => c.home === free[0].home) });
  }

  // The free name: one put forward every 3-6 weeks (a hash), a folded tong's names first; left alone, a rival signs it.
  if (r.offer && !r.cards.some((c) => c.id === r.offer.cardId && !c.tongId)) r.offer = null;
  if (r.offer && day >= r.offer.expiresDay) {
    // Left alone, a rival signs the name: the richest tong with room, or else it makes room by letting its weakest go.
    const card = r.cards.find((c) => c.id === r.offer.cardId);
    const count = (t) => r.cards.filter((c) => c.tongId === t.id).length;
    const byWealth = r.tongs.filter((t) => t.status === 'active').sort((a, b) => b.wealth - a.wealth || (a.id < b.id ? -1 : 1));
    let to = byWealth.find((t) => count(t) < RIVALS.perTong[1]);
    if (!to && card) {
      to = byWealth.find((t) => count(t) >= 2);
      const weakest = to && r.cards.filter((c) => c.tongId === to.id && c.id !== to.headId).sort((a, b) => cardRating(a) - cardRating(b) || (a.id < b.id ? -1 : 1))[0];
      if (weakest) release(r, day, weakest, to.id); else to = null;
    }
    if (card && to) moveCard(r, day, card, to);
    r.lastOffer = r.offer.cardId;
    r.offer = null;
  }
  if (!r.offer && day >= (r.nextOfferDay ?? 0)) {
    // Nobody free? Somebody leaves a tong (the fullest first, never a head): runners come and go.
    if (!r.cards.some((c) => !c.tongId)) {
      const fullest = r.tongs.filter((t) => t.status === 'active' && r.cards.filter((c) => c.tongId === t.id).length >= 4)
        .sort((a, b) => r.cards.filter((c) => c.tongId === b.id).length - r.cards.filter((c) => c.tongId === a.id).length || (a.id < b.id ? -1 : 1))[0];
      const leavers = fullest ? r.cards.filter((c) => c.tongId === fullest.id && c.id !== fullest.headId).sort((a, b) => (a.id < b.id ? -1 : 1)) : [];
      if (leavers.length) {
        const gone = leavers[Math.floor(rng() * leavers.length)];
        release(r, day, gone, fullest.id);
      }
    }
    // A folded tong's names first, then the better rated; between equals, a name of ours may go first (its own key).
    const formerFirst = hashRng(state.seed, 'freename-former:' + absWeek(day))() < RIVALS.formerFreeWeight;
    const free = r.cards.filter((c) => !c.tongId && c.id !== r.lastOffer).sort((a, b) => (!!b.fromTong - !!a.fromTong) || cardRating(b) - cardRating(a) || (formerFirst ? !!b.formerOf - !!a.formerOf : 0) || (a.id < b.id ? -1 : 1));
    if (!free.length) free.push(...r.cards.filter((c) => !c.tongId));
    if (free.length) {
      r.offer = { cardId: free[0].id, day, expiresDay: day + RIVALS.freeWeeks * 7 };
      r.nextOfferDay = day + offerGap(state, r);
      say(r, day, 'free_name', [free[0].id]);
    }
  }
}

// --- Views (the only thing the UI reads) ---

const tierIndex = (id) => TONG_RANKS.findIndex((k) => k.id === id);

/** One stored word entry as a view entry: keys only. A line comes from data/rivals.js wordLine. */
export function wordFor(state, w) {
  const r = state.rivals;
  const out = { kind: w.kind, v: String.fromCharCode(97 + (hash(w.kind, w.refs.join(','), w.day) % 5)) }; // a letter, not a number
  for (const ref of w.refs) {
    if (ref.startsWith('rank:')) { out.tier = ref.slice(5); continue; }
    const tong = tongById(r, ref); const card = r.cards.find((c) => c.id === ref);
    if (tong) { out.tong = tong.name; out.home = tong.home; out.tier = tierWord(tong.halls); out.tongId = tong.id; }
    else if (card) { out.name = card.name; out.home ??= card.home; if (card.formerOf) out.former = true; const t = tongById(r, card.tongId); if (t) { out.tong = t.name; out.tongId = t.id; } }
    else if (RIVAL_HOMES.includes(ref) || NAMES.districts?.[ref]) out.home = ref; // 'your_name' and 'same_door' carry a district id
    else return null; // a name or a tong that is gone (signed, retired): nothing to say about them now
  }
  return out;
}

/**
 * Talk for Monday, at most `max` lines (C4.4), in this order: one story continuing, one name of ours,
 * then ordinary talk (a story beginning is ordinary), different kinds first. Continuing beats starting.
 */
export function mondayWord(state, max = RIVALS.mondayLines) {
  const r = state.rivals; if (!r) return [];
  const recent = r.word.filter((w) => state.day - w.day < 7).reverse();
  const lead = recent.filter((w) => w.kind === BOOK_LEAD).slice(0, 1); // C5: the Anchor's slate leads, and counts in the cap
  const views = (list, n) => list.map((w) => wordFor(state, w)).filter(Boolean).slice(0, n);
  const continuing = recent.filter((w) => THREAD_CONTINUES.includes(w.kind));
  const ours = recent.filter((w) => FORMER_KINDS.includes(w.kind));
  const seen = new Set(); const first = []; const rest = [];
  for (const w of recent.filter((x) => !continuing.includes(x) && !ours.includes(x) && !lead.includes(x))) (seen.has(w.kind) ? rest : first).push(w) && seen.add(w.kind);
  return [...views(lead, 1), ...views(continuing, RIVALS.threadMonday), ...views(ours, RIVALS.formerMonday), ...views([...first, ...rest], max)].slice(0, max);
}

/** Tiers, high to low, each with its tongs sorted by name. No order beyond tier (C.1 rule 2). */
export function tongsByTier(state) {
  const r = state.rivals; if (!r) return [];
  const out = [];
  for (const rank of [...TONG_RANKS].reverse()) {
    const tongs = r.tongs.filter((t) => t.status === 'active' && tongTier(t) === rank.id).sort((a, b) => (a.name < b.name ? -1 : 1));
    if (tongs.length) out.push({ tier: rank.id, tongs });
  }
  return out;
}

/** 6-10 talked-about runners, unranked (sorted by name). The player's own crew can be among them. */
export function namesOnTheStreet(state) {
  const r = state.rivals; if (!r) return [];
  const bonus = { unknown: 0, known: 5, respected: 10, elite: 18, legend: 25 };
  const pool = r.cards.map((c) => {
    const tong = tongById(r, c.tongId);
    return { score: cardRating(c) + bonus[c.fame], id: slug(c.name), name: c.name, own: false, former: !!c.formerOf, tong: tong?.name ?? null, fame: c.fame, home: c.home, role: c.role, word: ratingWord(cardRating(c), c) };
  });
  for (const op of state.crew ?? []) {
    if (op.freelance || op.condition?.injury === 'dead') continue;
    const rating = ratingOf(op);
    pool.push({ score: rating + (bonus[fameOf(op)] ?? 0), id: null, name: op.name, own: true, tong: null, fame: fameOf(op), home: op.hall ?? 'oldTown', role: op.role, word: ratingWord(rating, op) });
  }
  // The street talks about other people too: the player's own runners take at most half the list.
  const ownMax = Math.floor(RIVALS.namesMax / 2);
  let own = 0;
  return pool.sort((a, b) => b.score - a.score || (a.name < b.name ? -1 : 1))
    .filter((n) => !n.own || ++own <= ownMax).slice(0, RIVALS.namesMax)
    .map(({ score, ...n }) => n).sort((a, b) => (a.name < b.name ? -1 : 1));
}

const STORY_BEAT = { lost_hall: 'first', taking_work: 'second', tier_up: 'first', poaching: 'second', begin: 'first', first_hall: 'second' };
const sealOf = (t) => ({ id: t.id, name: t.name, style: t.style });

/** The five rungs, Harbour at the top: every active tong once on the rung tongTier gives, sorted by name; ours on state.rank (E0). */
export function ladderView(state) {
  const r = state.rivals; if (!r) return [];
  return [...TONG_RANKS].reverse().map((rank) => ({
    tier: rank.id,
    tongs: r.tongs.filter((t) => t.status === 'active' && tongTier(t) === rank.id).sort((a, b) => (a.name < b.name ? -1 : 1)).map(sealOf),
    ours: state.rank === rank.id,
  }));
}

const MOVE_KINDS = { name_travelling: 'moved', went_free: 'let_go', rise_end: 'signed', founding_end: 'signed', former_signed: 'signed', former_free: 'let_go' };
/** Come and gone (E0): this month's movement of names, newest first, at most six, read off The Word. Only the side an entry carries is shown. */
export function movesView(state, max = 6) {
  const r = state.rivals; if (!r) return [];
  const out = [];
  for (const w of [...r.word].reverse()) {
    const word = MOVE_KINDS[w.kind];
    if (!word || state.day - w.day > 28) continue;
    const card = r.cards.find((c) => w.refs.includes(c.id));
    if (!card) continue;
    const tong = w.refs.map((ref) => tongById(r, ref)).find(Boolean) ?? null;
    let from = null; let to = null;
    if (w.kind === 'went_free') from = tong;
    else if (w.kind !== 'former_free') { if (!tong || tong.status !== 'active') continue; to = tong; }
    if (out.some((m) => m.id === slug(card.name) && m.word === word)) continue;
    out.push({ id: slug(card.name), name: card.name.split(' ')[0], word, from: from ? sealOf(from) : null, to: to ? sealOf(to) : null, free: w.kind === 'went_free' || w.kind === 'former_free' });
    if (out.length >= max) break;
  }
  return out;
}

/** A tong's open story thread as word keys, never a number: { family, beat }. */
function storyOf(r, tongId) {
  const th = r.threads.find((x) => x.open && x.tongId === tongId);
  return th ? { family: th.family, beat: STORY_BEAT[th.stage] ?? 'first' } : null;
}

/** How long ago a line of talk was: a word, never a count. */
const whenWord = (days) => (days < 7 ? 'week' : days < 28 ? 'month' : 'earlier');

/** A tong's file (E0): its story as a track of talk, newest first, and the whole table as tiles. Public names only. */
function fileOf(state, t, head) {
  const r = state.rivals;
  const cards = cardsOf(r, t.id);
  const ids = new Set(cards.map((c) => c.id));
  const track = [...r.word].reverse().filter((w) => w.kind !== BOOK_LEAD && (w.refs.includes(t.id) || w.refs.some((x) => ids.has(x))))
    .map((w) => { const e = wordFor(state, w); return e ? { ...e, when: whenWord(state.day - w.day) } : null; }).filter(Boolean).slice(0, 6);
  const grade = (c) => r.book?.entries.find((e) => e.runnerId === (c.runnerId ?? c.id))?.grade ?? null;
  const table = [...cards].sort((a, b) => (a.name < b.name ? -1 : 1)).map((c) => ({ id: slug(c.name), name: c.name, role: c.role, head: c === head, grade: grade(c), former: !!c.formerOf }));
  return { track, table };
}

/**
 * Everything the UI may show about the other tongs. Word keys and values only: tier ids, styles,
 * district ids, rating-word keys, proper names. No number values, no digits outside proper names.
 */
export function rivalView(state) {
  const r = state.rivals;
  const view = { elder: { ...BRASS_ANCHOR }, tiers: [], ladder: [], moves: [], names: [], word: [], offer: null, gone: [] };
  if (!r) return view;
  view.tiers = tongsByTier(state).map(({ tier, tongs }) => ({
    tier,
    tongs: tongs.map((t) => {
      const cards = cardsOf(r, t.id);
      const head = cards.find((c) => c.id === t.headId);
      const latest = [...r.word].reverse().find((w) => w.refs.includes(t.id) || cards.some((c) => w.refs.includes(c.id)));
      return {
        id: t.id, name: t.name, home: t.home, style: t.style, head: head?.name ?? null,
        names: cards.filter((c) => c !== head).sort((a, b) => (a.name < b.name ? -1 : 1)).slice(0, 3).map((c) => ({ id: slug(c.name), name: c.name, former: !!c.formerOf })),
        said: latest ? wordFor(state, latest) ?? null : null,
        story: storyOf(r, t.id), ...fileOf(state, t, head),
      };
    }),
  }));
  view.ladder = ladderView(state);
  view.moves = movesView(state);
  view.names = namesOnTheStreet(state);
  view.word = mondayWord(state);
  // People we let go (C4.3): where they are now. A name, a tong or "free", a fame word. No ratings.
  view.gone = r.cards.filter((c) => c.formerOf).sort((a, b) => (a.name < b.name ? -1 : 1)).slice(0, RIVALS.formerMax)
    .map((c) => ({ id: slug(c.name), name: c.name, role: c.role, tong: tongById(r, c.tongId)?.name ?? null, fame: c.fame, former: true }));
  const offered = r.offer && r.cards.find((c) => c.id === r.offer.cardId && !c.tongId);
  if (offered) view.offer = { id: slug(offered.name), name: offered.name, role: offered.role, fame: offered.fame, word: ratingWord(cardRating(offered), offered), home: offered.home, from: tongById(r, offered.fromTong)?.name ?? null };
  return view;
}

export { tierIndex as tierRank };

// --- Contact (C2, 2026-11-08): the other tongs on your jobs. Names and talk only; nothing here moves
// a roll, pay, heat or trust, and nobody holds a grudge (DESIGN.md 2026-11-08 "No grudge").

/**
 * The tong and runner a 'Rival crew' twist names for this job: a hash of the seed and the job, so
 * the same job always meets the same people and no roll moves. A tong based in the job's district
 * turns up three times as often as one from elsewhere. Heads are never named (C.12). Returns
 * { tongId, tong, name } or null when the save has no rivals.
 */
export function rivalForJob(state, jobId, district) {
  const r = state.rivals;
  const tongs = (r?.tongs ?? []).filter((t) => t.status === 'active').sort((a, b) => (a.id < b.id ? -1 : 1));
  if (!tongs.length) return null;
  const rng = hashRng(state.seed, 'rival-twist', jobId);
  const weights = tongs.map((t) => (t.home === district ? 3 : 1));
  let roll = rng() * weights.reduce((n, w) => n + w, 0);
  const tong = tongs.find((t, i) => (roll -= weights[i]) < 0) ?? tongs.at(-1);
  const cards = r.cards.filter((c) => c.tongId === tong.id && c.id !== tong.headId).sort((a, b) => (a.id < b.id ? -1 : 1));
  const card = cards.length ? cards[Math.floor(rng() * cards.length)] : null;
  return { tongId: tong.id, tong: tong.name, name: card?.name ?? null };
}

/**
 * A client job in a tong's own district: now and then the client mentions that tong wanted it.
 * Flavour only (the client never hands you a rival's job). { tong, home } or null. A hash of the seed
 * and the offer, so it's stable and moves no roll. Not for opening, heist or defining jobs.
 */
export function clientRival(state, job, tpl) {
  const r = state.rivals;
  if (!r || !job?.clientId || job.heist || job.heistStep || job.defining || tpl?.heistOnly || tpl?.opening) return null;
  const rng = hashRng(state.seed, 'client-rival', job.id);
  if (rng() >= RIVALS.clientChance) return null;
  const home = r.tongs.filter((t) => t.status === 'active' && t.home === tpl?.district).sort((a, b) => (a.id < b.id ? -1 : 1));
  if (!home.length) return null;
  const tong = home[Math.floor(rng() * home.length)];
  // C4.1: the remark follows the tong's real state, as The Word tells it. No threads open, no mood.
  const mood = openThread(r, tong.id, 'decline') ? 'stretched' : openThread(r, tong.id, 'rise') || openThread(r, tong.id, 'founding') ? 'busy' : null;
  return { tong: tong.name, tongId: tong.id, home: tong.home, mood };
}

/** A finished run that met a rival crew: talk about it, never who won (talk, not results). Mutates. */
export function noteRivalEncounter(state, am) {
  const r = state.rivals;
  if (!r || !am?.rival?.tongId || !(am.events ?? []).some((e) => e.kind === 'twist' && e.text === 'Rival crew')) return;
  say(r, state.day, 'same_door', [am.rival.tongId, am.rival.district]);
  // A split job they agreed to: a little respect, at most once a month per tong (regard moves only on explicit acts).
  const split = (am.events ?? []).some((e) => e.crisis === 'twist_rival_crew' && e.choiceId === 'deal' && e.success);
  const tong = r.tongs.find((t) => t.id === am.rival.tongId);
  if (split && tong && state.day - (tong.splitDay ?? 0) >= RIVALS.regard.splitMonthDays) {
    tong.regard = clampRegard((tong.regard ?? 0) + RIVALS.regard.split);
    tong.splitDay = state.day;
  }
}
