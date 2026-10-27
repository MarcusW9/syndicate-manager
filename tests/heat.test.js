// Heat: comes from loudness and mistakes, cools 2 a week, and high heat brings a fixer notice.
// Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame } from '../src/core/state.js';
import * as M from '../src/core/mission.js';
import { advanceDay } from '../src/core/time.js';
import { templateById } from '../src/core/jobs.js';
import { MISSIONS } from '../src/data/missions.js';
import { ECONOMY } from '../src/data/economy.js';
import { resolveDecision } from '../src/core/decisions.js';
import { assessJob } from '../src/core/risk.js';
import { checkHeatNotice, heatChoices, HEAT_NOTICE_AT, WATCHED_PENALTY } from '../src/core/heat.js';
import { playMission, toCrisis, carefulPolicy } from './play.js';
import { playHeat, median } from './heat-sim.js';

const notice = (s) => s.inbox.find((m) => m.kind === 'heat' && !m.resolved);
const toSunday = (s) => { while (!s.inbox.some((m) => m.id === `week-${s.day}`)) s = advanceDay(s); return s; };
const nextSunday = (s) => toSunday(advanceDay(s));

/** Run the first job on the board with the given approach. Returns the finished state. */
function runJob(seed, approach, policy = carefulPolicy) {
  let s = createNewGame({ seed });
  const job = s.jobs[seed % s.jobs.length];
  const tpl = templateById(job.templateId);
  s = M.startMission(s, job.id, s.crew.slice(0, tpl.crewSize).map((o) => o.id), approach);
  return playMission(s, policy).state;
}

test('no job template carries base heat', () => {
  for (const m of MISSIONS) assert.equal(m.heat, 0, m.id);
});

test('a clean stealth or con job adds 0 heat; Loud adds exactly +1', () => {
  const clean = { stealth: 0, con: 0, loud: 0 };
  for (let seed = 1; seed <= 150; seed++) {
    for (const approach of ['stealth', 'con', 'loud']) {
      const s = runJob(seed, approach);
      const am = s.activeMission;
      if (am.aborted) { assert.equal(am.result.heatGain, am.extraHeat, 'aborts add no approach heat'); continue; }
      assert.equal(am.result.heatGain, am.extraHeat + (approach === 'loud' ? 1 : 0), `${approach}, seed ${seed}`);
      if (am.extraHeat === 0) {
        clean[approach] += 1;
        assert.equal(s.heat, approach === 'loud' ? 1 : 0);
      }
    }
  }
  for (const [k, n] of Object.entries(clean)) assert.ok(n > 10, `only ${n} clean ${k} jobs to check`);
});

test('the fixer notice fires at heat 6+ after Sunday cooling, and not below', () => {
  let s = createNewGame({ seed: 21 });
  s.heat = HEAT_NOTICE_AT + 2; // cools to 6
  s = toSunday(s);
  assert.equal(s.heat, HEAT_NOTICE_AT);
  const n = notice(s);
  assert.ok(n, 'notice at 6');
  assert.equal(n.blocking, true);
  assert.match(n.body, /asking/);

  let t = createNewGame({ seed: 22 });
  t.heat = HEAT_NOTICE_AT + 1; // cools to 5
  t = toSunday(t);
  assert.equal(t.heat, HEAT_NOTICE_AT - 1);
  assert.equal(notice(t), undefined, 'no notice at 5');
});

test('the notice respects its 14-day cooldown and never stacks', () => {
  let s = createNewGame({ seed: 23 });
  s.heat = 10;
  s = toSunday(s);
  assert.ok(notice(s));
  assert.equal(checkHeatNotice(s), false, 'one already pending');
  s = resolveDecision(s, notice(s).id, 'ride');
  s.heat = 10;
  s = nextSunday(s); // 7 days later
  assert.equal(notice(s), undefined, 'inside the cooldown');
  s.heat = 10;
  s = nextSunday(s); // 14 days later
  assert.ok(notice(s), 'cooldown over');
});

test('paying the fixer costs cash and takes 3 heat; it is closed when you cannot afford it', () => {
  let s = createNewGame({ seed: 24 });
  s.heat = 10;
  s = toSunday(s);
  const n = notice(s);
  const cash = s.cash;
  const heat = s.heat;
  assert.equal(heatChoices(s, n)[0].disabled, cash < ECONOMY.heat.fixerCost);
  s.cash = ECONOMY.heat.fixerCost + 100;
  const paid = resolveDecision(s, n.id, 'pay');
  assert.equal(paid.cash, 100);
  assert.equal(paid.heat, heat - 3);
  assert.equal(notice(paid), undefined, 'resolved');

  const poor = structuredClone(s);
  poor.cash = ECONOMY.heat.fixerCost - 1;
  assert.equal(heatChoices(poor, n)[0].disabled, true);
  assert.equal(heatChoices(poor, n)[1].disabled, false, 'letting it ride is always open');
  const tried = resolveDecision(poor, n.id, 'pay');
  assert.equal(tried.cash, poor.cash);
  assert.equal(tried.heat, poor.heat);
  assert.ok(notice(tried), 'still waiting for a choice');
});

test('the notice is never a lockout: a job can start while it waits', () => {
  let s = createNewGame({ seed: 25 });
  s.heat = 10;
  s = toSunday(s);
  s = advanceDay(s); // Monday: fresh board
  assert.ok(notice(s));
  const job = s.jobs[0];
  const started = M.startMission(s, job.id, s.crew.slice(0, templateById(job.templateId).crewSize).map((o) => o.id), 'stealth');
  assert.ok(started.activeMission, 'job started');
});

test('letting it ride: the next job is -1 on its first crisis roll only, and the risk read says so', () => {
  let s = createNewGame({ seed: 26 });
  s.heat = 10;
  s = toSunday(s);
  s = resolveDecision(s, notice(s).id, 'ride');
  assert.equal(s.heatWatched, true);
  assert.equal(s.heat, 8, 'riding costs nothing and cools nothing');

  // Planning read: the reason is listed and every key stat reads 1 lower, same as the real roll.
  const job = s.jobs[0];
  const tpl = templateById(job.templateId);
  const crew = s.crew.slice(0, tpl.crewSize);
  const read = assessJob(tpl, crew, 'stealth', { watched: s.heatWatched ? WATCHED_PENALTY : 0 });
  assert.match(read.reasons[0], /Watched/);
  assert.ok(!assessJob(tpl, crew, 'stealth').reasons.some((r) => /Watched/.test(r)));

  s = M.startMission(s, job.id, crew.map((o) => o.id), 'stealth');
  assert.equal(s.heatWatched, false, 'spent on the job it lands on');
  assert.equal(s.activeMission.watched, WATCHED_PENALTY);
  s = toCrisis(s); // incidents don't spend it: it's the first crisis roll's
  assert.equal(s.activeMission.watched, WATCHED_PENALTY);

  // The crisis read shows the same -1 the roll will use.
  const rolled = (d) => d.choices.filter((c) => c.available && /\(-?\d+/.test(c.riskReason ?? ''));
  const value = (c) => Number(c.riskReason.match(/\((-?\d+)/)[1]);
  const watchedRead = rolled(M.describeCrisis(s));
  const plain = structuredClone(s); plain.activeMission.watched = 0;
  const plainRead = rolled(M.describeCrisis(plain));
  assert.ok(watchedRead.length);
  watchedRead.forEach((c, i) => {
    assert.equal(value(c), value(plainRead[i]) - WATCHED_PENALTY, c.label);
    assert.match(c.riskReason, /watched -1/);
  });

  // After the first roll it's gone for the rest of the job.
  s = M.chooseOption(s, watchedRead[0].id);
  assert.equal(s.activeMission.watched, 0);
});

test('steady state: mixed play keeps heat low; all-Loud play runs hot and meets the fixer', () => {
  // Bounds chosen 2026-10-24 from 300 seeds (DESIGN.md): mixed 2 jobs/week sits at a median of 1
  // on a typical day (0 after Sunday cooling); all-Loud 3/week reaches 7+ in ~78% of runs, notice in ~66%.
  const SEEDS = 100;
  const mixed = [];
  const loud = [];
  for (let seed = 1; seed <= SEEDS; seed++) {
    mixed.push(playHeat(8, seed, { perWeek: 2, approach: 'mix' }));
    loud.push(playHeat(8, seed, { perWeek: 3, approach: 'loud' }));
  }
  const days = mixed.flatMap((r) => r.daily.slice(7)); // weeks 2-8
  const mixedMedian = median(mixed.map((r) => median(r.daily.slice(7))));
  assert.ok(mixedMedian <= 2, `mixed median heat ${mixedMedian}`);
  assert.ok(days.filter((h) => h >= 10).length / days.length < 0.02, 'mixed play rarely hits 10');
  const hot = loud.filter((r) => r.peak >= 7).length / SEEDS;
  const noticed = loud.filter((r) => r.notices > 0).length / SEEDS;
  assert.ok(hot >= 0.6, `${Math.round(hot * 100)}% of all-Loud runs reached 7+`);
  assert.ok(noticed >= 0.5, `${Math.round(noticed * 100)}% of all-Loud runs met the fixer`);
});
