// The ONLY module that touches storage. On iOS, swap the three
// storage functions below for Capacitor Preferences or Filesystem;
// nothing else in the game needs to change.
//
// Layout:
//   syndicate-active-slot          '1' | '2' | '3'
//   syndicate-slot-N               the save in slot N
//   syndicate-slot-N-backup        automatic weekly backup of slot N (not for Ironman)
//   syndicate-ironman-progress     { [ironmanId]: highest save counter seen }
//   syndicate-save-v1              legacy single save, moved into slot 1 on first load

import { SAVE_VERSION } from '../core/state.js';
import { addOffer } from '../core/jobs.js';
import { STARTING_ROSTER_CAP } from '../core/recruits.js';
import { prepareOperative, rollPotential, rollScoutError, scoutFor, potentialRead } from '../core/development.js';
import { nextRng } from '../core/random.js';
import { refreshFreelancers } from '../core/freelance.js';

export const SLOT_COUNT = 3;
export const BACKUP_REMINDER_DAYS = 28;
const LEGACY_KEY = 'syndicate-save-v1';
const ACTIVE_KEY = 'syndicate-active-slot';
const IRONMAN_KEY = 'syndicate-ironman-progress';
const slotKey = (n) => `syndicate-slot-${n}`;
const backupKey = (n) => `syndicate-slot-${n}-backup`;

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

const readJson = (key) => {
  const raw = storageGet(key);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
};

/** Move the pre-slots single save into slot 1, once. */
function migrateLegacy() {
  const legacy = storageGet(LEGACY_KEY);
  if (legacy && !storageGet(slotKey(1))) storageSet(slotKey(1), legacy);
  if (legacy) storageRemove(LEGACY_KEY);
}

export function getActiveSlot() {
  migrateLegacy();
  const n = Number(storageGet(ACTIVE_KEY));
  return n >= 1 && n <= SLOT_COUNT ? n : 1;
}

export function setActiveSlot(n) {
  storageSet(ACTIVE_KEY, String(n));
}

/** Short description of every slot, for the Save screen. */
export function listSlots() {
  migrateLegacy();
  return Array.from({ length: SLOT_COUNT }, (_, i) => {
    const n = i + 1;
    const s = readJson(slotKey(n));
    const backup = readJson(backupKey(n));
    return {
      slot: n,
      empty: !s,
      day: s?.day ?? null,
      cash: s?.cash ?? null,
      crew: s?.crew?.length ?? null,
      difficulty: s?.difficulty ?? null,
      backupDay: backup?.day ?? null,
    };
  });
}

// --- Ironman: saves only ever move forward ------------------------------

const newIronmanId = () => `im-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`;

function ironmanProgress() {
  return readJson(IRONMAN_KEY) ?? {};
}

function recordIronman(state) {
  if (state.difficulty !== 'ironman') return;
  if (!state.ironman) state.ironman = { id: newIronmanId(), seq: 0 };
  state.ironman.seq += 1;
  const progress = ironmanProgress();
  progress[state.ironman.id] = Math.max(progress[state.ironman.id] ?? 0, state.ironman.seq);
  storageSet(IRONMAN_KEY, JSON.stringify(progress));
}

/** Refuse loading an Ironman save that is older than one this browser has already seen. */
function checkIronman(state) {
  if (state.difficulty !== 'ironman' || !state.ironman) return;
  const seen = ironmanProgress()[state.ironman.id] ?? 0;
  if (state.ironman.seq < seen) {
    throw new Error('This is an older copy of an Ironman run that has already moved on. Ironman runs can\'t be rolled back.');
  }
}

// --- save / load ---------------------------------------------------------

/** Save to the active slot. Also keeps the weekly backup fresh (not for Ironman). */
export function saveGame(state) {
  const slot = getActiveSlot();
  recordIronman(state);
  const ok = storageSet(slotKey(slot), JSON.stringify(state));
  if (state.difficulty !== 'ironman') {
    const week = Math.floor((state.day - 1) / 7);
    const backup = readJson(backupKey(slot));
    if (!backup || Math.floor((backup.day - 1) / 7) < week || backup.seed !== state.seed) {
      storageSet(backupKey(slot), JSON.stringify(state));
    }
  }
  return ok;
}

export function loadGame(slot = getActiveSlot()) {
  const state = readJson(slotKey(slot));
  if (!state) return null;
  try { return migrate(state); } catch { return null; }
}

export function deleteSlot(slot) {
  storageRemove(slotKey(slot));
  storageRemove(backupKey(slot));
}

/** Kept for older callers: deletes the active slot. */
export function deleteSave() {
  deleteSlot(getActiveSlot());
}

/** The automatic backup for a slot, or null. Ironman slots never have one. */
export function loadBackup(slot = getActiveSlot()) {
  const state = readJson(backupKey(slot));
  if (!state || state.difficulty === 'ironman') return null;
  try { return migrate(state); } catch { return null; }
}

/** Download the save as a file (backup against browser storage being wiped). */
export function exportSave(state) {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `syndicate-${state.difficulty}-day${state.day}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Read a save file the player picked. Resolves to state or rejects. */
export function importSave(file) {
  return file.text().then((text) => {
    const state = migrate(JSON.parse(text));
    checkIronman(state);
    return state;
  });
}

export function backupDue(state) {
  return state.day - (state.lastBackupDay ?? 0) >= BACKUP_REMINDER_DAYS;
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
  if (state.version === 3) {
    // v4 added development: tier, hidden potential, growth progress.
    for (const op of state.crew) prepareOperative(op);
    for (const r of state.recruits) {
      const rng = nextRng(state);
      r.potential = rollPotential(rng, r.stats, r.quality, r.role);
      r.scoutError = rollScoutError(rng);
      r.scoutReport = potentialRead(r, scoutFor(state.crew, r.role)?.handle, r.name.split(' ')[0]);
    }
    state.version = 4;
  }
  if (state.version === 4) {
    // v5 added clients (trust) and job variations. Old offers have no client,
    // no variation and no twist, which the code treats as plain jobs.
    state.clients = state.clients ?? {};
    state.version = 5;
  }
  if (state.version === 5) {
    // v6 added a growth log per operative (this season's rises and declines).
    for (const op of state.crew) op.growthLog = op.growthLog ?? [];
    state.version = 6;
  }
  if (state.version === 6) {
    // v7 added freelancers: a board of guns for hire, refreshed every Monday.
    if (!state.freelancers) refreshFreelancers(state);
    state.version = 7;
  }
  return state;
}
