// Engine 2: the fights of the battle rework (drafts/SPEC-battle-orders.md; the numbers are in
// data/fights.js; spec section 30 says what is settled). Pure logic, sitting beside engine 1
// (core/battle.js), which still plays every fight that is not one of the five jobs in FIGHT_JOBS,
// and raids. This file is the RULES: build a fight, show what is coming (telegraph), turn orders
// into actions (resolveOrders), preview a round (previewRound: no RNG), play it (playRound), and
// read the planning odds (fightOdds). core/runfight.js (slice 1c) is the run's side.
//
// It is a port of scripts/sim-step0.mjs (profile `medic`), the tested shape of every rule, with real
// gear and stats and the run's RNG: nothing here draws except telegraph and playRound, and only
// from the rng they are handed. Previews, "if nothing" and dilemma checks never draw.
//
// A fight (am.battle with engine: 2):
//   { engine: 2, type, stage, round, diff, deadline, drawn, end,
//     goal: { work, protect: opId|null, vanRound, vanLeaves }, clock, nextPressure, extras, arriving: [kind],
//     enemies: [{ n, kind, pips, max, absorb, cover, out, fled, deck, di }],
//     runners: [{ id, handle, role, seat, pips, max, absorb, ap, strong, jammer, healer, medic, cover,
//                 down, withdrawn, dead, aboard, stable, fightOn, downRound, left, stats }],
//     threats: [{ id, kind, enemy, target, shown, hit, shieldedBy, cancelled }]  (this round's draw),
//     orders: { [opId]: ORDER }, risk: { level }, vanHold: bool|null,
//     overwatch, wheels, standby, standbyOut, heat, dilemmasFired }
// ORDER { duty, target, priority, fallback: { duty, target }|null, byStage: { [stage]: ORDER }|null }.
// Ids: a runner's id is a string (the operative's), an enemy's n a number. "Lowest id" in a tie is the
// lowest seat (crew order).

import { FIGHT, ENEMIES, ENEMY_HIT, SITE_ENEMIES, COUNT_BY_THREAT, CLOCKS, FIGHTS, THREATS } from '../data/fights.js';
import { DILEMMAS } from '../data/dilemmas.js';
import { lineText, kindWord, enemyName, nameList, pipsWord } from './fighttext.js';
import { effectiveStat } from './crew.js';
import { weaponOf, armourOf } from './battle.js';
import { patchBonus, counted } from './gear.js';
import { d20, makeRng } from './rng.js';

export { FIGHT };

const FIGHT_STATS = ['combat', 'cool', 'medical', 'tech'];
const COVERS = ['open', 'half', 'full'];
const better = (c) => COVERS[Math.min(2, COVERS.indexOf(c) + 1)];
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
const RADIO = (t) => THREATS[t.kind]?.radio === true;

// --- the runners -----------------------------------------------------------------------------------

/** Pips in a fight: one per two points of endurance, at least minPips (spec 10a). */
export const maxPips = (op) => Math.max(FIGHT.minPips, Math.floor((op.stats?.endurance ?? 0) / FIGHT.endurancePerPip));

/** A runner's hit is strong on this margin, by their sidearm's damage (2 or less reads as 2, 5 or more as 5). */
export const strongMargin = (damage) => FIGHT.strongMarginByDamage[clamp(Math.round(damage ?? 2), 2, 5)];

/** Armour as hits absorbed a fight: a street vest 1, a pro vest 2 (data FIGHT.absorb). */
const absorbOf = (armourValue) => (armourValue >= 2 ? FIGHT.absorb.pro : armourValue === 1 ? FIGHT.absorb.street : FIGHT.absorb.none);

/**
 * Anyone carrying a jammer may try to jam, with their tech (spec 9). The game has no jammer item yet:
 * for now a cyberdeck counts, and a tech always does (the content question goes to the owner).
 */
export const canJam = (op) => op.role === 'tech' || counted(op).some((i) => i.type === 'deck');

/** A runner as they enter a fight: their numbers, read once (gear, traits and the approach included). */
export function runnerOf(op, approach, seat = 0) {
  const max = maxPips(op);
  const hurt = op.condition?.injury === 'light' ? FIGHT.lightWoundPips : 0;
  const w = weaponOf(op);
  const a = armourOf(op);
  return {
    id: op.id, handle: op.handle, role: op.role, seat, pips: Math.max(1, max - hurt), max,
    absorb: absorbOf(a.value), armourName: a.name, weapon: w.name, ap: (w.pierce ?? 0) > 0, strong: strongMargin(w.damage),
    jammer: canJam(op), healer: op.role === 'medic' || patchBonus(op) > 0, medic: op.role === 'medic',
    cover: FIGHT.startCover, down: false, withdrawn: false, dead: false, aboard: false, stable: false, fightOn: false, downRound: null, left: false,
    stats: Object.fromEntries(FIGHT_STATS.map((s) => [s, effectiveStat(op, s, { approach })])),
  };
}

const sv = (r, s) => r.stats[s]?.value ?? 0;
const bySeat = (a, b) => a.seat - b.seat;
const lowestPips = (list) => [...list].sort((a, b) => a.pips - b.pips || bySeat(a, b))[0];

// --- building a fight -------------------------------------------------------------------------------

const shuffle = (a, rng) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

function newEnemy(b, kind, rng) {
  const def = ENEMIES[kind];
  const e = { n: b.enemies.length + 1, kind, pips: def.pips, max: def.pips, absorb: def.absorb ?? 0, cover: def.cover, out: false, fled: false, deck: shuffle([...def.deck], rng), di: 0 };
  b.enemies.push(e);
  if (kind === 'hired') b.hiredTotal += 1;
  return e;
}

/**
 * Build a fight. type: 'holdHack' | 'holdExtract'. diff: the fight's base difficulty (the job's typical
 * roll). threat: the job's threat 1-5 (how many enemies start). site: a district id (who they are).
 * crew: the inside team (operatives, still standing). overwatch: an overwatchOf() read from core/battle.js
 * or null; wheels: { id, handle, value } for the driver in the van; standbyOp: the standby, who rides with
 * the van. rng: the run's stream (the enemies' decks are shuffled from it). Orders start as the crew's
 * defaults, visible and editable.
 */
export function buildFight({ type, diff, threat = 3, site = 'docks', crew, approach, overwatch = null, wheels = null, standbyOp = null, risk = 'steady', watched = false }, rng) {
  const def = FIGHTS[type];
  const b = {
    engine: 2, type, stage: 0, round: 0, diff, deadline: type === 'holdHack' ? FIGHT.deadline.holdHack : null, drawn: false, end: null,
    goal: { work: 0, protect: null, vanRound: FIGHT.vanRound, vanLeaves: null },
    clock: CLOCKS.alarm.startsAt, nextPressure: CLOCKS.pressure.firstRound, extras: 0, arriving: [], hiredTotal: 0,
    enemies: [], runners: crew.map((op, i) => runnerOf(op, approach, i)), threats: [],
    orders: {}, risk: { level: risk }, vanHold: null, enemyReinforce: def.enemyReinforce, friendlyReinforce: def.friendlyReinforce,
    overwatch: overwatch ? { ...overwatch, vanShots: 0 } : null, wheels, standby: null, standbyOut: false, vanUsed: false,
    heat: 0, pipsLost: 0, left: [], dilemmasFired: {}, watched, site,
  };
  if (standbyOp) b.standby = runnerOf(standbyOp, approach, b.runners.length);
  if (type === 'holdHack') {
    const tech = [...b.runners].sort((x, y) => (y.role === 'tech') - (x.role === 'tech') || sv(y, 'tech') - sv(x, 'tech') || bySeat(x, y))[0];
    b.goal.protect = tech?.id ?? null;
  }
  const kinds = SITE_ENEMIES[site] ?? SITE_ENEMIES.docks;
  const count = COUNT_BY_THREAT[clamp(Math.round(threat), 1, 5)];
  for (let i = 0; i < count; i++) newEnemy(b, kinds[Math.floor(rng() * kinds.length)], rng);
  b.orders = defaultOrders(b);
  return b;
}

// --- orders ----------------------------------------------------------------------------------------

const PRIORITY = ['protected', 'radio', 'low'];
const order = (duty, target = null, fallback = null, priority = PRIORITY) => ({ duty, target, fallback, priority, byStage: null });
const fb = (duty, target = null) => ({ duty, target });
const capableSupport = (r) => r.medic || (r.jammer && sv(r, 'tech') >= sv(r, 'combat'));
const toughest = (b, list) => [...list].sort((x, y) => (y.max + y.absorb) - (x.max + x.absorb) || bySeat(x, y));

/** The runner best placed to cover others (most pips plus armour, ties lowest seat), not the specialist. */
export const bestProtector = (b) => toughest(b, b.runners.filter((r) => r.id !== b.goal.protect))[0] ?? null;

/**
 * The crew's own orders for one runner (spec section 12, settled 2026-11-11), built from the fight as it
 * is. holdHack: the technician works; the two toughest others protect the technician (fallback attack);
 * everyone else supports if a medic or a jammer with tech at least their combat, else attacks (fallback
 * protect the technician). holdExtract: hold stage, the best protector covers the lowest-pips runner
 * (fallback attack) and the rest attack, the lowest-pips runner's attackers first; board stage, the
 * protector covers (fallback board) and the rest board (fallback hold).
 */
export function defaultOrderFor(b, r) {
  if (b.type === 'holdHack') {
    if (r.id === b.goal.protect) return order('push', null, fb('hold'));
    const guards = toughest(b, b.runners.filter((x) => x.id !== b.goal.protect)).slice(0, 2).map((x) => x.id);
    if (guards.includes(r.id)) return order('protect', 'protected', fb('attack'));
    return capableSupport(r) ? order('support', null, fb('protect', 'protected')) : order('attack', null, fb('protect', 'protected'));
  }
  const prot = bestProtector(b)?.id === r.id;
  const o = order('attack', null, fb('hold'), ['low', 'radio']);
  o.byStage = {
    0: prot ? order('protect', null, fb('attack')) : order('attack', null, fb('hold'), ['low', 'radio']),
    1: prot ? order('protect', null, fb('push')) : order('push', null, fb('hold')),
  };
  return o;
}

/** The crew's orders for everyone in the fight now. */
export const defaultOrders = (b) => Object.fromEntries(b.runners.map((r) => [r.id, defaultOrderFor(b, r)]));

/** What a runner is ordered this stage (the order's own stage entry, if it has one). */
export function orderOf(b, r) {
  const o = b.orders[r.id] ?? defaultOrderFor(b, r);
  return o.byStage?.[b.stage] ?? o;
}

// --- the state of a fight --------------------------------------------------------------------------

const present = (r) => !r.down && !r.withdrawn && !r.dead && !r.aboard;
export const standing = (b) => b.runners.filter(present);
export const enemiesUp = (b) => b.enemies.filter((e) => !e.out && !e.fled);
const runner = (b, id) => b.runners.find((r) => r.id === id) ?? null;
const outsideDown = (b) => b.runners.filter((r) => r.down && !r.aboard && !r.dead && !r.withdrawn);
const boardingStage = (b) => b.type === 'holdExtract' && b.stage === 1;
const committed = (b) => b.risk.level === 'committed';
const doorSlots = (b) => FIGHT.doorSlots + (b.standby && !b.standbyOut ? 1 : 0);

/** Pips at or under which this runner pulls out at round start (cautious half rounded up, steady a third rounded up and at least 1, committed never). */
export function riskThreshold(b, r) {
  const level = b.risk.level;
  return level === 'cautious' ? Math.ceil(r.max / 2) : level === 'steady' ? Math.max(FIGHT.risk.steady.minPips, Math.ceil(r.max / FIGHT.risk.steady.pullDiv)) : FIGHT.risk.committed.pullAt;
}
/** A runner the player chose to keep in at their pull-out point stays in until they lose another pip (r.stayPips, set by keepIn). */
const keptIn = (r) => r.stayPips != null && r.pips >= r.stayPips;
/** Is this runner at the point where their risk level pulls them out, and not kept in? */
export const atPullOut = (b, r) => r.pips <= riskThreshold(b, r) && !keptIn(r);
/** The runners standing at their pull-out point (not while the van is there: pulling out then means boarding). */
export const pullOutSubjects = (b) => (boardingStage(b) ? [] : standing(b).filter((r) => atPullOut(b, r)));
/** The player's answer "keep them in": these runners fight on until they lose another pip. */
export function keepIn(b, ids) { for (const r of b.runners) if (ids.includes(r.id)) r.stayPips = r.pips; }

// --- the incoming-shot formula ---------------------------------------------------------------------

/**
 * The chance a shot hits a runner: clamp((11 + aimStep - (cool - base) - cover - hunkerStep) / 20). The
 * one function previews and the round both use (shown = used). open: they are making for the van, in the
 * open this round; hunker also raises cover a step.
 */
export function aimChance(b, r, { hunker = false, open = false } = {}) {
  let cover = open ? 'open' : r.cover;
  if (hunker) cover = better(cover);
  const cool = sv(r, 'cool') - b.diff;
  return clamp((11 + FIGHT.aimStep - cool - FIGHT.cover[cover] - (hunker ? FIGHT.hunkerStep : 0)) / 20, FIGHT.aimFloor, FIGHT.aimCeil);
}

/** A roll's chance, exactly as the round makes it (d20 + value >= 10 + diff). */
export const rollChance = (value, diff) => clamp((11 + value - diff) / 20, 0, 1);

// --- the telegraph ---------------------------------------------------------------------------------

function draw(b, e, rng) {
  for (let tries = 0; tries < 8; tries++) {
    if (e.di >= e.deck.length) { shuffle(e.deck, rng); e.di = 0; }
    const kind = e.deck[e.di++];
    if (kind === 'backup' && (!b.enemyReinforce || b.extras >= FIGHT.maxExtraEnemies)) continue; // nothing left to send
    return kind;
  }
  return 'aim';
}

/**
 * Draw and reveal each enemy's threat for the round, with its target and shown chance. Draws from rng
 * (the one place a round's threats are drawn); the previews and orders then read b.threats.
 */
export function telegraph(b, rng) {
  b.threats = [];
  for (const e of enemiesUp(b)) {
    const kind = draw(b, e, rng);
    let target = null;
    if (THREATS[kind].target === 'runner') {
      const up = standing(b);
      const prot = b.goal.protect && up.find((r) => r.id === b.goal.protect);
      if (!up.length) target = null;
      else if (prot && rng() < FIGHT.protectFocus) target = prot.id;
      else if (rng() < FIGHT.targetFocus) target = lowestPips(up).id;
      else target = up[Math.floor(rng() * up.length)].id;
    }
    if (THREATS[kind].target === 'runner' && !target) continue;
    const t = { id: `${b.round}.${e.n}`, kind, enemy: e.n, target, shieldedBy: null, cancelled: false, shown: null, hit: 0 };
    if (kind === 'aim') { t.shown = aimChance(b, runner(b, target)); t.hit = ENEMY_HIT[e.kind]; }
    b.threats.push(t);
  }
  return b.threats;
}

// --- resolving orders into actions -----------------------------------------------------------------

/** Planned damage that already covers an enemy's pips (and armour) means later attackers skip it. */
function covered(e, res) {
  const plans = res.damage[e.n] ?? [];
  const ap = plans.filter((x) => x).length;
  return ap >= e.pips || plans.length >= e.pips + e.absorb;
}

const shotValue = (t) => (t && t.kind === 'aim' ? t.shown * t.hit : 0);

/** Enemies in the order an attacker takes them: by the priority words in turn, then lowest n. */
function enemyOrder(b, list, priority) {
  const lowest = lowestPips(standing(b));
  const key = (e) => {
    const t = b.threats.find((x) => x.enemy === e.n);
    return priority.map((p) => (p === 'protected' ? (t && b.goal.protect && t.target === b.goal.protect ? 0 : 1)
      : p === 'radio' ? (t && RADIO(t) ? 0 : 1)
        : p === 'low' ? (t && lowest && t.target === lowest.id ? 0 : 1)
          : p === 'exposed' ? -shotValue(t) : 1));
  };
  return [...list].sort((x, y) => {
    const kx = key(x); const ky = key(y);
    for (let i = 0; i < kx.length; i++) if (kx[i] !== ky[i]) return kx[i] - ky[i];
    return x.n - y.n;
  });
}

function tryDuty(b, r, duty, target, priority, res) {
  switch (duty) {
    case 'withdraw': return { kind: 'withdraw' };
    case 'push': {
      if (b.type === 'holdHack') return r.id === b.goal.protect && b.goal.work < FIGHT.workNeeded ? { kind: 'work' } : null;
      if (b.stage !== 1) return null;
      if (res.doors >= doorSlots(b)) return null;
      res.doors += 1;
      // The crew's own call: the boarder with the best cool goes back for a downed teammate.
      const hurt = [...res.carriers].find(([id, by]) => by === r.id && !res.carried.has(id));
      if (hurt) { res.carried.add(hurt[0]); return { kind: 'carry', target: hurt[0] }; }
      return { kind: 'board' };
    }
    case 'attack': {
      const list = enemyOrder(b, enemiesUp(b).filter((e) => !covered(e, res)), priority);
      const e = (typeof target === 'number' && list.find((x) => x.n === target)) || list[0];
      if (!e) return null;
      (res.damage[e.n] ??= []).push(r.ap);
      return { kind: 'attack', enemy: e.n };
    }
    case 'protect': {
      // An order to protect a teammate who is down at the van means carrying them (spec 8).
      const downMate = typeof target === 'string' && target !== 'protected' && outsideDown(b).find((x) => x.id === target);
      if (downMate) {
        if (!boardingStage(b) || res.doors >= doorSlots(b) || res.carried.has(downMate.id)) return null;
        res.doors += 1; res.carried.add(downMate.id); return { kind: 'carry', target: downMate.id };
      }
      const T = target === 'protected' ? b.goal.protect : target ?? (b.goal.protect && b.goal.protect !== r.id ? b.goal.protect : lowestPips(standing(b).filter((x) => x.id !== r.id))?.id);
      if (!T || T === r.id || !standing(b).some((x) => x.id === T)) return null;
      // Shield the worst shot on them (shown chance x pips) that no one has taken yet.
      const shot = b.threats.filter((t) => t.kind === 'aim' && t.target === T && !res.shields.has(t.id)).sort((x, y) => shotValue(y) - shotValue(x) || x.enemy - y.enemy)[0];
      if (shot) { res.shields.add(shot.id); return { kind: 'shield', threat: shot.id, for: T }; }
      const mate = runner(b, T);
      if (r.healer && mate.pips < mate.max && !res.patches.has(T)) { res.patches.add(T); return { kind: 'patch', target: T }; }
      return null;
    }
    case 'support': {
      if (r.healer) {
        const bleeding = b.runners.find((x) => x.down && !x.stable && !x.aboard && !x.dead && !x.withdrawn && !res.patches.has(x.id));
        if (bleeding) { res.patches.add(bleeding.id); return { kind: 'stabilise', target: bleeding.id }; }
        const hurt = standing(b).filter((x) => x.pips < x.max && !res.patches.has(x.id)).sort((x, y) => x.pips / x.max - y.pips / y.max || bySeat(x, y))[0];
        if (hurt) { res.patches.add(hurt.id); return { kind: 'patch', target: hurt.id }; }
      }
      if (r.jammer && !res.jam && b.threats.some(RADIO)) { res.jam = true; return { kind: 'jam' }; }
      const shot = b.threats.filter((t) => t.kind === 'aim' && t.target !== r.id && !res.shields.has(t.id)).sort((x, y) => shotValue(y) - shotValue(x) || x.enemy - y.enemy)[0];
      if (shot) { res.shields.add(shot.id); return { kind: 'shield', threat: shot.id, for: shot.target }; }
      return null;
    }
    case 'hold': {
      if (b.threats.some((t) => t.kind === 'aim' && t.target === r.id && !res.shields.has(t.id))) return { kind: 'hunker' };
      if (r.cover === 'open') return { kind: 'move' };
      return null;
    }
    default: return null;
  }
}

/**
 * Turn the orders into this round's actions, one per standing runner, in the fixed order (spec 13-14).
 * Pure: it reads the fight (threats drawn) and returns { actions, res } without changing it or drawing.
 * Per runner: down or out -> none; the withdraw duty or the risk threshold -> withdraw (with the van
 * there, making for it first); a medic stabilises a bleeding teammate before anything else; then the
 * duty if it is useful, then the fallback, then hunker. res holds the reservations (planned damage,
 * shields, patches, the jam, door slots, carriers): a response one runner committed is not repeated.
 */
export function resolveOrders(b) {
  const res = { damage: {}, shields: new Set(), patches: new Set(), jam: false, doors: 0, carried: new Set(), carriers: new Map() };
  const orders = new Map(standing(b).map((r) => [r.id, orderOf(b, r)]));
  const boarding = boardingStage(b);
  // Who goes back for each downed runner at the van: the boarder with the best cool (ties: lowest seat).
  if (boarding) {
    const boarders = standing(b).filter((r) => orders.get(r.id).duty === 'push').sort((x, y) => sv(y, 'cool') - sv(x, 'cool') || bySeat(x, y));
    for (const d of outsideDown(b)) { const by = boarders.shift(); if (by) res.carriers.set(d.id, by.id); }
  }
  // Protect duties first; while boarding, then boarders (the most hurt get the door slots), then the rest by seat.
  const safety = (r) => atPullOut(b, r);
  const group = (r) => (boarding && safety(r) ? -1 : orders.get(r.id).duty === 'protect' ? 0 : boarding && orders.get(r.id).duty === 'push' ? 1 : 2);
  const queue = [...standing(b)].sort((x, y) => group(x) - group(y) || (group(x) === 1 ? x.pips - y.pips : 0) || bySeat(x, y));
  const actions = [];
  for (const r of queue) {
    const ord = orders.get(r.id);
    let act = null; let from = null;
    if (ord.duty === 'withdraw' || safety(r)) {
      // While the van is there, pulling out means making for it (a door slot first); else on foot.
      act = boarding ? tryDuty(b, r, 'push', null, ord.priority, res) : null;
      if (!act) act = { kind: 'withdraw' };
      from = ord.duty === 'withdraw' ? 'duty' : 'safety';
    }
    // A medic stabilises a bleeding teammate before anything else, whatever their duty.
    if (!act && r.healer) {
      const bleeding = b.runners.find((x) => x.down && !x.stable && !x.aboard && !x.dead && !x.withdrawn && !res.patches.has(x.id));
      if (bleeding) { res.patches.add(bleeding.id); act = { kind: 'stabilise', target: bleeding.id }; from = 'safety'; }
    }
    if (!act) { act = tryDuty(b, r, ord.duty, ord.target, ord.priority, res); from = 'duty'; }
    if (!act && ord.fallback) { act = tryDuty(b, r, ord.fallback.duty, ord.fallback.target, ord.priority, res); from = 'fallback'; }
    if (!act) { act = { kind: 'hunker' }; from = 'last'; }
    actions.push({ r, ...act, from, order: ord });
  }
  return { actions, res };
}

/**
 * What each shot will face, given the actions: a runner making for the van is in the open, one who
 * hunkers is better covered, and a shielded shot is taken by its protector (against their own cover).
 * [{ id, enemy, target, shieldedBy, chance, hit }]. Pure; the round and previewRound both read it.
 */
export function exposures(b, actions) {
  const kindOf = new Map(actions.map((a) => [a.r.id, a.kind]));
  return b.threats.filter((t) => t.kind === 'aim' && !t.cancelled).map((t) => {
    const shield = actions.find((a) => a.kind === 'shield' && a.threat === t.id);
    const v = shield ? shield.r : runner(b, t.target);
    const k = kindOf.get(v?.id);
    const chance = v ? aimChance(b, v, { hunker: !shield && k === 'hunker', open: !shield && (k === 'board' || k === 'carry') }) : 0;
    return { id: t.id, enemy: t.enemy, target: v?.id ?? null, shieldedBy: shield?.r.id ?? null, chance, hit: t.hit };
  });
}

/** The enemy overwatch will fire at: whoever threatens a runner in the open worst (the boarders, carriers, the flanked), else the specialist's attacker, else the lowest n. */
function overwatchTarget(b, actions, res) {
  const kindOf = new Map(actions.map((a) => [a.r.id, a.kind]));
  const up = enemiesUp(b).filter((e) => !covered(e, res));
  const threatOf = (e) => b.threats.find((t) => t.enemy === e.n && t.kind === 'aim');
  const exposed = (e) => {
    const t = threatOf(e); const v = t && runner(b, t.target);
    return t && v && (['board', 'carry'].includes(kindOf.get(v.id)) || v.cover === 'open') ? shotValue(t) : 0;
  };
  const onProt = (e) => { const t = threatOf(e); return t && b.goal.protect && t.target === b.goal.protect ? 1 : 0; };
  return [...up].sort((x, y) => exposed(y) - exposed(x) || onProt(y) - onProt(x) || x.n - y.n)[0] ?? null;
}

/** Whether overwatch may fire this round (a use left; at the van, only overwatchUsesAtVan shots). */
const overwatchReady = (b) => b.overwatch && b.overwatch.left > 0 && (!boardingStage(b) || b.overwatch.vanShots < FIGHT.overwatchUsesAtVan);

// --- the preview -----------------------------------------------------------------------------------

/**
 * What the next round looks like with the orders as they stand, for the plan, the round screen and the
 * call-ins. Never draws and changes nothing: the threats must already be drawn (startRound/telegraph);
 * before that it returns null. Each action names its order (duty, and whether it came from the duty, the
 * fallback, the safety rule or nothing useful). ifNothing is generated, never authored: the shots and calls
 * the orders leave unanswered (an attack on a source is not counted as an answer: it can miss).
 */
export function previewRound(b) {
  if (!b.drawn) return null;
  const { actions, res } = resolveOrders(b);
  const exp = exposures(b, actions);
  const ow = overwatchReady(b) ? overwatchTarget(b, actions, res) : null;
  const shielded = exp.filter((x) => x.shieldedBy).length;
  const openShots = exp.filter((x) => !x.shieldedBy).length;
  const radio = b.threats.filter((t) => RADIO(t) && !t.cancelled).length - (res.jam ? b.threats.filter(RADIO).length : 0);
  const parts = [];
  if (shielded) parts.push({ key: 'ifNothing.shielded', n: shielded });
  if (radio > 0) parts.push({ key: 'ifNothing.radio', n: radio });
  if (openShots) parts.push({ key: 'ifNothing.shots', n: openShots });
  if (!parts.length) parts.push({ key: 'ifNothing.clear', n: 0 });
  return {
    round: b.round, stage: b.stage,
    threats: b.threats.map((t) => ({ ...t, chance: exp.find((x) => x.id === t.id)?.chance ?? t.shown })),
    exposure: exp,
    actions: actions.map((a) => ({ who: a.r.id, kind: a.kind, target: a.target ?? a.for ?? a.enemy ?? null, from: a.from, duty: a.order.duty, fallback: a.order.fallback?.duty ?? null })),
    overwatch: ow ? { enemy: ow.n } : null,
    ifNothing: parts.map((p) => ({ ...p, text: lineText(p.key, { n: p.n }) })),
    thresholds: Object.fromEntries(b.runners.map((r) => [r.id, riskThreshold(b, r)])),
    doors: { used: res.doors, slots: doorSlots(b) },
  };
}

// --- dilemmas --------------------------------------------------------------------------------------

function holds(b, cond) {
  const prot = b.goal.protect ? runner(b, b.goal.protect) : null;
  for (const [k, v] of Object.entries(cond)) {
    if (k === 'of') continue;
    if (k === 'any') { if (!v.some((c) => holds(b, { of: cond.of, ...c }))) return false; continue; }
    if (k === 'stage') { if (b.stage !== v) return false; continue; }
    if (k === 'vanLastRound') { if ((b.round === b.goal.vanLeaves && boardingStage(b) && !b.vanHeld) !== v) return false; continue; }
    if (k === 'outsideAtLeast') { if (standing(b).length + outsideDown(b).length < v) return false; continue; }
    if (k === 'atPullOut') { if ((pullOutSubjects(b).length > 0) !== v) return false; continue; }
    if (k === 'radioShown') { if (b.threats.some((t) => RADIO(t) && !t.cancelled) !== v) return false; continue; }
    if (k === 'protectedCanJam') { if (!!(prot && present(prot) && prot.jammer) !== v) return false; continue; }
    if (!prot || !present(prot)) return false; // the rest are about the specialist
    if (k === 'pipsAtMost' && !(prot.pips <= v)) return false;
    if (k === 'pipsAtMostShare' && !(prot.pips <= prot.max * v)) return false;
    if (k === 'shotsOnAtLeast' && !(b.threats.filter((t) => t.kind === 'aim' && t.target === prot.id).length >= v)) return false;
  }
  return true;
}

/** Whether one authored dilemma's conditions hold right now (for revalidating an answer, and clearing a fired key once the situation has passed). Never draws. */
export const dilemmaHolds = (b, id) => !!b.drawn && !b.end && !!DILEMMAS[id] && DILEMMAS[id].fight.includes(b.type) && holds(b, DILEMMAS[id].when);

/**
 * The authored dilemmas that hold right now, in the order they are written: [{ id, key, subjects }].
 * Checks never draw. A dilemma fires at most once per unresolved situation: its key (id + subjects) is
 * in dilemmasFired once the run has raised it (core/runfight.js); the run clears it when the situation clears.
 */
export function dueDilemmas(b) {
  if (!b.drawn || b.end) return [];
  const out = [];
  for (const [id, d] of Object.entries(DILEMMAS)) {
    if (!d.fight.includes(b.type) || !holds(b, d.when)) continue;
    const subjects = id === 'vanCantWait' ? [...standing(b), ...outsideDown(b)].map((r) => r.id).sort() : id === 'pullOutPoint' ? pullOutSubjects(b).map((r) => r.id).sort() : [b.goal.protect];
    // The pull-out call comes up again each time someone at their point loses another pip, so its key carries their pips.
    const key = `${id}:${subjects.join(',')}${id === 'pullOutPoint' ? `:${subjects.map((s) => runner(b, s).pips).join(',')}` : ''}`;
    if (!b.dilemmasFired[key]) out.push({ id, key, subjects });
  }
  return out;
}

/** Is this dilemma option offered right now? An option with `requires` needs those conditions to hold. Never draws. */
export const optionAvailable = (b, opt) => !opt?.requires || holds(b, { of: 'protected', ...opt.requires });

/** The enemy a radio call comes from: the lowest-numbered backup, else alarm. */
const backupSource = (b) => (b.threats.filter((t) => t.kind === 'backup' && !t.cancelled)[0] ?? b.threats.filter((t) => t.kind === 'alarm' && !t.cancelled)[0])?.enemy ?? null;

/**
 * Apply a dilemma option's ordersPatch to the orders (selectors: all, others, protected, exposed, bestAttacker, bestProtector, backupSource).
 * Returns the ids changed. The change lasts one resolved round: the orders it replaces are kept in b.override and
 * playRound puts them back at the round's end (expireOverride), unless the player has since set that runner's order.
 */
export function applyPatch(b, patch) {
  if (!patch) return [];
  const prot = b.goal.protect ? runner(b, b.goal.protect) : null;
  const up = standing(b);
  const notProt = up.filter((r) => r.id !== prot?.id);
  const exp = b.drawn ? exposures(b, resolveOrders(b).actions).sort((x, y) => y.chance * y.hit - x.chance * x.hit || x.enemy - y.enemy) : [];
  const pick = {
    all: () => notProt,
    protected: () => (prot && present(prot) ? [prot] : []),
    exposed: () => { const v = exp[0] && runner(b, exp[0].target); return v ? [v] : []; },
    bestAttacker: () => [[...notProt].sort((x, y) => sv(y, 'combat') - sv(x, 'combat') || bySeat(x, y))[0]].filter(Boolean),
    bestProtector: () => [toughest(b, notProt)[0]].filter(Boolean),
  };
  const chosen = new Set();
  const changed = [];
  const apply = (r, p) => {
    const target = p.target === 'backupSource' ? backupSource(b) : p.target === 'exposed' ? exp[0]?.target ?? null : p.target;
    const old = orderOf(b, r);
    b.override ??= { prev: {} };
    if (!(r.id in b.override.prev)) b.override.prev[r.id] = structuredClone(b.orders[r.id] ?? null); // the raw order (null: the crew's default)
    const next = { ...old, duty: p.duty, target, byStage: null };
    if (b.orders[r.id]?.byStage) b.orders[r.id] = { ...b.orders[r.id], byStage: { ...b.orders[r.id].byStage, [b.stage]: next } };
    else b.orders[r.id] = next;
    changed.push(r.id); chosen.add(r.id);
  };
  for (const [sel, p] of Object.entries(patch)) if (sel !== 'others') for (const r of (pick[sel]?.() ?? [])) apply(r, p);
  if (patch.others) for (const r of notProt.filter((x) => !chosen.has(x.id))) apply(r, patch.others);
  return changed;
}

/** Set the crew-wide risk level and the orders of one runner by hand (Take Command; orders are validated by the screen). */
export function setRisk(b, level) { b.risk = { level }; }
export function setOrder(b, id, ord) {
  b.orders[id] = { priority: PRIORITY, fallback: null, byStage: null, ...ord };
  if (b.override) delete b.override.prev[id]; // an order the player sets stands: the call-in's change no longer undoes it
}

/**
 * The order a runner would have if the player changed their duty and target now, for setOrder: it edits the order for
 * the stage the fight is in and keeps everything else (the crew's stage plan, priority, fallback), so changing a
 * holdExtract runner's duty in the holding stage does not lose the switch to boarding. Pure; changes nothing.
 */
export function editOrder(b, id, { duty, target = null }) {
  const r = runner(b, id);
  const cur = b.orders[id] ?? defaultOrderFor(b, r);
  const here = orderOf(b, r);
  const next = { ...here, duty, target, byStage: null, fallback: duty === here.duty ? here.fallback : null }; // a new duty drops the old duty's fallback
  return cur.byStage ? { ...cur, byStage: { ...cur.byStage, [b.stage]: next } } : next;
}

/** A call-in's order change is over once its round is resolved: put back the orders it replaced (nothing to restore in a fight that has ended). */
function expireOverride(b) {
  if (!b.override) return;
  if (!b.end) for (const [id, was] of Object.entries(b.override.prev)) { if (was) b.orders[id] = was; else delete b.orders[id]; }
  delete b.override;
}

// --- one round -------------------------------------------------------------------------------------

/**
 * Begin the next round: arrivals, the standby going out, someone climbing back out of the van, the van
 * special, then the telegraph (draws from rng). After this the previews and the call-in checks work.
 * Returns the round's start lines. playRound calls it for you if it has not been called.
 */
export function startRound(b, rng) {
  const lines = [];
  const say = (kind, key, slots = {}, extra = {}) => lines.push({ kind, key, ...extra, text: lineText(key, slots) });
  b.round += 1;
  for (const r of b.runners) if (r.stayPips != null && r.pips > riskThreshold(b, r)) r.stayPips = null; // healed past their point: asked afresh next time
  for (const kind of b.arriving.splice(0)) { const e = newEnemy(b, kind, rng); say('arrive', 'arrive', { kind: kindWord(e.kind), n: e.n }); }
  if (b.type === 'holdExtract' && b.round >= b.nextPressure && b.extras < FIGHT.maxExtraEnemies) {
    b.extras += 1; b.nextPressure += CLOCKS.pressure.every;
    const e = newEnemy(b, SITE_ENEMIES[b.site]?.[0] ?? 'hired', rng);
    say('arrive', 'pressure', { kind: kindWord(e.kind), n: e.n });
  }
  if (b.standby && !b.standbyOut && boardingStage(b) && outsideDown(b).length) {
    b.standbyOut = true; b.runners.push(b.standby);
    say('standby', 'standbyOut', { who: b.standby.handle });
  }
  // Nobody is left outside to carry a downed runner: the best-cool runner in the van climbs back out
  // (spec 8: someone goes back for them). Only while the van is still there.
  if (boardingStage(b) && !standing(b).length && b.round <= b.goal.vanLeaves) {
    const inVan = b.runners.filter((r) => r.aboard && !r.down && !r.dead).sort((x, y) => sv(y, 'cool') - sv(x, 'cool') || bySeat(x, y));
    for (const d of outsideDown(b)) { const back = inVan.shift(); if (back) { back.aboard = false; say('climb', 'climbBack', { who: back.handle, target: d.handle }); } }
  }
  for (const r of b.runners) { r.hunker = false; r.boarding = false; }
  telegraph(b, rng);
  b.drawn = true;
  // The van special: the driver brings the van a round early when someone is nearly down or two or more of them are up. +1 heat.
  if (b.type === 'holdExtract' && b.stage === 0 && b.wheels && !b.vanUsed && (standing(b).some((r) => r.pips <= 1) || (b.round >= 2 && enemiesUp(b).length >= 2))) {
    b.vanUsed = true; b.heat += FIGHT.vanEarlyHeat; b.goal.vanRound = Math.max(b.round, b.goal.vanRound - 1);
    say('special', 'vanEarly', { round: b.goal.vanRound }, { heat: FIGHT.vanEarlyHeat });
  }
  return lines;
}

/** The van's last round with someone outside: held two more rounds for +1 heat if the answer (or the hands-off rule) says so. Mutates b; returns a line or null. */
function vanDecision(b) {
  if (!(boardingStage(b) && b.round === b.goal.vanLeaves && (standing(b).length || outsideDown(b).length))) return null;
  const outside = standing(b).length + outsideDown(b).length;
  // Hands-off the risk level answers: cautious and steady hold the van for a downed teammate; committed lets it go on time.
  const auto = !committed(b) && outsideDown(b).length > 0;
  const hold = b.vanHold ?? auto;
  if (hold && !b.vanHeld) {
    b.vanHeld = true; b.goal.vanLeaves += FIGHT.holdRounds; b.heat += FIGHT.holdHeat;
    return { kind: 'van', key: 'vanHeld', heat: FIGHT.holdHeat, text: lineText('vanHeld', { rounds: FIGHT.holdRounds, outside }) };
  }
  return { kind: 'van', key: 'vanCantWait', text: lineText('vanCantWait', { outside }) };
}

/**
 * Play one round, mutating the fight: arrivals and the telegraph (unless startRound has already run),
 * then the van's decision, overwatch, every runner's action in the fixed order, the threats, breaking,
 * the medic's aura, bleeding, objective progress, clocks, and the end checks (b.end is set when the fight
 * is over). Everything draws from rng. Returns the round result (spec 19):
 * { lines, actions, unanswered, defeated, goalDelta, down, fled, withdrawn, heat, neural, ended }. Each action
 * line names its order.
 */
export function playRound(b, rng) {
  const lines = [];
  const defeated = []; const down = []; const fled = []; const withdrawn = [];
  const result = { lines, actions: [], unanswered: [], defeated, goalDelta: 0, down, fled, withdrawn, heat: 0, neural: 0, ended: null };
  if (!b.drawn) lines.push(...startRound(b, rng));
  const say = (kind, key, slots = {}, extra = {}) => { const l = { kind, key, ...extra, text: lineText(key, slots) }; lines.push(l); return l; };
  const E = (n) => enemyName(b.enemies.find((x) => x.n === n).kind, n);

  const vl = vanDecision(b);
  if (vl) lines.push(vl);

  const { actions, res } = resolveOrders(b);
  result.actions = actions.map((a) => ({ opId: a.r.id, action: a.kind, target: a.target ?? a.for ?? a.enemy ?? null, from: a.from }));
  // The round's stances: who runs for the van, who hunkers, who pulls out.
  for (const a of actions) {
    if (a.kind === 'board' || a.kind === 'carry') a.r.boarding = true;
    if (a.kind === 'hunker') a.r.hunker = true;
    if (a.kind === 'move') a.r.cover = 'half';
    if (a.kind === 'withdraw') { a.r.leaving = true; a.r.ordered = a.from === 'duty'; a.r.leaveAt = { pips: a.r.pips, at: riskThreshold(b, a.r) }; } // a hand-ordered withdrawal can cost a life
  }
  // What was shown is what is rolled: refresh each shot's shown chance with the round's stances (previewRound reads the same).
  for (const x of exposures(b, actions)) { const t = b.threats.find((y) => y.id === x.id); if (t) t.shown = x.chance; }

  const roll = (value, diff, margin = 99, stat = null) => { const die = d20(rng); const need = 10 + diff; return { die, need, value, stat, ok: die + value >= need, strong: die + value >= need + margin }; };
  const rollOf = (r) => ({ die: r.die, need: r.need, value: r.value, stat: r.stat, success: r.ok }); // the stat is what the roll is made on, for the dice detail

  // Overwatch: one attack a round (at the van, overwatchUsesAtVan), before the crew.
  if (overwatchReady(b)) {
    const e = overwatchTarget(b, actions, res);
    if (e) {
      const ow = b.overwatch;
      ow.left -= 1; if (boardingStage(b)) ow.vanShots += 1;
      b.heat += ow.heat ?? 0; result.neural += ow.neural ?? 0;
      const x = roll(ow.value, b.diff + FIGHT.attackStep + FIGHT.overwatchStep + FIGHT.cover[e.cover], strongMargin(ow.damage), ow.stat ?? null);
      if (!x.ok) say('overwatch', 'overwatchMiss', { who: ow.handle, enemy: E(e.n) }, { actor: ow.id, enemy: e.n, kit: ow.kit, success: false, damage: 0, roll: rollOf(x) });
      else {
        let dmg = x.strong ? FIGHT.strongHit : FIGHT.hit;
        if (e.absorb > 0) { e.absorb -= 1; dmg -= 1; }
        e.pips -= dmg;
        if (e.pips <= 0) { e.out = true; defeated.push({ by: ow.id, enemy: e.n, how: 'overwatch' }); say('overwatch', 'overwatchOut', { who: ow.handle, enemy: E(e.n) }, { actor: ow.id, enemy: e.n, kit: ow.kit, success: true, damage: dmg, dropped: true, roll: rollOf(x) }); }
        else say('overwatch', 'overwatchHit', { who: ow.handle, enemy: E(e.n) }, { actor: ow.id, enemy: e.n, kit: ow.kit, success: true, damage: dmg, roll: rollOf(x), left: e.pips });
      }
    }
  }

  const boards = []; const carries = []; let workBy = null;
  for (const a of actions) {
    const r = a.r; const named = { actor: r.id, order: a.order.duty, from: a.from };
    switch (a.kind) {
      case 'attack': {
        const e = b.enemies.find((x) => x.n === a.enemy);
        if (e.out || e.fled) { say('attack', 'attackGone', { who: r.handle }, { ...named, enemy: e.n, success: false, damage: 0 }); break; }
        const x = roll(sv(r, 'combat'), b.diff + FIGHT.attackStep + FIGHT.cover[e.cover], r.strong, 'combat');
        if (!x.ok) { say('attack', 'attackMiss', { who: r.handle, enemy: E(e.n) }, { ...named, enemy: e.n, success: false, damage: 0, roll: rollOf(x) }); break; }
        let dmg = x.strong ? FIGHT.strongHit : FIGHT.hit;
        if (e.absorb > 0 && !r.ap) { e.absorb -= 1; dmg -= 1; }
        e.pips -= dmg;
        if (e.pips <= 0) { e.out = true; defeated.push({ by: r.id, enemy: e.n, how: 'attack' }); say('attack', 'attackOut', { who: r.handle, enemy: E(e.n) }, { ...named, enemy: e.n, success: true, damage: dmg, dropped: true, roll: rollOf(x), strong: x.strong }); }
        else say('attack', 'attackHit', { who: r.handle, enemy: E(e.n) }, { ...named, enemy: e.n, success: true, damage: dmg, roll: rollOf(x), left: e.pips });
        break;
      }
      case 'jam': {
        const x = roll(sv(r, 'tech'), b.diff + FIGHT.jamStep, 99, 'tech');
        if (!x.ok) { say('jam', 'jamFail', { who: r.handle }, { ...named, roll: rollOf(x) }); break; }
        for (const t of b.threats) if (RADIO(t)) t.cancelled = true;
        const drone = enemiesUp(b).find((e) => ENEMIES[e.kind].jamTakesOut);
        if (drone) { drone.out = true; defeated.push({ by: r.id, enemy: drone.n, how: 'jam' }); }
        say('jam', 'jamOk', { who: r.handle }, { ...named, roll: rollOf(x), droppedEnemy: drone?.n ?? null });
        break;
      }
      case 'stabilise': {
        const x = roll(sv(r, 'medical'), b.diff + FIGHT.stabiliseStep, 99, 'medical'); const t = runner(b, a.target);
        if (x.ok && t.down && !t.dead) { t.stable = true; say('stabilise', 'stabilise', { who: r.handle, target: t.handle }, { ...named, roll: rollOf(x), target: t.id, targetId: t.id, success: true }); }
        else say('stabilise', 'stabiliseFail', { who: r.handle, target: t.handle }, { ...named, roll: rollOf(x), target: t.id, targetId: t.id, success: false });
        break;
      }
      case 'patch': {
        const x = roll(sv(r, 'medical'), b.diff + FIGHT.patchStep, 99, 'medical'); const t = runner(b, a.target);
        if (x.ok && !t.down) { t.pips = Math.min(t.max, t.pips + FIGHT.patchHeal); say('patch', 'patch', { who: r.handle, target: t.handle }, { ...named, roll: rollOf(x), target: t.id, targetId: t.id, success: true, heal: FIGHT.patchHeal }); }
        else say('patch', 'patchFail', { who: r.handle, target: t.handle }, { ...named, roll: rollOf(x), target: t.id, targetId: t.id, success: false });
        break;
      }
      case 'board': {
        const x = roll(sv(r, 'cool'), b.diff + FIGHT.boardStep, 99, 'cool');
        if (x.ok) boards.push(r);
        say('board', x.ok ? 'board' : 'boardFail', { who: r.handle }, { ...named, roll: rollOf(x) });
        break;
      }
      case 'carry': {
        const x = roll(sv(r, 'cool'), b.diff + FIGHT.boardStep + FIGHT.carryStep, 99, 'cool'); const t = runner(b, a.target);
        if (x.ok) { boards.push(r); carries.push({ by: r, t }); }
        say('carry', x.ok ? 'carry' : 'carryFail', { who: r.handle, target: t.handle }, { ...named, roll: rollOf(x), target: t.id });
        break;
      }
      case 'work': workBy = r; break;
      case 'shield': { const t = b.threats.find((y) => y.id === a.threat); t.target = r.id; t.shieldedBy = r.id; break; }
      default: break; // hunker, move and withdraw were set above
    }
  }

  // The threats resolve, against everyone's cover and armour as they now stand.
  let alarms = 0;
  for (const t of b.threats) {
    const e = b.enemies.find((x) => x.n === t.enemy);
    if (e.out || e.fled || t.cancelled) continue;
    if (t.kind === 'aim') {
      const v = runner(b, t.target);
      if (!v || v.down || v.dead || v.withdrawn || v.aboard) continue;
      const c = aimChance(b, v, { hunker: v.hunker, open: v.boarding });
      const hit = rng() < c;
      const slots = { enemy: E(e.n), who: v.handle };
      const named = { actor: null, target: v.id, enemy: e.n, chance: c, shieldedBy: t.shieldedBy };
      if (!hit) { say('shot', 'shotMiss', slots, { ...named, targetId: v.id, success: false, damage: 0 }); continue; }
      if (v.absorb > 0) { v.absorb -= 1; say('shot', 'shotAbsorbed', slots, { ...named, targetId: v.id, success: false, damage: 0 }); continue; }
      const dmg = Math.min(v.pips, t.hit); v.pips -= dmg; b.pipsLost += dmg;
      if (v.pips <= 0) {
        // A runner pulling out alone dies only when the player ordered that withdrawal by hand; otherwise death's door like anyone else.
        if (v.leaving && v.ordered) { v.dead = true; down.push(v.id); say('shot', 'shotDead', slots, { ...named, targetId: v.id, success: true, damage: dmg, dead: true }); }
        else { v.down = true; v.downRound = b.round; down.push(v.id); say('shot', 'shotDown', slots, { ...named, targetId: v.id, success: true, damage: dmg, down: true }); }
      } else say('shot', 'shotHit', slots, { ...named, targetId: v.id, success: true, damage: dmg, left: v.pips });
    } else if (t.kind === 'flank') {
      const v = runner(b, t.target);
      if (v && present(v)) { v.cover = 'open'; say('shot', 'flanked', { enemy: E(e.n), who: v.handle }, { target: v.id, enemy: e.n }); }
    } else if (t.kind === 'backup') {
      if (b.extras < FIGHT.maxExtraEnemies) { b.extras += 1; b.arriving.push(e.kind); say('radio', 'backupCalled', { enemy: E(e.n) }, { enemy: e.n }); }
    } else if (t.kind === 'alarm') alarms += 1;
  }
  for (const r of b.runners) if (r.leaving && !r.dead && !r.down) { r.withdrawn = true; withdrawn.push(r.id); say('withdraw', r.ordered ? 'withdrewOrdered' : 'withdrew', { who: r.handle, pips: pipsWord(r.leaveAt?.pips ?? r.pips), at: pipsWord(r.leaveAt?.at ?? 0), level: b.risk.level }, { actor: r.id }); }
  for (const r of b.runners) { r.leaving = false; r.ordered = false; }
  // The hired break and run when too few are left (side-wide).
  const hiredUp = enemiesUp(b).filter((e) => e.kind === 'hired');
  if (hiredUp.length && hiredUp.length / b.hiredTotal < ENEMIES.hired.fleeBelow) { for (const e of hiredUp) { e.fled = true; fled.push(e.n); } say('flee', 'enemyFled'); }

  // The medic's aura: while a medic stands in the fight, the most hurt standing runner regains a pip a
  // round and downed teammates don't bleed. Always on, whatever the medic does; no action.
  const aura = b.runners.some((r) => r.medic && present(r));
  if (aura) {
    const hurt = standing(b).filter((r) => r.pips < r.max).sort((x, y) => x.pips / x.max - y.pips / y.max || bySeat(x, y))[0];
    const medic = b.runners.find((r) => r.medic && present(r));
    if (hurt) { hurt.pips += FIGHT.medicAura.heal; say('aura', 'aura', { who: medic.handle, target: hurt.handle }, { actor: medic.id, target: hurt.id }); }
  }
  // Bleeding out: only on committed (or a runner pushed on by hand); from the second round after going down.
  if (!aura) {
    for (const r of b.runners) {
      if (!r.down || r.stable || r.aboard || r.dead || r.withdrawn || b.round - r.downRound < FIGHT.bleedGrace) continue;
      if (!(committed(b) || r.fightOn)) continue;
      if (rng() < FIGHT.bleedChance) { r.dead = true; say('death', 'bleedOut', { who: r.handle }, { target: r.id, dead: true }); }
    }
  }

  // Progress, then the van, then the clocks.
  if (workBy && present(workBy)) { b.goal.work += 1; result.goalDelta = 1; }
  for (const r of boards) if (!r.down && !r.dead) { r.aboard = true; say('van', 'inVan', { who: r.handle }, { actor: r.id }); result.goalDelta += 1; }
  for (const c of carries) if (c.by.aboard) { c.t.aboard = true; say('van', 'carriedInVan', { target: c.t.handle }, { target: c.t.id }); }
  if (b.type === 'holdHack') {
    b.clock -= CLOCKS.alarm.tickPerRound + alarms;
    if (b.clock <= 0) { if (b.extras < FIGHT.maxExtraEnemies) { b.extras += 1; b.arriving.push(SITE_ENEMIES[b.site]?.[0] ?? 'hired'); say('clock', 'alarmClock'); } b.clock = CLOCKS.alarm.resetTo; }
  } else {
    b.nextPressure -= alarms * CLOCKS.pressure.alarmBringsForward;
    if (b.stage === 0 && b.round >= b.goal.vanRound) { b.stage = 1; b.goal.vanLeaves = b.round + FIGHT.vanWait; say('van', 'vanIn', { leaves: b.goal.vanLeaves }); }
  }

  // Unanswered threats (for the report): shots not shielded, radio calls not jammed.
  result.unanswered = b.threats.filter((t) => !t.cancelled && !t.shieldedBy && (t.kind === 'aim' || RADIO(t))).map((t) => ({ threat: t.id, target: t.target }));
  b.drawn = false;
  checkEnd(b, rng, say);
  expireOverride(b);
  result.ended = b.end;
  // The heat since the last round was reported, including the early van, which startRound adds before playRound (core/runfight.js calls it first).
  result.heat = b.heat - (b.heatReported ?? 0);
  b.heatReported = b.heat;
  return result;
}

// --- the end ---------------------------------------------------------------------------------------

function finish(b, result, key, slots = {}) { b.end = { result, key, text: lineText(key, slots), slots }; return b.end; }

/** The end checks of a round (spec 15), in the sim's order; sets b.end. Draws only for a runner left behind down on committed. */
function checkEnd(b, rng, say) {
  const prot = b.goal.protect ? runner(b, b.goal.protect) : null;
  if (b.type === 'holdHack' && b.goal.work >= FIGHT.workNeeded) return finish(b, 'won', 'end.won');
  if (boardingStage(b) && !standing(b).length && !outsideDown(b).length) {
    const lost = b.runners.filter((r) => r.dead || r.withdrawn);
    return lost.length ? finish(b, 'lostRunner', 'end.lostRunner', { who: nameList(lost.map((r) => r.handle)) }) : finish(b, 'won', 'end.won');
  }
  if (prot && (prot.down || prot.dead)) return finish(b, 'lost', 'end.lost', { who: prot.handle });
  if (prot && prot.withdrawn) return finish(b, 'abandoned', 'end.abandoned', { who: prot.handle });
  const outside = outsideDown(b);
  // Someone down whom nobody has chosen to fight on for pulls the crew back (a watched crew is asked first, runfight.js); a runner already pushed on for does not.
  if (!boardingStage(b) && !committed(b) && b.runners.some((r) => r.down && !r.dead && !r.fightOn)) return finish(b, 'extracted', 'end.extracted');
  const leave = (who) => {
    // Left behind: standing or down, they are missing (spec 8). On committed a runner left down may not make it.
    for (const r of who) { r.left = true; b.left.push(r.id); }
    if (committed(b)) for (const r of who) if (r.down && !r.dead && rng() < FIGHT.leftDownDeath) { r.dead = true; say('death', 'leftDead', { who: r.handle }, { target: r.id, dead: true }); }
    return finish(b, 'leftBehind', 'end.leftBehind', { who: nameList(who.map((r) => r.handle)) });
  };
  // Nobody standing outside with someone down, and nobody in the van able to climb back out: they are left.
  if (boardingStage(b) && !standing(b).length && outside.length && !b.runners.some((r) => r.aboard && !r.down && !r.dead)) return leave(outside);
  const someoneCanGoBack = boardingStage(b) && outside.length && b.runners.some((r) => r.aboard && !r.down && !r.dead);
  if (!standing(b).length && !someoneCanGoBack) return finish(b, 'gone', 'end.gone');
  if (boardingStage(b) && b.round >= b.goal.vanLeaves) return leave([...standing(b), ...outside]);
  if (b.deadline && b.round >= b.deadline && b.type === 'holdHack') return finish(b, 'deadline', 'end.deadline');
  return null;
}

/** Pulling back by hand, at any decision point: the crew leaves the objective (spec 2). Parting shots are the run's side. */
export function pullBack(b) {
  if (!b.end) finish(b, 'pulledBack', 'end.pulledBack');
  return b.end;
}

/** The injury pips left mean (none, light, serious) for someone still standing: light below half, serious below a quarter. */
export function injuryFromPips(r) {
  const share = r.pips / r.max;
  return share < FIGHT.seriousBelow ? 'serious' : share < FIGHT.lightBelow ? 'light' : 'none';
}

/**
 * What the fight did to each runner, for the run to write back: { id, pips, max, injury, dead, missing,
 * down }. A downed runner is critical (death's door, as in engine 1); a runner left behind is missing
 * (slice 4 builds the 7 days); a dead runner stays dead. Reads the fight; changes nothing.
 */
export function outcomeOf(b) {
  return b.runners.map((r) => ({
    id: r.id, pips: r.pips, max: r.max, dead: r.dead, missing: r.left && !r.dead, down: r.down && !r.dead,
    injury: r.dead ? 'dead' : r.down ? 'critical' : injuryFromPips(r),
  }));
}

// --- hands-off play and the planning read -----------------------------------------------------------

/**
 * The planning read's odds for a fight not yet built (the run draws the enemies' line-up and decks when it starts): the
 * same read averaged over several line-ups on fixed seeds, `builds` of them with `runs` fights each (buildFight's own
 * arguments). { win, down, dead, left }. Hands-off on the orders given (the crew's defaults), at the risk level given.
 */
export function fightOddsFor(args, { builds = 6, runs = 20 } = {}) {
  const acc = { win: 0, down: 0, dead: 0, left: 0, lost: 0 };
  if (!args.crew.length) return { win: 0, down: 1, dead: 0, left: 0, lost: 0 };
  for (let i = 0; i < builds; i++) {
    const r = fightOdds(buildFight(args, makeRng(0xf1647 + i * 104729)), runs);
    for (const k of Object.keys(acc)) acc[k] += r[k] / builds;
  }
  return acc;
}

/** Play a whole fight on its orders, round by round, until it ends (hands-off: the risk level answers the van). */
export function playFight(b, rng, maxRounds = 30) {
  while (!b.end && b.round < maxRounds) playRound(b, rng);
  if (!b.end) finish(b, 'deadline', 'end.deadline');
  return b;
}

/**
 * The van call-in's read (leave on time or hold): how often someone who is outside now ends up left behind, each way, played
 * with the same round function on fixed seeds from the fight as it stands (orders, risk and the drawn threats as they are).
 * { outside: [ids], leaveOnTime, hold } as shares. Not cached (the fight's state changes round to round); never touches the run's stream.
 */
export function vanOdds(b0, runs = FIGHT.oddsRuns) {
  const outside = [...standing(b0), ...outsideDown(b0)].map((r) => r.id);
  const read = (hold) => {
    let left = 0;
    for (let i = 0; i < runs; i++) {
      const b = structuredClone(b0);
      b.vanHold = hold;
      playFight(b, makeRng(0x7a11 + i * 7919));
      if (outside.some((id) => b.left.includes(id))) left += 1;
    }
    return left / runs;
  };
  return { outside, leaveOnTime: read(false), hold: read(true) };
}

const oddsCache = new Map();

/**
 * How a fight goes on its orders with this team, played FIGHT.oddsRuns times with the same round function on
 * fixed seeds: { win, down, dead, left } as shares (down: someone hit 0 pips; dead: someone died; left:
 * someone was left behind). The planning read shows these; shown = used.
 */
export function fightOdds(b0, runs = FIGHT.oddsRuns) {
  if (!b0.runners.length) return { win: 0, down: 1, dead: 0, left: 0, lost: 0 };
  const key = JSON.stringify([b0.type, b0.diff, b0.risk, b0.goal, b0.enemies.map((e) => [e.kind, e.pips, e.cover, e.deck]), b0.runners.map((r) => [r.id, r.pips, r.max, r.absorb, r.ap, r.strong, r.jammer, r.healer, Object.values(r.stats).map((s) => s.value)]), b0.orders, b0.overwatch && [b0.overwatch.value, b0.overwatch.damage, b0.overwatch.left], !!b0.wheels, !!b0.standby, runs]);
  if (oddsCache.has(key)) return oddsCache.get(key);
  const n = { win: 0, down: 0, dead: 0, left: 0, lost: 0 };
  for (let i = 0; i < runs; i++) {
    const b = structuredClone(b0);
    playFight(b, makeRng(0x5eed + i * 7919));
    if (b.end.result === 'won') n.win += 1;
    if (b.runners.some((r) => r.down || r.dead)) n.down += 1;
    if (b.runners.some((r) => r.dead)) n.dead += 1;
    if (b.left.length) n.left += 1;
    if (b.runners.some((r) => r.dead) || b.left.length) n.lost += 1; // someone died or was left behind (the plan's "chance of losing someone")
  }
  const out = { win: n.win / runs, down: n.down / runs, dead: n.dead / runs, left: n.left / runs, lost: n.lost / runs };
  if (oddsCache.size > 2000) oddsCache.clear();
  oddsCache.set(key, out);
  return out;
}
