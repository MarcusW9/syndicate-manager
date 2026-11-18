// Watchable combat, slice 3-i (drafts/HANDOFF-watchable-combat.md 3a-3d): the approach stage, the `approaching` priority,
// flee per group, and waves. An arrival spends its first round coming in (it can be shot, it does not shoot or flank, it
// cannot run); each batch of arrivals breaks on its own; a job's recipe sends waves on their own budget, by default the
// kind the clocks send (owner, 2026-11-15). Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame, SAVE_VERSION } from '../src/core/state.js';
import { makeRng } from '../src/core/rng.js';
import * as F from '../src/core/fight.js';
import { FIGHT, ENEMIES, FIGHT_RECIPES, SITE_ENEMIES, PRIORITY_WORDS } from '../src/data/fights.js';
import { FIGHT_TEXT } from '../src/data/fightText.js';
import { roundView } from '../src/core/fightview.js';

const store = new Map();
globalThis.localStorage = { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: (k) => store.delete(k) };
const S = await import('../src/save/save.js');

const crewOf = (seed = 1) => createNewGame({ seed }).crew;
const always = (v) => () => v;
const foe = (n, kind = 'corp', o = {}) => ({ n, kind, hp: ENEMIES[kind].hp, max: ENEMIES[kind].hp, absorb: ENEMIES[kind].absorb ?? 0, cover: ENEMIES[kind].cover, out: false, fled: false, deck: ['aim'], di: 0, approaching: false, group: 0, ...o });
const build = (o = {}) => F.buildFight({ type: 'holdYard', diff: 12, threat: 3, site: 'docks', crew: crewOf().slice(0, 4), approach: 'loud', ...o }, makeRng(o.seed ?? 4));
/** A recipe for one test only (FIGHT_RECIPES has no job of its own yet: the owner writes them). */
function withRecipe(recipe, f) {
  FIGHT_RECIPES.__test = recipe;
  try { return f(); } finally { delete FIGHT_RECIPES.__test; }
}
const holdAll = (b) => { for (const r of b.runners) F.setOrder(b, r.id, { duty: 'hold', target: null, fallback: null }); };

test('3a: an arrival comes in approaching, in a new group; its aim and flank are spent unplayed; it says so; the approach ends with the round', () => {
  const b = build();
  b.arriving = ['hired', 'hired'];
  const before = b.enemies.length;
  const lines = F.startRound(b, makeRng(9));
  const came = b.enemies.slice(before);
  assert.equal(came.length, 2);
  assert.ok(came.every((e) => e.approaching && e.group === came[0].group && e.group > 0), 'approaching, one group for the batch');
  assert.deepEqual(b.hiredTotal[came[0].group], 2, 'the batch is counted in its own group');
  for (const e of came) {
    assert.ok(!b.threats.some((t) => t.enemy === e.n && (t.kind === 'aim' || t.kind === 'flank')), 'no aimed shot or flank in the approach round');
    assert.ok(lines.some((l) => l.key === 'approach' && l.enemy === e.n), 'the approach is said');
  }
  assert.ok(b.enemies.slice(0, before).every((e) => !e.approaching && e.group === 0), 'the starting enemies never approach');
  F.playRound(b, makeRng(10));
  assert.ok(b.enemies.every((e) => !e.approaching), 'the approach round is over');
  // A radio card still plays: an approaching enemy that draws an alarm is not silenced.
  const c = build();
  c.arriving = ['hired'];
  for (let seed = 1; seed < 60; seed++) {
    const d = structuredClone(c);
    F.startRound(d, makeRng(seed));
    const e = d.enemies.at(-1);
    if (d.threats.some((t) => t.enemy === e.n)) { assert.ok(d.threats.filter((t) => t.enemy === e.n).every((t) => t.kind === 'alarm' || t.kind === 'backup'), 'only radio cards'); return; }
  }
  assert.fail('no approaching enemy ever drew a radio card');
});

test('3b: the `approaching` priority sends an attacker at an enemy still coming in first', () => {
  assert.ok(PRIORITY_WORDS.includes('approaching'));
  const b = build();
  const jax = b.runners[0];
  b.enemies = [foe(1, 'corp'), foe(2, 'hired', { approaching: true, group: 1 })];
  b.hiredTotal = { 1: 1 };
  b.round = 1;
  b.threats = [{ id: '1.1', kind: 'aim', enemy: 1, target: jax.id, shieldedBy: null, cancelled: false, shown: 0.5, hit: 2 }];
  b.drawn = true;
  holdAll(b);
  F.setOrder(b, jax.id, { duty: 'attack', target: null, fallback: null, priority: ['approaching'] });
  assert.equal(F.previewRound(b).actions.find((a) => a.who === jax.id).target, 2, 'the one coming in');
  F.setOrder(b, jax.id, { duty: 'attack', target: null, fallback: null, priority: ['protected', 'radio', 'low'] });
  assert.equal(F.previewRound(b).actions.find((a) => a.who === jax.id).target, 1, 'without it, the one aiming');
});

test('3c: each group breaks on its own; a lone arrival never runs; nobody runs in their approach round', () => {
  const b = build();
  b.enemies = [
    foe(1, 'hired'), foe(2, 'hired', { out: true }), foe(3, 'hired', { out: true }), // the starting group: one of three left
    foe(4, 'hired', { group: 1 }), foe(5, 'hired', { group: 1 }), // a batch of arrivals, both up
    foe(6, 'hired', { group: 2 }), // a lone arrival
    foe(7, 'hired', { group: 3, approaching: true }), foe(8, 'hired', { group: 3, out: true }), foe(9, 'hired', { group: 3, out: true }), // a wave shot down to one in its approach round
  ];
  b.hiredTotal = { 0: 3, 1: 2, 2: 1, 3: 3 };
  b.round = 1; b.threats = []; b.drawn = true;
  holdAll(b);
  const res = F.playRound(b, always(0.5));
  assert.deepEqual(res.fled, [1], 'only the starting group, the one under 40%');
  assert.ok(!b.enemies.find((e) => e.n === 7).fled, 'not in its approach round');
  // The next round the wave's last one is no longer approaching, and runs.
  b.threats = []; b.drawn = true;
  assert.deepEqual(F.playRound(b, always(0.5)).fled, [7]);
});

test('3d: a recipe\'s waves arrive on their round, approaching, a group each, on their own budget; the clocks\' kind by default', () => {
  withRecipe({ maxExtraEnemies: 1, waves: [{ round: 2, count: 2 }, { round: 3, kind: 'enforcer', count: 1 }] }, () => {
    const b = build({ job: '__test', opposition: 'police' });
    assert.equal(b.maxExtra, 1, 'the recipe\'s cap on reactive reinforcements');
    assert.equal(b.recipe.waves.length, 2);
    b.nextPressure = 99; // keep the pressure clock out of it
    F.startRound(b, makeRng(1)); F.playRound(b, makeRng(2));
    const n = b.enemies.length;
    const lines = F.startRound(b, makeRng(3));
    const wave = b.enemies.slice(n);
    assert.deepEqual(wave.map((e) => e.kind), ['police', 'police'], 'the police job\'s grunts, as the clocks send');
    assert.ok(wave.every((e) => e.approaching && e.group === wave[0].group));
    assert.equal(lines.filter((l) => l.key === 'wave').length, 2);
    assert.equal(b.extras, 0, 'waves never count towards the reinforcement cap');
    F.playRound(b, makeRng(4));
    const m = b.enemies.length;
    F.startRound(b, makeRng(5));
    assert.deepEqual(b.enemies.slice(m).map((e) => e.kind), ['enforcer'], 'a wave that names its kind');
    assert.notEqual(b.enemies.at(-1).group, wave[0].group, 'a new group');
    assert.equal(b.recipe, null, 'no waves left to come');
  });
  withRecipe({ waves: [{ round: 1, count: 1 }] }, () => {
    const b = build({ job: '__test' });
    assert.equal(b.maxExtra, FIGHT.maxExtraEnemies, 'no cap in the recipe: the default');
    F.startRound(b, makeRng(1));
    assert.equal(b.enemies.at(-1).kind, SITE_ENEMIES.docks[0], 'no opposition: the district\'s first kind');
  });
  assert.equal(build().recipe, null, 'a job without a recipe has no waves');
});

test('acceptance: a holdHack wave is engaged in its approach round by an attacker with the `approaching` priority, and cannot run that round', () => {
  withRecipe({ waves: [{ round: 2, kind: 'hired', count: 3 }] }, () => {
    const b = F.buildFight({ type: 'holdHack', diff: 12, threat: 2, site: 'heights', job: '__test', crew: crewOf().slice(0, 4), approach: 'loud' }, makeRng(6));
    const gun = b.runners.find((r) => r.id !== b.goal.protect);
    F.startRound(b, makeRng(1)); F.playRound(b, makeRng(2));
    F.setOrder(b, gun.id, { duty: 'attack', target: null, fallback: null, priority: ['approaching'] });
    F.startRound(b, makeRng(3));
    const wave = b.enemies.filter((e) => e.approaching);
    assert.equal(wave.length, 3);
    const act = F.previewRound(b).actions.find((a) => a.who === gun.id);
    assert.ok(wave.some((e) => e.n === act.target), 'the attacker goes for the wave');
    for (const e of wave.slice(0, 2)) e.out = true; // two of three down this round: well under 40%
    const res = F.playRound(b, makeRng(4));
    assert.ok(!res.fled.includes(wave[2].n), 'the wave cannot run in its approach round');
    assert.ok(res.lines.some((l) => l.kind === 'attack' && l.actor === gun.id && wave.some((e) => e.n === l.enemy)), 'and it was attacked');
  });
});

test('the round screen tags an enemy still coming in; the new words exist; the odds key reads the groups\' totals', () => {
  const b = build();
  b.arriving = ['hired'];
  F.startRound(b, makeRng(2));
  const v = roundView(b);
  assert.ok(v.enemies.find((e) => e.n === b.enemies.at(-1).n).approaching);
  for (const k of ['approach', 'wave', 'view.approaching']) assert.ok(FIGHT_TEXT[k] && !/^\[/.test(FIGHT_TEXT[k]), k);
  const c = structuredClone(b); c.hiredTotal = { ...c.hiredTotal, 0: (c.hiredTotal[0] ?? 0) + 1 };
  assert.notEqual(F.oddsKey(c, 8), F.oddsKey(b, 8));
});

test('a fight saved before v73 gets the defaults on load: group 0, not approaching, hiredTotal per group, the cap from data, no waves', async () => {
  const s = createNewGame({ seed: 5 });
  const b = build();
  for (const e of b.enemies) { delete e.group; delete e.approaching; }
  b.hiredTotal = 2; delete b.nextGroup; delete b.maxExtra; delete b.recipe;
  s.activeMission = { jobId: 'x', templateId: 'warehouse', battle: b, events: [], queue: [], step: 0, log: [] };
  s.version = 72;
  const loaded = await S.importSave({ text: async () => JSON.stringify(s) });
  assert.equal(loaded.version, SAVE_VERSION);
  assert.ok(SAVE_VERSION >= 73); // was `=== 73` until builds 3-ii-a bumped it to 74 (tests/builds.test.js has the v74 test)
  const lb = loaded.activeMission.battle;
  assert.deepEqual(lb.hiredTotal, { 0: 2 });
  assert.ok(lb.enemies.every((e) => e.group === 0 && e.approaching === false));
  assert.equal(lb.maxExtra, FIGHT.maxExtraEnemies);
  assert.equal(lb.nextGroup, 1);
  assert.equal(lb.recipe, null);
});
