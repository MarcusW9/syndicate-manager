// Jobs: the board and its cards, heists, side work and its picker, clients.
import { openingFor } from '../core/halls.js';
import { jobGrudge, GANGS } from '../core/gangs.js';
import { crewStandard } from '../core/week.js';
import { heistFor, heistCard } from '../core/heists.js';
import { NAMES } from '../config/names.js';
import { statIcon, statGlyph, crewIcons } from './icons.js';
import { calendar } from '../core/time.js';
import { LEGEND_TEXT } from '../data/legend.js';
import { NAMED_OFFER, NAMED_TEXT } from '../data/fame.js';
import { nextUnlock, JOB_GATES, jobView, templateById } from '../core/jobs.js';
import { trustOf, trustLabel } from '../core/clients.js';
import { CLIENTS } from '../data/clients.js';
import { availability } from '../core/crew.js';
import { activeRumour } from '../core/rumours.js';
import { money } from '../core/money.js';
import { jobRead } from '../core/squad.js';
import { intelFor, SIDE_TRUST, sideReward, sideTaskById, sideOdds, sidePitch, sideCost } from '../core/sidetasks.js';
import { ROLL_STATS } from '../core/development.js';
import { clientRival } from '../core/rivals.js';
import { clientRivalLine } from '../data/rivals.js';
import { esc, infoButton, infoHtml, cityName, face, statName, riskWord, subTabs, infoText, districtName, statusChip, riskBadge, daysLeft } from './shared.js';
import { state, backLabel, V } from './view.js';

// --- jobs and planning -----------------------------------------------------
function streetTalk() {
  const r = activeRumour(state);
  return r ? `<div class="talk"><strong>Street talk · ${esc(NAMES.districts[r.district] ?? r.district)}</strong><br>${esc(r.text)}</div>` : '';
}

// The climb: how far the crew's name has to travel before bigger work is offered.
function climbLine() {
  const next = nextUnlock(state);
  if (!next) return '';
  // One compact line in the Heat meter's style (option B of five, owner's pick 2026-10-28; the
  // others are in drafts/prototypes/reputation-gauge-options.html): a label, a small segmented
  // track to the next unlock, the number, and the rest behind an (i). The (i) also holds the key
  // to the stat icons on job cards, which show there without words (2026-10-28).
  const rep = state.reputation ?? 0;
  const pct = Math.round(Math.min(1, rep / next.rep) * 100);
  const ladder = Object.entries(JOB_GATES).map(([threat, need]) => `${need} (threat ${threat})`).join(', ');
  return `<div class="climb infoline">
    <span class="climb__label">Rep</span>
    <span class="heat__track climb__track" role="progressbar" aria-label="Reputation towards the next unlock" aria-valuenow="${Math.floor(rep)}" aria-valuemin="0" aria-valuemax="${next.rep}"><span style="width:${pct}%"></span></span>
    <strong class="climb__value">${Math.floor(rep)}/${next.rep}</strong>
    ${infoButton('reputation', 'About reputation and job cards')}
  </div>
  ${infoHtml('reputation', `<p class="infotext small">${esc(`Bigger work opens up once people know your name. Finished jobs build it; aborts cost it. Rookie jobs are open from the start; the rest open at ${ladder}.`)}</p>
  <p class="infotext small">On job cards, the corner is Joss's read of the risk (bigger and redder is riskier), then how many runners Joss would send and the job's key stats: ${ROLL_STATS.map(statIcon).join(' ')}</p>`)}`;
}

/** Joss's read of one job for the board (core/squad.js jobRead), worked out once per state. */
const readCache = new WeakMap();
export function boardRead(job) {
  let reads = readCache.get(state);
  if (!reads) readCache.set(state, (reads = new Map()));
  if (!reads.has(job.id)) reads.set(job.id, jobRead(state, job));
  return reads.get(job.id);
}

/**
 * What's unusual about an offer, most important first, at most two. Usual facts (district, threat,
 * client mood, days left) stay on the planning screen: the card only speaks up when there's news.
 */
export const namedHandle = (v) => (v.askedFor ? state.crew.find((o) => o.id === v.askedFor)?.handle ?? null : null);
/** A defining job's runner (core/legend.js): the city is asking for them by name. */
export const definingHandle = (v) => (v.defining ? state.crew.find((o) => o.id === v.defining)?.handle ?? null : null);
/** A client's passing remark that another tong wanted this job (core/rivals.js clientRival; flavour only). */
export function rivalRemark(v) {
  const job = state.jobs.find((j) => j.id === v.jobId);
  const rv = job && v.client ? clientRival(state, job, v.tpl) : null;
  return rv ? `<p class="small muted clientrival">${esc(clientRivalLine({ client: v.client.name, tong: rv.tong, jobId: v.jobId, mood: rv.mood }))}</p>` : '';
}
const namedVars = (v) => ({ op: namedHandle(v), pct: Math.round(NAMED_OFFER.payBonus * 100) });
export const fillNamed = (text, v) => text.replace(/\{(\w+)\}/g, (m, k) => namedVars(v)[k] ?? m);

function jobFlags(v) {
  const flags = [];
  const hz = heistFor(state, v.jobId); // a heist's prep or finale (core/heists.js)
  if (hz) flags.push(['named', hz.step ? `Prep · ${hz.def.name}` : `${hz.def.name} · finale`]);
  if (definingHandle(v)) flags.push(['named', LEGEND_TEXT.chip.replace('{op}', definingHandle(v))]); // their moment (core/legend.js)
  if (namedHandle(v)) flags.push(['named', fillNamed(NAMED_TEXT.chip, v)]); // a client asked for an Elite by name (renown slice 4)
  const g = jobGrudge(v.tpl, v.threat);
  if (g) flags.push(['hot', `Against ${GANGS[g.gang].short}`]); // a job that hurts a gang (core/gangs.js)
  const opens = openingFor(state, v.jobId);
  if (opens) flags.push(['named', `Opens the ${cityName(opens).replace(/^The /, '')} hall`]); // a contact's opening favour (core/halls.js)
  if (v.hinted) flags.push(['bad', 'Intel unreliable']);
  if (v.rumour) flags.push([v.threatDelta > 0 ? 'hot' : v.threatDelta < 0 ? 'good' : 'info', `Street talk: ${v.rumour.tag}`]);
  else if (v.threatDelta > 0) flags.push(['hot', 'Hotter than usual']);
  else if (v.threatDelta < 0) flags.push(['good', 'Quieter than usual']);
  if (intelFor(state, v.tpl.district, v.inside)) flags.push(['good', 'Intel here']);
  if (v.days > 1) flags.push(['info', `${v.days}-day job`]);
  return flags.slice(0, 2);
}

/** A runner's tile word: free, tired or hurt (but able), or when they're back. */
function runnerWord(a) {
  if (a.ok) return a.reason === 'fatigued' ? 'Tired' : a.reason === 'light injury' ? 'Hurt' : 'Free';
  const back = /^away until day (\d+)$/.exec(a.reason);
  if (back) return `Out · ${calendar(Number(back[1])).weekday}`;
  return a.reason[0].toUpperCase() + a.reason.slice(1);
}

/** Who can run a job today, open by default; faces first, free people first. */
function renderRunners() {
  const people = state.crew.filter((o) => !o.freelance).map((op) => ({ op, a: availability(state, op) }))
    .sort((x, y) => Number(y.a.ok) - Number(x.a.ok));
  const free = people.filter((x) => x.a.ok).length;
  const out = people.length - free;
  return `
      <div class="runners">
        <button class="runners__head" data-action="toggle-runners" aria-expanded="${!V.runnersHidden}">
          <span><strong class="runners__free">${free} ${free === 1 ? 'runner' : 'runners'} free today</strong>${out ? ` · ${out} out` : ''}</span>
          <span class="runners__toggle">${V.runnersHidden ? 'Show' : 'Hide'}</span>
        </button>
        ${V.runnersHidden ? '' : `<ul class="runners__list">
          ${people.map(({ op, a }) => `<li><button class="runner ${a.ok ? (a.reason === 'ready' ? 'is-free' : 'is-worn') : 'is-out'}" data-action="op-link" data-id="${esc(op.id)}" aria-label="${esc(op.handle)}, ${esc(runnerWord(a))}: open their page">${face(op)}<strong>${esc(op.handle)}</strong><span>${esc(runnerWord(a))}</span></button></li>`).join('')}
        </ul>`}
      </div>`;
}

function jobCard(j) {
  const v = jobView(state, j);
  const t = v.tpl;
  const r = boardRead(j);
  const flags = jobFlags(v);
  // A note only when Joss's squad has a catch: someone missing, or someone tired or hurt.
  const worn = r.crew.map((op) => ({ op, a: availability(state, op) })).find((x) => x.a.reason === 'fatigued' || x.a.reason === 'light injury');
  const note = r.short ? `short ${r.short}` : worn ? `${worn.op.handle} is ${worn.a.reason === 'fatigued' ? 'tired' : 'hurt'}` : '';
  // The job's key skills, each an icon with its name (2026-11-05: the icons alone didn't say what they were).
  const stats = t.keyStats.map((k) => `<span class="keyglyph">${statGlyph(k)}<span>${esc(statName(k).toLowerCase())}</span></span>`).join('');
  const risk = riskWord(r.level);
  return `
      <li>
        <button class="row jobcard ${V.plan?.jobId === j.id ? 'is-selected' : ''}" data-action="open-job" data-id="${esc(j.id)}">
          <strong class="jobcard__name">${esc(t.name)}</strong><strong class="jobcard__pay">${money(v.pay)}</strong>
          <span class="jobcard__client">${esc(v.client?.name ?? 'Walk-in job')}</span>${j.expiresDay === state.day ? '<span class="jobcard__left">ends today</span>' : ''}
          ${flags.length ? `<span class="jobcard__flags">${flags.map(([tone, text]) => `<span class="flag flag--${tone}">${esc(text)}</span>`).join('')}</span>` : ''}
          <span class="jobcard__facts">${r.size || t.crewSize} ${(r.size || t.crewSize) === 1 ? 'runner' : 'runners'} · ${esc(crewStandard(v.threat).label)} · <span class="keyglyphs">${stats}</span>${note ? ` · <span class="jobcard__note">${esc(note)}</span>` : ''}</span>
          <span class="riskcorner riskcorner--${esc(r.level)}" role="img" aria-label="${esc(risk)} risk" title="${esc(risk[0].toUpperCase() + risk.slice(1))} risk"></span>
        </button>
      </li>`;
}

/** Jobs: what work there is. Sub-tabs Board · Heists · Side · Clients. `tab` overrides the sub-tab (the list beside a plan). */
export function renderJobs(tab = V.jobsTab) {
  const which = ['board', 'heists', 'side', 'clients'].includes(tab) ? tab : 'board';
  // Ending soonest first, then the better pay.
  const jobs = [...state.jobs].sort((a, b) => a.expiresDay - b.expiresDay || jobView(state, b).pay - jobView(state, a).pay);
  const body = {
    board: () => `${streetTalk()}
      ${climbLine()}
      ${renderRunners()}
      ${jobs.length ? `<ul class="list list--cols jobslist">${jobs.map(jobCard).join('')}</ul>` : '<p class="muted">No work on the board. New work comes in through the week.</p>'}`,
    heists: () => renderHeist() || '<p class="muted">No heist on right now.</p>',
    side: () => renderSideBoard(),
    clients: () => renderClientList(),
  }[which]();
  return `
    <section class="panel jobsboard">
      <h1>Jobs</h1>
      ${subTabs('Jobs sections', 'jobs-tab', [['board', 'Board'], ['heists', 'Heists'], ['side', 'Side'], ['clients', 'Clients']], which)}
      ${body}
    </section>`;
}

const PURPOSE = { money: 'Money', training: 'Training', trust: 'Client trust', info: 'Intel' };

/** A side task's headline is its reward; an intel task names the board jobs it would help. */
function sideHeadline(t) {
  if (t.purpose === 'training') return `${statName(t.stat)} ↑`;
  if (t.purpose === 'trust') return `+${SIDE_TRUST} trust · ${CLIENTS.find((c) => c.id === t.client)?.name ?? t.client}`;
  if (t.purpose === 'money') return sideReward(t);
  const helped = state.jobs.map((j) => templateById(j.templateId)).filter((tpl) => tpl.district === t.district).map((tpl) => tpl.name);
  return `Intel · ${helped.length ? `helps ${helped.join(', ')}` : 'helps nothing on the board'}`;
}

/** This week's side tasks, under the job board: compact rows, the reward first. */
function renderSideBoard() {
  const board = (state.sideBoard ?? []).map(sideTaskById).filter(Boolean);
  return `
      <h2>Side work this week</h2>
      <div class="infoline"><p class="muted small">Small jobs for whoever's free.</p>${infoButton('side-work', 'About side work')}</div>
      ${infoText('side-work', 'One-off jobs for whoever isn\'t on the main work. They\'re away for the days shown, and the result comes back with them. A new board every Monday.')}
      ${board.length ? `<ul class="list list--cols sidelist">
        ${board.map((t) => `
          <li>
            <button class="row siderow" data-action="open-side" data-id="${esc(t.id)}">
              <strong class="siderow__reward siderow__reward--${esc(t.purpose)}">${esc(sideHeadline(t))}</strong>
              <span class="siderow__meta">${t.days}d · ${crewIcons(t.crew)}</span>
              <span class="siderow__sub">${esc(t.name)} · ${esc(districtName(t.district))} · ${statIcon(t.stat)}</span>
            </button>
          </li>`).join('')}
      </ul>` : '<p class="muted">Nothing left this week. More on Monday.</p>'}
`;
}

/** Planning a side task: who goes, how likely it goes well, what it gives and costs. */
export function renderSidePlan() {
  const t = sideTaskById(V.sidePlan.taskId);
  if (!t || !(state.sideBoard ?? []).includes(t.id)) { V.sidePlan = null; return renderJobs(); }
  const odds = V.sidePlan.crew.length ? sideOdds(state, t, V.sidePlan.crew) : null;
  return `
    <section class="panel">
      <button class="btn btn--ghost" data-action="back">← ${esc(backLabel())}</button>
      <h1>${esc(t.name)}</h1>
      <p class="muted">${esc(districtName(t.district))} · ${esc(PURPOSE[t.purpose])} · ${t.days} day${t.days > 1 ? 's' : ''} away · up to ${t.crew}</p>
      <p class="body">${esc(sidePitch(t))}</p>
      <div class="riskcard">
        <p><strong>If it goes well:</strong> ${esc(sideReward(t, Math.max(1, V.sidePlan.crew.length)))}.</p>
        <p><strong>If it goes badly:</strong> ${esc(sideCost(t))}.</p>
        <p class="muted small">One roll on ${esc(t.stat)}. Everyone sent learns a little ${esc(t.stat)}${t.purpose === 'training' ? ', more if it goes well' : ''}.</p>
      </div>
      <h2>Who goes (up to ${t.crew})</h2>
      <ul class="list">
        ${state.crew.filter((op) => !op.freelance).map((op) => {
          const a = availability(state, op);
          const on = V.sidePlan.crew.includes(op.id);
          return `
          <li>
            <button class="row pick ${on ? 'is-on' : ''}" data-action="toggle-side-crew" data-id="${esc(op.id)}" ${a.ok ? '' : 'disabled'} aria-pressed="${on}">
              <span class="pick__box">${on ? '✓' : ''}</span>
              ${face(op, 'sm')}
              <span class="row__main"><strong>${esc(op.handle)}</strong> <span class="muted">${esc(op.role)}</span><br><span class="small">${esc(statName(t.stat))} ${op.stats[t.stat]}</span></span>
              <span class="row__meta">${statusChip(a)}</span>
            </button>
          </li>`;
        }).join('')}
      </ul>
    </section>
    <div class="planbar">
      <div class="planbar__read">
        ${odds ? riskBadge(odds.risk) : '<span class="risk risk--none">nobody yet</span>'}
        <span class="planbar__why">${esc(odds ? `${odds.op.handle} on ${t.stat} (${odds.value}${odds.notes.length ? ', ' + odds.notes.join(', ') : ''})` : `Pick up to ${t.crew}`)}</span>
      </div>
      <button class="btn btn--primary" data-action="send-side" ${V.sidePlan.crew.length ? '' : 'disabled'}>${V.sidePlan.crew.length ? `Send ${V.sidePlan.crew.length}` : 'Pick someone'}</button>
    </div>`;
}

const trustTone = (t) => (t >= 60 ? 'good' : t >= 40 ? 'mid' : 'bad');
const TRUST_NOTE = 'Finished jobs build trust; aborts and "client unhappy" choices cost it. High trust pays up to 15% more; below 20, a client stops calling. Trust drifts back towards neutral each week.';

/** Jobs › Clients: a row for each client (trust and what they have on the board now), each opening the client's page. */
function renderClientList() {
  return `
      <div class="infoline"><p class="muted small">Where you stand with each.</p>${infoButton('clients', 'About client trust')}</div>
      ${infoText('clients', TRUST_NOTE)}
      <ul class="list list--cols clientlist">
        ${CLIENTS.map((c) => {
          const t = trustOf(state, c.id);
          const open = state.jobs.filter((j) => j.clientId === c.id).length;
          return `<li><button class="row clientrow" data-action="client-open" data-id="${esc(c.id)}">
            <span class="row__main"><strong>${esc(c.name)}</strong><br><span class="muted small">${open ? `${open} on the board` : 'Nothing on the board'}</span></span>
            <span class="trust trust--${trustTone(t)}">${esc(trustLabel(t))}<br><span class="small">${t}/100</span></span></button></li>`;
        }).join('')}
      </ul>`;
}

/**
 * A client's page (Jobs › Clients, the one home of a client from any link): where you stand and what they have on the
 * board now, then who they are (the line from data/clients.js, unchanged). Shown for a client with no jobs too.
 */
export function renderClientPage() {
  const c = CLIENTS.find((x) => x.id === V.clientPage);
  if (!c) { V.clientPage = null; return renderJobs(); }
  const t = trustOf(state, c.id);
  const theirs = state.jobs.filter((j) => j.clientId === c.id).map((j) => ({ j, v: jobView(state, j) }));
  return `
    <section class="panel clientpage">
      <button class="linkbtn" data-action="back">‹ ${esc(backLabel())}</button>
      <h1>${esc(c.name)}</h1>
      <p class="muted small">${esc(cityName(c.district))}</p>
      <div class="clientpage__trust"><span class="trust trust--${trustTone(t)}">${esc(trustLabel(t))}<br><span class="small">${t}/100</span></span>
        <p class="muted small">${esc(TRUST_NOTE)}</p></div>
      <h2>On the board now</h2>
      ${theirs.length ? `<div class="stack">${theirs.map(({ j, v }) => `<button class="btn" data-action="open-job" data-id="${esc(j.id)}">${esc(v.tpl.name)} · ${money(v.pay)} · ${daysLeft(j.expiresDay)}</button>`).join('')}</div>`
        : '<p class="muted small">Nothing from them on the board right now.</p>'}
      <h2>About them</h2>
      <p class="body">${esc(c.desc)}</p>
    </section>`;
}

/**
 * The command centre's list (2026-11-05): everyone out, calls first, then side work. Everything can
 * be done from here without the map; picking a district (on the map or a crew's district) narrows it.
 */
/**
 * The heist on, at the top of Ops (core/heists.js, 2026-11-07): its prep steps, what each gives
 * the finale, a Plan or Buy on each, and the finale once it's up. Nothing when no heist is on.
 */
function renderHeist() {
  const c = heistCard(state);
  if (!c) return '';
  const onBoard = (id) => id && state.jobs.some((j) => j.id === id);
  const finUp = onBoard(c.finaleJobId);
  const days = c.weekStart - state.day;
  const when = finUp ? `The finale is on the board until ${calendar(c.finaleDay).weekday}.`
    : c.finaleJobId ? 'The finale is under way.'
    : `The finale goes up ${days <= 1 ? 'tomorrow' : `${calendar(c.weekStart).weekday}, in ${days} days`}.`;
  const mark = { done: '✓', bought: '✓', asked: '·', failed: '✗' };
  const go = (st) => {
    if (st.status === 'asked') return onBoard(st.jobId) ? `<button class="heist__go" data-action="open-job" data-id="${esc(st.jobId)}">Plan ›</button>` : '<span class="heist__go is-quiet">Out</span>';
    if (st.status === 'failed' && st.buy) return st.buy.ok ? `<button class="heist__go" data-action="heist-buy" data-id="${esc(c.id)}|${esc(st.id)}">Buy ${money(st.buy.price)}</button>` : `<span class="heist__go is-quiet">${esc(st.buy.reason)}</span>`;
    return '';
  };
  return `
    <section class="heist" aria-label="Heist: ${esc(c.name)}">
      <p class="heist__kicker">Heist · ${esc(c.contact)}</p>
      <h3 class="heist__name">${esc(c.name)}</h3>
      <p class="heist__when small">${when} ${c.prepared} of ${c.steps.length} prepared.</p>
      <ol class="heist__steps">
        ${c.steps.map((st) => `
        <li class="heist__step is-${st.status}">
          <span class="heist__mark" aria-hidden="true">${mark[st.status]}</span>
          <span class="heist__text"><span>${esc(st.line)}</span><span class="heist__fx">${esc(st.effect)}${st.status === 'bought' ? ' · bought' : st.status === 'failed' ? ' · not done' : ''}</span></span>
          ${go(st)}
        </li>`).join('')}
      </ol>
      ${finUp ? `<button class="btn heist__finale" data-action="open-job" data-id="${esc(c.finaleJobId)}">Plan the finale</button>` : ''}
    </section>`;
}
