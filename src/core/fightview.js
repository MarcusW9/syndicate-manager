// What the engine-2 screens show (battle rework slice 2; drafts/SPEC-battle-orders.md section 20), built from the
// rules' own read models and nothing else: previewRound (the threats with their shown chances, each runner's
// intended action and the order behind it, "if nothing"), exposures/aimChance through it, riskThreshold, and
// fightOdds/fightOddsFor for the plan. No chance is worked out here (shown = used). Pure: no DOM, never draws.
//
// roundView(b) is the round screen and the call-in card; planView(...) is the plan screen's fight block.

import * as F from './fight.js';
import { makeRng } from './rng.js';
import { FIGHT } from '../data/fights.js';
import { SITE_ENEMIES } from '../data/fights.js';
import { lineText, kindWord, kindPlural, enemyName, chanceWord, pipsWord, nameList } from './fighttext.js';

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
  if (['shield', 'patch', 'stabilise', 'carry'].includes(a.kind)) slots.target = handleOf(b, a.target);
  const key = `intent.${a.kind}`;
  return { kind: a.kind, from: a.from, text: lineText(key, slots) };
}

/** A threat as the screen shows it, with the chance and pips in their units (the line adds neither). */
function threatOf(b, t, exp) {
  const e = enemyOf(b, t.enemy);
  const enemy = nameOfEnemy(b, t.enemy);
  if (t.kind === 'aim') {
    const x = exp.find((y) => y.id === t.id); // a shielded shot is taken by its shield: their cover, their chance
    const who = handleOf(b, x?.target ?? t.target);
    return { id: t.id, kind: 'aim', enemy: t.enemy, target: x?.target ?? t.target, shieldedBy: x?.shieldedBy ?? null, chance: t.chance, hit: t.hit, text: lineText('threat.aim', { enemy, who, chance: chanceWord(t.chance), pips: pipsWord(t.hit) }), e };
  }
  const slots = { enemy, who: t.target ? handleOf(b, t.target) : '' };
  return { id: t.id, kind: t.kind, enemy: t.enemy, target: t.target, text: lineText(`threat.${t.kind}`, slots), e };
}

/** Where the objective stands: the goal track and the clocks, as plain numbers (the screen draws them). */
function goalOf(b) {
  if (b.type === 'holdHack') {
    const tech = b.goal.protect ? handleOf(b, b.goal.protect) : null;
    return { type: 'hack', work: b.goal.work, needed: FIGHT.workNeeded, alarm: b.clock, deadline: b.deadline, tech, round: b.round };
  }
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
    n: e.n, kind: e.kind, name: enemyName(e.kind, e.n), pips: Math.max(0, e.pips), max: e.max, out: !!(e.out || e.fled), fled: !!e.fled, cover: e.cover,
    threats: (pv?.threats ?? []).filter((t) => t.enemy === e.n && !t.cancelled).map((t) => threatOf(b, t, exp)),
  }));
  const runners = b.runners.map((r) => {
    const o = F.orderOf(b, r);
    const a = pv?.actions.find((x) => x.who === r.id);
    const shots = exp.filter((x) => x.target === r.id);
    return {
      id: r.id, handle: r.handle, pips: Math.max(0, r.pips), max: r.max, state: stateOf(r), cover: r.cover, protect: r.id === b.goal.protect, medic: !!r.medic, jammer: !!r.jammer,
      order: o.duty, orderTarget: o.target, orderLabel: orderLabel(b, o),
      intent: a && F.standing(b).some((x) => x.id === r.id) ? intentOf(b, r, a, o) : null,
      shots: shots.map((x) => ({ enemy: nameOfEnemy(b, x.enemy), chance: x.chance, text: chanceWord(x.chance), pips: x.hit, shielded: !!x.shieldedBy })),
      threshold: pv?.thresholds[r.id] ?? F.riskThreshold(b, r),
    };
  });
  return {
    round: b.round, drawn: !!pv, type: b.type, stage: b.stage, goal: goalOf(b), risk: b.risk.level,
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
  if (b.type === 'holdHack' ? r.id === b.goal.protect : b.stage === 1) duties.push({ duty: 'push', label: b.type === 'holdHack' ? 'Work the hack' : 'Board the van', targets: [] });
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
    line: lineText(b.type === 'holdHack' ? 'plan.hack' : 'plan.extract', { work: FIGHT.workNeeded, tech: tech?.handle ?? 'the tech' }),
    kinds: kinds.map((k) => kindWord(k)),
    kindsLine: lineText('plan.likely', { kinds: nameList(kinds.map(kindPlural)) }),
    gaps,
    jam: jammers.length ? lineText('plan.canJam', { who: nameList(jammers.map((j) => j.handle)) }) + (jammers.some((j) => j.tech) ? ` ${lineText('plan.techJamStops')}` : '') : '',
    runners: b.runners.map((r) => ({
      id: r.id, handle: r.handle, pips: r.max, protect: r.id === b.goal.protect,
      orders: (b.type === 'holdExtract' ? [0, 1] : [stage]).map((st) => ({ stage: st, label: orderLabel({ ...b, stage: st }, F.orderOf({ ...b, stage: st }, r)) })),
      threshold: F.riskThreshold(b, r),
    })),
    risk,
    odds,
    loss: Object.fromEntries(RISK_ORDER.map((level) => [level, lossLine(odds[level])])),
  };
}

/** The chance of losing someone (dead or left behind) as a line; zero says so, as a forecast and not a promise. */
export function lossLine(o) {
  const lost = o?.lost ?? 0;
  return lost > 0 ? lineText('plan.lossChance', { chance: chanceWord(lost) }) : lineText('plan.lossChanceZero');
}
