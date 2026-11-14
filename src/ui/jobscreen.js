// A job in progress: the watch screen's frame, call-ins, the finale, the direct buzz.
import { heistEffects } from '../core/heists.js';
import { heistById } from '../data/heists.js';
import { crewLead } from '../core/lead.js';
import { NAMES } from '../config/names.js';
import { portrait } from './art.js';
import { templateById } from '../core/jobs.js';
import { clientById } from '../core/clients.js';
import { APPROACHES } from '../core/crew.js';
import { money } from '../core/money.js';
import { CALL_IN, describeCritical, describePending, currentStep, describeCrisis, fillBrief } from '../core/mission.js';
import { renderFightOrders } from './fightorders.js';
import { renderFightCallIn, renderFightRound } from './fightscreen.js';
import { ORDERS, handsOffAllowed, needsPlayer } from '../core/autorun.js';
import { dayDone } from '../core/away.js';
import { OVERWATCH_KIT } from '../core/incidents.js';
import { renderWatch } from './watch.js';
import { GRADUATION_LINES, GROWTH_LINES } from '../data/growthLines.js';
import { esc, riskBadge, face, pickLine, statName } from './shared.js';
import { state, buzzLater, V } from './view.js';

/** When the crew calls you in, and how they decide when they don't (core/autorun.js ORDERS). */
export function renderCallIns(t, days = t.days) {
  const orders = ORDERS[V.plan.orders] ? V.plan.orders : 'steady';
  const callIn = CALL_IN[V.plan.callIn] ? V.plan.callIn : 'risky';
  const lead = crewLead(V.plan.crew.map((id) => state.crew.find((o) => o.id === id)));
  const canSend = handsOffAllowed(t);
  const mode = canSend && V.plan.mode !== 'live' ? 'away' : 'live';
  const modes = { away: ['Send them', `They go and do it over ${days === 1 ? 'the day' : `${days} days`}. Today shows what they did; they call when it's beyond their orders.`], live: ['Watch live', 'You watch the whole job now, on the map.'] };
  // Folded to one line until tapped (2026-11-05): most players set these once and leave them.
  const summary = [canSend ? modes[mode][0] : 'Watch live (this one can\'t be sent off)', `call me in: ${CALL_IN[callIn].name.toLowerCase()}`, callIn === 'every' ? '' : `${ORDERS[orders].name.toLowerCase()} on their own`].filter(Boolean).join(' · ');
  const head = `<h2 class="foldh2"><button class="foldh2__btn" data-action="toggle-orders" aria-expanded="${V.ordersOpen}" aria-controls="plan-orders">
        <span>Orders</span><span class="foldh2__line" aria-hidden="true"></span><span class="foldh2__arrow" aria-hidden="true">▾</span></button></h2>`;
  if (!V.ordersOpen) {
    return `${head}
      <button class="orderline" data-action="toggle-orders" aria-expanded="false">${esc(summary)} <b>Change</b></button>
      ${lead && callIn === 'risky' ? `<p class="lead small"><strong>${esc(lead.handle)} leads</strong> (${esc(lead.fame)}): they take one risky call themselves before calling you.</p>` : ''}`;
  }
  return `${head}
      <div id="plan-orders">
      <h3 class="orders__h">How</h3>
      ${canSend ? `<div class="segmented">
        ${Object.entries(modes).map(([k, [name, desc]]) => `
          <button class="seg ${mode === k ? 'is-on' : ''}" data-action="mode" data-id="${k}" aria-pressed="${mode === k}"><strong>${esc(name)}</strong><span>${esc(desc)}</span></button>`).join('')}
      </div>` : '<p class="muted small">This job can\'t be sent off on its own: you\'ll watch this one.</p>'}
      <h3 class="orders__h">Call me in…</h3>
      <div class="segmented">
        ${Object.entries(CALL_IN).map(([k, c]) => `
          <button class="seg ${callIn === k ? 'is-on' : ''}" data-action="callin" data-id="${k}" aria-pressed="${callIn === k}"><strong>${esc(c.name)}</strong><span>${esc(c.desc)}</span></button>`).join('')}
      </div>
      ${lead && callIn === 'risky' ? `<p class="lead small"><strong>${esc(lead.handle)} leads</strong> (${esc(lead.fame)}): they take one risky call themselves before calling you.</p>` : ''}
      ${callIn === 'every' ? '' : `
      <h3 class="orders__h">When they decide themselves</h3>
      <p class="muted small">Their orders decide each call they don't bring to you. They never push on with a critical wound: at worst, they pull out.</p>
      <div class="segmented">
        ${Object.entries(ORDERS).map(([k, o]) => `
          <button class="seg ${orders === k ? 'is-on' : ''}" data-action="orders" data-id="${k}" aria-pressed="${orders === k}">
            <strong>${esc(o.name)}</strong><span>${esc(o.desc)}</span>
          </button>`).join('')}
      </div>`}
      </div>`;
}

// --- mission -----------------------------------------------------------
function choiceButton(c, action) {
  return `
    <button class="choice" data-action="${action}" data-id="${esc(c.id)}" ${c.available ? '' : 'disabled'}>
      <span class="choice__label">${esc(c.label)}</span>
      ${c.available
        ? `<span class="choice__meta">${riskBadge(c.risk)} ${esc(c.riskReason ?? '')}${c.cost ? ` <span class="choice__cost">Cost: ${esc(c.cost)}</span>` : ''}</span>`
        : `<span class="choice__meta muted">${esc(c.reason)}</span>`}
    </button>`;
}

/** Level-up cards for a job report: one per operative who improved, a bigger one for graduations. */
function levelUpCards(r) {
  const growth = r.growth ?? [];
  if (growth.some((g) => typeof g === 'string')) return `<p>Improved: ${esc(growth.join(', '))}</p>`; // reports from older saves
  const opFor = (id, fallback) => state.crew.find((o) => o.id === id) ?? fallback;
  const grads = (r.graduated ?? []).map((g) => {
    const op = opFor(g.id, g);
    return `
      <div class="levelcard levelcard--grad">
        ${face(op, 'lg')}
        <div>
          <p class="levelcard__kicker">★ Graduated</p>
          <p class="levelcard__title">${esc(op.handle)}: rookie → pro</p>
          <p class="levelcard__line">${esc(pickLine(GRADUATION_LINES, op.id).replace('{name}', op.handle))}</p>
        </div>
      </div>`;
  }).join('');
  const byOp = new Map();
  for (const g of growth) byOp.set(g.opId, [...(byOp.get(g.opId) ?? []), g]);
  const cards = [...byOp].map(([id, rises]) => {
    const op = opFor(id, { id, name: rises[0].handle, handle: rises[0].handle });
    const rows = rises.map((g) => `
          <li><span class="levelcard__stat">▲ ${esc(statName(g.stat))} ${g.from} → ${g.to}</span>
          <span class="levelcard__line">${esc(pickLine(GROWTH_LINES[g.stat] ?? ['{name} is improving.'], `${id}${g.stat}${g.to}`).replace('{name}', op.handle))}</span></li>`).join('');
    return `
      <div class="levelcard">
        ${face(op)}
        <div><p class="levelcard__title">${esc(op.handle)}</p><ul class="levelcard__rows">${rows}</ul></div>
      </div>`;
  }).join('');
  return grads || cards ? `<div class="levelcards">${grads}${cards}</div>` : '';
}

export function renderMission() {
  const am = state.activeMission;
  const t = templateById(am.templateId);
  const crewNames = am.crewIds.map((id) => state.crew.find((o) => o.id === id) ?? state.memorial.find((o) => o.id === id)).filter(Boolean).map((o) => o.handle).join(', ');
  const ow = am.overwatch ? state.crew.find((o) => o.id === am.overwatch.id) : null;
  let result = '';
  if (am.done) {
    const r = am.result;
    const title = r.outcome === 'loss' ? 'Someone didn\'t come home' : r.outcome === 'aborted' ? 'Job aborted' : 'Job done';
    result = `
      <div class="resultcard resultcard--${esc(r.outcome)}">
        <h2>${esc(title)}</h2>
        <p>Paid ${money(r.pay)} · Heat +${r.heatGain}</p>
        ${r.injuries.length ? `<p>Injured: ${esc(r.injuries.join(', '))}</p>` : '<p>Nobody hurt.</p>'}
        ${r.deaths.length ? `<p><strong>Lost: ${esc(r.deaths.join(', '))}.</strong> Their names go on the wall.</p>` : ''}
        ${levelUpCards(r)}
        ${(r.freelance ?? []).map((f) => `<p class="muted">Freelancer ${esc(f.handle)} took ${money(f.cut)}.</p>`).join('')}
        ${r.client && r.trustChange ? `<p>${esc(r.client)}: trust ${r.trustChange > 0 ? '+' : ''}${r.trustChange}</p>` : ''}
        <button class="btn btn--primary btn--block" data-action="close-mission">Back to the safehouse</button>
      </div>`;
  }
  return `
    <section class="panel mission">
      <p class="muted small">${am.away ? `${am.away.command ? 'Under your command' : `Away · day ${am.away.day ?? 1} of ${am.days ?? t.days}`}` : 'On the job'} · ${esc(APPROACHES[am.approach]?.name ?? '')} approach · ${esc(crewNames)}${ow ? ` · ${esc(ow.handle)} on overwatch (${esc(OVERWATCH_KIT[am.overwatch.kit].name.toLowerCase())})` : ''}${outsider(am.wheels, 'at the wheel')}${am.standby && !am.standby.joined ? outsider(am.standby.id, 'on standby') : ''}</p>
      <h1>${esc(t.name)}</h1>
      ${renderWatch(watchUi, state, result)}
    </section>`;
}

/**
 * The end of a job as it happens (playtest, 2026-11-07: "it snaps back and just ends"): once the
 * crew are back at the van, a card over the job with the result stamped, the pay counting up and
 * the team popping in one by one, each with what the job did to them. "See the report" closes it
 * onto the summary in the feed; "Back to the safehouse" goes home.
 */
function renderFinale(s) {
  const am = s.activeMission;
  const r = am.result;
  if (!r) return '';
  const events = am.events ?? [];
  const SEV = ['light', 'serious', 'critical'];
  const ids = [...am.crewIds, am.overwatch?.id, am.wheels, am.standby?.joined ? null : am.standby?.id].filter(Boolean);
  const title = { completed: 'Job done', aborted: 'Walked away', loss: "Someone didn't come home" }[r.outcome] ?? 'Job over';
  // The result stacked in block capitals like a chop, one word group a line (2026-11-10).
  const zh = { completed: '搞掂', aborted: '收手' }[r.outcome] ?? '搞掂'; // Cantonese: sorted, hands off
  const lines = { completed: ['Job', 'Done'], aborted: ['Walked', 'Away'] }[r.outcome] ?? ['Job', 'Over'];
  // A death is never stamped (2026-11-10): that outcome gets a plain, quiet title instead of a chop.
  const heading = r.outcome === 'loss'
    ? `<h2 class="finale__title">${esc(title)}</h2>`
    : `<svg class="finale__ink" width="0" height="0" aria-hidden="true" focusable="false"><filter id="seal-ink" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="2.2" result="d"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -9 6.6" result="m"/><feComposite in="d" in2="m" operator="in"/></filter></svg>
        <h2 class="finale__stamp">${lines.map((l) => `<span class="seal__line">${esc(l)}</span> `).join('')}<span class="seal__zh" aria-hidden="true">${zh}</span></h2>`;
  const team = ids.map((id, i) => {
    const op = s.crew.find((o) => o.id === id) ?? s.memorial?.find((o) => o.id === id);
    if (!op) return '';
    const lost = !s.crew.some((o) => o.id === id);
    const hurt = events.filter((e) => e.injury?.id === id).map((e) => e.injury.severity).sort((a, b) => SEV.indexOf(b) - SEV.indexOf(a))[0];
    const left = !lost && !!op.condition?.missing && op.condition.missing.until > s.day;
    const grew = (r.growth ?? []).filter((g) => g.opId === id);
    const grad = (r.graduated ?? []).some((g) => g.id === id);
    const won = events.filter((e) => e.actor?.id === id && e.die != null && e.success === true).length;
    const tags = [
      lost ? '<span class="finale__tag is-bad">Lost</span>' : '',
      !lost && left ? '<span class="finale__tag is-bad">Left behind</span>' : '',
      !lost && hurt ? `<span class="finale__tag is-warn">${esc(hurt)} wound</span>` : '',
      grad ? '<span class="finale__tag is-star">★ Pro now</span>' : '',
      ...grew.slice(0, 2).map((g) => `<span class="finale__tag is-good">▲ ${esc(statName(g.stat))} ${g.to}</span>`),
      !lost && !left && !hurt && !grad && !grew.length ? `<span class="finale__tag">${won ? `${won} clean roll${won === 1 ? '' : 's'}` : 'Home safe'}</span>` : '',
    ].join('');
    return `<li class="finale__op ${lost ? 'is-lost' : ''}" style="--i:${i}">${face(op)}<b>${esc(op.handle)}</b>${tags}</li>`;
  }).join('');
  return `
    <div class="finale finale--${esc(r.outcome)}${r.outcome === 'loss' ? '' : ' finale--stamped'}" style="--stamp-at:${(0.5 + 0.12 * Math.max(0, ids.length - 1)).toFixed(2)}s" role="dialog" aria-modal="false" aria-label="${esc(title)}">
      <div class="finale__card">
        <p class="finale__kicker">${esc(templateById(am.templateId)?.name ?? 'The job')}</p>
        ${heading}
        <p class="finale__pay"><span data-count="${r.pay}" data-fmt="${esc(NAMES.currency)}">${esc(money(r.pay))}</span><span class="finale__heat">Heat +${r.heatGain}</span></p>
        <ul class="finale__team">${team}</ul>
        ${r.client && r.trustChange ? `<p class="finale__line">${esc(r.client)}: trust ${r.trustChange > 0 ? '+' : ''}${r.trustChange}</p>` : ''}
        <div class="finale__btns">
          <button class="btn btn--ghost" data-action="finale-close">See the report</button>
          <button class="btn btn--primary finale__go" data-action="close-mission">Back to the safehouse</button>
        </div>
      </div>
    </div>`;
}

/**
 * The direct buzz (playtest, 2026-11-07: "this just appeared one day, no context"): the day a contact
 * offers a heist, or its finale goes on, the phone rings over whatever screen you're on. Pick up, and
 * they say it in their own words with what's at stake; "We're in" opens the board, "Let me think"
 * leaves it on Today. It rings once: answering marks the message read. Not during a job or a plan.
 */
function buzzMessage() {
  if (state.activeMission || state.founding || V.plan || V.sidePlan) return null;
  return state.inbox.find((m) => m.kind === 'heist' && !m.read && !buzzLater.has(m.id) && heistById(m.payload?.heistId)) ?? null;
}

/** A contact's face for the call: their own, seeded by who they are, so it's the same every time. */
const callerFace = (def) => portrait({ id: `client-${def.contact}`, name: clientById(def.contact)?.name ?? def.contact, age: 52 }, { size: 96 });

export function renderBuzz() {
  const m = buzzMessage();
  if (!m) { V.buzzStage = null; return ''; }
  const def = heistById(m.payload.heistId);
  const who = clientById(def.contact)?.name ?? 'A contact';
  const finale = !!m.payload.jobId;
  if (V.buzzStage !== 'open') {
    return `
    <div class="buzz" role="alertdialog" aria-modal="true" aria-label="Direct buzz from ${esc(who)}">
      <div class="buzz__ring">
        <p class="buzz__kicker">Direct buzz</p>
        <span class="buzz__face">${callerFace(def)}</span>
        <h2 class="buzz__who">${esc(who)}</h2>
        <p class="buzz__joss"><b>${esc(NAMES.partner)}:</b> ${esc(finale ? `${who} again, on the direct line. It's tonight's business.` : `${who}, on the direct line. That line only rings for the big ones.`)}</p>
        <button class="btn btn--primary btn--block buzz__pick" data-action="buzz-pickup">Pick up</button>
        <button class="btn btn--ghost" data-action="buzz-later" data-id="${esc(m.id)}">Let it ring</button>
      </div>
    </div>`;
  }
  const h = state.heists?.[def.id];
  const prepared = h ? heistEffects(def, h).lines.length : 0;
  const quote = finale ? def.finaleLine : def.intro;
  const stakes = finale
    ? `<p class="buzz__stake"><b>${esc(def.name)}</b> · the finale is on the board until Sunday</p>
       <p class="buzz__stake">${prepared ? `Prepared: ${prepared} of ${def.prep.length}.` : 'Nothing was prepared: it will be the hard way.'}</p>`
    : `<p class="buzz__stake"><b>${esc(def.name)}</b> · the finale in ${def.weeks} weeks · pays about ${money(def.pay)}</p>
       <ol class="buzz__prep">${def.prep.map((p) => `<li>${esc(p.line)}</li>`).join('')}</ol>
       <p class="buzz__note">Three prep jobs go on the board. Each one you finish makes the night easier; you can go without them.</p>`;
  return `
    <div class="buzz" role="dialog" aria-modal="true" aria-label="${esc(who)}: ${esc(def.name)}">
      <div class="buzz__call">
        <div class="buzz__head"><span class="buzz__face buzz__face--sm">${callerFace(def)}</span><div><p class="buzz__kicker">On the line</p><h2 class="buzz__who">${esc(who)}</h2></div></div>
        <p class="buzz__quote">${esc(quote)}</p>
        <div class="buzz__stakes">${stakes}</div>
        <div class="buzz__btns">
          <button class="btn btn--ghost" data-action="buzz-think" data-id="${esc(m.id)}">${finale ? 'Later' : 'Let me think'}</button>
          <button class="btn btn--primary" data-action="buzz-in" data-id="${esc(m.id)}">${finale ? 'Open the board' : "We're in"}</button>
        </div>
      </div>
    </div>`;
}

/** " · Hotwire at the wheel" for someone outside the inside team, or nothing. */
const outsider = (id, what) => { const op = id ? state.crew.find((o) => o.id === id) : null; return op ? ` · ${esc(op.handle)} ${what}` : ''; };

/** The card for whatever the crew is calling you in for, if anything (shown inline in the watch feed). */
/** Everyone's health at a fight's call-in: the crew, then the guards still up. */
function fightHealth({ runners, guards }) {
  const chip = (cls, text) => `<span class="wf-chip ${cls}">${esc(text)}</span>`;
  return `<p class="wf-hp wf-hp--callin" aria-label="Health">${runners.map((r) => chip(r.down ? 'is-down' : r.hp < r.max * 0.25 ? 'is-crit' : r.hp < r.max * 0.5 ? 'is-low' : '', `${r.handle} ${r.down ? 'down' : `${r.hp}/${r.max}`}`)).join('')}${guards.filter((g) => !g.out).map((g) => chip('wf-chip--guard', `Guard ${g.n} ${g.hp}/${g.max}`)).join('')}</p>`;
}

function renderCallIn(s) {
  const am = s.activeMission;
  if (dayDone(am)) {
    const days = am.days ?? templateById(am.templateId).days;
    return `
      <div class="crisis" data-callin="day-done">
        <p class="crisis__title">That's day ${am.away.day ?? 1} of ${days} done</p>
        <p>They'll pick it up again tomorrow, and call if they need us. Or stay on the line with them and play the rest now.</p>
        <div class="stack">
          <button class="btn btn--primary" data-action="let-run">Let them carry on</button>
          <button class="btn btn--ghost" data-action="take-command">Take command: play the rest now</button>
        </div>
      </div>`;
  }
  if (am.critical) {
    const v = describeCritical(s);
    return `
      <div class="crisis crisis--critical">
        <p class="crisis__title">${esc(v.op.handle)} is critical</p>
        <p>${v.stabiliseFailed ? 'Stabilising failed. You have to decide now.' : `${esc(v.op.name)} is bleeding out. What do you do?`}</p>
        <div class="choices">${v.choices.map((c) => choiceButton(c, 'critical')).join('')}</div>
      </div>`;
  }
  if (am.pending && am.battle?.engine === 2 && ['dilemma', 'door'].includes(am.pending.kind)) return renderFightCallIn(s, esc, (id) => { const op = s.crew.find((o) => o.id === id); return op ? face(op, 'sm') : ''; });
  if (am.pending) {
    const v = describePending(s);
    return `
      <div class="crisis">
        <p class="crisis__title">${v.kind === 'alert' ? 'The crew is calling in: you\'ve been spotted' : v.kind === 'door' ? 'The crew is calling in: someone is at death\'s door' : v.kind === 'standoff' ? 'The crew is calling in: the guards are still standing' : 'The crew is calling in: someone is down'}</p>
        <p>${esc(v.text)}</p>
        ${v.fight ? fightHealth(v.fight) : ''}
        <div class="choices">${v.choices.map((c) => choiceButton({ ...c, risk: c.exit ? 'safe' : c.push ? 'extreme' : 'moderate', riskReason: c.cost, cost: '' }, 'pending')).join('')}</div>
      </div>`;
  }
  if (am.battle?.engine === 2 && currentStep(am)?.type === 'battle' && needsPlayer(s)) return renderFightRound(s, esc, (id) => { const op = s.crew.find((o) => o.id === id); return op ? face(op, 'sm') : ''; });
  if (am.battle && currentStep(am)?.type === 'battle' && needsPlayer(s)) return renderFightOrders(s, esc, (id) => { const op = s.crew.find((o) => o.id === id); return op ? face(op, 'sm') : ''; });
  if (currentStep(am)?.type === 'crisis' && needsPlayer(s)) {
    const v = describeCrisis(s);
    return `
      <div class="crisis">
        <p class="crisis__title">The crew is calling in</p>
        <p>${esc(v.text)}</p>
        <div class="choices">${v.choices.map((c) => choiceButton(c, 'choose')).join('')}</div>
      </div>`;
  }
  return '';
}

/** What the watch screen borrows from here (ui/watch.js). */
export const watchUi = {
  esc,
  finale: (s) => renderFinale(s),
  callIn: (s) => renderCallIn(s),
  brief: (s) => fillBrief(templateById(s.activeMission.templateId)),
  dice: (r) => `
        <details class="flog__roll">
          <summary>Dice</summary>
          <p class="small">Die ${r.die} + ${esc(r.stat)} ${r.value} = ${r.die + r.value} · needed ${r.need}${r.notes?.length ? `<br><span class="muted">${esc(r.stat)} ${r.value}: ${esc(r.notes.join(', '))}</span>` : ''}</p>
        </details>`,
};
