// Ping (tech special: shockwave, then bolts to each target).
(function () {
  const { wait, tween, lerp, P, ring, sparks, float, shake, dmg, bars, ease, el, grow, fade, glow, bolt } = Kit;
  const T = ['g1', 'g3', 'g4'], D = [6, 6, 6];
  const hurt = (u, i) => { const b = P(u, T[i]); sparks(u, b, '#b8fff6', 6, 9); dmg(u, T[i], D[i]); float(u, b, '−' + D[i], '#b8fff6'); shake(u, T[i], 220); };
  Kit.ability({
    id: 'ping', name: 'Ping',
    rules: 'A tech’s special: hits up to 3 enemies in the rules’ order, each its own attack roll, all from the star (data/fightLooks.js ping).',
    decided: "Shockwave, then jagged lightning bolts (fs-lightning) instead of straight lines. Built.",
    variants: [
      { id: 'now', tag: 'Now', name: 'Shockwave + thin bolts', note: 'One ring, then quick thin bolts from the star.',
        async play(u, svg) { bars(svg, true, 'JOSS · PING'); ring(u, P(u, 'J'), '#3de8d8', 230, 650, 1.2); await wait(700); for (let i = 0; i < 3; i++) { await bolt(u, P(u, 'J'), P(u, T[i]), '#b8fff6', 140, 1.2); hurt(u, i); await wait(70); } await wait(600); bars(svg, false); } },
      { id: 'web', tag: 'Proposal', name: 'Network web', note: 'Dashed links reach every target at once and light up as a web, then a pulse runs down each link in order and each target takes its hit as the pulse arrives.',
        async play(u, svg) { bars(svg, true, 'JOSS · PING'); const J = P(u, 'J'); glow(u, 'J', '#3de8d8', 700); await wait(700);
          const ls = await Promise.all(T.map((t) => grow(u, J, P(u, t), 450, { stroke: '#3de8d8', 'stroke-width': 1, 'stroke-dasharray': '3 3', opacity: 0.8 }))); T.forEach((t) => { const b = P(u, t); const n = el('circle', { cx: b[0], cy: b[1], r: 13, fill: 'none', stroke: '#3de8d8', 'stroke-dasharray': '2 3' }, u.fx); setTimeout(() => n.remove(), 2600 * Kit.st.S); });
          await wait(350);
          for (let i = 0; i < 3; i++) { ls[i].setAttribute('stroke', '#fff'); ls[i].setAttribute('stroke-dasharray', ''); ls[i].setAttribute('stroke-width', 2); await bolt(u, J, P(u, T[i]), '#b8fff6', 260, 3); hurt(u, i); await wait(120); }
          await wait(500); ls.forEach((l) => fade(l, 500)); await wait(500); bars(svg, false); } },
      { id: 'scan', tag: 'Proposal', name: 'Scan, then strike', note: 'A rotating radar sweep from the star; each target gets a bracket and a number as the sweep passes. Then the bolts follow in that order. You read the order before it plays.',
        async play(u, svg) { bars(svg, true, 'JOSS · PING'); const J = P(u, 'J'); const wedge = el('path', {}, u.fx); const ang = (t) => { const a0 = -1.1 + t * 2; const a1 = a0 + 0.35; return `M${J[0]} ${J[1]} L${J[0] + Math.cos(a0) * 280} ${J[1] + Math.sin(a0) * 280} L${J[0] + Math.cos(a1) * 280} ${J[1] + Math.sin(a1) * 280}Z`; };
          wedge.setAttribute('fill', 'rgba(61,232,216,.25)'); const found = [];
          await tween(1100, (t) => { wedge.setAttribute('d', ang(t)); const a = -1.1 + t * 2 + 0.17; T.forEach((id, i) => { if (found[i]) return; const b = P(u, id); const aa = Math.atan2(b[1] - J[1], b[0] - J[0]); if (aa <= a) { found[i] = true; const g = el('g', { transform: `translate(${b[0]} ${b[1]})` }, u.fx); el('path', { d: 'M-13 -6V-13H-6M13 -6V-13H6M-13 6V13H-6M13 6V13H6', fill: 'none', stroke: '#3de8d8', 'stroke-width': 1.5 }, g); el('text', { class: 'tag-svg', x: 16, y: -14, fill: '#3de8d8' }, g).textContent = found.filter(Boolean).length; setTimeout(() => g.remove(), 2400 * Kit.st.S); } }); });
          wedge.remove(); await wait(300); for (let i = 0; i < 3; i++) { await bolt(u, J, P(u, T[i]), '#b8fff6', 200, 2); hurt(u, i); await wait(110); } await wait(500); bars(svg, false); } },
    ],
  });
})();
