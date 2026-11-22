// The adventure log (owner, 2026-11-21/22; drafts/HANDOFF-revenue-next.md, docs/log-lines-prompt.md).
// Pure logic. Crews who are away send back a line a day, built from the line pools in
// src/data/advlog/: who did it (the crew member best at the day's stat), where (the district's people
// and places, named once and remembered on the trip's facts) and now and then a personality line
// (an aside by temperament, a day about two of the crew, a word from Joss).
//
// Every pick is seeded hashRng(seed, 'advlog', tripId, day), so the log moves no other roll in the
// game. Slice 1 writes the days of hands-off jobs (core/away.js), side tasks (core/sidetasks.js) and
// adds asides to posts (core/contracts.js); expeditions (slice 2) will read the goal files.

import { hashRng } from './rng.js';
import { NAMES } from '../config/names.js';
import { TEMPERAMENTS, HABITS } from '../data/recruitPools.js';
import JOB_DAYS from '../data/advlog/jobDays.js';
import SIDE_DAYS from '../data/advlog/sideDays.js';
import DOCKS from '../data/advlog/docks.js';
import NIGHT_MARKET from '../data/advlog/nightMarket.js';
import OLD_TOWN from '../data/advlog/oldTown.js';
import WEAPON from '../data/advlog/weapon.js';
import WEAPON_SHARED from '../data/advlog/weaponShared.js';
import CASH from '../data/advlog/cash.js';
import RECRUIT from '../data/advlog/recruit.js';

/** The district files (people, places, quiet days, snags). Glass Heights and the Basin have none yet. */
export const DISTRICT_LINES = { docks: DOCKS, nightMarket: NIGHT_MARKET, oldTown: OLD_TOWN };

/** Two drafts of one file as one: lists under the same key joined (weapon.js and weaponShared.js). */
export function joinPools(a, b) {
  if (Array.isArray(a) || Array.isArray(b)) return [...(a ?? []), ...(b ?? [])];
  if (typeof a !== 'object' || typeof b !== 'object' || !a || !b) return a ?? b;
  const out = {};
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) out[k] = joinPools(a[k], b[k]);
  return out;
}

/** The goal files (expeditions, slice 2). */
export const GOAL_LINES = { weapon: joinPools(WEAPON, WEAPON_SHARED), cash: CASH, recruit: RECRUIT };

export const LOG_KEEP = 10; // a log keeps its last ten lines (HANDOFF slice 1, item 6)
export const ASIDE_CHANCE = 1 / 3;
export const PAIR_CHANCE = 0.12;
export const JOSS_CHANCE = 0.06;
const ROLL_STATS = ['combat', 'stealth', 'tech', 'social', 'piloting', 'medical', 'cool']; // no endurance pools

// The starting crew of older games (data/operatives.js STARTING_CREW) has hand-written bios that
// match no temperament: their tags, by id. Everyone since has a bio of TEMPERAMENTS + HABITS text.
const STARTING_TAGS = { mei: ['cold', 'calm'], jax: ['hot', 'warm'], wing: ['curious', 'chrome'], teo: ['calm', 'superstitious', 'warm'], cherry: ['charming', 'money'] };
const BIO_TAGS = new Map([...TEMPERAMENTS, ...HABITS].map((t) => [t.text, t.tags]));

/** A runner's temperament tags, recovered from the two sentences of their bio (no save change). */
export function tagsOf(op) {
  const bio = op?.bio ?? '';
  const tags = new Set(STARTING_TAGS[op?.id] ?? []);
  for (const [text, t] of BIO_TAGS) if (bio.includes(text)) t.forEach((x) => tags.add(x));
  return [...tags];
}

/** Keep the last LOG_KEEP lines of a log (mutates). */
export function capLog(log) {
  if (log.length > LOG_KEEP) log.splice(0, log.length - LOG_KEEP);
  return log;
}

const SLOT = /\{(\w+)\}/g;
const slotsIn = (line) => [...line.matchAll(SLOT)].map((m) => m[1]);

/**
 * Can a line be used here? Every slot it names must be on hand; {other} needs two or more crew; the
 * contact is introduced once ({contact}, {contactWhat}) and named alone after that.
 */
function usable(line, ctx) {
  const slots = slotsIn(line);
  for (const s of slots) if (!(s in ctx.vars)) return false;
  if (slots.includes('contactWhat')) return !ctx.facts.met;
  if (slots.includes('contact')) return !!ctx.facts.met;
  return true;
}

/** Fill a line's slots; a slot that starts a sentence is capitalised ("a local" → "A local"). */
export function fillLine(line, vars) {
  return line.replace(SLOT, (m, k, at, all) => {
    const v = vars[k];
    if (v == null) return m;
    const before = all.slice(0, at);
    const starts = !before.trim() || /[.!?]["'”]?\s+$/.test(before) || /:\s+["“]$/.test(before);
    return starts ? String(v).charAt(0).toUpperCase() + String(v).slice(1) : String(v);
  });
}

// A trip doesn't say the same line twice while it has others: the facts keep a short note of what was said.
const SEEN_KEEP = 16;
const noteOf = (line) => line.slice(0, 32);
const unseen = (facts, list) => { const f = list.filter((l) => !(facts?.seen ?? []).includes(noteOf(l))); return f.length ? f : list; };
function see(facts, line) {
  if (!facts) return;
  facts.seen = [...(facts.seen ?? []), noteOf(line)].slice(-SEEN_KEEP);
}
const pickFrom = (rng, list) => list[Math.floor(rng() * list.length)];
const best = (crew, stat) => crew.reduce((a, o) => ((o.stats?.[stat] ?? 0) > (a.stats?.[stat] ?? 0) ? o : a), crew[0]);

/** A stat drawn from those given, weighted towards what the crew is good at (best value squared). */
function rollStat(rng, crew, stats) {
  const w = stats.map((s) => Math.max(1, best(crew, s).stats?.[s] ?? 1) ** 2);
  let r = rng() * w.reduce((a, b) => a + b, 0);
  for (let i = 0; i < stats.length; i++) { r -= w[i]; if (r < 0) return stats[i]; }
  return stats.at(-1);
}

/**
 * The trip's facts, kept on the trip: the district's contact and place for this trip, picked once
 * (a pure hash of the trip, so they never move) and whether the contact has been introduced.
 */
export function startFacts(seed, tripId, district) {
  const d = DISTRICT_LINES[district];
  if (!d) return { met: false };
  const rng = hashRng(seed, 'advlog', tripId, 'facts');
  const contact = d.contacts?.length ? pickFrom(rng, d.contacts) : null;
  const place = d.places?.length ? pickFrom(rng, d.places) : null;
  return { contact: contact?.name ?? null, contactWhat: contact?.what ?? null, place, met: false };
}

/** The slots on hand for a day: the crew, the district and the trip's facts. */
function varsFor(ctx, who, other) {
  const f = ctx.facts;
  const v = { who: who.handle, district: NAMES.districtsInText?.[ctx.district] ?? NAMES.districts?.[ctx.district] ?? 'the city', day: `Day ${ctx.day}.`, ...ctx.extra };
  if (other) v.other = other.handle;
  if (f.contact) { v.contact = f.contact; v.contactWhat = f.contactWhat; }
  if (f.place) v.place = f.place;
  return v;
}

/**
 * Write one day. ctx: { seed, tripId, day, crew (operatives, at least one), district, facts (mutated:
 * the contact is marked met once introduced), pool ({ any: [...], <stat>: [...] } or a plain list),
 * extra (more slots, e.g. { cash }), quiet (the district's quiet lines may stand in, a share of the
 * time), personality (asides/pair/joss pools; defaults to jobDays.js), pairOk (false on a first day) }.
 * Returns { text, stat, whoId, kind: 'line' | 'pair' | 'quiet' }.
 */
export function writeDay(ctx) {
  const rng = hashRng(ctx.seed, 'advlog', ctx.tripId, ctx.day);
  const crew = ctx.crew.filter(Boolean);
  const p = ctx.personality ?? JOB_DAYS;
  const pool = Array.isArray(ctx.pool) ? { any: ctx.pool } : ctx.pool ?? {};
  // The stat the day is rolled on: one with lines of its own, else any stat the crew is good at.
  const statLists = Object.keys(pool).filter((s) => s !== 'any' && ROLL_STATS.includes(s));
  const lead = best(crew, rollStat(rng, crew, ROLL_STATS));
  const others = crew.filter((o) => o !== lead);
  const other = others.length ? pickFrom(rng, others) : null;
  let ctxv = { ...ctx, crew, vars: varsFor(ctx, lead, other) };
  const fit = (list) => (list ?? []).filter((l) => usable(l, ctxv));

  let kind = 'line'; let stat = null; let who = lead; let lines = [];
  const pairs = other && ctx.pairOk !== false ? fit(p.pair) : [];
  // The district's own lines may stand in a share of the time: its quiet days, or (expeditions) its snags.
  const quiet = ctx.quiet ? fit(DISTRICT_LINES[ctx.district]?.[ctx.local ?? 'quiet']) : [];
  const roll = rng();
  if (pairs.length && roll < PAIR_CHANCE) { kind = 'pair'; lines = pairs; }
  else if (quiet.length && roll < PAIR_CHANCE + ctx.quiet) { kind = 'quiet'; lines = quiet; }
  else {
    const withLines = statLists.filter((s) => fit(pool[s]).length);
    if (withLines.length && (rng() < 0.6 || !fit(pool.any).length)) {
      stat = rollStat(rng, crew, withLines);
      who = best(crew, stat);
      const rest = crew.filter((o) => o !== who);
      ctxv = { ...ctxv, vars: varsFor(ctx, who, rest.length ? pickFrom(rng, rest) : null) };
      lines = fit(pool[stat]);
    } else lines = fit(pool.any);
  }
  if (!lines.length) return null;
  const line = pickFrom(rng, unseen(ctx.facts, lines));
  see(ctx.facts, line);
  if (/\{contactWhat\}/.test(line)) ctx.facts.met = true;
  if (/\{place\}/.test(line)) ctx.facts.placed = true; // a place callback needs one named first
  let text = fillLine(line, ctxv.vars);

  // Personality: an aside by {who}'s temperament about one day in three, or rarely a word from Joss.
  // Asides and Joss are extras: once a trip has used them all, it goes without rather than repeat one.
  const fresh = (list) => list.filter((l) => !(ctx.facts?.seen ?? []).includes(noteOf(l)));
  const tags = tagsOf(who).filter((t) => fresh(fit(p.asides?.[t])).length);
  const extra = rng();
  if (ctx.aside !== false && kind !== 'pair' && tags.length && extra < ASIDE_CHANCE) {
    const a = pickFrom(rng, fresh(fit(p.asides[pickFrom(rng, tags)])));
    see(ctx.facts, a);
    text += ` ${fillLine(a, ctxv.vars)}`;
  } else if (ctx.joss !== false && fresh(fit(p.joss?.day)).length && extra > 1 - JOSS_CHANCE) {
    const j = pickFrom(rng, fresh(fit(p.joss.day)));
    see(ctx.facts, j);
    text += ` ${j}`;
  }
  return { text, stat, whoId: who.id, kind };
}

/**
 * An aside alone, for a line written elsewhere (a post's day, core/contracts.js): about one day in
 * three, by the temperament of the person the day was on. Returns '' or ' <sentence>'.
 */
export function asideFor(seed, tripId, day, op) {
  const rng = hashRng(seed, 'advlog', tripId, day, 'aside');
  const asides = JOB_DAYS.asides;
  const tags = tagsOf(op).filter((t) => asides[t]?.length);
  if (!tags.length || rng() >= ASIDE_CHANCE) return '';
  return ` ${fillLine(pickFrom(rng, asides[pickFrom(rng, tags)]), { who: op.handle })}`;
}

/**
 * Which part of a job's days this is (the JOB DAYS format): day 1 is casing; after that mostly
 * setting up, sometimes more casing, waiting for the right night or a small snag.
 */
export function jobDayBeat(seed, tripId, day) {
  if (day <= 1) return 'casing';
  const r = hashRng(seed, 'advlog', tripId, day, 'beat')();
  return r < 0.15 ? 'snag' : r < 0.3 ? 'waiting' : r < 0.45 ? 'casing' : 'setup';
}

/** A hands-off job's line for a day out (core/away.js): { day, text, beat } or null. */
export function jobDayLine({ seed, tripId, day, crew, district, facts }) {
  const beat = jobDayBeat(seed, tripId, day);
  const out = writeDay({ seed, tripId, day, crew, district, facts, pool: JOB_DAYS[beat], quiet: beat === 'waiting' ? 0.5 : 0, pairOk: day > 1 });
  return out && { day, text: out.text, beat };
}

/** A side task's line for a day before its last (core/sidetasks.js): { day, text } or null. Joss's job-day lines don't fit side work. */
export function sideDayLine({ seed, tripId, day, crew, district, facts, purpose }) {
  const out = writeDay({ seed, tripId, day, crew, district, facts, pool: { any: [...(SIDE_DAYS[purpose] ?? []), ...SIDE_DAYS.any] }, quiet: 0.2, pairOk: true, personality: { ...JOB_DAYS, joss: null } });
  return out && { day, text: out.text };
}

/** A list from a goal file by path ("find.cash", "close.met", "call"); a plain list is treated as "any". */
const poolAt = (file, path) => path.split('.').reduce((o, k) => o?.[k], file);

/**
 * An expedition's line for a day (core/expeditions.js): the beat's pool in the goal file (by stat where
 * it has lists by stat), {item}/{cash}/{lead} in extra, the district's snags or quiet days a share of the
 * time, the goal file's asides, pair days (only where allowed) and Joss. Returns { text, whoId, kind } or null.
 * A callback (callbackContact.*, callbackPlace.*) is only asked for once its contact or place was named.
 */
export function goalLine({ seed, tripId, day, crew, district, facts, goal, beat, extra = {}, pairOk = false, local = null, joss = true, aside = true, key = '' }) {
  const file = GOAL_LINES[goal];
  const pool = poolAt(file, beat);
  if (!pool) return null;
  return writeDay({
    seed, tripId: `${tripId}${key}`, day, crew, district, facts, pool, extra, pairOk, joss, aside,
    quiet: local ? 0.3 : 0, local, personality: file,
  });
}

/** Joss's word on how a trip ended (goal file joss.met / joss.failed), about half the time: '' or ' <line>'. */
export function jossClose(seed, tripId, goal, met) {
  const list = GOAL_LINES[goal]?.joss?.[met ? 'met' : 'failed'] ?? [];
  const rng = hashRng(seed, 'advlog', tripId, 'joss');
  return list.length && rng() < 0.5 ? ` ${pickFrom(rng, list)}` : '';
}
