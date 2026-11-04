// Fame's payoffs (renown slice 4, 2026-11-04): named offers, the fame pay ask, better recruits
// with an Elite on the crew. None of them touches a roll or the planning read, and their own rolls
// are hashes, so the saved counter (state.rngCounter) never moves for them. Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame, SAVE_VERSION } from '../src/core/state.js';
import * as M from '../src/core/mission.js';
import { addOffer, nameAnOffer, namedWeek, namedCandidate, jobView } from '../src/core/jobs.js';
import { advanceDay } from '../src/core/time.js';
import { freshRecord } from '../src/core/record.js';
import { fameRaise, fameRaiseChance, weeklyFame } from '../src/core/fame.js';
import { recruitQualities, generateRecruit } from '../src/core/recruits.js';
import { resolveDecision } from '../src/core/decisions.js';
import { planRead } from '../src/core/squad.js';
import { NAMED_OFFER, FAME_RAISE, ELITE_RECRUIT_WEIGHTS } from '../src/data/fame.js';
import { hash } from '../src/core/rng.js';
import { playMission, carefulPolicy } from './play.js';

globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
const { importSave } = await import('../src/save/save.js');

const game = (seed = 1) => createNewGame({ seed, startCrew: 'fresh' });
const makeElite = (op, standing = 80) => Object.assign(op, { fame: 'elite', standing, record: { ...freshRecord(), jobs: 70, atLevel: 65, activeWeeks: 20, clean: 20, bestCleanStreak: 6 } });
const clientJob = (s) => s.jobs.find((j) => j.clientId && !j.rookie);
// Find a game day inside a week the hash picks for a named offer (one in five weeks).
const namedDay = (s) => { for (let d = s.day; d < s.day + 400; d += 7) if (namedWeek(s, d)) return d; throw new Error('no named week'); };

test('hash: stable, and different keys give different numbers', () => {
  assert.equal(hash(1, 'a', 2), hash(1, 'a', 2));
  assert.notEqual(hash(1, 'a', 2), hash(1, 'a', 3));
  assert.ok(Number.isInteger(hash('x')) && hash('x') >= 0);
});

test('named weeks come about one in five', () => {
  const s = game(1);
  let n = 0;
  for (let w = 0; w < 1000; w++) if (namedWeek(s, 1 + w * 7)) n++;
  assert.ok(n > 150 && n < 250, `${n} named weeks in 1000`);
  assert.equal(NAMED_OFFER.chance, 0.2);
});

test('a named offer asks for the best-rated Elite with standing 50+, once a week, on client work only', () => {
  const s = game(2); s.day = namedDay(s);
  const [a, b, c] = s.crew;
  s.jobs = []; addOffer(s, 'container409'); addOffer(s, 'courier'); // rookie work, then client work (courier)
  assert.equal(nameAnOffer(s, s.jobs), null, 'nobody Elite: no named offer');
  makeElite(a, 49);
  assert.equal(nameAnOffer(s, s.jobs), null, 'standing under 50');
  makeElite(b, 60); makeElite(c, 90);
  assert.equal(namedCandidate(s).id, c.id, 'the highest standing');
  const job = nameAnOffer(s, s.jobs);
  assert.ok(job, 'named');
  assert.equal(job.askedFor, c.id);
  assert.ok(job.clientId, 'client work');
  assert.ok(s.inbox.some((m) => m.id === `named-${job.id}`));
  assert.equal(jobView(s, job).askedFor, c.id);
  addOffer(s, 'courier');
  assert.equal(nameAnOffer(s, s.jobs.slice(-1)), null, 'one a week at most');
  // A week the hash doesn't pick: nothing.
  const t = game(2); makeElite(t.crew[0]);
  let d = t.day; while (namedWeek(t, d)) d += 7;
  t.day = d; t.jobs = []; addOffer(t, 'courier');
  assert.equal(nameAnOffer(t, t.jobs), null);
});

test('named offers move no roll: the board and the saved counter are the same with or without an Elite', () => {
  let x = game(3), y = structuredClone(x);
  makeElite(y.crew[0], 95);
  for (let i = 0; i < 70; i++) { x = advanceDay(x); y = advanceDay(y); y.crew[0].standing = 95; y.crew[0].record.lastJobDay = y.day; }
  const strip = (jobs) => jobs.map(({ askedFor, ...j }) => j);
  assert.deepEqual(strip(y.jobs), strip(x.jobs));
  assert.equal(y.rngCounter, x.rngCounter);
});

test('the named runner on the job adds 15% to the pay; without them it pays as usual', async () => {
  const play = (named, crewPick = (s) => s.crew.slice(0, 2).map((o) => o.id)) => {
    let s = game(4); s.jobs = []; addOffer(s, 'courier');
    const ids = crewPick(s);
    s.jobs[0].askedFor = named(s, ids);
    s = M.startMission(s, s.jobs[0].id, ids, 'stealth');
    return playMission(s, carefulPolicy).state;
  };
  const plain = play(() => null);
  const withThem = play((s, ids) => ids[0]);
  const without = play((s) => s.crew[4].id);
  assert.deepEqual(withThem.activeMission.events, plain.activeMission.events, 'the same job, roll for roll');
  const base = plain.activeMission.result.pay;
  const payCut = plain.activeMission.payCut;
  assert.equal(without.activeMission.result.pay, base, 'named runner not on the job: usual pay');
  const expected = Math.round((plain.activeMission.pay * (1 + NAMED_OFFER.payBonus) * Math.max(0, 1 - payCut)) / 50) * 50;
  assert.equal(withThem.activeMission.result.pay, expected);
  if (payCut < 1) assert.ok(withThem.activeMission.result.pay > base);
  const report = withThem.inbox.find((m) => m.type === 'report');
  assert.ok(report.timeline.outcome.some((o) => /by name: \+15% pay/.test(o.text)));
  // Hands-off: the same.
  const { sendOff } = await import('../src/core/autorun.js');
  let h = game(5); h.jobs = []; addOffer(h, 'container409'); // hands-off is allowed here; the bonus reads only am.askedFor
  const hid = h.crew.slice(0, 2).map((o) => o.id);
  h.jobs[0].askedFor = hid[1];
  h = sendOff(h, h.jobs[0].id, hid, 'stealth', 'steady');
  assert.equal(h.awayJobs.length, 1, 'sent off');
  assert.equal(h.awayJobs[0].mission.askedFor, hid[1]);
  for (let i = 0; i < 12 && h.awayJobs.length; i++) h = advanceDay(h);
  const rep = h.inbox.find((m) => m.type === 'report');
  assert.ok(rep, 'the crew came back');
  const paid = rep.timeline.outcome.find((o) => /^Paid /.test(o.text)).text;
  if (paid !== 'Paid ¥0.') assert.ok(rep.timeline.outcome.some((o) => /by name: \+15% pay/.test(o.text)), 'hands-off runs earn the bonus too');
});

test('a named offer does not change the planning read', () => {
  const s = game(6); s.jobs = []; addOffer(s, 'courier');
  const crew = s.crew.slice(0, 2);
  const same = (x) => JSON.stringify(x, (k, v) => (v && typeof v === 'object' && v.stats && v.handle ? `op:${v.id}` : v));
  const before = same(planRead(s, s.jobs[0], { crew, approach: 'stealth' }));
  s.jobs[0].askedFor = crew[0].id;
  assert.equal(same(planRead(s, s.jobs[0], { crew, approach: 'stealth' })), before);
});

test('fame pay ask: 35% base, greedy more, loyal less', () => {
  assert.equal(fameRaiseChance({ traits: [] }), 0.35);
  assert.equal(fameRaiseChance({ traits: ['greedy'] }), 0.35 * FAME_RAISE.greedy);
  assert.equal(fameRaiseChance({ traits: ['loyal'] }), 0.35 * FAME_RAISE.loyal);
  // Over many runners and days, the hash comes out near the chance.
  const s = game(7);
  const rate = (traits) => {
    let asked = 0;
    for (let i = 0; i < 600; i++) {
      const t = structuredClone(s); const op = t.crew[0];
      Object.assign(op, { id: `t${i}`, traits, wage: 400 });
      if (fameRaise(t, op)) asked++;
    }
    return asked / 600;
  };
  const [plain, greedy, loyal] = [rate([]), rate(['greedy']), rate(['loyal'])];
  assert.ok(Math.abs(plain - 0.35) < 0.07, `plain ${plain}`);
  assert.ok(Math.abs(greedy - 0.525) < 0.07, `greedy ${greedy}`);
  assert.ok(Math.abs(loyal - 0.175) < 0.06, `loyal ${loyal}`);
});

test('fame pay ask: the usual pay-rise message, a random step of the wage, and no roll moves', () => {
  const s = game(8); const op = s.crew[0]; op.wage = 400;
  let t = null, ask = null;
  for (let day = 1; day < 300 && !ask; day++) { t = structuredClone(s); t.day = day; ask = fameRaise(t, t.crew[0]); }
  assert.ok(ask, 'expected an ask within 300 days');
  assert.equal(t.rngCounter, s.rngCounter);
  assert.ok(FAME_RAISE.steps.map((m) => Math.round((400 * m) / 50) * 50).includes(ask), `ask ${ask}`);
  const msg = t.inbox.find((m) => m.kind === 'renewal');
  assert.equal(msg.payload.reason, 'fame'); assert.equal(msg.payload.ask, ask); assert.ok(msg.blocking);
  assert.deepEqual(msg.options.map((o) => o.id), ['accept', 'haggle', 'refuse']);
  assert.equal(fameRaise(t, t.crew[0]), null, 'not while one is waiting');
  const accepted = resolveDecision(t, msg.id, 'accept');
  assert.equal(accepted.crew[0].wage, ask);
  const refused = resolveDecision(t, msg.id, 'refuse');
  assert.ok(refused.crew[0].status.some((x) => x.id === 'unhappy'));
});

test('the ask comes only the first time someone becomes Elite, and never for a freelancer', () => {
  const s = game(9);
  let firsts = 0, backs = 0;
  for (let i = 0; i < 200; i++) {
    for (const back of [false, true]) {
      const t = structuredClone(s); const op = t.crew[0];
      Object.assign(op, { id: `e${i}`, fame: 'respected', standing: 80, record: { ...freshRecord(), jobs: 70, atLevel: 65, activeWeeks: 20, clean: 20, bestCleanStreak: 6, lastJobDay: t.day, wasElite: back } });
      weeklyFame(t);
      assert.equal(t.crew[0].fame, 'elite');
      const asked = t.inbox.some((m) => m.kind === 'renewal' && m.payload.reason === 'fame');
      if (back) backs += asked; else firsts += asked;
    }
  }
  assert.ok(firsts > 40, `first-time asks ${firsts} of 200`);
  assert.equal(backs, 0, 'winning Elite back brings no new ask');
  const f = game(10); Object.assign(f.crew[0], { freelance: true });
  for (let d = 1; d < 50; d++) { f.day = d; assert.equal(fameRaise(f, f.crew[0]), null); }
});

test('recruits: better leads with an Elite on the crew (a freelancer Elite does not count)', () => {
  const s = game(11);
  const w = (st) => Object.fromEntries(recruitQualities(st).map((q) => [q.id, q.weight]));
  assert.deepEqual(w(s), { rookie: 50, pro: 38, veteran: 12 });
  makeElite(s.crew[0]);
  assert.deepEqual(w(s), ELITE_RECRUIT_WEIGHTS);
  const f = game(11); makeElite(f.crew[0]); f.crew[0].freelance = true;
  assert.deepEqual(w(f), { rookie: 50, pro: 38, veteran: 12 });
  // The same draws either way: the counter moves the same, the quality shifts.
  const share = (st) => { const t = structuredClone(st); let vets = 0; for (let i = 0; i < 1500; i++) if (generateRecruit(t).quality === 'veteran') vets++; return [vets / 1500, t.rngCounter]; };
  const [plainVets, plainCounter] = share(game(11));
  const [eliteVets, eliteCounter] = share(s);
  assert.equal(eliteCounter, plainCounter);
  assert.ok(plainVets > 0.08 && plainVets < 0.16, `plain ${plainVets}`);
  assert.ok(eliteVets > 0.12 && eliteVets < 0.2, `elite ${eliteVets}`);
});

test('save v33: offers, runs and pay asks gain their fields', async () => {
  const s = game(12); s.version = 32;
  s.jobs = []; addOffer(s, 'courier'); delete s.jobs[0].askedFor;
  s.inbox.unshift({ id: 'r1', kind: 'renewal', payload: { opId: s.crew[0].id, ask: 500 }, options: [], blocking: true, resolved: false });
  const st = await importSave({ text: () => Promise.resolve(JSON.stringify(s)) });
  assert.equal(st.version, SAVE_VERSION);
  assert.ok(SAVE_VERSION >= 33);
  assert.equal(st.jobs[0].askedFor, null);
  assert.equal(st.namedOfferWeek, null);
  assert.equal(st.inbox.find((m) => m.id === 'r1').payload.reason, 'growth');
});
