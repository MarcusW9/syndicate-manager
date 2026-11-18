// The runner's abilities in one list (core/abilities.js; drafts/PROPOSAL-runner-shaping.md step 1). Run with: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame } from '../src/core/state.js';
import { abilitiesOf, missingFor } from '../src/core/abilities.js';
import { eligiblePieces } from '../src/core/builds.js';
import { SPECIALISATIONS } from '../src/data/specialisations.js';

const runner = (o = {}) => ({ ...createNewGame({ seed: 1 }).crew[0], earned: [], spec: null, build: null, ...o });

test('missingFor lists only the stats short of the gate', () => {
  const op = runner({ stats: { combat: 9, cool: 12, medical: 8 } });
  assert.deepEqual(missingFor(op, { combat: 10, cool: 8 }), [{ stat: 'combat', need: 10, have: 9 }]);
  assert.deepEqual(missingFor(op, { medical: 8 }), []);
  assert.deepEqual(missingFor(op, undefined), []);
});

test('held gathers born traits, earned traits, the specialisation and the build', () => {
  const op = runner({ traits: ['hothead'], earned: [{ id: 'clinic_hands', day: 3 }], spec: { id: 'marksman', day: 9 }, build: { move: 'ricochet', payload: null } });
  const kinds = abilitiesOf(op).held.map((h) => `${h.kind}:${h.id}`);
  assert.deepEqual(kinds, ['born:hothead', 'earned:clinic_hands', 'spec:marksman', 'move:ricochet']);
});

test('reachable covers open places only: no specialisation once they have one, no piece for a filled slot', () => {
  const none = abilitiesOf(runner());
  assert.ok(none.reachable.some((r) => r.kind === 'spec'));
  assert.ok(none.reachable.some((r) => r.kind === 'move'));
  const full = abilitiesOf(runner({ spec: { id: 'droneJockey', day: 1 }, build: { move: 'ricochet', payload: 'cytotoxic' } }));
  assert.deepEqual(full.reachable, []);
});

test('earned traits never show as reachable: their progress stays hidden', () => {
  assert.ok(abilitiesOf(runner()).reachable.every((r) => r.kind !== 'earned'));
});

test('a piece with its gate met is one Joss could offer, and the read agrees with the offers', () => {
  for (const stats of [{ combat: 9, medical: 7 }, { combat: 12, medical: 8 }, { combat: 15, medical: 14, piloting: 10 }]) {
    const op = runner({ stats: { ...runner().stats, ...stats } });
    const met = abilitiesOf(op).reachable.filter((r) => (r.kind === 'move' || r.kind === 'payload') && !r.missing.length).map((r) => r.id).sort();
    assert.deepEqual(met, eligiblePieces(op).map((p) => p.id).sort());
  }
});

test('a specialisation shows its stat gate', () => {
  const op = runner({ stats: { ...runner().stats, piloting: 7 } });
  const dj = abilitiesOf(op).reachable.find((r) => r.id === 'droneJockey');
  assert.deepEqual(dj.needs, SPECIALISATIONS.droneJockey.needs);
  assert.deepEqual(dj.missing, [{ stat: 'piloting', need: 10, have: 7 }]);
});

test('the read changes nothing', () => {
  const op = runner({ traits: ['loyal'], build: { move: 'ricochet', payload: null } });
  const before = structuredClone(op);
  abilitiesOf(op);
  assert.deepEqual(op, before);
});
