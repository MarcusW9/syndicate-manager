// Growth feedback and crew size. Run with: npm test
// Growth log (rises and declines), the season marker, save migration, the live
// flash during a job, and the crew rule shared by real rolls and the risk read.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame, SAVE_VERSION } from '../src/core/state.js';
import { advanceDay, seasonStartDay } from '../src/core/time.js';
import * as M from '../src/core/mission.js';
import { templateById, twistById } from '../src/core/jobs.js';
import { crewRoll, maxCrew, MAX_EXTRA_CREW } from '../src/core/crew.js';
import { assessJob, successChance, riskLabel, STAT_FOR_THREAT } from '../src/core/risk.js';
import { gainXp, changesSince, STATS, pointCost } from '../src/core/development.js';
import { nextRng } from '../src/core/random.js';
import { d20 } from '../src/core/rng.js';
import { makeRookie } from './develop-sim.js';

globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
const { importSave } = await import('../src/save/save.js');

// --- growth log ----------------------------------------------------------------

test('the growth log records rises with stat, from, to and day', () => {
  const op = makeRookie({ role: 'tech', start: 11, ceiling: 18 });
  const { events } = gainXp(op, [op], 'tech', 200, 40);
  assert.ok(events.length && op.stats.tech > 11);
  assert.deepEqual(op.growthLog[0], { stat: 'tech', from: 11, to: op.stats.tech, day: 40 });
  assert.equal(changesSince(op, 1).tech, op.stats.tech - 11);
});

test('age decline is logged as a fall at the new season', () => {
  let s = createNewGame({ seed: 5 });
  s.crew.push({ ...makeRookie({ age: 45 }), id: 'old', handle: 'Old', tier: 'veteran' });
  s.day = 364;
  s = advanceDay(s); // season 2 starts
  const old = s.crew.find((o) => o.id === 'old');
  assert.ok(old.growthLog.length >= 1);
  for (const e of old.growthLog) { assert.equal(e.to, e.from - 1); assert.equal(e.day, s.day); }
  const net = changesSince(old, seasonStartDay(s.day));
  assert.ok(Object.values(net).every((n) => n < 0), 'season marker shows the decline in red');
});

test('the season marker resets at a new season', () => {
  let s = createNewGame({ seed: 6 });
  const wing = s.crew.find((o) => o.id === 'wing');
  s.day = 300;
  gainXp(wing, s.crew, 'tech', 300, s.day);
  assert.ok(changesSince(wing, seasonStartDay(s.day)).tech > 0, 'rise shows this season');
  s.day = 364;
  s = advanceDay(s);
  const after = s.crew.find((o) => o.id === 'wing');
  assert.deepEqual(changesSince(after, seasonStartDay(s.day)), {}, 'new season starts clean');
  assert.equal(after.growthLog.length, 0, 'old season entries are dropped');
  assert.ok(after.stats.tech > after.startStats.tech, 'career growth is kept');
});

test('a v5 save upgrades to v6 with an empty growth log', async () => {
  const v5 = createNewGame({ seed: 12 });
  for (const op of v5.crew) delete op.growthLog;
  v5.version = 5;
  const loaded = await importSave({ text: async () => JSON.stringify(v5) });
  assert.equal(loaded.version, SAVE_VERSION);
  for (const op of loaded.crew) assert.deepEqual(op.growthLog, []);
});

// --- live flash ------------------------------------------------------------------

test('a rise during a roll is flashed in the mission log at that moment', () => {
  let seen = 0;
  for (let seed = 1; seed <= 40; seed++) {
    let s = createNewGame({ seed });
    const kid = makeRookie({ role: 'driver', ceiling: 19 });
    for (const k of STATS) kid.progress[k] = pointCost(kid.stats[k], kid.potential[k]) - 1; // every stat on the brink
    s.crew.push(kid);
    const job = s.jobs[0];
    s = M.startMission(s, job.id, ['rookie', 'teo'], 'stealth');
    while (M.currentStep(s.activeMission)?.type === 'beat') s = M.revealBeat(s);
    if (!M.describeCrisis(s)) continue;
    const choice = M.describeCrisis(s).choices.find((c) => c.available && !['abort', 'extract'].includes(c.kind) && c.risk !== 'certain');
    if (!choice) continue;
    const before = s.activeMission.log.length;
    s = M.chooseOption(s, choice.id);
    const flashes = s.activeMission.log.slice(before).filter((e) => e.kind === 'growth');
    if (flashes.length) {
      seen += 1;
      assert.match(flashes[0].text, /^▲ \w+: [A-Z]\w+ \d+ → \d+$/);
      assert.ok(s.activeMission.growth.length >= flashes.filter((f) => f.text.startsWith('▲')).length);
    }
  }
  assert.ok(seen > 10, `flashes seen in ${seen} runs`);
});

test('growth is deterministic for a seed', () => {
  const run = () => {
    let s = createNewGame({ seed: 77 });
    s.crew.push(makeRookie({ role: 'infiltrator', ceiling: 18 }));
    s = M.startMission(s, s.jobs[0].id, ['rookie', 'teo', 'mei'].slice(0, maxCrew(templateById(s.jobs[0].templateId).crewSize)), 'stealth');
    while (!s.activeMission.done) {
      const am = s.activeMission;
      if (am.critical) s = M.resolveCritical(s, 'extract');
      else if (M.currentStep(am)?.type === 'beat') s = M.revealBeat(s);
      else s = M.chooseOption(s, M.describeCrisis(s).choices.find((c) => c.available && c.kind !== 'abort')?.id ?? 'abort');
    }
    return s.crew.map((o) => [o.id, o.stats, o.growthLog]);
  };
  assert.deepEqual(run(), run());
});

// --- crew size: one rule for real rolls and the risk read ----------------------------

test('short-handed: -1 per missing person, on real rolls and in the read', () => {
  const s = createNewGame({ seed: 1 });
  const teo = s.crew.find((o) => o.id === 'teo');
  const full = crewRoll(s.crew.slice(0, 4), 'driving', { recommended: 4 });
  const alone = crewRoll([teo], 'driving', { recommended: 4 });
  assert.equal(alone.missing, 3);
  assert.equal(alone.value, 17 - 3);
  assert.ok(alone.notes.includes('short-handed -3'));
  assert.equal(full.missing, 0);
});

test('backup: a second person within 3 of the best adds +1', () => {
  const s = createNewGame({ seed: 1 });
  const teo = s.crew.find((o) => o.id === 'teo');
  const close = makeRookie({ role: 'driver', start: 14 });
  const far = makeRookie({ role: 'driver', start: 13 });
  assert.equal(crewRoll([teo, close], 'driving').value, 18);
  assert.equal(crewRoll([teo, close], 'driving').backup.id, 'rookie');
  assert.equal(crewRoll([teo, far], 'driving').value, 17);
  assert.equal(crewRoll([teo, far], 'driving').backup, null);
});

test('the planning read uses the same crew rule as real rolls', () => {
  const s = createNewGame({ seed: 2 });
  for (const tplId of ['courier', 'data_pull', 'warehouse']) {
    const tpl = templateById(tplId);
    for (let n = 1; n <= Math.min(s.crew.length, maxCrew(tpl.crewSize)); n++) {
      const crew = s.crew.slice(0, n);
      const worst = Math.min(...tpl.keyStats.map((st) => successChance(crewRoll(crew, st, { approach: 'stealth', recommended: tpl.crewSize }).value, STAT_FOR_THREAT(tpl.threat))));
      assert.equal(assessJob(tpl, crew, 'stealth').level, riskLabel(worst), `${tplId} with ${n}`);
    }
  }
});

test('real crisis rolls succeed exactly when d20 + the shown value beats the target', () => {
  let checked = 0;
  for (let seed = 1; seed <= 150; seed++) {
    let s = createNewGame({ seed });
    const job = s.jobs[seed % s.jobs.length];
    const tpl = templateById(job.templateId);
    const size = 1 + (seed % maxCrew(tpl.crewSize)); // short, full and over-size crews
    s = M.startMission(s, job.id, s.crew.slice(0, Math.min(size, s.crew.length)).map((o) => o.id), 'stealth');
    while (M.currentStep(s.activeMission)?.type === 'beat') s = M.revealBeat(s);
    const view = M.describeCrisis(s);
    if (!view) continue;
    const step = M.currentStep(s.activeMission);
    const crisis = tpl.crises.find((c) => c.id === step.id) ?? twistById(step.id);
    const choice = view.choices.find((c) => c.available && !['abort', 'extract'].includes(c.kind) && c.risk !== 'certain');
    if (!choice) continue;
    const shown = Number(choice.riskReason.match(/ \((-?\d+)/)[1]);
    const data = crisis.choices.find((c) => c.id === choice.id);
    const target = 10 + data.difficulty + (s.activeMission.threatDelta ?? 0);
    const expected = d20(nextRng(structuredClone(s))) + shown >= target;
    const before = s.activeMission.log.length;
    const after = M.chooseOption(s, choice.id);
    const got = after.activeMission.log.slice(before).some((e) => e.kind === 'good');
    assert.equal(got, expected, `seed ${seed}`);
    if (size < tpl.crewSize) assert.match(choice.riskReason, /short-handed -\d/);
    checked += 1;
  }
  assert.ok(checked > 50, `checked ${checked} rolls`);
});

test(`crews can run up to ${MAX_EXTRA_CREW} over the recommended size, no more`, () => {
  const s = createNewGame({ seed: 3 });
  s.crew.push(makeRookie({ role: 'tech' }), { ...makeRookie({ role: 'face' }), id: 'r2', handle: 'R2' });
  const job = s.jobs.find((j) => templateById(j.templateId).crewSize === 2) ?? s.jobs[0];
  const rec = templateById(job.templateId).crewSize;
  const ids = s.crew.map((o) => o.id);
  assert.ok(M.startMission(s, job.id, ids.slice(0, rec + MAX_EXTRA_CREW), 'stealth').activeMission);
  assert.equal(M.startMission(s, job.id, ids.slice(0, rec + MAX_EXTRA_CREW + 1), 'stealth'), s, 'refused');
  assert.equal(M.startMission(s, job.id, [], 'stealth'), s, 'empty crew refused');
});

// --- planning badge and crew-list scout line ----------------------------------------

test('the crew-size badge shows the same penalty the rolls use', async () => {
  const { crewSizeRead, SHORT_HANDED_PENALTY } = await import('../src/core/crew.js');
  assert.equal(crewSizeRead(0, 4).level, 'none');
  assert.equal(crewSizeRead(4, 4).level, 'full');
  assert.equal(crewSizeRead(5, 4).level, 'extra');
  const s = createNewGame({ seed: 1 });
  for (let n = 1; n < 4; n++) {
    const read = crewSizeRead(n, 4);
    assert.equal(read.level, 'short');
    assert.equal(read.penalty, (4 - n) * SHORT_HANDED_PENALTY);
    assert.equal(crewRoll(s.crew.slice(0, n), 'driving', { recommended: 4 }).missing * SHORT_HANDED_PENALTY, read.penalty);
    assert.match(read.text, new RegExp(`−${read.penalty} on every roll`));
  }
});

test('the crew-list scout tag agrees with the full read, and never shows a number', async () => {
  const { potentialTag, potentialRead } = await import('../src/core/development.js');
  const pairs = [['could be one of the greats', /has ever had/], ['built for the big jobs', /top-tier/], ['grows into hard jobs', /grow into the hard jobs/], ['a steady pair of hands', /always be a stretch/],
    ['nearly at their wall', /nearly at their wall/], ['at their wall', /hit their wall/]];
  const cases = [{ start: 11, ceiling: 20 }, { start: 11, ceiling: 18 }, { start: 11, ceiling: 16 }, { start: 11, ceiling: 14 }, { start: 13, ceiling: 14 }, { start: 14, ceiling: 14 }];
  cases.forEach((c, i) => {
    const op = makeRookie(c);
    assert.equal(potentialTag(op), pairs[i][0]);
    assert.match(potentialRead(op, 'Teo'), pairs[i][1]);
  });
  for (const op of createNewGame({ seed: 4 }).crew) assert.doesNotMatch(potentialTag(op), /\d/);
});
