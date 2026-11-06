// Check a job file before adding it (core/jobcheck.js): the shape docs/new-job-prompt.md asks
// for, the rules core/validate.js enforces, tier bands, tokens, retired names.
// Run: node scripts/check-job.mjs <job.js> [more.js]   (a pasted job, saved anywhere)
//      node scripts/check-job.mjs --all                 (every job in the game)
// Exits 1 if any job has errors. Warnings are for a person to look at.

import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { checkJob } from '../src/core/jobcheck.js';
import { validateMissions } from '../src/core/validate.js';
import { MISSIONS, ownCrises } from '../src/data/missions.js';
import { TWISTS } from '../src/data/twists.js';

const args = process.argv.slice(2);
if (!args.length) {
  console.log('Usage: node scripts/check-job.mjs <job.js> [more.js] | --all');
  process.exit(2);
}

const jobs = [];
if (args.includes('--all')) {
  for (const m of MISSIONS) jobs.push({ from: m.id, job: { ...m, crises: ownCrises(m) }, inGame: true });
} else {
  for (const file of args) {
    const mod = await import(pathToFileURL(resolve(file)).href);
    const found = Object.values(mod).filter((v) => v && typeof v === 'object' && Array.isArray(v.crises));
    if (!found.length) { console.log(`${file}: no job exported (expected export const NAME = { id, crises, ... })`); process.exitCode = 1; }
    for (const job of found) jobs.push({ from: file, job, inGame: false });
  }
}

let bad = 0;
for (const { from, job, inGame } of jobs) {
  const others = MISSIONS.map((m) => m.id).filter((id) => !(inGame && id === job.id));
  // Every crisis and twist id outside this job (its own crises are the same objects in the game).
  const own = new Set(job.crises);
  const takenCrises = [...new Set([...MISSIONS.flatMap((m) => m.crises).filter((c) => !own.has(c) && !(inGame && ownCrises(MISSIONS.find((x) => x.id === job.id)).includes(c))).map((c) => c.id), ...TWISTS.map((t) => t.id)])];
  const { errors, warnings } = checkJob(job, { others, takenCrises });
  const base = validateMissions([{ ...job, rookie: true }]).filter((p) => !errors.some((e) => p.endsWith(e.split(': ').pop())));
  const all = [...errors, ...base];
  if (all.length) bad++;
  console.log(`\n${job.id ?? '?'} (${from}): ${all.length ? `${all.length} error${all.length === 1 ? '' : 's'}` : 'ok'}${warnings.length ? `, ${warnings.length} warning${warnings.length === 1 ? '' : 's'}` : ''}`);
  for (const e of all) console.log(`  ✗ ${e}`);
  for (const w of warnings) console.log(`  ! ${w}`);
}
console.log(`\n${jobs.length} job${jobs.length === 1 ? '' : 's'} checked, ${bad} with errors.`);
if (bad) process.exitCode = 1;
