// Jam (a tech with a radio call-in cuts a caller's signal so reinforcements don't come).
(function () {
  const { wait, tween, P, ring, sparks, float, el, grow, fade, glow, orb, ease } = Kit;
  const sig = (u, at, ok = true) => { const g = el('g', { transform: `translate(${at[0]} ${at[1] - 20})` }, u.fx); for (let i = 1; i <= 3; i++) el('path', { d: `M${-i * 4} ${-i * 3}Q0 ${-i * 5 - 3} ${i * 4} ${-i * 3}`, fill: 'none', stroke: '#ff8a98', 'stroke-width': 1.4, 'stroke-linecap': 'round' }, g); return g; };
  Kit.ability({
    id: 'jam', name: 'Jam',
    rules: 'A tech who can jam cuts an enemy’s radio call so no reinforcements arrive (dilemma option; ping step with targets in fightstage.js).',
    variants: [
      { id: 'now', tag: 'Now', name: 'Ping with broken signal', note: 'A ping ring from the tech; the caller’s ring flickers.',
        async play(u) { ring(u, P(u, 'J'), '#3de8d8', 200, 650, 1.2); await wait(650); ring(u, P(u, 'g3'), '#ff8a98', 18, 400); float(u, P(u, 'g3'), 'JAMMED', '#3de8d8'); await wait(500); } },
      { id: 'static', tag: 'Proposal', name: 'Static burst + NO SIGNAL', note: 'The caller is shown mid-call with radio arcs over their head. Converging rings squeeze in from the tech, the arcs jitter into static and drop away with a NO SIGNAL tag.',
        async play(u) { const g3 = P(u, 'g3'); const s = sig(u, g3); const pulse = tween(1600, (e) => { s.style.opacity = .6 + .4 * Math.sin(e * 30); }); await wait(500);
          const J = P(u, 'J'); for (let i = 0; i < 3; i++) { orb(u, J, g3, 500, { fill: '#3de8d8', r: 2 }, .12 * (i - 1), ease.io); await wait(160); } await wait(380);
          ring(u, g3, '#3de8d8', 24, 400, 2); sparks(u, [g3[0], g3[1] - 20], '#3de8d8', 8, 10); await tween(380, (e) => { s.setAttribute('transform', `translate(${g3[0] + (Math.random() - .5) * 8 * (1 - e)} ${g3[1] - 20 + e * 14})`); s.style.opacity = 1 - e; }); s.remove();
          const t = Kit.label(u, [g3[0], g3[1] - 22], 'NO SIGNAL', '#3de8d8'); await wait(900); fade(t, 400); } },
      { id: 'cut', tag: 'Proposal', name: 'Cut the line', note: 'A thin radio line runs from the caller up and off the map to the reinforcements. A flash cuts it in the middle; the upper half fades and the lower half falls back to the caller.',
        async play(u) { const g3 = P(u, 'g3'); const top = [g3[0] + 30, -4]; const l = await grow(u, g3, top, 500, { stroke: '#ff8a98', 'stroke-width': 1.4, 'stroke-dasharray': '4 3' }); const j = P(u, 'J');
          const mid = [(g3[0] + top[0]) / 2, (g3[1] + top[1]) / 2]; await orb(u, j, mid, 520, { fill: '#3de8d8' }, .15); sparks(u, mid, '#fff', 8, 12); ring(u, mid, '#3de8d8', 16, 400); l.remove();
          const a = el('line', { x1: g3[0], y1: g3[1], x2: mid[0], y2: mid[1], stroke: '#ff8a98', 'stroke-width': 1.4, 'stroke-dasharray': '4 3' }, u.fx); const b = el('line', { x1: mid[0], y1: mid[1], x2: top[0], y2: top[1], stroke: '#ff8a98', 'stroke-width': 1.4, 'stroke-dasharray': '4 3' }, u.fx); fade(b, 500);
          await tween(500, (e) => { a.setAttribute('x2', mid[0] + (g3[0] - mid[0]) * e); a.setAttribute('y2', mid[1] + (g3[1] - mid[1]) * e); }); a.remove(); float(u, g3, 'CUT', '#3de8d8'); await wait(600); } },
    ],
  });
})();
