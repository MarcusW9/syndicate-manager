// Ricochet (move, build slot 'move'). Decided 2026-11-20: the comet. Kept as the worked example of an ability file.
(function () {
  const { Kit } = window; const { wait, tween, lerp, P, ring, sparks, float, shake, dmg, bars, ease, el, grow, fade } = Kit;
  const RT = ['g3', 'g1', 'g2'], RD = [9, 12, 8];
  const route = (u) => [P(u, 'K'), ...RT.map((k) => P(u, k))];
  const land = (u, b, i, big = true) => { sparks(u, b, '#fff3b0', 8, 13); ring(u, b, '#ffd860', 22, 460, 2.4); Kit.dmg(u, RT[i], RD[i]); float(u, b, '−' + RD[i], '#ffb0b8'); shake(u, RT[i], 260); };
  const head = (u) => el('circle', { r: 2.8, fill: '#fff', style: 'filter:drop-shadow(0 0 4px #ffe680) drop-shadow(0 0 8px #ffb040)' }, u.fx);
  Kit.ability({
    id: 'ricochet', name: 'Ricochet',
    rules: 'One shot that bounces to up to 3 enemies in the rules’ order; each bounce is its own attack roll (core/fight.js burst).',
    decided: 'Comet trail (shipped in src/ui/fightstage.js; spotlight on the star and targets).',
    variants: [
      { id: 'now', tag: 'Before', name: 'Dot on a line', note: 'The old look: a white dot on a straight line, a spark on landing.',
        async play(u) { let from = P(u, 'K'); for (let i = 0; i < 3; i++) { const to = P(u, RT[i]); const l = el('line', { x1: from[0], y1: from[1], x2: to[0], y2: to[1], stroke: '#fff3b0', 'stroke-width': 1.6 }, u.fx); const d = el('circle', { r: 1.6, fill: '#fff' }, u.fx); await tween(530, (e) => { const p = lerp(from, to, e); d.setAttribute('cx', p[0]); d.setAttribute('cy', p[1]); }); d.remove(); sparks(u, to, '#fff3b0', 4, 5, 250); dmg(u, RT[i], RD[i]); setTimeout(() => l.remove(), 260); from = to; await wait(240); } } },
      { id: 'comet', tag: 'Chosen', name: 'Comet trail + numbered impacts', note: 'Glowing head, trail that stays and dims, ring, sparks, numbered badge at each landing, then the whole route glows.',
        async play(u, svg) {
          bars(svg, true, 'KADE · RICOCHET'); const r = route(u); Kit.glow(u, 'K', '#f2d541', 700); await wait(750);
          const hd = head(u), trails = [];
          for (let i = 0; i < 3; i++) { const a = r[i], b = r[i + 1]; const tl = el('line', { x1: a[0], y1: a[1], x2: a[0], y2: a[1], stroke: '#ffd860', 'stroke-width': 2.4, 'stroke-linecap': 'round', style: 'filter:drop-shadow(0 0 3px #ffb040)' }, u.fx); trails.push(tl);
            await tween(620, (e) => { const h = lerp(a, b, e); hd.setAttribute('cx', h[0]); hd.setAttribute('cy', h[1]); tl.setAttribute('x2', h[0]); tl.setAttribute('y2', h[1]); }, ease.in);
            land(u, b, i); const g = el('g', {}, u.fx); el('circle', { cx: b[0] + 12, cy: b[1] - 12, r: 6.5, fill: '#f2d541' }, g); const t = el('text', { class: 'tag-svg', x: b[0] + 12, y: b[1] - 11.5, style: 'fill:#000;stroke:none;font-size:9px;dominant-baseline:central' }, g); t.textContent = i + 1; trails.forEach((x, j) => { x.style.opacity = j === i ? 1 : 0.55; }); await wait(i < 2 ? 300 : 200); }
          hd.remove(); trails.forEach((t) => { t.setAttribute('stroke', '#fff3b0'); t.style.opacity = 1; }); await wait(900); trails.forEach((t) => fade(t, 500)); await wait(520); bars(svg, false); } },
      { id: 'route', tag: 'Proposal', name: 'Plot the route, then fire', note: 'Targets lock on one at a time with a reticle and a number, joined by a dashed route. Then the round runs it. Longest (about 4.5s).',
        async play(u, svg) {
          bars(svg, true, 'KADE · RICOCHET'); const r = route(u); Kit.glow(u, 'K', '#f2d541', 600); await wait(600); const dash = [], marks = [];
          for (let i = 0; i < 3; i++) { const a = r[i], b = r[i + 1]; dash.push(await grow(u, a, b, 330, { stroke: '#f2d541', 'stroke-width': 1.2, 'stroke-dasharray': '4 4', opacity: 0.7 }));
            const g = el('g', { transform: `translate(${b[0]} ${b[1]})` }, u.fx); const rt = el('g', {}, g); el('circle', { r: 15, fill: 'none', stroke: '#f2d541', 'stroke-width': 1.4, 'stroke-dasharray': '6 4' }, rt); el('path', { d: 'M-19 0H-12M12 0H19M0 -19V-12M0 12V19', stroke: '#f2d541', 'stroke-width': 1.4 }, rt); el('text', { class: 'tag-svg', x: 15, y: -15, style: 'font-size:10px;fill:#f2d541' }, g).textContent = i + 1; marks.push({ g, rt });
            tween(360, (e) => { rt.setAttribute('transform', `rotate(${(1 - e) * 120}) scale(${1 + (1 - e) * 0.7})`); g.style.opacity = e; }, ease.out); await wait(200); }
          await wait(380); const hd = head(u);
          for (let i = 0; i < 3; i++) { const a = r[i], b = r[i + 1]; await tween(560, (e) => { const h = lerp(a, b, e); hd.setAttribute('cx', h[0]); hd.setAttribute('cy', h[1]); }, ease.io); const l = dash[i]; l.setAttribute('stroke', '#fff3b0'); l.setAttribute('stroke-dasharray', ''); l.setAttribute('stroke-width', 2.2); l.setAttribute('opacity', 1); land(u, b, i); tween(300, (e) => { marks[i].rt.setAttribute('transform', `scale(${1 - e * 0.5})`); marks[i].g.style.opacity = 1 - e * 0.6; }); await wait(260); }
          hd.remove(); await wait(700); bars(svg, false); } },
      { id: 'kiss', tag: 'Proposal', name: 'Cover kiss', note: 'The round clips the edge of cover on the way, with a spark and a tink ring at the kink.',
        async play(u, svg) {
          bars(svg, true, 'KADE · RICOCHET'); const T = RT.map((k) => P(u, k)); const r = [P(u, 'K'), [168, 112], T[0], [236, 78], T[1], T[2]]; const kink = new Set([1, 3]); Kit.glow(u, 'K', '#f2d541', 700); await wait(700);
          const hd = head(u), trail = []; let n = 0;
          for (let i = 0; i < r.length - 1; i++) { const a = r[i], b = r[i + 1]; const tl = el('line', { x1: a[0], y1: a[1], x2: a[0], y2: a[1], stroke: '#ffd860', 'stroke-width': 2, 'stroke-linecap': 'round' }, u.fx); trail.push(tl);
            await tween(kink.has(i + 1) ? 380 : 520, (e) => { const h = lerp(a, b, e); hd.setAttribute('cx', h[0]); hd.setAttribute('cy', h[1]); tl.setAttribute('x2', h[0]); tl.setAttribute('y2', h[1]); });
            if (kink.has(i + 1)) { sparks(u, b, '#fff', 6, 8, 300); ring(u, b, '#f2d541', 10, 300, 1.4); await wait(60); } else { land(u, b, n); n++; trail.forEach((t, j) => { t.style.opacity = j === trail.length - 1 ? 1 : 0.5; }); await wait(260); } }
          hd.remove(); trail.forEach((t) => { t.setAttribute('stroke', '#fff3b0'); t.style.opacity = 1; }); await wait(900); trail.forEach((t) => fade(t, 500)); await wait(520); bars(svg, false); } },
    ],
  });
})();
