// Gear screens (PLAN-CORE-LOOP.md, slice 5): the armoury (the stash and what you can buy) and a
// runner's loadout with the sheet that fills a slot. Markup only; app.js owns the clicks
// (data-action) and core/gear.js the rules.
//
// ui: helpers from app.js { esc, money, face, statusChip }.

import { GEAR, SLOTS, TIERS, carried, itemName, itemTitle, buyPrice, sellPrice, canChangeGear, kitsFor, sidearmStats, placeOf, cellsOf, fitsAt, bagUsed } from '../core/gear.js';
import { BAG, SOCKETS, BASE_TIER } from '../data/gear.js';
import { HAS_LOOKS, lookText } from '../core/looks.js';
import { gearGlyph } from './icons.js';
import { gearArt } from './art.js';

/** What an item does, in a few words: "Combat +1", "Overwatch: combat · 2 shots". */
export function itemEffect(item) {
  const g = GEAR[item.type];
  const step = TIERS[item.tier]?.step ?? 0;
  if (g.overwatch) return `Overwatch · ${g.overwatch.stat} ${g.overwatch.uses} ${item.type === 'rifle' ? 'shots' : 'actions'}${step ? ` · +${step}` : ''}`;
  // A sidearm: its own strengths (frame and quirk): "Aim +2 · damage 2 · light and accurate · true sights".
  const s = sidearmStats(item);
  if (s) return [`Aim ${s.aim >= 0 ? '+' : '−'}${Math.abs(s.aim)}`, `damage ${s.damage}`, s.pierce ? `pierces ${s.pierce}` : null, s.trait, s.quirk].filter(Boolean).join(' · ');
  const bonus = Object.entries(g.bonus ?? {}).map(([s, v]) => `${s} +${v + step}`);
  if (g.serious) bonus.push('fewer serious wounds');
  return bonus.join(' · ').replace(/^./, (c) => c.toUpperCase());
}

/**
 * The item's tier as a short coloured tag (the tier's name is always in the text; the colour is
 * only extra: data/gear.js TIERS, --tier-* tokens in styles.css). An item with no tier is Standard.
 */
export function tierTag(item) {
  const id = TIERS[item?.tier] ? item.tier : BASE_TIER;
  const t = TIERS[id];
  return `<span class="tiertag tiertag--${t.colour}" data-tier="${id}">${t.name}</span>`;
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
      <span class="gearrow__main"><span class="gearrow__head"><strong>${esc(itemTitle(item))}</strong>${tierTag(item)}</span>
        <span class="gearrow__eff">${esc(itemEffect(item))}</span>
        ${lookText(item) ? `<span class="gearrow__sub muted small">${item.name ? `${esc(itemName(item))} · ` : ''}${esc(lookText(item))}</span>` : ''}
        ${sub ? `<span class="gearrow__sub muted small">${sub}</span>` : ''}</span>
      ${action ? `<button class="btn gearrow__btn" data-action="${action}" data-id="${esc(id)}" ${item.tier ? `data-tier="${esc(item.tier)}"` : ''} ${disabled ? 'disabled' : ''}>${esc(label)}</button>` : ''}
    </li>`;
}

/** An item for sale: what it does, then a button per tier ("Standard ¥2,500", "Verified +1 ¥6,250"). */
function buyRow(ui, state, type) {
  const { esc, money } = ui;
  const g = GEAR[type];
  return `
    <li class="gearrow gearrow--buy">
      ${thumb({ type, tier: BASE_TIER })}
      <span class="gearrow__main"><span class="gearrow__head"><strong>${esc(g.name)}</strong></span>
        <span class="gearrow__eff">${esc(itemEffect({ type, tier: BASE_TIER }))}</span>
        <span class="gearrow__sub muted small">${esc(g.desc)}</span></span>
      <span class="gearrow__buy">${Object.entries(TIERS).filter(([, t]) => t.live).map(([tier, t]) => `<button class="btn gearrow__btn gearrow__btn--tier tiertag--${t.colour}" data-action="buy" data-id="${esc(type)}" data-tier="${esc(tier)}" ${state.cash < buyPrice(state, type, tier) ? 'disabled' : ''} aria-label="Buy a ${esc(t.name.toLowerCase())} ${esc(g.name.toLowerCase())} for ${esc(money(buyPrice(state, type, tier)))}">${esc(t.name)}${t.step ? ` +${t.step}` : ''} ${esc(money(buyPrice(state, type, tier)))}</button>`).join('')}</span>
    </li>`;
}

/** One of this week's rifles: drawn under the safehouse lamp, its name, and one price. */
function offerRow(ui, state, offer) {
  const { esc, money } = ui;
  const price = buyPrice(state, offer.type, offer.tier, offer);
  return `
    <li class="gearrow gearrow--buy">
      ${thumb(offer)}
      <span class="gearrow__main"><span class="gearrow__head"><strong>${esc(offer.name)}</strong>${tierTag(offer)}</span>
        <span class="gearrow__eff">${esc(itemEffect(offer))}</span>
        <span class="gearrow__sub muted small">${esc(itemName(offer))} · ${esc(lookText(offer))}</span></span>
      <span class="gearrow__buy"><button class="btn gearrow__btn" data-action="buy-offer" data-id="${esc(offer.oid)}" ${state.cash < price ? 'disabled' : ''} aria-label="Buy the ${esc(offer.name)} for ${esc(money(price))}">${esc(money(price))}</button></span>
    </li>`;
}

/** The armoury: the stash (sell, or put it on someone from their page) and what's for sale. */
export function renderArmoury(ui, state) {
  const { esc, money } = ui;
  const stash = state.stash ?? [];
  const worn = state.crew.flatMap((op) => carried(op).map((item) => ({ item, op })));
  const forSale = Object.keys(GEAR).filter((type) => !HAS_LOOKS[type]); // guns come from the weekly shelf
  const offers = state.armoury?.offers ?? [];
  const bySlot = (list, slotOf) => Object.entries(SLOTS).map(([slot, s]) => [s.name, list.filter((x) => slotOf(x) === slot)]).filter(([, l]) => l.length);
  // On Tong › Armoury the tab's own header and sub-tabs frame it (ui.embedded); alone it keeps a heading.
  return `
    <section class="${ui.embedded ? 'armoury' : 'panel'}">
      ${ui.embedded ? '' : `<button class="btn btn--ghost" data-action="back">← ${ui.esc(ui.backLabel ?? 'Crew')}</button>
      <h1>Armoury</h1>`}
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
      ${[['rifle', "This week's rifles"], ['pistol', "This week's sidearms"]].map(([type, title]) => {
        const shelf = offers.filter((o) => o.type === type);
        return `<h3 class="gear__slot">${title}</h3>
      ${shelf.length ? `<ul class="list list--plain gearlist">${shelf.map((o) => offerRow(ui, state, o)).join('')}</ul>` : '<p class="muted small">Sold out.</p>'}`;
      }).join('')}
      <p class="muted small">New guns come in every Monday, each one different.</p>
      ${bySlot(forSale, (type) => GEAR[type].slot).map(([name, list]) => `
        <h3 class="gear__slot">${esc(name)}</h3>
        <ul class="list list--plain gearlist">${list.map((type) => buyRow(ui, state, type)).join('')}</ul>`).join('')}
      </div>
      </div>
    </section>`;
}

/** One worn tile (armour, or an implant socket): its drawing, name and effect, or empty. */
function wornTile(ui, op, { id, label, item, can }) {
  const { esc } = ui;
  const art = item ? gearArt(item, { carrier: op, width: 96 }) : null;
  return `<li><button class="loadout__tile loadout__tile--worn ${item ? '' : 'is-empty'}" data-action="gear-slot" data-id="${id}" ${can.ok ? '' : 'disabled'} aria-label="${esc(label)}: ${esc(item ? `${TIERS[item.tier]?.name ?? TIERS[BASE_TIER].name} ${itemTitle(item)}` : 'empty')}. Tap to change.">
      <span class="loadout__name">${esc(label)}</span>
      <span class="loadout__cell ${art ? '' : 'loadout__pic--icon'}" aria-hidden="true">${item ? art ?? glyphFor(item) : '+'}</span>
      <strong class="loadout__item">${item ? esc(itemTitle(item)) : 'Empty'}</strong>
      ${item ? tierTag(item) : ''}
      ${item ? `<span class="loadout__eff">${esc(itemEffect(item))}</span>` : ''}
    </button></li>`;
}

/**
 * A runner's gear on their page (the carry grid, 2026-11-06; mock-up drafts/prototypes/carry-grid.html):
 * worn (armour, two implant sockets) and the bag of BAG.cols × BAG.rows cells. Tap an empty cell to
 * put something there; tap an item to pick it up, then a free cell to move it, or take it off.
 * picked: the uid of the bag item picked up, or null.
 */
export function renderLoadout(ui, state, op, { picked = null } = {}) {
  const { esc } = ui;
  const can = canChangeGear(state, op);
  const g = op.gear ?? {};
  const bag = g.bag ?? [];
  const held = bag.find((b) => b.item.uid === picked)?.item ?? null;
  const cells = [];
  for (let y = 0; y < BAG.rows; y++) for (let x = 0; x < BAG.cols; x++) {
    const free = !bag.some((b) => b.y === y && x >= b.x && x < b.x + cellsOf(b.item.type));
    if (!free) continue;
    const ok = held ? fitsAt(op, held, x, y) : true;
    cells.push(`<button class="bag__cell ${held && ok ? 'is-free' : ''}" style="grid-column:${x + 1};grid-row:${y + 1}" data-action="bag-cell" data-id="${x},${y}" ${can.ok && ok ? '' : 'disabled'} aria-label="${held ? `Move ${esc(itemTitle(held))} here` : 'Empty space: put something here'}"></button>`);
  }
  const items = bag.map((b) => `<button class="bag__item ${b.item.uid === picked ? 'is-picked' : ''}" style="grid-column:${b.x + 1} / span ${cellsOf(b.item.type)};grid-row:${b.y + 1}" data-action="bag-pick" data-id="${esc(b.item.uid)}" ${can.ok ? '' : 'disabled'} aria-pressed="${b.item.uid === picked}" aria-label="${esc(TIERS[b.item.tier]?.name ?? TIERS[BASE_TIER].name)} ${esc(itemTitle(b.item))}: tap to move it or take it off">${gearArt(b.item, { carrier: op, width: 96 }) ?? `<span class="bag__icon">${glyphFor(b.item)}</span>`}</button>`).join('');
  return `
      <h2>Gear</h2>
      <ul class="list list--plain loadout loadout--worn">
        ${wornTile(ui, op, { id: 'armour', label: 'Armour · worn', item: g.armour ?? null, can })}
        ${Array.from({ length: SOCKETS }, (_, i) => wornTile(ui, op, { id: `implant:${i}`, label: `Implant socket ${i + 1}`, item: (g.implants ?? [])[i] ?? null, can })).join('')}
      </ul>
      ${(g.implants ?? []).length > 1 ? '<p class="muted small">Two implants: their neural load stays higher between jobs (both count).</p>' : ''}
      <h3 class="gear__slot bag__head">Carried <span>${bagUsed(op)} of ${BAG.cols * BAG.rows} cells</span></h3>
      <div class="bag" style="--cols:${BAG.cols};--rows:${BAG.rows}">${cells.join('')}${items}</div>
      ${held ? `<div class="bag__bar"><span><strong>${esc(itemTitle(held))}</strong> · tap a free space to move it</span>
        <button class="btn btn--ghost" data-action="bag-off">Take it off</button><button class="btn btn--ghost" data-action="bag-pick" data-id="${esc(held.uid)}">Done</button></div>` : ''}
      ${bag.length ? `<ul class="list list--plain bag__list">${bag.map((b) => `<li><strong>${esc(itemTitle(b.item))}</strong> ${tierTag(b.item)} <span class="loadout__eff">${esc(itemEffect(b.item))}</span></li>`).join('')}</ul>`
        : '<p class="muted small">Nothing carried. Tap a space to pack a weapon or a tool.</p>'}
      ${can.ok ? '' : `<p class="muted small">Their gear can't change while they're ${esc(can.reason)}.</p>`}
      ${kitsFor(op).length ? '' : '<p class="muted small">No rifle or drone: they can\'t take overwatch.</p>'}`;
}

/** What a place on a runner takes, from the sheet's id: 'armour', 'implant:1' or 'bag:2,0'. */
export function gearPlace(id) {
  const [kind, rest = ''] = String(id).split(':');
  if (kind === 'implant') return { kind, socket: Number(rest), title: `Implant socket ${Number(rest) + 1}` };
  if (kind === 'bag') { const [x, y] = rest.split(',').map(Number); return { kind, x, y, title: 'Carried' }; }
  return { kind: 'armour', title: 'Armour' };
}

/** The sheet for one place: what's in the stash that goes there, what others carry, or take it off. */
export function renderGearSheet(ui, state, op, slot) {
  const { esc } = ui;
  const place = gearPlace(slot);
  const g = op.gear ?? {};
  const current = place.kind === 'armour' ? g.armour ?? null : place.kind === 'implant' ? (g.implants ?? [])[place.socket] ?? null : null;
  const otherImplant = place.kind === 'implant' ? (g.implants ?? []).find((_, i) => i !== place.socket) : null;
  const fits = (item) => {
    if (placeOf(item.type) !== place.kind) return false;
    if (place.kind === 'implant') return item.type !== otherImplant?.type;
    if (place.kind === 'bag') return fitsAt(op, item, place.x, place.y);
    return true;
  };
  const stash = (state.stash ?? []).filter(fits);
  const others = state.crew.filter((o) => o.id !== op.id).flatMap((o) => carried(o).filter(fits).map((item) => ({ item, o })));
  const why = place.kind === 'bag' ? 'Weapons and tools that fit here: a rifle, sidearm, drone or deck takes 3 spaces, a trauma kit or ghost kit 1.'
    : place.kind === 'implant' ? `${otherImplant ? `Not a second ${esc(itemName(otherImplant).toLowerCase())}: the same implant twice does nothing twice. ` : ''}Each implant keeps neural load up; two keep it higher.`
    : current ? `Wearing: ${esc(itemTitle(current))}. Whatever you pick swaps with it.` : 'Nothing worn.';
  return `
    <div class="scrim" data-action="close-gear"></div>
    <div class="sheet" role="dialog" aria-modal="true" aria-label="${esc(place.title)} for ${esc(op.handle)}">
      <div class="sheet__head">
        <div><h2 class="sheet__title">${esc(place.title)} for ${esc(op.handle)}</h2>
        <p class="muted small">${why}</p></div>
        <button class="btn btn--ghost sheet__x" data-action="close-gear" aria-label="Close">✕</button>
      </div>
      <ul class="list list--plain gearlist">${stash.length ? stash.map((item) => itemRow(ui, item, { action: 'equip', label: place.kind === 'bag' ? 'Pack' : 'Carry' })).join('') : `<li class="muted small">Nothing in the stash ${place.kind === 'bag' ? 'fits here' : 'for this'}. Buy it in the armoury.</li>`}</ul>
      ${others.length ? `<h3 class="sheet__group">Carried by others <span>takes it off them</span></h3>
      <ul class="list list--plain gearlist">${others.map(({ item, o }) => itemRow(ui, item, { action: 'equip', label: `From ${o.handle}`, disabled: !canChangeGear(state, o).ok, carrier: o })).join('')}</ul>` : ''}
      ${current ? `<button class="btn btn--ghost btn--block" data-action="unequip" data-id="${esc(current.uid)}">Put it back in the stash</button>` : ''}
      <button class="btn btn--block" data-action="open-armoury">Go to the armoury</button>
    </div>`;
}
