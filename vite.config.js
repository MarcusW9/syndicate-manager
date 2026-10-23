import { defineConfig } from 'vite';

// Relative base so the build works on GitHub Pages (any repo name)
// and later inside an iOS app shell (Capacitor loads files locally).
export default defineConfig({
  base: './',
});
