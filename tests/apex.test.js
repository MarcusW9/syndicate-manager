// Apex gear (2026-11-14, owner: "a named piece with a history"): eight hand-written pieces, each found at most once a
// save, one a runner, each with a fixed unique perk the rules read like any other. Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame, SAVE_VERSION } from '../src/core/state.js';
import * as M from '../src/core/mission.js';
import { addOffer, templateById } from '../src/core/jobs.js';
import { autoRun } from '../src/core/autorun.js';
import { APEX_GEAR } from '../src/data/apexGear.js';
import { PERK_CAPS } from '../src/data/gearPerks.js';
import { SIDEARM_LOOKS, RIFLE_LOOKS, TOOL_FRAMES } from '../src/data/gearLooks.js';
import { GEAR, TIERS, LOOT } from '../src/data/gear.js';
import { makeApex, makeItem, mainKeys, perksOf, perkSum, perkById, gearMods, seriousGuard, patchBonus, neuralFloor, overwatchKit, buyGear, sellGear, equip, canCarry, apexLeft, carried, itemTitle } from '../src/core/gear.js';
import { weaponOf, armourOf } from '../src/core/battle.js';
import { runnerOf as fightRunner } from '../src/core/fight.js';
import { refreshArmoury } from '../src/core/looks.js';
import { rollDrop, lootFor } from '../src/core/loot.js';
import { makeRng } from '../src/core/rng.js';
import { perkList, apexHistory, renderGearSheet, renderArmoury, renderLoadout } from '../src/ui/gear.js';
import { gearArt } from '../src/ui/art.js';

globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
const { importSave } = await import('../src/save/save.js');

const IDS = Object.keys(APEX_GEAR);
const fresh = (seed = 3) => createNewGame({ seed, startCrew: 'fresh' });
const ui = { esc: (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]), money: (n) => `¥${n}`, face: () => '', statusChip: () => '' };
/** Wear or carry a named piece on a runner directly (no stash round trip). */
const wear = (state, op, id) => {
  const item = makeApex(state, id);
  op.gear = { armour: null, implants: [], bag: [], ...(op.gear ?? {}) };
  if (item.type === 'vest') op.gear.armour = item;
  else if (item.type === 'reflex' || item.type === 'cortex') op.gear.implants.push(item);
  else op.gear.bag.push({ item, x: 0, y: op.gear.bag.length ? 1 : 0 });
  return item;
};
/** Run with every drop an Apex one (the tier odds and the drop chance forced), then put them back. */
const forceApex = (fn) => {
  const { chance } = LOOT; const { drop } = TIERS.apex;
  LOOT.chance = 1; TIERS.apex.drop = 100;
  try { return fn(); } finally { LOOT.chance = chance; TIERS.apex.drop = drop; }
};

test('eight named pieces, most types covered, each valid: a real type, a look that draws, a history, one unique perk the rules read', () => {
  assert.equal(IDS.length, 8);
  const types = IDS.map((id) => APEX_GEAR[id].type);
  assert.ok(types.filter((t) => t === 'pistol').length >= 2, 'two sidearms');
  for (const t of ['rifle', 'vest', 'deck', 'reflex', 'cortex']) assert.ok(types.includes(t), `a ${t}`);
  assert.ok(types.some((t) => ['drone', 'medkit', 'picks'].includes(t)), 'a drone, trauma kit or ghost kit');
  assert.equal(new Set(IDS.map((id) => APEX_GEAR[id].name)).size, 8, 'names are different');
  const known = new Set(['bonus', 'serious', 'patch', 'armour', 'pierce', 'damage', 'uses', 'heat', 'floor']);
  const STATS = new Set(['combat', 'stealth', 'tech', 'social', 'piloting', 'medical', 'cool', 'endurance']);
  for (const id of IDS) {
    const p = APEX_GEAR[id];
    assert.ok(GEAR[p.type], `${id}: known type`);
    assert.ok(p.name && p.history.length > 40 && p.history.endsWith('.'), `${id}: a name and a history`);
    assert.ok((p.history.match(/\./g) ?? []).length <= 2, `${id}: one or two sentences`);
    assert.ok(p.perk.name && p.perk.desc.endsWith('.'), `${id}: a perk with a plain line`);
    assert.ok(!/—/.test(p.history + p.perk.desc), 'no em dashes in game text');
    const keys = Object.keys(p.perk.effect);
    assert.ok(keys.length >= 1 && keys.every((k) => known.has(k)), `${id}: effects the rules read`);
    for (const stat of Object.keys(p.perk.effect.bonus ?? {})) assert.ok(STATS.has(stat), `${id}: ${stat} is a stat`);
    // Like an ordinary perk it never adds to what its own item boosts.
    const main = mainKeys(p.type);
    const own = keys.flatMap((k) => (k === 'bonus' ? Object.keys(p.perk.effect.bonus).map((s) => `bonus:${s}`) : [k]));
    for (const k of own) assert.ok(!main.has(k), `${id}: ${k} would stack on the item's own stat`);
    // Within the caps on its own, so a stack of perks can only be held down further.
    for (const [k, v] of Object.entries(p.perk.effect)) if (k !== 'bonus' && PERK_CAPS[k] != null) assert.ok(Math.abs(v) <= PERK_CAPS[k], `${id}: ${k} within its cap`);
    for (const v of Object.values(p.perk.effect.bonus ?? {})) assert.ok(v <= PERK_CAPS.bonus);
    // Its look is real, and the item draws.
    const L = p.type === 'pistol' ? SIDEARM_LOOKS : p.type === 'rifle' ? RIFLE_LOOKS : null;
    if (L) { assert.ok(L.frames[p.look.frame] && L.finishes[p.look.finish], `${id}: frame and finish exist`); if (p.look.charm) assert.ok(L.charms[p.look.charm]); }
    else assert.ok(TOOL_FRAMES[p.type]?.[p.look.frame], `${id}: a real frame`);
    assert.ok(gearArt(makeApex(fresh(), id)), `${id}: it draws`);
  }
});

test('Apex is a live tier with a step like Verified, no ordinary perks, no price in the shop and no pool', () => {
  assert.equal(TIERS.apex.live, true);
  assert.equal(TIERS.apex.step, 1);
  assert.equal(TIERS.apex.perks, 0);
  assert.equal(TIERS.apex.drop, 1, 'the 1-in-100 odds stay');
  assert.equal(LOOT.pool.apex, undefined);
  const s = fresh();
  s.cash = 1e7;
  for (const type of Object.keys(GEAR)) assert.equal(buyGear(s, type, 'apex'), s, `${type}: Apex is not sold`);
  for (let w = 0; w < 30; w++) { s.day = w * 7 + 1; refreshArmoury(s); assert.ok(s.armoury.offers.every((o) => o.tier !== 'apex')); }
  for (const op of fresh(4).crew) assert.ok(carried(op).every((i) => !i.apex), 'recruits never arrive with one');
});

test('a piece drops at most once a save, whatever becomes of it, and Apex falls to Premium when all are found', () => {
  forceApex(() => {
    const s = fresh(8);
    const got = [];
    for (let i = 0; i < 8; i++) {
      const line = lootFor(s, `job${i}`);
      assert.equal(line.tier, 'apex');
      assert.ok(IDS.includes(line.apex));
      assert.deepEqual(line.perks, [`apex:${line.apex}`], 'the line names the unique perk');
      got.push(line.apex);
      if (i === 2) { const lost = s.stash.pop(); s.crew[0].gear = { armour: null, implants: [], bag: [{ item: lost, x: 0, y: 0 }] }; s.crew.shift(); } // lost with a runner
      if (i === 4) s.stash = s.stash.filter((it) => it.uid !== s.stash.at(-1).uid); // fenced
    }
    assert.equal(new Set(got).size, 8, 'eight drops, eight different pieces');
    assert.deepEqual([...s.apexFound].sort(), [...IDS].sort());
    assert.equal(apexLeft(s).length, 0);
    for (let i = 0; i < 12; i++) {
      const line = lootFor(s, `later${i}`);
      assert.equal(line.tier, 'premium', 'nothing left: it falls down to Premium');
      assert.equal(line.apex, undefined);
    }
    assert.ok(s.stash.filter((it) => it.tier === 'premium').every((it) => it.perks.length === 2));
  });
});

test('a piece is chosen evenly among those not found, and the same seed finds the same piece', () => {
  const r = makeRng(5);
  const counts = {};
  forceApex(() => { for (let i = 0; i < 8000; i++) { const d = rollDrop(r, []); counts[d.apex] = (counts[d.apex] ?? 0) + 1; } });
  for (const id of IDS) assert.ok(Math.abs(counts[id] / 8000 - 0.125) < 0.02, `${id} ${counts[id] / 8000}`);
  forceApex(() => {
    const found = IDS.slice(0, 5);
    const r2 = makeRng(6);
    for (let i = 0; i < 300; i++) assert.ok(IDS.slice(5).includes(rollDrop(r2, found).apex));
    const a = lootFor(fresh(12), 'x'); const b = lootFor(fresh(12), 'x');
    assert.deepEqual(a, b);
  });
});

test('tier odds hold: Apex is 1% of drops while pieces last, and that 1% goes to Premium after', () => {
  const N = 60000;
  const tally = (found) => { const r = makeRng(31); const c = {}; let drops = 0; for (let i = 0; i < N; i++) { const d = rollDrop(r, found); if (d) { drops++; c[d.tier] = (c[d.tier] ?? 0) + 1; } } return { c, drops }; };
  const a = tally([]);
  assert.ok(Math.abs(a.c.apex / a.drops - 0.01) < 0.004, `apex ${a.c.apex / a.drops}`);
  assert.ok(Math.abs(a.c.premium / a.drops - 0.04) < 0.006, `premium ${a.c.premium / a.drops}`);
  assert.ok(Math.abs(a.c.verified / a.drops - 0.28) < 0.02 && Math.abs(a.c.custom / a.drops - 0.10) < 0.012);
  const b = tally(IDS);
  assert.equal(b.c.apex, undefined);
  assert.ok(Math.abs(b.c.premium / b.drops - 0.05) < 0.007, `premium ${b.c.premium / b.drops}`);
});

test('an Apex drop moves no roll in the shared stream', () => {
  const run = (seed) => {
    let s = createNewGame({ seed, startCrew: 'fresh' });
    s.jobs = [];
    addOffer(s, 'clinic');
    s = M.startMission(s, s.jobs[0].id, s.crew.slice(0, templateById('clinic').crewSize).map((o) => o.id), 'stealth');
    return autoRun(s, 'steady');
  };
  let checked = 0;
  for (let seed = 1; seed <= 40 && checked < 5; seed++) {
    const on = forceApex(() => run(seed));
    const chance = LOOT.chance;
    LOOT.chance = 0;
    let off; try { off = run(seed); } finally { LOOT.chance = chance; }
    if (on.activeMission.result.outcome !== 'completed') continue;
    checked++;
    assert.equal(on.rngCounter, off.rngCounter, 'the shared counter did not move');
    assert.equal(on.activeMission.result.pay, off.activeMission.result.pay);
    assert.equal(on.stash.length, off.stash.length + 1);
    assert.equal(on.stash.at(-1).tier, 'apex');
    assert.equal(on.apexFound.length, 1);
  }
  assert.ok(checked >= 3);
});

test('a runner wears or carries one Apex piece: a second is refused with the first left where it was', () => {
  const s = fresh(2);
  const [a, b] = s.crew;
  const one = wear(s, a, 'signalten');
  const two = makeApex(s, 'winningpost');
  const vest = makeApex(s, 'generatorcoat');
  const chip = makeApex(s, 'ridgelock');
  s.stash.push(two, vest, chip);
  assert.equal(canCarry(a, two).ok, false);
  assert.match(canCarry(a, two).reason, /Signal Ten/);
  assert.equal(canCarry(b, two).ok, true);
  for (const item of [two, vest, chip]) assert.equal(equip(s, item.uid, a.id), s, `${item.name} refused: the state comes back unchanged`);
  assert.equal(equip(s, chip.uid, a.id, { socket: 0 }), s);
  assert.deepEqual(carried(a).filter((i) => i.apex).map((i) => i.uid), [one.uid], 'the first stays');
  // Another runner can have it, and one runner can still carry any ordinary gear.
  const moved = equip(s, two.uid, b.id);
  assert.notEqual(moved, s);
  assert.ok(carried(moved.crew[1]).some((i) => i.uid === two.uid));
  // Moving the piece they already have inside their own bag is not a second one.
  const bagItem = a.gear.bag[0];
  assert.notEqual(equip(s, one.uid, a.id, { x: 1, y: 1 }), s);
  assert.ok(bagItem);
  // Putting the piece back, they may take another.
  const off = structuredClone(s);
  off.crew[0].gear.bag = [];
  off.stash.push(one);
  assert.notEqual(equip(off, two.uid, a.id), off);
  // A worn Apex piece swapped for another in the same place is one for one, not two.
  const t = fresh(2);
  const w = wear(t, t.crew[0], 'generatorcoat');
  const other = makeApex(t, 'signalten');
  t.stash.push(other);
  assert.equal(equip(t, other.uid, t.crew[0].id), t, 'a sidearm is a second piece beside the coat');
  assert.ok(w);
});

test('the gear sheet shows a second Apex piece as unavailable and says why in words', () => {
  const s = fresh(2);
  const a = s.crew[0];
  wear(s, a, 'generatorcoat');
  const second = makeApex(s, 'winningpost');
  const plain = makeItem(s, 'rifle', 'verified');
  s.stash.push(second, plain);
  const html = renderGearSheet(ui, s, a, 'bag:0,0');
  const row = html.split('<li class="gearrow">').find((r) => r.includes('Winning Post'));
  assert.ok(row, 'the Apex rifle is listed, not hidden');
  assert.match(row, /<button[^>]*data-action="equip"[^>]*disabled/, row.slice(row.indexOf("<button")));
  assert.match(row, /A runner can carry only one Apex piece/);
  assert.match(row, /Generator Coat/);
  assert.ok(!/title=|:hover/.test(html), 'no hover-only text');
  const open = html.split('<li class="gearrow">').find((r) => r.includes('Verified rifle'));
  assert.ok(!/disabled/.test(open ?? ''), 'an ordinary rifle is still ok to pack');
});

test('the Armoury row and the gear sheet show the history and the unique perk (name always, line on a tap)', () => {
  const s = fresh(2);
  const item = makeApex(s, 'meterghost');
  s.stash.push(item);
  const html = renderArmoury(ui, s);
  assert.ok(html.includes(APEX_GEAR.meterghost.history), 'history in the row');
  assert.ok(html.includes('Borrowed serial') && html.includes(APEX_GEAR.meterghost.perk.desc));
  assert.ok(html.includes('<details') && html.includes('perks--gold') && html.includes('tierframe--gold'));
  const list = perkList(item);
  assert.ok(list.includes('perk__name') && list.includes('Borrowed serial'));
  assert.ok(apexHistory(item).includes('Hoi-Sing'));
  assert.equal(apexHistory({ type: 'deck' }), '');
  assert.equal(perkList(['apex:nothing']), '');
  const sheet = renderGearSheet(ui, s, s.crew[0], 'bag:0,0');
  assert.ok(sheet.includes(APEX_GEAR.meterghost.history) && sheet.includes('Borrowed serial'));
  const op = s.crew[0];
  wear(s, op, 'ridgelock');
  assert.ok(renderLoadout(ui, s, op).includes('Still on the ridge'), 'the worn tile names its perk');
});

test('the unique perk flows through the same rules as ordinary perks: rolls, wounds, patching, neural load, overwatch and both fights', () => {
  const s = fresh(5);
  const [a, b, c, d] = s.crew;
  // Rolls: named in the breakdown, in a stat the item does not boost.
  wear(s, a, 'meterghost');
  assert.deepEqual(perksOf(a.gear.bag[0].item).map((p) => p.name), ['Borrowed serial']);
  assert.ok(gearMods(a, 'stealth').some((m) => m.value === 1 && /Borrowed serial \+1/.test(m.note)));
  assert.ok(gearMods(a, 'piloting').some((m) => /Borrowed serial \+1/.test(m.note)));
  assert.ok(gearMods(a, 'tech').some((m) => /cyberdeck \+2/.test(m.note)), 'the deck itself: +1 and the step');
  assert.ok(!gearMods(a, 'tech').some((m) => /Borrowed serial/.test(m.note)), 'never its own stat');
  // Wounds and patching.
  wear(s, b, 'generatorcoat');
  assert.equal(patchBonus(b), 1);
  assert.equal(patchBonus(b, { perks: false }), 0, 'a perk helps a healer, it does not make one');
  assert.equal(fightRunner(b, 'loud').healer, b.role === 'medic');
  assert.ok(gearMods(b, 'cool').some((m) => /Every block pitched in/.test(m.note)));
  wear(s, c, 'lastword');
  assert.ok(seriousGuard(c) > 0.049 && seriousGuard(c) <= PERK_CAPS.serious);
  assert.ok(gearMods(c, 'social').some((m) => /Heard out/.test(m.note)));
  // Neural load: the floor drops by the perk (reflex wiring holds 10).
  wear(s, d, 'secondshift');
  assert.equal(neuralFloor(d), 0);
  assert.equal(neuralFloor({ gear: { implants: [{ type: 'reflex', tier: 'standard' }] } }), 10);
  // Overwatch.
  const rifleOp = s.crew[4] ?? s.crew[0];
  rifleOp.gear = { armour: null, implants: [], bag: [] };
  wear(s, rifleOp, 'winningpost');
  const kit = overwatchKit(rifleOp, 'rifle');
  assert.equal(kit.uses, 3);
  assert.equal(kit.heat, 0);
  const droneOp = s.crew[1];
  const drone = makeApex(s, 'fleetorphan');
  droneOp.gear = { armour: null, implants: [], bag: [{ item: drone, x: 0, y: 0 }] };
  assert.equal(overwatchKit(droneOp, 'drone').uses, 4);
  assert.ok(gearMods(droneOp, 'tech').some((m) => /Half-tested/.test(m.note)));
  // Fights: Signal Ten's hits pierce 1 (a revolver has none), and Ridge Lock's do 1 more.
  const sidearm = { gear: { armour: null, implants: [], bag: [{ item: makeApex(s, 'signalten'), x: 0, y: 0 }] } };
  const w = weaponOf(sidearm);
  assert.deepEqual([w.name, w.damage, w.pierce], ['Signal Ten', 5, 1]);
  assert.equal(fightRunner({ ...c, gear: sidearm.gear }, 'loud').ap, true);
  const bare = weaponOf({ gear: { armour: null, implants: [], bag: [] } });
  const chip = weaponOf({ gear: { armour: null, implants: [{ uid: 'x', type: 'cortex', tier: 'apex', apex: 'ridgelock' }], bag: [] } });
  assert.equal(chip.damage, bare.damage + 1);
  assert.equal(armourOf({ gear: { armour: null, implants: [], bag: [] } }).value, 0);
});

test('the unique perk respects the caps beside other perks', () => {
  const s = fresh(6);
  const apexPistol = makeApex(s, 'signalten');
  const hardened = { uid: 'p1', type: 'pistol', tier: 'custom', perks: ['hardened'] };
  assert.equal(perkSum([apexPistol, hardened], 'pierce'), PERK_CAPS.pierce, 'pierce held to its cap');
  const chip = makeApex(s, 'ridgelock');
  const overlay = { uid: 'p2', type: 'deck', tier: 'custom', perks: ['overlay'] };
  assert.equal(perkSum([chip, overlay], 'damage'), PERK_CAPS.damage);
  // A bonus in one stat is held to its cap per stat across everything carried.
  const op = { gear: { armour: null, implants: [], bag: [
    { item: makeApex(s, 'meterghost'), x: 0, y: 0 },
    { item: { uid: 'm1', type: 'medkit', tier: 'premium', perks: ['muffled', 'padded'] }, x: 3, y: 0 },
    { item: { uid: 'm2', type: 'picks', tier: 'custom', perks: ['padded'] }, x: 3, y: 1 },
  ] } };
  const stealth = gearMods(op, 'stealth').filter((m) => !/ghost kit/i.test(m.note)).reduce((n, m) => n + m.value, 0);
  assert.ok(stealth <= PERK_CAPS.bonus, `stealth perks ${stealth}`);
  // Nothing in a unique perk can only hurt the carrier: no negative bonus and no heat above zero.
  for (const id of IDS) for (const [k, v] of Object.entries(APEX_GEAR[id].perk.effect)) {
    if (k === 'bonus') for (const n of Object.values(v)) assert.ok(n > 0);
    else if (k === 'heat') assert.ok(v < 0); else assert.ok(v > 0);
  }
});

test('a perk id resolves for ordinary perks and Apex ones; an item with no piece and no perks has none', () => {
  assert.equal(perkById('padded').name, 'Padded fit');
  assert.equal(perkById('apex:signalten').name, 'Wax-sealed');
  assert.equal(perkById('apex:nope'), null);
  assert.equal(perkById('nope'), null);
  assert.deepEqual(perksOf({ type: 'rifle', tier: 'apex' }), []);
  const s = fresh();
  assert.equal(makeItem(s, 'rifle', 'apex').perks, undefined, 'Apex rolls no ordinary perks');
});

test('a fenced piece pays and does not come back', () => {
  const s = fresh(9);
  const item = makeApex(s, 'ridgelock');
  s.stash.push(item);
  const sold = sellGear(s, item.uid);
  assert.ok(sold.cash > s.cash);
  assert.ok(sold.apexFound.includes('ridgelock'), 'still counted as found');
  assert.ok(!apexLeft(sold).includes('ridgelock'));
});

test('a v68 save upgrades: no pieces found yet, and ones already listed are kept', async () => {
  const s = createNewGame({ seed: 70 });
  s.version = 68;
  delete s.apexFound;
  const loaded = await importSave({ text: async () => JSON.stringify(s) });
  assert.equal(loaded.version, SAVE_VERSION);
  assert.equal(SAVE_VERSION, 69);
  assert.deepEqual(loaded.apexFound, []);
  const t = createNewGame({ seed: 71 });
  t.apexFound = ['lastword'];
  t.stash = [{ uid: 'g1', type: 'pistol', tier: 'apex', apex: 'lastword', name: 'Last Word', look: APEX_GEAR.lastword.look }];
  const back = await importSave({ text: async () => JSON.stringify(t) });
  assert.deepEqual(back.apexFound, ['lastword']);
  assert.equal(itemTitle(back.stash[0]), 'Last Word');
});
