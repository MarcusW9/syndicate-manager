// Stages a runner's death in a live fight with the game's own core (for scripts/capture-death.mjs): a loud run is played to the
// middle of its first fight; one runner is left down and pushed on for (fightOn, as after "keep fighting with them down"), past the
// bleed grace, and rounds are played until one bleeds out. Returns { seed, before, after }. node scripts/stage-death.mjs prints the check.
import { createNewGame } from '../src/core/state.js';
import * as M from '../src/core/mission.js';
import { addOffer } from '../src/core/jobs.js';
import { autoStep } from '../src/core/autorun.js';
import { FIGHT } from '../src/data/fights.js';

export function stage() {
  for (let seed = 1; seed < 400; seed++) {
    let s = createNewGame({ seed, startCrew: 'fresh' });
    s.jobs = [];
    addOffer(s, 'warehouse');
    s = M.startMission(s, s.jobs[0].id, s.crew.slice(0, 3).map((o) => o.id), 'loud', { callIn: 'risky', orders: 'steady' });
    for (let g = 0; g < 300; g++) {
      const am = s.activeMission;
      const b = am.battle;
      if (am.done) break;
      if (b && b.round >= 1 && !b.end && !am.pending && b.enemies.filter((e) => !e.out && !e.fled).length >= 2 && b.runners.filter((r) => !r.down && !r.dead).length === 3) {
        const before = structuredClone(s);
        const bb = before.activeMission.battle;
        const dying = bb.runners[2];
        dying.hp = 0; dying.down = true; dying.fightOn = true; dying.downRound = bb.round - FIGHT.bleedGrace - 1;
        before.activeMission.untreated = [dying.id];
        bb.arriving = [];
        const after = autoStep(structuredClone(before), { force: true });
        if (JSON.stringify(after.activeMission.events.at(-1) ?? {}).includes('bleedOut')) return { seed, before, after };
      }
      s = autoStep(s, { force: true });
    }
  }
  return null;
}
if (process.argv[1].endsWith('stage-death.mjs')) { const r = stage(); console.log(r ? `seed ${r.seed}` : 'none'); }
