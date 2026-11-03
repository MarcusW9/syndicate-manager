// Fame, standing and the pro -> veteran promotion (renown slice 3, 2026-11). Fame and standing
// never touch a roll, pay, heat or the planning read. Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame, SAVE_VERSION } from '../src/core/state.js';
import * as M from '../src/core/mission.js';
import { addOffer } from '../src/core/jobs.js';
import { advanceDay, calendar } from '../src/core/time.js';
import { freshRecord } from '../src/core/record.js';
import { fameOf, standingOf, standingWord, eliteRuleMet, fameTarget, jobStanding, afterJobFame, weeklyFame, legendEligible } from '../src/core/fame.js';
import { STANDING, FAME_TIERS } from '../src/data/fame.js';
import { promoteVeteran, VETERAN_AT, primaryStat } from '../src/core/development.js';
import { planRead } from '../src/core/squad.js';
import { crewRoll } from '../src/core/crew.js';
import { playMission, toCrisis, carefulPolicy } from './play.js';

globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
const { importSave } = await import('../src/save/save.js');

const game = (seed = 1) => createNewGame({ seed, startCrew: 'fresh' });
const rec = (extra) => ({ ...freshRecord(), ...extra });
// A record that meets the Elite rule on the Ghost path (and everything below it).
const eliteRecord = (extra) => rec({ jobs: 30, atLevel: 25, wins: 25, clean: 20, bestCleanStreak: 6, activeWeeks: 14, lastJobDay: 0, ...extra });
const toSunday = (s) => { while (!calendar(s.day + 1).isSunday) s = advanceDay(s); return advanceDay(s); };
function runJob(s, crewIds, template = 'container409', approach = 'stealth') {
  s.jobs = []; addOffer(s, template);
  s = M.startMission(s, s.jobs[0].id, crewIds, approach);
  assert.ok(s.activeMission, 'the job started');
  return playMission(s, carefulPolicy).state;
}

test('fame never skips a tier: one step a Sunday, one step a job', () => {
  let s = game(1); const a = s.crew[0];
  a.record = eliteRecord({ lastJobDay: s.day }); a.standing = 90;
  const seen = [];
  for (let i = 0; i < 4; i++) { weeklyFame(s); seen.push(fameOf(a)); }
  assert.deepEqual(seen, ['known', 'respected', 'elite', 'elite']);
  // Through finish(): a runner whose record already reaches Elite climbs one tier on the job.
  let t = game(2); const [x, y] = t.crew;
  x.record = eliteRecord(); x.standing = 90;
  t = runJob(t, [x.id, y.id]);
  assert.equal(fameOf(t.crew.find((o) => o.id === x.id)), 'known');
});

test('Elite needs the whole rule: active weeks, at-level work, a path, and standing 40', () => {
  const op = (extra, standing = 60) => ({ handle: 'T', tier: 'pro', record: eliteRecord(extra), standing });
  assert.equal(eliteRuleMet(op({})), true);
  assert.equal(eliteRuleMet(op({}, 39)), false, 'standing under 40');
  assert.equal(eliteRuleMet(op({ activeWeeks: 11 })), false, 'too few active weeks');
  assert.equal(eliteRuleMet(op({ atLevel: 19 })), false, 'too little work at their level');
  assert.equal(eliteRuleMet(op({ clean: 14 })), false, 'no path at Elite');
  // Lifers swap the at-level count for jobs.
  const lifer = op({ atLevel: 0, clean: 0, bestCleanStreak: 0, activeWeeks: 26, jobs: 40 });
  assert.equal(eliteRuleMet(lifer), true);
  assert.equal(eliteRuleMet(op({ atLevel: 0, clean: 0, bestCleanStreak: 0, activeWeeks: 26, jobs: 39 })), false);
  assert.equal(fameTarget(op({}, 39)), 'respected');
  assert.equal(fameTarget({ record: rec({ jobs: 6 }) }), 'known');
  assert.equal(fameTarget({ record: rec({ jobs: 5 }) }), 'unknown');
});

test('becoming Elite sends a message, writes history and a highlight', () => {
  const s = game(3); const a = s.crew[0];
  a.record = eliteRecord({ lastJobDay: s.day }); a.standing = 80; a.fame = 'respected';
  weeklyFame(s);
  assert.equal(a.fame, 'elite');
  assert.ok(s.inbox.some((m) => m.id.startsWith(`elite-${a.id}`) && m.subject.includes(a.handle)));
  assert.ok(a.history.some((h) => h.includes('Elite (Ghost)')));
  assert.equal(a.record.highlights[0].weight, 80);
});

test('Elite lapses only after two Sundays in a row under 20, and can be won back', () => {
  let s = game(4); const id = s.crew[0].id;
  const op = () => s.crew.find((o) => o.id === id);
  Object.assign(op(), { record: eliteRecord({ lastJobDay: -20 }), standing: 22, fame: 'elite' });
  s = toSunday(s); // benched: 22 - 4 = 18, first low Sunday
  assert.equal(op().standing, 18); assert.equal(op().fame, 'elite'); assert.equal(op().record.lowWeeks, 1);
  op().standing = 30; // a good job in between...
  s = toSunday(s); // ...26 after the bench: the run of low Sundays resets
  assert.equal(op().fame, 'elite'); assert.equal(op().record.lowWeeks, 0);
  op().standing = 10;
  s = toSunday(s); assert.equal(op().fame, 'elite'); assert.equal(op().record.lowWeeks, 1);
  s = toSunday(s);
  assert.equal(op().fame, 'respected');
  assert.equal(op().record.wasElite, true);
  assert.ok(s.inbox.some((m) => m.id.startsWith(`elite-lost-${id}`)));
  assert.ok(op().history.some((h) => h.includes('lost Elite')));
  // Back in the work and rated again: Elite returns, with its own message.
  op().standing = 70; op().record.lastJobDay = s.day + 3;
  s = toSunday(s);
  assert.equal(op().fame, 'elite');
  assert.ok(s.inbox.some((m) => m.subject.includes('Elite again')));
});

test('standing: each change as specified', () => {
  const base = { outcome: 'completed', atLevel: true, carries: 0, milestones: 0, retreat: false, seriousInjury: false };
  assert.equal(jobStanding(base), 6);
  assert.equal(jobStanding({ ...base, atLevel: false }), 2);
  assert.equal(jobStanding({ ...base, carries: 2 }), 6 + 6);
  assert.equal(jobStanding({ ...base, carries: 5 }), 6 + 9, 'carries count up to +9 a job');
  assert.equal(jobStanding({ ...base, milestones: 2 }), 6 + 8);
  assert.equal(jobStanding({ ...base, outcome: 'aborted' }), -5);
  assert.equal(jobStanding({ ...base, outcome: 'loss' }), -5);
  assert.equal(jobStanding({ ...base, outcome: 'aborted', retreat: true }), -8);
  assert.equal(jobStanding({ ...base, seriousInjury: true }), -4);
  assert.deepEqual([STANDING.benchHealthy, STANDING.benchInjured], [-4, -2]);
});

test('standing stays 0-100, and a week on the bench costs it (less when hurt; nothing when working)', () => {
  const s = game(5); const [a, b, c, d] = s.crew;
  for (const o of [a, b, c, d]) o.record = rec({ jobs: 3, lastJobDay: -20 });
  a.standing = 2; b.standing = 50; b.condition.injury = 'light'; c.standing = 50; c.record.lastJobDay = s.day; d.standing = 99;
  weeklyFame(s);
  assert.deepEqual([a.standing, b.standing, c.standing, d.standing], [0, 48, 50, 95]);
  // A job can't push it past 100.
  d.standing = 98;
  afterJobFame(s, [d], { outcome: 'completed', facts: { [d.id]: { atLevel: true, carries: 3 } }, milestones: [{ opIds: [d.id] }], retreat: false });
  assert.equal(d.standing, 100);
  // A crew out on a hands-off job isn't benched.
  const e = s.crew[4]; e.record = rec({ jobs: 3, lastJobDay: -20 }); e.standing = 40;
  s.awayJobs = [{ returnDay: s.day + 2, mission: { crewIds: [e.id], overwatch: null, wheels: null, standby: null } }];
  weeklyFame(s);
  assert.equal(e.standing, 40);
});

test('a finished job moves standing for those who came home', () => {
  let s = game(6); const ids = s.crew.slice(0, 2).map((o) => o.id);
  s = runJob(s, ids);
  const am = s.activeMission;
  for (const id of ids) {
    const op = s.crew.find((o) => o.id === id);
    const milestones = op.record.milestones.length; // a fresh record: every milestone was earned on this job
    const hurt = op.condition.injury === 'serious' || op.condition.injury === 'critical';
    const expected = Math.max(0, Math.min(100, jobStanding({ outcome: am.result.outcome, atLevel: true, carries: op.record.carries, milestones, retreat: (am.repCut ?? 0) > 0, seriousInjury: hurt })));
    assert.equal(op.standing, expected, op.handle);
  }
});

test('standing words for Elite', () => {
  const w = (standing) => standingWord({ standing });
  assert.deepEqual([w(100), w(70), w(69), w(40), w(39), w(20), w(19), w(0)],
    ['At their peak', 'At their peak', 'Steady', 'Steady', 'Fading', 'Fading', 'Washed-up', 'Washed-up']);
});

test('nobody is made a Legend in this slice; eligibility is only a flag', () => {
  const op = { handle: 'L', tier: 'veteran', fame: 'elite', standing: 90, record: eliteRecord({ clean: 40, bestCleanStreak: 12, activeWeeks: 30, atLevel: 45 }) };
  assert.equal(legendEligible(op), true);
  assert.equal(legendEligible({ ...op, tier: 'pro' }), false, 'Legend needs a veteran');
  assert.equal(legendEligible({ ...op, fame: 'respected' }), false);
  assert.equal(legendEligible({ ...op, freelance: true }), false);
  const s = game(7); Object.assign(s.crew[0], structuredClone(op), { id: s.crew[0].id, history: [], condition: s.crew[0].condition });
  for (let i = 0; i < 5; i++) weeklyFame(s);
  assert.ok(FAME_TIERS.includes(s.crew[0].fame) && s.crew[0].fame !== 'legend');
});

test('freelancers get no fame or standing', () => {
  let s = game(7); const f = s.freelancers[0];
  assert.ok(f, 'expected a freelancer on the board');
  s = runJob(s, [s.crew[0].id, f.id]);
  const hired = s.crew.find((o) => o.id === f.id);
  assert.ok(hired, 'the freelancer was on the job');
  assert.equal(hired.fame, undefined); assert.equal(hired.standing, undefined);
  assert.equal(s.crew[0].fame, 'unknown'); assert.equal(typeof s.crew[0].standing, 'number');
  hired.record = eliteRecord(); weeklyFame(s);
  assert.equal(hired.fame, undefined);
});

test('a hands-off run updates fame and standing like a live one', async () => {
  const { sendOff } = await import('../src/core/autorun.js');
  let s = game(8); s.jobs = []; addOffer(s, 'container409');
  const ids = s.crew.slice(0, 2).map((o) => o.id);
  s.crew[0].record = rec({ jobs: 5 }); // the next job makes them known
  s = sendOff(s, s.jobs[0].id, ids, 'stealth', 'steady');
  for (let i = 0; i < 6 && s.awayJobs.length; i++) s = advanceDay(s);
  assert.equal(s.awayJobs.length, 0);
  const op = s.crew.find((o) => o.id === ids[0]);
  assert.equal(op.record.jobs, 6);
  assert.equal(op.fame, 'known');
  assert.notEqual(op.standing, undefined);
  assert.ok(op.history.some((h) => h.includes('know the name')));
});

test('pro -> veteran: main stat 16 and fifty jobs, after a job, with a message', () => {
  const op = (tier, main, jobs, extra = {}) => { const o = { tier, role: 'muscle', stats: { combat: main }, jobsWithCrew: jobs, ...extra }; return o; };
  assert.equal(primaryStat({ role: 'muscle' }), 'combat');
  assert.deepEqual(VETERAN_AT, { main: 16, jobs: 50 });
  assert.equal(promoteVeteran(op('pro', 16, 50)), true);
  assert.equal(promoteVeteran(op('pro', 15, 80)), false);
  assert.equal(promoteVeteran(op('pro', 18, 49)), false);
  assert.equal(promoteVeteran(op('rookie', 18, 80)), false, 'rookies graduate first');
  assert.equal(promoteVeteran(op('veteran', 18, 80)), false);
  assert.equal(promoteVeteran(op('pro', 18, 80, { freelance: true })), false);
  // Through finish(): the fiftieth job does it.
  let s = game(9); const [a, b] = s.crew;
  a.tier = 'pro'; a.stats[primaryStat(a)] = 16; a.jobsWithCrew = 49;
  const wage = a.wage;
  s = runJob(s, [a.id, b.id]);
  const after = s.crew.find((o) => o.id === a.id);
  assert.equal(after.tier, 'veteran');
  assert.equal(after.wage, wage, 'promotion alone changes no wage');
  assert.ok(after.history.some((h) => h.includes('became a veteran')));
  assert.ok(s.inbox.some((m) => m.id.startsWith(`veteran-${a.id}`)));
  assert.ok(s.inbox.find((m) => m.type === 'report').timeline.outcome.some((o) => o.text === `${a.handle} is a veteran now.`));
});

// The reads carry whole runners; compare them with each runner reduced to its id (fame and
// standing would otherwise show up as a difference in the copy, not in the numbers).
const same = (x) => JSON.stringify(x, (k, v) => (v && typeof v === 'object' && v.stats && v.handle ? `op:${v.id}` : v));

test('fame and standing never change the planning read or the odds', () => {
  const s = game(10); s.jobs = []; addOffer(s, 'container409');
  const job = s.jobs[0]; const crew = s.crew.slice(0, 2);
  const read = () => same(planRead(s, job, { crew, approach: 'stealth' }));
  const roll = () => same(['stealth', 'combat', 'cool', 'tech'].map((stat) => crewRoll(crew, stat, { approach: 'stealth' })));
  const before = [read(), roll()];
  for (const op of s.crew) Object.assign(op, { fame: 'elite', standing: 100, record: eliteRecord() });
  assert.deepEqual([read(), roll()], before);
  for (const op of s.crew) op.standing = 0;
  assert.deepEqual([read(), roll()], before);
  // At a crisis: the odds the player is shown are the same.
  let t = game(11); t.jobs = []; addOffer(t, 'container409');
  const ids = t.crew.slice(0, 2).map((o) => o.id);
  t = toCrisis(M.startMission(t, t.jobs[0].id, ids, 'stealth'));
  if (!t.activeMission.done && M.currentStep(t.activeMission)?.type === 'crisis') {
    const odds = same(M.crisisOdds(t));
    const u = structuredClone(t);
    for (const op of u.crew) Object.assign(op, { fame: 'elite', standing: 100, record: eliteRecord() });
    assert.equal(same(M.crisisOdds(u)), odds);
    // And the same choice rolls the same, pays the same and costs the same heat.
    const choice = M.describeCrisis(t).choices.find((c) => c.kind !== 'abort' && c.available !== false) ?? M.describeCrisis(t).choices[0];
    const a = M.chooseOption(t, choice.id), b = M.chooseOption(u, choice.id);
    assert.equal(same(a.activeMission.events.at(-1)), same(b.activeMission.events.at(-1)));
    assert.equal(a.cash, b.cash); assert.equal(a.activeMission.extraHeat, b.activeMission.extraHeat); assert.equal(a.activeMission.payCut, b.activeMission.payCut);
    assert.equal(a.rngCounter, b.rngCounter);
  } else assert.fail('expected the job to reach a crisis');
});

test('save v32: a v29 save upgrades straight through, standing from jobs, nobody Elite', async () => {
  const s = game(12); s.version = 29;
  const [a, b, c] = s.crew;
  a.jobsWithCrew = 200; // an estimated record big enough for Elite on paper
  b.jobsWithCrew = 4; c.jobsWithCrew = 0;
  for (const o of s.crew) { delete o.record; delete o.fame; delete o.standing; }
  s.crew.push({ ...structuredClone(s.crew[3]), id: 'fx', freelance: true, jobsWithCrew: 30 });
  const st = await importSave({ text: () => Promise.resolve(JSON.stringify(s)) });
  assert.equal(st.version, SAVE_VERSION);
  assert.equal(SAVE_VERSION, 32);
  const [ua, ub, uc] = st.crew;
  assert.equal(ua.standing, 50); assert.equal(ub.standing, 12); assert.equal(uc.standing, 0);
  assert.ok(['known', 'respected'].includes(ua.fame), `capped at respected, got ${ua.fame}`);
  assert.equal(ub.fame, 'unknown');
  for (const o of [ua, ub, uc]) { assert.equal(o.record.lowWeeks, 0); assert.equal(o.record.wasElite, false); }
  const fx = st.crew.find((o) => o.id === 'fx');
  assert.equal(fx.fame, undefined); assert.equal(fx.record, undefined);
  assert.ok(st.crew.every((o) => o.fame !== 'elite'));
});

test('save v32 from v31: an existing record keeps its counts and gets fame fields', async () => {
  const s = game(13); s.version = 31;
  s.crew[0].record = rec({ jobs: 8, atLevel: 4, activeWeeks: 3, milestones: ['firstAtLevel'], highlights: [] });
  delete s.crew[0].record.lowWeeks; delete s.crew[0].record.wasElite;
  const st = await importSave({ text: () => Promise.resolve(JSON.stringify(s)) });
  const op = st.crew[0];
  assert.equal(op.record.jobs, 8); assert.deepEqual(op.record.milestones, ['firstAtLevel']);
  assert.equal(op.standing, 24); assert.equal(op.fame, 'known');
  assert.equal(op.record.lowWeeks, 0); assert.equal(op.record.wasElite, false);
});

test('standingOf and fameOf read defaults without storing', () => {
  const op = {};
  assert.equal(standingOf(op), 0); assert.equal(fameOf(op), 'unknown');
  assert.deepEqual(op, {});
});
