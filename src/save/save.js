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

import { syncHeat } from '../core/heat.js';
import { homeHall, syncHalls } from '../core/halls.js';
import { STARTING_RANK } from '../data/tong.js';
import { refreshSideBoard } from '../core/sidetasks.js';
import { SAVE_VERSION } from '../core/state.js';
import { TATTOO_JOBS } from '../core/marks.js';
import { seedRecord } from '../core/record.js';
import { seedMilestones } from '../core/milestones.js';
import { seedFame } from '../core/fame.js';
import { nameLook, refreshArmoury, stockShelf } from '../core/looks.js';
import { PIECES } from '../data/hallBuild.js';
import { money } from '../core/money.js';
import { addOffer, templateById } from '../core/jobs.js';
import { STARTING_ROSTER_CAP } from '../core/recruits.js';
import { prepareOperative, rollPotential, rollScoutError, scoutFor, potentialRead } from '../core/development.js';
import { nextRng } from '../core/random.js';
import { refreshFreelancers } from '../core/freelance.js';
import { GEAR, makeItem } from '../core/gear.js';
import { CELLS } from '../data/gear.js';
import { trimInbox } from '../core/inbox.js';
import { seedRivals, offerGapFor } from '../core/rivals.js';

// The one-item-per-slot gear of saves before v45, for the migrations written against it.
const slotLoadout = () => ({ weapon: null, armour: null, tool: null, implant: null });
const slotItem = (state, type) => makeItem(state, type, 'street');

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

/** Save v51: the stat key driving became piloting everywhere it was stored (stats, potential, progress, growth logs, a job's key stats, a mission in play). */
function drivingToPiloting(state) {
  const walk = (v) => {
    if (Array.isArray(v)) { v.forEach((x, i) => { if (x === 'driving') v[i] = 'piloting'; else walk(x); }); return; }
    if (!v || typeof v !== 'object') return;
    for (const k of Object.keys(v)) {
      if (k === 'driving') { v.piloting = v.driving; delete v.driving; }
    }
    for (const k of Object.keys(v)) {
      if (v[k] === 'driving') v[k] = 'piloting'; else walk(v[k]);
    }
  };
  walk(state);
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
    for (const op of state.crew) op.gear = op.gear ?? slotLoadout();
    const kits = new Set(['rifle', 'drone']);
    for (const am of [state.activeMission, ...(state.awayJobs ?? []).map((j) => j.mission)]) {
      const ow = am?.overwatch && state.crew.find((o) => o.id === am.overwatch.id);
      if (!ow || !GEAR[am.overwatch.kit]) continue;
      const slot = GEAR[am.overwatch.kit].slot;
      if (!ow.gear[slot]) ow.gear[slot] = slotItem(state, am.overwatch.kit);
      kits.delete(am.overwatch.kit);
    }
    for (const kit of kits) state.stash.push(slotItem(state, kit));
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
  if (state.version === 26) {
    // v27: a loud run's first guard is always a fight (am.fought: has this run had one yet). A job
    // saved mid-way has fought if its record shows a fight.
    for (const am of [state.activeMission, ...(state.awayJobs ?? []).map((j) => j.mission)]) {
      if (am) am.fought = am.fought ?? (am.events ?? []).some((e) => e.kind === 'battle' && e.phase === 'start');
    }
    state.version = 27;
  }
  if (state.version === 27) {
    // v28: command fights. Everyone in a fight stands in cover (cover; now: this round's, if an order
    // changed it; spot: where on the site map's spots, if the fight has any), the guards' next move is
    // rolled ahead (intents; none yet means the round rolls it), and a fight can be left to the crew (auto).
    for (const am of [state.activeMission, ...(state.awayJobs ?? []).map((j) => j.mission)]) {
      for (const x of am?.battle ? [...am.battle.guards, ...am.battle.runners] : []) { x.cover = x.cover ?? 'half'; x.now = x.now ?? null; }
      if (am?.battle) Object.assign(am.battle, { intents: am.battle.intents ?? null, spots: am.battle.spots ?? null, auto: am.battle.auto ?? false });
      for (const x of am?.battle ? [...am.battle.guards, ...am.battle.runners] : []) x.spot = x.spot ?? null;
    }
    state.version = 28;
  }
  if (state.version === 28) {
    // v29: career marks and gun looks (brought in 2026-10-30 from the branch where they were made,
    // as its v25-v27). Career marks (core/marks.js): nobody has scars or chrome on record yet;
    // anyone who has already worked ten jobs with the crew gets the crew's mark now, with a line
    // saying so. Rifles already owned keep the look they had (gunmetal and wood, or carbon for pro)
    // and get a name; sidearms already owned become plain blued compact pistols with a name; the
    // armoury stocks its first rifles and sidearms. A sidearm may carry a rolled quirk (item.quirk);
    // none means the plain sidearm's numbers (core/gear.js sidearmStats).
    for (const op of state.crew) {
      op.marks = op.marks ?? [];
      if (!op.freelance && (op.jobsWithCrew ?? 0) >= TATTOO_JOBS && !op.marks.some((m) => m.kind === 'tattoo')) {
        op.marks.push({ kind: 'tattoo', day: state.day });
        op.history = [...(op.history ?? []), `Day ${state.day}: got the crew's mark (${TATTOO_JOBS} jobs together)`];
      }
    }
    for (const entry of state.memorial ?? []) entry.marks = entry.marks ?? [];
    const owned = [...(state.stash ?? []), ...state.crew.flatMap((op) => Object.values(op.gear ?? {}))];
    for (const item of owned.filter((i) => i?.type === 'rifle' && !i.look)) {
      item.look = { frame: 'marksman', finish: item.tier === 'pro' ? 'carbon' : 'street', engraving: null, charm: null };
      item.name = nameLook(state, `item|${item.uid}`, item.look);
    }
    for (const item of owned.filter((i) => i?.type === 'pistol' && !i.look)) {
      item.look = { frame: 'compact', finish: 'blued', mod: null, charm: null };
      item.name = nameLook(state, `item|${item.uid}`, item.look, 'pistol');
    }
    if (!state.armoury) refreshArmoury(state);
    else if (!state.armoury.offers.some((o) => o.type === 'pistol')) state.armoury.offers.push(...stockShelf(state, 'pistol'));
    state.version = 29;
  }
  if (state.version === 29) {
    // v30: runner record (core/record.js). Everyone who has worked gets one, guessed from the jobs they've
    // done (marked estimated); the memorial keeps no record for people who were lost before it began.
    for (const op of state.crew) seedRecord(op, { today: state.day });
    for (const m of state.memorial ?? []) m.record = m.record ?? null;
    state.version = 30;
  }
  if (state.version === 30) {
    // v31: milestones and highlights on the record (core/milestones.js). What a record has already
    // reached counts as earned, so an old crew doesn't get a flood of milestones on its next job.
    for (const op of state.crew) { if (op.record) delete op.record.milestones; seedMilestones(op); }
    state.version = 31;
  }
  if (state.version === 31) {
    // v32: fame and standing (core/fame.js). Everyone with a record gets standing from their jobs
    // (3 a job, at most 50) and the fame their record reaches, capped at respected: nobody starts
    // as Elite (it comes with its message once standing and the record back it up). The record
    // gains lowWeeks and wasElite (Elite lapsing). Memorial entries are unchanged.
    for (const op of state.crew) seedFame(op);
    state.version = 32;
  }
  if (state.version === 32) {
    // v33: fame's payoffs (renown slice 4). An offer can ask for a runner by name (job.askedFor,
    // carried onto the run as am.askedFor), at most one a week (state.namedOfferWeek). None yet on
    // an old save. Pay-rise messages gain payload.reason ('growth' or 'fame'); old ones are growth.
    for (const job of state.jobs ?? []) job.askedFor = job.askedFor ?? null;
    for (const am of [state.activeMission, ...(state.awayJobs ?? []).map((j) => j.mission)]) if (am) am.askedFor = am.askedFor ?? null;
    state.namedOfferWeek = state.namedOfferWeek ?? null;
    for (const m of state.inbox ?? []) if (m.kind === 'renewal' && m.payload) m.payload.reason = m.payload.reason ?? 'growth';
    state.version = 33;
  }
  if (state.version === 33) {
    // v34: the tong's rank replaces tier (DESIGN.md 2026-11-04). Tier never moved off 'street' and
    // nothing read it, and ranks have no gates yet, so every tong starts at the first rank.
    delete state.tier;
    state.rank = STARTING_RANK;
    state.version = 34;
  }
  if (state.version === 34) {
    // v35: away jobs play a share a day and can call in (core/away.js). A job already out gets its
    // beat count (none reached yet: it plays from where it is) and isn't waiting on a call.
    for (const j of state.awayJobs ?? []) { j.mission.away = j.mission.away ?? { beats: 0 }; j.waiting = false; j.today = null; }
    state.version = 35;
  }
  if (state.version === 35) {
    // v36: an offer has its own days (core/jobs.js daysRange); offers already on the board keep
    // the template's, as before.
    for (const job of state.jobs ?? []) job.days = job.days ?? templateById(job.templateId)?.days ?? 1;
    state.version = 36;
  }
  if (state.version === 36) {
    // v37: the week's start for the Sunday summary (core/week.js), measured from today on an old
    // save; and a crew lead on a job (core/lead.js): none on jobs already running.
    state.weekStart = state.weekStart ?? { day: state.day, cash: state.cash, reputation: state.reputation ?? 0 };
    for (const am of [state.activeMission, ...(state.awayJobs ?? []).map((j) => j.mission)]) if (am) am.lead = am.lead ?? null;
    state.version = 37;
  }
  if (state.version === 37) {
    // v38: halls (core/halls.js). The safehouse becomes the Old Town hall with its beds, rent and
    // level; everyone lives there; the rank follows the halls (one hall: Back Room).
    state.halls = [{ ...homeHall(state.rosterCap ?? STARTING_ROSTER_CAP, state.rent ?? 0), level: state.safehouseLevel ?? 1 }];
    delete state.safehouseLevel;
    state.hallOffers = state.hallOffers ?? [];
    for (const op of state.crew) if (!op.freelance) op.hall = op.hall ?? 'oldTown';
    syncHalls(state);
    state.version = 38;
  }
  if (state.version === 38) {
    // v39: heat per district (core/heat.js). The old city-wide heat goes to the home district (it
    // followed the tong home); a ride already in place stays true (the next job, wherever it is).
    if (!state.heatBy || !Object.keys(state.heatBy).length) state.heatBy = { oldTown: state.heat ?? 0 };
    syncHeat(state);
    state.version = 39;
  }
  if (state.version === 39) {
    // v40: raids on the halls (core/raids.js). Nobody has been raided yet; no hall is shut.
    state.raids = state.raids ?? [];
    state.version = 40;
  }
  if (state.version === 40) {
    // v41: gangs' grudges (core/gangs.js), and raids that say who's coming. No gang has a quarrel
    // with us yet; every raid so far was the police.
    state.grudges = state.grudges ?? { redLanterns: 0, silverFan: 0 };
    for (const r of state.raids ?? []) r.by = r.by ?? 'police';
    state.version = 41;
  }
  if (state.version === 41) {
    // v42: building up a hall (core/hallbuild.js): nothing built in any hall yet.
    for (const h of state.halls ?? []) h.build = h.build ?? [];
    state.version = 42;
  }
  if (state.version === 42) {
    // v43: opening jobs (core/halls.js). A hall already offered or opened needs no favour now.
    state.openings = state.openings ?? {};
    for (const d of [...(state.hallOffers ?? []), ...(state.halls ?? []).map((h) => h.district)]) state.openings[d] = { status: 'done', jobId: null };
    state.version = 43;
  }
  if (state.version === 43) {
    // v44: a hall can be bought outright (core/halls.js buyHall): none is yet.
    for (const h of state.halls ?? []) h.owned = h.owned ?? false;
    state.version = 44;
  }
  if (state.version === 44) {
    // v45: the carry grid (DESIGN.md 2026-11-06). Armour stays worn, the implant goes in the first
    // socket, and the weapon and tool go in the bag: the weapon at the top left, the tool on the next
    // row if it's long (3 cells), else beside the weapon. A 4×2 bag always holds both.
    for (const op of [...state.crew, ...(state.memorial ?? [])]) {
      const g = op.gear;
      if (!g || Array.isArray(g.bag)) continue;
      const bag = [];
      if (g.weapon) bag.push({ item: g.weapon, x: 0, y: 0 });
      if (g.tool) bag.push((CELLS[g.tool.type] ?? 1) > 1 || !g.weapon ? { item: g.tool, x: 0, y: g.weapon ? 1 : 0 } : { item: g.tool, x: CELLS[g.weapon.type] ?? 1, y: 0 });
      op.gear = { armour: g.armour ?? null, implants: g.implant ? [g.implant] : [], bag };
    }
    state.version = 45;
  }
  if (state.version === 45) {
    // v46: the inbox is kept bounded (core/inbox.js, DESIGN.md 2026-11-06). Long saves had every
    // message since day 1; trim them now as the daily tick does. Nothing still waiting is dropped.
    trimInbox(state);
    state.version = 46;
  }
  if (state.version === 46) {
    // v47: heists (core/heists.js, DESIGN.md 2026-11-07). No heist has been offered in an older save;
    // the first Monday that meets a heist's gate offers it.
    state.heists = state.heists ?? {};
    state.version = 47;
  }
  if (state.version === 47) {
    // v48: the Old Town hall is a compound that grows with Expand (data/sites.js HALLS.oldTown
    // `parts`, DESIGN.md 2026-11-07), drawn anew, so its squares are not where they were. What was
    // built there is paid back in full, with a note; the beds and the level stay as they are.
    const hall = (state.halls ?? []).find((h) => h.district === 'oldTown');
    const built = hall?.build ?? [];
    if (built.length) {
      const back = built.reduce((n, b) => n + (PIECES[b.piece]?.cost ?? 0), 0);
      state.cash = (state.cash ?? 0) + back;
      hall.build = [];
      state.inbox = state.inbox ?? [];
      state.inbox.unshift({
        id: `hall-redrawn-oldTown-${state.day ?? 1}`, type: 'finance', day: state.day ?? 1,
        subject: 'The Old Town hall has room to grow',
        body: `The hall is a block of its own now: the room, the lane beside it, and the flat, the yard and the back kitchen to take as it grows. What we'd built there is cleared and paid back in full: ${money(back)}. Build it again on the new plan.`,
        blocking: false, read: false,
      });
    }
    state.version = 48;
  }
  if (state.version === 48) {
    // v49: the other four halls are compounds too (DESIGN.md 2026-11-07), drawn anew: what was built
    // in each is paid back in full, with a note, as Old Town's was at v48.
    for (const hall of state.halls ?? []) {
      if (hall.district === 'oldTown' || !hall.build?.length) continue;
      const back = hall.build.reduce((n, b) => n + (PIECES[b.piece]?.cost ?? 0), 0);
      state.cash = (state.cash ?? 0) + back;
      hall.build = [];
      state.inbox = state.inbox ?? [];
      state.inbox.unshift({
        id: `hall-redrawn-${hall.district}-${state.day ?? 1}`, type: 'finance', day: state.day ?? 1,
        subject: 'A hall with room to grow',
        body: `Our hall in ${hall.district === 'nightMarket' ? 'the Night Market' : hall.district === 'docks' ? 'the Docks' : hall.district === 'basin' ? 'the Basin' : 'Glass Heights'} is a block of its own now, with more of it to take as it grows. What we'd built there is cleared and paid back in full: ${money(back)}. Build it again on the new plan.`,
        blocking: false, read: false,
      });
    }
    state.version = 49;
  }
  if (state.version === 49) {
    // v50: Glass Heights' opening favour is Still on the Books, asked by Forewoman Tse (DESIGN.md
    // 2026-11-07); There Is No Forty-First Floor is retired. An offer of it on the board becomes the
    // new job, Tse's; a run already under way finishes as it was (data/missions.js RETIRED_MISSIONS).
    // The Night Market's favour stays back_rent, now Mrs. Ip's: an offer of it moves to her too.
    for (const job of state.jobs ?? []) {
      if (job.templateId === 'there_is_no_forty_first_floor') { job.templateId = 'still_on_the_books'; job.clientId = 'tse'; }
      if (job.templateId === 'back_rent') job.clientId = 'ip';
    }
    state.version = 50;
  }
  if (state.version === 50) {
    // v51: driving is piloting (drafts/PROPOSAL-piloting.md, DESIGN.md 2026-11-08). The stat key moves
    // everywhere it was stored: stats, potential, progress, growth logs, a job's key stats, a mission in
    // play. Done as a walk so no copy of the old name is left behind.
    drivingToPiloting(state);
    state.version = 51;
  }
  if (state.version === 51) {
    // v52: the other tongs (DESIGN.md 2026-11-08). hashRng only, so nothing else in the save moves. (A save
    // made on the branch where this was v51 skipped the piloting walk above: run it again, it is harmless.)
    drivingToPiloting(state);
    state.rivals = seedRivals(state);
    state.version = 52;
  }
  if (state.version === 52) {
    // v53: the Legend defining job (DESIGN.md 2026-11-08): runners gain `legend` and `legendCall`, offers
    // `defining`. Nobody is a Legend yet on an old save; the first call comes when someone is ready.
    for (const op of state.crew ?? []) { op.legend ??= null; op.legendCall ??= null; }
    state.version = 53;
  }
  if (state.version === 53) {
    // v54: C3 (DESIGN.md 2026-11-08 "C3 designed"): a tong's `grudge` becomes `regard`; tongs gain poorWeeks, splitDay
    // and foldedDay; rivals gain the free name's `offer`, `scouted`, `lastScout`, `offerSeq` and `nextOfferDay`.
    const r = state.rivals;
    if (r) {
      for (const t of r.tongs ?? []) { delete t.grudge; t.regard ??= 0; t.poorWeeks ??= 0; t.splitDay ??= 0; t.foldedDay ??= null; }
      r.offer ??= null; r.scouted ??= {}; r.lastScout ??= null; r.offerSeq ??= 0;
      if (r.nextOfferDay == null) r.nextOfferDay = state.day + offerGapFor(state, r);
    }
    state.version = 54;
  }
  if (state.version === 54) {
    // v55: retirement and the Hall of Legends (DESIGN.md 2026-11-09): `state.hall`, empty until someone retires.
    state.hall ??= [];
    state.version = 55;
  }
  if (state.version === 55) {
    // v56: loyalty becomes `op.loyalty` 0-100 (DESIGN.md 2026-11-09). Seeded from jobs together at 4 points
    // a job, the old rule exactly, so no renewal changes on upgrade.
    for (const op of state.crew ?? []) if (!op.freelance && op.loyalty == null) op.loyalty = Math.min(100, Math.round((op.jobsWithCrew ?? 0) * 4));
    state.version = 56;
  }
  if (state.version === 56) {
    // v57: sworn runners (DESIGN.md 2026-11-09): `op.sworn` (the day, or null) and `op.oathNotified`. A runner already
    // eligible is marked notified, so an old save is not met with a notice.
    for (const op of state.crew ?? []) { op.sworn ??= null; op.oathNotified ??= !op.freelance && (op.record?.activeWeeks ?? 0) >= 26 && (op.loyalty ?? 0) >= 80; }
    state.version = 57;
  }
  if (state.version === 57) {
    // v58: raid warnings get a stated plan (`raid.plan`: 'hold' | 'clear' | null) and the one-off fixer call
    // is remembered (`raidCallSeen`). A save that already has raids has been through the warnings: skip the call.
    for (const r of state.raids ?? []) r.plan ??= null;
    state.raidCallSeen ??= (state.raids ?? []).length > 0;
    state.version = 58;
  }
  if (state.version === 58) {
    // v59: C4, rivals feel alive (DESIGN.md 2026-11-09). `state.rivals.threads` (stories told in beats), every card gains
    // `runnerId` and `formerOf`, every runner gains `runnerId`. A card made when a runner of ours left (its id starts
    // 'op:') is marked as theirs; the rest are null. One stable id per person: drop the 'op:' and 'x' prefixes
    // that signing and leaving add ('xc12' is the runner signed from card 'c12').
    const base = (id) => { let x = String(id); for (;;) { const y = x.replace(/^op:/, '').replace(/^x(?=c\d|op:)/, ''); if (y === x) return x; x = y; } };
    for (const op of state.crew ?? []) op.runnerId ??= base(op.id);
    if (state.rivals) {
      state.rivals.threads ??= [];
      for (const c of state.rivals.cards ?? []) { c.runnerId ??= base(c.id); c.formerOf ??= String(c.id).startsWith('op:') ? 'player' : null; }
    }
    state.version = 59;
  }
  if (state.version === 59) {
    // v60: C5, the Anchor's Book (DESIGN.md 2026-11-09): `state.rivals.book`, null until the first slate goes up.
    if (state.rivals) state.rivals.book ??= null;
    state.version = 60;
  }
  return state;
}
