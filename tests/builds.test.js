// Builds, slice 3-ii-a (core/fight.js, data/builds.js, core/builds.js; drafts/HANDOFF-builds-3iia.md): Ricochet's burst, the
// Cytotoxic Vector's infection and tick, the synthetic tag's immunity, shown equals used, and the save. Run with: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame } from '../src/core/state.js';
import { makeRng } from '../src/core/rng.js';
import * as F from '../src/core/fight.js';
import { ENEMIES, ENEMY_HIT, FIGHT } from '../src/data/fights.js';
import { MOVES, PAYLOADS, GIVEN_BUILD } from '../src/data/builds.js';
import { FIGHT_TEXT, FIGHT_TEXT_VARIANTS } from '../src/data/fightText.js';
import { lineText } from '../src/core/fighttext.js';
import { buildOf, immuneTo, withBuild } from '../src/core/builds.js';

const crewOf = () => createNewGame({ seed: 1 }).crew;
const foe = (n, kind = 'corp', o = {}) => ({ n, kind, hp: ENEMIES[kind].hp, max: ENEMIES[kind].hp, absorb: ENEMIES[kind].absorb ?? 0, cover: ENEMIES[kind].cover, out: false, fled: false, deck: ['aim'], di: 0, approaching: false, group: 0, infected: null, ...o });
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
  const r1 = F.playRound(b, mid); // the protector drops one first: the burst's bounce on it retargets to the one it had not planned on
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

test('Ricochet is agnostic of the crew (owner, 2026-11-17): it plans on an enemy a teammate is attacking, and a bounce on one already down retargets', () => {
  const b = fixture(['mei', 'jax', 'wing'], ['hired', 'hired', 'hired', 'hired'], { star: 'jax' });
  F.startRound(b, mid);
  const acts = F.resolveOrders(b).actions;
  const burst = acts.find((a) => a.kind === 'burst');
  const plain = acts.filter((a) => a.kind === 'attack').map((a) => a.enemy);
  assert.ok(burst && burst.enemies.length === 3);
  assert.ok(burst.enemies.some((n) => plain.includes(n)), 'it does not know or care who a teammate is shooting');
  const r = F.playRound(b, mid);
  const bounced = r.lines.filter((l) => l.key?.startsWith('bounce')).map((l) => l.enemy);
  assert.equal(new Set(bounced).size, bounced.length, 'never twice at the same enemy in one burst');
  assert.ok(bounced.length >= 2, 'a bounce whose target fell first went to another enemy up');
});

test('a landed hit infects, and the vector ticks from the next round, 1 pip a round, until the target dies', () => {
  const b = fixture(['jax', 'mei', 'wing'], ['corp', 'corp', 'corp', 'corp', 'corp'], { star: 'jax' });
  const r1 = F.playRound(b, mid);
  const infected = b.enemies.filter((e) => e.infected);
  assert.ok(infected.length >= 2, 'bounces that landed and left their target up infected it');
  assert.equal(r1.lines.filter((l) => l.key === 'infect').length, infected.length);
  assert.ok(!r1.lines.some((l) => l.key === 'tick' || l.key === 'tickOut'), 'no tick in the round of the hit');
  butts(b);
  const before = Object.fromEntries(b.enemies.map((e) => [e.n, e.hp]));
  const r2 = F.playRound(b, mid);
  const ticks = r2.lines.filter((l) => l.key === 'tick' || l.key === 'tickOut');
  assert.ok(ticks.length >= 1);
  for (const l of ticks) assert.ok(!b.enemies.find((e) => e.n === l.enemy).infected || b.enemies.find((e) => e.n === l.enemy).hp === (l.left ?? 0));
  assert.ok(r2.defeated.some((d) => d.how === 'vector') || b.enemies.every((e) => e.out || e.hp < before[e.n]), 'the infected lose a pip');
});

test('a crack: Contagion needs a damaging hit (owner, 2026-11-17), Cytotoxic infects through the plate (owner, 2026-11-20); past the plate it ticks exactly one pip', () => {
  const plated = fixture(['jax', 'mei', 'wing'], ['police', 'police', 'police', 'police'], { build: { move: 'ricochet', payload: 'contagion' } });
  const r0 = F.playRound(plated, mid);
  assert.ok(r0.lines.some((l) => l.key === 'bounceCrack'), 'a plated body takes a crack, not a pip');
  const jumped = new Set(r0.lines.filter((l) => l.key === 'spread').map((l) => l.enemy));
  assert.ok(plated.enemies.every((e) => !e.infected || jumped.has(e.n)), 'a crack carries no Contagion in; only a jump (not a hit) passes the plate');
  assert.ok(!r0.lines.some((l) => l.key === 'infect'));
  const cyto = fixture(['jax', 'mei', 'wing'], ['police', 'police', 'police', 'police']);
  const c0 = F.playRound(cyto, mid);
  const cracked = new Set(c0.lines.filter((l) => l.key === 'bounceCrack').map((l) => l.enemy));
  assert.ok(cracked.size >= 1);
  for (const n of cracked) { const e = cyto.enemies.find((x) => x.n === n); assert.ok(e.out || e.infected?.payload === 'cytotoxic', 'a cracked body carries the Cytotoxic'); }
  assert.ok(c0.lines.some((l) => l.key === 'infect'));
  const b = fixture(['jax', 'mei', 'wing'], ['corp', 'corp', 'corp', 'corp']);
  F.playRound(b, mid);
  const hit = b.enemies.filter((e) => e.infected && !e.out);
  assert.ok(hit.length >= 1, 'a hit past the armour carries the vector');
  for (const e of hit) assert.equal(e.hp, 10);
  butts(b);
  const r2 = F.playRound(b, mid);
  assert.ok(r2.defeated.filter((d) => d.how === 'vector').length >= 1, 'a delayed kill, exactly a pip');
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
  for (const e of b.enemies.slice(0, 4)) e.infected = { tick: 10, left: null, by: 'jax', round: 1, payload: 'cytotoxic' };
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
  const args = { type: 'holdYard', diff: 12, threat: 4, site: 'docks', approach: 'loud', risk: 'steady' };
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

test('the owner\'s variants: each key has three, all the same slots, and the pick is stable and never the fight\'s rng', () => {
  const slotsOf = (t) => [...t.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join();
  for (const [key, list] of Object.entries(FIGHT_TEXT_VARIANTS)) {
    assert.equal(list.length, 3, key);
    assert.equal(new Set(list.map(slotsOf)).size, 1, `${key}: every variant takes the same slots`);
    assert.equal(FIGHT_TEXT[key], list[0]);
  }
  const slots = { who: 'Jax', enemy: 'corp 2' };
  assert.equal(lineText('bounceHit', slots), lineText('bounceHit', slots));
  const seen = new Set();
  for (let n = 1; n <= 30; n++) seen.add(lineText('bounceHit', { who: 'Jax', enemy: `corp ${n}` }));
  assert.ok(seen.size > 1, 'the variants are used');
  assert.ok(![...seen].some((t) => /\{\w+\}/.test(t)), 'no slot left unfilled');
});

test('the crew\'s default orders leave a runner with a move to attack, so it fires (hack jobs and extractions)', () => {
  for (const type of ['holdHack', 'holdExtract']) {
    const crew = crewOf().filter((o) => ['jax', 'mei', 'wing', 'teo'].includes(o.id));
    crew.forEach((o) => Object.assign(o.stats, { combat: 15, cool: 40, endurance: o.id === 'jax' ? 40 : 8 })); // jax is by far the toughest
    const withB = crew.map((o) => (o.id === 'jax' ? { ...o, build: GIVEN_BUILD } : o));
    const b = F.buildFight({ type, diff: 14, threat: 3, site: 'docks', crew: withB, approach: 'loud' }, makeRng(3));
    const star = b.runners.find((r) => r.id === 'jax');
    assert.equal(F.orderOf(b, star).duty, 'attack', `${type}: the carrier attacks`);
    const plain = F.buildFight({ type, diff: 14, threat: 3, site: 'docks', crew, approach: 'loud' }, makeRng(3));
    assert.equal(F.orderOf(plain, plain.runners.find((r) => r.id === 'jax')).duty, 'protect', `${type}: with no build the toughest still protects`);
  }
});

// --- Contagion (slice 3-iii, 2026-11-17): a payload that jumps when its host falls --------------------------------------------------
const sick = (b, n, payload = 'contagion', o = {}) => { const e = b.enemies.find((x) => x.n === n); e.infected = { tick: 10, left: PAYLOADS[payload].dot.rounds, by: 'jax', round: 0, payload, ...o }; return e; };

test('Contagion: when an infected enemy falls to its tick, the infection jumps to the first other enemy of its group, in full, and ticks from the next round', () => {
  const b = fixture(['jax', 'mei', 'wing'], ['hired', 'hired', 'hired'], { build: { move: null, payload: 'contagion' } });
  sick(b, 1); butts(b);
  const r = F.playRound(b, mid);
  assert.ok(b.enemies[0].out, 'the one pip is gone to the tick');
  const jump = r.lines.find((l) => l.key === 'spread');
  assert.ok(jump, 'the jump is said');
  assert.equal(jump.from, 1); assert.equal(jump.enemy, 2);
  assert.ok(r.lines.findIndex((l) => l.key === 'spread') > r.lines.findIndex((l) => l.key === 'tickOut'), 'said after the fall');
  const t = b.enemies[1];
  assert.deepEqual({ tick: t.infected.tick, left: t.infected.left, payload: t.infected.payload, by: t.infected.by }, { tick: 10, left: 2, payload: 'contagion', by: 'jax' });
  assert.equal(t.infected.round, b.round, 'it starts this round, so its first tick is the next one');
  assert.ok(!b.enemies[2].infected, 'one jump per fall');
});

test('Contagion: a chain runs one fall per round, and the infection burns out after its rounds', () => {
  const b = fixture(['jax', 'mei', 'wing'], ['hired', 'hired', 'hired'], { build: { move: null, payload: 'contagion' } });
  sick(b, 1); butts(b);
  F.playRound(b, mid); F.playRound(b, mid);
  assert.deepEqual(b.enemies.map((e) => e.out), [true, true, false], 'the jump kept the chain going');
  assert.ok(b.enemies[2].infected, 'and handed it on again');
  const c = fixture(['jax', 'mei', 'wing'], ['corp', 'corp'], { build: { move: null, payload: 'contagion' } });
  sick(c, 1); butts(c);
  F.playRound(c, mid); F.playRound(c, mid);
  assert.ok(c.enemies[0].out, 'two pips, two ticks: down');
  const d = fixture(['jax', 'mei', 'wing'], ['enforcer', 'enforcer'], { build: { move: null, payload: 'contagion' } });
  Object.assign(d.enemies[0], { hp: 50, max: 50 }); sick(d, 1); butts(d);
  F.playRound(d, mid); F.playRound(d, mid);
  assert.equal(d.enemies[0].hp, 30);
  assert.equal(d.enemies[0].infected, null, 'it burned out after two rounds: the cost of the shorter infection');
});

test('Contagion: the Cytotoxic Vector does not jump; machines, the already infected and another group are skipped; nobody to jump to says nothing', () => {
  const cyto = fixture(['jax', 'mei', 'wing'], ['hired', 'hired'], { build: GIVEN_BUILD });
  sick(cyto, 1, 'cytotoxic'); butts(cyto);
  const rc = F.playRound(cyto, mid);
  assert.ok(!rc.lines.some((l) => l.key === 'spread') && !cyto.enemies[1].infected);
  const b = fixture(['jax', 'mei', 'wing'], ['hired', 'drone', 'hired', 'hired'], { build: { move: null, payload: 'contagion' } });
  b.enemies[3].group = 5; // another group
  sick(b, 1); sick(b, 3, 'contagion', { round: 9 }); butts(b);
  const r = F.playRound(b, mid);
  assert.ok(!r.lines.some((l) => l.key === 'spread'), 'the drone is immune, the third is already sick, the fourth is in another group');
  assert.ok(!b.enemies[1].infected);
});

test('Contagion: wording for the jump, three variants, and a draft piece in data the offers can reach', () => {
  assert.ok(FIGHT_TEXT.spread && FIGHT_TEXT_VARIANTS.spread.length === 3);
  const p = PAYLOADS.contagion;
  assert.equal(p.name, 'Contagion Vector');
  assert.equal(p.family, PAYLOADS.cytotoxic.family, 'a variation of the Cytotoxic Vector: one family, one slot');
  assert.ok(p.pieces.some((x) => x.when === 'onKill' && x.what.spread === 'infected') && p.slot === 'payload' && p.dot.rounds === 2 && p.immune.includes('synthetic') && p.desc && p.offer);
  assert.ok(immuneTo('drone', 'contagion') && !immuneTo('hired', 'contagion'));
});

test('Contagion: the killing hit counts, so a one-pip enemy that dies to it still passes it on; the Vector and a machine do not', () => {
  const play = (payload, kinds) => {
    const b = fixture(['jax', 'mei', 'wing'], kinds, { build: null });
    for (const r of b.runners) r.build = { move: null, payload };
    return { b, r: F.playRound(b, mid) };
  };
  const { b, r } = play('contagion', ['hired', 'hired', 'hired', 'hired']);
  const felled = r.defeated.filter((d) => d.how === 'attack').map((d) => d.enemy);
  assert.ok(felled.length >= 1, 'a hit dropped a one-pip enemy');
  assert.ok(r.lines.some((l) => l.key === 'spread' && felled.includes(l.from)), 'and the infection jumped from it');
  assert.ok(b.enemies.some((e) => !e.out && e.infected?.payload === 'contagion'), 'a survivor carries it into next round');
  const c = play('cytotoxic', ['hired', 'hired', 'hired', 'hired']);
  assert.ok(!c.r.lines.some((l) => l.key === 'spread'), 'the Cytotoxic Vector has nothing to pass on from a kill');
  const d = play('contagion', ['drone', 'drone', 'drone', 'drone']);
  assert.ok(!d.r.lines.some((l) => l.key === 'spread'), 'a machine is never infected, so nothing jumps from it');
});

test('Contagion: an infected enemy felled by a shot, or by overwatch, hands the infection on (not only the tick)', () => {
  // A crew with no build at all: the infection the enemy already carries is the only thing that can jump.
  const shot = fixture(['jax', 'mei', 'wing'], ['hired', 'hired', 'hired'], { build: null });
  sick(shot, 1, 'contagion', { round: 0 });
  const r = F.playRound(shot, mid);
  const felled = r.defeated.filter((d) => d.how === 'attack' && d.enemy === 1);
  assert.equal(felled.length, 1, 'a crew shot dropped the sick one-pip enemy');
  const jump = r.lines.find((l) => l.key === 'spread' && l.from === 1);
  assert.ok(jump, 'and the infection jumped on from the shot kill');
  assert.ok(r.lines.findIndex((l) => l.key === 'spread') > r.lines.findIndex((l) => l.key === 'attackOut'), 'said after the fall');
  assert.equal(shot.enemies.find((e) => e.n === jump.enemy).infected.payload, 'contagion', 'the new host carries the vector');

  const ow = fixture(['jax', 'wing'], ['hired', 'hired', 'hired'], { build: null });
  butts(ow); // no crew shot lands: only overwatch fires
  ow.overwatch = { id: 'jax', handle: 'Jax', kit: 'rifle', name: 'Rifle', stat: 'combat', value: 40, damage: 0, left: 2, vanShots: 0, heat: 0, neural: 0 };
  sick(ow, 3, 'contagion', { round: 0 }); // the crew's plans cover enemies 1 and 2, so overwatch takes the third
  const o = F.playRound(ow, mid);
  const out = o.lines.find((l) => l.key === 'overwatchOut' && l.enemy === 3);
  assert.ok(out, 'overwatch put the sick enemy down');
  const hop = o.lines.find((l) => l.key === 'spread' && l.from === 3);
  assert.ok(hop, 'and it handed the infection on');
  assert.ok(o.lines.indexOf(hop) > o.lines.indexOf(out), 'said after the fall');
  assert.ok(ow.enemies.find((e) => e.n === hop.enemy).infected, 'the new host is infected');
});

test('the planning read names the Contagion Vector, and a drone is still one it cannot hurt', async () => {
  const { buildRead } = await import('../src/core/fightview.js');
  const withKinds = (kinds) => fixture(['jax', 'mei', 'wing'], kinds, { build: { move: null, payload: 'contagion' } });
  const fits = buildRead(withKinds(['hired', 'hired', 'hired']));
  assert.ok(fits.advice.includes('Contagion Vector'), `the advice names it: ${fits.advice}`);
  assert.ok(fits.answers[0].text.includes('Contagion Vector') && fits.answers[0].tags.includes('Contagion Vector'), 'and so does the breakdown');
  const drones = buildRead(withKinds(['drone', 'drone']));
  assert.ok(/cannot hurt/.test(drones.advice) && drones.advice.includes('Contagion Vector'), `a drone is still one it cannot hurt: ${drones.advice}`);
  assert.ok(/cannot affect/.test(drones.answers[0].text), 'the breakdown says it cannot affect them');
  assert.ok(drones.threats.some((t) => /machines/i.test(t.text)), 'and the threat list says machines');
});

test('the save: a v75 hack fight in progress still ends with the hack; one built now carries its way out', async () => {
  const S = await import('../src/save/save.js');
  const { SAVE_VERSION } = await import('../src/core/state.js');
  assert.ok(SAVE_VERSION >= 76);
  const fresh = F.buildFight({ type: 'holdHack', diff: 14, threat: 3, site: 'docks', crew: crewOf().slice(0, 3), approach: 'loud' }, makeRng(3));
  assert.deepEqual(fresh.wayOut, fresh.enemies.map((e) => e.kind).slice(0, Math.max(1, Math.ceil(fresh.enemies.length * FIGHT.wayOutShare))), 'the way out is the share of the opening force, read when the fight is built');
  const old = JSON.parse(JSON.stringify(fresh));
  delete old.wayOut;
  const s = createNewGame({ seed: 5 });
  s.activeMission = { jobId: 'x', templateId: 'data_pull', battle: old, events: [], queue: [], step: 0, log: [] };
  s.version = 75;
  const loaded = await S.importSave({ text: async () => JSON.stringify(s) });
  assert.equal(loaded.version, SAVE_VERSION);
  assert.equal(loaded.activeMission.battle.wayOut, undefined, 'nothing is rewritten');
  const lb = loaded.activeMission.battle;
  lb.goal.work = 4; lb.enemies = []; lb.clock = 99;
  F.startRound(lb, makeRng(1)); F.playRound(lb, mid);
  assert.equal(lb.end.result, 'won', 'the hack still ends it');
});

test('the medic\'s hands on the way out: a healer standing steadies the runner the round left alone and patches the hurt before the crew leaves; without one nothing changes', () => {
  const run = (withMedic) => {
    const b = fixture(['jax', 'mei', 'wing', 'cherry'], ['hired'], { build: null });
    b.type = 'holdHack'; b.wayOut = ['hired']; b.stage = 1; b.arriving = []; b.clock = 99; b.goal.work = 4; b.round = 4;
    for (const r of b.runners) { r.healer = false; r.medic = false; }
    const [d1, d2, hurt, medic] = b.runners;
    for (const d of [d1, d2]) { d.down = true; d.hp = 0; d.downRound = 3; }
    hurt.max = 60; hurt.hp = 30; // above the point where a steady crew pulls out, and the aura heals only the most hurt
    if (withMedic) { medic.healer = true; medic.medic = true; medic.stats.medical.value = 40; }
    const r = F.playRound(b, mid);
    return { b, r, downed: [d1, d2], hurt, hurtBefore: 3 };
  };
  const m = run(true);
  assert.equal(m.b.end?.key, 'end.wayOutPulled', 'someone is down on steady: the crew breaks off');
  assert.ok(m.downed.every((d) => d.stable), 'the medic reached both: one in the round, the other as the crew left');
  assert.equal(m.r.lines.filter((l) => l.key === 'stabiliseWayOut').length, 1, 'the one the round left alone');
  assert.ok(m.r.lines.some((l) => l.key === 'wayOutPatch'));
  assert.ok(m.hurt.hp > m.hurtBefore + 10, 'a hurt runner who was up is healed by the aura and patched on the way out');
  const n = run(false);
  assert.ok(n.downed.every((d) => !d.stable), 'nobody to reach them');
  assert.ok(!n.r.lines.some((l) => l.key === 'stabiliseWayOut' || l.key === 'wayOutPatch'));
});

test('the medic\'s aura line carries the patient and the pip it filled, for the stage', () => {
  const b = fixture(['jax', 'mei', 'wing'], ['hired'], { build: null });
  b.type = 'holdHack';
  for (const r of b.runners) { r.healer = false; r.medic = false; }
  b.runners[0].medic = true; b.runners[0].healer = true;
  b.runners[1].hp = b.runners[1].max - 10;
  const r = F.playRound(b, mid);
  const l = r.lines.find((x) => x.key === 'aura');
  assert.ok(l, 'the aura fired');
  assert.equal(l.targetId, l.target);
  assert.equal(l.left, b.runners.find((x) => x.id === l.targetId).hp);
  assert.equal(l.max, b.runners.find((x) => x.id === l.targetId).max);
});
