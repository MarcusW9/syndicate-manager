// Security contracts (owner, 2026-11-21; drafts/PROPOSAL-security-contracts.md). Pure logic.
//
// A client pays the tong a weekly retainer for runners kept on a post: Guard, Escort or Watch
// (data/contracts.js). The runners are away for the contract's days. Each day after the first
// one roll on the post's stats decides the day's line: quiet, good (a small bonus), rough (a
// light injury or heat), or an incident: the post is hit and the crew calls it in (a blocking
// decision: hold the post, or give it up and come home). Pay builds up day by day and is paid
// on Sunday with the work boards' take (time.js settleWeek). Pulling runners off early keeps
// the pay for the days done and costs a little trust.
//
// Owner's answers (2026-11-21): no fame or standing (only experience, at a low rate); a runner
// can be pulled off onto a main job; three kinds; Claude drafts the text, the owner marks it.
//
// Death rule: nothing on a contract can kill anyone. The worst is a serious injury, and only
// after the player chose to hold the post with its odds shown. Giving it up always brings
// everyone home unhurt.
//
// Randomness: hashRng from the seed, the contract and the day, so no other roll moves.

import { takenFor } from './loot.js';
import { asideFor, capLog } from './advlog.js';
import { CONTRACT_KINDS, SLOT_PAY, POST_THREAT, INCIDENT_LINES } from '../data/contracts.js';
import { CLIENTS } from '../data/clients.js';
import { NAMES } from '../config/names.js';
import { availability, crewRoll, worsenInjury, setInjury } from './crew.js';
import { successChance, riskLabel } from './risk.js';
import { d20, hashRng, pick } from './rng.js';
import { gainXp } from './development.js';
import { keepGrowth, sumGrowth, growthText } from './grew.js';
import { adjustTrust } from './clients.js';
import { addHeat } from './heat.js';
import { moveCash, money } from './money.js';
import { noteInjury } from './earned.js';
import { nextRng } from './random.js';
import { HOME_HALL } from '../data/halls.js';
import { COUNT_BY_THREAT, FIGHT } from '../data/fights.js';
import { INJURY_DAYS } from './crew.js';
import { recordSummary, recordFight } from './record.js';
import { checkMilestones } from './milestones.js';
import { pickSite } from '../data/sites.js';
import { stageSpots, stageNeed } from './fightmap.js';
import { buildFight, fightDiff, startRound } from './fight.js';
import { fightSnapshot, stageOf } from './runfight.js';
import { rollTarget } from './risk.js';
import { autoRun } from './autorun.js';
import { closeMission } from './mission.js';
import { postTemplate } from '../data/contracts.js';

export const CONTRACT = {
  boardSize: 3, // offers up each week (Monday), gone by Sunday
  difficulty: 6, // side-task level; the district's POST_THREAT is added
  xpPerDay: 1, // in the day's stat, per runner: experience only, no fame or standing
  fatiguePerDay: 6, // against the 8 a day everyone rests
  goodMargin: 8, // a roll this far over: a good day
  incidentMargin: -6, // this far under (or a natural 1): the post is hit
  tip: 0.15, // a good day's bonus: this share of a slot's week
  heldBonus: 0.5, // holding a hit post: this share of a slot's week, per runner
  trust: { week: 2, pullOff: -3, gaveUp: -3, lost: -5, held: 2 },
  fightThreat: 3, // a hit post's fight: this plus the district's POST_THREAT (Old Town 3: three attackers)
};

const round50 = (n) => Math.round(n / 50) * 50;
const districtText = (d) => NAMES.districtsInText?.[d] ?? NAMES.districts?.[d] ?? d;
const clientName = (id) => CLIENTS.find((c) => c.id === id)?.name ?? 'the client';
const names = (ops) => (ops.length > 1 ? `${ops.slice(0, -1).map((o) => o.handle).join(', ')} and ${ops.at(-1).handle}` : ops[0]?.handle ?? '');
const fill = (text, vars) => text.replace(/\{(\w+)\}/g, (m, k) => (vars[k] ?? m));

export const contractsOf = (state) => state.contracts ?? { offers: [], active: [], seq: 0 };
export const kindOf = (c) => CONTRACT_KINDS[c.kind];

/** What a post pays a runner-slot over its whole length. */
export const slotTotal = (c) => round50((c.slotPay * c.days * kindOf(c).payShape) / 7);

/** The post's difficulty: the base plus the district's. */
export const postDifficulty = (c) => CONTRACT.difficulty + (POST_THREAT[c.district] ?? 1);

/** A runner on a post today, if any: the contract. */
export const contractFor = (state, opId) => contractsOf(state).active.find((c) => !c.ended && c.crewIds.includes(opId)) ?? null;

/**
 * The odds on a post for a picked crew, on its main stat: { op, value, chance, risk }. The day's
 * stat alternates between the kind's two, so this is the main one's read.
 */
export function contractOdds(state, offer, crewIds) {
  const crew = crewIds.map((id) => state.crew.find((o) => o.id === id)).filter(Boolean);
  if (!crew.length) return null;
  const k = kindOf(offer);
  const reads = k.stats.map((stat) => ({ stat, ...crewRoll(crew, stat, { recommended: offer.slots, job: { side: true, solo: crew.length === 1, district: offer.district } }) }));
  const best = reads.reduce((a, b) => (b.value > a.value ? b : a));
  const chance = successChance(Math.min(...reads.map((r) => r.value)), postDifficulty(offer));
  return { op: best.op, value: best.value, reads, chance, risk: riskLabel(chance) };
}

/**
 * Monday: three posts from clients the tong has met (any client once none has been), drawn
 * from the seed and the week so no other roll moves. Last week's offers go. Mutates.
 */
export function refreshContracts(state) {
  const ct = (state.contracts = structuredClone(contractsOf(state)));
  const monday = state.day - ((state.day - 1) % 7);
  const rng = hashRng(state.seed, 'contracts', monday);
  const met = CLIENTS.filter((c) => state.clients && c.id in state.clients && SLOT_PAY[c.district]);
  const pool = met.length ? met : CLIENTS.filter((c) => c.district === 'oldTown');
  const kinds = Object.keys(CONTRACT_KINDS);
  ct.offers = [];
  const turn = Math.floor(rng() * kinds.length); // one of each kind, in a weekly order
  for (let i = 0; i < CONTRACT.boardSize && pool.length; i++) {
    const client = pick(rng, pool);
    const kind = kinds[(turn + i) % kinds.length];
    const k = CONTRACT_KINDS[kind];
    const [lo, hi] = k.days;
    ct.seq += 1;
    ct.offers.push({
      id: `ct-${ct.seq}`, kind, clientId: client.id, district: client.district,
      slots: k.slots, days: lo + Math.floor(rng() * (hi - lo + 1)), slotPay: SLOT_PAY[client.district],
      post: fill(pick(rng, k.posts), { client: client.name, district: districtText(client.district) }),
      expiresDay: monday + 6,
    });
  }
}

/** Put runners on a post from this week's offers. They're away until it ends. */
export function takeContract(prev, offerId, crewIds) {
  const ct0 = contractsOf(prev);
  const offer = ct0.offers.find((o) => o.id === offerId);
  if (!offer || !crewIds.length || crewIds.length > offer.slots || new Set(crewIds).size !== crewIds.length) return prev;
  const crew = crewIds.map((id) => prev.crew.find((o) => o.id === id));
  if (crew.some((o) => !o || o.freelance || !availability(prev, o).ok)) return prev;
  const state = structuredClone(prev);
  const ct = (state.contracts = contractsOf(state));
  const endDay = state.day + offer.days;
  for (const id of crewIds) state.crew.find((o) => o.id === id).condition.awayUntil = endDay;
  ct.offers = ct.offers.filter((o) => o.id !== offerId);
  ct.active.push({ ...offer, crewIds: [...crewIds], startDay: state.day, endDay, owed: 0, log: [], ended: null, grew: [], graduated: [] });
  state.inbox.unshift({
    id: `ct-sent-${offer.id}`, type: 'job', day: state.day,
    subject: `${names(crew)} ${crew.length > 1 ? 'are' : 'is'} on ${/^[aeiou]/i.test(kindOf(offer).name) ? 'an' : 'a'} ${kindOf(offer).name.toLowerCase()} post for ${clientName(offer.clientId)}`,
    body: `${offer.post} Until day ${endDay}. ${money(offer.slotPay)} a runner a week${kindOf(offer).payShape !== 1 ? ' (an escort pays half as much again for the days)' : ''}, paid on Sunday.`,
    blocking: false, read: true,
  });
  return state;
}

/** End a post now: the runners come home today, pay for the days done is kept. Mutates. */
function endContract(state, c, how) {
  c.ended = { day: state.day, how };
  for (const id of c.crewIds) {
    const op = state.crew.find((o) => o.id === id);
    if (op && (op.condition.awayUntil ?? 0) > state.day) op.condition.awayUntil = state.day;
  }
}

/** Pull the runners off a post early (onto a main job, say): trust -3, the pay so far is kept. */
export function pullOff(prev, contractId) {
  const c0 = contractsOf(prev).active.find((c) => c.id === contractId && !c.ended);
  if (!c0) return prev;
  const state = structuredClone(prev);
  const c = state.contracts.active.find((x) => x.id === contractId);
  if (state.inbox.some((m) => m.kind === 'contract' && !m.resolved && m.payload?.contractId === contractId)) return prev; // answer the call first
  endContract(state, c, 'pulled');
  const t = adjustTrust(state, c.clientId, CONTRACT.trust.pullOff);
  logPost(c, { day: state.day, tone: 'warn', text: `Pulled off the post early.${t ? ` ${clientName(c.clientId)}: trust ${t}.` : ''}` });
  return state;
}

/** The day's pay on a post: each runner's share of a slot's week. */
const dayPay = (c) => (c.slotPay * kindOf(c).payShape * c.crewIds.length) / 7;

/**
 * Daily, after side tasks return: every running post plays its day. A post hit today stops and
 * posts a blocking call (RESOLVER below); a post at its last day ends and reports. Mutates.
 */
export function tickContracts(state) {
  const ct = contractsOf(state);
  if (!ct.active.length) return;
  state.contracts = ct;
  for (const c of ct.active) {
    if (c.ended || state.day <= c.startDay) continue;
    if (state.inbox.some((m) => m.kind === 'contract' && !m.resolved && m.payload?.contractId === c.id)) continue; // waiting on a call
    playDay(state, c);
    const called = state.inbox.some((m) => m.kind === 'contract' && !m.resolved && m.payload?.contractId === c.id);
    if (!c.ended && !called && state.day >= c.endDay) finish(state, c);
  }
}

/** A post's day log keeps its last LOG_KEEP lines (core/advlog.js). */
function logPost(c, entry) {
  c.log.push(entry);
  capLog(c.log);
}

function playDay(state, c) {
  const crew = c.crewIds.map((id) => state.crew.find((o) => o.id === id)).filter((o) => o && o.condition.injury !== 'dead');
  if (!crew.length) { endContract(state, c, 'empty'); return; }
  const k = kindOf(c);
  const stat = k.stats[(state.day - c.startDay) % k.stats.length];
  const roll = crewRoll(crew, stat, { recommended: c.slots, job: { side: true, solo: crew.length === 1, district: c.district } });
  const rng = hashRng(state.seed, 'contract', c.id, state.day);
  const die = d20(rng);
  const margin = die + roll.value - (10 + postDifficulty(c));
  const vars = { who: roll.op.handle, client: clientName(c.clientId), n: 3 + Math.floor(rng() * 3) };
  c.owed += dayPay(c);
  const aside = asideFor(state.seed, c.id, state.day, roll.op); // the adventure log's personality (core/advlog.js), its own hash

  for (const op of crew) {
    keepGrowth(state, c, op, gainXp(op, crew, stat, CONTRACT.xpPerDay, state.day), `a ${k.name.toLowerCase()} post`);
    op.condition.fatigue = Math.min(100, op.condition.fatigue + CONTRACT.fatiguePerDay);
    (op.track ??= {}).lastWorked = state.day; // a post is work: no rest for Burned Out
  }

  if (die === 1 || margin <= CONTRACT.incidentMargin) { callIn(state, c, crew, vars); return; }
  if (margin < 0) {
    const text = fill(pick(rng, k.rough), vars);
    const extra = [];
    if (rng() < 0.5) {
      setInjury(roll.op, worsenInjury(roll.op.condition.injury, 'light'));
      noteInjury(state, roll.op, roll.op.condition.injury);
      extra.push(`${roll.op.handle}: ${roll.op.condition.injury} injury.`);
    } else {
      addHeat(state, c.district, 1);
      extra.push(`Heat +1 in ${districtText(c.district)}.`);
    }
    logPost(c, { day: state.day, tone: 'warn', text: [text + aside, ...extra].join(' ') });
    return;
  }
  if (margin >= CONTRACT.goodMargin) {
    const tip = round50(c.slotPay * CONTRACT.tip);
    c.owed += tip;
    logPost(c, { day: state.day, tone: 'good', text: `${fill(pick(rng, k.good), vars)}${aside} +${money(tip)}.` });
    return;
  }
  logPost(c, { day: state.day, tone: 'plain', text: fill(pick(rng, k.quiet), vars) + aside });
}

/**
 * The post is hit: a blocking call (owner, 2026-11-21: ambush fights). Watch the fight (engine 2 on
 * the district's map, the player's orders), let them fight it (steady orders, a report), or give it
 * up (everyone home). Anyone free can be sent to help; they arrive a few rounds in (helpArrival).
 */
function callIn(state, c, crew, vars) {
  const k = kindOf(c);
  const roll = crewRoll(crew, k.stats[0], { recommended: c.slots, job: { side: true, solo: crew.length === 1, district: c.district } });
  const chance = successChance(roll.value, postDifficulty(c) + 2);
  const threat = postThreat(c);
  const n = COUNT_BY_THREAT[Math.max(1, Math.min(5, threat))];
  const text = fill(k.incident, { ...vars, n: countWord(n) });
  logPost(c, { day: state.day, tone: 'bad', text });
  for (const op of crew) op.condition.awayUntil = Math.max(op.condition.awayUntil ?? 0, state.day + 1); // still out until the call is answered
  state.inbox.unshift({
    id: `ct-call-${c.id}-${state.day}`, type: 'job', day: state.day, kind: 'contract',
    subject: `${k.name} post for ${clientName(c.clientId)}: they are calling in`,
    body: text,
    options: [
      { id: 'fight', label: 'Watch the fight' },
      { id: 'auto', label: 'Let them fight it' },
      { id: 'give', label: 'Give it up and come home' },
    ],
    payload: { contractId: c.id, stat: k.stats[0], leadId: roll.op.id, chance, risk: riskLabel(chance), enemies: n, help: [] },
    blocking: true, read: false,
  });
}

const countWord = (n) => ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six'][n] ?? String(n);

/** The fight's threat on a post: CONTRACT.fightThreat plus the district's (data/contracts.js POST_THREAT), at most 5. */
export const postThreat = (c) => Math.max(1, Math.min(5, CONTRACT.fightThreat + (POST_THREAT[c.district] ?? 1)));

/** Where a runner lives (their hall's district). */
const homeDistrict = (op) => op.hall ?? HOME_HALL;

/** The round help from this runner reaches a post in this district: 2 from the same district, 3 across town, 4 to or from the Heights. */
export function helpArrival(op, district) {
  const from = homeDistrict(op);
  if (from === district) return HELP.sameDistrict;
  return from === 'heights' || district === 'heights' ? HELP.heights : HELP.across;
}
export const HELP = { max: 2, sameDistrict: 2, across: 3, heights: 4 };

/** Who could be sent to help a hit post: anyone free (not on a post, not away, not hurt badly), with the round they'd arrive. */
export function helpers(state, c) {
  return state.crew.filter((op) => !op.freelance && !c.crewIds.includes(op.id) && availability(state, op).ok)
    .map((op) => ({ op, round: helpArrival(op, c.district) }))
    .sort((a, b) => a.round - b.round || (b.op.stats.combat ?? 0) - (a.op.stats.combat ?? 0));
}

/** Pick or unpick a runner to send to a hit post (at most HELP.max). Returns a new state. */
export function toggleHelp(prev, msgId, opId) {
  const m0 = prev.inbox.find((m) => m.id === msgId && m.kind === 'contract' && !m.resolved);
  if (!m0) return prev;
  const state = structuredClone(prev);
  const m = state.inbox.find((x) => x.id === msgId);
  const c = contractsOf(state).active.find((x) => x.id === m.payload.contractId);
  if (!c) return prev;
  const help = m.payload.help ?? [];
  if (help.includes(opId)) m.payload.help = help.filter((id) => id !== opId);
  else if (help.length < HELP.max && helpers(state, c).some((h) => h.op.id === opId)) m.payload.help = [...help, opId];
  else return prev;
  return state;
}

/** Decision messages (core/decisions.js): the player's answer to a hit post. Mutates. */
export function CONTRACT_RESOLVER(state, msg, optionId) {
  const c = contractsOf(state).active.find((x) => x.id === msg.payload?.contractId);
  if (!c || c.ended) { msg.resolved = true; msg.blocking = false; return; }
  if (optionId === 'hold') optionId = 'auto'; // a call saved before the fights (save v84) had "Hold the post": the crew fights it
  if (optionId === 'give') {
    endContract(state, c, 'gaveUp');
    const t = adjustTrust(state, c.clientId, CONTRACT.trust.gaveUp);
    msg.payload.outcome = `${fill(INCIDENT_LINES.gaveUp, { client: clientName(c.clientId) })}${t ? ` Trust ${t}.` : ''}`;
    logPost(c, { day: state.day, tone: 'warn', text: msg.payload.outcome });
    msg.resolved = true;
    msg.blocking = false;
    return;
  }
  if (optionId !== 'fight' && optionId !== 'auto') return;
  if (state.activeMission) return; // one fight on screen at a time: finish the one in hand first
  const help = (msg.payload.help ?? []).filter((id) => helpers(state, c).some((h) => h.op.id === id));
  msg.resolved = true;
  msg.blocking = false;
  msg.payload.outcome = optionId === 'fight' ? 'You took the call: the fight is on screen.' : 'They fought it on steady orders.';
  startPostFight(state, c, help, { auto: optionId === 'auto' });
  if (optionId === 'auto') {
    const done = closeMission(autoRun(state, 'steady'));
    for (const key of Object.keys(state)) delete state[key];
    Object.assign(state, done);
  }
}

/**
 * The hit post as a fight (engine 2, holdYard: rout them) on the district's map, at the client's
 * place. The post's crew starts in cover; help arrives on its round. Mutates the (cloned) state.
 */
export function startPostFight(state, c, helpIds = [], { auto = false } = {}) {
  const tpl = postTemplate(c.district, c.kind);
  const crew = c.crewIds.map((id) => state.crew.find((o) => o.id === id)).filter((o) => o && o.condition.injury !== 'critical');
  const help = helpIds.map((id) => state.crew.find((o) => o.id === id)).filter(Boolean);
  const threat = postThreat(c);
  const site = pickSite(c.district, c.id, tpl.id);
  const spots = stageSpots(site, 'target', stageNeed(crew.length + help.length));
  const b = buildFight({
    type: 'holdYard', diff: fightDiff(Math.round(rollTarget({ threat }))), threat, site: c.district, job: null, crew, approach: 'loud', risk: 'steady', watched: !auto,
    reinforce: help.map((op) => ({ op, round: helpArrival(op, c.district) })),
  }, nextRng(state));
  b.auto = auto;
  b.startLines = [];
  b.spots = spots;
  b.startLines.push(...startRound(b, nextRng(state)));
  for (const op of help) op.condition.awayUntil = Math.max(op.condition.awayUntil ?? 0, state.day + 1); // out on the call: no job today
  const k = kindOf(c);
  const text = `${fill(k.incident, { who: crew[0]?.handle ?? 'The crew', client: clientName(c.clientId), n: countWord(b.enemies.length) })}${help.length ? ` ${help.map((op) => `${op.handle} is on the way (round ${helpArrival(op, c.district)})`).join('; ')}.` : ''}`;
  state.activeMission = {
    jobId: c.id, templateId: tpl.id, post: c.id, postCrew: crew.map((o) => o.id), help: help.map((o) => o.id),
    crewIds: [...crew, ...help].map((o) => o.id), approach: 'loud', days: 0, bribe: 0,
    overwatch: null, wheels: null, standby: null, callIn: auto ? 'never' : 'every', orders: auto ? 'steady' : null,
    alert: 0, out: [], pending: null, wentLoud: true, battle: b, fought: true,
    pay: 0, threat, threatDelta: 0, clientId: c.clientId, twist: null, askedFor: null, lead: null,
    queue: [{ type: 'battle' }], step: 0, log: [{ kind: 'bad', text }],
    payCut: 0, extraHeat: 0, clientTrust: 0, watched: 0, startedDay: state.day, zone: 'target',
    critical: null, stabiliseFailed: false, untreated: [],
    focusOp: null, aborted: false, done: false, result: null, growth: [], graduated: [], report: [text],
    events: [{ kind: 'battle', phase: 'start', from: 'post', zone: 'target', text, report: text, ...fightSnapshot(b), stage: stageOf(b) }],
  };
  return state;
}

/**
 * The end of a post's fight (called by mission.js finish). Deaths only as any engine-2 fight allows
 * (committed, or pushing on at death's door); a pull-back is an exit and saves everyone. Won: the post
 * goes on with a bonus and trust, anyone badly hurt goes home. Pulled back: the post ends, pay so far
 * kept. Help goes home either way. No fame, standing or record (posts earn none). Mutates.
 */
export function finishPost(state) {
  const am = state.activeMission;
  const c = contractsOf(state).active.find((x) => x.id === am.post);
  const crew = am.crewIds.map((id) => state.crew.find((o) => o.id === id)).filter(Boolean);
  const medic = crew.some((o) => o.role === 'medic' && !am.untreated.includes(o.id));
  const deaths = [];
  for (const id of am.fightDead ?? []) {
    const op = state.crew.find((o) => o.id === id);
    if (op && !deaths.includes(op)) { deaths.push(op); am.report.push(`${op.name} "${op.handle}" died in the fight.`); }
  }
  for (const id of am.untreated) {
    const op = state.crew.find((o) => o.id === id);
    if (!op || deaths.includes(op)) continue;
    const chance = state.difficulty === 'story' || am.aborted ? 1 : 0.35 + (medic ? 0.3 : 0);
    if (nextRng(state)() < chance) {
      setInjury(op, 'serious');
      op.condition.injuryDays = 21;
      am.report.push(`${op.handle} pulled through. Barely.`);
    } else { deaths.push(op); am.report.push(`${op.name} "${op.handle}" died of their wounds.`); }
  }
  for (const m of am.missing ?? []) {
    const op = state.crew.find((o) => o.id === m.id);
    if (!op || deaths.includes(op)) continue;
    op.condition.awayUntil = state.day + FIGHT.missingDays;
    op.condition.missing = { since: state.day, until: state.day + FIGHT.missingDays };
    setInjury(op, 'serious');
    op.condition.injuryDays = FIGHT.missingDays + INJURY_DAYS.serious;
  }
  recordFight(state, am, { deaths }); // the fight counters only: no fame, standing or active week (owner, 2026-11-21)
  for (const op of deaths) {
    state.crew = state.crew.filter((o) => o.id !== op.id);
    state.memorial.push({ id: op.id, name: op.name, handle: op.handle, role: op.role, color: op.color, age: op.age, marks: op.marks ?? [], day: state.day, cause: `Died on a post for ${clientName(c?.clientId)}`, record: recordSummary(op) });
  }
  if (deaths.length) for (const op of state.crew) op.condition.morale = Math.max(0, op.condition.morale - 15);
  const survivors = crew.filter((o) => !deaths.includes(o));
  const injuries = survivors.filter((o) => o.condition.injury !== 'healthy').map((o) => `${o.handle} (${o.condition.injury}, ${o.condition.injuryDays}d)`);
  for (const op of survivors) {
    op.condition.fatigue = Math.min(100, op.condition.fatigue + 10);
    op.history.push(`Day ${state.day}: ${am.aborted ? 'pulled back from' : 'held'} a post for ${clientName(c?.clientId)}`);
    if ((am.help ?? []).includes(op.id)) op.condition.awayUntil = Math.max(op.condition.awayUntil ?? 0, state.day + 1); // help goes home; no job today
  }
  let line;
  if (c && !c.ended) {
    // Anyone badly hurt, missing or dead comes off the post; the rest stay on it.
    const fit = (id) => { const op = state.crew.find((o) => o.id === id); return op && !op.condition.missing && !['serious', 'critical'].includes(op.condition.injury); };
    const off = c.crewIds.filter((id) => !fit(id));
    for (const id of off) { const op = state.crew.find((o) => o.id === id); if (op && !op.condition.missing) op.condition.awayUntil = state.day; }
    c.crewIds = c.crewIds.filter(fit);
    if (am.aborted) {
      endContract(state, c, 'gaveUp');
      const t = adjustTrust(state, c.clientId, CONTRACT.trust.gaveUp);
      line = `Pulled back and gave up the post. The pay so far is kept.${t ? ` Trust ${t}.` : ''}`;
    } else {
      const bonus = round50(c.slotPay * CONTRACT.heldBonus * Math.max(1, am.postCrew.length));
      c.owed += bonus;
      const t = adjustTrust(state, c.clientId, CONTRACT.trust.held);
      const taken = takenFor(state, `post:${c.id}:${am.jobId}`); // what the attackers left behind (core/loot.js, 2026-11-24)
      line = `${fill(INCIDENT_LINES.held, { client: clientName(c.clientId) })} +${money(bonus)}.${t ? ` Trust +${t}.` : ''}${taken ? ` ${taken.text}` : ''}${off.length ? ` Off the post, hurt: ${off.map((id) => state.crew.find((o) => o.id === id)?.handle ?? 'one of ours').join(', ')}.` : ''}`;
      if (!c.crewIds.length) { endContract(state, c, 'empty'); line += ' Nobody is fit to keep it: the post is over, the pay so far kept.'; }
      else if (state.day >= c.endDay) finish(state, c);
    }
    logPost(c, { day: state.day, tone: am.aborted ? 'warn' : deaths.length ? 'bad' : 'good', text: line, fight: true });
    am.report.push(line);
  }
  const milestones = checkMilestones(state, survivors); // ten fights won, a crewmate kept alive (core/milestones.js)
  for (const m of milestones) am.report.push(m.text);
  const outcome = deaths.length ? 'loss' : am.aborted ? 'aborted' : 'completed';
  am.result = { milestones, report: am.report ?? [], outcome, pay: 0, heatGain: 0, injuries, deaths: deaths.map((d) => d.handle), freelance: [], growth: [], graduated: [], client: null, trustChange: 0, post: line ?? null };
  am.done = true;
}

/** A post run to its end: trust for the work, a report. Mutates. */
function finish(state, c) {
  endContract(state, c, 'done');
  const weeks = Math.max(1, Math.round(c.days / 7));
  const t = adjustTrust(state, c.clientId, CONTRACT.trust.week * weeks);
  const crew = c.crewIds.map((id) => state.crew.find((o) => o.id === id)).filter(Boolean);
  for (const op of crew) op.history.push(`Day ${state.day}: ${kindOf(c).name.toLowerCase()} post for ${clientName(c.clientId)}`);
  state.inbox.unshift({
    id: `ct-done-${c.id}`, type: 'report', day: state.day,
    subject: `${kindOf(c).name} post for ${clientName(c.clientId)}: done`,
    body: `${names(crew)} finished the post. ${money(round50(c.owed))} to come on Sunday.${t ? ` ${clientName(c.clientId)}: trust +${t}.` : ''}${growthText(c.grew) ? ` Came back sharper: ${growthText(c.grew)}.` : ''}`,
    contractLog: c.log.slice(-8),
    back: { crewIds: [...c.crewIds], post: true, growth: sumGrowth(c.grew), graduated: [...(c.graduated ?? [])] },
    blocking: false, read: false,
  });
}

/**
 * Sunday, before the bills (time.js settleWeek): pay what the posts have earned this week and
 * clear the ended ones. Returns { total, lines } for the week's message. Mutates.
 */
export function payContracts(state) {
  const ct = contractsOf(state);
  let total = 0;
  const lines = [];
  for (const c of ct.active) {
    const pay = round50(c.owed);
    if (pay > 0) {
      total += pay;
      lines.push(`${kindOf(c).name} for ${clientName(c.clientId)} ${money(pay)}.`);
    }
    c.owed = 0;
  }
  moveCash(state, total, 'Security posts paid');
  ct.active = ct.active.filter((c) => !c.ended);
  state.contracts = ct;
  return { total, lines };
}

/** Posts running now, for Today and the crew cards: [{ id, name, clientName, district, crewIds, endDay, log }]. */
export function postsOut(state) {
  return contractsOf(state).active.filter((c) => !c.ended).map((c) => ({
    id: c.id, name: `${kindOf(c).name}: ${clientName(c.clientId)}`, kind: c.kind, clientName: clientName(c.clientId),
    district: c.district, crewIds: c.crewIds, endDay: c.endDay, log: c.log, owed: round50(c.owed),
  }));
}
