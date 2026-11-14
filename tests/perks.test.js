// Gear perks (DESIGN.md 2026-11-14): Custom carries one, Premium two, rolled from the item's own hash.
// Perks are sideways (never the item's own stat), come from jobs alone, and are read by the same rules as
// the rest of the gear. Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame, SAVE_VERSION } from '../src/core/state.js';
import * as M from '../src/core/mission.js';
import { addOffer, templateById } from '../src/core/jobs.js';
import { autoRun } from '../src/core/autorun.js';
import { effectiveStat } from '../src/core/crew.js';
import { PERKS, PERK_CAPS } from '../src/data/gearPerks.js';
import { APEX_GEAR } from '../src/data/apexGear.js';
import { GEAR, TIERS, LOOT } from '../src/data/gear.js';
import { makeItem, perksFor, mainKeys, rollPerks, perksOf, perkSum, gearMods, seriousGuard, patchBonus, neuralFloor, overwatchKit, buyGear, sellPrice, priceOf } from '../src/core/gear.js';
import { weaponOf, armourOf, runnerOf as battleRunner, BATTLE } from '../src/core/battle.js';
import { runnerOf as fightRunner } from '../src/core/fight.js';
import { refreshArmoury } from '../src/core/looks.js';
import { rollDrop } from '../src/core/loot.js';
import { makeRng } from '../src/core/rng.js';
import { perkList, tierTag } from '../src/ui/gear.js';
import { arm } from './play.js';

globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
const { importSave } = await import('../src/save/save.js');

const TYPES = Object.keys(GEAR);
const fresh = (seed = 3) => createNewGame({ seed, startCrew: 'fresh' });
const withKit = (...kit) => { const s = fresh(); const op = s.crew.find((o) => o.role !== 'medic') ?? s.crew[0]; arm(s, op.id, ...kit); return op; }; // never the medic: a healer already

test('perks are data: about a dozen, each with a name, a plain line, a weight, one effect and real item types', () => {
  const ids = Object.keys(PERKS);
  assert.ok(ids.length >= 10 && ids.length <= 14, `${ids.length} perks`);
  const known = new Set(['bonus', 'serious', 'patch', 'armour', 'pierce', 'damage', 'uses', 'heat', 'floor']);
  for (const [id, p] of Object.entries(PERKS)) {
    assert.ok(p.name && p.desc && p.desc.endsWith('.') && p.weight > 0, id);
    assert.equal(Object.keys(p.effect).length, 1, `${id} has one effect`);
    assert.ok(known.has(Object.keys(p.effect)[0]), `${id} effect is one the rules read`);
    for (const t of p.types) assert.ok(GEAR[t], `${id}: ${t} is a gear type`);
    assert.ok(!p.desc.includes('—'), 'no em dashes in game text');
  }
  assert.equal(new Set(ids.map((i) => PERKS[i].name)).size, ids.length, 'names are distinct');
  for (const k of Object.keys(PERK_CAPS)) assert.ok(known.has(k), `cap for ${k}`);
});

test('every item type can roll at least three perks, and none of them adds to the item\'s own stat', () => {
  for (const type of TYPES) {
    const list = perksFor(type);
    assert.ok(list.length >= 3, `${type} rolls ${list.length} perks`);
    const main = mainKeys(type);
    for (const p of list) {
      const keys = Object.entries(p.effect).flatMap(([k, v]) => (k === 'bonus' ? Object.keys(v).map((s) => `bonus:${s}`) : [k]));
      for (const k of keys) assert.ok(!main.has(k), `${p.id} on ${type} would add to ${k}`);
      // Spelled out, so the rule is not only the code's own word for it.
      for (const stat of Object.keys(p.effect.bonus ?? {})) {
        assert.ok(!(stat in (GEAR[type].bonus ?? {})), `${p.id} gives ${type} a second ${stat}`);
        assert.notEqual(GEAR[type].overwatch?.stat, stat, `${p.id} adds to ${type}'s overwatch stat`);
      }
      if (type === 'pistol' || GEAR[type].overwatch) assert.equal(p.effect.damage, undefined, `${p.id} adds damage to a weapon`);
      if (type === 'vest') assert.ok(!p.effect.armour && !p.effect.serious, `${p.id} adds to the vest`);
      if (type === 'medkit') assert.ok(!p.effect.patch, `${p.id} adds to the trauma kit`);
    }
  }
  // The data does not list a type a perk can never roll on.
  for (const [id, p] of Object.entries(PERKS)) for (const t of p.types) assert.ok(perksFor(t).some((x) => x.id === id), `${id} is listed for ${t} but would never roll`);
});

test('Custom rolls exactly one perk, Premium exactly two different ones, Standard and Verified none', () => {
  const s = fresh(7);
  for (const type of TYPES) {
    assert.equal(makeItem(s, type, 'standard').perks, undefined);
    assert.equal(makeItem(s, type, 'verified').perks, undefined);
    for (let i = 0; i < 40; i++) {
      const c = makeItem(s, type, 'custom');
      const p = makeItem(s, type, 'premium');
      assert.equal(c.perks.length, 1, `${type} custom`);
      assert.equal(p.perks.length, 2, `${type} premium`);
      assert.notEqual(p.perks[0], p.perks[1], 'two different perks');
      const valid = new Set(perksFor(type).map((x) => x.id));
      for (const id of [...c.perks, ...p.perks]) assert.ok(valid.has(id), `${id} is valid on ${type}`);
    }
  }
});

test('the same seed rolls the same item, a different seed a different spread, and rolling a perk moves no shared roll', () => {
  const a = fresh(11); const b = fresh(11);
  const counter = a.rngCounter;
  const ia = ['premium', 'custom', 'premium', 'custom'].map((t, i) => makeItem(a, ['reflex', 'pistol', 'rifle', 'deck'][i], t));
  const ib = ['premium', 'custom', 'premium', 'custom'].map((t, i) => makeItem(b, ['reflex', 'pistol', 'rifle', 'deck'][i], t));
  assert.deepEqual(ia, ib);
  assert.equal(a.rngCounter, counter, 'the saved counter did not move');
  assert.deepEqual(rollPerks(5, 'g9', 'reflex', 2), rollPerks(5, 'g9', 'reflex', 2));
  const spread = new Set();
  for (let seed = 1; seed <= 60; seed++) spread.add(rollPerks(seed, 'g1', 'reflex', 2).join());
  assert.ok(spread.size > 10, `${spread.size} different pairs across seeds`);
  // Every perk a type can roll does come up, so the weights are not dead.
  for (const type of TYPES) {
    const seen = new Set();
    for (let i = 0; i < 400; i++) rollPerks(1, `g${i}`, type, 1).forEach((x) => seen.add(x));
    assert.deepEqual([...seen].sort(), perksFor(type).map((x) => x.id).sort(), `${type} reaches all its perks`);
  }
  // Perks do not change the look or the name a gun rolls (they have a hash of their own).
  const plain = makeItem(fresh(11), 'rifle', 'verified');
  const perked = makeItem(fresh(11), 'rifle', 'custom');
  assert.deepEqual(plain.look, perked.look);
  assert.equal(plain.name, perked.name);
});

test('a perk adds a bonus in another stat, named in the roll breakdown, and is capped per stat', () => {
  const op = withKit('vest:custom:muffled');
  const base = withKit('vest:verified');
  assert.deepEqual(gearMods(op, 'stealth'), [{ value: 1, note: 'Muffled fittings +1' }]);
  assert.deepEqual(gearMods(op, 'combat'), []);
  assert.equal(effectiveStat(op, 'stealth').value, effectiveStat(base, 'stealth').value + 1);
  assert.ok(effectiveStat(op, 'stealth').notes.some((n) => n.includes('Muffled fittings +1')), 'the breakdown names the perk');
  // The vest's own numbers are the Verified vest's: the perk is the extra, not a bigger step.
  assert.equal(armourOf(op).value, armourOf(base).value);
  assert.equal(seriousGuard(op), seriousGuard(base));
  // Four stealth perks across the kit give +2, not +4.
  const many = withKit('vest:custom:muffled', 'pistol:custom:muffled', 'deck:custom:muffled', 'medkit:custom:muffled');
  assert.equal(gearMods(many, 'stealth').reduce((n, m) => n + m.value, 0), PERK_CAPS.bonus);
  // A duplicate of the same kind counts once (the best), perks and all.
  const twin = withKit('vest:custom:muffled', 'vest:custom:padded');
  assert.equal(gearMods(twin, 'stealth').length + gearMods(twin, 'cool').length, 1);
});

test('serious guard, patch, neural floor and overwatch perks reach the rules that read them', () => {
  assert.ok(Math.abs(seriousGuard(withKit('deck:custom:shockpad')) - seriousGuard(withKit('deck'))  - 0.05) < 1e-9);
  assert.ok(seriousGuard(withKit('deck:premium:shockpad+sutures', 'picks:custom:shockpad', 'medkit:custom:shockpad')) - 0 <= PERK_CAPS.serious + 1e-9);
  assert.equal(patchBonus(withKit('vest:custom:sutures')), 1);
  assert.equal(patchBonus(withKit('medkit:custom:padded')), GEAR.medkit.patch, 'a medkit keeps its own patch');
  assert.equal(neuralFloor(withKit('reflex')), 10);
  assert.equal(neuralFloor(withKit('reflex:custom:damped')), 5);
  assert.equal(neuralFloor(withKit('reflex:custom:damped', 'cortex:custom:damped')), 10, 'two floors of 10, 10 off in all');
  assert.equal(neuralFloor(withKit('vest:custom:muffled')), 0, 'never below nothing');
  const plain = overwatchKit(withKit('rifle:verified'), 'rifle');
  const mag = overwatchKit(withKit('rifle:custom:magazine'), 'rifle');
  const sup = overwatchKit(withKit('rifle:custom:suppressor'), 'rifle');
  assert.equal(mag.uses, plain.uses + 1);
  assert.equal(mag.bonus, plain.bonus, 'the roll bonus is the tier step alone');
  assert.equal(plain.heat, 1);
  assert.equal(sup.heat, 0);
  assert.equal(overwatchKit(withKit('drone:premium:magazine+padded'), 'drone').uses, GEAR.drone.overwatch.uses + 1);
});

test('fight perks: armour, pierce and damage reach both engines', () => {
  const w0 = weaponOf(withKit('pistol:verified'));
  const w1 = weaponOf(withKit('pistol:custom:hardened'));
  assert.equal(w1.pierce, w0.pierce + 1);
  assert.equal(w1.damage, w0.damage, 'the same damage and aim: the tier step and the perk are separate');
  assert.equal(weaponOf(withKit('reflex:custom:overlay')).damage, BATTLE.unarmed.damage + 1, 'an overlay helps the unarmed too');
  assert.equal(weaponOf(withKit('pistol:verified', 'reflex:custom:overlay')).damage, w0.damage + 1);
  assert.equal(armourOf(withKit('vest:verified')).value, 2);
  assert.equal(armourOf(withKit('vest:verified', 'reflex:custom:weave')).value, 3);
  assert.equal(armourOf(withKit('reflex:custom:weave')).value, 1);
  assert.equal(armourOf(withKit('reflex:custom:weave')).name, 'skin weave');
  assert.equal(armourOf(withKit('vest:verified', 'reflex:premium:weave+overlay', 'cortex:custom:weave')).value, 3, 'perk armour caps at +1');
  // Engine 1 numbers on the runner as they enter the fight.
  const r = battleRunner(withKit('pistol:custom:hardened', 'vest:standard', 'reflex:custom:weave'), 'loud');
  assert.equal(r.pierce, 1); assert.equal(r.armour, 2);
  // Engine 2: a piercing weapon, one more soak (a standard vest becomes a pro one), a healer.
  assert.equal(fightRunner(withKit('pistol:custom:hardened'), 'loud').ap, true);
  assert.equal(fightRunner(withKit('pistol:verified'), 'loud').ap, false);
  assert.equal(fightRunner(withKit('vest:standard'), 'loud').absorb, 1);
  assert.equal(fightRunner(withKit('vest:standard', 'reflex:custom:weave'), 'loud').absorb, 2);
  assert.equal(fightRunner(withKit('vest:custom:sutures'), 'loud').healer, false, 'a suture strip does not make a healer of a runner');
  assert.equal(fightRunner(withKit('medkit:custom:padded'), 'loud').healer, true, 'a trauma kit still does');
});

test('only jobs make Custom and Premium: the shop, the weekly shelf and recruits never do', () => {
  const s = fresh(9);
  s.cash = 1e7;
  for (const tier of ['custom', 'premium', 'apex']) for (const type of TYPES) assert.equal(buyGear(s, type, tier), s);
  for (let w = 0; w < 30; w++) {
    s.day = w * 7 + 1;
    refreshArmoury(s);
    for (const o of s.armoury.offers) { assert.ok(['standard', 'verified'].includes(o.tier), `shelf tier ${o.tier}`); assert.equal(o.perks, undefined); }
  }
  assert.ok(buyGear(s, 'vest', 'verified').stash.every((i) => !i.perks));
  for (const op of fresh(4).crew) for (const i of [op.gear.armour, ...op.gear.implants, ...op.gear.bag.map((b) => b.item)].filter(Boolean)) assert.equal(i.perks, undefined);
  // Apex is live, but only while a named piece is left to find (tests/apex.test.js): with every piece found it falls to Premium.
  assert.equal(TIERS.apex.live, true);
  const r = makeRng(2); const tiers = new Set();
  for (let i = 0; i < 4000; i++) { const d = rollDrop(r, Object.keys(APEX_GEAR)); if (d) tiers.add(d.tier); }
  assert.deepEqual([...tiers].sort(), ['custom', 'premium', 'standard', 'verified']);
});

test('the fence pays more for Custom and Premium, in order, and a perk changes no price', () => {
  for (const type of TYPES) {
    const p = ['standard', 'verified', 'custom', 'premium'].map((t) => priceOf(type, t));
    assert.deepEqual([...p].sort((a, b) => a - b), p, `${type} prices rise with the tier`);
    assert.ok(p[3] > p[1]);
  }
  const s = fresh();
  const a = makeItem(s, 'deck', 'custom'); const b = { ...a, perks: ['padded'] };
  assert.equal(sellPrice(a), sellPrice(b));
});

/** A fresh game with one job, sent hands-off with its first crew; the report after. */
function run(seed, templateId) {
  let s = createNewGame({ seed, startCrew: 'fresh' });
  s.jobs = [];
  addOffer(s, templateId);
  const start = s;
  s = M.startMission(s, s.jobs[0].id, s.crew.slice(0, templateById(templateId).crewSize).map((o) => o.id), 'stealth');
  const done = autoRun(s, 'steady');
  return { start, done, report: done.inbox.find((m) => m.type === 'report') };
}

test('a drop of a Custom or Premium item lands in the stash with its perks, and the report line names them', () => {
  const seen = { custom: 0, premium: 0 };
  for (let seed = 1; seed <= 400 && (seen.custom < 2 || seen.premium < 2); seed++) {
    const { start, done, report } = run(seed, 'clinic');
    const line = report?.timeline?.outcome.find((o) => /^Gear from the job/.test(o.text));
    if (!line || !['custom', 'premium'].includes(line.tier)) continue;
    const item = done.stash.at(-1);
    assert.equal(item.tier, line.tier);
    assert.equal(item.perks.length, line.tier === 'custom' ? 1 : 2);
    assert.deepEqual(line.perks, item.perks);
    assert.equal(done.stash.length, start.stash.length + 1);
    seen[line.tier]++;
  }
  assert.ok(seen.custom >= 2 && seen.premium >= 2, `found drops: ${JSON.stringify(seen)}`);
});

test('perks cost cautious and steady crews nobody: a crew in full perked kit loses no one without a call-in', () => {
  const kit = ['vest:premium:sutures+padded', 'pistol:premium:hardened+padded', 'reflex:premium:damped+shockpad', 'medkit:custom:padded'];
  for (const orders of ['cautious', 'steady']) {
    for (let seed = 1; seed <= 12; seed++) {
      let s = fresh(seed);
      s.jobs = [];
      addOffer(s, 'warehouse');
      const crew = s.crew.slice(0, templateById('warehouse').crewSize);
      for (const op of crew) arm(s, op.id, ...kit);
      s = M.startMission(s, s.jobs[0].id, crew.map((o) => o.id), 'loud');
      const am = autoRun(s, orders).activeMission;
      assert.ok(!(am.events ?? []).some((e) => e.kind === 'death'), `${orders} seed ${seed}: a death`);
      assert.notEqual(am.result?.outcome, 'loss', `${orders} seed ${seed}`);
    }
  }
});

test('the perk list shows each name, with its line behind a tap and nothing only on hover', () => {
  const html = perkList({ tier: 'premium', perks: ['muffled', 'weave'] });
  assert.ok(html.includes('Muffled fittings') && html.includes('Skin weave'));
  assert.ok(html.includes(PERKS.muffled.desc) && html.includes('<details'), 'the line is in a details the player taps');
  assert.ok(!/title=|:hover/.test(html), 'no hover-only text');
  assert.ok(html.includes('perks--purple'));
  assert.equal(perkList({ tier: 'verified' }), '');
  assert.equal(perkList(['nothing-real']), '', 'an unknown id shows nothing');
  assert.ok(perkList(['padded'], 'custom').includes('perks--blue'));
  assert.ok(tierTag({ tier: 'custom' }).includes('>Custom<') && tierTag({ tier: 'premium' }).includes('>Premium<'));
});

test('a v65 save loads at the new version; a Custom item missing its perks is given them', async () => {
  const s = createNewGame({ seed: 64 });
  s.version = 65;
  s.stash = [{ uid: 'g1', type: 'vest', tier: 'verified' }, { uid: 'g2', type: 'reflex', tier: 'custom' }, { uid: 'g3', type: 'deck', tier: 'premium', perks: ['padded', 'muffled'] }];
  const loaded = await importSave({ text: async () => JSON.stringify(s) });
  assert.equal(loaded.version, SAVE_VERSION);
  assert.equal(SAVE_VERSION, 68);
  assert.equal(loaded.stash[0].perks, undefined, 'a Verified item stays plain');
  assert.deepEqual(loaded.stash[1].perks, rollPerks(s.seed, 'g2', 'reflex', 1));
  assert.deepEqual(loaded.stash[2].perks, ['padded', 'muffled'], 'perks already there are kept');
  assert.equal(perksOf(loaded.stash[2]).length, 2);
  assert.equal(perkSum([loaded.stash[2]], 'serious'), 0);
});

test('Custom and Premium have pools, and Apex has none (its pieces are data/apexGear.js)', () => {
  for (const t of ['custom', 'premium']) assert.ok(Object.keys(LOOT.pool[t]).length);
  assert.equal(LOOT.pool.apex, undefined);
});
