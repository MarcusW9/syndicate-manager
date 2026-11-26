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
import { templateById, jobView } from '../core/jobs.js';
import { alerts, upcoming, outReason } from '../core/upcoming.js';
import { availability, isAway } from '../core/crew.js';
import { money } from '../core/money.js';
import { crewsOut } from '../core/away.js';
import { sideTasksOut } from '../core/sidetasks.js';
import { expeditionsOut } from '../core/expeditions.js';
import { postsOut } from '../core/contracts.js';
import { renderWord } from './tongs.js';
import { backupBanner } from './app.js';
import { renderMessage, crewLinks } from './messages.js';
import { renderThreatLines, calls, raidCalls } from './raidcards.js';
import { esc, pickLine, face, cityName, fillLine, andList, hallLabel, gearUi } from './shared.js';
import { newGearLine } from './gear.js';
import { needsYou, isDecision } from './nav.js';
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
          <button class="qchip ${unreadOnly ? 'is-on' : ''}" data-action="inbox-filter" data-id="unread" aria-pressed="${unreadOnly}" ${unread || unreadOnly ? '' : 'disabled'}>To do${unread ? ` (${unread})` : ''}</button>
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
          ${newGearLine(gearUi, state)}
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
  // "To do" is what the Today badge counts: unread, or read but still waiting on an answer (offers, calls).
  const unread = state.inbox.filter((m) => needsYou(state, m)).length;
  const unreadOnly = V.inboxUnread && unread + (open && open.read ? 1 : 0) > 0;
  const shown = unreadOnly ? state.inbox.filter((m) => needsYou(state, m) || m === open) : state.inbox;
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

/**
 * Today's line about the crews out; they're followed on City (2026-11-05; its own tab 2026-11-06). Runners on a
 * security post get a line of their own, to Jobs › Side where posts are kept (2026-11-22).
 */
function renderOutLine() {
  const jobs = crewsOut(state).length + sideTasksOut(state).length + expeditionsOut(state).length;
  const posts = postsOut(state);
  const onPosts = new Set(posts.flatMap((p) => p.crewIds)).size;
  if (!jobs && !posts.length) return '';
  const n = calls() - raidCalls().length;
  const postCall = state.inbox.some((m) => m.kind === 'contract' && !m.resolved);
  return `${jobs ? `<button class="outnow ${n ? 'is-call' : ''}" data-action="goto" data-id="city:map">
      <span class="outnow__light" aria-hidden="true"></span>
      <span>${jobs} ${jobs === 1 ? 'crew' : 'crews'} out${n ? ` · <strong>${n} ${n === 1 ? 'call' : 'calls'} waiting</strong>` : ''}</span>
      <span class="outnow__go">City ›</span>
    </button>` : ''}
    ${posts.length ? `<button class="outnow outnow--posts ${postCall ? 'is-call' : ''}" data-action="goto" data-id="jobs:side">
      <span class="outnow__light" aria-hidden="true"></span>
      <span>${onPosts} on ${posts.length === 1 ? 'a post' : `${posts.length} posts`}${postCall ? ' · <strong>a post is calling</strong>' : ''}</span>
      <span class="outnow__go">Side ›</span>
    </button>` : ''}`;
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
              ${logDetails(c.log)}
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

/**
 * A crew's log so far (the adventure log, core/advlog.js), folded under its card: tap to read every
 * day (iOS rules: no hover). Nothing until there are two days to read.
 */
export function logDetails(log = []) {
  if (log.length < 2) return '';
  return `<details class="advlog">
      <summary class="small">The log · ${log.length} days</summary>
      <ol class="advlog__days">${log.map((l) => `<li class="small"><span class="advlog__day">Day ${l.day}</span> ${crewLinks(l.text)}</li>`).join('')}</ol>
    </details>`;
}

/** A district under a crew: tap to light it on the map and show only what's happening there. */
export const whereButton = (d) => `<button class="linkbtn crewsout__where ${V.cityDistrict === d ? 'is-on' : ''}" data-action="city-show" data-id="${esc(d)}" aria-pressed="${V.cityDistrict === d}">${esc(cityName(d))}</button>`;

/**
 * Joss's morning briefing: one line for the day's mood, then the alert lines in their
 * voice. Alerts only appear when something needs the player, and each taps through to
 * where it's dealt with. Lines change day to day but stay put across re-renders.
 */
/** Joss's read of the day: the alerts (core/upcoming.js) in Joss's words, the mood, the opener and the face. Shared by the inbox and the desk. */
function jossDay() {
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
  return { list, line, opener, face };
}

function renderBriefing() {
  const { list, line, opener, face } = jossDay();
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

// --- The desk (Today's new layout, 2026-11-24; the classic inbox above stays behind Save › Look) ------
// From first principles a message is a decision or news. Decisions (ui/nav.js isDecision) are cards with
// their answer on them; news is a log by day that never counts as unread. Joss opens the day in a bubble.

const NUMBER_WORDS = ['Nothing', 'One thing', 'Two things', 'Three things', 'Four things', 'Five things', 'Six things', 'Seven things', 'Eight things', 'Nine things'];
const wantYou = (n) => (n ? `${NUMBER_WORDS[n] ?? `${n} things`} ${n === 1 ? 'wants' : 'want'} you.` : 'Nothing needs you.');

/** The answer a decision card offers: what tapping it does, in words. Every one opens the message, which holds the full choice. */
function answerLabel(m) {
  if (m.type === 'report') return 'Read the report';
  switch (m.kind) {
    case 'callin': return 'Take the call';
    case 'contract': return 'Answer the post';
    case 'expedition': return 'Answer them';
    case 'renewal': return 'Talk terms';
    case 'hall-offer': case 'opening': return 'Look at the offer';
    case 'raid-warning': return 'See the raid';
    default: return m.blocking ? 'Decide' : 'Open';
  }
}

/** A waveform for a live signal: static bars from a hash of the id, so it never moves or changes between renders. */
function waveBars(seed, n = 56) {
  let h = 0;
  for (const ch of String(seed)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return Array.from({ length: n }, (_, i) => `<i style="height:${4 + Math.round(Math.abs(Math.sin(i * 0.7 + h % 7) * Math.cos(i * 0.23 + (h % 5))) * 14)}px"></i>`).join('');
}

/** A segmented gauge (the skin's gauges: 4px on, 1px off). */
const gauge = (n, on, tone = '') => `<span class="gauge ${tone ? `gauge--${tone}` : ''}" aria-hidden="true">${Array.from({ length: n }, (_, i) => `<i class="${i < on ? 'is-on' : ''}"></i>`).join('')}</span>`;

/** A call-in's progress from the crew out (core/away.js crewsOut): "Day 2 of 4", a segment a day. */
function callProgress(m) {
  const out = crewsOut(state).find((c) => c.jobId === m.payload?.jobId);
  if (!out) return '';
  const day = Math.max(1, Math.min(out.days, out.day + 1));
  return `<p class="dsig__prog">Day ${day} of ${out.days} ${gauge(out.days, day, 'danger')}</p>`;
}

/**
 * A decision as a card. The calm HUD (owner, 2026-11-24, mockup 5 in docs/mockups/2026-11-24-today-command.html): decoration
 * only where attention is needed. An urgent one (a call-in, a blocking choice, a raid warning) is a signal: a red light,
 * corner brackets, a waveform and, for a call, how far through the job the crew is, with Take the call on the card. The rest
 * are plain rows: what it is, a line of it, and the answer on the right.
 */
function deskCard(m) {
  const back = m.type === 'report' && m.back?.away;
  const urgent = m.blocking || m.kind === 'raid-warning';
  if (urgent) {
    const call = m.kind === 'callin' && !m.resolved && m.payload?.jobId;
    const job = call ? crewsOut(state).find((c) => c.jobId === m.payload.jobId)?.name : null;
    return `
    <li class="dsig">
      <p class="dsig__kick"><span class="led led--danger" aria-hidden="true"></span>${esc(call ? 'Call-in' : m.kind === 'raid-warning' ? 'Raid' : 'Decision')}${job ? ` · ${esc(job)}` : ''}</p>
      <p class="dsig__title">${esc(m.subject)}</p>
      <div class="dsig__wave" aria-hidden="true">${waveBars(m.id)}</div>
      ${call ? callProgress(m) : m.body ? `<p class="dcard__line">${esc(m.body)}</p>` : ''}
      <div class="dcard__answers">
        ${call ? `<button class="btn btn--primary" data-action="take-call" data-id="${esc(m.payload.jobId)}">Take the call</button>
        <button class="btn btn--ghost" data-action="open-message" data-id="${esc(m.id)}">Read it</button>`
    : `<button class="btn btn--primary" data-action="open-message" data-id="${esc(m.id)}">${esc(answerLabel(m))}</button>`}
      </div>
    </li>`;
  }
  const ops = back ? m.back.crewIds.map((id) => state.crew.find((o) => o.id === id) ?? state.memorial.find((o) => o.id === id)).filter(Boolean) : [];
  const result = m.timeline?.result ?? 'completed';
  const STAMP = { completed: (p) => `✓ ${money(p)}`, aborted: () => '↩ Walked away', setback: (p) => `✗ ${money(p)}`, loss: () => '✕ Someone lost' };
  const title = back ? `${templateById(m.back.templateId)?.name ?? 'Job'} is back` : m.subject;
  const line = back ? pickLine(PARTNER.back[result] ?? PARTNER.back.completed, `${m.id}-back`) : m.body;
  return `
    <li class="dcard ${back ? `is-back is-${esc(result)}` : ''}">
      ${ops.length ? `<span class="back__faces">${ops.map((op, i) => `<span class="back__face" style="--i:${i}">${face(op, 'sm')}</span>`).join('')}</span>` : ''}
      <div class="dcard__text">
        <p class="dcard__title"><strong>${esc(title)}</strong>${back ? ` <span class="back__stamp">${esc((STAMP[result] ?? STAMP.completed)(m.back.pay))}</span>` : ''}</p>
        ${line ? `<p class="dcard__line">${esc(line)}</p>` : ''}
      </div>
      <button class="btn dcard__go" data-action="open-message" data-id="${esc(m.id)}">${esc(answerLabel(m))}</button>
    </li>`;
}

/** Jobs worth a card today: new on the board today, or ending today or tomorrow. The rest wait on the Board. */
function deskJobs() {
  const shown = state.jobs.filter((j) => j.offeredDay === state.day || j.expiresDay <= state.day + 1)
    .sort((a, b) => a.expiresDay - b.expiresDay);
  return { shown, rest: state.jobs.length - shown.length };
}

/** Who could go out today (free and fit to work). */
const freeToday = () => state.crew.filter((op) => availability(state, op).ok);

/** A job the free crew can't staff at the size it asks for (2026-11-26): Today still lists it, but quietly, and
 *  says why, so the obvious tap never sends one rookie alone into two-person work. Planning it by hand still works. */
const shortFor = (j, free = freeToday().length) => free < (jobView(state, j).tpl.crewSize ?? 1);

function deskJobCard(j) {
  const v = jobView(state, j);
  const ends = j.expiresDay === state.day ? 'Last day' : j.expiresDay === state.day + 1 ? 'Ends tomorrow' : 'New';
  const free = freeToday().length;
  const short = shortFor(j, free);
  return `
    <li class="dcard dcard--job ${j.expiresDay === state.day ? 'is-last' : ''} ${short ? 'is-short' : ''}">
      <div class="dcard__text">
        <p class="dcard__title"><strong>${esc(v.tpl.name)}</strong> <span class="dcard__pay">${money(v.pay)}</span></p>
        <p class="dcard__line">${esc(ends)} · ${esc(v.client?.name ?? 'Walk-in job')}${v.days > 1 ? ` · ${v.days} days` : ''}</p>
        ${short ? `<p class="dcard__line dcard__short">Wants ${v.tpl.crewSize}; ${free ? `only ${free} free` : 'nobody free'} today.</p>` : ''}
      </div>
      <button class="btn ${short ? 'btn--ghost' : ''} dcard__go" data-action="open-job" data-id="${esc(j.id)}">Plan it</button>
    </li>`;
}

/** Joss, when someone is free but no job on the board wants that few: rest them, or side work (2026-11-26). */
function shortHandedLine(jobs) {
  const free = freeToday();
  if (!free.length || !state.jobs.length || state.jobs.some((j) => !shortFor(j, free.length))) return '';
  const who = free.length === 1 ? `Only ${free[0].handle} is free` : `Only ${free.length} of us are free`;
  return `<p class="desk__short">${esc(NAMES.partner)}: ${esc(who)}, and every job on the board wants more hands. Rest, or take side work till the others are back. <button class="btn btn--ghost" data-action="goto" data-id="jobs:side">Side work</button></p>`;
}

/** One runner's state for the roster: null when free to work. */
function rosterState(op) {
  const a = availability(state, op);
  const c = op.condition ?? {};
  if (isAway(state, op)) return { tone: 'out', word: 'Out' };
  if (c.injury === 'serious' || c.injury === 'critical') return { tone: 'warn', word: `Hurt ${c.injuryDays}d` };
  if (!a.ok) return { tone: 'warn', word: a.reason === 'exhausted' ? 'Exhausted' : outReason(a.reason).replace(/ \(.*\)$/, '') };
  if (a.reason === 'fatigued') return { tone: 'warn', word: 'Tired' };
  if (a.reason === 'light injury') return { tone: 'warn', word: 'Hurt' };
  return null;
}

/**
 * The roster (calm HUD): the crews-out line (to City), then a face for each runner who isn't free (out, hurt with the days
 * left, tired), each with a status light, and one tile for all the free ones, so a big crew is still one row or two.
 */
function deskCrew() {
  const crew = state.crew.filter((op) => !op.freelance);
  const busy = crew.map((op) => ({ op, st: rosterState(op) })).filter((x) => x.st);
  const free = crew.length - busy.length;
  return `
    <section class="panel deskcrew" aria-label="Roster">
      <h2>Roster <span class="desk__read">${free} free / ${crew.length}</span></h2>
      ${renderOutLine()}
      <ul class="roster">
        ${busy.map(({ op, st }) => `<li><button class="roster__op" data-action="op-link" data-id="${esc(op.id)}" aria-label="${esc(op.handle)}: ${esc(st.word)}">${face(op, 'sm')}<span class="roster__name">${esc(op.handle)}</span><span class="roster__st"><span class="led led--${st.tone}" aria-hidden="true"></span>${esc(st.word)}</span></button></li>`).join('')}
        ${free ? `<li><button class="roster__op roster__free" data-action="nav" data-id="crew"><span class="roster__n">${busy.length ? '+' : ''}${free}</span><span class="roster__st">free</span></button></li>` : ''}
      </ul>
    </section>`;
}

/** The week as a track (calm HUD): today and the six days after, a diamond on a day with something on it (red a raid, yellow money or a
 *  last day), a word under it; tap a day for its list. Under the track, the next thing that matters in full (the bills with their split). */
const TRACK_WORD = { raid: 'raid', bills: 'bills', 'job-last': 'last day', 'lead-last': 'lead ends', board: 'freelancers', scout: 'scout', back: 'back', report: 'report', healed: 'healed', rested: 'rested', season: 'new season', reask: 'raise' };
const TRACK_RANK = ['raid', 'bills', 'job-last', 'lead-last', 'season', 'back', 'report', 'healed', 'rested', 'reask', 'board', 'scout'];
function deskWeek() {
  // Coming up's words (upcomingText) read a job's last day as a group of names; here each day keeps its own items.
  const items = upcoming(state).map((i) => (i.kind === 'job-last' && !i.names ? { ...i, names: [i.name] } : i));
  const days = Array.from({ length: 7 }, (_, i) => state.day + i);
  const top = (d) => items.filter((i) => i.day === d).sort((a, b) => TRACK_RANK.indexOf(a.kind) - TRACK_RANK.indexOf(b.kind));
  const tone = (k) => (k === 'raid' ? 'danger' : ['bills', 'job-last', 'lead-last'].includes(k) ? 'warn' : '');
  const pick = V.deskWeekDay && V.deskWeekDay > state.day && V.deskWeekDay < state.day + 7 ? V.deskWeekDay : null;
  const KEY = ['raid', 'bills', 'job-last', 'lead-last', 'season'];
  const key = items.filter((i) => KEY.includes(i.kind));
  const nd = key.length ? Math.min(...key.map((i) => i.day)) : null;
  const next = nd ? key.filter((i) => i.day === nd).sort((a, b) => KEY.indexOf(a.kind) - KEY.indexOf(b.kind))[0] : null;
  return `
    <section class="panel deskweek" aria-label="The week">
      <h2>The week</h2>
      <ol class="wtrack">
        ${days.map((d) => {
          const it = d === state.day ? [] : top(d);
          const first = it[0];
          return `<li><button class="wtrack__day ${d === state.day ? 'is-today' : ''} ${d === pick ? 'is-picked' : ''}" data-action="desk-week-day" data-id="${d}" ${d === state.day || !it.length ? 'disabled' : ''} aria-label="${esc(calendar(d).weekday)}${it.length ? `: ${esc(it.map(upcomingText).join('; '))}` : ''}">
            <span class="wtrack__wd">${esc(calendar(d).weekday)}</span>
            ${first ? `<span class="wtrack__m ${tone(first.kind) ? `is-${tone(first.kind)}` : ''}" aria-hidden="true"></span><span class="wtrack__w">${esc(TRACK_WORD[first.kind] ?? '')}${it.length > 1 ? ` +${it.length - 1}` : ''}</span>` : d === state.day ? '<span class="wtrack__w">today</span>' : ''}
          </button></li>`;
        }).join('')}
      </ol>
      ${pick ? `<ul class="wtrack__list">${top(pick).map((i) => `<li>${esc(upcomingText(i))}</li>`).join('')}</ul>`
    : next ? `<p class="wtrack__next ${next.kind === 'raid' ? 'is-danger' : ''}"><strong>${esc(upcomingWhen(next.day))}</strong> ${esc(upcomingText(next))}</p>` : ''}
    </section>`;
}

/** News: every message that isn't a decision, by day, newest first; three days unless the player asks for all. The Word heads it. */
function deskNews() {
  const news = state.inbox.filter((m) => !isDecision(state, m));
  const days = [...new Set(news.map((m) => m.day))].sort((a, b) => b - a);
  const keep = V.deskAllNews ? days : days.slice(0, 3);
  const older = news.filter((m) => !keep.includes(m.day)).length;
  const dayName = (d) => (d === state.day ? 'Today' : d === state.day - 1 ? 'Yesterday' : `${calendar(d).weekday} · Day ${d}`);
  return `
    <section class="panel desknews" aria-label="Intercepts">
      <h2>Intercepts</h2>
      <div class="desknews__word">${renderWord(state)}</div>
      ${keep.length ? keep.map((d) => `
        <p class="desknews__day">${esc(dayName(d))}</p>
        <ul class="desknews__list">${news.filter((m) => m.day === d).map((m) => `
          <li><button class="desknews__line ${m.read ? '' : 'is-new'} ${m.id === V.openMessageId ? 'is-open' : ''}" data-action="open-message" data-id="${esc(m.id)}">
            <span class="desknews__tag tag--${esc(m.type)}">${esc(m.type)}</span><span class="desknews__text">${esc(m.subject)}</span>
          </button></li>`).join('')}
        </ul>`).join('') : '<p class="muted small">Nothing yet.</p>'}
      ${older || V.deskAllNews ? `<button class="btn btn--ghost btn--block desknews__more" data-action="desk-news-all">${V.deskAllNews ? 'Only the last three days' : `Older news (${older})`}</button>` : ''}
    </section>`;
}

/** Today as the desk: Joss's line, what needs you (each with its answer), then the crew, Coming up and the news. */
/** What crews still out paid from our cash today (a crisis choice: a toll, a bribe), the day it happens; the report
 *  that explains it lands when they're back (first-run walkthrough, 2026-11-26). A tap opens the day's cash. */
function paidOutLine() {
  const out = (state.cashToday ?? []).filter((l) => l.onJob);
  if (!out.length) return '';
  const total = out.reduce((n, l) => n + l.amount, 0);
  return `
    <div class="paidout" role="status">
      <p class="paidout__text"><strong>${total < 0 ? 'Paid out on jobs today' : 'Came in from jobs today'}:</strong> ${out.map((l) => `${esc(l.what)} ${l.amount < 0 ? '−' : '+'}${money(Math.abs(l.amount))}`).join('; ')}.</p>
      <button class="btn btn--ghost" data-action="cash-today">Cash today</button>
    </div>`;
}

export function renderDesk() {
  const { open, shown } = inboxView();
  const { list, line, opener, face: mood } = jossDay();
  const decisions = state.inbox.filter((m) => isDecision(state, m));
  const { shown: jobs, rest } = deskJobs();
  // Joss's own alerts that are not a message: short of the bills, broke, a last day for a lead or a job. Decisions are cards
  // already, and who can't work is in the crew panel.
  const notes = list.filter((a) => a.kind !== 'decision' && a.kind !== 'crew-out' && a.kind !== 'job-last' && a.kind !== 'jobs-last');
  const count = decisions.length + notes.length;
  const gear = newGearLine(gearUi, state);
  const paidOut = paidOutLine();
  const folded = V.jossFoldedDay === state.day;
  const at = open ? shown.indexOf(open) : -1;
  const reader = open ? `
        <section class="panel inbox__detail">
          <div class="reader__head">
            <span class="reader__where">${esc(open.type ?? 'Message')}</span>
            <button class="reader__btn" data-action="msg-step" data-id="-1" aria-label="Newer message" ${at <= 0 ? 'disabled' : ''}>‹</button>
            <button class="reader__btn" data-action="msg-step" data-id="1" aria-label="Older message" ${at < 0 || at >= shown.length - 1 ? 'disabled' : ''}>›</button>
            <button class="reader__btn" data-action="msg-close" aria-label="Close message">✕</button>
          </div>
          <div class="reader__body">${renderMessage(open)}</div>
        </section>` : '';
  return `
    ${backupBanner()}
    <div class="inbox inbox--desk ${open ? 'has-open' : ''}">
      <div class="inbox__side">
        <section class="panel inbox__list desk">
          <h1 class="sr-only">Today</h1>
          <button class="jossbub ${folded ? 'is-folded' : ''}" data-action="joss-fold" aria-expanded="${!folded}">
            <span class="jossbub__face">${jossIcon({ mood, size: 32 })}</span>
            <span class="jossbub__text">
              <span class="jossbub__name"><span class="led led--cyan" aria-hidden="true"></span>${esc(NAMES.partner)} · online <span class="jossbub__fold" aria-hidden="true">${esc(calendar(state.day).weekday)} · ${folded ? '▸' : '▾'}</span></span>
              <span class="jossbub__line">${esc(opener)} ${esc(wantYou(count))}</span>
            </span>
          </button>
          ${renderThreatLines()}
          <h2 class="desk__h">Needs you${count ? ` · ${count}` : ''}</h2>
          ${notes.length ? `<ul class="alerts">${notes.map((a) => {
            const [text, action, id] = line(a) ?? [];
            return text ? `<li><button class="alert alert--${a.tone}" data-action="${action}" data-id="${esc(id)}">${esc(text)} <span aria-hidden="true">›</span></button></li>` : '';
          }).join('')}</ul>` : ''}
          ${gear}
          ${paidOut}
          ${decisions.length ? `<ul class="dcards">${decisions.map(deskCard).join('')}</ul>` : ''}
          ${!count && !gear && !paidOut ? '<p class="muted desk__clear">A clear desk.</p>' : ''}
          ${jobs.length || rest ? `<h2 class="desk__h">On the board${state.jobs.length ? ` · ${state.jobs.length}` : ''}</h2>` : ''}
          ${jobs.length ? `<ul class="dcards">${jobs.map(deskJobCard).join('')}</ul>` : ''}
          ${shortHandedLine(jobs)}
          ${rest ? `<button class="deskpile" data-action="goto" data-id="jobs:board">${jobs.length ? `${rest} more` : `${rest} ${rest === 1 ? 'job' : 'jobs'}`} on the board · Jobs ›</button>` : ''}
        </section>
      </div>
      <div class="inbox__stack">
        ${deskWeek()}
        ${open ? reader : `${deskCrew()}${deskNews()}`}
      </div>
    </div>`;
}
