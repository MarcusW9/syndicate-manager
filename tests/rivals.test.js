// The other tongs (C1a; DESIGN.md 2026-11-08 "No league"; drafts/PROPOSAL-phase-3.md C.11).
// Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { createNewGame, SAVE_VERSION } from '../src/core/state.js';
import { advanceDay } from '../src/core/time.js';
import { syncHalls } from '../src/core/halls.js';
import { rankForHalls } from '../src/core/tong.js';
import { seedRivals, weeklyRivals, rivalView, namesOnTheStreet, mondayWord, tongsByTier, tongTier } from '../src/core/rivals.js';
import { ratingOf, cardRating, ratingWord, tierWord } from '../src/core/rating.js';
import { generateRecruit, recruitToOperative } from '../src/core/recruits.js';
import { rivalForJob, clientRival, noteRivalEncounter } from '../src/core/rivals.js';
import { clientRivalLine, CLIENT_RIVAL_TEXT } from '../src/data/rivals.js';
import * as M from '../src/core/mission.js';
import { addOffer } from '../src/core/jobs.js';
import { playMission, carefulPolicy } from './play.js';
import { POACH_RESOLVER } from '../src/core/mobility.js';
import { RIVALS, NAMING, WORD_TEXT, wordLine, RIVAL_HOMES, RESERVED_NAMES } from '../src/data/rivals.js';
import { TONG_RANKS } from '../src/data/tong.js';
import { CULTURES } from '../src/data/recruitPools.js';

const game = (seed = 42) => createNewGame({ seed, startCrew: 'fresh' });
/** Run the weekly step as Sundays: day 7, 14, ... */
const weeks = (s, n, from = 0) => { for (let w = from; w < from + n; w++) { s.day = 7 * (w + 1); weeklyRivals(s); } return s; };
const q = (a, p) => [...a].sort((x, y) => x - y)[Math.floor(a.length * p)];

test('rankForHalls is the one ladder: the player and the rivals', () => {
  assert.deepEqual([0, 1, 2, 3, 4, 5, 9].map((n) => rankForHalls(n).id), ['backroom', 'backroom', 'street', 'district', 'city', 'harbour', 'harbour']);
  const s = game();
  assert.equal(s.rank, 'backroom');
  s.halls.push(...[1, 2].map((i) => ({ ...s.halls[0], district: 'd' + i })));
  syncHalls(s);
  assert.equal(s.rank, rankForHalls(3).id);
  assert.equal(tierWord(3), s.rank);
});

test('the same seed gives the same tongs; different seeds differ', () => {
  assert.deepEqual(seedRivals(game(5)), seedRivals(game(5)));
  assert.notDeepEqual(seedRivals(game(5)).tongs.map((t) => t.name), seedRivals(game(6)).tongs.map((t) => t.name));
});

test('seeded tongs follow the naming kit, none sits in the Silt, no digits', () => {
  for (let seed = 1; seed <= 60; seed++) {
    const { tongs, cards } = seedRivals(game(seed));
    assert.equal(tongs.length, RIVALS.tongs);
    assert.equal(new Set(tongs.map((t) => t.name)).size, tongs.length, 'names are unique');
    assert.equal(new Set(tongs.map((t) => t.style)).size >= 4, true, 'all four styles turn up');
    for (const t of tongs) {
      assert.ok(RIVAL_HOMES.includes(t.home), `${t.name} sits in an open district`);
      assert.doesNotMatch(t.name, /\d|silt/i);
      const kit = NAMING[t.style];
      const ends = kit.last.some((w) => t.name.endsWith(' ' + w));
      assert.ok(ends, `${t.name} ends in its style's word`);
      if (t.style === 'street') assert.ok(kit.places.some((p) => t.name.startsWith(p.name + ' ') && p.home === t.home), `${t.name} is a canon place in its own district`);
      assert.ok(t.halls >= 1 && t.halls <= 5);
      assert.ok(cards.some((c) => c.id === t.headId && c.tongId === t.id), 'every tong has a head');
    }
    assert.ok(cards.length >= 32 && cards.length <= 48, `about 40 cards, got ${cards.length}`);
    assert.equal(new Set(cards.map((c) => c.name)).size, cards.length, 'card names are unique');
    for (const c of cards) {
      assert.doesNotMatch(c.name, /\d/);
      assert.equal(c.name.split(/[ ]/).some((p) => RESERVED_NAMES.includes(p)), false, `${c.name} is not a canon person`);
      assert.ok(Number.isInteger(c.rating) && c.rating >= 0 && c.rating <= 100);
    }
  }
});

test('reserved canon names are never in the culture pools by accident of the filter', () => {
  const left = CULTURES.flatMap((c) => [...c.given, ...c.surnames]).filter((n) => !RESERVED_NAMES.includes(n));
  assert.ok(left.length > 100, 'plenty of names remain once canon people are taken out');
});

test('isolation: the rival step never moves rngCounter, and play is the same with and without rivals', () => {
  const a = game(11);
  const b = structuredClone(a);
  b.rivals = null;
  assert.equal(a.rngCounter, b.rngCounter, 'seeding moves no roll');
  let x = a; let y = b;
  for (let i = 0; i < 70; i++) { x = advanceDay(x); y = advanceDay(y); }
  assert.ok(x.rivals.word !== undefined);
  assert.equal(x.rngCounter, y.rngCounter);
  assert.equal(x.cash, y.cash);
  assert.deepEqual(x.jobs, y.jobs);
  assert.deepEqual(x.crew, y.crew);
  assert.deepEqual(x.heat, y.heat);
});

test('weeklyRivals is deterministic and leaves a save without rivals alone', () => {
  assert.deepEqual(weeks(game(3), 20).rivals, weeks(game(3), 20).rivals);
  const none = game(3); none.rivals = null;
  assert.doesNotThrow(() => weeklyRivals(none));
  assert.equal(none.rivals, null);
  assert.deepEqual(rivalView(none).tiers, []);
});

test('52 weeks: values stay whole and in range, talk stays bounded, and it is quick', () => {
  const t0 = Date.now();
  for (let seed = 1; seed <= 40; seed++) {
    const s = game(seed);
    for (let w = 0; w < 52; w++) {
      weeks(s, 1, w);
      assert.ok(s.rivals.word.length <= RIVALS.wordMax);
      assert.ok(s.rivals.word.every((e) => s.day - e.day <= RIVALS.wordWeeks * 7));
    }
    for (const t of s.rivals.tongs) {
      for (const k of ['prestige', 'wealth', 'halls', 'depth']) assert.ok(Number.isInteger(t[k]), `${k} is whole`);
      assert.ok(t.prestige >= 0 && t.prestige <= 100 && t.halls >= 1 && t.halls <= 5 && t.wealth >= 0);
    }
    for (const c of s.rivals.cards) assert.ok(Number.isInteger(c.rating) && c.rating >= 0 && c.rating <= 100 && Math.abs(c.form) <= 5);
    assert.ok(s.rivals.cards.length >= 32 && s.rivals.cards.length <= 52, 'the cast stays about the same size');
    for (const t of s.rivals.tongs.filter((x) => x.status === 'active')) assert.ok(s.rivals.cards.some((c) => c.id === t.headId), 'heads are replaced when they retire');
  }
  assert.ok((Date.now() - t0) / 40 < 1000, '52 weekly steps in well under a second each');
});

test('sim band: the tongs change tier, none sits on top all year, and the city is not stuck on one rung', () => {
  let seedsWithChange = 0; let topAllYear = 0; let flat = 0;
  const N = 60;
  for (let seed = 1; seed <= N; seed++) {
    const s = game(seed);
    const seen = new Map(s.rivals.tongs.map((t) => [t.id, new Set([tongTier(t)])]));
    for (let w = 0; w < 52; w++) { weeks(s, 1, w); for (const t of s.rivals.tongs.filter((x) => x.status === 'active')) (seen.get(t.id) ?? seen.set(t.id, new Set()).get(t.id)).add(tongTier(t)); }
    if ([...seen.values()].some((set) => set.size > 1)) seedsWithChange++;
    if ([...seen.values()].some((set) => set.size === 1 && set.has('harbour'))) topAllYear++;
    if (new Set(s.rivals.tongs.map(tongTier)).size < 2) flat++;
  }
  assert.ok(seedsWithChange >= N * 0.9, `at least one tier change a year in most games (${seedsWithChange}/${N})`);
  assert.equal(topAllYear, 0, 'nobody stays at the top all year');
  assert.ok(flat <= N * 0.05, `tiers are spread, not all one rung (${flat}/${N} flat)`);
});

test('week 26: tiers sit around a modest tong, not all above or all below', () => {
  // The player's rank at week 26 is about district (3 halls) in the phase 2 sim; the rivals should bracket the middle.
  let spread = 0; const N = 60;
  for (let seed = 1; seed <= N; seed++) {
    const s = weeks(game(seed), 26);
    const halls = s.rivals.tongs.map((t) => t.halls);
    if (halls.some((h) => h <= 2) && halls.some((h) => h >= 3)) spread++;
  }
  assert.ok(spread >= N * 0.7, `${spread}/${N} games have a smaller and a bigger tong at week 26`);
});

// --- The one view: no numbers, keys not sentences ---

const NAME_KEYS = new Set(['name', 'names', 'head', 'tong']);
function walk(v, path, visit) {
  if (Array.isArray(v)) v.forEach((x, i) => walk(x, path, visit));
  else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) walk(x, k, visit);
  else visit(v, path);
}

test('rivalView has no number values and no digits outside proper names', () => {
  for (let seed = 1; seed <= 20; seed++) {
    const s = weeks(game(seed), 30);
    const view = rivalView(s);
    assert.ok(view.tiers.length > 0 && view.names.length > 0);
    walk(view, '', (v, key) => {
      assert.notEqual(typeof v, 'number', `a number at ${key}`);
      if (typeof v === 'string' && !NAME_KEYS.has(key)) assert.doesNotMatch(v, /\d/, `digits at ${key}: ${v}`);
    });
    const text = JSON.stringify(view);
    assert.doesNotMatch(text, /rating|prestige|wealth|halls|grudge|depth/, 'no hidden field leaks');
  }
});

test('the view groups by tier and sorts by name inside a tier', () => {
  const s = weeks(game(9), 20);
  const rank = (id) => TONG_RANKS.findIndex((r) => r.id === id);
  const tiers = tongsByTier(s);
  assert.deepEqual(tiers.map((t) => rank(t.tier)), tiers.map((t) => rank(t.tier)).sort((a, b) => b - a), 'high to low');
  for (const { tongs } of tiers) assert.deepEqual(tongs.map((t) => t.name), tongs.map((t) => t.name).sort());
  const names = namesOnTheStreet(s);
  assert.ok(names.length >= 6 && names.length <= 8);
  assert.deepEqual(names.map((n) => n.name), names.map((n) => n.name).sort(), 'unranked: sorted by name');
});

test('ui code never reads state.rivals', () => {
  const dir = new URL('../src/ui/', import.meta.url);
  for (const f of readdirSync(dir).filter((f) => f.endsWith('.js'))) {
    assert.doesNotMatch(readFileSync(new URL(f, dir), 'utf8'), /\.rivals\b/, `${f} must use rivalView`);
  }
});

test('every word kind has a line, and the lines carry no digits or loose braces', () => {
  const full = { tong: 'Third Mist Society', name: 'Ivy Chan', home: 'the Basin', tier: 'district' };
  for (const [kind, variants] of Object.entries(WORD_TEXT)) {
    assert.ok(variants.length > 0);
    const line = wordLine({ kind, ...full });
    assert.ok(line.length > 0);
    assert.doesNotMatch(line, /[{}\d]/);
  }
  for (let seed = 1; seed <= 20; seed++) {
    const s = weeks(game(seed), 30);
    for (const e of s.rivals.word) assert.ok(Object.hasOwn(WORD_TEXT, e.kind), `${e.kind} has a text entry`);
  }
});

test('the same thing is not said about the same tong twice within four weeks', () => {
  for (let seed = 1; seed <= 20; seed++) {
    const s = weeks(game(seed), 40);
    const seen = new Map();
    for (const e of s.rivals.word) {
      const key = e.kind + '|' + e.refs[0];
      if (seen.has(key)) assert.ok(e.day - seen.get(key) >= RIVALS.wordWeeks * 7, `${key} repeated within four weeks`);
      seen.set(key, e.day);
    }
  }
});

test('the lines read cleanly: no doubled words, no stray punctuation, variants spread', () => {
  const all = new Map();
  for (let seed = 1; seed <= 20; seed++) {
    const s = weeks(game(seed), 52);
    for (const e of s.rivals.word) {
      const view = mondayWord({ ...s, day: e.day + 1 }, 24);
      for (const w of view) {
        const line = wordLine({ ...w, home: { oldTown: 'Old Town', docks: 'the Docks', nightMarket: 'the Night Market', heights: 'Glass Heights', basin: 'the Basin' }[w.home] ?? w.home, tier: (w.tier ?? '').toLowerCase() });
        assert.doesNotMatch(line, /\b(\w+) \1\b/i, line);
        assert.doesNotMatch(line, /\s{2}|\s[.,]|\{|\}|\bundefined\b/, line);
        assert.match(line, /[.!?]$/);
        if (!all.has(w.kind)) all.set(w.kind, new Set());
        all.get(w.kind).add(w.v);
      }
    }
  }
  // C4: a tong climbing a rung is now told as the start of a story ('rise_begin'), which replaces 'stepped_up' there.
  for (const kind of ['took_work', 'gone_quiet', 'rise_begin']) assert.ok((all.get(kind)?.size ?? 0) >= 3, `${kind} uses several variants`);
});

test("the player's own tong moving up a rung is talked about, once, with no number", () => {
  const s = game(61);
  assert.equal(s.rivals.playerRank, 'backroom');
  weeks(s, 2);
  assert.ok(!s.rivals.word.some((w) => w.kind === 'your_tier'));
  s.halls.push({ ...s.halls[0], district: 'docks' });
  syncHalls(s);
  assert.equal(s.rank, 'street');
  s.day = 7 * 3; weeklyRivals(s);
  const said = s.rivals.word.filter((w) => w.kind === 'your_tier');
  assert.equal(said.length, 1);
  s.day = 7 * 3 + 1;
  const lines = mondayWord(s).filter((w) => w.kind === 'your_tier');
  assert.equal(lines.length, 1);
  assert.equal(lines[0].tier, 'street');
  s.day = 7 * 4; weeklyRivals(s);
  assert.equal(s.rivals.word.filter((w) => w.kind === 'your_tier').length, 1, 'said once');
});

test('Monday talk is at most three lines, newest week only, and mentions no result or number', () => {
  const s = weeks(game(14), 12);
  s.day = 7 * 12 + 1;
  const lines = mondayWord(s);
  assert.ok(lines.length <= 3);
  s.day += 30;
  assert.deepEqual(mondayWord(s), [], 'old talk is not repeated');
});

// --- The rating ---

test('ratingOf is a 0-100 integer that grows with skill, tier and record', () => {
  const s = game(21);
  const recruit = (quality) => recruitToOperative(generateRecruit(s, { quality }), { condition: { injury: 'healthy' }, history: [] });
  const rookie = recruit('rookie'); const vet = recruit('veteran');
  assert.ok(Number.isInteger(ratingOf(rookie)) && ratingOf(rookie) >= 0 && ratingOf(vet) <= 100);
  assert.ok(ratingOf(vet) > ratingOf(rookie));
  const worked = structuredClone(rookie);
  worked.record = { jobs: 20, clean: 15, milestones: ['a', 'b'], highlights: [1, 2, 3] };
  worked.standing = 60; worked.fame = 'respected';
  assert.ok(ratingOf(worked) > ratingOf(rookie) + 15, 'a worked-in runner outranks the same rookie fresh');
  const grind = structuredClone(rookie);
  grind.record = { jobs: 24, clean: 20, milestones: [], highlights: [] }; grind.standing = 100; grind.fame = 'respected';
  assert.ok(ratingOf(grind) - ratingOf(rookie) < 40, 'a quarter of hard work does not max out renown and record (retuned 2026-11-08)');
  assert.equal(cardRating({ rating: 140 }), 100);
  assert.equal(cardRating({}), 0);
});

test('rating words are keys from a fixed set', () => {
  const keys = new Set(['standout', 'solid', 'rising', 'fading', 'green']);
  for (const rating of [0, 20, 44, 45, 60, 75, 100]) for (const age of [20, 30, 47]) for (const form of [-4, 0, 3]) {
    assert.ok(keys.has(ratingWord(rating, { age, form })));
  }
  assert.equal(ratingWord(90, { age: 30 }), 'standout');
  assert.equal(ratingWord(90, { age: 52 }), 'standout', 'an old star is still the best');
  assert.equal(ratingWord(60, { age: 52 }), 'fading');
  assert.equal(ratingWord(60, { age: 30, form: -5 }), 'fading');
});

test('calibration: card ratings sit in the band of generated recruits and the runners they grow into', () => {
  const rec = { rookie: [], pro: [], veteran: [] }; const cards = [];
  for (let seed = 1; seed <= 40; seed++) {
    const s = game(seed);
    for (const quality of Object.keys(rec)) for (let i = 0; i < 4; i++) {
      rec[quality].push(ratingOf(recruitToOperative(generateRecruit(s, { quality }), { condition: { injury: 'healthy' }, history: [] })));
    }
    cards.push(...s.rivals.cards.map(cardRating));
  }
  const med = Object.fromEntries(Object.entries(rec).map(([k, v]) => [k, q(v, 0.5)]));
  assert.ok(med.rookie < med.pro && med.pro < med.veteran, 'recruits order by quality');
  // A card is a named runner, so it sits from a fresh rookie up to a worked-in veteran.
  assert.ok(q(cards, 0.1) >= med.rookie - 12 && q(cards, 0.1) <= med.pro, `cards' low end ${q(cards, 0.1)}`);
  assert.ok(q(cards, 0.5) >= med.rookie && q(cards, 0.5) <= med.veteran + 15, `cards' middle ${q(cards, 0.5)}`);
  assert.ok(q(cards, 0.9) >= med.veteran && q(cards, 0.9) <= 80, `cards' top end ${q(cards, 0.9)}`);
});

test("the player's own good runner can be among the names on the street", () => {
  const s = game(30);
  const ace = s.crew[0];
  ace.stats = Object.fromEntries(Object.keys(ace.stats).map((k) => [k, 19]));
  ace.tier = 'veteran'; ace.fame = 'elite'; ace.standing = 80;
  ace.record = { jobs: 60, clean: 50, milestones: ['a', 'b', 'c', 'd'], highlights: [1, 2, 3] };
  const mine = namesOnTheStreet(s).filter((n) => n.own);
  assert.deepEqual(mine.map((n) => n.name), [ace.name]);
  assert.equal(mine[0].tong, null);
});

test('the player\'s own runners take at most half of Names on the street, however good the crew', () => {
  const s = game(31);
  for (const op of s.crew) {
    op.stats = Object.fromEntries(Object.keys(op.stats).map((k) => [k, 19]));
    op.tier = 'veteran'; op.fame = 'elite'; op.standing = 100;
    op.record = { jobs: 120, clean: 100, milestones: ['a', 'b', 'c', 'd'], highlights: [1, 2, 3] };
  }
  for (let i = 0; i < 6; i++) s.crew.push({ ...structuredClone(s.crew[0]), id: 'x' + i, name: 'Extra Ace ' + i });
  const names = namesOnTheStreet(s);
  assert.equal(names.length, RIVALS.namesMax);
  assert.equal(names.filter((n) => n.own).length, RIVALS.namesMax / 2);
});

// --- Saves ---

const store = new Map();
globalThis.localStorage = { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: (k) => store.delete(k) };
const S = await import('../src/save/save.js');

test('a v50 save gets valid rivals and nothing else moves', async () => {
  const s = game(50);
  const kept = structuredClone(s);
  delete s.rivals; s.version = 50;
  const loaded = await S.importSave({ text: async () => JSON.stringify(s) });
  assert.equal(loaded.version, SAVE_VERSION);
  assert.equal(SAVE_VERSION >= 51, true);
  assert.deepEqual(loaded.rivals, kept.rivals, 'the same seed seeds the same tongs');
  assert.equal(loaded.rngCounter, kept.rngCounter);
  assert.equal(loaded.rivals.tongs.length, RIVALS.tongs);
});

test('a year of rivals adds under 30KB to a save', () => {
  const s = game(8);
  const before = JSON.stringify(s).length;
  weeks(s, 52);
  const added = JSON.stringify(s.rivals).length;
  assert.ok(added < 30 * 1024, `rivals take ${added} bytes`);
  assert.ok(before > 0);
});

// --- Golden (iOS): a native build is checked against this file ---

test('golden: a fixed seed gives the stored snapshot, after seeding and after 4 weekly steps', () => {
  const snap = (r) => ({
    tongs: r.tongs.map((t) => ({ name: t.name, style: t.style, home: t.home, halls: t.halls, tier: tongTier(t) })),
    cards: r.cards.map((c) => ({ id: c.id, name: c.name, tongId: c.tongId, rating: c.rating })),
  });
  const s = game(1234);
  const out = { seeded: snap(s.rivals), after4: snap(weeks(s, 4).rivals) };
  // C4: stories and names we let go, after a SCRIPTED D3 departure (D3 needs Street rank, so the seed can't be relied on to make one).
  const c4 = game(1234);
  weeks(c4, 4);
  const leaver = c4.crew[0]; const buyer = c4.rivals.tongs[0]; buyer.wealth = 80000;
  const msg = { id: 'golden-poach', kind: 'poach', payload: { opId: leaver.id, tongId: buyer.id, expiresDay: 35, pay: 500, buyout: 1000 }, resolved: false };
  c4.inbox.unshift(msg);
  POACH_RESOLVER(c4, msg, 'go');
  weeks(c4, 12, 4);
  // C5: the Anchor's Book at week 8 (two slates: weeks 4 and 8), as letters, moves and names.
  const c5 = weeks(game(1234), 8).rivals.book;
  out.c5 = { month: c5.absMonth, entries: c5.entries.map((e) => `${e.grade}:${e.name}:${e.move}`), watch: c5.watch, gone: c5.gone.map((g) => g.name) };
  out.c4 = {
    threads: c4.rivals.threads.map((t) => ({ id: t.id, family: t.family, stage: t.stage, open: t.open })),
    formers: c4.rivals.cards.filter((c) => c.formerOf).map((c) => ({ id: c.id, runnerId: c.runnerId, tongId: c.tongId, formerOf: c.formerOf })),
    word: c4.rivals.word.map((w) => `${w.kind}:${w.refs.join(',')}`),
  };
  const file = new URL('./golden/rivals-1234.json', import.meta.url);
  if (!existsSync(file)) { writeFileSync(file, JSON.stringify(out, null, 1) + '\n'); }
  assert.deepEqual(out, JSON.parse(readFileSync(file, 'utf8')));
});

// --- Contact (C2): the other tongs on your jobs, names and talk only ---

test('rivalForJob: the same job meets the same people, never a head, nothing rolls, nothing without rivals', () => {
  const s = game(70);
  const a = rivalForJob(s, 'job-5', 'docks');
  assert.deepEqual(rivalForJob(s, 'job-5', 'docks'), a);
  assert.ok(a.tong && a.name);
  const heads = new Set(s.rivals.tongs.map((t) => t.headId));
  const before = s.rngCounter;
  for (let i = 1; i <= 200; i++) {
    const x = rivalForJob(s, `job-${i}`, 'docks');
    const card = s.rivals.cards.find((c) => c.name === x.name);
    assert.ok(card && !heads.has(card.id), 'a runner, never a head');
    assert.equal(card.tongId, x.tongId, 'the runner belongs to that tong');
  }
  assert.equal(s.rngCounter, before);
  const none = game(70); none.rivals = null;
  assert.equal(rivalForJob(none, 'job-5', 'docks'), null);
});

test("a tong based in the job's district turns up about three times as often", () => {
  const s = game(71);
  const district = s.rivals.tongs[0].home;
  const homeIds = new Set(s.rivals.tongs.filter((t) => t.home === district).map((t) => t.id));
  let home = 0; const N = 1200;
  for (let i = 1; i <= N; i++) if (homeIds.has(rivalForJob(s, `job-${i}`, district).tongId)) home++;
  const wHome = homeIds.size * 3, wAll = wHome + (s.rivals.tongs.length - homeIds.size);
  const expected = wHome / wAll;
  assert.ok(Math.abs(home / N - expected) < 0.06, `${home / N} against about ${expected}`);
});

test('the twist names a real tong and runner in its text and report, and the same game without rivals plays the same', () => {
  const run = (withRivals) => {
    let s = game(72);
    if (!withRivals) s.rivals = null;
    s.jobs = []; addOffer(s, 'container409');
    s.jobs[0].twist = 'twist_rival_crew';
    const ids = s.crew.slice(0, 3).map((o) => o.id);
    s = M.startMission(s, s.jobs[0].id, ids, 'stealth');
    return { start: s, end: playMission(s, carefulPolicy).state };
  };
  const a = run(true), b = run(false);
  const am = a.end.activeMission;
  const tong = a.start.activeMission.rival.tong;
  assert.ok(tong && a.start.activeMission.rival.name);
  const text = JSON.stringify(am.events) + JSON.stringify(am.report);
  assert.ok(text.includes(tong), 'the report and log name the tong');
  assert.doesNotMatch(text, /\{rival/, 'no loose token');
  assert.match(JSON.stringify(b.end.activeMission.report), /Another crew|another crew|one of their people/, 'anonymous without rivals');
  // Names change words, never rolls, pay, heat or injuries.
  assert.equal(a.end.rngCounter, b.end.rngCounter);
  assert.equal(a.end.cash, b.end.cash);
  assert.deepEqual(a.end.activeMission.result.injuries, b.end.activeMission.result.injuries);
  assert.equal(a.end.activeMission.result.outcome, b.end.activeMission.result.outcome);
  assert.equal(a.end.heat, b.end.heat);
  // Talk afterwards, never a result.
  const talk = a.end.rivals.word.find((w) => w.kind === 'same_door');
  assert.ok(talk, 'The Word has it');
  assert.equal(talk.refs[0], a.start.activeMission.rival.tongId);
  assert.ok(WORD_TEXT.same_door.every((l) => !/won|lost|beat|paid|hurt|split/i.test(l)), 'talk, not results');
});

test('a run that did not meet the twist leaves no talk', () => {
  const s = game(73);
  noteRivalEncounter(s, { rival: { tongId: s.rivals.tongs[0].id, district: 'docks' }, events: [] });
  assert.equal(s.rivals.word.some((w) => w.kind === 'same_door'), false);
  noteRivalEncounter(s, { rival: null, events: [{ kind: 'twist', text: 'Rival crew' }] });
  assert.equal(s.rivals.word.length, 0);
});

test('clients now and then mention a tong that wanted the job: client work, the tong at home there, flavour only', () => {
  const s = game(74);
  const tpl = { district: s.rivals.tongs[0].home };
  const homeNames = new Set(s.rivals.tongs.filter((t) => t.home === tpl.district).map((t) => t.name));
  let hits = 0; const N = 1500;
  for (let i = 1; i <= N; i++) {
    const rv = clientRival(s, { id: `job-${i}`, clientId: 'fung' }, tpl);
    if (rv) { hits++; assert.ok(homeNames.has(rv.tong), 'only a tong based in that district'); }
  }
  assert.ok(Math.abs(hits / N - RIVALS.clientChance) < 0.04, `${hits / N} against ${RIVALS.clientChance}`);
  assert.equal(clientRival(s, { id: 'job-1', clientId: null }, tpl), null, 'no client, no remark');
  for (const extra of [{ heist: 'raoTable' }, { heistStep: 'x' }, { defining: 'op1' }]) {
    for (let i = 1; i <= 100; i++) assert.equal(clientRival(s, { id: `job-${i}`, clientId: 'fung', ...extra }, tpl), null);
  }
  assert.equal(clientRival(s, { id: 'job-3', clientId: 'fung' }, { ...tpl, heistOnly: 'raoTable' }), null);
  const none = game(74); none.rivals = null;
  assert.equal(clientRival(none, { id: 'job-3', clientId: 'fung' }, tpl), null);
  assert.deepEqual(clientRival(s, { id: 'job-9', clientId: 'fung' }, tpl), clientRival(s, { id: 'job-9', clientId: 'fung' }, tpl), 'stable');
});

test('the client remark reads cleanly and never promises work from a rival', () => {
  for (const line of CLIENT_RIVAL_TEXT) assert.doesNotMatch(line, /\d/);
  for (const id of ['job-1', 'job-2', 'job-3', 'job-4']) {
    const text = clientRivalLine({ client: 'Auntie Fung', tong: 'Third Mist Society', jobId: id });
    assert.doesNotMatch(text, /[{}]/);
    assert.match(text, /Auntie Fung/);
    assert.match(text, /Third Mist Society/);
  }
});
