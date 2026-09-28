import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
  // `src/data/site.ts` reads `import.meta.env`, which Vite provides in test mode.
  define: { 'import.meta.env.SITE_URL': JSON.stringify(process.env.SITE_URL ?? 'https://cycladesgo.com') },
});
