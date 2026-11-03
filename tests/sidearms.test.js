// Sidearm strengths (2026-10-30): each sidearm's numbers come from its frame and a quirk rolled with
// its look (data/gear.js SIDEARM_FRAMES, SIDEARM_QUIRKS; core/gear.js sidearmStats). Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame } from '../src/core/state.js';
import { rollLook, stockShelf } from '../src/core/looks.js';
import { sidearmStats, priceOf, gearMods, buyOffer } from '../src/core/gear.js';
import { weaponOf, hitFor, buildBattle, playRound } from '../src/core/battle.js';
import { SIDEARM_FRAMES, SIDEARM_QUIRKS } from '../src/data/gear.js';
import { makeRng } from '../src/core/rng.js';

test('a sidearm with no frame or quirk is the sidearm as it always was: aim 1, damage 3 (pro 2 and 4)', () => {
  assert.deepEqual(sidearmStats({ type: 'pistol', tier: 'street' }), { aim: 1, damage: 3, pierce: 0, trait: 'steady', quirk: null });
  const pro = sidearmStats({ type: 'pistol', tier: 'pro' });
  assert.equal(pro.aim, 2);
  assert.equal(pro.damage, 4);
  assert.equal(sidearmStats({ type: 'vest' }), null);
});

test('every sidearm rolls a quirk with its look, the same every time, without changing the look or the name', () => {
  const s = createNewGame({ seed: 5, startCrew: 'fresh' });
  const seen = new Set();
  for (let i = 0; i < 400; i++) {
    const a = rollLook(s, `t|${i}`, i % 3 ? 'street' : 'pro', 'pistol');
    assert.deepEqual(rollLook(s, `t|${i}`, i % 3 ? 'street' : 'pro', 'pistol'), a, 'the same seed, the same gun');
    assert.ok(SIDEARM_QUIRKS[a.quirk], `${a.quirk} is a quirk`);
    seen.add(a.quirk);
    const st = sidearmStats({ type: 'pistol', tier: i % 3 ? 'street' : 'pro', ...a });
    assert.ok(st.damage >= 1 && st.aim >= -2);
  }
  assert.equal(seen.size, Object.keys(SIDEARM_QUIRKS).length, 'every quirk turns up');
  assert.equal(rollLook(s, 'r|1', 'street', 'rifle').quirk, undefined, 'rifles have no quirk');
});

test('frames have their own character, and a quirk adds to it', () => {
  const st = (frame, quirk = 'none', tier = 'street') => sidearmStats({ type: 'pistol', tier, look: { frame }, quirk });
  assert.ok(st('compact').aim > st('cannon').aim && st('compact').damage < st('cannon').damage, 'accurate and light, or heavy and kicking');
  assert.equal(st('coil').pierce, SIDEARM_FRAMES.coil.pierce);
  assert.equal(st('heritage', 'sights').aim, 2);
  assert.equal(st('heritage', 'heavyrounds').damage, 4);
  assert.equal(st('heritage', 'heavyrounds').aim, 0);
  assert.equal(st('compact', 'lightloads').damage, 1, 'never below 1');
});

test('the price follows the strength: a better roll costs more, a worn one less', () => {
  const p = (frame, quirk) => priceOf('pistol', 'street', { type: 'pistol', look: { frame }, quirk });
  assert.equal(p('heritage', 'none'), priceOf('pistol', 'street'), 'the plain sidearm costs what it did');
  assert.ok(p('heritage', 'sights') > p('heritage', 'none'));
  assert.ok(p('heritage', 'worn') < p('heritage', 'none'));
  assert.ok(priceOf('pistol', 'pro', { type: 'pistol', look: { frame: 'heritage' }, quirk: 'none' }) > p('heritage', 'none'));
});

test('a sidearm\'s aim is the carrier\'s combat bonus, its damage and pierce are what a hit does', () => {
  const s = createNewGame({ seed: 8, startCrew: 'fresh' });
  const op = s.crew[0];
  op.gear.weapon = { uid: 'x', type: 'pistol', tier: 'street', look: { frame: 'coil' }, quirk: 'hotloads', name: 'Storm Arc' };
  assert.deepEqual(gearMods(op, 'combat').map((m) => m.value), [1]);
  assert.match(gearMods(op, 'combat')[0].note, /Storm Arc/);
  assert.deepEqual(weaponOf(op), { name: 'Storm Arc', damage: 4, pierce: 2 });
  assert.equal(hitFor(4, 1, 2), 4, 'pierce takes armour off first');
  assert.equal(hitFor(4, 3, 2), 3);
  op.gear.weapon = { uid: 'y', type: 'pistol', tier: 'street', look: { frame: 'cannon' }, quirk: 'worn' };
  assert.deepEqual(gearMods(op, 'combat').map((m) => m.value), [SIDEARM_FRAMES.cannon.aim - 1], 'a kicking gun with a worn barrel is a minus');
  // In a fight against armoured guards, the shot does what the rule says.
  op.gear.weapon = { uid: 'z', type: 'pistol', tier: 'street', look: { frame: 'coil' }, quirk: 'none' };
  const b = buildBattle({ incident: 'guard', zone: 'inside', diff: 0, threat: 5, guards: 1, crew: [op], approach: 'loud' });
  const r = playRound(b, makeRng(4));
  for (const l of r.lines.filter((x) => x.kind === 'shoot' && x.success)) assert.equal(l.damage, hitFor(3, b.guards[0].armour, 2));
});

test('a sidearm bought off the shelf keeps its quirk, and costs its own price', () => {
  const s = createNewGame({ seed: 12, startCrew: 'fresh' });
  s.cash = 99999;
  const offer = stockShelf(s, 'pistol')[0];
  s.armoury = { day: s.day, offers: [offer] };
  const after = buyOffer(s, offer.oid);
  assert.equal(after.stash.at(-1).quirk, offer.quirk);
  assert.equal(s.cash - after.cash, priceOf('pistol', offer.tier, offer));
});
