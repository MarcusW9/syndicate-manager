// The site plan on the watch screen (PLAN-CORE-LOOP.md, slices 2 and 4): the job's district site
// (data/sites.js) drawn as SVG, the crew as tokens that walk zone to zone, and short effects for
// what happens there (guards, patrols, cameras, saves). Decoration only: everything shown here is
// also in the feed as text.

import { SITES, pickSite } from '../data/sites.js';

const SVGNS = 'http://www.w3.org/2000/svg';
const W = 360;
const H = 240;
const FULL = [0, 0, W, H];
const pts = (list) => list.map((p) => p.join(',')).join(' ');
const reduced = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const initials = (op) => (op.handle ?? '?').split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
const escAttr = (v) => String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** The site for a job: its district's place, put together from parts picked by the job's id (data/sites.js pickSite). */
export const siteFor = (district, jobId, templateId) => pickSite(district, jobId, templateId);

/** One shape from a site's data as SVG. */
function shapeSvg(s) {
  const cls = `class="${escAttr(s.cls ?? '')}"`;
  const fill = s.fill ? ` fill="${escAttr(s.fill)}"` : '';
  if (s.t === 'rect') return `<rect ${cls} x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" rx="${s.rx ?? 1.5}"${fill}/>`;
  if (s.t === 'line') return `<line ${cls} x1="${s.x1}" y1="${s.y1}" x2="${s.x2}" y2="${s.y2}"/>`;
  if (s.t === 'poly') return s.closed ? `<polygon ${cls} points="${pts(s.points)}"${fill}/>` : `<polyline ${cls} points="${pts(s.points)}"/>`;
  if (s.t === 'circle') return `<circle ${cls} cx="${s.cx}" cy="${s.cy}" r="${s.r}"${fill}/>`;
  if (s.t === 'ellipse') return `<ellipse ${cls} cx="${s.cx}" cy="${s.cy}" rx="${s.rx}" ry="${s.ry}"${fill}/>`;
  if (s.t === 'row') {
    // n copies of a rect, `step` apart along x (or y), skipping some, filled from `tones` in turn.
    const out = [];
    for (let i = 0; i < s.n; i++) {
      if (s.skip?.includes(i)) continue;
      const x = s.axis === 'y' ? s.x : s.x + i * s.step;
      const y = s.axis === 'y' ? s.y + i * s.step : s.y;
      const tone = s.tones ? ` fill="${escAttr(s.tones[(i + (s.shift ?? 0)) % s.tones.length])}"` : '';
      out.push(`<rect ${cls} x="${x}" y="${y}" width="${s.w}" height="${s.h}" rx="${Math.min(1.5, s.w / 3, s.h / 3)}"${tone}/>`);
    }
    return out.join('');
  }
  return '';
}

/** The plan's markup for a site. kit: the overwatch kit (its sight is drawn) or null. */
export function sitePlanSvg({ kit = null, site = SITES.generic } = {}) {
  const P = site.points;
  const nodes = [site.paths.in.at(-1), site.paths.inside.at(-1)];
  const sight = !kit ? '' : `<polygon class="sp-sight ${kit === 'drone' ? 'sp-sight--drone' : ''}" points="${pts(site.sight[kit === 'drone' ? 'drone' : 'rifle'])}"/>`;
  return `<svg class="siteplan" viewBox="${FULL.join(' ')}" role="img" aria-label="${escAttr(site.aria)}">
    <rect width="${W}" height="${H}" fill="#0b0d11"/>
    ${site.shapes.map(shapeSvg).join('')}
    ${sight}
    <polyline class="sp-route" points="${pts([...site.paths.in, ...site.paths.inside.slice(1), ...site.paths.target.slice(1)])}"/>
    ${nodes.map(([x, y]) => `<circle class="sp-node" cx="${x}" cy="${y}" r="3"/>`).join('')}
    <circle class="sp-node sp-node--target" cx="${P.target[0]}" cy="${P.target[1]}" r="4"/><circle class="sp-node sp-node--perch" cx="${P.perch[0]}" cy="${P.perch[1]}" r="4"/>
    ${site.labels.map((l) => `<text class="sp-label ${l.hi ? 'sp-label--hi' : ''}" x="${l.x}" y="${l.y}">${escAttr(l.text)}</text>`).join('')}
    <circle class="sp-alarm" cx="0" cy="0" r="6"/>
    <g class="sp-fx"></g><g class="sp-tokens"></g>
  </svg>`;
}

const el = (tag, attrs = {}, text = '') => {
  const e = document.createElementNS(SVGNS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  if (text) e.textContent = text;
  return e;
};
const place = (node, [x, y]) => { node.style.transform = `translate(${x}px, ${y}px)`; };
const near = (pt, dx = 22, dy = -16) => [pt[0] + dx, pt[1] + dy];
const later = (ms) => new Promise((r) => setTimeout(r, reduced() ? 0 : ms));


/**
 * A live plan bound to an <svg> from sitePlanSvg. team: the inside crew [{ id, handle, color }];
 * overwatch: { op, kit } or null; wheels and standby: operatives waiting at the van (slice 3);
 * out: people already back at the van hurt. speed: a function giving the current pace (1 normal, lower faster).
 * site: the district's site plan (data/sites.js).
 */
export function bindSitePlan(svg, { team: inside, overwatch = null, wheels = null, standby = null, out = [], zone = 'start', speed = () => 1, site = SITES.generic }) {
  const team = [...inside];
  const P = site.points;
  const PATHS = site.paths;
  const ZONE_END = { start: P.van, in: PATHS.in.at(-1), inside: PATHS.inside.at(-1), target: P.target, out: P.van };
  const VB = { full: FULL, ...site.views, out: FULL };
  // Beside the van, clear of the group, towards the middle of the map.
  const side = P.van[0] < W / 2 ? 1 : -1;
  const VAN_SPOT = { wheels: [P.van[0] + 22 * side, P.van[1] + 8], standby: [P.van[0] + 34 * side, P.van[1] + 8], out: [P.van[0] + 46 * side, P.van[1] + 8] };
  const fx = svg.querySelector('.sp-fx');
  const tokens = svg.querySelector('.sp-tokens');
  const alarm = svg.querySelector('.sp-alarm');
  let here = ZONE_END[zone] ?? P.van;
  let view = [...(VB[zone] ?? VB.full)];
  svg.setAttribute('viewBox', view.join(' '));
  const wait = (ms) => later(ms * speed());
  const slot = (i, pt) => [pt[0] + (i % 2) * 11 - 5, pt[1] + Math.floor(i / 2) * 11 - 5];
  const tok = (id) => tokens.querySelector(`[data-op="${CSS.escape(id)}"]`);
  const addToken = (op, at) => {
    const g = el('g', { class: 'sp-token', 'data-op': op.id });
    g.append(el('circle', { r: 6.5, fill: op.color ?? '#8b93a7' }), el('text', {}, initials(op)));
    place(g, at);
    tokens.append(g);
  };
  team.forEach((op, i) => addToken(op, slot(i, here)));
  if (overwatch?.op) addToken(overwatch.op, P.perch);
  if (wheels) addToken(wheels, VAN_SPOT.wheels);
  if (standby) addToken(standby, VAN_SPOT.standby);
  for (const op of out) { addToken(op, VAN_SPOT.out); tok(op.id)?.classList.add('is-down'); }
  const posOf = (id) => slot(Math.max(0, team.findIndex((o) => o.id === id)), here);

  function moveGroup(pt) { here = pt; team.forEach((op, i) => { const t = tok(op.id); if (t) place(t, slot(i, pt)); }); }

  function panTo(name, ms = 700) {
    const to = VB[name] ?? VB.full;
    const from = [...view];
    if (reduced() || ms <= 0) { view = [...to]; svg.setAttribute('viewBox', to.join(' ')); return; }
    const t0 = performance.now();
    const dur = ms * speed();
    const step = (t) => {
      const k = Math.min(1, (t - t0) / dur);
      const e = k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2;
      view = from.map((v, i) => v + (to[i] - v) * e);
      svg.setAttribute('viewBox', view.join(' '));
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  const flash = async (at, tone = 'hit') => { const c = el('circle', { class: `sp-flash sp-flash--${tone}`, cx: at[0], cy: at[1], r: 5 }); fx.append(c); await wait(450); c.remove(); };
  const ring = async (at, ok) => { const c = el('circle', { class: `sp-ring ${ok ? 'sp-ring--ok' : 'sp-ring--bad'}`, cx: at[0], cy: at[1], r: 9 }); fx.append(c); await wait(700); c.remove(); };
  const spawn = (at, cls, mark) => { const g = el('g', { class: cls }); g.append(el('circle', { r: 6 }), el('text', {}, mark)); place(g, at); fx.append(g); return g; };
  const pulse = async (at, ms = 1600) => { alarm.setAttribute('cx', at[0]); alarm.setAttribute('cy', at[1]); alarm.classList.add('is-on'); await wait(ms); alarm.classList.remove('is-on'); };

  async function shot(to, hit) {
    const end = hit ? to : [to[0] + 9, to[1] - 7];
    const l = el('line', { class: 'sp-shot', x1: P.perch[0], y1: P.perch[1], x2: end[0], y2: end[1] });
    fx.append(l); await wait(350); await flash(end, hit ? 'hit' : 'miss'); l.remove();
  }
  async function drone(to, hit) {
    const d = el('g', { class: 'sp-drone' });
    d.append(el('circle', { r: 3.5 }), el('circle', { r: 7, class: 'sp-drone__rotor' }));
    place(d, P.perch); fx.append(d);
    await wait(60); place(d, hit ? to : [to[0] + 14, to[1] - 12]); await wait(700);
    await flash(to, hit ? 'zap' : 'miss');
    place(d, P.perch); await wait(500); d.remove();
  }
  async function lunge(by, to, hit) {
    const t = tok(by);
    const home = posOf(by);
    if (t) place(t, hit ? near(to, -6, 4) : near(to, -16, 10));
    await wait(600);
    await flash(to, hit ? 'hit' : 'miss');
    if (t) place(t, home);
  }

  // --- fights (PLAN-CORE-LOOP.md, slice 6b) ---------------------------------------------------
  // The guards stand across from the crew, everyone carries a three-segment health bar, and each
  // moment of a round plays in the order the feed reports it. Decoration like the rest of the plan:
  // the feed has every number. hpNow holds what's drawn ('g1' for a guard, an operative's id).
  const SEG = 3;
  const foes = new Map();
  const hpNow = new Map();
  const foePos = (n) => [here[0] + 28 + ((n - 1) % 2) * 8, here[1] - 14 + (n - 1) * 12];
  const hostOf = (key) => (key.startsWith('g') ? foes.get(Number(key.slice(1))) : tok(key));
  function setHp(key, hp, max) {
    const host = hostOf(key);
    if (!host) return;
    hpNow.set(key, [hp, max]);
    let bar = host.querySelector('.sp-hp');
    if (!bar) {
      bar = el('g', { class: 'sp-hp' });
      for (let i = 0; i < SEG; i++) bar.append(el('rect', { x: -7 + i * 5, y: 9, width: 4, height: 2 }));
      host.append(bar);
    }
    const lit = hp <= 0 ? 0 : Math.ceil((SEG * hp) / max);
    [...bar.children].forEach((r, i) => r.classList.toggle('is-on', i < lit));
    bar.classList.toggle('is-low', hp / max < 0.5);
    bar.classList.toggle('is-crit', hp / max < 0.25);
  }
  const hurtBy = (key, d) => { const [hp, max] = hpNow.get(key) ?? [0, 1]; setHp(key, Math.max(0, Math.min(max, hp - d)), max); return hpNow.get(key)[0]; };
  /** Put the fight on the plan as the state has it: guards, bars, anyone down. */
  function showFight({ guards, runners }) {
    for (const g of guards) {
      if (!foes.has(g.n)) { const node = spawn(foePos(g.n), 'sp-enemy sp-enemy--guard', String(g.n)); foes.set(g.n, node); }
      const node = foes.get(g.n);
      setHp(`g${g.n}`, g.hp, g.max);
      if (g.out && !node.classList.contains('is-gone')) node.classList.add('is-dead');
    }
    for (const r of runners) { setHp(r.id, r.hp, r.max); tok(r.id)?.classList.toggle('is-down', r.down); }
  }
  function clearFight() {
    for (const node of foes.values()) node.remove();
    foes.clear();
    hpNow.clear();
    tokens.querySelectorAll('.sp-hp').forEach((b) => b.remove());
  }
  async function bolt(from, to, hit) {
    const l = el('line', { class: 'sp-shot', x1: from[0], y1: from[1], x2: to[0] + (hit ? 0 : 8), y2: to[1] + (hit ? 0 : -6) });
    fx.append(l);
    await wait(260);
    await flash(to, hit ? 'hit' : 'miss');
    l.remove();
  }
  /** One moment of a round (core/feed.js cue.battle.lines). */
  async function moment(l) {
    const foeAt = l.guard ? foePos(l.guard) : here;
    const key = `g${l.guard}`;
    if (l.kind === 'overwatch') {
      await (l.kit === 'drone' ? drone(foeAt, l.success) : shot(foeAt, l.success));
      if (l.success && hurtBy(key, l.damage) <= 0) foes.get(l.guard)?.classList.add('is-dead');
    } else if (l.kind === 'shoot') {
      await bolt(posOf(l.actor), foeAt, l.success);
      if (l.success && hurtBy(key, l.damage) <= 0) foes.get(l.guard)?.classList.add('is-dead');
    } else if (l.kind === 'guard') {
      const to = posOf(l.targetId);
      await bolt(foeAt, to, l.success && l.damage > 0);
      if (l.damage && hurtBy(l.targetId, l.damage) <= 0) tok(l.targetId)?.classList.add('is-down');
    } else if (l.kind === 'talk') {
      ring(foeAt, l.success);
      await wait(500);
      if (l.success) foes.get(l.guard)?.classList.add('is-gone');
    } else if (l.kind === 'flee') {
      const node = foes.get(l.guard);
      if (node) { place(node, [foeAt[0] + 40, foeAt[1] - 20]); node.classList.add('is-gone'); }
      await wait(500);
    } else if (l.kind === 'lights') {
      await flash(here, l.success ? 'zap' : 'miss');
    } else if (l.kind === 'stabilise' || l.kind === 'patch') {
      ring(posOf(l.targetId), l.success);
      if (l.success && l.heal) hurtBy(l.targetId, -l.heal);
      if (l.success && l.kind === 'stabilise') tok(l.targetId)?.classList.remove('is-down');
      await wait(500);
    } else if (l.kind === 'van') {
      ring(tok(l.actor) ? posOf(l.actor) : P.van, l.success);
      await wait(500);
    } else if (l.kind === 'ambush') {
      ring(here, true);
      await wait(500);
    }
  }

  // Guards on their posts: the guards the run will meet (core/battle.js guardPosts), waiting in their
  // zone with how many there are, until the crew comes to them. One token per incident, keyed by its
  // step in the queue; a post whose moment has come fades out (the incident or the fight takes over).
  const postNodes = new Map();
  function setPosts(list) {
    const want = new Set(list.map((p) => p.step));
    for (const [step, node] of postNodes) {
      if (want.has(step)) continue;
      node.classList.add('is-gone');
      setTimeout(() => node.remove(), 600);
      postNodes.delete(step);
    }
    const nth = {};
    for (const p of list) {
      const i = (nth[p.zone] = (nth[p.zone] ?? -1) + 1);
      const spot = site.posts?.[p.zone];
      if (!spot || postNodes.has(p.step)) continue;
      const node = spawn([spot[0] + i * 15, spot[1]], 'sp-enemy sp-enemy--post', String(p.guards));
      node.setAttribute('aria-hidden', 'true');
      postNodes.set(p.step, node);
    }
  }

  return {
    /** The guards waiting on their posts (core/battle.js guardPosts). */
    posts: setPosts,
    /** A fight on the plan: the guards appear (start), a round plays out, pulling back or the end clears it. */
    async fight(c) {
      if (c.phase === 'start') { clearFight(); showFight(c); await wait(500); return; }
      if (c.phase === 'end') { await wait(250); clearFight(); return; }
      for (const l of c.lines ?? []) await moment(l);
      showFight(c); // whatever the moments left out, as the state has it
      if (c.phase === 'retreat') { await wait(300); clearFight(); }
    },
    /** The fight as it stands, drawn at once (a page that mounts mid-fight). */
    syncFight: (c) => (c ? showFight(c) : clearFight()),
    /** Walk the group into a zone and pan the camera there. */
    async enter(zone) {
      panTo(zone);
      const path = PATHS[zone];
      if (!path) return;
      for (const pt of path.slice(1)) { moveGroup(pt); await wait(420); }
    },
    /** Play one feed card's moment (core/feed.js cue). */
    async play(cue) {
      if (!cue) return;
      if (cue.battle) return this.fight(cue.battle);
      if (cue.standby) { if (cue.rescued) await this.leave(cue.rescued); await this.join(cue.standbyOp); return; }
      if (cue.crisis || cue.decision || cue.critical) { const at = here; if (cue.actor) ring(posOf(cue.actor), cue.success !== false); await pulse(at); return; }
      if (!cue.incident) return;
      const me = cue.actor ? posOf(cue.actor) : here;
      const id = cue.incident;
      let foe = null; let npc = null; let torch = null;
      if (['guard', 'backup', 'hold'].includes(id)) { foe = spawn(near(me), 'sp-enemy', '!'); await wait(80); place(foe, near(me, 8, -5)); }
      else if (id === 'patrol') {
        const g = near(me, 30, -20);
        foe = spawn(g, 'sp-enemy sp-enemy--patrol', '•');
        const a = Math.atan2(me[1] - g[1], me[0] - g[0]) * 180 / Math.PI;
        torch = el('g', { class: 'sp-torch' }); torch.append(el('path', { d: 'M0 0 L34 -9 L34 9 Z' }));
        torch.style.transform = `translate(${g[0]}px, ${g[1]}px) rotate(${a + 35}deg)`;
        fx.append(torch);
        torch.dataset.aim = `translate(${g[0]}px, ${g[1]}px) rotate(${a}deg)`;
      } else if (['checkpoint', 'staff', 'mark'].includes(id)) npc = spawn(near(me, 16, -10), 'sp-npc', '?');
      else if (id === 'camera') npc = spawn(near(me, 26, -18), 'sp-cam', '◉');
      else if (id === 'sweep') { npc = spawn(near(me, 30, -22), 'sp-cam', '✦'); await wait(60); place(npc, near(me, 14, -12)); }
      await wait(500);
      const cleanup = () => setTimeout(() => { foe?.remove(); npc?.remove(); torch?.remove(); }, 900);
      if (cue.success) {
        if (foe && id === 'patrol') { place(foe, near(me, 60, -40)); foe.classList.add('is-gone'); } else if (foe) { await flash(near(me, 4, -2)); foe.classList.add('is-dead'); }
        torch?.classList.add('is-gone'); npc?.classList.add('is-gone');
        if (!foe) ring(me, true);
        cleanup();
        return;
      }
      if (torch) { torch.style.transform = torch.dataset.aim; torch.classList.add('is-caught'); }
      npc?.classList.add('is-alarmed');
      if (!foe) ring(me, false);
      const t = tok(cue.actor);
      t?.classList.add('is-cornered');
      if (cue.save) {
        if (foe && id === 'patrol') place(foe, near(me, 8, -5));
        await wait(400);
        const target = foe ? near(me, 8, -5) : me;
        if (cue.save.via === 'overwatch') await (cue.save.kit === 'drone' ? drone(target, cue.save.success) : shot(target, cue.save.success));
        else if (cue.save.by) await lunge(cue.save.by, target, cue.save.success);
        if (cue.save.success) foe?.classList.add('is-dead');
      } else if (foe) await flash(near(me, 4, -2));
      t?.classList.remove('is-cornered');
      if (cue.hurt) t?.classList.add(cue.hurt === 'serious' ? 'is-down' : 'is-hit');
      else if (!cue.save?.success && cue.danger) await pulse(here, 900);
      cleanup();
    },
    /** Standby comes in from the van and joins the group (slice 3). */
    async join(op) {
      if (!op || team.some((o) => o.id === op.id)) return;
      if (!tok(op.id)) addToken(op, VAN_SPOT.standby);
      team.push(op);
      await wait(60);
      moveGroup(here);
      await wait(500);
    },
    /** Someone is taken back to the van (a rescue). */
    async leave(id) {
      const i = team.findIndex((o) => o.id === id);
      if (i < 0) return;
      team.splice(i, 1);
      const t = tok(id);
      if (t) place(t, VAN_SPOT.out);
      moveGroup(here);
      await wait(500);
    },
    /** Mark someone hurt (drawn on mount from the state). */
    hurt(id, severity) { tok(id)?.classList.add(severity === 'serious' ? 'is-down' : 'is-hit'); },
    alarm: (on) => { alarm.setAttribute('cx', here[0]); alarm.setAttribute('cy', here[1]); alarm.classList.toggle('is-on', on); },
    full: () => panTo('full'),
  };
}
