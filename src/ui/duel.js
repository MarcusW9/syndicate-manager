// The face-off (playtest, 2026-11-07: "a little portrait of your guy against the other guy, showing
// which stat he's rolling, then an impactful animation when he wins or loses"). When a moment on the
// watch screen comes down to one person's roll, it pops up over the map: their face against who or
// what they're up against, the stat, the d20 landing, the total against what it needed, then a hit
// for a win or a jolt for a loss. Then it goes and the map carries on.
//
// Decoration only, like the site plan: the same roll is in the feed line (tap it for the dice).
// It never blocks: pointer-events off, it leaves on its own, and Faster shortens it.

import { portrait } from './art.js';
import { INCIDENTS } from '../data/incidents.js';

// Who or what each incident puts in front of the crew. People get a face of their own (seeded by the
// job, so the same guard looks the same if you watch again); things get a mark.
const FOES = {
  patrol: { kind: 'person', name: 'Patrol', who: 'guard' },
  guard: { kind: 'person', name: 'Guard', who: 'guard' },
  backup: { kind: 'person', name: 'Backup', who: 'guard' },
  hold: { kind: 'person', name: 'Holdout', who: 'guard' },
  checkpoint: { kind: 'person', name: 'Checkpoint', who: 'clerk' },
  staff: { kind: 'person', name: 'Staff', who: 'clerk' },
  mark: { kind: 'person', name: 'The mark', who: 'mark' },
  lock: { kind: 'thing', name: 'Lock', glyph: 'lock' },
  camera: { kind: 'thing', name: 'Camera', glyph: 'camera' },
  sweep: { kind: 'thing', name: 'Drone sweep', glyph: 'drone' },
  firewall: { kind: 'thing', name: 'Firewall', glyph: 'wall' },
  safe: { kind: 'thing', name: 'Safe', glyph: 'safe' },
};
const NAMES = { guard: ['Lam Chi-keung', 'Ng Wai-man', 'Tse Kwok-wing', 'Ho Siu-lung', 'Chan Tak-ming'], clerk: ['Wong Mei-ling', 'Lau Ka-yan', 'Yip Sau-fong', 'Cheng Hoi-yin'], mark: ['Fung Yat-sun', 'Leung Pak-hei', 'Mok Wing-yee'] };
const hash = (s) => { let h = 0; for (const ch of String(s)) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h; };

const GLYPH = {
  lock: '<rect x="14" y="26" width="36" height="28" rx="3"/><path d="M22 26 V18 a10 10 0 0 1 20 0 V26" fill="none"/><circle cx="32" cy="38" r="3.5"/><path d="M32 41 V47"/>',
  camera: '<path d="M10 22 L44 16 L48 32 L14 38 Z"/><path d="M46 24 L56 20 L56 34 L48 32" /><path d="M24 37 L22 50 M14 50 H30"/>',
  drone: '<circle cx="16" cy="20" r="7"/><circle cx="48" cy="20" r="7"/><circle cx="16" cy="44" r="7"/><circle cx="48" cy="44" r="7"/><rect x="24" y="26" width="16" height="12" rx="3"/><path d="M21 25 L25 28 M43 25 L39 28 M21 39 L25 36 M43 39 L39 36"/>',
  wall: '<path d="M10 16 H54 V48 H10 Z M10 27 H54 M10 38 H54 M24 16 V27 M40 16 V27 M17 27 V38 M32 27 V38 M47 27 V38 M24 38 V48 M40 38 V48"/>',
  safe: '<rect x="12" y="12" width="40" height="40" rx="3"/><circle cx="32" cy="32" r="9"/><path d="M32 23 V27 M32 37 V41 M23 32 H27 M37 32 H41"/>',
  crisis: '<path d="M32 10 L56 52 H8 Z"/><path d="M32 24 V38 M32 43 V46"/>',
};

/**
 * The face-off for a feed card, or null when it isn't one person's roll. item: a core/feed.js card;
 * ops: id → operative; seed: the job's id, so the same guard keeps their face.
 */
export function duelFor(item, ops, seed = '') {
  if (item?.type !== 'card' || !['incident', 'crisis'].includes(item.kind)) return null;
  const r = item.results?.[0];
  const me = ops(item.cue?.actor);
  if (!r?.roll || !me) return null;
  const id = item.cue?.incident;
  const f = FOES[id] ?? (item.kind === 'crisis' ? { kind: 'thing', name: 'Crisis', glyph: 'crisis' } : { kind: 'thing', name: INCIDENTS[id]?.name ?? 'Trouble', glyph: 'crisis' });
  const foe = f.kind === 'person'
    ? { ...f, op: { id: `foe-${seed}-${id}`, handle: f.name, name: NAMES[f.who][hash(`${seed}|${id}`) % NAMES[f.who].length], age: 28 + (hash(`${id}|${seed}`) % 25) } }
    : f;
  const { die, value, need, stat } = r.roll;
  return { me, foe, stat, die, value, need, total: die + value, success: typeof item.cue?.success === 'boolean' ? item.cue.success : die + value >= need, headline: r.headline, danger: !!item.cue?.danger };
}

/** The face-off's markup (its parts animate by class; .is-win / .is-lose land the result). */
export function duelHtml(d, esc) {
  const foeArt = d.foe.op ? portrait(d.foe.op, { size: 64 }) : `<svg class="duel__glyph" viewBox="0 0 64 64" width="64" height="64" aria-hidden="true">${GLYPH[d.foe.glyph] ?? GLYPH.crisis}</svg>`;
  const statName = d.stat ? d.stat[0].toUpperCase() + d.stat.slice(1) : 'Roll';
  return `
    <div class="duel ${d.danger ? 'duel--danger' : ''}" role="status" aria-label="${esc(`${d.me.handle} against ${d.foe.name}: ${statName} roll, ${d.total} against ${d.need}, ${d.success ? 'made it' : 'missed'}`)}">
      <div class="duel__side duel__side--me"><span class="duel__face">${portrait(d.me, { size: 64 })}</span><b>${esc(d.me.handle)}</b></div>
      <div class="duel__mid">
        <span class="duel__stat">${esc(statName)} roll</span>
        <span class="duel__vs">VS</span>
        <span class="duel__die" aria-hidden="true"><i>?</i></span>
        <span class="duel__sum"><b>${d.value}</b> + <b class="duel__d">d20</b> = <b class="duel__total">?</b> <span class="duel__need">need ${d.need}</span></span>
      </div>
      <div class="duel__side duel__side--foe ${d.foe.op ? '' : 'is-thing'}"><span class="duel__face">${foeArt}</span><b>${esc(d.foe.name)}</b></div>
      <span class="duel__stamp" aria-hidden="true">${d.success ? 'Made it' : 'Missed'}</span>
    </div>`;
}

const reduced = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** How long a face-off holds the watch at normal speed (ms), so the next step waits for it. */
export const DUEL_MS = 2100;

/**
 * Play a face-off in host (the map's box). speed(): the watch's pace (1 normal, lower faster).
 * Resolves when it's gone.
 */
export async function playDuel(host, d, esc, speed = () => 1) {
  if (!host || !d) return;
  host.querySelector('.duel')?.remove();
  host.insertAdjacentHTML('beforeend', duelHtml(d, esc));
  const el = host.lastElementChild;
  const t = (ms) => sleep(reduced() ? Math.min(ms, 200) : ms * speed());
  const die = el.querySelector('.duel__die i');
  requestAnimationFrame(() => el.classList.add('is-in'));
  await t(380);
  // The die tumbles, then lands.
  el.classList.add('is-rolling');
  const spins = reduced() ? 0 : Math.max(3, Math.round(8 * speed()));
  for (let i = 0; i < spins; i++) { die.textContent = String(1 + ((d.die * 7 + i * 13) % 20)); await sleep(55); }
  die.textContent = String(d.die);
  el.querySelector('.duel__d').textContent = String(d.die);
  el.querySelector('.duel__total').textContent = String(d.total);
  el.classList.remove('is-rolling');
  el.classList.add('is-landed', d.success ? 'is-win' : 'is-lose', ...(d.die === 20 ? ['is-crit'] : d.die === 1 ? ['is-fumble'] : []));
  await t(1100);
  el.classList.add('is-out');
  await t(260);
  el.remove();
}
