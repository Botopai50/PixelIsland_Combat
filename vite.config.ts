import { defineConfig } from 'vite';

// base relativo: o build funciona em qualquer subpasta (GitHub Pages, itch.io, etc.)
export default defineConfig({
  base: './',
  build: { target: 'es2022', chunkSizeWarningLimit: 1500 },
});
