// The founder pick (DESIGN.md, 2026-10-28): a new game starts smaller. Six generated rookie
// candidates, one of each core role plus one more; the player picks three before day 1 starts.

import test from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame, chooseFounders } from '../src/core/state.js';
import { FRESH_CREW_ROLES, FOUNDER_CANDIDATES, FOUNDERS_TO_PICK } from '../src/core/recruits.js';
import { isBlocked, advanceDay } from '../src/core/time.js';
import { validateCrew } from '../src/core/validate.js';
import { primaryStat } from '../src/core/development.js';
import { importSave } from '../src/save/save.js';
import { SAVE_VERSION } from '../src/core/state.js';

const asFile = (obj) => ({ text: async () => JSON.stringify(obj) });
import { NAMES } from '../src/config/names.js';

const pickGame = (seed) => createNewGame({ seed, startCrew: 'pick' });

test('a new game offers six rookie candidates, one of each core role and one more', () => {
  for (let seed = 1; seed <= 300; seed++) {
    const s = pickGame(seed);
    const c = s.founding.candidates;
    assert.equal(s.crew.length, 0, `seed ${seed}: nobody on the crew yet`);
    assert.equal(c.length, FOUNDER_CANDIDATES);
    for (const role of FRESH_CREW_ROLES) assert.ok(c.some((r) => r.role === role), `seed ${seed}: a ${role}`);
    assert.ok(c.every((r) => r.quality === 'rookie' && r.age >= 18 && r.age <= 24), `seed ${seed}: rookies 18-24`);
    assert.ok(c.every((r) => { const m = r.stats[primaryStat(r)]; return m >= 8 && m <= 11; }), `seed ${seed}: raw`);
    const handles = [...c, ...s.freelancers].map((r) => r.handle);
    assert.equal(new Set(handles).size, handles.length, `seed ${seed}: no handle twice, freelancers included`);
  }
});

test('the day can\'t start until three are picked', () => {
  const s = pickGame(5);
  assert.ok(isBlocked(s));
  const ids = s.founding.candidates.map((r) => r.id);
  assert.equal(chooseFounders(s, ids.slice(0, 2)), s, 'two is not enough');
  assert.equal(chooseFounders(s, ids.slice(0, 4)), s, 'four is too many');
  assert.equal(chooseFounders(s, [ids[0], ids[0], ids[1]]), s, 'nobody twice');
  assert.equal(chooseFounders(s, [ids[0], ids[1], 'nobody']), s, 'only candidates');
  const t = chooseFounders(s, [ids[1], ids[3], ids[5]]);
  assert.equal(t.crew.length, FOUNDERS_TO_PICK);
  assert.deepEqual(t.crew.map((o) => o.id), [ids[1], ids[3], ids[5]]);
  assert.equal(t.founding, null);
  assert.ok(!isBlocked(t));
  assert.deepEqual(validateCrew(t.crew), []);
  assert.ok(t.crew.every((o) => o.condition && o.trust && o.history[0] === 'Day 1: one of the founding crew'));
  assert.equal(advanceDay(t).day, 2);
});

test('Joss asks first, then welcomes the three by name', () => {
  const s = pickGame(9);
  const w = (st) => st.inbox.find((m) => m.id === 'welcome').body;
  assert.match(w(s), /who's in\?/);
  const ids = s.founding.candidates.slice(0, 3).map((r) => r.id);
  const t = chooseFounders(s, ids);
  for (const o of t.crew) assert.ok(w(t).includes(o.handle), o.handle);
  assert.match(w(t), new RegExp(`— ${NAMES.partner}$`));
  assert.doesNotMatch(w(t), /undefined|\{\w+\}/);
});

test('the founders work for street wages, about three fifths of the old five', () => {
  for (let seed = 1; seed <= 200; seed++) {
    const s = pickGame(seed);
    for (const r of s.founding.candidates) assert.ok(r.wage >= 150 && r.wage <= 400, `seed ${seed}: ${r.handle} ${r.wage}`);
  }
});

test('a save made mid-pick loads and still waits for the pick; older saves get no pick', async () => {
  const back = await importSave(asFile(pickGame(11)));
  assert.equal(back.founding.candidates.length, FOUNDER_CANDIDATES);
  assert.ok(isBlocked(back));
  const v24 = createNewGame({ seed: 12, startCrew: 'fresh' });
  delete v24.founding;
  v24.version = 24;
  const old = await importSave(asFile(v24));
  assert.equal(old.version, SAVE_VERSION);
  assert.equal(old.founding, null);
  assert.ok(!isBlocked(old));
});

test('economy: three founders and a careful player survive the first month, hiring or not', async () => {
  const { playWeeks, carefulPolicy } = await import('./play.js');
  for (const opts of [{ startCrew: 'pick' }, { startCrew: 'pick', hireAbove: 10000 }]) {
    const runs = Array.from({ length: 20 }, (_, i) => playWeeks(4, i + 1, carefulPolicy, opts));
    const broke = runs.filter((r) => r.state.cash < 0).length / runs.length;
    assert.ok(broke < 0.1, `${JSON.stringify(opts)}: ${Math.round(broke * 100)}% broke after 4 weeks`);
    assert.ok(runs.every((r) => r.state.crew.length >= 3), 'nobody lost');
  }
});
