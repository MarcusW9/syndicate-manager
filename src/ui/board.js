// The squad board on the planning screen (PLAN-CORE-LOOP.md, slice 2): dossier cards for the
// inside team and overwatch, a picker sheet to fill a slot, and the coverage read. Markup only;
// app.js owns the plan and the clicks (data-action), core/squad.js the numbers.
//
// ui: helpers from app.js { esc, face, riskBadge, statusChip, keyStats } so the board looks
// like the rest of the game without copying them.

import { OVERWATCH_KIT } from '../core/incidents.js';
import { bestLine } from '../core/squad.js';
import { effectiveStat, maxCrew } from '../core/crew.js';

/** Slots on the board: the inside team (recommended, plus one spare card until the most), then overwatch. */
export function insideSlots(plan, tpl) {
  const most = maxCrew(tpl.crewSize);
  return Math.min(most, Math.max(tpl.crewSize, plan.crew.length + 1));
}

/**
 * Put someone in a slot ('in:<n>' or 'over'), or empty it (opId null). Anyone already in
 * another slot swaps with whoever was here. Returns { crew, overwatch } (the plan's own fields).
 */
export function assignSlot(plan, slot, opId) {
  let crew = [...plan.crew];
  let over = plan.overwatch;
  const here = slot === 'over' ? over : crew[Number(slot.split(':')[1])] ?? null;
  if (opId === here) return { crew, overwatch: over };
  const fromInside = opId ? crew.indexOf(opId) : -1;
  const fromOver = opId && over === opId;
  if (slot === 'over') {
    over = opId;
    if (fromInside >= 0) { if (here) crew[fromInside] = here; else crew.splice(fromInside, 1); }
  } else {
    const n = Number(slot.split(':')[1]);
    if (fromInside >= 0) { crew[fromInside] = here; crew[n] = opId; }
    else if (n < crew.length) crew[n] = opId;
    else if (opId) crew.push(opId);
    if (fromOver) over = here;
  }
  return { crew: crew.filter(Boolean), overwatch: over ?? null };
}

const PINS = ['#ff4f7b', '#36d6c3', '#f5b942', '#b48cff', '#5fe0a5', '#ff9a5a'];
const TILTS = ['-1.5deg', '1deg', '-0.5deg', '1.5deg', '-1deg', '0.5deg'];

function dossier(ui, slot, op, { name, does, line = '', note = '', i = 0 }) {
  const { esc, face } = ui;
  if (!op) {
    return `<button class="dossier is-empty" data-action="pick-slot" data-id="${slot}" aria-label="${esc(name)}: empty. ${esc(does)} Tap to assign.">
      <b>${esc(name)}</b><span class="dossier__sil" aria-hidden="true">+</span><small>${esc(does)}</small></button>`;
  }
  return `<button class="dossier" data-action="pick-slot" data-id="${slot}" style="--tilt:${TILTS[i % TILTS.length]};--pin:${PINS[i % PINS.length]}" aria-label="${esc(name)}: ${esc(op.handle)}. Tap to change.">
      <span class="dossier__photo">${face(op)}</span>
      <span class="dossier__name">${esc(op.handle)}</span>
      <span class="dossier__real">${esc(op.freelance ? `freelance ${op.role}` : op.role)}</span>
      ${line ? `<span class="dossier__note">${esc(line)}</span>` : ''}
      ${note ? `<span class="dossier__tag">${esc(note)}</span>` : ''}
    </button>`;
}

/** The board: who's inside, who's on overwatch with which kit, and Joss's picks. */
export function renderBoard(ui, { plan, tpl, people, crewSize }) {
  const { esc } = ui;
  const kit = OVERWATCH_KIT[plan.kit] ? plan.kit : 'rifle';
  const byId = (id) => people.find((o) => o.id === id);
  const n = insideSlots(plan, tpl);
  const inside = Array.from({ length: n }, (_, i) => {
    const op = byId(plan.crew[i]);
    const extra = i >= crewSize;
    const b = op ? bestLine(op, plan.approach) : null;
    return dossier(ui, `in:${i}`, op, {
      name: extra ? 'Extra' : 'Inside', does: extra ? 'Optional: more backup, more at risk.' : i < 1 ? 'Required.' : 'Recommended.',
      line: b ? `${b.stat} ${b.value}` : '', i,
    });
  }).join('');
  const ow = byId(plan.overwatch);
  const owStat = OVERWATCH_KIT[kit].stat;
  const overCard = dossier(ui, 'over', ow, {
    name: 'Overwatch', does: 'Optional: saves people in trouble.',
    line: ow ? `${owStat} ${effectiveStat(ow, owStat).value} · ${OVERWATCH_KIT[kit].uses} ${kit === 'rifle' ? 'shots' : 'actions'}` : '', note: ow ? kit : '', i: 5,
  });
  const count = plan.crew.length;
  return `
      <div class="board">
        <div class="board__head">
          <p>${count ? `${count} inside · ${crewSize} recommended` : `${crewSize} recommended inside`}</p>
          <button class="btn btn--ghost board__joss" data-action="joss">Joss's picks</button>
        </div>
        <div class="board__group">
          <p class="board__label">Inside team <span>moves as one group</span></p>
          <div class="dossiers" style="--n:${Math.min(4, n)}">${inside}</div>
        </div>
        <div class="board__group">
          <p class="board__label">Outside <span>${esc(OVERWATCH_KIT[kit].desc)}</span></p>
          <div class="kitpick" role="group" aria-label="Overwatch kit">
            ${Object.entries(OVERWATCH_KIT).map(([k, o]) => `<button class="kitpick__btn ${kit === k ? 'is-on' : ''}" data-action="kit" data-id="${k}" aria-pressed="${kit === k}">${esc(o.name)}: ${k === 'rifle' ? 'sees outdoors' : 'sees everywhere'}</button>`).join('')}
          </div>
          <div class="dossiers dossiers--over">${overCard}</div>
        </div>
      </div>`;
}

/**
 * The picker sheet for one slot: everyone who could go, best fit first, with what they'd bring.
 * people: [{ op, status (availability), freelance: { share, left } | null }].
 */
export function renderPicker(ui, { plan, tpl, threat, slot, people, freelancersFull }) {
  const { esc, face, statusChip, keyStats } = ui;
  const over = slot === 'over';
  const kit = OVERWATCH_KIT[plan.kit] ? plan.kit : 'rifle';
  const current = over ? plan.overwatch : plan.crew[Number(slot.split(':')[1])] ?? null;
  const fit = (op) => (over ? effectiveStat(op, OVERWATCH_KIT[kit].stat).value : bestLine(op, plan.approach).value);
  const rows = people
    .filter(({ freelance }) => !(over && freelance))
    .map((p) => ({ ...p, score: p.status.ok ? fit(p.op) : -99 }))
    .sort((a, b) => b.score - a.score);
  const where = (id) => (plan.overwatch === id ? 'overwatch' : plan.crew.includes(id) ? 'inside' : null);
  const name = over ? 'overwatch' : 'the inside team';
  return `
    <div class="scrim" data-action="close-picker"></div>
    <div class="sheet" role="dialog" aria-modal="true" aria-label="Who's on ${name}?">
      <div class="sheet__head">
        <div><h2 class="sheet__title">Who's on ${name}?</h2>
        <p class="muted small">${over ? `With the ${esc(OVERWATCH_KIT[kit].name.toLowerCase())}: ${esc(OVERWATCH_KIT[kit].stat)} counts.` : `Numbers are for this job: ${esc(tpl.keyStats.join(', '))} matter most.`}</p></div>
        <button class="btn btn--ghost sheet__x" data-action="close-picker" aria-label="Close">✕</button>
      </div>
      <ul class="list">
        ${rows.map(({ op, status, freelance }) => {
          const w = where(op.id);
          const blocked = !status.ok || (freelance && freelancersFull && !plan.crew.includes(op.id));
          return `
          <li><button class="cand ${current === op.id ? 'is-on' : ''}" data-action="assign" data-id="${esc(op.id)}" ${blocked ? 'disabled' : ''} aria-pressed="${current === op.id}">
            ${face(op, 'sm')}
            <span class="cand__txt"><strong>${esc(op.handle)}</strong> <span class="muted">${esc(freelance ? `freelance ${op.role}` : op.role)}</span><br>
              <span class="small">${over ? `${esc(OVERWATCH_KIT[kit].stat)} ${fit(op)}` : keyStats(op, tpl, threat)}</span></span>
            <span class="cand__side">${freelance ? `<strong>${Math.round(freelance.share * 100)}%</strong> of pay` : statusChip(status)}${w && current !== op.id ? `<br><span class="small muted">${w} · swaps</span>` : ''}</span>
          </button></li>`;
        }).join('')}
      </ul>
      ${current ? '<button class="btn btn--ghost btn--block" data-action="assign" data-id="">Leave this empty</button>' : ''}
    </div>`;
}

/** The coverage read (core/squad.js coverage): what the crew will likely meet, who handles it, the gaps. */
export function renderCoverage(ui, cov, { overwatch, approachName }) {
  const { esc, riskBadge } = ui;
  if (!cov.rows.some((r) => r.handler)) return '<div class="riskcard"><p class="muted">Pick a crew to see what they\'d face.</p></div>';
  return `
      <div class="cover">
        ${cov.rows.map((r) => `
        <div class="cover__row ${r.gap ? 'is-gap' : ''}">
          <p class="cover__name">${esc(r.name)}${r.danger ? ' <span class="muted">· danger</span>' : ''}</p>
          <span class="cover__risk">${riskBadge(r.handler ? r.risk : 'extreme')}${r.withSave && r.effective !== r.risk ? `<span class="cover__with">→ ${esc(r.effective)} with ${esc(r.withSave.op.handle)}</span>` : ''}</span>
          <p class="cover__who">${esc(r.where)} · ${r.handler ? `${esc(r.handler.op.handle)} (${esc(r.handler.stat)} ${r.handler.value})` : 'nobody can'}</p>
        </div>`).join('')}
        ${cov.spotted ? `<p class="cover__note">${cov.spotted} more than recommended inside on a ${esc(approachName.toLowerCase())} run: −${cov.spotted} on stealth and social rolls.</p>` : ''}
        ${overwatch ? '' : '<p class="cover__note cover__note--muted">No overwatch: only a teammate inside can save someone in trouble.</p>'}
      </div>`;
}
