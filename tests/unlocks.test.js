// Choices unlocked by stats (owner's batch, 2026-10-26) and crises about a named person. Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame } from '../src/core/state.js';
import * as M from '../src/core/mission.js';
import { addOffer } from '../src/core/jobs.js';
import { MISSIONS } from '../src/data/missions.js';
import { autoRun } from '../src/core/autorun.js';

const unlocks = () => {
  const seen = new Map();
  for (const m of MISSIONS) for (const c of m.crises) for (const ch of c.choices) if (ch.requires?.kind === 'stat') seen.set(`${c.id}.${ch.id}`, { m, c, ch });
  return [...seen.values()];
};

/** Put the active job on a given crisis. */
function at(s, crisisId) {
  s.activeMission.queue = [{ type: 'crisis', id: crisisId }, { type: 'beat', index: 0 }];
  s.activeMission.step = 0;
  return s;
}

test('rookie jobs give every stat an unlock, and combat, driving and medical at least three', () => {
  const byStat = {};
  for (const { ch } of unlocks()) byStat[ch.requires.value] = (byStat[ch.requires.value] ?? 0) + 1;
  for (const st of ['combat', 'driving', 'medical']) assert.ok(byStat[st] >= 3, `${st}: ${byStat[st]}`);
  for (const st of ['tech', 'stealth', 'social', 'cool']) assert.ok(byStat[st] >= 2, `${st}: ${byStat[st]}`);
});

test("an unlock is worth it: easier than the crisis's other rolls, or it pays a bonus or dodges a cost", () => {
  for (const { c, ch } of unlocks()) {
    const others = c.choices.filter((x) => x !== ch && x.kind !== 'abort' && !x.sure);
    const easier = others.every((x) => ch.difficulty < x.difficulty);
    const bonus = (ch.successCost?.payCut ?? 0) < 0;
    const dodges = others.some((x) => x.cost || x.failureCost) && !ch.cost;
    assert.ok(easier || bonus || dodges, `${c.id}.${ch.id}`);
    assert.ok(['none', 'light'].includes(ch.failureInjury), `${c.id}.${ch.id}: rookie-job failures stay light`);
  }
});

test('an unlock shows greyed out with what it needs, and opens once someone has grown into it', () => {
  for (const { m, c, ch } of unlocks().slice(0, 17)) {
    let s = createNewGame({ seed: 5, startCrew: 'fresh' });
    s.jobs = []; addOffer(s, m.id);
    s = M.startMission(s, s.jobs[0].id, s.crew.slice(0, m.crewSize).map((o) => o.id), 'stealth');
    const { value, min } = ch.requires;
    for (const o of s.crew) o.stats[value] = Math.min(o.stats[value], min - 1);
    let view = M.describeCrisis(at(s, c.id)).choices.find((x) => x.id === ch.id);
    assert.equal(view.available, false, `${c.id}.${ch.id}`);
    assert.equal(view.reason, `Needs ${value} ${min}+`);
    s.crew[0].stats[value] = min;
    view = M.describeCrisis(at(s, c.id)).choices.find((x) => x.id === ch.id);
    assert.equal(view.available, true, `${c.id}.${ch.id} opens at ${value} ${min}`);
  }
});

test('a crisis that names someone is theirs to handle: they roll, the choice names them, and they take any knock', () => {
  let checked = 0;
  for (let seed = 1; seed <= 200 && checked < 40; seed++) {
    let s = createNewGame({ seed, startCrew: 'fresh' });
    s.jobs = []; addOffer(s, 'clinic');
    s = M.startMission(s, s.jobs[0].id, s.crew.slice(0, 3).map((o) => o.id), 'stealth');
    for (const crisis of ['old_classmate', 'faction_toll']) {
      const t = structuredClone(s);
      t.activeMission.focusOp = t.crew[seed % 3].id;
      at(t, crisis);
      const named = t.crew.find((o) => o.id === t.activeMission.focusOp).handle;
      const roll = M.describeCrisis(t).choices.find((x) => x.available && /\(\d+/.test(x.riskReason ?? ''));
      assert.ok(roll.riskReason.startsWith(`${named} on `), `${crisis}: ${roll.riskReason} should be ${named}`);
      assert.ok(roll.label.includes(named), `${crisis}: "${roll.label}" names ${named}`);
      const after = M.chooseOption(t, roll.id).activeMission.events.at(-1);
      assert.equal(after.actor.handle, named);
      if (after.injury) assert.equal(after.injury.handle, named);
      checked += 1;
    }
  }
  assert.ok(checked >= 40);
});

test('a hands-off crew can take an unlock when it has the stat', () => {
  let took = 0;
  for (let seed = 1; seed <= 150; seed++) {
    let s = createNewGame({ seed, startCrew: 'fresh' });
    for (const o of s.crew) for (const k of Object.keys(o.stats)) o.stats[k] = Math.max(o.stats[k], 13);
    s.jobs = []; addOffer(s, ['clinic', 'container409', 'delivery', 'eviction'][seed % 4]);
    s = M.startMission(s, s.jobs[0].id, s.crew.slice(0, 2).map((o) => o.id), 'stealth');
    const done = autoRun(s, 'steady');
    const ids = new Set(unlocks().map(({ ch }) => ch.id));
    took += done.inbox.find((m) => m.type === 'report').timeline.events.filter((e) => ids.has(e.choiceId)).length;
  }
  assert.ok(took > 20, `unlocks taken ${took}`);
});
