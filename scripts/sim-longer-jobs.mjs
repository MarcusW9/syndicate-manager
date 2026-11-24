// Longer jobs (owner, 2026-11-24, drafts/PROPOSAL-longer-jobs.md): what does lengthening harder jobs do to income?
// Lengthens every job that is not rookie or routine work to its threat in days (threat 2: 2, 3: 3, 4: 4, 5: 5; the
// offer can add one), raises its pay by PAYX of the base pay per day added, then runs scripts/sim-crew-income.mjs with
// the same arguments. Measurement only; changes no rule.
//
//   LONG=1 PAYX=0.5 node scripts/sim-longer-jobs.mjs [seeds] [sizes] [arrivals] [posts,expeditions]
//   node scripts/sim-longer-jobs.mjs ...   (no LONG: today's lengths, the baseline)
const { MISSIONS } = await import(new URL('../src/data/missions.js', import.meta.url));
const BASE = { 2: 2, 3: 3, 4: 4, 5: 5 };
if (process.env.LONG) {
  const payx = Number(process.env.PAYX ?? 0);
  for (const m of MISSIONS) {
    if (m.rookie || m.routine || !BASE[m.threat]) continue;
    const d = Math.max(m.days, BASE[m.threat]);
    m.pay = Math.round((m.pay * (1 + payx * (d - m.days))) / 50) * 50;
    m.days = d;
    m.daysRange = [d, d + 1];
  }
}
await import(new URL('./sim-crew-income.mjs', import.meta.url));
