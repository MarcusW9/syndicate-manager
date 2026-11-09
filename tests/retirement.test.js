// Retirement and the Hall of Legends (renown slice 6, part D1). Run with: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame, SAVE_VERSION } from '../src/core/state.js';
import { freshRecord } from '../src/core/record.js';
import { retireChance, checkRetirement, stayWage } from '../src/core/retirement.js';
import { resolveDecision } from '../src/core/decisions.js';
import { RETIREMENT } from '../src/data/retirement.js';

globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
const { importSave } = await import('../src/save/save.js');

const veteran = (s, weeks, extra = {}) => {
  const op = s.crew[0];
  op.record = { ...freshRecord(), activeWeeks: weeks, jobs: weeks * 2, ...extra };
  return op;
};
const game = (seed = 1) => createNewGame({ seed, startCrew: 'fresh' });
/** Run Sundays until a request is posted (15% a runner a week at most). */
const askUntil = (s) => { for (let i = 1; i < 80 && !s.inbox.some((m) => m.kind === 'retirement'); i++) { s.day = i * 7; checkRetirement(s); } return s.inbox.find((m) => m.kind === 'retirement'); };
const sundays = (s, n, from = 7) => { for (let i = 0; i < n; i++) { s.day = from + i * 7; checkRetirement(s); } };

test('nobody can ask before 52 active weeks', () => {
  const s = game();
  const op = veteran(s, RETIREMENT.minWeeks - 1, { seriousInjuries: 5 });
  assert.equal(retireChance(op), 0);
  sundays(s, 200);
  assert.equal(s.inbox.filter((m) => m.kind === 'retirement').length, 0);
});

test('the chance rises with weeks and injuries, and is capped', () => {
  const s = game();
  const a = retireChance(veteran(s, 52));
  assert.equal(a, RETIREMENT.base);
  assert.ok(retireChance(veteran(s, 82)) > a);
  assert.ok(retireChance(veteran(s, 52, { seriousInjuries: 2 })) > a);
  assert.equal(retireChance(veteran(s, 2000, { seriousInjuries: 40 })), RETIREMENT.cap);
  const young = veteran(s, 400); young.fame = 'elite'; young.age = 30;
  assert.equal(retireChance(young), RETIREMENT.eliteCap);
});

test('a request is a decision: one a week, never for someone away, and nothing moves until they answer', () => {
  const s = game(3);
  for (const op of s.crew) op.record = { ...freshRecord(), activeWeeks: 400, seriousInjuries: 12 };
  const before = s.rngCounter;
  askUntil(s);
  const asks = s.inbox.filter((m) => m.kind === 'retirement');
  assert.equal(asks.length, 1);
  assert.equal(asks[0].resolved, false);
  assert.equal(s.rngCounter, before);
  assert.equal(s.crew.length, 5);
  const each = new Map();
  for (let i = 0; i < 80; i++) { s.day += 7; checkRetirement(s); each.set(s.day, s.inbox.filter((m) => m.kind === 'retirement' && m.day === s.day).length); }
  assert.ok([...each.values()].every((n) => n <= 1)); // never more than one a week
  const ids = s.inbox.filter((m) => m.kind === 'retirement').map((m) => m.payload.opId);
  assert.equal(new Set(ids).size, ids.length); // nobody is asked while their request is open
  const t = game(3);
  for (const op of t.crew) { op.record = { ...freshRecord(), activeWeeks: 400, seriousInjuries: 12 }; }
  t.awayJobs = [{ mission: { crewIds: t.crew.map((o) => o.id) } }];
  for (let i = 1; i < 80; i++) { t.day = i * 7; checkRetirement(t); }
  assert.equal(t.inbox.filter((m) => m.kind === 'retirement').length, 0);
});

test('Stay one more season: a rise, then 35% the next time; Let them go: gear to the stash and a Hall entry', () => {
  let s = game(3);
  for (const op of s.crew) op.record = { ...freshRecord(), activeWeeks: 400, seriousInjuries: 12 };
  let m = askUntil(s);
  const op = s.crew.find((o) => o.id === m.payload.opId);
  const w = op.wage;
  assert.equal(stayWage(op), Math.round(w * 1.2 / 50) * 50);
  s = resolveDecision(s, m.id, 'stay');
  const stayed = s.crew.find((o) => o.id === op.id);
  assert.equal(stayed.wage, Math.round(w * 1.2 / 50) * 50);
  assert.ok(stayed.retireSnoozeUntil > s.day + 50);
  assert.equal(stayWage(stayed), Math.round(stayed.wage * 1.35 / 50) * 50);

  s = game(3);
  for (const o of s.crew) o.record = { ...freshRecord(), activeWeeks: 400, seriousInjuries: 12 };
  m = askUntil(s);
  const leaving = s.crew.find((o) => o.id === m.payload.opId);
  leaving.gear = { armour: { uid: 'gx', type: 'vest' }, implants: [], bag: [] };
  s = resolveDecision(s, m.id, 'go');
  assert.ok(!s.crew.some((o) => o.id === leaving.id));
  assert.ok(s.stash.some((i) => i.uid === 'gx'));
  assert.equal(s.hall.length, 1);
  assert.equal(s.hall[0].id, leaving.id);
  assert.equal(s.memorial.length, 0);
});

test('a request that lapses leaves them on the crew', () => {
  let s = game(3);
  for (const o of s.crew) o.record = { ...freshRecord(), activeWeeks: 400, seriousInjuries: 12 };
  const m = askUntil(s);
  s.day = m.payload.expiresDay + 3;
  s = resolveDecision(s, m.id, 'go');
  assert.ok(s.crew.some((o) => o.id === m.payload.opId));
  assert.equal(s.hall.length, 0);
});

test('an old save upgrades with an empty Hall', async () => {
  const s = game();
  const old = { ...JSON.parse(JSON.stringify(s)), version: 54 }; delete old.hall;
  const loaded = await importSave(new File([JSON.stringify(old)], 'x.json'));
  assert.equal(loaded.version, SAVE_VERSION);
  assert.deepEqual(loaded.hall, []);
});
