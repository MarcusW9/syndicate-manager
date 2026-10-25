// Joss's lines: every alert the game can raise has a line, and every slot gets filled.
// Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PARTNER } from '../src/data/partner.js';

// What the UI passes into each alert line (src/ui/app.js, renderBriefing).
const SLOTS = {
  decision: ['subject'], broke: ['amount'], 'bills-short': ['total', 'short'], 'job-last': ['job'],
  'jobs-last': ['count', 'jobs'], 'lead-last': ['name', 'role'], 'crew-out': ['names'],
};
const MOODS = ['first', 'decision', 'broke', 'short', 'hurt', 'sunday', 'monday', 'quiet'];

test('every mood and every alert kind has lines', () => {
  for (const m of MOODS) assert.ok(PARTNER.moods[m]?.length, `mood ${m}`);
  for (const k of Object.keys(SLOTS)) assert.ok(PARTNER.alerts[k]?.length, `alert ${k}`);
});

test('alert lines only use slots the UI fills, and keep the facts', () => {
  for (const [k, slots] of Object.entries(SLOTS)) {
    for (const line of PARTNER.alerts[k]) {
      for (const [, slot] of line.matchAll(/\{(\w+)\}/g)) assert.ok(slots.includes(slot), `${k}: {${slot}} in "${line}"`);
      // A voiced alert must still carry its key number or name.
      assert.ok(slots.some((s) => line.includes(`{${s}}`)), `${k}: "${line}" drops the facts`);
    }
  }
  for (const line of Object.values(PARTNER.moods).flat()) assert.ok(!/\{\w+\}/.test(line), `mood line has a slot: "${line}"`);
});
