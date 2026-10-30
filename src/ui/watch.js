// The watch screen (PLAN-CORE-LOOP.md, slice 2): the run plays out on its own, one step at a
// time on a timer (core/autorun.js autoStep), as a feed of cards with headlines over a site plan
// (ui/siteplan.js). It stops when the crew calls you in (needsPlayer); the call-in card sits in
// the feed. Pause holds the clock; Faster speeds it up.
//
// app.js re-renders the whole page on every change, which would restart every animation, so
// while a job runs it hands the new state to syncWatch instead: new feed items are appended,
// the rest of the page stays put.
//
// Wide screens put the map and the feed side by side, the feed scrolling in its own column; on
// phones the feed runs under the map. Either way the feed only follows new moments while you're
// at its bottom; scroll up to read and it stays put, with a "↓ N new" button (owner, 2026-10-28).

import { feedItems } from '../core/feed.js';
import { needsPlayer } from '../core/autorun.js';
import { ALERT_MAX, OVERWATCH_KIT, ZONES } from '../core/incidents.js';
import { sitePlanSvg, bindSitePlan, siteFor } from './siteplan.js';
import { templateById } from '../core/jobs.js';
import { guardPosts } from '../core/battle.js';

const FAST = 0.35;
// How long each kind of moment stays before the next step (ms at normal speed): routine moments
// pass quickly, failures and saves linger, call-ins wait for you.
const PACE = { phase: 1000, beat: 2000, note: 1300, card: 1300, result: 1000, bad: 700 };

let live = null; // { key, el, plan, shown, timer, chain, onAuto, ui, callKey, unseen }
let paused = false;
let speed = 1;

const opsOf = (state, ids) => ids.map((id) => state.crew.find((o) => o.id === id) ?? state.memorial?.find((o) => o.id === id)).filter(Boolean);

/** The live header, the feed and the controls. Done jobs show the same feed, still. */
export function renderWatch(ui, state) {
  const am = state.activeMission;
  const done = !!am.done;
  return `
    <div class="watch ${done ? 'is-done' : ''}" data-mission="${ui.esc(am.jobId)}">
      <div class="watch__live">
        <div class="watch__map">${sitePlanSvg({ kit: am.overwatch?.kit ?? null, site: siteFor(templateById(am.templateId)?.district, am.jobId, am.templateId) })}
          <span class="watch__phase" aria-live="polite"></span>
          <span class="watch__alert" role="img"></span>
        </div>
        <div class="watch__tally"></div>
      </div>
      <div class="watch__side">
        <div class="watch__feed" aria-live="polite"></div>
        <div class="watch__callin"></div>
        <button class="btn watch__new" data-action="watch-latest" hidden></button>
      </div>
      ${done ? '' : `
      <div class="watch__bar">
        <button class="btn btn--ghost watch__btn" data-action="watch-pause" aria-pressed="${paused}">${paused ? 'Resume' : 'Pause'}</button>
        <button class="btn btn--ghost watch__btn" data-action="watch-speed" aria-pressed="${speed !== 1}">${speed === 1 ? 'Faster' : 'Normal speed'}</button>
        <button class="btn btn--ghost watch__btn" data-action="step" ${paused ? '' : 'hidden'}>Next</button>
      </div>`}
    </div>`;
}

/** Is this page already showing this job's watch? Then app.js syncs instead of re-rendering. */
export const isWatching = (root, am) => !!live && !am.done && live.key === am.jobId && root.contains(live.el);

/** Stop the clock (the job ended, or the page changed). */
export function stopWatch() {
  if (live?.timer) clearTimeout(live.timer);
  live = null;
}

/**
 * Bind a freshly drawn watch (renderWatch) to the state: draw the plan and what has happened so
 * far without animation, then carry on. onAuto: take the next step (app.js: setState(autoStep)).
 */
export function mountWatch(el, state, { onAuto, ui }) {
  if (!el) return;
  const am = state.activeMission;
  const out = am.out ?? [];
  const team = opsOf(state, am.crewIds.filter((id) => !out.includes(id)));
  const ow = am.overwatch ? { op: state.crew.find((o) => o.id === am.overwatch.id), kit: am.overwatch.kit } : null;
  const plan = bindSitePlan(el.querySelector('.siteplan'), {
    team, overwatch: ow?.op ? ow : null, zone: am.done ? 'full' : am.zone ?? 'start', speed: () => speed, site: siteFor(templateById(am.templateId)?.district, am.jobId, am.templateId),
    wheels: am.wheels ? opsOf(state, [am.wheels])[0] : null,
    standby: am.standby && !am.standby.joined ? opsOf(state, [am.standby.id])[0] : null,
    out: opsOf(state, out),
  });
  live = { key: am.jobId, el, plan, shown: 0, timer: null, chain: Promise.resolve(), onAuto, ui, callKey: null, unseen: 0 };
  // Reaching the bottom by hand clears the "new" button.
  const seen = () => { if (live?.el === el && atBottom(el)) markSeen(); };
  el.querySelector('.watch__side').addEventListener('scroll', seen, { passive: true });
  window.addEventListener('scroll', seen, { passive: true });
  // The plan sticks just under the top bar (its height changes with the screen width).
  el.style.setProperty('--live-top', `${document.querySelector('.topbar')?.offsetHeight ?? 0}px`);
  if (am.done) plan.full();
  if (am.battle) plan.syncFight(am.battle); // a page opened mid-fight draws it as it stands
  sync(state, { animate: false });
}

/** A new state for the job on screen: append what's new and schedule the next step. */
export function syncWatch(state) {
  if (live) sync(state, { animate: true });
}

export function togglePause(state) {
  paused = !paused;
  const b = live?.el.querySelector('[data-action="watch-pause"]');
  if (b) { b.textContent = paused ? 'Resume' : 'Pause'; b.setAttribute('aria-pressed', String(paused)); }
  live?.el.querySelector('.watch__bar [data-action="step"]')?.toggleAttribute('hidden', !paused);
  if (live) schedule(state, PACE.result);
}

export function toggleSpeed(state) {
  speed = speed === 1 ? FAST : 1;
  const b = live?.el.querySelector('[data-action="watch-speed"]');
  if (b) { b.textContent = speed === 1 ? 'Faster' : 'Normal speed'; b.setAttribute('aria-pressed', String(speed !== 1)); }
  live?.el.style.setProperty('--speed', speed);
  if (live) schedule(state, PACE.result);
}

/** Where the feed scrolls: its own column on wide screens, else the page. */
function scroller(el) {
  const side = el.querySelector('.watch__side');
  return side && getComputedStyle(side).overflowY === 'auto' ? side : null;
}

/** Is the reader at the bottom of the feed (give or take a line)? */
function atBottom(el) {
  const box = scroller(el);
  if (box) return box.scrollHeight - box.scrollTop - box.clientHeight < 48;
  const bar = el.querySelector('.watch__bar')?.offsetHeight ?? 0;
  const feed = el.querySelector('.watch__side').getBoundingClientRect();
  return feed.bottom <= window.innerHeight - bar + 48;
}

/** Take the reader to the newest moment and clear the "new" button. */
export function showLatest() {
  if (!live) return;
  const last = live.el.querySelector('.watch__feed').lastElementChild;
  last?.scrollIntoView?.({ block: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  markSeen();
}

function markSeen() {
  live.unseen = 0;
  const b = live.el.querySelector('.watch__new');
  if (b) b.hidden = true;
}

function sync(state, { animate }) {
  const am = state.activeMission;
  const { el, ui } = live;
  // Follow only if they were already watching the newest moment (or this is the first draw).
  const follow = !animate || atBottom(el);
  el.style.setProperty('--speed', speed);
  const items = feedItems(am.events ?? [], { kit: am.overwatch?.kit ?? null });
  const fresh = items.slice(live.shown);
  live.shown = items.length;
  const feed = el.querySelector('.watch__feed');
  // Before the first step: the brief, until the run starts.
  if (!items.length) { if (!feed.childElementCount) feed.innerHTML = `<p class="wf-brief">${ui.esc(ui.brief(state))}</p>`; }
  else feed.querySelector('.wf-brief')?.remove();
  let wait = 0;
  for (const item of fresh) {
    const node = document.createElement('div');
    node.innerHTML = itemHtml(ui, item, animate);
    const child = node.firstElementChild;
    feed.append(child);
    wait += paceOf(item);
    if (animate) {
      const plan = live.plan;
      const cue = item.cue?.standby ? { ...item.cue, standbyOp: opsOf(state, [item.cue.standby])[0] } : item.cue;
      live.chain = live.chain.then(() => (item.type === 'phase' ? plan.enter(item.zone) : item.type === 'card' || (item.type === 'note' && item.cue) ? plan.play(cue) : null)).catch(() => {});
    }
  }
  for (const e of am.events ?? []) if (e.injury) live.plan.hurt(e.injury.id, e.injury.severity);
  live.plan.posts(guardPosts(am)); // the guards still ahead, on their posts
  if (fresh.length && follow) feed.lastElementChild?.scrollIntoView?.({ block: 'nearest', behavior: animate && speed === 1 && !matchMedia('(prefers-reduced-motion: reduce)').matches ? 'smooth' : 'auto' });
  else if (fresh.length) {
    live.unseen += fresh.length;
    const b = el.querySelector('.watch__new');
    b.textContent = `↓ ${live.unseen} new`;
    b.setAttribute('aria-label', `${live.unseen} new ${live.unseen === 1 ? 'moment' : 'moments'}: show the latest`);
    b.hidden = false;
  }
  tally(state);
  callIn(state);
  schedule(state, wait || PACE.result);
}

function paceOf(item) {
  if (item.type !== 'card') return PACE[item.type] ?? PACE.note;
  return PACE.card + item.results.length * PACE.result + (item.results.some((r) => r.tone === 'bad') ? PACE.bad : 0);
}

function schedule(state, ms) {
  if (live.timer) clearTimeout(live.timer);
  live.timer = null;
  const am = state.activeMission;
  if (paused || !am || am.done || needsPlayer(state)) return;
  const { onAuto } = live;
  live.timer = setTimeout(() => { if (live) { live.timer = null; onAuto(); } }, ms * speed);
}

function tally(state) {
  const am = state.activeMission;
  const { el, ui } = live;
  const alert = am.alert ?? 0;
  const pips = el.querySelector('.watch__alert');
  pips.innerHTML = `Alert ${Array.from({ length: ALERT_MAX }, (_, i) => `<i class="${i < alert ? 'is-on' : ''}"></i>`).join('')}`;
  pips.setAttribute('aria-label', `Alert ${alert} of ${ALERT_MAX}${am.wentLoud ? ', gone loud' : ''}`);
  el.querySelector('.watch__phase').textContent = am.wentLoud ? 'Gone loud' : ZONES[am.zone]?.name ?? 'Getting there';
  const events = am.events ?? [];
  const saves = events.filter((e) => e.kind === 'save' && e.success && e.via !== 'patch').length;
  const hurt = new Set(events.filter((e) => e.injury).map((e) => e.injury.id)).size;
  const kit = am.overwatch ? OVERWATCH_KIT[am.overwatch.kit] : null;
  el.querySelector('.watch__tally').innerHTML = `
    <span class="${saves ? 'is-good' : ''}">Saves ${saves}</span>
    <span class="${hurt ? 'is-bad' : ''}">Hurt ${hurt}</span>
    ${am.extraHeat ? `<span class="is-bad">Heat +${am.extraHeat}</span>` : ''}
    ${am.battle ? `<span class="is-bad">Guards ${am.battle.guards.filter((g) => !g.out).length} up</span>` : ''}
    ${kit ? `<span>${ui.esc(kit.name)} ${'●'.repeat(Math.max(0, am.overwatch.left))}${'○'.repeat(Math.max(0, kit.uses - am.overwatch.left))}</span>` : ''}`;
}

/** The call-in card, in the feed, when the crew needs you. Redrawn only when the question changes. */
function callIn(state) {
  const { el, ui } = live;
  const slot = el.querySelector('.watch__callin');
  const html = state.activeMission.done ? '' : ui.callIn(state);
  if (html === live.callKey) return;
  live.callKey = html;
  slot.innerHTML = html;
  // While you're called in, the decision gets the screen: the plan scrolls with the page and the clock controls go.
  el.classList.toggle('is-calling', !!html);
  const first = slot.querySelector('button:not([disabled])');
  if (first) {
    first.focus({ preventScroll: true });
    slot.scrollIntoView?.({ block: 'start' });
  }
}

/** Everyone's health after a round, in the card's summary: the crew's, then the guards still up. */
function fightChips(esc, { runners = [], guards = [] }) {
  const up = guards.filter((g) => !g.out);
  return `<span class="wf-hp" aria-label="Health after the round">${runners.map((r) => `<span class="wf-chip ${r.down ? 'is-down' : r.hp < r.max * 0.25 ? 'is-crit' : r.hp < r.max * 0.5 ? 'is-low' : ''}">${esc(r.handle)} ${r.down ? 'down' : `${r.hp}/${r.max}`}</span>`).join('')}${up.map((g) => `<span class="wf-chip wf-chip--guard">Guard ${g.n} ${g.hp}/${g.max}</span>`).join('')}</span>`;
}

const TONE = { good: 'good', bad: 'bad', save: 'save', warn: 'warn' };
const ICON = { good: '✓', bad: '✗', save: '★', warn: '↩' };

function itemHtml(ui, item, animate) {
  const { esc } = ui;
  const n = animate ? 'is-new' : '';
  if (item.type === 'phase') return `<h3 class="wf-phase ${n}">${esc(item.title)}</h3>`;
  if (item.type === 'beat') return `<p class="wf-beat ${n}">${esc(item.text)}</p>`;
  if (item.type === 'note') return `<p class="wf-note tone--${TONE[item.tone] ?? 'plain'} ${n}">${esc(item.text)}</p>`;
  // One line per moment: an icon and the headlines, so the run can be followed at a glance; tap
  // the line for the setup, the crew's reason, the detail and the dice (owner's feedback,
  // 2026-10-27: too much text; the reason and the detail lines weren't needed as it plays).
  const last = item.results.at(-1)?.tone;
  const icon = (t) => ICON[t] ?? '·';
  const why = item.kind !== 'incident' ? item.results.find((r) => r.why)?.why : null;
  return `
    <details class="wf-line wf-line--${esc(item.kind)} wf-line--${TONE[last] ?? 'plain'} ${n}">
      <summary>
        <span class="wf-kind">${esc(item.label)}</span>
        <span class="wf-hls">${item.results.map((r, i) => `<span class="wf-hl wf-hl--${TONE[r.tone] ?? 'plain'}" style="--d:${i}">${icon(r.tone)} ${esc(r.headline)}</span>`).join('')}</span>
        ${item.hp ? fightChips(esc, item.hp) : ''}
      </summary>
      <div class="wf-more">
        ${item.setup ? `<p class="wf-setup">${esc(item.setup)}</p>` : ''}
        ${why ? `<p class="wf-why">Crew's call: ${esc(why)}</p>` : ''}
        ${item.results.map((r) => `
        <div class="wf-res">
          ${r.detail ? `<p class="wf-det">${esc(r.detail)}</p>` : ''}
          ${r.roll ? ui.dice(r.roll) : ''}
        </div>`).join('')}
      </div>
    </details>`;
}
