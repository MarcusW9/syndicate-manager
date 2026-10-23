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
  state = createNewGame();
  saveGame(state);
}

mountApp(document.getElementById('app'), state);
