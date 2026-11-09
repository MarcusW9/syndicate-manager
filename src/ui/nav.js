// Navigation context (UI only; docs/SCREENS.md "Layout rules"). No DOM, no game state.
//
// Two jobs:
//  1. HOMES: every kind of page has one home tab. A page always opens on its home, whichever tab the
//     link was on; links elsewhere are shortcuts to that home. While a destination is still on its old
//     tab the lookup says so (update the entry in the same commit that moves the page).
//  2. The Back stack: when a link takes you to a page, the view you were on is remembered (tab,
//     sub-tab, filters, the open page, an in-progress plan, scroll). Back puts that view back. It is
//     navigation only: nothing here holds a copy of the game, so a page returned to shows the state now.

/** Page kind → the tab it opens on. */
export const HOMES = Object.freeze({
  hall: 'crew',      // a hall's own page (moves to Tong › Halls in step 2)
  hallBuild: 'crew', // the hall build screen, reached from the hall page
  tong: 'ops',       // another tong's page
  name: 'ops',       // a name's page (a free name or one in a tong)
  district: 'ops',   // a district's page (the card on the map)
  client: 'jobs',    // a client's page (the strip on the job board for now)
  runner: 'crew',    // a runner's page
  recruit: 'crew',   // a lead's page
  armoury: 'crew',   // the armoury and its gear sheet
  message: 'inbox',  // a message on Today
  plan: 'jobs',      // a job's plan and the squad board
  sidePlan: 'jobs',  // a side job's plan
});

/** The home tab for a page kind, or null for a kind with no entry. */
export const homeOf = (kind) => HOMES[kind] ?? null;

export const TAB_NAMES = Object.freeze({ inbox: 'Today', ops: 'Ops', crew: 'Crew', jobs: 'Jobs', lore: 'Lore', settings: 'Save' });

/**
 * The page a view is showing, as a kind in HOMES, or null at a root view (nothing opened).
 * The order matches what the screen draws first. `ui` is any object with the view's fields.
 */
export function pageKind(ui) {
  const { screen } = ui;
  if (screen === 'inbox') return ui.openMessageId ? 'message' : null;
  if (screen === 'jobs') return ui.plan ? 'plan' : ui.sidePlan ? 'sidePlan' : null;
  if (screen === 'crew') {
    if (ui.openRecruitId) return 'recruit';
    if (ui.openOperativeId) return 'runner';
    if (ui.openArmoury) return 'armoury';
    if (ui.buildView) return 'hallBuild';
    if (ui.hallPage) return 'hall';
    return null;
  }
  if (screen === 'ops') {
    if (typeof ui.tongsView === 'string') return ui.tongsView.startsWith('name:') ? 'name' : 'tong'; // '' is the list of tongs
    return ui.cityDistrict ? 'district' : null;
  }
  return null;
}

/** What a root view has open: nothing. */
const NOTHING_OPEN = Object.freeze({ openMessageId: null, openOperativeId: null, openRecruitId: null, openArmoury: false, hallPage: null, buildView: null, tongsView: null, cityDistrict: null, loreDistrict: null, plan: null, sidePlan: null });

/**
 * Back with no history (a direct link, a fresh load): the root view of the page's home tab, with no page
 * selected. A view that is already a root stays on its own tab.
 */
export function rootOf(ui) {
  return { ...ui, ...NOTHING_OPEN, screen: homeOf(pageKind(ui)) ?? ui.screen };
}

/** A short name for where a view is, for the Back control: "Today", or "the hall". */
export function placeLabel(ui) {
  const kind = pageKind(ui);
  if (!kind) return TAB_NAMES[ui.screen] ?? 'back';
  if (kind === 'tong' || kind === 'name') return 'the tongs';
  return { message: 'the message', plan: 'the job', sidePlan: 'the side job', runner: 'the runner', recruit: 'the lead', armoury: 'the Armoury', hall: 'the hall', hallBuild: 'the build', district: 'the district' }[kind];
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
