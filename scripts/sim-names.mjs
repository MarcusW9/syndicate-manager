// Names on the street (C1 sim check, 2026-11-08; drafts/PROPOSAL-phase-3.md C.11): does a typical
// player's best runner make "Names on the street" by the end of the first year? The player is the
// Phase 2 one (scripts/sim-phase2.mjs: careful, hands-off, hires, opens halls, answers every call).
// Reads only: nothing in the game is changed. For each snapshot week it records whether any of the
// player's own runners are among the names, their best hidden rating, and where the rivals' cut-off
// sits (the 8th-best card), so a miss can be told apart from a close one.
//
//   node scripts/sim-names.mjs [seeds=40]
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
  const t = { jobs: 0, held: 0, walked: 0, paid: 0, raidHurt: 0, raidDeaths: 0, secondHall: null, bought: 0, boards: 0, brokered: 0 };
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
      if ((h.build ?? []).some((b) => b.piece === 'workboard') || s.cash < 8000 + bills(s) * (cfg.boardWeeks ?? 4)) continue;
      const at = [...buildableCells(hallMap(h.district))].map((k) => k.split(',').map(Number)).find(([x, y]) => canPlace(s, h.district, 'workboard', x, y).ok);
      if (at) { s = placePiece(s, h.district, 'workboard', ...at); t.boards += 1; }
    }
    if (cfg.buy) for (const h of s.halls ?? []) { const p = buyPrice(s, h.district); if (p != null && s.cash > p + bills(s) * (cfg.buyWeeks ?? 6)) { s = buyHall(s, h.district); t.bought += 1; } }
    s = advanceDay(s);
    const wk = (day + 1) / 7;
    if (SNAP.includes(wk)) snaps[wk] = { s, t: { ...t } };
  }
  return snaps;
}
import { namesOnTheStreet } from '../src/core/rivals.js';
import { ratingOf, cardRating } from '../src/core/rating.js';
import { fameOf } from '../src/core/fame.js';

const cfg = { approach: 'stealth', plates: 0 };
const pct = (n, d) => `${Math.round((n / d) * 100)}%`;
const q = (a, p) => [...a].sort((x, y) => x - y)[Math.floor(a.length * p)];
const rows = Array.from({ length: SEEDS }, (_, i) => play(i + 1, cfg));
for (const weeks of SNAP) {
  const runs = rows.map((r) => r[weeks].s);
  const best = runs.map((s) => Math.max(...s.crew.filter((o) => !o.freelance).map(ratingOf)));
  const cut = runs.map((s) => s.rivals.cards.map(cardRating).sort((a, b) => b - a)[7]);
  const on = runs.map((s) => namesOnTheStreet(s).filter((n) => n.own).length);
  const fame = runs.map((s) => s.crew.filter((o) => !o.freelance).map(fameOf));
  console.log(`wk${weeks}: own name on the street in ${pct(on.filter((n) => n > 0).length, runs.length)} of runs (median ${median(on)}) · best runner's rating median ${median(best)} (p10 ${q(best, 0.1)}, p90 ${q(best, 0.9)}) · 8th-best rival card ${median(cut)} · a Known-or-better runner in ${pct(fame.filter((f) => f.some((x) => x !== 'unknown')).length, runs.length)}`);
}
