// The site plan on the watch screen (PLAN-CORE-LOOP.md, slice 2): a generic job site drawn as
// SVG, the crew as tokens that walk zone to zone, and short effects for what happens there
// (guards, patrols, cameras, saves). One plan for every job until districts get their own
// (slice 4). Decoration only: everything shown here is also in the feed as text.

const SVGNS = 'http://www.w3.org/2000/svg';
const W = 360;
const H = 240;

// Points on the plan, and the walk through each zone (core/incidents.js zones: in, inside, target, out).
export const P = { van: [40, 224], road: [106, 224], gate: [106, 196], yard: [106, 135], lane: [186, 135], door: [236, 100], target: [272, 74], perch: [176, 24] };
const PATHS = {
  in: [P.van, P.road, P.gate],
  inside: [P.gate, P.yard, P.lane],
  target: [P.lane, P.door, P.target],
  out: [P.target, P.door, P.lane, P.yard, P.gate, P.road, P.van],
};
const ZONE_END = { start: P.van, in: P.gate, inside: P.lane, target: P.target, out: P.van };
// Camera boxes, all 3:2 like the full view.
const VB = { full: [0, 0, W, H], in: [6, 126, 171, 114], inside: [0, 46, 249, 166], target: [150, 4, 204, 136], out: [0, 0, W, H] };
const pts = (list) => list.map((p) => p.join(',')).join(' ');
const reduced = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const initials = (op) => (op.handle ?? '?').split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();

/** The plan's markup. kit: the overwatch kit (its sight is drawn) or null. */
export function sitePlanSvg({ kit = null } = {}) {
  const cover = [];
  const tones = ['#1b2433', '#2a1d26', '#1d2a24', '#2b2618'];
  // Three rows of cover in the grounds; the middle rows leave the lane from the gate open.
  [[56, false], [96, true], [150, true]].forEach(([y, gap], r) => {
    for (let i = 0; i < 7; i++) {
      const x = 16 + i * 31;
      if (gap && x + 26 > 94 && x < 120) continue;
      cover.push(`<rect class="sp-cover" x="${x}" y="${y}" width="27" height="14" rx="1.5" fill="${tones[(i + r) % 4]}"/>`);
    }
  });
  const sight = !kit ? '' : kit === 'drone'
    ? `<polygon class="sp-sight sp-sight--drone" points="${P.perch.join(',')} 12,194 310,194 310,36"/>`
    : `<polygon class="sp-sight" points="${P.perch.join(',')} 12,194 232,194 232,40"/>`;
  return `<svg class="siteplan" viewBox="${VB.full.join(' ')}" role="img" aria-label="Site plan: the way in through the gate, the grounds inside, the target building, the overwatch perch and the van">
    <rect width="${W}" height="${H}" fill="#0b0d11"/>
    <rect class="sp-road" x="0" y="212" width="${W}" height="28"/><line class="sp-road__line" x1="0" y1="226" x2="${W}" y2="226"/>
    <polyline class="sp-fence" points="8,196 94,196"/><polyline class="sp-fence" points="118,196 352,196"/>
    ${cover.join('')}
    <rect class="sp-building" x="236" y="38" width="72" height="72" rx="2"/><rect class="sp-door" x="233" y="94" width="5" height="12"/>
    ${sight}
    <line class="sp-perch" x1="146" y1="24" x2="206" y2="24"/><line class="sp-perch" x1="150" y1="24" x2="150" y2="40"/><line class="sp-perch" x1="202" y1="24" x2="202" y2="40"/>
    <polyline class="sp-route" points="${pts([...PATHS.in, ...PATHS.inside.slice(1), ...PATHS.target.slice(1)])}"/>
    <circle class="sp-node" cx="${P.gate[0]}" cy="${P.gate[1]}" r="3"/><circle class="sp-node" cx="${P.lane[0]}" cy="${P.lane[1]}" r="3"/>
    <circle class="sp-node sp-node--target" cx="${P.target[0]}" cy="${P.target[1]}" r="4"/><circle class="sp-node sp-node--perch" cx="${P.perch[0]}" cy="${P.perch[1]}" r="4"/>
    <text class="sp-label" x="124" y="206">WAY IN</text><text class="sp-label" x="18" y="140">INSIDE</text>
    <text class="sp-label sp-label--hi" x="252" y="32">TARGET</text><text class="sp-label" x="212" y="20">OVERWATCH</text>
    <text class="sp-label" x="8" y="236">VAN</text>
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

const VAN_SPOT = { wheels: [P.van[0] + 22, P.van[1] + 8], standby: [P.van[0] + 34, P.van[1] + 8], out: [P.van[0] + 46, P.van[1] + 8] }; // beside the van, clear of the group

/**
 * A live plan bound to an <svg> from sitePlanSvg. team: the inside crew [{ id, handle, color }];
 * overwatch: { op, kit } or null; wheels and standby: operatives waiting at the van (slice 3);
 * out: people already back at the van hurt. speed: a function giving the current pace (1 normal, lower faster).
 */
export function bindSitePlan(svg, { team: inside, overwatch = null, wheels = null, standby = null, out = [], zone = 'start', speed = () => 1 }) {
  const team = [...inside];
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

  return {
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
