// Planning a squad (PLAN-CORE-LOOP.md, slice 2): the coverage read tells the truth, and Joss's
// picks are a sound squad. Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame } from '../src/core/state.js';
import * as M from '../src/core/mission.js';
import { addOffer, templateById, jobView } from '../src/core/jobs.js';
import { availability } from '../src/core/crew.js';
import { coverage, jossPicks, likelyIncidents } from '../src/core/squad.js';
import { ZONE_POOLS } from '../src/data/incidents.js';
import { APPROACHES } from '../src/data/approaches.js';

const APPROACH_IDS = Object.keys(APPROACHES);

function offer(seed, templateId) {
  const s = createNewGame({ seed, startCrew: 'fresh' });
  s.jobs = [];
  addOffer(s, templateId);
  return s;
}

/** Step a fresh job to its first incident and roll it. */
function firstIncident(s, crewIds, approach) {
  let st = M.startMission(s, s.jobs[0].id, crewIds, approach);
  while (M.currentStep(st.activeMission)?.type !== 'incident') {
    const t = M.currentStep(st.activeMission).type;
    st = t === 'zone' ? M.enterZone(st) : M.revealBeat(st);
  }
  const id = M.currentStep(st.activeMission).id;
  st = M.runIncident(st);
  return { id, event: st.activeMission.events.find((e) => e.incident) };
}

test('the coverage read lists every incident each approach can meet, once', () => {
  for (const a of APPROACH_IDS) {
    const ids = likelyIncidents(a).map((r) => r.id);
    assert.equal(new Set(ids).size, ids.length, `${a}: no repeats`);
    for (const zone of Object.values(ZONE_POOLS)) for (const id of zone[a]) assert.ok(ids.includes(id), `${a}: ${id}`);
    assert.equal(ids.includes('guard'), true, `${a}: a guard up close is always possible`);
  }
});

test('shown risk equals used risk: the coverage row is the roll the first incident makes', () => {
  let checked = 0;
  for (let seed = 1; seed <= 40; seed++) {
    const approach = APPROACH_IDS[seed % 4];
    const s = offer(seed, 'container409');
    const tpl = templateById('container409');
    const crew = s.crew.slice(0, tpl.crewSize);
    const { id, event } = firstIncident(s, crew.map((o) => o.id), approach);
    const row = coverage(tpl, crew, approach, { threat: jobView(s, s.jobs[0]).threat }).rows.find((r) => r.id === id);
    assert.ok(row, `${approach}: ${id} is on the read`);
    assert.equal(event.actor.id, row.handler.op.id, `seed ${seed}: same handler`);
    assert.equal(event.value, row.handler.value, `seed ${seed}: same value`);
    assert.equal(event.need, 10 + row.diff, `seed ${seed}: same difficulty`);
    checked++;
  }
  assert.equal(checked, 40);
});

test('the read counts saves on danger incidents, and overwatch only where it can see', () => {
  const s = offer(3, 'container409');
  const tpl = templateById('container409');
  const crew = s.crew.slice(0, tpl.crewSize);
  const spare = s.crew[tpl.crewSize];
  const bare = coverage(tpl, crew, 'stealth').rows.find((r) => r.id === 'patrol');
  const rifle = coverage(tpl, crew, 'stealth', { overwatch: { op: spare, kit: 'rifle' } }).rows.find((r) => r.id === 'patrol');
  assert.ok(bare.danger && rifle.withSave, 'a patrol can be saved');
  assert.ok(rifle.withSave.chance > 0);
  const lock = coverage(tpl, crew, 'stealth', { overwatch: { op: spare, kit: 'rifle' } }).rows.find((r) => r.id === 'lock');
  assert.equal(lock.withSave, null, 'no saves on a safe incident');
  // The rifle can't see inside the target; the drone can.
  const hold = (kit) => coverage(tpl, [crew[0]], 'loud', { overwatch: { op: spare, kit } }).rows.find((r) => r.id === 'hold');
  assert.equal(hold('rifle').withSave, null, 'the rifle can\'t see the target with nobody else inside');
  assert.equal(hold('drone').withSave?.via, 'overwatch');
});

test('an empty squad is all gaps; extra bodies on a stealth run are flagged', () => {
  const s = offer(5, 'container409');
  const tpl = templateById('container409');
  const empty = coverage(tpl, [], 'stealth');
  assert.ok(empty.rows.every((r) => r.gap));
  const crowd = coverage(tpl, s.crew.slice(0, tpl.crewSize + 1), 'stealth');
  assert.equal(crowd.spotted, 1);
  assert.equal(coverage(tpl, s.crew.slice(0, tpl.crewSize + 1), 'loud').spotted, 0, 'loud runs don\'t care');
});

test('Joss picks a full inside team from free crew, never doubles anyone up, and overwatch only if it helps', () => {
  for (let seed = 1; seed <= 20; seed++) {
    const s = offer(seed, 'container409');
    const tpl = templateById('container409');
    const free = s.crew.filter((o) => availability(s, o).ok);
    for (const a of APPROACH_IDS) {
      const p = jossPicks(tpl, free, a);
      assert.equal(p.crew.length, Math.min(tpl.crewSize, free.length));
      assert.equal(new Set(p.crew).size, p.crew.length);
      if (p.overwatch) { assert.ok(!p.crew.includes(p.overwatch)); assert.ok(['rifle', 'drone'].includes(p.kit)); }
      // The picks start a real job.
      const st = M.startMission(s, s.jobs[0].id, p.crew, a, { overwatch: p.overwatch ? { id: p.overwatch, kit: p.kit } : null });
      assert.ok(st.activeMission, `seed ${seed} ${a}: the job starts`);
    }
  }
});

test('Joss covers the approach: his team handles its incidents at least as well as the first names on the list', () => {
  let better = 0; let total = 0;
  for (let seed = 1; seed <= 30; seed++) {
    const s = offer(seed, 'container409');
    const tpl = templateById('container409');
    for (const a of APPROACH_IDS) {
      const p = jossPicks(tpl, s.crew, a);
      const mean = (crew) => { const r = coverage(tpl, crew, a).rows; return r.reduce((n, x) => n + x.chance, 0) / r.length; };
      const joss = mean(s.crew.filter((o) => p.crew.includes(o.id)));
      const naive = mean(s.crew.slice(0, tpl.crewSize));
      total++;
      if (joss >= naive - 0.02) better++;
    }
  }
  assert.ok(better / total >= 0.9, `Joss at least matches a naive pick ${better}/${total}`);
});
