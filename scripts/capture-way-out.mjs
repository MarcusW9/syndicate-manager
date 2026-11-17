// Capture (2026-11-17): the way out of a hack. A data_pull fight at the moment the work is done (the round screen's goal line, the alarm's arrivals), drawn with the real stylesheet.
// Run: node scripts/capture-way-out.mjs <out dir>
globalThis.localStorage ??= { getItem: () => null, setItem: () => {}, removeItem: () => {} };
const { createNewGame } = await import('../src/core/state.js');
const M = await import('../src/core/mission.js');
const { addOffer, templateById } = await import('../src/core/jobs.js');
const { autoStep } = await import('../src/core/autorun.js');
const { renderFightRound } = await import('../src/ui/fightscreen.js');
const { chromium } = await import('playwright');
const { spawn } = await import('node:child_process');
const { mkdirSync } = await import('node:fs');
const [out] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
function tryTo(seed) {
  let s = createNewGame({ seed, startCrew: 'fresh' }); s.jobs = []; addOffer(s, 'data_pull');
  s = M.startMission(s, s.jobs[0].id, s.crew.slice(0, templateById('data_pull').crewSize).map((o) => o.id), 'loud', { callIn: 'every', orders: 'steady' });
  for (let g = 0; g < 400; g++) { if (s.activeMission.battle && M.currentStep(s.activeMission)?.type === 'battle') break; const n = autoStep(s, { force: true }); if (n === s) break; s = n; }
  for (let g = 0; g < 60 && s.activeMission.battle && !s.activeMission.battle.end; g++) {
    if (s.activeMission.pending) { s = M.resolvePending(s, s.activeMission.pending.kind === 'dilemma' ? 'carryOn' : 'out'); continue; }
    s = M.runBattle(s);
    if (s.activeMission.battle?.stage === 1 && !s.activeMission.battle.end && s.activeMission.battle.round >= 5) return renderFightRound(s, esc, () => '');
  }
  return null;
}
const shots = [];
for (let seed = 1; seed <= 40 && !shots.length; seed++) { const h = tryTo(seed); if (h) shots.push(h); }
if (!shots.length) { console.error('never reached the way out'); process.exit(1); }
const root = new URL('..', import.meta.url).pathname;
const srv = spawn(`${root}node_modules/.bin/vite`, ['--port', '5904', '--strictPort'], { cwd: root, stdio: 'ignore', detached: true });
await new Promise((r) => setTimeout(r, 4000));
const b = await chromium.launch();
try {
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  await p.goto('http://localhost:5904/'); await p.waitForSelector('#app *');
  await p.evaluate((h) => { document.querySelector('#app').innerHTML = `<section class="panel">${h}</section>`; window.scrollTo(0, 0); }, shots[0]);
  await p.waitForTimeout(300);
  await p.screenshot({ path: `${out}/01-way-out-round.png`, fullPage: true });
} finally { await b.close(); process.kill(-srv.pid); }
console.log('done');
