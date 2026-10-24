// UI layer: the only code that touches the DOM. Reads state, calls core
// functions, re-renders. Tap/click only; nothing depends on hover.

import { NAMES } from '../config/names.js';
import { TRAITS } from '../data/traits.js';
import { STARTING_CREW } from '../data/operatives.js';

// Saves made before badges existed have no colour on their operatives.
const COLOR_BY_ID = Object.fromEntries(STARTING_CREW.map((o) => [o.id, o.color]));
import { advanceDay, formatDate, isBlocked, seasonStartDay } from '../core/time.js';
import { createNewGame } from '../core/state.js';
import { templateById, jobView } from '../core/jobs.js';
import { trustLabel, clientById, trustOf } from '../core/clients.js';
import { CLIENTS } from '../data/clients.js';
import { availability, APPROACHES, traitMods, ratedStat, maxCrew, crewSizeRead } from '../core/crew.js';
import { assessJob } from '../core/risk.js';
import {
  startMission, revealBeat, chooseOption, resolveCritical, closeMission,
  describeCrisis, describeCritical, currentStep,
} from '../core/mission.js';
import {
  saveGame, loadGame, exportSave, importSave, listSlots, getActiveSlot, setActiveSlot,
  deleteSlot, loadBackup, backupDue, SLOT_COUNT,
} from '../save/save.js';
import { hire, haggle, passRecruit, canHire, signingFee, nextExpansion, expandSafehouse, STARTING_ROSTER_CAP } from '../core/recruits.js';
import { potentialRead, potentialTag, primaryStat, scoutFor, ageRate, declineChance, mentoring, changesSince } from '../core/development.js';
import { GROWTH_LINES, GRADUATION_LINES } from '../data/growthLines.js';
import { freelancerAsCrew, shareOf, MAX_FREELANCERS_PER_JOB } from '../core/freelance.js';

let state;
let screen = 'inbox';
let openMessageId = null;
let openOperativeId = null;
let openRecruitId = null;
let newGameSlot = null; // slot number while picking a difficulty
let plan = null; // { jobId, crew: [...ids], approach }
let root;

export function mountApp(el, initialState) {
  root = el;
  state = initialState;
  root.addEventListener('click', onClick);
  root.addEventListener('change', onChange);
  render();
}

function setState(next) {
  state = next;
  saveGame(state);
  render();
}

// --- events ------------------------------------------------------------
function onClick(e) {
  const t = e.target.closest('[data-action]');
  if (!t || t.disabled) return;
  const { action, id } = t.dataset;

  switch (action) {
    case 'nav': screen = id; openMessageId = null; openOperativeId = null; openRecruitId = null; plan = null; break;
    case 'continue': if (!isBlocked(state)) return setState(advanceDay(state)); break;
    case 'open-message': {
      openMessageId = id;
      const msg = state.inbox.find((m) => m.id === id);
      if (msg && !msg.read) { msg.read = true; saveGame(state); }
      break;
    }
    case 'back': openMessageId = null; openOperativeId = null; openRecruitId = null; plan = null; break;
    case 'open-op': openOperativeId = id; break;
    case 'open-recruit': openRecruitId = id; break;
    case 'hire': openRecruitId = null; return setState(hire(state, id));
    case 'haggle': return setState(haggle(state, id));
    case 'pass': openRecruitId = null; return setState(passRecruit(state, id));
    case 'expand':
      if (confirm(`Expand the safehouse for ${money(nextExpansion(state).cost)}? Rent goes up by ${money(nextExpansion(state).rentIncrease)} a week.`)) return setState(expandSafehouse(state));
      break;
    case 'open-job': plan = { jobId: id, crew: [], approach: 'stealth' }; break;
    case 'toggle-crew': {
      const tpl = templateById(state.jobs.find((j) => j.id === plan.jobId).templateId);
      const isF = (x) => (state.freelancers ?? []).some((f) => f.id === x);
      if (plan.crew.includes(id)) plan.crew = plan.crew.filter((x) => x !== id);
      else if (isF(id) && plan.crew.filter(isF).length >= MAX_FREELANCERS_PER_JOB) plan.crew = [...plan.crew.filter((x) => !isF(x)), id]; // swap freelancers
      else if (plan.crew.length < maxCrew(tpl.crewSize)) plan.crew = [...plan.crew, id];
      break;
    }
    case 'approach': plan.approach = id; break;
    case 'start-job': {
      const next = startMission(state, plan.jobId, plan.crew, plan.approach);
      plan = null;
      return setState(next);
    }
    case 'beat': return setState(revealBeat(state));
    case 'choose': return setState(chooseOption(state, id));
    case 'critical': return setState(resolveCritical(state, id));
    case 'close-mission': screen = 'inbox'; return setState(closeMission(state));
    case 'export':
      state.lastBackupDay = state.day;
      saveGame(state);
      exportSave(state);
      break;
    case 'import':
      if (confirm(`Load a save file into slot ${getActiveSlot()}? The game in this slot will be replaced.`)) root.querySelector('#import-file').click();
      break;
    case 'slot-load': {
      const n = Number(id);
      const loaded = loadGame(n);
      if (!loaded) { alert(`Slot ${n} could not be loaded.`); break; }
      setActiveSlot(n);
      screen = 'inbox'; plan = null; openMessageId = null; openOperativeId = null; openRecruitId = null;
      return setState(loaded);
    }
    case 'slot-new': newGameSlot = Number(id); break;
    case 'cancel-new': newGameSlot = null; break;
    case 'difficulty': {
      const slot = newGameSlot;
      const taken = !listSlots()[slot - 1].empty;
      if (taken && !confirm(`Start a new ${id} game in slot ${slot}? The game in that slot will be deleted.`)) break;
      deleteSlot(slot);
      setActiveSlot(slot);
      newGameSlot = null;
      screen = 'inbox'; plan = null; openMessageId = null; openOperativeId = null; openRecruitId = null;
      return setState(createNewGame({ difficulty: id }));
    }
    case 'slot-delete':
      if (confirm(`Delete the game in slot ${id}? This can't be undone.`)) deleteSlot(Number(id));
      break;
    case 'restore-backup': {
      const backup = loadBackup();
      if (backup && confirm(`Go back to the automatic backup from day ${backup.day}? Everything since then will be lost.`)) {
        screen = 'inbox';
        return setState(backup);
      }
      break;
    }
  }
  render();
}

function onChange(e) {
  if (e.target.id !== 'import-file' || !e.target.files[0]) return;
  importSave(e.target.files[0])
    .then((loaded) => { screen = 'inbox'; plan = null; setState(loaded); })
    .catch((err) => alert(`Could not load that file: ${err.message}`));
}

// --- helpers -----------------------------------------------------------
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = (n) => `${n < 0 ? '-' : ''}${NAMES.currency}${Math.abs(n).toLocaleString()}`;
const threatDots = (n) => '●'.repeat(n) + '○'.repeat(5 - n);
/** Threat with a marker when this offer is above or below the job's usual level. */
const threatHtml = (v) => `<span class="threat">${threatDots(v.threat)}</span>${v.threatDelta > 0 ? ' <span class="tag-up">hotter than usual</span>' : v.threatDelta < 0 ? ' <span class="tag-down">quieter than usual</span>' : ''}`;
const clientLine = (v) => v.client ? `${esc(v.client.name)} <span class="muted">(${esc(trustLabel(v.trust))})</span>` : '<span class="muted">Walk-in job</span>';
const riskBadge = (level) => `<span class="risk risk--${esc(level)}">${esc(level === 'safe' || level === 'certain' ? level : `${level} risk`)}</span>`;
const districtName = (key) => NAMES.districts[key] ?? key;
const initials = (name) => { const w = name.trim().split(/\s+/); return (w[0][0] + (w.length > 1 ? w.at(-1)[0] : '')).toUpperCase(); };
/** Placeholder portrait: coloured initials. Swap for an <img> when portraits exist. */
const badge = (op, size = '') => `<span class="badge ${size ? `badge--${size}` : ''} ${op.cause ? 'is-fallen' : ''}" style="--badge:${esc(op.color ?? COLOR_BY_ID[op.id] ?? '#8b93a7')}" aria-hidden="true">${esc(initials(op.name))}</span>`;

const signed = (n) => `${n > 0 ? '+' : '−'}${Math.abs(n)}`;
const statName = (k) => k[0].toUpperCase() + k.slice(1);
/** This season's net change per stat (rises and age decline), from the growth log. */
const seasonChanges = (op) => changesSince(op, seasonStartDay(state.day));

/** Crew-list one-liner: their best (main) stat and the scout's read of where they're heading. */
function scoutLine(op) {
  const main = primaryStat(op);
  return `<span class="scoutline">${esc(statName(main))} ${ratedStat(op, main)} · ${esc(potentialTag(op))}</span>`;
}

/** Crew-list marker: "▲ Tech +2, Combat +1 ▼ Driving −1" for this season. */
function growthMarker(op) {
  const net = Object.entries(seasonChanges(op));
  const up = net.filter(([, n]) => n > 0).map(([k, n]) => `${statName(k)} ${signed(n)}`);
  const down = net.filter(([, n]) => n < 0).map(([k, n]) => `${statName(k)} ${signed(n)}`);
  return (up.length ? `<span class="marker">▲ ${esc(up.join(', '))}</span>` : '') +
    (down.length ? `<span class="marker is-down">▼ ${esc(down.join(', '))}</span>` : '');
}

/**
 * One stat on a stats panel: the number used on jobs (with trait bonuses), the bonus,
 * and (for crew) this season's change in green/red plus a smaller career figure.
 */
function statCell(op, k, { growth = false } = {}) {
  const mod = traitMods(op)[k] ?? 0;
  const season = growth ? seasonChanges(op)[k] ?? 0 : 0;
  const career = growth ? op.stats[k] - (op.startStats?.[k] ?? op.stats[k]) : 0;
  const traitNames = op.traits.filter((t) => typeof TRAITS[t]?.effects?.[k] === 'number').map((t) => TRAITS[t].name).join(', ');
  return `<div>
    <dt>${esc(k)}</dt>
    <dd>${ratedStat(op, k)}${season ? ` <span class="growth ${season < 0 ? 'is-down' : ''}">${signed(season)}</span>` : ''}</dd>
    ${mod ? `<span class="statnote ${mod < 0 ? 'is-down' : ''}">${op.stats[k]} ${mod > 0 ? '+' : '−'}${Math.abs(mod)} ${esc(traitNames)}</span>` : ''}
    ${career ? `<span class="statnote">career ${signed(career)}</span>` : ''}
  </div>`;
}

// --- rendering ---------------------------------------------------------
function render() {
  const blocked = isBlocked(state);
  const unread = state.inbox.filter((m) => !m.read).length;
  const continueLabel = state.activeMission ? 'On a job' : blocked ? 'Decision needed' : 'Continue';

  root.innerHTML = `
    <header class="topbar">
      <div class="topbar__date">${esc(formatDate(state.day))} <span class="muted small">· Day ${state.day}</span></div>
      <div class="topbar__stats">
        <span class="stat"><span class="stat__label">Cash</span> ${money(state.cash)}</span>
        <span class="stat"><span class="stat__label">Heat</span> ${state.heat}/10</span>
        <span class="stat"><span class="stat__label">Tier</span> ${esc(state.tier)}</span>
      </div>
      <button class="btn btn--primary topbar__continue" data-action="continue" ${blocked ? 'disabled' : ''}>${continueLabel}</button>
    </header>

    <nav class="nav" aria-label="Main">
      ${navButton('inbox', `Inbox${unread ? ` (${unread})` : ''}`)}
      ${navButton('crew', 'Crew')}
      ${navButton('jobs', `Jobs${state.jobs.length ? ` (${state.jobs.length})` : ''}`)}
      ${navButton('settings', 'Save')}
    </nav>

    <main class="main">${state.activeMission ? renderMission() : renderScreen()}</main>
    <input type="file" id="import-file" accept="application/json" hidden />
  `;
  if (state.activeMission) root.querySelector('.mission-end')?.scrollIntoView({ block: 'end' });
}

function navButton(id, label) {
  return `<button class="nav__btn ${screen === id ? 'is-active' : ''}" data-action="nav" data-id="${id}">${esc(label)}</button>`;
}

function renderScreen() {
  if (screen === 'inbox') return openMessageId ? renderMessage() : renderInbox();
  if (screen === 'crew') return openRecruitId ? renderRecruit() : openOperativeId ? renderOperative() : renderCrew();
  if (screen === 'jobs') return plan ? renderPlan() : renderJobs();
  if (screen === 'settings') return renderSettings();
  return '';
}

// --- inbox -------------------------------------------------------------
function backupBanner() {
  if (!backupDue(state)) return '';
  return `<div class="banner"><span>${state.lastBackupDay ? `No backup for ${state.day - state.lastBackupDay} days.` : 'You have never backed up this save.'}</span>
    <button class="btn" data-action="export">Export now</button></div>`;
}

function renderInbox() {
  if (!state.inbox.length) return `<section class="panel"><h1>Inbox</h1><p class="muted">Nothing new. Press Continue.</p></section>`;
  return `
    ${backupBanner()}
    <section class="panel">
      <h1>Inbox</h1>
      <ul class="list">
        ${state.inbox.map((m) => `
          <li>
            <button class="row ${m.read ? '' : 'is-unread'}" data-action="open-message" data-id="${esc(m.id)}">
              <span class="row__tag tag--${esc(m.type)}">${esc(m.type)}</span>
              <span class="row__main">${esc(m.subject)}</span>
              <span class="row__meta">Day ${m.day}</span>
            </button>
          </li>`).join('')}
      </ul>
    </section>`;
}

function renderMessage() {
  const m = state.inbox.find((x) => x.id === openMessageId);
  if (!m) return renderInbox();
  const jobLink = m.type === 'job' && state.jobs.length ? `<button class="btn" data-action="nav" data-id="jobs">Open the job board</button>`
    : m.type === 'scout' && (state.recruits ?? []).length ? `<button class="btn" data-action="nav" data-id="crew">See the leads</button>` : '';
  return `
    <section class="panel">
      <button class="btn btn--ghost" data-action="back">← Inbox</button>
      <h1>${esc(m.subject)}</h1>
      <p class="muted">${esc(m.type)} · Day ${m.day}</p>
      <p class="body">${esc(m.body)}</p>
      ${jobLink}
    </section>`;
}

// --- crew --------------------------------------------------------------
function renderCrew() {
  const cap = state.rosterCap ?? STARTING_ROSTER_CAP;
  const x = nextExpansion(state);
  const recruits = state.recruits ?? [];
  const wall = state.memorial.length ? `
      <h2>The wall</h2>
      <ul class="list list--plain">
        ${state.memorial.map((m) => `<li class="fallen">${badge(m, 'sm')}<span><strong>${esc(m.name)}</strong> "${esc(m.handle)}" <span class="muted">· ${esc(m.role)} · ${esc(m.cause)}, day ${m.day}</span></span></li>`).join('')}
      </ul>` : '';
  const leads = `
      <h2>Leads (${recruits.length})</h2>
      ${recruits.length ? `<ul class="list">
        ${recruits.map((r) => `
          <li>
            <button class="row" data-action="open-recruit" data-id="${esc(r.id)}">
              ${badge(r)}
              <span class="row__main"><strong>${esc(r.name)}</strong> "${esc(r.handle)}"<br><span class="muted">${esc(r.quality)} ${esc(r.role)} · ${r.age}</span></span>
              <span class="row__meta"><strong>${money(r.wage)}</strong>/wk<br>gone day ${r.expiresDay}</span>
            </button>
          </li>`).join('')}
      </ul>` : '<p class="muted small">No leads right now. Scouts report every Wednesday.</p>'}`;
  return `
    <section class="panel">
      <div class="crewhead">
        <h1>Crew</h1>
        <span class="muted">${state.crew.length}/${cap} beds</span>
      </div>
      <ul class="list">
        ${state.crew.map((op) => `
          <li>
            <button class="row" data-action="open-op" data-id="${esc(op.id)}">
              ${badge(op)}
              <span class="row__main"><strong>${esc(op.name)}</strong> "${esc(op.handle)}"<br><span class="muted">${esc(op.tier ?? '')} ${esc(op.role)} · ${op.age}</span>${scoutLine(op)}${growthMarker(op)}</span>
              <span class="row__meta">${esc(availability(state, op).reason)}</span>
            </button>
          </li>`).join('')}
      </ul>
      ${leads}
      <h2>Safehouse</h2>
      <div class="riskcard">
        <p class="small">Level ${state.safehouseLevel ?? 1} · ${cap} beds · rent ${money(state.rent)}/wk</p>
        <button class="btn btn--block" data-action="expand" ${state.cash >= x.cost ? '' : 'disabled'}>
          Expand: +${x.beds} beds for ${money(x.cost)} (rent +${money(x.rentIncrease)}/wk)
        </button>
        ${state.cash < x.cost ? `<p class="muted small">Need ${money(x.cost - state.cash)} more.</p>` : ''}
      </div>
      ${wall}
    </section>`;
}

function renderRecruit() {
  const r = (state.recruits ?? []).find((x) => x.id === openRecruitId);
  if (!r) { openRecruitId = null; return renderCrew(); }
  const can = canHire(state, r);
  return `
    <section class="panel">
      <button class="btn btn--ghost" data-action="back">← Crew</button>
      <div class="ophead">
        ${badge(r, 'lg')}
        <div>
          <h1>${esc(r.name)} <span class="muted">"${esc(r.handle)}"</span></h1>
          <p class="muted">${esc(r.quality)} ${esc(r.role)} · ${r.age} · lead goes cold on day ${r.expiresDay}</p>
        </div>
      </div>
      <p class="body">${esc(r.origin)}</p>
      <p class="body muted">${esc(r.bio)}</p>

      <h2>Traits</h2>
      <ul class="chips">
        ${r.traits.map((t) => `<li class="chip"><strong>${esc(TRAITS[t]?.name ?? t)}</strong><span>${esc(TRAITS[t]?.desc ?? '')}</span></li>`).join('')}
      </ul>

      <h2>Stats</h2>
      <dl class="stats">
        ${Object.keys(r.stats).map((k) => statCell(r, k)).join('')}
      </dl>

      <h2>Scout's view</h2>
      <div class="riskcard">
        <p>${esc(r.scoutReport ?? 'Nobody has a read on them yet.')}</p>
        <p class="muted small">${esc(growthNote(r.age))} Opinions, not facts: scouts get it wrong sometimes.</p>
      </div>

      <h2>Terms</h2>
      <div class="riskcard">
        <p>Wants <strong>${money(r.wage)}</strong> a week, plus a ${money(signingFee(r))} signing fee now.</p>
        ${r.haggleResult ? `<p class="muted">${esc(r.haggleResult)}</p>` : ''}
      </div>
      <div class="stack">
        <button class="btn btn--primary" data-action="hire" data-id="${esc(r.id)}" ${can.ok ? '' : 'disabled'}>Hire for ${money(signingFee(r))}</button>
        ${can.ok ? '' : `<p class="muted small">${esc(can.reason)}</p>`}
        <button class="btn" data-action="haggle" data-id="${esc(r.id)}" ${r.haggled ? 'disabled' : ''}>${r.haggled ? 'Already haggled' : 'Haggle (your best talker rolls)'}</button>
        <button class="btn btn--ghost" data-action="pass" data-id="${esc(r.id)}">Pass on this one</button>
      </div>
    </section>`;
}

/** Plain-words growth rate for an age (see core/development.js). */
function growthNote(age) {
  if (declineChance(age)) return 'Past 40: slipping a little every season.';
  const rate = ageRate(age);
  return rate > 1 ? 'Young: learns fast.' : rate < 1 ? 'Experienced: learns slowly now.' : 'Still learning at a steady pace.';
}

/** Guns for hire on the planning screen: one per job, paid a share of what the job pays. */
function renderFreelancers(t, freelancers, full) {
  if (!freelancers.length) return '';
  return `
      <h2>Freelancers (up to ${MAX_FREELANCERS_PER_JOB})</h2>
      <p class="muted small">Hired for this job only. No wage: they take a share of what the job pays, and nothing if it pays nothing. They don't learn on your payroll.</p>
      <ul class="list">
        ${freelancers.map((f) => {
          const on = plan.crew.includes(f.id);
          const keys = t.keyStats.map((s) => `${s.slice(0, 3)} ${ratedStat(f, s)}${traitMods(f)[s] ? '*' : ''}`).join(' · ');
          return `
          <li>
            <button class="row pick ${on ? 'is-on' : ''}" data-action="toggle-crew" data-id="${esc(f.id)}" ${!on && full && !plan.crew.some((x) => freelancers.some((g) => g.id === x)) ? 'disabled' : ''} aria-pressed="${on}">
              <span class="pick__box">${on ? '✓' : ''}</span>
              ${badge(f, 'sm')}
              <span class="row__main"><strong>${esc(f.handle)}</strong> <span class="muted">${esc(f.quality)} ${esc(f.role)}</span><br><span class="muted small">${esc(keys)}</span></span>
              <span class="row__meta"><strong>${Math.round(shareOf(f) * 100)}%</strong> of pay<br>gone day ${f.expiresDay}</span>
            </button>
          </li>`;
        }).join('')}
      </ul>`;
}

function renderMentoring(crew) {
  const pairs = mentoring(crew);
  if (!pairs.length) return '';
  return `<p class="small mentor">${pairs.map(({ op, mentors }) => `${esc(op.handle)} learns faster with ${esc(mentors.map((m) => m.handle).join(' and '))} on the job.`).join(' ')}</p>`;
}

function bar(label, value) {
  return `<div class="meter"><span class="meter__label">${label}</span><span class="meter__track"><span class="meter__fill ${value > 70 ? 'is-hot' : ''}" style="width:${value}%"></span></span><span class="meter__value">${value}</span></div>`;
}

function renderOperative() {
  const op = state.crew.find((x) => x.id === openOperativeId);
  if (!op) return renderCrew();
  const c = op.condition;
  const nameOf = (id) => state.crew.find((x) => x.id === id)?.handle ?? state.memorial.find((x) => x.id === id)?.handle ?? id;
  return `
    <section class="panel">
      <button class="btn btn--ghost" data-action="back">← Crew</button>
      <div class="ophead">
        ${badge(op, 'lg')}
        <div>
          <h1>${esc(op.name)} <span class="muted">"${esc(op.handle)}"</span></h1>
          <p class="muted">${esc(op.tier ?? '')} ${esc(op.role)} · ${op.age} · ${money(op.wage)}/week · ${esc(availability(state, op).reason)}</p>
        </div>
      </div>
      <p class="body">${esc(op.bio)}</p>
      <p class="body muted">${esc(op.origin)}</p>

      <h2>Traits</h2>
      <ul class="chips">
        ${op.traits.map((t) => `<li class="chip"><strong>${esc(TRAITS[t]?.name ?? t)}</strong><span>${esc(TRAITS[t]?.desc ?? '')}</span></li>`).join('')}
      </ul>

      <h2>Stats</h2>
      <dl class="stats">
        ${Object.keys(op.stats).map((k) => statCell(op, k, { growth: true })).join('')}
      </dl>

      <h2>Development</h2>
      <div class="riskcard">
        <p>${esc(potentialRead(op, scoutFor(state.crew, op.role, op.id)?.handle))}</p>
        <p class="muted small">${esc(growthNote(op.age))} Green and red numbers are this season's change; "career" is since joining.</p>
      </div>

      <h2>Condition</h2>
      ${bar('Fatigue', c.fatigue)}${bar('Morale', c.morale)}${bar('Neural load', c.neuralLoad)}${bar('Burnout', c.burnout)}

      <h2>Trust</h2>
      <ul class="list list--plain">
        ${Object.entries(op.trust).map(([id, v]) => `<li>${esc(nameOf(id))}: ${v > 0 ? '+' : ''}${v}</li>`).join('') || '<li class="muted">No strong feelings yet.</li>'}
      </ul>

      ${op.history.length ? `<h2>History</h2><ul class="list list--plain">${op.history.slice(-8).reverse().map((h) => `<li class="muted">${esc(h)}</li>`).join('')}</ul>` : ''}
    </section>`;
}

// --- jobs and planning -----------------------------------------------------
function renderJobs() {
  if (!state.jobs.length) return `<section class="panel"><h1>Jobs</h1><p class="muted">No work on the board. New jobs arrive on Mondays.</p>${renderClients()}</section>`;
  return `
    <section class="panel">
      <h1>Jobs</h1>
      <ul class="list">
        ${state.jobs.map((j) => {
          const v = jobView(state, j);
          const t = v.tpl;
          return `
          <li>
            <button class="row" data-action="open-job" data-id="${esc(j.id)}">
              <span class="row__main"><strong>${esc(t.name)}</strong> · ${clientLine(v)}<br>
                <span class="muted">${esc(districtName(t.district))} · threat ${threatHtml(v)} · ${t.crewSize} crew · ${t.days}d</span>
                ${v.hinted ? '<br><span class="intel">Intel unreliable</span>' : ''}</span>
              <span class="row__meta"><strong>${money(v.pay)}</strong><br>until day ${j.expiresDay}</span>
            </button>
          </li>`;
        }).join('')}
      </ul>
      ${renderClients()}
    </section>`;
}

function renderClients() {
  return `
      <h2>Clients</h2>
      <ul class="list list--plain">
        ${CLIENTS.map((c) => {
          const t = trustOf(state, c.id);
          return `<li class="clientrow"><span><strong>${esc(c.name)}</strong><br><span class="muted small">${esc(c.desc)}</span></span>
            <span class="trust trust--${t >= 60 ? 'good' : t >= 40 ? 'mid' : 'bad'}">${esc(trustLabel(t))}<br><span class="small">${t}/100</span></span></li>`;
        }).join('')}
      </ul>
      <p class="muted small">Finished jobs build trust; aborts and "client unhappy" choices cost it. High trust pays up to 15% more; below 20, a client stops calling. Trust drifts back towards neutral each week.</p>`;
}

function renderPlan() {
  const job = state.jobs.find((j) => j.id === plan.jobId);
  if (!job) { plan = null; return renderJobs(); }
  const v = jobView(state, job);
  const t = v.tpl;
  const freelancers = state.freelancers ?? [];
  const picked = [...state.crew, ...freelancers.map(freelancerAsCrew)].filter((o) => plan.crew.includes(o.id));
  const read = assessJob({ ...t, threat: v.threat }, picked, plan.approach);
  const most = maxCrew(t.crewSize);
  const full = plan.crew.length >= most;

  return `
    <section class="panel">
      <button class="btn btn--ghost" data-action="back">← Jobs</button>
      <h1>${esc(t.name)}</h1>
      <p class="muted">${esc(districtName(t.district))} · threat ${threatHtml(v)} · pays ${money(v.pay)} · crew away ${t.days}d · +${t.heat} heat</p>
      <p class="body">${esc(t.brief)}</p>
      <div class="riskcard">
        <p><strong>Client:</strong> ${clientLine(v)}</p>
        ${v.client ? `<p class="muted small">${esc(v.client.desc)}</p>` : ''}
        ${v.threatDelta ? `<p class="muted small">Every roll on this job is ${v.threatDelta > 0 ? 'one point harder' : 'one point easier'} than usual.</p>` : ''}
        ${v.hinted ? '<p class="intel">Intel unreliable: something about this job may not be what you were told.</p>' : ''}
      </div>

      <h2>Crew (${plan.crew.length} picked · ${t.crewSize} recommended, up to ${most})</h2>
      ${(() => { const r = crewSizeRead(plan.crew.length, t.crewSize); return `<p class="sizebadge sizebadge--${r.level} ${r.penalty >= 2 ? 'is-severe' : ''}">${esc(r.text)}</p>`; })()}
      <p class="muted small">Matters most: ${t.keyStats.join(', ')}. * includes a trait bonus.</p>
      <p class="muted small">Each person short of ${t.crewSize}: −1 on every roll. A second person within 3 of whoever rolls backs them up: +1.</p>
      <ul class="list">
        ${state.crew.map((op) => {
          const a = availability(state, op);
          const on = plan.crew.includes(op.id);
          const disabled = !a.ok || (!on && full);
          const keys = t.keyStats.map((s) => `${s.slice(0, 3)} ${ratedStat(op, s)}${traitMods(op)[s] ? '*' : ''}`).join(' · ');
          return `
          <li>
            <button class="row pick ${on ? 'is-on' : ''}" data-action="toggle-crew" data-id="${esc(op.id)}" ${disabled ? 'disabled' : ''} aria-pressed="${on}">
              <span class="pick__box">${on ? '✓' : ''}</span>
              ${badge(op, 'sm')}
              <span class="row__main"><strong>${esc(op.handle)}</strong> <span class="muted">${esc(op.role)}</span><br><span class="muted small">${esc(keys)}</span></span>
              <span class="row__meta">${esc(a.reason)}</span>
            </button>
          </li>`;
        }).join('')}
      </ul>

      ${renderFreelancers(t, freelancers, full)}

      ${renderMentoring(picked)}

      <h2>Approach</h2>
      <div class="segmented">
        ${Object.entries(APPROACHES).map(([k, a]) => `
          <button class="seg ${plan.approach === k ? 'is-on' : ''}" data-action="approach" data-id="${k}" aria-pressed="${plan.approach === k}">
            <strong>${esc(a.name)}</strong><span>${esc(a.desc)}</span>
          </button>`).join('')}
      </div>

      <h2>Risk read</h2>
      <div class="riskcard">
        ${riskBadge(read.level)}
        <ul>${read.reasons.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>
      </div>

      <button class="btn btn--primary btn--block" data-action="start-job" ${plan.crew.length ? '' : 'disabled'}>
        ${plan.crew.length ? `Start the job with ${plan.crew.length}` : 'Pick at least one operative'}
      </button>
    </section>`;
}

// --- mission -----------------------------------------------------------
function choiceButton(c, action) {
  return `
    <button class="choice" data-action="${action}" data-id="${esc(c.id)}" ${c.available ? '' : 'disabled'}>
      <span class="choice__label">${esc(c.label)}</span>
      ${c.available
        ? `<span class="choice__meta">${riskBadge(c.risk)} ${esc(c.riskReason ?? '')}${c.cost ? ` <span class="choice__cost">Cost: ${esc(c.cost)}</span>` : ''}</span>`
        : `<span class="choice__meta muted">${esc(c.reason)}</span>`}
    </button>`;
}

/** Stable pick from a list of lines, so the same rise always reads the same. */
function pickLine(lines, key) {
  let h = 0;
  for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return lines[h % lines.length];
}

/** Level-up cards for a job report: one per operative who improved, a bigger one for graduations. */
function levelUpCards(r) {
  const growth = r.growth ?? [];
  if (growth.some((g) => typeof g === 'string')) return `<p>Improved: ${esc(growth.join(', '))}</p>`; // reports from older saves
  const opFor = (id, fallback) => state.crew.find((o) => o.id === id) ?? fallback;
  const grads = (r.graduated ?? []).map((g) => {
    const op = opFor(g.id, g);
    return `
      <div class="levelcard levelcard--grad">
        ${badge(op, 'lg')}
        <div>
          <p class="levelcard__kicker">★ Graduated</p>
          <p class="levelcard__title">${esc(op.handle)}: rookie → pro</p>
          <p class="levelcard__line">${esc(pickLine(GRADUATION_LINES, op.id).replace('{name}', op.handle))}</p>
        </div>
      </div>`;
  }).join('');
  const byOp = new Map();
  for (const g of growth) byOp.set(g.opId, [...(byOp.get(g.opId) ?? []), g]);
  const cards = [...byOp].map(([id, rises]) => {
    const op = opFor(id, { id, name: rises[0].handle, handle: rises[0].handle });
    const rows = rises.map((g) => `
          <li><span class="levelcard__stat">▲ ${esc(statName(g.stat))} ${g.from} → ${g.to}</span>
          <span class="levelcard__line">${esc(pickLine(GROWTH_LINES[g.stat] ?? ['{name} is improving.'], `${id}${g.stat}${g.to}`).replace('{name}', op.handle))}</span></li>`).join('');
    return `
      <div class="levelcard">
        ${badge(op)}
        <div><p class="levelcard__title">${esc(op.handle)}</p><ul class="levelcard__rows">${rows}</ul></div>
      </div>`;
  }).join('');
  return grads || cards ? `<div class="levelcards">${grads}${cards}</div>` : '';
}

function renderMission() {
  const am = state.activeMission;
  const t = templateById(am.templateId);
  const crewOps = am.crewIds.map((id) => state.crew.find((o) => o.id === id) ?? state.memorial.find((o) => o.id === id)).filter(Boolean);
  const crewNames = crewOps.map((o) => o.handle).join(', ');

  const log = am.log.map((e) => `<p class="log log--${esc(e.kind)}">${esc(e.text)}</p>`).join('');
  let action = '';

  if (am.done) {
    const r = am.result;
    const title = r.outcome === 'loss' ? 'Someone didn\'t come home' : r.outcome === 'aborted' ? 'Job aborted' : 'Job done';
    action = `
      <div class="resultcard resultcard--${esc(r.outcome)}">
        <h2>${esc(title)}</h2>
        <p>Paid ${money(r.pay)} · Heat +${r.heatGain}</p>
        ${r.injuries.length ? `<p>Injured: ${esc(r.injuries.join(', '))}</p>` : '<p>Nobody hurt.</p>'}
        ${r.deaths.length ? `<p><strong>Lost: ${esc(r.deaths.join(', '))}.</strong> Their names go on the wall.</p>` : ''}
        ${levelUpCards(r)}
        ${(r.freelance ?? []).map((f) => `<p class="muted">Freelancer ${esc(f.handle)} took ${money(f.cut)}.</p>`).join('')}
        ${r.client && r.trustChange ? `<p>${esc(r.client)}: trust ${r.trustChange > 0 ? '+' : ''}${r.trustChange}</p>` : ''}
        <button class="btn btn--primary btn--block" data-action="close-mission">Back to the safehouse</button>
      </div>`;
  } else if (am.critical) {
    const v = describeCritical(state);
    action = `
      <div class="crisis crisis--critical">
        <p class="crisis__title">${esc(v.op.handle)} is critical</p>
        <p>${v.stabiliseFailed ? 'Stabilising failed. You have to decide now.' : `${esc(v.op.name)} is bleeding out. What do you do?`}</p>
        <div class="choices">${v.choices.map((c) => choiceButton(c, 'critical')).join('')}</div>
      </div>`;
  } else if (currentStep(am)?.type === 'crisis') {
    const v = describeCrisis(state);
    action = `
      <div class="crisis">
        <p class="crisis__title">Crisis</p>
        <p>${esc(v.text)}</p>
        <div class="choices">${v.choices.map((c) => choiceButton(c, 'choose')).join('')}</div>
      </div>`;
  } else {
    action = `<button class="btn btn--primary btn--block" data-action="beat">${am.log.length ? 'Next' : 'Begin'}</button>`;
  }

  return `
    <section class="panel mission">
      <p class="muted small">On the job · ${esc(APPROACHES[am.approach]?.name ?? '')} approach · ${esc(crewNames)}</p>
      <div class="crewstrip">${crewOps.map((o) => badge(o, 'sm')).join('')}</div>
      <h1>${esc(t.name)}</h1>
      <div class="mission__log">${log || `<p class="body muted">${esc(t.brief)}</p>`}</div>
      ${action}
      <div class="mission-end"></div>
    </section>`;
}

// --- save --------------------------------------------------------------
const DIFFICULTIES = {
  story: { name: 'Story', desc: 'Nobody dies. Critical operatives always pull through.' },
  standard: { name: 'Standard', desc: 'Death only if you choose "push on". Backups can be restored.' },
  ironman: { name: 'Ironman', desc: 'As Standard, but no going back: no backups to restore, and older save files are refused.' },
};

function renderSettings() {
  const slots = listSlots();
  const active = getActiveSlot();
  const backup = state.difficulty === 'ironman' ? null : loadBackup();
  const lastExport = state.lastBackupDay ? `day ${state.lastBackupDay} (${state.day - state.lastBackupDay} days ago)` : 'never';

  const picker = newGameSlot ? `
      <div class="riskcard">
        <h2 class="nomargin">New game in slot ${newGameSlot}</h2>
        <div class="segmented">
          ${Object.entries(DIFFICULTIES).map(([k, d]) => `
            <button class="seg" data-action="difficulty" data-id="${k}"><strong>${esc(d.name)}</strong><span>${esc(d.desc)}</span></button>`).join('')}
        </div>
        <button class="btn btn--ghost" data-action="cancel-new">Cancel</button>
      </div>` : '';

  return `
    <section class="panel">
      <h1>Save</h1>
      <p class="body">The game saves automatically after every action, in this browser only.</p>

      <h2>Slots</h2>
      <ul class="list">
        ${slots.map((sl) => `
          <li class="slot ${sl.slot === active ? 'is-active' : ''}">
            <div class="slot__info">
              <strong>Slot ${sl.slot}${sl.slot === active ? ' · playing' : ''}</strong>
              <span class="muted small">${sl.empty ? 'Empty' : `${esc(DIFFICULTIES[sl.difficulty]?.name ?? sl.difficulty)} · day ${sl.day} · ${money(sl.cash)} · ${sl.crew} crew`}</span>
            </div>
            <div class="slot__actions">
              ${!sl.empty && sl.slot !== active ? `<button class="btn" data-action="slot-load" data-id="${sl.slot}">Play</button>` : ''}
              <button class="btn" data-action="slot-new" data-id="${sl.slot}">New</button>
              ${!sl.empty && sl.slot !== active ? `<button class="btn btn--danger" data-action="slot-delete" data-id="${sl.slot}">Delete</button>` : ''}
            </div>
          </li>`).join('')}
      </ul>
      ${picker}

      <h2>Backups</h2>
      <div class="riskcard">
        <p>Last exported: <strong>${lastExport}</strong>.${backupDue(state) ? ' <span class="warntext">Time for a backup.</span>' : ''}</p>
        <p class="muted small">Browsers can clear stored data, especially Safari on iPhone after about a week away. An exported file is the only safe copy.</p>
        <button class="btn btn--block" data-action="export">Export save file</button>
        <button class="btn btn--block" data-action="import">Load save file into this slot</button>
      </div>
      ${state.difficulty === 'ironman'
        ? '<p class="muted small">Ironman: no automatic backups, and older copies of this run are refused.</p>'
        : backup ? `
      <div class="riskcard">
        <p>Automatic backup: <strong>day ${backup.day}</strong> (taken at the start of each in-game week).</p>
        <button class="btn btn--block" data-action="restore-backup" ${backup.day === state.day ? 'disabled' : ''}>Restore backup from day ${backup.day}</button>
      </div>` : ''}

      <p class="muted small">Playing: ${esc(DIFFICULTIES[state.difficulty]?.name ?? state.difficulty)} · Save format v${state.version} · ${SLOT_COUNT} slots</p>
    </section>`;
}
