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
  state = createNewGame({ startCrew: 'fresh' });
  saveGame(state);
}

mountApp(document.getElementById('app'), state);
