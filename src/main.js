// Display font for headings, labels and numbers; bundled so it works offline (OFL licence).
import '@fontsource/rajdhani/latin-500.css';
import '@fontsource/rajdhani/latin-600.css';
import '@fontsource/rajdhani/latin-700.css';
import './ui/styles.css';
import { createNewGame } from './core/state.js';
import { loadGame, saveGame } from './save/save.js';
import { validateMissions, validateCrew } from './core/validate.js';
import { MISSIONS } from './data/missions.js';
import { STARTING_CREW } from './data/operatives.js';
import { mountApp } from './ui/app.js';

if (import.meta.env.DEV) {
  const problems = [...validateMissions(MISSIONS), ...validateCrew(STARTING_CREW)];
  if (problems.length) console.error('Content problems:\n' + problems.join('\n'));
}

let state = loadGame();
if (!state) {
  state = createNewGame({ startCrew: 'pick' });
  saveGame(state);
}

mountApp(document.getElementById('app'), state);

// Offline play (DESIGN.md, 2026-10-29): the built game keeps a copy of itself (sw.js, written by
// vite.config.js), so it opens without a connection after the first visit. Not in dev, where
// files change all the time, and only where the browser supports it.
if (import.meta.env.PROD && 'serviceWorker' in navigator && location.protocol.startsWith('http')) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}
