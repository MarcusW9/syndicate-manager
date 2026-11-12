// The engine-2 screens (battle rework slice 2; drafts/SPEC-battle-orders.md section 20): the round screen a watched
// fight shows while it waits for orders, the call-in cards (a dilemma, death's door), and the plan screen's fight block.
// Phone first (360px), taps of 44px, nothing on hover only. It draws what core/fightview.js hands it; every chance on
// it comes from the rules' own read models (previewRound, fightOddsFor, vanOdds), none is worked out here.
//
// The player's draft (an order or two and a risk level, until Next round) lives here, not in the game state.

import * as F from '../core/fight.js';
import { roundView, planView, orderChoices, RISK_ORDER, riskWords } from '../core/fightview.js';
import { lineText } from '../core/fighttext.js';
import { describePending } from '../core/mission.js';
import { FIGHT } from '../data/fights.js';
import { getPref } from '../save/save.js';

let draft = { key: null, sel: null, orders: {}, risk: null, panel: false, pullAsk: false };

const keyOf = (am) => `${am.jobId}:${am.battle.round}:${am.battle.runners.map((r) => r.id).join()}`;
function current(am) {
  const key = keyOf(am);
  if (draft.key !== key) draft = { key, sel: null, orders: {}, risk: null, panel: false, pullAsk: false };
  return draft;
}

/**
 * The live battle view's pace (drafts/PROPOSAL-live-battle-view.md 5.2): Watch or Fast is a viewing preference
 * (save.js getPref 'fight-watch', never in the save, never read by core); Resolve is the fight handed off (b.auto).
 * Pace never changes what happens, only how long the picture takes and whether Next round waits for a tap.
 */
export const fightPace = (am) => (am?.battle?.auto ? 'resolve' : getPref('fight-watch', false) ? 'watch' : 'fast');

/** Is the player changing orders right now (Fast waits for them)? */
export const editingOrders = (am) => !!am?.battle && draft.key === keyOf(am) && (draft.panel || draft.pullAsk);

/** The pace chips: Fast and Watch set the preference (app.js fs-pace); Resolve hands the fight off (fs-handoff). */
function paceChips(esc, am) {
  const pace = fightPace(am);
  const chip = (p, action) => `<button class="fs-pace__chip ${pace === p ? 'is-on' : ''}" data-action="${action}" data-id="${p}" aria-pressed="${pace === p}">${esc(word(`pace.${p}`))}</button>`;
  return `<div class="fs-pace" role="group" aria-label="${esc(word('pace.label'))}">${chip('fast', 'fs-pace')}${chip('watch', 'fs-pace')}${chip('resolve', 'fs-handoff')}</div>
    ${pace === 'fast' ? `<p class="fs-pace__note">${esc(word('pace.fastNote'))}</p>` : ''}`;
}

/** A tap on the screen (app.js hands every fs-* action here). */
export function fightScreenTap(am, action, { id, duty, target } = {}) {
  if (!am?.battle) return;
  const d = current(am);
  if (action === 'fs-panel') { d.panel = !d.panel; d.sel = d.panel ? d.sel ?? am.battle.runners.find((r) => !r.down && !r.dead && !r.withdrawn && !r.aboard)?.id ?? null : null; return; }
  if (action === 'fs-sel') { d.sel = id; return; }
  if (action === 'fs-order') {
    const t = target === '' || target == null ? null : /^\d+$/.test(target) ? Number(target) : target;
    d.orders[d.sel] = { duty, target: t };
    return;
  }
  if (action === 'fs-clear') { delete d.orders[id ?? d.sel]; return; }
  if (action === 'fs-risk') { d.risk = id === am.battle.risk.level ? null : id; return; }
  if (action === 'fs-pull-ask') { d.pullAsk = true; return; }
  if (action === 'fs-pull-no') { d.pullAsk = false; }
}

/** The change for Next round (core/runfight.js runFight): the risk and the orders the player set, each edited into the stage the fight is in. */
export function takeFightChange(am) {
  const b = am.battle;
  const d = current(am);
  const change = {};
  if (d.risk) change.risk = d.risk;
  const orders = {};
  for (const [id, o] of Object.entries(d.orders)) orders[id] = F.editOrder(b, id, o);
  if (Object.keys(orders).length) change.orders = orders;
  draft = { key: null, sel: null, orders: {}, risk: null, panel: false, pullAsk: false };
  return change;
}

// --- small pieces ------------------------------------------------------------------------------------

const word = (key, slots) => lineText(key, slots);
const pipBar = (esc, pips, max, label) => `<span class="fs-pips" role="img" aria-label="${esc(label)}">${Array.from({ length: max }, (_, i) => `<i class="${i < pips ? 'is-on' : ''}"></i>`).join('')}</span>`;
const pipsLabel = (pips, max) => `${pips} of ${max} pips`;

/** The goal track and the clocks: "Hack ●●○○ · alarm 3 · deadline round 7", or the van's. */
function goalLine(esc, g) {
  if (g.type === 'hack') {
    const dots = `${'●'.repeat(g.work)}${'○'.repeat(Math.max(0, g.needed - g.work))}`;
    return `<p class="fs-goal"><b>Hack</b> <span class="fs-dots" aria-label="${g.work} of ${g.needed} rounds of work">${dots}</span> <span>alarm ${g.alarm}</span> <span>deadline round ${g.deadline}</span></p>`;
  }
  return `<p class="fs-goal">${g.stage === 0 ? `<b>Hold</b> <span>van arrives end of round ${g.vanRound}</span>` : `<b>Van here</b> <span>leaves end of round ${g.vanLeaves}</span>${g.held ? ' <span>held</span>' : ''}`}</p>`;
}

const STATE_WORD = { down: 'down', stable: 'down, stable', dead: 'dead', out: 'pulled out', aboard: 'in the van' };

function enemyCard(esc, e) {
  const threats = e.threats.length ? `<ul class="fs-threats">${e.threats.map((t) => `<li class="fs-threat fs-threat--${t.kind}">${esc(t.text)}</li>`).join('')}</ul>` : '';
  return `<li class="fs-enemy ${e.out ? 'is-out' : ''}">
    <span class="fs-enemy__top"><strong>${esc(e.name)}</strong>${e.out ? `<small>${e.fled ? 'ran' : 'out'}</small>` : pipBar(esc, e.pips, e.max, pipsLabel(e.pips, e.max))}</span>
    ${e.out ? '' : threats}
  </li>`;
}

function runnerRow(esc, face, r, { edited, sel, panel }) {
  const here = r.state === 'standing';
  const thr = r.threshold === 0 ? 'Never pulls out on its own' : `Pulls out at ${r.threshold} ${r.threshold === 1 ? 'pip' : 'pips'} or fewer`;
  const shots = r.shots.length ? `<small class="fs-shots">${r.shots.length} ${r.shots.length === 1 ? 'shot' : 'shots'} on them · worst ${esc(r.shots.slice().sort((a, b) => b.chance - a.chance)[0].text)}${r.shots.some((s) => s.shielded) ? ' (shielded)' : ''}</small>` : '';
  return `<li class="fs-runner ${here ? '' : 'is-off'} ${sel ? 'is-sel' : ''}">
    <span class="fs-runner__top">${face(r.id)}<strong>${esc(r.handle)}</strong>${r.protect ? '<em class="fs-tag">tech</em>' : ''}${r.state === 'standing' ? '' : `<small class="fs-state">${esc(STATE_WORD[r.state])}</small>`}${pipBar(esc, r.pips, r.max, pipsLabel(r.pips, r.max))}</span>
    ${here ? `<span class="fs-order"><small>Order</small> ${edited ? `<b>${esc(edited)}</b> <small>(yours, next round)</small>` : esc(r.orderLabel)}</span>
    ${r.intent ? `<span class="fs-intent">${esc(r.intent.text)}</span>` : ''}
    ${shots}
    <small class="fs-thr">${thr}</small>` : ''}
  </li>`;
}

function riskPicker(esc, b, d) {
  const level = d.risk ?? b.risk.level;
  return `<div class="fs-risk" role="group" aria-label="Risk">
    <div class="fs-seg">${RISK_ORDER.map((k) => `<button class="fs-segbtn ${level === k ? 'is-on' : ''}" data-action="fs-risk" data-id="${k}" aria-pressed="${level === k}">${esc(riskWords(k).label)}</button>`).join('')}</div>
    <p class="fs-riskdesc">${esc(riskWords(level).description)}${d.risk && d.risk !== b.risk.level ? ' <b>(from next round)</b>' : ''}</p>
  </div>`;
}

/** The order editor: pick a runner, a duty, and the target the duty takes. Changes wait for Next round. */
function orderPanel(esc, b, v, d) {
  const r = b.runners.find((x) => x.id === d.sel);
  const rows = v.runners.filter((x) => x.state === 'standing');
  const choices = r ? orderChoices(b, r) : [];
  const cur = d.orders[d.sel];
  const here = r ? F.orderOf(b, r) : null;
  const dutyOn = (x) => (cur ? cur.duty === x.duty : here?.duty === x.duty);
  const targetOn = (x, t) => (cur ? cur.duty === x.duty && String(cur.target ?? '') === String(t ?? '') : here?.duty === x.duty && String(here.target ?? '') === String(t ?? ''));
  return `<div class="fs-panel" role="group" aria-label="Change orders">
    <div class="fs-chips">${rows.map((x) => `<button class="fs-chip ${x.id === d.sel ? 'is-on' : ''} ${d.orders[x.id] ? 'is-set' : ''}" data-action="fs-sel" data-id="${esc(x.id)}" aria-pressed="${x.id === d.sel}">${esc(x.handle)}${d.orders[x.id] ? ' ✓' : ''}</button>`).join('')}</div>
    ${r ? `<div class="fs-duties">${choices.map((x) => `<button class="fs-duty ${dutyOn(x) ? 'is-on' : ''}" data-action="fs-order" data-duty="${x.duty}" data-target="" aria-pressed="${dutyOn(x)}">${esc(x.label)}</button>`).join('')}</div>
    ${(() => { const sel = choices.find((x) => dutyOn(x) && x.targets.length); return sel ? `<div class="fs-targets" role="group" aria-label="Who">${sel.targets.map((t) => `<button class="fs-chip ${targetOn(sel, t.id) ? 'is-on' : ''}" data-action="fs-order" data-duty="${sel.duty}" data-target="${esc(t.id ?? '')}" aria-pressed="${targetOn(sel, t.id)}">${esc(t.label)}</button>`).join('')}</div>` : ''; })()}
    ${cur ? `<button class="fs-link" data-action="fs-clear" data-id="${esc(d.sel)}">Hand ${esc(r.handle)} back to the crew's plan</button>` : ''}` : ''}
  </div>`;
}

/** Last round's feed: the shared event strings, as the report log keeps them. */
function lastRound(esc, am) {
  const last = (am.events ?? []).findLast((e) => e.kind === 'battle' && e.phase === 'round');
  if (!last) return '';
  return `<details class="fs-last"><summary>Round ${last.round}: what happened</summary>${last.lines.map((l) => `<p class="${l.kind === 'guard' ? (l.damage ? 'tone--bad' : '') : l.success === false ? 'tone--bad' : ''}">${esc(l.text)}</p>`).join('')}</details>`;
}

const pullCost = () => word('callin.pullBackCost', { heat: FIGHT.retreat.heat, rep: FIGHT.retreat.rep });

// --- the round screen --------------------------------------------------------------------------------

/** The orders screen for a watched engine-2 fight at a round boundary (threats already drawn). */
export function renderFightRound(state, esc, face = () => '') {
  const am = state.activeMission;
  const b = am.battle;
  const d = current(am);
  const v = roundView(b);
  const labelOf = (id) => {
    const o = d.orders[id];
    if (!o) return '';
    const dutyWord = { attack: 'Attack', protect: 'Protect', support: 'Support', hold: 'Hold', push: b.type === 'holdHack' ? 'Work the hack' : 'Board the van', withdraw: 'Pull out' }[o.duty];
    const t = o.target == null ? '' : typeof o.target === 'number' ? ` ${v.enemies.find((e) => e.n === o.target)?.name ?? ''}` : ` ${b.runners.find((r) => r.id === o.target)?.handle ?? ''}`;
    return `${dutyWord}${t}`;
  };
  const yours = Object.keys(d.orders).length;
  const bar = d.pullAsk
    ? `<div class="fs-confirm" role="alertdialog" aria-label="${esc(word('button.pullBack'))}?">
        <p><strong>${esc(word('button.pullBack'))}?</strong> The job ends and everyone comes home. ${esc(pullCost())}</p>
        <div class="fs-bar"><button class="btn btn--ghost" data-action="fs-pull-no">Stay in the fight</button><button class="btn btn--primary" data-action="fs-pull">${esc(word('button.pullBack'))}</button></div>
      </div>`
    : `<div class="fs-bar">
        <button class="btn btn--primary fs-next" data-action="fs-next">${esc(word('button.nextRound'))}${yours || d.risk ? ` <small>· ${yours ? `${yours} changed` : 'risk changed'}</small>` : ''}</button>
        <div class="fs-bar__more">
          <button class="btn btn--ghost" data-action="fs-panel" aria-expanded="${d.panel}">${esc(word('button.changeOrders'))}</button>
          <button class="btn btn--ghost" data-action="fs-handoff">${esc(word('button.autoFight'))}</button>
          <button class="btn btn--ghost" data-action="fs-pull-ask">${esc(word('button.pullBack'))}</button>
        </div>
      </div>`;
  return `
    <div class="fs" data-callin="fs:${esc(d.key)}">
      ${paceChips(esc, am)}
      <p class="fs-title">Round ${v.round}</p>
      ${goalLine(esc, v.goal)}
      <h4 class="fs-h">Enemies</h4>
      <ul class="fs-list">${v.enemies.map((e) => enemyCard(esc, e)).join('')}</ul>
      <h4 class="fs-h">Crew</h4>
      <ul class="fs-list">${v.runners.map((r) => runnerRow(esc, face, r, { edited: labelOf(r.id), sel: d.panel && r.id === d.sel, panel: d.panel })).join('')}</ul>
      <div class="fs-ifnothing" aria-label="If nothing changes"><b>If nothing changes</b>${v.ifNothing.map((x) => `<p>${esc(x.text)}</p>`).join('')}</div>
      ${riskPicker(esc, b, d)}
      ${d.panel ? orderPanel(esc, b, v, d) : ''}
      ${lastRound(esc, am)}
      ${bar}
    </div>`;
}

// --- call-ins ----------------------------------------------------------------------------------------

/**
 * A call-in on an engine-2 fight: a dilemma (the tech under fire, the van that cannot wait) or death's door. Shows what
 * changed, the crew's intent, each option with what it does and what it costs, and Pull back.
 */
export function renderFightCallIn(state, esc, face = () => '') {
  const am = state.activeMission;
  const b = am.battle;
  const p = am.pending;
  const view = describePending(state);
  const v = roundView(b);
  const standing = v.runners.filter((r) => r.state === 'standing');
  const intents = standing.filter((r) => r.intent).map((r) => `<li>${esc(r.intent.text)}</li>`).join('');
  const heading = p.kind === 'door' ? "The crew is calling in: someone is at death's door" : 'The crew is calling in';
  const roster = `<ul class="fs-mini">${v.runners.map((r) => `<li class="${r.state === 'standing' ? '' : 'is-off'}">${esc(r.handle)} ${pipBar(esc, r.pips, r.max, pipsLabel(r.pips, r.max))}${r.state === 'standing' ? '' : ` <small>${esc(STATE_WORD[r.state])}</small>`}</li>`).join('')}</ul>`;
  const outside = view.outside?.length ? `<p class="fs-outside">${esc(word('callin.outside', { outside: view.outside.join(', ') }))}</p>` : '';
  const choice = (c) => {
    // Hold's heat is the cost; the trade-off line never repeats it. A door choice keeps its own cost line.
    const extra = [c.odds, c.cost && !c.exit ? c.cost : ''].filter(Boolean);
    return `<button class="choice fs-choice ${c.exit ? 'fs-choice--exit' : ''}" data-action="pending" data-id="${esc(c.id)}">
      <span class="choice__label">${esc(c.label)}</span>
      ${c.tradeoff ? `<span class="fs-tradeoff">${esc(c.tradeoff)}</span>` : ''}
      ${c.exit ? `<span class="fs-tradeoff">${esc(c.cost)}</span>` : ''}
      ${p.kind === 'door' && !c.exit ? `<span class="fs-tradeoff">${esc(c.cost)}</span>` : ''}
      ${p.kind === 'dilemma' ? extra.map((x) => `<span class="fs-cost">${esc(x)}</span>`).join('') : ''}
    </button>`;
  };
  return `
    <div class="fs fs--call" data-callin="fscall:${esc(p.kind)}:${esc(p.key ?? p.opId ?? '')}">
      <p class="fs-title">${esc(heading)}</p>
      <p class="fs-changed">${esc(view.text)}</p>
      ${outside}
      ${roster}
      ${intents ? `<p class="fs-lead">${esc(word('callin.intentLead'))}</p><ul class="fs-intents">${intents}</ul>` : ''}
      <div class="choices">${view.choices.map(choice).join('')}</div>
    </div>`;
}

// --- the plan screen's fight block -------------------------------------------------------------------

/**
 * The fight block under the squad board for one of the five jobs: the fight type and objective, likely enemies, gaps,
 * who can jam, each runner's order and pull-out threshold, the risk picker and the chance of losing someone.
 * args are buildFight's (type, diff, threat, site, crew, approach, overwatch, wheels); risk is the plan's starting level.
 */
export function renderFightPlan(esc, args, risk) {
  const p = planView(args, risk);
  const extract = p.type === 'holdExtract';
  return `
    <section class="fs fs--plan" aria-label="The fight">
      <p class="fs-title">The fight</p>
      <p class="fs-planline">${esc(p.line)}</p>
      <p class="fs-muted">${esc(p.kindsLine)}</p>
      ${p.gaps.length ? `<ul class="fs-gaps">${p.gaps.map((g) => `<li>${esc(g)}</li>`).join('')}</ul>` : ''}
      ${p.jam ? `<p class="fs-muted">${esc(p.jam)}</p>` : ''}
      <h4 class="fs-h">Orders${extract ? ' (hold, then board)' : ''}</h4>
      <ul class="fs-list">${p.runners.map((r) => `<li class="fs-runner">
        <span class="fs-runner__top"><strong>${esc(r.handle)}</strong>${r.protect ? '<em class="fs-tag">tech</em>' : ''}${pipBar(esc, r.pips, r.pips, `${r.pips} pips`)}</span>
        <span class="fs-order">${r.orders.map((o) => esc(o.label)).filter((x, i, a) => a.indexOf(x) === i || extract).join(extract ? ' → ' : '')}</span>
        <small class="fs-thr">${r.threshold === 0 ? 'Never pulls out on its own' : `Pulls out at ${r.threshold} ${r.threshold === 1 ? 'pip' : 'pips'} or fewer`}</small>
      </li>`).join('')}</ul>
      <h4 class="fs-h">If it goes badly</h4>
      <div class="fs-seg" role="group" aria-label="Risk">${RISK_ORDER.map((k) => `<button class="fs-segbtn ${risk === k ? 'is-on' : ''}" data-action="orders" data-id="${k}" aria-pressed="${risk === k}">${esc(riskWords(k).label)}</button>`).join('')}</div>
      <p class="fs-riskdesc">${esc(riskWords(risk).description)}</p>
      <p class="fs-loss"><b>${esc(p.loss[risk])}</b></p>
    </section>`;
}
