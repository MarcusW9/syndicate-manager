// Expeditions (core/expeditions.js; the adventure log, slice 2; owner, 2026-11-21/22). The promises: a crew
// sent is away for the goal's days and writes a line every day; the trip closes met, partial or failed and
// brings home what that says (the prize, a lesser piece / half the sum / a rookie's name, or only the finds);
// no pay and no fame or standing; a deal gone wrong calls in, and pulling out (from the call or any day)
// brings everyone home unhurt; steady orders lose nobody; the fight counts in the fight record; the days roll
// no other dice; and a v86 save upgrades.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame, SAVE_VERSION } from '../src/core/state.js';
import { advanceDay } from '../src/core/time.js';
import { resolveDecision } from '../src/core/decisions.js';
import { availability } from '../src/core/crew.js';
import { sendExpedition, canSend, expeditionsOut, expeditionOdds, pullOutExpedition, expeditionById } from '../src/core/expeditions.js';
import { GOALS, EXPEDITION, EXPEDITION_DISTRICTS } from '../src/data/expeditions.js';
import { GOAL_LINES, DISTRICT_LINES } from '../src/core/advlog.js';

const { importSave } = await import('../src/save/save.js');
const fresh = (seed) => createNewGame({ seed, startCrew: 'fresh' });
const call = (s) => s.inbox.find((m) => m.kind === 'expedition' && !m.resolved);
const reportOf = (s) => s.inbox.find((m) => m.timeline?.expedition);

/** Send the first n crew after a goal and play days until they're back, answering any call with `answer`. */
function trip(seed, goal, { n = 2, district = 'docks', answer = 'give' } = {}) {
  let s = fresh(seed);
  const ids = s.crew.slice(0, n).map((o) => o.id);
  s = sendExpedition(s, { goal, district, crewIds: ids });
  const before = { cash: s.cash, crew: structuredClone(s.crew) };
  let calls = 0;
  for (let i = 0; i < GOALS[goal].days + 2 && expeditionsOut(s).length; i++) {
    s = advanceDay(s);
    for (let m = call(s); m; m = call(s)) { calls++; s = resolveDecision(s, m.id, answer); }
  }
  return { s, ids, before, calls };
}

const SLOTS = new Set(['who', 'other', 'contact', 'contactWhat', 'place', 'district', 'itemFull', 'item', 'cash', 'lead', 'leadShort', 'day']);
const allLines = (x) => (typeof x === 'string' ? [x] : Array.isArray(x) ? x.flatMap(allLines) : x && typeof x === 'object' ? Object.values(x).flatMap(allLines) : []);

test('the goal files name only the prompt\'s slots, and every district offered has people and places', () => {
  for (const [goal, file] of Object.entries(GOAL_LINES)) {
    const { goal: g, ...pools } = file;
    assert.equal(g, goal);
    for (const line of allLines(pools)) for (const [, slot] of line.matchAll(/\{(\w+)\}/g)) assert.ok(SLOTS.has(slot), `${goal}: {${slot}} in "${line}"`);
  }
  for (const d of EXPEDITION_DISTRICTS) assert.ok(DISTRICT_LINES[d]?.contacts?.length && DISTRICT_LINES[d]?.places?.length, d);
});

test('who can go: our own free runners, one to three, to a district with a file', () => {
  const s = fresh(1);
  const ids = s.crew.map((o) => o.id);
  assert.ok(canSend(s, 'weapon', 'docks', ids.slice(0, 3)).ok);
  assert.ok(!canSend(s, 'weapon', 'docks', ids.slice(0, EXPEDITION.maxCrew + 1)).ok);
  assert.ok(!canSend(s, 'weapon', 'docks', []).ok);
  assert.ok(!canSend(s, 'weapon', 'oldTown', ids.slice(0, 1)).ok, 'no district file yet');
  assert.ok(!canSend(s, 'heist', 'docks', ids.slice(0, 1)).ok);
  const sent = sendExpedition(s, { goal: 'cash', district: 'docks', crewIds: ids.slice(0, 2) });
  for (const id of ids.slice(0, 2)) assert.ok(!availability(sent, sent.crew.find((o) => o.id === id)).ok, 'away');
  assert.ok(!canSend(sent, 'cash', 'docks', ids.slice(0, 1)).ok, 'busy');
  assert.equal(sendExpedition(sent, { goal: 'cash', district: 'docks', crewIds: ids.slice(0, 1) }), sent, 'nothing changes');
  let two = sendExpedition(sent, { goal: 'weapon', district: 'docks', crewIds: ids.slice(2, 3) });
  assert.equal(expeditionsOut(two).length, EXPEDITION.maxOut);
  assert.ok(!canSend(two, 'recruit', 'docks', ids.slice(3, 4)).ok, `at most ${EXPEDITION.maxOut} out at once`);
  const odds = expeditionOdds(s, 'weapon', ids.slice(0, 2));
  assert.ok(odds.met > 0 && odds.met < 1 && odds.reads.length === GOALS.weapon.stats.length);
});

test('a trip writes a line every day, closes on its last day and brings home what the close says', () => {
  const seen = { met: 0, partial: 0, failed: 0 };
  for (const goal of Object.keys(GOALS)) {
    for (let seed = 1; seed <= 10; seed++) {
      const { s, ids, calls } = trip(seed, goal, { district: EXPEDITION_DISTRICTS[seed % 2] });
      const r = reportOf(s);
      assert.ok(r, `${goal} ${seed}: a report`);
      const out = r.timeline.expedition.outcome;
      seen[out]++;
      const days = [...new Set(r.timeline.days.map((d) => d.day))];
      if (!calls) assert.deepEqual(days, Array.from({ length: GOALS[goal].days }, (_, i) => i + 1), `${goal} ${seed}: a line a day`);
      assert.ok(r.timeline.days.every((d) => d.text && !d.text.includes('{') && !d.text.includes('undefined')), r.timeline.days.map((d) => d.text).join(' | '));
      assert.ok(expeditionsOut(s).length === 0, 'back');
      for (const id of ids) { const op = s.crew.find((o) => o.id === id); if (op && !op.condition.missing) assert.ok(op.condition.awayUntil <= s.day, 'home'); }
      const texts = r.timeline.outcome.map((o) => o.text).join(' ');
      if (out !== 'failed') {
        if (goal === 'weapon') assert.match(texts, /To the stash/);
        if (goal === 'cash') assert.match(texts, /Brought home ¥/);
        if (goal === 'recruit') assert.ok(s.recruits.some((x) => texts.includes(x.handle)), 'a lead in Crew › Leads');
      }
    }
  }
  assert.ok(seen.met && seen.partial + seen.failed, JSON.stringify(seen));
});

test('a weapon met is the prize piece the trip was after, named in the log', () => {
  for (let seed = 1; seed <= 30; seed++) {
    let s = fresh(seed);
    s = sendExpedition(s, { goal: 'weapon', district: 'docks', crewIds: s.crew.slice(0, 3).map((o) => o.id) });
    const prize = expeditionById(s, expeditionsOut(s)[0].id).prize.item;
    assert.ok(['custom', 'premium'].includes(prize.tier));
    for (let i = 0; i < 8 && expeditionsOut(s).length; i++) { s = advanceDay(s); for (let m = call(s); m; m = call(s)) s = resolveDecision(s, m.id, 'give'); }
    const r = reportOf(s);
    if (r.timeline.expedition.outcome !== 'met') continue;
    assert.ok(s.stash.some((i) => i.uid === prize.uid), 'the prize is in the stash');
    assert.ok(r.timeline.days.some((d) => d.text.includes(prize.name)), 'the log names it');
    return;
  }
  assert.fail('no weapon hunt met in 30 seeds');
});

test('no pay from a client and no fame or standing; the days roll no other dice', () => {
  let s = fresh(4);
  const ids = s.crew.slice(0, 2).map((o) => o.id);
  s = sendExpedition(s, { goal: 'weapon', district: 'docks', crewIds: ids });
  const fame = s.crew.map((o) => [o.fame, o.standing]);
  const rng = s.rngCounter;
  const plain = advanceDay(fresh(4));
  const withTrip = advanceDay(s);
  assert.equal(withTrip.rngCounter - rng, plain.rngCounter - fresh(4).rngCounter, 'day 1 moved no shared roll');
  const { s: end } = trip(4, 'weapon');
  for (const [i, op] of end.crew.entries()) if (fame[i]) assert.deepEqual([op.fame, op.standing], fame[i]);
});

test('pulling out, from the call or any day, brings everyone home unhurt by it', () => {
  let s = fresh(5);
  const ids = s.crew.slice(0, 2).map((o) => o.id);
  s = sendExpedition(s, { goal: 'weapon', district: 'nightMarket', crewIds: ids });
  s = advanceDay(s);
  s = advanceDay(s);
  const hurt = ids.map((id) => s.crew.find((o) => o.id === id).condition.injury);
  const id = expeditionsOut(s)[0].id;
  s = pullOutExpedition(s, id);
  assert.equal(expeditionsOut(s).length, 0);
  assert.deepEqual(ids.map((x) => s.crew.find((o) => o.id === x).condition.injury), hurt, 'pulling out hurts nobody');
  for (const x of ids) assert.ok(s.crew.find((o) => o.id === x).condition.awayUntil <= s.day);
  assert.equal(reportOf(s).timeline.expedition.outcome, 'failed');
  let gave = 0;
  for (let seed = 1; seed <= 40 && gave < 3; seed++) {
    let t = fresh(seed);
    t = sendExpedition(t, { goal: 'weapon', district: 'docks', crewIds: t.crew.slice(0, 1).map((o) => o.id) });
    for (let i = 0; i < 8 && expeditionsOut(t).length && !call(t); i++) t = advanceDay(t);
    const m = call(t);
    if (!m) continue;
    const before = t.crew.map((o) => o.condition.injury);
    t = resolveDecision(t, m.id, 'give');
    gave++;
    assert.equal(expeditionsOut(t).length, 0);
    assert.deepEqual(t.crew.map((o) => o.condition.injury), before);
  }
  assert.ok(gave >= 1, 'a call came in');
});

test('a call fought on steady orders loses nobody and counts in the fight record', () => {
  let fought = 0;
  for (let seed = 1; seed <= 60 && fought < 4; seed++) {
    let s = fresh(seed);
    s = sendExpedition(s, { goal: 'weapon', district: 'docks', crewIds: s.crew.slice(0, 2).map((o) => o.id) });
    for (let i = 0; i < 8 && expeditionsOut(s).length && !call(s); i++) s = advanceDay(s);
    const m = call(s);
    if (!m) continue;
    const n = s.crew.length;
    const fights = s.crew.map((o) => o.record?.fights ?? 0);
    s = resolveDecision(s, m.id, 'auto');
    fought++;
    assert.equal(s.crew.length, n, 'nobody died on steady orders');
    assert.equal(s.memorial.length, 0);
    assert.equal(s.activeMission, null);
    assert.ok(s.crew.some((o, i) => (o.record?.fights ?? 0) > fights[i]), 'the fight is on the record');
    assert.equal(expeditionsOut(s).length, 0, 'the trip closed');
    assert.ok(reportOf(s));
  }
  assert.ok(fought >= 2, `calls fought (${fought})`);
});

test('a v86 save upgrades with nobody out on an expedition', async () => {
  const s = fresh(8);
  s.version = 86;
  delete s.expeditions;
  const loaded = await importSave({ text: async () => JSON.stringify(s) });
  assert.equal(loaded.version, SAVE_VERSION);
  assert.deepEqual(loaded.expeditions, { active: [], seq: 0 });
});
