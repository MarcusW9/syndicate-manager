// The ONLY module that touches storage. On iOS, swap the three
// storage functions below for Capacitor Preferences or Filesystem;
// nothing else in the game needs to change.

import { SAVE_VERSION } from '../core/state.js';
import { addOffer } from '../core/jobs.js';
import { STARTING_ROSTER_CAP } from '../core/recruits.js';

const KEY = 'syndicate-save-v1';

// --- storage backend (replace for iOS) ---------------------------------
function storageGet(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}
function storageSet(key, value) {
  try { localStorage.setItem(key, value); return true; } catch { return false; }
}
function storageRemove(key) {
  try { localStorage.removeItem(key); } catch { /* ignore */ }
}
// -----------------------------------------------------------------------

export function saveGame(state) {
  return storageSet(KEY, JSON.stringify(state));
}

export function loadGame() {
  const raw = storageGet(KEY);
  if (!raw) return null;
  try {
    const state = JSON.parse(raw);
    return migrate(state);
  } catch {
    return null;
  }
}

export function deleteSave() {
  storageRemove(KEY);
}

/** Download the save as a file (backup against browser storage being wiped). */
export function exportSave(state) {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `syndicate-day${state.day}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Read a save file the player picked. Resolves to state or rejects. */
export function importSave(file) {
  return file.text().then((text) => migrate(JSON.parse(text)));
}

// Upgrade old save formats when SAVE_VERSION changes.
function migrate(state) {
  if (typeof state?.version !== 'number') throw new Error('Not a save file');
  if (state.version > SAVE_VERSION) throw new Error('Save is from a newer version');
  if (state.version === 1) {
    // v2 added the job board and missions.
    state.jobs = state.jobs ?? [];
    state.jobSeq = state.jobSeq ?? 0;
    state.rngCounter = state.rngCounter ?? 0;
    state.activeMission = null;
    if (!state.jobs.length) for (const id of ['courier', 'data_pull', 'warehouse']) addOffer(state, id);
    state.version = 2;
  }
  if (state.version === 2) {
    // v3 added recruiting and safehouse expansion.
    state.recruits = state.recruits ?? [];
    state.recruitSeq = state.recruitSeq ?? 0;
    state.rosterCap = state.rosterCap ?? STARTING_ROSTER_CAP;
    state.safehouseLevel = state.safehouseLevel ?? 1;
    state.version = 3;
  }
  return state;
}
