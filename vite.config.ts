import { reactRouter } from '@react-router/dev/vite';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  server: {
    port: 5177,
  },
  optimizeDeps: {
    exclude: ['i18next-fs-backend'],
  },
  plugins: [reactRouter(), tsconfigPaths()],
});
