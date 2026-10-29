// Rifle looks and the armoury's weekly shelf (core/looks.js; DESIGN.md 2026-10-29).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame, SAVE_VERSION } from '../src/core/state.js';
import { advanceDay, calendar } from '../src/core/time.js';
import { buyGear, buyOffer, priceOf, loadoutOf, itemTitle } from '../src/core/gear.js';
import { rollLook, lookText } from '../src/core/looks.js';
import { RIFLE_LOOKS, ARMOURY_STOCK } from '../src/data/gearLooks.js';

const game = (seed = 31) => createNewGame({ seed });
const toMonday = (s) => { do { s = advanceDay(s); } while (!calendar(s.day).isMonday); return s; };

test('a new game opens with a shelf of rifles, each its own, the same for the same seed', () => {
  const s = game();
  const offers = s.armoury.offers;
  assert.equal(offers.length, ARMOURY_STOCK.street + ARMOURY_STOCK.pro);
  assert.equal(offers.filter((o) => o.tier === 'pro').length, ARMOURY_STOCK.pro);
  assert.equal(new Set(offers.map((o) => o.look.frame)).size, offers.length, 'different frames');
  assert.equal(new Set(offers.map((o) => o.look.finish)).size, offers.length, 'different finishes');
  for (const o of offers) {
    assert.match(o.name, /^\S.* \S.*$/, 'a two-part name');
    assert.equal(RIFLE_LOOKS.finishes[o.look.finish].tier, o.tier, 'street finishes on street rifles, pro on pro');
    assert.ok(lookText(o).length > 5);
  }
  assert.deepEqual(game().armoury, s.armoury, 'same seed, same shelf');
  assert.notDeepEqual(game(32).armoury.offers.map((o) => o.name), offers.map((o) => o.name), 'another game, other rifles');
});

test('the shelf restocks every Monday', () => {
  let s = game();
  const first = s.armoury.offers.map((o) => o.name);
  s = toMonday(s);
  assert.notDeepEqual(s.armoury.offers.map((o) => o.name), first);
  assert.equal(s.armoury.day, s.day);
});

test('buying a rifle off the shelf keeps its look and name, costs its price, and takes it off the shelf', () => {
  const s = game();
  const offer = s.armoury.offers[0];
  const after = buyOffer(s, offer.oid);
  assert.equal(after.cash, s.cash - priceOf(offer.type, offer.tier));
  const item = after.stash.at(-1);
  assert.deepEqual([item.type, item.tier, item.look, item.name], [offer.type, offer.tier, offer.look, offer.name]);
  assert.equal(itemTitle(item), offer.name);
  assert.ok(!after.armoury.offers.some((o) => o.oid === offer.oid));
  assert.equal(buyOffer(after, offer.oid), after, 'it can only be bought once');
  assert.equal(buyOffer({ ...s, cash: 0 }, offer.oid).cash, 0, 'not without the money');
});

test('every rifle has a look, however it arrives; other gear has none', () => {
  const s = game();
  const bought = buyGear(s, 'rifle', 'pro').stash.at(-1);
  assert.ok(bought.look && bought.name, 'bought by type');
  const brought = loadoutOf(structuredClone(s), ['rifle', 'pistol']);
  assert.ok(brought.weapon.look, 'brought by a recruit');
  assert.equal(buyGear(s, 'vest').stash.at(-1).look, undefined);
});

test("a look is rolled from its own seed: rolling one never moves the game's dice", () => {
  const s = game();
  const before = s.rngCounter;
  assert.deepEqual(rollLook(s, 'x'), rollLook(s, 'x'));
  assert.equal(s.rngCounter, before);
});

test('a v25 save upgrades to v26: owned rifles keep their old look and get a name; the armoury stocks', async () => {
  globalThis.localStorage ??= { getItem: () => null, setItem: () => {}, removeItem: () => {} };
  const { importSave } = await import('../src/save/save.js');
  const old = game(33);
  old.version = 25;
  delete old.armoury;
  old.stash = [{ uid: 'g1', type: 'rifle', tier: 'street' }, { uid: 'g2', type: 'vest', tier: 'street' }];
  old.crew[0].gear.weapon = { uid: 'g3', type: 'rifle', tier: 'pro' };
  const loaded = await importSave({ text: async () => JSON.stringify(old) });
  assert.equal(loaded.version, SAVE_VERSION);
  assert.deepEqual(loaded.stash[0].look, { frame: 'marksman', finish: 'street', engraving: null, charm: null });
  assert.equal(loaded.crew[0].gear.weapon.look.finish, 'carbon');
  assert.ok(loaded.stash[0].name && loaded.crew[0].gear.weapon.name);
  assert.equal(loaded.stash[1].look, undefined);
  assert.equal(loaded.armoury.offers.length, ARMOURY_STOCK.street + ARMOURY_STOCK.pro);
});
