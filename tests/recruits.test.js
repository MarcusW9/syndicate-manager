// Recruiting rules. Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame, SAVE_VERSION } from '../src/core/state.js';
import { advanceDay } from '../src/core/time.js';
import { generateRecruit, hire, haggle, canHire, signingFee, expandSafehouse, nextExpansion, STARTING_ROSTER_CAP } from '../src/core/recruits.js';
import { validateRecruit } from '../src/core/validate.js';

globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
const { importSave } = await import('../src/save/save.js');

const batch = (n, seed = 1) => { const s = createNewGame({ seed }); return Array.from({ length: n }, () => generateRecruit(s)); };

test('every generated recruit is valid and 18+ (5,000 recruits)', () => {
  for (const r of batch(5000)) assert.deepEqual(validateRecruit(r), []);
});

test('cast leans Hong Kong Chinese but stays multicultural', () => {
  const rs = batch(2000, 3);
  const hk = rs.filter((r) => r.culture === 'hk').length / rs.length;
  assert.ok(hk > 0.5 && hk < 0.72, `HK share ${hk}`);
  assert.ok(new Set(rs.map((r) => r.culture)).size >= 5, 'at least 5 cultures appear');
});

test('recruit wages follow market price by quality (rookie 400-650, pro 500-900, veteran 650-1150)', () => {
  const bands = { rookie: [400, 650], pro: [500, 900], veteran: [650, 1150] };
  for (const r of batch(2000, 5)) {
    const [lo, hi] = bands[r.quality];
    assert.ok(r.wage >= lo && r.wage <= hi, `${r.quality} ${r.wage}`);
  }
});

test('generation is deterministic for a seed', () => {
  assert.deepEqual(batch(5, 11).map((r) => r.name), batch(5, 11).map((r) => r.name));
});

test('a scout lead arrives every Wednesday and goes cold after a week', () => {
  let s = createNewGame({ seed: 2 });
  s = advanceDay(advanceDay(s)); // Mon -> Wed
  assert.equal(s.recruits.length, 1);
  assert.equal(s.inbox[0].type, 'scout');
  const id = s.recruits[0].id;
  for (let i = 0; i < 8; i++) s = advanceDay(s);
  assert.ok(!s.recruits.some((r) => r.id === id), 'old lead expired');
});

test('short-handed crews get two leads a week', () => {
  let s = createNewGame({ seed: 4 });
  s.crew = s.crew.slice(0, 3);
  s = advanceDay(advanceDay(s));
  assert.equal(s.recruits.length, 2);
});

test('hiring charges the signing fee and adds the operative', () => {
  let s = createNewGame({ seed: 6 });
  s.recruits = [generateRecruit(s)];
  const r = s.recruits[0];
  const cash = s.cash;
  s = hire(s, r.id);
  assert.equal(s.crew.length, 6);
  assert.equal(s.cash, cash - signingFee(r));
  assert.equal(s.recruits.length, 0);
  assert.equal(s.crew.at(-1).condition.injury, 'healthy');
});

test('the roster cap blocks hiring until the safehouse is expanded', () => {
  let s = createNewGame({ seed: 8 });
  s.cash = 100000;
  while (s.crew.length < STARTING_ROSTER_CAP) { s.recruits = [generateRecruit(s)]; s = hire(s, s.recruits[0].id); }
  s.recruits = [generateRecruit(s)];
  assert.equal(canHire(s, s.recruits[0]).ok, false);
  const before = hire(s, s.recruits[0].id);
  assert.equal(before.crew.length, STARTING_ROSTER_CAP, 'hire refused when full');
  const rent = s.rent;
  const cash = s.cash;
  const cost = nextExpansion(s).cost;
  s = expandSafehouse(s);
  assert.equal(s.rosterCap, STARTING_ROSTER_CAP + 2);
  assert.equal(s.rent, rent + 1000);
  assert.equal(s.cash, cash - cost);
  assert.equal(nextExpansion(s).cost, cost * 2, 'each expansion costs more');
  assert.equal(canHire(s, s.recruits[0]).ok, true);
});

test('you cannot hire without the cash for the signing fee', () => {
  const s = createNewGame({ seed: 10 });
  s.recruits = [generateRecruit(s)];
  s.cash = signingFee(s.recruits[0]) - 1;
  assert.equal(hire(s, s.recruits[0].id), s, 'state unchanged');
});

test('haggling works once and never raises the wage', () => {
  for (let seed = 1; seed <= 200; seed++) {
    let s = createNewGame({ seed });
    s.recruits = [generateRecruit(s)];
    const wage = s.recruits[0].wage;
    s = haggle(s, s.recruits[0].id);
    assert.ok(s.recruits[0].wage <= wage);
    assert.equal(haggle(s, s.recruits[0].id), s, 'second haggle does nothing');
  }
});

test('a v2 save upgrades to v3 with recruiting fields', async () => {
  const v2 = createNewGame({ seed: 12 });
  delete v2.recruits; delete v2.recruitSeq; delete v2.rosterCap; delete v2.safehouseLevel;
  v2.version = 2;
  const loaded = await importSave({ text: async () => JSON.stringify(v2) });
  assert.equal(loaded.version, SAVE_VERSION);
  assert.equal(loaded.rosterCap, STARTING_ROSTER_CAP);
  assert.deepEqual(loaded.recruits, []);
});
