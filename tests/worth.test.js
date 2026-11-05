// Joss's lean picks and what a job gives a runner (core/worth.js; DESIGN.md 2026-11-05). Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame } from '../src/core/state.js';
import { addOffer, jobView } from '../src/core/jobs.js';
import { leanPicks, planRead, jossPicks } from '../src/core/squad.js';
import { crewValue, jobGain } from '../src/core/worth.js';
import { GRADUATE_AT, VETERAN_AT, primaryStat } from '../src/core/development.js';
import { availability } from '../src/core/crew.js';

test('value: capability first, then fame, then the main stat', () => {
  const op = (tier, fame, main) => ({ tier, fame, role: 'face', stats: { social: main } });
  assert.ok(crewValue(op('veteran', 'unknown', 10)) > crewValue(op('pro', 'elite', 18)));
  assert.ok(crewValue(op('pro', 'respected', 12)) > crewValue(op('pro', 'known', 18)));
  assert.ok(crewValue(op('rookie', 'unknown', 13)) > crewValue(op('rookie', 'unknown', 11)));
});

test("Joss keeps the risk and sends the cheaper crew: a star on rookie work is swapped out when the read doesn't change", () => {
  let swapped = 0;
  for (let seed = 1; seed <= 20; seed++) {
    const s = createNewGame({ seed, startCrew: 'fresh' });
    // One runner grown into a veteran star: Joss's old greedy pick takes them first.
    const star = s.crew[0];
    star.tier = 'veteran'; star.fame = 'elite';
    for (const k of Object.keys(star.stats)) star.stats[k] = Math.min(20, star.stats[k] + 6);
    s.jobs = []; addOffer(s, 'clinic');
    const job = s.jobs[0];
    const free = s.crew.filter((o) => availability(s, o).ok);
    const v = jobView(s, job);
    const greedy = jossPicks({ ...v.tpl, threat: v.threat }, free, 'stealth', { threat: v.threat });
    const lean = leanPicks(s, job, 'stealth');
    const byId = (id) => s.crew.find((o) => o.id === id) ?? null;
    const read = planRead(s, job, { crew: lean.crew.map(byId), approach: 'stealth', overwatch: byId(lean.overwatch), kit: lean.kit, wheels: byId(lean.wheels) });
    assert.equal(read.level, lean.level, 'the level shown is the level of the crew sent');
    if (greedy.crew.includes(star.id) && !lean.crew.includes(star.id)) swapped++;
  }
  assert.ok(swapped >= 5, `the star stayed home on rookie work (${swapped}/20)`);
});

test('what a job gives a runner: only real effects, in a few words', () => {
  const rookie = { tier: 'rookie', role: 'tech', stats: { tech: GRADUATE_AT - 1 }, traits: [] };
  assert.equal(jobGain(rookie, 1).text, '1 point from pro');
  assert.equal(jobGain({ ...rookie, stats: { tech: 10 } }, 1).text, 'learns on the job');
  const vet = { id: 'v', handle: 'Rook', tier: 'veteran', role: 'tech', stats: { tech: 17 }, traits: [], condition: { injury: 'healthy' } };
  assert.equal(jobGain(rookie, 1, [vet]).text, 'learns faster beside Rook');
  assert.deepEqual(jobGain(vet, 1), { text: 'below their level: little to gain', tone: 'flat' });
  assert.equal(jobGain(vet, 3).text, 'counts towards their standing');
  const pro = { tier: 'pro', role: 'tech', stats: { tech: VETERAN_AT.main }, jobsWithCrew: VETERAN_AT.jobs - 2, traits: [] };
  assert.equal(jobGain(pro, 2).text, '2 jobs from veteran');
  assert.equal(jobGain({ ...pro, freelance: true }, 2), null, 'freelancers are passing through');
  assert.equal(primaryStat(rookie), 'tech');
});
