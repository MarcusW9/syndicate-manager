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
//     maxExtra (the reactive reinforcements' cap), recipe: { waves: [{ round, kind?, count }] }|null (waves still to come),
//     hiredTotal: { [group]: n } (bodies that can break, per group), nextGroup,
//     enemies: [{ n, kind, hp, max, absorb, cover, out, fled, deck, di, approaching, group, infected: { tick, left|null, by, round, payload }|null }],
//     runners: [{ id, handle, role, seat, hp, max, absorb (plates: fights saved before v80 only), soak (HP off every enemy shot), ap, strong, jammer, healer, medic, cover,
//                 down, withdrawn, dead, aboard, stable, fightOn, downRound, left, stats, build: { move, payload }|null, moved }],
//     threats: [{ id, kind, enemy, target, shown, hit, shieldedBy, cancelled }]  (this round's draw),
//     orders: { [opId]: ORDER }, risk: { level }, vanHold: bool|null,
//     overwatch, wheels, standby, standbyOut, heat, dilemmasFired }
// ORDER { duty, target, priority, fallback: { duty, target }|null, byStage: { [stage]: ORDER }|null }.
// Ids: a runner's id is a string (the operative's), an enemy's n a number. "Lowest id" in a tie is the
// lowest seat (crew order).

import { FIGHT, ENEMIES, ENEMY_HIT, SITE_ENEMIES, COUNT_BY_THREAT, TOUGHNESS_BY_THREAT, TOUGHNESS, OPPOSITION, CLOCKS, FIGHTS, THREATS, FIGHT_RECIPES } from '../data/fights.js';
import { MOVES, PAYLOADS } from '../data/builds.js';
import { GEAR } from '../data/gear.js';
import { buildOf, immuneTo } from './builds.js';
import { DILEMMAS } from '../data/dilemmas.js';
import { lineText, kindWord as kindWordOf, enemyName, nameList } from './fighttext.js';
import { effectiveStat } from './crew.js';
import { weaponOf, armourOf } from './battle.js';
import { patchBonus, counted } from './gear.js';
import { specialLook, layoutFight, enemyUnit } from './fightmap.js';
import { d20, makeRng, hash } from './rng.js';
import { copier } from './copy.js';

export { FIGHT };

const FIGHT_STATS = ['combat', 'cool', 'medical', 'tech'];
const COVERS = ['open', 'half', 'full'];
const better = (c) => COVERS[Math.min(2, COVERS.indexOf(c) + 1)];
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
const RADIO = (t) => THREATS[t.kind]?.radio === true;

// --- the runners -----------------------------------------------------------------------------------

/** HP in a fight: hpUnit per two points of endurance, at least minHp (spec 10a; HP since 2026-11-18, one old pip = hpUnit). */
export const maxHp = (op) => Math.max(FIGHT.minHp, Math.floor((op.stats?.endurance ?? 0) / FIGHT.endurancePerPip) * FIGHT.hpUnit);
/** Hit variance (2026-11-18): a whole-HP wobble of up to round(size x FIGHT.hitSpreadShare) either way on a hit of this size; one draw, none when that is 0. */
const spread = (rng, size) => {
  const w = Math.round(size * FIGHT.hitSpreadShare);
  return w > 0 ? Math.floor(rng() * (2 * w + 1)) - w : 0;
};
/** What a plain hit from a weapon of this damage takes off (2026-11-18): hit, plus hitPerDamage a point above hitBaseDamage. */
export const hitOf = (damage) => FIGHT.hit + FIGHT.hitPerDamage * Math.max(0, Math.round(damage ?? 0) - FIGHT.hitBaseDamage);
/**
 * A hit that landed on an enemy (mutates e): its size (strong: strongMult times), one plate cracked unless it pierces (plateHp off,
 * the rest through), then the wobble on whatever got through. Returns { dmg, cracked }. Crew attacks, overwatch and the turret.
 */
export function landHit(e, hit, strong, ap, rng) {
  const size = strong ? hit * FIGHT.strongMult : hit;
  const cracked = e.absorb > 0 && !ap;
  let dmg = size;
  if (cracked) { e.absorb -= 1; dmg = Math.max(0, size - FIGHT.plateHp); }
  if (dmg > 0) dmg = Math.max(1, dmg + spread(rng, size));
  e.hp -= dmg;
  return { dmg, cracked };
}
/** Whole hits of hpUnit it takes to cover this much HP (the planning and the old pip-count rules read in these). */
const unitsOf = (hp) => Math.ceil(hp / FIGHT.hpUnit);
/** HP as whole hpUnits, for the screens (health-bar segments, the old pip count); never read by a rule. */
export const hpUnits = (hp) => unitsOf(Math.max(0, hp));
/** HP rounded up to a whole hpUnit (the pull-out points). */
const roundUpHp = (hp) => unitsOf(hp) * FIGHT.hpUnit;

/** The margin a hit is strong on: the same for every weapon since 2026-11-18 (damage sets the hit's size instead, hitOf). */
export const strongMargin = () => FIGHT.strongMargin;

/** Armour as a flat soak (2026-11-19, enemy toughness step 2): soakPerArmour HP off every enemy shot that lands, per armour point. */
export const soakOf = (armourValue) => Math.max(0, Math.round(armourValue ?? 0)) * FIGHT.soakPerArmour;

/**
 * What an enemy shot of this size takes off this runner: the hit less their soak, at least soakMin while they soak anything.
 * A fight saved before v80 has plates instead (`absorb`, soak 0): a plate still stops a whole shot there, in playRound.
 */
export const landsOn = (v, hit) => ((v?.soak ?? 0) > 0 ? Math.max(FIGHT.soakMin, hit - v.soak) : hit);

/**
 * Anyone carrying a jammer may try to jam, with their tech (spec 9). The game has no jammer item yet:
 * for now a cyberdeck counts, and a tech always does (the content question goes to the owner).
 */
export const canJam = (op) => op.role === 'tech' || counted(op).some((i) => i.type === 'deck');

/** A runner as they enter a fight: their numbers, read once (gear, traits and the approach included). */
export function runnerOf(op, approach, seat = 0) {
  const max = maxHp(op);
  const hurt = op.condition?.injury === 'light' ? FIGHT.lightWoundHp : 0;
  const w = weaponOf(op);
  const a = armourOf(op);
  const build = buildOf(op);
  return {
    id: op.id, handle: op.handle, role: op.role, seat, hp: Math.max(FIGHT.hpUnit, max - hurt), max,
    absorb: 0, soak: soakOf(a.value), armourName: a.name, weapon: w.name, ap: (w.pierce ?? 0) > 0, strong: strongMargin(), hit: hitOf(w.damage),
    look: MOVES[build?.move]?.look ?? specialLook(op), // the stage's special-move look (data/fightLooks.js); picture only, no rule reads it
    build, moved: false, misses: 0, // slice 3-ii-a: { move, payload } from data/builds.js or null (op.build); `moved`: the move's use this fight is spent
    jammer: canJam(op), healer: op.role === 'medic' || patchBonus(op, { perks: false }) > 0, medic: op.role === 'medic', // a kit makes a healer; a suture-strip perk only helps one
    cover: FIGHT.startCover, down: false, withdrawn: false, dead: false, aboard: false, stable: false, fightOn: false, downRound: null, left: false,
    stats: Object.fromEntries(FIGHT_STATS.map((s) => [s, effectiveStat(op, s, { approach })])),
  };
}

const sv = (r, s) => r.stats[s]?.value ?? 0;
const bySeat = (a, b) => a.seat - b.seat;
/**
 * The first of `list` by `cmp`: what `[...list].sort(cmp)[0]` gives (the sort is stable: of equal ones, the earliest), without
 * sorting (2026-11-18, the speed pass). For the consistent comparators used here (numbers, no NaN). undefined for an empty list.
 */
function firstBy(list, cmp) {
  let best;
  for (let i = 0; i < list.length; i++) if (i === 0 || cmp(list[i], best) < 0) best = list[i];
  return best;
}
const lowestHp = (list) => firstBy(list, (a, b) => a.hp - b.hp || bySeat(a, b));

// --- building a fight -------------------------------------------------------------------------------

const shuffle = (a, rng) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

/** Who the clocks send: the job's force's grunt when it has an opposition, else the district's first kind. */
const reinforceKind = (b) => OPPOSITION[b.opposition]?.grunt ?? SITE_ENEMIES[b.site]?.[0] ?? 'hired';

/** Does this kind break and run when too few of its sort are left? (hired guns and the standard force; `hiredTotal` counts them per group, the name kept for saved fights.) */
export const breaks = (kind) => ENEMIES[kind]?.fleeBelow != null;

/**
 * A new enemy. arriving: it came in during the fight (a backup call, the alarm or pressure clock, a wave) and spends
 * its first round approaching (3a): it can be attacked at its cover, but its aim and flank cards are spent unplayed,
 * and it cannot flee that round. group: who it breaks with (3c): 0 for the starting enemies, a new number for each
 * round's batch of arrivals, each pressure arrival and each wave (b.nextGroup).
 */
export function newEnemy(b, kind, rng, { arriving = false, group = 0 } = {}) {
  const def = ENEMIES[kind];
  const step = b.toughness ?? 0; // the job's threat made them tougher (2026-11-18): arrivals too
  const hp = def.hp + step * TOUGHNESS.hpStep;
  const e = { n: b.enemies.length + 1, kind, hp, max: hp, absorb: (def.absorb ?? 0) + (step >= TOUGHNESS.plateAtStep ? 1 : 0), cover: def.cover, out: false, fled: false, deck: shuffle([...def.deck], rng), di: 0, approaching: arriving, group, infected: null, burning: null, marked: null, exposed: null, shaken: null };
  b.enemies.push(e);
  if (breaks(kind)) b.hiredTotal[group] = (b.hiredTotal[group] ?? 0) + 1;
  return e;
}
const newGroup = (b) => { b.nextGroup = (b.nextGroup ?? 1) + 1; return b.nextGroup - 1; };

/**
 * Build a fight. type: 'holdHack' | 'holdExtract' | 'holdYard'. diff: the fight's base difficulty (the job's typical
 * roll). threat: the job's threat 1-5 (how many enemies start). site: a district id (who they are).
 * crew: the inside team (operatives, still standing). overwatch: an overwatchOf() read from core/battle.js
 * or null; wheels: { id, handle, value } for the driver in the van; standbyOp: the standby, who rides with
 * the van. rng: the run's stream (the enemies' decks are shuffled from it). Orders start as the crew's
 * defaults, visible and editable.
 */
export function buildFight({ type, diff, threat = 3, site = 'docks', opposition = null, job = null, crew, approach, overwatch = null, wheels = null, standbyOp = null, risk = 'steady', watched = false, raid = null, reinforce = null }, rng) {
  const def = FIGHTS[type];
  const b = {
    engine: 2, type, stage: 0, round: 0, diff, deadline: type === 'holdHack' ? FIGHT.deadline.holdHack : null, drawn: false, end: null,
    goal: { work: 0, protect: null, vanRound: FIGHT.vanRound, vanLeaves: null },
    clock: CLOCKS.alarm.startsAt, nextPressure: CLOCKS.pressure.firstRound, extras: 0, arriving: [], hiredTotal: {}, nextGroup: 1,
    enemies: [], runners: crew.map((op, i) => runnerOf(op, approach, i)), threats: [],
    orders: {}, risk: { level: risk }, vanHold: null, enemyReinforce: def.enemyReinforce, friendlyReinforce: def.friendlyReinforce,
    overwatch: overwatch ? { ...overwatch, vanShots: 0 } : null, wheels, standby: null, standbyOut: false, vanUsed: false,
    heat: 0, hpLost: 0, left: [], dilemmasFired: {}, watched, site, opposition: OPPOSITION[opposition] ? opposition : null,
  };
  // A raid on a hall (holdHall): who comes and how many, the hall's turret, and the round the door holds at. raid: { kind, count, cap, turret, foe, foeOne }.
  if (type === 'holdHall' && raid) {
    b.cap = raid.cap ?? null; b.foe = raid.foe ?? null; b.foeOne = raid.foeOne ?? null;
    b.turret = raid.turret ? { ...raid.turret } : null;
  }
  // 3d: the job's recipe (data/fights.js FIGHT_RECIPES): its authored waves (their own budget) and the cap on reactive reinforcements.
  const recipe = FIGHT_RECIPES[job] ?? null;
  b.maxExtra = recipe?.maxExtraEnemies ?? def.maxExtraEnemies ?? FIGHT.maxExtraEnemies;
  b.recipe = recipe?.waves?.length ? { waves: recipe.waves.map((w) => ({ ...w })) } : null;
  if (standbyOp) b.standby = runnerOf(standbyOp, approach, b.runners.length);
  // Help sent to a hit post (core/contracts.js, 2026-11-21): each joins at the start of their round.
  if (reinforce?.length) b.reinforce = reinforce.map(({ op, round }, i) => ({ runner: runnerOf(op, approach, b.runners.length + i), round }));
  if (type === 'holdHack') {
    const tech = [...b.runners].sort((x, y) => (y.role === 'tech') - (x.role === 'tech') || sv(y, 'tech') - sv(x, 'tech') || bySeat(x, y))[0];
    b.goal.protect = tech?.id ?? null;
  }
  if (type === 'holdHall' && raid) {
    for (let i = 0; i < raid.count; i++) newEnemy(b, raid.kind, rng);
    b.orders = defaultOrders(b);
    b.showcaseSeed = Math.floor(rng() * 2 ** 32);
    return b;
  }
  const kinds = SITE_ENEMIES[site] ?? SITE_ENEMIES.docks;
  const count = COUNT_BY_THREAT[clamp(Math.round(threat), 1, 5)];
  b.toughness = TOUGHNESS_BY_THREAT[clamp(Math.round(threat), 1, 5)];
  const force = OPPOSITION[opposition];
  if (force) {
    // The leader is the district's own kind; everyone else is the force's grunt, and there are more of them.
    newEnemy(b, kinds[Math.floor(rng() * kinds.length)], rng);
    for (let i = 1; i < count + force.extra; i++) newEnemy(b, force.grunt, rng);
  } else for (let i = 0; i < count; i++) newEnemy(b, kinds[Math.floor(rng() * kinds.length)], rng);
  // The way out (2026-11-17): when the hack is done the alarm brings the opening force's like again, and the fight is won only when they are beaten. A fight saved before this has no `wayOut` and still ends with the hack.
  if (type === 'holdHack') b.wayOut = b.enemies.map((e) => e.kind).slice(0, Math.max(1, Math.ceil(b.enemies.length * FIGHT.wayOutShare)));
  b.orders = defaultOrders(b);
  // The showcase seed (0b): the build's last draw, so it moves no other roll. Showcase rolls are a pure hash of it.
  b.showcaseSeed = Math.floor(rng() * 2 ** 32);
  return b;
}

// --- orders ----------------------------------------------------------------------------------------

const PRIORITY = ['protected', 'radio', 'low'];
const order = (duty, target = null, fallback = null, priority = PRIORITY) => ({ duty, target, fallback, priority, byStage: null });
const fb = (duty, target = null) => ({ duty, target });
const capableSupport = (r) => r.medic || (r.jammer && sv(r, 'tech') >= sv(r, 'combat'));
// Someone with a move still to use is left to attack when the crew's defaults pick protectors (2026-11-17): a protector shields instead of
// attacking, so a Ricochet carrier on a protect order would never fire. They protect only when nobody else can.
const hasMove = (r) => !!MOVES[r.build?.move] && !r.moved;
// Armour counts as HP: a plate (fights saved before v80) as plateHp, a soak as what it takes off FIGHT.soakShots shots.
const guard = (r) => r.max + r.absorb * FIGHT.plateHp + (r.soak ?? 0) * FIGHT.soakShots;
const toughest = (b, list) => [...list].sort((x, y) => hasMove(x) - hasMove(y) || guard(y) - guard(x) || bySeat(x, y));

/** The runner best placed to cover others (most HP plus armour, ties lowest seat), not the specialist. */
export const bestProtector = (b) => toughest(b, b.runners.filter((r) => r.id !== b.goal.protect))[0] ?? null;

/**
 * The crew's own orders for one runner (spec section 12, settled 2026-11-11), built from the fight as it
 * is. holdHack: the technician works; the two toughest others protect the technician (fallback attack);
 * everyone else supports if a medic or a jammer with tech at least their combat, else attacks (fallback
 * protect the technician). holdExtract: hold stage, the best protector covers the lowest-HP runner
 * (fallback attack) and the rest attack, the lowest-HP runner's attackers first; board stage, the
 * protector covers (fallback board) and the rest board (fallback hold).
 */
export function defaultOrderFor(b, r) {
  if (b.type === 'holdHack') {
    // Stage 0 the hack, stage 1 the way out (everyone attacks: the work is done and nobody has anyone to cover).
    const hack = (() => {
      if (r.id === b.goal.protect) return order('push', null, fb('hold'));
      const guards = toughest(b, b.runners.filter((x) => x.id !== b.goal.protect)).slice(0, 2).map((x) => x.id);
      if (guards.includes(r.id)) return order('protect', 'protected', fb('attack'));
      return capableSupport(r) ? order('support', null, fb('protect', 'protected')) : order('attack', null, fb('protect', 'protected'));
    })();
    hack.byStage = { 0: { ...hack, byStage: null }, 1: order('attack', null, fb('hold'), ['low', 'radio']) };
    return hack;
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

/** HP at or under which this runner pulls out at round start (cautious half, steady a third and at least minHp, each rounded up to a whole hpUnit; committed never). */
export function riskThreshold(b, r) {
  const level = b.risk.level;
  return level === 'cautious' ? roundUpHp(r.max / 2) : level === 'steady' ? Math.max(FIGHT.risk.steady.minHp, roundUpHp(r.max / FIGHT.risk.steady.pullDiv)) : FIGHT.risk.committed.pullAt;
}
/** A runner the player chose to keep in at their pull-out point stays in until they lose more HP (r.stayHp, set by keepIn). */
const keptIn = (r) => r.stayHp != null && r.hp >= r.stayHp;
/** Is this runner at the point where their risk level pulls them out, and not kept in? */
export const atPullOut = (b, r) => r.hp <= riskThreshold(b, r) && !keptIn(r);
/** The runners standing at their pull-out point (not while the van is there: pulling out then means boarding). */
export const pullOutSubjects = (b) => (boardingStage(b) ? [] : standing(b).filter((r) => atPullOut(b, r)));
/** The player's answer "keep them in": these runners fight on until they lose more HP. */
export function keepIn(b, ids) { for (const r of b.runners) if (ids.includes(r.id)) r.stayHp = r.hp; }

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

/**
 * A fight's difficulty from the job's (the incident's) difficulty: FIGHT.ease lower, because a job's roll is taken by
 * the crew's best with their bonuses and a fight tests every runner on their own stats. The run (runfight.js) and the
 * planning read (squad.js) both come through here, so shown is used.
 */
export const fightDiff = (jobDiff) => jobDiff - FIGHT.ease;
/** The difficulty a crew attack rolls against (before its step and the cover): the fight's, with its climb above attackClimbFrom scaled by attackClimbShare. */
export const attackDiff = (diff) => (FIGHT.attackClimbShare !== 1 && diff > FIGHT.attackClimbFrom ? Math.round(FIGHT.attackClimbFrom + FIGHT.attackClimbShare * (diff - FIGHT.attackClimbFrom)) : diff);

/** A roll's chance, exactly as the round makes it (d20 + value >= 10 + diff). */
export const rollChance = (value, diff) => clamp((11 + value - diff) / 20, 0, 1);

// --- the telegraph ---------------------------------------------------------------------------------

function draw(b, e, rng) {
  for (let tries = 0; tries < 8; tries++) {
    if (e.di >= e.deck.length) { shuffle(e.deck, rng); e.di = 0; }
    const kind = e.deck[e.di++];
    if (kind === 'backup' && (!b.enemyReinforce || b.extras >= b.maxExtra)) continue; // nothing left to send
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
    // 3a: an enemy in its approach round draws as normal (its deck moves on), but a drawn aim or flank is spent unplayed:
    // no threat, and no target roll either (the target roll is never drawn for an approaching enemy, whatever the card).
    // Radio cards (backup, alarm) are played as normal.
    if (e.approaching && THREATS[kind].target === 'runner') continue;
    let target = null;
    if (THREATS[kind].target === 'runner') {
      const up = standing(b);
      const prot = b.goal.protect && up.find((r) => r.id === b.goal.protect);
      if (!up.length) target = null;
      else if (prot && rng() < FIGHT.protectFocus) target = prot.id;
      else if (rng() < FIGHT.targetFocus) target = lowestHp(up).id;
      else target = up[Math.floor(rng() * up.length)].id;
    }
    if (THREATS[kind].target === 'runner' && !target) continue;
    const t = { id: `${b.round}.${e.n}`, kind, enemy: e.n, target, shieldedBy: null, cancelled: false, shown: null, hit: 0 };
    if (kind === 'aim') { t.shown = aimChance(b, runner(b, target)); t.hit = ENEMY_HIT[e.kind] + spread(rng, ENEMY_HIT[e.kind]); }
    b.threats.push(t);
  }
  return b.threats;
}

// --- resolving orders into actions -----------------------------------------------------------------

/**
 * Planned damage that already covers an enemy's HP (and armour) means later attackers skip it. Each plan is a plain hit
 * { ap, hit }: a piercing one counts whole; the others crack the plates first, one each (plateHp off), the rest counts.
 */
function covered(e, res) {
  let plates = e.absorb; let total = 0;
  for (const p of res.damage[e.n] ?? []) {
    if (p.ap || plates === 0) total += p.hit;
    else { plates -= 1; total += Math.max(0, p.hit - FIGHT.plateHp); }
  }
  return total >= e.hp;
}

const shotValue = (t, b) => (t && t.kind === 'aim' ? t.shown * landsOn(runner(b, t.target), t.hit) : 0); // what it would take off its target, after their soak

/** Enemies in the order an attacker takes them: by the priority words in turn, then lowest n. */
function enemyOrder(b, list, priority) {
  const lowest = lowestHp(standing(b));
  const key = (e) => {
    const t = b.threats.find((x) => x.enemy === e.n);
    return priority.map((p) => (p === 'protected' ? (t && b.goal.protect && t.target === b.goal.protect ? 0 : 1)
      : p === 'radio' ? (t && RADIO(t) ? 0 : 1)
        : p === 'low' ? (t && lowest && t.target === lowest.id ? 0 : 1)
          : p === 'exposed' ? -shotValue(t, b)
            : p === 'approaching' ? (e.approaching ? 0 : 1) : 1));
  };
  const keys = new Map(list.map((e) => [e, key(e)])); // each enemy's key once (the same keys the comparisons read)
  return [...list].sort((x, y) => {
    const kx = keys.get(x); const ky = keys.get(y);
    for (let i = 0; i < kx.length; i++) if (kx[i] !== ky[i]) return kx[i] - ky[i];
    return x.n - y.n;
  });
}

// --- the build vocabulary: the generic trigger step (2026-11-19, drafts/PROPOSAL-build-vocabulary.md) -----------------------------
// A piece (data/builds.js `pieces`) is { when, if?, who, what } in the words below and never names another piece; when a trigger fires,
// every piece listening for it runs, in a fixed order (the move's, then the payload's). Adding a piece made of these words is data only.
export const VOCAB = {
  when: ['onAttack', 'onHit', 'onCrack', 'onKill'],
  if: ['enemiesUp', 'targetHas'],
  who: ['target', 'nextInGroup', 'nearest'],
  what: ['burst', 'apply', 'spread'],
  status: ['infected', 'burning', 'marked', 'exposed', 'shaken'],
};
// The statuses (part B, 2026-11-19, the owner's first set; drafts/HANDOFF-build-vocab-next.md). Each sits on an enemy as a field of its
// name (e.infected, e.burning, ...) or null. What each does by itself, all here and in playRound:
//   infected  loses the payload's dot.tick HP at each round's end (from the round after), for dot.rounds or until it falls
//   burning   the same tick, its own payload's numbers; never spreads by itself (owner, 2026-11-19: a plain burn)
//   marked    nothing: a mark other pieces read (`if: { targetHas: 'marked' }`)
//   exposed   the next hit it takes from the crew or the overwatch ignores its plate; that hit uses it up
//   shaken    counts as gone for its group's flee check (only bodies that break run; on the others it does nothing)
// The guardrails are the engine's: a status never stacks or renews, an immune body shrugs it (once a body) and never passes it on.
export const DOTS = ['infected', 'burning'];
export const STATUSES = VOCAB.status;

/** The pieces a runner carries that listen for `when`, in the fixed order (move, then payload): [{ piece, from }] (`from`: the move or payload). */
// Each move's or payload's listeners for a trigger, read once (the data never changes in play; the planning odds replay many fights).
const listening = new WeakMap();
const listenersOf = (from, when) => {
  let byWhen = listening.get(from);
  if (!byWhen) listening.set(from, (byWhen = new Map()));
  let list = byWhen.get(when);
  if (!list) byWhen.set(when, (list = (from.pieces ?? []).filter((p) => p.when === when).map((piece) => ({ piece, from }))));
  return list;
};
const NONE = Object.freeze([]);
export const piecesOn = (r, when) => {
  const mv = MOVES[r.build?.move]; const pay = PAYLOADS[r.build?.payload];
  if (!mv && !pay) return NONE;
  if (!mv) return listenersOf(pay, when);
  if (!pay) return listenersOf(mv, when);
  return [...listenersOf(mv, when), ...listenersOf(pay, when)];
};

/** Does a piece's `if` hold now? (No condition always holds.) */
export const pieceHolds = (b, cond, e = null) => !cond || !((cond.enemiesUp != null && enemiesUp(b).length < cond.enemiesUp) || (cond.targetHas != null && !e?.[cond.targetHas]));

/** A status as it sits on a body, made from the payload that carries it: `infected` takes the payload's `dot` (the first infection stands). */
const dot = (pay, by, round) => ({ tick: pay.dot.tick, left: pay.dot.rounds, by, round, payload: pay.id });
const mark = (pay, by, round) => ({ by, round, payload: pay.id });
const STATUS = { infected: dot, burning: dot, marked: mark, exposed: mark, shaken: mark };
/** Whether a status would do anything on this body, so `nextInGroup` passes over one it would be wasted on (part B): an exposed body needs a
 * plate left to skip; a shaken one must be a kind that breaks and runs. The others always act. */
const canAct = (e, st) => (st === 'exposed' ? e.absorb > 0 : st === 'shaken' ? breaks(e.kind) : true);
/** Each status's log line key (data/fightText.js). */
const STATUS_LINE = { infected: 'infect', burning: 'burn', marked: 'mark', exposed: 'expose', shaken: 'shake' };

/** How many enemies must be up for a move to fire by itself (its onAttack piece's `if`; 1 with no condition). The planning advice reads it. */
export const moveNeedsUp = (mv) => (mv?.pieces ?? []).find((p) => p.when === 'onAttack')?.if?.enemiesUp ?? 1;

/** The runner's move if it is ready to fire by itself now: they have one, a use left, and its onAttack piece's `if` holds. Else null. */
export function moveReady(b, r) {
  const mv = MOVES[r.build?.move];
  if (!mv || (r.moved ? 1 : 0) >= mv.uses) return null;
  const on = piecesOn(r, 'onAttack').find((x) => x.from === mv && x.piece.what === 'burst');
  return on && pieceHolds(b, on.piece.if) ? mv : null;
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
      // Slice 3-ii-a: a move that is ready fires by itself (2.2): one attack on each of the first `reach` enemies up, in the rules' order, the
      // chosen one first. Ricochet is agnostic (owner, 2026-11-17): it knows nothing of what a teammate has planned, so a bounce may land
      // on an enemy another runner is already shooting. Its own bounces are planned damage, so the attackers after it still skip what it covers.
      const mv = moveReady(b, r);
      if (mv) {
        const up = enemyOrder(b, enemiesUp(b), priority);
        const first = up.find((x) => x === e) ?? up[0];
        const hit = [first, ...up.filter((x) => x !== first)].slice(0, mv.reach);
        for (const x of hit) (res.damage[x.n] ??= []).push({ ap: r.ap, hit: r.hit ?? FIGHT.hit });
        return { kind: 'burst', move: mv.id, enemy: first.n, enemies: hit.map((x) => x.n) };
      }
      (res.damage[e.n] ??= []).push({ ap: r.ap, hit: r.hit ?? FIGHT.hit });
      return { kind: 'attack', enemy: e.n };
    }
    case 'protect': {
      // An order to protect a teammate who is down at the van means carrying them (spec 8).
      const downMate = typeof target === 'string' && target !== 'protected' && outsideDown(b).find((x) => x.id === target);
      if (downMate) {
        if (!boardingStage(b) || res.doors >= doorSlots(b) || res.carried.has(downMate.id)) return null;
        res.doors += 1; res.carried.add(downMate.id); return { kind: 'carry', target: downMate.id };
      }
      const T = target === 'protected' ? b.goal.protect : target ?? (b.goal.protect && b.goal.protect !== r.id ? b.goal.protect : lowestHp(standing(b).filter((x) => x.id !== r.id))?.id);
      if (!T || T === r.id || !standing(b).some((x) => x.id === T)) return null;
      // Shield the worst shot on them (shown chance x HP) that no one has taken yet.
      const shot = firstBy(b.threats.filter((t) => t.kind === 'aim' && t.target === T && !res.shields.has(t.id)), (x, y) => shotValue(y, b) - shotValue(x, b) || x.enemy - y.enemy);
      if (shot) { res.shields.add(shot.id); return { kind: 'shield', threat: shot.id, for: T }; }
      const mate = runner(b, T);
      if (r.healer && mate.hp < mate.max && !res.patches.has(T)) { res.patches.add(T); return { kind: 'patch', target: T }; }
      return null;
    }
    case 'support': {
      if (r.healer) {
        const bleeding = b.runners.find((x) => x.down && !x.stable && !x.aboard && !x.dead && !x.withdrawn && !res.patches.has(x.id));
        if (bleeding) { res.patches.add(bleeding.id); return { kind: 'stabilise', target: bleeding.id }; }
        const hurt = firstBy(standing(b).filter((x) => x.hp < x.max && !res.patches.has(x.id)), (x, y) => x.hp / x.max - y.hp / y.max || bySeat(x, y));
        if (hurt) { res.patches.add(hurt.id); return { kind: 'patch', target: hurt.id }; }
      }
      if (r.jammer && !res.jam && b.threats.some(RADIO)) { res.jam = true; return { kind: 'jam' }; }
      const shot = firstBy(b.threats.filter((t) => t.kind === 'aim' && t.target !== r.id && !res.shields.has(t.id)), (x, y) => shotValue(y, b) - shotValue(x, b) || x.enemy - y.enemy);
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
  const queue = [...standing(b)].sort((x, y) => group(x) - group(y) || (group(x) === 1 ? x.hp - y.hp : 0) || bySeat(x, y));
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
 * [{ id, enemy, target, shieldedBy, chance, hit, lands }] (lands: what it takes off whoever faces it, after their soak). Pure; the round and previewRound both read it.
 */
export function exposures(b, actions) {
  const kindOf = new Map(actions.map((a) => [a.r.id, a.kind]));
  return b.threats.filter((t) => t.kind === 'aim' && !t.cancelled).map((t) => {
    const shield = actions.find((a) => a.kind === 'shield' && a.threat === t.id);
    const v = shield ? shield.r : runner(b, t.target);
    const k = kindOf.get(v?.id);
    const chance = v ? aimChance(b, v, { hunker: !shield && k === 'hunker', open: !shield && (k === 'board' || k === 'carry') }) : 0;
    return { id: t.id, enemy: t.enemy, target: v?.id ?? null, shieldedBy: shield?.r.id ?? null, chance, hit: t.hit, lands: landsOn(v, t.hit) };
  });
}

/** The enemy overwatch will fire at: whoever threatens a runner in the open worst (the boarders, carriers, the flanked), else the specialist's attacker, else the lowest n. */
function overwatchTarget(b, actions, res) {
  const kindOf = new Map(actions.map((a) => [a.r.id, a.kind]));
  const up = enemiesUp(b).filter((e) => !covered(e, res));
  const threatOf = (e) => b.threats.find((t) => t.enemy === e.n && t.kind === 'aim');
  const exposed = (e) => {
    const t = threatOf(e); const v = t && runner(b, t.target);
    return t && v && (['board', 'carry'].includes(kindOf.get(v.id)) || v.cover === 'open') ? shotValue(t, b) : 0;
  };
  const onProt = (e) => { const t = threatOf(e); return t && b.goal.protect && t.target === b.goal.protect ? 1 : 0; };
  return firstBy(up, (x, y) => exposed(y) - exposed(x) || onProt(y) - onProt(x) || x.n - y.n) ?? null;
}

/** Whether overwatch may fire this round (a use left; at the van, only overwatchUsesAtVan shots). */
const overwatchReady = (b) => b.overwatch && b.overwatch.left > 0 && (!boardingStage(b) || b.overwatch.vanShots < FIGHT.overwatchUsesAtVan);

// --- infection (slice 3-ii-a) ----------------------------------------------------------------------

/** The ticks due at the end of this round, [{ e, st }]: each enemy up with a damage-over-time status (infected, then burning) put on in an earlier
 * round (the first tick is the round after the hit). The preview and the round read the same list. */
export const ticksDue = (b) => enemiesUp(b).flatMap((e) => DOTS.filter((st) => e[st] && b.round > e[st].round).map((st) => ({ e, st })));

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
    actions: actions.map((a) => ({ who: a.r.id, kind: a.kind, target: a.target ?? a.for ?? a.enemy ?? null, ...(a.enemies ? { targets: a.enemies } : {}), ...(['attack', 'burst'].includes(a.kind) && PAYLOADS[a.r.build?.payload] ? { carries: a.r.build.payload } : {}), from: a.from, duty: a.order.duty, fallback: a.order.fallback?.duty ?? null })),
    ticks: ticksDue(b).map(({ e, st }) => ({ enemy: e.n, status: st, word: PAYLOADS[e[st].payload]?.word ?? 'Vector', hp: e[st].tick, left: e.hp, rounds: e[st].left })),
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
    if (k === 'riskNot') { if (b.risk.level === v) return false; continue; } // not at this risk level (a cautious crew's pull-out is not asked)
    if (k === 'radioShown') { if (b.threats.some((t) => RADIO(t) && !t.cancelled) !== v) return false; continue; }
    if (k === 'protectedCanJam') { if (!!(prot && present(prot) && prot.jammer) !== v) return false; continue; }
    if (!prot || !present(prot)) return false; // the rest are about the specialist
    if (k === 'hpAtMost' && !(prot.hp <= v)) return false;
    if (k === 'hpAtMostShare' && !(prot.hp <= prot.max * v)) return false;
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
    // The pull-out call comes up again each time someone at their point loses more HP, so its key carries their HP.
    const key = `${id}:${subjects.join(',')}${id === 'pullOutPoint' ? `:${subjects.map((s) => runner(b, s).hp).join(',')}` : ''}`;
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
  const exp = b.drawn ? exposures(b, resolveOrders(b).actions).sort((x, y) => y.chance * y.lands - x.chance * x.lands || x.enemy - y.enemy) : [];
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

// A round's lines are for the feed. playFight keeps none of its rounds' lines (it returns the fight alone), so while it
// plays they are not written at all (2026-11-18, the speed pass): `say` and the names made only for a line's slots do
// nothing. The fight plays the same either way: wording never draws, no say's value is used and nothing in a round reads
// its lines. b.end's text (finish) is always written.
let wordless = false;
const silent = () => {};
const wordOf = (key, slots) => (wordless ? '' : lineText(key, slots));

/**
 * Begin the next round: arrivals, the standby going out, someone climbing back out of the van, the van
 * special, then the telegraph (draws from rng). After this the previews and the call-in checks work.
 * Returns the round's start lines. playRound calls it for you if it has not been called.
 */
export function startRound(b, rng) {
  const lines = [];
  const say = wordless ? silent : (kind, key, slots = {}, extra = {}) => lines.push({ kind, key, slots, ...extra, text: lineText(key, slots) });
  const kindWord = wordless ? silent : kindWordOf;
  b.round += 1;
  for (const r of b.runners) if (r.stayHp != null && r.hp > riskThreshold(b, r)) r.stayHp = null; // healed past their point: asked afresh next time
  // Arrivals come in approaching (3a); this round's batch of called-in arrivals is one group, a pressure arrival another, each wave another (3c).
  const batch = b.arriving.splice(0);
  if (batch.length) { const group = newGroup(b); for (const kind of batch) { const e = newEnemy(b, kind, rng, { arriving: true, group }); say('arrive', 'arrive', { kind: kindWord(e.kind), n: e.n }); } }
  if ((b.type === 'holdExtract' || b.type === 'holdYard') && b.round >= b.nextPressure && b.extras < b.maxExtra) {
    b.extras += 1; b.nextPressure += CLOCKS.pressure.every;
    const e = newEnemy(b, reinforceKind(b), rng, { arriving: true, group: newGroup(b) });
    say('arrive', 'pressure', { kind: kindWord(e.kind), n: e.n });
  }
  // 3d: the recipe's waves due this round (their own budget: they never count towards b.extras). A wave with no kind sends who the clocks send.
  if (b.recipe) {
    for (const w of b.recipe.waves.filter((x) => x.round <= b.round)) {
      const group = newGroup(b);
      for (let i = 0; i < w.count; i++) { const e = newEnemy(b, w.kind ?? reinforceKind(b), rng, { arriving: true, group }); say('arrive', 'wave', { kind: kindWord(e.kind), n: e.n }); }
    }
    b.recipe.waves = b.recipe.waves.filter((x) => x.round > b.round);
    if (!b.recipe.waves.length) b.recipe = null;
  }
  for (const e of b.enemies) if (e.approaching && !e.out && !e.fled) say('approach', 'approach', { enemy: enemyName(e.kind, e.n) }, { enemy: e.n });
  for (const h of (b.reinforce ?? []).filter((x) => x.round <= b.round && !x.in)) {
    h.in = true; b.runners.push(h.runner);
    say('standby', 'reinforceIn', { who: h.runner.handle });
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
  if (b.type === 'holdExtract' && b.stage === 0 && b.wheels && !b.vanUsed && (standing(b).some((r) => r.hp <= FIGHT.hpUnit) || (b.round >= 2 && enemiesUp(b).length >= 2))) {
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
    return { kind: 'van', key: 'vanHeld', heat: FIGHT.holdHeat, text: wordOf('vanHeld', { rounds: FIGHT.holdRounds, outside }) };
  }
  return { kind: 'van', key: 'vanCantWait', text: wordOf('vanCantWait', { outside }) };
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
  const say = wordless ? silent : (kind, key, slots = {}, extra = {}) => { const l = { kind, key, slots, ...extra, text: lineText(key, slots) }; lines.push(l); return l; };
  // The trigger step's target rules (`who`): the bodies a piece acts on. `st`: the status the piece carries, `from`: its payload.
  // nextInGroup is Contagion's rule (slice 3-iii, 2026-11-17): the first other enemy of the group that is up, without the status and not immune.
  const whoOf = (rule, e, st, from) => {
    if (rule === 'target') return [e];
    if (rule === 'nextInGroup') return enemiesUp(b).filter((x) => x.n !== e.n && (x.group ?? 0) === (e.group ?? 0) && !x[st] && !immuneTo(x.kind, from.id) && canAct(x, st)).slice(0, 1);
    return [];
  };
  // onKill: an enemy went down (to `killer`'s attack or bounce, or to anything for a status it carried: the overwatch, a tick, another runner). The
  // listeners are the killer's own onKill pieces first, then those its statuses bring with them (the payload that put them on). A fall spreads
  // a status at most once, and an immune body never passes one on: so a Contagion carrier's killing hit makes the infection jump at once, even from
  // a body that never lived to be infected (2026-11-17), and otherwise the host's own infection jumps. A spread is not a hit: a plate does not stop it,
  // and the new status starts in full (ticking from the next round).
  const fall = (e, killer, carried = STATUSES.map((st) => e[st])) => {
    const sources = [];
    if (killer) for (const { piece, from } of piecesOn(killer, 'onKill')) sources.push({ piece, from, by: killer.id });
    for (const inf of carried) {
      const from = inf && PAYLOADS[inf.payload];
      // A carried status brings only its payload's onKill spread pieces (the Contagion jump), never its other onKill pieces: those are the killer's.
      if (from && !sources.some((x) => x.from === from && x.carried)) for (const piece of (from.pieces ?? []).filter((p) => p.when === 'onKill' && p.what?.spread)) sources.push({ piece, from, by: inf.by, carried: true });
    }
    const spread = new Set();
    for (const { piece, from, by } of sources) {
      if (!pieceHolds(b, piece.if, e)) continue;
      const st = piece.what?.spread;
      if (st) {
        if (spread.has(st) || immuneTo(e.kind, from.id)) continue;
        spread.add(st);
        for (const t of whoOf(piece.who, e, st, from)) {
          t[st] = STATUS[st](from, by, b.round);
          say('spread', 'spread', { enemy: E(e.n), to: E(t.n), word: from.word }, { enemy: t.n, from: e.n, jumpFrom: e.n, payload: from.id });
        }
        continue;
      }
      // An onKill `apply` (a killer's piece: Rout's fear on the next of the group). Not a hit: a plate does not stop it.
      const ap = piece.what?.apply;
      if (ap) for (const t of whoOf(piece.who, e, ap, from)) put(t, ap, from, by, killer?.handle, { actor: by, from: e.n });
    }
  };
  // Put a status on a body: never on one that has it (no stacking, no renewing) or is immune to the payload; said with the status's own line.
  // Three switched-off dot hooks (2026-11-20, the Cytotoxic sweep, scripts/sim-cytotoxic.mjs): no payload in the game sets them, so play is as
  // before. `dot.stack` (n): a fresh hit from the same payload on a body it already ticks adds its base tick again, up to n times in all.
  // `dot.scale` ({ stat, from, step, per, cap }): the tick grows `per` HP for each `step` points of the carrier's stat above `from`, to `cap`.
  // `dot.grow` ({ per, cap }): the tick grows `per` HP after each tick, to `cap`. Measurement only until the owner picks one.
  const put = (t, st, from, by, who, extra) => {
    if (immuneTo(t.kind, from.id)) return;
    if (t[st]) {
      const cur = t[st]; const n = from.dot?.stack;
      if (!n || cur.payload !== from.id || (cur.stacks ?? 1) >= n) return;
      cur.stacks = (cur.stacks ?? 1) + 1; cur.tick += from.dot.tick;
      say(STATUS_LINE[st], STATUS_LINE[st], { who, enemy: E(t.n), word: from.word }, { ...extra, enemy: t.n, payload: from.id, status: st, stacked: cur.stacks });
      return;
    }
    t[st] = STATUS[st](from, by, b.round);
    const sc = from.dot?.scale;
    if (sc) { const r = b.runners.find((x) => x.id === by); const v = r ? sv(r, sc.stat) : 0; t[st].tick = Math.min(sc.cap, from.dot.tick + Math.max(0, Math.floor((v - sc.from) / sc.step)) * sc.per); }
    say(STATUS_LINE[st], STATUS_LINE[st], { who, enemy: E(t.n), word: from.word }, { ...extra, enemy: t.n, payload: from.id, status: st });
  };

  const E = wordless ? silent : (n) => enemyName(b.enemies.find((x) => x.n === n).kind, n); // a name for a line's slots only
  // `exposed` (part B): the next landed hit on the body ignores its plate and deals the payload's `expose.extra` HP more (owner, 2026-11-19),
  // and uses the status up. `line` flags the hit's line when a plate was actually skipped (the stage and the log say so).
  const pierce = (e, ap) => {
    if (!e.exposed) return { used: false, extra: 0, line: {} };
    const skipped = e.absorb > 0 && !ap;
    const extra = PAYLOADS[e.exposed.payload]?.expose?.extra ?? 0;
    e.exposed = null;
    return { used: true, extra, line: skipped ? { pierced: true } : {} };
  };
  /** The exposed hit's extra HP, on a hit that landed (after the plate rule and the wobble, so it is never wobbled away). */
  const extraOf = (e, pz, dmg) => { if (!pz.used || !pz.extra || dmg <= 0) return dmg; e.hp -= pz.extra; return dmg + pz.extra; };

  const vl = vanDecision(b);
  if (vl) lines.push(vl);

  const { actions, res } = resolveOrders(b);
  result.actions = actions.map((a) => ({ opId: a.r.id, action: a.kind, target: a.target ?? a.for ?? a.enemy ?? null, from: a.from }));
  // The round's stances: who runs for the van, who hunkers, who pulls out.
  for (const a of actions) {
    if (a.kind === 'board' || a.kind === 'carry') a.r.boarding = true;
    if (a.kind === 'hunker') a.r.hunker = true;
    if (a.kind === 'move') a.r.cover = 'half';
    if (a.kind === 'withdraw') { a.r.leaving = true; a.r.ordered = a.from === 'duty'; } // a hand-ordered withdrawal can cost a life
  }
  // What was shown is what is rolled: refresh each shot's shown chance with the round's stances (previewRound reads the same).
  for (const x of exposures(b, actions)) { const t = b.threats.find((y) => y.id === x.id); if (t) t.shown = x.chance; }

  const roll = (value, diff, margin = 99) => { const die = d20(rng); const need = 10 + diff; return { die, need, value, ok: die + value >= need, strong: die + value >= need + margin }; };
  const rollOf = (r) => ({ die: r.die, need: r.need, value: r.value, success: r.ok });

  // Overwatch: one attack a round (at the van, overwatchUsesAtVan), before the crew.
  if (overwatchReady(b)) {
    const e = overwatchTarget(b, actions, res);
    if (e) {
      const ow = b.overwatch;
      ow.left -= 1; if (boardingStage(b)) ow.vanShots += 1;
      const owx = { owLeft: ow.left, owUses: GEAR[ow.kit]?.overwatch?.uses ?? null }; // for the stage's perch pips (picture only)
      b.heat += ow.heat ?? 0; result.neural += ow.neural ?? 0;
      const x = roll(ow.value, attackDiff(b.diff) + FIGHT.attackStep + FIGHT.overwatchStep + FIGHT.cover[e.cover], strongMargin());
      if (!x.ok) say('overwatch', 'overwatchMiss', { who: ow.handle, enemy: E(e.n) }, { actor: ow.id, enemy: e.n, kit: ow.kit, ...owx, success: false, damage: 0, roll: rollOf(x) });
      else {
        const pz = pierce(e, false);
        const landedHit = landHit(e, hitOf(ow.damage), x.strong, pz.used, rng);
        const { cracked } = landedHit; const dmg = extraOf(e, pz, landedHit.dmg);
        if (e.hp <= 0) { e.out = true; defeated.push({ by: ow.id, enemy: e.n, how: 'overwatch' }); say('overwatch', 'overwatchOut', { who: ow.handle, enemy: E(e.n) }, { actor: ow.id, enemy: e.n, kit: ow.kit, ...owx, success: true, damage: dmg, dropped: true, roll: rollOf(x), cracked }); fall(e, null); }
        else say('overwatch', dmg === 0 ? 'overwatchCrack' : 'overwatchHit', { who: ow.handle, enemy: E(e.n) }, { actor: ow.id, enemy: e.n, kit: ow.kit, ...owx, success: true, damage: dmg, roll: rollOf(x), left: e.hp, cracked });
      }
    }
  }

  // onHit: a runner's hit landed and left the target up. Every status the hit carries (the runner's onHit `apply` pieces) meets the target's
  // tags first: an immune body shrugs it off, said once a body, on any landed hit, plate or not, so a drone's shrug is seen. Then, past the plate
  // only (a hit that only cracks one carries nothing in; owner, 2026-11-17), the status goes on, unless the body has it already.
  // onCrack (part B, 2026-11-19): the same, for an attack that only cracked a plate (no damage): its pieces go on whatever the plate.
  const landed = (r, e, dmg, named, flag, when = 'onHit') => {
    for (const { piece, from } of piecesOn(r, when)) {
      const st = piece.what?.apply;
      if (!st || !pieceHolds(b, piece.if, e)) continue;
      if (immuneTo(e.kind, from.id)) { if (!e.shrugged) { e.shrugged = true; say('immune', 'immune', { who: r.handle, enemy: E(e.n), word: from.word }, { ...named, ...flag, enemy: e.n }); } continue; }
      if (when === 'onHit' && dmg <= 0) continue;
      for (const t of whoOf(piece.who, e, st, from)) put(t, st, from, r.id, r.handle, { ...named, ...flag });
    }
  };

  // A runner's attack on an enemy: the roll, the damage, and the triggers it fires (onKill, onHit). `burst`: one bounce of a move (its own lines, flagged
  // so the stage draws the run of them as the move's look). A bounce on someone already gone is skipped (the overwatch may have got there).
  const strike = (r, n, named, burst) => {
    const e = b.enemies.find((x) => x.n === n);
    const k = (key) => (burst ? key.replace('attack', 'bounce') : key);
    const flag = burst ? { burst: true } : {};
    if (e.out || e.fled) { if (!burst) say('attack', 'attackGone', { who: r.handle }, { ...named, enemy: e.n, success: false, damage: 0 }); return; }
    const x = roll(sv(r, 'combat') + Math.min(FIGHT.missBonusCap, (r.misses ?? 0) * FIGHT.missBonus), attackDiff(b.diff) + FIGHT.attackStep + FIGHT.cover[e.cover], r.strong);
    r.misses = x.ok ? 0 : (r.misses ?? 0) + 1;
    if (!x.ok) { say('attack', k('attackMiss'), { who: r.handle, enemy: E(e.n) }, { ...named, ...flag, enemy: e.n, success: false, damage: 0, roll: rollOf(x) }); return; }
    const pz = pierce(e, r.ap);
    const landedHit = landHit(e, r.hit ?? FIGHT.hit, x.strong, r.ap || pz.used, rng); // a plate takes plateHp off the hit: a base plain hit only cracks it
    const { cracked } = landedHit; const dmg = extraOf(e, pz, landedHit.dmg);
    if (e.hp <= 0) { e.out = true; defeated.push({ by: r.id, enemy: e.n, how: burst ? 'burst' : 'attack' }); say('attack', k('attackOut'), { who: r.handle, enemy: E(e.n) }, { ...named, ...flag, ...pz.line, enemy: e.n, success: true, damage: dmg, dropped: true, roll: rollOf(x), strong: x.strong, cracked }); fall(e, r); return; }
    say('attack', dmg === 0 ? k('attackCrack') : k('attackHit'), { who: r.handle, enemy: E(e.n) }, { ...named, ...flag, ...pz.line, enemy: e.n, success: true, damage: dmg, roll: rollOf(x), left: e.hp, cracked, strong: x.strong }); // strong: the stage shows a critical hit's number bigger (2026-11-19)
    landed(r, e, dmg, named, flag);
    if (cracked && dmg === 0) landed(r, e, dmg, named, flag, 'onCrack');
  };

  // A hall's own turret (a raid): fires on its own at the nearest raider, until it is dry.
  const tu = b.turret;
  if (tu && tu.left > 0 && enemiesUp(b).length) {
    const lay = b.spots ? layoutFight(b) : null;
    const pos = (e) => lay?.units?.[enemyUnit(e.n)]?.at ?? null;
    const near = (e) => (tu.at && pos(e) ? Math.hypot(pos(e)[0] - tu.at[0], pos(e)[1] - tu.at[1]) : 0);
    const e = [...enemiesUp(b)].sort((p, q) => near(p) - near(q) || p.n - q.n)[0];
    tu.left -= 1;
    const x = roll(tu.aim, attackDiff(b.diff) + FIGHT.attackStep + FIGHT.cover[e.cover], strongMargin());
    const meta = { actor: null, at: tu.at ?? null, enemy: e.n, left: tu.left };
    if (!x.ok) say('turret', 'turretMiss', { enemy: E(e.n) }, { ...meta, success: false, damage: 0, roll: rollOf(x) });
    else {
      const { dmg, cracked } = landHit(e, hitOf(tu.damage), x.strong, false, rng);
      if (e.hp <= 0) { e.out = true; defeated.push({ by: null, enemy: e.n, how: 'turret' }); say('turret', 'turretOut', { enemy: E(e.n) }, { ...meta, success: true, damage: dmg, dropped: true, roll: rollOf(x), cracked }); }
      else say('turret', dmg === 0 ? 'turretCrack' : 'turretHit', { enemy: E(e.n) }, { ...meta, success: true, damage: dmg, roll: rollOf(x), enemy: e.n, cracked });
    }
    if (tu.left === 0) say('turret', 'turretDry', {}, { ...meta, success: null });
  }

  const boards = []; const carries = []; let workBy = null;
  for (const a of actions) {
    const r = a.r; const named = { actor: r.id, order: a.order.duty, from: a.from };
    switch (a.kind) {
      case 'attack': strike(r, a.enemy, named, false); break;
      case 'burst': {
        // The runner's move (Ricochet): one attack on each target in the rules' order, each from where the last landed. Spent for the fight.
        // Sequential retargeting: a planned target that has fallen since the plan (a teammate shot first) hands its bounce to the next enemy up.
        r.moved = true;
        const struck = new Set();
        for (const n of a.enemies) {
          const gone = (x) => x.out || x.fled;
          const next = gone(b.enemies.find((x) => x.n === n)) ? enemiesUp(b).find((x) => !struck.has(x.n) && !a.enemies.includes(x.n))?.n : n;
          if (next == null) continue;
          struck.add(next); strike(r, next, named, true);
        }
        break;
      }
      case 'jam': {
        const x = roll(sv(r, 'tech'), b.diff + FIGHT.jamStep);
        if (!x.ok) { say('jam', 'jamFail', { who: r.handle }, { ...named, roll: rollOf(x) }); break; }
        for (const t of b.threats) if (RADIO(t)) t.cancelled = true;
        const drone = enemiesUp(b).find((e) => ENEMIES[e.kind].jamTakesOut);
        if (drone) { drone.out = true; defeated.push({ by: r.id, enemy: drone.n, how: 'jam' }); }
        say('jam', 'jamOk', { who: r.handle }, { ...named, roll: rollOf(x), droppedEnemy: drone?.n ?? null, callers: b.threats.filter((t) => RADIO(t)).map((t) => t.enemy) });
        break;
      }
      case 'stabilise': {
        const x = roll(sv(r, 'medical'), b.diff + FIGHT.stabiliseStep); const t = runner(b, a.target);
        if (x.ok && t.down && !t.dead) { t.stable = true; say('stabilise', 'stabilise', { who: r.handle, target: t.handle }, { ...named, roll: rollOf(x), target: t.id, targetId: t.id, success: true }); }
        else say('stabilise', 'stabiliseFail', { who: r.handle, target: t.handle }, { ...named, roll: rollOf(x), target: t.id, targetId: t.id, success: false });
        break;
      }
      case 'patch': {
        const x = roll(sv(r, 'medical'), b.diff + FIGHT.patchStep); const t = runner(b, a.target);
        if (x.ok && !t.down) { t.hp = Math.min(t.max, t.hp + FIGHT.patchHeal); say('patch', 'patch', { who: r.handle, target: t.handle }, { ...named, roll: rollOf(x), target: t.id, targetId: t.id, success: true, heal: FIGHT.patchHeal }); }
        else say('patch', 'patchFail', { who: r.handle, target: t.handle }, { ...named, roll: rollOf(x), target: t.id, targetId: t.id, success: false });
        break;
      }
      // Reaching the van needs no roll (2026-11-13): the cost is the round spent in the open, and the door slots.
      case 'board': {
        boards.push(r);
        say('board', 'board', { who: r.handle }, named);
        break;
      }
      case 'carry': {
        const t = runner(b, a.target);
        boards.push(r); carries.push({ by: r, t });
        say('carry', 'carry', { who: r.handle, target: t.handle }, { ...named, target: t.id });
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
    if (b.ambush && b.round === 1 && t.kind === 'aim') continue; // the crew had the jump on them: no shot in round 1 (b.ambush is set by runfight.js startFight)
    if (t.kind === 'aim') {
      const v = runner(b, t.target);
      if (!v || v.down || v.dead || v.withdrawn || v.aboard) continue;
      // Switched off (2026-11-20, the Cytotoxic sweep): a payload's `dot.weaken` ({ aim, hitShare }) takes `aim` off an infected shooter's chance
      // and scales its hit. No payload in the game sets it; if one ever does, the telegraph and the preview must show it too (shown risk = used risk).
      const wk = e.infected && PAYLOADS[e.infected.payload]?.dot?.weaken;
      const c = Math.max(0, aimChance(b, v, { hunker: v.hunker, open: v.boarding }) - (wk?.aim ?? 0));
      const hit = rng() < c;
      const slots = { enemy: E(e.n), who: v.handle };
      const named = { actor: null, target: v.id, enemy: e.n, chance: c, shieldedBy: t.shieldedBy };
      if (!hit) { say('shot', 'shotMiss', slots, { ...named, targetId: v.id, success: false, damage: 0 }); continue; }
      if (v.absorb > 0) { v.absorb -= 1; say('shot', 'shotAbsorbed', slots, { ...named, targetId: v.id, success: false, damage: 0 }); continue; } // plates: fights saved before v80 only
      const tHit = wk?.hitShare != null ? Math.round(t.hit * wk.hitShare) : t.hit;
      const lands = landsOn(v, tHit); const soaked = tHit - lands; if (soaked > 0) named.soaked = soaked;
      const dmg = Math.min(v.hp, lands); v.hp -= dmg; b.hpLost += dmg;
      if (v.hp <= 0) {
        // A runner pulling out alone dies only when the player ordered that withdrawal by hand; otherwise death's door like anyone else.
        if (v.leaving && v.ordered) { v.dead = true; down.push(v.id); say('shot', 'shotDead', slots, { ...named, targetId: v.id, success: true, damage: dmg, dead: true }); }
        else { v.down = true; v.downRound = b.round; down.push(v.id); say('shot', 'shotDown', slots, { ...named, targetId: v.id, success: true, damage: dmg, down: true }); }
      } else say('shot', 'shotHit', slots, { ...named, targetId: v.id, success: true, damage: dmg, left: v.hp });
    } else if (t.kind === 'flank') {
      const v = runner(b, t.target);
      if (v && present(v)) { v.cover = 'open'; say('shot', 'flanked', { enemy: E(e.n), who: v.handle }, { target: v.id, enemy: e.n }); }
    } else if (t.kind === 'backup') {
      if (b.extras < b.maxExtra) { b.extras += 1; b.arriving.push(e.kind); say('radio', 'backupCalled', { enemy: E(e.n) }, { enemy: e.n }); }
    } else if (t.kind === 'alarm') alarms += 1;
  }
  for (const r of b.runners) if (r.leaving && !r.dead && !r.down) { r.withdrawn = true; withdrawn.push(r.id); say('withdraw', 'withdrew', { who: r.handle }, { actor: r.id }); }
  for (const r of b.runners) { r.leaving = false; r.ordered = false; }
  // Slice 3-ii-a: the vector's tick, at the round's end and before the groups' flee checks, so a tick is a loss like any other. An enemy
  // infected this round starts losing HP next round (ticksDue). Past the payload's last round the infection ends.
  // Part B: `burning` ticks the same way after the infection (its own line keys); a body the first tick dropped takes no second.
  const TICK_LINE = { infected: ['tick', 'tickOut', 'vector'], burning: ['burnTick', 'burnOut', 'burn'] };
  for (const { e, st } of ticksDue(b)) {
    if (e.out) continue;
    const inf = e[st];
    const [onKey, outKey, how] = TICK_LINE[st];
    e.hp -= inf.tick;
    if (inf.left != null && (inf.left -= 1) <= 0) e[st] = null;
    const word = PAYLOADS[inf.payload]?.word ?? 'Vector';
    if (e.hp <= 0) { e.out = true; e[st] = null; defeated.push({ by: inf.by, enemy: e.n, how }); say('tick', outKey, { enemy: E(e.n), word }, { enemy: e.n, damage: inf.tick, dropped: true, left: 0, max: e.max, status: st }); fall(e, null, [inf, ...STATUSES.map((x) => e[x])]); }
    else say('tick', onKey, { enemy: E(e.n), word }, { enemy: e.n, damage: inf.tick, left: e.hp, max: e.max, status: st });
    const gr = PAYLOADS[inf.payload]?.dot?.grow; if (gr) inf.tick = Math.min(gr.cap, inf.tick + gr.per); // switched off: see `put`
  }
  // 3c: the hired and the standard force break and run per group, when too few of that group are left (hired's threshold).
  // An enemy in its approach round never runs (this check comes before `approaching` is cleared below). A lone arrival never runs.
  for (const [g, total] of Object.entries(b.hiredTotal)) {
    const up = enemiesUp(b).filter((e) => breaks(e.kind) && (e.group ?? 0) === Number(g));
    const going = up.filter((e) => !e.approaching);
    const holding = up.filter((e) => !e.shaken); // part B: a shaken body counts as gone for its group's nerve
    if (going.length && total > 0 && holding.length / total < ENEMIES.hired.fleeBelow) { for (const e of going) { e.fled = true; fled.push(e.n); } say('flee', 'enemyFled'); }
  }

  // The medic's aura: while a medic stands in the fight, the most hurt standing runner regains medicAura.heal HP a
  // round and downed teammates don't bleed. Always on, whatever the medic does; no action.
  const aura = b.runners.some((r) => r.medic && present(r));
  if (aura) {
    const hurt = firstBy(standing(b).filter((r) => r.hp < r.max), (x, y) => x.hp / x.max - y.hp / y.max || bySeat(x, y));
    const medic = b.runners.find((r) => r.medic && present(r));
    if (hurt) { hurt.hp += FIGHT.medicAura.heal; say('aura', 'aura', { who: medic.handle, target: hurt.handle }, { actor: medic.id, target: hurt.id, targetId: hurt.id, left: hurt.hp, max: hurt.max, heal: FIGHT.medicAura.heal }); } // targetId, left and max are what the stage draws (the medic's glow, the orb, the pip filling)
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
  // The hack is done: the alarm brings the opening force's like in again (they arrive together next round), and the way out begins. The work is finished, so the tech stops being the one to cover.
  if (b.type === 'holdHack' && b.wayOut && b.stage === 0 && b.goal.work >= FIGHT.workNeeded) {
    b.stage = 1; b.arriving.push(...b.wayOut);
    say('wayOut', 'wayOut', { n: b.wayOut.length });
  }
  for (const r of boards) if (!r.down && !r.dead) { r.aboard = true; say('van', 'inVan', { who: r.handle }, { actor: r.id }); result.goalDelta += 1; }
  for (const c of carries) if (c.by.aboard) { c.t.aboard = true; say('van', 'carriedInVan', { target: c.t.handle }, { target: c.t.id }); }
  if (b.type === 'holdHack') {
    b.clock -= CLOCKS.alarm.tickPerRound + alarms;
    if (b.clock <= 0) { if (b.extras < b.maxExtra) { b.extras += 1; b.arriving.push(reinforceKind(b)); say('clock', 'alarmClock'); } b.clock = CLOCKS.alarm.resetTo; }
  } else {
    b.nextPressure -= alarms * CLOCKS.pressure.alarmBringsForward;
    if (b.type === 'holdExtract' && b.stage === 0 && b.round >= b.goal.vanRound) { b.stage = 1; b.goal.vanLeaves = b.round + FIGHT.vanWait; say('van', 'vanIn', { leaves: b.goal.vanLeaves }); }
  }

  // Unanswered threats (for the report): shots not shielded, radio calls not jammed.
  result.unanswered = b.threats.filter((t) => !t.cancelled && !t.shieldedBy && (t.kind === 'aim' || RADIO(t))).map((t) => ({ threat: t.id, target: t.target }));
  b.drawn = false;
  checkEnd(b, rng, say);
  for (const e of b.enemies) e.approaching = false; // 3a: the approach round is over (after the flee check, which skips them)
  expireOverride(b);
  result.ended = b.end;
  // The heat since the last round was reported, including the early van, which startRound adds before playRound (core/runfight.js calls it first).
  result.heat = b.heat - (b.heatReported ?? 0);
  b.heatReported = b.heat;
  return result;
}

// --- the end ---------------------------------------------------------------------------------------

/** The fight's objective is done: won, or (a hack) broken off on the way out, with the work already finished. The planning odds' `win` and the run's pay read the same thing. */
export const objectiveDone = (b) => b.end?.result === 'won' || (b.end?.result === 'extracted' && b.type === 'holdHack' && b.stage === 1);

function finish(b, result, key, slots = {}) { b.end = { result, key, text: lineText(key, slots), slots }; return b.end; }

/** The end checks of a round (spec 15), in the sim's order; sets b.end. Draws only for a runner left behind down on committed. */
function checkEnd(b, rng, say) {
  const prot = b.goal.protect ? runner(b, b.goal.protect) : null;
  // The medic's hands on the way out (2026-11-17): before the crew leaves a hack's way out, a healer still standing gets one stabilise roll for each runner who is down, so
  // a runner a medic reaches does not come home with the serious injury. Without a healer standing nothing changes. The roll is the stabilise action's own.
  const treatWayOut = () => {
    const healer = b.runners.filter((x) => x.healer && present(x)).sort((x, y) => sv(y, 'medical') - sv(x, 'medical') || bySeat(x, y))[0];
    const hurt = healer ? standing(b).filter((x) => x.hp < x.max) : [];
    for (const x of hurt) x.hp = Math.min(x.max, x.hp + FIGHT.wayOutTreatHeal);
    if (hurt.length) say('patch', 'wayOutPatch', { who: healer.handle, n: hurt.length }, { actor: healer.id, targets: hurt.map((x) => x.id), heal: FIGHT.wayOutTreatHeal });
    for (const t of b.runners.filter((x) => x.down && !x.stable && !x.dead && !x.withdrawn)) {
      // A healer first; with none standing, anyone still on their feet steadies the downed on their own medical stat (2026-11-19).
      const medic = healer ?? b.runners.filter((x) => present(x) && !x.down).sort((x, y) => sv(y, 'medical') - sv(x, 'medical') || bySeat(x, y))[0];
      if (!medic) return;
      const value = sv(medic, 'medical'); const die = d20(rng); const need = 10 + b.diff + FIGHT.wayOutTreatStep; const ok = die + value >= need;
      if (ok) t.stable = true;
      say('stabilise', ok ? 'stabiliseWayOut' : 'stabiliseFail', { who: medic.handle, target: t.handle }, { actor: medic.id, target: t.id, targetId: t.id, success: ok, roll: { die, need, value, success: ok } });
    }
  };
  if (b.type === 'holdHack' && b.goal.work >= FIGHT.workNeeded && !b.wayOut) return finish(b, 'won', 'end.won');
  // The way out: won by rout, every enemy out or fled and none on the way (as the yard is).
  if (b.type === 'holdHack' && b.stage === 1 && !enemiesUp(b).length && !b.arriving.length) { treatWayOut(); return finish(b, 'won', 'end.wayOutWon'); }
  // The yard: won by rout, every enemy out or fled and none on the way (the pressure clock may still bring more before then).
  if (b.type === 'holdYard' && !enemiesUp(b).length && !b.arriving.length) return finish(b, 'won', 'end.routed');
  // The hall: won by rout, or held when the raiders back off at the round cap with the door still ours.
  if (b.type === 'holdHall' && !enemiesUp(b).length) return finish(b, 'won', 'end.routed');
  if (b.type === 'holdHall' && b.cap && b.round >= b.cap && standing(b).length) return finish(b, 'held', 'end.held');
  if (boardingStage(b) && !standing(b).length && !outsideDown(b).length) {
    const lost = b.runners.filter((r) => r.dead || r.withdrawn);
    return lost.length ? finish(b, 'lostRunner', 'end.lostRunner', { who: nameList(lost.map((r) => r.handle)) }) : finish(b, 'won', 'end.won');
  }
  const techMatters = !(b.type === 'holdHack' && b.stage === 1); // on the way out the work is done: the tech is one of the crew
  if (prot && techMatters && (prot.down || prot.dead)) return finish(b, 'lost', 'end.lost', { who: prot.handle });
  if (prot && techMatters && prot.withdrawn) return finish(b, 'abandoned', 'end.abandoned', { who: prot.handle });
  const outside = outsideDown(b);
  // Someone down whom nobody has chosen to fight on for pulls the crew back (a watched crew is asked first, runfight.js); a runner already pushed on for does not.
  if (!boardingStage(b) && !committed(b) && b.runners.some((r) => r.down && !r.dead && !r.fightOn)) {
    if (b.type === 'holdHack' && b.stage === 1) { treatWayOut(); return finish(b, 'extracted', 'end.wayOutPulled'); }
    return finish(b, 'extracted', 'end.extracted');
  }
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
  if (b.deadline && b.round >= b.deadline && b.type === 'holdHack' && b.stage === 0) return finish(b, 'deadline', 'end.deadline');
  return null;
}

/** Pulling back by hand, at any decision point: the crew leaves the objective (spec 2). Parting shots are the run's side. */
export function pullBack(b) {
  if (!b.end) finish(b, 'pulledBack', 'end.pulledBack');
  return b.end;
}

/** The injury HP left mean (none, light, serious) for someone still standing: light below half, serious below a quarter. */
export function injuryFromHp(r) {
  const share = r.hp / r.max;
  return share < FIGHT.seriousBelow ? 'serious' : share < FIGHT.lightBelow ? 'light' : 'none';
}

/**
 * What the fight did to each runner, for the run to write back: { id, hp, max, injury, dead, missing,
 * down }. A downed runner is critical (death's door, as in engine 1); a runner left behind is missing
 * (slice 4 builds the 7 days); a dead runner stays dead. Reads the fight; changes nothing.
 */
export function outcomeOf(b) {
  return b.runners.map((r) => ({
    id: r.id, hp: r.hp, max: r.max, dead: r.dead, missing: r.left && !r.dead, down: r.down && !r.dead,
    injury: r.dead ? 'dead' : r.down ? 'critical' : injuryFromHp(r),
  }));
}

// --- hands-off play and the planning read -----------------------------------------------------------

/**
 * The planning read's odds for a fight not yet built (the run draws the enemies' line-up and decks when it starts): the
 * same read averaged over several line-ups on fixed seeds, `builds` of them with `runs` fights each (buildFight's own
 * arguments). { win, down, dead, left }. Hands-off on the orders given (the crew's defaults), at the risk level given.
 */
export function fightOddsFor(args, { builds = 6, runs = 20 } = {}) {
  const tallies = fightTallies(args, { builds, runs });
  if (!tallies) return { win: 0, down: 1, dead: 0, left: 0, lost: 0 };
  for (const t of tallies) finishTally(t);
  return oddsOfBuilds(tallies.map((t) => t.out));
}

/** fightOddsFor's sum over the line-ups' odds (in order, so a bound made from it holds to the last bit). */
function oddsOfBuilds(outs) {
  const acc = { win: 0, down: 0, dead: 0, left: 0, lost: 0 };
  for (const r of outs) for (const k of Object.keys(acc)) acc[k] += r[k] / outs.length;
  return acc;
}

/**
 * fightOddsFor a few fights at a time (2026-11-14, the board's search: core/squad.js plays a fight only as far as its
 * answer matters). The line-ups' tallies (fightTally), or null with nobody to send. winRange(tallies) bounds the win share
 * from the fights played so far; once every tally is finished, fightOddsFor's answer is oddsOfBuilds of their outs.
 */
export function fightTallies(args, { builds = 6, runs = 20 } = {}) {
  if (!args.crew.length) return null;
  const out = [];
  for (let i = 0; i < builds; i++) out.push(fightTally(buildFight(args, makeRng(0xf1647 + i * 104729)), runs));
  return out;
}

/** The win share fightOddsFor would give, at least and at most, from the fights its tallies have played so far: [lo, hi]. */
export function winRange(tallies) {
  if (!tallies) return [0, 0];
  const lo = oddsOfBuilds(tallies.map((t) => ({ win: t.out ? t.out.win : t.n.win / t.runs, down: 0, dead: 0, left: 0, lost: 0 }))).win;
  const hi = oddsOfBuilds(tallies.map((t) => ({ win: t.out ? t.out.win : (t.n.win + t.runs - t.done) / t.runs, down: 0, dead: 0, left: 0, lost: 0 }))).win;
  return [lo, hi];
}

/** The whole answer once every tally is finished (fightOddsFor's), or null while any is still playing. */
export const talliesOdds = (tallies) => (!tallies ? { win: 0, down: 1, dead: 0, left: 0, lost: 0 } : tallies.every((t) => t.out) ? oddsOfBuilds(tallies.map((t) => t.out)) : null);

/** Play up to `k` more fights in each unfinished tally. Returns false once all are finished. */
export function stepTallies(tallies, k) {
  if (!tallies) return false;
  let more = false;
  for (const t of tallies) if (!t.out) { stepTally(t, k); more ||= !t.out; }
  return more;
}

/**
 * A copy of a fight for a play that throws it away (the odds' and the van read's fights; 2026-11-17, the speed pass): what
 * structuredClone(b) gives (core/copy.js copier), only quicker. The parts no round ever writes into are kept, not copied
 * (KEPT): each order (b.orders' entries: an order that changes is replaced whole) and each runner's stats and build. A copy
 * shares them with `b`, so a fight played on it plays exactly as on structuredClone's; tests/copyfight.test.js freezes them
 * and plays fights to keep that true.
 */
export const copyFight = (b) => copierFor(b)();

/**
 * copyFight for many copies of one fight that does not change between them (a tally's b0, the van read's fight): the kept
 * parts are found once. Returns a function that makes a copy of `b` as it was.
 */
export const copierFor = (b) => copier(b, KEPT(b));

/** The parts of a fight that no round writes into (see copyFight). */
export const KEPT = (b) => [
  ...(b.orders && typeof b.orders === 'object' ? Object.values(b.orders) : []),
  ...(Array.isArray(b.runners) ? b.runners.flatMap((r) => (r && typeof r === 'object' ? [r.stats, r.build] : [])) : []),
];

/** Play a whole fight on its orders, round by round, until it ends (hands-off: the risk level answers the van). */
export function playFight(b, rng, maxRounds = 30) {
  const was = wordless;
  wordless = true; // its rounds' lines are thrown away: no wording (see wordOf)
  try { while (!b.end && b.round < maxRounds) playRound(b, rng); } finally { wordless = was; }
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
  const copy = copierFor(b0);
  const read = (hold) => {
    let left = 0;
    for (let i = 0; i < runs; i++) {
      const b = copy();
      b.showcaseSeed = hash('van', hold, i); // reseeded, never drawn: the odds streams do not move
      b.vanHold = hold;
      playFight(b, makeRng(0x7a11 + i * 7919));
      if (outside.some((id) => b.left.includes(id))) left += 1;
    }
    return left / runs;
  };
  return { outside, leaveOnTime: read(false), hold: read(true) };
}

/**
 * What the odds depend on (the cache key). Everything the round function reads that planning can change: the fight's type, risk and goal,
 * each enemy (including the approach stage and its group, which the flee rule reads), each runner (including Overdrive), the orders,
 * overwatch, and the rules a recipe adds (waves still to come, the reinforcement cap, showcase eligibility). showcaseSeed is not in it:
 * every run reseeds it.
 */
export function oddsKey(b0, runs = FIGHT.oddsRuns) {
  return JSON.stringify([b0.type, b0.diff, b0.risk, b0.goal,
    b0.enemies.map((e) => [e.kind, e.hp, e.max, e.absorb, e.cover, e.deck, e.approaching ?? false, e.group ?? 0, ...STATUSES.map((st) => e[st] ?? null)]),
    b0.runners.map((r) => [r.id, r.hp, r.max, r.absorb, r.soak ?? 0, r.ap, r.strong, r.hit ?? null, r.jammer, r.healer, Object.values(r.stats).map((s) => s.value), r.overdrive ?? null, r.build ?? null, r.moved ?? false, r.misses ?? 0]),
    b0.orders, b0.overwatch && [b0.overwatch.value, b0.overwatch.damage, b0.overwatch.left], !!b0.wheels, !!b0.standby,
    b0.toughness ?? 0, b0.showcaseEligible ?? null, b0.maxExtra ?? null, b0.recipe ?? null, b0.hiredTotal ?? null, runs]);
}

const oddsCache = new Map();
// Fights played so far for odds not yet finished (stepTally), by the same key. Never read as odds: only a finished tally's
// answer goes into oddsCache. Kept so a read that stopped early can carry on later without playing the same fights again.
const partial = new Map();

/**
 * How a fight goes on its orders with this team, played FIGHT.oddsRuns times with the same round function on
 * fixed seeds: { win, down, dead, left } as shares (down: someone hit 0 HP; dead: someone died; left:
 * someone was left behind). The planning read shows these; shown = used.
 */
export function fightOdds(b0, runs = FIGHT.oddsRuns) {
  return finishTally(fightTally(b0, runs)).out;
}

/**
 * fightOdds as a tally that can be played a few fights at a time (2026-11-14): { b0, key, runs, done, n, out }. `out` is
 * fightOdds' answer once all `runs` fights are played (from the cache if they were before), else null. Each fight is the
 * same fight, on the same seed, as fightOdds plays, so the order they are played in changes nothing.
 */
export function fightTally(b0, runs = FIGHT.oddsRuns) {
  if (!b0.runners.length) return { b0, key: null, runs, done: runs, n: null, out: { win: 0, down: 1, dead: 0, left: 0, lost: 0 } };
  const key = oddsKey(b0, runs);
  if (oddsCache.has(key)) return { b0, key, runs, done: runs, n: null, out: oddsCache.get(key) };
  const t = partial.get(key) ?? { b0, key, runs, done: 0, n: { win: 0, down: 0, dead: 0, left: 0, lost: 0 }, out: null };
  if (partial.size > 2000) partial.clear();
  partial.set(key, t);
  return t;
}

/** Play up to `k` more of a tally's fights; when the last is played, its answer goes into the cache. Returns the tally. */
export function stepTally(t, k = Infinity) {
  if (t.out) return t;
  const { b0, n, runs } = t;
  for (const end = Math.min(runs, t.done + k); t.done < end; t.done++) {
    const i = t.done;
    const b = (t.copy ??= copierFor(b0))(); // b0 is the tally's own and never changes (fightTallies builds it; fightOdds plays it out at once)
    b.showcaseSeed = hash('odds', i); // reseeded, never drawn, and so not in the cache key
    playFight(b, makeRng(0x5eed + i * 7919));
    if (objectiveDone(b)) n.win += 1;
    if (b.runners.some((r) => r.down || r.dead)) n.down += 1;
    if (b.runners.some((r) => r.dead)) n.dead += 1;
    if (b.left.length) n.left += 1;
    if (b.runners.some((r) => r.dead) || b.left.length) n.lost += 1; // someone died or was left behind (the plan's "chance of losing someone")
  }
  if (t.done < runs) return t;
  t.out = { win: n.win / runs, down: n.down / runs, dead: n.dead / runs, left: n.left / runs, lost: n.lost / runs };
  partial.delete(t.key);
  if (oddsCache.size > 2000) oddsCache.clear();
  oddsCache.set(t.key, t.out);
  return t;
}
const finishTally = (t) => stepTally(t, Infinity);
