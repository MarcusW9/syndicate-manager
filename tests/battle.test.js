// Battles (PLAN-CORE-LOOP.md, slice 6): fights only when a run escalates, HP and flat-soak armour,
// death's door, pulling back, the orders, and the planning read. Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame, SAVE_VERSION } from '../src/core/state.js';
import * as M from '../src/core/mission.js';
import { addOffer, templateById } from '../src/core/jobs.js';
import { autoStep, autoRun } from '../src/core/autorun.js';
import { coverage } from '../src/core/squad.js';
import { buildBattle, playRound, battleOdds, hitFor, weaponOf, armourOf, maxHp, partingShots, guardPosts, guardsFor, BATTLE } from '../src/core/battle.js';
import { ordersDecision, incidentDifficulty, incidentById } from '../src/core/incidents.js';
import { INCIDENTS } from '../src/data/incidents.js';
import { makeRng } from '../src/core/rng.js';
import { feedItems } from '../src/core/feed.js';
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
  assert.deepEqual(weaponOf(op), { ...BATTLE.unarmed, pierce: 0 }, 'guns are standard: a street piece (it pierces nothing)');
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

test('a fight starts when a danger incident goes unsaved, or on a loud run for the first guard whatever the roll', () => {
  let fights = 0;
  let loudWins = 0;
  for (let seed = 1; seed <= 400; seed++) {
    const am = autoRun(begin(seed, 'warehouse', APPROACHES[seed % 4], { n: 2 + (seed % 2) }), 'steady').activeMission;
    const ev = am.events;
    let first = true;
    ev.forEach((e, i) => {
      if (e.kind !== 'battle' || e.phase !== 'start') return;
      fights++;
      let j = i - 1;
      const saved = [];
      while (ev[j].kind === 'save') { saved.push(ev[j].success); j--; }
      assert.equal(ev[j].kind, 'roll');
      assert.ok(incidentById(ev[j].incident).danger, `seed ${seed}: ${ev[j].incident} is danger`);
      const loud = am.approach === 'loud' || ev.slice(0, j).some((x) => x.kind === 'decision' && /loud/i.test(x.choice ?? ''));
      const unsaved = !ev[j].success && saved.every((x) => x === false);
      if (!unsaved) {
        assert.ok(loud && first, `seed ${seed}: only the first guard of a loud run fights when it wasn't lost`);
        if (ev[j].success) { loudWins++; assert.match(e.text, /jump/, 'a won roll gets the jump on them'); }
      }
      first = false;
    });
  }
  assert.ok(fights > 30 && loudWins > 10, `saw ${fights} fights, ${loudWins} ambushes`);
});

test('every loud run has a fight (the first danger incident), a stealth run only when it goes wrong', () => {
  let loud = 0;
  let loudFights = 0;
  let quiet = 0;
  let quietFights = 0;
  for (let seed = 1; seed <= 300; seed++) {
    const am = autoRun(begin(seed, 'container409', seed % 2 ? 'loud' : 'stealth', { n: 3 }), 'committed').activeMission;
    const fought = am.events.some((e) => e.kind === 'battle' && e.phase === 'start');
    if (seed % 2) { loud++; if (fought) loudFights++; } else { quiet++; if (fought) quietFights++; }
  }
  assert.equal(loudFights, loud, 'every loud run fights');
  assert.ok(quietFights < quiet * 0.5, `stealth fought ${quietFights} of ${quiet}`);
});

test('the jump: on the first round the guards get no shot in, and only then', () => {
  const s = createNewGame({ seed: 5, startCrew: 'fresh' });
  const make = (ambush) => buildBattle({ incident: 'backup', zone: 'inside', diff: 12, threat: 3, guards: 2, crew: s.crew.slice(0, 3), approach: 'loud', ambush });
  const jump = make(true);
  const r1 = playRound(jump, makeRng(3));
  assert.ok(r1.lines.some((l) => l.kind === 'ambush'));
  assert.ok(!r1.lines.some((l) => l.kind === 'guard'), 'no guard attacks on round 1');
  const r2 = playRound(jump, makeRng(4));
  assert.ok(!r2.lines.some((l) => l.kind === 'ambush'));
  assert.ok(r2.lines.some((l) => l.kind === 'guard') || !jump.guards.some((g) => !g.out), 'they fight back from round 2');
  assert.ok(playRound(make(false), makeRng(3)).lines.some((l) => l.kind === 'guard'), 'no jump, no free round');
});

test('every roll in a fight is the rule: die + value against need decides it, and it never runs past the last round', () => {
  let lines = 0;
  for (let seed = 1; seed <= 300; seed++) {
    const am = autoRun(begin(seed, 'warehouse', 'loud', { n: 3 }), 'committed').activeMission;
    for (const e of am.events.filter((x) => x.kind === 'battle')) {
      if (e.phase === 'round') assert.ok(e.round <= BATTLE.rounds, `seed ${seed}: round ${e.round}`);
      for (const l of e.lines ?? []) {
        if (l.kind === 'flee') { assert.equal(l, e.lines.at(-1), 'a guard runs at the end of a round'); continue; } // no roll
        if (l.kind === 'ambush') { assert.equal(e.round, 1, 'the jump is only the first round'); continue; } // no roll
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
  // A quiet approach: the fight is only the roll's and the save's miss, odds straight from battleOdds.
  const { rows } = coverage(tpl, crew, 'stealth');
  const row = rows.find((r) => r.id === 'guard');
  assert.ok(row.fight && !row.fight.forced, 'danger rows carry the fight');
  const diff = incidentDifficulty(tpl, { threat: tpl.threat, alert: 0 }, incidentById('guard'));
  const odds = battleOdds({ incident: 'guard', zone: row.zone, diff, threat: tpl.threat, guards: INCIDENTS.guard.guards, crew, approach: 'stealth' });
  assert.equal(row.fight.win, odds.win);
  assert.equal(Math.round((odds.win + odds.down + odds.standoff) * 1000), 1000);
  assert.ok(!rows.find((r) => r.id === 'lock')?.fight, 'no fight where there is no danger');
  // A loud run: the fight is certain, and the odds mix the jump (the roll won) with the plain fight.
  const loud = coverage(tpl, crew, 'loud').rows.find((r) => r.id === 'backup');
  assert.equal(loud.fight.forced, true);
  assert.equal(loud.fight.chance, 1, 'it happens whatever the roll');
  const ldiff = incidentDifficulty(tpl, { threat: tpl.threat, alert: 0 }, incidentById('backup'));
  const args = { incident: 'backup', zone: loud.zone, diff: ldiff, threat: tpl.threat, guards: INCIDENTS.backup.guards, crew, approach: 'loud' };
  const plain = battleOdds(args);
  const jump = battleOdds({ ...args, ambush: true });
  const mixed = loud.chance * jump.win + (1 - loud.chance) * plain.win;
  assert.ok(Math.abs(loud.fight.win - mixed) < 1e-9, 'the read mixes the jump and the plain fight by the roll');
  assert.ok(jump.win >= plain.win, 'the first round is worth something');
  // Better kit, better odds.
  const before = loud.fight.win;
  for (const op of crew) arm(s, op.id, 'pistol:pro', 'vest:pro');
  const armed = coverage(tpl, crew, 'loud').rows.find((r) => r.id === 'backup');
  assert.ok(armed.fight.win > before, `${armed.fight.win} > ${before}`);
});

// --- the watch feed (slice 6b) ------------------------------------------------------------------

test('a fight on the feed: guards appear on a note, every round is a card with health and a cue the plan can play', () => {
  let rounds = 0;
  let starts = 0;
  for (let seed = 1; seed <= 200; seed++) {
    const am = autoRun(begin(seed, 'warehouse', 'loud', { n: 3 }), 'committed').activeMission;
    const items = feedItems(am.events);
    const battle = items.filter((i) => i.cue?.battle);
    const shown = am.events.filter((e) => e.kind === 'battle').length;
    assert.equal(battle.length, shown, `seed ${seed}: every fight event is on the feed`);
    for (const it of battle) {
      const c = it.cue.battle;
      assert.ok(['start', 'round', 'retreat', 'end'].includes(c.phase));
      assert.ok(c.guards.length >= 1 && c.runners.length >= 1, 'both sides are named');
      if (c.phase === 'start') { starts++; assert.equal(it.type, 'note'); assert.ok(c.guards.every((g) => g.hp === g.max), 'they start unhurt'); }
      if (c.phase === 'round') {
        rounds++;
        assert.equal(it.type, 'card');
        assert.ok(it.hp.runners.length && it.hp.guards.length, 'the summary has everyone\'s health');
        assert.equal(c.lines.length, it.results.length, 'one result per moment');
        for (const l of c.lines) {
          if (['shoot', 'overwatch', 'talk', 'flee', 'guard'].includes(l.kind)) assert.ok(l.guard >= 1 && l.guard <= c.guards.length, `seed ${seed}: ${l.kind} names its guard`);
          if (l.kind === 'guard') assert.ok(c.runners.some((r) => r.id === l.targetId), `seed ${seed}: a guard's target is in the fight`);
        }
        for (const r of it.results.filter((x, i) => ['flee', 'ambush'].includes(c.lines[i].kind))) assert.equal(r.tone, 'good', 'a guard running or the jump reads as good news');
      }
    }
  }
  assert.ok(starts > 100 && rounds > 100, `starts ${starts}, rounds ${rounds}`);
});

test('the call-in at a fight shows everyone\'s health', () => {
  const found = findPending('door', { want: 2 });
  assert.ok(found.length >= 1);
  for (const { s } of found) {
    const f = M.describePending(s).fight;
    assert.ok(f.runners.length >= 1 && f.guards.length >= 1);
    assert.ok(f.runners.some((r) => r.down), 'someone is down at death\'s door');
    assert.ok(M.describePending(findPending('standoff', { want: 1 })[0]?.s ?? s).fight, 'and at the stand-off');
  }
});

// --- guard numbers and posts (2026-10-29) -------------------------------------------------------

test('more guards on bigger work: the incident\'s own count, plus more by threat, never more than the cap', () => {
  for (let t = 1; t <= 5; t++) {
    for (const own of [1, 2]) {
      const n = guardsFor(t, own).length;
      assert.equal(n, Math.min(BATTLE.maxGuards, own + BATTLE.extraGuards[t]), `threat ${t}, ${own}`);
      assert.ok(n >= own && n <= BATTLE.maxGuards);
    }
  }
  assert.ok(guardsFor(5, 2).length > guardsFor(1, 2).length, 'bigger work, more guards');
});

test('guards on their posts are the guards the run meets: one per danger incident ahead, and the fight starts with as many', () => {
  let checked = 0;
  for (let seed = 1; seed <= 200; seed++) {
    let s = begin(seed, 'warehouse', APPROACHES[seed % 4], { n: 3 });
    const posted = new Map(guardPosts(s.activeMission).map((p) => [p.step, p]));
    for (const p of posted.values()) assert.ok(INCIDENTS[p.incident].danger, 'only danger incidents');
    for (let g = 0; g < 300 && !s.activeMission.done; g++) {
      const am = s.activeMission;
      const ahead = guardPosts(am);
      for (const p of ahead) assert.ok(p.step >= am.step, 'only what is still ahead');
      const step = am.step;
      s = autoStep(s, { force: true });
      // A fight that starts from a posted incident brings exactly the guards the post showed.
      const start = s.activeMission.events.at(-1)?.kind === 'battle' && s.activeMission.events.at(-1).phase === 'start' ? s.activeMission.events.at(-1) : null;
      if (start && posted.has(step) && !s.activeMission.wentLoud) { assert.equal(start.guards.length, posted.get(step).guards, `seed ${seed}`); checked++; }
    }
    assert.deepEqual(guardPosts(s.activeMission), [], 'nobody waits once the job is done');
  }
  assert.ok(checked > 20, `checked ${checked} fights against their posts`);
});

// --- saves ---------------------------------------------------------------------------------------

test('a v25 or v26 save upgrades: jobs get no fight on, and know if they have fought; a job saved mid-fight carries on', async () => {
  const s = begin(2, 'warehouse', 'loud', { n: 2 });
  const old = structuredClone(s);
  old.version = 25;
  delete old.activeMission.battle;
  const up = await importSave({ text: async () => JSON.stringify(old) });
  assert.equal(up.version, SAVE_VERSION);
  assert.equal(up.activeMission.battle, null);
  assert.equal(up.activeMission.fought, false, 'no fight in its record yet');
  const fought = structuredClone(old);
  fought.version = 26;
  delete fought.activeMission.fought;
  fought.activeMission.events = [{ kind: 'battle', phase: 'start' }];
  assert.equal((await importSave({ text: async () => JSON.stringify(fought) })).activeMission.fought, true, 'a job whose record shows a fight has fought');
  const mid = findPending('standoff', { want: 1 })[0] ?? findPending('door', { want: 1 })[0];
  assert.ok(mid, 'found a job stopped in a fight');
  const back = await importSave({ text: async () => JSON.stringify(mid.s) });
  assert.ok(back.activeMission.battle, 'the fight is still there');
  const done = autoRun(back, 'steady');
  assert.equal(done.activeMission.done, true);
});
