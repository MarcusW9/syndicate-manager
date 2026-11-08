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
import { NAMING, RIVAL_HOMES, RIVALS, STYLES, BRASS_ANCHOR, RESERVED_NAMES } from '../data/rivals.js';
import { cardRating, ratingOf, ratingWord, tierWord } from './rating.js';
import { rankForHalls } from './tong.js';
import { fameOf } from './fame.js';
import { TONG_RANKS } from '../data/tong.js';

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
  const r = { tongs: [], cards: [], word: [], seq: 0, playerRank: state.rank ?? null };
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
      depth: 0, grudge: 0, headId: null, status: 'active', formedDay: state.day ?? 1,
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
  return r;
}

// --- The weekly step ---

const tongById = (r, id) => r.tongs.find((t) => t.id === id);
const cardsOf = (r, tongId) => r.cards.filter((c) => c.tongId === tongId);
/** Add talk, unless the same thing was said about the same tong or name in the last four weeks. */
const say = (r, day, kind, refs) => {
  if (r.word.some((w) => w.kind === kind && w.refs[0] === refs[0] && day - w.day < RIVALS.wordWeeks * 7)) return;
  r.word.push({ day, kind, refs });
};

/** Sundays, after weeklyFame. Own key per day; never moves rngCounter. Fixed array order throughout. */
export function weeklyRivals(state) {
  const r = state.rivals;
  if (!r) return state;
  const day = state.day;
  const rng = hashRng(state.seed, 'rivals:' + absWeek(day));

  // 1. Work
  for (const t of r.tongs) {
    if (t.status !== 'active') continue;
    const conf = RIVALS.styles[t.style];
    if (absWeek(day) - absWeek(t.aimDay) >= RIVALS.aimEvery) { t.aim = between(rng, conf.aim); t.aimDay = day; }
    const names = cardsOf(r, t.id);
    const bench = names.length ? names.reduce((n, c) => n + cardRating(c), 0) / names.length : t.prestige;
    const before = t.prestige; const tierBefore = tongTier(t);
    t.prestige = clamp(Math.round(t.prestige + (t.aim - t.prestige) * conf.pull + (bench - t.prestige) * 0.02 + (rng() * 2 - 1) * conf.noise), 0, 100);
    t.wealth = Math.max(0, Math.round(t.wealth + t.prestige * conf.wealth - t.halls * RIVALS.upkeep + (rng() * 2 - 1) * 300));
    if (t.halls < RIVALS.marks.length && t.prestige >= RIVALS.marks[t.halls].prestige && t.wealth >= RIVALS.marks[t.halls].wealth) t.halls += 1;
    else if (t.halls > 1 && t.prestige < RIVALS.marks[t.halls - 1].prestige - RIVALS.closeBelow) t.halls -= 1;
    t.depth = clamp(Math.round(t.depth + (t.halls * 3 + 3 - t.depth) * 0.2), 1, 40);
    const tierAfter = tongTier(t);
    if (tierAfter !== tierBefore) say(r, day, TONG_RANKS.findIndex((k) => k.id === tierAfter) > TONG_RANKS.findIndex((k) => k.id === tierBefore) ? 'stepped_up' : 'slipped', [t.id]);
    else if (t.prestige - before >= 5) say(r, day, 'took_work', [t.id]);
    else if (before - t.prestige >= 5) say(r, day, 'gone_quiet', [t.id]);
  }

  // 2. Growth: cards move toward their peak on the age curve; form drifts.
  for (const c of r.cards) {
    const target = clamp(Math.round(c.peak * ageCurve(c.age)) + c.form, 5, 95);
    c.rating = clamp(c.rating + clamp(target - c.rating, -2, 2), 5, 95);
    c.form = clamp(c.form + between(rng, [-1, 1]), -5, 5);
    c.fame = fameForRating(c.rating);
  }

  // 3. Drift: young names move as rumours; a free name nobody signs for six weeks goes to the richest tong with room.
  for (const c of r.cards) {
    if (c.age > 27 || rng() >= RIVALS.driftChance) continue;
    const others = r.tongs.filter((t) => t.status === 'active' && t.id !== c.tongId && cardsOf(r, t.id).length < RIVALS.perTong[1]);
    if (!others.length) continue;
    const to = pick(rng, others);
    c.tongId = to.id; c.home = to.home; c.since = day;
    say(r, day, 'name_travelling', [c.id, to.id]);
  }
  for (const c of r.cards) {
    if (c.tongId || absWeek(day) - absWeek(c.since) < 6) continue;
    const open = r.tongs.filter((t) => t.status === 'active' && cardsOf(r, t.id).length < RIVALS.perTong[1]).sort((a, b) => b.wealth - a.wealth || (a.id < b.id ? -1 : 1));
    if (!open.length) continue;
    c.tongId = open[0].id; c.home = open[0].home; c.since = day;
    say(r, day, 'name_travelling', [c.id, open[0].id]);
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
  r.word = r.word.filter((w) => day - w.day <= RIVALS.wordWeeks * 7).slice(-RIVALS.wordMax);
  return state;
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
    else if (card) { out.name = card.name; out.home ??= card.home; const t = tongById(r, card.tongId); if (t) { out.tong = t.name; out.tongId = t.id; } }
    else out.home = ref; // 'your_name' carries a district id
  }
  return out;
}

/** Talk for Monday: the newest few from the last week, different kinds first. */
export function mondayWord(state, max = RIVALS.mondayLines) {
  const r = state.rivals; if (!r) return [];
  const recent = r.word.filter((w) => state.day - w.day < 7).reverse();
  const seen = new Set(); const first = []; const rest = [];
  for (const w of recent) (seen.has(w.kind) ? rest : first).push(w) && seen.add(w.kind);
  return [...first, ...rest].slice(0, max).map((w) => wordFor(state, w));
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
    return { score: cardRating(c) + bonus[c.fame], name: c.name, own: false, tong: tong?.name ?? null, fame: c.fame, home: c.home, role: c.role, word: ratingWord(cardRating(c), c) };
  });
  for (const op of state.crew ?? []) {
    if (op.freelance || op.condition?.injury === 'dead') continue;
    const rating = ratingOf(op);
    pool.push({ score: rating + (bonus[fameOf(op)] ?? 0), name: op.name, own: true, tong: null, fame: fameOf(op), home: op.hall ?? 'oldTown', role: op.role, word: ratingWord(rating, op) });
  }
  // The street talks about other people too: the player's own runners take at most half the list.
  const ownMax = Math.floor(RIVALS.namesMax / 2);
  let own = 0;
  return pool.sort((a, b) => b.score - a.score || (a.name < b.name ? -1 : 1))
    .filter((n) => !n.own || ++own <= ownMax).slice(0, RIVALS.namesMax)
    .map(({ score, ...n }) => n).sort((a, b) => (a.name < b.name ? -1 : 1));
}

/**
 * Everything the UI may show about the other tongs. Word keys and values only: tier ids, styles,
 * district ids, rating-word keys, proper names. No number values, no digits outside proper names.
 */
export function rivalView(state) {
  const r = state.rivals;
  const view = { elder: { ...BRASS_ANCHOR }, tiers: [], names: [], word: [] };
  if (!r) return view;
  view.tiers = tongsByTier(state).map(({ tier, tongs }) => ({
    tier,
    tongs: tongs.map((t) => {
      const cards = cardsOf(r, t.id);
      const head = cards.find((c) => c.id === t.headId);
      const latest = [...r.word].reverse().find((w) => w.refs.includes(t.id) || cards.some((c) => w.refs.includes(c.id)));
      return {
        id: t.id, name: t.name, home: t.home, style: t.style, head: head?.name ?? null,
        names: cards.filter((c) => c !== head).map((c) => c.name).sort().slice(0, 3),
        said: latest ? wordFor(state, latest) : null,
      };
    }),
  }));
  view.names = namesOnTheStreet(state);
  view.word = mondayWord(state);
  return view;
}

export { tierIndex as tierRank };
