// Stat usage (drafts/PLAN-stat-usage.md): plays seasons under one policy and counts every roll by
// stat. It only reads what the game already writes down (a finished job's report keeps its events in
// timeline.events; side work keeps its roll in timeline.side), so it never calls the RNG and a run's
// results are the same with or without it (tests/statusage.test.js).
//
// A roll in an event is { stat, value, die, need, success }: success when die + value >= need. The
// guards' attacks (core/battle.js guardAttack) are written from the guard's side (value = their
// skill, need = 10 + the runner's cool and cover), so they're turned round here: the runner holds
// when the guard misses.
import { createNewGame } from '../../src/core/state.js';
import { hire, canHire, nextExpansion, expandSafehouse, STARTING_ROSTER_CAP } from '../../src/core/recruits.js';
import { primaryStat, MAX_STAT } from '../../src/core/development.js';
import * as M from '../../src/core/mission.js';
import { advanceDay, calendar } from '../../src/core/time.js';
import { templateById, jobView } from '../../src/core/jobs.js';
import { availability, effectiveStat } from '../../src/core/crew.js';
import { jossPicks } from '../../src/core/squad.js';
import { sendOff } from '../../src/core/autorun.js';
import { makeRng, hash } from '../../src/core/rng.js';
import { sideTaskById } from '../../src/core/sidetasks.js';
import { autoFounders, playMission, carefulPolicy } from '../../tests/play.js';

export const STATS = ['combat', 'stealth', 'tech', 'social', 'medical', 'driving', 'cool'];
export const APPROACH_IDS = ['stealth', 'tech', 'loud', 'con'];
export const DECISIVE = [0.15, 0.85];

/** The chance the runner had, from the event's own numbers (no caps: a natural 1 or 20 isn't special). */
export const chanceOf = (value, need) => Math.min(1, Math.max(0, (21 - (need - value)) / 20));

const blankStat = () => ({ rolls: 0, jobs: 0, decisive: 0, costly: 0, fails: 0 });
export const blankTally = () => Object.fromEntries(STATS.map((s) => [s, blankStat()]));

/**
 * One job's rolls, flattened: [{ stat, op, p, success, costly, where }], the runner's side of each.
 * where: crisis | incident | save | critical | fight. Exported for the test.
 */
export function rollsOf(events) {
  const out = [];
  // An incident's failure is saved if a save straight after it lands; only an unsaved one costs.
  const rescued = (i) => { for (let j = i + 1; j < events.length && events[j].kind === 'save'; j++) if (events[j].success) return true; return false; };
  const fightNext = (i) => { let j = i + 1; while (j < events.length && events[j].kind === 'save') j++; return events[j]?.kind === 'battle' && events[j].phase === 'start'; };
  events.forEach((e, i) => {
    if (e.kind === 'battle') {
      for (const l of e.lines ?? []) {
        if (!l.stat || l.die == null || !STATS.includes(l.stat)) continue; // the hall's turret has no runner behind it
        if (l.kind === 'guard') {
          const p = 1 - chanceOf(l.value, l.need); // the guard's chance, turned round
          out.push({ stat: 'cool', op: l.targetId, p, success: !l.success, costly: l.success && l.damage > 0, where: 'fight' });
        } else {
          const p = chanceOf(l.value, l.need);
          out.push({ stat: l.stat, op: l.actor?.id, p, success: l.success, costly: !l.success && l.kind === 'stabilise', where: 'fight' });
        }
      }
      return;
    }
    if (!e.stat || e.die == null || !STATS.includes(e.stat)) return;
    const p = chanceOf(e.value, e.need);
    let costly = false;
    let where = e.kind === 'save' ? 'save' : e.kind === 'critical' ? 'critical' : e.incident ? 'incident' : 'crisis';
    if (!e.success) {
      const oc = e.outcomeCost ?? {};
      const hurt = (oc.heat ?? 0) > 0 || (oc.payCut ?? 0) > 0 || (oc.cash ?? 0) < 0 || !!e.injury;
      if (where === 'incident') costly = !rescued(i) && (hurt || fightNext(i));
      else if (where === 'save') costly = !rescued(i); // the last save that misses lets the incident's cost land
      else if (where === 'critical') costly = true;
      else costly = hurt || fightNext(i);
    }
    out.push({ stat: e.stat, op: e.actor?.id, p, success: e.success, costly, where });
  });
  return out;
}

/** Side work's one roll (core/sidetasks.js resolve), from its report. */
function sideRoll(side) {
  const task = sideTaskById(side.taskId);
  const f = task?.fail ?? {};
  const p = chanceOf(side.value, side.need);
  return { stat: side.stat, op: null, p, success: side.success, costly: !side.success && (task?.purpose === 'money' || !!f.heat || !!f.injury || !!f.held), where: 'side' };
}

function addRolls(t, rolls) {
  const seen = new Set();
  for (const r of rolls) {
    const s = t[r.stat];
    s.rolls++;
    seen.add(r.stat);
    if (r.p >= DECISIVE[0] && r.p <= DECISIVE[1]) s.decisive++;
    if (!r.success) s.fails++;
    if (r.costly) s.costly++;
  }
  for (const k of seen) t[k].jobs++;
}

/** Everything one run counts. */
function blankRun() {
  return {
    jobs: 0, sideJobs: 0, all: blankTally(),
    byApproach: Object.fromEntries(APPROACH_IDS.map((a) => [a, { jobs: 0, t: blankTally() }])),
    byThreat: Object.fromEntries([1, 2, 3, 4, 5].map((n) => [n, { jobs: 0, t: blankTally() }])),
    byWhere: {}, // where -> stat -> rolls
    // Specialists: runners whose main stat is S, the jobs they went on and those where they rolled S.
    spec: Object.fromEntries(STATS.map((s) => [s, { jobs: 0, rolled: 0 }])),
    heat: 0, hotJobs: 0, injuries: 0, pay: 0, // hotJobs: jobs that left any heat
  };
}

/**
 * The counter: call see(state) after anything that can send a report. It reads each new message
 * once (by id; the inbox drops old news, so it can't be read off at the end).
 */
export function makeCounter() {
  const run = blankRun();
  const seen = new Set();
  const meta = new Map(); // `${templateId}:${firstCrewId}` -> { approach, threat }, noted when the job starts
  const mainOf = new Map(); // runner id -> main stat, kept from the roster
  const note = (am) => meta.set(`${am.templateId}:${am.crewIds[0]}`, { approach: am.approach, threat: am.threat });
  const see = (s) => {
    for (const op of s.crew) if (!mainOf.has(op.id)) mainOf.set(op.id, primaryStat(op));
    for (const m of s.inbox) {
      if (seen.has(m.id)) continue;
      seen.add(m.id);
      if (m.type !== 'report' || !m.timeline) continue;
      if (m.timeline.side) { run.sideJobs++; addRolls(run.all, [sideRoll(m.timeline.side)]); continue; }
      const events = m.timeline.events;
      if (!events || !m.back) continue;
      const rolls = rollsOf(events);
      run.jobs++;
      addRolls(run.all, rolls);
      const k = meta.get(`${m.back.templateId}:${m.back.crewIds[0]}`) ?? {};
      if (run.byApproach[k.approach]) { run.byApproach[k.approach].jobs++; addRolls(run.byApproach[k.approach].t, rolls); }
      if (run.byThreat[k.threat]) { run.byThreat[k.threat].jobs++; addRolls(run.byThreat[k.threat].t, rolls); }
      for (const r of rolls) { const w = (run.byWhere[r.where] ??= {}); w[r.stat] = (w[r.stat] ?? 0) + 1; }
      for (const id of m.back.crewIds) {
        const main = mainOf.get(id);
        if (!main) continue; // a freelancer, gone home
        run.spec[main].jobs++;
        if (rolls.some((r) => r.op === id && r.stat === main)) run.spec[main].rolled++;
      }
      const out = m.timeline.outcome ?? [];
      run.pay += m.back.pay ?? 0;
      const heat = Number(out.map((o) => o.text.match(/^Heat \+(\d+)/)?.[1]).find(Boolean) ?? 0);
      run.heat += heat;
      if (heat > 0) run.hotJobs++;
      const hurt = out.map((o) => o.text.match(/^Injured: (.*)\.$/)?.[1]).find(Boolean);
      run.injuries += hurt ? hurt.split(', ').length : 0;
    }
  };
  return { run, see, note };
}

// --- policies ------------------------------------------------------------------------------

/** The planner's picks for a job (Joss's picks), as startMission's options. */
function picks(s, job, approach, { alwaysWheels = false } = {}) {
  const v = jobView(s, job);
  const tpl = { ...v.tpl, threat: v.threat };
  const free = s.crew.filter((op) => availability(s, op).ok);
  const p = jossPicks(tpl, free, approach, { threat: v.threat });
  let wheels = p.wheels;
  if (alwaysWheels && !wheels) {
    const used = new Set([...p.crew, p.overwatch].filter(Boolean));
    const driver = free.filter((o) => !used.has(o.id)).sort((a, b) => effectiveStat(b, 'driving', { approach }).value - effectiveStat(a, 'driving', { approach }).value)[0];
    wheels = driver?.id ?? null;
  }
  const standby = p.standby && p.standby !== wheels ? p.standby : null;
  return { crew: p.crew, opts: { overwatch: p.overwatch ? { id: p.overwatch, kit: p.kit } : null, wheels, standby } };
}

/**
 * The policies (drafts/PLAN-stat-usage.md). Each says how to pick an approach; 'tong' plays the
 * sim-tong.mjs player instead (every crew out hands-off).
 */
export const POLICIES = {
  careful: { name: 'Careful stealth, Joss\'s picks', approach: () => 'stealth' },
  loud: { name: 'Loud, Joss\'s picks', approach: () => 'loud' },
  mixed: { name: 'Mixed approaches at random', approach: (pick) => APPROACH_IDS[Math.floor(pick() * APPROACH_IDS.length)] },
  tong: { name: 'Tong play, every crew out (sim-tong)', tong: true },
  wheels: { name: 'Careful stealth, always a Wheels', approach: () => 'stealth', alwaysWheels: true },
};

/** +3 to one stat for everyone on the roster, once each, on the day they're first seen (capped at 20). */
function booster(stat) {
  const done = new Set();
  return (s) => {
    for (const op of s.crew) {
      if (done.has(op.id)) continue;
      done.add(op.id);
      op.stats[stat] = Math.min(MAX_STAT, op.stats[stat] + 3);
    }
  };
}

/**
 * One season. The careful player is tests/play.js playWeeks (fresh start, hires above ¥10,000, the
 * best-paying job the free crew can staff, Monday to Saturday), with Joss's picks and the policy's
 * approach; tong is scripts/sim-tong.mjs's player. count: false plays without the counter (the test).
 * Returns { cash, deaths, run } at the end (deaths: names on the wall).
 */
export function playSeason({ seed, weeks = 52, policy = 'careful', boost = null, count = true }) {
  const pol = POLICIES[policy];
  const counter = count ? makeCounter() : { run: null, see: () => {}, note: () => {} };
  const lift = boost ? booster(boost) : () => {};
  const choose = makeRng(hash('stat-usage', seed)); // the mixed policy's own dice: never the game's
  let s = createNewGame({ seed, startCrew: pol.tong ? 'pick' : 'fresh' });
  if (s.founding) s = autoFounders(s);
  for (let day = 0; day < weeks * 7; day++) {
    lift(s);
    if (calendar(s.day).weekday !== 'Sun') {
      if (pol.tong) {
        const offers = [...s.jobs].sort((a, b) => jobView(s, b).pay - jobView(s, a).pay);
        for (const job of offers) {
          const free = s.crew.filter((op) => availability(s, op).ok);
          const tpl = templateById(job.templateId);
          if (free.length < tpl.crewSize) continue;
          const crew = [...free].sort((a, b) => (a.role === 'medic' ? -1 : 0) - (b.role === 'medic' ? -1 : 0)).slice(0, tpl.crewSize);
          const next = sendOff(s, job.id, crew.map((o) => o.id), 'stealth', 'steady', { callIn: 'never' });
          if (next !== s) { s = next; counter.note(s.awayJobs.at(-1).mission); }
        }
      } else {
        const free = s.crew.filter((op) => availability(s, op).ok);
        const jobs = [...s.jobs].sort((a, b) => templateById(b.templateId).pay - templateById(a.templateId).pay);
        const job = jobs.find((j) => templateById(j.templateId).crewSize <= free.length);
        if (job) {
          const approach = pol.approach(choose);
          const { crew, opts } = picks(s, job, approach, pol);
          let next = M.startMission(s, job.id, crew, approach, opts);
          if (next === s) next = M.startMission(s, job.id, crew, approach); // the picks didn't fit: just the team
          if (next !== s) {
            counter.note(next.activeMission);
            const r = playMission(next, carefulPolicy);
            s = M.closeMission(r.state);
            counter.see(s);
          }
        }
      }
    }
    if (pol.tong) {
      const lead = [...(s.recruits ?? [])].filter((r) => canHire(s, r).ok).sort((a, b) => b.stats[primaryStat(b)] - a.stats[primaryStat(a)])[0];
      const wages = s.crew.reduce((n, o) => n + o.wage, 0);
      if (lead && s.cash - (wages + lead.wage + s.rent) * 2 > 0) s = hire(s, lead.id);
      if (s.crew.length >= (s.rosterCap ?? STARTING_ROSTER_CAP) && s.cash > nextExpansion(s).cost + (wages + s.rent) * 3) s = expandSafehouse(s);
    } else {
      const lead = [...(s.recruits ?? [])].filter((r) => canHire(s, r).ok).sort((a, b) => b.stats[primaryStat(b)] - a.stats[primaryStat(a)])[0];
      if (lead && s.crew.length < 5 && s.cash - lead.wage * 5 > 10000) s = hire(s, lead.id);
    }
    s = advanceDay(s);
    counter.see(s);
  }
  return { cash: s.cash, deaths: s.memorial.length, run: counter.run };
}
