// Slash (special-move look for blades/reflex gear). Picture only.
(function () {
  const { wait, tween, lerp, P, ring, sparks, float, shake, dmg, bars, ease, el, grow, fade, glow } = Kit;
  const T = ['g4', 'g3', 'g2'], D = [8, 10, 9];
  const cut = (u, b, ang = -40, big = true) => { const g = el('g', { transform: `translate(${b[0]} ${b[1]}) rotate(${ang})` }, u.fx); el('line', { x1: -13, y1: 0, x2: 13, y2: 0, stroke: '#fff', 'stroke-width': big ? 2.4 : 1.6, 'stroke-linecap': 'round' }, g); fade(g, 380); };
  Kit.ability({
    id: 'slash', name: 'Slash',
    rules: 'A melee-style special: hits up to 3 enemies in the rules’ order, each its own attack roll. The star stays in cover; only the picture travels (data/fightLooks.js slash).',
    decided: "Ghost dash + arc, and the star's own token runs to each target and goes home (owner, 2026-11-20). Built in fightstage.js slash().",
    variants: [
      { id: 'now', tag: 'Now', name: 'Ghost dash + arc', note: 'Three faint afterimages along each dash, a small arc where the blade lands.',
        async play(u, svg) { bars(svg, true, 'KADE · STRIKE'); let from = P(u, 'K'); await wait(700);
          for (let i = 0; i < 3; i++) { const to = P(u, T[i]); for (let k = 1; k <= 3; k++) { const at = lerp(from, to, k / 3.4); const g = el('circle', { cx: at[0], cy: at[1], r: 6.5, fill: 'rgba(61,232,216,.18)', stroke: '#3de8d8' }, u.fx); fade(g, 380); await wait(60); }
            await wait(120); cut(u, to, 20, false); sparks(u, to, '#fff', 4, 6); dmg(u, T[i], D[i]); float(u, to, '−' + D[i]); from = to; await wait(180); } await wait(500); bars(svg, false); } },
      { id: 'streak', tag: 'Proposal', name: 'Streak + X-cut + hit-stop', note: 'The dash is a bright streak that stays a moment. Each target gets a crossed X-cut, the whole map freezes for a beat on the cut, then the damage lands.',
        async play(u, svg) { bars(svg, true, 'KADE · STRIKE'); glow(u, 'K', '#3de8d8', 700); await wait(750); let from = P(u, 'K'); const lines = [];
          for (let i = 0; i < 3; i++) { const to = P(u, T[i]); const l = await grow(u, from, to, 260, { stroke: '#b8fff6', 'stroke-width': 4, opacity: 0.9, style: 'filter:drop-shadow(0 0 4px #3de8d8)' }, ease.in); lines.push(l);
            cut(u, to, 40); cut(u, to, -40); await wait(140); sparks(u, to, '#fff', 9, 14); ring(u, to, '#fff', 20, 400); dmg(u, T[i], D[i]); float(u, to, '−' + D[i]); shake(u, T[i], 260); lines.forEach((x, j) => { x.style.opacity = j === i ? 0.9 : 0.35; }); from = to; await wait(280); }
          await wait(400); lines.forEach((l) => fade(l, 500)); await wait(520); bars(svg, false); } },
      { id: 'judge', tag: 'Proposal', name: 'Judgement cut', note: 'The dash is drawn as a thin dotted route, the map dims, then every cut lands at once. A different rhythm: wait, then one big beat. Shortest on screen (about 2.5s).',
        async play(u, svg) { bars(svg, true, 'KADE · STRIKE'); glow(u, 'K', '#3de8d8', 600); await wait(650); let from = P(u, 'K'); const ls = [];
          for (let i = 0; i < 3; i++) { const to = P(u, T[i]); ls.push(await grow(u, from, to, 200, { stroke: '#8fe', 'stroke-width': 1, 'stroke-dasharray': '2 3' })); from = to; }
          Kit.focus(u, ['K', ...T]); await wait(500);
          const flash = el('rect', { x: 0, y: 0, width: 360, height: 230, fill: '#fff', opacity: 0 }, u.fx); await tween(90, (e) => { flash.style.opacity = 0.7 * e; }); flash.style.opacity = 0; flash.remove();
          T.forEach((t, i) => { const b = P(u, t); cut(u, b, 35); cut(u, b, -35); sparks(u, b, '#fff', 8, 14); dmg(u, t, D[i]); float(u, b, '−' + D[i]); shake(u, t, 320); });
          await wait(700); Kit.focus(u, null); ls.forEach((l) => fade(l, 400)); await wait(450); bars(svg, false); } },
    ],
  });
})();
