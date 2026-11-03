// Command fights on the watch screen (2026-10-30, PLAN-CORE-LOOP.md slice 6c): the orders panel a
// fight shows each round while it waits for you, and what the map's overlay draws (siteplan.js
// command). The choices and their odds come from core/battle.js ordersFor, the same numbers the
// round rolls; what the guards mean to do is the battle's intents. Who's picked and the orders given
// so far live here until Go: they're the player's draft, not game state.

import { ordersFor, guardHitChance, freeSpots, coverNow, hitFor, BATTLE } from '../core/battle.js';

let draft = { key: null, sel: null, target: null, orders: {} };

const pct = (c) => `${Math.round(c * 100)}%`;
const COVER_WORD = { full: 'full cover', half: 'half cover', open: 'in the open' };
const MOVE_WORD = { full: 'Move to full cover', half: 'Move to half cover', open: 'Move into the open' };
const standing = (b) => b.runners.filter((r) => !r.down);
const up = (b) => b.guards.filter((g) => !g.out);
const guardName = (b, n) => (b.guards.length > 1 ? `Guard ${n}` : 'The guard');

/** What a runner's shot does to a guard, short: "hits for 3 · 2 hits to drop" (armour taken off, as the round does). */
function shotWord(r, g) {
  const dmg = hitFor(r.damage, g.armour, r.pierce ?? 0);
  const k = Math.ceil(g.hp / dmg);
  return `hits for ${dmg}${g.armour ? ` (armour ${g.armour}${r.pierce ? `, pierces ${Math.min(r.pierce, g.armour)}` : ''})` : ''} · ${k === 1 ? 'drops them' : `${k} hits to drop`}`;
}
/** What a runner carries into the fight: their gun and its damage, their armour. */
const kitWord = (r) => `${r.weapon} ${r.damage}${r.armour ? ` · ${r.armourName ?? 'armour'} −${r.armour}` : ' · no armour'}`;

/** The draft for this fight's round: a new round starts a new draft, with the first runner picked. */
function current(am) {
  const b = am.battle;
  const key = `${am.jobId}:${b.round}:${b.runners.map((r) => r.id).join()}`;
  if (draft.key !== key) draft = { key, sel: standing(b)[0]?.id ?? null, target: null, orders: {} };
  if (!standing(b).some((r) => r.id === draft.sel)) draft.sel = standing(b)[0]?.id ?? null;
  return draft;
}

/** The guard the picked runner's shots and talk go at: picked by tap, else their order's, else the crew's own pick. */
function targetFor(b, r) {
  const o = draft.orders[r.id];
  const auto = ordersFor(b, r.id).find((x) => x.auto);
  const n = draft.target ?? (['shoot', 'flank', 'talk'].includes(o?.kind) ? o.target : null) ?? (['shoot', 'talk'].includes(auto?.kind) ? auto.target : null) ?? up(b)[0]?.n;
  return up(b).some((g) => g.n === n) ? n : up(b)[0]?.n ?? null;
}

/** The player's orders for Go (core/runbattle.js runBattle): only those given; the rest is the crew's call. */
export const takeOrders = () => { const o = draft.orders; draft = { key: null, sel: null, target: null, orders: {} }; return o; };

/** A tap on the panel or the map (app.js): pick a runner, pick a guard, give or clear an order. */
export function fightTap(am, action, { id, kind, target } = {}) {
  const b = am?.battle;
  if (!b) return;
  current(am);
  if (action === 'fight-sel') { draft.sel = id; draft.target = null; return; }
  if (action === 'fight-target') { draft.target = Number(id); return; }
  if (action === 'fight-clear') { delete draft.orders[draft.sel]; return; }
  if (action === 'fight-order') {
    const t = ['shoot', 'flank', 'talk', 'move'].includes(kind) ? Number(target) : target || null;
    const ok = ordersFor(b, draft.sel).some((o) => o.kind === kind && String(o.target ?? '') === String(t ?? ''));
    if (!ok) return;
    draft.orders[draft.sel] = { kind, target: t };
    // A move someone else had planned to the same spot goes back to the crew's call.
    if (kind === 'move') for (const [rid, o] of Object.entries(draft.orders)) if (rid !== draft.sel && o.kind === 'move' && o.target === t) delete draft.orders[rid];
    // On to the next runner without an order, if there is one.
    const next = standing(b).find((r) => !draft.orders[r.id]);
    if (next) { draft.sel = next.id; draft.target = null; }
  }
}

/** What an order reads as, short: "Flank guard 2", "Move to full cover". */
function orderWord(b, o) {
  if (!o) return '';
  const g = (n) => guardName(b, n).toLowerCase();
  const mate = (id) => b.runners.find((r) => r.id === id)?.handle ?? 'them';
  return {
    shoot: () => `Shoot ${g(o.target)}`, flank: () => `Flank ${g(o.target)}`, talk: () => `Talk ${g(o.target)} down`,
    hunker: () => 'Hunker down', lights: () => 'Kill the lights', patch: () => `Patch ${mate(o.target)}`, stabilise: () => `Stabilise ${mate(o.target)}`,
    move: () => MOVE_WORD[b.spots?.crew?.[o.target]?.cover ?? 'open'],
  }[o.kind]?.() ?? o.kind;
}

/** The map overlay (siteplan.js command): cover, the guards' aim with their chance, the orders so far, the picked runner, free spots. */
export function commandView(am) {
  const b = am.battle;
  current(am);
  const sel = b.runners.find((r) => r.id === draft.sel);
  const hunkered = (id) => draft.orders[id]?.kind === 'hunker';
  return {
    runners: b.runners.map((r) => ({ id: r.id, cover: coverNow(r), down: r.down, sel: r.id === draft.sel, order: draft.orders[r.id] ?? null })),
    guards: b.guards.map((g) => ({ n: g.n, cover: coverNow(g), out: g.out, target: sel && g.n === targetFor(b, sel) })),
    intents: (b.intents ?? []).filter((i) => standing(b).some((r) => r.id === i.target)).map((i) => {
      const t = b.runners.find((r) => r.id === i.target);
      const moved = draft.orders[t.id]?.kind === 'move' ? b.spots.crew[draft.orders[t.id].target].cover : null;
      const flank = draft.orders[t.id]?.kind === 'flank';
      return { guard: i.guard, target: i.target, chance: guardHitChance(b, t, flank ? 'open' : moved ?? (hunkered(t.id) ? better(coverNow(t)) : coverNow(t)), hunkered(t.id)) };
    }),
    spots: b.spots?.crew ?? [],
    free: sel && b.spots ? freeSpots(b).map((i) => ({ i, ...b.spots.crew[i] })) : [],
  };
}
const better = (c) => (c === 'open' ? 'half' : 'full');

/** The orders panel, in the watch's call-in slot. esc: app.js's escaper. */
export function renderFightOrders(state, esc) {
  const am = state.activeMission;
  const b = am.battle;
  current(am);
  const sel = b.runners.find((r) => r.id === draft.sel);
  const aimedAt = (id) => (b.intents ?? []).filter((i) => i.target === id);
  const intents = (b.intents ?? []).filter((i) => standing(b).some((r) => r.id === i.target));
  const chip = (r) => {
    const o = draft.orders[r.id];
    const auto = !o && !r.down ? ordersFor(b, r.id).find((x) => x.auto) : null;
    return `<button class="ffo-who ${r.id === draft.sel ? 'is-on' : ''} ${r.down ? 'is-down' : ''}" data-action="fight-sel" data-id="${esc(r.id)}" ${r.down ? 'disabled' : ''} aria-pressed="${r.id === draft.sel}">
      <strong>${esc(r.handle)}</strong>
      <span class="ffo-hp ${r.hp < r.max * 0.25 ? 'is-crit' : r.hp < r.max * 0.5 ? 'is-low' : ''}">${r.down ? 'down' : `${r.hp}/${r.max}`} · ${esc(COVER_WORD[coverNow(r)])}${aimedAt(r.id).length ? ` · <b>${aimedAt(r.id).length} aiming</b>` : ''}</span>
      ${r.down ? '' : `<span class="ffo-kit">${esc(kitWord(r))}</span>`}
      <span class="ffo-order ${o ? 'is-set' : ''}">${r.down ? '' : o ? esc(orderWord(b, o)) : `Crew's call: ${esc(orderWord(b, auto))}`}</span>
    </button>`;
  };
  let acts = '';
  if (sel) {
    const opts = ordersFor(b, sel.id);
    const n = targetFor(b, sel);
    const mine = draft.orders[sel.id];
    const pick = (o) => mine && mine.kind === o.kind && String(mine.target ?? '') === String(o.target ?? '');
    const g = b.guards.find((x) => x.n === n);
    const btn = (o, label, note) => `<button class="ffo-act ${pick(o) ? 'is-on' : ''}" data-action="fight-order" data-kind="${o.kind}" data-target="${esc(o.target ?? '')}" aria-pressed="${pick(o)}"><b>${esc(label)}${o.auto ? ' <i>crew\'s pick</i>' : ''}</b><span>${esc(note)}</span></button>`;
    const of = (kind, t = undefined) => opts.find((o) => o.kind === kind && (t === undefined || o.target === t));
    const list = [];
    const shoot = of('shoot', n); const flank = of('flank', n); const talk = of('talk', n);
    if (shoot) list.push(btn(shoot, `Shoot ${guardName(b, n).toLowerCase()}`, `${pct(shoot.chance)} · ${shotWord(sel, g)} · they're ${COVER_WORD[shoot.cover]}`));
    if (flank && shoot?.cover !== 'open') list.push(btn(flank, `Flank ${guardName(b, n).toLowerCase()}`, `${pct(flank.chance)} · ${shotWord(sel, g)} · everyone's shots at them easier · you're in the open`));
    const hk = of('hunker');
    const incoming = aimedAt(sel.id).reduce((t, i) => t + hitFor(b.guards.find((x) => x.n === i.guard).damage, sel.armour), 0);
    const now = aimedAt(sel.id).length ? `${pct(guardHitChance(b, sel))} → ${pct(guardHitChance(b, sel, better(coverNow(sel)), true))} to be hit · up to ${incoming} damage coming` : 'nobody is aiming at you';
    list.push(btn(hk, 'Hunker down', `no shot · ${now}`));
    // Moves worth making: to better cover than they have (the map shows every free spot to tap).
    const rank = { full: 0, half: 1, open: 2 };
    for (const o of opts.filter((x) => x.kind === 'move' && rank[x.cover] < rank[sel.cover]).sort((x, y) => rank[x.cover] - rank[y.cover]).slice(0, 2)) list.push(btn(o, MOVE_WORD[o.cover], `no shot · ${COVER_WORD[o.cover]} from now on`));
    const picked = mine?.kind === 'move' && !list.some((h) => h.includes('is-on')) ? opts.find((o) => pick(o)) : null;
    if (picked) list.push(btn(picked, MOVE_WORD[picked.cover], `no shot · ${COVER_WORD[picked.cover]} from now on`));
    for (const o of opts.filter((x) => x.kind === 'patch' || x.kind === 'stabilise')) {
      const who = b.runners.find((r) => r.id === o.target);
      list.push(btn(o, `${o.kind === 'patch' ? 'Patch' : 'Stabilise'} ${who.id === sel.id ? 'yourself' : who.handle}`, `${pct(o.chance)}${o.heal ? ` · +${o.heal} health` : ''}`));
    }
    if (talk) list.push(btn(talk, `Talk ${guardName(b, n).toLowerCase()} down`, `${pct(talk.chance)} · they back off`));
    const lights = of('lights');
    if (lights) list.push(btn(lights, 'Kill the lights', `${pct(lights.chance)} · the guards hit less for the rest of the fight`));
    acts = `
      ${up(b).length > 1 ? `<div class="ffo-targets" role="group" aria-label="Which guard">${up(b).map((x) => `<button class="ffo-target ${x.n === n ? 'is-on' : ''}" data-action="fight-target" data-id="${x.n}" aria-pressed="${x.n === n}">Guard ${x.n} <span>${x.hp}/${x.max} · ${esc(COVER_WORD[coverNow(x)])}${x.armour ? ` · armour ${x.armour}` : ''}</span></button>`).join('')}</div>` : g ? `<p class="ffo-note">${esc(guardName(b, n))}: ${g.hp}/${g.max}, ${esc(COVER_WORD[coverNow(g)])}${g.armour ? `, armour ${g.armour}` : ''}.</p>` : ''}
      <div class="ffo-acts">${list.join('')}</div>
      ${mine ? '<button class="btn btn--ghost ffo-clear" data-action="fight-clear">Leave it to them</button>' : ''}`;
  }
  // What the last round did, here as well as in the feed above, so you don't lose your place.
  const last = b.round ? (am.events ?? []).findLast((e) => e.kind === 'battle' && e.phase === 'round' && e.round === b.round) : null;
  return `
    <div class="ffo" data-callin="fight:${esc(draft.key)}">
      <p class="ffo-title">Fight · round ${b.round + 1} <span>${up(b).length} ${up(b).length === 1 ? 'guard' : 'guards'} up</span></p>
      ${last ? `<details class="ffo-last"><summary>Round ${last.round}: ${last.lines.filter((l) => l.damage || l.dropped).length ? esc(last.lines.filter((l) => l.damage || l.dropped).map((l) => l.text).slice(0, 2).join(' ')) : 'nobody hit'}</summary>${last.lines.map((l) => `<p class="${l.kind === 'guard' ? (l.damage ? 'tone--bad' : 'tone--good') : l.success === false ? 'tone--bad' : 'tone--good'}">${esc(l.text)}</p>`).join('')}</details>` : ''}
      ${intents.length ? `<p class="ffo-intents">${intents.map((i) => { const t = b.runners.find((r) => r.id === i.target); const dmg = hitFor(b.guards.find((x) => x.n === i.guard).damage, t.armour); return `<span>${esc(guardName(b, i.guard))} → ${esc(t.handle)} · ${pct(guardHitChance(b, t))} · ${dmg} dmg${t.armour ? ' after armour' : ''}</span>`; }).join('')}</p>` : '<p class="ffo-intents ffo-intents--none">The guards are caught off balance: no shots from them this round.</p>'}
      <div class="ffo-crew">${b.runners.map(chip).join('')}</div>
      ${acts}
      <div class="ffo-bar">
        <button class="btn btn--ghost" data-action="fight-pull">Pull back</button>
        <button class="btn btn--ghost" data-action="fight-auto">Auto round</button>
        <button class="btn btn--ghost" data-action="fight-hand-off">Auto fight</button>
        <button class="btn btn--primary ffo-go" data-action="fight-go">Go</button>
      </div>
      <p class="ffo-note">Anyone without an order does what the crew would. Auto fight leaves the rest of this fight to them. Pull back ends the job and everyone comes home: no pay, heat +${BATTLE.retreat.heat}, reputation −${BATTLE.retreat.rep}${b.van ? '' : ', and the guards get a parting shot (nobody goes down from it)'}.</p>
    </div>`;
}
