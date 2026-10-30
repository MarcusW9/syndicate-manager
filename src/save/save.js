// The ONLY module that touches storage. On iOS, swap the three
// storage functions below for Capacitor Preferences or Filesystem;
// nothing else in the game needs to change.
//
// Layout:
//   syndicate-active-slot          '1' | '2' | '3'
//   syndicate-slot-N               the save in slot N
//   syndicate-slot-N-backup        automatic weekly backup of slot N (not for Ironman)
//   syndicate-slot-N-unreadable    a save in slot N that couldn't be opened, kept aside with its backup
//   syndicate-ironman-progress     { [ironmanId]: highest save counter seen }
//   syndicate-save-v1              legacy single save, moved into slot 1 on first load

import { refreshSideBoard } from '../core/sidetasks.js';
import { SAVE_VERSION } from '../core/state.js';
import { addOffer } from '../core/jobs.js';
import { STARTING_ROSTER_CAP } from '../core/recruits.js';
import { prepareOperative, rollPotential, rollScoutError, scoutFor, potentialRead } from '../core/development.js';
import { nextRng } from '../core/random.js';
import { refreshFreelancers } from '../core/freelance.js';
import { GEAR, emptyLoadout, loadoutOf } from '../core/gear.js';

export const SLOT_COUNT = 3;
export const BACKUP_REMINDER_DAYS = 28;
const LEGACY_KEY = 'syndicate-save-v1';
const ACTIVE_KEY = 'syndicate-active-slot';
const IRONMAN_KEY = 'syndicate-ironman-progress';
const slotKey = (n) => `syndicate-slot-${n}`;
const backupKey = (n) => `syndicate-slot-${n}-backup`;
const unreadableKey = (n) => `syndicate-slot-${n}-unreadable`;

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
  const raw = storageGet(slotKey(slot));
  if (!raw) return null;
  try { return migrate(JSON.parse(raw)); } catch (err) { keepUnreadable(slot, raw, err); return null; }
}

// --- unreadable saves: kept aside, never lost -----------------------------
// When a slot's save can't be opened (a newer version than this copy of the game, which can
// happen for one launch after an update while the offline copy catches up; or damaged data),
// the game starts afresh and that fresh game saves over the slot. So first the save and the
// slot's backup are copied aside here, and the Save screen offers them back (owner's report,
// 2026-10-30: a reset game).

function keepUnreadable(slot, raw, err) {
  if (readJson(unreadableKey(slot))?.raw === raw) return;
  let parsed = null;
  try { parsed = JSON.parse(raw); } catch { /* damaged: keep the text as it is */ }
  storageSet(unreadableKey(slot), JSON.stringify({
    raw,
    backupRaw: storageGet(backupKey(slot)),
    newer: typeof parsed?.version === 'number' && parsed.version > SAVE_VERSION,
    reason: err.message,
    day: typeof parsed?.day === 'number' ? parsed.day : null,
  }));
}

/** The save kept aside for a slot, or null: { day, newer, reason }. */
export function unreadableSave(slot = getActiveSlot()) {
  const kept = readJson(unreadableKey(slot));
  return kept ? { day: kept.day, newer: kept.newer, reason: kept.reason } : null;
}

/**
 * Open the kept save, put it (and its backup) back in the slot and stop keeping it aside.
 * Returns the state, or throws the same errors as loading a file (still too new, damaged,
 * an older copy of an Ironman run).
 */
export function restoreUnreadable(slot = getActiveSlot()) {
  const kept = readJson(unreadableKey(slot));
  if (!kept) throw new Error('Nothing kept for this slot');
  const state = migrate(JSON.parse(kept.raw));
  checkIronman(state);
  if (kept.backupRaw) storageSet(backupKey(slot), kept.backupRaw);
  storageRemove(unreadableKey(slot));
  return state;
}

/** Download the kept save exactly as it was, so it's safe outside the browser. */
export function exportUnreadable(slot = getActiveSlot()) {
  const kept = readJson(unreadableKey(slot));
  if (!kept) return;
  const url = URL.createObjectURL(new Blob([kept.raw], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `syndicate-slot${slot}-${kept.day ? `day${kept.day}-` : ''}kept.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function discardUnreadable(slot = getActiveSlot()) {
  storageRemove(unreadableKey(slot));
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
  if (state.version > SAVE_VERSION) throw new Error('This save is from a newer version of the game. Reload the page to update, then try again.');
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
  if (state.version === 7) {
    // v8 added statuses and contract fields (jobs with the crew, main stat at last pay deal, last notice).
    for (const op of state.crew) prepareOperative(op);
    state.version = 8;
  }
  if (state.version === 8) {
    // v9 added renewal notices (decision messages) and op.renewalAgain after a refused raise.
    for (const op of state.crew) prepareOperative(op);
    state.version = 9;
  }
  if (state.version === 9) {
    // v10 added the heat fixer notice: when it last fired, and whether the next job starts watched.
    state.heatNoticeDay = state.heatNoticeDay ?? null;
    state.heatWatched = state.heatWatched ?? false;
    state.version = 10;
  }
  if (state.version === 10) {
    // v11 added street talk: this week's rumour ({ id, until }), rolled every Monday.
    state.rumour = state.rumour ?? null;
    state.version = 11;
  }
  if (state.version === 11) {
    // v12 added job gates for the rookie start: jobs unlock by reputation. Games started
    // before keep an open board.
    state.jobGates = state.jobGates ?? false;
    state.version = 12;
  }
  if (state.version === 12) {
    // v13 added dayStartCash: cash at the start of the day, for the top bar's daily change.
    state.dayStartCash = state.dayStartCash ?? state.cash;
    state.version = 13;
  }
  if (state.version === 13) {
    // v14 records age on memorial entries (portraits use it for grey hair). Older entries
    // have no age; their portraits draw as if under 45.
    state.version = 14;
  }
  if (state.version === 14) {
    // v15 gives new job reports a timeline ({ result, steps, outcome }) so the message reads
    // top to bottom. Older reports keep their single paragraph; the screen splits it into lines.
    state.version = 15;
  }
  if (state.version === 15) {
    // v16 records each job as events ({ kind, actor, stat, die, need, success, costs, why })
    // for the report's full log, and hands-off runs keep their standing orders. A job saved
    // mid-way starts its record now; older reports have no full log and show without one.
    if (state.activeMission) state.activeMission.events ??= [];
    state.version = 16;
  }
  if (state.version === 16) {
    // v17: hands-off jobs come back when the crew does (state.awayJobs), not the moment they're sent.
    state.awayJobs ??= [];
    state.version = 17;
  }
  if (state.version === 17) {
    // v18 added side tasks: this week's board, people out on them, and intel on districts.
    state.sideOut ??= [];
    state.intel ??= {};
    if (!state.sideBoard) refreshSideBoard(state);
    state.version = 18;
  }
  if (state.version === 18) {
    // v19 added earned traits (core/earned.js): op.earned (what they've become) and op.track
    // (hidden counters). Everyone starts with none; history from before can't be replayed.
    for (const op of state.crew) { op.earned ??= []; op.track ??= {}; }
    state.version = 19;
  }
  if (state.version === 19) {
    // v20: two crises shared the id 'collector'; The Favourite's is now collector1 and Last
    // Ticket's collector2. A job saved mid-way (played or hands-off) keeps its place.
    const renamed = { favourite: 'collector1', last_ticket: 'collector2' };
    const fix = (am) => {
      const to = am && renamed[am.templateId];
      if (!to) return;
      for (const q of am.queue ?? []) if (q.type === 'crisis' && q.id === 'collector') q.id = to;
      for (const e of am.events ?? []) if (e.crisis === 'collector') e.crisis = to;
    };
    fix(state.activeMission);
    for (const j of state.awayJobs ?? []) fix(j.mission);
    state.version = 20;
  }
  if (state.version === 20) {
    // v21: the squad run (PLAN-CORE-LOOP.md). The social approach is now con; a job saved mid-way
    // keeps today's flow (no incidents in its queue) and gets the run's new fields: a played job
    // calls the player at every crisis, as before; a hands-off job never does.
    const fix = (am, callIn) => {
      if (!am) return;
      if (am.approach === 'social') am.approach = 'con';
      am.callIn = am.callIn ?? callIn;
      am.alert = am.alert ?? 0;
      am.out = am.out ?? [];
      am.pending = am.pending ?? null;
      am.overwatch = am.overwatch ?? null;
      am.wentLoud = am.wentLoud ?? false;
    };
    fix(state.activeMission, 'every');
    for (const j of state.awayJobs ?? []) fix(j.mission, 'never');
    state.version = 21;
  }
  if (state.version === 21) {
    // v22: Wheels and standby (PLAN-CORE-LOOP.md, slice 3). A job saved mid-way had neither.
    for (const am of [state.activeMission, ...(state.awayJobs ?? []).map((j) => j.mission)]) {
      if (!am) continue;
      am.wheels = am.wheels ?? null;
      am.standby = am.standby ?? null;
    }
    state.version = 22;
  }
  if (state.version === 22) {
    // v23: gear (PLAN-CORE-LOOP.md, slice 5). The safehouse's shared rifle and drone become two
    // items: whoever has one on overwatch in a job saved mid-way carries it; the rest go to the stash.
    state.stash = state.stash ?? [];
    for (const op of state.crew) op.gear = op.gear ?? emptyLoadout();
    const kits = new Set(['rifle', 'drone']);
    for (const am of [state.activeMission, ...(state.awayJobs ?? []).map((j) => j.mission)]) {
      const ow = am?.overwatch && state.crew.find((o) => o.id === am.overwatch.id);
      if (!ow || !GEAR[am.overwatch.kit]) continue;
      const slot = GEAR[am.overwatch.kit].slot;
      if (!ow.gear[slot]) ow.gear[slot] = loadoutOf(state, [am.overwatch.kit])[slot];
      kits.delete(am.overwatch.kit);
    }
    for (const kit of kits) state.stash.push(loadoutOf(state, [kit])[GEAR[kit].slot]);
    state.version = 23;
  }
  if (state.version === 23) {
    // v24: inbox messages open by id, and two traits earned the same way on the same day (Crew
    // Anchor with two partners) shared one, so the second couldn't be opened. Give each its own.
    const seen = new Set();
    for (const m of state.inbox ?? []) {
      let id = m.id;
      for (let n = 2; seen.has(id); n++) id = `${m.id}-${n}`;
      m.id = id;
      seen.add(id);
      // Old Crew Anchor messages: name the partner in the subject, as new ones do.
      const partner = /crew_anchor/.test(m.id) && !/ with /.test(m.subject ?? '') ? /on jobs with ([^;]+);/.exec(m.body ?? '')?.[1] : null;
      if (partner) m.subject = `${m.subject} with ${partner}`;
    }
    state.version = 24;
  }
  if (state.version === 24) {
    // v25: a new game picks its founders before day 1 (state.js chooseFounders). Saves already
    // have their crew.
    state.founding = state.founding ?? null;
    state.version = 25;
  }
  if (state.version === 25) {
    // v26: fights (PLAN-CORE-LOOP.md, slice 6). A job keeps its fight in am.battle while one is on;
    // jobs saved before fights existed have none.
    for (const am of [state.activeMission, ...(state.awayJobs ?? []).map((j) => j.mission)]) if (am) am.battle = am.battle ?? null;
    state.version = 26;
  }
  return state;
}
