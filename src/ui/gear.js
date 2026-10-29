// Gear screens (PLAN-CORE-LOOP.md, slice 5): the armoury (the stash and what you can buy) and a
// runner's loadout with the sheet that fills a slot. Markup only; app.js owns the clicks
// (data-action) and core/gear.js the rules.
//
// ui: helpers from app.js { esc, money, face, statusChip }.

import { GEAR, SLOTS, TIERS, carried, itemName, itemTitle, priceOf, sellPrice, canChangeGear, kitsFor } from '../core/gear.js';
import { HAS_LOOKS, lookText } from '../core/looks.js';
import { gearGlyph } from './icons.js';
import { gearArt } from './art.js';

/** What an item does, in a few words: "Combat +1", "Overwatch: combat · 2 shots". */
export function itemEffect(item) {
  const g = GEAR[item.type];
  const step = TIERS[item.tier]?.step ?? 0;
  if (g.overwatch) return `Overwatch · ${g.overwatch.stat} ${g.overwatch.uses} ${item.type === 'rifle' ? 'shots' : 'actions'}${step ? ` · +${step}` : ''}`;
  const bonus = Object.entries(g.bonus ?? {}).map(([s, v]) => `${s} +${v + step}`);
  if (g.serious) bonus.push('fewer serious wounds');
  return bonus.join(' · ').replace(/^./, (c) => c.toUpperCase());
}

const glyphFor = (item) => gearGlyph(item.type, GEAR[item.type].slot);

/** The item's picture for a row: its drawing (ui/art.js) where it has one, else its line icon. */
const thumb = (item, carrier = null) => {
  const art = gearArt(item, { carrier, width: 96 });
  return art ? `<span class="gearrow__art" aria-hidden="true">${art}</span>` : `<span class="gearrow__icon" aria-hidden="true">${glyphFor(item)}</span>`;
};

/** One item as a row: name, what it does, and an action button. */
function itemRow(ui, item, { action, label, sub = '', disabled = false, id = item.uid, carrier = null }) {
  const { esc } = ui;
  return `
    <li class="gearrow">
      ${thumb(item, carrier)}
      <span class="gearrow__main"><strong>${esc(itemTitle(item))}</strong>
        <span class="gearrow__eff">${esc(itemEffect(item))}</span>
        ${item.look ? `<span class="gearrow__sub muted small">${esc(itemName(item))} · ${esc(lookText(item))}</span>` : ''}
        ${sub ? `<span class="gearrow__sub muted small">${sub}</span>` : ''}</span>
      ${action ? `<button class="btn gearrow__btn" data-action="${action}" data-id="${esc(id)}" ${item.tier ? `data-tier="${esc(item.tier)}"` : ''} ${disabled ? 'disabled' : ''}>${esc(label)}</button>` : ''}
    </li>`;
}

/** An item for sale: what it does, then a button per tier ("¥2,500", "Pro +1 ¥6,250"). */
function buyRow(ui, state, type) {
  const { esc, money } = ui;
  const g = GEAR[type];
  return `
    <li class="gearrow gearrow--buy">
      ${thumb({ type, tier: 'street' })}
      <span class="gearrow__main"><strong>${esc(g.name)}</strong>
        <span class="gearrow__eff">${esc(itemEffect({ type, tier: 'street' }))}</span>
        <span class="gearrow__sub muted small">${esc(g.desc)}</span></span>
      <span class="gearrow__buy">${Object.entries(TIERS).map(([tier, t]) => `<button class="btn gearrow__btn" data-action="buy" data-id="${esc(type)}" data-tier="${esc(tier)}" ${state.cash < priceOf(type, tier) ? 'disabled' : ''} aria-label="Buy ${esc(t.step ? `a ${t.name.toLowerCase()} ` : '')}${esc(g.name.toLowerCase())} for ${esc(money(priceOf(type, tier)))}">${t.step ? `${esc(t.name)} +${t.step} ` : ''}${esc(money(priceOf(type, tier)))}</button>`).join('')}</span>
    </li>`;
}

/** One of this week's rifles: drawn under the safehouse lamp, its name, and one price. */
function offerRow(ui, state, offer) {
  const { esc, money } = ui;
  const price = priceOf(offer.type, offer.tier);
  return `
    <li class="gearrow gearrow--buy">
      ${thumb(offer)}
      <span class="gearrow__main"><strong>${esc(offer.name)}</strong>
        <span class="gearrow__eff">${esc(itemEffect(offer))}</span>
        <span class="gearrow__sub muted small">${esc(itemName(offer))} · ${esc(lookText(offer))}</span></span>
      <span class="gearrow__buy"><button class="btn gearrow__btn" data-action="buy-offer" data-id="${esc(offer.oid)}" ${state.cash < price ? 'disabled' : ''} aria-label="Buy the ${esc(offer.name)} for ${esc(money(price))}">${esc(money(price))}</button></span>
    </li>`;
}

/** The Crew screen's card: what's in the stash, and the way in. */
export function armouryCard(ui, state) {
  const { esc } = ui;
  const stash = state.stash ?? [];
  const worn = state.crew.reduce((n, op) => n + carried(op).length, 0);
  return `
      <h2>Armoury</h2>
      <div class="riskcard">
        <p class="small">${stash.length ? `${stash.length} in the stash` : 'The stash is empty'} · ${worn} carried by the crew</p>
        <button class="btn btn--block" data-action="open-armoury">${esc(stash.length || worn ? 'Open the armoury' : 'Buy gear')}</button>
      </div>`;
}

/** The armoury: the stash (sell, or put it on someone from their page) and what's for sale. */
export function renderArmoury(ui, state) {
  const { esc, money } = ui;
  const stash = state.stash ?? [];
  const worn = state.crew.flatMap((op) => carried(op).map((item) => ({ item, op })));
  const forSale = Object.keys(GEAR).filter((type) => !HAS_LOOKS[type]); // rifles come from the weekly shelf
  const offers = state.armoury?.offers ?? [];
  const bySlot = (list, slotOf) => Object.entries(SLOTS).map(([slot, s]) => [s.name, list.filter((x) => slotOf(x) === slot)]).filter(([, l]) => l.length);
  return `
    <section class="panel">
      <button class="btn btn--ghost" data-action="back">← Crew</button>
      <h1>Armoury</h1>
      <p class="muted small">Gear stays on whoever carries it, job after job. Put it on someone from their page on the Crew screen. Overwatch needs a rifle or a drone.</p>
      <div class="cols2">
      <div>
      <h2>In the stash (${stash.length})</h2>
      ${stash.length ? `<ul class="list list--plain gearlist">${stash.map((item) => itemRow(ui, item, { action: 'sell', label: `Sell ${money(sellPrice(item))}` })).join('')}</ul>`
        : '<p class="muted small">Nothing here. What you buy waits here until someone carries it.</p>'}
      ${worn.length ? `<h2>Carried</h2><ul class="list list--plain gearlist">${worn.map(({ item, op }) => itemRow(ui, item, { action: 'open-op', label: op.handle, id: op.id, carrier: op })).join('')}</ul>` : ''}
      </div>
      <div>
      <h2>Buy <span class="muted small">· ${money(state.cash)} in hand</span></h2>
      <h3 class="gear__slot">This week's rifles</h3>
      ${offers.length ? `<ul class="list list--plain gearlist">${offers.map((o) => offerRow(ui, state, o)).join('')}</ul>` : '<p class="muted small">Sold out.</p>'}
      <p class="muted small">New rifles come in every Monday, each one different.</p>
      ${bySlot(forSale, (type) => GEAR[type].slot).map(([name, list]) => `
        <h3 class="gear__slot">${esc(name)}</h3>
        <ul class="list list--plain gearlist">${list.map((type) => buyRow(ui, state, type)).join('')}</ul>`).join('')}
      </div>
      </div>
    </section>`;
}

/**
 * A runner's four slots on their page, as a 2×2 grid of tiles with each item drawn big (owner's
 * call, 2026-10-28), lit by the runner's own city light. Items without a drawing show their icon.
 */
export function renderLoadout(ui, state, op) {
  const { esc } = ui;
  const can = canChangeGear(state, op);
  return `
      <h2>Gear</h2>
      <ul class="list list--plain loadout">
        ${Object.entries(SLOTS).map(([slot, s]) => {
          const item = op.gear?.[slot] ?? null;
          const art = item ? gearArt(item, { carrier: op, width: 192 }) : null;
          return `<li><button class="loadout__tile ${item ? '' : 'is-empty'}" data-action="gear-slot" data-id="${slot}" ${can.ok ? '' : 'disabled'} aria-label="${esc(s.name)}: ${esc(item ? itemTitle(item) : 'empty')}. Tap to change.">
            <span class="loadout__name">${esc(s.name)}</span>
            <span class="loadout__pic ${art ? '' : 'loadout__pic--icon'}" aria-hidden="true">${item ? art ?? glyphFor(item) : '+'}</span>
            <strong class="loadout__item">${item ? esc(itemTitle(item)) : 'Empty'}</strong>
            ${item ? `<span class="loadout__eff">${esc(itemEffect(item))}</span>` : ''}
          </button></li>`;
        }).join('')}
      </ul>
      ${can.ok ? '' : `<p class="muted small">Their gear can't change while they're ${esc(can.reason)}.</p>`}
      ${kitsFor(op).length ? '' : '<p class="muted small">No rifle or drone: they can\'t take overwatch.</p>'}`;
}

/** The sheet for one slot: what's in the stash for it, what others carry, or take it off. */
export function renderGearSheet(ui, state, op, slot) {
  const { esc } = ui;
  const current = op.gear?.[slot] ?? null;
  const stash = (state.stash ?? []).filter((i) => GEAR[i.type].slot === slot);
  const others = state.crew.filter((o) => o.id !== op.id).flatMap((o) => (o.gear?.[slot] ? [{ item: o.gear[slot], o }] : []));
  return `
    <div class="scrim" data-action="close-gear"></div>
    <div class="sheet" role="dialog" aria-modal="true" aria-label="${esc(SLOTS[slot].name)} for ${esc(op.handle)}">
      <div class="sheet__head">
        <div><h2 class="sheet__title">${esc(SLOTS[slot].name)} for ${esc(op.handle)}</h2>
        <p class="muted small">${current ? `Carrying: ${esc(itemTitle(current))}. Whatever you pick swaps with it.` : 'Nothing in this slot.'}</p></div>
        <button class="btn btn--ghost sheet__x" data-action="close-gear" aria-label="Close">✕</button>
      </div>
      <ul class="list list--plain gearlist">${stash.length ? stash.map((item) => itemRow(ui, item, { action: 'equip', label: 'Carry' })).join('') : '<li class="muted small">Nothing for this slot in the stash. Buy it in the armoury.</li>'}</ul>
      ${others.length ? `<h3 class="sheet__group">Carried by others <span>takes it off them</span></h3>
      <ul class="list list--plain gearlist">${others.map(({ item, o }) => itemRow(ui, item, { action: 'equip', label: `From ${o.handle}`, disabled: !canChangeGear(state, o).ok, carrier: o })).join('')}</ul>` : ''}
      ${current ? `<button class="btn btn--ghost btn--block" data-action="unequip" data-id="${slot}">Put it back in the stash</button>` : ''}
      <button class="btn btn--block" data-action="open-armoury">Go to the armoury</button>
    </div>`;
}
