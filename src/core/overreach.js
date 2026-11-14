// E2 (DESIGN.md 2026-11-14 "E2"; drafts/PROPOSAL-tong-depth.md section 3): overreach. A house pays a wage bill and has an appetite;
// a big house can buy more than it can keep, and when it cracks its good names come loose at once.
// Pure over `state.rivals`. No roll at all (every choice is a sort on state, ties by id); the one place a draw is needed, a broken
// one-hall house forming a new tong, uses its own key `'rivals-e:' + week` and never moves rngCounter.
// Nothing here reads or moves the player's money, heat, halls or rolls. The story machinery (threads, release, moveCard, fold)
// belongs to rivals.js and is handed in as `kit`, so the two files do not import each other.

import { hashRng } from './rng.js';
import { cardRating } from './rating.js';
import { buyoutAmount, dossierOf } from './dossier.js';
import { ceilingOf, rosterOf, tierIndexOf, wants, topTierFor, average, isSelling } from './houses.js';
import { REACH, RIVALS } from '../data/rivals.js';

const DAYS_PER_WEEK = 7;
const byId = (a, b) => (a.id < b.id ? -1 : 1);
const absWeek = (day) => Math.floor((day - 1) / 7);
const sum = (list) => list.reduce((n, v) => n + v, 0);
const active = (r) => r.tongs.filter((t) => t.status === 'active').sort(byId);

/** The books for one Sunday: what the house paid out (wages and hall upkeep) and took in. Kept for four Sundays. */
export function wageBill(r, t) {
  return RIVALS.wage.per * sum(rosterOf(r, t).map(cardRating));
}
export function noteBooks(t, bill, income) {
  t.bills = [...(t.bills ?? []), bill].slice(-REACH.window);
  t.income = [...(t.income ?? []), income].slice(-REACH.window);
}

/** A strained Sunday: four weeks of bills over four weeks of income, and less than eight weeks of bills in hand. */
export function strained(t) {
  const bills = t.bills ?? []; const income = t.income ?? [];
  if (bills.length < REACH.window || income.length < REACH.window) return false;
  return sum(bills) > sum(income) && t.wealth < (REACH.coverWeeks * sum(bills)) / REACH.window;
}

const inSaleList = (r, c) => !!r.sale?.cardIds.includes(c.id);
/** A name in the sale is held for the player for three weeks: nobody else signs it, and it is not the ordinary free name. */
export const inSale = (r, c) => inSaleList(r, c);

export function addToSale(r, day, tongId, card) {
  r.sale ??= { tongId, cardIds: [], untilDay: day };
  r.sale.tongId = tongId;
  r.sale.cardIds.push(card.id);
  r.sale.untilDay = day + REACH.saleWeeks * DAYS_PER_WEEK;
}

/** Each Sunday: names whose three weeks are up (or who are signed, or gone) leave the sale; a free one is placed by fit. */
function tidySale(r, day, k) {
  if (!r.sale) return;
  const live = [];
  for (const id of r.sale.cardIds) {
    const c = r.cards.find((x) => x.id === id);
    if (!c || c.tongId) continue;
    if (day - c.since < REACH.saleWeeks * DAYS_PER_WEEK) { live.push(c); continue; }
    const to = k.placeFor(r, c, day);
    if (to) k.moveCard(r, day, c, to);
  }
  if (!live.length) { r.sale = null; return; }
  r.sale.cardIds = live.map((c) => c.id);
  r.sale.untilDay = Math.max(...live.map((c) => c.since)) + REACH.saleWeeks * DAYS_PER_WEEK;
}

const dearest = (r, t) => [...rosterOf(r, t).filter((c) => c.id !== t.headId)].sort((a, b) => cardRating(b) - cardRating(a) || byId(a, b))[0] ?? null;
const cheapest = (r, t) => [...rosterOf(r, t).filter((c) => c.id !== t.headId)].sort((a, b) => cardRating(a) - cardRating(b) || byId(a, b))[0] ?? null;
const someoneElseSelling = (r, t) => r.threads.some((x) => x.open && x.family === 'overreach' && x.tongId !== t.id && (x.stage === 'selling' || x.stage === 'broken'));

function letGo(r, day, t, card, k) {
  k.release(r, day, card, t.id, 'went_free');
  addToSale(r, day, t.id, card);
}

/** A house that has run out: a hall closes (a one-hall house folds instead), and it goes down to three names over the Sundays after. */
function breakHouse(state, r, day, t, th, k) {
  k.beat(r, th, day, 'broken', 'overreach_broken', [t.id]);
  t.strain = 0; t.bills = []; t.income = [];
  if (t.halls > 1) t.halls -= 1;
  else if (r.tongs.filter((x) => x.status === 'active').length > RIVALS.minTongs) k.foldTong(state, r, hashRng(state.seed, 'rivals-e:' + absWeek(day)), day, t);
}

/** The Sundays after a break: one name out, the lowest rated first, until three are left; then the story is over. */
function crack(r, day, t, th, k) {
  const gone = rosterOf(r, t).length > REACH.keep ? cheapest(r, t) : null;
  if (gone) letGo(r, day, t, gone, k);
  if (rosterOf(r, t).length <= REACH.keep) th.open = false;
}

/** A house with more than it needs signs a free name it wants, or buys one from a house a tier below. At most once every eight weeks. */
function shop(state, r, day, t, k) {
  if (day - (t.shoppedDay ?? t.formedDay) < REACH.shopEvery * DAYS_PER_WEEK) return; // the first trip comes eight weeks after the house opened
  if (r.threads.some((x) => x.open && x.tongId === t.id)) return; // one story at a time: a house with its own tale open does not go shopping
  const mark = (RIVALS.marks[t.halls] ?? RIVALS.marks.at(-1)).wealth;
  const at = t.style === 'loud' || t.habit === 'boutique' ? REACH.shopAtLoud : REACH.shopAt;
  if (t.wealth <= at * mark || rosterOf(r, t).length >= ceilingOf(t)) return;
  const avg = average(r, t);
  const fits = (c) => wants(r, t, c, day) && cardRating(c) >= avg - REACH.shopFit;
  const bestFirst = (a, b) => cardRating(b) - cardRating(a) || byId(a, b);
  const free = r.cards.filter((c) => !c.tongId && !inSaleList(r, c) && c.id !== r.offer?.cardId && tierIndexOf(t) <= topTierFor(r, c, day) && fits(c)).sort(bestFirst)[0];
  if (free) { k.moveCard(r, day, free, t); t.shoppedDay = day; return; }
  for (const seller of active(r).filter((s) => tierIndexOf(s) < tierIndexOf(t) && rosterOf(r, s).length > REACH.keep)) {
    const card = rosterOf(r, seller).filter((c) => c.id !== seller.headId && fits(c)).sort(bestFirst)[0];
    if (!card) continue;
    const price = buyoutAmount(seller, dossierOf(state, card).wage, isSelling(r, seller));
    if (t.wealth - price < mark) continue;
    t.wealth -= price; seller.wealth += price;
    k.moveCard(r, day, card, t, 'bought');
    t.shoppedDay = day;
    return;
  }
}

/**
 * Sundays, after the work step has booked each house's bill and income. Strain, the story (stretched, selling, broken, steadied),
 * the sale, then the shopping. Fixed order: tongs by id.
 */
export function overreachStep(state, r, day, k) {
  const w = absWeek(day);
  tidySale(r, day, k);
  for (const t of active(r)) {
    let th = k.openThread(r, t.id, 'overreach');
    if (th?.stage === 'broken') { crack(r, day, t, th, k); continue; }
    if (day - t.formedDay < REACH.youngWeeks * DAYS_PER_WEEK) { t.strain = 0; continue; }
    const hard = strained(t);
    t.strain = hard ? (t.strain ?? 0) + 1 : Math.max(0, (t.strain ?? 0) - 1);
    if (!th) {
      if (t.strain < REACH.stretched) continue;
      th = k.startThread(r, day, t.id, 'overreach', 'stretched');
      th.calm = 0;
      k.say(r, day, 'overreach_begin', [t.id]);
      continue;
    }
    th.calm = hard ? 0 : (th.calm ?? 0) + 1;
    if (th.calm >= REACH.calm) {
      if (th.stage === 'selling') k.beat(r, th, day, 'steadied', 'overreach_steadied', [t.id], true); else th.open = false;
      continue;
    }
    if (th.stage === 'stretched' && t.strain >= REACH.selling && !someoneElseSelling(r, t)) {
      k.beat(r, th, day, 'selling', 'overreach_selling', [t.id]);
      th.saleWeek = w - REACH.sellEvery; th.broke = 0;
    } else if (th.stage === 'selling') {
      th.broke = t.wealth === 0 ? (th.broke ?? 0) + 1 : 0;
      if (th.broke >= REACH.brokeSundays) { breakHouse(state, r, day, t, th, k); continue; }
    }
    if (th.stage === 'selling' && w - th.saleWeek >= REACH.sellEvery) {
      const card = rosterOf(r, t).length > REACH.keep ? dearest(r, t) : null; // a selling house still keeps three names
      if (card) { letGo(r, day, t, card, k); th.saleWeek = w; }
    }
  }
  for (const t of active(r)) if (!t.strain) shop(state, r, day, t, k);
}
