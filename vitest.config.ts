import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/e2e/**',
      '**/.{idea,git,cache,output,temp}/**',
    ],
    setupFiles: './vitest.init.ts',
    typecheck: {
      tsconfig: './tsconfig.test.json',
    },
    globals: true,
  },
  resolve: {
    alias: {
      '@': '/src',
      utils: '/src/utils',
      ui: '/src/ui',
      background: '/src/background',
      consts: '/src/constant',
      assets: '/src/ui/assets',
    },
  },
});
