// Halls (core/halls.js; DESIGN.md 2026-11-05, the tong's Phase 2 slice 1). Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame, SAVE_VERSION } from '../src/core/state.js';
import { advanceDay, weeklyBill } from '../src/core/time.js';
import { availability } from '../src/core/crew.js';
import { hire, canHire, expandSafehouse, STARTING_ROSTER_CAP } from '../src/core/recruits.js';
import { hallIn, residents, freeBeds, canOpenHall, openHall, expandHall, nextHallExpansion, canMove, moveToHall, introduceHalls, syncHalls } from '../src/core/halls.js';
import { HALL_SITES } from '../src/data/halls.js';
import { rankOf } from '../src/core/tong.js';
import { adjustTrust } from '../src/core/clients.js';

globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
const { importSave } = await import('../src/save/save.js');

/**
 * A game where the Night Market will have us: reputation, Madam Rao's trust, the deposit, and her
 * opening favour already done (tests/openingjobs.test.js covers the favour itself).
 */
function welcome(seed = 1) {
  const s = createNewGame({ seed, startCrew: 'fresh' });
  s.reputation = HALL_SITES.nightMarket.rep;
  adjustTrust(s, 'rao', HALL_SITES.nightMarket.trust - 50);
  s.cash = 30000;
  s.openings = { nightMarket: { status: 'done', jobId: null } };
  return s;
}

test('a new game has one hall, the old safehouse in Old Town: its beds are the roster limit, its rent the rent', () => {
  const s = createNewGame({ seed: 1, startCrew: 'fresh' });
  assert.equal(s.halls.length, 1);
  const h = hallIn(s, 'oldTown');
  assert.equal(h.beds, STARTING_ROSTER_CAP);
  assert.equal(s.rosterCap, h.beds);
  assert.equal(s.rent, h.rent);
  assert.equal(residents(s, 'oldTown').length, s.crew.length, 'everyone lives at home');
  assert.equal(rankOf(s).id, 'backroom');
});

test('opening a hall needs the welcome (reputation, the contact\'s trust) and the deposit; it starts small', () => {
  const s = createNewGame({ seed: 2, startCrew: 'fresh' });
  assert.match(canOpenHall(s, 'nightMarket').reason, /reputation/);
  s.reputation = 30;
  assert.match(canOpenHall(s, 'nightMarket').reason, /trust/);
  adjustTrust(s, 'rao', 10);
  assert.match(canOpenHall(s, 'nightMarket').reason, /favour first/, 'then her opening favour (2026-11-06)');
  s.openings = { nightMarket: { status: 'done', jobId: null } };
  s.cash = 1000;
  assert.match(canOpenHall(s, 'nightMarket').reason, /deposit/);
  assert.equal(canOpenHall(s, 'oldTown').ok, false, 'not twice');
  const w = welcome(3);
  const rentBefore = w.rent, capBefore = w.rosterCap, cash = w.cash;
  const o = openHall(w, 'nightMarket');
  const h = hallIn(o, 'nightMarket');
  assert.deepEqual([h.beds, h.rent, h.level], [HALL_SITES.nightMarket.beds, HALL_SITES.nightMarket.rent, 1]);
  assert.equal(o.cash, cash - HALL_SITES.nightMarket.deposit);
  assert.equal(o.rosterCap, capBefore + h.beds, 'the roster limit is all the beds');
  assert.equal(o.rent, rentBefore + h.rent);
  assert.equal(weeklyBill(o).rent, o.rent, 'Sunday pays every hall');
  assert.equal(rankOf(o).id, 'street', 'two halls: a street tong');
  assert.equal(residents(o, 'nightMarket').length, 0, 'nobody lives there yet');
});

test('each hall expands on its own, the cost growing with its level; the old safehouse expansion is the home hall\'s', () => {
  const o = openHall(welcome(4), 'nightMarket');
  o.cash = 100000;
  const e = expandHall(o, 'nightMarket');
  assert.equal(hallIn(e, 'nightMarket').beds, HALL_SITES.nightMarket.beds + 2);
  assert.equal(hallIn(e, 'nightMarket').level, 2);
  assert.equal(e.cash, o.cash - 20000, 'each hall takes its next part at that part\'s price (2026-11-07)');
  const home = expandSafehouse(o);
  assert.equal(hallIn(home, 'oldTown').beds, hallIn(o, 'oldTown').beds + 2);
  assert.equal(home.rosterCap, o.rosterCap + 2);
  // Old Town is a compound (2026-11-07): it expands by taking its next part, at that part's price, until the block is ours.
  assert.equal(home.cash, o.cash - 20000, 'the flat costs its own price');
  let all = home;
  all = expandSafehouse(all); all = expandSafehouse(all);
  assert.equal(hallIn(all, 'oldTown').level, 4);
  assert.equal(nextHallExpansion(all, 'oldTown'), null, 'the whole block is ours: nothing left to take');
  assert.equal(expandSafehouse(all), all);
});

test('moving in takes the day: they count there at once, can\'t work today, and are free tomorrow', () => {
  let s = openHall(welcome(5), 'nightMarket');
  const op = s.crew[0];
  assert.ok(canMove(s, op.id, 'nightMarket').ok);
  s = moveToHall(s, op.id, 'nightMarket');
  assert.equal(residents(s, 'nightMarket').length, 1, 'presence counts the same day');
  assert.deepEqual(availability(s, s.crew[0]), { ok: false, reason: 'settling in' });
  assert.equal(canMove(s, op.id, 'nightMarket').ok, false, 'already lives there');
  s = moveToHall(s, s.crew[1].id, 'nightMarket');
  assert.equal(freeBeds(s, 'nightMarket'), 0);
  assert.match(canMove(s, s.crew[2].id, 'nightMarket').reason, /No free bed/);
  s = advanceDay(s);
  assert.equal(availability(s, s.crew[0]).ok, true, 'free the next day');
});

test('a hire takes a free bed (home first), and a full tong can\'t hire', () => {
  let s = openHall(welcome(6), 'nightMarket');
  s.recruits = [];
  for (let d = 0; d < 14 && !s.recruits.length; d++) s = advanceDay(s);
  const lead = s.recruits[0];
  assert.ok(lead, 'a lead to hire');
  s.cash = 50000;
  const homeFree = freeBeds(s, 'oldTown');
  const h = hire(s, lead.id);
  assert.equal(h.crew.at(-1).hall, homeFree > 0 ? 'oldTown' : 'nightMarket');
  const full = structuredClone(s);
  full.halls.forEach((x) => { x.beds = residents(full, x.district).length; });
  syncHalls(full);
  assert.match(canHire(full, lead).reason, /bed/);
});

test("a contact offers a place once we're welcome there, once", () => {
  const s = welcome(7);
  introduceHalls(s);
  const offer = s.inbox.find((m) => m.kind === 'hall-offer');
  assert.equal(offer.payload.district, 'nightMarket');
  introduceHalls(s);
  assert.equal(s.inbox.filter((m) => m.kind === 'hall-offer').length, 1);
});

test('a v37 save: the safehouse becomes the Old Town hall with its beds, rent and level; everyone lives there', async () => {
  const s = createNewGame({ seed: 8, startCrew: 'fresh' });
  delete s.halls; delete s.hallOffers;
  for (const op of s.crew) delete op.hall;
  s.rosterCap = 10; s.rent = 2500; s.safehouseLevel = 2;
  s.version = 37;
  const loaded = await importSave({ text: async () => JSON.stringify(s) });
  assert.equal(loaded.version, SAVE_VERSION);
  assert.deepEqual(loaded.halls.map((h) => [h.district, h.beds, h.rent, h.level]), [['oldTown', 10, 2500, 2]]);
  assert.equal(loaded.rosterCap, 10);
  assert.equal(loaded.rent, 2500);
  assert.equal(loaded.safehouseLevel, undefined);
  assert.ok(loaded.crew.every((o) => o.hall === 'oldTown'));
  assert.deepEqual(loaded.hallOffers, []);
});
