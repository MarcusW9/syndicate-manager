// UI layer: the only code that touches the DOM. Reads state, calls core
// functions, re-renders. Tap/click only; nothing depends on hover.

import { NAMES } from '../config/names.js';
import { DISTRICTS } from '../data/districts.js';
import { DISTRICT_CARDS, FACTIONS, STREET_FACTS, HISTORY } from '../data/city.js';
import { MISSIONS } from '../data/missions.js';
import { TRAITS } from '../data/traits.js';
import { PARTNER } from '../data/partner.js';
import { jossIcon, portrait } from './art.js';
import { cityMapSvg, MAP_DISTRICTS } from './citymap.js';

import { advanceDay, calendar, formatShortDate, isBlocked, seasonStartDay } from '../core/time.js';
import { createNewGame } from '../core/state.js';
import { templateById, jobView, nextUnlock } from '../core/jobs.js';
import { trustLabel, clientById, trustOf } from '../core/clients.js';
import { CLIENTS } from '../data/clients.js';
import { availability, APPROACHES, traitMods, ratedStat, maxCrew, crewSizeRead } from '../core/crew.js';
import { assessJob, rollTarget, successChance, riskLabel } from '../core/risk.js';
import { resolveDecision } from '../core/decisions.js';
import { WATCHED_PENALTY, HEAT_NOTICE_AT, HEAT_MAX, heatChoices } from '../core/heat.js';
import { activeRumour } from '../core/rumours.js';
import { alerts, upcoming } from '../core/upcoming.js';
import { money } from '../core/money.js';
import {
  startMission, chooseOption, resolveCritical, closeMission,
  describeCrisis, describeCritical, currentStep, fillBrief, describePending, resolvePending, CALL_IN,
} from '../core/mission.js';
import { sendOff, ORDERS, handsOffAllowed, autoStep, needsPlayer } from '../core/autorun.js';
import { OVERWATCH_KIT, ALERT_MAX } from '../core/incidents.js';
import { EARNED_TRAITS } from '../data/earnedTraits.js';
import { earnedText } from '../core/earned.js';
import { sideTaskById, sideOdds, sendOnSideTask, sideReward, sideCost, sidePitch, intelFor } from '../core/sidetasks.js';
import {
  saveGame, loadGame, exportSave, importSave, listSlots, getActiveSlot, setActiveSlot,
  deleteSlot, loadBackup, backupDue, SLOT_COUNT,
} from '../save/save.js';
import { hire, haggle, passRecruit, canHire, signingFee, nextExpansion, expandSafehouse, STARTING_ROSTER_CAP } from '../core/recruits.js';
import { potentialRead, potentialTag, primaryStat, scoutFor, ageRate, declineChance, mentoring, changesSince, progressShare } from '../core/development.js';
import { GROWTH_LINES, GRADUATION_LINES } from '../data/growthLines.js';
import { freelancerAsCrew, shareOf, MAX_FREELANCERS_PER_JOB } from '../core/freelance.js';

let state;
let screen = 'inbox';
let cityDistrict = null; // district card open on the City screen
let cityTab = 'map'; // which City section is showing (CITY_TABS)
let cityCardDue = false; // scroll a newly opened district card into view after drawing
let openMessageId = null;
let sidePlan = null; // { taskId, crew: [] } while planning a side task (Jobs tab)
let playReportId = null; // a hands-off report playing out on its first open (renderReportTimeline)
let openOperativeId = null;
let openRecruitId = null;
let newGameSlot = null; // slot number while picking a difficulty
let plan = null; // { jobId, crew: [...ids], approach, orders, callIn, overwatch: id|null, kit } (core/mission.js startMission)
let root;
// Continue rests briefly after each new day, so a double click can't skip one.
const CONTINUE_REST_MS = 800;
let continueRestUntil = 0;
let dayCue = null; // what the day that just started brought; shown once, on the next render
let focusNext = null; // { action, id }: the control to focus after the next render (going back to a list)

export function mountApp(el, initialState) {
  root = el;
  state = initialState;
  root.addEventListener('click', onClick);
  // Map districts are SVG groups, not buttons: let Enter and Space open them too.
  root.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches?.('g[data-action]')) { e.preventDefault(); onClick(e); }
  });
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
    case 'nav': screen = id; openMessageId = null; openOperativeId = null; openRecruitId = null; plan = null; sidePlan = null; break;
    case 'continue': {
      if (isBlocked(state) || Date.now() < continueRestUntil) return;
      const next = advanceDay(state);
      dayCue = dayCueFor(state, next);
      continueRestUntil = Date.now() + CONTINUE_REST_MS;
      setTimeout(wakeContinue, CONTINUE_REST_MS);
      return setState(next);
    }
    case 'city-district': cityDistrict = cityDistrict === id ? null : id; cityCardDue = !!cityDistrict; break;
    case 'city-tab': cityTab = id; break;
    case 'open-message': {
      openMessageId = id;
      const msg = state.inbox.find((m) => m.id === id);
      // A hands-off report you haven't read plays out once: you didn't watch that job.
      if (msg?.type === 'report' && !msg.read && msg.timeline?.orders) playReportId = id;
      if (msg && !msg.read) { msg.read = true; saveGame(state); }
      break;
    }
    case 'back':
      // Land keyboard focus back on the row that was opened.
      focusNext = openMessageId ? { action: 'open-message', id: openMessageId }
        : openRecruitId ? { action: 'open-recruit', id: openRecruitId }
        : openOperativeId ? { action: 'open-op', id: openOperativeId }
        : plan ? { action: 'open-job', id: plan.jobId }
        : sidePlan ? { action: 'open-side', id: sidePlan.taskId } : null;
      openMessageId = null; openOperativeId = null; openRecruitId = null; plan = null; sidePlan = null;
      break;
    case 'decide': return setState(resolveDecision(state, id, t.dataset.option));
    case 'open-op': openOperativeId = id; break;
    case 'open-recruit': openRecruitId = id; break;
    case 'hire': openRecruitId = null; return setState(hire(state, id));
    case 'haggle': return setState(haggle(state, id));
    case 'pass': openRecruitId = null; return setState(passRecruit(state, id));
    case 'expand':
      if (confirm(`Expand the safehouse for ${money(nextExpansion(state).cost)}? Rent goes up by ${money(nextExpansion(state).rentIncrease)} a week.`)) return setState(expandSafehouse(state));
      break;
    case 'open-job': screen = 'jobs'; plan = { jobId: id, crew: [], approach: 'stealth', orders: 'steady', callIn: 'risky', overwatch: null, kit: 'rifle' }; break; // also from Today's alerts
    case 'toggle-crew': {
      const tpl = templateById(state.jobs.find((j) => j.id === plan.jobId).templateId);
      const isF = (x) => (state.freelancers ?? []).some((f) => f.id === x);
      if (plan.overwatch === id) plan.overwatch = null; // inside or on overwatch, not both
      if (plan.crew.includes(id)) plan.crew = plan.crew.filter((x) => x !== id);
      else if (isF(id) && plan.crew.filter(isF).length >= MAX_FREELANCERS_PER_JOB) plan.crew = [...plan.crew.filter((x) => !isF(x)), id]; // swap freelancers
      else if (plan.crew.length < maxCrew(tpl.crewSize)) plan.crew = [...plan.crew, id];
      break;
    }
    case 'approach': plan.approach = id; break;
    case 'orders': plan.orders = id; break;
    case 'callin': plan.callIn = id; break;
    case 'overwatch': plan.overwatch = plan.overwatch === id ? null : id; plan.crew = plan.crew.filter((x) => x !== id); break;
    case 'kit': plan.kit = id; break;
    case 'open-side': sidePlan = { taskId: id, crew: [] }; break;
    case 'toggle-side-crew': {
      const task = sideTaskById(sidePlan.taskId);
      if (sidePlan.crew.includes(id)) sidePlan.crew = sidePlan.crew.filter((x) => x !== id);
      else if (sidePlan.crew.length < task.crew) sidePlan.crew = [...sidePlan.crew, id];
      else sidePlan.crew = [...sidePlan.crew.slice(1), id]; // full: swap the first pick out
      break;
    }
    case 'send-side': {
      const next = sendOnSideTask(state, sidePlan.taskId, sidePlan.crew);
      sidePlan = null;
      screen = 'inbox';
      return setState(next);
    }
    case 'send-job': {
      // Hands-off: the crew leaves now; their report comes back when they do (core/autorun.js).
      const next = sendOff(state, plan.jobId, plan.crew, plan.approach, plan.orders ?? 'steady', planOpts());
      plan = null;
      screen = 'inbox';
      openMessageId = null;
      return setState(next);
    }
    case 'skip-report': break; // tapping a report as it plays shows the end at once
    case 'start-job': {
      const next = startMission(state, plan.jobId, plan.crew, plan.approach, planOpts());
      plan = null;
      return setState(next);
    }
    case 'step': return setState(autoStep(state)); // the next thing the crew does on its own (core/autorun.js)
    case 'pending': return setState(resolvePending(state, id));
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
      // Every new game starts with five generated rookies (PLAN-PROGRESSION.md).
      const slot = newGameSlot;
      const difficulty = id;
      const taken = !listSlots()[slot - 1].empty;
      if (taken && !confirm(`Start a new ${difficulty} game in slot ${slot}? The game in that slot will be deleted.`)) break;
      deleteSlot(slot);
      setActiveSlot(slot);
      newGameSlot = null;
      screen = 'inbox'; plan = null; openMessageId = null; openOperativeId = null; openRecruitId = null;
      return setState(createNewGame({ difficulty, startCrew: 'fresh' }));
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

/** The planning screen's squad options for startMission / sendOff. */
const planOpts = () => ({ overwatch: plan.overwatch ? { id: plan.overwatch, kit: plan.kit } : null, callIn: plan.callIn ?? 'risky', orders: plan.orders ?? 'steady' });

function onChange(e) {
  if (e.target.id !== 'import-file' || !e.target.files[0]) return;
  importSave(e.target.files[0])
    .then((loaded) => { screen = 'inbox'; plan = null; setState(loaded); })
    .catch((err) => alert(`Could not load that file: ${err.message}`));
}

// --- helpers -----------------------------------------------------------
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const threatDots = (n) => '●'.repeat(n) + '○'.repeat(5 - n);
/** Threat with a marker when this offer is above or below the job's usual level. */
const threatHtml = (v) => `<span class="threat">${threatDots(v.threat)}</span>${v.threatDelta > 0 ? ' <span class="tag-up">hotter than usual</span>' : v.threatDelta < 0 ? ' <span class="tag-down">quieter than usual</span>' : ''}`;
const clientLine = (v) => v.client ? `${esc(v.client.name)} <span class="muted">(${esc(trustLabel(v.trust))})</span>` : '<span class="muted">Walk-in job</span>';
const riskBadge = (level) => `<span class="risk risk--${esc(level)}">${esc(level === 'safe' || level === 'certain' ? level : `${level} risk`)}</span>`;
/** Availability as a coloured chip: green ready, amber usable but worse off, red can't go, teal away on a job. */
function statusChip(a) {
  const tone = a.ok ? (a.reason === 'ready' ? 'ready' : 'worn') : a.reason.startsWith('away') ? 'away' : 'out';
  const back = /^away until day (\d+)$/.exec(a.reason);
  const n = back ? Number(back[1]) - state.day : 0;
  // The teal "away" colour already says they're out; the words say when they're back.
  const text = back ? (n <= 1 ? 'back tomorrow' : `back in ${n} days`) : a.reason;
  return `<span class="status status--${tone}">${esc(text)}</span>`;
}
/** Fatigue and morale as two small labelled bars for crew rows. */
const conditionBars = (op) => [['Fatigue', op.condition.fatigue, 'fatigue'], ['Morale', op.condition.morale, 'morale']]
  .map(([label, v, k]) => `<span class="minibar minibar--${k}" role="img" aria-label="${label} ${v}"><span class="minibar__label">${label}</span><span class="minibar__track"><span style="width:${Math.max(0, Math.min(100, v))}%"></span></span></span>`).join('');
/**
 * Key stats for a job, written out ("Medical 8 · Cool 5*"), each coloured by how it
 * measures up to this job's typical roll: green good, amber shaky, red weak.
 */
function keyStatsFor(op, tpl, threat) {
  const target = rollTarget({ ...tpl, threat });
  return tpl.keyStats.map((k) => {
    const v = ratedStat(op, k);
    const fit = { low: 'good', moderate: 'shaky', high: 'weak', extreme: 'weak' }[riskLabel(successChance(v, target))];
    return `<span class="fit fit--${fit}">${esc(statName(k))} ${v}${traitMods(op)[k] ? '*' : ''}</span>`;
  }).join(' · ');
}
/** How long something on offer lasts: it's still there on its last day. */
const daysLeft = (lastDay) => { const n = lastDay - state.day; return n <= 0 ? 'last day' : n === 1 ? '1 day left' : `${n} days left`; };
/** Heat as a small bar: green while quiet, amber, then red from the level that brings the fixer. */
function heatMeter() {
  const h = state.heat;
  const tone = h >= HEAT_NOTICE_AT ? 'high' : h >= 3 ? 'mid' : 'low';
  return `<span class="heat heat--${tone}"><span class="heat__track" aria-hidden="true"><span style="width:${(h / HEAT_MAX) * 100}%"></span></span>${h}/${HEAT_MAX}</span>`;
}
const districtName = (key) => NAMES.districts[key] ?? key;
const districtTurf = (key) => DISTRICTS[key]?.turf ? ` · ${esc(DISTRICTS[key].turf)}` : '';

/** Portrait in a cut-corner frame (crew list, profiles, the wall). Fallen faces are greyed. */
const face = (op, size = '') => `<span class="face ${size ? `face--${size}` : ''} ${op.cause ? 'is-fallen' : ''}">${portrait(op, { size: { sm: 32, lg: 104 }[size] ?? 48 })}</span>`;

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
    ${growth ? `<span class="nextbar" role="progressbar" aria-label="${esc(k)}: towards the next point" aria-valuenow="${Math.round(progressShare(op, k) * 100)}" aria-valuemin="0" aria-valuemax="100"><span style="width:${Math.round(progressShare(op, k) * 100)}%"></span></span>` : ''}
  </div>`;
}

// --- rendering ---------------------------------------------------------
function render() {
  // Every render replaces the page, so put keyboard focus back on the same control if it survives.
  const focused = document.activeElement?.closest?.('[data-action]');
  const refocus = focused && root.contains(focused) ? { action: focused.dataset.action, id: focused.dataset.id } : null;
  const blocked = isBlocked(state);
  const resting = Date.now() < continueRestUntil;
  const unread = state.inbox.filter((m) => !m.read).length;
  const cue = dayCue;
  dayCue = null;
  // Desktop pages use the full width; a running job stays a narrow reading column.
  const wide = !state.activeMission;
  // Phones: Continue sits above the tab bar, except while planning a job (its own bar
  // takes that place) and during a job (nothing to continue).
  const dock = !state.activeMission && !(screen === 'jobs' && plan);

  root.innerHTML = `
    <header class="topbar ${cue ? 'is-new-day' : ''}">
      ${renderWhen()}
      <div class="topbar__stats">
        <span class="stat stat--cash"><span class="stat__label">Cash</span> ${money(state.cash)}${cashDelta()}</span>
        <span class="stat"><span class="stat__label">Heat</span> ${heatMeter()}</span>
        <span class="tier">${esc(statName(state.tier))}<span class="tier__word"> tier</span></span>
      </div>
      ${renderContinue(blocked, resting, unread, 'topbar__continue')}
    </header>

    <nav class="nav" aria-label="Main">
      ${navButton('inbox', 'Today', unread, 'unread')}
      ${navButton('crew', 'Crew')}
      ${navButton('jobs', 'Jobs', state.jobs.length, 'open')}
      ${navButton('city', 'City')}
      ${navButton('settings', 'Save')}
    </nav>

    <main class="main ${wide ? 'main--wide' : ''}">${state.activeMission ? renderMission() : renderScreen()}</main>
    ${dock ? `<div class="dock">${renderContinue(blocked, resting, unread, 'dock__continue')}</div>` : ''}
    ${cue ? renderDayCue(cue) : ''}
    <input type="file" id="import-file" accept="application/json" hidden />
  `;
  if (state.activeMission) root.querySelector('.mission-end')?.scrollIntoView({ block: 'end' });
  if (cityCardDue) { cityCardDue = false; root.querySelector('.citycard')?.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); }
  const want = focusNext ?? refocus;
  focusNext = null;
  if (want) {
    // Continue is drawn twice (top bar and phone dock); take whichever one is showing.
    const shown = (el) => el.getClientRects().length > 0;
    const same = [...root.querySelectorAll(`[data-action="${want.action}"]`)].find((el) => el.dataset.id === want.id && shown(el));
    // The control is gone or hidden (a detail view replaced the list, as on phones):
    // start from that view's back button instead of losing focus to the top of the page.
    const back = same ? null : [...root.querySelectorAll('[data-action="back"]')].find(shown);
    (same ?? back)?.focus({ preventScroll: true });
  }
}

/** Date, a bar that fills across the week, and how long until Sunday's bills. */
function renderWhen() {
  const today = (state.day - 1) % 7; // 0 = Monday, 6 = Sunday (bills)
  const toBills = 6 - today;
  const bills = toBills === 0 ? 'bills paid today' : toBills === 1 ? 'bills tomorrow' : `bills in ${toBills} days`;
  const cells = Array.from({ length: 7 }, (_, i) =>
    `<span class="week__day ${i < today ? 'is-done' : i === today ? 'is-today' : ''} ${i === 6 ? 'is-bills' : ''}"></span>`).join('');
  return `<div class="topbar__when">
      <div class="topbar__date">${esc(formatShortDate(state.day))}</div>
      <div class="week" role="img" aria-label="Day ${today + 1} of 7 this week">${cells}</div>
      <div class="week__note">Day ${state.day} · ${bills}</div>
    </div>`;
}

/** Today's cash change, e.g. "▲¥1,050". Nothing on a day the cash hasn't moved. */
function cashDelta() {
  const d = state.cash - (state.dayStartCash ?? state.cash);
  if (!d) return '';
  return ` <span class="delta ${d < 0 ? 'is-down' : ''}" aria-label="${d < 0 ? 'down' : 'up'} ${money(Math.abs(d))} today">${d < 0 ? '▼' : '▲'}${money(Math.abs(d))}</span>`;
}

/** Continue names the next day and lists what's still waiting; it never asks for a second tap. */
function renderContinue(blocked, resting, unread, where) {
  const label = state.activeMission ? 'On a job' : blocked ? 'Decision needed'
    : `Continue → ${calendar(state.day + 1).weekday}`;
  const waiting = [
    unread ? `${unread} unread` : '',
    state.jobs.length ? `${state.jobs.length} job${state.jobs.length === 1 ? '' : 's'} open` : '',
  ].filter(Boolean).join(' · ');
  const hint = !blocked && waiting ? `<span class="continue__hint">${esc(waiting)}</span>` : '';
  return `<button class="btn btn--primary continue ${where} ${resting && !blocked ? 'is-resting' : ''}" data-action="continue" ${blocked || resting ? 'disabled' : ''}>
      <span class="continue__label">${esc(label)}</span>${hint}
    </button>`;
}

/** Re-enable Continue once its rest is over, without a full re-render. */
function wakeContinue() {
  if (isBlocked(state) || Date.now() < continueRestUntil) return;
  const btns = [...root.querySelectorAll('.continue')];
  for (const btn of btns) { btn.disabled = false; btn.classList.remove('is-resting'); }
  const shown = btns.find((b) => b.getClientRects().length);
  if (shown && document.activeElement === document.body) shown.focus({ preventScroll: true }); // focus was on it before the rest
}

/** What changed overnight: new messages, new jobs, cash moved by the day's tick. */
function dayCueFor(before, after) {
  const known = new Set(before.inbox.map((m) => m.id));
  const knownJobs = new Set(before.jobs.map((j) => j.id));
  return {
    day: after.day,
    messages: after.inbox.filter((m) => !known.has(m.id)).length,
    jobs: after.jobs.filter((j) => !knownJobs.has(j.id)).length,
    cash: after.cash - before.cash,
  };
}

function renderDayCue(cue) {
  const plural = (n, word) => `${n} new ${word}${n === 1 ? '' : 's'}`;
  const parts = [
    cue.messages ? plural(cue.messages, 'message') : '',
    cue.jobs ? plural(cue.jobs, 'job') : '',
    cue.cash ? `cash ${cue.cash < 0 ? '▼' : '▲'}${money(Math.abs(cue.cash))}` : '',
  ].filter(Boolean);
  return `<div class="daycue" role="status">
      <strong>${esc(calendar(cue.day).weekday)} · Day ${cue.day}</strong>
      <span>${esc(parts.length ? parts.join(' · ') : 'A quiet day.')}</span>
    </div>`;
}

function navButton(id, label, count = 0, countWord = '') {
  const pill = count ? ` <span class="pill ${id === 'inbox' ? 'pill--new' : ''}" aria-label="${count} ${countWord}">${count}</span>` : '';
  return `<button class="nav__btn ${screen === id ? 'is-active' : ''}" data-action="nav" data-id="${id}">${esc(label)}${pill}</button>`;
}

function renderScreen() {
  if (screen === 'inbox') return renderInbox();
  if (screen === 'crew') return openRecruitId ? renderRecruit() : openOperativeId ? renderOperative() : renderCrew();
  if (screen === 'jobs') return plan ? renderPlan() : sidePlan ? renderSidePlan() : renderJobs();
  if (screen === 'city') return renderCity();
  if (screen === 'settings') return renderSettings();
  return '';
}

// --- inbox -------------------------------------------------------------
function backupBanner() {
  if (!backupDue(state)) return '';
  return `<div class="banner"><span>${state.lastBackupDay ? `No backup for ${state.day - state.lastBackupDay} days.` : 'You have never backed up this save.'}</span>
    <button class="btn" data-action="export">Export now</button></div>`;
}

/**
 * Today: the week ahead in a slim strip across the top, then alerts (only when something
 * needs you) and the inbox. Phones show that, or one open message without the strip.
 * Wide screens keep the strip and put the open message beside the inbox (styles.css).
 */
function renderInbox() {
  const open = state.inbox.find((m) => m.id === openMessageId);
  const list = state.inbox.length ? `
        <ul class="list">
          ${state.inbox.map((m) => `
            <li>
              <button class="row ${m.read ? 'is-read' : 'is-unread'} ${m === open ? 'is-open' : ''}" data-action="open-message" data-id="${esc(m.id)}">
                ${m.read ? '' : '<span class="dot" aria-label="Unread"></span>'}
                <span class="row__tag tag--${esc(m.type)}">${esc(m.type)}</span>
                <span class="row__main row__main--clip">${esc(m.subject)}${m.body ? `<span class="preview">${esc(m.body)}</span>` : ''}</span>
                <span class="row__meta">Day ${m.day}</span>
              </button>
            </li>`).join('')}
        </ul>` : '<p class="muted">Nothing new. Press Continue.</p>';
  return `
    ${backupBanner()}
    ${renderUpcoming(open ? 'upcoming--strip has-open' : 'upcoming--strip')}
    <div class="inbox ${open ? 'has-open' : ''}">
      <div class="inbox__side">
        <section class="panel inbox__list">
          <h1>Today</h1>
          ${renderBriefing()}
          ${list}
        </section>
      </div>
      <section class="panel inbox__detail">
        ${open ? renderMessage(open) : '<p class="muted inbox__empty">Tap a message to read it here.</p>'}
      </section>
    </div>`;
}

/** "A, B and C". */
const andList = (xs) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs.at(-1)}`);
/** Fill a line's {slots}; a slot with no value is left as written so a gap shows up in testing. */
const fillLine = (line, data) => line.replace(/\{(\w+)\}/g, (m, k) => (data[k] ?? m));

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
      case 'crew-out': return [say('crew-out', { names: andList(a.names) }), 'nav', 'crew'];
      default: return null;
    }
  };
  const has = (k) => list.some((a) => a.kind === k);
  const c = calendar(state.day);
  const mood = state.day === 1 ? 'first' : has('decision') ? 'decision' : has('broke') ? 'broke'
    : has('bills-short') ? 'short' : has('crew-out') ? 'hurt' : c.isSunday ? 'sunday' : c.isMonday ? 'monday' : 'quiet';
  const opener = pickLine(PARTNER.moods[mood], `${state.day}-${mood}`);
  const face = { broke: 'worried', short: 'worried', hurt: 'worried', sunday: 'smug', first: 'happy', quiet: 'happy' }[mood] ?? 'neutral';
  return `
    <div class="joss">
      <span class="joss__badge">${jossIcon({ mood: face, size: 32 })}</span>
      <div class="joss__body">
        <span class="joss__name">${esc(NAMES.partner)}</span>
        <p class="joss__line">${esc(opener)}</p>
      </div>
    </div>
    ${list.length ? `<ul class="alerts">${list.map((a) => {
      const [text, action, id] = line(a) ?? [];
      return text ? `<li><button class="alert alert--${a.tone}" data-action="${action}" data-id="${esc(id)}">${esc(text)} <span aria-hidden="true">›</span></button></li>` : '';
    }).join('')}</ul>` : ''}`;
}

/** The week ahead, one cell per day with a line per thing the game will do. */
function renderUpcoming(where) {
  const items = upcoming(state);
  const when = (day) => {
    const n = day - state.day;
    const wd = calendar(day).weekday;
    return n === 1 ? 'Tomorrow' : n === 7 ? `Next ${wd}` : wd;
  };
  const text = (i) => {
    switch (i.kind) {
      case 'season': return `Season ${i.season} begins: everyone a year older`;
      case 'board': return 'New freelancers and street talk';
      case 'scout': return 'Scout report: new leads';
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
  };
  // Jobs ending the same day share one line.
  for (const d of new Set(items.filter((i) => i.kind === 'job-last').map((i) => i.day))) {
    const same = items.filter((i) => i.kind === 'job-last' && i.day === d);
    same[0].names = same.map((i) => i.name);
    for (const i of same.slice(1)) items.splice(items.indexOf(i), 1);
  }
  const days = [...new Set(items.map((i) => i.day))];
  return `
    <section class="panel upcoming ${where}">
      <h2 class="upcoming__title">Coming up</h2>
      <ul class="upcoming__days">
        ${days.map((d) => `
          <li class="upcoming__day">
            <span class="upcoming__when">${esc(when(d))}</span>
            <ul class="upcoming__items">${items.filter((i) => i.day === d).map((i) => `<li class="${i.kind === 'bills' && state.cash < i.total ? 'is-short' : ''}">${esc(text(i))}</li>`).join('')}</ul>
          </li>`).join('')}
      </ul>
    </section>`;
}

function renderMessage(m) {
  // The welcome message points a new player at their first job.
  const jobLink = (m.type === 'job' || m.id === 'welcome') && state.jobs.length ? `<button class="btn" data-action="nav" data-id="jobs">Open the job board</button>`
    : m.type === 'scout' && (state.recruits ?? []).length ? `<button class="btn" data-action="nav" data-id="crew">See the leads</button>` : '';
  return `
      <button class="btn btn--ghost inbox__back" data-action="back">← Today</button>
      <h1>${esc(m.subject)}</h1>
      <p class="muted">${esc(m.type)} · Day ${m.day}</p>
      ${m.type === 'report' ? renderReportTimeline(m) : `<p class="body">${esc(m.body)}</p>`}
      ${m.kind === 'renewal' ? renderRenewal(m) : ''}
      ${m.kind === 'heat' ? renderHeatNotice(m) : ''}
      ${jobLink}`;
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
  const end = { completed: ['✓', 'Job done'], aborted: ['↩', 'Aborted'], loss: ['✕', 'Someone didn\'t come home'], setback: ['✗', 'Went badly'] }[result] ?? ['■', 'How it ended'];
  // Played once: each step lands in turn down the rail, then the result, then Joss and the summary.
  const play = m.id === playReportId;
  if (play) playReportId = null;
  const STEP = 0.8; // seconds per step
  return `
    <div class="report ${play ? 'report--play' : ''}" ${play ? `data-action="skip-report" style="--step:${STEP}s; --end:${(steps.length + 1) * STEP + 0.6}s"` : ''}>
      ${renderReportSummary(m.timeline)}
      <ol class="timeline">
        ${steps.map((text, i) => `<li class="timeline__item" style="--i:${i}"><span class="timeline__node" aria-hidden="true">${i + 1}</span><p class="timeline__text">${esc(text)}</p></li>`).join('')}
        ${outcome.length ? `<li class="timeline__item timeline__item--end timeline__item--${esc(result ?? 'plain')}" style="--i:${steps.length}">
          <span class="timeline__node" aria-hidden="true">${end[0]}</span>
          <div class="timeline__text"><p class="timeline__label">${esc(end[1])}</p>
            <ul class="timeline__results">${outcome.map((o, i) => `<li class="tone--${esc(o.tone)}" style="--r:${i}">${esc(o.text)}</li>`).join('')}</ul></div>
        </li>` : ''}
      </ol>
      ${m.timeline?.side ? rollDetail(m.timeline.side) : ''}
      ${renderFullLog(m.timeline)}
    </div>`;
}

/** Joss's opener and what the run came down to (core/report.js). Headings with nothing behind them are left out. */
function renderReportSummary(t) {
  const sum = t?.summary;
  if (!sum) return '';
  const orders = t.orders && ORDERS[t.orders] ? `<p class="muted small">Hands-off · ${esc(ORDERS[t.orders].name)} orders</p>`
    : t.callIn && t.callIn !== 'every' && ORDERS[t.liveOrders] ? `<p class="muted small">Called in ${esc(CALL_IN[t.callIn].name.toLowerCase())} · ${esc(ORDERS[t.liveOrders].name)} orders decided the rest</p>` : '';
  const rows = [
    sum.turning && ['Turning point', sum.turning.text],
    sum.standout && ['Standout', sum.standout.text],
    sum.hurt?.length && ['What hurt us', sum.hurt.join(' ')],
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
  let onJob = false;
  const items = events.map((e, i) => {
    let head = '';
    if (e.kind === 'beat' && e.first) head = '<h3 class="flog__phase">Approach</h3>';
    else if (e.kind === 'beat' && e.last && i === lastBeat) head = '<h3 class="flog__phase">Getting out</h3>';
    else if (!onJob && e.kind !== 'beat') { onJob = true; head = '<h3 class="flog__phase">On the job</h3>'; }
    if (e.kind !== 'beat') onJob = true;
    const body = {
      beat: () => `<p class="flog__beat">${esc(e.text)}</p>`,
      twist: () => `<p class="flog__twist">Twist: ${esc(e.text)}</p>`,
      aftermath: () => `<p class="flog__line ${e.death ? 'tone--bad' : 'tone--good'}">${esc(e.text)}</p>`,
      critical: () => `
        <div class="flog__step">
          <p class="flog__crisis">${esc(e.patient)} is critical.</p>
          ${e.why ? `<p class="flog__why">${esc(e.why)}</p>` : ''}
          <p class="flog__line ${e.action === 'push' || e.success === false ? 'tone--bad' : 'tone--good'}">${esc(e.report)}</p>
          ${rollDetail(e)}
        </div>`,
    }[e.kind] ?? (() => `
        <div class="flog__step">
          <p class="flog__crisis">${esc(e.text)}</p>
          <p class="flog__choice">${e.actor && !e.choice.startsWith(e.actor.handle) ? `<strong>${esc(e.actor.handle)}</strong> · ` : ''}${esc(e.choice)}</p>
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
        <dl class="stats">
          <div><dt>Current wage</dt><dd>${money(p.current)}</dd></div>
          <div><dt>Asking</dt><dd>${money(p.ask)}</dd></div>
          <div><dt>Market value</dt><dd>${money(p.market)}</dd></div>
        </dl>
        <p class="muted small">Loyalty: ${p.jobs} job${p.jobs === 1 ? '' : 's'} with the crew, ${pct}% off the raise${pct >= 25 ? ' (the most loyalty buys)' : ''}.</p>
        ${p.haggleResult ? `<p class="muted">${esc(p.haggleResult)}</p>` : ''}
        ${p.outcome ? `<p><strong>${esc(p.outcome)}</strong></p>` : ''}
      </div>
      ${m.resolved ? '' : `<div class="stack">
        ${m.options.map((o) => `<button class="btn ${o.id === 'accept' ? 'btn--primary' : o.id === 'refuse' ? 'btn--ghost' : ''}" data-action="decide" data-id="${esc(m.id)}" data-option="${esc(o.id)}" ${o.disabled ? 'disabled' : ''}>${esc(o.id === 'accept' ? `Accept ${money(p.ask)} a week` : o.label)}</button>`).join('')}
        <p class="muted small">Refusing: they stay, but their head isn't in it for four weeks (−1 on their rolls), then they ask again.</p>
      </div>`}`;
}

/** Fixer notice at high heat: pay to cool it, or let it ride (the next job's first crisis roll is −1). */
function renderHeatNotice(m) {
  const p = m.payload;
  const short = heatChoices(state, m)[0].disabled;
  return `
      <div class="riskcard">
        <dl class="stats">
          <div><dt>Heat</dt><dd>${state.heat}/10</dd></div>
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

// --- crew --------------------------------------------------------------
function renderCrew() {
  const cap = state.rosterCap ?? STARTING_ROSTER_CAP;
  const x = nextExpansion(state);
  const recruits = state.recruits ?? [];
  const wall = state.memorial.length ? `
      <h2>The wall</h2>
      <ul class="list list--plain">
        ${state.memorial.map((m) => `<li class="fallen">${face(m, 'sm')}<span><strong>${esc(m.name)}</strong> "${esc(m.handle)}" <span class="muted">· ${esc(m.role)} · ${esc(m.cause)}, day ${m.day}</span></span></li>`).join('')}
      </ul>` : '';
  const leads = `
      <h2>Leads (${recruits.length})</h2>
      ${recruits.length ? `<ul class="list">
        ${recruits.map((r) => `
          <li>
            <button class="row" data-action="open-recruit" data-id="${esc(r.id)}">
              ${face(r)}
              <span class="row__main"><strong>${esc(r.name)}</strong> "${esc(r.handle)}"<br><span class="muted">${esc(r.quality)} ${esc(r.role)} · ${r.age}</span></span>
              <span class="row__meta"><strong>${money(r.wage)}</strong>/wk<br>${daysLeft(r.expiresDay)}</span>
            </button>
          </li>`).join('')}
      </ul>` : '<p class="muted small">No leads right now. Scouts report every Wednesday.</p>'}`;
  return `
    <section class="panel">
      <div class="crewhead">
        <h1>Crew</h1>
        <span class="muted">${state.crew.length}/${cap} beds</span>
      </div>
      <ul class="list list--cols">
        ${state.crew.map((op) => `
          <li>
            <button class="row crewrow" data-action="open-op" data-id="${esc(op.id)}">
              ${face(op)}
              <span class="crewrow__name"><strong>${esc(op.name)}</strong> "${esc(op.handle)}"</span>
              <span class="crewrow__info muted">${esc(op.tier ?? '')} ${esc(op.role)} · ${op.age}</span>
              <span class="crewrow__status">${statusChip(availability(state, op))}</span>
              <span class="crewrow__scout">${scoutLine(op)}${growthMarker(op)}</span>
              <span class="crewrow__bars">${conditionBars(op)}</span>
            </button>
          </li>`).join('')}
      </ul>
      <div class="cols2">
      <div>${leads}</div>
      <div>
      <h2>Safehouse</h2>
      <div class="riskcard">
        <p class="small">Level ${state.safehouseLevel ?? 1} · ${cap} beds · rent ${money(state.rent)}/wk</p>
        <button class="btn btn--block" data-action="expand" ${state.cash >= x.cost ? '' : 'disabled'}>
          Expand: +${x.beds} beds for ${money(x.cost)} (rent +${money(x.rentIncrease)}/wk)
        </button>
        ${state.cash < x.cost ? `<p class="muted small">Need ${money(x.cost - state.cash)} more.</p>` : ''}
      </div>
      </div>
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
        ${face(r, 'lg')}
        <div>
          <h1>${esc(r.name)} <span class="muted">"${esc(r.handle)}"</span></h1>
          <p class="muted">${esc(r.quality)} ${esc(r.role)} · ${r.age} · lead goes cold: ${daysLeft(r.expiresDay)}</p>
        </div>
      </div>
      <div class="opgrid">
      <div class="opgrid__about">
      <p class="body">${esc(r.origin)}</p>
      <p class="body muted">${esc(r.bio)}</p>

      <h2>Traits</h2>
      <ul class="chips">
        ${r.traits.map((t) => `<li class="chip"><strong>${esc(TRAITS[t]?.name ?? t)}</strong><span>${esc(TRAITS[t]?.desc ?? '')}</span></li>`).join('')}
      </ul>
      </div>

      <div class="opgrid__stats">
      <h2>Stats</h2>
      <dl class="stats">
        ${Object.keys(r.stats).map((k) => statCell(r, k)).join('')}
      </dl>
      </div>

      <div class="opgrid__dev">
      <h2>Scout's view</h2>
      <div class="riskcard">
        <p>${esc(r.scoutReport ?? 'Nobody has a read on them yet.')}</p>
        <p class="muted small">${esc(growthNote(r.age))} Opinions, not facts: scouts get it wrong sometimes.</p>
      </div>
      </div>

      <div class="opgrid__past">
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
      </div>
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
function renderFreelancers(t, threat, freelancers, full) {
  if (!freelancers.length) return '';
  return `
      <h2>Freelancers (up to ${MAX_FREELANCERS_PER_JOB})</h2>
      <p class="muted small">Hired for this job only. No wage: they take a share of what the job pays, and nothing if it pays nothing. They don't learn on your payroll.</p>
      <ul class="list">
        ${freelancers.map((f) => {
          const on = plan.crew.includes(f.id);
          return `
          <li>
            <button class="row pick ${on ? 'is-on' : ''}" data-action="toggle-crew" data-id="${esc(f.id)}" ${!on && full && !plan.crew.some((x) => freelancers.some((g) => g.id === x)) ? 'disabled' : ''} aria-pressed="${on}">
              <span class="pick__box">${on ? '✓' : ''}</span>
              ${face(f, 'sm')}
              <span class="row__main"><strong>${esc(f.handle)}</strong> <span class="muted">${esc(f.quality)} ${esc(f.role)}</span><br><span class="small">${keyStatsFor(f, t, threat)}</span></span>
              <span class="row__meta"><strong>${Math.round(shareOf(f) * 100)}%</strong> of pay<br>${daysLeft(f.expiresDay)}</span>
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
        ${face(op, 'lg')}
        <div>
          <h1>${esc(op.name)} <span class="muted">"${esc(op.handle)}"</span></h1>
          <p class="muted">${esc(op.tier ?? '')} ${esc(op.role)} · ${op.age} · ${money(op.wage)}/week</p>
          ${statusChip(availability(state, op))}
        </div>
      </div>
      <div class="opgrid">
      <div class="opgrid__about">
      <p class="body">${esc(op.bio)}</p>
      <p class="body muted">${esc(op.origin)}</p>

      <h2>Traits</h2>
      <ul class="chips">
        ${op.traits.map((t) => `<li class="chip"><strong>${esc(TRAITS[t]?.name ?? t)}</strong><span>${esc(TRAITS[t]?.desc ?? '')}</span></li>`).join('')}
      </ul>
      ${(op.earned ?? []).length ? `
      <h2>Earned on the job</h2>
      <ul class="chips">
        ${op.earned.map((e) => `<li class="chip chip--earned ${EARNED_TRAITS[e.id].kind === 'temporary' ? 'chip--temporary' : ''}"><strong>${esc(EARNED_TRAITS[e.id].name)}</strong><span>${esc(earnedText(state, e))}</span><span class="chip__when">${EARNED_TRAITS[e.id].kind === 'temporary' ? 'For now' : 'For good'} · since day ${e.day}</span></li>`).join('')}
      </ul>` : ''}
      </div>

      <div class="opgrid__stats">
      <h2>Stats</h2>
      <dl class="stats">
        ${Object.keys(op.stats).map((k) => statCell(op, k, { growth: true })).join('')}
      </dl>

      </div>

      <div class="opgrid__dev">
      <h2>Development</h2>
      <div class="riskcard">
        <p>${esc(potentialRead(op, scoutFor(state.crew, op.role, op.id)?.handle))}</p>
        <p class="muted small">${esc(growthNote(op.age))} Green and red numbers are this season's change; "career" is since joining. The thin bar under each stat fills towards the next point.</p>
      </div>

      <h2>Condition</h2>
      ${bar('Fatigue', c.fatigue)}${bar('Morale', c.morale)}${bar('Neural load', c.neuralLoad)}${bar('Burnout', c.burnout)}
      </div>

      <div class="opgrid__past">
      <h2>Trust</h2>
      <ul class="list list--plain">
        ${Object.entries(op.trust).map(([id, v]) => `<li>${esc(nameOf(id))}: ${v > 0 ? '+' : ''}${v}</li>`).join('') || '<li class="muted">No strong feelings yet.</li>'}
      </ul>

      ${op.history.length ? `<h2>History</h2><ul class="list list--plain">${op.history.slice(-8).reverse().map((h) => `<li class="muted">${esc(h)}</li>`).join('')}</ul>` : ''}
      </div>
      </div>
    </section>`;
}

// --- jobs and planning -----------------------------------------------------
function streetTalk() {
  const r = activeRumour(state);
  return r ? `<div class="talk"><strong>Street talk · ${esc(NAMES.districts[r.district] ?? r.district)}</strong><br>${esc(r.text)}</div>` : '';
}
const talkTag = (v) => v.rumour ? `<span class="talk-tag">Street talk: ${esc(v.rumour.tag)}</span>` : '';

// The climb: how far the crew's name has to travel before bigger work is offered.
function climbLine() {
  const next = nextUnlock(state);
  if (!next) return '';
  const pct = Math.round(Math.min(1, (state.reputation ?? 0) / next.rep) * 100);
  return `<div class="climb"><p class="small"><strong>Reputation ${Math.floor(state.reputation ?? 0)}/${next.rep}.</strong> Bigger work opens up once people know your name. Finished jobs build it; aborts cost it.</p>
    <div class="bar" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><span style="width:${pct}%"></span></div></div>`;
}

function renderJobs() {
  if (!state.jobs.length) return `<section class="panel"><h1>Jobs</h1>${streetTalk()}${climbLine()}<p class="muted">No work on the board. New work comes in through the week.</p>${renderSideBoard()}${renderClients()}</section>`;
  return `
    <section class="panel">
      <h1>Jobs</h1>
      ${streetTalk()}
      ${climbLine()}
      <ul class="list list--cols">
        ${state.jobs.map((j) => {
          const v = jobView(state, j);
          const t = v.tpl;
          return `
          <li>
            <button class="row jobcard" data-action="open-job" data-id="${esc(j.id)}">
              <strong class="jobcard__name">${esc(t.name)}</strong><strong class="jobcard__pay">${money(v.pay)}</strong>
              <span class="jobcard__client">${clientLine(v)}</span><span class="jobcard__left ${j.expiresDay === state.day ? 'is-last' : ''}">${daysLeft(j.expiresDay)}</span>
              <span class="jobcard__facts">${esc(districtName(t.district))} · threat ${threatHtml(v)} · ${t.crewSize} crew · ${t.days}d</span>
              ${v.hinted ? '<span class="jobcard__extra intel">Intel unreliable</span>' : ''}${v.rumour ? `<span class="jobcard__extra">${talkTag(v)}</span>` : ''}
            </button>
          </li>`;
        }).join('')}
      </ul>
      ${renderSideBoard()}
      ${renderClients()}
    </section>`;
}

const PURPOSE = { money: 'Money', training: 'Training', trust: 'Client trust', info: 'Intel' };

/** This week's side tasks, under the job board. */
function renderSideBoard() {
  const board = (state.sideBoard ?? []).map(sideTaskById).filter(Boolean);
  return `
      <h2>Side work this week</h2>
      <p class="muted small">Small one-off jobs for whoever isn't on the main work. They're away for the days shown and the result comes back with them. A new board every Monday.</p>
      ${board.length ? `<ul class="list list--cols">
        ${board.map((t) => `
          <li>
            <button class="row jobcard" data-action="open-side" data-id="${esc(t.id)}">
              <strong class="jobcard__name">${esc(t.name)}</strong><strong class="jobcard__pay">${esc(PURPOSE[t.purpose])}</strong>
              <span class="jobcard__client">${esc(sideReward(t))}</span><span class="jobcard__left">${t.days}d</span>
              <span class="jobcard__facts">${esc(districtName(t.district))} · ${esc(t.stat)} · up to ${t.crew}</span>
            </button>
          </li>`).join('')}
      </ul>` : '<p class="muted">Nothing left this week. More on Monday.</p>'}`;
}

/** Planning a side task: who goes, how likely it goes well, what it gives and costs. */
function renderSidePlan() {
  const t = sideTaskById(sidePlan.taskId);
  if (!t || !(state.sideBoard ?? []).includes(t.id)) { sidePlan = null; return renderJobs(); }
  const odds = sidePlan.crew.length ? sideOdds(state, t, sidePlan.crew) : null;
  return `
    <section class="panel">
      <button class="btn btn--ghost" data-action="back">← Jobs</button>
      <h1>${esc(t.name)}</h1>
      <p class="muted">${esc(districtName(t.district))} · ${esc(PURPOSE[t.purpose])} · ${t.days} day${t.days > 1 ? 's' : ''} away · up to ${t.crew}</p>
      <p class="body">${esc(sidePitch(t))}</p>
      <div class="riskcard">
        <p><strong>If it goes well:</strong> ${esc(sideReward(t, Math.max(1, sidePlan.crew.length)))}.</p>
        <p><strong>If it goes badly:</strong> ${esc(sideCost(t))}.</p>
        <p class="muted small">One roll on ${esc(t.stat)}. Everyone sent learns a little ${esc(t.stat)}${t.purpose === 'training' ? ', more if it goes well' : ''}.</p>
      </div>
      <h2>Who goes (up to ${t.crew})</h2>
      <ul class="list">
        ${state.crew.filter((op) => !op.freelance).map((op) => {
          const a = availability(state, op);
          const on = sidePlan.crew.includes(op.id);
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
      <button class="btn btn--primary" data-action="send-side" ${sidePlan.crew.length ? '' : 'disabled'}>${sidePlan.crew.length ? `Send ${sidePlan.crew.length}` : 'Pick someone'}</button>
    </div>`;
}

const trustTone = (t) => (t >= 60 ? 'good' : t >= 40 ? 'mid' : 'bad');
const TRUST_NOTE = 'Finished jobs build trust; aborts and "client unhappy" choices cost it. High trust pays up to 15% more; below 20, a client stops calling. Trust drifts back towards neutral each week.';

/** Jobs tab: one line per client, folded away under the board. Full write-ups are on City. */
function renderClients() {
  return `
      <details class="citydetails clients">
        <summary>Clients (${CLIENTS.length})</summary>
        <ul class="list list--plain">
          ${CLIENTS.map((c) => {
            const t = trustOf(state, c.id);
            return `<li class="clientline"><strong>${esc(c.name)}</strong><span class="trust trust--${trustTone(t)}">${esc(trustLabel(t))} · ${t}/100</span></li>`;
          }).join('')}
        </ul>
        <p class="muted small">${esc(TRUST_NOTE)} Who they are: City tab.</p>
      </details>`;
}

/** City tab: who each client is, with where you stand. */
function renderClientCards() {
  return `
      <ul class="list list--plain">
        ${CLIENTS.map((c) => {
          const t = trustOf(state, c.id);
          return `<li class="clientrow"><span><strong>${esc(c.name)}</strong><br><span class="muted small">${esc(c.desc)}</span></span>
            <span class="trust trust--${trustTone(t)}">${esc(trustLabel(t))}<br><span class="small">${t}/100</span></span></li>`;
        }).join('')}
      </ul>
      <p class="muted small">${esc(TRUST_NOTE)}</p>`;
}

function renderPlan() {
  const job = state.jobs.find((j) => j.id === plan.jobId);
  if (!job) { plan = null; return renderJobs(); }
  const v = jobView(state, job);
  const t = v.tpl;
  const freelancers = state.freelancers ?? [];
  const picked = [...state.crew, ...freelancers.map(freelancerAsCrew)].filter((o) => plan.crew.includes(o.id));
  const read = assessJob({ ...t, threat: v.threat }, picked, plan.approach, { watched: state.heatWatched ? WATCHED_PENALTY : 0, intel: intelFor(state, t.district) });
  const most = maxCrew(t.crewSize);
  const full = plan.crew.length >= most;

  return `
    <section class="panel">
      <button class="btn btn--ghost" data-action="back">← Jobs</button>
      <h1>${esc(t.name)}</h1>
      <p class="muted">${esc(districtName(t.district))}${districtTurf(t.district)} · threat ${threatHtml(v)} · pays ${money(v.pay)} · crew away ${t.days}d · ${daysLeft(job.expiresDay)}</p>
      ${DISTRICTS[t.district] ? `<p class="muted small">${esc(DISTRICTS[t.district].pitch)}</p>` : ''}
      <p class="body">${esc(fillBrief(t))}</p>
      <div class="plangrid">
      <div class="riskcard plangrid__client">
        <p><strong>Client:</strong> ${clientLine(v)}</p>
        ${v.client ? `<p class="muted small">${esc(v.client.desc)}</p>` : ''}
        ${v.threatDelta ? `<p class="muted small">Every roll on this job is ${Math.abs(v.threatDelta) === 1 ? 'one point' : `${Math.abs(v.threatDelta)} points`} ${v.threatDelta > 0 ? 'harder' : 'easier'} than usual.</p>` : ''}
        ${v.hinted ? '<p class="intel">Intel unreliable: something about this job may not be what you were told.</p>' : ''}
        ${v.rumour ? `<p class="talk-tag">Street talk: ${esc(v.rumour.text)}</p>` : ''}
        ${(() => { const i = intelFor(state, t.district); return i ? `<p class="talk-tag">Intel from ${esc(i.source)}: +${i.bonus} on every roll here until day ${state.intel[t.district].until}.</p>` : ''; })()}
      </div>

      <div class="plangrid__crew">
      <h2>Crew (${plan.crew.length} picked · ${t.crewSize} recommended, up to ${most})</h2>
      ${(() => { const r = crewSizeRead(plan.crew.length, t.crewSize); return `<p class="sizebadge sizebadge--${r.level} ${r.penalty >= 2 ? 'is-severe' : ''}">${esc(r.text)}</p>`; })()}
      <p class="muted small">Matters most: ${t.keyStats.join(', ')}. Numbers are coloured by how each person would do alone on this job: <span class="fit fit--good">good</span>, <span class="fit fit--shaky">shaky</span>, <span class="fit fit--weak">weak</span>. On the job your best person rolls. * includes a trait bonus.</p>
      <p class="muted small">Each person short of ${t.crewSize}: −1 on every roll. A second person within 3 of whoever rolls backs them up: +1.</p>
      <ul class="list">
        ${state.crew.map((op) => {
          const a = availability(state, op);
          const on = plan.crew.includes(op.id);
          const disabled = !a.ok || (!on && full);
          return `
          <li>
            <button class="row pick ${on ? 'is-on' : ''}" data-action="toggle-crew" data-id="${esc(op.id)}" ${disabled ? 'disabled' : ''} aria-pressed="${on}">
              <span class="pick__box">${on ? '✓' : ''}</span>
              ${face(op, 'sm')}
              <span class="row__main"><strong>${esc(op.handle)}</strong> <span class="muted">${esc(op.role)}</span><br><span class="small">${keyStatsFor(op, t, v.threat)}</span></span>
              <span class="row__meta">${statusChip(a)}</span>
            </button>
          </li>`;
        }).join('')}
      </ul>

      ${renderFreelancers(t, v.threat, freelancers, full)}

      ${renderMentoring(picked)}
      </div>

      <div class="plangrid__approach">
      <h2>Approach</h2>
      <div class="segmented segmented--grid">
        ${Object.entries(APPROACHES).map(([k, a]) => `
          <button class="seg ${plan.approach === k ? 'is-on' : ''}" data-action="approach" data-id="${k}" aria-pressed="${plan.approach === k}">
            <strong>${esc(a.name)}</strong><span>${esc(a.desc)}</span>
          </button>`).join('')}
      </div>
      ${renderOverwatch()}
      ${renderCallIns(t)}
      </div>

      <div class="plangrid__risk">
      <h2 id="risk-read">Risk read</h2>
      <div class="riskcard">
        ${picked.length ? `${riskBadge(read.level)}
        <ul>${read.reasons.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>` : '<p class="muted">Pick a crew to see the risk.</p>'}
      </div>
      </div>
      </div>
    </section>

    <div class="planbar">
      <div class="planbar__read">
        ${picked.length ? riskBadge(read.level) : '<span class="risk risk--none">no crew yet</span>'}
        <span class="planbar__why">${esc(picked.length ? read.reasons[0] : `Pick up to ${most}; ${t.crewSize} recommended`)}</span>
      </div>
      ${(() => {
        const away = plan.callIn === 'never' && handsOffAllowed(t);
        return `<button class="btn btn--primary" data-action="${away ? 'send-job' : 'start-job'}" ${plan.crew.length ? '' : 'disabled'}>
        ${plan.crew.length ? (away ? `Send ${plan.crew.length}${plan.overwatch ? ' + overwatch' : ''}` : `Start with ${plan.crew.length}${plan.overwatch ? ' + overwatch' : ''}`) : 'Pick a crew'}
      </button>`;
      })()}
    </div>`;
}

/** Overwatch: one person outside the crew with the safehouse's shared rifle or drone (core/incidents.js). */
function renderOverwatch() {
  const free = state.crew.filter((op) => availability(state, op).ok && !plan.crew.includes(op.id));
  const kit = OVERWATCH_KIT[plan.kit] ?? OVERWATCH_KIT.rifle;
  return `
      <h2>Overwatch <span class="muted small">(optional)</span></h2>
      <p class="muted small">Someone outside with the safehouse's ${esc(kit.name.toLowerCase())}. When someone inside gets into trouble, overwatch can save them: ${kit.uses} ${plan.kit === 'rifle' ? 'shots' : 'drone actions'} a job. ${esc(kit.desc)}</p>
      <div class="segmented">
        ${Object.entries(OVERWATCH_KIT).map(([k, o]) => `
          <button class="seg ${plan.kit === k ? 'is-on' : ''}" data-action="kit" data-id="${k}" aria-pressed="${plan.kit === k}"><strong>${esc(o.name)}</strong><span>${esc(o.stat)}</span></button>`).join('')}
      </div>
      <div class="owpicks">
        ${free.length ? free.map((op) => `
          <button class="owpick ${plan.overwatch === op.id ? 'is-on' : ''}" data-action="overwatch" data-id="${esc(op.id)}" aria-pressed="${plan.overwatch === op.id}">
            ${face(op, 'sm')}<span><strong>${esc(op.handle)}</strong> <span class="muted">${esc(kit.stat)} ${ratedStat(op, kit.stat)}</span></span>
          </button>`).join('') : '<p class="muted small">Nobody free who isn\'t already inside.</p>'}
      </div>`;
}

/** When the crew calls you in, and how they decide when they don't (core/autorun.js ORDERS). */
function renderCallIns(t) {
  const orders = ORDERS[plan.orders] ? plan.orders : 'steady';
  const callIn = CALL_IN[plan.callIn] ? plan.callIn : 'risky';
  const away = handsOffAllowed(t);
  return `
      <h2>Call me in…</h2>
      <div class="segmented">
        ${Object.entries(CALL_IN).filter(([k]) => k !== 'never' || away).map(([k, c]) => `
          <button class="seg ${callIn === k ? 'is-on' : ''}" data-action="callin" data-id="${k}" aria-pressed="${callIn === k}"><strong>${esc(c.name)}</strong><span>${esc(c.desc)}</span></button>`).join('')}
      </div>
      ${away ? '' : '<p class="muted small">Bigger jobs can\'t be sent off on their own yet: you\'ll watch this one.</p>'}
      ${callIn === 'every' ? '' : `
      <h2>When they decide themselves</h2>
      <p class="muted small">Their orders decide each call they don't bring to you. They never push on with a critical wound: at worst, they pull out.</p>
      <div class="segmented">
        ${Object.entries(ORDERS).map(([k, o]) => `
          <button class="seg ${orders === k ? 'is-on' : ''}" data-action="orders" data-id="${k}" aria-pressed="${orders === k}">
            <strong>${esc(o.name)}</strong><span>${esc(o.desc)}</span>
          </button>`).join('')}
      </div>`}`;
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
        ${face(op, 'lg')}
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
        ${face(op)}
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
  } else if (am.pending) {
    const v = describePending(state);
    action = `
      <div class="crisis">
        <p class="crisis__title">${v.kind === 'alert' ? 'The crew is calling in: you\'ve been spotted' : 'The crew is calling in: someone is down'}</p>
        <p>${esc(v.text)}</p>
        <div class="choices">${v.choices.map((c) => choiceButton({ ...c, risk: c.exit ? 'safe' : 'moderate', riskReason: c.cost, cost: '' }, 'pending')).join('')}</div>
      </div>`;
  } else if (currentStep(am)?.type === 'crisis' && needsPlayer(state)) {
    const v = describeCrisis(state);
    action = `
      <div class="crisis">
        <p class="crisis__title">Crisis</p>
        <p>${esc(v.text)}</p>
        <div class="choices">${v.choices.map((c) => choiceButton(c, 'choose')).join('')}</div>
      </div>`;
  } else {
    action = `<button class="btn btn--primary btn--block" data-action="step">${am.log.length ? 'Next' : 'Begin'}</button>`;
  }

  return `
    <section class="panel mission">
      <p class="muted small">On the job · ${esc(APPROACHES[am.approach]?.name ?? '')} approach · ${esc(crewNames)}${am.overwatch ? ` · ${esc(state.crew.find((o) => o.id === am.overwatch.id)?.handle ?? '')} on overwatch (${esc(OVERWATCH_KIT[am.overwatch.kit].name.toLowerCase())}: ${am.overwatch.left} left)` : ''}</p>
      <div class="crewstrip">${crewOps.map((o) => face(o, 'sm')).join('')}</div>
      <p class="alertline" aria-label="Alert ${am.alert ?? 0} of ${ALERT_MAX}">Alert ${Array.from({ length: ALERT_MAX }, (_, i) => `<span class="alertpip ${i < (am.alert ?? 0) ? 'is-on' : ''}"></span>`).join('')}${am.wentLoud ? ' <span class="muted small">gone loud</span>' : ''}</p>
      <h1>${esc(t.name)}</h1>
      <div class="mission__log">${log || `<p class="body muted">${esc(fillBrief(t))}</p>`}</div>
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

// --- city --------------------------------------------------------------

const cityName = (key) => NAMES.districts[key] ?? NAMES.lockedDistricts?.[key] ?? key;

/** Jobs on the board right now, by district. */
const jobsIn = (key) => state.jobs.map((j) => ({ j, v: jobView(state, j) })).filter(({ v }) => v.tpl.district === key);
/** Which gang's colour a district's turf stripe takes. */
const TURF_TONE = { 'Brass Anchor': 'sodium', 'Red Lantern': 'red', 'Silver Fan': 'violet', 'Veridian-Apex': 'cyan', 'Racing Association': 'orange' };

const TURF_HEX = { sodium: '#f2d541', red: '#ff3d5f', violet: '#b48cff', cyan: '#3de8d8', orange: '#ff9a3d' };

function cityMap() {
  const talk = activeRumour(state)?.district;
  const districts = MAP_DISTRICTS.map((key) => {
    const card = DISTRICT_CARDS[key];
    const n = card.locked ? 0 : jobsIn(key).length;
    const faction = DISTRICTS[key]?.faction;
    const hot = talk === key;
    return {
      key, locked: card.locked, hot, selected: cityDistrict === key,
      name: cityName(key).replace(/^The /, ''),
      // The live readout under the name: work on the board here, and whether the street's talking about it.
      readout: card.locked ? 'LOCKED' : `${n ? `${n} JOB${n === 1 ? '' : 'S'}` : 'NO WORK'}${hot ? ' · TALK' : ''}`,
      tone: hot ? 'has-talk' : n ? 'has-work' : '',
      turf: faction ? TURF_HEX[TURF_TONE[faction]] : '#8a93a6',
      label: [cityName(key), card.locked ? 'locked' : `${n || 'no'} job${n === 1 ? '' : 's'} on the board`, faction && `${faction} turf`, hot && 'street talk about it'].filter(Boolean).join(', '),
    };
  });
  const legend = [...new Set(Object.values(DISTRICTS).map((d) => d.faction).filter(Boolean))];
  return `
    ${cityMapSvg(districts, esc)}
    <ul class="maplegend">
      ${legend.map((f) => `<li><span class="maplegend__swatch map-turf--${TURF_TONE[f] ?? 'cyan'}"></span>${esc(f)}</li>`).join('')}
      ${talk ? '<li><span class="maplegend__dot"></span>Street talk</li>' : ''}
    </ul>`;
}

function districtCard(key) {
  const c = DISTRICT_CARDS[key];
  const turf = DISTRICTS[key]?.turf;
  const jobs = MISSIONS.filter((m) => m.district === key).map((m) => m.name);
  return `
    <div class="riskcard citycard">
      <h2 class="nomargin">${esc(cityName(key))} <span class="muted">${esc(c.chinese)}</span></h2>
      <p class="muted small">${esc(c.side)}${turf ? ` · ${esc(turf)}` : ''}</p>
      <p class="body">${esc(c.pitch)}</p>
      ${c.locked ? `<p class="intel">${esc(c.teaser)}</p>` : (() => {
        const now = jobsIn(key);
        return now.length ? `<div class="stack">${now.map(({ j, v }) => `<button class="btn" data-action="open-job" data-id="${esc(j.id)}">${esc(v.tpl.name)} · ${money(v.pay)} · ${daysLeft(j.expiresDay)}</button>`).join('')}</div>`
          : jobs.length ? `<p class="small muted">No work on the board here right now. New work comes in through the week.</p>`
            : '<p class="small muted">Nobody here is hiring crews like yours yet.</p>';
      })()}
      ${activeRumour(state)?.district === key ? `<p class="talk-tag">Street talk: ${esc(activeRumour(state).text)}</p>` : ''}
      <details class="citydetails">
        <summary>More about ${esc(cityName(key))}</summary>
        ${c.locked || !jobs.length ? '' : `<p class="small"><strong>Kinds of work here:</strong> ${esc(jobs.join(', '))}</p>`}
        <p class="small"><strong>Who runs it:</strong> ${esc(c.control)}</p>
        <p class="small"><strong>Police:</strong> ${esc(c.police)}</p>
        <p class="small"><strong>At 3am:</strong> ${esc(c.night)}</p>
        <p class="small"><strong>Local custom:</strong> ${esc(c.custom)}</p>
        <p class="small"><strong>Landmarks:</strong></p>
        <ul>${c.landmarks.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>
      </details>
    </div>`;
}

/** City sections, one at a time, so the map screen fits a phone. */
const CITY_TABS = { map: 'Map', clients: 'Clients', factions: "Who's who", lore: 'Lore' };

function renderCity() {
  const tab = CITY_TABS[cityTab] ? cityTab : 'map';
  const groups = [...new Set(FACTIONS.map((f) => f.group))];
  const body = {
    map: () => `
      <div class="cols2 cols2--map">
        <div>${cityMap()}</div>
        <div>${cityDistrict ? districtCard(cityDistrict) : '<p class="muted small citymap__hint">Tap a district for its jobs, street talk and who runs it.</p>'}</div>
      </div>`,
    clients: () => renderClientCards(),
    factions: () => `
      <div class="cols2 cols2--flow">
      ${groups.map((g) => `
        <div>
          <h2>${esc(g)}</h2>
          <ul class="list list--plain">
            ${FACTIONS.filter((f) => f.group === g).map((f) => `
              <li><strong>${esc(f.name)}</strong> <span class="muted small">· ${esc(f.where)}</span><br>
                <span class="small">${esc(f.line)}</span><br>
                <span class="muted small">Rumour: ${esc(f.rumour)}</span></li>`).join('')}
          </ul>
        </div>`).join('')}
      </div>`,
    lore: () => `
      <div class="cols2">
      <div>
      <h2>Everyone knows</h2>
      <ul class="list list--plain small">${STREET_FACTS.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>
      </div>
      <div>
      <h2>A short history</h2>
      <ul class="list list--plain small">${HISTORY.map((h) => `<li><strong>${esc(h.year)}</strong> ${esc(h.text)}</li>`).join('')}</ul>
      </div>
      </div>`,
  }[tab]();
  return `
    <section class="panel">
      <h1 class="cityhead">${esc(NAMES.city)} <span class="muted">燈籠灣</span> <span class="muted small">2057</span></h1>
      <div class="subtabs" role="group" aria-label="City sections">
        ${Object.entries(CITY_TABS).map(([k, label]) => `<button class="subtab ${k === tab ? 'is-on' : ''}" data-action="city-tab" data-id="${k}" aria-pressed="${k === tab}">${esc(label)}</button>`).join('')}
      </div>
      ${body}
    </section>`;
}

function renderSettings() {
  const slots = listSlots();
  const active = getActiveSlot();
  const backup = state.difficulty === 'ironman' ? null : loadBackup();
  const lastExport = state.lastBackupDay ? `day ${state.lastBackupDay} (${state.day - state.lastBackupDay} days ago)` : 'never';

  const picker = newGameSlot ? `
      <div class="riskcard">
        <h2 class="nomargin">New game in slot ${newGameSlot}</h2>
        <p class="muted small">Five nobodies off the street, one of each role. Pick a difficulty to start.</p>
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

      <div class="cols2">
      <div>
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
      </div>

      <div>
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
      </div>
      </div>

      <p class="muted small">Playing: ${esc(DIFFICULTIES[state.difficulty]?.name ?? state.difficulty)} · Save format v${state.version} · ${SLOT_COUNT} slots</p>
    </section>`;
}
