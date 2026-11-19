// The skills list on a runner's page (2026-11-19; drafts/PROPOSAL-runner-shaping.md step 3, the list layout the owner picked from
// three mock-ups). Three slots up top (move, payload, specialisation: what they hold), then every skill in the game with its stat
// gates as chips, held first. A read of core/abilities.js `skillMenu`: it changes nothing; Joss's offers (and the Offers block above)
// are still how a skill is learned. Tap a row to open its full text under it (tap, not hover: iOS rule in CLAUDE.md).
import { skillMenu } from '../core/abilities.js';
import { skillIcon } from './skillicons.js';
import { esc, statName, subTabs } from './shared.js';
import { V } from './view.js';

const SLOT_LABEL = { move: 'Move', payload: 'Payload', spec: 'Spec' };
const PILL = { held: ['held', 'Held'], ready: ['ready', 'Ready'], locked: ['locked', 'Locked'] };
const FILTERS = [['all', 'All'], ['held', 'Held'], ['ready', 'Ready'], ['locked', 'Locked']];

/** One stat gate as a chip: green when met, red when short, with what they have beside what it takes. */
function gateChips(op, item) {
  const entries = Object.entries(item.needs);
  if (!entries.length) return '<span class="gate gate--ok">No stat gate</span>';
  return entries.map(([stat, need]) => {
    const have = op.stats?.[stat] ?? 0;
    return `<span class="gate ${have >= need ? 'gate--ok' : 'gate--no'}">${esc(statName(stat))} ${have}/${need}</span>`;
  }).join('');
}

/** Why a locked skill is locked, in one line: a place that is taken, or the stats still short. */
function lockedWhy(item) {
  const short = item.missing.length ? `Still short: ${item.missing.map((m) => `${statName(m.stat)} ${m.have} of ${m.need}`).join(', ')}.` : '';
  const taken = item.full ? (item.slot === 'spec' ? 'They already have a specialisation, and it is for good.' : `Their ${item.slot} place is taken. Once learned, it is not replaced.`) : '';
  return [short, taken].filter(Boolean).join(' ');
}

export function renderSkills(op) {
  const menu = skillMenu(op);
  const counts = { all: menu.items.length, held: 0, ready: 0, locked: 0 };
  for (const i of menu.items) counts[i.state]++;
  const tab = counts[V.skillTab] !== undefined ? V.skillTab : 'all';
  const shown = menu.items.filter((i) => tab === 'all' || i.state === tab);
  const nameOf = Object.fromEntries(menu.items.map((i) => [`${i.slot}:${i.id}`, i.name]));
  const slots = menu.held.map(({ slot, id }) => `
      <div class="skillslot${id ? '' : ' skillslot--empty'}">
        <small>${SLOT_LABEL[slot]}</small>
        ${id ? skillIcon(id, 56) : '<svg class="skillbadge skillbadge--empty" viewBox="0 0 48 48" width="56" height="56" aria-hidden="true" focusable="false"><path d="M3 3h33l9 9v33H3z"/><path d="M24 17v14M17 24h14"/></svg>'}
        <span>${id ? esc(nameOf[`${slot}:${id}`]) : 'Empty'}</span>
      </div>`).join('');
  const open = shown.find((i) => V.skillOpen === `${op.id}|${i.id}`);
  return `
      <h2>Skills</h2>
      <div class="skillslots">${slots}</div>
      ${subTabs('Skills filter', 'skill-tab', FILTERS.map(([k, name]) => [k, name, counts[k]]), tab)}
      <ul class="skilllist">${shown.map((i) => {
    const on = i === open;
    const [cls, word] = i.full && !i.missing.length ? ['locked', 'Slot full'] : PILL[i.state];
    return `<li class="skillrow skillrow--${i.state}${on ? ' is-open' : ''}">
          <button class="skillrow__btn" data-action="skill-open" data-id="${esc(`${op.id}|${i.id}`)}" aria-expanded="${on}">
            <span class="skillbadge-wrap">${skillIcon(i.id, 48)}</span>
            <span class="skillrow__main"><strong>${esc(i.name)}</strong> <small>${SLOT_LABEL[i.slot]}</small>
              <span class="skillrow__gates">${gateChips(op, i)}</span></span>
            <span class="skillpill skillpill--${cls}">${word}</span>
          </button>
          ${on ? `<div class="skillrow__more"><p>${esc(i.desc)}</p>${i.state === 'held' && i.slot === 'spec' && op.spec?.day ? `<p class="muted small">Theirs since day ${op.spec.day}.</p>` : ''}${i.state === 'locked' ? `<p class="muted small">${esc(lockedWhy(i))}</p>` : i.state === 'ready' ? '<p class="muted small">Their stats are there. Joss puts it to them as an offer.</p>' : ''}</div>` : ''}
        </li>`;
  }).join('') || '<li class="muted small">Nothing here.</li>'}</ul>`;
}
