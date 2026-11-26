// Who grew while away (core/grew.js; owner, 2026-11-26). The promises: an expedition's report and a security post's
// report say exactly what each runner gained while out (every stat that rose a whole point, from its first value to
// its last, and nothing that didn't); a rookie who graduates away from home gets a message and a history line; the
// report's crew cards show it; and a save from before (v91) upgrades with nothing kept yet. Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame, SAVE_VERSION } from '../src/core/state.js';
import { advanceDay } from '../src/core/time.js';
import { resolveDecision } from '../src/core/decisions.js';
import { sendExpedition, expeditionsOut } from '../src/core/expeditions.js';
import { takeContract, contractsOf } from '../src/core/contracts.js';
import { availability } from '../src/core/crew.js';
import { keepGrowth, sumGrowth, growthText } from '../src/core/grew.js';
import { GOALS } from '../src/data/expeditions.js';
import { pointCost, prepareOperative } from '../src/core/development.js';

globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
const { importSave } = await import('../src/save/save.js');

const fresh = (seed) => createNewGame({ seed, startCrew: 'fresh' });
const statsOf = (s, ids) => Object.fromEntries(ids.map((id) => [id, { ...s.crew.find((o) => o.id === id).stats }]));

/** What actually rose, runner by runner: [{ opId, stat, from, to }]. */
function rises(before, after) {
  const out = [];
  for (const [id, b] of Object.entries(before)) for (const [stat, from] of Object.entries(b)) if (after[id][stat] > from) out.push({ opId: id, stat, from, to: after[id][stat] });
  return out;
}
const key = (g) => `${g.opId}:${g.stat}:${g.from}:${g.to}`;

test('the rises fold per runner and stat, first value to last, and read as one line', () => {
  const grew = [
    { opId: 'a', handle: 'Mei', stat: 'stealth', from: 11, to: 12 },
    { opId: 'b', handle: 'Pike', stat: 'tech', from: 6, to: 7 },
    { opId: 'a', handle: 'Mei', stat: 'stealth', from: 12, to: 13 },
    { opId: 'a', handle: 'Mei', stat: 'social', from: 9, to: 10 },
  ];
  assert.deepEqual(sumGrowth(grew).map(key), ['a:stealth:11:13', 'b:tech:6:7', 'a:social:9:10']);
  assert.equal(growthText(grew), 'Mei stealth 11→13, social 9→10; Pike tech 6→7');
  assert.equal(growthText([]), '');
});

test('a rookie who graduates while away gets a message and a history line', () => {
  const s = fresh(1);
  const op = s.crew[0];
  const holder = {};
  keepGrowth(s, holder, op, { events: [], graduated: true }, 'a weapon expedition');
  assert.deepEqual(holder.graduated, [op.id]);
  assert.ok(op.history.at(-1).endsWith('graduated from rookie'));
  assert.match(s.inbox[0].subject, new RegExp(`${op.handle} isn't a rookie any more`));
  assert.match(s.inbox[0].body, /Out on a weapon expedition/);
});

test("an expedition's report says exactly what each runner gained while out", () => {
  let checked = 0;
  for (let seed = 1; seed <= 30 && checked < 3; seed++) {
    for (const goal of Object.keys(GOALS)) {
      let s = fresh(seed);
      const ids = s.crew.slice(0, 2).map((o) => o.id);
      // With today's numbers a trip gives about a point of experience a day, a stat point costs 25 or more: start the
      // runners a hair short of their next point in every stat, so a trip's experience tips some of them over.
      for (const id of ids) {
        const op = s.crew.find((o) => o.id === id);
        prepareOperative(op);
        for (const st of Object.keys(op.stats)) op.progress[st] = Math.max(0, pointCost(op.stats[st], op.potential?.[st] ?? op.stats[st]) - 0.5);
      }
      s = sendExpedition(s, { goal, district: 'docks', crewIds: ids });
      const before = statsOf(s, ids);
      for (let i = 0; i < GOALS[goal].days + 2 && expeditionsOut(s).length; i++) {
        s = advanceDay(s);
        for (let m = s.inbox.find((x) => x.kind === 'expedition' && !x.resolved); m; m = s.inbox.find((x) => x.kind === 'expedition' && !x.resolved)) s = resolveDecision(s, m.id, 'give');
      }
      const report = s.inbox.find((m) => m.timeline?.expedition);
      if (!report || ids.some((id) => !s.crew.find((o) => o.id === id))) continue;
      const truth = rises(before, statsOf(s, ids));
      assert.deepEqual(report.back.growth.map(key).sort(), truth.map(key).sort(), `seed ${seed} ${goal}: the report matches the runners`);
      if (truth.length) {
        assert.ok(report.timeline.outcome.some((o) => o.text.startsWith('Came back sharper: ')), 'and says it in words');
        checked++;
      } else assert.ok(!report.timeline.outcome.some((o) => o.text.startsWith('Came back sharper')), 'nothing said when nobody grew');
    }
  }
  assert.ok(checked >= 1, 'at least one trip where someone grew');
});

test("a security post's report says what its runners gained", () => {
  let s = fresh(4);
  const offer = contractsOf(s).offers[0];
  const ids = s.crew.filter((o) => availability(s, o).ok).slice(0, offer.slots).map((o) => o.id);
  s = takeContract(s, offer.id, ids);
  for (const id of ids) {
    const op = s.crew.find((o) => o.id === id);
    prepareOperative(op);
    for (const st of Object.keys(op.stats)) op.progress[st] = Math.max(0, pointCost(op.stats[st], op.potential?.[st] ?? op.stats[st]) - 0.5);
  }
  const before = statsOf(s, ids);
  const c = contractsOf(s).active[0];
  for (let i = 0; i < 40 && !s.inbox.some((m) => m.id === `ct-done-${c.id}`); i++) {
    s = advanceDay(s);
    for (let m = s.inbox.find((x) => x.kind === 'contract' && !x.resolved); m; m = s.inbox.find((x) => x.kind === 'contract' && !x.resolved)) s = resolveDecision(s, m.id, 'give');
  }
  const report = s.inbox.find((m) => m.id === `ct-done-${c.id}`);
  if (!report) return; // given up after a hit: no end report to read
  const truth = rises(before, statsOf(s, ids));
  assert.deepEqual(report.back.growth.map(key).sort(), truth.map(key).sort());
  assert.equal(report.back.post, true);
  assert.equal(report.back.away, undefined, 'no back-home card on Today for a post');
  if (truth.length) assert.match(report.body, /Came back sharper: /);
});

test('a v91 save with a trip and a post out upgrades with nothing kept yet', async () => {
  let s = fresh(5);
  s = sendExpedition(s, { goal: 'cash', district: 'docks', crewIds: [s.crew[0].id] });
  const offer = contractsOf(s).offers[0];
  s = takeContract(s, offer.id, s.crew.filter((o) => availability(s, o).ok).slice(0, offer.slots).map((o) => o.id));
  for (const e of s.expeditions.active) { delete e.grew; delete e.graduated; }
  for (const c of s.contracts.active) { delete c.grew; delete c.graduated; }
  s.version = 91;
  const loaded = await importSave({ text: async () => JSON.stringify(s) });
  assert.equal(loaded.version, SAVE_VERSION);
  for (const e of loaded.expeditions.active) { assert.deepEqual(e.grew, []); assert.deepEqual(e.graduated, []); }
  for (const c of loaded.contracts.active) { assert.deepEqual(c.grew, []); assert.deepEqual(c.graduated, []); }
});

test("the report's crew cards show who grew", async () => {
  const { boot } = await import('./nav-harness.js');
  let s = fresh(6);
  const ids = s.crew.slice(0, 2).map((o) => o.id);
  s.inbox.unshift({
    id: 'exp-test', type: 'report', day: s.day, subject: 'A weapon, the Docks: got it', body: 'Got it.', read: false, blocking: false,
    back: { crewIds: ids, pay: 0, away: true, expedition: true, growth: [{ opId: ids[0], handle: s.crew[0].handle, stat: 'stealth', from: 11, to: 12 }], graduated: [ids[0]] },
    timeline: { result: 'completed', steps: [], outcome: [{ tone: 'good', text: 'Nobody hurt.' }], days: [], expedition: { goal: 'weapon', district: 'docks', outcome: 'met' } },
  });
  const app = await boot({ state: s });
  app.click('nav', 'inbox');
  app.click('open-message', 'exp-test');
  const html = app.html();
  assert.match(html, /rcrew__op[^"]*is-grew/, 'the runner who grew is lit');
  assert.match(html, /<b>\+1 Stealth<\/b>/, 'with a chip per stat');
  assert.match(html, /<b class="is-tier">Now a pro<\/b>/, 'and the graduation');
  assert.equal((html.match(/is-grew/g) ?? []).length, 1, 'the other runner is not lit');
});
