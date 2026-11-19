// Enemy toughness, step 1 (DESIGN.md 2026-11-18, drafts/PROPOSAL-enemy-toughness.md): threat 1-3 enemies are as before, threat 4 is
// +5 HP, threat 5 is +5 HP; arrivals match; a fight saved before has toughness 0. Run with: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame } from '../src/core/state.js';
import { makeRng } from '../src/core/rng.js';
import * as F from '../src/core/fight.js';
import { ENEMIES } from '../src/data/fights.js';

const crew = () => createNewGame({ seed: 4, startCrew: 'fresh' }).crew.slice(0, 3);
const build = (threat, site = 'docks', opposition = null) => F.buildFight({ type: 'holdYard', diff: 12, threat, site, opposition, crew: crew(), approach: 'loud' }, makeRng(7));

test('threat 1-3 enemies are exactly the kinds as defined', () => {
  for (const threat of [1, 2, 3]) for (const site of ['docks', 'heights']) for (const e of build(threat, site).enemies) {
    assert.equal(e.max, ENEMIES[e.kind].hp); assert.equal(e.absorb, ENEMIES[e.kind].absorb ?? 0);
  }
});

test('threat 4 is +5 HP, threat 5 is +5 HP (no plate yet), on every body', () => {
  for (const site of ['docks', 'heights']) for (const opp of [null, 'police']) {
    for (const e of build(4, site, opp).enemies) { assert.equal(e.max, ENEMIES[e.kind].hp + 5); assert.equal(e.hp, e.max); assert.equal(e.absorb, ENEMIES[e.kind].absorb ?? 0); }
    for (const e of build(5, site, opp).enemies) { assert.equal(e.max, ENEMIES[e.kind].hp + 5); assert.equal(e.absorb, ENEMIES[e.kind].absorb ?? 0); }
  }
});

test('a threat-5 fight\'s later arrivals are as tough as its first bodies', () => {
  const b = build(5);
  const e = F.newEnemy(b, 'hired', makeRng(1), { arriving: true, group: 1 });
  assert.equal(e.max, ENEMIES.hired.hp + 5); assert.equal(e.absorb, 0);
});

test('the odds key tells a tougher fight from a plain one', () => {
  assert.notEqual(F.oddsKey(build(3)), F.oddsKey(build(5)));
});

test('a step at or past plateAtStep adds a plate to a body (the hook for later steps)', () => {
  const b = build(3); b.toughness = 3;
  const e = F.newEnemy(b, 'hired', makeRng(1));
  assert.equal(e.max, ENEMIES.hired.hp + 15); assert.equal(e.absorb, 1);
});

test('save v79 gives a fight in progress toughness 0', async () => {
  const S = await import('../src/save/save.js');
  const s = createNewGame({ seed: 2, startCrew: 'fresh' });
  const b = build(5); delete b.toughness;
  s.activeMission = { jobId: 'x', templateId: 'warehouse', battle: b, events: [], queue: [], step: 0, log: [] };
  s.version = 78;
  const loaded = await S.importSave({ text: async () => JSON.stringify(s) });
  assert.equal(loaded.activeMission.battle.toughness, 0);
});
