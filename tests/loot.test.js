// The gear rarity ladder and drops on successful jobs (DESIGN.md 2026-11-13). Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame, SAVE_VERSION } from '../src/core/state.js';
import * as M from '../src/core/mission.js';
import { addOffer, templateById } from '../src/core/jobs.js';
import { autoRun } from '../src/core/autorun.js';
import { makeRng } from '../src/core/rng.js';
import { TIERS, LOOT, GEAR } from '../src/data/gear.js';
import { rollDrop, tierAt, liveTierFor, typeAt } from '../src/core/loot.js';
import { buyGear, itemName } from '../src/core/gear.js';
import { tierTag } from '../src/ui/gear.js';

globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
const { importSave } = await import('../src/save/save.js');

const LIVE = Object.keys(TIERS).filter((t) => TIERS[t].live);

test('the ladder is five tiers in order, each with a colour, a line and odds; Apex is the one that is not live yet', () => {
  assert.deepEqual(Object.keys(TIERS), ['standard', 'verified', 'custom', 'premium', 'apex']);
  assert.deepEqual(Object.values(TIERS).map((t) => t.colour), ['grey', 'green', 'blue', 'purple', 'gold']);
  assert.deepEqual(LIVE, ['standard', 'verified', 'custom', 'premium']);
  for (const t of Object.values(TIERS)) assert.ok(t.name && t.desc && typeof t.live === 'boolean' && t.step >= 0 && t.price >= 1);
  assert.equal(TIERS.verified.price, 2.5, 'Verified costs what Pro did');
  for (const id of ['verified', 'custom', 'premium', 'apex']) assert.equal(TIERS[id].step, 1, `${id} takes step 1: perks are the extra, not a bigger step`);
  assert.deepEqual(Object.values(TIERS).map((t) => t.perks), [0, 0, 1, 2, 2], 'Custom one perk, Premium two');
  const prices = Object.values(TIERS).map((t) => t.price);
  assert.deepEqual([...prices].sort((a, b) => a - b), prices, 'each tier costs more than the one below');
});

test('a tier tag always spells the tier name, with its colour class', () => {
  for (const [id, t] of Object.entries(TIERS)) {
    const html = tierTag({ tier: id });
    assert.ok(html.includes(`>${t.name}<`) && html.includes(`tiertag--${t.colour}`));
  }
  assert.ok(tierTag({}).includes('>Standard<'), 'no tier reads as Standard');
});

test('the shop only sells live tiers', () => {
  const s = createNewGame({ seed: 5 });
  s.cash = 1e6;
  assert.equal(buyGear(s, 'vest', 'verified').stash.at(-1).tier, 'verified');
  for (const t of ['custom', 'premium', 'apex']) assert.equal(buyGear(s, 'vest', t), s, `${t} is not for sale`);
  assert.deepEqual(Object.keys(TIERS).filter((t) => TIERS[t].sold), ['standard', 'verified'], 'the shop sells two tiers');
  assert.equal(itemName({ type: 'vest', tier: 'verified' }), 'Verified armoured vest');
});

test('tier first: odds hold whatever the pool holds, and a tier that is not live falls to the live one below', () => {
  const N = 20000;
  const rng = makeRng(7);
  const counts = {};
  for (let i = 0; i < N; i++) { const t = liveTierFor(tierAt(rng())); counts[t] = (counts[t] ?? 0) + 1; }
  assert.deepEqual(Object.keys(counts).sort(), ['custom', 'premium', 'standard', 'verified'], 'no tier that is not live ever drops');
  // Verified 28, Custom 10, Premium 4 plus the Apex 1 that falls down to it (Apex is not live yet) = 5%, Standard 57%.
  assert.ok(Math.abs(counts.verified / N - 0.28) < 0.02, `verified ${counts.verified / N}`);
  assert.ok(Math.abs(counts.custom / N - 0.10) < 0.015, `custom ${counts.custom / N}`);
  assert.ok(Math.abs(counts.premium / N - 0.05) < 0.01, `premium ${counts.premium / N}`);
  assert.ok(Math.abs(counts.standard / N - 0.57) < 0.02, `standard ${counts.standard / N}`);
  // Adding item types to a pool moves no tier's odds (the tier is rolled before the type).
  const before = JSON.stringify(LOOT.pool);
  const roll = () => { const r = makeRng(11); return Array.from({ length: 500 }, () => liveTierFor(tierAt(r()))); };
  const a = roll();
  LOOT.pool.verified.nothingYet = 500; LOOT.pool.standard.alsoNew = 500;
  try { assert.deepEqual(roll(), a, 'same tiers with fatter pools'); } finally { LOOT.pool = JSON.parse(before); }
  // The tier bands: top first, Standard the rest.
  assert.equal(tierAt(0), 'apex');
  assert.equal(tierAt(0.9999), 'standard');
  assert.equal(tierAt(0.005), 'apex');
  assert.equal(tierAt(0.02), 'premium');
  assert.equal(tierAt(0.1), 'custom');
  assert.equal(tierAt(0.3), 'verified');
  assert.equal(tierAt(0.5), 'standard');
});

test('every pooled type is real, every live tier has a pool, and a drop picks by weight', () => {
  for (const t of LIVE) {
    assert.ok(Object.keys(LOOT.pool[t]).length, `${t} has a pool`);
    for (const type of Object.keys(LOOT.pool[t])) assert.ok(GEAR[type], `${type} is a gear type`);
  }
  const seen = new Set();
  const rng = makeRng(3);
  for (let i = 0; i < 2000; i++) seen.add(typeAt('standard', rng()));
  assert.deepEqual([...seen].sort(), Object.keys(LOOT.pool.standard).sort());
  let drops = 0;
  const r = makeRng(9);
  for (let i = 0; i < 10000; i++) if (rollDrop(r)) drops++;
  assert.ok(Math.abs(drops / 10000 - LOOT.chance) < 0.02, `drop chance ${drops / 10000}`);
});

/** A fresh game with one job, sent hands-off with its first crew; the report and state after. */
function run(seed, templateId, { n = null, orders = 'steady' } = {}) {
  let s = createNewGame({ seed, startCrew: 'fresh' });
  s.jobs = [];
  addOffer(s, templateId);
  const size = n ?? templateById(templateId).crewSize;
  const start = s;
  s = M.startMission(s, s.jobs[0].id, s.crew.slice(0, size).map((o) => o.id), 'stealth');
  const done = autoRun(s, orders);
  return { start, done, am: done.activeMission, report: done.inbox.find((m) => m.type === 'report') };
}
const lootLine = (report) => report.timeline.outcome.find((o) => /^(Gear from the job|No gear this time)/.test(o.text));

test('a completed main job always reports one loot line: the item with its tier, or scrap cash', () => {
  let items = 0; let scrap = 0;
  for (let seed = 1; seed <= 60; seed++) {
    const { start, done, am, report } = run(seed, 'clinic');
    if (am.result.outcome !== 'completed') continue;
    const line = lootLine(report);
    assert.ok(line, `seed ${seed}: a loot line`);
    assert.equal(report.timeline.outcome.filter((o) => o === line).length, 1);
    if (line.tier) {
      items++;
      assert.equal(done.stash.length, start.stash.length + 1, 'the item is in the stash');
      const item = done.stash.at(-1);
      assert.equal(item.tier, line.tier);
      assert.ok(LIVE.includes(item.tier), 'a live tier');
      assert.ok(line.text.includes('Gear from the job'));
    } else {
      scrap++;
      assert.equal(done.stash.length, start.stash.length, 'no item');
      assert.match(line.text, /fenced scrap/);
    }
  }
  assert.ok(items > 5 && scrap > 5, `a mix of drops (${items}) and scrap (${scrap})`);
});

test('scrap is flat cash on a miss, and nothing drops on a job that was not completed', () => {
  const seen = new Set();
  let checked = 0;
  for (let seed = 1; seed <= 150; seed++) {
    const { start, done, am } = run(seed, 'clinic', { n: 1 });
    const completed = am.result.outcome === 'completed';
    if (!completed) {
      assert.ok(!done.inbox.find((m) => m.type === 'report').timeline.outcome.some((o) => /Gear from the job|No gear this time/.test(o.text)), `seed ${seed}: no loot line on ${am.result.outcome}`);
      assert.equal(done.stash.length, start.stash.length, `seed ${seed}: no item on ${am.result.outcome}`);
      seen.add(am.result.outcome);
    } else checked++;
  }
  assert.ok(checked > 0);
  assert.ok(seen.size > 0, 'the sample held a job that was not completed (abort or loss)');
});

test('the same seed drops the same thing, and a drop moves no roll in the shared stream', () => {
  const a = run(21, 'clinic');
  const b = run(21, 'clinic');
  assert.deepEqual(a.done.stash, b.done.stash);
  assert.deepEqual(lootFor(a.report), lootFor(b.report));
  // The loot rolls draw from a hash, never from the saved counter: with drops switched off the shared stream is identical.
  const chance = LOOT.chance;
  LOOT.chance = 0;
  try {
    const off = run(21, 'clinic');
    assert.equal(off.done.rngCounter, a.done.rngCounter, 'the shared counter did not move');
    assert.equal(off.am.result.outcome, a.am.result.outcome);
    assert.equal(off.am.result.pay, a.am.result.pay);
  } finally { LOOT.chance = chance; }
});
const lootFor = (report) => lootLine(report);

test('a v63 save upgrades gear tiers (street to standard, pro to verified) and nothing else called street or pro', async () => {
  const s = createNewGame({ seed: 63 });
  s.version = 63;
  s.stash = [{ uid: 'g1', type: 'vest', tier: 'street' }, { uid: 'g2', type: 'rifle', tier: 'pro', look: { frame: 'marksman', finish: 'carbon' } }];
  s.crew[0].gear = { armour: { uid: 'g3', type: 'vest', tier: 'pro' }, implants: [{ uid: 'g4', type: 'reflex', tier: 'street' }], bag: [{ item: { uid: 'g5', type: 'pistol', tier: 'pro' }, x: 0, y: 0 }] };
  s.crew[0].tier = 'pro';
  s.rank = 'street';
  s.armoury.offers = [{ oid: 'o1-rifle-pro-0', type: 'rifle', tier: 'pro', look: { frame: 'marksman', finish: 'carbon' }, name: 'X' }, { oid: 'o1-rifle-street-0', type: 'rifle', tier: 'street', look: { frame: 'marksman', finish: 'street' }, name: 'Y' }];
  const loaded = await importSave({ text: async () => JSON.stringify(s) });
  assert.equal(loaded.version, SAVE_VERSION);
  assert.equal(SAVE_VERSION, 65);
  assert.deepEqual(loaded.stash.map((i) => i.tier), ['standard', 'verified']);
  const g = loaded.crew[0].gear;
  assert.equal(g.armour.tier, 'verified');
  assert.equal(g.implants[0].tier, 'standard');
  assert.equal(g.bag[0].item.tier, 'verified');
  assert.deepEqual(loaded.armoury.offers.map((o) => o.tier), ['verified', 'standard']);
  assert.equal(loaded.crew[0].tier, 'pro', 'a runner tier is left alone');
  assert.equal(loaded.rank, 'street', 'a tong rank is left alone');
  for (const item of loaded.stash) assert.ok(TIERS[item.tier], 'every item tier is on the ladder');
});

test('a side task never drops gear and never fences scrap', async () => {
  const { sendOnSideTask, returnSideTasks } = await import('../src/core/sidetasks.js');
  let s = createNewGame({ seed: 12, startCrew: 'fresh' });
  const taskId = s.sideBoard?.[0];
  assert.ok(taskId, 'a task on the board');
  const out = sendOnSideTask(s, taskId, [s.crew[0].id]);
  assert.notEqual(out, s, 'sent');
  const done = structuredClone(out);
  done.day = out.sideOut[0].returnDay;
  const stash = done.stash.length;
  returnSideTasks(done);
  assert.equal(done.sideOut.length, 0, 'it came back');
  assert.equal(done.stash.length, stash);
  assert.ok(!done.inbox.some((m) => /Gear from the job|No gear this time/.test(m.body ?? '')));
});
