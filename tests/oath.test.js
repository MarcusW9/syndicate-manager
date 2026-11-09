// Sworn runners (part D4). Run with: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame, SAVE_VERSION } from '../src/core/state.js';
import { freshRecord } from '../src/core/record.js';
import { oathEligible, oathCost, oathRead, weeklyOath, swearIn, isSworn } from '../src/core/oath.js';
import { poachChance, weeklyPoach } from '../src/core/mobility.js';
import { resolveDecision } from '../src/core/decisions.js';
import { OATH } from '../src/data/oath.js';

globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
const { importSave } = await import('../src/save/save.js');

const ready = (seed = 2) => {
  const s = createNewGame({ seed, startCrew: 'fresh' });
  const op = s.crew[0];
  op.record = { ...freshRecord(), activeWeeks: OATH.minWeeks }; op.loyalty = OATH.minLoyalty; s.cash = 10000;
  return { s, op };
};

test('eligible at 26 active weeks and 80 loyalty, not before', () => {
  const { op } = ready();
  assert.ok(oathEligible(op));
  op.record.activeWeeks = 25; assert.ok(!oathEligible(op));
  op.record.activeWeeks = 26; op.loyalty = 79; assert.ok(!oathEligible(op));
});

test('one notice only, and the ceremony stays available after "not yet"', () => {
  const { s, op } = ready();
  weeklyOath(s); weeklyOath(s);
  assert.equal(s.inbox.filter((m) => m.id.startsWith('oath-ready')).length, 1);
  assert.ok(op.oathNotified);
  for (let i = 0; i < 10; i++) { s.day += 7; weeklyOath(s); }
  assert.equal(s.inbox.filter((m) => m.id.startsWith('oath-ready')).length, 1);
  assert.ok(oathRead(s, op).ok);
});

test('swearing costs two weeks of wage, re-checks eligibility and cash, and survives loyalty falling', () => {
  const { s, op } = ready();
  const cost = oathCost(op);
  assert.equal(cost, 2 * op.wage);
  const after = swearIn(s, op.id);
  assert.equal(after.cash, s.cash - cost);
  const sworn = after.crew.find((o) => o.id === op.id);
  assert.ok(isSworn(sworn));
  assert.equal(swearIn(after, op.id), after); // not twice
  sworn.loyalty = 10; assert.ok(isSworn(sworn));
  s.cash = cost - 1; assert.equal(swearIn(s, op.id), s); // too poor
  op.loyalty = 50; s.cash = 10000; assert.equal(swearIn(s, op.id), s); // no longer eligible
});

test('sworn runners are approached at a tenth of the rate', () => {
  const a = { tier: 'rookie', loyalty: 0 };
  assert.ok(Math.abs(poachChance({ ...a, sworn: 5 }) - poachChance(a) * OATH.approachMult) < 1e-12);
});

test('a sworn runner sold costs every other crew member 6 loyalty; an ordinary exit costs 2', () => {
  const run = (sworn) => {
    const s = createNewGame({ seed: 2, startCrew: 'fresh' });
    s.halls = [{ district: 'a' }, { district: 'b' }];
    for (const t of s.rivals.tongs) t.wealth = 60000;
    for (const op of s.crew) { op.loyalty = 50; op.tier = 'rookie'; }
    for (const op of s.crew) op.loyalty = 0;
    let m;
    for (let i = 1; i < 300 && !m; i++) { s.day = i * 7; weeklyPoach(s); m = s.inbox.find((x) => x.kind === 'poach'); }
    const leaver = s.crew.find((o) => o.id === m.payload.opId);
    if (sworn) leaver.sworn = 1;
    for (const o of s.crew) o.loyalty = 50;
    const after = resolveDecision(s, m.id, 'go');
    return after.crew.map((o) => o.loyalty);
  };
  assert.ok(run(false).every((l) => l === 48));
  assert.ok(run(true).some((l) => l === 44));
  assert.ok(run(true).every((l) => l === 44));
});

test('a v56 save upgrades; anyone already eligible is not met with a notice', async () => {
  const { s, op } = ready();
  s.version = 56; delete op.sworn; delete op.oathNotified;
  const loaded = await importSave(new File([JSON.stringify(s)], 'x.json'));
  assert.equal(loaded.version, SAVE_VERSION);
  assert.equal(loaded.crew[0].sworn, null);
  assert.equal(loaded.crew[0].oathNotified, true);
});

test('selling a sworn runner explains the loyalty drop; an ordinary one does not mention the ledger', async () => {
  const { POACH_TEXT } = await import('../src/data/mobility.js');
  const run = (sworn) => {
    const s = createNewGame({ seed: 2, startCrew: 'fresh' });
    s.halls = [{ district: 'a' }, { district: 'b' }];
    for (const t of s.rivals.tongs) t.wealth = 60000;
    for (const op of s.crew) { op.loyalty = 0; op.tier = 'rookie'; }
    let m;
    for (let i = 1; i < 300 && !m; i++) { s.day = i * 7; weeklyPoach(s); m = s.inbox.find((x) => x.kind === 'poach'); }
    if (sworn) s.crew.find((o) => o.id === m.payload.opId).sworn = 1;
    return resolveDecision(s, m.id, 'go').inbox.find((x) => x.id === m.id).payload.outcome;
  };
  assert.ok(run(true).includes(POACH_TEXT.soldSworn));
  assert.ok(!run(false).includes('ledger'));
});
