// Navigation context (UI only; docs/SCREENS.md "Layout rules"). No DOM, no game state.
//
// Two jobs:
//  1. HOMES: every kind of page has one home tab. A page always opens on its home, whichever tab the
//     link was on; links elsewhere are shortcuts to that home. While a destination is still on its old
//     tab the lookup says so (update the entry in the same commit that moves the page).
//  2. The Back stack: when a link takes you to a page, the view you were on is remembered (tab,
//     sub-tab, filters, the open page, an in-progress plan, scroll). Back puts that view back. It is
//     navigation only: nothing here holds a copy of the game, so a page returned to shows the state now.

import { isActionable } from '../core/inbox.js';

/**
 * Page kind → [the tab it opens on, the sub-tab it opens on (or null)]. Update an entry in the same commit
 * that moves the page, and never point one at a tab or sub-tab that doesn't exist yet.
 */
export const HOMES = Object.freeze({
  hall: ['tong', 'halls'],        // a hall's own page (Tong › Halls since step 2)
  hallBuild: ['tong', 'halls'],   // the hall build screen, reached from the hall page
  armoury: ['tong', 'armoury'],   // the Armoury: stash, carried gear, shop (a sub-tab, not a page)
  tong: ['city', 'tongs'],        // another tong's page (City › Tongs since step 3)
  name: ['city', 'tongs'],        // a name's read-only profile: what we know and who they are with
  district: ['city', 'districts'],// a district's page
  heist: ['jobs', 'heists'],      // the heist card and its steps (Jobs › Heists since step 3)
  client: ['jobs', 'clients'],    // a client's page: trust and the board now, then who they are (Jobs › Clients since step 4)
  runner: ['crew', 'roster'],     // a runner's page
  recruit: ['crew', 'leads'],     // a lead's page
  leadName: ['crew', 'leads'],    // a name's recruitment page: scouting, what it would take, Sign (free names and names in a tong)
  message: ['inbox', null],       // a message on Today
  plan: ['jobs', 'board'],        // a job's plan and the squad board
  sidePlan: ['jobs', 'side'],     // a side job's plan
  book: ['city', 'map'],          // the Book (Who's who and History since step 4), opened from a link in City's header
});

/** The home tab for a page kind, or null for a kind with no entry. */
export const homeOf = (kind) => HOMES[kind]?.[0] ?? null;
/** The home sub-tab for a page kind, or null when its tab has none. */
export const homeSub = (kind) => HOMES[kind]?.[1] ?? null;
/** The UI field that holds a tab's sub-tab. */
export const SUB_KEY = Object.freeze({ city: 'cityTab', tong: 'tongTab', crew: 'crewTab', jobs: 'jobsTab' });

export const TAB_NAMES = Object.freeze({ inbox: 'Today', city: 'City', tong: 'Tong', crew: 'Crew', jobs: 'Jobs', lore: 'Book', settings: 'Save' });

/** Which tab is lit for a screen: the Book is City's page, and Save is the ☰ in the top bar. */
export const tabOf = (screen) => (screen === 'lore' ? 'city' : screen);

const NEEDS_THE_PLAYER = new Set(['hall-offer', 'raid-warning']);
/**
 * Today's badge (layout rule 8): what is waiting on the player, each event once. A message counts if it is
 * unread, or if something still has to be answered (a decision, a call-in, a raid at the door, a hall offer,
 * a raid warning). Calls and raids are inbox messages, so an unread call is one count, not two.
 * Jobs show their own number; City and Tong show none.
 */
export function attentionCount(state) {
  const waiting = (m) => m.resolved === false || (m.blocking && !m.resolved) || (NEEDS_THE_PLAYER.has(m.kind) && isActionable(state, m));
  return state.inbox.filter((m) => !m.read || waiting(m)).length;
}

/** Tab id → { count, word } for the pill on its button; tabs with no entry show none. */
export function tabBadges(state) {
  return { inbox: { count: attentionCount(state), word: 'waiting on you' }, jobs: { count: state.jobs.length, word: 'open' } };
}

/**
 * The page a view is showing, as a kind in HOMES, or null at a root view (nothing opened).
 * The order matches what the screen draws first. `ui` is any object with the view's fields.
 */
export function pageKind(ui) {
  const { screen } = ui;
  if (screen === 'inbox') return ui.openMessageId ? 'message' : null;
  if (screen === 'jobs') return ui.plan ? 'plan' : ui.sidePlan ? 'sidePlan' : ui.clientPage ? 'client' : null;
  if (screen === 'crew') return ui.openRecruitId ? 'recruit' : ui.leadName ? 'leadName' : ui.openOperativeId ? 'runner' : null;
  if (screen === 'tong') return ui.buildView ? 'hallBuild' : ui.hallPage ? 'hall' : null;
  if (screen === 'lore') return 'book';
  if (screen === 'city') {
    if (ui.cityTab === 'tongs') return ui.tongsView ? (ui.tongsView.startsWith('name:') ? 'name' : 'tong') : null;
    return ui.cityTab === 'districts' && ui.cityDistrict ? 'district' : null; // on the Map a district is only picked, not opened
  }
  return null;
}

/** What a root view has open: nothing. */
const NOTHING_OPEN = Object.freeze({ openMessageId: null, openOperativeId: null, openRecruitId: null, leadName: null, hallPage: null, buildView: null, tongsView: null, cityDistrict: null, clientPage: null, plan: null, sidePlan: null });

/**
 * Back with no history (a direct link, a fresh load): the root view of the page's home tab, with no page
 * selected. A view that is already a root stays on its own tab.
 */
export function rootOf(ui) {
  const kind = pageKind(ui);
  const screen = homeOf(kind) ?? ui.screen;
  const sub = homeSub(kind);
  return { ...ui, ...NOTHING_OPEN, screen, ...(sub ? { [SUB_KEY[screen]]: sub } : {}) };
}

/** A short name for where a view is, for the Back control: "Today", or "the hall". */
export function placeLabel(ui) {
  const kind = pageKind(ui);
  if (!kind) {
    const sub = ui[SUB_KEY[ui.screen]];
    return { city: { map: 'City', districts: 'Districts', tongs: 'Tongs' }, tong: { halls: 'Halls', armoury: 'the Armoury' }, crew: { roster: 'Crew', leads: 'Leads', wall: 'the Wall' }, jobs: { board: 'Jobs', heists: 'Heists', side: 'Side work', clients: 'Clients' } }[ui.screen]?.[sub] ?? TAB_NAMES[ui.screen] ?? 'back';
  }
  if (kind === 'tong' || kind === 'name') return 'the tongs';
  return { message: 'the message', plan: 'the job', sidePlan: 'the side job', client: 'the client', runner: 'the runner', recruit: 'the lead', leadName: 'the lead', book: 'the Book', hall: 'the hall', hallBuild: 'the build', district: 'the district' }[kind];
}

/** The Back stack. `limit` keeps a long wander from growing for ever. */
export function createNav(limit = 40) {
  const stack = [];
  return {
    push(ctx) { stack.push(ctx); if (stack.length > limit) stack.shift(); },
    pop() { return stack.pop() ?? null; },
    peek() { return stack.at(-1) ?? null; },
    clear() { stack.length = 0; },
    get depth() { return stack.length; },
  };
}
