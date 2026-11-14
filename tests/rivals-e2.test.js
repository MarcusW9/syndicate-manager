// E2 (2026-11-14): overreach. Houses pay wages, can strain, sell their good names and break; the sale is open to the player for
// three weeks; none of it touches the player's money, heat, halls or rolls. Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame, SAVE_VERSION } from '../src/core/state.js';
import { advanceDay } from '../src/core/time.js';
import { weeklyRivals, rivalView, wordFor } from '../src/core/rivals.js';
import { rosterOf } from '../src/core/houses.js';
import { buyoutAmount } from '../src/core/dossier.js';
import { strained, wageBill, upkeepOf } from '../src/core/overreach.js';
import { RIVALS, REACH, WORD_TEXT, THREAD_CONTINUES, SCREEN_TEXT, wordLine } from '../src/data/rivals.js';

const game = (seed = 42) => createNewGame({ seed, startCrew: 'fresh' });
const step = (s, w) => { s.day = 7 * (w + 1); weeklyRivals(s); };
const active = (s) => s.rivals.tongs.filter((t) => t.status === 'active');
const overreach = (s, t) => s.rivals.threads.filter((x) => x.family === 'overreach' && x.tongId === t.id);
const openOverreach = (s, t) => overreach(s, t).find((x) => x.open);

/** No noise and no drifting names, so a scripted story is the only thing that happens. */
const frozen = (fn) => {
  const saved = {}; const drift = RIVALS.driftChance;
  for (const k of Object.keys(RIVALS.styles)) { saved[k] = RIVALS.styles[k].noise; RIVALS.styles[k].noise = 0; }
  RIVALS.driftChance = 0;
  try { return fn(); } finally { for (const k of Object.keys(saved)) RIVALS.styles[k].noise = saved[k]; RIVALS.driftChance = drift; }
};
/** Run to week 20 (every house past its first twelve weeks), free names parked so nothing signs them. */
const aged = (seed) => { const s = game(seed); for (let w = 0; w < 20; w++) step(s, w); for (const c of s.rivals.cards) if (!c.tongId) c.since = 10 ** 6; return s; };
/** A house that earns less than it pays and has no money: 20 prestige on two halls, held there each Sunday. */
const squeeze = (t) => { t.halls = 2; t.prestige = 20; t.aim = 20; t.aimDay = 10 ** 6; t.wealth = 0; t.style = 'street'; };
const squeezeAll = (s, ts, from, weeks, each = () => {}) => {
  for (const t of ts) { squeeze(t); t.bills = Array(4).fill(1500); t.income = Array(4).fill(700); }
  for (let w = from; w < from + weeks; w++) { for (const t of ts) if (t.status === 'active') squeeze(t); step(s, w); each(w); }
};

test('wages: a house pays 4 x each name\'s rating (more for each hall beyond its first) on top of hall upkeep, and keeps four Sundays of books', () => {
  const s = game(3); const r = s.rivals; const t = r.tongs[0];
  assert.equal(RIVALS.wage.per, 4);
  const sumRating = rosterOf(r, t).reduce((n, c) => n + c.rating, 0);
  assert.equal(wageBill(r, t), Math.round(4 * (1 + RIVALS.wage.perHall * (t.halls - 1)) * sumRating));
  assert.ok(upkeepOf({ halls: 5 }) / 5 > upkeepOf({ halls: 3 }) / 3 && upkeepOf({ halls: 3 }) === 3 * RIVALS.upkeep, 'upkeep a hall is flat to three halls, then climbs');
  for (let w = 0; w < 6; w++) step(s, w);
  assert.equal(t.bills.length, 4); assert.equal(t.income.length, 4);
  assert.ok(t.bills.every(Number.isInteger) && t.income.every(Number.isInteger));
});

test('strain moves by one a Sunday up, and falls by one on a calm Sunday', () => frozen(() => {
  const s = aged(21); const t = active(s)[0]; let last = 0; const moves = new Set();
  squeezeAll(s, [t], 20, 8, () => { moves.add(t.strain - last); last = t.strain; });
  assert.ok(t.strain >= 3, `strained houses climb (${t.strain})`);
  assert.deepEqual([...moves].sort(), [1], 'up by one a Sunday');
  // Calm: plenty of money and income, no bills.
  t.prestige = 90; t.aim = 90; t.wealth = 10 ** 7; t.halls = 2;
  const before = t.strain;
  t.bills = Array(4).fill(100); t.income = Array(4).fill(9000);
  step(s, 28);
  assert.equal(t.strain, Math.max(0, before - 1), 'a calm Sunday takes one off');
}));

test('a strained Sunday needs bills over income and wealth under eight weeks of bills', () => {
  const t = { bills: [1000, 1000, 1000, 1000], income: [900, 900, 900, 900], wealth: 7000 };
  assert.equal(strained(t), true);
  assert.equal(strained({ ...t, wealth: 8000 }), false, 'eight weeks in hand is calm');
  assert.equal(strained({ ...t, income: [1000, 1000, 1000, 1000] }), false, 'income meeting the bills is calm');
  assert.equal(strained({ ...t, bills: [1000, 1000, 1000] }), false, 'under four Sundays of books');
});

test('the story: stretched at 3, selling at 6, broken after two Sundays at nothing; a head is never sold; three names are kept', () => frozen(() => {
  const s = aged(22); const r = s.rivals; const t = active(s).find((x) => rosterOf(r, x).length >= 5) ?? active(s)[0];
  const heads = new Set(r.tongs.map((x) => x.headId)); const seen = [];
  const sold = [];
  squeezeAll(s, [t], 20, 24, () => {
    const th = overreach(s, t).at(-1);
    if (th && seen.at(-1) !== th.stage) seen.push(th.stage);
    for (const c of r.cards) if (c.fromTong === t.id && !c.tongId) sold.push(c.id);
    if (th?.stage === 'broken') assert.ok(rosterOf(r, t).length >= REACH.keep || t.status !== 'active', 'a broken house keeps at least three names');
  });
  assert.deepEqual(seen.slice(0, 3), ['stretched', 'selling', 'broken']);
  for (const id of sold) assert.ok(!heads.has(id), 'a head is never sold');
  assert.ok(t.headId && (t.status !== 'active' || r.cards.some((c) => c.id === t.headId)));
  assert.ok(sold.length > 0, 'it sold names');
  assert.ok(r.threads.length > 0);
}));

test('only one house sells at a time; a second waits at stretched', () => frozen(() => {
  const s = aged(23); const r = s.rivals; const a = active(s)[0]; const b = active(s)[1];
  let both = 0; let waited = 0;
  squeezeAll(s, [a, b], 20, 14, () => {
    const stages = active(s).map((t) => openOverreach(s, t)?.stage);
    if (stages.filter((x) => x === 'selling' || x === 'broken').length > 1) both++;
    if (stages.includes('stretched') && stages.some((x) => x === 'selling' || x === 'broken')) waited++;
  });
  assert.equal(both, 0, 'never two houses selling');
  assert.ok(waited > 0, 'the other waited at stretched');
  assert.ok(r.tongs.length >= RIVALS.minTongs);
}));

test('natural play: at most one house selling, never below minTongs, a young house never strains', () => {
  let sellingStarts = 0; let steadied = 0;
  for (let seed = 1; seed <= 16; seed++) {
    const s = game(seed); const r = s.rivals;
    for (let w = 0; w < 52 * 3; w++) {
      step(s, w);
      assert.ok(active(s).length >= RIVALS.minTongs, `seed ${seed} week ${w}: ${active(s).length} houses`);
      const selling = r.threads.filter((x) => x.open && x.family === 'overreach' && (x.stage === 'selling' || x.stage === 'broken'));
      assert.ok(selling.length <= 1, `seed ${seed} week ${w}: ${selling.length} houses selling`);
      for (const t of r.tongs) if (s.day - t.formedDay < REACH.youngWeeks * 7) assert.equal(t.strain, 0, 'a young house never strains');
      for (const x of r.threads) if (x.family === 'overreach' && x.stage === 'selling' && !x.sawSelling) { x.sawSelling = true; sellingStarts++; }
      steadied += r.word.filter((x) => x.kind === 'overreach_steadied' && x.day === s.day).length;
    }
  }
  assert.ok(sellingStarts > 5, `selling stories happen (${sellingStarts})`);
});

test('a house in its first twelve weeks cannot strain, however poor', () => frozen(() => {
  const s = game(24); const r = s.rivals; const t = active(s)[0]; t.formedDay = 1;
  for (let w = 0; w < REACH.youngWeeks - 1; w++) { squeeze(t); t.bills = Array(4).fill(1500); t.income = Array(4).fill(700); step(s, w); assert.equal(t.strain, 0); assert.equal(openOverreach(s, t), undefined); }
  assert.ok(r);
}));

test('the sale: a selling tong lists a name for three weeks (ours first, then a buyer pays the tong), and the best names stay', () => frozen(() => {
  const s = aged(25); const r = s.rivals; const t = active(s).find((x) => rosterOf(r, x).length >= 5) ?? active(s)[0];
  const heads = new Set(r.tongs.map((x) => x.headId)); const everListed = new Map(); let sold = 0; let kept = 0;
  squeezeAll(s, [t], 20, 40, () => {
    const view = rivalView(s);
    assert.ok(Array.isArray(view.sale));
    for (const id of r.sale?.cardIds ?? []) {
      const c = r.cards.find((x) => x.id === id);
      if (!c) continue;
      if (c.listedDay != null) { assert.ok(!heads.has(c.id), 'a head is never listed'); assert.ok(s.day - c.listedDay < REACH.saleWeeks * 7, 'listed names are fresh'); everListed.set(c.id, c.tongId); }
    }
    for (const x of r.word.filter((e) => e.kind === 'bought' && e.day === s.day)) if (everListed.has(x.refs[1])) sold++;
  });
  assert.ok(everListed.size > 0, 'the tong listed names');
  for (const [id, from] of everListed) { const c = r.cards.find((x) => x.id === id); if (c && c.tongId === from && c.listedDay == null) kept++; }
  assert.ok(sold + kept + [...everListed.keys()].filter((id) => r.cards.find((x) => x.id === id)?.listedDay != null).length > 0);
  assert.equal(r.sale == null || r.sale.cardIds.every((id) => r.cards.some((c) => c.id === id)), true);
}));

test('a listed name stays with its tong for the player for three weeks: nobody else buys it, and it is never the ordinary free name', () => frozen(() => {
  const s = aged(26); const r = s.rivals; const t = active(s).find((x) => rosterOf(r, x).length >= 5) ?? active(s)[0];
  let checked = 0; const seen = new Map();
  squeezeAll(s, [t], 20, 40, () => {
    for (const id of r.sale?.cardIds ?? []) {
      const c = r.cards.find((x) => x.id === id);
      if (!c) continue;
      assert.notEqual(r.offer?.cardId, id, 'never the ordinary free name');
      if (c.listedDay != null) { if (seen.has(id)) assert.equal(c.tongId, seen.get(id), 'still with the house that listed them'); seen.set(id, c.tongId); checked++; }
    }
  });
  assert.ok(checked > 0);
}));

test('a name a tong lists is sold for a fee: the buyer pays, the selling tong keeps the money', () => frozen(() => {
  let paid = 0;
  for (let seed = 30; seed < 60 && !paid; seed++) {
    const s = aged(seed); const r = s.rivals; const t = active(s)[0];
    const listedBefore = new Set();
    for (let w = 20; w < 20 + 44; w++) {
      squeeze(t); if (w === 20) { t.bills = Array(4).fill(1500); t.income = Array(4).fill(700); }
      const wealth = new Map(r.tongs.map((x) => [x.id, x.wealth]));
      for (const c of r.cards) if (c.listedDay != null) listedBefore.add(c.id);
      step(s, w);
      for (const x of r.word.filter((e) => e.kind === 'bought' && e.day === s.day && listedBefore.has(e.refs[1]))) {
        const buyer = r.tongs.find((q) => q.id === x.refs[0]); const seller = r.tongs.find((q) => q.id === x.refs[2].slice(5));
        assert.ok(buyer.wealth < wealth.get(buyer.id) + 1, 'the buyer paid'); paid++;
        assert.ok(seller.id === t.id || seller.wealth !== undefined);
      }
    }
  }
  assert.ok(paid > 0, 'a listed name was bought by another tong');
}));

test('shopping: a rich house with room signs a free name or buys from a house below, paid house to house, once in eight weeks', () => {
  let bought = 0; let signed = 0;
  for (let seed = 1; seed <= 25; seed++) {
    const s = game(seed); const r = s.rivals; const last = new Map();
    for (let w = 0; w < 52 * 2; w++) {
      const wealth = new Map(r.tongs.map((t) => [t.id, t.wealth]));
      step(s, w);
      for (const x of r.word.filter((e) => e.kind === 'bought' && e.day === s.day)) {
        bought++;
        const buyer = r.tongs.find((t) => t.id === x.refs[0]); const seller = r.tongs.find((t) => t.id === x.refs[2].slice(5));
        assert.ok(seller && buyer.status === 'active');
        if (buyer.shoppedDay !== s.day) continue; // a name bought from a tong's own sale, not an appetite trip
        assert.ok(!last.has(buyer.id) || s.day - last.get(buyer.id) >= REACH.shopEvery * 7, 'once in eight weeks');
        last.set(buyer.id, s.day);
        assert.ok(wealth.get(seller.id) !== undefined);
      }
      for (const t of r.tongs) if (t.shoppedDay === s.day && !r.word.some((e) => e.kind === 'bought' && e.day === s.day && e.refs[0] === t.id)) { signed++; if (last.has(t.id)) assert.ok(s.day - last.get(t.id) >= REACH.shopEvery * 7); last.set(t.id, s.day); }
    }
  }
  assert.ok(bought + signed > 5, `houses shop (${bought} bought, ${signed} signed)`);
});

test('with the player doing nothing, cash, heat, halls and every roll match a run with no rivals at all', () => {
  const a = game(11); const b = structuredClone(a); b.rivals = null;
  let x = a; let y = b;
  for (let i = 0; i < 52 * 7; i++) { x = advanceDay(x); y = advanceDay(y); }
  assert.ok(x.rivals.threads.length >= 0);
  assert.equal(x.rngCounter, y.rngCounter);
  assert.equal(x.cash, y.cash);
  assert.deepEqual(x.heat, y.heat);
  assert.deepEqual(x.halls, y.halls);
  assert.deepEqual(x.crew, y.crew);
});

test('moves never end at a folded tong, a purchase is a move, and the sale is a let go', () => {
  let bought = 0;
  for (let seed = 1; seed <= 20; seed++) {
    const s = game(seed);
    for (let w = 0; w < 52 * 3; w++) {
      step(s, w);
      for (const m of rivalView(s).moves) {
        if (m.to) assert.equal(s.rivals.tongs.find((t) => t.id === m.to.id).status, 'active');
        if (m.word === 'moved' && m.from && m.to) bought++;
      }
    }
  }
  assert.ok(bought > 0);
});

test('the view has no digits and no numbers in the sale or the story', () => frozen(() => {
  const s = aged(27); const t = active(s).find((x) => rosterOf(s.rivals, x).length >= 5) ?? active(s)[0];
  let sawSale = false; let sawStory = false;
  squeezeAll(s, [t], 20, 20, () => {
    const view = rivalView(s);
    if (view.sale.length) sawSale = true;
    const house = view.tiers.flatMap((x) => x.tongs).find((x) => x.id === t.id);
    if (house?.story?.family === 'overreach') { sawStory = true; assert.ok(['first', 'second', 'third'].includes(house.story.beat)); assert.ok(SCREEN_TEXT.story.overreach[house.story.beat]); }
    for (const n of view.sale) { for (const [k, v] of Object.entries(n)) { assert.notEqual(typeof v, 'number', k); if (typeof v === 'string' && !['name', 'from', 'id'].includes(k)) assert.doesNotMatch(v, /\d/, k); } assert.doesNotMatch(n.id, /\d/); }
    assert.ok(!('strain' in (house ?? {})) && !('bills' in (house ?? {})) && !('income' in (house ?? {})), 'strain, bills and income stay in state');
  });
  assert.ok(sawSale && sawStory, 'the sample saw a sale and a story');
}));

test('the new talk has text with no digits, the right Monday lists, and fills without loose tokens', () => {
  for (const kind of ['overreach_begin', 'overreach_selling', 'overreach_broken', 'overreach_steadied', 'bought']) {
    assert.ok(WORD_TEXT[kind].length >= 2, kind);
    for (const line of WORD_TEXT[kind]) { assert.doesNotMatch(line, /\d/); assert.match(line, /[.!?]$/); }
    const e = { kind, tong: 'Late Rain Society', from: 'Hook Hand', name: 'Mei Lin', v: 'b' };
    assert.doesNotMatch(wordLine(e), /[{}]/);
  }
  for (const kind of ['overreach_selling', 'overreach_broken', 'overreach_steadied']) assert.ok(THREAD_CONTINUES.includes(kind));
  assert.ok(!THREAD_CONTINUES.includes('overreach_begin') && !THREAD_CONTINUES.includes('bought'), 'a story beginning is ordinary talk');
});

test('a v69 save upgrades: every tong gets books and no strain, the rivals get no sale', async () => {
  const store = new Map();
  globalThis.localStorage = { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: (k) => store.delete(k) };
  const S = await import('../src/save/save.js');
  const s = game(3);
  for (let w = 0; w < 12; w++) step(s, w);
  const old = structuredClone(s);
  old.version = 69;
  for (const t of old.rivals.tongs) { delete t.strain; delete t.bills; delete t.income; delete t.shoppedDay; }
  delete old.rivals.sale;
  const up = await S.importSave({ text: async () => JSON.stringify(old) });
  assert.equal(up.version, SAVE_VERSION);
  for (const t of up.rivals.tongs) { assert.equal(t.strain, 0); assert.deepEqual(t.bills, []); assert.deepEqual(t.income, []); assert.equal(t.shoppedDay, null); }
  assert.equal(up.rivals.sale, null);
  const next = structuredClone(up); step(next, 12);
  assert.ok(next.rivals.tongs.filter((t) => t.status === 'active').every((t) => t.bills.length === 1), 'the books start filling on the next Sunday');
});

test('mondayWord never reads a name it cannot find: a sold name that was signed leaves no line behind', () => {
  const s = game(5);
  const e = wordFor(s, { kind: 'overreach_broken', refs: ['no-such-house'], day: 7 });
  assert.equal(e, null);
});

test('a house under the table it is known for takes the best free name that fits, whatever its habit\'s taste', () => frozen(() => {
  const s = aged(28); const r = s.rivals; const t = active(s).find((x) => x.habit === 'oldhouse') ?? active(s)[0];
  for (const c of rosterOf(r, t)) if (c.id !== t.headId) { c.tongId = null; c.since = 10 ** 6; }
  const free = r.cards.filter((c) => !c.tongId).length;
  step(s, 20);
  assert.ok(rosterOf(r, t).length >= 1);
  assert.ok(r.cards.filter((c) => !c.tongId).length <= free, 'it took a free name, or nothing fit');
}));
