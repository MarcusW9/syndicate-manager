// Development rules: potential, growth from work, mentoring, age and decline.
// Run with: npm test. Targets are in DESIGN.md (2026-10-23, development).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame, SAVE_VERSION } from '../src/core/state.js';
import { advanceDay } from '../src/core/time.js';
import * as M from '../src/core/mission.js';
import { generateRecruit, hire } from '../src/core/recruits.js';
import { XP, ageRate, applyGrowth, mentoring, potentialRead, primaryStat, STATS } from '../src/core/development.js';
import { developRookie, makeRookie } from './develop-sim.js';
import { playMission, carefulPolicy } from './play.js';

globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
const { importSave } = await import('../src/save/save.js');

const median = (a) => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)];
const ROLES = ['infiltrator', 'muscle', 'medic'];
const runs = (opts, cfg) => ROLES.flatMap((role) => [1, 2, 3, 4, 5].map((seed) => developRookie(seed, { ...opts, role }, cfg)));

test('a good rookie with a mentor goes from 11 to 16-17 in about 22 jobs', () => {
  const r = runs({ ceiling: 18 }, { jobs: 22 });
  const m = median(r.map((x) => x.main));
  assert.ok(m >= 15 && m <= 17, `median main stat after 22 jobs: ${m}`);
});

test('a low-ceiling rookie plateaus at 13-14 and never passes the ceiling', () => {
  const r = runs({ ceiling: 14 }, { jobs: 30 });
  for (const x of r) assert.ok(x.main >= 12 && x.main <= 14, `main ${x.main}`);
  for (const x of r) for (const s of STATS) assert.ok(x.rookie.stats[s] <= x.rookie.potential[s], `${s} over ceiling`);
});

test('mentoring is worth about a point and a half over a season of work', () => {
  const mean = (r) => r.reduce((n, x) => n + x.main, 0) / r.length;
  const mentored = mean(runs({ ceiling: 19 }, { jobs: 22 }));
  const solo = mean(runs({ ceiling: 19 }, { jobs: 22, mentor: false }));
  assert.ok(mentored >= solo + 0.75, `mentored ${mentored} vs solo ${solo}`);
});

test('mentors: a veteran-trait operative, or a veteran of the same role; rookies only', () => {
  const s = createNewGame({ seed: 1 });
  const teo = s.crew.find((o) => o.id === 'teo');
  const rookie = makeRookie({ role: 'tech' });
  assert.deepEqual(mentoring([rookie, teo]).map((p) => p.op.id), ['rookie']);
  const vetTech = { ...makeRookie({ role: 'tech' }), id: 'vt', tier: 'veteran', traits: [] };
  assert.equal(mentoring([rookie, vetTech]).length, 1, 'same-role veteran mentors');
  const vetMuscle = { ...vetTech, role: 'muscle' };
  assert.equal(mentoring([rookie, vetMuscle]).length, 0, 'different-role veteran does not');
  assert.equal(mentoring([{ ...rookie, tier: 'pro' }, teo]).length, 0, 'pros are not mentored');
});

test('age sets the growth rate: under 25 x1.5, 25-34 x1, 35+ x0.5', () => {
  assert.deepEqual([18, 24, 25, 34, 35, 50].map(ageRate), [1.5, 1.5, 1, 1, 0.5, 0.5]);
  const young = makeRookie({ age: 20, ceiling: 20 });
  const old = { ...makeRookie({ age: 36, ceiling: 20 }), id: 'old', progress: {} };
  applyGrowth([young], { rookie: { stealth: 60 } });
  applyGrowth([old], { old: { stealth: 60 } });
  assert.ok(young.stats.stealth > old.stats.stealth);
});

test('a failed roll still teaches the roller', () => {
  let found = false;
  for (let seed = 1; seed <= 200 && !found; seed++) {
    let s = createNewGame({ seed });
    const job = s.jobs.find((j) => j.templateId === 'warehouse');
    s = M.startMission(s, job.id, s.crew.slice(0, 4).map((o) => o.id), 'loud');
    while (M.currentStep(s.activeMission)?.type === 'beat') s = M.revealBeat(s);
    const choice = M.describeCrisis(s).choices.find((c) => c.available && !['abort', 'extract'].includes(c.kind) && c.risk !== 'certain');
    const [, handle, stat] = choice.riskReason.match(/^(.+?) on (\w+) \(/);
    const progressOf = (st) => { const o = st.crew.find((x) => x.handle === handle); return o.stats[stat] * 1000 + (o.progress[stat] ?? 0); };
    const before = s.activeMission.log.length;
    const was = progressOf(s);
    s = M.chooseOption(s, choice.id);
    if (s.activeMission.log.slice(before).some((e) => e.kind === 'bad')) {
      found = true;
      const op = s.crew.find((x) => x.handle === handle);
      const atCeiling = op.stats[stat] >= op.potential[stat];
      assert.ok(atCeiling || progressOf(s) > was, `${handle} learned ${stat} from a failed roll`);
    }
  }
  assert.ok(found, 'found a failed roll to check');
});

test('the mission report lists growth and the stats really change', () => {
  let s = createNewGame({ seed: 3 });
  s.crew.push(makeRookie({ role: 'driver', ceiling: 19 }));
  s.crew.find((o) => o.id === 'rookie').progress.driving = 30; // one job away from a point
  const job = s.jobs.find((j) => j.templateId === 'courier');
  s = M.startMission(s, job.id, ['rookie', 'teo'], 'stealth');
  const done = playMission(s, carefulPolicy).state;
  const rookie = done.crew.find((o) => o.id === 'rookie');
  if (!done.activeMission.aborted) {
    assert.ok(rookie.stats.driving > 11);
    assert.ok(done.activeMission.result.growth.some((e) => e.handle === 'Kid' && e.stat === 'driving' && e.to === e.from + 1));
  }
});

test('rookies graduate to pro at 15 in their main stat', () => {
  const rookie = makeRookie({ role: 'muscle', start: 14, ceiling: 18 });
  const { graduated } = applyGrowth([rookie], { rookie: { combat: 200 } });
  assert.equal(rookie.tier, 'pro');
  assert.deepEqual(graduated.map((o) => o.id), ['rookie']);
});

test('a new season ages everyone; only those past 40 decline', () => {
  let s = createNewGame({ seed: 5 });
  s.crew.push({ ...makeRookie({ age: 45 }), id: 'old', handle: 'Old', tier: 'veteran' });
  const before = structuredClone(s.crew);
  s.day = 364; // Sunday, last day of season 1
  s = advanceDay(s);
  for (const op of s.crew) {
    const was = before.find((o) => o.id === op.id);
    assert.equal(op.age, was.age + 1, `${op.id} aged`);
    if (op.age <= 40) assert.deepEqual(op.stats, was.stats, `${op.id} should not decline`);
  }
  const lost = (id) => STATS.reduce((n, k) => n + before.find((o) => o.id === id).stats[k] - s.crew.find((o) => o.id === id).stats[k], 0);
  assert.ok(lost('old') >= 1, 'a 46-year-old loses something');
  assert.ok(s.inbox.some((m) => m.id === 'season-2'));
});

test('recruits: ceilings fit their tier, and every lead has a scout opinion', () => {
  const s = createNewGame({ seed: 7 });
  let wrong = 0;
  for (let i = 0; i < 2000; i++) {
    const r = generateRecruit(s);
    const p = primaryStat(r);
    for (const k of STATS) assert.ok(r.potential[k] >= r.stats[k] && r.potential[k] <= 20, `${r.id} ${k}`);
    if (r.quality === 'rookie') assert.ok(r.potential[p] >= 14 && r.potential[p] <= 20, `rookie ceiling ${r.potential[p]}`);
    if (r.quality === 'veteran') assert.ok(r.potential[p] - r.stats[p] <= 1, 'veterans are near their peak');
    assert.ok(r.scoutReport && !/\d/.test(r.scoutReport), 'opinion in words, never a number');
    if (r.scoutError) wrong += 1;
  }
  assert.ok(wrong > 400 && wrong < 1200, `scouts wrong ${wrong} times in 2000`);
});

test('the read on potential is in words and follows the scout error', () => {
  const op = makeRookie({ start: 11, ceiling: 18 });
  assert.match(potentialRead(op, 'Teo'), /special/);
  assert.match(potentialRead({ ...op, scoutError: -2 }, 'Teo'), /better than most pros/);
  assert.match(potentialRead({ ...op, stats: { ...op.stats, stealth: 18 } }, 'Teo'), /Already as good/);
});

test('hiring keeps the tier and hidden potential', () => {
  let s = createNewGame({ seed: 9 });
  s.recruits = [generateRecruit(s)];
  const r = s.recruits[0];
  s = hire(s, r.id);
  const op = s.crew.at(-1);
  assert.equal(op.tier, r.quality);
  assert.deepEqual(op.potential, r.potential);
  assert.deepEqual(op.startStats, op.stats);
});

test('a v3 save upgrades to v4 with development fields', async () => {
  const v3 = createNewGame({ seed: 12 });
  v3.recruits = [generateRecruit(v3)];
  for (const op of v3.crew) { delete op.tier; delete op.potential; delete op.progress; delete op.startStats; delete op.scoutError; }
  for (const r of v3.recruits) { delete r.potential; delete r.scoutError; delete r.scoutReport; }
  v3.version = 3;
  const loaded = await importSave({ text: async () => JSON.stringify(v3) });
  assert.equal(loaded.version, SAVE_VERSION);
  assert.equal(loaded.crew.find((o) => o.id === 'teo').tier, 'veteran');
  for (const op of loaded.crew) for (const k of STATS) assert.ok(op.potential[k] >= op.stats[k]);
  assert.ok(loaded.recruits[0].scoutReport);
});

test('stats panels show trait bonuses, capped at 20', async () => {
  const { traitMods, ratedStat, effectiveStat } = await import('../src/core/crew.js');
  const op = { stats: { combat: 15, stealth: 6, tech: 19, social: 8, driving: 9, medical: 4, cool: 7 }, traits: ['hothead', 'chromed'], condition: { fatigue: 0, injury: 'healthy' } };
  assert.deepEqual(traitMods(op), { combat: 2, cool: -2, tech: 2 });
  assert.equal(ratedStat(op, 'combat'), 17);
  assert.equal(ratedStat(op, 'cool'), 5);
  assert.equal(ratedStat(op, 'tech'), 20, '19 +2 caps at 20');
  assert.equal(effectiveStat(op, 'tech').value, ratedStat(op, 'tech'), 'shown = used');
});

test('a 20 ceiling exists but is rare (about 1 in 50 rookies)', async () => {
  const { createNewGame } = await import('../src/core/state.js');
  const { generateRecruit } = await import('../src/core/recruits.js');
  const { primaryStat } = await import('../src/core/development.js');
  const s = createNewGame({ seed: 77 });
  let rookies = 0, twenty = 0;
  for (let i = 0; i < 6000; i++) {
    const r = generateRecruit(s);
    if (r.quality !== 'rookie') continue;
    rookies += 1;
    if (r.potential[primaryStat(r)] === 20) twenty += 1;
  }
  const share = twenty / rookies;
  assert.ok(share > 0.005 && share < 0.04, `20-ceiling share ${share}`);
});
