// Stages a clutch finish with the game's own core (for scripts/capture-clutch.mjs): a loud run is played to the middle of its first
// fight; then every enemy but one is put out, that one is left burning on 8 HP by a runner, another runner is down, and one round is played.
// Returns { before, after } (the state just before that round, and just after it). node scripts/stage-clutch.mjs prints the check.
import { createNewGame } from '../src/core/state.js';
import * as M from '../src/core/mission.js';
import { addOffer } from '../src/core/jobs.js';
import { autoStep } from '../src/core/autorun.js';

export function stage() {
  for (let seed = 1; seed < 400; seed++) {
    let s = createNewGame({ seed, startCrew: 'fresh' });
    s.jobs = [];
    addOffer(s, 'warehouse');
    s = M.startMission(s, s.jobs[0].id, s.crew.slice(0, 3).map((o) => o.id), 'loud', { callIn: 'risky', orders: 'committed' });
    for (let g = 0; g < 300; g++) {
      const am = s.activeMission;
      const b = am.battle;
      if (am.done) break;
      if (b && b.round >= 1 && !b.end && !am.pending && b.enemies.filter((e) => !e.out && !e.fled).length >= 2 && b.runners.filter((r) => !r.down && !r.dead).length === 3) {
        const before = structuredClone(s);
        const bb = before.activeMission.battle;
        const up = bb.enemies.filter((e) => !e.out && !e.fled);
        for (const e of up.slice(1)) e.out = true;
        const last = up[0];
        const by = bb.runners[0];
        last.hp = 8; last.burning = { tick: 10, left: 2, by: by.id, round: bb.round - 1, payload: 'incendiary' };
        const hurt = bb.runners[2]; hurt.hp = 0; hurt.down = true; hurt.downRound = bb.round;
        bb.arriving = []; before.activeMission.battle = bb;
        let after = structuredClone(before);
        for (let k = 0; k < 6 && !after.activeMission.battle?.end; k++) after = autoStep(after, { force: true });
        const ev = JSON.stringify(after.activeMission.events);
        if (ev.includes('director.clutchBurn')) return { seed, before, after };
      }
      s = am.pending || am.critical || M.currentStep(am)?.type === 'crisis' ? autoStep(s, { force: true }) : autoStep(s);
    }
  }
  return null;
}
if (process.argv[1].endsWith('stage-clutch.mjs')) { const r = stage(); console.log(r ? `seed ${r.seed}` : 'none'); }
