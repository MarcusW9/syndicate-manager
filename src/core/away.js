// Away jobs, day by day (DESIGN.md 2026-11-04, "away-crew call-ins"). Pure logic.
//
// A crew sent away (autorun.js sendOff) plays its job a share at a time: each day it takes the
// steps up to that day's stopping point, a story beat (`stopAt`). Days with no beat to reach are
// quiet: casing the place or lying low. On the last day the job ends and the report comes back.
//
// When a step needs the player (needsPlayer: a crisis under "risky" or "every", a critical, a
// call-in like death's door), the crew waits and a blocking message asks for the call. Taking the
// call (takeCall) puts the job on the watch screen, where the usual call-in cards decide it. From
// there the player hands it back (letThemRun) or takes command and plays the rest now (takeCommand).
// One job can be live at a time (state.activeMission); time can't move while it is.
//
// The death rule holds: a critical on an away job is a call-in, so death still only follows a choice
// the player made; crews on "never" extract on their own, as hands-off crews always have.

import { templateById } from './jobs.js';
import { closeMission } from './mission.js';
import { autoStep, needsPlayer, dayDone, beatsByDay } from './autorun.js';

export { dayDone };
import { QUIET_LINES } from '../data/away.js';

const crewOf = (s, am) => [...am.crewIds, am.overwatch?.id, am.wheels, am.standby?.id].filter(Boolean).map((id) => s.crew.find((o) => o.id === id)).filter(Boolean);
const names = (ops) => (ops.length > 1 ? `${ops.slice(0, -1).map((o) => o.handle).join(', ')} and ${ops.at(-1).handle}` : ops[0]?.handle ?? 'The crew');
const firstSentence = (text = '') => (/^.*?[.!?](?=\s|$)/.exec(text)?.[0] ?? text);

/** One or two lines for what the crew did today (Today's "crews out" list); quiet when nothing happened. */
function dayLines(s, am, fromEvent) {
  const today = (am.events ?? []).slice(fromEvent);
  const said = today.filter((e) => e.report).map((e) => e.report);
  if (said.length) return { lines: said.slice(-2), quiet: false };
  const beat = today.filter((e) => e.kind === 'beat').at(-1);
  if (beat) return { lines: [firstSentence(beat.text)], quiet: false };
  const lead = crewOf(s, am)[0];
  const line = QUIET_LINES[(s.day + am.jobId.length) % QUIET_LINES.length];
  return { lines: [line.replace('{lead}', lead?.handle ?? 'The crew')], quiet: true };
}

/** The blocking message that asks the player to take a crew's call. */
function callMessage(s, am) {
  const tpl = templateById(am.templateId);
  return {
    id: `callin-${am.jobId}-${s.day}-${am.step}`, type: 'job', kind: 'callin', day: s.day,
    subject: `We need a call: ${tpl.name}`,
    body: `${names(crewOf(s, am))} ${am.crewIds.length > 1 ? 'are' : 'is'} on the line. Something's come up that's beyond their orders, and they'd like your call. They'll hold until we answer.`,
    blocking: true, resolved: false, read: false, payload: { jobId: am.jobId },
  };
}

/**
 * The day tick for crews out (time.js advanceDay, after the rest of the day). Each away job that
 * isn't waiting on a call takes today's share; a job that ends files its report; a job that needs
 * the player waits with a blocking message. Returns the new state.
 */
export function advanceAway(prev) {
  if (!(prev.awayJobs ?? []).length || prev.activeMission) return prev;
  let s = structuredClone(prev);
  const keep = [];
  for (const j of s.awayJobs) {
    if (j.waiting) { keep.push(j); continue; }
    const am = j.mission;
    if (!am.away) am.away = { beats: 0 }; // a job sent before v35 (save.js) gets one on its first day
    const days = am.days ?? templateById(am.templateId).days;
    const d = s.day - (am.startedDay ?? s.day);
    if (d < 1) { keep.push(j); continue; }
    am.away.beats = Math.max(am.away.beats, beatsByDay(templateById(am.templateId).beats.length, days, d));
    am.away.day = d;
    const from = (am.events ?? []).length;
    s.activeMission = am;
    for (let guard = 0; guard < 200; guard++) {
      if (s.activeMission.done || dayDone(s.activeMission) || needsPlayer(s)) break;
      const next = autoStep(s);
      if (next === s) break;
      s = next;
    }
    const now = s.activeMission;
    s.activeMission = null;
    if (now.done) {
      // The job ended (the last day, or the crew walked away): the report and pay land now.
      s.activeMission = now;
      s = closeMission(s);
      continue;
    }
    j.mission = now;
    j.today = { day: s.day, ...dayLines(s, now, from) };
    if (!dayDone(now)) { // it stopped for the player, not for the night
      j.waiting = true;
      s.inbox.unshift(callMessage(s, now));
    }
    keep.push(j);
  }
  s.awayJobs = keep;
  return s;
}

/** Take a waiting crew's call: their job goes on the watch screen at the call-in. */
export function takeCall(prev, jobId) {
  const j = (prev.awayJobs ?? []).find((x) => x.mission.jobId === jobId);
  if (!j || prev.activeMission) return prev;
  const s = structuredClone(prev);
  const job = s.awayJobs.find((x) => x.mission.jobId === jobId);
  s.awayJobs = s.awayJobs.filter((x) => x !== job);
  s.activeMission = { ...job.mission, away: { ...job.mission.away, returnDay: job.returnDay } };
  for (const m of s.inbox) if (m.kind === 'callin' && m.payload?.jobId === jobId) { m.resolved = true; m.read = true; }
  return s;
}

/** Can the job on screen be handed back to its crew? Once it has done today's share. */
export const canLetRun = (s) => dayDone(s.activeMission);

/** Hand the job on screen back to its crew: it carries on from tomorrow, on their orders. */
export function letThemRun(prev) {
  if (!canLetRun(prev)) return prev;
  const s = structuredClone(prev);
  const am = s.activeMission;
  const { returnDay, ...away } = am.away;
  s.activeMission = null;
  s.awayJobs = [...(s.awayJobs ?? []), { returnDay, mission: { ...am, away }, today: { day: s.day, lines: ['Back on their own, on their orders.'] } }];
  return s;
}

/** Take command of the job on screen: it plays to the end now, with fights waiting for your orders. */
export function takeCommand(prev) {
  if (!prev.activeMission?.away || prev.activeMission.done) return prev;
  const s = structuredClone(prev);
  s.activeMission.away.command = true;
  if (s.activeMission.callIn === 'never') s.activeMission.callIn = 'risky';
  return s;
}

/** For Today: each crew out, with its day, what it did today and whether it's waiting on you. */
/** Where a crew out has got to, in a word: before the first beat they're casing the place. */
export function phaseOf(am) {
  const told = (am.events ?? []).filter((e) => e.kind === 'beat').length;
  if (!told) return 'Casing the place';
  if (am.zone === 'out') return 'Getting out';
  if (am.zone === 'inside' || am.zone === 'target') return 'On the job';
  return 'Going in';
}

/**
 * For Today (and later the command centre): each crew out, with its day, how far through its story
 * beats it is, a phase word, a status (call waiting, someone hurt, lying low today, or on the job),
 * the people on it and what they did today.
 */
export function crewsOut(s) {
  return (s.awayJobs ?? []).map((j) => {
    const am = j.mission;
    const tpl = templateById(am.templateId);
    const days = am.days ?? tpl.days;
    const today = j.today?.day === s.day ? j.today : null;
    const hurt = (am.events ?? []).some((e) => e.injury);
    return {
      jobId: am.jobId, name: tpl.name, crew: names(crewOf(s, am)), crewIds: crewOf(s, am).map((o) => o.id), returnDay: j.returnDay,
      day: Math.min(days, Math.max(0, s.day - (am.startedDay ?? s.day))), days,
      beats: tpl.beats.length, beatsDone: (am.events ?? []).filter((e) => e.kind === 'beat').length,
      phase: phaseOf(am),
      status: j.waiting ? 'call' : hurt ? 'hurt' : today?.quiet ? 'low' : 'on',
      lines: today?.lines ?? [], waiting: !!j.waiting,
    };
  });
}
