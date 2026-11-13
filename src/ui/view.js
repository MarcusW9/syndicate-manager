// The UI's own state (never saved): which screen and sub-tab is open, what is being planned, what to
// scroll to after the next draw. Every screen module reads and writes it as V.<name>. The game state is
// `state`, a live binding set only through setGame (called by app.js setState and mountApp).
// The Back stack's helpers (ui/nav.js) live here too, because they only touch this state.
import { FULL_VIEW } from './citymap.js';
import { CLIENTS } from '../data/clients.js';
import { createNav, rootOf, pageKind, homeOf, homeSub, placeLabel, TAB_NAMES } from './nav.js';

export let state;
export const setGame = (next) => (state = next);
export let root;
export const setRoot = (next) => (root = next);

export const V = {
  screen: 'inbox',
  cityDistrict: null, // the district picked on the City map (the map zooms onto it), or the district page open on City › Districts
  mapView: FULL_VIEW, // where the City map was looking when last drawn ([x, y, w, h]); it eases from here to the next view
  mapTo: null, // the view the map is heading for, set while drawing it
  cityTab: 'map', // City's sub-tab: 'map' | 'districts' | 'tongs'
  loreTab: 'factions', // which Book section is showing (LORE_TABS)
  jobsTab: 'board', // Jobs' sub-tab: 'board' | 'heists' | 'side'
  leadName: null, // a name opened in Crew › Leads (scouting, what it would take, Sign): a card id
  clientPage: null, // a client's page on Jobs › Clients: a client id
  cityMapDue: false, // scroll the map into view after drawing (a crew's district picked in the list)
  openMessageId: null,
  sidePlan: null, // { taskId, crew: [] } while planning a side task (Jobs tab)
  playReportId: null, // a hands-off report playing out on its first open (renderReportTimeline)
  openOperativeId: null,
  openRecruitId: null,
  tongTab: 'halls', // Tong's sub-tab: 'halls' | 'armoury' (ui/gear.js draws the Armoury)
  crewTab: 'roster', // Crew's sub-tab: 'roster' | 'leads' | 'wall'
  hallInside: null, // inside one building of the open hall (a part's id), or null for the compound (2026-11-09; UI only, never saved)
  buildView: null, // the hall build screen, from a hall's page (ui/hallbuild.js): { district, cell, piece, rot, picked }
  tongsView: null, // City › Tongs: null (the list), a tong's id or `name:<id>` (a name's profile) (ui/tongs.js)
  hallPage: null, // a hall's own page (2026-11-07), by district: from Tong › Halls, a district page or a raid card; always on Tong
  gearSlot: null, // the place being filled on a runner's page: 'armour', 'implant:0', 'bag:2,1'
  bagPick: null, // the bag item picked up on a runner's page, to move or take off
  newGameSlot: null, // slot number while picking a difficulty
  plan: null, // { jobId, crew: [...ids], approach, orders, callIn, overwatch: id|null, kit, wheels: id|null, standby: id|null } (core/mission.js startMission)
  pickSlot: null,
  pickSort: 'fit', // the picker's sort: best fit, or one of the job's key stats (2026-11-06)
  continueRestUntil: 0,
  dayCue: null, // what the day that just started brought; shown once, on the next render
  sendOffCue: null, // the crew that just left (the send-off card); shown once, on the next render
  importInput: null, // the hidden save-file picker (see mountApp)
  focusNext: null, // { action, id }: the control to focus after the next render (going back to a list)
  traitTip: null, // 'pageId|key': the trait chip or synergy whose card is open (one at a time)
  raidCardDue: null, // scroll to this district's raid card after the next render (heat chip, Today, the map)
  scrollDue: null, // scroll to this after the next render (Back restores where you were)
  founderPick: [], // candidate ids picked so far on a new game's first screen (renderFounding)
  runnersHidden: false, // the job board's runners panel, folded away for this session
  clientOpen: false, // the plan's client background, shown on tap (owner, 2026-11-04: the same on every job they offer)
  planTryList: [], // the plan bar's "Try" changes as last drawn (core/squad.js planTries), applied by index
  ordersOpen: false, // the plan's How / Call me in / When they decide, folded to one line until tapped (2026-11-05)
  boardRulesOpen: false, // the squad board's rules line, behind an i
  briefOpen: true, // the open job's brief in full, or two lines and "Read more"
  readMemo: null, // the plan read as last drawn: { jobId, sig, rows: Map(row key → effective risk), level }
  readBefore: null, // the read before the last change to the plan, for "was low" (2026-11-05)
  readFresh: false, // this draw is the first since the plan changed: flash what moved
  jossSig: null, // the plan as Joss picked it (on opening a job, or Joss's picks); their reason shows while it's unchanged
  whyOpen: false, // the plan bar's notes, all of them, on tap
  buzzStage: null, // the direct buzz (a heist's call): null ringing, 'open' picked up (playtest, 2026-11-07)
  inboxUnread: false, // Today's list: only unread messages (playtest, 2026-11-07)
  jossFoldedDay: null, // Joss's line folded to one line for this day; a new day opens it again (owner, 2026-11-11)
  upcomingDue: false, // scroll to Coming up after the next render (Today's "next up" line on a phone)
  planBarHtml: '', // the plan bar as renderPlan last drew it; the jobs screen places it (under the list on wide screens)
  meetHidden: null, // the plan's "What they'll likely meet" read folded away; null until first shown (folded on phones)
};
export const openInfo = new Set(); // which (i) explanations are open (infoButton) // the squad-board slot being filled ('in:<n>' or 'over'), while its picker is open
// Continue rests briefly after each new day, so a double click can't skip one.
export const CONTINUE_REST_MS = 800;
export const backPlayed = new Set(); // back cards whose faces have already slid home: they play once, not on every redraw
export const nav = createNav(); // the Back stack (ui/nav.js): views to return to, never game state
export const briefSeen = new Set(); // jobs whose brief has been shown in full once this session (2026-11-05)
export const buzzLater = new Set(); // calls let ring out this session: they ring again next time

// --- navigation (ui/nav.js) --------------------------------------------
/** The view as it is now: everything Back has to put back. Plan objects are kept by reference (the plan is UI, not game state). */
export function viewNow() {
  return { screen: V.screen, openMessageId: V.openMessageId, openOperativeId: V.openOperativeId, openRecruitId: V.openRecruitId, leadName: V.leadName, tongTab: V.tongTab, crewTab: V.crewTab, jobsTab: V.jobsTab, hallPage: V.hallPage, buildView: V.buildView, tongsView: V.tongsView, cityDistrict: V.cityDistrict, cityTab: V.cityTab, loreTab: V.loreTab, clientPage: V.clientPage, inboxUnread: V.inboxUnread, plan: V.plan, sidePlan: V.sidePlan };
}

/** A link to a page: remember this view (and the control that was tapped) so Back can return to it. */
export function remember(action, id) {
  nav.push({ ...viewNow(), via: { action, id }, scrollY: window.scrollY ?? 0 });
  V.scrollDue = 0;
}

/** Put a remembered view back. Pages that have gone since (a lead hired, a job taken) fall back to their list. */
export function restoreView(v) {
  ({ screen: V.screen, openMessageId: V.openMessageId, openOperativeId: V.openOperativeId, openRecruitId: V.openRecruitId, leadName: V.leadName, tongTab: V.tongTab, crewTab: V.crewTab, jobsTab: V.jobsTab, hallPage: V.hallPage, buildView: V.buildView, tongsView: V.tongsView, cityDistrict: V.cityDistrict, cityTab: V.cityTab, loreTab: V.loreTab, clientPage: V.clientPage, inboxUnread: V.inboxUnread, plan: V.plan, sidePlan: V.sidePlan } = v);
  if (V.openMessageId && !state.inbox.some((m) => m.id === V.openMessageId)) V.openMessageId = null;
  if (V.openOperativeId && ![...state.crew, ...state.memorial].some((o) => o.id === V.openOperativeId)) V.openOperativeId = null;
  if (V.openRecruitId && !(state.recruits ?? []).some((r) => r.id === V.openRecruitId)) V.openRecruitId = null;
  if (V.plan && !state.jobs.some((j) => j.id === V.plan.jobId)) V.plan = null;
  if (V.clientPage && !CLIENTS.some((c) => c.id === V.clientPage)) V.clientPage = null;
  V.gearSlot = null; V.bagPick = null; V.pickSlot = null;
}

/** Back with nothing to go back to (a direct link, a fresh load): the root of the page's home tab, no page opened. */
export function toRoot() {
  restoreView(rootOf(viewNow()));
  V.scrollDue = 0;
}

/** Is Back showing on this view? On any opened page, never at a root view (a district only picked on the map is not a page: it has "Whole city"). */
export const canGoBack = () => !!pageKind(viewNow());

export function setSub(tab, sub) {
  if (tab === 'city') V.cityTab = sub; else if (tab === 'tong') V.tongTab = sub; else if (tab === 'crew') V.crewTab = sub; else if (tab === 'jobs') V.jobsTab = sub;
}

/** Open a kind of page on its home tab and sub-tab (ui/nav.js HOMES). */
export function goHome(kind) {
  V.screen = homeOf(kind);
  const sub = homeSub(kind);
  if (sub) setSub(V.screen, sub);
}

/** The Back control's words: where it will land. */
export function backLabel() {
  const top = nav.peek();
  if (top) { const l = placeLabel(top); return /^[A-Z]/.test(l) ? l : `Back to ${l}`; }
  return TAB_NAMES[homeOf(pageKind(viewNow())) ?? V.screen] ?? 'Back';
}
