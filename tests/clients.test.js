// Clients as data (owner, 2026-11-07: "a system we can easily add clients"): every client entry is
// complete, its jobs exist, its {id} token works in job text, and the halls' opening favours are
// asked by clients. Adding one is data only: docs/ARCHITECTURE.md "Adding a client".

import test from 'node:test';
import assert from 'node:assert/strict';
import { CLIENTS } from '../src/data/clients.js';
import { CAST } from '../src/data/cast.js';
import { HALL_SITES } from '../src/data/halls.js';
import { NAMES } from '../src/config/names.js';
import { templateById } from '../src/core/jobs.js';
import { createNewGame } from '../src/core/state.js';
import { trustOf, adjustTrust, START_TRUST } from '../src/core/clients.js';

test('every client is complete: id, name, a line about them, where they work, who they work for, real jobs', () => {
  const ids = new Set();
  for (const c of CLIENTS) {
    assert.ok(/^[a-z]+$/.test(c.id) && !ids.has(c.id), `${c.id}: a unique lower-case id`);
    ids.add(c.id);
    assert.ok(c.name && c.desc, `${c.id}: name and desc`);
    assert.ok(c.district in { ...NAMES.districts, ...NAMES.lockedDistricts }, `${c.id}: works in a district (${c.district})`);
    assert.ok('affiliation' in c, `${c.id}: says who they work for (or null), apart from trust`);
    assert.ok(Array.isArray(c.jobs), `${c.id}: a jobs list`);
    for (const j of c.jobs) assert.ok(templateById(j), `${c.id}: ${j} is a job`);
  }
});

test('a client named in job text has a cast entry with the same name, so {id} works', () => {
  for (const c of CLIENTS) if (CAST[c.id]) assert.equal(CAST[c.id].name.toLowerCase(), c.name.toLowerCase(), `${c.id}: the same name in both ("the Ferryman" mid-sentence)`);
  for (const id of ['ip', 'tse']) assert.ok(CAST[id], `${id}: in data/cast.js`); // Auntie Fung has none: no job names her with {fung} yet
});

test('every hall\'s opening favour is asked by a client, whose trust it moves', () => {
  for (const [d, site] of Object.entries(HALL_SITES)) {
    if (!site.opening) continue;
    assert.ok(CLIENTS.some((c) => c.id === site.contact), `${d}: ${site.contact} is a client`);
  }
  assert.equal(HALL_SITES.nightMarket.contact, 'ip');
  assert.equal(HALL_SITES.heights.contact, 'tse', 'the Underterrace has nothing to do with Szeto');
});

test('a new client starts neutral in any save, old or new, with no migration', () => {
  const s = createNewGame({ seed: 1 });
  for (const c of CLIENTS) assert.equal(trustOf(s, c.id), START_TRUST);
  delete s.clients;
  assert.equal(trustOf(s, 'tse'), START_TRUST);
  adjustTrust(s, 'ip', 5);
  assert.equal(trustOf(s, 'ip'), START_TRUST + 5);
  assert.equal(trustOf(s, 'rao'), START_TRUST, 'her trust is her own');
});
