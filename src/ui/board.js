// The squad board on the planning screen (PLAN-CORE-LOOP.md, slice 2): a polaroid and an inventory
// for each runner inside and outside, on a gear mat (2026-11-08; dossier cards before it), a picker
// sheet to fill a slot, and the coverage read. Markup, plus fitGearArt to run after a render;
// app.js owns the plan and the clicks (data-action), core/squad.js the numbers.
//
// ui: helpers from app.js { esc, face, riskBadge, statusChip, keyStats } so the board looks
// like the rest of the game without copying them.

import { jobGain } from '../core/worth.js';
import { overwatchKit, kitsFor, carried, itemTitle } from '../core/gear.js';
import { gearArt, portrait } from './art.js';
import { SPECIALISATIONS } from '../data/specialisations.js';

const SPEC_NAME = Object.fromEntries(Object.entries(SPECIALISATIONS).map(([id, s]) => [id, s.name]));
import { bestLine } from '../core/squad.js';
import { effectiveStat, maxCrew } from '../core/crew.js';
import { riskLabel } from '../core/risk.js';
import { statValue, statGlyph } from './icons.js';

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

/** The kit overwatch takes: the one picked, if they carry it, or the first they do (null: none). */
export function planKit(plan, op) {
  const kits = kitsFor(op);
  return kits.includes(plan.kit) ? plan.kit : kits[0] ?? null;
}

/** "combat 9 · 2 shots" for someone on overwatch with this kit. */
function kitLine(op, kitId) {
  const k = overwatchKit(op, kitId);
  // The uses on a line of their own (owner, 2026-11-06: "combat 11 · 2 shots" wrapped mid-phrase on the card).
  return `${statValue(k.stat, effectiveStat(op, k.stat).value + k.bonus)}<span class="kituses"><span class="kituses__sep"> · </span>${k.uses} ${kitId === 'rifle' ? 'shots' : 'actions'}</span>`;
}

// The squad as polaroids over an inventory (owner, 2026-11-08; mock-up drafts/prototypes/gear-grid.mjs,
// M, and gear-mat.mjs, N3 without the fit glow): each runner a column, their photo on top and what
// they carry on a straight grid of cells under it, two cells wide. Long things (rifle, drone, deck)
// take 2×1, as wide as the photo; small things 1×1. Display only: the bag's own sizes are data/gear.js.
const LONG = new Set(['rifle', 'drone', 'deck']);
// The role as the stat it leans on, drawn before the handle.
const ROLE_STAT = { tech: 'tech', face: 'social', muscle: 'combat', medic: 'medical', driver: 'driving', infiltrator: 'stealth' };
const PINS = ['#ff4f7b', '#36d6c3', '#f5b942', '#b48cff', '#5fe0a5', '#ff9a5a'];
const TILTS = ['-1.2deg', '0.8deg', '-0.6deg', '1deg', '-0.9deg', '0.5deg'];

/** What they carry that has a drawing: the preferred type first (overwatch's kit), then long things. */
function invItems(op, prefer = null) {
  const rank = (i) => (i.type === prefer ? 0 : LONG.has(i.type) ? 1 : 2);
  return carried(op).filter((i) => gearArt(i)).sort((a, b) => rank(a) - rank(b));
}

/**
 * The inventory: two cells across, at least two rows. On a phone only the first row shows, with
 * "+N" for the rest (the board's container query hides .is-more); wider, the whole grid and names.
 */
function inventory(ui, op, prefer) {
  const items = invItems(op, prefer);
  let cells = 0;
  let first = 0;
  const html = items.map((it) => {
    const w = LONG.has(it.type) ? 2 : 1;
    const inFirst = cells + w <= 2;
    if (inFirst) first += 1;
    cells += w;
    return `<span class="inv__it ${w === 2 ? 'is-long' : ''} ${inFirst ? '' : 'is-more'}">${gearArt(it, { carrier: op, bare: true })}<span class="inv__name">${ui.esc(itemTitle(it))}</span></span>`;
  }).join('');
  const total = Math.max(4, cells + (cells % 2));
  const blanks = Array.from({ length: total - cells }, (_, k) => `<span class="inv__cell ${cells + k < 2 ? '' : 'is-more'}"></span>`).join('');
  const more = items.length - first;
  return `<span class="inv">${html}${blanks}${more ? `<span class="inv__more" aria-label="${more} more carried">+${more}</span>` : ''}</span>`;
}

/** The photo: a white frame, the handle in the deep bottom margin after the role's icon, a pin-coloured tab. */
function polaroid(ui, op) {
  const stat = ROLE_STAT[op.role];
  return `<span class="pola">
      <span class="pola__photo">${portrait(op, { size: 104 })}</span>
      <span class="pola__cap">${stat ? `<span class="pola__role">${statGlyph(stat)}</span>` : ''}<span class="pola__name">${ui.esc(op.handle)}</span></span>
    </span>`;
}

/** One slot on the board: a runner's column, or an empty slot to fill (want: it pulses). */
function column(ui, slot, op, { name, does, line = '', note = '', i = 0, prefer = null, want = false }) {
  const { esc } = ui;
  if (!op) {
    return `<button class="pcol pcol--empty ${want ? 'is-want' : ''}" data-action="pick-slot" data-id="${slot}" aria-label="${esc(name)}: empty. ${esc(does)} Tap to assign.">
      <b>+ ${esc(name)}</b><small>${esc(does)}</small></button>`;
  }
  // The column is one button to change who's there; the × beside it takes them off (2026-11-06).
  return `<div class="pcolwrap" style="--tilt:${TILTS[i % TILTS.length]};--pin:${PINS[i % PINS.length]}">
    <button class="pcol ${op.freelance ? 'pcol--freelance' : ''}" data-action="pick-slot" data-id="${slot}" aria-label="${esc(name)}: ${esc(op.handle)}, ${esc(op.freelance ? `freelance ${op.role}` : op.role)}. Tap to change.">
      ${polaroid(ui, op)}
      ${inventory(ui, op, prefer)}
      ${line ? `<span class="pcol__line">${line}</span>` : ''}
      ${note ? `<span class="pcol__tag">${esc(note)}</span>` : ''}
    </button>
    <button class="pcol__off" data-action="unassign" data-id="${slot}" aria-label="Take ${esc(op.handle)} off ${esc(name.toLowerCase())}"><span aria-hidden="true">×</span></button>
  </div>`;
}

/**
 * Fit each bare gear drawing's viewBox to the item it draws, so a small gun fills its cell
 * (the mock-up's getBBox, done after each render). Drawings hidden on a phone are measured off-screen.
 */
export function fitGearArt(root) {
  const svgs = [...root.querySelectorAll('.inv__it svg:not([data-fit])')];
  if (!svgs.length) return;
  let sandbox = null;
  for (const svg of svgs) {
    let b = svg.getBBox();
    if (!b.width) {
      if (!sandbox) {
        sandbox = document.body.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'svg'));
        sandbox.setAttribute('style', 'position:absolute;left:-9999px;top:0;visibility:hidden');
      }
      const copy = sandbox.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'g'));
      copy.innerHTML = svg.innerHTML;
      b = copy.getBBox();
      copy.remove();
    }
    if (!b.width) continue;
    const pad = Math.max(b.width, b.height) * 0.06;
    svg.setAttribute('viewBox', [b.x - pad, b.y - pad, b.width + 2 * pad, b.height + 2 * pad].join(' '));
    svg.removeAttribute('width');
    svg.removeAttribute('height');
    svg.dataset.fit = '1';
  }
  sandbox?.remove();
}

// The approach's colour washing in from the top of the mat, its name faint in the corner.
const TINTS = { stealth: '80, 140, 255', loud: '255, 80, 95', con: '245, 185, 66', tech: '61, 232, 216' };

/**
 * The board: who's inside, who's on overwatch with which kit, and Joss's picks, on a gear mat.
 * flash: a change to the plan just moved the risk (app.js renderPlan's readBefore), so the mat flashes.
 */
export function renderBoard(ui, { plan, tpl, people, crewSize, approachName = '', flash = false }) {
  const { esc } = ui;
  const byId = (id) => people.find((o) => o.id === id);
  const n = insideSlots(plan, tpl);
  const inside = Array.from({ length: n }, (_, i) => {
    const op = byId(plan.crew[i]);
    const extra = i >= crewSize;
    const b = op ? bestLine(op, plan.approach) : null;
    return column(ui, `in:${i}`, op, {
      name: extra ? 'Extra' : 'Inside', does: extra ? 'Optional: more backup, more at risk.' : i < 1 ? 'Required.' : 'Recommended.',
      line: b ? statValue(b.stat, b.value) : '', i, want: !extra,
    });
  }).join('');
  const ow = byId(plan.overwatch);
  const kit = ow ? planKit(plan, ow) : null;
  // Overwatch needs someone carrying a rifle or a drone (slice 5: gear).
  const armed = people.some((o) => kitsFor(o).length);
  const overCard = column(ui, 'over', ow, {
    name: 'Overwatch', does: armed ? 'Optional: saves people in trouble. Needs a rifle or a drone.' : 'Nobody carries a rifle or a drone. Buy one in the armoury (Crew).',
    line: ow && kit ? kitLine(ow, kit) : '', note: kit ? (overwatchKit(ow, kit).spec ? `${kit} · ${SPEC_NAME[overwatchKit(ow, kit).spec]}` : kit) : '', i: 5, prefer: kit,
  });
  const wh = byId(plan.wheels);
  const wheelsCard = column(ui, 'wheels', wh, { name: 'Wheels', does: 'Optional: takes every driving roll from the van.', line: wh ? statValue('driving', effectiveStat(wh, 'driving').value) : '', note: wh ? 'in the van' : '', i: 2 });
  const sb = byId(plan.standby);
  const standbyCard = column(ui, 'standby', sb, { name: 'Standby', does: 'Optional: called in when it goes wrong.', line: sb ? `${statValue('combat', effectiveStat(sb, 'combat').value)} ${statValue('medical', effectiveStat(sb, 'medical').value)}` : '', note: sb ? 'on call' : '', i: 3 });
  const count = plan.crew.length;
  return `
      <div class="board ${flash ? 'is-flash' : ''}" style="--appr:${TINTS[plan.approach] ?? TINTS.stealth}"><div class="board__mat" data-approach="${esc(approachName)}">
        <div class="board__head">
          <p>${count ? `${count} inside · ${crewSize} recommended` : `${crewSize} recommended inside`}</p>
          <button class="btn btn--ghost board__joss" data-action="joss">Joss's picks</button>
        </div>
        <div class="board__group">
          <p class="board__label">Inside team <span>moves as one group</span></p>
          <div class="pcols">${inside}</div>
        </div>
        <div class="board__group">
          <p class="board__label">Outside <span>optional</span></p>
          ${ow && kitsFor(ow).length > 1 ? `<div class="kitpick" role="group" aria-label="Overwatch kit">
            ${kitsFor(ow).map((k) => `<button class="kitpick__btn ${kit === k ? 'is-on' : ''}" data-action="kit" data-id="${k}" aria-pressed="${kit === k}">${esc(overwatchKit(ow, k).name)}: ${k === 'rifle' ? 'sees outdoors' : 'sees everywhere'}</button>`).join('')}
          </div>` : ''}
          ${kit ? `<p class="small muted board__kitdesc">${esc(ow.handle)} has the ${esc(overwatchKit(ow, kit).name.toLowerCase())}. ${esc(overwatchKit(ow, kit).desc.replace(/^Lets them take overwatch with the \w+ stat\. /, ''))}${overwatchKit(ow, kit).spec ? ` ${esc(SPECIALISATIONS[overwatchKit(ow, kit).spec].name)}: ${esc(SPECIALISATIONS[overwatchKit(ow, kit).spec].desc.replace(/^On overwatch with an? \w+: /, ''))}` : ''}</p>` : ''}
          ${(() => {
            // Filled slots are cards; empty ones are one-line chips marked optional (2026-11-05), so
            // they don't read as unfinished. Overwatch without a rifle or drone links to the armoury.
            const slots = [
              { slot: 'over', op: ow, card: overCard, name: 'Overwatch', hint: 'saves people in trouble', off: !armed },
              { slot: 'wheels', op: wh, card: wheelsCard, name: 'Wheels', hint: 'takes the driving rolls' },
              { slot: 'standby', op: sb, card: standbyCard, name: 'Standby', hint: 'called in when it goes wrong' },
            ];
            const filled = slots.filter((x) => x.op);
            const chip = (x) => (x.off
              ? `<div class="slotchip is-off"><b>Overwatch</b><small>needs a rifle or a drone</small><button class="slotchip__link" data-action="open-armoury">Armoury →</button></div>`
              : `<button class="slotchip" data-action="pick-slot" data-id="${x.slot}" aria-label="${esc(x.name)}: empty, optional. ${esc(x.hint)}. Tap to assign."><b>+ ${esc(x.name)}</b><small>${esc(x.hint)}</small></button>`);
            return `${filled.length ? `<div class="pcols">${filled.map((x) => x.card).join('')}</div>` : ''}
          <div class="slotchips">${slots.filter((x) => !x.op).map(chip).join('')}</div>`;
          })()}
        </div>
      </div></div>`;
}

/**
 * The picker sheet for one slot (rebuilt 2026-11-06 after the owner's playtest, mock-up
 * drafts/prototypes/picker.html): the job's target up top and what the colours mean, then fixed
 * groups (your crew, freelancers, already on the squad, not free today, folded), a "Joss picks"
 * tag, and a sort. Inside slots show the job's key stats, the one that counts most big on a phone
 * and as columns to compare on a computer; outside slots keep their one line.
 * people: [{ op, status (availability), freelance: { share, left } | null }].
 * fit: { want, stats(op) → [{ key, name, glyph, value, fit: good|shaky|weak, mark }] } for this job.
 */
export function renderPicker(ui, { plan, tpl, threat, slot, people, freelancersFull, fit = null, sortBy = 'fit', jossId = null }) {
  const { esc, face, statusChip } = ui;
  const outside = !!OUTSIDE[slot];
  const current = outside ? plan[OUTSIDE[slot]] ?? null : plan.crew[Number(slot.split(':')[1])] ?? null;
  // What counts for this slot, best first.
  const FIT = {
    over: { name: 'overwatch', note: 'Only someone carrying a rifle (combat counts) or a drone (tech counts). Gear goes on from their page on the Crew screen.',
      score: (op) => (planKit(plan, op) ? effectiveStat(op, overwatchKit(op, planKit(plan, op)).stat).value : -50),
      line: (op) => (planKit(plan, op) ? kitLine(op, planKit(plan, op)) : 'no rifle or drone'), needs: (op) => !!planKit(plan, op) },
    wheels: { name: 'Wheels', note: 'In the van: they take every driving roll, alone.', score: (op) => effectiveStat(op, 'driving').value, line: (op) => statValue('driving', effectiveStat(op, 'driving').value) },
    standby: { name: 'standby', note: 'At the van until called: they can save someone in trouble or get the wounded out.', score: (op) => effectiveStat(op, 'combat').value + effectiveStat(op, 'medical').value / 2, line: (op) => `${statValue('combat', effectiveStat(op, 'combat').value)} · ${statValue('medical', effectiveStat(op, 'medical').value)}` },
  }[slot] ?? { name: 'the inside team', note: null, score: (op) => bestLine(op, plan.approach).value, line: null };
  const stats = !outside && fit ? fit.stats : null;
  const sortKey = stats && sortBy !== 'fit' && tpl.keyStats.includes(sortBy) ? sortBy : 'fit';
  // Best fit, inside: the best of the job's key stats (what the colours and the target read), the
  // approach's line only to break a tie; by a stat: that stat.
  const score = (op) => (sortKey !== 'fit' ? stats(op).find((x) => x.key === sortKey).value
    : stats ? Math.max(...stats(op).map((x) => x.value)) + FIT.score(op) / 100 : FIT.score(op));
  const where = (id) => (plan.crew.includes(id) ? 'inside' : Object.keys(OUTSIDE).find((k) => plan[OUTSIDE[k]] === id)?.replace('over', 'overwatch') ?? null);
  const rows = people
    .filter(({ freelance }) => !(outside && freelance))
    .map((p) => ({ ...p, score: score(p.op) }))
    .sort((a, b) => b.score - a.score);
  // The groups, always in this order: freelancers apart from your own (owner, 2026-11-06), anyone
  // already on the squad below, greyed and tagged with where they are (2026-10-27), and whoever
  // isn't free today folded away at the bottom.
  const placed = rows.filter(({ op }) => where(op.id));
  const rest = rows.filter(({ op }) => !where(op.id));
  const crew = rest.filter((p) => !p.freelance && p.status.ok);
  const hired = rest.filter((p) => p.freelance);
  const off = rest.filter((p) => !p.freelance && !p.status.ok);
  // What this job does for each candidate (core/worth.js), with the others already inside.
  const insideOps = people.filter((p) => plan.crew.includes(p.op.id)).map((p) => p.op);
  const gain = (op) => jobGain(op, threat, insideOps.filter((o) => o.id !== op.id));
  const parts = ({ op, status, freelance }) => {
    const w = where(op.id);
    const here = current === op.id;
    const blocked = !status.ok || (freelance && freelancersFull && !plan.crew.includes(op.id)) || (FIT.needs && !FIT.needs(op));
    const g = status.ok ? gain(op) : null;
    const side = here ? '<span class="cand__where cand__where--here">In this slot</span>' : w ? `<span class="cand__where">${esc(w)}</span>`
      : freelance ? `<span class="cand__hire">Freelance</span><strong>${Math.round(freelance.share * 100)}%</strong> of pay` : statusChip(status);
    const joss = jossId === op.id && !w ? ' <span class="cand__joss">Joss picks</span>' : '';
    const cls = `${freelance ? 'cand--freelance' : ''} ${here ? 'is-on' : w ? 'is-placed' : ''}`;
    return { op, freelance, here, blocked, g, side, joss, cls };
  };
  const statTxt = (x) => `<span class="fit fit--${x.fit}">${esc(x.name)} ${x.value}${x.mark}</span>`;
  // A phone's card: the stat that counts most big, the others small.
  const card = (p) => {
    const c = parts(p);
    const all = stats ? stats(c.op) : null;
    const top = all ? (sortKey === 'fit' ? [...all].sort((a, b) => b.value - a.value)[0] : all.find((x) => x.key === sortKey)) : null;
    return `
          <li><button class="cand ${c.cls}" data-action="assign" data-id="${esc(c.op.id)}" ${c.blocked ? 'disabled' : ''} aria-pressed="${c.here}">
            ${face(c.op, 'sm')}
            <span class="cand__txt"><span><strong>${esc(c.op.handle)}</strong> <span class="muted">${esc(c.freelance ? `freelance ${c.op.role}` : c.op.role)}</span>${c.joss}</span>
              ${top ? `<span class="cand__top fit--${top.fit}">${esc(top.name)} <b>${top.value}${top.mark}</b></span>
              <span class="cand__rest small">${all.filter((x) => x !== top).map(statTxt).join(' · ')}</span>` : `<span class="small">${FIT.line(c.op)}</span>`}
              ${c.g ? `<span class="cand__gain cand__gain--${c.g.tone}">${esc(c.g.text)}</span>` : ''}</span>
            <span class="cand__side">${c.side}</span>
          </button></li>`;
  };
  // A computer's row: the key stats as columns to read down.
  const tr = (p) => {
    const c = parts(p);
    return `<li><button class="ptrow cand ${c.cls}" data-action="assign" data-id="${esc(c.op.id)}" ${c.blocked ? 'disabled' : ''} aria-pressed="${c.here}">
      <span class="ptrow__who">${face(c.op, 'sm')}<span><strong>${esc(c.op.handle)}</strong>${c.joss}<br><span class="muted small">${esc(c.freelance ? `freelance ${c.op.role}` : c.op.role)}</span></span></span>
      ${stats(c.op).map((x) => `<span class="ptrow__num"><span class="ptpill ptpill--${x.fit}">${x.value}${x.mark}</span></span>`).join('')}
      <span class="ptrow__gain small">${c.g ? `<span class="cand__gain cand__gain--${c.g.tone}">${esc(c.g.text)}</span>` : '<span class="muted">—</span>'}</span>
      <span class="cand__side">${c.side}</span></button></li>`;
  };
  const groups = [
    { key: 'crew', name: 'Your crew', note: `${crew.length} free`, list: crew },
    { key: 'free', name: 'Freelancers', note: freelancersFull ? 'the freelance places are full' : 'they take a cut of the pay', list: hired },
    { key: 'placed', name: 'Already on the squad', note: `tap to move them here${current ? ' (they swap places)' : ''}`, list: placed },
  ].filter((g) => g.list.length);
  const sortNames = stats ? [['fit', 'Best fit'], ...tpl.keyStats.map((k) => [k, stats(rows[0]?.op ?? people[0].op).find((x) => x.key === k).name])] : [];
  const cards = `
      ${stats ? `<div class="psort" role="group" aria-label="Sort by"><span class="psort__l">Sort</span>${sortNames.map(([k, n]) => `<button class="psort__btn ${sortKey === k ? 'is-on' : ''}" data-action="pick-sort" data-id="${k}" aria-pressed="${sortKey === k}">${esc(n)}</button>`).join('')}</div>` : ''}
      ${groups.map((g) => `<h3 class="sheet__group sheet__group--${g.key}">${esc(g.name)} <span>${esc(g.note)}</span></h3><ul class="list">${g.list.map(card).join('')}</ul>`).join('') || '<p class="muted small">Nobody is free for this.</p>'}
      ${off.length ? `<details class="pfold"><summary>Not free today (${off.length})</summary><ul class="list">${off.map(card).join('')}</ul></details>` : ''}`;
  const table = stats ? `
      <div class="ptable" style="--n:${tpl.keyStats.length}">
        <div class="ptable__head"><span>Runner</span>${tpl.keyStats.map((k) => { const n = stats(people[0].op).find((x) => x.key === k).name; return `<button class="ptable__sort ${sortKey === k ? 'is-on' : ''}" data-action="pick-sort" data-id="${sortKey === k ? 'fit' : k}" aria-pressed="${sortKey === k}">${esc(n)}${sortKey === k ? ' ▾' : ''}</button>`; }).join('')}<span>This job</span><span></span></div>
        ${groups.map((g) => `<h3 class="sheet__group sheet__group--${g.key}">${esc(g.name)} <span>${esc(g.note)}</span></h3><ul class="list">${g.list.map(tr).join('')}</ul>`).join('')}
        ${off.length ? `<h3 class="sheet__group">Not free today</h3><ul class="list">${off.map(tr).join('')}</ul>` : ''}
      </div>
      <p class="muted small">Tap a column to sort by it, again for best fit. Tap a row to put them in.</p>` : '';
  const legend = '<span class="plegend"><span class="fit--good">● ready for it</span><span class="fit--shaky">● close</span><span class="fit--weak">● short</span></span>';
  return `
    <div class="scrim" data-action="close-picker"></div>
    <div class="sheet ${stats ? 'sheet--picker' : ''}" role="dialog" aria-modal="true" aria-label="Who's on ${esc(FIT.name)}?">
      <div class="sheet__head">
        <div><h2 class="sheet__title">Who's on ${esc(FIT.name)}?</h2>
        ${stats ? `<p class="pwant">${esc(tpl.name)} wants about <b>${fit.want}</b> in <b>${esc(tpl.keyStats.map((k) => stats(people[0].op).find((x) => x.key === k).name.toLowerCase()).join(', ').replace(/, ([^,]*)$/, ' or $1'))}</b>. ${legend}</p>` : `<p class="muted small">${esc(FIT.note)}</p>`}</div>
        <button class="btn btn--ghost sheet__x" data-action="close-picker" aria-label="Close">✕</button>
      </div>
      ${stats ? `<div class="picker__cards">${cards}</div><div class="picker__table">${table}</div>` : cards}
      ${current ? '<button class="btn btn--ghost btn--block" data-action="assign" data-id="">Leave this empty</button>' : ''}
    </div>`;
}

const RISKS = ['low', 'moderate', 'high', 'extreme'];

/** The coverage read (core/squad.js coverage): what the crew will likely meet, who handles it, the gaps. */
export function renderCoverage(ui, cov, { overwatch, approachName, standby = null, was = null }) {
  const { esc, riskBadge } = ui;
  if (!cov.rows.some((r) => r.handler)) return '<div class="riskcard"><p class="muted">Pick a crew to see what they\'d face.</p></div>';
  return `
      <div class="cover">
        ${(() => {
          // Grouped by when it happens (2026-11-04): the way in, inside, the target, the way out, then
          // "sometimes"; one line each: what, who handles it, the risk (and what lowers it).
          const groups = [];
          for (const r of cov.rows) { const g = groups.find((x) => x.where === r.where); if (g) g.rows.push(r); else groups.push({ where: r.where, rows: [r] }); }
          const row = (r) => {
            // What it was before the last change to the plan (2026-11-05), if it was there and moved
            // (a new approach brings different encounters: those aren't tagged). The tag goes with the
            // final risk: at the end of the "→" line when there is one, else under the badge.
            const before = was?.rows.get(was.key(r)) ?? null;
            const moved = before && before !== r.effective;
            const wasTag = moved ? `<span class="was was--${RISKS.indexOf(r.effective) < RISKS.indexOf(before) ? 'better' : 'worse'}">was ${esc(ui.riskWord(before))}</span>` : '';
            const hasLower = (r.withSave || r.fight) && r.effective !== r.risk;
            const lower = hasLower
              ? (() => {
                // Plain words (owner, 2026-11-05: "Can't it just be Improved by (name)"): who makes it
                // better if the roll fails; else what the fight does to it.
                const better = RISKS.indexOf(r.effective) < RISKS.indexOf(r.risk);
                // On a loud run every ⚠ is a fight anyway, so nobody steps in to save: the fight is what helps.
                const why = better && r.withSave && !r.fight?.forced ? `improved by ${esc(r.withSave.op.handle)}`
                  : better ? 'the crew can win the fight' : 'if it turns into a fight';
                return `<span class="cover__with">→ ${esc(ui.riskWord(r.effective))}, ${why}${wasTag ? ` ${wasTag}` : ''}</span>`;
              })() : '';
            // "A loud run means a fight" is said once, under the read (2026-11-05), not on every row.
            const fight = r.fight && r.handler && r.fight.down >= 0.1 ? 'a fight could put someone down' : '';
            return `
          <div class="cover__row ${r.gap ? 'is-gap' : ''} ${moved && was.fresh ? 'is-flash' : ''}">
            <p class="cover__name">${esc(r.name)}${r.danger ? ' <span class="cover__danger" role="img" aria-label="danger">⚠</span>' : ''}</p>
            <p class="cover__who">${r.handler ? `${esc(r.handler.op.handle)} (${esc(r.handler.stat)} ${r.handler.value})` : 'nobody can'}${fight ? ` · ${esc(fight)}` : ''}</p>
            <span class="cover__risk">${riskBadge(r.handler ? r.risk : 'extreme')}${hasLower ? '' : wasTag}</span>
            ${lower}
          </div>`;
          };
          return groups.map((g) => `<p class="cover__group">${esc(g.where)}</p>${g.rows.map(row).join('')}`).join('');
        })()}
        ${cov.rows.some((r) => r.danger) ? `<p class="cover__note cover__note--muted">⚠ Danger: ${cov.rows.some((r) => r.fight?.forced) ? 'on a loud run, each one is a fight' : 'if it goes wrong, someone could be hurt, or it turns into a fight'}.</p>` : ''}
        ${cov.spotted ? `<p class="cover__note">${cov.spotted} more than recommended inside on a ${esc(approachName.toLowerCase())} run: −${cov.spotted} on stealth and social rolls.</p>` : ''}
        ${overwatch ? '' : '<p class="cover__note cover__note--muted">No overwatch: only a teammate inside can save someone in trouble.</p>'}
        ${standby ? `<p class="cover__note cover__note--muted">${esc(standby.handle)} is on standby: they can come in at max alert (the alert stays up, but they back up rolls and get a try at saving anyone in trouble) or to get someone badly hurt out.</p>` : ''}
      </div>`;
}
