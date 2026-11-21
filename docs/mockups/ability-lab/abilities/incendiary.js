// Incendiary Rounds (payload: a hit sets the target burning; it ticks 10 HP for 2 rounds).
(function () {
  const { wait, tween, P, ring, sparks, float, shake, dmg, el, grow, fade, bolt, ease } = Kit;
  const flames = (u, p, n = 8, ms = 900) => { for (let i = 0; i < n; i++) setTimeout(() => { const c = el('circle', { cx: p[0] + (Math.random() - .5) * 14, cy: p[1] + 4, r: 2 + Math.random() * 2, fill: i % 2 ? '#ffb040' : '#ff6a2a' }, u.fx); tween(ms * .7, (e) => { c.setAttribute('cy', p[1] + 4 - e * 18); c.setAttribute('r', (2 + Math.random()) * (1 - e * .7)); c.style.opacity = 1 - e; }).then(() => c.remove()); }, i * (ms / n) * Kit.st.S); };
  Kit.ability({
    id: 'incendiary', name: 'Incendiary rounds',
    rules: 'A hit that gets past the plate sets the target burning: −10 HP at the round’s end, for 2 rounds (burning in core/fight.js; tick step in fightstage.js).',
    decided: "Rising embers on the burning status and a burst at each tick. Built.",
    variants: [
      { id: 'now', tag: 'Now', name: 'Flame ring + tick', note: 'An orange ring on the target, a drip and a pip loss at each tick.',
        async play(u) { const t = P(u, 'g3'); await bolt(u, P(u, 'V'), t, '#ffb040', 220); ring(u, t, '#ff6a2a', 20, 500, 2); for (let i = 0; i < 2; i++) { await wait(500); ring(u, t, '#ff6a2a', 16, 400); dmg(u, 'g3', 10); float(u, t, '−10', '#ff9a4a'); } await wait(300); } },
      { id: 'ember', tag: 'Proposal', name: 'Rising embers', note: 'The round ignites the target: a burst, then embers rise off the token continuously. Each tick the flames flare and the number floats; between ticks the embers keep going so "still burning" reads at a glance.',
        async play(u) { const t = P(u, 'g3'); await bolt(u, P(u, 'V'), t, '#ffb040', 220); sparks(u, t, '#ff9a4a', 8, 12); const burn = el('circle', { cx: t[0], cy: t[1], r: 13, fill: 'rgba(255,106,42,.18)', stroke: '#ff6a2a', 'stroke-dasharray': '3 2' }, u.fx); flames(u, t, 8, 900); await wait(900);
          for (let i = 0; i < 2; i++) { await wait(400); flames(u, t, 12, 800); ring(u, t, '#ff9a4a', 20, 400); dmg(u, 'g3', 10); float(u, t, '−10', '#ff9a4a'); shake(u, 'g3', 240); await wait(900); } fade(burn, 500); } },
      { id: 'scorch', tag: 'Proposal', name: 'Scorch mark + countdown', note: 'A glowing scorch circle sits under the target with pips for the rounds left (●●). Each tick burns a pip off with the damage number; when the last goes the fire dies in a puff of smoke.',
        async play(u) { const t = P(u, 'g3'); await bolt(u, P(u, 'V'), t, '#ffb040', 220); const g = el('g', { transform: `translate(${t[0]} ${t[1]})` }, u.fx); const sc = el('circle', { r: 15, fill: 'rgba(255,106,42,.22)', stroke: '#ff6a2a', 'stroke-width': 1.5 }, g); const pips = [0, 1].map((i) => el('circle', { cx: -4 + i * 8, cy: -19, r: 2.6, fill: '#ff9a4a' }, g)); const pulse = tween(3600, (e) => { sc.setAttribute('r', 15 + Math.sin(e * 40) * 1.2); }); flames(u, t, 6, 600); await wait(1000);
          for (let i = 0; i < 2; i++) { ring(u, t, '#ff9a4a', 20, 400); dmg(u, 'g3', 10); float(u, t, '−10', '#ff9a4a'); pips[1 - i].setAttribute('fill', '#333'); await wait(1100); } sparks(u, t, '#888', 6, 8, 600); fade(g, 500); await wait(500); } },
    ],
  });
})();
