// Hands-off runs: the crew does the job without the player, under standing orders, and
// the player reads the report. Pure logic. Same engine, same dice, same consequences as a
// played job (mission.js); the orders only decide which choice to take.
//
// Death rule: a hands-off crew never pushes on. At any critical state it extracts, so a
// hands-off job can't kill anyone (DESIGN.md, 2026-10-26).

import { templateById } from './jobs.js';
import { crisisOdds, chooseOption, revealBeat, resolveCritical, currentStep } from './mission.js';

const pct = (n) => `${Math.round(n * 100)}%`;

/**
 * Standing orders. Weights price each downside in "share of the pay": heat per point, an
 * injury by severity, trust per point lost. minChance: below it a roll isn't attempted.
 */
export const ORDERS = {
  cautious: {
    name: 'Cautious', desc: 'Takes the safest way through, and walks away early.',
    minChance: 0.65, heat: 0.25, trust: 0.03, injury: { light: 0.5, serious: 2, critical: 5 },
  },
  steady: {
    name: 'Steady', desc: 'Weighs the pay against the risk.',
    minChance: 0.45, heat: 0.15, trust: 0.02, injury: { light: 0.25, serious: 1, critical: 3 },
  },
  committed: {
    name: 'Committed', desc: 'Takes more risk to finish the job and earn more. Never pushes on with a critical wound.',
    minChance: 0.25, heat: 0.08, trust: 0.01, injury: { light: 0.1, serious: 0.5, critical: 1.5 },
  },
};

/** A cost object ({ payCut, heat, cash, clientTrust }) in share-of-pay, under these orders. */
function price(cost = {}, orders, basePay) {
  return (cost.payCut ?? 0) + (cost.heat ?? 0) * orders.heat
    - (cost.cash ?? 0) / Math.max(1, basePay) - (cost.clientTrust ?? 0) * orders.trust;
}

/** Expected loss of taking a choice (lower is better). */
function expectedLoss({ choice, chance }, orders, basePay) {
  const fail = price(choice.failureCost, orders, basePay) + (orders.injury[choice.failureInjury] ?? 0);
  return price(choice.cost, orders, basePay) + chance * price(choice.successCost, orders, basePay) + (1 - chance) * fail;
}

/** Pick a choice for the current crisis under these orders: { id, why }. */
export function decide(state, ordersId) {
  const orders = ORDERS[ordersId] ?? ORDERS.steady;
  const basePay = state.activeMission.pay ?? templateById(state.activeMission.templateId).pay;
  const odds = crisisOdds(state);
  const exits = odds.filter((o) => o.exit).sort((a, b) => expectedLoss(a, orders, basePay) - expectedLoss(b, orders, basePay));
  const tries = odds.filter((o) => !o.exit);
  const worthTrying = tries.filter((o) => o.chance >= orders.minChance)
    .sort((a, b) => expectedLoss(a, orders, basePay) - expectedLoss(b, orders, basePay));
  const pick = worthTrying[0];
  const out = exits[0];

  if (!pick || (out && expectedLoss(out, orders, basePay) < expectedLoss(pick, orders, basePay))) {
    if (!out) return { id: (pick ?? tries[0]).choice.id, why: 'No way out but through.' }; // every crisis has an exit; a guard only
    return { id: out.choice.id, why: tries.length && !pick ? 'Nothing on the table had good enough odds, so they pulled out.' : 'Pulling out cost less than the risk of staying.' };
  }
  const c = pick.choice;
  if (!pick.roller) return { id: c.id, why: 'No roll needed.' };
  const who = `${pick.roller.op.handle} took it: the best ${c.stat} on the crew (${pick.roller.value}).`;
  const bestOdds = Math.max(...tries.map((o) => o.chance));
  const reason = pick.chance >= bestOdds ? 'The best odds of the options.'
    : (c.successCost?.payCut ?? 0) < 0 ? 'Worth the risk for the extra pay.'
      : 'Less to lose if it went wrong.';
  const paid = (c.cost?.payCut ?? 0) > 0 ? ` It cost ${pct(c.cost.payCut)} of the pay either way.` : '';
  return { id: c.id, why: `${who} ${reason}${paid}` };
}

/** Play the active job to the end under standing orders. Returns the new state (job done). */
export function autoRun(prev, ordersId) {
  let s = structuredClone(prev);
  s.activeMission.orders = ORDERS[ordersId] ? ordersId : 'steady';
  for (let guard = 0; guard < 80 && !s.activeMission.done; guard++) {
    const am = s.activeMission;
    let next;
    if (am.critical) {
      am.nextWhy = 'Hands-off crews always get the wounded out.';
      next = resolveCritical(s, 'extract');
    } else if (currentStep(am)?.type === 'beat') {
      next = revealBeat(s);
    } else {
      const { id, why } = decide(s, am.orders);
      am.nextWhy = why;
      next = chooseOption(s, id);
    }
    if (next === s) throw new Error('Hands-off run got stuck');
    s = next;
  }
  if (!s.activeMission.done) throw new Error('Hands-off run did not finish');
  return s;
}
