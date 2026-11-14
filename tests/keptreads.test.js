// Kept reads (2026-11-14): the board keeps a job's read while nothing it reads has changed (core/squad.js readKey). A kept
// read must always equal a fresh one. Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame } from '../src/core/state.js';
import { advanceDay } from '../src/core/time.js';
import { templateById } from '../src/core/jobs.js';
import { availability } from '../src/core/crew.js';
import { generateRecruit, recruitToOperative } from '../src/core/recruits.js';
import { RUMOURS } from '../src/data/rumours.js';
import { jobRead, readKey, keptRead } from '../src/core/squad.js';
import { arm, autoFounders, playWeeks } from './play.js';

const same = (r) => JSON.stringify([r.approach, r.picks, r.level, r.size, r.short, r.crew.map((o) => o.id)]);

/** A small campaign start with a bigger roster, some of it tired. */
function start(seed) {
  let s = createNewGame({ seed, startCrew: 'pick' });
  if (s.founding) s = autoFounders(s);
  while (s.crew.length < 7) s.crew.push(recruitToOperative(generateRecruit(s), { condition: { fatigue: 0, morale: 60, neuralLoad: 0, burnout: 0, injury: 'healthy', injuryDays: 0 }, history: [] }));
  s.crew[1].condition.fatigue = 40;
  return arm(s, s.crew.at(-1).id, 'rifle');
}

/** The typical changes between two board reads. Each takes a state and returns the next one. */
const CHANGES = {
  'a day passes': (s) => advanceDay(s),
  'someone is hurt': (s) => { const t = structuredClone(s); t.crew[0].condition.injury = 'light'; return t; },
  'a hire': (s) => { const t = structuredClone(s); t.crew.push(recruitToOperative(generateRecruit(t), { condition: { fatigue: 0, morale: 60, neuralLoad: 0, burnout: 0, injury: 'healthy', injuryDays: 0 }, history: [] })); return t; },
  'new gear': (s) => arm(structuredClone(s), s.crew[2].id, 'drone', 'vest'),
  'intel on a district': (s) => { const t = structuredClone(s); const d = templateById(t.jobs[0].templateId).district; t.intel = { ...(t.intel ?? {}), [d]: { until: t.day + 3, source: 'test' } }; return t; },
  'a rumour': (s) => { const t = structuredClone(s); const r = RUMOURS.find((x) => x.threat); t.rumour = { id: r.id, district: r.district, until: t.day + 5 }; return t; },
  'rest, below the line': (s) => { const t = structuredClone(s); t.crew[1].condition.fatigue = 20; return t; },
  'only history changes': (s) => { const t = structuredClone(s); t.crew[0].history = [...(t.crew[0].history ?? []), 'Day x: a note']; return t; },
};

test('a kept read always equals a fresh one, after the usual changes', () => {
  let kept = 0, missed = 0;
  for (const seed of [21, 22]) {
    const s0 = start(seed);
    const before = new Map(s0.jobs.map((j) => [readKey(s0, j), jobRead(s0, j)]));
    for (const [name, change] of Object.entries(CHANGES)) {
      const s1 = change(s0);
      for (const job of s1.jobs) {
        const k = readKey(s1, job);
        if (!before.has(k)) { missed++; continue; }
        kept++;
        const fresh = jobRead(s1, job);
        const old = keptRead(before.get(k), s1);
        assert.equal(same(old), same(fresh), `seed ${seed}, ${name}, ${job.templateId}: the kept read is the fresh one`);
        assert.ok(old.crew.every((op) => s1.crew.includes(op)), `${name}: the kept read names this state's people`);
      }
    }
  }
  assert.ok(kept > 0 && missed > 0, `some reads kept (${kept}), some read again (${missed})`);
});

test('the key moves when what the read reads moves', () => {
  const s0 = start(23);
  const job = s0.jobs[0];
  const k0 = readKey(s0, job);
  for (const name of ['someone is hurt', 'a hire', 'new gear', 'intel on a district']) {
    assert.notEqual(readKey(CHANGES[name](s0), job), k0, `${name} reads again`);
  }
  assert.equal(readKey(CHANGES['only history changes'](s0), job), k0, 'a line of history does not');
  assert.equal(readKey(CHANGES['rest, below the line'](s0), job), k0, 'fatigue that stays under 60 does not');
  const tired = structuredClone(s0);
  tired.crew[1].condition.fatigue = 70;
  assert.notEqual(readKey(tired, job), k0, 'fatigue over 60 (−2 on rolls) reads again');
  const away = structuredClone(s0);
  const op = away.crew.find((o) => availability(away, o).ok);
  op.condition.awayUntil = away.day + 3;
  assert.notEqual(readKey(away, job), k0, 'someone leaving the free list reads again');
});

test('day to day in a played campaign, every kept read is the fresh one', () => {
  const keptReads = new Map();
  let kept = 0;
  playWeeks(6, 24, undefined, { startCrew: 'pick', hireAbove: 0, onDay: (s) => {
    for (const job of s.jobs) {
      const k = readKey(s, job);
      const fresh = jobRead(s, job);
      if (keptReads.has(k)) { kept++; assert.equal(same(keptRead(keptReads.get(k), s)), same(fresh), `day ${s.day} ${job.templateId}`); }
      keptReads.set(k, fresh);
    }
  } });
  assert.ok(kept >= 1, `reads kept from one day to the next: ${kept}`);
});
