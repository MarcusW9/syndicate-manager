// An open message: reports (summary, timeline, full log) and the decisions that arrive as messages
// (renewal, a rival's offer, retirement, a specialisation, a raid warning or call, the heat notice).
import { contractsOf, helpers, HELP, CONTRACT } from '../core/contracts.js';
import { expeditionById } from '../core/expeditions.js';
import { heatChoices, heatIn, WATCHED_PENALTY } from '../core/heat.js';
import { hallIn, canOpenHall } from '../core/halls.js';
import { raidChoices, raidPrice, canBuyOff, isGangRaid } from '../core/raids.js';
import { HALL_SITES } from '../data/halls.js';
import { NAMES } from '../config/names.js';
import { money } from '../core/money.js';
import { CALL_IN } from '../core/mission.js';
import { ORDERS } from '../core/autorun.js';
import { ALERT_MAX } from '../core/incidents.js';
import { SPECIALISATIONS } from '../core/specialisations.js';
import { pieceById } from '../core/builds.js';
import { tierTag, perkList, apexHistory, spoilsCard } from './gear.js';
import { TIERS } from '../data/gear.js';
import { raidWhere } from './raidcards.js';
import { esc, face, districtName, riskBadge, statName } from './shared.js';
import { cardNames } from '../core/rivals.js';
import { state, backLabel, V } from './view.js';

/**
 * Text with names turned into links, escaped: the crew (full names first, then handles) to their page,
 * and the named runners of the other tongs and the street (core/rivals.js cardNames, full names only) to their
 * recruitment page (owner, 2026-11-18: a scout's report names who they looked at). The fallen and
 * freelancers stay plain text; a crew name wins over a card with the same name.
 */
export function crewLinks(text) {
  const cards = cardNames(state).map((c) => [c.name, { action: 'lead-name', id: c.id }]);
  const crew = state.crew.flatMap((op) => [[op.name, op.id], [op.handle, op.id]]).filter(([n]) => n).map(([n, id]) => [n, { action: 'op-link', id }]);
  const byName = new Map([...cards, ...crew]);
  if (!byName.size || !text) return esc(text ?? '');
  const pattern = [...byName.keys()].sort((a, b) => b.length - a.length).map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const re = new RegExp(`(?<![\\p{L}\\p{N}])(${pattern})(?![\\p{L}\\p{N}])`, 'gu');
  let out = '';
  let last = 0;
  for (const m of text.matchAll(re)) {
    const to = byName.get(m[1]);
    out += esc(text.slice(last, m.index)) + `<button class="namelink" data-action="${to.action}" data-id="${esc(to.id)}">${esc(m[1])}</button>`;
    last = m.index + m[1].length;
  }
  return out + esc(text.slice(last));
}

export function renderMessage(m) {
  // The welcome message points a new player at their first job.
  const jobLink = (m.type === 'job' || m.id === 'welcome') && m.kind !== 'contract' && state.jobs.length ? `<button class="btn" data-action="nav" data-id="jobs">Open the job board</button>`
    : m.type === 'scout' && (state.recruits ?? []).length ? `<button class="btn" data-action="leads-open">See the leads</button>` : '';
  return `
      <button class="btn btn--ghost inbox__back" data-action="back">← ${esc(backLabel())}</button>
      <h1>${crewLinks(m.subject)}</h1>
      <p class="muted">${esc(m.type.charAt(0).toUpperCase() + m.type.slice(1))} · Day ${m.day}</p>
      ${m.type === 'report' ? renderReportTimeline(m) : m.kind === 'crewnotes' && m.payload?.lines?.length ? renderCrewNotes(m) : m.kind === 'week' && m.payload?.lines ? renderWeekSummary(m) : `<p class="body">${crewLinks(m.body)}</p>`}
      ${m.kind === 'renewal' ? renderRenewal(m) : ''}
      ${m.kind === 'heat' ? renderHeatNotice(m) : ''}
      ${m.kind === 'spec' ? renderSpecOffer(m) : ''}
      ${m.kind === 'build' ? renderBuildOffer(m) : ''}
      ${m.kind === 'levelup' ? (m.payload?.learned ? `<p><strong>Learned ${esc(m.payload.learned)}.</strong></p>` : state.crew.some((o) => o.id === m.payload?.opId) ? `<button class="btn btn--primary" data-action="open-op" data-tab="skills" data-id="${esc(m.payload.opId)}">Pick a skill on their page</button>` : '') : ''}
      ${m.kind === 'retirement' ? renderRetirement(m) : ''}
      ${m.kind === 'contract' ? renderContractCall(m) : ''}
      ${m.kind === 'expedition' ? renderExpeditionCall(m) : ''}
      ${m.kind === 'poach' ? renderPoach(m) : ''}
      ${m.kind === 'hall-offer' && !hallIn(state, m.payload.district) ? (canOpenHall(state, m.payload.district).ok ? `<button class="btn btn--primary" data-action="open-hall" data-id="${esc(m.payload.district)}">Open the hall · ${money(HALL_SITES[m.payload.district].deposit)}</button>` : `<p class="muted small">${esc(canOpenHall(state, m.payload.district).reason)}.</p>`) : ''}
      ${m.kind === 'callin' && !m.resolved ? `<button class="btn btn--primary" data-action="take-call" data-id="${esc(m.payload.jobId)}">Take the call</button>` : ''}
      ${m.kind === 'raid' ? renderRaidCall(m) : ''}
      ${m.kind === 'raid-warning' ? renderRaidWarning(m) : ''}
      ${jobLink}`;
}

/**
 * A day's crew news in one message (core/earned.js crewNote). Each line: who and what as a heading (the name is the
 * link), what happened, then what it does on a quieter line of its own. One line alone has no heading: the message's
 * title already says it. A line's body is "What happened. (Handle: what it does.)".
 */
function renderCrewNotes(m) {
  const lines = m.payload.lines;
  const one = (l) => {
    const [, note, effect] = /^(.*?) \([^:()]+: (.*)\)$/s.exec(l.body) ?? [null, l.body, ''];
    return `<section>${lines.length > 1 ? `<h3 class="crewnotes__head">${crewLinks(l.subject)}</h3>` : ''}<p class="body">${esc(note)}</p>${effect ? `<p class="crewnotes__fx">${esc(effect)}</p>` : ''}</section>`;
  };
  return `<div class="crewnotes ${lines.length > 1 ? '' : 'crewnotes--one'}">${lines.map(one).join('')}</div>`;
}

/** The Sunday summary (core/week.js): the week's lines, then what was paid. */
function renderWeekSummary(m) {
  const p = m.payload;
  return `
      <ul class="weeksum">${p.lines.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>
      ${p.broker ? `<p class="body"><strong>Work boards:</strong> ${esc(p.broker.lines.join(' '))}</p>` : ''}
      <p class="body">Wages ${money(p.wages)}, rent ${money(p.rent)}. Paid ${money(p.paid)}. Cash now ${money(p.cash)}.</p>
      ${m.body.includes('Heat cooled') ? `<p class="body muted">${esc(m.body.slice(m.body.indexOf('Heat cooled')).split(' Work boards:')[0])}</p>` : ''}`;
}

/**
 * A job report as a timeline, top to bottom: each crisis in the order it happened, then
 * what the job came to. Reports from before save v15 have only a paragraph: split it into
 * sentences, with the outcome starting at "Paid".
 */
function renderReportTimeline(m) {
  let { result, steps, outcome } = m.timeline ?? {};
  if (!m.timeline) {
    const lines = (m.body ?? '').split(/(?<=[.!?]["'”]?)\s+(?=["“A-Z¥])/);
    const at = lines.findLastIndex((l) => l.startsWith('Paid '));
    steps = at < 0 ? lines : lines.slice(0, at);
    outcome = at < 0 ? [] : lines.slice(at).map((text) => ({ tone: 'plain', text }));
  }
  const end = m.timeline?.expedition ? { completed: ['✓', 'Got it'], aborted: ['◐', 'Part of it'], setback: ['✗', 'Came back without it'] }[result] ?? ['■', 'Back home'] : { completed: ['✓', 'Job done'], aborted: ['↩', 'Aborted'], loss: ['✕', 'Someone didn\'t come home'], setback: ['✗', 'Went badly'] }[result] ?? ['■', 'How it ended'];
  // Played once: each step lands in turn down the rail, then the result, then Joss and the summary.
  const play = m.id === V.playReportId;
  if (play) V.playReportId = null;
  const STEP = 0.8; // seconds per step
  return `
    <div class="report ${play ? 'report--play' : ''}" ${play ? `data-action="skip-report" style="--step:${STEP}s; --end:${(steps.length + 1) * STEP + 0.6}s"` : ''}>
      ${reportCrew(m)}
      ${reportSpoils(m)}
      ${renderReportSummary(m.timeline)}
      ${renderDaysOut(m.timeline?.days, steps, m.id)}
      <ol class="timeline">
        ${steps.map((text, i) => `<li class="timeline__item" style="--i:${i}"><span class="timeline__node" aria-hidden="true">${i + 1}</span><p class="timeline__text">${crewLinks(text)}</p></li>`).join('')}
        ${outcome.length ? `<li class="timeline__item timeline__item--end timeline__item--${esc(result ?? 'plain')}" style="--i:${steps.length}">
          <span class="timeline__node" aria-hidden="true">${end[0]}</span>
          <div class="timeline__text"><p class="timeline__label">${esc(end[1])}</p>
            <ul class="timeline__results">${outcome.map((o, i) => `<li class="tone--${esc(o.tone)}${o.apex ? ' loot--apex' : ''}" style="--r:${i}">${esc(o.text)}${o.tier ? ` ${tierTag({ tier: o.tier })}` : ''}${o.apex ? apexHistory(o.apex) : ''}${o.perks?.length ? perkList(o.perks, o.tier) : ''}</li>`).join('')}</ul></div>
        </li>` : ''}
      </ol>
      ${m.timeline?.side ? rollDetail(m.timeline.side) : ''}
      ${renderFullLog(m.timeline)}
    </div>`;
}

/**
 * A hands-off job's or side task's days out, a line a day (the adventure log, core/advlog.js), above
 * the timeline. A side task's last day is its result, already the timeline's step: not said twice.
 */
function renderDaysOut(days, steps = [], id = '') {
  const list = (days ?? []).filter((d) => !steps.includes(d.text));
  if (!list.length) return '';
  // Short by default (owner, 2026-11-26: six days read as a wall of text): one line a day, without the aside or
  // Joss's word, and a run of quiet days folded to one line. Every day in full is one tap away (V.daysFull).
  const full = V.daysFull === id;
  const hidden = list.some((d) => d.more || d.quiet);
  const rows = [];
  for (const d of list) {
    const prev = rows.at(-1);
    if (!full && d.quiet && prev?.quiet) { prev.to = d.day; continue; }
    rows.push(!full && d.quiet ? { quiet: true, from: d.day, to: d.day } : d);
  }
  const row = (r) => r.quiet && r.from != null
    ? `<li class="small advlog__quiet"><span class="advlog__day">${r.from === r.to ? `Day ${r.from}` : `Days ${r.from}–${r.to}`}</span> Quiet.</li>`
    : `<li class="small"><span class="advlog__day">Day ${r.day}</span> ${crewLinks(r.text)}${full && r.more ? ` <span class="advlog__more">${crewLinks(r.more)}</span>` : ''}</li>`;
  return `<div class="advlog advlog--report">
      <h3 class="advlog__head">The days out</h3>
      <ol class="advlog__days">${rows.map(row).join('')}</ol>
      ${hidden ? `<button class="linkbtn advlog__toggle" data-action="days-full" data-id="${esc(id)}" aria-expanded="${full}">${full ? 'Fewer words' : 'Every day, in full'}</button>` : ''}
    </div>`;
}

/**
 * Who went, at the top of a report (playtest, 2026-11-07): each face with their own run, the rolls
 * they made work and missed, and the worst they were hurt. Tap a face for their page.
 */
function reportCrew(m) {
  const ids = m.back?.crewIds ?? [];
  if (!ids.length) return '';
  const events = m.timeline?.events ?? [];
  const SEV = ['light', 'serious', 'critical'];
  const cards = ids.map((id) => {
    const op = state.crew.find((o) => o.id === id) ?? state.memorial?.find((o) => o.id === id);
    if (!op) return '';
    const mine = events.filter((e) => e.actor?.id === id && e.die != null && typeof e.success === 'boolean');
    const won = mine.filter((e) => e.success).length;
    const lost = mine.length - won;
    const hurt = events.filter((e) => e.injury?.id === id).map((e) => e.injury.severity).sort((a, b) => SEV.indexOf(b) - SEV.indexOf(a))[0];
    const gone = !state.crew.some((o) => o.id === id);
    const line = gone ? 'Lost' : mine.length ? `${won} ✓${lost ? ` · ${lost} ✗` : ''}` : m.timeline?.expedition ? 'On the trip' : m.back?.post ? 'On the post' : 'Backed them up';
    // Who grew while away (2026-11-26, core/grew.js): a chip per stat that rose a whole point, and a graduation.
    const grew = gone ? [] : (m.back?.growth ?? []).filter((g) => g.opId === id);
    const pro = !gone && (m.back?.graduated ?? []).includes(id);
    // B + P3 of the growth mockups (owner, 2026-11-26): brackets close on the face and a sync bar ticks to 100%, then
    // each stat reads old (struck) ▲ new. Plays once with the report (.report--play), still after that.
    const chips = grew.length || pro ? `<span class="rcrew__sync" aria-hidden="true"><i></i><span>Sync</span><b></b></span><span class="rcrew__grew">${grew.map((g) => `<span class="rcrew__rise"><span>${esc(statName(g.stat))}</span> <s>${g.from}</s><em>▲</em><b>${g.to}</b></span>`).join('')}${pro ? '<span class="rcrew__pro">Now a pro</span>' : ''}</span>` : '';
    const say = grew.length || pro ? `. Came back sharper: ${[...grew.map((g) => `${statName(g.stat)} ${g.from} to ${g.to}`), pro ? 'now a pro' : ''].filter(Boolean).join(', ')}` : '';
    return `<button class="rcrew__op ${gone ? 'is-lost' : hurt ? 'is-hurt' : ''} ${chips ? 'is-grew' : ''}" data-action="op-link" data-id="${esc(id)}" ${gone ? 'disabled' : ''} aria-label="${esc(`${op.handle}, ${line}${say}`)}">
        ${chips ? `<span class="rcrew__aim" aria-hidden="true">${face(op, 'sm')}<i class="tl"></i><i class="tr"></i><i class="bl"></i><i class="br"></i></span>` : face(op, 'sm')}<strong>${esc(op.handle)}</strong><span>${esc(line)}</span>${hurt && !gone ? `<span class="rcrew__hurt">${esc(hurt)} wound</span>` : ''}${chips}</button>`;
  }).join('');
  return `<div class="rcrew" aria-label="Who went">${cards}</div>`;
}

/** Joss's opener and what the run came down to (core/report.js). Headings with nothing behind them are left out. */
/** The spoils card at the top of a job's report (2026-11-24): its loot line's item when it is Verified or better. */
const SPOILS_FROM = (TIERS.verified?.step ?? 1);
function reportSpoils(m) {
  const line = (m.timeline?.outcome ?? []).find((o) => o.uid && (TIERS[o.tier]?.step ?? 0) >= SPOILS_FROM);
  return line ? spoilsCard({ esc }, state, line) : '';
}

/** The report's alert, said in plain words (first-run walkthrough, 2026-11-26): what it is and what it did. */
function alertLine(n) {
  if (!n) return `0 of ${ALERT_MAX}: nobody noticed them.`;
  return `${n} of ${ALERT_MAX}: each slip that got noticed made the rest of the rolls harder${n >= ALERT_MAX ? '; at the top the crew had to choose: go loud or pull out' : ''}.`;
}

function renderReportSummary(t) {
  const sum = t?.summary;
  if (!sum) return '';
  const orders = t.orders && ORDERS[t.orders] ? `<p class="muted small">Hands-off · ${esc(ORDERS[t.orders].name)} orders</p>`
    : t.callIn && t.callIn !== 'every' && ORDERS[t.liveOrders] ? `<p class="muted small">Called in ${esc(CALL_IN[t.callIn].name.toLowerCase())} · ${esc(ORDERS[t.liveOrders].name)} orders decided the rest</p>` : '';
  const rows = [
    sum.cause && ['How the fight ended', sum.cause],
    sum.turning && ['Turning point', sum.turning.text],
    sum.standout && ['Standout', sum.standout.text],
    sum.hurt?.length && ['What hurt us', sum.hurt.join(' ')],
    sum.saves?.length && ['Saves', sum.saves.map((v) => `${v.by} got ${v.who} out of trouble${v.via === 'overwatch' ? ` (${v.kit ?? 'overwatch'})` : ''}.`).join(' ')],
    sum.alert != null && ['Alert', alertLine(sum.alert)],
  ].filter(Boolean);
  return `
      <div class="reporthead">
      ${orders}
      ${sum.intro ? `<p class="reportjoss"><span class="reportjoss__name">${esc(NAMES.partner)}</span> ${esc(sum.intro)}</p>` : ''}
      ${rows.length ? `<dl class="reportsum">${rows.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>` : ''}
      </div>`;
}

const STAT_LABEL = (s) => (s ? s[0].toUpperCase() + s.slice(1) : '');

/** The roll behind a line, shown on tap: die + stat = total, what it needed, and where the bonuses came from. */
function rollDetail(e) {
  if (e.die == null) return '';
  const total = e.die + e.value;
  return `
        <details class="flog__roll">
          <summary>${esc(STAT_LABEL(e.stat))} ${e.success ? '✓' : '✗'}</summary>
          <p class="small">Die ${e.die} + ${esc(e.stat)} ${e.value} = ${total} · needed ${e.need}${e.notes?.length ? `<br><span class="muted">${esc(e.stat)} ${e.value}: ${esc(e.notes.join(', '))}</span>` : ''}</p>
        </details>`;
}

/** Everything that happened, in order, folded away under the summary (save v16 reports only). */
function renderFullLog(t) {
  const events = t?.events;
  if (!events?.length) return '';
  const lastBeat = events.map((e) => e.kind).lastIndexOf('beat');
  // Squad runs (slice 2) mark each zone; older logs get the three headings they always had.
  const zoned = events.some((e) => e.kind === 'zone');
  let onJob = false;
  const items = events.map((e, i) => {
    if (e.kind === 'stop') { onJob = true; return `<h3 class="flog__phase">${esc(e.text.split('. ')[0])}${e.place ? ` · ${esc(e.place)}` : e.held ? ' · the night' : ''}</h3><p class="flog__beat">${esc(e.text.split('. ').slice(1).join('. '))}</p>`; } // a multi-map job's stop (core/multimap.js)
    let head = '';
    if (zoned) head = e.kind === 'beat' && e.first ? '<h3 class="flog__phase">Getting there</h3>' : '';
    else if (e.kind === 'beat' && e.first) head = '<h3 class="flog__phase">Approach</h3>';
    else if (e.kind === 'beat' && e.last && i === lastBeat) head = '<h3 class="flog__phase">Getting out</h3>';
    else if (!onJob && e.kind !== 'beat') { onJob = true; head = '<h3 class="flog__phase">On the job</h3>'; }
    if (e.kind !== 'beat') onJob = true;
    const body = {
      zone: () => `<h3 class="flog__phase">${esc(e.text)}</h3>`,
      beat: () => `<p class="flog__beat">${esc(e.text)}</p>`,
      twist: () => `<p class="flog__twist">Twist: ${esc(e.text)}</p>`,
      aftermath: () => `<p class="flog__line ${e.death ? 'tone--bad' : 'tone--good'}">${esc(e.text)}</p>`,
      // A fight (slice 6): what started it, each round's moments with their dice, how it ended.
      battle: () => `
        <div class="flog__step">
          ${e.phase === 'round' ? `<p class="flog__crisis">${esc(e.text)}</p>` : ''}
          ${(e.lines ?? []).map((l) => `<p class="flog__line ${l.kind === 'guard' ? (l.damage ? 'tone--bad' : 'tone--good') : l.success === false ? 'tone--bad' : 'tone--good'}">${esc(l.text)}</p>${rollDetail(l)}`).join('')}
          ${e.phase === 'start' || e.phase === 'end' ? `<p class="flog__line ${e.phase === 'start' || e.hurt?.length ? 'tone--warn' : 'tone--good'}">${esc(e.report ?? e.text)}</p>` : ''}
          ${e.phase === 'retreat' ? `<p class="flog__line tone--warn">${esc(e.text)}</p>` : ''}
        </div>`,
      // The getaway (core/piloting.js): one line and its roll. It has no crisis or choice, so the catch-all below can't draw it.
      getaway: () => `
        <div class="flog__step">
          <p class="flog__line ${e.success === false ? 'tone--bad' : 'tone--good'}">${esc(e.text)}</p>
          ${rollDetail(e)}
        </div>`,
      critical: () => `
        <div class="flog__step">
          <p class="flog__crisis">${esc(e.patient)} is critical.</p>
          ${e.why ? `<p class="flog__why">${esc(e.why)}</p>` : ''}
          <p class="flog__line ${e.action === 'push' || e.success === false ? 'tone--bad' : 'tone--good'}">${esc(e.report)}</p>
          ${rollDetail(e)}
        </div>`,
    }[e.kind] ?? (() => `
        <div class="flog__step">
          ${e.text ? `<p class="flog__crisis">${esc(e.text)}</p>` : ''}
          ${e.choice != null ? `<p class="flog__choice">${e.actor && !e.choice.startsWith(e.actor.handle) ? `<strong>${esc(e.actor.handle)}</strong> · ` : ''}${esc(e.choice)}</p>` : ''}
          ${e.why ? `<p class="flog__why">${esc(e.why)}</p>` : ''}
          ${e.report ? `<p class="flog__line ${e.kind === 'exit' ? 'tone--warn' : e.success === false ? 'tone--bad' : 'tone--good'}">${esc(e.report)}</p>` : ''}
          ${rollDetail(e)}
        </div>`);
    return head + body();
  }).join('');
  return `
      <details class="flog">
        <summary>Full log</summary>
        <div class="flog__body">${items}</div>
      </details>`;
}

/** Renewal notice: the numbers, then Accept / Haggle / Refuse (or the outcome once decided). */
function renderRenewal(m) {
  const p = m.payload;
  const pct = Math.round(p.discount * 100);
  return `
      <div class="riskcard">
        <dl class="stats stats--deal">
          <div><dt>Current wage</dt><dd>${money(p.current)}</dd></div>
          <div><dt>Asking</dt><dd>${money(p.ask)}</dd></div>
          <div><dt>Market value</dt><dd>${money(p.market)}</dd></div>
        </dl>
        ${p.reason === 'fame' ? '<p class="muted small">They became Renowned: the street knows the name. Loyal runners ask less often; greedy ones more.</p>'
          : `<p class="muted small">Loyalty ${Math.round(p.loyalty * 100)}/100 (${p.jobs} job${p.jobs === 1 ? '' : 's'} with the crew), ${pct}% off the raise${pct >= 25 ? ' (the most loyalty buys)' : ''}.</p>`}
        ${p.haggleResult ? `<p class="muted">${esc(p.haggleResult)}</p>` : ''}
        ${p.outcome ? `<p><strong>${esc(p.outcome)}</strong></p>` : ''}
      </div>
      ${m.resolved ? '' : `<div class="stack">
        ${m.options.map((o) => `<button class="btn ${o.id === 'accept' ? 'btn--primary' : o.id === 'refuse' ? 'btn--ghost' : ''}" data-action="decide" data-id="${esc(m.id)}" data-option="${esc(o.id)}" ${o.disabled ? 'disabled' : ''}>${esc(o.id === 'accept' ? `Accept ${money(p.ask)} a week` : o.label)}</button>`).join('')}
        <p class="muted small">Refusing: they stay, but their head isn't in it for four weeks (−1 on their rolls), then they ask again.</p>
      </div>`}`;
}

/** Joss's specialisation offer (core/specialisations.js): what each one does, then take it or not yet. */
/** A rival tong has made an offer for one of ours (core/mobility.js): match it or take the buyout. */
function renderPoach(m) {
  if (m.resolved) return m.payload.outcome ? `<p><strong>${esc(m.payload.outcome)}</strong></p>` : '';
  return `
      <div class="stack">
        ${m.options.map((o) => `<button class="btn ${o.id === 'match' ? 'btn--primary' : 'btn--ghost'}" data-action="decide" data-id="${esc(m.id)}" data-option="${esc(o.id)}">${esc(o.label)}</button>`).join('')}
      </div>
      <p class="muted small">Unanswered by day ${m.payload.expiresDay}, they go and the buyout is paid to us.</p>`;
}

/** A long-serving runner asks to retire (core/retirement.js): stay one more season, or let them go. */
/**
 * A security post that is hit (core/contracts.js, 2026-11-21): who is there against how many, anyone free to send
 * (each with the round they would arrive), then watch the fight, let them fight it, or give it up.
 */
function renderContractCall(m) {
  if (m.resolved) return m.payload?.outcome ? `<p><strong>${esc(m.payload.outcome)}</strong></p>` : '';
  const c = contractsOf(state).active.find((x) => x.id === m.payload?.contractId);
  if (!c) return '';
  const ours = c.crewIds.map((id) => state.crew.find((o) => o.id === id)).filter(Boolean);
  const help = m.payload.help ?? [];
  const them = m.payload.enemies ?? 3;
  const n = ours.length + help.length;
  const risk = n > them ? 'low' : n === them ? 'moderate' : n === them - 1 ? 'high' : 'extreme';
  const free = helpers(state, c);
  const word = (k) => ['nobody', 'one', 'two', 'three', 'four', 'five'][k] ?? String(k);
  return `
      <div class="postcall">
        <p class="postcall__vs">${ours.map((o) => face(o, 'sm')).join('')}${help.map((id) => state.crew.find((o) => o.id === id)).filter(Boolean).map((o) => `<span class="postcall__help">${face(o, 'sm')}</span>`).join('')}<span class="muted small">against</span><span class="postcall__them">${them}</span></p>
        <p class="small">${riskBadge(risk)} ${esc(`${word(ours.length)[0].toUpperCase()}${word(ours.length).slice(1)} of ours on the post${help.length ? `, ${word(help.length)} on the way` : ''}, against ${word(them)}.`)}</p>
        <h3 class="sheet__group">Send help <span>up to ${HELP.max}, anyone free</span></h3>
        ${free.length ? `<ul class="list postcall__list">${free.map(({ op, round }) => {
          const on = help.includes(op.id);
          const full = !on && help.length >= HELP.max;
          return `<li><button class="row pick ${on ? 'is-on' : ''}" data-action="post-help" data-id="${esc(m.id)}|${esc(op.id)}" aria-pressed="${on}" ${full ? 'disabled' : ''}>
            ${face(op, 'sm')}<span class="row__main"><strong>${esc(op.handle)}</strong> <span class="muted small">${esc(op.role)} · combat ${op.stats.combat}</span></span>
            <span class="row__meta small">${on ? 'Sending · ' : ''}round ${round}</span></button></li>`;
        }).join('')}</ul><p class="muted small">Whoever goes is out today: no job for them. They go home after the fight.</p>` : '<p class="muted small">Nobody free to send.</p>'}
      </div>
      <div class="stack">
        <button class="btn btn--primary" data-action="decide" data-id="${esc(m.id)}" data-option="fight" ${state.activeMission ? 'disabled' : ''}>Watch the fight</button>
        <button class="btn" data-action="decide" data-id="${esc(m.id)}" data-option="auto" ${state.activeMission ? 'disabled' : ''}>Let them fight it <span class="muted small">(steady orders, a report back)</span></button>
        <button class="btn btn--ghost" data-action="decide" data-id="${esc(m.id)}" data-option="give">Give it up and come home</button>
        <p class="muted small">Give it up: everyone home unhurt, the pay so far kept, trust ${CONTRACT.trust.gaveUp}. In the fight, cautious and steady never lose anyone without asking you.</p>
      </div>`;
}

/** An expedition's deal gone wrong (core/expeditions.js): ours against theirs, then watch it, let them fight it, or pull out. */
function renderExpeditionCall(m) {
  if (m.resolved) return m.payload?.outcome ? `<p><strong>${esc(m.payload.outcome)}</strong></p>` : '';
  const e = expeditionById(state, m.payload?.expeditionId);
  if (!e) return '';
  const ours = e.crewIds.map((id) => state.crew.find((o) => o.id === id)).filter(Boolean);
  const them = m.payload.enemies ?? 3;
  const risk = ours.length > them ? 'low' : ours.length === them ? 'moderate' : ours.length === them - 1 ? 'high' : 'extreme';
  return `
      <div class="postcall">
        <p class="postcall__vs">${ours.map((o) => face(o, 'sm')).join('')}<span class="muted small">against</span><span class="postcall__them">${them}</span></p>
        <p class="small">${riskBadge(risk)} ${esc(`${ours.length} of ours against ${them}.`)}</p>
      </div>
      <div class="stack">
        <button class="btn btn--primary" data-action="decide" data-id="${esc(m.id)}" data-option="fight" ${state.activeMission ? 'disabled' : ''}>Watch the fight</button>
        <button class="btn" data-action="decide" data-id="${esc(m.id)}" data-option="auto" ${state.activeMission ? 'disabled' : ''}>Let them fight it <span class="muted small">(steady orders, a report back)</span></button>
        <button class="btn btn--ghost" data-action="decide" data-id="${esc(m.id)}" data-option="give">Pull out and come home</button>
        <p class="muted small">Pull out: everyone home unhurt with what they found; the goal partly met at best. Win the fight and the deal goes through. Cautious and steady never lose anyone without asking you.</p>
      </div>`;
}

function renderRetirement(m) {
  if (m.resolved) return m.payload.outcome ? `<p><strong>${esc(m.payload.outcome)}</strong></p>` : '';
  const lapsed = state.day > m.payload.expiresDay;
  return lapsed ? '<p class="muted small">This has passed; they are staying on.</p>' : `
      <div class="stack">
        ${m.options.map((o) => `<button class="btn ${o.id === 'stay' ? 'btn--primary' : 'btn--ghost'}" data-action="decide" data-id="${esc(m.id)}" data-option="${esc(o.id)}">${esc(o.label)}</button>`).join('')}
      </div>
      <p class="muted small">No answer within a week and they stay on at the current wage.</p>`;
}

function renderBuildOffer(m) {
  const p = m.payload;
  return `
      <div class="riskcard">
        ${p.ids.map((id) => `<p><button class="termlink" data-action="piece-tip" data-id="${esc(m.id)}|${esc(id)}" aria-expanded="${V.pieceTip === `${m.id}|${id}`}">${esc(pieceById(id).name)}</button></p>
        ${V.pieceTip === `${m.id}|${id}` ? `<div class="tipcard" role="note"><strong>${esc(pieceById(id).name)}</strong><p>${esc(pieceById(id).desc)}</p></div>` : ''}`).join('')}
        ${p.outcome ? `<p><strong>${esc(p.outcome)}</strong></p>` : '<p class="muted small">Tap a name for details. Each runner can choose one move and one payload; neither choice can be changed. Choose "Not yet" and Joss asks again in two weeks.</p>'}
      </div>
      ${m.resolved ? '' : `<div class="stack">
        ${m.options.map((o) => `<button class="btn ${o.id === 'later' ? 'btn--ghost' : 'btn--primary'}" data-action="decide" data-id="${esc(m.id)}" data-option="${esc(o.id)}">${esc(o.label)}</button>`).join('')}
      </div>`}`;
}

function renderSpecOffer(m) {
  const p = m.payload;
  return `
      <div class="riskcard">
        ${p.ids.map((id) => `<p><strong>${esc(SPECIALISATIONS[id].name)}</strong> · ${esc(SPECIALISATIONS[id].desc)}</p>`).join('')}
        ${p.outcome ? `<p><strong>${esc(p.outcome)}</strong></p>` : '<p class="muted small">One specialisation each, for good. "Not yet" and Joss asks again in two weeks.</p>'}
      </div>
      ${m.resolved ? '' : `<div class="stack">
        ${m.options.map((o) => `<button class="btn ${o.id === 'later' ? 'btn--ghost' : 'btn--primary'}" data-action="decide" data-id="${esc(m.id)}" data-option="${esc(o.id)}">${esc(o.label)}</button>`).join('')}
      </div>`}`;
}

/** The police at a hall's door (core/raids.js): hold it, walk out the back, or pay where they take it. */
function renderRaidCall(m) {
  const raid = (state.raids ?? []).find((r) => r.id === m.payload.raidId);
  if (!raid) return '';
  if (m.resolved) return m.payload.outcome ? `<p><strong>${esc(m.payload.outcome)}</strong></p>` : '';
  return `
      <div class="stack raidcall">
        ${raidWhere(raid)}
        ${raidChoices(state, raid).map((c) => `
        <button class="choice ${c.exit ? 'choice--exit' : ''} ${(raid.plan === 'hold' && c.id === 'hold') || (raid.plan === 'clear' && c.id === 'withdraw') ? 'is-plan' : ''}" data-action="decide" data-id="${esc(m.id)}" data-option="${esc(c.id)}" ${c.disabled ? 'disabled' : ''}>
          <strong>${esc(c.label)}${(raid.plan === 'hold' && c.id === 'hold') || (raid.plan === 'clear' && c.id === 'withdraw') ? ' · your plan' : ''}</strong><span>${esc(c.disabled && c.reason ? `${c.reason}. ${c.cost}` : c.cost)}</span>
        </button>`).join('')}
      </div>`;
}

/** A raid warning: what's coming, and where the police take money, the price to call it off. */
function renderRaidWarning(m) {
  const raid = (state.raids ?? []).find((r) => r.id === m.payload.raidId);
  if (!raid || raid.done) return raid?.outcome ? `<p class="muted small">It's over: ${esc({ paid: 'paid off', held: 'we held the hall', withdrew: 'we walked out' }[raid.outcome] ?? raid.outcome)}.</p>` : '';
  const price = raidPrice(state, raid);
  return `
      <div class="stack">
        ${raidWhere(raid)}
        ${canBuyOff(state, raid) && !raid.answer && !raid.called ? `<button class="btn btn--primary" data-action="raid-pay" data-id="${esc(raid.id)}" ${state.cash < price ? 'disabled' : ''}>${isGangRaid(raid) ? 'Settle' : 'Pay them off'} · ${money(price)}</button>` : ''}
        ${raid.answer === 'paid' ? `<p class="small"><strong>${isGangRaid(raid) ? 'Settled' : 'Paid off'} (${money(raid.paid)}).</strong> Nobody will come.</p>` : ''}
        <button class="btn" data-action="goto" data-id="city:map">See it on the City map</button>
        <p class="muted small">Until then: move people into or out of the hall on Crew › Halls (moving takes the day), and keep crews home or send them out. On the day, whoever is home can hold it.</p>
      </div>`;
}

/** Fixer notice at high heat: pay to cool it, or let it ride (the next job's first crisis roll is −1). */
function renderHeatNotice(m) {
  const p = m.payload;
  const short = heatChoices(state, m)[0].disabled;
  return `
      <div class="riskcard">
        <dl class="stats">
          <div><dt>Heat${p.district ? ` · ${esc(districtName(p.district))}` : ''}</dt><dd>${p.district ? heatIn(state, p.district) : state.heat}/10</dd></div>
          <div><dt>Fixer</dt><dd>${money(p.cost)}</dd></div>
          <div><dt>Cash</dt><dd>${money(state.cash)}</dd></div>
        </dl>
        ${p.outcome ? `<p><strong>${esc(p.outcome)}</strong></p>` : ''}
      </div>
      ${m.resolved ? '' : `<div class="stack">
        <button class="btn btn--primary" data-action="decide" data-id="${esc(m.id)}" data-option="pay" ${short ? 'disabled' : ''}>${esc(short ? `Pay the fixer (${money(p.cost)}: not enough cash)` : `Pay the fixer ${money(p.cost)} · heat −${p.cools}`)}</button>
        <button class="btn btn--ghost" data-action="decide" data-id="${esc(m.id)}" data-option="ride">Let it ride</button>
        <p class="muted small">Letting it ride costs nothing now. The next job you start is watched: −${WATCHED_PENALTY} on its first crisis roll, then it's gone. Jobs stay open either way.</p>
      </div>`}`;
}
