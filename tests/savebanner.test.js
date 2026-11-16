// The banner for a failed save (drafts/BRIEF-save-failures.md): it shows on the page when a save fails and goes
// when one goes through. Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from './nav-harness.js';
import { V } from '../src/ui/view.js';

test('a failed save puts the banner on the page, and the next good save takes it off', async () => {
  const app = await boot();
  assert.doesNotMatch(app.html(), /Not saved/);
  const real = globalThis.localStorage.setItem;
  globalThis.localStorage.setItem = () => { throw new Error('QuotaExceededError'); };
  app.click('continue');
  // The harness never saved before this, so the banner has no day to give; a played game shows its last good day.
  assert.match(app.html(), /Not saved (since day \d+|yet)\./);
  assert.match(app.html(), /data-action="nav" data-id="settings">Open Save</);
  globalThis.localStorage.setItem = real;
  V.continueRestUntil = 0; // Continue rests a moment after each day
  app.click('continue');
  assert.doesNotMatch(app.html(), /Not saved/);
});
