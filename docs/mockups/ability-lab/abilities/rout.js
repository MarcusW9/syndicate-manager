// Rout (payload: a hit shakes the target; shaken enemies may break and flee).
(function () {
  const { wait, tween, P, ring, sparks, float, shake, el, fade, bolt, ease } = Kit;
  Kit.ability({
    id: 'rout', name: 'Rout (Fear)',
    rules: 'A hit shakes the target (shaken in core/fight.js); at the round’s end a shaken enemy may break and flee (the shaken flee check).',
    variants: [
      { id: 'now', tag: 'Now', name: 'Shaken tint', note: 'A shake and a tint; the flee is a plain fade out.',
        async play(u) { await bolt(u, P(u, 'V'), P(u, 'g4'), '#c084fc', 220); await shake(u, 'g4', 500); const g = u.tok.g4.g; g.style.transition = 'opacity .5s'; g.style.opacity = 0; await wait(600); } },
      { id: 'tremble', tag: 'Proposal', name: 'Tremble, then bolt', note: 'The target trembles with a purple jitter ring and a "!" floating over it. If it breaks it spins and sprints out of cover with dust puffs, a "ROUTED" tag at the start of the run, fading off the map edge.',
        async play(u) { const p = P(u, 'g4'); await bolt(u, P(u, 'V'), p, '#c084fc', 220); const r = el('circle', { cx: p[0], cy: p[1], r: 13, fill: 'none', stroke: '#c084fc', 'stroke-dasharray': '2 2', 'stroke-width': 1.4 }, u.fx); Kit.label(u, [p[0], p[1] - 16], '!', '#c084fc'); await shake(u, 'g4', 700); r.remove(); await wait(200);
          const g = u.tok.g4.g; const to = [372, p[1] + 20]; float(u, p, 'ROUTED', '#c084fc'); await tween(700, (e) => { const x = p[0] + (to[0] - p[0]) * e, y = p[1] + (to[1] - p[1]) * e; g.setAttribute('transform', `translate(${x} ${y})`); g.style.opacity = 1 - Math.max(0, e - .6) / .4; if (Math.random() < .35) { const d = el('circle', { cx: x - 6, cy: y + 8, r: 2.2, fill: '#667' }, u.fx); fade(d, 350); } }, ease.in); await wait(400); } },
      { id: 'cower', tag: 'Proposal', name: 'Cower, then drop back', note: 'Quieter: the target ducks low (token shrinks, shield-arm tag), a purple wash dims it, and it crawls back a few steps to the rear and stays there, shaken but not gone. For a rout that leaves the fight but not the map.',
        async play(u) { const p = P(u, 'g4'); await bolt(u, P(u, 'V'), p, '#c084fc', 220); const g = u.tok.g4.g; ring(u, p, '#c084fc', 20, 500, 2); Kit.label(u, [p[0], p[1] - 16], 'SHAKEN', '#c084fc'); await tween(350, (e) => g.setAttribute('transform', `translate(${p[0]} ${p[1]}) scale(${1 - .25 * e})`)); await wait(500);
          const to = [p[0] + 34, p[1] + 36]; await tween(800, (e) => g.setAttribute('transform', `translate(${p[0] + (to[0] - p[0]) * e} ${p[1] + (to[1] - p[1]) * e}) scale(.75)`), ease.io); g.style.opacity = .55; await wait(700); } },
    ],
  });
})();
