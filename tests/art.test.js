// Portraits: drawn from stable features, so a face never changes, and the wall shows
// the same face the crew knew. Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame, SAVE_VERSION } from '../src/core/state.js';
import { faceOf, portrait, cultureOf, stateOf } from '../src/ui/art.js';

const crew = () => createNewGame({ seed: 50, startCrew: 'fresh' }).crew;
const withoutIds = (svg) => svg.replace(/pf\d+/g, 'pf');

test('a face never changes between renders or games', () => {
  const [a] = crew();
  const [b] = crew();
  assert.deepEqual(faceOf(a), faceOf(b));
  assert.equal(withoutIds(portrait(a)), withoutIds(portrait(b)));
});

test('the wall shows the face they had in life', () => {
  for (const op of crew()) {
    op.age = 52; // old enough for grey hair to be possible
    const entry = { id: op.id, name: op.name, handle: op.handle, role: op.role, color: op.color, age: op.age, day: 9, cause: 'Died of wounds' };
    assert.deepEqual(faceOf(entry), faceOf(op));
  }
});

test('culture comes from the surname, including two-word surnames', () => {
  assert.equal(cultureOf('Paolo dela Cruz'), 'filipino');
  assert.equal(cultureOf('Kelvin Chan'), 'hk');
  assert.equal(cultureOf('Nobody'), null);
});

test('a v13 save upgrades to v14', async () => {
  globalThis.localStorage ??= { getItem: () => null, setItem: () => {}, removeItem: () => {} };
  const { importSave } = await import('../src/save/save.js');
  const v13 = createNewGame({ seed: 51 });
  v13.version = 13;
  v13.memorial = [{ id: 'x', name: 'Old Hand', handle: 'Old', role: 'driver', day: 3, cause: 'Died of wounds' }];
  const loaded = await importSave({ text: async () => JSON.stringify(v13) });
  assert.equal(loaded.version, SAVE_VERSION);
  assert.ok(portrait(loaded.memorial[0]).startsWith('<svg'), 'an entry without age still draws');
});

test('expressions follow condition, never chance', () => {
  const op = crew()[0];
  const at = (c) => stateOf({ ...op, condition: { ...op.condition, ...c } }).expression;
  assert.equal(at({ morale: 65, neuralLoad: 0, burnout: 0 }), 'neutral');
  assert.equal(at({ morale: 85 }), 'smirk');
  assert.equal(at({ morale: 25 }), 'stressed');
  assert.equal(at({ neuralLoad: 71 }), 'dead', "neural load's danger zone, as the game warns");
  assert.equal(at({ neuralLoad: 70, morale: 65 }), 'neutral');
  assert.equal(at({ burnout: 60, morale: 85 }), 'dead', 'burnout wins over a good mood');
});

test('a visor never hides a cyber-eye lens', () => {
  for (let seed = 1; seed < 200; seed++) {
    for (const op of createNewGame({ seed, startCrew: 'fresh' }).crew) {
      const f = faceOf(op);
      assert.ok(!(f.visor && f.chrome === 'cybereye'));
    }
  }
});
