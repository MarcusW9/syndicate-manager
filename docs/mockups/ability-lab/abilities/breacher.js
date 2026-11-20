// Breacher (payload, needs Tech 10). A cracked plate, or a hit on a marked enemy, exposes the next armoured enemy in the group;
// its next hit ignores the plate, does 10 extra and uses the exposure up. Picture only.
(function () {
  const { wait, tween, P, ring, sparks, float, shake, dmg, grow, fade, bolt, ease, el, plate, label, lerp } = Kit;
  const Y = '#ffd84d';
  const fireAt = async (u, id, text) => { const b = P(u, id); await bolt(u, P(u, 'V'), b, '#fff3b0', 220, 1.6); sparks(u, b, Y, 8, 12); ring(u, b, Y, 22, 420, 2); dmg(u, id, 20); float(u, b, text, '#ffd84d'); shake(u, id, 260); };
  Kit.ability({
    id: 'breacher', name: 'Breacher',
    rules: 'An armour crack (or a hit on a marked enemy) exposes the next armoured enemy in that group. Its next hit ignores the plate, deals 10 HP extra and uses the exposure up (exposed in core/fight.js).',
    variants: [
      { id: 'now', tag: 'Now', name: 'Broken yellow arc', note: 'The status look from 2026-11-19: a yellow broken-plate arc on the exposed enemy. Nothing shows where it came from or what it does.',
        async play(u) { const p1 = plate(u, 'g3'), p2 = plate(u, 'g4'); await bolt(u, P(u, 'K'), P(u, 'g3'), '#fff3b0', 220); p1.top.setAttribute('stroke', '#f55'); sparks(u, P(u, 'g3'), '#fff', 6, 8); await wait(400); fade(p1, 300);
          const [x, y] = P(u, 'g4'); const ex = el('path', { d: 'M-10.4 -4A11 11 0 0 1 -3 -10.6M3 -10.6A11 11 0 0 1 10.4 -4', fill: 'none', stroke: Y, 'stroke-width': 2.2, 'stroke-dasharray': '2.4 1.4', transform: `translate(${x} ${y})` }, u.fx); p2.remove(); await wait(900); await fireAt(u, 'g4', '−20'); fade(ex, 300); } },
      { id: 'transfer', tag: 'Proposal', name: 'Crack runs to the next plate', note: 'The shot cracks the first plate; a bright fracture line runs across to the next armoured enemy and splits its plate open with a yellow gap. The next shot goes straight through the gap, "PIERCED −20", and the gap seals.',
        async play(u) { const p1 = plate(u, 'g3'), p2 = plate(u, 'g4'); const a = P(u, 'g3'), b = P(u, 'g4'); await bolt(u, P(u, 'K'), a, '#fff3b0', 220); sparks(u, a, '#fff', 8, 12); ring(u, a, '#fff', 20, 380); p1.top.setAttribute('stroke', '#f55'); p1.bot.setAttribute('stroke', '#f55'); float(u, a, 'CRACKED', '#fff'); await wait(300);
          const pts = [0, .2, .4, .6, .8, 1].map((t, i) => { const p = lerp(a, b, t); return i === 0 || i === 5 ? p : [p[0] + (i % 2 ? 5 : -5), p[1] + (i % 2 ? -4 : 4)]; }); const path = el('path', { fill: 'none', stroke: Y, 'stroke-width': 1.6, 'stroke-linecap': 'round', style: 'filter:drop-shadow(0 0 3px #ffd84d)' }, u.fx); await tween(450, (t) => { const n = Math.max(1, Math.round(t * 5) + 1); path.setAttribute('d', 'M' + pts.slice(0, n).map((q) => q.join(' ')).join('L')); }); fade(p1, 300);
          sparks(u, b, Y, 8, 10); p2.top.setAttribute('stroke', Y); p2.bot.setAttribute('stroke', Y); p2.top.setAttribute('d', 'M-12 -4A12.5 12.5 0 0 1 -3 -12M3 -12A12.5 12.5 0 0 1 12 -4'); const t = label(u, [b[0], b[1] - 20], 'EXPOSED', Y); fade(path, 600); await wait(1000);
          await fireAt(u, 'g4', 'PIERCED −20'); fade(t, 300); p2.bot.setAttribute('stroke', '#555'); fade(p2, 500); } },
      { id: 'seam', tag: 'Proposal', name: 'Glowing weak point', note: 'No travelling effect: the exposed plate gets a pulsing yellow seam and a small bracket at the gap, so the crew’s next shot visibly has a place to go. The shot threads the seam and the plate goes dark. Quietest; best when several enemies are exposed at once.',
        async play(u) { const p1 = plate(u, 'g3'), p2 = plate(u, 'g4'); const b = P(u, 'g4'); await bolt(u, P(u, 'K'), P(u, 'g3'), '#fff3b0', 220); sparks(u, P(u, 'g3'), '#fff', 6, 8); fade(p1, 300); await wait(250);
          const seam = el('g', { transform: `translate(${b[0]} ${b[1]})` }, u.fx); el('path', { d: 'M-4 -12L0 -9L4 -12', fill: 'none', stroke: Y, 'stroke-width': 2, 'stroke-linecap': 'round' }, seam); const br = el('path', { d: 'M-7 -17H-10V-14M7 -17H10V-14', fill: 'none', stroke: Y, 'stroke-width': 1.2 }, seam);
          tween(1700, (t) => { seam.style.opacity = .55 + .45 * Math.sin(t * 22); }); p2.top.setAttribute('stroke', '#665c20'); await wait(1300);
          await bolt(u, P(u, 'V'), [b[0], b[1] - 11], '#fff3b0', 160, 1.6); await bolt(u, [b[0], b[1] - 11], b, Y, 120, 2.2); sparks(u, b, Y, 8, 12); ring(u, b, Y, 22, 420, 2); dmg(u, 'g4', 20); float(u, b, 'PIERCED −20', Y); shake(u, 'g4', 260); fade(seam, 300); fade(p2, 500); } },
      { id: 'charge', tag: 'Proposal', name: 'Breaching charge', note: 'A small charge clamps onto the exposed plate, blinking. When the next shot lands it blows the plate off in two halves with a flash, and the hit does the extra damage. The most physical; "breacher" reads from the name alone.',
        async play(u) { const p1 = plate(u, 'g3'), p2 = plate(u, 'g4'); const a = P(u, 'g3'), b = P(u, 'g4'); await bolt(u, P(u, 'K'), a, '#fff3b0', 220); sparks(u, a, '#fff', 6, 8); fade(p1, 300); await wait(250);
          const c = el('g', { transform: `translate(${b[0] - 10} ${b[1] - 8})` }, u.fx); el('rect', { x: -3, y: -2.5, width: 6, height: 5, fill: '#333', stroke: Y }, c); const led = el('circle', { r: 1.3, cy: -4, fill: '#ff3d5f' }, c); tween(1900, (t) => { led.style.opacity = Math.sin(t * 40) > 0 ? 1 : .2; });
          await Kit.orb(u, P(u, 'M'), [b[0] - 10, b[1] - 8], 450, { fill: Y, r: 2 }, .2); await wait(1200);
          await bolt(u, P(u, 'V'), b, '#fff3b0', 200, 1.6); c.remove(); const f = el('circle', { cx: b[0], cy: b[1], r: 6, fill: '#fff' }, u.fx); tween(260, (t) => { f.setAttribute('r', 6 + 14 * t); f.style.opacity = 1 - t; }).then(() => f.remove());
          const t1 = p2.top, t2 = p2.bot; tween(600, (t) => { t1.setAttribute('transform', `translate(${t * 14} ${-t * 12}) rotate(${t * 60})`); t2.setAttribute('transform', `translate(${-t * 14} ${t * 12}) rotate(${-t * 60})`); p2.style.opacity = 1 - t; }).then(() => p2.remove());
          sparks(u, b, Y, 10, 14); dmg(u, 'g4', 20); float(u, b, 'PIERCED −20', Y); shake(u, 'g4', 300); await wait(900); } },
    ],
  });
})();
