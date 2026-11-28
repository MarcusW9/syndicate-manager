// A runner falls (death, and lighter, death's door). Picture only. Owner, 2026-11-28: "a big deal like they are seriously
// dying in slow mo ... it zooms on them and a slow mo them getting killed". Same scene: Guard D's shot kills Vex.
(function () {
  const { wait, tween, P, ring, sparks, float, shake, bars, fade, bolt, el, ease, setHp } = Kit;
  const VB = [0, 0, 360, 230];
  // The camera: tween the svg's viewBox towards a box round a point (zoom = how many times closer).
  const cam = (svg, at, zoom, ms, e = ease.io) => {
    const from = (svg.getAttribute('viewBox') || VB.join(' ')).split(' ').map(Number);
    const w = 360 / zoom, h = 230 / zoom;
    const to = [Math.max(0, Math.min(360 - w, at[0] - w / 2)), Math.max(0, Math.min(230 - h, at[1] - h / 2)), w, h];
    return tween(ms, (t) => svg.setAttribute('viewBox', from.map((v, i) => v + (to[i] - v) * t).join(' ')), e);
  };
  const camBack = (svg, ms) => { const from = svg.getAttribute('viewBox').split(' ').map(Number); return tween(ms, (t) => svg.setAttribute('viewBox', from.map((v, i) => v + (VB[i] - v) * t).join(' ')), ease.io); };
  // The rest of the world drains of colour while the moment plays (only the dying runner and the shooter keep theirs).
  const drain = (u, keep, on) => { for (const k in u.tok) if (!keep.includes(k)) { const g = u.tok[k].g; g.style.transition = 'filter .4s, opacity .4s'; g.style.filter = on ? 'grayscale(1) brightness(.6)' : ''; } u.svg.querySelectorAll('.cover').forEach((c) => { c.style.transition = 'opacity .4s'; c.style.opacity = on ? 0.35 : 1; }); };
  // Letterbox bars over the card (outside the map, so the camera's zoom doesn't move them), with a title in the lower bar.
  const letterbox = (svg, title = '') => {
    const card = svg.parentNode; card.style.position = 'relative';
    const r = svg.getBoundingClientRect(), c = card.getBoundingClientRect();
    const box = document.createElement('div'); Object.assign(box.style, { position: 'absolute', left: `${r.left - c.left}px`, top: `${r.top - c.top}px`, width: `${r.width}px`, height: `${r.height}px`, pointerEvents: 'none', overflow: 'hidden' });
    const bar = (top) => { const d = document.createElement('div'); Object.assign(d.style, { position: 'absolute', left: 0, right: 0, height: '0', background: '#000', transition: 'height .35s', [top ? 'top' : 'bottom']: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', font: "700 15px Rajdhani, 'Arial Narrow', sans-serif", letterSpacing: '.3em', color: '#ff3d5f' }); box.append(d); return d; };
    const t = bar(true), b = bar(false); card.append(box);
    requestAnimationFrame(() => { t.style.height = '13%'; b.style.height = '13%'; });
    return { title: (s) => { b.textContent = s; }, off: () => { t.style.height = '0'; b.style.height = '0'; b.textContent = ''; setTimeout(() => box.remove(), 400); } };
  };
  // The body tips over and drops a little, slowly.
  const topple = (u, id, ms) => { const o = u.tok[id]; const [x, y] = o.pos; return tween(ms, (e) => o.g.setAttribute('transform', `translate(${x + 4 * e} ${y + 5 * e}) rotate(${80 * e})`), ease.out); };
  const grey = (u, id) => { const g = u.tok[id].g; g.style.transition = 'filter .6s, opacity .6s'; g.style.filter = 'grayscale(1)'; g.style.opacity = 0.55; };
  const text = (u, x, y, s, attrs = {}) => { const t = el('text', { x, y, 'text-anchor': 'middle', fill: '#fff', 'font-size': 10, 'font-weight': 700, 'letter-spacing': '0.14em', 'font-family': 'Rajdhani, sans-serif', ...attrs }, u.fx); t.textContent = s; return t; };
  const blood = (u, at, n = 5) => { for (let i = 0; i < n; i++) { const d = el('circle', { cx: at[0], cy: at[1], r: 1 + Math.random() * 1.4, fill: '#ff3d5f' }, u.fx); const a = -Math.PI / 2 + (Math.random() - 0.5) * 1.6, v = 6 + Math.random() * 8; tween(900, (e) => { d.setAttribute('cx', at[0] + Math.cos(a) * v * e); d.setAttribute('cy', at[1] + Math.sin(a) * v * e + 10 * e * e); d.style.opacity = 1 - e * 0.6; }).then(() => d.remove()); } };

  Kit.ability({
    id: 'death', name: 'A runner falls (death)',
    decided: 'Slow motion, camera pushes in (owner, 2026-11-28: "slowmo for now"), with KILLED in the bar instead of GONE. Built: ui/fightstage.js FALL.',
    rules: "A runner killed in a fight: bled out after \"keep fighting\", left behind, or on committed risk (core/runfight.js, the stage's fall with dead: true). Lighter: one going down at death's door, where the crew calls you in.",
    variants: [
      { id: 'now', tag: 'Now', name: 'Same as any knockdown', note: 'Today a death draws like any runner going down: the shot, the token greys and tips, a "Down" float. About half a second, easy to miss in a busy round.',
        async play(u) { await bolt(u, P(u, 'g4'), P(u, 'V'), '#ff8a98', 220); sparks(u, P(u, 'V'), '#ff8a98', 5, 8); setHp(u, 'V', 0); grey(u, 'V'); float(u, P(u, 'V'), 'Down'); await topple(u, 'V', 300); await wait(700); } },

      { id: 'slowmo', tag: 'Proposal', name: 'Slow motion, camera pushes in', note: 'The round freezes for a beat, letterbox bars come in, the world drains of colour and the camera pushes in on Vex. The killing shot crosses in slow motion, the hit lands with a slow spray, Vex topples over a full second, their bar drains. Their name comes up over them and in the bar ("VEX · GONE"), then the camera eases back and the round finishes. About 5 seconds; only for a death. Death\'s door gets a 1.5-second version (a half push-in, no bars, "AT DEATH\'S DOOR"). Needs nothing new from the rules: the stage already gets fall with dead: true.',
        async play(u, svg) {
          await wait(120); // hit-stop
          const lb = letterbox(svg); drain(u, ['V', 'g4'], true);
          await cam(svg, Kit.lerp(P(u, 'V'), P(u, 'g4'), 0.25), 2.4, 900);
          await bolt(u, P(u, 'g4'), P(u, 'V'), '#ff8a98', 1500, 1.8);
          ring(u, P(u, 'V'), '#ff3d5f', 16, 1200, 1.5); blood(u, P(u, 'V'), 7);
          tween(1200, (e) => setHp(u, 'V', 1 - e)); await topple(u, 'V', 1300); grey(u, 'V');
          const name = text(u, P(u, 'V')[0], P(u, 'V')[1] - 20, 'VEX', { 'font-size': 9 }); name.style.opacity = 0; await tween(500, (e) => { name.style.opacity = e; });
          lb.title('VEX · GONE'); await wait(1400); fade(name, 400);
          await camBack(svg, 700); drain(u, [], false); lb.off(); await wait(600);
        } },

      { id: 'flatline', tag: 'Proposal', name: 'Flatline', note: 'No camera move: time stops instead. Every token freezes under a red wash, a heartbeat line draws across the bottom of the map in Vex\'s colour, beats twice, slower, and goes flat with a long tone (sound later). Vex\'s token is left as a hollow outline with their initial that stays on the map for the rest of the fight. About 4 seconds. Reads at any zoom level and keeps the whole fight in view.',
        async play(u, svg) {
          await bolt(u, P(u, 'g4'), P(u, 'V'), '#ff8a98', 260); sparks(u, P(u, 'V'), '#ff3d5f', 6, 10); setHp(u, 'V', 0);
          const wash = el('rect', { x: 0, y: 0, width: 360, height: 230, fill: '#ff3d5f', opacity: 0 }, u.fx); await tween(300, (e) => wash.setAttribute('opacity', 0.16 * e));
          drain(u, ['V'], true);
          const y = 214, pts = [[20, y]]; const beat = (x) => pts.push([x, y], [x + 4, y - 14], [x + 8, y + 8], [x + 12, y]);
          beat(80); beat(170); pts.push([340, y]);
          const line = el('polyline', { points: '', fill: 'none', stroke: '#3de8d8', 'stroke-width': 1.6 }, u.fx);
          await tween(2200, (e) => { const upto = 20 + 320 * e; const shown = pts.filter((p) => p[0] <= upto); line.setAttribute('points', [...shown, [upto, y]].map((p) => p.join(',')).join(' ')); if (e > 0.6) line.setAttribute('stroke', '#ff3d5f'); }, ease.lin);
          const lbl = text(u, 180, 202, 'VEX', { 'font-size': 8, fill: '#ff3d5f' }); grey(u, 'V');
          const o = u.tok.V.g; o.querySelector('circle').setAttribute('fill', 'none');
          await wait(900); fade(line, 500); fade(lbl, 500); await tween(400, (e) => wash.setAttribute('opacity', 0.16 * (1 - e))); wash.remove(); drain(u, [], false); await wait(500);
        } },

      { id: 'crew', tag: 'Proposal', name: 'Slow motion, and the crew sees it', note: 'The slow push-in of the second card, shorter (3.5 seconds), then the moment belongs to the crew: the camera pulls to the nearest runner (Kade), who turns and runs to the body, and a shout comes up ("VEX!"). Kade stays by Vex for the round. Costs: the stage needs who is nearest and a few lines of shouts in the owner\'s text (data/fightText.js); it shows the crew as people who lost someone.',
        async play(u, svg) {
          await wait(120); const lb = letterbox(svg); drain(u, ['V', 'g4'], true);
          await cam(svg, P(u, 'V'), 2.2, 700);
          await bolt(u, P(u, 'g4'), P(u, 'V'), '#ff8a98', 1100, 1.8); blood(u, P(u, 'V'), 6);
          tween(900, (e) => setHp(u, 'V', 1 - e)); await topple(u, 'V', 1000); grey(u, 'V');
          drain(u, ['V', 'g4', 'K'], true);
          await cam(svg, Kit.lerp(P(u, 'V'), P(u, 'K'), 0.5), 1.8, 600);
          const shout = text(u, P(u, 'K')[0], P(u, 'K')[1] - 18, 'VEX!', { 'font-size': 8, fill: '#3de8d8' });
          const k = u.tok.K; const to = [P(u, 'V')[0] - 14, P(u, 'V')[1] + 6]; const from = k.pos;
          await tween(700, (e) => k.g.setAttribute('transform', `translate(${from[0] + (to[0] - from[0]) * e} ${from[1] + (to[1] - from[1]) * e})`), ease.io);
          k.pos = to; await wait(800); fade(shout, 300);
          lb.title('VEX · GONE'); await wait(600);
          await camBack(svg, 600); drain(u, [], false); lb.off(); await wait(500);
        } },
    ],
  });
})();
