// Battles (PLAN-CORE-LOOP.md, slice 6): fights only when a run escalates, HP and flat-soak armour,
// death's door, pulling back, the orders, and the planning read. Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame } from '../src/core/state.js';
import * as M from '../src/core/mission.js';
import { addOffer, templateById } from '../src/core/jobs.js';
import { autoStep, autoRun } from '../src/core/autorun.js';
import { coverage } from '../src/core/squad.js';
import { buildBattle, playRound, battleOdds, hitFor, weaponOf, armourOf, maxHp, partingShots, BATTLE } from '../src/core/battle.js';
import { ordersDecision, incidentDifficulty, incidentById } from '../src/core/incidents.js';
import { INCIDENTS } from '../src/data/incidents.js';
import { makeRng } from '../src/core/rng.js';
import { playMission, randomPolicy, arm } from './play.js';

globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
const { importSave } = await import('../src/save/save.js');

const APPROACHES = ['stealth', 'tech', 'loud', 'con'];

function begin(seed, templateId, approach = 'loud', { n, opts } = {}) {
  const s = createNewGame({ seed, startCrew: 'fresh' });
  s.jobs = [];
  addOffer(s, templateId);
  const size = n ?? templateById(templateId).crewSize;
  return M.startMission(s, s.jobs[0].id, s.crew.slice(0, size).map((o) => o.id), approach, opts);
}

/** Step a run (orders decide crises) until it stops for this kind of call-in, or ends. Other call-ins: carry on if you can. */
function toPending(s, kind) {
  for (let g = 0; g < 200; g++) {
    const am = s.activeMission;
    if (am.done || am.pending?.kind === kind) return s;
    if (am.pending) {
      const c = M.describePending(s).choices;
      s = M.resolvePending(s, (c.find((x) => !x.exit && x.id !== 'fight') ?? c.find((x) => x.exit)).id);
    } else s = autoStep(s, { force: true });
  }
  return s;
}

/** Runs that reached a call-in of this kind, from these seeds. */
function findPending(kind, { from = 1, to = 1500, job = 'warehouse', n = 2, want = 5 } = {}) {
  const found = [];
  for (let seed = from; seed <= to && found.length < want; seed++) {
    const s = toPending(begin(seed, job, APPROACHES[seed % 4], { n }), kind);
    if (s.activeMission.pending?.kind === kind) found.push({ seed, s });
  }
  return found;
}

// --- data ----------------------------------------------------------------------------------------

test('every danger incident names its guards; only danger incidents start fights', () => {
  for (const [id, inc] of Object.entries(INCIDENTS)) {
    if (inc.danger) assert.ok(inc.guards >= 1, `${id}: a danger incident says how many guards`);
    else assert.ok(!inc.guards, `${id}: no guards without danger`);
  }
});

test('gear in a fight: weapons do damage, armour soaks it flat, a hit that lands always does at least 1', () => {
  const s = createNewGame({ seed: 3, startCrew: 'fresh' });
  const op = s.crew[0];
  assert.deepEqual(weaponOf(op), BATTLE.unarmed, 'guns are standard: a street piece');
  assert.equal(armourOf(op).value, 0);
  arm(s, op.id, 'pistol', 'vest');
  assert.equal(weaponOf(op).damage, 3);
  assert.equal(armourOf(op).value, 1);
  arm(s, op.id, 'pistol:pro', 'vest:pro');
  assert.equal(weaponOf(op).damage, 4, 'pro adds one');
  assert.equal(armourOf(op).value, 2, 'pro vest: armour 2');
  assert.equal(hitFor(3, 1), 2);
  assert.equal(hitFor(3, 2), 1);
  assert.equal(hitFor(2, 5), 1, 'never immune');
  assert.equal(maxHp({ stats: { cool: 12 } }), BATTLE.hp + 3);
});

// --- when fights happen ------------------------------------------------------------------------

test('a fight starts only when a danger incident goes unsaved', () => {
  let fights = 0;
  for (let seed = 1; seed <= 400; seed++) {
    const am = autoRun(begin(seed, 'warehouse', APPROACHES[seed % 4], { n: 2 + (seed % 2) }), 'steady').activeMission;
    const ev = am.events;
    ev.forEach((e, i) => {
      if (e.kind !== 'battle' || e.phase !== 'start') return;
      fights++;
      let j = i - 1;
      while (ev[j].kind === 'save') { assert.equal(ev[j].success, false, `seed ${seed}: a save that worked ends it there`); j--; }
      assert.equal(ev[j].kind, 'roll');
      assert.equal(ev[j].success, false, `seed ${seed}: the incident failed`);
      assert.ok(incidentById(ev[j].incident).danger, `seed ${seed}: ${ev[j].incident} is danger`);
    });
  }
  assert.ok(fights > 30, `saw ${fights} fights`);
});

test('every roll in a fight is the rule: die + value against need decides it, and it never runs past the last round', () => {
  let lines = 0;
  for (let seed = 1; seed <= 300; seed++) {
    const am = autoRun(begin(seed, 'warehouse', 'loud', { n: 3 }), 'committed').activeMission;
    for (const e of am.events.filter((x) => x.kind === 'battle')) {
      if (e.phase === 'round') assert.ok(e.round <= BATTLE.rounds, `seed ${seed}: round ${e.round}`);
      for (const l of e.lines ?? []) {
        if (l.kind === 'flee') { assert.equal(l, e.lines.at(-1), 'a guard runs at the end of a round'); continue; } // no roll
        assert.equal(l.die + l.value >= l.need, l.success, `seed ${seed}: ${l.text}`);
        assert.ok(l.text, 'every moment has a line for the feed');
        lines++;
      }
    }
  }
  assert.ok(lines > 200, `checked ${lines}`);
});

test('armour shows on the feed: a hit on armour says so and does damage less armour, at least 1', () => {
  let seen = 0;
  for (let seed = 1; seed <= 300 && seen < 10; seed++) {
    let s = begin(seed, 'warehouse', 'loud', { n: 3 });
    for (const op of s.crew.slice(0, 3)) arm(s, op.id, 'vest');
    const am = autoRun(s, 'committed').activeMission;
    for (const e of am.events.filter((x) => x.kind === 'battle' && x.phase === 'round')) {
      for (const l of e.lines.filter((x) => x.kind === 'guard' && x.damage)) {
        assert.equal(l.armour, 1);
        assert.match(l.text, /Armoured vest took 1/);
        seen++;
      }
    }
  }
  assert.ok(seen >= 5, `saw ${seen}`);
});

// --- death's door and the death rule -----------------------------------------------------------

test('death\'s door calls you in: pulling back is listed first, and brings everyone home at a cost', () => {
  const found = findPending('door');
  assert.ok(found.length >= 3, `found ${found.length}`);
  for (const { seed, s } of found) {
    const view = M.describePending(s);
    assert.equal(view.choices[0].exit, true, `seed ${seed}: the safe way first`);
    assert.ok(view.choices.some((c) => c.id === 'fight' && c.push), 'keep fighting is the push on');
    const patient = s.activeMission.pending.opId;
    const rep = s.reputation;
    const out = M.resolvePending(s, 'out');
    const am = out.activeMission;
    assert.equal(am.done, true);
    assert.equal(am.aborted, true);
    assert.deepEqual(am.result.deaths, []);
    assert.equal(am.result.pay, 0, 'no pay');
    assert.equal(out.crew.find((o) => o.id === patient).condition.injury, 'serious', 'dragged out badly hurt, alive');
    assert.ok(out.reputation <= Math.max(0, rep - M.ABORT_REP - BATTLE.retreat.rep) + 0.01, 'reputation takes the hit');
    assert.ok(am.result.heatGain >= BATTLE.retreat.heat);
  }
});

test('pulling back can hurt anyone running but never drops them to death\'s door', () => {
  for (let seed = 1; seed <= 200; seed++) {
    const b = buildBattle({ incident: 'backup', zone: 'inside', diff: 18, threat: 5, guards: 3, crew: createNewGame({ seed, startCrew: 'fresh' }).crew.slice(0, 2), approach: 'loud' });
    for (const r of b.runners) r.hp = 1 + (seed % 3);
    const lines = partingShots(b, makeRng(seed));
    assert.ok(b.runners.every((r) => r.hp >= 1 && !r.down), `seed ${seed}`);
    assert.ok(lines.length <= 4);
  }
});

test('keeping on fighting is the only way anyone dies; a later exit still saves them (3,000 runs)', () => {
  let fought = 0;
  let died = 0;
  for (let seed = 1; seed <= 3000; seed++) {
    const s = begin(seed, seed % 2 ? 'warehouse' : 'container409', APPROACHES[seed % 4], { n: 1 + (seed % 3) });
    const { state, pushed } = playMission(s, randomPolicy(seed));
    const am = state.activeMission;
    if (am.events.some((e) => e.kind === 'decision' && e.push)) fought++;
    if (!pushed) assert.deepEqual(am.result.deaths, [], `seed ${seed}: death without a push on`);
    if (am.aborted) assert.deepEqual(am.result.deaths, [], `seed ${seed}: an exit saves everyone`);
    died += am.result.deaths.length;
  }
  assert.ok(fought > 10, `kept fighting ${fought} times`);
  assert.ok(died > 0, 'keeping on fighting can kill');
});

test('a medic in the fight stabilises someone left down, and they come home badly hurt, not dying', () => {
  const s = createNewGame({ seed: 9, startCrew: 'fresh' });
  const [a, medic] = s.crew.filter((o) => o.role !== 'medic').slice(0, 1).concat(s.crew.filter((o) => o.role === 'medic'));
  const b = buildBattle({ incident: 'guard', zone: 'inside', diff: 0, threat: 1, guards: 1, crew: [a, medic], approach: 'loud' });
  b.runners[0].hp = 0; b.runners[0].down = true; b.runners[0].fightOn = true;
  let stable = false;
  for (let seed = 1; seed <= 20 && !stable; seed++) {
    const t = structuredClone(b);
    const r = playRound(t, makeRng(seed));
    const line = r.lines.find((l) => l.kind === 'stabilise');
    assert.ok(line, 'the medic goes to them first');
    stable = t.runners[0].stable;
  }
  assert.ok(stable, 'stabilised at an easy difficulty within 20 tries');
});

// --- orders and hands-off ------------------------------------------------------------------------

test('hands-off never keeps fighting with someone down, under any orders', () => {
  assert.equal(ordersDecision('door', 'committed').id, 'out');
  assert.equal(ordersDecision('door', 'cautious').id, 'out');
  assert.equal(ordersDecision('standoff', 'committed').id, 'press');
  assert.equal(ordersDecision('standoff', 'steady').id, 'out');
  for (let seed = 1; seed <= 300; seed++) {
    const am = autoRun(begin(seed, 'warehouse', APPROACHES[seed % 4], { n: 1 + (seed % 3) }), ['cautious', 'steady', 'committed'][seed % 3]).activeMission;
    assert.ok(!am.events.some((e) => e.push), `seed ${seed}`);
    assert.deepEqual(am.result.deaths, []);
  }
});

test('the orders in a fight: Cautious pulls back once someone is hurt, Steady once someone is badly hurt', () => {
  const seen = { cautious: 0, steady: 0 };
  for (let seed = 1; seed <= 600; seed++) {
    const orders = seed % 2 ? 'steady' : 'cautious';
    const am = autoRun(begin(seed, 'warehouse', 'loud', { n: 2 }), orders).activeMission;
    const rounds = am.events.filter((e) => e.kind === 'battle' && e.phase === 'round');
    const pulled = am.events.find((e) => e.kind === 'exit' && /orders: someone was/.test(e.why ?? ''));
    if (pulled) {
      const share = BATTLE.orders[orders].pullAtHurt;
      assert.ok(rounds.at(-1).runners.some((r) => !r.down && r.hp < r.max * share), `seed ${seed}: someone was under ${share}`);
      seen[orders]++;
    }
    // Nobody fights on past the share their orders allow.
    for (const r of rounds.slice(0, -1)) assert.ok(!r.runners.some((x) => !x.down && x.hp < x.max * BATTLE.orders[orders].pullAtHurt), `seed ${seed}: ${orders} fought on`);
  }
  assert.ok(seen.cautious > 10 && seen.steady > 0, JSON.stringify(seen)); // Steady's line is rarely the first thing to give
});

// --- shown risk equals used risk ---------------------------------------------------------------

test('the planning read quotes the fight from the run\'s own round function', () => {
  const s = createNewGame({ seed: 4, startCrew: 'fresh' });
  const tpl = templateById('container409'); // rookie work: a fight this crew can win sometimes
  const crew = s.crew.slice(0, 3);
  const { rows } = coverage(tpl, crew, 'loud');
  const row = rows.find((r) => r.id === 'backup');
  assert.ok(row.fight, 'danger rows carry the fight');
  const diff = incidentDifficulty(tpl, { threat: tpl.threat, alert: 0 }, incidentById('backup'));
  const odds = battleOdds({ incident: 'backup', zone: row.zone, diff, threat: tpl.threat, guards: INCIDENTS.backup.guards, crew, approach: 'loud' });
  assert.equal(row.fight.win, odds.win);
  assert.equal(Math.round((odds.win + odds.down + odds.standoff) * 1000), 1000);
  // Better kit, better odds.
  for (const op of crew) arm(s, op.id, 'pistol:pro', 'vest:pro');
  const armed = coverage(tpl, crew, 'loud').rows.find((r) => r.id === 'backup');
  assert.ok(armed.fight.win > row.fight.win, `${armed.fight.win} > ${row.fight.win}`);
  assert.ok(!rows.find((r) => r.id === 'lock')?.fight, 'no fight where there is no danger');
});

// --- saves ---------------------------------------------------------------------------------------

test('a v25 save upgrades: jobs get no fight on; a job saved mid-fight carries on', async () => {
  const s = begin(2, 'warehouse', 'loud', { n: 2 });
  const old = structuredClone(s);
  old.version = 25;
  delete old.activeMission.battle;
  const up = await importSave({ text: async () => JSON.stringify(old) });
  assert.equal(up.version, 26);
  assert.equal(up.activeMission.battle, null);
  const mid = findPending('standoff', { want: 1 })[0] ?? findPending('door', { want: 1 })[0];
  assert.ok(mid, 'found a job stopped in a fight');
  const back = await importSave({ text: async () => JSON.stringify(mid.s) });
  assert.ok(back.activeMission.battle, 'the fight is still there');
  const done = autoRun(back, 'steady');
  assert.equal(done.activeMission.done, true);
});
