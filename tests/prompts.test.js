// The new-job prompt (docs/new-job-prompt.md) carries a copy of WORLD.md's context block,
// so a job drafted outside a session uses the current canon. Change both together.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');

test("the new-job prompt's world context matches WORLD.md", () => {
  const world = read('WORLD.md');
  const block = world.slice(world.indexOf('## Context block for worldbuilding prompts')).match(/```\n([\s\S]*?)\n```/)[1];
  assert.ok(block.startsWith('CONTEXT — LANTERN BAY'), 'found the context block');
  assert.ok(read('docs/new-job-prompt.md').includes(block), 'docs/new-job-prompt.md has the context block exactly as WORLD.md');
});
