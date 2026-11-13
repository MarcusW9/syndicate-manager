// Today: the inbox list and reader, the back-from-a-job cards, Monday's brief, crews out, Joss's
// briefing and Coming up.
import { raidBy } from '../core/raids.js';
import { mondayBrief } from '../core/week.js';
import { NAMES } from '../config/names.js';
import { PARTNER } from '../data/partner.js';
import { jossIcon } from './art.js';
import { crewOutMap } from './minimap.js';
import { siteFor } from './siteplan.js';
import { calendar } from '../core/time.js';
import { templateById } from '../core/jobs.js';
import { alerts, upcoming } from '../core/upcoming.js';
import { money } from '../core/money.js';
import { crewsOut } from '../core/away.js';
import { sideTasksOut } from '../core/sidetasks.js';
import { renderWord } from './tongs.js';
import { backupBanner } from './app.js';
import { renderMessage, crewLinks } from './messages.js';
import { renderThreatLines, calls, raidCalls } from './raidcards.js';
import { esc, pickLine, face, cityName, fillLine, andList, hallLabel } from './shared.js';
import { state, backPlayed, V } from './view.js';

/**
 * Today: alerts (only when something needs you) and the inbox first, then the week (Coming up, the
 * brief). Phones show that, or one open message alone. Wide screens put the inbox on the left and a
 * sticky stack on the right: Coming up as a strip, the open message (or the brief) under it (styles.css).
 */
export function renderInbox() {
  const { shown, open, unreadOnly, unread } = inboxView();
  const filter = state.inbox.length ? `<div class="inboxfilter" role="group" aria-label="Show">
          <button class="qchip ${unreadOnly ? '' : 'is-on'}" data-action="inbox-filter" data-id="all" aria-pressed="${!unreadOnly}">All</button>
          <button class="qchip ${unreadOnly ? 'is-on' : ''}" data-action="inbox-filter" data-id="unread" aria-pressed="${unreadOnly}" ${unread || unreadOnly ? '' : 'disabled'}>Unread${unread ? ` (${unread})` : ''}</button>
        </div>` : '';
  const list = state.inbox.length ? `${filter}
        <ul class="list">
          ${shown.map((m) => `
            <li>
              <button class="row ${m.read ? 'is-read' : 'is-unread'} ${m === open ? 'is-open' : ''}" data-action="open-message" data-id="${esc(m.id)}">
                ${m.read ? '' : '<span class="dot" aria-label="Unread"></span>'}
                <span class="row__tag tag--${esc(m.type)}">${esc(m.type)}</span>
                <span class="row__main row__main--clip">${esc(m.subject)}${m.body ? `<span class="preview">${esc(m.body)}</span>` : ''}</span>
                <span class="row__meta"><strong class="row__wd">${esc(calendar(m.day).weekday)}</strong><span>Day ${m.day}</span></span>
              </button>
            </li>`).join('')}
        </ul>` : '<p class="muted">Nothing new. Press Continue.</p>';
  // Messages first (owner, 2026-11-11): only Joss, the alerts and today's lines sit above the list.
  // Wide screens (2026-11-12): the right side is one sticky stack, Coming up as a strip over the reader,
  // so a message opened from far down the list is already in view. The reader's default is the week's
  // brief (Monday's numbers and The Word). A phone shows the list, then the strip and the brief, or one
  // open message alone.
  const week = renderWeekBrief();
  const at = open ? shown.indexOf(open) : -1;
  const reader = open ? `
        <div class="reader__head">
          <span class="reader__where">${at >= 0 ? `Message ${at + 1} of ${shown.length}` : 'Message'}</span>
          <button class="reader__btn" data-action="msg-step" data-id="-1" aria-label="Newer message" ${at <= 0 ? 'disabled' : ''}>‹</button>
          <button class="reader__btn" data-action="msg-step" data-id="1" aria-label="Older message" ${at < 0 || at >= shown.length - 1 ? 'disabled' : ''}>›</button>
          <button class="reader__btn" data-action="msg-close" aria-label="Close message">✕</button>
        </div>
        <div class="reader__body">${renderMessage(open)}</div>`
    : `<div class="reader__body">${week || '<p class="muted inbox__empty">Tap a message to read it here.</p>'}</div>`;
  return `
    ${backupBanner()}
    <div class="inbox ${open ? 'has-open' : ''}">
      <div class="inbox__side">
        <section class="panel inbox__list">
          <h1>Today</h1>
          ${renderThreatLines()}
          ${renderBriefing()}
          ${renderNextUp()}
          ${renderBack()}
          ${renderOutLine()}
          ${list}
        </section>
      </div>
      <div class="inbox__stack">
        ${renderUpcoming('upcoming--strip', open)}
        <section class="panel inbox__detail ${open || calendar(state.day).isMonday ? '' : 'is-quiet'}">
          ${reader}
        </section>
      </div>
    </div>`;
}

/** The inbox as shown now: the list (All or Unread), the open message, and the counts. */
export function inboxView() {
  const open = state.inbox.find((m) => m.id === V.openMessageId);
  // All or only unread (playtest, 2026-11-07: find the old unread ones fast). The open message stays
  // in the list after it's been read, so it doesn't vanish from under the finger.
  const unread = state.inbox.filter((m) => !m.read).length;
  const unreadOnly = V.inboxUnread && unread + (open && open.read ? 1 : 0) > 0;
  const shown = unreadOnly ? state.inbox.filter((m) => !m.read || m === open) : state.inbox;
  return { shown, open, unreadOnly, unread };
}

/** Crews back today from jobs sent away (2026-11-04): their faces home again and a stamp, then the report. */
function renderBack() {
  const back = state.inbox.filter((m) => m.type === 'report' && m.day === state.day && m.back?.away);
  if (!back.length) return '';
  const STAMP = { completed: (p) => `✓ ${money(p)}`, aborted: () => '↩ Walked away', setback: (p) => `✗ ${money(p)}`, loss: () => '✕ Someone lost' };
  return `
    <ul class="backs" aria-label="Back today">
      ${back.map((m) => {
        const ops = m.back.crewIds.map((id) => state.crew.find((o) => o.id === id) ?? state.memorial.find((o) => o.id === id)).filter(Boolean);
        const result = m.timeline?.result ?? 'completed';
        const line = pickLine(PARTNER.back[result] ?? PARTNER.back.completed, `${m.id}-back`);
        const seen = backPlayed.has(m.id);
        backPlayed.add(m.id);
        return `
        <li class="back is-${esc(result)} ${seen ? 'is-seen' : ''}">
          <span class="back__faces">${ops.map((op, i) => `<span class="back__face" style="--i:${i}">${face(op, 'sm')}</span>`).join('')}</span>
          <div class="back__text">
            <p class="back__title"><strong>${esc(templateById(m.back.templateId)?.name ?? 'Job')}</strong> <span class="back__stamp">${esc((STAMP[result] ?? STAMP.completed)(m.back.pay))}</span></p>
            <p class="small muted">${esc(line)}</p>
          </div>
          <button class="btn btn--ghost" data-action="open-message" data-id="${esc(m.id)}">Report</button>
        </li>`;
      }).join('')}
    </ul>`;
}

/** The week's briefing (core/week.js), Monday's numbers: the reader's default view on a wide screen any day, on a phone Mondays only. */
function renderWeekBrief() {
  const b = mondayBrief(state);
  const short = b.cash < b.due;
  return `
    <div class="weekbrief" aria-label="This week">
      <p class="weekbrief__title">Week ${calendar(state.day).week}</p>
      <dl class="weekbrief__stats">
        <div><dt>Cash</dt><dd>${money(b.cash)}</dd></div>
        <div class="${short ? 'is-short' : ''}"><dt>Due Sunday</dt><dd>${money(b.due)}</dd></div>
        <div><dt>Free</dt><dd>${b.roster.free}/${b.roster.total}</dd></div>
        <div><dt>Jobs</dt><dd>${b.jobs}</dd></div>
      </dl>
      ${renderWord(state)}
      ${b.heist ? `<button class="heistnote small" data-action="goto" data-id="jobs:heists">${esc(b.heist)}</button>` : ''}
      <p class="small muted">${[b.roster.away && `${b.roster.away} out`, b.roster.hurt && `${b.roster.hurt} hurt`, b.expiring && `${b.expiring} ${b.expiring === 1 ? 'offer ends' : 'offers end'} this week`, short && `${money(b.due - b.cash)} short of Sunday`].filter(Boolean).join(' · ') || 'A clear week.'}</p>
    </div>`;
}

/** Today's one line about the crews out; they're followed on Ops, the command centre (2026-11-05; its own tab 2026-11-06). */
function renderOutLine() {
  const jobs = crewsOut(state).length + sideTasksOut(state).length;
  if (!jobs) return '';
  const n = calls() - raidCalls().length;
  return `<button class="outnow ${n ? 'is-call' : ''}" data-action="goto" data-id="city:map">
      <span class="outnow__light" aria-hidden="true"></span>
      <span>${jobs} ${jobs === 1 ? 'crew' : 'crews'} out${n ? ` · <strong>${n} ${n === 1 ? 'call' : 'calls'} waiting</strong>` : ''}</span>
      <span class="outnow__go">City ›</span>
    </button>`;
}

/** Crews out on jobs: where each is, what they did today, and a call waiting (core/away.js). */
export function renderCrewsOut(out = crewsOut(state)) {
  if (!out.length) return '';
  const STATUS = { call: 'Calling you', hurt: 'Someone hurt', low: 'Lying low', on: 'On track' };
  return `
    <ul class="crewsout" aria-label="Crews out">
      ${out.map((c) => {
        const ops = c.crewIds.map((id) => state.crew.find((o) => o.id === id)).filter(Boolean);
        const fill = Math.round((c.beatsDone / Math.max(1, c.beats)) * 100);
        return `
        <li class="crewsout__job is-${c.status}">
          <div class="crewsout__top">
            <span class="crewsout__light" aria-hidden="true"></span>
            <p class="crewsout__head"><strong>${esc(c.name)}</strong> <span class="muted small">${c.day ? `day ${c.day} of ${c.days}` : 'leaving'} · back ${esc(calendar(c.returnDay).weekday)}</span></p>
            <span class="crewsout__faces">${ops.map((op) => face(op, 'sm')).join('')}</span>
          </div>
          <div class="crewsout__track" role="img" aria-label="${esc(`${c.phase}: ${c.beatsDone} of ${c.beats} story beats, day ${c.day} of ${c.days}`)}" style="--fill:${fill}%; --days:${c.days}">
            <span class="crewsout__fill"></span>
          </div>
          <div class="crewsout__body">
            <div class="crewsout__map">${crewOutMap({ site: siteFor(c.district, c.jobId, c.templateId), zone: c.zone, crew: c.inside, overwatch: c.overwatch, wheels: c.wheels, calling: c.waiting, esc })}</div>
            <div class="crewsout__text">
              <p class="crewsout__phase small"><strong>${esc(c.phase)}</strong> · ${esc(STATUS[c.status])}</p>
              ${c.lines.map((l) => `<p class="small">${c.day ? `Day ${c.day}: ` : ''}${crewLinks(l)}</p>`).join('')}
            </div>
          </div>
          <div class="crewsout__foot">
            ${c.waiting ? `<button class="btn btn--primary" data-action="take-call" data-id="${esc(c.jobId)}">Take the call</button>` : ''}
            ${c.district ? whereButton(c.district) : ''}
          </div>
        </li>`;
      }).join('')}
    </ul>`;
}

/** A district under a crew: tap to light it on the map and show only what's happening there. */
export const whereButton = (d) => `<button class="linkbtn crewsout__where ${V.cityDistrict === d ? 'is-on' : ''}" data-action="city-show" data-id="${esc(d)}" aria-pressed="${V.cityDistrict === d}">${esc(cityName(d))}</button>`;

/**
 * Joss's morning briefing: one line for the day's mood, then the alert lines in their
 * voice. Alerts only appear when something needs the player, and each taps through to
 * where it's dealt with. Lines change day to day but stay put across re-renders.
 */
function renderBriefing() {
  // Several jobs ending today read as one line, not a stack of them.
  const raw = alerts(state);
  const lastJobs = raw.filter((a) => a.kind === 'job-last');
  const list = lastJobs.length > 1
    ? [...raw.filter((a) => a.kind !== 'job-last'), { kind: 'jobs-last', tone: 'warn', names: lastJobs.map((a) => a.name) }]
    : raw;
  const say = (kind, data, key = '') => fillLine(pickLine(PARTNER.alerts[kind], `${state.day}-${kind}-${key}`), data);
  const line = (a) => {
    switch (a.kind) {
      case 'decision': return [say('decision', { subject: a.subject }, a.messageId), 'open-message', a.messageId];
      case 'broke': return [say('broke', { amount: money(Math.abs(a.cash)) }), 'nav', 'jobs'];
      case 'bills-short': return [say('bills-short', { total: money(a.total), short: money(a.short) }), 'nav', 'jobs'];
      case 'job-last': return [say('job-last', { job: a.name }, a.jobId), 'open-job', a.jobId];
      case 'jobs-last': return [say('jobs-last', { count: a.names.length, jobs: andList(a.names) }), 'nav', 'jobs'];
      case 'lead-last': return [say('lead-last', { name: a.name, role: a.role }, a.name), 'nav', 'crew'];
      case 'crew-out': return [say('crew-out', { names: andList(a.why ?? a.names) }), 'nav', 'crew'];
      default: return null;
    }
  };
  const has = (k) => list.some((a) => a.kind === k);
  const c = calendar(state.day);
  const mood = state.day === 1 ? 'first' : has('decision') ? 'decision' : has('broke') ? 'broke'
    : has('bills-short') ? 'short' : has('crew-out') ? 'hurt' : c.isSunday ? 'sunday' : c.isMonday ? 'monday' : 'quiet';
  const opener = pickLine(PARTNER.moods[mood], `${state.day}-${mood}`);
  const face = { broke: 'worried', short: 'worried', hurt: 'worried', sunday: 'smug', first: 'happy', quiet: 'happy' }[mood] ?? 'neutral';
  // Open at the start of each day; a tap folds it to one line for the rest of the day. The alerts
  // under it never fold: they are what needs the player.
  const folded = V.jossFoldedDay === state.day;
  return `
    <button class="joss ${folded ? 'is-folded' : ''}" data-action="joss-fold" aria-expanded="${!folded}">
      <span class="joss__badge">${jossIcon({ mood: face, size: 32 })}</span>
      <span class="joss__body">
        <span class="joss__name">${esc(NAMES.partner)}</span>
        <span class="joss__line">${esc(opener)}</span>
      </span>
      <span class="joss__fold" aria-hidden="true">${folded ? '▸' : '▾'}</span>
    </button>
    ${list.length ? `<ul class="alerts">${list.map((a) => {
      const [text, action, id] = line(a) ?? [];
      return text ? `<li><button class="alert alert--${a.tone}" data-action="${action}" data-id="${esc(id)}">${esc(text)} <span aria-hidden="true">›</span></button></li>` : '';
    }).join('')}</ul>` : ''}`;
}

/** A day ahead as Coming up says it: "Tomorrow", "Wed", "Next Mon". */
function upcomingWhen(day) {
  const n = day - state.day;
  const wd = calendar(day).weekday;
  return n === 1 ? 'Tomorrow' : n === 7 ? `Next ${wd}` : wd;
}

/** One thing coming up (core/upcoming.js), in words. */
function upcomingText(i) {
  switch (i.kind) {
    case 'season': return `Season ${i.season} begins: everyone a year older`;
    case 'board': return 'New freelancers and street talk';
    case 'scout': return 'Scout report: new leads';
    case 'raid': return `Raid on ${hallLabel(i.district)}: ${raidBy(i)} at the door`;
    case 'bills': return `Bills: ${money(i.total)} (wages ${money(i.wages)}, rent ${money(i.rent)})${state.cash < i.total ? `, ${money(i.total - state.cash)} short` : ''}`;
    case 'job-last': return `Last day for ${i.names.join(', ')}`;
    case 'lead-last': return `Last day to sign ${i.name} (${i.role})`;
    case 'back': return `${i.name} back from the job`;
    case 'report': return i.names.length ? `${i.names.join(' and ')} back with the ${i.name} report` : `Report from ${i.name}`;
    case 'healed': return `${i.name} over their ${i.injury} injury`;
    case 'rested': return `${i.name} rested enough to work`;
    case 'reask': return `${i.name} asks about their raise again`;
    default: return '';
  }
}

/**
 * Today's "next up" line, on a phone only (the rail is in view on wider screens): the soonest
 * date that matters (a raid, the bills, a last day, a new season), and a tap scrolls to Coming up.
 */
function renderNextUp() {
  const RANK = ['raid', 'bills', 'job-last', 'lead-last', 'season'];
  const key = upcoming(state).filter((i) => RANK.includes(i.kind));
  if (!key.length) return '';
  const day = Math.min(...key.map((i) => i.day));
  const first = key.filter((i) => i.day === day).sort((a, b) => RANK.indexOf(a.kind) - RANK.indexOf(b.kind))[0];
  const item = first.kind === 'job-last' ? { ...first, names: key.filter((i) => i.day === day && i.kind === 'job-last').map((i) => i.name) } : first;
  const short = item.kind === 'bills' && state.cash < item.total;
  // The bills line in short; the full split is one tap away in Coming up.
  const text = item.kind === 'bills' ? `Bills ${money(item.total)}${short ? `, ${money(item.total - state.cash)} short` : ''}` : upcomingText(item);
  return `<button class="nextup ${short ? 'is-short' : ''}" data-action="next-up"><span class="nextup__when">${esc(upcomingWhen(day))}</span><span class="nextup__text">${esc(text)}</span><span class="nextup__go" aria-hidden="true">›</span></button>`;
}

/** The week ahead, one cell per day with a line per thing the game will do. */
function renderUpcoming(where, open = null) {
  const items = upcoming(state);
  const when = upcomingWhen;
  const text = upcomingText;
  // Jobs ending the same day share one line.
  for (const d of new Set(items.filter((i) => i.kind === 'job-last').map((i) => i.day))) {
    const same = items.filter((i) => i.kind === 'job-last' && i.day === d);
    same[0].names = same.map((i) => i.name);
    for (const i of same.slice(1)) items.splice(items.indexOf(i), 1);
  }
  // Several people on the same day (back, healed, rested) share one line: "5 back from the job",
  // with the names a tap away (owner's feedback, 2026-10-27: imagine ten coming back).
  const GROUPS = { back: 'back from the job', healed: 'over their injuries', rested: 'rested enough to work' };
  for (const kind of Object.keys(GROUPS)) {
    for (const d of new Set(items.filter((i) => i.kind === kind).map((i) => i.day))) {
      const same = items.filter((i) => i.kind === kind && i.day === d);
      if (same.length < 3) continue;
      items.splice(items.indexOf(same[0]), 1, { day: d, kind: 'group', text: `${same.length} ${GROUPS[kind]}`, names: same.map((i) => i.name) });
      for (const i of same.slice(1)) items.splice(items.indexOf(i), 1);
    }
  }
  const line = (i) => (i.kind === 'group'
    ? `<li><details class="upcoming__group"><summary>${esc(i.text)}</summary><span class="small muted">${esc(i.names.join(', '))}</span></details></li>`
    : `<li class="${i.kind === 'bills' && state.cash < i.total ? 'is-short' : ''}">${esc(text(i))}</li>`);
  const days = [...new Set(items.map((i) => i.day))];
  // The open message's own date lights up its cell (2026-11-12): a raid warning lights that raid's day.
  const p = open?.payload;
  const linked = (i) => (open?.kind === 'raid-warning' && i.kind === 'raid' && i.district === p?.district) || (open?.type === 'scout' && i.kind === 'scout');
  // The strip is one line to a day: the first thing in full, the rest a tap away ("+1 more").
  const cell = (d) => {
    const here = items.filter((i) => i.day === d);
    const [first, ...rest] = here;
    return `
          <li class="upcoming__day ${here.some(linked) ? 'is-linked' : ''} ${here.some((i) => i.kind === 'raid') ? 'is-raid' : ''}">
            <span class="upcoming__when">${esc(when(d))}</span>
            <ul class="upcoming__items">${line(first)}</ul>
            ${rest.length ? `<details class="upcoming__more"><summary>+${rest.length} more</summary><ul class="upcoming__items">${rest.map(line).join('')}</ul></details>` : ''}
          </li>`;
  };
  return `
    <section class="panel upcoming ${where}">
      <h2 class="upcoming__title">Coming up</h2>
      <ul class="upcoming__days">${days.map(cell).join('')}
      </ul>
    </section>`;
}
