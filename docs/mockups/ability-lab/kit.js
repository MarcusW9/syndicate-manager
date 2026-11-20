// Ability Lab kit (2026-11-20). Shared helpers for ability mockups. Picture only: nothing here touches the game.
// An ability file calls Kit.ability({...}) once; ability-lab.html draws a card per variant. See ../ABILITY-MOCKUPS.md.
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const el = (n, a = {}, p) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); if (p) p.append(e); return e; };
  const st = { S: 1, STEP: false };
  const wait = (ms) => new Promise((r) => setTimeout(r, ms * st.S));
  const tapWait = (svg) => (st.STEP ? new Promise((r) => { const h = () => { svg.removeEventListener('click', h); r(); }; svg.addEventListener('click', h); }) : Promise.resolve());
  const ease = { lin: (t) => t, io: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2), out: (t) => 1 - Math.pow(1 - t, 3), in: (t) => t * t * (1.4 - 0.4 * t) };
  const tween = (ms, fn, e = ease.lin) => new Promise((res) => { const t0 = performance.now(), d = ms * st.S; const f = (now) => { const t = Math.max(0, Math.min(1, (now - t0) / d)); fn(e(t), t); t < 1 ? requestAnimationFrame(f) : res(); }; requestAnimationFrame(f); });
  const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  const arcPt = (a, b, bow, t) => { const m = lerp(a, b, 0.5), dx = b[0] - a[0], dy = b[1] - a[1], c = [m[0] - dy * bow, m[1] + dx * bow]; return [(1 - t) * (1 - t) * a[0] + 2 * (1 - t) * t * c[0] + t * t * b[0], (1 - t) * (1 - t) * a[1] + 2 * (1 - t) * t * c[1] + t * t * b[1]]; };

  // The standard scene: four crew bottom-left, four foes top-right, three bits of cover. Same on every card so variants compare fairly.
  const CREW = { K: [50, 178, 'Kade'], M: [100, 204, 'Mara'], J: [38, 122, 'Joss'], V: [112, 152, 'Vex'] };
  const FOES = { g1: [272, 52, 'A'], g2: [312, 104, 'B'], g3: [250, 112, 'C'], g4: [300, 164, 'D'] };
  const COVER = [[168, 92, 10, 52], [206, 158, 44, 10], [228, 60, 10, 36]];
  const NAME = { g1: 'Guard A', g2: 'Guard B', g3: 'Guard C', g4: 'Guard D', K: 'Kade', M: 'Mara', J: 'Joss', V: 'Vex' };
  const COL = (id) => (CREW[id] ? '#3de8d8' : '#ff8a98');

  function scene(svg, opts = {}) {
    svg.innerHTML = '';
    const u = { svg, tok: {} };
    const back = el('g', {}, svg);
    for (const c of COVER) el('rect', { class: 'cover', x: c[0], y: c[1], width: c[2], height: c[3] }, back);
    u.fx0 = el('g', {}, svg); const toks = el('g', {}, svg); u.fx = el('g', {}, svg);
    const mk = (id, [x, y, l], cls) => {
      const g = el('g', { class: 'tok ' + cls, transform: `translate(${x} ${y})` }, toks);
      el('circle', { class: 'b', r: 10 }, g); el('text', {}, g).textContent = l[0];
      el('rect', { x: -9, y: 13, width: 18, height: 2.5, fill: '#222' }, g);
      const hp = el('rect', { x: -9, y: 13, width: 18, height: 2.5, fill: cls === 'crew' ? '#3de8d8' : '#ff3d5f' }, g);
      u.tok[id] = { g, pos: [x, y], hp, hpv: 1 };
    };
    for (const k in CREW) mk(k, CREW[k], 'crew');
    for (const k in FOES) mk(k, FOES[k], 'foe');
    if (opts.hurt) for (const id in opts.hurt) setHp(u, id, opts.hurt[id]);
    return u;
  }
  const P = (u, id) => u.tok[id].pos;
  function setHp(u, id, v) { const o = u.tok[id]; o.hpv = Math.max(0, Math.min(1, v)); o.hp.setAttribute('width', 18 * o.hpv); }
  const dmg = (u, id, v) => setHp(u, id, u.tok[id].hpv - v / 40);
  const heal = (u, id, v) => setHp(u, id, u.tok[id].hpv + v / 40);
  const focus = (u, ids) => { for (const k in u.tok) { const g = u.tok[k].g; g.style.transition = 'opacity .2s'; g.style.opacity = !ids || ids.includes(k) ? 1 : 0.3; } };
  const gone = (e, ms) => { u_fx(e); setTimeout(() => e.remove(), ms * st.S); return e; };
  let CUR = null; const u_fx = (e) => CUR.fx.append(e);
  const use = (u) => { CUR = u; return u; };

  const float = (u, at, text, color = '#ff8a98') => { const t = el('text', { class: 'float', x: at[0], y: at[1] - 14, fill: color }, u.fx); t.textContent = text; tween(900, (e) => { t.setAttribute('y', at[1] - 14 - e * 10); t.style.opacity = 1 - Math.max(0, (e - 0.7) / 0.3); }).then(() => t.remove()); };
  const label = (u, at, text, color = '#f2d541') => { const t = el('text', { class: 'tag-svg', x: at[0], y: at[1], fill: color }, u.fx); t.textContent = text; return t; };
  const ring = (u, at, color, r1 = 16, ms = 420, w = 2) => { const c = el('circle', { cx: at[0], cy: at[1], r: 3, fill: 'none', stroke: color, 'stroke-width': w }, u.fx); tween(ms, (e) => { c.setAttribute('r', 3 + (r1 - 3) * e); c.style.opacity = 1 - e; }).then(() => c.remove()); };
  const sparks = (u, at, color, n = 6, len = 10, ms = 360) => { for (let i = 0; i < n; i++) { const a = (Math.PI * 2 * i) / n + Math.random() * 0.5; const l = el('line', { stroke: color, 'stroke-width': 1.4, 'stroke-linecap': 'round' }, u.fx); tween(ms, (e) => { const r0 = 3 + len * e * 0.4, r1 = 3 + len * e; l.setAttribute('x1', at[0] + Math.cos(a) * r0); l.setAttribute('y1', at[1] + Math.sin(a) * r0); l.setAttribute('x2', at[0] + Math.cos(a) * r1); l.setAttribute('y2', at[1] + Math.sin(a) * r1); l.style.opacity = 1 - e; }, ease.out).then(() => l.remove()); } };
  const shake = (u, id, ms = 300) => { const o = u.tok[id]; const [x, y] = o.pos; return tween(ms, (e) => { o.g.setAttribute('transform', `translate(${x + (1 - e) * 3 * Math.sin(e * 40)} ${y})`); }).then(() => o.g.setAttribute('transform', `translate(${x} ${y})`)); };
  const bolt = (u, a, b, color, ms, w = 1.4) => { const l = el('line', { x1: a[0], y1: a[1], x2: a[0], y2: a[1], stroke: color, 'stroke-width': w, 'stroke-linecap': 'round' }, u.fx); return tween(ms, (e) => { const h = lerp(a, b, e), t = lerp(a, b, Math.max(0, e - 0.35)); l.setAttribute('x1', t[0]); l.setAttribute('y1', t[1]); l.setAttribute('x2', h[0]); l.setAttribute('y2', h[1]); }).then(() => l.remove()); };
  // A line that grows from a to b and stays (returns the element after it has grown).
  const grow = async (u, a, b, ms, attrs = {}, e = ease.out) => { const l = el('line', { x1: a[0], y1: a[1], x2: a[0], y2: a[1], stroke: '#fff', 'stroke-width': 1.5, 'stroke-linecap': 'round', ...attrs }, u.fx); await tween(ms, (t) => { const h = lerp(a, b, t); l.setAttribute('x2', h[0]); l.setAttribute('y2', h[1]); }, e); return l; };
  const fade = (e, ms = 400) => tween(ms, (t) => { e.style.opacity = 1 - t; }).then(() => e.remove());
  // A dot that follows a curved path from a to b.
  const orb = async (u, a, b, ms, attrs = {}, bow = 0.25, e = ease.io) => { const d = el('circle', { r: 3, fill: '#fff', ...attrs }, u.fx); await tween(ms, (t) => { const p = arcPt(a, b, bow, t); d.setAttribute('cx', p[0]); d.setAttribute('cy', p[1]); }, e); d.remove(); };
  const glow = (u, id, color, ms = 600) => { const p = P(u, id); const c = el('circle', { cx: p[0], cy: p[1], r: 14, fill: 'none', stroke: color, 'stroke-width': 2 }, u.fx); tween(ms, (e) => { c.style.opacity = 0.5 + 0.5 * Math.sin(e * Math.PI); c.setAttribute('r', 14 + 3 * Math.sin(e * Math.PI)); }).then(() => c.remove()); };
  // Letterbox bars with a title (the special-move frame the game already uses).
  function bars(svg, on, title = '') { let b = svg.querySelector('.lb'); if (!b) b = el('g', { class: 'lb' }, svg); b.innerHTML = ''; if (!on) return; const t = el('rect', { x: 0, y: 0, width: 360, height: 0, fill: '#000' }, b), m = el('rect', { x: 0, y: 230, width: 360, height: 0, fill: '#000' }, b); tween(300, (e) => { t.setAttribute('height', 20 * e); m.setAttribute('y', 230 - 20 * e); m.setAttribute('height', 20 * e); }); el('text', { class: 'tag-svg', x: 180, y: 14, style: 'font-size:11px;fill:#f2d541' }, b).textContent = title; }
  const dim = (u, on) => u.svg.querySelectorAll('.cover').forEach((c) => (c.style.opacity = on ? 0.4 : 1));

  // An extra token (an arrival): Kit.spawn(u, 'E', [x, y], 'foe') adds it to the scene and returns { g, pos }, movable with Kit.moveTo.
  function spawn(u, label, at, cls = 'foe') { const g = el('g', { class: 'tok ' + cls, transform: `translate(${at[0]} ${at[1]})` }, u.fx0.parentNode.insertBefore(el('g', {}), u.fx)); el('circle', { class: 'b', r: 10 }, g); el('text', {}, g).textContent = label; return { g, pos: at }; }
  const moveTo = (o, to, ms, e = ease.io) => { const from = o.pos; o.pos = to; return tween(ms, (t) => { const p = lerp(from, to, t); o.g.setAttribute('transform', `translate(${p[0]} ${p[1]})`); }, e); };
  // An armour plate on a foe: two arcs round the token (the same shape the game draws). Returns the group; plate.split() cracks it open.
  function plate(u, id, color = '#3de8d8') { const [x, y] = P(u, id); const g = el('g', { transform: `translate(${x} ${y})` }, u.fx); const top = el('path', { d: 'M-12 -4A12.5 12.5 0 0 1 12 -4', fill: 'none', stroke: color, 'stroke-width': 2, 'stroke-linecap': 'round' }, g), bot = el('path', { d: 'M-12 4A12.5 12.5 0 0 0 12 4', fill: 'none', stroke: color, 'stroke-width': 2, 'stroke-linecap': 'round' }, g); g.top = top; g.bot = bot; return g; }

  // ---- the lab: registry, cards, picks ----
  const abilities = [];
  const ability = (a) => abilities.push(a);
  const picks = (() => { try { return JSON.parse(localStorage.getItem('ability-lab-picks') || '{}'); } catch (e) { return {}; } })();
  const savePicks = () => { try { localStorage.setItem('ability-lab-picks', JSON.stringify(picks)); } catch (e) { /* the sandbox may refuse */ } };
  const h = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const busy = new Set();

  function render(root) {
    const index = h('div', 'chips'); root.append(index);
    for (const a of abilities) {
      const chip = h('a', 'chip-link', a.name); chip.href = '#' + a.id; index.append(chip);
      const sec = h('section'); sec.id = a.id; root.append(sec);
      sec.append(h('h2', '', a.name), h('p', 'rules', `<b>In the game:</b> ${a.rules}`));
      if (a.decided) sec.append(h('p', 'decided', `Decided: ${a.decided}`));
      const playAll = h('button', '', 'Play all ' + a.name); sec.append(playAll);
      const plays = [];
      for (const v of a.variants) {
        const card = h('div', 'card'); sec.append(card);
        card.append(h('span', 'tag', v.tag || 'Proposal'), h('h3', '', v.name));
        const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 360 230'); card.append(svg);
        const row = h('div', 'row'); card.append(row);
        const play = h('button', '', 'Play'); const pick = h('button', 'pickbtn', 'Pick this'); row.append(play, pick);
        if (v.note) card.append(h('div', 'note', v.note));
        const key = a.id + ':' + v.id;
        const paint = () => { pick.classList.toggle('on', picks[a.id] === v.id); pick.textContent = picks[a.id] === v.id ? 'Picked ✓' : 'Pick this'; };
        pick.onclick = () => { picks[a.id] = picks[a.id] === v.id ? undefined : v.id; if (!picks[a.id]) delete picks[a.id]; savePicks(); sec.querySelectorAll('.pickbtn').forEach((b) => b._paint()); summary(); };
        pick._paint = paint; paint();
        const run = async () => { if (busy.has(key)) return; busy.add(key); play.disabled = true; try { const u = use(scene(svg, a.scene)); await v.play(u, svg); } finally { busy.delete(key); play.disabled = false; } };
        play.onclick = run; plays.push(run); use(scene(svg, a.scene));
      }
      playAll.onclick = async () => { for (const p of plays) { await p(); await wait(500); } };
    }
    const sum = h('div', 'card'); sum.append(h('h3', '', 'Your picks'));
    const out = h('pre', 'picks'); const copy = h('button', '', 'Copy picks'); sum.append(out, copy); root.append(sum);
    const summary = () => { out.textContent = abilities.map((a) => `${a.id}: ${picks[a.id] ?? '(none yet)'}`).join('\n'); };
    copy.onclick = () => { try { navigator.clipboard.writeText(out.textContent); copy.textContent = 'Copied'; } catch (e) { copy.textContent = 'Select the text above'; } };
    summary();
  }
  window.Kit = { spawn, moveTo, plate, el, st, wait, tapWait, ease, tween, lerp, arcPt, scene, P, setHp, dmg, heal, focus, use, float, label, ring, sparks, shake, bolt, grow, fade, orb, glow, bars, dim, gone, NAME, COL, ability, render, abilities, CREW, FOES };
})();
