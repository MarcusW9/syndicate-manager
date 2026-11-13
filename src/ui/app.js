// UI layer: the only code that touches the DOM. Reads state, calls core
// functions, re-renders. Tap/click only; nothing depends on hover.

import { hottest, HEAT_MAX } from '../core/heat.js';
import { hallIn } from '../core/halls.js';
import { openRaids } from '../core/raids.js';
import { billDue } from '../core/week.js';
import { RAID } from '../data/raids.js';
import { PARTNER } from '../data/partner.js';
import { animateMap } from './citymap.js';
import { renderHallBuild } from './hallbuild.js';
import { isBlocked, calendar, seasonStartDay } from '../core/time.js';
import { money } from '../core/money.js';
import { runBattle } from '../core/mission.js';
import { takeFightChange } from './fightscreen.js';
import { autoStep } from '../core/autorun.js';
import { fitGearArt } from './board.js';
import { isWatching, syncWatch, justFinished, stopWatch, mountWatch } from './watch.js';
import { saveGame, unreadableSave, backupDue } from '../save/save.js';
import { renderLeadName } from './tongs.js';
import { tabBadges, tabOf } from './nav.js';
import { onClick, onImportFile } from './actions.js';
import { renderCity, renderLore } from './city.js';
import { renderRecruit, renderOperative, renderCrew } from './crew.js';
import { wideHall, hallArtOn, renderHallPage, renderTong } from './hallscreens.js';
import { renderJobs, renderSidePlan, renderClientPage } from './jobs.js';
import { renderMission, renderBuzz, watchUi } from './jobscreen.js';
import { renderPlan } from './plan.js';
import { renderRaidCallSheet } from './raidcards.js';
import { renderFounding, renderSettings } from './settings.js';
import { esc, districtName, hallLabel, fillLine, pickLine, face, rootBack, cityName } from './shared.js';
import { renderInbox } from './today.js';
import { root, setRoot, state, setGame, backLabel, V } from './view.js';

export function mountApp(el, initialState) {
  setRoot(el);
  setGame(initialState);
  root.addEventListener('click', onClick);
  // Map districts are SVG groups, not buttons: let Enter and Space open them too.
  root.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches?.('g[data-action]')) { e.preventDefault(); onClick(e); }
    if (e.key === 'Escape' && V.pickSlot) { V.focusNext = { action: 'pick-slot', id: V.pickSlot }; V.pickSlot = null; render(); }
    else if (e.key === 'Escape' && V.screen === 'city' && V.cityTab === 'map' && V.cityDistrict && !state.activeMission) { V.cityDistrict = null; render(); }
  });
  // The save-file picker lives outside root: render() replaces everything inside root, and the
  // Load button's own click re-renders, so a picker inside would be swapped out mid-pick and its
  // file never arrive (owner's report, 2026-10-30: "nothing happens").
  V.importInput = Object.assign(document.createElement('input'), { type: 'file', id: 'import-file', accept: 'application/json,.json', hidden: true });
  V.importInput.addEventListener('change', onImportFile);
  root.after(V.importInput);
  // The hall page changes layout at 1100px: draw it again when the window crosses that line.
  if (typeof matchMedia === 'function') matchMedia('(min-width: 1100px)').addEventListener?.('change', () => { if (V.screen === 'tong' && (V.hallPage || V.buildView)) render(); });
  render();
}

export function setState(next) {
  setGame(next);
  saveGame(state);
  render();
}
/** Heat as a small bar: green while quiet, amber, then red from the level that brings the fixer. */
/**
 * The top bar's heat (2026-11-06, mock-up drafts/prototypes/topbar.html): nothing while no district
 * is warm; from HEAT_CHIP_AT a chip naming the hottest one, amber, red from the heat that can bring
 * a raid. A tap opens that district on Ops, where every district's heat is on the map.
 */
const HEAT_CHIP_AT = 3;
function heatStat() {
  const hot = state.founding || state.heat < HEAT_CHIP_AT ? null : hottest(state);
  if (!hot) return '';
  // A raid in the offing: the chip goes to its card (2026-11-09); otherwise to the district.
  const raid = openRaids(state).find((r) => r.answer !== 'paid') ?? null;
  const [action, target] = raid ? ['raid-open', raid.district] : ['ops-district', hot.district];
  return `<button class="heatchip ${state.heat >= RAID.heatAt ? 'is-hot' : ''}" data-action="${action}" data-id="${esc(target)}" aria-label="Hottest district: ${esc(districtName(hot.district))}, heat ${state.heat} of ${HEAT_MAX}${state.heat >= RAID.heatAt ? ', hot enough for a raid' : ''}. ${raid ? `See the raid on ${esc(hallLabel(raid.district))}` : 'See it on the City map'}">
    <span class="heatchip__l">Heat</span> ${esc(districtName(hot.district).replace(/^The /, ''))} <b>${state.heat}</b></button>`;
}

// --- rendering ---------------------------------------------------------
export function render() {
  // A running job's watch screen updates in place, so its animations and timer carry on (ui/watch.js).
  const am = state.activeMission;
  if (am && isWatching(root, am)) return syncWatch(state);
  const finishing = justFinished(am); // the job ended on this step: walk out, then the end card
  stopWatch();
  // Every render replaces the page, so put keyboard focus back on the same control if it survives.
  const focused = document.activeElement?.closest?.('[data-action]');
  const refocus = focused && root.contains(focused) ? { action: focused.dataset.action, id: focused.dataset.id } : null;
  const blocked = isBlocked(state);
  const resting = Date.now() < V.continueRestUntil;
  const unread = state.inbox.filter((m) => !m.read).length;
  const badges = tabBadges(state);
  const cue = V.dayCue;
  V.dayCue = null;
  const leaving = V.sendOffCue;
  V.sendOffCue = null;
  // Desktop pages use the full width; a job keeps its map and feed side by side to the end, its
  // summary in the feed (no tabs during a job: see is-onjob).
  const wide = true;
  // While a job is being planned its own Start button is the way on, so Continue steps aside
  // everywhere (owner, 2026-10-28: on desktop the top-bar Continue was easy to hit by mistake).
  const planning = !state.activeMission && V.screen === 'jobs' && !!(V.plan || V.sidePlan);
  // Phones: Continue sits above the tab bar, except while planning and during a job (nothing to continue).
  const dock = !state.activeMission && !planning && !state.founding; // the founder pick has its own bar

  // During a job the tabs can't take you anywhere, so they step aside and the job gets the room
  // (owner, 2026-11-03). They come back with "Back to the safehouse".
  root.classList.toggle('is-onjob', !!state.activeMission);
  root.innerHTML = `
    <header class="topbar ${cue ? 'is-new-day' : ''}">
      ${renderWhen()}
      <div class="topbar__stats">
        <span class="stat stat--cash"><span class="stat__label">Cash</span> ${money(state.cash)}${cashDelta()}</span>
        ${heatStat()}
      </div>
      ${state.activeMission ? '' : `<button class="savebtn ${V.screen === 'settings' ? 'is-active' : ''}" data-action="nav" data-id="settings" aria-label="Save and settings" aria-pressed="${V.screen === 'settings'}"><span aria-hidden="true">☰</span><span class="savebtn__word"> Save</span></button>`}
      ${planning || state.founding ? '' : renderContinue(blocked, resting, unread, 'topbar__continue')}
    </header>

    <nav class="nav" aria-label="Main">
      ${navButton('inbox', 'Today', badges.inbox)}
      ${navButton('city', 'City')}
      ${navButton('tong', 'Tong')}
      ${navButton('crew', 'Crew')}
      ${navButton('jobs', 'Jobs', badges.jobs)}
    </nav>

    <main class="main ${wide ? 'main--wide' : ''} ${!state.activeMission && V.screen === 'jobs' && V.plan ? 'main--split' : ''}">${state.activeMission ? renderMission() : `${keptBanner()}${renderScreen()}`}</main>
    ${dock ? `<div class="dock">${renderContinue(blocked, resting, unread, 'dock__continue')}</div>` : ''}
    ${cue ? renderDayCue(cue) : ''}
    ${leaving ? renderSendOff(leaving) : ''}
    ${renderBuzz()}
    ${renderRaidCallSheet()}
  `;
  if (am) mountWatch(root.querySelector('.watch'), state, { ui: watchUi, finishing, onAuto: () => setState(autoStep(state)), onFightNext: () => setState(runBattle(state, takeFightChange(state.activeMission))) });
  fitGearArt(root); // the squad board's gear drawings fill their cells
  root.querySelector('.buzz__pick, .buzz [data-action="buzz-in"]')?.focus({ preventScroll: true }); // the call has the floor
  if (V.pickSlot) (root.querySelector('.sheet .cand.is-on') ?? root.querySelector('.sheet .cand:not([disabled])'))?.focus({ preventScroll: true });
  if (V.scrollDue !== null) { window.scrollTo?.(0, V.scrollDue); V.scrollDue = null; } // Back puts the scroll back; a new page starts at the top
  if (V.mapTo) { animateMap(root.querySelector('.citymap__view'), V.mapView, V.mapTo); V.mapView = V.mapTo; V.mapTo = null; }
  if (V.raidCardDue) { const d = V.raidCardDue; V.raidCardDue = null; root.querySelector(`#threat-${d}`)?.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); }
  if (V.upcomingDue) { V.upcomingDue = false; root.querySelector('.upcoming--strip')?.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); }
  if (V.cityMapDue) { V.cityMapDue = false; root.querySelector('.mapframe')?.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); }
  const want = V.focusNext ?? refocus;
  V.focusNext = null;
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
/**
 * The top bar's date (2026-11-06, owner: the bar "looks packed"): weekday and week; the season
 * only on its first day (it's in Sunday's message too).
 */
function topbarDate(day) {
  const c = calendar(day);
  return `${c.weekday} · Wk ${c.week}${day === seasonStartDay(day) ? ` · S${c.season}` : ''}`;
}

function renderWhen() {
  const today = (state.day - 1) % 7; // 0 = Monday, 6 = Sunday (bills)
  const toBills = 6 - today;
  const due = money(billDue(state).total); // always in view: what Sunday will cost (core/week.js)
  const bills = toBills === 0 ? 'bills paid today' : `${due} due Sun`;
  const cells = Array.from({ length: 7 }, (_, i) =>
    `<span class="week__day ${i < today ? 'is-done' : i === today ? 'is-today' : ''} ${i === 6 ? 'is-bills' : ''}"></span>`).join('');
  return `<div class="topbar__when">
      <div class="topbar__date">${esc(topbarDate(state.day))}</div>
      <div class="week" role="img" aria-label="Day ${today + 1} of 7 this week">${cells}</div>
      <div class="week__note">${bills}</div>
    </div>`;
}

/** Today's cash change, e.g. "▲¥1,050". Nothing on a day the cash hasn't moved. */
function cashDelta() {
  const d = state.cash - (state.dayStartCash ?? state.cash);
  if (!d) return '';
  return ` <span class="delta ${d < 0 ? 'is-down' : ''}" aria-label="${d < 0 ? 'down' : 'up'} ${money(Math.abs(d))} today">${d < 0 ? '▼' : '▲'}${money(Math.abs(d))}</span>`;
}

/** Continue names the next day and lists what's still waiting; it never asks for a second tap. */
/** A soft warning on Continue: a raid that comes by tomorrow with no plan set. Never blocks. */
function raidUnplanned() {
  const r = openRaids(state).find((x) => x.answer !== 'paid' && !x.called && !x.plan && x.day <= state.day + 1);
  return r ? `Raid hits ${calendar(r.day).weekday.slice(0, 3)}. No plan: whoever's home will hold.` : '';
}
function renderContinue(blocked, resting, unread, where) {
  const label = state.activeMission ? 'On a job' : state.founding ? 'Pick your crew' : blocked ? 'Decision needed'
    : `Continue → ${calendar(state.day + 1).weekday}`;
  const waiting = [
    unread ? `${unread} unread` : '',
    state.jobs.length ? `${state.jobs.length} job${state.jobs.length === 1 ? '' : 's'} open` : '',
  ].filter(Boolean).join(' · ');
  const warn = blocked ? '' : raidUnplanned();
  const hint = warn ? `<span class="continue__hint is-warn">${esc(warn)}</span>`
    : !blocked && waiting ? `<span class="continue__hint">${esc(waiting)}</span>` : '';
  return `<button class="btn btn--primary continue ${where} ${resting && !blocked ? 'is-resting' : ''}" data-action="continue" ${blocked || resting ? 'disabled' : ''}>
      <span class="continue__label">${esc(label)}</span>${hint}
    </button>`;
}

/** Re-enable Continue once its rest is over, without a full re-render. */
export function wakeContinue() {
  if (isBlocked(state) || Date.now() < V.continueRestUntil) return;
  const btns = [...root.querySelectorAll('.continue')];
  for (const btn of btns) { btn.disabled = false; btn.classList.remove('is-resting'); }
  const shown = btns.find((b) => b.getClientRects().length);
  if (shown && document.activeElement === document.body) shown.focus({ preventScroll: true }); // focus was on it before the rest
}

/** What changed overnight: new messages, new jobs, cash moved by the day's tick. */
export function dayCueFor(before, after) {
  const known = new Set(before.inbox.map((m) => m.id));
  const knownJobs = new Set(before.jobs.map((j) => j.id));
  return {
    day: after.day,
    messages: after.inbox.filter((m) => !known.has(m.id)).length,
    jobs: after.jobs.filter((j) => !knownJobs.has(j.id)).length,
    cash: after.cash - before.cash,
  };
}

/** The send-off card (2026-11-04): the crew's faces leave, a stamp says where and until when, Joss says a line. CSS plays it once and it fades; tap to dismiss. */
function renderSendOff(c) {
  const ops = c.crewIds.map((id) => state.crew.find((o) => o.id === id)).filter(Boolean);
  const line = fillLine(pickLine(PARTNER.sendOff, `${c.jobId}-send`), { job: c.name });
  return `<div class="sendoff" role="status" data-action="sendoff-close">
      <div class="sendoff__faces">${ops.map((op, i) => `<span class="sendoff__face" style="--i:${i}">${face(op)}</span>`).join('')}</div>
      <p class="sendoff__stamp">Out · ${esc(c.name)} · back ${esc(calendar(c.returnDay).weekday)}</p>
      <p class="sendoff__line">${esc(line)}</p>
    </div>`;
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

// While the founders are being picked there's nothing to see on Crew, Jobs, City or Tong: those tabs are
// off, Today shows the pick, and Save stays open so another slot can still be loaded.
export const FOUNDING_TABS = ['inbox', 'settings']; // the tab bar has no Save button now: ☰ in the top bar is the way to 'settings'

/** A tab button. `badge` ({ count, word }) is only for the tabs that own a count (layout rule 8: Today and Jobs). */
function navButton(id, label, badge = null) {
  const off = state.founding && !FOUNDING_TABS.includes(id);
  const on = state.founding ? id === (V.screen === 'settings' ? 'settings' : 'inbox') : tabOf(V.screen) === id;
  const pill = badge?.count && !off ? ` <span class="pill ${id === 'inbox' ? 'pill--new' : ''}" aria-label="${badge.count} ${badge.word}">${badge.count}</span>` : '';
  return `<button class="nav__btn ${on ? 'is-active' : ''}" data-action="nav" data-id="${id}" ${off ? 'disabled' : ''}>${esc(label)}${pill}</button>`;
}

function renderScreen() {
  if (state.founding && V.screen !== 'settings') return renderFounding(); // nothing else until the founders are picked
  if (V.screen === 'inbox') return rootBack() + renderInbox();
  // A hall's page and its build screen are on their home tab (ui/nav.js HOMES): Tong › Halls.
  if (V.screen === 'tong') {
    if (V.buildView?.screen && hallIn(state, V.buildView.district) && !wideHall()) return renderHallBuild({ esc, money, cityName, backLabel: backLabel(), art: hallArtOn() }, state, V.buildView);
    if (V.hallPage && hallIn(state, V.hallPage)) return renderHallPage(V.hallPage);
    return rootBack() + renderTong();
  }
  if (V.screen === 'crew') return V.openRecruitId ? renderRecruit() : V.leadName ? renderLeadName(state, V.leadName, backLabel()) : V.openOperativeId ? renderOperative() : rootBack() + renderCrew();
  // Jobs: on wide screens the board stays beside the job being planned (styles.css hides it on phones).
  if (V.screen === 'jobs' && V.plan) {
    // The plan, then the job list with the plan bar under it: from 1400px wide the list and the bar
    // stand in the left column beside the plan; narrower, the list hides and the bar stays at the
    // bottom of the plan (2026-11-05). The plan comes first, so on a phone nothing moves.
    const body = renderPlan();
    if (!V.plan) return body; // the job has gone: renderPlan showed the board
    return `<div class="jobsplit"><div class="jobsplit__plan">${body}</div><div class="jobsplit__side"><div class="jobsplit__list">${renderJobs('board')}</div>${V.planBarHtml}</div></div>`;
  }
  if (V.screen === 'jobs') return V.sidePlan ? renderSidePlan() : V.clientPage ? renderClientPage() : rootBack() + renderJobs();
  if (V.screen === 'city') return renderCity();
  if (V.screen === 'lore') return renderLore();
  if (V.screen === 'settings') return renderSettings();
  return '';
}

// --- inbox -------------------------------------------------------------
/** Says a save in this slot was kept aside because it couldn't be opened, on every screen until it's dealt with. */
function keptBanner() {
  const kept = V.screen === 'settings' ? null : unreadableSave();
  if (!kept) return '';
  return `<div class="banner banner--danger"><span>${kept.newer ? 'Your saved game is from a newer version of the game.' : 'Your saved game couldn\'t be opened.'} It's kept safe.</span>
    <button class="btn" data-action="nav" data-id="settings">See Save</button></div>`;
}

export function backupBanner() {
  if (!backupDue(state)) return '';
  return `<div class="banner"><span>${state.lastBackupDay ? `No backup for ${state.day - state.lastBackupDay} days.` : 'You have never backed up this save.'}</span>
    <button class="btn" data-action="export">Export now</button></div>`;
}
