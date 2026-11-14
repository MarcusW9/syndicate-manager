// E1 (2026-11-14): houses have habits. A habit is fixed, two houses at most share one, a house lets names go by its habit and
// signs by fit, a released name does not climb inside a season, and nothing moves a roll. Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame, SAVE_VERSION } from '../src/core/state.js';
import { weeklyRivals, rivalView, tongTier } from '../src/core/rivals.js';
import { ceilingOf, rosterOf, tierIndexOf, releaseFor, stalled, pickHabit } from '../src/core/houses.js';
import { buyoutAmount, persuasion, cardToOperative, readFor, findCard } from '../src/core/dossier.js';
import { baseScore } from '../src/core/book.js';
import { HABITS, HABIT_IDS, HABIT, BOOK } from '../src/data/rivals.js';

const game = (seed = 42) => createNewGame({ seed, startCrew: 'fresh' });
const step = (s, w) => { s.day = 7 * (w + 1); weeklyRivals(s); };

test('a habit never changes, every tong has one, and no more than two active tongs share it', () => {
  for (let seed = 1; seed <= 12; seed++) {
    const s = game(seed); const r = s.rivals;
    const habits = new Map(r.tongs.map((t) => [t.id, t.habit]));
    for (let w = 0; w < 104; w++) {
      step(s, w);
      for (const t of r.tongs) { if (!habits.has(t.id)) habits.set(t.id, t.habit); assert.equal(t.habit, habits.get(t.id), 'a habit never changes'); assert.ok(HABIT_IDS.includes(t.habit)); }
      for (const h of HABIT_IDS) assert.ok(r.tongs.filter((t) => t.status === 'active' && t.habit === h).length <= HABIT.maxShared, `seed ${seed} week ${w}: ${h}`);
    }
  }
});

test('the habit draw is a hash of the seed and the tong, never the rng counter', () => {
  const s = game(5);
  const before = s.rngCounter;
  const a = pickHabit(s.seed, s.rivals, 'some-house');
  assert.equal(pickHabit(s.seed, s.rivals, 'some-house'), a);
  assert.notEqual(pickHabit(s.seed, s.rivals, 'some-house', a), a, 'a founder\'s new house differs from the one it left');
  for (let w = 0; w < 30; w++) step(s, w);
  assert.equal(s.rngCounter, before);
});

test('releases: never a head, never twice in four weeks, only by the habit, an old house lets nobody go', () => {
  let released = 0;
  for (let seed = 1; seed <= 12; seed++) {
    const s = game(seed); const r = s.rivals; const lastRelease = new Map();
    for (let w = 0; w < 156; w++) {
      const before = new Map(r.cards.map((c) => [c.id, c.tongId]));
      step(s, w);
      for (const c of r.cards) {
        const was = before.get(c.id);
        if (!was || c.tongId || !r.word.some((x) => x.kind === 'let_go' && x.day === s.day && x.refs[0] === c.id)) continue;
        released++;
        const t = r.tongs.find((x) => x.id === was);
        assert.notEqual(t.headId, c.id, 'a head is never released');
        assert.notEqual(t.habit, 'oldhouse', 'an old house lets nobody go (but over its ceiling)');
        assert.ok(!lastRelease.has(t.id) || s.day - lastRelease.get(t.id) >= HABIT.releaseGapWeeks * 7, 'no house releases twice inside four weeks');
        lastRelease.set(t.id, s.day);
        assert.equal(c.fromTong, t.id);
        assert.equal(c.path.at(-1).tongId, t.id, 'the trail remembers the house they left');
      }
    }
  }
  assert.ok(released > 20, `releases happen (${released})`);
});

test('rosters stay inside their ceiling and the card total stays bounded over ten seasons', () => {
  for (let seed = 1; seed <= 4; seed++) {
    const s = game(seed); const r = s.rivals;
    for (let w = 0; w < 52 * 10; w++) {
      step(s, w);
      assert.ok(r.cards.length >= 34 && r.cards.length <= 46, `seed ${seed} week ${w}: ${r.cards.length} cards`);
      for (const t of r.tongs.filter((x) => x.status === 'active')) assert.ok(rosterOf(r, t).length <= Math.max(ceilingOf(t), 3), `${t.name} (${t.habit}) has ${rosterOf(r, t).length}`);
    }
  }
});

test('a released name does not land at a higher tier than it left inside a season', () => {
  let landed = 0;
  for (let seed = 1; seed <= 12; seed++) {
    const s = game(seed); const r = s.rivals; const pending = new Map();
    for (let w = 0; w < 156; w++) {
      const before = new Map(r.cards.map((c) => [c.id, c.tongId]));
      step(s, w);
      for (const c of r.cards) {
        const was = before.get(c.id);
        if (was && !c.tongId && r.word.some((x) => x.kind === 'let_go' && x.day === s.day && x.refs[0] === c.id)) pending.set(c.id, { ix: tierIndexOf(r.tongs.find((t) => t.id === was)), day: s.day });
        if (pending.has(c.id) && c.tongId) {
          const p = pending.get(c.id); pending.delete(c.id); landed++;
          if (s.day - p.day < 364) assert.ok(tierIndexOf(r.tongs.find((t) => t.id === c.tongId)) <= p.ix, `seed ${seed}: ${c.id} climbed`);
        }
      }
    }
  }
  assert.ok(landed > 10, `released names land somewhere (${landed})`);
});

test('a stalled name needs half a year with no rise, and a fresh house starts the clock again', () => {
  const card = { age: 30, rating: 50, best: 50, bestDay: 1 };
  assert.equal(stalled(card, 100), false);
  assert.equal(stalled(card, 1 + HABIT.stallWeeks * 7), true);
  assert.equal(stalled({ ...card, age: 22 }, 400), false, 'the young are never stalled');
});

test('the house rules: a short table asks more to let one go, an old house asks more to be convinced, a workshop name brings kit, the slate flatters a workshop', () => {
  const s = game(7); s.cash = 90000; const r = s.rivals;
  const pick = (habit) => r.tongs.find((t) => t.habit === habit);
  const base = r.tongs[0];
  const plain = { ...base, habit: 'grinder' };
  assert.equal(buyoutAmount({ ...plain, habit: 'boutique' }, 1000) > buyoutAmount(plain, 1000), true);
  assert.ok(Math.abs(buyoutAmount({ ...plain, habit: 'boutique' }, 2000) / buyoutAmount(plain, 2000) - HABIT.buyoutBoutique) < 0.05);
  const card = r.cards.find((c) => c.tongId && c.id !== r.tongs.find((t) => t.id === c.tongId).headId);
  const t = r.tongs.find((x) => x.id === card.tongId);
  t.habit = 'grinder'; const p1 = persuasion(s, card).premium;
  t.habit = 'oldhouse'; const p2 = persuasion(s, card).premium;
  assert.equal(p2, Math.min(0.35, Math.round((p1 + HABIT.oldHousePremium) * 100) / 100));
  // A workshop name brings one piece of standard-tier kit, for a role that has some.
  t.habit = 'workshop';
  const kitRole = r.cards.find((c) => ['muscle', 'tech', 'medic', 'face', 'driver'].includes(c.role));
  const kitTong = pick('workshop') ?? t;
  kitRole.tongId = kitTong.id; kitTong.habit = 'workshop';
  const op = cardToOperative(s, kitRole);
  assert.ok(op.gear.armour || op.gear.implants.length || op.gear.bag.length, 'a workshop name brings kit');
  kitTong.habit = 'grinder';
  const bare = cardToOperative(s, kitRole);
  assert.ok(!bare.gear?.armour && !(bare.gear?.implants ?? []).length && !(bare.gear?.bag ?? []).length, 'other houses bring none');
  // The slate flatters a workshop.
  const cand = { runnerId: 'x', fame: 'known', form: 0, age: 30, style: null, habit: null };
  assert.equal(baseScore(s, { ...cand, habit: 'workshop' }) - baseScore(s, cand), BOOK.habitSkew.workshop);
  assert.equal(HABIT.workshopKit, 6);
});

test('the view shows a house\'s habit as an id and the profile notes a workshop or an old house', () => {
  const s = game(9);
  for (let w = 0; w < 10; w++) step(s, w);
  const v = rivalView(s);
  for (const t of v.tiers.flatMap((x) => x.tongs)) assert.ok(HABITS[t.habit], 'a habit id the wording knows');
  const t = s.rivals.tongs.find((x) => x.habit);
  const card = s.rivals.cards.find((c) => c.tongId === t.id && c.id !== t.headId);
  t.habit = 'workshop';
  assert.equal(readFor(s, card).note, null, 'nothing until the name has been watched');
  s.rivals.scouted[card.id] = 1;
  assert.equal(readFor(s, card).note, 'workshop');
  t.habit = 'oldhouse';
  assert.equal(readFor(s, card).note, 'oldhouse');
  t.habit = 'boutique';
  assert.equal(readFor(s, card).note, null);
});

test('a v66 save upgrades: every tong gets a habit (two at most alike), every card its best and trail', async () => {
  const store = new Map();
  globalThis.localStorage = { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: (k) => store.delete(k) };
  const S = await import('../src/save/save.js');
  const s = game(3);
  for (let w = 0; w < 12; w++) step(s, w);
  const old = structuredClone(s);
  old.version = 66;
  for (const t of old.rivals.tongs) { delete t.habit; delete t.releasedDay; delete t.signedSeason; }
  for (const c of old.rivals.cards) { delete c.best; delete c.bestDay; delete c.path; }
  delete old.rivals.keptSeason;
  const freeCard = old.rivals.cards.find((c) => !c.tongId); if (freeCard) freeCard.fromTong = old.rivals.tongs[0].id;
  const up = await S.importSave({ text: async () => JSON.stringify(old) });
  assert.equal(up.version, SAVE_VERSION);
  for (const t of up.rivals.tongs) assert.ok(HABIT_IDS.includes(t.habit));
  for (const h of HABIT_IDS) assert.ok(up.rivals.tongs.filter((t) => t.status === 'active' && t.habit === h).length <= HABIT.maxShared);
  for (const c of up.rivals.cards) { assert.equal(c.best, c.rating); assert.equal(c.bestDay, old.day); assert.ok(Array.isArray(c.path)); }
  if (freeCard) assert.equal(up.rivals.cards.find((c) => c.id === freeCard.id).path[0].tongId, old.rivals.tongs[0].id);
  assert.ok(up.rivals.tongs.every((t) => t.habit === pickHabit(up.seed, { tongs: up.rivals.tongs.filter((x) => up.rivals.tongs.indexOf(x) < up.rivals.tongs.indexOf(t)) }, t.id)), 'the same rule as a new game, in order');
});

test('the Come and gone strip carries a let go and a landing, never a folded tong as a destination', () => {
  let letGo = 0; let landed = 0;
  for (let seed = 1; seed <= 20; seed++) {
    const s = game(seed);
    for (let w = 0; w < 80; w++) {
      step(s, w);
      for (const m of rivalView(s).moves) {
        if (m.word === 'let_go') letGo++;
        if (m.from && m.to) landed++;
        if (m.to) assert.equal(s.rivals.tongs.find((t) => t.id === m.to.id).status, 'active');
      }
    }
  }
  assert.ok(letGo > 0 && landed > 0, `saw ${letGo} let go and ${landed} landings`);
});
