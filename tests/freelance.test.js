// Freelancers: guns for hire for one job. Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame, SAVE_VERSION } from '../src/core/state.js';
import { advanceDay } from '../src/core/time.js';
import * as M from '../src/core/mission.js';
import { templateById } from '../src/core/jobs.js';
import { FREELANCERS_PER_WEEK, freelanceCut, shareOf } from '../src/core/freelance.js';
import { validateRecruit } from '../src/core/validate.js';
import { playMission, randomPolicy, carefulPolicy } from './play.js';

globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
const { importSave } = await import('../src/save/save.js');

const withFreelancer = (seed, size = 1) => {
  let s = createNewGame({ seed });
  const job = s.jobs[seed % s.jobs.length];
  const f = s.freelancers[0];
  const ids = [f.id, ...s.crew.slice(0, size).map((o) => o.id)];
  return { s: M.startMission(s, job.id, ids, 'stealth'), f, job, before: s };
};

test('a fresh board of valid, 18+ freelancers every Monday', () => {
  let s = createNewGame({ seed: 1 });
  assert.equal(s.freelancers.length, FREELANCERS_PER_WEEK);
  const first = s.freelancers.map((f) => f.id);
  for (const f of s.freelancers) assert.deepEqual(validateRecruit(f), []);
  for (let i = 0; i < 7; i++) s = advanceDay(s); // next Monday
  assert.equal(s.freelancers.length, FREELANCERS_PER_WEEK);
  assert.ok(s.freelancers.every((f) => !first.includes(f.id)), 'new faces');
  const handles = [...s.crew, ...s.freelancers].map((o) => o.handle);
  assert.equal(new Set(handles).size, handles.length, 'no handle clashes with the crew');
});

test('a freelancer fills a slot for one job, takes their share, then leaves', () => {
  const { s, f } = withFreelancer(2, 1);
  assert.ok(s.activeMission, 'job started');
  assert.ok(s.crew.some((o) => o.id === f.id), 'on the crew during the job');
  assert.ok(!s.freelancers.some((x) => x.id === f.id), 'off the board');
  // Step through so we can compare cash across the final step (crises can spend cash mid-job).
  let cur = s;
  let last = s;
  for (let g = 0; g < 60 && !cur.activeMission.done; g++) {
    last = cur;
    const am = cur.activeMission;
    if (am.critical) cur = M.resolveCritical(cur, 'extract');
    else if (M.currentStep(am)?.type === 'beat') cur = M.revealBeat(cur);
    else cur = M.chooseOption(cur, carefulPolicy.crisis(M.describeCrisis(cur).choices.filter((c) => c.available)).id);
  }
  const done = cur;
  const r = done.activeMission.result;
  const share = r.freelance.find((x) => x.handle === f.handle);
  const spentOnLastStep = (M.describeCrisis(last)?.choices ?? []).some((c) => /cash/.test(c.cost ?? ''));
  assert.equal(share.cut, freelanceCut(f, r.pay));
  if (!spentOnLastStep) assert.equal(done.cash - last.cash, r.pay - share.cut);
  assert.ok(!M.closeMission(done).crew.some((o) => o.id === f.id), 'gone after the job');
});

test('freelancers take a share by quality and nothing from a job that pays nothing', () => {
  assert.equal(shareOf({ quality: 'rookie' }), 0.15);
  assert.equal(shareOf({ quality: 'pro' }), 0.2);
  assert.equal(shareOf({ quality: 'veteran' }), 0.25);
  assert.equal(freelanceCut({ quality: 'pro' }, 5000), 1000);
  assert.equal(freelanceCut({ quality: 'veteran' }, 0), 0);
});

test('a freelancer counts toward crew size (no short-handed penalty for their slot)', () => {
  const { s } = withFreelancer(3, 1);
  while (M.currentStep(s.activeMission)?.type === 'beat') Object.assign(s, M.revealBeat(s));
  const view = M.describeCrisis(s);
  if (!view) return;
  const tpl = templateById(s.activeMission.templateId);
  const c = view.choices.find((x) => x.riskReason && !['abort', 'extract'].includes(x.kind) && x.risk !== 'certain');
  if (c && tpl.crewSize > 2) assert.match(c.riskReason, new RegExp(`short-handed -${tpl.crewSize - 2}\\b`));
});

test('one freelancer per job; unknown ids are refused', () => {
  const s = createNewGame({ seed: 4 });
  const job = s.jobs[0];
  assert.equal(M.startMission(s, job.id, s.freelancers.map((f) => f.id), 'stealth'), s, 'two refused');
  assert.equal(M.startMission(s, job.id, ['nobody'], 'stealth'), s, 'unknown refused');
});

test('freelancers do not grow, and your crew still does', () => {
  const { s, f } = withFreelancer(5, 2);
  const done = playMission(s, carefulPolicy).state;
  const fl = done.crew.find((o) => o.id === f.id);
  if (fl) assert.deepEqual(fl.stats, f.stats);
  assert.ok(!(done.activeMission.result.growth ?? []).some((g) => g.opId === f.id));
});

test('nobody dies without "push on", freelancers included (1,000 random missions)', () => {
  for (let seed = 1; seed <= 1000; seed++) {
    const { s } = withFreelancer(seed, 1 + (seed % 3));
    if (!s.activeMission) continue;
    const { state, pushed } = playMission(s, randomPolicy(seed));
    if (!pushed) assert.equal(state.activeMission.result.deaths.length, 0, `seed ${seed}`);
  }
});

test('a v6 save upgrades to v7 with a freelance board', async () => {
  const v6 = createNewGame({ seed: 12 });
  delete v6.freelancers;
  v6.version = 6;
  const loaded = await importSave({ text: async () => JSON.stringify(v6) });
  assert.equal(loaded.version, SAVE_VERSION);
  assert.equal(loaded.freelancers.length, FREELANCERS_PER_WEEK);
});
