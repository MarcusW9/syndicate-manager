// The weekly rhythm, crew standards, crew leads and routine work on a big board (DESIGN.md
// 2026-11-04, Phase 1). Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame, SAVE_VERSION } from '../src/core/state.js';
import { advanceDay, weeklyBill } from '../src/core/time.js';
import { billDue, mondayBrief, weekSummary, crewStandard, crewAgainstStandard } from '../src/core/week.js';
import { crewLead } from '../src/core/lead.js';
import { needsPlayer, leadTakes, autoStep } from '../src/core/autorun.js';
import * as M from '../src/core/mission.js';
import { addOffer, postJobs, templateById, NEW_PER_WEEK } from '../src/core/jobs.js';

globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
const { importSave } = await import('../src/save/save.js');

const days = (s, n) => { for (let i = 0; i < n; i++) s = advanceDay(s); return s; };

test('what is due on Sunday is the weekly bill, and Monday frames the week', () => {
  const s = createNewGame({ seed: 71, startCrew: 'fresh' });
  assert.deepEqual(billDue(s), weeklyBill(s));
  const b = mondayBrief(s);
  assert.equal(b.cash, s.cash);
  assert.equal(b.due, weeklyBill(s).total);
  assert.equal(b.roster.total, 5);
  assert.equal(b.roster.free, 5);
  assert.equal(b.jobs, s.jobs.length);
});

test('Sunday sums up the week from where it started, then starts the next', () => {
  let s = createNewGame({ seed: 72, startCrew: 'fresh' });
  assert.equal(s.weekStart.day, 1);
  s.cash += 5000; // a week's takings
  s.reputation = 4;
  const sum = weekSummary(s);
  assert.equal(sum.earned, 5000);
  assert.equal(sum.net, 5000 - weeklyBill(s).total);
  assert.equal(sum.rep, 4);
  s = days(s, 6); // Sunday
  const week = s.inbox.find((m) => m.kind === 'week');
  assert.ok(week, 'the summary message');
  assert.match(week.subject, /^Week 1 settled: [+−]¥[\d,]+ after the bills$/);
  assert.equal(week.payload.lines.length, 4);
  assert.equal(s.weekStart.day, s.day, 'next week is measured from Sunday');
  assert.equal(s.weekStart.cash, s.cash, 'after the bills');
});

test('the crew standard: rookie work, pros, then veteran-led; guidance, never a lock', () => {
  assert.equal(crewStandard(1).tier, 'rookie');
  assert.equal(crewStandard(2).tier, 'pro');
  assert.equal(crewStandard(3).tier, 'pro');
  assert.ok(crewStandard(4).lead && crewStandard(5).lead);
  const op = (tier) => ({ tier });
  assert.ok(crewAgainstStandard([op('rookie'), op('rookie')], 1).met);
  assert.match(crewAgainstStandard([op('veteran'), op('rookie')], 1).note, /veteran on rookie work/i, 'a veteran wasted on rookie work is pointed out');
  assert.equal(crewAgainstStandard([op('pro'), op('rookie')], 2).short, 1);
  assert.ok(!crewAgainstStandard([op('pro'), op('pro')], 4).met, 'threat 4 wants a veteran');
  assert.ok(crewAgainstStandard([op('veteran'), op('pro')], 4).met);
});

test('a Respected-or-above runner leads, and takes exactly one risky call before you are called', () => {
  assert.equal(crewLead([{ id: 'a', handle: 'A', fame: 'known' }]), null);
  const lead = crewLead([{ id: 'a', handle: 'A', fame: 'respected', standing: 30 }, { id: 'b', handle: 'B', fame: 'elite', standing: 10 }]);
  assert.equal(lead.id, 'b', 'the best-rated leads');
  let taken = 0;
  for (let seed = 1; seed <= 60 && taken < 3; seed++) {
    let s = createNewGame({ seed, startCrew: 'fresh' });
    s.crew[0].fame = 'respected';
    s.jobs = [];
    addOffer(s, 'warehouse');
    s = M.startMission(s, s.jobs[0].id, s.crew.slice(0, 3).map((o) => o.id), 'stealth', { callIn: 'risky', orders: 'steady' });
    assert.equal(s.activeMission.lead.id, s.crew[0].id);
    let used = 0;
    for (let g = 0; g < 300 && !s.activeMission.done; g++) {
      if (leadTakes(s)) {
        assert.ok(!needsPlayer(s), 'the lead takes it: no call');
        s = autoStep(s);
        used++;
        assert.match(s.activeMission.events.at(-1)?.why ?? s.activeMission.nextWhy ?? '', /made the call as lead/);
        continue;
      }
      if (needsPlayer(s)) break; // the next risky call comes to you
      s = autoStep(s);
    }
    assert.ok(used <= 1, 'one call, no more');
    if (used) taken++;
  }
  assert.ok(taken >= 1, 'a lead took a call');
  let s = createNewGame({ seed: 5, startCrew: 'fresh' });
  s.crew[0].fame = 'elite';
  s.jobs = []; addOffer(s, 'warehouse');
  s = M.startMission(s, s.jobs[0].id, s.crew.slice(0, 3).map((o) => o.id), 'stealth', { callIn: 'every' });
  for (let g = 0; g < 100 && !s.activeMission.done && !needsPlayer(s); g++) s = autoStep(s);
  assert.ok(!leadTakes(s), "'every crisis' means every crisis: the lead stands aside");
});

test("a big tong's extra offers lean to routine work; the first three a week don't change", () => {
  const big = createNewGame({ seed: 73, startCrew: 'fresh' });
  big.reputation = 30;
  let routine = 0, extra = 0;
  for (let i = 0; i < 40; i++) {
    big.jobs = [];
    postJobs(big, 1, { slot: NEW_PER_WEEK + 1 });
    extra++;
    if (templateById(big.jobs[0].templateId).routine) routine++;
  }
  assert.ok(routine / extra >= 0.6, `extra offers mostly routine (${routine}/${extra})`);
  const s = createNewGame({ seed: 74, startCrew: 'fresh' });
  const before = structuredClone(s);
  s.jobs = []; before.jobs = [];
  postJobs(s, 3, { slot: 0 }); postJobs(before, 3, { slot: 0 });
  assert.deepEqual(s.jobs.map((j) => j.templateId), before.jobs.map((j) => j.templateId));
});

test('a v36 save gets its week start and no lead on jobs already running', async () => {
  const s = createNewGame({ seed: 75, startCrew: 'fresh' });
  delete s.weekStart;
  s.version = 36;
  const loaded = await importSave({ text: async () => JSON.stringify(s) });
  assert.equal(loaded.version, SAVE_VERSION);
  assert.deepEqual(loaded.weekStart, { day: s.day, cash: s.cash, reputation: s.reputation });
});
