// The job checker (owner, 2026-11-03: "build the checker"). Lints one job template the way
// docs/new-job-prompt.md asks jobs to be written, beyond what core/validate.js enforces:
// tier bands, choice shape, text tokens, retired names, phone-length lines. Errors break the
// job or the canon; warnings are taste, for a person to look at. Run it on a pasted file with
// `node scripts/check-job.mjs <file>`; the tests run it on every job in the game.

import { STATS } from './development.js';
import { ROLE_PROFILES } from '../data/recruitPools.js';
import { CAST } from '../data/cast.js';
import { SITUATIONS } from '../data/situations.js';
import { NAMES } from '../config/names.js';

const ROLES = Object.keys(ROLE_PROFILES);
const KINDS = new Set(['push', 'adapt', 'abort', 'extract', 'stabilise']);
const EXITS = new Set(['abort', 'extract']);
const INJURIES = new Set(['none', 'light', 'serious', 'critical']);
const COST_KEYS = new Set(['cash', 'heat', 'clientTrust', 'payCut']);
const PLAIN_TOKENS = new Set(['op', 'district', 'faction', ...ROLES]);

/** Difficulty, pay and crew size by tier, from the jobs in the game (the prompt quotes them). */
export const TIERS = {
  rookie: { difficulty: [3, 8], pay: [1200, 1900], crewSize: [2, 2] },
  1: { difficulty: [3, 12], pay: [1200, 3000], crewSize: [2, 3] },
  2: { difficulty: [8, 13], pay: [3000, 4500], crewSize: [2, 3] },
  3: { difficulty: [9, 14], pay: [4000, 5500], crewSize: [3, 4] },
  4: { difficulty: [9, 15], pay: [6000, 7500], crewSize: [3, 4] },
  5: { difficulty: [11, 15], pay: [10000, 14000], crewSize: [4, 4] },
};

/** Names retired from the canon (WORLD.md's RETIRED line; a test keeps the two in step). */
export const RETIRED = ['Pak Kok', 'Hoi-Sing Container Reach', 'Lang-Yan Bazaar', 'Tit-Kyu', 'Kim-Ah Terminal', 'San-Pui Flats', 'Aether-Kowloon', 'AKL', 'Kowloon', 'Long Fung', 'Lung Fung', 'Harbor'];
const RETIRED_RE = new RegExp(`\\b(${RETIRED.map((n) => n.replace(/[-]/g, '\\-')).join('|')})\\b`);

export const MAX_LINE = 240; // a long line on a phone: about six lines of text
export const MAX_LABEL = 70;
export const MAX_BRIEF = 320; // the client's pitch has the planning screen to itself

/** Every string in a job worth reading, with where it is. */
function texts(job) {
  const out = [['brief', job.brief], ...job.beats.map((b, i) => [`beat ${i}`, b])];
  for (const c of job.crises ?? []) {
    out.push([`${c.id}: text`, c.text]);
    for (const ch of c.choices ?? []) {
      for (const k of ['label', 'success', 'failure']) if (ch[k]) out.push([`${c.id}/${ch.id}: ${k}`, ch[k]]);
      for (const k of ['success', 'failure']) if (ch.report?.[k]) out.push([`${c.id}/${ch.id}: report.${k}`, ch.report[k]]);
    }
  }
  return out;
}

function checkCost(where, cost, errors) {
  if (cost == null) return;
  for (const [k, v] of Object.entries(cost)) {
    if (!COST_KEYS.has(k)) errors.push(`${where}: unknown cost "${k}" (cash, heat, clientTrust, payCut)`);
    else if (typeof v !== 'number') errors.push(`${where}: cost ${k} must be a number`);
    else if (k === 'payCut' && (v < -1 || v > 1)) errors.push(`${where}: payCut ${v} must be between -1 and 1`);
    else if (k === 'heat' && (v < 0 || v > 3 || !Number.isInteger(v))) errors.push(`${where}: heat ${v} must be a whole number 0-3`);
    else if (k === 'clientTrust' && v > 0) errors.push(`${where}: clientTrust only goes down in a crisis`);
  }
}

/**
 * Check one job template (its own crises, not the district or rookie pool).
 * others: the ids of every other job, to catch a clash. Returns { errors, warnings }.
 */
export function checkJob(job, { others = [] } = {}) {
  const errors = [];
  const warnings = [];
  const tier = TIERS[job.rookie ? 'rookie' : job.threat];

  if (!/^[a-z][a-z0-9_]*$/.test(job.id ?? '')) errors.push(`id "${job.id}" must be snake_case`);
  if (others.includes(job.id)) errors.push(`id "${job.id}" is already a job`);
  if (!job.name) errors.push('no name');
  if (!NAMES.districts[job.district]) errors.push(`district "${job.district}" must be one of ${Object.keys(NAMES.districts).join(', ')}`);
  if (!tier) errors.push(`threat ${job.threat} must be 1-5`);
  if (job.rookie && job.threat !== 1) errors.push('a rookie job is threat 1');
  if (!job.brief) errors.push('no brief');
  if (!(job.beats?.length >= 4 && job.beats.length <= 5)) (job.beats?.length ? warnings : errors).push(`${job.beats?.length ?? 0} beats (4-5)`);
  if (!job.keyStats?.length || job.keyStats.some((s) => !STATS.includes(s))) errors.push(`keyStats must be from ${STATS.join(', ')}`);
  if (job.heat !== 0) warnings.push(`heat ${job.heat}: every job has heat 0 (heat comes from choices)`);
  if (tier) {
    if (job.pay < tier.pay[0] || job.pay > tier.pay[1]) warnings.push(`pay ¥${job.pay} is outside the usual ¥${tier.pay[0]}-${tier.pay[1]} for this tier`);
    if (job.crewSize < tier.crewSize[0] || job.crewSize > tier.crewSize[1]) warnings.push(`crewSize ${job.crewSize} is outside the usual ${tier.crewSize.join('-')} for this tier`);
  }
  if (!(job.days >= 1 && job.days <= 3)) errors.push(`days ${job.days} must be 1-3`);
  // Routine work repeats every week (docs/new-job-prompt.md "Routine work", 2026-11-04): small and short.
  if (job.routine) {
    if (job.threat > 2) warnings.push(`a routine job is rookie or threat 2, not threat ${job.threat}`);
    if (job.crewSize > 2) warnings.push(`a routine job takes a crew of 2, not ${job.crewSize}`);
    if (job.days > 2) warnings.push(`a routine job takes 1-2 days, not ${job.days}`);
  }

  const crises = job.crises ?? [];
  // Six of its own; a job can get by on three, as the shared pool fills the draw (older rookie jobs).
  if (crises.length < 3 || crises.length > 6) errors.push(`${crises.length} crises (6)`);
  else if (crises.length < 6) warnings.push(`${crises.length} crises of its own (6: with fewer, the shared ones repeat sooner)`);
  const crisisIds = new Set();
  for (const c of crises) {
    if (crisisIds.has(c.id)) errors.push(`crisis id "${c.id}" is used twice`);
    crisisIds.add(c.id);
    if (!c.text) errors.push(`${c.id}: no text`);
    for (const s of c.situations ?? []) if (!SITUATIONS[s]) errors.push(`${c.id}: unknown situation "${s}"`);
    if (c.after == null) warnings.push(`${c.id}: no "after" (it can come up before the first beat)`);
    else if (!(c.after >= 0 && c.after <= job.beats.length - 2)) errors.push(`${c.id}: after ${c.after} must be 0-${job.beats.length - 2}`);
    if (c.focusRole && !ROLES.includes(c.focusRole)) errors.push(`${c.id}: focusRole "${c.focusRole}" isn't a role`);

    const choices = c.choices ?? [];
    const exits = choices.filter((ch) => EXITS.has(ch.kind));
    const real = choices.filter((ch) => !EXITS.has(ch.kind));
    if (!exits.length) errors.push(`${c.id}: no abort or extract choice`);
    else if (!EXITS.has(choices.at(-1).kind)) errors.push(`${c.id}: the way out must be the last choice`);
    if (real.length < 2 || real.length > 3) errors.push(`${c.id}: ${real.length} choices before the way out (2-3)`);
    const choiceIds = new Set();
    for (const ch of choices) {
      const at = `${c.id}/${ch.id}`;
      if (choiceIds.has(ch.id)) errors.push(`${at}: choice id used twice`);
      choiceIds.add(ch.id);
      if (!KINDS.has(ch.kind)) errors.push(`${at}: kind "${ch.kind}" (push, adapt, abort, extract)`);
      if (!STATS.includes(ch.stat)) errors.push(`${at}: stat "${ch.stat}" isn't a stat`);
      if (!INJURIES.has(ch.failureInjury)) errors.push(`${at}: failureInjury "${ch.failureInjury}" (none, light, serious, critical)`);
      if (!ch.label) errors.push(`${at}: no label`);
      if (!ch.success) errors.push(`${at}: no success line`);
      if (!ch.report?.success) errors.push(`${at}: no report.success line`);
      checkCost(`${at} cost`, ch.cost, errors);
      checkCost(`${at} failureCost`, ch.failureCost, errors);
      const rolls = !ch.sure && !EXITS.has(ch.kind);
      if (EXITS.has(ch.kind) || ch.sure) {
        if (ch.difficulty !== 0) errors.push(`${at}: a way out or a sure choice doesn't roll (difficulty 0)`);
        if (ch.failureInjury !== 'none') errors.push(`${at}: a choice that can't fail can't hurt (failureInjury 'none')`);
      }
      if (rolls) {
        if (!ch.failure) errors.push(`${at}: can fail but has no failure line`);
        if (!ch.report?.failure) errors.push(`${at}: can fail but has no report.failure line`);
        if (tier && (ch.difficulty < tier.difficulty[0] || ch.difficulty > tier.difficulty[1])) warnings.push(`${at}: difficulty ${ch.difficulty} is outside ${tier.difficulty.join('-')} for this tier`);
        if (ch.failureInjury === 'critical' && job.threat < 4) warnings.push(`${at}: a critical injury on a threat ${job.threat} job (keep those for threat 4-5)`);
      }
      if (ch.requires) {
        const r = ch.requires;
        if (r.kind === 'role' && !ROLES.includes(r.value)) errors.push(`${at}: requires role "${r.value}" isn't a role`);
        else if (r.kind === 'stat' && (!STATS.includes(r.value) || typeof r.min !== 'number')) errors.push(`${at}: requires stat needs a real stat and a min`);
        else if (!['role', 'stat', 'trait'].includes(r.kind)) errors.push(`${at}: requires kind "${r.kind}" (role or stat)`);
      }
      // A role token on a choice names that role's crew member, or "someone" if there isn't one.
      const needs = ch.requires?.kind === 'role' ? ch.requires.value : null;
      const said = [ch.label, ch.success, ch.failure, ch.report?.success, ch.report?.failure].join(' ');
      const named = new Set([...said.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).filter((r) => ROLES.includes(r) && r !== needs && r !== c.focusRole));
      for (const role of named) warnings.push(`${at}: says {${role}} but doesn't require a ${role} (it reads "someone" without one)`);
    }
  }

  for (const [where, text] of texts(job)) {
    for (const [, key, sub] of text.matchAll(/\{(\w+)(?::(\w+))?\}/g)) {
      if (CAST[key]) {
        if (sub && !CAST[key].lines?.[sub]) errors.push(`${where}: {${key}:${sub}}: ${key} has no "${sub}" lines`);
      } else if (!PLAIN_TOKENS.has(key) || sub) {
        errors.push(`${where}: unknown token {${key}${sub ? `:${sub}` : ''}}${key === 'fung' ? ' (Auntie Fung has no token: write her name)' : ''}`);
      }
    }
    const retired = text.match(RETIRED_RE);
    if (retired) errors.push(`${where}: "${retired[1]}" is a retired name`);
    if (/\b(credits|creds)\b/i.test(text)) errors.push(`${where}: money is ¥, not credits`);
    const max = where.endsWith(': label') ? MAX_LABEL : where === 'brief' ? MAX_BRIEF : MAX_LINE;
    if (text.length > max) warnings.push(`${where}: ${text.length} characters (keep it under ${max} for a phone)`);
  }
  return { errors, warnings };
}
