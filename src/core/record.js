// Runner record: what each person has actually done on the job (renown, slice 1; see
// drafts/PROPOSAL-runner-renown.md). Pure logic. Counters only: nothing here touches a roll,
// pay or heat. Fame, standing and milestones build on these numbers in later slices.
//
// op.record is created when a person first needs it (like op.earned and op.track), so a runner
// who has never worked has none; read it with recordOf(op) (a blank one, not stored) and write
// it with ensureRecord(op). Freelancers get no record.

import { isFreelancer } from './freelance.js';
import { onJob } from './run.js';

export const TIER_LEVEL = { rookie: 1, pro: 2, veteran: 3 };
export const CARRY_MIN_DIFFICULTY = 5; // a crisis roll counts as a "carry" at this difficulty or higher
export const BIG_SCORE_THREAT = 4;

/** A tier's level: a job is "at level" for someone when its threat is at least this. */
export const levelOf = (op) => TIER_LEVEL[op.tier] ?? 1;

export const freshRecord = () => ({
  jobs: 0, atLevel: 0, wins: 0, clean: 0, flawless: 0,
  fights: 0, fightsWon: 0,
  carries: 0, carriesByStat: {},
  broughtHome: 0, criticalsSurvived: 0, unscathed: 0, bigScores: 0, seriousInjuries: 0,
  cleanStreak: 0, bestCleanStreak: 0,
  with: {}, activeWeeks: 0, lastJobDay: 0,
  milestones: [], highlights: [], // earned ids; the best three {id, day, text, weight} (core/milestones.js)
  estimated: false, // true on saves from before records began (counts were guessed from jobs worked)
});

/** Read a record without storing one. */
export const recordOf = (op) => op.record ?? freshRecord();
export const ensureRecord = (op) => (op.record ??= freshRecord());

/**
 * One finished job: update the record of everyone who took part (live or hands-off, inside or out;
 * the dead too, before they go to the memorial). Call once from finish(), after pay/heat are known
 * and before deaths are removed. Mutates the (cloned) state.
 *
 * ctx: { threat, outcome: 'completed'|'aborted'|'loss', heatGain, deaths: [op] }
 */
export function recordJob(state, am, { threat, outcome, heatGain, deaths }) {
  const crew = onJob(state, am).filter((o) => !isFreelancer(o));
  if (!crew.length) return;
  const events = am.events ?? [];
  const completed = outcome === 'completed';
  const clean = completed && !am.wentLoud && heatGain === 0;
  const hadCritical = events.some((e) => e.kind === 'critical' || e.injury?.severity === 'critical') || (am.untreated ?? []).length > 0;
  const flawless = completed && !hadCritical;

  // Who was in a fight, and whether the crew won it. (Who landed which hit isn't tracked; the
  // count is shared by everyone who stood in the fight.)
  const fought = new Map(); // opId -> { won }
  for (const e of events.filter((x) => x.kind === 'battle' && (x.phase === 'end' || x.phase === 'retreat'))) {
    for (const r of e.runners ?? []) {
      const f = fought.get(r.id) ?? { n: 0, won: 0 };
      f.n += 1; if (e.phase === 'end' && e.how === 'won') f.won += 1;
      fought.set(r.id, f);
    }
  }
  // Patients of critical events, and who stabilised whom.
  const stabilised = events.filter((e) => e.kind === 'critical' && e.action === 'stabilise' && e.success);
  const patients = new Set(events.filter((e) => e.kind === 'critical').map((e) => e.patient));
  const dead = new Set(deaths.map((d) => d.id));

  for (const op of crew) {
    const r = ensureRecord(op);
    const atLevel = threat >= levelOf(op);
    r.jobs += 1;
    if (atLevel) r.atLevel += 1;
    r.lastJobDay = state.day;
    if (completed) r.wins += 1;
    if (clean) { r.clean += 1; r.cleanStreak += 1; r.bestCleanStreak = Math.max(r.bestCleanStreak, r.cleanStreak); } else r.cleanStreak = 0;
    if (flawless) r.flawless += 1;
    if (completed && threat >= BIG_SCORE_THREAT) r.bigScores += 1;
    if (completed && !dead.has(op.id) && op.condition.injury === 'healthy') r.unscathed += 1;
    if (!dead.has(op.id) && (op.condition.injury === 'serious' || op.condition.injury === 'critical')) r.seriousInjuries += 1;
    const f = fought.get(op.id);
    if (f) { r.fights += f.n; r.fightsWon += f.won; }
    r.broughtHome += stabilised.filter((e) => e.actor?.id === op.id).length;
    if (patients.has(op.handle) && !dead.has(op.id)) r.criticalsSurvived += 1;
    // Carries: a successful roll of theirs on a real crisis (not an incident, not a walk-away) at a
    // hard-enough difficulty, on a job at their level.
    if (atLevel) {
      for (const e of events) {
        if (e.kind !== 'roll' || e.incident || !e.success || e.actor?.id !== op.id) continue;
        if ((e.difficulty ?? 0) < CARRY_MIN_DIFFICULTY) continue;
        r.carries += 1;
        if (e.stat) r.carriesByStat[e.stat] = (r.carriesByStat[e.stat] ?? 0) + 1;
      }
    }
    for (const other of crew) if (other.id !== op.id) r.with[other.id] = (r.with[other.id] ?? 0) + 1;
  }
}

/**
 * Did they work since last Sunday's settle? Sunday settles at the start of the day (time.js
 * advanceDay), before any job that day, so last Sunday's jobs (day - 7) belong to this week.
 * (Until 2026-11-03 this was day - 6, which lost every job finished on a Sunday, live or a
 * hands-off crew back that day.)
 */
export const workedThisWeek = (op, day) => (op.record?.lastJobDay ?? -Infinity) >= day - 7;

/** Sunday: a week counts as active if they worked since last Sunday. Mutates the (cloned) state. */
export function weeklyRecord(state) {
  for (const op of state.crew) {
    if (isFreelancer(op) || !op.record) continue;
    if (workedThisWeek(op, state.day)) op.record.activeWeeks += 1;
  }
}

/** A short copy for the memorial: the headline numbers, not the whole record. */
export function recordSummary(op) {
  const r = recordOf(op);
  return { jobs: r.jobs, wins: r.wins, clean: r.clean, bestCleanStreak: r.bestCleanStreak, carries: r.carries, activeWeeks: r.activeWeeks };
}

/** Save v30: give everyone who has worked a record, guessed from the jobs they've done. */
export function seedRecord(op, { today }) {
  if (op.record || isFreelancer(op)) return;
  const jobs = op.jobsWithCrew ?? 0;
  const r = freshRecord();
  Object.assign(r, { jobs, atLevel: Math.floor(jobs / 2), wins: Math.floor(jobs * 0.8), activeWeeks: Math.ceil(jobs / 2), lastJobDay: jobs ? today : 0, estimated: jobs > 0 });
  op.record = r;
}
