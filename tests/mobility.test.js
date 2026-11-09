// Rival offers to our runners (part D3). Run with: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame } from '../src/core/state.js';
import { weeklyPoach, poachChance, matchPay } from '../src/core/mobility.js';
import { resolveDecision } from '../src/core/decisions.js';
import { buyoutAmount } from '../src/core/dossier.js';
import { MOBILITY } from '../src/data/mobility.js';

const street = (seed = 2) => {
  const s = createNewGame({ seed, startCrew: 'fresh' });
  s.halls = [{ district: 'a' }, { district: 'b' }]; // two halls: Street rank
  for (const t of s.rivals.tongs) t.wealth = 60000;
  for (const op of s.crew) { op.loyalty = 0; op.tier = 'rookie'; }
  return s;
};
const offerUntil = (s) => { for (let i = 1; i < 200 && !s.inbox.some((m) => m.kind === 'poach'); i++) { s.day = i * 7; weeklyPoach(s); } return s.inbox.find((m) => m.kind === 'poach'); };

test('no offers while we are below Street rank', () => {
  const s = street(); s.halls = [{ district: 'a' }];
  for (let i = 1; i < 120; i++) { s.day = i * 7; weeklyPoach(s); }
  assert.equal(s.inbox.filter((m) => m.kind === 'poach').length, 0);
});

test('loyalty and standing make an offer rarer', () => {
  const op = { tier: 'rookie', loyalty: 0 };
  const loyal = { tier: 'rookie', loyalty: 90 };
  assert.ok(poachChance(loyal) < poachChance(op) / 10);
  assert.ok(poachChance({ tier: 'veteran', loyalty: 0 }) < poachChance(op));
  assert.ok(poachChance({ tier: 'rookie', loyalty: 0, legend: 'x' }) < poachChance({ tier: 'rookie', loyalty: 0, fame: 'elite' }));
});

test('an offer is a decision with a week to answer; no roll in the game moves', () => {
  const s = street();
  const before = s.rngCounter;
  const m = offerUntil(s);
  assert.ok(m, 'an offer arrives');
  assert.equal(m.resolved, false);
  assert.equal(s.rngCounter, before);
  assert.equal(m.payload.expiresDay, m.day + 7);
  assert.ok(s.crew.some((o) => o.id === m.payload.opId));
});

test('Match it: they stay on a higher wage, no buyout; Let them go: the rival pays us the same buyout we would pay', () => {
  let s = street();
  const m = offerUntil(s);
  const op = s.crew.find((o) => o.id === m.payload.opId);
  const tong = s.rivals.tongs.find((t) => t.id === m.payload.tongId);
  const cash = s.cash, wealth = tong.wealth, buyout = buyoutAmount(tong, op.wage);
  assert.equal(m.payload.buyout, buyout);
  const kept = resolveDecision(s, m.id, 'match');
  const stayed = kept.crew.find((o) => o.id === op.id);
  assert.equal(stayed.wage, Math.max(op.wage, matchPay(op)));
  assert.equal(kept.cash, cash);
  const gone = resolveDecision(s, m.id, 'go');
  assert.ok(!gone.crew.some((o) => o.id === op.id));
  assert.equal(gone.cash, cash + buyout);
  assert.equal(gone.rivals.tongs.find((t) => t.id === tong.id).wealth, wealth - buyout);
  assert.ok(gone.rivals.cards.some((c) => c.tongId === tong.id && c.name === op.name));
  assert.equal(gone.hall?.length ?? 0, 0);
});

test('unanswered, they go at the end of the week, but not while out on a job', () => {
  const s = street();
  const m = offerUntil(s);
  const id = m.payload.opId;
  s.awayJobs = [{ mission: { crewIds: [id] } }];
  s.day = m.payload.expiresDay; weeklyPoach(s);
  assert.ok(s.crew.some((o) => o.id === id));
  s.awayJobs = [];
  s.day = m.payload.expiresDay + 7; weeklyPoach(s);
  assert.ok(!s.crew.some((o) => o.id === id));
  assert.equal(s.inbox.find((x) => x.id === m.id).resolved, true);
});

test('a tong that cannot cover the buyout makes no offer', () => {
  const s = street();
  for (const t of s.rivals.tongs) t.wealth = 100;
  for (let i = 1; i < 200; i++) { s.day = i * 7; weeklyPoach(s); }
  assert.equal(s.inbox.filter((m) => m.kind === 'poach').length, 0);
  assert.ok(MOBILITY.cashCover > 0);
});
