// Posts on a hall (2026-11-12, the hall as a fortress): fixed slots on the compound (windows, roofs, the
// gate) where our people stand when a raid comes by the front gate. Built like a piece, they count as
// defences, a warned raid has who stands on which, and the fight puts them there.

import test from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame, SAVE_VERSION } from '../src/core/state.js';
import { syncHalls, hallIn, moveToHall } from '../src/core/halls.js';
import { HALLS } from '../src/data/sites.js';
import { PIECES } from '../src/data/hallBuild.js';
import { BATTLE } from '../src/data/battle.js';
import { postSlots, canPlacePost, placePost, removePiece, refundOf } from '../src/core/hallbuild.js';
import { defencesIn, defenceCut, postAssignments, setRaidPost, cycleRaidPost, startRaidFight, defenders } from '../src/core/raids.js';
import { buildBattle, ordersFor, guardHitChance } from '../src/core/battle.js';
import { runBattle } from '../src/core/runbattle.js';
import { hallShut } from '../src/core/raids.js';
import { renderHallBuild } from '../src/ui/hallbuild.js';

const D = 'nightMarket';
function tong(level = 1, cash = 200000) {
  let s = createNewGame({ seed: 5, startCrew: 'fresh' });
  s.halls.push({ district: D, beds: 4, rent: 1000, level, opened: 1, build: [] });
  syncHalls(s);
  for (const op of s.crew.slice(0, 3)) s = moveToHall(s, op.id, D);
  s.cash = cash;
  return s;
}
const raidOf = (s, i = 1) => ({ id: `raid-${D}-${i}`, district: D, by: 'police', warnedDay: s.day, day: s.day, answer: null, outcome: null, done: false, plan: null, posts: {} });

test('a hall\'s post slots come with its parts: the first building and the gate at level 1, the second building at level 2', () => {
  for (const d of Object.keys(HALLS)) {
    assert.equal(HALLS[d].stands.length, 6, `${d}: two windows, two roofs, two at the gate`);
    assert.deepEqual(postSlots({ district: d, level: 1 }).map((x) => x.id).sort(), ['gate-left', 'gate-right', 'room-roof', 'room-window'], d);
    assert.equal(postSlots({ district: d, level: 2 }).length, 6, d);
  }
  const roofs = HALLS[D].stands.filter((x) => x.kind === 'roof');
  assert.ok(roofs.every((x) => x.at[1] < 210), 'a roof is on a building');
  assert.ok(HALLS[D].stands.filter((x) => x.kind === 'gate').every((x) => x.at[1] > 270), 'the gate posts are at the front gate');
});

test('building a post: the right kind in its slot, once, with the money and the level; it counts as a defence; removing it gives half back', () => {
  let s = tong(1, 100000);
  assert.ok(canPlacePost(s, D, 'window', 'room-window').ok);
  assert.match(canPlacePost(s, D, 'nest', 'room-window').reason, /doesn't go in a window/, 'a nest is for a roof');
  assert.match(canPlacePost(s, D, 'nest', 'room-roof').reason, /level 2/, 'a nest needs a level 2 hall');
  assert.match(canPlacePost(s, D, 'window', 'flat-window').reason, /No such place/, 'the second building isn\'t ours at level 1');
  assert.match(canPlacePost(tong(1, 100), D, 'window', 'room-window').reason, /Needs ¥2,500/);
  const before = s.cash;
  s = placePost(s, D, 'window', 'room-window');
  assert.equal(s.cash, before - PIECES.window.cost);
  const b = hallIn(s, D).build.find((x) => x.slot === 'room-window');
  assert.equal(b.piece, 'window');
  assert.deepEqual([b.px, b.py], HALLS[D].stands.find((x) => x.id === 'room-window').at);
  assert.match(canPlacePost(s, D, 'window', 'room-window').reason, /already/);
  assert.equal(placePost(s, D, 'window', 'room-window'), s, 'a second one changes nothing');
  assert.equal(defencesIn(s, D), 1, 'a post is a defence');
  s = placePost(s, D, 'gate', 'gate-left'); s = placePost(s, D, 'gate', 'gate-right');
  assert.equal(defenceCut(s, D), 1, 'three posts make a raid one step easier, as three defences do');
  const cash = s.cash;
  const r = removePiece(s, D, b.id);
  assert.equal(r.cash, cash + refundOf('window'));
  assert.equal(r.halls.find((h) => h.district === D).build.some((x) => x.slot === 'room-window'), false);
});

test('who stands where: left alone the best fighters take the best posts; a post set to nobody stays empty; Change hands it on', () => {
  let s = tong(2);
  for (const [piece, slot] of [['nest', 'room-roof'], ['window', 'room-window'], ['gate', 'gate-left']]) s = placePost(s, D, piece, slot);
  const raid = raidOf(s);
  s.raids = [raid];
  const home = defenders(s, D);
  assert.equal(home.length, 3);
  let a = postAssignments(s, D, raid, home);
  assert.equal(a.length, 3);
  assert.ok(a.every((x) => x.op), 'three posts, three at home');
  assert.equal(new Set(a.map((x) => x.op.id)).size, 3, 'nobody on two posts');
  const best = [...home].sort((x, y) => (y.stats.combat.value ?? y.stats.combat) - (x.stats.combat.value ?? x.stats.combat))[0];
  assert.equal(a.find((x) => x.slot === 'room-roof').op.id, best.id, 'the best shot takes the nest');
  s = setRaidPost(s, raid.id, 'gate-left', null);
  a = postAssignments(s, D, s.raids[0], home);
  assert.equal(a.find((x) => x.slot === 'gate-left').op, null, 'set to nobody: empty');
  const was = a.find((x) => x.slot === 'room-window').op.id;
  s = cycleRaidPost(s, raid.id, 'room-window');
  const now = postAssignments(s, D, s.raids[0], home).find((x) => x.slot === 'room-window').op;
  assert.ok(now?.id !== was, 'Change hands the post to someone else (or to nobody)');
  const all = postAssignments(s, D, s.raids[0], home).filter((x) => x.op);
  assert.equal(new Set(all.map((x) => x.op.id)).size, all.length, 'still nobody on two posts');
});

test('a raid by the front gate: our people start on the posts, in the cover and height the posts give; the rest in the forecourt', () => {
  let s = tong(2);
  for (const [piece, slot] of [['nest', 'room-roof'], ['window', 'room-window'], ['gate', 'gate-left']]) s = placePost(s, D, piece, slot);
  const raid = raidOf(s);
  s.raids = [raid];
  const x = structuredClone(s);
  // Level 2 has one way in (the street), so the raid comes by the front gate.
  startRaidFight(x, raid);
  const am = x.activeMission, b = am.battle;
  assert.equal(am.build.find((p) => p.piece === 'way').id, 'street');
  const posted = b.runners.filter((r) => r.post);
  assert.deepEqual(posted.map((r) => r.post).sort(), ['gate-left', 'room-roof', 'room-window']);
  const at = (slot) => b.spots.crew[b.runners.find((r) => r.post === slot).spot];
  assert.deepEqual(at('room-roof').at, HALLS[D].stands.find((p) => p.id === 'room-roof').at, 'on the roof');
  assert.equal(b.runners.find((r) => r.post === 'room-roof').cover, 'full');
  assert.equal(b.runners.find((r) => r.post === 'room-roof').high, true, 'the nest is from above');
  assert.equal(b.runners.find((r) => r.post === 'room-window').cover, 'full');
  assert.equal(b.runners.find((r) => r.post === 'gate-left').cover, 'half');
  assert.equal(b.runners.filter((r) => r.high).length, 1, 'only the nest is high');
  assert.deepEqual(am.crewIds, b.runners.map((r) => r.id), 'the fight\'s crew is in post order');
  // Nobody posted (all set to nobody): the fight is as it was, everyone on the forecourt's cover.
  let y = structuredClone(s);
  for (const slot of ['room-roof', 'room-window', 'gate-left']) y = setRaidPost(y, raid.id, slot, null);
  startRaidFight(y, y.raids[0]);
  assert.equal(y.activeMission.battle.runners.filter((r) => r.post).length, 0);
});

test('height: from a nest a shot is a step easier and a hit on you a step harder', () => {
  const s = tong(2);
  const op = s.crew[0];
  const spots = { crew: [{ at: [90, 114], cover: 'full', high: true }, { at: [90, 216], cover: 'full' }], guards: [{ at: [180, 318], cover: 'half' }, { at: [140, 300], cover: 'half' }] };
  const b = buildBattle({ incident: 'raid', zone: 'inside', diff: 4, threat: 2, guards: 2, crew: [op, s.crew[1]], approach: 'loud', spots });
  assert.equal(b.runners[0].high, true);
  assert.equal(b.runners[1].high, undefined);
  b.runners[1].stats = structuredClone(b.runners[0].stats); // the same person twice: only the height differs
  const chance = (r) => ordersFor(b, r.id).find((o) => o.kind === 'shoot').chance;
  assert.ok(chance(b.runners[0]) > chance(b.runners[1]), 'the nest shoots better');
  assert.ok(guardHitChance(b, b.runners[0]) < guardHitChance(b, b.runners[1]), 'and is harder to hit than the same cover at ground level');
  assert.equal(BATTLE.highAim, 1);
});

test('saves from before posts upgrade: a warned raid gains its (empty) posts', async () => {
  const { importSave } = await import('../src/save/save.js');
  const s = tong();
  s.version = 61;
  s.raids = [{ ...raidOf(s) }];
  delete s.raids[0].posts;
  const up = await importSave({ text: async () => JSON.stringify(s) });
  assert.equal(up.version, SAVE_VERSION);
  assert.deepEqual(up.raids[0].posts, {});
});

test('the build screen\'s Posts tab: a place on the plan to tap for each slot held, the posts to pick, and what a built post is', () => {
  const esc = (x) => String(x).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  const ui = { esc, money: (n) => `¥${n.toLocaleString()}`, cityName: () => 'The Night Market' };
  const s = tong(1);
  const view = { district: D, cell: null, piece: null, rot: 0, picked: null, scope: 'compound', tab: 'post', slot: null };
  const html = renderHallBuild(ui, s, view);
  assert.equal((html.match(/data-action="build-slot"/g) ?? []).length, 4, 'four places at level 1');
  assert.doesNotMatch(html, /data-action="build-cell"/, 'no squares on the Posts tab');
  for (const n of ['Window post', 'Rooftop nest', 'Gate post']) assert.match(html, new RegExp(n));
  assert.match(html, /Tap a place on the plan, then pick a post/);
  const picked = renderHallBuild(ui, s, { ...view, slot: 'room-window', piece: 'window' });
  assert.match(picked, /data-action="build-place" >Build · ¥2,500/);
  const nest = renderHallBuild(ui, s, { ...view, slot: 'room-roof', piece: 'nest' });
  assert.match(nest, /Needs a level 2 hall/);
  assert.match(nest, /data-action="build-place" disabled/);
  const forecourt = renderHallBuild(ui, s, { ...view, tab: 'defence' });
  assert.match(forecourt, /data-action="build-cell"/, 'the Forecourt tab has the squares');
  assert.doesNotMatch(forecourt, /data-action="build-slot"/);
  const built = placePost(s, D, 'window', 'room-window');
  const id = hallIn(built, D).build.find((b) => b.slot).id;
  const sheet = renderHallBuild(ui, built, { ...view, picked: id });
  assert.match(sheet, /Window post<\/strong> <span class="muted small">built day/);
  assert.match(sheet, /Remove · ¥1,250 back/);
});

test('no fall-back lines yet: if the people on the posts are beaten they retreat, and the hall pays for it as for any walk-out (2026-11-12)', () => {
  let s = tong(2);
  for (const [piece, slot] of [['nest', 'room-roof'], ['window', 'room-window'], ['gate', 'gate-left']]) s = placePost(s, D, piece, slot);
  s.raids = [raidOf(s)];
  startRaidFight(s, s.raids[0]);
  assert.ok(s.activeMission.battle.runners.every((r) => r.post), 'everyone on a post');
  for (const r of s.activeMission.battle.runners) { r.hp = 0; r.down = true; } // beaten
  const cash = s.cash;
  for (let n = 0; s.activeMission && !s.activeMission.done && n < 20; n++) s = runBattle(s);
  assert.equal(s.raids[0].outcome, 'withdrew', 'beaten, they pull back');
  assert.equal(s.activeMission.aborted, true);
  assert.equal(hallShut(s, D), true, 'the hall is shut for the week');
  assert.ok(s.cash < cash, 'what was kept there and the repairs are paid');
});
