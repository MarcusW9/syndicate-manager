// Command fights on the watch screen (2026-10-30, PLAN-CORE-LOOP.md slice 6c): the orders panel a
// fight shows each round while it waits for you, and what the map's overlay draws (siteplan.js
// command). The choices and their odds come from core/battle.js ordersFor, the same numbers the
// round rolls; what the guards mean to do is the battle's intents. Who's picked and the orders given
// so far live here until Go: they're the player's draft, not game state.

import { ordersFor, guardHitChance, freeSpots, coverNow, hitFor, foeWord, BATTLE } from '../core/battle.js';

let draft = { key: null, sel: null, target: null, orders: {} };
let rulesOpen = false; // the "?" card: open stays open, fight to fight
let logOpen = false; // the fight's log on a phone (the feed steps aside there while orders wait)
/** Phones and tablets in portrait (the map above the panel, styles.css): a shot, flank or talk asks
 *  which guard after you pick it, so the guard chips only take room when they're needed. */
const NARROW = '(max-width: 1099px)';
const narrow = () => typeof window !== 'undefined' && !!window.matchMedia?.(NARROW).matches;
const AT_GUARD = ['shoot', 'flank', 'talk'];

const pct = (c) => `${Math.round(c * 100)}%`;
const COVER_WORD = { full: 'full cover', half: 'half cover', open: 'in the open' };
const MOVE_WORD = { full: 'Move to full cover', half: 'Move to half cover', open: 'Move into the open' };
const standing = (b) => b.runners.filter((r) => !r.down);
const up = (b) => b.guards.filter((g) => !g.out);
const Foe = (b) => foeWord(b)[0].toUpperCase() + foeWord(b).slice(1);
const guardName = (b, n) => (b.guards.length > 1 ? `${Foe(b)} ${n}` : `The ${foeWord(b)}`); // a raid's raiders by name (core/battle.js foeWord)

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
  if (action === 'fight-sel') { draft.sel = id; draft.target = null; draft.aim = null; return; }
  if (action === 'fight-target') {
    draft.target = Number(id);
    // Picking the guard for the shot, flank or talk you just chose (phone): that's the order.
    if (draft.aim) { const kind = draft.aim; draft.aim = null; give(b, kind, Number(id)); }
    return;
  }
  if (action === 'fight-more') { draft.menu = !draft.menu; return; }
  if (action === 'fight-log') { logOpen = !logOpen; return; }
  if (action === 'fight-clear') { delete draft.orders[id ?? draft.sel]; return; }
  if (action === 'fight-pull-ask') { draft.pullAsk = true; return; }
  if (action === 'fight-pull-no') { draft.pullAsk = false; return; }
  if (action === 'fight-rules') { rulesOpen = !rulesOpen; return; }
  if (action === 'fight-order') {
    const t = [...AT_GUARD, 'move'].includes(kind) ? Number(target) : target || null;
    const had = draft.orders[draft.sel];
    // Tapping the order you gave hands it back to the crew.
    if (had && had.kind === kind && String(had.target ?? '') === String(t ?? '')) { delete draft.orders[draft.sel]; draft.aim = null; return; }
    // On a phone, a shot, flank or talk asks which guard first (tap it again to put the question away).
    if (AT_GUARD.includes(kind) && up(b).length > 1 && narrow()) { draft.aim = draft.aim === kind ? null : kind; return; }
    draft.aim = null;
    give(b, kind, t);
  }
}

/** Give the picked runner an order (the crew's own pick hands it back to them), then go on to the next. */
function give(b, kind, t) {
  const opt = ordersFor(b, draft.sel).find((o) => o.kind === kind && String(o.target ?? '') === String(t ?? ''));
  if (!opt) return;
  if (opt.auto) delete draft.orders[draft.sel];
  else draft.orders[draft.sel] = { kind, target: t };
  // A move someone else had planned to the same spot goes back to the crew's call.
  if (kind === 'move') for (const [rid, o] of Object.entries(draft.orders)) if (rid !== draft.sel && o.kind === 'move' && o.target === t) delete draft.orders[rid];
  // On to the next runner without an order, if there is one.
  const next = standing(b).find((r) => !draft.orders[r.id] && r.id !== draft.sel);
  if (next) { draft.sel = next.id; draft.target = null; }
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
    runners: b.runners.map((r) => ({ id: r.id, cover: coverNow(r), down: r.down, sel: r.id === draft.sel, order: draft.orders[r.id] ?? null,
      // The picked runner's crew's call, drawn faded (only theirs: five faded lines would be a tangle).
      call: r.id === draft.sel && !r.down && !draft.orders[r.id] ? ordersFor(b, r.id).find((x) => x.auto) ?? null : null })),
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

/** The orders panel, in the watch's call-in slot (2026-11-03: a compact roster, then the picked
 *  runner's tray). esc: app.js's escaper; face(id): their portrait, small. */
export function renderFightOrders(state, esc, face = () => '') {
  const am = state.activeMission;
  const b = am.battle;
  current(am);
  const sel = b.runners.find((r) => r.id === draft.sel);
  const aimedAt = (id) => (b.intents ?? []).filter((i) => i.target === id);
  const intents = (b.intents ?? []).filter((i) => standing(b).some((r) => r.id === i.target));
  const short = (s) => s.replace(/\bguard (\d)/g, 'G$1').replace(/\b(officer|enforcer|collector) (\d)/g, (m, w, d) => `${w[0].toUpperCase()}${d}`).replace(/^The guard\b|\bthe guard\b/, 'guard');
  // One row each: face, name, health, cover, who's aiming, and their order (yours, or the crew's call).
  const row = (r) => {
    const o = draft.orders[r.id];
    const auto = !o && !r.down ? ordersFor(b, r.id).find((x) => x.auto) : null;
    const aim = aimedAt(r.id);
    const hp = Math.max(0, r.hp) / r.max;
    const tag = r.down ? `<span class="ffo-tag is-down">${r.stable ? 'Stable' : 'Down'}</span>`
      : o ? `<button class="ffo-tag is-set" data-action="fight-clear" data-id="${esc(r.id)}" aria-label="${esc(`${r.handle}: ${orderWord(b, o)}. Tap to leave it to the crew`)}"><small>You</small> ${esc(short(orderWord(b, o)))} <span aria-hidden="true">✕</span></button>`
      : `<span class="ffo-tag"><small>Crew</small> ${esc(short(orderWord(b, auto)))}</span>`;
    return `<div class="ffo-row ${r.id === draft.sel ? 'is-on' : ''} ${r.down ? 'is-down' : ''}">
      <button class="ffo-who" data-action="fight-sel" data-id="${esc(r.id)}" ${r.down ? 'disabled' : ''} aria-pressed="${r.id === draft.sel}">
        ${face(r.id)}
        <span class="ffo-who__main">
          <span class="ffo-who__top"><strong>${esc(r.handle)}</strong>${r.down ? '' : `<span class="ffo-cover ffo-cover--${coverNow(r)}">${coverNow(r)}</span>`}${aim.length ? `<b class="ffo-aimed" aria-label="${aim.length} aiming at them, ${pct(guardHitChance(b, r))} to hit">⌖${aim.length} · ${pct(guardHitChance(b, r))}</b>` : ''}</span>
          <span class="ffo-hp ${hp < 0.25 ? 'is-crit' : hp < 0.5 ? 'is-low' : ''}"><span class="ffo-hpbar" aria-hidden="true"><i style="width:${Math.round(hp * 100)}%"></i></span>${r.down ? 'down' : `${r.hp}/${r.max}`}</span>
        </span>
      </button>
      ${tag}
    </div>`;
  };
  let tray = '';
  if (sel) {
    const opts = ordersFor(b, sel.id);
    const n = targetFor(b, sel);
    const mine = draft.orders[sel.id];
    const auto = opts.find((o) => o.auto);
    const same = (x, o) => x && x.kind === o.kind && String(x.target ?? '') === String(o.target ?? '');
    const pick = (o) => (mine ? same(mine, o) : false);
    const g = b.guards.find((x) => x.n === n);
    // name, the big number (blank when nothing rolls), what it does in a line, the crew's pick badge.
    const btn = (o, label, note, odds = pct(o.chance)) => `<button class="ffo-act ${pick(o) ? 'is-on' : ''} ${!mine && same(auto, o) ? 'is-call' : ''} ${draft.aim === o.kind ? 'is-aim' : ''}" data-action="fight-order" data-kind="${o.kind}" data-target="${esc(o.target ?? '')}" aria-pressed="${pick(o)}">
        <b>${esc(label)}${o.auto ? ' <i>crew\'s pick</i>' : ''}</b><em>${odds}</em><span>${esc(note)}</span></button>`;
    const of = (kind, t = undefined) => opts.find((o) => o.kind === kind && (t === undefined || o.target === t));
    const list = [];
    const shoot = of('shoot', n); const flank = of('flank', n); const talk = of('talk', n);
    if (shoot) list.push(btn(shoot, `Shoot ${guardName(b, n).toLowerCase()}`, `${shotWord(sel, g)} · they're ${COVER_WORD[shoot.cover]}`));
    if (flank && shoot?.cover !== 'open') list.push(btn(flank, `Flank ${guardName(b, n).toLowerCase()}`, `${shotWord(sel, g)} · everyone's shots at them easier · you're in the open`));
    const hk = of('hunker');
    const incoming = aimedAt(sel.id).reduce((t, i) => t + hitFor(b.guards.find((x) => x.n === i.guard).damage, sel.armour), 0);
    const now = aimedAt(sel.id).length ? `${pct(guardHitChance(b, sel))} → ${pct(guardHitChance(b, sel, better(coverNow(sel)), true))} to be hit · up to ${incoming} damage coming` : 'nobody is aiming at you';
    list.push(btn(hk, 'Hunker down', `no shot · ${now}`, ''));
    // Moves worth making: to better cover than they have (the map shows every free spot to tap).
    const rank = { full: 0, half: 1, open: 2 };
    for (const o of opts.filter((x) => x.kind === 'move' && rank[x.cover] < rank[sel.cover]).sort((x, y) => rank[x.cover] - rank[y.cover]).slice(0, 2)) list.push(btn(o, MOVE_WORD[o.cover], `no shot · ${COVER_WORD[o.cover]} from now on`, ''));
    const picked = mine?.kind === 'move' && !list.some((h) => h.includes('is-on')) ? opts.find((o) => pick(o)) : null;
    if (picked) list.push(btn(picked, MOVE_WORD[picked.cover], `no shot · ${COVER_WORD[picked.cover]} from now on`, ''));
    for (const o of opts.filter((x) => x.kind === 'patch' || x.kind === 'stabilise')) {
      const who = b.runners.find((r) => r.id === o.target);
      list.push(btn(o, `${o.kind === 'patch' ? 'Patch' : 'Stabilise'} ${who.id === sel.id ? 'yourself' : who.handle}`, o.heal ? `+${o.heal} health` : 'keeps them from bleeding out'));
    }
    if (talk) list.push(btn(talk, `Talk ${guardName(b, n).toLowerCase()} down`, 'they back off'));
    const lights = of('lights');
    if (lights) list.push(btn(lights, 'Kill the lights', `the ${foeWord(b)}s hit less for the rest of the fight`));
    // The guards, numbered as on the map, with this runner's shot at each; anyone down greyed, in place.
    const aimKind = draft.aim && of(draft.aim) ? draft.aim : null;
    const guards = b.guards.map((x) => {
      const s = of(aimKind ?? 'shoot', x.n);
      return x.out ? `<span class="ffo-target is-out">Guard ${x.n} <span>down</span></span>`
        : `<button class="ffo-target ${x.n === n ? 'is-on' : ''}" data-action="fight-target" data-id="${x.n}" aria-pressed="${x.n === n}">Guard ${x.n}${s ? ` <em>${pct(s.chance)}</em>` : ''} <span>${x.hp}/${x.max} · ${esc(COVER_WORD[coverNow(x)])}${x.armour ? ` · armour ${x.armour}` : ''}</span></button>`;
    }).join('');
    const threats = aimedAt(sel.id).map((i) => `${guardName(b, i.guard)} aims at them: ${pct(guardHitChance(b, sel))} · ${hitFor(b.guards.find((x) => x.n === i.guard).damage, sel.armour)} damage`);
    tray = `
      <div class="ffo-tray">
        <p class="ffo-tray__who"><strong>${esc(sel.handle)}</strong> <span>${esc(kitWord(sel))}</span></p>
        ${threats.length ? `<p class="ffo-threat">${threats.map(esc).join('<br>')}</p>` : ''}
        <div class="ffo-targets ${aimKind ? 'is-aiming' : ''}" role="group" aria-label="Which ${foeWord(b)}">${aimKind ? `<p class="ffo-aimq">${{ shoot: 'Shoot', flank: 'Flank', talk: 'Talk down' }[aimKind]} which ${foeWord(b)}? <span>Tap one here or on the map.</span></p>` : ''}${guards}</div>
        <div class="ffo-acts">${list.join('')}</div>
      </div>`;
  }
  // What the last round did, here as well as in the feed above, so you don't lose your place.
  const last = b.round ? (am.events ?? []).findLast((e) => e.kind === 'battle' && e.phase === 'round' && e.round === b.round) : null;
  const yours = standing(b).filter((r) => draft.orders[r.id]).length;
  const theirs = standing(b).length - yours;
  const go = !yours ? "all the crew's call" : !theirs ? 'all yours' : `${yours} yours, ${theirs} crew's call`;
  const cost = `no pay, heat +${BATTLE.retreat.heat}, reputation −${BATTLE.retreat.rep}${b.van ? '' : ', and the guards get a parting shot (nobody goes down from it)'}`;
  // A phone's log (the feed steps aside while orders wait): the latest line, tap for this fight's play-by-play.
  const fightEvents = (() => { const ev = (am.events ?? []).filter((e) => e.kind === 'battle'); const i = ev.findLastIndex((e) => e.phase === 'start'); return i < 0 ? [] : ev.slice(i); })();
  const logLines = fightEvents.flatMap((e) => (e.phase === 'round' ? [{ head: `Round ${e.round}` }, ...e.lines.map((l) => ({ text: l.text, bad: l.kind === 'guard' ? !!l.damage : l.success === false }))] : e.text ? [{ text: e.text, bad: false }] : []));
  const latest = last ? `Round ${last.round}: ${last.lines.filter((l) => l.damage || l.dropped).map((l) => l.text).slice(0, 2).join(' ') || 'nobody hit.'}` : fightEvents[0]?.text ?? '';
  const log = `
      <button class="ffo-log" data-action="fight-log" aria-expanded="${logOpen}"><span>${esc(latest)}</span><small>Log ${logOpen ? '▴' : '▾'}</small></button>
      ${logOpen ? `<div class="ffo-loglist">${logLines.map((l) => (l.head ? `<b>${esc(l.head)}</b>` : `<p class="${l.bad ? 'tone--bad' : ''}">${esc(l.text)}</p>`)).join('')}</div>` : ''}`;
  const bar = draft.pullAsk
    ? `<div class="ffo-confirm" role="alertdialog" aria-label="Pull back?">
        <p><strong>Pull back?</strong> The job ends and everyone comes home: ${esc(cost)}.</p>
        <div class="ffo-bar ffo-bar--confirm">
          <button class="btn btn--ghost" data-action="fight-pull-no">Stay in the fight</button>
          <button class="btn btn--primary" data-action="fight-pull">Pull back</button>
        </div>
      </div>`
    : `<div class="ffo-bar">
        <button class="btn btn--ghost" data-action="fight-pull-ask">Pull back</button>
        <button class="btn btn--ghost" data-action="fight-auto">Auto round</button>
        <button class="btn btn--ghost" data-action="fight-hand-off">Auto fight</button>
        <button class="btn btn--primary ffo-go" data-action="fight-go">Go <small>· ${esc(go)}</small></button>
        <button class="btn btn--ghost ffo-more" data-action="fight-more" aria-expanded="${!!draft.menu}" aria-label="More: auto round, auto fight">⋯</button>
        ${draft.menu ? `<div class="ffo-menu" role="menu">
          <button role="menuitem" data-action="fight-auto">Auto round<small>Play this round on the crew's calls</small></button>
          <button role="menuitem" data-action="fight-hand-off">Auto fight<small>Leave the rest of this fight to them</small></button>
        </div>` : ''}
      </div>`;
  return `
    <div class="ffo" data-callin="fight:${esc(draft.key)}">
      <p class="ffo-title">Fight · round ${b.round + 1} <span>${up(b).length} ${up(b).length === 1 ? 'guard' : 'guards'} up</span>
        <button class="ffo-help ${rulesOpen ? 'is-on' : ''}" data-action="fight-rules" aria-expanded="${rulesOpen}" aria-label="How fights work">?</button></p>
      ${rulesOpen ? `<div class="ffo-rules" role="note">
        <p>Tap someone (here or on the map), then what they do; if it needs a guard, tap the guard. Tap an order you gave to hand it back to the crew.</p>
        <p>Anyone without an order does what the crew would: their call shows faded on their row and on the map. Go plays the round. Auto round plays one on the crew's calls; Auto fight leaves the rest of this fight to them.</p>
        <p>Pull back ends the job and everyone comes home: ${esc(cost)}.</p>
      </div>` : ''}
      ${log}
      ${last ? `<details class="ffo-last"><summary>Round ${last.round}: ${last.lines.filter((l) => l.damage || l.dropped).length ? esc(last.lines.filter((l) => l.damage || l.dropped).map((l) => l.text).slice(0, 2).join(' ')) : 'nobody hit'}</summary>${last.lines.map((l) => `<p class="${l.kind === 'guard' ? (l.damage ? 'tone--bad' : 'tone--good') : l.success === false ? 'tone--bad' : 'tone--good'}">${esc(l.text)}</p>`).join('')}</details>` : ''}
      ${intents.length ? '' : '<p class="ffo-intents--none">The guards are caught off balance: no shots from them this round.</p>'}
      <div class="ffo-crew">${b.runners.map(row).join('')}</div>
      ${tray}
      ${bar}
    </div>`;
}
