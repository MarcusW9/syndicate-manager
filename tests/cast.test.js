// Reusable writing parts (DESIGN.md, 2026-10-25): cast line banks, district slots and
// plain report lines. A typo in a slot would silently print "someone", so check them all.

import test from 'node:test';
import assert from 'node:assert/strict';
import { MISSIONS } from '../src/data/missions.js';
import { TWISTS } from '../src/data/twists.js';
import { CAST } from '../src/data/cast.js';
import { createNewGame } from '../src/core/state.js';
import * as M from '../src/core/mission.js';
import { playMission, carefulPolicy } from './play.js';

const ROLES = ['driver', 'tech', 'face', 'muscle', 'medic', 'infiltrator', 'op'];

function texts(m) {
  const out = [m.brief, ...m.beats];
  for (const c of m.crises) {
    out.push(c.text);
    for (const ch of c.choices) out.push(ch.label, ch.success, ch.failure ?? '', ch.report?.success ?? '', ch.report?.failure ?? '');
  }
  return out.filter(Boolean);
}

test('every {slot} in job text is a role, a district slot or a cast line that exists', () => {
  for (const m of [...MISSIONS, { id: 'twists', brief: '', beats: [], crises: TWISTS }]) {
    for (const t of texts(m)) {
      for (const [, key, sub] of t.matchAll(/\{(\w+)(?::(\w+))?\}/g)) {
        if (ROLES.includes(key) || key === 'district' || key === 'faction') { assert.equal(sub, undefined, `${m.id}: ${key}:${sub}`); continue; }
        assert.ok(CAST[key], `${m.id}: unknown slot {${key}} in "${t}"`);
        if (sub) assert.ok(CAST[key].lines?.[sub]?.length, `${m.id}: ${key} has no "${sub}" lines`);
      }
    }
  }
});

test('cast lines fill in, the same way every time for a job and step', () => {
  const s = createNewGame({ seed: 2, startCrew: 'fresh' });
  const job = s.jobs.find((j) => j.templateId === 'clinic');
  const started = M.startMission(s, job.id, s.crew.slice(0, 2).map((o) => o.id), 'stealth');
  const am = started.activeMission;
  const a = M.fill('{siu} says: "{siu:greet}" in {district}, on {faction} ground.', started, am);
  assert.equal(a, M.fill('{siu} says: "{siu:greet}" in {district}, on {faction} ground.', started, am));
  assert.match(a, /^Doc Siu says: ".+" in Old Town, on Brass Anchor ground\.$/);
  assert.ok(CAST.siu.lines.greet.some((l) => a.includes(l)));
});

test('a rookie job\'s after-action message carries a plain line for each crisis', () => {
  let seen = 0;
  for (let seed = 1; seed <= 20; seed++) {
    const s = createNewGame({ seed, startCrew: 'fresh' });
    const job = s.jobs.find((j) => j.templateId === 'clinic');
    const done = playMission(M.startMission(s, job.id, s.crew.slice(0, 2).map((o) => o.id), 'stealth'), carefulPolicy).state;
    const { report } = done.activeMission.result;
    assert.ok(report.length >= 1, `seed ${seed}: report lines`);
    for (const line of report) assert.doesNotMatch(line, /\{\w+/, `seed ${seed}: unfilled slot in "${line}"`);
    if (done.inbox.find((m) => m.type === 'report').body.startsWith(report[0])) seen += 1;
  }
  assert.equal(seen, 20, 'the report leads the after-action message');
});

test('briefs fill their cast and district slots before a crew is picked', () => {
  for (const m of MISSIONS) {
    const b = M.fillBrief(m);
    assert.doesNotMatch(b, /\{\w+/, `${m.id}: unfilled slot in brief`);
    assert.equal(b, M.fillBrief(m), `${m.id}: same brief every time`);
  }
  assert.match(M.fillBrief(MISSIONS.find((m) => m.id === 'ledger')), /^Madam Rao doesn't look up/);
});

test('every open district has a mid-sentence name for {district}', async () => {
  const { NAMES } = await import('../src/config/names.js');
  for (const k of Object.keys(NAMES.districts)) assert.ok(NAMES.districtsInText[k], `${k}: no districtsInText`);
});

test('crises keep story order: never before their `after` beat, sorted by `order`, never after the last beat', async () => {
  const { addOffer } = await import('../src/core/jobs.js');
  for (const tpl of MISSIONS.filter((m) => m.crises.some((c) => c.after != null || c.order != null))) {
    for (let seed = 1; seed <= 60; seed++) {
      const s = createNewGame({ seed, startCrew: 'fresh' });
      s.jobs = []; addOffer(s, tpl.id);
      const { queue } = M.startMission(s, s.jobs[0].id, s.crew.slice(0, tpl.crewSize).map((o) => o.id), 'stealth').activeMission;
      let lastBeat = -1, lastOrder = -Infinity;
      for (const step of queue) {
        if (step.type === 'beat') { lastBeat = step.index; continue; }
        const c = tpl.crises.find((x) => x.id === step.id);
        if (!c) continue; // a twist
        assert.ok(lastBeat >= (c.after ?? 0), `${tpl.id}/${c.id} came after beat ${lastBeat}, needs ${c.after}`);
        assert.ok((c.order ?? 0) >= lastOrder, `${tpl.id}/${c.id} out of order`);
        lastOrder = c.order ?? 0;
      }
      assert.equal(queue.at(-1).type === 'beat' || queue.at(-1).twist, true, `${tpl.id}: ends on the last beat`);
    }
  }
});
