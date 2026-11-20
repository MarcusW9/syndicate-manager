// The skills list on a runner's page (2026-11-19; drafts/PROPOSAL-runner-shaping.md step 3, the list layout the owner picked from
// three mock-ups). Three slots up top (move, payload, specialisation: what they hold), then every skill in the game with its stat
// gates as chips, held first. A read of core/abilities.js `skillMenu`. Since 2026-11-20 it is also where a skill is learned: at a
// level-up (core/levelup.js) a banner says so and an opened Ready row has a Learn button. Tap a row to open its full text under it
// (tap, not hover: iOS rule in CLAUDE.md).
import { skillMenu } from '../core/abilities.js';
import { levelUpOpen, jobsToLevelUp } from '../core/levelup.js';
import { MOVES, PAYLOADS } from '../data/builds.js';
import { SPECIALISATIONS } from '../data/specialisations.js';
import { skillIcon } from './skillicons.js';
import { esc, statName, subTabs } from './shared.js';
import { V } from './view.js';

const SLOT_LABEL = { move: 'Move', payload: 'Payload', spec: 'Spec' };
const PILL = { held: ['held', 'Held'], ready: ['ready', 'Ready'], locked: ['locked', 'Locked'] };
const FILTERS = [['all', 'All'], ['held', 'Held'], ['ready', 'Ready'], ['locked', 'Locked']];

const KIT_WORD = { rifle: 'Rifle jobs', drone: 'Drone jobs' };
const SOURCES = { move: MOVES, payload: PAYLOADS, spec: SPECIALISATIONS };

/** Each gate as a chip: green when met, red when short, with what they have beside what it takes. A specialisation's jobs on overwatch too. */
function gateChips(op, item) {
  const entries = Object.entries(item.needs);
  const chips = entries.map(([stat, need]) => {
    const have = op.stats?.[stat] ?? 0;
    return `<span class="gate ${have >= need ? 'gate--ok' : 'gate--no'}">${esc(statName(stat))} ${have}/${need}</span>`;
  });
  if (item.kit?.need) chips.push(`<span class="gate ${item.kit.have >= item.kit.need ? 'gate--ok' : 'gate--no'}">${esc(KIT_WORD[item.kit.kit] ?? 'Overwatch jobs')} ${Math.min(item.kit.have, item.kit.need)}/${item.kit.need}</span>`);
  return chips.join('') || '<span class="gate gate--ok">No stat gate</span>';
}

/** What an opened Ready row says: the Learn button at a level-up, else when the next one can come. Joss's line about it either way. */
function readyMore(op, item) {
  const joss = SOURCES[item.slot]?.[item.id]?.offer;
  const line = joss ? `<p class="muted small">Joss: "${esc(joss.replaceAll('{op}', op.handle))}"</p>` : '';
  if (levelUpOpen(op)) return `${line}<button class="btn btn--primary btn--block skillrow__learn" data-action="learn" data-id="${esc(`${item.slot}|${item.id}`)}">Learn ${esc(item.name)}</button><p class="muted small">For good: a ${item.slot === 'spec' ? 'specialisation' : item.slot} is never replaced.</p>`;
  const wait = jobsToLevelUp(op);
  return `${line}<p class="muted small">${op.freelance ? 'Freelancers don\'t level up with us.' : wait ? `Ready. They can learn it at their next level-up, after ${wait} more job${wait > 1 ? 's' : ''} with the crew.` : 'Ready. Their level-up comes by tomorrow.'}</p>`;
}

/** Why a locked skill is locked, in one line: a place that is taken, or the stats (or overwatch jobs) still short. */
function lockedWhy(item) {
  const gaps = item.missing.map((m) => `${statName(m.stat)} ${m.have} of ${m.need}`);
  if (item.kit && item.kit.have < item.kit.need) gaps.push(`${(KIT_WORD[item.kit.kit] ?? 'overwatch jobs').toLowerCase()} on overwatch ${item.kit.have} of ${item.kit.need}`);
  const short = gaps.length ? `Still short: ${gaps.join(', ')}.` : '';
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
      ${levelUpOpen(op) ? `<div class="levelup" role="status"><strong>Level up</strong><span>${esc(op.handle)} can learn one skill. Open a Ready one and tap Learn.</span></div>` : ''}
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
          ${on ? `<div class="skillrow__more"><p>${esc(i.desc)}</p>${i.state === 'held' && i.slot === 'spec' && op.spec?.day ? `<p class="muted small">Theirs since day ${op.spec.day}.</p>` : ''}${i.state === 'locked' ? `<p class="muted small">${esc(lockedWhy(i))}</p>` : i.state === 'ready' ? readyMore(op, i) : ''}</div>` : ''}
        </li>`;
  }).join('') || '<li class="muted small">Nothing here.</li>'}</ul>`;
}
