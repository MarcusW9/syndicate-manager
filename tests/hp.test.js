// Engine 2 in HP (DESIGN.md 2026-11-18): every amount is the old pip count x FIGHT.hpUnit, so the rules play exactly as they did, and a
// fight saved in pips upgrades to the same fight in HP. Run with: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame } from '../src/core/state.js';
import { makeRng } from '../src/core/rng.js';
import * as F from '../src/core/fight.js';
import { FIGHT, ENEMIES, ENEMY_HIT } from '../src/data/fights.js';
import { PAYLOADS } from '../src/data/builds.js';

const U = FIGHT.hpUnit;
const crewOf = () => createNewGame({ seed: 1 }).crew;

test('every HP amount is a whole number of hpUnits, so the old pip rules hold exactly', () => {
  assert.equal(U, 10);
  for (const [k, e] of Object.entries(ENEMIES)) assert.equal(e.hp % U, 0, k);
  for (const [k, h] of Object.entries(ENEMY_HIT)) assert.equal(h % U, 0, k);
  for (const k of ['hit', 'strongHit', 'plateHp', 'patchHeal', 'wayOutTreatHeal', 'minHp', 'lightWoundHp']) assert.equal(FIGHT[k] % U, 0, k);
  assert.equal(FIGHT.medicAura.heal % U, 0);
  assert.equal(FIGHT.risk.steady.minHp % U, 0);
  for (const p of Object.values(PAYLOADS)) assert.equal(p.dot.tick % U, 0, p.id);
  assert.equal(FIGHT.plateHp, FIGHT.hit, 'a plate takes one plain hit, as it did');
});

test('pull-out points round up to a whole hpUnit, as the pip points rounded up to a whole pip', () => {
  const b = F.buildFight({ type: 'holdHack', diff: 14, threat: 3, site: 'heights', crew: crewOf().slice(0, 2), approach: 'loud' }, makeRng(3));
  const r = b.runners[0];
  for (const pips of [3, 4, 5, 7, 11]) {
    r.max = pips * U;
    b.risk.level = 'cautious'; assert.equal(F.riskThreshold(b, r), Math.ceil(pips / 2) * U);
    b.risk.level = 'steady'; assert.equal(F.riskThreshold(b, r), Math.max(1, Math.ceil(pips / 3)) * U);
  }
});

test('the screens still read whole segments: hpUnits rounds up and never goes below 0', () => {
  assert.deepEqual([-5, 0, 1, 10, 11, 20].map(F.hpUnits), [0, 0, 1, 1, 2, 2]);
});

test('the save: a v76 fight in progress, in pips, upgrades to the same fight in HP', async () => {
  const S = await import('../src/save/save.js');
  const { SAVE_VERSION } = await import('../src/core/state.js');
  const fresh = F.buildFight({ type: 'holdHack', diff: 14, threat: 3, site: 'heights', crew: crewOf().slice(0, 3), approach: 'loud', risk: 'steady' }, makeRng(3));
  F.startRound(fresh, makeRng(4));
  fresh.enemies[0].infected = { tick: 10, left: null, by: fresh.runners[0].id, round: 1, payload: 'cytotoxic' };
  fresh.runners[1].hp = 20; F.keepIn(fresh, [fresh.runners[1].id]);
  fresh.hpLost = 30;
  fresh.dilemmasFired = { [`pullOutPoint:${fresh.runners[1].id}:20`]: true, techUnderFire: true };
  // The same fight as a v76 save held it: pips.
  const old = JSON.parse(JSON.stringify(fresh));
  for (const x of [...old.runners, ...old.enemies]) { x.pips = x.hp / U; delete x.hp; x.max /= U; if (x.stayHp != null) { x.stayPips = x.stayHp / U; delete x.stayHp; } if (x.infected) x.infected.tick /= U; }
  old.pipsLost = old.hpLost / U; delete old.hpLost;
  for (const t of old.threats) t.hit /= U;
  old.dilemmasFired = { [`pullOutPoint:${fresh.runners[1].id}:2`]: true, techUnderFire: true };
  const s = createNewGame({ seed: 5 });
  s.activeMission = { jobId: 'x', templateId: 'data_pull', battle: old, events: [], queue: [], step: 0, log: [] };
  s.version = 76;
  const loaded = await S.importSave({ text: async () => JSON.stringify(s) });
  assert.equal(loaded.version, SAVE_VERSION);
  assert.deepEqual(loaded.activeMission.battle, JSON.parse(JSON.stringify(fresh)));
  // And it plays on as the fresh one does.
  const a = loaded.activeMission.battle; const b = structuredClone(fresh);
  F.playRound(a, makeRng(9)); F.playRound(b, makeRng(9));
  assert.deepEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)));
});

test('the save: a fight already in HP is left alone', async () => {
  const S = await import('../src/save/save.js');
  const fresh = F.buildFight({ type: 'holdYard', diff: 12, threat: 2, site: 'docks', crew: crewOf().slice(0, 3), approach: 'loud' }, makeRng(3));
  const s = createNewGame({ seed: 5 });
  s.activeMission = { jobId: 'x', templateId: 'protection', battle: JSON.parse(JSON.stringify(fresh)), events: [], queue: [], step: 0, log: [] };
  s.version = 76;
  const loaded = await S.importSave({ text: async () => JSON.stringify(s) });
  assert.deepEqual(loaded.activeMission.battle, JSON.parse(JSON.stringify(fresh)));
});

test('the display: the screens get the HP itself beside the segments, and the stage gets the damage and healing as numbers', async () => {
  const { feedLine } = await import('../src/core/runfight.js');
  const { roundView } = await import('../src/core/fightview.js');
  const hit = feedLine({ kind: 'attack', key: 'attackHit', enemy: 1, actor: 'jax', success: true, damage: 20, left: 0, max: 20 });
  assert.equal(hit.damage, 2, 'segments for the bar, as before');
  assert.equal(hit.hpDamage, 20, 'and the HP for the number');
  const heal = feedLine({ kind: 'aura', key: 'aura', actor: 'mei', targetId: 'jax', left: 40, max: 60, heal: 10 });
  assert.equal(heal.hpHeal, 10);
  assert.equal(feedLine({ kind: 'attack', key: 'attackMiss', enemy: 1, actor: 'jax', success: false, damage: 0 }).hpDamage, undefined, 'a miss carries no number');
  const b = F.buildFight({ type: 'holdYard', diff: 12, threat: 2, site: 'docks', crew: crewOf().slice(0, 3), approach: 'loud' }, makeRng(3));
  F.startRound(b, makeRng(4));
  b.runners[0].hp -= 20;
  const v = roundView(b);
  for (const r of v.runners) { const x = b.runners.find((y) => y.id === r.id); assert.equal(r.hp, x.hp); assert.equal(r.maxHp, x.max); assert.equal(r.pips, F.hpUnits(x.hp)); }
  for (const e of v.enemies) { const x = b.enemies.find((y) => y.n === e.n); assert.equal(e.hp, x.hp); assert.equal(e.maxHp, x.max); }
});
