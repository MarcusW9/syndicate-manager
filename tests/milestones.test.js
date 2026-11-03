// Milestones and highlights (renown slice 2, 2026-11). Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame, SAVE_VERSION } from '../src/core/state.js';
import * as M from '../src/core/mission.js';
import { addOffer } from '../src/core/jobs.js';
import { freshRecord } from '../src/core/record.js';
import { checkMilestones, addHighlight, seedMilestones } from '../src/core/milestones.js';
import { MILESTONES, MILESTONES_PER_JOB, HIGHLIGHTS_KEPT } from '../src/data/milestones.js';
import { playMission, carefulPolicy } from './play.js';

globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
const { importSave } = await import('../src/save/save.js');

const game = (seed = 1) => createNewGame({ seed, startCrew: 'fresh' });
const rec = (extra) => ({ ...freshRecord(), ...extra });

test('content: ids are unique, ranks and weights sane, only known tags, no stray braces', () => {
  const ids = MILESTONES.map((m) => m.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const m of MILESTONES) {
    assert.ok(m.rank >= 2 && m.rank <= 6 && m.weight > 0 && m.at > 0, m.id);
    for (const tag of m.text.match(/\{\w+\}/g) ?? []) assert.ok(['{op}', '{other}', '{n}'].includes(tag), `${m.id}: ${tag}`);
    if (m.field === 'with') assert.match(m.text, /\{other\}/, m.id);
    else assert.doesNotMatch(m.text, /\{other\}/, m.id);
  }
});

test('one milestone per runner per job, in priority order (firsts before counts)', () => {
  const s = game(2); const [a] = s.crew;
  a.record = rec({ jobs: 10, atLevel: 10, clean: 10, jobs10: 0 });
  const lines = checkMilestones(s, [a]);
  assert.equal(lines.length, 1);
  assert.equal(lines[0].id, 'firstAtLevel'); // a first outranks the ten-job count
  assert.ok(a.record.milestones.includes('firstAtLevel'));
  assert.ok(a.history.some((h) => h.includes('first') || h.includes('level')));
});

test('at most two milestones a job; the rest wait for the next', () => {
  const s = game(3); const [a, b, c] = s.crew;
  for (const o of [a, b, c]) o.record = rec({ atLevel: 1 });
  const lines = checkMilestones(s, [a, b, c]);
  assert.equal(lines.length, MILESTONES_PER_JOB);
  const next = checkMilestones(s, [a, b, c]);
  assert.equal(next.length, 1); // the third runner's first arrives on the next job
  assert.notEqual(next[0].opId, lines[0].opId);
});

test('a milestone is only ever given once', () => {
  const s = game(4); const [a] = s.crew; a.record = rec({ atLevel: 1 });
  assert.equal(checkMilestones(s, [a]).length, 1);
  assert.equal(checkMilestones(s, [a]).length, 0);
});

test('a bond counts for both people and once against the cap', () => {
  const s = game(5); const [a, b, c] = s.crew;
  a.record = rec({ with: { [b.id]: 10 } }); b.record = rec({ with: { [a.id]: 10 } }); c.record = rec();
  const lines = checkMilestones(s, [a, b, c]);
  assert.equal(lines.length, 1);
  assert.match(lines[0].text, new RegExp(`${a.handle}.*${b.handle}`));
  assert.ok(a.record.milestones.includes(`bond10:${b.id}`) && b.record.milestones.includes(`bond10:${a.id}`));
  assert.equal(checkMilestones(s, [a, b, c]).length, 0);
});

test("jobs10 is skipped when the crew's mark lands on the same job", () => {
  const s = game(6); const [a] = s.crew;
  a.record = rec({ jobs: 10, atLevel: 0 });
  a.marks = [{ kind: 'tattoo', day: s.day }];
  assert.equal(checkMilestones(s, [a]).length, 0);
  assert.ok(a.record.milestones.includes('jobs10')); // marked as given so it never turns up late
});

test('freelancers and people without a record get nothing', () => {
  const s = game(7); const [a, b] = s.crew;
  a.freelance = true; a.record = rec({ atLevel: 1 }); delete b.record;
  assert.deepEqual(checkMilestones(s, [a, b]), []);
});

test('highlights keep the heaviest three; a lighter one never replaces a heavier', () => {
  const r = rec();
  for (const [id, weight] of [['a', 15], ['b', 60], ['c', 30], ['d', 45], ['e', 10]]) addHighlight(r, { id, day: 1, text: id, weight });
  assert.equal(r.highlights.length, HIGHLIGHTS_KEPT);
  assert.deepEqual(r.highlights.map((h) => h.id), ['b', 'd', 'c']);
});

test('a finished job reports the milestone and writes it to the runner', () => {
  let s = game(8); const ids = s.crew.slice(0, 2).map((o) => o.id);
  s.jobs = []; addOffer(s, 'container409');
  s = M.startMission(s, s.jobs[0].id, ids, 'stealth');
  s = playMission(s, carefulPolicy).state;
  const am = s.activeMission;
  const first = s.crew.find((o) => o.id === ids[0]);
  assert.ok(first.record.milestones.length >= 1);
  assert.ok(am.result.outcome === 'completed' || am.result.outcome === 'aborted');
  const report = s.inbox.find((m) => m.type === 'report');
  assert.ok(report.timeline.outcome.some((o) => o.tone === 'milestone' && o.text.startsWith('Milestone: ')));
  assert.ok(first.record.highlights.length >= 1);
});

test('the dead earn no milestone', () => {
  let s;
  for (let seed = 9; seed < 90; seed++) {
    s = game(seed); const [x, y] = s.crew;
    s.jobs = []; addOffer(s, 'container409');
    s = M.startMission(s, s.jobs[0].id, [x.id, y.id], 'stealth');
    s.activeMission.untreated = [x.id];
    s.activeMission.queue = [{ type: 'beat', index: 0 }]; s.activeMission.step = 0;
    s = M.revealBeat(s);
    if (s.memorial.length) {
      assert.equal(s.memorial[0].record.jobs, 1);
      const lines = s.inbox.find((m) => m.type === 'report').timeline.outcome.filter((o) => o.tone === 'milestone');
      assert.ok(lines.every((o) => !o.text.includes(x.handle)), 'the dead earn nothing');
      assert.ok(lines.some((o) => o.text.includes(y.handle)), 'the survivor still does');
      return;
    }
  }
  assert.fail('expected a death');
});

test('save v31: what a record has already reached counts as earned, with no flood', async () => {
  const s = game(10); s.version = 29;
  s.crew[0].jobsWithCrew = 30; // an old crew: seeded to an estimated record in v30
  for (const o of s.crew) delete o.record;
  const loaded = await importSave({ text: () => Promise.resolve(JSON.stringify(s)) });
  const st = loaded.state ?? loaded;
  assert.equal(st.version, SAVE_VERSION);
  const r = st.crew[0].record;
  assert.ok(r.milestones.includes('jobs10') && r.milestones.includes('jobs25'));
  assert.deepEqual(r.highlights, []);
  assert.equal(checkMilestones(st, [st.crew[0]]).filter((l) => l.id.startsWith('jobs')).length, 0);
});

test('seedMilestones leaves an upgraded record alone', () => {
  const op = { record: rec({ jobs: 50, milestones: ['x'], highlights: [{ id: 'x' }] }) };
  seedMilestones(op);
  assert.deepEqual(op.record.milestones, ['x']);
});
