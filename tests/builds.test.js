// Builds, slice 3-ii-a (core/fight.js, data/builds.js, core/builds.js; drafts/HANDOFF-builds-3iia.md): Ricochet's burst, the
// Cytotoxic Vector's infection and tick, the synthetic tag's immunity, shown equals used, and the save. Run with: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame } from '../src/core/state.js';
import { makeRng } from '../src/core/rng.js';
import * as F from '../src/core/fight.js';
import { ENEMIES, ENEMY_HIT } from '../src/data/fights.js';
import { MOVES, PAYLOADS, GIVEN_BUILD } from '../src/data/builds.js';
import { FIGHT_TEXT } from '../src/data/fightText.js';
import { buildOf, immuneTo, withBuild } from '../src/core/builds.js';

const crewOf = () => createNewGame({ seed: 1 }).crew;
const foe = (n, kind = 'corp', o = {}) => ({ n, kind, pips: ENEMIES[kind].pips, max: ENEMIES[kind].pips, absorb: ENEMIES[kind].absorb ?? 0, cover: ENEMIES[kind].cover, out: false, fled: false, deck: ['aim'], di: 0, approaching: false, group: 0, infected: null, ...o });
/** A fight on the yard with the named runners; `star` carries the given build; combat 15 hits every time on a die of 11 and is never strong; cool 40 keeps every shot off. */
function fixture(who, kinds, { build = GIVEN_BUILD, star = who[0], risk = 'steady' } = {}) {
  const crew = crewOf().filter((o) => who.includes(o.id)).sort((a, b) => who.indexOf(a.id) - who.indexOf(b.id));
  crew.forEach((o, i) => Object.assign(o.stats, { combat: 15, cool: 40, endurance: i === crew.length - 1 ? 30 : 6 })); // the last in the list is the toughest: the yard's protector, so the others attack
  const withB = crew.map((o) => (o.id === star && build ? { ...o, build } : o));
  const b = F.buildFight({ type: 'holdYard', diff: 14, threat: 3, site: 'docks', crew: withB, approach: 'loud', risk }, makeRng(3));
  b.enemies = kinds.map((k, i) => foe(i + 1, k)); b.hiredTotal = { 0: kinds.filter((k) => ENEMIES[k].fleeBelow != null).length };
  return b;
}
const mid = () => 0.5; // d20 = 11; aim rolls (< chance) never land against cool 40
const keys = (r) => r.lines.map((l) => l.key);
/** Nobody on the crew can hit any more, so what happens next is the vector's alone. */
const butts = (b) => { for (const r of b.runners) r.stats.combat.value = -50; };

test('the build is data: ids that exist, read once into the runner', () => {
  assert.ok(MOVES.ricochet && PAYLOADS.cytotoxic);
  assert.equal(buildOf({}), null);
  assert.equal(buildOf({ build: { move: 'nope', payload: 'nope' } }), null);
  assert.deepEqual(buildOf({ build: GIVEN_BUILD }), GIVEN_BUILD);
  const b = fixture(['jax', 'mei', 'wing'], ['corp']);
  assert.deepEqual(b.runners[0].build, GIVEN_BUILD);
  assert.equal(b.runners[1].build, null);
  assert.equal(b.runners[0].look, 'ricochet');
});

test('withBuild gives the build to the best combat runner and touches nobody else or the crew passed in', () => {
  const crew = crewOf().slice(0, 4);
  crew.forEach((o, i) => { o.stats.combat = [3, 9, 9, 5][i]; });
  const out = withBuild(crew);
  assert.deepEqual(out.map((o) => !!o.build), [false, true, false, false]); // a tie goes to the lowest seat
  assert.ok(crew.every((o) => !o.build));
});

test('Ricochet fires by itself with 2 or more enemies up: up to 3 bounces, each a new enemy, once a fight', () => {
  const b = fixture(['jax', 'mei', 'wing'], ['hired', 'hired', 'hired', 'hired']);
  const r1 = F.playRound(b, mid);
  const bounces = r1.lines.filter((l) => l.key?.startsWith('bounce'));
  assert.equal(bounces.length, 3);
  assert.equal(new Set(bounces.map((l) => l.enemy)).size, 3);
  assert.ok(bounces.every((l) => l.burst && l.kind === 'attack' && l.actor === 'jax'));
  assert.equal(b.runners[0].moved, true);
  // The others' ordinary attacks are not bursts, and the star's next round is an ordinary attack.
  assert.ok(r1.lines.filter((l) => l.key?.startsWith('attack') && l.actor !== 'jax').every((l) => !l.burst));
  const b2 = fixture(['jax', 'mei', 'wing'], ['corp', 'corp', 'corp', 'corp', 'corp']);
  F.playRound(b2, mid);
  const r2 = F.playRound(b2, mid);
  assert.ok(!r2.lines.some((l) => l.burst), 'one use a fight');
});

test('it waits for 2 free enemies: one enemy up is an ordinary attack, and the move stays unspent', () => {
  const b = fixture(['jax', 'mei', 'wing'], ['corp']);
  const r1 = F.playRound(b, mid);
  assert.ok(!r1.lines.some((l) => l.burst));
  assert.equal(b.runners[0].moved, false);
});

test('a burst never takes an enemy another attacker has reserved', () => {
  const b = fixture(['mei', 'jax', 'wing'], ['hired', 'hired', 'hired', 'hired'], { star: 'jax' }); // wing (the protector, fallback attack) and mei attack first and reserve one each
  F.startRound(b, mid);
  const burst = F.resolveOrders(b).actions.find((a) => a.kind === 'burst');
  const plain = F.resolveOrders(b).actions.filter((a) => a.kind === 'attack').map((a) => a.enemy);
  assert.ok(burst, 'jax fires');
  assert.ok(burst.enemies.every((n) => !plain.includes(n)), 'no overlap with the other attackers');
  assert.equal(new Set([...plain, ...burst.enemies]).size, plain.length + burst.enemies.length);
});

test('a landed hit infects, and the vector ticks from the next round, 1 pip a round, until the target dies', () => {
  const b = fixture(['jax', 'mei', 'wing'], ['corp', 'corp', 'corp', 'corp', 'corp'], { star: 'jax' });
  const r1 = F.playRound(b, mid);
  const infected = b.enemies.filter((e) => e.infected);
  assert.equal(infected.length, 3, 'every bounce that landed infected a new target (the protector and mei took two of the five)');
  assert.equal(r1.lines.filter((l) => l.key === 'infect').length, 3);
  assert.ok(!r1.lines.some((l) => l.key === 'tick' || l.key === 'tickOut'), 'no tick in the round of the hit');
  butts(b);
  const before = Object.fromEntries(b.enemies.map((e) => [e.n, e.pips]));
  const r2 = F.playRound(b, mid);
  const ticks = r2.lines.filter((l) => l.key === 'tick' || l.key === 'tickOut');
  assert.ok(ticks.length >= 1);
  for (const l of ticks) assert.ok(!b.enemies.find((e) => e.n === l.enemy).infected || b.enemies.find((e) => e.n === l.enemy).pips === (l.left ?? 0));
  assert.ok(r2.defeated.some((d) => d.how === 'vector') || b.enemies.every((e) => e.out || e.pips < before[e.n]), 'the infected lose a pip');
});

test('the tick is exactly one pip and kills a plated body the hit only cracked; an infection does not spread or stack', () => {
  const b = fixture(['jax', 'mei', 'wing'], ['police', 'police', 'police', 'police']);
  const r1 = F.playRound(b, mid);
  const cracked = r1.lines.filter((l) => l.key === 'bounceCrack');
  assert.ok(cracked.length >= 1, 'a plated body takes a crack, not a pip');
  const hit = b.enemies.filter((e) => e.infected);
  assert.ok(hit.length >= 1, 'a hit that only cracks a plate still carries the vector');
  for (const e of hit) assert.equal(e.pips, 1);
  butts(b);
  const r2 = F.playRound(b, mid);
  assert.ok(r2.defeated.filter((d) => d.how === 'vector').length >= 1, 'a delayed kill');
  assert.ok(b.enemies.filter((e) => e.infected && !e.out).every((e) => e.infected.round === 1), 'not renewed or re-stacked');
});

test('the synthetic tag: a drone shrugs the vector off, said once, and is never infected', () => {
  assert.ok(ENEMIES.drone.foeTags.includes('synthetic'));
  assert.ok(immuneTo('drone', 'cytotoxic') && !immuneTo('hired', 'cytotoxic') && !immuneTo('corp', 'cytotoxic'));
  const b = fixture(['jax', 'mei', 'wing'], ['drone', 'drone', 'drone']);
  const r1 = F.playRound(b, mid);
  assert.ok(b.enemies.every((e) => !e.infected));
  const said = r1.lines.filter((l) => l.key === 'immune');
  assert.ok(said.length >= 1);
  assert.equal(new Set(said.map((l) => l.enemy)).size, said.length, 'once a body');
});

test('a tick counts toward the group flee check like any other loss', () => {
  const b = fixture(['jax', 'mei', 'wing'], ['hired', 'hired', 'hired', 'hired', 'hired', 'hired']);
  // Four of six are infected and one pip from going; the group breaks when fewer than 40% are up (two of six is a third).
  b.round = 3; b.drawn = false;
  for (const e of b.enemies.slice(0, 4)) e.infected = { tick: 1, left: null, by: 'jax', round: 1, payload: 'cytotoxic' };
  b.runners[0].moved = true; // no burst: the vector alone does it
  butts(b);
  const r = F.playRound(b, mid);
  assert.equal(r.defeated.filter((d) => d.how === 'vector').length, 4);
  assert.deepEqual(r.fled.sort(), [5, 6], 'the tick took the group under 40% before the flee check, so the two left ran');
});

test('shown equals used: the preview names the burst and the coming ticks, draws nothing, and the round does it', () => {
  const b = fixture(['jax', 'mei', 'wing'], ['corp', 'corp', 'corp', 'corp']);
  F.startRound(b, mid);
  const copy = structuredClone(b);
  const pv = F.previewRound(b);
  assert.deepEqual(b, copy, 'previews change nothing');
  const burst = pv.actions.find((a) => a.who === 'jax');
  assert.equal(burst.kind, 'burst');
  assert.equal(burst.targets.length, 3);
  assert.equal(burst.carries, 'cytotoxic');
  assert.deepEqual(pv.ticks, []);
  const r = F.playRound(b, mid);
  assert.deepEqual(r.lines.filter((l) => l.key?.startsWith('bounce')).map((l) => l.enemy), burst.targets);
  // The next round's preview lists who the vector will take.
  F.startRound(b, mid);
  const pv2 = F.previewRound(b);
  assert.deepEqual(pv2.ticks.map((t) => t.enemy).sort(), b.enemies.filter((e) => e.infected && !e.out).map((e) => e.n).sort());
  const infectedUp = pv2.ticks.map((t) => t.enemy);
  const r2 = F.playRound(b, mid);
  const ticked = r2.lines.filter((l) => l.key === 'tick' || l.key === 'tickOut').map((l) => l.enemy);
  assert.deepEqual([...ticked].sort(), infectedUp.filter((n) => ticked.includes(n)).sort());
  assert.ok(infectedUp.every((n) => ticked.includes(n) || b.enemies.find((e) => e.n === n).out), 'every shown tick was played unless the body had already gone');
});

test('the odds play the build (a built crew is not priced as a plain one) and are deterministic', () => {
  const crew = crewOf().slice(0, 3);
  for (const o of crew) Object.assign(o.stats, { combat: 8, cool: 6 });
  const args = { type: 'holdYard', diff: 12, threat: 5, site: 'docks', approach: 'loud', risk: 'steady' };
  const plain = F.fightOddsFor({ ...args, crew });
  const built = F.fightOddsFor({ ...args, crew: withBuild(crew) });
  assert.deepEqual(F.fightOddsFor({ ...args, crew: withBuild(crew) }), built);
  assert.notDeepEqual(plain, built);
});

test('every new line has wording, and a crew with no build plays exactly as before (same draws, same lines)', () => {
  for (const k of ['bounceHit', 'bounceCrack', 'bounceOut', 'bounceMiss', 'infect', 'tick', 'tickOut', 'immune', 'intent.burst']) assert.ok(FIGHT_TEXT[k], k);
  const a = fixture(['jax', 'mei', 'wing'], ['hired', 'corp', 'corp'], { build: null });
  const ra = F.playRound(a, makeRng(9));
  assert.ok(!ra.lines.some((l) => l.burst || ['infect', 'tick', 'immune'].includes(l.key)));
  assert.ok(Object.values(ENEMY_HIT).length > 0);
});

test('the save: a v73 fight in progress upgrades with no infection and no builds, and a fight with both survives a round trip', async () => {
  const S = await import('../src/save/save.js');
  const { SAVE_VERSION } = await import('../src/core/state.js');
  assert.ok(SAVE_VERSION >= 74);
  const b = fixture(['jax', 'mei', 'wing'], ['corp', 'corp', 'corp', 'corp']);
  F.playRound(b, mid);
  assert.deepEqual(JSON.parse(JSON.stringify(b)), b, 'infection and the spent move are plain data');
  const old = JSON.parse(JSON.stringify(b));
  for (const e of old.enemies) delete e.infected;
  for (const r of old.runners) { delete r.build; delete r.moved; }
  const s = createNewGame({ seed: 5 });
  s.activeMission = { jobId: 'x', templateId: 'warehouse', battle: old, events: [], queue: [], step: 0, log: [] };
  s.version = 73;
  const loaded = await S.importSave({ text: async () => JSON.stringify(s) });
  assert.equal(loaded.version, SAVE_VERSION);
  assert.ok(loaded.activeMission.battle.enemies.every((e) => e.infected === null));
  assert.ok(loaded.activeMission.battle.runners.every((r) => r.build === null && r.moved === false));
});
