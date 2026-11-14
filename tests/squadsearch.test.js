// The board's squad search, pruned (2026-11-14): Joss's read of a job (core/squad.js jobRead, leanPicks, jossPicks,
// planTries) plays a fight only as far as its answer needs, and must give exactly what the full search gave. The full
// search, as it was, is kept in tests/squad-ref.js (with odds of its own, so nothing the new code caches is read back).
// Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame } from '../src/core/state.js';
import { jobView, addOffer } from '../src/core/jobs.js';
import { availability } from '../src/core/crew.js';
import { generateRecruit, recruitToOperative } from '../src/core/recruits.js';
import { APPROACHES } from '../src/data/approaches.js';
import { jobRead, leanPicks, jossPicks, planRead, planTries } from '../src/core/squad.js';
import { jobReadRef, leanPicksRef, jossPicksRef, planReadRef, planTriesRef } from './squad-ref.js';
import { arm, autoFounders, playWeeks } from './play.js';

const APPROACH_IDS = Object.keys(APPROACHES);
const armed = (s) => arm(arm(s, s.crew.at(-1).id, 'rifle'), s.crew.at(-2).id, 'drone');

/** Grow a roster to `size` with generated people (no fee), so the search has a big free list. */
function grow(s, size) {
  while (s.crew.length < size) {
    const r = generateRecruit(s);
    s.crew.push(recruitToOperative(r, { condition: { fatigue: 0, morale: 60, neuralLoad: 0, burnout: 0, injury: 'healthy', injuryDays: 0 }, history: [] }));
  }
  return s;
}

/** A spread of states: fresh games on several seeds and starts, and mid and late campaigns with bigger, worn rosters. */
export function spread() {
  const out = [];
  for (const [seed, startCrew] of [[1, 'fresh'], [2, 'classic'], [3, 'pick'], [4, 'fresh'], [5, 'classic']]) {
    let s = createNewGame({ seed, startCrew });
    if (s.founding) s = autoFounders(s);
    out.push([`new ${startCrew} ${seed}`, armed(s)]);
  }
  const mid = armed(grow(structuredClone(playWeeks(8, 6, undefined, { hireAbove: 0 }).state), 9));
  mid.crew[1].condition.fatigue = 70;
  out.push(['week 8, 9 crew', mid]);
  const late = armed(grow(structuredClone(playWeeks(20, 7, undefined, { hireAbove: 0 }).state), 13));
  arm(late, late.crew[4].id, 'rifle', 'vest');
  late.crew[2].condition.injury = 'light';
  late.crew[3].condition.awayUntil = late.day + 2;
  for (const id of ['protection', 'quiet_hours', 'warehouse']) addOffer(late, id); // the five fight jobs' engine (core/fight.js)
  out.push(['week 20, 13 crew', late]);
  return out;
}

const key = (r) => JSON.stringify([r.approach, r.picks, r.level, r.size, r.short, r.crew.map((o) => o.id)]);
const ids = (x) => JSON.stringify(x, (k, v) => (v && typeof v === 'object' && 'stats' in v && 'id' in v ? v.id : v));

test('the pruned search is exact: the same approach, squad and level as the full search, on every job of a spread of states', () => {
  let jobs = 0;
  for (const [name, s] of spread()) {
    const free = s.crew.filter((op) => availability(s, op).ok);
    const byId = (id) => free.find((o) => o.id === id) ?? null;
    for (const job of s.jobs) {
      jobs++;
      const r = jobRead(s, job);
      assert.equal(key(r), key(jobReadRef(s, job)), `${name} ${job.templateId}: the board's read`);
      // Joss's picks for every approach (the plan screen asks for each), and the greedy team under them.
      const v = jobView(s, job);
      for (const a of APPROACH_IDS) {
        assert.deepEqual(leanPicks(s, job, a), leanPicksRef(s, job, a), `${name} ${job.templateId} ${a}: leanPicks`);
        assert.deepEqual(jossPicks({ ...v.tpl, threat: v.threat }, free, a, { threat: v.threat }), jossPicksRef({ ...v.tpl, threat: v.threat }, free, a, { threat: v.threat }), `${name} ${job.templateId} ${a}: jossPicks`);
      }
      // The plan screen's read of the card's plan, every number, and its "Try" list.
      const plan = { crew: r.crew, approach: r.approach, overwatch: byId(r.picks.overwatch), kit: r.picks.kit, wheels: byId(r.picks.wheels) };
      assert.equal(ids(planRead(s, job, plan)), ids(planReadRef(s, job, plan)), `${name} ${job.templateId}: planRead`);
      const thin = { ...plan, crew: plan.crew.slice(0, -1), overwatch: null, wheels: null };
      assert.equal(ids(planTries(s, job, thin, free)), ids(planTriesRef(s, job, thin, free)), `${name} ${job.templateId}: planTries`);
    }
  }
  assert.ok(jobs >= 10, `read ${jobs} jobs`);
});
