// Slice 3 of the battle rework: the validation gate (drafts/SPEC-battle-orders.md section 24,
// drafts/NUMBERS-battle-orders.md section 11), played on the REAL code. scripts/sim-step0.mjs played the
// paper rules; this plays core/fight.js (buildFight, startRound, playRound, previewRound, dueDilemmas,
// applyPatch, setOrder/editOrder, vanOdds, outcomeOf) and core/runfight.js (fightAnswer, and a run-level
// check through runFight / resolvePending). Nothing here changes src/: settings are applied to the data
// objects at run time and put back.
//
//   node scripts/sim-orders.mjs [seeds=400] [date=2026-11-11]
//
// Writes docs/sims/orders-<date>.md (the report) and docs/sims/orders-<date>.csv (every cell).
//
// ---------------------------------------------------------------------------------------------------
// THE GATE, DECLARED BEFORE THE RUN. Nothing below the "end of the declaration" line may be changed
// after seeing results; the report prints a hash of this block. The owner confirmed the bar on
// 2026-11-11 (7 points or 0.3 downs; numbers sheet proposed 10 / 0.5, Step 0 pass 7 and the plan say 7 / 0.3).
// ---------------------------------------------------------------------------------------------------
import { writeFileSync } from 'node:fs';
import { makeRng, hash } from '../src/core/rng.js';

globalThis.localStorage ??= { getItem: () => null, setItem: () => {}, removeItem: () => {} };

export const GATE = {
  seeds: 400, // per cell; the same seeds for every plan (paired)
  encounters: { // threat 3 (three enemies at the start), base difficulty 14, no overwatch, standby or driver in the gate
    holdHack: { site: 'heights', job: 'data_pull' }, // corp and drones
    holdExtract: { site: 'docks', job: 'warehouse' }, // hired and enforcers
  },
  threat: 3, diff: 14, approach: null, risk: 'steady', // the gate is played at steady; the risk levels get their own tables
  crewGroups: { // 3 margins x 3 line-ups = 9. Stats are base 14 + the margin: main stat / other stats / cool
    margins: { Under: { main: 0, other: -5, cool: -2 }, On: { main: 3, other: -2, cool: 0 }, Over: { main: 6, other: 1, cool: 3 } },
    lineups: 'abc', // a: tech, muscle, medic, gunner; b: tech, muscle, gunner, gunner (ap); c: tech, face, medic, gunner
  },
  endurance: { grown: { muscle: 13, other: 8 }, fresh: { muscle: 10, other: 5 }, spread: 5 }, // gate: grown (owner's scale, numbers sheet section 12 end); fresh in the left-behind table
  settings: { // durability D1-D3 x exposure E1-E3 = 9 (aimStep 0, +2, +4). D2 E2 is the game's own data.
    durability: {
      D1: { hired: [1, 0], corp: [1, 0], drone: [1, 0], enforcer: [2, 0] }, // [pips, absorb]
      D2: { hired: [1, 0], corp: [2, 0], drone: [1, 1], enforcer: [2, 0] },
      D3: { hired: [2, 0], corp: [3, 0], drone: [2, 1], enforcer: [3, 0] },
    },
    exposure: { E1: 0, E2: 2, E3: 4 },
  },
  // Fixed plans (unchanged orders; call-ins answered by the standing orders, core/runfight.js fightAnswer;
  // death's door answered with a pull back). Any ONE of these used in both encounters is "an unchanged plan".
  fixedPlans: ['attack', 'hold', 'protect', 'support', 'mixed', 'defaults'],
  // Adapted plans, best of a small fixed set per encounter, chosen per cell: the six fixed plans, and the same
  // six with the MID-FIGHT layer (answers to call-ins and Take Command between rounds, defined in `smart` below).
  // "Best" = higher clean-win share, then fewer downed runners. The verdict uses the full set; the six fixed
  // plans alone ("adapting by choice before the fight") are reported beside it.
  // Measures: clean win (the objective done and nobody dead, left behind or walked off), downed runners (went
  // to 0 pips at any point), injuries after, left behind, deaths, heat (the only resource a fight spends:
  // the early van and holding the van; specials and consumables do not exist yet).
  tolerance: { won: 0.05, down: 0.25, heat: 0.3 }, // "effectively as good" (heat stands in for specials/consumables)
  bar: { won: 0.07, down: 0.3 }, // "adapting clearly beats an unchanged plan": 7 points or 0.3 fewer downs, in at least one encounter
  cellsNeeded: 2 / 3, // rework: some unchanged plan is as good as adapting in both encounters in this share of cells; proceed: adapting clears the bar in this share and no plan is as good in both
  // Also reported (targets): deaths none on cautious and steady except after a push on or a hand-ordered
  // withdrawal, about 1 in 25 committed fights; toughness: Over's gain over On with the defaults at least twice as big
  // in aim-heavy cells (E3, normal decks) as in radio-heavy ones (E2, decks weighted to backup and alarm).
};
// ------------------------------------------ end of the declaration -------------------------------------

import { createNewGame } from '../src/core/state.js';
import * as Fight from '../src/core/fight.js';
import * as M from '../src/core/mission.js';
import { fightAnswer, runFight } from '../src/core/runfight.js';
import { describePending, resolvePending, currentStep } from '../src/core/mission.js';
import { autoStep } from '../src/core/autorun.js';
import { addOffer, templateById } from '../src/core/jobs.js';
import { FIGHT, ENEMIES } from '../src/data/fights.js';
import { DILEMMAS } from '../src/data/dilemmas.js';

const SEEDS = Number(process.argv[2] ?? GATE.seeds);
const DATE = process.argv[3] ?? '2026-11-11';
const GATE_HASH = hash(JSON.stringify(GATE)).toString(16);
const ENC = Object.keys(GATE.encounters);
const DUR = Object.keys(GATE.settings.durability);
const EXP = Object.keys(GATE.settings.exposure);
const GROUPS = Object.keys(GATE.crewGroups.margins);
const LINEUPS = [...GATE.crewGroups.lineups];
const P = (x) => `${Math.round(x * 100)}%`;
const D = (x) => x.toFixed(2);

// ---- crews: real operatives (cloned from the game's own, so every field the rules read exists) ---------
const TEMPLATE = createNewGame({ seed: 1 }).crew[0];
const LINEUP_DEF = {
  a: [{ role: 'tech', jam: 1 }, { role: 'muscle', vest: 1, gun: 'revolver' }, { role: 'medic', deck: 1 }, { role: 'gunner', gun: 'heritage' }],
  b: [{ role: 'tech', jam: 1 }, { role: 'muscle', vest: 1, gun: 'revolver' }, { role: 'gunner', gun: 'heritage' }, { role: 'gunner', gun: 'machine' }],
  c: [{ role: 'tech', jam: 1 }, { role: 'face' }, { role: 'medic' }, { role: 'gunner', gun: 'heritage' }],
};
const HANDLES = { tech: 'Switch', muscle: 'Rook', medic: 'Lotus', gunner: 'Vex', face: 'Silk' };
const MAIN = { tech: 'tech', muscle: 'combat', medic: 'medical', gunner: 'combat', face: 'social' };
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));

function buildCrew(group, lineup, seed, enduranceMode = 'grown') {
  const g = GATE.crewGroups.margins[group];
  const rng = makeRng(hash('endurance', group, lineup, seed));
  const seen = {};
  return LINEUP_DEF[lineup].map((x, i) => {
    seen[x.role] = (seen[x.role] ?? 0) + 1;
    const op = structuredClone(TEMPLATE);
    const mean = GATE.endurance[enduranceMode][x.role === 'muscle' ? 'muscle' : 'other'];
    const stats = { combat: 0, tech: 0, medical: 0, social: 0, stealth: 10, piloting: 8 };
    for (const s of ['combat', 'tech', 'medical', 'social']) stats[s] = GATE.diff + (MAIN[x.role] === s ? g.main : g.other);
    stats.cool = GATE.diff + g.cool;
    stats.endurance = clamp(Math.round(mean + (rng() + rng() + rng() - 1.5) * GATE.endurance.spread), 3, 20);
    const bag = [];
    if (x.gun) bag.push({ item: { uid: `g${i}`, type: 'pistol', tier: 'standard', look: { frame: x.gun } }, x: 0, y: 0 });
    if (x.deck) bag.push({ item: { uid: `d${i}`, type: 'deck', tier: 'standard' }, x: 0, y: 1 });
    Object.assign(op, {
      id: `${x.role}${seen[x.role]}`, handle: HANDLES[x.role] + (seen[x.role] > 1 ? ' 2' : ''), role: x.role, stats, traits: [], status: [], marks: [],
      gear: { armour: x.vest ? { uid: `v${i}`, type: 'vest', tier: 'standard' } : null, implants: [], bag },
    });
    op.condition = { ...op.condition, fatigue: 0, injury: 'healthy', injuryDays: 0 };
    return op;
  });
}

// ---- settings: applied to the data objects, then put back ------------------------------------------
const ORIGINAL = { aimStep: FIGHT.aimStep, enemies: structuredClone(ENEMIES) };
const RADIO_DECKS = {
  hired: ['alarm', 'alarm', 'aim'], corp: ['backup', 'alarm', 'aim', 'backup'], drone: ['alarm', 'alarm', 'aim'], enforcer: ['aim', 'alarm', 'flank'],
};
function applySettings(dur, exp, deckStyle = 'normal') {
  FIGHT.aimStep = GATE.settings.exposure[exp];
  for (const [kind, [pips, absorb]] of Object.entries(GATE.settings.durability[dur])) {
    ENEMIES[kind].pips = pips;
    if (absorb) ENEMIES[kind].absorb = absorb; else delete ENEMIES[kind].absorb;
    ENEMIES[kind].deck = [...(deckStyle === 'radio' ? RADIO_DECKS[kind] : ORIGINAL.enemies[kind].deck)];
  }
}
function restoreSettings() {
  FIGHT.aimStep = ORIGINAL.aimStep;
  for (const kind of Object.keys(ENEMIES)) Object.assign(ENEMIES[kind], structuredClone(ORIGINAL.enemies[kind]));
}

// ---- plans: the orders each runner gets ---------------------------------------------------------------
const PRIORITY = ['protected', 'radio', 'low'];
const ord = (duty, target = null, fallback = null, priority = PRIORITY) => ({ duty, target, fallback, priority, byStage: null });
const fb = (duty, target = null) => ({ duty, target });
const staged = (o0, o1) => ({ ...o0, byStage: { 0: o0, 1: o1 } });
/** One runner's order under a plan, built once at the start (holdExtract's two stages are the order's own byStage, as the crew's defaults do). */
function planOrder(plan, b, r) {
  const hack = b.type === 'holdHack';
  const tech = r.id === b.goal.protect;
  const bp = Fight.bestProtector(b)?.id === r.id;
  if (plan === 'defaults') return Fight.defaultOrderFor(b, r);
  if (hack && tech) return ord('push', null, fb('hold'));
  switch (plan) {
    case 'attack': return hack ? ord('attack', null, fb('hold')) : staged(ord('attack', null, fb('hold')), ord('attack', null, fb('push')));
    case 'hold': return hack ? ord('hold') : staged(ord('hold'), ord('push', null, fb('hold')));
    case 'protect': return hack ? ord('protect', 'protected', fb('attack')) : staged(ord('protect', null, fb('hold')), bp ? ord('protect', null, fb('push')) : ord('push', null, fb('hold')));
    case 'support': return hack ? ord('support', null, fb('protect', 'protected')) : staged(ord('support', null, fb('hold')), ord('push', null, fb('support')));
    case 'mixed':
      if (hack) return bp ? ord('protect', 'protected', fb('attack')) : ord('attack', null, fb('protect', 'protected'), ['radio', 'protected', 'low']);
      return staged(bp ? ord('protect', null, fb('attack')) : ord('attack', null, fb('hold'), ['low', 'radio']), bp ? ord('protect', null, fb('push')) : ord('push', null, fb('hold')));
    default: throw new Error(`no plan ${plan}`);
  }
}
const setPlan = (b, plan) => { for (const r of b.runners) Fight.setOrder(b, r.id, planOrder(plan, b, r)); };

// ---- the mid-fight layer ("smart"): answers to call-ins and Take Command between rounds --------------
// Answers use only what the call-in card shows: the van call's odds (vanOdds, the card's own read), the tech's
// pips, the shots drawn at them and the radio call. Take Command uses previewRound (what the round screen shows)
// and changes orders with editOrder/setOrder, the Take Command path of runFight(state, { orders }).
function answerSmart(b, due) {
  const d = DILEMMAS[due.id];
  const offered = d.options.filter((o) => Fight.optionAvailable(b, o)).map((o) => o.id);
  if (due.id === 'vanCantWait') {
    const v = Fight.vanOdds(b);
    return v.hold + 0.05 < v.leaveOnTime ? 'hold' : 'goNow'; // hold only when it clearly lowers the chance of leaving someone
  }
  const prot = b.runners.find((r) => r.id === b.goal.protect);
  const shots = b.threats.filter((t) => t.kind === 'aim' && t.target === prot?.id).length;
  if (shots >= 2) return 'cover'; // the shots first
  if (offered.includes('jam')) return 'jam'; // a radio call shown and the tech can jam
  return offered.includes('radio') ? 'radio' : 'carryOn';
}
function takeCommand(b, plan) {
  // The plan's orders come back each round (a Take Command change lasts the round it is made for).
  setPlan(b, plan);
  const pv = Fight.previewRound(b);
  if (!pv) return;
  const prot = b.runners.find((r) => r.id === b.goal.protect);
  const others = Fight.standing(b).filter((r) => r.id !== prot?.id);
  const radio = pv.ifNothing.some((x) => x.key === 'ifNothing.radio');
  const source = b.threats.find((t) => (t.kind === 'backup' || t.kind === 'alarm') && !t.cancelled)?.enemy ?? null;
  // 1. holdHack: the tech is hurt and shots at them are open: everyone else covers them this round.
  const openAtTech = pv.exposure.filter((x) => x.target === prot?.id && !x.shieldedBy).length;
  if (b.type === 'holdHack' && prot && Fight.standing(b).includes(prot) && prot.pips <= Math.ceil(prot.max / 2) && openAtTech) {
    for (const r of others) Fight.setOrder(b, r.id, Fight.editOrder(b, r.id, { duty: 'protect', target: 'protected' }));
    return;
  }
  // 2. A radio call the orders leave unanswered: a jammer (not the tech working the hack) jams, else the best shot goes for the caller.
  const boarding = b.type === 'holdExtract' && b.stage === 1; // never pull a runner off the van to shoot at a caller
  if (radio && source != null && !boarding) {
    const jammer = others.find((r) => r.jammer && r.stats.tech.value >= r.stats.combat.value);
    const shooter = [...others].sort((x, y) => y.stats.combat.value - x.stats.combat.value)[0];
    const pick = jammer ?? shooter;
    if (pick) Fight.setOrder(b, pick.id, Fight.editOrder(b, pick.id, jammer ? { duty: 'support', target: source } : { duty: 'attack', target: source }));
  }
}

// ---- one fight ----------------------------------------------------------------------------------------
/**
 * Play one whole fight the way runFight plays it round by round: draw, (Take Command), a due dilemma is answered,
 * the round plays; death's door pulls back (or, with doorPolicy 'pushOn', fights on). layer: false = the plan's
 * orders as they stand and the standing orders answer call-ins; true = the mid-fight layer.
 */
function playOne({ enc, group, lineup, seed, plan, layer = false, risk = GATE.risk, enduranceMode = 'grown', doorPolicy = 'pullBack', handWithdraw = false, stats = null }) {
  const E = GATE.encounters[enc];
  const type = enc;
  const crew = buildCrew(group, lineup, seed, enduranceMode);
  const b = Fight.buildFight({ type, diff: GATE.diff, threat: GATE.threat, site: E.site, crew, approach: GATE.approach, risk, watched: true }, makeRng(hash('build', enc, group, lineup, seed)));
  setPlan(b, plan);
  const rng = makeRng(hash('play', enc, group, lineup, seed));
  const ever = new Set();
  const asked = {};
  const used = {};
  const causes = {};
  while (!b.end && b.round < 30) {
    if (!b.drawn) Fight.startRound(b, rng);
    if (layer) takeCommand(b, plan);
    if (handWithdraw && b.round === 2) { // the player orders the most hurt runner (not the specialist) out by hand
      const w = [...Fight.standing(b)].filter((r) => r.id !== b.goal.protect).sort((x, y) => x.pips - y.pips)[0];
      if (w) Fight.setOrder(b, w.id, ord('withdraw'));
    }
    for (const key of Object.keys(b.dilemmasFired)) if (!Fight.dilemmaHolds(b, key.split(':')[0])) delete b.dilemmasFired[key];
    const due = Fight.dueDilemmas(b)[0];
    if (due) {
      b.dilemmasFired[due.key] = true;
      asked[due.id] = (asked[due.id] ?? 0) + 1;
      const id = layer ? answerSmart(b, due) : fightAnswer({ battle: b, pending: { id: due.id } }).id;
      used[`${due.id}:${id}`] = (used[`${due.id}:${id}`] ?? 0) + 1;
      const opt = DILEMMAS[due.id].options.find((o) => o.id === id);
      if (opt && Fight.optionAvailable(b, opt)) {
        if (opt.ordersPatch) Fight.applyPatch(b, opt.ordersPatch);
        if (opt.vanWait) b.vanHold = !!opt.vanWait.hold;
      }
    }
    const waving = new Set(b.runners.filter((r) => Fight.orderOf(b, r).duty === 'withdraw').map((r) => r.id)); // ordered out by hand this round
    const round = Fight.playRound(b, rng);
    for (const l of round.lines) if (l.dead) { const c = l.key === 'shotDead' && waving.has(l.targetId) ? 'handWithdraw' : l.key; causes[c] = (causes[c] ?? 0) + 1; }
    for (const r of b.runners) if (r.down || r.dead) ever.add(r.id);
    if (b.end?.result === 'extracted') { // death's door: a watched crew is asked
      const downed = b.runners.find((x) => x.down && !x.dead && !x.fightOn);
      if (downed && doorPolicy === 'pushOn') { b.end = null; downed.fightOn = true; stats && (stats.pushedOn += 1); }
    }
  }
  if (!b.end) Fight.pullBack(b);
  const out = Fight.outcomeOf(b);
  const r = b.end.result;
  return {
    won: r === 'won' ? 1 : 0,
    done: r === 'won' || r === 'lostRunner' || r === 'leftBehind' ? 1 : 0, // the objective done, whatever it cost
    down: ever.size,
    dead: out.filter((o) => o.dead).length,
    left: b.left.length,
    light: out.filter((o) => o.injury === 'light' && !o.down && !o.dead).length,
    serious: out.filter((o) => o.injury === 'serious' && !o.down && !o.dead && !o.missing).length,
    stillDown: out.filter((o) => o.down && !o.missing).length, // downed and not left: critical, saved by the pull-out
    dyingAtEnd: b.runners.filter((x) => x.fightOn && x.down && !x.dead && !x.stable).length, // pushed on for; the run's push-on rule decides
    heat: b.heat, rounds: b.round, end: r, asked, used, causes,
    ordered: !!causes.handWithdraw,
  };
}

function cell(args) {
  const acc = { won: 0, done: 0, down: 0, dead: 0, left: 0, light: 0, serious: 0, stillDown: 0, heat: 0, rounds: 0, deadFights: 0, leftFights: 0, downFights: 0, dyingAtEnd: 0 };
  const ends = {}; const asked = {}; const used = {};
  for (let seed = 1; seed <= SEEDS; seed++) {
    const r = playOne({ ...args, seed });
    for (const k of ['won', 'done', 'down', 'dead', 'left', 'light', 'serious', 'stillDown', 'heat', 'rounds', 'dyingAtEnd']) acc[k] += r[k];
    acc.deadFights += r.dead ? 1 : 0; acc.leftFights += r.left ? 1 : 0; acc.downFights += r.down ? 1 : 0;
    ends[r.end] = (ends[r.end] ?? 0) + 1;
    for (const k of Object.keys(r.asked)) asked[k] = (asked[k] ?? 0) + 1;
    for (const [k, v] of Object.entries(r.used)) used[k] = (used[k] ?? 0) + v;
  }
  for (const k of Object.keys(acc)) acc[k] /= SEEDS;
  for (const k of Object.keys(asked)) asked[k] /= SEEDS;
  return { ...acc, ends, asked, used };
}

// ---- the grid -----------------------------------------------------------------------------------------
const CANDIDATES = [...GATE.fixedPlans.map((p) => ({ plan: p, layer: false, name: p })), ...GATE.fixedPlans.map((p) => ({ plan: p, layer: true, name: `${p}+` }))];
const results = [];
const t0 = Date.now();
for (const dur of DUR) for (const exp of EXP) {
  applySettings(dur, exp);
  for (const enc of ENC) for (const group of GROUPS) for (const lineup of LINEUPS) for (const c of CANDIDATES)
    results.push({ enc, dur, exp, group, lineup, name: c.name, plan: c.plan, layer: c.layer, ...cell({ enc, group, lineup, plan: c.plan, layer: c.layer }) });
  process.stderr.write(`  ${dur} ${exp} done (${Math.round((Date.now() - t0) / 1000)}s)\n`);
}
restoreSettings();

const find = (q) => results.find((r) => Object.entries(q).every(([k, v]) => r[k] === v));
const beats = (a, b) => a.won - b.won || b.down - a.down;
const asGood = (p, best) => best.won - p.won <= GATE.tolerance.won && p.down - best.down <= GATE.tolerance.down && p.heat - best.heat <= GATE.tolerance.heat;

/** The gate over a set of adapted candidates. Returns per-cell reads and the shares. */
function runGate(adaptedNames) {
  const cells = [];
  for (const dur of DUR) for (const exp of EXP) for (const group of GROUPS) for (const lineup of LINEUPS) {
    const best = {}; const matches = {};
    for (const enc of ENC) best[enc] = adaptedNames.map((n) => find({ enc, dur, exp, group, lineup, name: n })).reduce((a, b) => (beats(b, a) > 0 ? b : a));
    for (const plan of GATE.fixedPlans) matches[plan] = ENC.every((enc) => asGood(find({ enc, dur, exp, group, lineup, name: plan }), best[enc]));
    const universal = GATE.fixedPlans.filter((p) => matches[p]);
    const gain = GATE.fixedPlans.every((plan) => ENC.some((enc) => {
      const p = find({ enc, dur, exp, group, lineup, name: plan });
      return best[enc].won - p.won >= GATE.bar.won || p.down - best[enc].down >= GATE.bar.down;
    }));
    cells.push({ dur, exp, group, lineup, best, universal, matches, gain });
  }
  const share = (f) => cells.filter(f).length / cells.length;
  const reworkBy = GATE.fixedPlans.map((p) => [p, share((c) => c.matches[p])]);
  const proceedShare = share((c) => c.gain && !c.universal.length);
  const rework = reworkBy.filter(([, s]) => s >= GATE.cellsNeeded);
  const verdict = rework.length ? 'REWORK' : proceedShare >= GATE.cellsNeeded ? 'PROCEED TO PLAYTEST' : 'NEITHER';
  return { cells, reworkBy, proceedShare, gainShare: share((c) => c.gain), rework, verdict };
}
const FULL = runGate(CANDIDATES.map((c) => c.name));
const CHOICE = runGate(GATE.fixedPlans);

// ---- extra reports -------------------------------------------------------------------------------------
// Toughness check: Over vs On, the defaults, aim-heavy (D2 E3, normal decks) against radio-heavy (D2 E2, radio decks).
function avgWon(dur, exp, group, deckStyle) {
  applySettings(dur, exp, deckStyle);
  let w = 0; let n = 0;
  for (const enc of ENC) for (const lineup of LINEUPS) { w += cell({ enc, group, lineup, plan: 'defaults', deckStyle }).won; n++; }
  restoreSettings();
  return w / n;
}
const tough = {
  aimHeavy: avgWon('D2', 'E3', 'Over', 'normal') - avgWon('D2', 'E3', 'On', 'normal'),
  radioHeavy: avgWon('D2', 'E2', 'Over', 'radio') - avgWon('D2', 'E2', 'On', 'radio'),
};

// Deaths and left-behind per risk level: the game's own settings (D2 E2), all 9 crews, the defaults. Two door policies:
// pull back (what hands-off crews do) and push on (a player who keeps fighting with someone down).
applySettings('D2', 'E2');
const riskRows = [];
for (const doorPolicy of ['pullBack', 'pushOn', 'handWithdraw']) for (const risk of ['cautious', 'steady', 'committed']) for (const enc of ENC) {
  const s = { causes: {}, fights: 0, deadFights: 0, deadAnyOrdered: 0, leftFights: 0, won: 0, down: 0, pushedOn: 0, dyingAtEnd: 0 };
  const pushStats = { pushedOn: 0 };
  for (const group of GROUPS) for (const lineup of LINEUPS) for (let seed = 1; seed <= Math.min(SEEDS, 100); seed++) {
    const r = playOne({ enc, group, lineup, seed, plan: 'defaults', risk, doorPolicy: doorPolicy === 'pushOn' ? 'pushOn' : 'pullBack', handWithdraw: doorPolicy === 'handWithdraw', stats: pushStats });
    for (const [k, v] of Object.entries(r.causes)) s.causes[k] = (s.causes[k] ?? 0) + v;
    s.fights++; s.deadFights += r.dead ? 1 : 0; s.deadAnyOrdered += r.dead && r.ordered ? 1 : 0; s.leftFights += r.left ? 1 : 0; s.won += r.won; s.down += r.down; s.dyingAtEnd += r.dyingAtEnd ? 1 : 0;
  }
  s.pushedOn = pushStats.pushedOn;
  riskRows.push({ doorPolicy, risk, enc, ...s });
}
// Left behind: the defaults in holdExtract, grown and fresh crews, each risk level, D2 E2.
const leftRows = [];
for (const mode of ['grown', 'fresh']) for (const risk of ['cautious', 'steady', 'committed']) {
  let n = 0; let left = 0; let won = 0; let down = 0; let done = 0; let people = 0;
  for (const group of GROUPS) for (const lineup of LINEUPS) for (let seed = 1; seed <= Math.min(SEEDS, 100); seed++) {
    const r = playOne({ enc: 'holdExtract', group, lineup, seed, plan: 'defaults', risk, enduranceMode: mode });
    n++; left += r.left ? 1 : 0; people += r.left; won += r.won; down += r.down; done += r.done;
  }
  leftRows.push({ mode, risk, left: left / n, people: people / n, won: won / n, done: done / n, down: down / n });
}
// Dilemma frequency at the game's own settings (D2 E2), the defaults with standing answers, all 9 crews.
const dilemmaRows = ENC.map((enc) => {
  const c = { fights: 0 }; const used = {};
  for (const group of GROUPS) for (const lineup of LINEUPS) for (let seed = 1; seed <= Math.min(SEEDS, 100); seed++) {
    const r = playOne({ enc, group, lineup, seed, plan: 'defaults' });
    c.fights++;
    for (const k of Object.keys(r.asked)) { c[k] = (c[k] ?? 0) + 1; c[`${k}_calls`] = (c[`${k}_calls`] ?? 0) + r.asked[k]; }
  }
  return { enc, ...c };
});
restoreSettings();

// ---- the game's own starting crews (not part of the declared gate) -------------------------------------
// The sim crews above are built to a spec; the real fresh crew is weaker. The defaults, D2 E2 (the shipped data),
// the first four of createNewGame({ startCrew: 'fresh' }) and of the authored crew, threat 3, per risk level.
applySettings('D2', 'E2');
const realRows = [];
for (const startCrew of ['fresh', 'authored']) for (const risk of ['cautious', 'steady', 'committed']) for (const enc of ENC) {
  const a = { n: 0, won: 0, left: 0, people: 0, down: 0, dead: 0, done: 0 };
  for (let seed = 1; seed <= SEEDS; seed++) {
    const crew = createNewGame({ seed, startCrew }).crew.slice(0, 4);
    const E = GATE.encounters[enc];
    const b = Fight.buildFight({ type: enc, diff: GATE.diff, threat: GATE.threat, site: E.site, crew, approach: 'loud', risk, watched: true }, makeRng(hash('real', enc, seed)));
    const rng = makeRng(hash('realplay', enc, seed));
    const ever = new Set();
    while (!b.end && b.round < 30) {
      if (!b.drawn) Fight.startRound(b, rng);
      for (const key of Object.keys(b.dilemmasFired)) if (!Fight.dilemmaHolds(b, key.split(':')[0])) delete b.dilemmasFired[key];
      const due = Fight.dueDilemmas(b)[0];
      if (due) { b.dilemmasFired[due.key] = true; const id = fightAnswer({ battle: b, pending: { id: due.id } }).id; const opt = DILEMMAS[due.id].options.find((o) => o.id === id); if (opt?.ordersPatch) Fight.applyPatch(b, opt.ordersPatch); if (opt?.vanWait) b.vanHold = !!opt.vanWait.hold; }
      Fight.playRound(b, rng);
      for (const r of b.runners) if (r.down || r.dead) ever.add(r.id);
    }
    const r = b.end.result;
    a.n++; a.won += r === 'won' ? 1 : 0; a.done += ['won', 'lostRunner', 'leftBehind'].includes(r) ? 1 : 0; a.left += b.left.length ? 1 : 0; a.people += b.left.length; a.down += ever.size; a.dead += b.runners.filter((x) => x.dead).length ? 1 : 0;
  }
  realRows.push({ startCrew, risk, enc, ...Object.fromEntries(Object.entries(a).map(([k, v]) => [k, k === 'n' ? v : v / a.n])) });
}
restoreSettings();

// ---- run-level check: the real wiring (runFight, resolvePending) over fresh-crew runs ------------------
function runLevel(job, n) {
  const tally = { fights: 0, calls: {}, won: 0, ends: {}, errors: 0, left: 0, dead: 0 };
  for (let seed = 1; seed <= n; seed++) {
    try {
      let s = createNewGame({ seed, startCrew: 'fresh' });
      s.jobs = [];
      addOffer(s, job);
      const approach = ['loud', 'stealth', 'tech', 'con'][seed % 4];
      s = M.startMission(s, s.jobs[0].id, s.crew.slice(0, templateById(job).crewSize).map((o) => o.id), approach, { callIn: 'every', orders: 'steady' });
      s.activeMission.orders = 'steady';
      for (let g = 0; g < 600 && !s.activeMission.done; g++) {
        const am = s.activeMission;
        if (am.pending) {
          const v = describePending(s);
          const pick = v.choices.find((c) => c.id === (am.pending.kind === 'dilemma' ? (am.pending.id === 'vanCantWait' ? 'goNow' : 'carryOn') : 'out'));
          if (am.pending.kind === 'dilemma') { tally.calls[am.pending.id] = (tally.calls[am.pending.id] ?? 0) + 1; }
          s = resolvePending(s, (pick ?? v.choices.find((c) => c.exit) ?? v.choices[0]).id);
          continue;
        }
        if (am.battle?.engine === 2 && currentStep(am)?.type === 'battle') {
          // Take Command: one order change through the real path, at the first round only.
          const b = am.battle;
          const change = b.round === 0 && b.type === 'holdHack'
            ? { risk: 'steady', orders: Object.fromEntries(b.runners.filter((r) => r.id !== b.goal.protect).map((r) => [r.id, Fight.editOrder(b, r.id, { duty: 'protect', target: 'protected' })])) }
            : {};
          s = runFight(s, change);
          if (!s.activeMission?.battle) tally.fights += 1;
          continue;
        }
        const next = autoStep(s, { force: true });
        if (next === s) break;
        s = next;
      }
      const last = s.activeMission?.report ?? [];
      tally.ends[s.activeMission?.done ? 'done' : 'open'] = (tally.ends[s.activeMission?.done ? 'done' : 'open'] ?? 0) + 1;
      tally.left += (s.activeMission?.missing ?? []).length; tally.dead += (s.activeMission?.fightDead ?? []).length;
      void last;
    } catch (e) { tally.errors += 1; tally.lastError = String(e?.message ?? e); }
  }
  return tally;
}
const runLevelRows = Object.fromEntries(['data_pull', 'warehouse'].map((j) => [j, runLevel(j, 40)]));

// ---- the report ----------------------------------------------------------------------------------------
const cellsOf = (g) => g.cells.length;
const lines = [];
const L = (s = '') => lines.push(s);
L(`# Battle rework, slice 3: the validation gate on the real code (${DATE})`);
L();
L(`\`node scripts/sim-orders.mjs ${SEEDS} ${DATE}\` — played on core/fight.js and core/runfight.js, not the paper rules. The declared gate is the \`GATE\` block at the top of the script (hash \`${GATE_HASH}\`); it was written and the bar confirmed by the owner before this run, and was not changed after.`);
L();
L('## Declared gate');
L();
L(`- Seeds: ${SEEDS} per cell, the same seeds for every plan. Encounters: holdHack (Glass Heights: corp and drones, Office Data Pull's rules) and holdExtract (Docks: hired and enforcers), threat 3 (three enemies), base difficulty 14, steady risk, no overwatch, standby or driver.`);
L(`- Crew groups: Under / On / Over (main stat +0 / +3 / +6, others −5 / −2 / +1, cool −2 / 0 / +3 on a base of 14) x line-ups a (tech, muscle, medic with a deck, gunner), b (tech, muscle, two gunners, one with a machine pistol), c (tech, face, medic, gunner) = 9. Endurance rolled per runner per seed: muscle about 13, others about 8 (a grown crew on the owner's scale); fresh (10 / 5) in the left-behind table.`);
L('- Settings: enemy durability D1 (all minimum), D2 (the game\'s own), D3 (+1 pip) x exposure E1/E2/E3 (aimStep 0 / 2 / 4; E2 is the game\'s own) = 9. D2 E2 is the shipped data.');
L(`- Fixed plans, each one *unchanged* (set once; call-ins answered by the standing orders): ${GATE.fixedPlans.join(', ')}. Adapted plans, chosen per cell and encounter as the best clean-win share (then fewest downs) of the 12 candidates: the six fixed plans, and the same six with the **mid-fight layer** (marked \`+\`): answers to the call-ins (the van by its shown odds; the tech under fire: cover if two shots are on them, else jam if offered, else hit the caller) and Take Command between rounds (the plan's orders come back each round; a hurt tech with open shots gets everyone covering them; an unanswered radio call gets a jammer or the best shot).`);
L(`- "Effectively as good": within ${GATE.tolerance.won * 100} points of clean wins, ${GATE.tolerance.down} downed runners and ${GATE.tolerance.heat} heat per fight (heat is the only resource a fight spends; specials and consumables do not exist in the game yet).`);
L(`- Bar: adapting beats an unchanged plan by ${GATE.bar.won * 100}+ points or ${GATE.bar.down}+ fewer downs in at least one encounter. **Rework** if some unchanged plan is as good as adapting in both encounters in at least two thirds of cells; **proceed** if adapting clears the bar against every unchanged plan in at least two thirds of cells and no plan is as good in both.`);
L('- Measures: *clean win* = the objective done and nobody dead, left behind or walked off (`won`); *job done* also counts a van that left with someone missing; *downs* = runners who went to 0 pips at any point.');
L();
L('## Verdict');
L();
L(`**${FULL.verdict}** (full adapted set, ${cellsOf(FULL)} cells). Rework line (some unchanged plan as good in both encounters): ${FULL.reworkBy.map(([p, s]) => `${p} ${P(s)}`).join(', ')}. Adapting clears the bar against every unchanged plan in ${P(FULL.gainShare)} of cells (${P(FULL.proceedShare)} with no plan as good in both); the line is ${P(GATE.cellsNeeded)}.`);
L();
L(`Adapting by choice only (the six fixed plans, no mid-fight layer): **${CHOICE.verdict}**; rework line ${CHOICE.reworkBy.map(([p, s]) => `${p} ${P(s)}`).join(', ')}; clears the bar in ${P(CHOICE.gainShare)} of cells (${P(CHOICE.proceedShare)} with no plan as good in both).`);
L();
// Per-plan means.
L('### Mean over all cells, per candidate');
L();
L('| Plan | holdHack win | downs | heat | holdExtract win | downs | left behind | heat |');
L('| --- | --- | --- | --- | --- | --- | --- | --- |');
for (const c of CANDIDATES) {
  const m = (enc, k) => results.filter((r) => r.enc === enc && r.name === c.name).reduce((a, r) => a + r[k], 0) / results.filter((r) => r.enc === enc && r.name === c.name).length;
  L(`| ${c.name} | ${P(m('holdHack', 'won'))} | ${D(m('holdHack', 'down'))} | ${D(m('holdHack', 'heat'))} | ${P(m('holdExtract', 'won'))} | ${D(m('holdExtract', 'down'))} | ${P(m('holdExtract', 'leftFights'))} | ${D(m('holdExtract', 'heat'))} |`);
}
L();
L('### Best candidate per setting (share of the 9 crew groups where it is best, per encounter)');
L();
for (const enc of ENC) {
  L(`**${enc}**`);
  L();
  L(`| Setting | ${CANDIDATES.map((c) => c.name).join(' | ')} |`);
  L(`| --- |${CANDIDATES.map(() => ' --- |').join('')}`);
  for (const dur of DUR) for (const exp of EXP) {
    const cs = FULL.cells.filter((c) => c.dur === dur && c.exp === exp);
    L(`| ${dur} ${exp} |${CANDIDATES.map((c) => ` ${P(cs.filter((x) => x.best[enc].name === c.name).length / cs.length)} |`).join('')}`);
  }
  L();
}
const gainBy = (key, vals, f) => vals.map((v) => `${v} ${P(FULL.cells.filter((c) => f(c) === v && c.gain && !c.universal.length).length / FULL.cells.filter((c) => f(c) === v).length)}`).join(', ');
L(`Adapting clears the bar by durability: ${gainBy('dur', DUR, (c) => c.dur)}; by exposure: ${gainBy('exp', EXP, (c) => c.exp)}; by margin: ${gainBy('group', GROUPS, (c) => c.group)}.`);
L();
L('## Mid-fight adapting, alone');
L();
{
  const pairs = ['holdHack', 'holdExtract'].map((enc) => {
    let d = 0; let dd = 0; let n = 0; let better = 0;
    for (const r of results.filter((x) => x.enc === enc && !x.layer)) {
      const p = find({ enc, dur: r.dur, exp: r.exp, group: r.group, lineup: r.lineup, name: `${r.plan}+` });
      d += p.won - r.won; dd += r.down - p.down; n++; if (p.won - r.won >= GATE.bar.won || r.down - p.down >= GATE.bar.down) better++;
    }
    return [enc, d / n, dd / n, better / n];
  });
  L('The same plan with and without the layer (mean over every cell and fixed plan):');
  L();
  L('| Encounter | clean wins gained | downs saved | cells where the layer alone clears the bar |');
  L('| --- | --- | --- | --- |');
  for (const [enc, d, dd, b] of pairs) L(`| ${enc} | ${d >= 0 ? '+' : ''}${(d * 100).toFixed(1)} points | ${dd >= 0 ? '+' : ''}${D(dd)} | ${P(b)} |`);
  const use = {};
  for (const r of results.filter((x) => x.layer)) for (const [k, v] of Object.entries(r.used)) use[k] = (use[k] ?? 0) + v * SEEDS;
  L();
  L(`Answers the layer gave (all layered fights): ${Object.entries(use).map(([k, v]) => `${k} ${Math.round(v)}`).join(', ') || 'none'}.`);
  L();
}
L('## Deaths per risk level');
L();
L('The defaults, the game\'s own settings (D2 E2), all 9 crews x up to 100 seeds, per encounter. Target: none on cautious or steady except after a push on or a hand-ordered withdrawal; about one in 25 committed. "Push on" answers death\'s door with Keep fighting (the death after a push on is decided by the run\'s finish, not by the fight, so the fights count those still dying at the end).');
L();
L('"Hand withdraw" orders the most hurt runner out by hand in round 2.');
L();
L('| Door answer | Risk | Encounter | Fights | Deaths in the fight | Causes | Left behind | Clean win | Downs | Pushed on | Still dying at the end |');
L('| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |');
for (const r of riskRows) L(`| ${r.doorPolicy} | ${r.risk} | ${r.enc} | ${r.fights} | ${r.deadFights} (${r.deadFights ? `1 in ${Math.round(r.fights / r.deadFights)}` : 'none'}) | ${Object.entries(r.causes).map(([k, v]) => `${k} ${v}`).join(', ') || '-'} | ${P(r.leftFights / r.fights)} | ${P(r.won / r.fights)} | ${D(r.down / r.fights)} | ${r.pushedOn} | ${r.dyingAtEnd} |`);
L();
{
  const comm = riskRows.filter((r) => r.risk === 'committed' && r.doorPolicy === 'pullBack');
  const cn = comm.reduce((a, r) => a + r.fights, 0); const cd = comm.reduce((a, r) => a + r.deadFights, 0);
  const other = riskRows.filter((r) => r.risk !== 'committed');
  const od = other.reduce((a, r) => a + r.deadFights, 0);
  L(`Committed, both encounters: ${cd} deaths in ${cn} fights${cd ? ` (about 1 in ${Math.round(cn / cd)})` : ''}. Cautious and steady, both door answers: ${od} deaths in ${other.reduce((a, r) => a + r.fights, 0)} fights.`);
  L();
}
L('## Toughness check');
L();
L(`Over vs On, the defaults, ${GATE.seeds === SEEDS ? '' : ''}D2: gain in clean wins **${P(tough.aimHeavy)}** in aim-heavy fights (E3, normal decks) and **${P(tough.radioHeavy)}** in radio-heavy fights (decks weighted to backup and alarm, E2). The gate asks for the first to be at least twice the second: **${tough.aimHeavy >= 2 * tough.radioHeavy ? 'met' : 'NOT met'}**.`);
L();
L('## Left behind (holdExtract)');
L();
L('The defaults, D2 E2, all 9 crews x up to 100 seeds. Grown = muscle 13 / others 8 endurance; fresh = 10 / 5 (slice 2 showed about 57% on a fresh crew on a steady extraction).');
L();
L('| Crew | Risk | Someone left behind | People left a fight | Clean win | Job done | Downs |');
L('| --- | --- | --- | --- | --- | --- | --- |');
for (const r of leftRows) L(`| ${r.mode} | ${r.risk} | ${P(r.left)} | ${D(r.people)} | ${P(r.won)} | ${P(r.done)} | ${D(r.down)} |`);
L();
L('## How often each dilemma comes up');
L();
L('The defaults with the standing answers, D2 E2, all 9 crews x up to 100 seeds: the share of fights that raise it at least once.');
L();
L('| Encounter | Fights | techUnderFire (fights) | calls a fight | vanCantWait (fights) | calls a fight |');
L('| --- | --- | --- | --- | --- | --- |');
for (const r of dilemmaRows) L(`| ${r.enc} | ${r.fights} | ${P((r.techUnderFire ?? 0) / r.fights)} | ${D((r.techUnderFire_calls ?? 0) / r.fights)} | ${P((r.vanCantWait ?? 0) / r.fights)} | ${D((r.vanCantWait_calls ?? 0) / r.fights)} |`);
L();
{
  const m = (id, enc) => { const rs = results.filter((r) => r.enc === enc && !r.layer); return rs.reduce((a, r) => a + (r.asked[id] ?? 0), 0) / rs.length; };
  L(`Across every setting and fixed plan: holdHack techUnderFire ${P(m('techUnderFire', 'holdHack'))}; holdExtract vanCantWait ${P(m('vanCantWait', 'holdExtract'))}.`);
  L();
}
L('## The game\'s own starting crews');
L();
L('Not part of the declared gate. The defaults on the first four runners of a fresh crew and of the authored crew, D2 E2 (the shipped data), threat 3, hands-off (the standing orders answer call-ins), ' + SEEDS + ' seeds. The sim crews above are built to a spec and are stronger than the fresh crew.');
L();
L('| Crew | Risk | Encounter | Clean win | Job done | Someone left behind | People left a fight | Downs | Died |');
L('| --- | --- | --- | --- | --- | --- | --- | --- | --- |');
for (const r of realRows) L(`| ${r.startCrew} | ${r.risk} | ${r.enc} | ${P(r.won)} | ${P(r.done)} | ${P(r.left)} | ${D(r.people)} | ${D(r.down)} | ${P(r.dead)} |`);
L();
L('## Run-level check (the real wiring)');
L();
L('Fresh-crew runs through `startMission`, `runFight`, `describePending` and `resolvePending` (call-ins answered Leave on time / Carry on, death\'s door Pull back), 40 per job, to show the sim\'s loop is the run\'s loop and nothing in the wiring throws or sticks:');
L();
L('| Job | Runs | Fights finished | Errors | Call-ins | Left behind | Deaths in a fight |');
L('| --- | --- | --- | --- | --- | --- | --- |');
for (const [j, t] of Object.entries(runLevelRows)) L(`| ${j} | 40 | ${t.fights} | ${t.errors}${t.lastError ? ` (${t.lastError})` : ''} | ${JSON.stringify(t.calls)} | ${t.left} | ${t.dead} |`);
L();
L('## What this could not measure');
L();
L('- Specials and consumables: the engine has none, so the "resources" tolerance is heat only. The Special actions button, standby and overwatch (the planning read models neither for the five jobs) are out of the gate.');
L('- Real players: the mid-fight layer is a fixed rule set, a floor for what a player who reads the screens might do, not a ceiling. The playtest is the test of that.');
L('- The adapted plan is chosen on the same seeds it is scored on (paired), which favours it by a point or two.');
L('- Hand-ordered withdrawals ("Pull out" on one runner) are not in the plans, so the "death after a hand-ordered withdrawal" case is only checked by the counts above (deaths with cause handWithdraw; the others are bleedOut and leftDead, committed only, and shotDead without an order, which should not exist).');
L('- Death after a push on is decided by the run (`mission.js` finish), not by the fight; the table counts those still dying.');
L();
L('## Every cell');
L();
L('Full table in the matching `.csv` (' + results.length + ' rows).');
writeFileSync(new URL(`../docs/sims/orders-${DATE}.md`, import.meta.url), lines.join('\n') + '\n');
const head = 'enc,dur,exp,group,lineup,plan,layer,clean_win,job_done,downs,dead,left_behind,light,serious,still_down,heat,rounds,techUnderFire,vanCantWait';
const csv = results.map((r) => [r.enc, r.dur, r.exp, r.group, r.lineup, r.name, r.layer, r.won.toFixed(3), r.done.toFixed(3), r.down.toFixed(3), r.dead.toFixed(3), r.leftFights.toFixed(3), r.light.toFixed(3), r.serious.toFixed(3), r.stillDown.toFixed(3), r.heat.toFixed(3), r.rounds.toFixed(2), (r.asked.techUnderFire ?? 0).toFixed(3), (r.asked.vanCantWait ?? 0).toFixed(3)].join(','));
writeFileSync(new URL(`../docs/sims/orders-${DATE}.csv`, import.meta.url), [head, ...csv].join('\n') + '\n');
console.log(`verdict (full): ${FULL.verdict}; choice only: ${CHOICE.verdict}; proceed ${P(FULL.proceedShare)}, gain ${P(FULL.gainShare)}; rework ${FULL.reworkBy.map(([p, s]) => `${p} ${P(s)}`).join(' ')}`);
console.log(`toughness ${P(tough.aimHeavy)} vs ${P(tough.radioHeavy)}; ${Math.round((Date.now() - t0) / 1000)}s`);
