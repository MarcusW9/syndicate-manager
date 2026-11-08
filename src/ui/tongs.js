// The other tongs on screen (C1b; DESIGN.md 2026-11-08 "No league"): Ops › The other tongs, a tong's
// page, and Names on the street, plus The Word's lines for Monday's briefing. Reads `rivalView`
// only: word keys in, wording from data/rivals.js out. No numbers, no order beyond tier.
import { rivalView } from '../core/rivals.js';
import { TONG_RANKS } from '../data/tong.js';
import { NAMES } from '../config/names.js';
import { RATING_WORDS, FAME_LINE, STYLE_TEXT, ELDER_LINE, fill, wordLine } from '../data/rivals.js';

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

const ratingLine = (n) => fill(RATING_WORDS[n.word] ?? '', { role: n.role, home: inText(n.home) });

function namesList(names) {
  return `<ul class="list list--plain streetnames" aria-label="Names on the street">${names.map((n) => `
    <li class="streetname ${n.own ? 'is-own' : ''}">
      <span class="streetname__who"><strong>${esc(n.name)}</strong>${n.own ? ' <span class="tongtag">Ours</span>' : ''}</span>
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

function tongPage(view, id) {
  for (const { tier, tongs } of view.tiers) {
    const t = tongs.find((x) => x.id === id);
    if (!t) continue;
    return `<section class="panel tongs">
      <button class="linkbtn" data-action="tongs-open">‹ The other tongs</button>
      <h1 class="cityhead">${esc(t.name)}</h1>
      <p class="small">A ${esc(tierName(tier).toLowerCase())} tong, ${esc(STYLE_TEXT[t.style].label.toLowerCase())} by style. ${esc(STYLE_TEXT[t.style].line)}</p>
      <dl class="tongfacts">
        <div><dt>Based in</dt><dd>${esc(place(t.home))}</dd></div>
        ${t.head ? `<div><dt>Run by</dt><dd>${esc(t.head)}</dd></div>` : ''}
        ${t.names.length ? `<div><dt>Names you hear</dt><dd>${esc(t.names.join(', '))}</dd></div>` : ''}
      </dl>
      ${t.said ? `<h2>The latest</h2><p class="small">${esc(wordText(t.said))}</p>` : '<p class="small muted">Nothing much said about them lately.</p>'}
    </section>`;
  }
  return '';
}

/** Ops › The other tongs: dossier cards by tier, then Names on the street. `openId` opens one tong's page. */
export function renderTongs(state, openId = null) {
  const view = rivalView(state);
  if (openId) { const page = tongPage(view, openId); if (page) return page; }
  return `<section class="panel tongs">
    <button class="linkbtn" data-action="tongs-close">‹ Ops</button>
    <h1 class="cityhead">The other tongs</h1>
    <p class="small muted">Peers, not gangs: they work, hire and rise like us, and the city talks about them. Nobody keeps a table; you hear where you stand.</p>
    ${view.tiers.map(({ tier, tongs }) => `<h2 class="tongs__tier">${esc(tierName(tier))} tongs</h2><ul class="list list--plain tongs__list">${tongs.map(tongCard).join('')}</ul>`).join('')}
    <h2>Names on the street</h2>
    ${namesList(view.names)}
    <p class="small muted">${esc(ELDER_LINE)}</p>
  </section>`;
}
