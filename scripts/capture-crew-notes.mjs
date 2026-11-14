// Capture (2026-11-14, crew notes): a day's crew news with four lines (two runners, Overconfident and Client's
// Favourite each) and a day with one line alone, at phone width and on a wide screen.
// Run: node scripts/capture-crew-notes.mjs <out dir>
import { createNewGame } from '../src/core/state.js';
import * as E from '../src/core/earned.js';
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const [out] = process.argv.slice(2);
mkdirSync(out, { recursive: true });

const stage = (n) => {
  const s = createNewGame({ seed: 21, startCrew: 'fresh' });
  s.inbox = [];
  const hard = (op) => ({ kind: 'roll', actor: { id: op.id, handle: op.handle }, stat: 'social', success: true, difficulty: 6, notes: [] });
  for (const op of s.crew.slice(0, n)) {
    for (let i = 0; i < 4; i++) E.afterJob(s, { events: [hard(op)], district: 'docks', clientId: 'ferryman', outcome: 'completed', crewIds: [op.id] });
  }
  if (n === 1) { const m = s.inbox.find((x) => x.kind === 'crewnotes'); const l = m.payload.lines.find((x) => x.key.startsWith('client_favourite')); m.payload.lines = [l]; m.subject = l.subject; m.body = l.body; }
  return s;
};

const root = new URL('..', import.meta.url).pathname;
const srv = spawn(`${root}node_modules/.bin/vite`, ['--port', '5195', '--strictPort'], { cwd: root, stdio: 'ignore', detached: true });
await new Promise((r) => setTimeout(r, 4000));
const b = await chromium.launch();
try {
  for (const [name, n, w, h] of [['60-crew-notes-390', 2, 390, 844], ['61-crew-notes-one-390', 1, 390, 844], ['62-crew-notes-desktop', 2, 1280, 800]]) {
    const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
    p.on('pageerror', (e) => console.error('page error', e.message));
    await p.goto('http://localhost:5195/');
    await p.evaluate((x) => { localStorage.clear(); localStorage.setItem('syndicate-active-slot', '1'); localStorage.setItem('syndicate-slot-1', JSON.stringify(x)); }, stage(n));
    await p.reload(); await p.waitForTimeout(600);
    await p.locator('[data-action="nav"][data-id="inbox"]').filter({ visible: true }).first().click(); await p.waitForTimeout(300);
    await p.locator('[data-action="open-message"]').filter({ visible: true }).first().click(); await p.waitForTimeout(500);
    const text = await p.locator('.crewnotes').innerText();
    if (/\[object|undefined|\{\w+\}/.test(text)) throw new Error(`bad text in ${name}: ${text}`);
    await p.screenshot({ path: `${out}/${name}.png` });
    await p.close();
  }
} finally {
  await b.close();
  process.kill(-srv.pid);
}
