// Planning a main job: the plan screen around the squad board (ui/board.js), the picker's reads,
// the plan bar and "What they'll likely meet".
import { openingFor } from '../core/halls.js';
import { jobGrudge, grudgeOf, GANGS, GRUDGE } from '../core/gangs.js';
import { HALL_SITES } from '../data/halls.js';
import { crewAgainstStandard } from '../core/week.js';
import { heistFor, asSentence, heistEffects } from '../core/heists.js';
import { HEIST_RULES } from '../data/heists.js';
import { NAMES } from '../config/names.js';
import { DISTRICTS } from '../data/districts.js';
import { PARTNER } from '../data/partner.js';
import { statGlyph } from './icons.js';
import { LEGEND_TEXT } from '../data/legend.js';
import { NAMED_TEXT } from '../data/fame.js';
import { jobView } from '../core/jobs.js';
import { trustLabel, clientById } from '../core/clients.js';
import { ratedStat, traitMods, availability, APPROACHES, maxCrew, crewSizeRead } from '../core/crew.js';
import { rollTarget, riskLabel, successChance } from '../core/risk.js';
import { money } from '../core/money.js';
import { fillBrief, CALL_IN } from '../core/mission.js';
import { renderFightPlan } from './fightscreen.js';
import { handsOffAllowed, ORDERS } from '../core/autorun.js';
import { planRead, planTries, leanPicks as leanPicksRaw } from '../core/squad.js';
import { renderBoard, renderPicker, renderCoverage } from './board.js';
import { kitsFor } from '../core/gear.js';
import { intelFor } from '../core/sidetasks.js';
import { mentoring } from '../core/development.js';
import { freelancerAsCrew, MAX_FREELANCERS_PER_JOB, shareOf } from '../core/freelance.js';
import { renderJobs, rivalRemark, definingHandle, namedHandle, fillNamed, knownPicks } from './jobs.js';
import { canWork, ask } from './boardwork.js';
import { renderCallIns } from './jobscreen.js';
import { esc, statName, riskBadge, riskWord, districtName, daysLeft, hallLabel, face, statusChip } from './shared.js';
import { state, backLabel, V } from './view.js';

const threatDots = (n) => '●'.repeat(n) + '○'.repeat(5 - n);
/** Threat with a marker when this offer is above or below the job's usual level. */
const threatHtml = (v) => `<span class="threat">${threatDots(v.threat)}</span>${v.threatDelta > 0 ? ' <span class="tag-up">hotter than usual</span>' : v.threatDelta < 0 ? ' <span class="tag-down">quieter than usual</span>' : ''}`;
const clientLine = (v) => v.client ? `${esc(v.client.name)} <span class="muted">(${esc(trustLabel(v.trust))})</span>` : '<span class="muted">Walk-in job</span>';
/** The word a risk level shows as: "moderate" reads as "mid" (shorter; owner's call, 2026-10-28). */
const RANK = ['low', 'moderate', 'high', 'extreme'];
/**
 * Key stats for a job, written out ("Medical 8 · Cool 5*"), each coloured by how it
 * measures up to this job's typical roll: green good, amber shaky, red weak.
 */
function keyStatsFor(op, tpl, threat) {
  const target = rollTarget({ ...tpl, threat });
  return tpl.keyStats.map((k) => {
    const v = ratedStat(op, k);
    const fit = { low: 'good', moderate: 'shaky', high: 'weak', extreme: 'weak' }[riskLabel(successChance(v, target))];
    return `<span class="fit fit--${fit} iconword">${statGlyph(k)}${esc(statName(k))} ${v}${traitMods(op)[k] ? '*' : ''}</span>`;
  }).join(' · ');
}
const districtTurf = (key) => DISTRICTS[key]?.turf ? ` · ${esc(DISTRICTS[key].turf)}` : '';

function renderMentoring(crew) {
  const pairs = mentoring(crew);
  if (!pairs.length) return '';
  return `<p class="small mentor">${pairs.map(({ op, mentors }) => `${esc(op.handle)} learns faster with ${esc(mentors.map((m) => m.handle).join(' and '))} on the job.`).join(' ')}</p>`;
}

/**
 * Joss's squad for this job and approach, remembered per game state (2026-11-14). leanPicks tries every mix of overwatch, van and extras
 * (60 to 600 ms with a full roster), and a render asked for it every time the plan changed, so a tap on an approach froze the screen and
 * a second tap landed mid-render. The picks depend only on the state, the job and the approach, so the same three give the same answer.
 */
const leanMemo = new WeakMap();
const leanAsked = new WeakMap(); // per state, the picks out with the worker
const leanKey = (state, job, approach) => `${job.id}|${approach}|${state.day}|${state.crew.map((o) => o.id).join(',')}`;
function memoOf(state) {
  let m = leanMemo.get(state);
  if (!m) { m = new Map(); leanMemo.set(state, m); }
  return m;
}
export function leanPicks(state, job, approach) {
  const m = memoOf(state);
  const key = leanKey(state, job, approach);
  // The board's read already holds Joss's picks for its own approach (core/squad.js jobRead is leanPicks for each approach).
  if (!m.has(key)) m.set(key, knownPicks(state, job, approach) ?? leanPicksRaw(state, job, approach));
  return m.get(key);
}

/**
 * After a plan draws, get Joss's picks for the other approaches ready, so switching approach finds them: off the main thread
 * where there is a worker (ui/boardwork.js, 2026-11-14), else one at a time while the screen is idle.
 */
function warmLean(job) {
  const st = state;
  const m = memoOf(st);
  const todo = Object.keys(APPROACHES).filter((ap) => !m.has(leanKey(st, job, ap)));
  if (canWork()) {
    let out = leanAsked.get(st);
    if (!out) leanAsked.set(st, (out = new Set()));
    for (const ap of todo) {
      const key = leanKey(st, job, ap);
      if (out.has(key)) continue;
      out.add(key);
      ask(st, { kind: 'lean', jobId: job.id, approach: ap }).then((p) => { if (!m.has(key)) m.set(key, p); }, () => out.delete(key));
    }
    return;
  }
  const next = () => {
    if (state !== st || !V.plan || V.plan.jobId !== job.id) return;
    const ap = todo.shift();
    if (!ap) return;
    leanPicks(st, job, ap);
    setTimeout(next, 30);
  };
  setTimeout(next, 250);
}

export function renderPlan() {
  const job = state.jobs.find((j) => j.id === V.plan.jobId);
  if (!job) { V.plan = null; return renderJobs(); }
  warmLean(job);
  const v = jobView(state, job);
  const t = v.tpl;
  const freelancers = state.freelancers ?? [];
  const people = [...state.crew, ...freelancers.map(freelancerAsCrew)];
  const picked = V.plan.crew.map((id) => people.find((o) => o.id === id)).filter(Boolean);
  const intel = intelFor(state, t.district, v.inside);
  const wheelsOp = state.crew.find((o) => o.id === V.plan.wheels) ?? null;
  const owOp = state.crew.find((o) => o.id === V.plan.overwatch) ?? null;
  // The bar shows the worse of the two reads: the crises (risk read) and the incidents (coverage).
  // core/squad.js planRead is shared with the job board, so the card and this screen agree.
  const { level: toughest, read, cov } = planRead(state, job, { crew: picked, approach: V.plan.approach, overwatch: owOp, kit: V.plan.kit, wheels: wheelsOp });
  // What moved since the last change to the plan (2026-11-05): each encounter's risk and the bar's.
  // The read before the change is kept until the plan changes again, so a fold or a tap elsewhere
  // doesn't lose it; the flash only plays on the first draw after a change.
  const sig = JSON.stringify([V.plan.crew, V.plan.approach, V.plan.overwatch, V.plan.kit, V.plan.wheels]);
  const rowKey = (r) => `${r.id}:${r.zone}`;
  V.readFresh = false;
  if (V.readMemo?.jobId !== V.plan.jobId) V.readBefore = null;
  else if (V.readMemo.sig !== sig) { V.readBefore = V.readMemo; V.readFresh = true; }
  V.readMemo = { jobId: V.plan.jobId, sig, rows: new Map(cov.rows.map((r) => [rowKey(r), r.effective])), level: picked.length ? toughest : null };
  // Joss's reason, while the plan is still theirs (2026-11-05): what each runner covers on this job,
  // by the stat they handle the most encounters with (else their best key stat), then overwatch, the van.
  const jossLine = (() => {
    if (sig !== V.jossSig || !picked.length) return '';
    const R = PARTNER.pickReasons;
    const parts = picked.map((op) => {
      const handled = cov.rows.filter((x) => x.handler?.op.id === op.id).map((x) => x.handler.stat);
      const stat = handled.sort((a, b) => handled.filter((x) => x === b).length - handled.filter((x) => x === a).length)[0]
        ?? [...t.keyStats].sort((a, b) => ratedStat(op, b) - ratedStat(op, a))[0];
      return R[stat] ? R[stat].replace('{name}', op.handle) : '';
    }).filter(Boolean);
    const seen = new Set(); const uniq = parts.filter((x) => { const k = x.replace(/^\S+ /, ''); if (seen.has(k)) return false; seen.add(k); return true; });
    const out = [...uniq.slice(0, 3), owOp ? R.overwatch.replace('{name}', owOp.handle) : '', wheelsOp ? R.wheels.replace('{name}', wheelsOp.handle) : ''].filter(Boolean).slice(0, 3);
    return out.length ? `“${out.join(', ')}.”` : '';
  })();
  const was = V.readBefore && picked.length && V.readBefore.level ? { rows: V.readBefore.rows, level: V.readBefore.level, key: rowKey, fresh: V.readFresh } : null;
  // The squad board's mat flashes on the same signal (2026-11-08): the bar's level or any encounter moved.
  const riskMoved = !!was?.fresh && (was.level !== toughest || cov.rows.some((r) => { const b = was.rows.get(rowKey(r)); return b && b !== r.effective; }));
  // The bar's notes (2026-11-04: the crises card folded in here; 2026-11-05: always says what sets the
  // risk). Above low risk the first note names the weakest point: the encounter at the bar's level,
  // and, when the crises' skills read is at that level too, the stat they lean on. Then the skills
  // read's warnings. "Crew matches the job well" only at low risk.
  // Short enough to read on a phone (2026-11-05): "who stat value", no roll arithmetic (that's on
  // the cards and in the read), and no line that repeats the weakest point's person and stat.
  const short = (r) => r
    .replace(/^Weak on (\w+): best is (\S+) \((\d+).*$/, 'Weak on $1 · $2 $3')
    .replace(/^(\d+) extra on the crew: .*$/, '$1 extra: more backup, more at risk')
    .replace(/^Short-handed: (\d+) of (\d+), (.*)$/, 'Short-handed ($1 of $2): $3')
    .replace(/^No medic: .*$/, 'No medic for a bad wound')
    .replace(/^Watched: .*?(-\d+)$/, 'Watched: first crisis roll $1');
  const warnings = read.reasons.filter((r) => r !== 'Crew matches the job well').map(short);
  const notes = [];
  if (toughest !== 'low') {
    const row = cov.rows.find((x) => x.effective === toughest);
    if (row) notes.push(`Weakest: ${row.name} · ${row.handler ? `${row.handler.op.handle} ${row.handler.stat} ${row.handler.value}` : 'nobody can'}`);
    const w = read.weakest;
    if (read.level === toughest && w && !warnings.some((x) => x.startsWith(`Weak on ${w.stat}`))) notes.push(`Crises lean on ${w.stat} · ${w.op.handle} ${w.value}, about ${Math.round(w.chance * 100)}%`);
    // Drop "Weak on tech · Signal 9" when the weakest point already says "Signal tech 9".
    if (row?.handler) for (let i = warnings.length - 1; i >= 0; i--) if (warnings[i].startsWith(`Weak on ${row.handler.stat} · ${row.handler.op.handle} `)) warnings.splice(i, 1);
  }
  notes.push(...warnings);
  if (!notes.length) notes.push(toughest === 'low' ? 'Crew matches the job well' : 'Some rolls on this job are close calls');
  // What to try (2026-11-05): single changes that lower the risk, read the same way as the bar; if
  // none does, Joss's squad for this approach when it's better.
  V.planTryList = [];
  if (picked.length && toughest !== 'low') {
    const free = state.crew.filter((o) => !o.freelance && o.id !== V.plan.standby && availability(state, o).ok);
    V.planTryList = planTries(state, job, { crew: picked, approach: V.plan.approach, overwatch: owOp, kit: V.plan.kit, wheels: wheelsOp }, free);
    if (!V.planTryList.length) {
      const picks = leanPicks(state, job, V.plan.approach);
      const order = ['low', 'moderate', 'high', 'extreme'];
      if (order.indexOf(picks.level) < order.indexOf(toughest)) V.planTryList = [{ kind: 'joss', picks, level: picks.level }];
    }
  }
  const tryWord = (tr) => ({ approach: () => `switch to ${APPROACHES[tr.approach].name}`, swap: () => `${tr.op.handle} for ${tr.out.handle}`, add: () => `add ${tr.op.handle}`,
    overwatch: () => `${tr.op.handle} on overwatch`, wheels: () => `${tr.op.handle} at the wheel`, joss: () => "Joss's picks" }[tr.kind]());
  const most = maxCrew(t.crewSize);

  V.planBarHtml = `
    <div class="planbar">
      <div class="planbar__read">
        ${picked.length ? `<span class="planbar__level ${was && was.level !== toughest && was.fresh ? 'is-flash' : ''}">${riskBadge(toughest)}${was && was.level !== toughest ? `<span class="was was--${RANK.indexOf(toughest) < RANK.indexOf(was.level) ? 'better' : 'worse'}">was ${esc(riskWord(was.level))}</span>` : ''}</span>` : '<span class="risk risk--none">no crew yet</span>'}
        ${!picked.length ? `<span class="planbar__why">${esc(`Pick up to ${most}; ${t.crewSize} recommended`)}</span>`
          : notes.length === 1 && !V.planTryList.length ? `<span class="planbar__why">${esc(notes[0])}</span>`
          : (() => {
            // One line until asked (2026-11-05): the reason, then a tap for the rest and what to try.
            const more = [notes.length > 1 ? `+${notes.length - 1} more` : '', V.planTryList.length ? `${V.planTryList.length} to try` : ''].filter(Boolean).join(' · ');
            return `<button class="planbar__why planbar__why--more" data-action="plan-why" aria-expanded="${V.whyOpen}">${V.whyOpen ? `${notes.map((n) => `<span>${esc(n)}</span>`).join('')}<b>Hide ▴</b>` : `<span class="planbar__line">${esc(notes[0])}</span><b>${esc(more)} ▾</b>`}</button>`;
          })()}

      </div>
      ${(() => {
        // Send them, with Watch live beside it (playtest, 2026-11-07): the other way to run it is one
        // tap away instead of inside the Orders fold. Picking one also sets plan.mode, so the fold agrees.
        const canSend = handsOffAllowed(t);
        const away = V.plan.mode !== 'live' && canSend;
        const n = V.plan.crew.length + [V.plan.overwatch, V.plan.wheels, V.plan.standby].filter(Boolean).length;
        const main = `<button class="btn btn--primary" data-action="${away ? 'send-job' : 'start-job'}" ${V.plan.crew.length ? '' : 'disabled'}>
        ${V.plan.crew.length ? `${away ? 'Send them' : 'Go live'} (${n})` : 'Pick a crew'}
      </button>`;
        const other = !canSend ? '' : `<button class="btn btn--ghost planbar__alt" data-action="${away ? 'start-job' : 'send-job'}" ${V.plan.crew.length ? '' : 'disabled'}>${away ? 'Watch live' : 'Send them'}</button>`;
        return `<div class="planbar__go">${main}${other}</div>${planOrdersQuick(t)}`;
      })()}
      ${V.planTryList.length && V.whyOpen ? `<div class="planbar__tries"><span>Try</span>${V.planTryList.map((tr, i) => `<button class="trychip" data-action="plan-try" data-id="${i}">${esc(tryWord(tr))} <b>→ ${esc(riskWord(tr.level))}</b></button>`).join('')}</div>` : ''}
    </div>`;

  return `
    <section class="panel">
      <button class="btn btn--ghost" data-action="back">← ${esc(backLabel())}</button>
      <h1>${esc(t.name)}</h1>
      <p class="muted">${esc(districtName(t.district))}${districtTurf(t.district)} · threat ${threatHtml(v)} · pays ${money(v.pay)} · crew away ${v.days}d · ${daysLeft(job.expiresDay)}</p>
      ${DISTRICTS[t.district] && V.briefOpen ? `<p class="muted small">${esc(DISTRICTS[t.district].pitch)}</p>` : ''}
      <p class="body ${V.briefOpen ? '' : 'brief--short'}">${esc(fillBrief(t))}</p>
      <button class="linkbtn" data-action="brief-more" aria-expanded="${V.briefOpen}">${V.briefOpen ? 'Show less' : 'Read more'}</button>
      ${(() => { const c = crewAgainstStandard(picked, v.threat); return `<p class="standard ${picked.length ? (c.met ? 'is-met' : 'is-short') : ''} small"><strong>Crew standard: ${esc(c.std.label)}</strong>${picked.length ? ` · ${esc(c.note)}` : ''}</p>`; })()}
      ${(() => { // a job against a gang says what it costs before you take it (shown risk equals used risk)
        const g = jobGrudge(t, v.threat);
        if (!g) return '';
        const now = grudgeOf(state, g.gang);
        return `<p class="grudgeline small"><strong>Against ${esc(GANGS[g.gang].name)}:</strong> finishing it adds grudge +${g.n} (now ${now}/10, then ${Math.min(GRUDGE.max, now + g.n)}). From ${GRUDGE.raidAt} they may raid a hall of ours on their turf.</p>`;
      })()}
      ${(() => { // a contact's opening favour says what it opens (core/halls.js)
        const d = openingFor(state, job.id);
        if (!d) return '';
        return `<p class="openingline small"><strong>A favour for ${esc(v.client?.name ?? 'a contact')}:</strong> finish it and ${esc(hallLabel(d))} is ours to take (${esc(HALL_SITES[d].place)}). Walk away, and they ask again in two weeks.</p>`;
      })()}
      ${heistPlanLine(job)}
      <div class="plangrid">
      <div class="riskcard plangrid__client">
        <p><strong>Client:</strong> ${clientLine(v)}${v.client ? ` <button class="infobtn" data-action="client-info" aria-expanded="${V.clientOpen}" aria-label="About ${esc(v.client.name)}">${V.clientOpen ? '×' : 'i'}</button>` : ''}</p>
        ${v.client && V.clientOpen ? `<p class="muted small">${esc(v.client.desc)}</p>` : ''}
        ${v.client ? `<button class="linkbtn" data-action="client-open" data-id="${esc(v.client.id)}">${esc(v.client.name)}'s page ›</button>` : ''}
        ${v.threatDelta ? `<p class="muted small">Every roll on this job is ${Math.abs(v.threatDelta) === 1 ? 'one point' : `${Math.abs(v.threatDelta)} points`} ${v.threatDelta > 0 ? 'harder' : 'easier'} than usual.</p>` : ''}
        ${v.hinted ? '<p class="intel">Intel unreliable: something about this job may not be what you were told.</p>' : ''}
        ${rivalRemark(v)}
        ${definingHandle(v) ? `<p class="named">${esc(LEGEND_TEXT.plan.replace('{op}', definingHandle(v)))}</p>` : ''}
        ${namedHandle(v) ? `<p class="named">${esc(fillNamed(NAMED_TEXT.chip, v))} by name: ${esc(fillNamed(NAMED_TEXT.bonus, v))} (inside, outside or on standby). Without them it pays as usual.</p>` : ''}
        ${v.rumour ? `<p class="talk-tag">Street talk: ${esc(v.rumour.text)}</p>` : ''}
        ${intel ? `<p class="talk-tag">Intel from ${esc(intel.source)}: +${intel.bonus} on every roll ${state.intel?.[t.district]?.until >= state.day ? `here until day ${state.intel[t.district].until}` : 'on this job'}.</p>` : ''}
      </div>

      <div class="plangrid__approach">
      <h2>Approach</h2>
      <div class="segmented segmented--grid">
        ${Object.entries(APPROACHES).map(([k, a]) => `
          <button class="seg ${V.plan.approach === k ? 'is-on' : ''}" data-action="approach" data-id="${k}" aria-pressed="${V.plan.approach === k}">
            <strong>${esc(a.name)}</strong><span>${esc(a.desc)}</span>
          </button>`).join('')}
      </div>
      </div>

      <div class="plangrid__crew">
      <h2>Squad</h2>
      ${(() => { const r = crewSizeRead(V.plan.crew.length, t.crewSize); return `<p class="sizebadge sizebadge--${r.level} ${r.penalty >= 2 ? 'is-severe' : ''}">${esc(r.text)}</p>`; })()}
      ${renderBoard(boardUi, { plan: V.plan, tpl: t, people, crewSize: t.crewSize, approachName: APPROACHES[V.plan.approach].name, flash: riskMoved })}
      ${jossLine ? `<p class="jossline"><b>${esc(NAMES.partner)}:</b> ${esc(jossLine)}</p>` : ''}
      <p class="muted small">Tap a card to pick who goes. <button class="infobtn" data-action="board-rules" aria-expanded="${V.boardRulesOpen}" aria-label="How the squad works">${V.boardRulesOpen ? '×' : 'i'}</button></p>
      ${V.boardRulesOpen ? `<p class="muted small">Each person short of ${t.crewSize}: −1 on every roll. A second person within 3 of whoever rolls backs them up: +1.${freelancers.length ? ` Freelancers (up to ${MAX_FREELANCERS_PER_JOB}) take a share of the pay instead of a wage.` : ''}</p>` : ''}
      ${renderMentoring(picked)}
      </div>

      <div class="plangrid__risk">
      ${cov.fight2 ? renderFightPlan(esc, cov.fight2, ['cautious', 'steady', 'committed'].includes(V.plan.orders) ? V.plan.orders : 'steady') : ''}
      ${renderMeet(cov, owOp, was)}
      </div>

      <div class="plangrid__orders">
      ${renderCallIns(t, v.days)}
      </div>
      </div>
    </section>

    ${V.pickSlot ? renderPicker(boardUi, { plan: V.plan, tpl: t, threat: v.threat, slot: V.pickSlot, people: pickerPeople(), freelancersFull: freelancersFull(), fit: pickerFit(t, v.threat), sortBy: V.pickSort, jossId: jossFor(V.pickSlot), overRead: V.pickSlot === 'over' ? overReadFor() : null }) : ''}`;
}
const boardUi = { esc, face: (op, size) => face(op, size), riskBadge: (l) => riskBadge(l), riskWord, statusChip: (a) => statusChip(a), keyStats: (op, tpl, threat) => keyStatsFor(op, tpl, threat) };

/**
 * The picker's read of the job (2026-11-06): each key stat with how it measures up to the job's
 * typical roll (as keyStatsFor colours it), and "want", the lowest value that reads low risk.
 */
function pickerFit(tpl, threat) {
  const target = rollTarget({ ...tpl, threat });
  const fitOf = (v) => ({ low: 'good', moderate: 'shaky', high: 'weak', extreme: 'weak' }[riskLabel(successChance(v, target))]);
  let want = 1;
  while (want < 30 && fitOf(want) !== 'good') want += 1;
  return {
    want,
    stats: (op) => tpl.keyStats.map((k) => { const value = ratedStat(op, k); return { key: k, name: statName(k), value, fit: fitOf(value), mark: traitMods(op)[k] ? '*' : '' }; }),
  };
}

/** Who Joss would put in a slot: from his picks for the whole squad, the one not placed yet (core/squad.js leanPicks). */
/** For the overwatch picker: what each candidate would do to the plan's read (core/squad.js planRead). */
function overReadFor() {
  const job = state.jobs.find((j) => j.id === V.plan?.jobId);
  if (!job) return null;
  const ORDER = ['low', 'moderate', 'high', 'extreme'];
  const crew = V.plan.crew.map((id) => [...state.crew, ...(state.freelancers ?? []).map(freelancerAsCrew)].find((o) => o.id === id)).filter(Boolean);
  const wheels = state.crew.find((o) => o.id === V.plan.wheels) ?? null;
  const read = (overwatch, kit) => planRead(state, job, { crew, approach: V.plan.approach, overwatch, kit, wheels }).level;
  const baseLevel = read(null, null);
  const memo = new Map();
  return (op) => {
    if (!memo.has(op.id)) {
      const kit = kitsFor(op).includes(V.plan.kit) ? V.plan.kit : kitsFor(op)[0] ?? null;
      const level = kit ? read(op, kit) : baseLevel;
      memo.set(op.id, { level, rank: ORDER.indexOf(level), baseLevel, baseRank: ORDER.indexOf(baseLevel) });
    }
    return memo.get(op.id);
  };
}

function jossFor(slot) {
  const job = state.jobs.find((j) => j.id === V.plan?.jobId);
  if (!job) return null;
  const p = leanPicks(state, job, V.plan.approach);
  const out = { over: p.overwatch, wheels: p.wheels, standby: p.standby };
  if (slot in out) return out[slot] ?? null;
  return p.crew.find((id) => !V.plan.crew.includes(id)) ?? null;
}

/** Everyone the picker can offer: the crew with their availability, and freelancers with their cut. */
function pickerPeople() {
  return [
    ...state.crew.map((op) => ({ op, status: availability(state, op), freelance: null })),
    ...(state.freelancers ?? []).map((f) => ({ op: freelancerAsCrew(f), status: { ok: true, reason: 'ready' }, freelance: { share: shareOf(f) } })),
  ];
}

/** Freelancers are capped per job; the slot being changed doesn't count if it already holds one. */
function freelancersFull() {
  const isF = (id) => (state.freelancers ?? []).some((f) => f.id === id);
  const here = V.pickSlot?.startsWith('in:') ? V.plan.crew[Number(V.pickSlot.split(':')[1])] : null;
  return V.plan.crew.filter((id) => isF(id) && id !== here).length >= MAX_FREELANCERS_PER_JOB;
}

/**
 * The orders as two chip rows under Send (playtest, 2026-11-07: there's room in the left column).
 * Only shown where the plan bar stands beside the plan (styles.css, 1400px+); the Orders fold in the
 * plan stays for phones and for the longer descriptions.
 */
function planOrdersQuick(t) {
  if (!handsOffAllowed(t) && V.plan.mode === 'live') return '';
  const orders = ORDERS[V.plan.orders] ? V.plan.orders : 'steady';
  const callIn = CALL_IN[V.plan.callIn] ? V.plan.callIn : 'risky';
  const row = (label, list, on, action) => `<div class="qorders__row"><span>${esc(label)}</span><div class="qorders__chips">${Object.entries(list).map(([k, o]) =>
    `<button class="qchip ${on === k ? 'is-on' : ''}" data-action="${action}" data-id="${k}" aria-pressed="${on === k}">${esc(o.name.replace("When it's risky", 'When risky'))}</button>`).join('')}</div></div>`;
  return `<div class="qorders">${row('Call me in', CALL_IN, callIn, 'callin')}${callIn === 'every' ? '' : row('On their own', ORDERS, orders, 'orders')}</div>`;
}

/** On a heist job's plan: what this prep gives the finale, or what the finale has from its prep. */
function heistPlanLine(job) {
  const hz = heistFor(state, job.id);
  if (!hz) return '';
  const { def, h, step } = hz;
  if (step) {
    const again = h.steps[step.id].tries <= HEIST_RULES.retries;
    return `<p class="openingline heistline small"><strong>Prep for ${esc(def.name)}:</strong> ${esc(asSentence(step.line))} Finish it, and the finale's plan shows “${esc(step.shows)}”. Walk away and ${again ? `${esc(clientById(def.contact)?.name ?? 'they')} finds another job for it, once` : 'it can be bought from a fixer, or done without'}.</p>`;
  }
  const done = heistEffects(def, h).lines.length;
  return `<div class="openingline heistline small">
      <p><strong>${esc(def.name)}, the finale:</strong> ${done} of ${def.prep.length} prepared. Finish it and the heist is done; walk away and it's over.</p>
      <ul class="heistline__fx">${def.prep.map((p) => { const ok = ['done', 'bought'].includes(h.steps[p.id]?.status); return `<li class="${ok ? 'is-on' : 'is-off'}"><span aria-hidden="true">${ok ? '✓' : '✗'}</span> ${esc(p.shows)}${ok ? '' : ' (not prepared)'}</li>`; }).join('')}</ul>
    </div>`;
}

/** The plan's coverage read under a heading that folds it away (owner, 2026-10-29: useful but
 *  not essential, and long on a phone). Folded by default on phones, open on wider screens; the
 *  choice holds for the session. Folded, the heading still flags any gap nobody can cover. */
function renderMeet(cov, owOp, was = null) {
  if (V.meetHidden === null) V.meetHidden = !matchMedia('(min-width: 900px)').matches;
  const gaps = cov.rows.filter((r) => r.gap).length;
  // Folded, the heading still says how many encounters changed with the last change to the plan.
  const moved = was ? cov.rows.filter((r) => was.rows.has(was.key(r)) && was.rows.get(was.key(r)) !== r.effective).length : 0;
  const peek = V.meetHidden && (gaps || moved) ? `<span class="foldh2__peek">${[gaps ? `${gaps} ${gaps === 1 ? 'gap' : 'gaps'}` : '', moved ? `${moved} changed` : ''].filter(Boolean).join(' · ')}</span>` : '';
  return `<h2 id="risk-read" class="foldh2"><button class="foldh2__btn" data-action="toggle-meet" aria-expanded="${!V.meetHidden}" aria-controls="meet-read">
        <span>What they'll likely meet</span>${peek}<span class="foldh2__line" aria-hidden="true"></span><span class="foldh2__arrow" aria-hidden="true">▾</span></button></h2>
      <div id="meet-read" ${V.meetHidden ? 'hidden' : ''}>${V.meetHidden ? '' : renderCoverage(boardUi, cov, { overwatch: owOp, approachName: APPROACHES[V.plan.approach].name, standby: state.crew.find((o) => o.id === V.plan.standby) ?? null, was })}</div>`;
}
