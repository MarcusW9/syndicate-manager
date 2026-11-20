// Aura / heal (a medic restores an ally).
(function () {
  const { wait, tween, P, ring, sparks, float, el, grow, fade, glow, orb, heal, ease } = Kit;
  Kit.ability({
    id: 'aura', name: 'Aura / heal', scene: { hurt: { V: 0.35, M: 0.55 } },
    rules: 'A medic’s help that lands: the patient’s HP rises; a miss is a red ring (aura step in fightstage.js).',
    variants: [
      { id: 'now', tag: 'Now', name: 'Orb to the patient', note: 'The medic glows, an orb arcs to the patient, the bar fills.',
        async play(u) { glow(u, 'J', '#4ade80', 700); await wait(300); await orb(u, P(u, 'J'), P(u, 'V'), 650, { fill: '#4ade80' }); ring(u, P(u, 'V'), '#4ade80', 18, 420); heal(u, 'V', 14); float(u, P(u, 'V'), '+14', '#4ade80'); await wait(500); } },
      { id: 'pulse', tag: 'Proposal', name: 'Healing pulse', note: 'A green ring spreads from the medic; every ally it crosses sprouts rising plus signs and their bar ticks up. Good for an area aura, reads as "the medic is helping everyone near".',
        async play(u) { const J = P(u, 'J'); const c = el('circle', { cx: J[0], cy: J[1], r: 4, fill: 'rgba(74,222,128,.10)', stroke: '#4ade80', 'stroke-width': 1.6 }, u.fx); const hit = {}; const A = [['V', 8], ['M', 10]];
          await tween(1100, (e) => { const r = 4 + 110 * e; c.setAttribute('r', r); c.style.opacity = 1 - e * .6; A.forEach(([id, n]) => { if (hit[id]) return; const p = P(u, id); if (Math.hypot(p[0] - J[0], p[1] - J[1]) <= r) { hit[id] = 1; for (let k = 0; k < 4; k++) { const t = el('text', { class: 'float', x: p[0] - 9 + k * 6, y: p[1] - 10, fill: '#4ade80', style: 'font-size:10px' }, u.fx); t.textContent = '+'; setTimeout(() => tween(800, (q) => { t.setAttribute('y', p[1] - 10 - q * 18); t.style.opacity = 1 - q; }).then(() => t.remove()), k * 90 * Kit.st.S); } heal(u, id, n); float(u, p, '+' + n, '#4ade80'); ring(u, p, '#4ade80', 16, 400); } }); }, ease.out); c.remove(); await wait(600); } },
      { id: 'tether', tag: 'Proposal', name: 'Tether with counting numbers', note: 'A glowing tether holds between medic and patient; plus chips travel along it and the heal number counts up on the patient as the bar fills, so you can see exactly how much.',
        async play(u) { const J = P(u, 'J'), V = P(u, 'V'); glow(u, 'J', '#4ade80', 1500); const l = await grow(u, J, V, 350, { stroke: '#4ade80', 'stroke-width': 2, opacity: .7, style: 'filter:drop-shadow(0 0 3px #4ade80)' });
          const num = Kit.label(u, [V[0], V[1] - 16], '+0', '#4ade80'); for (let i = 0; i < 4; i++) { orb(u, J, V, 450, { fill: '#b6f5c9', r: 2 }, 0, ease.lin); await wait(230); heal(u, 'V', 3.5); num.textContent = '+' + Math.round((i + 1) * 3.5); } await wait(500); fade(l, 400); fade(num, 500); ring(u, V, '#4ade80', 18, 400); await wait(500); } },
    ],
  });
})();
