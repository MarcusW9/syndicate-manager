// Battles (PLAN-CORE-LOOP.md, slice 6; DESIGN.md 2026-10-29). Pure logic: building the two
// sides, playing one round, and the planning read's fight odds, which run this same round
// function many times on fixed seeds (shown risk equals used risk). core/mission.js owns the run:
// when a fight starts, the call-ins, pulling back, and what HP left turns into.
//
// A battle object (am.battle, save v26; cover and intents v28):
//   { incident, zone, diff, round, guards: [guard], runners: [runner], overwatch, wheels,
//     lights, van, door: [opId], intents }
// guard  { n, hp, max, armour, damage, out, cover, now } out: down, or talked into backing off
// runner { id, handle, hp, max, armour, armourName, damage, weapon, stats, patch,
//          down, fightOn, stable, cover, now }         stats: { stat: { value, notes } }
// cover: where they stand (open, half, full); now: this round's, when an order changed it.
// intents: what each guard means to do this round, rolled before orders ([{ guard, target }]).
//
// Command fights (2026-10-30): the player can give each runner an order a round (playRound's
// orders); anyone without one does what the crew would (actionFor), as on a hands-off run.
//
// Death's door: a runner at 0 HP is down, never dead. Only after the player chooses to keep
// fighting (fightOn) can they die, and that runs through the existing "push on" rule (am.untreated).

import { BATTLE } from '../data/battle.js';
import { GEAR, TIERS } from '../data/gear.js';
import { ZONES, INCIDENTS } from '../data/incidents.js';
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

/**
 * The guards a run will meet, for the plan to show on their posts before they come into it (shown
 * equals used): each danger incident still ahead in the queue, with as many guards as its fight
 * would start with. Once the crew has gone loud, what's left short of the target is a guard, as in
 * runIncident. [{ step, zone, incident, guards }].
 */
export function guardPosts(am) {
  if (!am || am.done) return [];
  const out = [];
  (am.queue ?? []).forEach((q, i) => {
    if (i < am.step || q.type !== 'incident') return;
    const id = am.wentLoud && q.zone !== 'target' && !INCIDENTS[q.id]?.danger ? 'guard' : q.id;
    const inc = INCIDENTS[id];
    if (inc?.danger && inc.guards) out.push({ step: i, zone: q.zone, incident: id, guards: guardsFor(am.threat ?? 1, inc.guards).length });
  });
  return out;
}

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

/** The guards a fight starts with: the incident's count, more on bigger work (at most maxGuards), toughened by threat. */
export function guardsFor(threat, count) {
  const t = Math.max(1, Math.min(5, Math.round(threat)));
  const n = Math.min(BATTLE.maxGuards, count + BATTLE.extraGuards[t]);
  return Array.from({ length: n }, (_, i) => ({ n: i + 1, hp: BATTLE.guardHp[t], max: BATTLE.guardHp[t], armour: BATTLE.guardArmour[t], damage: BATTLE.guardDamage[t], out: false, cover: BATTLE.startCover, now: null }));
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
    patch: patchBonus(op), down: false, fightOn: false, stable: false, cover: BATTLE.startCover, now: null,
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
    lights: false, van: false, door: [], intents: null,
  };
}

const up = (b) => b.guards.filter((g) => !g.out);
const standing = (b) => b.runners.filter((r) => !r.down);
const roll = (rng, value, diff) => { const die = d20(rng); return { die, need: 10 + diff, success: die + value >= 10 + diff }; };
const guardName = (g, b) => (b.guards.length > 1 ? `guard ${g.n}` : 'the guard');

/** The chance of a fight roll, exactly as roll() makes it (d20 + value >= 10 + diff, no caps): what the orders show. */
export const fightChance = (value, diff) => Math.min(1, Math.max(0, (11 + value - diff) / 20));

const COVERS = ['open', 'half', 'full'];
/** Where someone stands this round: their spot's cover, or what this round's orders made it. */
export const coverNow = (x) => x.now ?? x.cover ?? BATTLE.startCover;
const coverStep = (x) => BATTLE.cover[coverNow(x)];
const better = (c) => COVERS[Math.min(COVERS.length - 1, COVERS.indexOf(c) + 1)];
/** A shot's difficulty at a guard: the fight's, shootStep, and their cover. */
const shotDiff = (b, g) => b.diff + BATTLE.shootStep + coverStep(g);

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
  if (s('social') >= s('combat') + BATTLE.lean && up(b).length) return { kind: 'talk', stat: 'social', target: talkTarget(b)?.n ?? null };
  if (s('tech') >= s('combat') + BATTLE.lean && !b.lights) return { kind: 'lights', stat: 'tech', target: null };
  return { kind: 'shoot', stat: 'combat', target: targetOf(b)?.n ?? null };
}

/** The guard a talker works on when nobody picked one: the one least hurt, who has most to lose. */
const talkTarget = (b) => up(b).sort((a, c) => c.hp - a.hp || a.n - c.n)[0];

const STAT_OF = { shoot: 'combat', flank: 'combat', hunker: null, patch: 'medical', stabilise: 'medical', talk: 'social', lights: 'tech' };
const isMedic = (r) => r.stats.medical.value + r.patch >= BATTLE.patchMin;

/** Whether an order can be carried out now. A runner whose order can't is left to the crew's own call (actionFor). */
function canDo(b, r, o) {
  const guard = up(b).some((g) => g.n === o?.target);
  const mate = b.runners.find((x) => x.id === o?.target);
  switch (o?.kind) {
    case 'shoot': case 'flank': case 'talk': return guard;
    case 'hunker': return true;
    case 'patch': return isMedic(r) && !!mate && !mate.down && mate.hp < mate.max;
    case 'stabilise': return isMedic(r) && !!mate && mate.down && mate.fightOn && !mate.stable;
    case 'lights': return !b.lights && up(b).length > 0;
    default: return false;
  }
}

/**
 * Everything a runner can be ordered to do this round, with the chance each has (fightChance: the
 * same numbers the round rolls against, so shown equals used). auto marks what the crew would do
 * on its own. [{ kind, target, stat, chance, cover?, heal?, auto }]: target a guard's n or a runner's id.
 */
export function ordersFor(b, id) {
  const r = b.runners.find((x) => x.id === id && !x.down);
  if (!r) return [];
  const s = (k) => r.stats[k].value;
  const auto = actionFor(r, b);
  const out = [];
  const add = (o) => out.push({ ...o, auto: o.kind === auto.kind && (o.target ?? null) === (auto.target ?? null) });
  for (const g of up(b)) add({ kind: 'shoot', target: g.n, stat: 'combat', chance: fightChance(s('combat'), shotDiff(b, g)), cover: coverNow(g) });
  for (const g of up(b)) add({ kind: 'flank', target: g.n, stat: 'combat', chance: fightChance(s('combat'), b.diff + BATTLE.shootStep + BATTLE.cover.open), cover: 'open' });
  add({ kind: 'hunker', target: null, stat: null, chance: 1, cover: better(coverNow(r)) });
  if (isMedic(r)) {
    for (const x of b.runners) {
      if (x.down && x.fightOn && !x.stable) add({ kind: 'stabilise', target: x.id, stat: 'medical', chance: fightChance(s('medical'), BATTLE.stabilise) });
      else if (!x.down && x.hp < x.max) add({ kind: 'patch', target: x.id, stat: 'medical', chance: fightChance(s('medical'), b.diff), heal: Math.min(x.max - x.hp, BATTLE.patchHeal + r.patch) });
    }
  }
  for (const g of up(b)) add({ kind: 'talk', target: g.n, stat: 'social', chance: fightChance(s('social'), b.diff + BATTLE.talkStep) });
  if (!b.lights && up(b).length) add({ kind: 'lights', target: null, stat: 'tech', chance: fightChance(s('tech'), b.diff) });
  return out;
}

/**
 * What each guard means to do this round, rolled before the player gives orders so they can answer
 * it (XCOM's telegraphed attacks): who they'll go for (often whoever is hurt worst, guardsFocus).
 * None in an ambush's first round: the guards are caught off balance. Sets and returns b.intents.
 */
export function planIntents(b, rng) {
  b.intents = b.ambush && b.round === 0 ? [] : up(b).map((g) => ({ guard: g.n, target: guardTarget(b, rng)?.id ?? null })).filter((i) => i.target);
  return b.intents;
}

/** The guard a shot goes at: the most hurt first, so the crew finishes what it starts. */
const targetOf = (b) => up(b).sort((a, c) => a.hp - c.hp || a.n - c.n)[0];

/**
 * Play one round, mutating the battle. orders: { [runnerId]: { kind, target } } from the player
 * (ordersFor); anyone without a doable one does what the crew would. The guards' intents are rolled
 * first if nobody has yet (planIntents). Order: hunker and flank set this round's cover, overwatch,
 * the inside team (flankers first), Wheels, then every guard still up goes for the runner they meant
 * to (or someone else standing, if that one is down); then the last guard, if badly hurt, breaks and
 * runs. Cover goes back to everyone's spot at the end of the round. Returns
 * { lines, heat, neural, down, fled } where lines are the moments for the feed (each with its roll,
 * but for a guard running), heat and neural what overwatch spent, down the runners who hit 0 HP
 * this round, and fled whether a guard ran (the run raises the alert for it).
 */
export function playRound(b, rng, orders = {}) {
  if (!b.intents) planIntents(b, rng);
  b.round += 1;
  const lines = [];
  const down = [];
  let heat = 0;
  let neural = 0;
  const line = (x) => { lines.push(x); return x; };

  // The player's orders, checked now; hunkering and flanking change where people stand this round.
  const given = new Map(standing(b).filter((r) => canDo(b, r, orders[r.id])).map((r) => [r.id, { ...orders[r.id], stat: STAT_OF[orders[r.id].kind] }]));
  for (const r of standing(b)) {
    const o = given.get(r.id);
    if (o?.kind === 'hunker') { r.now = better(coverNow(r)); r.hunker = true; }
    if (o?.kind === 'flank') { r.now = 'open'; b.guards.find((g) => g.n === o.target).now = 'open'; }
  }

  const ow = b.overwatch;
  if (ow && ow.left > 0 && up(b).length) {
    const g = targetOf(b);
    const r = roll(rng, ow.value, shotDiff(b, g) + BATTLE.overwatchStep);
    ow.left -= 1;
    if (!ow.heatOnHit || r.success) heat += ow.heat;
    neural += ow.neural;
    const dmg = r.success ? hitFor(ow.damage, g.armour) : 0;
    g.hp = Math.max(0, g.hp - dmg);
    if (g.hp === 0) g.out = true;
    const what = ow.kit === 'drone' ? 'tases' : 'hits';
    line({ kind: 'overwatch', actor: { id: ow.id, handle: ow.handle }, kit: ow.kit, target: guardName(g, b), guard: g.n, stat: ow.stat, value: ow.value, notes: ow.notes, ...r, damage: dmg, armour: g.armour, dropped: g.out,
      text: r.success ? `${ow.handle} ${what} ${guardName(g, b)} from overwatch for ${dmg}${g.armour ? ` (armour ${g.armour})` : ''}${g.out ? '. Down.' : '.'}` : `${ow.handle}'s ${ow.kit === 'drone' ? 'drone misses' : 'shot goes wide'}.` });
  }

  const flankFirst = (r) => (given.get(r.id)?.kind === 'flank' ? 0 : 1);
  for (const r of [...standing(b)].sort((a, c) => flankFirst(a) - flankFirst(c))) {
    if (!up(b).length && !b.runners.some((x) => x.down && x.fightOn && !x.stable)) break;
    const mine = given.get(r.id);
    const act = mine && canDo(b, r, mine) ? mine : mine && (mine.kind === 'shoot' || mine.kind === 'flank') && up(b).length ? { ...mine, kind: 'shoot', target: targetOf(b).n } : actionFor(r, b);
    if (act.kind === 'hunker') {
      line({ kind: 'hunker', actor: { id: r.id, handle: r.handle }, cover: coverNow(r), text: `${r.handle} gets down behind ${coverNow(r) === 'full' ? 'solid cover' : 'what cover there is'}.` });
      continue;
    }
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
      line({ ...base, ...k, target: t.handle, targetId: t.id, heal, text: k.success ? `${r.handle} patches ${t === r ? 'themself' : t.handle} up: +${heal}.` : `${r.handle} can't patch ${t === r ? 'themself' : t.handle} up under fire.` });
    } else if (act.kind === 'talk') {
      const g = up(b).find((x) => x.n === act.target) ?? talkTarget(b);
      const k = roll(rng, st.value, b.diff + BATTLE.talkStep);
      if (k.success) g.out = true;
      line({ ...base, ...k, target: guardName(g, b), guard: g.n, text: k.success ? `${r.handle} talks ${guardName(g, b)} into backing off.` : `${r.handle} tries to talk ${guardName(g, b)} down. Nobody's listening.` });
    } else if (act.kind === 'lights') {
      const k = roll(rng, st.value, b.diff);
      if (k.success) b.lights = true;
      line({ ...base, ...k, text: k.success ? `${r.handle} kills the lights. The guards are shooting blind.` : `${r.handle} goes for the lights and can't find the circuit.` });
    } else {
      // Shoot, or flank: the same shot, from round the guard's cover (kind 'shoot' either way, flank marked).
      const g = up(b).find((x) => x.n === act.target) ?? targetOf(b);
      if (!g) continue;
      const flank = act.kind === 'flank';
      const k = roll(rng, st.value, shotDiff(b, g));
      const dmg = k.success ? hitFor(r.damage, g.armour) : 0;
      g.hp = Math.max(0, g.hp - dmg);
      if (g.hp === 0) g.out = true;
      const where = flank ? `${r.handle} works round ${guardName(g, b)}'s cover` : r.handle;
      line({ ...base, kind: 'shoot', flank, ...k, target: guardName(g, b), guard: g.n, cover: coverNow(g), notes: [...st.notes, `${guardName(g, b)} in ${coverNow(g) === 'open' ? 'the open' : `${coverNow(g)} cover`}`], weapon: r.weapon, damage: dmg, armour: g.armour, dropped: g.out,
        text: k.success ? `${where}${flank ? ' and' : ''} hits ${flank ? 'them' : guardName(g, b)} for ${dmg}${g.armour ? ` (armour ${g.armour})` : ''}${g.out ? '. Down.' : '.'}` : `${where}${flank ? ' and' : ''} misses.` });
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
    const meant = (b.intents ?? []).find((i) => i.guard === g.n);
    const t = b.runners.find((x) => x.id === meant?.target && !x.down) ?? guardTarget(b, rng);
    if (!t) break;
    lines.push(guardAttack(b, g, t, rng, down));
  }
  // Morale (after Battle Brothers): a badly hurt guard breaks and runs when they're the last one up,
  // or once half their side is down.
  let fled = false;
  const left = up(b);
  const broken = left.length === 1 || b.guards.length - left.length >= Math.ceil(b.guards.length / 2);
  for (const g of broken && standing(b).length ? left.filter((x) => x.hp < x.max * BATTLE.breakBelow) : []) {
    g.out = true;
    g.fled = true;
    fled = true;
    const who = guardName(g, b);
    lines.push({ kind: 'flee', actor: null, guard: g.n, target: who, text: `${who[0].toUpperCase()}${who.slice(1)} breaks and runs, shouting into a radio.` });
  }
  // The round is over: everyone is back on their spot, and the guards' next move is still to come.
  for (const x of [...b.runners, ...b.guards]) { x.now = null; delete x.hunker; }
  b.intents = null;
  return { lines, heat, neural, down, fled };
}

/** A guard's chance to hit a runner standing in this cover (theirs now unless given): shown on the guards' intent lines. */
export const guardHitChance = (b, t, cover = coverNow(t), hunker = !!t.hunker) => fightChance(b.diff + BATTLE.guardStep, t.stats.cool.value + BATTLE.cover[cover] + (hunker ? BATTLE.hunkerStep : 0) + (b.lights ? BATTLE.lightsOff : 0));

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
  const cover = coverStep(t) + (t.hunker ? BATTLE.hunkerStep : 0);
  const die = d20(rng);
  const skill = b.diff + BATTLE.guardStep;
  const need = 10 + def.value + cover + shift;
  const success = die + skill >= need;
  const dmg = success ? Math.min(hitFor(g.damage, t.armour), Math.max(0, t.hp - floor)) : 0;
  t.hp -= dmg;
  if (t.hp <= 0 && !t.down) { t.hp = 0; t.down = true; down.push(t.id); }
  const who = guardName(g, b);
  const Who = who[0].toUpperCase() + who.slice(1);
  return {
    kind: 'guard', actor: null, guard: g.n, target: t.handle, targetId: t.id, stat: 'cool', value: skill, notes: [`${t.handle}'s cool ${def.value}`, ...(cover ? [`${t.hunker ? 'hunkered in ' : ''}${coverNow(t)} cover +${cover}`] : [`${t.handle} in the open`]), ...(shift ? [`lights out +${shift}`] : [])], die, need, success, damage: dmg, armour: t.armour, down: t.down && dmg > 0 && t.hp === 0,
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
  const key = JSON.stringify([b0.diff, b0.ambush, b0.guards, b0.runners.map((r) => [r.hp, r.max, r.armour, r.damage, r.patch, r.cover, FIGHT_STATS.map((s) => r.stats[s].value)]), b0.overwatch && [b0.overwatch.value, b0.overwatch.damage, b0.overwatch.left], b0.wheels?.value]);
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
