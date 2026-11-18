// A weapon sets how hard its hit lands (DESIGN.md 2026-11-18, drafts/PROPOSAL-gear-hit-size.md): hitOf(damage), a strong hit
// strongMult times it (counting from damage 2, unarmed), a plate takes plateHp off one hit and the rest goes through, the wobble scales with the hit, and a
// starting runner (damage 2) fights exactly as before. Run with: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame } from '../src/core/state.js';
import { makeRng } from '../src/core/rng.js';
import * as F from '../src/core/fight.js';
import { FIGHT } from '../src/data/fights.js';
import { weaponOf } from '../src/core/battle.js';

const fixed = (v) => () => v; // an rng that always returns v: 0.5 is no wobble

test('hit size by damage: 10 up to damage 2 (unarmed), then 3 more a point', () => {
  assert.deepEqual([1, 2, 3, 4, 5, 6, 7, 8].map(F.hitOf), [10, 10, 13, 16, 19, 22, 25, 28]);
});

test('every starting runner hits for the base 10 on the one margin', () => {
  for (let seed = 1; seed <= 30; seed++) for (const op of createNewGame({ seed, startCrew: 'fresh' }).crew) {
    const r = F.runnerOf(op, 'loud');
    assert.equal(r.hit, FIGHT.hit, `seed ${seed} ${op.handle}: damage ${weaponOf(op).damage}`);
    assert.equal(r.strong, 12);
  }
});

test('a plate takes plateHp off one hit and the rest goes through; a base plain hit only cracks it; piercing skips it', () => {
  const body = (hp, absorb) => ({ hp, absorb });
  let e = body(10, 1);
  assert.deepEqual(F.landHit(e, 10, false, false, fixed(0.5)), { dmg: 0, cracked: true });
  assert.deepEqual([e.hp, e.absorb], [10, 0], 'cracked, untouched');
  e = body(10, 1);
  assert.deepEqual(F.landHit(e, 22, false, false, fixed(0.5)), { dmg: 12, cracked: true });
  assert.ok(e.hp <= 0, 'a 22 HP plain hit (damage 6) drops a plated grunt in one');
  e = body(20, 2);
  F.landHit(e, 16, false, false, fixed(0.5));
  assert.deepEqual([e.hp, e.absorb], [14, 1], 'one plate a hit, however big the hit');
  e = body(10, 1);
  assert.deepEqual(F.landHit(e, 10, false, true, fixed(0.5)), { dmg: 10, cracked: false });
  assert.equal(e.absorb, 1, 'piercing leaves the plate');
  e = body(30, 0);
  assert.deepEqual(F.landHit(e, 13, true, false, fixed(0.5)), { dmg: 26, cracked: false }, 'strong is double');
});

test('the wobble scales with the hit and never pushes a hit that got through below 1', () => {
  const span = (hit, strong = false) => {
    const seen = new Set();
    for (let i = 0; i < 400; i++) seen.add(F.landHit({ hp: 100, absorb: 0 }, hit, strong, false, makeRng(i)).dmg);
    return [Math.min(...seen), Math.max(...seen)];
  };
  assert.deepEqual(span(10), [8, 12]);
  assert.deepEqual(span(19), [16, 22]);
  assert.deepEqual(span(10, true), [17, 23]);
  for (let i = 0; i < 200; i++) assert.ok(F.landHit({ hp: 100, absorb: 1 }, 13, false, false, makeRng(i)).dmg >= 1);
});

test('the planning read counts a big hit as more than one: a damage-6 runner alone covers a plated grunt', () => {
  const crew = createNewGame({ seed: 4, startCrew: 'fresh' }).crew.slice(0, 2);
  const b = F.buildFight({ type: 'holdYard', diff: 10, threat: 2, site: 'docks', crew, approach: 'loud' }, makeRng(5));
  const acts = (hit) => {
    const c = structuredClone(b);
    c.enemies = c.enemies.slice(0, 1).map((e) => ({ ...e, hp: 10, max: 10, absorb: 1, out: false, fled: false }));
    for (const r of c.runners) r.hit = hit;
    for (const r of c.runners) c.orders[r.id] = { ...(c.orders[r.id] ?? {}), duty: 'attack', target: null, stance: 'normal' };
    return F.resolveOrders(c).actions.filter((a) => a.kind === 'attack').length;
  };
  assert.equal(acts(10), 2, 'two base hits: one cracks, one drops');
  assert.equal(acts(22), 1, 'one 22 HP hit covers it; the second runner looks elsewhere');
});

test('save v78 gives a fight in progress each runner\'s hit and the one margin', async () => {
  const S = await import('../src/save/save.js');
  const s = createNewGame({ seed: 2, startCrew: 'fresh' });
  const op = s.crew[0];
  op.gear = { weapon: { uid: 'p1', type: 'pistol', tier: 'verified', look: { frame: 'cannon' } }, implants: [], bag: [] };
  const b = F.buildFight({ type: 'holdYard', diff: 10, threat: 2, site: 'docks', crew: s.crew.slice(0, 2), approach: 'loud' }, makeRng(5));
  for (const r of b.runners) { delete r.hit; r.strong = 6; }
  b.runners[1].id = 'gone';
  s.activeMission = { jobId: 'x', templateId: 'warehouse', battle: b, events: [], queue: [], step: 0, log: [] };
  s.version = 77;
  const loaded = await S.importSave({ text: async () => JSON.stringify(s) });
  assert.equal(F.hitOf(weaponOf(op).damage), 22, 'a Verified cannon: damage 6');
  assert.deepEqual(loaded.activeMission.battle.runners.map((r) => [r.hit, r.strong]), [[22, 12], [10, 12]]);
});

test('the hit is shown from hitOf: on the weapon card and under each runner on the round screen', async () => {
  const { itemEffect } = await import('../src/ui/gear.js');
  const { roundView } = await import('../src/core/fightview.js');
  const card = itemEffect({ uid: 'p', type: 'pistol', tier: 'verified', look: { frame: 'cannon' } });
  assert.ok(card.includes('hits for 22, strong 44'), card);
  const s = createNewGame({ seed: 2, startCrew: 'fresh' });
  const b = F.buildFight({ type: 'holdYard', diff: 10, threat: 2, site: 'docks', crew: s.crew.slice(0, 2), approach: 'loud' }, makeRng(5));
  b.runners[0].hit = 16;
  const r = roundView(b).runners[0];
  assert.deepEqual([r.hit, r.strongHit, r.hitLine], [16, 32, 'Hits for 16, strong 32']);
});
