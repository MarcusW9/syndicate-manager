// Career marks (core/marks.js): what the job leaves on a face, and that the face shows only
// what the game recorded. DESIGN.md, 2026-10-28.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame, SAVE_VERSION } from '../src/core/state.js';
import { noteScar, noteJobMarks, marksText, TATTOO_JOBS } from '../src/core/marks.js';
import { noteInjury } from '../src/core/earned.js';
import { portrait, faceOf } from '../src/ui/art.js';

const withoutIds = (svg) => svg.replace(/pf\d+/g, 'pf');
const game = () => createNewGame({ seed: 77 });
const kinds = (op, kind) => op.marks.filter((m) => m.kind === kind).length;

test('everyone starts without marks', () => {
  for (const op of game().crew) assert.deepEqual(op.marks, []);
});

test('a serious or critical wound leaves a scar, one a day, at most three; light ones heal clean', () => {
  const s = game();
  const op = s.crew[0];
  noteInjury(s, op, 'light');
  assert.equal(kinds(op, 'scar'), 0, 'a light wound leaves nothing');
  noteInjury(s, op, 'serious');
  assert.equal(kinds(op, 'scar'), 1);
  assert.ok(op.history.some((h) => /scarred \(a serious wound\)/.test(h)), 'and says so in their history');
  noteInjury(s, op, 'critical');
  assert.equal(kinds(op, 'scar'), 1, 'one bad day, one scar');
  for (let d = 0; d < 5; d++) { s.day += 1; noteScar(s, op, 'critical'); }
  assert.equal(kinds(op, 'scar'), 3, 'three at most');
});

test('freelancers are not marked by the crew', () => {
  const s = game();
  const op = { ...s.crew[0], freelance: true, marks: [], history: [] };
  noteScar(s, op, 'critical');
  noteJobMarks(s, { ...op, jobsWithCrew: 20, condition: { ...op.condition, neuralLoad: 90 } });
  assert.deepEqual(op.marks, []);
});

test('chrome is added when a job ends in the danger zone (twice at most); the crew mark comes at ten jobs, once', () => {
  const s = game();
  const op = s.crew[1];
  op.condition.neuralLoad = 70;
  noteJobMarks(s, op);
  assert.equal(kinds(op, 'implant'), 0, '70 is the line, not over it');
  op.condition.neuralLoad = 85;
  for (let i = 0; i < 4; i++) noteJobMarks(s, op);
  assert.equal(kinds(op, 'implant'), 2);
  op.jobsWithCrew = TATTOO_JOBS - 1;
  noteJobMarks(s, op);
  assert.equal(kinds(op, 'tattoo'), 0);
  op.jobsWithCrew = TATTOO_JOBS;
  noteJobMarks(s, op);
  noteJobMarks(s, op);
  assert.equal(kinds(op, 'tattoo'), 1);
  assert.equal(marksText(op), "two lots of extra chrome, the crew's mark", 'the profile says what the face shows');
});

test('the face shows marks only when the game recorded them, the same every time', () => {
  const op = game().crew.find((o) => faceOf(o).mask !== 'faceplate');
  const bare = withoutIds(portrait(op));
  assert.equal(withoutIds(portrait({ ...op, marks: [] })), bare);
  for (const kind of ['scar', 'implant', 'tattoo']) {
    const marked = { ...op, marks: [{ kind, day: 1 }] };
    assert.notEqual(withoutIds(portrait(marked)), bare, `a ${kind} shows`);
    assert.equal(withoutIds(portrait(marked)), withoutIds(portrait({ ...marked })), `a ${kind} never moves`);
  }
});

test('a v23 save upgrades to v24: no marks yet, but veterans get the crew mark with a line saying so', async () => {
  globalThis.localStorage ??= { getItem: () => null, setItem: () => {}, removeItem: () => {} };
  const { importSave } = await import('../src/save/save.js');
  const v23 = createNewGame({ seed: 78 });
  v23.version = 23;
  for (const op of v23.crew) delete op.marks;
  v23.crew[0].jobsWithCrew = 12;
  v23.memorial = [{ id: 'x', name: 'Old Hand', handle: 'Old', role: 'driver', age: 40, day: 3, cause: 'Died of wounds' }];
  const loaded = await importSave({ text: async () => JSON.stringify(v23) });
  assert.equal(loaded.version, SAVE_VERSION);
  assert.equal(loaded.crew[0].marks.filter((m) => m.kind === 'tattoo').length, 1);
  assert.match(loaded.crew[0].history.at(-1), /crew's mark/);
  for (const op of loaded.crew.slice(1)) assert.deepEqual(op.marks, []);
  assert.deepEqual(loaded.memorial[0].marks, []);
});
