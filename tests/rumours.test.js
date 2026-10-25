// Street talk (DESIGN.md, 2026-10-25): one true rumour a week, plus the city
// reacting to some of your jobs.

import test from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame, SAVE_VERSION } from '../src/core/state.js';
import { advanceDay } from '../src/core/time.js';
import { jobView, templateById, addOffer } from '../src/core/jobs.js';
import { activeRumour, rumourById } from '../src/core/rumours.js';
import { RUMOURS } from '../src/data/rumours.js';
import { DISTRICT_CRISES } from '../src/data/districtCrises.js';
import { NAMES } from '../src/config/names.js';
import { importSave } from '../src/save/save.js';
import * as M from '../src/core/mission.js';
import { playMission, carefulPolicy } from './play.js';

const asFile = (obj) => ({ text: async () => JSON.stringify(obj) });
const days = (s, n) => { for (let i = 0; i < n; i++) s = advanceDay(s); return s; };

test('every rumour names an open district and a real effect', () => {
  for (const r of RUMOURS) {
    assert.ok(r.district in NAMES.districts, `${r.id}: district`);
    assert.ok(r.text && r.tag, `${r.id}: text and tag`);
    assert.ok((r.threat === 1 || r.threat === -1) !== Boolean(r.crisis), `${r.id}: exactly one effect`);
    if (r.crisis) assert.ok(DISTRICT_CRISES[r.district].some((c) => c.id === r.crisis), `${r.id}: crisis ${r.crisis} is in ${r.district}`);
  }
});

test('a rumour goes round every Monday, lasts until Sunday, and never repeats twice running', () => {
  let s = createNewGame({ seed: 5 });
  assert.equal(activeRumour(s), null, 'no rumour on day 1: the opening board stays as designed');
  let last = null;
  for (let week = 0; week < 30; week++) {
    s = days(s, 7); // the next Monday
    const r = activeRumour(s);
    assert.ok(r, `week ${week}: a rumour`);
    assert.notEqual(r.id, last, `week ${week}: repeated`);
    assert.ok(s.inbox.some((m) => m.id === `rumour-${s.day}` && m.type === 'rumour'), `week ${week}: inbox message`);
    assert.equal(s.rumour.until, s.day + 6);
    last = r.id;
  }
  assert.equal(activeRumour(s, s.day + 7), null, 'gone after Sunday');
});

test('a threat rumour shifts jobs in its district by one step, and the roll uses what the board shows', () => {
  for (const r of RUMOURS.filter((x) => x.threat)) {
    const s = createNewGame({ seed: 1 });
    for (const tpl of ['courier', 'data_pull', 'warehouse', 'kidnap', 'casino', 'penthouse', 'protection']) if (!s.jobs.some((j) => j.templateId === tpl)) addOffer(s, tpl);
    const before = Object.fromEntries(s.jobs.map((j) => [j.id, jobView(s, j).threat]));
    s.rumour = { id: r.id, until: s.day + 6 };
    for (const j of s.jobs) {
      const v = jobView(s, j);
      const tpl = templateById(j.templateId);
      const expected = tpl.district === r.district ? Math.max(1, Math.min(5, before[j.id] + r.threat)) : before[j.id];
      assert.equal(v.threat, expected, `${r.id} on ${tpl.id}`);
      assert.equal(Boolean(v.rumour), tpl.district === r.district);
      const started = M.startMission(s, j.id, s.crew.slice(0, tpl.crewSize).map((o) => o.id), 'stealth');
      assert.equal(started.activeMission.threat, v.threat, `${r.id} on ${tpl.id}: shown = used`);
    }
  }
});

test('a crisis rumour makes its crisis likely on jobs in that district', () => {
  const r = rumourById('dk_checks');
  let withTalk = 0, without = 0;
  for (let seed = 1; seed <= 300; seed++) {
    for (const talk of [true, false]) {
      const s = createNewGame({ seed });
      if (talk) s.rumour = { id: r.id, until: s.day + 6 };
      const job = s.jobs.find((j) => j.templateId === 'warehouse');
      const started = M.startMission(s, job.id, s.crew.slice(0, 4).map((o) => o.id), 'stealth');
      const drawn = started.activeMission.queue.some((q) => q.id === r.crisis);
      if (drawn) talk ? withTalk++ : without++;
    }
  }
  assert.ok(withTalk / 300 > 0.6, `with street talk: ${withTalk}/300`);
  assert.ok(without / 300 < 0.45, `without: ${without}/300`);
});

test('the city sometimes talks about a loud job, never about an aborted one', () => {
  let talked = 0;
  for (let seed = 1; seed <= 100; seed++) {
    const s = createNewGame({ seed });
    const job = s.jobs.find((j) => j.templateId === 'courier');
    const done = playMission(M.startMission(s, job.id, s.crew.slice(0, 2).map((o) => o.id), 'loud'), carefulPolicy).state;
    const am = done.activeMission;
    const talk = done.inbox.find((m) => m.type === 'rumour');
    if (am.aborted || am.result.deaths.length) assert.equal(talk, undefined, `seed ${seed}: talk after an abort`);
    else if (talk) { talked++; assert.match(talk.body, /Data Courier Run/); }
  }
  assert.ok(talked > 20 && talked < 80, `talked after ${talked}/100 loud jobs`);
  const s = createNewGame({ seed: 3 });
  const job = s.jobs.find((j) => j.templateId === 'courier');
  const aborted = playMission(M.startMission(s, job.id, s.crew.slice(0, 2).map((o) => o.id), 'loud'), { critical: () => 'extract', crisis: (c) => c.find((x) => x.kind === 'abort') }).state;
  assert.ok(!aborted.inbox.some((m) => m.type === 'rumour'));
});

test('a v10 save upgrades with no rumour going round', async () => {
  const v10 = createNewGame({ seed: 4 });
  delete v10.rumour;
  v10.version = 10;
  const loaded = await importSave(asFile(v10));
  assert.equal(loaded.version, SAVE_VERSION);
  assert.equal(loaded.rumour, null);
});
