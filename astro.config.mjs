import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://mostpomocy.pl',
  // Opcje przydatne dla GitHub Pages
  build: {
    format: 'directory'
  }
});
