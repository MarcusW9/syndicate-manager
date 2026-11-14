// Engine 2 rules (core/fight.js; drafts/SPEC-battle-orders.md section 23). Slice 1b: the rules on their
// own, wired to no job. The run's side (call-ins, the death rule's wiring, the five jobs finishing) is
// slice 1c's tests. Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame } from '../src/core/state.js';
import { templateById } from '../src/core/jobs.js';
import { makeRng } from '../src/core/rng.js';
import * as F from '../src/core/fight.js';
import { layoutFight, stageSpots } from '../src/core/fightmap.js';
import { pickSite } from '../src/data/sites.js';
import { FIGHT, ENEMIES, ENEMY_HIT, SITE_ENEMIES, COUNT_BY_THREAT, FIGHT_JOBS, FIGHTS } from '../src/data/fights.js';
import { DILEMMAS } from '../src/data/dilemmas.js';
import { FIGHT_TEXT } from '../src/data/fightText.js';
import { lineText } from '../src/core/fighttext.js';
import { STARTING_CREW } from '../src/data/operatives.js';

const crewOf = (seed = 1) => createNewGame({ seed }).crew;
const ids = { stitch: 'mei', jax: 'jax', static: 'wing', wheels: 'teo', velvet: 'cherry' };

/** An rng that returns one number forever (0 = every shot hits and every d20 is a 1; 0.999 = every shot misses, every d20 a 20). */
const always = (v) => () => v;
/** A seeded rng that counts its draws. */
const counting = (seed) => { const r = makeRng(seed); const f = () => { f.n += 1; return r(); }; f.n = 0; return f; };

const foe = (n, kind = 'corp', o = {}) => ({ n, kind, pips: ENEMIES[kind].pips, max: ENEMIES[kind].pips, absorb: ENEMIES[kind].absorb ?? 0, cover: ENEMIES[kind].cover, out: false, fled: false, deck: ['aim'], di: 0, ...o });

/** A fight with the people named (ids from the authored crew), no enemies yet, nothing drawn. */
function fixture(type, who, { set = {}, risk = 'steady', threat = 3, site = type === 'holdHack' ? 'heights' : 'docks', ...opts } = {}) {
  const crew = crewOf().filter((o) => who.includes(o.id)).sort((a, b) => who.indexOf(a.id) - who.indexOf(b.id));
  for (const o of crew) Object.assign(o.stats, set[o.id] ?? {});
  const b = F.buildFight({ type, diff: 14, threat, site, crew, approach: 'loud', risk, ...opts }, makeRng(3));
  b.enemies = []; b.hiredTotal = 0;
  return b;
}
const R = (b, id) => b.runners.find((r) => r.id === id);
/** Draw by hand: threats = [{ enemy, kind, target }]. Same shape as telegraph makes, with the shown chance. */
function draw(b, threats) {
  b.round = Math.max(1, b.round);
  b.threats = threats.map((t, i) => {
    const e = b.enemies.find((x) => x.n === t.enemy);
    const x = { id: `${b.round}.${t.enemy}`, kind: t.kind, enemy: t.enemy, target: t.target ?? null, shieldedBy: null, cancelled: false, shown: null, hit: 0 };
    if (t.kind === 'aim') { x.shown = F.aimChance(b, R(b, t.target)); x.hit = ENEMY_HIT[e.kind]; }
    return x;
  });
  b.drawn = true;
  return b;
}
const kinds = (pv) => Object.fromEntries(pv.actions.map((a) => [a.who, a.kind]));
const full = (o) => { o.stats.endurance = 20; return o; };

// --- pips -------------------------------------------------------------------------------------------

test('pips: one per two points of endurance, at least 3; cool changes nothing; a light wound starts 2 down', () => {
  const at = (e) => F.maxPips({ stats: { endurance: e } });
  assert.deepEqual([1, 6, 7, 8, 12, 13, 18, 19, 20].map(at), [3, 3, 3, 4, 6, 6, 9, 9, 10]);
  const [jax] = crewOf().filter((o) => o.id === 'jax');
  const base = F.runnerOf(jax, 'loud').max;
  jax.stats.cool = 20;
  assert.equal(F.runnerOf(jax, 'loud').max, base, 'cool no longer changes pips');
  assert.equal(base, F.maxPips(jax));
  jax.condition.injury = 'light';
  const hurt = F.runnerOf(jax, 'loud');
  assert.equal(hurt.pips, base - FIGHT.lightWoundPips);
  jax.stats.endurance = 1;
  assert.equal(F.runnerOf(jax, 'loud').pips, 1, 'a light wound never starts a runner at 0');
});

test('gear: a vest absorbs 1 or 2 hits, a sidearm sets the strong margin, pierce is ap', () => {
  assert.equal(F.strongMargin(1), 12);
  assert.deepEqual([2, 3, 4, 5, 6].map(F.strongMargin), [12, 10, 8, 6, 6]);
  const [stitch] = crewOf().filter((o) => o.id === 'mei');
  assert.equal(F.runnerOf(stitch, 'loud').absorb, 0);
  stitch.gear = { armour: { uid: 'v', type: 'vest', tier: 'standard' }, implants: [], bag: [] };
  assert.equal(F.runnerOf(stitch, 'loud').absorb, 1);
  stitch.gear.armour.tier = 'verified';
  assert.equal(F.runnerOf(stitch, 'loud').absorb, 2);
  assert.equal(F.runnerOf(stitch, 'loud').ap, false);
});

// --- building -----------------------------------------------------------------------------------------

test('a fight starts with the enemies its threat and site say, and the crew defaults', () => {
  for (const threat of [1, 2, 3, 4, 5]) {
    for (const [site, list] of Object.entries(SITE_ENEMIES)) {
      const b = F.buildFight({ type: 'holdHack', diff: 14, threat, site, crew: crewOf().slice(0, 3), approach: 'loud' }, makeRng(threat));
      assert.equal(b.enemies.length, COUNT_BY_THREAT[threat]);
      for (const e of b.enemies) assert.ok(list.includes(e.kind), `${site}: ${e.kind}`);
    }
  }
  const b = F.buildFight({ type: 'holdHack', diff: 14, threat: 3, site: 'heights', crew: crewOf().slice(0, 4), approach: 'loud' }, makeRng(1));
  assert.equal(b.goal.protect, 'wing', 'the tech is the specialist');
  const duties = Object.fromEntries(b.runners.map((r) => [r.id, F.orderOf(b, r).duty]));
  assert.equal(duties.wing, 'push');
  assert.equal(Object.values(duties).filter((d) => d === 'protect').length, 2, 'two protectors on the tech');
  for (const r of b.runners) assert.ok(F.orderOf(b, r).fallback, `${r.id} has a fallback`);
});

test('holdExtract defaults are stage-aware: hold, then board', () => {
  const b = F.buildFight({ type: 'holdExtract', diff: 14, threat: 3, site: 'docks', crew: crewOf().slice(0, 4), approach: 'loud' }, makeRng(1));
  const prot = F.bestProtector(b);
  const at = (stage) => { b.stage = stage; return Object.fromEntries(b.runners.map((r) => [r.id, [F.orderOf(b, r).duty, F.orderOf(b, r).fallback.duty]])); };
  const hold = at(0); const board = at(1);
  assert.deepEqual(hold[prot.id], ['protect', 'attack']);
  assert.deepEqual(board[prot.id], ['protect', 'push']);
  for (const r of b.runners.filter((x) => x.id !== prot.id)) { assert.deepEqual(hold[r.id], ['attack', 'hold']); assert.deepEqual(board[r.id], ['push', 'hold']); }
});

test('the five jobs name a fight type and exist, with the type and site the spec set', () => {
  assert.deepEqual(Object.keys(FIGHT_JOBS).sort(), ['data_pull', 'data_scrub', 'protection', 'quiet_hours', 'warehouse']);
  for (const [id, type] of Object.entries(FIGHT_JOBS)) {
    const t = templateById(id);
    assert.ok(t, `${id} exists`);
    assert.ok(FIGHTS[type], `${type} is a fight type`);
  }
});

// --- determinism and "never draws" -----------------------------------------------------------------------

test('determinism: the same crew, seed and orders play the same fight', () => {
  const play = () => { const rng = makeRng(11); const b = F.buildFight({ type: 'holdExtract', diff: 14, threat: 4, site: 'docks', crew: crewOf(), approach: 'loud', wheels: { id: 'teo', handle: 'Wheels', value: 17 } }, rng); F.playFight(b, rng); return JSON.stringify(b); };
  assert.equal(play(), play());
});

test('previews, "if nothing", dilemma checks and patches build never draw', () => {
  const rng = counting(5);
  const b = F.buildFight({ type: 'holdHack', diff: 14, threat: 4, site: 'heights', crew: crewOf().slice(0, 4), approach: 'loud' }, rng);
  F.startRound(b, rng);
  const n = rng.n;
  assert.ok(n > 0, 'the telegraph draws');
  const before = JSON.stringify(b);
  for (let i = 0; i < 3; i++) {
    F.previewRound(b); F.resolveOrders(b); F.dueDilemmas(b);
    F.exposures(b, F.resolveOrders(b).actions);
  }
  assert.equal(rng.n, n, 'no draw');
  assert.equal(JSON.stringify(b), before, 'nothing changed');
  assert.equal(F.previewRound({ ...b, drawn: false }), null, 'before the draw there is nothing to preview');
});

// --- the resolver ----------------------------------------------------------------------------------------

test('precedence: withdraw beats duty; the risk threshold beats duty; a stabilise beats the duty', () => {
  const b = fixture('holdHack', [ids.static, ids.jax, ids.stitch], { risk: 'cautious', set: { jax: { endurance: 8 }, mei: { endurance: 8 }, wing: { endurance: 12 } } });
  b.enemies = [foe(1)];
  draw(b, [{ enemy: 1, kind: 'aim', target: 'wing' }]);
  R(b, 'jax').pips = 2; // cautious: half of 4 pips, rounded up, is 2
  assert.equal(F.riskThreshold(b, R(b, 'jax')), 2);
  const pv = F.previewRound(b);
  assert.equal(pv.actions.find((a) => a.who === 'jax').kind, 'withdraw');
  assert.equal(pv.actions.find((a) => a.who === 'jax').from, 'safety');
  // A hand-ordered withdraw is "duty".
  R(b, 'jax').pips = 4;
  F.setOrder(b, 'jax', { duty: 'withdraw' });
  assert.equal(F.previewRound(b).actions.find((a) => a.who === 'jax').from, 'duty');
  // A medic with a bleeding teammate stabilises first, whatever their duty.
  F.setOrder(b, 'jax', { duty: 'attack' });
  R(b, 'wing').down = true; R(b, 'wing').downRound = 1;
  const stab = F.previewRound(b).actions.find((a) => a.who === 'mei');
  assert.equal(stab.kind, 'stabilise');
  assert.equal(stab.target, 'wing');
});

test('risk thresholds in pips: cautious half rounded up, steady a third rounded up (at least 1), committed never', () => {
  const b = fixture('holdHack', [ids.static, ids.jax]);
  const r = R(b, 'jax');
  const at = (level, max) => { r.max = max; b.risk.level = level; return F.riskThreshold(b, r); };
  assert.deepEqual([3, 4, 6, 7, 9, 12, 20].map((m) => at('cautious', m)), [2, 2, 3, 4, 5, 6, 10]);
  assert.deepEqual([1, 3, 4, 6, 7, 9, 12, 20].map((m) => at('steady', m)), [1, 1, 2, 2, 3, 3, 4, 7], 'a 3-pip runner pulls out at 1, not after the first hit');
  assert.deepEqual([3, 9, 20].map((m) => at('committed', m)), [0, 0, 0]);
});

test('the pull-out call: comes up for a runner at their point (not committed, not at the van), again when they lose another pip; keeping them in stops the safety pull-out', () => {
  const mk = (risk = 'steady') => {
    const b = fixture('holdHack', [ids.static, ids.jax, ids.stitch], { risk, set: { jax: { endurance: 12 }, wing: { endurance: 12 }, mei: { endurance: 12 } } });
    b.enemies = [foe(1), foe(2)];
    draw(b, []);
    return b;
  };
  const b = mk();
  assert.deepEqual(F.dueDilemmas(b).map((d) => d.id), [], 'full pips: nothing');
  R(b, 'jax').pips = 2; // max 6, a third is 2
  const due = F.dueDilemmas(b);
  assert.deepEqual(due.map((d) => d.id), ['pullOutPoint']);
  assert.deepEqual(due[0].subjects, ['jax']);
  b.dilemmasFired[due[0].key] = true;
  assert.deepEqual(F.dueDilemmas(b), [], 'not again for the same situation');
  // Pulling out: the safety rule acts.
  assert.equal(kinds(F.previewRound(b)).jax, 'withdraw');
  // Keeping them in: no pull-out, until they lose a pip.
  F.keepIn(b, ['jax']);
  assert.notEqual(kinds(F.previewRound(b)).jax, 'withdraw');
  assert.deepEqual(F.dueDilemmas(b), []);
  R(b, 'jax').pips = 1;
  assert.deepEqual(F.dueDilemmas(b).map((d) => d.id), ['pullOutPoint'], 'another pip lost: asked again');
  assert.equal(kinds(F.previewRound(b)).jax, 'withdraw', 'and the crew pulls them out unless told to keep them in');
  // Healed past their point: asked afresh next time.
  R(b, 'jax').pips = 5; F.startRound(b, makeRng(1));
  assert.equal(R(b, 'jax').stayPips, null);
  // Committed never pulls out, so never asks; the van stage pulls out by boarding, so it does not ask either.
  const c = mk('committed'); R(c, 'jax').pips = 1;
  assert.deepEqual(F.dueDilemmas(c).filter((d) => d.id === 'pullOutPoint'), []);
});

test('a useless duty falls back, then hunkers; never an impossible action', () => {
  const b = fixture('holdHack', [ids.static, ids.jax, ids.velvet]);
  draw(b, []); // nothing to shoot, no shots
  F.setOrder(b, 'jax', { duty: 'protect', target: 'protected', fallback: { duty: 'attack', target: null } });
  F.setOrder(b, 'cherry', { duty: 'attack', target: null, fallback: { duty: 'hold', target: null } });
  const k = kinds(F.previewRound(b));
  assert.equal(k.jax, 'hunker', 'no shot to shield, no enemy to attack: hunker');
  assert.equal(k.cherry, 'hunker');
  assert.equal(k.wing, 'work');
  for (const a of F.previewRound(b).actions) assert.ok(['work', 'hunker', 'move', 'withdraw'].includes(a.kind));
});

test('reservations: a second protector does not repeat the shield; a second attacker skips an enemy already covered', () => {
  const b = fixture('holdHack', [ids.static, ids.jax, ids.velvet], { set: { jax: { endurance: 20 }, cherry: { endurance: 20 } } });
  b.enemies = [foe(1, 'hired'), foe(2, 'hired'), foe(3, 'hired')];
  draw(b, [{ enemy: 1, kind: 'aim', target: 'wing' }]);
  F.setOrder(b, 'jax', { duty: 'protect', target: 'protected', fallback: { duty: 'attack', target: null } });
  F.setOrder(b, 'cherry', { duty: 'protect', target: 'protected', fallback: { duty: 'attack', target: null } });
  let pv = F.previewRound(b);
  assert.equal(pv.actions.find((a) => a.who === 'jax').kind, 'shield');
  assert.equal(pv.actions.find((a) => a.who === 'cherry').kind, 'attack', 'one shot, one shield: the second goes to the fallback');
  // Two attackers, 1-pip enemies: the first attack covers enemy 1, the second takes the next.
  F.setOrder(b, 'jax', { duty: 'attack', target: null, fallback: null, priority: [] });
  F.setOrder(b, 'cherry', { duty: 'attack', target: null, fallback: null, priority: [] });
  pv = F.previewRound(b);
  const hits = pv.actions.filter((a) => a.kind === 'attack').map((a) => a.target);
  assert.equal(new Set(hits).size, 2, 'no doubling up on a 1-pip enemy');
});

test('an attack that does not cover an enemy\'s pips never counts as answering its shot', () => {
  const b = fixture('holdHack', [ids.static, ids.jax], { set: { jax: { endurance: 20 } } });
  b.enemies = [foe(1, 'corp')]; // 2 pips: one attack for 1 planned pip leaves it shooting
  draw(b, [{ enemy: 1, kind: 'aim', target: 'wing' }]);
  F.setOrder(b, 'jax', { duty: 'attack', target: 1, fallback: null });
  const pv = F.previewRound(b);
  assert.equal(pv.actions.find((a) => a.who === 'jax').kind, 'attack');
  assert.ok(pv.ifNothing.some((x) => x.key === 'ifNothing.shots'), 'the shot is still shown as open');
  assert.equal(pv.exposure.find((x) => x.enemy === 1).shieldedBy, null);
});

test('every action line names its order', () => {
  const rng = makeRng(2);
  const b = F.buildFight({ type: 'holdExtract', diff: 14, threat: 4, site: 'docks', crew: crewOf(), approach: 'loud', wheels: { id: 'teo', handle: 'Wheels', value: 17 } }, rng);
  let acts = 0;
  while (!b.end && b.round < 20) {
    const r = F.playRound(b, rng);
    for (const l of r.lines.filter((x) => ['attack', 'jam', 'stabilise', 'patch', 'board', 'carry'].includes(x.kind))) { acts += 1; assert.ok(l.order && l.from, `${l.key} names its order`); }
    for (const a of r.actions) assert.ok(a.from);
  }
  assert.ok(acts > 3);
});

// --- shots: shield, hunker, cover ---------------------------------------------------------------------------

test('shield takes exactly one shot and it resolves against the protector\'s cover and armour', () => {
  const b = fixture('holdHack', [ids.static, ids.jax], { set: { jax: { endurance: 20, cool: 18 }, wing: { endurance: 20, cool: 6 } } });
  R(b, 'jax').absorb = 1;
  b.enemies = [foe(1), foe(2)];
  draw(b, [{ enemy: 1, kind: 'aim', target: 'wing' }, { enemy: 2, kind: 'aim', target: 'wing' }]);
  F.setOrder(b, 'jax', { duty: 'protect', target: 'protected', fallback: null });
  const pv = F.previewRound(b);
  const shielded = pv.exposure.filter((x) => x.shieldedBy === 'jax');
  assert.equal(shielded.length, 1, 'one shot redirected');
  assert.equal(shielded[0].target, 'jax');
  assert.equal(shielded[0].chance, F.aimChance(b, R(b, 'jax')), "shown against the protector's cover");
  assert.notEqual(shielded[0].chance, F.aimChance(b, R(b, 'wing')));
  const other = pv.exposure.find((x) => !x.shieldedBy);
  assert.equal(other.target, 'wing');
  // Played with every shot hitting: the protector's vest takes theirs, the tech takes the other.
  F.setOrder(b, 'wing', { duty: 'hold', target: null, fallback: null });
  const res = F.playRound(b, always(0));
  assert.equal(R(b, 'jax').absorb, 0, "the protector's vest took the redirected hit");
  assert.equal(R(b, 'jax').pips, R(b, 'jax').max, 'not erased: it resolved, and the armour soaked it');
  assert.ok(res.lines.some((l) => l.key === 'shotAbsorbed'));
  assert.equal(R(b, 'wing').pips, R(b, 'wing').max - 2 + 0, 'the other corp shot hit the tech for 2');
});

test('shown = used: the preview\'s shot chance is the chance the round rolls, hunker and boarding included', () => {
  const b = fixture('holdExtract', [ids.jax, ids.stitch, ids.velvet], { set: { jax: { cool: 14 }, cherry: { cool: 14 } } });
  b.enemies = [foe(1, 'enforcer'), foe(2, 'hired')];
  b.stage = 1; b.goal.vanLeaves = 5;
  draw(b, [{ enemy: 1, kind: 'aim', target: 'jax' }, { enemy: 2, kind: 'aim', target: 'cherry' }]);
  F.setOrder(b, 'jax', { duty: 'push', target: null, fallback: null });
  F.setOrder(b, 'cherry', { duty: 'hold', target: null, fallback: null });
  const pv = F.previewRound(b);
  const open = pv.exposure.find((x) => x.target === 'jax');
  const hunk = pv.exposure.find((x) => x.target === 'cherry');
  assert.equal(open.chance, F.aimChance(b, R(b, 'jax'), { open: true }), 'a runner making for the van is in the open');
  assert.equal(hunk.chance, F.aimChance(b, R(b, 'cherry'), { hunker: true }));
  assert.ok(open.chance > F.aimChance(b, R(b, 'jax')), 'open is worse than half cover');
  const res = F.playRound(b, always(0.5));
  const jaxShot = res.lines.find((l) => l.key.startsWith('shot') && l.target === 'jax');
  assert.equal(jaxShot.chance, open.chance, 'the round used the shown chance');
});

test('hunker never cancels a shot and cover never makes one impossible', () => {
  const b = fixture('holdHack', [ids.static, ids.jax], { set: { wing: { cool: 40 } } });
  for (const cover of ['open', 'half', 'full']) for (const hunker of [false, true]) {
    R(b, 'wing').cover = cover;
    const c = F.aimChance(b, R(b, 'wing'), { hunker });
    assert.ok(c >= FIGHT.aimFloor && c <= FIGHT.aimCeil, `${cover}${hunker ? ' hunkered' : ''}: ${c}`);
  }
  b.enemies = [foe(1, 'hired')];
  draw(b, [{ enemy: 1, kind: 'aim', target: 'jax' }]);
  F.setOrder(b, 'jax', { duty: 'hold', target: null, fallback: null });
  assert.equal(F.previewRound(b).actions.find((a) => a.who === 'jax').kind, 'hunker');
  F.playRound(b, always(0)); // every shot hits
  assert.ok(R(b, 'jax').pips < R(b, 'jax').max, 'hunkering did not stop the shot');
});

// --- the hack --------------------------------------------------------------------------------------------------

test('hack: progress only for rounds the technician worked and stood at the end; kept when interrupted', () => {
  const b = fixture('holdHack', [ids.static, ids.jax, ids.stitch]);
  draw(b, []);
  F.playRound(b, always(0.5));
  assert.equal(b.goal.work, 1, 'one guaranteed progress for a round of work');
  // A round spent jamming (or anything else) is no progress, and the progress already made stays.
  b.enemies = [foe(1, 'hired')];
  draw(b, [{ enemy: 1, kind: 'alarm' }]);
  F.setOrder(b, 'wing', { duty: 'support', target: null, fallback: null });
  F.playRound(b, always(0.5));
  assert.equal(b.goal.work, 1);
  // Worked, then downed by that round's shots: no progress.
  const c = fixture('holdHack', [ids.static, ids.jax], { set: { wing: { endurance: 6 } } });
  c.enemies = [foe(1, 'corp')];
  draw(c, [{ enemy: 1, kind: 'aim', target: 'wing' }]);
  R(c, 'wing').pips = 1;
  F.setOrder(c, 'jax', { duty: 'hold', target: null, fallback: null });
  const res = F.playRound(c, always(0)); // the shot hits
  assert.equal(R(c, 'wing').down, true);
  assert.equal(c.goal.work, 0, 'no progress from a technician who went down that round');
  assert.equal(c.end.result, 'lost');
  assert.equal(res.goalDelta, 0);
});

test('hack: four rounds of actual work win; the deadline fails it', () => {
  const b = fixture('holdHack', [ids.static, ids.jax]);
  for (let i = 0; i < FIGHT.workNeeded; i++) { assert.equal(b.end, null); draw(b, []); b.drawn = true; F.playRound(b, always(0.5)); b.round = i + 1; }
  assert.equal(b.end.result, 'won');
  const c = fixture('holdHack', [ids.static, ids.jax]);
  F.setOrder(c, 'wing', { duty: 'hold', target: null, fallback: null }); // never works
  c.enemies = [];
  while (!c.end) { draw(c, []); c.round += 1; F.playRound(c, always(0.5)); }
  assert.equal(c.end.result, 'deadline');
  assert.equal(c.round, FIGHT.deadline.holdHack, 'it ends on the deadline round');
});

test('the technician pulling out abandons the hack; an ordinary runner leaves alone and the crew carries on', () => {
  const b = fixture('holdHack', [ids.static, ids.jax, ids.stitch]);
  draw(b, []);
  F.setOrder(b, 'jax', { duty: 'withdraw' });
  F.playRound(b, always(0.5));
  assert.equal(R(b, 'jax').withdrawn, true);
  assert.equal(b.end, null, 'the crew carries on without them');
  assert.equal(b.goal.work, 1);
  const c = fixture('holdHack', [ids.static, ids.jax]);
  draw(c, []);
  F.setOrder(c, 'wing', { duty: 'withdraw' });
  F.playRound(c, always(0.5));
  assert.equal(c.end.result, 'abandoned');
});

test('a runner going down on cautious or steady pulls the crew back; on committed it fights on', () => {
  for (const [risk, ended] of [['cautious', 'extracted'], ['steady', 'extracted'], ['committed', null]]) {
    const b = fixture('holdHack', [ids.static, ids.jax, ids.stitch], { risk });
    b.enemies = [foe(1, 'corp')];
    R(b, 'jax').pips = 1;
    draw(b, [{ enemy: 1, kind: 'aim', target: 'jax' }]);
    F.setOrder(b, 'jax', { duty: 'hold', target: null, fallback: null });
    R(b, 'jax').cover = 'open';
    // Cover the others' threshold so only Jax is in trouble.
    if (risk !== 'committed') { b.risk.level = 'committed'; b.risk.level = risk; }
    F.playRound(b, always(0));
    assert.equal(R(b, 'jax').down || R(b, 'jax').withdrawn, true, risk);
    assert.equal(b.end?.result ?? null, ended, risk);
  }
});

// --- holdExtract, the van ---------------------------------------------------------------------------------------

test('holdExtract: the van pulls in at its round; nothing is a success before it, and pulling back is never a win', () => {
  const b = fixture('holdExtract', [ids.jax, ids.stitch, ids.velvet]);
  b.enemies = [];
  const seen = [];
  while (!b.end && b.round < 12) {
    draw(b, []); b.round += 0; b.drawn = true;
    const before = b.stage;
    F.playRound(b, always(0.5));
    seen.push([b.round, before, b.stage, b.end?.result ?? null]);
    b.round += 1;
  }
  assert.equal(seen[0][3], null, 'round 1: no extraction');
  assert.equal(seen.find((s) => s[2] === 1)[0] >= FIGHT.vanRound, true, 'the van is not there before vanRound');
  const c = fixture('holdExtract', [ids.jax, ids.stitch]);
  assert.equal(F.pullBack(c).result, 'pulledBack');
  assert.notEqual(c.end.result, 'won');
});

test('vanRound: the driver brings the van exactly one round earlier, once, for +1 heat', () => {
  const run = (wheels) => {
    const rng = makeRng(4);
    const b = F.buildFight({ type: 'holdExtract', diff: 14, threat: 4, site: 'docks', crew: crewOf().slice(0, 4), approach: 'loud', wheels }, rng);
    let vanAt = null;
    while (!b.end && b.round < 12) { F.playRound(b, rng); if (b.stage === 1 && vanAt === null) vanAt = b.round; }
    return { vanAt, heat: b.heat, used: b.vanUsed };
  };
  const without = run(null);
  const withDriver = run({ id: 'teo', handle: 'Wheels', value: 17 });
  assert.equal(without.vanAt, FIGHT.vanRound);
  assert.equal(without.used, false);
  assert.ok(withDriver.used, 'the special fired');
  assert.equal(withDriver.vanAt, FIGHT.vanRound - 1, 'exactly one round earlier');
  assert.equal(withDriver.heat >= FIGHT.vanEarlyHeat, true);
});

/** A fight already at the van: Jax and Velvet outside, Stitch down at the door, the van leaving at round 5. */
function atTheVan({ risk = 'steady', down = true, last = false } = {}) {
  const b = fixture('holdExtract', [ids.jax, ids.velvet, ids.stitch], { risk, set: { jax: { cool: 30 }, cherry: { cool: 30 }, mei: { cool: 30 } } });
  b.stage = 1; b.round = last ? 5 : 4; b.goal.vanLeaves = 5;
  if (down) { const m = R(b, 'mei'); m.down = true; m.downRound = 3; m.pips = 0; }
  return b;
}

test('boarding is contested: a cool roll each, door slots a round, the most hurt first, and boarders are in the open', () => {
  const b = atTheVan({ down: false });
  b.runners.push({ ...R(b, 'jax'), id: 'x1', handle: 'X1', seat: 3 }, { ...R(b, 'jax'), id: 'x2', handle: 'X2', seat: 4 });
  for (const r of b.runners) { r.pips = r.max; }
  R(b, 'x2').pips = 1; // the most hurt gets a slot first
  draw(b, []);
  for (const r of b.runners) F.setOrder(b, r.id, { duty: 'push', target: null, fallback: { duty: 'hold', target: null } });
  const pv = F.previewRound(b);
  const boarding = pv.actions.filter((a) => ['board', 'carry'].includes(a.kind));
  assert.equal(boarding.length, FIGHT.doorSlots, 'three door slots a round');
  assert.ok(boarding.some((a) => a.who === 'x2'), 'the most hurt is in the first slots');
  assert.equal(pv.actions.filter((a) => a.kind === 'hunker' || a.kind === 'move').length, b.runners.length - FIGHT.doorSlots);
});

test('carrying: the best cool goes back for the downed runner; on a success both are in the van', () => {
  const b = atTheVan();
  R(b, 'cherry').stats.cool.value = 25; // best cool
  draw(b, []);
  const pv = F.previewRound(b);
  const carry = pv.actions.find((a) => a.kind === 'carry');
  assert.equal(carry.who, 'cherry');
  assert.equal(carry.target, 'mei');
  F.playRound(b, always(0.999)); // every d20 is a 20
  assert.equal(R(b, 'mei').aboard, true, 'carried');
  assert.equal(R(b, 'cherry').aboard, true);
  assert.equal(R(b, 'jax').aboard, true);
  assert.equal(b.end.result, 'won');
});

// Rule changed on purpose (2026-11-13, docs/design/2026-11.md): boarding and carrying need no roll.
test('a downed runner can be ordered carried (protect a downed teammate); a carry needs no roll, so the worst dice still get both in', () => {
  const b = atTheVan();
  draw(b, []);
  F.setOrder(b, 'jax', { duty: 'protect', target: 'mei', fallback: { duty: 'push', target: null } });
  F.setOrder(b, 'cherry', { duty: 'hold', target: null, fallback: null });
  assert.equal(F.previewRound(b).actions.find((a) => a.who === 'jax').kind, 'carry');
  const r = F.playRound(b, always(0)); // every d20 is a 1
  assert.equal(R(b, 'mei').aboard, true);
  assert.equal(R(b, 'jax').aboard, true, 'both in the van');
  assert.ok(r.lines.filter((l) => ['board', 'carry'].includes(l.kind)).every((l) => !l.roll), 'no roll is recorded for the van');
});

test('boarding needs no roll, but a boarder is in the open that round and one shot down on the way stays outside', () => {
  const b = atTheVan();
  for (const x of b.runners) F.setOrder(b, x.id, { duty: 'push', target: null, fallback: { duty: 'hold', target: null } });
  draw(b, []);
  F.playRound(b, always(0));
  assert.ok(b.runners.filter((x) => !x.down).every((x) => x.aboard), 'everyone standing who had a door slot is aboard on the worst dice');
  const c = atTheVan();
  const jax = R(c, 'jax');
  assert.ok(F.aimChance(c, jax, { open: true }) > F.aimChance(c, jax), 'making for the van is the open');
});

test('a fight is played FIGHT.ease below the job difficulty, in the run and in the planning read alike', () => {
  assert.equal(F.fightDiff(16), 16 - FIGHT.ease);
  assert.equal(FIGHT.ease, 2);
});

test('nobody abandons a downed runner while the van is there: someone in the van climbs back out', () => {
  const b = atTheVan();
  R(b, 'jax').aboard = true; R(b, 'cherry').aboard = true;
  b.drawn = false;
  const rng = always(0.999);
  const lines = F.startRound(b, rng);
  assert.ok(lines.some((l) => l.key === 'climbBack'));
  assert.equal(F.standing(b).length, 1, 'one is back outside');
});

test('the van that cannot wait: hands-off cautious and steady hold it two rounds for +1 heat; committed lets it go and leaves them', () => {
  for (const risk of ['cautious', 'steady']) {
    const b = atTheVan({ risk, last: true });
    draw(b, []); for (const r of b.runners) if (r.id !== 'mei') F.setOrder(b, r.id, { duty: 'hold', target: null, fallback: null });
    F.playRound(b, always(0.999));
    assert.equal(b.goal.vanLeaves, 5 + FIGHT.holdRounds, `${risk}: held`);
    assert.equal(b.heat, FIGHT.holdHeat);
    assert.equal(b.end, null);
  }
  const c = atTheVan({ risk: 'committed', last: true });
  draw(c, []); for (const r of c.runners) if (r.id !== 'mei') F.setOrder(c, r.id, { duty: 'hold', target: null, fallback: null });
  F.playRound(c, always(0.999));
  assert.equal(c.end.result, 'leftBehind');
  assert.deepEqual(c.left.sort(), ['cherry', 'jax', 'mei']);
  // The held van is held once: the next last round it goes.
  const d = atTheVan({ risk: 'steady', last: true });
  d.vanHeld = true;
  draw(d, []); for (const r of d.runners) if (r.id !== 'mei') F.setOrder(d, r.id, { duty: 'hold', target: null, fallback: null });
  F.playRound(d, always(0.999));
  assert.equal(d.end.result, 'leftBehind');
});

test('a call-in answer for the van overrides the hands-off rule', () => {
  const b = atTheVan({ risk: 'steady', last: true });
  b.vanHold = false; // "go now"
  draw(b, []); for (const r of b.runners) if (r.id !== 'mei') F.setOrder(b, r.id, { duty: 'hold', target: null, fallback: null });
  F.playRound(b, always(0.999));
  assert.equal(b.end.result, 'leftBehind');
});

test('overwatch covers the door: one attack a round, only one shot at the van', () => {
  const b = atTheVan({ down: false });
  b.overwatch = { id: 'x', handle: 'Hawk', kit: 'rifle', value: 30, damage: 5, left: 2, heat: 1, neural: 0, vanShots: 0 };
  b.enemies = [foe(1, 'enforcer'), foe(2, 'hired')];
  draw(b, [{ enemy: 1, kind: 'aim', target: 'jax' }, { enemy: 2, kind: 'aim', target: 'cherry' }]);
  for (const r of b.runners) F.setOrder(b, r.id, { duty: 'hold', target: null, fallback: null });
  F.setOrder(b, 'jax', { duty: 'push', target: null, fallback: null }); // jax runs for the van: the threat to him is the worst
  assert.equal(F.previewRound(b).overwatch.enemy, 1, 'aimed at whoever threatens a runner in the open');
  const r1 = F.playRound(b, always(0.999));
  assert.equal(b.overwatch.left, 1);
  assert.equal(r1.heat >= 1, true, 'a rifle shot is heat');
  assert.equal(b.overwatch.vanShots, 1);
  draw(b, [{ enemy: 2, kind: 'aim', target: 'cherry' }]);
  b.round = 4; b.end = null;
  assert.equal(F.previewRound(b).overwatch, null, 'no second shot at the van');
});

// --- jam, radio, clocks -------------------------------------------------------------------------------------------

test('a jam answers every radio call this round and takes out a drone; a failed jam answers nothing', () => {
  const mk = () => {
    const b = fixture('holdHack', [ids.static, ids.jax, ids.stitch], { set: { jax: { endurance: 20 } } });
    b.enemies = [foe(1, 'corp'), foe(2, 'drone')];
    draw(b, [{ enemy: 1, kind: 'backup' }, { enemy: 2, kind: 'alarm' }]);
    F.setOrder(b, 'jax', { duty: 'support', target: null, fallback: null });
    F.setOrder(b, 'wing', { duty: 'hold', target: null, fallback: null });
    return b;
  };
  const ok = mk();
  R(ok, 'jax').jammer = true; R(ok, 'jax').stats.tech.value = 30;
  F.playRound(ok, always(0.999));
  assert.equal(ok.enemies[1].out, true, 'the drone is out');
  assert.equal(ok.arriving.length, 0, 'the backup call never went out');
  const bad = mk();
  R(bad, 'jax').jammer = true; R(bad, 'jax').stats.tech.value = 0;
  F.playRound(bad, always(0));
  assert.equal(bad.arriving.length, 1, 'the call went out');
  assert.equal(bad.extras, 1);
});

test('radio calls and the clocks escalate: backup arrives next round; the alarm clock runs out; pressure adds an enemy', () => {
  const b = fixture('holdHack', [ids.static, ids.jax]);
  b.clock = 1;
  draw(b, []);
  F.playRound(b, always(0.5));
  assert.equal(b.arriving.length, 1, 'the alarm clock ran out: one more on the way');
  assert.equal(b.clock, 3, 'and reset');
  const rng = makeRng(2);
  const c = F.buildFight({ type: 'holdExtract', diff: 14, threat: 2, site: 'docks', crew: crewOf().slice(0, 3), approach: 'loud' }, rng);
  const start = c.enemies.length;
  while (c.round < 3) F.playRound(c, rng);
  assert.ok(c.enemies.length > start || c.enemies.every((e) => e.out), 'pressure brought another by round 3');
});

test('the hired break and run when too few are left', () => {
  const b = fixture('holdHack', [ids.static, ids.jax], { site: 'docks' });
  b.enemies = [foe(1, 'hired'), foe(2, 'hired', { out: true }), foe(3, 'hired', { out: true })];
  b.hiredTotal = 3;
  draw(b, []);
  F.setOrder(b, 'jax', { duty: 'hold', target: null, fallback: null });
  const res = F.playRound(b, always(0.5));
  assert.deepEqual(res.fled, [1]);
});

// --- the medic, bleeding, death ------------------------------------------------------------------------------------

test('the medic\'s aura: the most hurt standing runner gets a pip back a round, and downed teammates do not bleed', () => {
  const b = fixture('holdHack', [ids.static, ids.jax, ids.stitch], { risk: 'committed' });
  R(b, 'jax').pips = 2; R(b, 'wing').pips = 2; R(b, 'jax').max = 6; R(b, 'wing').max = 3;
  draw(b, []);
  F.setOrder(b, 'mei', { duty: 'hold', target: null, fallback: null }); // no patch: only the aura
  F.playRound(b, always(0.5));
  assert.equal(R(b, 'jax').pips, 3, 'the most hurt by share (Jax 2/6) gets +1');
  assert.equal(R(b, 'wing').pips, 2);
  // A downed teammate does not bleed while the medic stands: even with a die that always says bleed.
  const c = fixture('holdHack', [ids.static, ids.jax, ids.stitch], { risk: 'committed' });
  R(c, 'jax').down = true; R(c, 'jax').downRound = 0; R(c, 'jax').pips = 0;
  c.round = 5; draw(c, []);
  F.setOrder(c, 'mei', { duty: 'hold', target: null, fallback: null });
  F.playRound(c, () => 0); // the stabilise roll is a 1 and fails; the bleed roll would kill
  assert.equal(R(c, 'jax').dead, false, 'the medic keeps them going');
  // Without a standing medic, a committed crew bleeds.
  const d = fixture('holdHack', [ids.static, ids.jax], { risk: 'committed' });
  R(d, 'jax').down = true; R(d, 'jax').downRound = 0; R(d, 'jax').pips = 0;
  d.round = 5; draw(d, []);
  F.playRound(d, always(0));
  assert.equal(R(d, 'jax').dead, true, 'bleeds out');
});

test('bleeding starts the second round after going down, and only on committed (or pushed on by hand)', () => {
  for (const [risk, fightOn, dies] of [['steady', false, false], ['cautious', false, false], ['committed', false, true], ['steady', true, true]]) {
    const b = fixture('holdHack', [ids.static, ids.jax], { risk });
    R(b, 'jax').down = true; R(b, 'jax').pips = 0; R(b, 'jax').fightOn = fightOn; R(b, 'jax').downRound = 4;
    b.round = 5; draw(b, []);
    F.playRound(b, always(0));
    assert.equal(R(b, 'jax').dead, false, `${risk}: not in the grace round`);
    b.end = null; b.round = 6; draw(b, []);
    F.playRound(b, always(0));
    assert.equal(R(b, 'jax').dead, dies, `${risk}${fightOn ? ' pushed on' : ''}`);
  }
});

test('a hand-ordered withdrawal can cost a life; a risk-driven one goes to death\'s door', () => {
  for (const [byHand, dead] of [[true, true], [false, false]]) {
    const b = fixture('holdHack', [ids.static, ids.jax, ids.stitch]);
    b.enemies = [foe(1, 'corp')];
    R(b, 'jax').pips = 1;
    draw(b, [{ enemy: 1, kind: 'aim', target: 'jax' }]);
    if (byHand) F.setOrder(b, 'jax', { duty: 'withdraw' }); // else steady's 2-pip threshold pulls them out
    F.playRound(b, always(0));
    assert.equal(R(b, 'jax').dead, dead, byHand ? 'ordered by hand' : 'by the risk setting');
    assert.equal(R(b, 'jax').down, !dead);
  }
});

test('death only follows committed risk, a push on, or a hand-ordered withdrawal: random orders, many seeds, both types', () => {
  const duties = ['attack', 'protect', 'support', 'hold', 'push'];
  const tally = { cautious: 0, steady: 0, committed: 0 };
  for (const type of ['holdHack', 'holdExtract']) for (const risk of ['cautious', 'steady', 'committed']) for (let seed = 1; seed <= 120; seed++) {
    const rng = makeRng(seed * 31 + (type === 'holdHack' ? 1 : 2));
    const crew = crewOf(seed);
    const b = F.buildFight({ type, diff: 14, threat: 5, site: type === 'holdHack' ? 'heights' : 'docks', crew, approach: 'loud', risk, wheels: { id: 'teo', handle: 'Wheels', value: 17 } }, rng);
    for (const r of b.runners) F.setOrder(b, r.id, { duty: duties[Math.floor(rng() * duties.length)], target: null, fallback: { duty: duties[Math.floor(rng() * duties.length)], target: null } }); // never 'withdraw': no hand-ordered withdrawals here
    F.playFight(b, rng);
    for (const r of b.runners.filter((x) => x.dead)) { tally[risk] += 1; assert.equal(risk, 'committed', `${type} seed ${seed}: ${r.id} died on ${risk}`); }
  }
  assert.equal(tally.cautious + tally.steady, 0);
});

test('left behind: missing, never dead unless committed and down; the van\'s hold odds are the played ones', () => {
  let died = 0; let left = 0;
  for (let seed = 1; seed <= 400; seed++) {
    const b = atTheVan({ risk: 'committed', last: true });
    R(b, 'mei').stable = true; // stabilised: no bleed roll, so this is the left-behind roll alone
    draw(b, []);
    for (const r of b.runners) if (r.id !== 'mei') F.setOrder(b, r.id, { duty: 'hold', target: null, fallback: null });
    F.playRound(b, makeRng(seed));
    if (b.left.length) left += 1;
    if (R(b, 'mei').dead) died += 1;
  }
  assert.equal(left, 400);
  assert.ok(died > 15 && died < 70, `about ${FIGHT.leftDownDeath * 100}% of a downed runner left on committed: ${died}/400`);
  const s = atTheVan({ risk: 'steady', last: true });
  s.vanHeld = true;
  draw(s, []); for (const r of s.runners) if (r.id !== 'mei') F.setOrder(s, r.id, { duty: 'hold', target: null, fallback: null });
  F.playRound(s, makeRng(1));
  assert.equal(R(s, 'mei').dead, false, 'left behind down on steady is missing, not dead');
});

// --- outcomes and the planning read -----------------------------------------------------------------------------

test('pips left become the injury: light below half, serious below a quarter, down is critical', () => {
  const r = { pips: 5, max: 10 };
  assert.equal(F.injuryFromPips({ pips: 10, max: 10 }), 'none');
  assert.equal(F.injuryFromPips(r), 'none');
  assert.equal(F.injuryFromPips({ pips: 4, max: 10 }), 'light');
  assert.equal(F.injuryFromPips({ pips: 2, max: 10 }), 'serious');
  const b = fixture('holdHack', [ids.static, ids.jax, ids.stitch]);
  R(b, 'jax').down = true; R(b, 'jax').pips = 0;
  R(b, 'mei').dead = true;
  R(b, 'wing').pips = 1; R(b, 'wing').max = 6;
  const out = Object.fromEntries(F.outcomeOf(b).map((o) => [o.id, o.injury]));
  assert.deepEqual(out, { wing: 'serious', jax: 'critical', mei: 'dead' });
});

test('fightOdds plays playRound on fixed seeds: the same read twice, and the same as playing it by hand', () => {
  const b = F.buildFight({ type: 'holdHack', diff: 14, threat: 3, site: 'heights', crew: crewOf().slice(0, 4), approach: 'loud' }, makeRng(9));
  const a = F.fightOdds(b, 40);
  assert.deepEqual(F.fightOdds(b, 40), a);
  let win = 0;
  for (let i = 0; i < 40; i++) { const c = structuredClone(b); F.playFight(c, makeRng(0x5eed + i * 7919)); if (c.end.result === 'won') win += 1; }
  assert.equal(a.win, win / 40);
  const worse = structuredClone(b); worse.enemies.push(foe(9, 'corp'), foe(10, 'corp'), foe(11, 'corp'));
  assert.ok(F.fightOdds(worse, 40).win < a.win, 'more enemies, worse odds');
});

test('the shown chance of a death is the played one: fightOdds dead = deaths in the same fights', () => {
  const b = F.buildFight({ type: 'holdExtract', diff: 14, threat: 5, site: 'docks', crew: crewOf().slice(0, 4), approach: 'loud', risk: 'committed' }, makeRng(6));
  const read = F.fightOdds(b, 60);
  let dead = 0;
  for (let i = 0; i < 60; i++) { const c = structuredClone(b); F.playFight(c, makeRng(0x5eed + i * 7919)); if (c.runners.some((r) => r.dead)) dead += 1; }
  assert.equal(read.dead, dead / 60);
});

// --- dilemmas ---------------------------------------------------------------------------------------------------------

test('dilemmas: techUnderFire holds on half pips with a radio call shown, not on shots alone; once per situation', () => {
  const b = fixture('holdHack', [ids.static, ids.jax, ids.stitch], { set: { wing: { endurance: 12 } } });
  b.enemies = [foe(1), foe(2), foe(3)];
  draw(b, [{ enemy: 1, kind: 'aim', target: 'wing' }]);
  assert.deepEqual(F.dueDilemmas(b), [], 'one shot, full pips: nothing');
  draw(b, [{ enemy: 1, kind: 'aim', target: 'wing' }, { enemy: 2, kind: 'aim', target: 'wing' }, { enemy: 3, kind: 'aim', target: 'wing' }]);
  assert.deepEqual(F.dueDilemmas(b), [], 'shots alone, even three, no longer call the crew in');
  R(b, 'wing').pips = 3;
  draw(b, [{ enemy: 1, kind: 'aim', target: 'wing' }, { enemy: 2, kind: 'aim', target: 'wing' }]);
  assert.deepEqual(F.dueDilemmas(b), [], 'half pips but no radio call shown: nothing');
  draw(b, [{ enemy: 1, kind: 'backup' }, { enemy: 2, kind: 'aim', target: 'wing' }]);
  const due = F.dueDilemmas(b);
  assert.equal(due.length, 1);
  assert.equal(due[0].id, 'techUnderFire');
  b.dilemmasFired[due[0].key] = true;
  assert.deepEqual(F.dueDilemmas(b), [], 'not again for the same situation');
  R(b, 'wing').pips = 4;
  assert.deepEqual(F.dueDilemmas(b), [], 'revalidated: above half pips it no longer holds');
});

test('dilemmas: vanCantWait only in the last round with someone outside', () => {
  const b = atTheVan();
  draw(b, []);
  assert.equal(b.round, 4);
  assert.deepEqual(F.dueDilemmas(b), [], 'not the last round yet');
  b.round = 5;
  const due = F.dueDilemmas(b);
  assert.equal(due[0].id, 'vanCantWait');
  assert.deepEqual(due[0].subjects, ['cherry', 'jax', 'mei']);
  for (const r of b.runners) r.aboard = true;
  assert.deepEqual(F.dueDilemmas(b), [], 'nobody outside: nothing to decide');
});

test('dilemma options change real orders (the patch selectors), and "carry on" changes none', () => {
  const b = fixture('holdHack', [ids.static, ids.jax, ids.stitch, ids.velvet], { set: { wing: { endurance: 12 } } });
  b.enemies = [foe(1), foe(2)];
  draw(b, [{ enemy: 1, kind: 'backup' }, { enemy: 2, kind: 'aim', target: 'wing' }]);
  const opts = Object.fromEntries(DILEMMAS.techUnderFire.options.map((o) => [o.id, o]));
  const before = JSON.stringify(b.orders);
  assert.deepEqual(F.applyPatch(b, opts.carryOn.ordersPatch), []);
  assert.equal(JSON.stringify(b.orders), before);
  const changed = F.applyPatch(b, opts.cover.ordersPatch);
  assert.deepEqual(changed.sort(), ['cherry', 'jax', 'mei']);
  for (const id of changed) assert.deepEqual([b.orders[id].duty, b.orders[id].target], ['protect', 'protected']);
  F.applyPatch(b, opts.radio.ordersPatch);
  const attacker = changed.map((id) => b.orders[id]).find((o) => o.duty === 'attack');
  assert.equal(attacker.target, 1, 'the radio call comes from enemy 1');
  F.applyPatch(b, opts.jam.ordersPatch);
  assert.deepEqual([b.orders.wing.duty, b.orders.wing.target], ['support', 1], 'the tech stops the call: no hack progress that round');
});

test('wording is placeholders in data: every key a line or dilemma uses has text, and no fixed names appear', () => {
  const keys = new Set();
  for (let seed = 1; seed <= 25; seed++) for (const type of ['holdHack', 'holdExtract']) {
    const r = makeRng(seed);
    const b = F.buildFight({ type, diff: 14, threat: 4, site: type === 'holdHack' ? 'heights' : 'docks', crew: crewOf(seed), approach: 'loud', risk: seed % 2 ? 'committed' : 'steady', wheels: { id: 'teo', handle: 'Wheels', value: 17 } }, r);
    while (!b.end && b.round < 20) { for (const l of F.playRound(b, r).lines) keys.add(l.key); }
    if (b.end) keys.add(b.end.key);
  }
  for (const k of keys) assert.ok(FIGHT_TEXT[k], `text for ${k}`);
  for (const [id, d] of Object.entries(DILEMMAS)) {
    assert.ok(FIGHT_TEXT[`dilemma.${id}.changed`], id);
    for (const o of d.options) assert.ok(FIGHT_TEXT[`dilemma.${id}.${o.id}`], `${id}.${o.id}`);
    assert.ok(d.options.some((o) => o.ordersPatch === null && o.id === 'carryOn') || id === 'vanCantWait' || id === 'pullOutPoint', `${id} offers keeping the orders (the van call-in has leave on time instead, the pull-out call keep them in)`);
  }
  assert.ok(FIGHT_TEXT['callin.pullBack'], 'every call-in offers Pull back');
  const names = [...STARTING_CREW.flatMap((o) => [o.handle, o.name.split(' ')[0]])];
  for (const [k, text] of Object.entries(FIGHT_TEXT)) for (const n of names) assert.ok(!text.includes(n), `${k} has the name ${n}`);
  assert.equal(lineText('nope.unknown'), 'nope.unknown');
  assert.equal(lineText('attackHit', { who: 'Jax', enemy: 'security guard 1' }), 'Jax gets a hit in on security guard 1.');
  // A line starts with a capital whatever its first slot; a count switches the plural.
  assert.equal(lineText('shotMiss', { enemy: 'drone 2', who: 'Jax' }), 'Drone 2 fires wide of Jax.');
  assert.equal(lineText('ifNothing.shots', { n: 1 }), '1 incoming shot with no shield assigned.');
  assert.equal(lineText('ifNothing.shots', { n: 2 }), '2 incoming shots with no shield assigned.');
  assert.equal(lineText('ifNothing.radio', { n: 1 }), '1 radio call with no jam assigned (hitting the caller is not counted).');
});

test('wording keeps its slots: nothing a line needs is left unfilled, and every trade-off and kind word exists', () => {
  const need = { arrive: ['kind', 'n'], pressure: ['kind', 'n'], vanEarly: ['round'], vanIn: ['leaves'], vanHeld: ['rounds'], vanCantWait: ['outside'], 'threat.aim': ['enemy', 'who', 'chance', 'pips'], 'end.lost': ['who'], 'end.abandoned': ['who'], 'end.leftBehind': ['who'], 'end.lostRunner': ['who'], shotDead: ['enemy', 'who'] };
  for (const [k, slots] of Object.entries(need)) for (const sl of slots) assert.ok(FIGHT_TEXT[k].includes(`{${sl}}`), `${k} keeps {${sl}}`);
  for (const kind of ['hired', 'corp', 'drone', 'enforcer']) assert.ok(FIGHT_TEXT[`kind.${kind}`], `a word for ${kind}`);
  for (const [id, d] of Object.entries(DILEMMAS)) for (const o of d.options) if (o.ordersPatch || o.vanWait || id === 'vanCantWait') assert.ok(FIGHT_TEXT[`dilemma.${id}.${o.id}.tradeoff`], `${id}.${o.id} says what it does`);
  // The hold's heat is shown from the dilemma's cost and charged from the rules: they must agree.
  assert.equal(DILEMMAS.vanCantWait.options.find((o) => o.id === 'hold').cost.heat, FIGHT.holdHeat, 'the call-in shows the heat the van charges');
  for (const k of ['callin.cost', 'callin.pullBackCost']) assert.ok(FIGHT_TEXT[k], k);
  // Placeholders are gone: no key reads as a bracketed tag.
  for (const [k, text] of Object.entries(FIGHT_TEXT)) assert.ok(!/^\[/.test(text), `${k} is still a placeholder`);
  // Hit lines carry no numbers, and a downed or out line never says dead.
  for (const k of ['attackHit', 'attackOut', 'overwatchHit', 'overwatchOut', 'shotHit', 'shotDown']) assert.ok(!/\d|pip/.test(FIGHT_TEXT[k]), `${k} has no damage numbers`);
  for (const k of ['attackOut', 'overwatchOut', 'shotDown']) assert.ok(!/dead|dies|kill/.test(FIGHT_TEXT[k]), `${k} does not claim a death`);
});

// --- review fixes (PR 129) ----------------------------------------------------------------------------------

test('heat is reported once, even when startRound ran first (the run calls it before playRound): the early van\'s +1 is not lost', () => {
  const b = fixture('holdExtract', [ids.jax, ids.stitch, ids.velvet], { wheels: { id: 'teo', handle: 'Wheels', value: 17 } });
  b.enemies = [foe(1, 'hired'), foe(2, 'hired')];
  R(b, 'jax').pips = 1; // someone nearly down: the driver brings the van a round early
  const rng = makeRng(5);
  F.startRound(b, rng);
  assert.equal(b.vanUsed, true);
  const r1 = F.playRound(b, rng);
  assert.equal(r1.heat, FIGHT.vanEarlyHeat, 'the early van\'s heat reaches the round result');
  assert.equal(F.playRound(b, rng).heat, 0, 'and is reported once');
});

test('someone down whom nobody pushed on for pulls the crew back, even after another runner was pushed on for', () => {
  const b = fixture('holdHack', [ids.static, ids.jax, ids.stitch]);
  R(b, 'jax').down = true; R(b, 'jax').fightOn = true; R(b, 'jax').downRound = 1; R(b, 'jax').pips = 0;
  draw(b, []);
  F.playRound(b, always(0.5));
  assert.equal(b.end, null, 'the one pushed on for does not pull the crew back');
  const c = fixture('holdHack', [ids.static, ids.jax, ids.stitch]);
  R(c, 'jax').down = true; R(c, 'jax').fightOn = true; R(c, 'jax').downRound = 1; R(c, 'jax').pips = 0;
  R(c, 'mei').down = true; R(c, 'mei').downRound = 1; R(c, 'mei').pips = 0;
  draw(c, []);
  F.playRound(c, always(0.5));
  assert.equal(c.end.result, 'extracted', 'the second one down is the death\'s-door call');
});

test('the van is held once: no second vanCantWait call-in for a hold that cannot happen', () => {
  const b = fixture('holdExtract', [ids.jax, ids.velvet, ids.stitch], { risk: 'steady' });
  b.stage = 1; b.round = 5; b.goal.vanLeaves = 5;
  R(b, 'mei').down = true; R(b, 'mei').pips = 0; R(b, 'mei').downRound = 3;
  draw(b, []);
  assert.equal(F.dueDilemmas(b).length, 1);
  b.vanHeld = true;
  assert.deepEqual(F.dueDilemmas(b), [], 'already held once');
  assert.equal(F.dilemmaHolds(b, 'vanCantWait'), false);
});

// --- call-in overrides last one resolved round, and the jam is offered only when it can work (owner, 2026-11-11) -------------

/** A hack fight at the tech's call-in: Static works, three more protect or attack, a radio call and a shot on the tech. */
function underFire(radio = true) {
  const b = fixture('holdHack', [ids.static, ids.jax, ids.stitch, ids.velvet], { set: { wing: { endurance: 12 } } });
  b.enemies = [foe(1), foe(2)];
  draw(b, [radio ? { enemy: 1, kind: 'backup' } : { enemy: 1, kind: 'aim', target: 'mei' }, { enemy: 2, kind: 'aim', target: 'wing' }]);
  return b;
}
const techOpts = () => Object.fromEntries(DILEMMAS.techUnderFire.options.map((o) => [o.id, o]));

test('the jam is offered only with a radio call shown and a tech who can jam', () => {
  const o = techOpts();
  const withCall = underFire(true);
  assert.ok(R(withCall, 'wing').jammer, 'the authored tech can jam');
  assert.equal(F.optionAvailable(withCall, o.jam), true, 'a call and a jammer: offered');
  assert.equal(F.optionAvailable(underFire(false), o.jam), false, 'no radio call shown: not offered');
  const cannot = underFire(true);
  R(cannot, 'wing').jammer = false;
  assert.equal(F.optionAvailable(cannot, o.jam), false, 'a tech who cannot jam: not offered');
  const cancelled = underFire(true);
  cancelled.threats.forEach((t) => { if (t.kind === 'backup') t.cancelled = true; });
  assert.equal(F.optionAvailable(cancelled, o.jam), false, 'a call already stopped is not a call to jam');
  for (const id of ['cover', 'radio', 'carryOn']) assert.equal(F.optionAvailable(withCall, o[id]), true, `${id} has no requirement`);
});

test('cover, radio and jam last one resolved round, then the previous orders come back', () => {
  for (const id of ['cover', 'radio', 'jam']) {
    const b = underFire(true);
    const before = JSON.stringify(b.orders);
    const changed = F.applyPatch(b, techOpts()[id].ordersPatch);
    assert.ok(changed.length, `${id} changes someone`);
    assert.notEqual(JSON.stringify(b.orders), before, `${id}: the orders are changed for the round`);
    F.playRound(b, always(0.999));
    assert.equal(JSON.stringify(b.orders), before, `${id}: the crew's own orders are back after one round`);
    assert.equal(b.override, undefined, `${id}: nothing left to restore`);
  }
});

test('two patches before the round restore the first orders, not the first patch', () => {
  const b = underFire(true);
  const before = JSON.stringify(b.orders);
  F.applyPatch(b, techOpts().cover.ordersPatch);
  F.applyPatch(b, techOpts().radio.ordersPatch);
  F.playRound(b, always(0.999));
  assert.equal(JSON.stringify(b.orders), before);
});

test('an order the player sets after the call-in stands; the rest are restored', () => {
  const b = underFire(true);
  const before = JSON.parse(JSON.stringify(b.orders));
  F.applyPatch(b, techOpts().cover.ordersPatch);
  F.setOrder(b, 'jax', { duty: 'attack', target: 2 });
  F.playRound(b, always(0.999));
  assert.equal(b.orders.jax.duty, 'attack', "Jax keeps the player's order");
  assert.equal(b.orders.jax.target, 2);
  for (const id of ['mei', 'cherry']) assert.deepEqual(b.orders[id] ?? null, before[id] ?? null, `${id} goes back to the crew's plan`);
});

test('a fight that ends in the round is not given its old orders back', () => {
  const b = underFire(true);
  b.goal.work = FIGHT.workNeeded - 1; // the tech keeps working under cover: this round finishes the hack
  F.applyPatch(b, techOpts().cover.ordersPatch);
  F.playRound(b, always(0.999));
  assert.equal(b.end.result, 'won');
  assert.equal(b.override, undefined);
  assert.equal(b.orders.jax.duty, 'protect', 'nothing is restored into a finished fight');
});

test('the withdrawal rule still outranks a call-in order, and a restored order does not undo it', () => {
  const b = underFire(true);
  R(b, 'jax').pips = 1; // under the steady threshold (2)
  F.applyPatch(b, techOpts().cover.ordersPatch);
  assert.equal(kinds(F.previewRound(b)).jax, 'withdraw', 'a runner at the threshold still pulls out');
  F.playRound(b, always(0.999));
  assert.ok(R(b, 'jax').withdrawn, 'and does');
});

test('previews, option checks and dilemma checks never draw', () => {
  const b = underFire(true);
  const real = Math.random;
  Math.random = () => { throw new Error('Math.random'); };
  try {
    const rng = counting(5);
    F.previewRound(b); F.dueDilemmas(b); F.dilemmaHolds(b, 'techUnderFire');
    for (const o of Object.values(techOpts())) F.optionAvailable(b, o);
    F.applyPatch(b, techOpts().jam.ordersPatch); F.previewRound(b);
    assert.equal(rng.n, 0);
  } finally { Math.random = real; }
});

test('the van call-in has two options: leave on time and hold', () => {
  assert.deepEqual(DILEMMAS.vanCantWait.options.map((o) => o.id), ['goNow', 'hold']);
  assert.ok(!FIGHT_TEXT['dilemma.vanCantWait.carryOn'] && !FIGHT_TEXT['callin.deadline'], 'removed keys are gone');
  assert.ok(/board/i.test(FIGHT_TEXT['dilemma.vanCantWait.goNow.tradeoff']), 'leaving on time still plays the round: runners can board');
  assert.ok(!/\{heat\}|Heat/.test(FIGHT_TEXT['dilemma.vanCantWait.hold.tradeoff']), 'the heat is shown once, as the cost');
});

// --- watchable combat, slice 0: seeds, odds key, line slots, previews ---------------------------------

import { hash, hash01 } from '../src/core/rng.js';

test('hash01 is a pure number in [0, 1) from its keys', () => {
  assert.equal(hash01('a', 1), hash01('a', 1));
  assert.notEqual(hash01('a', 1), hash01('a', 2));
  for (let i = 0; i < 200; i++) { const v = hash01('x', i); assert.ok(v >= 0 && v < 1); }
  assert.equal(hash01('a', 1), hash('a', 1) / 2 ** 32);
});

test('buildFight draws the showcase seed last, so it moves no other roll; the odds reseed without drawing', () => {
  const mk = () => fixture('holdHack', [ids.stitch, ids.jax, ids.static], { threat: 4 });
  const a = mk(), c = mk();
  assert.ok(Number.isInteger(a.showcaseSeed) && a.showcaseSeed >= 0 && a.showcaseSeed < 2 ** 32);
  assert.equal(a.showcaseSeed, c.showcaseSeed, 'same build rng, same seed');
  // It is the build's last draw: the last number the rng gave is the seed.
  let last = null;
  const rec = makeRng(3); const rng = () => (last = rec());
  const crew = crewOf().filter((o) => [ids.stitch, ids.jax, ids.static].includes(o.id));
  const built = F.buildFight({ type: 'holdHack', diff: 14, threat: 4, site: 'heights', crew, approach: 'loud' }, rng);
  assert.equal(built.showcaseSeed, Math.floor(last * 2 ** 32));
  // The odds do not depend on the stored seed, nor change it.
  const b = fixture('holdHack', [ids.stitch, ids.jax, ids.static]);
  b.enemies.push(foe(1));
  const seed0 = b.showcaseSeed;
  const o1 = F.fightOdds(b, 8);
  b.showcaseSeed = 12345;
  assert.deepEqual(F.fightOdds(b, 8), o1);
  assert.equal(b.showcaseSeed, 12345);
  assert.notEqual(seed0, undefined);
});

test('the odds key reads Overdrive, showcase eligibility, the extras cap, the recipe, and each enemy\'s approach and group', () => {
  const b = fixture('holdHack', [ids.stitch, ids.jax, ids.static]);
  b.enemies.push(foe(1));
  const k0 = F.oddsKey(b, 8);
  const change = (f) => { const c = structuredClone(b); f(c); return F.oddsKey(c, 8); };
  assert.equal(F.oddsKey(structuredClone(b), 8), k0, 'a copy has the same key');
  assert.notEqual(change((c) => { c.runners[0].overdrive = { cap: 3, uses: 1 }; }), k0, 'Overdrive');
  assert.notEqual(change((c) => { c.showcaseEligible = { holdTheLine: [c.runners[0].id] }; }), k0, 'showcase eligibility');
  assert.notEqual(change((c) => { c.maxExtra = 4; }), k0, 'maxExtra');
  assert.notEqual(change((c) => { c.recipe = { waves: [{ round: 3, kind: 'hired', count: 2 }] }; }), k0, 'recipe and waves');
  assert.notEqual(change((c) => { c.enemies[0].approaching = true; }), k0, 'approaching');
  assert.notEqual(change((c) => { c.enemies[0].group = 2; }), k0, 'group');
  assert.equal(change((c) => { c.showcaseSeed = 99; }), k0, 'the showcase seed is not in the key');
});

test('lines keep their key and slots, and the run\'s recorded event carries them', () => {
  const b = fixture('holdHack', [ids.stitch, ids.jax, ids.static]);
  b.enemies.push(foe(1), foe(2));
  const rng = makeRng(7);
  const lines = [...F.startRound(b, rng), ...F.playRound(b, rng).lines];
  assert.ok(lines.length > 0);
  for (const l of lines) { assert.equal(typeof l.key, 'string', l.kind); assert.equal(typeof l.slots, 'object', l.kind); }
});

test('previews leave the fight exactly as they found it and never show a showcase or Overdrive burst', () => {
  const b = fixture('holdHack', [ids.stitch, ids.jax, ids.static]);
  b.enemies.push(foe(1), foe(2));
  F.startRound(b, makeRng(5));
  b.spots = stageSpots(pickSite('docks', 'job-a', 'warehouse'), 'inside');
  const frozen = structuredClone(b);
  const outputs = [F.previewRound(b), F.resolveOrders(b), F.dueDilemmas(b), F.exposures(b, F.resolveOrders(b).actions ?? []), layoutFight(b)];
  assert.ok(outputs.at(-1).units, 'the layout placed the fight');
  assert.deepEqual(b, frozen, 'b is deep-equal after every preview');
  const banned = new Set(['showcaseStart', 'showcaseEnd', 'overdriveStart', 'showcase']);
  const walk = (v) => { if (Array.isArray(v)) v.forEach(walk); else if (v && typeof v === 'object') { if (banned.has(v.kind)) assert.fail(`preview contains ${v.kind}`); Object.values(v).forEach(walk); } };
  outputs.forEach(walk);
});
