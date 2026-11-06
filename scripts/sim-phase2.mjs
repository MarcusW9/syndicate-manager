// Phase 2 balance (2026-11-06): the whole tong over a year, with halls, heat, raids, grudges, opening
// jobs and building working together. The player runs every crew they can (as scripts/sim-tong.mjs:
// hands-off, stealth, Steady, never call; the best-paying jobs first), hires while cash allows,
// expands a full hall, and:
//   - opens a hall once its contact's favour is done and cash covers the deposit and two weeks of bills;
//   - answers every call: renewals accepted, heat notices ridden, specialisations taken;
//   - pays off a raid where it can if the price is under a fifth of the cash;
//   - holds a raid when two or more are home, else walks out; a held raid is fought by the crew's own
//     orders (getting the downed out at death's door, never pushing on);
//   - plays careful (stealth) or loud, by config;
//   - builds, by config: nothing, 3 steel plates a hall (one step off a raid's threat), or 6 (two).
// Prints, at weeks 13, 26, 39 and 52: median cash, the share broke, halls, roster, reputation, jobs a
// week, raids (warned, held, walked out, paid), people hurt and killed in raids, favours (done, failed)
// and the week each run's second hall opened. Numbers only: nothing in the game is changed.
//
//   node scripts/sim-phase2.mjs [seeds=20] [config name prefix]
import { createNewGame } from '../src/core/state.js';
import { autoFounders } from '../tests/play.js';
import { hire, canHire, STARTING_ROSTER_CAP } from '../src/core/recruits.js';
import { primaryStat } from '../src/core/development.js';
import { advanceDay, calendar } from '../src/core/time.js';
import { templateById, jobView } from '../src/core/jobs.js';
import { availability } from '../src/core/crew.js';
import { sendOff } from '../src/core/autorun.js';
import { takeCall, letThemRun } from '../src/core/away.js';
import { resolveDecision } from '../src/core/decisions.js';
import { canOpenHall, openHall, nextHallExpansion, expandHall, freeBeds, buyPrice, buyHall } from '../src/core/halls.js';
import { HALL_SITES } from '../src/data/halls.js';
import { canBuyOff, raidPrice, payOffRaid, defenders } from '../src/core/raids.js';
import { runBattle } from '../src/core/runbattle.js';
import { resolvePending, describePending, closeMission } from '../src/core/mission.js';
import { buildableCells, hallMap, placePiece, canPlace } from '../src/core/hallbuild.js';

const SEEDS = Number(process.argv[2] ?? 20);
const median = (a) => (a.length ? [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)] : null);
const SNAP = [13, 26, 39, 52];
const bills = (s) => s.crew.reduce((n, o) => n + (o.freelance ? 0 : o.wage), 0) + (s.rent ?? 0);

/** The cells nearest where our people start in a raid, for plates. */
const nearStart = (d) => { const site = hallMap(d); const a = site.paths.inside.at(-1); return [...buildableCells(site)].map((k) => k.split(',').map(Number)).sort((p, q) => Math.hypot(p[0] * 30 + 15 - a[0], p[1] * 30 + 15 - a[1]) - Math.hypot(q[0] * 30 + 15 - a[0], q[1] * 30 + 15 - a[1])); };

/** Fight a held raid (or any live run) to its end by the crew's own orders, then close it. */
function playOut(s) {
  for (let k = 0; s.activeMission && !s.activeMission.done && k < 80; k++) {
    const am = s.activeMission;
    if (am.pending) s = resolvePending(s, am.pending.kind === 'door' ? 'out' : am.pending.kind === 'standoff' ? 'press' : describePending(s).choices[0].id);
    else s = runBattle(s);
  }
  return s.activeMission?.done ? closeMission(s) : s;
}

/** Answer everything waiting. t: the run's tallies. */
function answer(s, t, cfg) {
  for (let guard = 0; guard < 20; guard++) {
    const m = s.inbox.find((x) => x.blocking && !x.resolved);
    if (!m) break;
    if (m.kind === 'callin') { s = takeCall(s, m.payload.jobId); s = s.activeMission ? letThemRun(s) : s; m.resolved = true; continue; }
    if (m.kind === 'raid') {
      const raid = (s.raids ?? []).find((r) => r.id === m.payload.raidId);
      const home = defenders(s, raid.district).length;
      const pay = m.options.find((o) => o.id === 'pay' && !o.disabled) && raidPrice(s, raid) * 1.5 < s.cash / 5;
      const pick = pay ? 'pay' : home >= 2 && m.options.some((o) => o.id === 'hold' && !o.disabled) ? 'hold' : 'withdraw';
      const before = s.memorial.length;
      s = resolveDecision(s, m.id, pick);
      if (pick === 'hold') {
        const am = s.activeMission;
        s = playOut(s);
        t.raidHurt += am?.result?.injuries?.length ?? 0;
        t.raidDeaths += s.memorial.length - before;
        const r = (s.raids ?? []).find((x) => x.id === raid.id);
        t[r?.outcome === 'held' ? 'held' : 'walked'] += 1;
      } else t[pick === 'pay' ? 'paid' : 'walked'] += 1;
      continue;
    }
    const opt = { renewal: 'accept', heat: 'ride' }[m.kind] ?? m.options?.find((o) => !o.disabled)?.id;
    const next = opt ? resolveDecision(s, m.id, opt) : s;
    if (next === s) { m.resolved = true; m.blocking = false; } else s = next;
  }
  return s;
}

/** One year. cfg.plates: steel plates per hall. Snapshots at each week in SNAP. */
function play(seed, cfg) {
  const snaps = {};
  let s = createNewGame({ seed, startCrew: 'pick' });
  if (s.founding) s = autoFounders(s);
  const t = { jobs: 0, held: 0, walked: 0, paid: 0, raidHurt: 0, raidDeaths: 0, secondHall: null };
  for (let day = 0; day < 52 * 7; day++) {
    s = answer(s, t, cfg);
    if (calendar(s.day).weekday !== 'Sun') {
      const offers = [...s.jobs].sort((a, b) => jobView(s, b).pay - jobView(s, a).pay);
      for (const job of offers) {
        const free = s.crew.filter((op) => availability(s, op).ok);
        const tpl = templateById(job.templateId);
        if (!tpl || free.length < tpl.crewSize) continue;
        const crew = [...free].sort((a, b) => (a.role === 'medic' ? -1 : 0) - (b.role === 'medic' ? -1 : 0)).slice(0, tpl.crewSize);
        const next = sendOff(s, job.id, crew.map((o) => o.id), cfg.approach ?? 'stealth', 'steady', { callIn: 'never' });
        if (next !== s) { s = next; t.jobs++; }
      }
    }
    // Pay off a raid before the day where it's cheap.
    for (const r of (s.raids ?? []).filter((x) => !x.done && !x.answer && !x.called)) if (canBuyOff(s, r) && raidPrice(s, r) < s.cash / 5) { s = payOffRaid(s, r.id); t.paid += 1; }
    // Halls: open one once the favour's done and two weeks of bills are covered; expand a full one.
    for (const d of cfg.noHalls ? [] : Object.keys(HALL_SITES)) if (canOpenHall(s, d).ok && s.cash > HALL_SITES[d].deposit + bills(s) * 2) { s = openHall(s, d); if (t.secondHall == null) t.secondHall = Math.ceil((day + 1) / 7); }
    const lead = [...(s.recruits ?? [])].filter((r) => canHire(s, r).ok).sort((a, b) => b.stats[primaryStat(b)] - a.stats[primaryStat(a)])[0];
    if (lead && s.cash - (bills(s) + lead.wage) * 2 > 0) s = hire(s, lead.id);
    if (s.crew.length >= (s.rosterCap ?? STARTING_ROSTER_CAP)) {
      const full = (s.halls ?? []).filter((h) => freeBeds(s, h.district) === 0).map((h) => ({ h, x: nextHallExpansion(s, h.district) })).sort((a, b) => a.x.cost - b.x.cost)[0];
      if (full && s.cash > full.x.cost + bills(s) * 3) s = expandHall(s, full.h.district);
    }
    // Building: plates by where our people start, once there's money to spare.
    if (cfg.plates && s.cash > bills(s) * 6) {
      for (const h of s.halls ?? []) {
        const have = (h.build ?? []).filter((b) => b.piece === 'plate').length;
        if (have >= cfg.plates) continue;
        for (const [x, y] of nearStart(h.district)) { const next = placePiece(s, h.district, 'plate', x, y, 0); if (next !== s) { s = next; break; } }
      }
    }
    // Buying and brokering (2026-11-06): a work board in every hall once there's money for it, and a
    // hall bought outright once its price leaves six weeks of bills.
    if (cfg.broker) for (const h of s.halls ?? []) {
      if ((h.build ?? []).some((b) => b.piece === 'workboard') || s.cash < 8000 + bills(s) * 4) continue;
      const at = [...buildableCells(hallMap(h.district))].map((k) => k.split(',').map(Number)).find(([x, y]) => canPlace(s, h.district, 'workboard', x, y).ok);
      if (at) s = placePiece(s, h.district, 'workboard', ...at);
    }
    if (cfg.buy) for (const h of s.halls ?? []) { const p = buyPrice(s, h.district); if (p != null && s.cash > p + bills(s) * 6) s = buyHall(s, h.district); }
    s = advanceDay(s);
    const wk = (day + 1) / 7;
    if (SNAP.includes(wk)) snaps[wk] = { s, t: { ...t } };
  }
  return snaps;
}

// A careful player (stealth) rarely heats a district to a raid; a loud one does.
const CONFIGS = {
  'careful, nothing built': { approach: 'stealth', plates: 0 },
  'careful, one hall only': { approach: 'stealth', plates: 0, noHalls: true },
  'careful, buys halls': { approach: 'stealth', plates: 0, buy: true },
  'careful, work boards': { approach: 'stealth', plates: 0, broker: true },
  'careful, buys and brokers': { approach: 'stealth', plates: 0, buy: true, broker: true },
  // What would make a second hall pay its way (tuning probes; the game's numbers aren't changed).
  'careful, halls at half rent': { approach: 'stealth', plates: 0, tweak: () => { for (const s of Object.values(HALL_SITES)) if (s.rent) s.rent = Math.round(s.rent / 2); } },
  'careful, halls with 4 beds': { approach: 'stealth', plates: 0, tweak: () => { for (const s of Object.values(HALL_SITES)) if (s.beds) s.beds = 4; } },
  'loud, nothing built': { approach: 'loud', plates: 0 },
  'loud, 3 plates a hall': { approach: 'loud', plates: 3 },
  'loud, 6 plates a hall': { approach: 'loud', plates: 6 },
};
const only = process.argv[3];
for (const [name, cfg] of Object.entries(CONFIGS).filter(([n]) => !only || n.startsWith(only))) {
  cfg.tweak?.();
  const all = Array.from({ length: SEEDS }, (_, i) => play(i + 1, cfg));
  console.log(`\n${name} (${SEEDS} seeds)`);
  for (const weeks of SNAP) {
    const runs = all.map((r) => r[weeks]);
    const cash = runs.map((r) => r.s.cash);
    const raids = runs.map((r) => (r.s.raids ?? []).length);
    const sum = (f) => runs.reduce((n, r) => n + f(r), 0);
    const openings = (r) => Object.values(r.s.openings ?? {});
    console.log(`  wk${weeks}: cash ${median(cash)} · broke ${Math.round((cash.filter((c) => c < 0).length / runs.length) * 100)}% · halls ${median(runs.map((r) => r.s.halls.length))} · roster ${median(runs.map((r) => r.s.crew.length))} · rep ${median(runs.map((r) => r.s.reputation))} · jobs/wk ${Math.round(median(runs.map((r) => r.t.jobs / weeks)) * 10) / 10}`);
    console.log(`         raids ${sum((r) => (r.s.raids ?? []).length)} (median ${median(raids)}; gang ${sum((r) => (r.s.raids ?? []).filter((x) => x.by !== 'police').length)}) · held ${sum((r) => r.t.held)} · walked out ${sum((r) => r.t.walked)} · paid ${sum((r) => r.t.paid)} · hurt in raids ${sum((r) => r.t.raidHurt)} · killed in raids ${sum((r) => r.t.raidDeaths)} · all deaths ${sum((r) => r.s.memorial.length)}`);
    console.log(`         favours done ${sum((r) => openings(r).filter((o) => o.status === 'done').length)} · failed or waiting ${sum((r) => openings(r).filter((o) => o.status === 'failed').length)} · 2nd hall by week ${median(runs.map((r) => r.t.secondHall).filter((x) => x != null)) ?? '-'} (${runs.filter((r) => r.t.secondHall != null).length}/${runs.length} runs)`);
  }
}
