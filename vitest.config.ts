import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup/db-setup.ts'],
    isolate: true,
    poolOptions: {
      threads: {
        singleThread: true, // Avoid database connection issues
      },
    },
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './app'),
    },
  },
});
