// The other tongs on screen (C1b; DESIGN.md 2026-11-08 "No league"): City › Tongs, a tong's page, a name's
// read-only profile and Names on the street, plus The Word's lines for Monday's briefing. Recruiting a name
// (scouting, what it would take, Sign) is on Crew › Leads (renderLeadName, leadNames; navigation rework 2026-11-09). Reads `rivalView`
// only: word keys in, wording from data/rivals.js out. No numbers, no order beyond tier.
import { rivalView } from '../core/rivals.js';
import { bookView, bookGrade } from '../core/book.js';
import { readFor, approachFor, findCard, scoutLevel } from '../core/dossier.js';
import { availability } from '../core/crew.js';
import { dossierOf } from '../core/dossier.js';
import { portrait } from './art.js';
import { money } from '../core/money.js';
import { TONG_RANKS } from '../data/tong.js';
import { NAMES } from '../config/names.js';
import { BOOK_TEXT, RATING_WORDS, FAME_LINE, STYLE_TEXT, ELDER_LINE, POTENTIAL_TEXT, SCOUT_LEVEL_TEXT, SIGN_REASON, fill, wordLine } from '../data/rivals.js';

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const tierName = (id) => TONG_RANKS.find((r) => r.id === id)?.name ?? id;
const inText = (d) => NAMES.districtsInText?.[d] ?? NAMES.districts?.[d] ?? d ?? '';
const place = (d) => NAMES.districts?.[d] ?? d ?? '';

/** A view entry as a line of talk: district and tier ids turned into words first. */
export function wordText(entry) {
  return wordLine({ ...entry, home: inText(entry.home), tier: tierName(entry.tier ?? '').toLowerCase() });
}

/** The Word for Monday's briefing: up to three lines of talk. '' when there's none. */
export function renderWord(state) {
  const lines = rivalView(state).word.map(wordText).filter(Boolean);
  if (!lines.length) return '';
  return `<div class="theword" aria-label="The Word"><p class="theword__title">The Word</p>${lines.map((l) => `<p class="theword__line">${esc(l)}</p>`).join('')}</div>`;
}

/** People who left us for another tong or for the street (C4.3): name, where they are now, a fame word. Never a rating. '' when nobody has. */
export function renderGoneElsewhere(state) {
  const gone = rivalView(state).gone;
  if (!gone.length) return '';
  return `<h2>Gone elsewhere</h2>
    <ul class="list list--plain streetnames" aria-label="Gone elsewhere">${gone.map((n) => `
      <li class="streetname">
        <span class="streetname__face">${faceOfCard(state, n.id, 32)}</span>
        <span class="streetname__who"><strong>${esc(n.name)}</strong></span>
        <span class="small muted">${esc([n.role, FAME_LINE[n.fame], n.tong ?? 'between tongs'].filter(Boolean).join(' · '))}</span>
      </li>`).join('')}</ul>`;
}

/** The Anchor's Book (C5): this month's slate, S to D, names in order inside a grade, Ones to watch. Letters and words, never a number. */
function bookPage(state, back) {
  const v = bookView(state);
  const where = (n) => (n.yours ? 'Yours' : n.tong ?? (n.free ? 'Between tongs' : ''));
  const opIdOf = (n) => state.crew.find((o) => o.name === n.name)?.id;
  const nameBtn = (n) => (n.yours && opIdOf(n) ? `<button class="namebtn" data-action="open-op" data-id="${esc(opIdOf(n))}">${esc(n.name)}</button>`
    : n.id ? `<button class="namebtn" data-action="tong-name" data-id="${esc(n.id)}">${esc(n.name)}</button>` : `<span class="namebtn">${esc(n.name)}</span>`);
  const groups = v.groups.map((g) => `<h2 class="bookgrade">${esc(g.grade)}</h2>
    <ul class="list list--plain streetnames" aria-label="Grade ${esc(g.grade)}">${g.entries.map((n) => `
      <li class="streetname ${n.yours ? 'is-own' : ''}">
        <span class="streetname__who">${nameBtn(n)}${n.yours ? ' <span class="tongtag">Ours</span>' : ''}</span>
        <span class="small muted">${esc([where(n), BOOK_TEXT.moves[n.move]].filter(Boolean).join(' · '))}</span>
      </li>`).join('')}</ul>`).join('');
  const watch = v.watch.length ? `<h2>Ones to watch</h2>
    <ul class="list list--plain streetnames" aria-label="Ones to watch">${v.watch.map((n) => `
      <li class="streetname ${n.yours ? 'is-own' : ''}">
        <span class="streetname__who">${nameBtn(n)}</span>
        <span class="small muted">${esc(where(n))}</span>
        ${n.id && !n.yours ? `<button class="btn" data-action="lead-name" data-id="${esc(n.id)}">Scout ›</button>` : ''}
      </li>`).join('')}</ul>` : '';
  const quiet = v.gone.length ? `<p class="small muted">Gone quiet this month: ${esc(v.gone.map((g) => g.name).join(', '))}.</p>` : '';
  return `<section class="panel tongs bookpage">
    <button class="linkbtn" data-action="back">‹ ${esc(back)}</button>
    <h1 class="cityhead">The Anchor's Book</h1>
    <p class="small muted">${esc(BOOK_TEXT.note)}</p>
    ${v.published ? groups + watch + quiet : `<p class="small">${esc(BOOK_TEXT.empty)}</p>`}
  </section>`;
}

/** Where a runner stands on the slate, as a line ('' when they are not on it). */
export function bookLine(state, runnerId) {
  const g = bookGrade(state, runnerId);
  return g ? `On the Anchor's slate: ${g}.` : '';
}

/** A name's portrait, drawn from the runner they would be (the same hash as when signed, so the face doesn't change). */
function faceOfCard(state, ref, size = 48) {
  const card = findCard(state, ref);
  if (!card) return '';
  const cls = size >= 100 ? ' face--lg' : size <= 32 ? ' face--sm' : '';
  return `<span class="face${cls}">${portrait(dossierOf(state, card), { size })}</span>`;
}
/** Someone of ours in Names on the street: their own face. */
function faceOfOurs(state, name, size = 48) {
  const op = state.crew.find((o) => o.name === name);
  return op ? `<span class="face${size <= 32 ? ' face--sm' : ''}">${portrait(op, { size })}</span>` : '';
}

const ratingLine = (n) => fill(RATING_WORDS[n.word] ?? '', { role: n.role, home: inText(n.home) });

function namesList(state, names) {
  return `<ul class="list list--plain streetnames" aria-label="Names on the street">${names.map((n) => `
    <li class="streetname ${n.own ? 'is-own' : ''}">
      <span class="streetname__face">${n.own ? faceOfOurs(state, n.name) : faceOfCard(state, n.id)}</span>
      <span class="streetname__who"><strong>${esc(n.name)}</strong>${n.own ? ' <span class="tongtag">Ours</span>' : ''}${n.former ? ' <span class="tongtag">Yours, once</span>' : ''}</span>
      <span class="small muted">${esc([n.role, FAME_LINE[n.fame], n.tong ?? (n.own ? 'with us' : 'between tongs')].filter(Boolean).join(' · '))}</span>
      <span class="small">${esc(ratingLine(n).replace(/^./, (c) => c.toUpperCase()))}.</span>
    </li>`).join('')}</ul>`;
}

function tongCard(t) {
  return `<li><button class="tongcard" data-action="tong-page" data-id="${esc(t.id)}" data-style="${esc(t.style)}">
    <span class="tongcard__what"><span class="tongcard__name">${esc(t.name)}</span>
      <span class="small muted">${esc(STYLE_TEXT[t.style].label)} · ${esc(place(t.home))}${t.head ? ` · run by ${esc(t.head)}` : ''}</span>
      ${t.said ? `<span class="small">${esc(wordText(t.said))}</span>` : ''}</span>
    <span class="tongcard__go">Open ›</span></button></li>`;
}

function tongPage(state, view, id, back) {
  for (const { tier, tongs } of view.tiers) {
    const t = tongs.find((x) => x.id === id);
    if (!t) continue;
    return `<section class="panel tongs">
      <button class="linkbtn" data-action="back">‹ ${esc(back)}</button>
      <h1 class="cityhead">${esc(t.name)}</h1>
      <p class="small">A ${esc(tierName(tier).toLowerCase())} tong, ${esc(STYLE_TEXT[t.style].label.toLowerCase())} by style. ${esc(STYLE_TEXT[t.style].line)}</p>
      <dl class="tongfacts">
        <div><dt>Based in</dt><dd>${esc(place(t.home))}</dd></div>
        ${t.head ? `<div><dt>Run by</dt><dd>${esc(t.head)}</dd></div>` : ''}
        ${t.names.length ? `<div><dt>Names you hear</dt><dd class="namebtns">${t.names.map((n) => `<button class="namebtn" data-action="tong-name" data-id="${esc(n.id)}">${faceOfCard(state, n.id, 32)}${esc(n.name)} ›</button>`).join('')}</dd></div>` : ''}
      </dl>
      ${t.said ? `<h2>The latest</h2><p class="small">${esc(wordText(t.said))}</p>` : '<p class="small muted">Nothing much said about them lately.</p>'}
    </section>`;
  }
  return '';
}

const STAT_ORDER = ['combat', 'stealth', 'tech', 'social', 'piloting', 'medical', 'cool', 'endurance'];

/** This month's free name, if one is up: a card that opens them in Crew › Leads (where scouting and signing are). */
function freeNamesBlock(state, view) {
  const o = view.offer;
  if (!o) return '';
  return `<h2>Free names</h2><ul class="list list--plain tongs__list"><li><button class="tongcard" data-action="lead-name" data-id="${esc(o.id)}" data-style="free">
    ${faceOfCard(state, o.id)}
    <span class="tongcard__what"><span class="tongcard__name">${esc(o.name)}</span>
      <span class="small muted">${esc([o.role, FAME_LINE[o.fame], o.from ? `lately of ${o.from}` : 'between tongs'].join(' · '))}</span>
      <span class="small">${esc(fill(RATING_WORDS[o.word] ?? '', { role: o.role, home: inText(o.home) }).replace(/^./, (c) => c.toUpperCase()))}.</span></span>
    <span class="tongcard__go">In Leads ›</span></button></li></ul>`;
}

/** The top of a name's page, shared by the City profile and the Leads page: who they are, who they are with, what the street says. */
function nameHead(state, card, r) {
  const slate = bookLine(state, card.runnerId ?? card.id);
  return `<div class="namehead">${faceOfCard(state, card.id, 104)}<div><h1 class="cityhead">${esc(r.name)}</h1>
    <p class="small">${esc([r.role, FAME_LINE[r.fame], r.tong ? `with ${r.tong}` : r.from ? `lately of ${r.from}` : 'between tongs'].join(' · '))}. ${esc(fill(RATING_WORDS[r.word] ?? '', { role: r.role, home: inText(r.home) }).replace(/^./, (c) => c.toUpperCase()))}.</p>${slate ? `<p class="small muted">${esc(slate)}</p>` : ''}</div></div>`;
}

/** What scouting has shown so far (the same words wherever a name is read). */
function nameKnow(r) {
  const stats = r.stats ? `<p class="small namestats">${STAT_ORDER.map((k) => `${k} <strong>${r.stats[k]}</strong>`).join(' · ')}</p>` : '';
  const potential = r.potential ? `<p class="small">${esc(POTENTIAL_TEXT[r.potential])}</p>` : '';
  return `<h2>What we know</h2>${stats}${potential}<p class="small muted">${esc(SCOUT_LEVEL_TEXT[r.level])}</p>`;
}

const goneCard = (back) => `<section class="panel tongs"><button class="linkbtn" data-action="back">‹ ${esc(back)}</button><h1 class="cityhead">Gone</h1><p class="small muted">${esc(SIGN_REASON.gone)}</p></section>`;

/**
 * City › Tongs: a name's read-only profile (navigation rework, 2026-11-09): who they are, who they are with,
 * what we know. No price, no scouting, no Sign: those are on Crew › Leads, one tap away.
 */
function nameProfile(state, slugId, back) {
  const card = findCard(state, slugId);
  if (!card) return goneCard(back);
  const r = readFor(state, card);
  return `<section class="panel tongs namepage">
    <button class="linkbtn" data-action="back">‹ ${esc(back)}</button>
    ${nameHead(state, card, r)}
    ${nameKnow(r)}
    <button class="btn btn--primary" data-action="lead-name" data-id="${esc(card.id)}">View in Leads ›</button>
  </section>`;
}

/**
 * Crew › Leads: recruiting a name, free or in another tong: what we know, what it would take, who could go and
 * watch them, and Sign (core/dossier.js: the rules are unchanged, only the place moved).
 */
export function renderLeadName(state, slugId, back = 'Leads') {
  const card = findCard(state, slugId);
  if (!card) return goneCard(back);
  const r = readFor(state, card);
  const a = approachFor(state, card.id);
  const out = (state.sideOut ?? []).some((x) => x.scout === card.id);
  const premium = a.premium > 0 ? 'A bit more than their worth, to be convinced.' : "They'd come for the going rate.";
  const wageLine = a.reason === 'head' ? '' : `<dl class="tongfacts">
      <div><dt>They want</dt><dd>${r.level === 'sharper' || r.level === 'full' ? money(a.wage) : `about ${money(a.shown)}`} a week. ${esc(premium)}</dd></div>
      <div><dt>Signing fee</dt><dd>${money(a.fee)}</dd></div>
      ${a.buyout ? `<div><dt>Buyout to ${esc(r.tong)}</dt><dd>${money(a.buyout)}</dd></div>` : ''}
      <div><dt>All in, today</dt><dd>${money(a.total)}</dd></div></dl>`;
  const free = state.crew.filter((o) => !o.freelance && o.condition?.injury !== 'dead' && availability(state, o).ok);
  const scout = a.reason === 'head' ? '' : r.level === 'full' ? '<p class="small muted">We have the full picture.</p>'
    : out ? '<p class="small muted">Someone is already out watching them.</p>'
    : free.length ? `<h2>Send someone to watch them (two days)</h2><div class="namebtns">${free.map((o) => `<button class="btn" data-action="scout-send" data-id="${esc(`${r.id}|${o.id}`)}">${esc(o.handle)}</button>`).join('')}</div>`
    : '<p class="small muted">Nobody is free to go and watch them.</p>';
  return `<section class="panel tongs namepage">
    <button class="linkbtn" data-action="back">‹ ${esc(back)}</button>
    ${nameHead(state, card, r)}
    ${nameKnow(r)}
    <h2>What it would take</h2>
    ${wageLine}
    ${a.ok ? `<button class="btn btn--primary signbtn" data-action="sign-name" data-id="${esc(r.id)}">Sign ${esc(r.name)} · ${money(a.total)}</button>` : `<p class="small">${esc(SIGN_REASON[a.reason] ?? '')}${a.reason === 'no_cash' ? ` We are short ${money(a.total - state.cash)}.` : ''}</p>`}
    ${scout}
  </section>`;
}

/**
 * Crew › Leads' names: this month's free name, and anyone in a tong we are watching or have sent someone to
 * watch. A name reached from a City profile is opened directly (lead-name), so the list stays short.
 */
export function leadNames(state) {
  const view = rivalView(state);
  const o = view.offer;
  const out = (state.sideOut ?? []).map((x) => x.scout).filter(Boolean);
  const seen = new Set();
  const watching = [...view.tiers.flatMap((t) => t.tongs.flatMap((g) => g.names)), ...view.names.filter((n) => !n.own)]
    .map((n) => findCard(state, n.id)).filter((c) => c && c.id !== o?.id && !seen.has(c.id) && seen.add(c.id) && (scoutLevel(state, c) > 0 || out.includes(c.id)))
    .map((c) => readFor(state, c));
  const row = (n, tail) => `<li><button class="tongcard" data-action="lead-name" data-id="${esc(n.id)}" data-style="${n.tong ? 'tong' : 'free'}">
    ${faceOfCard(state, n.id)}
    <span class="tongcard__what"><span class="tongcard__name">${esc(n.name)}</span>
      <span class="small muted">${esc([n.role, FAME_LINE[n.fame], n.tong ?? (n.from ? `lately of ${n.from}` : 'between tongs')].join(' · '))}</span></span>
    <span class="tongcard__go">${tail} ›</span></button></li>`;
  const rows = [...(o ? [row(o, 'Free name')] : []), ...watching.map((n) => row(n, 'Watching'))];
  return rows.length ? `<h2>Names</h2><p class="muted small">Free names, and anyone in another tong we have an eye on. A name from the street can be opened from City › Tongs.</p><ul class="list list--plain tongs__list">${rows.join('')}</ul>` : '';
}

/** City › Tongs: dossier cards by tier, then Names on the street. `openId` opens one tong's page, or `name:<id>` a name's profile. */
export function renderTongs(state, openId = null, back = 'City') {
  const view = rivalView(state);
  if (openId === 'book') return bookPage(state, back);
  if (openId?.startsWith('name:')) return nameProfile(state, openId.slice(5), back);
  if (openId) { const page = tongPage(state, view, openId, back); if (page) return page; }
  return `<section class="tongs">
    <h2 class="tongs__title">The other tongs</h2>
    <p class="small muted">Peers, not gangs: they work, hire and rise like us, and the city talks about them. Nobody keeps a table; you hear where you stand.</p>
    <button class="tongcard bookcard" data-action="tong-page" data-id="book" data-style="elder"><span class="tongcard__what"><span class="tongcard__name">The Anchor's Book</span><span class="small muted">${esc(bookView(state).published ? 'The elders\' slate for this month' : BOOK_TEXT.empty)}</span></span></button>
    ${freeNamesBlock(state, view)}
    ${view.tiers.map(({ tier, tongs }) => `<h2 class="tongs__tier">${esc(tierName(tier))} tongs</h2><ul class="list list--plain tongs__list">${tongs.map(tongCard).join('')}</ul>`).join('')}
    <h2>Names on the street</h2>
    ${namesList(state, view.names)}
    <p class="small muted">${esc(ELDER_LINE)}</p>
  </section>`;
}
