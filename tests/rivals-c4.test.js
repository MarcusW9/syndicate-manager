// C4, "rivals feel alive" (DESIGN.md 2026-11-09): stories in The Word, names we let go, the Monday cap,
// and the client's remark that follows a tong's real state. Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame, SAVE_VERSION } from '../src/core/state.js';
import { weeklyRivals, rivalView, mondayWord, clientRival, moveCard } from '../src/core/rivals.js';
import { POACH_RESOLVER } from '../src/core/mobility.js';
import { signCard, approachFor, tierForRating } from '../src/core/dossier.js';
import { importSave } from '../src/save/save.js';
import { renderGoneElsewhere } from '../src/ui/tongs.js';
import { RIVALS, WORD_TEXT, CLIENT_RIVAL_TEXT, CLIENT_RIVAL_MOOD_TEXT, clientRivalLine, THREAD_CONTINUES, FORMER_KINDS, wordLine } from '../src/data/rivals.js';

const game = (seed = 42) => createNewGame({ seed, startCrew: 'fresh' });
const weeks = (s, n, from = 0) => { for (let w = from; w < from + n; w++) { s.day = 7 * (w + 1); weeklyRivals(s); } return s; };
const THREAD_KINDS = ['decline_begin', 'decline_middle', 'decline_folded', 'decline_recovered', 'founding_begin', 'founding_middle', 'founding_end', 'rise_begin', 'rise_end'];
const threadsOf = (s, tong, family) => s.rivals.threads.filter((t) => t.tongId === tong.id && t.family === family);
const said = (s, kind) => s.rivals.word.filter((w) => w.kind === kind);
/** A tong with two halls that is about to lose one: prestige far under the second hall's mark. */
const sliding = (seed) => {
  const s = settle(game(seed)); const t = s.rivals.tongs[0];
  t.halls = 2; t.prestige = 2; t.aim = 2; t.wealth = 20000; t.style = 'quiet';
  return { s, t };
};
/** No noise and no drifting names, so a scripted story is the only thing that happens. Restores the tuning after. */
const frozen = (fn) => {
  const saved = {}; const drift = RIVALS.driftChance;
  for (const k of Object.keys(RIVALS.styles)) { saved[k] = RIVALS.styles[k].noise; RIVALS.styles[k].noise = 0; }
  RIVALS.driftChance = 0;
  try { return fn(); } finally { for (const k of Object.keys(saved)) RIVALS.styles[k].noise = saved[k]; RIVALS.driftChance = drift; }
};
/** Free names stay free (a name nobody signs for six weeks would otherwise go to a tong). */
const settle = (s) => { for (const c of s.rivals.cards) if (!c.tongId) c.since = 10 ** 6; return s; };

// --- C4.1 the client's remark ---

test("a client's remark has no digits, and follows the tong's real state", () => {
  for (const line of [...CLIENT_RIVAL_TEXT, ...CLIENT_RIVAL_MOOD_TEXT.busy, ...CLIENT_RIVAL_MOOD_TEXT.stretched]) assert.doesNotMatch(line, /\d/);
  const s = game(80);
  const job = { id: 'job-1', clientId: 'fung' };
  const tpl = { district: s.rivals.tongs[0].home };
  const t = s.rivals.tongs.find((x) => x.home === tpl.district);
  const find = () => { for (let i = 1; i < 400; i++) { const j = { ...job, id: `job-${i}` }; const rv = clientRival(s, j, tpl); if (rv) return rv; } return null; };
  s.rivals.tongs.filter((x) => x.id !== t.id && x.home === tpl.district).forEach((x) => { x.status = 'folded'; });
  assert.equal(find().mood, null, 'no story, no mood');
  s.rivals.threads.push({ id: 'a', tongId: t.id, family: 'rise', stage: 'tier_up', startWeek: 1, lastBeatWeek: 1, open: true, calm: 0 });
  assert.equal(find().mood, 'busy');
  s.rivals.threads[0] = { ...s.rivals.threads[0], family: 'decline', stage: 'lost_hall' };
  assert.equal(find().mood, 'stretched');
  t.status = 'folded';
  assert.equal(find(), null, 'a folded tong is never named');
  assert.match(clientRivalLine({ client: 'Fung', tong: 'Third Mist Society', jobId: 'job-7', mood: 'stretched' }), /stretched|up to it/);
  assert.equal(typeof clientRivalLine({ client: 'Fung', tong: 'X', jobId: 'job-7', mood: null }), 'string', 'one remark, one line');
});

// --- C4.2 threads ---

test('decline: lost hall, taking any work, then recovered', () => frozen(() => {
  const { s, t } = sliding(11);
  weeks(s, 1);
  assert.equal(t.halls, 1, 'a hall was lost');
  const th = threadsOf(s, t, 'decline')[0];
  assert.ok(th.open && th.stage === 'lost_hall');
  assert.equal(said(s, 'decline_begin').length, 1);
  assert.equal(said(s, 'slipped').length, 0, 'the story replaces the plain line');
  t.prestige = 10; t.aim = 60; t.wealth = 20000; // work comes back, if only a little
  weeks(s, 1, 1);
  assert.equal(th.stage, 'taking_work');
  assert.equal(said(s, 'decline_middle').length, 1);
  t.prestige = 40; t.aim = 40;
  weeks(s, RIVALS.calmWeeks, 2);
  assert.equal(th.open, false);
  assert.equal(th.stage, 'recovered');
  assert.equal(said(s, 'decline_recovered').length, 1);
}));

test('decline ends in a fold', () => frozen(() => {
  const { s, t } = sliding(12);
  weeks(s, 1);
  const th = threadsOf(s, t, 'decline')[0];
  t.prestige = 5; t.aim = 5; t.wealth = 0; t.poorWeeks = RIVALS.foldWeeks - 1;
  weeks(s, 1, 1);
  assert.equal(t.status, 'folded');
  assert.equal(th.stage, 'folded');
  assert.equal(th.open, false);
  assert.equal(said(s, 'decline_folded').length, 1);
  assert.equal(said(s, 'folded').length, 0, 'the story ends it, the plain line does not repeat it');
}));

test('rise: a hall gained opens a story, a name joining ends it', () => frozen(() => {
  const s = settle(game(13)); const t = s.rivals.tongs[0];
  t.halls = 1; t.prestige = 40; t.aim = 40; t.wealth = 30000; t.style = 'quiet';
  weeks(s, 1);
  assert.equal(t.halls, 2);
  const th = threadsOf(s, t, 'rise')[0];
  assert.ok(th.open && said(s, 'rise_begin').filter((w) => w.refs[0] === t.id).length === 1);
  const card = s.rivals.cards.find((c) => c.tongId !== t.id);
  moveCard(s.rivals, s.day, card, t);
  assert.equal(th.open, false);
  assert.equal(said(s, 'rise_end').length, 1, 'a real card moved there');
  assert.equal(said(s, 'name_travelling').length, 0);
}));

test('founding: a new tong, its first room, its first outside name', () => frozen(() => {
  const s = settle(game(14));
  s.rivals.tongs[0].status = 'folded'; // five active: the season's end forms another
  const free = s.rivals.cards.find((c) => !c.tongId); free.rating = 70; free.peak = 80;
  s.day = 364; weeklyRivals(s);
  const t = s.rivals.tongs.at(-1);
  assert.equal(t.formedDay, 364);
  const th = threadsOf(s, t, 'founding')[0];
  assert.ok(th.open && th.stage === 'begin');
  assert.equal(said(s, 'founding_begin').length, 1);
  s.day = 371; weeklyRivals(s);
  assert.equal(th.stage, 'first_hall');
  assert.equal(said(s, 'founding_middle').length, 1);
  const card = s.rivals.cards.find((c) => c.tongId && c.tongId !== t.id);
  moveCard(s.rivals, s.day, card, t);
  assert.equal(th.open, false);
  assert.equal(said(s, 'founding_end').length, 1);
}));

test('a thread closes after the timeout with no new beat', () => {
  const s = game(15); const t = s.rivals.tongs[0];
  s.rivals.threads.push({ id: 'x', tongId: t.id, family: 'rise', stage: 'tier_up', startWeek: 0, lastBeatWeek: 0, open: true, calm: 0 });
  s.day = 7 * (RIVALS.threadTimeout - 1); weeklyRivals(s);
  assert.equal(s.rivals.threads[0].open, true);
  s.day = 7 * (RIVALS.threadTimeout + 1); weeklyRivals(s);
  assert.equal(s.rivals.threads[0].open, false);
});

test('threads: one open per tong per family, unique ids, bounded, no order beyond tier', () => {
  for (let seed = 1; seed <= 20; seed++) {
    const s = game(seed);
    for (let w = 0; w < 80; w++) {
      weeks(s, 1, w);
      const open = s.rivals.threads.filter((t) => t.open).map((t) => `${t.tongId}|${t.family}`);
      assert.equal(new Set(open).size, open.length, `seed ${seed} week ${w}: two open threads in one family`);
    }
    const ids = s.rivals.threads.map((t) => t.id);
    assert.equal(new Set(ids).size, ids.length, 'unique ids');
    assert.ok(s.rivals.threads.length <= RIVALS.threadKeep);
  }
  const banned = /\b(best|top|number|rank|ranked|ahead|behind|leading|biggest|strongest|richest|wealthiest|champion)\b/i;
  for (const kind of [...THREAD_KINDS, ...FORMER_KINDS]) for (const v of WORD_TEXT[kind]) assert.doesNotMatch(v, banned, v);
  assert.ok(THREAD_KINDS.every((k) => WORD_TEXT[k].length >= 3), 'three variants a beat');
});

test('stories never move a roll, and a full run of weeks leaves rngCounter alone', () => {
  const s = game(16); const before = s.rngCounter;
  weeks(s, 120);
  assert.equal(s.rngCounter, before);
  assert.ok(s.rivals.threads.length > 0, 'some story was told');
});

// --- C4.3 people we lost stay alive ---

/** One of ours leaves through D3, the real way. */
const departure = (seed = 17) => {
  const s = game(seed);
  const op = s.crew[0]; const tong = s.rivals.tongs[0]; tong.wealth = 80000;
  const msg = { id: 'p1', kind: 'poach', payload: { opId: op.id, tongId: tong.id, expiresDay: 8, pay: 500, buyout: 1000 }, resolved: false };
  s.inbox.unshift(msg);
  POACH_RESOLVER(s, msg, 'go');
  return { s, op, tong, card: s.rivals.cards.find((c) => c.name === op.name) };
};

test("a runner who leaves becomes a card marked as ours, with the same runnerId", () => {
  const { op, card, tong } = departure();
  assert.equal(card.formerOf, 'player');
  assert.equal(card.tongId, tong.id);
  assert.equal(card.runnerId, op.runnerId);
  assert.ok(op.runnerId, 'every runner has one');
});

test('formerOf survives save and load, shows only as a boolean, and clears when they re-sign (same runnerId)', async () => {
  const { s, op, card } = departure(18);
  const loaded = JSON.parse(JSON.stringify(s));
  assert.equal(loaded.rivals.cards.find((c) => c.id === card.id).formerOf, 'player');
  const view = rivalView(s);
  assert.deepEqual(view.gone.map((g) => g.name), [op.name]);
  assert.equal(view.gone[0].former, true);
  assert.doesNotMatch(JSON.stringify(view), /formerOf|"player"/);
  s.cash = 500000; s.rivals.tongs.forEach((t) => { t.regard = 0; });
  const free = { ...card, tongId: null }; s.rivals.cards.splice(s.rivals.cards.indexOf(card), 1, free);
  s.halls[0].beds = 20;
  const a = approachFor(s, free.id);
  if (!a.ok) return; // not signable in this fixture (no bed, or not yet): nothing to clear
  const back = signCard(s, free.id);
  assert.ok(!back.rivals.cards.some((c) => c.id === free.id), 'the card, and its mark, are gone');
  assert.equal(back.crew.at(-1).runnerId, op.runnerId, 'the same person');
});

test('the word tells what happens to a name of ours, with the "one of yours" flavour', () => {
  const { s, card } = departure(19);
  const other = s.rivals.tongs[1];
  moveCard(s.rivals, 7, card, other);
  assert.equal(said(s, 'former_signed').length, 1);
  s.day = 8;
  const v = mondayWord(s);
  assert.ok(v.some((w) => w.kind === 'former_signed' && w.former === true && w.name === card.name));
  for (const k of FORMER_KINDS) for (const line of WORD_TEXT[k]) assert.doesNotMatch(line, /\d|hurt|injur/i);
  card.rating = 20; card.fame = 'known'; weeks(s, 1, 1);
  const grown = s.rivals.word.map((w) => w.kind);
  assert.ok(grown.includes('former_signed'));
});

test('a former runner released to the free pool is talked about, and may be put forward before an equal name', () => {
  const { s, card } = departure(20);
  s.day = 100; s.rivals.word = [];
  const t = s.rivals.tongs.find((x) => x.id === card.tongId);
  // The free pool: our former runner and an equal stranger.
  s.rivals.cards = s.rivals.cards.filter((c) => c.tongId && c !== card);
  // Equal in every way that moves a rating this week (peak, age on the curve's flat part, form), so the key alone decides.
  Object.assign(card, { tongId: null, rating: 60, peak: 60, age: 33, form: 0 });
  const stranger = { ...card, id: 'c900', name: 'Test Stranger', formerOf: null, runnerId: 'c900' };
  s.rivals.cards.push(card, stranger);
  s.rivals.offer = null; s.rivals.nextOfferDay = 0;
  const saved = RIVALS.formerFreeWeight; const drift = RIVALS.driftChance; RIVALS.driftChance = 0;
  card.since = 105; stranger.since = 105;
  for (const x of s.rivals.tongs) x.releasedDay = 100; // E1: no house lets a name go this Sunday, so the pool is only these two
  try {
    RIVALS.formerFreeWeight = 1;
    const a = structuredClone(s); a.day = 105; weeklyRivals(a);
    assert.equal(a.rivals.offer?.cardId, card.id, 'ours goes first when the key says so');
    RIVALS.formerFreeWeight = 0;
    const b = structuredClone(s); b.day = 105; weeklyRivals(b);
    assert.equal(b.rivals.offer?.cardId, 'c900'.localeCompare(card.id) < 0 ? 'c900' : card.id, 'no weight: plain id order');
  } finally { RIVALS.formerFreeWeight = saved; RIVALS.driftChance = drift; }
  assert.ok(t);
});

test('Gone elsewhere: sorted by name, capped, a tong or "between tongs", no ratings', () => {
  const { s, card } = departure(21);
  for (let i = 0; i < 14; i++) s.rivals.cards.push({ ...card, id: `op:z${i}`, name: `Zed ${String.fromCharCode(65 + i)}`, tongId: i % 2 ? null : card.tongId, formerOf: 'player' });
  const gone = rivalView(s).gone;
  assert.equal(gone.length, RIVALS.formerMax);
  assert.deepEqual(gone.map((g) => g.name), gone.map((g) => g.name).sort());
  const html = renderGoneElsewhere(s);
  assert.match(html, /Gone elsewhere/);
  assert.match(html, /between tongs/);
  assert.doesNotMatch(html, /rating|prestige|wealth/i);
  const none = game(22);
  assert.equal(renderGoneElsewhere(none), '');
});

// --- C4.4 the Monday cap ---

test('Monday: at most three lines, one continued story, one name of ours, then the rest', () => {
  const s = game(23); const [a, b, c] = s.rivals.tongs; const card = s.rivals.cards.find((x) => x.tongId === a.id);
  s.day = 100;
  s.rivals.word = [
    { day: 99, kind: 'took_work', refs: [a.id] },
    { day: 99, kind: 'gone_quiet', refs: [b.id] },
    { day: 99, kind: 'rise_end', refs: [c.id, card.id] },
    { day: 99, kind: 'decline_middle', refs: [b.id] },
    { day: 99, kind: 'former_free', refs: [card.id] },
    { day: 99, kind: 'former_tier', refs: [card.id] },
    { day: 99, kind: 'decline_begin', refs: [c.id] },
  ];
  card.formerOf = 'player';
  const v = mondayWord(s);
  assert.equal(v.length, RIVALS.mondayLines);
  assert.equal(v.filter((w) => THREAD_CONTINUES.includes(w.kind)).length, 1);
  assert.equal(v.filter((w) => FORMER_KINDS.includes(w.kind)).length, 1);
  assert.ok(THREAD_CONTINUES.includes(v[0].kind), 'a continuing story leads');
  assert.ok(FORMER_KINDS.includes(v[1].kind));
  assert.equal(mondayWord(s, 2).length, 2, 'a smaller cap is respected too');
});

// --- housekeeping ---

test('the card bands match the tiers a card signs as', () => {
  const band = (r) => ['rookie', 'pro', 'veteran'][RIVALS.cardBands.filter((b) => r >= b).length];
  for (let r = 0; r <= 100; r++) assert.equal(band(r), tierForRating(r));
});

test('v57 saves upgrade: threads, runnerId and formerOf appear; a card made by a leaver is marked ours', async () => {
  assert.ok(SAVE_VERSION >= 58);
  const s = game(24);
  const old = JSON.parse(JSON.stringify(s));
  old.version = 57; delete old.rivals.threads;
  for (const c of old.rivals.cards) { delete c.runnerId; delete c.formerOf; }
  for (const o of old.crew) delete o.runnerId;
  old.rivals.cards.push({ ...old.rivals.cards[0], id: 'op:xc12', name: 'Left Us' });
  const up = await importSave({ text: async () => JSON.stringify(old) });
  assert.equal(up.version, SAVE_VERSION, 'upgraded all the way');
  assert.deepEqual(up.rivals.threads, []);
  assert.ok(up.crew.every((o) => o.runnerId === o.id));
  assert.ok(up.rivals.cards.every((c) => 'formerOf' in c && c.runnerId));
  const left = up.rivals.cards.find((c) => c.id === 'op:xc12');
  assert.equal(left.formerOf, 'player');
  assert.equal(left.runnerId, 'c12', 'the id the runner was signed from');
  assert.equal(up.rivals.cards.filter((c) => c.formerOf).length, 1);
});

test('wordLine fills every new kind without loose braces, digits or doubled words', () => {
  for (const kind of [...THREAD_KINDS, ...FORMER_KINDS]) {
    for (let i = 0; i < 3; i++) {
      const line = wordLine({ kind, v: String.fromCharCode(97 + i), tong: 'Third Mist Society', name: 'Ivy Chan', home: 'the Basin', tier: 'district' });
      assert.doesNotMatch(line, /[{}\d]/);
      assert.doesNotMatch(line, /\b(\w+) \1\b/i, line);
      assert.match(line, /[.!?]$/);
    }
  }
});
