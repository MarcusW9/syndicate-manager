// Step 0 of the battle rework (drafts/SPEC-battle-orders.md, drafts/NUMBERS-battle-orders.md):
// the paper prototype, played by a script. Standalone: it plays the paper rules, not the game's
// fight code, and imports nothing from the game but the seeded RNG. Nothing in src/ uses it.
//
// It writes two things:
//   docs/sims/step0-<date>.md   ten narrated fights (5 holdHack, 5 holdExtract) and the results
//   docs/sims/step0-<date>.csv  every cell: encounter x durability x exposure x crew x plan
//
//   node scripts/sim-step0.mjs [seeds=400] [date=2026-11-10] [profile=first]
//
// Profiles: `first` is the numbers sheet as written; `hard` is the same with four enemies at the
// start and no toughness pip (a sensitivity check: are the plans different once fights have teeth?).
// The hard profile writes step0-<date>-hard.md / .csv.
//
// Owner's calls used here (2026-11-10): planned damage that already covers an enemy's pips stops
// later attackers; talk is out; overwatch is out of the prototype crews; smoke = cover +1 step for
// everyone; the early van costs +1 heat; a runner withdrawing alone still takes the shots aimed at
// them that round, can be downed by them, and a runner downed while leaving alone dies.
// Sim assumptions (not in the spec; listed in the report): see ASSUMPTIONS below.
import { writeFileSync, mkdirSync } from 'node:fs';
import { makeRng, d20, hash } from '../src/core/rng.js';

const SEEDS = Number(process.argv[2] ?? 400);
const DATE = process.argv[3] ?? '2026-11-10';
const PROFILE = process.argv[4] ?? 'first';
const PROFILES = { first: {}, hard: { startEnemies: 4, toughCool: 99 } };

const ASSUMPTIONS = [
  'Threat 3 for every fight (base difficulty 14, three enemies at the start).',
  'A successful jam cancels every backup and alarm shown this round and takes out one drone (the lowest-numbered).',
  'An unanswered alarm in a pressure fight (holdExtract) brings the next pressure arrival one round earlier.',
  'Specials (smoke, the early van) cost no action. Stims are not carried. No overwatch.',
  'Crew pull-back (someone down on a hands-off fight, the tech leaving, the deadline) ends the fight with no parting shots.',
  'In holdExtract a runner going down ends the fight as a retreat even when the van is there (boarding is the objective).',
  'At the deadline the objective has failed, whatever the risk level (pressing on is not modelled).',
  'Sidearm aim bonuses are left out; muscle carries a revolver (strong hit on a margin of 8), gunners a heritage pistol (10), everyone else a street piece (12).',
];

// ---- numbers (drafts/NUMBERS-battle-orders.md) ------------------------------------------------
const N = {
  base: 14, startEnemies: 3,
  runnerBasePips: 3, toughCool: 12, musclePips: 1,
  cover: { open: 0, half: 2, full: 4 }, hunkerStep: 4,
  aimFloor: 0.1, aimCeil: 0.9,
  attackStep: -2, jamStep: 0, patchStep: 0, boardStep: 0,
  targetFocus: 0.5, protectFocus: 0.75,
  workNeeded: 4, boardNeeded: 2, deadline: 7, vanRound: 3,
  alarmStart: 5, alarmReset: 3, pressureFirst: 3, pressureEvery: 2,
  maxExtraEnemies: 2, hiredFleeBelow: 0.4,
  vanHeat: 1,
  lightBelow: 0.5, seriousBelow: 0.25,
};
Object.assign(N, PROFILES[PROFILE]);
const SUFFIX = PROFILE === 'first' ? '' : `-${PROFILE}`;
const EXPOSURE = { E1: 0, E2: 2, E3: 4 }; // aimStep
const DURABILITY = {
  D1: { hired: [1, 0], corp: [1, 0], drone: [1, 0] }, // [pips, absorb]
  D2: { hired: [1, 0], corp: [2, 0], drone: [1, 1] },
  D3: { hired: [2, 0], corp: [3, 0], drone: [2, 1] },
};
const DECKS = {
  normal: { hired: ['aim', 'aim', 'alarm'], corp: ['aim', 'backup', 'aim', 'flank'], drone: ['aim', 'alarm'] },
  radio: { hired: ['alarm', 'alarm', 'aim'], corp: ['backup', 'alarm', 'aim', 'backup'], drone: ['alarm', 'alarm', 'aim'] },
};
const ENCOUNTERS = {
  holdHack: { type: 'holdHack', kinds: ['corp', 'drone'], cover: { corp: 'half', drone: 'open' } },
  holdExtract: { type: 'holdExtract', kinds: ['hired'], cover: { hired: 'half' } },
};
const CREW_GROUPS = {
  Under: { main: 0, other: -5, cool: -2 },
  On: { main: 3, other: -2, cool: 0 },
  Over: { main: 6, other: 1, cool: 3 },
};
const LINEUPS = {
  a: [{ role: 'tech', jammer: true }, { role: 'muscle', absorb: 1 }, { role: 'medic', jammer: true }, { role: 'gunner' }],
  b: [{ role: 'tech', jammer: true }, { role: 'muscle', absorb: 1 }, { role: 'gunner' }, { role: 'gunner', ap: true }],
  c: [{ role: 'tech', jammer: true }, { role: 'face' }, { role: 'medic' }, { role: 'gunner' }],
};
const HANDLES = { tech: 'Switch', muscle: 'Rook', medic: 'Lotus', gunner: 'Vex', face: 'Silk' };
const MAIN = { tech: 'tech', muscle: 'combat', medic: 'medical', gunner: 'combat', face: 'social' };
const STRONG = { muscle: 8, gunner: 10 };
const RADIO = new Set(['backup', 'alarm']);
const COVERS = ['open', 'half', 'full'];
const better = (c) => COVERS[Math.min(2, COVERS.indexOf(c) + 1)];
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
const chanceOf = (value, diff) => clamp((11 + value - diff) / 20, 0, 1);

// ---- building a fight ---------------------------------------------------------------------------
function buildCrew(group, lineup) {
  const g = CREW_GROUPS[group];
  const seen = {};
  return LINEUPS[lineup].map((x, i) => {
    seen[x.role] = (seen[x.role] ?? 0) + 1;
    const stats = {};
    for (const s of ['combat', 'tech', 'medical', 'social']) stats[s] = N.base + (MAIN[x.role] === s ? g.main : g.other);
    stats.cool = N.base + g.cool;
    const max = N.runnerBasePips + (stats.cool >= N.toughCool ? 1 : 0) + (x.role === 'muscle' ? N.musclePips : 0);
    return {
      id: i + 1, role: x.role, handle: HANDLES[x.role] + (seen[x.role] > 1 ? ' 2' : ''), stats, max, pips: max,
      absorb: x.absorb ?? 0, jammer: !!x.jammer, ap: !!x.ap, strong: STRONG[x.role] ?? 12,
      medic: x.role === 'medic', cover: 'half', down: false, out: false, dead: false,
    };
  });
}

function newEnemy(F, kind) {
  const [pips, absorb] = DURABILITY[F.dur][kind];
  const deck = shuffle([...DECKS[F.deckStyle][kind]], F.rDeck);
  const e = { n: F.enemies.length + 1, kind, pips, max: pips, absorb, cover: ENCOUNTERS[F.enc].cover[kind], out: false, fled: false, deck, di: 0 };
  F.enemies.push(e);
  if (kind === 'hired') F.hiredTotal++;
  return e;
}
function shuffle(a, rng) {
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

function buildFight({ enc, dur, exp, group, lineup, plan, seed, deckStyle = 'normal', log = false }) {
  const key = [enc, dur, exp, group, lineup, deckStyle, seed];
  const F = {
    enc, type: ENCOUNTERS[enc].type, dur, aimStep: EXPOSURE[exp], deckStyle, plan,
    rDeck: makeRng(hash('deck', ...key)), rRoll: makeRng(hash('roll', ...key)),
    crew: buildCrew(group, lineup), enemies: [], hiredTotal: 0,
    round: 0, stage: 0, work: 0, board: 0, vanRound: N.vanRound, clock: N.alarmStart, nextPressure: N.pressureFirst,
    extras: 0, arriving: [], smoke: 1, smokeUsed: 0, vanUsed: 0, heat: 0, end: null,
    dilemmas: { techUnderFire: 0, boardUnderFire: 0 }, log: log ? [] : null,
  };
  F.protect = F.type === 'holdHack' ? F.crew.find((r) => r.role === 'tech').id : null;
  const kinds = ENCOUNTERS[enc].kinds;
  const rComp = makeRng(hash('comp', ...key));
  for (let i = 0; i < N.startEnemies; i++) newEnemy(F, kinds[Math.floor(rComp() * kinds.length)]);
  return F;
}

const standing = (F) => F.crew.filter((r) => !r.down && !r.out && !r.dead);
const enemiesUp = (F) => F.enemies.filter((e) => !e.out && !e.fled);
const runner = (F, id) => F.crew.find((r) => r.id === id);
const say = (F, text) => F.log && F.log.push(text);

// ---- the incoming-shot formula -------------------------------------------------------------------
function aimChance(F, t, { hunker = false, smoke = false } = {}) {
  let cover = t.cover;
  if (hunker) cover = better(cover);
  if (smoke) cover = better(cover);
  const mCool = t.stats.cool - N.base;
  return clamp((11 + F.aimStep - mCool - N.cover[cover] - (hunker ? N.hunkerStep : 0)) / 20, N.aimFloor, N.aimCeil);
}

// ---- telegraph -------------------------------------------------------------------------------------
function lowestPips(list) {
  return [...list].sort((a, b) => a.pips - b.pips || a.id - b.id)[0];
}
function draw(F, e) {
  for (let tries = 0; tries < 8; tries++) {
    if (e.di >= e.deck.length) { shuffle(e.deck, F.rDeck); e.di = 0; }
    const kind = e.deck[e.di++];
    if (kind === 'backup' && F.extras >= N.maxExtraEnemies) continue; // nothing left to send
    return kind;
  }
  return 'aim';
}
function telegraph(F) {
  F.threats = [];
  for (const e of enemiesUp(F)) {
    const kind = draw(F, e);
    let target = null;
    if (kind === 'aim' || kind === 'flank') {
      const up = standing(F);
      const prot = F.protect && up.find((r) => r.id === F.protect);
      if (prot && F.rDeck() < N.protectFocus) target = prot.id;
      else if (F.rDeck() < N.targetFocus) target = lowestPips(up).id;
      else target = up[Math.floor(F.rDeck() * up.length)].id;
    }
    const t = { id: `${F.round}.${e.n}`, kind, enemy: e.n, target, shieldedBy: null, cancelled: false };
    if (kind === 'aim') t.shown = aimChance(F, runner(F, target));
    F.threats.push(t);
  }
}

// ---- plans (orders) ----------------------------------------------------------------------------------
// An order: { duty, target, fallback: { duty, target } | null, priority }. Plans are role rules,
// with stage-aware orders for holdExtract, as the spec's byStage.
const PRIORITY = ['protected', 'radio', 'low'];
const bestProtector = (F) => [...F.crew].filter((r) => r.id !== F.protect).sort((a, b) => (b.max + b.absorb) - (a.max + a.absorb) || a.id - b.id)[0].id;
const o = (duty, target = null, fallback = null, priority = PRIORITY) => ({ duty, target, fallback, priority });
const fb = (duty, target = null) => ({ duty, target });
const capableSupport = (r) => r.medic || (r.jammer && r.stats.tech >= r.stats.combat);

const PLANS = {
  attack: (F, r) => {
    if (F.type === 'holdHack') return r.id === F.protect ? o('push', null, fb('hold')) : o('attack', null, fb('hold'));
    return F.stage === 0 ? o('attack', null, fb('hold')) : o('attack', null, fb('push'));
  },
  hold: (F, r) => {
    if (F.type === 'holdHack') return r.id === F.protect ? o('push', null, fb('hold')) : o('hold');
    return F.stage === 0 ? o('hold') : o('push', null, fb('hold'));
  },
  protect: (F, r) => {
    if (F.type === 'holdHack') return r.id === F.protect ? o('push', null, fb('hold')) : o('protect', 'protected', fb('attack'));
    if (F.stage === 0) return o('protect', null, fb('hold'));
    return r.id === bestProtector(F) ? o('protect', null, fb('push')) : o('push', null, fb('hold'));
  },
  support: (F, r) => {
    if (F.type === 'holdHack') return r.id === F.protect ? o('push', null, fb('hold')) : o('support', null, fb('protect', 'protected'));
    return F.stage === 0 ? o('support', null, fb('hold')) : o('push', null, fb('support'));
  },
  defaults: (F, r) => {
    if (F.type === 'holdHack') {
      if (r.id === F.protect) return o('push', null, fb('hold'));
      if (r.id === bestProtector(F)) return o('protect', 'protected', fb('attack'));
      return capableSupport(r) ? o('support', null, fb('protect', 'protected')) : o('attack', null, fb('protect', 'protected'));
    }
    if (F.stage === 0) return o('hold', null, fb('support'));
    return r.id === bestProtector(F) ? o('protect', null, fb('push')) : o('push', null, fb('hold'));
  },
  mixed: (F, r) => {
    if (F.type === 'holdHack') {
      if (r.id === F.protect) return o('push', null, fb('hold'));
      if (r.id === bestProtector(F)) return o('protect', 'protected', fb('attack'));
      return o('attack', null, fb('protect', 'protected'), ['radio', 'protected', 'low']);
    }
    if (r.id === bestProtector(F)) return o('protect', null, F.stage === 0 ? fb('attack') : fb('push'));
    return F.stage === 0 ? o('attack', null, fb('hold'), ['low', 'radio']) : o('push', null, fb('hold'));
  },
};
const PLAN_NAMES = Object.keys(PLANS);

// ---- the resolver ------------------------------------------------------------------------------------
function riskThreshold(F, r) {
  const level = F.risk ?? 'steady';
  return level === 'cautious' ? Math.ceil(r.max / 2) : level === 'steady' ? 1 : 0;
}
function covered(F, e, res) {
  const plans = res.damage[e.n] ?? [];
  const ap = plans.filter((x) => x).length;
  return ap >= e.pips || plans.length >= e.pips + e.absorb;
}
function enemyOrder(F, list, priority) {
  const lowest = lowestPips(standing(F));
  const key = (e) => {
    const t = F.threats.find((x) => x.enemy === e.n);
    return priority.map((p) => (p === 'protected' ? (t && F.protect && t.target === F.protect ? 0 : 1)
      : p === 'radio' ? (t && RADIO.has(t.kind) ? 0 : 1)
        : p === 'low' ? (t && lowest && t.target === lowest.id ? 0 : 1) : 1));
  };
  return [...list].sort((a, b) => {
    const ka = key(a); const kb = key(b);
    for (let i = 0; i < ka.length; i++) if (ka[i] !== kb[i]) return ka[i] - kb[i];
    return a.n - b.n;
  });
}

function tryDuty(F, r, duty, target, priority, res) {
  switch (duty) {
    case 'withdraw': return { kind: 'withdraw' };
    case 'push':
      if (F.type === 'holdHack') return r.id === F.protect && F.work < N.workNeeded ? { kind: 'work' } : null;
      return F.stage === 1 ? { kind: 'board' } : null;
    case 'attack': {
      const list = enemyOrder(F, enemiesUp(F).filter((e) => !covered(F, e, res)), priority);
      const e = (typeof target === 'number' && list.find((x) => x.n === target)) || list[0];
      if (!e) return null;
      (res.damage[e.n] ??= []).push(r.ap);
      return { kind: 'attack', enemy: e.n };
    }
    case 'protect': {
      const T = target === 'protected' ? F.protect : target ?? (F.protect && F.protect !== r.id ? F.protect : lowestPips(standing(F).filter((x) => x.id !== r.id))?.id);
      if (!T || T === r.id || !standing(F).some((x) => x.id === T)) return null;
      const shot = F.threats.filter((t) => t.kind === 'aim' && t.target === T && !res.shields.has(t.id)).sort((a, b) => b.shown - a.shown || a.enemy - b.enemy)[0];
      if (shot) { res.shields.add(shot.id); return { kind: 'shield', threat: shot.id, for: T }; }
      const mate = runner(F, T);
      if (r.medic && mate.pips < mate.max && !res.patches.has(T)) { res.patches.add(T); return { kind: 'patch', target: T }; }
      return null;
    }
    case 'support': {
      if (r.medic) {
        const hurt = standing(F).filter((x) => x.pips < x.max && !res.patches.has(x.id)).sort((a, b) => a.pips / a.max - b.pips / b.max || a.id - b.id)[0];
        if (hurt) { res.patches.add(hurt.id); return { kind: 'patch', target: hurt.id }; }
      }
      if (r.jammer && !res.jam && F.threats.some((t) => RADIO.has(t.kind))) { res.jam = true; return { kind: 'jam' }; }
      const shot = F.threats.filter((t) => t.kind === 'aim' && t.target !== r.id && !res.shields.has(t.id)).sort((a, b) => b.shown - a.shown || a.enemy - b.enemy)[0];
      if (shot) { res.shields.add(shot.id); return { kind: 'shield', threat: shot.id, for: shot.target }; }
      return null;
    }
    case 'hold': {
      if (F.threats.some((t) => t.kind === 'aim' && t.target === r.id && !res.shields.has(t.id))) return { kind: 'hunker' };
      if (r.cover === 'open') return { kind: 'move' };
      return null;
    }
    default: return null;
  }
}

function resolveOrders(F) {
  const res = { damage: {}, shields: new Set(), patches: new Set(), jam: false };
  const orders = new Map(standing(F).map((r) => [r.id, PLANS[F.plan](F, r)]));
  const order = standing(F).sort((a, b) => (orders.get(a.id).duty === 'protect' ? 0 : 1) - (orders.get(b.id).duty === 'protect' ? 0 : 1) || a.id - b.id);
  const actions = [];
  for (const r of order) {
    const ord = orders.get(r.id);
    let act = null; let from = null;
    if (ord.duty === 'withdraw' || r.pips <= riskThreshold(F, r)) { act = { kind: 'withdraw' }; from = 'safety'; }
    if (!act) { act = tryDuty(F, r, ord.duty, ord.target, ord.priority, res); from = 'duty'; }
    if (!act && ord.fallback) { act = tryDuty(F, r, ord.fallback.duty, ord.fallback.target, ord.priority, res); from = 'fallback'; }
    if (!act) { act = { kind: 'hunker' }; from = 'last'; }
    actions.push({ r, ...act, from, order: ord });
  }
  return { actions, res };
}

// ---- wording (for the narrated fights) ----------------------------------------------------------
const pct = (x) => `${Math.round(x * 100)}%`;
const eName = (F, n) => { const e = F.enemies.find((x) => x.n === n); return `${e.kind} ${n}`; };
function threatLine(F, t) {
  const who = t.target ? runner(F, t.target).handle : null;
  return t.kind === 'aim' ? `${eName(F, t.enemy)} aims at ${who} (${pct(t.shown)}, 1 pip)`
    : t.kind === 'flank' ? `${eName(F, t.enemy)} works round ${who}'s cover`
      : t.kind === 'backup' ? `${eName(F, t.enemy)} radios for backup`
        : `${eName(F, t.enemy)} goes for the alarm`;
}
function intentLine(F, a) {
  const why = a.from === 'safety' ? 'risk: pulling out' : `${a.order.duty}${a.from === 'fallback' ? `, fallback ${a.order.fallback.duty}` : a.from === 'last' ? ', nothing useful' : ''}`;
  const what = a.kind === 'attack' ? `attacks ${eName(F, a.enemy)}` : a.kind === 'shield' ? `shields ${runner(F, a.for).handle}`
    : a.kind === 'patch' ? `patches ${runner(F, a.target).handle}` : a.kind === 'jam' ? 'jams the radio'
      : a.kind === 'work' ? 'works the hack' : a.kind === 'board' ? 'boards the van' : a.kind === 'move' ? 'moves to cover'
        : a.kind === 'withdraw' ? 'withdraws' : 'hunkers';
  return `${a.r.handle} ${what} (${why})`;
}
function ifNothing(F, actions, res) {
  const open = F.threats.filter((t) => (t.kind === 'aim' && !res.shields.has(t.id)) || (RADIO.has(t.kind) && !res.jam) || t.kind === 'flank');
  const shielded = F.threats.filter((t) => res.shields.has(t.id));
  const parts = [];
  if (shielded.length) parts.push(`${shielded.length} shot${shielded.length > 1 ? 's' : ''} taken by a shield`);
  const radio = open.filter((t) => RADIO.has(t.kind));
  if (radio.length) parts.push(`${radio.length} radio call${radio.length > 1 ? 's' : ''} with no one on ${radio.length > 1 ? 'them' : 'it'}`);
  const shots = open.filter((t) => t.kind === 'aim');
  if (shots.length) parts.push(`${shots.length} shot${shots.length > 1 ? 's' : ''} with no response (attacks planned may still stop some)`);
  return parts.length ? `If nothing: ${parts.join('; ')}.` : 'If nothing: every shown threat has a response.';
}

// ---- one round -----------------------------------------------------------------------------------
function playRound(F) {
  F.round++;
  const arrivals = [];
  for (const kind of F.arriving.splice(0)) { const e = newEnemy(F, kind); arrivals.push(`${e.kind} ${e.n} arrives`); }
  if (F.type === 'holdExtract' && F.round >= F.nextPressure && F.extras < N.maxExtraEnemies) {
    F.extras++; F.nextPressure += N.pressureEvery; const e = newEnemy(F, 'hired'); arrivals.push(`pressure: ${e.kind} ${e.n} arrives`);
  }
  for (const r of F.crew) r.hunker = false;
  telegraph(F);
  say(F, `\n**Round ${F.round}**${F.type === 'holdExtract' ? (F.stage === 0 ? ' (holding for the van)' : ' (boarding)') : ''}. ${F.crew.map((r) => `${r.handle} ${r.dead ? 'dead' : r.down ? 'down' : r.out ? 'out' : `${r.pips}/${r.max}${r.cover === 'open' ? ' open' : ''}`}`).join(', ')}.`);
  if (arrivals.length) say(F, `- ${arrivals.join('; ')}.`);
  say(F, `- Threats: ${F.threats.length ? F.threats.map((t) => threatLine(F, t)).join('; ') : 'none, nobody is left shooting'}.`);

  // Specials whose trigger holds (the plan's defaults: smoke at 2+ shots on one runner; the van early).
  const onOne = Math.max(0, ...standing(F).map((r) => F.threats.filter((t) => t.kind === 'aim' && t.target === r.id).length));
  const smokeNow = F.smoke > 0 && onOne >= 2;
  if (smokeNow) { F.smoke--; F.smokeUsed++; say(F, '- Smoke goes down: everyone one step more cover this round.'); }
  if (F.type === 'holdExtract' && F.stage === 0 && !F.vanUsed && (standing(F).some((r) => r.pips <= 1) || (F.round >= 2 && enemiesUp(F).length >= 2))) {
    F.vanUsed = 1; F.heat += N.vanHeat; F.vanRound = Math.max(F.round, F.vanRound - 1); say(F, `- The driver pushes the van: it arrives at the end of round ${F.vanRound} (+1 heat).`);
  }
  if (smokeNow) for (const t of F.threats) if (t.kind === 'aim') t.shown = aimChance(F, runner(F, t.target), { smoke: true });

  const { actions, res } = resolveOrders(F);
  // Dilemma conditions (counted, not raised: hands-off fights carry on).
  const prot = F.protect && runner(F, F.protect);
  if (prot && !prot.down && prot.pips <= 1 && F.threats.some((t) => t.kind === 'backup') && !res.jam) F.dilemmas.techUnderFire++;
  if (F.type === 'holdExtract' && F.stage === 1 && enemiesUp(F).length >= 2 && F.threats.some((t) => t.kind === 'aim' && t.shown >= 0.6)) F.dilemmas.boardUnderFire++;
  say(F, `- Orders: ${actions.map((a) => intentLine(F, a)).join('; ')}.`);
  say(F, `- ${ifNothing(F, actions, res)}`);

  // Resolve: moves and hunkers, then runner actions in order, then threats.
  for (const a of actions) {
    if (a.kind === 'hunker') a.r.hunker = true;
    if (a.kind === 'move') a.r.cover = 'half';
    if (a.kind === 'withdraw') a.r.leaving = true;
  }
  let workBy = null; let boards = [];
  const out = [];
  for (const a of actions) {
    const r = a.r;
    const rollIt = (value, diff, margin = 99) => { const die = d20(F.rRoll); const need = 10 + diff; return { die, need, ok: die + value >= need, strong: die + value >= need + margin }; };
    if (a.kind === 'attack') {
      const e = F.enemies.find((x) => x.n === a.enemy);
      if (e.out || e.fled) { out.push(`${r.handle}'s target is already down`); continue; }
      let cover = e.cover; if (smokeNow) cover = better(cover);
      const x = rollIt(r.stats.combat, N.base + N.attackStep + N.cover[cover], r.strong);
      if (!x.ok) { out.push(`${r.handle} misses ${eName(F, e.n)} (${x.die}+${r.stats.combat} vs ${x.need})`); continue; }
      let dmg = x.strong ? 2 : 1;
      if (e.absorb > 0 && !r.ap) { e.absorb--; dmg--; }
      e.pips -= dmg;
      if (e.pips <= 0) { e.out = true; out.push(`${r.handle} takes out ${eName(F, e.n)}${x.strong ? ' (strong hit)' : ''}`); }
      else out.push(`${r.handle} hits ${eName(F, e.n)}${dmg === 0 ? ', armour soaks it' : ''} (${e.pips} left)`);
    } else if (a.kind === 'jam') {
      const x = rollIt(r.stats.tech, N.base + N.jamStep);
      if (x.ok) {
        for (const t of F.threats) if (RADIO.has(t.kind)) t.cancelled = true;
        const drone = enemiesUp(F).find((e) => e.kind === 'drone');
        if (drone) drone.out = true;
        out.push(`${r.handle} jams the radio${drone ? ` and drops ${eName(F, drone.n)}` : ''}`);
      } else out.push(`${r.handle}'s jam fails`);
    } else if (a.kind === 'patch') {
      const x = rollIt(r.stats.medical, N.base + N.patchStep); const t = runner(F, a.target);
      if (x.ok && !t.down) { t.pips = Math.min(t.max, t.pips + 1); out.push(`${r.handle} patches ${t.handle} (+1)`); } else out.push(`${r.handle}'s patch on ${t.handle} doesn't take`);
    } else if (a.kind === 'board') {
      const x = rollIt(r.stats.cool, N.base + N.boardStep);
      if (x.ok) boards.push(r); out.push(`${r.handle} ${x.ok ? 'makes' : "doesn't make"} it to the van door`);
    } else if (a.kind === 'work') {
      workBy = r;
    } else if (a.kind === 'shield') {
      const t = F.threats.find((x) => x.id === a.threat); t.target = r.id; t.shieldedBy = r.id;
    }
  }
  // Threats resolve.
  let alarms = 0;
  for (const t of F.threats) {
    const e = F.enemies.find((x) => x.n === t.enemy);
    if (e.out || e.fled || t.cancelled) continue;
    if (t.kind === 'aim') {
      const v = runner(F, t.target);
      if (!v || v.down || v.dead || v.out) continue;
      const c = aimChance(F, v, { hunker: v.hunker, smoke: smokeNow });
      const hit = F.rRoll() < c;
      if (!hit) { out.push(`${eName(F, e.n)} misses ${v.handle}${t.shieldedBy ? ' (shielding)' : ''} (${pct(c)})`); continue; }
      if (v.absorb > 0) { v.absorb--; out.push(`${eName(F, e.n)} hits ${v.handle}; the vest takes it`); continue; }
      v.pips--; F.pipsLost = (F.pipsLost ?? 0) + 1;
      if (v.pips <= 0) {
        if (v.leaving) { v.dead = true; out.push(`${eName(F, e.n)} hits ${v.handle} as they pull out alone: **dead**`); }
        else { v.down = true; out.push(`${eName(F, e.n)} hits ${v.handle}: **down**`); }
      } else out.push(`${eName(F, e.n)} hits ${v.handle}${t.shieldedBy ? ' (shielding)' : ''} (${v.pips} left)`);
    } else if (t.kind === 'flank') {
      const v = runner(F, t.target);
      if (v && !v.down && !v.out && !v.dead) { v.cover = 'open'; out.push(`${eName(F, e.n)} gets round ${v.handle}: in the open next round`); }
    } else if (t.kind === 'backup') {
      if (F.extras < N.maxExtraEnemies) { F.extras++; F.arriving.push(e.kind); out.push(`${eName(F, e.n)}'s call goes out: backup next round`); }
    } else if (t.kind === 'alarm') alarms++;
  }
  for (const r of F.crew) if (r.leaving && !r.dead && !r.down) { r.out = true; out.push(`${r.handle} is out of the fight`); }
  for (const r of F.crew) r.leaving = false;
  // Break: hired run when too few of them are left.
  const hiredUp = enemiesUp(F).filter((e) => e.kind === 'hired');
  if (hiredUp.length && hiredUp.length / F.hiredTotal < N.hiredFleeBelow) { for (const e of hiredUp) e.fled = true; out.push('the last of the hired run'); }
  if (out.length) say(F, `- ${out.join('; ')}.`);

  // Progress, clocks, end.
  if (workBy && !workBy.down && !workBy.dead && !workBy.out) F.work++;
  F.board += boards.filter((r) => !r.down && !r.dead).length;
  if (F.type === 'holdHack') {
    F.clock -= 1 + alarms;
    if (F.clock <= 0) { if (F.extras < N.maxExtraEnemies) { F.extras++; F.arriving.push(ENCOUNTERS[F.enc].kinds[0]); say(F, '- The alarm clock runs out: one more on the way.'); } F.clock = N.alarmReset; }
  } else {
    F.nextPressure -= alarms;
    if (F.stage === 0 && F.round >= F.vanRound) { F.stage = 1; say(F, '- The van pulls in.'); }
  }
  const prot2 = F.protect && runner(F, F.protect);
  if (F.type === 'holdHack' && F.work >= N.workNeeded) return finish(F, 'won', `Hack done (${F.work} rounds of work).`);
  if (F.type === 'holdExtract' && F.board >= N.boardNeeded) return finish(F, 'won', 'Everyone is in the van.');
  if (prot2 && (prot2.down || prot2.dead)) return finish(F, 'lost', `${prot2.handle} is down: the hack is lost, the crew pulls out.`);
  if (prot2 && prot2.out) return finish(F, 'abandoned', `${prot2.handle} pulled out: the hack is abandoned.`);
  if (F.crew.some((r) => r.down)) return finish(F, 'extracted', 'Someone is down: the crew pulls back.');
  if (!standing(F).length) return finish(F, 'gone', 'Nobody left in the fight.');
  if (F.round >= N.deadline) return finish(F, 'deadline', 'Out of time.');
  return null;
}

function finish(F, end, text) {
  F.end = end; say(F, `\n**End: ${text}**`); return F;
}

function play(args) {
  const F = buildFight(args);
  F.risk = args.risk ?? 'steady';
  say(F, `${F.crew.map((r) => `${r.handle} (${r.role}, ${r.max} pips${r.absorb ? ', vest' : ''}${r.jammer ? ', jammer' : ''}${r.ap ? ', ap' : ''})`).join(', ')} against ${F.enemies.map((e) => `${e.kind} ${e.n} (${e.pips} pip${e.pips > 1 ? 's' : ''}${e.absorb ? ', armoured' : ''})`).join(', ')}.`);
  while (!F.end) playRound(F);
  return F;
}

// ---- outcomes -------------------------------------------------------------------------------------
function outcome(F) {
  let light = 0; let serious = 0;
  for (const r of F.crew) {
    if (r.dead || r.down) continue;
    const s = r.pips / r.max;
    if (s < N.seriousBelow) serious++; else if (s < N.lightBelow) light++;
  }
  return {
    won: F.end === 'won' ? 1 : 0, down: F.crew.filter((r) => r.down).length, dead: F.crew.filter((r) => r.dead).length,
    pips: F.pipsLost ?? 0, light, serious, specials: F.smokeUsed + F.vanUsed, heat: F.heat, rounds: F.round,
    techUnder: F.dilemmas.techUnderFire ? 1 : 0, boardUnder: F.dilemmas.boardUnderFire ? 1 : 0, end: F.end,
  };
}
function cell(args) {
  const sum = { won: 0, down: 0, dead: 0, pips: 0, light: 0, serious: 0, specials: 0, heat: 0, rounds: 0, techUnder: 0, boardUnder: 0 };
  const ends = {};
  for (let seed = 1; seed <= SEEDS; seed++) {
    const r = outcome(play({ ...args, seed }));
    for (const k of Object.keys(sum)) sum[k] += r[k];
    ends[r.end] = (ends[r.end] ?? 0) + 1;
  }
  for (const k of Object.keys(sum)) sum[k] /= SEEDS;
  return { ...sum, ends };
}

// ---- the grid -------------------------------------------------------------------------------------
const TOL = { won: 0.05, down: 0.25, specials: 0.3 };
const results = []; // { enc, dur, exp, group, lineup, plan, ...cell }
const t0 = Date.now();
for (const enc of Object.keys(ENCOUNTERS)) for (const dur of Object.keys(DURABILITY)) for (const exp of Object.keys(EXPOSURE))
  for (const group of Object.keys(CREW_GROUPS)) for (const lineup of Object.keys(LINEUPS)) for (const plan of PLAN_NAMES)
    results.push({ enc, dur, exp, group, lineup, plan, ...cell({ enc, dur, exp, group, lineup, plan }) });

const find = (q) => results.find((r) => Object.entries(q).every(([k, v]) => r[k] === v));
const beats = (a, b) => a.won - b.won || b.down - a.down; // higher win, then fewer downs
const asGood = (p, best) => best.won - p.won <= TOL.won && p.down - best.down <= TOL.down && p.specials - best.specials <= TOL.specials;

// Per cell (setting x crew group): the adapted plan per encounter, and whether any unchanged plan matches it in both.
const cells = [];
for (const dur of Object.keys(DURABILITY)) for (const exp of Object.keys(EXPOSURE)) for (const group of Object.keys(CREW_GROUPS)) for (const lineup of Object.keys(LINEUPS)) {
  const best = {}; const matches = {};
  for (const enc of Object.keys(ENCOUNTERS)) {
    const rows = PLAN_NAMES.map((plan) => find({ enc, dur, exp, group, lineup, plan }));
    best[enc] = rows.reduce((a, b) => (beats(b, a) > 0 ? b : a));
  }
  for (const plan of PLAN_NAMES) matches[plan] = Object.keys(ENCOUNTERS).every((enc) => asGood(find({ enc, dur, exp, group, lineup, plan }), best[enc]));
  const universal = PLAN_NAMES.filter((p) => matches[p]);
  // Adapting pays: every unchanged plan is clearly beaten by the adapted plan in at least one encounter.
  const gain = PLAN_NAMES.every((plan) => Object.keys(ENCOUNTERS).some((enc) => {
    const p = find({ enc, dur, exp, group, lineup, plan });
    return best[enc].won - p.won >= 0.10 || p.down - best[enc].down >= 0.5;
  }));
  cells.push({ dur, exp, group, lineup, best, universal, matches, gain });
}
const share = (f) => cells.filter(f).length / cells.length;
const reworkBy = PLAN_NAMES.map((p) => [p, share((c) => c.matches[p])]);
const rework = reworkBy.filter(([, s]) => s >= 2 / 3);
const proceedShare = share((c) => c.gain && !c.universal.length);

// Toughness check: Over vs On gain with the defaults plan, aim-heavy (E3, normal decks) vs radio-heavy decks (E2).
function avgWon(q, deckStyle = 'normal') {
  let w = 0; let n = 0;
  for (const enc of Object.keys(ENCOUNTERS)) for (const lineup of Object.keys(LINEUPS)) {
    w += cell({ enc, lineup, plan: 'defaults', deckStyle, ...q }).won; n++;
  }
  return w / n;
}
const tough = {
  aimHeavy: avgWon({ dur: 'D2', exp: 'E3', group: 'Over' }) - avgWon({ dur: 'D2', exp: 'E3', group: 'On' }),
  radioHeavy: avgWon({ dur: 'D2', exp: 'E2', group: 'Over' }, 'radio') - avgWon({ dur: 'D2', exp: 'E2', group: 'On' }, 'radio'),
};

// Risk levels: the defaults plan, On level, line-up a, D2 E2.
const riskRows = ['cautious', 'steady', 'committed'].map((risk) => {
  const out = {};
  for (const enc of Object.keys(ENCOUNTERS)) {
    const s = { won: 0, down: 0, dead: 0, abandoned: 0 };
    for (let seed = 1; seed <= SEEDS; seed++) {
      const F = play({ enc, dur: 'D2', exp: 'E2', group: 'On', lineup: 'a', plan: 'defaults', seed, risk });
      const r = outcome(F); s.won += r.won; s.down += r.down; s.dead += r.dead; s.abandoned += F.end === 'abandoned' ? 1 : 0;
    }
    for (const k of Object.keys(s)) s[k] /= SEEDS;
    out[enc] = s;
  }
  return { risk, ...out };
});

// ---- the report -------------------------------------------------------------------------------------
const P = (x) => `${Math.round(x * 100)}%`;
const D = (x) => x.toFixed(2);
const lines = [];
lines.push(`# Step 0: the battle rework's paper rules, played by script (${DATE}${SUFFIX ? `, profile ${PROFILE}` : ''})`);
lines.push('');
lines.push(`Generated by \`node scripts/sim-step0.mjs ${SEEDS} ${DATE} ${PROFILE}\`. Profile **${PROFILE}**${PROFILE === 'hard' ? ' (four enemies at the start, no toughness pip)' : ' (the numbers sheet as written)'}. The paper rules of \`drafts/SPEC-battle-orders.md\` with the first values of \`drafts/NUMBERS-battle-orders.md\`, standalone (not the game's fight code). ${SEEDS} seeds per cell; every cell is in \`step0-${DATE}${SUFFIX}.csv\`.`);
lines.push('');
lines.push('Fights are hands-off (no dilemmas raised; their conditions are counted). Risk is steady unless stated.');
lines.push('');
lines.push('**Owner calls used:** planned damage that covers an enemy stops later attackers; no talk; no overwatch; smoke = cover +1 step for everyone; the early van costs +1 heat; a runner withdrawing alone takes the shots aimed at them that round and dies if they are downed while leaving.');
lines.push('');
lines.push('**Sim assumptions** (not in the spec; each needs a call before code):');
for (const a of ASSUMPTIONS) lines.push(`- ${a}`);
lines.push('');
lines.push('**Plans:** `attack` (everyone attacks; the tech works in holdHack; boards only when nothing is left to attack), `hold` (hunker when shot at; board in stage 1), `protect` (everyone shields the tech / the lowest-pips runner; one protector while boarding), `support` (patch, jam, shield others), `defaults` (the spec\'s crew-made orders), `mixed` (one protector, the rest attack radio sources first).');
lines.push('');

lines.push('## The gate');
lines.push('');
lines.push(`Cells: ${cells.length} (3 durability x 3 exposure x 3 crew margins x 3 line-ups). Tolerances: within ${P(TOL.won)} success, ${TOL.down} downed runners and ${TOL.specials} specials of the adapted plan.`);
lines.push('');
lines.push('| Unchanged plan | Cells where it is as good as the adapted plan in both encounters |');
lines.push('| --- | --- |');
for (const [p, s] of reworkBy) lines.push(`| ${p} | ${P(s)} |`);
lines.push('');
lines.push(`Proceed condition (adapting gains 10+ points or 0.5+ fewer downs in an encounter, and no universal plan): **${P(proceedShare)}** of cells (needs two thirds).`);
lines.push('');
lines.push(`**Verdict on these numbers: ${rework.length ? `REWORK (${rework.map(([p]) => p).join(', ')} is as good as adapting in two thirds or more of cells)` : proceedShare >= 2 / 3 ? 'PROCEED to the playtest' : 'NEITHER: no universal plan, but adapting does not pay enough often enough'}.**`);
lines.push('');

lines.push('## Success by plan (averaged over exposure, crews and line-ups)');
lines.push('');
for (const enc of Object.keys(ENCOUNTERS)) {
  lines.push(`**${enc}**`);
  lines.push('');
  lines.push(`| Plan | ${Object.keys(DURABILITY).map((d) => `${d} won / down / dead`).join(' | ')} |`);
  lines.push(`| --- | ${Object.keys(DURABILITY).map(() => '---').join(' | ')} |`);
  for (const plan of PLAN_NAMES) {
    const cols = Object.keys(DURABILITY).map((dur) => {
      const rows = results.filter((r) => r.enc === enc && r.dur === dur && r.plan === plan);
      const a = (k) => rows.reduce((s, r) => s + r[k], 0) / rows.length;
      return `${P(a('won'))} / ${D(a('down'))} / ${D(a('dead'))}`;
    });
    lines.push(`| ${plan} | ${cols.join(' | ')} |`);
  }
  lines.push('');
}

lines.push('## Which plan is best, by setting (the adapted plan, most common across the 9 crews)');
lines.push('');
lines.push(`| Setting | holdHack | holdExtract |`);
lines.push('| --- | --- | --- |');
for (const dur of Object.keys(DURABILITY)) for (const exp of Object.keys(EXPOSURE)) {
  const cs = cells.filter((c) => c.dur === dur && c.exp === exp);
  const top = (enc) => { const n = {}; for (const c of cs) n[c.best[enc].plan] = (n[c.best[enc].plan] ?? 0) + 1; return Object.entries(n).sort((a, b) => b[1] - a[1]).map(([p, k]) => `${p} ${k}`).join(', '); };
  lines.push(`| ${dur} ${exp} | ${top('holdHack')} | ${top('holdExtract')} |`);
}
lines.push('');

lines.push('## By crew margin (defaults plan, D2, all exposures and line-ups)');
lines.push('');
lines.push('| Crew | holdHack won / down | holdExtract won / down |');
lines.push('| --- | --- | --- |');
for (const group of Object.keys(CREW_GROUPS)) {
  const col = (enc) => { const rows = results.filter((r) => r.enc === enc && r.dur === 'D2' && r.group === group && r.plan === 'defaults'); const a = (k) => rows.reduce((s, r) => s + r[k], 0) / rows.length; return `${P(a('won'))} / ${D(a('down'))}`; };
  lines.push(`| ${group} | ${col('holdHack')} | ${col('holdExtract')} |`);
}
lines.push('');

lines.push('## Risk levels (defaults plan, On level, line-up a, D2 E2)');
lines.push('');
lines.push('| Risk | holdHack won / abandoned / down / dead | holdExtract won / down / dead |');
lines.push('| --- | --- | --- |');
for (const r of riskRows) lines.push(`| ${r.risk} | ${P(r.holdHack.won)} / ${P(r.holdHack.abandoned)} / ${D(r.holdHack.down)} / ${D(r.holdHack.dead)} | ${P(r.holdExtract.won)} / ${D(r.holdExtract.down)} / ${D(r.holdExtract.dead)} |`);
lines.push('');

lines.push('## Toughness check');
lines.push('');
lines.push(`Over vs On, defaults plan, D2: success gain **${P(tough.aimHeavy)}** in aim-heavy fights (E3) and **${P(tough.radioHeavy)}** in radio-heavy fights (decks weighted to backup and alarm, E2). The gate asks for the first to be at least twice the second: **${tough.aimHeavy >= 2 * tough.radioHeavy ? 'met' : 'not met'}**.`);
lines.push('');

lines.push('## Pacing: how often a dilemma\'s conditions came up (defaults plan, D2 E2, all crews)');
lines.push('');
for (const enc of Object.keys(ENCOUNTERS)) {
  const rows = results.filter((r) => r.enc === enc && r.dur === 'D2' && r.exp === 'E2' && r.plan === 'defaults');
  const k = enc === 'holdHack' ? 'techUnder' : 'boardUnder';
  lines.push(`- ${enc}: ${enc === 'holdHack' ? 'techUnderFire' : 'boardUnderFire'} in ${P(rows.reduce((s, r) => s + r[k], 0) / rows.length)} of fights; average length ${D(rows.reduce((s, r) => s + r.rounds, 0) / rows.length)} rounds.`);
}
lines.push('');

lines.push('## Ten fights, narrated (defaults plan, On level, line-up a, D2 E2, steady)');
lines.push('');
for (const enc of Object.keys(ENCOUNTERS)) for (let seed = 1; seed <= 5; seed++) {
  const F = play({ enc, dur: 'D2', exp: 'E2', group: 'On', lineup: 'a', plan: 'defaults', seed, log: true });
  lines.push(`### ${enc}, seed ${seed}`);
  lines.push('');
  lines.push(...F.log);
  lines.push('');
}

mkdirSync('docs/sims', { recursive: true });
writeFileSync(`docs/sims/step0-${DATE}${SUFFIX}.md`, `${lines.join('\n')}\n`);
const csvKeys = ['enc', 'dur', 'exp', 'group', 'lineup', 'plan', 'won', 'down', 'dead', 'pips', 'light', 'serious', 'specials', 'heat', 'rounds'];
writeFileSync(`docs/sims/step0-${DATE}${SUFFIX}.csv`, `${csvKeys.join(',')}\n${results.map((r) => csvKeys.map((k) => (typeof r[k] === 'number' ? +r[k].toFixed(4) : r[k])).join(',')).join('\n')}\n`);
console.log(`Step 0: ${results.length} cells x ${SEEDS} seeds in ${((Date.now() - t0) / 1000).toFixed(1)}s.`);
for (const [p, s] of reworkBy) console.log(`  ${p.padEnd(9)} as good as adapted in both encounters: ${P(s)} of cells`);
console.log(`  proceed condition: ${P(proceedShare)} of cells; toughness ${P(tough.aimHeavy)} vs ${P(tough.radioHeavy)}`);
console.log(`Wrote docs/sims/step0-${DATE}${SUFFIX}.md and .csv`);
