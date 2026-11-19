// The build vocabulary, part B (2026-11-19; drafts/HANDOFF-build-vocab-next.md, the owner's answers): the first new statuses beside
// `infected`, each with the rule core/fight.js gives it, and the four draft payloads that use them (data/builds.js; never offered yet).
//   burning  a plain damage over time: ticks like the Vector, never jumps, machines burn
//   marked   nothing by itself; read by a piece's `if: { targetHas: 'marked' }`
//   exposed  the next hit it takes ignores its plate, and uses it up
//   shaken   counts as gone in its group's flee check
// Run with: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame } from '../src/core/state.js';
import { makeRng } from '../src/core/rng.js';
import * as F from '../src/core/fight.js';
import { PAYLOADS, BUILD_OFFER } from '../src/data/builds.js';
import { eligiblePieces, offerPick } from '../src/core/builds.js';

const foe = (n, kind = 'hired', o = {}) => ({ n, kind, hp: 30, max: 30, absorb: 0, cover: 'open', out: false, fled: false, deck: ['aim'], di: 0, approaching: false, group: 0, infected: null, burning: null, marked: null, exposed: null, shaken: null, ...o });
/** A small fixed fight: jax (the build, combat 30) attacks enemy 1; the others hold. */
function fight(payload, foes = [foe(1), foe(2), foe(3)], { mate = null } = {}) {
  const crew = createNewGame({ seed: 1 }).crew.filter((o) => o.id === 'jax' || (mate && o.id === 'wing'));
  for (const o of crew) { o.stats.combat = 30; o.build = o.id === 'jax' ? { move: null, payload } : mate ? { move: null, payload: mate } : null; }
  const b = F.buildFight({ type: 'holdYard', diff: 10, threat: 3, site: 'docks', crew, approach: 'loud', risk: 'steady' }, makeRng(3));
  b.enemies = foes;
  b.hiredTotal = {};
  F.setOrder(b, 'jax', { duty: 'attack', target: 1, fallback: null });
  if (mate) F.setOrder(b, 'wing', { duty: 'attack', target: 1, fallback: null });
  return b;
}
const HIT = () => 0.3; // a plain hit (lands, not strong): with one plate it only cracks it
const STRONG = () => 0.99;

test('the vocabulary knows the four new statuses, onCrack and targetHas', () => {
  for (const st of ['burning', 'marked', 'exposed', 'shaken']) assert.ok(F.VOCAB.status.includes(st), st);
  assert.ok(F.VOCAB.when.includes('onCrack'));
  assert.ok(F.VOCAB.if.includes('targetHas'));
  assert.equal(F.pieceHolds(null, { targetHas: 'marked' }, { marked: null }), false);
  assert.equal(F.pieceHolds(null, { targetHas: 'marked' }, { marked: {} }), true);
});

test('the four new pieces are offered like the others (owner, 2026-11-19); a piece marked draft never is', () => {
  const op = { id: 'x', stats: { combat: 30, cool: 30, tech: 30, medical: 30 }, build: null };
  const offered = eligiblePieces(op).map((p) => p.id);
  for (const id of ['incendiary', 'spotter', 'breacher', 'rout', 'cytotoxic']) assert.ok(offered.includes(id), id);
  PAYLOADS.testdraft = { id: 'testdraft', name: 'Test draft', slot: 'payload', needs: {}, draft: true, pieces: [] };
  try { assert.ok(!eligiblePieces(op).some((p) => p.id === 'testdraft')); } finally { delete PAYLOADS.testdraft; }
});

test('an offer shows at most BUILD_OFFER.size pieces, the same for a runner and day, and over the days every piece comes up', () => {
  const op = { id: 'x', stats: { combat: 30, cool: 30, tech: 30, medical: 30 }, build: null };
  const all = eligiblePieces(op);
  assert.ok(all.length > BUILD_OFFER.size);
  assert.deepEqual(offerPick(all, op, 40).map((p) => p.id), offerPick(all, op, 40).map((p) => p.id));
  const seen = new Set();
  for (let day = 0; day < 200; day++) { const pick = offerPick(all, op, day); assert.equal(pick.length, BUILD_OFFER.size); for (const p of pick) seen.add(p.id); }
  assert.deepEqual([...seen].sort(), all.map((p) => p.id).sort());
});

test('burning: a hit sets it, it ticks from the next round, and it never jumps when its host falls', () => {
  const b = fight('incendiary');
  const r1 = F.playRound(b, HIT);
  assert.ok(r1.lines.some((l) => l.key === 'burn' && l.enemy === 1));
  assert.deepEqual([b.enemies[0].burning.tick, b.enemies[0].burning.left], [10, 2]);
  F.setOrder(b, 'jax', { duty: 'hunker', target: null, fallback: null });
  const hp = b.enemies[0].hp;
  const pv = F.previewRound((F.startRound(b, HIT), b));
  assert.deepEqual(pv.ticks.map((t) => [t.enemy, t.status, t.hp]), [[1, 'burning', 10]], 'the preview shows the burn it will take');
  const r2 = F.playRound(b, HIT);
  assert.equal(b.enemies[0].hp, hp - 10);
  assert.ok(r2.lines.some((l) => l.key === 'burnTick' && l.status === 'burning'));
  // A burning host that falls passes nothing on.
  const c = fight('incendiary');
  c.enemies[0].hp = 5; c.enemies[0].burning = { tick: 10, left: 2, by: 'jax', round: 0, payload: 'incendiary' };
  F.setOrder(c, 'jax', { duty: 'hunker', target: null, fallback: null });
  const rc = F.playRound(c, HIT);
  assert.ok(c.enemies[0].out && rc.lines.some((l) => l.key === 'burnOut'));
  assert.ok(c.enemies.slice(1).every((e) => !e.burning), 'no jump');
});

test('burning goes on through a plate (onCrack), and machines burn', () => {
  const b = fight('incendiary', [foe(1, 'drone', { hp: 10, max: 10, absorb: 1 }), foe(2)]);
  const r = F.playRound(b, HIT);
  assert.ok(r.lines.some((l) => l.key === 'attackCrack' && l.enemy === 1), 'the shot only cracked the plate');
  assert.equal(b.enemies[0].burning?.payload, 'incendiary');
  assert.ok(!r.lines.some((l) => l.key === 'immune'));
});

test('a status never stacks or renews', () => {
  const b = fight('incendiary');
  F.playRound(b, HIT);
  const first = b.enemies[0].burning;
  F.playRound(b, HIT);
  assert.equal(b.enemies[0].burning, first);
});

test('marked: a hit or a crack marks, and it does nothing by itself', () => {
  const b = fight('spotter', [foe(1, 'police', { hp: 10, max: 10, absorb: 1 }), foe(2)]);
  const r = F.playRound(b, HIT);
  assert.ok(r.lines.some((l) => l.key === 'mark'));
  assert.ok(b.enemies[0].marked && b.enemies[0].hp === 10 && b.enemies[0].absorb === 0);
});

test('exposed: a crack exposes the next of the group; its next hit skips its plate and uses the status up', () => {
  const b = fight('breacher', [foe(1, 'police', { hp: 10, max: 10, absorb: 1 }), foe(2, 'police', { hp: 30, max: 30, absorb: 1 }), foe(3, 'corp', { group: 1 })]);
  const r = F.playRound(b, HIT);
  assert.ok(r.lines.some((l) => l.key === 'expose' && l.enemy === 2));
  assert.ok(b.enemies[1].exposed && !b.enemies[2].exposed, 'only the same group');
  F.setOrder(b, 'jax', { duty: 'attack', target: 2, fallback: null });
  const r2 = F.playRound(b, HIT);
  const hit = r2.lines.find((l) => l.kind === 'attack' && l.enemy === 2);
  assert.ok(hit.pierced && hit.damage > 0 && !hit.cracked, 'the plate was skipped');
  assert.equal(30 - b.enemies[1].hp, hit.damage, 'the line says what it took');
  assert.ok(hit.damage >= 10 + PAYLOADS.breacher.expose.extra - 2, 'a full plain hit plus the exposed extra (owner, 2026-11-19)');
  assert.equal(b.enemies[1].absorb, 1, 'the plate is still there for the next shot');
  assert.equal(b.enemies[1].exposed, null, 'used up');
});

test('targetHas: a hit on a marked body exposes the next one (the spotter beside the breacher)', () => {
  const b = fight('breacher', [foe(1, 'corp', { marked: { by: 'wing', round: 0, payload: 'spotter' } }), foe(2, 'police', { absorb: 1 })]);
  F.playRound(b, HIT);
  assert.ok(b.enemies[1].exposed);
  const c = fight('breacher', [foe(1, 'corp'), foe(2, 'police', { absorb: 1 })]);
  F.playRound(c, HIT);
  assert.equal(c.enemies[1].exposed, null, 'not without the mark');
});

test('shaken counts as gone in its group\'s flee check', () => {
  const play = (shaken) => {
    const b = fight(null, [foe(1, 'hired', { hp: 1, max: 30 }), foe(2, 'hired', { shaken }), foe(3, 'hired')]);
    b.hiredTotal = { 0: 3 };
    F.playRound(b, STRONG);
    return b.enemies.filter((e) => e.fled).length;
  };
  assert.equal(play(null), 0, 'two of three still up: they hold');
  assert.equal(play({ by: 'jax', round: 0, payload: 'rout' }), 2, 'one of three holding: they run');
});

test('Rout: a kill shakes the next of the group; a marked kill shakes one more; a shaken body falling to someone else passes nothing on', () => {
  const b = fight('rout', [foe(1, 'hired', { hp: 1 }), foe(2), foe(3), foe(4)]);
  F.playRound(b, STRONG);
  assert.deepEqual(b.enemies.map((e) => !!e.shaken), [false, true, false, false]);
  const c = fight('rout', [foe(1, 'hired', { hp: 1, marked: { by: 'wing', round: 0, payload: 'spotter' } }), foe(2), foe(3), foe(4)]);
  F.playRound(c, STRONG);
  assert.deepEqual(c.enemies.map((e) => !!e.shaken), [false, true, true, false]);
  const d = fight(null, [foe(1, 'hired', { hp: 1, shaken: { by: 'wing', round: 0, payload: 'rout' } }), foe(2), foe(3)]);
  F.playRound(d, STRONG);
  assert.ok(d.enemies[0].out && d.enemies.every((e) => e.n === 1 || !e.shaken), 'fear is the killer\'s piece, not carried');
});

test('the odds key reads every status (shown equals used)', () => {
  const b = fight('incendiary');
  const k0 = F.oddsKey(b);
  for (const st of F.STATUSES) {
    const c = structuredClone(b);
    c.enemies[0][st] = { by: 'jax', round: 0, payload: 'incendiary', tick: 10, left: 2 };
    assert.notEqual(F.oddsKey(c), k0, st);
  }
});

test('the save: v81 gives every enemy of a fight in progress none of the new statuses', async () => {
  const S = await import('../src/save/save.js');
  const s = createNewGame({ seed: 2, startCrew: 'fresh' });
  const b = F.buildFight({ type: 'holdYard', diff: 12, threat: 3, site: 'docks', crew: s.crew.slice(0, 3), approach: 'loud' }, makeRng(7));
  for (const e of b.enemies) for (const st of ['burning', 'marked', 'exposed', 'shaken']) delete e[st];
  s.activeMission = { jobId: 'x', templateId: 'warehouse', battle: b, events: [], queue: [], step: 0, log: [] };
  s.version = 80;
  const loaded = await S.importSave({ text: async () => JSON.stringify(s) });
  assert.equal(loaded.version, 81);
  for (const e of loaded.activeMission.battle.enemies) for (const st of ['burning', 'marked', 'exposed', 'shaken']) assert.equal(e[st], null, st);
});

test('the death rule holds with the new pieces: on cautious or steady nobody dies without a call-in (every draft payload, random orders)', () => {
  const crew0 = createNewGame({ seed: 3, startCrew: 'classic' }).crew.slice(0, 4);
  const duties = ['attack', 'protect', 'support', 'hold', 'push'];
  const ids = ['incendiary', 'spotter', 'breacher', 'rout'];
  for (const type of ['holdHack', 'holdExtract', 'holdYard']) for (const risk of ['cautious', 'steady']) for (let seed = 1; seed <= 24; seed++) {
    const rng = makeRng(seed * 41 + type.length);
    const crew = crew0.map((o, i) => ({ ...o, build: { move: i === 0 ? 'ricochet' : null, payload: ids[(seed + i) % ids.length] } }));
    const b = F.buildFight({ type, diff: 14, threat: 5, site: type === 'holdHack' ? 'heights' : 'docks', crew, approach: 'loud', risk }, rng);
    for (const r of b.runners) F.setOrder(b, r.id, { duty: duties[Math.floor(rng() * duties.length)], target: null, fallback: null });
    F.playFight(b, rng);
    assert.ok(!b.runners.some((r) => r.dead), `${type} seed ${seed}: a death on ${risk}`);
  }
});
