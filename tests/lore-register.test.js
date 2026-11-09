// The lore migration register (docs/SCREENS.md, navigation rework step 4): every entry that lived on the old Lore
// view can be reached from its new home, with its content intact, and Back returns to where it was opened.
import test from 'node:test';
import assert from 'node:assert/strict';
import { boot } from './nav-harness.js';
import { DISTRICT_CARDS, FACTIONS, STREET_FACTS, HISTORY } from '../src/data/city.js';
import { CLIENTS } from '../src/data/clients.js';
import { MISSIONS } from '../src/data/missions.js';
import { isOpeningJob } from '../src/data/halls.js';
import { MAP_DISTRICTS } from '../src/ui/citymap.js';
import { NAMES } from '../src/config/names.js';
import { createNewGame } from '../src/core/state.js';
import { trustLabel } from '../src/core/clients.js';

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const has = (html, text) => assert.ok(html.includes(esc(text)), `missing: ${String(text).slice(0, 60)}`);

test('every district has a page in City › Districts with all its passages, lore below the live state, and Back to the list', async () => {
  const app = await boot();
  app.click('nav', 'city');
  app.click('city-tab', 'districts');
  const ids = Object.keys(DISTRICT_CARDS);
  assert.equal(new Set(MAP_DISTRICTS).size, ids.length, 'a card for every district on the map');
  for (const id of ids) {
    assert.match(app.html(), new RegExp(`data-action="district-open" data-id="${id}"`), `${id} has a card`);
    app.click('district-open', id);
    const html = app.html();
    const c = DISTRICT_CARDS[id];
    for (const t of [c.chinese, c.side, c.pitch, c.control, c.police, c.night, c.custom, ...c.landmarks]) has(html, t);
    if (c.locked) has(html, c.teaser);
    const kinds = MISSIONS.filter((m) => m.district === id && !isOpeningJob(m.id) && !m.heistOnly).map((m) => m.name);
    if (kinds.length) has(html, kinds.join(', '));
    else assert.doesNotMatch(html, /Kinds of work here/, `${id}: no kinds line when there are none`);
    assert.ok(html.indexOf('citylore') > html.indexOf('<h2 class="nomargin">'), 'the lore comes after the header');
    if (!c.locked) assert.ok(html.indexOf('citylore') > html.lastIndexOf('citycard__hall') || !html.includes('citycard__hall'), 'lore below the live state');
    assert.doesNotMatch(html, /on Lore|about-district|lore-district|See it on Ops/, 'no stale link');
    assert.match(html, /data-action="back">‹ Districts/);
    app.click('back');
    assert.match(app.html(), /class="list list--cols districts"/);
  }
});

test('a quiet district (no crews, no jobs, no hall) still shows its lore', async () => {
  const app = await boot();
  app.click('nav', 'city');
  app.click('city-tab', 'districts');
  app.click('district-open', 'silt');
  const html = app.html();
  assert.doesNotMatch(html, /citycard__hall|Our hall/);
  has(html, DISTRICT_CARDS.silt.control);
  has(html, DISTRICT_CARDS.silt.teaser);
});

test('district links from other tabs open the same page: the heat chip, and Back returns', async () => {
  const app = await boot();
  app.click('nav', 'inbox');
  app.click('ops-district', 'docks');
  assert.equal(app.tab(), 'city');
  has(app.html(), DISTRICT_CARDS.docks.custom);
  app.click('back');
  assert.equal(app.tab(), 'inbox');
});

test('every client has a page on Jobs › Clients: trust and the board first, the line below; reachable with no jobs; Back to the list', async () => {
  const state = createNewGame({ seed: 3, startCrew: 'fresh' });
  state.jobs = []; // no client has anything on the board
  const app = await boot({ state });
  app.click('nav', 'jobs');
  app.click('jobs-tab', 'clients');
  for (const c of CLIENTS) {
    assert.match(app.html(), new RegExp(`data-action="client-open" data-id="${c.id}"`), `${c.id} is listed`);
    app.click('client-open', c.id);
    const html = app.html();
    has(html, c.name);
    has(html, c.desc);
    assert.ok(html.includes(esc(trustLabel(50))), 'where you stand');
    assert.match(html, /Nothing from them on the board right now/);
    assert.ok(html.indexOf('On the board now') < html.indexOf(esc(c.desc)), 'trust and live information above the lore');
    assert.match(html, /data-action="back">‹ Clients/);
    app.click('back');
    assert.match(app.html(), /class="list list--cols clientlist"/);
  }
});

test('a client with jobs on the board lists them, and the plan links to the same page', async () => {
  const state = createNewGame({ seed: 3, startCrew: 'fresh' });
  const job = state.jobs.find((j) => j.clientId);
  assert.ok(job, 'the opening board has a job with a client');
  const client = CLIENTS.find((c) => c.id === job.clientId);
  const app = await boot({ state });
  app.click('nav', 'jobs');
  app.click('open-job', job.id);
  assert.match(app.html(), new RegExp(`data-action="client-open" data-id="${client.id}"`), 'the plan links to the client page');
  const planHtml = app.html().replace(/pf\d+/g, 'pf');
  app.click('client-open', client.id);
  assert.match(app.html(), new RegExp(`data-action="open-job" data-id="${job.id}"`), 'their job is on their page');
  has(app.html(), client.desc);
  app.click('back');
  assert.equal(app.html().replace(/pf\d+/g, 'pf'), planHtml, 'Back returns to the plan as it was');
});

test('the Book holds Who\'s who and History only, with every entry in order', async () => {
  const app = await boot();
  app.click('nav', 'city');
  app.click('city-tab', 'map');
  app.click('book');
  const tabs = [...app.html().matchAll(/data-action="lore-tab" data-id="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(tabs, ['factions', 'history']);
  const who = app.html();
  const groups = [...new Set(FACTIONS.map((f) => f.group))];
  let at = -1;
  for (const g of groups) {
    const i = who.indexOf(`<h2>${esc(g)}</h2>`); assert.ok(i > at, `${g} in order`); at = i;
    for (const f of FACTIONS.filter((x) => x.group === g)) { has(who, f.name); has(who, f.where); has(who, f.line); has(who, f.rumour); }
  }
  assert.match(who, /Their grudge/, 'the live gauge stays with the gang entries');
  assert.ok(who.includes("Never raids a tong's hall."), 'the Brass Anchor line stays with its entry');
  app.click('lore-tab', 'history');
  const hist = app.html();
  has(hist, 'Everyone knows'); has(hist, 'A short history');
  for (const f of STREET_FACTS) has(hist, f);
  let pos = -1;
  for (const h of HISTORY) { has(hist, h.year); has(hist, h.text); const i = hist.indexOf(esc(h.text)); assert.ok(i > pos, 'history in order'); pos = i; }
  assert.doesNotMatch(hist + who, /lorecard|Districts<\/button>|Clients<\/button>/, 'the districts and clients are not in the Book any more');
  app.click('back');
  assert.match(app.html(), /data-action="city-tab" data-id="map" aria-pressed="true"/, 'Back returns to the City sub-tab that opened the Book');
});

test('no screen links to the removed Lore districts or clients', async () => {
  const app = await boot();
  for (const [tab, sub] of [['city', 'map'], ['city', 'districts'], ['city', 'tongs'], ['jobs', 'board'], ['jobs', 'clients'], ['tong', 'halls'], ['crew', 'roster']]) {
    app.click('nav', tab);
    app.click(tab === 'jobs' ? 'jobs-tab' : tab === 'city' ? 'city-tab' : tab === 'tong' ? 'tong-tab' : 'crew-tab', sub);
    assert.doesNotMatch(app.html(), /on Lore|the Lore tab|about-district|lore-district|See it on Ops/, `${tab}/${sub}`);
  }
});
