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

// The outside slots and the plan field each one fills (slice 3 added Wheels and standby).
export const OUTSIDE = { over: 'overwatch', wheels: 'wheels', standby: 'standby' };

/**
 * Put someone in a slot ('in:<n>', 'over', 'wheels' or 'standby'), or empty it (opId null).
 * Anyone already in another slot swaps with whoever was here. Returns the plan's fields
 * { crew, overwatch, wheels, standby }.
 */
export function assignSlot(plan, slot, opId) {
  const crew = [...plan.crew];
  const out = { overwatch: plan.overwatch ?? null, wheels: plan.wheels ?? null, standby: plan.standby ?? null };
  const get = (sl) => (OUTSIDE[sl] ? out[OUTSIDE[sl]] : crew[Number(sl.split(':')[1])] ?? null);
  const set = (sl, id) => { if (OUTSIDE[sl]) out[OUTSIDE[sl]] = id; else { const n = Number(sl.split(':')[1]); if (n < crew.length) crew[n] = id; else if (id) crew.push(id); } };
  const here = get(slot);
  if (opId === here) return { crew, ...out };
  // Where the incoming person is now, if anywhere.
  const from = !opId ? null : crew.includes(opId) ? `in:${crew.indexOf(opId)}` : Object.keys(OUTSIDE).find((k) => out[OUTSIDE[k]] === opId) ?? null;
  set(slot, opId);
  if (from) set(from, here);
  return { crew: crew.filter(Boolean), ...out };
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
  const wh = byId(plan.wheels);
  const wheelsCard = dossier(ui, 'wheels', wh, { name: 'Wheels', does: 'Optional: takes every driving roll from the van.', line: wh ? `driving ${effectiveStat(wh, 'driving').value}` : '', note: wh ? 'in the van' : '', i: 2 });
  const sb = byId(plan.standby);
  const standbyCard = dossier(ui, 'standby', sb, { name: 'Standby', does: 'Optional: called in when it goes wrong.', line: sb ? `combat ${effectiveStat(sb, 'combat').value} · medical ${effectiveStat(sb, 'medical').value}` : '', note: sb ? 'on call' : '', i: 3 });
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
          <p class="board__label">Outside <span>overwatch, the van, standby</span></p>
          <div class="kitpick" role="group" aria-label="Overwatch kit">
            ${Object.entries(OVERWATCH_KIT).map(([k, o]) => `<button class="kitpick__btn ${kit === k ? 'is-on' : ''}" data-action="kit" data-id="${k}" aria-pressed="${kit === k}">${esc(o.name)}: ${k === 'rifle' ? 'sees outdoors' : 'sees everywhere'}</button>`).join('')}
          </div>
          <p class="small muted board__kitdesc">${esc(OVERWATCH_KIT[kit].desc)}</p>
          <div class="dossiers" style="--n:3">${overCard}${wheelsCard}${standbyCard}</div>
        </div>
      </div>`;
}

/**
 * The picker sheet for one slot: everyone who could go, best fit first, with what they'd bring.
 * people: [{ op, status (availability), freelance: { share, left } | null }].
 */
export function renderPicker(ui, { plan, tpl, threat, slot, people, freelancersFull }) {
  const { esc, face, statusChip, keyStats } = ui;
  const outside = !!OUTSIDE[slot];
  const kit = OVERWATCH_KIT[plan.kit] ? plan.kit : 'rifle';
  const current = outside ? plan[OUTSIDE[slot]] ?? null : plan.crew[Number(slot.split(':')[1])] ?? null;
  // What counts for this slot, best first.
  const FIT = {
    over: { name: 'overwatch', note: `With the ${OVERWATCH_KIT[kit].name.toLowerCase()}: ${OVERWATCH_KIT[kit].stat} counts.`, score: (op) => effectiveStat(op, OVERWATCH_KIT[kit].stat).value, line: (op) => `${OVERWATCH_KIT[kit].stat} ${effectiveStat(op, OVERWATCH_KIT[kit].stat).value}` },
    wheels: { name: 'Wheels', note: 'In the van: they take every driving roll, alone.', score: (op) => effectiveStat(op, 'driving').value, line: (op) => `driving ${effectiveStat(op, 'driving').value}` },
    standby: { name: 'standby', note: 'At the van until called: they can save someone in trouble or get the wounded out.', score: (op) => effectiveStat(op, 'combat').value + effectiveStat(op, 'medical').value / 2, line: (op) => `combat ${effectiveStat(op, 'combat').value} · medical ${effectiveStat(op, 'medical').value}` },
  }[slot] ?? { name: 'the inside team', note: `Numbers are for this job: ${tpl.keyStats.join(', ')} matter most.`, score: (op) => bestLine(op, plan.approach).value, line: null };
  const rows = people
    .filter(({ freelance }) => !(outside && freelance))
    .map((p) => ({ ...p, score: p.status.ok ? FIT.score(p.op) : -99 }))
    .sort((a, b) => b.score - a.score);
  const where = (id) => (plan.crew.includes(id) ? 'inside' : Object.keys(OUTSIDE).find((k) => plan[OUTSIDE[k]] === id)?.replace('over', 'overwatch') ?? null);
  // Free crew first; anyone already on the squad goes below, greyed and tagged with where they are,
  // so tapping the same person again by accident is hard (owner's feedback, 2026-10-27).
  const free = rows.filter(({ op }) => !where(op.id));
  const placed = rows.filter(({ op }) => where(op.id));
  const cand = ({ op, status, freelance }) => {
    const w = where(op.id);
    const here = current === op.id;
    const blocked = !status.ok || (freelance && freelancersFull && !plan.crew.includes(op.id));
    return `
          <li><button class="cand ${here ? 'is-on' : w ? 'is-placed' : ''}" data-action="assign" data-id="${esc(op.id)}" ${blocked ? 'disabled' : ''} aria-pressed="${here}">
            ${face(op, 'sm')}
            <span class="cand__txt"><strong>${esc(op.handle)}</strong> <span class="muted">${esc(freelance ? `freelance ${op.role}` : op.role)}</span><br>
              <span class="small">${FIT.line ? esc(FIT.line(op)) : keyStats(op, tpl, threat)}</span></span>
            <span class="cand__side">${here ? '<span class="cand__where cand__where--here">In this slot</span>' : w ? `<span class="cand__where">${esc(w)}</span>` : freelance ? `<strong>${Math.round(freelance.share * 100)}%</strong> of pay` : statusChip(status)}</span>
          </button></li>`;
  };
  return `
    <div class="scrim" data-action="close-picker"></div>
    <div class="sheet" role="dialog" aria-modal="true" aria-label="Who's on ${esc(FIT.name)}?">
      <div class="sheet__head">
        <div><h2 class="sheet__title">Who's on ${esc(FIT.name)}?</h2>
        <p class="muted small">${esc(FIT.note)}</p></div>
        <button class="btn btn--ghost sheet__x" data-action="close-picker" aria-label="Close">✕</button>
      </div>
      <ul class="list">${free.length ? free.map(cand).join('') : '<li class="muted small">Everyone free is already on the squad.</li>'}</ul>
      ${placed.length ? `
      <h3 class="sheet__group">Already on the squad <span>tap to move them here${current ? ' (they swap places)' : ''}</span></h3>
      <ul class="list">${placed.map(cand).join('')}</ul>` : ''}
      ${current ? '<button class="btn btn--ghost btn--block" data-action="assign" data-id="">Leave this empty</button>' : ''}
    </div>`;
}

/** The coverage read (core/squad.js coverage): what the crew will likely meet, who handles it, the gaps. */
export function renderCoverage(ui, cov, { overwatch, approachName, standby = null }) {
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
        ${standby ? `<p class="cover__note cover__note--muted">${esc(standby.handle)} is on standby: they can come in at max alert (the alert stays up, but they back up rolls and get a try at saving anyone in trouble) or to get someone badly hurt out.</p>` : ''}
      </div>`;
}
