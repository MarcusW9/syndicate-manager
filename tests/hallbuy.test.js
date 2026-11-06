// Buying a hall and the work board (DESIGN.md 2026-11-06, after the balance pass): a hall can be
// bought for 26 weeks of its rent, then pays none; a work board brokers small outside work each
// Sunday for the tong's cut, never touching the tong's own board.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame, SAVE_VERSION } from '../src/core/state.js';
import { advanceDay, calendar, weeklyBill } from '../src/core/time.js';
import { syncHalls, hallIn, buyPrice, buyHall, nextHallExpansion, expandHall } from '../src/core/halls.js';
import { HALL_BUY } from '../src/data/halls.js';
import { BROKER } from '../src/data/hallBuild.js';
import { brokerWeek, brokeredWork } from '../src/core/broker.js';
import { trustOf } from '../src/core/clients.js';

globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
const { importSave } = await import('../src/save/save.js');

const tong = (cash = 200000) => {
  const s = createNewGame({ seed: 7, startCrew: 'fresh' });
  s.inbox = [];
  s.halls.push({ district: 'nightMarket', beds: 2, rent: 500, level: 1, opened: 1, build: [], owned: false });
  syncHalls(s);
  s.cash = cash;
  return s;
};
const withBoard = (s, d = 'nightMarket', level = 1) => { const h = hallIn(s, d); h.level = level; h.build = [{ id: `${d}-1`, piece: 'workboard', x: 1, y: 1, rot: 0, day: 1 }]; return s; };
const toSunday = (s) => { while (!calendar(s.day + 1).isSunday) s = advanceDay(s); return s; };

test('buying a hall: 26 weeks of its rent, once; then no rent, and expanding it adds none', () => {
  let s = tong();
  assert.equal(buyPrice(s, 'nightMarket'), 500 * HALL_BUY.weeks);
  const rentBefore = s.rent;
  s = buyHall(s, 'nightMarket');
  const h = hallIn(s, 'nightMarket');
  assert.equal(h.owned, true);
  assert.equal(h.rent, 0);
  assert.equal(s.cash, 200000 - 500 * HALL_BUY.weeks);
  assert.equal(s.rent, rentBefore - 500, "the week's rent drops by the hall's");
  assert.equal(weeklyBill(s).rent, s.rent);
  assert.equal(buyPrice(s, 'nightMarket'), null, "it's ours already");
  assert.equal(nextHallExpansion(s, 'nightMarket').rentIncrease, 0);
  s = expandHall(s, 'nightMarket');
  assert.equal(hallIn(s, 'nightMarket').rent, 0, 'bigger, still no rent');
  const poor = tong(100);
  assert.equal(buyHall(poor, 'nightMarket'), poor, 'not without the money');
  assert.equal(buyPrice(tong(), 'oldTown'), hallIn(tong(), 'oldTown').rent * HALL_BUY.weeks, 'the home hall can be bought too');
});

test('the work board brokers its own work each Sunday, never the tong\'s board', () => {
  let s = withBoard(tong());
  s = toSunday(s);
  const jobs = structuredClone(s.jobs);
  const cash = s.cash;
  const bill = weeklyBill(s).total;
  s = advanceDay(s); // Sunday: the board's week, then the bills
  const week = s.inbox.find((m) => m.kind === 'week');
  assert.match(week.body, /Work boards: the Night Market: \d brokered/);
  const fee = s.cash - (cash - bill);
  assert.ok(fee >= 0 && fee <= Math.max(...brokeredWork('nightMarket').map((t) => Math.round((t.pay * BROKER.cut) / 50) * 50)), `fee ${fee}`);
  for (const j of jobs) assert.ok(s.jobs.some((x) => x.id === j.id) || j.expiresDay < s.day, `${j.id} still on the board (or simply expired)`);
});

test('as many jobs as the hall\'s level; a shut hall brokers nothing; nothing without a board', () => {
  const s = withBoard(tong(), 'nightMarket', 3);
  const r = brokerWeek(structuredClone(s));
  assert.match(r.lines[0], /: (3 brokered|2 brokered, 1 went wrong|1 brokered, 2 went wrong|0 brokered, 3 went wrong)/);
  const shut = withBoard(tong());
  hallIn(shut, 'nightMarket').shutUntil = shut.day + 5;
  assert.deepEqual(brokerWeek(shut), { total: 0, lines: [] });
  assert.deepEqual(brokerWeek(tong()), { total: 0, lines: [] });
});

test('over many weeks: about one in ten goes wrong (trust falls), and freelancers sometimes ask to join', () => {
  let wrong = 0, done = 0, leads = 0;
  for (let w = 0; w < 200; w++) {
    const s = withBoard(tong(), 'nightMarket', 2);
    s.day = 7 * w + 6;
    s.recruits = [];
    const before = trustOf(s, 'rao');
    const r = brokerWeek(s);
    for (const l of r.lines) { const m = /(\d) brokered(?:, (\d) went wrong)?/.exec(l); done += Number(m[1]); wrong += Number(m[2] ?? 0); }
    leads += s.recruits.length;
    if (/went wrong/.test(r.lines[0]) && brokeredWork('nightMarket').some((t) => t.id)) assert.ok(trustOf(s, 'rao') <= before);
  }
  const share = wrong / (wrong + done);
  assert.ok(share > 0.05 && share < 0.16, `went wrong ${Math.round(share * 100)}%`);
  assert.ok(leads > 15 && leads < 50, `${leads} leads in 200 weeks`);
});

test('a v43 save upgrades: no hall is owned yet', async () => {
  const s = tong();
  s.version = 43;
  for (const h of s.halls) delete h.owned;
  const up = await importSave({ text: async () => JSON.stringify(s) });
  assert.equal(up.version, SAVE_VERSION);
  assert.ok(up.halls.every((h) => h.owned === false));
});
