// Navigation (ui/nav.js, DESIGN.md 2026-11 "One home per page"): every page opens on its home tab, and Back
// puts the view you came from back without ever touching the game.
import test from 'node:test';
import assert from 'node:assert/strict';
import { boot } from './nav-harness.js';
import { HOMES, homeOf, pageKind, createNav } from '../src/ui/nav.js';

test('every page kind has a home, and the home is a tab that exists', () => {
  for (const kind of ['hall', 'hallBuild', 'tong', 'name', 'district', 'client', 'runner']) assert.ok(homeOf(kind), kind);
  for (const [tab] of Object.values(HOMES)) assert.ok(['inbox', 'ops', 'tong', 'crew', 'jobs', 'lore'].includes(tab), tab);
});

test('pageKind says root views have no page open', () => {
  assert.equal(pageKind({ screen: 'ops', tongsView: null, cityDistrict: null }), null);
  assert.equal(pageKind({ screen: 'ops', tongsView: '', cityDistrict: null }), 'tong');
  assert.equal(pageKind({ screen: 'ops', tongsView: 'name:x' }), 'name');
  assert.equal(pageKind({ screen: 'tong', hallPage: 'oldTown' }), 'hall');
  assert.equal(pageKind({ screen: 'tong', hallPage: 'oldTown', buildView: {} }), 'hallBuild');
  assert.equal(pageKind({ screen: 'tong', tongTab: 'armoury' }), null, 'the Armoury is a sub-tab, not a page');
  assert.equal(pageKind({ screen: 'crew', openOperativeId: 'a' }), 'runner');
  assert.equal(pageKind({ screen: 'lore' }), 'book');
});

test('the stack holds views and nothing else', () => {
  const nav = createNav(2);
  nav.push(1); nav.push(2); nav.push(3);
  assert.equal(nav.depth, 2);
  assert.equal(nav.pop(), 3);
  nav.clear();
  assert.equal(nav.pop(), null);
});

test('a hall opens on its home tab whichever tab the link was on, and Back returns to the tab it came from', async () => {
  const app = await boot();
  const d = 'oldTown';
  app.click('nav', 'ops');
  assert.equal(app.tab(), 'ops');
  app.click('hall-page', d);
  assert.equal(app.tab(), 'tong', 'hall page is on Tong, not on Ops');
  assert.match(app.html(), /hallpage/);
  assert.ok(app.hasBack());
  app.click('back');
  assert.equal(app.tab(), 'ops');
  assert.ok(!/hallpage/.test(app.html()));
  assert.ok(!app.hasBack(), 'no Back at a root view');
});

test('Back with no history opens the root of the destination\'s home tab, nothing selected', async () => {
  const { rootOf } = await import('../src/ui/nav.js');
  const view = { screen: 'tong', hallPage: 'oldTown', cityDistrict: 'docks', tongsView: null, plan: null, sidePlan: null, cityTab: 'clients', inboxUnread: true };
  assert.deepEqual(rootOf({ ...view, screen: 'ops', hallPage: null, tongsView: 'name:x' }), { ...view, screen: 'ops', hallPage: null, tongsView: null, cityDistrict: null, loreDistrict: null, openMessageId: null, openOperativeId: null, openRecruitId: null, buildView: null });
  const hall = rootOf({ ...view, tongTab: 'armoury' });
  assert.equal(hall.screen, 'tong');
  assert.equal(hall.tongTab, 'halls', 'the home sub-tab of a hall');
  assert.equal(hall.hallPage, null);
  assert.equal(rootOf({ screen: 'crew', crewTab: 'wall', openRecruitId: 'r' }).crewTab, 'leads');
  assert.equal(rootOf({ screen: 'jobs', plan: { jobId: 'j' } }).screen, 'jobs');
  assert.equal(rootOf({ screen: 'jobs', plan: { jobId: 'j' } }).plan, null);
  assert.equal(rootOf({ screen: 'inbox', openMessageId: 'm' }).openMessageId, null);
  });

test('Today → district → hall → Back → district → Back → Today', async () => {
  const app = await boot();
  app.click('nav', 'inbox');
  assert.ok(!app.hasBack(), 'Today is a root view');
  app.click('ops-district', 'oldTown');
  assert.equal(app.tab(), 'ops');
  assert.match(app.html(), /citycard/);
  assert.match(app.html(), /data-action="back">‹ Today/);
  app.click('hall-page', 'oldTown');
  assert.equal(app.tab(), 'tong');
  assert.match(app.html(), /data-action="back">‹ Back to the district/);
  app.click('back');
  assert.equal(app.tab(), 'ops');
  assert.match(app.html(), /citycard/, 'the district is still open');
  app.click('back');
  assert.equal(app.tab(), 'inbox');
  assert.ok(!app.hasBack());
});

test('a shortcut mid-plan: Plan → Armoury → Back keeps the plan as it was', async () => {
  const app = await boot();
  app.click('nav', 'jobs');
  const state = (await import('../src/core/state.js')).createNewGame({ seed: 3, startCrew: 'fresh' });
  const jobId = state.jobs[0].id;
  app.click('open-job', jobId);
  app.click('approach', 'loud');
  const same = (h) => h.replace(/pf\d+/g, 'pf'); // portraits number their gradients as they are drawn
  const before = same(app.html());
  assert.equal(app.tab(), 'jobs');
  app.click('open-armoury');
  assert.equal(app.tab(), 'tong');
  assert.match(app.html(), /data-action="tong-tab" data-id="armoury" aria-pressed="true"/, 'the Armoury sub-tab');
  assert.match(app.html(), /data-action="back">‹ Back to the job/);
  app.click('back');
  assert.equal(app.tab(), 'jobs');
  assert.equal(same(app.html()), before, 'the same plan, the same approach, the same squad');
});

test('Back shows the game as it is now, not as it was', async () => {
  const app = await boot();
  app.click('nav', 'crew');
  const date = () => app.html().match(/topbar__date">([^<]+)</)[1];
  app.click('open-armoury');
  const then = date();
  app.click('continue');
  app.click('back');
  assert.equal(app.tab(), 'crew');
  assert.notEqual(date(), then, 'the day moved on while away');
});

test('choosing a tab starts fresh navigation', async () => {
  const app = await boot();
  app.click('nav', 'inbox');
  app.click('ops-district', 'oldTown');
  app.click('hall-page', 'oldTown');
  app.click('nav', 'ops');
  assert.ok(!/hallpage/.test(app.html()));
  app.click('nav', 'inbox');
  app.click('ops-district', 'oldTown');
  app.click('back');
  assert.equal(app.tab(), 'inbox', 'one Back from the district reaches Today: the earlier hops are gone');
});

test('a name\'s page from the side board goes back to the board; signing or not, Back never lands on a removed page', async () => {
  const app = await boot();
  app.click('nav', 'jobs');
  app.click('tong-name', 'nobody');
  assert.equal(app.tab(), 'ops');
  assert.match(app.html(), /Gone/);
  app.click('back');
  assert.equal(app.tab(), 'jobs');
  assert.ok(!app.hasBack());
});

test('Back puts the scroll position back; a new page starts at the top', async () => {
  const app = await boot();
  app.click('nav', 'tong');
  app.win.scrollY = 640;
  app.click('hall-page', 'oldTown');
  assert.equal(app.win.scrollY, 0);
  app.click('back');
  assert.equal(app.win.scrollY, 640);
});

test('five tabs: Today, Ops, Tong, Crew, Jobs; Save is the ☰ in the top bar and Lore is behind Book', async () => {
  const app = await boot();
  const tabs = [...app.html().matchAll(/class="nav__btn[^"]*" data-action="nav" data-id="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(tabs, ['inbox', 'ops', 'tong', 'crew', 'jobs']);
  assert.match(app.html(), /class="savebtn[^"]*" data-action="nav" data-id="settings"/);
  app.click('nav', 'ops');
  app.click('city-whole'); // an earlier test left a district selected on the map
  app.click('book');
  assert.equal(app.tab(), 'ops', 'the Book is City\'s: Ops stays lit');
  assert.match(app.html(), /Who&#39;s who/, 'the old Lore view, unchanged');
  assert.match(app.html(), /data-action="back">‹ Ops/);
  app.click('back');
  assert.ok(!/Who&#39;s who/.test(app.html()));
  assert.ok(!app.hasBack());
});

test('Tong has Halls and Armoury; Crew has Roster, Leads and Wall', async () => {
  const app = await boot();
  app.click('nav', 'tong');
  assert.match(app.html(), /The Old Town hall|Old Town/);
  assert.match(app.html(), /data-action="hall-page"/);
  assert.ok(!/data-action="crew-tab"/.test(app.html()));
  app.click('tong-tab', 'armoury');
  assert.match(app.html(), /In the stash|stash|Buy/i);
  app.click('nav', 'crew');
  for (const t of ['roster', 'leads', 'wall']) assert.match(app.html(), new RegExp(`data-action="crew-tab" data-id="${t}"`));
  assert.ok(!/data-action="hall-page"/.test(app.html()), 'halls are not on Crew any more');
  app.click('crew-tab', 'wall');
  assert.match(app.html(), /The wall/);
});

test('the badge rule: attention counts once on Today; Ops and Tong show nothing; Jobs shows open jobs', async () => {
  const { attentionCount, tabBadges } = await import('../src/ui/nav.js');
  const state = { jobs: [{}, {}], inbox: [
    { id: 'a', read: false },                                           // unread news: 1
    { id: 'b', read: false, kind: 'callin', resolved: false },          // an unread call: still 1, not a call count as well
    { id: 'c', read: true, kind: 'raid', resolved: false },             // a raid at the door, read but unanswered: 1
    { id: 'd', read: true, kind: 'callin', resolved: true },            // answered: 0
    { id: 'e', read: true },                                            // read news: 0
  ], halls: [] };
  assert.equal(attentionCount(state), 3);
  const b = tabBadges(state);
  assert.deepEqual(Object.keys(b).sort(), ['inbox', 'jobs']);
  assert.equal(b.jobs.count, 2);
  const app = await boot();
  assert.ok(!/data-id="ops"[^>]*>Ops <span class="pill/.test(app.html()));
  assert.ok(!/data-id="tong"[^>]*>Tong <span class="pill/.test(app.html()));
});

test('Today\'s leads shortcut opens Crew › Leads and Back returns to the message', async () => {
  const app = await boot();
  app.click('leads-open');
  assert.equal(app.tab(), 'crew');
  assert.match(app.html(), /data-action="crew-tab" data-id="leads" aria-pressed="true"/);
});
