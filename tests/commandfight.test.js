// Command fights (2026-10-30, PLAN-CORE-LOOP.md slice 6): cover, the guards' intents rolled before
// orders, the player's orders a round at a time, and the odds they show. Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame, SAVE_VERSION } from '../src/core/state.js';
import * as M from '../src/core/mission.js';
import { addOffer } from '../src/core/jobs.js';
import { autoStep, autoRun, needsPlayer } from '../src/core/autorun.js';
import { playRound, planIntents, ordersFor, guardHitChance, fightChance, BATTLE } from '../src/core/battle.js';
import { makeRng } from '../src/core/rng.js';
import { testFight, commandOrders } from './play.js';

globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
const { importSave } = await import('../src/save/save.js');

/** The chance a line's own roll had: what the die needed against the value it rolled with. */
const lineChance = (l) => fightChance(l.value, l.need - 10);

test('half cover is the old fight: shots and guards need what they did before cover existed', () => {
  const b = testFight(1);
  assert.ok([...b.runners, ...b.guards].every((x) => x.cover === 'half'), 'everyone starts in half cover');
  const r = playRound(b, makeRng(5));
  for (const l of r.lines) {
    if (l.kind === 'shoot') assert.equal(l.need, 10 + b.diff - 2, 'a shot at half cover: the fight\'s difficulty, 2 easier');
    if (l.kind === 'guard') {
      const t = b.runners.find((x) => x.id === l.targetId);
      assert.equal(l.need - l.value, 10 + t.stats.cool.value + (b.lights ? BATTLE.lightsOff : 0) - (b.diff - 2), 'against the runner\'s cool');
    }
  }
});

test('the guards show their move before orders, and go for who they said', () => {
  for (let seed = 1; seed <= 40; seed++) {
    const b = testFight(1 + (seed % 5));
    const rng = makeRng(seed);
    const intents = planIntents(b, rng);
    assert.equal(intents.length, b.guards.length, 'every guard up has a target');
    const r = playRound(b, rng, {});
    for (const l of r.lines.filter((x) => x.kind === 'guard')) {
      const meant = intents.find((i) => i.guard === l.guard).target;
      const wasDown = r.lines.some((x) => x.kind === 'guard' && x.targetId === meant && x.down && r.lines.indexOf(x) < r.lines.indexOf(l));
      if (!wasDown) assert.equal(l.targetId, meant, `seed ${seed}: guard ${l.guard} shoots who they meant to`);
    }
    assert.equal(b.intents, null, 'the next round\'s move is still to come');
  }
});

test('shown equals used: every order\'s odds are the roll it makes, flank and hunker included', () => {
  let checked = 0;
  for (let seed = 1; seed <= 60; seed++) {
    const b = testFight(1 + (seed % 5));
    const rng = makeRng(seed * 31);
    planIntents(b, rng);
    const [a, c] = b.runners;
    const g = b.guards[seed % b.guards.length];
    const shot = ordersFor(b, a.id).find((o) => o.kind === (seed % 2 ? 'flank' : 'shoot') && o.target === g.n);
    const guards = b.intents.filter((i) => i.target === c.id);
    const shown = guardHitChance(b, c, 'full', true);
    const r = playRound(b, rng, { [a.id]: shot, [c.id]: { kind: 'hunker' } });
    const l = r.lines.find((x) => x.kind === 'shoot' && x.actor.id === a.id);
    if (l.guard === g.n) { assert.equal(lineChance(l), shot.chance, `seed ${seed}: ${shot.kind} odds`); checked++; }
    assert.ok(r.lines.some((x) => x.kind === 'hunker' && x.actor.id === c.id), 'the hunker shows on the feed');
    // (Unless someone killed the lights first: another roll the order couldn't know.)
    for (const x of b.lights ? [] : r.lines.filter((y) => y.kind === 'guard' && y.targetId === c.id)) {
      assert.equal(lineChance(x), shown, `seed ${seed}: a guard at someone hunkered rolls what was shown`);
      assert.ok(shown < guardHitChance(b, c, 'half', false), 'hunkering makes them harder to hit');
    }
    if (guards.length) checked++;
  }
  assert.ok(checked > 40, `checked ${checked}`);
});

test('flanking: the guard is in the open for every shot that round, and so is the flanker', () => {
  const b = testFight(2);
  const rng = makeRng(9);
  planIntents(b, rng);
  const [f, s] = b.runners;
  const g = b.guards[0];
  const r = playRound(b, rng, { [f.id]: { kind: 'flank', target: g.n }, [s.id]: { kind: 'shoot', target: g.n } });
  const shots = r.lines.filter((l) => l.kind === 'shoot');
  assert.equal(shots[0].actor.id, f.id, 'the flanker goes first');
  assert.ok(shots[0].flank);
  for (const l of shots.filter((x) => x.guard === g.n)) assert.equal(l.cover, 'open');
  for (const l of r.lines.filter((x) => x.kind === 'guard' && x.targetId === f.id)) assert.ok(l.notes.some((n) => n.includes('in the open')), 'the flanker is caught in the open');
  assert.ok([...b.runners, ...b.guards].every((x) => x.now === null), 'everyone is back on their spot after the round');
});

test('an order that can\'t be done is the crew\'s own call (someone who can\'t patch can\'t be ordered to)', () => {
  const b = testFight(3);
  const nonMedic = b.runners.find((r) => r.stats.medical.value + r.patch < BATTLE.patchMin);
  assert.ok(!ordersFor(b, nonMedic.id).some((o) => o.kind === 'patch'), 'no patch order for someone who can\'t');
  const r = playRound(b, makeRng(1), { [nonMedic.id]: { kind: 'patch', target: b.runners[0].id }, nope: { kind: 'shoot', target: 1 } });
  assert.ok(r.lines.some((l) => l.actor?.id === nonMedic.id && l.kind !== 'patch'), 'they did what the crew would');
  assert.equal(ordersFor(b, 'nobody').length, 0);
});

test('giving orders is worth it: a plain player beats hands-off on the test fight, and gets fewer people hurt', () => {
  const play = (policy) => {
    const t = { won: 0, lost: 0 };
    for (let seed = 1; seed <= 400; seed++) {
      const b = testFight(1 + (seed % 5));
      const rng = makeRng(seed * 7919);
      const hp0 = b.runners.reduce((n, r) => n + r.hp, 0);
      while (b.round < BATTLE.rounds && b.guards.some((g) => !g.out) && b.runners.some((r) => !r.down)) {
        planIntents(b, rng);
        playRound(b, rng, policy(b));
      }
      if (!b.guards.some((g) => !g.out)) t.won++;
      t.lost += hp0 - b.runners.reduce((n, r) => n + r.hp, 0);
    }
    return t;
  };
  const auto = play(() => ({}));
  const cmd = play(commandOrders);
  assert.ok(cmd.won >= auto.won + 0.08 * 400, `orders win ${cmd.won}, hands-off ${auto.won} of 400`);
  assert.ok(cmd.lost < auto.lost, 'and lose less health');
});

test('a run takes the player\'s orders, and a v27 save mid-fight upgrades and carries on', async () => {
  let s = createNewGame({ seed: 4, startCrew: 'fresh' });
  s.jobs = [];
  addOffer(s, 'warehouse');
  s = M.startMission(s, s.jobs[0].id, s.crew.slice(0, 4).map((o) => o.id), 'loud');
  for (let g = 0; g < 200 && !(s.activeMission.battle && M.currentStep(s.activeMission)?.type === 'battle' && !s.activeMission.pending); g++) {
    if (s.activeMission.done) break;
    s = autoStep(s, { force: true });
  }
  const b = s.activeMission.battle;
  assert.ok(b, 'a loud run has a fight');
  assert.ok(b.intents?.length, 'the guards\' first move is already rolled when the fight starts');
  const id = b.runners[0].id;
  const next = M.runBattle(s, { [id]: { kind: 'hunker' } });
  assert.ok(next.activeMission.events.at(-1).lines.some((l) => l.kind === 'hunker' && l.actor.id === id), 'the order was carried out');
  const old = structuredClone(s);
  old.version = 27;
  for (const x of [...old.activeMission.battle.guards, ...old.activeMission.battle.runners]) { delete x.cover; delete x.now; }
  delete old.activeMission.battle.intents;
  const up = await importSave({ text: async () => JSON.stringify(old) });
  assert.equal(up.version, SAVE_VERSION);
  assert.ok([...up.activeMission.battle.guards, ...up.activeMission.battle.runners].every((x) => x.cover === 'half' && x.now === null));
  assert.equal(up.activeMission.battle.intents, null);
  assert.equal(autoRun(up, 'steady').activeMission.done, true, 'and the run finishes');
});

/** A Docks job walked to its first fight round, waiting for orders. */
function docksFight(seed = 4) {
  let s = createNewGame({ seed, startCrew: 'fresh' });
  s.jobs = [];
  addOffer(s, 'warehouse');
  s = M.startMission(s, s.jobs[0].id, s.crew.slice(0, 4).map((o) => o.id), 'loud', { callIn: 'every' });
  for (let g = 0; g < 200 && !s.activeMission.done && !s.activeMission.battle; g++) {
    const next = autoStep(s);
    s = next !== s ? next : autoStep(s, { force: true });
  }
  return s;
}

test('a fight in the Docks stands on the map: everyone on a spot, the crew in the best cover going', () => {
  const s = docksFight();
  const b = s.activeMission.battle;
  assert.ok(b?.spots, 'the fight has spots');
  for (const x of b.runners) assert.equal(x.cover, b.spots.crew[x.spot].cover);
  for (const g of b.guards) assert.equal(g.cover, b.spots.guards[g.spot].cover);
  assert.equal(new Set(b.runners.map((r) => r.spot)).size, b.runners.length, 'one to a spot');
  const start = s.activeMission.events.find((e) => e.kind === 'battle' && e.phase === 'start');
  assert.ok(start.runners.every((r) => Array.isArray(r.at)) && start.guards.every((g) => Array.isArray(g.at)), 'the feed knows where everyone stands');
});

test('moving: to a free spot, for good, taking the turn; never onto someone\'s spot', () => {
  const s = docksFight();
  const b = structuredClone(s.activeMission.battle);
  const r = b.runners[0];
  const to = ordersFor(b, r.id).filter((o) => o.kind === 'move');
  assert.ok(to.length, 'somewhere to go');
  assert.ok(!to.some((o) => b.runners.some((x) => x.spot === o.target)), 'only free spots');
  const pick = to.at(-1);
  const out = playRound(b, makeRng(2), { [r.id]: { kind: 'move', target: pick.target }, [b.runners[1].id]: { kind: 'move', target: b.runners[2].spot } });
  assert.equal(r.spot, pick.target);
  assert.equal(r.cover, b.spots.crew[pick.target].cover);
  assert.ok(out.lines.some((l) => l.kind === 'move' && l.actor.id === r.id && l.to), 'the move is on the feed, with where to');
  assert.ok(!out.lines.some((l) => l.actor?.id === r.id && l.kind === 'shoot'), 'and it was their turn');
  assert.notEqual(b.runners[1].spot, b.runners[2].spot, 'a move onto someone else\'s spot is the crew\'s own call instead');
});

test('a live fight waits for orders each round; Auto leaves the rest to the crew; pulling back is always there and brings everyone home', () => {
  const s = docksFight();
  assert.equal(needsPlayer(s), true, 'the fight waits for orders');
  assert.equal(autoStep(s), s, 'the clock doesn\'t play it');
  const after = M.runBattle(s, {});
  if (after.activeMission.battle && !after.activeMission.pending) assert.equal(needsPlayer(after), true, 'and again next round');
  const auto = M.handOffFight(s);
  assert.equal(needsPlayer(auto), false, 'left to the crew');
  assert.notEqual(autoStep(auto), auto, 'the crew carries on');
  const never = structuredClone(s);
  never.activeMission.callIn = 'never';
  assert.equal(needsPlayer(never), false, 'a hands-off job never asks');
  const back = M.pullBack(s);
  const am = back.activeMission;
  assert.equal(am.done, true, 'pulling back ends the job');
  assert.equal(am.battle, null);
  assert.ok(am.crewIds.every((id) => back.crew.some((o) => o.id === id)), 'nobody dies');
  assert.ok(am.payCut >= 1, 'the job is lost');
});
