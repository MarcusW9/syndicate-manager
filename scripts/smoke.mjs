// Smoke test for the built game (CI, .github/workflows/ci.yml): serve dist/ with `vite preview`,
// open it at phone width and check the game draws something with no page errors.
// Run: npm run build && npm run smoke
// Exits 1 if the page throws, logs a console error, or #app is still empty after the wait.

import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const repo = resolve(new URL('..', import.meta.url).pathname);
if (!existsSync(join(repo, 'dist', 'index.html'))) { console.error('No dist/: run npm run build first.'); process.exit(1); }

const port = 4300 + Math.floor(Math.random() * 600);
const server = spawn(join(repo, 'node_modules', '.bin', 'vite'), ['preview', '--port', String(port), '--strictPort'], { cwd: repo, stdio: 'pipe' });
await new Promise((ok, fail) => {
  server.stdout.on('data', (d) => { if (String(d).includes('Local')) ok(); });
  server.on('exit', (c) => fail(new Error(`vite preview exited ${c}`)));
});

const problems = [];
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on('pageerror', (e) => problems.push(`page error: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') problems.push(`console error: ${m.text()}`); });
  await page.goto(`http://localhost:${port}/`, { waitUntil: 'load' });
  await page.waitForFunction(() => document.querySelector('#app')?.children.length > 0, null, { timeout: 15000 })
    .catch(() => problems.push('#app is still empty after 15 s: the game did not draw.'));
  await page.waitForTimeout(500); // let a late error surface
} finally {
  await browser.close();
  server.kill();
}

if (problems.length) { console.error(problems.join('\n')); process.exit(1); }
console.log('Smoke test passed: the built game loads and draws with no errors.');
