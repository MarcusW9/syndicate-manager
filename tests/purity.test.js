// The layers stay apart (2026-11-18, the purity pass; review items 12 and 13). CLAUDE.md "Architecture (do not break)":
// src/core and src/data are game logic and content only (no clock, no Math.random, no storage, no DOM); src/save/save.js is
// the only code that touches storage; in src/ui, setState is the one place the live game is saved, and nothing writes into
// the state in place. These read the code as text, so they are crude, but they fail loudly if a shortcut creeps in.
// Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const filesIn = (dir) => readdirSync(join(root, dir), { recursive: true }).filter((f) => /\.m?js$/.test(f)).map((f) => join(root, dir, f));
const name = (f) => relative(root, f);

/**
 * The code of a file with its comments and the text of its strings blanked (a template's `${...}` code is kept), so
 * story text that says "window" or "Date.now" is not counted. Regex literals are skipped whole. Line breaks are kept.
 */
export function codeOnly(src) {
  let out = '';
  let i = 0;
  const blank = (s) => s.replace(/[^\n]/g, ' ');
  const prevCode = () => out.replace(/\s+$/, '').slice(-1);
  const stack = []; // open template literals: the `{` depth at which each one's `${` began
  let depth = 0;
  while (i < src.length) {
    const c = src[i]; const d = src[i + 1];
    if (stack.length && c === '}' && depth === stack.at(-1)) { stack.pop(); depth -= 1; out += c; i = template(i + 1); continue; }
    if (c === '/' && d === '/') { const e = src.indexOf('\n', i); const end = e < 0 ? src.length : e; out += blank(src.slice(i, end)); i = end; continue; }
    if (c === '/' && d === '*') { const e = src.indexOf('*/', i + 2); const end = e < 0 ? src.length : e + 2; out += blank(src.slice(i, end)); i = end; continue; }
    if (c === '"' || c === "'") {
      let j = i + 1;
      while (j < src.length && src[j] !== c && src[j] !== '\n') j += src[j] === '\\' ? 2 : 1;
      out += c + blank(src.slice(i + 1, j)) + c; i = j + 1; continue;
    }
    if (c === '`') { out += c; i = template(i + 1); continue; }
    if (c === '/' && (prevCode() === '' || '(,=:[!&|?{};+-*%<>~^'.includes(prevCode()) || /\b(return|typeof|case|of|in)$/.test(out.trimEnd()))) {
      let j = i + 1; let cls = false;
      while (j < src.length && src[j] !== '\n' && (cls || src[j] !== '/')) { if (src[j] === '\\') j += 1; else if (src[j] === '[') cls = true; else if (src[j] === ']') cls = false; j += 1; }
      out += '/' + blank(src.slice(i + 1, j)) + '/'; i = j + 1; continue;
    }
    if (c === '{') depth += 1;
    if (c === '}') depth -= 1;
    out += c; i += 1;
  }
  return out;

  /** Blank a template literal's text from `j` on, up to its closing backtick or the next `${` (whose code is then read as code). */
  function template(j) {
    let k = j;
    while (k < src.length) {
      if (src[k] === '\\') { k += 2; continue; }
      if (src[k] === '`') { out += blank(src.slice(j, k)) + '`'; return k + 1; }
      if (src[k] === '$' && src[k + 1] === '{') { out += blank(src.slice(j, k)) + '${'; depth += 1; stack.push(depth); return k + 2; }
      k += 1;
    }
    out += blank(src.slice(j)); return src.length;
  }
}

const FORBIDDEN = [
  ['Math.random', /\bMath\.random\b/], ['Date.now', /\bDate\.now\b/], ['new Date(', /\bnew\s+Date\s*\(/], ['performance.now', /\bperformance\.now\b/],
  ['localStorage', /\blocalStorage\b/], ['sessionStorage', /\bsessionStorage\b/], ['document.', /\bdocument\s*\./], ['window.', /\bwindow\s*\./],
  ['navigator.', /\bnavigator\s*\./], ['fetch(', /\bfetch\s*\(/], ['setTimeout', /\bsetTimeout\b/], ['setInterval', /\bsetInterval\b/],
];

test('codeOnly keeps code and blanks comments, strings and regexes', () => {
  const src = "const a = 'window.x'; // Date.now()\nconst b = `t ${Date.now()} window.y`; /* Math.random */ const r = /localStorage/; x = 4 / 2; setTimeout(f);\n"
    + "const n = `${a ? `in ${b} window.z` : 'c'} done`; { if (k) { setInterval(g); } }";
  const code = codeOnly(src);
  assert.equal(code.length, src.length);
  assert.ok(!code.includes('window.'), 'string and template text blanked');
  assert.ok(code.includes('Date.now()'), 'a template\'s ${...} is code');
  assert.ok(!code.includes('Math.random') && !code.includes('localStorage'), 'comments and regexes blanked');
  assert.ok(code.includes('setTimeout(f)') && code.includes('4 / 2'), 'division is code');
  assert.ok(code.includes('setInterval(g)') && !code.includes('window.z'), 'code after a nested template is still code');
});

test('src/core and src/data hold no clock, no Math.random, no storage and no DOM', () => {
  const found = [];
  for (const f of [...filesIn('src/core'), ...filesIn('src/data')]) {
    const lines = codeOnly(readFileSync(f, 'utf8')).split('\n');
    lines.forEach((line, n) => { for (const [what, re] of FORBIDDEN) if (re.test(line)) found.push(`${name(f)}:${n + 1} ${what}`); });
  }
  assert.deepEqual(found, [], 'core and data are game logic and content only: these belong in src/ui or src/save');
});

test('only src/save/save.js touches storage', () => {
  const found = [];
  for (const f of [...filesIn('src'), join(root, 'src/main.js')].filter((f) => !f.endsWith('save/save.js'))) {
    const code = codeOnly(readFileSync(f, 'utf8'));
    if (/\b(localStorage|sessionStorage|indexedDB)\b/.test(code)) found.push(name(f));
  }
  assert.deepEqual([...new Set(found)], []);
});

test('in src/ui, setState is the one place the game is saved, and nothing writes into the state in place', () => {
  const saves = [];
  const writes = [];
  for (const f of filesIn('src/ui')) {
    const lines = codeOnly(readFileSync(f, 'utf8')).split('\n');
    lines.forEach((line, n) => {
      if (/\bsaveGame\s*\(/.test(line)) saves.push(`${name(f)}:${n + 1}`);
      if (/\bstate(\s*\.\s*[A-Za-z_$][\w$]*|\s*\[[^\]]*\])+\s*(=(?![=>])|\+=|-=|\*=|\/=|\+\+|--)/.test(line)
        || /\bstate(\s*\.\s*[A-Za-z_$][\w$]*)+\s*\.\s*(push|pop|shift|unshift|splice|sort|reverse|fill)\s*\(/.test(line)
        || /\bdelete\s+state\s*[.[]/.test(line)) writes.push(`${name(f)}:${n + 1}`);
    });
  }
  assert.equal(saves.length, 1, `saveGame is called once in src/ui, inside setState: ${saves.join(', ')}`);
  const app = codeOnly(readFileSync(join(root, 'src/ui/app.js'), 'utf8'));
  assert.match(app, /export function setState\(next\) \{\s*setGame\(next\);\s*saveGame\(state\);/, 'that one call is setState\'s');
  assert.deepEqual(writes, [], 'game state changes go through core functions and setState');
});
