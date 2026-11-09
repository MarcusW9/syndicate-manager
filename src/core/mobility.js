// Rival offers to our runners (part D3; DESIGN.md 2026-11-09). On Sunday, once the tong is Street rank
// or bigger, a rival may make one offer for one runner who is free and not hurt. Joss warns a week
// ahead as a decision message: Match it (they stay; their pay goes up) or Let them go (the rival pays us
// a buyout by the same rule as ours, core/dossier.js buyoutAmount). Unanswered, they go at the end of
// the week. Loyalty makes it rarer; every roll is hashRng, so no other roll moves.
// State: `op.poachSnoozeUntil`, message kind 'poach'. The leaver becomes a card in the buying tong.

import { MOBILITY, POACH_TEXT, fill } from '../data/mobility.js';
import { TONG_RANKS } from '../data/tong.js';
import { hashRng } from './rng.js';
import { rankForHalls } from './tong.js';
import { loyaltyPoints, addLoyalty } from './loyalty.js';
import { marketWage, round50 } from './pricing.js';
import { buyoutAmount, operativeToCard } from './dossier.js';
import { carried } from './gear.js';
import { money } from './money.js';
import { isSworn } from './oath.js';
import { OATH } from '../data/oath.js';

const rankIndex = (id) => TONG_RANKS.findIndex((r) => r.id === id);

/** A week's chance this runner is approached. */
export function poachChance(op) {
  const base = MOBILITY.base[op.tier] ?? MOBILITY.base.rookie;
  const mult = op.legend || op.fame === 'legend' ? MOBILITY.legendMult : op.fame === 'elite' ? MOBILITY.eliteMult : 1;
  return base * mult * (isSworn(op) ? OATH.approachMult : 1) * Math.pow(1 - loyaltyPoints(op) / 100, MOBILITY.loyaltyPower);
}

const busyIds = (state) => new Set([
  ...(state.awayJobs ?? []).flatMap(({ mission: am }) => [...am.crewIds, am.overwatch?.id, am.wheels, am.standby?.id]),
  ...(state.activeMission ? state.activeMission.crewIds : []),
  ...(state.sideOut ?? []).flatMap((s) => s.crewIds ?? []),
].filter(Boolean));

const open = (state, op) => state.inbox.some((m) => m.kind === 'poach' && !m.resolved && m.payload?.opId === op.id);
const free = (state, op, busy) => !op.freelance && !busy.has(op.id) && (op.condition.injury === 'healthy' || op.condition.injury === 'light');

/** What matching costs: their new pay. */
export const matchPay = (op) => round50(Math.max(op.wage, marketWage(op)) * MOBILITY.raise);

/** A tong that could pay for them: active, holding the buyout and some weeks' wage. Hash-picked among those. */
function buyerFor(state, op, week) {
  const tongs = (state.rivals?.tongs ?? []).filter((t) => t.status === 'active' && t.wealth >= buyoutAmount(t, op.wage) + MOBILITY.cashCover * op.wage);
  if (!tongs.length) return null;
  return tongs[Math.floor(hashRng('poach-tong', state.seed ?? 0, op.id, week)() * tongs.length)];
}

function execute(state, op, tong, text) {
  const buyout = Math.min(buyoutAmount(tong, op.wage), tong.wealth);
  for (const item of carried(op)) (state.stash ??= []).push(item);
  state.crew = state.crew.filter((o) => o.id !== op.id);
  state.cash += buyout;
  tong.wealth -= buyout;
  const card = { ...operativeToCard(state, op), tongId: tong.id };
  if (state.rivals.cards.filter((c) => c.tongId === tong.id).length < 12) state.rivals.cards.push(card);
  const dent = isSworn(op) ? OATH.leavePenalty : MOBILITY.goLoyalty; // a sworn runner's exit is felt (owner, 2026-11-09)
  for (const o of state.crew) if (!o.freelance) addLoyalty(o, dent);
  return fill(text, { op: op.handle, tong: tong.name, buyout: money(buyout) });
}

/** Sunday: unanswered offers whose week is up take effect; then maybe one new offer. Mutates the (cloned) state. */
export function weeklyPoach(state) {
  const busy = busyIds(state);
  for (const m of state.inbox.filter((x) => x.kind === 'poach' && !x.resolved && state.day >= x.payload.expiresDay)) {
    const op = state.crew.find((o) => o.id === m.payload.opId);
    const tong = (state.rivals?.tongs ?? []).find((t) => t.id === m.payload.tongId);
    if (op && !free(state, op, busy)) continue; // not while they are out or hurt: it waits
    m.resolved = true; m.blocking = false;
    m.payload.outcome = op && tong && tong.status === 'active' ? execute(state, op, tong, POACH_TEXT.lapsed) : `${op?.handle ?? 'They'} stayed; the offer fell through.`;
  }
  if (!state.rivals || rankIndex(rankForHalls((state.halls ?? []).length).id) < rankIndex(MOBILITY.minRank)) return;
  const week = Math.floor(state.day / 7);
  const cands = state.crew.filter((op) => free(state, op, busy) && !open(state, op) && (op.poachSnoozeUntil ?? 0) <= state.day)
    .filter((op) => hashRng('poach', state.seed ?? 0, op.id, week)() < poachChance(op));
  if (!cands.length) return;
  const op = cands.reduce((a, b) => (hashRng('poach-pick', state.seed ?? 0, a.id, week)() >= hashRng('poach-pick', state.seed ?? 0, b.id, week)() ? a : b));
  const tong = buyerFor(state, op, week);
  if (!tong) return;
  const buyout = buyoutAmount(tong, op.wage);
  const vars = { op: op.handle, tong: tong.name, pay: money(matchPay(op)), buyout: money(buyout) };
  op.poachSnoozeUntil = state.day + MOBILITY.snoozeDays;
  state.inbox.unshift({
    id: `poach-${op.id}-${state.day}`, type: 'crew', day: state.day,
    subject: fill(POACH_TEXT.subject, vars), body: fill(POACH_TEXT.body, vars), kind: 'poach',
    options: [{ id: 'match', label: `Match it (${money(matchPay(op))} a week)` }, { id: 'go', label: `Let them go (${money(buyout)} to us)` }],
    payload: { opId: op.id, tongId: tong.id, expiresDay: state.day + MOBILITY.expiryDays, pay: matchPay(op), buyout },
    blocking: false, resolved: false, read: false,
  });
}

/** Resolver for kind 'poach' (registered in decisions.js). Mutates state and msg. */
export function POACH_RESOLVER(state, msg, optionId) {
  const p = msg.payload;
  const op = state.crew.find((o) => o.id === p.opId);
  const tong = (state.rivals?.tongs ?? []).find((t) => t.id === p.tongId);
  const done = (text) => { p.outcome = text; msg.resolved = true; msg.blocking = false; };
  if (!op) return done('They are no longer with the crew.');
  if (optionId === 'match') {
    op.wage = Math.max(op.wage, p.pay);
    addLoyalty(op, MOBILITY.matchLoyalty);
    op.history.push(`Day ${state.day}: matched an offer from ${tong?.name ?? 'a rival tong'}; now ${op.wage} a week`);
    return done(fill(POACH_TEXT.match, { op: op.handle, pay: money(op.wage) }));
  }
  if (optionId !== 'go') return;
  if (!tong || tong.status !== 'active') return done(`${op.handle} stayed; the offer fell through.`);
  done(execute(state, op, tong, POACH_TEXT.go));
}
