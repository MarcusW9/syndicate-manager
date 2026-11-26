// Crews out as rows that open (2026-11-26, the owner's pick, look A revised in
// docs/mockups/2026-11-26-crews-out-condensed.html). One row per crew out, whatever the kind (a hands-off job, an
// expedition, side work): faces, the name, the kind and the day, and a thin track of the trip's days. The day they're
// back is known; days ahead stay blank. A crew's action (take a call) is a small link at the row's right, not a filled
// button, so several at once don't crowd the page; colour sits on the row's left edge. Tapping the row opens it in
// place (one at a time, V.outOpen): the faces at full size with names, the back day, the goal, today's line, a hands-off
// job's mini map, and the past days.
import { calendar } from '../core/time.js';
import { crewOutMap } from './minimap.js';
import { siteFor } from './siteplan.js';
import { crewLinks } from './messages.js';
import { logDetails, whereButton } from './today.js';
import { esc, face } from './shared.js';
import { state, V } from './view.js';

const KIND = { job: 'Job', trip: 'Trip', side: 'Side' };
const opsOf = (ids) => ids.map((id) => state.crew.find((o) => o.id === id)).filter(Boolean);
const backDay = (day) => calendar(day).weekday;

/** A hands-off job (core/away.js crewsOut). */
export function jobRow(c) {
  return {
    key: `job-${c.jobId}`, kind: 'job', name: c.name, crewIds: c.crewIds, day: c.day, days: c.days, returnDay: c.returnDay,
    district: c.district, waiting: c.waiting, log: c.log, lines: c.lines,
    status: `${c.phase} · ${{ call: 'calling you', hurt: 'someone hurt', low: 'lying low', on: 'on track' }[c.status]}`,
    action: c.waiting ? { label: 'Take call', action: 'take-call', id: c.jobId } : null,
    map: crewOutMap({ site: siteFor(c.district, c.jobId, c.templateId), zone: c.zone, crew: c.inside, overwatch: c.overwatch, wheels: c.wheels, calling: c.waiting, esc }),
  };
}

/** An expedition (core/expeditions.js expeditionsOut): leads found against the goal, a lead marked on its day. */
export function tripRow(x) {
  const log = x.log ?? [];
  return {
    key: `trip-${x.id}`, kind: 'trip', name: x.name, crewIds: x.crewIds, day: x.day, days: x.days, returnDay: x.returnDay,
    district: x.district, waiting: x.waiting, log, lines: log.length ? [log.at(-1).text] : [],
    leads: new Set(log.filter((l) => l.tone === 'good' && l.stat).map((l) => l.day)),
    calls: new Set(log.filter((l) => l.tone === 'bad').map((l) => l.day)),
    goal: { label: x.goal === 'cash' ? 'Money found' : 'Leads', n: Math.min(x.progress ?? 0, x.need), of: x.need },
    action: x.waiting ? { label: 'Take call', action: 'open-message', id: `exp-call-${x.id}` } : null,
    pull: x.id,
  };
}

/** Side work (core/sidetasks.js sideTasksOut). A watch on a tong or a scouting run has no fixed length: no track. */
export function sideRow(t, i) {
  const days = t.days ?? null;
  const log = t.log ?? [];
  return {
    key: `side-${i}-${t.returnDay}`, kind: 'side', name: t.name, crewIds: t.crewIds, returnDay: t.returnDay,
    days, day: days ? Math.max(0, days - (t.returnDay - state.day)) : null,
    district: t.district, waiting: false, log, lines: log.length ? [log.at(-1).text] : [],
  };
}

/** The trip's days as a thin track: gone, today, ahead; a lead's day carries a diamond, a call's day is red. */
function track(r, cls) {
  if (!r.days) return '';
  const cells = Array.from({ length: r.days }, (_, i) => {
    const d = i + 1;
    const call = r.calls?.has(d) || (r.waiting && d === r.day);
    const when = d < r.day ? 'is-done' : d === r.day ? 'is-today' : '';
    return `<i class="${when} ${call ? 'is-call' : ''} ${r.leads?.has(d) ? 'is-lead' : ''}"></i>`;
  }).join('');
  const label = `Day ${r.day} of ${r.days}${r.goal ? `, ${r.goal.label.toLowerCase()} ${r.goal.n} of ${r.goal.of}` : ''}, back ${backDay(r.returnDay)}`;
  return `<span class="${cls}" role="img" aria-label="${esc(label)}" style="--days:${r.days}">${cells}</span>`;
}

function row(r) {
  const ops = opsOf(r.crewIds);
  const open = V.outOpen === r.key;
  const when = r.days ? (r.day ? `day ${r.day} of ${r.days}` : 'leaving today') : `back ${backDay(r.returnDay)}`;
  const right = r.action
    ? `<button class="outrow__act is-call" data-action="${esc(r.action.action)}" data-id="${esc(r.action.id)}">${esc(r.action.label)}</button>`
    : `<span class="outrow__back">Back ${esc(backDay(r.returnDay).slice(0, 3))}</span>`;
  return `
      <li class="outrow is-${r.kind} ${r.waiting ? 'is-call' : ''} ${open ? 'is-open' : ''}">
        <details ${open ? 'open' : ''}>
          <summary class="outrow__row" data-action="out-open" data-id="${esc(r.key)}">
            <span class="outrow__faces">${ops.map((op) => face(op, 'sm')).join('')}</span>
            <span class="outrow__mid">
              <strong class="outrow__name">${esc(r.name)}</strong>
              <span class="outrow__sub">${KIND[r.kind]} · ${esc(when)}</span>
              ${track(r, 'outrow__track')}
            </span>
          </summary>
          <div class="outrow__more">
            <div class="outrow__people">${ops.map((op) => `<button class="outrow__op" data-action="op-link" data-id="${esc(op.id)}">${face(op)}<span>${esc(op.handle)}</span></button>`).join('')}
              ${r.map ? `<div class="outrow__map">${r.map}</div>` : ''}</div>
            <p class="outrow__facts"><span>${r.action ? `Back ${esc(backDay(r.returnDay))}` : ''}</span>${r.goal ? `<span>${esc(r.goal.label)} <b>${r.goal.n} of ${r.goal.of}</b></span>` : r.status ? `<span>${esc(r.status)}</span>` : ''}</p>
            ${r.lines.length ? r.lines.map((l) => `<p class="small">${crewLinks(l)}</p>`).join('') : '<p class="small muted">They set out today. The first line comes in tomorrow.</p>'}
            ${logDetails(r.log)}
            <div class="outrow__foot">
              ${r.district ? whereButton(r.district) : ''}
              ${r.pull && !r.waiting ? `<button class="linkbtn" data-action="exp-pull" data-id="${esc(r.pull)}">Pull them out</button>` : ''}
            </div>
          </div>
        </details>
        ${right}
      </li>`;
}

/** Every crew out, calls first, then by the day they're back. */
export function outRows(rows, label = 'Crews out') {
  if (!rows.length) return '';
  const sorted = [...rows].sort((a, b) => (b.waiting - a.waiting) || (a.returnDay - b.returnDay));
  return `<ul class="crewsout outrows" aria-label="${esc(label)}">${sorted.map(row).join('')}</ul>`;
}
