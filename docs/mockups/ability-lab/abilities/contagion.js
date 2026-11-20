// Contagion Vector (payload: infection jumps from a fallen body to the next enemy of its group).
(function () {
  const { wait, tween, P, ring, sparks, float, shake, dmg, el, grow, fade, orb, ease, arcPt } = Kit;
  const inf = (u, id) => { const p = P(u, id); return el('circle', { cx: p[0], cy: p[1], r: 13, fill: 'rgba(74,222,128,.15)', stroke: '#4ade80', 'stroke-width': 1.4, 'stroke-dasharray': '3 2' }, u.fx); };
  Kit.ability({
    id: 'contagion', name: 'Contagion jump',
    rules: 'When an infected enemy falls, the infection jumps to the first other enemy of its group that is up, not infected and not immune (spreadFrom in fight.js; spread step in fightstage.js).',
    variants: [
      { id: 'now', tag: 'Now', name: 'Arc and orb', note: 'A green arc and orb from the fallen body to the new host; the host’s ring flares.',
        async play(u) { const a = P(u, 'g3'), b = P(u, 'g4'); const r = inf(u, 'g3'); await wait(400); dmg(u, 'g3', 40); u.tok.g3.g.style.opacity = .3; await orb(u, a, b, 800, { fill: '#4ade80' }, .3); inf(u, 'g4'); ring(u, b, '#4ade80', 22, 450); await wait(500); } },
      { id: 'spores', tag: 'Proposal', name: 'Spore burst', note: 'The body falls and bursts into a cloud of green spores that drift out and the cloud settles on the new host. Infection feels like something airborne, not a laser.',
        async play(u) { const a = P(u, 'g3'), b = P(u, 'g4'); inf(u, 'g3'); await wait(400); dmg(u, 'g3', 40); u.tok.g3.g.style.opacity = .3; sparks(u, a, '#4ade80', 10, 14);
          const n = 9; await Promise.all(Array.from({ length: n }, async (_, i) => { await wait(i * 50); await orb(u, a, [b[0] + (Math.random() - .5) * 16, b[1] + (Math.random() - .5) * 16], 750 + Math.random() * 250, { fill: '#4ade80', r: 1.6 + Math.random() * 1.4, opacity: .85 }, (Math.random() - .5) * .8, ease.io); }));
          ring(u, b, '#4ade80', 22, 450); inf(u, 'g4'); shake(u, 'g4', 260); float(u, b, 'INFECTED', '#4ade80'); await wait(700); } },
      { id: 'veins', tag: 'Proposal', name: 'Veins creeping', note: 'A branching vein line grows from the fallen body to the next host, pulsing; when it connects, the host’s ring spreads inward like a stain. Slower, but you can see the chain (and a second jump would read as a trail).',
        async play(u) { const a = P(u, 'g3'), b = P(u, 'g4'); inf(u, 'g3'); await wait(400); dmg(u, 'g3', 40); u.tok.g3.g.style.opacity = .3;
          const path = el('path', { fill: 'none', stroke: '#4ade80', 'stroke-width': 1.6, 'stroke-linecap': 'round', style: 'filter:drop-shadow(0 0 3px #4ade80)' }, u.fx); const pts = (t) => { let d = `M${a[0]} ${a[1]}`; for (let k = 1; k <= 12; k++) { const q = Math.min(t, k / 12); const p = arcPt(a, b, .15, q); d += `L${p[0] + Math.sin(k * 3) * 3} ${p[1] + Math.cos(k * 2) * 3}`; if (q >= t) break; } return d; };
          await tween(900, (t) => path.setAttribute('d', pts(t)), ease.io); const stain = el('circle', { cx: b[0], cy: b[1], r: 0, fill: 'rgba(74,222,128,.3)' }, u.fx); await tween(400, (t) => stain.setAttribute('r', 14 * t), ease.out); inf(u, 'g4'); float(u, b, 'INFECTED', '#4ade80'); await wait(500); fade(path, 500); fade(stain, 500); } },
    ],
  });
})();
