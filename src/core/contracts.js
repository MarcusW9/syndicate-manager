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

import { CONTRACT_KINDS, SLOT_PAY, POST_THREAT, INCIDENT_LINES } from '../data/contracts.js';
import { CLIENTS } from '../data/clients.js';
import { NAMES } from '../config/names.js';
import { availability, crewRoll, worsenInjury, setInjury } from './crew.js';
import { successChance, riskLabel } from './risk.js';
import { d20, hashRng, pick } from './rng.js';
import { gainXp } from './development.js';
import { adjustTrust } from './clients.js';
import { addHeat } from './heat.js';
import { money } from './money.js';
import { noteInjury } from './earned.js';

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
  ct.active.push({ ...offer, crewIds: [...crewIds], startDay: state.day, endDay, owed: 0, log: [], ended: null });
  state.inbox.unshift({
    id: `ct-sent-${offer.id}`, type: 'job', day: state.day,
    subject: `${names(crew)} ${crew.length > 1 ? 'are' : 'is'} on a ${kindOf(offer).name.toLowerCase()} post for ${clientName(offer.clientId)}`,
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
  c.log.push({ day: state.day, tone: 'warn', text: `Pulled off the post early.${t ? ` ${clientName(c.clientId)}: trust ${t}.` : ''}` });
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

  for (const op of crew) {
    gainXp(op, crew, stat, CONTRACT.xpPerDay, state.day);
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
    c.log.push({ day: state.day, tone: 'warn', text: [text, ...extra].join(' ') });
    return;
  }
  if (margin >= CONTRACT.goodMargin) {
    const tip = round50(c.slotPay * CONTRACT.tip);
    c.owed += tip;
    c.log.push({ day: state.day, tone: 'good', text: `${fill(pick(rng, k.good), vars)} +${money(tip)}.` });
    return;
  }
  c.log.push({ day: state.day, tone: 'plain', text: fill(pick(rng, k.quiet), vars) });
}

/** The post is hit: a blocking call. Hold it (the odds shown) or give it up (everyone home). */
function callIn(state, c, crew, vars) {
  const k = kindOf(c);
  const stat = k.stats[0];
  const roll = crewRoll(crew, stat, { recommended: c.slots, job: { side: true, solo: crew.length === 1, district: c.district } });
  const chance = successChance(roll.value, postDifficulty(c) + 2);
  const text = fill(k.incident, vars);
  c.log.push({ day: state.day, tone: 'bad', text });
  for (const op of crew) op.condition.awayUntil = Math.max(op.condition.awayUntil ?? 0, state.day + 1); // still out until the call is answered
  state.inbox.unshift({
    id: `ct-call-${c.id}-${state.day}`, type: 'job', day: state.day, kind: 'contract',
    subject: `${k.name} post for ${clientName(c.clientId)}: they are calling in`,
    body: `${text} Hold the post: ${roll.op.handle} leads on ${stat} (${roll.value}), ${Math.round(chance * 100)}% to hold. If it goes wrong, ${roll.op.handle} is badly hurt and the post is lost (no pay this week, trust ${CONTRACT.trust.lost}). Give it up: everyone comes home now, the pay so far is kept, trust ${CONTRACT.trust.gaveUp}.`,
    options: [
      { id: 'hold', label: `Hold the post (${Math.round(chance * 100)}%, ${riskLabel(chance)})` },
      { id: 'give', label: 'Give it up and come home' },
    ],
    payload: { contractId: c.id, stat, leadId: roll.op.id, chance },
    blocking: true, read: false,
  });
}

/** Decision messages (core/decisions.js): the player's answer to a hit post. Mutates. */
export function CONTRACT_RESOLVER(state, msg, optionId) {
  const c = contractsOf(state).active.find((x) => x.id === msg.payload?.contractId);
  if (!c || c.ended) { msg.resolved = true; msg.blocking = false; return; }
  const vars = { client: clientName(c.clientId) };
  const crew = c.crewIds.map((id) => state.crew.find((o) => o.id === id)).filter(Boolean);
  if (optionId === 'give') {
    endContract(state, c, 'gaveUp');
    const t = adjustTrust(state, c.clientId, CONTRACT.trust.gaveUp);
    msg.payload.outcome = `${fill(INCIDENT_LINES.gaveUp, vars)}${t ? ` Trust ${t}.` : ''}`;
  } else if (optionId === 'hold') {
    const roll = crewRoll(crew, msg.payload.stat, { recommended: c.slots, job: { side: true, solo: crew.length === 1, district: c.district } });
    const die = d20(hashRng(state.seed, 'contract-hold', c.id, state.day));
    const held = die + roll.value >= 10 + postDifficulty(c) + 2;
    if (held) {
      const bonus = round50(c.slotPay * CONTRACT.heldBonus * crew.length);
      c.owed += bonus;
      const t = adjustTrust(state, c.clientId, CONTRACT.trust.held);
      msg.payload.outcome = `${fill(INCIDENT_LINES.held, vars)} +${money(bonus)}.${t ? ` Trust +${t}.` : ''}`;
      if (state.day >= c.endDay) finish(state, c);
    } else {
      const hurt = roll.op;
      setInjury(hurt, worsenInjury(hurt.condition.injury, 'serious'));
      noteInjury(state, hurt, hurt.condition.injury);
      c.owed = 0; // the post is lost: no pay this week
      endContract(state, c, 'lost');
      const t = adjustTrust(state, c.clientId, CONTRACT.trust.lost);
      msg.payload.outcome = `${fill(INCIDENT_LINES.lost, { ...vars, who: hurt.handle })} ${hurt.handle}: ${hurt.condition.injury} injury.${t ? ` Trust ${t}.` : ''}`;
    }
  } else return;
  c.log.push({ day: state.day, tone: c.ended?.how === 'lost' ? 'bad' : optionId === 'hold' ? 'good' : 'warn', text: msg.payload.outcome });
  msg.resolved = true;
  msg.blocking = false;
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
    body: `${names(crew)} finished the post. ${money(round50(c.owed))} to come on Sunday.${t ? ` ${clientName(c.clientId)}: trust +${t}.` : ''}`,
    contractLog: c.log.slice(-8),
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
  state.cash += total;
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
