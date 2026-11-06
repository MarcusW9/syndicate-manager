// The work board (DESIGN.md 2026-11-06; owner: "middle man jobs ... these rookies and solo guys
// would be coming here to take on work that we give them"). Each Sunday, a hall with a work board
// brokers small outside work in its district to street freelancers: as many jobs as the hall's
// level, each paying the tong BROKER.cut of what it pays. It's background work: it never touches
// the jobs on the tong's own board, and nobody of ours is sent. Now and then one goes wrong (no fee,
// and that client's trust falls), and now and then a freelancer who did well asks to join (a recruit
// lead). A hall shut after a raid brokers nothing. Pure logic, seeded per hall and week.

import { BROKER } from '../data/hallBuild.js';
import { MISSIONS } from '../data/missions.js';
import { CLIENTS } from '../data/clients.js';
import { NAMES } from '../config/names.js';
import { hashRng, pick } from './rng.js';
import { adjustTrust } from './clients.js';
import { hasRoom } from './halls.js';
import { hallShut } from './raids.js';
import { generateRecruit, LEAD_DAYS } from './recruits.js';
import { money } from './money.js';

const round50 = (n) => Math.round(n / 50) * 50;
const inText = (d) => NAMES.districtsInText?.[d] ?? NAMES.districts?.[d] ?? d;

/** The kinds of small work a district's board brokers: its routine and rookie jobs (never an opening job). */
export const brokeredWork = (district) => MISSIONS.filter((m) => m.district === district && (m.routine || m.rookie) && !m.opening);

/**
 * Sunday, before the bills: every work board brokers its week. Adds the fees to cash and returns
 * { total, lines } for the week's message. Mutates state.
 */
export function brokerWeek(state) {
  let total = 0;
  const lines = [];
  for (const h of state.halls ?? []) {
    if (!hasRoom(h, 'workboard') || hallShut(state, h.district)) continue;
    const pool = brokeredWork(h.district);
    if (!pool.length) continue;
    const rng = hashRng(state.seed, 'broker', h.district, state.day);
    let fee = 0, done = 0, wrong = 0;
    for (let i = 0; i < (h.level ?? 1); i++) {
      const tpl = pick(rng, pool);
      if (rng() < BROKER.wrong) {
        wrong += 1;
        const client = CLIENTS.find((c) => c.jobs.includes(tpl.id));
        if (client) adjustTrust(state, client.id, BROKER.wrongTrust);
      } else {
        done += 1;
        fee += round50(tpl.pay * BROKER.cut);
      }
    }
    total += fee;
    lines.push(`${inText(h.district)}: ${done} brokered${wrong ? `, ${wrong} went wrong` : ''}, ${money(fee)} to us.`);
    // A freelancer who did well asks to join.
    if (rng() < BROKER.lead && (state.recruits ?? []).length < 4) {
      const r = generateRecruit(state, { quality: 'rookie' });
      (state.recruits ??= []).push(r);
      state.inbox.unshift({
        id: `broker-lead-${h.district}-${state.day}`, type: 'scout', day: state.day,
        subject: `"${r.handle}" wants in, from the work board`,
        body: `${r.name} "${r.handle}", ${r.age}, ${r.role}, has been taking the small work off our board in ${inText(h.district)}, and did it well. They'd like to be one of ours. Leads go cold in ${LEAD_DAYS} days. See the Crew screen.`,
        blocking: false, read: false,
      });
    }
  }
  state.cash += total;
  return { total, lines };
}
