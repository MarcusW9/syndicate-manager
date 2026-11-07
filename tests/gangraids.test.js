// Gang raids (core/gangs.js, core/raids.js; DESIGN.md 2026-11-05, the tong's Phase 2). The
// promises: a grudge grows only from jobs that hurt a gang, and fades; a gang raids only a hall on
// its own turf (never Old Town's, the Brass Anchor's ground), and only with a big grudge; a gang
// always takes a settlement; walking out hurts nobody; nobody dies unless the player kept fighting.
// Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame, SAVE_VERSION } from '../src/core/state.js';
import { advanceDay, isBlocked } from '../src/core/time.js';
import { heatIn } from '../src/core/heat.js';
import { resolveDecision } from '../src/core/decisions.js';
import { runBattle } from '../src/core/runbattle.js';
import { resolvePending, describePending, startMission } from '../src/core/mission.js';
import { addOffer, templateById } from '../src/core/jobs.js';
import { MISSIONS } from '../src/data/missions.js';
import { GANGS, GRUDGE, grudgeOf, jobGrudge, addGrudge, gangsOn } from '../src/core/gangs.js';
import { openRaids, raidChoices, payOffRaid, raidPrice, hallShut, isGangRaid } from '../src/core/raids.js';
import { playMission } from './play.js';

globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
const { importSave } = await import('../src/save/save.js');

/** A game with a hall on a gang's turf (the Night Market: the Silver Fan's), two of ours living there. */
function withHall(district = 'nightMarket', seed = 1) {
  const s = createNewGame({ seed, startCrew: 'fresh' });
  s.halls.push({ district, beds: 2, rent: 1000, level: 1, opened: 1 });
  s.crew[0].hall = district;
  s.crew[1].hall = district;
  s.cash = 20000;
  return s;
}
/** Hold a grudge up and move day by day until a raid is warned. */
function untilWarned(s, gang, n = 8, days = 60) {
  for (let i = 0; i < days && !openRaids(s).length; i++) { s.grudges[gang] = n; s = advanceDay(s); s.grudges[gang] = n; }
  return s;
}
function untilCall(s, gang, n = 8) {
  for (let i = 0; i < 10 && !s.inbox.some((m) => m.kind === 'raid' && !m.resolved); i++) { s = advanceDay(s); s.grudges[gang] = n; }
  return s;
}
const callOf = (s) => s.inbox.find((m) => m.kind === 'raid' && !m.resolved);
const finishJob = (s, tid, policy) => {
  addOffer(s, tid, { rng: () => 0.5 });
  const job = s.jobs.find((j) => j.templateId === tid);
  const crew = s.crew.slice(0, templateById(tid).crewSize).map((o) => o.id);
  return playMission(startMission(s, job.id, crew, 'stealth'), policy).state;
};
const finishAll = { critical: () => 'extract', pending: (o) => (o.includes('keep') ? 'keep' : o[0]), crisis: (c) => c.find((x) => x.kind !== 'abort') ?? c[0] };
const abortAll = { critical: () => 'extract', pending: (o) => (o.includes('out') ? 'out' : o[0]), crisis: (c) => c.find((x) => x.kind === 'abort') ?? c[0] };

test('jobs that hurt a gang say so; every tag names a gang; the Brass Anchor is never one', () => {
  const tagged = MISSIONS.filter((t) => t.against);
  // Casino Con left the list 2026-11-07: its room is the Hei Lok, Hei Lok Leisure's airship, not the Red Lanterns' (owner; DESIGN.md).
  assert.deepEqual(tagged.map((t) => t.id).sort(), ['chrome', 'herbal_run', 'house_advantage', 'inspection_hours', 'protection']);
  for (const t of tagged) assert.ok(GANGS[t.against], t.id);
  assert.ok(!Object.values(GANGS).some((g) => /Brass Anchor/.test(g.name)));
  assert.deepEqual(gangsOn('oldTown'), [], 'no gang raids Old Town');
  assert.deepEqual(jobGrudge(templateById('chrome'), 1), { gang: 'silverFan', n: 1 });
  assert.deepEqual(jobGrudge(templateById('protection'), 3), { gang: 'redLanterns', n: 2 });
  assert.equal(jobGrudge(templateById('clinic')), null);
});

test('finishing a job against a gang adds to its grudge; aborting it, or other work, does not', () => {
  let s = finishJob(createNewGame({ seed: 2, startCrew: 'fresh' }), 'chrome', finishAll);
  if (!s.activeMission.aborted) assert.equal(grudgeOf(s, 'silverFan'), jobGrudge(templateById('chrome'), s.activeMission.threat).n);
  assert.ok(s.inbox[0].timeline.outcome.some((o) => /won't forget this/.test(o.text)) || s.activeMission.aborted);
  let t = finishJob(createNewGame({ seed: 3, startCrew: 'fresh' }), 'chrome', abortAll);
  assert.equal(t.activeMission.aborted, true);
  assert.equal(grudgeOf(t, 'silverFan'), 0, 'an aborted job is not remembered');
  let u = finishJob(createNewGame({ seed: 4, startCrew: 'fresh' }), 'clinic', finishAll);
  assert.deepEqual(u.grudges, { redLanterns: 0, silverFan: 0 });
});

test('a grudge fades a little every other Sunday (balance pass, 2026-11-06: was every Sunday)', () => {
  let s = createNewGame({ seed: 5, startCrew: 'fresh' });
  addGrudge(s, 'silverFan', 5);
  for (let i = 0; i < 28; i++) s = advanceDay(s);
  assert.equal(grudgeOf(s, 'silverFan'), 5 - 2 * GRUDGE.fadeWeekly, 'four Sundays, two fades');
});

test('a gang raids only a hall on its own turf, and only with a big grudge', () => {
  let home = createNewGame({ seed: 6, startCrew: 'fresh' });
  for (let i = 0; i < 90; i++) { home.grudges.silverFan = 10; home.grudges.redLanterns = 10; home = advanceDay(home); }
  assert.equal((home.raids ?? []).filter(isGangRaid).length, 0, 'the Old Town hall is never raided by a gang');
  let low = withHall('nightMarket', 7);
  for (let i = 0; i < 90; i++) { low.grudges.silverFan = GRUDGE.raidAt - 1; low = advanceDay(low); }
  assert.equal((low.raids ?? []).length, 0, `a grudge of ${GRUDGE.raidAt - 1} never brings one`);
  let s = untilWarned(withHall('nightMarket', 8), 'silverFan');
  const [raid] = openRaids(s);
  assert.equal(raid?.by, 'silverFan');
  assert.equal(raid.district, 'nightMarket');
  let wrong = withHall('nightMarket', 9);
  for (let i = 0; i < 90; i++) { wrong.grudges.redLanterns = 10; wrong = advanceDay(wrong); }
  assert.equal((wrong.raids ?? []).filter(isGangRaid).length, 0, 'the Red Lanterns don\'t come for a Night Market hall');
  let docks = untilWarned(withHall('docks', 10), 'redLanterns');
  assert.equal(openRaids(docks)[0]?.by, 'redLanterns');
});

test('a gang always takes a settlement: the price grows with the grudge, and settling halves it', () => {
  let s = untilWarned(withHall('basin', 11), 'silverFan', 8);
  const raid = openRaids(s)[0];
  assert.equal(raid.by, 'silverFan', 'the Silver Fan reach the Basin (the Undercroft)');
  const price = raidPrice(s, raid);
  assert.equal(price, GRUDGE.tribute.base + GRUDGE.tribute.perGrudge * 8);
  s = payOffRaid(s, raid.id);
  assert.equal(s.raids.at(-1).answer, 'paid');
  assert.equal(grudgeOf(s, 'silverFan'), 4);
  for (let i = 0; i < 4; i++) s = advanceDay(s);
  assert.ok(!s.inbox.some((m) => m.kind === 'raid' && !m.resolved), 'nobody comes');
  // On the day, at the door, settling is there too, dearer.
  let t = untilCall(untilWarned(withHall('nightMarket', 12), 'silverFan', 8), 'silverFan', 8);
  const r2 = t.raids.at(-1);
  const pay = raidChoices(t, r2).find((c) => c.id === 'pay');
  assert.match(pay.label, /^Settle at the door/);
  assert.equal(raidPrice(t, r2, { late: true }), Math.round((GRUDGE.tribute.base + GRUDGE.tribute.perGrudge * 8) * GRUDGE.lateTribute / 50) * 50);
  t = resolveDecision(t, callOf(t).id, 'pay');
  assert.equal(grudgeOf(t, 'silverFan'), 4);
  assert.equal(t.raids.at(-1).outcome, 'paid');
});

test('walking out of a gang raid hurts nobody; the hall shuts a week; the heat is not theirs to change; the grudge stays', () => {
  let s = untilCall(untilWarned(withHall('nightMarket', 13), 'silverFan', 7), 'silverFan', 7);
  assert.ok(isBlocked(s));
  const injuries = s.crew.map((o) => o.condition.injury);
  const heat = heatIn(s, 'nightMarket');
  s = resolveDecision(s, callOf(s).id, 'withdraw');
  assert.deepEqual(s.crew.map((o) => o.condition.injury), injuries);
  assert.equal(heatIn(s, 'nightMarket'), heat);
  assert.equal(grudgeOf(s, 'silverFan'), 7);
  assert.ok(hallShut(s, 'nightMarket'));
});

test('holding against a gang: a fight with its collectors; nobody dies unless you keep fighting with them down', () => {
  for (let seed = 1; seed <= 25; seed++) {
    let s = untilCall(untilWarned(withHall('nightMarket', seed), 'silverFan', 8), 'silverFan', 8);
    s = resolveDecision(s, callOf(s).id, 'hold');
    assert.equal(s.activeMission.battle.foeOne, 'collector');
    assert.match(s.activeMission.report[0], /Silver Fan collectors: \d of them/); // after the way's own line (the halls' lore, 2026-11-07)
    for (let n = 0; s.activeMission && !s.activeMission.done && n < 60; n++) {
      const am = s.activeMission;
      if (am.pending) s = resolvePending(s, am.pending.kind === 'door' ? 'out' : am.pending.kind === 'standoff' ? 'press' : describePending(s).choices[0].id);
      else s = runBattle(s);
    }
    assert.equal(s.activeMission.result.deaths.length, 0, `seed ${seed}`);
  }
});

test('a v40 save upgrades with no grudges, and its raids were the police', async () => {
  const s = createNewGame({ seed: 14, startCrew: 'fresh' });
  delete s.grudges;
  s.raids = [{ id: 'old', district: 'docks', warnedDay: 1, day: 4, answer: 'withdraw', outcome: 'withdrew', done: true }];
  s.version = 40;
  const loaded = await importSave({ text: async () => JSON.stringify(s) });
  assert.equal(loaded.version, SAVE_VERSION);
  assert.deepEqual(loaded.grudges, { redLanterns: 0, silverFan: 0 });
  assert.equal(loaded.raids[0].by, 'police');
});
