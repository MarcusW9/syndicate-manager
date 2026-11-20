// Level-ups (core/levelup.js, data/builds.js LEVEL_UP; DESIGN.md 2026-11-20, runner shaping step 4). They replaced Joss's offers
// (slice 3-ii-b, 2026-11-17, whose tests this file grew from): a runner levels up when a skill is ready for them and the jobs are
// behind them, and the player picks any ready skill on their page. Run with: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame, SAVE_VERSION } from '../src/core/state.js';
import { makeRng } from '../src/core/rng.js';
import * as F from '../src/core/fight.js';
import { advanceDay } from '../src/core/time.js';
import { LEVEL_UP, MOVES, PAYLOADS } from '../src/data/builds.js';
import { buildPieces, buildOf } from '../src/core/builds.js';
import { checkLevelUps, learnSkill, levelUpDue, levelUpOpen, readySkills, jobsToLevelUp } from '../src/core/levelup.js';
import { noteOverwatchJob } from '../src/core/specialisations.js';

const fresh = () => { const s = createNewGame({ seed: 1 }); s.day = 10; return s; };
const jax = (s) => s.crew.find((o) => o.id === 'jax'); // muscle, combat 15
const wing = (s) => s.crew.find((o) => o.id === 'wing'); // tech, combat 4
const notices = (s, id) => s.inbox.filter((m) => m.kind === 'levelup' && m.payload.opId === id);

test('nobody levels up before the first milestone', () => {
  const s = fresh(); jax(s).jobsWithCrew = LEVEL_UP.firstAtJobs - 1;
  assert.ok(readySkills(jax(s)).length, 'a skill is ready');
  assert.equal(levelUpDue(jax(s)), false);
  assert.equal(jobsToLevelUp(jax(s)), 1);
  assert.deepEqual(checkLevelUps(s), []);
  assert.equal(notices(s, 'jax').length, 0);
});

test('at the milestone with a skill ready: one level-up, one notice, not repeated while it waits', () => {
  const s = fresh(); jax(s).jobsWithCrew = LEVEL_UP.firstAtJobs;
  assert.deepEqual(checkLevelUps(s).map((o) => o.id).includes('jax'), true);
  assert.deepEqual(jax(s).levelUp, { day: s.day });
  assert.ok(levelUpOpen(jax(s)));
  const [m] = notices(s, 'jax');
  assert.equal(m.blocking, false);
  assert.ok(!m.options, 'no options: the pick is on their page');
  checkLevelUps(s);
  assert.equal(notices(s, 'jax').length, 1, 'not again while it waits');
});

test('no skill ready, no level-up, however many jobs', () => {
  const s = fresh(); const w = wing(s);
  w.jobsWithCrew = 50;
  w.build = { move: 'ricochet', payload: 'cytotoxic' }; w.spec = { id: 'marksman', day: 1 }; // every place taken
  assert.deepEqual(readySkills(w), []);
  assert.equal(levelUpDue(w), false);
  assert.ok(!checkLevelUps(s).includes(w));
});

test('the gates decide what is ready: a tech with combat 4 can learn payloads only, each one they meet the needs of', () => {
  const s = fresh(); const w = wing(s);
  const ready = readySkills(w);
  assert.ok(ready.length && ready.every((i) => i.slot === 'payload' && Object.entries(i.needs).every(([k, n]) => w.stats[k] >= n)));
  assert.ok(!ready.some((i) => i.id === 'ricochet' || i.id === 'incendiary'), 'combat 10 is out of reach');
});

test('learning a skill fills its place for good, and the next level-up waits for the gap', () => {
  let s = fresh(); jax(s).jobsWithCrew = LEVEL_UP.firstAtJobs; checkLevelUps(s);
  s = learnSkill(s, 'jax', 'move', 'ricochet');
  assert.deepEqual(jax(s).build, { move: 'ricochet', payload: null });
  assert.equal(jax(s).pickAt, LEVEL_UP.firstAtJobs);
  assert.equal(jax(s).levelUp, null);
  assert.ok(jax(s).history.some((h) => h.includes('Ricochet')));
  assert.equal(notices(s, 'jax')[0].resolved, true);
  assert.equal(notices(s, 'jax')[0].payload.learned, 'Ricochet');
  assert.deepEqual(buildPieces(jax(s)).map((b) => b.id), ['ricochet']);
  assert.deepEqual(checkLevelUps(s), [], 'not until the gap');
  assert.equal(jobsToLevelUp(jax(s)), LEVEL_UP.everyJobs);
  jax(s).jobsWithCrew += LEVEL_UP.everyJobs; checkLevelUps(s);
  assert.ok(levelUpOpen(jax(s)));
  assert.ok(!readySkills(jax(s)).some((i) => i.slot === 'move'), 'the move place is taken');
  s = learnSkill(s, 'jax', 'payload', 'cytotoxic');
  assert.deepEqual(jax(s).build, { move: 'ricochet', payload: 'cytotoxic' });
});

test('a pick is refused without an open level-up, for a skill not ready, or for a taken place', () => {
  const s = fresh(); jax(s).jobsWithCrew = LEVEL_UP.firstAtJobs;
  assert.equal(learnSkill(s, 'jax', 'move', 'ricochet'), s, 'no level-up announced yet');
  checkLevelUps(s);
  assert.equal(learnSkill(s, 'jax', 'spec', 'droneJockey'), s, 'not ready (piloting, drone jobs)');
  assert.equal(learnSkill(s, 'jax', 'move', 'nonsense'), s);
  jax(s).build = { move: 'ricochet', payload: null }; // already holds a move by another route
  assert.equal(learnSkill(s, 'jax', 'move', 'ricochet'), s);
});

test('freelancers never level up', () => {
  const s = fresh(); jax(s).jobsWithCrew = 50; jax(s).freelance = true;
  assert.equal(levelUpDue(jax(s)), false);
  assert.ok(!checkLevelUps(s).some((o) => o.id === 'jax'));
});

test('a specialisation is learned the same way, once its jobs on overwatch are done; the days check too', () => {
  let s = fresh(); const op = jax(s);
  op.build = { move: 'ricochet', payload: 'cytotoxic' }; op.pickAt = 0; op.jobsWithCrew = 8;
  Object.assign(op.stats, { combat: 12, cool: 9 });
  assert.equal(levelUpDue(op), false, 'no rifle jobs yet');
  for (let i = 0; i < 3; i++) noteOverwatchJob(op, 'rifle');
  assert.deepEqual(readySkills(op).map((i) => i.id), ['marksman']);
  s = advanceDay(s);
  assert.ok(levelUpOpen(jax(s)), 'the day tick announces it');
  s = learnSkill(s, 'jax', 'spec', 'marksman');
  assert.equal(jax(s).spec.id, 'marksman');
  jax(s).jobsWithCrew += 99;
  assert.deepEqual(readySkills(jax(s)), [], 'all three places full: nothing left');
  assert.equal(levelUpDue(jax(s)), false);
});

test('a learned build is what the fight plays: the planning read and the round read the runner\'s own build', () => {
  let s = fresh(); jax(s).jobsWithCrew = LEVEL_UP.firstAtJobs; checkLevelUps(s);
  s = learnSkill(s, 'jax', 'move', 'ricochet');
  jax(s).jobsWithCrew += LEVEL_UP.everyJobs; checkLevelUps(s);
  s = learnSkill(s, 'jax', 'payload', 'cytotoxic');
  const b = F.buildFight({ type: 'holdYard', diff: 14, threat: 3, site: 'docks', crew: s.crew.slice(0, 4), approach: 'loud' }, makeRng(3));
  assert.deepEqual(b.runners.find((r) => r.id === 'jax').build, { move: 'ricochet', payload: 'cytotoxic' });
  assert.equal(b.runners.find((r) => r.id === 'wing').build, null);
  assert.deepEqual(buildOf(jax(s)), { move: 'ricochet', payload: 'cytotoxic' });
});

test('every piece has a slot, base-stat needs, a description and Joss\'s line', () => {
  for (const p of [...Object.values(MOVES), ...Object.values(PAYLOADS)]) {
    assert.ok(['move', 'payload'].includes(p.slot), p.id);
    assert.ok(typeof p.needs === 'object' && p.desc && p.offer.includes('{op}'), p.id);
  }
});

test('the save: v75 gives every runner no build, and later versions no pick yet', async () => {
  const S = await import('../src/save/save.js');
  const s = createNewGame({ seed: 7 });
  for (const o of s.crew) { delete o.build; delete o.buildAt; delete o.buildSnooze; delete o.pickAt; delete o.levelUp; }
  s.version = 74;
  const loaded = await S.importSave({ text: async () => JSON.stringify(s) });
  assert.equal(loaded.version, SAVE_VERSION);
  assert.ok(loaded.crew.every((o) => o.build === null && o.pickAt === null && o.levelUp === null && !('buildAt' in o) && !('buildSnooze' in o)));
});

test('the save: v83 counts the last pick from the last piece taken and closes Joss\'s open offers with a note', async () => {
  const S = await import('../src/save/save.js');
  const s = createNewGame({ seed: 7 });
  for (const o of s.crew) { delete o.pickAt; delete o.levelUp; }
  Object.assign(jax(s), { build: { move: 'ricochet', payload: null }, buildAt: 4, buildSnooze: 30, jobsWithCrew: 6 });
  Object.assign(wing(s), { spec: { id: 'marksman', day: 3 }, buildAt: null, jobsWithCrew: 9, specSnooze: 12 });
  s.inbox.unshift({ id: 'build-jax-9', type: 'crew', kind: 'build', day: 9, subject: 'x', body: 'y', options: [{ id: 'cytotoxic', label: 'Take' }, { id: 'later', label: 'Not yet' }], payload: { opId: 'jax', ids: ['cytotoxic'], outcome: null }, blocking: false, resolved: false, read: false });
  s.version = 82;
  const loaded = await S.importSave({ text: async () => JSON.stringify(s) });
  assert.equal(loaded.version, SAVE_VERSION);
  assert.equal(jax(loaded).pickAt, 4);
  assert.equal(wing(loaded).pickAt, 9, 'a specialisation alone: counted from now');
  assert.ok(loaded.crew.every((o) => o.levelUp === null && !('buildAt' in o) && !('buildSnooze' in o) && !('specSnooze' in o)));
  const m = loaded.inbox.find((x) => x.id === 'build-jax-9');
  assert.equal(m.resolved, true);
  assert.match(m.payload.outcome, /level-up/);
});
