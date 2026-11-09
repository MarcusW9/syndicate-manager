// Raids on the halls (core/raids.js; DESIGN.md 2026-11-05, the tong's Phase 2 slice 3: police
// raids). The promises: rare, warned days ahead, only on a hall in a hot district, a call with an
// exit, walking out never hurts anyone, and nobody dies unless the player chose to keep fighting.
// Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame, SAVE_VERSION } from '../src/core/state.js';
import { advanceDay, isBlocked } from '../src/core/time.js';
import { availability } from '../src/core/crew.js';
import { setHeat, heatIn } from '../src/core/heat.js';
import { resolveDecision } from '../src/core/decisions.js';
import { runBattle, pullBack } from '../src/core/runbattle.js';
import { resolvePending, closeMission, describePending } from '../src/core/mission.js';
import { openRaids, raidChoices, payOffRaid, setRaidPlan, raidPrice, defenders, hallShut, checkRaids } from '../src/core/raids.js';
import { RAID } from '../src/data/raids.js';
import { hallIn, canMove } from '../src/core/halls.js';
import { playWeeks } from './play.js';

globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
const { importSave } = await import('../src/save/save.js');

/** A game with a second hall in the Docks, where the police are on the take. */
function withDocksHall(seed = 1) {
  const s = createNewGame({ seed, startCrew: 'fresh' });
  s.halls.push({ district: 'docks', beds: 2, rent: 1200, level: 1, opened: 1 });
  const [a, b] = s.crew;
  a.hall = 'docks';
  b.hall = 'docks';
  s.cash = 20000;
  return s;
}

/** Keep a district hot and move day by day until a raid is warned there. */
function untilWarned(s, district, heat = 8, days = 60) {
  for (let i = 0; i < days && !openRaids(s).some((r) => r.district === district); i++) {
    setHeat(s, district, heat);
    s = advanceDay(s);
    setHeat(s, district, heat);
    for (const r of openRaids(s)) r.plan = 'ask'; // these tests answer the call themselves
  }
  return s;
}

/** Move on to the raid's day, keeping the heat up: returns the state with the call waiting. */
function untilCall(s, district, heat = 8) {
  for (let i = 0; i < 10 && !s.inbox.some((m) => m.kind === 'raid' && !m.resolved); i++) { s = advanceDay(s); setHeat(s, district, heat); }
  return s;
}
const callOf = (s) => s.inbox.find((m) => m.kind === 'raid' && !m.resolved);

/** Play a held raid's fight to its end. door: what to do when someone is at death's door. */
function fight(s, { door = 'out', standoff = 'press' } = {}) {
  for (let n = 0; s.activeMission && !s.activeMission.done && n < 60; n++) {
    const am = s.activeMission;
    if (am.pending) s = resolvePending(s, am.pending.kind === 'door' ? door : am.pending.kind === 'standoff' ? standoff : describePending(s).choices[0].id);
    else s = runBattle(s);
  }
  return s;
}

test('no raid without a hall: a hot district we only work in is never raided', () => {
  let s = createNewGame({ seed: 3, startCrew: 'fresh' });
  for (let i = 0; i < 90; i++) { setHeat(s, 'docks', 10); s = advanceDay(s); }
  assert.equal((s.raids ?? []).length, 0);
});

test('a hall in a hot district draws a warning, days ahead, and only one at a time', () => {
  let s = untilWarned(withDocksHall(2), 'docks');
  const [raid] = openRaids(s);
  assert.ok(raid, 'warned within 60 days at heat 8');
  assert.equal(raid.district, 'docks');
  assert.equal(raid.day - raid.warnedDay, RAID.warnDays);
  assert.ok(s.inbox.some((m) => m.kind === 'raid-warning' && m.payload.raidId === raid.id && !m.blocking), 'the warning is a message that blocks nothing');
  assert.equal(isBlocked(s), false, 'days can pass while it is coming');
  for (let i = 0; i < RAID.warnDays - 1; i++) { setHeat(s, 'docks', 9); s = advanceDay(s); }
  assert.equal(openRaids(s).length, 1, 'no second raid on the same hall while one is coming');
});

test('below the heat line no hall is raided, and after a raid the hall has a quiet spell', () => {
  let s = withDocksHall(4);
  for (let i = 0; i < 90; i++) { setHeat(s, 'docks', RAID.heatAt - 1); s = advanceDay(s); }
  assert.equal((s.raids ?? []).length, 0, `heat ${RAID.heatAt - 1} never draws one`);
  s = untilCall(untilWarned(s, 'docks'), 'docks');
  s = resolveDecision(s, callOf(s).id, 'withdraw');
  const first = s.raids[0];
  for (let i = 0; i < RAID.cooldownDays - RAID.warnDays - 1; i++) { setHeat(s, 'docks', 10); s = advanceDay(s); }
  assert.equal(s.raids.length, 1, 'not raided again within the quiet spell');
  assert.ok(s.day - first.warnedDay < RAID.cooldownDays);
});

test('careful play is never raided (the tong sims stay clear)', () => {
  for (let seed = 1; seed <= 12; seed++) {
    const { state } = playWeeks(6, seed, undefined, { startCrew: 'fresh' });
    // Heat never draws a raid on careful play. A failed getaway can: the followers are the raid
    // (core/piloting.js, 2026-11-08), so those are the only ones allowed.
    assert.equal((state.raids ?? []).filter((r) => !r.followed).length, 0, `seed ${seed}`);
  }
});

test('raid day: a blocking call with an exit; Continue waits for it', () => {
  const s = untilCall(untilWarned(withDocksHall(5), 'docks'), 'docks');
  const msg = callOf(s);
  assert.ok(msg && msg.blocking);
  assert.equal(isBlocked(s), true);
  const raid = s.raids.find((r) => r.id === msg.payload.raidId);
  const ids = raidChoices(s, raid).map((c) => c.id);
  assert.ok(ids.includes('withdraw'), 'walking out is always there');
  assert.ok(ids.includes('hold'), 'two of ours are home to hold it');
  assert.ok(ids.includes('pay'), 'the Wet Sleeve can be paid in the Docks');
});

test('walking out: nobody hurt, the hall loses what was kept there, pays repairs and shuts for a week', () => {
  let s = untilCall(untilWarned(withDocksHall(6), 'docks'), 'docks');
  const home = defenders(s, 'docks').map((o) => o.id);
  const before = { cash: s.cash, heat: heatIn(s, 'docks'), injuries: s.crew.map((o) => o.condition.injury) };
  s = resolveDecision(s, callOf(s).id, 'withdraw');
  assert.equal(s.activeMission, null);
  assert.deepEqual(s.crew.map((o) => o.condition.injury), before.injuries, 'nobody hurt');
  assert.equal(s.cash, before.cash - RAID.keptPerLevel - RAID.repairs);
  assert.equal(heatIn(s, 'docks'), before.heat - RAID.withdrawCools);
  assert.ok(hallShut(s, 'docks'));
  for (const id of home) assert.match(availability(s, s.crew.find((o) => o.id === id)).reason, /lying low/);
  assert.equal(canMove(s, s.crew.find((o) => o.hall !== 'docks').id, 'docks').ok, false, 'nobody moves into a shut hall');
  assert.equal(isBlocked(s), false);
  for (let i = 0; i < RAID.shutDays; i++) s = advanceDay(s);
  assert.equal(hallShut(s, 'docks'), false, 'open again after a week');
  assert.ok(availability(s, s.crew.find((o) => o.id === home[0])).ok);
});

test('holding: a fight on the hall map, whoever is home against the raiders; nobody dies unless you keep fighting with them down', () => {
  let held = 0;
  let walked = 0;
  for (let seed = 1; seed <= 40; seed++) {
    let s = untilCall(untilWarned(withDocksHall(seed), 'docks', 9), 'docks', 9);
    const crew = s.crew.length;
    s = resolveDecision(s, callOf(s).id, 'hold');
    assert.ok(s.activeMission?.raid, 'the raid is the job on screen');
    assert.equal(s.activeMission.battle.foe, 'the Wet Sleeve');
    assert.ok(s.activeMission.battle.spots?.crew?.length, 'they stand on the hall map\'s spots');
    s = fight(s, { door: 'out', standoff: seed % 2 ? 'press' : 'out' });
    assert.ok(s.activeMission.done);
    assert.equal(s.activeMission.result.deaths.length, 0, `seed ${seed}: nobody chose to keep fighting`);
    s = closeMission(s);
    assert.equal(s.crew.length, crew);
    assert.equal(s.memorial.length, 0);
    const raid = s.raids.at(-1);
    assert.ok(raid.done);
    if (raid.outcome === 'held') held += 1;
    if (raid.outcome === 'withdrew') { walked += 1; assert.ok(hallShut(s, 'docks')); }
  }
  assert.ok(held > 0 && walked > 0, `both ways happen (held ${held}, walked out ${walked})`);
});

test('keeping on fighting with someone down is the only way a raid can cost a life', () => {
  let pushed = 0;
  for (let seed = 1; seed <= 40; seed++) {
    let s = untilCall(untilWarned(withDocksHall(seed), 'docks', 10), 'docks', 10);
    s = resolveDecision(s, callOf(s).id, 'hold');
    s = fight(s, { door: 'fight', standoff: 'press' });
    const am = s.activeMission;
    const chose = am.events.some((e) => e.kind === 'decision' && e.push);
    if (chose) pushed += 1;
    if (!chose) assert.equal(am.result.deaths.length, 0, `seed ${seed}`);
  }
  assert.ok(pushed > 0, 'someone went down in some raid');
});

test('pulling back mid-fight is walking out: everyone home, the hall pays the cost', () => {
  let s = untilCall(untilWarned(withDocksHall(7), 'docks', 10), 'docks', 10);
  s = resolveDecision(s, callOf(s).id, 'hold');
  s = runBattle(s);
  if (s.activeMission.pending) s = resolvePending(s, 'out');
  else s = pullBack(s);
  assert.ok(s.activeMission.done);
  assert.equal(s.activeMission.result.deaths.length, 0);
  s = closeMission(s);
  assert.equal(s.raids.at(-1).outcome, 'withdrew');
  assert.ok(hallShut(s, 'docks'));
});

test('paying off: only where the police are on the take, only with the cash, and the day passes quietly', () => {
  let s = untilWarned(withDocksHall(8), 'docks');
  const raid = openRaids(s)[0];
  const price = raidPrice(s, raid);
  const poor = { ...structuredClone(s), cash: price - 1 };
  assert.equal(payOffRaid(poor, raid.id), poor, 'not without the money');
  s = payOffRaid(s, raid.id);
  assert.equal(s.raids[0].answer, 'paid');
  for (let i = 0; i < RAID.warnDays; i++) { s = advanceDay(s); setHeat(s, 'docks', 8); }
  assert.ok(!s.inbox.some((m) => m.kind === 'raid' && !m.resolved), 'no call on the day');
  assert.equal(s.raids[0].outcome, 'paid');
  // Old Town's police can't be bought: no pay option, before or on the day.
  let t = untilCall(untilWarned(createNewGame({ seed: 9, startCrew: 'fresh' }), 'oldTown'), 'oldTown');
  const r2 = t.raids.at(-1);
  assert.equal(payOffRaid(t, r2.id), t);
  assert.ok(!raidChoices(t, r2).some((c) => c.id === 'pay'));
});

test('with nobody home, holding is not offered, but walking out is', () => {
  let s = untilWarned(withDocksHall(10), 'docks');
  for (const op of s.crew.filter((o) => o.hall === 'docks')) op.condition.awayUntil = s.day + 10;
  s = untilCall(s, 'docks');
  const raid = s.raids.at(-1);
  assert.deepEqual(raidChoices(s, raid).map((c) => c.id).filter((id) => id !== 'pay'), ['withdraw']);
});

test('a v39 save upgrades with no raids', async () => {
  const s = createNewGame({ seed: 11, startCrew: 'fresh' });
  delete s.raids;
  s.version = 39;
  const loaded = await importSave({ text: async () => JSON.stringify(s) });
  assert.equal(loaded.version, SAVE_VERSION);
  assert.deepEqual(loaded.raids, []);
  assert.equal(hallIn(loaded, 'oldTown').shutUntil, undefined);
  checkRaids(loaded);
});

test('not deciding is a decision: with no plan, whoever is home holds the hall at the door', () => {
  let s = untilWarned(withDocksHall(5), 'docks');
  for (const r of openRaids(s)) r.plan = null;
  for (let i = 0; i < 10 && !s.activeMission; i++) { s = advanceDay(s); setHeat(s, 'docks', 8); }
  assert.ok(s.activeMission?.raid, 'the fight at the hall is on screen');
  assert.equal(s.raids.at(-1).answer, 'hold');
});

test('a plan to clear out is carried out at the door: nobody hurt, the hall shut', () => {
  let s = untilWarned(withDocksHall(5), 'docks');
  s = setRaidPlan(s, openRaids(s)[0].id, 'clear');
  for (let i = 0; i < 10 && !hallShut(s, 'docks'); i++) { s = advanceDay(s); setHeat(s, 'docks', 8); }
  assert.equal(hallShut(s, 'docks'), true);
  assert.equal(s.raids.at(-1).outcome, 'withdrew');
});

test('nobody home and no plan: the call waits for the player', () => {
  let s = untilWarned(withDocksHall(5), 'docks');
  for (const r of openRaids(s)) r.plan = null;
  for (const o of s.crew) o.hall = 'home';
  for (let i = 0; i < 10 && !s.inbox.some((m) => m.kind === 'raid' && !m.resolved); i++) { s = advanceDay(s); setHeat(s, 'docks', 8); }
  assert.ok(s.inbox.some((m) => m.kind === 'raid' && !m.resolved));
});
