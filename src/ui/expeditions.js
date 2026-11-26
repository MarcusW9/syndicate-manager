// Jobs › Expeditions (the adventure log, slice 2; core/expeditions.js): the crews out on our own errands, each
// with its latest log line and the whole log on tap, then the goals to send a crew after; and the plan screen
// (goal, district, who goes, the read). Planned on the side plan's home (V.sidePlan.expGoal), like posts.

import { GOALS, GOAL_ORDER, EXPEDITION, EXPEDITION_DISTRICTS } from '../data/expeditions.js';
import { expeditionsOut, expeditionOdds, canSend } from '../core/expeditions.js';
import { availability } from '../core/crew.js';
import { statIcon } from './icons.js';
import { esc, infoButton, infoText, face, statName, districtName, statusChip, riskBadge } from './shared.js';
import { state, backLabel, V } from './view.js';
import { outRows, tripRow } from './outrows.js';

const ops = (ids) => ids.map((id) => state.crew.find((o) => o.id === id)).filter(Boolean);

/** Jobs › Expeditions: who is out, then the goals. */
export function renderExpeditions() {
  const out = expeditionsOut(state);
  return `
      <h2>Expeditions</h2>
      <div class="infoline"><p class="muted small">Our own errands: send a crew after something the tong wants.</p>${infoButton('expeditions', 'About expeditions')}</div>
      ${infoText('expeditions', `A crew goes out for a few days after one thing: a weapon, cash or a recruit. Nobody pays for it and it earns no fame: what they bring back is the point. They send a line home every day. If a deal goes wrong they call you: watch the fight, let them fight it, or pull out. You can pull them out any day; everyone comes home and keeps what they found. Up to ${EXPEDITION.maxCrew} go, to any open district.`)}
      ${outRows(out.map(tripRow), 'Out on an expedition')}
      <ul class="list list--cols sidelist">
        ${GOAL_ORDER.map((id) => {
          const g = GOALS[id];
          return `<li>
            <button class="row siderow" data-action="exp-open" data-id="${esc(id)}">
              <strong class="siderow__reward siderow__reward--money">${esc(g.name)}</strong>
              <span class="siderow__meta">${g.days}d · up to ${EXPEDITION.maxCrew}</span>
              <span class="siderow__sub">${esc(g.met)} · ${g.stats.map(statIcon).join('')}</span>
            </button>
          </li>`;
        }).join('')}
      </ul>`;
}

/** Sending a crew: the goal, where, who goes, and the read (how likely the goal is met). */
export function renderExpeditionPlan() {
  const p = V.sidePlan;
  const g = GOALS[p.expGoal];
  const picked = ops(p.crew);
  const odds = picked.length ? expeditionOdds(state, p.expGoal, p.crew, p.district) : null;
  const can = canSend(state, p.expGoal, p.district, p.crew);
  const fit = (op) => g.stats.reduce((n, st) => n + (op.stats[st] ?? 0), 0);
  const bench = state.crew.filter((op) => !op.freelance && !p.crew.includes(op.id)).sort((a, b) => fit(b) - fit(a));
  const full = picked.length >= EXPEDITION.maxCrew;
  return `
    <section class="panel postplan">
      <button class="btn btn--ghost" data-action="back">← ${esc(backLabel())}</button>
      <h1>Expedition: ${esc(g.name.toLowerCase())}</h1>
      <p class="muted">${g.days} days away · up to ${EXPEDITION.maxCrew} · no pay, no fame</p>
      <p class="body">${esc(g.pitch)}</p>
      <div class="riskcard">
        <p><strong>Brings home:</strong> ${esc(g.met)} if it goes well; ${esc(g.partial)} if it half works; ${esc(g.failed)} if not. Cash, gear or a rumour can turn up on any day.</p>
        <p><strong>If a deal goes wrong:</strong> they call you. Watch the fight, let them fight it, or pull out (everyone home). Cautious and steady lose nobody without asking you.</p>
        <p class="muted small">Rolled on ${g.stats.map(statName).join(', ')}, whoever is best at each. A snag can cost a little cash or a light injury. You can pull them out any day.</p>
      </div>
      <h2>Where</h2>
      <div class="expwhere" role="group" aria-label="District">
        ${EXPEDITION_DISTRICTS.map((d) => `<button class="seg ${p.district === d ? 'is-on' : ''}" data-action="exp-district" data-id="${esc(d)}" aria-pressed="${p.district === d}">${esc(districtName(d))}</button>`).join('')}
      </div>
      <h2>Who goes</h2>
      ${picked.length ? `<div class="slotchips postslots">${picked.map((op) => `<button class="slotchip slotchip--on" data-action="exp-remove" data-id="${esc(op.id)}" aria-label="${esc(op.handle)} is going. Tap to take them off.">${face(op, 'sm')}<b>${esc(op.handle)}</b><small>${g.stats.map((st) => `${statName(st)} ${op.stats[st]}`).join(' · ')}</small></button>`).join('')}</div>` : ''}
      <ul class="list postbench">
        ${bench.map((op) => {
          const a = availability(state, op);
          return `<li><button class="row postpick" data-action="exp-add" data-id="${esc(op.id)}" ${a.ok && !full ? '' : 'disabled'}>
              ${face(op, 'sm')}
              <span class="row__main"><strong>${esc(op.handle)}</strong> <span class="muted">${esc(op.role)}</span><br><span class="small">${g.stats.map((st) => `${statName(st)} ${op.stats[st]}`).join(' · ')}</span></span>
              <span class="row__meta">${a.ok ? (full ? '<span class="muted small">Full</span>' : '<span class="small">Add</span>') : statusChip(a)}</span>
            </button></li>`;
        }).join('')}
      </ul>
    </section>
    <div class="planbar">
      <div class="planbar__read">
        ${odds ? riskBadge(odds.risk) : '<span class="risk risk--none">nobody yet</span>'}
        <span class="planbar__why">${esc(odds ? `About ${Math.round(odds.met * 100)}% to get it · ${odds.reads.map((r) => `${statName(r.stat)} ${r.value}`).join(', ')}` : `Pick up to ${EXPEDITION.maxCrew}`)}</span>
      </div>
      <button class="btn btn--primary" data-action="exp-send" ${can.ok ? '' : 'disabled'}>${can.ok ? `Send ${picked.length}` : esc(can.reason)}</button>
    </div>`;
}
