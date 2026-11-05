// The plan bar's read (2026-11-05): the skills read names the key stat the crises are hardest on,
// so the bar can always say what sets the risk instead of "Crew matches the job well" at mid risk.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame } from '../src/core/state.js';
import { assessJob, successChance, rollTarget } from '../src/core/risk.js';
import { MISSIONS } from '../src/data/missions.js';

test('assessJob names its weakest key stat, the one with the lowest chance', () => {
  const s = createNewGame({ seed: 3, startCrew: 'fresh' });
  for (const m of MISSIONS.slice(0, 12)) {
    const read = assessJob(m, s.crew.slice(0, m.crewSize), 'stealth');
    const w = read.weakest;
    assert.ok(w, m.id);
    assert.ok(m.keyStats.includes(w.stat), m.id);
    assert.equal(Math.round(w.chance * 1000), Math.round(successChance(w.value, rollTarget(m)) * 1000), m.id);
    // A mid or worse skills read always has a weakest stat under the low-risk line.
    if (read.level !== 'low') assert.ok(w.chance < 0.75 + 1e-9, m.id);
  }
});

test('with no crew there is no weakest stat to name', () => {
  assert.equal(assessJob(MISSIONS[0], [], 'stealth').weakest, undefined);
});

import { addOffer } from '../src/core/jobs.js';
import { planTries, planRead, jobRead } from '../src/core/squad.js';
import { availability, APPROACHES } from '../src/core/crew.js';

const ORDER = ['low', 'moderate', 'high', 'extreme'];

test("every Try suggestion lowers the plan's risk, read the same way as the bar; one of each kind", () => {
  const s = createNewGame({ seed: 21, startCrew: 'fresh' });
  const free = s.crew.filter((o) => availability(s, o).ok);
  let seen = 0;
  for (const id of ['data_scrub', 'casino', 'chrome']) {
    s.jobs = [];
    addOffer(s, id);
    const job = s.jobs[0];
    const r = jobRead(s, job);
    for (const approach of Object.keys(APPROACHES)) {
      const plan = { crew: r.picks.crew.map((x) => free.find((o) => o.id === x)), approach, overwatch: free.find((o) => o.id === r.picks.overwatch) ?? null, kit: r.picks.kit, wheels: free.find((o) => o.id === r.picks.wheels) ?? null };
      const now = planRead(s, job, plan).level;
      const tries = planTries(s, job, plan, free);
      if (now === 'low') assert.deepEqual(tries, [], `${id} ${approach}: nothing to try at low risk`);
      assert.equal(new Set(tries.map((t) => t.kind)).size, tries.length, `${id} ${approach}: one of each kind`);
      for (const t of tries) {
        seen++;
        const p = t.kind === 'approach' ? { ...plan, approach: t.approach }
          : t.kind === 'swap' ? { ...plan, crew: plan.crew.map((o) => (o === t.out ? t.op : o)) }
            : t.kind === 'add' ? { ...plan, crew: [...plan.crew, t.op] }
              : t.kind === 'overwatch' ? { ...plan, overwatch: t.op, kit: t.kit } : { ...plan, wheels: t.op };
        const after = planRead(s, job, p).level;
        assert.equal(after, t.level, `${id} ${approach} ${t.kind}`);
        assert.ok(ORDER.indexOf(after) < ORDER.indexOf(now), `${id} ${approach} ${t.kind} lowers the risk`);
        if (t.op) assert.ok(!plan.crew.includes(t.op) && t.op !== plan.overwatch && t.op !== plan.wheels, 'only someone not already going');
      }
    }
  }
  assert.ok(seen >= 3, 'the cases above produce suggestions');
});
