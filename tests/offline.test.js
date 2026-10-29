// Offline play (DESIGN.md, 2026-10-29): the service worker the build writes stores every built
// file and serves the game from that copy. Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { serviceWorkerSource } from '../src/offline/serviceWorker.js';

test('the service worker lists every file it was given, names its cache by version, and is valid code', () => {
  const files = ['./', './index.html', './assets/index-abc.js', './assets/index-def.css'];
  const src = serviceWorkerSource(files, 'v1');
  assert.ok(src.includes(JSON.stringify(files)), 'every built file is stored');
  assert.ok(src.includes('"game-v1"'), 'the cache is named by version');
  assert.notEqual(serviceWorkerSource(files, 'v2'), src, 'a new build gets a new cache');
  assert.doesNotThrow(() => new Function('self', 'caches', 'fetch', src), 'it parses');
  assert.match(src, /startsWith\('game-'\) && k !== CACHE/, 'old copies are dropped');
  assert.match(src, /ignoreVary: true/, 'module scripts match their stored copy');
});
