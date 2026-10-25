// Job variety: clients and trust, offer variations, hidden twists. Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame, SAVE_VERSION } from '../src/core/state.js';
import { advanceDay } from '../src/core/time.js';
import * as M from '../src/core/mission.js';
import { addOffer, jobView, refreshJobs, templateById, TWIST_CHANCE } from '../src/core/jobs.js';
import { adjustTrust, trustOf, driftTrust, WONT_CALL } from '../src/core/clients.js';
import { makeRng } from '../src/core/rng.js';
import { MISSIONS } from '../src/data/missions.js';
import { TWISTS } from '../src/data/twists.js';
import { CLIENTS } from '../src/data/clients.js';
import { validateMissions } from '../src/core/validate.js';
import { playMission, carefulPolicy } from './play.js';

globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
const { importSave } = await import('../src/save/save.js');

const offers = (n, seed = 1) => {
  const s = createNewGame({ seed });
  s.jobs = [];
  const rng = makeRng(seed);
  for (let i = 0; i < n; i++) addOffer(s, MISSIONS[i % MISSIONS.length].id, { rng, clientId: 'fung' });
  return s;
};

test('twists follow the same rules as every crisis', () => {
  assert.deepEqual(validateMissions([{ id: 'twists', beats: ['x'], crises: TWISTS }]), []);
  for (const t of TWISTS) assert.ok(t.name, `${t.id} has a name for the "Twist:" line`);
});

test('every client offers only job types that exist', () => {
  for (const c of CLIENTS) for (const j of c.jobs) assert.ok(templateById(j), `${c.id} offers unknown job ${j}`);
  // Walk-in work (2026-10-25) is the one exception: it has no client on purpose.
  for (const m of MISSIONS) assert.ok(m.walkIn ? !CLIENTS.some((c) => c.jobs.includes(m.id)) : CLIENTS.some((c) => c.jobs.includes(m.id)), `${m.id}: client or walk-in, not neither`);
});

test('offers vary pay by up to 25% and threat by at most 1, staying on the 1-5 scale', () => {
  const s = offers(3000);
  for (const j of s.jobs) {
    assert.ok(j.payMult >= 0.75 && j.payMult <= 1.25, `payMult ${j.payMult}`);
    assert.ok([-1, 0, 1].includes(j.threatDelta));
    const t = templateById(j.templateId).threat + j.threatDelta;
    assert.ok(t >= 1 && t <= 5, `threat ${t}`);
  }
  assert.ok(new Set(s.jobs.map((j) => j.payMult)).size > 5, 'pay actually varies');
});

test('about 1 in 4 jobs has a twist; the hint is usually right but not always', () => {
  const s = offers(4000, 2);
  const twisted = s.jobs.filter((j) => j.twist);
  const rate = twisted.length / s.jobs.length;
  assert.ok(Math.abs(rate - TWIST_CHANCE) < 0.04, `twist rate ${rate}`);
  const hintedTwist = twisted.filter((j) => j.hinted).length / twisted.length;
  const clean = s.jobs.filter((j) => !j.twist);
  const falseHint = clean.filter((j) => j.hinted).length / clean.length;
  assert.ok(hintedTwist > 0.7 && hintedTwist < 0.9, `hinted twists ${hintedTwist}`);
  assert.ok(falseHint > 0.05 && falseHint < 0.15, `false hints ${falseHint}`);
});

test('a twist shows up during the job and is announced', () => {
  let s = createNewGame({ seed: 3 });
  s.jobs = [];
  addOffer(s, 'courier', { clientId: 'fung' });
  s.jobs[0].twist = 'twist_tipoff';
  s = M.startMission(s, s.jobs[0].id, ['teo', 'mei'], 'stealth');
  assert.ok(s.activeMission.queue.some((q) => q.twist && q.id === 'twist_tipoff'));
  assert.notEqual(s.activeMission.queue[0].twist, true, 'never before the first beat');
  const { state } = playMission(s, carefulPolicy);
  assert.ok(state.activeMission.log.some((e) => e.kind === 'twist' && e.text.includes('Police tip-off')) || state.activeMission.aborted);
});

test('a hotter job makes every roll harder; a quieter one easier', () => {
  const chanceAt = (delta) => {
    let s = createNewGame({ seed: 4 });
    s.jobs = [];
    addOffer(s, 'courier', { clientId: 'fung' });
    s.jobs[0].threatDelta = delta;
    s = M.startMission(s, s.jobs[0].id, ['teo', 'mei'], 'stealth');
    Object.assign(s.activeMission, { queue: [{ type: 'crisis', id: 'tail' }], step: 0, focusOp: 'teo' });
    return M.describeCrisis(s).choices.find((c) => c.id === 'lose').risk;
  };
  const order = ['low', 'moderate', 'high', 'extreme'];
  assert.ok(order.indexOf(chanceAt(1)) >= order.indexOf(chanceAt(-1)));
});

test('bonus pay is only paid when the risky choice works', () => {
  for (let seed = 1; seed <= 200; seed++) {
    let s = createNewGame({ seed });
    s.jobs = [];
    addOffer(s, 'casino', { clientId: 'rao' });
    s = M.startMission(s, s.jobs[0].id, ['wing', 'cherry', 'teo'], 'stealth');
    Object.assign(s.activeMission, { queue: [{ type: 'crisis', id: 'big_hand' }, { type: 'beat', index: 0 }], step: 0 });
    const after = M.chooseOption(s, 'all_in').activeMission;
    const won = after.log.some((e) => e.kind === 'good');
    assert.equal(after.payCut, won ? -0.4 : 0.8, `seed ${seed}`);
  }
});

test('clients: finished jobs build trust, "client unhappy" choices cost it', () => {
  let s = createNewGame({ seed: 5 });
  const job = s.jobs.find((j) => j.templateId === 'courier');
  const client = job.clientId;
  const before = trustOf(s, client);
  s = M.startMission(s, job.id, ['teo', 'mei'], 'stealth');
  const done = playMission(s, { critical: () => 'extract', crisis: (c) => c.find((x) => x.kind === 'abort') }).state;
  assert.ok(trustOf(done, client) < before, 'aborting a job with a client-unhappy cost loses trust');

  let t = createNewGame({ seed: 6 });
  const j2 = t.jobs.find((j) => j.templateId === 'courier');
  t = M.startMission(t, j2.id, ['teo', 'mei'], 'stealth');
  const clean = { critical: () => 'extract', crisis: (c) => c.find((x) => x.risk === 'certain') ?? c.filter((x) => x.kind !== 'abort').sort((a, b) => a.label.length - b.label.length)[0] };
  const r = playMission(t, clean).state;
  if (!r.activeMission.aborted) assert.ok(trustOf(r, j2.clientId) > trustOf(t, j2.clientId), 'a finished job builds trust');
});

test('trust changes pay, and a client below 20 stops calling', () => {
  const s = createNewGame({ seed: 7 });
  const job = s.jobs[0];
  const base = jobView(s, job).pay;
  adjustTrust(s, job.clientId, 40); // 90
  assert.ok(jobView(s, job).pay > base);
  adjustTrust(s, job.clientId, -80); // 10
  assert.ok(jobView(s, job).pay < base);
  for (const c of CLIENTS) adjustTrust(s, c.id, c.id === 'fung' ? 0 : -100);
  adjustTrust(s, 'fung', 50 - trustOf(s, 'fung'));
  s.jobs = [];
  for (let i = 0; i < 20; i++) { s.day += 7; refreshJobs(s); s.jobs = []; }
  // Others drifted up a little but stay below WONT_CALL for a while; only fung should be calling at first.
  const t = createNewGame({ seed: 8 });
  for (const c of CLIENTS) if (c.id !== 'okonkwo') adjustTrust(t, c.id, -100);
  t.jobs = [];
  refreshJobs(t);
  for (const j of t.jobs) assert.equal(j.clientId, 'okonkwo');
  assert.ok(trustOf(t, 'fung') < WONT_CALL);
});

test('trust drifts back towards neutral each week', () => {
  const s = createNewGame({ seed: 9 });
  adjustTrust(s, 'szeto', -40); // 10
  adjustTrust(s, 'rao', 40); // 90
  driftTrust(s);
  assert.equal(trustOf(s, 'szeto'), 12);
  assert.equal(trustOf(s, 'rao'), 88);
});

test('a v4 save upgrades to v5; old job offers still work', async () => {
  const v4 = createNewGame({ seed: 10 });
  delete v4.clients;
  v4.version = 4;
  for (const j of v4.jobs) { delete j.clientId; delete j.payMult; delete j.threatDelta; delete j.twist; delete j.hinted; }
  const loaded = await importSave({ text: async () => JSON.stringify(v4) });
  assert.equal(loaded.version, SAVE_VERSION);
  assert.deepEqual(loaded.clients, {});
  const v = jobView(loaded, loaded.jobs[0]);
  assert.equal(v.pay, templateById(loaded.jobs[0].templateId).pay);
  assert.equal(v.client, null);
  const s = M.startMission(loaded, loaded.jobs[0].id, ['teo', 'mei', 'jax', 'wing'].slice(0, templateById(loaded.jobs[0].templateId).crewSize), 'stealth');
  assert.ok(playMission(s, carefulPolicy).state.activeMission.done);
});

test('weekly job refresh keeps working for a whole season', () => {
  let s = createNewGame({ seed: 11 });
  for (let d = 0; d < 364; d++) s = advanceDay(s);
  assert.ok(s.jobs.length > 0 && s.jobs.length <= 4);
});

// Job gates (PLAN-PROGRESSION.md, 2026-10-25): a new crew is only offered work its name has earned.
test('job gates: a new crew is only offered jobs its reputation has unlocked', async () => {
  const { JOB_GATES, jobGate, nextUnlock } = await import('../src/core/jobs.js');
  for (const rep of [0, 9, 10, 15, 40, 79, 80]) {
    const s = createNewGame({ seed: 11, startCrew: 'fresh' });
    s.reputation = rep;
    const seen = new Set();
    for (let i = 0; i < 40; i++) { s.day += 7; s.jobs = []; refreshJobs(s); for (const j of s.jobs) seen.add(j.templateId); }
    for (const id of seen) assert.ok(jobGate(id) <= rep, `rep ${rep} was offered ${id}`);
    assert.ok([...seen].some((id) => templateById(id).rookie), `rep ${rep}: rookie work still turns up`);
    const top = Math.max(0, ...Object.entries(JOB_GATES).filter(([, g]) => g <= rep).map(([t]) => Number(t)));
    if (top) assert.ok([...seen].some((id) => !templateById(id).rookie && templateById(id).threat === top), `rep ${rep}: threat ${top} work turns up`);
    assert.deepEqual(nextUnlock(s), rep >= 80 ? null : { threat: top + 1, rep: JOB_GATES[top + 1] });
  }
});

test('job gates: games started before them keep an open board', () => {
  const s = createNewGame({ seed: 12 });
  assert.equal(s.jobGates, false);
  const seen = new Set();
  for (let i = 0; i < 40; i++) { s.day += 7; s.jobs = []; refreshJobs(s); for (const j of s.jobs) seen.add(templateById(j.templateId).threat); }
  assert.ok(seen.has(4) && seen.has(5), 'big work is still offered at reputation 0');
});

test('the board adds up to 3 new jobs a week and holds up to 5', async () => {
  const { MAX_OFFERS, NEW_PER_WEEK } = await import('../src/core/jobs.js');
  const s = createNewGame({ seed: 13, startCrew: 'fresh' });
  s.jobs = [];
  refreshJobs(s);
  assert.equal(s.jobs.length, NEW_PER_WEEK);
  s.day += 1; refreshJobs(s);
  assert.equal(s.jobs.length, MAX_OFFERS);
});

test('a finished job earns REP_PER_THREAT per threat level; an abort costs ABORT_REP', async () => {
  const M = await import('../src/core/mission.js');
  const { playMission, carefulPolicy } = await import('./play.js');
  const s = createNewGame({ seed: 21, startCrew: 'fresh' });
  const job = s.jobs[0];
  const done = playMission(M.startMission(s, job.id, s.crew.slice(0, 2).map((o) => o.id), 'stealth'), carefulPolicy).state;
  const threat = done.activeMission.threat;
  const expected = done.activeMission.aborted ? 0 : threat * M.REP_PER_THREAT;
  assert.equal(done.reputation, Math.round(expected * 10) / 10);
  assert.equal(M.REP_PER_THREAT, 0.75, 'tuned 2026-10-25 for the long climb (PLAN-PROGRESSION.md)');
});
