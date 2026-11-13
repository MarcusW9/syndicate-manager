// The Save screen (slots, difficulty, look), and a new game's first screen (picking founders).
import { NAMES } from '../config/names.js';
import { TRAITS } from '../data/traits.js';
import { jossIcon } from './art.js';
import { money } from '../core/money.js';
import { unreadableSave, listSlots, getActiveSlot, loadBackup, SLOT_COUNT, backupDue, getPref } from '../save/save.js';
import { FOUNDERS_TO_PICK } from '../core/recruits.js';
import { esc, face, statName } from './shared.js';
import { state, V } from './view.js';

// --- founders ------------------------------------------------------------
/**
 * A new game's first screen: six candidates, pick three (DESIGN.md, 2026-10-28). Each one is a
 * pinned dossier card (as the squad board had until 2026-11-08), with what the scouts and Joss know below.
 */
export function renderFounding() {
  const cands = state.founding.candidates;
  const picked = V.founderPick.filter((id) => cands.some((c) => c.id === id));
  const n = picked.length;
  const wages = cands.filter((c) => picked.includes(c.id)).reduce((sum, c) => sum + c.wage, 0);
  const names = picked.map((id) => cands.find((c) => c.id === id).handle);
  const best = (r) => Object.entries(r.stats).sort((a, b) => b[1] - a[1]).slice(0, 3);
  return `
    <section class="panel founding">
      <h1>Who's in?</h1>
      <div class="joss">
        <span class="joss__badge">${jossIcon({ mood: 'happy', size: 32 })}</span>
        <div class="joss__body">
          <span class="joss__name">${esc(NAMES.partner)}</span>
          <p class="joss__line">Six people will work for street wages, and the room sleeps three. Pick who you want to grow with. We hire the rest later.</p>
        </div>
      </div>
      <ul class="founders" role="group" aria-label="Candidates: pick ${FOUNDERS_TO_PICK}">
        ${cands.map((r, i) => {
          const on = picked.includes(r.id);
          const full = !on && n >= FOUNDERS_TO_PICK;
          return `<li><button class="founder ${on ? 'is-on' : ''}" data-action="founder-toggle" data-id="${esc(r.id)}" aria-pressed="${on}" ${full ? 'disabled' : ''}>
            <span class="founder__file dossier" style="--tilt:${['-1.2deg', '0.8deg', '-0.4deg', '1.1deg', '-0.9deg', '0.5deg'][i % 6]}">
              <span class="dossier__photo">${face(r)}</span>
              <span class="dossier__name">${esc(r.handle)}</span>
              <span class="dossier__real">${esc(r.role)} · ${r.age}</span>
              ${on ? '<span class="dossier__tag">In</span>' : ''}
            </span>
            <span class="founder__about">
              <span class="founder__stats">${best(r).map(([k, v]) => `<span><b>${v}</b> ${esc(statName(k))}</span>`).join('')}</span>
              <span class="founder__line">${esc(r.origin)}</span>
              <span class="founder__traits muted small">${esc(r.traits.map((t) => TRAITS[t]?.name ?? t).join(' · '))}</span>
              <span class="founder__wage muted small">${money(r.wage)}/wk</span>
            </span>
          </button></li>`;
        }).join('')}
      </ul>
      <div class="planbar founding__bar">
        <p class="small">${n ? `<strong>${esc(names.join(', '))}</strong><br>` : ''}${n === FOUNDERS_TO_PICK ? `Wages ${money(wages)} a week. Rent ${money(state.rent)}, due Sunday.` : `Picked ${n} of ${FOUNDERS_TO_PICK}.`}</p>
        <button class="btn btn--primary" data-action="found-crew" ${n === FOUNDERS_TO_PICK ? '' : 'disabled'}>${n === FOUNDERS_TO_PICK ? 'Start with these three' : `Pick ${FOUNDERS_TO_PICK - n} more`}</button>
      </div>
    </section>`;
}

// --- save --------------------------------------------------------------
const DIFFICULTIES = {
  story: { name: 'Story', desc: 'Nobody dies. Critical operatives always pull through.' },
  standard: { name: 'Standard', desc: 'Death only if you choose "push on". Backups can be restored.' },
  ironman: { name: 'Ironman', desc: 'As Standard, but no going back: no backups to restore, and older save files are refused.' },
};

/** A save that couldn't be opened, kept aside for slot n: what happened and the way back. */
function keptCard(n) {
  const kept = unreadableSave(n);
  if (!kept) return '';
  return `
      <div class="riskcard riskcard--kept">
        <p><strong>A saved game in slot ${n}${kept.day ? ` (day ${kept.day})` : ''} couldn't be opened.</strong> It's kept safe, apart from the game in the slot now.</p>
        <p class="muted small">${kept.newer ? 'It was saved by a newer version of the game than this one. Reload the page to update, then restore it.' : esc(kept.reason)}</p>
        <div class="kept__actions">
          <button class="btn btn--primary" data-action="kept-restore" data-id="${n}">Restore it</button>
          <button class="btn" data-action="kept-export" data-id="${n}">Download it</button>
          <button class="btn btn--danger" data-action="kept-discard" data-id="${n}">Throw away</button>
        </div>
      </div>`;
}

export function renderSettings() {
  const slots = listSlots();
  const active = getActiveSlot();
  const backup = state.difficulty === 'ironman' ? null : loadBackup();
  const lastExport = state.lastBackupDay ? `day ${state.lastBackupDay} (${state.day - state.lastBackupDay} days ago)` : 'never';

  const picker = V.newGameSlot ? `
      <div class="riskcard">
        <h2 class="nomargin">New game in slot ${V.newGameSlot}</h2>
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
      ${Array.from({ length: SLOT_COUNT }, (_, i) => keptCard(i + 1)).join('')}

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

      <h2>Look</h2>
      <div class="riskcard">
        <p>Hall art: <strong>${getPref('hallart') ? 'on' : 'off'}</strong></p>
        <p class="muted small">Draws the Old Town hall as a street-terminal picture, with tiles, walls and a sprite for everything built. Other halls keep the plain plan for now. Only changes how it looks, and is kept on this device, not in the save.</p>
        <button class="btn btn--block" data-action="toggle-hallart" aria-pressed="${getPref('hallart')}">${getPref('hallart') ? 'Turn hall art off' : 'Turn hall art on'}</button>
      </div>

      <p class="muted small">Playing: ${esc(DIFFICULTIES[state.difficulty]?.name ?? state.difficulty)} · Save format v${state.version} · ${SLOT_COUNT} slots</p>
    </section>`;
}
