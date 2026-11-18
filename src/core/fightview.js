// What the engine-2 screens show (battle rework slice 2; drafts/SPEC-battle-orders.md section 20), built from the
// rules' own read models and nothing else: previewRound (the threats with their shown chances, each runner's
// intended action and the order behind it, "if nothing"), exposures/aimChance through it, riskThreshold, and
// fightOdds/fightOddsFor for the plan. No chance is worked out here (shown = used). Pure: no DOM, never draws.
//
// roundView(b) is the round screen and the call-in card; planView(...) is the plan screen's fight block.

import * as F from './fight.js';
import { makeRng } from './rng.js';
import { FIGHT } from '../data/fights.js';
import { SITE_ENEMIES, ENEMIES } from '../data/fights.js';
import { MOVES, PAYLOADS } from '../data/builds.js';
import { immuneTo } from './builds.js';
import { lineText, kindWord, kindPlural, enemyName, chanceWord, hpWord, nameList } from './fighttext.js';

const handleOf = (b, id) => b.runners.find((r) => r.id === id)?.handle ?? id;
const boarding = (b) => b.type === 'holdExtract' && b.stage === 1;
const enemyOf = (b, n) => b.enemies.find((e) => e.n === n);
const nameOfEnemy = (b, n) => { const e = enemyOf(b, n); return e ? enemyName(e.kind, n) : String(n); };

/** An order as the order chip reads it: "Protect Static", "Attack", "Work the hack". */
export function orderLabel(b, o) {
  if (!o) return '';
  const prot = b.goal.protect;
  switch (o.duty) {
    case 'attack': return typeof o.target === 'number' ? `Attack ${nameOfEnemy(b, o.target)}` : 'Attack';
    case 'protect': { const t = o.target === 'protected' || o.target == null ? prot : o.target; return t ? `Protect ${handleOf(b, t)}` : 'Protect the weakest'; }
    case 'support': return 'Support';
    case 'hold': return 'Hold';
    case 'push': return b.type === 'holdHack' ? 'Work the hack' : 'Board the van';
    case 'withdraw': return 'Pull out';
    default: return o.duty;
  }
}

/** The order behind an action, short: what the intent line puts in its brackets ("protecting Static", "fallback: attack"). */
function whyOf(b, a, o) {
  if (a.from === 'safety') return 'pull-out threshold';
  if (a.from === 'last') return 'nothing else to do';
  const duty = a.from === 'fallback' ? o.fallback : o;
  const prot = b.goal.protect;
  const word = ({
    attack: () => (typeof duty?.target === 'number' ? `attacking ${nameOfEnemy(b, duty.target)}` : 'attack order'),
    protect: () => { const t = duty?.target === 'protected' || duty?.target == null ? prot : duty.target; return t ? `protecting ${handleOf(b, t)}` : 'protecting the weakest'; },
    support: () => 'support order',
    hold: () => 'holding',
    push: () => 'standing order',
    withdraw: () => 'ordered out',
  })[duty?.duty]?.() ?? 'orders';
  return a.from === 'fallback' ? `fallback: ${word}` : word;
}

/** The intent line for one previewed action: the key and its slots filled, in the owner's wording. */
function intentOf(b, r, a, o) {
  const slots = { who: r.handle, why: whyOf(b, a, o) };
  if (a.kind === 'attack') slots.enemy = nameOfEnemy(b, a.target);
  if (a.kind === 'burst') slots.enemies = nameList((a.targets ?? []).map((n) => nameOfEnemy(b, n)));
  if (['shield', 'patch', 'stabilise', 'carry'].includes(a.kind)) slots.target = handleOf(b, a.target);
  const key = `intent.${a.kind}`;
  return { kind: a.kind, from: a.from, text: lineText(key, slots) };
}

/** A threat as the screen shows it, with the chance and its damage in HP (the line adds neither). */
function threatOf(b, t, exp) {
  const e = enemyOf(b, t.enemy);
  const enemy = nameOfEnemy(b, t.enemy);
  if (t.kind === 'aim') {
    const x = exp.find((y) => y.id === t.id); // a shielded shot is taken by its shield: their cover, their chance
    const who = handleOf(b, x?.target ?? t.target);
    return { id: t.id, kind: 'aim', enemy: t.enemy, target: x?.target ?? t.target, shieldedBy: x?.shieldedBy ?? null, chance: t.chance, hit: t.hit, text: lineText('threat.aim', { enemy, who, chance: chanceWord(t.chance), hp: hpWord(t.hit) }), e };
  }
  const slots = { enemy, who: t.target ? handleOf(b, t.target) : '' };
  return { id: t.id, kind: t.kind, enemy: t.enemy, target: t.target, text: lineText(`threat.${t.kind}`, slots), e };
}

/** Where the objective stands: the goal track and the clocks, as plain numbers (the screen draws them). */
function goalOf(b) {
  if (b.type === 'holdHack' && b.stage === 1) return { type: 'wayOut', round: b.round, up: b.enemies.filter((e) => !e.out && !e.fled).length, coming: b.arriving.length };
  if (b.type === 'holdHack') {
    const tech = b.goal.protect ? handleOf(b, b.goal.protect) : null;
    return { type: 'hack', work: b.goal.work, needed: FIGHT.workNeeded, alarm: b.clock, deadline: b.deadline, tech, round: b.round };
  }
  if (b.type === 'holdHall') return { type: 'hall', round: b.round, cap: b.cap, up: b.enemies.filter((e) => !e.out && !e.fled).length, turret: b.turret ? b.turret.left : null };
  if (b.type === 'holdYard') return { type: 'yard', round: b.round, up: b.enemies.filter((e) => !e.out && !e.fled).length, coming: b.arriving.length };
  return { type: 'extract', stage: b.stage, vanRound: b.goal.vanRound, vanLeaves: b.goal.vanLeaves, round: b.round, held: !!b.vanHeld };
}

/** What state a runner is in, for the roster. */
const stateOf = (r) => (r.dead ? 'dead' : r.withdrawn ? 'out' : r.aboard ? 'aboard' : r.down ? (r.stable ? 'stable' : 'down') : 'standing');

/**
 * The round screen's data. With the round drawn (b.drawn), the threats, intents, exposure and "if nothing" come
 * from previewRound; before that, only the roster and the goal. Never draws.
 */
export function roundView(b) {
  const pv = b.drawn ? F.previewRound(b) : null;
  const exp = pv?.exposure ?? [];
  const enemies = b.enemies.map((e) => ({
    n: e.n, kind: e.kind, name: enemyName(e.kind, e.n), infected: !!e.infected && !e.out && !e.fled, pips: F.hpUnits(e.hp), max: F.hpUnits(e.max), hp: Math.max(0, e.hp), maxHp: e.max, out: !!(e.out || e.fled), fled: !!e.fled, cover: e.cover, approaching: !!e.approaching,
    threats: (pv?.threats ?? []).filter((t) => t.enemy === e.n && !t.cancelled).map((t) => threatOf(b, t, exp)),
  }));
  const runners = b.runners.map((r) => {
    const o = F.orderOf(b, r);
    const a = pv?.actions.find((x) => x.who === r.id);
    const shots = exp.filter((x) => x.target === r.id);
    return {
      id: r.id, handle: r.handle, pips: F.hpUnits(r.hp), max: F.hpUnits(r.max), hp: Math.max(0, r.hp), maxHp: r.max, state: stateOf(r), cover: r.cover, protect: r.id === b.goal.protect, medic: !!r.medic, jammer: !!r.jammer,
      order: o.duty, orderTarget: o.target, orderLabel: orderLabel(b, o),
      intent: a && F.standing(b).some((x) => x.id === r.id) ? intentOf(b, r, a, o) : null,
      shots: shots.map((x) => ({ enemy: nameOfEnemy(b, x.enemy), chance: x.chance, text: chanceWord(x.chance), pips: F.hpUnits(x.hit), hp: x.hit, shielded: !!x.shieldedBy })),
      threshold: F.hpUnits(pv?.thresholds[r.id] ?? F.riskThreshold(b, r)), thresholdHp: pv?.thresholds[r.id] ?? F.riskThreshold(b, r),
    };
  });
  return {
    round: b.round, drawn: !!pv, type: b.type, stage: b.stage, goal: goalOf(b), risk: b.risk.level,
    ticks: (pv?.ticks ?? []).map((t) => ({ enemy: t.enemy, name: nameOfEnemy(b, t.enemy), pips: F.hpUnits(t.hp), hp: t.hp })),
    ticksLine: pv?.ticks?.length ? lineText('ticks', { word: 'Vector', enemies: nameList(pv.ticks.map((t) => nameOfEnemy(b, t.enemy))) }) : null,
    enemies, runners, ifNothing: pv?.ifNothing ?? [], overwatch: pv?.overwatch ?? null, doors: pv?.doors ?? null,
    threatLines: enemies.flatMap((e) => e.threats.map((t) => t.text)),
    vanLine: boarding(b) ? { leaves: b.goal.vanLeaves, round: b.round } : null,
  };
}

/** The risk levels, in order, with their labels and what each does (the owner's wording, read from fightText). */
export const RISK_ORDER = ['cautious', 'steady', 'committed'];
export const riskWords = (level) => ({ label: lineText(`risk.${level}.label`), description: lineText(`risk.${level}.description`) });

/** What a duty can target, for the order editor: the duties that make sense now, and for each the targets it takes. */
export function orderChoices(b, r) {
  const others = b.runners.filter((x) => x.id !== r.id && !x.dead && !x.withdrawn).map((x) => ({ id: x.id, label: x.handle }));
  const up = F.enemiesUp(b).map((e) => ({ id: e.n, label: enemyName(e.kind, e.n) }));
  const duties = [];
  duties.push({ duty: 'attack', label: 'Attack', targets: [{ id: null, label: 'Whoever threatens most' }, ...up] });
  duties.push({ duty: 'protect', label: 'Protect', targets: [{ id: null, label: b.goal.protect && b.goal.protect !== r.id ? `${handleOf(b, b.goal.protect)} (the tech)` : 'The weakest' }, ...others.filter((x) => x.id !== b.goal.protect)] });
  duties.push({ duty: 'support', label: 'Support', targets: [] });
  duties.push({ duty: 'hold', label: 'Hold', targets: [] });
  if (b.type === 'holdHack' ? r.id === b.goal.protect && b.stage === 0 : b.stage === 1) duties.push({ duty: 'push', label: b.type === 'holdHack' ? 'Work the hack' : 'Board the van', targets: [] });
  duties.push({ duty: 'withdraw', label: 'Pull out', targets: [] });
  return duties;
}

// --- the plan screen -------------------------------------------------------------------------------

/**
 * The plan screen's fight block for one of the five jobs: the fight type and objective, the likely enemy kinds, the
 * crew's gaps, who can jam, each runner's order and pull-out threshold, and the chance of losing someone at each risk
 * level (fightOddsFor, the same read the planning coverage uses). `args` are buildFight's arguments (type, diff, threat,
 * site, crew, approach, overwatch, wheels). Never draws from the run's stream: the sample fight uses a fixed seed.
 */
export function planView(args, risk = 'steady') {
  const b = F.buildFight({ ...args, risk }, makeRng(0xf1647));
  const tech = b.goal.protect ? b.runners.find((r) => r.id === b.goal.protect) : null;
  const jammers = b.runners.filter((r) => r.jammer).map((r) => ({ handle: r.handle, tech: r.id === b.goal.protect }));
  const kinds = [...new Set(SITE_ENEMIES[args.site] ?? SITE_ENEMIES.docks)];
  const gaps = [];
  if (!jammers.length) gaps.push(lineText('plan.noJammer'));
  if (!b.runners.some((r) => r.medic)) gaps.push(lineText('plan.noMedic'));
  if (tech && !tech.absorb) gaps.push(lineText('plan.noTechArmour', { tech: tech.handle }));
  const odds = {};
  for (const level of RISK_ORDER) odds[level] = F.fightOddsFor({ ...args, risk: level });
  const stage = 0;
  return {
    type: b.type,
    line: lineText(b.type === 'holdHack' ? 'plan.hack' : b.type === 'holdYard' ? 'plan.yard' : 'plan.extract', { work: FIGHT.workNeeded, tech: tech?.handle ?? 'the tech' }),
    kinds: kinds.map((k) => kindWord(k)),
    kindsLine: lineText('plan.likely', { kinds: nameList(kinds.map(kindPlural)) }),
    gaps,
    jam: jammers.length ? lineText('plan.canJam', { who: nameList(jammers.map((j) => j.handle)) }) + (jammers.some((j) => j.tech) ? ` ${lineText('plan.techJamStops')}` : '') : '',
    runners: b.runners.map((r) => ({
      id: r.id, handle: r.handle, pips: F.hpUnits(r.max), hp: r.max, protect: r.id === b.goal.protect,
      orders: (b.type === 'holdExtract' ? [0, 1] : [stage]).map((st) => ({ stage: st, label: orderLabel({ ...b, stage: st }, F.orderOf({ ...b, stage: st }, r)) })),
      threshold: F.hpUnits(F.riskThreshold(b, r)), thresholdHp: F.riskThreshold(b, r),
    })),
    risk,
    odds,
    loss: Object.fromEntries(RISK_ORDER.map((level) => [level, lossLine(odds[level])])),
    build: buildRead(b),
  };
}

/**
 * The planning read's build advice (builds slice 3-iii, 2026-11-17): Joss's one line, and the breakdown behind it (what the
 * fight throws, what each build can do about it). Read from the same sample fight and the same data the rules use (`foeTags`,
 * `absorb`, a payload's `immune`, a move's `when`/`reach`), so the advice never disagrees with the fight. Null when nobody on
 * the squad carries a build: there is nothing to advise on.
 */
export function buildRead(b) {
  const built = b.runners.filter((r) => r.build && (r.build.move || r.build.payload));
  if (!built.length) return null;
  const names = (ids) => nameList(ids);
  const kindCount = {};
  for (const e of b.enemies) kindCount[e.kind] = (kindCount[e.kind] ?? 0) + 1;
  const kinds = Object.keys(kindCount);
  const plural = (list) => names(list.map(kindPlural));
  const counted = (list) => names(list.map((k) => `${kindCount[k]} ${kindCount[k] === 1 ? kindWord(k) : kindPlural(k)}`));
  const upAtOnce = b.enemies.length;
  const threats = [];
  if (upAtOnce >= 2) threats.push({ title: lineText('build.threat.group', { n: upAtOnce }), text: lineText('build.threat.group.text') });
  const withTag = (tag) => kinds.filter((k) => (ENEMIES[k]?.foeTags ?? []).includes(tag));
  const machines = withTag('synthetic');
  if (machines.length) threats.push({ title: lineText('build.threat.synthetic', { kinds: counted(machines) }), text: lineText('build.threat.synthetic.text') });
  const armoured = kinds.filter((k) => (ENEMIES[k]?.absorb ?? 0) > 0);
  if (armoured.length) threats.push({ title: lineText('build.threat.armoured', { kinds: counted(armoured) }), text: lineText('build.threat.armoured.text') });

  let blocked = null; let used = false;
  const answers = built.map((r) => {
    const m = MOVES[r.build.move]; const pl = PAYLOADS[r.build.payload];
    const lines = [];
    if (m) {
      const ok = upAtOnce >= (m.when?.enemies ?? 1);
      used = used || ok;
      lines.push(ok ? lineText('build.answer.move.fits', { piece: m.name, reach: m.reach }) : lineText('build.answer.move.few', { piece: m.name, need: m.when?.enemies ?? 1 }));
    }
    if (pl) {
      const no = kinds.filter((k) => immuneTo(k, pl.id)); const yes = kinds.filter((k) => !no.includes(k));
      if (yes.length) { lines.push(lineText('build.answer.payload.works', { piece: pl.name, kinds: plural(yes) })); used = true; }
      if (no.length) { lines.push(lineText('build.answer.payload.blocked', { piece: pl.name, kinds: plural(no) })); blocked = blocked ?? { r, pl, no }; }
    }
    return { id: r.id, handle: r.handle, tags: [m?.name, pl?.name].filter(Boolean), text: lines.join(' ') };
  });
  const who = nameList(built.map((r) => r.handle));
  const pieces = nameList(built.flatMap((r) => [MOVES[r.build.move]?.name, PAYLOADS[r.build.payload]?.name]).filter(Boolean));
  let advice;
  if (blocked) {
    const tag = (ENEMIES[blocked.no[0]]?.foeTags ?? []).find((t) => PAYLOADS[blocked.pl.id].immune.includes(t));
    advice = lineText('build.advice.blocked', { who: blocked.r.handle, piece: blocked.pl.name, kinds: plural(blocked.no), why: lineText(`build.why.${tag}`).replace(/^./, (c) => c.toLowerCase()), counter: lineText(`build.counter.${tag}`) });
  } else advice = lineText(used ? 'build.advice.fits' : 'build.advice.nothing', { who, pieces });
  return { advice, threats, answers };
}

/** The chance of losing someone (dead or left behind) as a line; zero says so, as a forecast and not a promise. */
export function lossLine(o) {
  const lost = o?.lost ?? 0;
  return lost > 0 ? lineText('plan.lossChance', { chance: chanceWord(lost) }) : lineText('plan.lossChanceZero');
}
