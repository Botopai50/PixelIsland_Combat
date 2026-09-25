import { defineConfig } from 'vite';

// base relativo: o build funciona em qualquer subpasta (GitHub Pages, itch.io, etc.)
export default defineConfig({
  base: './',
  build: { target: 'es2022', chunkSizeWarningLimit: 1500 },
  // `npm run build:docs` gera docs/ (GitHub Pages servindo a pasta /docs do branch)
});
