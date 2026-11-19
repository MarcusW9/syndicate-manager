// Enemy toughness, step 2 (DESIGN.md 2026-11-19, drafts/PROPOSAL-enemy-toughness.md part 3): a runner's armour is a flat soak,
// FIGHT.soakPerArmour (5; owner, 2026-11-19, after the sim showed 3 well under the old plates) HP off every enemy shot that lands per armour point, at least 1 through. No plates on a runner any more;
// a fight saved before v80 keeps its plates. Run with: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame } from '../src/core/state.js';
import { makeRng } from '../src/core/rng.js';
import * as F from '../src/core/fight.js';
import { FIGHT, ENEMIES } from '../src/data/fights.js';
import { roundView } from '../src/core/fightview.js';

const crewOf = (seed = 1) => createNewGame({ seed }).crew;
const kit = { armour: { uid: 'v', type: 'vest', tier: 'verified' }, implants: [{ uid: 'w', type: 'reflex', tier: 'custom', perks: ['weave'] }], bag: [] };
const foe = (n, kind = 'corp') => ({ n, kind, hp: ENEMIES[kind].hp, max: ENEMIES[kind].hp, absorb: ENEMIES[kind].absorb ?? 0, cover: ENEMIES[kind].cover, out: false, fled: false, deck: ['aim'], di: 0, approaching: false, group: 0, infected: null });
const R = (b, id) => b.runners.find((r) => r.id === id);

function oneShot(soak, hit, { absorb = 0 } = {}) {
  const crew = crewOf().filter((o) => ['wing', 'jax'].includes(o.id));
  const b = F.buildFight({ type: 'holdYard', diff: 14, threat: 3, site: 'docks', crew, approach: 'loud', risk: 'steady' }, makeRng(3));
  b.enemies = [foe(1)]; b.hiredTotal = {};
  const v = R(b, 'jax'); v.soak = soak; v.absorb = absorb; v.hp = v.max = 60;
  b.round = 1;
  b.threats = [{ id: '1.1', kind: 'aim', enemy: 1, target: 'jax', shieldedBy: null, cancelled: false, shown: 0.9, hit }];
  b.drawn = true;
  for (const r of b.runners) F.setOrder(b, r.id, { duty: 'hold', target: null, fallback: null });
  const res = F.playRound(b, () => 0); // every shot hits, every roll is the lowest
  return { b, v, res };
}

test('the soak is 5 HP an armour point; a vest of value 3 soaks 15', () => {
  assert.equal(FIGHT.soakPerArmour, 5);
  assert.deepEqual([0, 1, 2, 3].map(F.soakOf), [0, 5, 10, 15]);
  const [op] = crewOf().filter((o) => o.id === 'jax');
  op.gear = structuredClone(kit); // verified vest (2) + a weave (1)
  assert.equal(F.runnerOf(op, 'loud').soak, 15);
  assert.equal(F.runnerOf(op, 'loud').absorb, 0);
});

test('a value-3 vest (soak 15) lets 1 of a 10 shot through and 5 of a 20 shot; a value-1 vest takes 5 off either', () => {
  assert.equal(F.landsOn({ soak: 15 }, 10), 1);
  assert.equal(F.landsOn({ soak: 15 }, 20), 5);
  assert.equal(F.landsOn({ soak: 5 }, 10), 5);
  let { v, res } = oneShot(15, 10);
  assert.equal(v.hp, 59);
  assert.ok(res.lines.some((l) => l.key === 'shotHit' && l.damage === 1 && l.soaked === 9));
  ({ v } = oneShot(15, 20));
  assert.equal(v.hp, 55);
});

test('the soak never takes a landing shot below 1', () => {
  for (const soak of [3, 9, 30, 300]) for (const hit of [1, 5, 10, 20]) assert.ok(F.landsOn({ soak }, hit) >= FIGHT.soakMin);
  assert.equal(oneShot(300, 10).v.hp, 59);
});

test('an unarmoured runner takes the whole shot, as before', () => {
  assert.equal(F.landsOn({ soak: 0 }, 17), 17);
  assert.equal(F.landsOn({}, 17), 17);
  const { v, res } = oneShot(0, 20);
  assert.equal(v.hp, 40);
  assert.ok(res.lines.some((l) => l.key === 'shotHit' && l.damage === 20 && l.soaked === undefined));
});

test('shown equals used: the threat line and the runner\'s shots carry the HP after the soak', () => {
  const crew = crewOf().filter((o) => ['wing', 'jax'].includes(o.id));
  const b = F.buildFight({ type: 'holdYard', diff: 14, threat: 3, site: 'docks', crew, approach: 'loud', risk: 'steady' }, makeRng(3));
  b.enemies = [foe(1)]; b.hiredTotal = {}; R(b, 'jax').soak = 6; b.round = 1;
  b.threats = [{ id: '1.1', kind: 'aim', enemy: 1, target: 'jax', shieldedBy: null, cancelled: false, shown: 0.5, hit: 20 }];
  b.drawn = true;
  const view = roundView(b);
  const t = view.enemies[0].threats[0];
  assert.equal(t.hit, 14);
  assert.match(t.text, /14/);
  assert.equal(view.runners.find((r) => r.id === 'jax').shots[0].hp, 14);
  assert.equal(F.previewRound(b).exposure[0].lands, 14);
});

test('the odds key tells a soaked crew from a bare one', () => {
  const crew = crewOf().filter((o) => ['wing', 'jax'].includes(o.id));
  const b = F.buildFight({ type: 'holdYard', diff: 14, threat: 3, site: 'docks', crew, approach: 'loud' }, makeRng(3));
  const c = structuredClone(b); c.runners[0].soak = 3;
  assert.notEqual(F.oddsKey(b), F.oddsKey(c));
});

test('a fight saved before v80 keeps its plates: a plate stops a whole shot, and the save gives soak 0', async () => {
  const { v, res } = oneShot(0, 20, { absorb: 1 });
  assert.equal(v.hp, 60); assert.equal(v.absorb, 0);
  assert.ok(res.lines.some((l) => l.key === 'shotAbsorbed'));
  const S = await import('../src/save/save.js');
  const s = createNewGame({ seed: 2, startCrew: 'fresh' });
  const b = F.buildFight({ type: 'holdYard', diff: 12, threat: 3, site: 'docks', crew: s.crew.slice(0, 3), approach: 'loud' }, makeRng(7));
  for (const r of b.runners) { delete r.soak; r.absorb = 2; }
  s.activeMission = { jobId: 'x', templateId: 'warehouse', battle: b, events: [], queue: [], step: 0, log: [] };
  s.version = 79;
  const loaded = await S.importSave({ text: async () => JSON.stringify(s) });
  for (const r of loaded.activeMission.battle.runners) { assert.equal(r.soak, 0); assert.equal(r.absorb, 2); }
});

test('an armoured crew on cautious or steady still loses nobody without a call-in (threat 5, random orders)', () => {
  const duties = ['attack', 'protect', 'support', 'hold', 'push'];
  for (const type of ['holdHack', 'holdExtract']) for (const risk of ['cautious', 'steady']) for (let seed = 1; seed <= 60; seed++) {
    const rng = makeRng(seed * 37 + (type === 'holdHack' ? 1 : 2));
    const crew = crewOf(seed);
    crew.forEach((o, i) => { o.gear = { ...(o.gear ?? {}), armour: { uid: `v${i}`, type: 'vest', tier: i % 2 ? 'verified' : 'standard' } }; });
    const b = F.buildFight({ type, diff: 14, threat: 5, site: type === 'holdHack' ? 'heights' : 'docks', crew, approach: 'loud', risk, wheels: { id: 'teo', handle: 'Wheels', value: 17 } }, rng);
    assert.ok(b.runners.every((r) => r.soak >= FIGHT.soakPerArmour));
    for (const r of b.runners) F.setOrder(b, r.id, { duty: duties[Math.floor(rng() * duties.length)], target: null, fallback: null });
    F.playFight(b, rng);
    assert.ok(!b.runners.some((r) => r.dead), `${type} seed ${seed}: a death on ${risk}`);
  }
});
