// Spotter’s Eye (payload: a hit marks the target; the crew’s shots at it hit harder).
(function () {
  const { wait, tween, P, ring, sparks, float, el, grow, fade, bolt, ease } = Kit;
  Kit.ability({
    id: 'mark', name: 'Mark (Spotter’s Eye)',
    rules: 'A hit marks the target (marked in core/fight.js); the crew’s next shots at it are easier/stronger until it clears.',
    variants: [
      { id: 'now', tag: 'Now', name: 'Marker ring', note: 'A marker ring on the target (the status look from 2026-11-19).',
        async play(u) { await bolt(u, P(u, 'V'), P(u, 'g1'), '#f2d541', 220); const p = P(u, 'g1'); el('circle', { cx: p[0], cy: p[1], r: 14, fill: 'none', stroke: '#f2d541', 'stroke-width': 1.6 }, u.fx); await wait(900); } },
      { id: 'lock', tag: 'Proposal', name: 'Reticle lock', note: 'A big reticle slams down and collapses onto the target, then stays as a small diamond tag with MARKED. When the crew fires later, thin lines from each shooter converge on it.',
        async play(u) { const p = P(u, 'g1'); await bolt(u, P(u, 'V'), p, '#f2d541', 220); const g = el('g', { transform: `translate(${p[0]} ${p[1]})` }, u.fx); const r = el('g', {}, g); el('circle', { r: 15, fill: 'none', stroke: '#f2d541', 'stroke-width': 1.4 }, r); el('path', { d: 'M-22 0H-9M9 0H22M0 -22V-9M0 9V22', stroke: '#f2d541', 'stroke-width': 1.6 }, r);
          await tween(450, (e) => r.setAttribute('transform', `rotate(${(1 - e) * 90}) scale(${2 - e})`), ease.out); ring(u, p, '#f2d541', 22, 350); const d = el('path', { d: 'M0 -7L5 0L0 7L-5 0Z', fill: '#f2d541', transform: 'translate(0 -22)' }, g); Kit.label(u, [p[0], p[1] - 31], 'MARKED');
          await wait(500); for (const k of ['K', 'M', 'J']) { grow(u, P(u, k), p, 450, { stroke: '#f2d541', 'stroke-width': .8, opacity: .5, 'stroke-dasharray': '2 3' }).then((l) => setTimeout(() => fade(l, 400), 400 * Kit.st.S)); await wait(120); } await wait(1100); } },
      { id: 'beacon', tag: 'Proposal', name: 'Beacon pin', note: 'A pin drops from above the target with a bounce and a soft pulsing beacon ring that keeps going. Easier to see across a crowded map; the pin stays until the mark clears.',
        async play(u) { const p = P(u, 'g1'); await bolt(u, P(u, 'V'), p, '#f2d541', 220); const g = el('g', { transform: `translate(${p[0]} ${p[1] - 60})` }, u.fx); el('path', { d: 'M0 14L-7 0A7 7 0 1 1 7 0Z', fill: '#f2d541', stroke: '#000', 'stroke-width': 1 }, g); el('circle', { cy: -1, r: 2.6, fill: '#000' }, g);
          await tween(420, (e) => g.setAttribute('transform', `translate(${p[0]} ${p[1] - 60 + 44 * e})`), (t) => t * t); await tween(220, (e) => g.setAttribute('transform', `translate(${p[0]} ${p[1] - 16 - Math.sin(e * Math.PI) * 6})`)); sparks(u, [p[0], p[1] - 4], '#f2d541', 6, 8);
          for (let i = 0; i < 3; i++) { ring(u, p, '#f2d541', 20, 700, 1.4); await wait(450); } await wait(400); } },
    ],
  });
})();
