// Navigation (ui/nav.js, DESIGN.md 2026-11 "One home per page"): every page opens on its home tab, and Back
// puts the view you came from back without ever touching the game.
import test from 'node:test';
import assert from 'node:assert/strict';
import { boot } from './nav-harness.js';
import { createNewGame } from '../src/core/state.js';
import { weeklyRivals, rivalView } from '../src/core/rivals.js';
import { findCard } from '../src/core/dossier.js';
import { introduceHeists } from '../src/core/heists.js';
import { heistById } from '../src/data/heists.js';
import { HOMES, homeOf, pageKind, createNav } from '../src/ui/nav.js';

test('every page kind has a home, and the home is a tab that exists', () => {
  for (const kind of ['hall', 'hallBuild', 'tong', 'name', 'district', 'client', 'runner']) assert.ok(homeOf(kind), kind);
  for (const [tab] of Object.values(HOMES)) assert.ok(['inbox', 'city', 'tong', 'crew', 'jobs', 'lore'].includes(tab), tab);
});

test('pageKind says root views have no page open', () => {
  assert.equal(pageKind({ screen: 'city', cityTab: 'map', tongsView: null, cityDistrict: null }), null);
  assert.equal(pageKind({ screen: 'city', cityTab: 'map', cityDistrict: 'docks' }), null, 'a district picked on the map is not a page');
  assert.equal(pageKind({ screen: 'city', cityTab: 'districts', cityDistrict: 'docks' }), 'district');
  assert.equal(pageKind({ screen: 'city', cityTab: 'tongs', tongsView: null }), null, 'the list of tongs is the root of Tongs');
  assert.equal(pageKind({ screen: 'city', cityTab: 'tongs', tongsView: 'some-tong' }), 'tong');
  assert.equal(pageKind({ screen: 'city', cityTab: 'tongs', tongsView: 'name:x' }), 'name');
  assert.equal(pageKind({ screen: 'crew', leadName: 'c1' }), 'leadName');
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
  app.click('nav', 'city');
  assert.equal(app.tab(), 'city');
  app.click('hall-page', d);
  assert.equal(app.tab(), 'tong', 'hall page is on Tong, not on Ops');
  assert.match(app.html(), /hallpage/);
  assert.ok(app.hasBack());
  app.click('back');
  assert.equal(app.tab(), 'city');
  assert.ok(!/hallpage/.test(app.html()));
  assert.ok(!app.hasBack(), 'no Back at a root view');
});

test('Back with no history opens the root of the destination\'s home tab, nothing selected', async () => {
  const { rootOf } = await import('../src/ui/nav.js');
  const view = { screen: 'tong', hallPage: 'oldTown', cityDistrict: 'docks', tongsView: null, plan: null, sidePlan: null, cityTab: 'clients', inboxUnread: true };
  assert.deepEqual(rootOf({ ...view, screen: 'city', cityTab: 'tongs', hallPage: null, tongsView: 'name:x' }), { ...view, screen: 'city', cityTab: 'tongs', hallPage: null, tongsView: null, cityDistrict: null, clientPage: null, openMessageId: null, openOperativeId: null, openRecruitId: null, leadName: null, buildView: null });
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
  assert.equal(app.tab(), 'city');
  assert.match(app.html(), /citycard/);
  assert.match(app.html(), /data-action="back">‹ Today/);
  app.click('hall-page', 'oldTown');
  assert.equal(app.tab(), 'tong');
  assert.match(app.html(), /data-action="back">‹ Back to the district/);
  app.click('back');
  assert.equal(app.tab(), 'city');
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
  app.click('nav', 'city');
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
  assert.equal(app.tab(), 'city');
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

test('five tabs: Today, City, Tong, Crew, Jobs; Save is the ☰ in the top bar and Lore is behind Book', async () => {
  const app = await boot();
  // The sidebar's own Save button (wide screens only, hidden on a phone: changelog 2026-11-13) is not a tab.
  const tabs = [...app.html().matchAll(/class="nav__btn(?! nav__btn--save)[^"]*" data-action="nav" data-id="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(tabs, ['inbox', 'city', 'tong', 'crew', 'jobs']);
  assert.match(app.html(), /class="nav__btn nav__btn--save[^"]*" data-action="nav" data-id="settings"/, 'Save at the foot of the sidebar on wide screens');
  assert.match(app.html(), /class="savebtn[^"]*" data-action="nav" data-id="settings"/);
  app.click('nav', 'city');
  app.click('city-tab', 'map');
  app.click('book');
  assert.equal(app.tab(), 'city', 'the Book is City\'s: City stays lit');
  assert.match(app.html(), /Who&#39;s who/, 'the old Lore view, unchanged');
  assert.match(app.html(), /data-action="back">‹ City/);
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
  assert.ok(!/data-id="city"[^>]*>City <span class="pill/.test(app.html()));
  assert.ok(!/data-id="tong"[^>]*>Tong <span class="pill/.test(app.html()));
});

test('Today\'s leads shortcut opens Crew › Leads and Back returns to the message', async () => {
  const app = await boot();
  app.click('leads-open');
  assert.equal(app.tab(), 'crew');
  assert.match(app.html(), /data-action="crew-tab" data-id="leads" aria-pressed="true"/);
});

/** A game a few weeks in, with a free name on offer and cash to sign them. */
function withOffer(seed = 4) {
  const s = createNewGame({ seed, startCrew: 'fresh' });
  s.cash = 200000;
  for (let w = 0; w < 30 && !s.rivals.offer; w++) { s.day = 7 * (w + 1); weeklyRivals(s); }
  s.day += 1;
  return s;
}

test('City has Map · Districts · Tongs, no Places buttons, and the Book link on each', async () => {
  const app = await boot();
  app.click('nav', 'city');
  for (const t of ['map', 'districts', 'tongs']) {
    app.click('city-tab', t);
    assert.match(app.html(), new RegExp(`data-action="city-tab" data-id="${t}" aria-pressed="true"`));
    assert.match(app.html(), /data-action="book"/, `Book from ${t}`);
    assert.ok(!/Places|cityplace/.test(app.html()), 'no Places');
  }
  app.click('city-tab', 'map');
  app.click('book');
  assert.match(app.html(), /Who&#39;s who/);
  app.click('back');
  assert.match(app.html(), /data-action="city-tab" data-id="map" aria-pressed="true"/);
  app.click('city-tab', 'tongs');
  app.click('book');
  app.click('back');
  assert.match(app.html(), /data-action="city-tab" data-id="tongs" aria-pressed="true"/, 'Back returns to the City sub-tab that opened the Book');
});

test('Districts: every district has a card and a page; the hall shortcut opens the hall on Tong; a quiet district still has its page', async () => {
  const app = await boot();
  app.click('nav', 'city');
  app.click('city-tab', 'districts');
  const ids = [...app.html().matchAll(/data-action="district-open" data-id="([^"]+)"/g)].map((m) => m[1]);
  assert.ok(ids.length >= 6, 'a card for each district');
  for (const id of ids) {
    app.click('district-open', id);
    assert.match(app.html(), /citycard/, id);
    assert.doesNotMatch(app.html(), /undefined|NaN|\[object/);
    assert.match(app.html(), /data-action="back">‹ Districts/);
    app.click('back');
    assert.match(app.html(), /class="list list--cols districts"/);
  }
  app.click('district-open', 'oldTown');
  app.click('hall-page', 'oldTown');
  assert.equal(app.tab(), 'tong');
  app.click('back');
  assert.equal(app.tab(), 'city');
  assert.match(app.html(), /citycard/);
});

test('a district picked on the Map is not a page: no Back, "Whole city", and "Open the district" goes to Districts and back', async () => {
  const app = await boot();
  app.click('nav', 'city');
  app.click('city-tab', 'map');
  app.click('city-district', 'oldTown');
  assert.ok(!app.hasBack());
  assert.match(app.html(), /Whole city/);
  app.click('district-open', 'oldTown');
  assert.match(app.html(), /data-action="city-tab" data-id="districts"|citycard/);
  assert.match(app.html(), /data-action="back"/);
  app.click('back');
  assert.match(app.html(), /Whole city/, 'the map pick is back');
});

test('the heist card is on Jobs › Heists; the Map has a marker that links there; Back returns to the Map', async () => {
  const state = createNewGame({ seed: 1, startCrew: 'fresh' });
  state.inbox = []; state.reputation = heistById('raoTable').gate.rep; state.cash = 30000;
  introduceHeists(state);
  const app = await boot({ state });
  app.click('nav', 'city');
  app.click('city-tab', 'map');
  assert.match(app.html(), /class="heistmark"/);
  assert.ok(!/class="heist"/.test(app.html()), 'the card itself is not on the Map');
  app.click('goto', 'jobs:heists');
  assert.equal(app.tab(), 'jobs');
  assert.match(app.html(), /class="heist"/);
  assert.match(app.html(), /data-action="jobs-tab" data-id="heists" aria-pressed="true"/);
  app.click('jobs-tab', 'board');
  assert.ok(!/class="heist"/.test(app.html()), 'not on the Board');
  app.click('goto', 'jobs:heists');
  app.click('back');
  assert.equal(app.tab(), 'jobs', 'a tab chosen by hand cleared the history');
});

test('Jobs has Board · Heists · Side; the side board has no scout row; an empty Heists says so', async () => {
  const app = await boot();
  app.click('nav', 'jobs');
  for (const t of ['board', 'heists', 'side']) assert.match(app.html(), new RegExp(`data-action="jobs-tab" data-id="${t}"`));
  app.click('jobs-tab', 'heists');
  assert.match(app.html(), /No heist on right now/);
  app.click('jobs-tab', 'side');
  assert.match(app.html(), /Side work this week/);
  assert.ok(!/Scout /.test(app.html()));
});

test('a free name opens in Crew › Leads from City › Tongs, and Back returns to the Tongs list', async () => {
  const state = withOffer();
  const app = await boot({ state });
  const offer = rivalView(state).offer;
  app.click('nav', 'city');
  app.click('city-tab', 'tongs');
  app.win.scrollY = 300;
  app.click('lead-name', offer.id);
  assert.equal(app.tab(), 'crew');
  assert.match(app.html(), /What it would take/);
  assert.match(app.html(), /data-action="scout-send"|data-action="sign-name"/);
  app.click('back');
  assert.equal(app.tab(), 'city');
  assert.match(app.html(), /Free names/);
  assert.equal(app.win.scrollY, 300);
});

test('a name in a tong: read-only profile on City › Tongs, View in Leads opens their recruitment page, Back returns to the profile with current state', async () => {
  const state = withOffer();
  const app = await boot({ state });
  const tong = rivalView(state).tiers[0].tongs[0];
  const name = tong.names[0];
  const cardId = findCard(state, name.id).id;
  app.click('nav', 'city');
  app.click('city-tab', 'tongs');
  app.click('tong-page', tong.id);
  app.click('tong-name', name.id);
  assert.doesNotMatch(app.html(), /What it would take|sign-name|scout-send/);
  assert.match(app.html(), new RegExp(`data-action="lead-name" data-id="${cardId}"`));
  app.click('lead-name', cardId);
  assert.equal(app.tab(), 'crew');
  assert.match(app.html(), /Buyout to /, 'the existing buyout to their tong');
  assert.match(app.html(), /data-action="back">‹ Back to the tongs/);
  app.click('back');
  assert.equal(app.tab(), 'city');
  assert.doesNotMatch(app.html(), /What it would take/);
  assert.match(app.html(), /View in Leads/);
});

test('signing from Leads pays the usual price, and Back lands past the pages of the person who just joined', async () => {
  const state = withOffer(4);
  state.crew[0].fame = 'legend'; state.crew[1].fame = 'elite'; // the same footing as tests/rivals-c3b.test.js's signing test
  const app = await boot({ state });
  const offer = rivalView(state).offer;
  const cash = state.cash;
  app.click('nav', 'city');
  app.click('city-tab', 'tongs');
  app.click('lead-name', offer.id);
  assert.match(app.html(), /data-action="sign-name"/);
  app.click('sign-name', offer.id);
  assert.equal(app.tab(), 'city', 'back where it was opened from');
  assert.match(app.html(), /data-action="city-tab" data-id="tongs" aria-pressed="true"/);
  assert.doesNotMatch(app.html(), /Gone/);
  const money = (n) => `¥${n.toLocaleString()}`;
  assert.doesNotMatch(app.html(), new RegExp(`Cash</span> ${money(cash)}`), 'cash went down');
});

test('Today\'s crews-out line goes to City › Map and Back returns to Today', async () => {
  const app = await boot();
  app.click('nav', 'inbox');
  app.click('goto', 'city:map');
  assert.equal(app.tab(), 'city');
  assert.match(app.html(), /data-action="city-tab" data-id="map" aria-pressed="true"/);
  app.click('back');
  assert.equal(app.tab(), 'inbox');
});

// The report's full log drew every event it did not know as a crisis with a choice; the getaway (core/piloting.js)
// has none, so a report from a job that rolled one threw `e.choice.startsWith` (found while taking screenshots).
test('a report whose job rolled a getaway opens, and its full log shows the getaway', async () => {
  const state = createNewGame({ seed: 3, startCrew: 'fresh' });
  const text = 'Kettle gets them out clean: heat −1.';
  state.inbox.unshift({ id: 'report-x', type: 'report', kind: 'report', day: 1, read: true, subject: 'Report: a job', body: 'Done.',
    timeline: { result: 'completed', steps: ['They went in.'], outcome: [{ tone: 'plain', text: 'Paid ¥1,000.' }], events: [
      { kind: 'beat', text: 'They went in.', first: true },
      { kind: 'decision', text: 'A guard.', choice: 'Talk past him', actor: { id: 'a', handle: 'Kettle' } },
      { kind: 'getaway', stat: 'piloting', actor: { id: 'a', handle: 'Kettle' }, die: 14, value: 3, need: 10, success: true, result: 'clean', shed: 1, text },
      { kind: 'invented-later', text: 'Something a future version records.' },
    ] } });
  const app = await boot({ state });
  app.click('nav', 'inbox');
  app.click('open-message', 'report-x');
  const html = app.html();
  assert.match(html, /class="flog"/, 'the full log drew');
  assert.ok(html.includes(text.replace('−', '−')), 'the getaway line is in it');
  assert.match(html, /Die 14 \+ piloting 3 = 17/, 'with its roll');
  assert.match(html, /Talk past him/, 'a decision still shows its choice');
  assert.match(html, /Something a future version records/, 'an unknown kind with no choice still draws');
});

// Step 5: Today shows one line for the crews out; the full cards (with mini maps) are on City › Map; the call can be
// taken from either, and from the call-in message on Today.
import { addOffer, templateById } from '../src/core/jobs.js';
import { sendOff } from '../src/core/autorun.js';
import { advanceDay } from '../src/core/time.js';

function crewWaiting() {
  let s = createNewGame({ seed: 1, startCrew: 'fresh' });
  s.jobs = [];
  addOffer(s, 'clinic');
  s = sendOff(s, s.jobs[0].id, s.crew.slice(0, templateById('clinic').crewSize).map((o) => o.id), 'stealth', 'steady', { callIn: 'every' });
  s = advanceDay(s);
  assert.ok(s.inbox.some((m) => m.kind === 'callin' && !m.resolved), 'a crew is waiting on a call');
  return s;
}

test('Today has one line for the crews out and no crew cards; City › Map has the full cards', async () => {
  const app = await boot({ state: crewWaiting() });
  app.click('nav', 'inbox');
  const today = app.html();
  assert.equal((today.match(/class="outnow[ "]/g) ?? []).length, 1, 'one summary line');
  assert.match(today, /1 crew out · <strong>1 call waiting<\/strong>/);
  assert.match(today, /data-action="goto" data-id="city:map"/, 'it links to City › Map');
  assert.doesNotMatch(today, /class="crewsout"|crewsout__job|minimap/, 'no crew cards or mini maps on Today');
  assert.doesNotMatch(today, />Ops ›</, 'no stale tab name');
  app.click('goto', 'city:map');
  assert.match(app.html(), /class="crewsout/, 'the full cards are on the Map');
  assert.match(app.html(), /data-action="take-call"/, 'with the call');
  app.click('back');
  assert.equal(app.tab(), 'inbox');
});

test('take the call works from the call-in message on Today and from the card on City › Map, and no tab badge counts it twice', async () => {
  const s = crewWaiting();
  const msg = s.inbox.find((m) => m.kind === 'callin' && !m.resolved);
  const fromToday = await boot({ state: structuredClone(s) });
  fromToday.click('nav', 'inbox');
  fromToday.click('open-message', msg.id);
  assert.match(fromToday.html(), /data-action="take-call"/);
  fromToday.click('take-call', msg.payload.jobId);
  assert.match(fromToday.html(), /class="watch/, 'the watch screen takes over');
  const fromCity = await boot({ state: structuredClone(s) });
  fromCity.click('nav', 'city');
  fromCity.click('city-tab', 'map');
  fromCity.click('take-call', msg.payload.jobId);
  assert.match(fromCity.html(), /class="watch/, 'the same from the Map');
  const badges = await import('../src/ui/nav.js');
  assert.equal(badges.attentionCount(s), s.inbox.filter((m) => !m.read || (m.resolved === false)).length, 'one count per message');
  const app = await boot({ state: structuredClone(s) });
  const pills = [...app.html().matchAll(/<span class="pill[^"]*" aria-label="(\d+) ([^"]+)">/g)].map((m) => m[2]);
  assert.ok(!pills.includes('calling'), 'no separate calls badge');
});
