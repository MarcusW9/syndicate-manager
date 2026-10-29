import { defineConfig } from 'vite';
import { createHash } from 'node:crypto';
import { serviceWorkerSource } from './src/offline/serviceWorker.js';

// Offline play (DESIGN.md, 2026-10-29): after the build, write sw.js listing every built file,
// so the browser keeps a copy and the game opens without a connection.
function offline() {
  return {
    name: 'offline-copy',
    apply: 'build',
    enforce: 'post',
    generateBundle(_, bundle) {
      const built = Object.keys(bundle).filter((f) => f !== 'sw.js');
      const files = ['./', ...new Set(['index.html', ...built])].map((f) => (f === './' ? f : `./${f}`));
      const version = createHash('sha256').update(built.sort().join('\n')).digest('hex').slice(0, 12);
      this.emitFile({ type: 'asset', fileName: 'sw.js', source: serviceWorkerSource(files, version) });
    },
  };
}

// Relative base so the build works on GitHub Pages (any repo name)
// and later inside an iOS app shell (Capacitor loads files locally).
export default defineConfig({
  base: './',
  plugins: [offline()],
});
