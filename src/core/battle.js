// Battles (PLAN-CORE-LOOP.md, slice 6; DESIGN.md 2026-10-29). Pure logic: building the two
// sides, playing one round, and the planning read's fight odds, which run this same round
// function many times on fixed seeds (shown risk equals used risk). core/mission.js owns the run:
// when a fight starts, the call-ins, pulling back, and what HP left turns into.
//
// A battle object (am.battle, save v26):
//   { incident, zone, diff, round, guards: [guard], runners: [runner], overwatch, wheels,
//     lights, van, door: [opId] }
// guard  { n, hp, max, armour, damage, out }            out: down, or talked into backing off
// runner { id, handle, hp, max, armour, armourName, damage, weapon, stats, patch,
//          down, fightOn, stable }                     stats: { stat: { value, notes } }
//
// Death's door: a runner at 0 HP is down, never dead. Only after the player chooses to keep
// fighting (fightOn) can they die, and that runs through the existing "push on" rule (am.untreated).

import { BATTLE } from '../data/battle.js';
import { GEAR, TIERS } from '../data/gear.js';
import { ZONES } from '../data/incidents.js';
import { carried, itemName, overwatchKit, patchBonus } from './gear.js';
import { effectiveStat } from './crew.js';
import { d20, makeRng } from './rng.js';

export { BATTLE };

const FIGHT_STATS = ['combat', 'cool', 'medical', 'social', 'tech'];
const step = (item) => TIERS[item?.tier]?.step ?? 0;

/**
 * A loud run is a fight (owner, 2026-10-29: "every loud run pretty much"): on a loud approach, or
 * once the crew has gone loud, the first danger incident with guards in it always becomes a fight,
 * whatever the roll. After that the usual rule holds: only an unsaved failure starts one.
 */
export const loudFightDue = (am, inc) => Boolean((am.approach === 'loud' || am.wentLoud) && inc.danger && inc.guards && !am.fought);

/** Their health in a fight: base + cool. */
export const maxHp = (op) => BATTLE.hp + Math.floor((op.stats.cool ?? 0) / BATTLE.hpPerCool);

/** What they shoot with: { name, damage }. Nothing in the weapon slot means a street piece. */
export function weaponOf(op) {
  const item = op.gear?.weapon;
  const dmg = item && GEAR[item.type]?.damage;
  return dmg ? { name: itemName(item), damage: dmg + step(item) } : { ...BATTLE.unarmed };
}

/** Their armour in a fight: { name, value } (flat soak per hit), value 0 if none. */
export function armourOf(op) {
  const item = carried(op).find((i) => GEAR[i.type]?.armour);
  return item ? { name: itemName(item), value: GEAR[item.type].armour + step(item) } : { name: null, value: 0 };
}

/** The guards a fight starts with: the incident's count (one more on threat 4+), toughened by threat. */
export function guardsFor(threat, count) {
  const t = Math.max(1, Math.min(5, Math.round(threat)));
  const n = count + (t >= BATTLE.extraGuardFrom ? 1 : 0);
  return Array.from({ length: n }, (_, i) => ({ n: i + 1, hp: BATTLE.guardHp[t], max: BATTLE.guardHp[t], armour: BATTLE.guardArmour[t], damage: BATTLE.guardDamage[t], out: false }));
}

/** A runner as they enter a fight: their numbers, read once (gear, traits and the approach included). */
export function runnerOf(op, approach) {
  const max = maxHp(op);
  const hurt = op.condition?.injury === 'light' ? BATTLE.lightWound : 0;
  const w = weaponOf(op);
  const a = armourOf(op);
  return {
    id: op.id, handle: op.handle, hp: max - hurt, max, armour: a.value, armourName: a.name, damage: w.damage, weapon: w.name,
    stats: Object.fromEntries(FIGHT_STATS.map((s) => [s, effectiveStat(op, s, { approach })])),
    patch: patchBonus(op), down: false, fightOn: false, stable: false,
  };
}

/** Overwatch in this fight, if it can see the zone and has a use left: one shot or drone action a round. */
export function overwatchOf(op, ow, zone) {
  const kit = op && ow ? overwatchKit(op, ow.kit) : null;
  if (!kit || !(ow.left > 0) || !(kit.indoors || ZONES[zone]?.open)) return null;
  const s = effectiveStat(op, kit.stat);
  const item = carried(op).find((i) => i.type === ow.kit);
  return {
    id: op.id, handle: op.handle, kit: ow.kit, name: kit.name, stat: kit.stat, value: s.value + kit.bonus,
    notes: [`${kit.name.toLowerCase()} from overwatch`, ...kit.notes, ...s.notes],
    damage: (GEAR[ow.kit].overwatch.damage ?? 0) + step(item), left: ow.left, heat: kit.heat, heatOnHit: kit.heatOnHit, neural: kit.neural,
  };
}

/**
 * Build a fight. crew: the inside team still standing (operatives). overwatchOp/ow: the run's
 * overwatch (am.overwatch). wheels: the driver in the van, who can bring it round.
 */
export function buildBattle({ incident, zone, diff, threat, guards, crew, approach, overwatchOp = null, ow = null, wheels = null, ambush = false }) {
  return {
    incident, zone, diff, round: 0, ambush,
    guards: guardsFor(threat, guards),
    runners: crew.map((op) => runnerOf(op, approach)),
    overwatch: overwatchOf(overwatchOp, ow, zone),
    wheels: wheels ? { id: wheels.id, handle: wheels.handle, ...effectiveStat(wheels, 'driving', { approach }) } : null,
    lights: false, van: false, door: [],
  };
}

const up = (b) => b.guards.filter((g) => !g.out);
const standing = (b) => b.runners.filter((r) => !r.down);
const roll = (rng, value, diff) => { const die = d20(rng); return { die, need: 10 + diff, success: die + value >= 10 + diff }; };
const guardName = (g, b) => (b.guards.length > 1 ? `guard ${g.n}` : 'the guard');

/** The one hit rule: armour comes off every hit, and a hit that lands always does at least 1. */
export const hitFor = (damage, armour) => Math.max(1, damage - armour);

/**
 * What a runner does with their turn, by the same rule every time (no player input): get a downed
 * teammate stabilised, patch someone badly hurt, then their lean (talk, lights) if it beats their
 * shooting, else shoot. Returns { kind, stat, target }.
 */
export function actionFor(r, b) {
  const s = (k) => r.stats[k].value;
  const medic = s('medical') + r.patch >= BATTLE.patchMin;
  const dying = b.runners.find((x) => x.down && x.fightOn && !x.stable);
  if (medic && dying) return { kind: 'stabilise', stat: 'medical', target: dying.id };
  const hurt = standing(b).filter((x) => x.hp < x.max * BATTLE.lightBelow).sort((a, c) => a.hp / a.max - c.hp / c.max)[0];
  if (medic && hurt && s('medical') > s('combat')) return { kind: 'patch', stat: 'medical', target: hurt.id };
  if (s('social') >= s('combat') + BATTLE.lean && up(b).length) return { kind: 'talk', stat: 'social' };
  if (s('tech') >= s('combat') + BATTLE.lean && !b.lights) return { kind: 'lights', stat: 'tech' };
  return { kind: 'shoot', stat: 'combat' };
}

/** The guard a shot goes at: the most hurt first, so the crew finishes what it starts. */
const targetOf = (b) => up(b).sort((a, c) => a.hp - c.hp || a.n - c.n)[0];

/**
 * Play one round, mutating the battle. Order: overwatch, the inside team, Wheels, then every guard
 * still up goes for someone standing; then the last guard, if badly hurt, breaks and runs. Returns
 * { lines, heat, neural, down, fled } where lines are the moments for the feed (each with its roll,
 * but for a guard running), heat and neural what overwatch spent, down the runners who hit 0 HP
 * this round, and fled whether a guard ran (the run raises the alert for it).
 */
export function playRound(b, rng) {
  b.round += 1;
  const lines = [];
  const down = [];
  let heat = 0;
  let neural = 0;
  const line = (x) => { lines.push(x); return x; };

  const ow = b.overwatch;
  if (ow && ow.left > 0 && up(b).length) {
    const g = targetOf(b);
    const r = roll(rng, ow.value, b.diff + BATTLE.shootStep + BATTLE.overwatchStep);
    ow.left -= 1;
    if (!ow.heatOnHit || r.success) heat += ow.heat;
    neural += ow.neural;
    const dmg = r.success ? hitFor(ow.damage, g.armour) : 0;
    g.hp = Math.max(0, g.hp - dmg);
    if (g.hp === 0) g.out = true;
    const what = ow.kit === 'drone' ? 'tases' : 'hits';
    line({ kind: 'overwatch', actor: { id: ow.id, handle: ow.handle }, kit: ow.kit, target: guardName(g, b), stat: ow.stat, value: ow.value, notes: ow.notes, ...r, damage: dmg, armour: g.armour, dropped: g.out,
      text: r.success ? `${ow.handle} ${what} ${guardName(g, b)} from overwatch for ${dmg}${g.armour ? ` (armour ${g.armour})` : ''}${g.out ? '. Down.' : '.'}` : `${ow.handle}'s ${ow.kit === 'drone' ? 'drone misses' : 'shot goes wide'}.` });
  }

  for (const r of standing(b)) {
    if (!up(b).length && !b.runners.some((x) => x.down && x.fightOn && !x.stable)) break;
    const act = actionFor(r, b);
    const st = r.stats[act.stat];
    const base = { kind: act.kind, actor: { id: r.id, handle: r.handle }, stat: act.stat, value: st.value, notes: st.notes };
    if (act.kind === 'stabilise') {
      const t = b.runners.find((x) => x.id === act.target);
      const k = roll(rng, st.value, BATTLE.stabilise);
      if (k.success) t.stable = true;
      line({ ...base, ...k, target: t.handle, targetId: t.id, text: k.success ? `${r.handle} gets to ${t.handle} and stops the bleeding.` : `${r.handle} can't get to ${t.handle} under fire.` });
    } else if (act.kind === 'patch') {
      const t = b.runners.find((x) => x.id === act.target);
      const k = roll(rng, st.value, b.diff);
      const heal = k.success ? Math.min(t.max - t.hp, BATTLE.patchHeal + r.patch) : 0;
      t.hp += heal;
      line({ ...base, ...k, target: t.handle, heal, text: k.success ? `${r.handle} patches ${t === r ? 'themself' : t.handle} up: +${heal}.` : `${r.handle} can't patch ${t === r ? 'themself' : t.handle} up under fire.` });
    } else if (act.kind === 'talk') {
      const g = up(b).sort((a, c) => c.hp - a.hp || a.n - c.n)[0];
      const k = roll(rng, st.value, b.diff + BATTLE.talkStep);
      if (k.success) g.out = true;
      line({ ...base, ...k, target: guardName(g, b), text: k.success ? `${r.handle} talks ${guardName(g, b)} into backing off.` : `${r.handle} tries to talk ${guardName(g, b)} down. Nobody's listening.` });
    } else if (act.kind === 'lights') {
      const k = roll(rng, st.value, b.diff);
      if (k.success) b.lights = true;
      line({ ...base, ...k, text: k.success ? `${r.handle} kills the lights. The guards are shooting blind.` : `${r.handle} goes for the lights and can't find the circuit.` });
    } else {
      const g = targetOf(b);
      if (!g) continue;
      const k = roll(rng, st.value, b.diff + BATTLE.shootStep);
      const dmg = k.success ? hitFor(r.damage, g.armour) : 0;
      g.hp = Math.max(0, g.hp - dmg);
      if (g.hp === 0) g.out = true;
      line({ ...base, ...k, target: guardName(g, b), weapon: r.weapon, damage: dmg, armour: g.armour, dropped: g.out,
        text: k.success ? `${r.handle} hits ${guardName(g, b)} for ${dmg}${g.armour ? ` (armour ${g.armour})` : ''}${g.out ? '. Down.' : '.'}` : `${r.handle} misses.` });
    }
  }

  // Wheels brings the van round once: the way out is clean, so pulling back costs no parting shots.
  if (b.wheels && !b.van && up(b).length) {
    const k = roll(rng, b.wheels.value, b.diff);
    if (k.success) b.van = true;
    line({ kind: 'van', actor: { id: b.wheels.id, handle: b.wheels.handle }, stat: 'driving', value: b.wheels.value, notes: b.wheels.notes, ...k,
      text: k.success ? `${b.wheels.handle} brings the van round. There's a clean way out.` : `${b.wheels.handle} can't get the van any closer.` });
  }

  if (b.ambush && b.round === 1 && up(b).length) {
    // The crew hit first: the guards don't get a shot in this round.
    line({ kind: 'ambush', actor: null, text: up(b).length > 1 ? 'The guards are caught off balance and get no shot in.' : 'The guard is caught off balance and gets no shot in.' });
  } else for (const g of up(b)) {
    const t = guardTarget(b, rng);
    if (!t) break;
    lines.push(guardAttack(b, g, t, rng, down));
  }
  // Morale (after Battle Brothers): the last guard standing, badly hurt, breaks and runs for it.
  let fled = false;
  const left = up(b);
  if (left.length === 1 && left[0].hp < left[0].max * BATTLE.breakBelow && standing(b).length) {
    const g = left[0];
    g.out = true;
    g.fled = true;
    fled = true;
    const who = guardName(g, b);
    lines.push({ kind: 'flee', actor: null, target: who, text: `${who[0].toUpperCase()}${who.slice(1)} breaks and runs, shouting into a radio.` });
  }
  return { lines, heat, neural, down, fled };
}

/** Who a guard goes for: often whoever is already hurt worst (guardsFocus), otherwise anyone standing. */
function guardTarget(b, rng) {
  const targets = standing(b);
  if (!targets.length) return null;
  const roll = rng();
  if (roll < BATTLE.guardsFocus) return [...targets].sort((a, c) => a.hp / a.max - c.hp / c.max)[0];
  return targets[Math.floor(rng() * targets.length)];
}

/** A guard goes for a runner: their skill is the fight's difficulty (plus guardStep), against the runner's cool. */
function guardAttack(b, g, t, rng, down, { floor = 0 } = {}) {
  const def = t.stats.cool;
  const shift = b.lights ? BATTLE.lightsOff : 0;
  const die = d20(rng);
  const skill = b.diff + BATTLE.guardStep;
  const need = 10 + def.value + shift;
  const success = die + skill >= need;
  const dmg = success ? Math.min(hitFor(g.damage, t.armour), Math.max(0, t.hp - floor)) : 0;
  t.hp -= dmg;
  if (t.hp <= 0 && !t.down) { t.hp = 0; t.down = true; down.push(t.id); }
  const who = guardName(g, b);
  const Who = who[0].toUpperCase() + who.slice(1);
  return {
    kind: 'guard', actor: null, target: t.handle, targetId: t.id, stat: 'cool', value: skill, notes: [`${t.handle}'s cool ${def.value}`, ...(shift ? [`lights out +${shift}`] : [])], die, need, success, damage: dmg, armour: t.armour, down: t.down && dmg > 0 && t.hp === 0,
    text: success ? (dmg ? `${Who} hits ${t.handle} for ${dmg}${t.armour ? ` (${t.armourName ?? 'armour'} took ${t.armour})` : ''}${t.hp === 0 ? `. ${t.handle} is down.` : '.'}` : `${Who} grazes ${t.handle}.`) : `${Who} misses ${t.handle}.`,
  };
}

/** Pulling back: every guard still up gets one go at the crew as they run, unless the van came round. Never drops anyone below 1. */
export function partingShots(b, rng) {
  if (b.van) return [];
  const lines = [];
  for (const g of up(b)) {
    const t = guardTarget(b, rng);
    if (!t) break;
    lines.push(guardAttack(b, g, t, rng, [], { floor: 1 }));
  }
  return lines;
}

/** The injury HP left means (none, light, serious), for someone still standing. */
export function injuryFromHp(r) {
  const share = r.hp / r.max;
  return share < BATTLE.seriousBelow ? 'serious' : share < BATTLE.lightBelow ? 'light' : 'none';
}

// --- the planning read -------------------------------------------------------------------------

const oddsCache = new Map();

/**
 * How a fight goes with this team, run BATTLE.oddsRuns times with the same round function on fixed
 * seeds, ignoring orders: { win, down, standoff } as shares. win: every guard down or backed off
 * with nobody at death's door; down: someone hits 0 HP; standoff: guards still up after the last round.
 */
export function battleOdds(args) {
  const b0 = buildBattle(args);
  const key = JSON.stringify([b0.diff, b0.ambush, b0.guards, b0.runners.map((r) => [r.hp, r.max, r.armour, r.damage, r.patch, FIGHT_STATS.map((s) => r.stats[s].value)]), b0.overwatch && [b0.overwatch.value, b0.overwatch.damage, b0.overwatch.left], b0.wheels?.value]);
  if (oddsCache.has(key)) return oddsCache.get(key);
  const n = { win: 0, down: 0, standoff: 0 };
  if (!b0.runners.length) return { win: 0, down: 1, standoff: 0 };
  for (let i = 0; i < BATTLE.oddsRuns; i++) {
    const b = structuredClone(b0);
    const rng = makeRng(0x5eed + i * 7919);
    let end = 'standoff';
    while (b.round < BATTLE.rounds) {
      const r = playRound(b, rng);
      if (r.down.length) { end = 'down'; break; }
      if (!up(b).length) { end = 'win'; break; }
    }
    n[end] += 1;
  }
  const out = { win: n.win / BATTLE.oddsRuns, down: n.down / BATTLE.oddsRuns, standoff: n.standoff / BATTLE.oddsRuns };
  if (oddsCache.size > 2000) oddsCache.clear();
  oddsCache.set(key, out);
  return out;
}
