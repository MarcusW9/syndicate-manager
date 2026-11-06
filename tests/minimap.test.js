// The mini map on a crew-out card (2026-11-06, crews out made visible, 4b): the job's own site, the
// route walked so far, and the crew as still dots where they got to today.

import test from 'node:test';
import assert from 'node:assert/strict';
import { crewOutMap, routeSplit, zoneSpot } from '../src/ui/minimap.js';
import { pickSite } from '../src/data/sites.js';
import { createNewGame } from '../src/core/state.js';
import { addOffer } from '../src/core/jobs.js';
import { sendOff } from '../src/core/autorun.js';
import { crewsOut } from '../src/core/away.js';

const site = pickSite('docks', 'job-1', 'warehouse');

test('the crew stand where the watch screen puts them for each zone', () => {
  assert.deepEqual(zoneSpot(site, 'start'), site.points.van);
  assert.deepEqual(zoneSpot(site, 'in'), site.paths.in.at(-1));
  assert.deepEqual(zoneSpot(site, 'inside'), site.paths.inside.at(-1));
  assert.deepEqual(zoneSpot(site, 'target'), site.points.target);
  assert.deepEqual(zoneSpot(site, 'out'), site.points.van);
});

test('the route: nothing walked at the van, all of it on the way out; walked and ahead meet where they stand', () => {
  assert.equal(routeSplit(site, 'start').walked.length, 0);
  const inside = routeSplit(site, 'inside');
  assert.deepEqual(inside.walked.at(-1), site.paths.inside.at(-1));
  assert.deepEqual(inside.ahead[0], inside.walked.at(-1));
  assert.equal(routeSplit(site, 'out').ahead.length, 1, 'nothing left but where they are');
});

test('a dot for everyone inside, the perch and the van when someone is there, and a ring only for a call', () => {
  const quiet = crewOutMap({ site, zone: 'inside', crew: 3, overwatch: true, wheels: true });
  assert.equal((quiet.match(/class="mm-dot"/g) ?? []).length, 3);
  assert.equal((quiet.match(/class="mm-side"/g) ?? []).length, 2);
  assert.doesNotMatch(quiet, /mm-call/);
  assert.match(quiet, /role="img" aria-label="Map of [^"]+: the crew inside\."/);
  const call = crewOutMap({ site, zone: 'in', crew: 1, calling: true });
  assert.match(call, /class="minimap is-call"/);
  assert.match(call, /class="mm-call"/);
  assert.match(call, /waiting on your call/);
  assert.match(crewOutMap({ site, zone: 'nowhere' }), /the crew at the van/, 'an unknown zone draws them at the van');
});

test('nothing moves but the call ring, and that stops for reduced motion', async () => {
  const { readFileSync } = await import('node:fs');
  const css = readFileSync(new URL('../src/ui/styles.css', import.meta.url), 'utf8');
  const mm = css.slice(css.indexOf('/* The mini map on a crew-out card'));
  assert.equal((mm.match(/animation:\s*mm-/g) ?? []).length, 1, 'one animation, the call');
  assert.match(mm, /prefers-reduced-motion: reduce\) \{ \.mm-call \{ animation: none/);
});

test('each crew out says where it is on its site, for the card', () => {
  let s = createNewGame({ seed: 3, startCrew: 'fresh' });
  s.jobs = [];
  addOffer(s, 'warehouse', { rng: () => 0.5 });
  const job = s.jobs[0];
  s = sendOff(s, job.id, s.crew.slice(0, 2).map((o) => o.id), 'stealth', 'steady', { callIn: 'never' });
  const [c] = crewsOut(s);
  assert.equal(c.templateId, 'warehouse');
  assert.equal(c.inside, 2);
  assert.ok(['start', 'in', 'inside', 'target', 'out'].includes(c.zone), c.zone);
});
