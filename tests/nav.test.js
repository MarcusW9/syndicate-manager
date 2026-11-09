// Navigation (ui/nav.js, DESIGN.md 2026-11 "One home per page"): every page opens on its home tab, and Back
// puts the view you came from back without ever touching the game.
import test from 'node:test';
import assert from 'node:assert/strict';
import { boot } from './nav-harness.js';
import { HOMES, homeOf, pageKind, createNav } from '../src/ui/nav.js';

test('every page kind has a home, and the home is a tab that exists', () => {
  for (const kind of ['hall', 'hallBuild', 'tong', 'name', 'district', 'client', 'runner']) assert.ok(homeOf(kind), kind);
  for (const tab of Object.values(HOMES)) assert.ok(['inbox', 'ops', 'crew', 'jobs', 'lore'].includes(tab), tab);
});

test('pageKind says root views have no page open', () => {
  assert.equal(pageKind({ screen: 'ops', tongsView: null, cityDistrict: null }), null);
  assert.equal(pageKind({ screen: 'ops', tongsView: '', cityDistrict: null }), 'tong');
  assert.equal(pageKind({ screen: 'ops', tongsView: 'name:x' }), 'name');
  assert.equal(pageKind({ screen: 'crew', hallPage: 'oldTown' }), 'hall');
  assert.equal(pageKind({ screen: 'crew', hallPage: 'oldTown', buildView: {} }), 'hallBuild');
  assert.equal(pageKind({ screen: 'crew', openOperativeId: 'a', hallPage: 'oldTown' }), 'runner');
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
  assert.equal(app.tab(), 'crew', 'hall page is on Crew, not on Ops');
  assert.match(app.html(), /hallpage/);
  assert.ok(app.hasBack());
  app.click('back');
  assert.equal(app.tab(), 'ops');
  assert.ok(!/hallpage/.test(app.html()));
  assert.ok(!app.hasBack(), 'no Back at a root view');
});

test('Back with no history opens the root of the destination\'s home tab, nothing selected', async () => {
  const { rootOf } = await import('../src/ui/nav.js');
  const view = { screen: 'crew', hallPage: 'oldTown', cityDistrict: 'docks', tongsView: null, plan: null, sidePlan: null, cityTab: 'clients', inboxUnread: true };
  assert.deepEqual(rootOf({ ...view, screen: 'ops', hallPage: null, tongsView: 'name:x' }), { ...view, screen: 'ops', hallPage: null, tongsView: null, cityDistrict: null, loreDistrict: null, openMessageId: null, openOperativeId: null, openRecruitId: null, openArmoury: false, buildView: null });
  const hall = rootOf({ ...view, screen: 'crew' });
  assert.equal(hall.screen, 'crew');
  assert.equal(hall.hallPage, null);
  assert.equal(rootOf({ screen: 'jobs', plan: { jobId: 'j' } }).screen, 'jobs');
  assert.equal(rootOf({ screen: 'jobs', plan: { jobId: 'j' } }).plan, null);
  assert.equal(rootOf({ screen: 'inbox', openMessageId: 'm' }).openMessageId, null);
  assert.equal(rootOf({ screen: 'crew', openArmoury: true }).openArmoury, false);
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
  assert.equal(app.tab(), 'crew');
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
  assert.equal(app.tab(), 'crew');
  assert.match(app.html(), /<h1>Armoury<\/h1>/);
  assert.match(app.html(), /data-action="back">← Back to the job/);
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
  app.click('nav', 'crew');
  app.win.scrollY = 640;
  app.click('hall-page', 'oldTown');
  assert.equal(app.win.scrollY, 0);
  app.click('back');
  assert.equal(app.win.scrollY, 640);
});
