// UI layer: the only code that touches the DOM. Reads state, calls core
// functions, re-renders. Tap/click only; nothing depends on hover.

import { NAMES } from '../config/names.js';
import { TRAITS } from '../data/traits.js';
import { advanceDay, formatDate, isBlocked } from '../core/time.js';
import { createNewGame } from '../core/state.js';
import { saveGame, exportSave, importSave, deleteSave } from '../save/save.js';

let state;
let screen = 'inbox';
let openMessageId = null;
let openOperativeId = null;
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
  if (!t) return;
  const { action, id } = t.dataset;

  if (action === 'nav') { screen = id; openMessageId = null; openOperativeId = null; }
  if (action === 'continue' && !isBlocked(state)) return setState(advanceDay(state));
  if (action === 'open-message') {
    openMessageId = id;
    const msg = state.inbox.find((m) => m.id === id);
    if (msg && !msg.read) { msg.read = true; saveGame(state); }
  }
  if (action === 'back') { openMessageId = null; openOperativeId = null; }
  if (action === 'open-op') openOperativeId = id;
  if (action === 'export') exportSave(state);
  if (action === 'import') root.querySelector('#import-file').click();
  if (action === 'new-game' && confirm('Start a new game? Your current save will be replaced.')) {
    deleteSave();
    screen = 'inbox';
    return setState(createNewGame());
  }
  render();
}

function onChange(e) {
  if (e.target.id !== 'import-file' || !e.target.files[0]) return;
  importSave(e.target.files[0])
    .then((loaded) => { screen = 'inbox'; setState(loaded); })
    .catch((err) => alert(`Could not load that file: ${err.message}`));
}

// --- rendering ---------------------------------------------------------
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = (n) => `${NAMES.currency}${n.toLocaleString()}`;

function render() {
  const blocked = isBlocked(state);
  const unread = state.inbox.filter((m) => !m.read).length;

  root.innerHTML = `
    <header class="topbar">
      <div class="topbar__date">${esc(formatDate(state.day))}</div>
      <div class="topbar__stats">
        <span class="stat"><span class="stat__label">Cash</span> ${money(state.cash)}</span>
        <span class="stat"><span class="stat__label">Heat</span> ${state.heat}/10</span>
        <span class="stat"><span class="stat__label">Tier</span> ${esc(state.tier)}</span>
      </div>
      <button class="btn btn--primary topbar__continue" data-action="continue" ${blocked ? 'disabled' : ''}>
        ${blocked ? 'Decision needed' : 'Continue'}
      </button>
    </header>

    <nav class="nav" aria-label="Main">
      ${navButton('inbox', `Inbox${unread ? ` (${unread})` : ''}`)}
      ${navButton('crew', 'Crew')}
      ${navButton('jobs', 'Jobs')}
      ${navButton('settings', 'Save')}
    </nav>

    <main class="main">${renderScreen()}</main>
    <input type="file" id="import-file" accept="application/json" hidden />
  `;
}

function navButton(id, label) {
  return `<button class="nav__btn ${screen === id ? 'is-active' : ''}" data-action="nav" data-id="${id}">${esc(label)}</button>`;
}

function renderScreen() {
  if (screen === 'inbox') return openMessageId ? renderMessage() : renderInbox();
  if (screen === 'crew') return openOperativeId ? renderOperative() : renderCrew();
  if (screen === 'jobs') return `<section class="panel"><h1>Jobs</h1><p class="muted">Job board arrives in the next build step.</p></section>`;
  if (screen === 'settings') return renderSettings();
  return '';
}

function renderInbox() {
  if (!state.inbox.length) return `<section class="panel"><h1>Inbox</h1><p class="muted">Nothing new. Press Continue.</p></section>`;
  return `
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
  return `
    <section class="panel">
      <button class="btn btn--ghost" data-action="back">← Inbox</button>
      <h1>${esc(m.subject)}</h1>
      <p class="muted">${esc(m.type)} · Day ${m.day}</p>
      <p class="body">${esc(m.body)}</p>
    </section>`;
}

function conditionLabel(c) {
  if (c.injury === 'dead') return 'Dead';
  if (c.injury !== 'healthy') return `${c.injury} injury, ${c.injuryDays}d`;
  if (c.fatigue > 60) return 'Fatigued';
  return 'Ready';
}

function renderCrew() {
  return `
    <section class="panel">
      <h1>Crew</h1>
      <ul class="list">
        ${state.crew.map((op) => `
          <li>
            <button class="row" data-action="open-op" data-id="${esc(op.id)}">
              <span class="row__main"><strong>${esc(op.name)}</strong> "${esc(op.handle)}"<br><span class="muted">${esc(op.role)} · ${op.age}</span></span>
              <span class="row__meta">${esc(conditionLabel(op.condition))}</span>
            </button>
          </li>`).join('')}
      </ul>
    </section>`;
}

function bar(label, value) {
  return `<div class="meter"><span class="meter__label">${label}</span><span class="meter__track"><span class="meter__fill" style="width:${value}%"></span></span><span class="meter__value">${value}</span></div>`;
}

function renderOperative() {
  const op = state.crew.find((x) => x.id === openOperativeId);
  if (!op) return renderCrew();
  const c = op.condition;
  const nameOf = (id) => state.crew.find((x) => x.id === id)?.handle ?? id;
  return `
    <section class="panel">
      <button class="btn btn--ghost" data-action="back">← Crew</button>
      <h1>${esc(op.name)} <span class="muted">"${esc(op.handle)}"</span></h1>
      <p class="muted">${esc(op.role)} · ${op.age} · ${money(op.wage)}/week</p>
      <p class="body">${esc(op.bio)}</p>
      <p class="body muted">${esc(op.origin)}</p>

      <h2>Traits</h2>
      <ul class="chips">
        ${op.traits.map((t) => `<li class="chip"><strong>${esc(TRAITS[t]?.name ?? t)}</strong><span>${esc(TRAITS[t]?.desc ?? '')}</span></li>`).join('')}
      </ul>

      <h2>Stats</h2>
      <dl class="stats">
        ${Object.entries(op.stats).map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${v}</dd></div>`).join('')}
      </dl>

      <h2>Condition</h2>
      ${bar('Fatigue', c.fatigue)}${bar('Morale', c.morale)}${bar('Neural load', c.neuralLoad)}${bar('Burnout', c.burnout)}

      <h2>Trust</h2>
      <ul class="list list--plain">
        ${Object.entries(op.trust).map(([id, v]) => `<li>${esc(nameOf(id))}: ${v > 0 ? '+' : ''}${v}</li>`).join('') || '<li class="muted">No strong feelings yet.</li>'}
      </ul>
    </section>`;
}

function renderSettings() {
  return `
    <section class="panel">
      <h1>Save</h1>
      <p class="body">The game saves automatically in this browser. Export a backup file now and then: browsers (especially on iPhone) can clear stored data.</p>
      <div class="stack">
        <button class="btn" data-action="export">Export save file</button>
        <button class="btn" data-action="import">Load save file</button>
        <button class="btn btn--danger" data-action="new-game">New game</button>
      </div>
      <p class="muted small">Difficulty: ${esc(state.difficulty)} · Save format v${state.version}</p>
    </section>`;
}
