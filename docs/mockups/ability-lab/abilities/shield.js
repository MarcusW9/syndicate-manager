// Shield (a protector takes a shot meant for an ally: the dome).
(function () {
  const { wait, tween, P, ring, sparks, float, shake, el, grow, fade, glow, bolt } = Kit;
  Kit.ability({
    id: 'shield', name: 'Shield (protect)',
    rules: 'A protector covers an ally: a shot at the ally is taken by the protector’s plates (shieldedBy / dome in fightstage.js).',
    variants: [
      { id: 'now', tag: 'Now', name: 'Dome over the exchange', note: 'A plain dome around the protector, flared when the shot lands.',
        async play(u) { const M = P(u, 'M'); const d = el('circle', { cx: M[0], cy: M[1], r: 18, fill: 'rgba(61,232,216,.12)', stroke: '#3de8d8', 'stroke-width': 1.4 }, u.fx); await wait(400); await bolt(u, P(u, 'g3'), M, '#ff8a98', 300); ring(u, M, '#3de8d8', 26, 400); float(u, M, 'ABSORBED', '#3de8d8'); await wait(500); fade(d, 400); } },
      { id: 'hex', tag: 'Proposal', name: 'Hex plates with impact ripple', note: 'A hex dome snaps up over the protector with a link line to the covered ally; the shot hits the dome at the exact point, the hex cells there light and ripple outward.',
        async play(u) { const M = P(u, 'M'), V = P(u, 'V'); const g = el('g', { transform: `translate(${M[0]} ${M[1]})` }, u.fx);
          const cells = []; for (let r = 0; r < 3; r++) for (let k = 0; k < 6 * r || (r === 0 && k === 0); k++) { const a = r === 0 ? 0 : (Math.PI * 2 * k) / (6 * r), rad = r * 7; const c = el('path', { d: 'M5 0L2.5 4.3H-2.5L-5 0L-2.5 -4.3H2.5Z', transform: `translate(${Math.cos(a) * rad} ${Math.sin(a) * rad})`, fill: 'rgba(61,232,216,.12)', stroke: '#3de8d8', 'stroke-width': .8, opacity: 0 }, g); cells.push({ c, x: Math.cos(a) * rad, y: Math.sin(a) * rad }); }
          const link = await grow(u, M, V, 250, { stroke: '#3de8d8', 'stroke-width': 1, 'stroke-dasharray': '3 3' }); await tween(350, (e) => cells.forEach((c, i) => { c.c.style.opacity = Math.min(1, e * 2 - i / cells.length); }), Kit.ease.out); await wait(250);
          await bolt(u, P(u, 'g3'), [M[0] + 12, M[1] - 6], '#ff8a98', 260); const hit = [12, -6];
          cells.forEach((c) => { const d = Math.hypot(c.x - hit[0], c.y - hit[1]); setTimeout(() => { c.c.setAttribute('fill', 'rgba(255,255,255,.7)'); setTimeout(() => c.c.setAttribute('fill', 'rgba(61,232,216,.12)'), 160 * Kit.st.S); }, d * 14 * Kit.st.S); });
          sparks(u, [M[0] + 12, M[1] - 6], '#fff', 6, 9); float(u, M, 'ABSORBED', '#3de8d8'); shake(u, 'M', 200); await wait(900); fade(g, 400); fade(link, 400); } },
      { id: 'plate', tag: 'Proposal', name: 'Step in front', note: 'The protector slides a few steps toward the line of fire, a bright plate swings up between them and the shooter, the shot is eaten with a big clang ring, then they slide back. Shows that the body moved, not just a bubble.',
        async play(u) { const M = P(u, 'M'), V = P(u, 'V'), S = P(u, 'g3'); const tgt = [V[0] + (S[0] - V[0]) * .12, V[1] + (S[1] - V[1]) * .12 + 12]; const g = u.tok.M.g;
          await tween(320, (e) => { g.setAttribute('transform', `translate(${M[0] + (tgt[0] - M[0]) * e} ${M[1] + (tgt[1] - M[1]) * e})`); }, Kit.ease.out);
          const ang = Math.atan2(S[1] - tgt[1], S[0] - tgt[0]) * 180 / Math.PI; const plate = el('path', { d: 'M0 -13Q9 0 0 13', fill: 'none', stroke: '#3de8d8', 'stroke-width': 3.5, 'stroke-linecap': 'round', transform: `translate(${tgt[0]} ${tgt[1]}) rotate(${ang}) translate(12 0)`, style: 'filter:drop-shadow(0 0 4px #3de8d8)' }, u.fx);
          await wait(300); await bolt(u, S, [tgt[0] + 12, tgt[1]], '#ff8a98', 260); ring(u, tgt, '#3de8d8', 28, 420, 2.6); sparks(u, tgt, '#fff', 7, 10); float(u, tgt, 'ABSORBED', '#3de8d8'); await wait(700); fade(plate, 300);
          await tween(300, (e) => { g.setAttribute('transform', `translate(${tgt[0] + (M[0] - tgt[0]) * e} ${tgt[1] + (M[1] - tgt[1]) * e})`); }, Kit.ease.io); } },
    ],
  });
})();
