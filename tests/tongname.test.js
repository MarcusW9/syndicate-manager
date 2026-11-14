import test from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame, chooseFounders, SAVE_VERSION } from '../src/core/state.js';
import { cleanTongName, setTongName, tongNameOf, tongNameProblem, TONG_NAME_MAX } from '../src/core/tongname.js';
import { importSave } from '../src/save/save.js';
import { NAMES } from '../src/config/names.js';

test('a new game starts with the default name', () => {
  assert.equal(tongNameOf(createNewGame({ startCrew: 'pick' })), NAMES.defaultTong);
});

test('the founder pick can name the tong; a bad name falls back to the default', () => {
  const g = createNewGame({ startCrew: 'pick' });
  const ids = g.founding.candidates.slice(0, 3).map((c) => c.id);
  assert.equal(chooseFounders(g, ids, '  Paper   Lanterns ').tongName, 'Paper Lanterns');
  assert.equal(chooseFounders(g, ids, '').tongName, NAMES.defaultTong);
});

test('names are tidied, capped, and cannot be empty or a rival tong\'s', () => {
  assert.equal(cleanTongName('<b>Big</b>  Fish!'), 'bBigb Fish');
  assert.equal(cleanTongName('x'.repeat(60)).length, TONG_NAME_MAX);
  const g = createNewGame({ startCrew: 'classic' });
  assert.ok(tongNameProblem(g, '   '));
  const rival = g.rivals.tongs[0].name;
  assert.ok(tongNameProblem(g, rival.toUpperCase()));
  assert.equal(setTongName(g, rival), g);
  assert.equal(setTongName(g, 'Night Owls').tongName, 'Night Owls');
});

test('a v63 save upgrades to v64 with the default name', async () => {
  const old = JSON.parse(JSON.stringify(createNewGame({ startCrew: 'classic' }))); old.version = 63; delete old.tongName;
  const up = await importSave({ text: async () => JSON.stringify(old) });
  assert.equal(up.version, SAVE_VERSION);
  assert.equal(up.tongName, NAMES.defaultTong);
});
