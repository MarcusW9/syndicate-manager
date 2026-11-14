// Small pieces of markup that several screens draw: escaping, faces, risk badges, the (i) notes, sub-tabs.
// A leaf: it imports no screen module, so screens can use it while they load.
import { NAMES } from '../config/names.js';
import { portrait } from './art.js';
import { money } from '../core/money.js';
import { pageKind } from './nav.js';
import { viewNow, nav, backLabel, state, openInfo } from './view.js';

/** A root view you got to by a link (the Armoury from the plan, Leads from a message) says where Back goes; one you chose has none. */
export const rootBack = () => (!pageKind(viewNow()) && nav.depth > 0 ? `<div class="backbar"><button class="linkbtn" data-action="back">‹ ${esc(backLabel())}</button></div>` : '');

// --- helpers -----------------------------------------------------------
export const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const riskWord = (level) => (level === 'moderate' ? 'mid' : level);
export const riskBadge = (level) => `<span class="risk risk--${esc(level)}">${esc(level === 'safe' || level === 'certain' ? level : `${riskWord(level)} risk`)}</span>`;
/** Availability as a coloured chip: green ready, amber usable but worse off, red can't go, teal away on a job. */
export function statusChip(a) {
  const tone = a.ok ? (a.reason === 'ready' ? 'ready' : 'worn') : a.reason.startsWith('away') ? 'away' : 'out';
  const back = /^away until day (\d+)$/.exec(a.reason);
  const n = back ? Number(back[1]) - state.day : 0;
  // The teal "away" colour already says they're out; the words say when they're back.
  const text = back ? (n <= 1 ? 'back tomorrow' : `back in ${n} days`) : a.reason;
  return `<span class="status status--${tone}">${esc(text)}</span>`;
}
/** How long something on offer lasts: it's still there on its last day. */
export const daysLeft = (lastDay) => { const n = lastDay - state.day; return n <= 0 ? 'last day' : n === 1 ? '1 day left' : `${n} days left`; };

export const districtName = (key) => NAMES.districts[key] ?? key;

/** Portrait in a cut-corner frame (crew list, profiles, the wall). Fallen faces are greyed. */
export const face = (op, size = '') => `<span class="face ${size ? `face--${size}` : ''} ${op.cause ? 'is-fallen' : ''}">${portrait(op, { size: { sm: 32, lg: 104 }[size] ?? 48 })}</span>`;
export const statName = (k) => k[0].toUpperCase() + k.slice(1);

/** "the Docks hall". */
export const hallLabel = (d) => `the ${cityName(d).replace(/^The /, '')} hall`;

/** "A, B and C". */
export const andList = (xs) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs.at(-1)}`);
/** Fill a line's {slots}; a slot with no value is left as written so a gap shows up in testing. */
export const fillLine = (line, data) => line.replace(/\{(\w+)\}/g, (m, k) => (data[k] ?? m));

/** The sub-tab row (layout rule 5): `tabs` is [id, label] pairs; `on` the one showing; `action` the click action. */
export function subTabs(label, action, tabs, on) {
  return `<div class="subtabs" role="group" aria-label="${esc(label)}">${tabs.map(([k, name, count]) => `<button class="subtab ${k === on ? 'is-on' : ''}" data-action="${action}" data-id="${k}" aria-pressed="${k === on}">${esc(name)}${count ? ` <span class="pill" aria-label="${count} waiting">${count}</span>` : ''}</button>`).join('')}</div>`;
}

// A small (i) that opens an explanation under its line on tap (no hover: iOS rules in CLAUDE.md).
// The button stays put and the text appears below, so nothing jumps (owner's feedback, 2026-10-28).
export const infoButton = (id, label) => `<button class="infobtn ${openInfo.has(id) ? 'is-on' : ''}" data-action="info" data-id="${esc(id)}" aria-label="${esc(label)}" aria-expanded="${openInfo.has(id)}">i</button>`;
export const infoText = (id, text) => (openInfo.has(id) ? `<p class="infotext small">${esc(text)}</p>` : '');
/** The same, for an explanation that needs markup (icons); `html` must already be escaped. */
export const infoHtml = (id, html) => (openInfo.has(id) ? html : '');

/** Helpers the squad board borrows (ui/board.js), so it looks like the rest of the game. */
export const gearUi = { esc, money };

/** Stable pick from a list of lines, so the same rise always reads the same. */
export function pickLine(lines, key) {
  let h = 0;
  for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return lines[h % lines.length];
}

// --- city --------------------------------------------------------------

export const cityName = (key) => NAMES.districts[key] ?? NAMES.lockedDistricts?.[key] ?? key;
